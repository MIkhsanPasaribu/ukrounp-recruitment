# Quick Fix Instructions - Deploy node_modules to Azure

## ✅ Perubahan yang Sudah Dilakukan:

### 1. **Update GitHub Actions Workflow**
- ✅ Install ALL dependencies (termasuk devDependencies) untuk build
- ✅ Build Next.js dengan production mode
- ✅ **Hapus node_modules** dan install ulang **HANYA production dependencies**
- ✅ Zip file INCLUDE `node_modules` dan `.next` folder
- ✅ Exclude file yang tidak perlu (docs, database, scripts, dll)

### Workflow Flow:
```
1. npm ci --production=false  → Install SEMUA deps (untuk build)
2. npm run build              → Build Next.js (butuh devDeps)
3. rm -rf node_modules        → Hapus semua
4. npm ci --production        → Install ONLY production deps
5. zip with node_modules      → Deploy ke Azure
```

## 🚀 Action Items:

### STEP 1: Commit dan Push
```powershell
git add .github/workflows/main_ukro-recruitment.yml
git commit -m "Fix: Include node_modules and .next in deployment zip"
git push origin main
```

### STEP 2: Tambah Environment Variable di Azure (OPTIONAL tapi RECOMMENDED)

Buka Azure Portal → ukro-recruitment → Configuration → Application settings

Tambah variable baru:

| Name | Value | Keterangan |
|------|-------|------------|
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `false` | Disable Azure Oryx auto-build |
| `WEBSITE_NODE_DEFAULT_VERSION` | `22.x` | Explicit Node version |

**Kenapa?** Karena kita sudah build di GitHub Actions, tidak perlu Azure build lagi.

### STEP 3: (OPTIONAL) Update Startup Command

Configuration → General settings → Startup Command:

```bash
npm start
```

atau lebih explicit:

```bash
node_modules/.bin/next start
```

## 📊 Estimasi Ukuran Deployment:

| Component | Estimated Size |
|-----------|----------------|
| Source Code | ~5-10 MB |
| node_modules (production) | ~150-200 MB |
| .next build output | ~20-30 MB |
| **Total** | **~175-240 MB** |

Deployment time: ~2-3 menit

## ✅ Verifikasi Setelah Deploy:

1. **Tunggu GitHub Actions selesai** (~5-7 menit karena zip lebih besar)

2. **Cek Logs di Azure:**
   ```
   Should see:
   ✅ npm info using npm@10.9.2
   ✅ npm info using node@v22.17.0
   ✅ > next start
   ✅ Ready on http://0.0.0.0:8080
   ```

3. **Test URL:**
   ```powershell
   Invoke-WebRequest -Uri "https://ukro-recruitment-c2c8b9gqaxckf4bq.indonesiacentral-01.azurewebsites.net" -Method HEAD
   ```

   Expected: **200 OK** ✅

## 🔧 Troubleshooting:

### Jika masih "next: not found":
1. Cek apakah zip include node_modules:
   - GitHub Actions logs → "Zip artifact" step
   - Should show progress zipping node_modules

2. Cek di Azure SSH Console:
   ```bash
   ls -la /home/site/wwwroot/node_modules/.bin/next
   ```
   Should exist!

### Jika deploy terlalu lama/gagal karena size:
**Alternative: Use Azure Build (Oryx)**

Update workflow - JANGAN zip node_modules:
```yaml
- name: Zip artifact for deployment
  run: zip release.zip ./* .next -r -x ".git/*" ".github/*" "node_modules/*" ".next/cache/*"
```

Then di Azure add:
```
SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

Azure akan auto-run `npm install` setelah deploy.

## 📝 Files Changed:
- ✅ `.github/workflows/main_ukro-recruitment.yml`

## ⏱️ Expected Timeline:
- GitHub Actions build: 3-5 menit
- Azure deployment: 2-3 menit  
- **Total: ~5-8 menit** dari push sampai live

---

**NEXT:** Commit, push, dan tunggu deployment! 🚀
