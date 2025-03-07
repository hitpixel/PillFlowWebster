-- Add status column to customers table if it doesn't exist
ALTER TABLE IF EXISTS public.customers
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
