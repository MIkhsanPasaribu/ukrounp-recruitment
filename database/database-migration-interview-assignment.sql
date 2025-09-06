-- SQL untuk update mekanisme wawancara baru
-- Tambah tabel untuk assignment pewawancara dan attendance

-- STEP 0: Cek dan update tipe data jika diperlukan
-- Jalankan query ini terlebih dahulu untuk memastikan kompatibilitas tipe data

-- Cek tipe data kolom id di tabel utama
DO $$
DECLARE
    interviewer_id_type text;
    admin_id_type text;
    applicant_id_type text;
BEGIN
    -- Get data types
    SELECT data_type INTO interviewer_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'interviewers' AND column_name = 'id';
    
    SELECT data_type INTO admin_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'admins' AND column_name = 'id';
    
    SELECT data_type INTO applicant_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'applicants' AND column_name = 'id';
    
    -- Print current types
    RAISE NOTICE 'Current data types - interviewers.id: %, admins.id: %, applicants.id: %', 
                 interviewer_id_type, admin_id_type, applicant_id_type;
    
    -- Handle interviewers table conversion
    IF interviewer_id_type = 'uuid' THEN
        RAISE NOTICE 'Converting interviewers.id from UUID to VARCHAR(30)';
        
        -- Drop foreign key constraints that reference interviewers.id
        ALTER TABLE interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_interviewerId_fkey;
        ALTER TABLE interviewer_tokens DROP CONSTRAINT IF EXISTS interviewer_tokens_interviewerId_fkey;
        
        -- Convert interviewer_id columns in dependent tables
        ALTER TABLE interview_sessions ALTER COLUMN "interviewerId" TYPE VARCHAR(30);
        ALTER TABLE interviewer_tokens ALTER COLUMN "interviewerId" TYPE VARCHAR(30);
        
        -- Convert the main table
        ALTER TABLE interviewers ALTER COLUMN id TYPE VARCHAR(30);
        
        -- Recreate foreign key constraints
        ALTER TABLE interview_sessions ADD CONSTRAINT interview_sessions_interviewerId_fkey 
            FOREIGN KEY ("interviewerId") REFERENCES interviewers(id) ON DELETE CASCADE;
        ALTER TABLE interviewer_tokens ADD CONSTRAINT interviewer_tokens_interviewerId_fkey 
            FOREIGN KEY ("interviewerId") REFERENCES interviewers(id) ON DELETE CASCADE;
    END IF;
    
    -- Handle admins table conversion
    IF admin_id_type = 'uuid' THEN  
        RAISE NOTICE 'Converting admins.id from UUID to VARCHAR(30)';
        
        -- Drop foreign key constraints that reference admins.id
        ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_adminId_fkey;
        ALTER TABLE session_tokens DROP CONSTRAINT IF EXISTS session_tokens_adminId_fkey;
        
        -- Convert admin_id columns in dependent tables
        ALTER TABLE audit_logs ALTER COLUMN "adminId" TYPE VARCHAR(30);
        ALTER TABLE session_tokens ALTER COLUMN "adminId" TYPE VARCHAR(30);
        
        -- Convert the main table
        ALTER TABLE admins ALTER COLUMN id TYPE VARCHAR(30);
        
        -- Recreate foreign key constraints
        ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_adminId_fkey 
            FOREIGN KEY ("adminId") REFERENCES admins(id) ON DELETE CASCADE;
        ALTER TABLE session_tokens ADD CONSTRAINT session_tokens_adminId_fkey 
            FOREIGN KEY ("adminId") REFERENCES admins(id) ON DELETE CASCADE;
    END IF;
    
    -- Handle applicants table conversion
    IF applicant_id_type = 'uuid' THEN
        RAISE NOTICE 'Converting applicants.id from UUID to VARCHAR(30)';
        
        -- Drop foreign key constraints that reference applicants.id
        ALTER TABLE interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_applicantId_fkey;
        
        -- Convert applicant_id columns in dependent tables
        ALTER TABLE interview_sessions ALTER COLUMN "applicantId" TYPE VARCHAR(30);
        
        -- Convert the main table
        ALTER TABLE applicants ALTER COLUMN id TYPE VARCHAR(30);
        
        -- Recreate foreign key constraints
        ALTER TABLE interview_sessions ADD CONSTRAINT interview_sessions_applicantId_fkey 
            FOREIGN KEY ("applicantId") REFERENCES applicants(id) ON DELETE CASCADE;
    END IF;
END $$;

-- STEP 1: Tabel untuk attendance/absen pendaftar
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

-- STEP 2: Tabel untuk assignment pewawancara
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

-- STEP 3: Update interview_sessions table untuk reference assignment
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS assignment_id VARCHAR(30) REFERENCES interviewer_assignments(id) ON DELETE SET NULL;

-- STEP 4: Indexes untuk performance
CREATE INDEX IF NOT EXISTS idx_interview_attendance_nim ON interview_attendance(nim);
CREATE INDEX IF NOT EXISTS idx_interview_attendance_applicant ON interview_attendance(applicant_id);
CREATE INDEX IF NOT EXISTS idx_interviewer_assignments_attendance ON interviewer_assignments(attendance_id);
CREATE INDEX IF NOT EXISTS idx_interviewer_assignments_interviewer ON interviewer_assignments(interviewer_id);
CREATE INDEX IF NOT EXISTS idx_interviewer_assignments_status ON interviewer_assignments(status);

-- STEP 5: Trigger untuk update timestamp
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

-- STEP 6: Sample data untuk testing (optional)
-- INSERT INTO interview_attendance (nim, applicant_id, checked_in_by, status, notes) 
-- VALUES ('25350082', (SELECT id FROM applicants WHERE nim = '25350082'), 
--         (SELECT id FROM admins LIMIT 1), 'PRESENT', 'Hadir tepat waktu');

COMMENT ON TABLE interview_attendance IS 'Tabel untuk mencatat kehadiran pendaftar saat interview';
COMMENT ON TABLE interviewer_assignments IS 'Tabel untuk assignment pendaftar ke pewawancara tertentu';
COMMENT ON COLUMN interviewer_assignments.attendance_id IS 'Reference ke attendance record';
COMMENT ON COLUMN interviewer_assignments.interviewer_id IS 'ID pewawancara yang ditugaskan';
COMMENT ON COLUMN interviewer_assignments.assigned_by IS 'Admin yang melakukan assignment';
COMMENT ON COLUMN interview_attendance.nim IS 'NIM pendaftar untuk absensi';
COMMENT ON COLUMN interview_attendance.checked_in_by IS 'Admin yang melakukan absensi';
