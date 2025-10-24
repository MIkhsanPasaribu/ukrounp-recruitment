# ULTIMATE FIX - Azure Deployment (Module Not Found Error)

## 🚨 ROOT CAUSE ANALYSIS

### **CRITICAL ERROR #1: Node.js Version Mismatch** ⚠️

**Local Development:** Node.js v25.0.0
**GitHub Actions:** Node.js 22.x  
**Azure Configuration (OLD):** Node.js 20 LTS  
**package.json requires:** Node.js @types/node": "^20"

**Problem:** Azure menggunakan Node 20, tapi aplikasi dibangun dengan Node 22, dan local pakai Node 25!

### **CRITICAL ERROR #2: Dokumentasi Salah** ⚠️

**File: dokumentasi.md & AZURE-DEPLOYMENT-GUIDE.md**

❌ **SALAH di dokumentasi.md baris 69, 282, 285, 299:**

```
Value: 20-lts  ← SALAH! Seharusnya 22.x
```

❌ **SALAH di dokumentasi.md baris 164:**

```
Runtime stack: Node 20 LTS  ← SALAH! Seharusnya Node 22 LTS
```

❌ **SALAH di AZURE-DEPLOYMENT-GUIDE.md multiple lines:**

```
Node 20 LTS  ← Semua referensi ke Node 20 SALAH!
```

### **CRITICAL ERROR #3: Oryx Masih Running**

**Problem:** Azure Oryx masih running meskipun sudah:

- ✅ Set `.deployment` file: `SCM_DO_BUILD_DURING_DEPLOYMENT=false`
- ✅ Add environment variable: `SCM_DO_BUILD_DURING_DEPLOYMENT=false`
- ✅ GitHub Actions builds dan zip with node_modules

**Why Still Failing:**
Azure detects `oryx-manifest.toml` file in deployment → Auto-triggers Oryx build script → Moves node_modules to `/node_modules` → Symlink breaks → Error!

---

## ✅ SOLUTION 1: FIX Node.js Version FIRST! (CRITICAL)

### **Step 1A: Update Azure Portal Configuration**

1. Go to: https://portal.azure.com
2. App Service: `ukro-recruitment`
3. **Configuration** → **General settings** tab
4. **Stack settings**:
   ```
   Stack: Node
   Major version: 22
   Node version: 22-lts (atau 22.x)
   ```
5. Click **Save** → **Continue** to restart

### **Step 1B: Update Environment Variable**

1. Masih di Configuration → **Application settings** tab
2. Find: `WEBSITE_NODE_DEFAULT_VERSION`
3. Update value dari `20-lts` ke `22-lts`
4. Click **Save** → **Continue**

### **Step 1C: Add Custom Startup Command**

1. Configuration → **General settings** tab
2. **Startup Command** field, enter:

```bash
cd /home/site/wwwroot && export NODE_PATH=/home/site/wwwroot/node_modules && node --version && npm run start
```

(Added `node --version` untuk verify Node version di logs)

3. Click **Save**
4. Click **Continue** to restart

### What This Does:

- ✅ Skip Oryx build script entirely
- ✅ Use node_modules from `/home/site/wwwroot/node_modules` (our deployed version)
- ✅ Set NODE_PATH correctly
- ✅ Run `npm run start` directly

### Expected Result:

```
npm run start
> next start

▲ Next.js 15.2.3
- Local:    http://localhost:8080

✓ Ready in 2s
```

---

## ✅ SOLUTION 2: Remove oryx-manifest.toml (ALTERNATIVE)

### Prevent Oryx detection by removing manifest file

**Update GitHub Actions workflow:**

Add step setelah unzip artifact:

```yaml
- name: Unzip artifact for deployment
  run: unzip release.zip

- name: Remove Oryx manifest
  run: rm -f oryx-manifest.toml

- name: "Deploy to Azure Web App"
  id: deploy-to-webapp
  uses: azure/webapps-deploy@v3
  with:
    app-name: "ukro-recruitment"
    package: .
    publish-profile: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE_xxx }}
```

---

## ✅ SOLUTION 3: Use Standalone Build (BEST PRACTICE)

### Next.js 15 supports standalone output - smaller, faster, more reliable

**1. Update `next.config.ts`:**

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

