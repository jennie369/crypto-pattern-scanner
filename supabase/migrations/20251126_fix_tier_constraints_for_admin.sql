-- ═══════════════════════════════════════════════════════════
-- GEM Platform - Fix: Allow admin tier values (999)
-- Admin users need unlimited access (tier = 999)
-- ═══════════════════════════════════════════════════════════

-- First, add chatbot_tier to profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'chatbot_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN chatbot_tier TEXT DEFAULT 'FREE';
    RAISE NOTICE 'Added chatbot_tier column to profiles table';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'scanner_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN scanner_tier TEXT DEFAULT 'FREE';
    RAISE NOTICE 'Added scanner_tier column to profiles table';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'course_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN course_tier TEXT DEFAULT 'FREE';
    RAISE NOTICE 'Added course_tier column to profiles table';
  END IF;
END $$;

-- Drop old constraints that don't allow 999/ADMIN
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_chatbot_tier_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_scanner_tier_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_course_tier_check;

-- Also update users table constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_chatbot_tier_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_scanner_tier_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_course_tier_check;

-- Add new constraints that allow 999 and ADMIN
ALTER TABLE profiles
  ADD CONSTRAINT profiles_chatbot_tier_check
  CHECK (chatbot_tier IS NULL OR chatbot_tier IN ('FREE', 'TIER1', 'TIER2', 'TIER3', 'ADMIN', '999'));

ALTER TABLE profiles
  ADD CONSTRAINT profiles_scanner_tier_check
  CHECK (scanner_tier IS NULL OR scanner_tier IN ('FREE', 'TIER1', 'TIER2', 'TIER3', 'ADMIN', '999'));

ALTER TABLE profiles
  ADD CONSTRAINT profiles_course_tier_check
  CHECK (course_tier IS NULL OR course_tier IN ('FREE', 'TIER1', 'TIER2', 'TIER3', 'ADMIN', '999'));

-- Same for users table
ALTER TABLE users
  ADD CONSTRAINT users_chatbot_tier_check
  CHECK (chatbot_tier IS NULL OR chatbot_tier IN ('FREE', 'TIER1', 'TIER2', 'TIER3', 'ADMIN', '999'));

ALTER TABLE users
  ADD CONSTRAINT users_scanner_tier_check
  CHECK (scanner_tier IS NULL OR scanner_tier IN ('FREE', 'TIER1', 'TIER2', 'TIER3', 'ADMIN', '999'));

ALTER TABLE users
  ADD CONSTRAINT users_course_tier_check
  CHECK (course_tier IS NULL OR course_tier IN ('FREE', 'TIER1', 'TIER2', 'TIER3', 'ADMIN', '999'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_chatbot_tier ON profiles(chatbot_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_scanner_tier ON profiles(scanner_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Tier constraints updated successfully!';
  RAISE NOTICE 'Allowed values: FREE, TIER1, TIER2, TIER3, ADMIN, 999';
END $$;
