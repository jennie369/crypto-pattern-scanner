-- =====================================================
-- FIX PROFILES TRIGGER - Auto-create profile on signup
-- Date: 2025-12-11
-- Problem: When user signs up, no profile is created in profiles table
-- Solution: Create trigger to auto-insert into profiles table
-- =====================================================

-- =====================================================
-- STEP 1: CREATE PROFILES TABLE IF NOT EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  email TEXT,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  cover_url TEXT,

  -- Role & Admin
  role VARCHAR(20) DEFAULT 'user',
  is_admin BOOLEAN DEFAULT FALSE,

  -- Tier Columns
  scanner_tier VARCHAR(20) DEFAULT 'FREE',
  chatbot_tier VARCHAR(20) DEFAULT 'FREE',
  course_tier VARCHAR(20) DEFAULT 'FREE',
  tier_expires_at TIMESTAMPTZ,

  -- Social Handles
  twitter_handle TEXT,
  telegram_handle TEXT,

  -- Trading Preferences
  trading_style TEXT,
  favorite_pairs TEXT[],

  -- Privacy Settings
  public_profile BOOLEAN DEFAULT TRUE,
  show_stats BOOLEAN DEFAULT TRUE,

  -- Affiliate System
  referral_code TEXT UNIQUE,
  referred_by UUID,

  -- Online Presence
  online_status TEXT DEFAULT 'offline',
  last_seen TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,

  -- Badge System
  badge_tier TEXT DEFAULT 'bronze',
  badges TEXT[],

  -- Notifications
  notification_sounds BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT FALSE,
  expo_push_token TEXT,

  -- Gem Economy (SINGLE SOURCE OF TRUTH)
  gems INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 2: ADD MISSING COLUMNS IF TABLE EXISTS
-- =====================================================

DO $$
BEGIN
  -- Add gems column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'gems') THEN
    ALTER TABLE public.profiles ADD COLUMN gems INT DEFAULT 0;
  END IF;

  -- Add cover_url column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'cover_url') THEN
    ALTER TABLE public.profiles ADD COLUMN cover_url TEXT;
  END IF;
END
$$;

-- =====================================================
-- STEP 3: CREATE TRIGGER FUNCTION FOR NEW USER
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  generated_referral_code TEXT;
BEGIN
  -- Generate unique referral code
  generated_referral_code := UPPER(SUBSTRING(MD5(NEW.id::TEXT || NOW()::TEXT) FROM 1 FOR 8));

  -- Insert into profiles table
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    display_name,
    avatar_url,
    role,
    is_admin,
    scanner_tier,
    chatbot_tier,
    course_tier,
    referral_code,
    gems,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'user',
    FALSE,
    'FREE',
    'FREE',
    'FREE',
    generated_referral_code,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    updated_at = NOW();

  -- Also create wallet for backwards compatibility
  INSERT INTO public.user_wallets (user_id, gem_balance, diamond_balance, total_earned, total_spent)
  VALUES (NEW.id, 0, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 4: CREATE TRIGGER ON AUTH.USERS
-- =====================================================

-- Drop old triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;

-- Create new trigger
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- =====================================================
-- STEP 5: ENABLE RLS ON PROFILES
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles viewable" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create RLS policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view profiles"
  ON public.profiles FOR SELECT
  TO anon
  USING (public_profile = true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- STEP 6: ADD referral_code COLUMN IF NOT EXISTS
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'referral_code') THEN
    ALTER TABLE public.profiles ADD COLUMN referral_code TEXT UNIQUE;
  END IF;
END
$$;

-- =====================================================
-- STEP 7: CREATE MISSING PROFILES FOR EXISTING USERS
-- =====================================================

-- This will create profiles for any users in auth.users that don't have a profile yet
INSERT INTO public.profiles (id, email, display_name, full_name, role, scanner_tier, chatbot_tier, course_tier, gems, referral_code)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', SPLIT_PART(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', SPLIT_PART(au.email, '@', 1)),
  'user',
  'FREE',
  'FREE',
  'FREE',
  0,
  UPPER(SUBSTRING(MD5(au.id::TEXT || NOW()::TEXT) FROM 1 FOR 8))
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 8: CREATE user_wallets TABLE IF NOT EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  gem_balance INT DEFAULT 0,
  diamond_balance INT DEFAULT 0,
  total_earned INT DEFAULT 0,
  total_spent INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own wallet" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can update own wallet" ON public.user_wallets;

CREATE POLICY "Users can view own wallet"
  ON public.user_wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
  ON public.user_wallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- DONE! Now when a user signs up:
-- 1. auth.users gets a new row (Supabase Auth handles this)
-- 2. Trigger fires and creates row in profiles table
-- 3. Also creates row in user_wallets for backwards compatibility
-- =====================================================

-- Verify trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_profile'
  ) THEN
    RAISE WARNING 'Trigger on_auth_user_created_profile was NOT created!';
  ELSE
    RAISE NOTICE 'Trigger on_auth_user_created_profile created successfully.';
  END IF;
END
$$;
