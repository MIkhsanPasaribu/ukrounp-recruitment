-- Test semua akun pewawancara yang ada
SELECT 
    username,
    email,
    "fullName",
    "isActive",
    "loginAttempts",
    "lockedUntil",
    CASE 
        WHEN "passwordHash" IS NOT NULL THEN 'Has password'
        ELSE 'No password'
    END as password_status,
    "createdAt",
    "updatedAt"
FROM interviewers
WHERE "isActive" = true
ORDER BY username;

-- Info untuk testing login
SELECT '=== LOGIN TESTING INFO ===' as info;
SELECT 'Try these accounts:' as instruction;
SELECT 'Username: pewawancara1, Password: admin123' as account_1;
SELECT 'Username: pewawancara2, Password: admin123' as account_2;
SELECT 'Username: pewawancara3, Password: admin123' as account_3;
SELECT 'Username: pewawancara4, Password: admin123' as account_4;
SELECT 'Username: pewawancara5, Password: admin123' as account_5;
SELECT 'Username: pewawancara6, Password: admin123' as account_6;
SELECT 'Username: pewawancara7, Password: admin123' as account_7;
