-- ================================================================
-- UKRO RECRUITMENT SYSTEM - SUPABASE DATABASE SCHEMA FINAL
-- ================================================================
-- Script SQL lengkap untuk sistem rekrutment UKRO dengan Supabase
-- Versi: Final Production Ready
-- Tanggal: 10 Agustus 2025
-- 
-- FITUR YANG DIDUKUNG:
-- ✅ Pendaftaran online dengan file upload
-- ✅ Admin dashboard dengan statistik lengkap
-- ✅ Management aplikasi (CRUD operations)
-- ✅ PDF generation dan bulk download
-- ✅ Status tracking dan notifikasi
-- ✅ Export CSV data
-- ✅ Registration open/close toggle
-- ✅ Search dan filtering
-- ✅ Row Level Security (RLS)
-- ================================================================

-- Hapus tabel jika sudah ada (untuk clean install)
DROP TABLE IF EXISTS applicants CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS admin_logs CASCADE;

-- ================================================================
-- TABEL UTAMA: APPLICANTS
-- ================================================================
-- Tabel untuk menyimpan data lengkap pendaftar UKRO
CREATE TABLE applicants (
  -- Primary key menggunakan UUID
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- ============================================================
  -- DATA PERSONAL
  -- ============================================================
  email TEXT UNIQUE NOT NULL,
  "fullName" TEXT NOT NULL,
  nickname TEXT,
  gender TEXT CHECK (gender IN ('LAKI_LAKI', 'PEREMPUAN')),
  "birthDate" TEXT, -- Format: YYYY-MM-DD
  
  -- ============================================================
  -- DATA AKADEMIK
  -- ============================================================
  faculty TEXT NOT NULL,
  department TEXT NOT NULL,
  "studyProgram" TEXT NOT NULL,
  nim TEXT NOT NULL,
  nia TEXT,
  "previousSchool" TEXT,
  
  -- ============================================================
  -- DATA KONTAK
  -- ============================================================
  "padangAddress" TEXT NOT NULL,
  "phoneNumber" TEXT NOT NULL,
  
  -- ============================================================
  -- ESAI DAN MOTIVASI
  -- ============================================================
  motivation TEXT NOT NULL,
  "futurePlans" TEXT NOT NULL,
  "whyYouShouldBeAccepted" TEXT NOT NULL,
  
  -- ============================================================
  -- KEMAHIRAN PERANGKAT LUNAK
  -- ============================================================
  -- Design Software
  "corelDraw" BOOLEAN DEFAULT FALSE,
  photoshop BOOLEAN DEFAULT FALSE,
  
  -- Video Editing
  "adobePremierePro" BOOLEAN DEFAULT FALSE,
  "adobeAfterEffect" BOOLEAN DEFAULT FALSE,
  
  -- Engineering Software
  "autodeskEagle" BOOLEAN DEFAULT FALSE,
  "arduinoIde" BOOLEAN DEFAULT FALSE,
  "androidStudio" BOOLEAN DEFAULT FALSE,
  "visualStudio" BOOLEAN DEFAULT FALSE,
  "missionPlaner" BOOLEAN DEFAULT FALSE,
  "autodeskInventor" BOOLEAN DEFAULT FALSE,
  "autodeskAutocad" BOOLEAN DEFAULT FALSE,
  solidworks BOOLEAN DEFAULT FALSE,
  
  -- Other software (free text)
  "otherSoftware" TEXT,
  
  -- ============================================================
  -- DOKUMEN UPLOAD (BASE64 ENCODED)
  -- ============================================================
  -- Bukti tes MBTI
  "mbtiProof" TEXT,
  
  -- Foto diri
  photo TEXT,
  
  -- Kartu mahasiswa
  "studentCard" TEXT,
  
  -- Kartu rencana studi (KRS)
  "studyPlanCard" TEXT NOT NULL,
  
  -- Bukti follow Instagram
  "igFollowProof" TEXT NOT NULL,
  
  -- Bukti follow TikTok
  "tiktokFollowProof" TEXT NOT NULL,
  
  -- ============================================================
  -- STATUS DAN METADATA
  -- ============================================================
  status TEXT DEFAULT 'SEDANG_DITINJAU' CHECK (
    status IN (
      'SEDANG_DITINJAU',
      'DAFTAR_PENDEK', 
      'INTERVIEW',
      'DITERIMA',
      'DITOLAK'
    )
  ),
  
  -- Timestamps
  "submittedAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  
  -- Admin notes (optional)
  "adminNotes" TEXT,
  
  -- Track status changes
  "statusHistory" JSONB DEFAULT '[]'::jsonb,
  
  -- Additional metadata
  "ipAddress" TEXT,
  "userAgent" TEXT,
  
  -- Validation flags
  "isEmailVerified" BOOLEAN DEFAULT FALSE,
  "isPhoneVerified" BOOLEAN DEFAULT FALSE
);

