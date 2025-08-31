-- SOLUSI BENAR: Tambahkan kolom updated_at ke tabel applicants
-- Function update_updated_at_column() tidak boleh dihapus karena digunakan tabel lain

-- 1. Hapus HANYA trigger di tabel applicants (bukan function)
DROP TRIGGER IF EXISTS update_applicants_updated_at ON applicants;

-- 2. Cek apakah kolom updated_at sudah ada di tabel applicants
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'applicants' 
  AND column_name = 'updated_at';

-- 3. Tambahkan kolom updated_at ke tabel applicants
ALTER TABLE applicants 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- 4. Update semua record existing untuk set nilai updated_at
UPDATE applicants 
SET updated_at = COALESCE(created_at, CURRENT_TIMESTAMP)
WHERE updated_at IS NULL;

-- 5. Buat ulang trigger untuk tabel applicants (menggunakan function yang sudah ada)
CREATE TRIGGER update_applicants_updated_at
    BEFORE UPDATE ON applicants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Verifikasi trigger sudah dibuat
SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'applicants';

-- 7. Verifikasi kolom updated_at sudah ada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'applicants' 
  AND column_name = 'updated_at';

-- 8. Test update (ganti dengan ID yang error sebelumnya)
-- UPDATE applicants SET status = status WHERE id = 'your-record-id';
