## 🔧 Langkah Debugging Login Pewawancara

### **Masalah:**

- Login dengan username `pewawancara6` dan password `admin123` masih menghasilkan 401 Unauthorized
- Endpoint `/api/interview/auth/login` dapat diakses tapi credentials ditolak

### **Langkah-langkah yang perlu dilakukan:**

1. **Jalankan script password fix di Supabase SQL Editor:**

   ```sql
   -- Jalankan isi file: fix-interviewer-passwords.sql
   ```

2. **Verifikasi akun pewawancara6 ada di database:**

   ```sql
   SELECT username, email, "fullName", "isActive", LENGTH("passwordHash") as pwd_length
   FROM interviewers
   WHERE username = 'pewawancara6' OR email = 'wawancara6@robotik.pkm.unp.ac.id';
   ```

3. **Test login setelah password fix:**

   - Username: `pewawancara6`
   - Password: `admin123`

4. **Cek log server untuk melihat error detail**

### **Kemungkinan Penyebab:**

- ❌ Akun `pewawancara6` belum ada di database
- ❌ Password hash belum di-update
- ❌ Kolom `isActive` bernilai false
- ❌ Ada issue dengan bcrypt comparison

### **Solusi:**

1. Pastikan script `fix-interviewer-passwords.sql` sudah dijalankan
2. Verifikasi akun ada dan aktif
3. Test login dengan credentials yang benar
