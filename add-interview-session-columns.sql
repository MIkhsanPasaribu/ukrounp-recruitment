-- Add missing columns to interview_sessions table
-- Jalankan di Supabase SQL Editor

-- 1. Check if columns exist first
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'interview_sessions'
ORDER BY ordinal_position;

-- 2. Add missing columns if they don't exist
DO $$
BEGIN
    -- Add totalScore column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'interview_sessions' 
                   AND column_name = 'totalScore') THEN
        ALTER TABLE interview_sessions ADD COLUMN "totalScore" INTEGER;
    END IF;
    
    -- Add recommendation column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'interview_sessions' 
                   AND column_name = 'recommendation') THEN
        ALTER TABLE interview_sessions ADD COLUMN recommendation TEXT;
    END IF;
END $$;

-- 3. Verify columns added
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'interview_sessions'
ORDER BY ordinal_position;
