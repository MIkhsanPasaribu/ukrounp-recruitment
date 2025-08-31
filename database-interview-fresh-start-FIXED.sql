-- HAPUS SEMUA TABEL INTERVIEW DAN BUAT ULANG DARI AWAL - VERSI FIXED
-- Jalankan di Supabase SQL Editor
-- PENTING: Pastikan applicants.id adalah UUID type

-- === STEP 0: VERIFIKASI TIPE DATA APPLICANTS ===
-- Cek tipe data kolom id di tabel applicants
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'applicants' AND column_name = 'id';

-- Jika applicants.id bukan UUID, jalankan ini dulu:
-- ALTER TABLE applicants ALTER COLUMN id TYPE UUID USING id::UUID;

-- === STEP 1: HAPUS SEMUA TABEL INTERVIEW ===
-- Drop dalam urutan yang benar untuk menghindari foreign key constraint error

DROP TABLE IF EXISTS interview_responses CASCADE;
DROP TABLE IF EXISTS interview_sessions CASCADE;
DROP TABLE IF EXISTS interviewer_assignments CASCADE;
DROP TABLE IF EXISTS interview_attendance CASCADE;
DROP TABLE IF EXISTS interview_questions CASCADE;
DROP TABLE IF EXISTS interviewer_tokens CASCADE;
DROP TABLE IF EXISTS interviewers CASCADE;

-- Hapus enum types jika ada
DROP TYPE IF EXISTS interviewer_role CASCADE;

-- === STEP 2: BUAT ENUM TYPES ===
CREATE TYPE interviewer_role AS ENUM ('INTERVIEWER', 'HEAD_INTERVIEWER');

-- === STEP 3: BUAT TABEL INTERVIEWERS ===
CREATE TABLE interviewers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    role interviewer_role DEFAULT 'INTERVIEWER',
    "isActive" BOOLEAN DEFAULT true,
    "lastLoginAt" TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- === STEP 4: BUAT TABEL INTERVIEWER_TOKENS ===
CREATE TABLE interviewer_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "interviewerId" UUID NOT NULL REFERENCES interviewers(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "isRevoked" BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- === STEP 5: BUAT TABEL INTERVIEW_QUESTIONS ===
CREATE TABLE interview_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "questionNumber" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    category TEXT,
    "isActive" BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("questionNumber")
);

-- === STEP 6: BUAT TABEL INTERVIEW_ATTENDANCE ===
-- PENTING: Pastikan applicants.id adalah UUID!
CREATE TABLE interview_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nim TEXT NOT NULL UNIQUE,
    applicant_id UUID NOT NULL,
    checked_in_at TIMESTAMPTZ DEFAULT NOW(),
    checked_in_by UUID,
    status TEXT DEFAULT 'PRESENT' CHECK (status IN ('PRESENT', 'ABSENT', 'LATE')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- === STEP 7: BUAT TABEL INTERVIEWER_ASSIGNMENTS ===
CREATE TABLE interviewer_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    attendance_id UUID NOT NULL REFERENCES interview_attendance(id) ON DELETE CASCADE,
    interviewer_id UUID NOT NULL REFERENCES interviewers(id) ON DELETE CASCADE,
    assigned_by UUID,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    scheduled_at TIMESTAMPTZ,
    status TEXT DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(attendance_id)
);

-- === STEP 8: BUAT TABEL INTERVIEW_SESSIONS ===
CREATE TABLE interview_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "applicantId" UUID NOT NULL,
    "interviewerId" UUID NOT NULL REFERENCES interviewers(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES interviewer_assignments(id) ON DELETE SET NULL,
    "interviewDate" TIMESTAMPTZ DEFAULT NOW(),
    location TEXT,
    status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    notes TEXT,
    "totalScore" INTEGER DEFAULT 0,
    recommendation TEXT CHECK (recommendation IN ('SANGAT_DIREKOMENDASIKAN', 'DIREKOMENDASIKAN', 'CUKUP', 'TIDAK_DIREKOMENDASIKAN')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- === STEP 9: BUAT TABEL INTERVIEW_RESPONSES ===
CREATE TABLE interview_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "sessionId" UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    "questionId" UUID NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
    response TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 10),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("sessionId", "questionId")
);

