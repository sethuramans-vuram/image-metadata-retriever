-- SQLite
CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename text NOT NULL,
    properties text NOT NULL,
    batch_id text NOT NULL,
    batch_name text NOT NULL,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM images;