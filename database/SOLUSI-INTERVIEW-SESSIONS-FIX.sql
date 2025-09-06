-- ✅ SOLUSI CEPAT: Tambah kolom ke interview_sessions
-- Copy paste script di bawah ini ke Supabase SQL Editor

-- Cek struktur tabel saat ini
SELECT 
    table_name,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'interview_sessions'
ORDER BY ordinal_position;

-- Tambah kolom totalScore jika belum ada
ALTER TABLE interview_sessions 
ADD COLUMN "totalScore" INTEGER DEFAULT NULL;

-- Tambah kolom recommendation jika belum ada
ALTER TABLE interview_sessions 
ADD COLUMN recommendation TEXT DEFAULT NULL;

-- Tambah kolom assignment_id untuk relasi ke interviewer_assignments
ALTER TABLE interview_sessions 
ADD COLUMN assignment_id UUID DEFAULT NULL;

-- BARU: Tambah kolom interviewerName untuk menyimpan nama pewawancara dari form
ALTER TABLE interview_sessions 
ADD COLUMN "interviewerName" TEXT DEFAULT NULL;

-- Verifikasi kolom sudah ditambahkan
SELECT 
    table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'interview_sessions'
ORDER BY ordinal_position;

-- Cek apakah ada data session yang perlu diupdate
SELECT 
    id,
    "applicantId",
    "interviewerId", 
    status,
    "totalScore",
    recommendation,
    "interviewerName",
    created_at
FROM interview_sessions 
ORDER BY created_at DESC
LIMIT 5;
