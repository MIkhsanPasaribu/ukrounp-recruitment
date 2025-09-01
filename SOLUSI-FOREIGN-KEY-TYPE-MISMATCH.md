# 🔧 SOLUSI MASALAH FOREIGN KEY TYPE MISMATCH

## ❌ Masalah:

```
ERROR: foreign key constraint "fk_interview_attendance_admin" cannot be implemented
DETAIL: Key columns "checked_in_by" and "id" are of incompatible types: uuid and text.
```

## ✅ Penyebab:

- `applicants.id` sudah UUID ✅
- `admins.id` masih TEXT ❌
- Interview tables menggunakan UUID untuk foreign keys

## 🛠️ Solusi:

### **LANGKAH 1: Convert admins.id ke UUID**

Jalankan script: `convert-admins-id-to-uuid.sql`

```sql
-- Drop foreign key yang ada
ALTER TABLE admin_tokens DROP CONSTRAINT IF EXISTS admin_tokens_admin_id_fkey;

-- Convert admins.id ke UUID
ALTER TABLE admins ALTER COLUMN id TYPE UUID USING id::UUID;

-- Recreate foreign key
ALTER TABLE admin_tokens
ADD CONSTRAINT admin_tokens_admin_id_fkey
FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE;
```

### **LANGKAH 2: Jalankan interview system setup**

Setelah admins.id sudah UUID, jalankan: `database-interview-fresh-start-FIXED.sql`

Script ini sudah diperbaiki dengan:

- ✅ Type checking sebelum membuat foreign keys
- ✅ Error handling yang lebih baik
- ✅ Pesan informatif jika ada type mismatch

## 📋 Urutan Eksekusi:

1. **Backup database dulu!** ⚠️
2. Jalankan `convert-admins-id-to-uuid.sql`
3. Jalankan `database-interview-fresh-start-FIXED.sql`
4. Verifikasi hasil

## 🔍 File yang Dibuat:

1. `convert-admins-id-to-uuid.sql` - Convert admins.id ke UUID
2. `database-interview-fresh-start-FIXED.sql` - Setup interview system (UPDATED)
3. `check-admins-applicants-types.sql` - Diagnostic script
4. `fix-admins-uuid-and-foreign-keys.sql` - Comprehensive fix script

## ⚡ Quick Fix:

Jika ingin cepat, copy-paste langsung di Supabase SQL Editor:

```sql
-- 1. Convert admins.id ke UUID
ALTER TABLE admin_tokens DROP CONSTRAINT IF EXISTS admin_tokens_admin_id_fkey;
ALTER TABLE admins ALTER COLUMN id TYPE UUID USING id::UUID;
ALTER TABLE admin_tokens ADD CONSTRAINT admin_tokens_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE;

-- 2. Lalu jalankan foreign key constraints dari interview system
-- (Copy dari database-interview-fresh-start-FIXED.sql STEP 12)
```

## 🎯 Hasil Akhir:

- ✅ `admins.id` type: UUID
- ✅ `applicants.id` type: UUID
- ✅ Semua interview tables menggunakan UUID
- ✅ Foreign key constraints berhasil dibuat
- ✅ Sistem interview siap digunakan!
