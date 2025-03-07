-- Add customer_id column to collections table
ALTER TABLE collections ADD COLUMN customer_id UUID REFERENCES customers(id);

-- Create a function to update collections with customer_id from webster_packs
CREATE OR REPLACE FUNCTION update_collection_customer_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the customer_id from the webster_pack
  IF NEW.pack_id IS NOT NULL THEN
    UPDATE collections
    SET customer_id = (SELECT customer_id FROM webster_packs WHERE id = NEW.pack_id)
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update customer_id when a collection is created or updated
DROP TRIGGER IF EXISTS update_collection_customer_id_trigger ON collections;
CREATE TRIGGER update_collection_customer_id_trigger
AFTER INSERT OR UPDATE OF pack_id ON collections
FOR EACH ROW
EXECUTE FUNCTION update_collection_customer_id();

-- Update existing collections with customer_id from webster_packs
UPDATE collections c
SET customer_id = wp.customer_id
FROM webster_packs wp
WHERE c.pack_id = wp.id AND c.customer_id IS NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_collections_customer_id ON collections(customer_id);
