-- =====================================================
-- HOTFIX: Create missing profile for user 970ef692-2944-4f45-a7de-bd533e62b0b1
-- Run this in Supabase SQL Editor immediately
-- =====================================================

-- Create profile for the specific user if missing
INSERT INTO public.profiles (id, email, display_name, full_name, role, scanner_tier, chatbot_tier, course_tier, gems, referral_code, created_at)
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
  UPPER(SUBSTRING(MD5(au.id::TEXT || NOW()::TEXT) FROM 1 FOR 8)),
  NOW()
FROM auth.users au
WHERE au.id = '970ef692-2944-4f45-a7de-bd533e62b0b1'
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id)
ON CONFLICT (id) DO NOTHING;

-- Also create profiles for ALL users missing profiles
INSERT INTO public.profiles (id, email, display_name, full_name, role, scanner_tier, chatbot_tier, course_tier, gems, referral_code, created_at)
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
  UPPER(SUBSTRING(MD5(au.id::TEXT || NOW()::TEXT) FROM 1 FOR 8)),
  NOW()
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id)
ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT
  'Users in auth.users' as check_type,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT
  'Users in profiles' as check_type,
  COUNT(*) as count
FROM public.profiles;
