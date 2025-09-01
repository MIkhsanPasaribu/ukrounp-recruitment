-- Migration untuk menambah kolom interview assignment dan attendance
-- Jalankan di Supabase SQL Editor

-- 1. Tambah kolom untuk interview assignment dan attendance di tabel applicants
ALTER TABLE applicants 
ADD COLUMN IF NOT EXISTS "interviewStatus" VARCHAR(50) DEFAULT 'pending';

ALTER TABLE applicants 
ADD COLUMN IF NOT EXISTS "assignedInterviewer" VARCHAR(50);

ALTER TABLE applicants 
ADD COLUMN IF NOT EXISTS "interviewDateTime" TIMESTAMP;

ALTER TABLE applicants 
ADD COLUMN IF NOT EXISTS "attendanceConfirmed" BOOLEAN DEFAULT false;

ALTER TABLE applicants 
ADD COLUMN IF NOT EXISTS "attendanceNIM" VARCHAR(20);

ALTER TABLE applicants 
ADD COLUMN IF NOT EXISTS "interviewScore" INTEGER;

ALTER TABLE applicants 
ADD COLUMN IF NOT EXISTS "interviewNotes" TEXT;

-- 2. Update trigger untuk updatedAt jika belum ada
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Pastikan trigger ada untuk applicants
DROP TRIGGER IF EXISTS update_applicants_updated_at ON applicants;
CREATE TRIGGER update_applicants_updated_at 
    BEFORE UPDATE ON applicants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Cek struktur tabel setelah migration
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'applicants' 
  AND column_name IN ('interviewStatus', 'assignedInterviewer', 'interviewDateTime', 'attendanceConfirmed', 'attendanceNIM', 'interviewScore', 'interviewNotes')
ORDER BY column_name;

-- 5. Test data untuk melihat hasilnya
SELECT 
    id, 
    nim, 
    fullName, 
    status, 
    "interviewStatus",
    "assignedInterviewer",
    "attendanceConfirmed"
FROM applicants 
LIMIT 5;