-- === STEP 10: BUAT INDEXES ===
CREATE INDEX idx_interviewer_tokens_interviewer ON interviewer_tokens("interviewerId");
CREATE INDEX idx_interviewer_tokens_token ON interviewer_tokens(token);
CREATE INDEX idx_interviewer_tokens_expires ON interviewer_tokens("expiresAt");

CREATE INDEX idx_interview_attendance_nim ON interview_attendance(nim);
CREATE INDEX idx_interview_attendance_applicant ON interview_attendance(applicant_id);

CREATE INDEX idx_interviewer_assignments_attendance ON interviewer_assignments(attendance_id);
CREATE INDEX idx_interviewer_assignments_interviewer ON interviewer_assignments(interviewer_id);

CREATE INDEX idx_interview_sessions_applicant ON interview_sessions("applicantId");
CREATE INDEX idx_interview_sessions_interviewer ON interview_sessions("interviewerId");
CREATE INDEX idx_interview_sessions_assignment ON interview_sessions(assignment_id);

CREATE INDEX idx_interview_responses_session ON interview_responses("sessionId");
CREATE INDEX idx_interview_responses_question ON interview_responses("questionId");

-- === STEP 11: BUAT TRIGGERS ===
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_interviewers_updated_at 
    BEFORE UPDATE ON interviewers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_attendance_updated_at 
    BEFORE UPDATE ON interview_attendance 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviewer_assignments_updated_at 
    BEFORE UPDATE ON interviewer_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_sessions_updated_at 
    BEFORE UPDATE ON interview_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_responses_updated_at 
    BEFORE UPDATE ON interview_responses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- === STEP 12: TAMBAHKAN FOREIGN KEY CONSTRAINTS SETELAH SEMUA TABEL DIBUAT ===
-- Menambahkan foreign key ke applicants dan admins setelah memastikan tabel ada
-- PENTING: admins.id dan applicants.id harus UUID type!

DO $$
DECLARE
    admins_id_type TEXT;
    applicants_id_type TEXT;
BEGIN
    -- Cek tipe data admins.id
    SELECT data_type INTO admins_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'admins' AND column_name = 'id';
    
    -- Cek tipe data applicants.id
    SELECT data_type INTO applicants_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'applicants' AND column_name = 'id';
    
    RAISE NOTICE 'admins.id type: %, applicants.id type: %', admins_id_type, applicants_id_type;
    
    -- Add foreign key ke applicants jika tabel ada dan tipe UUID
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'applicants') THEN
        IF applicants_id_type = 'uuid' THEN
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
            RAISE NOTICE '⚠️ applicants.id type is % (bukan uuid) - skip foreign key', applicants_id_type;
        END IF;
    ELSE
        RAISE NOTICE 'Tabel applicants tidak ditemukan - skip foreign key';
    END IF;

    -- Add foreign key ke admins jika tabel ada dan tipe UUID
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admins') THEN
        IF admins_id_type = 'uuid' THEN
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
            RAISE NOTICE '⚠️ admins.id type is % (bukan uuid) - skip foreign key', admins_id_type;
            RAISE NOTICE '💡 Jalankan script fix-admins-uuid-and-foreign-keys.sql untuk convert admins.id ke UUID';
        END IF;
    ELSE
        RAISE NOTICE 'Tabel admins tidak ditemukan - skip foreign key';
    END IF;
END $$;

-- === STEP 13: INSERT DATA AWAL ===

