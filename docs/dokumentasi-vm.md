# Pengembangan Web Server Sistem Rekrutmen Unit Kegiatan Robotika Universitas Negeri Padang Menggunakan Layanan Komputasi Microsoft Azure

---

## 1. Identitas

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

## 3. Penjelasan Project

### A. Latar Belakang

Dalam era digital saat ini, proses rekrutmen organisasi kemahasiswaan memerlukan sistem yang efisien, terstruktur, dan dapat diakses dari mana saja. Unit Kegiatan Robotika (UKRO) Universitas Negeri Padang sebagai salah satu organisasi mahasiswa yang aktif membutuhkan sistem rekrutmen yang mampu mengelola ratusan pendaftar secara efektif.

Sebelumnya, proses rekrutmen UKRO dilakukan secara manual menggunakan formulir kertas atau spreadsheet sederhana yang memiliki banyak keterbatasan. Pendaftar harus datang langsung ke sekretariat untuk mengisi formulir, data tersebar di berbagai file, dan proses verifikasi memakan waktu sangat lama. Saya menyadari bahwa pendekatan manual ini tidak efisien dan rentan terhadap kesalahan data serta kehilangan dokumen penting.

Oleh karena itu, saya mengembangkan **UKRO Recruitment Platform** - sebuah aplikasi web berbasis cloud yang dirancang untuk mengotomatisasi dan mempermudah seluruh proses rekrutmen. Aplikasi ini saya bangun menggunakan Next.js 15.2.3 sebagai framework utama, Supabase sebagai database cloud, dan deploy menggunakan Microsoft Azure Virtual Machine untuk memastikan aplikasi dapat diakses 24/7 dengan performa yang optimal.

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

Dengan menggunakan cloud computing melalui Microsoft Azure Virtual Machine, aplikasi ini dapat berjalan 24/7 dengan uptime tinggi, skalabilitas manual saat traffic meningkat, dan biaya operasional yang terkontrol. Saya memilih Azure VM karena memberikan kontrol penuh atas server environment, memungkinkan kustomisasi konfigurasi yang detail, dan cost-effective dengan budget $50-70 yang tersedia.

### B. Identitas Domain

