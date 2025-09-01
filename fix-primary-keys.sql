-- PERBAIKAN STEP 4 - Ubah primary key columns
-- Jalankan satu per satu dengan hati-hati

-- 1. Update interviewers.id (yang menyebabkan error)
ALTER TABLE interviewers ALTER COLUMN id TYPE VARCHAR(30);

-- 2. Update admins.id  
ALTER TABLE admins ALTER COLUMN id TYPE VARCHAR(30);

-- 3. Update applicants.id
ALTER TABLE applicants ALTER COLUMN id TYPE VARCHAR(30);

-- 4. Setelah semua berhasil, baru recreate foreign key constraints
ALTER TABLE interview_sessions ADD CONSTRAINT interview_sessions_interviewerId_fkey 
    FOREIGN KEY ("interviewerId") REFERENCES interviewers(id) ON DELETE CASCADE;

ALTER TABLE interview_sessions ADD CONSTRAINT interview_sessions_applicantId_fkey 
    FOREIGN KEY ("applicantId") REFERENCES applicants(id) ON DELETE CASCADE;

ALTER TABLE interviewer_tokens ADD CONSTRAINT interviewer_tokens_interviewerId_fkey 
    FOREIGN KEY ("interviewerId") REFERENCES interviewers(id) ON DELETE CASCADE;

ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_adminId_fkey 
    FOREIGN KEY ("adminId") REFERENCES admins(id) ON DELETE CASCADE;

ALTER TABLE session_tokens ADD CONSTRAINT session_tokens_adminId_fkey 
    FOREIGN KEY ("adminId") REFERENCES admins(id) ON DELETE CASCADE;
