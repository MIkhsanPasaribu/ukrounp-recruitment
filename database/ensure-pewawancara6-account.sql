-- PASTIKAN SEMUA AKUN PEWAWANCARA 1-7 ADA DAN BENAR

-- 1. Cek semua akun pewawancara yang ada
SELECT 
    id,
    username,
    fullName,
    active,
    createdAt
FROM interviewers
WHERE username LIKE 'pewawancara%'
ORDER BY username;

-- 2. Buat/Update akun pewawancara 1-7
-- Password: "123456" (hash bcrypt: $2b$10$N9qo8uLOickgx2ZMRZoMye7sQ.z0YnOMpyowU5Yaa6rOLKhJKKnMu)
INSERT INTO interviewers (username, fullName, password, active, createdAt, updatedAt) VALUES
  ('pewawancara1', 'Pewawancara 1', '$2b$10$N9qo8uLOickgx2ZMRZoMye7sQ.z0YnOMpyowU5Yaa6rOLKhJKKnMu', true, NOW(), NOW()),
  ('pewawancara2', 'Pewawancara 2', '$2b$10$N9qo8uLOickgx2ZMRZoMye7sQ.z0YnOMpyowU5Yaa6rOLKhJKKnMu', true, NOW(), NOW()),
  ('pewawancara3', 'Pewawancara 3', '$2b$10$N9qo8uLOickgx2ZMRZoMye7sQ.z0YnOMpyowU5Yaa6rOLKhJKKnMu', true, NOW(), NOW()),
  ('pewawancara4', 'Pewawancara 4', '$2b$10$N9qo8uLOickgx2ZMRZoMye7sQ.z0YnOMpyowU5Yaa6rOLKhJKKnMu', true, NOW(), NOW()),
  ('pewawancara5', 'Pewawancara 5', '$2b$10$N9qo8uLOickgx2ZMRZoMye7sQ.z0YnOMpyowU5Yaa6rOLKhJKKnMu', true, NOW(), NOW()),
  ('pewawancara6', 'Pewawancara 6', '$2b$10$N9qo8uLOickgx2ZMRZoMye7sQ.z0YnOMpyowU5Yaa6rOLKhJKKnMu', true, NOW(), NOW()),
  ('pewawancara7', 'Pewawancara 7', '$2b$10$N9qo8uLOickgx2ZMRZoMye7sQ.z0YnOMpyowU5Yaa6rOLKhJKKnMu', true, NOW(), NOW())
ON CONFLICT (username) DO UPDATE SET 
  active = true,
  fullName = EXCLUDED.fullName,
  password = EXCLUDED.password,
  updatedAt = NOW();

-- 3. Verifikasi semua akun berhasil dibuat
SELECT 
    username, 
    fullName, 
    active,
    LENGTH(password) as password_length,
    SUBSTRING(password, 1, 10) as password_prefix,
    createdAt
FROM interviewers 
WHERE username LIKE 'pewawancara%'
ORDER BY username;
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
