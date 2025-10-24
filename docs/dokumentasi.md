# Pengembangan Web Server Sistem Rekrutmen Unit Kegiatan Robotika Universitas Negeri Padang Menggunakan Layanan Komputasi Microsoft Azure

---

## Identitas

| **Keterangan**    | **Detail**                    |
| ----------------- | ----------------------------- |
| Nama              | M. Ikhsan Pasaribu            |
| NIM               | 23076039                      |
| Jurusan           | Pendidikan Teknik Informatika |
| Fakultas          | Teknik Elektronika            |
| Universitas       | Universitas Negeri Padang     |
| Mata Kuliah       | Komputasi Awan                |
| Dosen Pengampu    | -                             |
| Tanggal Pembuatan | 24 Oktober 2025               |

---

## 3. Penjelasan Project

### A. Latar Belakang

Dalam era digital saat ini, proses rekrutmen organisasi kemahasiswaan memerlukan sistem yang efisien, terstruktur, dan dapat diakses dari mana saja. Unit Kegiatan Robotika (UKRO) Universitas Negeri Padang sebagai salah satu organisasi mahasiswa yang aktif membutuhkan sistem rekrutmen yang mampu mengelola ratusan pendaftar secara efektif.

Sebelumnya, proses rekrutmen UKRO dilakukan secara manual menggunakan formulir kertas atau spreadsheet sederhana yang memiliki banyak keterbatasan. Pendaftar harus datang langsung ke sekretariat untuk mengisi formulir, data tersebar di berbagai file, dan proses verifikasi memakan waktu sangat lama. Saya menyadari bahwa pendekatan manual ini tidak efisien dan rentan terhadap kesalahan data serta kehilangan dokumen penting.

Oleh karena itu, saya mengembangkan **UKRO Recruitment Platform** - sebuah aplikasi web berbasis cloud yang dirancang untuk mengotomatisasi dan mempermudah seluruh proses rekrutmen. Aplikasi ini saya bangun menggunakan Next.js 15.2.3 sebagai framework utama, Supabase sebagai database cloud, dan deploy menggunakan Microsoft Azure App Service untuk memastikan aplikasi dapat diakses 24/7 dengan performa yang optimal.

**Tujuan utama dari project ini adalah:**

1. **Digitalisasi Proses Rekrutmen**: Mengubah proses manual menjadi sistem digital yang dapat diakses online
2. **Efisiensi Pengelolaan Data**: Menyediakan dashboard admin untuk mengelola ratusan aplikasi dengan mudah
3. **Sistem Interview Terstruktur**: Memfasilitasi proses wawancara dengan assignment system untuk para interviewer
4. **Keamanan Data**: Memastikan data pendaftar tersimpan dengan aman menggunakan enkripsi dan authentication
5. **Aksesibilitas**: Dapat diakses dari perangkat apapun melalui internet tanpa batasan waktu dan tempat

**Fitur-fitur utama yang saya implementasikan dalam aplikasi ini meliputi:**

- **Sistem Pendaftaran Online**: Formulir multi-section yang komprehensif dengan validasi real-time. Pendaftar mengisi data pribadi, informasi akademik, essay motivasi, dan mengunggah dokumen pendukung seperti foto, KTP, kartu mahasiswa, dan bukti kemampuan
- **Dashboard Administrator**: Interface yang powerful untuk mengelola semua aplikasi dengan fitur filtering berdasarkan status, pencarian, bulk actions (approve/reject multiple applications), export data ke CSV/PDF, dan analytics real-time
- **Sistem Interview Management**: Fitur untuk menandai kehadiran kandidat, assign interviewer ke setiap kandidat, dan dashboard khusus interviewer untuk menilai kandidat
- **Multi-Role Authentication**: Sistem login terpisah untuk admin dan interviewer dengan JWT token dan bcrypt password hashing
- **File Management**: Upload dan storage untuk berbagai jenis dokumen dengan validasi ukuran dan tipe file
- **Status Tracking**: 5 tahapan status (Sedang Ditinjau, Daftar Pendek, Interview, Diterima, Ditolak) dengan status history lengkap
- **WhatsApp Integration**: Verifikasi nomor WhatsApp untuk komunikasi dengan kandidat
- **PDF Generation**: Generate surat penerimaan otomatis untuk kandidat yang diterima
- **Analytics Dashboard**: Statistik real-time mengenai jumlah pendaftar, conversion rate, dan distribusi status

**Konten dan informasi dalam aplikasi mencakup:**

- Data lengkap pendaftar: NIM, nama, email, nomor telepon, alamat, fakultas, jurusan, program studi, tingkat pendidikan
- Informasi akademik: IPK, semester, tahun masuk, jurusan SMA
- Kemampuan teknis: Software desain (Figma, Adobe XD, Photoshop, dll), video editing (Premiere, After Effects, CapCut), dan engineering tools (AutoCAD, SolidWorks, MATLAB)
- Essay: Motivasi bergabung, rencana masa depan, dan alasan mengapa harus diterima
- Dokumen pendukung: Foto formal, foto informal, kartu mahasiswa, KRS, bukti MBTI, bukti aktivitas media sosial
- Audit logs: Tracking semua aktivitas admin dengan IP address dan timestamp

Dengan menggunakan cloud computing melalui Microsoft Azure, aplikasi ini dapat berjalan 24/7 dengan uptime tinggi, skalabilitas otomatis saat traffic meningkat, dan biaya operasional yang terkontrol. Saya memilih Azure App Service karena menyediakan managed service yang menangani infrastructure maintenance, auto-scaling, dan SSL certificate secara otomatis, sehingga saya bisa fokus pada pengembangan fitur tanpa khawatir tentang server management.

### B. Identitas Domain

| **Aspek**              | **Detail**                                                                       |
| ---------------------- | -------------------------------------------------------------------------------- |
| URL Aplikasi           | https://ukro-recruitment.azurewebsites.net                                       |
| Jenis Aplikasi         | Web Application (Full-Stack Next.js)                                             |
| Provider Domain        | Domainesia.com (untuk custom domain)                                             |
| Cloud Provider         | Microsoft Azure                                                                  |
| Compute Service        | Azure App Service (Linux, Node.js 22 LTS)                                        |
| Service Plan           | B1 Basic (1 Core, 1.75 GB RAM, 10 GB Storage)                                    |
| Database Provider      | Supabase (PostgreSQL Cloud Database)                                             |
| DNS Configuration      | CNAME record mengarah ke azurewebsites.net, TXT record untuk domain verification |
| SSL Certificate        | Azure Managed Certificate (Auto-renewal)                                         |
| Deployment Method      | GitHub Actions CI/CD (Auto-deploy dari repository)                               |
| Region                 | Southeast Asia (Singapore)                                                       |
| Estimasi Biaya Bulanan | ~$13-15 USD                                                                      |
| Tech Stack             | Next.js 15.2.3, React 19, TypeScript, Tailwind CSS, Supabase, Node.js 22         |
| Monitoring             | Azure Application Insights (5GB free tier)                                       |
| Environment Variables  | NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, NODE_ENV        |
| Build Configuration    | npm install → npm run build → npm run start                                      |
| File Storage           | Base64 encoded dalam database Supabase (max 5MB per file)                        |
| Authentication         | JWT Token + bcrypt password hashing                                              |
| Status Deployment      | Production (Live sejak deployment pertama)                                       |

