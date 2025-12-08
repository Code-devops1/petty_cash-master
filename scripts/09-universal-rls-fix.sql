-- Universal RLS fix script that works with any data types

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenditure_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_limits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own user record" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Allow public insert" ON users;

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can update all transactions" ON transactions;

DROP POLICY IF EXISTS "Users can view own disbursements" ON disbursements;
DROP POLICY IF EXISTS "Admins can view all disbursements" ON disbursements;
DROP POLICY IF EXISTS "Admins can manage disbursements" ON disbursements;

DROP POLICY IF EXISTS "Everyone can view expenditure categories" ON expenditure_categories;
DROP POLICY IF EXISTS "Admins can manage expenditure categories" ON expenditure_categories;

-- Create policies for users table using text comparison to avoid type issues
CREATE POLICY "Users can view own user record" ON users 
FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users" ON users 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' IN ('ADMIN', 'admin', 'MANAGER', 'manager')
  )
);

CREATE POLICY "Admins can update all users" ON users 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' IN ('ADMIN', 'admin')
  )
);

CREATE POLICY "Allow public insert" ON users 
FOR INSERT WITH CHECK (true);

-- Create policies for transactions table using text comparison
CREATE POLICY "Users can view own transactions" ON transactions 
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own transactions" ON transactions 
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all transactions" ON transactions 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' IN ('ADMIN', 'admin', 'MANAGER', 'manager')
  )
);

CREATE POLICY "Admins can update all transactions" ON transactions 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' IN ('ADMIN', 'admin')
  )
);

-- Create policies for disbursements table
CREATE POLICY "Users can view own disbursements" ON disbursements 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM transactions t
    WHERE t.id::text = disbursements.transaction_id::text
    AND t.user_id::text = auth.uid()::text
  )
);

CREATE POLICY "Admins can view all disbursements" ON disbursements 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' IN ('ADMIN', 'admin', 'MANAGER', 'manager')
  )
);

CREATE POLICY "Admins can manage disbursements" ON disbursements 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' IN ('ADMIN', 'admin')
  )
);

-- Create policies for expenditure_categories table
CREATE POLICY "Everyone can view expenditure categories" ON expenditure_categories 
FOR SELECT USING (true);

CREATE POLICY "Admins can manage expenditure categories" ON expenditure_categories 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' IN ('ADMIN', 'admin')
  )
);