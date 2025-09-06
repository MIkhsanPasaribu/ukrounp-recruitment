-- Cek akun pewawancara yang ada
SELECT 
    id,
    username,
    email,
    "fullName",
    role,
    "isActive",
    "createdAt"
FROM interviewers
WHERE username = 'pewawancara6' OR email = 'wawancara6@robotik.pkm.unp.ac.id'
ORDER BY "createdAt";

-- Cek semua akun pewawancara yang aktif
SELECT 
    id,
    username,
    email,
    "fullName",
    role,
    "isActive",
    "createdAt"
FROM interviewers
WHERE "isActive" = true
ORDER BY "createdAt";

-- Cek structure table interviewers
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'interviewers' 
ORDER BY ordinal_position;
