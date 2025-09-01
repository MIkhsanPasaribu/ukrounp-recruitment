-- SIMPLE FIX UNTUK FOREIGN KEY CONSTRAINT ERROR
-- Jalankan di Supabase SQL Editor satu per satu

-- 1. Drop constraint yang error
ALTER TABLE interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_interviewerId_fkey;
ALTER TABLE interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_applicantId_fkey;

-- 2. Ubah tipe kolom foreign key agar sesuai dengan primary key
-- Untuk UUID primary keys, convert foreign keys ke UUID
ALTER TABLE interview_sessions ALTER COLUMN "interviewerId" TYPE UUID USING "interviewerId"::UUID;
ALTER TABLE interview_sessions ALTER COLUMN "applicantId" TYPE UUID USING "applicantId"::UUID;

-- 3. Recreate foreign key constraints
ALTER TABLE interview_sessions 
ADD CONSTRAINT interview_sessions_interviewerId_fkey 
FOREIGN KEY ("interviewerId") REFERENCES interviewers(id) ON DELETE CASCADE;

ALTER TABLE interview_sessions 
ADD CONSTRAINT interview_sessions_applicantId_fkey 
FOREIGN KEY ("applicantId") REFERENCES applicants(id) ON DELETE CASCADE;

-- 4. Verifikasi constraints dibuat ulang
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
AND tc.table_name = 'interview_sessions';

-- Kalau masih error, berarti tabel utama (interviewers/applicants) belum ada
-- Jalankan ini untuk cek apakah tabel ada:
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('interviewers', 'applicants', 'interview_sessions')
AND table_schema = 'public';

-- STEP 4: Ubah tipe data kolom primary key di tabel utama
ALTER TABLE interviewers ALTER COLUMN id TYPE VARCHAR(30);
ALTER TABLE admins ALTER COLUMN id TYPE VARCHAR(30);
ALTER TABLE applicants ALTER COLUMN id TYPE VARCHAR(30);

-- STEP 5: Recreate foreign key constraints
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

-- STEP 6: Buat tabel baru untuk interview attendance
CREATE TABLE IF NOT EXISTS interview_attendance (
    id VARCHAR(30) PRIMARY KEY DEFAULT '', -- Will use cuid() in application
    nim VARCHAR(20) NOT NULL UNIQUE,
    applicant_id VARCHAR(30) REFERENCES applicants(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checked_in_by VARCHAR(30) REFERENCES admins(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'PRESENT' CHECK (status IN ('PRESENT', 'ABSENT', 'LATE')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 7: Buat tabel untuk interviewer assignments
CREATE TABLE IF NOT EXISTS interviewer_assignments (
    id VARCHAR(30) PRIMARY KEY DEFAULT '', -- Will use cuid() in application
    attendance_id VARCHAR(30) NOT NULL REFERENCES interview_attendance(id) ON DELETE CASCADE,
    interviewer_id VARCHAR(30) NOT NULL REFERENCES interviewers(id) ON DELETE CASCADE,
    assigned_by VARCHAR(30) REFERENCES admins(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one assignment per attendance
    UNIQUE(attendance_id)
);

-- STEP 8: Update interview_sessions table untuk reference assignment
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS assignment_id VARCHAR(30) REFERENCES interviewer_assignments(id) ON DELETE SET NULL;

-- STEP 9: Buat indexes
CREATE INDEX IF NOT EXISTS idx_interview_attendance_nim ON interview_attendance(nim);
CREATE INDEX IF NOT EXISTS idx_interview_attendance_applicant ON interview_attendance(applicant_id);
CREATE INDEX IF NOT EXISTS idx_interviewer_assignments_attendance ON interviewer_assignments(attendance_id);
CREATE INDEX IF NOT EXISTS idx_interviewer_assignments_interviewer ON interviewer_assignments(interviewer_id);
CREATE INDEX IF NOT EXISTS idx_interviewer_assignments_status ON interviewer_assignments(status);

-- STEP 10: Buat functions dan triggers
CREATE OR REPLACE FUNCTION update_interview_attendance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_interviewer_assignments_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_interview_attendance_timestamp
    BEFORE UPDATE ON interview_attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_interview_attendance_timestamp();

CREATE TRIGGER update_interviewer_assignments_timestamp
    BEFORE UPDATE ON interviewer_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_interviewer_assignments_timestamp();
