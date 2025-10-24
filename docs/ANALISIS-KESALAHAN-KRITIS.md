# 🔴 ANALISIS KESALAHAN KRITIS DOKUMENTASI & DEPLOYMENT

**Tanggal Analisis:** 24 Oktober 2025  
**Dianalisis oleh:** GitHub Copilot  
**Status:** CRITICAL - Kesalahan mendasar ditemukan

---

## 📊 EXECUTIVE SUMMARY

Deployment Azure terus gagal dengan error "Cannot find module" bukan karena masalah Oryx saja, tapi karena **NODE.JS VERSION MISMATCH** yang TIDAK KONSISTEN di seluruh dokumentasi dan konfigurasi.

### Root Causes Identified

1. ❌ **Node.js Version Mismatch** - Dokumentasi salah mencantumkan Node 20 padahal pakai Node 22
2. ❌ **Dokumentasi Tidak Akurat** - File `dokumentasi.md` dan `AZURE-DEPLOYMENT-GUIDE.md` contains WRONG information
3. ❌ **Oryx Build System Conflict** - Oryx tetap jalan meskipun sudah dimatikan

---

## 🚨 KESALAHAN #1: NODE.JS VERSION MISMATCH

### Situasi Aktual

| Environment                 | Node Version      | Status        |
| --------------------------- | ----------------- | ------------- |
| **Local Development**       | v25.0.0           | ⚠️ TOO NEW!   |
| **GitHub Actions**          | 22.x              | ✅ CORRECT    |
| **Azure Config (OLD)**      | 20-lts            | ❌ WRONG!     |
| **package.json**            | ^20 (@types/node) | ⚠️ Types only |
| **Next.js 15.2.3 Requires** | Node.js 18.17+    | ✅ Any OK     |

### Masalah

**Azure dikonfigurasi dengan Node 20, tapi:**

- GitHub Actions build dengan Node 22
- Local development pakai Node 25
- Dokumentasi menyebutkan Node 20 di mana-mana

**Impact:**

```
Built with Node 22 → Deployed to Node 20 runtime
→ Binary incompatibility
→ Module resolution errors
→ Application crash
```

---

## 🚨 KESALAHAN #2: DOKUMENTASI TIDAK AKURAT

### File: `docs/dokumentasi.md`

#### Error 1: Baris 69

```markdown
❌ SALAH:
| Compute Service | Azure App Service (Linux, Node.js 22 LTS) |

✅ SEHARUSNYA:
Ini sebenarnya benar! Tapi konfigurasi Azure yang salah (masih Node 20)
```

#### Error 2: Baris 164

```markdown
❌ SALAH:
**Runtime stack**: Node 20 LTS (compatible dengan Next.js 15)

✅ SEHARUSNYA:
**Runtime stack**: Node 22 LTS (sesuai dengan GitHub Actions)
```

#### Error 3: Baris 281-285

```markdown
❌ SALAH:
**Variable 5 - Node Version:**

Name: WEBSITE_NODE_DEFAULT_VERSION
Value: 20-lts

Memastikan Azure menggunakan Node.js versi 20 LTS.

✅ SEHARUSNYA:
Name: WEBSITE_NODE_DEFAULT_VERSION
Value: 22-lts

Memastikan Azure menggunakan Node.js versi 22 LTS (sesuai build di GitHub Actions).
```

#### Error 4: Baris 297-300

```markdown
❌ SALAH:
**Stack settings**:

- **Stack**: Node
- **Major version**: 20 LTS
- **Minor version**: 20-lts

✅ SEHARUSNYA:
**Stack settings**:

- **Stack**: Node
- **Major version**: 22
- **Minor version**: 22-lts
```

#### Error 5: Multiple References

```markdown
❌ SALAH (muncul di baris 329, 340, 344):

- "Setup Node.js 20"
- "Build and deploy Node.js app to Azure Web App"

✅ SEHARUSNYA:

- "Setup Node.js 22"
- Semua referensi ke Node 20 harus diubah ke Node 22
```

### File: `docs/AZURE-DEPLOYMENT-GUIDE.md`

#### Error Pattern: "Node 20" di Multiple Lines

**Grep Results:**

