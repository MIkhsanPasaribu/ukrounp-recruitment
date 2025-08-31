-- SOLUSI SIMPLE UNTUK MEMPERBAIKI TYPE MISMATCH
-- Copy dan paste satu per satu ke Supabase SQL Editor

-- 1. CEK STRUKTUR TABEL
\d applicants
\d interviewers  
\d interview_sessions

-- 2. DROP CONSTRAINT BERMASALAH
ALTER TABLE interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_interviewerId_fkey;
ALTER TABLE interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_applicantId_fkey;

-- 3. UBAH TIPE KOLOM INTERVIEW_SESSIONS
-- Jika tabel utama menggunakan UUID:
ALTER TABLE interview_sessions ALTER COLUMN "interviewerId" TYPE UUID USING "interviewerId"::UUID;
ALTER TABLE interview_sessions ALTER COLUMN "applicantId" TYPE UUID USING "applicantId"::UUID;

-- ATAU jika tabel utama menggunakan TEXT:
-- ALTER TABLE interview_sessions ALTER COLUMN "interviewerId" TYPE TEXT;
-- ALTER TABLE interview_sessions ALTER COLUMN "applicantId" TYPE TEXT;

-- 4. RECREATE CONSTRAINTS
ALTER TABLE interview_sessions 
ADD CONSTRAINT interview_sessions_interviewerId_fkey 
FOREIGN KEY ("interviewerId") REFERENCES interviewers(id) ON DELETE CASCADE;

ALTER TABLE interview_sessions 
ADD CONSTRAINT interview_sessions_applicantId_fkey 
FOREIGN KEY ("applicantId") REFERENCES applicants(id) ON DELETE CASCADE;

-- 5. VERIFIKASI
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE table_name = 'interview_sessions' 
AND constraint_type = 'FOREIGN KEY';
