-- Cek struktur tabel applicants
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'applicants' 
ORDER BY ordinal_position;