```
Line 21: Runtime: Node.js 20+
Line 154: Runtime stack: Node 20 LTS ✅
Line 159: Region: Southeast Asia
Line 341: Name: WEBSITE_NODE_DEFAULT_VERSION
Line 342: Value: 20-lts
Line 361: - **Major version**: 20 LTS
Line 362: - **Minor version**: 20-lts
```

**SEMUA referensi ke "Node 20" harus diganti ke "Node 22"!**

---

## 🚨 KESALAHAN #3: ORYX BUILD SYSTEM MASIH JALAN

### Current Configuration

**File: `.deployment`**

```ini
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=false
```

✅ Correct

**File: `.github/workflows/main_ukro-recruitment.yml`**

```yaml
- name: Create .deployment file to disable Oryx build
  run: |
    echo "[config]" > .deployment
    echo "SCM_DO_BUILD_DURING_DEPLOYMENT=false" >> .deployment
```

✅ Correct

**Azure Environment Variable:**

```
SCM_DO_BUILD_DURING_DEPLOYMENT=false
```

✅ Set in portal

### Why Oryx Still Running?

**Root Cause:**
Azure detects `oryx-manifest.toml` file yang di-generate oleh GitHub Actions build step → Triggers Oryx extraction script → Moves node_modules → Breaks paths

**Logs Evidence:**

```
Found tar.gz based node_modules
Extracting modules...
→ MODULE_NOT_FOUND error
```

---

## ✅ SOLUSI LENGKAP (3-TIER APPROACH)

### TIER 1: FIX Node.js Version (IMMEDIATE - 5 minutes)

#### 1. Update Azure Portal

**Portal → ukro-recruitment → Configuration → General settings**

```
Stack settings:
✅ Stack: Node
✅ Major version: 22 (bukan 20!)
✅ Node version: 22-lts (atau 22.x)

Startup Command:
cd /home/site/wwwroot && export NODE_PATH=/home/site/wwwroot/node_modules && node --version && npm run start
```

**Kenapa tambah `node --version`?**

- Untuk verify Node version di logs
- Debugging tool

#### 2. Update Environment Variable

**Configuration → Application settings**

Find: `WEBSITE_NODE_DEFAULT_VERSION`

```
❌ OLD: 20-lts
✅ NEW: 22-lts
```

#### 3. Save & Restart

- Click **Save**
- Click **Continue** to restart
- Wait 2-3 minutes

### TIER 2: Bypass Oryx Completely (IF TIER 1 FAILS - 10 minutes)

#### Option A: Remove Oryx Manifest

**Update `.github/workflows/main_ukro-recruitment.yml`**

Add step after unzip:

```yaml
- name: Unzip artifact for deployment
  run: unzip release.zip

- name: Remove Oryx manifest to prevent auto-build
  run: |
    rm -f oryx-manifest.toml
    rm -f .oryx_manifest.toml
    echo "Oryx manifest removed"

- name: "Deploy to Azure Web App"
  id: deploy-to-webapp
  uses: azure/webapps-deploy@v3
  with:
    app-name: "ukro-recruitment"
    package: .
    publish-profile: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE_xxx }}
```

#### Option B: Use .slugignore

Create `.slugignore` file:

```
oryx-manifest.toml
.oryx_manifest.toml
```

### TIER 3: Standalone Build (BEST PRACTICE - 30 minutes)

