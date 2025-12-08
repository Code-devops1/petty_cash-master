-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM ('admin', 'ADMIN', 'manager', 'MANAGER', 'technician', 'TECHNICIAN');
CREATE TYPE transaction_status AS ENUM ('pending', 'approved', 'rejected', 'disbursed', 'completed');
CREATE TYPE transaction_type AS ENUM ('fuel', 'transport', 'meals', 'materials', 'emergency', 'other');
CREATE TYPE disbursement_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Users table with role-based access
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role user_role DEFAULT 'technician',
    employee_id VARCHAR(50) UNIQUE,
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    two_factor_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenditure categories with predefined allocations
CREATE TABLE expenditure_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    allocation_percentage DECIMAL(5,2) DEFAULT 0,
    monthly_limit DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table for all petty cash requests
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES expenditure_categories(id),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    receipt_url VARCHAR(500),
    location VARCHAR(255),
    transaction_type transaction_type NOT NULL,
    status transaction_status DEFAULT 'pending',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- M-Pesa disbursements tracking
CREATE TABLE disbursements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    mpesa_transaction_id VARCHAR(100),
    phone_number VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status disbursement_status DEFAULT 'pending',
    mpesa_response JSONB,
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Audit trail for all system activities
CREATE TABLE audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget tracking and limits
CREATE TABLE budget_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES expenditure_categories(id),
    user_id UUID REFERENCES users(id),
    monthly_limit DECIMAL(10,2) NOT NULL,
    current_spent DECIMAL(10,2) DEFAULT 0,
    month_year DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, user_id, month_year)
);

-- Notifications system
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    related_transaction_id UUID REFERENCES transactions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_disbursements_transaction_id ON disbursements(transaction_id);
CREATE INDEX idx_disbursements_status ON disbursements(status);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_budget_limits_month_year ON budget_limits(month_year);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenditure_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Users can view their own record
CREATE POLICY "Users can view own record" ON users 
FOR SELECT USING (auth.uid() = id);

-- Users can update their own record
CREATE POLICY "Users can update own record" ON users 
FOR UPDATE USING (auth.uid() = id);

-- Admins and managers can view all users
CREATE POLICY "Admins and managers can view all users" ON users 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() 
    AND (u.role = 'admin' OR u.role = 'ADMIN' OR u.role = 'manager' OR u.role = 'MANAGER')
  )
);

-- Admins can update all users
CREATE POLICY "Admins can update all users" ON users 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() 
    AND (u.role = 'admin' OR u.role = 'ADMIN')
  )
);

-- Allow public registration (handled by Supabase auth)
CREATE POLICY "Allow public insert" ON users 
FOR INSERT WITH CHECK (true);

-- RLS Policies for transactions table
-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON transactions 
FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions" ON transactions 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins and managers can view all transactions
CREATE POLICY "Admins and managers can view all transactions" ON transactions 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() 
    AND (u.role = 'admin' OR u.role = 'ADMIN' OR u.role = 'manager' OR u.role = 'MANAGER')
  )
);

-- Admins can update all transactions
CREATE POLICY "Admins can update all transactions" ON transactions 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() 
    AND (u.role = 'admin' OR u.role = 'ADMIN')
  )
);

-- RLS Policies for expenditure_categories table
-- Everyone can view expenditure categories
CREATE POLICY "Everyone can view expenditure categories" ON expenditure_categories 
FOR SELECT USING (true);

-- Admins can manage expenditure categories
CREATE POLICY "Admins can manage expenditure categories" ON expenditure_categories 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() 
    AND u.role = 'admin'
  )
);

-- RLS Policies for disbursements table
-- Users can view their own disbursements through transactions
CREATE POLICY "Users can view own disbursements" ON disbursements 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM transactions t
    WHERE t.id = disbursements.transaction_id
    AND t.user_id = auth.uid()
  )
);

-- Admins and managers can view all disbursements
CREATE POLICY "Admins and managers can view all disbursements" ON disbursements 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() 
    AND (u.role = 'admin' OR u.role = 'ADMIN' OR u.role = 'manager' OR u.role = 'MANAGER')
  )
);

-- Admins can manage disbursements
CREATE POLICY "Admins can manage disbursements" ON disbursements 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() 
    AND (u.role = 'admin' OR u.role = 'ADMIN')
  )
);

-- RLS Policies for audit_logs table
-- Only admins can view and manage audit logs
CREATE POLICY "Only admins can manage audit logs" ON audit_logs 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() 
    AND (u.role = 'admin' OR u.role = 'ADMIN')
  )
);

-- RLS Policies for budget_limits table
-- Users can view their own budget limits
CREATE POLICY "Users can view own budget limits" ON budget_limits 
FOR SELECT USING (
  auth.uid() = user_id
);

-- Admins and managers can view all budget limits
CREATE POLICY "Admins and managers can view all budget limits" ON budget_limits 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() 
    AND (u.role = 'admin' OR u.role = 'ADMIN' OR u.role = 'manager' OR u.role = 'MANAGER')
  )
);

-- Admins can manage budget limits
CREATE POLICY "Admins can manage budget limits" ON budget_limits 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() 
    AND (u.role = 'admin' OR u.role = 'ADMIN')
  )
);

-- RLS Policies for notifications table
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications 
FOR SELECT USING (
  auth.uid() = user_id
);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications" ON notifications 
FOR UPDATE USING (
  auth.uid() = user_id
);

-- System can insert notifications
CREATE POLICY "System can insert notifications" ON notifications 
FOR INSERT WITH CHECK (true);