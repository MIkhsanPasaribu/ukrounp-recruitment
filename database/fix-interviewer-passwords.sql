-- Update password hashes untuk semua interviewer
-- Password: admin123

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

UPDATE interviewers SET "passwordHash" = '$2b$12$7mdLZuke5iSlie541CAHQ.jWKgP/6NZD6HYycPzs73nTujAf8uM3i' WHERE username = 'pewawancara1';
UPDATE interviewers SET "passwordHash" = '$2b$12$oC162cTJDqcFNZUrMCKOmeWBLaYddV6HCPjf9yCqHAMfPD6RkWwHy' WHERE username = 'pewawancara2';
UPDATE interviewers SET "passwordHash" = '$2b$12$yJ3wrl2VuernbFIF4qF65uyTxZNEFSZQZNBDGIdGEdgbqkEYAvtpO' WHERE username = 'pewawancara3';
UPDATE interviewers SET "passwordHash" = '$2b$12$lZX6ECTmwhF4916rD4E7C.czbtIVdw/r5MBIqBEEhJrWbHP1Z2Fc2' WHERE username = 'pewawancara4';
UPDATE interviewers SET "passwordHash" = '$2b$12$T.8AuKKzChq8WJOXHYsRuedIqYbzaTu5Bs7rMIiyspjKnnDKbrDrq' WHERE username = 'pewawancara5';
UPDATE interviewers SET "passwordHash" = '$2b$12$Bzj1Pridu9F34ZSo9cJlLe2OLE1JSF9X2sY.3i9psEh1waoz7kx5i' WHERE username = 'pewawancara6';
UPDATE interviewers SET "passwordHash" = '$2b$12$R7unW9YgCglun0eJ75Woz.mS6SIBvIayYMmrfs.dFi3eLUmBAaI6.' WHERE username = 'ketuapewawancara';

-- Reset login attempts dan unlock semua akun
UPDATE interviewers SET 
    "loginAttempts" = 0,
    "lockedUntil" = NULL
WHERE "isActive" = true;

-- Verifikasi hasil update
SELECT username, email, "fullName", role, "isActive", "loginAttempts", "lockedUntil"
FROM interviewers 
ORDER BY username;

SELECT 'Password untuk semua akun interviewer telah diperbarui!' as message;
SELECT 'Password: admin123' as info;
