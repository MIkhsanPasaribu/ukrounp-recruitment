-- Script untuk menugaskan peserta dummy ke pewawancara 1-7
-- Pastikan ada peserta dengan status INTERVIEW dan ada pewawancara dengan username pewawancara1-7

-- Cek data peserta yang statusnya INTERVIEW
SELECT id, nim, fullName, status, attendanceConfirmed, assignedInterviewer, interviewStatus
FROM applicants 
WHERE status = 'INTERVIEW' OR attendanceConfirmed = true;

-- Cek pewawancara yang tersedia
SELECT id, username, fullName, active
FROM interviewers 
WHERE username LIKE 'pewawancara%'
ORDER BY username;

-- Jika ada peserta dengan status INTERVIEW, tugaskan ke pewawancara 1
UPDATE applicants 
SET 
    assignedInterviewer = 'pewawancara1',
    interviewStatus = 'ASSIGNED',
    updatedAt = NOW()
WHERE id IN (
    SELECT TOP 1 id 
    FROM applicants 
    WHERE status = 'INTERVIEW' 
        AND (assignedInterviewer IS NULL OR assignedInterviewer = '')
);

-- Jika ingin menugaskan beberapa peserta ke pewawancara berbeda:
-- Contoh untuk pewawancara2 (jika ada peserta kedua)
UPDATE applicants 
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
