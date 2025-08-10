-- Konfigurasi MySQL untuk menangani file besar
-- Jalankan perintah ini di phpMyAdmin atau MySQL client

-- Set max_allowed_packet to 16MB
SET GLOBAL max_allowed_packet = 16777216;

-- Set wait_timeout to 60 seconds
SET GLOBAL wait_timeout = 60;

-- Set interactive_timeout to 60 seconds  
SET GLOBAL interactive_timeout = 60;

-- Verify the settings
SHOW VARIABLES LIKE 'max_allowed_packet';
SHOW VARIABLES LIKE 'wait_timeout';
SHOW VARIABLES LIKE 'interactive_timeout';

-- Note: 
-- Untuk mengubah secara permanen, tambahkan baris berikut ke file my.ini atau my.cnf:
-- [mysqld]
-- max_allowed_packet = 16M
-- wait_timeout = 60
-- interactive_timeout = 60
