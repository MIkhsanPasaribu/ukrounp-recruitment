# 🔧 SOLUSI MASALAH: "column interview_sessions.totalScore does not exist"

## ❌ Masalah:

- Error saat edit hasil wawancara
- API mencari kolom `totalScore` dan `recommendation` yang tidak ada
- Database schema tidak lengkap

## ✅ Solusi:

### LANGKAH 1: Tambah Kolom ke Database (WAJIB)

1. **Buka Supabase Dashboard → SQL Editor**
2. **Copy paste script berikut:**

```sql
-- Tambah kolom yang hilang ke interview_sessions
ALTER TABLE interview_sessions
ADD COLUMN "totalScore" INTEGER DEFAULT NULL;

ALTER TABLE interview_sessions
ADD COLUMN recommendation TEXT DEFAULT NULL;

ALTER TABLE interview_sessions
ADD COLUMN assignment_id UUID DEFAULT NULL;

-- Verifikasi kolom sudah ditambahkan
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'interview_sessions'
ORDER BY ordinal_position;
```

3. **Jalankan script** (Run)
4. **Pastikan output menunjukkan kolom baru sudah ada**

### LANGKAH 2: Test Edit Wawancara

1. **Buka halaman interview** (localhost:3000/interview)
2. **Login sebagai pewawancara**
3. **Coba edit hasil wawancara yang ada**
4. **Pastikan tidak ada error lagi**

---

## 🔍 Jika Masih Error:

### Cek Log Terminal:

- Lihat pesan error di VS Code terminal
- Cari tahu kolom mana yang masih missing

### Cek Database:

```sql
-- Cek struktur tabel
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'interview_sessions'
ORDER BY ordinal_position;
```

### Alternative SQL (jika yang atas gagal):

```sql
-- Cek apakah kolom sudah ada
SELECT COUNT(*) as column_exists
FROM information_schema.columns
WHERE table_name = 'interview_sessions'
AND column_name = 'totalScore';

-- Jika hasil = 0, kolom belum ada
-- Jika hasil = 1, kolom sudah ada
```

---

## 🚀 Fitur yang Sudah Diperbaiki:

1. ✅ **API GET session** - Tidak crash jika kolom missing
2. ✅ **API POST submit** - Fallback ke basic fields jika gagal
3. ✅ **Error handling** - Retry logic untuk update session
4. ✅ **Database script** - Tambah kolom yang hilang

---

## 📋 Status Database Schema:

### Kolom Wajib di `interview_sessions`:

- ✅ `id` (UUID, Primary Key)
- ✅ `applicantId` (UUID, Foreign Key)
- ✅ `interviewerId` (UUID, Foreign Key)
- ✅ `interviewDate` (Timestamp)
- ✅ `location` (Text)
- ✅ `status` (Text)
- ✅ `notes` (Text)
- ✅ `created_at` (Timestamp)
- ✅ `updated_at` (Timestamp)

### Kolom Tambahan (yang ditambahkan):

- 🔧 `totalScore` (Integer) - **BARU**
- 🔧 `recommendation` (Text) - **BARU**
- 🔧 `assignment_id` (UUID) - **BARU**

---

**CATATAN:** Setelah menjalankan script SQL di atas, sistem edit wawancara akan berfungsi normal kembali! 🎉
