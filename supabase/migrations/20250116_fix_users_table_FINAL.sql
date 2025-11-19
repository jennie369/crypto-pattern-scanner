-- ========================================
-- FIX: Users Table Migration FINAL
-- Created: 2025-01-16
-- Purpose: Match actual schema with 3 tier columns
-- ========================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 1: Create users table if it doesn't exist
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  twitter_handle TEXT,
  telegram_handle TEXT,
  trading_style TEXT,
  favorite_pairs TEXT[],
  public_profile BOOLEAN DEFAULT TRUE,
  show_stats BOOLEAN DEFAULT TRUE,
  online_status TEXT DEFAULT 'offline',
  last_seen TIMESTAMPTZ DEFAULT NOW(),

  -- Three separate tier columns (matching actual schema)
  scanner_tier TEXT DEFAULT 'FREE',
  course_tier TEXT DEFAULT 'FREE',
  chatbot_tier TEXT DEFAULT 'FREE',

  -- Tier expiration dates
  scanner_tier_expires_at TIMESTAMPTZ,
  course_tier_expires_at TIMESTAMPTZ,
  chatbot_tier_expires_at TIMESTAMPTZ,

  -- Affiliate tracking
  referral_code TEXT,
  referred_by UUID,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 2: Add missing columns to existing users table
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS twitter_handle TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS telegram_handle TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS trading_style TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS favorite_pairs TEXT[];
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT TRUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS show_stats BOOLEAN DEFAULT TRUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS online_status TEXT DEFAULT 'offline';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();

-- Tier columns (all 3)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS scanner_tier TEXT DEFAULT 'FREE';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS course_tier TEXT DEFAULT 'FREE';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS chatbot_tier TEXT DEFAULT 'FREE';

-- Expiration dates (all 3)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS scanner_tier_expires_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS course_tier_expires_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS chatbot_tier_expires_at TIMESTAMPTZ;

-- Other columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referred_by UUID;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 3: Normalize existing data BEFORE adding constraints
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Normalize scanner_tier: 'free' → 'FREE', 'premium' → 'TIER3', keep TIER1/2/3
UPDATE public.users
SET scanner_tier = CASE
  WHEN LOWER(scanner_tier) = 'free' THEN 'FREE'
  WHEN LOWER(scanner_tier) = 'premium' THEN 'TIER3'
  WHEN UPPER(scanner_tier) IN ('TIER1', 'TIER2', 'TIER3') THEN UPPER(scanner_tier)
  ELSE 'FREE'
END
WHERE scanner_tier IS NOT NULL;

-- Normalize course_tier
UPDATE public.users
SET course_tier = CASE
  WHEN LOWER(course_tier) = 'free' THEN 'FREE'
  WHEN LOWER(course_tier) = 'premium' THEN 'TIER3'
  WHEN UPPER(course_tier) IN ('TIER1', 'TIER2', 'TIER3') THEN UPPER(course_tier)
  ELSE 'FREE'
END
WHERE course_tier IS NOT NULL;

-- Normalize chatbot_tier
UPDATE public.users
SET chatbot_tier = CASE
  WHEN LOWER(chatbot_tier) = 'free' THEN 'FREE'
  WHEN LOWER(chatbot_tier) = 'premium' THEN 'TIER3'
  WHEN UPPER(chatbot_tier) IN ('TIER1', 'TIER2', 'TIER3') THEN UPPER(chatbot_tier)
  ELSE 'FREE'
END
WHERE chatbot_tier IS NOT NULL;

-- Set default values for NULL tiers
UPDATE public.users SET scanner_tier = 'FREE' WHERE scanner_tier IS NULL;
UPDATE public.users SET course_tier = 'FREE' WHERE course_tier IS NULL;
UPDATE public.users SET chatbot_tier = 'FREE' WHERE chatbot_tier IS NULL;

-- Normalize online_status
UPDATE public.users
SET online_status = CASE
  WHEN LOWER(online_status) IN ('online', 'offline', 'away') THEN LOWER(online_status)
  ELSE 'offline'
END
WHERE online_status IS NOT NULL;

UPDATE public.users SET online_status = 'offline' WHERE online_status IS NULL;

-- Sync full_name from display_name if missing
UPDATE public.users
SET full_name = display_name
WHERE full_name IS NULL AND display_name IS NOT NULL;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 4: Drop old constraints (if they exist)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_scanner_tier_check;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_course_tier_check;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_chatbot_tier_check;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_online_status_check;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_referral_code_key;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_referred_by_fkey;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_email_key;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 5: Add constraints AFTER data is normalized
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Check constraints for all 3 tier columns
ALTER TABLE public.users
  ADD CONSTRAINT users_scanner_tier_check
  CHECK (scanner_tier IN ('FREE', 'TIER1', 'TIER2', 'TIER3'));

ALTER TABLE public.users
  ADD CONSTRAINT users_course_tier_check
  CHECK (course_tier IN ('FREE', 'TIER1', 'TIER2', 'TIER3'));

ALTER TABLE public.users
  ADD CONSTRAINT users_chatbot_tier_check
  CHECK (chatbot_tier IN ('FREE', 'TIER1', 'TIER2', 'TIER3'));

ALTER TABLE public.users
  ADD CONSTRAINT users_online_status_check
  CHECK (online_status IN ('online', 'offline', 'away'));

