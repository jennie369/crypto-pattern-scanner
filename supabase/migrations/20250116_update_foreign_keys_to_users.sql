-- ========================================
-- UPDATE FOREIGN KEYS TO PUBLIC.USERS
-- Created: 2025-01-16
-- Purpose: Update FK constraints from auth.users to public.users
-- ========================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- IMPORTANT: This migration updates FK constraints to point to public.users
-- instead of auth.users, enabling proper joins with the users table
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ========================================
-- FORUM TABLES
-- ========================================

-- Update forum_threads.author_id FK
ALTER TABLE public.forum_threads
  DROP CONSTRAINT IF EXISTS forum_threads_author_id_fkey CASCADE,
  ADD CONSTRAINT forum_threads_author_id_fkey
    FOREIGN KEY (author_id)
    REFERENCES public.users(id)
    ON DELETE CASCADE;

-- Update forum_replies.author_id FK
ALTER TABLE public.forum_replies
  DROP CONSTRAINT IF EXISTS forum_replies_author_id_fkey CASCADE,
  ADD CONSTRAINT forum_replies_author_id_fkey
    FOREIGN KEY (author_id)
    REFERENCES public.users(id)
    ON DELETE CASCADE;

-- ========================================
-- MESSAGING TABLES
-- ========================================

-- Update messages.sender_id FK (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    ALTER TABLE public.messages
      DROP CONSTRAINT IF EXISTS messages_sender_id_fkey CASCADE;
    ALTER TABLE public.messages
      ADD CONSTRAINT messages_sender_id_fkey
        FOREIGN KEY (sender_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE;
  END IF;
END $$;

-- Update conversation_participants.user_id FK (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_participants') THEN
    ALTER TABLE public.conversation_participants
      DROP CONSTRAINT IF EXISTS conversation_participants_user_id_fkey CASCADE;
    ALTER TABLE public.conversation_participants
      ADD CONSTRAINT conversation_participants_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE;
  END IF;
END $$;

-- ========================================
-- EVENTS TABLES
-- ========================================

-- Update community_events.host_id FK (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_events') THEN
    ALTER TABLE public.community_events
      DROP CONSTRAINT IF EXISTS community_events_host_id_fkey CASCADE;
    ALTER TABLE public.community_events
      ADD CONSTRAINT community_events_host_id_fkey
        FOREIGN KEY (host_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE;
  END IF;
END $$;

-- Update event_rsvps.user_id FK (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_rsvps') THEN
    ALTER TABLE public.event_rsvps
      DROP CONSTRAINT IF EXISTS event_rsvps_user_id_fkey CASCADE;
    ALTER TABLE public.event_rsvps
      ADD CONSTRAINT event_rsvps_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE;
  END IF;
END $$;

-- ========================================
-- AFFILIATE TABLES
-- ========================================

-- Update affiliate_referrals.referred_user_id FK (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'affiliate_referrals') THEN
    ALTER TABLE public.affiliate_referrals
      DROP CONSTRAINT IF EXISTS affiliate_referrals_referred_user_id_fkey CASCADE;
    ALTER TABLE public.affiliate_referrals
      ADD CONSTRAINT affiliate_referrals_referred_user_id_fkey
        FOREIGN KEY (referred_user_id)
        REFERENCES public.users(id)
        ON DELETE SET NULL;
  END IF;
END $$;

-- ========================================
-- LEADERBOARD/STATS TABLES
-- ========================================

-- user_stats is already handled in the users table migration
-- user_follows is already handled in the users table migration
-- user_achievements is already handled in the users table migration

-- ========================================
-- OTHER USER-RELATED TABLES
-- ========================================

-- Update forum_thread_likes.user_id FK
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_thread_likes') THEN
    ALTER TABLE public.forum_thread_likes
      DROP CONSTRAINT IF EXISTS forum_thread_likes_user_id_fkey CASCADE;
    ALTER TABLE public.forum_thread_likes
      ADD CONSTRAINT forum_thread_likes_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE;
  END IF;
END $$;

-- Update forum_reply_likes.user_id FK
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_reply_likes') THEN
    ALTER TABLE public.forum_reply_likes
      DROP CONSTRAINT IF EXISTS forum_reply_likes_user_id_fkey CASCADE;
    ALTER TABLE public.forum_reply_likes
      ADD CONSTRAINT forum_reply_likes_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE;
  END IF;
END $$;

-- Update trading_journal.user_id FK (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trading_journal') THEN
    ALTER TABLE public.trading_journal
      DROP CONSTRAINT IF EXISTS trading_journal_user_id_fkey CASCADE;
    ALTER TABLE public.trading_journal
      ADD CONSTRAINT trading_journal_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE;
  END IF;
END $$;

-- Update backtestconfigs.user_id FK (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backtestconfigs') THEN
    ALTER TABLE public.backtestconfigs
      DROP CONSTRAINT IF EXISTS backtestconfigs_user_id_fkey CASCADE;
    ALTER TABLE public.backtestconfigs
      ADD CONSTRAINT backtestconfigs_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE;
  END IF;
END $$;

-- Update user_settings.user_id FK (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_settings') THEN
    ALTER TABLE public.user_settings
      DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey CASCADE;
    ALTER TABLE public.user_settings
      ADD CONSTRAINT user_settings_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE;
  END IF;
END $$;

-- Update user_sessions.user_id FK (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_sessions') THEN
    ALTER TABLE public.user_sessions
      DROP CONSTRAINT IF EXISTS user_sessions_user_id_fkey CASCADE;
    ALTER TABLE public.user_sessions
      ADD CONSTRAINT user_sessions_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE;
  END IF;
END $$;

-- Update api_keys.user_id FK (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_keys') THEN
    ALTER TABLE public.api_keys
      DROP CONSTRAINT IF EXISTS api_keys_user_id_fkey CASCADE;
    ALTER TABLE public.api_keys
      ADD CONSTRAINT api_keys_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE;
  END IF;
END $$;

-- Update subscription_invoices.user_id FK (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_invoices') THEN
    ALTER TABLE public.subscription_invoices
      DROP CONSTRAINT IF EXISTS subscription_invoices_user_id_fkey CASCADE;
    ALTER TABLE public.subscription_invoices
      ADD CONSTRAINT subscription_invoices_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE;
  END IF;
END $$;

-- Force schema reload for PostgREST
NOTIFY pgrst, 'reload schema';

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Foreign key migration completed successfully!';
  RAISE NOTICE '🔄 All user-related FK constraints now point to public.users';
  RAISE NOTICE '📋 Updated tables:';
  RAISE NOTICE '   - forum_threads, forum_replies, forum_*_likes';
  RAISE NOTICE '   - messages, conversation_participants';
  RAISE NOTICE '   - community_events, event_rsvps';
  RAISE NOTICE '   - affiliate_referrals';
  RAISE NOTICE '   - trading_journal, backtestconfigs';
  RAISE NOTICE '   - user_settings, user_sessions, api_keys';
  RAISE NOTICE '   - subscription_invoices';
  RAISE NOTICE '✨ Service file joins (users!*_fkey) will now work correctly!';
END $$;
