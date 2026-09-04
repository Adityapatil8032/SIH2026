-- ==============================================================================
-- APNA ROUTE - SUPABASE POSTGRESQL DATABASE SCHEMA
-- Copy and paste this script into: Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Create USERS table to store Google login and registered users
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  "fullName" TEXT NOT NULL,
  avatar TEXT,
  "googleId" TEXT,
  provider TEXT DEFAULT 'local',
  "createdAt" TEXT,
  "lastLoginAt" TEXT,
  "emergencyContact" TEXT,
  "passwordHash" TEXT
);

-- 2. Create SESSIONS table to store login sessions
CREATE TABLE IF NOT EXISTS public.sessions (
  token TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "createdAt" TEXT,
  "expiresAt" TEXT
);

-- 3. Disable Row Level Security (RLS) so the Apna Route backend can read and write data seamlessly
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;

-- 4. Grant full access to anon and authenticated roles
GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.sessions TO anon, authenticated, service_role;
