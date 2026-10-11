-- Rename the Korean tag 회고 to English, like the rest of the site's labels. Its
-- slug is already `retrospective`, so /tags/retrospective stays stable. Matching on
-- both slug and name makes this a no-op on a database without that tag.
UPDATE "Tag" SET "name" = 'Retrospective' WHERE "slug" = 'retrospective' AND "name" = '회고';
