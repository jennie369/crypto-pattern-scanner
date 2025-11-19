-- ==========================================
-- FIX USER_STATS RELATIONSHIP WITH PROFILES
-- ==========================================

-- Drop the existing foreign key constraint that references auth.users
ALTER TABLE public.user_stats
  DROP CONSTRAINT IF EXISTS user_stats_user_id_fkey;

-- Add a new foreign key constraint that references profiles instead
ALTER TABLE public.user_stats
  ADD CONSTRAINT user_stats_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- Do the same for user_achievements
ALTER TABLE public.user_achievements
  DROP CONSTRAINT IF EXISTS user_achievements_user_id_fkey;

ALTER TABLE public.user_achievements
  ADD CONSTRAINT user_achievements_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- Do the same for user_follows
ALTER TABLE public.user_follows
  DROP CONSTRAINT IF EXISTS user_follows_follower_id_fkey;

ALTER TABLE public.user_follows
  ADD CONSTRAINT user_follows_follower_id_fkey
  FOREIGN KEY (follower_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

ALTER TABLE public.user_follows
  DROP CONSTRAINT IF EXISTS user_follows_following_id_fkey;

ALTER TABLE public.user_follows
  ADD CONSTRAINT user_follows_following_id_fkey
  FOREIGN KEY (following_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Foreign key relationships fixed!';
  RAISE NOTICE '📊 user_stats now references profiles(id)';
  RAISE NOTICE '🏆 user_achievements now references profiles(id)';
  RAISE NOTICE '👥 user_follows now references profiles(id)';
END $$;
