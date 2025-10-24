# Quick Fix Guide - 503 Service Unavailable

## Masalah: 503 Service Unavailable

### Langkah-Langkah Fix (IKUTI URUTAN INI):

## STEP 1: Cek Environment Variables di Azure

1. Login ke https://portal.azure.com
2. Search "ukro-recruitment" → klik App Service
3. Sidebar kiri: **Configuration**
4. Tab **Application settings**

### Pastikan SEMUA variable ini ada:

| Name                            | Value Example             | Catatan                    |
| ------------------------------- | ------------------------- | -------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://xxx.supabase.co` | URL Supabase project       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...`           | Public anon key            |
| `SUPABASE_SERVICE_ROLE_KEY`     | `eyJhbGciOi...`           | Service role key (SECRET!) |
| `JWT_SECRET`                    | `your-secret-key`         | Minimal 32 karakter        |
| `NODE_ENV`                      | `production`              | HARUS production           |

**Cara tambah:**

- Klik "+ New application setting"
- Masukkan Name dan Value
- Klik OK
- **PENTING:** Klik "Save" di atas (ini akan restart app)
- Tunggu 1-2 menit

---

## STEP 2: Cek Startup Command

1. Masih di Configuration → **General settings**
2. Cek **Startup Command**

### Harus salah satu dari ini:

**Option A (Recommended):**

```bash
npm run start
```

**Option B:**

```bash
node server.js
```

**Option C:**

```bash
npx next start
```

Jika kosong atau salah:

- Edit → ketik command yang benar
- Save → tunggu restart

---

## STEP 3: Cek Application Logs (PALING PENTING!)

Ini akan kasih tahu error sebenarnya:

### Via Portal:

1. App Service → **Monitoring** → **Log stream**
2. Tunggu logs muncul
3. **Cari error message** (biasanya berwarna merah atau ada kata "ERROR", "FAIL", "FATAL")

### Via PowerShell (lebih cepat):

```powershell
# Install Azure CLI dulu
winget install Microsoft.AzureCLI

# Login
az login

# Lihat logs real-time
az webapp log tail --name ukro-recruitment --resource-group ukro-recruitment-rg
```

### Common Errors & Artinya:

| Error Message                       | Penyebab                       | Fix                                 |
| ----------------------------------- | ------------------------------ | ----------------------------------- |
| `Error: Cannot find module 'next'`  | Dependencies tidak ter-install | Re-deploy atau manual `npm install` |
| `ECONNREFUSED` atau `ETIMEDOUT`     | Database connection gagal      | Cek Supabase URL/Key                |
| `JWT_SECRET is not defined`         | Environment variable hilang    | Tambah di Configuration             |
| `Port 8080 already in use`          | Startup command salah          | Hapus custom startup command        |
| `Cannot read property of undefined` | Runtime error di code          | Cek code di src/app/\*\*            |

---

## STEP 4: Force Rebuild & Redeploy

Jika masih 503, coba force rebuild:

### A. Hapus Cache di GitHub Actions:

```powershell
# Di terminal local
git commit --allow-empty -m "Force rebuild for Azure deployment"
git push origin main
```

### B. Manual Restart di Azure:

1. Portal → App Service → Overview
2. Klik **Restart** (button atas)
3. Confirm → tunggu 1-2 menit
4. Test lagi: https://ukro-recruitment-c2c8b9gqaxckf4bq.indonesiacentral-01.azurewebsites.net

---

## STEP 5: Verifikasi Build Files

Pastikan file-file penting ada di deployment:

### Files yang HARUS ada:

```
/home/site/wwwroot/
├── .next/              (Build output Next.js)
│   ├── standalone/     (Production build)
│   ├── static/         (Static assets)
│   └── server/         (Server chunks)
├── node_modules/       (Dependencies)
├── package.json
├── next.config.ts
└── public/            (Static files)
```

### Cara cek via SSH Console (Advanced):

1. Portal → App Service → **Development Tools** → **SSH**
2. Click "Go →"
3. Di terminal:

```bash
cd /home/site/wwwroot
ls -la
ls -la .next/
```

Jika `.next/` tidak ada atau kosong → Build gagal!

---

## STEP 6: Update Startup Command (Jika Perlu)

Buat file `startup.sh` di root project:

```bash
#!/bin/bash

echo "Starting UKRO Recruitment Platform..."
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Set environment
export NODE_ENV=production

# Check if .next exists
if [ ! -d ".next" ]; then
  echo "ERROR: .next folder not found! Running build..."
  npm run build
fi

# Start app
echo "Starting Next.js server..."
npm run start
```

Lalu di Azure Configuration → General settings:

- Startup Command: `bash startup.sh`
- Save

---

## STEP 7: Cek Package.json Scripts

Pastikan scripts di `package.json` benar:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

**PENTING:**

- `"start": "next start"` BUKAN `"start": "next dev"` ❌
- `"start": "next start"` BUKAN `"start": "node server.js"` (kecuali ada custom server)

---

## STEP 8: Test Minimal Endpoint

Buat file test sederhana untuk cek apakah runtime OK:

`src/app/api/health/route.ts`:

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    node: process.version,
  });
}
```

Push → deploy → test:

```
https://ukro-recruitment-c2c8b9gqaxckf4bq.indonesiacentral-01.azurewebsites.net/api/health
```

Jika ini works tapi homepage 503 → ada error di main app code.

---

## Checklist Debugging 503:

- [ ] Environment variables lengkap (5 variables)
- [ ] Startup command = `npm run start`
- [ ] Application logs sudah dicek
- [ ] `.next` folder ada di deployment
- [ ] `node_modules` ter-install
- [ ] Restart app sudah dilakukan
- [ ] GitHub Actions build sukses 100%
- [ ] Health endpoint response OK
- [ ] Database Supabase accessible
- [ ] JWT_SECRET minimal 32 karakter

---

## Jika Masih Gagal - Contact Info:

Kirim hasil dari commands ini:

```powershell
# 1. App status
az webapp show --name ukro-recruitment --resource-group ukro-recruitment-rg --query "{status:state,url:defaultHostName}"

# 2. Last 50 log lines
az webapp log tail --name ukro-recruitment --resource-group ukro-recruitment-rg --lines 50

# 3. Configuration
az webapp config appsettings list --name ukro-recruitment --resource-group ukro-recruitment-rg

# 4. Test connection
curl -I https://ukro-recruitment-c2c8b9gqaxckf4bq.indonesiacentral-01.azurewebsites.net
```

---

**Priority Actions (DO FIRST):**

1. ✅ Cek Environment Variables
2. ✅ Cek Application Logs
3. ✅ Restart App Service

**Last Resort:**

- Delete App Service
- Create new one dengan GitHub Actions workflow baru
