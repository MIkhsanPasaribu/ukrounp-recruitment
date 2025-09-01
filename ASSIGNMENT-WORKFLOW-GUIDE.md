# Panduan Penggunaan Fitur Assignment Wawancara

## Cara Menugaskan Peserta Dummy ke Pewawancara 1-7

### 1. Persiapan Data

Pertama, pastikan Anda memiliki:

- Peserta dummy dengan status yang bisa diubah ke INTERVIEW
- Pewawancara dengan username pewawancara1, pewawancara2, dst.

### 2. Langkah-langkah di Admin Dashboard

#### A. Konfirmasi Kehadiran Peserta

1. Buka Admin Dashboard
2. Pilih tab "Interviews"
3. Masukkan NIM peserta dummy di field "NIM Peserta"
4. Klik "Konfirmasi Kehadiran"
5. Status peserta akan berubah menjadi INTERVIEW dan attendanceConfirmed = true

#### B. Menugaskan Pewawancara

1. Masih di tab "Interviews"
2. Pilih peserta dari dropdown "Pilih Peserta"
3. Pilih pewawancara dari dropdown "Pilih Pewawancara" (pewawancara1-7)
4. Klik "Tugaskan Pewawancara"
5. Peserta akan ditugaskan ke pewawancara yang dipilih

### 3. Alternatif: Menggunakan SQL Script

Jika ingin langsung via database, jalankan script `assign-dummy-to-interviewers.sql`:

```sql
-- Ubah status peserta ke INTERVIEW terlebih dahulu
UPDATE applicants
SET
    status = 'INTERVIEW',
    attendanceConfirmed = true,
    checkedInAt = NOW(),
    updatedAt = NOW()
WHERE nim = 'NIM_PESERTA_DUMMY_ANDA';

-- Tugaskan ke pewawancara1
UPDATE applicants
SET
    assignedInterviewer = 'pewawancara1',
    interviewStatus = 'ASSIGNED',
    updatedAt = NOW()
WHERE id IN (
    SELECT TOP 1 id
    FROM applicants
    WHERE status = 'INTERVIEW'
        AND (assignedInterviewer IS NULL OR assignedInterviewer = '')
);
```

### 4. Verifikasi Assignment

#### Cek via Admin Dashboard:

- Tab "Interviews" akan menampilkan peserta yang sudah ditugaskan
- Status akan berubah menjadi "ASSIGNED"

#### Cek via Database:

```sql
SELECT id, nim, fullName, status, attendanceConfirmed, assignedInterviewer, interviewStatus
FROM applicants
WHERE assignedInterviewer IS NOT NULL;
```

### 5. Test Login Pewawancara

1. Buka halaman `/login`
2. Toggle ke "Login Pewawancara"
3. Login dengan username dan password pewawancara
4. Dashboard pewawancara akan menampilkan peserta yang ditugaskan

### 6. Endpoint API yang Tersedia

- **POST** `/api/admin/interview-workflow`

  - Action: `mark_attendance` (dengan parameter `nim`)
  - Action: `assign_interviewer` (dengan parameter `applicantId` dan `interviewerId`)

- **GET** `/api/interview/applications`
  - Menampilkan peserta yang ditugaskan ke pewawancara yang login
  - Filter berdasarkan `assignedInterviewer` dan `attendanceConfirmed`

### 7. Troubleshooting

#### Peserta tidak muncul di dashboard pewawancara:

- Pastikan `attendanceConfirmed = true`
- Pastikan `assignedInterviewer` sesuai dengan username pewawancara
- Pastikan status peserta = 'INTERVIEW'

#### Error saat assignment:

- Cek apakah pewawancara dengan username tersebut ada di database
- Cek apakah peserta dengan ID tersebut ada dan valid

#### Build error:

- Pastikan tidak ada unused variables di file API
- Jalankan `npm run build` untuk memverifikasi

### 8. Status Flow

```
REGISTERED → INTERVIEW (via mark_attendance) → ASSIGNED (via assign_interviewer)
```

### 9. Database Schema Terkait

```sql
-- Kolom penting di tabel applicants:
- status: 'REGISTERED' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED'
- attendanceConfirmed: boolean
- assignedInterviewer: string (username pewawancara)
- interviewStatus: 'PENDING' | 'ASSIGNED' | 'COMPLETED'
- checkedInAt: timestamp
```

## Cara Cepat Test Assignment

1. **Jalankan build untuk memastikan tidak ada error:**

   ```bash
   npm run build
   ```

2. **Jalankan development server:**

   ```bash
   npm run dev
   ```

3. **Buka admin dashboard dan test workflow:**

   - Login sebagai admin
   - Pilih tab "Interviews"
   - Test konfirmasi kehadiran dan assignment

4. **Test login pewawancara:**
   - Logout admin
   - Login sebagai pewawancara
   - Cek apakah peserta muncul di dashboard

Dengan mengikuti panduan ini, Anda dapat menugaskan peserta dummy ke pewawancara 1-7 dan memverifikasi bahwa sistem assignment bekerja dengan baik.
