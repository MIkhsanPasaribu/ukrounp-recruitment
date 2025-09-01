-- Debug script untuk check semua tabel interview
-- Jalankan di Supabase SQL Editor

-- 1. Check apakah tabel sudah ada
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

-- 2. Check struktur tabel interview_sessions
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'interview_sessions'
ORDER BY ordinal_position;

-- 3. Check interviewer accounts
SELECT 
    id,
    username,
    email,
    "fullName",
    role,
    "isActive",
    "lastLoginAt",
    created_at
FROM interviewers
ORDER BY username;

-- 4. Check applicants dengan status INTERVIEW
SELECT 
    id,
    nim,
    "fullName",
    email,
    status,
    "assignedInterviewer",
    "interviewAttendance",
    updated_at
FROM applicants 
WHERE status = 'INTERVIEW'
ORDER BY "assignedInterviewer", nim;

-- 5. Check existing interview_sessions
SELECT 
    s.id,
    s."applicantId",
    s."interviewerId", 
    a."fullName" as applicant_name,
    a.nim,
    i.username as interviewer_username,
    s.status,
    s."interviewDate",
    s."createdAt"
FROM interview_sessions s
LEFT JOIN applicants a ON s."applicantId" = a.id
LEFT JOIN interviewers i ON s."interviewerId" = i.id
ORDER BY s."createdAt" DESC;

-- 6. Check active interviewer tokens
SELECT 
    t.id,
    t."interviewerId",
    i.username,
    t."expiresAt",
    t."isRevoked",
    t."createdAt"
FROM interviewer_tokens t
LEFT JOIN interviewers i ON t."interviewerId" = i.id
WHERE t."isRevoked" = false 
AND t."expiresAt" > NOW()
ORDER BY t."createdAt" DESC;

-- 7. Check interview questions
SELECT 
    "questionNumber",
    "questionText",
    category,
    "maxScore",
    "isActive"
FROM interview_questions
ORDER BY "questionNumber";
