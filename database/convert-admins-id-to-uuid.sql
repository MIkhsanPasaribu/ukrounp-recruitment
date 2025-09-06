-- SCRIPT SIMPLE UNTUK CONVERT ADMINS.ID KE UUID
-- Jalankan SEBELUM database-interview-fresh-start-FIXED.sql
-- ATAU setelah error foreign key constraint

-- === STEP 1: CEK CURRENT STATE ===
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('admins', 'applicants') AND column_name = 'id'
ORDER BY table_name;

-- === STEP 2: CONVERT ADMINS.ID KE UUID ===
-- BACKUP: Pastikan Anda sudah backup database!

-- Drop SEMUA foreign key constraints yang mereferensi admins.id
-- Cari semua foreign key yang mereferensi admins table
SELECT 
    tc.table_name, 
    tc.constraint_name,
    kcu.column_name,
    'ALTER TABLE ' || tc.table_name || ' DROP CONSTRAINT IF EXISTS ' || tc.constraint_name || ';' as drop_command
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND ccu.table_name = 'admins' 
AND ccu.column_name = 'id';

-- Drop foreign key constraints yang ditemukan:
-- admin_tokens (jika ada)
ALTER TABLE admin_tokens DROP CONSTRAINT IF EXISTS admin_tokens_admin_id_fkey;

-- audit_logs
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_adminId_fkey;

-- interview tables (jika sudah ada)
ALTER TABLE interview_attendance DROP CONSTRAINT IF EXISTS fk_interview_attendance_admin;
ALTER TABLE interviewer_assignments DROP CONSTRAINT IF EXISTS fk_interviewer_assignments_admin;

-- Convert admins.id ke UUID
-- ASUMSI: admins.id sudah dalam format UUID string
ALTER TABLE admins ALTER COLUMN id TYPE UUID USING id::UUID;

-- Recreate foreign key constraints (hanya untuk tabel yang ada)
-- admin_tokens (jika tabel ada)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_tokens') THEN
        ALTER TABLE admin_tokens 
        ADD CONSTRAINT admin_tokens_admin_id_fkey 
        FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ admin_tokens foreign key recreated';
    ELSE
        RAISE NOTICE 'ℹ️ admin_tokens table tidak ada - skip';
    END IF;
END $$;

-- audit_logs foreign key (perlu convert audit_logs.adminId ke UUID juga)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        -- Convert audit_logs.adminId ke UUID juga
        ALTER TABLE audit_logs ALTER COLUMN "adminId" TYPE UUID USING "adminId"::UUID;
        
        ALTER TABLE audit_logs 
        ADD CONSTRAINT audit_logs_adminId_fkey 
        FOREIGN KEY ("adminId") REFERENCES admins(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ audit_logs foreign key recreated';
    ELSE
        RAISE NOTICE 'ℹ️ audit_logs table tidak ada - skip';
    END IF;
END $$;

-- === STEP 3: VERIFIKASI ===
SELECT 
    'admins.id type setelah convert: ' || data_type as result
FROM information_schema.columns 
WHERE table_name = 'admins' AND column_name = 'id';

-- Cek sample data
SELECT 
    id,
    username,
    pg_typeof(id) as id_type
FROM admins 
LIMIT 3;

-- === SEKARANG BISA JALANKAN FOREIGN KEY CONSTRAINTS ===
SELECT '✅ admins.id sudah UUID - sekarang bisa tambah foreign key constraints!' as message;
