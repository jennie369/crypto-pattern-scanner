-- =============================================
-- TAROT SPREADS TABLE
-- Stores spread definitions and configurations
-- =============================================

-- 1. Create tarot_spreads table
CREATE TABLE IF NOT EXISTS tarot_spreads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spread_id TEXT UNIQUE NOT NULL,
  name_vi TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_vi TEXT,
  description_en TEXT,
  cards INT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('general', 'love', 'career', 'trading', 'advanced')),
  tier_required TEXT DEFAULT 'FREE' CHECK (tier_required IN ('FREE', 'TIER1', 'TIER2', 'TIER3', 'PRO', 'PREMIUM', 'VIP', 'ADMIN')),
  positions JSONB NOT NULL DEFAULT '[]',
  layout_type TEXT DEFAULT 'horizontal' CHECK (layout_type IN ('horizontal', 'vertical', 'cross', 'custom')),
  estimated_time TEXT,
  thumbnail_key TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_tarot_spreads_category ON tarot_spreads(category);
CREATE INDEX IF NOT EXISTS idx_tarot_spreads_tier ON tarot_spreads(tier_required);
CREATE INDEX IF NOT EXISTS idx_tarot_spreads_active ON tarot_spreads(is_active);

-- 3. Enable RLS
ALTER TABLE tarot_spreads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (for idempotent migration)
DROP POLICY IF EXISTS "All users can view active spreads" ON tarot_spreads;
DROP POLICY IF EXISTS "Admins can manage spreads" ON tarot_spreads;

-- 4. RLS Policies (read-only for all authenticated users)
CREATE POLICY "All users can view active spreads" ON tarot_spreads
  FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage spreads" ON tarot_spreads
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (is_admin = TRUE OR role = 'admin')
    )
  );

-- 5. Insert default spreads
INSERT INTO tarot_spreads (spread_id, name_vi, name_en, cards, category, tier_required, positions, layout_type, estimated_time, display_order) VALUES
-- GENERAL SPREADS
('single-card', 'Một Lá', 'Single Card', 1, 'general', 'FREE',
  '[{"index": 0, "name_vi": "Thông điệp hôm nay", "name_en": "Today''s Message", "description_vi": "Năng lượng và hướng dẫn cho ngày hôm nay"}]'::jsonb,
  'horizontal', '2-3 phút', 1),

('past-present-future', 'Quá Khứ - Hiện Tại - Tương Lai', 'Past Present Future', 3, 'general', 'FREE',
  '[{"index": 0, "name_vi": "Quá khứ", "name_en": "Past", "description_vi": "Những gì đã xảy ra và ảnh hưởng đến hiện tại"},
    {"index": 1, "name_vi": "Hiện tại", "name_en": "Present", "description_vi": "Tình huống và năng lượng hiện tại"},
    {"index": 2, "name_vi": "Tương lai", "name_en": "Future", "description_vi": "Hướng đi và kết quả có thể xảy ra"}]'::jsonb,
  'horizontal', '5-7 phút', 2),

('mind-body-spirit', 'Tâm - Thân - Linh', 'Mind Body Spirit', 3, 'general', 'FREE',
  '[{"index": 0, "name_vi": "Tâm trí", "name_en": "Mind", "description_vi": "Trạng thái tinh thần và suy nghĩ"},
    {"index": 1, "name_vi": "Thể xác", "name_en": "Body", "description_vi": "Sức khỏe và năng lượng vật lý"},
    {"index": 2, "name_vi": "Tâm linh", "name_en": "Spirit", "description_vi": "Kết nối tâm linh và trực giác"}]'::jsonb,
  'horizontal', '5-7 phút', 3),

('decision-making', 'Ra Quyết Định', 'Decision Making', 3, 'general', 'FREE',
  '[{"index": 0, "name_vi": "Lựa chọn A", "name_en": "Option A", "description_vi": "Năng lượng và kết quả của lựa chọn đầu tiên"},
    {"index": 1, "name_vi": "Lựa chọn B", "name_en": "Option B", "description_vi": "Năng lượng và kết quả của lựa chọn thứ hai"},
    {"index": 2, "name_vi": "Lời khuyên", "name_en": "Advice", "description_vi": "Hướng dẫn từ vũ trụ"}]'::jsonb,
  'horizontal', '5-7 phút', 4),

