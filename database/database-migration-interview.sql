-- Database schema update untuk sistem wawancara
-- Jalankan di Supabase SQL Editor

-- 1. Buat enum untuk role pewawancara
DO $$ BEGIN
    CREATE TYPE "InterviewerRole" AS ENUM ('INTERVIEWER', 'HEAD_INTERVIEWER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Tabel pewawancara (7 akun pewawancara)
CREATE TABLE IF NOT EXISTS interviewers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    role "InterviewerRole" NOT NULL DEFAULT 'INTERVIEWER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabel sesi wawancara
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "applicantId" TEXT NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    "interviewerId" UUID NOT NULL REFERENCES interviewers(id) ON DELETE CASCADE,
    "interviewDate" TIMESTAMPTZ,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    "notes" TEXT,
    "totalScore" INTEGER,
    "recommendation" TEXT CHECK (recommendation IN ('SANGAT_DIREKOMENDASIKAN', 'DIREKOMENDASIKAN', 'CUKUP', 'TIDAK_DIREKOMENDASIKAN')),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabel pertanyaan wawancara (11 pertanyaan standar)
CREATE TABLE IF NOT EXISTS interview_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "questionNumber" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabel jawaban dan penilaian wawancara
CREATE TABLE IF NOT EXISTS interview_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "sessionId" UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    "questionId" UUID NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
    "response" TEXT, -- Jawaban dari peserta
    "score" INTEGER NOT NULL CHECK (score >= 1 AND score <= 5), -- Penilaian 1-5
    "notes" TEXT, -- Keterangan dari pewawancara
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE("sessionId", "questionId")
);

-- 6. Tabel token session untuk pewawancara
CREATE TABLE IF NOT EXISTS interviewer_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "interviewerId" UUID NOT NULL REFERENCES interviewers(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "revokedAt" TIMESTAMPTZ
);

-- 7. Insert 11 pertanyaan standar wawancara
INSERT INTO interview_questions ("questionNumber", "questionText", "category") VALUES
(1, 'Ceritakan tentang diri Anda dan motivasi bergabung dengan UKRO.', 'PENGENALAN'),
(2, 'Apa yang Anda ketahui tentang Unit Kegiatan Robotika Otomasi (UKRO)?', 'PENGETAHUAN_ORGANISASI'),
(3, 'Bagaimana Anda mengelola waktu antara kuliah, organisasi, dan aktivitas lainnya?', 'MANAJEMEN_WAKTU'),
(4, 'Ceritakan pengalaman Anda dalam bekerja dalam tim.', 'TEAMWORK'),
(5, 'Apa kelebihan dan kelemahan Anda?', 'SELF_ASSESSMENT'),
(6, 'Bagaimana cara Anda menangani konflik dalam tim?', 'PROBLEM_SOLVING'),
(7, 'Apa ekspektasi Anda selama bergabung dengan UKRO?', 'EKSPEKTASI'),
(8, 'Bagaimana Anda berkontribusi untuk kemajuan UKRO?', 'KONTRIBUSI'),
(9, 'Ceritakan proyek atau prestasi yang paling Anda banggakan.', 'PRESTASI'),
(10, 'Bagaimana Anda menghadapi tekanan dan deadline yang ketat?', 'STRESS_MANAGEMENT'),
(11, 'Apa rencana Anda untuk 2-3 tahun ke depan terkait pengembangan diri?', 'FUTURE_PLANNING')
ON CONFLICT DO NOTHING;

-- 8. Insert 7 akun pewawancara
INSERT INTO interviewers (username, email, "passwordHash", "fullName", role) VALUES
('pewawancara1', 'pewawancara1@ukro.com', '$2b$12$LQv3c1yqBWVHxkd0LQ4lqe7LkEyFwEr7QZm6Xs1x2tE8E9c8R9k7e', 'Pewawancara Satu', 'INTERVIEWER'),
('pewawancara2', 'pewawancara2@ukro.com', '$2b$12$LQv3c1yqBWVHxkd0LQ4lqe7LkEyFwEr7QZm6Xs1x2tE8E9c8R9k7e', 'Pewawancara Dua', 'INTERVIEWER'),
('pewawancara3', 'pewawancara3@ukro.com', '$2b$12$LQv3c1yqBWVHxkd0LQ4lqe7LkEyFwEr7QZm6Xs1x2tE8E9c8R9k7e', 'Pewawancara Tiga', 'INTERVIEWER'),
('pewawancara4', 'pewawancara4@ukro.com', '$2b$12$LQv3c1yqBWVHxkd0LQ4lqe7LkEyFwEr7QZm6Xs1x2tE8E9c8R9k7e', 'Pewawancara Empat', 'INTERVIEWER'),
('pewawancara5', 'pewawancara5@ukro.com', '$2b$12$LQv3c1yqBWVHxkd0LQ4lqe7LkEyFwEr7QZm6Xs1x2tE8E9c8R9k7e', 'Pewawancara Lima', 'INTERVIEWER'),
('pewawancara6', 'pewawancara6@ukro.com', '$2b$12$LQv3c1yqBWVHxkd0LQ4lqe7LkEyFwEr7QZm6Xs1x2tE8E9c8R9k7e', 'Pewawancara Enam', 'INTERVIEWER'),
('ketuapewawancara', 'ketuapewawancara@ukro.com', '$2b$12$LQv3c1yqBWVHxkd0LQ4lqe7LkEyFwEr7QZm6Xs1x2tE8E9c8R9k7e', 'Ketua Pewawancara', 'HEAD_INTERVIEWER')
ON CONFLICT (username) DO NOTHING;

-- 9. Buat indeks untuk performa
CREATE INDEX IF NOT EXISTS idx_interview_sessions_applicant ON interview_sessions("applicantId");
CREATE INDEX IF NOT EXISTS idx_interview_sessions_interviewer ON interview_sessions("interviewerId");
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_interview_responses_session ON interview_responses("sessionId");
CREATE INDEX IF NOT EXISTS idx_interviewer_tokens_interviewer ON interviewer_tokens("interviewerId");
CREATE INDEX IF NOT EXISTS idx_interviewer_tokens_token ON interviewer_tokens(token);

-- 10. Trigger untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger ke tabel baru
DROP TRIGGER IF EXISTS update_interviewers_updated_at ON interviewers;
CREATE TRIGGER update_interviewers_updated_at
    BEFORE UPDATE ON interviewers
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_interview_sessions_updated_at ON interview_sessions;
CREATE TRIGGER update_interview_sessions_updated_at
    BEFORE UPDATE ON interview_sessions
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 11. RLS Policies
ALTER TABLE interviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviewer_tokens ENABLE ROW LEVEL SECURITY;

-- Policies untuk service role
CREATE POLICY "Service role can manage interviewers" ON interviewers FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can manage interview_sessions" ON interview_sessions FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can manage interview_questions" ON interview_questions FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can manage interview_responses" ON interview_responses FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can manage interviewer_tokens" ON interviewer_tokens FOR ALL TO service_role USING (true);

-- Tampilkan hasil
SELECT 'Database schema untuk sistem wawancara telah berhasil dibuat!' as message;
SELECT 'Password untuk semua akun pewawancara: admin123' as info;
