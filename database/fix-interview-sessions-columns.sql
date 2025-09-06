-- Fix missing columns in interview_sessions table
-- Jalankan di Supabase SQL Editor

-- 1. Check current structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'interview_sessions'
ORDER BY ordinal_position;

-- 2. Add missing columns
DO $$
BEGIN
    -- Add totalScore column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'interview_sessions' 
                   AND column_name = 'totalScore') THEN
        ALTER TABLE interview_sessions ADD COLUMN "totalScore" INTEGER;
        RAISE NOTICE 'Added totalScore column to interview_sessions';
    ELSE
        RAISE NOTICE 'totalScore column already exists';
    END IF;
    
    -- Add recommendation column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'interview_sessions' 
                   AND column_name = 'recommendation') THEN
        ALTER TABLE interview_sessions ADD COLUMN recommendation TEXT;
        RAISE NOTICE 'Added recommendation column to interview_sessions';
    ELSE
        RAISE NOTICE 'recommendation column already exists';
    END IF;

    -- Add assignment_id column if it doesn't exist (for linking to interviewer_assignments)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'interview_sessions' 
                   AND column_name = 'assignment_id') THEN
        ALTER TABLE interview_sessions ADD COLUMN assignment_id UUID;
        RAISE NOTICE 'Added assignment_id column to interview_sessions';
    ELSE
        RAISE NOTICE 'assignment_id column already exists';
    END IF;
END $$;

-- 3. Add constraint for recommendation values (if needed)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'interview_sessions_recommendation_check') THEN
        ALTER TABLE interview_sessions 
        ADD CONSTRAINT interview_sessions_recommendation_check 
        CHECK (recommendation IN (
            'SANGAT_DIREKOMENDASIKAN', 
            'DIREKOMENDASIKAN', 
            'CUKUP', 
            'TIDAK_DIREKOMENDASIKAN'
        ));
        RAISE NOTICE 'Added recommendation check constraint';
    ELSE
        RAISE NOTICE 'Recommendation check constraint already exists';
    END IF;
END $$;

-- 4. Verify final structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'interview_sessions'
ORDER BY ordinal_position;

-- 5. Success message
SELECT '✅ Interview sessions table structure fixed successfully!' as status;
