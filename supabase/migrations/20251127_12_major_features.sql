-- =========================================================
-- GEM Mobile - 12 Major Features Database Migration
-- Created: 2024-11-27
-- Features: Shopping, Sound Library, Monetization,
--           Interactions, Privacy, Gifting
-- =========================================================

-- ===========================
-- GROUP A: SHOPPING FEATURES
-- ===========================

-- Feature #1: Shopping Tags (Tag Products in Posts)
CREATE TABLE IF NOT EXISTS shopping_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL(12,2),
  product_image TEXT,
  product_url TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'shopify', 'shopee')),
  x_position FLOAT NOT NULL,
  y_position FLOAT NOT NULL,
  image_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shopping_tags_post ON shopping_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_shopping_tags_product ON shopping_tags(product_id);

-- Feature #2: Live Shopping (Sell During Livestream)
CREATE TABLE IF NOT EXISTS live_shopping_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID, -- REFERENCES live_streams(id) ON DELETE CASCADE (if exists)
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL(12,2),
  sale_price DECIMAL(12,2),
  product_image TEXT,
  product_url TEXT,
  stock_quantity INT DEFAULT 0,
  sold_quantity INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_products_stream ON live_shopping_products(stream_id);

CREATE TABLE IF NOT EXISTS live_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID,
  product_id TEXT NOT NULL,
  buyer_id UUID REFERENCES profiles(id),
  quantity INT DEFAULT 1,
  price DECIMAL(12,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_purchases_buyer ON live_purchases(buyer_id);

-- Feature #3: Shopee Integration (Affiliate Links)
CREATE TABLE IF NOT EXISTS shopee_affiliate_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  original_url TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  product_name TEXT,
  product_image TEXT,
  commission_rate DECIMAL(5,2),
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shopee_links_user ON shopee_affiliate_links(user_id);

CREATE TABLE IF NOT EXISTS shopee_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_link_id UUID REFERENCES shopee_affiliate_links(id),
  order_id TEXT NOT NULL,
  amount DECIMAL(12,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- GROUP B: SOUND LIBRARY
-- ===========================

-- Feature #4: Browse Sounds
CREATE TABLE IF NOT EXISTS sound_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT,
  audio_url TEXT NOT NULL,
  cover_image TEXT,
  duration_seconds INT,
  genre TEXT,
  mood TEXT,
  is_original BOOLEAN DEFAULT FALSE,
  uploaded_by UUID REFERENCES profiles(id),
  play_count INT DEFAULT 0,
  use_count INT DEFAULT 0,
  is_trending BOOLEAN DEFAULT FALSE,
  upload_status TEXT DEFAULT 'approved' CHECK (upload_status IN ('pending', 'processing', 'approved', 'rejected')),
  copyright_info TEXT,
  is_licensed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to sound_library if they don't exist
ALTER TABLE sound_library ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT FALSE;
ALTER TABLE sound_library ADD COLUMN IF NOT EXISTS play_count INT DEFAULT 0;
ALTER TABLE sound_library ADD COLUMN IF NOT EXISTS use_count INT DEFAULT 0;
ALTER TABLE sound_library ADD COLUMN IF NOT EXISTS genre TEXT;
ALTER TABLE sound_library ADD COLUMN IF NOT EXISTS mood TEXT;
ALTER TABLE sound_library ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE sound_library ADD COLUMN IF NOT EXISTS artist TEXT;
ALTER TABLE sound_library ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE sound_library ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE sound_library ADD COLUMN IF NOT EXISTS duration_seconds INT;
ALTER TABLE sound_library ADD COLUMN IF NOT EXISTS is_original BOOLEAN DEFAULT FALSE;
ALTER TABLE sound_library ADD COLUMN IF NOT EXISTS uploaded_by UUID;
ALTER TABLE sound_library ADD COLUMN IF NOT EXISTS upload_status TEXT DEFAULT 'approved';
ALTER TABLE sound_library ADD COLUMN IF NOT EXISTS copyright_info TEXT;
ALTER TABLE sound_library ADD COLUMN IF NOT EXISTS is_licensed BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_sounds_trending ON sound_library(is_trending, use_count);
CREATE INDEX IF NOT EXISTS idx_sounds_genre ON sound_library(genre);
CREATE INDEX IF NOT EXISTS idx_sounds_uploaded_by ON sound_library(uploaded_by);

CREATE TABLE IF NOT EXISTS sound_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sound_id UUID REFERENCES sound_library(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sound_id)
);

-- Link sounds to posts
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS sound_id UUID REFERENCES sound_library(id);

-- Feature #6: Trending Sounds Algorithm
CREATE OR REPLACE FUNCTION calculate_sound_trending_score(p_sound_id UUID)
RETURNS FLOAT AS $$
DECLARE
  base_score FLOAT;
  recency_bonus FLOAT;
  velocity_score FLOAT;
BEGIN
  -- Base score from use count
  SELECT COALESCE(use_count * 10 + play_count, 0) INTO base_score
  FROM sound_library WHERE id = p_sound_id;

  -- Recency bonus (newer = higher)
  SELECT GREATEST(0, 100 - EXTRACT(DAY FROM NOW() - created_at) * 5) INTO recency_bonus
  FROM sound_library WHERE id = p_sound_id;

  -- Velocity: uses in last 24h
  SELECT COUNT(*) * 50 INTO velocity_score
  FROM forum_posts
  WHERE sound_id = p_sound_id
    AND created_at > NOW() - INTERVAL '24 hours';

  RETURN COALESCE(base_score, 0) + COALESCE(recency_bonus, 0) + COALESCE(velocity_score, 0);
END;
$$ LANGUAGE plpgsql;

-- Update trending status periodically
CREATE OR REPLACE FUNCTION update_trending_sounds()
RETURNS void AS $$
BEGIN
  UPDATE sound_library SET is_trending = FALSE;
  UPDATE sound_library SET is_trending = TRUE
  WHERE id IN (
    SELECT id FROM sound_library
    ORDER BY calculate_sound_trending_score(id) DESC
    LIMIT 50
  );
END;
$$ LANGUAGE plpgsql;

-- ===========================
-- GROUP C: MONETIZATION
-- ===========================

-- Feature #7: Boost Post (Paid Promotion)
CREATE TABLE IF NOT EXISTS post_boosts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  budget DECIMAL(12,2) NOT NULL,
  spent DECIMAL(12,2) DEFAULT 0,
  target_audience JSONB,
  -- target_audience: { interests: [], age_range: [18, 65], location: [] }
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'completed', 'cancelled')),
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  reach INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_boosts_status ON post_boosts(status);
CREATE INDEX IF NOT EXISTS idx_boosts_user ON post_boosts(user_id);
CREATE INDEX IF NOT EXISTS idx_boosts_post ON post_boosts(post_id);

