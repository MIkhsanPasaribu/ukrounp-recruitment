-- PERBAIKAN TYPE MISMATCH TANPA HAPUS DATA APPLICANTS
-- Jalankan satu per satu di Supabase SQL Editor

-- 1. Cek tipe data saat ini
SELECT 
    table_name, 
    column_name, 
    data_type,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name IN ('interviewers', 'admins', 'applicants', 'interview_sessions')
AND column_name IN ('id', 'interviewerId', 'applicantId', 'adminId')
ORDER BY table_name, column_name;

-- 2. Drop foreign key constraints yang bermasalah
ALTER TABLE interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_interviewerId_fkey;
ALTER TABLE interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_applicantId_fkey;

-- 3. Ubah tipe kolom foreign key di interview_sessions agar sesuai dengan primary key
-- Jika interviewers.id masih UUID, maka ubah interview_sessions.interviewerId ke UUID
-- Jika interviewers.id sudah VARCHAR, maka biarkan interview_sessions.interviewerId tetap VARCHAR

-- Cek dulu tipe interviewers.id
DO $$
DECLARE
    interviewer_id_type text;
    applicant_id_type text;
BEGIN
    SELECT data_type INTO interviewer_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'interviewers' AND column_name = 'id';
    
    SELECT data_type INTO applicant_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'applicants' AND column_name = 'id';
    
    RAISE NOTICE 'interviewers.id type: %, applicants.id type: %', interviewer_id_type, applicant_id_type;
    
    -- Sesuaikan tipe interview_sessions.interviewerId dengan interviewers.id
    IF interviewer_id_type = 'uuid' THEN
        ALTER TABLE interview_sessions ALTER COLUMN "interviewerId" TYPE UUID USING "interviewerId"::UUID;
        RAISE NOTICE 'Changed interview_sessions.interviewerId to UUID';
    ELSE
        ALTER TABLE interview_sessions ALTER COLUMN "interviewerId" TYPE VARCHAR(30);
        RAISE NOTICE 'Changed interview_sessions.interviewerId to VARCHAR(30)';
    END IF;
    
    -- Sesuaikan tipe interview_sessions.applicantId dengan applicants.id
    IF applicant_id_type = 'uuid' THEN
        ALTER TABLE interview_sessions ALTER COLUMN "applicantId" TYPE UUID USING "applicantId"::UUID;
        RAISE NOTICE 'Changed interview_sessions.applicantId to UUID';
    ELSE
        ALTER TABLE interview_sessions ALTER COLUMN "applicantId" TYPE VARCHAR(30);
        RAISE NOTICE 'Changed interview_sessions.applicantId to VARCHAR(30)';
    END IF;
END $$;

-- 4. Recreate foreign key constraints
ALTER TABLE interview_sessions 
ADD CONSTRAINT interview_sessions_interviewerId_fkey 
FOREIGN KEY ("interviewerId") REFERENCES interviewers(id) ON DELETE CASCADE;

ALTER TABLE interview_sessions 
ADD CONSTRAINT interview_sessions_applicantId_fkey 
FOREIGN KEY ("applicantId") REFERENCES applicants(id) ON DELETE CASCADE;
