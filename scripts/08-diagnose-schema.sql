-- Diagnostic script to check column types
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('users', 'transactions', 'disbursements') 
AND column_name IN ('id', 'user_id')
ORDER BY table_name, column_name;