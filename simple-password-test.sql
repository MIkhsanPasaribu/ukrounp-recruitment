-- Script alternatif untuk testing login interviewer
-- Menggunakan password yang valid untuk testing

-- Tambah kolom yang hilang untuk login security
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interviewers' AND column_name = 'loginAttempts') THEN
        ALTER TABLE interviewers ADD COLUMN "loginAttempts" INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interviewers' AND column_name = 'lockedUntil') THEN
        ALTER TABLE interviewers ADD COLUMN "lockedUntil" TIMESTAMPTZ;
    END IF;
END $$;

-- Update dengan password hash yang valid
-- Password: admin123

UPDATE interviewers SET "passwordHash" = '$2b$12$Nvz8mgJ49k3mndWR.Q7yOezbv3ZUVW.rrpvKlXHkbRLluLX89NSKi' WHERE username = 'pewawancara1';
UPDATE interviewers SET "passwordHash" = '$2b$12$Nvz8mgJ49k3mndWR.Q7yOezbv3ZUVW.rrpvKlXHkbRLluLX89NSKi' WHERE username = 'pewawancara2';
UPDATE interviewers SET "passwordHash" = '$2b$12$Nvz8mgJ49k3mndWR.Q7yOezbv3ZUVW.rrpvKlXHkbRLluLX89NSKi' WHERE username = 'pewawancara3';
UPDATE interviewers SET "passwordHash" = '$2b$12$Nvz8mgJ49k3mndWR.Q7yOezbv3ZUVW.rrpvKlXHkbRLluLX89NSKi' WHERE username = 'pewawancara4';
UPDATE interviewers SET "passwordHash" = '$2b$12$Nvz8mgJ49k3mndWR.Q7yOezbv3ZUVW.rrpvKlXHkbRLluLX89NSKi' WHERE username = 'pewawancara5';
UPDATE interviewers SET "passwordHash" = '$2b$12$Nvz8mgJ49k3mndWR.Q7yOezbv3ZUVW.rrpvKlXHkbRLluLX89NSKi' WHERE username = 'pewawancara6';
UPDATE interviewers SET "passwordHash" = '$2b$12$Nvz8mgJ49k3mndWR.Q7yOezbv3ZUVW.rrpvKlXHkbRLluLX89NSKi' WHERE username = 'ketuapewawancara';

-- Reset semua attempts
UPDATE interviewers SET 
    "loginAttempts" = 0,
    "lockedUntil" = NULL
WHERE "isActive" = true;

SELECT 'Password untuk testing: admin123' as message;
SELECT 'Gunakan password "admin123" untuk semua akun interviewer' as info;
