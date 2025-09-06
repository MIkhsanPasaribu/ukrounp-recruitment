-- Script sederhana untuk memperbaiki masalah updated_at pada tabel applicants
-- Jalankan di Supabase SQL Editor satu per satu

-- Langkah 1: Cek kolom yang ada di tabel applicants
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'applicants' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Langkah 2: Cek trigger yang ada
SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'applicants';

-- Langkah 3: Hapus trigger bermasalah jika ada
DROP TRIGGER IF EXISTS update_applicants_updated_at ON applicants;

-- Langkah 4: Hapus function lama jika ada  
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Langkah 5: Tambah kolom updated_at jika belum ada
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'applicants' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE applicants ADD COLUMN updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Langkah 6: Update nilai updated_at untuk record yang belum ada
UPDATE applicants 
SET updated_at = COALESCE(created_at, CURRENT_TIMESTAMP)
WHERE updated_at IS NULL;

-- Langkah 7: Buat function baru untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Langkah 8: Buat trigger baru
CREATE TRIGGER update_applicants_updated_at
    BEFORE UPDATE ON applicants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Langkah 9: Verifikasi trigger sudah dibuat
SELECT trigger_name, event_manipulation 
FROM information_schema.triggers 
WHERE event_object_table = 'applicants';

-- Langkah 10: Test update sederhana (opsional, ganti ID sesuai kebutuhan)
-- UPDATE applicants SET status = status WHERE id = 'your-record-id';
