-- Ensure customers table has the correct structure
ALTER TABLE IF EXISTS public.customers
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Enable realtime for customers table
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
