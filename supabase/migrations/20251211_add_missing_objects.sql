-- =====================================================
-- ADD MISSING DATABASE OBJECTS
-- December 11, 2025
--
-- This migration adds ONLY the missing tables and functions
-- identified by CHECK_MISSING_OBJECTS.sql
-- =====================================================

-- =====================================================
-- PART 1: MISSING TABLES (8 tables)
-- =====================================================

-- 1. hidden_posts - For users to hide posts from their feed
CREATE TABLE IF NOT EXISTS hidden_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  reason TEXT, -- 'not_interested', 'spam', 'offensive', etc
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_hidden_posts_user ON hidden_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_hidden_posts_post ON hidden_posts(post_id);

ALTER TABLE hidden_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own hidden posts" ON hidden_posts;
CREATE POLICY "Users can view own hidden posts" ON hidden_posts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can hide posts" ON hidden_posts;
CREATE POLICY "Users can hide posts" ON hidden_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unhide posts" ON hidden_posts;
CREATE POLICY "Users can unhide posts" ON hidden_posts
  FOR DELETE USING (auth.uid() = user_id);


-- 2. paper_trades - Paper trading history
CREATE TABLE IF NOT EXISTS paper_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  side VARCHAR(10) NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity DECIMAL(20, 8) NOT NULL,
  price DECIMAL(20, 8) NOT NULL,
  total_value DECIMAL(20, 2) NOT NULL,
  fee DECIMAL(20, 8) DEFAULT 0,
  pnl DECIMAL(20, 2) DEFAULT 0,
  pnl_percent DECIMAL(10, 4) DEFAULT 0,
  pattern_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_paper_trades_user ON paper_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_trades_symbol ON paper_trades(symbol);
CREATE INDEX IF NOT EXISTS idx_paper_trades_created ON paper_trades(created_at DESC);

ALTER TABLE paper_trades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own paper trades" ON paper_trades;
CREATE POLICY "Users can view own paper trades" ON paper_trades
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create paper trades" ON paper_trades;
CREATE POLICY "Users can create paper trades" ON paper_trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 3. paper_positions - Current paper trading positions
CREATE TABLE IF NOT EXISTS paper_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  quantity DECIMAL(20, 8) NOT NULL DEFAULT 0,
  avg_entry_price DECIMAL(20, 8) NOT NULL,
  current_price DECIMAL(20, 8),
  unrealized_pnl DECIMAL(20, 2) DEFAULT 0,
  unrealized_pnl_percent DECIMAL(10, 4) DEFAULT 0,
  stop_loss DECIMAL(20, 8),
  take_profit DECIMAL(20, 8),
  pattern_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

CREATE INDEX IF NOT EXISTS idx_paper_positions_user ON paper_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_positions_symbol ON paper_positions(symbol);

ALTER TABLE paper_positions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own positions" ON paper_positions;
CREATE POLICY "Users can view own positions" ON paper_positions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own positions" ON paper_positions;
CREATE POLICY "Users can manage own positions" ON paper_positions
  FOR ALL USING (auth.uid() = user_id);


-- 4. photo_tags - Tag users in photos
CREATE TABLE IF NOT EXISTS photo_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  tagged_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  x_position FLOAT NOT NULL, -- 0-1 percentage from left
  y_position FLOAT NOT NULL, -- 0-1 percentage from top
  image_index INT DEFAULT 0, -- Which image in multi-image post
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, tagged_user_id, image_index)
);

CREATE INDEX IF NOT EXISTS idx_photo_tags_post ON photo_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_photo_tags_user ON photo_tags(tagged_user_id);

ALTER TABLE photo_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view photo tags" ON photo_tags;
CREATE POLICY "Anyone can view photo tags" ON photo_tags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Post owners can manage photo tags" ON photo_tags;
CREATE POLICY "Post owners can manage photo tags" ON photo_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM forum_posts WHERE id = post_id AND user_id = auth.uid())
  );


