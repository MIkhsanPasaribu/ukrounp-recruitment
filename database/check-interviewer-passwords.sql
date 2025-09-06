-- Cek password hash saat ini untuk semua interviewer
SELECT 
    username,
    email,
    "isActive",
    LEFT("passwordHash", 20) as password_hash_preview,
    CASE 
        WHEN "passwordHash" = '$2b$12$UuwjZpZAGc47gsUwFk99aO5jHQkdmbMNvX.OnKhHg0mSHSfTquOx6' THEN 'WORKING_HASH'
        WHEN "passwordHash" = '$2b$12$Bzj1Pridu9F34ZSo9cJlLe2OLE1JSF9X2sY.3i9psEh1waoz7kx5i' THEN 'OLD_WORKING_HASH'
        ELSE 'DIFFERENT_HASH'
    END as hash_status
FROM interviewers
WHERE username IN ('pewawancara1', 'pewawancara2', 'pewawancara3', 'pewawancara4', 'pewawancara5', 'pewawancara6', 'pewawancara7')
ORDER BY username;
