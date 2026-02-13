-- PHASE 2A: FAQ Seed Data
-- 29 FAQs across 4 categories: general, trading, courses, gemral, account

INSERT INTO chatbot_faq (question, answer, category, keywords, priority) VALUES

-- ========================================
-- GENERAL FAQs (Original 12)
-- ========================================

('Gemral là gì?',
'Gemral là trợ lý AI thông minh giúp bạn:
- Tư vấn về đá quý và phong thủy
- Hỗ trợ trading crypto với Pattern Scanner
- Trả lời câu hỏi về khóa học
- Đưa ra lời khuyên cá nhân hóa

Hãy hỏi bất cứ điều gì bạn muốn biết!',
'general', ARRAY['gemral', 'là gì', 'giới thiệu', 'about'], 10),

('Làm sao để sử dụng Scanner?',
'Để sử dụng Pattern Scanner:
1. Vào tab Scanner trên app
2. Chọn coin và timeframe
3. Nhấn Scan để phát hiện patterns
4. Xem kết quả với Entry/SL/TP

Scanner sử dụng Frequency Trading Method để phát hiện DPD, DPU, UPU, UPD patterns.',
'general', ARRAY['scanner', 'sử dụng', 'cách', 'hướng dẫn'], 9),

('Giá cả các gói dịch vụ?',
'Gemral có các gói sau:
- FREE: Cơ bản, 5 tin nhắn/ngày
- TIER 1: 199k/tháng - 15 tin nhắn/ngày
- TIER 2: 499k/tháng - 50 tin nhắn/ngày
- TIER 3: 999k/tháng - Unlimited

Nâng cấp tại: Tài khoản > Nâng cấp',
'general', ARRAY['giá', 'gói', 'tier', 'đăng ký', 'subscription'], 8),

('Thanh toán bằng cách nào?',
'Gemral hỗ trợ các phương thức:
- Chuyển khoản ngân hàng
- Ví MoMo/ZaloPay
- Crypto (USDT/BTC)

Thanh toán được xử lý trong vòng 24h.',
'general', ARRAY['thanh toán', 'payment', 'momo', 'chuyển khoản', 'crypto'], 7),

('Liên hệ hỗ trợ?',
'Bạn có thể liên hệ hỗ trợ qua:
- Email: support@gemral.com
- Zalo OA: Gemral AI
- In-app: Nhắn "gặp support" cho Gemral

Thời gian phản hồi: 1-4 giờ (giờ hành chính).',
'general', ARRAY['liên hệ', 'hỗ trợ', 'support', 'email', 'contact'], 10),

('App có trên iOS không?',
'Có! Gemral app có trên cả 2 nền tảng:
- iOS: App Store (search "Gemral")
- Android: Google Play

Yêu cầu: iOS 13+ hoặc Android 8+',
'general', ARRAY['ios', 'android', 'app', 'tải', 'download'], 6),

('Dữ liệu có an toàn không?',
'Gemral cam kết bảo mật dữ liệu:
- Mã hóa end-to-end
- Không chia sẻ dữ liệu với bên thứ 3
- Tuân thủ GDPR
- Backup định kỳ

Chi tiết: Cài đặt > Chính sách bảo mật',
'general', ARRAY['bảo mật', 'an toàn', 'data', 'privacy', 'security'], 5),

('Có trial không?',
'Có! Bạn có thể:
- Dùng FREE tier vĩnh viễn (giới hạn tính năng)
- Trial TIER 2 trong 7 ngày
- Hoàn tiền trong 30 ngày nếu không hài lòng

Đăng ký trial: Tài khoản > Nâng cấp > Dùng thử',
'general', ARRAY['trial', 'dùng thử', 'miễn phí', 'free', 'thử'], 4),

('Có phải bot không?',
'Gemral là AI Chatbot thông minh:
- Học từ hàng triệu dữ liệu
- Cá nhân hóa theo người dùng
- Kết hợp kiến thức chuyên gia

Nếu cần hỗ trợ từ người thật, nhắn "gặp support".',
'general', ARRAY['bot', 'ai', 'người thật', 'real', 'human'], 3),

