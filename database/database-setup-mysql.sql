-- MySQL Database Setup for robotik_oprec
-- Berdasarkan struktur Prisma yang ada

-- Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS robotik_oprec;

-- Gunakan database
USE robotik_oprec;

-- Buat tabel applicants
CREATE TABLE IF NOT EXISTS applicants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  nickname VARCHAR(255),
  gender ENUM('MALE', 'FEMALE'),
  birth_date VARCHAR(50),
  faculty VARCHAR(255),
  department VARCHAR(255),
  study_program VARCHAR(255),
  nim VARCHAR(50),
  nia VARCHAR(50),
  previous_school VARCHAR(255),
  padang_address TEXT,
  phone_number VARCHAR(50),
  motivation TEXT,
  future_plans TEXT,
  why_you_should_be_accepted TEXT,
  
  -- Software proficiency
  corel_draw BOOLEAN DEFAULT FALSE,
  photoshop BOOLEAN DEFAULT FALSE,
  adobe_premiere_pro BOOLEAN DEFAULT FALSE,
  adobe_after_effect BOOLEAN DEFAULT FALSE,
  autodesk_eagle BOOLEAN DEFAULT FALSE,
  arduino_ide BOOLEAN DEFAULT FALSE,
  android_studio BOOLEAN DEFAULT FALSE,
  visual_studio BOOLEAN DEFAULT FALSE,
  mission_planer BOOLEAN DEFAULT FALSE,
  autodesk_inventor BOOLEAN DEFAULT FALSE,
  autodesk_autocad BOOLEAN DEFAULT FALSE,
  solidworks BOOLEAN DEFAULT FALSE,
  other_software TEXT,
  
  -- Document uploads (stored as base64 or file URLs)
  mbti_proof LONGTEXT,
  photo LONGTEXT,
  student_card LONGTEXT,
  study_plan_card LONGTEXT,
  ig_follow_proof LONGTEXT,
  tiktok_follow_proof LONGTEXT,
  
  -- Application metadata
  status ENUM('UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED', 'REJECTED') DEFAULT 'UNDER_REVIEW',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Buat tabel settings
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(255) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Masukkan pengaturan default
INSERT INTO settings (`key`, value) VALUES
('registrationOpen', 'true'),
('maxApplications', '500'),
('applicationDeadline', '2024-12-31')
ON DUPLICATE KEY UPDATE value = VALUES(value);

-- Buat trigger untuk updated_at pada tabel applicants
DELIMITER //
CREATE TRIGGER IF NOT EXISTS update_applicants_timestamp
BEFORE UPDATE ON applicants
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- Buat trigger untuk updated_at pada tabel settings
DELIMITER //
CREATE TRIGGER IF NOT EXISTS update_settings_timestamp
BEFORE UPDATE ON settings
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;