-- Add unique constraints (only if no duplicates)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT referral_code FROM public.users
    WHERE referral_code IS NOT NULL
    GROUP BY referral_code HAVING COUNT(*) > 1
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_referral_code_key UNIQUE (referral_code);
  ELSE
    RAISE NOTICE '⚠️  Duplicate referral_codes found, skipping unique constraint';
  END IF;

  IF NOT EXISTS (
    SELECT email FROM public.users
    WHERE email IS NOT NULL
    GROUP BY email HAVING COUNT(*) > 1
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);
  ELSE
    RAISE NOTICE '⚠️  Duplicate emails found, skipping unique constraint';
  END IF;
END $$;

-- Add self-referencing FK
ALTER TABLE public.users
  ADD CONSTRAINT users_referred_by_fkey
  FOREIGN KEY (referred_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 6: Create indexes
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_scanner_tier ON public.users(scanner_tier);
CREATE INDEX IF NOT EXISTS idx_users_course_tier ON public.users(course_tier);
CREATE INDEX IF NOT EXISTS idx_users_chatbot_tier ON public.users(chatbot_tier);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.users(referred_by) WHERE referred_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_online_status ON public.users(online_status) WHERE online_status = 'online';
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON public.users(last_seen DESC);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 7: Enable RLS and create policies
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles viewable by all" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can create own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users cannot delete own profile" ON public.users;

CREATE POLICY "Public profiles viewable by all"
  ON public.users FOR SELECT
  USING (public_profile = TRUE OR auth.uid() = id);

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can create own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users cannot delete own profile"
  ON public.users FOR DELETE
  USING (false);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 8: Create triggers
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION public.handle_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_users_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    display_name,
    full_name,
    scanner_tier,
    course_tier,
    chatbot_tier
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', NEW.email),
    'FREE',
    'FREE',
    'FREE'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, public.users.display_name),
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.sync_full_name_from_display_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.full_name IS NULL AND NEW.display_name IS NOT NULL THEN
    NEW.full_name := NEW.display_name;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_full_name ON public.users;
CREATE TRIGGER trigger_sync_full_name
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_full_name_from_display_name();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 9: Create helper tables
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view follows" ON public.user_follows;
DROP POLICY IF EXISTS "Users can create follows" ON public.user_follows;
DROP POLICY IF EXISTS "Users can delete own follows" ON public.user_follows;
CREATE POLICY "Anyone can view follows" ON public.user_follows FOR SELECT USING (true);
CREATE POLICY "Users can create follows" ON public.user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete own follows" ON public.user_follows FOR DELETE USING (auth.uid() = follower_id);

CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  total_profit DECIMAL(20,2) DEFAULT 0,
  avg_profit DECIMAL(20,2) DEFAULT 0,
  best_trade DECIMAL(20,2) DEFAULT 0,
  worst_trade DECIMAL(20,2) DEFAULT 0,
  forum_posts INTEGER DEFAULT 0,
  forum_likes_received INTEGER DEFAULT 0,
  helpful_answers INTEGER DEFAULT 0,
  patterns_detected INTEGER DEFAULT 0,
  alerts_created INTEGER DEFAULT 0,
  days_active INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_total_profit ON public.user_stats(total_profit DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_win_rate ON public.user_stats(win_rate DESC);

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view user stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;
CREATE POLICY "Anyone can view user stats" ON public.user_stats FOR SELECT USING (true);
CREATE POLICY "Users can update own stats" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER DEFAULT 100,
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON public.user_achievements(achievement_id);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievements;
DROP POLICY IF EXISTS "Anyone can view user achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can unlock own achievements" ON public.user_achievements;
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Anyone can view user achievements" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "Users can unlock own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_stats ON public.users;
CREATE TRIGGER on_user_created_stats
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_stats();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 10: Grant permissions
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.user_follows TO authenticated;
GRANT ALL ON public.user_stats TO authenticated;
GRANT ALL ON public.achievements TO authenticated;
GRANT ALL ON public.user_achievements TO authenticated;

NOTIFY pgrst, 'reload schema';

DO $$
DECLARE
  user_count INTEGER;
  free_count INTEGER;
  tier1_count INTEGER;
  tier2_count INTEGER;
  tier3_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.users;
  SELECT COUNT(*) INTO free_count FROM public.users WHERE scanner_tier = 'FREE';
  SELECT COUNT(*) INTO tier1_count FROM public.users WHERE scanner_tier = 'TIER1';
  SELECT COUNT(*) INTO tier2_count FROM public.users WHERE scanner_tier = 'TIER2';
  SELECT COUNT(*) INTO tier3_count FROM public.users WHERE scanner_tier = 'TIER3';

  RAISE NOTICE '✅ Users table migration FINAL completed successfully!';
  RAISE NOTICE '📊 Total users: %', user_count;
  RAISE NOTICE '📊 Tier breakdown:';
  RAISE NOTICE '   - FREE: %', free_count;
  RAISE NOTICE '   - TIER1: %', tier1_count;
  RAISE NOTICE '   - TIER2: %', tier2_count;
  RAISE NOTICE '   - TIER3: %', tier3_count;
  RAISE NOTICE '📋 Tables: users, user_follows, user_stats, achievements, user_achievements';
  RAISE NOTICE '🔐 RLS policies enabled';
  RAISE NOTICE '⚡ Triggers configured';
  RAISE NOTICE '✨ Data normalized:';
  RAISE NOTICE '   - "free" → "FREE"';
  RAISE NOTICE '   - "premium" → "TIER3"';
  RAISE NOTICE '   - All tier columns: scanner_tier, course_tier, chatbot_tier';
END $$;
