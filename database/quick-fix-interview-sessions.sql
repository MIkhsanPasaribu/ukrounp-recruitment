-- Fix interview_sessions table - Add missing columns
-- Copy paste ini ke Supabase SQL Editor

-- 1. Check current columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'interview_sessions' 
ORDER BY ordinal_position;

-- 2. Add totalScore column if missing
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS "totalScore" INTEGER;

-- 3. Add recommendation column if missing  
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS recommendation TEXT;

-- 4. Add assignment_id column if missing (for future use)
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS assignment_id UUID;

-- 5. Verify columns added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'interview_sessions' 
ORDER BY ordinal_position;

-- Success
SELECT '✅ interview_sessions table fixed successfully!' as status;
