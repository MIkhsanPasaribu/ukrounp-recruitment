-- Update password hash untuk pewawancara6 dengan hash yang fresh
-- Password: admin123
-- Hash baru: $2b$12$UuwjZpZAGc47gsUwFk99aO5jHQkdmbMNvX.OnKhHg0mSHSfTquOx6

-- 1. Tambahkan kolom yang mungkin belum ada
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interviewers' AND column_name = 'loginAttempts') THEN
        ALTER TABLE interviewers ADD COLUMN "loginAttempts" INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interviewers' AND column_name = 'lockedUntil') THEN
        ALTER TABLE interviewers ADD COLUMN "lockedUntil" TIMESTAMPTZ;
    END IF;
END $$;

-- 2. Update password untuk pewawancara6
UPDATE interviewers 
SET 
    "passwordHash" = '$2b$12$UuwjZpZAGc47gsUwFk99aO5jHQkdmbMNvX.OnKhHg0mSHSfTquOx6',
    "isActive" = true,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE username = 'pewawancara6';

-- 3. Update kolom security jika sudah ada
UPDATE interviewers 
SET 
    "loginAttempts" = 0,
    "lockedUntil" = NULL
WHERE username = 'pewawancara6' 
AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interviewers' AND column_name = 'loginAttempts');

-- 4. Verifikasi update
SELECT 
    username,
    email,
    "fullName",
    "isActive",
    SUBSTRING("passwordHash", 1, 20) || '...' as password_hash_preview,
    "updatedAt"
FROM interviewers
WHERE username = 'pewawancara6';

-- 5. Info untuk testing
SELECT 'Update completed!' as status;
SELECT 'Username: pewawancara6' as login_info_1;
SELECT 'Email: wawancara6@robotik.pkm.unp.ac.id' as login_info_2;  
SELECT 'Password: admin123' as login_info_3;
