-- Script untuk update password hash semua interviewer

-- 1. Cek interviewer yang ada
SELECT username, email, "isActive", "createdAt", "updatedAt"
FROM interviewers
WHERE username IN ('pewawancara1', 'pewawancara2', 'pewawancara3', 'pewawancara4', 'pewawancara5', 'pewawancara6', 'pewawancara7')
ORDER BY username;

-- 2. Update password hash untuk semua interviewer (password: admin123)
-- Hash yang sudah verified: $2b$12$UuwjZpZAGc47gsUwFk99aO5jHQkdmbMNvX.OnKhHg0mSHSfTquOx6

UPDATE interviewers 
SET 
    "passwordHash" = '$2b$12$UuwjZpZAGc47gsUwFk99aO5jHQkdmbMNvX.OnKhHg0mSHSfTquOx6',
    "isActive" = true,
    "updatedAt" = NOW()
WHERE username IN ('pewawancara1', 'pewawancara2', 'pewawancara3', 'pewawancara4', 'pewawancara5', 'pewawancara7');

-- 3. Verifikasi update
SELECT 
    username,
    email,
    "fullName",
    "isActive",
    "updatedAt",
    CASE 
        WHEN "passwordHash" = '$2b$12$UuwjZpZAGc47gsUwFk99aO5jHQkdmbMNvX.OnKhHg0mSHSfTquOx6' THEN 'CORRECT'
        ELSE 'DIFFERENT'
    END as password_status
FROM interviewers
WHERE username IN ('pewawancara1', 'pewawancara2', 'pewawancara3', 'pewawancara4', 'pewawancara5', 'pewawancara6', 'pewawancara7')
ORDER BY username;

-- 4. Success message
SELECT 'Password hash updated for all interviewers!' as result;
SELECT 'All interviewers can now login with password: admin123' as instruction;
