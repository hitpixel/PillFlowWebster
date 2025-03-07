-- Add pack_type and pack_count columns to collections table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collections' AND column_name = 'pack_type') THEN
        ALTER TABLE collections ADD COLUMN pack_type TEXT DEFAULT 'blister';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collections' AND column_name = 'pack_count') THEN
        ALTER TABLE collections ADD COLUMN pack_count INTEGER DEFAULT 1;
    END IF;
END $$;

-- Enable realtime for collections table
alter publication supabase_realtime add table collections;
