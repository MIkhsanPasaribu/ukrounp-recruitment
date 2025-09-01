-- Debug query untuk cek struktur tabel interviewers dan data yang ada

-- 1. Cek struktur kolom tabel interviewers
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'interviewers'
ORDER BY column_name;

-- 2. Cek data pewawancara yang ada (dari screenshot)
SELECT *
FROM interviewers 
WHERE username LIKE 'pewawancara%'
ORDER BY username;

-- 3. Cek apakah ada field 'active' atau 'isActive'
SELECT 
  username,
  CASE 
    WHEN 'active' IN (SELECT column_name FROM information_schema.columns WHERE table_name = 'interviewers') 
    THEN active::text
    ELSE 'field not found'
  END as active_status
FROM interviewers 
WHERE username LIKE 'pewawancara%'
ORDER BY username;

-- 4. Cek semua field yang ada
SELECT username, *
FROM interviewers 
WHERE username = 'pewawancara1';

-- 5. Test query yang sama seperti di API
SELECT id, username, fullName, active
FROM interviewers 
WHERE username = 'pewawancara2';

-- 6. Jika field active tidak ada, coba alternatif
SELECT id, username, email, fullName
FROM interviewers 
WHERE username = 'pewawancara2';
