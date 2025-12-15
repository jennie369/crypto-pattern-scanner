-- =====================================================
-- CHECK MISSING DATABASE OBJECTS
-- Run this in Supabase SQL Editor to see what's missing
-- December 11, 2025
-- =====================================================

-- =====================================================
-- PART 1: CHECK TABLES
-- =====================================================

WITH required_tables AS (
  SELECT unnest(ARRAY[
    -- Core User
    'profiles', 'user_follows', 'blocked_users', 'close_friends',
    -- Forum/Social
    'forum_categories', 'forum_posts', 'forum_comments', 'forum_likes', 'forum_saved',
    'forum_notifications', 'post_interactions', 'post_boosts', 'post_views', 'post_reports',
    'post_edit_history', 'reposts', 'pinned_posts', 'photo_tags', 'shopping_tags',
    'stories', 'live_streams', 'scheduled_posts', 'hidden_posts',
    -- Seed Content
    'seed_posts', 'seed_users', 'seed_impressions', 'bot_activity_log',
    -- Vision Board
    'vision_board_widgets', 'user_widgets', 'vision_actions', 'vision_action_logs',
    'vision_goals', 'vision_habits', 'vision_habit_logs', 'vision_affirmations',
    'vision_affirmation_logs', 'vision_rituals', 'vision_ritual_completions',
    'vision_ritual_streaks', 'vision_milestones', 'vision_daily_summary', 'vision_user_stats',
    'calendar_events', 'daily_completions', 'user_streaks',
    -- Courses
    'courses', 'course_modules', 'course_lessons', 'course_enrollments',
    'lesson_progress', 'lesson_attachments', 'quizzes', 'quiz_questions', 'quiz_attempts',
    'course_certificates',
    -- Divination
    'divination_readings',
    -- Wallet
    'user_wallets', 'wallet_transactions', 'sent_gifts', 'gift_catalog',
    -- Affiliate
    'affiliate_profiles', 'affiliate_codes', 'affiliate_sales', 'affiliate_referrals',
    'affiliate_commissions', 'affiliate_withdrawals', 'affiliate_bonus_kpi',
    'partnership_applications', 'withdrawal_requests', 'creator_earnings',
    -- Shopify
    'shopify_orders', 'shopify_products',
    -- Feed
    'user_feed_preferences', 'feed_impressions', 'custom_feeds',
    'ad_impressions', 'user_hashtag_affinity', 'user_content_dislikes',
    -- Notifications
    'notifications', 'notification_settings', 'notification_preferences',
    'system_notifications', 'user_push_tokens',
    -- Messaging
    'messages', 'conversations', 'conversation_participants',
    -- Sounds
    'sound_library', 'sounds', 'saved_sounds',
    -- Sponsor
    'sponsor_banners',
    -- Other
    'chatbot_quota', 'voice_usage', 'portfolio_holdings', 'paper_trades', 'paper_positions'
  ]) AS table_name
),
existing_tables AS (
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
)
SELECT
  'MISSING TABLE' AS status,
  r.table_name
FROM required_tables r
LEFT JOIN existing_tables e ON r.table_name = e.table_name
WHERE e.table_name IS NULL
ORDER BY r.table_name;

-- =====================================================
-- PART 2: CHECK RPC FUNCTIONS
-- =====================================================

WITH required_functions AS (
  SELECT unnest(ARRAY[
    -- Partnership
    'admin_approve_withdrawal', 'admin_complete_withdrawal', 'admin_reject_withdrawal',
    'approve_partnership_application', 'reject_partnership_application',
    'submit_partnership_application', 'request_withdrawal', 'process_withdrawal',
    'get_partnership_status', 'check_ctv_eligibility', 'get_user_courses',
    'generate_affiliate_code',
    -- Gamification
    'track_daily_completion', 'get_daily_completion_status', 'get_habit_grid_data',
    'get_user_streak', 'update_streak', 'award_achievement',
    'complete_widget_with_xp', 'complete_action_with_xp', 'uncomplete_action',
    'get_action_stats', 'get_goal_actions_grouped', 'reset_user_actions',
    'update_affirmation_streak', 'get_goals_with_progress',
    'get_life_area_scores', 'get_weekly_progress', 'get_vision_today_overview', 'get_stats_overview',
    -- Calendar
    'get_calendar_events', 'complete_calendar_event', 'sync_calendar_event',
    'delete_calendar_events_by_source',
    -- GEM Economy
    'get_gem_balance', 'get_checkin_status', 'perform_daily_checkin',
    'claim_pending_gem_credits', 'claim_welcome_bonus',
    -- Course
    'check_course_access', 'grant_course_access', 'calculate_course_progress',
    'increment_review_helpful',
    -- Forum/Social
    'increment_post_count', 'increment_comment_count', 'decrement_comment_count',
    'increment_share_count', 'increment_repost_count', 'decrement_repost_count',
    'get_trending_hashtags', 'update_post_likes_count', 'update_post_comments_count',
    'calculate_engagement_score', 'update_post_engagement_score',
    -- Boost
    'increment_boost_impressions', 'increment_boost_clicks',
    -- Affiliate
    'increment_affiliate_clicks',
    -- Notification
    'send_broadcast_notification', 'send_notification_to_users', 'mark_messages_as_read',
    -- Live Stream
    'increment_stream_viewers', 'decrement_stream_viewers', 'increment_story_views',
    -- Sound
    'increment_sound_play_count', 'increment_sound_use_count',
    -- Sponsor Banner
    'increment_banner_view', 'increment_banner_click',
    -- Seed Content
    'delete_all_seed_content', 'check_bot_daily_limit', 'get_random_seed_users'
  ]) AS function_name
),
existing_functions AS (
  SELECT proname AS function_name
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
)
SELECT
  'MISSING FUNCTION' AS status,
  r.function_name
FROM required_functions r
LEFT JOIN existing_functions e ON r.function_name = e.function_name
WHERE e.function_name IS NULL
ORDER BY r.function_name;

-- =====================================================
-- PART 3: SHOW EXISTING TABLES (for reference)
-- =====================================================

SELECT '--- EXISTING TABLES ---' AS info;

SELECT table_name,
       (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =====================================================
-- PART 4: SHOW EXISTING FUNCTIONS (for reference)
-- =====================================================

SELECT '--- EXISTING FUNCTIONS ---' AS info;

SELECT proname AS function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY proname;
