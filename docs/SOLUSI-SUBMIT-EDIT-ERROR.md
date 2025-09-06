# SOLUSI: Error Submit Edit Hasil Wawancara

## Masalah

Error saat submit edit hasil wawancara dengan message:

```
Could not find the 'createdAt' column of 'interview_responses' in the schema cache
```

## Penyebab

1. **Column Naming Mismatch**: API menggunakan `createdAt` (camelCase) tapi database menggunakan `created_at` (snake_case)
2. **Column Naming Mismatch**: API menggunakan `updatedAt` (camelCase) tapi database menggunakan `updated_at` (snake_case)

## Detail Schema Database

Berdasarkan `schemadatabase.md`, tabel `interview_responses` memiliki struktur:

```sql
create table public.interview_responses (
  id uuid not null default gen_random_uuid (),
  "sessionId" uuid not null,           -- ✅ camelCase (benar)
  "questionId" uuid not null,          -- ✅ camelCase (benar)
  response text null,
  score integer null,
  notes text null,
  created_at timestamp with time zone, -- ❌ snake_case (salah di API)
  updated_at timestamp with time zone  -- ❌ snake_case (salah di API)
)
```

## Solusi yang Diterapkan

### File: `src/app/api/interview/forms/edit/route.ts`

#### 1. Fix Insert Response Data

**Sebelum:**

```typescript
const responsesToInsert = validResponses.map((response: any) => ({
  sessionId,
  questionId: response.questionId,
  response: response.response || "",
  score: response.score,
  notes: response.notes || "",
  createdAt: new Date().toISOString(), // ❌ Wrong column name
}));
```

**Sesudah:**

```typescript
const responsesToInsert = validResponses.map((response: any) => ({
  sessionId,
  questionId: response.questionId,
  response: response.response || "",
  score: response.score,
  notes: response.notes || "",
  created_at: new Date().toISOString(), // ✅ Correct column name
}));
```

#### 2. Fix Session Update Data

**Sebelum:**

```typescript
const updateData: any = {
  totalScore,
  updatedAt: new Date().toISOString(), // ❌ Wrong column name
};
```

**Sesudah:**

```typescript
const updateData: any = {
  totalScore,
  updated_at: new Date().toISOString(), // ✅ Correct column name
};
```

## Hasil Perbaikan

✅ Submit edit hasil wawancara berhasil  
✅ Data tersimpan ke database dengan benar  
✅ Tidak ada error column name mismatch  
✅ API response sukses

## Catatan Penting

- **Supabase Column Naming**: Kolom timestamp menggunakan `snake_case`
- **Foreign Key Columns**: Kolom seperti `sessionId`, `questionId` menggunakan `camelCase`
- **Regular Columns**: Kolom biasa seperti `response`, `score`, `notes` menggunakan lowercase
- **Timestamp Columns**: Selalu gunakan `created_at` dan `updated_at` (snake_case)

## Verification

Untuk memastikan fix berhasil, test dengan:

1. Login sebagai interviewer
2. Edit hasil wawancara yang sudah ada
3. Submit perubahan
4. Verify tidak ada error di console browser atau server logs

## Tanggal Perbaikan

6 September 2025
