-- =====================================================
-- UNIFY PROFILES TABLE - DEPRECATE USERS TABLE
-- Date: 2025-11-26
--
-- Problem: App has 2 tables (users, profiles) causing confusion
-- Solution: Add all columns to profiles, update app to only use profiles
--           Keep users table for backward compatibility but sync from profiles
-- =====================================================

-- =====================================================
-- PART 1: ADD MISSING COLUMNS TO PROFILES
-- Copy all columns from users that don't exist in profiles
-- =====================================================

-- Basic info
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Social handles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter_handle TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telegram_handle TEXT;

-- Trading preferences
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trading_style TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS favorite_pairs TEXT[];

-- Privacy settings
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_stats BOOLEAN DEFAULT TRUE;

-- Affiliate tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID;

-- Online presence (from users table)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS online_status TEXT DEFAULT 'offline';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- Badge system
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS badge_tier TEXT DEFAULT 'bronze';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS badges TEXT[];

-- Notification settings
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_sounds BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT FALSE;

-- Timestamps
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- =====================================================
-- PART 2: ADD TIER COLUMNS AND CONSTRAINTS
-- =====================================================

-- Tier columns (ensure they exist)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS scanner_tier VARCHAR(20) DEFAULT 'FREE';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS chatbot_tier VARCHAR(20) DEFAULT 'FREE';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS course_tier VARCHAR(20) DEFAULT 'FREE';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tier_expires_at TIMESTAMPTZ;

-- Drop and recreate constraints to include ADMIN
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
-- PART 3: SYNC DATA FROM USERS TO PROFILES
-- =====================================================

-- Copy data from users to profiles where profiles exists
UPDATE profiles p
SET
  display_name = COALESCE(p.display_name, u.display_name),
  avatar_url = COALESCE(p.avatar_url, u.avatar_url),
  bio = COALESCE(p.bio, u.bio),
  twitter_handle = COALESCE(p.twitter_handle, u.twitter_handle),
  telegram_handle = COALESCE(p.telegram_handle, u.telegram_handle),
  trading_style = COALESCE(p.trading_style, u.trading_style),
  favorite_pairs = COALESCE(p.favorite_pairs, u.favorite_pairs),
  public_profile = COALESCE(p.public_profile, u.public_profile, TRUE),
  show_stats = COALESCE(p.show_stats, u.show_stats, TRUE),
  referral_code = COALESCE(p.referral_code, u.referral_code),
  referred_by = COALESCE(p.referred_by, u.referred_by),
  online_status = COALESCE(u.online_status, p.online_status, 'offline'),
  last_seen = COALESCE(u.last_seen, p.last_seen),
  last_seen_at = COALESCE(u.last_seen_at, p.last_seen_at),
  badge_tier = COALESCE(u.badge_tier, p.badge_tier, 'bronze')
FROM users u
WHERE p.id = u.id;

-- =====================================================
-- PART 4: CREATE AUTO-UPDATE TRIGGER FOR PROFILES
-- =====================================================

CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- =====================================================
-- PART 5: CREATE SYNC TRIGGER (profiles -> users for backward compat)
-- =====================================================

CREATE OR REPLACE FUNCTION sync_profiles_to_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync changes from profiles to users for backward compatibility
  UPDATE users
  SET
    display_name = NEW.display_name,
    avatar_url = NEW.avatar_url,
    bio = NEW.bio,
    online_status = NEW.online_status,
    last_seen = NEW.last_seen,
    scanner_tier = NEW.scanner_tier,
    role = NEW.role,
    is_admin = NEW.is_admin
  WHERE id = NEW.id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If users table doesn't have the record, ignore
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_profiles_to_users ON profiles;
CREATE TRIGGER trigger_sync_profiles_to_users
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_profiles_to_users();

-- =====================================================
-- PART 6: SET ADMIN FOR maow390@gmail.com
-- =====================================================

UPDATE profiles
SET
  role = 'admin',
  is_admin = TRUE,
  scanner_tier = 'ADMIN',
  chatbot_tier = 'ADMIN',
  course_tier = 'ADMIN'
WHERE email = 'maow390@gmail.com';

-- Also update by auth.users email
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
-- PART 7: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_scanner_tier ON profiles(scanner_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_online_status ON profiles(online_status);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);

-- =====================================================
-- PART 8: UPDATE RLS POLICIES
-- =====================================================

-- Allow users to update their own presence
DROP POLICY IF EXISTS "Users can update own presence" ON profiles;
CREATE POLICY "Users can update own presence"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check admin user
SELECT 'Admin check' as check_type, id, email, role, is_admin, scanner_tier, chatbot_tier
FROM profiles
WHERE email = 'maow390@gmail.com' OR is_admin = TRUE;

-- Check profiles columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
