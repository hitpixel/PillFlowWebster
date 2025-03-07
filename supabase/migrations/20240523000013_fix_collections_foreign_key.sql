-- Drop the existing foreign key constraint
ALTER TABLE collections DROP CONSTRAINT IF EXISTS collections_pack_id_fkey;

-- Add the constraint back with ON DELETE SET NULL
ALTER TABLE collections ADD CONSTRAINT collections_pack_id_fkey
  FOREIGN KEY (pack_id)
  REFERENCES webster_packs(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- Make the pack_id column nullable
ALTER TABLE collections ALTER COLUMN pack_id DROP NOT NULL;

-- Enable realtime for collections table
alter publication supabase_realtime add table collections;
