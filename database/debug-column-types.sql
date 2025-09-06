-- Query untuk cek tipe data saat ini
SELECT 
    table_name, 
    column_name, 
    data_type,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name IN ('interviewers', 'admins', 'applicants', 'interview_sessions', 'interviewer_tokens', 'audit_logs', 'session_tokens')
AND column_name IN ('id', 'interviewerId', 'applicantId', 'adminId')
ORDER BY table_name, column_name;
