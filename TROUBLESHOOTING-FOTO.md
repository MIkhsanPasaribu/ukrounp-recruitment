# Panduan Mengatasi Error Foto Pendaftar

## 🔍 **Masalah Yang Ditemukan**

### 1. Error "Got a packet bigger than 'max_allowed_packet' bytes"

Error ini terjadi karena ukuran data yang dikirim ke MySQL melebihi batas `max_allowed_packet`. Biasanya disebabkan oleh foto base64 yang terlalu besar.

### 2. Foto tidak muncul di PDF meski ada di database

Foto tersimpan di database tapi tidak muncul saat generate PDF karena field `photo` tidak dipetakan dengan benar di beberapa API endpoint.

## ✅ **Solusi yang Telah Diterapkan**

### 1. **Kompresi Gambar Otomatis**

- **File**: `src/components/FileUpload.tsx`
- **Fitur**:
  - Kompresi gambar otomatis sebelum upload
  - Canvas-based compression dengan kualitas 0.7 (70%)
  - Fallback ke file original jika kompresi gagal
  - Validasi ukuran file maksimal 10MB

### 2. **Perbaikan Field Mapping**

- **API yang diperbaiki**:
  - ✅ `src/app/api/admin/applications/route.ts` (sudah ada)
  - ✅ `src/app/api/admin/download-pdf/[id]/route.ts` (sudah ada dengan debug log)
  - ✅ `src/app/api/download-confirmation-pdf/route.ts` (DIPERBAIKI - field photo ditambahkan)

### 3. **Enhanced Debug Logging**

- **PDF Generator**: Debug log untuk checking photo field, data length, prefix, success/error
- **API Download**: Debug log untuk field photo dari database

### 4. **Konfigurasi MySQL untuk phpMyAdmin**

#### **Cara Manual (Sementara)**

Jalankan query ini di phpMyAdmin:

```sql
SET GLOBAL max_allowed_packet = 16777216;
SET GLOBAL wait_timeout = 60;
SET GLOBAL interactive_timeout = 60;
```

#### **Cara Permanen**

1. **Untuk XAMPP/WAMP**:

   - Buka file `php.ini`
   - Tambahkan: `upload_max_filesize = 16M`
   - Tambahkan: `post_max_size = 16M`

2. **Untuk MySQL (my.ini atau my.cnf)**:

   ```ini
   [mysqld]
   max_allowed_packet = 16M
   wait_timeout = 60
   interactive_timeout = 60
   ```

3. **Restart server** setelah perubahan

## 🔧 **Cara Testing**

1. **Start development server**:

   ```bash
   npm run dev
   ```

2. **Test upload foto**:

   - Buka form pendaftaran
   - Upload foto (ukuran besar)
   - Pastikan foto terkompresi otomatis
   - Submit form

3. **Check console** untuk melihat:
   - Log kompresi gambar
   - Ukuran file sebelum/sesudah kompresi

## 📊 **Hasil Kompresi**

- **Sebelum**: ~1.2MB base64
- **Sesudah**: ~200-500KB base64 (tergantung gambar)
- **Kualitas**: Tetap bagus untuk pas foto
- **Dimensi**: Maksimal 600px width (cocok untuk pas foto)

## 🚀 **Manfaat**

1. **Performa lebih baik**: Upload lebih cepat
2. **Database lebih efisien**: Ukuran data lebih kecil
3. **Bandwidth hemat**: Transfer data lebih ringan
4. **User experience**: Tidak ada error saat upload

## 🔍 **Monitoring**

Jika masih ada error, check:

1. Console browser untuk error kompresi
2. Server logs untuk error MySQL
3. Network tab untuk ukuran request
4. phpMyAdmin untuk setting max_allowed_packet

## 📝 **Catatan**

- Kompresi hanya berlaku untuk upload baru
- Data lama di database tetap ukuran asli
- Foto tetap bisa ditampilkan di PDF dengan baik
- Setting MySQL perlu restart server
