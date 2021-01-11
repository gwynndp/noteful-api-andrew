BEGIN;

INSERT INTO folders (id, folder_name)
VALUES
    (1, 'Important'),
    (2, 'Super'),
    (3, 'Spangley')
;

INSERT INTO notes (note_name, content, folder_id)
VALUES
    ('Dogs', 'Lorum ipsum....', 1),
    ('Birds', 'Lorum ipsum....', 1),
    ('Bears', 'Lorum ipsum....', 1),
    ('Lions', 'Lorum ipsum....', 1),
    ('Bats', 'Lorum ipsum....', 1),
    ('Cats', 'Lorum ipsum....', 2),
    ('Pigs', 'Lorum ipsum....', 2),
    ('Horses', 'Lorum ipsum....', 2),
    ('Elephants', 'Lorum ipsum....', 2),
    ('Turtles', 'Lorum ipsum....', 2),
    ('Zebras', 'Lorum ipsum....', 2),
    ('Tigers', 'Lorum ipsum....', 3),
    ('Wolves', 'Lorum ipsum....', 3),
    ('Monkeys', 'Lorum ipsum....', 3)
;

COMMIT;