CREATE TABLE IF NOT EXISTS boost_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boost_id UUID REFERENCES post_boosts(id) ON DELETE CASCADE,
  amount DECIMAL(12,2),
  payment_method TEXT,
  transaction_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature #8: Create Ad from Post
CREATE TABLE IF NOT EXISTS advertisements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_post_id UUID REFERENCES forum_posts(id),
  advertiser_id UUID REFERENCES profiles(id),
  ad_type TEXT CHECK (ad_type IN ('feed', 'story', 'banner')),
  headline TEXT,
  description TEXT,
  call_to_action TEXT,
  destination_url TEXT,
  media_urls JSONB,
  target_audience JSONB,
  budget DECIMAL(12,2),
  daily_budget DECIMAL(12,2),
  bid_strategy TEXT DEFAULT 'auto' CHECK (bid_strategy IN ('auto', 'manual')),
  bid_amount DECIMAL(12,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'active', 'paused', 'rejected', 'completed')),
  rejection_reason TEXT,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ads_status ON advertisements(status);
CREATE INDEX IF NOT EXISTS idx_ads_advertiser ON advertisements(advertiser_id);

-- ===========================
-- GROUP D: INTERACTIONS
-- ===========================

-- Feature #10: Repost to Feed
CREATE TABLE IF NOT EXISTS reposts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  reposter_id UUID REFERENCES profiles(id),
  quote TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(original_post_id, reposter_id)
);

ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS repost_count INT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_reposts_original ON reposts(original_post_id);
CREATE INDEX IF NOT EXISTS idx_reposts_user ON reposts(reposter_id);