**2. Update GitHub Actions workflow:**

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
    cp -r .next/standalone ./deploy
    cp -r .next/static ./deploy/.next/static
    cp -r public ./deploy/public

- name: Zip standalone artifact
  run: cd deploy && zip -r ../release.zip ./* -x ".git/*"

- name: Upload artifact for deployment job
  uses: actions/upload-artifact@v4
  with:
    name: node-app
    path: release.zip
```

**3. Azure Startup Command:**

```bash
node server.js
```

**Benefits:**

- ✅ Only includes necessary files (~50% smaller)
- ✅ No Oryx interference
- ✅ Faster startup time
- ✅ Production-optimized

---

## 📊 Comparison

| Approach             | Pros                        | Cons                        | Recommended           |
| -------------------- | --------------------------- | --------------------------- | --------------------- |
| **Custom Startup**   | Quick fix, no code changes  | Still has full node_modules | ✅ Try first          |
| **Remove Manifest**  | Prevents Oryx trigger       | Requires workflow update    | ⚠️ If #1 fails        |
| **Standalone Build** | Best practice, optimal size | Requires config changes     | 🏆 Long-term solution |

---

## 🎯 Quick Fix NOW (5 minutes)

### Do This Right Now:

1. **Azure Portal** → `ukro-recruitment` → **Configuration** → **General settings**

2. **Startup Command:**

   ```bash
   cd /home/site/wwwroot && export NODE_PATH=/home/site/wwwroot/node_modules && npm run start
   ```

3. **Save** → **Continue** (restart)

4. **Wait 2-3 minutes** for restart

5. **Test:**
   ```powershell
   Invoke-WebRequest -Uri "https://ukro-recruitment-c2c8b9gqaxckf4bq.indonesiacentral-01.azurewebsites.net" -Method HEAD
   ```

### Expected Success:

```
StatusCode        : 200
StatusDescription : OK
```

### If Still Fails:

Check logs - should NOT see:

- ❌ "Found tar.gz based node_modules"
- ❌ "Extracting modules..."

Should see:

- ✅ "npm run start"
- ✅ "▲ Next.js 15.2.3"
- ✅ "✓ Ready"

---

## 🔧 Troubleshooting

### Issue: Still seeing Oryx logs

**Fix:** Custom startup command might not be saved properly

```bash
# Via Azure CLI
az webapp config set \
  --name ukro-recruitment \
  --resource-group ukro-recruitment-rg \
  --startup-file "cd /home/site/wwwroot && export NODE_PATH=/home/site/wwwroot/node_modules && npm run start"

# Restart
az webapp restart \
  --name ukro-recruitment \
  --resource-group ukro-recruitment-rg
```

### Issue: App crashes immediately

**Possible causes:**

1. `.next` folder missing → Check GitHub Actions build logs
2. `node_modules` missing → Check zip file contains it
3. Environment variables missing → Check Azure Configuration

**Debug:**

```bash
# SSH to container
az webapp ssh --name ukro-recruitment --resource-group ukro-recruitment-rg

# Check files
ls -la /home/site/wwwroot/
ls -la /home/site/wwwroot/.next/
ls -la /home/site/wwwroot/node_modules/
```

---

## 📝 Long-term Fix (Recommended after quick fix works)

### Implement Standalone Build

1. **Update `next.config.ts`** - add `output: 'standalone'`
2. **Update workflow** - deploy from `.next/standalone`
3. **Update startup** - change to `node server.js`
4. **Test locally** first before deploying

This is the **official Next.js recommendation** for Docker/Container deployments.

---

## ✅ Verification Checklist

After applying fix:

- [ ] Startup command updated in Azure
- [ ] App restarted successfully
- [ ] Logs show "npm run start"
- [ ] Logs show "Next.js 15.2.3"
- [ ] Logs show "Ready in Xs"
- [ ] No Oryx extraction messages
- [ ] HTTP request returns 200
- [ ] Homepage loads in browser
- [ ] No console errors
- [ ] Database connection works

---

## 🎉 Expected Timeline

- **Now:** Update startup command
- **+2 min:** App restarts
- **+3 min:** Test URL - should work!
- **+5 min:** Full verification

**If this works, you're DONE! 🚀**

---

**Priority:** Execute Solution 1 (Custom Startup Command) RIGHT NOW!
