-- SCRIPT UNTUK TROUBLESHOOT DAN FIX APPLICANTS TABLE
-- Jalankan ini SEBELUM menjalankan database-interview-fresh-start-FIXED.sql

-- === STEP 1: CEK STRUKTUR TABEL APPLICANTS ===
SELECT 
    table_name, 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'applicants' 
ORDER BY ordinal_position;

-- === STEP 2: CEK APAKAH ADA DATA DI APPLICANTS ===
SELECT 
    COUNT(*) as total_applicants,
    COUNT(CASE WHEN nim IS NOT NULL THEN 1 END) as applicants_with_nim,
    COUNT(CASE WHEN status = 'INTERVIEW' THEN 1 END) as interview_ready
FROM applicants;

-- === STEP 3: CEK TIPE DATA ID KOLOM ===
-- Cek apakah applicants.id adalah UUID atau TEXT/VARCHAR
SELECT 
    pg_typeof(id) as id_type,
    LENGTH(id::text) as id_length,
    id
FROM applicants 
LIMIT 5;

-- === STEP 4: CONVERT APPLICANTS.ID KE UUID JIKA PERLU ===
-- HANYA JALANKAN INI JIKA applicants.id BUKAN UUID!
-- BACKUP DULU SEBELUM MENJALANKAN!

-- Jika applicants.id adalah TEXT/VARCHAR dan formatnya UUID-like:
-- ALTER TABLE applicants ALTER COLUMN id TYPE UUID USING id::UUID;
 
-- Jika applicants.id adalah TEXT/VARCHAR tapi bukan format UUID:
-- Maka kita perlu strategi berbeda - buat kolom baru atau convert data

-- === STEP 5: CEK FOREIGN KEY YANG ADA ===
-- Cek foreign key constraints yang mereferensi applicants
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (ccu.table_name = 'applicants' OR tc.table_name = 'applicants')
ORDER BY tc.table_name;

-- === STEP 6: SAMPLE DATA APPLICANTS ===
-- Lihat sample data untuk memahami format
SELECT 
    id,
    nim,
    "fullName",
    status,
    pg_typeof(id) as id_type
FROM applicants 
WHERE nim IS NOT NULL
LIMIT 10;

-- === DIAGNOSIS REPORT ===
SELECT '=== DIAGNOSIS APPLICANTS TABLE ===' as report;

-- Informasi tabel
SELECT 
    'Table exists: ' || CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'applicants') THEN 'YES' ELSE 'NO' END as table_status;

-- Informasi ID column
SELECT 
    'ID column type: ' || data_type as id_info
FROM information_schema.columns 
WHERE table_name = 'applicants' AND column_name = 'id';

-- Informasi data
SELECT 
    'Total records: ' || COUNT(*)::text as data_info
FROM applicants;

-- Rekomendasi
SELECT 
    CASE 
        WHEN NOT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'applicants') 
        THEN '❌ ERROR: Tabel applicants tidak ada!'
        
        WHEN (SELECT data_type FROM information_schema.columns WHERE table_name = 'applicants' AND column_name = 'id') != 'uuid'
        THEN '⚠️  WARNING: applicants.id bukan UUID type - perlu diconvert!'
        
        ELSE '✅ OK: applicants.id sudah UUID type'
    END as recommendation;