-- Insert 7 interviewers
INSERT INTO interviewers (username, email, "passwordHash", "fullName", role) VALUES
('pewawancara1', 'wawancara1@robobotik.pkm.unp.ac.id', '$2b$10$rKZ1vxqX6vZ8N9HXQDKEWe7LKJ3XbUKhH4QGS1VKhS7W3VBcxJ4Sa', 'Dr. Ahmad Sukamto', 'INTERVIEWER'),
('pewawancara2', 'wawancara2@robobotik.pkm.unp.ac.id', '$2b$10$rKZ1vxqX6vZ8N9HXQDKEWe7LKJ3XbUKhH4QGS1VKhS7W3VBcxJ4Sa', 'Prof. Dr. Siti Aminah', 'INTERVIEWER'),
('pewawancara3', 'wawancara3@robobotik.pkm.unp.ac.id', '$2b$10$rKZ1vxqX6vZ8N9HXQDKEWe7LKJ3XbUKhH4QGS1VKhH4QGS1VKhS7W3VBcxJ4Sa', 'Dr. Budi Hermawan', 'INTERVIEWER'),
('pewawancara4', 'wawancara4@robobotik.pkm.unp.ac.id', '$2b$10$rKZ1vxqX6vZ8N9HXQDKEWe7LKJ3XbUKhH4QGS1VKhS7W3VBcxJ4Sa', 'Dr. Rina Kartika', 'INTERVIEWER'),
('pewawancara5', 'wawancara5@robobotik.pkm.unp.ac.id', '$2b$10$rKZ1vxqX6vZ8N9HXQDKEWe7LKJ3XbUKhH4QGS1VKhS7W3VBcxJ4Sa', 'Dr. Agus Priyanto', 'INTERVIEWER'),
('pewawancara6', 'wawancara6@robobotik.pkm.unp.ac.id', '$2b$10$rKZ1vxqX6vZ8N9HXQDKEWe7LKJ3XbUKhH4QGS1VKhS7W3VBcxJ4Sa', 'Dr. Maya Sari', 'INTERVIEWER'),
('pewawancara7', 'wawancara7@robobotik.pkm.unp.ac.id', '$2b$10$rKZ1vxqX6vZ8N9HXQDKEWe7LKJ3XbUKhH4QGS1VKhS7W3VBcxJ4Sa', 'Dr. Indra Wijaya', 'INTERVIEWER');

-- Insert 11 pertanyaan interview
INSERT INTO interview_questions ("questionNumber", "questionText", category) VALUES
(1, 'Ceritakan tentang diri Anda dan latar belakang pendidikan Anda.', 'Personal'),
(2, 'Mengapa Anda tertarik bergabung dengan organisasi ini?', 'Motivasi'),
(3, 'Apa kekuatan dan kelemahan Anda?', 'Personal'),
(4, 'Bagaimana Anda mengatasi konflik dalam tim?', 'Interpersonal'),
(5, 'Ceritakan pengalaman kepemimpinan Anda.', 'Leadership'),
(6, 'Bagaimana Anda mengatur waktu dan prioritas dalam aktivitas sehari-hari?', 'Management'),
(7, 'Apa rencana karir Anda ke depan?', 'Future Planning'),
(8, 'Bagaimana Anda beradaptasi dengan perubahan dan tantangan baru?', 'Adaptability'),
(9, 'Apa kontribusi yang bisa Anda berikan untuk organisasi ini?', 'Contribution'),
(10, 'Bagaimana Anda menangani tekanan dan deadline kerja?', 'Stress Management'),
(11, 'Apakah ada pertanyaan dari Anda untuk kami?', 'Closing');

-- === STEP 14: UPDATE APPLICANTS KE STATUS INTERVIEW (OPSIONAL) ===
-- Update beberapa applicants ke status INTERVIEW untuk testing
-- Hanya jika tabel applicants ada
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'applicants') THEN
        UPDATE applicants 
        SET status = 'INTERVIEW' 
        WHERE status IN ('SEDANG_DITINJAU', 'DAFTAR_PENDEK')
        AND nim IS NOT NULL
        AND id IN (SELECT id FROM applicants WHERE nim IS NOT NULL LIMIT 5);
        
        RAISE NOTICE 'Status applicants berhasil diupdate ke INTERVIEW';
    END IF;
END $$;

-- === STEP 15: VERIFIKASI ===
SELECT 
    'interviewers' as table_name,
    COUNT(*) as record_count
FROM interviewers
UNION ALL
SELECT 
    'interview_questions' as table_name,
    COUNT(*) as record_count
FROM interview_questions
UNION ALL
SELECT 
    'applicants_interview_ready' as table_name,
    COUNT(*) as record_count
FROM applicants WHERE status = 'INTERVIEW' AND nim IS NOT NULL;

-- Cek struktur foreign keys
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name LIKE '%interview%'
ORDER BY tc.table_name, kcu.column_name;

-- === SUCCESS MESSAGE ===
SELECT '🎉 SISTEM INTERVIEW BERHASIL DIBUAT ULANG (FIXED VERSION)! 🎉' as message,
       'Login: interviewer1-7 / interviewer123' as login_info,
       'UUID compatibility: FIXED' as compatibility_status,
       NOW() as completed_at;
