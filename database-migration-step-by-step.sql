-- INSTRUKSI STEP-BY-STEP UNTUK SUPABASE
-- Jalankan satu per satu, jangan copy-paste semuanya sekaligus

-- STEP 1: Cek tipe data yang ada (jalankan ini dulu untuk melihat situasi)
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('interviewers', 'admins', 'applicants', 'interview_sessions', 'interviewer_tokens', 'audit_logs', 'session_tokens')
AND column_name IN ('id', 'interviewerId', 'applicantId', 'adminId')
ORDER BY table_name, column_name;

-- STEP 2: Drop foreign key constraints (jalankan ini)
ALTER TABLE interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_interviewerId_fkey;
ALTER TABLE interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_applicantId_fkey;
ALTER TABLE interviewer_tokens DROP CONSTRAINT IF EXISTS interviewer_tokens_interviewerId_fkey;
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_adminId_fkey;
ALTER TABLE session_tokens DROP CONSTRAINT IF EXISTS session_tokens_adminId_fkey;

-- STEP 3: Ubah tipe data kolom foreign key (jalankan satu per satu)
ALTER TABLE interview_sessions ALTER COLUMN "interviewerId" TYPE VARCHAR(30);
ALTER TABLE interview_sessions ALTER COLUMN "applicantId" TYPE VARCHAR(30);
ALTER TABLE interviewer_tokens ALTER COLUMN "interviewerId" TYPE VARCHAR(30);
ALTER TABLE audit_logs ALTER COLUMN "adminId" TYPE VARCHAR(30);
ALTER TABLE session_tokens ALTER COLUMN "adminId" TYPE VARCHAR(30);

-- STEP 4: Ubah tipe data kolom primary key (jalankan satu per satu)
ALTER TABLE interviewers ALTER COLUMN id TYPE VARCHAR(30);
ALTER TABLE admins ALTER COLUMN id TYPE VARCHAR(30);
ALTER TABLE applicants ALTER COLUMN id TYPE VARCHAR(30);

-- STEP 5: Recreate foreign key constraints (jalankan satu per satu)
ALTER TABLE interview_sessions ADD CONSTRAINT interview_sessions_interviewerId_fkey FOREIGN KEY ("interviewerId") REFERENCES interviewers(id) ON DELETE CASCADE;
ALTER TABLE interview_sessions ADD CONSTRAINT interview_sessions_applicantId_fkey FOREIGN KEY ("applicantId") REFERENCES applicants(id) ON DELETE CASCADE;
ALTER TABLE interviewer_tokens ADD CONSTRAINT interviewer_tokens_interviewerId_fkey FOREIGN KEY ("interviewerId") REFERENCES interviewers(id) ON DELETE CASCADE;
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_adminId_fkey FOREIGN KEY ("adminId") REFERENCES admins(id) ON DELETE CASCADE;
ALTER TABLE session_tokens ADD CONSTRAINT session_tokens_adminId_fkey FOREIGN KEY ("adminId") REFERENCES admins(id) ON DELETE CASCADE;

-- STEP 6: Buat tabel interview_attendance (jalankan ini)
CREATE TABLE IF NOT EXISTS interview_attendance (
    id VARCHAR(30) PRIMARY KEY,
    nim VARCHAR(20) NOT NULL UNIQUE,
    applicant_id VARCHAR(30) REFERENCES applicants(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checked_in_by VARCHAR(30) REFERENCES admins(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'PRESENT' CHECK (status IN ('PRESENT', 'ABSENT', 'LATE')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 7: Buat tabel interviewer_assignments (jalankan ini)
CREATE TABLE IF NOT EXISTS interviewer_assignments (
    id VARCHAR(30) PRIMARY KEY,
    attendance_id VARCHAR(30) NOT NULL REFERENCES interview_attendance(id) ON DELETE CASCADE,
    interviewer_id VARCHAR(30) NOT NULL REFERENCES interviewers(id) ON DELETE CASCADE,
    assigned_by VARCHAR(30) REFERENCES admins(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(attendance_id)
);

-- STEP 8: Update interview_sessions table (jalankan ini)
ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS assignment_id VARCHAR(30) REFERENCES interviewer_assignments(id) ON DELETE SET NULL;

-- STEP 9: Buat indexes (jalankan satu per satu)
CREATE INDEX IF NOT EXISTS idx_interview_attendance_nim ON interview_attendance(nim);
CREATE INDEX IF NOT EXISTS idx_interview_attendance_applicant ON interview_attendance(applicant_id);
CREATE INDEX IF NOT EXISTS idx_interviewer_assignments_attendance ON interviewer_assignments(attendance_id);
CREATE INDEX IF NOT EXISTS idx_interviewer_assignments_interviewer ON interviewer_assignments(interviewer_id);
CREATE INDEX IF NOT EXISTS idx_interviewer_assignments_status ON interviewer_assignments(status);

-- STEP 10: Buat triggers (jalankan semuanya sekaligus)
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
