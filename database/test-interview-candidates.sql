-- Script untuk membuat test data applicants dengan status INTERVIEW
-- Untuk testing sistem wawancara

-- Update beberapa applicants yang sudah ada menjadi status INTERVIEW
UPDATE applicants 
SET status = 'INTERVIEW', updatedAt = now()
WHERE status IN ('SEDANG_DITINJAU', 'DAFTAR_PENDEK') 
LIMIT 5;

-- Jika tidak ada applicants yang bisa diupdate, insert beberapa test data
INSERT INTO applicants (
    id, email, fullName, nickname, gender, birthDate, faculty, department, 
    studyProgram, nim, nia, educationLevel, phoneNumber, status, updatedAt
) VALUES 
(
    'test-interview-1', 
    'kandidat1@test.com', 
    'Kandidat Interview Satu', 
    'Kandidat1', 
    'LAKI_LAKI', 
    '2000-01-15', 
    'Teknik', 
    'Teknik Informatika', 
    'S1 Teknik Informatika', 
    '123456789', 
    'NIA001', 
    'S1', 
    '081234567890', 
    'INTERVIEW', 
    now()
),
(
    'test-interview-2', 
    'kandidat2@test.com', 
    'Kandidat Interview Dua', 
    'Kandidat2', 
    'PEREMPUAN', 
    '2001-05-20', 
    'Teknik', 
    'Teknik Elektro', 
    'S1 Teknik Elektro', 
    '123456790', 
    'NIA002', 
    'S1', 
    '081234567891', 
    'INTERVIEW', 
    now()
),
(
    'test-interview-3', 
    'kandidat3@test.com', 
    'Kandidat Interview Tiga', 
    'Kandidat3', 
    'LAKI_LAKI', 
    '2000-12-10', 
    'Teknik', 
    'Teknik Mesin', 
    'S1 Teknik Mesin', 
    '123456791', 
    'NIA003', 
    'S1', 
    '081234567892', 
    'INTERVIEW', 
    now()
)
ON CONFLICT (id) DO UPDATE SET 
    status = EXCLUDED.status,
    updatedAt = EXCLUDED.updatedAt;

-- Verifikasi data
SELECT id, fullName, email, nim, nia, faculty, department, studyProgram, status, updatedAt
FROM applicants 
WHERE status = 'INTERVIEW'
ORDER BY updatedAt DESC
LIMIT 10;

SELECT 'Test data candidates dengan status INTERVIEW telah dibuat!' as message;