-- CELTIC CROSS (Advanced - 10 cards)
('celtic-cross', 'Celtic Cross', 'Celtic Cross', 10, 'advanced', 'TIER1',
  '[{"index": 0, "name_vi": "Hiện tại/Trái tim", "name_en": "Present/Heart", "description_vi": "Tình huống hiện tại và bản chất vấn đề"},
    {"index": 1, "name_vi": "Thách thức", "name_en": "Challenge", "description_vi": "Trở ngại hoặc năng lượng đối lập (đặt chéo)"},
    {"index": 2, "name_vi": "Nền tảng", "name_en": "Foundation", "description_vi": "Nguồn gốc, quá khứ xa"},
    {"index": 3, "name_vi": "Quá khứ gần", "name_en": "Recent Past", "description_vi": "Những sự kiện gần đây ảnh hưởng"},
    {"index": 4, "name_vi": "Kết quả tốt nhất", "name_en": "Best Outcome", "description_vi": "Khả năng tốt nhất có thể đạt được"},
    {"index": 5, "name_vi": "Tương lai gần", "name_en": "Near Future", "description_vi": "Những gì sẽ xảy ra trong 2-3 tháng"},
    {"index": 6, "name_vi": "Bản thân", "name_en": "Self", "description_vi": "Thái độ và cách bạn đang tiếp cận"},
    {"index": 7, "name_vi": "Ảnh hưởng bên ngoài", "name_en": "External", "description_vi": "Môi trường và người xung quanh"},
    {"index": 8, "name_vi": "Hy vọng & Sợ hãi", "name_en": "Hopes & Fears", "description_vi": "Chìa khóa - điều bạn mong muốn và lo ngại"},
    {"index": 9, "name_vi": "Kết quả cuối cùng", "name_en": "Final Outcome", "description_vi": "Kết quả nếu đi theo hướng hiện tại"}]'::jsonb,
  'cross', '15-20 phút', 10),

-- LOVE SPREADS
('love-relationship', 'Mối Quan Hệ Tình Yêu', 'Love Relationship', 6, 'love', 'TIER1',
  '[{"index": 0, "name_vi": "Bạn", "name_en": "You", "description_vi": "Năng lượng và cảm xúc của bạn"},
    {"index": 1, "name_vi": "Đối phương", "name_en": "Partner", "description_vi": "Năng lượng và cảm xúc của đối phương"},
    {"index": 2, "name_vi": "Kết nối", "name_en": "Connection", "description_vi": "Năng lượng chung giữa hai người"},
    {"index": 3, "name_vi": "Thách thức", "name_en": "Challenge", "description_vi": "Trở ngại cần vượt qua"},
    {"index": 4, "name_vi": "Điểm mạnh", "name_en": "Strength", "description_vi": "Điều làm mối quan hệ vững chắc"},
    {"index": 5, "name_vi": "Hướng đi", "name_en": "Direction", "description_vi": "Tương lai của mối quan hệ"}]'::jsonb,
  'custom', '10-12 phút', 20),

('broken-heart', 'Chữa Lành Trái Tim', 'Broken Heart Healing', 5, 'love', 'TIER1',
  '[{"index": 0, "name_vi": "Nỗi đau", "name_en": "Pain", "description_vi": "Nguồn gốc nỗi đau hiện tại"},
    {"index": 1, "name_vi": "Bài học", "name_en": "Lesson", "description_vi": "Điều cần học từ trải nghiệm này"},
    {"index": 2, "name_vi": "Giải thoát", "name_en": "Release", "description_vi": "Điều cần buông bỏ"},
    {"index": 3, "name_vi": "Chữa lành", "name_en": "Healing", "description_vi": "Cách chữa lành bản thân"},
    {"index": 4, "name_vi": "Hy vọng", "name_en": "Hope", "description_vi": "Tương lai tươi sáng phía trước"}]'::jsonb,
  'horizontal', '8-10 phút', 21),

-- CAREER SPREADS
('career-path', 'Con Đường Sự Nghiệp', 'Career Path', 5, 'career', 'TIER1',
  '[{"index": 0, "name_vi": "Vị trí hiện tại", "name_en": "Current Position", "description_vi": "Tình trạng sự nghiệp hiện tại"},
    {"index": 1, "name_vi": "Mục tiêu", "name_en": "Goals", "description_vi": "Điều bạn đang hướng tới"},
    {"index": 2, "name_vi": "Trở ngại", "name_en": "Obstacles", "description_vi": "Thách thức trên con đường"},
    {"index": 3, "name_vi": "Cơ hội", "name_en": "Opportunities", "description_vi": "Cơ hội đang mở ra"},
    {"index": 4, "name_vi": "Kết quả", "name_en": "Outcome", "description_vi": "Kết quả nếu theo đuổi"}]'::jsonb,
  'horizontal', '8-10 phút', 30),

