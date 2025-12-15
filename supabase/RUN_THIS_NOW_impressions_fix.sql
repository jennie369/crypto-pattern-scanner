-- ============================================
-- CHẠY NGAY FILE NÀY TRONG SUPABASE SQL EDITOR
-- Fix feed_impressions và seed_impressions tables
-- ============================================

-- 1. TẠO BẢNG FEED_IMPRESSIONS NẾU CHƯA CÓ
CREATE TABLE IF NOT EXISTS feed_impressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  position INTEGER,
  session_id TEXT,
  shown_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TẠO BẢNG SEED_IMPRESSIONS NẾU CHƯA CÓ
CREATE TABLE IF NOT EXISTS seed_impressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES seed_posts(id) ON DELETE CASCADE,
  position INTEGER,
  session_id TEXT,
  shown_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. THÊM UNIQUE CONSTRAINTS (bỏ qua nếu đã có)
DO $$
BEGIN
  ALTER TABLE feed_impressions ADD CONSTRAINT feed_impressions_user_post_unique UNIQUE (user_id, post_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE seed_impressions ADD CONSTRAINT seed_impressions_user_post_unique UNIQUE (user_id, post_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. BẬT RLS
ALTER TABLE feed_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seed_impressions ENABLE ROW LEVEL SECURITY;

-- 5. XÓA VÀ TẠO LẠI TẤT CẢ POLICIES CHO FEED_IMPRESSIONS
DROP POLICY IF EXISTS "Users can view own impressions" ON feed_impressions;
DROP POLICY IF EXISTS "Users can create own impressions" ON feed_impressions;
DROP POLICY IF EXISTS "Users can update own impressions" ON feed_impressions;
DROP POLICY IF EXISTS "Users can delete own impressions" ON feed_impressions;

CREATE POLICY "Users can view own impressions" ON feed_impressions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own impressions" ON feed_impressions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own impressions" ON feed_impressions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own impressions" ON feed_impressions FOR DELETE USING (auth.uid() = user_id);

-- 6. XÓA VÀ TẠO LẠI TẤT CẢ POLICIES CHO SEED_IMPRESSIONS
DROP POLICY IF EXISTS "Users can view own seed impressions" ON seed_impressions;
DROP POLICY IF EXISTS "Users can create own seed impressions" ON seed_impressions;
DROP POLICY IF EXISTS "Users can update own seed impressions" ON seed_impressions;
DROP POLICY IF EXISTS "Users can delete own seed impressions" ON seed_impressions;

CREATE POLICY "Users can view own seed impressions" ON seed_impressions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own seed impressions" ON seed_impressions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own seed impressions" ON seed_impressions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own seed impressions" ON seed_impressions FOR DELETE USING (auth.uid() = user_id);

-- 7. CẤP QUYỀN
GRANT SELECT, INSERT, UPDATE, DELETE ON feed_impressions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON seed_impressions TO authenticated;

-- 8. TẠO INDEX
CREATE INDEX IF NOT EXISTS idx_feed_impressions_user ON feed_impressions(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_impressions_post ON feed_impressions(post_id);
CREATE INDEX IF NOT EXISTS idx_seed_impressions_user ON seed_impressions(user_id);
CREATE INDEX IF NOT EXISTS idx_seed_impressions_post ON seed_impressions(post_id);

-- 9. KIỂM TRA KẾT QUẢ
SELECT 'feed_impressions' as table_name, count(*) as record_count FROM feed_impressions
UNION ALL
SELECT 'seed_impressions' as table_name, count(*) as record_count FROM seed_impressions;

-- THÔNG BÁO THÀNH CÔNG
DO $$ BEGIN RAISE NOTICE '✅ Impressions tables configured successfully!'; END $$;
