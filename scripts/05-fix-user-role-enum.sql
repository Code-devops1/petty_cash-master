-- Script to extend the user_role enum to support both uppercase and lowercase values
-- This approach carefully handles existing data

-- Step 1: Create a new enum with both cases
CREATE TYPE user_role_new AS ENUM ('admin', 'ADMIN', 'manager', 'MANAGER', 'technician', 'TECHNICIAN');

-- Step 2: Add a temporary column with the new enum type
ALTER TABLE users ADD COLUMN role_temp user_role_new;

-- Step 3: Copy data from the old role column to the temp column
UPDATE users SET role_temp = role::TEXT::user_role_new;

-- Step 4: Drop the old role column
ALTER TABLE users DROP COLUMN role;

-- Step 5: Rename the temp column to role
ALTER TABLE users RENAME COLUMN role_temp TO role;

-- Step 6: Drop the old enum
DROP TYPE user_role;

-- Step 7: Rename the new enum to the original name
ALTER TYPE user_role_new RENAME TO user_role;