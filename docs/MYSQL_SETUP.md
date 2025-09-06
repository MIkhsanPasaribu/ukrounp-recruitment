# Setup MySQL Database untuk UKRO Recruitment Platform

## Prerequisites

1. MySQL Server (XAMPP, WAMP, atau MySQL standalone)
2. phpMyAdmin atau MySQL Workbench
3. Node.js dan npm

## Langkah Setup Database

### 1. Buat Database

Buka phpMyAdmin atau MySQL command line dan jalankan:

```sql
CREATE DATABASE IF NOT EXISTS robotik_oprec;
```

### 2. Import Schema

Jalankan file `database-setup-mysql.sql` yang ada di root project:

**Via phpMyAdmin:**

1. Buka phpMyAdmin
2. Pilih database `robotik_oprec`
3. Klik tab "Import"
4. Pilih file `database-setup-mysql.sql`
5. Klik "Go"

**Via Command Line:**

```bash
mysql -u root -p robotik_oprec < database-setup-mysql.sql
```

### 3. Konfigurasi Environment Variables

Copy `.env.example` ke `.env.local` dan sesuaikan:

```bash
# Database Configuration (MySQL)
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=robotik_oprec

# Admin Password
PASSWORD_ADMIN=ukrokmunp
```

### 4. Test Koneksi

Jalankan aplikasi untuk memastikan koneksi berhasil:

```bash
npm run dev
```

Aplikasi akan tersedia di http://localhost:3000

## Struktur Database

### Tabel `applicants`

Menyimpan data lengkap pendaftar termasuk:

- Data personal (nama, email, fakultas, dll)
- Software proficiency
- Upload dokumen (dalam format base64)
- Status aplikasi
- Timestamp submission

### Tabel `settings`

Menyimpan konfigurasi aplikasi seperti:

- Status registrasi (buka/tutup)
- Maksimal aplikasi
- Deadline pendaftaran

## Migrasi dari Supabase

Jika sebelumnya menggunakan Supabase, data dapat di-export dalam format SQL dan diimpor ke MySQL dengan penyesuaian:

1. Export data dari Supabase
2. Konversi format dari PostgreSQL ke MySQL
3. Sesuaikan field types dan constraints
4. Import ke database MySQL baru

## Backup dan Restore

### Backup Database

```bash
mysqldump -u root -p robotik_oprec > backup_robotik_oprec.sql
```

### Restore Database

```bash
mysql -u root -p robotik_oprec < backup_robotik_oprec.sql
```

## Troubleshooting

### Error: Access denied for user

- Pastikan username dan password MySQL benar
- Pastikan user memiliki privilege ke database

### Error: Database tidak ditemukan

- Pastikan database `robotik_oprec` sudah dibuat
- Cek nama database di environment variables

### Error: Connection timeout

- Pastikan MySQL server sudah running
- Cek konfigurasi host dan port
