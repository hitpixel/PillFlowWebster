-- Add pack_type and pack_count columns to collections table
ALTER TABLE collections ADD COLUMN IF NOT EXISTS pack_type TEXT;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS pack_count INTEGER DEFAULT 1;

-- Enable realtime for the collections table
alter publication supabase_realtime add table collections;