-- ================================================================
-- TABEL PENGATURAN SISTEM
-- ================================================================
CREATE TABLE settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  "dataType" TEXT DEFAULT 'string' CHECK ("dataType" IN ('string', 'boolean', 'number', 'json')),
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  "createdBy" TEXT DEFAULT 'system'
);

-- ================================================================
-- TABEL LOG AKTIVITAS ADMIN
-- ================================================================
CREATE TABLE admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, EXPORT, etc
  "tableName" TEXT, -- applicants, settings, etc
  "recordId" TEXT, -- ID of affected record
  "oldValues" JSONB,
  "newValues" JSONB,
  "adminId" TEXT, -- bisa IP address atau user identifier
  "ipAddress" TEXT,
  "userAgent" TEXT,
  description TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- PENGATURAN DEFAULT SISTEM
-- ================================================================
INSERT INTO settings (key, value, description, "dataType") VALUES
-- Registration Control
('registrationOpen', 'true', 'Status pendaftaran terbuka/tertutup', 'boolean'),
('maxApplications', '1000', 'Maksimal jumlah aplikasi yang diterima', 'number'),
('registrationDeadline', '2025-12-31T23:59:59Z', 'Deadline pendaftaran', 'string'),

-- Email Settings  
('adminEmail', 'admin@ukro.unp.ac.id', 'Email admin utama', 'string'),
('notificationEmail', 'true', 'Kirim notifikasi email', 'boolean'),

-- Application Settings
('requireMBTI', 'true', 'Wajib upload bukti MBTI', 'boolean'),
('requirePhoto', 'true', 'Wajib upload foto', 'boolean'),
('autoAcceptLimit', '0', 'Batas otomatis terima (0 = disabled)', 'number'),

-- PDF Settings
('pdfWatermark', 'UKRO UNP 2025', 'Watermark untuk PDF', 'string'),
('pdfLogo', '', 'Base64 logo untuk PDF', 'string'),

-- Statistics Settings
('trackDetailedStats', 'true', 'Track statistik detail', 'boolean'),
('retentionDays', '365', 'Hari penyimpanan data', 'number'),

-- Security Settings
('maxFileSize', '5242880', 'Maksimal ukuran file upload (5MB)', 'number'),
('allowedFileTypes', '["image/jpeg", "image/png", "image/jpg"]', 'Tipe file yang diizinkan', 'json'),
('rateLimitSubmit', '1', 'Rate limit submit per IP per jam', 'number')

ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  "updatedAt" = NOW();

-- ================================================================
-- FUNGSI UTILITAS
-- ================================================================

-- Fungsi untuk update timestamp otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Fungsi untuk log aktivitas admin
CREATE OR REPLACE FUNCTION log_admin_activity()
RETURNS TRIGGER AS $$
DECLARE
    action_type TEXT;
    old_vals JSONB;
    new_vals JSONB;
