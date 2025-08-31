# SISTEM WAWANCARA UKRO - DOKUMENTASI LENGKAP

## 📋 OVERVIEW SISTEM

Sistem wawancara UKRO adalah modul lengkap yang memungkinkan 7 pewawancara untuk melakukan wawancara terstruktur kepada peserta yang telah lolos ke tahap interview.

## 🎯 FITUR UTAMA

### 1. **Autentikasi Pewawancara**

- 7 akun pewawancara (6 pewawancara + 1 ketua pewawancara)
- Username: `pewawancara1` - `pewawancara6`, `ketuapewawancara`
- Password: `admin123` (untuk semua akun)
- Session token dengan durasi 8 jam
- Cookie-based authentication untuk keamanan

### 2. **Dashboard Pewawancara**

- Pencarian peserta berdasarkan nama, email, NIM, NIA
- Filter peserta dengan status "interview"
- Pagination untuk navigasi data
- Informasi status wawancara setiap peserta
- Aksi untuk membuat sesi wawancara baru

### 3. **Form Wawancara Terstruktur**

- 11 pertanyaan standar yang telah dikategorikan:
  1. Pengenalan diri dan motivasi
  2. Pengetahuan tentang UKRO
  3. Manajemen waktu
  4. Pengalaman teamwork
  5. Self assessment
  6. Problem solving
  7. Ekspektasi
  8. Kontribusi untuk UKRO
  9. Prestasi dan proyek
  10. Stress management
  11. Future planning

### 4. **Sistem Penilaian**

- Skala penilaian 1-5 untuk setiap pertanyaan:
  - 1 = Buruk
  - 2 = Kurang
  - 3 = Cukup
  - 4 = Baik
  - 5 = Sangat Baik
- Catatan untuk setiap pertanyaan
- Catatan umum wawancara
- Rekomendasi akhir (Sangat Direkomendasikan, Direkomendasikan, Cukup, Tidak Direkomendasikan)

### 5. **Ekspor PDF**

- Download formulir wawancara dalam format PDF
- Berisi data peserta, pertanyaan & jawaban, penilaian, dan rekomendasi
- Nama file otomatis sesuai nama peserta

### 6. **Riwayat Wawancara**

- Daftar semua sesi wawancara yang telah dilakukan
- Status wawancara (Scheduled, In Progress, Completed, Cancelled)
- Summary statistik wawancara

## 🗄️ DATABASE SCHEMA

### Tabel Utama:

1. **interviewers** - Data pewawancara
2. **interview_sessions** - Sesi wawancara
3. **interview_questions** - 11 pertanyaan standar
4. **interview_responses** - Jawaban dan penilaian
5. **interviewer_tokens** - Session tokens

### Enum Types:

- **InterviewerRole**: INTERVIEWER, HEAD_INTERVIEWER
- **InterviewStatus**: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
- **InterviewRecommendation**: SANGAT_DIREKOMENDASIKAN, DIREKOMENDASIKAN, CUKUP, TIDAK_DIREKOMENDASIKAN

## 🚀 CARA IMPLEMENTASI

### 1. **Setup Database**

```sql
-- Jalankan file database-migration-interview.sql di Supabase SQL Editor
-- File ini akan membuat semua tabel, enum, dan data awal
```

### 2. **Update Prisma Schema**

```bash
# Prisma schema sudah diupdate, jalankan generate
npx prisma generate
```

### 3. **Akses Sistem**

```
URL: /interview
Username: pewawancara1, pewawancara2, ..., ketuapewawancara
Password: admin123
```

## 📁 STRUKTUR FILE

### Backend (API Routes):

```
src/app/api/interview/
├── auth/
│   ├── login/route.ts          # Login pewawancara
│   └── logout/route.ts         # Logout pewawancara
├── applications/route.ts        # Daftar peserta interview
├── sessions/route.ts           # Buat sesi wawancara
├── forms/
│   ├── route.ts                # Ambil form wawancara
│   └── submit/route.ts         # Submit hasil wawancara
├── download-pdf/
│   └── [sessionId]/route.ts    # Download PDF
└── history/route.ts            # Riwayat wawancara
```

### Frontend (Components):

```
src/components/interview/
├── InterviewerLogin.tsx        # Login page
├── InterviewerDashboard.tsx    # Dashboard utama
└── InterviewForm.tsx           # Form wawancara

src/app/interview/
└── page.tsx                    # Main page
```

### Services & Utils:

```
src/lib/
├── auth-interviewer.ts         # Auth logic pewawancara
└── auth-interviewer-middleware.ts  # Middleware protection

src/services/
└── interviewerApi.ts           # API service

src/hooks/
└── useInterviewerAuth.ts       # Auth hook

src/types/
└── interview.ts                # Type definitions
```

## 🔐 KEAMANAN

1. **JWT Authentication** dengan expiry 8 jam
2. **HttpOnly Cookies** untuk session management
3. **Middleware protection** untuk semua API routes
4. **Input validation** di backend dan frontend
5. **CORS protection** dan secure headers

## 📊 FLOW WAWANCARA

1. **Login** pewawancara ke sistem
2. **Cari peserta** dengan status "interview"
3. **Buat sesi wawancara** untuk peserta yang dipilih
4. **Mulai wawancara** dengan mengisi form 11 pertanyaan
5. **Berikan penilaian** 1-5 untuk setiap jawaban
6. **Tambahkan catatan** dan rekomendasi
7. **Simpan hasil** wawancara
8. **Download PDF** formulir wawancara

## 🎨 UI/UX FEATURES

- **Responsive design** untuk desktop dan mobile
- **Loading states** dan error handling
- **Real-time validation** input form
- **Color-coded scoring** untuk penilaian
- **Progressive disclosure** untuk form yang panjang
- **Breadcrumb navigation** antar halaman

## 📈 ANALYTICS & REPORTING

- Total sesi wawancara per pewawancara
- Distribusi skor penilaian
- Rekomendasi summary
- Status completion rate

## 🔧 MAINTENANCE

### Menambah Pertanyaan Baru:

```sql
INSERT INTO interview_questions (questionNumber, questionText, category)
VALUES (12, 'Pertanyaan baru?', 'KATEGORI_BARU');
```

### Menambah Pewawancara:

```sql
INSERT INTO interviewers (username, email, passwordHash, fullName, role)
VALUES ('pewawancara8', 'pewawancara8@ukro.com', '[hash]', 'Pewawancara Delapan', 'INTERVIEWER');
```

## ✅ STATUS IMPLEMENTASI

### ✅ SELESAI:

- Database schema dan migration
- Authentication system
- API endpoints lengkap
- Frontend components
- PDF export functionality
- Type definitions
- Error handling

### 📋 TODO (Optional):

- Email notifications
- Advanced analytics
- Bulk interview scheduling
- Interview calendar integration
- Real-time collaboration

## 🚦 TESTING

### Akun Test:

- Username: `pewawancara1`
- Password: `admin123`
- Email: `pewawancara1@ukro.com`

### Test Flow:

1. Login ke `/interview`
2. Cari peserta dengan status "interview"
3. Buat sesi wawancara
4. Isi form wawancara dengan 11 pertanyaan
5. Submit dan download PDF

---

**Sistem wawancara UKRO siap digunakan dengan fitur lengkap dalam Bahasa Indonesia! 🎉**
