-- Add avatar_url column to customers table if it doesn't exist
ALTER TABLE IF EXISTS public.customers ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Make sure the customers table is in the realtime publication
alter publication supabase_realtime add table customers;
