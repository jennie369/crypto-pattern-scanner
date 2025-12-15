-- ============================================
-- FIX: Drop existing policies before recreating
-- Run this FIRST if you get "policy already exists" errors
-- ============================================

-- Drop post_interactions policies
DROP POLICY IF EXISTS "Users can view own interactions" ON post_interactions;
DROP POLICY IF EXISTS "Users can create own interactions" ON post_interactions;
DROP POLICY IF EXISTS "Users can update own interactions" ON post_interactions;
DROP POLICY IF EXISTS "Users can delete own interactions" ON post_interactions;
DROP POLICY IF EXISTS "Admins can view all interactions" ON post_interactions;

-- Drop gift_catalog policies
DROP POLICY IF EXISTS "Anyone can view active gifts" ON gift_catalog;
DROP POLICY IF EXISTS "Admins can manage gift catalog" ON gift_catalog;

-- Drop user_feed_preferences policies
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_feed_preferences;

-- Drop user_hashtag_affinity policies
DROP POLICY IF EXISTS "Users can manage own hashtag affinity" ON user_hashtag_affinity;

-- Drop user_content_dislikes policies
DROP POLICY IF EXISTS "Users can manage own dislikes" ON user_content_dislikes;

-- Drop feed_impressions policies
DROP POLICY IF EXISTS "Users can manage own impressions" ON feed_impressions;
DROP POLICY IF EXISTS "Admins can view all impressions" ON feed_impressions;

-- Drop ad_impressions policies
DROP POLICY IF EXISTS "Users can manage own ad impressions" ON ad_impressions;
DROP POLICY IF EXISTS "Admins can view all ad impressions" ON ad_impressions;

-- Now you can run the main migration again