**Konfigurasi DNS di Domainesia (untuk custom domain):**

- **A Record**: @ → IP Address Azure App Service
- **CNAME Record**: www → ukro-recruitment.azurewebsites.net
- **TXT Record**: asuid → Domain verification ID dari Azure
- **TTL**: 3600 seconds (1 jam)

**Alasan memilih Azure App Service:**

1. Managed service yang menangani infrastructure secara otomatis
2. Built-in CI/CD integration dengan GitHub
3. Auto-scaling capability untuk menangani traffic tinggi
4. SSL certificate gratis dengan auto-renewal
5. Region Singapore memiliki latency rendah untuk akses dari Indonesia
6. Cost-effective dengan plan B1 hanya $13/bulan
7. Native support untuk Node.js dan Next.js
8. Application Insights untuk monitoring performa aplikasi

---

## 4. Langkah-Langkah Pengembangan Web Server

### A. Langkah Pembuatan Compute/Web Server di Azure

Proses pertama yang saya lakukan adalah membuat infrastructure dasar di Microsoft Azure untuk menjalankan aplikasi web. Berikut adalah langkah-langkah detail yang saya ikuti:

#### 1. Persiapan Akun Azure

Pertama-tama, saya login ke Azure Portal di https://portal.azure.com menggunakan akun Microsoft yang sudah terdaftar. Saya memverifikasi bahwa akun saya memiliki kredit Azure untuk student sebesar $100 yang dapat digunakan untuk deployment. Verifikasi ini saya lakukan melalui menu "Cost Management + Billing" untuk memastikan budget tersedia sebelum membuat resource apapun.

#### 2. Membuat Resource Group

Resource Group adalah container logis yang menampung semua resource Azure yang terkait dengan satu project. Saya membuat resource group baru dengan langkah berikut:

- Mencari "Resource groups" menggunakan search bar di bagian atas portal
- Klik tombol "+ Create" untuk membuat resource group baru
- Mengisi form dengan detail:
  - **Subscription**: Azure for Students
  - **Resource group name**: ukro-recruitment-rg
  - **Region**: Southeast Asia (Singapore)
- Memilih region Singapore karena lokasi ini paling dekat dengan Indonesia sehingga memberikan latency yang rendah untuk akses dari user di Indonesia
- Klik "Review + create" lalu "Create"

Setelah beberapa detik, resource group berhasil dibuat dan siap menampung semua resource lainnya.

#### 3. Membuat App Service Plan

App Service Plan adalah resource compute yang mendefinisikan kapasitas server yang akan menjalankan aplikasi web. Ini merupakan langkah krusial karena menentukan performa dan biaya operasional. Langkah yang saya lakukan:

- Mencari "App Service plans" di search bar
- Klik "+ Create" untuk membuat plan baru
- Mengisi konfigurasi:
  - **Subscription**: Azure for Students
  - **Resource Group**: ukro-recruitment-rg (memilih resource group yang baru saja dibuat)
  - **Name**: ukro-recruitment-plan
  - **Operating System**: Linux (saya pilih Linux karena lebih murah dibanding Windows dan fully compatible dengan Node.js)
  - **Region**: Southeast Asia (harus sama dengan resource group)
- Memilih Pricing Tier dengan klik "Explore pricing plans"
  - Masuk ke tab "Dev/Test" untuk opsi yang lebih ekonomis
  - Memilih **B1 Basic** dengan spesifikasi 1 Core CPU, 1.75 GB RAM, dan 10 GB Storage
  - Biaya yang tertera adalah ~$13.14 per bulan atau $0.0182 per jam
- Klik "Review + create" kemudian "Create"
- Menunggu sekitar 1-2 menit hingga deployment selesai

Saya memilih tier B1 karena menawarkan balance yang baik antara performa dan biaya untuk aplikasi recruitment scale menengah yang saya kembangkan.

#### 4. Membuat Web App (App Service)

Setelah App Service Plan siap, langkah selanjutnya adalah membuat Web App yang akan menjalankan aplikasi Next.js. Ini adalah langkah paling penting dalam setup compute:

- Mencari "App Services" di search bar
- Klik "+ Create" dan pilih "Web App"
- **Tab Basics** - Konfigurasi dasar aplikasi:

  - **Subscription**: Azure for Students
  - **Resource Group**: ukro-recruitment-rg
  - **Name**: ukro-recruitment (ini akan menjadi URL default: ukro-recruitment.azurewebsites.net)
  - **Publish**: Code (bukan Docker container)
  - **Runtime stack**: Node 20 LTS (compatible dengan Next.js 15)
  - **Operating System**: Linux
  - **Region**: Southeast Asia
  - **App Service Plan**: ukro-recruitment-plan (plan yang sudah dibuat sebelumnya)

- **Tab Deployment** - Setup continuous deployment:

  - **Continuous deployment**: Enable
  - Login dengan akun GitHub saya
  - **Organization**: MIkhsanPasaribu
  - **Repository**: ukrounp-recruitment (nama repository project saya)
  - **Branch**: main
  - Konfigurasi ini akan otomatis membuat GitHub Actions workflow untuk auto-deploy setiap kali ada push ke branch main

- **Tab Monitoring** - Setup application monitoring:

  - **Enable Application Insights**: Yes
  - **Application Insights**: Create new
  - **Name**: ukro-recruitment-insights
  - **Region**: Southeast Asia
  - Application Insights akan memberikan monitoring real-time untuk performa aplikasi, error tracking, dan usage analytics

- **Tab Tags** - Menambahkan metadata (optional tapi berguna untuk organization):

  - Tag 1: Name = "Project", Value = "UKRO-Recruitment"
  - Tag 2: Name = "Owner", Value = "M-Ikhsan-Pasaribu"

