-- Migrasi Database: Menambah Kolom Jenjang Pendidikan Tinggi
-- UKRO Recruitment System - Education Level Feature
-- Tanggal: 14 Agustus 2025

-- 1. Tambah enum untuk education_level
CREATE TYPE education_level AS ENUM ('S1', 'D4', 'D3');

-- 2. Tambah kolom educationLevel pada tabel applicants
ALTER TABLE applicants 
ADD COLUMN "educationLevel" education_level DEFAULT 'S1';

-- 3. Update existing data (opsional - set default S1 untuk data yang sudah ada)
UPDATE applicants 
SET "educationLevel" = 'S1' 
WHERE "educationLevel" IS NULL;

-- 4. Buat index untuk performa query
CREATE INDEX idx_applicants_education_level ON applicants("educationLevel");

-- 5. Verifikasi perubahan
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'applicants' 
AND column_name = 'educationLevel';

-- 6. Cek enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'education_level'
);

COMMENT ON COLUMN applicants."educationLevel" IS 'Jenjang pendidikan tinggi: S1 (Strata 1), D4 (Diploma 4), D3 (Diploma 3)';
