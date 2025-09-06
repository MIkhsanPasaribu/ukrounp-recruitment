-- Migration script to add new authentication tables
-- Execute this in your Supabase SQL editor or similar

-- Create AdminRole enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MODERATOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    role "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMPTZ,
    "lastLoginIP" INET,
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create session_tokens table
CREATE TABLE IF NOT EXISTS session_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "adminId" UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "lastUsedAt" TIMESTAMPTZ DEFAULT now(),
    "userAgent" TEXT,
    "ipAddress" INET,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "adminId" UUID REFERENCES admins(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    details JSONB,
    "ipAddress" INET,
    "userAgent" TEXT,
    success BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_tokens_admin_id ON session_tokens("adminId");
CREATE INDEX IF NOT EXISTS idx_session_tokens_expires_at ON session_tokens("expiresAt");
CREATE INDEX IF NOT EXISTS idx_session_tokens_token ON session_tokens(token);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs("adminId");
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs("createdAt");
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Add RLS policies (Row Level Security)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access (full access)
CREATE POLICY "Service role can manage admins" ON admins FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can manage session_tokens" ON session_tokens FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can manage audit_logs" ON audit_logs FOR ALL TO service_role USING (true);

-- Create trigger to automatically update 'updatedAt' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Apply trigger to admins table
DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a function to clean up expired tokens (optional - for maintenance)
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM session_tokens WHERE "expiresAt" < now();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE 'plpgsql';

-- Print completion message
DO $$
BEGIN
    RAISE NOTICE 'Database migration completed successfully!';
    RAISE NOTICE 'Tables created: admins, session_tokens, audit_logs';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Create admin user using: node scripts/create-admin.js <username> <email> <password>';
    RAISE NOTICE '2. Update your environment variables if needed';
    RAISE NOTICE '3. Deploy the new authentication system';
END $$;
