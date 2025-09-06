-- Manual test untuk debug assignment issue
-- Cek interviewer table structure dan data

-- 1. Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'interviewers'
ORDER BY ordinal_position;

-- 2. Check all interviewers exist
SELECT username, email, "fullName"
FROM interviewers 
WHERE username LIKE 'pewawancara%'
ORDER BY username;

-- 3. Check specific interviewer
SELECT *
FROM interviewers 
WHERE username = 'pewawancara2';

-- 4. Test query yang sama dengan API
SELECT id, username, "fullName", email
FROM interviewers 
WHERE username = 'pewawancara2';

-- 5. Check applicants yang bisa di-assign
SELECT nim, "fullName", status, "attendanceConfirmed", "interviewStatus", "assignedInterviewer"
FROM applicants 
WHERE status = 'INTERVIEW' 
AND "attendanceConfirmed" = true
ORDER BY nim;

-- 6. Manual assignment test (jika API gagal)
-- UPDATE applicants 
-- SET "assignedInterviewer" = 'pewawancara2', "interviewStatus" = 'ASSIGNED'
-- WHERE nim = '23076039';

-- 7. Check assignment result
-- SELECT nim, "fullName", "assignedInterviewer", "interviewStatus"
-- FROM applicants 
-- WHERE nim = '23076039';
