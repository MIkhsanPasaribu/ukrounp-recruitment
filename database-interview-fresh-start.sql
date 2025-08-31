-- HAPUS SEMUA TABEL INTERVIEW DAN BUAT ULANG DARI AWAL
-- Jalankan di Supabase SQL Editor

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
CREATE TABLE interview_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nim TEXT NOT NULL UNIQUE,
    applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMPTZ DEFAULT NOW(),
    checked_in_by UUID REFERENCES admins(id) ON DELETE SET NULL,
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
    assigned_by UUID REFERENCES admins(id) ON DELETE SET NULL,
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
    "applicantId" UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
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

-- === STEP 12: INSERT DATA AWAL ===

-- Insert 7 interviewers
INSERT INTO interviewers (username, email, "passwordHash", "fullName", role) VALUES
('interviewer1', 'interviewer1@ukro.ac.id', '$2b$10$rKZ1vxqX6vZ8N9HXQDKEWe7LKJ3XbUKhH4QGS1VKhS7W3VBcxJ4Sa', 'Dr. Ahmad Sukamto', 'INTERVIEWER'),
('interviewer2', 'interviewer2@ukro.ac.id', '$2b$10$rKZ1vxqX6vZ8N9HXQDKEWe7LKJ3XbUKhH4QGS1VKhS7W3VBcxJ4Sa', 'Prof. Dr. Siti Aminah', 'INTERVIEWER'),
('interviewer3', 'interviewer3@ukro.ac.id', '$2b$10$rKZ1vxqX6vZ8N9HXQDKEWe7LKJ3XbUKhH4QGS1VKhS7W3VBcxJ4Sa', 'Dr. Budi Hermawan', 'INTERVIEWER'),
('interviewer4', 'interviewer4@ukro.ac.id', '$2b$10$rKZ1vxqX6vZ8N9HXQDKEWe7LKJ3XbUKhH4QGS1VKhS7W3VBcxJ4Sa', 'Dr. Rina Kartika', 'INTERVIEWER'),
('interviewer5', 'interviewer5@ukro.ac.id', '$2b$10$rKZ1vxqX6vZ8N9HXQDKEWe7LKJ3XbUKhH4QGS1VKhS7W3VBcxJ4Sa', 'Dr. Agus Priyanto', 'INTERVIEWER'),
('interviewer6', 'interviewer6@ukro.ac.id', '$2b$10$rKZ1vxqX6vZ8N9HXQDKEWe7LKJ3XbUKhH4QGS1VKhS7W3VBcxJ4Sa', 'Dr. Maya Sari', 'INTERVIEWER'),
('interviewer7', 'interviewer7@ukro.ac.id', '$2b$10$rKZ1vxqX6vZ8N9HXQDKEWe7LKJ3XbUKhH4QGS1VKhS7W3VBcxJ4Sa', 'Dr. Indra Wijaya', 'INTERVIEWER');

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

-- Update beberapa applicants ke status INTERVIEW untuk testing
UPDATE applicants 
SET status = 'INTERVIEW' 
WHERE status IN ('SEDANG_DITINJAU', 'DAFTAR_PENDEK')
AND nim IS NOT NULL
AND id IN (SELECT id FROM applicants WHERE nim IS NOT NULL LIMIT 5);

-- === STEP 13: VERIFIKASI ===
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
    'interview_candidates' as table_name,
    COUNT(*) as record_count
FROM applicants WHERE status = 'INTERVIEW';

-- === SUCCESS MESSAGE ===
SELECT '🎉 SISTEM INTERVIEW BERHASIL DIBUAT ULANG! 🎉' as message,
       'Login: interviewer1-7 / interviewer123' as login_info,
       NOW() as completed_at;
