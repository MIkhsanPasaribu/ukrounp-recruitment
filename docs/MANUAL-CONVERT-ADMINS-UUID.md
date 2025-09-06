# LANGKAH-LANGKAH MANUAL CONVERT ADMINS.ID KE UUID

Karena `admins.id` masih TEXT, ikuti langkah ini step by step di Supabase SQL Editor:

## STEP 1: Cek situasi saat ini

```sql
-- Cek tipe data admins.id
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'admins' AND column_name = 'id';

-- Cek sample data admins
SELECT id, username, LENGTH(id) as id_length FROM admins LIMIT 3;
```

## STEP 2: Identifikasi foreign keys yang mereferensi admins.id

```sql
SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND ccu.table_name = 'admins'
AND ccu.column_name = 'id';
```

## STEP 3: Drop foreign key constraints

```sql
-- Drop foreign keys yang ditemukan (sesuaikan dengan hasil step 2)
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_adminId_fkey;
ALTER TABLE admin_tokens DROP CONSTRAINT IF EXISTS admin_tokens_admin_id_fkey;
ALTER TABLE session_tokens DROP CONSTRAINT IF EXISTS session_tokens_adminId_fkey;
```

## STEP 4: Convert admins.id ke UUID

```sql
-- Convert admins.id
ALTER TABLE admins ALTER COLUMN id TYPE UUID USING id::UUID;
```

## STEP 5: Convert foreign key columns ke UUID

```sql
-- Convert audit_logs.adminId
ALTER TABLE audit_logs ALTER COLUMN "adminId" TYPE UUID USING "adminId"::UUID;

-- Convert admin_tokens.admin_id (jika ada)
-- ALTER TABLE admin_tokens ALTER COLUMN admin_id TYPE UUID USING admin_id::UUID;

-- Convert session_tokens.adminId (jika ada)
-- ALTER TABLE session_tokens ALTER COLUMN "adminId" TYPE UUID USING "adminId"::UUID;
```

## STEP 6: Recreate foreign key constraints

```sql
-- Recreate audit_logs foreign key
ALTER TABLE audit_logs
ADD CONSTRAINT audit_logs_adminId_fkey
FOREIGN KEY ("adminId") REFERENCES admins(id) ON DELETE SET NULL;

-- Recreate admin_tokens foreign key (jika tabel ada)
-- ALTER TABLE admin_tokens
-- ADD CONSTRAINT admin_tokens_admin_id_fkey
-- FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE;

-- Recreate session_tokens foreign key (jika tabel ada)
-- ALTER TABLE session_tokens
-- ADD CONSTRAINT session_tokens_adminId_fkey
-- FOREIGN KEY ("adminId") REFERENCES admins(id) ON DELETE CASCADE;
```

## STEP 7: Verifikasi

```sql
-- Cek tipe data final
SELECT
    table_name || '.' || column_name || ' = ' || data_type as final_status
FROM information_schema.columns
WHERE (table_name = 'admins' AND column_name = 'id')
   OR (table_name = 'audit_logs' AND column_name = 'adminId');

-- Cek sample data
SELECT id, username, pg_typeof(id) as id_type FROM admins LIMIT 3;
```

## Jika ada error "invalid input syntax for type uuid"

Berarti data admins.id tidak dalam format UUID. Lihat data dengan:

```sql
SELECT id, LENGTH(id), id FROM admins;
```

Jika bukan format UUID, perlu strategi berbeda (generate UUID baru atau convert format).
