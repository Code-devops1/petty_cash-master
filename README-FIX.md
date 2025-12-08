# Fix for Permission Denied Error on Users Table

## Problem
When accessing the dashboard, you might encounter these errors:
```
Server Error fetching user transactions: {code: '42501', details: null, hint: null, message: 'permission denied for table users'}
```
or
```
ERROR: 22P02: invalid input value for enum user_role: "ADMIN"
```

These errors happen because:

1. Row Level Security (RLS) policies were not properly defined for the `users` table
2. There's a mismatch between role values used in the application and those accepted by the database enum

## Root Cause Analysis

After thorough investigation, we found two related issues:

1. **Permission denied error**: Caused by missing or incorrectly configured RLS policies
2. **Invalid enum value error**: Caused by the application trying to use uppercase role values ("ADMIN", "MANAGER") while the database enum only accepts lowercase values ('admin', 'manager')

## Solution Approaches

### Approach 1: Extend the enum to support uppercase values (Recommended)
Run the script `scripts/05-fix-user-role-enum.sql` to update the user_role enum to accept both uppercase and lowercase values.

This approach:
- Updates the database enum to support both "admin" and "ADMIN"
- Maintains backward compatibility
- Requires no changes to application code
- Solves the root cause of the enum value error

### Approach 2: Fix the RLS policies only
Run the script `scripts/06-fix-rls-policies.sql` to fix only the RLS policies.

This approach:
- Fixes the permission denied error
- Works with existing lowercase enum values
- Requires ensuring all application code uses lowercase role values

## Implementation Steps

### For Approach 1 (Recommended):
```
psql -f scripts/05-fix-user-role-enum.sql
```

### For Approach 2:
```
psql -f scripts/06-fix-rls-policies.sql
```

## Updated Enum Values (Approach 1)

The user_role enum will accept:
- 'admin' and 'ADMIN' for administrator roles
- 'manager' and 'MANAGER' for manager roles
- 'technician' and 'TECHNICIAN' for technician roles

## RLS Policies (Approach 2)

Simple policies that work with existing lowercase enum values:
```sql
-- Admins and managers can view all users
role IN ('admin', 'manager')

-- Admins can update all users
role = 'admin'
```

## Additional Notes

- Make sure to backup your database before applying these changes
- Test the changes in a development environment first
- Monitor application logs after deployment to ensure the errors are resolved