| **Aspek**              | **Detail**                                                                |
| ---------------------- | ------------------------------------------------------------------------- |
| URL Aplikasi           | [https://mikhsanpasaribu.my.id](https://mikhsanpasaribu.my.id)            |
| Jenis Aplikasi         | Web Application (Full-Stack Next.js)                                      |
| Provider Domain        | Domainesia.com                                                            |
| Cloud Provider         | Microsoft Azure                                                           |
| Compute Service        | Azure Virtual Machine (Ubuntu 22.04 LTS)                                  |
| VM Size                | B2s (2 vCPU, 4 GB RAM, 8 GB SSD)                                          |
| Database Provider      | Supabase (PostgreSQL Cloud Database)                                      |
| DNS Configuration      | A record ke IP VM Azure, CNAME untuk www subdomain                        |
| SSL Certificate        | Let's Encrypt (Free SSL dengan auto-renewal)                              |
| Web Server             | Nginx dengan reverse proxy ke Node.js                                     |
| Process Manager        | PM2 untuk Node.js application management                                  |
| Region                 | Southeast Asia (Singapore)                                                |
| Estimasi Biaya Bulanan | ~$50-70 USD                                                               |
| Tech Stack             | Next.js 15.2.3, React 19, TypeScript, Tailwind CSS, Supabase, Node.js 20  |
| Monitoring             | Azure Monitor + Nginx access/error logs                                   |
| Environment Variables  | NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, NODE_ENV |
| Build Configuration    | yarn install → yarn build → pm2 start ecosystem.config.js                 |
| File Storage           | Base64 encoded dalam database Supabase (max 5MB per file)                 |
| Authentication         | JWT Token + bcrypt password hashing                                       |
| Status Deployment      | Production (Self-managed VM dengan full control)                          |

**Konfigurasi DNS di Domainesia:**

- **A Record**: @ → IP Address Azure VM (Public IP)
- **CNAME Record**: www → mikhsanpasaribu.my.id
- **TXT Record**: Domain verification untuk Azure dan SSL
- **TTL**: 3600 seconds (1 jam)

**Alasan memilih Azure Virtual Machine:**

1. **Full Control**: Akses root untuk kustomisasi server configuration yang detail
2. **Cost Effective**: VM B2s memberikan resource yang cukup dengan budget terbatas
3. **Learning Experience**: Hands-on experience dengan Linux server administration
4. **Flexibility**: Bebas install dan configure software sesuai kebutuhan
5. **Scalability**: Dapat upgrade VM size kapan saja sesuai traffic
6. **Geographic**: Region Singapore memberikan latency rendah untuk Indonesia
7. **Monitoring**: Full access ke system logs dan performance metrics
8. **Custom Environment**: Setup development tools dan debugging utilities

## 4. Langkah-Langkah Pengembangan Web Server

### A. Langkah Pembuatan Compute/Web Server di Azure

Proses pertama yang saya lakukan adalah membuat infrastructure dasar di Microsoft Azure untuk menjalankan aplikasi web. Berikut adalah langkah-langkah detail yang saya ikuti:

#### 1. Persiapan Akun Azure

Pertama-tama, saya login ke Azure Portal di [https://portal.azure.com](https://portal.azure.com) menggunakan akun Microsoft yang sudah terdaftar. Saya memverifikasi bahwa akun saya memiliki kredit Azure untuk student sebesar $100 yang dapat digunakan untuk deployment. Verifikasi ini saya lakukan melalui menu "Cost Management + Billing" untuk memastikan budget tersedia sebelum membuat resource apapun.

#### 2. Membuat Resource Group

Resource Group adalah container logis yang menampung semua resource Azure yang terkait dengan satu project. Saya membuat resource group baru dengan langkah berikut:

- Mencari "Resource groups" menggunakan search bar di bagian atas portal
- Klik tombol "+ Create" untuk membuat resource group baru
- Mengisi form dengan detail:
  - **Subscription**: Azure for Students
  - **Resource Group Name**: ukro-recruitment-rg
  - **Region**: Southeast Asia (Singapore)
- Memilih region Singapore karena lokasi ini paling dekat dengan Indonesia sehingga memberikan latency yang rendah untuk akses dari user di Indonesia
- Klik "Review + create" lalu "Create"

Setelah beberapa detik, resource group berhasil dibuat dan siap menampung semua resource lainnya.

#### 3. Membuat Virtual Machine

Virtual Machine adalah compute resource utama yang akan menjalankan aplikasi web. Ini merupakan langkah krusial karena menentukan performa dan biaya operasional. Langkah yang saya lakukan:

- Mencari "Virtual machines" di search bar Azure Portal
- Klik "+ Create" dan pilih "Azure virtual machine"

**Tab Basics - Konfigurasi dasar VM:**

- **Subscription**: Azure for Students
- **Resource group**: ukro-recruitment-rg (yang sudah dibuat sebelumnya)
- **Virtual machine name**: ukro-recruitment-vm
- **Region**: Southeast Asia (Singapore)
- **Image**: Ubuntu Server 22.04 LTS - x64 Gen2
- **Size**: B2s (2 vCPUs, 4 GiB memory) - optimal untuk aplikasi web dengan budget terbatas
- **Authentication type**: SSH public key
- **Username**: ikhsan
- **SSH public key source**: Generate new key pair
- **Key pair name**: ukro-vm-key

**Tab Disks - Konfigurasi storage:**

- **OS disk type**: Standard SSD (locally-redundant storage)
- **Delete with VM**: Checked
- Tidak menambah data disk karena 8GB SSD cukup untuk aplikasi

**Tab Networking - Setup network configuration:**

- **Virtual network**: Create new "ukro-vnet"
- **Subnet**: default (10.0.0.0/24)
- **Public IP**: Create new "ukro-vm-ip"
- **NIC network security group**: Advanced
- **Configure network security group**: Create new dengan rules:
  - SSH (22) - Allow dari My IP
  - HTTP (80) - Allow dari Internet
  - HTTPS (443) - Allow dari Internet

**Tab Management - Monitoring dan backup:**

- **Boot diagnostics**: Enable with managed storage account
- **Auto-shutdown**: Enable at 11:00 PM GMT+7 (untuk cost saving)
- **Backup**: Enable dengan daily backup policy

Setelah semua konfigurasi selesai:

- Klik "Review + create" untuk validasi konfigurasi
- Klik "Create" untuk deploy VM
- Download SSH private key yang di-generate otomatis
- Menunggu 3-5 menit hingga deployment selesai

#### 4. Initial Server Setup dan Security Hardening

Setelah VM running, saya melakukan koneksi dan setup dasar:

```bash
# 1. Connect ke VM via SSH
ssh -i ukro-vm-key.pem ikhsan@<VM_PUBLIC_IP>

# 2. Update system packages
sudo apt update && sudo apt upgrade -y

# 3. Configure UFW firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# 4. Setup fail2ban untuk protection
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 5. Configure timezone
sudo timedatectl set-timezone Asia/Jakarta

# 6. Create swap file (untuk memory tambahan)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### B. Instalasi dan Konfigurasi Web Application

1. **Setup Runtime Environment**

   ```bash
   # Install Node.js 20.x LTS
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   node --version  # Verify version 20.x

   # Install build tools
   sudo apt install -y git build-essential python3 make g++

   # Install development utilities
   sudo npm install -g pm2 yarn typescript
   ```

2. **Project Deployment**

   ```bash
   # Create application directory
   sudo mkdir -p /var/www/ukro-recruitment
   sudo chown -R $USER:$USER /var/www/ukro-recruitment

   # Clone repository
   git clone https://github.com/MIkhsanPasaribu/ititanix-recruitment.git /var/www/ukro-recruitment
   cd /var/www/ukro-recruitment

   # Install dependencies
   yarn install --frozen-lockfile

   # Build aplikasi
   yarn build

   # Setup process management
   pm2 ecosystem create ukro-recruitment
   pm2 start ecosystem.config.js
   pm2 save
   ```

3. **Nginx Configuration**

   ```nginx
   # /etc/nginx/sites-available/ukro-recruitment
   server {
       listen 80;
       server_name mikhsanpasaribu.my.id www.mikhsanpasaribu.my.id;

       # Security headers
       add_header X-Frame-Options "SAMEORIGIN";
       add_header X-XSS-Protection "1; mode=block";
       add_header X-Content-Type-Options "nosniff";

       # Root directory
       root /var/www/ukro-recruitment;

       # Proxy settings
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;

           # WebSocket support
           proxy_set_header Connection "upgrade";
       }

       # Static files
       location /_next/static {
           alias /var/www/ukro-recruitment/.next/static;
           expires 365d;
           access_log off;
       }
   }
   ```

4. **Environment Configuration**

   ```bash
   # Create .env.production file
   cat > /var/www/ukro-recruitment/.env.production << EOF
   # Database Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Authentication
   JWT_SECRET=$(openssl rand -base64 32)

   # Application Settings
   NODE_ENV=production
   PORT=3000
   NEXT_TELEMETRY_DISABLED=1

   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-specific-password

   # Storage Settings
   MAX_UPLOAD_SIZE=5242880
   STORAGE_BUCKET=ukro-recruitment-files
   EOF

   # Set correct permissions
   sudo chown www-data:www-data /var/www/ukro-recruitment/.env.production
   sudo chmod 600 /var/www/ukro-recruitment/.env.production
   ```

5. **Security Configuration**

   ```bash
   # Setup rate limiting in Nginx
   cat > /etc/nginx/conf.d/rate-limit.conf << EOF
   limit_req_zone \$binary_remote_addr zone=one:10m rate=1r/s;
   limit_conn_zone \$binary_remote_addr zone=addr:10m;
   EOF

   # Configure ModSecurity WAF
   sudo apt install -y libmodsecurity3 modsecurity-crs
   sudo ln -s /etc/nginx/modsec/main.conf /etc/nginx/modsecurity.conf

   # Enable ModSecurity in Nginx
   sudo sed -i 's/SecRuleEngine DetectionOnly/SecRuleEngine On/' /etc/nginx/modsecurity.conf
   ```

6. **Performance Optimization**

   ```bash
   # Configure Nginx caching
   cat > /etc/nginx/conf.d/cache-control.conf << EOF
   proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=STATIC:10m inactive=7d use_temp_path=off;

   map \$sent_http_content_type \$expires {
       default                    off;
       text/html                  epoch;
       text/css                   max;
       application/javascript     max;
       ~image/                    max;
   }
   EOF

   # Setup Brotli compression
   sudo apt install -y nginx-module-brotli
   cat > /etc/nginx/conf.d/brotli.conf << EOF
   brotli on;
   brotli_comp_level 6;
   brotli_types text/plain text/css application/javascript application/json image/svg+xml;
   EOF
   ```

### C. Domain Management dan SSL Configuration

1. **DNS Configuration di Domainesia**

   ```bash
   # Login ke panel Domainesia
   # Navigasi ke DNS Management

   # 1. Setup A Record untuk root domain
   Type: A
   Name: @
   Value: [VM_PUBLIC_IP]  # IP dari Azure VM
   TTL: 3600

   # 2. Setup CNAME untuk www subdomain
   Type: CNAME
   Name: www
   Value: mikhsanpasaribu.my.id.
   TTL: 3600

   # 3. Setup TXT record untuk verifikasi domain
   Type: TXT
   Name: @
   Value: azure-domain-verification=[VERIFICATION_CODE]
   TTL: 3600
   ```

2. **SSL Certificate Setup**

   ```bash
   # Install Certbot dan Nginx plugin
   sudo apt install -y certbot python3-certbot-nginx

   # Stop Nginx temporarily
   sudo systemctl stop nginx

   # Generate certificate
   sudo certbot certonly --standalone \
     -d mikhsanpasaribu.my.id \
     -d www.mikhsanpasaribu.my.id \
     --email admin@mikhsanpasaribu.my.id \
     --agree-tos \
     --non-interactive

   # Configure auto-renewal
   sudo systemctl enable certbot.timer
   sudo systemctl start certbot.timer

   # Create strong DH parameters
   sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
   ```

3. **Nginx SSL Configuration**

   ```nginx
   # /etc/nginx/sites-available/ukro-recruitment-ssl
   server {
       listen 443 ssl http2;
       listen [::]:443 ssl http2;
       server_name mikhsanpasaribu.my.id www.mikhsanpasaribu.my.id;

       # SSL Configuration
       ssl_certificate /etc/letsencrypt/live/mikhsanpasaribu.my.id/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/mikhsanpasaribu.my.id/privkey.pem;
       ssl_trusted_certificate /etc/letsencrypt/live/mikhsanpasaribu.my.id/chain.pem;

       # SSL Settings
       ssl_session_timeout 1d;
       ssl_session_cache shared:SSL:50m;
       ssl_session_tickets off;

       # Modern configuration
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
       ssl_prefer_server_ciphers off;

       # HSTS
       add_header Strict-Transport-Security "max-age=63072000" always;

       # OCSP Stapling
       ssl_stapling on;
       ssl_stapling_verify on;
       resolver 8.8.8.8 8.8.4.4 valid=300s;
       resolver_timeout 5s;

       # Rest of server configuration...
   }

   # HTTP redirect
   server {
       listen 80;
       listen [::]:80;
       server_name mikhsanpasaribu.my.id www.mikhsanpasaribu.my.id;
       return 301 https://$server_name$request_uri;
   }
   ```

4. **DNS Verification dan SSL Testing**

   ```bash
   # Test DNS propagation
   dig mikhsanpasaribu.my.id
   dig www.mikhsanpasaribu.my.id

   # Verify SSL configuration
   sudo nginx -t

   # Test SSL certificate
   curl -vI https://mikhsanpasaribu.my.id

   # Check SSL rating (external tool)
   # Visit https://www.ssllabs.com/ssltest/
   ```

5. **Domain Monitoring Setup**

   ```bash
   # Install monitoring tools
   sudo apt install -y certbot-dns-digitalocean monitoring-plugins-basic

   # Setup SSL expiry monitoring
   cat > /etc/cron.daily/ssl-check << EOF
   #!/bin/bash
   domain="mikhsanpasaribu.my.id"
   expiry=\$(curl -sv https://\$domain 2>&1 | grep "expire date" | cut -d: -f2-)

   if [ \$? -eq 0 ]; then
       echo "SSL Certificate for \$domain expires on \$expiry"
   else
       echo "Error checking SSL certificate for \$domain"
       exit 1
   fi
   EOF

   chmod +x /etc/cron.daily/ssl-check
   ```

### E. Monitoring dan Maintenance

1. **System Monitoring**

   ```bash
   # Install monitoring tools
   sudo apt install -y htop iotop nethogs

   # Setup system monitoring dengan Azure Monitor Agent
   wget https://aka.ms/azcmagent -O ~/azcmagent.sh
   bash ~/azcmagent.sh

   # Configure log collection
   sudo mkdir -p /var/log/ukro-recruitment
   sudo chown www-data:www-data /var/log/ukro-recruitment
   ```

2. **Application Monitoring**

   ```bash
   # Setup PM2 monitoring dashboard
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 30

   # Monitor application health
   cat > /home/ikhsan/health-check.sh << EOF
   #!/bin/bash
   response=\$(curl -s -o /dev/null -w "%{http_code}" https://mikhsanpasaribu.my.id)
   if [ \$response != "200" ]; then
       echo "Application health check failed: HTTP \$response"
       pm2 restart ukro-recruitment
       echo "Application restarted at \$(date)" >> /var/log/ukro-recruitment/restart.log
   fi
   EOF

   chmod +x /home/ikhsan/health-check.sh

   # Setup cron for health checks
   (crontab -l 2>/dev/null; echo "*/5 * * * * /home/ikhsan/health-check.sh") | crontab -
   ```

3. **Database Monitoring**

   ```bash
   # Monitor Supabase connection
   cat > /home/ikhsan/db-check.sh << EOF
   #!/bin/bash
   cd /var/www/ukro-recruitment
   node -e "
   const { createClient } = require('@supabase/supabase-js');
   const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

   supabase.from('applications').select('count', { count: 'exact' })
   .then(({ count, error }) => {
     if (error) {
       console.log('DB Error:', error.message);
       process.exit(1);
     }
     console.log('DB OK: Applications count =', count);
   });
   " || echo "Database connection failed at \$(date)" >> /var/log/ukro-recruitment/db-error.log
   EOF

   chmod +x /home/ikhsan/db-check.sh
   ```

4. **Backup Strategy**

   ```bash
   # Setup automatic code backup
   cat > /home/ikhsan/backup-code.sh << EOF
   #!/bin/bash
   cd /var/www/ukro-recruitment

   # Create backup directory
   sudo mkdir -p /backup/ukro-recruitment/\$(date +%Y-%m-%d)

   # Backup application files (excluding node_modules)
   sudo tar -czf /backup/ukro-recruitment/\$(date +%Y-%m-%d)/app-backup.tar.gz \
     --exclude=node_modules \
     --exclude=.next \
     --exclude=.git \
     /var/www/ukro-recruitment/

   # Backup environment files
   sudo cp /var/www/ukro-recruitment/.env.production /backup/ukro-recruitment/\$(date +%Y-%m-%d)/

   # Backup nginx configuration
   sudo cp /etc/nginx/sites-available/ukro-recruitment* /backup/ukro-recruitment/\$(date +%Y-%m-%d)/

   # Cleanup old backups (keep 7 days)
   sudo find /backup/ukro-recruitment/ -type d -mtime +7 -exec rm -rf {} +

   echo "Backup completed at \$(date)" >> /var/log/ukro-recruitment/backup.log
   EOF

   chmod +x /home/ikhsan/backup-code.sh

   # Schedule daily backup at 2 AM
   (crontab -l 2>/dev/null; echo "0 2 * * * /home/ikhsan/backup-code.sh") | crontab -
   ```

5. **Security Maintenance**

   ```bash
   # Setup automatic security updates
   sudo apt install -y unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades

   # Configure fail2ban monitoring
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban

   # Monitor SSH access attempts
   cat > /home/ikhsan/security-check.sh << EOF
   #!/bin/bash
   # Check for failed SSH attempts
   failed_attempts=\$(grep "Failed password" /var/log/auth.log | wc -l)
   if [ \$failed_attempts -gt 50 ]; then
       echo "High number of failed SSH attempts: \$failed_attempts" >> /var/log/ukro-recruitment/security.log
   fi

   # Check disk usage
   disk_usage=\$(df / | awk 'NR==2{print \$5}' | sed 's/%//')
   if [ \$disk_usage -gt 80 ]; then
       echo "Disk usage high: \$disk_usage%" >> /var/log/ukro-recruitment/system.log
   fi
   EOF

   chmod +x /home/ikhsan/security-check.sh

   # Run security check hourly
   (crontab -l 2>/dev/null; echo "0 * * * * /home/ikhsan/security-check.sh") | crontab -
   ```

6. **Performance Optimization**

   ```bash
   # Setup log rotation for application logs
   sudo tee /etc/logrotate.d/ukro-recruitment << EOF
   /var/log/ukro-recruitment/*.log {
       daily
       missingok
       rotate 30
       compress
       delaycompress
       notifempty
       create 0644 www-data www-data
   }
   EOF

   # Optimize Nginx for better performance
   sudo tee -a /etc/nginx/nginx.conf << EOF
   # Performance optimizations
   worker_processes auto;
   worker_connections 1024;
   keepalive_timeout 65;
   gzip on;
   gzip_vary on;
   gzip_min_length 1024;
   gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   EOF

   # Restart services to apply changes
   sudo systemctl reload nginx
   pm2 reload ukro-recruitment
   ```

7. **Troubleshooting Tools**

   ```bash
   # Create troubleshooting script
   cat > /home/ikhsan/troubleshoot.sh << EOF
   #!/bin/bash
   echo "=== UKRO Recruitment System Status ==="
   echo "Date: \$(date)"
   echo ""

   echo "=== System Resources ==="
   echo "Memory Usage:"
   free -h
   echo ""
   echo "Disk Usage:"
   df -h
   echo ""
   echo "CPU Load:"
   uptime
   echo ""

   echo "=== Services Status ==="
   echo "Nginx Status:"
   sudo systemctl status nginx --no-pager -l
   echo ""
   echo "PM2 Status:"
   pm2 status
   echo ""

   echo "=== Application Logs (last 20 lines) ==="
   pm2 logs ukro-recruitment --lines 20 --nostream
   echo ""

   echo "=== Nginx Error Log (last 10 lines) ==="
   sudo tail -10 /var/log/nginx/error.log
   echo ""

   echo "=== SSL Certificate Status ==="
   echo | openssl s_client -connect mikhsanpasaribu.my.id:443 2>/dev/null | openssl x509 -noout -dates
   EOF

   chmod +x /home/ikhsan/troubleshoot.sh
   ```

## 5. Refleksi dan Pembelajaran

### Pengalaman dan Pembelajaran dari Project

Melalui pengembangan UKRO Recruitment Platform dan deployment ke Microsoft Azure Virtual Machine, saya mendapatkan banyak pengalaman berharga dan insight mendalam tentang cloud computing. Berikut adalah refleksi saya secara komprehensif.

#### A. Pemahaman tentang Cloud Computing

Sebelum project ini, pemahaman saya tentang cloud computing masih teoritis. Setelah mengimplementasikan aplikasi ini di Azure VM, saya benar-benar memahami konsep Infrastructure as a Service (IaaS). Azure VM memberikan kontrol penuh atas operating system dan environment, berbeda dengan PaaS yang lebih abstrak. Saya belajar mengkonfigurasi Ubuntu Server dari scratch, setup web server, manage processes, dan optimize performance.

Saya belajar bahwa cloud computing bukan hanya tentang "menaruh aplikasi di internet", tetapi tentang memanfaatkan infrastructure yang scalable, reliable, dan cost-effective. Konsep seperti load balancing, security groups, monitoring, dan backup strategies yang sebelumnya hanya saya baca di textbook, sekarang saya pahami dari praktik langsung.

#### B. Keuntungan Menggunakan Cloud Server dibanding Local Server

Dari pengalaman deployment ini, saya mengidentifikasi beberapa keuntungan signifikan cloud server dibanding local server:

**1. Accessibility dan Uptime**

Aplikasi saya dapat diakses 24/7 dari mana saja di dunia dengan internet connection. Azure menjamin uptime 99.95% dengan SLA mereka. Jika saya menggunakan local server di kampus, aplikasi hanya bisa diakses saat server menyala dan network kampus stabil. Selain itu, pemadaman listrik atau gangguan jaringan lokal akan membuat aplikasi down. Dengan cloud, infrastructure redundancy dan automatic failover memastikan aplikasi tetap running meskipun ada hardware failure.

**2. Scalability**

Saat periode pendaftaran puncak, ratusan mahasiswa mungkin mengakses aplikasi secara bersamaan. Dengan Azure VM, saya bisa upgrade dari B2s ke B4ms atau bahkan D-series hanya dengan beberapa klik dan restart singkat. Saya juga bisa add load balancer dan multiple instances untuk handle traffic tinggi. Dengan local server, saya harus membeli hardware baru, install, dan configure secara manual - proses yang memakan waktu berhari-hari atau berminggu-minggu.

**3. Cost Efficiency**

Meskipun terlihat seperti saya "membayar" untuk cloud, sebenarnya lebih cost-effective dibanding local server. Dengan Azure B2s (~$50/bulan = ~Rp 750.000), saya mendapatkan:

- Server yang running 24/7 dengan uptime guarantee
- Bandwidth 100GB+ gratis
- Public IP static dengan DDoS protection
- Automated backups dan disaster recovery
- Security monitoring dan patches
- Technical support dari Microsoft

Jika menggunakan local server, saya harus:

- Beli server fisik (minimal Rp 10-20 juta untuk spek serupa)
- Bayar listrik 24/7 (estimasi Rp 300-500 ribu/bulan untuk server + cooling)
- Bayar internet dedicated (Rp 1-2 juta/bulan untuk business grade)
- Bayar SSL certificate (Rp 500 ribu - 2 juta/tahun)
- Maintenance, replacement parts, dan cooling system
- Total initial investment bisa mencapai Rp 20-30 juta, belum operational cost

**4. Security dan Compliance**

Azure menyediakan security features enterprise-grade:

- Network Security Groups sebagai firewall virtual
- Azure Security Center untuk threat detection
- DDoS protection untuk mencegah serangan
- Automatic security patches untuk OS
- Compliance certifications (ISO 27001, SOC 2, dll)
- Identity and Access Management (IAM)

Dengan local server, saya harus manually configure firewall, implement intrusion detection, monitor threats 24/7, dan maintain security updates - requiring expertise dan resources yang signifikan.

**5. Backup dan Disaster Recovery**

Azure menyediakan multiple backup options:

- Automated VM snapshots dengan point-in-time recovery
- Geo-redundant storage dengan replication ke multiple regions
- Azure Site Recovery untuk disaster recovery automation
- File-level backup dengan Azure Backup

Jika terjadi hardware failure atau disaster, saya bisa restore entire VM dalam hitungan menit. Dengan local server, saya harus manually setup backup infrastructure, maintain offsite storage, dan test disaster recovery procedures regularly.

**6. Monitoring dan Management**

Azure Monitor memberikan comprehensive visibility:

- Real-time performance metrics (CPU, memory, disk, network)
- Application insights dengan detailed analytics
- Log Analytics untuk centralized log management
- Automated alerts dengan email/SMS notifications
- Integration dengan third-party monitoring tools

Dengan local server, saya harus setup dan maintain monitoring infrastructure seperti Prometheus + Grafana, configure alerting systems, dan manually analyze logs.

**7. Global Reach dan Performance**

Azure memiliki data centers di 60+ regions worldwide. Saya bisa dengan mudah deploy aplikasi di multiple regions untuk better performance globally. Azure CDN dapat cache static content di edge locations terdekat user.

Local server terbatas pada satu physical location dengan latency tinggi untuk user yang jauh dari lokasi server.

#### C. Tantangan yang Dihadapi dan Solusinya

Tentu saja, cloud deployment juga memiliki challenges:

**1. Learning Curve**

Azure memiliki ratusan services dengan dokumentasi yang extensive. Awalnya overwhelming untuk memilih service yang tepat dan configure dengan optimal.

_Solusi_: Saya fokus pada core services yang dibutuhkan (VM, Storage, Networking) dan gradually explore advanced features. Microsoft Learn menyediakan learning paths yang terstruktur.

**2. Cost Management**

Tanpa proper planning, cloud costs bisa escalate quickly, terutama jika lupa shutdown resources atau salah sizing.

_Solusi_: Saya setup budgets dan alerts di Azure Cost Management, regularly monitor usage, dan optimize resource sizing. Menggunakan Azure Calculator untuk estimasi costs sebelum deployment.

**3. Security Configuration**

Cloud security adalah shared responsibility. Saya bertanggung jawab untuk secure configuration, access management, dan application security.

_Solusi_: Mengikuti Azure Security Benchmarks, enable Security Center recommendations, regular security reviews, dan implement principle of least privilege.

**4. Network Latency**

Meskipun region Singapore dekat dengan Indonesia, masih ada network latency untuk database queries dan API calls.

_Solusi_: Implement caching strategies, optimize database queries, use Content Delivery Network (CDN) untuk static assets, dan consider database replication untuk read workloads.

#### D. Pembelajaran Teknis Mendalam

**1. Linux Server Administration**

Project ini memberikan hands-on experience dengan Ubuntu Server:

- System administration (user management, permissions, services)
- Package management dengan apt
- Process management dengan systemd
- Log analysis dengan journalctl
- Performance tuning dan resource monitoring
- Security hardening (firewall, fail2ban, SSH keys)

**2. Web Server Configuration**

Saya belajar configure Nginx sebagai reverse proxy:

- Virtual hosts untuk multiple domains
- SSL/TLS termination dengan Let's Encrypt
- Load balancing dan health checks
- Caching strategies untuk static content
- Security headers dan rate limiting
- Gzip compression dan performance optimization

**3. Application Deployment**

Implementasi production-ready deployment:

- Process management dengan PM2
- Environment variables management
- Zero-downtime deployment strategies
- Health checks dan automatic restart
- Log aggregation dan rotation
- Performance monitoring dan profiling

**4. Database Management**

Meskipun menggunakan Supabase (managed PostgreSQL), saya belajar:

- Connection pooling dan optimization
- Database migration strategies
- Backup dan restore procedures
- Query optimization dan indexing
- Security best practices (encryption, access control)

**5. DevOps Practices**

Implement CI/CD pipeline dengan GitHub Actions:

- Automated testing dan code quality checks
- Build optimization untuk production
- Deployment automation dengan rollback capability
- Infrastructure as Code principles
- Monitoring dan alerting integration

#### E. Value Proposition dan ROI

**1. Educational Value**

Project ini memberikan practical experience yang sangat valuable:

- Real-world cloud computing implementation
- Production-grade application deployment
- Server administration dan troubleshooting skills
- Security dan compliance understanding
- Cost optimization strategies

**2. Career Preparation**

Skills yang saya pelajari directly applicable untuk:

- Cloud Engineer/Architect positions
- DevOps Engineer roles
- Full-stack Developer dengan deployment skills
- System Administrator positions
- Technical leadership opportunities

**3. Organizational Impact**

UKRO UNP mendapat sistem rekrutmen yang:

- Mengotomatisasi proses manual yang inefficient
- Meningkatkan candidate experience dengan online portal
- Menyediakan data analytics untuk better decision making
- Mengurangi administrative overhead
- Meningkatkan professional image organisasi

**4. Technical Foundation**

Project ini establishes foundation untuk future developments:

- Scalable architecture yang dapat di-extend
- Secure dan maintainable codebase
- Proper documentation dan procedures
- Monitoring dan maintenance processes
- Disaster recovery capabilities

#### F. Future Improvements dan Recommendations

**1. Advanced Monitoring**

- Implement Application Performance Monitoring (APM)
- Setup distributed tracing untuk microservices
- Advanced log analytics dengan AI/ML insights
- Predictive alerting untuk proactive maintenance

**2. Security Enhancements**

- Multi-factor authentication untuk admin accounts
- Regular security audits dan penetration testing
- Implement Web Application Firewall (WAF)
- Advanced threat detection dengan Azure Sentinel

**3. Performance Optimization**

- Database query optimization dan caching
- CDN implementation untuk global performance
- Image optimization dan lazy loading
- Progressive Web App (PWA) features

**4. Scalability Improvements**

- Containerization dengan Docker
- Kubernetes orchestration untuk auto-scaling
- Microservices architecture untuk specific components
- Event-driven architecture dengan message queues

Secara keseluruhan, project ini memberikan comprehensive understanding tentang modern web application development dan cloud deployment. Experience ini extremely valuable untuk career development dan memberikan solid foundation untuk future technical projects.

## Screenshot Website

### A. Azure Portal Configuration

1. **Virtual Machine Setup**
   ![Azure VM Creation](../public/docs/vm-creation.png)

   - Pemilihan resource group
   - Konfigurasi VM size B2s
   - Setup authentication

2. **Networking Configuration**
   ![Azure Networking](../public/docs/vm-networking.png)
   - Konfigurasi Network Security Group
   - Port allowance (22, 80, 443)
   - Public IP assignment

### B. Domain & SSL Setup

1. **DNS Management**
   ![Domainesia DNS](../public/docs/dns-setup.png)

   - A record configuration
   - CNAME setup
   - TXT record untuk verifikasi

2. **SSL Certificate**
   ![SSL Setup](../public/docs/ssl-setup.png)
   - Certbot installation
   - Certificate generation
   - HTTPS configuration

### C. Application Deployment

1. **Node.js Environment**
   ![Node.js Config](../public/docs/nodejs-setup.png)

   - Node.js 20.x installation
   - PM2 process management
   - Application build process

2. **Web Server Setup**
   ![Nginx Config](../public/docs/nginx-setup.png)
   - Nginx virtual host
   - SSL configuration
   - Reverse proxy setup

### D. Database Configuration

1. **Supabase Setup**
   ![Supabase Config](../public/docs/supabase-setup.png)

   - Database connection
   - Environment variables
   - Migration execution

2. **Monitoring Dashboard**
   ![Azure Monitor](../public/docs/azure-monitor.png)
   - Resource metrics
   - Performance monitoring
   - Alert configuration

Note: Screenshots akan ditambahkan saat deployment selesai. Pastikan untuk menyimpan screenshot setiap langkah penting dalam proses deployment.

## References

1. Microsoft Azure Documentation. (2025). [_Deploy a Next.js app to Azure_](https://docs.microsoft.com/azure)

2. Next.js Documentation. (2025). [_Production Deployment_](https://nextjs.org/docs)

3. Digital Ocean. (2025). [_How To Set Up Nginx Server Blocks on Ubuntu 22.04_](https://www.digitalocean.com/community/tutorials)

4. Supabase Documentation. (2025). [_Production Checklist_](https://supabase.com/docs)

5. Let's Encrypt. (2025). [_Getting Started_](https://letsencrypt.org/getting-started)
