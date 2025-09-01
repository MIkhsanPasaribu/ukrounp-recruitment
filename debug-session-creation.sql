-- Debug script untuk check interview session creation issues

-- 1. Check current interviewer table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'interviewers'
ORDER BY ordinal_position;

-- 2. Check specific interviewer data (pewawancara1)
SELECT id, username, email, "fullName", 
       CASE WHEN "isActive" IS NOT NULL THEN "isActive"::text
            WHEN active IS NOT NULL THEN active::text
            ELSE 'no_active_field' END as active_status
FROM interviewers 
WHERE username = 'pewawancara1';

-- 3. Check interview_sessions table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'interview_sessions'
ORDER BY ordinal_position;

-- 4. Check if interview_sessions table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'interview_sessions'
);

-- 5. Check current interviewer tokens
SELECT id, "interviewerId", "expiresAt", "isRevoked"
FROM interviewer_tokens 
WHERE "isRevoked" = false
AND "expiresAt" > NOW()
ORDER BY "createdAt" DESC
LIMIT 5;

-- 6. Test applicant data untuk M. Ikhsan Pasaribu
SELECT id, nim, "fullName", status, "assignedInterviewer"
FROM applicants 
WHERE "fullName" ILIKE '%ikhsan%'
OR nim = '23076039';
