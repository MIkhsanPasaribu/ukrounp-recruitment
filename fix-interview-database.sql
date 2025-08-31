-- PERBAIKAN FOREIGN KEY CONSTRAINT BERDASARKAN STRUKTUR DATABASE YANG ADA
-- Jalankan satu per satu di Supabase SQL Editor
-- TIDAK AKAN MENGHAPUS DATA APPLICANTS

-- === STEP 1: CEK STRUKTUR DATABASE YANG ADA ===
-- Cek tipe data untuk memastikan
SELECT 
    table_name, 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('applicants', 'interviewers', 'interview_sessions', 'interview_questions', 'interview_responses', 'interviewer_tokens')
AND column_name IN ('id', 'applicantId', 'interviewerId', 'sessionId', 'questionId')
ORDER BY table_name, ordinal_position;

-- === STEP 2: PERBAIKAN TYPE MISMATCH ===
-- Masalah: interview_sessions.applicantId (text) vs applicants.id (uuid)
-- Masalah: interview_sessions.interviewerId (uuid) vs interviewers.id (uuid) - ini seharusnya OK

-- Drop foreign key constraints yang error
ALTER TABLE interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_applicantId_fkey;
ALTER TABLE interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_interviewerId_fkey;

-- Convert interview_sessions.applicantId dari text ke uuid 
-- (Catatan: ini hanya berhasil jika data di applicantId bisa dikonversi ke UUID)
ALTER TABLE interview_sessions ALTER COLUMN "applicantId" TYPE UUID USING "applicantId"::UUID;

-- === STEP 3: RECREATE FOREIGN KEY CONSTRAINTS ===
ALTER TABLE interview_sessions 
ADD CONSTRAINT interview_sessions_applicantId_fkey 
FOREIGN KEY ("applicantId") REFERENCES applicants(id) ON DELETE CASCADE;

ALTER TABLE interview_sessions 
ADD CONSTRAINT interview_sessions_interviewerId_fkey 
FOREIGN KEY ("interviewerId") REFERENCES interviewers(id) ON DELETE CASCADE;

-- === STEP 4: PERBAIKAN TABEL INTERVIEW_RESPONSES ===
-- Pastikan foreign key constraints untuk interview_responses juga benar
ALTER TABLE interview_responses DROP CONSTRAINT IF EXISTS interview_responses_sessionId_fkey;
ALTER TABLE interview_responses DROP CONSTRAINT IF EXISTS interview_responses_questionId_fkey;

ALTER TABLE interview_responses 
ADD CONSTRAINT interview_responses_sessionId_fkey 
FOREIGN KEY ("sessionId") REFERENCES interview_sessions(id) ON DELETE CASCADE;

ALTER TABLE interview_responses 
ADD CONSTRAINT interview_responses_questionId_fkey 
FOREIGN KEY ("questionId") REFERENCES interview_questions(id) ON DELETE CASCADE;

-- === STEP 5: PERBAIKAN INTERVIEWER_TOKENS ===
ALTER TABLE interviewer_tokens DROP CONSTRAINT IF EXISTS interviewer_tokens_interviewerId_fkey;

ALTER TABLE interviewer_tokens 
ADD CONSTRAINT interviewer_tokens_interviewerId_fkey 
FOREIGN KEY ("interviewerId") REFERENCES interviewers(id) ON DELETE CASCADE;

-- === STEP 6: BUAT TABEL BARU UNTUK ATTENDANCE & ASSIGNMENT SYSTEM ===
-- Tabel untuk absensi interview (menggunakan struktur yang konsisten)
CREATE TABLE IF NOT EXISTS interview_attendance (
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

-- Tabel untuk assignment pewawancara ke kandidat
CREATE TABLE IF NOT EXISTS interviewer_assignments (
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

-- === STEP 7: UPDATE INTERVIEW_SESSIONS UNTUK LINK KE ASSIGNMENT ===
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS assignment_id UUID REFERENCES interviewer_assignments(id) ON DELETE SET NULL;

-- === STEP 8: BUAT INDEXES UNTUK PERFORMANCE ===
CREATE INDEX IF NOT EXISTS idx_interview_attendance_nim ON interview_attendance(nim);
CREATE INDEX IF NOT EXISTS idx_interview_attendance_applicant ON interview_attendance(applicant_id);
CREATE INDEX IF NOT EXISTS idx_interviewer_assignments_attendance ON interviewer_assignments(attendance_id);
CREATE INDEX IF NOT EXISTS idx_interviewer_assignments_interviewer ON interviewer_assignments(interviewer_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_assignment ON interview_sessions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_interview_responses_session ON interview_responses("sessionId");
CREATE INDEX IF NOT EXISTS idx_interview_responses_question ON interview_responses("questionId");

-- === STEP 9: BUAT TRIGGERS UNTUK AUTO-UPDATE TIMESTAMPS ===
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_interview_attendance_updated_at 
    BEFORE UPDATE ON interview_attendance 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviewer_assignments_updated_at 
    BEFORE UPDATE ON interviewer_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- === STEP 10: INSERT SAMPLE INTERVIEW QUESTIONS ===
INSERT INTO interview_questions (id, "questionNumber", "questionText", category, "isActive") VALUES
(gen_random_uuid(), 1, 'Ceritakan tentang diri Anda dan latar belakang pendidikan Anda.', 'Personal', true),
(gen_random_uuid(), 2, 'Mengapa Anda tertarik bergabung dengan organisasi ini?', 'Motivasi', true),
(gen_random_uuid(), 3, 'Apa kekuatan dan kelemahan Anda?', 'Personal', true),
(gen_random_uuid(), 4, 'Bagaimana Anda mengatasi konflik dalam tim?', 'Interpersonal', true),
(gen_random_uuid(), 5, 'Ceritakan pengalaman kepemimpinan Anda.', 'Leadership', true),
(gen_random_uuid(), 6, 'Bagaimana Anda mengatur waktu dan prioritas dalam aktivitas sehari-hari?', 'Management', true),
(gen_random_uuid(), 7, 'Apa rencana karir Anda ke depan?', 'Future Planning', true),
(gen_random_uuid(), 8, 'Bagaimana Anda beradaptasi dengan perubahan dan tantangan baru?', 'Adaptability', true),
(gen_random_uuid(), 9, 'Apa kontribusi yang bisa Anda berikan untuk organisasi ini?', 'Contribution', true),
(gen_random_uuid(), 10, 'Bagaimana Anda menangani tekanan dan deadline kerja?', 'Stress Management', true),
(gen_random_uuid(), 11, 'Apakah ada pertanyaan dari Anda untuk kami?', 'Closing', true)
ON CONFLICT DO NOTHING;

-- === STEP 11: VERIFIKASI SEMUA CONSTRAINTS ===
SELECT 
    tc.constraint_name, 
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
AND tc.table_name IN ('interview_sessions', 'interview_responses', 'interviewer_tokens', 'interview_attendance', 'interviewer_assignments')
ORDER BY tc.table_name;

-- === STEP 12: SUCCESS MESSAGE ===
SELECT 'SUCCESS: Semua foreign key constraints telah diperbaiki dan sistem interview siap digunakan!' as status;
