-- Add Crypto Goal Scenarios for Vision Board
-- Created: 2025-12-18
-- Adds 10 crypto/trading related scenarios with affirmations and action plans

-- ==================== CRYPTO (Trading & Đầu tư Crypto) - 10 scenarios ====================

INSERT INTO goal_scenarios (life_area, title, description, icon, affirmations, action_steps, difficulty, duration_days, sort_order) VALUES

('crypto', 'Học phân tích kỹ thuật', 'Master technical analysis để trading hiệu quả', 'chart-bar',
'["Tôi đọc chart như đọc sách", "Patterns trên chart nói chuyện với tôi", "Mỗi ngày tôi phân tích tốt hơn", "Technical analysis là skill tự nhiên của tôi"]'::jsonb,
'["Học các patterns cơ bản: Head & Shoulders, Double Top/Bottom", "Hiểu RSI, MACD, Bollinger Bands", "Paper trade 20 lệnh trước khi real", "Backtest chiến lược trên data lịch sử", "Tham gia cộng đồng trader để học hỏi"]'::jsonb,
'medium', 90, 1),

('crypto', 'Quản lý rủi ro', 'Xây dựng hệ thống risk management chuyên nghiệp', 'shield',
'["Tôi bảo vệ vốn như bảo vệ mạng sống", "Risk management là bí mật thành công của tôi", "Tôi không bao giờ all-in một trade", "Stoploss là người bạn thân của tôi"]'::jsonb,
'["Không bao giờ risk quá 2% vốn/trade", "Luôn đặt stoploss trước khi vào lệnh", "Tính R:R trước mỗi trade (tối thiểu 1:2)", "Đa dạng hóa portfolio (không quá 20%/coin)", "Review PnL hàng tuần và điều chỉnh"]'::jsonb,
'hard', 60, 2),

('crypto', 'Kiểm soát FOMO/FUD', 'Làm chủ cảm xúc khi trading', 'brain',
'["Tôi trading với tâm lý bình tĩnh", "FOMO không kiểm soát được tôi", "Tôi đợi setup hoàn hảo mới vào lệnh", "Cảm xúc không ảnh hưởng quyết định của tôi"]'::jsonb,
'["Không check chart quá 3 lần/ngày", "Viết trading journal mỗi ngày", "Thiền 5 phút trước khi trading", "Có checklist vào lệnh và tuân thủ", "Nghỉ ngơi sau chuỗi thua liên tiếp"]'::jsonb,
'hard', 60, 3),

('crypto', 'Xây dựng portfolio dài hạn', 'Đầu tư crypto theo chiến lược DCA', 'wallet',
'["Portfolio của tôi tăng trưởng đều đặn", "Tôi đầu tư theo kế hoạch không theo cảm xúc", "DCA là chiến lược chiến thắng của tôi", "Thời gian là bạn của nhà đầu tư"]'::jsonb,
'["Chọn 5-10 coin tiềm năng để DCA", "Mua định kỳ mỗi tuần/tháng cố định", "Không bán khi thị trường đỏ", "Rebalance portfolio mỗi quý", "Stake/farm để tăng passive income"]'::jsonb,
'easy', 180, 4),

('crypto', 'Paper trade 100 lệnh', 'Luyện tập trước khi dùng tiền thật', 'file-text',
'["Paper trade giúp tôi chuẩn bị tốt", "Mỗi lệnh paper là bài học quý giá", "Tôi không vội vàng với tiền thật", "Thực hành tạo nên master trader"]'::jsonb,
'["Đăng ký tài khoản paper trade", "Trade mỗi ngày ít nhất 2 lệnh", "Ghi chép lý do vào/ra mỗi lệnh", "Review win rate và RR sau 50 lệnh", "Chỉ chuyển real khi win rate > 50%"]'::jsonb,
'easy', 60, 5),

('crypto', 'Đạt lợi nhuận 50% trong 6 tháng', 'Mục tiêu trading rõ ràng và thực tế', 'target',
'["Tôi đạt mục tiêu trading từng bước", "50% trong 6 tháng là khả thi", "Tôi tập trung vào process không chỉ profit", "Mỗi trade nhỏ đóng góp cho mục tiêu lớn"]'::jsonb,
'["Đặt mục tiêu 8-10%/tháng", "Trade theo trend không ngược trend", "Chốt lời từng phần khi đạt target", "Không overtrade - chất lượng hơn số lượng", "Track PnL hàng ngày trên spreadsheet"]'::jsonb,
'hard', 180, 6),

('crypto', 'Hiểu On-chain Data', 'Phân tích blockchain để đọc smart money', 'database',
'["On-chain data cho tôi lợi thế", "Tôi đọc được hành vi của whale", "Data không nói dối", "Smart money moves cho tôi signal"]'::jsonb,
'["Học sử dụng Glassnode, Nansen, Dune", "Theo dõi whale wallet movements", "Hiểu metrics: NVT, SOPR, MVRV", "Phân tích exchange inflow/outflow", "Kết hợp on-chain với technical analysis"]'::jsonb,
'hard', 90, 7),

('crypto', 'Tham gia cộng đồng trader', 'Networking và học hỏi từ trader khác', 'users',
'["Cộng đồng giúp tôi phát triển nhanh", "Tôi học được từ cả thắng và thua của người khác", "Sharing là cách tốt nhất để học", "Network là net worth trong trading"]'::jsonb,
'["Join 2-3 group trading chất lượng", "Tham gia discussion hàng ngày", "Chia sẻ analysis và nhận feedback", "Tìm mentor hoặc trading buddy", "Tham dự webinar/workshop về trading"]'::jsonb,
'easy', 30, 8),

('crypto', 'Xây dựng trading system', 'Tạo hệ thống trading có rules rõ ràng', 'settings',
'["Tôi có trading system profitable", "Rules của tôi rõ ràng và nhất quán", "Tôi tin tưởng vào system của mình", "System làm việc cho tôi 24/7"]'::jsonb,
'["Định nghĩa entry/exit rules cụ thể", "Viết checklist trước mỗi trade", "Backtest system trên 100+ trades", "Có risk management rules trong system", "Review và optimize system hàng tháng"]'::jsonb,
'hard', 90, 9),

('crypto', 'Passive income từ crypto', 'Thu nhập thụ động từ staking, farming', 'dollar-sign',
'["Crypto của tôi sinh lời 24/7", "Passive income từ crypto tăng mỗi ngày", "Tôi kiếm tiền cả khi ngủ", "DeFi mở ra cơ hội mới cho tôi"]'::jsonb,
'["Tìm hiểu về staking, lending, LP", "Stake coin chính trên CEX uy tín", "Học về DeFi protocols an toàn", "Bắt đầu với số vốn nhỏ để test", "Đa dạng hóa passive income sources"]'::jsonb,
'medium', 60, 10);

-- Log migration
DO $$
BEGIN
  RAISE NOTICE 'Added 10 crypto goal scenarios successfully';
END $$;
