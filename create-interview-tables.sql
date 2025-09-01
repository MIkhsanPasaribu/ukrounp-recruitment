-- Create interview tables for wawancara workflow
-- Run this script di Supabase SQL Editor

-- 1. Create interviewer_tokens table
CREATE TABLE IF NOT EXISTS interviewer_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "interviewerId" UUID NOT NULL REFERENCES interviewers(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "isRevoked" BOOLEAN DEFAULT FALSE,
    "revokedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create interview_sessions table  
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "applicantId" UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    "interviewerId" UUID NOT NULL REFERENCES interviewers(id) ON DELETE CASCADE,
    "interviewDate" TIMESTAMPTZ,
    location TEXT,
    notes TEXT,
    status TEXT DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create interview_questions table
CREATE TABLE IF NOT EXISTS interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "questionNumber" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    category TEXT NOT NULL,
    "maxScore" INTEGER DEFAULT 5,
    "isActive" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create interview_responses table
CREATE TABLE IF NOT EXISTS interview_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "sessionId" UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    "questionId" UUID NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
    response TEXT,
    score INTEGER CHECK (score >= 1 AND score <= 5),
    notes TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Insert default interview questions
INSERT INTO interview_questions ("questionNumber", "questionText", category, "maxScore") VALUES
(1, 'Ceritakan tentang diri Anda dan mengapa tertarik bergabung dengan Unit Kegiatan Robotika?', 'Motivasi', 5),
(2, 'Apa pengalaman Anda di bidang teknologi, robotika, atau programming?', 'Pengalaman', 5),
(3, 'Bagaimana Anda mengatasi tantangan saat mengerjakan proyek teknis?', 'Problem Solving', 5),
(4, 'Apa kontribusi yang ingin Anda berikan untuk Unit Kegiatan Robotika?', 'Kontribusi', 5),
(5, 'Bagaimana Anda membagi waktu antara akademik dan organisasi?', 'Time Management', 5)
ON CONFLICT DO NOTHING;

-- 6. Create useful indexes
CREATE INDEX IF NOT EXISTS idx_interviewer_tokens_interviewer_id ON interviewer_tokens("interviewerId");
CREATE INDEX IF NOT EXISTS idx_interviewer_tokens_token ON interviewer_tokens(token);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_applicant_id ON interview_sessions("applicantId");
CREATE INDEX IF NOT EXISTS idx_interview_sessions_interviewer_id ON interview_sessions("interviewerId");
CREATE INDEX IF NOT EXISTS idx_interview_responses_session_id ON interview_responses("sessionId");
CREATE INDEX IF NOT EXISTS idx_interview_responses_question_id ON interview_responses("questionId");

-- 7. Enable RLS (Row Level Security) if needed
-- ALTER TABLE interviewer_tokens ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE interview_responses ENABLE ROW LEVEL SECURITY;

-- 8. Verify tables created successfully
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
