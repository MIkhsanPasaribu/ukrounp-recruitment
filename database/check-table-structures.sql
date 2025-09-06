-- SQL untuk mengecek dan memperbaiki tipe data tabel
-- Jalankan query ini satu per satu untuk mengecek struktur tabel

-- 1. Cek struktur tabel interviewers
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'interviewers' 
ORDER BY ordinal_position;

-- 2. Cek struktur tabel admins
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'admins' 
ORDER BY ordinal_position;

-- 3. Cek struktur tabel applicants
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'applicants' 
ORDER BY ordinal_position;

-- 4. Jika tabel interviewers menggunakan UUID, jalankan ALTER TABLE ini:
-- ALTER TABLE interviewers ALTER COLUMN id TYPE VARCHAR(30);

-- 5. Jika tabel admins menggunakan UUID, jalankan ALTER TABLE ini:  
-- ALTER TABLE admins ALTER COLUMN id TYPE VARCHAR(30);

-- 6. Jika tabel applicants menggunakan UUID, jalankan ALTER TABLE ini:
-- ALTER TABLE applicants ALTER COLUMN id TYPE VARCHAR(30);
