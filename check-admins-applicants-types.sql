-- CEK STRUKTUR TABEL ADMINS DAN APPLICANTS
-- Jalankan di Supabase SQL Editor

-- === CEK TIPE DATA ADMINS.ID ===
SELECT 
    'admins' as table_name,
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'admins' AND column_name = 'id';

-- === CEK TIPE DATA APPLICANTS.ID ===
SELECT 
    'applicants' as table_name,
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'applicants' AND column_name = 'id';

-- === CEK SAMPLE DATA ADMINS ===
SELECT 
    id,
    username,
    pg_typeof(id) as id_type,
    LENGTH(id::text) as id_length
FROM admins 
LIMIT 5;

-- === CEK SAMPLE DATA APPLICANTS ===
SELECT 
    id,
    nim,
    "fullName",
    pg_typeof(id) as id_type,
    LENGTH(id::text) as id_length
FROM applicants 
WHERE nim IS NOT NULL
LIMIT 5;

-- === DIAGNOSIS ===
SELECT '=== DIAGNOSIS TYPE MISMATCH ===' as report;

SELECT 
    CASE 
        WHEN (SELECT data_type FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'id') = 'uuid'
        THEN '✅ admins.id is UUID'
        ELSE '❌ admins.id is ' || (SELECT data_type FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'id')
    END as admins_status;

SELECT 
    CASE 
        WHEN (SELECT data_type FROM information_schema.columns WHERE table_name = 'applicants' AND column_name = 'id') = 'uuid'
        THEN '✅ applicants.id is UUID'
        ELSE '❌ applicants.id is ' || (SELECT data_type FROM information_schema.columns WHERE table_name = 'applicants' AND column_name = 'id')
    END as applicants_status;
