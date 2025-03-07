-- Ensure the avatar_url column exists in the customers table
ALTER TABLE IF EXISTS public.customers
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Enable realtime for the customers table
alter publication supabase_realtime add table customers;