- Klik "Review + create" untuk review semua konfigurasi
- Klik "Create" untuk memulai deployment
- Menunggu 2-3 menit hingga deployment selesai

#### 5. Verifikasi Web Server

Setelah deployment selesai, saya melakukan verifikasi untuk memastikan web server berjalan dengan baik:

- Klik "Go to resource" untuk masuk ke halaman management App Service
- Di halaman Overview, saya melihat URL default: https://ukro-recruitment.azurewebsites.net
- Membuka URL tersebut di browser - muncul placeholder page Azure yang menandakan server sudah aktif
- Mengecek status di dashboard:
  - **Status**: Running ✓
  - **Health check**: Healthy ✓
- Server compute telah berhasil dibuat dan siap untuk menerima deployment aplikasi

Pada tahap ini, infrastructure dasar sudah complete. Saya memiliki web server yang running 24/7 di cloud dengan spesifikasi yang cukup untuk menjalankan aplikasi Next.js yang saya kembangkan.

### B. Langkah Instalasi Web App di Server

Setelah web server siap, langkah berikutnya adalah menginstall dan mengkonfigurasi aplikasi Next.js agar dapat berjalan di Azure. Proses ini melibatkan setup environment variables, build configuration, dan deployment automation.

#### 1. Persiapan Repository GitHub

Sebelum deploy, saya memastikan repository GitHub sudah siap dengan struktur yang benar:

- Repository saya di https://github.com/MIkhsanPasaribu/ukrounp-recruitment sudah memiliki file-file penting:
  - `package.json` dengan semua dependencies
  - `next.config.ts` untuk konfigurasi Next.js
  - `.gitignore` untuk mengabaikan node_modules dan file sensitive
- Saya membuat file `.deployment` di root repository untuk memberitahu Azure cara build aplikasi:
  ```ini
  [config]
  SCM_DO_BUILD_DURING_DEPLOYMENT=true
  ```
- File ini memastikan Azure menjalankan `npm install` dan `npm run build` saat deployment

#### 2. Konfigurasi Environment Variables

Environment variables sangat krusial karena berisi credentials untuk database dan konfigurasi aplikasi. Saya melakukan setup di Azure Portal:

- Masuk ke App Service "ukro-recruitment"
- Klik "Configuration" di sidebar kiri
- Di tab "Application settings", klik "+ New application setting"
- Menambahkan satu per satu variable yang dibutuhkan:

**Variable 1 - Supabase URL:**

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://[project-id].supabase.co
```

URL ini menghubungkan aplikasi ke database Supabase yang sudah saya setup sebelumnya.

**Variable 2 - Supabase Service Role Key:**

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGc... (secret key dari Supabase dashboard)
```

Key ini memberikan akses full ke database untuk operasi server-side.

**Variable 3 - JWT Secret:**

```
Name: JWT_SECRET
Value: [random string 32 karakter]
```

Saya generate random string menggunakan PowerShell:

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Secret ini digunakan untuk sign dan verify JWT tokens untuk authentication.

**Variable 4 - Node Environment:**

```
Name: NODE_ENV
Value: production
```

Menandakan aplikasi berjalan dalam production mode.

**Variable 5 - Node Version:**

```
Name: WEBSITE_NODE_DEFAULT_VERSION
Value: 20-lts
```

Memastikan Azure menggunakan Node.js versi 20 LTS.

- Setelah semua variable ditambahkan, klik "Save"
- Klik "Continue" untuk restart aplikasi agar environment variables diterapkan

#### 3. Setup Build Configuration

Saya mengkonfigurasi bagaimana Azure akan build dan run aplikasi:

- Di halaman Configuration, masuk ke tab "General settings"
- **Stack settings**:

  - **Stack**: Node
  - **Major version**: 20 LTS
  - **Minor version**: 20-lts
  - **Startup Command**: `npm run start` (command untuk menjalankan Next.js dalam production mode)

- **Platform settings** - Konfigurasi penting untuk production:

  - **Platform**: 64 Bit
  - **Web sockets**: On (untuk fitur real-time jika diperlukan)
  - **Always On**: On (sangat penting! Menjaga aplikasi tetap warm dan tidak cold start)
  - **ARR affinity**: On
  - **HTTPS Only**: On (memaksa semua traffic menggunakan HTTPS)
  - **Minimum TLS Version**: 1.2 (untuk keamanan)

- Klik "Save" untuk menyimpan semua konfigurasi

#### 4. Setup Automatic Deployment dari GitHub

Salah satu fitur terbaik Azure adalah CI/CD integration dengan GitHub. Saya mengaktifkannya:

- Masuk ke "Deployment Center" dari sidebar
- Source yang sudah terkoneksi:
  - **Source**: GitHub
  - **Organization**: MIkhsanPasaribu
  - **Repository**: ukrounp-recruitment
  - **Branch**: main
- **Build provider**: GitHub Actions (Azure otomatis generate workflow file)
- Klik "Save"

Azure secara otomatis membuat file `.github/workflows/azure-webapps-node.yml` di repository saya. File ini berisi instruksi untuk:

1. Trigger deployment setiap ada push ke branch main
2. Setup Node.js 20
3. Install dependencies dengan `npm ci`
4. Build aplikasi dengan `npm run build`
5. Deploy hasil build ke Azure App Service

#### 5. Monitoring Proses Deployment

Setelah GitHub Actions workflow dibuat, saya monitor deployment pertama:

- Membuka repository di GitHub
- Masuk ke tab "Actions"
- Melihat workflow "Build and deploy Node.js app to Azure Web App" sedang running
- Proses deployment memakan waktu 3-5 menit dengan tahapan:

  - ✓ Checkout code dari repository
  - ✓ Setup Node.js 20
  - ✓ Install dependencies (npm ci)
  - ✓ Build aplikasi Next.js (npm run build)
  - ✓ Deploy artifacts ke Azure
  - ✓ Restart aplikasi

- Saya juga monitor dari sisi Azure:
  - App Service → Deployment Center → Logs
  - Melihat log real-time untuk memastikan tidak ada error

#### 6. Verifikasi Instalasi Aplikasi

Setelah deployment selesai, saya melakukan testing menyeluruh:

**Test 1 - Akses Homepage:**

- Membuka https://ukro-recruitment.azurewebsites.net
- Homepage load dengan sempurna, semua CSS Tailwind terapply dengan benar
- ✓ Navigation bar berfungsi
- ✓ Gambar dan assets load properly

**Test 2 - Test Form Pendaftaran:**

- Navigasi ke `/form`
- Formulir multi-section terbuka dengan benar
- ✓ Semua input fields render dengan proper styling
- ✓ File upload component berfungsi
- ✓ Validation real-time bekerja

