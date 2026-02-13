-- =====================================================
-- TIER-1 - Module A: Transformation
-- Course: course-tier1-trading-foundation
-- File 7/23
-- =====================================================

-- Create/Update Module
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  'module-tier-1-ch9',
  'course-tier1-trading-foundation',
  'Module A: Transformation',
  'Chuyển đổi tư duy trader',
  9,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Lesson 9.1: Con Người Cũ và Con Người Mới - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch9-l1',
  'module-tier-1-ch9',
  'course-tier1-trading-foundation',
  'Bài 9.1: Con Người Cũ và Con Người Mới - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 9.1: Con Người Cũ và Con Người Mới - GEM Trading Academy</title>
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --bg-card: #1a1a25;
            --text-primary: #ffffff;
            --text-secondary: #a0a0b0;
            --text-muted: #6a6a7a;
            --border-color: #2a2a3a;
            --accent-gold: #FFBD59;
            --accent-gold-dim: rgba(255, 189, 89, 0.2);
            --accent-cyan: #00F0FF;
            --accent-cyan-dim: rgba(0, 240, 255, 0.15);
            --accent-purple: #6A5BFF;
            --accent-purple-dim: rgba(106, 91, 255, 0.15);
            --accent-green: #10B981;
            --accent-green-dim: rgba(16, 185, 129, 0.15);
            --accent-red: #EF4444;
            --accent-red-dim: rgba(239, 68, 68, 0.15);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1.5rem;
            padding-bottom: 100px;
        }

        @media (max-width: 600px) {
            .lesson-container { padding: 0; padding-bottom: 80px; }
        }

        .lesson-header {
            text-align: center;
            margin-bottom: 2rem;
            padding: 2rem 1rem;
            background: linear-gradient(135deg, var(--bg-secondary), var(--bg-card));
            border-radius: 16px;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                border-left: none;
                border-right: none;
                border-top: none;
                margin-bottom: 8px;
            }
        }

        .lesson-badge {
            display: inline-block;
            padding: 0.4rem 1rem;
            background: var(--accent-purple-dim);
            color: var(--accent-purple);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
            border: 1px solid var(--accent-purple);
        }

        .lesson-header h1 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--text-primary), var(--accent-purple));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        @media (max-width: 600px) {
            .lesson-header h1 { font-size: 1.4rem; }
        }

        .lesson-header p { color: var(--text-secondary); }

        .section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .section {
                border-radius: 0;
                border-left: 4px solid var(--accent-purple);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-color);
                padding: 1rem;
                margin-bottom: 8px;
            }
        }

        .section-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-purple);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .section-title .icon { font-size: 1.4rem; }

        @media (max-width: 600px) {
            .section-title { font-size: 1.1rem; }
        }

        .content-text {
            color: var(--text-secondary);
            margin-bottom: 1rem;
        }

        .highlight-box {
            background: var(--accent-cyan-dim);
            border: 1px solid var(--accent-cyan);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .highlight-box {
                border-radius: 8px;
                margin: 0.5rem 0;
            }
        }

        .highlight-box.gold {
            background: var(--accent-gold-dim);
            border-color: var(--accent-gold);
        }

        .highlight-box.purple {
            background: var(--accent-purple-dim);
            border-color: var(--accent-purple);
        }

        .highlight-box.green {
            background: var(--accent-green-dim);
            border-color: var(--accent-green);
        }

        .highlight-box.red {
            background: var(--accent-red-dim);
            border-color: var(--accent-red);
        }

        .highlight-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .image-placeholder {
            background: linear-gradient(135deg, var(--bg-secondary), var(--bg-card));
            border: 2px dashed var(--border-color);
            border-radius: 12px;
            padding: 3rem 1rem;
            text-align: center;
            margin: 1rem 0;
        }

        .image-placeholder img {
            max-width: 100%;
            border-radius: 8px;
        }

        .image-caption {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-top: 0.5rem;
        }

        @media (max-width: 600px) {
            .image-placeholder {
                border-radius: 8px;
                padding: 2rem 1rem;
                margin: 0.5rem 0;
            }
        }

        .comparison-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .comparison-grid {
                grid-template-columns: 1fr;
                gap: 8px;
            }
        }

        .comparison-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.2rem;
            border: 1px solid var(--border-color);
        }

        .comparison-card.old {
            border-color: var(--accent-red);
        }

        .comparison-card.new {
            border-color: var(--accent-green);
        }

        .comparison-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.8rem;
        }

        .comparison-header .emoji { font-size: 1.5rem; }

        .comparison-header h4 {
            font-size: 1rem;
        }

        .comparison-card.old h4 { color: var(--accent-red); }
        .comparison-card.new h4 { color: var(--accent-green); }

        .comparison-list {
            list-style: none;
        }

        .comparison-list li {
            padding: 0.4rem 0;
            color: var(--text-muted);
            font-size: 0.9rem;
            padding-left: 1.2rem;
            position: relative;
        }

        .comparison-card.old .comparison-list li::before {
            content: "✗";
            position: absolute;
            left: 0;
            color: var(--accent-red);
        }

        .comparison-card.new .comparison-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--accent-green);
        }

        .quote-box {
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border-left: 4px solid var(--accent-purple);
            padding: 1.5rem;
            margin: 1.5rem 0;
            font-style: italic;
        }

        .quote-text {
            font-size: 1.1rem;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }

        .quote-author {
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .summary-box {
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border: 2px solid var(--accent-purple);
            border-radius: 16px;
            padding: 1.5rem;
            margin-top: 2rem;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                border-left: 4px solid var(--accent-purple);
                border-right: none;
                border-top: none;
                border-bottom: none;
                padding: 1rem;
                margin-top: 8px;
            }
        }

        .summary-title {
            font-size: 1.2rem;
            color: var(--accent-purple);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-list {
            list-style: none;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--accent-green);
            font-weight: bold;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            color: var(--text-muted);
            font-size: 0.85rem;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">MODULE A - PHẦN 1/4</span>
            <h1>Con Người Cũ và Con Người Mới</h1>
            <p>Hành trình chuyển hóa của bạn</p>
        </header>

        <section class="section">
            <h2 class="section-title"><span class="icon">🔄</span> Hãy Nhìn Lại Bạn Trước Đây</h2>
            <p class="content-text">
                Hãy dành một phút để nhớ lại bạn trước khi bắt đầu khóa học này. Có lẽ bạn đã từng:
            </p>

            <div class="highlight-box red">
                <div class="highlight-title">😰 Những Khó Khăn Bạn Đã Trải Qua</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>Mua coin theo cảm xúc, nghe theo "tip" không rõ nguồn</li>
                    <li>Không biết khi nào nên entry, khi nào nên exit</li>
                    <li>Thua lỗ nhiều lần, mất niềm tin vào trading</li>
                    <li>FOMO mua đỉnh, panic sell đáy</li>
                    <li>Không có chiến lược rõ ràng, trade theo cảm tính</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/EF4444?text=Before+Transformation" alt="Trước khi chuyển hóa">
                <p class="image-caption">Hình 9.1.1: Những khó khăn của người mới trading</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">✨</span> Bạn Bây Giờ Đã Khác</h2>
            <p class="content-text">
                Sau khi hoàn thành TIER 1, bạn không còn là người ngày xưa nữa. Hãy xem sự khác biệt:
            </p>

            <div class="comparison-grid">
                <div class="comparison-card old">
                    <div class="comparison-header">
                        <span class="emoji">😰</span>
                        <h4>Con Người Cũ</h4>
                    </div>
                    <ul class="comparison-list">
                        <li>Trade theo cảm xúc</li>
                        <li>Không có phương pháp</li>
                        <li>Không biết đặt SL/TP</li>
                        <li>FOMO, Panic selling</li>
                        <li>Không ghi chép</li>
                        <li>Hy vọng vào may mắn</li>
                    </ul>
                </div>
                <div class="comparison-card new">
                    <div class="comparison-header">
                        <span class="emoji">💪</span>
                        <h4>Con Người Mới</h4>
                    </div>
                    <ul class="comparison-list">
                        <li>Trade theo patterns</li>
                        <li>Có phương pháp GEM</li>
                        <li>Quản lý vốn chặt chẽ</li>
                        <li>Kiên nhẫn chờ setup</li>
                        <li>Ghi Trading Journal</li>
                        <li>Dựa vào xác suất & kỷ luật</li>
                    </ul>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Old+vs+New+Trader" alt="So sánh trước sau">
                <p class="image-caption">Hình 9.1.2: Sự chuyển hóa từ người cũ sang người mới</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🎯</span> Sự Thay Đổi Sâu Sắc Hơn</h2>
            <p class="content-text">
                Sự thay đổi không chỉ ở kiến thức, mà còn ở <strong>tư duy và nhận thức</strong>:
            </p>

            <div class="highlight-box gold">
                <div class="highlight-title">💡 Thay Đổi Tư Duy</div>
                <p class="content-text">
                    <strong>Trước:</strong> "Trading là đánh bạc, may rủi"<br>
                    <strong>Sau:</strong> "Trading là nghề có phương pháp, luyện tập được"
                </p>
            </div>

            <div class="highlight-box gold">
                <div class="highlight-title">💡 Thay Đổi Cách Nhìn</div>
                <p class="content-text">
                    <strong>Trước:</strong> "Thua một trade = thất bại"<br>
                    <strong>Sau:</strong> "Thua một trade = chi phí học tập, quan trọng là Win Rate dài hạn"
                </p>
            </div>

            <div class="highlight-box gold">
                <div class="highlight-title">💡 Thay Đổi Hành Vi</div>
                <p class="content-text">
                    <strong>Trước:</strong> "FOMO vào ngay khi thấy coin pump"<br>
                    <strong>Sau:</strong> "Chờ pattern hình thành, checklist đạt mới entry"
                </p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📊</span> Những Gì Bạn Đã Đạt Được</h2>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Kiến Thức</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>4 patterns cốt lõi: DPD, UPU, UPD, DPU</li>
                    <li>Cách xác định và vẽ LFZ/HFZ</li>
                    <li>Checklist 8 điểm đánh giá setup</li>
                    <li>Classic Patterns bổ trợ</li>
                </ul>
            </div>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Kỹ Năng</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>Nhận diện patterns trên chart</li>
                    <li>Đặt Entry, Stop Loss, Take Profit</li>
                    <li>Tính toán position size và R:R</li>
                    <li>Sử dụng AI Scanner và Alerts</li>
                </ul>
            </div>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Thói Quen</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>Paper trading trước khi trade thật</li>
                    <li>Ghi chép Trading Journal</li>
                    <li>Review trades hàng tuần</li>
                    <li>Tuân thủ kỷ luật, không FOMO</li>
                </ul>
            </div>
        </section>

        <div class="quote-box">
            <p class="quote-text">"Sự khác biệt giữa trader thua lỗ và trader có lợi nhuận không phải là kiến thức, mà là kỷ luật và sự kiên nhẫn."</p>
            <p class="quote-author">— GEM Trading Philosophy</p>
        </div>

        <section class="section">
            <h2 class="section-title"><span class="icon">🌟</span> Hãy Tự Hào Về Bản Thân</h2>
            <p class="content-text">
                Bạn đã dành thời gian và công sức để học một kỹ năng mới. Không phải ai cũng có sự kiên nhẫn này.
            </p>

            <div class="highlight-box purple">
                <div class="highlight-title">🎯 Con Số Ấn Tượng</div>
                <p class="content-text">
                    <strong>90%</strong> người bắt đầu trading bỏ cuộc trong 6 tháng đầu.<br>
                    <strong>Bạn</strong> đã hoàn thành TIER 1 - bạn đã vượt qua rào cản lớn nhất!
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/6A5BFF?text=Achievement+Unlocked" alt="Thành tựu">
                <p class="image-caption">Hình 9.1.3: Bạn đã đạt được điều mà 90% người khác bỏ cuộc</p>
            </div>
        </section>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 9.1</h3>
            <ul class="summary-list">
                <li>Nhìn lại con người cũ: trade theo cảm xúc, không có phương pháp</li>
                <li>Con người mới: có kiến thức, kỹ năng, và thói quen trading chuyên nghiệp</li>
                <li>Thay đổi không chỉ ở kiến thức mà còn ở tư duy và hành vi</li>
                <li>Bạn đã vượt qua rào cản mà 90% người khác bỏ cuộc</li>
                <li>Hãy tự hào về hành trình của mình</li>
            </ul>
        </div>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Module A: Hành Trình Chuyển Hóa</p>
            <p>Tiếp theo: Bài 9.2 - Bản Đồ Hành Trình Của Bạn</p>
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
    <title>Bài 9.1: Con Người Cũ và Con Người Mới - GEM Trading Academy</title>
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --bg-card: #1a1a25;
            --text-primary: #ffffff;
            --text-secondary: #a0a0b0;
            --text-muted: #6a6a7a;
            --border-color: #2a2a3a;
            --accent-gold: #FFBD59;
            --accent-gold-dim: rgba(255, 189, 89, 0.2);
            --accent-cyan: #00F0FF;
            --accent-cyan-dim: rgba(0, 240, 255, 0.15);
            --accent-purple: #6A5BFF;
            --accent-purple-dim: rgba(106, 91, 255, 0.15);
            --accent-green: #10B981;
            --accent-green-dim: rgba(16, 185, 129, 0.15);
            --accent-red: #EF4444;
            --accent-red-dim: rgba(239, 68, 68, 0.15);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1.5rem;
            padding-bottom: 100px;
        }

        @media (max-width: 600px) {
            .lesson-container { padding: 0; padding-bottom: 80px; }
        }

        .lesson-header {
            text-align: center;
            margin-bottom: 2rem;
            padding: 2rem 1rem;
            background: linear-gradient(135deg, var(--bg-secondary), var(--bg-card));
            border-radius: 16px;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                border-left: none;
                border-right: none;
                border-top: none;
                margin-bottom: 8px;
            }
        }

        .lesson-badge {
            display: inline-block;
            padding: 0.4rem 1rem;
            background: var(--accent-purple-dim);
            color: var(--accent-purple);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
            border: 1px solid var(--accent-purple);
        }

        .lesson-header h1 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--text-primary), var(--accent-purple));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        @media (max-width: 600px) {
            .lesson-header h1 { font-size: 1.4rem; }
        }

        .lesson-header p { color: var(--text-secondary); }

        .section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .section {
                border-radius: 0;
                border-left: 4px solid var(--accent-purple);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-color);
                padding: 1rem;
                margin-bottom: 8px;
            }
        }

        .section-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-purple);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .section-title .icon { font-size: 1.4rem; }

        @media (max-width: 600px) {
            .section-title { font-size: 1.1rem; }
        }

        .content-text {
            color: var(--text-secondary);
            margin-bottom: 1rem;
        }

        .highlight-box {
            background: var(--accent-cyan-dim);
            border: 1px solid var(--accent-cyan);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .highlight-box {
                border-radius: 8px;
                margin: 0.5rem 0;
            }
        }

        .highlight-box.gold {
            background: var(--accent-gold-dim);
            border-color: var(--accent-gold);
        }

        .highlight-box.purple {
            background: var(--accent-purple-dim);
            border-color: var(--accent-purple);
        }

        .highlight-box.green {
            background: var(--accent-green-dim);
            border-color: var(--accent-green);
        }

        .highlight-box.red {
            background: var(--accent-red-dim);
            border-color: var(--accent-red);
        }

        .highlight-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .image-placeholder {
            background: linear-gradient(135deg, var(--bg-secondary), var(--bg-card));
            border: 2px dashed var(--border-color);
            border-radius: 12px;
            padding: 3rem 1rem;
            text-align: center;
            margin: 1rem 0;
        }

        .image-placeholder img {
            max-width: 100%;
            border-radius: 8px;
        }

        .image-caption {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-top: 0.5rem;
        }

        @media (max-width: 600px) {
            .image-placeholder {
                border-radius: 8px;
                padding: 2rem 1rem;
                margin: 0.5rem 0;
            }
        }

        .comparison-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .comparison-grid {
                grid-template-columns: 1fr;
                gap: 8px;
            }
        }

        .comparison-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.2rem;
            border: 1px solid var(--border-color);
        }

        .comparison-card.old {
            border-color: var(--accent-red);
        }

        .comparison-card.new {
            border-color: var(--accent-green);
        }

        .comparison-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.8rem;
        }

        .comparison-header .emoji { font-size: 1.5rem; }

        .comparison-header h4 {
            font-size: 1rem;
        }

        .comparison-card.old h4 { color: var(--accent-red); }
        .comparison-card.new h4 { color: var(--accent-green); }

        .comparison-list {
            list-style: none;
        }

        .comparison-list li {
            padding: 0.4rem 0;
            color: var(--text-muted);
            font-size: 0.9rem;
            padding-left: 1.2rem;
            position: relative;
        }

        .comparison-card.old .comparison-list li::before {
            content: "✗";
            position: absolute;
            left: 0;
            color: var(--accent-red);
        }

        .comparison-card.new .comparison-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--accent-green);
        }

        .quote-box {
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border-left: 4px solid var(--accent-purple);
            padding: 1.5rem;
            margin: 1.5rem 0;
            font-style: italic;
        }

        .quote-text {
            font-size: 1.1rem;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }

        .quote-author {
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .summary-box {
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border: 2px solid var(--accent-purple);
            border-radius: 16px;
            padding: 1.5rem;
            margin-top: 2rem;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                border-left: 4px solid var(--accent-purple);
                border-right: none;
                border-top: none;
                border-bottom: none;
                padding: 1rem;
                margin-top: 8px;
            }
        }

        .summary-title {
            font-size: 1.2rem;
            color: var(--accent-purple);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-list {
            list-style: none;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--accent-green);
            font-weight: bold;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            color: var(--text-muted);
            font-size: 0.85rem;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">MODULE A - PHẦN 1/4</span>
            <h1>Con Người Cũ và Con Người Mới</h1>
            <p>Hành trình chuyển hóa của bạn</p>
        </header>

        <section class="section">
            <h2 class="section-title"><span class="icon">🔄</span> Hãy Nhìn Lại Bạn Trước Đây</h2>
            <p class="content-text">
                Hãy dành một phút để nhớ lại bạn trước khi bắt đầu khóa học này. Có lẽ bạn đã từng:
            </p>

            <div class="highlight-box red">
                <div class="highlight-title">😰 Những Khó Khăn Bạn Đã Trải Qua</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>Mua coin theo cảm xúc, nghe theo "tip" không rõ nguồn</li>
                    <li>Không biết khi nào nên entry, khi nào nên exit</li>
                    <li>Thua lỗ nhiều lần, mất niềm tin vào trading</li>
                    <li>FOMO mua đỉnh, panic sell đáy</li>
                    <li>Không có chiến lược rõ ràng, trade theo cảm tính</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/EF4444?text=Before+Transformation" alt="Trước khi chuyển hóa">
                <p class="image-caption">Hình 9.1.1: Những khó khăn của người mới trading</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">✨</span> Bạn Bây Giờ Đã Khác</h2>
            <p class="content-text">
                Sau khi hoàn thành TIER 1, bạn không còn là người ngày xưa nữa. Hãy xem sự khác biệt:
            </p>

            <div class="comparison-grid">
                <div class="comparison-card old">
                    <div class="comparison-header">
                        <span class="emoji">😰</span>
                        <h4>Con Người Cũ</h4>
                    </div>
                    <ul class="comparison-list">
                        <li>Trade theo cảm xúc</li>
                        <li>Không có phương pháp</li>
                        <li>Không biết đặt SL/TP</li>
                        <li>FOMO, Panic selling</li>
                        <li>Không ghi chép</li>
                        <li>Hy vọng vào may mắn</li>
                    </ul>
                </div>
                <div class="comparison-card new">
                    <div class="comparison-header">
                        <span class="emoji">💪</span>
                        <h4>Con Người Mới</h4>
                    </div>
                    <ul class="comparison-list">
                        <li>Trade theo patterns</li>
                        <li>Có phương pháp GEM</li>
                        <li>Quản lý vốn chặt chẽ</li>
                        <li>Kiên nhẫn chờ setup</li>
                        <li>Ghi Trading Journal</li>
                        <li>Dựa vào xác suất & kỷ luật</li>
                    </ul>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Old+vs+New+Trader" alt="So sánh trước sau">
                <p class="image-caption">Hình 9.1.2: Sự chuyển hóa từ người cũ sang người mới</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🎯</span> Sự Thay Đổi Sâu Sắc Hơn</h2>
            <p class="content-text">
                Sự thay đổi không chỉ ở kiến thức, mà còn ở <strong>tư duy và nhận thức</strong>:
            </p>

            <div class="highlight-box gold">
                <div class="highlight-title">💡 Thay Đổi Tư Duy</div>
                <p class="content-text">
                    <strong>Trước:</strong> "Trading là đánh bạc, may rủi"<br>
                    <strong>Sau:</strong> "Trading là nghề có phương pháp, luyện tập được"
                </p>
            </div>

            <div class="highlight-box gold">
                <div class="highlight-title">💡 Thay Đổi Cách Nhìn</div>
                <p class="content-text">
                    <strong>Trước:</strong> "Thua một trade = thất bại"<br>
                    <strong>Sau:</strong> "Thua một trade = chi phí học tập, quan trọng là Win Rate dài hạn"
                </p>
            </div>

            <div class="highlight-box gold">
                <div class="highlight-title">💡 Thay Đổi Hành Vi</div>
                <p class="content-text">
                    <strong>Trước:</strong> "FOMO vào ngay khi thấy coin pump"<br>
                    <strong>Sau:</strong> "Chờ pattern hình thành, checklist đạt mới entry"
                </p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📊</span> Những Gì Bạn Đã Đạt Được</h2>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Kiến Thức</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>4 patterns cốt lõi: DPD, UPU, UPD, DPU</li>
                    <li>Cách xác định và vẽ LFZ/HFZ</li>
                    <li>Checklist 8 điểm đánh giá setup</li>
                    <li>Classic Patterns bổ trợ</li>
                </ul>
            </div>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Kỹ Năng</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>Nhận diện patterns trên chart</li>
                    <li>Đặt Entry, Stop Loss, Take Profit</li>
                    <li>Tính toán position size và R:R</li>
                    <li>Sử dụng AI Scanner và Alerts</li>
                </ul>
            </div>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Thói Quen</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>Paper trading trước khi trade thật</li>
                    <li>Ghi chép Trading Journal</li>
                    <li>Review trades hàng tuần</li>
                    <li>Tuân thủ kỷ luật, không FOMO</li>
                </ul>
            </div>
        </section>

        <div class="quote-box">
            <p class="quote-text">"Sự khác biệt giữa trader thua lỗ và trader có lợi nhuận không phải là kiến thức, mà là kỷ luật và sự kiên nhẫn."</p>
            <p class="quote-author">— GEM Trading Philosophy</p>
        </div>

        <section class="section">
            <h2 class="section-title"><span class="icon">🌟</span> Hãy Tự Hào Về Bản Thân</h2>
            <p class="content-text">
                Bạn đã dành thời gian và công sức để học một kỹ năng mới. Không phải ai cũng có sự kiên nhẫn này.
            </p>

            <div class="highlight-box purple">
                <div class="highlight-title">🎯 Con Số Ấn Tượng</div>
                <p class="content-text">
                    <strong>90%</strong> người bắt đầu trading bỏ cuộc trong 6 tháng đầu.<br>
                    <strong>Bạn</strong> đã hoàn thành TIER 1 - bạn đã vượt qua rào cản lớn nhất!
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/6A5BFF?text=Achievement+Unlocked" alt="Thành tựu">
                <p class="image-caption">Hình 9.1.3: Bạn đã đạt được điều mà 90% người khác bỏ cuộc</p>
            </div>
        </section>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 9.1</h3>
            <ul class="summary-list">
                <li>Nhìn lại con người cũ: trade theo cảm xúc, không có phương pháp</li>
                <li>Con người mới: có kiến thức, kỹ năng, và thói quen trading chuyên nghiệp</li>
                <li>Thay đổi không chỉ ở kiến thức mà còn ở tư duy và hành vi</li>
                <li>Bạn đã vượt qua rào cản mà 90% người khác bỏ cuộc</li>
                <li>Hãy tự hào về hành trình của mình</li>
            </ul>
        </div>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Module A: Hành Trình Chuyển Hóa</p>
            <p>Tiếp theo: Bài 9.2 - Bản Đồ Hành Trình Của Bạn</p>
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

-- Lesson 9.2: Bản Đồ Hành Trình Của Bạn - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch9-l2',
  'module-tier-1-ch9',
  'course-tier1-trading-foundation',
  'Bài 9.2: Bản Đồ Hành Trình Của Bạn - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 9.2: Bản Đồ Hành Trình Của Bạn - GEM Trading Academy</title>
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --bg-card: #1a1a25;
            --text-primary: #ffffff;
            --text-secondary: #a0a0b0;
            --text-muted: #6a6a7a;
            --border-color: #2a2a3a;
            --accent-gold: #FFBD59;
            --accent-gold-dim: rgba(255, 189, 89, 0.2);
            --accent-cyan: #00F0FF;
            --accent-cyan-dim: rgba(0, 240, 255, 0.15);
            --accent-purple: #6A5BFF;
            --accent-purple-dim: rgba(106, 91, 255, 0.15);
            --accent-green: #10B981;
            --accent-green-dim: rgba(16, 185, 129, 0.15);
            --accent-red: #EF4444;
            --accent-red-dim: rgba(239, 68, 68, 0.15);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1.5rem;
            padding-bottom: 100px;
        }

        @media (max-width: 600px) {
            .lesson-container { padding: 0; padding-bottom: 80px; }
        }

        .lesson-header {
            text-align: center;
            margin-bottom: 2rem;
            padding: 2rem 1rem;
            background: linear-gradient(135deg, var(--bg-secondary), var(--bg-card));
            border-radius: 16px;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                border-left: none;
                border-right: none;
                border-top: none;
                margin-bottom: 8px;
            }
        }

        .lesson-badge {
            display: inline-block;
            padding: 0.4rem 1rem;
            background: var(--accent-purple-dim);
            color: var(--accent-purple);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
            border: 1px solid var(--accent-purple);
        }

        .lesson-header h1 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--text-primary), var(--accent-purple));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        @media (max-width: 600px) {
            .lesson-header h1 { font-size: 1.4rem; }
        }

        .lesson-header p { color: var(--text-secondary); }

        .section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .section {
                border-radius: 0;
                border-left: 4px solid var(--accent-purple);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-color);
                padding: 1rem;
                margin-bottom: 8px;
            }
        }

        .section-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-purple);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .section-title .icon { font-size: 1.4rem; }

        @media (max-width: 600px) {
            .section-title { font-size: 1.1rem; }
        }

        .content-text {
            color: var(--text-secondary);
            margin-bottom: 1rem;
        }

        .highlight-box {
            background: var(--accent-cyan-dim);
            border: 1px solid var(--accent-cyan);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .highlight-box {
                border-radius: 8px;
                margin: 0.5rem 0;
            }
        }

        .highlight-box.gold {
            background: var(--accent-gold-dim);
            border-color: var(--accent-gold);
        }

        .highlight-box.purple {
            background: var(--accent-purple-dim);
            border-color: var(--accent-purple);
        }

        .highlight-box.green {
            background: var(--accent-green-dim);
            border-color: var(--accent-green);
        }

        .highlight-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .image-placeholder {
            background: linear-gradient(135deg, var(--bg-secondary), var(--bg-card));
            border: 2px dashed var(--border-color);
            border-radius: 12px;
            padding: 3rem 1rem;
            text-align: center;
            margin: 1rem 0;
        }

        .image-placeholder img {
            max-width: 100%;
            border-radius: 8px;
        }

        .image-caption {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-top: 0.5rem;
        }

        @media (max-width: 600px) {
            .image-placeholder {
                border-radius: 8px;
                padding: 2rem 1rem;
                margin: 0.5rem 0;
            }
        }

        .roadmap-item {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
            position: relative;
        }

        .roadmap-marker {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            flex-shrink: 0;
            position: relative;
            z-index: 1;
        }

        .roadmap-marker.complete {
            background: var(--accent-green);
            color: var(--bg-primary);
        }

        .roadmap-marker.current {
            background: var(--accent-gold);
            color: var(--bg-primary);
        }

        .roadmap-marker.future {
            background: var(--bg-secondary);
            color: var(--text-muted);
            border: 2px solid var(--border-color);
        }

        .roadmap-content {
            flex: 1;
            padding-bottom: 1rem;
        }

        .roadmap-title {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.3rem;
        }

        .roadmap-desc {
            font-size: 0.9rem;
            color: var(--text-muted);
        }

        .roadmap-item:not(:last-child)::before {
            content: "";
            position: absolute;
            left: 19px;
            top: 40px;
            bottom: 0;
            width: 2px;
            background: var(--border-color);
        }

        .chapter-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1rem;
            margin: 0.5rem 0;
            display: flex;
            align-items: center;
            gap: 1rem;
            border-left: 4px solid var(--accent-green);
        }

        .chapter-number {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: var(--accent-green-dim);
            color: var(--accent-green);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.9rem;
            flex-shrink: 0;
        }

        .chapter-info h4 {
            color: var(--text-primary);
            font-size: 0.95rem;
            margin-bottom: 0.2rem;
        }

        .chapter-info p {
            color: var(--text-muted);
            font-size: 0.8rem;
        }

        .chapter-check {
            margin-left: auto;
            color: var(--accent-green);
            font-size: 1.2rem;
        }

        .summary-box {
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border: 2px solid var(--accent-purple);
            border-radius: 16px;
            padding: 1.5rem;
            margin-top: 2rem;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                border-left: 4px solid var(--accent-purple);
                border-right: none;
                border-top: none;
                border-bottom: none;
                padding: 1rem;
                margin-top: 8px;
            }
        }

        .summary-title {
            font-size: 1.2rem;
            color: var(--accent-purple);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-list {
            list-style: none;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--accent-green);
            font-weight: bold;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            color: var(--text-muted);
            font-size: 0.85rem;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">MODULE A - PHẦN 2/4</span>
            <h1>Bản Đồ Hành Trình Của Bạn</h1>
            <p>Nhìn lại những gì đã đi qua</p>
        </header>

        <section class="section">
            <h2 class="section-title"><span class="icon">🗺️</span> Lộ Trình Hoàn Chỉnh</h2>
            <p class="content-text">
                Dưới đây là bản đồ hành trình từ khi bạn bắt đầu đến hiện tại. Mỗi bước đều quan trọng
                và xây dựng nền tảng cho bước tiếp theo:
            </p>

            <div class="roadmap-item">
                <div class="roadmap-marker complete">1</div>
                <div class="roadmap-content">
                    <div class="roadmap-title">Kiến Thức Nền Tảng</div>
                    <div class="roadmap-desc">Hiểu về thị trường, candlestick, các khái niệm cơ bản</div>
                </div>
            </div>

            <div class="roadmap-item">
                <div class="roadmap-marker complete">2</div>
                <div class="roadmap-content">
                    <div class="roadmap-title">GEM Patterns</div>
                    <div class="roadmap-desc">Thành thạo 4 patterns: DPD, UPU, UPD, DPU</div>
                </div>
            </div>

            <div class="roadmap-item">
                <div class="roadmap-marker complete">3</div>
                <div class="roadmap-content">
                    <div class="roadmap-title">Classic Patterns</div>
                    <div class="roadmap-desc">Bổ sung kiến thức với Head & Shoulders, Double Top/Bottom...</div>
                </div>
            </div>

            <div class="roadmap-item">
                <div class="roadmap-marker complete">4</div>
                <div class="roadmap-content">
                    <div class="roadmap-title">Thực Hành</div>
                    <div class="roadmap-desc">Paper Trading, Backtesting, Trading Journal</div>
                </div>
            </div>

            <div class="roadmap-item">
                <div class="roadmap-marker complete">5</div>
                <div class="roadmap-content">
                    <div class="roadmap-title">Công Cụ AI</div>
                    <div class="roadmap-desc">Sử dụng GEM Master AI, Scanner, Alerts</div>
                </div>
            </div>

            <div class="roadmap-item">
                <div class="roadmap-marker current">6</div>
                <div class="roadmap-content">
                    <div class="roadmap-title">Module A & B</div>
                    <div class="roadmap-desc">Hành trình chuyển hóa và cơ hội tiếp theo ← Bạn đang ở đây</div>
                </div>
            </div>

            <div class="roadmap-item">
                <div class="roadmap-marker future">7</div>
                <div class="roadmap-content">
                    <div class="roadmap-title">TIER 2 & Beyond</div>
                    <div class="roadmap-desc">Nâng cao kỹ năng với patterns và công cụ chuyên sâu hơn</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/6A5BFF?text=Learning+Roadmap" alt="Lộ trình học tập">
                <p class="image-caption">Hình 9.2.1: Bản đồ hành trình từ A đến Z</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📚</span> 8 Chương Đã Hoàn Thành</h2>
            <p class="content-text">Chi tiết các chương bạn đã học trong TIER 1:</p>

            <div class="chapter-card">
                <div class="chapter-number">3</div>
                <div class="chapter-info">
                    <h4>UPU Pattern - Tiếp Diễn Tăng</h4>
                    <p>5 bài • Cấu trúc, LFZ, Entry, Checklist, Ví dụ</p>
                </div>
                <div class="chapter-check">✓</div>
            </div>

            <div class="chapter-card">
                <div class="chapter-number">4</div>
                <div class="chapter-info">
                    <h4>UPD Pattern - Đảo Chiều Giảm</h4>
                    <p>6 bài • Cấu trúc, HFZ, Entry, So sánh, Ví dụ</p>
                </div>
                <div class="chapter-check">✓</div>
            </div>

            <div class="chapter-card">
                <div class="chapter-number">5</div>
                <div class="chapter-info">
                    <h4>DPU Pattern - Đảo Chiều Tăng</h4>
                    <p>6 bài • Cấu trúc, LFZ, Entry, Checklist, Ví dụ</p>
                </div>
                <div class="chapter-check">✓</div>
            </div>

            <div class="chapter-card">
                <div class="chapter-number">6</div>
                <div class="chapter-info">
                    <h4>Classic Patterns Cơ Bản</h4>
                    <p>6 bài • Flag, Pennant, Triangle, H&S, Double Top/Bottom</p>
                </div>
                <div class="chapter-check">✓</div>
            </div>

            <div class="chapter-card">
                <div class="chapter-number">7</div>
                <div class="chapter-info">
                    <h4>Paper Trading & Backtesting</h4>
                    <p>5 bài • Paper Trade, GEM App, Journal, Backtest, Real Trading</p>
                </div>
                <div class="chapter-check">✓</div>
            </div>

            <div class="chapter-card">
                <div class="chapter-number">8</div>
                <div class="chapter-info">
                    <h4>GEM Master AI Cơ Bản</h4>
                    <p>5 bài • Chatbot, Scanner, Alerts, Tổng kết</p>
                </div>
                <div class="chapter-check">✓</div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📊</span> Thống Kê Học Tập</h2>

            <div class="highlight-box gold">
                <div class="highlight-title">📈 Con Số Ấn Tượng</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li><strong>8 chapters</strong> kiến thức kỹ thuật</li>
                    <li><strong>33+ bài học</strong> chi tiết</li>
                    <li><strong>4 patterns</strong> cốt lõi GEM</li>
                    <li><strong>6 classic patterns</strong> bổ trợ</li>
                    <li><strong>~8 giờ</strong> nội dung học</li>
                    <li><strong>50+ quiz</strong> kiểm tra kiến thức</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x300/112250/FFBD59?text=Learning+Statistics" alt="Thống kê học tập">
                <p class="image-caption">Hình 9.2.2: Thành tựu học tập của bạn trong TIER 1</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🎯</span> Bạn Đang Ở Đâu Trên Bản Đồ</h2>
            <p class="content-text">
                Hiện tại bạn đã hoàn thành <strong>TIER 1</strong> - nền tảng vững chắc nhất.
                Từ đây, có nhiều con đường phía trước:
            </p>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Đã Đạt Được</div>
                <p class="content-text">
                    Kiến thức và kỹ năng để bắt đầu trading có phương pháp, với Win Rate tiềm năng 60-70%.
                </p>
            </div>

            <div class="highlight-box purple">
                <div class="highlight-title">🔮 Phía Trước</div>
                <p class="content-text">
                    TIER 2 với 11 patterns mới, Zone Detection AI, Multi-Timeframe Analysis...<br>
                    TIER 3 với chiến lược nâng cao, Whale Tracking, Portfolio Management...
                </p>
            </div>
        </section>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 9.2</h3>
            <ul class="summary-list">
                <li>Lộ trình học tập 7 giai đoạn từ cơ bản đến nâng cao</li>
                <li>8 chapters hoàn thành với 33+ bài học</li>
                <li>4 GEM patterns + 6 Classic patterns = 10 công cụ trading</li>
                <li>Đang ở giai đoạn 6/7 - sắp hoàn thành TIER 1</li>
                <li>Phía trước: TIER 2 và TIER 3 với kiến thức chuyên sâu hơn</li>
            </ul>
        </div>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Module A: Hành Trình Chuyển Hóa</p>
            <p>Tiếp theo: Bài 9.3 - Sự Thay Đổi Thực Sự</p>
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
    <title>Bài 9.2: Bản Đồ Hành Trình Của Bạn - GEM Trading Academy</title>
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --bg-card: #1a1a25;
            --text-primary: #ffffff;
            --text-secondary: #a0a0b0;
            --text-muted: #6a6a7a;
            --border-color: #2a2a3a;
            --accent-gold: #FFBD59;
            --accent-gold-dim: rgba(255, 189, 89, 0.2);
            --accent-cyan: #00F0FF;
            --accent-cyan-dim: rgba(0, 240, 255, 0.15);
            --accent-purple: #6A5BFF;
            --accent-purple-dim: rgba(106, 91, 255, 0.15);
            --accent-green: #10B981;
            --accent-green-dim: rgba(16, 185, 129, 0.15);
            --accent-red: #EF4444;
            --accent-red-dim: rgba(239, 68, 68, 0.15);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1.5rem;
            padding-bottom: 100px;
        }

        @media (max-width: 600px) {
            .lesson-container { padding: 0; padding-bottom: 80px; }
        }

        .lesson-header {
            text-align: center;
            margin-bottom: 2rem;
            padding: 2rem 1rem;
            background: linear-gradient(135deg, var(--bg-secondary), var(--bg-card));
            border-radius: 16px;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                border-left: none;
                border-right: none;
                border-top: none;
                margin-bottom: 8px;
            }
        }

        .lesson-badge {
            display: inline-block;
            padding: 0.4rem 1rem;
            background: var(--accent-purple-dim);
            color: var(--accent-purple);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
            border: 1px solid var(--accent-purple);
        }

        .lesson-header h1 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--text-primary), var(--accent-purple));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        @media (max-width: 600px) {
            .lesson-header h1 { font-size: 1.4rem; }
        }

        .lesson-header p { color: var(--text-secondary); }

        .section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .section {
                border-radius: 0;
                border-left: 4px solid var(--accent-purple);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-color);
                padding: 1rem;
                margin-bottom: 8px;
            }
        }

        .section-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-purple);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .section-title .icon { font-size: 1.4rem; }

        @media (max-width: 600px) {
            .section-title { font-size: 1.1rem; }
        }

        .content-text {
            color: var(--text-secondary);
            margin-bottom: 1rem;
        }

        .highlight-box {
            background: var(--accent-cyan-dim);
            border: 1px solid var(--accent-cyan);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .highlight-box {
                border-radius: 8px;
                margin: 0.5rem 0;
            }
        }

        .highlight-box.gold {
            background: var(--accent-gold-dim);
            border-color: var(--accent-gold);
        }

        .highlight-box.purple {
            background: var(--accent-purple-dim);
            border-color: var(--accent-purple);
        }

        .highlight-box.green {
            background: var(--accent-green-dim);
            border-color: var(--accent-green);
        }

        .highlight-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .image-placeholder {
            background: linear-gradient(135deg, var(--bg-secondary), var(--bg-card));
            border: 2px dashed var(--border-color);
            border-radius: 12px;
            padding: 3rem 1rem;
            text-align: center;
            margin: 1rem 0;
        }

        .image-placeholder img {
            max-width: 100%;
            border-radius: 8px;
        }

        .image-caption {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-top: 0.5rem;
        }

        @media (max-width: 600px) {
            .image-placeholder {
                border-radius: 8px;
                padding: 2rem 1rem;
                margin: 0.5rem 0;
            }
        }

        .roadmap-item {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
            position: relative;
        }

        .roadmap-marker {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            flex-shrink: 0;
            position: relative;
            z-index: 1;
        }

        .roadmap-marker.complete {
            background: var(--accent-green);
            color: var(--bg-primary);
        }

        .roadmap-marker.current {
            background: var(--accent-gold);
            color: var(--bg-primary);
        }

        .roadmap-marker.future {
            background: var(--bg-secondary);
            color: var(--text-muted);
            border: 2px solid var(--border-color);
        }

        .roadmap-content {
            flex: 1;
            padding-bottom: 1rem;
        }

        .roadmap-title {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.3rem;
        }

        .roadmap-desc {
            font-size: 0.9rem;
            color: var(--text-muted);
        }

        .roadmap-item:not(:last-child)::before {
            content: "";
            position: absolute;
            left: 19px;
            top: 40px;
            bottom: 0;
            width: 2px;
            background: var(--border-color);
        }

        .chapter-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1rem;
            margin: 0.5rem 0;
            display: flex;
            align-items: center;
            gap: 1rem;
            border-left: 4px solid var(--accent-green);
        }

        .chapter-number {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: var(--accent-green-dim);
            color: var(--accent-green);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.9rem;
            flex-shrink: 0;
        }

        .chapter-info h4 {
            color: var(--text-primary);
            font-size: 0.95rem;
            margin-bottom: 0.2rem;
        }

        .chapter-info p {
            color: var(--text-muted);
            font-size: 0.8rem;
        }

        .chapter-check {
            margin-left: auto;
            color: var(--accent-green);
            font-size: 1.2rem;
        }

        .summary-box {
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border: 2px solid var(--accent-purple);
            border-radius: 16px;
            padding: 1.5rem;
            margin-top: 2rem;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                border-left: 4px solid var(--accent-purple);
                border-right: none;
                border-top: none;
                border-bottom: none;
                padding: 1rem;
                margin-top: 8px;
            }
        }

        .summary-title {
            font-size: 1.2rem;
            color: var(--accent-purple);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-list {
            list-style: none;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--accent-green);
            font-weight: bold;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            color: var(--text-muted);
            font-size: 0.85rem;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">MODULE A - PHẦN 2/4</span>
            <h1>Bản Đồ Hành Trình Của Bạn</h1>
            <p>Nhìn lại những gì đã đi qua</p>
        </header>

        <section class="section">
            <h2 class="section-title"><span class="icon">🗺️</span> Lộ Trình Hoàn Chỉnh</h2>
            <p class="content-text">
                Dưới đây là bản đồ hành trình từ khi bạn bắt đầu đến hiện tại. Mỗi bước đều quan trọng
                và xây dựng nền tảng cho bước tiếp theo:
            </p>

            <div class="roadmap-item">
                <div class="roadmap-marker complete">1</div>
                <div class="roadmap-content">
                    <div class="roadmap-title">Kiến Thức Nền Tảng</div>
                    <div class="roadmap-desc">Hiểu về thị trường, candlestick, các khái niệm cơ bản</div>
                </div>
            </div>

            <div class="roadmap-item">
                <div class="roadmap-marker complete">2</div>
                <div class="roadmap-content">
                    <div class="roadmap-title">GEM Patterns</div>
                    <div class="roadmap-desc">Thành thạo 4 patterns: DPD, UPU, UPD, DPU</div>
                </div>
            </div>

            <div class="roadmap-item">
                <div class="roadmap-marker complete">3</div>
                <div class="roadmap-content">
                    <div class="roadmap-title">Classic Patterns</div>
                    <div class="roadmap-desc">Bổ sung kiến thức với Head & Shoulders, Double Top/Bottom...</div>
                </div>
            </div>

            <div class="roadmap-item">
                <div class="roadmap-marker complete">4</div>
                <div class="roadmap-content">
                    <div class="roadmap-title">Thực Hành</div>
                    <div class="roadmap-desc">Paper Trading, Backtesting, Trading Journal</div>
                </div>
            </div>

            <div class="roadmap-item">
                <div class="roadmap-marker complete">5</div>
                <div class="roadmap-content">
                    <div class="roadmap-title">Công Cụ AI</div>
                    <div class="roadmap-desc">Sử dụng GEM Master AI, Scanner, Alerts</div>
                </div>
            </div>

            <div class="roadmap-item">
                <div class="roadmap-marker current">6</div>
                <div class="roadmap-content">
                    <div class="roadmap-title">Module A & B</div>
                    <div class="roadmap-desc">Hành trình chuyển hóa và cơ hội tiếp theo ← Bạn đang ở đây</div>
                </div>
            </div>

            <div class="roadmap-item">
                <div class="roadmap-marker future">7</div>
                <div class="roadmap-content">
                    <div class="roadmap-title">TIER 2 & Beyond</div>
                    <div class="roadmap-desc">Nâng cao kỹ năng với patterns và công cụ chuyên sâu hơn</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/6A5BFF?text=Learning+Roadmap" alt="Lộ trình học tập">
                <p class="image-caption">Hình 9.2.1: Bản đồ hành trình từ A đến Z</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📚</span> 8 Chương Đã Hoàn Thành</h2>
            <p class="content-text">Chi tiết các chương bạn đã học trong TIER 1:</p>

            <div class="chapter-card">
                <div class="chapter-number">3</div>
                <div class="chapter-info">
                    <h4>UPU Pattern - Tiếp Diễn Tăng</h4>
                    <p>5 bài • Cấu trúc, LFZ, Entry, Checklist, Ví dụ</p>
                </div>
                <div class="chapter-check">✓</div>
            </div>

            <div class="chapter-card">
                <div class="chapter-number">4</div>
                <div class="chapter-info">
                    <h4>UPD Pattern - Đảo Chiều Giảm</h4>
                    <p>6 bài • Cấu trúc, HFZ, Entry, So sánh, Ví dụ</p>
                </div>
                <div class="chapter-check">✓</div>
            </div>

            <div class="chapter-card">
                <div class="chapter-number">5</div>
                <div class="chapter-info">
                    <h4>DPU Pattern - Đảo Chiều Tăng</h4>
                    <p>6 bài • Cấu trúc, LFZ, Entry, Checklist, Ví dụ</p>
                </div>
                <div class="chapter-check">✓</div>
            </div>

            <div class="chapter-card">
                <div class="chapter-number">6</div>
                <div class="chapter-info">
                    <h4>Classic Patterns Cơ Bản</h4>
                    <p>6 bài • Flag, Pennant, Triangle, H&S, Double Top/Bottom</p>
                </div>
                <div class="chapter-check">✓</div>
            </div>

            <div class="chapter-card">
                <div class="chapter-number">7</div>
                <div class="chapter-info">
                    <h4>Paper Trading & Backtesting</h4>
                    <p>5 bài • Paper Trade, GEM App, Journal, Backtest, Real Trading</p>
                </div>
                <div class="chapter-check">✓</div>
            </div>

            <div class="chapter-card">
                <div class="chapter-number">8</div>
                <div class="chapter-info">
                    <h4>GEM Master AI Cơ Bản</h4>
                    <p>5 bài • Chatbot, Scanner, Alerts, Tổng kết</p>
                </div>
                <div class="chapter-check">✓</div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📊</span> Thống Kê Học Tập</h2>

            <div class="highlight-box gold">
                <div class="highlight-title">📈 Con Số Ấn Tượng</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li><strong>8 chapters</strong> kiến thức kỹ thuật</li>
                    <li><strong>33+ bài học</strong> chi tiết</li>
                    <li><strong>4 patterns</strong> cốt lõi GEM</li>
                    <li><strong>6 classic patterns</strong> bổ trợ</li>
                    <li><strong>~8 giờ</strong> nội dung học</li>
                    <li><strong>50+ quiz</strong> kiểm tra kiến thức</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x300/112250/FFBD59?text=Learning+Statistics" alt="Thống kê học tập">
                <p class="image-caption">Hình 9.2.2: Thành tựu học tập của bạn trong TIER 1</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🎯</span> Bạn Đang Ở Đâu Trên Bản Đồ</h2>
            <p class="content-text">
                Hiện tại bạn đã hoàn thành <strong>TIER 1</strong> - nền tảng vững chắc nhất.
                Từ đây, có nhiều con đường phía trước:
            </p>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Đã Đạt Được</div>
                <p class="content-text">
                    Kiến thức và kỹ năng để bắt đầu trading có phương pháp, với Win Rate tiềm năng 60-70%.
                </p>
            </div>

            <div class="highlight-box purple">
                <div class="highlight-title">🔮 Phía Trước</div>
                <p class="content-text">
                    TIER 2 với 11 patterns mới, Zone Detection AI, Multi-Timeframe Analysis...<br>
                    TIER 3 với chiến lược nâng cao, Whale Tracking, Portfolio Management...
                </p>
            </div>
        </section>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 9.2</h3>
            <ul class="summary-list">
                <li>Lộ trình học tập 7 giai đoạn từ cơ bản đến nâng cao</li>
                <li>8 chapters hoàn thành với 33+ bài học</li>
                <li>4 GEM patterns + 6 Classic patterns = 10 công cụ trading</li>
                <li>Đang ở giai đoạn 6/7 - sắp hoàn thành TIER 1</li>
                <li>Phía trước: TIER 2 và TIER 3 với kiến thức chuyên sâu hơn</li>
            </ul>
        </div>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Module A: Hành Trình Chuyển Hóa</p>
            <p>Tiếp theo: Bài 9.3 - Sự Thay Đổi Thực Sự</p>
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

-- Lesson 9.3: Sự Thay Đổi Thực Sự - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch9-l3',
  'module-tier-1-ch9',
  'course-tier1-trading-foundation',
  'Bài 9.3: Sự Thay Đổi Thực Sự - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 9.3: Sự Thay Đổi Thực Sự - GEM Trading Academy</title>
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --bg-card: #1a1a25;
            --text-primary: #ffffff;
            --text-secondary: #a0a0b0;
            --text-muted: #6a6a7a;
            --border-color: #2a2a3a;
            --accent-gold: #FFBD59;
            --accent-gold-dim: rgba(255, 189, 89, 0.2);
            --accent-cyan: #00F0FF;
            --accent-cyan-dim: rgba(0, 240, 255, 0.15);
            --accent-purple: #6A5BFF;
            --accent-purple-dim: rgba(106, 91, 255, 0.15);
            --accent-green: #10B981;
            --accent-green-dim: rgba(16, 185, 129, 0.15);
            --accent-red: #EF4444;
            --accent-red-dim: rgba(239, 68, 68, 0.15);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1.5rem;
            padding-bottom: 100px;
        }

        @media (max-width: 600px) {
            .lesson-container { padding: 0; padding-bottom: 80px; }
        }

        .lesson-header {
            text-align: center;
            margin-bottom: 2rem;
            padding: 2rem 1rem;
            background: linear-gradient(135deg, var(--bg-secondary), var(--bg-card));
            border-radius: 16px;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                border-left: none;
                border-right: none;
                border-top: none;
                margin-bottom: 8px;
            }
        }

        .lesson-badge {
            display: inline-block;
            padding: 0.4rem 1rem;
            background: var(--accent-purple-dim);
            color: var(--accent-purple);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
            border: 1px solid var(--accent-purple);
        }

        .lesson-header h1 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--text-primary), var(--accent-purple));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        @media (max-width: 600px) {
            .lesson-header h1 { font-size: 1.4rem; }
        }

        .lesson-header p { color: var(--text-secondary); }

        .section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .section {
                border-radius: 0;
                border-left: 4px solid var(--accent-purple);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-color);
                padding: 1rem;
                margin-bottom: 8px;
            }
        }

        .section-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-purple);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .section-title .icon { font-size: 1.4rem; }

        @media (max-width: 600px) {
            .section-title { font-size: 1.1rem; }
        }

        .content-text {
            color: var(--text-secondary);
            margin-bottom: 1rem;
        }

        .highlight-box {
            background: var(--accent-cyan-dim);
            border: 1px solid var(--accent-cyan);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .highlight-box {
                border-radius: 8px;
                margin: 0.5rem 0;
            }
        }

        .highlight-box.gold {
            background: var(--accent-gold-dim);
            border-color: var(--accent-gold);
        }

        .highlight-box.purple {
            background: var(--accent-purple-dim);
            border-color: var(--accent-purple);
        }

        .highlight-box.green {
            background: var(--accent-green-dim);
            border-color: var(--accent-green);
        }

        .highlight-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .image-placeholder {
            background: linear-gradient(135deg, var(--bg-secondary), var(--bg-card));
            border: 2px dashed var(--border-color);
            border-radius: 12px;
            padding: 3rem 1rem;
            text-align: center;
            margin: 1rem 0;
        }

        .image-placeholder img {
            max-width: 100%;
            border-radius: 8px;
        }

        .image-caption {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-top: 0.5rem;
        }

        @media (max-width: 600px) {
            .image-placeholder {
                border-radius: 8px;
                padding: 2rem 1rem;
                margin: 0.5rem 0;
            }
        }

        .mindset-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-gold);
        }

        .mindset-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        .mindset-title {
            color: var(--accent-gold);
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .mindset-desc {
            color: var(--text-secondary);
            font-size: 0.95rem;
        }

        .quote-box {
            background: linear-gradient(135deg, var(--accent-gold-dim), transparent);
            border-left: 4px solid var(--accent-gold);
            padding: 1.5rem;
            margin: 1.5rem 0;
            font-style: italic;
        }

        .quote-text {
            font-size: 1.1rem;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }

        .quote-author {
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .summary-box {
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border: 2px solid var(--accent-purple);
            border-radius: 16px;
            padding: 1.5rem;
            margin-top: 2rem;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                border-left: 4px solid var(--accent-purple);
                border-right: none;
                border-top: none;
                border-bottom: none;
                padding: 1rem;
                margin-top: 8px;
            }
        }

        .summary-title {
            font-size: 1.2rem;
            color: var(--accent-purple);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-list {
            list-style: none;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--accent-green);
            font-weight: bold;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            color: var(--text-muted);
            font-size: 0.85rem;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">MODULE A - PHẦN 3/4</span>
            <h1>Sự Thay Đổi Thực Sự</h1>
            <p>Sâu hơn kỹ năng - thay đổi từ bên trong</p>
        </header>

        <section class="section">
            <h2 class="section-title"><span class="icon">🧠</span> Sự Thay Đổi Không Chỉ Là Kỹ Năng</h2>
            <p class="content-text">
                Học được patterns và chiến lược chỉ là bề nổi của tảng băng. Sự thay đổi thực sự nằm ở
                <strong>tư duy, thói quen, và cách bạn nhìn nhận mọi thứ</strong>.
            </p>

            <div class="highlight-box gold">
                <div class="highlight-title">💡 Sự Thật Về Trading</div>
                <p class="content-text">
                    80% thành công trong trading đến từ <strong>tâm lý và kỷ luật</strong>,
                    chỉ 20% đến từ kiến thức kỹ thuật. Bạn đã có 20%, giờ hãy xây dựng 80% còn lại.
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/6A5BFF?text=Trading+Success+Formula" alt="Công thức thành công">
                <p class="image-caption">Hình 9.3.1: 80% thành công đến từ tâm lý và kỷ luật</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">✨</span> 5 Thay Đổi Tư Duy Quan Trọng</h2>

            <div class="mindset-card">
                <div class="mindset-icon">🎯</div>
                <div class="mindset-title">1. Từ "Đúng/Sai" → "Xác Suất"</div>
                <div class="mindset-desc">
                    Không có setup nào đúng 100%. Trading là trò chơi xác suất. Win Rate 60-70% nghĩa là
                    vẫn sẽ thua 30-40% trades - và điều đó hoàn toàn bình thường.
                </div>
            </div>

            <div class="mindset-card">
                <div class="mindset-icon">⏳</div>
                <div class="mindset-title">2. Từ "Kiếm Nhanh" → "Kiếm Bền"</div>
                <div class="mindset-desc">
                    Không có con đường tắt. Trading có lợi nhuận bền vững đến từ sự nhất quán,
                    không phải một vài trades may mắn.
                </div>
            </div>

            <div class="mindset-card">
                <div class="mindset-icon">📊</div>
                <div class="mindset-title">3. Từ "Dự Đoán" → "Phản Ứng"</div>
                <div class="mindset-desc">
                    Không ai có thể dự đoán thị trường. Trader giỏi không dự đoán, họ phản ứng với những gì
                    thị trường cho thấy dựa trên patterns và zones.
                </div>
            </div>

            <div class="mindset-card">
                <div class="mindset-icon">💰</div>
                <div class="mindset-title">4. Từ "Tất Tay" → "Quản Lý Vốn"</div>
                <div class="mindset-desc">
                    Một trade thua có thể chấp nhận. Mất toàn bộ vốn thì không. Rule 2%/trade giúp bạn
                    sống sót đủ lâu để học và cải thiện.
                </div>
            </div>

            <div class="mindset-card">
                <div class="mindset-icon">📝</div>
                <div class="mindset-title">5. Từ "Cảm Xúc" → "Kỷ Luật"</div>
                <div class="mindset-desc">
                    Cảm xúc là kẻ thù lớn nhất của trader. Checklist, rules, và journal giúp bạn
                    trade theo logic, không theo cảm xúc.
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🔄</span> Thói Quen Mới Thay Thế Thói Quen Cũ</h2>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Thói Quen Mới</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>Kiểm tra Scanner mỗi sáng</li>
                    <li>Chạy Checklist trước mỗi trade</li>
                    <li>Ghi chép Journal sau mỗi trade</li>
                    <li>Review kết quả cuối tuần</li>
                    <li>Đặt SL ngay khi entry</li>
                    <li>Không trade khi cảm xúc mạnh</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/10B981?text=New+Trading+Habits" alt="Thói quen mới">
                <p class="image-caption">Hình 9.3.2: Các thói quen mới của một trader có kỷ luật</p>
            </div>
        </section>

        <div class="quote-box">
            <p class="quote-text">"Thị trường có thể phi lý lâu hơn bạn có thể giữ được khả năng thanh toán. Hãy quản lý rủi ro như thể ngày mai là ngày tận thế."</p>
            <p class="quote-author">— John Maynard Keynes (điều chỉnh)</p>
        </div>

        <section class="section">
            <h2 class="section-title"><span class="icon">🌟</span> Giá Trị Thực Sự Bạn Nhận Được</h2>
            <p class="content-text">
                Ngoài kiến thức trading, bạn còn học được nhiều thứ có giá trị trong cuộc sống:
            </p>

            <div class="highlight-box purple">
                <div class="highlight-title">🎓 Kỹ Năng Chuyển Đổi</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li><strong>Kiên nhẫn</strong> - Chờ đợi setup tốt thay vì hành động vội vàng</li>
                    <li><strong>Kỷ luật</strong> - Tuân thủ quy tắc dù cảm xúc muốn làm khác</li>
                    <li><strong>Quản lý rủi ro</strong> - Đánh giá và giới hạn rủi ro trong mọi quyết định</li>
                    <li><strong>Phân tích logic</strong> - Ra quyết định dựa trên dữ liệu, không cảm tính</li>
                    <li><strong>Học từ thất bại</strong> - Xem mỗi sai lầm như bài học quý giá</li>
                </ul>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">💭</span> Câu Hỏi Để Suy Ngẫm</h2>
            <p class="content-text">
                Hãy dành vài phút suy nghĩ về những câu hỏi sau:
            </p>

            <div class="highlight-box">
                <div class="highlight-title">🤔 Reflection Questions</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>Điều gì là thay đổi lớn nhất trong tư duy của bạn sau khóa học?</li>
                    <li>Thói quen nào bạn cảm thấy khó duy trì nhất? Tại sao?</li>
                    <li>Bạn đã áp dụng kỷ luật trading vào các lĩnh vực khác của cuộc sống chưa?</li>
                    <li>Điều gì sẽ khác nếu bạn học những điều này sớm hơn 1 năm?</li>
                </ul>
            </div>
        </section>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 9.3</h3>
            <ul class="summary-list">
                <li>80% thành công trading đến từ tâm lý và kỷ luật</li>
                <li>5 thay đổi tư duy: Xác suất, Bền vững, Phản ứng, Quản lý vốn, Kỷ luật</li>
                <li>Thói quen mới thay thế thói quen cũ: Scanner, Checklist, Journal, Review</li>
                <li>Kỹ năng chuyển đổi: Kiên nhẫn, Kỷ luật, Quản lý rủi ro, Phân tích logic</li>
                <li>Sự thay đổi thực sự đến từ bên trong, không chỉ kiến thức bề ngoài</li>
            </ul>
        </div>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Module A: Hành Trình Chuyển Hóa</p>
            <p>Tiếp theo: Bài 9.4 - Điều Khiến Bạn Khác Biệt Bây Giờ</p>
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
    <title>Bài 9.3: Sự Thay Đổi Thực Sự - GEM Trading Academy</title>
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --bg-card: #1a1a25;
            --text-primary: #ffffff;
            --text-secondary: #a0a0b0;
            --text-muted: #6a6a7a;
            --border-color: #2a2a3a;
            --accent-gold: #FFBD59;
            --accent-gold-dim: rgba(255, 189, 89, 0.2);
            --accent-cyan: #00F0FF;
            --accent-cyan-dim: rgba(0, 240, 255, 0.15);
            --accent-purple: #6A5BFF;
            --accent-purple-dim: rgba(106, 91, 255, 0.15);
            --accent-green: #10B981;
            --accent-green-dim: rgba(16, 185, 129, 0.15);
            --accent-red: #EF4444;
            --accent-red-dim: rgba(239, 68, 68, 0.15);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1.5rem;
            padding-bottom: 100px;
        }

        @media (max-width: 600px) {
            .lesson-container { padding: 0; padding-bottom: 80px; }
        }

        .lesson-header {
            text-align: center;
            margin-bottom: 2rem;
            padding: 2rem 1rem;
            background: linear-gradient(135deg, var(--bg-secondary), var(--bg-card));
            border-radius: 16px;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                border-left: none;
                border-right: none;
                border-top: none;
                margin-bottom: 8px;
            }
        }

        .lesson-badge {
            display: inline-block;
            padding: 0.4rem 1rem;
            background: var(--accent-purple-dim);
            color: var(--accent-purple);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
            border: 1px solid var(--accent-purple);
        }

        .lesson-header h1 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--text-primary), var(--accent-purple));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        @media (max-width: 600px) {
            .lesson-header h1 { font-size: 1.4rem; }
        }

        .lesson-header p { color: var(--text-secondary); }

        .section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .section {
                border-radius: 0;
                border-left: 4px solid var(--accent-purple);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-color);
                padding: 1rem;
                margin-bottom: 8px;
            }
        }

        .section-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-purple);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .section-title .icon { font-size: 1.4rem; }

        @media (max-width: 600px) {
            .section-title { font-size: 1.1rem; }
        }

        .content-text {
            color: var(--text-secondary);
            margin-bottom: 1rem;
        }

        .highlight-box {
            background: var(--accent-cyan-dim);
            border: 1px solid var(--accent-cyan);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .highlight-box {
                border-radius: 8px;
                margin: 0.5rem 0;
            }
        }

        .highlight-box.gold {
            background: var(--accent-gold-dim);
            border-color: var(--accent-gold);
        }

        .highlight-box.purple {
            background: var(--accent-purple-dim);
            border-color: var(--accent-purple);
        }

        .highlight-box.green {
            background: var(--accent-green-dim);
            border-color: var(--accent-green);
        }

        .highlight-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .image-placeholder {
            background: linear-gradient(135deg, var(--bg-secondary), var(--bg-card));
            border: 2px dashed var(--border-color);
            border-radius: 12px;
            padding: 3rem 1rem;
            text-align: center;
            margin: 1rem 0;
        }

        .image-placeholder img {
            max-width: 100%;
            border-radius: 8px;
        }

        .image-caption {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-top: 0.5rem;
        }

        @media (max-width: 600px) {
            .image-placeholder {
                border-radius: 8px;
                padding: 2rem 1rem;
                margin: 0.5rem 0;
            }
        }

        .mindset-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-gold);
        }

        .mindset-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        .mindset-title {
            color: var(--accent-gold);
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .mindset-desc {
            color: var(--text-secondary);
            font-size: 0.95rem;
        }

        .quote-box {
            background: linear-gradient(135deg, var(--accent-gold-dim), transparent);
            border-left: 4px solid var(--accent-gold);
            padding: 1.5rem;
            margin: 1.5rem 0;
            font-style: italic;
        }

        .quote-text {
            font-size: 1.1rem;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }

        .quote-author {
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .summary-box {
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border: 2px solid var(--accent-purple);
            border-radius: 16px;
            padding: 1.5rem;
            margin-top: 2rem;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                border-left: 4px solid var(--accent-purple);
                border-right: none;
                border-top: none;
                border-bottom: none;
                padding: 1rem;
                margin-top: 8px;
            }
        }

        .summary-title {
            font-size: 1.2rem;
            color: var(--accent-purple);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-list {
            list-style: none;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--accent-green);
            font-weight: bold;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            color: var(--text-muted);
            font-size: 0.85rem;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">MODULE A - PHẦN 3/4</span>
            <h1>Sự Thay Đổi Thực Sự</h1>
            <p>Sâu hơn kỹ năng - thay đổi từ bên trong</p>
        </header>

        <section class="section">
            <h2 class="section-title"><span class="icon">🧠</span> Sự Thay Đổi Không Chỉ Là Kỹ Năng</h2>
            <p class="content-text">
                Học được patterns và chiến lược chỉ là bề nổi của tảng băng. Sự thay đổi thực sự nằm ở
                <strong>tư duy, thói quen, và cách bạn nhìn nhận mọi thứ</strong>.
            </p>

            <div class="highlight-box gold">
                <div class="highlight-title">💡 Sự Thật Về Trading</div>
                <p class="content-text">
                    80% thành công trong trading đến từ <strong>tâm lý và kỷ luật</strong>,
                    chỉ 20% đến từ kiến thức kỹ thuật. Bạn đã có 20%, giờ hãy xây dựng 80% còn lại.
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/6A5BFF?text=Trading+Success+Formula" alt="Công thức thành công">
                <p class="image-caption">Hình 9.3.1: 80% thành công đến từ tâm lý và kỷ luật</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">✨</span> 5 Thay Đổi Tư Duy Quan Trọng</h2>

            <div class="mindset-card">
                <div class="mindset-icon">🎯</div>
                <div class="mindset-title">1. Từ "Đúng/Sai" → "Xác Suất"</div>
                <div class="mindset-desc">
                    Không có setup nào đúng 100%. Trading là trò chơi xác suất. Win Rate 60-70% nghĩa là
                    vẫn sẽ thua 30-40% trades - và điều đó hoàn toàn bình thường.
                </div>
            </div>

            <div class="mindset-card">
                <div class="mindset-icon">⏳</div>
                <div class="mindset-title">2. Từ "Kiếm Nhanh" → "Kiếm Bền"</div>
                <div class="mindset-desc">
                    Không có con đường tắt. Trading có lợi nhuận bền vững đến từ sự nhất quán,
                    không phải một vài trades may mắn.
                </div>
            </div>

            <div class="mindset-card">
                <div class="mindset-icon">📊</div>
                <div class="mindset-title">3. Từ "Dự Đoán" → "Phản Ứng"</div>
                <div class="mindset-desc">
                    Không ai có thể dự đoán thị trường. Trader giỏi không dự đoán, họ phản ứng với những gì
                    thị trường cho thấy dựa trên patterns và zones.
                </div>
            </div>

            <div class="mindset-card">
                <div class="mindset-icon">💰</div>
                <div class="mindset-title">4. Từ "Tất Tay" → "Quản Lý Vốn"</div>
                <div class="mindset-desc">
                    Một trade thua có thể chấp nhận. Mất toàn bộ vốn thì không. Rule 2%/trade giúp bạn
                    sống sót đủ lâu để học và cải thiện.
                </div>
            </div>

            <div class="mindset-card">
                <div class="mindset-icon">📝</div>
                <div class="mindset-title">5. Từ "Cảm Xúc" → "Kỷ Luật"</div>
                <div class="mindset-desc">
                    Cảm xúc là kẻ thù lớn nhất của trader. Checklist, rules, và journal giúp bạn
                    trade theo logic, không theo cảm xúc.
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🔄</span> Thói Quen Mới Thay Thế Thói Quen Cũ</h2>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Thói Quen Mới</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>Kiểm tra Scanner mỗi sáng</li>
                    <li>Chạy Checklist trước mỗi trade</li>
                    <li>Ghi chép Journal sau mỗi trade</li>
                    <li>Review kết quả cuối tuần</li>
                    <li>Đặt SL ngay khi entry</li>
                    <li>Không trade khi cảm xúc mạnh</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/10B981?text=New+Trading+Habits" alt="Thói quen mới">
                <p class="image-caption">Hình 9.3.2: Các thói quen mới của một trader có kỷ luật</p>
            </div>
        </section>

        <div class="quote-box">
            <p class="quote-text">"Thị trường có thể phi lý lâu hơn bạn có thể giữ được khả năng thanh toán. Hãy quản lý rủi ro như thể ngày mai là ngày tận thế."</p>
            <p class="quote-author">— John Maynard Keynes (điều chỉnh)</p>
        </div>

        <section class="section">
            <h2 class="section-title"><span class="icon">🌟</span> Giá Trị Thực Sự Bạn Nhận Được</h2>
            <p class="content-text">
                Ngoài kiến thức trading, bạn còn học được nhiều thứ có giá trị trong cuộc sống:
            </p>

            <div class="highlight-box purple">
                <div class="highlight-title">🎓 Kỹ Năng Chuyển Đổi</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li><strong>Kiên nhẫn</strong> - Chờ đợi setup tốt thay vì hành động vội vàng</li>
                    <li><strong>Kỷ luật</strong> - Tuân thủ quy tắc dù cảm xúc muốn làm khác</li>
                    <li><strong>Quản lý rủi ro</strong> - Đánh giá và giới hạn rủi ro trong mọi quyết định</li>
                    <li><strong>Phân tích logic</strong> - Ra quyết định dựa trên dữ liệu, không cảm tính</li>
                    <li><strong>Học từ thất bại</strong> - Xem mỗi sai lầm như bài học quý giá</li>
                </ul>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">💭</span> Câu Hỏi Để Suy Ngẫm</h2>
            <p class="content-text">
                Hãy dành vài phút suy nghĩ về những câu hỏi sau:
            </p>

            <div class="highlight-box">
                <div class="highlight-title">🤔 Reflection Questions</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>Điều gì là thay đổi lớn nhất trong tư duy của bạn sau khóa học?</li>
                    <li>Thói quen nào bạn cảm thấy khó duy trì nhất? Tại sao?</li>
                    <li>Bạn đã áp dụng kỷ luật trading vào các lĩnh vực khác của cuộc sống chưa?</li>
                    <li>Điều gì sẽ khác nếu bạn học những điều này sớm hơn 1 năm?</li>
                </ul>
            </div>
        </section>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 9.3</h3>
            <ul class="summary-list">
                <li>80% thành công trading đến từ tâm lý và kỷ luật</li>
                <li>5 thay đổi tư duy: Xác suất, Bền vững, Phản ứng, Quản lý vốn, Kỷ luật</li>
                <li>Thói quen mới thay thế thói quen cũ: Scanner, Checklist, Journal, Review</li>
                <li>Kỹ năng chuyển đổi: Kiên nhẫn, Kỷ luật, Quản lý rủi ro, Phân tích logic</li>
                <li>Sự thay đổi thực sự đến từ bên trong, không chỉ kiến thức bề ngoài</li>
            </ul>
        </div>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Module A: Hành Trình Chuyển Hóa</p>
            <p>Tiếp theo: Bài 9.4 - Điều Khiến Bạn Khác Biệt Bây Giờ</p>
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

-- Lesson 9.4: Điều Khiến Bạn Khác Biệt - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch9-l4',
  'module-tier-1-ch9',
  'course-tier1-trading-foundation',
  'Bài 9.4: Điều Khiến Bạn Khác Biệt - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 9.4: Điều Khiến Bạn Khác Biệt - GEM Trading Academy</title>
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --bg-card: #1a1a25;
            --text-primary: #ffffff;
            --text-secondary: #a0a0b0;
            --text-muted: #6a6a7a;
            --border-color: #2a2a3a;
            --accent-gold: #FFBD59;
            --accent-gold-dim: rgba(255, 189, 89, 0.2);
            --accent-cyan: #00F0FF;
            --accent-cyan-dim: rgba(0, 240, 255, 0.15);
            --accent-purple: #6A5BFF;
            --accent-purple-dim: rgba(106, 91, 255, 0.15);
            --accent-green: #10B981;
            --accent-green-dim: rgba(16, 185, 129, 0.15);
            --accent-red: #EF4444;
            --accent-red-dim: rgba(239, 68, 68, 0.15);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1.5rem;
            padding-bottom: 100px;
        }

        @media (max-width: 600px) {
            .lesson-container { padding: 0; padding-bottom: 80px; }
        }

        .lesson-header {
            text-align: center;
            margin-bottom: 2rem;
            padding: 2rem 1rem;
            background: linear-gradient(135deg, var(--accent-gold-dim), var(--accent-purple-dim));
            border-radius: 16px;
            border: 1px solid var(--accent-gold);
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                border-left: none;
                border-right: none;
                border-top: none;
                margin-bottom: 8px;
            }
        }

        .lesson-badge {
            display: inline-block;
            padding: 0.4rem 1rem;
            background: var(--accent-gold);
            color: var(--bg-primary);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .lesson-header h1 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--accent-gold), var(--text-primary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        @media (max-width: 600px) {
            .lesson-header h1 { font-size: 1.4rem; }
        }

        .lesson-header p { color: var(--text-secondary); }

        .section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .section {
                border-radius: 0;
                border-left: 4px solid var(--accent-gold);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-color);
                padding: 1rem;
                margin-bottom: 8px;
            }
        }

        .section-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-gold);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .section-title .icon { font-size: 1.4rem; }

        @media (max-width: 600px) {
            .section-title { font-size: 1.1rem; }
        }

        .content-text {
            color: var(--text-secondary);
            margin-bottom: 1rem;
        }

        .highlight-box {
            background: var(--accent-cyan-dim);
            border: 1px solid var(--accent-cyan);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .highlight-box {
                border-radius: 8px;
                margin: 0.5rem 0;
            }
        }

        .highlight-box.gold {
            background: var(--accent-gold-dim);
            border-color: var(--accent-gold);
        }

        .highlight-box.purple {
            background: var(--accent-purple-dim);
            border-color: var(--accent-purple);
        }

        .highlight-box.green {
            background: var(--accent-green-dim);
            border-color: var(--accent-green);
        }

        .highlight-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .image-placeholder {
            background: linear-gradient(135deg, var(--bg-secondary), var(--bg-card));
            border: 2px dashed var(--border-color);
            border-radius: 12px;
            padding: 3rem 1rem;
            text-align: center;
            margin: 1rem 0;
        }

        .image-placeholder img {
            max-width: 100%;
            border-radius: 8px;
        }

        .image-caption {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-top: 0.5rem;
        }

        @media (max-width: 600px) {
            .image-placeholder {
                border-radius: 8px;
                padding: 2rem 1rem;
                margin: 0.5rem 0;
            }
        }

        .advantage-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .advantage-grid {
                grid-template-columns: 1fr;
                gap: 8px;
            }
        }

        .advantage-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.2rem;
            text-align: center;
            border: 1px solid var(--accent-gold);
        }

        .advantage-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        .advantage-title {
            color: var(--accent-gold);
            font-weight: 600;
            margin-bottom: 0.3rem;
        }

        .advantage-desc {
            color: var(--text-muted);
            font-size: 0.85rem;
        }

        .comparison-item {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1rem;
            margin: 0.5rem 0;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .comparison-icon {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
            flex-shrink: 0;
        }

        .comparison-icon.them { background: var(--accent-red-dim); }
        .comparison-icon.you { background: var(--accent-green-dim); }

        .comparison-content h4 {
            color: var(--text-primary);
            margin-bottom: 0.2rem;
        }

        .comparison-content p {
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .congrats-box {
            background: linear-gradient(135deg, var(--accent-gold-dim), var(--accent-purple-dim));
            border: 2px solid var(--accent-gold);
            border-radius: 16px;
            padding: 2rem;
            text-align: center;
            margin: 2rem 0;
        }

        .congrats-emoji {
            font-size: 4rem;
            margin-bottom: 1rem;
        }

        .congrats-title {
            font-size: 1.5rem;
            color: var(--accent-gold);
            margin-bottom: 0.5rem;
        }

        .congrats-subtitle {
            color: var(--text-secondary);
        }

        @media (max-width: 600px) {
            .congrats-box {
                border-radius: 0;
                padding: 1.5rem 1rem;
            }
            .congrats-emoji { font-size: 3rem; }
            .congrats-title { font-size: 1.3rem; }
        }

        .summary-box {
            background: linear-gradient(135deg, var(--accent-gold-dim), transparent);
            border: 2px solid var(--accent-gold);
            border-radius: 16px;
            padding: 1.5rem;
            margin-top: 2rem;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                border-left: 4px solid var(--accent-gold);
                border-right: none;
                border-top: none;
                border-bottom: none;
                padding: 1rem;
                margin-top: 8px;
            }
        }

        .summary-title {
            font-size: 1.2rem;
            color: var(--accent-gold);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-list {
            list-style: none;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--accent-green);
            font-weight: bold;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            color: var(--text-muted);
            font-size: 0.85rem;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">HOÀN THÀNH MODULE A</span>
            <h1>Điều Khiến Bạn Khác Biệt</h1>
            <p>Lợi thế bạn có mà 95% người khác không có</p>
        </header>

        <section class="section">
            <h2 class="section-title"><span class="icon">🏆</span> Bạn vs 95% Trader Khác</h2>
            <p class="content-text">
                Hãy so sánh bạn bây giờ với phần lớn những người đang cố gắng trading ngoài kia:
            </p>

            <div class="comparison-item">
                <div class="comparison-icon them">👥</div>
                <div class="comparison-content">
                    <h4>95% Traders: Không có phương pháp</h4>
                    <p>Trade theo cảm xúc, theo tip, theo đám đông</p>
                </div>
            </div>

            <div class="comparison-item">
                <div class="comparison-icon you">✨</div>
                <div class="comparison-content">
                    <h4>Bạn: Có GEM Frequency Method</h4>
                    <p>4 patterns có Win Rate 65-70%, đã được chứng minh</p>
                </div>
            </div>

            <div class="comparison-item">
                <div class="comparison-icon them">👥</div>
                <div class="comparison-content">
                    <h4>95% Traders: FOMO, panic selling</h4>
                    <p>Mua đỉnh bán đáy, không kiểm soát cảm xúc</p>
                </div>
            </div>

            <div class="comparison-item">
                <div class="comparison-icon you">✨</div>
                <div class="comparison-content">
                    <h4>Bạn: Có Checklist và Rules</h4>
                    <p>Trade có kế hoạch, biết chờ đợi setup tốt</p>
                </div>
            </div>

            <div class="comparison-item">
                <div class="comparison-icon them">👥</div>
                <div class="comparison-content">
                    <h4>95% Traders: Không quản lý vốn</h4>
                    <p>All-in, không đặt SL, một trade mất tất cả</p>
                </div>
            </div>

            <div class="comparison-item">
                <div class="comparison-icon you">✨</div>
                <div class="comparison-content">
                    <h4>Bạn: Quản lý vốn chặt chẽ</h4>
                    <p>Rule 2%, SL luôn đặt, tính toán R:R trước khi entry</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">⚡</span> 8 Lợi Thế Bạn Đang Có</h2>

            <div class="advantage-grid">
                <div class="advantage-card">
                    <div class="advantage-icon">📊</div>
                    <div class="advantage-title">4 Patterns Cốt Lõi</div>
                    <div class="advantage-desc">DPD, UPU, UPD, DPU với Win Rate 65-70%</div>
                </div>
                <div class="advantage-card">
                    <div class="advantage-icon">✅</div>
                    <div class="advantage-title">Checklist 8 Điểm</div>
                    <div class="advantage-desc">Đánh giá chất lượng setup một cách khách quan</div>
                </div>
                <div class="advantage-card">
                    <div class="advantage-icon">🎯</div>
                    <div class="advantage-title">Chiến Lược Entry</div>
                    <div class="advantage-desc">3 phương pháp: Aggressive, Standard, Conservative</div>
                </div>
                <div class="advantage-card">
                    <div class="advantage-icon">💰</div>
                    <div class="advantage-title">Quản Lý Vốn</div>
                    <div class="advantage-desc">Position sizing, SL/TP, R:R calculation</div>
                </div>
                <div class="advantage-card">
                    <div class="advantage-icon">🤖</div>
                    <div class="advantage-title">AI Scanner</div>
                    <div class="advantage-desc">Quét patterns tự động, tiết kiệm hàng giờ mỗi ngày</div>
                </div>
                <div class="advantage-card">
                    <div class="advantage-icon">🔔</div>
                    <div class="advantage-title">Hệ Thống Alerts</div>
                    <div class="advantage-desc">Không bỏ lỡ cơ hội dù đang offline</div>
                </div>
                <div class="advantage-card">
                    <div class="advantage-icon">📝</div>
                    <div class="advantage-title">Trading Journal</div>
                    <div class="advantage-desc">Ghi chép và cải thiện liên tục</div>
                </div>
                <div class="advantage-card">
                    <div class="advantage-icon">👥</div>
                    <div class="advantage-title">Cộng Đồng GEM</div>
                    <div class="advantage-desc">Hỗ trợ, chia sẻ, học hỏi từ members khác</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/FFBD59?text=Your+8+Advantages" alt="8 lợi thế">
                <p class="image-caption">Hình 9.4.1: 8 lợi thế bạn có mà 95% traders không có</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📈</span> Con Đường Phía Trước</h2>
            <p class="content-text">
                Với những lợi thế này, bạn đã có nền tảng vững chắc. Con đường phía trước có nhiều cơ hội:
            </p>

            <div class="highlight-box green">
                <div class="highlight-title">🎯 Mục Tiêu Ngắn Hạn (1-3 tháng)</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>Paper trade đạt Win Rate 60%+ ổn định</li>
                    <li>Chuyển sang real trading với vốn nhỏ</li>
                    <li>Xây dựng thói quen trading kỷ luật</li>
                </ul>
            </div>

            <div class="highlight-box purple">
                <div class="highlight-title">🚀 Mục Tiêu Trung Hạn (3-6 tháng)</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>Hoàn thành TIER 2 - thêm 11 patterns mới</li>
                    <li>Sử dụng Zone Detection AI</li>
                    <li>Master Multi-Timeframe Analysis</li>
                </ul>
            </div>

            <div class="highlight-box gold">
                <div class="highlight-title">⭐ Mục Tiêu Dài Hạn (6-12 tháng)</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>Hoàn thành TIER 3 - Elite Trader</li>
                    <li>Trading có lợi nhuận ổn định</li>
                    <li>Xem xét cơ hội đối tác GEM</li>
                </ul>
            </div>
        </section>

        <div class="congrats-box">
            <div class="congrats-emoji">🎓🏆✨</div>
            <h2 class="congrats-title">Hoàn Thành Module A!</h2>
            <p class="congrats-subtitle">Bạn đã hiểu rõ hành trình chuyển hóa của mình. Tiếp tục với Module B để khám phá các cơ hội phía trước!</p>
        </div>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 9.4</h3>
            <ul class="summary-list">
                <li>Bạn đã vượt qua 95% traders với phương pháp, kỷ luật, và công cụ</li>
                <li>8 lợi thế chính: Patterns, Checklist, Entry, Quản lý vốn, AI, Alerts, Journal, Community</li>
                <li>Con đường phía trước rõ ràng: Paper → Real → TIER 2 → TIER 3</li>
                <li>Nền tảng vững chắc là yếu tố quyết định thành công lâu dài</li>
                <li>Hoàn thành Module A - sẵn sàng cho Module B</li>
            </ul>
        </div>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Module A: Hành Trình Chuyển Hóa - HOÀN THÀNH</p>
            <p>Tiếp theo: Chương 10 - Module B: Cơ Hội & Lựa Chọn</p>
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
    <title>Bài 9.4: Điều Khiến Bạn Khác Biệt - GEM Trading Academy</title>
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --bg-card: #1a1a25;
            --text-primary: #ffffff;
            --text-secondary: #a0a0b0;
            --text-muted: #6a6a7a;
            --border-color: #2a2a3a;
            --accent-gold: #FFBD59;
            --accent-gold-dim: rgba(255, 189, 89, 0.2);
            --accent-cyan: #00F0FF;
            --accent-cyan-dim: rgba(0, 240, 255, 0.15);
            --accent-purple: #6A5BFF;
            --accent-purple-dim: rgba(106, 91, 255, 0.15);
            --accent-green: #10B981;
            --accent-green-dim: rgba(16, 185, 129, 0.15);
            --accent-red: #EF4444;
            --accent-red-dim: rgba(239, 68, 68, 0.15);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1.5rem;
            padding-bottom: 100px;
        }

        @media (max-width: 600px) {
            .lesson-container { padding: 0; padding-bottom: 80px; }
        }

        .lesson-header {
            text-align: center;
            margin-bottom: 2rem;
            padding: 2rem 1rem;
            background: linear-gradient(135deg, var(--accent-gold-dim), var(--accent-purple-dim));
            border-radius: 16px;
            border: 1px solid var(--accent-gold);
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                border-left: none;
                border-right: none;
                border-top: none;
                margin-bottom: 8px;
            }
        }

        .lesson-badge {
            display: inline-block;
            padding: 0.4rem 1rem;
            background: var(--accent-gold);
            color: var(--bg-primary);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .lesson-header h1 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--accent-gold), var(--text-primary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        @media (max-width: 600px) {
            .lesson-header h1 { font-size: 1.4rem; }
        }

        .lesson-header p { color: var(--text-secondary); }

        .section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .section {
                border-radius: 0;
                border-left: 4px solid var(--accent-gold);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-color);
                padding: 1rem;
                margin-bottom: 8px;
            }
        }

        .section-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-gold);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .section-title .icon { font-size: 1.4rem; }

        @media (max-width: 600px) {
            .section-title { font-size: 1.1rem; }
        }

        .content-text {
            color: var(--text-secondary);
            margin-bottom: 1rem;
        }

        .highlight-box {
            background: var(--accent-cyan-dim);
            border: 1px solid var(--accent-cyan);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .highlight-box {
                border-radius: 8px;
                margin: 0.5rem 0;
            }
        }

        .highlight-box.gold {
            background: var(--accent-gold-dim);
            border-color: var(--accent-gold);
        }

        .highlight-box.purple {
            background: var(--accent-purple-dim);
            border-color: var(--accent-purple);
        }

        .highlight-box.green {
            background: var(--accent-green-dim);
            border-color: var(--accent-green);
        }

        .highlight-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .image-placeholder {
            background: linear-gradient(135deg, var(--bg-secondary), var(--bg-card));
            border: 2px dashed var(--border-color);
            border-radius: 12px;
            padding: 3rem 1rem;
            text-align: center;
            margin: 1rem 0;
        }

        .image-placeholder img {
            max-width: 100%;
            border-radius: 8px;
        }

        .image-caption {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-top: 0.5rem;
        }

        @media (max-width: 600px) {
            .image-placeholder {
                border-radius: 8px;
                padding: 2rem 1rem;
                margin: 0.5rem 0;
            }
        }

        .advantage-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .advantage-grid {
                grid-template-columns: 1fr;
                gap: 8px;
            }
        }

        .advantage-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.2rem;
            text-align: center;
            border: 1px solid var(--accent-gold);
        }

        .advantage-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        .advantage-title {
            color: var(--accent-gold);
            font-weight: 600;
            margin-bottom: 0.3rem;
        }

        .advantage-desc {
            color: var(--text-muted);
            font-size: 0.85rem;
        }

        .comparison-item {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1rem;
            margin: 0.5rem 0;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .comparison-icon {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
            flex-shrink: 0;
        }

        .comparison-icon.them { background: var(--accent-red-dim); }
        .comparison-icon.you { background: var(--accent-green-dim); }

        .comparison-content h4 {
            color: var(--text-primary);
            margin-bottom: 0.2rem;
        }

        .comparison-content p {
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .congrats-box {
            background: linear-gradient(135deg, var(--accent-gold-dim), var(--accent-purple-dim));
            border: 2px solid var(--accent-gold);
            border-radius: 16px;
            padding: 2rem;
            text-align: center;
            margin: 2rem 0;
        }

        .congrats-emoji {
            font-size: 4rem;
            margin-bottom: 1rem;
        }

        .congrats-title {
            font-size: 1.5rem;
            color: var(--accent-gold);
            margin-bottom: 0.5rem;
        }

        .congrats-subtitle {
            color: var(--text-secondary);
        }

        @media (max-width: 600px) {
            .congrats-box {
                border-radius: 0;
                padding: 1.5rem 1rem;
            }
            .congrats-emoji { font-size: 3rem; }
            .congrats-title { font-size: 1.3rem; }
        }

        .summary-box {
            background: linear-gradient(135deg, var(--accent-gold-dim), transparent);
            border: 2px solid var(--accent-gold);
            border-radius: 16px;
            padding: 1.5rem;
            margin-top: 2rem;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                border-left: 4px solid var(--accent-gold);
                border-right: none;
                border-top: none;
                border-bottom: none;
                padding: 1rem;
                margin-top: 8px;
            }
        }

        .summary-title {
            font-size: 1.2rem;
            color: var(--accent-gold);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-list {
            list-style: none;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--accent-green);
            font-weight: bold;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            color: var(--text-muted);
            font-size: 0.85rem;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">HOÀN THÀNH MODULE A</span>
            <h1>Điều Khiến Bạn Khác Biệt</h1>
            <p>Lợi thế bạn có mà 95% người khác không có</p>
        </header>

        <section class="section">
            <h2 class="section-title"><span class="icon">🏆</span> Bạn vs 95% Trader Khác</h2>
            <p class="content-text">
                Hãy so sánh bạn bây giờ với phần lớn những người đang cố gắng trading ngoài kia:
            </p>

            <div class="comparison-item">
                <div class="comparison-icon them">👥</div>
                <div class="comparison-content">
                    <h4>95% Traders: Không có phương pháp</h4>
                    <p>Trade theo cảm xúc, theo tip, theo đám đông</p>
                </div>
            </div>

            <div class="comparison-item">
                <div class="comparison-icon you">✨</div>
                <div class="comparison-content">
                    <h4>Bạn: Có GEM Frequency Method</h4>
                    <p>4 patterns có Win Rate 65-70%, đã được chứng minh</p>
                </div>
            </div>

            <div class="comparison-item">
                <div class="comparison-icon them">👥</div>
                <div class="comparison-content">
                    <h4>95% Traders: FOMO, panic selling</h4>
                    <p>Mua đỉnh bán đáy, không kiểm soát cảm xúc</p>
                </div>
            </div>

            <div class="comparison-item">
                <div class="comparison-icon you">✨</div>
                <div class="comparison-content">
                    <h4>Bạn: Có Checklist và Rules</h4>
                    <p>Trade có kế hoạch, biết chờ đợi setup tốt</p>
                </div>
            </div>

            <div class="comparison-item">
                <div class="comparison-icon them">👥</div>
                <div class="comparison-content">
                    <h4>95% Traders: Không quản lý vốn</h4>
                    <p>All-in, không đặt SL, một trade mất tất cả</p>
                </div>
            </div>

            <div class="comparison-item">
                <div class="comparison-icon you">✨</div>
                <div class="comparison-content">
                    <h4>Bạn: Quản lý vốn chặt chẽ</h4>
                    <p>Rule 2%, SL luôn đặt, tính toán R:R trước khi entry</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">⚡</span> 8 Lợi Thế Bạn Đang Có</h2>

            <div class="advantage-grid">
                <div class="advantage-card">
                    <div class="advantage-icon">📊</div>
                    <div class="advantage-title">4 Patterns Cốt Lõi</div>
                    <div class="advantage-desc">DPD, UPU, UPD, DPU với Win Rate 65-70%</div>
                </div>
                <div class="advantage-card">
                    <div class="advantage-icon">✅</div>
                    <div class="advantage-title">Checklist 8 Điểm</div>
                    <div class="advantage-desc">Đánh giá chất lượng setup một cách khách quan</div>
                </div>
                <div class="advantage-card">
                    <div class="advantage-icon">🎯</div>
                    <div class="advantage-title">Chiến Lược Entry</div>
                    <div class="advantage-desc">3 phương pháp: Aggressive, Standard, Conservative</div>
                </div>
                <div class="advantage-card">
                    <div class="advantage-icon">💰</div>
                    <div class="advantage-title">Quản Lý Vốn</div>
                    <div class="advantage-desc">Position sizing, SL/TP, R:R calculation</div>
                </div>
                <div class="advantage-card">
                    <div class="advantage-icon">🤖</div>
                    <div class="advantage-title">AI Scanner</div>
                    <div class="advantage-desc">Quét patterns tự động, tiết kiệm hàng giờ mỗi ngày</div>
                </div>
                <div class="advantage-card">
                    <div class="advantage-icon">🔔</div>
                    <div class="advantage-title">Hệ Thống Alerts</div>
                    <div class="advantage-desc">Không bỏ lỡ cơ hội dù đang offline</div>
                </div>
                <div class="advantage-card">
                    <div class="advantage-icon">📝</div>
                    <div class="advantage-title">Trading Journal</div>
                    <div class="advantage-desc">Ghi chép và cải thiện liên tục</div>
                </div>
                <div class="advantage-card">
                    <div class="advantage-icon">👥</div>
                    <div class="advantage-title">Cộng Đồng GEM</div>
                    <div class="advantage-desc">Hỗ trợ, chia sẻ, học hỏi từ members khác</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/FFBD59?text=Your+8+Advantages" alt="8 lợi thế">
                <p class="image-caption">Hình 9.4.1: 8 lợi thế bạn có mà 95% traders không có</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📈</span> Con Đường Phía Trước</h2>
            <p class="content-text">
                Với những lợi thế này, bạn đã có nền tảng vững chắc. Con đường phía trước có nhiều cơ hội:
            </p>

            <div class="highlight-box green">
                <div class="highlight-title">🎯 Mục Tiêu Ngắn Hạn (1-3 tháng)</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>Paper trade đạt Win Rate 60%+ ổn định</li>
                    <li>Chuyển sang real trading với vốn nhỏ</li>
                    <li>Xây dựng thói quen trading kỷ luật</li>
                </ul>
            </div>

            <div class="highlight-box purple">
                <div class="highlight-title">🚀 Mục Tiêu Trung Hạn (3-6 tháng)</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>Hoàn thành TIER 2 - thêm 11 patterns mới</li>
                    <li>Sử dụng Zone Detection AI</li>
                    <li>Master Multi-Timeframe Analysis</li>
                </ul>
            </div>

            <div class="highlight-box gold">
                <div class="highlight-title">⭐ Mục Tiêu Dài Hạn (6-12 tháng)</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>Hoàn thành TIER 3 - Elite Trader</li>
                    <li>Trading có lợi nhuận ổn định</li>
                    <li>Xem xét cơ hội đối tác GEM</li>
                </ul>
            </div>
        </section>

        <div class="congrats-box">
            <div class="congrats-emoji">🎓🏆✨</div>
            <h2 class="congrats-title">Hoàn Thành Module A!</h2>
            <p class="congrats-subtitle">Bạn đã hiểu rõ hành trình chuyển hóa của mình. Tiếp tục với Module B để khám phá các cơ hội phía trước!</p>
        </div>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 9.4</h3>
            <ul class="summary-list">
                <li>Bạn đã vượt qua 95% traders với phương pháp, kỷ luật, và công cụ</li>
                <li>8 lợi thế chính: Patterns, Checklist, Entry, Quản lý vốn, AI, Alerts, Journal, Community</li>
                <li>Con đường phía trước rõ ràng: Paper → Real → TIER 2 → TIER 3</li>
                <li>Nền tảng vững chắc là yếu tố quyết định thành công lâu dài</li>
                <li>Hoàn thành Module A - sẵn sàng cho Module B</li>
            </ul>
        </div>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Module A: Hành Trình Chuyển Hóa - HOÀN THÀNH</p>
            <p>Tiếp theo: Chương 10 - Module B: Cơ Hội & Lựa Chọn</p>
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
