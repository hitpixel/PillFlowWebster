-- Add policy to restrict access to collections based on customer's user_id
DROP POLICY IF EXISTS "Users can only see their own collections" ON collections;
CREATE POLICY "Users can only see their own collections" 
ON collections
FOR ALL
USING (
  customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
  )
);

-- Enable RLS on collections table
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
