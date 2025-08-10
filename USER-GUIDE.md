# 📖 UKRO Recruitment System - User Guide

## 🎯 Overview

Sistem Rekrutmen UKRO adalah aplikasi web lengkap untuk mengelola pendaftaran dan rekrutmen anggota organisasi. Aplikasi ini menyediakan interface untuk pendaftar dan dashboard admin yang komprehensif.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MySQL database
- phpMyAdmin (optional)

### Installation

```bash
npm install
```

### Environment Setup

Create `.env.local`:

```env
MYSQL_HOST=localhost
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=ukro_recruitment
ADMIN_PASSWORD=your_admin_password
```

### Database Setup

```bash
# Import database schema
mysql -u username -p ukro_recruitment < database-setup-mysql.sql
```

### Run Application

```bash
npm run dev
```

Visit: http://localhost:3000

## 👥 User Guide

### 📝 Pendaftaran Online

1. **Akses Form Pendaftaran**

   - Kunjungi `/form`
   - Form terdiri dari 2 bagian

2. **Bagian 1: Data Personal**

   - Nama lengkap
   - Email
   - Nomor HP
   - Jenis kelamin
   - Tanggal lahir
   - Alamat lengkap

3. **Bagian 2: Data Tambahan**

   - Program studi
   - Angkatan
   - Upload pasfoto 3x4
   - Motivasi bergabung

4. **Submit Pendaftaran**
   - Review data
   - Klik "Kirim Pendaftaran"
   - Dapatkan confirmation message

### 🔍 Cek Status Pendaftaran

1. **Akses Status Check**

   - Kunjungi `/status`
   - Masukkan email pendaftaran
   - Masukkan tanggal lahir

2. **Download Formulir**
   - Setelah verifikasi berhasil
   - Klik "Download PDF"
   - Dapatkan formulir pendaftaran

## 👨‍💼 Admin Guide

### 🔐 Akses Admin Dashboard

1. **Login Admin**
   - Kunjungi `/admin`
   - Masukkan password admin
   - Akses dashboard

### 📊 Dashboard Features

#### **Statistik Pendaftar**

- Total pendaftar
- Status breakdown (Menunggu/Diterima/Ditolak)
- Chart visualisasi
- Filter berdasarkan periode

#### **Manajemen Pendaftar**

- List semua pendaftar
- Paginasi (10 per halaman)
- Search dan filter
- Sort berdasarkan tanggal

#### **Detail Pendaftar**

- Klik nama untuk melihat detail
- Modal dengan informasi lengkap
- Pasfoto pendaftar
- Download PDF formulir
- Update status pendaftaran
- Hapus pendaftaran

### 📄 Download & Export

#### **Download Individual**

1. Buka detail pendaftar
2. Klik "Download PDF"
3. File: `formulir-pendaftaran-nama.pdf`

#### **Bulk Download**

1. Klik "Download Semua PDF" di header
2. Tunggu proses generate ZIP
3. Download file ZIP dengan semua PDF

### ⚙️ Pengaturan

#### **Status Pendaftaran**

- Toggle "Buka Pendaftaran" / "Tutup Pendaftaran"
- Mengatur apakah form pendaftaran aktif

#### **Manajemen Status Pendaftar**

- **Menunggu**: Status default
- **Diterima**: Pendaftar diterima
- **Ditolak**: Pendaftar ditolak

## 🖼️ Upload Foto Guidelines

### **Spesifikasi Foto**

- Format: JPEG, PNG, WebP
- Ukuran: Maksimal 10MB
- Rasio: 3:4 (pasfoto)
- Resolusi: Minimal 300x400px

### **Kompresi Otomatis**

- Sistem otomatis mengkompresi foto
- Kualitas tetap terjaga
- Ukuran file dikurangi untuk database

### **Troubleshooting**

- Jika upload gagal, coba foto dengan ukuran lebih kecil
- Pastikan format file didukung
- Check koneksi internet

## 📄 PDF Generator

### **Format Dokumen**

- Kop surat resmi UKRO
- Font Times New Roman
- Layout profesional
- Margin yang tepat

### **Konten PDF**

- Data personal lengkap
- Pasfoto pendaftar
- Informasi program studi
- Motivasi bergabung
- Format surat resmi

### **Nama File**

- Format: `formulir-pendaftaran-{nama}.pdf`
- Contoh: `formulir-pendaftaran-john-doe.pdf`

## 🔧 Technical Features

### **Security**

- Input validation
- SQL injection protection
- XSS prevention
- File upload security

### **Performance**

- Image compression
- Database optimization
- Lazy loading
- Code splitting

### **Responsive Design**

- Mobile-first approach
- Touch-friendly interface
- Cross-browser compatibility

## 🌐 API Endpoints

### **Public APIs**

```
POST /api/submit              # Submit pendaftaran
POST /api/status              # Check status
POST /api/download-confirmation-pdf # Download PDF
```

### **Admin APIs**

```
GET  /api/admin/applications     # List pendaftar
GET  /api/admin/statistics       # Statistik
GET  /api/admin/download-pdf/[id] # Download PDF
GET  /api/admin/bulk-download-pdf # Bulk ZIP download
POST /api/admin/update-status    # Update status
DELETE /api/admin/delete-application # Hapus pendaftar
```

## 🔄 Workflow Diagram

```
Pendaftar → Form Pendaftaran → Database → Admin Dashboard
    ↓              ↓              ↓           ↓
Status Check → Verifikasi → Download PDF → Manajemen
```

## 🛠️ Maintenance

### **Database Backup**

```bash
mysqldump -u username -p ukro_recruitment > backup.sql
```

### **Clear Old Data**

```sql
DELETE FROM applicants WHERE created_at < '2024-01-01';
```

### **Monitor Performance**

- Check database size
- Monitor upload folder
- Review error logs

## 📱 Mobile Usage

### **Pendaftar Mobile**

- Form responsive
- Touch-friendly inputs
- Mobile photo upload
- Swipe navigation

### **Admin Mobile**

- Responsive dashboard
- Touch-friendly controls
- Mobile-optimized tables
- Swipe actions

## 🔍 Troubleshooting

### **Common Issues**

1. **Upload Error**

   - Check file size (<10MB)
   - Verify file format
   - Clear browser cache

2. **PDF Download Error**

   - Check browser popup blocker
   - Verify data exists
   - Try different browser

3. **Admin Access Error**
   - Verify admin password
   - Check environment variables
   - Clear browser cache

### **Contact Support**

Untuk bantuan teknis, hubungi tim development.

---

**Version**: 1.0.0
**Last Updated**: $(Get-Date -Format "dd/MM/yyyy")
**Documentation**: Complete
