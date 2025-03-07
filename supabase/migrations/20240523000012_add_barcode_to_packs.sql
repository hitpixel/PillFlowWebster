-- Add barcode column to webster_packs table
ALTER TABLE webster_packs ADD COLUMN IF NOT EXISTS barcode TEXT;

-- Enable realtime for the table
alter publication supabase_realtime add table webster_packs;