BEGIN
    -- Determine action type
    IF TG_OP = 'INSERT' THEN
        action_type = 'CREATE';
        old_vals = NULL;
        new_vals = to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        action_type = 'UPDATE';
        old_vals = to_jsonb(OLD);
        new_vals = to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        action_type = 'DELETE';
        old_vals = to_jsonb(OLD);
        new_vals = NULL;
    END IF;

    -- Insert log record
    INSERT INTO admin_logs (
        action, 
        "tableName", 
        "recordId", 
        "oldValues", 
        "newValues",
        description
    ) VALUES (
        action_type,
        TG_TABLE_NAME,
        COALESCE(NEW.id::TEXT, OLD.id::TEXT),
        old_vals,
        new_vals,
        format('%s on %s', action_type, TG_TABLE_NAME)
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Fungsi untuk generate statistics
CREATE OR REPLACE FUNCTION generate_statistics()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total', (SELECT COUNT(*) FROM applicants),
        'byStatus', (
            SELECT json_object_agg(status, count)
            FROM (
                SELECT status, COUNT(*) as count
                FROM applicants
                GROUP BY status
            ) status_counts
        ),
        'byGender', (
            SELECT json_object_agg(gender, count)
            FROM (
                SELECT gender, COUNT(*) as count
                FROM applicants
                WHERE gender IS NOT NULL
                GROUP BY gender
            ) gender_counts
        ),
        'byFaculty', (
            SELECT json_object_agg(faculty, count)
            FROM (
                SELECT faculty, COUNT(*) as count
                FROM applicants
                WHERE faculty IS NOT NULL
                GROUP BY faculty
            ) faculty_counts
        ),
        'byMonth', (
            SELECT json_object_agg(month, count)
            FROM (
                SELECT 
                    to_char("submittedAt", 'YYYY-MM') as month,
                    COUNT(*) as count
                FROM applicants
                GROUP BY to_char("submittedAt", 'YYYY-MM')
                ORDER BY month DESC
            ) monthly_counts
        ),
        'recentApplications', (
            SELECT COUNT(*)
            FROM applicants
            WHERE "submittedAt" > NOW() - INTERVAL '7 days'
        ),
        'lastUpdated', NOW()
    ) INTO result;
    
    RETURN result;
END;
$$ language 'plpgsql';

-- ================================================================
-- TRIGGERS
-- ================================================================

-- Trigger untuk update timestamp pada tabel applicants
DROP TRIGGER IF EXISTS update_applicants_updated_at ON applicants;
CREATE TRIGGER update_applicants_updated_at
    BEFORE UPDATE ON applicants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk update timestamp pada tabel settings
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk log aktivitas pada applicants
DROP TRIGGER IF EXISTS log_applicants_activity ON applicants;
CREATE TRIGGER log_applicants_activity
    AFTER INSERT OR UPDATE OR DELETE ON applicants
    FOR EACH ROW
    EXECUTE FUNCTION log_admin_activity();

-- Trigger untuk log aktivitas pada settings
DROP TRIGGER IF EXISTS log_settings_activity ON settings;
CREATE TRIGGER log_settings_activity
    AFTER INSERT OR UPDATE OR DELETE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION log_admin_activity();

-- ================================================================
-- INDEXES UNTUK PERFORMA OPTIMAL
-- ================================================================

-- Primary indexes untuk pencarian utama
CREATE INDEX IF NOT EXISTS idx_applicants_email ON applicants(email);
CREATE INDEX IF NOT EXISTS idx_applicants_status ON applicants(status);
CREATE INDEX IF NOT EXISTS idx_applicants_submitted_at ON applicants("submittedAt");
CREATE INDEX IF NOT EXISTS idx_applicants_updated_at ON applicants("updatedAt");

-- Composite indexes untuk queries kompleks
CREATE INDEX IF NOT EXISTS idx_applicants_status_submitted ON applicants(status, "submittedAt");
CREATE INDEX IF NOT EXISTS idx_applicants_faculty_status ON applicants(faculty, status);
CREATE INDEX IF NOT EXISTS idx_applicants_gender_faculty ON applicants(gender, faculty);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_applicants_fullname_search ON applicants USING gin(to_tsvector('indonesian', "fullName"));
CREATE INDEX IF NOT EXISTS idx_applicants_email_search ON applicants USING gin(to_tsvector('simple', email));

-- Settings indexes
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_datatype ON settings("dataType");

-- Admin logs indexes
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs("createdAt");
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_table_record ON admin_logs("tableName", "recordId");

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

-- Aktifkan RLS pada semua tabel
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES UNTUK TABEL APPLICANTS
-- ============================================================

-- Policy untuk service role (admin) - akses penuh
CREATE POLICY "Admin full access to applicants" ON applicants
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Policy untuk public - hanya bisa insert (pendaftaran)
CREATE POLICY "Public can insert applications" ON applicants
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Policy untuk public - bisa baca data sendiri berdasarkan email
CREATE POLICY "Public can read own application" ON applicants
FOR SELECT
TO anon, authenticated
USING (
  email = current_setting('request.jwt.claims', true)::json->>'email'
  OR
  email = current_setting('app.current_email', true)
);

