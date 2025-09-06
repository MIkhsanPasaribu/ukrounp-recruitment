# Quick Start Guide - Enhanced Interviewer Dashboard

## Fitur Baru yang Ditambahkan

### 1. Enhanced Dashboard dengan Tab Navigation

- **Tab "Daftar Peserta"**: Menampilkan semua kandidat yang perlu diwawancarai
- **Tab "Riwayat Wawancara"**: Menampilkan semua wawancara yang sudah dilakukan

### 2. Fitur Edit Hasil Wawancara

- Interviewer dapat mengedit hasil wawancara yang sudah selesai
- Validasi keamanan memastikan hanya pemilik sesi yang dapat mengedit
- Form pre-populated dengan jawaban sebelumnya

### 3. Action Buttons Baru

- **Buat Sesi**: Untuk kandidat yang belum ada sesi wawancara
- **Edit Hasil**: Untuk wawancara yang sudah selesai
- **Download PDF**: Download hasil wawancara dalam format PDF

## Cara Menguji Fitur

### 1. Setup Development Environment

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Edit .env.local dengan database credentials yang benar
# DATABASE_URL="postgresql://username:password@localhost:5432/recruitment"
# SUPABASE_URL="your-supabase-url"
# SUPABASE_ANON_KEY="your-supabase-anon-key"

# Run development server
npm run dev
```

### 2. Login sebagai Interviewer

1. Buka `http://localhost:3000/interview`
2. Login menggunakan salah satu dari 7 akun interviewer:
   - Username: `pewawancara1` - `pewawancara7`
   - Password: (sesuai yang ada di database)

### 3. Test Enhanced Dashboard

#### Tab Daftar Peserta:

1. ✅ Lihat list kandidat dengan status interview
2. ✅ Gunakan fitur search untuk mencari kandidat
3. ✅ Test pagination jika ada banyak data
4. ✅ Klik "Buat Sesi Wawancara" untuk kandidat baru
5. ✅ Klik "Mulai Wawancara" untuk memulai wawancara
6. ✅ Selesaikan wawancara dan lihat status berubah

#### Tab Riwayat Wawancara:

1. ✅ Lihat semua wawancara yang sudah dilakukan
2. ✅ Cek informasi skor dan rekomendasi
3. ✅ Test "Download PDF" untuk wawancara selesai
4. ✅ Test "Edit Hasil" untuk mengubah jawaban

### 4. Test Fitur Edit

1. **Pilih wawancara yang sudah selesai** dari tab Riwayat
2. **Klik "Edit Hasil"**
3. **Verifikasi form pre-populated** dengan jawaban sebelumnya
4. **Ubah beberapa jawaban dan skor**
5. **Simpan perubahan**
6. **Verifikasi perubahan tersimpan** dengan download PDF baru

### 5. Test API Endpoints (Menggunakan test script)

```bash
# Install axios untuk testing
npm install axios

# Set environment variables untuk testing
export TEST_INTERVIEWER_USERNAME="pewawancara1"
export TEST_INTERVIEWER_PASSWORD="your_password"
export NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Run automated tests
node test-enhanced-dashboard.js
```

## Troubleshooting

### Masalah Umum:

1. **"Session not found" error**

   - Pastikan sessionId valid dan dimiliki oleh interviewer yang login
   - Check database apakah data session ada

2. **"Unauthorized" error**

   - Pastikan token JWT masih valid
   - Re-login jika token expired

3. **Form tidak ter-populate saat edit**

   - Check API `/api/interview/sessions/[sessionId]` apakah return data
   - Verifikasi responses sudah tersimpan di database

4. **PDF download gagal**
   - Check apakah wawancara statusnya COMPLETED
   - Verifikasi session memiliki responses

### Database Checks:

```sql
-- Check interview sessions
SELECT id, status, totalScore, recommendation
FROM interview_sessions
WHERE interviewerId = 'interviewer-id';

-- Check interview responses
SELECT sessionId, questionId, score, response
FROM interview_responses
WHERE sessionId = 'session-id';

-- Check interviewer accounts
SELECT id, username, fullName, isActive
FROM interviewers;
```

## API Endpoints yang Ditambahkan

### 1. Edit Interview Form

```
PUT /api/interview/forms/edit
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "session-id",
  "responses": [...],
  "sessionNotes": "Updated notes",
  "recommendation": "DIREKOMENDASIKAN"
}
```

### 2. Session Details

```
GET /api/interview/sessions/[sessionId]
Authorization: Bearer <token>

Response: {
  "success": true,
  "data": {
    "session": {...},
    "questions": [...]
  }
}
```

## Security Features

1. **Authentication**: Semua endpoint memerlukan JWT token
2. **Authorization**: Interviewer hanya bisa akses session miliknya
3. **Validation**: Data input divalidasi sebelum disimpan
4. **Audit Trail**: Semua edit tercatat dengan timestamp

## Performance Considerations

1. **Pagination**: Dashboard menggunakan pagination untuk handling data besar
2. **Lazy Loading**: Tab content dimuat sesuai kebutuhan
3. **Caching**: Response data di-cache untuk mengurangi API calls
4. **Debouncing**: Search menggunakan debouncing untuk efisiensi

## Monitoring & Logging

Check console logs untuk debug information:

- 🔐 Authentication events
- 📝 Form submissions
- ✏️ Edit operations
- 📄 PDF generations
- ❌ Error conditions

## Next Steps

1. **Production Deployment**: Deploy ke environment production
2. **User Training**: Training untuk 7 pewawancara
3. **Monitoring Setup**: Setup monitoring untuk track usage
4. **Backup Strategy**: Implement backup untuk interview data
5. **Performance Optimization**: Monitor dan optimize query performance
