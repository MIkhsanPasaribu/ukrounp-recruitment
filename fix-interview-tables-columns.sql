-- Quick fix: Drop dan recreate interview tables dengan struktur yang benar
-- Jalankan di Supabase SQL Editor

-- 1. Drop existing tables (hati-hati, ini akan menghapus data!)
DROP TABLE IF EXISTS interview_responses CASCADE;
DROP TABLE IF EXISTS interview_questions CASCADE; 
DROP TABLE IF EXISTS interview_sessions CASCADE;
DROP TABLE IF EXISTS interviewer_tokens CASCADE;

-- 2. Recreate dengan struktur yang benar
CREATE TABLE interviewer_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "interviewerId" UUID NOT NULL REFERENCES interviewers(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "isRevoked" BOOLEAN DEFAULT FALSE,
    "revokedAt" TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "applicantId" UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    "interviewerId" UUID NOT NULL REFERENCES interviewers(id) ON DELETE CASCADE,
    "interviewDate" TIMESTAMPTZ,
    location TEXT,
    notes TEXT,
    status TEXT DEFAULT 'SCHEDULED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "questionNumber" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    category TEXT NOT NULL,
    "maxScore" INTEGER DEFAULT 5,
    "isActive" BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE interview_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "sessionId" UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    "questionId" UUID NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
    response TEXT,
    score INTEGER CHECK (score >= 1 AND score <= 5),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Insert default questions
INSERT INTO interview_questions ("questionNumber", "questionText", category, "maxScore") VALUES
(1, 'Deskripsi Diri (Karakter/Etika, Pengalaman, Prestasi, Kelebihan/Kekurangan, Skill)', 'IDENTITAS & KEPRIBADIAN', 5),
(2, 'Tujuan Bergabung UKRO', 'VISI & MOTIVASI', 5),
(3, 'Apa Yang Dilakukan Jika Tujuan Tersebut Tidak Terpenuhi', 'RESILIENSI & ADAPTASI', 5),
(4, 'Rencana Setelah Bergabung', 'PERENCANAAN & ARAH KARIER', 5),
(5, 'Problem Solving (Contoh: Kuliah bentrok dengan UKRO)', 'MANAJEMEN WAKTU & PRIORITAS', 5),
(6, 'Komitmen Bergabung dengan UKRO (Contoh: Gabung dengan 2 UKM)', 'KOMITMEN & KONSISTENSI', 5),
(7, 'Alasan Anda Layak Diterima', 'KUALIFIKASI & KELAYAKAN', 5),
(8, 'Misal Saat Melakukan Riset Membutuhkan Materi, Apakah Bersedia Untuk Memberikan Materi Untuk Membeli Keperluan Riset', 'KONTRIBUSI & DUKUNGAN', 5),
(9, 'Pilihan Tim Teknis', 'MINAT TEKNIS', 5),
(10, 'Pilihan Departemen', 'ASPIRASI ORGANISASI', 5),
(11, 'Hasil Psikologi', 'PSIKOLOGI & KECOCOKAN', 5);

-- 4. Create indexes
CREATE INDEX idx_interviewer_tokens_interviewer_id ON interviewer_tokens("interviewerId");
CREATE INDEX idx_interviewer_tokens_token ON interviewer_tokens(token);
CREATE INDEX idx_interview_sessions_applicant_id ON interview_sessions("applicantId");
CREATE INDEX idx_interview_sessions_interviewer_id ON interview_sessions("interviewerId");
CREATE INDEX idx_interview_responses_session_id ON interview_responses("sessionId");
CREATE INDEX idx_interview_responses_question_id ON interview_responses("questionId");

-- 5. Verify semua tabel sudah dibuat
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN (
    'interviewer_tokens', 
    'interview_sessions', 
    'interview_questions', 
    'interview_responses'
)
ORDER BY tablename;
