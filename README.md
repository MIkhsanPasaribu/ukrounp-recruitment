# UKRO UNP - Recruitment Platform 🤖

Platform rekrutmen modern untuk Unit Kegiatan Robotika Universitas Negeri Padang (UNP). Dibangun dengan teknologi terdepan untuk memberikan pengalaman terbaik bagi pendaftar dan administrator.

## ✨ Fitur Utama

### 👥 Untuk Pendaftar

- **Form Pendaftaran Multi-Step** dengan progress tracking real-time
- **Upload Dokumen Aman** untuk kartu mahasiswa dan berkas lainnya
- **Konfirmasi Otomatis** via email dengan PDF receipt
- **Monitoring Status** aplikasi secara real-time
- **Responsive Design** untuk akses mobile dan desktop

### 🔧 Untuk Administrator

- **Dashboard Komprehensif** untuk manajemen aplikasi
- **Search & Filter** aplikasi lanjutan
- **Bulk Processing** untuk efisiensi
- **Export CSV** untuk analisis offline
- **Notifikasi Status** otomatis
- **Visualisasi Data** dengan Chart.js

## 🛠️ Teknologi

### Frontend

- **Next.js 15.2.3** - React framework dengan SSR
- **React 19** - Library UI interaktif
- **TypeScript** - Type safety & reliability
- **Tailwind CSS 4** - Utility-first CSS framework
- **Chart.js 4.4.8** - Data visualization

### Backend

- **Next.js API Routes** - Serverless functions
- **MySQL** - Database relasional dengan phpMyAdmin
- **mysql2** - MySQL client untuk Node.js
- **Nodemailer 6.10.1** - Email automation
- **PDFKit** - PDF generation

### Database Schema

- `applicants` - Data pendaftar lengkap
- `settings` - Konfigurasi aplikasi sistem

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Install dependencies
npm install
```

### 2. Database Setup

```bash
# Buat database MySQL menggunakan script yang disediakan
npm run db:setup
# atau jalankan manual
mysql -u root -p < database-setup-mysql.sql
```

### 3. Development

```bash
# Start development server
npm run dev

# Open browser
# http://localhost:3000
```

## 📧 Email Configuration

### Testing dengan Mailtrap (Recommended)

```env
EMAIL_SERVICE=mailtrap
EMAIL_USER=your_mailtrap_username
EMAIL_PASS=your_mailtrap_password
```

### Production dengan Gmail

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## 🗄️ Database Migration

### Setup MySQL Database

```bash
# Jalankan script database-setup-mysql.sql
npm run db:setup

# Script akan membuat database robotik_oprec dengan:
# - Tabel applicants (data pendaftar)
# - Tabel settings (pengaturan aplikasi)
# - Indeks untuk optimasi query
# - Trigger untuk update timestamp
```

### Konfigurasi Koneksi

Buat file `.env.local` dengan konfigurasi berikut:

```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=robotik_oprec

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## 📱 API Endpoints

### Public APIs

- `GET /api/status` - Check application status
- `POST /api/submit` - Submit new application

### Admin APIs

- `GET /api/admin/applications` - Get all applications
- `GET /api/admin/statistics` - Get dashboard statistics
- `PUT /api/admin/update-status` - Update application status
- `DELETE /api/admin/delete-application` - Delete application
- `GET /api/admin/registration-status` - Get/set registration status

## 🧪 Testing

### Automated Testing

```bash
# Run setup tests
npm run test:setup

# Manual email testing
npm run test:email

# Database setup
npm run db:setup

# Database check
npm run db:check
```

### Manual Testing

1. **Registration**: `/form` - Test form submission
2. **Status Check**: `/status` - Test status checking
3. **Admin Panel**: `/admin` - Test admin features

## 📂 Project Structure