-- 5. post_reports - Report inappropriate posts
CREATE TABLE IF NOT EXISTS post_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL, -- 'spam', 'harassment', 'violence', 'misinformation', etc
  details TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_post_reports_post ON post_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_reporter ON post_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_status ON post_reports(status);

ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reports" ON post_reports;
CREATE POLICY "Users can view own reports" ON post_reports
  FOR SELECT USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can create reports" ON post_reports;
CREATE POLICY "Users can create reports" ON post_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Admins can manage all reports" ON post_reports;
CREATE POLICY "Admins can manage all reports" ON post_reports
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- 6. post_views - Track post views
CREATE TABLE IF NOT EXISTS post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for anonymous views
  session_id TEXT, -- For anonymous tracking
  view_duration INT, -- Seconds spent viewing
  source TEXT, -- 'feed', 'profile', 'search', 'direct'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_views_post ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user ON post_views(user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_created ON post_views(created_at DESC);

ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create post views" ON post_views;
CREATE POLICY "Anyone can create post views" ON post_views
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own views" ON post_views;
CREATE POLICY "Users can view own views" ON post_views
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);


-- 7. sent_gifts - Track gifts sent between users
CREATE TABLE IF NOT EXISTS sent_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id UUID REFERENCES gift_catalog(id) ON DELETE SET NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES forum_posts(id) ON DELETE SET NULL,
  stream_id UUID, -- For live stream gifts
  gem_amount INT NOT NULL,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sent_gifts_sender ON sent_gifts(sender_id);
CREATE INDEX IF NOT EXISTS idx_sent_gifts_recipient ON sent_gifts(recipient_id);
CREATE INDEX IF NOT EXISTS idx_sent_gifts_post ON sent_gifts(post_id);
CREATE INDEX IF NOT EXISTS idx_sent_gifts_created ON sent_gifts(created_at DESC);

ALTER TABLE sent_gifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view gifts they sent or received" ON sent_gifts;
CREATE POLICY "Users can view gifts they sent or received" ON sent_gifts
  FOR SELECT USING (
    auth.uid() = sender_id OR
    (auth.uid() = recipient_id AND is_anonymous = FALSE)
  );

DROP POLICY IF EXISTS "Users can send gifts" ON sent_gifts;
CREATE POLICY "Users can send gifts" ON sent_gifts
  FOR INSERT WITH CHECK (auth.uid() = sender_id);


-- 8. sounds - Sound effects and music (simplified version)
CREATE TABLE IF NOT EXISTS sounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT,
  audio_url TEXT NOT NULL,
  cover_image TEXT,
  duration_seconds INT,
  genre TEXT,
  mood TEXT,
  is_original BOOLEAN DEFAULT FALSE,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  play_count INT DEFAULT 0,
  use_count INT DEFAULT 0,
  is_trending BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sounds_trending ON sounds(is_trending, use_count DESC);
CREATE INDEX IF NOT EXISTS idx_sounds_genre ON sounds(genre);
CREATE INDEX IF NOT EXISTS idx_sounds_uploaded_by ON sounds(uploaded_by);

ALTER TABLE sounds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active sounds" ON sounds;
CREATE POLICY "Anyone can view active sounds" ON sounds
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Users can upload sounds" ON sounds;
CREATE POLICY "Users can upload sounds" ON sounds
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);


-- =====================================================
-- PART 2: MISSING FUNCTIONS (6 functions)
-- =====================================================

