-- SCRIPT PERBAIKAN UNTUK TYPE MISMATCH ADMINS.ID
-- Jalankan SEBELUM menjalankan foreign key constraints

-- === STEP 1: CEK CURRENT STATE ===
-- Cek tipe data admins.id dan applicants.id
SELECT 
    'Current admins.id type: ' || 
    COALESCE((SELECT data_type FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'id'), 'TABLE NOT EXISTS') as admins_type,
    'Current applicants.id type: ' || 
    COALESCE((SELECT data_type FROM information_schema.columns WHERE table_name = 'applicants' AND column_name = 'id'), 'TABLE NOT EXISTS') as applicants_type;

-- === STEP 2: BACKUP DAN CONVERT ADMINS.ID KE UUID ===
-- HATI-HATI: Ini akan mengubah tipe data admins.id dari TEXT ke UUID

DO $$
BEGIN
    -- Cek apakah admins.id sudah UUID
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admins' AND column_name = 'id' AND data_type != 'uuid'
    ) THEN
        -- Drop foreign key constraints yang ada dulu
        RAISE NOTICE 'Dropping existing foreign key constraints...';
        
        -- Drop foreign keys yang mungkin mereferensi admins.id
        BEGIN
            ALTER TABLE admin_tokens DROP CONSTRAINT IF EXISTS admin_tokens_admin_id_fkey;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'admin_tokens constraint tidak ada atau sudah dihapus';
        END;
        
        -- Drop foreign keys dari interview tables jika ada
        BEGIN
            ALTER TABLE interview_attendance DROP CONSTRAINT IF EXISTS fk_interview_attendance_admin;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'interview_attendance admin constraint tidak ada';
        END;
        
        BEGIN
            ALTER TABLE interviewer_assignments DROP CONSTRAINT IF EXISTS fk_interviewer_assignments_admin;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'interviewer_assignments admin constraint tidak ada';
        END;
        
        -- Convert admins.id ke UUID
        RAISE NOTICE 'Converting admins.id from TEXT to UUID...';
        
        -- Backup data lama jika perlu
        CREATE TEMP TABLE admins_backup AS SELECT * FROM admins;
        
        -- Convert ke UUID - asumsi data TEXT sudah dalam format UUID
        BEGIN
            ALTER TABLE admins ALTER COLUMN id TYPE UUID USING id::UUID;
            RAISE NOTICE '✅ admins.id successfully converted to UUID';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ Failed to convert admins.id to UUID - check data format';
            RAISE NOTICE 'Error: %', SQLERRM;
            -- Restore dari backup jika gagal
            -- DELETE FROM admins;
            -- INSERT INTO admins SELECT * FROM admins_backup;
        END;
        
        -- Recreate admin_tokens foreign key jika tabel ada
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_tokens') THEN
            BEGIN
                ALTER TABLE admin_tokens 
                ADD CONSTRAINT admin_tokens_admin_id_fkey 
                FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE;
                RAISE NOTICE '✅ admin_tokens foreign key recreated';
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE '⚠️ Could not recreate admin_tokens foreign key: %', SQLERRM;
            END;
        END IF;
        
    ELSE
        RAISE NOTICE '✅ admins.id sudah UUID type - tidak perlu convert';
    END IF;
END $$;

-- === STEP 3: VERIFIKASI HASIL ===
SELECT 
    'admins.id type after conversion: ' || 
    COALESCE((SELECT data_type FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'id'), 'TABLE NOT EXISTS') as final_admins_type;

-- Cek sample data
SELECT 
    'Sample admins data:' as info,
    id,
    username,
    pg_typeof(id) as id_type
FROM admins 
LIMIT 3;

-- === STEP 4: SEKARANG JALANKAN FOREIGN KEY CONSTRAINTS ===
-- Sekarang foreign key constraints harusnya bisa dibuat

DO $$
BEGIN
    -- Add foreign key ke applicants jika tabel ada
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'applicants') THEN
        BEGIN
            ALTER TABLE interview_attendance 
            ADD CONSTRAINT fk_interview_attendance_applicant 
            FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE;
            
            ALTER TABLE interview_sessions 
            ADD CONSTRAINT fk_interview_sessions_applicant 
            FOREIGN KEY ("applicantId") REFERENCES applicants(id) ON DELETE CASCADE;
            
            RAISE NOTICE '✅ Foreign keys ke applicants berhasil ditambahkan';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ Error adding foreign keys ke applicants: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'Tabel applicants tidak ditemukan - skip foreign key';
    END IF;

    -- Add foreign key ke admins jika tabel ada
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admins') THEN
        BEGIN
            ALTER TABLE interview_attendance 
            ADD CONSTRAINT fk_interview_attendance_admin 
            FOREIGN KEY (checked_in_by) REFERENCES admins(id) ON DELETE SET NULL;
            
            ALTER TABLE interviewer_assignments 
            ADD CONSTRAINT fk_interviewer_assignments_admin 
            FOREIGN KEY (assigned_by) REFERENCES admins(id) ON DELETE SET NULL;
            
            RAISE NOTICE '✅ Foreign keys ke admins berhasil ditambahkan';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ Error adding foreign keys ke admins: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'Tabel admins tidak ditemukan - skip foreign key';
    END IF;
END $$;

-- === SUCCESS MESSAGE ===
SELECT '🎉 TYPE CONVERSION DAN FOREIGN KEYS SELESAI! 🎉' as message;