**Test 3 - Test Admin Login:**

- Navigasi ke `/login`
- Mencoba login dengan credentials admin
- ✓ Authentication berhasil
- ✓ JWT token tersimpan di cookies
- ✓ Redirect ke dashboard admin

**Test 4 - Test Database Connection:**

- Membuat test application melalui form
- ✓ Data tersimpan ke Supabase
- Login sebagai admin dan cek dashboard
- ✓ Aplikasi test muncul di applications table
- Database connection berjalan sempurna

**Test 5 - Test API Endpoints:**

- `/api/admin/applications` - ✓ Response dengan data aplikasi
- `/api/status` - ✓ Check status berdasarkan NIM/email
- `/api/interview/applications` - ✓ Data kandidat interview

Semua test berhasil, yang menandakan aplikasi telah terinstall dengan sempurna di Azure App Service.

#### 7. Troubleshooting (Jika Ada Error)

Selama proses instalasi, saya juga menyiapkan strategi troubleshooting jika terjadi error:

**Monitoring Logs:**

- App Service → Monitoring → Log stream
- Melihat real-time logs untuk mendeteksi error

**Common issues yang mungkin terjadi:**

1. **Application Error**: Biasanya karena environment variables tidak diset dengan benar
2. **ENOENT errors**: Terjadi jika build gagal atau file tidak ter-generate
3. **Database connection errors**: Credentials Supabase salah atau network blocked
4. **Memory issues**: App Service plan terlalu kecil untuk aplikasi

Namun dalam deployment saya, tidak ada major issues karena saya sudah mempersiapkan semua konfigurasi dengan teliti sebelum deployment.

### C. Langkah Konfigurasi Domain

Tahap akhir adalah menghubungkan custom domain ke aplikasi sehingga lebih profesional dan mudah diingat. Saya menggunakan domain dari Domainesia.com.

#### 1. Persiapan Domain di Domainesia

Langkah pertama adalah mempersiapkan domain di provider:

- Login ke panel Domainesia di https://www.domainesia.com
- Masuk ke "Domain Management" dan memilih domain yang akan digunakan
- Membuka "DNS Management" untuk konfigurasi records

#### 2. Mendapatkan Domain Verification dari Azure

Azure memerlukan verification untuk memastikan saya adalah pemilik domain:

- Di Azure Portal, masuk ke App Service "ukro-recruitment"
- Klik "Custom domains" di sidebar
- Klik "+ Add custom domain"
- Pilih "All other domain services" sebagai domain provider
- Memasukkan domain yang ingin digunakan (misal: ukro-recruitment.com)

Azure menampilkan verification details yang saya catat:

```
Domain verification ID: [string UUID unik]

DNS Records needed:
- Type: TXT
  Name: asuid
  Value: [verification ID]

- Type: CNAME
  Name: www
  Value: ukro-recruitment.azurewebsites.net
```

#### 3. Konfigurasi DNS Records di Domainesia

Saya kembali ke DNS Management Domainesia dan menambahkan records yang diperlukan:

**Record 1 - Domain Verification (TXT Record):**

```
Type: TXT
Host: asuid.ukro-recruitment.com
Value: [verification ID dari Azure]
TTL: 3600
```

Record ini membuktikan kepada Azure bahwa saya adalah pemilik domain.

**Record 2 - Root Domain (A Record):**

```
Type: A
Host: @
Value: [IP address dari Azure]
TTL: 3600
```

IP address saya dapatkan dari halaman Custom domains di Azure. Record ini mengarahkan domain utama ke server Azure.

**Record 3 - WWW Subdomain (CNAME Record):**

```
Type: CNAME
Host: www
Value: ukro-recruitment.azurewebsites.net
TTL: 3600
```

Record ini mengarahkan www.ukro-recruitment.com ke aplikasi Azure.

Setelah semua records ditambahkan, saya klik "Save" atau "Update DNS" di Domainesia. Kemudian saya menunggu DNS propagation yang biasanya memakan waktu 5-30 menit.

#### 4. Verifikasi Domain di Azure

Setelah menunggu propagation, saya kembali ke Azure untuk verify domain:

- Di halaman Custom domains, klik "Validate"
- Azure akan mengecek DNS records yang sudah saya setup
- Jika semua benar, muncul "Validation passed" ✓
- Klik "Add" untuk menambahkan domain ke aplikasi
- Domain sekarang muncul di list custom domains

#### 5. Setup SSL Certificate untuk HTTPS

Keamanan adalah prioritas, jadi saya mengaktifkan HTTPS menggunakan SSL certificate gratis dari Azure:

- Di Custom domains page, klik domain yang baru ditambahkan
- Klik "Add binding"
- Memilih certificate type:
  - **TLS/SSL type**: SNI SSL (gratis dari Azure)
  - **Certificate**: Create App Service Managed Certificate
- Klik "Add"

Azure akan:

- Generate SSL certificate secara otomatis
- Install certificate ke server
- Setup auto-renewal sebelum certificate expired (biasanya 1 tahun)

Proses ini memakan waktu sekitar 5-10 menit. Setelah selesai, aplikasi saya sudah dapat diakses melalui HTTPS dengan SSL certificate yang valid.

#### 6. Mengaktifkan HTTPS Redirect

Untuk memaksa semua traffic menggunakan HTTPS (tidak HTTP), saya mengaktifkan redirect:

- Masuk ke Configuration → General settings
- Mengaktifkan "HTTPS Only": On
- Klik "Save"

Sekarang, jika ada user yang mengakses http://ukro-recruitment.com, mereka akan otomatis diarahkan ke https://ukro-recruitment.com.

#### 7. Verifikasi Domain dan SSL

Testing final untuk memastikan domain dan SSL berfungsi dengan sempurna:

**Test di Browser (Private/Incognito Mode):**

- ✓ http://ukro-recruitment.com → redirect ke HTTPS
- ✓ https://ukro-recruitment.com → load dengan padlock icon 🔒
- ✓ https://www.ukro-recruitment.com → load dengan SSL valid

**Mengecek SSL Certificate:**

- Klik padlock icon di address bar browser
- Melihat detail certificate:
  - Certificate Valid: ✓
  - Issued by: Microsoft Azure TLS Issuing CA
  - Expires: [1 tahun dari sekarang]
  - Auto-renewal: Active

**Test Semua Pages:**

- ✓ Homepage (/)
- ✓ Form pendaftaran (/form)
- ✓ Login page (/login)
- ✓ Admin dashboard (/admin)
- ✓ Interview dashboard (/interview)
- ✓ Developer page (/developer)

