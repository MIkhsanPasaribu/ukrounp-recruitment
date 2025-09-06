# SOLUSI: PDF Download Error - Missing interviewerName

## Masalah

Route `/api/interview/download-pdf/[sessionId]` mengalami error karena mencoba mengakses `session.interviewerName` tetapi kolom tersebut tidak di-include dalam SELECT query Supabase.

## Error Details

```
Property 'interviewerName' does not exist on type '{ id: any; applicantId: any; interviewerId: any; ... }'
```

## Penyebab

1. Query Supabase di `/api/interview/download-pdf/[sessionId]/route.ts` tidak menyertakan kolom `interviewerName` yang baru ditambahkan
2. TypeScript tidak mengenali property baru karena tidak ada di query result type

## Solusi yang Diterapkan

### 1. Update Supabase Query

```sql
SELECT
  id,
  applicantId,
  interviewerId,
  interviewDate,
  location,
  status,
  notes,
  created_at,
  interviewerName,      -- ✅ DITAMBAHKAN
  totalScore,           -- ✅ DITAMBAHKAN
  recommendation,       -- ✅ DITAMBAHKAN
  assignment_id,        -- ✅ DITAMBAHKAN
  applicants!inner(...),
  interviewers!inner(...)
```

### 2. Type Assertion untuk TypeScript

```typescript
// Type assertion to include new fields
const sessionData = session as typeof session & {
  interviewerName?: string;
  totalScore?: number;
  recommendation?: string;
  assignment_id?: string;
};
```

### 3. Update References

Mengganti semua reference dari `session.xxx` menjadi `sessionData.xxx`:

- `sessionData.interviewerName`
- `sessionData.notes`
- `sessionData.location`
- `sessionData.status`
- dll.

## File yang Diubah

- `src/app/api/interview/download-pdf/[sessionId]/route.ts`

## Hasil

✅ PDF dapat di-generate tanpa error  
✅ Nama pewawancara ditampilkan sesuai input form  
✅ Semua kolom baru dapat diakses dengan aman  
✅ TypeScript compilation bersih

## Testing

Gunakan script `scripts/test-pdf-download.js` untuk testing browser console.

## Tanggal Perbaikan

6 September 2025
