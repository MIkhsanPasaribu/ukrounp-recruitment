-- PASTIKAN AKUN PEWAWANCARA6 ADA DAN BENAR

-- 1. Cek akun pewawancara6 saat ini
SELECT 
    id,
    username,
    email,
    "fullName",
    role,
    "isActive",
    "loginAttempts",
    "lockedUntil",
    "createdAt",
    CASE 
        WHEN "passwordHash" IS NOT NULL THEN 'Has password'
        ELSE 'No password'
    END as password_status
FROM interviewers
WHERE username = 'pewawancara6';

-- 2. Jika tidak ada, buat akun pewawancara6
INSERT INTO interviewers (
    id,
    username,
    email,
    "fullName",
    role,
    "passwordHash",
    "isActive",
    "loginAttempts",
    "lockedUntil",
    "createdAt",
    "updatedAt"
)
SELECT 
    gen_random_uuid(),
    'pewawancara6',
    'wawancara6@robotik.pkm.unp.ac.id',
    'Pewawancara 6',
    'INTERVIEWER',
    '$2b$12$Bzj1Pridu9F34ZSo9cJlLe2OLE1JSF9X2sY.3i9psEh1waoz7kx5i',
    true,
    0,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM interviewers WHERE username = 'pewawancara6'
);

-- 3. Update password dan status jika sudah ada
UPDATE interviewers 
SET 
    "passwordHash" = '$2b$12$Bzj1Pridu9F34ZSo9cJlLe2OLE1JSF9X2sY.3i9psEh1waoz7kx5i',
    email = 'wawancara6@robotik.pkm.unp.ac.id',
    "fullName" = 'Pewawancara 6',
    role = 'INTERVIEWER',
    "isActive" = true,
    "loginAttempts" = 0,
    "lockedUntil" = NULL,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE username = 'pewawancara6';

-- 4. Verifikasi hasil
SELECT 
    id,
    username,
    email,
    "fullName",
    role,
    "isActive",
    "loginAttempts",
    "lockedUntil",
    "createdAt",
    "updatedAt"
FROM interviewers
WHERE username = 'pewawancara6';

-- 5. Test info
SELECT 'Akun pewawancara6 siap!' as status;
SELECT 'Username: pewawancara6' as username_info;
SELECT 'Password: admin123' as password_info;
SELECT 'Email: wawancara6@robotik.pkm.unp.ac.id' as email_info;
