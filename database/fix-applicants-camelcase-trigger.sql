-- SOLUSI BENAR: Perbaiki trigger untuk tabel applicants yang menggunakan updatedAt (camelCase)
-- Jalankan di Supabase SQL Editor

-- 1. Hapus trigger yang salah (mencari updated_at tapi kolom aslinya updatedAt)
DROP TRIGGER IF EXISTS update_applicants_updated_at ON applicants;

-- 2. Buat function khusus untuk tabel applicants yang menggunakan updatedAt
CREATE OR REPLACE FUNCTION update_applicants_updatedat_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Buat trigger baru dengan function yang benar
CREATE TRIGGER update_applicants_updatedat
    BEFORE UPDATE ON applicants
    FOR EACH ROW
    EXECUTE FUNCTION update_applicants_updatedat_column();

-- 4. Verifikasi trigger sudah dibuat
SELECT trigger_name, event_manipulation 
FROM information_schema.triggers 
WHERE event_object_table = 'applicants';

-- 5. Verifikasi kolom updatedAt ada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'applicants' 
  AND column_name = 'updatedAt';

-- 6. Test update (ganti dengan ID yang error sebelumnya)
-- UPDATE applicants SET status = status WHERE id = 'your-record-id';
