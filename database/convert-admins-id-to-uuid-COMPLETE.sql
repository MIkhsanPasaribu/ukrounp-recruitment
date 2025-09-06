-- SCRIPT LENGKAP UNTUK CONVERT ADMINS.ID DARI TEXT KE UUID
-- Menangani SEMUA foreign key yang mereferensi admins.id

-- === STEP 1: CEK SITUASI SAAT INI ===
SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns 
WHERE (table_name = 'admins' AND column_name = 'id')
   OR (table_name = 'audit_logs' AND column_name = 'adminId')
   OR (table_name = 'admin_tokens' AND column_name = 'admin_id')
ORDER BY table_name, column_name;

-- === STEP 2: IDENTIFIKASI SEMUA FOREIGN KEY YANG MEREFERENSI ADMINS.ID ===
SELECT 
    tc.table_name, 
    tc.constraint_name,
    kcu.column_name,
    'DROP: ALTER TABLE ' || tc.table_name || ' DROP CONSTRAINT IF EXISTS ' || tc.constraint_name || ';' as drop_command
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND ccu.table_name = 'admins' 
AND ccu.column_name = 'id'
ORDER BY tc.table_name;

-- === STEP 3: DROP SEMUA FOREIGN KEY CONSTRAINTS ===
-- Jalankan semua DROP commands dari step 2

-- Yang umum ditemukan:
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_adminId_fkey;
ALTER TABLE admin_tokens DROP CONSTRAINT IF EXISTS admin_tokens_admin_id_fkey;
ALTER TABLE session_tokens DROP CONSTRAINT IF EXISTS session_tokens_adminId_fkey;

-- Interview tables (jika sudah ada)
ALTER TABLE interview_attendance DROP CONSTRAINT IF EXISTS fk_interview_attendance_admin;
ALTER TABLE interviewer_assignments DROP CONSTRAINT IF EXISTS fk_interviewer_assignments_admin;

-- === STEP 4: BACKUP DATA ADMINS (OPSIONAL) ===
-- CREATE TABLE admins_backup AS SELECT * FROM admins;

-- === STEP 5: CONVERT ADMINS.ID KE UUID ===
-- PENTING: Pastikan data admins.id sudah dalam format UUID (36 karakter dengan dash)

-- Cek format data dulu
SELECT 
    id,
    LENGTH(id) as id_length,
    id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' as is_uuid_format
FROM admins 
LIMIT 5;

-- Convert admins.id ke UUID
ALTER TABLE admins ALTER COLUMN id TYPE UUID USING id::UUID;

-- === STEP 6: CONVERT FOREIGN KEY COLUMNS KE UUID ===
-- Convert semua kolom yang mereferensi admins.id

-- audit_logs.adminId
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'adminId') THEN
            ALTER TABLE audit_logs ALTER COLUMN "adminId" TYPE UUID USING "adminId"::UUID;
            RAISE NOTICE '✅ audit_logs.adminId converted to UUID';
        END IF;
    END IF;
END $$;

-- admin_tokens.admin_id (jika ada)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_tokens') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_tokens' AND column_name = 'admin_id') THEN
            ALTER TABLE admin_tokens ALTER COLUMN admin_id TYPE UUID USING admin_id::UUID;
            RAISE NOTICE '✅ admin_tokens.admin_id converted to UUID';
        END IF;
    END IF;
END $$;

-- session_tokens.adminId (jika ada)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'session_tokens') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_tokens' AND column_name = 'adminId') THEN
            ALTER TABLE session_tokens ALTER COLUMN "adminId" TYPE UUID USING "adminId"::UUID;
            RAISE NOTICE '✅ session_tokens.adminId converted to UUID';
        END IF;
    END IF;
END $$;

-- === STEP 7: RECREATE FOREIGN KEY CONSTRAINTS ===
-- Buat ulang foreign key constraints

-- audit_logs
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        ALTER TABLE audit_logs 
        ADD CONSTRAINT audit_logs_adminId_fkey 
        FOREIGN KEY ("adminId") REFERENCES admins(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ audit_logs foreign key recreated';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error recreating audit_logs foreign key: %', SQLERRM;
END $$;

-- admin_tokens (jika ada)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_tokens') THEN
        ALTER TABLE admin_tokens 
        ADD CONSTRAINT admin_tokens_admin_id_fkey 
        FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ admin_tokens foreign key recreated';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error recreating admin_tokens foreign key: %', SQLERRM;
END $$;

-- session_tokens (jika ada)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'session_tokens') THEN
        ALTER TABLE session_tokens 
        ADD CONSTRAINT session_tokens_adminId_fkey 
        FOREIGN KEY ("adminId") REFERENCES admins(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ session_tokens foreign key recreated';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error recreating session_tokens foreign key: %', SQLERRM;
END $$;

-- === STEP 8: VERIFIKASI HASIL ===
SELECT '=== FINAL VERIFICATION ===' as section;

-- Cek tipe data final
SELECT 
    table_name,
    column_name,
    data_type,
    table_name || '.' || column_name || ' = ' || data_type as final_status
FROM information_schema.columns 
WHERE (table_name = 'admins' AND column_name = 'id')
   OR (table_name = 'audit_logs' AND column_name = 'adminId')
   OR (table_name = 'admin_tokens' AND column_name = 'admin_id')
   OR (table_name = 'session_tokens' AND column_name = 'adminId')
ORDER BY table_name, column_name;

-- Cek foreign keys
SELECT 
    tc.table_name, 
    tc.constraint_name,
    kcu.column_name,
    'FK: ' || tc.table_name || '.' || kcu.column_name || ' -> admins.id' as foreign_key_status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND ccu.table_name = 'admins' 
AND ccu.column_name = 'id'
ORDER BY tc.table_name;

-- Sample data
SELECT 
    id,
    username,
    pg_typeof(id) as id_type
FROM admins 
LIMIT 3;

SELECT '🎉 ADMINS.ID CONVERSION TO UUID COMPLETED!' as result;
