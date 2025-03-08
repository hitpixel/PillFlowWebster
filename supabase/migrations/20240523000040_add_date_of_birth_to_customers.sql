-- Add date_of_birth column to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS date_of_birth DATE;
