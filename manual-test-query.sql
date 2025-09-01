-- Manual testing untuk debug status update dan assignment
-- Jalankan query ini di Supabase SQL Editor untuk debug

-- 1. Cek status peserta dengan NIM 23076039 setelah konfirmasi kehadiran
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

-- 2. Cek semua peserta dengan status INTERVIEW
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
WHERE status = 'INTERVIEW'
ORDER BY updatedAt DESC;

-- 3. Jika status belum berubah, update manual:
UPDATE applicants 
SET 
    status = 'INTERVIEW',
    attendanceConfirmed = true,
    interviewStatus = 'PENDING',
    updatedAt = NOW()
WHERE nim = '23076039';

-- 4. Verifikasi update:
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

-- 5. Test assignment ke pewawancara1:
UPDATE applicants 
SET 
    assignedInterviewer = 'pewawancara1',
    interviewStatus = 'ASSIGNED',
    updatedAt = NOW()
WHERE nim = '23076039'
  AND status = 'INTERVIEW'
  AND attendanceConfirmed = true;

-- 6. Verifikasi assignment:
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

-- 7. Cek data yang seharusnya muncul di API interview-candidates:
SELECT 
    id, 
    nim, 
    fullName, 
    status, 
    attendanceConfirmed, 
    assignedInterviewer, 
    interviewStatus
FROM applicants 
WHERE status = 'INTERVIEW'
  AND attendanceConfirmed = true;

-- 8. Cek pewawancara yang tersedia:
SELECT id, username, fullName, active
FROM interviewers 
WHERE username LIKE 'pewawancara%'
ORDER BY username;
