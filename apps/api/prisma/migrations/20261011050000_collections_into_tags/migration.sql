-- Collections are folded into tags: a tag can carry a description and a place
-- in the home page's list, which is all a collection added.
ALTER TABLE "Tag" ADD COLUMN "description" TEXT,
                  ADD COLUMN "homePosition" INTEGER;

-- Tag tidy-up. "Development" covered nearly every post, and "Retrospective"
-- and "Essay" only repeated "Annual Chronicle" and "Work Recap".
-- Their rows in "_PostTags" and "_CollectionTags" go with them (ON DELETE
-- CASCADE). Done first, so a rule naming one of them does not count below.
DELETE FROM "Tag" WHERE "slug" IN ('development', 'retrospective', 'essay');

-- A collection with exactly one rule becomes that tag's description and home
-- place. Collections with no rule ("All") or several rules have no tag to map
-- to and are dropped; the site lists every post at /posts instead.
UPDATE "Tag" t
SET "description" = c."description",
    "homePosition" = c."position"
FROM "Collection" c
JOIN "_CollectionTags" ct ON ct."A" = c."id"
WHERE ct."B" = t."id"
  AND (SELECT count(*) FROM "_CollectionTags" x WHERE x."A" = c."id") = 1;

DROP TABLE "_CollectionTags";
DROP TABLE "Collection";
