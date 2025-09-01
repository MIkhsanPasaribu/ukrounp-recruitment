-- Debug script untuk memeriksa assignment dan attendance issue

-- 1. Cek struktur kolom tabel applicants
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'applicants' 
  AND column_name IN ('interviewStatus', 'assignedInterviewer', 'attendanceConfirmed', 'status')
ORDER BY column_name;

-- 2. Cek semua peserta yang ada
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
ORDER BY updatedAt DESC
LIMIT 10;

-- 3. Cek peserta dengan NIM 23076039 (dari screenshot)
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

-- 4. Cek semua pewawancara yang ada
SELECT id, username, fullName, active
FROM interviewers 
WHERE username LIKE 'pewawancara%'
ORDER BY username;

-- 5. Cek apakah ada peserta yang sudah assigned tapi belum attendance confirmed
SELECT 
    id, 
    nim, 
    fullName, 
    status, 
    attendanceConfirmed, 
    assignedInterviewer, 
    interviewStatus
FROM applicants 
WHERE assignedInterviewer IS NOT NULL;

-- 6. Cek peserta yang seharusnya muncul di dashboard pewawancara1
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

-- 7. Update manual untuk testing - ubah peserta ke status INTERVIEW dengan attendance confirmed
-- UPDATE applicants 
-- SET 
--     status = 'INTERVIEW',
--     attendanceConfirmed = true,
--     updatedAt = NOW()
-- WHERE nim = '23076039';

-- 8. Assign manual ke pewawancara1 untuk testing
-- UPDATE applicants 
-- SET 
--     assignedInterviewer = 'pewawancara1',
--     interviewStatus = 'ASSIGNED',
--     updatedAt = NOW()
-- WHERE nim = '23076039';

-- 9. Cek hasil setelah update manual
-- SELECT 
--     id, 
--     nim, 
--     fullName, 
--     status, 
--     attendanceConfirmed, 
--     assignedInterviewer, 
--     interviewStatus
-- FROM applicants 
-- WHERE nim = '23076039';
