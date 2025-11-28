-- =====================================================
-- SYNC USERS & PROFILES TABLES - TIER SYSTEM
-- Date: 2025-11-26
-- Problem: App uses both 'users' and 'profiles' tables
--          but tier columns only exist in 'profiles'
-- Solution: Add tier columns to 'users' table and create sync trigger
-- =====================================================

-- =====================================================
-- PART 1: ADD MISSING COLUMNS TO USERS TABLE
-- =====================================================

-- Add role column
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Add is_admin column
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add chatbot_tier column
ALTER TABLE users ADD COLUMN IF NOT EXISTS chatbot_tier VARCHAR(20) DEFAULT 'FREE';

-- Add course_tier column
ALTER TABLE users ADD COLUMN IF NOT EXISTS course_tier VARCHAR(20) DEFAULT 'FREE';

-- Add email column if not exists (for admin lookup by email)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;

-- Add full_name column
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Update all tier constraints to include ADMIN
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_scanner_tier_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_chatbot_tier_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_course_tier_check;

ALTER TABLE users ADD CONSTRAINT users_scanner_tier_check
  CHECK (scanner_tier IS NULL OR scanner_tier IN ('FREE', 'TIER1', 'TIER2', 'TIER3', 'PRO', 'PREMIUM', 'VIP', 'ADMIN'));

ALTER TABLE users ADD CONSTRAINT users_chatbot_tier_check
  CHECK (chatbot_tier IS NULL OR chatbot_tier IN ('FREE', 'TIER1', 'TIER2', 'TIER3', 'PRO', 'PREMIUM', 'VIP', 'ADMIN'));

ALTER TABLE users ADD CONSTRAINT users_course_tier_check
  CHECK (course_tier IS NULL OR course_tier IN ('FREE', 'TIER1', 'TIER2', 'TIER3', 'PRO', 'PREMIUM', 'VIP', 'ADMIN'));

-- =====================================================
-- PART 2: ADD MISSING COLUMNS TO PROFILES TABLE
-- =====================================================

-- Ensure profiles has all required columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS chatbot_tier VARCHAR(20) DEFAULT 'FREE';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS scanner_tier VARCHAR(20) DEFAULT 'FREE';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS course_tier VARCHAR(20) DEFAULT 'FREE';

-- Update constraints for profiles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_scanner_tier_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_chatbot_tier_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_course_tier_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_scanner_tier_check
  CHECK (scanner_tier IS NULL OR scanner_tier IN ('FREE', 'TIER1', 'TIER2', 'TIER3', 'PRO', 'PREMIUM', 'VIP', 'ADMIN'));

ALTER TABLE profiles ADD CONSTRAINT profiles_chatbot_tier_check
  CHECK (chatbot_tier IS NULL OR chatbot_tier IN ('FREE', 'TIER1', 'TIER2', 'TIER3', 'PRO', 'PREMIUM', 'VIP', 'ADMIN'));

ALTER TABLE profiles ADD CONSTRAINT profiles_course_tier_check
  CHECK (course_tier IS NULL OR course_tier IN ('FREE', 'TIER1', 'TIER2', 'TIER3', 'PRO', 'PREMIUM', 'VIP', 'ADMIN'));

-- =====================================================
-- PART 3: SYNC EXISTING DATA FROM PROFILES TO USERS
-- =====================================================

-- Copy tier data from profiles to users where users exists
UPDATE users u
SET
  role = COALESCE(p.role, u.role, 'user'),
  is_admin = COALESCE(p.is_admin, u.is_admin, FALSE),
  scanner_tier = COALESCE(p.scanner_tier, u.scanner_tier, 'FREE'),
  chatbot_tier = COALESCE(p.chatbot_tier, u.chatbot_tier, 'FREE'),
  course_tier = COALESCE(p.course_tier, u.course_tier, 'FREE'),
  email = COALESCE(u.email, p.email),
  full_name = COALESCE(u.full_name, u.display_name, p.full_name)
FROM profiles p
WHERE u.id = p.id;

-- =====================================================
-- PART 4: CREATE SYNC TRIGGER (profiles -> users)
-- =====================================================

-- Function to sync tier changes from profiles to users
CREATE OR REPLACE FUNCTION sync_profile_to_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Update users table when profiles is updated
  UPDATE users
  SET
    role = NEW.role,
    is_admin = NEW.is_admin,
    scanner_tier = NEW.scanner_tier,
    chatbot_tier = NEW.chatbot_tier,
    course_tier = NEW.course_tier
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_sync_profile_to_users ON profiles;

-- Create trigger
CREATE TRIGGER trigger_sync_profile_to_users
  AFTER UPDATE OF role, is_admin, scanner_tier, chatbot_tier, course_tier ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_to_users();

-- =====================================================
-- PART 5: SET ADMIN FOR maow390@gmail.com
-- =====================================================

-- Update in profiles table
UPDATE profiles
SET
  role = 'admin',
  is_admin = TRUE,
  scanner_tier = 'ADMIN',
  chatbot_tier = 'ADMIN',
  course_tier = 'ADMIN'
WHERE email = 'maow390@gmail.com';

-- Update in users table
UPDATE users
SET
  role = 'admin',
  is_admin = TRUE,
  scanner_tier = 'ADMIN',
  chatbot_tier = 'ADMIN',
  course_tier = 'ADMIN'
WHERE email = 'maow390@gmail.com';

-- Also try by auth.users email
UPDATE users u
SET
  role = 'admin',
  is_admin = TRUE,
  scanner_tier = 'ADMIN',
  chatbot_tier = 'ADMIN',
  course_tier = 'ADMIN'
FROM auth.users au
WHERE u.id = au.id AND au.email = 'maow390@gmail.com';

UPDATE profiles p
SET
  role = 'admin',
  is_admin = TRUE,
  scanner_tier = 'ADMIN',
  chatbot_tier = 'ADMIN',
  course_tier = 'ADMIN'
FROM auth.users au
WHERE p.id = au.id AND au.email = 'maow390@gmail.com';

-- =====================================================
-- PART 6: VERIFICATION
-- =====================================================

-- Check users table columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('role', 'is_admin', 'scanner_tier', 'chatbot_tier', 'course_tier')
ORDER BY column_name;

-- Check profiles table columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('role', 'is_admin', 'scanner_tier', 'chatbot_tier', 'course_tier')
ORDER BY column_name;

-- Check admin user in both tables
SELECT 'profiles' as table_name, id, email, role, is_admin, scanner_tier, chatbot_tier
FROM profiles WHERE email = 'maow390@gmail.com'
UNION ALL
SELECT 'users' as table_name, id, email, role, is_admin, scanner_tier, chatbot_tier
FROM users WHERE email = 'maow390@gmail.com';
