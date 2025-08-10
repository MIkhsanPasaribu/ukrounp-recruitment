-- Script SQL untuk membuat database Supabase
-- Jalankan di SQL Editor Supabase Dashboard

-- Buat tabel applicants
CREATE TABLE IF NOT EXISTS applicants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  "fullName" TEXT NOT NULL,
  nickname TEXT,
  gender TEXT CHECK (gender IN ('LAKI_LAKI', 'PEREMPUAN')),
  "birthDate" TEXT,
  faculty TEXT,
  department TEXT,
  "studyProgram" TEXT,
  nim TEXT,
  nia TEXT,
  "previousSchool" TEXT,
  "padangAddress" TEXT,
  "phoneNumber" TEXT,
  motivation TEXT,
  "futurePlans" TEXT,
  "whyYouShouldBeAccepted" TEXT,
  
  -- Kemahiran perangkat lunak
  "corelDraw" BOOLEAN DEFAULT FALSE,
  photoshop BOOLEAN DEFAULT FALSE,
  "adobePremierePro" BOOLEAN DEFAULT FALSE,
  "adobeAfterEffect" BOOLEAN DEFAULT FALSE,
  "autodeskEagle" BOOLEAN DEFAULT FALSE,
  "arduinoIde" BOOLEAN DEFAULT FALSE,
  "androidStudio" BOOLEAN DEFAULT FALSE,
  "visualStudio" BOOLEAN DEFAULT FALSE,
  "missionPlaner" BOOLEAN DEFAULT FALSE,
  "autodeskInventor" BOOLEAN DEFAULT FALSE,
  "autodeskAutocad" BOOLEAN DEFAULT FALSE,
  solidworks BOOLEAN DEFAULT FALSE,
  "otherSoftware" TEXT,
  
  -- Unggahan dokumen (disimpan sebagai base64 atau URL)
  "mbtiProof" TEXT,
  photo TEXT,
  "studentCard" TEXT,
  "studyPlanCard" TEXT,
  "igFollowProof" TEXT,
  "tiktokFollowProof" TEXT,
  
  -- Metadata aplikasi
  status TEXT DEFAULT 'SEDANG_DITINJAU' CHECK (status IN ('SEDANG_DITINJAU', 'DAFTAR_PENDEK', 'INTERVIEW', 'DITERIMA', 'DITOLAK')),
  "submittedAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Buat tabel settings
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Insert setting default untuk status pendaftaran
INSERT INTO settings (key, value) VALUES ('registrationOpen', 'true')
ON CONFLICT (key) DO NOTHING;

-- Buat fungsi untuk update timestamp otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Buat trigger untuk update timestamp pada tabel applicants
DROP TRIGGER IF EXISTS update_applicants_updated_at ON applicants;
CREATE TRIGGER update_applicants_updated_at
    BEFORE UPDATE ON applicants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Buat trigger untuk update timestamp pada tabel settings
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Buat index untuk performa query yang lebih baik
CREATE INDEX IF NOT EXISTS idx_applicants_email ON applicants(email);
CREATE INDEX IF NOT EXISTS idx_applicants_status ON applicants(status);
CREATE INDEX IF NOT EXISTS idx_applicants_submitted_at ON applicants("submittedAt");
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Aktifkan Row Level Security (RLS) untuk keamanan
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Buat policy untuk akses publik dengan service role
CREATE POLICY "Enable all access for service role" ON applicants
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Enable all access for service role" ON settings
FOR ALL USING (auth.role() = 'service_role');

-- Policy untuk akses publik terbatas (hanya insert untuk pendaftaran)
CREATE POLICY "Enable insert for public" ON applicants
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for settings with public access" ON settings
FOR SELECT USING (key = 'registrationOpen');

COMMENT ON TABLE applicants IS 'Tabel untuk menyimpan data pendaftar UKRO';
COMMENT ON TABLE settings IS 'Tabel untuk menyimpan pengaturan aplikasi';
