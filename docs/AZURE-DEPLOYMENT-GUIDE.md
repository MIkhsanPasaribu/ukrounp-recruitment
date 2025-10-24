# Pengembangan Web Server Sistem Rekrutmen UKRO Menggunakan Layanan Komputasi Azure

## 📘 Panduan Lengkap Deployment UKRO Recruitment ke Microsoft Azure

**Dibuat oleh:** M. Ikhsan Pasaribu (23076039)  
**Program Studi:** Pendidikan Teknik Informatika  
**Universitas:** Universitas Negeri Padang  
**Project:** UKRO Recruitment Platform  
**Target Budget:** $50 USD (dari $100 kredit Azure)  
**Estimasi Biaya Bulanan:** ~$25-35 USD

---

## 📋 Daftar Isi

1. [Analisis Project](#analisis-project)
2. [Kebutuhan & Estimasi Biaya](#kebutuhan--estimasi-biaya)
3. [Part A: Setup Compute/Web Server](#part-a-setup-computeweb-server)
4. [Part B: Deploy Web Application](#part-b-deploy-web-application)
5. [Part C: Setup Custom Domain](#part-c-setup-custom-domain)
6. [Monitoring & Optimization](#monitoring--optimization)
7. [Troubleshooting](#troubleshooting)

---

## 🔍 Analisis Project

### Stack Teknologi

```
Framework: Next.js 15.2.3 (React 19)
Runtime: Node.js 20+
Database: Supabase (PostgreSQL)
Authentication: JWT + bcrypt
File Storage: Supabase Storage
Build Tool: Next.js Build System
```

### Dependencies Utama

- **Frontend:** React, Next.js, Tailwind CSS, Chart.js, Recharts
- **Backend:** Next.js API Routes
- **Database:** @supabase/supabase-js
- **Security:** bcryptjs, jsonwebtoken
- **File Processing:** jspdf, jszip, archiver, pdfkit
- **Email:** nodemailer

### Environment Variables Dibutuhkan

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
```

### Fitur Aplikasi

1. ✅ Sistem pendaftaran applicant
2. ✅ Dashboard admin dengan analytics
3. ✅ Sistem interview & assignment
4. ✅ File upload (foto, KTP, ijazah, dll)
5. ✅ Export PDF & bulk download
6. ✅ Real-time statistics
7. ✅ Multi-role authentication (Admin, Interviewer)

---

## 💰 Kebutuhan & Estimasi Biaya

### Rekomendasi Arsitektur (Budget-Friendly)

**🎯 PILIHAN TERBAIK: Azure App Service (Linux, Node.js)**

| Service                   | Tier             | Spesifikasi                        | Estimasi Biaya/Bulan  |
| ------------------------- | ---------------- | ---------------------------------- | --------------------- |
| **App Service Plan**      | B1 Basic         | 1 Core, 1.75 GB RAM, 10 GB Storage | ~$13.14               |
| **App Service (Node 20)** | Included in Plan | Runtime support                    | $0                    |
| **Application Insights**  | Free Tier        | 5 GB data/month                    | $0                    |
| **Bandwidth**             | First 100 GB     | Outbound data transfer             | $0                    |
| **Total**                 |                  |                                    | **~$13-15 USD/bulan** |

### Alternatif Lain (Tidak Disarankan untuk Budget)

| Service                  | Tier             | Biaya/Bulan | Catatan            |
| ------------------------ | ---------------- | ----------- | ------------------ |
| Azure Container Instance | 1 vCPU, 1.5 GB   | ~$45        | Lebih mahal        |
| Azure VM (B1s)           | 1 vCPU, 1 GB RAM | ~$10        | Perlu manual setup |
| Azure Static Web Apps    | Free + Functions | ~$20        | Terbatas untuk SSR |

### ✅ Kenapa App Service B1?

- ✅ **Hemat:** Hanya $13/bulan
- ✅ **Built-in CI/CD:** GitHub integration
- ✅ **Auto-scaling:** Dapat upgrade tanpa downtime
- ✅ **SSL Gratis:** Untuk custom domain
- ✅ **Managed Service:** Azure handle maintenance
- ✅ **Node.js Native:** Perfect untuk Next.js

---

## 🖥️ Part A: Setup Compute/Web Server

### Prasyarat

- [x] Akun Microsoft Azure (dengan $100 kredit)
- [x] Repository GitHub project sudah siap
- [x] Database Supabase sudah setup
- [x] Domain dari Domainesia.com

### A.1 - Login ke Azure Portal

1. **Buka Azure Portal**

   ```
   URL: https://portal.azure.com
   ```

2. **Login dengan akun Microsoft Anda**

   - Gunakan akun yang sudah memiliki Azure Student/Free Credit

3. **Verifikasi Kredit**
   - Klik "Cost Management + Billing" di sidebar
   - Pastikan credit $100 tersedia

### A.2 - Buat Resource Group

> Resource Group = Container untuk semua resources Azure Anda

1. **Cari "Resource groups"** di search bar atas

2. **Klik "+ Create"**

3. **Isi form:**

   ```
   Subscription: Azure for Students / Free Trial
   Resource group name: ukro-recruitment-rg
   Region: Southeast Asia (Singapore)
   ```

   💡 **Kenapa Singapore?** Lokasi terdekat dengan Indonesia, latency rendah

4. **Klik "Review + create"** → **"Create"**

### A.3 - Buat App Service Plan

> App Service Plan = Resource compute untuk menjalankan app

1. **Cari "App Service plans"** di search bar

2. **Klik "+ Create"**

3. **Isi form Basic:**

   ```
   Subscription: Azure for Students
   Resource Group: ukro-recruitment-rg
   Name: ukro-recruitment-plan
   Operating System: Linux ✅ (Lebih murah dari Windows)
   Region: Southeast Asia
   ```

4. **Pilih Pricing Tier:**

   - Klik "Explore pricing plans"
   - Pilih **"Dev/Test"** tab
   - Pilih **"B1"** (1 Core, 1.75 GB RAM)
   - Klik "Select"

   ```
   💰 Biaya: ~$13.14/bulan = $0.0182/jam
   ```

5. **Klik "Review + create"** → **"Create"**

6. **Tunggu deployment selesai** (~1-2 menit)

### A.4 - Buat Web App (App Service)

1. **Cari "App Services"** di search bar

2. **Klik "+ Create"** → **"Web App"**

3. **Tab Basics:**

   ```
   Subscription: Azure for Students
   Resource Group: ukro-recruitment-rg

   Instance Details:
   Name: ukro-recruitment ⚠️ (akan jadi ukro-recruitment.azurewebsites.net)
   Publish: Code ✅
   Runtime stack: Node 20 LTS ✅
   Operating System: Linux
   Region: Southeast Asia

   App Service Plan:
   Linux Plan: ukro-recruitment-plan (B1)
   ```

4. **Tab Deployment:**

   ```
   Continuous deployment: Enable ✅
   GitHub account: [Login dengan GitHub Anda]
   Organization: MIkhsanPasaribu
   Repository: ititanix-recruitment
   Branch: main
   ```

   💡 Ini akan setup auto-deploy dari GitHub!

5. **Tab Monitoring:**

   ```
   Enable Application Insights: Yes ✅
   Application Insights: Create new
   Name: ukro-recruitment-insights
   Region: Southeast Asia
   ```

6. **Tab Tags** (Optional):

   ```
   Name: Project
   Value: UKRO-Recruitment

   Name: Owner
   Value: M-Ikhsan-Pasaribu
   ```

7. **Klik "Review + create"** → **"Create"**

8. **Tunggu deployment** (~2-3 menit)

### A.5 - Verifikasi Web Server

1. **Setelah deployment selesai,** klik **"Go to resource"**

2. **Di halaman Overview, lihat URL:**

   ```
   https://ukro-recruitment.azurewebsites.net
   ```

3. **Klik URL tersebut** - Akan muncul placeholder page Azure

4. **Cek status:**
   - Status harus: **"Running"** ✅
   - Health check: **"Healthy"** ✅

---

## 🚀 Part B: Deploy Web Application

### B.1 - Persiapan Repository GitHub

1. **Buka repository di GitHub:**

   ```
   https://github.com/MIkhsanPasaribu/ititanix-recruitment
   ```

2. **Pastikan file-file ini ada di root:**

   - ✅ `package.json`
   - ✅ `next.config.ts`
   - ✅ `.gitignore`

3. **Buat file `.deployment` di root** (jika belum ada):

   ```ini
   [config]
   SCM_DO_BUILD_DURING_DEPLOYMENT=true
   ```

4. **Buat file `web.config` di root** (untuk Azure):
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <configuration>
     <system.webServer>
       <handlers>
         <add name="iisnode" path="server.js" verb="*" modules="iisnode"/>
       </handlers>
       <rewrite>
         <rules>
           <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
             <match url="^server.js\/debug[\/]?" />
           </rule>
           <rule name="StaticContent">
             <action type="Rewrite" url="public{REQUEST_URI}"/>
           </rule>
           <rule name="DynamicContent">
             <conditions>
               <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
             </conditions>
             <action type="Rewrite" url="server.js"/>
           </rule>
         </rules>
       </rewrite>
       <security>
         <requestFiltering>
           <hiddenSegments>
             <remove segment="bin"/>
           </hiddenSegments>
         </requestFiltering>
       </security>
       <httpErrors existingResponse="PassThrough" />
     </system.webServer>
   </configuration>
   ```

### B.2 - Konfigurasi Environment Variables di Azure

1. **Di Azure Portal,** buka **App Service** Anda

2. **Sidebar kiri:** Klik **"Configuration"**

3. **Tab "Application settings",** klik **"+ New application setting"**

4. **Tambahkan setiap variable:**

   **Variable 1:**

   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://xxxxxx.supabase.co
   ```

   **Variable 2:**

   ```
   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGc...(service role key dari Supabase)
   ```

   **Variable 3:**

   ```
   Name: JWT_SECRET
   Value: your-super-secret-jwt-key-min-32-chars
   ```

   💡 **Generate JWT Secret:**

   ```bash
   # Di PowerShell
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
   ```

   **Variable 4:**

   ```
   Name: NODE_ENV
   Value: production
   ```

   **Variable 5:**

   ```
   Name: WEBSITE_NODE_DEFAULT_VERSION
   Value: 20-lts
   ```

5. **Klik "Save"** di atas

6. **Klik "Continue"** untuk restart app

### B.3 - Setup Build Configuration

1. **Masih di Configuration,** klik tab **"General settings"**

2. **Atur Stack settings:**

   ```
   Stack: Node
   Major version: 20 LTS
   Minor version: 20-lts
   Startup Command: npm run start
   ```

3. **Platform settings:**

   ```
   Platform: 64 Bit
   Web sockets: On ✅
   Always On: On ✅ (Penting untuk production!)
   ARR affinity: On
   HTTPS Only: On ✅
   Minimum TLS Version: 1.2
   ```

4. **Klik "Save"**

### B.4 - Deploy dari GitHub (Auto)

1. **Kembali ke Overview** App Service

2. **Sidebar kiri:** Klik **"Deployment Center"**

3. **Jika sudah connect GitHub saat create:**

   - Source: GitHub
   - Organization: MIkhsanPasaribu
   - Repository: ititanix-recruitment
   - Branch: main

4. **Build provider:** GitHub Actions ✅

5. **Klik "Save"**

6. **Azure akan membuat GitHub Actions workflow otomatis!**

### B.5 - Monitoring Deployment

1. **Buka GitHub repository** → **Actions** tab

2. **Lihat workflow** "Build and deploy Node.js app to Azure Web App"

3. **Tunggu build selesai** (~3-5 menit)

   - ✅ Build: Compile Next.js
   - ✅ Test: Run tests (jika ada)
   - ✅ Deploy: Push ke Azure

4. **Cek logs real-time** di Azure:
   - App Service → **Deployment Center** → **Logs**

### B.6 - Verifikasi Deployment

1. **Buka browser, akses:**

   ```
   https://ukro-recruitment.azurewebsites.net
   ```

2. **Cek:**

   - ✅ Homepage load dengan benar
   - ✅ Navigasi ke `/form` berfungsi
   - ✅ Login admin di `/login` berfungsi
   - ✅ Gambar/assets load properly

3. **Test database connection:**
   - Try register aplikasi test
   - Login sebagai admin
   - Cek apakah data tersimpan

### B.7 - Troubleshooting Initial Deploy

**Jika ada error:**

1. **Cek Application Logs:**

   ```
   App Service → Monitoring → Log stream
   ```

2. **Common issues:**

   **Error: "Application Error"**

   ```bash
   # Fix: Cek environment variables
   # Pastikan semua var sudah diset dengan benar
   ```

   **Error: "ENOENT: no such file or directory"**

   ```bash
   # Fix: Pastikan build berhasil
   # Cek GitHub Actions logs
   ```

   **Error: "Cannot connect to database"**

   ```bash
   # Fix: Cek Supabase credentials
   # Test connection dari local dulu
   ```

---

## 🌐 Part C: Setup Custom Domain

### C.1 - Persiapan Domain di Domainesia

1. **Login ke** [Domainesia.com](https://www.domainesia.com)

2. **Pilih domain Anda** (misal: `ukro-recruitment.com`)

3. **Masuk ke DNS Management**

### C.2 - Dapatkan Domain Verification dari Azure

1. **Di Azure Portal** → **App Service** Anda

2. **Sidebar:** Klik **"Custom domains"**

3. **Klik "+ Add custom domain"**

4. **Pilih domain type:**

   ```
   Domain provider: All other domain services
   TLS/SSL certificate: Add later (setelah domain verified)
   ```

5. **Masukkan domain:**

   ```
   # Untuk root domain:
   ukro-recruitment.com

   # Atau subdomain:
   www.ukro-recruitment.com
   ```

6. **Azure akan show verification details:**

   ```
   Domain verification ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

   DNS Records needed:
   Type: TXT
   Name: asuid
   Value: [verification ID]

   Type: CNAME
   Name: www (atau @)
   Value: ukro-recruitment.azurewebsites.net
   ```

### C.3 - Konfigurasi DNS di Domainesia

#### Option A: Setup Root Domain (`ukro-recruitment.com`)

1. **Di DNS Management Domainesia,** tambah records:

   **Record 1 - Domain Verification:**

   ```
   Type: TXT
   Host: asuid.ukro-recruitment.com
   Value: [verification ID dari Azure]
   TTL: 3600
   ```

   **Record 2 - A Record ke Azure IP:**

   ```
   Type: A
   Host: @
   Value: [IP address Azure - lihat di Custom domains page]
   TTL: 3600
   ```

   💡 **Dapatkan IP Azure:**

   - Di Custom domains page Azure
   - Lihat "IP address" yang disediakan

   **Record 3 - WWW Redirect:**

   ```
   Type: CNAME
   Host: www
   Value: ukro-recruitment.azurewebsites.net
   TTL: 3600
   ```

#### Option B: Setup WWW Subdomain (`www.ukro-recruitment.com`)

1. **Hanya perlu 2 records:**

   **Record 1 - Domain Verification:**

   ```
   Type: TXT
   Host: asuid.www
   Value: [verification ID dari Azure]
   TTL: 3600
   ```

   **Record 2 - CNAME:**

   ```
   Type: CNAME
   Host: www
   Value: ukro-recruitment.azurewebsites.net
   TTL: 3600
   ```

2. **Klik "Save" / "Update DNS"**

3. **Tunggu propagasi** (5-30 menit)

### C.4 - Verify Domain di Azure

1. **Kembali ke Azure** → **Custom domains**

2. **Klik "Validate"**

3. **Jika DNS sudah propagate:**

   - Status: **Validation passed** ✅

4. **Klik "Add"**

5. **Domain akan muncul di list**

### C.5 - Setup SSL Certificate (HTTPS)

> Azure provide FREE SSL certificate dari Microsoft!

1. **Di Custom domains page**

2. **Klik domain Anda** yang baru ditambahkan

3. **Klik "Add binding"**

4. **Pilih certificate type:**

   ```
   TLS/SSL type: SNI SSL ✅ (Gratis!)
   Certificate: Create App Service Managed Certificate
   ```

5. **Klik "Add"**

6. **Azure akan:**

   - Generate SSL certificate
   - Auto-renew sebelum expired
   - Bind ke domain

7. **Tunggu ~5-10 menit** untuk certificate provisioning

### C.6 - Setup HTTPS Redirect

1. **Custom domains** → Klik **domain Anda**

2. **Enable "HTTPS Only":**

   ```
   Configuration → General settings
   HTTPS Only: On ✅
   ```

3. **Save**

4. **Sekarang semua HTTP traffic akan redirect ke HTTPS!**

### C.7 - Verifikasi Domain & SSL

1. **Buka browser** (incognito/private mode)

2. **Test URLs:**

   ```
   ✅ http://ukro-recruitment.com → redirect ke HTTPS
   ✅ https://ukro-recruitment.com → load dengan 🔒
   ✅ https://www.ukro-recruitment.com → load dengan 🔒
   ```

3. **Klik padlock icon** di address bar:

   ```
   Certificate: Valid ✅
   Issued by: Microsoft Azure TLS Issuing CA
   Expires: (1 year from now)
   ```

4. **Test semua pages:**
   - Homepage
   - `/form`
   - `/login`
   - `/admin`
   - `/developer` (halaman Anda!)

### C.8 - Setup Domain Redirect (Opsional)

Jika ingin `www` redirect ke non-www atau sebaliknya:

1. **Di Domainesia,** tambah redirect:
   ```
   Type: URL Redirect
   Source: www.ukro-recruitment.com
   Destination: https://ukro-recruitment.com
   Redirect Type: 301 Permanent
   ```

---

## 📊 Monitoring & Optimization

### Monitor Performance

1. **Application Insights Dashboard:**

   ```
   Azure Portal → Application Insights → ukro-recruitment-insights
   ```

2. **Key Metrics:**
   - Request rate
   - Response time
   - Failed requests
   - Server exceptions

### Set Budget Alerts

1. **Cost Management + Billing**

2. **Budgets** → **+ Add**

3. **Setup alert:**

   ```
   Budget name: UKRO-Monthly-Budget
   Reset period: Monthly
   Amount: $50

   Alert conditions:
   - 50% of budget → Email notification
   - 80% of budget → Email notification
   - 100% of budget → Email + stop services
   ```

### Enable Auto-Scaling (Opsional)

Jika traffic meningkat:

1. **App Service Plan** → **Scale out (App Service plan)**

2. **Autoscale:**
   ```
   Min instances: 1
   Max instances: 3
   Scale rules:
   - CPU > 70% → Add 1 instance
   - CPU < 30% → Remove 1 instance
   ```

---

## 🔧 Troubleshooting

### Issue: Domain tidak bisa diakses

**Cek:**

```bash
# Test DNS propagation
nslookup ukro-recruitment.com

# Test di https://dnschecker.org
```

**Fix:**

- Tunggu 24-48 jam untuk full propagation
- Cek DNS records di Domainesia
- Flush DNS di local: `ipconfig /flushdns`

### Issue: SSL Error / Certificate Invalid

**Fix:**

1. Hapus SSL binding di Azure
2. Tunggu 10 menit
3. Create new managed certificate
4. Bind lagi

### Issue: App Error 500

**Cek logs:**

```
App Service → Monitoring → Log stream
```

**Common fixes:**

- Verify environment variables
- Check Supabase connection
- Review Application Insights errors

### Issue: Slow Performance

**Optimize:**

1. Enable **Always On** di App Service
2. Enable **Application Insights**
3. Use **Azure CDN** untuk static assets (opsional)
4. Optimize images di `/public`

---

## 💵 Estimasi Biaya Final

### Breakdown Biaya Bulanan

| Item                 | Tier/Usage    | Biaya       |
| -------------------- | ------------- | ----------- |
| App Service Plan B1  | 730 jam/bulan | **$13.14**  |
| Bandwidth            | < 100 GB      | **$0**      |
| Application Insights | < 5 GB data   | **$0**      |
| SSL Certificate      | Managed       | **$0**      |
| **TOTAL PERBULAN**   |               | **~$13-15** |

### Breakdown Biaya 6 Bulan

```
Month 1-6: $13 x 6 = $78
Remaining credit: $100 - $78 = $22

✅ Cukup untuk 7 bulan penuh!
```

### Tips Hemat Biaya

1. ✅ **Gunakan tier B1** (jangan upgrade tanpa alasan)
2. ✅ **Monitor usage** setiap minggu
3. ✅ **Set budget alerts** di $50
4. ✅ **Pakai Supabase free tier** untuk database
5. ✅ **Compress images** sebelum upload
6. ✅ **Enable caching** di Next.js
7. ✅ **Delete unused resources** (test apps, etc)

---

## ✅ Checklist Final

### Pre-Deployment

- [x] Repository GitHub siap
- [x] Database Supabase setup
- [x] Environment variables documented
- [x] Build test locally: `npm run build`
- [x] Domain dibeli di Domainesia

### Azure Setup

- [x] Resource Group created
- [x] App Service Plan B1 created
- [x] Web App created
- [x] GitHub Actions configured
- [x] Environment variables set
- [x] First deployment successful

### Domain & SSL

- [x] DNS records configured
- [x] Domain verified in Azure
- [x] SSL certificate bound
- [x] HTTPS redirect enabled
- [x] Domain accessible via HTTPS

### Post-Deployment

- [x] All pages load correctly
- [x] Database connection works
- [x] File uploads work
- [x] Authentication works
- [x] Admin dashboard accessible
- [x] Mobile responsive
- [x] Budget alerts configured

---

## 📚 Resources Tambahan

### Dokumentasi Official

- [Azure App Service Docs](https://docs.microsoft.com/azure/app-service/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Docs](https://supabase.com/docs)

### Tools Berguna

- [Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/)
- [DNS Checker](https://dnschecker.org)
- [SSL Test](https://www.ssllabs.com/ssltest/)
- [PageSpeed Insights](https://pagespeed.web.dev)

### Support

- Azure Support: https://azure.microsoft.com/support/
- GitHub Issues: https://github.com/MIkhsanPasaribu/ititanix-recruitment/issues

---

## 🎉 Selamat!

Aplikasi UKRO Recruitment Anda sekarang sudah **LIVE** di Azure dengan:

✅ Custom domain dari Domainesia  
✅ SSL/HTTPS gratis dari Azure  
✅ Auto-deployment dari GitHub  
✅ Monitoring & logging  
✅ Budget-friendly (~$13/bulan)

**Akses aplikasi di:**

- 🌐 https://ukro-recruitment.com
- 🌐 https://www.ukro-recruitment.com

**Developer page:**

- 👨‍💻 https://ukro-recruitment.com/developer

---

## 👨‍💻 Tentang Pengembang

**Developed by:**  
**M. Ikhsan Pasaribu (23076039)**  
Pendidikan Teknik Informatika  
Universitas Negeri Padang

**Kontak:**

- 📧 Email: [ikhsan@example.com]
- 💼 LinkedIn: [linkedin.com/in/mikhsanpasaribu]
- 🌐 Website: [mikhsanpasaribu.com]
- 💻 GitHub: [github.com/MIkhsanPasaribu]

---

_Dokumentasi ini dibuat sebagai bagian dari pengembangan sistem rekrutmen berbasis cloud computing menggunakan Microsoft Azure._

_Last updated: Oktober 2025_  
_Version: 1.0_

---

**© 2025 M. Ikhsan Pasaribu (23076039) - Universitas Negeri Padang**