Semua pages dapat diakses melalui custom domain dengan HTTPS. Domain configuration telah complete dan aplikasi sekarang production-ready.

#### 8. Setup Domain Redirect (Optional)

Sebagai finishing touch, saya setup redirect dari www ke non-www (atau sebaliknya) untuk konsistensi:

Di Domainesia, menambahkan URL Redirect:

```
Type: URL Redirect
Source: www.ukro-recruitment.com
Destination: https://ukro-recruitment.com
Redirect Type: 301 Permanent
```

Ini memastikan bahwa meskipun user mengetik www, mereka akan diarahkan ke versi non-www, sehingga URL tetap konsisten.

---

## 5. Refleksi dan Pembelajaran

### Pengalaman dan Pembelajaran dari Project

Melalui pengembangan UKRO Recruitment Platform dan deployment ke Microsoft Azure, saya mendapatkan banyak pengalaman berharga dan insight mendalam tentang cloud computing. Berikut adalah refleksi saya secara komprehensif.

#### A. Pemahaman tentang Cloud Computing

Sebelum project ini, pemahaman saya tentang cloud computing masih teoritis. Setelah mengimplementasikan aplikasi ini di Azure, saya benar-benar memahami konsep Infrastructure as a Service (IaaS) dan Platform as a Service (PaaS). Azure App Service yang saya gunakan adalah contoh perfect dari PaaS - saya tidak perlu khawatir tentang operating system updates, security patches, atau server maintenance. Azure menangani semua aspek infrastructure, dan saya bisa fokus pada development aplikasi.

Saya belajar bahwa cloud computing bukan hanya tentang "menaruh aplikasi di internet", tetapi tentang memanfaatkan managed services yang optimized untuk scalability, reliability, dan cost-efficiency. Konsep seperti auto-scaling, load balancing, dan distributed systems yang sebelumnya hanya saya baca di textbook, sekarang saya pahami dari praktik langsung.

#### B. Keuntungan Menggunakan Cloud Server dibanding Local Server

Dari pengalaman deployment ini, saya mengidentifikasi beberapa keuntungan signifikan cloud server dibanding local server:

**1. Accessibility dan Uptime**

Aplikasi saya dapat diakses 24/7 dari mana saja di dunia dengan internet connection. Azure menjamin uptime 99.95% dengan SLA mereka. Jika saya menggunakan local server di kampus, aplikasi hanya bisa diakses saat server menyala dan network kampus stabil. Selain itu, pemadaman listrik atau gangguan jaringan lokal akan membuat aplikasi down. Dengan cloud, infrastructure redundancy dan automatic failover memastikan aplikasi tetap running meskipun ada hardware failure.

**2. Scalability**

Saat periode pendaftaran puncak, ratusan mahasiswa mungkin mengakses aplikasi secara bersamaan. Azure App Service dapat auto-scale dengan menambah instance secara otomatis sesuai traffic. Saya bisa upgrade dari B1 ke B2 atau bahkan P1V2 tier hanya dengan beberapa klik tanpa downtime. Dengan local server, saya harus membeli hardware baru, install, dan configure secara manual - proses yang memakan waktu berhari-hari atau berminggu-minggu.

**3. Cost Efficiency**

Meskipun terlihat seperti saya "membayar" untuk cloud, sebenarnya lebih cost-effective dibanding local server. Dengan Azure B1 ($13/bulan = ~Rp 195.000), saya mendapatkan:

- Server yang running 24/7
- Bandwidth 100GB gratis
- SSL certificate gratis dengan auto-renewal
- Application monitoring dan logging
- Automatic backups
- Security updates otomatis

Jika menggunakan local server, saya harus:

- Beli server fisik (minimal Rp 5-10 juta)
- Bayar listrik 24/7 (estimasi Rp 200-300 ribu/bulan)
- Bayar internet dedicated (Rp 500 ribu - 1 juta/bulan)
- Bayar SSL certificate (Rp 500 ribu - 2 juta/tahun)
- Maintenance dan cooling system
- Total initial investment bisa mencapai Rp 10-15 juta, belum operational cost

**4. Security dan Compliance**

Azure menyediakan security features yang sulit diimplementasikan di local server:

- DDoS protection untuk mencegah serangan
- Web Application Firewall (WAF)
- Encryption at rest dan in transit
- Regular security patches otomatis
- Compliance certifications (ISO, SOC, dll)

Dengan local server, saya harus manually configure firewall, implement security measures, dan constantly monitor untuk threats - requiring expertise dan time yang signifikan.

**5. Backup dan Disaster Recovery**

Azure automatically backup application dan data saya. Jika terjadi kesalahan, saya bisa restore ke previous state dalam hitungan menit. Azure juga menyediakan geo-redundancy - data saya di-replicate ke multiple data centers. Jika satu data center mengalami disaster, aplikasi tetap berjalan dari data center lain.

Dengan local server, saya harus manually setup backup system, maintain backup storage, dan test disaster recovery procedures - kompleks dan error-prone.

**6. Development dan Deployment Speed**

CI/CD integration dengan GitHub Actions membuat deployment extremely fast. Setiap kali saya push code ke GitHub, aplikasi otomatis build dan deploy dalam 3-5 menit. Saya bisa iterate dan release features dengan cepat tanpa manual deployment steps.

Dengan local server, saya harus:

- SSH ke server
- Pull code dari Git
- Manually build aplikasi
- Restart services
- Check for errors
- Proses ini memakan 20-30 menit setiap deployment

**7. Monitoring dan Analytics**

Application Insights memberikan saya visibility ke:

- Request rates dan response times
- Failure rates dan exceptions
- User behavior dan page views
- Server performance metrics

Data ini invaluable untuk optimizing aplikasi dan troubleshooting issues. Dengan local server, saya harus manually setup monitoring tools seperti Prometheus dan Grafana.

**8. Global Reach**

Dengan Azure, saya bisa dengan mudah deploy aplikasi ke multiple regions. Jika nanti UKRO ingin expand recruitment ke kampus lain di Indonesia atau bahkan internasional, saya bisa add regions di Jakarta, Sydney, atau Singapore dengan beberapa clicks. User akan automatically routed ke nearest region untuk optimal performance.

Local server terbatas pada satu physical location dengan latency tinggi untuk user yang jauh.

#### C. Tantangan yang Dihadapi

Tentu saja, cloud deployment juga memiliki challenges:

**1. Learning Curve**

