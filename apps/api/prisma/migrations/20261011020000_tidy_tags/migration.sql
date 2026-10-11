-- One-off tidy after the posts were re-tagged by hand (2026-10-11).

-- 1. The tag `spring` was created in lowercase; typing "Spring" reuses it as is, so
--    fix its display name. The slug is unchanged. No-op where the tag is absent.
UPDATE "Tag" SET "name" = 'Spring' WHERE "slug" = 'spring' AND "name" = 'spring';

-- 2. Remove tags nothing refers to any more: no post (drafts and soft-deleted posts
--    count as references) and no collection rule. These were single-post labels
--    that the re-tagging replaced with broader ones.
DELETE FROM "Tag" t
WHERE NOT EXISTS (SELECT 1 FROM "_PostTags" pt WHERE pt."B" = t."id")
  AND NOT EXISTS (SELECT 1 FROM "_CollectionTags" ct WHERE ct."B" = t."id");