-- 1. claim_pending_gem_credits - Claim pending gem rewards
DROP FUNCTION IF EXISTS claim_pending_gem_credits(UUID);
CREATE OR REPLACE FUNCTION claim_pending_gem_credits(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pending_gems INT := 0;
  v_wallet_id UUID;
BEGIN
  -- Get user's wallet
  SELECT id INTO v_wallet_id FROM user_wallets WHERE user_id = p_user_id;

  IF v_wallet_id IS NULL THEN
    -- Create wallet if not exists
    INSERT INTO user_wallets (user_id, gem_balance)
    VALUES (p_user_id, 0)
    RETURNING id INTO v_wallet_id;
  END IF;

  -- Check for pending gem credits (from achievements, referrals, etc.)
  -- This is a placeholder - implement your specific logic
  SELECT COALESCE(SUM(points_awarded), 0) INTO v_pending_gems
  FROM user_achievements
  WHERE user_id = p_user_id
    AND unlocked_at > NOW() - INTERVAL '24 hours';

  IF v_pending_gems > 0 THEN
    -- Add gems to wallet
    UPDATE user_wallets
    SET gem_balance = gem_balance + v_pending_gems,
        total_earned = total_earned + v_pending_gems,
        updated_at = NOW()
    WHERE id = v_wallet_id;

    -- Record transaction
    INSERT INTO wallet_transactions (wallet_id, type, currency, amount, description)
    VALUES (v_wallet_id, 'bonus', 'gem', v_pending_gems, 'Claimed pending gem credits');
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
    'gems_claimed', v_pending_gems,
    'message', CASE WHEN v_pending_gems > 0
      THEN 'Đã nhận ' || v_pending_gems || ' gems!'
      ELSE 'Không có gems chờ nhận'
    END
  );
END;
$$;


-- 2. claim_welcome_bonus - New user welcome bonus
DROP FUNCTION IF EXISTS claim_welcome_bonus(UUID);
CREATE OR REPLACE FUNCTION claim_welcome_bonus(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
  v_already_claimed BOOLEAN;
  v_bonus_gems INT := 100; -- Welcome bonus amount
BEGIN
  -- Check if already claimed
  SELECT EXISTS(
    SELECT 1 FROM wallet_transactions
    WHERE wallet_id IN (SELECT id FROM user_wallets WHERE user_id = p_user_id)
      AND description LIKE '%welcome%bonus%'
  ) INTO v_already_claimed;

  IF v_already_claimed THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Bạn đã nhận welcome bonus rồi!'
    );
  END IF;

  -- Get or create wallet
  SELECT id INTO v_wallet_id FROM user_wallets WHERE user_id = p_user_id;

  IF v_wallet_id IS NULL THEN
    INSERT INTO user_wallets (user_id, gem_balance, total_earned)
    VALUES (p_user_id, v_bonus_gems, v_bonus_gems)
    RETURNING id INTO v_wallet_id;
  ELSE
    UPDATE user_wallets
    SET gem_balance = gem_balance + v_bonus_gems,
        total_earned = total_earned + v_bonus_gems,
        updated_at = NOW()
    WHERE id = v_wallet_id;
  END IF;

  -- Record transaction
  INSERT INTO wallet_transactions (wallet_id, type, currency, amount, description)
  VALUES (v_wallet_id, 'bonus', 'gem', v_bonus_gems, 'Welcome bonus for new user');

  RETURN jsonb_build_object(
    'success', TRUE,
    'gems_received', v_bonus_gems,
    'message', 'Chào mừng! Bạn đã nhận ' || v_bonus_gems || ' gems!'
  );
END;
$$;