Azure memiliki hundreds of services dengan dokumentasi yang overwhelming. Awalnya saya bingung memilih antara App Service, Container Instances, Virtual Machines, atau Static Web Apps. Saya harus invest waktu untuk understanding service terbaik untuk use case saya. Namun, learning ini sangat valuable dan applicable untuk future projects.

**2. Cost Management**

Tanpa proper monitoring, cloud costs bisa escalate quickly. Saya harus carefully memilih tier yang appropriate dan set up budget alerts. Saya juga belajar pentingnya optimization - seperti enabling "Always On" hanya saat necessary, implementing caching untuk reduce database calls, dan optimizing images untuk reduce bandwidth usage.

**3. Dependency pada Internet**

Management dan monitoring aplikasi require internet connection. Jika internet saya down, saya tidak bisa access Azure Portal. However, ini minor issue karena aplikasi tetap running - hanya management yang terhambat.

**4. Vendor Lock-in**

Menggunakan Azure-specific features seperti App Service Managed Certificates atau Application Insights creates dependency pada Azure. Jika suatu saat saya ingin migrate ke AWS atau Google Cloud, akan ada effort untuk refactoring. However, saya mitigate ini dengan using standard technologies (Node.js, PostgreSQL) yang portable across platforms.

#### D. Best Practices yang Saya Pelajari

Dari project ini, saya identify several best practices:

1. **Environment Variables**: Never hardcode credentials dalam code. Always use environment variables
2. **HTTPS Everywhere**: Always enforce HTTPS untuk security
3. **Monitoring**: Setup monitoring dari awal, bukan setelah ada problems
4. **CI/CD**: Automate deployment untuk reduce human errors
5. **Resource Tagging**: Use tags untuk organization dan cost tracking
6. **Documentation**: Document setiap step untuk future reference (seperti yang saya lakukan dalam laporan ini)
7. **Testing**: Test thoroughly sebelum production deployment
8. **Backup Strategy**: Always have backup dan disaster recovery plan

#### E. Rekomendasi untuk Pengembangan Selanjutnya

Berdasarkan pengalaman saya, berikut rekomendasi untuk future improvements:

1. **Implement CDN**: Use Azure CDN untuk serve static assets lebih cepat
2. **Database Optimization**: Implement read replicas untuk improve query performance
3. **Caching Layer**: Add Redis cache untuk frequently accessed data
4. **Load Testing**: Conduct load testing untuk understand application limits
5. **Multi-Region Deployment**: Deploy ke multiple regions untuk high availability
6. **Container Migration**: Consider migrating ke Azure Container Apps untuk better scalability
7. **Advanced Monitoring**: Implement custom metrics dan alerts untuk proactive issue detection

#### F. Kesimpulan Refleksi

Project ini memberikan saya hands-on experience yang invaluable dalam cloud computing. Saya tidak hanya belajar technical skills seperti Azure deployment, DNS configuration, dan CI/CD setup, tetapi juga soft skills seperti problem-solving, documentation, dan decision-making under budget constraints.

Keputusan untuk menggunakan cloud server adalah absolutely correct untuk use case ini. Benefits dari accessibility, scalability, security, dan cost-efficiency far outweigh the challenges. Saya confident bahwa UKRO Recruitment Platform dapat serve ratusan atau bahkan ribuan users dengan reliable performance, dan saya dapat easily scale atau modify aplikasi sesuai kebutuhan future.

Yang paling penting, saya sekarang memiliki solid foundation dalam cloud computing yang applicable tidak hanya untuk academic projects, tetapi juga untuk real-world professional scenarios. Skills yang saya dapatkan - dari Azure Portal navigation, GitHub Actions CI/CD, DNS management, SSL configuration, hingga performance optimization - adalah skills yang highly valued di industry.

---

## 6. Screenshot Website

### 6.1 Homepage - Landing Page

![Homepage](placeholder-homepage.png)

**Penjelasan:**
Homepage adalah halaman pertama yang dilihat pengunjung saat mengakses aplikasi. Saya mendesain homepage dengan clean layout yang menampilkan informasi tentang UKRO dan tombol call-to-action untuk memulai pendaftaran. Di bagian atas terdapat navigation bar dengan link ke berbagai section. Background menggunakan gradient modern dan typography yang readable. Terdapat juga modal untuk verifikasi WhatsApp dan tutorial penggunaan sistem.

Footer menampilkan credit "Developed by M. Ikhsan Pasaribu (23076039)" dengan link ke GitHub profile saya, memberikan attribution yang proper untuk project ini.

### 6.2 Form Pendaftaran - Section 1 (Data Pribadi)

![Form Section 1](placeholder-form-section1.png)

**Penjelasan:**
Form pendaftaran dibagi menjadi multiple sections untuk better user experience. Section 1 mengumpulkan data pribadi dan akademik seperti NIM, nama lengkap, email, nomor telepon, alamat, fakultas, jurusan, program studi, tingkat pendidikan (D3/D4/S1), semester, tahun masuk, dan IPK. Setiap field memiliki validation real-time yang memberikan feedback immediate kepada user. Design menggunakan Tailwind CSS dengan proper spacing dan consistent styling. Progress indicator di atas menunjukkan user berada di section mana dari total sections yang ada.

### 6.3 Form Pendaftaran - Section 2 (Essay dan Skills)

![Form Section 2](placeholder-form-section2.png)

**Penjelasan:**
Section 2 mengumpulkan informasi qualitative seperti essay motivasi bergabung dengan UKRO, rencana masa depan jika diterima, dan alasan mengapa pendaftar layak diterima. Terdapat juga section untuk memilih software yang dikuasai dalam kategori desain (Figma, Adobe XD, Photoshop, Illustrator), video editing (Premiere Pro, After Effects, CapCut, Filmora), dan engineering tools (AutoCAD, SolidWorks, MATLAB). Textarea untuk essay memiliki character counter dan minimum character requirement untuk ensure quality submissions.

### 6.4 Form Pendaftaran - File Upload

![Form File Upload](placeholder-form-upload.png)

**Penjelasan:**
Section file upload memungkinkan kandidat mengunggah dokumen pendukung seperti foto formal, foto informal, kartu mahasiswa, KRS semester aktif, bukti hasil test MBTI, dan screenshot akun media sosial (Instagram/TikTok/YouTube) sebagai bukti aktivitas. Setiap file field memiliki preview image setelah upload dan validation untuk file type dan size (maksimum 5MB per file). Files di-encode sebagai Base64 dan disimpan langsung di database Supabase. Drag-and-drop functionality juga tersedia untuk better UX.

### 6.5 Status Check Page

![Status Check](placeholder-status-check.png)