-- ============================================================
-- POLICIES UNTUK TABEL SETTINGS
-- ============================================================

-- Policy untuk service role - akses penuh
CREATE POLICY "Admin full access to settings" ON settings
FOR ALL
TO service_role  
USING (true)
WITH CHECK (true);

-- Policy untuk public - hanya baca setting tertentu
CREATE POLICY "Public can read public settings" ON settings
FOR SELECT
TO anon, authenticated
USING (key IN ('registrationOpen', 'maxApplications', 'registrationDeadline'));

-- ============================================================
-- POLICIES UNTUK TABEL ADMIN_LOGS
-- ============================================================

-- Policy untuk service role - akses penuh
CREATE POLICY "Admin full access to logs" ON admin_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy untuk mencegah akses public
CREATE POLICY "No public access to logs" ON admin_logs
FOR ALL
TO anon, authenticated
USING (false);

-- ================================================================
-- VIEWS UNTUK KEMUDAHAN QUERY
-- ================================================================

-- View untuk statistik ringkas
CREATE OR REPLACE VIEW statistics_summary AS
SELECT 
  (SELECT COUNT(*) FROM applicants) as total_applications,
  (SELECT COUNT(*) FROM applicants WHERE status = 'SEDANG_DITINJAU') as under_review,
  (SELECT COUNT(*) FROM applicants WHERE status = 'DAFTAR_PENDEK') as shortlisted,
  (SELECT COUNT(*) FROM applicants WHERE status = 'DITERIMA') as accepted,
  (SELECT COUNT(*) FROM applicants WHERE status = 'DITOLAK') as rejected,
  (SELECT COUNT(*) FROM applicants WHERE "submittedAt" > NOW() - INTERVAL '24 hours') as today_applications,
  (SELECT COUNT(*) FROM applicants WHERE "submittedAt" > NOW() - INTERVAL '7 days') as this_week_applications;

-- View untuk aplikasi dengan informasi lengkap
CREATE OR REPLACE VIEW applications_detailed AS
SELECT 
  a.*,
  CASE 
    WHEN a.status = 'SEDANG_DITINJAU' THEN 'Sedang Ditinjau'
    WHEN a.status = 'DAFTAR_PENDEK' THEN 'Masuk Daftar Pendek'
    WHEN a.status = 'INTERVIEW' THEN 'Interview'
    WHEN a.status = 'DITERIMA' THEN 'Diterima'
    WHEN a.status = 'DITOLAK' THEN 'Ditolak'
    ELSE a.status
  END as status_display,
  CASE 
    WHEN a.gender = 'LAKI_LAKI' THEN 'Laki-laki'
    WHEN a.gender = 'PEREMPUAN' THEN 'Perempuan'
    ELSE a.gender
  END as gender_display,
  EXTRACT(days FROM NOW() - a."submittedAt") as days_since_submitted
FROM applicants a;

-- ================================================================
-- SAMPLE DATA UNTUK TESTING (OPSIONAL)
-- ================================================================
-- Uncomment bagian ini jika ingin insert sample data untuk testing

/*
INSERT INTO applicants (
  email, "fullName", nickname, gender, "birthDate", 
  faculty, department, "studyProgram", nim, nia,
  "previousSchool", "padangAddress", "phoneNumber",
  motivation, "futurePlans", "whyYouShouldBeAccepted",
  "studyPlanCard", "igFollowProof", "tiktokFollowProof",
  status
) VALUES 
(
  'john.doe@example.com', 'John Doe', 'Johnny', 'LAKI_LAKI', '2000-01-15',
  'Teknik', 'Teknik Elektro', 'S1 Teknik Elektro', '2021001001', 'NIA001',
  'SMA Negeri 1 Padang', 'Jl. Sudirman No. 123, Padang', '081234567890',
  'Saya tertarik dengan robotika karena...', 'Di masa depan saya ingin...', 'Saya layak diterima karena...',
  'base64_krs_data', 'base64_ig_proof', 'base64_tiktok_proof',
  'SEDANG_DITINJAU'
),
(
  'jane.smith@example.com', 'Jane Smith', 'Jane', 'PEREMPUAN', '2001-03-20',
  'MIPA', 'Fisika', 'S1 Fisika', '2021002002', 'NIA002', 
  'SMA Negeri 2 Padang', 'Jl. Gajah Mada No. 456, Padang', '081234567891',
  'Motivasi saya bergabung adalah...', 'Rencana masa depan saya...', 'Alasan saya harus diterima...',
  'base64_krs_data', 'base64_ig_proof', 'base64_tiktok_proof',
  'DAFTAR_PENDEK'
);
*/

