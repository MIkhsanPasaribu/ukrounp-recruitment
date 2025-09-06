# SOLUSI: Error Riwayat Wawancara Setelah Submit Edit

## Masalah

Setelah berhasil submit edit hasil wawancara, muncul error saat mengambil riwayat wawancara:

```
Error: Gagal mengambil riwayat wawancara
at InterviewerApiService.getInterviewHistory
```

## Penyebab

API riwayat wawancara (`/api/interview/history`) menggunakan **column naming yang salah**:

### Masalah Column Naming

1. **SELECT query**: menggunakan `createdAt`, `updatedAt` (camelCase)
2. **ORDER BY clause**: menggunakan `createdAt` (camelCase)
3. **Database**: menggunakan `created_at`, `updated_at` (snake_case)
4. **Missing columns**: tidak include kolom baru seperti `interviewerName`, `assignment_id`

## Solusi yang Diterapkan

### File: `src/app/api/interview/history/route.ts`

#### 1. Fix SELECT Query

**Sebelum:**

```typescript
.select(`
  id,
  applicantId,
  interviewDate,
  location,
  status,
  totalScore,
  recommendation,
  createdAt,        // ❌ Wrong column name
  updatedAt,        // ❌ Wrong column name
  applicants!inner(...)
`)
```

**Sesudah:**

```typescript
.select(`
  id,
  applicantId,
  interviewerId,    // ✅ Added missing column
  interviewDate,
  location,
  status,
  totalScore,
  recommendation,
  interviewerName,  // ✅ Added new column
  assignment_id,    // ✅ Added new column
  notes,           // ✅ Added missing column
  created_at,      // ✅ Correct column name
  updated_at,      // ✅ Correct column name
  applicants!inner(...)
`)
```

#### 2. Fix ORDER BY Clause

**Sebelum:**

```typescript
.order("createdAt", { ascending: false })  // ❌ Wrong column name
```

**Sesudah:**

```typescript
.order("created_at", { ascending: false }) // ✅ Correct column name
```

## Database Schema Reference

```sql
interview_sessions:
- created_at timestamp with time zone    -- ✅ snake_case
- updated_at timestamp with time zone    -- ✅ snake_case
- interviewerId uuid                     -- ✅ camelCase
- applicantId uuid                       -- ✅ camelCase
- interviewerName text                   -- ✅ camelCase (new column)
- assignment_id uuid                     -- ✅ snake_case (new column)
```

## Hasil Perbaikan

✅ Riwayat wawancara berhasil dimuat setelah submit edit  
✅ Tidak ada error column name mismatch  
✅ Semua kolom baru tersedia di response  
✅ Pagination dan filter status berjalan normal  
✅ Dashboard interviewer kembali normal

## Kolom Baru yang Tersedia

- `interviewerName`: Nama pewawancara dari form input
- `assignment_id`: Referensi ke interviewer assignment
- `notes`: Catatan tambahan session
- `interviewerId`: ID pewawancara (sebelumnya missing)

## Testing

Gunakan script `scripts/test-interview-history-fix.js` untuk testing di browser console.

## Flow yang Sudah Diperbaiki

1. ✅ Submit edit hasil wawancara → sukses
2. ✅ Refresh dashboard → riwayat wawancara berhasil dimuat
3. ✅ Filter status → berjalan normal
4. ✅ Pagination → berjalan normal
5. ✅ Detail session → data lengkap tersedia

## Tanggal Perbaikan

6 September 2025
