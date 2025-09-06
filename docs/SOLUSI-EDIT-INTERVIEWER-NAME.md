# SOLUSI: Nama Pewawancara di Edit Tidak Tersimpan

## Masalah

Ketika edit hasil wawancara, nama pewawancara yang diisi di form tidak tersimpan. Akibatnya:

1. PDF hasil wawancara masih menampilkan nama akun (contoh: "Pewawancara 1")
2. Nama pewawancara di database tidak terupdate saat edit

## Penyebab

API edit (`/api/interview/forms/edit`) **tidak menerima dan tidak menyimpan** `interviewerName` dari form edit, meskipun:

- ✅ Komponen form sudah mengirim `interviewerName`
- ✅ TypeScript interface `InterviewFormSubmit` sudah include `interviewerName`
- ✅ Database sudah punya kolom `interviewerName`

## Detail Masalah

### API Edit Route (`/api/interview/forms/edit`)

**Sebelum perbaikan:**

```typescript
// ❌ Tidak menerima interviewerName
const { sessionId, responses, sessionNotes, recommendation } =
  await request.json();

// ❌ Tidak menyimpan interviewerName
const updateData: any = {
  totalScore,
  updated_at: new Date().toISOString(),
};

if (sessionNotes !== undefined) {
  updateData.notes = sessionNotes;
}

if (recommendation !== undefined) {
  updateData.recommendation = recommendation;
}
// ❌ interviewerName tidak disimpan
```

## Solusi yang Diterapkan

### File: `src/app/api/interview/forms/edit/route.ts`

#### 1. Menerima interviewerName dari Request

**Sebelum:**

```typescript
const { sessionId, responses, sessionNotes, recommendation } =
  await request.json();
```

**Sesudah:**

```typescript
const { sessionId, responses, sessionNotes, recommendation, interviewerName } =
  await request.json();
```

#### 2. Menyimpan interviewerName ke Database

**Sebelum:**

```typescript
const updateData: any = {
  totalScore,
  updated_at: new Date().toISOString(),
};

if (sessionNotes !== undefined) {
  updateData.notes = sessionNotes;
}

if (recommendation !== undefined) {
  updateData.recommendation = recommendation;
}
// ❌ interviewerName tidak disimpan
```

**Sesudah:**

```typescript
const updateData: any = {
  totalScore,
  updated_at: new Date().toISOString(),
};

if (sessionNotes !== undefined) {
  updateData.notes = sessionNotes;
}

if (recommendation !== undefined) {
  updateData.recommendation = recommendation;
}

// ✅ Save interviewer name from form
if (interviewerName && interviewerName.trim()) {
  updateData.interviewerName = interviewerName.trim();
}
```

#### 3. Menambahkan Logging untuk Debug

```typescript
console.log("✏️ Editing interview responses:", {
  sessionId,
  interviewerId: interviewer.id,
  interviewerUsername: interviewer.username,
  responsesCount: responses?.length || 0,
  hasInterviewerName: !!interviewerName, // ✅ Added debug info
});
```

## Komponen yang Sudah Benar (Tidak Perlu Diubah)

### ✅ InterviewForm Component

- Sudah mengirim `interviewerName` untuk edit dan submit
- Sudah load `interviewerName` dari database saat editing

### ✅ InterviewerApi Service

- Sudah menggunakan tipe `InterviewFormSubmit` yang include `interviewerName`

### ✅ TypeScript Types

- Interface `InterviewFormSubmit` sudah include `interviewerName?: string`

### ✅ PDF Generation

- Sudah menggunakan `sessionData.interviewerName` dengan fallback ke account name

## Hasil Perbaikan

✅ Edit hasil wawancara → `interviewerName` tersimpan ke database  
✅ PDF hasil wawancara → menampilkan nama dari form, bukan nama akun  
✅ Riwayat wawancara → `interviewerName` tersedia di data  
✅ Debug logging → menampilkan info `interviewerName`

## Flow yang Sudah Diperbaiki

1. ✅ Interviewer isi nama di form edit
2. ✅ Frontend kirim `interviewerName` ke API edit
3. ✅ **API edit terima dan simpan `interviewerName`** (DIPERBAIKI)
4. ✅ Database update dengan nama dari form
5. ✅ PDF generation ambil nama dari database
6. ✅ PDF menampilkan nama pewawancara sesuai form

## Testing

Untuk test fix ini:

1. Edit hasil wawancara yang sudah ada
2. Isi nama pewawancara di form
3. Submit edit
4. Download PDF → nama pewawancara sesuai form input
5. Check database → `interviewerName` tersimpan

## Tanggal Perbaikan

6 September 2025