-- Feature #11: Pin/Delete/Report Comments
-- Note: Table is named forum_comments (not post_comments)
ALTER TABLE forum_comments ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE forum_comments ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ;
ALTER TABLE forum_comments ADD COLUMN IF NOT EXISTS pinned_by UUID REFERENCES profiles(id);

CREATE TABLE IF NOT EXISTS comment_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES profiles(id),
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_reports_status ON comment_reports(status);

-- ===========================
-- GROUP E: PRIVACY SETTINGS
-- ===========================

-- Feature #13: Post Privacy Settings
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public'
  CHECK (visibility IN ('public', 'followers', 'close_friends', 'private'));

CREATE TABLE IF NOT EXISTS close_friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_close_friends_user ON close_friends(user_id);

CREATE TABLE IF NOT EXISTS post_audience_restrictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  allow_comments BOOLEAN DEFAULT TRUE,
  allow_sharing BOOLEAN DEFAULT TRUE,
  allow_reactions BOOLEAN DEFAULT TRUE,
  hide_like_count BOOLEAN DEFAULT FALSE,
  disable_download BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id)
);

-- ===========================
-- GROUP F: GIFTING SYSTEM
-- ===========================

-- Feature #14: Virtual Currency
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  gem_balance INT DEFAULT 0,
  diamond_balance INT DEFAULT 0,
  total_earned INT DEFAULT 0,
  total_spent INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID REFERENCES user_wallets(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('purchase', 'gift_sent', 'gift_received', 'withdrawal', 'bonus', 'refund')),
  currency TEXT CHECK (currency IN ('gem', 'diamond', 'vnd')),
  amount INT NOT NULL,
  description TEXT,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON wallet_transactions(type);

CREATE TABLE IF NOT EXISTS currency_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  gem_amount INT NOT NULL,
  price_vnd INT NOT NULL,
  bonus_gems INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial currency packages
INSERT INTO currency_packages (name, gem_amount, price_vnd, bonus_gems, is_featured) VALUES
  ('Starter Pack', 100, 22000, 0, FALSE),
  ('Popular Pack', 500, 99000, 50, TRUE),
  ('Pro Pack', 1000, 189000, 150, FALSE),
  ('VIP Pack', 5000, 890000, 1000, FALSE)
ON CONFLICT DO NOTHING;

-- Feature #15: Gift Catalog
CREATE TABLE IF NOT EXISTS gift_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  animation_url TEXT,
  gem_cost INT NOT NULL,
  category TEXT CHECK (category IN ('standard', 'premium', 'luxury', 'animated', 'limited')),
  is_animated BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gift_catalog_category ON gift_catalog(category);

CREATE TABLE IF NOT EXISTS sent_gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gift_id UUID REFERENCES gift_catalog(id),
  sender_id UUID REFERENCES profiles(id),
  recipient_id UUID REFERENCES profiles(id),
  post_id UUID REFERENCES forum_posts(id),
  stream_id UUID,
  gem_amount INT NOT NULL,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gifts_recipient ON sent_gifts(recipient_id);
CREATE INDEX IF NOT EXISTS idx_gifts_sender ON sent_gifts(sender_id);
CREATE INDEX IF NOT EXISTS idx_gifts_post ON sent_gifts(post_id);

-- Initial gifts catalog
INSERT INTO gift_catalog (name, description, image_url, gem_cost, category, is_animated, display_order) VALUES
  ('Heart', 'Show some love', '/gifts/heart.png', 10, 'standard', FALSE, 1),
  ('Star', 'You are a star!', '/gifts/star.png', 25, 'standard', FALSE, 2),
  ('Rose', 'A beautiful rose', '/gifts/rose.png', 50, 'standard', FALSE, 3),
  ('Diamond', 'Premium gift', '/gifts/diamond.png', 100, 'premium', TRUE, 4),
  ('Crown', 'Royal treatment', '/gifts/crown.png', 500, 'luxury', TRUE, 5),
  ('Fireworks', 'Celebration!', '/gifts/fireworks.png', 1000, 'animated', TRUE, 6)
ON CONFLICT DO NOTHING;

