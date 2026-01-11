-- ============================================
-- Migration: Sticker & Emoji System
-- Date: 2024-12-18
-- Purpose: Create tables for sticker packs, stickers, and user tracking
-- ============================================

-- ============================================
-- 1. STICKER PACKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS sticker_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_vi TEXT,                          -- Vietnamese name
  description TEXT,
  description_vi TEXT,                   -- Vietnamese description
  thumbnail_url TEXT NOT NULL,           -- Pack thumbnail image
  author TEXT DEFAULT 'GEM Team',
  category TEXT CHECK (category IN (
    'trending', 'love', 'funny', 'animals', 'cute',
    'memes', 'holidays', 'custom', 'animated'
  )) DEFAULT 'custom',
  is_animated BOOLEAN DEFAULT FALSE,     -- Pack contains Lottie/animated stickers
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,     -- Show in featured section
  display_order INT DEFAULT 0,
  sticker_count INT DEFAULT 0,           -- Denormalized count
  download_count INT DEFAULT 0,          -- Popularity tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sticker_packs_active ON sticker_packs(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_sticker_packs_category ON sticker_packs(category);
CREATE INDEX IF NOT EXISTS idx_sticker_packs_featured ON sticker_packs(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_sticker_packs_order ON sticker_packs(display_order);

-- ============================================
-- 2. STICKERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID NOT NULL REFERENCES sticker_packs(id) ON DELETE CASCADE,
  name TEXT,                             -- Optional sticker name
  keywords TEXT[] DEFAULT '{}',          -- Search keywords
  image_url TEXT,                        -- Static image (PNG/WebP)
  lottie_url TEXT,                       -- Lottie animation JSON URL
  gif_url TEXT,                          -- GIF version (fallback for non-Lottie)
  format TEXT CHECK (format IN ('png', 'webp', 'gif', 'lottie')) DEFAULT 'png',
  width INT DEFAULT 512,
  height INT DEFAULT 512,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INT DEFAULT 0,             -- Track popularity
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stickers_pack ON stickers(pack_id);
CREATE INDEX IF NOT EXISTS idx_stickers_active ON stickers(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_stickers_keywords ON stickers USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_stickers_format ON stickers(format);

-- ============================================
-- 3. USER RECENT STICKERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_recent_stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sticker_id UUID REFERENCES stickers(id) ON DELETE CASCADE,
  giphy_id TEXT,                         -- For GIPHY/Tenor GIFs
  giphy_url TEXT,                        -- GIPHY URL for quick access
  emoji TEXT,                            -- For emoji reactions
  type TEXT CHECK (type IN ('sticker', 'gif', 'emoji')) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  usage_count INT DEFAULT 1
);

-- Unique constraints (partial - only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_recent_stickers_unique_sticker
  ON user_recent_stickers(user_id, sticker_id) WHERE sticker_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_recent_stickers_unique_giphy
  ON user_recent_stickers(user_id, giphy_id) WHERE giphy_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_recent_stickers_unique_emoji
  ON user_recent_stickers(user_id, emoji) WHERE emoji IS NOT NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_recent_stickers_user ON user_recent_stickers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recent_stickers_type ON user_recent_stickers(user_id, type);
CREATE INDEX IF NOT EXISTS idx_user_recent_stickers_used ON user_recent_stickers(user_id, used_at DESC);

-- ============================================
-- 4. USER FAVORITE STICKER PACKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_favorite_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_id UUID NOT NULL REFERENCES sticker_packs(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_user_pack UNIQUE (user_id, pack_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorite_packs_user ON user_favorite_packs(user_id);

-- ============================================
-- 5. RLS POLICIES
-- ============================================

-- Sticker Packs
ALTER TABLE sticker_packs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active sticker packs" ON sticker_packs;
CREATE POLICY "Anyone can view active sticker packs" ON sticker_packs
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage sticker packs" ON sticker_packs;
CREATE POLICY "Admins can manage sticker packs" ON sticker_packs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Stickers
ALTER TABLE stickers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active stickers" ON stickers;
CREATE POLICY "Anyone can view active stickers" ON stickers
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage stickers" ON stickers;
CREATE POLICY "Admins can manage stickers" ON stickers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- User Recent Stickers
ALTER TABLE user_recent_stickers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own recent stickers" ON user_recent_stickers;
CREATE POLICY "Users can view own recent stickers" ON user_recent_stickers
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recent stickers" ON user_recent_stickers;
CREATE POLICY "Users can insert own recent stickers" ON user_recent_stickers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recent stickers" ON user_recent_stickers;
CREATE POLICY "Users can update own recent stickers" ON user_recent_stickers
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own recent stickers" ON user_recent_stickers;
CREATE POLICY "Users can delete own recent stickers" ON user_recent_stickers
  FOR DELETE USING (auth.uid() = user_id);

-- User Favorite Packs
ALTER TABLE user_favorite_packs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own favorite packs" ON user_favorite_packs;
CREATE POLICY "Users can view own favorite packs" ON user_favorite_packs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own favorite packs" ON user_favorite_packs;
CREATE POLICY "Users can insert own favorite packs" ON user_favorite_packs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own favorite packs" ON user_favorite_packs;
CREATE POLICY "Users can delete own favorite packs" ON user_favorite_packs
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 6. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update sticker count in pack
CREATE OR REPLACE FUNCTION update_sticker_pack_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE sticker_packs
    SET sticker_count = sticker_count + 1,
        updated_at = NOW()
    WHERE id = NEW.pack_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE sticker_packs
    SET sticker_count = GREATEST(sticker_count - 1, 0),
        updated_at = NOW()
    WHERE id = OLD.pack_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for sticker count
DROP TRIGGER IF EXISTS trigger_update_sticker_count ON stickers;
CREATE TRIGGER trigger_update_sticker_count
  AFTER INSERT OR DELETE ON stickers
  FOR EACH ROW
  EXECUTE FUNCTION update_sticker_pack_count();

-- Function to track sticker usage (upsert)
CREATE OR REPLACE FUNCTION track_sticker_usage(
  p_user_id UUID,
  p_sticker_id UUID DEFAULT NULL,
  p_giphy_id TEXT DEFAULT NULL,
  p_giphy_url TEXT DEFAULT NULL,
  p_emoji TEXT DEFAULT NULL,
  p_type TEXT DEFAULT 'sticker'
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Handle sticker type
  IF p_sticker_id IS NOT NULL THEN
    INSERT INTO user_recent_stickers (user_id, sticker_id, type, used_at, usage_count)
    VALUES (p_user_id, p_sticker_id, 'sticker', NOW(), 1)
    ON CONFLICT (user_id, sticker_id) WHERE sticker_id IS NOT NULL
    DO UPDATE SET
      used_at = NOW(),
      usage_count = user_recent_stickers.usage_count + 1;

    -- Increment sticker usage count
    UPDATE stickers SET usage_count = usage_count + 1 WHERE id = p_sticker_id;
  END IF;

  -- Handle GIPHY type
  IF p_giphy_id IS NOT NULL THEN
    INSERT INTO user_recent_stickers (user_id, giphy_id, giphy_url, type, used_at, usage_count)
    VALUES (p_user_id, p_giphy_id, p_giphy_url, 'gif', NOW(), 1)
    ON CONFLICT (user_id, giphy_id) WHERE giphy_id IS NOT NULL
    DO UPDATE SET
      used_at = NOW(),
      usage_count = user_recent_stickers.usage_count + 1,
      giphy_url = COALESCE(p_giphy_url, user_recent_stickers.giphy_url);
  END IF;

  -- Handle emoji type
  IF p_emoji IS NOT NULL THEN
    INSERT INTO user_recent_stickers (user_id, emoji, type, used_at, usage_count)
    VALUES (p_user_id, p_emoji, 'emoji', NOW(), 1)
    ON CONFLICT (user_id, emoji) WHERE emoji IS NOT NULL
    DO UPDATE SET
      used_at = NOW(),
      usage_count = user_recent_stickers.usage_count + 1;
  END IF;

  -- Cleanup: Keep only last 50 recent items per type for this user
  DELETE FROM user_recent_stickers
  WHERE user_id = p_user_id
    AND type = p_type
    AND id NOT IN (
      SELECT id FROM user_recent_stickers
      WHERE user_id = p_user_id AND type = p_type
      ORDER BY used_at DESC
      LIMIT 50
    );

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute
GRANT EXECUTE ON FUNCTION track_sticker_usage TO authenticated;

-- ============================================
-- 7. EXTEND MESSAGES TABLE (if exists)
-- ============================================

DO $$
BEGIN
  -- Add sticker_id column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'sticker_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN sticker_id UUID REFERENCES stickers(id);
  END IF;

  -- Add giphy_id column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'giphy_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN giphy_id TEXT;
  END IF;

  -- Add giphy_url column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'giphy_url'
  ) THEN
    ALTER TABLE messages ADD COLUMN giphy_url TEXT;
  END IF;
END $$;

-- Update message_type constraint (drop old, add new)
DO $$
BEGIN
  -- Try to drop existing constraint
  ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_message_type_check;

  -- Add new constraint with sticker and gif types
  ALTER TABLE messages ADD CONSTRAINT messages_message_type_check
    CHECK (message_type IN ('text', 'file', 'image', 'video', 'audio', 'sticker', 'gif'));
EXCEPTION
  WHEN others THEN
    -- Constraint might not exist or have different name, ignore
    NULL;
END $$;

-- ============================================
-- 8. SAMPLE STICKER PACKS
-- ============================================

INSERT INTO sticker_packs (name, name_vi, description, description_vi, thumbnail_url, category, is_animated, is_featured, display_order)
VALUES
  ('GEM Emotions', 'Cảm xúc GEM', 'Express yourself with GEM characters', 'Thể hiện cảm xúc với nhân vật GEM', 'https://via.placeholder.com/100x100/6A5BFF/FFFFFF?text=GEM', 'trending', true, true, 1),
  ('Cute Animals', 'Động vật dễ thương', 'Adorable animal stickers', 'Sticker động vật đáng yêu', 'https://via.placeholder.com/100x100/FFB959/FFFFFF?text=Animals', 'animals', false, true, 2),
  ('Love & Hearts', 'Tình yêu', 'Share your love', 'Chia sẻ tình yêu', 'https://via.placeholder.com/100x100/FF6B6B/FFFFFF?text=Love', 'love', true, false, 3),
  ('Funny Memes', 'Memes hài hước', 'Popular meme stickers', 'Sticker meme hot', 'https://via.placeholder.com/100x100/3AF7A6/000000?text=Memes', 'memes', false, false, 4),
  ('Holiday Special', 'Ngày lễ', 'Celebrate special occasions', 'Chúc mừng ngày lễ', 'https://via.placeholder.com/100x100/FFD700/000000?text=Holiday', 'holidays', true, false, 5)
ON CONFLICT DO NOTHING;

-- ============================================
-- COMPLETED
-- ============================================