**Penjelasan:**
Halaman ini memungkinkan kandidat mengecek status aplikasi mereka dengan memasukkan NIM atau email. Setelah submit, sistem akan menampilkan informasi lengkap tentang status current (Sedang Ditinjau, Daftar Pendek, Interview, Diterima, atau Ditolak), timeline status changes, dan jika ada interview scheduled, akan menampilkan tanggal, waktu, dan lokasi interview. Design menggunakan color-coding untuk different statuses - kuning untuk pending, biru untuk shortlisted, ungu untuk interview, hijau untuk accepted, dan merah untuk rejected.

### 6.6 Admin Login Page

![Admin Login](placeholder-admin-login.png)

**Penjelasan:**
Halaman login untuk admin dan interviewer dengan clean design dan proper security. User memasukkan username dan password, kemudian sistem verify credentials terhadap database dengan bcrypt password hashing. Jika valid, JWT token di-generate dan disimpan dalam HTTP-only cookie untuk security. Terdapat error handling untuk wrong credentials dengan user-friendly error messages. Design minimalist dengan focus pada login form, background gradient yang matching dengan overall theme aplikasi.

### 6.7 Admin Dashboard - Overview

![Admin Dashboard Overview](placeholder-admin-dashboard.png)

**Penjelasan:**
Dashboard admin adalah command center untuk mengelola semua aplikasi. Di bagian atas terdapat statistics cards menampilkan total applications, pending reviews, shortlisted candidates, scheduled interviews, accepted, dan rejected - semuanya dengan real-time data. Terdapat chart untuk visualize application trends over time menggunakan Chart.js. Sidebar navigation memberikan akses ke different sections seperti Applications, Interview Management, Settings, dan Logs. Color scheme professional dengan blue primary color dan proper spacing.

### 6.8 Admin Dashboard - Applications Table

![Applications Table](placeholder-applications-table.png)

**Penjelasan:**
Tabel aplikasi menampilkan semua submissions dengan infinite scrolling atau pagination. Kolom mencakup NIM, nama, email, fakultas, jurusan, status, dan action buttons. Admin dapat search berdasarkan nama/NIM, filter berdasarkan status, dan sort berdasarkan submission date. Bulk actions memungkinkan admin untuk approve atau reject multiple applications sekaligus dengan checkbox selection. Setiap row memiliki actions untuk view details, change status, download CV/documents, dan delete application. Table responsive dan optimized untuk performance dengan data caching.

### 6.9 Admin Dashboard - Application Detail

![Application Detail](placeholder-application-detail.png)

**Penjelasan:**
Halaman detail menampilkan complete information tentang satu aplikasi. Terdiri dari multiple sections: Personal Information (data pribadi), Academic Information (IPK, semester, tahun masuk), Contact Details (email, phone, WhatsApp), Essays (motivation, future plans, why should be accepted), Skills (software capabilities), dan Uploaded Documents dengan preview atau download links. Admin dapat change status aplikasi dari dropdown, add notes, schedule interview, atau assign interviewer. Status history menampilkan timeline perubahan status dengan timestamp dan admin yang melakukan action.

### 6.10 Admin Dashboard - Interview Workflow

![Interview Workflow](placeholder-interview-workflow.png)

**Penjelasan:**
Fitur interview workflow memungkinkan admin mengelola proses interview secara sistematis. Halaman ini menampilkan candidates dengan status INTERVIEW, dengan options untuk mark attendance (hadir/tidak hadir), assign ke specific interviewer (Pewawancara 1-7), dan set interview schedule. Terdapat visual indicators untuk attendance status dan assignment status. Admin juga dapat bulk assign multiple candidates ke satu interviewer untuk efficiency. Integration dengan interviewer dashboard memastikan interviewer dapat langsung see assigned candidates.

### 6.11 Interviewer Dashboard

![Interviewer Dashboard](placeholder-interviewer-dashboard.png)

**Penjelasan:**
Dashboard khusus untuk interviewer menampilkan list kandidat yang di-assign kepada mereka. Untuk setiap kandidat, interviewer dapat view profile lengkap, read essays dan check skills, kemudian memberikan score dan notes setelah interview. Scoring system menggunakan numerical scale dan kategori (communication skills, technical knowledge, motivation, dll). Notes field memungkinkan interviewer menulis detailed feedback. Setelah submit, data tersimpan dan admin dapat review interview results untuk final decision.

### 6.12 Developer Page - Profile

![Developer Page](placeholder-developer-page.png)

**Penjelasan:**
Halaman developer adalah personal profile page saya yang accessible melalui URL langsung `/developer`. Halaman ini menampilkan informasi tentang saya sebagai developer project ini - M. Ikhsan Pasaribu, mahasiswa Pendidikan Teknik Informatika Universitas Negeri Padang. Terdapat photo profile, description about me, skills dengan animated progress bars (HTML/CSS, JavaScript, React, Next.js, Node.js, Database, Cloud Computing), dan links ke social media (GitHub, LinkedIn, Instagram).