-- TRADING SPREADS (UNIQUE TO GEMRAL!)
('should-i-buy', 'Nên Mua Không?', 'Should I Buy?', 3, 'trading', 'TIER1',
  '[{"index": 0, "name_vi": "Năng lượng thị trường", "name_en": "Market Energy", "description_vi": "Sentiment và xu hướng thị trường hiện tại"},
    {"index": 1, "name_vi": "Quyết định", "name_en": "Decision", "description_vi": "Entry / Exit / Hold - Hướng dẫn hành động"},
    {"index": 2, "name_vi": "Kết quả", "name_en": "Outcome", "description_vi": "Kết quả tiềm năng của quyết định"}]'::jsonb,
  'horizontal', '5-7 phút', 40),

('market-outlook', 'Triển Vọng Thị Trường', 'Market Outlook', 5, 'trading', 'TIER1',
  '[{"index": 0, "name_vi": "Tình trạng hiện tại", "name_en": "Current State", "description_vi": "Năng lượng thị trường ngay bây giờ"},
    {"index": 1, "name_vi": "Ảnh hưởng ẩn", "name_en": "Hidden Influences", "description_vi": "Các yếu tố chưa được nhận ra"},
    {"index": 2, "name_vi": "Rủi ro", "name_en": "Risks", "description_vi": "Nguy cơ cần cảnh giác"},
    {"index": 3, "name_vi": "Cơ hội", "name_en": "Opportunities", "description_vi": "Cơ hội có thể nắm bắt"},
    {"index": 4, "name_vi": "Dự báo tuần", "name_en": "Weekly Forecast", "description_vi": "Xu hướng tuần tới"}]'::jsonb,
  'horizontal', '10-12 phút', 41),

('portfolio-balance', 'Cân Bằng Danh Mục', 'Portfolio Balance', 5, 'trading', 'TIER1',
  '[{"index": 0, "name_vi": "Năng lượng danh mục", "name_en": "Portfolio Energy", "description_vi": "Tình trạng tổng thể portfolio"},
    {"index": 1, "name_vi": "Quá tập trung", "name_en": "Overexposed", "description_vi": "Vùng cần giảm bớt"},
    {"index": 2, "name_vi": "Thiếu hụt", "name_en": "Underexposed", "description_vi": "Vùng cần bổ sung"},
    {"index": 3, "name_vi": "Yếu tố rủi ro", "name_en": "Risk Factor", "description_vi": "Rủi ro cần quản lý"},
    {"index": 4, "name_vi": "Lời khuyên", "name_en": "Advice", "description_vi": "Hướng dẫn tái cân bằng"}]'::jsonb,
  'horizontal', '10-12 phút', 42),

('trading-strategy', 'Chiến Lược Giao Dịch', 'Trading Strategy', 10, 'trading', 'TIER2',
  '[{"index": 0, "name_vi": "Tâm lý hiện tại", "name_en": "Current Mindset", "description_vi": "Trạng thái tâm lý của bạn"},
    {"index": 1, "name_vi": "Thách thức nội tâm", "name_en": "Inner Challenge", "description_vi": "Trở ngại tâm lý cần vượt qua"},
    {"index": 2, "name_vi": "Thị trường BTC", "name_en": "BTC Market", "description_vi": "Năng lượng Bitcoin"},
    {"index": 3, "name_vi": "Altcoins", "name_en": "Altcoins", "description_vi": "Năng lượng altcoin market"},
    {"index": 4, "name_vi": "Điểm vào lệnh", "name_en": "Entry Point", "description_vi": "Thời điểm tốt để vào"},
    {"index": 5, "name_vi": "Stop Loss", "name_en": "Stop Loss", "description_vi": "Mức bảo vệ tài sản"},
    {"index": 6, "name_vi": "Take Profit", "name_en": "Take Profit", "description_vi": "Mục tiêu chốt lời"},
    {"index": 7, "name_vi": "Timeframe", "name_en": "Timeframe", "description_vi": "Khung thời gian phù hợp"},
    {"index": 8, "name_vi": "Cảnh báo", "name_en": "Warning", "description_vi": "Điều cần cẩn thận"},
    {"index": 9, "name_vi": "Kết quả tổng thể", "name_en": "Overall Outcome", "description_vi": "Kết quả của chiến lược"}]'::jsonb,
  'cross', '15-20 phút', 43)

ON CONFLICT (spread_id) DO NOTHING;

-- 6. Updated_at trigger
CREATE OR REPLACE FUNCTION update_tarot_spreads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tarot_spreads_updated_at ON tarot_spreads;
CREATE TRIGGER trg_tarot_spreads_updated_at
  BEFORE UPDATE ON tarot_spreads
  FOR EACH ROW
  EXECUTE FUNCTION update_tarot_spreads_updated_at();
