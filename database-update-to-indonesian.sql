-- Script untuk mengupdate database MySQL ke bahasa Indonesia
-- Jalankan script ini setelah mengubah enum di aplikasi

-- Update existing gender values dari English ke Bahasa Indonesia
UPDATE applicants SET gender = 'LAKI_LAKI' WHERE gender = 'MALE';
UPDATE applicants SET gender = 'PEREMPUAN' WHERE gender = 'FEMALE';

-- Update existing status values dari English ke Bahasa Indonesia  
UPDATE applicants SET status = 'SEDANG_DITINJAU' WHERE status = 'UNDER_REVIEW';
UPDATE applicants SET status = 'DAFTAR_PENDEK' WHERE status = 'SHORTLISTED';
-- INTERVIEW tetap sama karena merupakan istilah teknis
UPDATE applicants SET status = 'DITERIMA' WHERE status = 'ACCEPTED';
UPDATE applicants SET status = 'DITOLAK' WHERE status = 'REJECTED';

-- Alter table untuk mengubah enum values jika menggunakan ENUM type di MySQL
-- Hapus komentar di bawah jika tabel menggunakan ENUM type

-- ALTER TABLE applicants MODIFY COLUMN gender ENUM('LAKI_LAKI', 'PEREMPUAN');
-- ALTER TABLE applicants MODIFY COLUMN status ENUM('SEDANG_DITINJAU', 'DAFTAR_PENDEK', 'INTERVIEW', 'DITERIMA', 'DITOLAK') DEFAULT 'SEDANG_DITINJAU';

-- Verifikasi hasil update
SELECT DISTINCT gender FROM applicants;
SELECT DISTINCT status FROM applicants;