('Gemral biết những gì?',
'Gemral được train về:
- Đá quý & Phong thủy Việt Nam
- Trading Crypto (Frequency Method)
- I-Ching & Tarot
- Các khóa học của Gemral

Hỏi bất cứ chủ đề nào trong lĩnh vực này!',
'general', ARRAY['biết', 'kiến thức', 'chủ đề', 'topic', 'expertise'], 2),

('Có tiếng Anh không?',
'Hiện tại Gemral tối ưu cho tiếng Việt.
Tiếng Anh đang phát triển và sẽ có trong Q1 2025.

Bạn có thể hỏi bằng tiếng Anh, Gemral sẽ cố gắng trả lời.',
'general', ARRAY['english', 'tiếng anh', 'ngôn ngữ', 'language'], 1),

('Làm sao để feedback?',
'Bạn có thể góp ý qua:
1. Trong chat: Nhắn "góp ý: [nội dung]"
2. Email: feedback@gemral.com
3. Rating sau mỗi câu trả lời

Mỗi góp ý đều được team xem xét và cải thiện.',
'general', ARRAY['feedback', 'góp ý', 'đánh giá', 'rating', 'review'], 1),

-- ========================================
-- TRADING/SCANNER FAQs (5 thêm)
-- ========================================

('DPD, DPU, UPU, UPD là gì?',
'Đây là 4 pattern chính của Frequency Trading Method:
- DPD: Drop-Push-Drop (Giảm-Đẩy-Giảm)
- DPU: Drop-Push-Up (Giảm-Đẩy-Tăng)
- UPU: Up-Push-Up (Tăng-Đẩy-Tăng)
- UPD: Up-Push-Drop (Tăng-Đẩy-Giảm)',
'trading', ARRAY['dpd', 'dpu', 'upu', 'upd', 'pattern', 'frequency'], 10),

('Làm sao để xác định entry point?',
'Entry point được xác định khi:
1. Pattern hoàn thành (Push zone)
2. Có xác nhận từ volume
3. Risk:Reward tối thiểu 1:2

Sử dụng Scanner để nhận tín hiệu tự động.',
'trading', ARRAY['entry', 'entry point', 'vào lệnh', 'điểm vào'], 9),

('Stop loss đặt ở đâu?',
'Stop loss nên đặt:
- Dưới/trên Push zone 1-2%
- Không quá 3% tổng vốn mỗi lệnh
- Sử dụng ATR để tính SL động',
'trading', ARRAY['stop loss', 'sl', 'cắt lỗ', 'stoploss'], 8),

('Timeframe nào phù hợp nhất?',
'Tùy theo phong cách trading:
- Scalping: 1m, 5m, 15m
- Day trading: 15m, 1h, 4h
- Swing: 4h, 1D

Scanner hỗ trợ tất cả timeframes.',
'trading', ARRAY['timeframe', 'khung giờ', 'tf', 'thời gian'], 7),

('Làm sao đọc kết quả Scanner?',
'Kết quả Scanner hiển thị:
- Coin name + Pattern detected
- Confidence score (0-100%)
- Entry/SL/TP levels
- Timeframe và thời điểm phát hiện

Chỉ trade khi confidence > 70%.',
'trading', ARRAY['scanner', 'đọc', 'kết quả', 'hiểu'], 6),

-- ========================================
-- COURSES/KHÓA HỌC FAQs (4 thêm)
-- ========================================

('Khóa học có những gì?',
'Gemral cung cấp:
- Frequency Trading Method (FTM) - Full course
- Scanner Mastery - Sử dụng công cụ
- Psychology Trading - Tâm lý giao dịch
- Crystal Energy - Đá phong thủy cho trader

Tất cả courses đều có video HD + tài liệu.',
'courses', ARRAY['khóa học', 'course', 'học gì', 'nội dung'], 10),

('Học xong có chứng chỉ không?',
'Có! Sau khi hoàn thành khóa học:
- Chứng chỉ điện tử (PDF)
- Badge hiển thị trên profile
- Quyền truy cập nhóm VIP',
'courses', ARRAY['chứng chỉ', 'certificate', 'bằng', 'xong'], 8),

