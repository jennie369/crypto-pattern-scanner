-- =====================================================
-- TIER-1 - Module B: Opportunities
-- Course: course-tier1-trading-foundation
-- File 8/23
-- =====================================================

-- Create/Update Module
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  'module-tier-1-ch10',
  'course-tier1-trading-foundation',
  'Module B: Opportunities',
  'Cơ hội phát triển',
  10,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Lesson 10.1: Ngã Ba Đường - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch10-l1',
  'module-tier-1-ch10',
  'course-tier1-trading-foundation',
  'Bài 10.1: Ngã Ba Đường - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 10.1: Ngã Ba Đường - GEM Trading Academy</title>
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
            background: var(--accent-cyan-dim);
            color: var(--accent-cyan);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
            border: 1px solid var(--accent-cyan);
        }

        .lesson-header h1 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--text-primary), var(--accent-cyan));
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
                border-left: 4px solid var(--accent-cyan);
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
            color: var(--accent-cyan);
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

        .path-card {
            background: var(--bg-secondary);
            border-radius: 16px;
            padding: 1.5rem;
            margin: 1rem 0;
            border-left: 5px solid var(--accent-gold);
        }

        .path-number {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--accent-gold);
            color: var(--bg-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.2rem;
            margin-bottom: 1rem;
        }

        .path-title {
            font-size: 1.2rem;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }

        .path-desc {
            color: var(--text-secondary);
            margin-bottom: 1rem;
        }

        .path-features {
            list-style: none;
        }

        .path-features li {
            padding: 0.4rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .path-features li::before {
            content: "→";
            position: absolute;
            left: 0;
            color: var(--accent-gold);
        }

        .summary-box {
            background: linear-gradient(135deg, var(--accent-cyan-dim), transparent);
            border: 2px solid var(--accent-cyan);
            border-radius: 16px;
            padding: 1.5rem;
            margin-top: 2rem;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                border-left: 4px solid var(--accent-cyan);
                border-right: none;
                border-top: none;
                border-bottom: none;
                padding: 1rem;
                margin-top: 8px;
            }
        }

        .summary-title {
            font-size: 1.2rem;
            color: var(--accent-cyan);
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
            <span class="lesson-badge">MODULE B - PHẦN 1/7</span>
            <h1>Ngã Ba Đường - Bạn Đang Đứng Ở Đâu</h1>
            <p>3 con đường tiếp theo cho hành trình của bạn</p>
        </header>

        <section class="section">
            <h2 class="section-title"><span class="icon">🛤️</span> Bạn Đang Ở Ngã Ba Đường</h2>
            <p class="content-text">
                Sau khi hoàn thành TIER 1, bạn đứng trước một ngã ba quan trọng. Có <strong>3 con đường</strong>
                phía trước, mỗi con đường đều có giá trị riêng:
            </p>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/00F0FF?text=3+Paths+Ahead" alt="3 con đường phía trước">
                <p class="image-caption">Hình 10.1.1: Ngã ba đường sau khi hoàn thành TIER 1</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">1️⃣</span> Con Đường 1: Tiếp Tục Tự Học</h2>

            <div class="path-card">
                <div class="path-number">1</div>
                <h3 class="path-title">Tự Thực Hành Với TIER 1</h3>
                <p class="path-desc">
                    Bạn có thể dừng lại ở TIER 1 và tập trung thực hành với những gì đã học.
                    Đây là con đường hoàn toàn hợp lệ nếu bạn cần thêm thời gian để thành thạo.
                </p>
                <ul class="path-features">
                    <li>Tiếp tục paper trading với 4 patterns</li>
                    <li>Sử dụng AI Scanner với giới hạn TIER 1</li>
                    <li>Tự backtesting và ghi chép journal</li>
                    <li>Tham gia cộng đồng GEM để học hỏi</li>
                </ul>
            </div>

            <div class="highlight-box">
                <div class="highlight-title">💡 Phù Hợp Với Ai?</div>
                <p class="content-text">
                    Những bạn muốn củng cố nền tảng trước, không vội vàng, hoặc đang có ngân sách hạn chế.
                </p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">2️⃣</span> Con Đường 2: Nâng Cấp Lên TIER 2</h2>

            <div class="path-card" style="border-color: var(--accent-purple);">
                <div class="path-number" style="background: var(--accent-purple);">2</div>
                <h3 class="path-title">Nâng Cao Kỹ Năng Trading</h3>
                <p class="path-desc">
                    Nâng cấp lên TIER 2 để mở khóa 11 patterns mới, Zone Detection AI,
                    và nhiều công cụ nâng cao khác để tăng Win Rate và hiệu quả trading.
                </p>
                <ul class="path-features">
                    <li>11 patterns nâng cao (DPD-E, UPU-E, Complex patterns...)</li>
                    <li>HFZ/LFZ Zone Detection AI - xác định zones tự động</li>
                    <li>Multi-Timeframe Analysis</li>
                    <li>Scanner nâng cao: 200 quét/ngày, 150 coins, 3 TFs</li>
                    <li>Telegram alerts integration</li>
                </ul>
            </div>

            <div class="highlight-box purple">
                <div class="highlight-title">🚀 Phù Hợp Với Ai?</div>
                <p class="content-text">
                    Những bạn đã thành thạo TIER 1, muốn tăng tốc học tập, và sẵn sàng đầu tư vào kỹ năng.
                </p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">3️⃣</span> Con Đường 3: Trở Thành Đối Tác GEM</h2>

            <div class="path-card" style="border-color: var(--accent-gold);">
                <div class="path-number" style="background: var(--accent-gold);">3</div>
                <h3 class="path-title">Cơ Hội Kinh Doanh & Phát Triển</h3>
                <p class="path-desc">
                    Ngoài trading, bạn có thể xây dựng nguồn thu nhập thêm bằng cách trở thành
                    đối tác của GEM - giới thiệu sản phẩm và nhận hoa hồng.
                </p>
                <ul class="path-features">
                    <li>Cộng Tác Viên (CTV) - bắt đầu dễ dàng</li>
                    <li>Đại Đối Tác - xây dựng team riêng</li>
                    <li>Giảng Viên - chia sẻ kiến thức với cộng đồng</li>
                    <li>Thu nhập passive từ referral</li>
                </ul>
            </div>

            <div class="highlight-box gold">
                <div class="highlight-title">💰 Phù Hợp Với Ai?</div>
                <p class="content-text">
                    Những bạn có kỹ năng networking, muốn tạo thêm nguồn thu nhập, hoặc đam mê chia sẻ kiến thức.
                </p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🤔</span> Không Cần Chọn Ngay</h2>
            <p class="content-text">
                Bạn không cần phải đưa ra quyết định ngay lập tức. Trong các bài tiếp theo của Module B,
                chúng ta sẽ đi sâu vào từng con đường để bạn có đủ thông tin quyết định.
            </p>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Điều Quan Trọng Nhất</div>
                <p class="content-text">
                    Dù chọn con đường nào, hãy tiếp tục thực hành và áp dụng những gì đã học.
                    Kiến thức không áp dụng sẽ bị lãng quên. <strong>Hành động</strong> mới tạo ra kết quả.
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x300/112250/10B981?text=Take+Action+Today" alt="Hành động ngay">
                <p class="image-caption">Hình 10.1.2: Hành động là chìa khóa thành công</p>
            </div>
        </section>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 10.1</h3>
            <ul class="summary-list">
                <li>Sau TIER 1, bạn đứng trước 3 con đường</li>
                <li>Con đường 1: Tiếp tục tự thực hành với TIER 1</li>
                <li>Con đường 2: Nâng cấp lên TIER 2 để mở khóa tính năng nâng cao</li>
                <li>Con đường 3: Trở thành đối tác GEM để tạo thu nhập thêm</li>
                <li>Không cần quyết định ngay - hãy tìm hiểu thêm trong các bài tiếp theo</li>
            </ul>
        </div>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Module B: Cơ Hội & Lựa Chọn</p>
            <p>Tiếp theo: Bài 10.2 - Công Cụ Tăng Tốc Có Sẵn</p>
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
    <title>Bài 10.1: Ngã Ba Đường - GEM Trading Academy</title>
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
            background: var(--accent-cyan-dim);
            color: var(--accent-cyan);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
            border: 1px solid var(--accent-cyan);
        }

        .lesson-header h1 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--text-primary), var(--accent-cyan));
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
                border-left: 4px solid var(--accent-cyan);
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
            color: var(--accent-cyan);
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

        .path-card {
            background: var(--bg-secondary);
            border-radius: 16px;
            padding: 1.5rem;
            margin: 1rem 0;
            border-left: 5px solid var(--accent-gold);
        }

        .path-number {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--accent-gold);
            color: var(--bg-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.2rem;
            margin-bottom: 1rem;
        }

        .path-title {
            font-size: 1.2rem;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }

        .path-desc {
            color: var(--text-secondary);
            margin-bottom: 1rem;
        }

        .path-features {
            list-style: none;
        }

        .path-features li {
            padding: 0.4rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .path-features li::before {
            content: "→";
            position: absolute;
            left: 0;
            color: var(--accent-gold);
        }

        .summary-box {
            background: linear-gradient(135deg, var(--accent-cyan-dim), transparent);
            border: 2px solid var(--accent-cyan);
            border-radius: 16px;
            padding: 1.5rem;
            margin-top: 2rem;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                border-left: 4px solid var(--accent-cyan);
                border-right: none;
                border-top: none;
                border-bottom: none;
                padding: 1rem;
                margin-top: 8px;
            }
        }

        .summary-title {
            font-size: 1.2rem;
            color: var(--accent-cyan);
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
            <span class="lesson-badge">MODULE B - PHẦN 1/7</span>
            <h1>Ngã Ba Đường - Bạn Đang Đứng Ở Đâu</h1>
            <p>3 con đường tiếp theo cho hành trình của bạn</p>
        </header>

        <section class="section">
            <h2 class="section-title"><span class="icon">🛤️</span> Bạn Đang Ở Ngã Ba Đường</h2>
            <p class="content-text">
                Sau khi hoàn thành TIER 1, bạn đứng trước một ngã ba quan trọng. Có <strong>3 con đường</strong>
                phía trước, mỗi con đường đều có giá trị riêng:
            </p>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/00F0FF?text=3+Paths+Ahead" alt="3 con đường phía trước">
                <p class="image-caption">Hình 10.1.1: Ngã ba đường sau khi hoàn thành TIER 1</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">1️⃣</span> Con Đường 1: Tiếp Tục Tự Học</h2>

            <div class="path-card">
                <div class="path-number">1</div>
                <h3 class="path-title">Tự Thực Hành Với TIER 1</h3>
                <p class="path-desc">
                    Bạn có thể dừng lại ở TIER 1 và tập trung thực hành với những gì đã học.
                    Đây là con đường hoàn toàn hợp lệ nếu bạn cần thêm thời gian để thành thạo.
                </p>
                <ul class="path-features">
                    <li>Tiếp tục paper trading với 4 patterns</li>
                    <li>Sử dụng AI Scanner với giới hạn TIER 1</li>
                    <li>Tự backtesting và ghi chép journal</li>
                    <li>Tham gia cộng đồng GEM để học hỏi</li>
                </ul>
            </div>

            <div class="highlight-box">
                <div class="highlight-title">💡 Phù Hợp Với Ai?</div>
                <p class="content-text">
                    Những bạn muốn củng cố nền tảng trước, không vội vàng, hoặc đang có ngân sách hạn chế.
                </p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">2️⃣</span> Con Đường 2: Nâng Cấp Lên TIER 2</h2>

            <div class="path-card" style="border-color: var(--accent-purple);">
                <div class="path-number" style="background: var(--accent-purple);">2</div>
                <h3 class="path-title">Nâng Cao Kỹ Năng Trading</h3>
                <p class="path-desc">
                    Nâng cấp lên TIER 2 để mở khóa 11 patterns mới, Zone Detection AI,
                    và nhiều công cụ nâng cao khác để tăng Win Rate và hiệu quả trading.
                </p>
                <ul class="path-features">
                    <li>11 patterns nâng cao (DPD-E, UPU-E, Complex patterns...)</li>
                    <li>HFZ/LFZ Zone Detection AI - xác định zones tự động</li>
                    <li>Multi-Timeframe Analysis</li>
                    <li>Scanner nâng cao: 200 quét/ngày, 150 coins, 3 TFs</li>
                    <li>Telegram alerts integration</li>
                </ul>
            </div>

            <div class="highlight-box purple">
                <div class="highlight-title">🚀 Phù Hợp Với Ai?</div>
                <p class="content-text">
                    Những bạn đã thành thạo TIER 1, muốn tăng tốc học tập, và sẵn sàng đầu tư vào kỹ năng.
                </p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">3️⃣</span> Con Đường 3: Trở Thành Đối Tác GEM</h2>

            <div class="path-card" style="border-color: var(--accent-gold);">
                <div class="path-number" style="background: var(--accent-gold);">3</div>
                <h3 class="path-title">Cơ Hội Kinh Doanh & Phát Triển</h3>
                <p class="path-desc">
                    Ngoài trading, bạn có thể xây dựng nguồn thu nhập thêm bằng cách trở thành
                    đối tác của GEM - giới thiệu sản phẩm và nhận hoa hồng.
                </p>
                <ul class="path-features">
                    <li>Cộng Tác Viên (CTV) - bắt đầu dễ dàng</li>
                    <li>Đại Đối Tác - xây dựng team riêng</li>
                    <li>Giảng Viên - chia sẻ kiến thức với cộng đồng</li>
                    <li>Thu nhập passive từ referral</li>
                </ul>
            </div>

            <div class="highlight-box gold">
                <div class="highlight-title">💰 Phù Hợp Với Ai?</div>
                <p class="content-text">
                    Những bạn có kỹ năng networking, muốn tạo thêm nguồn thu nhập, hoặc đam mê chia sẻ kiến thức.
                </p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🤔</span> Không Cần Chọn Ngay</h2>
            <p class="content-text">
                Bạn không cần phải đưa ra quyết định ngay lập tức. Trong các bài tiếp theo của Module B,
                chúng ta sẽ đi sâu vào từng con đường để bạn có đủ thông tin quyết định.
            </p>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Điều Quan Trọng Nhất</div>
                <p class="content-text">
                    Dù chọn con đường nào, hãy tiếp tục thực hành và áp dụng những gì đã học.
                    Kiến thức không áp dụng sẽ bị lãng quên. <strong>Hành động</strong> mới tạo ra kết quả.
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x300/112250/10B981?text=Take+Action+Today" alt="Hành động ngay">
                <p class="image-caption">Hình 10.1.2: Hành động là chìa khóa thành công</p>
            </div>
        </section>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 10.1</h3>
            <ul class="summary-list">
                <li>Sau TIER 1, bạn đứng trước 3 con đường</li>
                <li>Con đường 1: Tiếp tục tự thực hành với TIER 1</li>
                <li>Con đường 2: Nâng cấp lên TIER 2 để mở khóa tính năng nâng cao</li>
                <li>Con đường 3: Trở thành đối tác GEM để tạo thu nhập thêm</li>
                <li>Không cần quyết định ngay - hãy tìm hiểu thêm trong các bài tiếp theo</li>
            </ul>
        </div>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Module B: Cơ Hội & Lựa Chọn</p>
            <p>Tiếp theo: Bài 10.2 - Công Cụ Tăng Tốc Có Sẵn</p>
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

-- Lesson 10.2: Công Cụ Tăng Tốc - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch10-l2',
  'module-tier-1-ch10',
  'course-tier1-trading-foundation',
  'Bài 10.2: Công Cụ Tăng Tốc - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 10.2: Công Cụ Tăng Tốc - GEM Trading Academy</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-navy: #112250;
            --primary-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --error-red: #EF4444;
            --bg-dark: #0A0E17;
            --bg-card: #1A1F2E;
            --bg-card-hover: #252B3D;
            --text-primary: #FFFFFF;
            --text-secondary: #A0A9C0;
            --border-color: rgba(255, 189, 89, 0.2);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.7;
            font-size: 16px;
            padding: 0;
            overflow-x: hidden;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--bg-dark);
        }

        @media (min-width: 600px) {
            body {
                padding: 2rem;
                background: linear-gradient(135deg, #0A0E17 0%, #112250 100%);
            }
            .lesson-container {
                background: var(--bg-card);
                border-radius: 20px;
                border: 1px solid var(--border-color);
                overflow: hidden;
            }
        }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem 1rem;
            text-align: center;
            border-bottom: 3px solid var(--primary-gold);
            position: relative;
            overflow: hidden;
        }

        .lesson-header::before {
            content: '''';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,189,89,0.1) 0%, transparent 50%);
            animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--primary-gold) 0%, #FFD700 100%);
            color: var(--primary-navy);
            padding: 0.5rem 1.25rem;
            border-radius: 25px;
            font-size: 0.85rem;
            font-weight: 700;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .lesson-header h1 {
            font-size: clamp(1.5rem, 5vw, 2rem);
            font-weight: 700;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        .lesson-header p {
            color: var(--text-secondary);
            font-size: 1rem;
            position: relative;
            z-index: 1;
        }

        .content-section {
            padding: 0;
        }

        @media (min-width: 600px) {
            .content-section {
                padding: 1.5rem;
            }
        }

        .content-card {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin-bottom: 1px;
            border-left: 4px solid var(--primary-gold);
        }

        @media (min-width: 600px) {
            .content-card {
                border-radius: 16px;
                padding: 2rem;
                margin-bottom: 1.5rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--primary-gold);
            }
        }

        .content-card h2 {
            font-size: 1.35rem;
            font-weight: 700;
            margin-bottom: 1.25rem;
            color: var(--primary-gold);
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .content-card h2 .icon {
            font-size: 1.5rem;
        }

        .content-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 1.5rem 0 1rem 0;
            color: var(--accent-cyan);
        }

        .content-card p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
            font-size: 1rem;
            line-height: 1.8;
        }

        .content-card ul, .content-card ol {
            margin: 1rem 0;
            padding-left: 1.5rem;
            color: var(--text-secondary);
        }

        .content-card li {
            margin-bottom: 0.75rem;
            line-height: 1.7;
        }

        .highlight-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1.25rem 0;
        }

        .highlight-box.cyan {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(0, 240, 255, 0.05) 100%);
            border-color: rgba(0, 240, 255, 0.3);
        }

        .highlight-box.purple {
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.15) 0%, rgba(106, 91, 255, 0.05) 100%);
            border-color: rgba(106, 91, 255, 0.3);
        }

        .highlight-box.green {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .highlight-box p {
            margin: 0;
            color: var(--text-primary);
        }

        .image-placeholder {
            background: linear-gradient(145deg, #1a2235 0%, #0d1321 100%);
            border: 2px dashed rgba(255, 189, 89, 0.4);
            border-radius: 12px;
            padding: 1rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        .image-placeholder img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin-bottom: 0.75rem;
        }

        .image-placeholder p {
            font-size: 0.85rem;
            color: var(--primary-gold);
            margin: 0;
            font-style: italic;
        }

        .tool-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1px;
            background: var(--border-color);
            margin: 1.5rem 0;
        }

        @media (min-width: 600px) {
            .tool-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                background: transparent;
            }
        }

        .tool-item {
            background: var(--bg-card-hover);
            padding: 1.25rem;
            text-align: center;
        }

        @media (min-width: 600px) {
            .tool-item {
                border-radius: 12px;
                border: 1px solid var(--border-color);
            }
        }

        .tool-icon {
            font-size: 2.5rem;
            margin-bottom: 0.75rem;
        }

        .tool-item h4 {
            font-size: 1rem;
            font-weight: 600;
            color: var(--primary-gold);
            margin-bottom: 0.5rem;
        }

        .tool-item p {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin: 0;
        }

        .product-card {
            background: linear-gradient(135deg, var(--bg-card-hover) 0%, var(--bg-card) 100%);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1rem 0;
            position: relative;
            overflow: hidden;
        }

        .product-card::before {
            content: '''';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, var(--primary-gold), var(--accent-cyan));
        }

        .product-card .badge {
            display: inline-block;
            background: var(--primary-gold);
            color: var(--primary-navy);
            font-size: 0.75rem;
            font-weight: 700;
            padding: 0.25rem 0.75rem;
            border-radius: 15px;
            margin-bottom: 0.75rem;
        }

        .product-card h4 {
            font-size: 1.15rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }

        .product-card p {
            font-size: 0.95rem;
            color: var(--text-secondary);
        }

        .product-features {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
        }

        .product-features li {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
        }

        .product-features li::marker {
            color: var(--success-green);
        }

        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
            font-size: 0.9rem;
        }

        .comparison-table th,
        .comparison-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }

        .comparison-table th {
            background: var(--primary-navy);
            color: var(--primary-gold);
            font-weight: 600;
        }

        .comparison-table tr:nth-child(even) {
            background: rgba(255, 189, 89, 0.05);
        }

        .comparison-table .check {
            color: var(--success-green);
            font-weight: 700;
        }

        .comparison-table .cross {
            color: var(--error-red);
        }

        .summary-box {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            border: 2px solid var(--primary-gold);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin: 0;
        }

        @media (min-width: 600px) {
            .summary-box {
                border-radius: 16px;
                padding: 2rem;
                margin: 1.5rem;
            }
        }

        .summary-box h3 {
            color: var(--primary-gold);
            font-size: 1.25rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding: 0;
        }

        .summary-box li {
            padding: 0.5rem 0;
            padding-left: 1.75rem;
            position: relative;
            color: var(--text-primary);
        }

        .summary-box li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-weight: 700;
        }

        .quiz-section {
            padding: 0;
        }

        @media (min-width: 600px) {
            .quiz-section {
                padding: 1.5rem;
            }
        }

        .quiz-container {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            border-left: 4px solid var(--accent-purple);
        }

        @media (min-width: 600px) {
            .quiz-container {
                border-radius: 16px;
                padding: 2rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--accent-purple);
            }
        }

        .quiz-container h2 {
            color: var(--accent-purple);
            font-size: 1.35rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .quiz-question {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1.25rem;
            border: 1px solid var(--border-color);
        }

        .quiz-question p {
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.875rem 1rem;
            margin-bottom: 0.5rem;
            background: var(--bg-card);
            border: 2px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
            font-size: 0.95rem;
        }

        .quiz-option:hover:not(:disabled) {
            border-color: var(--accent-purple);
            background: rgba(106, 91, 255, 0.1);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--success-green);
            color: var(--success-green);
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: var(--error-red);
            color: var(--error-red);
        }

        .quiz-result {
            padding: 0.75rem;
            border-radius: 8px;
            margin-top: 0.75rem;
            font-weight: 600;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success-green);
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.2);
            color: var(--error-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score h3 {
            color: var(--primary-gold);
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
        }

        .quiz-score p {
            color: var(--text-secondary);
        }

        .retake-btn {
            display: inline-block;
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--accent-purple) 0%, #5346E0 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .retake-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(106, 91, 255, 0.4);
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            background: var(--bg-card);
            border-top: 1px solid var(--border-color);
        }

        .lesson-footer p {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .lesson-footer .brand {
            color: var(--primary-gold);
            font-weight: 700;
        }

        @media (max-width: 600px) {
            .comparison-table {
                font-size: 0.8rem;
            }
            .comparison-table th,
            .comparison-table td {
                padding: 0.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <div class="header-badge">Module B - Bài 2/7</div>
            <h1>Công Cụ Tăng Tốc</h1>
            <p>Những sản phẩm và công cụ giúp bạn trading hiệu quả hơn</p>
        </header>

        <section class="content-section">
            <div class="content-card">
                <h2><span class="icon">🛠️</span> Tại Sao Cần Công Cụ Hỗ Trợ?</h2>

                <p>Kiến thức là nền tảng, nhưng công cụ phù hợp sẽ giúp bạn <strong>tiết kiệm thời gian</strong> và <strong>tăng độ chính xác</strong> trong trading.</p>

                <div class="highlight-box">
                    <p><strong>💡 Sự thật:</strong> Trader chuyên nghiệp luôn đầu tư vào công cụ hỗ trợ. Thời gian tiết kiệm được sẽ đem lại lợi nhuận gấp nhiều lần chi phí công cụ.</p>
                </div>

                <h3>So sánh: Có vs Không có công cụ</h3>

                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th>Công việc</th>
                            <th>Không có công cụ</th>
                            <th>Có công cụ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Quét pattern 100 coin</td>
                            <td>4-6 giờ/ngày</td>
                            <td class="check">5 phút</td>
                        </tr>
                        <tr>
                            <td>Nhận diện pattern</td>
                            <td>Chủ quan, hay sai</td>
                            <td class="check">AI hỗ trợ, chính xác</td>
                        </tr>
                        <tr>
                            <td>Cảnh báo setup</td>
                            <td>Phải theo dõi liên tục</td>
                            <td class="check">Alert tự động</td>
                        </tr>
                        <tr>
                            <td>Học hỏi liên tục</td>
                            <td>Tự tìm tài liệu</td>
                            <td class="check">AI trả lời ngay</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="content-card">
                <h2><span class="icon">📦</span> Hệ Sinh Thái Công Cụ GEM</h2>

                <p>GEM Trading Academy cung cấp hệ thống công cụ hoàn chỉnh, được thiết kế đặc biệt cho phương pháp <strong>GEM Frequency</strong>:</p>

                <div class="tool-grid">
                    <div class="tool-item">
                        <div class="tool-icon">🤖</div>
                        <h4>GEM Master AI</h4>
                        <p>Chatbot thông minh, hỏi đáp trading 24/7</p>
                    </div>
                    <div class="tool-item">
                        <div class="tool-icon">📡</div>
                        <h4>Pattern Scanner</h4>
                        <p>Quét tự động 100+ coin trên các khung giờ</p>
                    </div>
                    <div class="tool-item">
                        <div class="tool-icon">🔔</div>
                        <h4>Smart Alerts</h4>
                        <p>Thông báo khi có setup chất lượng cao</p>
                    </div>
                    <div class="tool-item">
                        <div class="tool-icon">📊</div>
                        <h4>Portfolio Tracker</h4>
                        <p>Theo dõi và phân tích hiệu suất</p>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/FFBD59?text=GEM+Tool+Ecosystem" alt="GEM Tools Ecosystem">
                    <p>📸 Hệ sinh thái công cụ GEM Trading</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">⭐</span> Chi Tiết Từng Công Cụ</h2>

                <div class="product-card">
                    <span class="badge">CORE TOOL</span>
                    <h4>GEM Master AI Chatbot</h4>
                    <p>Trợ lý AI được train với toàn bộ kiến thức GEM Frequency Method. Hỏi bất cứ lúc nào, nhận câu trả lời ngay lập tức.</p>
                    <ul class="product-features">
                        <li>Trả lời câu hỏi về 24 patterns</li>
                        <li>Phân tích setup cụ thể khi bạn hỏi</li>
                        <li>Gợi ý chiến lược phù hợp</li>
                        <li>Hỗ trợ cả tiếng Việt và tiếng Anh</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/0A0E17/00F0FF?text=AI+Chatbot+Demo" alt="AI Chatbot Demo">
                    <p>📸 Demo GEM Master AI Chatbot</p>
                </div>

                <div class="product-card">
                    <span class="badge">PREMIUM TOOL</span>
                    <h4>Pattern Scanner Pro</h4>
                    <p>Công cụ quét pattern tự động trên hơn 100 cặp coin. Tiết kiệm hàng giờ phân tích mỗi ngày.</p>
                    <ul class="product-features">
                        <li>Quét 24 patterns trên nhiều timeframe</li>
                        <li>Điểm đánh giá độ tin cậy (Score 0-100)</li>
                        <li>Filter theo volume, volatility</li>
                        <li>Export kết quả, tích hợp Binance</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/0A0E17/10B981?text=Scanner+Results" alt="Scanner Results">
                    <p>📸 Kết quả quét pattern từ Scanner Pro</p>
                </div>

                <div class="product-card">
                    <span class="badge">ESSENTIAL</span>
                    <h4>Smart Alert System</h4>
                    <p>Nhận thông báo real-time khi có setup đẹp. Không cần ngồi theo dõi chart cả ngày.</p>
                    <ul class="product-features">
                        <li>Alert qua app, email, Telegram</li>
                        <li>Customize filter theo sở thích</li>
                        <li>Chỉ nhận alert có Score > 70</li>
                        <li>Thông báo breakout, retest</li>
                    </ul>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📈</span> So Sánh Các Gói Công Cụ</h2>

                <p>Chọn gói phù hợp với nhu cầu và ngân sách của bạn:</p>

                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th>Tính năng</th>
                            <th>Free</th>
                            <th>Pro</th>
                            <th>Elite</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>AI Chatbot</td>
                            <td>10 câu/ngày</td>
                            <td>Không giới hạn</td>
                            <td>Không giới hạn</td>
                        </tr>
                        <tr>
                            <td>Pattern Scanner</td>
                            <td>5 coin</td>
                            <td>50 coin</td>
                            <td>100+ coin</td>
                        </tr>
                        <tr>
                            <td>Timeframes</td>
                            <td>1H, 4H</td>
                            <td>All TF</td>
                            <td>All TF + Custom</td>
                        </tr>
                        <tr>
                            <td>Alerts/tháng</td>
                            <td>10</td>
                            <td>100</td>
                            <td>Unlimited</td>
                        </tr>
                        <tr>
                            <td>AI Score Analysis</td>
                            <td class="cross">✗</td>
                            <td class="check">✓</td>
                            <td class="check">✓ + Custom AI</td>
                        </tr>
                        <tr>
                            <td>1-on-1 Support</td>
                            <td class="cross">✗</td>
                            <td class="cross">✗</td>
                            <td class="check">✓ VIP</td>
                        </tr>
                    </tbody>
                </table>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/112250/FFBD59?text=Pricing+Comparison" alt="Pricing Comparison">
                    <p>📸 So sánh các gói công cụ</p>
                </div>

                <div class="highlight-box green">
                    <p><strong>💡 Khuyến nghị:</strong> Nếu bạn nghiêm túc với trading, gói <strong>Pro</strong> là lựa chọn cân bằng tốt nhất giữa tính năng và chi phí.</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🎁</span> Bonus: Khóa Học Đi Kèm</h2>

                <p>Khi upgrade lên Tier cao hơn, bạn còn được <strong>mở khóa thêm kiến thức</strong>:</p>

                <div class="highlight-box cyan">
                    <p><strong>TIER 2 (Nâng Cao):</strong></p>
                    <ul style="margin-top: 0.5rem; padding-left: 1.25rem;">
                        <li>DPD Pattern + 20 patterns nâng cao</li>
                        <li>Multi-timeframe analysis chi tiết</li>
                        <li>Position sizing & Risk management pro</li>
                        <li>Live trading strategies</li>
                    </ul>
                </div>

                <div class="highlight-box purple">
                    <p><strong>TIER 3 (Elite):</strong></p>
                    <ul style="margin-top: 0.5rem; padding-left: 1.25rem;">
                        <li>Market structure mastery</li>
                        <li>Algorithmic trading basics</li>
                        <li>Psychology & Performance coaching</li>
                        <li>Private mentoring sessions</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/6A5BFF/FFFFFF?text=Tier+Learning+Path" alt="Tier Learning Path">
                    <p>📸 Lộ trình học tập theo Tier</p>
                </div>
            </div>

            <div class="summary-box">
                <h3>📝 Tóm Tắt Bài Học</h3>
                <ul>
                    <li>Công cụ phù hợp giúp tiết kiệm thời gian và tăng độ chính xác</li>
                    <li>GEM cung cấp hệ sinh thái công cụ hoàn chỉnh: AI, Scanner, Alerts</li>
                    <li>Chọn gói phù hợp: Free (học), Pro (trade nghiêm túc), Elite (chuyên nghiệp)</li>
                    <li>Tier cao hơn = Kiến thức sâu hơn + Công cụ mạnh hơn</li>
                    <li>Đầu tư vào công cụ = Đầu tư vào sự nghiệp trading của bạn</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-container">
                <h2><span class="icon">❓</span> Kiểm Tra Kiến Thức</h2>

                <div class="quiz-question" data-correct="2">
                    <p>1. GEM Master AI Chatbot có thể làm gì?</p>
                    <button class="quiz-option" data-index="0">A. Chỉ trả lời câu hỏi bằng tiếng Anh</button>
                    <button class="quiz-option" data-index="1">B. Auto trade thay bạn</button>
                    <button class="quiz-option" data-index="2">C. Trả lời câu hỏi về trading, phân tích setup</button>
                    <button class="quiz-option" data-index="3">D. Chỉ hoạt động trong giờ hành chính</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="1">
                    <p>2. Pattern Scanner Pro giúp tiết kiệm thời gian như thế nào?</p>
                    <button class="quiz-option" data-index="0">A. Tự động vào lệnh thay trader</button>
                    <button class="quiz-option" data-index="1">B. Quét tự động 100+ coin, thay vì phải xem chart thủ công</button>
                    <button class="quiz-option" data-index="2">C. Không cần học, máy làm hết</button>
                    <button class="quiz-option" data-index="3">D. Chỉ quét được 1 coin mỗi lần</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <p>3. Gói nào phù hợp nhất cho trader muốn trade nghiêm túc với ngân sách vừa phải?</p>
                    <button class="quiz-option" data-index="0">A. Gói Pro - cân bằng tính năng và chi phí</button>
                    <button class="quiz-option" data-index="1">B. Gói Free - đủ dùng cho mọi nhu cầu</button>
                    <button class="quiz-option" data-index="2">C. Không cần gói nào, tự làm tốt hơn</button>
                    <button class="quiz-option" data-index="3">D. Gói Elite - vì đắt nhất là tốt nhất</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🎉 Hoàn thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>Bài học thuộc <span class="brand">GEM Trading Academy</span></p>
            <p>© 2024 - Nền tảng đào tạo trading chuyên nghiệp</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 3;
        let answeredCount = 0;
        let correctCount = 0;

        document.querySelectorAll(''.quiz-question'').forEach(question => {
            const correctIndex = parseInt(question.dataset.correct);
            const options = question.querySelectorAll(''.quiz-option'');
            const result = question.querySelector(''.quiz-result'');

            options.forEach(option => {
                option.addEventListener(''click'', function() {
                    if (question.classList.contains(''answered'')) return;

                    question.classList.add(''answered'');
                    answeredCount++;

                    const selectedIndex = parseInt(this.dataset.index);

                    if (selectedIndex === correctIndex) {
                        this.classList.add(''correct'');
                        result.textContent = ''✓ Chính xác! Công cụ hỗ trợ giúp bạn trading hiệu quả hơn.'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng. Xem lại đáp án đúng được highlight.'';
                        result.className = ''quiz-result show incorrect'';
                    }

                    if (answeredCount === totalQuestions) {
                        document.getElementById(''correct-count'').textContent = correctCount;
                        document.querySelector(''.quiz-score'').classList.add(''show'');
                    }
                });
            });
        });
    </script>
</body>
</html>
',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 10.2: Công Cụ Tăng Tốc - GEM Trading Academy</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-navy: #112250;
            --primary-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --error-red: #EF4444;
            --bg-dark: #0A0E17;
            --bg-card: #1A1F2E;
            --bg-card-hover: #252B3D;
            --text-primary: #FFFFFF;
            --text-secondary: #A0A9C0;
            --border-color: rgba(255, 189, 89, 0.2);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.7;
            font-size: 16px;
            padding: 0;
            overflow-x: hidden;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--bg-dark);
        }

        @media (min-width: 600px) {
            body {
                padding: 2rem;
                background: linear-gradient(135deg, #0A0E17 0%, #112250 100%);
            }
            .lesson-container {
                background: var(--bg-card);
                border-radius: 20px;
                border: 1px solid var(--border-color);
                overflow: hidden;
            }
        }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem 1rem;
            text-align: center;
            border-bottom: 3px solid var(--primary-gold);
            position: relative;
            overflow: hidden;
        }

        .lesson-header::before {
            content: '''';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,189,89,0.1) 0%, transparent 50%);
            animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--primary-gold) 0%, #FFD700 100%);
            color: var(--primary-navy);
            padding: 0.5rem 1.25rem;
            border-radius: 25px;
            font-size: 0.85rem;
            font-weight: 700;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .lesson-header h1 {
            font-size: clamp(1.5rem, 5vw, 2rem);
            font-weight: 700;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        .lesson-header p {
            color: var(--text-secondary);
            font-size: 1rem;
            position: relative;
            z-index: 1;
        }

        .content-section {
            padding: 0;
        }

        @media (min-width: 600px) {
            .content-section {
                padding: 1.5rem;
            }
        }

        .content-card {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin-bottom: 1px;
            border-left: 4px solid var(--primary-gold);
        }

        @media (min-width: 600px) {
            .content-card {
                border-radius: 16px;
                padding: 2rem;
                margin-bottom: 1.5rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--primary-gold);
            }
        }

        .content-card h2 {
            font-size: 1.35rem;
            font-weight: 700;
            margin-bottom: 1.25rem;
            color: var(--primary-gold);
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .content-card h2 .icon {
            font-size: 1.5rem;
        }

        .content-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 1.5rem 0 1rem 0;
            color: var(--accent-cyan);
        }

        .content-card p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
            font-size: 1rem;
            line-height: 1.8;
        }

        .content-card ul, .content-card ol {
            margin: 1rem 0;
            padding-left: 1.5rem;
            color: var(--text-secondary);
        }

        .content-card li {
            margin-bottom: 0.75rem;
            line-height: 1.7;
        }

        .highlight-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1.25rem 0;
        }

        .highlight-box.cyan {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(0, 240, 255, 0.05) 100%);
            border-color: rgba(0, 240, 255, 0.3);
        }

        .highlight-box.purple {
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.15) 0%, rgba(106, 91, 255, 0.05) 100%);
            border-color: rgba(106, 91, 255, 0.3);
        }

        .highlight-box.green {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .highlight-box p {
            margin: 0;
            color: var(--text-primary);
        }

        .image-placeholder {
            background: linear-gradient(145deg, #1a2235 0%, #0d1321 100%);
            border: 2px dashed rgba(255, 189, 89, 0.4);
            border-radius: 12px;
            padding: 1rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        .image-placeholder img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin-bottom: 0.75rem;
        }

        .image-placeholder p {
            font-size: 0.85rem;
            color: var(--primary-gold);
            margin: 0;
            font-style: italic;
        }

        .tool-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1px;
            background: var(--border-color);
            margin: 1.5rem 0;
        }

        @media (min-width: 600px) {
            .tool-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                background: transparent;
            }
        }

        .tool-item {
            background: var(--bg-card-hover);
            padding: 1.25rem;
            text-align: center;
        }

        @media (min-width: 600px) {
            .tool-item {
                border-radius: 12px;
                border: 1px solid var(--border-color);
            }
        }

        .tool-icon {
            font-size: 2.5rem;
            margin-bottom: 0.75rem;
        }

        .tool-item h4 {
            font-size: 1rem;
            font-weight: 600;
            color: var(--primary-gold);
            margin-bottom: 0.5rem;
        }

        .tool-item p {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin: 0;
        }

        .product-card {
            background: linear-gradient(135deg, var(--bg-card-hover) 0%, var(--bg-card) 100%);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1rem 0;
            position: relative;
            overflow: hidden;
        }

        .product-card::before {
            content: '''';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, var(--primary-gold), var(--accent-cyan));
        }

        .product-card .badge {
            display: inline-block;
            background: var(--primary-gold);
            color: var(--primary-navy);
            font-size: 0.75rem;
            font-weight: 700;
            padding: 0.25rem 0.75rem;
            border-radius: 15px;
            margin-bottom: 0.75rem;
        }

        .product-card h4 {
            font-size: 1.15rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }

        .product-card p {
            font-size: 0.95rem;
            color: var(--text-secondary);
        }

        .product-features {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
        }

        .product-features li {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
        }

        .product-features li::marker {
            color: var(--success-green);
        }

        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
            font-size: 0.9rem;
        }

        .comparison-table th,
        .comparison-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }

        .comparison-table th {
            background: var(--primary-navy);
            color: var(--primary-gold);
            font-weight: 600;
        }

        .comparison-table tr:nth-child(even) {
            background: rgba(255, 189, 89, 0.05);
        }

        .comparison-table .check {
            color: var(--success-green);
            font-weight: 700;
        }

        .comparison-table .cross {
            color: var(--error-red);
        }

        .summary-box {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            border: 2px solid var(--primary-gold);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin: 0;
        }

        @media (min-width: 600px) {
            .summary-box {
                border-radius: 16px;
                padding: 2rem;
                margin: 1.5rem;
            }
        }

        .summary-box h3 {
            color: var(--primary-gold);
            font-size: 1.25rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding: 0;
        }

        .summary-box li {
            padding: 0.5rem 0;
            padding-left: 1.75rem;
            position: relative;
            color: var(--text-primary);
        }

        .summary-box li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-weight: 700;
        }

        .quiz-section {
            padding: 0;
        }

        @media (min-width: 600px) {
            .quiz-section {
                padding: 1.5rem;
            }
        }

        .quiz-container {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            border-left: 4px solid var(--accent-purple);
        }

        @media (min-width: 600px) {
            .quiz-container {
                border-radius: 16px;
                padding: 2rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--accent-purple);
            }
        }

        .quiz-container h2 {
            color: var(--accent-purple);
            font-size: 1.35rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .quiz-question {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1.25rem;
            border: 1px solid var(--border-color);
        }

        .quiz-question p {
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.875rem 1rem;
            margin-bottom: 0.5rem;
            background: var(--bg-card);
            border: 2px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
            font-size: 0.95rem;
        }

        .quiz-option:hover:not(:disabled) {
            border-color: var(--accent-purple);
            background: rgba(106, 91, 255, 0.1);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--success-green);
            color: var(--success-green);
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: var(--error-red);
            color: var(--error-red);
        }

        .quiz-result {
            padding: 0.75rem;
            border-radius: 8px;
            margin-top: 0.75rem;
            font-weight: 600;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success-green);
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.2);
            color: var(--error-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score h3 {
            color: var(--primary-gold);
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
        }

        .quiz-score p {
            color: var(--text-secondary);
        }

        .retake-btn {
            display: inline-block;
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--accent-purple) 0%, #5346E0 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .retake-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(106, 91, 255, 0.4);
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            background: var(--bg-card);
            border-top: 1px solid var(--border-color);
        }

        .lesson-footer p {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .lesson-footer .brand {
            color: var(--primary-gold);
            font-weight: 700;
        }

        @media (max-width: 600px) {
            .comparison-table {
                font-size: 0.8rem;
            }
            .comparison-table th,
            .comparison-table td {
                padding: 0.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <div class="header-badge">Module B - Bài 2/7</div>
            <h1>Công Cụ Tăng Tốc</h1>
            <p>Những sản phẩm và công cụ giúp bạn trading hiệu quả hơn</p>
        </header>

        <section class="content-section">
            <div class="content-card">
                <h2><span class="icon">🛠️</span> Tại Sao Cần Công Cụ Hỗ Trợ?</h2>

                <p>Kiến thức là nền tảng, nhưng công cụ phù hợp sẽ giúp bạn <strong>tiết kiệm thời gian</strong> và <strong>tăng độ chính xác</strong> trong trading.</p>

                <div class="highlight-box">
                    <p><strong>💡 Sự thật:</strong> Trader chuyên nghiệp luôn đầu tư vào công cụ hỗ trợ. Thời gian tiết kiệm được sẽ đem lại lợi nhuận gấp nhiều lần chi phí công cụ.</p>
                </div>

                <h3>So sánh: Có vs Không có công cụ</h3>

                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th>Công việc</th>
                            <th>Không có công cụ</th>
                            <th>Có công cụ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Quét pattern 100 coin</td>
                            <td>4-6 giờ/ngày</td>
                            <td class="check">5 phút</td>
                        </tr>
                        <tr>
                            <td>Nhận diện pattern</td>
                            <td>Chủ quan, hay sai</td>
                            <td class="check">AI hỗ trợ, chính xác</td>
                        </tr>
                        <tr>
                            <td>Cảnh báo setup</td>
                            <td>Phải theo dõi liên tục</td>
                            <td class="check">Alert tự động</td>
                        </tr>
                        <tr>
                            <td>Học hỏi liên tục</td>
                            <td>Tự tìm tài liệu</td>
                            <td class="check">AI trả lời ngay</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="content-card">
                <h2><span class="icon">📦</span> Hệ Sinh Thái Công Cụ GEM</h2>

                <p>GEM Trading Academy cung cấp hệ thống công cụ hoàn chỉnh, được thiết kế đặc biệt cho phương pháp <strong>GEM Frequency</strong>:</p>

                <div class="tool-grid">
                    <div class="tool-item">
                        <div class="tool-icon">🤖</div>
                        <h4>GEM Master AI</h4>
                        <p>Chatbot thông minh, hỏi đáp trading 24/7</p>
                    </div>
                    <div class="tool-item">
                        <div class="tool-icon">📡</div>
                        <h4>Pattern Scanner</h4>
                        <p>Quét tự động 100+ coin trên các khung giờ</p>
                    </div>
                    <div class="tool-item">
                        <div class="tool-icon">🔔</div>
                        <h4>Smart Alerts</h4>
                        <p>Thông báo khi có setup chất lượng cao</p>
                    </div>
                    <div class="tool-item">
                        <div class="tool-icon">📊</div>
                        <h4>Portfolio Tracker</h4>
                        <p>Theo dõi và phân tích hiệu suất</p>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/FFBD59?text=GEM+Tool+Ecosystem" alt="GEM Tools Ecosystem">
                    <p>📸 Hệ sinh thái công cụ GEM Trading</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">⭐</span> Chi Tiết Từng Công Cụ</h2>

                <div class="product-card">
                    <span class="badge">CORE TOOL</span>
                    <h4>GEM Master AI Chatbot</h4>
                    <p>Trợ lý AI được train với toàn bộ kiến thức GEM Frequency Method. Hỏi bất cứ lúc nào, nhận câu trả lời ngay lập tức.</p>
                    <ul class="product-features">
                        <li>Trả lời câu hỏi về 24 patterns</li>
                        <li>Phân tích setup cụ thể khi bạn hỏi</li>
                        <li>Gợi ý chiến lược phù hợp</li>
                        <li>Hỗ trợ cả tiếng Việt và tiếng Anh</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/0A0E17/00F0FF?text=AI+Chatbot+Demo" alt="AI Chatbot Demo">
                    <p>📸 Demo GEM Master AI Chatbot</p>
                </div>

                <div class="product-card">
                    <span class="badge">PREMIUM TOOL</span>
                    <h4>Pattern Scanner Pro</h4>
                    <p>Công cụ quét pattern tự động trên hơn 100 cặp coin. Tiết kiệm hàng giờ phân tích mỗi ngày.</p>
                    <ul class="product-features">
                        <li>Quét 24 patterns trên nhiều timeframe</li>
                        <li>Điểm đánh giá độ tin cậy (Score 0-100)</li>
                        <li>Filter theo volume, volatility</li>
                        <li>Export kết quả, tích hợp Binance</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/0A0E17/10B981?text=Scanner+Results" alt="Scanner Results">
                    <p>📸 Kết quả quét pattern từ Scanner Pro</p>
                </div>

                <div class="product-card">
                    <span class="badge">ESSENTIAL</span>
                    <h4>Smart Alert System</h4>
                    <p>Nhận thông báo real-time khi có setup đẹp. Không cần ngồi theo dõi chart cả ngày.</p>
                    <ul class="product-features">
                        <li>Alert qua app, email, Telegram</li>
                        <li>Customize filter theo sở thích</li>
                        <li>Chỉ nhận alert có Score > 70</li>
                        <li>Thông báo breakout, retest</li>
                    </ul>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📈</span> So Sánh Các Gói Công Cụ</h2>

                <p>Chọn gói phù hợp với nhu cầu và ngân sách của bạn:</p>

                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th>Tính năng</th>
                            <th>Free</th>
                            <th>Pro</th>
                            <th>Elite</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>AI Chatbot</td>
                            <td>10 câu/ngày</td>
                            <td>Không giới hạn</td>
                            <td>Không giới hạn</td>
                        </tr>
                        <tr>
                            <td>Pattern Scanner</td>
                            <td>5 coin</td>
                            <td>50 coin</td>
                            <td>100+ coin</td>
                        </tr>
                        <tr>
                            <td>Timeframes</td>
                            <td>1H, 4H</td>
                            <td>All TF</td>
                            <td>All TF + Custom</td>
                        </tr>
                        <tr>
                            <td>Alerts/tháng</td>
                            <td>10</td>
                            <td>100</td>
                            <td>Unlimited</td>
                        </tr>
                        <tr>
                            <td>AI Score Analysis</td>
                            <td class="cross">✗</td>
                            <td class="check">✓</td>
                            <td class="check">✓ + Custom AI</td>
                        </tr>
                        <tr>
                            <td>1-on-1 Support</td>
                            <td class="cross">✗</td>
                            <td class="cross">✗</td>
                            <td class="check">✓ VIP</td>
                        </tr>
                    </tbody>
                </table>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/112250/FFBD59?text=Pricing+Comparison" alt="Pricing Comparison">
                    <p>📸 So sánh các gói công cụ</p>
                </div>

                <div class="highlight-box green">
                    <p><strong>💡 Khuyến nghị:</strong> Nếu bạn nghiêm túc với trading, gói <strong>Pro</strong> là lựa chọn cân bằng tốt nhất giữa tính năng và chi phí.</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🎁</span> Bonus: Khóa Học Đi Kèm</h2>

                <p>Khi upgrade lên Tier cao hơn, bạn còn được <strong>mở khóa thêm kiến thức</strong>:</p>

                <div class="highlight-box cyan">
                    <p><strong>TIER 2 (Nâng Cao):</strong></p>
                    <ul style="margin-top: 0.5rem; padding-left: 1.25rem;">
                        <li>DPD Pattern + 20 patterns nâng cao</li>
                        <li>Multi-timeframe analysis chi tiết</li>
                        <li>Position sizing & Risk management pro</li>
                        <li>Live trading strategies</li>
                    </ul>
                </div>

                <div class="highlight-box purple">
                    <p><strong>TIER 3 (Elite):</strong></p>
                    <ul style="margin-top: 0.5rem; padding-left: 1.25rem;">
                        <li>Market structure mastery</li>
                        <li>Algorithmic trading basics</li>
                        <li>Psychology & Performance coaching</li>
                        <li>Private mentoring sessions</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/6A5BFF/FFFFFF?text=Tier+Learning+Path" alt="Tier Learning Path">
                    <p>📸 Lộ trình học tập theo Tier</p>
                </div>
            </div>

            <div class="summary-box">
                <h3>📝 Tóm Tắt Bài Học</h3>
                <ul>
                    <li>Công cụ phù hợp giúp tiết kiệm thời gian và tăng độ chính xác</li>
                    <li>GEM cung cấp hệ sinh thái công cụ hoàn chỉnh: AI, Scanner, Alerts</li>
                    <li>Chọn gói phù hợp: Free (học), Pro (trade nghiêm túc), Elite (chuyên nghiệp)</li>
                    <li>Tier cao hơn = Kiến thức sâu hơn + Công cụ mạnh hơn</li>
                    <li>Đầu tư vào công cụ = Đầu tư vào sự nghiệp trading của bạn</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-container">
                <h2><span class="icon">❓</span> Kiểm Tra Kiến Thức</h2>

                <div class="quiz-question" data-correct="2">
                    <p>1. GEM Master AI Chatbot có thể làm gì?</p>
                    <button class="quiz-option" data-index="0">A. Chỉ trả lời câu hỏi bằng tiếng Anh</button>
                    <button class="quiz-option" data-index="1">B. Auto trade thay bạn</button>
                    <button class="quiz-option" data-index="2">C. Trả lời câu hỏi về trading, phân tích setup</button>
                    <button class="quiz-option" data-index="3">D. Chỉ hoạt động trong giờ hành chính</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="1">
                    <p>2. Pattern Scanner Pro giúp tiết kiệm thời gian như thế nào?</p>
                    <button class="quiz-option" data-index="0">A. Tự động vào lệnh thay trader</button>
                    <button class="quiz-option" data-index="1">B. Quét tự động 100+ coin, thay vì phải xem chart thủ công</button>
                    <button class="quiz-option" data-index="2">C. Không cần học, máy làm hết</button>
                    <button class="quiz-option" data-index="3">D. Chỉ quét được 1 coin mỗi lần</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <p>3. Gói nào phù hợp nhất cho trader muốn trade nghiêm túc với ngân sách vừa phải?</p>
                    <button class="quiz-option" data-index="0">A. Gói Pro - cân bằng tính năng và chi phí</button>
                    <button class="quiz-option" data-index="1">B. Gói Free - đủ dùng cho mọi nhu cầu</button>
                    <button class="quiz-option" data-index="2">C. Không cần gói nào, tự làm tốt hơn</button>
                    <button class="quiz-option" data-index="3">D. Gói Elite - vì đắt nhất là tốt nhất</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🎉 Hoàn thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>Bài học thuộc <span class="brand">GEM Trading Academy</span></p>
            <p>© 2024 - Nền tảng đào tạo trading chuyên nghiệp</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 3;
        let answeredCount = 0;
        let correctCount = 0;

        document.querySelectorAll(''.quiz-question'').forEach(question => {
            const correctIndex = parseInt(question.dataset.correct);
            const options = question.querySelectorAll(''.quiz-option'');
            const result = question.querySelector(''.quiz-result'');

            options.forEach(option => {
                option.addEventListener(''click'', function() {
                    if (question.classList.contains(''answered'')) return;

                    question.classList.add(''answered'');
                    answeredCount++;

                    const selectedIndex = parseInt(this.dataset.index);

                    if (selectedIndex === correctIndex) {
                        this.classList.add(''correct'');
                        result.textContent = ''✓ Chính xác! Công cụ hỗ trợ giúp bạn trading hiệu quả hơn.'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng. Xem lại đáp án đúng được highlight.'';
                        result.className = ''quiz-result show incorrect'';
                    }

                    if (answeredCount === totalQuestions) {
                        document.getElementById(''correct-count'').textContent = correctCount;
                        document.querySelector(''.quiz-score'').classList.add(''show'');
                    }
                });
            });
        });
    </script>
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

-- Lesson 10.3: Cơ Hội Đối Tác - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch10-l3',
  'module-tier-1-ch10',
  'course-tier1-trading-foundation',
  'Bài 10.3: Cơ Hội Đối Tác - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 10.3: Cơ Hội Đối Tác - GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #FFBD59; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
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

        /* Partner Tier Table */
        .tier-table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }
        .tier-table th { background: #1a1a2e; color: #FFBD59; padding: 0.75rem 0.5rem; text-align: center; border: 1px solid #27272a; }
        .tier-table td { padding: 0.75rem 0.5rem; text-align: center; border: 1px solid #27272a; background: #0f0f1a; }
        .tier-table tr:hover td { background: #1a1a2e; }
        .tier-icon { font-size: 1.25rem; }

        /* Partner Card */
        .partner-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #FFBD59; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .partner-card h4 { color: #FFBD59; font-size: 1.1rem; margin-bottom: 0.75rem; }
        .benefit-list { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin: 0.75rem 0; }
        .benefit-item { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
        .benefit-item:last-child { margin-bottom: 0; }
        .benefit-item .check { color: #10B981; }

        /* Quiz styles */
        .quiz-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #8B5CF6; }
        .quiz-title { font-size: 1.25rem; font-weight: 600; color: #8B5CF6; margin-bottom: 1rem; }
        .quiz-question { background: #1a1a2e; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
        .quiz-question p { font-weight: 600; color: #ffffff; margin-bottom: 0.75rem; }
        .quiz-option { display: block; width: 100%; padding: 0.75rem 1rem; margin-bottom: 0.5rem; background: #0f0f1a; border: 2px solid #27272a; border-radius: 8px; color: #d4d4d8; cursor: pointer; text-align: left; transition: all 0.2s; }
        .quiz-option:hover { border-color: #8B5CF6; background: rgba(139,92,246,0.1); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { display: none; padding: 0.75rem; border-radius: 8px; margin-top: 0.5rem; font-weight: 600; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { display: none; text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(255,189,89,0.1), rgba(16,185,129,0.1)); border-radius: 12px; margin-top: 1rem; }
        .quiz-score.show { display: block; }
        .quiz-score h3 { color: #FFBD59; margin-bottom: 0.5rem; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }

        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .tier-table { font-size: 0.75rem; }
            .tier-table th, .tier-table td { padding: 0.5rem 0.25rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 1 - Cơ Bản</span>
            <span class="module-badge">MODULE B</span>
            <h1 class="lesson-title">Cơ Hội Đối Tác</h1>
            <p class="lesson-subtitle">Chương Trình CTV & KOL Affiliate - Thu Nhập Từ Network</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🤝</div>
            <h2 class="section-title">Chương Trình Đối Tác GEM</h2>
            <p>Ngoài trading, GEM còn có <strong style="color: #FFBD59;">Chương Trình Đối Tác</strong> giúp bạn tạo thu nhập thụ động bằng cách giới thiệu học viên mới.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Ý Tưởng:</strong> Bạn đã học phương pháp GEM, thấy nó hiệu quả. Tại sao không chia sẻ với người khác đang tìm kiếm giải pháp trading và được thưởng cho điều đó?</p>
            </div>

            <p>GEM có <strong>2 chương trình</strong> chính:</p>
            <ul>
                <li><strong>CTV (Cộng Tác Viên):</strong> Ai cũng có thể đăng ký, không yêu cầu đặc biệt</li>
                <li><strong>KOL Affiliate:</strong> Dành cho influencers có 20,000+ followers</li>
            </ul>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=GEM+Partnership+Programs" alt="Partnership Programs">
                <p class="image-caption">Hai chương trình đối tác của GEM</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🥇</div>
            <h2 class="section-title">Chương Trình CTV - 5 Cấp Bậc</h2>
            <p>Chương trình CTV có <strong>5 cấp bậc</strong> với hoa hồng tăng dần theo doanh số tích lũy:</p>

            <table class="tier-table">
                <thead>
                    <tr>
                        <th>Cấp Bậc</th>
                        <th>Ngưỡng</th>
                        <th>Digital</th>
                        <th>Physical</th>
                        <th>Sub-Aff</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><span class="tier-icon">🥉</span> Bronze (Đồng)</td>
                        <td>0</td>
                        <td><strong style="color: #10B981;">10%</strong></td>
                        <td>6%</td>
                        <td>2%</td>
                    </tr>
                    <tr>
                        <td><span class="tier-icon">🥈</span> Silver (Bạc)</td>
                        <td>50M</td>
                        <td><strong style="color: #10B981;">15%</strong></td>
                        <td>8%</td>
                        <td>2.5%</td>
                    </tr>
                    <tr>
                        <td><span class="tier-icon">🥇</span> Gold (Vàng)</td>
                        <td>150M</td>
                        <td><strong style="color: #10B981;">20%</strong></td>
                        <td>10%</td>
                        <td>3%</td>
                    </tr>
                    <tr>
                        <td><span class="tier-icon">💎</span> Platinum (Bạch Kim)</td>
                        <td>400M</td>
                        <td><strong style="color: #10B981;">25%</strong></td>
                        <td>12%</td>
                        <td>3.5%</td>
                    </tr>
                    <tr>
                        <td><span class="tier-icon">👑</span> Diamond (Kim Cương)</td>
                        <td>800M</td>
                        <td><strong style="color: #10B981;">30%</strong></td>
                        <td>15%</td>
                        <td>4%</td>
                    </tr>
                </tbody>
            </table>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>📝 Giải thích:</strong><br>
                • <strong>Digital:</strong> Hoa hồng cho sản phẩm số (khóa học, subscription)<br>
                • <strong>Physical:</strong> Hoa hồng cho sản phẩm vật lý (crystal, jewelry)<br>
                • <strong>Sub-Aff:</strong> Hoa hồng từ doanh số của CTV bạn giới thiệu</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⭐</div>
            <h2 class="section-title">Chương Trình KOL Affiliate</h2>
            <p>Dành cho những người có ảnh hưởng trên mạng xã hội:</p>

            <div class="partner-card" style="border-color: #8B5CF6;">
                <h4 style="color: #8B5CF6;">⭐ KOL Affiliate</h4>
                <p><strong>Yêu cầu:</strong> 20,000+ followers (YouTube, Facebook, TikTok, Instagram...)</p>
                <div class="benefit-list">
                    <div class="benefit-item"><span class="check">✓</span> Digital: <strong style="color: #10B981;">20%</strong></div>
                    <div class="benefit-item"><span class="check">✓</span> Physical: <strong style="color: #10B981;">20%</strong></div>
                    <div class="benefit-item"><span class="check">✓</span> Sub-Affiliate: <strong style="color: #10B981;">3.5%</strong></div>
                    <div class="benefit-item"><span class="check">✓</span> Thanh toán: 2 lần/tháng (ngày 1 và 15)</div>
                </div>
                <p style="margin-top: 1rem; margin-bottom: 0; color: #a1a1aa; font-size: 0.9rem;"><em>⚠️ Lưu ý: Yêu cầu 20K+ followers là BẮT BUỘC, không có ngoại lệ.</em></p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Ví Dụ Thu Nhập</h2>
            <p>Dưới đây là ví dụ thu nhập từ chương trình CTV:</p>

            <div class="partner-card">
                <h4>💰 Ví Dụ: CTV Bronze bán 1 khóa Tier 2 (2,000,000đ)</h4>
                <div class="benefit-list">
                    <div class="benefit-item"><span class="check">→</span> Commission: 2,000,000 × 10% = <strong style="color: #10B981;">200,000đ</strong></div>
                </div>
            </div>

            <div class="partner-card" style="border-color: #10B981;">
                <h4 style="color: #10B981;">💰 Ví Dụ: CTV Gold bán 5 khóa Tier 2/tháng</h4>
                <div class="benefit-list">
                    <div class="benefit-item"><span class="check">→</span> Commission: 5 × 2,000,000 × 20% = <strong style="color: #10B981;">2,000,000đ/tháng</strong></div>
                </div>
            </div>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>📈 Tiềm năng:</strong> CTV Diamond có thể kiếm <strong>5-20 triệu/tháng</strong> hoặc hơn tùy thuộc vào network và nỗ lực của bạn.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Income+Examples" alt="Income Examples">
                <p class="image-caption">Ví dụ thu nhập từ chương trình CTV</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🚀</div>
            <h2 class="section-title">Cách Đăng Ký</h2>
            <p>Quy trình đăng ký CTV đơn giản:</p>

            <ul>
                <li><strong>Bước 1:</strong> Mở app GEM Mobile → Account → Affiliate</li>
                <li><strong>Bước 2:</strong> Điền form đăng ký CTV</li>
                <li><strong>Bước 3:</strong> Chờ duyệt (tự động sau 3 ngày hoặc Admin duyệt sớm hơn)</li>
                <li><strong>Bước 4:</strong> Nhận link giới thiệu và bắt đầu chia sẻ</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Mẹo:</strong> Đừng "bán hàng" trực tiếp. Hãy chia sẻ trải nghiệm thật, kết quả thật. Người khác sẽ tự tìm đến bạn.</p>
            </div>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="0">
                <p>1. Chương trình CTV có bao nhiêu cấp bậc?</p>
                <button class="quiz-option" data-index="0">A. 5 cấp (Bronze, Silver, Gold, Platinum, Diamond)</button>
                <button class="quiz-option" data-index="1">B. 3 cấp (Bronze, Silver, Gold)</button>
                <button class="quiz-option" data-index="2">C. 4 cấp (Starter, Pro, Elite, VIP)</button>
                <button class="quiz-option" data-index="3">D. 2 cấp (CTV và KOL)</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p>2. Hoa hồng Digital cao nhất của CTV Diamond là bao nhiêu?</p>
                <button class="quiz-option" data-index="0">A. 20%</button>
                <button class="quiz-option" data-index="1">B. 25%</button>
                <button class="quiz-option" data-index="2">C. 30%</button>
                <button class="quiz-option" data-index="3">D. 40%</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p>3. Yêu cầu để đăng ký KOL Affiliate là gì?</p>
                <button class="quiz-option" data-index="0">A. Hoàn thành Tier 3</button>
                <button class="quiz-option" data-index="1">B. 20,000+ followers trên mạng xã hội</button>
                <button class="quiz-option" data-index="2">C. Đóng phí 5 triệu</button>
                <button class="quiz-option" data-index="3">D. Không có yêu cầu</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <h3>🎉 Hoàn thành!</h3>
                <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 1 Cơ Bản - Module B</p>
            <p>© 2024 GEM Trading. All rights reserved.</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 3;
        let answeredCount = 0;
        let correctCount = 0;
        document.querySelectorAll(''.quiz-question'').forEach(q => {
            const ci = parseInt(q.dataset.correct);
            const opts = q.querySelectorAll(''.quiz-option'');
            const res = q.querySelector(''.quiz-result'');
            opts.forEach(o => {
                o.addEventListener(''click'', function() {
                    if (q.classList.contains(''answered'')) return;
                    q.classList.add(''answered'');
                    answeredCount++;
                    const si = parseInt(this.dataset.index);
                    if (si === ci) {
                        this.classList.add(''correct'');
                        res.textContent = ''✓ Chính xác!'';
                        res.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        opts[ci].classList.add(''correct'');
                        res.textContent = ''✗ Chưa đúng.'';
                        res.className = ''quiz-result show incorrect'';
                    }
                    if (answeredCount === totalQuestions) {
                        document.getElementById(''correct-count'').textContent = correctCount;
                        document.querySelector(''.quiz-score'').classList.add(''show'');
                    }
                });
            });
        });
    </script>
</body>
</html>
',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 10.3: Cơ Hội Đối Tác - GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #FFBD59; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
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

        /* Partner Tier Table */
        .tier-table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }
        .tier-table th { background: #1a1a2e; color: #FFBD59; padding: 0.75rem 0.5rem; text-align: center; border: 1px solid #27272a; }
        .tier-table td { padding: 0.75rem 0.5rem; text-align: center; border: 1px solid #27272a; background: #0f0f1a; }
        .tier-table tr:hover td { background: #1a1a2e; }
        .tier-icon { font-size: 1.25rem; }

        /* Partner Card */
        .partner-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #FFBD59; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .partner-card h4 { color: #FFBD59; font-size: 1.1rem; margin-bottom: 0.75rem; }
        .benefit-list { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin: 0.75rem 0; }
        .benefit-item { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
        .benefit-item:last-child { margin-bottom: 0; }
        .benefit-item .check { color: #10B981; }

        /* Quiz styles */
        .quiz-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #8B5CF6; }
        .quiz-title { font-size: 1.25rem; font-weight: 600; color: #8B5CF6; margin-bottom: 1rem; }
        .quiz-question { background: #1a1a2e; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
        .quiz-question p { font-weight: 600; color: #ffffff; margin-bottom: 0.75rem; }
        .quiz-option { display: block; width: 100%; padding: 0.75rem 1rem; margin-bottom: 0.5rem; background: #0f0f1a; border: 2px solid #27272a; border-radius: 8px; color: #d4d4d8; cursor: pointer; text-align: left; transition: all 0.2s; }
        .quiz-option:hover { border-color: #8B5CF6; background: rgba(139,92,246,0.1); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { display: none; padding: 0.75rem; border-radius: 8px; margin-top: 0.5rem; font-weight: 600; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { display: none; text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(255,189,89,0.1), rgba(16,185,129,0.1)); border-radius: 12px; margin-top: 1rem; }
        .quiz-score.show { display: block; }
        .quiz-score h3 { color: #FFBD59; margin-bottom: 0.5rem; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }

        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .tier-table { font-size: 0.75rem; }
            .tier-table th, .tier-table td { padding: 0.5rem 0.25rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 1 - Cơ Bản</span>
            <span class="module-badge">MODULE B</span>
            <h1 class="lesson-title">Cơ Hội Đối Tác</h1>
            <p class="lesson-subtitle">Chương Trình CTV & KOL Affiliate - Thu Nhập Từ Network</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🤝</div>
            <h2 class="section-title">Chương Trình Đối Tác GEM</h2>
            <p>Ngoài trading, GEM còn có <strong style="color: #FFBD59;">Chương Trình Đối Tác</strong> giúp bạn tạo thu nhập thụ động bằng cách giới thiệu học viên mới.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Ý Tưởng:</strong> Bạn đã học phương pháp GEM, thấy nó hiệu quả. Tại sao không chia sẻ với người khác đang tìm kiếm giải pháp trading và được thưởng cho điều đó?</p>
            </div>

            <p>GEM có <strong>2 chương trình</strong> chính:</p>
            <ul>
                <li><strong>CTV (Cộng Tác Viên):</strong> Ai cũng có thể đăng ký, không yêu cầu đặc biệt</li>
                <li><strong>KOL Affiliate:</strong> Dành cho influencers có 20,000+ followers</li>
            </ul>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=GEM+Partnership+Programs" alt="Partnership Programs">
                <p class="image-caption">Hai chương trình đối tác của GEM</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🥇</div>
            <h2 class="section-title">Chương Trình CTV - 5 Cấp Bậc</h2>
            <p>Chương trình CTV có <strong>5 cấp bậc</strong> với hoa hồng tăng dần theo doanh số tích lũy:</p>

            <table class="tier-table">
                <thead>
                    <tr>
                        <th>Cấp Bậc</th>
                        <th>Ngưỡng</th>
                        <th>Digital</th>
                        <th>Physical</th>
                        <th>Sub-Aff</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><span class="tier-icon">🥉</span> Bronze (Đồng)</td>
                        <td>0</td>
                        <td><strong style="color: #10B981;">10%</strong></td>
                        <td>6%</td>
                        <td>2%</td>
                    </tr>
                    <tr>
                        <td><span class="tier-icon">🥈</span> Silver (Bạc)</td>
                        <td>50M</td>
                        <td><strong style="color: #10B981;">15%</strong></td>
                        <td>8%</td>
                        <td>2.5%</td>
                    </tr>
                    <tr>
                        <td><span class="tier-icon">🥇</span> Gold (Vàng)</td>
                        <td>150M</td>
                        <td><strong style="color: #10B981;">20%</strong></td>
                        <td>10%</td>
                        <td>3%</td>
                    </tr>
                    <tr>
                        <td><span class="tier-icon">💎</span> Platinum (Bạch Kim)</td>
                        <td>400M</td>
                        <td><strong style="color: #10B981;">25%</strong></td>
                        <td>12%</td>
                        <td>3.5%</td>
                    </tr>
                    <tr>
                        <td><span class="tier-icon">👑</span> Diamond (Kim Cương)</td>
                        <td>800M</td>
                        <td><strong style="color: #10B981;">30%</strong></td>
                        <td>15%</td>
                        <td>4%</td>
                    </tr>
                </tbody>
            </table>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>📝 Giải thích:</strong><br>
                • <strong>Digital:</strong> Hoa hồng cho sản phẩm số (khóa học, subscription)<br>
                • <strong>Physical:</strong> Hoa hồng cho sản phẩm vật lý (crystal, jewelry)<br>
                • <strong>Sub-Aff:</strong> Hoa hồng từ doanh số của CTV bạn giới thiệu</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⭐</div>
            <h2 class="section-title">Chương Trình KOL Affiliate</h2>
            <p>Dành cho những người có ảnh hưởng trên mạng xã hội:</p>

            <div class="partner-card" style="border-color: #8B5CF6;">
                <h4 style="color: #8B5CF6;">⭐ KOL Affiliate</h4>
                <p><strong>Yêu cầu:</strong> 20,000+ followers (YouTube, Facebook, TikTok, Instagram...)</p>
                <div class="benefit-list">
                    <div class="benefit-item"><span class="check">✓</span> Digital: <strong style="color: #10B981;">20%</strong></div>
                    <div class="benefit-item"><span class="check">✓</span> Physical: <strong style="color: #10B981;">20%</strong></div>
                    <div class="benefit-item"><span class="check">✓</span> Sub-Affiliate: <strong style="color: #10B981;">3.5%</strong></div>
                    <div class="benefit-item"><span class="check">✓</span> Thanh toán: 2 lần/tháng (ngày 1 và 15)</div>
                </div>
                <p style="margin-top: 1rem; margin-bottom: 0; color: #a1a1aa; font-size: 0.9rem;"><em>⚠️ Lưu ý: Yêu cầu 20K+ followers là BẮT BUỘC, không có ngoại lệ.</em></p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Ví Dụ Thu Nhập</h2>
            <p>Dưới đây là ví dụ thu nhập từ chương trình CTV:</p>

            <div class="partner-card">
                <h4>💰 Ví Dụ: CTV Bronze bán 1 khóa Tier 2 (2,000,000đ)</h4>
                <div class="benefit-list">
                    <div class="benefit-item"><span class="check">→</span> Commission: 2,000,000 × 10% = <strong style="color: #10B981;">200,000đ</strong></div>
                </div>
            </div>

            <div class="partner-card" style="border-color: #10B981;">
                <h4 style="color: #10B981;">💰 Ví Dụ: CTV Gold bán 5 khóa Tier 2/tháng</h4>
                <div class="benefit-list">
                    <div class="benefit-item"><span class="check">→</span> Commission: 5 × 2,000,000 × 20% = <strong style="color: #10B981;">2,000,000đ/tháng</strong></div>
                </div>
            </div>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>📈 Tiềm năng:</strong> CTV Diamond có thể kiếm <strong>5-20 triệu/tháng</strong> hoặc hơn tùy thuộc vào network và nỗ lực của bạn.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Income+Examples" alt="Income Examples">
                <p class="image-caption">Ví dụ thu nhập từ chương trình CTV</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🚀</div>
            <h2 class="section-title">Cách Đăng Ký</h2>
            <p>Quy trình đăng ký CTV đơn giản:</p>

            <ul>
                <li><strong>Bước 1:</strong> Mở app GEM Mobile → Account → Affiliate</li>
                <li><strong>Bước 2:</strong> Điền form đăng ký CTV</li>
                <li><strong>Bước 3:</strong> Chờ duyệt (tự động sau 3 ngày hoặc Admin duyệt sớm hơn)</li>
                <li><strong>Bước 4:</strong> Nhận link giới thiệu và bắt đầu chia sẻ</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Mẹo:</strong> Đừng "bán hàng" trực tiếp. Hãy chia sẻ trải nghiệm thật, kết quả thật. Người khác sẽ tự tìm đến bạn.</p>
            </div>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="0">
                <p>1. Chương trình CTV có bao nhiêu cấp bậc?</p>
                <button class="quiz-option" data-index="0">A. 5 cấp (Bronze, Silver, Gold, Platinum, Diamond)</button>
                <button class="quiz-option" data-index="1">B. 3 cấp (Bronze, Silver, Gold)</button>
                <button class="quiz-option" data-index="2">C. 4 cấp (Starter, Pro, Elite, VIP)</button>
                <button class="quiz-option" data-index="3">D. 2 cấp (CTV và KOL)</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p>2. Hoa hồng Digital cao nhất của CTV Diamond là bao nhiêu?</p>
                <button class="quiz-option" data-index="0">A. 20%</button>
                <button class="quiz-option" data-index="1">B. 25%</button>
                <button class="quiz-option" data-index="2">C. 30%</button>
                <button class="quiz-option" data-index="3">D. 40%</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p>3. Yêu cầu để đăng ký KOL Affiliate là gì?</p>
                <button class="quiz-option" data-index="0">A. Hoàn thành Tier 3</button>
                <button class="quiz-option" data-index="1">B. 20,000+ followers trên mạng xã hội</button>
                <button class="quiz-option" data-index="2">C. Đóng phí 5 triệu</button>
                <button class="quiz-option" data-index="3">D. Không có yêu cầu</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <h3>🎉 Hoàn thành!</h3>
                <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 1 Cơ Bản - Module B</p>
            <p>© 2024 GEM Trading. All rights reserved.</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 3;
        let answeredCount = 0;
        let correctCount = 0;
        document.querySelectorAll(''.quiz-question'').forEach(q => {
            const ci = parseInt(q.dataset.correct);
            const opts = q.querySelectorAll(''.quiz-option'');
            const res = q.querySelector(''.quiz-result'');
            opts.forEach(o => {
                o.addEventListener(''click'', function() {
                    if (q.classList.contains(''answered'')) return;
                    q.classList.add(''answered'');
                    answeredCount++;
                    const si = parseInt(this.dataset.index);
                    if (si === ci) {
                        this.classList.add(''correct'');
                        res.textContent = ''✓ Chính xác!'';
                        res.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        opts[ci].classList.add(''correct'');
                        res.textContent = ''✗ Chưa đúng.'';
                        res.className = ''quiz-result show incorrect'';
                    }
                    if (answeredCount === totalQuestions) {
                        document.getElementById(''correct-count'').textContent = correctCount;
                        document.querySelector(''.quiz-score'').classList.add(''show'');
                    }
                });
            });
        });
    </script>
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

-- Lesson 10.4: Câu Chuyện Thành Công - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch10-l4',
  'module-tier-1-ch10',
  'course-tier1-trading-foundation',
  'Bài 10.4: Câu Chuyện Thành Công - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 10.4: Câu Chuyện Thành Công - GEM Trading Academy</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-navy: #112250;
            --primary-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --error-red: #EF4444;
            --bg-dark: #0A0E17;
            --bg-card: #1A1F2E;
            --bg-card-hover: #252B3D;
            --text-primary: #FFFFFF;
            --text-secondary: #A0A9C0;
            --border-color: rgba(255, 189, 89, 0.2);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.7;
            font-size: 16px;
            padding: 0;
            overflow-x: hidden;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--bg-dark);
        }

        @media (min-width: 600px) {
            body {
                padding: 2rem;
                background: linear-gradient(135deg, #0A0E17 0%, #112250 100%);
            }
            .lesson-container {
                background: var(--bg-card);
                border-radius: 20px;
                border: 1px solid var(--border-color);
                overflow: hidden;
            }
        }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem 1rem;
            text-align: center;
            border-bottom: 3px solid var(--primary-gold);
            position: relative;
            overflow: hidden;
        }

        .lesson-header::before {
            content: '''';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,189,89,0.1) 0%, transparent 50%);
            animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--primary-gold) 0%, #FFD700 100%);
            color: var(--primary-navy);
            padding: 0.5rem 1.25rem;
            border-radius: 25px;
            font-size: 0.85rem;
            font-weight: 700;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .lesson-header h1 {
            font-size: clamp(1.5rem, 5vw, 2rem);
            font-weight: 700;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        .lesson-header p {
            color: var(--text-secondary);
            font-size: 1rem;
            position: relative;
            z-index: 1;
        }

        .content-section {
            padding: 0;
        }

        @media (min-width: 600px) {
            .content-section {
                padding: 1.5rem;
            }
        }

        .content-card {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin-bottom: 1px;
            border-left: 4px solid var(--primary-gold);
        }

        @media (min-width: 600px) {
            .content-card {
                border-radius: 16px;
                padding: 2rem;
                margin-bottom: 1.5rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--primary-gold);
            }
        }

        .content-card h2 {
            font-size: 1.35rem;
            font-weight: 700;
            margin-bottom: 1.25rem;
            color: var(--primary-gold);
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .content-card h2 .icon {
            font-size: 1.5rem;
        }

        .content-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 1.5rem 0 1rem 0;
            color: var(--accent-cyan);
        }

        .content-card p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
            font-size: 1rem;
            line-height: 1.8;
        }

        .highlight-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1.25rem 0;
        }

        .highlight-box.cyan {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(0, 240, 255, 0.05) 100%);
            border-color: rgba(0, 240, 255, 0.3);
        }

        .highlight-box.purple {
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.15) 0%, rgba(106, 91, 255, 0.05) 100%);
            border-color: rgba(106, 91, 255, 0.3);
        }

        .highlight-box.green {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .highlight-box p {
            margin: 0;
            color: var(--text-primary);
        }

        .image-placeholder {
            background: linear-gradient(145deg, #1a2235 0%, #0d1321 100%);
            border: 2px dashed rgba(255, 189, 89, 0.4);
            border-radius: 12px;
            padding: 1rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        .image-placeholder img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin-bottom: 0.75rem;
        }

        .image-placeholder p {
            font-size: 0.85rem;
            color: var(--primary-gold);
            margin: 0;
            font-style: italic;
        }

        .story-card {
            background: linear-gradient(135deg, var(--bg-card-hover) 0%, var(--bg-card) 100%);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            overflow: hidden;
            margin: 1.5rem 0;
        }

        .story-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 1.25rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .story-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: var(--primary-gold);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: var(--primary-navy);
            font-weight: 700;
        }

        .story-meta h4 {
            font-size: 1.1rem;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .story-meta .tag {
            display: inline-block;
            background: var(--success-green);
            color: white;
            font-size: 0.75rem;
            padding: 0.2rem 0.6rem;
            border-radius: 10px;
            font-weight: 600;
        }

        .story-content {
            padding: 1.5rem;
        }

        .story-content .quote {
            font-style: italic;
            color: var(--text-secondary);
            margin-bottom: 1rem;
            padding-left: 1rem;
            border-left: 3px solid var(--primary-gold);
        }

        .story-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1px;
            background: var(--border-color);
            margin-top: 1rem;
        }

        .stat-item {
            background: var(--bg-card-hover);
            padding: 1rem;
            text-align: center;
        }

        .stat-item .value {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--success-green);
        }

        .stat-item .label {
            font-size: 0.8rem;
            color: var(--text-secondary);
        }

        .timeline {
            position: relative;
            padding-left: 2rem;
            margin: 1.5rem 0;
        }

        .timeline::before {
            content: '''';
            position: absolute;
            left: 0.5rem;
            top: 0;
            bottom: 0;
            width: 2px;
            background: var(--border-color);
        }

        .timeline-item {
            position: relative;
            padding-bottom: 1.5rem;
        }

        .timeline-item:last-child {
            padding-bottom: 0;
        }

        .timeline-item::before {
            content: '''';
            position: absolute;
            left: -1.65rem;
            top: 0.35rem;
            width: 12px;
            height: 12px;
            background: var(--primary-gold);
            border-radius: 50%;
        }

        .timeline-item .time {
            font-size: 0.85rem;
            color: var(--primary-gold);
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .timeline-item .event {
            color: var(--text-secondary);
            font-size: 0.95rem;
        }

        .lesson-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1px;
            background: var(--border-color);
            margin: 1.5rem 0;
        }

        @media (min-width: 600px) {
            .lesson-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                background: transparent;
            }
        }

        .lesson-item {
            background: var(--bg-card-hover);
            padding: 1.25rem;
        }

        @media (min-width: 600px) {
            .lesson-item {
                border-radius: 12px;
                border: 1px solid var(--border-color);
            }
        }

        .lesson-item .number {
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-gold);
            margin-bottom: 0.5rem;
        }

        .lesson-item h4 {
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }

        .lesson-item p {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin: 0;
        }

        .summary-box {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            border: 2px solid var(--primary-gold);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin: 0;
        }

        @media (min-width: 600px) {
            .summary-box {
                border-radius: 16px;
                padding: 2rem;
                margin: 1.5rem;
            }
        }

        .summary-box h3 {
            color: var(--primary-gold);
            font-size: 1.25rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding: 0;
        }

        .summary-box li {
            padding: 0.5rem 0;
            padding-left: 1.75rem;
            position: relative;
            color: var(--text-primary);
        }

        .summary-box li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-weight: 700;
        }

        .quiz-section {
            padding: 0;
        }

        @media (min-width: 600px) {
            .quiz-section {
                padding: 1.5rem;
            }
        }

        .quiz-container {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            border-left: 4px solid var(--accent-purple);
        }

        @media (min-width: 600px) {
            .quiz-container {
                border-radius: 16px;
                padding: 2rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--accent-purple);
            }
        }

        .quiz-container h2 {
            color: var(--accent-purple);
            font-size: 1.35rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .quiz-question {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1.25rem;
            border: 1px solid var(--border-color);
        }

        .quiz-question p {
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.875rem 1rem;
            margin-bottom: 0.5rem;
            background: var(--bg-card);
            border: 2px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
            font-size: 0.95rem;
        }

        .quiz-option:hover:not(:disabled) {
            border-color: var(--accent-purple);
            background: rgba(106, 91, 255, 0.1);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--success-green);
            color: var(--success-green);
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: var(--error-red);
            color: var(--error-red);
        }

        .quiz-result {
            padding: 0.75rem;
            border-radius: 8px;
            margin-top: 0.75rem;
            font-weight: 600;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success-green);
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.2);
            color: var(--error-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score h3 {
            color: var(--primary-gold);
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
        }

        .quiz-score p {
            color: var(--text-secondary);
        }

        .retake-btn {
            display: inline-block;
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--accent-purple) 0%, #5346E0 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .retake-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(106, 91, 255, 0.4);
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            background: var(--bg-card);
            border-top: 1px solid var(--border-color);
        }

        .lesson-footer p {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .lesson-footer .brand {
            color: var(--primary-gold);
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <div class="header-badge">Module B - Bài 4/7</div>
            <h1>Câu Chuyện Thành Công</h1>
            <p>Những học viên đã thay đổi cuộc sống nhờ GEM Method</p>
        </header>

        <section class="content-section">
            <div class="content-card">
                <h2><span class="icon">🌟</span> Họ Đã Làm Được, Bạn Cũng Sẽ!</h2>

                <p>Đây là những câu chuyện thật từ học viên GEM Trading Academy. Họ bắt đầu giống như bạn - thua lỗ, mất phương hướng - và đã tìm được con đường.</p>

                <div class="highlight-box">
                    <p><strong>💡 Lưu ý:</strong> Mỗi người có hoàn cảnh khác nhau. Kết quả phụ thuộc vào sự nỗ lực và kỷ luật của từng cá nhân. Những câu chuyện dưới đây là để truyền cảm hứng, không phải lời hứa về kết quả.</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📖</span> Câu Chuyện #1: Anh Minh - Từ Thua 80% Đến Profitable</h2>

                <div class="story-card">
                    <div class="story-header">
                        <div class="story-avatar">M</div>
                        <div class="story-meta">
                            <h4>Anh Minh T.</h4>
                            <span class="tag">TIER 2 Graduate</span>
                        </div>
                    </div>
                    <div class="story-content">
                        <p class="quote">"Trước GEM, tôi trade theo cảm xúc. Mua vì FOMO, bán vì sợ hãi. 2 năm liền thua lỗ. Khi học GEM, tôi nhận ra mình chưa bao giờ có HỆ THỐNG. Pattern Frequency thay đổi hoàn toàn cách tôi nhìn chart."</p>

                        <div class="timeline">
                            <div class="timeline-item">
                                <div class="time">Tháng 1 (Trước GEM)</div>
                                <div class="event">Thua 80% tài khoản, gần như bỏ cuộc</div>
                            </div>
                            <div class="timeline-item">
                                <div class="time">Tháng 2-3</div>
                                <div class="event">Học TIER 1, paper trade nghiêm túc</div>
                            </div>
                            <div class="timeline-item">
                                <div class="time">Tháng 4-5</div>
                                <div class="event">Upgrade TIER 2, Win Rate đạt 55%</div>
                            </div>
                            <div class="timeline-item">
                                <div class="time">Tháng 6 (Hiện tại)</div>
                                <div class="event">Win Rate 62%, profitable 4 tháng liên tiếp</div>
                            </div>
                        </div>

                        <div class="story-stats">
                            <div class="stat-item">
                                <div class="value">62%</div>
                                <div class="label">Win Rate</div>
                            </div>
                            <div class="stat-item">
                                <div class="value">1:2.5</div>
                                <div class="label">Avg R:R</div>
                            </div>
                            <div class="stat-item">
                                <div class="value">4 tháng</div>
                                <div class="label">Profitable</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/112250/10B981?text=Minh+Trading+Results" alt="Minh Trading Results">
                    <p>📸 Kết quả trading của anh Minh (đã che thông tin cá nhân)</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📖</span> Câu Chuyện #2: Chị Lan - Full-time Trader Tại Nhà</h2>

                <div class="story-card">
                    <div class="story-header">
                        <div class="story-avatar">L</div>
                        <div class="story-meta">
                            <h4>Chị Lan P.</h4>
                            <span class="tag">TIER 3 Elite</span>
                        </div>
                    </div>
                    <div class="story-content">
                        <p class="quote">"Là mẹ 2 con, tôi cần công việc linh hoạt. Trading cho phép tôi làm việc tại nhà, dành thời gian cho gia đình. GEM giúp tôi có phương pháp để trade như một nghề nghiêm túc, không phải đánh bạc."</p>

                        <div class="timeline">
                            <div class="timeline-item">
                                <div class="time">Trước GEM</div>
                                <div class="event">Làm văn phòng, stress, ít thời gian cho con</div>
                            </div>
                            <div class="timeline-item">
                                <div class="time">6 tháng đầu</div>
                                <div class="event">Học từ TIER 1 → TIER 3, trade part-time</div>
                            </div>
                            <div class="timeline-item">
                                <div class="time">Tháng 7-12</div>
                                <div class="event">Thu nhập trade ổn định, bằng lương cũ</div>
                            </div>
                            <div class="timeline-item">
                                <div class="time">Năm 2 (Hiện tại)</div>
                                <div class="event">Full-time trader, thu nhập gấp 2x lương cũ</div>
                            </div>
                        </div>

                        <div class="story-stats">
                            <div class="stat-item">
                                <div class="value">2-3h/ngày</div>
                                <div class="label">Thời gian trade</div>
                            </div>
                            <div class="stat-item">
                                <div class="value">2x</div>
                                <div class="label">So với lương cũ</div>
                            </div>
                            <div class="stat-item">
                                <div class="value">Linh hoạt</div>
                                <div class="label">Thời gian cho con</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/0A0E17/FFBD59?text=Lan+Work+Life+Balance" alt="Lan Work Life Balance">
                    <p>📸 Chị Lan làm việc tại nhà (ảnh minh họa)</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📖</span> Câu Chuyện #3: Bạn Hùng - Sinh Viên Kiếm Thêm</h2>

                <div class="story-card">
                    <div class="story-header">
                        <div class="story-avatar">H</div>
                        <div class="story-meta">
                            <h4>Bạn Hùng N.</h4>
                            <span class="tag">TIER 1 → TIER 2</span>
                        </div>
                    </div>
                    <div class="story-content">
                        <p class="quote">"Là sinh viên, tôi không có nhiều vốn. Bắt đầu với $200, paper trade 3 tháng, rồi trade thật với $500. Giờ tự trang trải học phí mà không cần xin bố mẹ."</p>

                        <div class="timeline">
                            <div class="timeline-item">
                                <div class="time">Khởi đầu</div>
                                <div class="event">Sinh viên năm 3, biết crypto qua bạn bè</div>
                            </div>
                            <div class="timeline-item">
                                <div class="time">3 tháng đầu</div>
                                <div class="event">Paper trade nghiêm túc, không nóng vội</div>
                            </div>
                            <div class="timeline-item">
                                <div class="time">Tháng 4-6</div>
                                <div class="event">Trade thật với $500, lợi nhuận 30%</div>
                            </div>
                            <div class="timeline-item">
                                <div class="time">Hiện tại</div>
                                <div class="event">Tài khoản $2,000+, tự trang trải học phí</div>
                            </div>
                        </div>

                        <div class="story-stats">
                            <div class="stat-item">
                                <div class="value">$500</div>
                                <div class="label">Vốn ban đầu</div>
                            </div>
                            <div class="stat-item">
                                <div class="value">$2,000+</div>
                                <div class="label">Tài khoản hiện tại</div>
                            </div>
                            <div class="stat-item">
                                <div class="value">8 tháng</div>
                                <div class="label">Hành trình</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/112250/00F0FF?text=Hung+Student+Success" alt="Hung Student Success">
                    <p>📸 Hành trình của bạn Hùng từ $500 → $2,000+</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🎯</span> Bài Học Chung Từ Các Câu Chuyện</h2>

                <p>Dù hoàn cảnh khác nhau, những học viên thành công đều có điểm chung:</p>

                <div class="lesson-grid">
                    <div class="lesson-item">
                        <div class="number">01</div>
                        <h4>Học đúng phương pháp</h4>
                        <p>Không trade theo cảm xúc, có hệ thống rõ ràng</p>
                    </div>
                    <div class="lesson-item">
                        <div class="number">02</div>
                        <h4>Paper trade trước</h4>
                        <p>Không nóng vội, luyện tập 2-3 tháng trước khi trade thật</p>
                    </div>
                    <div class="lesson-item">
                        <div class="number">03</div>
                        <h4>Kỷ luật tuyệt đối</h4>
                        <p>Tuân thủ rules, không phá vỡ stop loss</p>
                    </div>
                    <div class="lesson-item">
                        <div class="number">04</div>
                        <h4>Kiên nhẫn dài hạn</h4>
                        <p>Không kỳ vọng làm giàu nhanh, tích lũy từ từ</p>
                    </div>
                </div>

                <div class="highlight-box green">
                    <p><strong>💡 Key insight:</strong> Không ai thành công sau 1 tuần. Tất cả đều mất <strong>3-6 tháng</strong> học và luyện tập trước khi có kết quả ổn định.</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🚀</span> Câu Chuyện Tiếp Theo Có Thể Là BẠN</h2>

                <p>Bạn đã hoàn thành TIER 1, bạn đã có nền tảng. Điều khác biệt giữa những người thành công và thất bại là:</p>

                <ul>
                    <li><strong>Hành động:</strong> Họ không chỉ học, họ THỰC HÀNH</li>
                    <li><strong>Kiên trì:</strong> Họ không bỏ cuộc sau vài lần thua</li>
                    <li><strong>Đầu tư:</strong> Họ sẵn sàng đầu tư thời gian và tiền bạc để phát triển</li>
                </ul>

                <div class="highlight-box purple">
                    <p><strong>🎯 Câu hỏi cho bạn:</strong> Bạn muốn câu chuyện của mình được kể ở đây sau 6 tháng nữa? Quyết định nằm trong tay bạn.</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/6A5BFF/FFFFFF?text=Your+Story+Starts+Here" alt="Your Story Starts Here">
                    <p>📸 Câu chuyện của bạn bắt đầu từ đây!</p>
                </div>
            </div>

            <div class="summary-box">
                <h3>📝 Tóm Tắt Bài Học</h3>
                <ul>
                    <li>Nhiều học viên GEM đã đạt được kết quả tích cực sau 3-6 tháng</li>
                    <li>Điểm chung: Học đúng phương pháp, paper trade, kỷ luật, kiên nhẫn</li>
                    <li>Không ai làm giàu nhanh - đó là hành trình dài hạn</li>
                    <li>Kết quả phụ thuộc vào sự nỗ lực của từng cá nhân</li>
                    <li>Câu chuyện tiếp theo có thể là của bạn</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-container">
                <h2><span class="icon">❓</span> Kiểm Tra Kiến Thức</h2>

                <div class="quiz-question" data-correct="2">
                    <p>1. Điểm chung của tất cả học viên thành công là gì?</p>
                    <button class="quiz-option" data-index="0">A. Họ có nhiều vốn hơn người khác</button>
                    <button class="quiz-option" data-index="1">B. Họ may mắn vào đúng thời điểm thị trường</button>
                    <button class="quiz-option" data-index="2">C. Họ học đúng phương pháp, kỷ luật và kiên nhẫn</button>
                    <button class="quiz-option" data-index="3">D. Họ trade nhiều lệnh hơn mỗi ngày</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="1">
                    <p>2. Thời gian trung bình để đạt kết quả ổn định là bao lâu?</p>
                    <button class="quiz-option" data-index="0">A. 1-2 tuần</button>
                    <button class="quiz-option" data-index="1">B. 3-6 tháng</button>
                    <button class="quiz-option" data-index="2">C. 1 ngày là đủ</button>
                    <button class="quiz-option" data-index="3">D. 5 năm trở lên</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <p>3. Tại sao các học viên thành công đều paper trade trước?</p>
                    <button class="quiz-option" data-index="0">A. Để luyện tập và kiểm chứng phương pháp mà không rủi ro tiền thật</button>
                    <button class="quiz-option" data-index="1">B. Vì họ không có tiền trade thật</button>
                    <button class="quiz-option" data-index="2">C. Vì paper trade kiếm tiền nhiều hơn</button>
                    <button class="quiz-option" data-index="3">D. Paper trade không quan trọng</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🎉 Hoàn thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>Bài học thuộc <span class="brand">GEM Trading Academy</span></p>
            <p>© 2024 - Nền tảng đào tạo trading chuyên nghiệp</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 3;
        let answeredCount = 0;
        let correctCount = 0;

        document.querySelectorAll(''.quiz-question'').forEach(question => {
            const correctIndex = parseInt(question.dataset.correct);
            const options = question.querySelectorAll(''.quiz-option'');
            const result = question.querySelector(''.quiz-result'');

            options.forEach(option => {
                option.addEventListener(''click'', function() {
                    if (question.classList.contains(''answered'')) return;

                    question.classList.add(''answered'');
                    answeredCount++;

                    const selectedIndex = parseInt(this.dataset.index);

                    if (selectedIndex === correctIndex) {
                        this.classList.add(''correct'');
                        result.textContent = ''✓ Chính xác! Bạn đã rút ra được bài học từ các câu chuyện.'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng. Xem lại đáp án đúng được highlight.'';
                        result.className = ''quiz-result show incorrect'';
                    }

                    if (answeredCount === totalQuestions) {
                        document.getElementById(''correct-count'').textContent = correctCount;
                        document.querySelector(''.quiz-score'').classList.add(''show'');
                    }
                });
            });
        });
    </script>
</body>
</html>
',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 10.4: Câu Chuyện Thành Công - GEM Trading Academy</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-navy: #112250;
            --primary-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --error-red: #EF4444;
            --bg-dark: #0A0E17;
            --bg-card: #1A1F2E;
            --bg-card-hover: #252B3D;
            --text-primary: #FFFFFF;
            --text-secondary: #A0A9C0;
            --border-color: rgba(255, 189, 89, 0.2);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.7;
            font-size: 16px;
            padding: 0;
            overflow-x: hidden;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--bg-dark);
        }

        @media (min-width: 600px) {
            body {
                padding: 2rem;
                background: linear-gradient(135deg, #0A0E17 0%, #112250 100%);
            }
            .lesson-container {
                background: var(--bg-card);
                border-radius: 20px;
                border: 1px solid var(--border-color);
                overflow: hidden;
            }
        }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem 1rem;
            text-align: center;
            border-bottom: 3px solid var(--primary-gold);
            position: relative;
            overflow: hidden;
        }

        .lesson-header::before {
            content: '''';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,189,89,0.1) 0%, transparent 50%);
            animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--primary-gold) 0%, #FFD700 100%);
            color: var(--primary-navy);
            padding: 0.5rem 1.25rem;
            border-radius: 25px;
            font-size: 0.85rem;
            font-weight: 700;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .lesson-header h1 {
            font-size: clamp(1.5rem, 5vw, 2rem);
            font-weight: 700;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        .lesson-header p {
            color: var(--text-secondary);
            font-size: 1rem;
            position: relative;
            z-index: 1;
        }

        .content-section {
            padding: 0;
        }

        @media (min-width: 600px) {
            .content-section {
                padding: 1.5rem;
            }
        }

        .content-card {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin-bottom: 1px;
            border-left: 4px solid var(--primary-gold);
        }

        @media (min-width: 600px) {
            .content-card {
                border-radius: 16px;
                padding: 2rem;
                margin-bottom: 1.5rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--primary-gold);
            }
        }

        .content-card h2 {
            font-size: 1.35rem;
            font-weight: 700;
            margin-bottom: 1.25rem;
            color: var(--primary-gold);
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .content-card h2 .icon {
            font-size: 1.5rem;
        }

        .content-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 1.5rem 0 1rem 0;
            color: var(--accent-cyan);
        }

        .content-card p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
            font-size: 1rem;
            line-height: 1.8;
        }

        .highlight-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1.25rem 0;
        }

        .highlight-box.cyan {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(0, 240, 255, 0.05) 100%);
            border-color: rgba(0, 240, 255, 0.3);
        }

        .highlight-box.purple {
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.15) 0%, rgba(106, 91, 255, 0.05) 100%);
            border-color: rgba(106, 91, 255, 0.3);
        }

        .highlight-box.green {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .highlight-box p {
            margin: 0;
            color: var(--text-primary);
        }

        .image-placeholder {
            background: linear-gradient(145deg, #1a2235 0%, #0d1321 100%);
            border: 2px dashed rgba(255, 189, 89, 0.4);
            border-radius: 12px;
            padding: 1rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        .image-placeholder img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin-bottom: 0.75rem;
        }

        .image-placeholder p {
            font-size: 0.85rem;
            color: var(--primary-gold);
            margin: 0;
            font-style: italic;
        }

        .story-card {
            background: linear-gradient(135deg, var(--bg-card-hover) 0%, var(--bg-card) 100%);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            overflow: hidden;
            margin: 1.5rem 0;
        }

        .story-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 1.25rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .story-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: var(--primary-gold);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: var(--primary-navy);
            font-weight: 700;
        }

        .story-meta h4 {
            font-size: 1.1rem;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .story-meta .tag {
            display: inline-block;
            background: var(--success-green);
            color: white;
            font-size: 0.75rem;
            padding: 0.2rem 0.6rem;
            border-radius: 10px;
            font-weight: 600;
        }

        .story-content {
            padding: 1.5rem;
        }

        .story-content .quote {
            font-style: italic;
            color: var(--text-secondary);
            margin-bottom: 1rem;
            padding-left: 1rem;
            border-left: 3px solid var(--primary-gold);
        }

        .story-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1px;
            background: var(--border-color);
            margin-top: 1rem;
        }

        .stat-item {
            background: var(--bg-card-hover);
            padding: 1rem;
            text-align: center;
        }

        .stat-item .value {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--success-green);
        }

        .stat-item .label {
            font-size: 0.8rem;
            color: var(--text-secondary);
        }

        .timeline {
            position: relative;
            padding-left: 2rem;
            margin: 1.5rem 0;
        }

        .timeline::before {
            content: '''';
            position: absolute;
            left: 0.5rem;
            top: 0;
            bottom: 0;
            width: 2px;
            background: var(--border-color);
        }

        .timeline-item {
            position: relative;
            padding-bottom: 1.5rem;
        }

        .timeline-item:last-child {
            padding-bottom: 0;
        }

        .timeline-item::before {
            content: '''';
            position: absolute;
            left: -1.65rem;
            top: 0.35rem;
            width: 12px;
            height: 12px;
            background: var(--primary-gold);
            border-radius: 50%;
        }

        .timeline-item .time {
            font-size: 0.85rem;
            color: var(--primary-gold);
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .timeline-item .event {
            color: var(--text-secondary);
            font-size: 0.95rem;
        }

        .lesson-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1px;
            background: var(--border-color);
            margin: 1.5rem 0;
        }

        @media (min-width: 600px) {
            .lesson-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                background: transparent;
            }
        }

        .lesson-item {
            background: var(--bg-card-hover);
            padding: 1.25rem;
        }

        @media (min-width: 600px) {
            .lesson-item {
                border-radius: 12px;
                border: 1px solid var(--border-color);
            }
        }

        .lesson-item .number {
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-gold);
            margin-bottom: 0.5rem;
        }

        .lesson-item h4 {
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }

        .lesson-item p {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin: 0;
        }

        .summary-box {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            border: 2px solid var(--primary-gold);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin: 0;
        }

        @media (min-width: 600px) {
            .summary-box {
                border-radius: 16px;
                padding: 2rem;
                margin: 1.5rem;
            }
        }

        .summary-box h3 {
            color: var(--primary-gold);
            font-size: 1.25rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding: 0;
        }

        .summary-box li {
            padding: 0.5rem 0;
            padding-left: 1.75rem;
            position: relative;
            color: var(--text-primary);
        }

        .summary-box li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-weight: 700;
        }

        .quiz-section {
            padding: 0;
        }

        @media (min-width: 600px) {
            .quiz-section {
                padding: 1.5rem;
            }
        }

        .quiz-container {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            border-left: 4px solid var(--accent-purple);
        }

        @media (min-width: 600px) {
            .quiz-container {
                border-radius: 16px;
                padding: 2rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--accent-purple);
            }
        }

        .quiz-container h2 {
            color: var(--accent-purple);
            font-size: 1.35rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .quiz-question {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1.25rem;
            border: 1px solid var(--border-color);
        }

        .quiz-question p {
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.875rem 1rem;
            margin-bottom: 0.5rem;
            background: var(--bg-card);
            border: 2px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
            font-size: 0.95rem;
        }

        .quiz-option:hover:not(:disabled) {
            border-color: var(--accent-purple);
            background: rgba(106, 91, 255, 0.1);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--success-green);
            color: var(--success-green);
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: var(--error-red);
            color: var(--error-red);
        }

        .quiz-result {
            padding: 0.75rem;
            border-radius: 8px;
            margin-top: 0.75rem;
            font-weight: 600;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success-green);
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.2);
            color: var(--error-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score h3 {
            color: var(--primary-gold);
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
        }

        .quiz-score p {
            color: var(--text-secondary);
        }

        .retake-btn {
            display: inline-block;
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--accent-purple) 0%, #5346E0 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .retake-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(106, 91, 255, 0.4);
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            background: var(--bg-card);
            border-top: 1px solid var(--border-color);
        }

        .lesson-footer p {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .lesson-footer .brand {
            color: var(--primary-gold);
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <div class="header-badge">Module B - Bài 4/7</div>
            <h1>Câu Chuyện Thành Công</h1>
            <p>Những học viên đã thay đổi cuộc sống nhờ GEM Method</p>
        </header>

        <section class="content-section">
            <div class="content-card">
                <h2><span class="icon">🌟</span> Họ Đã Làm Được, Bạn Cũng Sẽ!</h2>

                <p>Đây là những câu chuyện thật từ học viên GEM Trading Academy. Họ bắt đầu giống như bạn - thua lỗ, mất phương hướng - và đã tìm được con đường.</p>

                <div class="highlight-box">
                    <p><strong>💡 Lưu ý:</strong> Mỗi người có hoàn cảnh khác nhau. Kết quả phụ thuộc vào sự nỗ lực và kỷ luật của từng cá nhân. Những câu chuyện dưới đây là để truyền cảm hứng, không phải lời hứa về kết quả.</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📖</span> Câu Chuyện #1: Anh Minh - Từ Thua 80% Đến Profitable</h2>

                <div class="story-card">
                    <div class="story-header">
                        <div class="story-avatar">M</div>
                        <div class="story-meta">
                            <h4>Anh Minh T.</h4>
                            <span class="tag">TIER 2 Graduate</span>
                        </div>
                    </div>
                    <div class="story-content">
                        <p class="quote">"Trước GEM, tôi trade theo cảm xúc. Mua vì FOMO, bán vì sợ hãi. 2 năm liền thua lỗ. Khi học GEM, tôi nhận ra mình chưa bao giờ có HỆ THỐNG. Pattern Frequency thay đổi hoàn toàn cách tôi nhìn chart."</p>

                        <div class="timeline">
                            <div class="timeline-item">
                                <div class="time">Tháng 1 (Trước GEM)</div>
                                <div class="event">Thua 80% tài khoản, gần như bỏ cuộc</div>
                            </div>
                            <div class="timeline-item">
                                <div class="time">Tháng 2-3</div>
                                <div class="event">Học TIER 1, paper trade nghiêm túc</div>
                            </div>
                            <div class="timeline-item">
                                <div class="time">Tháng 4-5</div>
                                <div class="event">Upgrade TIER 2, Win Rate đạt 55%</div>
                            </div>
                            <div class="timeline-item">
                                <div class="time">Tháng 6 (Hiện tại)</div>
                                <div class="event">Win Rate 62%, profitable 4 tháng liên tiếp</div>
                            </div>
                        </div>

                        <div class="story-stats">
                            <div class="stat-item">
                                <div class="value">62%</div>
                                <div class="label">Win Rate</div>
                            </div>
                            <div class="stat-item">
                                <div class="value">1:2.5</div>
                                <div class="label">Avg R:R</div>
                            </div>
                            <div class="stat-item">
                                <div class="value">4 tháng</div>
                                <div class="label">Profitable</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/112250/10B981?text=Minh+Trading+Results" alt="Minh Trading Results">
                    <p>📸 Kết quả trading của anh Minh (đã che thông tin cá nhân)</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📖</span> Câu Chuyện #2: Chị Lan - Full-time Trader Tại Nhà</h2>

                <div class="story-card">
                    <div class="story-header">
                        <div class="story-avatar">L</div>
                        <div class="story-meta">
                            <h4>Chị Lan P.</h4>
                            <span class="tag">TIER 3 Elite</span>
                        </div>
                    </div>
                    <div class="story-content">
                        <p class="quote">"Là mẹ 2 con, tôi cần công việc linh hoạt. Trading cho phép tôi làm việc tại nhà, dành thời gian cho gia đình. GEM giúp tôi có phương pháp để trade như một nghề nghiêm túc, không phải đánh bạc."</p>

                        <div class="timeline">
                            <div class="timeline-item">
                                <div class="time">Trước GEM</div>
                                <div class="event">Làm văn phòng, stress, ít thời gian cho con</div>
                            </div>
                            <div class="timeline-item">
                                <div class="time">6 tháng đầu</div>
                                <div class="event">Học từ TIER 1 → TIER 3, trade part-time</div>
                            </div>
                            <div class="timeline-item">
                                <div class="time">Tháng 7-12</div>
                                <div class="event">Thu nhập trade ổn định, bằng lương cũ</div>
                            </div>
                            <div class="timeline-item">
                                <div class="time">Năm 2 (Hiện tại)</div>
                                <div class="event">Full-time trader, thu nhập gấp 2x lương cũ</div>
                            </div>
                        </div>

                        <div class="story-stats">
                            <div class="stat-item">
                                <div class="value">2-3h/ngày</div>
                                <div class="label">Thời gian trade</div>
                            </div>
                            <div class="stat-item">
                                <div class="value">2x</div>
                                <div class="label">So với lương cũ</div>
                            </div>
                            <div class="stat-item">
                                <div class="value">Linh hoạt</div>
                                <div class="label">Thời gian cho con</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/0A0E17/FFBD59?text=Lan+Work+Life+Balance" alt="Lan Work Life Balance">
                    <p>📸 Chị Lan làm việc tại nhà (ảnh minh họa)</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📖</span> Câu Chuyện #3: Bạn Hùng - Sinh Viên Kiếm Thêm</h2>

                <div class="story-card">
                    <div class="story-header">
                        <div class="story-avatar">H</div>
                        <div class="story-meta">
                            <h4>Bạn Hùng N.</h4>
                            <span class="tag">TIER 1 → TIER 2</span>
                        </div>
                    </div>
                    <div class="story-content">
                        <p class="quote">"Là sinh viên, tôi không có nhiều vốn. Bắt đầu với $200, paper trade 3 tháng, rồi trade thật với $500. Giờ tự trang trải học phí mà không cần xin bố mẹ."</p>

                        <div class="timeline">
                            <div class="timeline-item">
                                <div class="time">Khởi đầu</div>
                                <div class="event">Sinh viên năm 3, biết crypto qua bạn bè</div>
                            </div>
                            <div class="timeline-item">
                                <div class="time">3 tháng đầu</div>
                                <div class="event">Paper trade nghiêm túc, không nóng vội</div>
                            </div>
                            <div class="timeline-item">
                                <div class="time">Tháng 4-6</div>
                                <div class="event">Trade thật với $500, lợi nhuận 30%</div>
                            </div>
                            <div class="timeline-item">
                                <div class="time">Hiện tại</div>
                                <div class="event">Tài khoản $2,000+, tự trang trải học phí</div>
                            </div>
                        </div>

                        <div class="story-stats">
                            <div class="stat-item">
                                <div class="value">$500</div>
                                <div class="label">Vốn ban đầu</div>
                            </div>
                            <div class="stat-item">
                                <div class="value">$2,000+</div>
                                <div class="label">Tài khoản hiện tại</div>
                            </div>
                            <div class="stat-item">
                                <div class="value">8 tháng</div>
                                <div class="label">Hành trình</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/112250/00F0FF?text=Hung+Student+Success" alt="Hung Student Success">
                    <p>📸 Hành trình của bạn Hùng từ $500 → $2,000+</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🎯</span> Bài Học Chung Từ Các Câu Chuyện</h2>

                <p>Dù hoàn cảnh khác nhau, những học viên thành công đều có điểm chung:</p>

                <div class="lesson-grid">
                    <div class="lesson-item">
                        <div class="number">01</div>
                        <h4>Học đúng phương pháp</h4>
                        <p>Không trade theo cảm xúc, có hệ thống rõ ràng</p>
                    </div>
                    <div class="lesson-item">
                        <div class="number">02</div>
                        <h4>Paper trade trước</h4>
                        <p>Không nóng vội, luyện tập 2-3 tháng trước khi trade thật</p>
                    </div>
                    <div class="lesson-item">
                        <div class="number">03</div>
                        <h4>Kỷ luật tuyệt đối</h4>
                        <p>Tuân thủ rules, không phá vỡ stop loss</p>
                    </div>
                    <div class="lesson-item">
                        <div class="number">04</div>
                        <h4>Kiên nhẫn dài hạn</h4>
                        <p>Không kỳ vọng làm giàu nhanh, tích lũy từ từ</p>
                    </div>
                </div>

                <div class="highlight-box green">
                    <p><strong>💡 Key insight:</strong> Không ai thành công sau 1 tuần. Tất cả đều mất <strong>3-6 tháng</strong> học và luyện tập trước khi có kết quả ổn định.</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🚀</span> Câu Chuyện Tiếp Theo Có Thể Là BẠN</h2>

                <p>Bạn đã hoàn thành TIER 1, bạn đã có nền tảng. Điều khác biệt giữa những người thành công và thất bại là:</p>

                <ul>
                    <li><strong>Hành động:</strong> Họ không chỉ học, họ THỰC HÀNH</li>
                    <li><strong>Kiên trì:</strong> Họ không bỏ cuộc sau vài lần thua</li>
                    <li><strong>Đầu tư:</strong> Họ sẵn sàng đầu tư thời gian và tiền bạc để phát triển</li>
                </ul>

                <div class="highlight-box purple">
                    <p><strong>🎯 Câu hỏi cho bạn:</strong> Bạn muốn câu chuyện của mình được kể ở đây sau 6 tháng nữa? Quyết định nằm trong tay bạn.</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/6A5BFF/FFFFFF?text=Your+Story+Starts+Here" alt="Your Story Starts Here">
                    <p>📸 Câu chuyện của bạn bắt đầu từ đây!</p>
                </div>
            </div>

            <div class="summary-box">
                <h3>📝 Tóm Tắt Bài Học</h3>
                <ul>
                    <li>Nhiều học viên GEM đã đạt được kết quả tích cực sau 3-6 tháng</li>
                    <li>Điểm chung: Học đúng phương pháp, paper trade, kỷ luật, kiên nhẫn</li>
                    <li>Không ai làm giàu nhanh - đó là hành trình dài hạn</li>
                    <li>Kết quả phụ thuộc vào sự nỗ lực của từng cá nhân</li>
                    <li>Câu chuyện tiếp theo có thể là của bạn</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-container">
                <h2><span class="icon">❓</span> Kiểm Tra Kiến Thức</h2>

                <div class="quiz-question" data-correct="2">
                    <p>1. Điểm chung của tất cả học viên thành công là gì?</p>
                    <button class="quiz-option" data-index="0">A. Họ có nhiều vốn hơn người khác</button>
                    <button class="quiz-option" data-index="1">B. Họ may mắn vào đúng thời điểm thị trường</button>
                    <button class="quiz-option" data-index="2">C. Họ học đúng phương pháp, kỷ luật và kiên nhẫn</button>
                    <button class="quiz-option" data-index="3">D. Họ trade nhiều lệnh hơn mỗi ngày</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="1">
                    <p>2. Thời gian trung bình để đạt kết quả ổn định là bao lâu?</p>
                    <button class="quiz-option" data-index="0">A. 1-2 tuần</button>
                    <button class="quiz-option" data-index="1">B. 3-6 tháng</button>
                    <button class="quiz-option" data-index="2">C. 1 ngày là đủ</button>
                    <button class="quiz-option" data-index="3">D. 5 năm trở lên</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <p>3. Tại sao các học viên thành công đều paper trade trước?</p>
                    <button class="quiz-option" data-index="0">A. Để luyện tập và kiểm chứng phương pháp mà không rủi ro tiền thật</button>
                    <button class="quiz-option" data-index="1">B. Vì họ không có tiền trade thật</button>
                    <button class="quiz-option" data-index="2">C. Vì paper trade kiếm tiền nhiều hơn</button>
                    <button class="quiz-option" data-index="3">D. Paper trade không quan trọng</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🎉 Hoàn thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>Bài học thuộc <span class="brand">GEM Trading Academy</span></p>
            <p>© 2024 - Nền tảng đào tạo trading chuyên nghiệp</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 3;
        let answeredCount = 0;
        let correctCount = 0;

        document.querySelectorAll(''.quiz-question'').forEach(question => {
            const correctIndex = parseInt(question.dataset.correct);
            const options = question.querySelectorAll(''.quiz-option'');
            const result = question.querySelector(''.quiz-result'');

            options.forEach(option => {
                option.addEventListener(''click'', function() {
                    if (question.classList.contains(''answered'')) return;

                    question.classList.add(''answered'');
                    answeredCount++;

                    const selectedIndex = parseInt(this.dataset.index);

                    if (selectedIndex === correctIndex) {
                        this.classList.add(''correct'');
                        result.textContent = ''✓ Chính xác! Bạn đã rút ra được bài học từ các câu chuyện.'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng. Xem lại đáp án đúng được highlight.'';
                        result.className = ''quiz-result show incorrect'';
                    }

                    if (answeredCount === totalQuestions) {
                        document.getElementById(''correct-count'').textContent = correctCount;
                        document.querySelector(''.quiz-score'').classList.add(''show'');
                    }
                });
            });
        });
    </script>
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

-- Lesson 10.5: Lợi Thế Đi Sớm - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch10-l5',
  'module-tier-1-ch10',
  'course-tier1-trading-foundation',
  'Bài 10.5: Lợi Thế Đi Sớm - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 10.5: Lợi Thế Đi Sớm - GEM Trading Academy</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-navy: #112250;
            --primary-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --error-red: #EF4444;
            --bg-dark: #0A0E17;
            --bg-card: #1A1F2E;
            --bg-card-hover: #252B3D;
            --text-primary: #FFFFFF;
            --text-secondary: #A0A9C0;
            --border-color: rgba(255, 189, 89, 0.2);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.7;
            font-size: 16px;
            padding: 0;
            overflow-x: hidden;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--bg-dark);
        }

        @media (min-width: 600px) {
            body {
                padding: 2rem;
                background: linear-gradient(135deg, #0A0E17 0%, #112250 100%);
            }
            .lesson-container {
                background: var(--bg-card);
                border-radius: 20px;
                border: 1px solid var(--border-color);
                overflow: hidden;
            }
        }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem 1rem;
            text-align: center;
            border-bottom: 3px solid var(--primary-gold);
            position: relative;
            overflow: hidden;
        }

        .lesson-header::before {
            content: '''';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,189,89,0.1) 0%, transparent 50%);
            animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--primary-gold) 0%, #FFD700 100%);
            color: var(--primary-navy);
            padding: 0.5rem 1.25rem;
            border-radius: 25px;
            font-size: 0.85rem;
            font-weight: 700;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .lesson-header h1 {
            font-size: clamp(1.5rem, 5vw, 2rem);
            font-weight: 700;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        .lesson-header p {
            color: var(--text-secondary);
            font-size: 1rem;
            position: relative;
            z-index: 1;
        }

        .content-section {
            padding: 0;
        }

        @media (min-width: 600px) {
            .content-section {
                padding: 1.5rem;
            }
        }

        .content-card {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin-bottom: 1px;
            border-left: 4px solid var(--primary-gold);
        }

        @media (min-width: 600px) {
            .content-card {
                border-radius: 16px;
                padding: 2rem;
                margin-bottom: 1.5rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--primary-gold);
            }
        }

        .content-card h2 {
            font-size: 1.35rem;
            font-weight: 700;
            margin-bottom: 1.25rem;
            color: var(--primary-gold);
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .content-card h2 .icon {
            font-size: 1.5rem;
        }

        .content-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 1.5rem 0 1rem 0;
            color: var(--accent-cyan);
        }

        .content-card p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
            font-size: 1rem;
            line-height: 1.8;
        }

        .content-card ul, .content-card ol {
            margin: 1rem 0;
            padding-left: 1.5rem;
            color: var(--text-secondary);
        }

        .content-card li {
            margin-bottom: 0.75rem;
            line-height: 1.7;
        }

        .highlight-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1.25rem 0;
        }

        .highlight-box.cyan {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(0, 240, 255, 0.05) 100%);
            border-color: rgba(0, 240, 255, 0.3);
        }

        .highlight-box.purple {
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.15) 0%, rgba(106, 91, 255, 0.05) 100%);
            border-color: rgba(106, 91, 255, 0.3);
        }

        .highlight-box.green {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .highlight-box.red {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%);
            border-color: rgba(239, 68, 68, 0.3);
        }

        .highlight-box p {
            margin: 0;
            color: var(--text-primary);
        }

        .image-placeholder {
            background: linear-gradient(145deg, #1a2235 0%, #0d1321 100%);
            border: 2px dashed rgba(255, 189, 89, 0.4);
            border-radius: 12px;
            padding: 1rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        .image-placeholder img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin-bottom: 0.75rem;
        }

        .image-placeholder p {
            font-size: 0.85rem;
            color: var(--primary-gold);
            margin: 0;
            font-style: italic;
        }

        .timing-comparison {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1px;
            background: var(--border-color);
            margin: 1.5rem 0;
        }

        @media (min-width: 600px) {
            .timing-comparison {
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                background: transparent;
            }
        }

        .timing-card {
            padding: 1.5rem;
        }

        .timing-card.early {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, var(--bg-card-hover) 100%);
            border-left: 4px solid var(--success-green);
        }

        .timing-card.late {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, var(--bg-card-hover) 100%);
            border-left: 4px solid var(--error-red);
        }

        @media (min-width: 600px) {
            .timing-card {
                border-radius: 12px;
            }
        }

        .timing-card h4 {
            font-size: 1.1rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }

        .timing-card.early h4 { color: var(--success-green); }
        .timing-card.late h4 { color: var(--error-red); }

        .timing-card ul {
            list-style: none;
            padding: 0;
        }

        .timing-card li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            font-size: 0.95rem;
            color: var(--text-secondary);
        }

        .timing-card.early li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--success-green);
        }

        .timing-card.late li::before {
            content: ''✗'';
            position: absolute;
            left: 0;
            color: var(--error-red);
        }

        .countdown-box {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            border: 2px solid var(--primary-gold);
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
            margin: 1.5rem 0;
        }

        .countdown-box h4 {
            color: var(--primary-gold);
            font-size: 1rem;
            margin-bottom: 1rem;
        }

        .countdown-numbers {
            display: flex;
            justify-content: center;
            gap: 1rem;
        }

        .countdown-item {
            background: var(--bg-card-hover);
            border-radius: 8px;
            padding: 0.75rem 1rem;
            min-width: 60px;
        }

        .countdown-item .number {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-cyan);
        }

        .countdown-item .label {
            font-size: 0.75rem;
            color: var(--text-secondary);
        }

        .advantage-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1px;
            background: var(--border-color);
            margin: 1.5rem 0;
        }

        @media (min-width: 600px) {
            .advantage-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                background: transparent;
            }
        }

        .advantage-item {
            background: var(--bg-card-hover);
            padding: 1.25rem;
            position: relative;
        }

        @media (min-width: 600px) {
            .advantage-item {
                border-radius: 12px;
                border: 1px solid var(--border-color);
            }
        }

        .advantage-item::before {
            content: '''';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: var(--primary-gold);
        }

        .advantage-item .number {
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-gold);
            margin-bottom: 0.5rem;
        }

        .advantage-item h4 {
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }

        .advantage-item p {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin: 0;
        }

        .price-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
        }

        .price-table th,
        .price-table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }

        .price-table th {
            background: var(--primary-navy);
            color: var(--primary-gold);
            font-weight: 600;
        }

        .price-table tr:nth-child(even) {
            background: rgba(255, 189, 89, 0.05);
        }

        .price-table .highlight-row {
            background: rgba(16, 185, 129, 0.2);
        }

        .price-table .old-price {
            text-decoration: line-through;
            color: var(--error-red);
        }

        .price-table .new-price {
            color: var(--success-green);
            font-weight: 700;
        }

        .urgency-banner {
            background: linear-gradient(135deg, var(--error-red) 0%, #DC2626 100%);
            color: white;
            padding: 1rem;
            text-align: center;
            border-radius: 0;
            margin: 1.5rem 0;
        }

        @media (min-width: 600px) {
            .urgency-banner {
                border-radius: 12px;
            }
        }

        .urgency-banner strong {
            display: block;
            font-size: 1.1rem;
            margin-bottom: 0.25rem;
        }

        .urgency-banner span {
            font-size: 0.9rem;
            opacity: 0.9;
        }

        .summary-box {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            border: 2px solid var(--primary-gold);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin: 0;
        }

        @media (min-width: 600px) {
            .summary-box {
                border-radius: 16px;
                padding: 2rem;
                margin: 1.5rem;
            }
        }

        .summary-box h3 {
            color: var(--primary-gold);
            font-size: 1.25rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding: 0;
        }

        .summary-box li {
            padding: 0.5rem 0;
            padding-left: 1.75rem;
            position: relative;
            color: var(--text-primary);
        }

        .summary-box li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-weight: 700;
        }

        .quiz-section {
            padding: 0;
        }

        @media (min-width: 600px) {
            .quiz-section {
                padding: 1.5rem;
            }
        }

        .quiz-container {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            border-left: 4px solid var(--accent-purple);
        }

        @media (min-width: 600px) {
            .quiz-container {
                border-radius: 16px;
                padding: 2rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--accent-purple);
            }
        }

        .quiz-container h2 {
            color: var(--accent-purple);
            font-size: 1.35rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .quiz-question {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1.25rem;
            border: 1px solid var(--border-color);
        }

        .quiz-question p {
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.875rem 1rem;
            margin-bottom: 0.5rem;
            background: var(--bg-card);
            border: 2px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
            font-size: 0.95rem;
        }

        .quiz-option:hover:not(:disabled) {
            border-color: var(--accent-purple);
            background: rgba(106, 91, 255, 0.1);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--success-green);
            color: var(--success-green);
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: var(--error-red);
            color: var(--error-red);
        }

        .quiz-result {
            padding: 0.75rem;
            border-radius: 8px;
            margin-top: 0.75rem;
            font-weight: 600;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success-green);
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.2);
            color: var(--error-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score h3 {
            color: var(--primary-gold);
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
        }

        .quiz-score p {
            color: var(--text-secondary);
        }

        .retake-btn {
            display: inline-block;
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--accent-purple) 0%, #5346E0 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .retake-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(106, 91, 255, 0.4);
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            background: var(--bg-card);
            border-top: 1px solid var(--border-color);
        }

        .lesson-footer p {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .lesson-footer .brand {
            color: var(--primary-gold);
            font-weight: 700;
        }

        @media (max-width: 600px) {
            .price-table {
                font-size: 0.85rem;
            }
            .price-table th,
            .price-table td {
                padding: 0.75rem 0.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <div class="header-badge">Module B - Bài 5/7</div>
            <h1>Lợi Thế Đi Sớm</h1>
            <p>Tại sao thời điểm quyết định lại quan trọng</p>
        </header>

        <section class="content-section">
            <div class="content-card">
                <h2><span class="icon">⏰</span> Quy Luật "Early Mover Advantage"</h2>

                <p>Trong mọi lĩnh vực, những người <strong>hành động sớm</strong> luôn có lợi thế hơn những người đến sau. Trading cũng vậy.</p>

                <div class="highlight-box">
                    <p><strong>💡 Sự thật:</strong> Những trader thành công nhất không phải là người thông minh nhất, mà là người HÀNH ĐỘNG đúng thời điểm.</p>
                </div>

                <div class="timing-comparison">
                    <div class="timing-card early">
                        <h4>🚀 Đi Sớm (Early Mover)</h4>
                        <ul>
                            <li>Được giá tốt nhất</li>
                            <li>Ít cạnh tranh hơn</li>
                            <li>Nhiều thời gian học và thực hành</li>
                            <li>Được hỗ trợ nhiều hơn</li>
                            <li>Tích lũy kinh nghiệm trước người khác</li>
                        </ul>
                    </div>
                    <div class="timing-card late">
                        <h4>🐢 Đi Muộn (Late Comer)</h4>
                        <ul>
                            <li>Giá cao hơn do lạm phát</li>
                            <li>Đông đảo, khó được chú ý</li>
                            <li>Phải chạy theo để bắt kịp</li>
                            <li>Support bị quá tải</li>
                            <li>Bỏ lỡ nhiều cơ hội thị trường</li>
                        </ul>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/112250/10B981?text=Early+vs+Late+Comparison" alt="Early vs Late Comparison">
                    <p>📸 So sánh Early Mover vs Late Comer</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">💎</span> 5 Lợi Thế Cụ Thể Khi Đi Sớm</h2>

                <p>Khi bạn quyết định upgrade ngay, đây là những gì bạn nhận được:</p>

                <div class="advantage-grid">
                    <div class="advantage-item">
                        <div class="number">01</div>
                        <h4>Giá Ưu Đãi Early Bird</h4>
                        <p>Giá khóa học tăng định kỳ. Đăng ký sớm = tiết kiệm 20-30%</p>
                    </div>
                    <div class="advantage-item">
                        <div class="number">02</div>
                        <h4>Bonus Độc Quyền</h4>
                        <p>Các bonus chỉ dành cho người đăng ký trong thời gian giới hạn</p>
                    </div>
                    <div class="advantage-item">
                        <div class="number">03</div>
                        <h4>Tích Lũy Kinh Nghiệm</h4>
                        <p>Mỗi ngày không học = 1 ngày tụt lại so với thị trường</p>
                    </div>
                    <div class="advantage-item">
                        <div class="number">04</div>
                        <h4>Priority Support</h4>
                        <p>Nhóm nhỏ = được mentor chú ý và hỗ trợ nhiều hơn</p>
                    </div>
                </div>

                <div class="highlight-box cyan">
                    <p><strong>📊 Ví dụ thực tế:</strong> Học viên đăng ký T1/2024 giờ đã có 6 tháng kinh nghiệm. Nếu bạn chờ thêm 6 tháng, bạn sẽ mãi mãi đi sau họ 6 tháng.</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📈</span> Lộ Trình Giá Tăng</h2>

                <p>GEM Trading Academy tăng giá định kỳ khi thêm tính năng mới và số lượng học viên tăng:</p>

                <table class="price-table">
                    <thead>
                        <tr>
                            <th>Thời điểm</th>
                            <th>TIER 2 Price</th>
                            <th>Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Q1 2024 (Launch)</td>
                            <td class="old-price">$199</td>
                            <td>Early Bird</td>
                        </tr>
                        <tr>
                            <td>Q2 2024</td>
                            <td class="old-price">$249</td>
                            <td>+Scanner feature</td>
                        </tr>
                        <tr class="highlight-row">
                            <td>Q3 2024 (Hiện tại)</td>
                            <td class="new-price">$299</td>
                            <td>Đăng ký ngay!</td>
                        </tr>
                        <tr>
                            <td>Q4 2024 (Dự kiến)</td>
                            <td>$349</td>
                            <td>+AI features</td>
                        </tr>
                        <tr>
                            <td>2025</td>
                            <td>$399+</td>
                            <td>Full platform</td>
                        </tr>
                    </tbody>
                </table>

                <div class="urgency-banner">
                    <strong>⚠️ Giá hiện tại chỉ còn trong tháng này!</strong>
                    <span>Sau ngày 30, giá sẽ tăng thêm 15-20%</span>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/0A0E17/FFBD59?text=Price+Timeline" alt="Price Timeline">
                    <p>📸 Lộ trình tăng giá theo thời gian</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🎁</span> Bonus Giới Hạn Cho Early Birds</h2>

                <p>Những bonus chỉ dành cho người đăng ký trong tháng này:</p>

                <ul>
                    <li><strong>1 tháng Premium Scanner miễn phí</strong> (giá trị $49)</li>
                    <li><strong>Ebook "24 Patterns Handbook"</strong> - PDF chi tiết 200 trang</li>
                    <li><strong>Access group Telegram VIP</strong> - Signal và thảo luận real-time</li>
                    <li><strong>1 buổi Q&A Live</strong> với mentor (chỉ 20 slot)</li>
                </ul>

                <div class="highlight-box green">
                    <p><strong>💰 Tổng giá trị bonus: $150+</strong><br>Tất cả đều MIỄN PHÍ khi đăng ký trong tháng này!</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/112250/00F0FF?text=Early+Bird+Bonuses" alt="Early Bird Bonuses">
                    <p>📸 Các bonus dành cho Early Birds</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">⚡</span> Chi Phí Của Việc Chờ Đợi</h2>

                <p>Nhiều người nghĩ "Tôi sẽ học sau". Nhưng họ không tính đến <strong>chi phí cơ hội</strong>:</p>

                <h3>Mỗi tháng chờ đợi, bạn mất:</h3>
                <ul>
                    <li><strong>Cơ hội trade:</strong> Trung bình 10-15 setup tốt/tháng</li>
                    <li><strong>Kinh nghiệm:</strong> 30 ngày thực hành với chart thật</li>
                    <li><strong>Tiền tiết kiệm:</strong> Giá khóa học tăng $50-100 mỗi quý</li>
                    <li><strong>Network:</strong> Những học viên khác đi trước và tạo group riêng</li>
                </ul>

                <div class="highlight-box red">
                    <p><strong>⚠️ Câu hỏi khó:</strong> Nếu bạn biết rằng 6 tháng tới giá tăng $100 và bạn bỏ lỡ hàng chục setup tốt, bạn có còn muốn chờ không?</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/EF4444/FFFFFF?text=Cost+of+Waiting" alt="Cost of Waiting">
                    <p>📸 Chi phí thực sự của việc chờ đợi</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🎯</span> Không Phải FOMO, Mà Là Logic</h2>

                <p>Đây không phải là tạo áp lực FOMO. Đây là những <strong>sự thật khách quan</strong>:</p>

                <ol>
                    <li>Giá khóa học tăng theo thời gian là THỰC</li>
                    <li>Bonus giới hạn thời gian là THỰC</li>
                    <li>Cơ hội thị trường bỏ lỡ là THỰC</li>
                    <li>Người đi trước có lợi thế là THỰC</li>
                </ol>

                <div class="highlight-box purple">
                    <p><strong>💡 Mindset đúng:</strong> Quyết định dựa trên LOGIC và KHẢ NĂNG của bạn, không phải áp lực hay cảm xúc. Nếu bạn chưa sẵn sàng, không sao. Nhưng nếu bạn sẵn sàng, đừng để sự do dự làm bạn mất lợi thế.</p>
                </div>
            </div>

            <div class="summary-box">
                <h3>📝 Tóm Tắt Bài Học</h3>
                <ul>
                    <li>Early Movers luôn có lợi thế: giá tốt, bonus nhiều, kinh nghiệm sớm</li>
                    <li>Giá khóa học tăng định kỳ - chờ đợi = trả giá cao hơn</li>
                    <li>Chi phí chờ đợi không chỉ là tiền, còn là cơ hội bị bỏ lỡ</li>
                    <li>Quyết định bằng logic, không phải cảm xúc</li>
                    <li>Nếu sẵn sàng về tài chính và thời gian, hãy hành động</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-container">
                <h2><span class="icon">❓</span> Kiểm Tra Kiến Thức</h2>

                <div class="quiz-question" data-correct="1">
                    <p>1. "Chi phí cơ hội" của việc chờ đợi bao gồm gì?</p>
                    <button class="quiz-option" data-index="0">A. Chỉ là tiền khóa học tăng</button>
                    <button class="quiz-option" data-index="1">B. Tiền, cơ hội trade, kinh nghiệm, và network</button>
                    <button class="quiz-option" data-index="2">C. Không có chi phí gì</button>
                    <button class="quiz-option" data-index="3">D. Chỉ là thời gian</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <p>2. Tại sao Early Bird thường có lợi thế hơn?</p>
                    <button class="quiz-option" data-index="0">A. Vì họ thông minh hơn</button>
                    <button class="quiz-option" data-index="1">B. Vì họ có nhiều tiền hơn</button>
                    <button class="quiz-option" data-index="2">C. Vì họ hành động sớm, được giá tốt và tích lũy kinh nghiệm trước</button>
                    <button class="quiz-option" data-index="3">D. Vì họ được ưu tiên đặc biệt</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <p>3. Khi nào KHÔNG nên đăng ký ngay?</p>
                    <button class="quiz-option" data-index="0">A. Khi chưa có khả năng tài chính hoặc thời gian cam kết</button>
                    <button class="quiz-option" data-index="1">B. Khi giá đang khuyến mãi</button>
                    <button class="quiz-option" data-index="2">C. Khi có bonus đi kèm</button>
                    <button class="quiz-option" data-index="3">D. Khi thị trường đang tốt</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🎉 Hoàn thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>Bài học thuộc <span class="brand">GEM Trading Academy</span></p>
            <p>© 2024 - Nền tảng đào tạo trading chuyên nghiệp</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 3;
        let answeredCount = 0;
        let correctCount = 0;

        document.querySelectorAll(''.quiz-question'').forEach(question => {
            const correctIndex = parseInt(question.dataset.correct);
            const options = question.querySelectorAll(''.quiz-option'');
            const result = question.querySelector(''.quiz-result'');

            options.forEach(option => {
                option.addEventListener(''click'', function() {
                    if (question.classList.contains(''answered'')) return;

                    question.classList.add(''answered'');
                    answeredCount++;

                    const selectedIndex = parseInt(this.dataset.index);

                    if (selectedIndex === correctIndex) {
                        this.classList.add(''correct'');
                        result.textContent = ''✓ Chính xác! Bạn hiểu rõ về lợi thế đi sớm.'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng. Xem lại đáp án đúng được highlight.'';
                        result.className = ''quiz-result show incorrect'';
                    }

                    if (answeredCount === totalQuestions) {
                        document.getElementById(''correct-count'').textContent = correctCount;
                        document.querySelector(''.quiz-score'').classList.add(''show'');
                    }
                });
            });
        });
    </script>
</body>
</html>
',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 10.5: Lợi Thế Đi Sớm - GEM Trading Academy</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-navy: #112250;
            --primary-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --error-red: #EF4444;
            --bg-dark: #0A0E17;
            --bg-card: #1A1F2E;
            --bg-card-hover: #252B3D;
            --text-primary: #FFFFFF;
            --text-secondary: #A0A9C0;
            --border-color: rgba(255, 189, 89, 0.2);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.7;
            font-size: 16px;
            padding: 0;
            overflow-x: hidden;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--bg-dark);
        }

        @media (min-width: 600px) {
            body {
                padding: 2rem;
                background: linear-gradient(135deg, #0A0E17 0%, #112250 100%);
            }
            .lesson-container {
                background: var(--bg-card);
                border-radius: 20px;
                border: 1px solid var(--border-color);
                overflow: hidden;
            }
        }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem 1rem;
            text-align: center;
            border-bottom: 3px solid var(--primary-gold);
            position: relative;
            overflow: hidden;
        }

        .lesson-header::before {
            content: '''';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,189,89,0.1) 0%, transparent 50%);
            animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--primary-gold) 0%, #FFD700 100%);
            color: var(--primary-navy);
            padding: 0.5rem 1.25rem;
            border-radius: 25px;
            font-size: 0.85rem;
            font-weight: 700;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .lesson-header h1 {
            font-size: clamp(1.5rem, 5vw, 2rem);
            font-weight: 700;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        .lesson-header p {
            color: var(--text-secondary);
            font-size: 1rem;
            position: relative;
            z-index: 1;
        }

        .content-section {
            padding: 0;
        }

        @media (min-width: 600px) {
            .content-section {
                padding: 1.5rem;
            }
        }

        .content-card {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin-bottom: 1px;
            border-left: 4px solid var(--primary-gold);
        }

        @media (min-width: 600px) {
            .content-card {
                border-radius: 16px;
                padding: 2rem;
                margin-bottom: 1.5rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--primary-gold);
            }
        }

        .content-card h2 {
            font-size: 1.35rem;
            font-weight: 700;
            margin-bottom: 1.25rem;
            color: var(--primary-gold);
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .content-card h2 .icon {
            font-size: 1.5rem;
        }

        .content-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 1.5rem 0 1rem 0;
            color: var(--accent-cyan);
        }

        .content-card p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
            font-size: 1rem;
            line-height: 1.8;
        }

        .content-card ul, .content-card ol {
            margin: 1rem 0;
            padding-left: 1.5rem;
            color: var(--text-secondary);
        }

        .content-card li {
            margin-bottom: 0.75rem;
            line-height: 1.7;
        }

        .highlight-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1.25rem 0;
        }

        .highlight-box.cyan {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(0, 240, 255, 0.05) 100%);
            border-color: rgba(0, 240, 255, 0.3);
        }

        .highlight-box.purple {
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.15) 0%, rgba(106, 91, 255, 0.05) 100%);
            border-color: rgba(106, 91, 255, 0.3);
        }

        .highlight-box.green {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .highlight-box.red {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%);
            border-color: rgba(239, 68, 68, 0.3);
        }

        .highlight-box p {
            margin: 0;
            color: var(--text-primary);
        }

        .image-placeholder {
            background: linear-gradient(145deg, #1a2235 0%, #0d1321 100%);
            border: 2px dashed rgba(255, 189, 89, 0.4);
            border-radius: 12px;
            padding: 1rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        .image-placeholder img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin-bottom: 0.75rem;
        }

        .image-placeholder p {
            font-size: 0.85rem;
            color: var(--primary-gold);
            margin: 0;
            font-style: italic;
        }

        .timing-comparison {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1px;
            background: var(--border-color);
            margin: 1.5rem 0;
        }

        @media (min-width: 600px) {
            .timing-comparison {
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                background: transparent;
            }
        }

        .timing-card {
            padding: 1.5rem;
        }

        .timing-card.early {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, var(--bg-card-hover) 100%);
            border-left: 4px solid var(--success-green);
        }

        .timing-card.late {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, var(--bg-card-hover) 100%);
            border-left: 4px solid var(--error-red);
        }

        @media (min-width: 600px) {
            .timing-card {
                border-radius: 12px;
            }
        }

        .timing-card h4 {
            font-size: 1.1rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }

        .timing-card.early h4 { color: var(--success-green); }
        .timing-card.late h4 { color: var(--error-red); }

        .timing-card ul {
            list-style: none;
            padding: 0;
        }

        .timing-card li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            font-size: 0.95rem;
            color: var(--text-secondary);
        }

        .timing-card.early li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--success-green);
        }

        .timing-card.late li::before {
            content: ''✗'';
            position: absolute;
            left: 0;
            color: var(--error-red);
        }

        .countdown-box {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            border: 2px solid var(--primary-gold);
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
            margin: 1.5rem 0;
        }

        .countdown-box h4 {
            color: var(--primary-gold);
            font-size: 1rem;
            margin-bottom: 1rem;
        }

        .countdown-numbers {
            display: flex;
            justify-content: center;
            gap: 1rem;
        }

        .countdown-item {
            background: var(--bg-card-hover);
            border-radius: 8px;
            padding: 0.75rem 1rem;
            min-width: 60px;
        }

        .countdown-item .number {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-cyan);
        }

        .countdown-item .label {
            font-size: 0.75rem;
            color: var(--text-secondary);
        }

        .advantage-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1px;
            background: var(--border-color);
            margin: 1.5rem 0;
        }

        @media (min-width: 600px) {
            .advantage-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                background: transparent;
            }
        }

        .advantage-item {
            background: var(--bg-card-hover);
            padding: 1.25rem;
            position: relative;
        }

        @media (min-width: 600px) {
            .advantage-item {
                border-radius: 12px;
                border: 1px solid var(--border-color);
            }
        }

        .advantage-item::before {
            content: '''';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: var(--primary-gold);
        }

        .advantage-item .number {
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-gold);
            margin-bottom: 0.5rem;
        }

        .advantage-item h4 {
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }

        .advantage-item p {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin: 0;
        }

        .price-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
        }

        .price-table th,
        .price-table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }

        .price-table th {
            background: var(--primary-navy);
            color: var(--primary-gold);
            font-weight: 600;
        }

        .price-table tr:nth-child(even) {
            background: rgba(255, 189, 89, 0.05);
        }

        .price-table .highlight-row {
            background: rgba(16, 185, 129, 0.2);
        }

        .price-table .old-price {
            text-decoration: line-through;
            color: var(--error-red);
        }

        .price-table .new-price {
            color: var(--success-green);
            font-weight: 700;
        }

        .urgency-banner {
            background: linear-gradient(135deg, var(--error-red) 0%, #DC2626 100%);
            color: white;
            padding: 1rem;
            text-align: center;
            border-radius: 0;
            margin: 1.5rem 0;
        }

        @media (min-width: 600px) {
            .urgency-banner {
                border-radius: 12px;
            }
        }

        .urgency-banner strong {
            display: block;
            font-size: 1.1rem;
            margin-bottom: 0.25rem;
        }

        .urgency-banner span {
            font-size: 0.9rem;
            opacity: 0.9;
        }

        .summary-box {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            border: 2px solid var(--primary-gold);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin: 0;
        }

        @media (min-width: 600px) {
            .summary-box {
                border-radius: 16px;
                padding: 2rem;
                margin: 1.5rem;
            }
        }

        .summary-box h3 {
            color: var(--primary-gold);
            font-size: 1.25rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding: 0;
        }

        .summary-box li {
            padding: 0.5rem 0;
            padding-left: 1.75rem;
            position: relative;
            color: var(--text-primary);
        }

        .summary-box li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-weight: 700;
        }

        .quiz-section {
            padding: 0;
        }

        @media (min-width: 600px) {
            .quiz-section {
                padding: 1.5rem;
            }
        }

        .quiz-container {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            border-left: 4px solid var(--accent-purple);
        }

        @media (min-width: 600px) {
            .quiz-container {
                border-radius: 16px;
                padding: 2rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--accent-purple);
            }
        }

        .quiz-container h2 {
            color: var(--accent-purple);
            font-size: 1.35rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .quiz-question {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1.25rem;
            border: 1px solid var(--border-color);
        }

        .quiz-question p {
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.875rem 1rem;
            margin-bottom: 0.5rem;
            background: var(--bg-card);
            border: 2px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
            font-size: 0.95rem;
        }

        .quiz-option:hover:not(:disabled) {
            border-color: var(--accent-purple);
            background: rgba(106, 91, 255, 0.1);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--success-green);
            color: var(--success-green);
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: var(--error-red);
            color: var(--error-red);
        }

        .quiz-result {
            padding: 0.75rem;
            border-radius: 8px;
            margin-top: 0.75rem;
            font-weight: 600;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success-green);
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.2);
            color: var(--error-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score h3 {
            color: var(--primary-gold);
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
        }

        .quiz-score p {
            color: var(--text-secondary);
        }

        .retake-btn {
            display: inline-block;
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--accent-purple) 0%, #5346E0 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .retake-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(106, 91, 255, 0.4);
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            background: var(--bg-card);
            border-top: 1px solid var(--border-color);
        }

        .lesson-footer p {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .lesson-footer .brand {
            color: var(--primary-gold);
            font-weight: 700;
        }

        @media (max-width: 600px) {
            .price-table {
                font-size: 0.85rem;
            }
            .price-table th,
            .price-table td {
                padding: 0.75rem 0.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <div class="header-badge">Module B - Bài 5/7</div>
            <h1>Lợi Thế Đi Sớm</h1>
            <p>Tại sao thời điểm quyết định lại quan trọng</p>
        </header>

        <section class="content-section">
            <div class="content-card">
                <h2><span class="icon">⏰</span> Quy Luật "Early Mover Advantage"</h2>

                <p>Trong mọi lĩnh vực, những người <strong>hành động sớm</strong> luôn có lợi thế hơn những người đến sau. Trading cũng vậy.</p>

                <div class="highlight-box">
                    <p><strong>💡 Sự thật:</strong> Những trader thành công nhất không phải là người thông minh nhất, mà là người HÀNH ĐỘNG đúng thời điểm.</p>
                </div>

                <div class="timing-comparison">
                    <div class="timing-card early">
                        <h4>🚀 Đi Sớm (Early Mover)</h4>
                        <ul>
                            <li>Được giá tốt nhất</li>
                            <li>Ít cạnh tranh hơn</li>
                            <li>Nhiều thời gian học và thực hành</li>
                            <li>Được hỗ trợ nhiều hơn</li>
                            <li>Tích lũy kinh nghiệm trước người khác</li>
                        </ul>
                    </div>
                    <div class="timing-card late">
                        <h4>🐢 Đi Muộn (Late Comer)</h4>
                        <ul>
                            <li>Giá cao hơn do lạm phát</li>
                            <li>Đông đảo, khó được chú ý</li>
                            <li>Phải chạy theo để bắt kịp</li>
                            <li>Support bị quá tải</li>
                            <li>Bỏ lỡ nhiều cơ hội thị trường</li>
                        </ul>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/112250/10B981?text=Early+vs+Late+Comparison" alt="Early vs Late Comparison">
                    <p>📸 So sánh Early Mover vs Late Comer</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">💎</span> 5 Lợi Thế Cụ Thể Khi Đi Sớm</h2>

                <p>Khi bạn quyết định upgrade ngay, đây là những gì bạn nhận được:</p>

                <div class="advantage-grid">
                    <div class="advantage-item">
                        <div class="number">01</div>
                        <h4>Giá Ưu Đãi Early Bird</h4>
                        <p>Giá khóa học tăng định kỳ. Đăng ký sớm = tiết kiệm 20-30%</p>
                    </div>
                    <div class="advantage-item">
                        <div class="number">02</div>
                        <h4>Bonus Độc Quyền</h4>
                        <p>Các bonus chỉ dành cho người đăng ký trong thời gian giới hạn</p>
                    </div>
                    <div class="advantage-item">
                        <div class="number">03</div>
                        <h4>Tích Lũy Kinh Nghiệm</h4>
                        <p>Mỗi ngày không học = 1 ngày tụt lại so với thị trường</p>
                    </div>
                    <div class="advantage-item">
                        <div class="number">04</div>
                        <h4>Priority Support</h4>
                        <p>Nhóm nhỏ = được mentor chú ý và hỗ trợ nhiều hơn</p>
                    </div>
                </div>

                <div class="highlight-box cyan">
                    <p><strong>📊 Ví dụ thực tế:</strong> Học viên đăng ký T1/2024 giờ đã có 6 tháng kinh nghiệm. Nếu bạn chờ thêm 6 tháng, bạn sẽ mãi mãi đi sau họ 6 tháng.</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📈</span> Lộ Trình Giá Tăng</h2>

                <p>GEM Trading Academy tăng giá định kỳ khi thêm tính năng mới và số lượng học viên tăng:</p>

                <table class="price-table">
                    <thead>
                        <tr>
                            <th>Thời điểm</th>
                            <th>TIER 2 Price</th>
                            <th>Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Q1 2024 (Launch)</td>
                            <td class="old-price">$199</td>
                            <td>Early Bird</td>
                        </tr>
                        <tr>
                            <td>Q2 2024</td>
                            <td class="old-price">$249</td>
                            <td>+Scanner feature</td>
                        </tr>
                        <tr class="highlight-row">
                            <td>Q3 2024 (Hiện tại)</td>
                            <td class="new-price">$299</td>
                            <td>Đăng ký ngay!</td>
                        </tr>
                        <tr>
                            <td>Q4 2024 (Dự kiến)</td>
                            <td>$349</td>
                            <td>+AI features</td>
                        </tr>
                        <tr>
                            <td>2025</td>
                            <td>$399+</td>
                            <td>Full platform</td>
                        </tr>
                    </tbody>
                </table>

                <div class="urgency-banner">
                    <strong>⚠️ Giá hiện tại chỉ còn trong tháng này!</strong>
                    <span>Sau ngày 30, giá sẽ tăng thêm 15-20%</span>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/0A0E17/FFBD59?text=Price+Timeline" alt="Price Timeline">
                    <p>📸 Lộ trình tăng giá theo thời gian</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🎁</span> Bonus Giới Hạn Cho Early Birds</h2>

                <p>Những bonus chỉ dành cho người đăng ký trong tháng này:</p>

                <ul>
                    <li><strong>1 tháng Premium Scanner miễn phí</strong> (giá trị $49)</li>
                    <li><strong>Ebook "24 Patterns Handbook"</strong> - PDF chi tiết 200 trang</li>
                    <li><strong>Access group Telegram VIP</strong> - Signal và thảo luận real-time</li>
                    <li><strong>1 buổi Q&A Live</strong> với mentor (chỉ 20 slot)</li>
                </ul>

                <div class="highlight-box green">
                    <p><strong>💰 Tổng giá trị bonus: $150+</strong><br>Tất cả đều MIỄN PHÍ khi đăng ký trong tháng này!</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/112250/00F0FF?text=Early+Bird+Bonuses" alt="Early Bird Bonuses">
                    <p>📸 Các bonus dành cho Early Birds</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">⚡</span> Chi Phí Của Việc Chờ Đợi</h2>

                <p>Nhiều người nghĩ "Tôi sẽ học sau". Nhưng họ không tính đến <strong>chi phí cơ hội</strong>:</p>

                <h3>Mỗi tháng chờ đợi, bạn mất:</h3>
                <ul>
                    <li><strong>Cơ hội trade:</strong> Trung bình 10-15 setup tốt/tháng</li>
                    <li><strong>Kinh nghiệm:</strong> 30 ngày thực hành với chart thật</li>
                    <li><strong>Tiền tiết kiệm:</strong> Giá khóa học tăng $50-100 mỗi quý</li>
                    <li><strong>Network:</strong> Những học viên khác đi trước và tạo group riêng</li>
                </ul>

                <div class="highlight-box red">
                    <p><strong>⚠️ Câu hỏi khó:</strong> Nếu bạn biết rằng 6 tháng tới giá tăng $100 và bạn bỏ lỡ hàng chục setup tốt, bạn có còn muốn chờ không?</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/EF4444/FFFFFF?text=Cost+of+Waiting" alt="Cost of Waiting">
                    <p>📸 Chi phí thực sự của việc chờ đợi</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🎯</span> Không Phải FOMO, Mà Là Logic</h2>

                <p>Đây không phải là tạo áp lực FOMO. Đây là những <strong>sự thật khách quan</strong>:</p>

                <ol>
                    <li>Giá khóa học tăng theo thời gian là THỰC</li>
                    <li>Bonus giới hạn thời gian là THỰC</li>
                    <li>Cơ hội thị trường bỏ lỡ là THỰC</li>
                    <li>Người đi trước có lợi thế là THỰC</li>
                </ol>

                <div class="highlight-box purple">
                    <p><strong>💡 Mindset đúng:</strong> Quyết định dựa trên LOGIC và KHẢ NĂNG của bạn, không phải áp lực hay cảm xúc. Nếu bạn chưa sẵn sàng, không sao. Nhưng nếu bạn sẵn sàng, đừng để sự do dự làm bạn mất lợi thế.</p>
                </div>
            </div>

            <div class="summary-box">
                <h3>📝 Tóm Tắt Bài Học</h3>
                <ul>
                    <li>Early Movers luôn có lợi thế: giá tốt, bonus nhiều, kinh nghiệm sớm</li>
                    <li>Giá khóa học tăng định kỳ - chờ đợi = trả giá cao hơn</li>
                    <li>Chi phí chờ đợi không chỉ là tiền, còn là cơ hội bị bỏ lỡ</li>
                    <li>Quyết định bằng logic, không phải cảm xúc</li>
                    <li>Nếu sẵn sàng về tài chính và thời gian, hãy hành động</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-container">
                <h2><span class="icon">❓</span> Kiểm Tra Kiến Thức</h2>

                <div class="quiz-question" data-correct="1">
                    <p>1. "Chi phí cơ hội" của việc chờ đợi bao gồm gì?</p>
                    <button class="quiz-option" data-index="0">A. Chỉ là tiền khóa học tăng</button>
                    <button class="quiz-option" data-index="1">B. Tiền, cơ hội trade, kinh nghiệm, và network</button>
                    <button class="quiz-option" data-index="2">C. Không có chi phí gì</button>
                    <button class="quiz-option" data-index="3">D. Chỉ là thời gian</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <p>2. Tại sao Early Bird thường có lợi thế hơn?</p>
                    <button class="quiz-option" data-index="0">A. Vì họ thông minh hơn</button>
                    <button class="quiz-option" data-index="1">B. Vì họ có nhiều tiền hơn</button>
                    <button class="quiz-option" data-index="2">C. Vì họ hành động sớm, được giá tốt và tích lũy kinh nghiệm trước</button>
                    <button class="quiz-option" data-index="3">D. Vì họ được ưu tiên đặc biệt</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <p>3. Khi nào KHÔNG nên đăng ký ngay?</p>
                    <button class="quiz-option" data-index="0">A. Khi chưa có khả năng tài chính hoặc thời gian cam kết</button>
                    <button class="quiz-option" data-index="1">B. Khi giá đang khuyến mãi</button>
                    <button class="quiz-option" data-index="2">C. Khi có bonus đi kèm</button>
                    <button class="quiz-option" data-index="3">D. Khi thị trường đang tốt</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🎉 Hoàn thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>Bài học thuộc <span class="brand">GEM Trading Academy</span></p>
            <p>© 2024 - Nền tảng đào tạo trading chuyên nghiệp</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 3;
        let answeredCount = 0;
        let correctCount = 0;

        document.querySelectorAll(''.quiz-question'').forEach(question => {
            const correctIndex = parseInt(question.dataset.correct);
            const options = question.querySelectorAll(''.quiz-option'');
            const result = question.querySelector(''.quiz-result'');

            options.forEach(option => {
                option.addEventListener(''click'', function() {
                    if (question.classList.contains(''answered'')) return;

                    question.classList.add(''answered'');
                    answeredCount++;

                    const selectedIndex = parseInt(this.dataset.index);

                    if (selectedIndex === correctIndex) {
                        this.classList.add(''correct'');
                        result.textContent = ''✓ Chính xác! Bạn hiểu rõ về lợi thế đi sớm.'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng. Xem lại đáp án đúng được highlight.'';
                        result.className = ''quiz-result show incorrect'';
                    }

                    if (answeredCount === totalQuestions) {
                        document.getElementById(''correct-count'').textContent = correctCount;
                        document.querySelector(''.quiz-score'').classList.add(''show'');
                    }
                });
            });
        });
    </script>
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

-- Lesson 10.6: Khung Quyết Định - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch10-l6',
  'module-tier-1-ch10',
  'course-tier1-trading-foundation',
  'Bài 10.6: Khung Quyết Định - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 10.6: Khung Quyết Định - GEM Trading Academy</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-navy: #112250;
            --primary-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --error-red: #EF4444;
            --bg-dark: #0A0E17;
            --bg-card: #1A1F2E;
            --bg-card-hover: #252B3D;
            --text-primary: #FFFFFF;
            --text-secondary: #A0A9C0;
            --border-color: rgba(255, 189, 89, 0.2);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.7;
            font-size: 16px;
            padding: 0;
            overflow-x: hidden;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--bg-dark);
        }

        @media (min-width: 600px) {
            body {
                padding: 2rem;
                background: linear-gradient(135deg, #0A0E17 0%, #112250 100%);
            }
            .lesson-container {
                background: var(--bg-card);
                border-radius: 20px;
                border: 1px solid var(--border-color);
                overflow: hidden;
            }
        }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem 1rem;
            text-align: center;
            border-bottom: 3px solid var(--primary-gold);
            position: relative;
            overflow: hidden;
        }

        .lesson-header::before {
            content: '''';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,189,89,0.1) 0%, transparent 50%);
            animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--primary-gold) 0%, #FFD700 100%);
            color: var(--primary-navy);
            padding: 0.5rem 1.25rem;
            border-radius: 25px;
            font-size: 0.85rem;
            font-weight: 700;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .lesson-header h1 {
            font-size: clamp(1.5rem, 5vw, 2rem);
            font-weight: 700;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        .lesson-header p {
            color: var(--text-secondary);
            font-size: 1rem;
            position: relative;
            z-index: 1;
        }

        .content-section {
            padding: 0;
        }

        @media (min-width: 600px) {
            .content-section {
                padding: 1.5rem;
            }
        }

        .content-card {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin-bottom: 1px;
            border-left: 4px solid var(--primary-gold);
        }

        @media (min-width: 600px) {
            .content-card {
                border-radius: 16px;
                padding: 2rem;
                margin-bottom: 1.5rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--primary-gold);
            }
        }

        .content-card h2 {
            font-size: 1.35rem;
            font-weight: 700;
            margin-bottom: 1.25rem;
            color: var(--primary-gold);
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .content-card h2 .icon {
            font-size: 1.5rem;
        }

        .content-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 1.5rem 0 1rem 0;
            color: var(--accent-cyan);
        }

        .content-card p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
            font-size: 1rem;
            line-height: 1.8;
        }

        .content-card ul, .content-card ol {
            margin: 1rem 0;
            padding-left: 1.5rem;
            color: var(--text-secondary);
        }

        .content-card li {
            margin-bottom: 0.75rem;
            line-height: 1.7;
        }

        .highlight-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1.25rem 0;
        }

        .highlight-box.cyan {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(0, 240, 255, 0.05) 100%);
            border-color: rgba(0, 240, 255, 0.3);
        }

        .highlight-box.purple {
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.15) 0%, rgba(106, 91, 255, 0.05) 100%);
            border-color: rgba(106, 91, 255, 0.3);
        }

        .highlight-box.green {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .highlight-box p {
            margin: 0;
            color: var(--text-primary);
        }

        .image-placeholder {
            background: linear-gradient(145deg, #1a2235 0%, #0d1321 100%);
            border: 2px dashed rgba(255, 189, 89, 0.4);
            border-radius: 12px;
            padding: 1rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        .image-placeholder img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin-bottom: 0.75rem;
        }

        .image-placeholder p {
            font-size: 0.85rem;
            color: var(--primary-gold);
            margin: 0;
            font-style: italic;
        }

        .checklist-section {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        .checklist-section h4 {
            color: var(--primary-gold);
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }

        .checklist-item {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--border-color);
        }

        .checklist-item:last-child {
            border-bottom: none;
        }

        .checklist-checkbox {
            width: 24px;
            height: 24px;
            border: 2px solid var(--primary-gold);
            border-radius: 4px;
            flex-shrink: 0;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .checklist-checkbox.checked {
            background: var(--success-green);
            border-color: var(--success-green);
        }

        .checklist-checkbox.checked::after {
            content: ''✓'';
            color: white;
            font-weight: 700;
            font-size: 0.9rem;
        }

        .checklist-text {
            color: var(--text-secondary);
            font-size: 0.95rem;
        }

        .decision-flowchart {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        .flow-step {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            padding: 1rem 0;
            position: relative;
        }

        .flow-step:not(:last-child)::after {
            content: '''';
            position: absolute;
            left: 1rem;
            top: 3.5rem;
            height: calc(100% - 2rem);
            width: 2px;
            background: var(--border-color);
        }

        .flow-icon {
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            background: var(--primary-gold);
            color: var(--primary-navy);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            flex-shrink: 0;
        }

        .flow-content h4 {
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .flow-content p {
            color: var(--text-secondary);
            font-size: 0.9rem;
            margin: 0;
        }

        .scenario-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1px;
            background: var(--border-color);
            margin: 1.5rem 0;
        }

        @media (min-width: 600px) {
            .scenario-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                background: transparent;
            }
        }

        .scenario-card {
            padding: 1.5rem;
        }

        .scenario-card.yes {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, var(--bg-card-hover) 100%);
            border-left: 4px solid var(--success-green);
        }

        .scenario-card.no {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, var(--bg-card-hover) 100%);
            border-left: 4px solid var(--error-red);
        }

        @media (min-width: 600px) {
            .scenario-card {
                border-radius: 12px;
            }
        }

        .scenario-card h4 {
            font-size: 1.1rem;
            margin-bottom: 1rem;
        }

        .scenario-card.yes h4 { color: var(--success-green); }
        .scenario-card.no h4 { color: var(--error-red); }

        .scenario-card ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .scenario-card li {
            padding: 0.4rem 0;
            font-size: 0.9rem;
            color: var(--text-secondary);
        }

        .action-button {
            display: block;
            width: 100%;
            padding: 1rem;
            margin-top: 1rem;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
            border: none;
        }

        .action-button.primary {
            background: linear-gradient(135deg, var(--primary-gold) 0%, #FFD700 100%);
            color: var(--primary-navy);
        }

        .action-button.secondary {
            background: transparent;
            border: 2px solid var(--text-secondary);
            color: var(--text-secondary);
        }

        .self-assessment {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            border: 2px solid var(--primary-gold);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        .self-assessment h4 {
            color: var(--primary-gold);
            margin-bottom: 1rem;
        }

        .assessment-question {
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--border-color);
        }

        .assessment-question:last-child {
            border-bottom: none;
        }

        .assessment-question p {
            color: var(--text-primary);
            margin-bottom: 0.5rem;
            font-weight: 500;
        }

        .assessment-options {
            display: flex;
            gap: 0.5rem;
        }

        .assessment-option {
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            background: transparent;
        }

        .assessment-option:hover {
            border-color: var(--primary-gold);
            color: var(--primary-gold);
        }

        .assessment-option.selected.yes {
            background: var(--success-green);
            border-color: var(--success-green);
            color: white;
        }

        .assessment-option.selected.no {
            background: var(--error-red);
            border-color: var(--error-red);
            color: white;
        }

        .summary-box {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            border: 2px solid var(--primary-gold);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin: 0;
        }

        @media (min-width: 600px) {
            .summary-box {
                border-radius: 16px;
                padding: 2rem;
                margin: 1.5rem;
            }
        }

        .summary-box h3 {
            color: var(--primary-gold);
            font-size: 1.25rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding: 0;
        }

        .summary-box li {
            padding: 0.5rem 0;
            padding-left: 1.75rem;
            position: relative;
            color: var(--text-primary);
        }

        .summary-box li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-weight: 700;
        }

        .quiz-section {
            padding: 0;
        }

        @media (min-width: 600px) {
            .quiz-section {
                padding: 1.5rem;
            }
        }

        .quiz-container {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            border-left: 4px solid var(--accent-purple);
        }

        @media (min-width: 600px) {
            .quiz-container {
                border-radius: 16px;
                padding: 2rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--accent-purple);
            }
        }

        .quiz-container h2 {
            color: var(--accent-purple);
            font-size: 1.35rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .quiz-question {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1.25rem;
            border: 1px solid var(--border-color);
        }

        .quiz-question p {
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.875rem 1rem;
            margin-bottom: 0.5rem;
            background: var(--bg-card);
            border: 2px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
            font-size: 0.95rem;
        }

        .quiz-option:hover:not(:disabled) {
            border-color: var(--accent-purple);
            background: rgba(106, 91, 255, 0.1);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--success-green);
            color: var(--success-green);
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: var(--error-red);
            color: var(--error-red);
        }

        .quiz-result {
            padding: 0.75rem;
            border-radius: 8px;
            margin-top: 0.75rem;
            font-weight: 600;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success-green);
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.2);
            color: var(--error-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score h3 {
            color: var(--primary-gold);
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
        }

        .quiz-score p {
            color: var(--text-secondary);
        }

        .retake-btn {
            display: inline-block;
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--accent-purple) 0%, #5346E0 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .retake-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(106, 91, 255, 0.4);
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            background: var(--bg-card);
            border-top: 1px solid var(--border-color);
        }

        .lesson-footer p {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .lesson-footer .brand {
            color: var(--primary-gold);
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <div class="header-badge">Module B - Bài 6/7</div>
            <h1>Khung Quyết Định</h1>
            <p>Framework giúp bạn đưa ra quyết định đúng đắn</p>
        </header>

        <section class="content-section">
            <div class="content-card">
                <h2><span class="icon">🎯</span> Quyết Định Dựa Trên Logic</h2>

                <p>Một quyết định tốt không dựa trên cảm xúc hay áp lực, mà dựa trên <strong>sự đánh giá khách quan</strong> về tình huống của bạn.</p>

                <div class="highlight-box">
                    <p><strong>💡 Nguyên tắc:</strong> Trước khi quyết định bất cứ điều gì (upgrade, đầu tư, thay đổi công việc...), hãy sử dụng một framework logic để đánh giá.</p>
                </div>

                <p>Trong bài này, chúng ta sẽ xây dựng <strong>Khung Quyết Định</strong> để giúp bạn tự đánh giá xem mình nên:</p>
                <ul>
                    <li>Tiếp tục học miễn phí với TIER 1</li>
                    <li>Upgrade lên TIER 2 để đi sâu hơn</li>
                    <li>Trở thành Đối Tác để kiếm thêm thu nhập</li>
                </ul>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/112250/FFBD59?text=Decision+Framework" alt="Decision Framework">
                    <p>📸 Khung quyết định logic</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📋</span> Bước 1: Tự Đánh Giá Bản Thân</h2>

                <p>Trả lời trung thực các câu hỏi sau:</p>

                <div class="self-assessment">
                    <h4>📝 Checklist Tự Đánh Giá</h4>

                    <div class="assessment-question">
                        <p>1. Tôi có đủ thời gian cam kết (tối thiểu 5-10 giờ/tuần)?</p>
                        <div class="assessment-options">
                            <button class="assessment-option" data-answer="yes">Có ✓</button>
                            <button class="assessment-option" data-answer="no">Chưa ✗</button>
                        </div>
                    </div>

                    <div class="assessment-question">
                        <p>2. Tôi có ngân sách cho việc học (không ảnh hưởng chi tiêu thiết yếu)?</p>
                        <div class="assessment-options">
                            <button class="assessment-option" data-answer="yes">Có ✓</button>
                            <button class="assessment-option" data-answer="no">Chưa ✗</button>
                        </div>
                    </div>

                    <div class="assessment-question">
                        <p>3. Tôi đã hoàn thành TIER 1 và hiểu các pattern cơ bản?</p>
                        <div class="assessment-options">
                            <button class="assessment-option" data-answer="yes">Có ✓</button>
                            <button class="assessment-option" data-answer="no">Chưa ✗</button>
                        </div>
                    </div>

                    <div class="assessment-question">
                        <p>4. Tôi nghiêm túc muốn trading trở thành nguồn thu nhập?</p>
                        <div class="assessment-options">
                            <button class="assessment-option" data-answer="yes">Có ✓</button>
                            <button class="assessment-option" data-answer="no">Chưa ✗</button>
                        </div>
                    </div>

                    <div class="assessment-question">
                        <p>5. Tôi sẵn sàng học và thực hành kiên trì trong 3-6 tháng?</p>
                        <div class="assessment-options">
                            <button class="assessment-option" data-answer="yes">Có ✓</button>
                            <button class="assessment-option" data-answer="no">Chưa ✗</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🔄</span> Bước 2: Decision Flowchart</h2>

                <p>Dựa trên câu trả lời, đi theo flow sau:</p>

                <div class="decision-flowchart">
                    <div class="flow-step">
                        <div class="flow-icon">1</div>
                        <div class="flow-content">
                            <h4>Kiểm tra ngân sách</h4>
                            <p>Nếu CHƯA có ngân sách → Tiếp tục học miễn phí, paper trade</p>
                        </div>
                    </div>

                    <div class="flow-step">
                        <div class="flow-icon">2</div>
                        <div class="flow-content">
                            <h4>Kiểm tra thời gian</h4>
                            <p>Nếu CHƯA có thời gian → Chờ khi cuộc sống ổn định hơn</p>
                        </div>
                    </div>

                    <div class="flow-step">
                        <div class="flow-icon">3</div>
                        <div class="flow-content">
                            <h4>Kiểm tra nền tảng kiến thức</h4>
                            <p>Nếu CHƯA nắm TIER 1 → Ôn lại bài cũ, paper trade thêm</p>
                        </div>
                    </div>

                    <div class="flow-step">
                        <div class="flow-icon">4</div>
                        <div class="flow-content">
                            <h4>Kiểm tra mục tiêu</h4>
                            <p>Nếu CÓ tất cả điều kiện → Sẵn sàng upgrade!</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/0A0E17/00F0FF?text=Decision+Flowchart" alt="Decision Flowchart">
                    <p>📸 Sơ đồ quyết định chi tiết</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">✅</span> Bước 3: Kết Luận & Hành Động</h2>

                <p>Dựa trên đánh giá, chọn kịch bản phù hợp:</p>

                <div class="scenario-grid">
                    <div class="scenario-card yes">
                        <h4>✅ NÊN Upgrade Nếu...</h4>
                        <ul>
                            <li>• Đủ 4/5 tiêu chí trở lên</li>
                            <li>• Đã paper trade ít nhất 1 tháng</li>
                            <li>• Nghiêm túc với mục tiêu trading</li>
                            <li>• Có ngân sách không ảnh hưởng cuộc sống</li>
                            <li>• Muốn học nhanh hơn với mentor</li>
                        </ul>
                        <button class="action-button primary">→ Xem TIER 2</button>
                    </div>

                    <div class="scenario-card no">
                        <h4>⏸️ NÊN Chờ Nếu...</h4>
                        <ul>
                            <li>• Dưới 3/5 tiêu chí</li>
                            <li>• Chưa hoàn thành TIER 1</li>
                            <li>• Tài chính chưa ổn định</li>
                            <li>• Không có thời gian cam kết</li>
                            <li>• Chưa chắc trading phù hợp</li>
                        </ul>
                        <button class="action-button secondary">→ Tiếp tục TIER 1</button>
                    </div>
                </div>

                <div class="highlight-box cyan">
                    <p><strong>💡 Lưu ý:</strong> Không có gì xấu khi chưa sẵn sàng. Tốt hơn là chờ đúng thời điểm thay vì ép bản thân và bỏ cuộc giữa chừng.</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🤔</span> Câu Hỏi Thường Gặp</h2>

                <h3>Q: Nếu tôi không upgrade, có bị mất kiến thức TIER 1 không?</h3>
                <p><strong>A:</strong> Không. TIER 1 là vĩnh viễn. Bạn có thể học đi học lại bao nhiêu lần tùy thích.</p>

                <h3>Q: Giá TIER 2 có tăng không?</h3>
                <p><strong>A:</strong> Có, giá tăng định kỳ khi thêm tính năng. Nhưng đừng để điều này áp lực bạn nếu chưa sẵn sàng.</p>

                <h3>Q: Tôi có thể upgrade sau 1-2 tháng nữa không?</h3>
                <p><strong>A:</strong> Hoàn toàn được. Khi nào bạn sẵn sàng, link upgrade vẫn còn đó.</p>

                <h3>Q: Nếu upgrade rồi không hài lòng thì sao?</h3>
                <p><strong>A:</strong> GEM có chính sách hoàn tiền 7 ngày nếu bạn không hài lòng với khóa học.</p>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/112250/FFBD59?text=FAQ+Section" alt="FAQ Section">
                    <p>📸 Các câu hỏi thường gặp</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🎯</span> Checklist Cuối Cùng</h2>

                <p>Trước khi quyết định, đảm bảo bạn đã:</p>

                <div class="checklist-section">
                    <h4>✅ Pre-Decision Checklist</h4>

                    <div class="checklist-item">
                        <div class="checklist-checkbox" onclick="this.classList.toggle(''checked'')"></div>
                        <span class="checklist-text">Hoàn thành tất cả bài học TIER 1</span>
                    </div>

                    <div class="checklist-item">
                        <div class="checklist-checkbox" onclick="this.classList.toggle(''checked'')"></div>
                        <span class="checklist-text">Paper trade ít nhất 20-30 lệnh</span>
                    </div>

                    <div class="checklist-item">
                        <div class="checklist-checkbox" onclick="this.classList.toggle(''checked'')"></div>
                        <span class="checklist-text">Hiểu được 4 patterns cơ bản (UPU, UPD, DPU, DPD)</span>
                    </div>

                    <div class="checklist-item">
                        <div class="checklist-checkbox" onclick="this.classList.toggle(''checked'')"></div>
                        <span class="checklist-text">Đánh giá trung thực khả năng tài chính</span>
                    </div>

                    <div class="checklist-item">
                        <div class="checklist-checkbox" onclick="this.classList.toggle(''checked'')"></div>
                        <span class="checklist-text">Có kế hoạch thời gian học rõ ràng</span>
                    </div>

                    <div class="checklist-item">
                        <div class="checklist-checkbox" onclick="this.classList.toggle(''checked'')"></div>
                        <span class="checklist-text">Quyết định dựa trên logic, không phải cảm xúc</span>
                    </div>
                </div>

                <div class="highlight-box green">
                    <p><strong>✅ Nếu bạn tick được 5/6 mục trở lên:</strong> Bạn sẵn sàng để upgrade và tiến xa hơn trong hành trình trading!</p>
                </div>
            </div>

            <div class="summary-box">
                <h3>📝 Tóm Tắt Bài Học</h3>
                <ul>
                    <li>Quyết định tốt dựa trên đánh giá khách quan, không phải cảm xúc</li>
                    <li>Sử dụng checklist tự đánh giá 5 tiêu chí quan trọng</li>
                    <li>Đi theo decision flowchart để xác định bước tiếp theo</li>
                    <li>Không sao nếu chưa sẵn sàng - TIER 1 vẫn luôn ở đó</li>
                    <li>Khi đủ điều kiện, hãy hành động để tận dụng lợi thế đi sớm</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-container">
                <h2><span class="icon">❓</span> Kiểm Tra Kiến Thức</h2>

                <div class="quiz-question" data-correct="2">
                    <p>1. Quyết định upgrade nên dựa trên điều gì?</p>
                    <button class="quiz-option" data-index="0">A. Áp lực từ giá tăng</button>
                    <button class="quiz-option" data-index="1">B. Vì bạn bè cũng đăng ký</button>
                    <button class="quiz-option" data-index="2">C. Đánh giá khách quan về tài chính, thời gian và mục tiêu</button>
                    <button class="quiz-option" data-index="3">D. Cảm xúc hứng thú nhất thời</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="1">
                    <p>2. Nếu chưa đủ điều kiện upgrade, bạn nên làm gì?</p>
                    <button class="quiz-option" data-index="0">A. Cố gắng vay mượn để đăng ký</button>
                    <button class="quiz-option" data-index="1">B. Tiếp tục học TIER 1, paper trade, chờ đúng thời điểm</button>
                    <button class="quiz-option" data-index="2">C. Bỏ cuộc vì không có tiền</button>
                    <button class="quiz-option" data-index="3">D. Tìm khóa học rẻ hơn ở nơi khác</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <p>3. Checklist tự đánh giá bao gồm những tiêu chí nào?</p>
                    <button class="quiz-option" data-index="0">A. Thời gian, ngân sách, kiến thức, mục tiêu, kiên trì</button>
                    <button class="quiz-option" data-index="1">B. Chỉ cần có tiền là đủ</button>
                    <button class="quiz-option" data-index="2">C. Số followers trên mạng xã hội</button>
                    <button class="quiz-option" data-index="3">D. Bằng cấp học vấn</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🎉 Hoàn thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>Bài học thuộc <span class="brand">GEM Trading Academy</span></p>
            <p>© 2024 - Nền tảng đào tạo trading chuyên nghiệp</p>
        </footer>
    </div>

    <script>
        // Quiz functionality
        const totalQuestions = 3;
        let answeredCount = 0;
        let correctCount = 0;

        document.querySelectorAll(''.quiz-question'').forEach(question => {
            const correctIndex = parseInt(question.dataset.correct);
            const options = question.querySelectorAll(''.quiz-option'');
            const result = question.querySelector(''.quiz-result'');

            options.forEach(option => {
                option.addEventListener(''click'', function() {
                    if (question.classList.contains(''answered'')) return;

                    question.classList.add(''answered'');
                    answeredCount++;

                    const selectedIndex = parseInt(this.dataset.index);

                    if (selectedIndex === correctIndex) {
                        this.classList.add(''correct'');
                        result.textContent = ''✓ Chính xác! Bạn đã hiểu cách đưa ra quyết định logic.'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng. Xem lại đáp án đúng được highlight.'';
                        result.className = ''quiz-result show incorrect'';
                    }

                    if (answeredCount === totalQuestions) {
                        document.getElementById(''correct-count'').textContent = correctCount;
                        document.querySelector(''.quiz-score'').classList.add(''show'');
                    }
                });
            });
        });

        // Self-assessment interactivity
        document.querySelectorAll(''.assessment-option'').forEach(button => {
            button.addEventListener(''click'', function() {
                const siblings = this.parentElement.querySelectorAll(''.assessment-option'');
                siblings.forEach(s => s.classList.remove(''selected'', ''yes'', ''no''));
                this.classList.add(''selected'', this.dataset.answer);
            });
        });
    </script>
</body>
</html>
',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 10.6: Khung Quyết Định - GEM Trading Academy</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-navy: #112250;
            --primary-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --error-red: #EF4444;
            --bg-dark: #0A0E17;
            --bg-card: #1A1F2E;
            --bg-card-hover: #252B3D;
            --text-primary: #FFFFFF;
            --text-secondary: #A0A9C0;
            --border-color: rgba(255, 189, 89, 0.2);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.7;
            font-size: 16px;
            padding: 0;
            overflow-x: hidden;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--bg-dark);
        }

        @media (min-width: 600px) {
            body {
                padding: 2rem;
                background: linear-gradient(135deg, #0A0E17 0%, #112250 100%);
            }
            .lesson-container {
                background: var(--bg-card);
                border-radius: 20px;
                border: 1px solid var(--border-color);
                overflow: hidden;
            }
        }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem 1rem;
            text-align: center;
            border-bottom: 3px solid var(--primary-gold);
            position: relative;
            overflow: hidden;
        }

        .lesson-header::before {
            content: '''';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,189,89,0.1) 0%, transparent 50%);
            animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--primary-gold) 0%, #FFD700 100%);
            color: var(--primary-navy);
            padding: 0.5rem 1.25rem;
            border-radius: 25px;
            font-size: 0.85rem;
            font-weight: 700;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .lesson-header h1 {
            font-size: clamp(1.5rem, 5vw, 2rem);
            font-weight: 700;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        .lesson-header p {
            color: var(--text-secondary);
            font-size: 1rem;
            position: relative;
            z-index: 1;
        }

        .content-section {
            padding: 0;
        }

        @media (min-width: 600px) {
            .content-section {
                padding: 1.5rem;
            }
        }

        .content-card {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin-bottom: 1px;
            border-left: 4px solid var(--primary-gold);
        }

        @media (min-width: 600px) {
            .content-card {
                border-radius: 16px;
                padding: 2rem;
                margin-bottom: 1.5rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--primary-gold);
            }
        }

        .content-card h2 {
            font-size: 1.35rem;
            font-weight: 700;
            margin-bottom: 1.25rem;
            color: var(--primary-gold);
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .content-card h2 .icon {
            font-size: 1.5rem;
        }

        .content-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 1.5rem 0 1rem 0;
            color: var(--accent-cyan);
        }

        .content-card p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
            font-size: 1rem;
            line-height: 1.8;
        }

        .content-card ul, .content-card ol {
            margin: 1rem 0;
            padding-left: 1.5rem;
            color: var(--text-secondary);
        }

        .content-card li {
            margin-bottom: 0.75rem;
            line-height: 1.7;
        }

        .highlight-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1.25rem 0;
        }

        .highlight-box.cyan {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(0, 240, 255, 0.05) 100%);
            border-color: rgba(0, 240, 255, 0.3);
        }

        .highlight-box.purple {
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.15) 0%, rgba(106, 91, 255, 0.05) 100%);
            border-color: rgba(106, 91, 255, 0.3);
        }

        .highlight-box.green {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .highlight-box p {
            margin: 0;
            color: var(--text-primary);
        }

        .image-placeholder {
            background: linear-gradient(145deg, #1a2235 0%, #0d1321 100%);
            border: 2px dashed rgba(255, 189, 89, 0.4);
            border-radius: 12px;
            padding: 1rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        .image-placeholder img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin-bottom: 0.75rem;
        }

        .image-placeholder p {
            font-size: 0.85rem;
            color: var(--primary-gold);
            margin: 0;
            font-style: italic;
        }

        .checklist-section {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        .checklist-section h4 {
            color: var(--primary-gold);
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }

        .checklist-item {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--border-color);
        }

        .checklist-item:last-child {
            border-bottom: none;
        }

        .checklist-checkbox {
            width: 24px;
            height: 24px;
            border: 2px solid var(--primary-gold);
            border-radius: 4px;
            flex-shrink: 0;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .checklist-checkbox.checked {
            background: var(--success-green);
            border-color: var(--success-green);
        }

        .checklist-checkbox.checked::after {
            content: ''✓'';
            color: white;
            font-weight: 700;
            font-size: 0.9rem;
        }

        .checklist-text {
            color: var(--text-secondary);
            font-size: 0.95rem;
        }

        .decision-flowchart {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        .flow-step {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            padding: 1rem 0;
            position: relative;
        }

        .flow-step:not(:last-child)::after {
            content: '''';
            position: absolute;
            left: 1rem;
            top: 3.5rem;
            height: calc(100% - 2rem);
            width: 2px;
            background: var(--border-color);
        }

        .flow-icon {
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            background: var(--primary-gold);
            color: var(--primary-navy);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            flex-shrink: 0;
        }

        .flow-content h4 {
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .flow-content p {
            color: var(--text-secondary);
            font-size: 0.9rem;
            margin: 0;
        }

        .scenario-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1px;
            background: var(--border-color);
            margin: 1.5rem 0;
        }

        @media (min-width: 600px) {
            .scenario-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                background: transparent;
            }
        }

        .scenario-card {
            padding: 1.5rem;
        }

        .scenario-card.yes {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, var(--bg-card-hover) 100%);
            border-left: 4px solid var(--success-green);
        }

        .scenario-card.no {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, var(--bg-card-hover) 100%);
            border-left: 4px solid var(--error-red);
        }

        @media (min-width: 600px) {
            .scenario-card {
                border-radius: 12px;
            }
        }

        .scenario-card h4 {
            font-size: 1.1rem;
            margin-bottom: 1rem;
        }

        .scenario-card.yes h4 { color: var(--success-green); }
        .scenario-card.no h4 { color: var(--error-red); }

        .scenario-card ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .scenario-card li {
            padding: 0.4rem 0;
            font-size: 0.9rem;
            color: var(--text-secondary);
        }

        .action-button {
            display: block;
            width: 100%;
            padding: 1rem;
            margin-top: 1rem;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
            border: none;
        }

        .action-button.primary {
            background: linear-gradient(135deg, var(--primary-gold) 0%, #FFD700 100%);
            color: var(--primary-navy);
        }

        .action-button.secondary {
            background: transparent;
            border: 2px solid var(--text-secondary);
            color: var(--text-secondary);
        }

        .self-assessment {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            border: 2px solid var(--primary-gold);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        .self-assessment h4 {
            color: var(--primary-gold);
            margin-bottom: 1rem;
        }

        .assessment-question {
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--border-color);
        }

        .assessment-question:last-child {
            border-bottom: none;
        }

        .assessment-question p {
            color: var(--text-primary);
            margin-bottom: 0.5rem;
            font-weight: 500;
        }

        .assessment-options {
            display: flex;
            gap: 0.5rem;
        }

        .assessment-option {
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            background: transparent;
        }

        .assessment-option:hover {
            border-color: var(--primary-gold);
            color: var(--primary-gold);
        }

        .assessment-option.selected.yes {
            background: var(--success-green);
            border-color: var(--success-green);
            color: white;
        }

        .assessment-option.selected.no {
            background: var(--error-red);
            border-color: var(--error-red);
            color: white;
        }

        .summary-box {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            border: 2px solid var(--primary-gold);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin: 0;
        }

        @media (min-width: 600px) {
            .summary-box {
                border-radius: 16px;
                padding: 2rem;
                margin: 1.5rem;
            }
        }

        .summary-box h3 {
            color: var(--primary-gold);
            font-size: 1.25rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding: 0;
        }

        .summary-box li {
            padding: 0.5rem 0;
            padding-left: 1.75rem;
            position: relative;
            color: var(--text-primary);
        }

        .summary-box li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-weight: 700;
        }

        .quiz-section {
            padding: 0;
        }

        @media (min-width: 600px) {
            .quiz-section {
                padding: 1.5rem;
            }
        }

        .quiz-container {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            border-left: 4px solid var(--accent-purple);
        }

        @media (min-width: 600px) {
            .quiz-container {
                border-radius: 16px;
                padding: 2rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--accent-purple);
            }
        }

        .quiz-container h2 {
            color: var(--accent-purple);
            font-size: 1.35rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .quiz-question {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1.25rem;
            border: 1px solid var(--border-color);
        }

        .quiz-question p {
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.875rem 1rem;
            margin-bottom: 0.5rem;
            background: var(--bg-card);
            border: 2px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
            font-size: 0.95rem;
        }

        .quiz-option:hover:not(:disabled) {
            border-color: var(--accent-purple);
            background: rgba(106, 91, 255, 0.1);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--success-green);
            color: var(--success-green);
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: var(--error-red);
            color: var(--error-red);
        }

        .quiz-result {
            padding: 0.75rem;
            border-radius: 8px;
            margin-top: 0.75rem;
            font-weight: 600;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success-green);
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.2);
            color: var(--error-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score h3 {
            color: var(--primary-gold);
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
        }

        .quiz-score p {
            color: var(--text-secondary);
        }

        .retake-btn {
            display: inline-block;
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--accent-purple) 0%, #5346E0 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .retake-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(106, 91, 255, 0.4);
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            background: var(--bg-card);
            border-top: 1px solid var(--border-color);
        }

        .lesson-footer p {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .lesson-footer .brand {
            color: var(--primary-gold);
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <div class="header-badge">Module B - Bài 6/7</div>
            <h1>Khung Quyết Định</h1>
            <p>Framework giúp bạn đưa ra quyết định đúng đắn</p>
        </header>

        <section class="content-section">
            <div class="content-card">
                <h2><span class="icon">🎯</span> Quyết Định Dựa Trên Logic</h2>

                <p>Một quyết định tốt không dựa trên cảm xúc hay áp lực, mà dựa trên <strong>sự đánh giá khách quan</strong> về tình huống của bạn.</p>

                <div class="highlight-box">
                    <p><strong>💡 Nguyên tắc:</strong> Trước khi quyết định bất cứ điều gì (upgrade, đầu tư, thay đổi công việc...), hãy sử dụng một framework logic để đánh giá.</p>
                </div>

                <p>Trong bài này, chúng ta sẽ xây dựng <strong>Khung Quyết Định</strong> để giúp bạn tự đánh giá xem mình nên:</p>
                <ul>
                    <li>Tiếp tục học miễn phí với TIER 1</li>
                    <li>Upgrade lên TIER 2 để đi sâu hơn</li>
                    <li>Trở thành Đối Tác để kiếm thêm thu nhập</li>
                </ul>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/112250/FFBD59?text=Decision+Framework" alt="Decision Framework">
                    <p>📸 Khung quyết định logic</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📋</span> Bước 1: Tự Đánh Giá Bản Thân</h2>

                <p>Trả lời trung thực các câu hỏi sau:</p>

                <div class="self-assessment">
                    <h4>📝 Checklist Tự Đánh Giá</h4>

                    <div class="assessment-question">
                        <p>1. Tôi có đủ thời gian cam kết (tối thiểu 5-10 giờ/tuần)?</p>
                        <div class="assessment-options">
                            <button class="assessment-option" data-answer="yes">Có ✓</button>
                            <button class="assessment-option" data-answer="no">Chưa ✗</button>
                        </div>
                    </div>

                    <div class="assessment-question">
                        <p>2. Tôi có ngân sách cho việc học (không ảnh hưởng chi tiêu thiết yếu)?</p>
                        <div class="assessment-options">
                            <button class="assessment-option" data-answer="yes">Có ✓</button>
                            <button class="assessment-option" data-answer="no">Chưa ✗</button>
                        </div>
                    </div>

                    <div class="assessment-question">
                        <p>3. Tôi đã hoàn thành TIER 1 và hiểu các pattern cơ bản?</p>
                        <div class="assessment-options">
                            <button class="assessment-option" data-answer="yes">Có ✓</button>
                            <button class="assessment-option" data-answer="no">Chưa ✗</button>
                        </div>
                    </div>

                    <div class="assessment-question">
                        <p>4. Tôi nghiêm túc muốn trading trở thành nguồn thu nhập?</p>
                        <div class="assessment-options">
                            <button class="assessment-option" data-answer="yes">Có ✓</button>
                            <button class="assessment-option" data-answer="no">Chưa ✗</button>
                        </div>
                    </div>

                    <div class="assessment-question">
                        <p>5. Tôi sẵn sàng học và thực hành kiên trì trong 3-6 tháng?</p>
                        <div class="assessment-options">
                            <button class="assessment-option" data-answer="yes">Có ✓</button>
                            <button class="assessment-option" data-answer="no">Chưa ✗</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🔄</span> Bước 2: Decision Flowchart</h2>

                <p>Dựa trên câu trả lời, đi theo flow sau:</p>

                <div class="decision-flowchart">
                    <div class="flow-step">
                        <div class="flow-icon">1</div>
                        <div class="flow-content">
                            <h4>Kiểm tra ngân sách</h4>
                            <p>Nếu CHƯA có ngân sách → Tiếp tục học miễn phí, paper trade</p>
                        </div>
                    </div>

                    <div class="flow-step">
                        <div class="flow-icon">2</div>
                        <div class="flow-content">
                            <h4>Kiểm tra thời gian</h4>
                            <p>Nếu CHƯA có thời gian → Chờ khi cuộc sống ổn định hơn</p>
                        </div>
                    </div>

                    <div class="flow-step">
                        <div class="flow-icon">3</div>
                        <div class="flow-content">
                            <h4>Kiểm tra nền tảng kiến thức</h4>
                            <p>Nếu CHƯA nắm TIER 1 → Ôn lại bài cũ, paper trade thêm</p>
                        </div>
                    </div>

                    <div class="flow-step">
                        <div class="flow-icon">4</div>
                        <div class="flow-content">
                            <h4>Kiểm tra mục tiêu</h4>
                            <p>Nếu CÓ tất cả điều kiện → Sẵn sàng upgrade!</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/0A0E17/00F0FF?text=Decision+Flowchart" alt="Decision Flowchart">
                    <p>📸 Sơ đồ quyết định chi tiết</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">✅</span> Bước 3: Kết Luận & Hành Động</h2>

                <p>Dựa trên đánh giá, chọn kịch bản phù hợp:</p>

                <div class="scenario-grid">
                    <div class="scenario-card yes">
                        <h4>✅ NÊN Upgrade Nếu...</h4>
                        <ul>
                            <li>• Đủ 4/5 tiêu chí trở lên</li>
                            <li>• Đã paper trade ít nhất 1 tháng</li>
                            <li>• Nghiêm túc với mục tiêu trading</li>
                            <li>• Có ngân sách không ảnh hưởng cuộc sống</li>
                            <li>• Muốn học nhanh hơn với mentor</li>
                        </ul>
                        <button class="action-button primary">→ Xem TIER 2</button>
                    </div>

                    <div class="scenario-card no">
                        <h4>⏸️ NÊN Chờ Nếu...</h4>
                        <ul>
                            <li>• Dưới 3/5 tiêu chí</li>
                            <li>• Chưa hoàn thành TIER 1</li>
                            <li>• Tài chính chưa ổn định</li>
                            <li>• Không có thời gian cam kết</li>
                            <li>• Chưa chắc trading phù hợp</li>
                        </ul>
                        <button class="action-button secondary">→ Tiếp tục TIER 1</button>
                    </div>
                </div>

                <div class="highlight-box cyan">
                    <p><strong>💡 Lưu ý:</strong> Không có gì xấu khi chưa sẵn sàng. Tốt hơn là chờ đúng thời điểm thay vì ép bản thân và bỏ cuộc giữa chừng.</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🤔</span> Câu Hỏi Thường Gặp</h2>

                <h3>Q: Nếu tôi không upgrade, có bị mất kiến thức TIER 1 không?</h3>
                <p><strong>A:</strong> Không. TIER 1 là vĩnh viễn. Bạn có thể học đi học lại bao nhiêu lần tùy thích.</p>

                <h3>Q: Giá TIER 2 có tăng không?</h3>
                <p><strong>A:</strong> Có, giá tăng định kỳ khi thêm tính năng. Nhưng đừng để điều này áp lực bạn nếu chưa sẵn sàng.</p>

                <h3>Q: Tôi có thể upgrade sau 1-2 tháng nữa không?</h3>
                <p><strong>A:</strong> Hoàn toàn được. Khi nào bạn sẵn sàng, link upgrade vẫn còn đó.</p>

                <h3>Q: Nếu upgrade rồi không hài lòng thì sao?</h3>
                <p><strong>A:</strong> GEM có chính sách hoàn tiền 7 ngày nếu bạn không hài lòng với khóa học.</p>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/112250/FFBD59?text=FAQ+Section" alt="FAQ Section">
                    <p>📸 Các câu hỏi thường gặp</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🎯</span> Checklist Cuối Cùng</h2>

                <p>Trước khi quyết định, đảm bảo bạn đã:</p>

                <div class="checklist-section">
                    <h4>✅ Pre-Decision Checklist</h4>

                    <div class="checklist-item">
                        <div class="checklist-checkbox" onclick="this.classList.toggle(''checked'')"></div>
                        <span class="checklist-text">Hoàn thành tất cả bài học TIER 1</span>
                    </div>

                    <div class="checklist-item">
                        <div class="checklist-checkbox" onclick="this.classList.toggle(''checked'')"></div>
                        <span class="checklist-text">Paper trade ít nhất 20-30 lệnh</span>
                    </div>

                    <div class="checklist-item">
                        <div class="checklist-checkbox" onclick="this.classList.toggle(''checked'')"></div>
                        <span class="checklist-text">Hiểu được 4 patterns cơ bản (UPU, UPD, DPU, DPD)</span>
                    </div>

                    <div class="checklist-item">
                        <div class="checklist-checkbox" onclick="this.classList.toggle(''checked'')"></div>
                        <span class="checklist-text">Đánh giá trung thực khả năng tài chính</span>
                    </div>

                    <div class="checklist-item">
                        <div class="checklist-checkbox" onclick="this.classList.toggle(''checked'')"></div>
                        <span class="checklist-text">Có kế hoạch thời gian học rõ ràng</span>
                    </div>

                    <div class="checklist-item">
                        <div class="checklist-checkbox" onclick="this.classList.toggle(''checked'')"></div>
                        <span class="checklist-text">Quyết định dựa trên logic, không phải cảm xúc</span>
                    </div>
                </div>

                <div class="highlight-box green">
                    <p><strong>✅ Nếu bạn tick được 5/6 mục trở lên:</strong> Bạn sẵn sàng để upgrade và tiến xa hơn trong hành trình trading!</p>
                </div>
            </div>

            <div class="summary-box">
                <h3>📝 Tóm Tắt Bài Học</h3>
                <ul>
                    <li>Quyết định tốt dựa trên đánh giá khách quan, không phải cảm xúc</li>
                    <li>Sử dụng checklist tự đánh giá 5 tiêu chí quan trọng</li>
                    <li>Đi theo decision flowchart để xác định bước tiếp theo</li>
                    <li>Không sao nếu chưa sẵn sàng - TIER 1 vẫn luôn ở đó</li>
                    <li>Khi đủ điều kiện, hãy hành động để tận dụng lợi thế đi sớm</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-container">
                <h2><span class="icon">❓</span> Kiểm Tra Kiến Thức</h2>

                <div class="quiz-question" data-correct="2">
                    <p>1. Quyết định upgrade nên dựa trên điều gì?</p>
                    <button class="quiz-option" data-index="0">A. Áp lực từ giá tăng</button>
                    <button class="quiz-option" data-index="1">B. Vì bạn bè cũng đăng ký</button>
                    <button class="quiz-option" data-index="2">C. Đánh giá khách quan về tài chính, thời gian và mục tiêu</button>
                    <button class="quiz-option" data-index="3">D. Cảm xúc hứng thú nhất thời</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="1">
                    <p>2. Nếu chưa đủ điều kiện upgrade, bạn nên làm gì?</p>
                    <button class="quiz-option" data-index="0">A. Cố gắng vay mượn để đăng ký</button>
                    <button class="quiz-option" data-index="1">B. Tiếp tục học TIER 1, paper trade, chờ đúng thời điểm</button>
                    <button class="quiz-option" data-index="2">C. Bỏ cuộc vì không có tiền</button>
                    <button class="quiz-option" data-index="3">D. Tìm khóa học rẻ hơn ở nơi khác</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <p>3. Checklist tự đánh giá bao gồm những tiêu chí nào?</p>
                    <button class="quiz-option" data-index="0">A. Thời gian, ngân sách, kiến thức, mục tiêu, kiên trì</button>
                    <button class="quiz-option" data-index="1">B. Chỉ cần có tiền là đủ</button>
                    <button class="quiz-option" data-index="2">C. Số followers trên mạng xã hội</button>
                    <button class="quiz-option" data-index="3">D. Bằng cấp học vấn</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🎉 Hoàn thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>Bài học thuộc <span class="brand">GEM Trading Academy</span></p>
            <p>© 2024 - Nền tảng đào tạo trading chuyên nghiệp</p>
        </footer>
    </div>

    <script>
        // Quiz functionality
        const totalQuestions = 3;
        let answeredCount = 0;
        let correctCount = 0;

        document.querySelectorAll(''.quiz-question'').forEach(question => {
            const correctIndex = parseInt(question.dataset.correct);
            const options = question.querySelectorAll(''.quiz-option'');
            const result = question.querySelector(''.quiz-result'');

            options.forEach(option => {
                option.addEventListener(''click'', function() {
                    if (question.classList.contains(''answered'')) return;

                    question.classList.add(''answered'');
                    answeredCount++;

                    const selectedIndex = parseInt(this.dataset.index);

                    if (selectedIndex === correctIndex) {
                        this.classList.add(''correct'');
                        result.textContent = ''✓ Chính xác! Bạn đã hiểu cách đưa ra quyết định logic.'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng. Xem lại đáp án đúng được highlight.'';
                        result.className = ''quiz-result show incorrect'';
                    }

                    if (answeredCount === totalQuestions) {
                        document.getElementById(''correct-count'').textContent = correctCount;
                        document.querySelector(''.quiz-score'').classList.add(''show'');
                    }
                });
            });
        });

        // Self-assessment interactivity
        document.querySelectorAll(''.assessment-option'').forEach(button => {
            button.addEventListener(''click'', function() {
                const siblings = this.parentElement.querySelectorAll(''.assessment-option'');
                siblings.forEach(s => s.classList.remove(''selected'', ''yes'', ''no''));
                this.classList.add(''selected'', this.dataset.answer);
            });
        });
    </script>
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

-- Lesson 10.7: Các Bước Tiếp Theo - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch10-l7',
  'module-tier-1-ch10',
  'course-tier1-trading-foundation',
  'Bài 10.7: Các Bước Tiếp Theo - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 10.7: Các Bước Tiếp Theo - GEM Trading Academy</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-navy: #112250;
            --primary-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --error-red: #EF4444;
            --bg-dark: #0A0E17;
            --bg-card: #1A1F2E;
            --bg-card-hover: #252B3D;
            --text-primary: #FFFFFF;
            --text-secondary: #A0A9C0;
            --border-color: rgba(255, 189, 89, 0.2);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.7;
            font-size: 16px;
            padding: 0;
            overflow-x: hidden;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--bg-dark);
        }

        @media (min-width: 600px) {
            body {
                padding: 2rem;
                background: linear-gradient(135deg, #0A0E17 0%, #112250 100%);
            }
            .lesson-container {
                background: var(--bg-card);
                border-radius: 20px;
                border: 1px solid var(--border-color);
                overflow: hidden;
            }
        }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem 1rem;
            text-align: center;
            border-bottom: 3px solid var(--primary-gold);
            position: relative;
            overflow: hidden;
        }

        .lesson-header::before {
            content: '''';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,189,89,0.1) 0%, transparent 50%);
            animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--success-green) 0%, #059669 100%);
            color: white;
            padding: 0.5rem 1.25rem;
            border-radius: 25px;
            font-size: 0.85rem;
            font-weight: 700;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .lesson-header h1 {
            font-size: clamp(1.5rem, 5vw, 2rem);
            font-weight: 700;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        .lesson-header p {
            color: var(--text-secondary);
            font-size: 1rem;
            position: relative;
            z-index: 1;
        }

        .content-section {
            padding: 0;
        }

        @media (min-width: 600px) {
            .content-section {
                padding: 1.5rem;
            }
        }

        .content-card {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin-bottom: 1px;
            border-left: 4px solid var(--primary-gold);
        }

        @media (min-width: 600px) {
            .content-card {
                border-radius: 16px;
                padding: 2rem;
                margin-bottom: 1.5rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--primary-gold);
            }
        }

        .content-card h2 {
            font-size: 1.35rem;
            font-weight: 700;
            margin-bottom: 1.25rem;
            color: var(--primary-gold);
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .content-card h2 .icon {
            font-size: 1.5rem;
        }

        .content-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 1.5rem 0 1rem 0;
            color: var(--accent-cyan);
        }

        .content-card p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
            font-size: 1rem;
            line-height: 1.8;
        }

        .content-card ul, .content-card ol {
            margin: 1rem 0;
            padding-left: 1.5rem;
            color: var(--text-secondary);
        }

        .content-card li {
            margin-bottom: 0.75rem;
            line-height: 1.7;
        }

        .highlight-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1.25rem 0;
        }

        .highlight-box.cyan {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(0, 240, 255, 0.05) 100%);
            border-color: rgba(0, 240, 255, 0.3);
        }

        .highlight-box.purple {
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.15) 0%, rgba(106, 91, 255, 0.05) 100%);
            border-color: rgba(106, 91, 255, 0.3);
        }

        .highlight-box.green {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .highlight-box p {
            margin: 0;
            color: var(--text-primary);
        }

        .image-placeholder {
            background: linear-gradient(145deg, #1a2235 0%, #0d1321 100%);
            border: 2px dashed rgba(255, 189, 89, 0.4);
            border-radius: 12px;
            padding: 1rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        .image-placeholder img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin-bottom: 0.75rem;
        }

        .image-placeholder p {
            font-size: 0.85rem;
            color: var(--primary-gold);
            margin: 0;
            font-style: italic;
        }

        .congrats-banner {
            background: linear-gradient(135deg, var(--primary-gold) 0%, #FFD700 100%);
            color: var(--primary-navy);
            padding: 2rem;
            text-align: center;
            margin: 0 0 1px 0;
        }

        @media (min-width: 600px) {
            .congrats-banner {
                border-radius: 16px;
                margin: 0 0 1.5rem 0;
            }
        }

        .congrats-banner .emoji {
            font-size: 3rem;
            margin-bottom: 1rem;
        }

        .congrats-banner h2 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            color: var(--primary-navy);
        }

        .congrats-banner p {
            color: var(--primary-navy);
            opacity: 0.8;
            margin: 0;
        }

        .path-card {
            background: linear-gradient(135deg, var(--bg-card-hover) 0%, var(--bg-card) 100%);
            border: 2px solid var(--border-color);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1rem 0;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .path-card:hover {
            border-color: var(--primary-gold);
            transform: translateY(-2px);
        }

        .path-card .path-number {
            position: absolute;
            top: 1rem;
            right: 1rem;
            width: 40px;
            height: 40px;
            background: var(--primary-gold);
            color: var(--primary-navy);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.25rem;
        }

        .path-card h4 {
            font-size: 1.15rem;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }

        .path-card .subtitle {
            color: var(--accent-cyan);
            font-size: 0.9rem;
            margin-bottom: 1rem;
        }

        .path-card p {
            color: var(--text-secondary);
            font-size: 0.95rem;
            margin-bottom: 1rem;
        }

        .path-card .cta-btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, var(--primary-gold) 0%, #FFD700 100%);
            color: var(--primary-navy);
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            cursor: pointer;
            border: none;
        }

        .path-card .cta-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(255, 189, 89, 0.3);
        }

        .path-card .cta-btn.secondary {
            background: transparent;
            border: 2px solid var(--primary-gold);
            color: var(--primary-gold);
        }

        .action-step {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            padding: 1rem 0;
            border-bottom: 1px solid var(--border-color);
        }

        .action-step:last-child {
            border-bottom: none;
        }

        .action-step .step-num {
            width: 2.5rem;
            height: 2.5rem;
            background: var(--primary-gold);
            color: var(--primary-navy);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            flex-shrink: 0;
        }

        .action-step .step-content h4 {
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .action-step .step-content p {
            color: var(--text-secondary);
            font-size: 0.9rem;
            margin: 0;
        }

        .resource-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1px;
            background: var(--border-color);
            margin: 1.5rem 0;
        }

        @media (min-width: 600px) {
            .resource-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                background: transparent;
            }
        }

        .resource-item {
            background: var(--bg-card-hover);
            padding: 1.25rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        @media (min-width: 600px) {
            .resource-item {
                border-radius: 12px;
                border: 1px solid var(--border-color);
            }
        }

        .resource-item .icon {
            font-size: 2rem;
        }

        .resource-item .info h4 {
            color: var(--text-primary);
            font-size: 1rem;
            margin-bottom: 0.25rem;
        }

        .resource-item .info p {
            color: var(--text-secondary);
            font-size: 0.85rem;
            margin: 0;
        }

        .final-message {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            border: 2px solid var(--primary-gold);
            border-radius: 0;
            padding: 2rem 1.5rem;
            text-align: center;
            margin: 0;
        }

        @media (min-width: 600px) {
            .final-message {
                border-radius: 16px;
                margin: 1.5rem;
            }
        }

        .final-message .quote {
            font-size: 1.25rem;
            font-style: italic;
            color: var(--text-primary);
            margin-bottom: 1rem;
            line-height: 1.6;
        }

        .final-message .author {
            color: var(--primary-gold);
            font-weight: 600;
        }

        .summary-box {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            border: 2px solid var(--success-green);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin: 0;
        }

        @media (min-width: 600px) {
            .summary-box {
                border-radius: 16px;
                padding: 2rem;
                margin: 1.5rem;
            }
        }

        .summary-box h3 {
            color: var(--success-green);
            font-size: 1.25rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding: 0;
        }

        .summary-box li {
            padding: 0.5rem 0;
            padding-left: 1.75rem;
            position: relative;
            color: var(--text-primary);
        }

        .summary-box li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-weight: 700;
        }

        .quiz-section {
            padding: 0;
        }

        @media (min-width: 600px) {
            .quiz-section {
                padding: 1.5rem;
            }
        }

        .quiz-container {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            border-left: 4px solid var(--accent-purple);
        }

        @media (min-width: 600px) {
            .quiz-container {
                border-radius: 16px;
                padding: 2rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--accent-purple);
            }
        }

        .quiz-container h2 {
            color: var(--accent-purple);
            font-size: 1.35rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .quiz-question {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1.25rem;
            border: 1px solid var(--border-color);
        }

        .quiz-question p {
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.875rem 1rem;
            margin-bottom: 0.5rem;
            background: var(--bg-card);
            border: 2px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
            font-size: 0.95rem;
        }

        .quiz-option:hover:not(:disabled) {
            border-color: var(--accent-purple);
            background: rgba(106, 91, 255, 0.1);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--success-green);
            color: var(--success-green);
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: var(--error-red);
            color: var(--error-red);
        }

        .quiz-result {
            padding: 0.75rem;
            border-radius: 8px;
            margin-top: 0.75rem;
            font-weight: 600;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success-green);
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.2);
            color: var(--error-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score h3 {
            color: var(--success-green);
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
        }

        .quiz-score p {
            color: var(--text-secondary);
        }

        .retake-btn {
            display: inline-block;
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--accent-purple) 0%, #5346E0 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .retake-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(106, 91, 255, 0.4);
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            background: var(--bg-card);
            border-top: 1px solid var(--border-color);
        }

        .lesson-footer p {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .lesson-footer .brand {
            color: var(--primary-gold);
            font-weight: 700;
        }

        .completion-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--success-green) 0%, #059669 100%);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <div class="header-badge">🎓 Bài Cuối - TIER 1</div>
            <h1>Các Bước Tiếp Theo</h1>
            <p>Chúc mừng! Bạn đã hoàn thành TIER 1 - Bây giờ hãy hành động!</p>
        </header>

        <section class="content-section">
            <div class="congrats-banner">
                <div class="emoji">🎉</div>
                <h2>Chúc Mừng Bạn!</h2>
                <p>Bạn đã hoàn thành toàn bộ TIER 1 - GEM Trading Academy</p>
            </div>

            <div class="content-card">
                <h2><span class="icon">🏆</span> Những Gì Bạn Đã Đạt Được</h2>

                <p>Hãy tự hào về hành trình bạn đã đi qua. Trong TIER 1, bạn đã học:</p>

                <ul>
                    <li><strong>Nền tảng Pattern Frequency:</strong> Hiểu về HFZ, LFZ và cách thị trường vận động</li>
                    <li><strong>4 Patterns cơ bản:</strong> UPU, UPD, DPU, DPD - những công cụ trading chính</li>
                    <li><strong>6 Classic Patterns:</strong> Double Top/Bottom, Head & Shoulders, Flags...</li>
                    <li><strong>Paper Trading:</strong> Cách thực hành không rủi ro</li>
                    <li><strong>GEM Master AI:</strong> Sử dụng công cụ hỗ trợ thông minh</li>
                    <li><strong>Mindset Trading:</strong> Tư duy đúng để thành công lâu dài</li>
                </ul>

                <div class="highlight-box green">
                    <p><strong>📊 Thống kê:</strong> Bạn đã hoàn thành <strong>45 bài học</strong>, sẵn sàng để bước vào thực hành thực tế!</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/10B981/FFFFFF?text=TIER+1+Complete!" alt="TIER 1 Complete">
                    <p>📸 Chứng nhận hoàn thành TIER 1</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🛤️</span> 3 Con Đường Phía Trước</h2>

                <p>Bạn có 3 lựa chọn để tiếp tục hành trình:</p>

                <div class="path-card">
                    <div class="path-number">1</div>
                    <h4>Tiếp Tục Luyện Tập Với TIER 1</h4>
                    <div class="subtitle">Dành cho bạn muốn củng cố nền tảng</div>
                    <p>Paper trade thêm 2-3 tháng, ôn lại các bài học, đảm bảo nắm vững 100% kiến thức trước khi đi tiếp.</p>
                    <button class="cta-btn secondary">Ôn lại từ đầu</button>
                </div>

                <div class="path-card">
                    <div class="path-number">2</div>
                    <h4>Upgrade Lên TIER 2</h4>
                    <div class="subtitle">Dành cho bạn muốn đi sâu & trade chuyên nghiệp</div>
                    <p>Học thêm 20+ patterns nâng cao, multi-timeframe analysis, position sizing pro, và live trading strategies.</p>
                    <button class="cta-btn">Xem TIER 2 →</button>
                </div>

                <div class="path-card">
                    <div class="path-number">3</div>
                    <h4>Trở Thành Đối Tác GEM</h4>
                    <div class="subtitle">Dành cho bạn muốn kiếm thêm thu nhập</div>
                    <p>Chia sẻ kiến thức, giúp người khác, và nhận hoa hồng 10-30% (sản phẩm số) theo hệ thống CTV 5 tier.</p>
                    <button class="cta-btn secondary">Tìm hiểu Affiliate →</button>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/FFBD59?text=3+Paths+Forward" alt="3 Paths Forward">
                    <p>📸 Ba con đường để tiếp tục</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📝</span> Checklist Hành Động Ngay</h2>

                <p>Dù bạn chọn con đường nào, hãy thực hiện các bước sau trong <strong>7 ngày tới</strong>:</p>

                <div class="action-step">
                    <div class="step-num">1</div>
                    <div class="step-content">
                        <h4>Mở TradingView / Binance Chart</h4>
                        <p>Bắt đầu quan sát chart thực tế, tìm các patterns đã học</p>
                    </div>
                </div>

                <div class="action-step">
                    <div class="step-num">2</div>
                    <div class="step-content">
                        <h4>Paper Trade Ít Nhất 5 Lệnh</h4>
                        <p>Ghi chép đầy đủ: Entry, SL, TP, lý do vào lệnh, kết quả</p>
                    </div>
                </div>

                <div class="action-step">
                    <div class="step-num">3</div>
                    <div class="step-content">
                        <h4>Sử Dụng GEM Master AI</h4>
                        <p>Hỏi ít nhất 5 câu hỏi về patterns hoặc setups bạn thấy</p>
                    </div>
                </div>

                <div class="action-step">
                    <div class="step-num">4</div>
                    <div class="step-content">
                        <h4>Tạo Trading Journal</h4>
                        <p>Bắt đầu ghi chép hành trình, dù chỉ là paper trade</p>
                    </div>
                </div>

                <div class="action-step">
                    <div class="step-num">5</div>
                    <div class="step-content">
                        <h4>Quyết Định Bước Tiếp Theo</h4>
                        <p>Dựa trên Khung Quyết Định (Bài 10.6), chọn con đường phù hợp</p>
                    </div>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📚</span> Tài Nguyên Hỗ Trợ</h2>

                <p>Bạn có thể truy cập các tài nguyên sau để hỗ trợ hành trình:</p>

                <div class="resource-grid">
                    <div class="resource-item">
                        <div class="icon">🤖</div>
                        <div class="info">
                            <h4>GEM Master AI</h4>
                            <p>Hỏi đáp trading 24/7</p>
                        </div>
                    </div>
                    <div class="resource-item">
                        <div class="icon">📊</div>
                        <div class="info">
                            <h4>Pattern Scanner</h4>
                            <p>Quét pattern tự động</p>
                        </div>
                    </div>
                    <div class="resource-item">
                        <div class="icon">💬</div>
                        <div class="info">
                            <h4>Community Forum</h4>
                            <p>Thảo luận với học viên khác</p>
                        </div>
                    </div>
                    <div class="resource-item">
                        <div class="icon">📖</div>
                        <div class="info">
                            <h4>Help Center</h4>
                            <p>Hướng dẫn và FAQ</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x300/0A0E17/00F0FF?text=Support+Resources" alt="Support Resources">
                    <p>📸 Các tài nguyên hỗ trợ học viên</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">💡</span> Lời Khuyên Cuối</h2>

                <h3>1. Đừng vội vàng trade tiền thật</h3>
                <p>Paper trade đủ 50-100 lệnh trước. Kiên nhẫn là chìa khóa thành công.</p>

                <h3>2. Học không bao giờ dừng</h3>
                <p>Dù bạn ở level nào, luôn có thứ mới để học. Thị trường thay đổi, bạn cũng phải adapt.</p>

                <h3>3. Tập trung vào quá trình, không phải kết quả</h3>
                <p>Nếu bạn trade đúng process, kết quả sẽ đến. Đừng để 1-2 lệnh thua làm bạn nản.</p>

                <h3>4. Xây dựng cộng đồng</h3>
                <p>Kết nối với học viên khác, chia sẻ kinh nghiệm, học hỏi lẫn nhau.</p>

                <div class="highlight-box purple">
                    <p><strong>🎯 Nhớ rằng:</strong> Trading là marathon, không phải sprint. Những người thành công là những người kiên trì đủ lâu.</p>
                </div>
            </div>

            <div class="final-message">
                <div class="quote">"Con đường vạn dặm bắt đầu từ một bước chân. Bạn đã hoàn thành những bước đầu tiên. Hãy tiếp tục bước đi."</div>
                <div class="author">— GEM Trading Academy</div>
                <div class="completion-badge">🎓 TIER 1 Graduate</div>
            </div>

            <div class="summary-box">
                <h3>🎓 Tổng Kết TIER 1</h3>
                <ul>
                    <li>Bạn đã hoàn thành 45 bài học về Pattern Frequency Trading</li>
                    <li>Nắm vững 4 patterns cơ bản + 6 classic patterns</li>
                    <li>Hiểu cách paper trade, sử dụng AI, và xây dựng mindset</li>
                    <li>Có 3 lựa chọn: Củng cố TIER 1, Upgrade TIER 2, hoặc làm Đối Tác</li>
                    <li>Hành động ngay: Paper trade, sử dụng tools, và quyết định bước tiếp</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-container">
                <h2><span class="icon">❓</span> Quiz Cuối Cùng</h2>

                <div class="quiz-question" data-correct="1">
                    <p>1. Sau khi hoàn thành TIER 1, bạn nên làm gì đầu tiên?</p>
                    <button class="quiz-option" data-index="0">A. Trade tiền thật ngay lập tức</button>
                    <button class="quiz-option" data-index="1">B. Paper trade để củng cố kiến thức trước</button>
                    <button class="quiz-option" data-index="2">C. Bỏ qua và chuyển sang học thứ khác</button>
                    <button class="quiz-option" data-index="3">D. Nghỉ ngơi vài tháng rồi mới tiếp tục</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <p>2. 3 con đường sau TIER 1 là gì?</p>
                    <button class="quiz-option" data-index="0">A. Trade thật, nghỉ ngơi, hoặc bỏ cuộc</button>
                    <button class="quiz-option" data-index="1">B. Học sách, xem video, hoặc tự nghiên cứu</button>
                    <button class="quiz-option" data-index="2">C. Củng cố TIER 1, Upgrade TIER 2, hoặc làm Đối Tác</button>
                    <button class="quiz-option" data-index="3">D. Chỉ có 1 đường duy nhất</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <p>3. Điều quan trọng nhất để thành công trong trading là gì?</p>
                    <button class="quiz-option" data-index="0">A. Kiên trì và tuân thủ process</button>
                    <button class="quiz-option" data-index="1">B. Có nhiều vốn</button>
                    <button class="quiz-option" data-index="2">C. May mắn</button>
                    <button class="quiz-option" data-index="3">D. Trade thật nhiều lệnh mỗi ngày</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🎉 Chúc Mừng! Bạn Đã Hoàn Thành TIER 1!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <p style="margin-top: 1rem; color: var(--success-green);">Chúc bạn thành công trong hành trình trading!</p>
                    <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>🎓 Bạn đã hoàn thành <span class="brand">TIER 1 - GEM Trading Academy</span></p>
            <p>© 2024 - Nền tảng đào tạo trading chuyên nghiệp</p>
            <p style="margin-top: 1rem; color: var(--primary-gold);">Hẹn gặp lại ở TIER 2! 🚀</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 3;
        let answeredCount = 0;
        let correctCount = 0;

        document.querySelectorAll(''.quiz-question'').forEach(question => {
            const correctIndex = parseInt(question.dataset.correct);
            const options = question.querySelectorAll(''.quiz-option'');
            const result = question.querySelector(''.quiz-result'');

            options.forEach(option => {
                option.addEventListener(''click'', function() {
                    if (question.classList.contains(''answered'')) return;

                    question.classList.add(''answered'');
                    answeredCount++;

                    const selectedIndex = parseInt(this.dataset.index);

                    if (selectedIndex === correctIndex) {
                        this.classList.add(''correct'');
                        result.textContent = ''✓ Chính xác! Bạn đã sẵn sàng cho bước tiếp theo.'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Xem lại đáp án đúng được highlight.'';
                        result.className = ''quiz-result show incorrect'';
                    }

                    if (answeredCount === totalQuestions) {
                        document.getElementById(''correct-count'').textContent = correctCount;
                        document.querySelector(''.quiz-score'').classList.add(''show'');
                    }
                });
            });
        });
    </script>
</body>
</html>
',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 10.7: Các Bước Tiếp Theo - GEM Trading Academy</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-navy: #112250;
            --primary-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --error-red: #EF4444;
            --bg-dark: #0A0E17;
            --bg-card: #1A1F2E;
            --bg-card-hover: #252B3D;
            --text-primary: #FFFFFF;
            --text-secondary: #A0A9C0;
            --border-color: rgba(255, 189, 89, 0.2);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.7;
            font-size: 16px;
            padding: 0;
            overflow-x: hidden;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--bg-dark);
        }

        @media (min-width: 600px) {
            body {
                padding: 2rem;
                background: linear-gradient(135deg, #0A0E17 0%, #112250 100%);
            }
            .lesson-container {
                background: var(--bg-card);
                border-radius: 20px;
                border: 1px solid var(--border-color);
                overflow: hidden;
            }
        }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem 1rem;
            text-align: center;
            border-bottom: 3px solid var(--primary-gold);
            position: relative;
            overflow: hidden;
        }

        .lesson-header::before {
            content: '''';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,189,89,0.1) 0%, transparent 50%);
            animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--success-green) 0%, #059669 100%);
            color: white;
            padding: 0.5rem 1.25rem;
            border-radius: 25px;
            font-size: 0.85rem;
            font-weight: 700;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .lesson-header h1 {
            font-size: clamp(1.5rem, 5vw, 2rem);
            font-weight: 700;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        .lesson-header p {
            color: var(--text-secondary);
            font-size: 1rem;
            position: relative;
            z-index: 1;
        }

        .content-section {
            padding: 0;
        }

        @media (min-width: 600px) {
            .content-section {
                padding: 1.5rem;
            }
        }

        .content-card {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin-bottom: 1px;
            border-left: 4px solid var(--primary-gold);
        }

        @media (min-width: 600px) {
            .content-card {
                border-radius: 16px;
                padding: 2rem;
                margin-bottom: 1.5rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--primary-gold);
            }
        }

        .content-card h2 {
            font-size: 1.35rem;
            font-weight: 700;
            margin-bottom: 1.25rem;
            color: var(--primary-gold);
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .content-card h2 .icon {
            font-size: 1.5rem;
        }

        .content-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 1.5rem 0 1rem 0;
            color: var(--accent-cyan);
        }

        .content-card p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
            font-size: 1rem;
            line-height: 1.8;
        }

        .content-card ul, .content-card ol {
            margin: 1rem 0;
            padding-left: 1.5rem;
            color: var(--text-secondary);
        }

        .content-card li {
            margin-bottom: 0.75rem;
            line-height: 1.7;
        }

        .highlight-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1.25rem 0;
        }

        .highlight-box.cyan {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(0, 240, 255, 0.05) 100%);
            border-color: rgba(0, 240, 255, 0.3);
        }

        .highlight-box.purple {
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.15) 0%, rgba(106, 91, 255, 0.05) 100%);
            border-color: rgba(106, 91, 255, 0.3);
        }

        .highlight-box.green {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .highlight-box p {
            margin: 0;
            color: var(--text-primary);
        }

        .image-placeholder {
            background: linear-gradient(145deg, #1a2235 0%, #0d1321 100%);
            border: 2px dashed rgba(255, 189, 89, 0.4);
            border-radius: 12px;
            padding: 1rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        .image-placeholder img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin-bottom: 0.75rem;
        }

        .image-placeholder p {
            font-size: 0.85rem;
            color: var(--primary-gold);
            margin: 0;
            font-style: italic;
        }

        .congrats-banner {
            background: linear-gradient(135deg, var(--primary-gold) 0%, #FFD700 100%);
            color: var(--primary-navy);
            padding: 2rem;
            text-align: center;
            margin: 0 0 1px 0;
        }

        @media (min-width: 600px) {
            .congrats-banner {
                border-radius: 16px;
                margin: 0 0 1.5rem 0;
            }
        }

        .congrats-banner .emoji {
            font-size: 3rem;
            margin-bottom: 1rem;
        }

        .congrats-banner h2 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            color: var(--primary-navy);
        }

        .congrats-banner p {
            color: var(--primary-navy);
            opacity: 0.8;
            margin: 0;
        }

        .path-card {
            background: linear-gradient(135deg, var(--bg-card-hover) 0%, var(--bg-card) 100%);
            border: 2px solid var(--border-color);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1rem 0;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .path-card:hover {
            border-color: var(--primary-gold);
            transform: translateY(-2px);
        }

        .path-card .path-number {
            position: absolute;
            top: 1rem;
            right: 1rem;
            width: 40px;
            height: 40px;
            background: var(--primary-gold);
            color: var(--primary-navy);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.25rem;
        }

        .path-card h4 {
            font-size: 1.15rem;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }

        .path-card .subtitle {
            color: var(--accent-cyan);
            font-size: 0.9rem;
            margin-bottom: 1rem;
        }

        .path-card p {
            color: var(--text-secondary);
            font-size: 0.95rem;
            margin-bottom: 1rem;
        }

        .path-card .cta-btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, var(--primary-gold) 0%, #FFD700 100%);
            color: var(--primary-navy);
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            cursor: pointer;
            border: none;
        }

        .path-card .cta-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(255, 189, 89, 0.3);
        }

        .path-card .cta-btn.secondary {
            background: transparent;
            border: 2px solid var(--primary-gold);
            color: var(--primary-gold);
        }

        .action-step {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            padding: 1rem 0;
            border-bottom: 1px solid var(--border-color);
        }

        .action-step:last-child {
            border-bottom: none;
        }

        .action-step .step-num {
            width: 2.5rem;
            height: 2.5rem;
            background: var(--primary-gold);
            color: var(--primary-navy);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            flex-shrink: 0;
        }

        .action-step .step-content h4 {
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .action-step .step-content p {
            color: var(--text-secondary);
            font-size: 0.9rem;
            margin: 0;
        }

        .resource-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1px;
            background: var(--border-color);
            margin: 1.5rem 0;
        }

        @media (min-width: 600px) {
            .resource-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                background: transparent;
            }
        }

        .resource-item {
            background: var(--bg-card-hover);
            padding: 1.25rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        @media (min-width: 600px) {
            .resource-item {
                border-radius: 12px;
                border: 1px solid var(--border-color);
            }
        }

        .resource-item .icon {
            font-size: 2rem;
        }

        .resource-item .info h4 {
            color: var(--text-primary);
            font-size: 1rem;
            margin-bottom: 0.25rem;
        }

        .resource-item .info p {
            color: var(--text-secondary);
            font-size: 0.85rem;
            margin: 0;
        }

        .final-message {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            border: 2px solid var(--primary-gold);
            border-radius: 0;
            padding: 2rem 1.5rem;
            text-align: center;
            margin: 0;
        }

        @media (min-width: 600px) {
            .final-message {
                border-radius: 16px;
                margin: 1.5rem;
            }
        }

        .final-message .quote {
            font-size: 1.25rem;
            font-style: italic;
            color: var(--text-primary);
            margin-bottom: 1rem;
            line-height: 1.6;
        }

        .final-message .author {
            color: var(--primary-gold);
            font-weight: 600;
        }

        .summary-box {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            border: 2px solid var(--success-green);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin: 0;
        }

        @media (min-width: 600px) {
            .summary-box {
                border-radius: 16px;
                padding: 2rem;
                margin: 1.5rem;
            }
        }

        .summary-box h3 {
            color: var(--success-green);
            font-size: 1.25rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding: 0;
        }

        .summary-box li {
            padding: 0.5rem 0;
            padding-left: 1.75rem;
            position: relative;
            color: var(--text-primary);
        }

        .summary-box li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-weight: 700;
        }

        .quiz-section {
            padding: 0;
        }

        @media (min-width: 600px) {
            .quiz-section {
                padding: 1.5rem;
            }
        }

        .quiz-container {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            border-left: 4px solid var(--accent-purple);
        }

        @media (min-width: 600px) {
            .quiz-container {
                border-radius: 16px;
                padding: 2rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--accent-purple);
            }
        }

        .quiz-container h2 {
            color: var(--accent-purple);
            font-size: 1.35rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .quiz-question {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1.25rem;
            border: 1px solid var(--border-color);
        }

        .quiz-question p {
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.875rem 1rem;
            margin-bottom: 0.5rem;
            background: var(--bg-card);
            border: 2px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
            font-size: 0.95rem;
        }

        .quiz-option:hover:not(:disabled) {
            border-color: var(--accent-purple);
            background: rgba(106, 91, 255, 0.1);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--success-green);
            color: var(--success-green);
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: var(--error-red);
            color: var(--error-red);
        }

        .quiz-result {
            padding: 0.75rem;
            border-radius: 8px;
            margin-top: 0.75rem;
            font-weight: 600;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success-green);
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.2);
            color: var(--error-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score h3 {
            color: var(--success-green);
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
        }

        .quiz-score p {
            color: var(--text-secondary);
        }

        .retake-btn {
            display: inline-block;
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--accent-purple) 0%, #5346E0 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .retake-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(106, 91, 255, 0.4);
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            background: var(--bg-card);
            border-top: 1px solid var(--border-color);
        }

        .lesson-footer p {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .lesson-footer .brand {
            color: var(--primary-gold);
            font-weight: 700;
        }

        .completion-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--success-green) 0%, #059669 100%);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <div class="header-badge">🎓 Bài Cuối - TIER 1</div>
            <h1>Các Bước Tiếp Theo</h1>
            <p>Chúc mừng! Bạn đã hoàn thành TIER 1 - Bây giờ hãy hành động!</p>
        </header>

        <section class="content-section">
            <div class="congrats-banner">
                <div class="emoji">🎉</div>
                <h2>Chúc Mừng Bạn!</h2>
                <p>Bạn đã hoàn thành toàn bộ TIER 1 - GEM Trading Academy</p>
            </div>

            <div class="content-card">
                <h2><span class="icon">🏆</span> Những Gì Bạn Đã Đạt Được</h2>

                <p>Hãy tự hào về hành trình bạn đã đi qua. Trong TIER 1, bạn đã học:</p>

                <ul>
                    <li><strong>Nền tảng Pattern Frequency:</strong> Hiểu về HFZ, LFZ và cách thị trường vận động</li>
                    <li><strong>4 Patterns cơ bản:</strong> UPU, UPD, DPU, DPD - những công cụ trading chính</li>
                    <li><strong>6 Classic Patterns:</strong> Double Top/Bottom, Head & Shoulders, Flags...</li>
                    <li><strong>Paper Trading:</strong> Cách thực hành không rủi ro</li>
                    <li><strong>GEM Master AI:</strong> Sử dụng công cụ hỗ trợ thông minh</li>
                    <li><strong>Mindset Trading:</strong> Tư duy đúng để thành công lâu dài</li>
                </ul>

                <div class="highlight-box green">
                    <p><strong>📊 Thống kê:</strong> Bạn đã hoàn thành <strong>45 bài học</strong>, sẵn sàng để bước vào thực hành thực tế!</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/10B981/FFFFFF?text=TIER+1+Complete!" alt="TIER 1 Complete">
                    <p>📸 Chứng nhận hoàn thành TIER 1</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🛤️</span> 3 Con Đường Phía Trước</h2>

                <p>Bạn có 3 lựa chọn để tiếp tục hành trình:</p>

                <div class="path-card">
                    <div class="path-number">1</div>
                    <h4>Tiếp Tục Luyện Tập Với TIER 1</h4>
                    <div class="subtitle">Dành cho bạn muốn củng cố nền tảng</div>
                    <p>Paper trade thêm 2-3 tháng, ôn lại các bài học, đảm bảo nắm vững 100% kiến thức trước khi đi tiếp.</p>
                    <button class="cta-btn secondary">Ôn lại từ đầu</button>
                </div>

                <div class="path-card">
                    <div class="path-number">2</div>
                    <h4>Upgrade Lên TIER 2</h4>
                    <div class="subtitle">Dành cho bạn muốn đi sâu & trade chuyên nghiệp</div>
                    <p>Học thêm 20+ patterns nâng cao, multi-timeframe analysis, position sizing pro, và live trading strategies.</p>
                    <button class="cta-btn">Xem TIER 2 →</button>
                </div>

                <div class="path-card">
                    <div class="path-number">3</div>
                    <h4>Trở Thành Đối Tác GEM</h4>
                    <div class="subtitle">Dành cho bạn muốn kiếm thêm thu nhập</div>
                    <p>Chia sẻ kiến thức, giúp người khác, và nhận hoa hồng 10-30% (sản phẩm số) theo hệ thống CTV 5 tier.</p>
                    <button class="cta-btn secondary">Tìm hiểu Affiliate →</button>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/FFBD59?text=3+Paths+Forward" alt="3 Paths Forward">
                    <p>📸 Ba con đường để tiếp tục</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📝</span> Checklist Hành Động Ngay</h2>

                <p>Dù bạn chọn con đường nào, hãy thực hiện các bước sau trong <strong>7 ngày tới</strong>:</p>

                <div class="action-step">
                    <div class="step-num">1</div>
                    <div class="step-content">
                        <h4>Mở TradingView / Binance Chart</h4>
                        <p>Bắt đầu quan sát chart thực tế, tìm các patterns đã học</p>
                    </div>
                </div>

                <div class="action-step">
                    <div class="step-num">2</div>
                    <div class="step-content">
                        <h4>Paper Trade Ít Nhất 5 Lệnh</h4>
                        <p>Ghi chép đầy đủ: Entry, SL, TP, lý do vào lệnh, kết quả</p>
                    </div>
                </div>

                <div class="action-step">
                    <div class="step-num">3</div>
                    <div class="step-content">
                        <h4>Sử Dụng GEM Master AI</h4>
                        <p>Hỏi ít nhất 5 câu hỏi về patterns hoặc setups bạn thấy</p>
                    </div>
                </div>

                <div class="action-step">
                    <div class="step-num">4</div>
                    <div class="step-content">
                        <h4>Tạo Trading Journal</h4>
                        <p>Bắt đầu ghi chép hành trình, dù chỉ là paper trade</p>
                    </div>
                </div>

                <div class="action-step">
                    <div class="step-num">5</div>
                    <div class="step-content">
                        <h4>Quyết Định Bước Tiếp Theo</h4>
                        <p>Dựa trên Khung Quyết Định (Bài 10.6), chọn con đường phù hợp</p>
                    </div>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📚</span> Tài Nguyên Hỗ Trợ</h2>

                <p>Bạn có thể truy cập các tài nguyên sau để hỗ trợ hành trình:</p>

                <div class="resource-grid">
                    <div class="resource-item">
                        <div class="icon">🤖</div>
                        <div class="info">
                            <h4>GEM Master AI</h4>
                            <p>Hỏi đáp trading 24/7</p>
                        </div>
                    </div>
                    <div class="resource-item">
                        <div class="icon">📊</div>
                        <div class="info">
                            <h4>Pattern Scanner</h4>
                            <p>Quét pattern tự động</p>
                        </div>
                    </div>
                    <div class="resource-item">
                        <div class="icon">💬</div>
                        <div class="info">
                            <h4>Community Forum</h4>
                            <p>Thảo luận với học viên khác</p>
                        </div>
                    </div>
                    <div class="resource-item">
                        <div class="icon">📖</div>
                        <div class="info">
                            <h4>Help Center</h4>
                            <p>Hướng dẫn và FAQ</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x300/0A0E17/00F0FF?text=Support+Resources" alt="Support Resources">
                    <p>📸 Các tài nguyên hỗ trợ học viên</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">💡</span> Lời Khuyên Cuối</h2>

                <h3>1. Đừng vội vàng trade tiền thật</h3>
                <p>Paper trade đủ 50-100 lệnh trước. Kiên nhẫn là chìa khóa thành công.</p>

                <h3>2. Học không bao giờ dừng</h3>
                <p>Dù bạn ở level nào, luôn có thứ mới để học. Thị trường thay đổi, bạn cũng phải adapt.</p>

                <h3>3. Tập trung vào quá trình, không phải kết quả</h3>
                <p>Nếu bạn trade đúng process, kết quả sẽ đến. Đừng để 1-2 lệnh thua làm bạn nản.</p>

                <h3>4. Xây dựng cộng đồng</h3>
                <p>Kết nối với học viên khác, chia sẻ kinh nghiệm, học hỏi lẫn nhau.</p>

                <div class="highlight-box purple">
                    <p><strong>🎯 Nhớ rằng:</strong> Trading là marathon, không phải sprint. Những người thành công là những người kiên trì đủ lâu.</p>
                </div>
            </div>

            <div class="final-message">
                <div class="quote">"Con đường vạn dặm bắt đầu từ một bước chân. Bạn đã hoàn thành những bước đầu tiên. Hãy tiếp tục bước đi."</div>
                <div class="author">— GEM Trading Academy</div>
                <div class="completion-badge">🎓 TIER 1 Graduate</div>
            </div>

            <div class="summary-box">
                <h3>🎓 Tổng Kết TIER 1</h3>
                <ul>
                    <li>Bạn đã hoàn thành 45 bài học về Pattern Frequency Trading</li>
                    <li>Nắm vững 4 patterns cơ bản + 6 classic patterns</li>
                    <li>Hiểu cách paper trade, sử dụng AI, và xây dựng mindset</li>
                    <li>Có 3 lựa chọn: Củng cố TIER 1, Upgrade TIER 2, hoặc làm Đối Tác</li>
                    <li>Hành động ngay: Paper trade, sử dụng tools, và quyết định bước tiếp</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-container">
                <h2><span class="icon">❓</span> Quiz Cuối Cùng</h2>

                <div class="quiz-question" data-correct="1">
                    <p>1. Sau khi hoàn thành TIER 1, bạn nên làm gì đầu tiên?</p>
                    <button class="quiz-option" data-index="0">A. Trade tiền thật ngay lập tức</button>
                    <button class="quiz-option" data-index="1">B. Paper trade để củng cố kiến thức trước</button>
                    <button class="quiz-option" data-index="2">C. Bỏ qua và chuyển sang học thứ khác</button>
                    <button class="quiz-option" data-index="3">D. Nghỉ ngơi vài tháng rồi mới tiếp tục</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <p>2. 3 con đường sau TIER 1 là gì?</p>
                    <button class="quiz-option" data-index="0">A. Trade thật, nghỉ ngơi, hoặc bỏ cuộc</button>
                    <button class="quiz-option" data-index="1">B. Học sách, xem video, hoặc tự nghiên cứu</button>
                    <button class="quiz-option" data-index="2">C. Củng cố TIER 1, Upgrade TIER 2, hoặc làm Đối Tác</button>
                    <button class="quiz-option" data-index="3">D. Chỉ có 1 đường duy nhất</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <p>3. Điều quan trọng nhất để thành công trong trading là gì?</p>
                    <button class="quiz-option" data-index="0">A. Kiên trì và tuân thủ process</button>
                    <button class="quiz-option" data-index="1">B. Có nhiều vốn</button>
                    <button class="quiz-option" data-index="2">C. May mắn</button>
                    <button class="quiz-option" data-index="3">D. Trade thật nhiều lệnh mỗi ngày</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🎉 Chúc Mừng! Bạn Đã Hoàn Thành TIER 1!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <p style="margin-top: 1rem; color: var(--success-green);">Chúc bạn thành công trong hành trình trading!</p>
                    <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>🎓 Bạn đã hoàn thành <span class="brand">TIER 1 - GEM Trading Academy</span></p>
            <p>© 2024 - Nền tảng đào tạo trading chuyên nghiệp</p>
            <p style="margin-top: 1rem; color: var(--primary-gold);">Hẹn gặp lại ở TIER 2! 🚀</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 3;
        let answeredCount = 0;
        let correctCount = 0;

        document.querySelectorAll(''.quiz-question'').forEach(question => {
            const correctIndex = parseInt(question.dataset.correct);
            const options = question.querySelectorAll(''.quiz-option'');
            const result = question.querySelector(''.quiz-result'');

            options.forEach(option => {
                option.addEventListener(''click'', function() {
                    if (question.classList.contains(''answered'')) return;

                    question.classList.add(''answered'');
                    answeredCount++;

                    const selectedIndex = parseInt(this.dataset.index);

                    if (selectedIndex === correctIndex) {
                        this.classList.add(''correct'');
                        result.textContent = ''✓ Chính xác! Bạn đã sẵn sàng cho bước tiếp theo.'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Xem lại đáp án đúng được highlight.'';
                        result.className = ''quiz-result show incorrect'';
                    }

                    if (answeredCount === totalQuestions) {
                        document.getElementById(''correct-count'').textContent = correctCount;
                        document.querySelector(''.quiz-score'').classList.add(''show'');
                    }
                });
            });
        });
    </script>
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
