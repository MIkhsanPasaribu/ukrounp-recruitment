-- SOLUSI CEPAT: Hapus trigger bermasalah
-- Jalankan di Supabase SQL Editor

-- 1. Hapus trigger yang menyebabkan error
DROP TRIGGER IF EXISTS update_applicants_updated_at ON applicants;

-- 2. Hapus function yang bermasalah
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 3. Verifikasi trigger sudah terhapus
SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'applicants';

-- 4. Test update sekarang (ganti dengan ID yang error)
-- UPDATE applicants SET status = status WHERE id = 'your-record-id';
