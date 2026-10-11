-- Author-defined order for collections. Existing collections keep their current
-- (creation) order: positions 0, 1, 2, … by createdAt.
ALTER TABLE "Collection" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

UPDATE "Collection" c
SET "position" = o."rn"
FROM (
  SELECT "id", row_number() OVER (ORDER BY "createdAt", "id") - 1 AS "rn"
  FROM "Collection"
) o
WHERE o."id" = c."id";
