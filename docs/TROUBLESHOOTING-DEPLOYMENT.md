# Troubleshooting Guide - Azure Deployment

## Issue: Application Error 404 di Azure Portal

### Gejala:
- GitHub Actions berhasil ✅
- Deployment logs sukses ✅
- Azure Portal menampilkan error 404 ❌
- URL error: `/slots/c2c8b9gqaxckf4bq`

### Penyebab:
Azure Portal mencoba akses deployment slot yang tidak ada atau URL cache browser corrupt.

### Solusi:

#### 1. Clear Browser Cache
```bash
# Atau buka Incognito/Private window
Ctrl+Shift+N (Chrome/Edge)
Ctrl+Shift+P (Firefox)
```

#### 2. Akses App Service dengan Benar
- Login ke https://portal.azure.com
- Search bar atas: ketik "ukro-recruitment"
- Klik App Service Anda
- Klik "Browse" atau copy Default domain

#### 3. Cek URL Aplikasi yang Benar
URL Aplikasi Anda:
```
https://ukro-recruitment-c2c8b9gqaxckf4bq.indonesiacentral-01.azurewebsites.net
```

#### 4. Verifikasi Environment Variables
Di Azure Portal → App Service → Configuration, pastikan ada:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `NODE_ENV=production`

#### 5. Cek Application Logs
```powershell
# Via Azure CLI
az webapp log tail --name ukro-recruitment --resource-group ukro-recruitment-rg
```

Atau via Portal:
- App Service → Monitoring → Log stream
- App Service → Diagnose and solve problems

#### 6. Test Endpoints
```bash
# Homepage
curl https://ukro-recruitment-c2c8b9gqaxckf4bq.indonesiacentral-01.azurewebsites.net

# Health check (jika ada)
curl https://ukro-recruitment-c2c8b9gqaxckf4bq.indonesiacentral-01.azurewebsites.net/api/health

# Admin login
curl https://ukro-recruitment-c2c8b9gqaxckf4bq.indonesiacentral-01.azurewebsites.net/admin/login
```

## Common Issues & Fixes

### Issue: "Application Error" atau 503

**Penyebab:**
- Environment variables tidak diset
- Database connection error
- Build output tidak complete

**Fix:**
1. Cek Configuration → Application settings
2. Restart App Service
3. Re-deploy dari GitHub Actions

### Issue: Static Files 404

**Penyebab:**
- `.next` folder tidak ter-deploy
- `next.config.ts` salah konfigurasi

**Fix:**
1. Pastikan `zip` command di workflow include `.next`
2. Cek `next.config.ts`:
   ```typescript
   images: {
     unoptimized: true,
   }
   ```

### Issue: Database Connection Timeout

**Penyebab:**
- Supabase URL/Key salah
- Network/firewall block

**Fix:**
1. Test connection dari local:
   ```javascript
   const { createClient } = require('@supabase/supabase-js')
   const supabase = createClient(url, key)
   const { data, error } = await supabase.from('applicants').select('count')
   console.log(data, error)
   ```
2. Whitelist Azure IP di Supabase (jika perlu)

### Issue: Build Succeeds but App Crashes

**Penyebab:**
- Runtime error yang tidak terdeteksi saat build
- Missing dependencies di production

**Fix:**
1. Cek dependencies di `package.json`:
   - Pastikan tidak ada dev dependencies yang dipakai di runtime
2. Test build locally:
   ```bash
   npm run build
   NODE_ENV=production npm start
   ```

## Monitoring Commands

### Via Azure CLI

```powershell
# Install Azure CLI (jika belum)
winget install Microsoft.AzureCLI

# Login
az login

# Set subscription
az account set --subscription "8bee3087-53a9-4fe3-905d-fb10dc431dba"

# Check app status
az webapp show --name ukro-recruitment --resource-group ukro-recruitment-rg --query state

# Get logs
az webapp log tail --name ukro-recruitment --resource-group ukro-recruitment-rg

# Restart app
az webapp restart --name ukro-recruitment --resource-group ukro-recruitment-rg

# Get deployment status
az webapp deployment list-publishing-profiles --name ukro-recruitment --resource-group ukro-recruitment-rg
```

### Via PowerShell

```powershell
# Test URL
Invoke-WebRequest -Uri "https://ukro-recruitment-c2c8b9gqaxckf4bq.indonesiacentral-01.azurewebsites.net" -Method GET

# Test dengan headers
$headers = @{
    "User-Agent" = "Mozilla/5.0"
}
Invoke-WebRequest -Uri "https://ukro-recruitment-c2c8b9gqaxckf4bq.indonesiacentral-01.azurewebsites.net" -Headers $headers

# Check DNS
nslookup ukro-recruitment-c2c8b9gqaxckf4bq.indonesiacentral-01.azurewebsites.net

# Test SSL
$url = "https://ukro-recruitment-c2c8b9gqaxckf4bq.indonesiacentral-01.azurewebsites.net"
[Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
$req = [Net.HttpWebRequest]::Create($url)
$req.GetResponse() | Select-Object -ExpandProperty StatusCode
```

## Checklist Deployment

- [ ] GitHub Actions workflow berhasil (build + deploy)
- [ ] Environment variables sudah diset di Azure
- [ ] App Service status = "Running"
- [ ] Default domain bisa diakses
- [ ] Homepage load tanpa error
- [ ] Database connection works
- [ ] File upload works
- [ ] Admin login works
- [ ] API endpoints respond correctly
- [ ] Static assets load (CSS, JS, images)
- [ ] No errors di browser console
- [ ] Application Insights collecting data

## Resources

- [Azure App Service Docs](https://learn.microsoft.com/en-us/azure/app-service/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Docs](https://supabase.com/docs)
- [GitHub Actions Azure Deploy](https://github.com/Azure/webapps-deploy)

---

**Last Updated:** October 24, 2025  
**App Name:** ukro-recruitment  
**Region:** Indonesia Central (Jakarta)  
**Node.js Version:** 22 LTS