Terdapat juga button "View Project Repository" yang mengarah ke GitHub repository project ini (https://github.com/MIkhsanPasaribu/ukrounp-recruitment), memberikan transparency dan allowing others untuk see source code dan learn dari implementation saya. Design menggunakan dark theme dengan accent colors yang eye-catching.

### 6.13 Admin Logs - Audit Trail

![Admin Logs](placeholder-admin-logs.png)

**Penjelasan:**
Halaman admin logs menampilkan complete audit trail dari semua actions yang dilakukan oleh admin users. Setiap log entry mencakup timestamp, admin username, action type (CREATE, UPDATE, DELETE, LOGIN, LOGOUT), affected table, record ID, old value dan new value dalam JSON format, dan IP address serta user agent. Fitur ini crucial untuk accountability dan troubleshooting. Admin dapat filter logs by date range, action type, atau specific admin user. Logs disimpan permanently di database untuk compliance purposes.

### 6.14 Settings - System Configuration

![Settings Page](placeholder-settings.png)

**Penjelasan:**
Halaman settings memberikan control kepada admin untuk system-wide configuration. Settings include:

- Registration status (open/closed) untuk control whether form accepting new submissions
- Maximum applications limit untuk prevent spam
- Registration deadline
- Email notification settings untuk automated emails
- Application requirements configuration
- PDF generation settings (watermark, logo)
- File upload limits (max size 5MB)

Setiap setting disimpan dalam `settings` table di database dengan key-value structure, memungkinkan flexible configuration tanpa code changes. Changes take effect immediately setelah save.

---

## 7. Referensi

Dalam pengembangan project ini dan penulisan dokumentasi, saya merujuk pada berbagai sumber dan dokumentasi resmi. Berikut adalah daftar referensi yang saya gunakan:

### Dokumentasi Resmi dan Technical References

1. **Microsoft Azure Documentation**

   - Azure App Service Documentation: https://docs.microsoft.com/en-us/azure/app-service/
   - Azure Pricing Calculator: https://azure.microsoft.com/en-us/pricing/calculator/
   - Azure Application Insights: https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview
   - Diakses sepanjang periode development (2024-2025)

2. **Next.js Official Documentation**

   - Next.js 15 Documentation: https://nextjs.org/docs
   - Next.js Deployment: https://nextjs.org/docs/deployment
   - Next.js API Routes: https://nextjs.org/docs/pages/building-your-application/routing/api-routes
   - Diakses sepanjang periode development (2024-2025)

3. **Supabase Documentation**

   - Supabase JavaScript Client: https://supabase.com/docs/reference/javascript/introduction
   - Supabase Database: https://supabase.com/docs/guides/database
   - Supabase Storage: https://supabase.com/docs/guides/storage
   - Diakses sepanjang periode development (2024-2025)

4. **React Documentation**

   - React 19 Documentation: https://react.dev/
   - React Hooks Reference: https://react.dev/reference/react
   - Diakses: 2024-2025

5. **TypeScript Documentation**
   - TypeScript Official Docs: https://www.typescriptlang.org/docs/
   - TypeScript with Next.js: https://nextjs.org/docs/basic-features/typescript
   - Diakses: 2024-2025

### Cloud Computing dan DevOps

6. **GitHub Actions Documentation**

   - GitHub Actions for Azure: https://github.com/Azure/actions
   - Workflow Syntax: https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions
   - Diakses: 2024-2025

7. **DNS dan Domain Configuration**

   - Domainesia Knowledge Base: https://www.domainesia.com/kb/
   - DNS Records Explained: https://www.cloudflare.com/learning/dns/dns-records/
   - Diakses: 2024-2025

8. **SSL/TLS Certificates**
   - Azure Managed Certificates: https://docs.microsoft.com/en-us/azure/app-service/configure-ssl-certificate
   - Let's Encrypt Documentation: https://letsencrypt.org/docs/
   - Diakses: 2024-2025

### Security dan Authentication

9. **JWT (JSON Web Tokens)**

   - JWT.io Introduction: https://jwt.io/introduction
   - JWT Best Practices: https://tools.ietf.org/html/rfc8725
   - Diakses: 2024-2025

10. **bcrypt Password Hashing**
    - bcryptjs npm package: https://www.npmjs.com/package/bcryptjs
    - Password Hashing Best Practices: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
    - Diakses: 2024-2025

### Libraries dan Tools

11. **Tailwind CSS**

    - Tailwind CSS Documentation: https://tailwindcss.com/docs
    - Tailwind with Next.js: https://tailwindcss.com/docs/guides/nextjs
    - Diakses: 2024-2025

12. **Chart.js**

    - Chart.js Documentation: https://www.chartjs.org/docs/latest/
    - React Chart.js 2: https://react-chartjs-2.js.org/
    - Diakses: 2024-2025

13. **PDF Generation**
    - jsPDF Documentation: https://github.com/parallax/jsPDF
    - PDFKit Documentation: https://pdfkit.org/
    - Diakses: 2024-2025

### Architecture dan Best Practices

14. **Clean Architecture**

    - Martin, Robert C. "Clean Architecture: A Craftsman's Guide to Software Structure and Design." Prentice Hall, 2017.

15. **RESTful API Design**

    - Fielding, Roy Thomas. "Architectural Styles and the Design of Network-based Software Architectures." PhD dissertation, University of California, Irvine, 2000.

16. **Web Security**
    - OWASP Top 10: https://owasp.org/www-project-top-ten/
    - Web Application Security Best Practices: https://owasp.org/www-project-web-security-testing-guide/
    - Diakses: 2024-2025

### Tutorials dan Learning Resources

17. **Azure for Students**

    - Microsoft Learn - Azure Fundamentals: https://docs.microsoft.com/en-us/learn/paths/azure-fundamentals/
    - Azure for Students Program: https://azure.microsoft.com/en-us/free/students/
    - Diakses: 2024-2025

18. **Next.js Deployment to Azure**
    - Various Medium articles and blog posts tentang Next.js deployment
    - Stack Overflow discussions untuk troubleshooting
    - Diakses sepanjang periode development

### Repository dan Source Code

19. **Project Repository**

    - UKRO Recruitment Platform: https://github.com/MIkhsanPasaribu/ukrounp-recruitment
    - Created and maintained by M. Ikhsan Pasaribu (2024-2025)

20. **Node.js dan npm**
    - Node.js Documentation: https://nodejs.org/docs/
    - npm Registry: https://www.npmjs.com/
    - Diakses: 2024-2025

### Academic References

21. **Cloud Computing Concepts**

    - Mell, Peter, and Timothy Grance. "The NIST definition of cloud computing." National Institute of Standards and Technology, 2011.

22. **Web Development**
    - Mozilla Developer Network (MDN): https://developer.mozilla.org/
    - Web.dev by Google: https://web.dev/
    - Diakses secara regular sepanjang 2024-2025

### Supporting Tools

23. **Git Version Control**

    - Git Documentation: https://git-scm.com/doc
    - GitHub Docs: https://docs.github.com/
    - Diakses: 2024-2025

24. **Visual Studio Code**

    - VS Code Documentation: https://code.visualstudio.com/docs
    - VS Code Extensions for React/Next.js
    - Diakses: 2024-2025

25. **PostgreSQL Database**
    - PostgreSQL Documentation: https://www.postgresql.org/docs/
    - SQL Best Practices and Optimization
    - Diakses: 2024-2025

---

**Catatan:** Semua website dan dokumentasi diakses dan diverifikasi sepanjang periode pengembangan project (2024-2025). URL dan content mungkin berubah seiring waktu. Screenshot dan code samples dalam dokumentasi ini diambil langsung dari implementation actual dalam project UKRO Recruitment Platform.

---

**Akhir Dokumentasi**

Dokumen ini disusun sebagai laporan lengkap pengembangan dan deployment UKRO Recruitment Platform ke Microsoft Azure. Semua informasi teknis, langkah-langkah implementasi, dan refleksi ditulis berdasarkan pengalaman actual dalam mengembangkan dan men-deploy aplikasi production-ready.

**Dibuat oleh:**  
M. Ikhsan Pasaribu  
NIM: 23076039  
Pendidikan Teknik Informatika  
Universitas Negeri Padang  
2025
