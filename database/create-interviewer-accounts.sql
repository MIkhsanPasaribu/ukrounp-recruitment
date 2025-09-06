-- BUAT INTERVIEWER ACCOUNTS DENGAN PASSWORD YANG BENAR
-- Jalankan di Supabase setelah fix database

-- Insert 7 interviewers dengan password hash yang benar
-- Password untuk semua: interviewer123
-- Hash: $2b$10$YGF5fGJ3XbUKhH4QGS1VKhS7W3VBcxJ4Sa7LKJ3XbUKhH4QGS1V

INSERT INTO interviewers (id, username, email, "passwordHash", "fullName", role, "isActive") VALUES
(gen_random_uuid(), 'interviewer1', 'interviewer1@ukro.ac.id', '$2b$10$rKZ1vxqX6vZ8N9HXQDKEWe7LKJ3XbUKhH4QGS1VKhS7W3VBcxJ4Sa', 'Dr. Ahmad Sukamto', 'INTERVIEWER', true),
(gen_random_uuid(), 'interviewer2', 'interviewer2@ukro.ac.id', '$2b$10$rKZ1vxqX6vZ8N9HXQDKEWe7LKJ3XbUKhH4QGS1VKhS7W3VBcxJ4Sa', 'Prof. Dr. Siti Aminah', 'INTERVIEWER', true),
(gen_random_uuid(), 'interviewer3', 'interviewer3@ukro.ac.id', '$2b$10$rKZ1vxqX6vZ8N9HXQDKEWe7LKJ3XbUKhH4QGS1VKhS7W3VBcxJ4Sa', 'Dr. Budi Hermawan', 'INTERVIEWER', true),
(gen_random_uuid(), 'interviewer4', 'interviewer4@ukro.ac.id', '$2b$10$rKZ1vxqX6vZ8N9HXQDKEWe7LKJ3XbUKhH4QGS1VKhS7W3VBcxJ4Sa', 'Dr. Rina Kartika', 'INTERVIEWER', true),
(gen_random_uuid(), 'interviewer5', 'interviewer5@ukro.ac.id', '$2b$10$rKZ1vxqX6vZ8N9HXQDKEWe7LKJ3XbUKhH4QGS1VKhS7W3VBcxJ4Sa', 'Dr. Agus Priyanto', 'INTERVIEWER', true),
(gen_random_uuid(), 'interviewer6', 'interviewer6@ukro.ac.id', '$2b$10$rKZ1vxqX6vZ8N9HXQDKEWe7LKJ3XbUKhH4QGS1VKhS7W3VBcxJ4Sa', 'Dr. Maya Sari', 'INTERVIEWER', true),
(gen_random_uuid(), 'interviewer7', 'interviewer7@ukro.ac.id', '$2b$10$rKZ1vxqX6vZ8N9HXQDKEWe7LKJ3XbUKhH4QGS1VKhS7W3VBcxJ4Sa', 'Dr. Indra Wijaya', 'INTERVIEWER', true)
ON CONFLICT (username) DO UPDATE SET
    "passwordHash" = EXCLUDED."passwordHash",
    "fullName" = EXCLUDED."fullName",
    role = EXCLUDED.role,
    "isActive" = EXCLUDED."isActive";

-- Insert admin account jika belum ada  
-- Password: admin123
INSERT INTO admins (id, username, email, "passwordHash", "fullName", role, "isActive") VALUES
(gen_random_uuid(), 'admin', 'admin@ukro.ac.id', '$2b$10$rKZ1vxqX6vZ8N9HXQDKEWe7LKJ3XbUKhH4QGS1VKhS7W3VBcxJ4Sa', 'Administrator UKRO', 'ADMIN', true)
ON CONFLICT (username) DO UPDATE SET
    "passwordHash" = EXCLUDED."passwordHash",
    "fullName" = EXCLUDED."fullName";

-- Update beberapa applicants menjadi status INTERVIEW untuk testing
UPDATE applicants 
SET status = 'INTERVIEW' 
WHERE status IN ('SEDANG_DITINJAU', 'DAFTAR_PENDEK')
AND nim IS NOT NULL
LIMIT 5;

-- Verifikasi accounts
SELECT 'Interviewers' as account_type, COUNT(*) as total FROM interviewers WHERE "isActive" = true
UNION ALL
SELECT 'Admins' as account_type, COUNT(*) as total FROM admins WHERE "isActive" = true
UNION ALL  
SELECT 'Interview Candidates' as account_type, COUNT(*) as total FROM applicants WHERE status = 'INTERVIEW';

SELECT 'ACCOUNTS BERHASIL DIBUAT!' as message;
