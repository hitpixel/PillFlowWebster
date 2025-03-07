-- Add user_id column to customers table if it doesn't exist already
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'user_id') THEN
    ALTER TABLE customers ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Create policy to restrict access to customers based on user_id
DROP POLICY IF EXISTS "Users can only see their own customers" ON customers;
CREATE POLICY "Users can only see their own customers" 
ON customers
FOR ALL
USING (auth.uid() = user_id);

-- Enable RLS on customers table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
