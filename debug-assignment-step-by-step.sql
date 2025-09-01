-- COMPREHENSIVE DEBUG SCRIPT FOR INTERVIEWER ASSIGNMENT
-- Run this step by step di Supabase SQL Editor

-- STEP 1: Check current database structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name IN ('interviewers', 'applicants')
ORDER BY table_name, ordinal_position;

-- STEP 2: Check existing interviewers
SELECT username, email, "fullName", 
       CASE WHEN "isActive" IS NOT NULL THEN "isActive" 
            WHEN active IS NOT NULL THEN active 
            ELSE 'no_active_field' END as active_status
FROM interviewers 
WHERE username LIKE 'pewawancara%'
ORDER BY username;

-- STEP 3: Check if pewawancara2 specifically exists
SELECT *
FROM interviewers 
WHERE username = 'pewawancara2';

-- STEP 4: Test the exact query from API
SELECT id, username, "fullName", email
FROM interviewers 
WHERE username = 'pewawancara2';

-- STEP 5: Check applicants ready for assignment
SELECT nim, "fullName", status, "attendanceConfirmed", "interviewStatus", "assignedInterviewer"
FROM applicants 
WHERE status = 'INTERVIEW' 
AND "attendanceConfirmed" = true
ORDER BY nim
LIMIT 10;

-- STEP 6: Create test data if needed
INSERT INTO applicants (
    nim, 
    "fullName", 
    email, 
    status, 
    "attendanceConfirmed",
    "interviewStatus",
    "createdAt",
    "updatedAt"
) VALUES (
    '99999999',
    'DEBUG TEST CANDIDATE',
    'debug@test.com',
    'INTERVIEW',
    true,
    'PENDING',
    NOW(),
    NOW()
) ON CONFLICT (nim) DO UPDATE SET
    status = 'INTERVIEW',
    "attendanceConfirmed" = true,
    "interviewStatus" = 'PENDING',
    "updatedAt" = NOW();

-- STEP 7: Verify test candidate created
SELECT id, nim, "fullName", status, "attendanceConfirmed", "interviewStatus"
FROM applicants 
WHERE nim = '99999999';

-- STEP 8: Manual assignment test (only run if API fails)
-- UPDATE applicants 
-- SET "assignedInterviewer" = 'pewawancara2', "interviewStatus" = 'ASSIGNED', "updatedAt" = NOW()
-- WHERE nim = '99999999';

-- STEP 9: Check assignment result
-- SELECT nim, "fullName", "assignedInterviewer", "interviewStatus"
-- FROM applicants 
-- WHERE nim = '99999999';
