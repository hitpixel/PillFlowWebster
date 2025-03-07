-- Change pack_id column in collections table from UUID to TEXT
ALTER TABLE collections ALTER COLUMN pack_id TYPE TEXT;
