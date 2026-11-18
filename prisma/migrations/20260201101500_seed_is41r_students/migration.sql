-- Seed the five students of group IS41R (USARB, Balti).
-- Re-running the migration is safe: existing emails are left untouched.
INSERT INTO "students" ("first_name", "last_name", "email", "group_name", "updated_at")
VALUES
    ('Ilia', 'Sushvaliuk', 'ilia.sushvaliuk@usarb.md', 'IS41R', CURRENT_TIMESTAMP),
    ('Dmitrii', 'Moskalchuk', 'dmitrii.moskalchuk@usarb.md', 'IS41R', CURRENT_TIMESTAMP),
    ('Nikita', 'Basiuk', 'nikita.basiuk@usarb.md', 'IS41R', CURRENT_TIMESTAMP),
    ('Egor', 'Dmitriev', 'egor.dmitriev@usarb.md', 'IS41R', CURRENT_TIMESTAMP),
    ('Denis', 'Floresco', 'denis.floresco@usarb.md', 'IS41R', CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO NOTHING;
