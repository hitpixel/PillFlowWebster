-- Add policy to restrict access to webster_packs based on customer's user_id
DROP POLICY IF EXISTS "Users can only see their own webster packs" ON webster_packs;
CREATE POLICY "Users can only see their own webster packs" 
ON webster_packs
FOR ALL
USING (
  customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
  )
);

-- Enable RLS on webster_packs table
ALTER TABLE webster_packs ENABLE ROW LEVEL SECURITY;