('Có được hỗ trợ 1-1 không?',
'Tùy gói:
- TIER 1: Hỗ trợ qua group
- TIER 2: 2 buổi 1-1/tháng
- TIER 3: Unlimited 1-1

Đặt lịch qua app hoặc Zalo.',
'courses', ARRAY['hỗ trợ', '1-1', 'mentor', 'một kèm một'], 7),

('Video có xem lại được không?',
'Có! Tất cả video courses:
- Xem lại không giới hạn
- Lifetime access sau khi mua
- Cập nhật content mới miễn phí',
'courses', ARRAY['video', 'xem lại', 'replay', 'lifetime'], 6),

-- ========================================
-- GEMRAL AI FAQs (4 thêm)
-- ========================================

('Gemral trả lời nhanh không?',
'Gemral phản hồi trong 2-5 giây. Nếu chậm hơn:
- Kiểm tra kết nối mạng
- Thử gửi lại tin nhắn
- Liên hệ support nếu vẫn chậm',
'gemral', ARRAY['chậm', 'nhanh', 'phản hồi', 'tốc độ'], 7),

('Gemral có nhớ cuộc hội thoại không?',
'Có! Gemral nhớ:
- 10 tin nhắn gần nhất trong session
- Context về tier và preferences của bạn
- Lịch sử trading goals đã đặt

Start new chat để reset context.',
'gemral', ARRAY['nhớ', 'context', 'hội thoại', 'lịch sử'], 6),

('Giới hạn tin nhắn mỗi ngày?',
'Tùy tier:
- FREE: 5 tin/ngày
- TIER 1: 15 tin/ngày
- TIER 2: 50 tin/ngày
- TIER 3+: Unlimited

Reset lúc 00:00 UTC+7.',
'gemral', ARRAY['giới hạn', 'limit', 'tin nhắn', 'quota'], 8),

('Gemral có thể phân tích chart không?',
'Hiện tại Gemral hỗ trợ:
- Phân tích patterns từ Scanner
- Giải thích tín hiệu
- Tư vấn entry/exit

Chức năng upload chart ảnh đang phát triển.',
'gemral', ARRAY['phân tích', 'chart', 'biểu đồ', 'hình ảnh'], 5),

-- ========================================
-- ACCOUNT/TÀI KHOẢN FAQs (4 thêm)
-- ========================================

('Làm sao đổi mật khẩu?',
'Đổi mật khẩu:
1. Vào Tài khoản > Cài đặt
2. Chọn "Đổi mật khẩu"
3. Nhập mật khẩu cũ + mới
4. Xác nhận

Hoặc dùng "Quên mật khẩu" ở màn hình đăng nhập.',
'account', ARRAY['mật khẩu', 'password', 'đổi', 'quên'], 9),

('Làm sao nâng cấp tier?',
'Nâng cấp tier:
1. Vào Tài khoản > Nâng cấp
2. Chọn gói phù hợp
3. Thanh toán
4. Tier được kích hoạt ngay

Hoặc nhắn "nâng cấp" cho Gemral.',
'account', ARRAY['nâng cấp', 'upgrade', 'tier', 'gói'], 10),

('Tài khoản bị khóa phải làm sao?',
'Nếu tài khoản bị khóa:
1. Kiểm tra email thông báo
2. Liên hệ support@gemral.com
3. Cung cấp thông tin xác minh

Thường do vi phạm ToS hoặc hoạt động bất thường.',
'account', ARRAY['khóa', 'blocked', 'lock', 'bị khóa'], 8),

('Làm sao xóa tài khoản?',
'Để xóa tài khoản:
1. Email support@gemral.com
2. Tiêu đề: "Yêu cầu xóa tài khoản"
3. Xác nhận email đăng ký

Dữ liệu sẽ bị xóa trong 30 ngày. Không thể khôi phục.',
'account', ARRAY['xóa', 'delete', 'hủy', 'tài khoản'], 7);

-- Verify seed data
SELECT category, COUNT(*) as count
FROM chatbot_faq
GROUP BY category
ORDER BY category;
