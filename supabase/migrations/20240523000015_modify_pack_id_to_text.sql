-- First drop the foreign key constraint
ALTER TABLE collections DROP CONSTRAINT IF EXISTS collections_pack_id_fkey;

-- Change the pack_id column type from UUID to TEXT
ALTER TABLE collections ALTER COLUMN pack_id TYPE TEXT;

-- Add a comment to explain the change
COMMENT ON COLUMN collections.pack_id IS 'Free text field for pack ID or barcode';
