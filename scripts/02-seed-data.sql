-- Insert default expenditure categories with realistic allocations
INSERT INTO expenditure_categories (name, description, allocation_percentage, monthly_limit) VALUES
('Fuel & Transportation', 'Vehicle fuel, public transport, taxi fares', 35.00, 15000.00),
('Meals & Refreshments', 'Field meals, client meetings, refreshments', 25.00, 8000.00),
('Materials & Supplies', 'Tools, equipment, office supplies', 20.00, 10000.00),
('Communication', 'Airtime, internet, communication costs', 10.00, 3000.00),
('Emergency Expenses', 'Urgent unforeseen costs', 10.00, 5000.00);

-- Insert sample admin user (password should be set through auth)
INSERT INTO users (email, full_name, phone_number, role, employee_id, department) VALUES
('admin@company.com', 'System Administrator', '+254700000000', 'admin', 'EMP001', 'IT'),
('manager@company.com', 'Field Manager', '+254700000001', 'manager', 'EMP002', 'Operations'),
('tech1@company.com', 'Field Technician 1', '+254700000002', 'technician', 'EMP003', 'Field Operations'),
('tech2@company.com', 'Field Technician 2', '+254700000003', 'technician', 'EMP004', 'Field Operations');

-- Create initial budget limits for current month
INSERT INTO budget_limits (category_id, user_id, monthly_limit, month_year)
SELECT 
    c.id as category_id,
    u.id as user_id,
    CASE 
        WHEN u.role = 'technician' THEN c.monthly_limit * 0.3
        WHEN u.role = 'manager' THEN c.monthly_limit * 0.7
        ELSE c.monthly_limit
    END as monthly_limit,
    DATE_TRUNC('month', CURRENT_DATE) as month_year
FROM expenditure_categories c
CROSS JOIN users u
WHERE u.role IN ('technician', 'manager');
