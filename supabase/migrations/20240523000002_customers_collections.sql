-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  status TEXT DEFAULT 'active',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webster_packs table
CREATE TABLE IF NOT EXISTS webster_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pack_name TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_collection_date TIMESTAMP WITH TIME ZONE,
  next_collection_date TIMESTAMP WITH TIME ZONE
);

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pack_id UUID REFERENCES webster_packs(id),
  collection_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  collected_by TEXT,
  status TEXT DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for all tables
alter publication supabase_realtime add table customers;
alter publication supabase_realtime add table webster_packs;
alter publication supabase_realtime add table collections;

-- Create RLS policies
DROP POLICY IF EXISTS "Customers are viewable by authenticated users" ON customers;
CREATE POLICY "Customers are viewable by authenticated users"
  ON customers FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Customers are editable by authenticated users" ON customers;
CREATE POLICY "Customers are editable by authenticated users"
  ON customers FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Customers are insertable by authenticated users" ON customers;
CREATE POLICY "Customers are insertable by authenticated users"
  ON customers FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Webster packs are viewable by authenticated users" ON webster_packs;
CREATE POLICY "Webster packs are viewable by authenticated users"
  ON webster_packs FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Webster packs are editable by authenticated users" ON webster_packs;
CREATE POLICY "Webster packs are editable by authenticated users"
  ON webster_packs FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Webster packs are insertable by authenticated users" ON webster_packs;
CREATE POLICY "Webster packs are insertable by authenticated users"
  ON webster_packs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Collections are viewable by authenticated users" ON collections;
CREATE POLICY "Collections are viewable by authenticated users"
  ON collections FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Collections are editable by authenticated users" ON collections;
CREATE POLICY "Collections are editable by authenticated users"
  ON collections FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Collections are insertable by authenticated users" ON collections;
CREATE POLICY "Collections are insertable by authenticated users"
  ON collections FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE webster_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
