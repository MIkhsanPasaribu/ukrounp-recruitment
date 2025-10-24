# Final Fix - Deployment Issue (Module Not Found)

## 🚨 Problem Diagnosis

### Error yang Terjadi:

```
Error: Cannot find module '../server/require-hook'
Require stack:
- /node_modules/.bin/next
```

### Root Cause:

Azure Oryx build system mencoba handle node_modules dengan cara mereka sendiri:

1. Compress node_modules jadi `node_modules.tar.gz`
2. Extract ke `/node_modules` (global location)
3. Create symlink dari `/node_modules` ke `./node_modules`
4. Next.js binary di `/node_modules/.bin/next` tidak bisa find modules dengan benar

## ✅ Solution

### 1. Update `.deployment` File

**Before (SALAH):**

```ini
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

**After (BENAR):**

```ini
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=false
```

**Alasan:**

- Kita sudah build di GitHub Actions ✅
- Tidak perlu Azure build lagi ❌
- Disable Oryx build system yang bikin masalah

### 2. Tambahkan Environment Variable di Azure Portal

**CRITICAL - Harus dilakukan!**

Portal Azure → App Service "ukro-recruitment" → Configuration → Application settings

Tambah variable baru:

```
Name: SCM_DO_BUILD_DURING_DEPLOYMENT
Value: false
```

**Atau via Azure CLI:**

```bash
az webapp config appsettings set \
  --name ukro-recruitment \
  --resource-group ukro-recruitment-rg \
  --settings SCM_DO_BUILD_DURING_DEPLOYMENT=false
```

### 3. Pastikan Startup Command Benar

Configuration → General settings → Startup Command:

```bash
npm run start
```

**JANGAN:**

- ❌ `node server.js`
- ❌ `next start`
- ❌ `npx next start`

**HARUS:**

- ✅ `npm run start`

## 📋 Deployment Strategy

### Current Approach (Recommended):

```
GitHub Actions → Build locally → Zip (dengan node_modules + .next) → Deploy ke Azure → npm start
```

**Keuntungan:**

- ✅ Predictable build environment
- ✅ No Oryx interference
- ✅ Faster startup (pre-built)
- ✅ Consistent across deployments

### What Happens:

1. **GitHub Actions Build:**

   - Install dependencies (dev + prod)
   - Build Next.js (`npm run build`)
   - Re-install production dependencies only
   - Zip semua (termasuk `.next` dan `node_modules`)

2. **Azure Deployment:**

   - Receive zip file
   - Extract to `/home/site/wwwroot`
   - **Skip Oryx build** (karena `SCM_DO_BUILD_DURING_DEPLOYMENT=false`)
   - Run `npm run start` directly

3. **Startup:**
   - Next.js finds `.next` folder ✅
   - Next.js finds node_modules ✅
   - App starts successfully ✅

## 🔧 Step-by-Step Fix

### Step 1: Update `.deployment` file (DONE ✅)

```bash
git status
# Modified: .deployment
```

### Step 2: Commit and Push

```bash
git add .deployment
git commit -m "Fix: Disable Oryx build - use pre-built artifacts from GitHub Actions"
git push origin main
```

### Step 3: Add Environment Variable in Azure

**Via Portal:**

1. Login to https://portal.azure.com
2. Go to "ukro-recruitment" App Service
3. Configuration → Application settings
4. Click "+ New application setting"
5. Add:
   ```
   Name: SCM_DO_BUILD_DURING_DEPLOYMENT
   Value: false
   ```
6. Click "Save"
7. Click "Continue" to restart

**Via Azure CLI (Alternative):**

```powershell
# Install Azure CLI first
winget install Microsoft.AzureCLI

# Login
az login

# Set variable
az webapp config appsettings set `
  --name ukro-recruitment `
  --resource-group ukro-recruitment-rg `
  --settings SCM_DO_BUILD_DURING_DEPLOYMENT=false

# Restart app
az webapp restart `
  --name ukro-recruitment `
  --resource-group ukro-recruitment-rg
```

### Step 4: Wait for Deployment (~5 minutes)

Monitor:

- GitHub Actions: https://github.com/MIkhsanPasaribu/ukrounp-recruitment/actions
- Azure Logs: Portal → App Service → Deployment Center → Logs

### Step 5: Verify Deployment

Test URL:

```
https://ukro-recruitment-c2c8b9gqaxckf4bq.indonesiacentral-01.azurewebsites.net
```

Expected logs (should see):

```
npm run start
> next start

▲ Next.js 15.2.3
- Local:    http://localhost:8080
- Network:  http://0.0.0.0:8080

✓ Ready in 2s
```

## ✅ Success Indicators

### In Azure Logs:

- ✅ No "Found tar.gz based node_modules" message
- ✅ No "Extracting modules..." message
- ✅ See "▲ Next.js 15.2.3" message
- ✅ See "✓ Ready in Xs" message
- ✅ No errors about missing modules

### In Browser:

- ✅ Application loads (not 503)
- ✅ Homepage renders correctly
- ✅ CSS/JavaScript loads
- ✅ API endpoints respond

## 🔍 Troubleshooting

### If still 503 after fix:

**Check logs:**

```bash
az webapp log tail --name ukro-recruitment --resource-group ukro-recruitment-rg
```

**Common issues:**

1. **Environment variable not set:**

   - Verify in Azure Portal → Configuration
   - Should see `SCM_DO_BUILD_DURING_DEPLOYMENT = false`

2. **Old deployment cached:**

   - Restart app manually
   - Or trigger new deployment with empty commit

3. **GitHub Actions failed:**

   - Check Actions tab
   - Look for zip errors or build failures

4. **node_modules not in zip:**
   - Check workflow file
   - Ensure zip command correct

## 📝 Files Modified

1. ✅ `.deployment` - Set `SCM_DO_BUILD_DURING_DEPLOYMENT=false`
2. ✅ `.github/workflows/main_ukro-recruitment.yml` - Include node_modules in zip
3. ➡️ Azure Configuration - Add environment variable

## 🎯 Expected Outcome

After these fixes:

- ✅ GitHub Actions builds successfully
- ✅ Deployment completes without errors
- ✅ App starts within 10-15 seconds
- ✅ No module not found errors
- ✅ Application accessible at URL
- ✅ All features working

## 📊 Timeline

- **Now:** Commit `.deployment` change
- **+2 min:** Push triggers GitHub Actions
- **+7 min:** Build completes, deploys to Azure
- **+8 min:** Azure restarts, app starts
- **+10 min:** Application fully operational

## 💡 Key Learnings

1. **Oryx is not always needed:** For pre-built apps, disable it
2. **GitHub Actions vs Azure build:** Choose one strategy, not both
3. **Environment variables matter:** File + Azure Portal both need config
4. **node_modules location:** Keep it local, not global
5. **Next.js needs .next folder:** Must be in same directory

---

**Status:** Waiting for deployment  
**Next Step:** Add environment variable in Azure Portal  
**ETA:** 10 minutes until live
