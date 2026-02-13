-- =====================================================
-- ADD MISSING ADMIN COLUMNS TO PROFILES
-- Date: 2025-11-26
-- Description: Add is_admin and ensure all tier columns exist
-- Error fix: PostgreSQL error 42703 (undefined column)
-- =====================================================

-- Add is_admin column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added is_admin column';
  END IF;
END $$;

-- Add chatbot_tier column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'chatbot_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN chatbot_tier VARCHAR(20) DEFAULT 'FREE';
    RAISE NOTICE 'Added chatbot_tier column';
  END IF;
END $$;

-- Add scanner_tier column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'scanner_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN scanner_tier VARCHAR(20) DEFAULT 'FREE';
    RAISE NOTICE 'Added scanner_tier column';
  END IF;
END $$;

-- Add course_tier column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'course_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN course_tier VARCHAR(20) DEFAULT 'FREE';
    RAISE NOTICE 'Added course_tier column';
  END IF;
END $$;

-- Add role column if not exists (for admin role)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role VARCHAR(20) DEFAULT 'user';
    RAISE NOTICE 'Added role column';
  END IF;
END $$;

-- =====================================================
-- UPDATE ADMIN USER
-- =====================================================

-- Set admin for maow390@gmail.com
UPDATE profiles
SET
  role = 'admin',
  is_admin = TRUE,
  scanner_tier = 'ADMIN',
  chatbot_tier = 'ADMIN',
  course_tier = 'ADMIN'
WHERE email = 'maow390@gmail.com';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('is_admin', 'role', 'scanner_tier', 'chatbot_tier', 'course_tier')
ORDER BY column_name;
