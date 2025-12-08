-- Script to sync auth.users to public.users table

-- Insert users from auth.users to public.users
-- This will populate the public.users table with data from the authentication system
INSERT INTO public.users (id, email, full_name, phone_number, role, employee_id, department)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
    raw_user_meta_data->>'phone_number' as phone_number,
    COALESCE(raw_user_meta_data->>'role', 'technician')::user_role as role,
    raw_user_meta_data->>'employee_id' as employee_id,
    raw_user_meta_data->>'department' as department
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone_number = EXCLUDED.phone_number,
    role = EXCLUDED.role,
    employee_id = EXCLUDED.employee_id,
    department = EXCLUDED.department,
    updated_at = NOW();