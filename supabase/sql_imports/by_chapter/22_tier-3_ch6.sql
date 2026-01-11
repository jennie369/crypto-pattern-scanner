-- =====================================================
-- TIER-3 - Module A: Transformation Elite
-- Course: course-tier3-trading-mastery
-- File 22/23
-- =====================================================

-- Create/Update Module
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  'module-tier-3-ch6',
  'course-tier3-trading-mastery',
  'Module A: Transformation Elite',
  'Chuyển đổi tư duy Elite',
  6,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Lesson 6.1: Con Người Cũ và Con Người Mới
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch6-l1',
  'module-tier-3-ch6',
  'course-tier3-trading-mastery',
  'Bài 6.1: Con Người Cũ và Con Người Mới',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 6.1: Con Người Cũ và Con Người Mới | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #8B5CF6; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #8B5CF6; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #8B5CF6, #6D28D9); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(109,40,217,0.1)); border: 1px solid rgba(139,92,246,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #8B5CF6; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 1.5rem 0; }
        .comparison-card { background: #1a1a2e; border-radius: 12px; padding: 1.5rem; }
        .comparison-card.before { border-top: 4px solid #EF4444; }
        .comparison-card.after { border-top: 4px solid #10B981; }
        .comparison-card h4 { font-size: 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .comparison-card.before h4 { color: #EF4444; }
        .comparison-card.after h4 { color: #10B981; }
        .transformation-arrow { text-align: center; font-size: 2rem; color: #8B5CF6; margin: 1rem 0; }
        .milestone-item { display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; background: #1a1a2e; border-radius: 8px; align-items: flex-start; }
        .milestone-tier { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-weight: 600; font-size: 0.85rem; flex-shrink: 0; }
        .milestone-content h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.25rem; }
        .milestone-content p { margin-bottom: 0; font-size: 0.9rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .comparison-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <span class="module-badge">MODULE A</span>
            <h1 class="lesson-title">Con Người Cũ và Con Người Mới</h1>
            <p class="lesson-subtitle">Hành Trình Chuyển Hóa Từ TIER 1 Đến TIER 3</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🔄</div>
            <h2 class="section-title">Nhìn Lại Hành Trình</h2>
            <p>Hãy dừng lại một chút và nhìn lại hành trình bạn đã đi qua. Từ ngày đầu tiên bước vào GEM Trading Academy đến bây giờ, bạn đã thay đổi rất nhiều - có thể bạn chưa nhận ra hết.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💭 Câu Hỏi Suy Ngẫm:</strong> Bạn có còn nhớ cảm giác khi lần đầu nhìn vào chart crypto? So với bây giờ, bạn thấy thế nào?</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">👤</div>
            <h2 class="section-title">Trước & Sau: Sự Chuyển Hóa</h2>

            <div class="comparison-grid">
                <div class="comparison-card before">
                    <h4>❌ Con Người Cũ (Trước GEM)</h4>
                    <ul style="margin: 0; padding-left: 1rem;">
                        <li>FOMO vào lệnh, không có plan</li>
                        <li>Không hiểu tại sao giá đi lên/xuống</li>
                        <li>Risk management = "đặt SL đâu đó"</li>
                        <li>Cảm xúc quyết định mọi thứ</li>
                        <li>Sợ hãi và tham lam xen kẽ</li>
                        <li>Không có edge rõ ràng</li>
                    </ul>
                </div>

                <div class="comparison-card after">
                    <h4>✅ Con Người Mới (Sau GEM)</h4>
                    <ul style="margin: 0; padding-left: 1rem;">
                        <li>Entry có kế hoạch, exit có rules</li>
                        <li>Hiểu zones, patterns, market structure</li>
                        <li>Risk 1-2% mỗi trade, portfolio management</li>
                        <li>Process-driven, detached từ kết quả</li>
                        <li>Patience và discipline</li>
                        <li>24 patterns = Edge rõ ràng</li>
                    </ul>
                </div>
            </div>

            <div class="transformation-arrow">⬇️</div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=Before+After+Transformation" alt="Before After">
                <p class="image-caption">Sự chuyển hóa từ Retail Trader thành Elite Trader</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🏔️</div>
            <h2 class="section-title">Các Milestone Đã Đạt Được</h2>
            <p>Hãy tự hào về những gì bạn đã đạt được qua từng Tier:</p>

            <div class="milestone-item">
                <span class="milestone-tier">TIER 1</span>
                <div class="milestone-content">
                    <h4>Foundation - Nền Tảng Vững Chắc</h4>
                    <p>6 GEM Core Patterns, Zone identification, Paper trading basics, GEM Master AI intro</p>
                </div>
            </div>

            <div class="milestone-item">
                <span class="milestone-tier">TIER 2</span>
                <div class="milestone-content">
                    <h4>Advanced - Kỹ Năng Nâng Cao</h4>
                    <p>6 Classic Patterns, Multi-timeframe analysis, Risk management, Trading psychology</p>
                </div>
            </div>

            <div class="milestone-item">
                <span class="milestone-tier">TIER 3</span>
                <div class="milestone-content">
                    <h4>Elite - Chuyên Gia Hoàn Chỉnh</h4>
                    <p>Flag/Pennant, Candlestick mastery, AI Signals, Whale tracking, Portfolio management</p>
                </div>
            </div>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🎯 Tổng Cộng:</strong> 24 patterns, 25+ chapters, 130+ bài học, 250+ quiz questions. Bạn đã hoàn thành tất cả!</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">💎</div>
            <h2 class="section-title">Giá Trị Thực Sự</h2>
            <p>Điều quý giá nhất bạn nhận được không chỉ là kiến thức kỹ thuật, mà là:</p>

            <ul>
                <li><strong>Mindset của Professional:</strong> Nghĩ và hành động như Pro Trader</li>
                <li><strong>Framework hoàn chỉnh:</strong> Từ analysis đến execution đến review</li>
                <li><strong>Confidence có cơ sở:</strong> Tự tin dựa trên edge thực sự, không phải luck</li>
                <li><strong>Community:</strong> Thuộc về cộng đồng Elite Traders</li>
                <li><strong>Lifetime skill:</strong> Kỹ năng trading đi theo bạn suốt đời</li>
            </ul>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=True+Value+Infographic" alt="True Value">
                <p class="image-caption">Giá trị thực sự của hành trình học tập</p>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite - Module A</p>
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
    <title>Bài 6.1: Con Người Cũ và Con Người Mới | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #8B5CF6; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #8B5CF6; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #8B5CF6, #6D28D9); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(109,40,217,0.1)); border: 1px solid rgba(139,92,246,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #8B5CF6; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 1.5rem 0; }
        .comparison-card { background: #1a1a2e; border-radius: 12px; padding: 1.5rem; }
        .comparison-card.before { border-top: 4px solid #EF4444; }
        .comparison-card.after { border-top: 4px solid #10B981; }
        .comparison-card h4 { font-size: 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .comparison-card.before h4 { color: #EF4444; }
        .comparison-card.after h4 { color: #10B981; }
        .transformation-arrow { text-align: center; font-size: 2rem; color: #8B5CF6; margin: 1rem 0; }
        .milestone-item { display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; background: #1a1a2e; border-radius: 8px; align-items: flex-start; }
        .milestone-tier { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-weight: 600; font-size: 0.85rem; flex-shrink: 0; }
        .milestone-content h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.25rem; }
        .milestone-content p { margin-bottom: 0; font-size: 0.9rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .comparison-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <span class="module-badge">MODULE A</span>
            <h1 class="lesson-title">Con Người Cũ và Con Người Mới</h1>
            <p class="lesson-subtitle">Hành Trình Chuyển Hóa Từ TIER 1 Đến TIER 3</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🔄</div>
            <h2 class="section-title">Nhìn Lại Hành Trình</h2>
            <p>Hãy dừng lại một chút và nhìn lại hành trình bạn đã đi qua. Từ ngày đầu tiên bước vào GEM Trading Academy đến bây giờ, bạn đã thay đổi rất nhiều - có thể bạn chưa nhận ra hết.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💭 Câu Hỏi Suy Ngẫm:</strong> Bạn có còn nhớ cảm giác khi lần đầu nhìn vào chart crypto? So với bây giờ, bạn thấy thế nào?</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">👤</div>
            <h2 class="section-title">Trước & Sau: Sự Chuyển Hóa</h2>

            <div class="comparison-grid">
                <div class="comparison-card before">
                    <h4>❌ Con Người Cũ (Trước GEM)</h4>
                    <ul style="margin: 0; padding-left: 1rem;">
                        <li>FOMO vào lệnh, không có plan</li>
                        <li>Không hiểu tại sao giá đi lên/xuống</li>
                        <li>Risk management = "đặt SL đâu đó"</li>
                        <li>Cảm xúc quyết định mọi thứ</li>
                        <li>Sợ hãi và tham lam xen kẽ</li>
                        <li>Không có edge rõ ràng</li>
                    </ul>
                </div>

                <div class="comparison-card after">
                    <h4>✅ Con Người Mới (Sau GEM)</h4>
                    <ul style="margin: 0; padding-left: 1rem;">
                        <li>Entry có kế hoạch, exit có rules</li>
                        <li>Hiểu zones, patterns, market structure</li>
                        <li>Risk 1-2% mỗi trade, portfolio management</li>
                        <li>Process-driven, detached từ kết quả</li>
                        <li>Patience và discipline</li>
                        <li>24 patterns = Edge rõ ràng</li>
                    </ul>
                </div>
            </div>

            <div class="transformation-arrow">⬇️</div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=Before+After+Transformation" alt="Before After">
                <p class="image-caption">Sự chuyển hóa từ Retail Trader thành Elite Trader</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🏔️</div>
            <h2 class="section-title">Các Milestone Đã Đạt Được</h2>
            <p>Hãy tự hào về những gì bạn đã đạt được qua từng Tier:</p>

            <div class="milestone-item">
                <span class="milestone-tier">TIER 1</span>
                <div class="milestone-content">
                    <h4>Foundation - Nền Tảng Vững Chắc</h4>
                    <p>6 GEM Core Patterns, Zone identification, Paper trading basics, GEM Master AI intro</p>
                </div>
            </div>

            <div class="milestone-item">
                <span class="milestone-tier">TIER 2</span>
                <div class="milestone-content">
                    <h4>Advanced - Kỹ Năng Nâng Cao</h4>
                    <p>6 Classic Patterns, Multi-timeframe analysis, Risk management, Trading psychology</p>
                </div>
            </div>

            <div class="milestone-item">
                <span class="milestone-tier">TIER 3</span>
                <div class="milestone-content">
                    <h4>Elite - Chuyên Gia Hoàn Chỉnh</h4>
                    <p>Flag/Pennant, Candlestick mastery, AI Signals, Whale tracking, Portfolio management</p>
                </div>
            </div>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🎯 Tổng Cộng:</strong> 24 patterns, 25+ chapters, 130+ bài học, 250+ quiz questions. Bạn đã hoàn thành tất cả!</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">💎</div>
            <h2 class="section-title">Giá Trị Thực Sự</h2>
            <p>Điều quý giá nhất bạn nhận được không chỉ là kiến thức kỹ thuật, mà là:</p>

            <ul>
                <li><strong>Mindset của Professional:</strong> Nghĩ và hành động như Pro Trader</li>
                <li><strong>Framework hoàn chỉnh:</strong> Từ analysis đến execution đến review</li>
                <li><strong>Confidence có cơ sở:</strong> Tự tin dựa trên edge thực sự, không phải luck</li>
                <li><strong>Community:</strong> Thuộc về cộng đồng Elite Traders</li>
                <li><strong>Lifetime skill:</strong> Kỹ năng trading đi theo bạn suốt đời</li>
            </ul>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=True+Value+Infographic" alt="True Value">
                <p class="image-caption">Giá trị thực sự của hành trình học tập</p>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite - Module A</p>
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

-- Lesson 6.2: Bản Đồ Hành Trình Của Bạn
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch6-l2',
  'module-tier-3-ch6',
  'course-tier3-trading-mastery',
  'Bài 6.2: Bản Đồ Hành Trình Của Bạn',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 6.2: Bản Đồ Hành Trình Của Bạn | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #8B5CF6; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #8B5CF6; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #8B5CF6, #6D28D9); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(109,40,217,0.1)); border: 1px solid rgba(139,92,246,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        ul { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #8B5CF6; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .roadmap-tier { background: #1a1a2e; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; border-left: 4px solid #6366F1; }
        .roadmap-tier h4 { color: #ffffff; font-size: 1.1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .roadmap-tier .tier-label { background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
        .chapter-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem; margin-top: 1rem; }
        .chapter-item { background: #0a0a0f; padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.85rem; color: #a1a1aa; display: flex; align-items: center; gap: 0.5rem; }
        .chapter-item .check { color: #10B981; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin: 1rem 0; }
        .stat-card { background: #1a1a2e; border-radius: 8px; padding: 1rem; text-align: center; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: #8B5CF6; }
        .stat-label { font-size: 0.8rem; color: #a1a1aa; margin-top: 0.25rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
            .chapter-list { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <span class="module-badge">MODULE A</span>
            <h1 class="lesson-title">Bản Đồ Hành Trình Của Bạn</h1>
            <p class="lesson-subtitle">Tổng Kết 25 Chapters Qua 3 TIER</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🗺️</div>
            <h2 class="section-title">Toàn Cảnh Hành Trình</h2>
            <p>Bạn đã hoàn thành một hành trình học tập đáng kinh ngạc. Hãy cùng nhìn lại toàn bộ "bản đồ" mà bạn đã đi qua:</p>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">25</div>
                    <div class="stat-label">Chapters</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">130+</div>
                    <div class="stat-label">Bài Học</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">250+</div>
                    <div class="stat-label">Quiz</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">24</div>
                    <div class="stat-label">Patterns</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=Complete+Learning+Journey+Map" alt="Journey Map">
                <p class="image-caption">Bản đồ hoàn chỉnh hành trình học tập GEM Academy</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📚</div>
            <h2 class="section-title">TIER 1: Nền Tảng (10 Chapters)</h2>

            <div class="roadmap-tier">
                <h4><span class="tier-label">TIER 1</span> Basic Foundation</h4>
                <p>Xây dựng nền tảng vững chắc với core patterns và tools cơ bản.</p>
                <div class="chapter-list">
                    <div class="chapter-item"><span class="check">✓</span> Ch.1: Welcome</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.2: Mindset</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.3: UPU Pattern</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.4: UPD Pattern</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.5: DPU Pattern</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.6: Classic Patterns</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.7: Paper Trading</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.8: GEM Master AI</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.9: Module A</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.10: Module B</div>
                </div>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📈</div>
            <h2 class="section-title">TIER 2: Nâng Cao (8 Chapters)</h2>

            <div class="roadmap-tier" style="border-left-color: #FFBD59;">
                <h4><span class="tier-label" style="background: linear-gradient(135deg, #FFBD59, #F59E0B);">TIER 2</span> Advanced Techniques</h4>
                <p>Nâng cao kỹ năng với patterns phức tạp và risk management chuyên sâu.</p>
                <div class="chapter-list">
                    <div class="chapter-item"><span class="check">✓</span> Ch.1: Advanced Zones</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.2: DPD & CxH/CxL</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.3: Multi-TF</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.4: Classic Advanced</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.5: Risk Management</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.6: Psychology</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.7: Module A</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.8: Module B</div>
                </div>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🏆</div>
            <h2 class="section-title">TIER 3: Elite (7 Chapters)</h2>

            <div class="roadmap-tier" style="border-left-color: #10B981;">
                <h4><span class="tier-label" style="background: linear-gradient(135deg, #10B981, #059669);">TIER 3</span> Elite Mastery</h4>
                <p>Hoàn thiện với AI, Whale tracking, và portfolio management chuyên nghiệp.</p>
                <div class="chapter-list">
                    <div class="chapter-item"><span class="check">✓</span> Ch.1: Flag & Pennant</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.2: Candlesticks</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.3: AI Signals</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.4: Whale Tracking</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.5: Risk Elite</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.6: Module A</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.7: Module B</div>
                </div>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🎯</div>
            <h2 class="section-title">Kỹ Năng Đã Master</h2>
            <p>Tổng hợp tất cả kỹ năng bạn đã học và thực hành:</p>

            <ul>
                <li><strong>Technical Analysis:</strong> 24 patterns, zones, multi-timeframe</li>
                <li><strong>Risk Management:</strong> Position sizing, drawdown control, circuit breakers</li>
                <li><strong>Psychology:</strong> Karma system, emotional control, mindfulness</li>
                <li><strong>AI & Technology:</strong> AI signals, automated alerts, whale tracking</li>
                <li><strong>Portfolio:</strong> Diversification, correlation, rebalancing</li>
                <li><strong>Execution:</strong> Entry/exit strategies, order management</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🎉 Kết Quả:</strong> Bạn đã sở hữu bộ kỹ năng hoàn chỉnh của một Professional Crypto Trader!</p>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite - Module A</p>
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
    <title>Bài 6.2: Bản Đồ Hành Trình Của Bạn | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #8B5CF6; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #8B5CF6; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #8B5CF6, #6D28D9); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(109,40,217,0.1)); border: 1px solid rgba(139,92,246,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        ul { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #8B5CF6; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .roadmap-tier { background: #1a1a2e; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; border-left: 4px solid #6366F1; }
        .roadmap-tier h4 { color: #ffffff; font-size: 1.1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .roadmap-tier .tier-label { background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
        .chapter-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem; margin-top: 1rem; }
        .chapter-item { background: #0a0a0f; padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.85rem; color: #a1a1aa; display: flex; align-items: center; gap: 0.5rem; }
        .chapter-item .check { color: #10B981; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin: 1rem 0; }
        .stat-card { background: #1a1a2e; border-radius: 8px; padding: 1rem; text-align: center; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: #8B5CF6; }
        .stat-label { font-size: 0.8rem; color: #a1a1aa; margin-top: 0.25rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
            .chapter-list { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <span class="module-badge">MODULE A</span>
            <h1 class="lesson-title">Bản Đồ Hành Trình Của Bạn</h1>
            <p class="lesson-subtitle">Tổng Kết 25 Chapters Qua 3 TIER</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🗺️</div>
            <h2 class="section-title">Toàn Cảnh Hành Trình</h2>
            <p>Bạn đã hoàn thành một hành trình học tập đáng kinh ngạc. Hãy cùng nhìn lại toàn bộ "bản đồ" mà bạn đã đi qua:</p>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">25</div>
                    <div class="stat-label">Chapters</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">130+</div>
                    <div class="stat-label">Bài Học</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">250+</div>
                    <div class="stat-label">Quiz</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">24</div>
                    <div class="stat-label">Patterns</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=Complete+Learning+Journey+Map" alt="Journey Map">
                <p class="image-caption">Bản đồ hoàn chỉnh hành trình học tập GEM Academy</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📚</div>
            <h2 class="section-title">TIER 1: Nền Tảng (10 Chapters)</h2>

            <div class="roadmap-tier">
                <h4><span class="tier-label">TIER 1</span> Basic Foundation</h4>
                <p>Xây dựng nền tảng vững chắc với core patterns và tools cơ bản.</p>
                <div class="chapter-list">
                    <div class="chapter-item"><span class="check">✓</span> Ch.1: Welcome</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.2: Mindset</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.3: UPU Pattern</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.4: UPD Pattern</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.5: DPU Pattern</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.6: Classic Patterns</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.7: Paper Trading</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.8: GEM Master AI</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.9: Module A</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.10: Module B</div>
                </div>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📈</div>
            <h2 class="section-title">TIER 2: Nâng Cao (8 Chapters)</h2>

            <div class="roadmap-tier" style="border-left-color: #FFBD59;">
                <h4><span class="tier-label" style="background: linear-gradient(135deg, #FFBD59, #F59E0B);">TIER 2</span> Advanced Techniques</h4>
                <p>Nâng cao kỹ năng với patterns phức tạp và risk management chuyên sâu.</p>
                <div class="chapter-list">
                    <div class="chapter-item"><span class="check">✓</span> Ch.1: Advanced Zones</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.2: DPD & CxH/CxL</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.3: Multi-TF</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.4: Classic Advanced</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.5: Risk Management</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.6: Psychology</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.7: Module A</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.8: Module B</div>
                </div>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🏆</div>
            <h2 class="section-title">TIER 3: Elite (7 Chapters)</h2>

            <div class="roadmap-tier" style="border-left-color: #10B981;">
                <h4><span class="tier-label" style="background: linear-gradient(135deg, #10B981, #059669);">TIER 3</span> Elite Mastery</h4>
                <p>Hoàn thiện với AI, Whale tracking, và portfolio management chuyên nghiệp.</p>
                <div class="chapter-list">
                    <div class="chapter-item"><span class="check">✓</span> Ch.1: Flag & Pennant</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.2: Candlesticks</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.3: AI Signals</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.4: Whale Tracking</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.5: Risk Elite</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.6: Module A</div>
                    <div class="chapter-item"><span class="check">✓</span> Ch.7: Module B</div>
                </div>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🎯</div>
            <h2 class="section-title">Kỹ Năng Đã Master</h2>
            <p>Tổng hợp tất cả kỹ năng bạn đã học và thực hành:</p>

            <ul>
                <li><strong>Technical Analysis:</strong> 24 patterns, zones, multi-timeframe</li>
                <li><strong>Risk Management:</strong> Position sizing, drawdown control, circuit breakers</li>
                <li><strong>Psychology:</strong> Karma system, emotional control, mindfulness</li>
                <li><strong>AI & Technology:</strong> AI signals, automated alerts, whale tracking</li>
                <li><strong>Portfolio:</strong> Diversification, correlation, rebalancing</li>
                <li><strong>Execution:</strong> Entry/exit strategies, order management</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🎉 Kết Quả:</strong> Bạn đã sở hữu bộ kỹ năng hoàn chỉnh của một Professional Crypto Trader!</p>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite - Module A</p>
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

-- Lesson 6.3: Sự Thay Đổi Thực Sự
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch6-l3',
  'module-tier-3-ch6',
  'course-tier3-trading-mastery',
  'Bài 6.3: Sự Thay Đổi Thực Sự',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 6.3: Sự Thay Đổi Thực Sự | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #8B5CF6; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #8B5CF6; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #8B5CF6, #6D28D9); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(109,40,217,0.1)); border: 1px solid rgba(139,92,246,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        ul { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #8B5CF6; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .change-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #10B981; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .change-card h4 { color: #10B981; font-size: 1.1rem; margin-bottom: 0.75rem; }
        .tool-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1rem 0; }
        .tool-card { background: #1a1a2e; border-radius: 8px; padding: 1rem; text-align: center; }
        .tool-card .icon { font-size: 2rem; margin-bottom: 0.5rem; }
        .tool-card .name { color: #ffffff; font-weight: 600; font-size: 0.9rem; }
        .tool-card .desc { color: #a1a1aa; font-size: 0.8rem; margin-top: 0.25rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .tool-grid { grid-template-columns: repeat(2, 1fr); }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <span class="module-badge">MODULE A</span>
            <h1 class="lesson-title">Sự Thay Đổi Thực Sự</h1>
            <p class="lesson-subtitle">24 Patterns, AI, Whale Tracking - Bộ Công Cụ Hoàn Chỉnh</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🔧</div>
            <h2 class="section-title">Bộ Công Cụ Elite Của Bạn</h2>
            <p>Sự thay đổi thực sự không chỉ là kiến thức, mà là việc bạn giờ đây sở hữu <strong style="color: #10B981;">bộ công cụ hoàn chỉnh</strong> mà 95% retail traders không có.</p>

            <div class="tool-grid">
                <div class="tool-card">
                    <div class="icon">📊</div>
                    <div class="name">24 Patterns</div>
                    <div class="desc">Edge kỹ thuật</div>
                </div>
                <div class="tool-card">
                    <div class="icon">🤖</div>
                    <div class="name">AI Signals</div>
                    <div class="desc">Automation</div>
                </div>
                <div class="tool-card">
                    <div class="icon">🐋</div>
                    <div class="name">Whale Tracking</div>
                    <div class="desc">Smart money</div>
                </div>
                <div class="tool-card">
                    <div class="icon">⭐</div>
                    <div class="name">Karma System</div>
                    <div class="desc">Psychology</div>
                </div>
                <div class="tool-card">
                    <div class="icon">📈</div>
                    <div class="name">Portfolio Mgmt</div>
                    <div class="desc">Risk control</div>
                </div>
                <div class="tool-card">
                    <div class="icon">🎯</div>
                    <div class="name">Confluence</div>
                    <div class="desc">High probability</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Elite+Trader+Toolkit" alt="Elite Toolkit">
                <p class="image-caption">Bộ công cụ hoàn chỉnh của Elite Trader</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🧠</div>
            <h2 class="section-title">Thay Đổi Về Tư Duy</h2>

            <div class="change-card">
                <h4>💭 Từ Reactive → Proactive</h4>
                <p style="margin-bottom: 0;"><strong>Trước:</strong> Phản ứng với market, chase giá<br>
                <strong>Sau:</strong> Đợi setup đến với mình, trade theo plan</p>
            </div>

            <div class="change-card" style="border-color: #FFBD59;">
                <h4 style="color: #FFBD59;">📏 Từ Random → Systematic</h4>
                <p style="margin-bottom: 0;"><strong>Trước:</strong> Trade theo cảm tính, không có quy trình<br>
                <strong>Sau:</strong> Framework rõ ràng từ analysis đến execution</p>
            </div>

            <div class="change-card" style="border-color: #6366F1;">
                <h4 style="color: #6366F1;">🎯 Từ Outcome → Process</h4>
                <p style="margin-bottom: 0;"><strong>Trước:</strong> Focus vào P&L từng trade<br>
                <strong>Sau:</strong> Focus vào process, kết quả đến tự nhiên</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">24 Patterns - Sức Mạnh Thực Sự</h2>
            <p>Với 24 patterns, bạn có thể trade trong mọi điều kiện thị trường:</p>

            <ul>
                <li><strong>Trending Up:</strong> UPU, DPU, Flag, Pennant, Three Methods</li>
                <li><strong>Trending Down:</strong> UPD, DPD, Bearish patterns</li>
                <li><strong>Ranging:</strong> Double tops/bottoms, Zone bounces</li>
                <li><strong>Breakout:</strong> Triangle, Wedge, Channel breakouts</li>
                <li><strong>Reversal:</strong> H&S, Engulfing, Hammer, Stars</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💎 Edge Của Bạn:</strong> Trong khi 95% retail traders chỉ biết 2-3 patterns, bạn có 24 patterns để áp dụng trong mọi tình huống.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=24+Patterns+All+Conditions" alt="24 Patterns">
                <p class="image-caption">24 patterns cho mọi điều kiện thị trường</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🤖</div>
            <h2 class="section-title">AI + Whale: Lợi Thế Công Nghệ</h2>
            <p>Bạn không trade một mình. Bạn có:</p>

            <ul>
                <li><strong>GEM AI Brain:</strong> Scan 100+ coins 24/7, không bỏ sót cơ hội</li>
                <li><strong>Smart Alerts:</strong> Thông báo real-time khi có setup chất lượng</li>
                <li><strong>Whale Tracking:</strong> Biết whales đang làm gì trước khi thị trường biết</li>
                <li><strong>Order Flow:</strong> Thấy áp lực mua/bán real-time</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🚀 Competitive Advantage:</strong> Kết hợp kỹ năng của bạn với sức mạnh của AI = Edge mà hầu hết traders không có.</p>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite - Module A</p>
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
    <title>Bài 6.3: Sự Thay Đổi Thực Sự | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #8B5CF6; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #8B5CF6; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #8B5CF6, #6D28D9); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(109,40,217,0.1)); border: 1px solid rgba(139,92,246,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        ul { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #8B5CF6; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .change-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #10B981; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .change-card h4 { color: #10B981; font-size: 1.1rem; margin-bottom: 0.75rem; }
        .tool-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1rem 0; }
        .tool-card { background: #1a1a2e; border-radius: 8px; padding: 1rem; text-align: center; }
        .tool-card .icon { font-size: 2rem; margin-bottom: 0.5rem; }
        .tool-card .name { color: #ffffff; font-weight: 600; font-size: 0.9rem; }
        .tool-card .desc { color: #a1a1aa; font-size: 0.8rem; margin-top: 0.25rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .tool-grid { grid-template-columns: repeat(2, 1fr); }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <span class="module-badge">MODULE A</span>
            <h1 class="lesson-title">Sự Thay Đổi Thực Sự</h1>
            <p class="lesson-subtitle">24 Patterns, AI, Whale Tracking - Bộ Công Cụ Hoàn Chỉnh</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🔧</div>
            <h2 class="section-title">Bộ Công Cụ Elite Của Bạn</h2>
            <p>Sự thay đổi thực sự không chỉ là kiến thức, mà là việc bạn giờ đây sở hữu <strong style="color: #10B981;">bộ công cụ hoàn chỉnh</strong> mà 95% retail traders không có.</p>

            <div class="tool-grid">
                <div class="tool-card">
                    <div class="icon">📊</div>
                    <div class="name">24 Patterns</div>
                    <div class="desc">Edge kỹ thuật</div>
                </div>
                <div class="tool-card">
                    <div class="icon">🤖</div>
                    <div class="name">AI Signals</div>
                    <div class="desc">Automation</div>
                </div>
                <div class="tool-card">
                    <div class="icon">🐋</div>
                    <div class="name">Whale Tracking</div>
                    <div class="desc">Smart money</div>
                </div>
                <div class="tool-card">
                    <div class="icon">⭐</div>
                    <div class="name">Karma System</div>
                    <div class="desc">Psychology</div>
                </div>
                <div class="tool-card">
                    <div class="icon">📈</div>
                    <div class="name">Portfolio Mgmt</div>
                    <div class="desc">Risk control</div>
                </div>
                <div class="tool-card">
                    <div class="icon">🎯</div>
                    <div class="name">Confluence</div>
                    <div class="desc">High probability</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Elite+Trader+Toolkit" alt="Elite Toolkit">
                <p class="image-caption">Bộ công cụ hoàn chỉnh của Elite Trader</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🧠</div>
            <h2 class="section-title">Thay Đổi Về Tư Duy</h2>

            <div class="change-card">
                <h4>💭 Từ Reactive → Proactive</h4>
                <p style="margin-bottom: 0;"><strong>Trước:</strong> Phản ứng với market, chase giá<br>
                <strong>Sau:</strong> Đợi setup đến với mình, trade theo plan</p>
            </div>

            <div class="change-card" style="border-color: #FFBD59;">
                <h4 style="color: #FFBD59;">📏 Từ Random → Systematic</h4>
                <p style="margin-bottom: 0;"><strong>Trước:</strong> Trade theo cảm tính, không có quy trình<br>
                <strong>Sau:</strong> Framework rõ ràng từ analysis đến execution</p>
            </div>

            <div class="change-card" style="border-color: #6366F1;">
                <h4 style="color: #6366F1;">🎯 Từ Outcome → Process</h4>
                <p style="margin-bottom: 0;"><strong>Trước:</strong> Focus vào P&L từng trade<br>
                <strong>Sau:</strong> Focus vào process, kết quả đến tự nhiên</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">24 Patterns - Sức Mạnh Thực Sự</h2>
            <p>Với 24 patterns, bạn có thể trade trong mọi điều kiện thị trường:</p>

            <ul>
                <li><strong>Trending Up:</strong> UPU, DPU, Flag, Pennant, Three Methods</li>
                <li><strong>Trending Down:</strong> UPD, DPD, Bearish patterns</li>
                <li><strong>Ranging:</strong> Double tops/bottoms, Zone bounces</li>
                <li><strong>Breakout:</strong> Triangle, Wedge, Channel breakouts</li>
                <li><strong>Reversal:</strong> H&S, Engulfing, Hammer, Stars</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💎 Edge Của Bạn:</strong> Trong khi 95% retail traders chỉ biết 2-3 patterns, bạn có 24 patterns để áp dụng trong mọi tình huống.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=24+Patterns+All+Conditions" alt="24 Patterns">
                <p class="image-caption">24 patterns cho mọi điều kiện thị trường</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🤖</div>
            <h2 class="section-title">AI + Whale: Lợi Thế Công Nghệ</h2>
            <p>Bạn không trade một mình. Bạn có:</p>

            <ul>
                <li><strong>GEM AI Brain:</strong> Scan 100+ coins 24/7, không bỏ sót cơ hội</li>
                <li><strong>Smart Alerts:</strong> Thông báo real-time khi có setup chất lượng</li>
                <li><strong>Whale Tracking:</strong> Biết whales đang làm gì trước khi thị trường biết</li>
                <li><strong>Order Flow:</strong> Thấy áp lực mua/bán real-time</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🚀 Competitive Advantage:</strong> Kết hợp kỹ năng của bạn với sức mạnh của AI = Edge mà hầu hết traders không có.</p>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite - Module A</p>
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

-- Lesson 6.4: Điều Khiến Bạn Khác Biệt
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch6-l4',
  'module-tier-3-ch6',
  'course-tier3-trading-mastery',
  'Bài 6.4: Điều Khiến Bạn Khác Biệt',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 6.4: Điều Khiến Bạn Khác Biệt | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #FFBD59; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
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
        .elite-badge { background: linear-gradient(135deg, #FFBD59, #F59E0B); color: #0a0a0f; padding: 1.5rem; border-radius: 16px; text-align: center; margin: 1.5rem 0; }
        .elite-badge h3 { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .elite-badge p { margin-bottom: 0; font-size: 1rem; }
        .advantage-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .advantage-card { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; border-top: 3px solid #FFBD59; }
        .advantage-card h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .advantage-card p { font-size: 0.9rem; margin-bottom: 0; }
        .comparison-stat { display: flex; justify-content: space-between; align-items: center; background: #1a1a2e; border-radius: 8px; padding: 1rem; margin: 0.5rem 0; }
        .comparison-stat .label { color: #a1a1aa; }
        .comparison-stat .you { color: #10B981; font-weight: 700; font-size: 1.1rem; }
        .comparison-stat .others { color: #EF4444; font-weight: 700; font-size: 1.1rem; }
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
            <span class="module-badge">MODULE A</span>
            <h1 class="lesson-title">Điều Khiến Bạn Khác Biệt</h1>
            <p class="lesson-subtitle">Elite Trader Status - Lợi Thế Cạnh Tranh</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🏆</div>
            <h2 class="section-title">Bạn Đã Là Elite Trader</h2>
            <p>Với việc hoàn thành Tier 3, bạn chính thức thuộc nhóm <strong style="color: #FFBD59;">Elite Traders</strong> - top 5% traders có kỹ năng và tư duy chuyên nghiệp.</p>

            <div class="elite-badge">
                <h3>🎖️ ELITE TRADER STATUS</h3>
                <p>Hoàn thành 25 Chapters | 24 Patterns | Full GEM System</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=Elite+Trader+Badge" alt="Elite Badge">
                <p class="image-caption">Elite Trader Badge - GEM Trading Academy</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Bạn vs 95% Retail Traders</h2>
            <p>Hãy xem bạn đang ở đâu so với đa số traders:</p>

            <div class="comparison-stat">
                <span class="label">Patterns biết sử dụng</span>
                <span class="you">24 patterns</span>
                <span class="others">2-3 patterns</span>
            </div>

            <div class="comparison-stat">
                <span class="label">Risk Management</span>
                <span class="you">System hoàn chỉnh</span>
                <span class="others">Random SL</span>
            </div>

            <div class="comparison-stat">
                <span class="label">Psychology Control</span>
                <span class="you">Karma + Mindfulness</span>
                <span class="others">No system</span>
            </div>

            <div class="comparison-stat">
                <span class="label">AI & Technology</span>
                <span class="you">AI Signals + Whale</span>
                <span class="others">Manual only</span>
            </div>

            <div class="comparison-stat">
                <span class="label">Trading Framework</span>
                <span class="you">Complete system</span>
                <span class="others">No framework</span>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">💎</div>
            <h2 class="section-title">Lợi Thế Cạnh Tranh Của Bạn</h2>

            <div class="advantage-grid">
                <div class="advantage-card">
                    <h4>🎯 Edge Rõ Ràng</h4>
                    <p>24 patterns với win rates đã được test. Bạn biết chính xác edge của mình.</p>
                </div>
                <div class="advantage-card">
                    <h4>🤖 AI Support</h4>
                    <p>Không bỏ sót cơ hội. AI scan 24/7 và alert khi có setup.</p>
                </div>
                <div class="advantage-card">
                    <h4>🐋 Smart Money Insight</h4>
                    <p>Biết whales đang làm gì. Trade cùng chiều với "big players".</p>
                </div>
                <div class="advantage-card">
                    <h4>🧘 Emotional Control</h4>
                    <p>Karma system giúp bạn trade trong trạng thái tối ưu.</p>
                </div>
            </div>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Sự Thật:</strong> Những lợi thế này không phải ai cũng có. Bạn đã đầu tư thời gian và công sức để đạt được chúng.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🚀</div>
            <h2 class="section-title">Tương Lai Của Bạn</h2>
            <p>Với những gì bạn đã học, con đường phía trước rộng mở:</p>

            <ul>
                <li><strong>Trading cá nhân:</strong> Xây dựng income từ trading với edge thực sự</li>
                <li><strong>Partner/Affiliate:</strong> Thu nhập passive từ việc chia sẻ kiến thức</li>
                <li><strong>Community member:</strong> Thuộc về cộng đồng Elite, học hỏi liên tục</li>
                <li><strong>Potential mentor:</strong> Trong tương lai, có thể trở thành giảng viên</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🎯 Remember:</strong> "The best investment you can make is in yourself." - Warren Buffett. Bạn đã thực hiện điều đó.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Your+Future+Path" alt="Future Path">
                <p class="image-caption">Con đường tương lai của Elite Trader</p>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite - Module A</p>
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
    <title>Bài 6.4: Điều Khiến Bạn Khác Biệt | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #FFBD59; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
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
        .elite-badge { background: linear-gradient(135deg, #FFBD59, #F59E0B); color: #0a0a0f; padding: 1.5rem; border-radius: 16px; text-align: center; margin: 1.5rem 0; }
        .elite-badge h3 { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .elite-badge p { margin-bottom: 0; font-size: 1rem; }
        .advantage-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .advantage-card { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; border-top: 3px solid #FFBD59; }
        .advantage-card h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .advantage-card p { font-size: 0.9rem; margin-bottom: 0; }
        .comparison-stat { display: flex; justify-content: space-between; align-items: center; background: #1a1a2e; border-radius: 8px; padding: 1rem; margin: 0.5rem 0; }
        .comparison-stat .label { color: #a1a1aa; }
        .comparison-stat .you { color: #10B981; font-weight: 700; font-size: 1.1rem; }
        .comparison-stat .others { color: #EF4444; font-weight: 700; font-size: 1.1rem; }
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
            <span class="module-badge">MODULE A</span>
            <h1 class="lesson-title">Điều Khiến Bạn Khác Biệt</h1>
            <p class="lesson-subtitle">Elite Trader Status - Lợi Thế Cạnh Tranh</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🏆</div>
            <h2 class="section-title">Bạn Đã Là Elite Trader</h2>
            <p>Với việc hoàn thành Tier 3, bạn chính thức thuộc nhóm <strong style="color: #FFBD59;">Elite Traders</strong> - top 5% traders có kỹ năng và tư duy chuyên nghiệp.</p>

            <div class="elite-badge">
                <h3>🎖️ ELITE TRADER STATUS</h3>
                <p>Hoàn thành 25 Chapters | 24 Patterns | Full GEM System</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=Elite+Trader+Badge" alt="Elite Badge">
                <p class="image-caption">Elite Trader Badge - GEM Trading Academy</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Bạn vs 95% Retail Traders</h2>
            <p>Hãy xem bạn đang ở đâu so với đa số traders:</p>

            <div class="comparison-stat">
                <span class="label">Patterns biết sử dụng</span>
                <span class="you">24 patterns</span>
                <span class="others">2-3 patterns</span>
            </div>

            <div class="comparison-stat">
                <span class="label">Risk Management</span>
                <span class="you">System hoàn chỉnh</span>
                <span class="others">Random SL</span>
            </div>

            <div class="comparison-stat">
                <span class="label">Psychology Control</span>
                <span class="you">Karma + Mindfulness</span>
                <span class="others">No system</span>
            </div>

            <div class="comparison-stat">
                <span class="label">AI & Technology</span>
                <span class="you">AI Signals + Whale</span>
                <span class="others">Manual only</span>
            </div>

            <div class="comparison-stat">
                <span class="label">Trading Framework</span>
                <span class="you">Complete system</span>
                <span class="others">No framework</span>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">💎</div>
            <h2 class="section-title">Lợi Thế Cạnh Tranh Của Bạn</h2>

            <div class="advantage-grid">
                <div class="advantage-card">
                    <h4>🎯 Edge Rõ Ràng</h4>
                    <p>24 patterns với win rates đã được test. Bạn biết chính xác edge của mình.</p>
                </div>
                <div class="advantage-card">
                    <h4>🤖 AI Support</h4>
                    <p>Không bỏ sót cơ hội. AI scan 24/7 và alert khi có setup.</p>
                </div>
                <div class="advantage-card">
                    <h4>🐋 Smart Money Insight</h4>
                    <p>Biết whales đang làm gì. Trade cùng chiều với "big players".</p>
                </div>
                <div class="advantage-card">
                    <h4>🧘 Emotional Control</h4>
                    <p>Karma system giúp bạn trade trong trạng thái tối ưu.</p>
                </div>
            </div>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Sự Thật:</strong> Những lợi thế này không phải ai cũng có. Bạn đã đầu tư thời gian và công sức để đạt được chúng.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🚀</div>
            <h2 class="section-title">Tương Lai Của Bạn</h2>
            <p>Với những gì bạn đã học, con đường phía trước rộng mở:</p>

            <ul>
                <li><strong>Trading cá nhân:</strong> Xây dựng income từ trading với edge thực sự</li>
                <li><strong>Partner/Affiliate:</strong> Thu nhập passive từ việc chia sẻ kiến thức</li>
                <li><strong>Community member:</strong> Thuộc về cộng đồng Elite, học hỏi liên tục</li>
                <li><strong>Potential mentor:</strong> Trong tương lai, có thể trở thành giảng viên</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🎯 Remember:</strong> "The best investment you can make is in yourself." - Warren Buffett. Bạn đã thực hiện điều đó.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Your+Future+Path" alt="Future Path">
                <p class="image-caption">Con đường tương lai của Elite Trader</p>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite - Module A</p>
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

-- ✅ Done: 4 lessons
