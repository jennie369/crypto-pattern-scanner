-- =====================================================
-- TIER-3 - Module B: Opportunities Elite
-- Course: course-tier3-trading-mastery
-- File 23/23
-- =====================================================

-- Create/Update Module
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  'module-tier-3-ch7',
  'course-tier3-trading-mastery',
  'Module B: Opportunities Elite',
  'Cơ hội Elite Partnership',
  7,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Lesson 7.1: Ngã Ba Đường - Bạn Đang Đứng Ở Đâu
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch7-l1',
  'module-tier-3-ch7',
  'course-tier3-trading-mastery',
  'Bài 7.1: Ngã Ba Đường - Bạn Đang Đứng Ở Đâu',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 7.1: Ngã Ba Đường - Bạn Đang Đứng Ở Đâu | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #6366F1; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #6366F1; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #6366F1, #4F46E5); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(79,70,229,0.1)); border: 1px solid rgba(99,102,241,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        ul { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #6366F1; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .path-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #6366F1; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .path-card h4 { color: #6366F1; font-size: 1.1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .path-card.gold { border-color: #FFBD59; }
        .path-card.gold h4 { color: #FFBD59; }
        .path-card.green { border-color: #10B981; }
        .path-card.green h4 { color: #10B981; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <span class="module-badge">MODULE B</span>
            <h1 class="lesson-title">Ngã Ba Đường</h1>
            <p class="lesson-subtitle">Bạn Đang Đứng Ở Đâu - 3 Con Đường Phía Trước</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🔀</div>
            <h2 class="section-title">Điểm Quyết Định</h2>
            <p>Bạn đã hoàn thành hành trình học tập. Bây giờ, bạn đứng trước <strong style="color: #6366F1;">ngã ba đường</strong> - một điểm quyết định quan trọng. Mỗi con đường dẫn đến một tương lai khác nhau.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💭 Câu Hỏi:</strong> Sau khi học xong, bạn muốn làm gì tiếp theo? Câu trả lời sẽ xác định con đường của bạn.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/6366F1?text=3+Paths+Crossroad" alt="Crossroad">
                <p class="image-caption">Ngã ba đường - 3 lựa chọn phía trước</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🛣️</div>
            <h2 class="section-title">3 Con Đường</h2>

            <div class="path-card">
                <h4>🎯 Con Đường 1: Independent Trader</h4>
                <p>Tự trade với kiến thức đã học, xây dựng portfolio cá nhân.</p>
                <ul style="margin-bottom: 0;">
                    <li>Áp dụng 24 patterns vào trading thực tế</li>
                    <li>Sử dụng AI và Whale tracking</li>
                    <li>Tự quản lý risk và portfolio</li>
                    <li>Thu nhập từ trading profits</li>
                </ul>
            </div>

            <div class="path-card gold">
                <h4>💼 Con Đường 2: Partner/Affiliate</h4>
                <p>Chia sẻ kiến thức đã học, tạo thu nhập từ referrals.</p>
                <ul style="margin-bottom: 0;">
                    <li>Trở thành CTV hoặc Đại Đối Tác</li>
                    <li>Giới thiệu học viên mới cho GEM Academy</li>
                    <li>Nhận hoa hồng 10-30% (sản phẩm số) theo tier CTV</li>
                    <li>Thu nhập passive, không cần trade</li>
                </ul>
            </div>

            <div class="path-card green">
                <h4>🚀 Con Đường 3: Hybrid - Cả Hai</h4>
                <p>Kết hợp trading cá nhân VÀ affiliate - maximizing income.</p>
                <ul style="margin-bottom: 0;">
                    <li>Trade để tạo income chủ động</li>
                    <li>Affiliate để tạo income thụ động</li>
                    <li>Dual income streams = financial freedom</li>
                    <li>Đây là con đường của hầu hết Elite members</li>
                </ul>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🤔</div>
            <h2 class="section-title">Điều Gì Phù Hợp Với Bạn?</h2>
            <p>Hãy tự hỏi bản thân những câu hỏi này:</p>

            <ul>
                <li><strong>Bạn có thời gian trade không?</strong> Nếu có → Con đường 1 hoặc 3</li>
                <li><strong>Bạn có network không?</strong> Nếu có → Con đường 2 hoặc 3</li>
                <li><strong>Bạn thích teaching không?</strong> Nếu có → Con đường 2 hoặc 3</li>
                <li><strong>Bạn muốn multiple income?</strong> Nếu có → Con đường 3</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Gợi Ý:</strong> Hầu hết Elite Members chọn Con đường 3 - Hybrid. Đây là cách tối ưu để maximize value từ những gì bạn đã học.</p>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite - Module B</p>
            <p>© 2024 GEM Trading. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>
',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 7.1: Ngã Ba Đường - Bạn Đang Đứng Ở Đâu | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #6366F1; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #6366F1; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #6366F1, #4F46E5); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(79,70,229,0.1)); border: 1px solid rgba(99,102,241,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        ul { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #6366F1; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .path-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #6366F1; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .path-card h4 { color: #6366F1; font-size: 1.1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .path-card.gold { border-color: #FFBD59; }
        .path-card.gold h4 { color: #FFBD59; }
        .path-card.green { border-color: #10B981; }
        .path-card.green h4 { color: #10B981; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <span class="module-badge">MODULE B</span>
            <h1 class="lesson-title">Ngã Ba Đường</h1>
            <p class="lesson-subtitle">Bạn Đang Đứng Ở Đâu - 3 Con Đường Phía Trước</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🔀</div>
            <h2 class="section-title">Điểm Quyết Định</h2>
            <p>Bạn đã hoàn thành hành trình học tập. Bây giờ, bạn đứng trước <strong style="color: #6366F1;">ngã ba đường</strong> - một điểm quyết định quan trọng. Mỗi con đường dẫn đến một tương lai khác nhau.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💭 Câu Hỏi:</strong> Sau khi học xong, bạn muốn làm gì tiếp theo? Câu trả lời sẽ xác định con đường của bạn.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/6366F1?text=3+Paths+Crossroad" alt="Crossroad">
                <p class="image-caption">Ngã ba đường - 3 lựa chọn phía trước</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🛣️</div>
            <h2 class="section-title">3 Con Đường</h2>

            <div class="path-card">
                <h4>🎯 Con Đường 1: Independent Trader</h4>
                <p>Tự trade với kiến thức đã học, xây dựng portfolio cá nhân.</p>
                <ul style="margin-bottom: 0;">
                    <li>Áp dụng 24 patterns vào trading thực tế</li>
                    <li>Sử dụng AI và Whale tracking</li>
                    <li>Tự quản lý risk và portfolio</li>
                    <li>Thu nhập từ trading profits</li>
                </ul>
            </div>

            <div class="path-card gold">
                <h4>💼 Con Đường 2: Partner/Affiliate</h4>
                <p>Chia sẻ kiến thức đã học, tạo thu nhập từ referrals.</p>
                <ul style="margin-bottom: 0;">
                    <li>Trở thành CTV hoặc Đại Đối Tác</li>
                    <li>Giới thiệu học viên mới cho GEM Academy</li>
                    <li>Nhận hoa hồng 10-30% (sản phẩm số) theo tier CTV</li>
                    <li>Thu nhập passive, không cần trade</li>
                </ul>
            </div>

            <div class="path-card green">
                <h4>🚀 Con Đường 3: Hybrid - Cả Hai</h4>
                <p>Kết hợp trading cá nhân VÀ affiliate - maximizing income.</p>
                <ul style="margin-bottom: 0;">
                    <li>Trade để tạo income chủ động</li>
                    <li>Affiliate để tạo income thụ động</li>
                    <li>Dual income streams = financial freedom</li>
                    <li>Đây là con đường của hầu hết Elite members</li>
                </ul>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🤔</div>
            <h2 class="section-title">Điều Gì Phù Hợp Với Bạn?</h2>
            <p>Hãy tự hỏi bản thân những câu hỏi này:</p>

            <ul>
                <li><strong>Bạn có thời gian trade không?</strong> Nếu có → Con đường 1 hoặc 3</li>
                <li><strong>Bạn có network không?</strong> Nếu có → Con đường 2 hoặc 3</li>
                <li><strong>Bạn thích teaching không?</strong> Nếu có → Con đường 2 hoặc 3</li>
                <li><strong>Bạn muốn multiple income?</strong> Nếu có → Con đường 3</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Gợi Ý:</strong> Hầu hết Elite Members chọn Con đường 3 - Hybrid. Đây là cách tối ưu để maximize value từ những gì bạn đã học.</p>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite - Module B</p>
            <p>© 2024 GEM Trading. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>
',
  1,
  15,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  html_content = EXCLUDED.html_content,
  content = EXCLUDED.content,
  updated_at = NOW();

-- Lesson 7.2: Cơ Hội Tiếp Theo
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch7-l2',
  'module-tier-3-ch7',
  'course-tier3-trading-mastery',
  'Bài 7.2: Cơ Hội Tiếp Theo',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 7.2: Cơ Hội Tiếp Theo | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #6366F1; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #6366F1; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #6366F1, #4F46E5); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(79,70,229,0.1)); border: 1px solid rgba(99,102,241,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        ul { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #6366F1; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .opportunity-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #10B981; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .opportunity-card h4 { color: #10B981; font-size: 1.1rem; margin-bottom: 0.75rem; }
        .opportunity-card .price { color: #FFBD59; font-size: 1.25rem; font-weight: 700; margin: 0.5rem 0; }
        .benefit-list { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .benefit-item { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
        .benefit-item:last-child { margin-bottom: 0; }
        .benefit-item .check { color: #10B981; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <span class="module-badge">MODULE B</span>
            <h1 class="lesson-title">Cơ Hội Tiếp Theo</h1>
            <p class="lesson-subtitle">Coaching 1-1, Masterminds, VIP Community</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🎯</div>
            <h2 class="section-title">Nâng Cao Hành Trình</h2>
            <p>Sau khi hoàn thành Tier 3, có những cơ hội để tiếp tục phát triển và đạt mức độ cao hơn:</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Mindset:</strong> Học tập là hành trình không có điểm dừng. Elite Traders luôn tìm cách cải thiện.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">👨‍🏫</div>
            <h2 class="section-title">Coaching 1-1</h2>

            <div class="opportunity-card">
                <h4>🎯 Private Coaching với Mentor</h4>
                <p>Làm việc trực tiếp với mentor để customize chiến lược cho bạn.</p>
                <div class="benefit-list">
                    <div class="benefit-item"><span class="check">✓</span> 4 sessions/tháng (60 phút mỗi session)</div>
                    <div class="benefit-item"><span class="check">✓</span> Review trades của bạn chi tiết</div>
                    <div class="benefit-item"><span class="check">✓</span> Customize strategy cho style trading của bạn</div>
                    <div class="benefit-item"><span class="check">✓</span> Direct chat access với mentor</div>
                    <div class="benefit-item"><span class="check">✓</span> Psychology coaching</div>
                </div>
                <p class="price">Liên hệ để biết chi tiết</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🧠</div>
            <h2 class="section-title">Mastermind Groups</h2>

            <div class="opportunity-card" style="border-color: #FFBD59;">
                <h4 style="color: #FFBD59;">💎 Elite Mastermind</h4>
                <p>Nhóm nhỏ 10-15 Elite Traders, học hỏi lẫn nhau và từ top performers.</p>
                <div class="benefit-list">
                    <div class="benefit-item"><span class="check">✓</span> Weekly group calls với trading review</div>
                    <div class="benefit-item"><span class="check">✓</span> Exclusive trade ideas từ top performers</div>
                    <div class="benefit-item"><span class="check">✓</span> Accountability partners</div>
                    <div class="benefit-item"><span class="check">✓</span> Private Telegram group</div>
                    <div class="benefit-item"><span class="check">✓</span> Monthly guest experts</div>
                </div>
                <p class="price">Liên hệ để biết chi tiết</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">👥</div>
            <h2 class="section-title">VIP Community Access</h2>

            <div class="opportunity-card" style="border-color: #8B5CF6;">
                <h4 style="color: #8B5CF6;">🌟 VIP Community</h4>
                <p>Cộng đồng exclusive cho Elite Members với resources cao cấp.</p>
                <div class="benefit-list">
                    <div class="benefit-item"><span class="check">✓</span> Real-time trade alerts từ mentors</div>
                    <div class="benefit-item"><span class="check">✓</span> Early access các features mới</div>
                    <div class="benefit-item"><span class="check">✓</span> Exclusive market analysis</div>
                    <div class="benefit-item"><span class="check">✓</span> Networking với top traders</div>
                    <div class="benefit-item"><span class="check">✓</span> Priority support</div>
                </div>
                <p class="price">Liên hệ để biết chi tiết</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=VIP+Community+Benefits" alt="VIP Community">
                <p class="image-caption">Lợi ích của VIP Community</p>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite - Module B</p>
            <p>© 2024 GEM Trading. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>
',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 7.2: Cơ Hội Tiếp Theo | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #6366F1; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #6366F1; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #6366F1, #4F46E5); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(79,70,229,0.1)); border: 1px solid rgba(99,102,241,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        ul { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #6366F1; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .opportunity-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #10B981; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .opportunity-card h4 { color: #10B981; font-size: 1.1rem; margin-bottom: 0.75rem; }
        .opportunity-card .price { color: #FFBD59; font-size: 1.25rem; font-weight: 700; margin: 0.5rem 0; }
        .benefit-list { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .benefit-item { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
        .benefit-item:last-child { margin-bottom: 0; }
        .benefit-item .check { color: #10B981; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <span class="module-badge">MODULE B</span>
            <h1 class="lesson-title">Cơ Hội Tiếp Theo</h1>
            <p class="lesson-subtitle">Coaching 1-1, Masterminds, VIP Community</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🎯</div>
            <h2 class="section-title">Nâng Cao Hành Trình</h2>
            <p>Sau khi hoàn thành Tier 3, có những cơ hội để tiếp tục phát triển và đạt mức độ cao hơn:</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Mindset:</strong> Học tập là hành trình không có điểm dừng. Elite Traders luôn tìm cách cải thiện.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">👨‍🏫</div>
            <h2 class="section-title">Coaching 1-1</h2>

            <div class="opportunity-card">
                <h4>🎯 Private Coaching với Mentor</h4>
                <p>Làm việc trực tiếp với mentor để customize chiến lược cho bạn.</p>
                <div class="benefit-list">
                    <div class="benefit-item"><span class="check">✓</span> 4 sessions/tháng (60 phút mỗi session)</div>
                    <div class="benefit-item"><span class="check">✓</span> Review trades của bạn chi tiết</div>
                    <div class="benefit-item"><span class="check">✓</span> Customize strategy cho style trading của bạn</div>
                    <div class="benefit-item"><span class="check">✓</span> Direct chat access với mentor</div>
                    <div class="benefit-item"><span class="check">✓</span> Psychology coaching</div>
                </div>
                <p class="price">Liên hệ để biết chi tiết</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🧠</div>
            <h2 class="section-title">Mastermind Groups</h2>

            <div class="opportunity-card" style="border-color: #FFBD59;">
                <h4 style="color: #FFBD59;">💎 Elite Mastermind</h4>
                <p>Nhóm nhỏ 10-15 Elite Traders, học hỏi lẫn nhau và từ top performers.</p>
                <div class="benefit-list">
                    <div class="benefit-item"><span class="check">✓</span> Weekly group calls với trading review</div>
                    <div class="benefit-item"><span class="check">✓</span> Exclusive trade ideas từ top performers</div>
                    <div class="benefit-item"><span class="check">✓</span> Accountability partners</div>
                    <div class="benefit-item"><span class="check">✓</span> Private Telegram group</div>
                    <div class="benefit-item"><span class="check">✓</span> Monthly guest experts</div>
                </div>
                <p class="price">Liên hệ để biết chi tiết</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">👥</div>
            <h2 class="section-title">VIP Community Access</h2>

            <div class="opportunity-card" style="border-color: #8B5CF6;">
                <h4 style="color: #8B5CF6;">🌟 VIP Community</h4>
                <p>Cộng đồng exclusive cho Elite Members với resources cao cấp.</p>
                <div class="benefit-list">
                    <div class="benefit-item"><span class="check">✓</span> Real-time trade alerts từ mentors</div>
                    <div class="benefit-item"><span class="check">✓</span> Early access các features mới</div>
                    <div class="benefit-item"><span class="check">✓</span> Exclusive market analysis</div>
                    <div class="benefit-item"><span class="check">✓</span> Networking với top traders</div>
                    <div class="benefit-item"><span class="check">✓</span> Priority support</div>
                </div>
                <p class="price">Liên hệ để biết chi tiết</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=VIP+Community+Benefits" alt="VIP Community">
                <p class="image-caption">Lợi ích của VIP Community</p>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite - Module B</p>
            <p>© 2024 GEM Trading. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>
',
  2,
  15,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  html_content = EXCLUDED.html_content,
  content = EXCLUDED.content,
  updated_at = NOW();

-- Lesson 7.3: Cơ Hội Đối Tác Cao Cấp
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch7-l3',
  'module-tier-3-ch7',
  'course-tier3-trading-mastery',
  'Bài 7.3: Cơ Hội Đối Tác Cao Cấp',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 7.3: Cơ Hội Đối Tác Cao Cấp | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #FFBD59; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #FFBD59; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #FFBD59, #F59E0B); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(255,189,89,0.1), rgba(245,158,11,0.1)); border: 1px solid rgba(255,189,89,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        ul { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #FFBD59; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }

        /* CTV Tier Table */
        .tier-table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.85rem; }
        .tier-table th { background: #1a1a2e; color: #FFBD59; padding: 0.75rem 0.5rem; text-align: center; border: 1px solid #27272a; font-weight: 600; }
        .tier-table td { padding: 0.75rem 0.5rem; text-align: center; border: 1px solid #27272a; background: #0f0f1a; }
        .tier-table tr:hover td { background: #1a1a2e; }
        .tier-icon { font-size: 1.1rem; }
        .tier-table .highlight-row td { background: rgba(16,185,129,0.1); }

        /* Partner Cards */
        .partner-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #FFBD59; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .partner-card h4 { color: #FFBD59; font-size: 1.1rem; margin-bottom: 0.75rem; }
        .benefit-list { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin: 0.75rem 0; }
        .benefit-item { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
        .benefit-item:last-child { margin-bottom: 0; }
        .benefit-item .check { color: #10B981; }

        /* Elite Benefits Grid */
        .elite-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .elite-card { background: #1a1a2e; border-radius: 12px; padding: 1.25rem; border-top: 3px solid #8B5CF6; }
        .elite-card h5 { color: #8B5CF6; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .elite-card p { font-size: 0.9rem; margin-bottom: 0; }

        /* Income Calculator */
        .income-calc { background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .income-calc h4 { color: #10B981; margin-bottom: 1rem; }
        .income-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(16,185,129,0.2); }
        .income-row:last-child { border-bottom: none; font-weight: 700; }
        .income-row .label { color: #a1a1aa; }
        .income-row .value { color: #10B981; font-weight: 600; }

        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .tier-table { font-size: 0.7rem; }
            .tier-table th, .tier-table td { padding: 0.4rem 0.25rem; }
            .elite-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <span class="module-badge">MODULE B</span>
            <h1 class="lesson-title">Cơ Hội Đối Tác Cao Cấp</h1>
            <p class="lesson-subtitle">CTV & KOL Affiliate - Bảng Hoa Hồng Chính Thức</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🤝</div>
            <h2 class="section-title">Chương Trình Đối Tác GEM</h2>
            <p>Là Elite Member hoàn thành TIER 3, bạn có đủ điều kiện tham gia chương trình đối tác cao cấp nhất của GEM.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🎯 Lợi Thế Elite:</strong> Với kiến thức từ 24 patterns, AI, và Whale tracking, bạn có thể chia sẻ giá trị thực sự và xây dựng network chất lượng.</p>
            </div>

            <p>GEM có <strong>2 chương trình</strong> chính:</p>
            <ul>
                <li><strong>CTV (Cộng Tác Viên):</strong> 5 cấp bậc, ai cũng đăng ký được</li>
                <li><strong>KOL Affiliate:</strong> Dành cho influencers 20K+ followers</li>
            </ul>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=GEM+Elite+Partnership" alt="Elite Partnership">
                <p class="image-caption">Chương trình đối tác cao cấp GEM</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Bảng Hoa Hồng CTV - Chính Thức</h2>
            <p>Bảng hoa hồng CTV với <strong>5 cấp bậc</strong> chính thức:</p>

            <table class="tier-table">
                <thead>
                    <tr>
                        <th>Cấp Bậc</th>
                        <th>Ngưỡng (VND)</th>
                        <th>Digital</th>
                        <th>Physical</th>
                        <th>Sub-Aff</th>
                        <th>Thanh toán</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><span class="tier-icon">🥉</span> Bronze (Đồng)</td>
                        <td>0</td>
                        <td><strong style="color: #10B981;">10%</strong></td>
                        <td>6%</td>
                        <td>2%</td>
                        <td>Hàng tháng</td>
                    </tr>
                    <tr>
                        <td><span class="tier-icon">🥈</span> Silver (Bạc)</td>
                        <td>50M</td>
                        <td><strong style="color: #10B981;">15%</strong></td>
                        <td>8%</td>
                        <td>2.5%</td>
                        <td>Hàng tháng</td>
                    </tr>
                    <tr>
                        <td><span class="tier-icon">🥇</span> Gold (Vàng)</td>
                        <td>150M</td>
                        <td><strong style="color: #10B981;">20%</strong></td>
                        <td>10%</td>
                        <td>3%</td>
                        <td>2 lần/tháng</td>
                    </tr>
                    <tr>
                        <td><span class="tier-icon">💎</span> Platinum (Bạch Kim)</td>
                        <td>400M</td>
                        <td><strong style="color: #10B981;">25%</strong></td>
                        <td>12%</td>
                        <td>3.5%</td>
                        <td>Hàng tuần</td>
                    </tr>
                    <tr class="highlight-row">
                        <td><span class="tier-icon">👑</span> Diamond (Kim Cương)</td>
                        <td>800M</td>
                        <td><strong style="color: #10B981;">30%</strong></td>
                        <td>15%</td>
                        <td>4%</td>
                        <td>Hàng tuần</td>
                    </tr>
                </tbody>
            </table>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>📝 Giải thích:</strong><br>
                • <strong>Digital:</strong> Khóa học, subscription, ebook<br>
                • <strong>Physical:</strong> Crystal, jewelry, sản phẩm vật lý<br>
                • <strong>Sub-Aff:</strong> Hoa hồng từ CTV bạn giới thiệu<br>
                • <strong>Ngưỡng:</strong> Tổng doanh số tích lũy để thăng cấp</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⭐</div>
            <h2 class="section-title">KOL Affiliate - Chi Tiết</h2>
            <p>Chương trình dành cho influencers:</p>

            <div class="partner-card" style="border-color: #8B5CF6;">
                <h4 style="color: #8B5CF6;">⭐ KOL Affiliate Program</h4>
                <p><strong>Yêu cầu BẮT BUỘC:</strong> 20,000+ followers trên mạng xã hội</p>
                <div class="benefit-list">
                    <div class="benefit-item"><span class="check">✓</span> Digital: <strong style="color: #10B981;">20%</strong> (cố định)</div>
                    <div class="benefit-item"><span class="check">✓</span> Physical: <strong style="color: #10B981;">20%</strong> (cố định)</div>
                    <div class="benefit-item"><span class="check">✓</span> Sub-Affiliate: <strong style="color: #10B981;">3.5%</strong></div>
                    <div class="benefit-item"><span class="check">✓</span> Thanh toán: 2 lần/tháng (ngày 1 và 15)</div>
                </div>
                <p style="margin-top: 1rem; color: #EF4444; font-size: 0.9rem;"><strong>⚠️ Lưu ý:</strong> Yêu cầu 20K+ followers là BẮT BUỘC, không có ngoại lệ. Dù đã là CTV vẫn phải có 20K followers để đăng ký KOL.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=KOL+Affiliate+Requirements" alt="KOL Requirements">
                <p class="image-caption">Yêu cầu và lợi ích KOL Affiliate</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">💰</div>
            <h2 class="section-title">Ví Dụ Thu Nhập Thực Tế</h2>

            <div class="income-calc">
                <h4>📊 CTV Diamond - Ví dụ tháng</h4>
                <div class="income-row">
                    <span class="label">Bán 10 khóa Tier 2 (2M mỗi khóa)</span>
                    <span class="value">20,000,000đ doanh số</span>
                </div>
                <div class="income-row">
                    <span class="label">Commission 30%</span>
                    <span class="value">6,000,000đ</span>
                </div>
                <div class="income-row">
                    <span class="label">Sub-Aff từ team (giả sử 50M doanh số)</span>
                    <span class="value">2,000,000đ (4%)</span>
                </div>
                <div class="income-row">
                    <span class="label">TỔNG THU NHẬP</span>
                    <span class="value" style="font-size: 1.25rem;">8,000,000đ/tháng</span>
                </div>
            </div>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🚀 Tiềm năng:</strong> Top CTV Diamond có thể kiếm <strong>20-50 triệu/tháng</strong> bằng cách kết hợp bán hàng trực tiếp và xây dựng team Sub-Affiliate.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">👑</div>
            <h2 class="section-title">Lợi Thế Elite Member</h2>
            <p>Là Elite Member hoàn thành TIER 3, bạn có những lợi thế đặc biệt:</p>

            <div class="elite-grid">
                <div class="elite-card">
                    <h5>🎓 Kiến Thức Đầy Đủ</h5>
                    <p>24 patterns, AI, Whale tracking - có case studies thực tế để chia sẻ</p>
                </div>
                <div class="elite-card">
                    <h5>📜 Chứng Nhận Elite</h5>
                    <p>Certificate chứng minh năng lực, tăng uy tín khi giới thiệu</p>
                </div>
                <div class="elite-card">
                    <h5>🤝 Đủ Điều Kiện</h5>
                    <p>Đăng ký CTV ngay lập tức, bắt đầu từ Bronze và thăng cấp nhanh</p>
                </div>
                <div class="elite-card">
                    <h5>💬 Chia Sẻ Giá Trị</h5>
                    <p>Có thể hướng dẫn và support referrals hiệu quả</p>
                </div>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🚀</div>
            <h2 class="section-title">Cách Đăng Ký</h2>
            <p>Quy trình đăng ký CTV:</p>

            <ul>
                <li><strong>Bước 1:</strong> Mở app GEM Mobile → Account → Affiliate</li>
                <li><strong>Bước 2:</strong> Chọn "Đăng ký CTV" và điền thông tin</li>
                <li><strong>Bước 3:</strong> Chờ duyệt (tự động sau 3 ngày hoặc Admin duyệt sớm)</li>
                <li><strong>Bước 4:</strong> Nhận link referral và bắt đầu chia sẻ</li>
            </ul>

            <div class="partner-card" style="border-color: #10B981;">
                <h4 style="color: #10B981;">📋 Checklist Sau Khi Duyệt</h4>
                <div class="benefit-list">
                    <div class="benefit-item"><span class="check">☐</span> Lấy link referral từ Partner Dashboard</div>
                    <div class="benefit-item"><span class="check">☐</span> Tải marketing materials</div>
                    <div class="benefit-item"><span class="check">☐</span> Chia sẻ trải nghiệm học tập trên social media</div>
                    <div class="benefit-item"><span class="check">☐</span> Giới thiệu cho bạn bè quan tâm trading</div>
                    <div class="benefit-item"><span class="check">☐</span> Track earnings trong Dashboard</div>
                </div>
            </div>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Mẹo Elite:</strong> Chia sẻ journey thật của bạn - từ lúc mới học đến khi hoàn thành TIER 3. Câu chuyện thật luôn tạo được niềm tin.</p>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite - Module B</p>
            <p>© 2024 GEM Trading. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>
',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 7.3: Cơ Hội Đối Tác Cao Cấp | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #FFBD59; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #FFBD59; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #FFBD59, #F59E0B); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(255,189,89,0.1), rgba(245,158,11,0.1)); border: 1px solid rgba(255,189,89,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        ul { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #FFBD59; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }

        /* CTV Tier Table */
        .tier-table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.85rem; }
        .tier-table th { background: #1a1a2e; color: #FFBD59; padding: 0.75rem 0.5rem; text-align: center; border: 1px solid #27272a; font-weight: 600; }
        .tier-table td { padding: 0.75rem 0.5rem; text-align: center; border: 1px solid #27272a; background: #0f0f1a; }
        .tier-table tr:hover td { background: #1a1a2e; }
        .tier-icon { font-size: 1.1rem; }
        .tier-table .highlight-row td { background: rgba(16,185,129,0.1); }

        /* Partner Cards */
        .partner-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #FFBD59; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .partner-card h4 { color: #FFBD59; font-size: 1.1rem; margin-bottom: 0.75rem; }
        .benefit-list { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin: 0.75rem 0; }
        .benefit-item { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
        .benefit-item:last-child { margin-bottom: 0; }
        .benefit-item .check { color: #10B981; }

        /* Elite Benefits Grid */
        .elite-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .elite-card { background: #1a1a2e; border-radius: 12px; padding: 1.25rem; border-top: 3px solid #8B5CF6; }
        .elite-card h5 { color: #8B5CF6; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .elite-card p { font-size: 0.9rem; margin-bottom: 0; }

        /* Income Calculator */
        .income-calc { background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .income-calc h4 { color: #10B981; margin-bottom: 1rem; }
        .income-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(16,185,129,0.2); }
        .income-row:last-child { border-bottom: none; font-weight: 700; }
        .income-row .label { color: #a1a1aa; }
        .income-row .value { color: #10B981; font-weight: 600; }

        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .tier-table { font-size: 0.7rem; }
            .tier-table th, .tier-table td { padding: 0.4rem 0.25rem; }
            .elite-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <span class="module-badge">MODULE B</span>
            <h1 class="lesson-title">Cơ Hội Đối Tác Cao Cấp</h1>
            <p class="lesson-subtitle">CTV & KOL Affiliate - Bảng Hoa Hồng Chính Thức</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🤝</div>
            <h2 class="section-title">Chương Trình Đối Tác GEM</h2>
            <p>Là Elite Member hoàn thành TIER 3, bạn có đủ điều kiện tham gia chương trình đối tác cao cấp nhất của GEM.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🎯 Lợi Thế Elite:</strong> Với kiến thức từ 24 patterns, AI, và Whale tracking, bạn có thể chia sẻ giá trị thực sự và xây dựng network chất lượng.</p>
            </div>

            <p>GEM có <strong>2 chương trình</strong> chính:</p>
            <ul>
                <li><strong>CTV (Cộng Tác Viên):</strong> 5 cấp bậc, ai cũng đăng ký được</li>
                <li><strong>KOL Affiliate:</strong> Dành cho influencers 20K+ followers</li>
            </ul>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=GEM+Elite+Partnership" alt="Elite Partnership">
                <p class="image-caption">Chương trình đối tác cao cấp GEM</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Bảng Hoa Hồng CTV - Chính Thức</h2>
            <p>Bảng hoa hồng CTV với <strong>5 cấp bậc</strong> chính thức:</p>

            <table class="tier-table">
                <thead>
                    <tr>
                        <th>Cấp Bậc</th>
                        <th>Ngưỡng (VND)</th>
                        <th>Digital</th>
                        <th>Physical</th>
                        <th>Sub-Aff</th>
                        <th>Thanh toán</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><span class="tier-icon">🥉</span> Bronze (Đồng)</td>
                        <td>0</td>
                        <td><strong style="color: #10B981;">10%</strong></td>
                        <td>6%</td>
                        <td>2%</td>
                        <td>Hàng tháng</td>
                    </tr>
                    <tr>
                        <td><span class="tier-icon">🥈</span> Silver (Bạc)</td>
                        <td>50M</td>
                        <td><strong style="color: #10B981;">15%</strong></td>
                        <td>8%</td>
                        <td>2.5%</td>
                        <td>Hàng tháng</td>
                    </tr>
                    <tr>
                        <td><span class="tier-icon">🥇</span> Gold (Vàng)</td>
                        <td>150M</td>
                        <td><strong style="color: #10B981;">20%</strong></td>
                        <td>10%</td>
                        <td>3%</td>
                        <td>2 lần/tháng</td>
                    </tr>
                    <tr>
                        <td><span class="tier-icon">💎</span> Platinum (Bạch Kim)</td>
                        <td>400M</td>
                        <td><strong style="color: #10B981;">25%</strong></td>
                        <td>12%</td>
                        <td>3.5%</td>
                        <td>Hàng tuần</td>
                    </tr>
                    <tr class="highlight-row">
                        <td><span class="tier-icon">👑</span> Diamond (Kim Cương)</td>
                        <td>800M</td>
                        <td><strong style="color: #10B981;">30%</strong></td>
                        <td>15%</td>
                        <td>4%</td>
                        <td>Hàng tuần</td>
                    </tr>
                </tbody>
            </table>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>📝 Giải thích:</strong><br>
                • <strong>Digital:</strong> Khóa học, subscription, ebook<br>
                • <strong>Physical:</strong> Crystal, jewelry, sản phẩm vật lý<br>
                • <strong>Sub-Aff:</strong> Hoa hồng từ CTV bạn giới thiệu<br>
                • <strong>Ngưỡng:</strong> Tổng doanh số tích lũy để thăng cấp</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⭐</div>
            <h2 class="section-title">KOL Affiliate - Chi Tiết</h2>
            <p>Chương trình dành cho influencers:</p>

            <div class="partner-card" style="border-color: #8B5CF6;">
                <h4 style="color: #8B5CF6;">⭐ KOL Affiliate Program</h4>
                <p><strong>Yêu cầu BẮT BUỘC:</strong> 20,000+ followers trên mạng xã hội</p>
                <div class="benefit-list">
                    <div class="benefit-item"><span class="check">✓</span> Digital: <strong style="color: #10B981;">20%</strong> (cố định)</div>
                    <div class="benefit-item"><span class="check">✓</span> Physical: <strong style="color: #10B981;">20%</strong> (cố định)</div>
                    <div class="benefit-item"><span class="check">✓</span> Sub-Affiliate: <strong style="color: #10B981;">3.5%</strong></div>
                    <div class="benefit-item"><span class="check">✓</span> Thanh toán: 2 lần/tháng (ngày 1 và 15)</div>
                </div>
                <p style="margin-top: 1rem; color: #EF4444; font-size: 0.9rem;"><strong>⚠️ Lưu ý:</strong> Yêu cầu 20K+ followers là BẮT BUỘC, không có ngoại lệ. Dù đã là CTV vẫn phải có 20K followers để đăng ký KOL.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=KOL+Affiliate+Requirements" alt="KOL Requirements">
                <p class="image-caption">Yêu cầu và lợi ích KOL Affiliate</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">💰</div>
            <h2 class="section-title">Ví Dụ Thu Nhập Thực Tế</h2>

            <div class="income-calc">
                <h4>📊 CTV Diamond - Ví dụ tháng</h4>
                <div class="income-row">
                    <span class="label">Bán 10 khóa Tier 2 (2M mỗi khóa)</span>
                    <span class="value">20,000,000đ doanh số</span>
                </div>
                <div class="income-row">
                    <span class="label">Commission 30%</span>
                    <span class="value">6,000,000đ</span>
                </div>
                <div class="income-row">
                    <span class="label">Sub-Aff từ team (giả sử 50M doanh số)</span>
                    <span class="value">2,000,000đ (4%)</span>
                </div>
                <div class="income-row">
                    <span class="label">TỔNG THU NHẬP</span>
                    <span class="value" style="font-size: 1.25rem;">8,000,000đ/tháng</span>
                </div>
            </div>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🚀 Tiềm năng:</strong> Top CTV Diamond có thể kiếm <strong>20-50 triệu/tháng</strong> bằng cách kết hợp bán hàng trực tiếp và xây dựng team Sub-Affiliate.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">👑</div>
            <h2 class="section-title">Lợi Thế Elite Member</h2>
            <p>Là Elite Member hoàn thành TIER 3, bạn có những lợi thế đặc biệt:</p>

            <div class="elite-grid">
                <div class="elite-card">
                    <h5>🎓 Kiến Thức Đầy Đủ</h5>
                    <p>24 patterns, AI, Whale tracking - có case studies thực tế để chia sẻ</p>
                </div>
                <div class="elite-card">
                    <h5>📜 Chứng Nhận Elite</h5>
                    <p>Certificate chứng minh năng lực, tăng uy tín khi giới thiệu</p>
                </div>
                <div class="elite-card">
                    <h5>🤝 Đủ Điều Kiện</h5>
                    <p>Đăng ký CTV ngay lập tức, bắt đầu từ Bronze và thăng cấp nhanh</p>
                </div>
                <div class="elite-card">
                    <h5>💬 Chia Sẻ Giá Trị</h5>
                    <p>Có thể hướng dẫn và support referrals hiệu quả</p>
                </div>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🚀</div>
            <h2 class="section-title">Cách Đăng Ký</h2>
            <p>Quy trình đăng ký CTV:</p>

            <ul>
                <li><strong>Bước 1:</strong> Mở app GEM Mobile → Account → Affiliate</li>
                <li><strong>Bước 2:</strong> Chọn "Đăng ký CTV" và điền thông tin</li>
                <li><strong>Bước 3:</strong> Chờ duyệt (tự động sau 3 ngày hoặc Admin duyệt sớm)</li>
                <li><strong>Bước 4:</strong> Nhận link referral và bắt đầu chia sẻ</li>
            </ul>

            <div class="partner-card" style="border-color: #10B981;">
                <h4 style="color: #10B981;">📋 Checklist Sau Khi Duyệt</h4>
                <div class="benefit-list">
                    <div class="benefit-item"><span class="check">☐</span> Lấy link referral từ Partner Dashboard</div>
                    <div class="benefit-item"><span class="check">☐</span> Tải marketing materials</div>
                    <div class="benefit-item"><span class="check">☐</span> Chia sẻ trải nghiệm học tập trên social media</div>
                    <div class="benefit-item"><span class="check">☐</span> Giới thiệu cho bạn bè quan tâm trading</div>
                    <div class="benefit-item"><span class="check">☐</span> Track earnings trong Dashboard</div>
                </div>
            </div>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Mẹo Elite:</strong> Chia sẻ journey thật của bạn - từ lúc mới học đến khi hoàn thành TIER 3. Câu chuyện thật luôn tạo được niềm tin.</p>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite - Module B</p>
            <p>© 2024 GEM Trading. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>
',
  3,
  15,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  html_content = EXCLUDED.html_content,
  content = EXCLUDED.content,
  updated_at = NOW();

-- Lesson 7.4: Câu Chuyện Thành Công Elite
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch7-l4',
  'module-tier-3-ch7',
  'course-tier3-trading-mastery',
  'Bài 7.4: Câu Chuyện Thành Công Elite',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 7.4: Câu Chuyện Thành Công Elite | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #10B981; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #10B981; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #10B981, #059669); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        ul { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #10B981; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .story-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #10B981; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .story-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
        .story-avatar { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #10B981, #059669); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
        .story-info h4 { color: #ffffff; font-size: 1.1rem; margin-bottom: 0.25rem; }
        .story-info .role { color: #10B981; font-size: 0.85rem; }
        .story-quote { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin: 1rem 0; font-style: italic; border-left: 3px solid #10B981; }
        .story-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-top: 1rem; }
        .story-stat { background: #0a0a0f; border-radius: 6px; padding: 0.75rem; text-align: center; }
        .story-stat .value { font-size: 1.25rem; font-weight: 700; color: #FFBD59; }
        .story-stat .label { font-size: 0.75rem; color: #a1a1aa; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .story-stats { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <span class="module-badge">MODULE B</span>
            <h1 class="lesson-title">Câu Chuyện Thành Công Elite</h1>
            <p class="lesson-subtitle">Success Stories - Những Người Đi Trước</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🌟</div>
            <h2 class="section-title">Học Từ Người Đi Trước</h2>
            <p>Dưới đây là những câu chuyện thực từ các Elite Members - những người đã hoàn thành hành trình như bạn và đang gặt hái thành quả.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Lưu ý:</strong> Tên đã được thay đổi để bảo vệ quyền riêng tư. Kết quả có thể khác nhau tùy theo nỗ lực và hoàn cảnh của mỗi người.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">👨‍💼</div>
            <h2 class="section-title">Câu Chuyện #1: Trading Success</h2>

            <div class="story-card">
                <div class="story-header">
                    <div class="story-avatar">M</div>
                    <div class="story-info">
                        <h4>Minh T.</h4>
                        <span class="role">Elite Trader - Tier 3 Graduate</span>
                    </div>
                </div>

                <p><strong>Background:</strong> Nhân viên văn phòng, bắt đầu trade với 20 triệu vốn.</p>

                <div class="story-quote">
                    "Trước khi học GEM, tôi đã mất gần 50% portfolio vì trade theo cảm tính. Sau khi áp dụng 24 patterns và risk management, account của tôi đã recover và grow consistently."
                </div>

                <p><strong>Kết quả sau 6 tháng:</strong></p>
                <div class="story-stats">
                    <div class="story-stat">
                        <div class="value">58%</div>
                        <div class="label">Win Rate</div>
                    </div>
                    <div class="story-stat">
                        <div class="value">2.1:1</div>
                        <div class="label">Avg R:R</div>
                    </div>
                    <div class="story-stat">
                        <div class="value">+45%</div>
                        <div class="label">Portfolio Growth</div>
                    </div>
                </div>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">👩‍💻</div>
            <h2 class="section-title">Câu Chuyện #2: Hybrid Success</h2>

            <div class="story-card" style="border-color: #FFBD59;">
                <div class="story-header">
                    <div class="story-avatar" style="background: linear-gradient(135deg, #FFBD59, #F59E0B);">L</div>
                    <div class="story-info">
                        <h4>Linh N.</h4>
                        <span class="role" style="color: #FFBD59;">Đại Đối Tác + Trader</span>
                    </div>
                </div>

                <p><strong>Background:</strong> Influencer nhỏ về tài chính, muốn tạo thêm nguồn thu nhập.</p>

                <div class="story-quote" style="border-left-color: #FFBD59;">
                    "Tôi chọn con đường Hybrid - vừa trade vừa làm affiliate. Trading income giúp tôi có case studies thực tế để chia sẻ, và affiliate income tạo thêm nguồn passive."
                </div>

                <p><strong>Kết quả sau 8 tháng:</strong></p>
                <div class="story-stats">
                    <div class="story-stat">
                        <div class="value">15M</div>
                        <div class="label">Trading/tháng</div>
                    </div>
                    <div class="story-stat">
                        <div class="value">25M</div>
                        <div class="label">Affiliate/tháng</div>
                    </div>
                    <div class="story-stat">
                        <div class="value">40M+</div>
                        <div class="label">Total Income</div>
                    </div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=Hybrid+Success+Model" alt="Hybrid Success">
                <p class="image-caption">Mô hình Hybrid - Trading + Affiliate</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🚀</div>
            <h2 class="section-title">Câu Chuyện #3: Pure Affiliate</h2>

            <div class="story-card" style="border-color: #8B5CF6;">
                <div class="story-header">
                    <div class="story-avatar" style="background: linear-gradient(135deg, #8B5CF6, #6D28D9);">H</div>
                    <div class="story-info">
                        <h4>Hoàng P.</h4>
                        <span class="role" style="color: #8B5CF6;">Đại Đối Tác Premium</span>
                    </div>
                </div>

                <p><strong>Background:</strong> Không có thời gian trade do công việc bận, nhưng có network rộng.</p>

                <div class="story-quote" style="border-left-color: #8B5CF6;">
                    "Tôi không trade nhiều vì bận công việc chính, nhưng tôi có network và tin vào chất lượng của GEM. Affiliate income giờ đã vượt lương chính của tôi."
                </div>

                <p><strong>Kết quả sau 10 tháng:</strong></p>
                <div class="story-stats">
                    <div class="story-stat">
                        <div class="value">45</div>
                        <div class="label">Referrals</div>
                    </div>
                    <div class="story-stat">
                        <div class="value">50%</div>
                        <div class="label">Commission</div>
                    </div>
                    <div class="story-stat">
                        <div class="value">60M+</div>
                        <div class="label">Total Earnings</div>
                    </div>
                </div>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📝</div>
            <h2 class="section-title">Bài Học Chung</h2>
            <p>Từ những câu chuyện trên, có một số điểm chung:</p>

            <ul>
                <li><strong>Kiên nhẫn:</strong> Thành công không đến ngay lập tức, cần thời gian để áp dụng</li>
                <li><strong>Hệ thống:</strong> Những người thành công đều có hệ thống rõ ràng</li>
                <li><strong>Linh hoạt:</strong> Chọn con đường phù hợp với hoàn cảnh của mình</li>
                <li><strong>Cộng đồng:</strong> Tham gia cộng đồng, học hỏi từ người khác</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🎯 Remember:</strong> Những người này cũng bắt đầu từ Bài 1.1 như bạn. Sự khác biệt là họ đã hoàn thành hành trình và hành động.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Success+Path+Visualization" alt="Success Path">
                <p class="image-caption">Mỗi người có con đường khác nhau, nhưng đều bắt đầu từ cùng một nơi</p>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite - Module B</p>
            <p>© 2024 GEM Trading. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>
',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 7.4: Câu Chuyện Thành Công Elite | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #10B981; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #10B981; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #10B981, #059669); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        ul { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #10B981; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .story-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #10B981; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .story-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
        .story-avatar { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #10B981, #059669); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
        .story-info h4 { color: #ffffff; font-size: 1.1rem; margin-bottom: 0.25rem; }
        .story-info .role { color: #10B981; font-size: 0.85rem; }
        .story-quote { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin: 1rem 0; font-style: italic; border-left: 3px solid #10B981; }
        .story-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-top: 1rem; }
        .story-stat { background: #0a0a0f; border-radius: 6px; padding: 0.75rem; text-align: center; }
        .story-stat .value { font-size: 1.25rem; font-weight: 700; color: #FFBD59; }
        .story-stat .label { font-size: 0.75rem; color: #a1a1aa; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .story-stats { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <span class="module-badge">MODULE B</span>
            <h1 class="lesson-title">Câu Chuyện Thành Công Elite</h1>
            <p class="lesson-subtitle">Success Stories - Những Người Đi Trước</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🌟</div>
            <h2 class="section-title">Học Từ Người Đi Trước</h2>
            <p>Dưới đây là những câu chuyện thực từ các Elite Members - những người đã hoàn thành hành trình như bạn và đang gặt hái thành quả.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Lưu ý:</strong> Tên đã được thay đổi để bảo vệ quyền riêng tư. Kết quả có thể khác nhau tùy theo nỗ lực và hoàn cảnh của mỗi người.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">👨‍💼</div>
            <h2 class="section-title">Câu Chuyện #1: Trading Success</h2>

            <div class="story-card">
                <div class="story-header">
                    <div class="story-avatar">M</div>
                    <div class="story-info">
                        <h4>Minh T.</h4>
                        <span class="role">Elite Trader - Tier 3 Graduate</span>
                    </div>
                </div>

                <p><strong>Background:</strong> Nhân viên văn phòng, bắt đầu trade với 20 triệu vốn.</p>

                <div class="story-quote">
                    "Trước khi học GEM, tôi đã mất gần 50% portfolio vì trade theo cảm tính. Sau khi áp dụng 24 patterns và risk management, account của tôi đã recover và grow consistently."
                </div>

                <p><strong>Kết quả sau 6 tháng:</strong></p>
                <div class="story-stats">
                    <div class="story-stat">
                        <div class="value">58%</div>
                        <div class="label">Win Rate</div>
                    </div>
                    <div class="story-stat">
                        <div class="value">2.1:1</div>
                        <div class="label">Avg R:R</div>
                    </div>
                    <div class="story-stat">
                        <div class="value">+45%</div>
                        <div class="label">Portfolio Growth</div>
                    </div>
                </div>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">👩‍💻</div>
            <h2 class="section-title">Câu Chuyện #2: Hybrid Success</h2>

            <div class="story-card" style="border-color: #FFBD59;">
                <div class="story-header">
                    <div class="story-avatar" style="background: linear-gradient(135deg, #FFBD59, #F59E0B);">L</div>
                    <div class="story-info">
                        <h4>Linh N.</h4>
                        <span class="role" style="color: #FFBD59;">Đại Đối Tác + Trader</span>
                    </div>
                </div>

                <p><strong>Background:</strong> Influencer nhỏ về tài chính, muốn tạo thêm nguồn thu nhập.</p>

                <div class="story-quote" style="border-left-color: #FFBD59;">
                    "Tôi chọn con đường Hybrid - vừa trade vừa làm affiliate. Trading income giúp tôi có case studies thực tế để chia sẻ, và affiliate income tạo thêm nguồn passive."
                </div>

                <p><strong>Kết quả sau 8 tháng:</strong></p>
                <div class="story-stats">
                    <div class="story-stat">
                        <div class="value">15M</div>
                        <div class="label">Trading/tháng</div>
                    </div>
                    <div class="story-stat">
                        <div class="value">25M</div>
                        <div class="label">Affiliate/tháng</div>
                    </div>
                    <div class="story-stat">
                        <div class="value">40M+</div>
                        <div class="label">Total Income</div>
                    </div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=Hybrid+Success+Model" alt="Hybrid Success">
                <p class="image-caption">Mô hình Hybrid - Trading + Affiliate</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🚀</div>
            <h2 class="section-title">Câu Chuyện #3: Pure Affiliate</h2>

            <div class="story-card" style="border-color: #8B5CF6;">
                <div class="story-header">
                    <div class="story-avatar" style="background: linear-gradient(135deg, #8B5CF6, #6D28D9);">H</div>
                    <div class="story-info">
                        <h4>Hoàng P.</h4>
                        <span class="role" style="color: #8B5CF6;">Đại Đối Tác Premium</span>
                    </div>
                </div>

                <p><strong>Background:</strong> Không có thời gian trade do công việc bận, nhưng có network rộng.</p>

                <div class="story-quote" style="border-left-color: #8B5CF6;">
                    "Tôi không trade nhiều vì bận công việc chính, nhưng tôi có network và tin vào chất lượng của GEM. Affiliate income giờ đã vượt lương chính của tôi."
                </div>

                <p><strong>Kết quả sau 10 tháng:</strong></p>
                <div class="story-stats">
                    <div class="story-stat">
                        <div class="value">45</div>
                        <div class="label">Referrals</div>
                    </div>
                    <div class="story-stat">
                        <div class="value">50%</div>
                        <div class="label">Commission</div>
                    </div>
                    <div class="story-stat">
                        <div class="value">60M+</div>
                        <div class="label">Total Earnings</div>
                    </div>
                </div>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📝</div>
            <h2 class="section-title">Bài Học Chung</h2>
            <p>Từ những câu chuyện trên, có một số điểm chung:</p>

            <ul>
                <li><strong>Kiên nhẫn:</strong> Thành công không đến ngay lập tức, cần thời gian để áp dụng</li>
                <li><strong>Hệ thống:</strong> Những người thành công đều có hệ thống rõ ràng</li>
                <li><strong>Linh hoạt:</strong> Chọn con đường phù hợp với hoàn cảnh của mình</li>
                <li><strong>Cộng đồng:</strong> Tham gia cộng đồng, học hỏi từ người khác</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🎯 Remember:</strong> Những người này cũng bắt đầu từ Bài 1.1 như bạn. Sự khác biệt là họ đã hoàn thành hành trình và hành động.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Success+Path+Visualization" alt="Success Path">
                <p class="image-caption">Mỗi người có con đường khác nhau, nhưng đều bắt đầu từ cùng một nơi</p>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite - Module B</p>
            <p>© 2024 GEM Trading. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>
',
  4,
  15,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  html_content = EXCLUDED.html_content,
  content = EXCLUDED.content,
  updated_at = NOW();

-- Lesson 7.5: Lợi Thế Đi Sớm
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch7-l5',
  'module-tier-3-ch7',
  'course-tier3-trading-mastery',
  'Bài 7.5: Lợi Thế Đi Sớm',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 7.5: Lợi Thế Đi Sớm | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #EF4444; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #EF4444; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #EF4444, #DC2626); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(239,68,68,0.1), rgba(220,38,38,0.1)); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        ul { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #EF4444; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .urgency-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #EF4444; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .urgency-card h4 { color: #EF4444; font-size: 1.1rem; margin-bottom: 0.75rem; }
        .timeline-item { display: flex; gap: 1rem; margin: 1rem 0; }
        .timeline-icon { width: 40px; height: 40px; border-radius: 50%; background: #EF4444; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .timeline-content h5 { color: #ffffff; margin-bottom: 0.25rem; }
        .timeline-content p { margin-bottom: 0; font-size: 0.9rem; }
        .advantage-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .advantage-card { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; border-top: 3px solid #10B981; }
        .advantage-card h5 { color: #10B981; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .advantage-card p { font-size: 0.9rem; margin-bottom: 0; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .advantage-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <span class="module-badge">MODULE B</span>
            <h1 class="lesson-title">Lợi Thế Đi Sớm</h1>
            <p class="lesson-subtitle">First Mover Advantage - Cơ Hội Không Chờ Đợi</p>
        </header>

        <section class="content-section">
            <div class="section-icon">⏰</div>
            <h2 class="section-title">Tại Sao Thời Điểm Quan Trọng?</h2>
            <p>Trong cả trading và affiliate, <strong style="color: #EF4444;">thời điểm là tất cả</strong>. Những người hành động sớm luôn có lợi thế so với những người đến sau.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 First Mover Advantage:</strong> Người đi trước có cơ hội thiết lập vị thế, xây dựng network, và tận dụng momentum trước khi thị trường bão hòa.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/EF4444?text=First+Mover+Advantage" alt="First Mover">
                <p class="image-caption">Lợi thế của người đi trước</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Thị Trường Đang Thay Đổi</h2>

            <div class="urgency-card">
                <h4>🔥 Crypto Education Boom</h4>
                <p>Thị trường giáo dục crypto đang bùng nổ. Ngày càng nhiều người muốn học trading, và nhu cầu này sẽ chỉ tăng lên trong thời gian tới.</p>
            </div>

            <div class="timeline-item">
                <div class="timeline-icon">📈</div>
                <div class="timeline-content">
                    <h5>2020-2022: Early Adopters</h5>
                    <p>Những người đầu tiên học crypto trading có lợi thế lớn trong bull run.</p>
                </div>
            </div>

            <div class="timeline-item">
                <div class="timeline-icon">🚀</div>
                <div class="timeline-content">
                    <h5>2023-2024: Growth Phase</h5>
                    <p>Thị trường education phát triển, nhiều người bắt đầu tìm kiếm khóa học chất lượng.</p>
                </div>
            </div>

            <div class="timeline-item">
                <div class="timeline-icon">⭐</div>
                <div class="timeline-content">
                    <h5>2025+: Mass Adoption</h5>
                    <p>Crypto trở nên mainstream, demand cho education sẽ bùng nổ.</p>
                </div>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">✅</div>
            <h2 class="section-title">Lợi Thế Của Bạn</h2>
            <p>Là Elite Member hoàn thành Tier 3, bạn có những lợi thế mà người đến sau không có:</p>

            <div class="advantage-grid">
                <div class="advantage-card">
                    <h5>🎓 Kiến Thức Đầy Đủ</h5>
                    <p>24 patterns + AI + Whale tracking. Bộ công cụ hoàn chỉnh.</p>
                </div>
                <div class="advantage-card">
                    <h5>📜 Chứng Nhận Elite</h5>
                    <p>Certificate xác nhận bạn là Elite Trader.</p>
                </div>
                <div class="advantage-card">
                    <h5>💰 Commission Cao</h5>
                    <p>Đủ điều kiện cho Đại Đối Tác với 50% commission.</p>
                </div>
                <div class="advantage-card">
                    <h5>🌐 Network Sớm</h5>
                    <p>Xây dựng network trước khi thị trường đông đúc.</p>
                </div>
            </div>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🎯 Key Insight:</strong> Những lợi thế này chỉ có giá trị khi bạn hành động. Kiến thức không dùng = không có giá trị.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⚠️</div>
            <h2 class="section-title">Chi Phí Của Việc Chờ Đợi</h2>
            <p>Mỗi ngày chờ đợi có chi phí thực sự:</p>

            <ul>
                <li><strong>Missed Trades:</strong> Bỏ lỡ setup có lợi nhuận mỗi ngày</li>
                <li><strong>Missed Referrals:</strong> Người khác chiếm network của bạn</li>
                <li><strong>Knowledge Decay:</strong> Kiến thức không dùng sẽ quên</li>
                <li><strong>Market Changes:</strong> Thị trường thay đổi nhanh chóng</li>
            </ul>

            <div class="urgency-card" style="border-color: #FFBD59;">
                <h4 style="color: #FFBD59;">💭 Suy Nghĩ Về Điều Này</h4>
                <p style="margin-bottom: 0;">Nếu bạn bắt đầu trade từ hôm nay với 1% lợi nhuận/tuần (hoàn toàn khả thi với GEM system), sau 1 năm bạn có thể tăng portfolio 67%. Mỗi tuần chờ đợi là 1% mất đi.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=Opportunity+Cost+Chart" alt="Opportunity Cost">
                <p class="image-caption">Chi phí cơ hội của việc chờ đợi</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🚀</div>
            <h2 class="section-title">Hành Động Ngay</h2>
            <p>Đây là những gì bạn có thể làm ngay hôm nay:</p>

            <ul>
                <li><strong>Trading:</strong> Mở TradingView, apply 1 pattern bạn vừa học vào chart</li>
                <li><strong>Affiliate:</strong> Đăng ký chương trình đối tác trong app GEM</li>
                <li><strong>Community:</strong> Tham gia group Telegram Elite Members</li>
                <li><strong>Practice:</strong> Paper trade 1 setup ngay hôm nay</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🔥 Remember:</strong> "The best time to plant a tree was 20 years ago. The second best time is now." Không có thời điểm hoàn hảo - chỉ có thời điểm bạn bắt đầu.</p>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite - Module B</p>
            <p>© 2024 GEM Trading. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>
',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 7.5: Lợi Thế Đi Sớm | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #EF4444; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #EF4444; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #EF4444, #DC2626); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(239,68,68,0.1), rgba(220,38,38,0.1)); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        ul { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #EF4444; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .urgency-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #EF4444; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .urgency-card h4 { color: #EF4444; font-size: 1.1rem; margin-bottom: 0.75rem; }
        .timeline-item { display: flex; gap: 1rem; margin: 1rem 0; }
        .timeline-icon { width: 40px; height: 40px; border-radius: 50%; background: #EF4444; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .timeline-content h5 { color: #ffffff; margin-bottom: 0.25rem; }
        .timeline-content p { margin-bottom: 0; font-size: 0.9rem; }
        .advantage-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .advantage-card { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; border-top: 3px solid #10B981; }
        .advantage-card h5 { color: #10B981; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .advantage-card p { font-size: 0.9rem; margin-bottom: 0; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .advantage-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <span class="module-badge">MODULE B</span>
            <h1 class="lesson-title">Lợi Thế Đi Sớm</h1>
            <p class="lesson-subtitle">First Mover Advantage - Cơ Hội Không Chờ Đợi</p>
        </header>

        <section class="content-section">
            <div class="section-icon">⏰</div>
            <h2 class="section-title">Tại Sao Thời Điểm Quan Trọng?</h2>
            <p>Trong cả trading và affiliate, <strong style="color: #EF4444;">thời điểm là tất cả</strong>. Những người hành động sớm luôn có lợi thế so với những người đến sau.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 First Mover Advantage:</strong> Người đi trước có cơ hội thiết lập vị thế, xây dựng network, và tận dụng momentum trước khi thị trường bão hòa.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/EF4444?text=First+Mover+Advantage" alt="First Mover">
                <p class="image-caption">Lợi thế của người đi trước</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Thị Trường Đang Thay Đổi</h2>

            <div class="urgency-card">
                <h4>🔥 Crypto Education Boom</h4>
                <p>Thị trường giáo dục crypto đang bùng nổ. Ngày càng nhiều người muốn học trading, và nhu cầu này sẽ chỉ tăng lên trong thời gian tới.</p>
            </div>

            <div class="timeline-item">
                <div class="timeline-icon">📈</div>
                <div class="timeline-content">
                    <h5>2020-2022: Early Adopters</h5>
                    <p>Những người đầu tiên học crypto trading có lợi thế lớn trong bull run.</p>
                </div>
            </div>

            <div class="timeline-item">
                <div class="timeline-icon">🚀</div>
                <div class="timeline-content">
                    <h5>2023-2024: Growth Phase</h5>
                    <p>Thị trường education phát triển, nhiều người bắt đầu tìm kiếm khóa học chất lượng.</p>
                </div>
            </div>

            <div class="timeline-item">
                <div class="timeline-icon">⭐</div>
                <div class="timeline-content">
                    <h5>2025+: Mass Adoption</h5>
                    <p>Crypto trở nên mainstream, demand cho education sẽ bùng nổ.</p>
                </div>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">✅</div>
            <h2 class="section-title">Lợi Thế Của Bạn</h2>
            <p>Là Elite Member hoàn thành Tier 3, bạn có những lợi thế mà người đến sau không có:</p>

            <div class="advantage-grid">
                <div class="advantage-card">
                    <h5>🎓 Kiến Thức Đầy Đủ</h5>
                    <p>24 patterns + AI + Whale tracking. Bộ công cụ hoàn chỉnh.</p>
                </div>
                <div class="advantage-card">
                    <h5>📜 Chứng Nhận Elite</h5>
                    <p>Certificate xác nhận bạn là Elite Trader.</p>
                </div>
                <div class="advantage-card">
                    <h5>💰 Commission Cao</h5>
                    <p>Đủ điều kiện cho Đại Đối Tác với 50% commission.</p>
                </div>
                <div class="advantage-card">
                    <h5>🌐 Network Sớm</h5>
                    <p>Xây dựng network trước khi thị trường đông đúc.</p>
                </div>
            </div>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🎯 Key Insight:</strong> Những lợi thế này chỉ có giá trị khi bạn hành động. Kiến thức không dùng = không có giá trị.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⚠️</div>
            <h2 class="section-title">Chi Phí Của Việc Chờ Đợi</h2>
            <p>Mỗi ngày chờ đợi có chi phí thực sự:</p>

            <ul>
                <li><strong>Missed Trades:</strong> Bỏ lỡ setup có lợi nhuận mỗi ngày</li>
                <li><strong>Missed Referrals:</strong> Người khác chiếm network của bạn</li>
                <li><strong>Knowledge Decay:</strong> Kiến thức không dùng sẽ quên</li>
                <li><strong>Market Changes:</strong> Thị trường thay đổi nhanh chóng</li>
            </ul>

            <div class="urgency-card" style="border-color: #FFBD59;">
                <h4 style="color: #FFBD59;">💭 Suy Nghĩ Về Điều Này</h4>
                <p style="margin-bottom: 0;">Nếu bạn bắt đầu trade từ hôm nay với 1% lợi nhuận/tuần (hoàn toàn khả thi với GEM system), sau 1 năm bạn có thể tăng portfolio 67%. Mỗi tuần chờ đợi là 1% mất đi.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=Opportunity+Cost+Chart" alt="Opportunity Cost">
                <p class="image-caption">Chi phí cơ hội của việc chờ đợi</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🚀</div>
            <h2 class="section-title">Hành Động Ngay</h2>
            <p>Đây là những gì bạn có thể làm ngay hôm nay:</p>

            <ul>
                <li><strong>Trading:</strong> Mở TradingView, apply 1 pattern bạn vừa học vào chart</li>
                <li><strong>Affiliate:</strong> Đăng ký chương trình đối tác trong app GEM</li>
                <li><strong>Community:</strong> Tham gia group Telegram Elite Members</li>
                <li><strong>Practice:</strong> Paper trade 1 setup ngay hôm nay</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🔥 Remember:</strong> "The best time to plant a tree was 20 years ago. The second best time is now." Không có thời điểm hoàn hảo - chỉ có thời điểm bạn bắt đầu.</p>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite - Module B</p>
            <p>© 2024 GEM Trading. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>
',
  5,
  15,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  html_content = EXCLUDED.html_content,
  content = EXCLUDED.content,
  updated_at = NOW();

-- Lesson 7.6: Khung Quyết Định
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch7-l6',
  'module-tier-3-ch7',
  'course-tier3-trading-mastery',
  'Bài 7.6: Khung Quyết Định',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 7.6: Khung Quyết Định | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #6366F1; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #6366F1; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #6366F1, #4F46E5); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(79,70,229,0.1)); border: 1px solid rgba(99,102,241,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        ul { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #6366F1; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .decision-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #6366F1; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .decision-card h4 { color: #6366F1; font-size: 1.1rem; margin-bottom: 0.75rem; }
        .question-item { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin: 0.75rem 0; display: flex; align-items: flex-start; gap: 0.75rem; }
        .question-number { width: 30px; height: 30px; border-radius: 50%; background: #6366F1; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
        .question-text { flex: 1; }
        .question-text h5 { color: #ffffff; margin-bottom: 0.25rem; }
        .question-text p { margin-bottom: 0; font-size: 0.9rem; color: #a1a1aa; }
        .path-comparison { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1rem 0; }
        .path-card { background: #1a1a2e; border-radius: 8px; padding: 1rem; text-align: center; border-top: 3px solid #6366F1; }
        .path-card .icon { font-size: 2rem; margin-bottom: 0.5rem; }
        .path-card h5 { color: #ffffff; margin-bottom: 0.5rem; }
        .path-card p { font-size: 0.85rem; margin-bottom: 0; }
        .path-card.recommended { border-top-color: #10B981; background: linear-gradient(135deg, rgba(16,185,129,0.1), #1a1a2e); }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .path-comparison { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <span class="module-badge">MODULE B</span>
            <h1 class="lesson-title">Khung Quyết Định</h1>
            <p class="lesson-subtitle">Decision Framework - Chọn Con Đường Của Bạn</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🧭</div>
            <h2 class="section-title">Framework Để Quyết Định</h2>
            <p>Trước khi quyết định con đường nào phù hợp, hãy sử dụng framework này để đánh giá hoàn cảnh của bạn một cách khách quan.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Nguyên tắc:</strong> Không có con đường nào "tốt hơn" - chỉ có con đường phù hợp hơn với bạn. Framework này giúp bạn tìm ra đường đi của mình.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">❓</div>
            <h2 class="section-title">5 Câu Hỏi Quan Trọng</h2>

            <div class="question-item">
                <div class="question-number">1</div>
                <div class="question-text">
                    <h5>Bạn có bao nhiêu thời gian mỗi ngày?</h5>
                    <p>< 1 giờ = Affiliate focus | 1-3 giờ = Hybrid | > 3 giờ = Trading focus</p>
                </div>
            </div>

            <div class="question-item">
                <div class="question-number">2</div>
                <div class="question-text">
                    <h5>Bạn có vốn bao nhiêu để trade?</h5>
                    <p>< 10M = Affiliate trước | 10-50M = Hybrid | > 50M = Trading focus</p>
                </div>
            </div>

            <div class="question-item">
                <div class="question-number">3</div>
                <div class="question-text">
                    <h5>Network của bạn như thế nào?</h5>
                    <p>Không có network = Trading | Có network nhỏ = Hybrid | Network lớn = Affiliate</p>
                </div>
            </div>

            <div class="question-item">
                <div class="question-number">4</div>
                <div class="question-text">
                    <h5>Bạn thích gì hơn: Phân tích hay Giao tiếp?</h5>
                    <p>Phân tích = Trading | Cả hai = Hybrid | Giao tiếp = Affiliate</p>
                </div>
            </div>

            <div class="question-item">
                <div class="question-number">5</div>
                <div class="question-text">
                    <h5>Mục tiêu thu nhập của bạn?</h5>
                    <p>Active income = Trading | Passive income = Affiliate | Both = Hybrid</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/6366F1?text=Decision+Framework+Flowchart" alt="Decision Framework">
                <p class="image-caption">Flowchart giúp bạn quyết định</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🛤️</div>
            <h2 class="section-title">3 Con Đường - So Sánh</h2>

            <div class="path-comparison">
                <div class="path-card">
                    <div class="icon">🎯</div>
                    <h5>Independent Trader</h5>
                    <p>100% focus vào trading, tối đa hóa profits từ market</p>
                </div>
                <div class="path-card">
                    <div class="icon">💼</div>
                    <h5>Pure Affiliate</h5>
                    <p>100% focus vào referrals, passive income từ network</p>
                </div>
                <div class="path-card recommended">
                    <div class="icon">🚀</div>
                    <h5>Hybrid (Recommended)</h5>
                    <p>Kết hợp trading + affiliate để maximize total income</p>
                </div>
            </div>

            <div class="decision-card">
                <h4>📊 So Sánh Chi Tiết</h4>
                <table style="width: 100%; margin-top: 0.5rem; font-size: 0.9rem;">
                    <tr style="border-bottom: 1px solid #27272a;">
                        <td style="padding: 0.5rem; color: #a1a1aa;">Tiêu chí</td>
                        <td style="padding: 0.5rem; color: #6366F1;">Trader</td>
                        <td style="padding: 0.5rem; color: #FFBD59;">Affiliate</td>
                        <td style="padding: 0.5rem; color: #10B981;">Hybrid</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #27272a;">
                        <td style="padding: 0.5rem;">Thời gian cần</td>
                        <td style="padding: 0.5rem;">Cao</td>
                        <td style="padding: 0.5rem;">Thấp</td>
                        <td style="padding: 0.5rem;">Trung bình</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #27272a;">
                        <td style="padding: 0.5rem;">Vốn ban đầu</td>
                        <td style="padding: 0.5rem;">Cần vốn</td>
                        <td style="padding: 0.5rem;">Không cần</td>
                        <td style="padding: 0.5rem;">Linh hoạt</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #27272a;">
                        <td style="padding: 0.5rem;">Rủi ro</td>
                        <td style="padding: 0.5rem;">Cao hơn</td>
                        <td style="padding: 0.5rem;">Thấp</td>
                        <td style="padding: 0.5rem;">Cân bằng</td>
                    </tr>
                    <tr>
                        <td style="padding: 0.5rem;">Tiềm năng</td>
                        <td style="padding: 0.5rem;">Unlimited</td>
                        <td style="padding: 0.5rem;">Network-based</td>
                        <td style="padding: 0.5rem;">Dual streams</td>
                    </tr>
                </table>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">✅</div>
            <h2 class="section-title">Gợi Ý Theo Profile</h2>

            <div class="decision-card" style="border-color: #6366F1;">
                <h4 style="color: #6366F1;">👤 Profile A: Full-time Available</h4>
                <p>Có thời gian > 3 giờ/ngày, có vốn để trade, thích phân tích.</p>
                <p style="margin-bottom: 0;"><strong>Gợi ý:</strong> Trading Focus (70%) + Affiliate Side (30%)</p>
            </div>

            <div class="decision-card" style="border-color: #FFBD59;">
                <h4 style="color: #FFBD59;">👤 Profile B: Part-time / Busy</h4>
                <p>Có việc làm chính, network tốt, thời gian hạn chế.</p>
                <p style="margin-bottom: 0;"><strong>Gợi ý:</strong> Affiliate Focus (70%) + Paper Trading (30%)</p>
            </div>

            <div class="decision-card" style="border-color: #10B981;">
                <h4 style="color: #10B981;">👤 Profile C: Balanced</h4>
                <p>Có thời gian vừa phải, có network, muốn đa dạng hóa.</p>
                <p style="margin-bottom: 0;"><strong>Gợi ý:</strong> Hybrid 50/50 - Trading + Affiliate song song</p>
            </div>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🎯 Pro Tip:</strong> Bắt đầu với Hybrid là lựa chọn an toàn nhất. Bạn có thể điều chỉnh tỷ lệ sau khi có trải nghiệm thực tế.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📝</div>
            <h2 class="section-title">Bài Tập: Tự Đánh Giá</h2>
            <p>Hãy trả lời 5 câu hỏi ở trên và viết ra:</p>

            <ul>
                <li><strong>Thời gian:</strong> Tôi có ___ giờ/ngày</li>
                <li><strong>Vốn:</strong> Tôi có ___ triệu để trade</li>
                <li><strong>Network:</strong> Tôi có khoảng ___ người trong network</li>
                <li><strong>Preference:</strong> Tôi thích ___ hơn</li>
                <li><strong>Goal:</strong> Mục tiêu thu nhập của tôi là ___</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💭 Kết Luận:</strong> Dựa trên câu trả lời, con đường phù hợp nhất với tôi là: _______________</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Your+Personal+Path" alt="Personal Path">
                <p class="image-caption">Con đường của bạn là duy nhất</p>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite - Module B</p>
            <p>© 2024 GEM Trading. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>
',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 7.6: Khung Quyết Định | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #6366F1; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #6366F1; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #6366F1, #4F46E5); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(79,70,229,0.1)); border: 1px solid rgba(99,102,241,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        ul { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #6366F1; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .decision-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #6366F1; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .decision-card h4 { color: #6366F1; font-size: 1.1rem; margin-bottom: 0.75rem; }
        .question-item { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin: 0.75rem 0; display: flex; align-items: flex-start; gap: 0.75rem; }
        .question-number { width: 30px; height: 30px; border-radius: 50%; background: #6366F1; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
        .question-text { flex: 1; }
        .question-text h5 { color: #ffffff; margin-bottom: 0.25rem; }
        .question-text p { margin-bottom: 0; font-size: 0.9rem; color: #a1a1aa; }
        .path-comparison { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1rem 0; }
        .path-card { background: #1a1a2e; border-radius: 8px; padding: 1rem; text-align: center; border-top: 3px solid #6366F1; }
        .path-card .icon { font-size: 2rem; margin-bottom: 0.5rem; }
        .path-card h5 { color: #ffffff; margin-bottom: 0.5rem; }
        .path-card p { font-size: 0.85rem; margin-bottom: 0; }
        .path-card.recommended { border-top-color: #10B981; background: linear-gradient(135deg, rgba(16,185,129,0.1), #1a1a2e); }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .path-comparison { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <span class="module-badge">MODULE B</span>
            <h1 class="lesson-title">Khung Quyết Định</h1>
            <p class="lesson-subtitle">Decision Framework - Chọn Con Đường Của Bạn</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🧭</div>
            <h2 class="section-title">Framework Để Quyết Định</h2>
            <p>Trước khi quyết định con đường nào phù hợp, hãy sử dụng framework này để đánh giá hoàn cảnh của bạn một cách khách quan.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Nguyên tắc:</strong> Không có con đường nào "tốt hơn" - chỉ có con đường phù hợp hơn với bạn. Framework này giúp bạn tìm ra đường đi của mình.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">❓</div>
            <h2 class="section-title">5 Câu Hỏi Quan Trọng</h2>

            <div class="question-item">
                <div class="question-number">1</div>
                <div class="question-text">
                    <h5>Bạn có bao nhiêu thời gian mỗi ngày?</h5>
                    <p>< 1 giờ = Affiliate focus | 1-3 giờ = Hybrid | > 3 giờ = Trading focus</p>
                </div>
            </div>

            <div class="question-item">
                <div class="question-number">2</div>
                <div class="question-text">
                    <h5>Bạn có vốn bao nhiêu để trade?</h5>
                    <p>< 10M = Affiliate trước | 10-50M = Hybrid | > 50M = Trading focus</p>
                </div>
            </div>

            <div class="question-item">
                <div class="question-number">3</div>
                <div class="question-text">
                    <h5>Network của bạn như thế nào?</h5>
                    <p>Không có network = Trading | Có network nhỏ = Hybrid | Network lớn = Affiliate</p>
                </div>
            </div>

            <div class="question-item">
                <div class="question-number">4</div>
                <div class="question-text">
                    <h5>Bạn thích gì hơn: Phân tích hay Giao tiếp?</h5>
                    <p>Phân tích = Trading | Cả hai = Hybrid | Giao tiếp = Affiliate</p>
                </div>
            </div>

            <div class="question-item">
                <div class="question-number">5</div>
                <div class="question-text">
                    <h5>Mục tiêu thu nhập của bạn?</h5>
                    <p>Active income = Trading | Passive income = Affiliate | Both = Hybrid</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/6366F1?text=Decision+Framework+Flowchart" alt="Decision Framework">
                <p class="image-caption">Flowchart giúp bạn quyết định</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🛤️</div>
            <h2 class="section-title">3 Con Đường - So Sánh</h2>

            <div class="path-comparison">
                <div class="path-card">
                    <div class="icon">🎯</div>
                    <h5>Independent Trader</h5>
                    <p>100% focus vào trading, tối đa hóa profits từ market</p>
                </div>
                <div class="path-card">
                    <div class="icon">💼</div>
                    <h5>Pure Affiliate</h5>
                    <p>100% focus vào referrals, passive income từ network</p>
                </div>
                <div class="path-card recommended">
                    <div class="icon">🚀</div>
                    <h5>Hybrid (Recommended)</h5>
                    <p>Kết hợp trading + affiliate để maximize total income</p>
                </div>
            </div>

            <div class="decision-card">
                <h4>📊 So Sánh Chi Tiết</h4>
                <table style="width: 100%; margin-top: 0.5rem; font-size: 0.9rem;">
                    <tr style="border-bottom: 1px solid #27272a;">
                        <td style="padding: 0.5rem; color: #a1a1aa;">Tiêu chí</td>
                        <td style="padding: 0.5rem; color: #6366F1;">Trader</td>
                        <td style="padding: 0.5rem; color: #FFBD59;">Affiliate</td>
                        <td style="padding: 0.5rem; color: #10B981;">Hybrid</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #27272a;">
                        <td style="padding: 0.5rem;">Thời gian cần</td>
                        <td style="padding: 0.5rem;">Cao</td>
                        <td style="padding: 0.5rem;">Thấp</td>
                        <td style="padding: 0.5rem;">Trung bình</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #27272a;">
                        <td style="padding: 0.5rem;">Vốn ban đầu</td>
                        <td style="padding: 0.5rem;">Cần vốn</td>
                        <td style="padding: 0.5rem;">Không cần</td>
                        <td style="padding: 0.5rem;">Linh hoạt</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #27272a;">
                        <td style="padding: 0.5rem;">Rủi ro</td>
                        <td style="padding: 0.5rem;">Cao hơn</td>
                        <td style="padding: 0.5rem;">Thấp</td>
                        <td style="padding: 0.5rem;">Cân bằng</td>
                    </tr>
                    <tr>
                        <td style="padding: 0.5rem;">Tiềm năng</td>
                        <td style="padding: 0.5rem;">Unlimited</td>
                        <td style="padding: 0.5rem;">Network-based</td>
                        <td style="padding: 0.5rem;">Dual streams</td>
                    </tr>
                </table>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">✅</div>
            <h2 class="section-title">Gợi Ý Theo Profile</h2>

            <div class="decision-card" style="border-color: #6366F1;">
                <h4 style="color: #6366F1;">👤 Profile A: Full-time Available</h4>
                <p>Có thời gian > 3 giờ/ngày, có vốn để trade, thích phân tích.</p>
                <p style="margin-bottom: 0;"><strong>Gợi ý:</strong> Trading Focus (70%) + Affiliate Side (30%)</p>
            </div>

            <div class="decision-card" style="border-color: #FFBD59;">
                <h4 style="color: #FFBD59;">👤 Profile B: Part-time / Busy</h4>
                <p>Có việc làm chính, network tốt, thời gian hạn chế.</p>
                <p style="margin-bottom: 0;"><strong>Gợi ý:</strong> Affiliate Focus (70%) + Paper Trading (30%)</p>
            </div>

            <div class="decision-card" style="border-color: #10B981;">
                <h4 style="color: #10B981;">👤 Profile C: Balanced</h4>
                <p>Có thời gian vừa phải, có network, muốn đa dạng hóa.</p>
                <p style="margin-bottom: 0;"><strong>Gợi ý:</strong> Hybrid 50/50 - Trading + Affiliate song song</p>
            </div>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🎯 Pro Tip:</strong> Bắt đầu với Hybrid là lựa chọn an toàn nhất. Bạn có thể điều chỉnh tỷ lệ sau khi có trải nghiệm thực tế.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📝</div>
            <h2 class="section-title">Bài Tập: Tự Đánh Giá</h2>
            <p>Hãy trả lời 5 câu hỏi ở trên và viết ra:</p>

            <ul>
                <li><strong>Thời gian:</strong> Tôi có ___ giờ/ngày</li>
                <li><strong>Vốn:</strong> Tôi có ___ triệu để trade</li>
                <li><strong>Network:</strong> Tôi có khoảng ___ người trong network</li>
                <li><strong>Preference:</strong> Tôi thích ___ hơn</li>
                <li><strong>Goal:</strong> Mục tiêu thu nhập của tôi là ___</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💭 Kết Luận:</strong> Dựa trên câu trả lời, con đường phù hợp nhất với tôi là: _______________</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Your+Personal+Path" alt="Personal Path">
                <p class="image-caption">Con đường của bạn là duy nhất</p>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite - Module B</p>
            <p>© 2024 GEM Trading. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>
',
  6,
  15,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  html_content = EXCLUDED.html_content,
  content = EXCLUDED.content,
  updated_at = NOW();

-- Lesson 7.7: Các Bước Tiếp Theo
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch7-l7',
  'module-tier-3-ch7',
  'course-tier3-trading-mastery',
  'Bài 7.7: Các Bước Tiếp Theo',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 7.7: Các Bước Tiếp Theo | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #10B981; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #10B981; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #10B981, #059669); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        ul { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #10B981; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .step-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #10B981; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .step-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
        .step-number { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #10B981, #059669); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; }
        .step-title { flex: 1; }
        .step-title h4 { color: #ffffff; font-size: 1.1rem; margin-bottom: 0.25rem; }
        .step-title .timing { color: #10B981; font-size: 0.85rem; }
        .action-list { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin-top: 0.75rem; }
        .action-item { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
        .action-item:last-child { margin-bottom: 0; }
        .action-item .checkbox { width: 20px; height: 20px; border: 2px solid #10B981; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
        .congratulations-banner { background: linear-gradient(135deg, #10B981, #059669); border-radius: 16px; padding: 2rem; text-align: center; margin: 1.5rem 0; }
        .congratulations-banner h3 { font-size: 1.75rem; margin-bottom: 0.5rem; }
        .congratulations-banner p { margin-bottom: 0; opacity: 0.9; }
        .cta-button { display: inline-block; background: #ffffff; color: #0a0a0f; padding: 1rem 2rem; border-radius: 8px; font-weight: 700; text-decoration: none; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <span class="module-badge">MODULE B</span>
            <h1 class="lesson-title">Các Bước Tiếp Theo</h1>
            <p class="lesson-subtitle">Your Action Plan - Từ Kiến Thức Đến Hành Động</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🎉</div>
            <h2 class="section-title">Chúc Mừng Bạn!</h2>

            <div class="congratulations-banner">
                <h3>🏆 ELITE TRADER CERTIFIED</h3>
                <p>Bạn đã hoàn thành toàn bộ hành trình GEM Trading Academy!</p>
            </div>

            <p>Đây là bước cuối cùng của khóa học, nhưng là bước đầu tiên trong hành trình thực sự của bạn. Hãy biến kiến thức thành hành động với plan cụ thể dưới đây.</p>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Graduation+Certificate" alt="Certificate">
                <p class="image-caption">Chứng nhận Elite Trader - GEM Trading Academy</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📅</div>
            <h2 class="section-title">Action Plan: 30 Ngày Đầu</h2>

            <div class="step-card">
                <div class="step-header">
                    <div class="step-number">1</div>
                    <div class="step-title">
                        <h4>Ngày 1-3: Foundation Setup</h4>
                        <span class="timing">⏰ 2-3 giờ tổng cộng</span>
                    </div>
                </div>
                <p>Thiết lập nền tảng để bắt đầu hành động ngay.</p>
                <div class="action-list">
                    <div class="action-item"><div class="checkbox">☐</div> Cài đặt TradingView với templates đã học</div>
                    <div class="action-item"><div class="checkbox">☐</div> Thiết lập trading journal (Excel/Notion)</div>
                    <div class="action-item"><div class="checkbox">☐</div> Đăng ký chương trình Affiliate trong app GEM</div>
                    <div class="action-item"><div class="checkbox">☐</div> Tham gia Telegram group Elite Members</div>
                </div>
            </div>

            <div class="step-card" style="border-color: #FFBD59;">
                <div class="step-header">
                    <div class="step-number" style="background: linear-gradient(135deg, #FFBD59, #F59E0B);">2</div>
                    <div class="step-title">
                        <h4>Ngày 4-10: Practice Week</h4>
                        <span class="timing" style="color: #FFBD59;">⏰ 30 phút/ngày</span>
                    </div>
                </div>
                <p>Tập luyện với paper trading trước khi vào real.</p>
                <div class="action-list">
                    <div class="action-item"><div class="checkbox">☐</div> Paper trade 1 setup mỗi ngày (bất kỳ pattern)</div>
                    <div class="action-item"><div class="checkbox">☐</div> Ghi chép vào journal mỗi trade</div>
                    <div class="action-item"><div class="checkbox">☐</div> Review kết quả cuối tuần</div>
                    <div class="action-item"><div class="checkbox">☐</div> Chia sẻ 1-2 post về journey trong group</div>
                </div>
            </div>

            <div class="step-card" style="border-color: #6366F1;">
                <div class="step-header">
                    <div class="step-number" style="background: linear-gradient(135deg, #6366F1, #4F46E5);">3</div>
                    <div class="step-title">
                        <h4>Ngày 11-20: Real Trading Start</h4>
                        <span class="timing" style="color: #6366F1;">⏰ 1 giờ/ngày</span>
                    </div>
                </div>
                <p>Bắt đầu trade real với position size nhỏ.</p>
                <div class="action-list">
                    <div class="action-item"><div class="checkbox">☐</div> Bắt đầu với 0.5% risk per trade</div>
                    <div class="action-item"><div class="checkbox">☐</div> Chỉ trade 2-3 patterns quen thuộc nhất</div>
                    <div class="action-item"><div class="checkbox">☐</div> Duy trì Karma score > 80</div>
                    <div class="action-item"><div class="checkbox">☐</div> Gửi affiliate link cho 5 người quan tâm</div>
                </div>
            </div>

            <div class="step-card" style="border-color: #8B5CF6;">
                <div class="step-header">
                    <div class="step-number" style="background: linear-gradient(135deg, #8B5CF6, #6D28D9);">4</div>
                    <div class="step-title">
                        <h4>Ngày 21-30: Optimize & Scale</h4>
                        <span class="timing" style="color: #8B5CF6;">⏰ Review weekly</span>
                    </div>
                </div>
                <p>Đánh giá và điều chỉnh strategy.</p>
                <div class="action-list">
                    <div class="action-item"><div class="checkbox">☐</div> Review trading stats: Win rate, R:R ratio</div>
                    <div class="action-item"><div class="checkbox">☐</div> Xác định patterns hiệu quả nhất với bạn</div>
                    <div class="action-item"><div class="checkbox">☐</div> Tăng dần position size nếu profitable</div>
                    <div class="action-item"><div class="checkbox">☐</div> Follow up với affiliate contacts</div>
                </div>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📞</div>
            <h2 class="section-title">Kết Nối & Hỗ Trợ</h2>
            <p>Bạn không đi một mình. Đây là các kênh hỗ trợ:</p>

            <ul>
                <li><strong>Telegram Elite:</strong> Group private cho Elite Members, chia sẻ signals và ideas</li>
                <li><strong>GEM Master AI:</strong> Chatbot trong app để hỏi đáp bất cứ lúc nào</li>
                <li><strong>Help Center:</strong> Trong app GEM Mobile → Help & Support</li>
                <li><strong>Email:</strong> support@gem-trading.com cho vấn đề cần hỗ trợ trực tiếp</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Pro Tip:</strong> Tham gia active trong community. Những Elite Members active nhất thường có kết quả tốt nhất!</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🎯</div>
            <h2 class="section-title">Lời Cuối</h2>
            <p>Bạn đã đi được một chặng đường dài. Từ người mới bắt đầu, bạn giờ đây là một <strong style="color: #10B981;">Elite Trader</strong> được trang bị đầy đủ:</p>

            <ul>
                <li><strong>24 Patterns:</strong> Để trade trong mọi điều kiện thị trường</li>
                <li><strong>AI & Technology:</strong> Để không bỏ lỡ cơ hội</li>
                <li><strong>Risk Management:</strong> Để bảo vệ và phát triển portfolio</li>
                <li><strong>Psychology:</strong> Để kiểm soát cảm xúc và trade có kỷ luật</li>
                <li><strong>Community:</strong> Để học hỏi và phát triển liên tục</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🙏 Cảm Ơn Bạn:</strong> Cảm ơn bạn đã tin tưởng GEM Trading Academy. Hành trình của bạn bắt đầu từ đây. Chúc bạn thành công!</p>
            </div>

            <div class="congratulations-banner" style="background: linear-gradient(135deg, #8B5CF6, #6D28D9);">
                <h3>🚀 LET''S START YOUR JOURNEY</h3>
                <p>Kiến thức đã đủ. Bây giờ là lúc hành động!</p>
                <a href="#" class="cta-button">Bắt Đầu Ngay →</a>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=Your+Elite+Journey+Begins" alt="Journey Begins">
                <p class="image-caption">Hành trình Elite của bạn bắt đầu từ đây!</p>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>🎓 Bạn đã hoàn thành GEM Trading Academy</p>
            <p>GEM Trading Academy - Tier 3 Elite - Module B</p>
            <p>© 2024 GEM Trading. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>
',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 7.7: Các Bước Tiếp Theo | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #10B981; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #10B981; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #10B981, #059669); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        ul { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #10B981; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .step-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #10B981; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .step-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
        .step-number { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #10B981, #059669); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; }
        .step-title { flex: 1; }
        .step-title h4 { color: #ffffff; font-size: 1.1rem; margin-bottom: 0.25rem; }
        .step-title .timing { color: #10B981; font-size: 0.85rem; }
        .action-list { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin-top: 0.75rem; }
        .action-item { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
        .action-item:last-child { margin-bottom: 0; }
        .action-item .checkbox { width: 20px; height: 20px; border: 2px solid #10B981; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
        .congratulations-banner { background: linear-gradient(135deg, #10B981, #059669); border-radius: 16px; padding: 2rem; text-align: center; margin: 1.5rem 0; }
        .congratulations-banner h3 { font-size: 1.75rem; margin-bottom: 0.5rem; }
        .congratulations-banner p { margin-bottom: 0; opacity: 0.9; }
        .cta-button { display: inline-block; background: #ffffff; color: #0a0a0f; padding: 1rem 2rem; border-radius: 8px; font-weight: 700; text-decoration: none; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <span class="module-badge">MODULE B</span>
            <h1 class="lesson-title">Các Bước Tiếp Theo</h1>
            <p class="lesson-subtitle">Your Action Plan - Từ Kiến Thức Đến Hành Động</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🎉</div>
            <h2 class="section-title">Chúc Mừng Bạn!</h2>

            <div class="congratulations-banner">
                <h3>🏆 ELITE TRADER CERTIFIED</h3>
                <p>Bạn đã hoàn thành toàn bộ hành trình GEM Trading Academy!</p>
            </div>

            <p>Đây là bước cuối cùng của khóa học, nhưng là bước đầu tiên trong hành trình thực sự của bạn. Hãy biến kiến thức thành hành động với plan cụ thể dưới đây.</p>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Graduation+Certificate" alt="Certificate">
                <p class="image-caption">Chứng nhận Elite Trader - GEM Trading Academy</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📅</div>
            <h2 class="section-title">Action Plan: 30 Ngày Đầu</h2>

            <div class="step-card">
                <div class="step-header">
                    <div class="step-number">1</div>
                    <div class="step-title">
                        <h4>Ngày 1-3: Foundation Setup</h4>
                        <span class="timing">⏰ 2-3 giờ tổng cộng</span>
                    </div>
                </div>
                <p>Thiết lập nền tảng để bắt đầu hành động ngay.</p>
                <div class="action-list">
                    <div class="action-item"><div class="checkbox">☐</div> Cài đặt TradingView với templates đã học</div>
                    <div class="action-item"><div class="checkbox">☐</div> Thiết lập trading journal (Excel/Notion)</div>
                    <div class="action-item"><div class="checkbox">☐</div> Đăng ký chương trình Affiliate trong app GEM</div>
                    <div class="action-item"><div class="checkbox">☐</div> Tham gia Telegram group Elite Members</div>
                </div>
            </div>

            <div class="step-card" style="border-color: #FFBD59;">
                <div class="step-header">
                    <div class="step-number" style="background: linear-gradient(135deg, #FFBD59, #F59E0B);">2</div>
                    <div class="step-title">
                        <h4>Ngày 4-10: Practice Week</h4>
                        <span class="timing" style="color: #FFBD59;">⏰ 30 phút/ngày</span>
                    </div>
                </div>
                <p>Tập luyện với paper trading trước khi vào real.</p>
                <div class="action-list">
                    <div class="action-item"><div class="checkbox">☐</div> Paper trade 1 setup mỗi ngày (bất kỳ pattern)</div>
                    <div class="action-item"><div class="checkbox">☐</div> Ghi chép vào journal mỗi trade</div>
                    <div class="action-item"><div class="checkbox">☐</div> Review kết quả cuối tuần</div>
                    <div class="action-item"><div class="checkbox">☐</div> Chia sẻ 1-2 post về journey trong group</div>
                </div>
            </div>

            <div class="step-card" style="border-color: #6366F1;">
                <div class="step-header">
                    <div class="step-number" style="background: linear-gradient(135deg, #6366F1, #4F46E5);">3</div>
                    <div class="step-title">
                        <h4>Ngày 11-20: Real Trading Start</h4>
                        <span class="timing" style="color: #6366F1;">⏰ 1 giờ/ngày</span>
                    </div>
                </div>
                <p>Bắt đầu trade real với position size nhỏ.</p>
                <div class="action-list">
                    <div class="action-item"><div class="checkbox">☐</div> Bắt đầu với 0.5% risk per trade</div>
                    <div class="action-item"><div class="checkbox">☐</div> Chỉ trade 2-3 patterns quen thuộc nhất</div>
                    <div class="action-item"><div class="checkbox">☐</div> Duy trì Karma score > 80</div>
                    <div class="action-item"><div class="checkbox">☐</div> Gửi affiliate link cho 5 người quan tâm</div>
                </div>
            </div>

            <div class="step-card" style="border-color: #8B5CF6;">
                <div class="step-header">
                    <div class="step-number" style="background: linear-gradient(135deg, #8B5CF6, #6D28D9);">4</div>
                    <div class="step-title">
                        <h4>Ngày 21-30: Optimize & Scale</h4>
                        <span class="timing" style="color: #8B5CF6;">⏰ Review weekly</span>
                    </div>
                </div>
                <p>Đánh giá và điều chỉnh strategy.</p>
                <div class="action-list">
                    <div class="action-item"><div class="checkbox">☐</div> Review trading stats: Win rate, R:R ratio</div>
                    <div class="action-item"><div class="checkbox">☐</div> Xác định patterns hiệu quả nhất với bạn</div>
                    <div class="action-item"><div class="checkbox">☐</div> Tăng dần position size nếu profitable</div>
                    <div class="action-item"><div class="checkbox">☐</div> Follow up với affiliate contacts</div>
                </div>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📞</div>
            <h2 class="section-title">Kết Nối & Hỗ Trợ</h2>
            <p>Bạn không đi một mình. Đây là các kênh hỗ trợ:</p>

            <ul>
                <li><strong>Telegram Elite:</strong> Group private cho Elite Members, chia sẻ signals và ideas</li>
                <li><strong>GEM Master AI:</strong> Chatbot trong app để hỏi đáp bất cứ lúc nào</li>
                <li><strong>Help Center:</strong> Trong app GEM Mobile → Help & Support</li>
                <li><strong>Email:</strong> support@gem-trading.com cho vấn đề cần hỗ trợ trực tiếp</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Pro Tip:</strong> Tham gia active trong community. Những Elite Members active nhất thường có kết quả tốt nhất!</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🎯</div>
            <h2 class="section-title">Lời Cuối</h2>
            <p>Bạn đã đi được một chặng đường dài. Từ người mới bắt đầu, bạn giờ đây là một <strong style="color: #10B981;">Elite Trader</strong> được trang bị đầy đủ:</p>

            <ul>
                <li><strong>24 Patterns:</strong> Để trade trong mọi điều kiện thị trường</li>
                <li><strong>AI & Technology:</strong> Để không bỏ lỡ cơ hội</li>
                <li><strong>Risk Management:</strong> Để bảo vệ và phát triển portfolio</li>
                <li><strong>Psychology:</strong> Để kiểm soát cảm xúc và trade có kỷ luật</li>
                <li><strong>Community:</strong> Để học hỏi và phát triển liên tục</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🙏 Cảm Ơn Bạn:</strong> Cảm ơn bạn đã tin tưởng GEM Trading Academy. Hành trình của bạn bắt đầu từ đây. Chúc bạn thành công!</p>
            </div>

            <div class="congratulations-banner" style="background: linear-gradient(135deg, #8B5CF6, #6D28D9);">
                <h3>🚀 LET''S START YOUR JOURNEY</h3>
                <p>Kiến thức đã đủ. Bây giờ là lúc hành động!</p>
                <a href="#" class="cta-button">Bắt Đầu Ngay →</a>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=Your+Elite+Journey+Begins" alt="Journey Begins">
                <p class="image-caption">Hành trình Elite của bạn bắt đầu từ đây!</p>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>🎓 Bạn đã hoàn thành GEM Trading Academy</p>
            <p>GEM Trading Academy - Tier 3 Elite - Module B</p>
            <p>© 2024 GEM Trading. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>
',
  7,
  15,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  html_content = EXCLUDED.html_content,
  content = EXCLUDED.content,
  updated_at = NOW();

-- ✅ Done: 7 lessons
