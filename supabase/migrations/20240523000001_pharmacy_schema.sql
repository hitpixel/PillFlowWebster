-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webster_packs table
CREATE TABLE IF NOT EXISTS webster_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  pack_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  next_collection_date DATE,
  last_collection_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  stock_level INTEGER NOT NULL DEFAULT 0,
  total_stock INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pack_medications junction table
CREATE TABLE IF NOT EXISTS pack_medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pack_id UUID REFERENCES webster_packs(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  dosage TEXT,
  frequency TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pack_id UUID REFERENCES webster_packs(id) ON DELETE CASCADE,
  collection_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  collected_by TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_log table
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  related_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  related_pack_id UUID REFERENCES webster_packs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE webster_packs;
ALTER PUBLICATION supabase_realtime ADD TABLE medications;
ALTER PUBLICATION supabase_realtime ADD TABLE pack_medications;
ALTER PUBLICATION supabase_realtime ADD TABLE collections;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;

-- Insert sample data for medications
INSERT INTO medications (name, description, stock_level, total_stock)
VALUES 
  ('Atorvastatin', 'Cholesterol medication', 85, 100),
  ('Metformin', 'Diabetes medication', 62, 100),
  ('Lisinopril', 'Blood pressure medication', 28, 100),
  ('Levothyroxine', 'Thyroid medication', 74, 100),
  ('Amlodipine', 'Blood pressure medication', 15, 100);
