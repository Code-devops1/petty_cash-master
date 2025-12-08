-- Script to fix RLS policies for users table

-- First, drop existing policies
DROP POLICY IF EXISTS "Users can view own user record" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Allow public insert" ON users;

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy that allows users to view their own record
CREATE POLICY "Users can view own user record" ON users 
FOR SELECT USING (auth.uid() = id);

-- Policy that allows admins to view all users
CREATE POLICY "Admins can view all users" ON users 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' IN ('ADMIN', 'admin', 'MANAGER', 'manager')
  )
);

-- Policy that allows admins to update all users
CREATE POLICY "Admins can update all users" ON users 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' IN ('ADMIN', 'admin')
  )
);

-- Allow public registration (handled by Supabase auth)
CREATE POLICY "Allow public insert" ON users 
FOR INSERT WITH CHECK (true);