-- Feature #16: Creator Earnings
CREATE TABLE IF NOT EXISTS creator_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  source_type TEXT CHECK (source_type IN ('gift', 'subscription', 'tip', 'ad_revenue')),
  source_id UUID,
  gross_amount INT NOT NULL,
  platform_fee INT DEFAULT 0,
  net_amount INT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'withdrawn', 'cancelled')),
  available_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to creator_earnings if they don't exist
ALTER TABLE creator_earnings ADD COLUMN IF NOT EXISTS creator_id UUID;
ALTER TABLE creator_earnings ADD COLUMN IF NOT EXISTS source_type TEXT;
ALTER TABLE creator_earnings ADD COLUMN IF NOT EXISTS source_id UUID;
ALTER TABLE creator_earnings ADD COLUMN IF NOT EXISTS gross_amount INT;
ALTER TABLE creator_earnings ADD COLUMN IF NOT EXISTS platform_fee INT DEFAULT 0;
ALTER TABLE creator_earnings ADD COLUMN IF NOT EXISTS net_amount INT;
ALTER TABLE creator_earnings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE creator_earnings ADD COLUMN IF NOT EXISTS available_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_earnings_creator ON creator_earnings(creator_id);
CREATE INDEX IF NOT EXISTS idx_earnings_status ON creator_earnings(status);

CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES profiles(id),
  amount INT NOT NULL,
  bank_name TEXT,
  account_number TEXT,
  account_holder TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  processed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_creator ON withdrawal_requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawal_requests(status);

-- Trigger to calculate earnings from gifts (70% to creator, 30% platform fee)
CREATE OR REPLACE FUNCTION calculate_gift_earnings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO creator_earnings (
    creator_id,
    source_type,
    source_id,
    gross_amount,
    platform_fee,
    net_amount,
    status,
    available_at
  ) VALUES (
    NEW.recipient_id,
    'gift',
    NEW.id,
    NEW.gem_amount,
    FLOOR(NEW.gem_amount * 0.30), -- 30% platform fee
    FLOOR(NEW.gem_amount * 0.70), -- 70% to creator
    'pending',
    NOW() + INTERVAL '7 days' -- 7-day hold period
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists then create
DROP TRIGGER IF EXISTS trg_gift_earnings ON sent_gifts;
CREATE TRIGGER trg_gift_earnings
AFTER INSERT ON sent_gifts
FOR EACH ROW EXECUTE FUNCTION calculate_gift_earnings();

-- Function to create wallet on user signup
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_wallets (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists then create
DROP TRIGGER IF EXISTS trg_create_wallet ON profiles;
CREATE TRIGGER trg_create_wallet
AFTER INSERT ON profiles
FOR EACH ROW EXECUTE FUNCTION create_user_wallet();

-- ===========================
-- ROW LEVEL SECURITY
-- ===========================

-- Enable RLS on new tables
ALTER TABLE shopping_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_shopping_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopee_affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopee_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sound_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE sound_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE boost_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE close_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_audience_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE sent_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Shopping tags: Public read, authenticated write
CREATE POLICY "Shopping tags are viewable by everyone" ON shopping_tags FOR SELECT USING (true);
CREATE POLICY "Users can create shopping tags" ON shopping_tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can delete own shopping tags" ON shopping_tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM forum_posts WHERE id = post_id AND author_id = auth.uid())
);

-- Sound library: Public read, authenticated upload
CREATE POLICY "Sounds are viewable by everyone" ON sound_library FOR SELECT USING (upload_status = 'approved');
CREATE POLICY "Users can upload sounds" ON sound_library FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own sounds" ON sound_library FOR UPDATE USING (uploaded_by = auth.uid());

-- Sound favorites: Own data only
CREATE POLICY "Users can view own favorites" ON sound_favorites FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can add favorites" ON sound_favorites FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can remove favorites" ON sound_favorites FOR DELETE USING (user_id = auth.uid());

-- Reposts: Public read
CREATE POLICY "Reposts are viewable by everyone" ON reposts FOR SELECT USING (true);
CREATE POLICY "Users can create reposts" ON reposts FOR INSERT WITH CHECK (reposter_id = auth.uid());
CREATE POLICY "Users can delete own reposts" ON reposts FOR DELETE USING (reposter_id = auth.uid());

-- Close friends: Own data only
CREATE POLICY "Users can view own close friends" ON close_friends FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can add close friends" ON close_friends FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can remove close friends" ON close_friends FOR DELETE USING (user_id = auth.uid());

-- Wallets: Own data only
CREATE POLICY "Users can view own wallet" ON user_wallets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can create wallets" ON user_wallets FOR INSERT WITH CHECK (user_id = auth.uid());

-- Transactions: Own data only
CREATE POLICY "Users can view own transactions" ON wallet_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_wallets WHERE id = wallet_id AND user_id = auth.uid())
);

