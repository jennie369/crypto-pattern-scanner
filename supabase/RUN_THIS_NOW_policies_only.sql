-- ============================================
-- CHỈ FIX POLICIES - Bỏ qua tạo bảng và constraints
-- ============================================

-- 1. BẬT RLS
ALTER TABLE feed_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seed_impressions ENABLE ROW LEVEL SECURITY;

-- 2. XÓA VÀ TẠO LẠI POLICIES CHO FEED_IMPRESSIONS
DROP POLICY IF EXISTS "Users can view own impressions" ON feed_impressions;
DROP POLICY IF EXISTS "Users can create own impressions" ON feed_impressions;
DROP POLICY IF EXISTS "Users can update own impressions" ON feed_impressions;
DROP POLICY IF EXISTS "Users can delete own impressions" ON feed_impressions;

CREATE POLICY "Users can view own impressions" ON feed_impressions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own impressions" ON feed_impressions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own impressions" ON feed_impressions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own impressions" ON feed_impressions FOR DELETE USING (auth.uid() = user_id);

-- 3. XÓA VÀ TẠO LẠI POLICIES CHO SEED_IMPRESSIONS
DROP POLICY IF EXISTS "Users can view own seed impressions" ON seed_impressions;
DROP POLICY IF EXISTS "Users can create own seed impressions" ON seed_impressions;
DROP POLICY IF EXISTS "Users can update own seed impressions" ON seed_impressions;
DROP POLICY IF EXISTS "Users can delete own seed impressions" ON seed_impressions;

CREATE POLICY "Users can view own seed impressions" ON seed_impressions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own seed impressions" ON seed_impressions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own seed impressions" ON seed_impressions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own seed impressions" ON seed_impressions FOR DELETE USING (auth.uid() = user_id);

-- 4. CẤP QUYỀN
GRANT SELECT, INSERT, UPDATE, DELETE ON feed_impressions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON seed_impressions TO authenticated;

-- 5. KIỂM TRA SỐ LƯỢNG RECORDS HIỆN TẠI
SELECT 'feed_impressions' as table_name, count(*) as record_count FROM feed_impressions
UNION ALL
SELECT 'seed_impressions' as table_name, count(*) as record_count FROM seed_impressions;