-- ================================================================
-- BACKUP DAN MAINTENANCE FUNCTIONS
-- ================================================================

-- Fungsi untuk cleanup data lama
CREATE OR REPLACE FUNCTION cleanup_old_data(retention_days INT DEFAULT 365)
RETURNS TEXT AS $$
DECLARE
    deleted_logs INT;
    result_message TEXT;
BEGIN
    -- Hapus log admin yang sudah lama
    DELETE FROM admin_logs 
    WHERE "createdAt" < NOW() - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS deleted_logs = ROW_COUNT;
    
    result_message = format('Cleaned up %s old admin log entries', deleted_logs);
    
    -- Insert log untuk maintenance activity
    INSERT INTO admin_logs (action, description) 
    VALUES ('MAINTENANCE', result_message);
    
    RETURN result_message;
END;
$$ language 'plpgsql';

-- Fungsi untuk backup settings
CREATE OR REPLACE FUNCTION backup_settings()
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT json_agg(
            json_build_object(
                'key', key,
                'value', value,
                'description', description,
                'dataType', "dataType"
            )
        )
        FROM settings
    );
END;
$$ language 'plpgsql';

-- ================================================================
-- GRANTS DAN PERMISSIONS
-- ================================================================

-- Grant permissions untuk service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant limited permissions untuk anon
GRANT SELECT ON settings TO anon;
GRANT INSERT ON applicants TO anon;

-- ================================================================
-- KOMENTAR DAN DOKUMENTASI
-- ================================================================

-- Dokumentasi tabel
COMMENT ON TABLE applicants IS 'Tabel utama untuk menyimpan data pendaftar UKRO dengan fitur lengkap';
COMMENT ON TABLE settings IS 'Tabel pengaturan sistem dengan dukungan berbagai tipe data';
COMMENT ON TABLE admin_logs IS 'Tabel audit log untuk melacak aktivitas admin';

-- Dokumentasi kolom penting
COMMENT ON COLUMN applicants.email IS 'Email unik pendaftar, digunakan untuk autentikasi';
COMMENT ON COLUMN applicants.status IS 'Status aplikasi: SEDANG_DITINJAU, DAFTAR_PENDEK, INTERVIEW, DITERIMA, DITOLAK';
COMMENT ON COLUMN applicants."statusHistory" IS 'JSONB array untuk melacak perubahan status';
COMMENT ON COLUMN applicants."studyPlanCard" IS 'Base64 encoded KRS (wajib)';
COMMENT ON COLUMN applicants."igFollowProof" IS 'Base64 encoded bukti follow Instagram (wajib)';
COMMENT ON COLUMN applicants."tiktokFollowProof" IS 'Base64 encoded bukti follow TikTok (wajib)';

-- ================================================================
-- SELESAI - DATABASE SCHEMA UKRO RECRUITMENT SYSTEM
-- ================================================================

-- Tampilkan ringkasan
DO $$
BEGIN
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'UKRO RECRUITMENT DATABASE SCHEMA BERHASIL DIBUAT!';
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Tabel yang dibuat:';
    RAISE NOTICE '✅ applicants - Data pendaftar lengkap';
    RAISE NOTICE '✅ settings - Pengaturan sistem';  
    RAISE NOTICE '✅ admin_logs - Audit trail admin';
    RAISE NOTICE '';
    RAISE NOTICE 'Fitur yang didukung:';
    RAISE NOTICE '✅ Registration system dengan file upload';
    RAISE NOTICE '✅ Admin dashboard dengan statistik';
    RAISE NOTICE '✅ Status management dan tracking';
    RAISE NOTICE '✅ PDF generation dan bulk download';  
    RAISE NOTICE '✅ Export CSV data';
    RAISE NOTICE '✅ Row Level Security (RLS)';
    RAISE NOTICE '✅ Full audit logging';
    RAISE NOTICE '✅ Performance optimization';
    RAISE NOTICE '';
    RAISE NOTICE 'Siap untuk production! 🚀';
    RAISE NOTICE '============================================================';
END $$;
