-- Create dummy test applicants untuk assignment testing
-- Run this di Supabase SQL Editor untuk setup testing

-- 1. First check jika sudah ada applicants dengan status INTERVIEW
SELECT nim, "fullName", status, "attendanceConfirmed", "interviewStatus"
FROM applicants 
WHERE status = 'INTERVIEW'
LIMIT 5;

-- 2. Create dummy applicants for testing
INSERT INTO applicants (
    nim, 
    "fullName", 
    email, 
    status, 
    "attendanceConfirmed",
    "interviewStatus",
    "createdAt",
    "updatedAt"
) VALUES 
    ('23076039', 'Test Kandidat 1', 'test1@student.unp.ac.id', 'INTERVIEW', true, 'PENDING', NOW(), NOW()),
    ('23076040', 'Test Kandidat 2', 'test2@student.unp.ac.id', 'INTERVIEW', true, 'PENDING', NOW(), NOW()),
    ('23076041', 'Test Kandidat 3', 'test3@student.unp.ac.id', 'INTERVIEW', true, 'PENDING', NOW(), NOW()),
    ('23076042', 'Test Kandidat 4', 'test4@student.unp.ac.id', 'INTERVIEW', true, 'PENDING', NOW(), NOW()),
    ('23076043', 'Test Kandidat 5', 'test5@student.unp.ac.id', 'INTERVIEW', true, 'PENDING', NOW(), NOW()),
    ('23076044', 'Test Kandidat 6', 'test6@student.unp.ac.id', 'INTERVIEW', true, 'PENDING', NOW(), NOW()),
    ('23076045', 'Test Kandidat 7', 'test7@student.unp.ac.id', 'INTERVIEW', true, 'PENDING', NOW(), NOW())
ON CONFLICT (nim) DO UPDATE SET
    status = 'INTERVIEW',
    "attendanceConfirmed" = true,
    "interviewStatus" = 'PENDING',
    "updatedAt" = NOW();

-- 3. Verify dummy data created
SELECT nim, "fullName", status, "attendanceConfirmed", "interviewStatus", "assignedInterviewer"
FROM applicants 
WHERE nim LIKE '230760%'
ORDER BY nim;

-- 4. Manual assignment untuk testing (run satu per satu)
-- Assignment ke pewawancara1
UPDATE applicants 
SET "assignedInterviewer" = 'pewawancara1', "interviewStatus" = 'ASSIGNED', "updatedAt" = NOW()
WHERE nim = '23076039';

-- Assignment ke pewawancara2
UPDATE applicants 
SET "assignedInterviewer" = 'pewawancara2', "interviewStatus" = 'ASSIGNED', "updatedAt" = NOW()
WHERE nim = '23076040';

-- Assignment ke pewawancara3
UPDATE applicants 
SET "assignedInterviewer" = 'pewawancara3', "interviewStatus" = 'ASSIGNED', "updatedAt" = NOW()
WHERE nim = '23076041';

-- Assignment ke pewawancara4
UPDATE applicants 
SET "assignedInterviewer" = 'pewawancara4', "interviewStatus" = 'ASSIGNED', "updatedAt" = NOW()
WHERE nim = '23076042';

-- Assignment ke pewawancara5
UPDATE applicants 
SET "assignedInterviewer" = 'pewawancara5', "interviewStatus" = 'ASSIGNED', "updatedAt" = NOW()
WHERE nim = '23076043';

-- Assignment ke pewawancara6
UPDATE applicants 
SET "assignedInterviewer" = 'pewawancara6', "interviewStatus" = 'ASSIGNED', "updatedAt" = NOW()
WHERE nim = '23076044';

-- Assignment ke pewawancara7
UPDATE applicants 
SET "assignedInterviewer" = 'pewawancara7', "interviewStatus" = 'ASSIGNED', "updatedAt" = NOW()
WHERE nim = '23076045';

-- 5. Check assignment results
SELECT nim, "fullName", "assignedInterviewer", "interviewStatus"
FROM applicants 
WHERE nim LIKE '230760%'
ORDER BY nim; 
SET 
    assignedInterviewer = 'pewawancara2',
    interviewStatus = 'ASSIGNED',
    updatedAt = NOW()
WHERE id IN (
    SELECT TOP 1 id 
    FROM applicants 
    WHERE status = 'INTERVIEW' 
        AND (assignedInterviewer IS NULL OR assignedInterviewer = '')
);

-- Untuk test, pastikan ada minimal 1 peserta yang bisa ditugaskan
-- Jika perlu, ubah status peserta dummy ke INTERVIEW terlebih dahulu:
-- UPDATE applicants 
-- SET 
--     status = 'INTERVIEW',
--     attendanceConfirmed = true,
--     checkedInAt = NOW(),
--     updatedAt = NOW()
-- WHERE nim = 'NIM_DUMMY_ANDA';

-- Cek hasil penugasan
SELECT id, nim, fullName, status, attendanceConfirmed, assignedInterviewer, interviewStatus
FROM applicants 
WHERE assignedInterviewer IS NOT NULL;
