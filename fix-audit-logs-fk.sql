-- SCRIPT UNTUK FIX MASALAH AUDIT_LOGS FOREIGN KEY
-- Situasi: admins.id sudah UUID, tapi audit_logs.adminId masih TEXT

-- === STEP 1: CEK SITUASI SAAT INI ===
SELECT 
    'admins.id type: ' || (SELECT data_type FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'id') as admins_type,
    'audit_logs.adminId type: ' || (SELECT data_type FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'adminId') as audit_logs_type;

-- === STEP 2: CONVERT AUDIT_LOGS.ADMINID KE UUID ===
-- Karena admins.id sudah UUID, audit_logs.adminId juga harus UUID

-- Convert audit_logs.adminId ke UUID
ALTER TABLE audit_logs ALTER COLUMN "adminId" TYPE UUID USING "adminId"::UUID;

-- === STEP 3: RECREATE FOREIGN KEY ===
-- Sekarang bisa buat foreign key constraint
ALTER TABLE audit_logs 
ADD CONSTRAINT audit_logs_adminId_fkey 
FOREIGN KEY ("adminId") REFERENCES admins(id) ON DELETE SET NULL;

-- === STEP 4: VERIFIKASI ===
SELECT 
    'audit_logs.adminId type after conversion: ' || data_type as result
FROM information_schema.columns 
WHERE table_name = 'audit_logs' AND column_name = 'adminId';

-- Cek foreign key berhasil dibuat
SELECT 
    constraint_name,
    table_name,
    '✅ Foreign key created successfully' as status
FROM information_schema.table_constraints 
WHERE constraint_name = 'audit_logs_adminId_fkey';

SELECT '🎉 AUDIT_LOGS FOREIGN KEY FIXED!' as message;
