-- SQL script to set up test data for dashboard status and PDF download testing
-- This script will mark a session as completed so we can test the PDF download

-- First, let's check the current sessions
SELECT 
    s.id as session_id,
    s."applicantId",
    s.status as session_status,
    s."interviewDate",
    a."fullName" as applicant_name,
    a.nim,
    a."assignedInterviewer"
FROM interview_sessions s
JOIN applicants a ON s."applicantId" = a.id
ORDER BY s."createdAt" DESC
LIMIT 10;

-- Update the first session to COMPLETED status (adjust the session ID as needed)
-- Replace 'session-id-here' with an actual session ID from the query above
UPDATE interview_sessions 
SET 
    status = 'COMPLETED',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE id = (
    SELECT id FROM interview_sessions 
    LIMIT 1
);

-- Also add some test interview responses for the completed session
-- This ensures the PDF generation has data to work with
INSERT INTO interview_responses (
    "sessionId",
    "questionId",
    "responseText",
    score,
    "createdAt",
    "updatedAt"
) 
SELECT 
    s.id as "sessionId",
    q.id as "questionId",
    CASE q."questionNumber"
        WHEN 1 THEN 'Jawaban untuk motivasi bergabung: Saya sangat tertarik dengan visi dan misi organisasi ini.'
        WHEN 2 THEN 'Jawaban untuk kontribusi: Saya bisa berkontribusi dalam bidang teknologi dan manajemen proyek.'
        WHEN 3 THEN 'Jawaban untuk pengalaman: Saya memiliki pengalaman dalam leadership dan kerjasama tim.'
        WHEN 4 THEN 'Jawaban untuk komitmen: Saya berkomitmen penuh untuk memberikan yang terbaik bagi organisasi.'
        WHEN 5 THEN 'Jawaban untuk tantangan: Saya siap menghadapi berbagai tantangan dan belajar hal-hal baru.'
        ELSE 'Jawaban untuk pertanyaan nomor ' || q."questionNumber"::text
    END as "responseText",
    CASE q."questionNumber"
        WHEN 1 THEN 85
        WHEN 2 THEN 90
        WHEN 3 THEN 88
        WHEN 4 THEN 92
        WHEN 5 THEN 87
        ELSE 80
    END as score,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM interview_sessions s
CROSS JOIN interview_questions q
WHERE s.status = 'COMPLETED'
  AND NOT EXISTS (
    SELECT 1 FROM interview_responses r 
    WHERE r."sessionId" = s.id AND r."questionId" = q.id
  )
LIMIT 50; -- Limit to avoid too many inserts

-- Update the applicant's interview score based on the responses
UPDATE applicants 
SET 
    "interviewScore" = (
        SELECT ROUND(AVG(r.score), 2)
        FROM interview_responses r
        JOIN interview_sessions s ON r."sessionId" = s.id
        WHERE s."applicantId" = applicants.id
    ),
    "interviewStatus" = 'COMPLETED',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE id IN (
    SELECT DISTINCT s."applicantId"
    FROM interview_sessions s
    WHERE s.status = 'COMPLETED'
);

-- Verify the setup
SELECT 
    s.id as session_id,
    s.status as session_status,
    a."fullName" as applicant_name,
    a.nim,
    a."interviewScore",
    a."interviewStatus",
    COUNT(r.id) as response_count,
    AVG(r.score) as avg_score
FROM interview_sessions s
JOIN applicants a ON s."applicantId" = a.id
LEFT JOIN interview_responses r ON s.id = r."sessionId"
WHERE s.status = 'COMPLETED'
GROUP BY s.id, s.status, a."fullName", a.nim, a."interviewScore", a."interviewStatus"
ORDER BY s."updatedAt" DESC;

-- Additional: Create some sessions with different statuses for testing
-- Create an IN_PROGRESS session
UPDATE interview_sessions 
SET 
    status = 'IN_PROGRESS',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE id = (
    SELECT id FROM interview_sessions 
    WHERE status != 'COMPLETED'
    LIMIT 1
);

-- Display final status for verification
SELECT 
    status,
    COUNT(*) as count
FROM interview_sessions 
GROUP BY status
ORDER BY status;
