# PANDUAN MIGRASI SISTEM AUTENTIKASI YANG AMAN

## 🔒 Ringkasan Perubahan

Sistem autentikasi telah sepenuhnya dirombak dari menggunakan password di environment variable menjadi sistem berbasis database yang sangat aman dengan fitur-fitur berikut:

### ✅ Fitur Keamanan Baru:

- **Database-backed Authentication**: Password admin tersimpan aman di database dengan hash bcrypt
- **JWT Token System**: Menggunakan JSON Web Token untuk session management
- **Session Management**: Token dengan expiry dan invalidation
- **Audit Logging**: Semua aktivitas admin tercatat
- **Rate Limiting & Account Locking**: Proteksi dari brute force attack
- **Role-based Access**: Support untuk multiple admin roles
- **IP Tracking**: Pencatatan alamat IP untuk keamanan

## 📋 Langkah-langkah Migrasi

### 1. Database Migration

```sql
-- Jalankan file database-migration-auth.sql di Supabase SQL Editor
-- File ini akan membuat tabel: admins, session_tokens, audit_logs
```

### 2. Update Dependencies

Pastikan dependencies berikut terinstall:

```bash
npm install bcryptjs @types/bcryptjs jsonwebtoken @types/jsonwebtoken
```

### 3. Environment Variables

Tambahkan ke file `.env.local`:

```env
# JWT Secret - GANTI dengan random string yang kuat
JWT_SECRET=your-super-strong-jwt-secret-key-here-min-32-chars

# Database URL (sudah ada)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Update Prisma Schema

Schema sudah diupdate dengan model baru:

- `Admin`: Data admin dengan password hash
- `SessionToken`: Management token session
- `AuditLog`: Log aktivitas admin

### 5. Create Admin User

```bash
# Jalankan script untuk membuat admin pertama
node scripts/create-admin.js admin admin@example.com yourpassword "Admin User"
```

### 6. Generate Password Hash (Optional)

```bash
# Untuk membuat hash password manual
node scripts/generate-hash.js yourpassword
```

### 7. Deploy New Authentication System

```bash
# Backup file lama dan deploy yang baru
node scripts/migrate-auth.js
```

## 🔧 File-file yang Telah Diupdate

### Backend Authentication:

- `src/lib/auth_new.ts` - Sistem autentikasi baru
- `src/lib/auth-middleware_new.ts` - Middleware proteksi API
- `src/app/api/admin/login/route_new.ts` - API login baru
- `src/app/api/admin/logout/route_new.ts` - API logout baru

### Frontend Components:

- `src/components/AdminLogin.tsx` - Updated untuk username/email + password
- `src/components/AdminDashboard.tsx` - Updated untuk logout dengan token
- `src/app/admin/page.tsx` - Updated untuk session management

### Database:

- `prisma/schema.prisma` - Schema baru untuk authentication
- `database-migration-auth.sql` - Migration script

### Utilities:

- `scripts/create-admin.js` - Membuat admin user
- `scripts/generate-hash.js` - Generate password hash
- `scripts/migrate-auth.js` - Migration helper

## 🛡️ Keamanan yang Ditingkatkan

### 1. Password Security

- Password di-hash dengan bcrypt (12 rounds)
- Tidak ada plain text password di kode atau environment

### 2. Session Management

- JWT token dengan expiry time
- Session token stored in database
- Dapat di-revoke/invalidate kapan saja

### 3. Audit Trail

- Semua login attempt dicatat
- Track IP address dan user agent
- Log semua aktivitas admin

### 4. Brute Force Protection

- Account locking setelah failed attempts
- Rate limiting di level aplikasi
- IP tracking untuk monitoring

### 5. Role-based Access

- Support multiple admin roles (SUPER_ADMIN, ADMIN, MODERATOR)
- Extensible untuk future features

## ✅ Testing Checklist

### Pre-deployment:

- [ ] Database migration berhasil
- [ ] Admin user berhasil dibuat
- [ ] Environment variables sudah di-set
- [ ] Dependencies ter-install

### Post-deployment:

- [ ] Login dengan username/email berhasil
- [ ] Dashboard dapat diakses
- [ ] Logout berfungsi dengan benar
- [ ] API endpoints ter-proteksi
- [ ] Audit logs ter-record

## 🚨 Penting!

### Security Notes:

1. **JWT_SECRET harus kuat** (minimal 32 karakter, random)
2. **Ganti default password** admin setelah login pertama
3. **Backup database** sebelum migration
4. **Test di development** dulu sebelum production

### Migration Sequence:

1. Database migration
2. Environment setup
3. Create admin user
4. Deploy new code
5. Test authentication
6. Monitor audit logs

## 📞 Troubleshooting

### Error "JWT_SECRET not found":

```bash
# Set environment variable
echo 'JWT_SECRET=your-32-char-random-string' >> .env.local
```

### Error "Admin table not found":

```sql
-- Jalankan database migration script
-- Check di Supabase dashboard apakah tabel sudah terbuat
```

### Login gagal:

1. Check admin user sudah dibuat
2. Verify password hash di database
3. Check network logs untuk error detail

### Token expired:

- Token memiliki expiry 24 jam
- Logout dan login ulang
- Check server time vs client time

## 🎯 Hasil Akhir

Setelah migrasi selesai, sistem akan memiliki:

- ✅ Autentikasi berbasis database yang sangat aman
- ✅ Session management dengan JWT
- ✅ Audit logging lengkap
- ✅ Proteksi dari brute force attack
- ✅ Role-based access control
- ✅ IP tracking dan monitoring

Sistem ini setara dengan standar enterprise untuk keamanan admin panel!
