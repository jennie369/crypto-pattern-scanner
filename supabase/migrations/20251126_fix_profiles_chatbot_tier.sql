-- ═══════════════════════════════════════════════════════════
-- GEM Platform - Fix: Add chatbot_tier column to profiles
-- Match the existing users.chatbot_tier structure (TEXT type)
-- ═══════════════════════════════════════════════════════════

-- Add chatbot_tier column if it doesn't exist (TEXT type like in users table)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'chatbot_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN chatbot_tier TEXT DEFAULT 'FREE';
    RAISE NOTICE 'Added chatbot_tier (TEXT) column to profiles table';
  END IF;

  -- Also add chatbot_tier_expires_at if needed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'chatbot_tier_expires_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN chatbot_tier_expires_at TIMESTAMPTZ;
    RAISE NOTICE 'Added chatbot_tier_expires_at column to profiles table';
  END IF;
END $$;

-- Add constraint to match users table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_chatbot_tier_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_chatbot_tier_check
  CHECK (chatbot_tier IS NULL OR chatbot_tier IN ('FREE', 'TIER1', 'TIER2', 'TIER3'));

-- Create index
CREATE INDEX IF NOT EXISTS idx_profiles_chatbot_tier ON profiles(chatbot_tier);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'profiles.chatbot_tier fix completed successfully!';
  RAISE NOTICE 'Column type: TEXT with values FREE, TIER1, TIER2, TIER3';
END $$;
