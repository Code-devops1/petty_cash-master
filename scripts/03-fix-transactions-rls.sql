-- Script to fix RLS policies for transactions table

-- First, drop existing policies
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;

-- Recreate policies with correct definitions
-- Policy that allows users to view their own transactions
CREATE POLICY "Users can view own transactions" ON transactions 
FOR SELECT USING (auth.uid() = user_id);

-- Policy that allows users to insert their own transactions
CREATE POLICY "Users can insert own transactions" ON transactions 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy that allows admins/managers to view all transactions
CREATE POLICY "Admins can view all transactions" ON transactions 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' IN ('ADMIN', 'admin', 'MANAGER', 'manager')
  )
);

-- Policy that allows admins to update all transactions
CREATE POLICY "Admins can update all transactions" ON transactions 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' IN ('ADMIN', 'admin')
  )
);