-- SOLUSI CEPAT: Mengatasi error "record 'new' has no field 'updated_at'"
-- Jalankan query ini di Supabase SQL Editor

-- 1. Cek struktur tabel applicants saat ini
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'applicants' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Cek trigger yang ada di tabel applicants
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'applicants'
  AND trigger_schema = 'public';

-- Jika ada trigger yang menyebabkan error, jalankan command berikut:

-- 3. Hapus semua trigger dari tabel applicants
-- DROP TRIGGER IF EXISTS update_applicants_updated_at ON applicants;
-- DROP TRIGGER IF EXISTS set_timestamp ON applicants;
-- DROP TRIGGER IF EXISTS handle_updated_at ON applicants;

-- 4. Jika kolom updated_at tidak ada, tambahkan:
-- ALTER TABLE applicants ADD COLUMN updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- 5. Jika kolom sudah ada tapi trigger bermasalah, buat trigger yang benar:
/*
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON applicants
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();
*/

-- 6. Test update setelah perbaikan
-- UPDATE applicants SET status = status WHERE id = 'your-record-id';
