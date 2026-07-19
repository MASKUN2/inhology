-- Rename the default categories from Korean to English (display name + description).
-- Slugs are unchanged, so URLs (/category/<slug>) stay stable. Idempotent by slug;
-- affects 0 rows on a fresh DB (the seed then creates them with English names).
UPDATE "Category" SET "name" = 'Development', "description" = 'Development and tech'    WHERE "slug" = 'dev';
UPDATE "Category" SET "name" = 'Daily',       "description" = 'Day-to-day notes'        WHERE "slug" = 'life';
UPDATE "Category" SET "name" = 'Essay',       "description" = 'Thoughts and reflections' WHERE "slug" = 'essay';
