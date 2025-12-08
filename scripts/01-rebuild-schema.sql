-- Drop existing tables to rebuild properly
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS petty_cash_ledger CASCADE;

-- Create proper schema matching the specification
CREATE TABLE categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT UNIQUE NOT NULL,
  percentage DECIMAL(5,2) NOT NULL, -- Historical usage percentage
  color TEXT NOT NULL, -- UI color code
  icon TEXT NOT NULL, -- Icon identifier
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE subcategories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  standard_amount INTEGER, -- Amount in KES cents (nullable for variable amounts)
  multiplier BOOLEAN DEFAULT false, -- For group trips, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, category_id)
);

CREATE TABLE routes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  standard_fare INTEGER NOT NULL, -- Amount in KES cents
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_location, to_location)
);

CREATE TABLE transactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  amount INTEGER NOT NULL, -- Amount in KES cents
  quantity INTEGER DEFAULT 1,
  total_amount INTEGER NOT NULL, -- Calculated total
  reason TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED')),
  mpesa_receipt_id TEXT,
  mpesa_request_id TEXT,
  
  -- Foreign keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id),
  subcategory_id TEXT REFERENCES subcategories(id),
  route_id TEXT REFERENCES routes(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE petty_cash_ledger (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  opening_balance INTEGER NOT NULL, -- Amount in KES cents
  current_balance INTEGER NOT NULL, -- Amount in KES cents
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the data-driven expense categories from specification
INSERT INTO categories (name, percentage, color, icon) VALUES
('FARE', 64.0, '#3B82F6', 'Bus'),
('FOOD', 17.0, '#10B981', 'UtensilsCrossed'),
('EQUIPMENT', 12.0, '#F59E0B', 'Wrench'),
('SUPPLIES', 6.0, '#8B5CF6', 'Package'),
('MISCELLANEOUS', 1.0, '#6B7280', 'MoreHorizontal');

-- Insert subcategories with standard amounts (in KES cents)
INSERT INTO subcategories (name, category_id, standard_amount, multiplier) VALUES
-- FARE subcategories
('ROUTE_BASED', (SELECT id FROM categories WHERE name = 'FARE'), NULL, false),
('GROUP_TRIP', (SELECT id FROM categories WHERE name = 'FARE'), NULL, true),
('EMERGENCY_TRANSPORT', (SELECT id FROM categories WHERE name = 'FARE'), 20000, false), -- 200 KES

-- FOOD subcategories  
('BREAKFAST', (SELECT id FROM categories WHERE name = 'FOOD'), 5000, false), -- 50 KES
('LUNCH', (SELECT id FROM categories WHERE name = 'FOOD'), 10000, false), -- 100 KES
('DINNER', (SELECT id FROM categories WHERE name = 'FOOD'), 15000, false), -- 150 KES
('SNACKS', (SELECT id FROM categories WHERE name = 'FOOD'), 3000, false), -- 30 KES

-- EQUIPMENT subcategories
('CABLE_TAPE', (SELECT id FROM categories WHERE name = 'EQUIPMENT'), 3000, false), -- 30 KES
('NETWORK_TESTER', (SELECT id FROM categories WHERE name = 'EQUIPMENT'), 15000, false), -- 150 KES
('SCREWDRIVER_SET', (SELECT id FROM categories WHERE name = 'EQUIPMENT'), 20000, false), -- 200 KES

-- SUPPLIES subcategories
('CLEANING_SUPPLIES', (SELECT id FROM categories WHERE name = 'SUPPLIES'), 2000, false), -- 20 KES
('SAFETY_GEAR', (SELECT id FROM categories WHERE name = 'SUPPLIES'), 5000, false), -- 50 KES
('PLASTIC_BAGS', (SELECT id FROM categories WHERE name = 'SUPPLIES'), 1000, false), -- 10 KES

-- MISCELLANEOUS subcategories
('EMERGENCY_CASH', (SELECT id FROM categories WHERE name = 'MISCELLANEOUS'), NULL, false),
('DONATIONS', (SELECT id FROM categories WHERE name = 'MISCELLANEOUS'), NULL, false),
('UNEXPECTED', (SELECT id FROM categories WHERE name = 'MISCELLANEOUS'), NULL, false);

-- Insert sample routes with standard fares
INSERT INTO routes (from_location, to_location, standard_fare) VALUES
('Nairobi CBD', 'Westlands', 5000), -- 50 KES
('Westlands', 'Karen', 15000), -- 150 KES
('CBD', 'Airport', 25000), -- 250 KES
('Thika', 'Nairobi', 20000), -- 200 KES
('Mombasa', 'Diani', 30000); -- 300 KES

-- Initialize petty cash ledger
INSERT INTO petty_cash_ledger (opening_balance, current_balance) VALUES (500000, 500000); -- 5000 KES

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE petty_cash_ledger ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Subcategories are viewable by everyone" ON subcategories FOR SELECT USING (true);
CREATE POLICY "Routes are viewable by everyone" ON routes FOR SELECT USING (true);
CREATE POLICY "Ledger is viewable by authenticated users" ON petty_cash_ledger FOR SELECT USING (auth.role() = 'authenticated');

-- Transaction policies
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id::uuid);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);
CREATE POLICY "Admins can view all transactions" ON transactions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' IN ('ADMIN', 'MANAGER')
  )
);

-- Create indexes for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_subcategories_category_id ON subcategories(category_id);