```
ukro-recruitment/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── form/              # Registration form
│   │   ├── status/            # Status checking
│   │   └── admin/             # Admin dashboard
│   ├── components/            # React components
│   ├── lib/                   # Libraries & utilities
│   │   └── supabase.ts       # Database connection
│   ├── types/                 # TypeScript types
│   └── utils/                 # Utility functions
│       ├── emailService.ts   # Email templates
│       ├── registrationService.ts  # Email sending
│       ├── pdfGenerator.ts   # PDF generation
│       └── validation.ts     # Form validation
├── database-check.sql         # Full database schema
├── database-setup-minimal.sql # Quick setup
├── test-automation.js         # Testing script
├── DEPLOYMENT-GUIDE.md        # Deployment guide
└── .env.example              # Environment template
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy

### Environment Variables untuk Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
EMAIL_SERVICE=gmail
GMAIL_USER=your_production_email
GMAIL_PASS=your_app_password
ADMIN_PASSWORD=your_secure_password
```

## 📋 Checklist Deployment

- [ ] Environment variables configured
- [ ] Database migrated (Supabase)
- [ ] Email service tested
- [ ] Local testing passed
- [ ] Production deployment
- [ ] Production testing

## 🔧 Troubleshooting

### Common Issues

**Database Connection Error**

```bash
# Check Supabase URL and key in .env.local
# Verify database tables exist
```

**Email Authentication Error**

```bash
# For Gmail: Use App Password, not regular password
# For Mailtrap: Check username/password
```

**Build Errors**

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT-GUIDE.md) - Step-by-step deployment
- [Database Schema](database-check.sql) - Complete database structure
- [Environment Setup](.env.example) - Environment variables template

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 About

Dikembangkan untuk Unit Kegiatan Robotika Universitas Negeri Padang (UNP) dengan teknologi modern dan pengalaman pengguna terbaik.

**Team**: UKRO UNP Development Team  
**Year**: 2024  
**Status**: Production Ready ✅

---

_Untuk informasi lebih lanjut, baca [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)_

### Development Tools & Infrastructure

- **ESLint (v9)** – Ensures code quality and adherence to style guidelines.
- **Tailwind PostCSS plugin** – Processes Tailwind CSS classes effectively.
- **Vercel** – Used for automated deployment, enabling seamless CI/CD integration.
- **Supabase** – Provides a managed PostgreSQL database service with real-time capabilities.
- Single codebase that integrates both client and server logic, streamlining the development and deployment process.

## Getting Started

### System Requirements

- Node.js 18.x or newer
- npm 8.x+ or yarn 1.22.x+
- Supabase account
- Vercel account for deployment

### Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/MIkhsanPasaribu/ukrounp-recruitment.git
   cd ukrounp-recruitment
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure environment:

   ```bash
   cp .env.local.example .env.local
   ```

   Then set the following required environment variables in your .env.local file:

   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   SUPABASE_SECRET=your_supabase_secret

   # Email configuration for registration confirmations
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password_here
   ```

   Note: For Gmail, you'll need to use an App Password instead of your regular password. See [Google's documentation](https://support.google.com/accounts/answer/185833) for instructions on setting up an App Password.

4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Access the application:
   Open your browser and visit [http://localhost:3000](http://localhost:3000)

## Application Structure

- /src/app  
  Contains Next.js app router pages, including both the frontend and API routes.
- /src/components  
  Reusable React components used throughout the application.

- /src/lib  
  Utility functions and the database connection logic (e.g., Supabase connection in supabase.ts).

- /src/types  
  TypeScript type definitions for ensuring type safety.

- /public  
  Static assets including images (e.g., the Robotika UNP logo).

## Admin Access

The admin panel is accessible at `/admin`. A simple password-based authentication is in place; the default password is set as `admin123` (please change it in production for security).

## Database Structure

The application uses a Supabase collection named `applicants` with the following structure:

- `id` : Supabase ID
- `email` : Applicant's email address
- `fullName` : Applicant's full name
- `status` : Application status (e.g., Under Review, Shortlisted, Interview, Accepted, Rejected)
- `submittedAt` : Timestamp of application submission
- Various fields for personal and academic information
- Document uploads (stored as base64 strings or appropriate file references)

## Deployment

Deploying the application is straightforward using Vercel:

1. Push your code to GitHub.
2. Connect your GitHub repository to Vercel.
3. Configure the environment variables in the Vercel dashboard.
4. Deploy the application.

## Contributing

Contributions are welcome! If you have suggestions or improvements, please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

## Contact

For any inquiries, please contact Unit Kegiatan Robotika UNP at mikhsanpasaribu2@gmail.com.
