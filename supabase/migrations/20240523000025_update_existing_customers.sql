-- Update existing customers to associate with their creator
-- This is a one-time migration to ensure existing data has user_id set

-- For each collection, find the collected_by user and associate the customer with that user
UPDATE customers
SET user_id = auth.users.id
FROM collections
JOIN auth.users ON auth.users.email = collections.collected_by
WHERE customers.id = collections.customer_id
AND customers.user_id IS NULL;

-- For any remaining customers without a user_id, assign them to the first admin user
UPDATE customers
SET user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
WHERE user_id IS NULL;
