-- LANGKAH MUDAH PERBAIKI TYPE MISMATCH
-- Jalankan di Supabase SQL Editor satu per satu

-- STEP 1: Cek struktur tabel yang ada
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('applicants', 'interviewers', 'interview_sessions')
ORDER BY table_name, ordinal_position;

-- STEP 2: Drop constraint yang bermasalah
ALTER TABLE interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_interviewerId_fkey;

-- STEP 3: Lihat data sample untuk memastikan format ID
SELECT 'applicants' as table_name, id, LEFT(id, 10) as id_sample FROM applicants LIMIT 3
UNION ALL
SELECT 'interviewers' as table_name, id, LEFT(id, 10) as id_sample FROM interviewers LIMIT 3
UNION ALL  
SELECT 'interview_sessions' as table_name, "interviewerId", LEFT("interviewerId", 10) as id_sample FROM interview_sessions LIMIT 3;

-- STEP 4: Berdasarkan hasil di atas, tentukan strategi:
-- Jika applicants.id dan interviewers.id adalah UUID, maka:
-- ALTER TABLE interview_sessions ALTER COLUMN "interviewerId" TYPE UUID USING "interviewerId"::UUID;

-- Jika applicants.id dan interviewers.id adalah TEXT/VARCHAR, maka:
-- ALTER TABLE interview_sessions ALTER COLUMN "interviewerId" TYPE TEXT;

-- STEP 5: Recreate constraint (sesuaikan dengan tipe yang dipilih)
-- ALTER TABLE interview_sessions ADD CONSTRAINT interview_sessions_interviewerId_fkey 
-- FOREIGN KEY ("interviewerId") REFERENCES interviewers(id) ON DELETE CASCADE;
