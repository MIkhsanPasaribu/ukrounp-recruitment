-- Script untuk menambahkan kolom interviewerName ke interview_sessions
-- Ini akan menyimpan nama pewawancara yang diinput dari form

ALTER TABLE interview_sessions 
ADD COLUMN interviewer_name VARCHAR(255);

-- Optional: Menambahkan comment untuk menjelaskan field ini
COMMENT ON COLUMN interview_sessions.interviewer_name IS 'Nama pewawancara yang diinput saat mengisi form wawancara';

-- Menampilkan struktur tabel yang sudah diperbarui
\d interview_sessions;
