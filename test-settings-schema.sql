-- Quick test to check settings table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'settings' 
ORDER BY ordinal_position;

-- Check if there are any existing settings
SELECT * FROM settings WHERE key = 'registrationOpen';

-- Manual upsert test
INSERT INTO settings (key, value, description, "createdBy")
VALUES ('registrationOpen', 'true', 'Controls whether registration is open or closed', 'manual_test')
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  "updatedAt" = NOW();