-- Currency packages: Public read
CREATE POLICY "Currency packages are viewable by everyone" ON currency_packages FOR SELECT USING (is_active = true);

-- Gift catalog: Public read
CREATE POLICY "Gifts are viewable by everyone" ON gift_catalog FOR SELECT USING (is_active = true);

-- Sent gifts: Sender and recipient can view
CREATE POLICY "Users can view sent/received gifts" ON sent_gifts FOR SELECT USING (
  sender_id = auth.uid() OR recipient_id = auth.uid()
);
CREATE POLICY "Users can send gifts" ON sent_gifts FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Earnings: Own data only
CREATE POLICY "Creators can view own earnings" ON creator_earnings FOR SELECT USING (creator_id = auth.uid());

-- Withdrawals: Own data only
CREATE POLICY "Creators can view own withdrawals" ON withdrawal_requests FOR SELECT USING (creator_id = auth.uid());
CREATE POLICY "Creators can request withdrawals" ON withdrawal_requests FOR INSERT WITH CHECK (creator_id = auth.uid());

-- Post boosts: Owner only
CREATE POLICY "Users can view own boosts" ON post_boosts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create boosts" ON post_boosts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own boosts" ON post_boosts FOR UPDATE USING (user_id = auth.uid());

-- Advertisements: Owner only
CREATE POLICY "Users can view own ads" ON advertisements FOR SELECT USING (advertiser_id = auth.uid());
CREATE POLICY "Users can create ads" ON advertisements FOR INSERT WITH CHECK (advertiser_id = auth.uid());
CREATE POLICY "Users can update own ads" ON advertisements FOR UPDATE USING (advertiser_id = auth.uid());

-- Comment reports: Reporter and admins
CREATE POLICY "Users can view own reports" ON comment_reports FOR SELECT USING (reporter_id = auth.uid());
CREATE POLICY "Users can create reports" ON comment_reports FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- Post audience restrictions: Post owner
CREATE POLICY "Post owners can manage restrictions" ON post_audience_restrictions FOR ALL USING (
  EXISTS (SELECT 1 FROM forum_posts WHERE id = post_id AND author_id = auth.uid())
);

-- Live shopping: Public read for active streams
CREATE POLICY "Live products are viewable" ON live_shopping_products FOR SELECT USING (true);
CREATE POLICY "Live purchases viewable by buyer" ON live_purchases FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "Users can make purchases" ON live_purchases FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- Shopee affiliate: Own data only
CREATE POLICY "Users can view own affiliate links" ON shopee_affiliate_links FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create affiliate links" ON shopee_affiliate_links FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view own commissions" ON shopee_commissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM shopee_affiliate_links WHERE id = affiliate_link_id AND user_id = auth.uid())
);

-- ===========================
-- HELPER FUNCTIONS
-- ===========================

-- Increment repost count
CREATE OR REPLACE FUNCTION increment_repost_count(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts
  SET repost_count = COALESCE(repost_count, 0) + 1
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement repost count
CREATE OR REPLACE FUNCTION decrement_repost_count(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts
  SET repost_count = GREATEST(COALESCE(repost_count, 0) - 1, 0)
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement comment count
CREATE OR REPLACE FUNCTION decrement_comment_count(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts
  SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0)
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment sound play count
CREATE OR REPLACE FUNCTION increment_sound_play_count(p_sound_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE sound_library
  SET play_count = COALESCE(play_count, 0) + 1
  WHERE id = p_sound_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment sound use count
CREATE OR REPLACE FUNCTION increment_sound_use_count(p_sound_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE sound_library
  SET use_count = COALESCE(use_count, 0) + 1
  WHERE id = p_sound_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================
-- DONE
-- ===========================
