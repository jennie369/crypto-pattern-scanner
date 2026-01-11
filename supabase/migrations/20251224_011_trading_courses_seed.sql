-- =====================================================
-- GEM MOBILE - TRADING COURSES SEED DATA (V2 - Fixed)
-- 3 Tier Trading Courses (TIER1, TIER2, TIER3)
-- Date: 2024-12-24
-- Fixed: Schema compatibility for quizzes
-- =====================================================

-- ===========================================
-- PREREQUISITE: Run 20251224_courses_add_missing_columns.sql first
-- ===========================================

-- ===========================================
-- COURSE 1: TIER 1 - NEN TANG TRADER CHUYEN NGHIEP
-- Price: 11,000,000 VND
-- 8 Chapters, 30+ Lessons
-- ===========================================

INSERT INTO courses (
  id, title, description, thumbnail_url, price, currency,
  tier_required, is_published, is_featured, category,
  estimated_duration, difficulty_level, instructor_name,
  created_at, updated_at
) VALUES (
  'course-tier1-trading-foundation',
  'NỀN TẢNG TRADER CHUYÊN NGHIỆP',
  'Khóa học nền tảng dành cho người mới bắt đầu trading. Học cách đọc biểu đồ, nhận diện pattern cơ bản, và xây dựng tư duy trader chuyên nghiệp. Bao gồm 8 chương với hơn 30 bài học video và thực hành.',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
  11000000,
  'VND',
  'TIER1',
  true,
  true,
  'Trading Foundation',
  '30 giờ',
  'beginner',
  'GEM Master',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_featured = EXCLUDED.is_featured,
  category = EXCLUDED.category,
  estimated_duration = EXCLUDED.estimated_duration,
  difficulty_level = EXCLUDED.difficulty_level,
  updated_at = NOW();

-- Modules for TIER1 Course
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at) VALUES
('mod-t1-01', 'course-tier1-trading-foundation', 'Chương 1: Giới thiệu Trading', 'Hiểu về thị trường tài chính và crypto', 0, NOW()),
('mod-t1-02', 'course-tier1-trading-foundation', 'Chương 2: Đọc Biểu Đồ Cơ Bản', 'Candlestick, Timeframe, và các loại biểu đồ', 1, NOW()),
('mod-t1-03', 'course-tier1-trading-foundation', 'Chương 3: Pattern Cơ Bản', 'DPD, UPU và các pattern cơ bản', 2, NOW()),
('mod-t1-04', 'course-tier1-trading-foundation', 'Chương 4: Support & Resistance', 'Xác định vùng hỗ trợ và kháng cự', 3, NOW()),
('mod-t1-05', 'course-tier1-trading-foundation', 'Chương 5: Quản Lý Vốn', 'Risk management và position sizing', 4, NOW()),
('mod-t1-06', 'course-tier1-trading-foundation', 'Chương 6: Tâm Lý Trading', 'Kiểm soát cảm xúc và kỷ luật', 5, NOW()),
('mod-t1-07', 'course-tier1-trading-foundation', 'Chương 7: Thực Hành Scanner', 'Sử dụng GEM Scanner hiệu quả', 6, NOW()),
('mod-t1-08', 'course-tier1-trading-foundation', 'Chương 8: Paper Trading', 'Thực hành giao dịch mô phỏng', 7, NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index;

-- Lessons for TIER1 - Chapter 1
INSERT INTO course_lessons (id, module_id, course_id, title, description, type, order_index, duration_minutes, is_preview, created_at) VALUES
('les-t1-01-01', 'mod-t1-01', 'course-tier1-trading-foundation', 'Trading là gì?', 'Khái niệm cơ bản về trading', 'video', 0, 15, true, NOW()),
('les-t1-01-02', 'mod-t1-01', 'course-tier1-trading-foundation', 'Thị trường Crypto', 'Giới thiệu về thị trường tiền mã hóa', 'video', 1, 20, false, NOW()),
('les-t1-01-03', 'mod-t1-01', 'course-tier1-trading-foundation', 'Các sàn giao dịch', 'Binance, OKX, và các sàn uy tín', 'video', 2, 15, false, NOW()),
('les-t1-01-04', 'mod-t1-01', 'course-tier1-trading-foundation', 'Quiz Chương 1', 'Kiểm tra kiến thức chương 1', 'quiz', 3, 10, false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Lessons for TIER1 - Chapter 2
INSERT INTO course_lessons (id, module_id, course_id, title, description, type, order_index, duration_minutes, is_preview, created_at) VALUES
('les-t1-02-01', 'mod-t1-02', 'course-tier1-trading-foundation', 'Candlestick Patterns', 'Hiểu về nến Nhật', 'video', 0, 25, false, NOW()),
('les-t1-02-02', 'mod-t1-02', 'course-tier1-trading-foundation', 'Timeframes', 'Cách chọn khung thời gian phù hợp', 'video', 1, 20, false, NOW()),
('les-t1-02-03', 'mod-t1-02', 'course-tier1-trading-foundation', 'Volume Analysis', 'Phân tích khối lượng giao dịch', 'video', 2, 20, false, NOW()),
('les-t1-02-04', 'mod-t1-02', 'course-tier1-trading-foundation', 'Quiz Chương 2', 'Kiểm tra kiến thức đọc biểu đồ', 'quiz', 3, 10, false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Lessons for TIER1 - Chapter 3
INSERT INTO course_lessons (id, module_id, course_id, title, description, type, order_index, duration_minutes, is_preview, created_at) VALUES
('les-t1-03-01', 'mod-t1-03', 'course-tier1-trading-foundation', 'Pattern DPD', 'Down-Push-Down pattern chi tiết', 'video', 0, 30, false, NOW()),
('les-t1-03-02', 'mod-t1-03', 'course-tier1-trading-foundation', 'Pattern UPU', 'Up-Pull-Up pattern chi tiết', 'video', 1, 30, false, NOW()),
('les-t1-03-03', 'mod-t1-03', 'course-tier1-trading-foundation', 'Head & Shoulders', 'Nhận diện mẫu đầu vai', 'video', 2, 25, false, NOW()),
('les-t1-03-04', 'mod-t1-03', 'course-tier1-trading-foundation', 'Quiz Pattern Cơ Bản', 'Kiểm tra nhận diện pattern', 'quiz', 3, 15, false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Lessons for TIER1 - Chapter 4
INSERT INTO course_lessons (id, module_id, course_id, title, description, type, order_index, duration_minutes, is_preview, created_at) VALUES
('les-t1-04-01', 'mod-t1-04', 'course-tier1-trading-foundation', 'Support Zone', 'Xác định vùng hỗ trợ', 'video', 0, 25, false, NOW()),
('les-t1-04-02', 'mod-t1-04', 'course-tier1-trading-foundation', 'Resistance Zone', 'Xác định vùng kháng cự', 'video', 1, 25, false, NOW()),
('les-t1-04-03', 'mod-t1-04', 'course-tier1-trading-foundation', 'Breakout Trading', 'Giao dịch khi phá vùng', 'video', 2, 20, false, NOW()),
('les-t1-04-04', 'mod-t1-04', 'course-tier1-trading-foundation', 'Quiz S&R', 'Kiểm tra Support & Resistance', 'quiz', 3, 10, false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Lessons for TIER1 - Chapter 5
INSERT INTO course_lessons (id, module_id, course_id, title, description, type, order_index, duration_minutes, is_preview, created_at) VALUES
('les-t1-05-01', 'mod-t1-05', 'course-tier1-trading-foundation', 'Risk Management', 'Nguyên tắc quản lý rủi ro', 'video', 0, 25, false, NOW()),
('les-t1-05-02', 'mod-t1-05', 'course-tier1-trading-foundation', 'Position Sizing', 'Tính toán khối lượng giao dịch', 'video', 1, 20, false, NOW()),
('les-t1-05-03', 'mod-t1-05', 'course-tier1-trading-foundation', 'Stop Loss & Take Profit', 'Đặt điểm dừng lỗ và chốt lời', 'video', 2, 25, false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Lessons for TIER1 - Chapter 6
INSERT INTO course_lessons (id, module_id, course_id, title, description, type, order_index, duration_minutes, is_preview, created_at) VALUES
('les-t1-06-01', 'mod-t1-06', 'course-tier1-trading-foundation', 'Tâm Lý Trader', 'Hiểu về tâm lý khi trading', 'video', 0, 20, false, NOW()),
('les-t1-06-02', 'mod-t1-06', 'course-tier1-trading-foundation', 'Kiểm Soát Cảm Xúc', 'FOMO, FUD và cách xử lý', 'video', 1, 25, false, NOW()),
('les-t1-06-03', 'mod-t1-06', 'course-tier1-trading-foundation', 'Kỷ Luật Trading', 'Xây dựng kỷ luật bền vững', 'video', 2, 20, false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Lessons for TIER1 - Chapter 7
INSERT INTO course_lessons (id, module_id, course_id, title, description, type, order_index, duration_minutes, is_preview, created_at) VALUES
('les-t1-07-01', 'mod-t1-07', 'course-tier1-trading-foundation', 'GEM Scanner Intro', 'Giới thiệu GEM Scanner', 'video', 0, 20, false, NOW()),
('les-t1-07-02', 'mod-t1-07', 'course-tier1-trading-foundation', 'Sử Dụng Bộ Lọc', 'Cách sử dụng các bộ lọc', 'video', 1, 25, false, NOW()),
('les-t1-07-03', 'mod-t1-07', 'course-tier1-trading-foundation', 'Phân Tích Signal', 'Đọc và hiểu tín hiệu', 'video', 2, 30, false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Lessons for TIER1 - Chapter 8
INSERT INTO course_lessons (id, module_id, course_id, title, description, type, order_index, duration_minutes, is_preview, created_at) VALUES
('les-t1-08-01', 'mod-t1-08', 'course-tier1-trading-foundation', 'Paper Trading Intro', 'Giới thiệu giao dịch mô phỏng', 'video', 0, 15, false, NOW()),
('les-t1-08-02', 'mod-t1-08', 'course-tier1-trading-foundation', 'Thực Hành Demo', 'Bài tập thực hành demo', 'video', 1, 30, false, NOW()),
('les-t1-08-03', 'mod-t1-08', 'course-tier1-trading-foundation', 'Phân Tích Kết Quả', 'Review và cải thiện', 'video', 2, 20, false, NOW()),
('les-t1-08-04', 'mod-t1-08', 'course-tier1-trading-foundation', 'Quiz Tổng Kết', 'Kiểm tra cuối khóa', 'quiz', 3, 20, false, NOW())
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- COURSE 2: TIER 2 - TAN SO TRADER THINH VUONG
-- Price: 21,000,000 VND
-- 6 Chapters, 25+ Lessons
-- ===========================================

INSERT INTO courses (
  id, title, description, thumbnail_url, price, currency,
  tier_required, is_published, is_featured, category,
  estimated_duration, difficulty_level, instructor_name,
  created_at, updated_at
) VALUES (
  'course-tier2-trading-advanced',
  'TẦN SỐ TRADER THỊNH VƯỢNG',
  'Khóa học nâng cao dành cho trader đã có nền tảng. Master 15 patterns, multi-timeframe analysis, và tích hợp AI để nâng cao hiệu quả trading. Kết hợp tâm linh và kỹ thuật.',
  'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800',
  21000000,
  'VND',
  'TIER2',
  true,
  true,
  'Advanced Trading',
  '25 giờ',
  'intermediate',
  'GEM Master',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_featured = EXCLUDED.is_featured,
  category = EXCLUDED.category,
  estimated_duration = EXCLUDED.estimated_duration,
  difficulty_level = EXCLUDED.difficulty_level,
  updated_at = NOW();

-- Modules for TIER2 Course
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at) VALUES
('mod-t2-01', 'course-tier2-trading-advanced', 'Chương 1: Pattern Nâng Cao', 'Master 15 patterns chuyên sâu', 0, NOW()),
('mod-t2-02', 'course-tier2-trading-advanced', 'Chương 2: Multi-Timeframe', 'Phân tích đa khung thời gian', 1, NOW()),
('mod-t2-03', 'course-tier2-trading-advanced', 'Chương 3: Volume Profile', 'Phân tích volume chuyên sâu', 2, NOW()),
('mod-t2-04', 'course-tier2-trading-advanced', 'Chương 4: GEM Master AI', 'Tích hợp AI trong trading', 3, NOW()),
('mod-t2-05', 'course-tier2-trading-advanced', 'Chương 5: Tâm Linh & Trading', 'Kết hợp Tarot và I Ching', 4, NOW()),
('mod-t2-06', 'course-tier2-trading-advanced', 'Chương 6: Chiến Lược Tổng Hợp', 'Xây dựng hệ thống trading', 5, NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index;

-- Lessons for TIER2 - Chapter 1
INSERT INTO course_lessons (id, module_id, course_id, title, description, type, order_index, duration_minutes, is_preview, created_at) VALUES
('les-t2-01-01', 'mod-t2-01', 'course-tier2-trading-advanced', 'Double Top & Bottom', 'Nhận diện đỉnh đôi và đáy đôi', 'video', 0, 30, true, NOW()),
('les-t2-01-02', 'mod-t2-01', 'course-tier2-trading-advanced', 'Triangle Patterns', 'Tam giác tăng, giảm, đối xứng', 'video', 1, 35, false, NOW()),
('les-t2-01-03', 'mod-t2-01', 'course-tier2-trading-advanced', 'HFZ & LFZ', 'High/Low Frequency Zones', 'video', 2, 30, false, NOW()),
('les-t2-01-04', 'mod-t2-01', 'course-tier2-trading-advanced', 'Inverse Head & Shoulders', 'Đầu vai ngược', 'video', 3, 25, false, NOW()),
('les-t2-01-05', 'mod-t2-01', 'course-tier2-trading-advanced', 'Quiz Pattern Nâng Cao', 'Kiểm tra 15 patterns', 'quiz', 4, 20, false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Lessons for TIER2 - Chapter 2
INSERT INTO course_lessons (id, module_id, course_id, title, description, type, order_index, duration_minutes, is_preview, created_at) VALUES
('les-t2-02-01', 'mod-t2-02', 'course-tier2-trading-advanced', 'Top-Down Analysis', 'Phân tích từ cao xuống thấp', 'video', 0, 30, false, NOW()),
('les-t2-02-02', 'mod-t2-02', 'course-tier2-trading-advanced', '3 Timeframe Strategy', 'Chiến lược 3 khung thời gian', 'video', 1, 35, false, NOW()),
('les-t2-02-03', 'mod-t2-02', 'course-tier2-trading-advanced', 'Confluence Trading', 'Giao dịch theo sự hội tụ', 'video', 2, 30, false, NOW()),
('les-t2-02-04', 'mod-t2-02', 'course-tier2-trading-advanced', 'Quiz Multi-TF', 'Kiểm tra phân tích đa khung', 'quiz', 3, 15, false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Lessons for TIER2 - Chapter 3
INSERT INTO course_lessons (id, module_id, course_id, title, description, type, order_index, duration_minutes, is_preview, created_at) VALUES
('les-t2-03-01', 'mod-t2-03', 'course-tier2-trading-advanced', 'Volume Profile Basics', 'Cơ bản về Volume Profile', 'video', 0, 30, false, NOW()),
('les-t2-03-02', 'mod-t2-03', 'course-tier2-trading-advanced', 'POC & Value Area', 'Point of Control và Value Area', 'video', 1, 35, false, NOW()),
('les-t2-03-03', 'mod-t2-03', 'course-tier2-trading-advanced', 'Volume Delta', 'Phân tích Volume Delta', 'video', 2, 30, false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Lessons for TIER2 - Chapter 4 (GEM Master AI)
INSERT INTO course_lessons (id, module_id, course_id, title, description, type, order_index, duration_minutes, is_preview, created_at) VALUES
('les-t2-04-01', 'mod-t2-04', 'course-tier2-trading-advanced', 'AI trong Trading', 'Cách AI hỗ trợ quyết định', 'video', 0, 25, false, NOW()),
('les-t2-04-02', 'mod-t2-04', 'course-tier2-trading-advanced', 'GEM Master Features', 'Các tính năng của GEM Master', 'video', 1, 30, false, NOW()),
('les-t2-04-03', 'mod-t2-04', 'course-tier2-trading-advanced', 'Karma System', 'Hệ thống Karma và ứng dụng', 'video', 2, 20, false, NOW()),
('les-t2-04-04', 'mod-t2-04', 'course-tier2-trading-advanced', 'Quiz GEM Master', 'Kiểm tra sử dụng AI', 'quiz', 3, 15, false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Lessons for TIER2 - Chapter 5
INSERT INTO course_lessons (id, module_id, course_id, title, description, type, order_index, duration_minutes, is_preview, created_at) VALUES
('les-t2-05-01', 'mod-t2-05', 'course-tier2-trading-advanced', 'Tarot & Trading', 'Ứng dụng Tarot trong trading', 'video', 0, 25, false, NOW()),
('les-t2-05-02', 'mod-t2-05', 'course-tier2-trading-advanced', 'I Ching Guidance', 'Hướng dẫn từ Kinh Dịch', 'video', 1, 30, false, NOW()),
('les-t2-05-03', 'mod-t2-05', 'course-tier2-trading-advanced', 'Mindset Rituals', 'Các ritual cho mindset mạnh', 'video', 2, 25, false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Lessons for TIER2 - Chapter 6
INSERT INTO course_lessons (id, module_id, course_id, title, description, type, order_index, duration_minutes, is_preview, created_at) VALUES
('les-t2-06-01', 'mod-t2-06', 'course-tier2-trading-advanced', 'Trading System', 'Xây dựng hệ thống cá nhân', 'video', 0, 35, false, NOW()),
('les-t2-06-02', 'mod-t2-06', 'course-tier2-trading-advanced', 'Backtest Strategy', 'Kiểm tra chiến lược', 'video', 1, 30, false, NOW()),
('les-t2-06-03', 'mod-t2-06', 'course-tier2-trading-advanced', 'Quiz Cuối Khóa', 'Kiểm tra tổng hợp', 'quiz', 2, 25, false, NOW())
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- COURSE 3: TIER 3 - DE CHE TRADER BAC THAY
-- Price: 68,000,000 VND
-- 5 Chapters, 20+ Lessons + Mentoring
-- ===========================================

INSERT INTO courses (
  id, title, description, thumbnail_url, price, currency,
  tier_required, is_published, is_featured, category,
  estimated_duration, difficulty_level, instructor_name,
  created_at, updated_at
) VALUES (
  'course-tier3-trading-mastery',
  'ĐẾ CHẾ TRADER BẬC THẦY',
  'Khóa học dành cho trader muốn đạt đến đỉnh cao. Master tất cả 24 patterns, AI signals, Whale tracking, và mentoring 1-1. Bao gồm hỗ trợ cá nhân và cộng đồng VIP.',
  'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
  68000000,
  'VND',
  'TIER3',
  true,
  true,
  'Trading Mastery',
  '40 giờ + Mentoring',
  'advanced',
  'GEM Master',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_featured = EXCLUDED.is_featured,
  category = EXCLUDED.category,
  estimated_duration = EXCLUDED.estimated_duration,
  difficulty_level = EXCLUDED.difficulty_level,
  updated_at = NOW();

-- Modules for TIER3 Course
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at) VALUES
('mod-t3-01', 'course-tier3-trading-mastery', 'Chương 1: 24 Pattern Mastery', 'Làm chủ tất cả 24 patterns', 0, NOW()),
('mod-t3-02', 'course-tier3-trading-mastery', 'Chương 2: AI Signals', 'Sử dụng tín hiệu AI chuyên sâu', 1, NOW()),
('mod-t3-03', 'course-tier3-trading-mastery', 'Chương 3: Whale Tracking', 'Theo dõi cá mập và dòng tiền lớn', 2, NOW()),
('mod-t3-04', 'course-tier3-trading-mastery', 'Chương 4: Portfolio Management', 'Quản lý danh mục chuyên nghiệp', 3, NOW()),
('mod-t3-05', 'course-tier3-trading-mastery', 'Chương 5: VIP Mentoring', 'Hướng dẫn 1-1 và hỗ trợ', 4, NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index;

-- Lessons for TIER3 - Chapter 1
INSERT INTO course_lessons (id, module_id, course_id, title, description, type, order_index, duration_minutes, is_preview, created_at) VALUES
('les-t3-01-01', 'mod-t3-01', 'course-tier3-trading-mastery', 'Flag & Pennant', 'Cờ và cờ đuôi nhỏ', 'video', 0, 35, true, NOW()),
('les-t3-01-02', 'mod-t3-01', 'course-tier3-trading-mastery', 'Wedge Patterns', 'Mẫu hình nêm', 'video', 1, 35, false, NOW()),
('les-t3-01-03', 'mod-t3-01', 'course-tier3-trading-mastery', 'Cup & Handle', 'Cốc và tay cầm', 'video', 2, 30, false, NOW()),
('les-t3-01-04', 'mod-t3-01', 'course-tier3-trading-mastery', 'Candlestick Mastery', 'Engulfing, Doji, Hammer...', 'video', 3, 40, false, NOW()),
('les-t3-01-05', 'mod-t3-01', 'course-tier3-trading-mastery', 'Quiz 24 Patterns', 'Kiểm tra toàn bộ patterns', 'quiz', 4, 30, false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Lessons for TIER3 - Chapter 2 (AI Signals)
INSERT INTO course_lessons (id, module_id, course_id, title, description, type, order_index, duration_minutes, is_preview, created_at) VALUES
('les-t3-02-01', 'mod-t3-02', 'course-tier3-trading-mastery', 'Signal Interpretation', 'Đọc và hiểu tín hiệu AI', 'video', 0, 30, false, NOW()),
('les-t3-02-02', 'mod-t3-02', 'course-tier3-trading-mastery', 'Entry & Exit AI', 'Điểm vào và thoát từ AI', 'video', 1, 35, false, NOW()),
('les-t3-02-03', 'mod-t3-02', 'course-tier3-trading-mastery', 'Risk/Reward AI', 'Tỷ lệ rủi ro/lợi nhuận tối ưu', 'video', 2, 30, false, NOW()),
('les-t3-02-04', 'mod-t3-02', 'course-tier3-trading-mastery', 'Quiz AI Signals', 'Kiểm tra sử dụng AI', 'quiz', 3, 20, false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Lessons for TIER3 - Chapter 3 (Whale Tracking)
INSERT INTO course_lessons (id, module_id, course_id, title, description, type, order_index, duration_minutes, is_preview, created_at) VALUES
('les-t3-03-01', 'mod-t3-03', 'course-tier3-trading-mastery', 'On-chain Analysis', 'Phân tích dữ liệu on-chain', 'video', 0, 40, false, NOW()),
('les-t3-03-02', 'mod-t3-03', 'course-tier3-trading-mastery', 'Whale Alerts', 'Theo dõi cảnh báo cá mập', 'video', 1, 35, false, NOW()),
('les-t3-03-03', 'mod-t3-03', 'course-tier3-trading-mastery', 'Smart Money Concept', 'Hiểu về dòng tiền thông minh', 'video', 2, 45, false, NOW()),
('les-t3-03-04', 'mod-t3-03', 'course-tier3-trading-mastery', 'Quiz Whale Tracking', 'Kiểm tra phân tích whale', 'quiz', 3, 25, false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Lessons for TIER3 - Chapter 4 (Portfolio Management)
INSERT INTO course_lessons (id, module_id, course_id, title, description, type, order_index, duration_minutes, is_preview, created_at) VALUES
('les-t3-04-01', 'mod-t3-04', 'course-tier3-trading-mastery', 'Portfolio Allocation', 'Phân bổ danh mục đầu tư', 'video', 0, 35, false, NOW()),
('les-t3-04-02', 'mod-t3-04', 'course-tier3-trading-mastery', 'Diversification', 'Đa dạng hóa rủi ro', 'video', 1, 30, false, NOW()),
('les-t3-04-03', 'mod-t3-04', 'course-tier3-trading-mastery', 'Rebalancing', 'Tái cân bằng danh mục', 'video', 2, 25, false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Lessons for TIER3 - Chapter 5 (VIP Mentoring)
INSERT INTO course_lessons (id, module_id, course_id, title, description, type, order_index, duration_minutes, is_preview, created_at) VALUES
('les-t3-05-01', 'mod-t3-05', 'course-tier3-trading-mastery', 'Hướng Dẫn Setup', 'Thiết lập môi trường trading', 'article', 0, 30, false, NOW()),
('les-t3-05-02', 'mod-t3-05', 'course-tier3-trading-mastery', 'Trading Plan Template', 'Mẫu kế hoạch giao dịch', 'article', 1, 20, false, NOW()),
('les-t3-05-03', 'mod-t3-05', 'course-tier3-trading-mastery', 'Live Session Schedule', 'Lịch các buổi học trực tiếp', 'article', 2, 10, false, NOW()),
('les-t3-05-04', 'mod-t3-05', 'course-tier3-trading-mastery', 'VIP Community Access', 'Hướng dẫn truy cập cộng đồng', 'article', 3, 15, false, NOW())
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- CREATE QUIZZES FOR KEY LESSONS
-- Using proper schema (UUID, question_text, JSONB options)
-- ===========================================

-- Quiz for TIER1 Chapter 1
INSERT INTO quizzes (lesson_id, course_id, title, description, passing_score, time_limit_minutes, created_at)
SELECT 'les-t1-01-04', 'course-tier1-trading-foundation', 'Quiz: Giới thiệu Trading', 'Kiểm tra kiến thức cơ bản về trading', 70, 15, NOW()
WHERE NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id = 'les-t1-01-04');

-- Quiz for TIER1 Chapter 3
INSERT INTO quizzes (lesson_id, course_id, title, description, passing_score, time_limit_minutes, created_at)
SELECT 'les-t1-03-04', 'course-tier1-trading-foundation', 'Quiz: Pattern Cơ Bản', 'Kiểm tra khả năng nhận diện pattern', 70, 20, NOW()
WHERE NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id = 'les-t1-03-04');

-- Quiz for TIER2 Chapter 1
INSERT INTO quizzes (lesson_id, course_id, title, description, passing_score, time_limit_minutes, created_at)
SELECT 'les-t2-01-05', 'course-tier2-trading-advanced', 'Quiz: 15 Pattern Nâng Cao', 'Kiểm tra master 15 patterns', 75, 25, NOW()
WHERE NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id = 'les-t2-01-05');

-- Quiz for TIER3 Chapter 1
INSERT INTO quizzes (lesson_id, course_id, title, description, passing_score, time_limit_minutes, created_at)
SELECT 'les-t3-01-05', 'course-tier3-trading-mastery', 'Quiz: Master 24 Patterns', 'Kiểm tra toàn bộ 24 patterns', 80, 40, NOW()
WHERE NOT EXISTS (SELECT 1 FROM quizzes WHERE lesson_id = 'les-t3-01-05');

-- ===========================================
-- ADD QUIZ QUESTIONS (Using proper JSONB format)
-- ===========================================

-- Questions for TIER1 Chapter 1 Quiz
DO $$
DECLARE
  v_quiz_id UUID;
BEGIN
  SELECT id INTO v_quiz_id FROM quizzes WHERE lesson_id = 'les-t1-01-04' LIMIT 1;

  IF v_quiz_id IS NOT NULL THEN
    -- Question 1
    INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, order_index, points)
    VALUES (
      v_quiz_id,
      'Trading là gì?',
      'multiple_choice',
      '[
        {"id": "a", "text": "Mua và giữ coin lâu dài", "is_correct": false},
        {"id": "b", "text": "Mua thấp bán cao trong thời gian ngắn", "is_correct": true},
        {"id": "c", "text": "Chỉ bán khi giá giảm", "is_correct": false},
        {"id": "d", "text": "Không bao giờ bán", "is_correct": false}
      ]'::jsonb,
      'Trading là hoạt động mua bán tài sản trong thời gian ngắn để kiếm lời từ chênh lệch giá.',
      0, 10
    ) ON CONFLICT DO NOTHING;

    -- Question 2
    INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, order_index, points)
    VALUES (
      v_quiz_id,
      'Thị trường crypto hoạt động:',
      'multiple_choice',
      '[
        {"id": "a", "text": "Chỉ ngày trong tuần", "is_correct": false},
        {"id": "b", "text": "24/7 không nghỉ", "is_correct": true},
        {"id": "c", "text": "Chỉ giờ hành chính", "is_correct": false},
        {"id": "d", "text": "Chỉ cuối tuần", "is_correct": false}
      ]'::jsonb,
      'Thị trường crypto hoạt động 24 giờ mỗi ngày, 7 ngày mỗi tuần.',
      1, 10
    ) ON CONFLICT DO NOTHING;

    -- Question 3
    INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, order_index, points)
    VALUES (
      v_quiz_id,
      'Binance là gì?',
      'multiple_choice',
      '[
        {"id": "a", "text": "Ví tiền điện tử", "is_correct": false},
        {"id": "b", "text": "Sàn giao dịch crypto", "is_correct": true},
        {"id": "c", "text": "Đồng coin", "is_correct": false},
        {"id": "d", "text": "Phần mềm đồ biểu đồ", "is_correct": false}
      ]'::jsonb,
      'Binance là sàn giao dịch tiền mã hóa lớn nhất thế giới.',
      2, 10
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Questions for TIER1 Chapter 3 Quiz
DO $$
DECLARE
  v_quiz_id UUID;
BEGIN
  SELECT id INTO v_quiz_id FROM quizzes WHERE lesson_id = 'les-t1-03-04' LIMIT 1;

  IF v_quiz_id IS NOT NULL THEN
    INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, order_index, points)
    VALUES (
      v_quiz_id,
      'Pattern DPD là gì?',
      'multiple_choice',
      '[
        {"id": "a", "text": "Down-Push-Down", "is_correct": true},
        {"id": "b", "text": "Double-Pattern-Down", "is_correct": false},
        {"id": "c", "text": "Deep-Pull-Down", "is_correct": false},
        {"id": "d", "text": "Down-Pull-Drop", "is_correct": false}
      ]'::jsonb,
      'DPD là Down-Push-Down, một pattern báo hiệu xu hướng giảm.',
      0, 10
    ) ON CONFLICT DO NOTHING;

    INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, order_index, points)
    VALUES (
      v_quiz_id,
      'Pattern UPU thường xuất hiện khi:',
      'multiple_choice',
      '[
        {"id": "a", "text": "Xu hướng giảm", "is_correct": false},
        {"id": "b", "text": "Xu hướng tăng", "is_correct": true},
        {"id": "c", "text": "Thị trường đi ngang", "is_correct": false},
        {"id": "d", "text": "Bất kỳ lúc nào", "is_correct": false}
      ]'::jsonb,
      'UPU (Up-Pull-Up) là pattern báo hiệu tiếp tục xu hướng tăng.',
      1, 10
    ) ON CONFLICT DO NOTHING;

    INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, order_index, points)
    VALUES (
      v_quiz_id,
      'Head and Shoulders là pattern:',
      'multiple_choice',
      '[
        {"id": "a", "text": "Tiếp tục xu hướng", "is_correct": false},
        {"id": "b", "text": "Đảo chiều xu hướng", "is_correct": true},
        {"id": "c", "text": "Tích lũy", "is_correct": false},
        {"id": "d", "text": "Không xác định", "is_correct": false}
      ]'::jsonb,
      'Head and Shoulders là pattern đảo chiều, thường báo hiệu sự thay đổi xu hướng.',
      2, 10
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Questions for TIER2 Quiz
DO $$
DECLARE
  v_quiz_id UUID;
BEGIN
  SELECT id INTO v_quiz_id FROM quizzes WHERE lesson_id = 'les-t2-01-05' LIMIT 1;

  IF v_quiz_id IS NOT NULL THEN
    INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, order_index, points)
    VALUES (
      v_quiz_id,
      'Symmetric Triangle cho thấy:',
      'multiple_choice',
      '[
        {"id": "a", "text": "Giá sẽ tăng", "is_correct": false},
        {"id": "b", "text": "Giá sẽ giảm", "is_correct": false},
        {"id": "c", "text": "Tích lũy trước breakout", "is_correct": true},
        {"id": "d", "text": "Xu hướng kết thúc", "is_correct": false}
      ]'::jsonb,
      'Tam giác đối xứng là pattern tích lũy, giá có thể breakout theo cả 2 hướng.',
      0, 10
    ) ON CONFLICT DO NOTHING;

    INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, order_index, points)
    VALUES (
      v_quiz_id,
      'HFZ (High Frequency Zone) là:',
      'multiple_choice',
      '[
        {"id": "a", "text": "Vùng giá cao nhất", "is_correct": false},
        {"id": "b", "text": "Vùng có nhiều giao dịch", "is_correct": true},
        {"id": "c", "text": "Vùng hỗ trợ", "is_correct": false},
        {"id": "d", "text": "Vùng kháng cự", "is_correct": false}
      ]'::jsonb,
      'HFZ là vùng có tần suất giao dịch cao, thường là vùng quan trọng.',
      1, 10
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Questions for TIER3 Quiz
DO $$
DECLARE
  v_quiz_id UUID;
BEGIN
  SELECT id INTO v_quiz_id FROM quizzes WHERE lesson_id = 'les-t3-01-05' LIMIT 1;

  IF v_quiz_id IS NOT NULL THEN
    INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, order_index, points)
    VALUES (
      v_quiz_id,
      'Cup and Handle là pattern:',
      'multiple_choice',
      '[
        {"id": "a", "text": "Đảo chiều giảm", "is_correct": false},
        {"id": "b", "text": "Tiếp tục tăng", "is_correct": true},
        {"id": "c", "text": "Tích lũy", "is_correct": false},
        {"id": "d", "text": "Phân phối", "is_correct": false}
      ]'::jsonb,
      'Cup and Handle là pattern bullish continuation, báo hiệu tiếp tục xu hướng tăng.',
      0, 10
    ) ON CONFLICT DO NOTHING;

    INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, order_index, points)
    VALUES (
      v_quiz_id,
      'Bullish Engulfing xuất hiện khi:',
      'multiple_choice',
      '[
        {"id": "a", "text": "Cuối xu hướng tăng", "is_correct": false},
        {"id": "b", "text": "Cuối xu hướng giảm", "is_correct": true},
        {"id": "c", "text": "Giữa xu hướng", "is_correct": false},
        {"id": "d", "text": "Bất kỳ đâu", "is_correct": false}
      ]'::jsonb,
      'Bullish Engulfing là pattern đảo chiều, thường xuất hiện ở cuối xu hướng giảm.',
      1, 10
    ) ON CONFLICT DO NOTHING;

    INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, order_index, points)
    VALUES (
      v_quiz_id,
      'Morning Star bao gồm mấy nến?',
      'multiple_choice',
      '[
        {"id": "a", "text": "1 nến", "is_correct": false},
        {"id": "b", "text": "2 nến", "is_correct": false},
        {"id": "c", "text": "3 nến", "is_correct": true},
        {"id": "d", "text": "4 nến", "is_correct": false}
      ]'::jsonb,
      'Morning Star là pattern 3 nến: nến giảm, nến thân nhỏ, nến tăng.',
      2, 10
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ===========================================
-- SUMMARY LOG
-- ===========================================
DO $$
BEGIN
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Trading Courses Seed Data V2 Created:';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '- TIER1: NỀN TẢNG TRADER CHUYÊN NGHIỆP (11M VND, 8 modules)';
  RAISE NOTICE '- TIER2: TẦN SỐ TRADER THỊNH VƯỢNG (21M VND, 6 modules)';
  RAISE NOTICE '- TIER3: ĐẾ CHẾ TRADER BẬC THẦY (68M VND, 5 modules)';
  RAISE NOTICE 'Total: 19 modules, 50+ lessons, 4 quizzes with questions';
  RAISE NOTICE '===========================================';
END $$;
