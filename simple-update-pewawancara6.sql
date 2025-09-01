-- Script sederhana untuk update password pewawancara6

-- 1. Cek struktur tabel interviewers
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'interviewers' 
ORDER BY ordinal_position;

-- 2. Update password pewawancara6 (hanya kolom yang pasti ada)
UPDATE interviewers 
SET 
    "passwordHash" = '$2b$12$UuwjZpZAGc47gsUwFk99aO5jHQkdmbMNvX.OnKhHg0mSHSfTquOx6',
    "isActive" = true
WHERE username = 'pewawancara6';

-- 3. Verifikasi update
SELECT 
    username,
    email,
    "fullName",
    "isActive",
    "createdAt",
    "updatedAt"
FROM interviewers
WHERE username = 'pewawancara6';

-- 4. Test info
SELECT 'Password updated for pewawancara6!' as result;
SELECT 'Login with: pewawancara6 / admin123' as instruction;