-- 3. increment_comment_count - Increment comment count on post
DROP FUNCTION IF EXISTS increment_comment_count(UUID);
CREATE OR REPLACE FUNCTION increment_comment_count(p_post_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE forum_posts
  SET comments_count = COALESCE(comments_count, 0) + 1,
      comment_count = COALESCE(comment_count, 0) + 1,
      updated_at = NOW()
  WHERE id = p_post_id;
END;
$$;


-- 4. increment_review_helpful - Increment helpful count on course review
DROP FUNCTION IF EXISTS increment_review_helpful(UUID);
CREATE OR REPLACE FUNCTION increment_review_helpful(p_review_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Assuming there's a course_reviews table with helpful_count column
  -- If not exists, this will just do nothing
  UPDATE course_reviews
  SET helpful_count = COALESCE(helpful_count, 0) + 1
  WHERE id = p_review_id;
EXCEPTION
  WHEN undefined_table THEN
    -- Table doesn't exist, do nothing
    NULL;
END;
$$;


-- 5. increment_share_count - Increment share count on post
DROP FUNCTION IF EXISTS increment_share_count(UUID);
CREATE OR REPLACE FUNCTION increment_share_count(p_post_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE forum_posts
  SET share_count = COALESCE(share_count, 0) + 1,
      updated_at = NOW()
  WHERE id = p_post_id;
END;
$$;


-- 6. update_affirmation_streak - Update user's affirmation streak
DROP FUNCTION IF EXISTS update_affirmation_streak(UUID);
CREATE OR REPLACE FUNCTION update_affirmation_streak(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_streak INT := 0;
  v_longest_streak INT := 0;
  v_last_date DATE;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Get current streak info
  SELECT current_streak, longest_streak, last_completed_date
  INTO v_current_streak, v_longest_streak, v_last_date
  FROM user_streaks
  WHERE user_id = p_user_id AND streak_type = 'affirmation';

  IF NOT FOUND THEN
    -- Create new streak record
    INSERT INTO user_streaks (user_id, streak_type, current_streak, longest_streak, last_completed_date)
    VALUES (p_user_id, 'affirmation', 1, 1, v_today);

    RETURN jsonb_build_object(
      'current_streak', 1,
      'longest_streak', 1,
      'streak_continued', TRUE
    );
  END IF;

  -- Already completed today
  IF v_last_date = v_today THEN
    RETURN jsonb_build_object(
      'current_streak', v_current_streak,
      'longest_streak', v_longest_streak,
      'streak_continued', FALSE,
      'message', 'Already completed today'
    );
  END IF;

  -- Check if streak continues
  IF v_last_date = v_today - 1 THEN
    -- Streak continues
    v_current_streak := v_current_streak + 1;
    IF v_current_streak > v_longest_streak THEN
      v_longest_streak := v_current_streak;
    END IF;
  ELSE
    -- Streak broken
    v_current_streak := 1;
  END IF;

  -- Update streak
  UPDATE user_streaks
  SET current_streak = v_current_streak,
      longest_streak = v_longest_streak,
      last_completed_date = v_today,
      updated_at = NOW()
  WHERE user_id = p_user_id AND streak_type = 'affirmation';

  RETURN jsonb_build_object(
    'current_streak', v_current_streak,
    'longest_streak', v_longest_streak,
    'streak_continued', TRUE
  );
END;
$$;


-- =====================================================
-- PART 3: GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION claim_pending_gem_credits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION claim_welcome_bonus(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_comment_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_review_helpful(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_share_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_affirmation_streak(UUID) TO authenticated;


-- =====================================================
-- PART 4: TRIGGERS FOR NEW TABLES
-- =====================================================

-- Trigger for paper_positions updated_at
CREATE OR REPLACE FUNCTION update_paper_positions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_paper_positions_updated_at ON paper_positions;
CREATE TRIGGER trigger_paper_positions_updated_at
  BEFORE UPDATE ON paper_positions
  FOR EACH ROW
  EXECUTE FUNCTION update_paper_positions_updated_at();


-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check tables created
SELECT 'TABLES CREATED:' as info;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('hidden_posts', 'paper_trades', 'paper_positions', 'photo_tags',
                     'post_reports', 'post_views', 'sent_gifts', 'sounds')
ORDER BY table_name;

-- Check functions created
SELECT 'FUNCTIONS CREATED:' as info;
SELECT proname FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN ('claim_pending_gem_credits', 'claim_welcome_bonus', 'increment_comment_count',
                  'increment_review_helpful', 'increment_share_count', 'update_affirmation_streak')
ORDER BY proname;
