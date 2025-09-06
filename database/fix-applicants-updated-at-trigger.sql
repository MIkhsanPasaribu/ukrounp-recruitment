-- Script untuk memperbaiki trigger updated_at pada tabel applicants
-- Jalankan script ini di Supabase SQL Editor

-- 1. Cek apakah kolom updated_at sudah ada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'applicants' 
  AND column_name = 'updated_at';

-- 2. Cek trigger yang ada pada tabel applicants
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'applicants';

-- 3. Drop trigger yang bermasalah jika ada
DROP TRIGGER IF EXISTS update_applicants_updated_at ON applicants;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 4. Tambahkan kolom updated_at jika belum ada
ALTER TABLE applicants 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 5. Update semua record untuk set updated_at = created_at jika created_at ada
UPDATE applicants 
SET updated_at = COALESCE(created_at, CURRENT_TIMESTAMP)
WHERE updated_at IS NULL;

-- 6. Buat function untuk update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Buat trigger untuk auto-update updated_at
CREATE TRIGGER update_applicants_updated_at
    BEFORE UPDATE ON applicants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Verifikasi struktur tabel setelah perubahan
\d applicants;

-- 9. Test update pada record yang bermasalah
-- Ganti 'TARGET_ID' dengan ID record yang error
-- UPDATE applicants 
-- SET status = status 
-- WHERE id = 'TARGET_ID';

-- 10. Verifikasi trigger bekerja
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'applicants';

COMMIT;
