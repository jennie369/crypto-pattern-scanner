-- =====================================================
-- FIX ALL RLS POLICIES TO USE PROFILES TABLE
-- Date: 2025-11-26
-- Problem: Many policies reference 'users' table instead of 'profiles'
-- Solution: Update ALL policies to use 'profiles' consistently
-- =====================================================

-- =====================================================
-- PART 1: CREATE HELPER FUNCTION FOR ADMIN CHECK
-- =====================================================

CREATE OR REPLACE FUNCTION is_user_admin(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_profile RECORD;
BEGIN
  SELECT role, is_admin, scanner_tier, chatbot_tier
  INTO user_profile
  FROM profiles
  WHERE id = user_id_param;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  RETURN (
    user_profile.is_admin = TRUE OR
    user_profile.role = 'admin' OR
    user_profile.role = 'ADMIN' OR
    user_profile.scanner_tier = 'ADMIN' OR
    user_profile.chatbot_tier = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 2: FIX FORUM_POSTS POLICIES
-- =====================================================

-- Drop all existing forum_posts policies
DROP POLICY IF EXISTS "Admin users can create admin posts" ON forum_posts;
DROP POLICY IF EXISTS "Anyone can view published posts" ON forum_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON forum_posts;
DROP POLICY IF EXISTS "Admins can manage all posts" ON forum_posts;

-- Recreate policies using profiles table
CREATE POLICY "Anyone can view published posts"
  ON forum_posts FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Authenticated users can create posts"
  ON forum_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON forum_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR is_user_admin(auth.uid()));

CREATE POLICY "Users can delete own posts"
  ON forum_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR is_user_admin(auth.uid()));

CREATE POLICY "Admins can manage all posts"
  ON forum_posts FOR ALL
  TO authenticated
  USING (is_user_admin(auth.uid()));

-- =====================================================
-- PART 3: FIX FORUM_COMMENTS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view comments" ON forum_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON forum_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON forum_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON forum_comments;
DROP POLICY IF EXISTS "Admins can manage all comments" ON forum_comments;

CREATE POLICY "Anyone can view comments"
  ON forum_comments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON forum_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON forum_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR is_user_admin(auth.uid()));

CREATE POLICY "Users can delete own comments"
  ON forum_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR is_user_admin(auth.uid()));

-- =====================================================
-- PART 4: FIX FORUM_LIKES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view likes" ON forum_likes;
DROP POLICY IF EXISTS "Authenticated users can like" ON forum_likes;
DROP POLICY IF EXISTS "Users can unlike own likes" ON forum_likes;

CREATE POLICY "Anyone can view likes"
  ON forum_likes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can like"
  ON forum_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike own likes"
  ON forum_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- PART 5: FIX FORUM_SAVED POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own saved" ON forum_saved;
DROP POLICY IF EXISTS "Users can save posts" ON forum_saved;
DROP POLICY IF EXISTS "Users can unsave posts" ON forum_saved;

CREATE POLICY "Users can view own saved"
  ON forum_saved FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts"
  ON forum_saved FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave posts"
  ON forum_saved FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- PART 6: FIX PROFILES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles viewable" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own presence" ON profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR is_user_admin(auth.uid()) OR public_profile = true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR is_user_admin(auth.uid()))
  WITH CHECK (id = auth.uid() OR is_user_admin(auth.uid()));

-- Allow users to insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- =====================================================
-- PART 7: FIX PARTNERSHIP_APPLICATIONS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own applications" ON partnership_applications;
DROP POLICY IF EXISTS "Users can create applications" ON partnership_applications;
DROP POLICY IF EXISTS "Admins can manage all applications" ON partnership_applications;

CREATE POLICY "Users can view own applications"
  ON partnership_applications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_user_admin(auth.uid()));

CREATE POLICY "Users can create applications"
  ON partnership_applications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all applications"
  ON partnership_applications FOR ALL
  TO authenticated
  USING (is_user_admin(auth.uid()));

-- =====================================================
-- PART 8: FIX WITHDRAWAL_REQUESTS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own withdrawals" ON withdrawal_requests;
DROP POLICY IF EXISTS "Users can create withdrawals" ON withdrawal_requests;
DROP POLICY IF EXISTS "Admins can manage all withdrawals" ON withdrawal_requests;

