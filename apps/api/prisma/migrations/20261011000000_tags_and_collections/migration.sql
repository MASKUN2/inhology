-- Tags become the only grouping of posts, and collections become the curated
-- views over them:
--   * every category and every series turns into a tag on the posts that had it;
--   * every series also becomes a collection (same title and description) whose
--     single rule is that tag, so its page keeps listing the same posts;
--   * the Category/Series tables and the Post columns pointing at them are dropped.
--
-- Not carried over: category descriptions, and a post's position within its series
-- (`seriesOrder`). Posts under a tag or in a collection are ordered by publication
-- date.

-- 0. Collections: a titled view over the posts; its rules are tags (implicit M:N,
--    "A" = Collection id, "B" = Tag id).
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "_CollectionTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CollectionTags_AB_pkey" PRIMARY KEY ("A","B")
);
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");
CREATE INDEX "_CollectionTags_B_index" ON "_CollectionTags"("B");
ALTER TABLE "_CollectionTags" ADD CONSTRAINT "_CollectionTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CollectionTags" ADD CONSTRAINT "_CollectionTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 1. One label per category and per series. The slug mirrors the API's slugify():
--    lowercase, whitespace -> '-', ASCII punctuation removed (non-ASCII letters such
--    as Hangul are kept), repeated/edge dashes trimmed.
CREATE TEMP TABLE "_tag_label" AS
SELECT src."kind", src."srcId", src."name",
       trim(both '-' from regexp_replace(
         regexp_replace(
           regexp_replace(lower(trim(src."name")), '\s+', '-', 'g'),
           '[!-,./:-@\[-`{-~]+', '', 'g'),
         '-+', '-', 'g')) AS "slug"
FROM (
  SELECT 'category' AS "kind", "id" AS "srcId", "name" AS "name" FROM "Category"
  UNION ALL
  SELECT 'series', "id", "title" FROM "Series"
) src;

-- 2. Create the tags that do not exist yet. An existing tag with the same slug or
--    the same name (case-insensitive) is reused, so a label never becomes two tags.
INSERT INTO "Tag" ("id", "slug", "name", "createdAt")
SELECT 'tag_' || md5(l."slug"), l."slug", l."name", CURRENT_TIMESTAMP
FROM (SELECT DISTINCT ON ("slug") "slug", "name" FROM "_tag_label" WHERE "slug" <> '' ORDER BY "slug", "kind") l
WHERE NOT EXISTS (
  SELECT 1 FROM "Tag" t WHERE t."slug" = l."slug" OR lower(t."name") = lower(l."name")
);

-- 3. Tag every post (soft-deleted ones included) with its category and its series.
--    In the implicit join table, "A" is the Post id and "B" is the Tag id.
INSERT INTO "_PostTags" ("A", "B")
SELECT p."id", t."id"
FROM "Post" p
JOIN "_tag_label" l
  ON (l."kind" = 'category' AND l."srcId" = p."categoryId")
  OR (l."kind" = 'series' AND l."srcId" = p."seriesId")
JOIN LATERAL (
  SELECT t."id" FROM "Tag" t
  WHERE t."slug" = l."slug" OR lower(t."name") = lower(l."name")
  ORDER BY (t."slug" = l."slug") DESC, t."createdAt"
  LIMIT 1
) t ON true
ON CONFLICT DO NOTHING;

-- 4. Every series becomes a collection, keeping the series' creation time (the
--    order collections are listed in), with one rule: its tag.
INSERT INTO "Collection" ("id", "slug", "title", "description", "createdAt", "updatedAt")
SELECT 'col_' || md5(x."slug"), x."slug", x."title", x."description", x."createdAt", CURRENT_TIMESTAMP
FROM (
  SELECT DISTINCT ON (l."slug") l."slug", s."title", s."description", s."createdAt"
  FROM "_tag_label" l JOIN "Series" s ON s."id" = l."srcId"
  WHERE l."kind" = 'series' AND l."slug" <> ''
  ORDER BY l."slug", s."createdAt"
) x;

INSERT INTO "_CollectionTags" ("A", "B")
SELECT c."id", t."id"
FROM "Collection" c
JOIN LATERAL (
  SELECT t."id" FROM "Tag" t
  WHERE t."slug" = c."slug" OR lower(t."name") = lower(c."title")
  ORDER BY (t."slug" = c."slug") DESC, t."createdAt"
  LIMIT 1
) t ON true
ON CONFLICT DO NOTHING;

DROP TABLE "_tag_label";

-- 5. Drop the old model.
ALTER TABLE "Post" DROP CONSTRAINT "Post_categoryId_fkey";
ALTER TABLE "Post" DROP CONSTRAINT "Post_seriesId_fkey";
DROP INDEX "Post_categoryId_idx";
DROP INDEX "Post_seriesId_idx";
ALTER TABLE "Post" DROP COLUMN "categoryId",
                   DROP COLUMN "seriesId",
                   DROP COLUMN "seriesOrder";
DROP TABLE "Category";
DROP TABLE "Series";
