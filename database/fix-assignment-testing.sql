-- Script manual untuk testing assignment workflow
-- Jalankan di Supabase SQL Editor untuk fix masalah

-- 1. Cek peserta dengan NIM 23076039 (dari screenshot)
SELECT 
    id, 
    nim, 
    fullName, 
    status, 
    attendanceConfirmed, 
    assignedInterviewer, 
    interviewStatus,
    updatedAt
FROM applicants 
WHERE nim = '23076039';

-- 2. Update peserta tersebut menjadi status INTERVIEW dengan attendance confirmed
UPDATE applicants 
SET 
    status = 'INTERVIEW',
    attendanceConfirmed = true,
    interviewStatus = 'PENDING',
    updatedAt = NOW()
WHERE nim = '23076039';

-- 3. Cek apakah pewawancara1 ada di database
SELECT id, username, fullName, active
FROM interviewers 
WHERE username = 'pewawancara1';

-- 4. Jika pewawancara1 tidak ada, buat akun pewawancara1
INSERT INTO interviewers (username, fullName, password, active)
VALUES ('pewawancara1', 'Pewawancara 1', '$2b$10$abcdefghijklmnopqrstuvwxyz123456789', true)
ON CONFLICT (username) DO UPDATE SET 
    active = true,
    fullName = 'Pewawancara 1';

-- 5. Assign peserta ke pewawancara1
UPDATE applicants 
SET 
    assignedInterviewer = 'pewawancara1',
    interviewStatus = 'ASSIGNED',
    updatedAt = NOW()
WHERE nim = '23076039'
  AND status = 'INTERVIEW'
  AND attendanceConfirmed = true;

-- 6. Verifikasi hasil assignment
SELECT 
    id, 
    nim, 
    fullName, 
    status, 
    attendanceConfirmed, 
    assignedInterviewer, 
    interviewStatus,
    updatedAt
FROM applicants 
WHERE nim = '23076039';

-- 7. Cek data yang seharusnya muncul di dashboard pewawancara1
SELECT 
    id, 
    nim, 
    fullName, 
    status, 
    attendanceConfirmed, 
    assignedInterviewer, 
    interviewStatus
FROM applicants 
WHERE assignedInterviewer = 'pewawancara1'
  AND status = 'INTERVIEW'
  AND attendanceConfirmed = true;

-- 8. Jika perlu, buat lebih banyak peserta dummy untuk testing
INSERT INTO applicants (
    nim, fullName, email, phoneNumber, faculty, department, studyProgram,
    educationLevel, status, attendanceConfirmed, assignedInterviewer, 
    interviewStatus, submittedAt, updatedAt
) VALUES 
    ('23076040', 'Test Peserta 2', 'test2@example.com', '081234567891', 
     'Teknik', 'Teknik Informatika', 'S1 Teknik Informatika', 'S1',
     'INTERVIEW', true, 'pewawancara2', 'ASSIGNED', NOW(), NOW()),
    ('23076041', 'Test Peserta 3', 'test3@example.com', '081234567892', 
     'Teknik', 'Teknik Informatika', 'S1 Teknik Informatika', 'S1',
     'INTERVIEW', true, 'pewawancara3', 'ASSIGNED', NOW(), NOW())
ON CONFLICT (nim) DO NOTHING;

-- 9. Final verification - semua peserta yang assigned
SELECT 
    nim, 
    fullName, 
    status, 
    attendanceConfirmed, 
    assignedInterviewer, 
    interviewStatus
FROM applicants 
WHERE assignedInterviewer IS NOT NULL
ORDER BY assignedInterviewer, nim;