#### 1. Update `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // ← ADD THIS
  reactStrictMode: false,
  experimental: {
    optimizeCss: false,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

#### 2. Update GitHub Actions Workflow

```yaml
- name: Build Next.js application
  run: npm run build
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
    NODE_ENV: production

- name: Prepare standalone deployment
  run: |
    mkdir -p deploy
    cp -r .next/standalone/* deploy/
    cp -r .next/static deploy/.next/static
    cp -r public deploy/public
    cp package.json deploy/

- name: Zip standalone artifact
  run: |
    cd deploy
    zip -r ../release.zip ./*

- name: Upload artifact for deployment job
  uses: actions/upload-artifact@v4
  with:
    name: node-app
    path: release.zip
```

#### 3. Update Azure Startup Command

```bash
node server.js
```

**Benefits:**

- ✅ 50% smaller deployment
- ✅ Faster startup
- ✅ No Oryx interference
- ✅ Production-optimized

---

## 📝 CHECKLIST PERBAIKAN DOKUMENTASI

### File: `docs/dokumentasi.md`

- [ ] Baris 69: Verify "Node.js 22 LTS" (sudah benar, tapi tambahkan note)
- [ ] Baris 164: Change "Node 20 LTS" → "Node 22 LTS"
- [ ] Baris 281-285: Change "20-lts" → "22-lts"
- [ ] Baris 297-300: Change "20 LTS" → "22 LTS" dan "20-lts" → "22-lts"
- [ ] Baris 329: Change "Setup Node.js 20" → "Setup Node.js 22"
- [ ] Baris 340, 344: Change references dari "Node.js 20" → "Node.js 22"
- [ ] Add warning box tentang Node version consistency

### File: `docs/AZURE-DEPLOYMENT-GUIDE.md`

- [ ] Line 21: Change "Node.js 20+" → "Node.js 22+"
- [ ] Line 154: Verify "Node 20 LTS" → "Node 22 LTS"
- [ ] Line 341-342: Change "20-lts" → "22-lts"
- [ ] Line 361-362: Change "20 LTS" and "20-lts" → "22" and "22-lts"
- [ ] Find & Replace all instances of "Node 20" → "Node 22"
- [ ] Add troubleshooting section untuk version mismatch

### File: `docs/ULTIMATE-FIX.md`

- [x] ✅ DONE: Added root cause analysis
- [x] ✅ DONE: Added Node.js version fix as primary solution
- [ ] Add comparison table untuk Node versions
- [ ] Add verification steps untuk confirm Node version

---

## 🎯 ACTION ITEMS (PRIORITIZED)

### Priority 1: IMMEDIATE (DO THIS NOW!)

**1. Fix Azure Configuration (5 minutes)**

```bash
1. Portal → ukro-recruitment → Configuration
2. General settings:
   - Stack: Node
   - Major version: 22 (NOT 20!)
   - Startup Command: cd /home/site/wwwroot && export NODE_PATH=/home/site/wwwroot/node_modules && node --version && npm run start
3. Application settings:
   - WEBSITE_NODE_DEFAULT_VERSION: 22-lts (NOT 20-lts!)
4. Save → Continue → Wait 2-3 minutes
5. Test: https://ukro-recruitment-c2c8b9gqaxckf4bq.indonesiacentral-01.azurewebsites.net
```

**2. Verify Logs (2 minutes)**

Check logs should show:

```
✅ node --version → v22.x.x (NOT v20.x.x!)
✅ npm run start
✅ Next.js 15.2.3
✅ Ready in Xs
```

### Priority 2: FIX DOCUMENTATION (30 minutes)

**1. Update `docs/dokumentasi.md`**

- Search & Replace: "Node 20" → "Node 22" (with context verification)
- Search & Replace: "20-lts" → "22-lts"
- Add warning section tentang version consistency

**2. Update `docs/AZURE-DEPLOYMENT-GUIDE.md`**

- Same changes as dokumentasi.md
- Add troubleshooting section

**3. Update `README.md`** (if needed)

- Verify Node version requirements

### Priority 3: IMPLEMENT BEST PRACTICES (Optional, 1 hour)

**1. Migrate to Standalone Build**

- Update next.config.ts
- Update GitHub Actions workflow
- Test locally first!

**2. Add CI/CD Checks**

- Verify Node version consistency
- Add pre-deployment validation

---

## 🔍 VERIFICATION STEPS

### After Fixing Azure Configuration

**1. Check Deployment Logs**

```bash
# Azure Portal → ukro-recruitment → Deployment Center → Logs

Expected to see:
✅ node --version
✅ v22.x.x (NOT v20!)
✅ npm run start
✅ Next.js 15.2.3
✅ Ready in 2s
```

**2. Test Application**

```powershell
# Run verification script
.\verify-deployment.ps1

# Or manual test
Invoke-WebRequest -Uri "https://ukro-recruitment-c2c8b9gqaxckf4bq.indonesiacentral-01.azurewebsites.net" -Method HEAD

Expected:
StatusCode: 200
StatusDescription: OK
```

**3. Check Runtime**

```bash
# SSH to Azure container
az webapp ssh --name ukro-recruitment --resource-group ukro-recruitment-rg

# Verify Node version
node --version
# Expected: v22.x.x

# Check modules
ls -la /home/site/wwwroot/node_modules/next/
# Should exist and be accessible
```

---

## 💡 LESSONS LEARNED

### 1. **Consistency is CRITICAL**

❌ **Don't do this:**

- Local: Node 25
- CI/CD: Node 22
- Production: Node 20
- Docs: Says Node 20

✅ **Do this:**

- CI/CD: Node 22.x
- Production: Node 22.x (atau 22-lts)
- Docs: Node 22 everywhere
- Local: Ideally Node 22, tapi Node 25 masih OK untuk dev (backward compatible)

### 2. **Document ACTUAL Configuration, Not Ideal**

Dokumentasi harus reflect ACTUAL setup yang digunakan, bukan yang "harusnya" atau "seharusnya".

### 3. **Version Lock untuk Production**

```json
// package.json
{
  "engines": {
    "node": "22.x",
    "npm": ">=10.0.0"
  }
}
```

Add this untuk enforce version requirements!

### 4. **Azure Oryx is Both Friend and Foe**

- ✅ **Friend:** Auto-detects and builds Node.js apps
- ❌ **Foe:** Can interfere with pre-built artifacts
- 💡 **Solution:** Either fully embrace it OR fully disable it

### 5. **Startup Command is Powerful**

Custom startup command gives you:

- Full control over initialization
- Ability to set environment variables
- Debugging hooks (like `node --version`)
- Bypass Azure's automatic behaviors

---

## 📚 REFERENCES

### Official Documentation

- [Azure App Service - Node.js](https://learn.microsoft.com/azure/app-service/configure-language-nodejs)
- [Next.js - Deployment](https://nextjs.org/docs/deployment)
- [Azure Oryx Build System](https://github.com/microsoft/Oryx)

### Version Compatibility

- **Next.js 15.2.3:** Requires Node.js 18.17 or later
- **Node.js 22:** LTS as of October 2024
- **Azure App Service:** Supports Node 18, 20, 22

### Best Practices

- [Next.js Production Checklist](https://nextjs.org/docs/going-to-production)
- [Azure Node.js Best Practices](https://learn.microsoft.com/azure/app-service/quickstart-nodejs)

---

## 🎉 EXPECTED OUTCOME

Setelah semua fix di atas diimplementasikan:

### Deployment Should Work

```
✅ GitHub Actions: Build with Node 22 → Success
✅ Azure: Run with Node 22 → Success
✅ Application: Start successfully → Ready
✅ URL: https://ukro-recruitment-c2c8b9gqaxckf4bq.indonesiacentral-01.azurewebsites.net → HTTP 200
✅ Features: All working (form, admin, interview, etc.)
```

### Logs Should Show

```
Starting container...
Using Node.js version 22.x.x
cd /home/site/wwwroot
export NODE_PATH=/home/site/wwwroot/node_modules
node --version
v22.x.x ✅
npm run start
> next start
▲ Next.js 15.2.3
- Local: http://localhost:8080
✓ Ready in 2s
```

### No More Errors

```
❌ OLD: Error: Cannot find module '../server/require-hook'
❌ OLD: MODULE_NOT_FOUND
❌ OLD: Oryx extracting node_modules...

✅ NEW: Application running successfully
✅ NEW: All routes accessible
✅ NEW: Database connected
✅ NEW: Files uploadable
```

---

## ⏱️ TIMELINE

| Task                       | ETA    | Priority             |
| -------------------------- | ------ | -------------------- |
| Fix Azure Node version     | 5 min  | 🔴 P0 - NOW!         |
| Test deployment            | 3 min  | 🔴 P0 - NOW!         |
| Update dokumentasi.md      | 15 min | 🟠 P1 - Today        |
| Update AZURE guide         | 15 min | 🟠 P1 - Today        |
| Implement standalone build | 1 hour | 🟡 P2 - Optional     |
| Add CI/CD checks           | 30 min | 🟢 P3 - Nice to have |

**Total critical time:** 8 minutes to get app working!
**Total documentation fix:** 30 minutes
**Total best practices:** 1.5 hours (optional)

---

**Status:** ⏳ WAITING FOR USER ACTION

**Next Step:** Update Azure Portal configuration dengan Node 22!

---

© 2025 - Dokumentasi Error Analysis untuk UKRO Recruitment Project
