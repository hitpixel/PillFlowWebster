-- Add avatar_url column to customers table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'avatar_url') THEN
        ALTER TABLE customers ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

alter publication supabase_realtime add table customers;
