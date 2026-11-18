-- Correct the transliteration of three surnames from the IS41R roster.
-- Kept as a separate migration so installations that already applied the
-- original seed migration keep a valid migration history.
UPDATE "students"
SET "last_name" = 'Shushvaliuk', "email" = 'ilia.shushvaliuk@usarb.md'
WHERE "email" = 'ilia.sushvaliuk@usarb.md';

UPDATE "students"
SET "last_name" = 'Moscalciuc', "email" = 'dmitrii.moscalciuc@usarb.md'
WHERE "email" = 'dmitrii.moskalchuk@usarb.md';

UPDATE "students"
SET "last_name" = 'Basiuc', "email" = 'nikita.basiuc@usarb.md'
WHERE "email" = 'nikita.basiuk@usarb.md';