CREATE POLICY "Users can view own withdrawals"
  ON withdrawal_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_user_admin(auth.uid()));

CREATE POLICY "Users can create withdrawals"
  ON withdrawal_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all withdrawals"
  ON withdrawal_requests FOR ALL
  TO authenticated
  USING (is_user_admin(auth.uid()));

-- =====================================================
-- PART 9: FIX USER_PURCHASES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own purchases" ON user_purchases;
DROP POLICY IF EXISTS "Service can manage purchases" ON user_purchases;
DROP POLICY IF EXISTS "Admins can manage all purchases" ON user_purchases;

CREATE POLICY "Users can view own purchases"
  ON user_purchases FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_user_admin(auth.uid()));

CREATE POLICY "Admins can manage all purchases"
  ON user_purchases FOR ALL
  TO authenticated
  USING (is_user_admin(auth.uid()));

-- =====================================================
-- PART 10: FIX CHATBOT_QUOTA POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own quota" ON chatbot_quota;
DROP POLICY IF EXISTS "Users can insert own quota" ON chatbot_quota;
DROP POLICY IF EXISTS "Users can update own quota" ON chatbot_quota;
DROP POLICY IF EXISTS "Admins can manage all quota" ON chatbot_quota;

CREATE POLICY "Users can view own quota"
  ON chatbot_quota FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_user_admin(auth.uid()));

CREATE POLICY "Users can insert own quota"
  ON chatbot_quota FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own quota"
  ON chatbot_quota FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR is_user_admin(auth.uid()));

-- =====================================================
-- PART 11: FIX USER_FOLLOWS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view follows" ON user_follows;
DROP POLICY IF EXISTS "Users can create follows" ON user_follows;
DROP POLICY IF EXISTS "Users can delete own follows" ON user_follows;

CREATE POLICY "Anyone can view follows"
  ON user_follows FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create follows"
  ON user_follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows"
  ON user_follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- =====================================================
-- PART 12: FIX MESSAGES/CONVERSATIONS POLICIES (if exists)
-- =====================================================

DO $$
BEGIN
  -- Drop old policies on conversations if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
    DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
    DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

    EXECUTE 'CREATE POLICY "Users can view own conversations"
      ON conversations FOR SELECT
      TO authenticated
      USING (
        participant1_id = auth.uid() OR
        participant2_id = auth.uid() OR
        is_user_admin(auth.uid())
      )';

    EXECUTE 'CREATE POLICY "Users can create conversations"
      ON conversations FOR INSERT
      TO authenticated
      WITH CHECK (participant1_id = auth.uid() OR participant2_id = auth.uid())';
  END IF;
END $$;

DO $$
BEGIN
  -- Drop old policies on messages if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
    DROP POLICY IF EXISTS "Users can send messages" ON messages;

    EXECUTE 'CREATE POLICY "Users can view messages in their conversations"
      ON messages FOR SELECT
      TO authenticated
      USING (
        sender_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM conversations c
          WHERE c.id = messages.conversation_id
          AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
        ) OR
        is_user_admin(auth.uid())
      )';

    EXECUTE 'CREATE POLICY "Users can send messages"
      ON messages FOR INSERT
      TO authenticated
      WITH CHECK (sender_id = auth.uid())';
  END IF;
END $$;

-- =====================================================
-- PART 13: FIX NOTIFICATIONS POLICIES (if exists)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

    EXECUTE 'CREATE POLICY "Users can view own notifications"
      ON notifications FOR SELECT
      TO authenticated
      USING (user_id = auth.uid() OR is_user_admin(auth.uid()))';

    EXECUTE 'CREATE POLICY "Users can update own notifications"
      ON notifications FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid())';
  END IF;
END $$;

-- =====================================================
-- PART 14: ADD MISSING COLUMNS TO PROFILES
-- =====================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_seller BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_trader BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level_badge TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role_badge TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS achievement_badges TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT TRUE;

-- =====================================================
-- PART 15: VERIFICATION
-- =====================================================

-- List all policies that still reference 'users' table
SELECT schemaname, tablename, policyname, qual, with_check
FROM pg_policies
WHERE qual::text LIKE '%FROM users%'
   OR with_check::text LIKE '%FROM users%'
ORDER BY tablename;

-- Verify forum posts are accessible
SELECT COUNT(*) as accessible_posts FROM forum_posts WHERE status = 'published';
