-- =====================================================
-- TIER-1 - Chương 8: GEM Master AI
-- Course: course-tier1-trading-foundation
-- File 6/23
-- =====================================================

-- Create/Update Module
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  'module-tier-1-ch8',
  'course-tier1-trading-foundation',
  'Chương 8: GEM Master AI',
  'Sử dụng AI trong trading',
  8,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Lesson 8.1: Giới Thiệu GEM Master AI - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch8-l1',
  'module-tier-1-ch8',
  'course-tier1-trading-foundation',
  'Bài 8.1: Giới Thiệu GEM Master AI - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 8.1: Giới Thiệu GEM Master AI - GEM Trading Academy</title>
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

        .feature-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .feature-grid {
                grid-template-columns: 1fr;
                gap: 8px;
            }
        }

        .feature-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.2rem;
            border: 1px solid var(--border-color);
            text-align: center;
        }

        .feature-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        .feature-title {
            color: var(--accent-cyan);
            font-weight: 600;
            margin-bottom: 0.3rem;
        }

        .feature-desc {
            font-size: 0.85rem;
            color: var(--text-muted);
        }

        .steps-list {
            list-style: none;
            counter-reset: step-counter;
        }

        .steps-list li {
            counter-increment: step-counter;
            padding: 1rem;
            padding-left: 3.5rem;
            position: relative;
            margin-bottom: 0.5rem;
            background: var(--bg-secondary);
            border-radius: 10px;
            color: var(--text-secondary);
        }

        .steps-list li::before {
            content: counter(step-counter);
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            width: 28px;
            height: 28px;
            background: var(--accent-purple);
            color: var(--bg-primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.9rem;
        }

        @media (max-width: 600px) {
            .steps-list li {
                border-radius: 8px;
                padding: 0.8rem;
                padding-left: 3rem;
            }
            .steps-list li::before {
                width: 24px;
                height: 24px;
                font-size: 0.8rem;
                left: 0.8rem;
            }
        }

        .tier-comparison {
            background: var(--bg-secondary);
            border-radius: 12px;
            overflow: hidden;
            margin: 1rem 0;
        }

        .tier-row {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            border-bottom: 1px solid var(--border-color);
        }

        .tier-row:last-child { border-bottom: none; }

        .tier-cell {
            padding: 0.8rem;
            text-align: center;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .tier-cell.header {
            background: var(--bg-card);
            color: var(--accent-gold);
            font-weight: 600;
        }

        .tier-cell.feature {
            text-align: left;
            color: var(--text-primary);
        }

        .tier-cell .check { color: var(--accent-green); }
        .tier-cell .cross { color: var(--accent-red); }

        @media (max-width: 600px) {
            .tier-row {
                grid-template-columns: 1.5fr 1fr 1fr 1fr;
            }
            .tier-cell {
                padding: 0.6rem 0.3rem;
                font-size: 0.75rem;
            }
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

        .quiz-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                border: none;
                border-top: 1px solid var(--border-color);
                padding: 1rem;
                margin-top: 8px;
            }
        }

        .quiz-title {
            font-size: 1.3rem;
            color: var(--accent-cyan);
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.2rem;
            margin-bottom: 1rem;
        }

        @media (max-width: 600px) {
            .quiz-question {
                border-radius: 8px;
                padding: 1rem;
            }
        }

        .question-text {
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.8rem 1rem;
            margin-bottom: 0.5rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }

        .quiz-option:hover {
            border-color: var(--accent-cyan);
            background: var(--accent-cyan-dim);
        }

        .quiz-option.correct {
            border-color: var(--accent-green);
            background: var(--accent-green-dim);
            color: var(--accent-green);
        }

        .quiz-option.incorrect {
            border-color: var(--accent-red);
            background: var(--accent-red-dim);
            color: var(--accent-red);
        }

        .quiz-result {
            margin-top: 0.5rem;
            padding: 0.5rem;
            border-radius: 6px;
            font-size: 0.9rem;
            display: none;
        }

        .quiz-result.show { display: block; }

        .quiz-result.correct {
            background: var(--accent-green-dim);
            color: var(--accent-green);
        }

        .quiz-result.incorrect {
            background: var(--accent-red-dim);
            color: var(--accent-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show { display: block; }

        .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-purple);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.8rem 2rem;
            background: var(--accent-purple);
            color: var(--text-primary);
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
        }

        .retake-btn:hover {
            opacity: 0.9;
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
            <span class="lesson-badge">CHƯƠNG 8 - BÀI 1/5</span>
            <h1>Giới Thiệu GEM Master AI</h1>
            <p>Trợ lý AI thông minh cho trader</p>
        </header>

        <section class="section">
            <h2 class="section-title"><span class="icon">🤖</span> GEM Master AI Là Gì?</h2>
            <p class="content-text">
                <strong>GEM Master AI</strong> là hệ thống trí tuệ nhân tạo được thiết kế riêng cho cộng đồng GEM,
                kết hợp giữa <strong>chatbot hỏi đáp thông minh</strong> và <strong>scanner quét pattern tự động</strong>.
            </p>

            <div class="highlight-box purple">
                <div class="highlight-title">💡 Mục Đích Chính</div>
                <p class="content-text">
                    Giúp bạn tiết kiệm thời gian phân tích, tìm kiếm cơ hội giao dịch nhanh chóng,
                    và học hỏi kiến thức trading 24/7 mà không cần chờ đợi.
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/6A5BFF?text=GEM+Master+AI+Interface" alt="GEM Master AI Interface">
                <p class="image-caption">Hình 8.1.1: Giao diện GEM Master AI trên ứng dụng</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">⚡</span> 4 Tính Năng Chính</h2>

            <div class="feature-grid">
                <div class="feature-card">
                    <div class="feature-icon">💬</div>
                    <div class="feature-title">Chatbot Hỏi Đáp</div>
                    <div class="feature-desc">Hỏi bất kỳ câu hỏi nào về trading, patterns, chiến lược</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔍</div>
                    <div class="feature-title">Scanner Patterns</div>
                    <div class="feature-desc">Quét tự động tìm patterns đang hình thành</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔔</div>
                    <div class="feature-title">Cảnh Báo Thông Minh</div>
                    <div class="feature-desc">Nhận thông báo khi pattern xuất hiện</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <div class="feature-title">Phân Tích Nhanh</div>
                    <div class="feature-desc">Đánh giá setup nhanh chóng, chính xác</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/00F0FF?text=4+Main+Features+Overview" alt="4 tính năng chính">
                <p class="image-caption">Hình 8.1.2: Tổng quan 4 tính năng chính của GEM Master AI</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📱</span> Cách Truy Cập GEM Master AI</h2>
            <p class="content-text">
                Truy cập GEM Master AI rất đơn giản từ ứng dụng GEM:
            </p>

            <ol class="steps-list">
                <li>
                    <strong>Mở ứng dụng GEM</strong><br>
                    Đảm bảo bạn đã đăng nhập vào tài khoản
                </li>
                <li>
                    <strong>Nhấn tab "GEM Master"</strong><br>
                    Icon hình robot ở thanh menu phía dưới
                </li>
                <li>
                    <strong>Chọn tính năng</strong><br>
                    Chat: Hỏi đáp | Scanner: Quét pattern | Alerts: Cảnh báo
                </li>
                <li>
                    <strong>Bắt đầu sử dụng</strong><br>
                    Gõ câu hỏi hoặc chọn coin để quét
                </li>
            </ol>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/FFBD59?text=Access+GEM+Master+AI+Steps" alt="Các bước truy cập">
                <p class="image-caption">Hình 8.1.3: Hướng dẫn truy cập GEM Master AI trong app</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📋</span> Giới Hạn Theo TIER</h2>
            <p class="content-text">
                GEM Master AI có các tính năng khác nhau tùy theo cấp độ TIER của bạn:
            </p>

            <div class="tier-comparison">
                <div class="tier-row">
                    <div class="tier-cell header">Tính Năng</div>
                    <div class="tier-cell header">TIER 1</div>
                    <div class="tier-cell header">TIER 2</div>
                    <div class="tier-cell header">TIER 3</div>
                </div>
                <div class="tier-row">
                    <div class="tier-cell feature">Chatbot Hỏi Đáp</div>
                    <div class="tier-cell"><span class="check">✓</span> 20/ngày</div>
                    <div class="tier-cell"><span class="check">✓</span> 100/ngày</div>
                    <div class="tier-cell"><span class="check">✓</span> Unlimited</div>
                </div>
                <div class="tier-row">
                    <div class="tier-cell feature">Scanner Quét</div>
                    <div class="tier-cell"><span class="check">✓</span> 50/ngày</div>
                    <div class="tier-cell"><span class="check">✓</span> 200/ngày</div>
                    <div class="tier-cell"><span class="check">✓</span> Unlimited</div>
                </div>
                <div class="tier-row">
                    <div class="tier-cell feature">Số Coins</div>
                    <div class="tier-cell">50 coins</div>
                    <div class="tier-cell">150 coins</div>
                    <div class="tier-cell">All coins</div>
                </div>
                <div class="tier-row">
                    <div class="tier-cell feature">Timeframes</div>
                    <div class="tier-cell">1 TF</div>
                    <div class="tier-cell">3 TFs</div>
                    <div class="tier-cell">All TFs</div>
                </div>
                <div class="tier-row">
                    <div class="tier-cell feature">Cảnh Báo</div>
                    <div class="tier-cell">10 alerts</div>
                    <div class="tier-cell">50 alerts</div>
                    <div class="tier-cell">Unlimited</div>
                </div>
            </div>

            <div class="highlight-box gold">
                <div class="highlight-title">💡 TIER 1 Đủ Để Bắt Đầu!</div>
                <p class="content-text">
                    Với 50 lần quét/ngày và 20 câu hỏi, bạn hoàn toàn có thể học và thực hành hiệu quả.
                    Chỉ nâng cấp khi bạn cần nhiều hơn.
                </p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🎯</span> Lợi Ích Khi Sử Dụng</h2>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Tiết Kiệm Thời Gian</div>
                <p class="content-text">
                    Thay vì ngồi xem từng chart, AI quét hàng trăm coins trong vài giây và báo cáo
                    những cơ hội tiềm năng nhất.
                </p>
            </div>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Học Liên Tục 24/7</div>
                <p class="content-text">
                    Chatbot sẵn sàng trả lời mọi câu hỏi về patterns, chiến lược, quản lý vốn
                    bất kỳ lúc nào bạn cần.
                </p>
            </div>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Không Bỏ Lỡ Cơ Hội</div>
                <p class="content-text">
                    Hệ thống cảnh báo thông báo ngay khi pattern xuất hiện, ngay cả khi bạn
                    không online.
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x300/112250/10B981?text=Benefits+of+GEM+Master+AI" alt="Lợi ích sử dụng">
                <p class="image-caption">Hình 8.1.4: Các lợi ích chính khi sử dụng GEM Master AI</p>
            </div>
        </section>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 8.1</h3>
            <ul class="summary-list">
                <li>GEM Master AI là trợ lý AI với chatbot hỏi đáp và scanner patterns</li>
                <li>4 tính năng chính: Chat, Scanner, Alerts, Phân tích nhanh</li>
                <li>Truy cập qua tab "GEM Master" trong ứng dụng</li>
                <li>TIER 1 có giới hạn: 50 quét/ngày, 20 câu hỏi, 10 cảnh báo</li>
                <li>Giúp tiết kiệm thời gian và không bỏ lỡ cơ hội</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title"><span class="icon">❓</span> Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. GEM Master AI có bao nhiêu tính năng chính?</p>
                <button class="quiz-option" data-index="0">A. 2 tính năng</button>
                <button class="quiz-option" data-index="1">B. 4 tính năng</button>
                <button class="quiz-option" data-index="2">C. 6 tính năng</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">2. TIER 1 được phép quét bao nhiêu lần/ngày?</p>
                <button class="quiz-option" data-index="0">A. 50 lần</button>
                <button class="quiz-option" data-index="1">B. 100 lần</button>
                <button class="quiz-option" data-index="2">C. Unlimited</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Bạn trả lời đúng <span id="correct-count">0</span>/2 câu!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Bài 8.1: Giới Thiệu GEM Master AI</p>
            <p>Tiếp theo: Bài 8.2 - Sử Dụng Chatbot Hỏi Đáp</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 2;
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
                        result.textContent = ''✓ Chính xác!'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng. Xem đáp án đúng ở trên.'';
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
    <title>Bài 8.1: Giới Thiệu GEM Master AI - GEM Trading Academy</title>
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

        .feature-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .feature-grid {
                grid-template-columns: 1fr;
                gap: 8px;
            }
        }

        .feature-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.2rem;
            border: 1px solid var(--border-color);
            text-align: center;
        }

        .feature-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        .feature-title {
            color: var(--accent-cyan);
            font-weight: 600;
            margin-bottom: 0.3rem;
        }

        .feature-desc {
            font-size: 0.85rem;
            color: var(--text-muted);
        }

        .steps-list {
            list-style: none;
            counter-reset: step-counter;
        }

        .steps-list li {
            counter-increment: step-counter;
            padding: 1rem;
            padding-left: 3.5rem;
            position: relative;
            margin-bottom: 0.5rem;
            background: var(--bg-secondary);
            border-radius: 10px;
            color: var(--text-secondary);
        }

        .steps-list li::before {
            content: counter(step-counter);
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            width: 28px;
            height: 28px;
            background: var(--accent-purple);
            color: var(--bg-primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.9rem;
        }

        @media (max-width: 600px) {
            .steps-list li {
                border-radius: 8px;
                padding: 0.8rem;
                padding-left: 3rem;
            }
            .steps-list li::before {
                width: 24px;
                height: 24px;
                font-size: 0.8rem;
                left: 0.8rem;
            }
        }

        .tier-comparison {
            background: var(--bg-secondary);
            border-radius: 12px;
            overflow: hidden;
            margin: 1rem 0;
        }

        .tier-row {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            border-bottom: 1px solid var(--border-color);
        }

        .tier-row:last-child { border-bottom: none; }

        .tier-cell {
            padding: 0.8rem;
            text-align: center;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .tier-cell.header {
            background: var(--bg-card);
            color: var(--accent-gold);
            font-weight: 600;
        }

        .tier-cell.feature {
            text-align: left;
            color: var(--text-primary);
        }

        .tier-cell .check { color: var(--accent-green); }
        .tier-cell .cross { color: var(--accent-red); }

        @media (max-width: 600px) {
            .tier-row {
                grid-template-columns: 1.5fr 1fr 1fr 1fr;
            }
            .tier-cell {
                padding: 0.6rem 0.3rem;
                font-size: 0.75rem;
            }
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

        .quiz-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                border: none;
                border-top: 1px solid var(--border-color);
                padding: 1rem;
                margin-top: 8px;
            }
        }

        .quiz-title {
            font-size: 1.3rem;
            color: var(--accent-cyan);
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.2rem;
            margin-bottom: 1rem;
        }

        @media (max-width: 600px) {
            .quiz-question {
                border-radius: 8px;
                padding: 1rem;
            }
        }

        .question-text {
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.8rem 1rem;
            margin-bottom: 0.5rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }

        .quiz-option:hover {
            border-color: var(--accent-cyan);
            background: var(--accent-cyan-dim);
        }

        .quiz-option.correct {
            border-color: var(--accent-green);
            background: var(--accent-green-dim);
            color: var(--accent-green);
        }

        .quiz-option.incorrect {
            border-color: var(--accent-red);
            background: var(--accent-red-dim);
            color: var(--accent-red);
        }

        .quiz-result {
            margin-top: 0.5rem;
            padding: 0.5rem;
            border-radius: 6px;
            font-size: 0.9rem;
            display: none;
        }

        .quiz-result.show { display: block; }

        .quiz-result.correct {
            background: var(--accent-green-dim);
            color: var(--accent-green);
        }

        .quiz-result.incorrect {
            background: var(--accent-red-dim);
            color: var(--accent-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show { display: block; }

        .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-purple);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.8rem 2rem;
            background: var(--accent-purple);
            color: var(--text-primary);
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
        }

        .retake-btn:hover {
            opacity: 0.9;
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
            <span class="lesson-badge">CHƯƠNG 8 - BÀI 1/5</span>
            <h1>Giới Thiệu GEM Master AI</h1>
            <p>Trợ lý AI thông minh cho trader</p>
        </header>

        <section class="section">
            <h2 class="section-title"><span class="icon">🤖</span> GEM Master AI Là Gì?</h2>
            <p class="content-text">
                <strong>GEM Master AI</strong> là hệ thống trí tuệ nhân tạo được thiết kế riêng cho cộng đồng GEM,
                kết hợp giữa <strong>chatbot hỏi đáp thông minh</strong> và <strong>scanner quét pattern tự động</strong>.
            </p>

            <div class="highlight-box purple">
                <div class="highlight-title">💡 Mục Đích Chính</div>
                <p class="content-text">
                    Giúp bạn tiết kiệm thời gian phân tích, tìm kiếm cơ hội giao dịch nhanh chóng,
                    và học hỏi kiến thức trading 24/7 mà không cần chờ đợi.
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/6A5BFF?text=GEM+Master+AI+Interface" alt="GEM Master AI Interface">
                <p class="image-caption">Hình 8.1.1: Giao diện GEM Master AI trên ứng dụng</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">⚡</span> 4 Tính Năng Chính</h2>

            <div class="feature-grid">
                <div class="feature-card">
                    <div class="feature-icon">💬</div>
                    <div class="feature-title">Chatbot Hỏi Đáp</div>
                    <div class="feature-desc">Hỏi bất kỳ câu hỏi nào về trading, patterns, chiến lược</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔍</div>
                    <div class="feature-title">Scanner Patterns</div>
                    <div class="feature-desc">Quét tự động tìm patterns đang hình thành</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔔</div>
                    <div class="feature-title">Cảnh Báo Thông Minh</div>
                    <div class="feature-desc">Nhận thông báo khi pattern xuất hiện</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <div class="feature-title">Phân Tích Nhanh</div>
                    <div class="feature-desc">Đánh giá setup nhanh chóng, chính xác</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/00F0FF?text=4+Main+Features+Overview" alt="4 tính năng chính">
                <p class="image-caption">Hình 8.1.2: Tổng quan 4 tính năng chính của GEM Master AI</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📱</span> Cách Truy Cập GEM Master AI</h2>
            <p class="content-text">
                Truy cập GEM Master AI rất đơn giản từ ứng dụng GEM:
            </p>

            <ol class="steps-list">
                <li>
                    <strong>Mở ứng dụng GEM</strong><br>
                    Đảm bảo bạn đã đăng nhập vào tài khoản
                </li>
                <li>
                    <strong>Nhấn tab "GEM Master"</strong><br>
                    Icon hình robot ở thanh menu phía dưới
                </li>
                <li>
                    <strong>Chọn tính năng</strong><br>
                    Chat: Hỏi đáp | Scanner: Quét pattern | Alerts: Cảnh báo
                </li>
                <li>
                    <strong>Bắt đầu sử dụng</strong><br>
                    Gõ câu hỏi hoặc chọn coin để quét
                </li>
            </ol>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/FFBD59?text=Access+GEM+Master+AI+Steps" alt="Các bước truy cập">
                <p class="image-caption">Hình 8.1.3: Hướng dẫn truy cập GEM Master AI trong app</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📋</span> Giới Hạn Theo TIER</h2>
            <p class="content-text">
                GEM Master AI có các tính năng khác nhau tùy theo cấp độ TIER của bạn:
            </p>

            <div class="tier-comparison">
                <div class="tier-row">
                    <div class="tier-cell header">Tính Năng</div>
                    <div class="tier-cell header">TIER 1</div>
                    <div class="tier-cell header">TIER 2</div>
                    <div class="tier-cell header">TIER 3</div>
                </div>
                <div class="tier-row">
                    <div class="tier-cell feature">Chatbot Hỏi Đáp</div>
                    <div class="tier-cell"><span class="check">✓</span> 20/ngày</div>
                    <div class="tier-cell"><span class="check">✓</span> 100/ngày</div>
                    <div class="tier-cell"><span class="check">✓</span> Unlimited</div>
                </div>
                <div class="tier-row">
                    <div class="tier-cell feature">Scanner Quét</div>
                    <div class="tier-cell"><span class="check">✓</span> 50/ngày</div>
                    <div class="tier-cell"><span class="check">✓</span> 200/ngày</div>
                    <div class="tier-cell"><span class="check">✓</span> Unlimited</div>
                </div>
                <div class="tier-row">
                    <div class="tier-cell feature">Số Coins</div>
                    <div class="tier-cell">50 coins</div>
                    <div class="tier-cell">150 coins</div>
                    <div class="tier-cell">All coins</div>
                </div>
                <div class="tier-row">
                    <div class="tier-cell feature">Timeframes</div>
                    <div class="tier-cell">1 TF</div>
                    <div class="tier-cell">3 TFs</div>
                    <div class="tier-cell">All TFs</div>
                </div>
                <div class="tier-row">
                    <div class="tier-cell feature">Cảnh Báo</div>
                    <div class="tier-cell">10 alerts</div>
                    <div class="tier-cell">50 alerts</div>
                    <div class="tier-cell">Unlimited</div>
                </div>
            </div>

            <div class="highlight-box gold">
                <div class="highlight-title">💡 TIER 1 Đủ Để Bắt Đầu!</div>
                <p class="content-text">
                    Với 50 lần quét/ngày và 20 câu hỏi, bạn hoàn toàn có thể học và thực hành hiệu quả.
                    Chỉ nâng cấp khi bạn cần nhiều hơn.
                </p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🎯</span> Lợi Ích Khi Sử Dụng</h2>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Tiết Kiệm Thời Gian</div>
                <p class="content-text">
                    Thay vì ngồi xem từng chart, AI quét hàng trăm coins trong vài giây và báo cáo
                    những cơ hội tiềm năng nhất.
                </p>
            </div>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Học Liên Tục 24/7</div>
                <p class="content-text">
                    Chatbot sẵn sàng trả lời mọi câu hỏi về patterns, chiến lược, quản lý vốn
                    bất kỳ lúc nào bạn cần.
                </p>
            </div>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Không Bỏ Lỡ Cơ Hội</div>
                <p class="content-text">
                    Hệ thống cảnh báo thông báo ngay khi pattern xuất hiện, ngay cả khi bạn
                    không online.
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x300/112250/10B981?text=Benefits+of+GEM+Master+AI" alt="Lợi ích sử dụng">
                <p class="image-caption">Hình 8.1.4: Các lợi ích chính khi sử dụng GEM Master AI</p>
            </div>
        </section>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 8.1</h3>
            <ul class="summary-list">
                <li>GEM Master AI là trợ lý AI với chatbot hỏi đáp và scanner patterns</li>
                <li>4 tính năng chính: Chat, Scanner, Alerts, Phân tích nhanh</li>
                <li>Truy cập qua tab "GEM Master" trong ứng dụng</li>
                <li>TIER 1 có giới hạn: 50 quét/ngày, 20 câu hỏi, 10 cảnh báo</li>
                <li>Giúp tiết kiệm thời gian và không bỏ lỡ cơ hội</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title"><span class="icon">❓</span> Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. GEM Master AI có bao nhiêu tính năng chính?</p>
                <button class="quiz-option" data-index="0">A. 2 tính năng</button>
                <button class="quiz-option" data-index="1">B. 4 tính năng</button>
                <button class="quiz-option" data-index="2">C. 6 tính năng</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">2. TIER 1 được phép quét bao nhiêu lần/ngày?</p>
                <button class="quiz-option" data-index="0">A. 50 lần</button>
                <button class="quiz-option" data-index="1">B. 100 lần</button>
                <button class="quiz-option" data-index="2">C. Unlimited</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Bạn trả lời đúng <span id="correct-count">0</span>/2 câu!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Bài 8.1: Giới Thiệu GEM Master AI</p>
            <p>Tiếp theo: Bài 8.2 - Sử Dụng Chatbot Hỏi Đáp</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 2;
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
                        result.textContent = ''✓ Chính xác!'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng. Xem đáp án đúng ở trên.'';
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

-- Lesson 8.2: Sử Dụng Chatbot Hỏi Đáp - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch8-l2',
  'module-tier-1-ch8',
  'course-tier1-trading-foundation',
  'Bài 8.2: Sử Dụng Chatbot Hỏi Đáp - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 8.2: Sử Dụng Chatbot Hỏi Đáp - GEM Trading Academy</title>
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

        .chat-example {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        .chat-message {
            display: flex;
            gap: 0.8rem;
            margin-bottom: 1rem;
        }

        .chat-message:last-child { margin-bottom: 0; }

        .chat-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            flex-shrink: 0;
        }

        .chat-avatar.user {
            background: var(--accent-gold-dim);
        }

        .chat-avatar.bot {
            background: var(--accent-purple-dim);
        }

        .chat-bubble {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 0.8rem 1rem;
            max-width: 85%;
        }

        .chat-bubble.user {
            background: var(--accent-gold-dim);
            border: 1px solid var(--accent-gold);
        }

        .chat-bubble.bot {
            border: 1px solid var(--border-color);
        }

        .chat-label {
            font-size: 0.75rem;
            color: var(--text-muted);
            margin-bottom: 0.3rem;
        }

        .chat-text {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .question-category {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1rem;
            margin: 0.5rem 0;
            border-left: 3px solid var(--accent-cyan);
        }

        .category-title {
            color: var(--accent-cyan);
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .category-examples {
            list-style: none;
            padding-left: 0;
        }

        .category-examples li {
            padding: 0.3rem 0;
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .category-examples li::before {
            content: ''"'';
            color: var(--accent-gold);
        }

        .category-examples li::after {
            content: ''"'';
            color: var(--accent-gold);
        }

        .tips-list {
            list-style: none;
        }

        .tips-list li {
            padding: 0.8rem 0;
            padding-left: 2rem;
            position: relative;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border-color);
        }

        .tips-list li:last-child {
            border-bottom: none;
        }

        .tips-list li::before {
            content: "💡";
            position: absolute;
            left: 0;
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

        .quiz-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                border: none;
                border-top: 1px solid var(--border-color);
                padding: 1rem;
                margin-top: 8px;
            }
        }

        .quiz-title {
            font-size: 1.3rem;
            color: var(--accent-cyan);
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.2rem;
            margin-bottom: 1rem;
        }

        @media (max-width: 600px) {
            .quiz-question {
                border-radius: 8px;
                padding: 1rem;
            }
        }

        .question-text {
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.8rem 1rem;
            margin-bottom: 0.5rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }

        .quiz-option:hover {
            border-color: var(--accent-cyan);
            background: var(--accent-cyan-dim);
        }

        .quiz-option.correct {
            border-color: var(--accent-green);
            background: var(--accent-green-dim);
            color: var(--accent-green);
        }

        .quiz-option.incorrect {
            border-color: var(--accent-red);
            background: var(--accent-red-dim);
            color: var(--accent-red);
        }

        .quiz-result {
            margin-top: 0.5rem;
            padding: 0.5rem;
            border-radius: 6px;
            font-size: 0.9rem;
            display: none;
        }

        .quiz-result.show { display: block; }

        .quiz-result.correct {
            background: var(--accent-green-dim);
            color: var(--accent-green);
        }

        .quiz-result.incorrect {
            background: var(--accent-red-dim);
            color: var(--accent-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show { display: block; }

        .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-purple);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.8rem 2rem;
            background: var(--accent-purple);
            color: var(--text-primary);
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
        }

        .retake-btn:hover {
            opacity: 0.9;
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
            <span class="lesson-badge">CHƯƠNG 8 - BÀI 2/5</span>
            <h1>Sử Dụng Chatbot Hỏi Đáp</h1>
            <p>Cách đặt câu hỏi hiệu quả với AI</p>
        </header>

        <section class="section">
            <h2 class="section-title"><span class="icon">💬</span> Chatbot Có Thể Giúp Gì?</h2>
            <p class="content-text">
                Chatbot GEM Master có thể trả lời mọi câu hỏi liên quan đến trading, patterns,
                và chiến lược giao dịch. Dưới đây là các loại câu hỏi bạn có thể hỏi:
            </p>

            <div class="question-category">
                <div class="category-title">📊 Về Patterns</div>
                <ul class="category-examples">
                    <li>UPU pattern là gì?</li>
                    <li>Cách vẽ LFZ cho DPU?</li>
                    <li>Khác biệt giữa UPD và UPU?</li>
                </ul>
            </div>

            <div class="question-category">
                <div class="category-title">💰 Về Quản Lý Vốn</div>
                <ul class="category-examples">
                    <li>Đặt stop loss như thế nào?</li>
                    <li>Tính position size với $500 vốn?</li>
                    <li>Risk:Reward tối thiểu nên là bao nhiêu?</li>
                </ul>
            </div>

            <div class="question-category">
                <div class="category-title">🎯 Về Chiến Lược</div>
                <ul class="category-examples">
                    <li>Khi nào nên entry?</li>
                    <li>Làm sao để tránh FOMO?</li>
                    <li>Timeframe nào phù hợp cho người mới?</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/6A5BFF?text=Chatbot+Question+Types" alt="Các loại câu hỏi">
                <p class="image-caption">Hình 8.2.1: Các loại câu hỏi chatbot có thể trả lời</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">✨</span> Cách Đặt Câu Hỏi Hiệu Quả</h2>
            <p class="content-text">
                Câu hỏi càng cụ thể, câu trả lời càng hữu ích. Dưới đây là so sánh:
            </p>

            <div class="highlight-box red">
                <div class="highlight-title">❌ Câu Hỏi Không Tốt</div>
                <p class="chat-text">"Nên mua gì?"</p>
                <p class="content-text" style="margin-top: 0.5rem; font-size: 0.85rem;">
                    → Quá chung chung, AI không biết bạn đang quan tâm coin nào, timeframe nào
                </p>
            </div>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Câu Hỏi Tốt</div>
                <p class="chat-text">"BTC đang có pattern UPU trên 4H, LFZ ở $42,000. Nên entry ở đâu và đặt SL như thế nào?"</p>
                <p class="content-text" style="margin-top: 0.5rem; font-size: 0.85rem;">
                    → Cụ thể: coin, pattern, timeframe, vùng giá → AI trả lời chính xác
                </p>
            </div>

            <ul class="tips-list">
                <li><strong>Nêu rõ coin và timeframe</strong> khi hỏi về setup cụ thể</li>
                <li><strong>Mô tả pattern đang thấy</strong> để AI xác nhận hoặc góp ý</li>
                <li><strong>Hỏi từng câu một</strong> thay vì nhiều câu trong 1 tin nhắn</li>
                <li><strong>Dùng thuật ngữ chuẩn</strong>: UPU, LFZ, HFZ, entry, SL, TP...</li>
            </ul>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📱</span> Ví Dụ Cuộc Trò Chuyện</h2>
            <p class="content-text">Đây là ví dụ một cuộc hội thoại hiệu quả với chatbot:</p>

            <div class="chat-example">
                <div class="chat-message">
                    <div class="chat-avatar user">👤</div>
                    <div class="chat-bubble user">
                        <div class="chat-label">Bạn</div>
                        <div class="chat-text">ETH đang có pattern UPU trên H4, LFZ từ $2,300-$2,350. Checklist 8 điểm đạt 7/8. Nên entry không?</div>
                    </div>
                </div>

                <div class="chat-message">
                    <div class="chat-avatar bot">🤖</div>
                    <div class="chat-bubble bot">
                        <div class="chat-label">GEM Master AI</div>
                        <div class="chat-text">
                            Setup UPU của bạn khá tốt với 7/8 checklist! Với LFZ $2,300-$2,350:<br><br>
                            📍 <strong>Entry:</strong> $2,320-$2,340 (giữa zone)<br>
                            🛑 <strong>Stop Loss:</strong> $2,280 (dưới LFZ 20-30 pips)<br>
                            🎯 <strong>TP1:</strong> $2,450 (R:R 1:2)<br>
                            🎯 <strong>TP2:</strong> $2,550 (R:R 1:3)<br><br>
                            ⚠️ Lưu ý: Chờ volume xác nhận khi giá chạm LFZ.
                        </div>
                    </div>
                </div>

                <div class="chat-message">
                    <div class="chat-avatar user">👤</div>
                    <div class="chat-bubble user">
                        <div class="chat-label">Bạn</div>
                        <div class="chat-text">Checklist thiếu điểm nào thì setup yếu nhất?</div>
                    </div>
                </div>

                <div class="chat-message">
                    <div class="chat-avatar bot">🤖</div>
                    <div class="chat-bubble bot">
                        <div class="chat-label">GEM Master AI</div>
                        <div class="chat-text">
                            Các điểm quan trọng nhất (nếu thiếu = yếu):<br><br>
                            1️⃣ <strong>Volume</strong> - Không có volume xác nhận = 50% rủi ro cao hơn<br>
                            2️⃣ <strong>Trend alignment</strong> - Ngược trend lớn = dễ false breakout<br>
                            3️⃣ <strong>Zone clarity</strong> - Zone mờ = khó xác định SL chính xác<br><br>
                            Bạn thiếu điểm nào trong 3 cái này?
                        </div>
                    </div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/00F0FF?text=Chat+Conversation+Example" alt="Ví dụ hội thoại">
                <p class="image-caption">Hình 8.2.2: Ví dụ cuộc trò chuyện hiệu quả với AI</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">⚠️</span> Những Điều AI Không Làm Được</h2>

            <div class="highlight-box red">
                <div class="highlight-title">❌ Không Đưa Ra Tín Hiệu Mua/Bán</div>
                <p class="content-text">
                    AI không nói "Mua BTC ngay!" hay "Bán ETH đi!". Quyết định cuối cùng luôn là của bạn.
                </p>
            </div>

            <div class="highlight-box red">
                <div class="highlight-title">❌ Không Dự Đoán Giá</div>
                <p class="content-text">
                    AI không biết giá sẽ lên $100,000 hay xuống $30,000. Không ai có thể dự đoán chính xác thị trường.
                </p>
            </div>

            <div class="highlight-box red">
                <div class="highlight-title">❌ Không Chịu Trách Nhiệm Kết Quả</div>
                <p class="content-text">
                    Mọi lời khuyên chỉ mang tính tham khảo. Bạn tự chịu trách nhiệm với trades của mình.
                </p>
            </div>

            <div class="highlight-box gold">
                <div class="highlight-title">💡 AI Là Công Cụ Hỗ Trợ, Không Phải Oracle</div>
                <p class="content-text">
                    Hãy sử dụng AI như một "senior trader" để hỏi ý kiến, không phải để làm theo mù quáng.
                </p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🎯</span> Câu Hỏi Mẫu Hữu Ích</h2>
            <p class="content-text">Lưu lại những câu hỏi này để dùng khi cần:</p>

            <div class="question-category">
                <div class="category-title">🔍 Xác Nhận Setup</div>
                <ul class="category-examples">
                    <li>[COIN] đang có pattern [PATTERN] trên [TF]. Checklist đạt [X/8]. Đánh giá setup này?</li>
                    <li>LFZ của [COIN] ở [GIÁ] có hợp lệ không?</li>
                </ul>
            </div>

            <div class="question-category">
                <div class="category-title">📐 Tính Toán</div>
                <ul class="category-examples">
                    <li>Với vốn $[X] và risk 2%, position size bao nhiêu nếu SL cách entry [Y]%?</li>
                    <li>R:R của setup entry [A], SL [B], TP [C] là bao nhiêu?</li>
                </ul>
            </div>

            <div class="question-category">
                <div class="category-title">📚 Học Kiến Thức</div>
                <ul class="category-examples">
                    <li>Giải thích chi tiết [PATTERN] với ví dụ cụ thể</li>
                    <li>Lỗi thường gặp khi trade [PATTERN] là gì?</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x300/112250/FFBD59?text=Useful+Question+Templates" alt="Mẫu câu hỏi hữu ích">
                <p class="image-caption">Hình 8.2.3: Các mẫu câu hỏi hữu ích nên lưu lại</p>
            </div>
        </section>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 8.2</h3>
            <ul class="summary-list">
                <li>Chatbot trả lời về patterns, quản lý vốn, chiến lược trading</li>
                <li>Câu hỏi cụ thể (coin, TF, giá) = câu trả lời hữu ích hơn</li>
                <li>Hỏi từng câu một, dùng thuật ngữ chuẩn</li>
                <li>AI không đưa tín hiệu mua/bán hay dự đoán giá</li>
                <li>Sử dụng AI như công cụ hỗ trợ, không làm theo mù quáng</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title"><span class="icon">❓</span> Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">1. Câu hỏi nào dưới đây là TỐT NHẤT để hỏi chatbot?</p>
                <button class="quiz-option" data-index="0">A. "Nên mua coin nào?"</button>
                <button class="quiz-option" data-index="1">B. "BTC có lên không?"</button>
                <button class="quiz-option" data-index="2">C. "BTC có UPU trên 4H, LFZ $42K. Entry ở đâu?"</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">2. AI chatbot KHÔNG thể làm điều gì?</p>
                <button class="quiz-option" data-index="0">A. Giải thích pattern</button>
                <button class="quiz-option" data-index="1">B. Dự đoán giá sẽ lên hay xuống</button>
                <button class="quiz-option" data-index="2">C. Tính position size</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Bạn trả lời đúng <span id="correct-count">0</span>/2 câu!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Bài 8.2: Sử Dụng Chatbot Hỏi Đáp</p>
            <p>Tiếp theo: Bài 8.3 - Scanner Cơ Bản - Tìm Patterns Tự Động</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 2;
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
                        result.textContent = ''✓ Chính xác!'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng. Xem đáp án đúng ở trên.'';
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
    <title>Bài 8.2: Sử Dụng Chatbot Hỏi Đáp - GEM Trading Academy</title>
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

        .chat-example {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        .chat-message {
            display: flex;
            gap: 0.8rem;
            margin-bottom: 1rem;
        }

        .chat-message:last-child { margin-bottom: 0; }

        .chat-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            flex-shrink: 0;
        }

        .chat-avatar.user {
            background: var(--accent-gold-dim);
        }

        .chat-avatar.bot {
            background: var(--accent-purple-dim);
        }

        .chat-bubble {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 0.8rem 1rem;
            max-width: 85%;
        }

        .chat-bubble.user {
            background: var(--accent-gold-dim);
            border: 1px solid var(--accent-gold);
        }

        .chat-bubble.bot {
            border: 1px solid var(--border-color);
        }

        .chat-label {
            font-size: 0.75rem;
            color: var(--text-muted);
            margin-bottom: 0.3rem;
        }

        .chat-text {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .question-category {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1rem;
            margin: 0.5rem 0;
            border-left: 3px solid var(--accent-cyan);
        }

        .category-title {
            color: var(--accent-cyan);
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .category-examples {
            list-style: none;
            padding-left: 0;
        }

        .category-examples li {
            padding: 0.3rem 0;
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .category-examples li::before {
            content: ''"'';
            color: var(--accent-gold);
        }

        .category-examples li::after {
            content: ''"'';
            color: var(--accent-gold);
        }

        .tips-list {
            list-style: none;
        }

        .tips-list li {
            padding: 0.8rem 0;
            padding-left: 2rem;
            position: relative;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border-color);
        }

        .tips-list li:last-child {
            border-bottom: none;
        }

        .tips-list li::before {
            content: "💡";
            position: absolute;
            left: 0;
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

        .quiz-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                border: none;
                border-top: 1px solid var(--border-color);
                padding: 1rem;
                margin-top: 8px;
            }
        }

        .quiz-title {
            font-size: 1.3rem;
            color: var(--accent-cyan);
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.2rem;
            margin-bottom: 1rem;
        }

        @media (max-width: 600px) {
            .quiz-question {
                border-radius: 8px;
                padding: 1rem;
            }
        }

        .question-text {
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.8rem 1rem;
            margin-bottom: 0.5rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }

        .quiz-option:hover {
            border-color: var(--accent-cyan);
            background: var(--accent-cyan-dim);
        }

        .quiz-option.correct {
            border-color: var(--accent-green);
            background: var(--accent-green-dim);
            color: var(--accent-green);
        }

        .quiz-option.incorrect {
            border-color: var(--accent-red);
            background: var(--accent-red-dim);
            color: var(--accent-red);
        }

        .quiz-result {
            margin-top: 0.5rem;
            padding: 0.5rem;
            border-radius: 6px;
            font-size: 0.9rem;
            display: none;
        }

        .quiz-result.show { display: block; }

        .quiz-result.correct {
            background: var(--accent-green-dim);
            color: var(--accent-green);
        }

        .quiz-result.incorrect {
            background: var(--accent-red-dim);
            color: var(--accent-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show { display: block; }

        .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-purple);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.8rem 2rem;
            background: var(--accent-purple);
            color: var(--text-primary);
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
        }

        .retake-btn:hover {
            opacity: 0.9;
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
            <span class="lesson-badge">CHƯƠNG 8 - BÀI 2/5</span>
            <h1>Sử Dụng Chatbot Hỏi Đáp</h1>
            <p>Cách đặt câu hỏi hiệu quả với AI</p>
        </header>

        <section class="section">
            <h2 class="section-title"><span class="icon">💬</span> Chatbot Có Thể Giúp Gì?</h2>
            <p class="content-text">
                Chatbot GEM Master có thể trả lời mọi câu hỏi liên quan đến trading, patterns,
                và chiến lược giao dịch. Dưới đây là các loại câu hỏi bạn có thể hỏi:
            </p>

            <div class="question-category">
                <div class="category-title">📊 Về Patterns</div>
                <ul class="category-examples">
                    <li>UPU pattern là gì?</li>
                    <li>Cách vẽ LFZ cho DPU?</li>
                    <li>Khác biệt giữa UPD và UPU?</li>
                </ul>
            </div>

            <div class="question-category">
                <div class="category-title">💰 Về Quản Lý Vốn</div>
                <ul class="category-examples">
                    <li>Đặt stop loss như thế nào?</li>
                    <li>Tính position size với $500 vốn?</li>
                    <li>Risk:Reward tối thiểu nên là bao nhiêu?</li>
                </ul>
            </div>

            <div class="question-category">
                <div class="category-title">🎯 Về Chiến Lược</div>
                <ul class="category-examples">
                    <li>Khi nào nên entry?</li>
                    <li>Làm sao để tránh FOMO?</li>
                    <li>Timeframe nào phù hợp cho người mới?</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/6A5BFF?text=Chatbot+Question+Types" alt="Các loại câu hỏi">
                <p class="image-caption">Hình 8.2.1: Các loại câu hỏi chatbot có thể trả lời</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">✨</span> Cách Đặt Câu Hỏi Hiệu Quả</h2>
            <p class="content-text">
                Câu hỏi càng cụ thể, câu trả lời càng hữu ích. Dưới đây là so sánh:
            </p>

            <div class="highlight-box red">
                <div class="highlight-title">❌ Câu Hỏi Không Tốt</div>
                <p class="chat-text">"Nên mua gì?"</p>
                <p class="content-text" style="margin-top: 0.5rem; font-size: 0.85rem;">
                    → Quá chung chung, AI không biết bạn đang quan tâm coin nào, timeframe nào
                </p>
            </div>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Câu Hỏi Tốt</div>
                <p class="chat-text">"BTC đang có pattern UPU trên 4H, LFZ ở $42,000. Nên entry ở đâu và đặt SL như thế nào?"</p>
                <p class="content-text" style="margin-top: 0.5rem; font-size: 0.85rem;">
                    → Cụ thể: coin, pattern, timeframe, vùng giá → AI trả lời chính xác
                </p>
            </div>

            <ul class="tips-list">
                <li><strong>Nêu rõ coin và timeframe</strong> khi hỏi về setup cụ thể</li>
                <li><strong>Mô tả pattern đang thấy</strong> để AI xác nhận hoặc góp ý</li>
                <li><strong>Hỏi từng câu một</strong> thay vì nhiều câu trong 1 tin nhắn</li>
                <li><strong>Dùng thuật ngữ chuẩn</strong>: UPU, LFZ, HFZ, entry, SL, TP...</li>
            </ul>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📱</span> Ví Dụ Cuộc Trò Chuyện</h2>
            <p class="content-text">Đây là ví dụ một cuộc hội thoại hiệu quả với chatbot:</p>

            <div class="chat-example">
                <div class="chat-message">
                    <div class="chat-avatar user">👤</div>
                    <div class="chat-bubble user">
                        <div class="chat-label">Bạn</div>
                        <div class="chat-text">ETH đang có pattern UPU trên H4, LFZ từ $2,300-$2,350. Checklist 8 điểm đạt 7/8. Nên entry không?</div>
                    </div>
                </div>

                <div class="chat-message">
                    <div class="chat-avatar bot">🤖</div>
                    <div class="chat-bubble bot">
                        <div class="chat-label">GEM Master AI</div>
                        <div class="chat-text">
                            Setup UPU của bạn khá tốt với 7/8 checklist! Với LFZ $2,300-$2,350:<br><br>
                            📍 <strong>Entry:</strong> $2,320-$2,340 (giữa zone)<br>
                            🛑 <strong>Stop Loss:</strong> $2,280 (dưới LFZ 20-30 pips)<br>
                            🎯 <strong>TP1:</strong> $2,450 (R:R 1:2)<br>
                            🎯 <strong>TP2:</strong> $2,550 (R:R 1:3)<br><br>
                            ⚠️ Lưu ý: Chờ volume xác nhận khi giá chạm LFZ.
                        </div>
                    </div>
                </div>

                <div class="chat-message">
                    <div class="chat-avatar user">👤</div>
                    <div class="chat-bubble user">
                        <div class="chat-label">Bạn</div>
                        <div class="chat-text">Checklist thiếu điểm nào thì setup yếu nhất?</div>
                    </div>
                </div>

                <div class="chat-message">
                    <div class="chat-avatar bot">🤖</div>
                    <div class="chat-bubble bot">
                        <div class="chat-label">GEM Master AI</div>
                        <div class="chat-text">
                            Các điểm quan trọng nhất (nếu thiếu = yếu):<br><br>
                            1️⃣ <strong>Volume</strong> - Không có volume xác nhận = 50% rủi ro cao hơn<br>
                            2️⃣ <strong>Trend alignment</strong> - Ngược trend lớn = dễ false breakout<br>
                            3️⃣ <strong>Zone clarity</strong> - Zone mờ = khó xác định SL chính xác<br><br>
                            Bạn thiếu điểm nào trong 3 cái này?
                        </div>
                    </div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/00F0FF?text=Chat+Conversation+Example" alt="Ví dụ hội thoại">
                <p class="image-caption">Hình 8.2.2: Ví dụ cuộc trò chuyện hiệu quả với AI</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">⚠️</span> Những Điều AI Không Làm Được</h2>

            <div class="highlight-box red">
                <div class="highlight-title">❌ Không Đưa Ra Tín Hiệu Mua/Bán</div>
                <p class="content-text">
                    AI không nói "Mua BTC ngay!" hay "Bán ETH đi!". Quyết định cuối cùng luôn là của bạn.
                </p>
            </div>

            <div class="highlight-box red">
                <div class="highlight-title">❌ Không Dự Đoán Giá</div>
                <p class="content-text">
                    AI không biết giá sẽ lên $100,000 hay xuống $30,000. Không ai có thể dự đoán chính xác thị trường.
                </p>
            </div>

            <div class="highlight-box red">
                <div class="highlight-title">❌ Không Chịu Trách Nhiệm Kết Quả</div>
                <p class="content-text">
                    Mọi lời khuyên chỉ mang tính tham khảo. Bạn tự chịu trách nhiệm với trades của mình.
                </p>
            </div>

            <div class="highlight-box gold">
                <div class="highlight-title">💡 AI Là Công Cụ Hỗ Trợ, Không Phải Oracle</div>
                <p class="content-text">
                    Hãy sử dụng AI như một "senior trader" để hỏi ý kiến, không phải để làm theo mù quáng.
                </p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🎯</span> Câu Hỏi Mẫu Hữu Ích</h2>
            <p class="content-text">Lưu lại những câu hỏi này để dùng khi cần:</p>

            <div class="question-category">
                <div class="category-title">🔍 Xác Nhận Setup</div>
                <ul class="category-examples">
                    <li>[COIN] đang có pattern [PATTERN] trên [TF]. Checklist đạt [X/8]. Đánh giá setup này?</li>
                    <li>LFZ của [COIN] ở [GIÁ] có hợp lệ không?</li>
                </ul>
            </div>

            <div class="question-category">
                <div class="category-title">📐 Tính Toán</div>
                <ul class="category-examples">
                    <li>Với vốn $[X] và risk 2%, position size bao nhiêu nếu SL cách entry [Y]%?</li>
                    <li>R:R của setup entry [A], SL [B], TP [C] là bao nhiêu?</li>
                </ul>
            </div>

            <div class="question-category">
                <div class="category-title">📚 Học Kiến Thức</div>
                <ul class="category-examples">
                    <li>Giải thích chi tiết [PATTERN] với ví dụ cụ thể</li>
                    <li>Lỗi thường gặp khi trade [PATTERN] là gì?</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x300/112250/FFBD59?text=Useful+Question+Templates" alt="Mẫu câu hỏi hữu ích">
                <p class="image-caption">Hình 8.2.3: Các mẫu câu hỏi hữu ích nên lưu lại</p>
            </div>
        </section>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 8.2</h3>
            <ul class="summary-list">
                <li>Chatbot trả lời về patterns, quản lý vốn, chiến lược trading</li>
                <li>Câu hỏi cụ thể (coin, TF, giá) = câu trả lời hữu ích hơn</li>
                <li>Hỏi từng câu một, dùng thuật ngữ chuẩn</li>
                <li>AI không đưa tín hiệu mua/bán hay dự đoán giá</li>
                <li>Sử dụng AI như công cụ hỗ trợ, không làm theo mù quáng</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title"><span class="icon">❓</span> Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">1. Câu hỏi nào dưới đây là TỐT NHẤT để hỏi chatbot?</p>
                <button class="quiz-option" data-index="0">A. "Nên mua coin nào?"</button>
                <button class="quiz-option" data-index="1">B. "BTC có lên không?"</button>
                <button class="quiz-option" data-index="2">C. "BTC có UPU trên 4H, LFZ $42K. Entry ở đâu?"</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">2. AI chatbot KHÔNG thể làm điều gì?</p>
                <button class="quiz-option" data-index="0">A. Giải thích pattern</button>
                <button class="quiz-option" data-index="1">B. Dự đoán giá sẽ lên hay xuống</button>
                <button class="quiz-option" data-index="2">C. Tính position size</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Bạn trả lời đúng <span id="correct-count">0</span>/2 câu!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Bài 8.2: Sử Dụng Chatbot Hỏi Đáp</p>
            <p>Tiếp theo: Bài 8.3 - Scanner Cơ Bản - Tìm Patterns Tự Động</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 2;
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
                        result.textContent = ''✓ Chính xác!'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng. Xem đáp án đúng ở trên.'';
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

-- Lesson 8.3: Scanner Cơ Bản - Tìm Patterns Tự Động - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch8-l3',
  'module-tier-1-ch8',
  'course-tier1-trading-foundation',
  'Bài 8.3: Scanner Cơ Bản - Tìm Patterns Tự Động - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 8.3: Scanner Cơ Bản - Tìm Patterns Tự Động - GEM Trading Academy</title>
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

        .steps-list {
            list-style: none;
            counter-reset: step-counter;
        }

        .steps-list li {
            counter-increment: step-counter;
            padding: 1rem;
            padding-left: 3.5rem;
            position: relative;
            margin-bottom: 0.5rem;
            background: var(--bg-secondary);
            border-radius: 10px;
            color: var(--text-secondary);
        }

        .steps-list li::before {
            content: counter(step-counter);
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            width: 28px;
            height: 28px;
            background: var(--accent-cyan);
            color: var(--bg-primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.9rem;
        }

        @media (max-width: 600px) {
            .steps-list li {
                border-radius: 8px;
                padding: 0.8rem;
                padding-left: 3rem;
            }
            .steps-list li::before {
                width: 24px;
                height: 24px;
                font-size: 0.8rem;
                left: 0.8rem;
            }
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .info-grid {
                grid-template-columns: 1fr;
                gap: 8px;
            }
        }

        .info-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1rem;
            border: 1px solid var(--border-color);
            text-align: center;
        }

        .info-card-title {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-bottom: 0.3rem;
        }

        .info-card-value {
            font-size: 1.3rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .filter-option {
            background: var(--bg-secondary);
            border-radius: 10px;
            padding: 1rem;
            margin: 0.5rem 0;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .filter-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
            flex-shrink: 0;
        }

        .filter-icon.pattern { background: var(--accent-gold-dim); }
        .filter-icon.timeframe { background: var(--accent-cyan-dim); }
        .filter-icon.score { background: var(--accent-green-dim); }
        .filter-icon.coin { background: var(--accent-purple-dim); }

        .filter-info h4 {
            color: var(--text-primary);
            margin-bottom: 0.2rem;
        }

        .filter-info p {
            color: var(--text-muted);
            font-size: 0.85rem;
        }

        .result-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1rem;
            margin: 0.5rem 0;
            border-left: 4px solid var(--accent-green);
        }

        .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }

        .result-coin {
            font-weight: 700;
            color: var(--text-primary);
        }

        .result-score {
            background: var(--accent-green-dim);
            color: var(--accent-green);
            padding: 0.2rem 0.6rem;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .result-details {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .result-tag {
            font-size: 0.8rem;
            color: var(--text-muted);
        }

        .result-tag span {
            color: var(--accent-cyan);
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

        .quiz-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                border: none;
                border-top: 1px solid var(--border-color);
                padding: 1rem;
                margin-top: 8px;
            }
        }

        .quiz-title {
            font-size: 1.3rem;
            color: var(--accent-gold);
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.2rem;
            margin-bottom: 1rem;
        }

        @media (max-width: 600px) {
            .quiz-question {
                border-radius: 8px;
                padding: 1rem;
            }
        }

        .question-text {
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.8rem 1rem;
            margin-bottom: 0.5rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }

        .quiz-option:hover {
            border-color: var(--accent-cyan);
            background: var(--accent-cyan-dim);
        }

        .quiz-option.correct {
            border-color: var(--accent-green);
            background: var(--accent-green-dim);
            color: var(--accent-green);
        }

        .quiz-option.incorrect {
            border-color: var(--accent-red);
            background: var(--accent-red-dim);
            color: var(--accent-red);
        }

        .quiz-result {
            margin-top: 0.5rem;
            padding: 0.5rem;
            border-radius: 6px;
            font-size: 0.9rem;
            display: none;
        }

        .quiz-result.show { display: block; }

        .quiz-result.correct {
            background: var(--accent-green-dim);
            color: var(--accent-green);
        }

        .quiz-result.incorrect {
            background: var(--accent-red-dim);
            color: var(--accent-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-cyan-dim), transparent);
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show { display: block; }

        .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-cyan);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.8rem 2rem;
            background: var(--accent-cyan);
            color: var(--bg-primary);
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
        }

        .retake-btn:hover {
            opacity: 0.9;
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
            <span class="lesson-badge">CHƯƠNG 8 - BÀI 3/5</span>
            <h1>Scanner Cơ Bản - Tìm Patterns Tự Động</h1>
            <p>Quét hàng trăm coins trong vài giây</p>
        </header>

        <section class="section">
            <h2 class="section-title"><span class="icon">🔍</span> Scanner Là Gì?</h2>
            <p class="content-text">
                <strong>Pattern Scanner</strong> là tính năng AI quét tự động hàng trăm coins để tìm các patterns
                đang hình thành. Thay vì phải xem từng chart một, scanner giúp bạn tìm cơ hội trong vài giây.
            </p>

            <div class="highlight-box gold">
                <div class="highlight-title">💡 Giá Trị Thực Sự</div>
                <p class="content-text">
                    Một trader bình thường mất 2-3 giờ để xem 50 charts. Scanner làm việc này trong <strong>10 giây</strong>
                    và còn đánh giá chất lượng setup từ 1-100 điểm.
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/00F0FF?text=Scanner+Interface+Overview" alt="Giao diện Scanner">
                <p class="image-caption">Hình 8.3.1: Giao diện Scanner trong ứng dụng GEM</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📋</span> Giới Hạn TIER 1</h2>
            <p class="content-text">
                Với tài khoản TIER 1, bạn có các giới hạn sau:
            </p>

            <div class="info-grid">
                <div class="info-card">
                    <div class="info-card-title">Số Lần Quét/Ngày</div>
                    <div class="info-card-value">50 lần</div>
                </div>
                <div class="info-card">
                    <div class="info-card-title">Số Coins Hỗ Trợ</div>
                    <div class="info-card-value">50 coins</div>
                </div>
                <div class="info-card">
                    <div class="info-card-title">Timeframes</div>
                    <div class="info-card-value">1 TF (4H)</div>
                </div>
                <div class="info-card">
                    <div class="info-card-title">Patterns Quét</div>
                    <div class="info-card-value">4 patterns</div>
                </div>
            </div>

            <div class="highlight-box">
                <div class="highlight-title">📊 4 Patterns TIER 1 Có Thể Quét</div>
                <p class="content-text">DPD (tiếp diễn) • UPU (tiếp diễn) • UPD (đảo chiều) • DPU (đảo chiều)</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">⚙️</span> Cách Sử Dụng Scanner</h2>
            <p class="content-text">Làm theo 4 bước đơn giản sau:</p>

            <ol class="steps-list">
                <li>
                    <strong>Mở Scanner</strong><br>
                    Vào tab GEM Master → chọn "Scanner" hoặc icon kính lúp
                </li>
                <li>
                    <strong>Chọn Bộ Lọc</strong><br>
                    Pattern (UPU, DPU...), Timeframe (4H mặc định), Score tối thiểu
                </li>
                <li>
                    <strong>Nhấn "Quét Ngay"</strong><br>
                    Đợi 5-10 giây để AI phân tích tất cả coins
                </li>
                <li>
                    <strong>Xem Kết Quả</strong><br>
                    Danh sách coins có pattern, sắp xếp theo điểm chất lượng
                </li>
            </ol>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/FFBD59?text=Scanner+Usage+4+Steps" alt="4 bước sử dụng">
                <p class="image-caption">Hình 8.3.2: 4 bước sử dụng Scanner cơ bản</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🎛️</span> Các Bộ Lọc Có Sẵn</h2>

            <div class="filter-option">
                <div class="filter-icon pattern">📊</div>
                <div class="filter-info">
                    <h4>Loại Pattern</h4>
                    <p>Chọn pattern muốn tìm: UPU, UPD, DPU, DPD hoặc "Tất cả"</p>
                </div>
            </div>

            <div class="filter-option">
                <div class="filter-icon timeframe">⏱️</div>
                <div class="filter-info">
                    <h4>Timeframe</h4>
                    <p>TIER 1 chỉ có 4H. TIER 2+ có thêm 1H, 1D, 1W...</p>
                </div>
            </div>

            <div class="filter-option">
                <div class="filter-icon score">⭐</div>
                <div class="filter-info">
                    <h4>Điểm Tối Thiểu</h4>
                    <p>Lọc kết quả có điểm chất lượng từ X trở lên (khuyến nghị: 70+)</p>
                </div>
            </div>

            <div class="filter-option">
                <div class="filter-icon coin">💰</div>
                <div class="filter-info">
                    <h4>Nhóm Coins</h4>
                    <p>Top 50 coins theo market cap (TIER 1 giới hạn)</p>
                </div>
            </div>

            <div class="highlight-box green">
                <div class="highlight-title">💡 Mẹo: Bộ Lọc Hiệu Quả Cho Người Mới</div>
                <p class="content-text">
                    Pattern: <strong>UPU</strong> (dễ nhất) | Timeframe: <strong>4H</strong> | Score: <strong>70+</strong><br>
                    Kết hợp này cho ra các setup chất lượng cao, dễ trade nhất.
                </p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📈</span> Đọc Hiểu Kết Quả Quét</h2>
            <p class="content-text">Sau khi quét, bạn sẽ thấy danh sách kết quả như sau:</p>

            <div class="result-card">
                <div class="result-header">
                    <span class="result-coin">BTC/USDT</span>
                    <span class="result-score">Score: 85</span>
                </div>
                <div class="result-details">
                    <span class="result-tag">Pattern: <span>UPU</span></span>
                    <span class="result-tag">TF: <span>4H</span></span>
                    <span class="result-tag">Zone: <span>$42,100 - $42,500</span></span>
                </div>
            </div>

            <div class="result-card">
                <div class="result-header">
                    <span class="result-coin">ETH/USDT</span>
                    <span class="result-score">Score: 78</span>
                </div>
                <div class="result-details">
                    <span class="result-tag">Pattern: <span>DPU</span></span>
                    <span class="result-tag">TF: <span>4H</span></span>
                    <span class="result-tag">Zone: <span>$2,280 - $2,320</span></span>
                </div>
            </div>

            <div class="highlight-box purple">
                <div class="highlight-title">⭐ Ý Nghĩa Điểm Score</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem;">
                    <li><strong>90-100:</strong> Excellent - Setup hoàn hảo, ưu tiên cao</li>
                    <li><strong>80-89:</strong> Very Good - Setup rất tốt</li>
                    <li><strong>70-79:</strong> Good - Setup tốt, có thể trade</li>
                    <li><strong>60-69:</strong> Fair - Cần xem xét thêm</li>
                    <li><strong>&lt;60:</strong> Weak - Không khuyến nghị</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Scan+Results+Explained" alt="Giải thích kết quả">
                <p class="image-caption">Hình 8.3.3: Cách đọc hiểu kết quả quét patterns</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">✅</span> Quy Trình Sau Khi Quét</h2>
            <p class="content-text">
                Scanner chỉ là bước đầu tiên. Sau khi có kết quả, bạn cần:
            </p>

            <ol class="steps-list">
                <li>
                    <strong>Chọn coins có score cao nhất</strong><br>
                    Ưu tiên score 80+ trước, sau đó đến 70+
                </li>
                <li>
                    <strong>Mở chart kiểm tra</strong><br>
                    Nhấn vào kết quả để mở chart, xác nhận bằng mắt
                </li>
                <li>
                    <strong>Chạy checklist 8 điểm</strong><br>
                    Xác nhận pattern bằng checklist đã học trong khóa
                </li>
                <li>
                    <strong>Quyết định entry</strong><br>
                    Nếu checklist đạt 7+/8, xem xét entry
                </li>
            </ol>

            <div class="highlight-box red">
                <div class="highlight-title">⚠️ Cảnh Báo Quan Trọng</div>
                <p class="content-text">
                    <strong>KHÔNG entry mù quáng</strong> chỉ dựa vào kết quả scanner!<br>
                    Luôn xác nhận bằng mắt và chạy checklist trước khi trade.
                </p>
            </div>
        </section>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 8.3</h3>
            <ul class="summary-list">
                <li>Scanner quét tự động hàng trăm coins tìm patterns trong vài giây</li>
                <li>TIER 1 giới hạn: 50 quét/ngày, 50 coins, 1 timeframe (4H)</li>
                <li>4 bước: Mở Scanner → Chọn bộ lọc → Quét → Xem kết quả</li>
                <li>Điểm Score từ 70+ là đáng xem xét, 80+ là ưu tiên</li>
                <li>Luôn xác nhận bằng mắt và checklist trước khi trade</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title"><span class="icon">❓</span> Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. TIER 1 được quét bao nhiêu coins và bao nhiêu timeframes?</p>
                <button class="quiz-option" data-index="0">A. 100 coins, 3 timeframes</button>
                <button class="quiz-option" data-index="1">B. 50 coins, 1 timeframe</button>
                <button class="quiz-option" data-index="2">C. 50 coins, unlimited timeframes</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Điểm Score bao nhiêu được coi là "Good" và có thể trade?</p>
                <button class="quiz-option" data-index="0">A. 50-60</button>
                <button class="quiz-option" data-index="1">B. 60-69</button>
                <button class="quiz-option" data-index="2">C. 70-79</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">3. Sau khi có kết quả scanner, bước tiếp theo nên làm gì?</p>
                <button class="quiz-option" data-index="0">A. Mở chart kiểm tra và chạy checklist</button>
                <button class="quiz-option" data-index="1">B. Entry ngay lập tức</button>
                <button class="quiz-option" data-index="2">C. Quét lại lần nữa</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Bạn trả lời đúng <span id="correct-count">0</span>/3 câu!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Bài 8.3: Scanner Cơ Bản</p>
            <p>Tiếp theo: Bài 8.4 - Thiết Lập Cảnh Báo</p>
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
                        result.textContent = ''✓ Chính xác!'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng. Xem đáp án đúng ở trên.'';
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
    <title>Bài 8.3: Scanner Cơ Bản - Tìm Patterns Tự Động - GEM Trading Academy</title>
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

        .steps-list {
            list-style: none;
            counter-reset: step-counter;
        }

        .steps-list li {
            counter-increment: step-counter;
            padding: 1rem;
            padding-left: 3.5rem;
            position: relative;
            margin-bottom: 0.5rem;
            background: var(--bg-secondary);
            border-radius: 10px;
            color: var(--text-secondary);
        }

        .steps-list li::before {
            content: counter(step-counter);
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            width: 28px;
            height: 28px;
            background: var(--accent-cyan);
            color: var(--bg-primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.9rem;
        }

        @media (max-width: 600px) {
            .steps-list li {
                border-radius: 8px;
                padding: 0.8rem;
                padding-left: 3rem;
            }
            .steps-list li::before {
                width: 24px;
                height: 24px;
                font-size: 0.8rem;
                left: 0.8rem;
            }
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .info-grid {
                grid-template-columns: 1fr;
                gap: 8px;
            }
        }

        .info-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1rem;
            border: 1px solid var(--border-color);
            text-align: center;
        }

        .info-card-title {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-bottom: 0.3rem;
        }

        .info-card-value {
            font-size: 1.3rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .filter-option {
            background: var(--bg-secondary);
            border-radius: 10px;
            padding: 1rem;
            margin: 0.5rem 0;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .filter-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
            flex-shrink: 0;
        }

        .filter-icon.pattern { background: var(--accent-gold-dim); }
        .filter-icon.timeframe { background: var(--accent-cyan-dim); }
        .filter-icon.score { background: var(--accent-green-dim); }
        .filter-icon.coin { background: var(--accent-purple-dim); }

        .filter-info h4 {
            color: var(--text-primary);
            margin-bottom: 0.2rem;
        }

        .filter-info p {
            color: var(--text-muted);
            font-size: 0.85rem;
        }

        .result-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1rem;
            margin: 0.5rem 0;
            border-left: 4px solid var(--accent-green);
        }

        .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }

        .result-coin {
            font-weight: 700;
            color: var(--text-primary);
        }

        .result-score {
            background: var(--accent-green-dim);
            color: var(--accent-green);
            padding: 0.2rem 0.6rem;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .result-details {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .result-tag {
            font-size: 0.8rem;
            color: var(--text-muted);
        }

        .result-tag span {
            color: var(--accent-cyan);
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

        .quiz-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                border: none;
                border-top: 1px solid var(--border-color);
                padding: 1rem;
                margin-top: 8px;
            }
        }

        .quiz-title {
            font-size: 1.3rem;
            color: var(--accent-gold);
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.2rem;
            margin-bottom: 1rem;
        }

        @media (max-width: 600px) {
            .quiz-question {
                border-radius: 8px;
                padding: 1rem;
            }
        }

        .question-text {
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.8rem 1rem;
            margin-bottom: 0.5rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }

        .quiz-option:hover {
            border-color: var(--accent-cyan);
            background: var(--accent-cyan-dim);
        }

        .quiz-option.correct {
            border-color: var(--accent-green);
            background: var(--accent-green-dim);
            color: var(--accent-green);
        }

        .quiz-option.incorrect {
            border-color: var(--accent-red);
            background: var(--accent-red-dim);
            color: var(--accent-red);
        }

        .quiz-result {
            margin-top: 0.5rem;
            padding: 0.5rem;
            border-radius: 6px;
            font-size: 0.9rem;
            display: none;
        }

        .quiz-result.show { display: block; }

        .quiz-result.correct {
            background: var(--accent-green-dim);
            color: var(--accent-green);
        }

        .quiz-result.incorrect {
            background: var(--accent-red-dim);
            color: var(--accent-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-cyan-dim), transparent);
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show { display: block; }

        .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-cyan);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.8rem 2rem;
            background: var(--accent-cyan);
            color: var(--bg-primary);
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
        }

        .retake-btn:hover {
            opacity: 0.9;
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
            <span class="lesson-badge">CHƯƠNG 8 - BÀI 3/5</span>
            <h1>Scanner Cơ Bản - Tìm Patterns Tự Động</h1>
            <p>Quét hàng trăm coins trong vài giây</p>
        </header>

        <section class="section">
            <h2 class="section-title"><span class="icon">🔍</span> Scanner Là Gì?</h2>
            <p class="content-text">
                <strong>Pattern Scanner</strong> là tính năng AI quét tự động hàng trăm coins để tìm các patterns
                đang hình thành. Thay vì phải xem từng chart một, scanner giúp bạn tìm cơ hội trong vài giây.
            </p>

            <div class="highlight-box gold">
                <div class="highlight-title">💡 Giá Trị Thực Sự</div>
                <p class="content-text">
                    Một trader bình thường mất 2-3 giờ để xem 50 charts. Scanner làm việc này trong <strong>10 giây</strong>
                    và còn đánh giá chất lượng setup từ 1-100 điểm.
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/00F0FF?text=Scanner+Interface+Overview" alt="Giao diện Scanner">
                <p class="image-caption">Hình 8.3.1: Giao diện Scanner trong ứng dụng GEM</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📋</span> Giới Hạn TIER 1</h2>
            <p class="content-text">
                Với tài khoản TIER 1, bạn có các giới hạn sau:
            </p>

            <div class="info-grid">
                <div class="info-card">
                    <div class="info-card-title">Số Lần Quét/Ngày</div>
                    <div class="info-card-value">50 lần</div>
                </div>
                <div class="info-card">
                    <div class="info-card-title">Số Coins Hỗ Trợ</div>
                    <div class="info-card-value">50 coins</div>
                </div>
                <div class="info-card">
                    <div class="info-card-title">Timeframes</div>
                    <div class="info-card-value">1 TF (4H)</div>
                </div>
                <div class="info-card">
                    <div class="info-card-title">Patterns Quét</div>
                    <div class="info-card-value">4 patterns</div>
                </div>
            </div>

            <div class="highlight-box">
                <div class="highlight-title">📊 4 Patterns TIER 1 Có Thể Quét</div>
                <p class="content-text">DPD (tiếp diễn) • UPU (tiếp diễn) • UPD (đảo chiều) • DPU (đảo chiều)</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">⚙️</span> Cách Sử Dụng Scanner</h2>
            <p class="content-text">Làm theo 4 bước đơn giản sau:</p>

            <ol class="steps-list">
                <li>
                    <strong>Mở Scanner</strong><br>
                    Vào tab GEM Master → chọn "Scanner" hoặc icon kính lúp
                </li>
                <li>
                    <strong>Chọn Bộ Lọc</strong><br>
                    Pattern (UPU, DPU...), Timeframe (4H mặc định), Score tối thiểu
                </li>
                <li>
                    <strong>Nhấn "Quét Ngay"</strong><br>
                    Đợi 5-10 giây để AI phân tích tất cả coins
                </li>
                <li>
                    <strong>Xem Kết Quả</strong><br>
                    Danh sách coins có pattern, sắp xếp theo điểm chất lượng
                </li>
            </ol>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/FFBD59?text=Scanner+Usage+4+Steps" alt="4 bước sử dụng">
                <p class="image-caption">Hình 8.3.2: 4 bước sử dụng Scanner cơ bản</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🎛️</span> Các Bộ Lọc Có Sẵn</h2>

            <div class="filter-option">
                <div class="filter-icon pattern">📊</div>
                <div class="filter-info">
                    <h4>Loại Pattern</h4>
                    <p>Chọn pattern muốn tìm: UPU, UPD, DPU, DPD hoặc "Tất cả"</p>
                </div>
            </div>

            <div class="filter-option">
                <div class="filter-icon timeframe">⏱️</div>
                <div class="filter-info">
                    <h4>Timeframe</h4>
                    <p>TIER 1 chỉ có 4H. TIER 2+ có thêm 1H, 1D, 1W...</p>
                </div>
            </div>

            <div class="filter-option">
                <div class="filter-icon score">⭐</div>
                <div class="filter-info">
                    <h4>Điểm Tối Thiểu</h4>
                    <p>Lọc kết quả có điểm chất lượng từ X trở lên (khuyến nghị: 70+)</p>
                </div>
            </div>

            <div class="filter-option">
                <div class="filter-icon coin">💰</div>
                <div class="filter-info">
                    <h4>Nhóm Coins</h4>
                    <p>Top 50 coins theo market cap (TIER 1 giới hạn)</p>
                </div>
            </div>

            <div class="highlight-box green">
                <div class="highlight-title">💡 Mẹo: Bộ Lọc Hiệu Quả Cho Người Mới</div>
                <p class="content-text">
                    Pattern: <strong>UPU</strong> (dễ nhất) | Timeframe: <strong>4H</strong> | Score: <strong>70+</strong><br>
                    Kết hợp này cho ra các setup chất lượng cao, dễ trade nhất.
                </p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📈</span> Đọc Hiểu Kết Quả Quét</h2>
            <p class="content-text">Sau khi quét, bạn sẽ thấy danh sách kết quả như sau:</p>

            <div class="result-card">
                <div class="result-header">
                    <span class="result-coin">BTC/USDT</span>
                    <span class="result-score">Score: 85</span>
                </div>
                <div class="result-details">
                    <span class="result-tag">Pattern: <span>UPU</span></span>
                    <span class="result-tag">TF: <span>4H</span></span>
                    <span class="result-tag">Zone: <span>$42,100 - $42,500</span></span>
                </div>
            </div>

            <div class="result-card">
                <div class="result-header">
                    <span class="result-coin">ETH/USDT</span>
                    <span class="result-score">Score: 78</span>
                </div>
                <div class="result-details">
                    <span class="result-tag">Pattern: <span>DPU</span></span>
                    <span class="result-tag">TF: <span>4H</span></span>
                    <span class="result-tag">Zone: <span>$2,280 - $2,320</span></span>
                </div>
            </div>

            <div class="highlight-box purple">
                <div class="highlight-title">⭐ Ý Nghĩa Điểm Score</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem;">
                    <li><strong>90-100:</strong> Excellent - Setup hoàn hảo, ưu tiên cao</li>
                    <li><strong>80-89:</strong> Very Good - Setup rất tốt</li>
                    <li><strong>70-79:</strong> Good - Setup tốt, có thể trade</li>
                    <li><strong>60-69:</strong> Fair - Cần xem xét thêm</li>
                    <li><strong>&lt;60:</strong> Weak - Không khuyến nghị</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Scan+Results+Explained" alt="Giải thích kết quả">
                <p class="image-caption">Hình 8.3.3: Cách đọc hiểu kết quả quét patterns</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">✅</span> Quy Trình Sau Khi Quét</h2>
            <p class="content-text">
                Scanner chỉ là bước đầu tiên. Sau khi có kết quả, bạn cần:
            </p>

            <ol class="steps-list">
                <li>
                    <strong>Chọn coins có score cao nhất</strong><br>
                    Ưu tiên score 80+ trước, sau đó đến 70+
                </li>
                <li>
                    <strong>Mở chart kiểm tra</strong><br>
                    Nhấn vào kết quả để mở chart, xác nhận bằng mắt
                </li>
                <li>
                    <strong>Chạy checklist 8 điểm</strong><br>
                    Xác nhận pattern bằng checklist đã học trong khóa
                </li>
                <li>
                    <strong>Quyết định entry</strong><br>
                    Nếu checklist đạt 7+/8, xem xét entry
                </li>
            </ol>

            <div class="highlight-box red">
                <div class="highlight-title">⚠️ Cảnh Báo Quan Trọng</div>
                <p class="content-text">
                    <strong>KHÔNG entry mù quáng</strong> chỉ dựa vào kết quả scanner!<br>
                    Luôn xác nhận bằng mắt và chạy checklist trước khi trade.
                </p>
            </div>
        </section>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 8.3</h3>
            <ul class="summary-list">
                <li>Scanner quét tự động hàng trăm coins tìm patterns trong vài giây</li>
                <li>TIER 1 giới hạn: 50 quét/ngày, 50 coins, 1 timeframe (4H)</li>
                <li>4 bước: Mở Scanner → Chọn bộ lọc → Quét → Xem kết quả</li>
                <li>Điểm Score từ 70+ là đáng xem xét, 80+ là ưu tiên</li>
                <li>Luôn xác nhận bằng mắt và checklist trước khi trade</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title"><span class="icon">❓</span> Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. TIER 1 được quét bao nhiêu coins và bao nhiêu timeframes?</p>
                <button class="quiz-option" data-index="0">A. 100 coins, 3 timeframes</button>
                <button class="quiz-option" data-index="1">B. 50 coins, 1 timeframe</button>
                <button class="quiz-option" data-index="2">C. 50 coins, unlimited timeframes</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Điểm Score bao nhiêu được coi là "Good" và có thể trade?</p>
                <button class="quiz-option" data-index="0">A. 50-60</button>
                <button class="quiz-option" data-index="1">B. 60-69</button>
                <button class="quiz-option" data-index="2">C. 70-79</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">3. Sau khi có kết quả scanner, bước tiếp theo nên làm gì?</p>
                <button class="quiz-option" data-index="0">A. Mở chart kiểm tra và chạy checklist</button>
                <button class="quiz-option" data-index="1">B. Entry ngay lập tức</button>
                <button class="quiz-option" data-index="2">C. Quét lại lần nữa</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Bạn trả lời đúng <span id="correct-count">0</span>/3 câu!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Bài 8.3: Scanner Cơ Bản</p>
            <p>Tiếp theo: Bài 8.4 - Thiết Lập Cảnh Báo</p>
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
                        result.textContent = ''✓ Chính xác!'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng. Xem đáp án đúng ở trên.'';
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

-- Lesson 8.4: Thiết Lập Cảnh Báo - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch8-l4',
  'module-tier-1-ch8',
  'course-tier1-trading-foundation',
  'Bài 8.4: Thiết Lập Cảnh Báo - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 8.4: Thiết Lập Cảnh Báo - GEM Trading Academy</title>
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
            background: var(--accent-gold-dim);
            color: var(--accent-gold);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
            border: 1px solid var(--accent-gold);
        }

        .lesson-header h1 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--text-primary), var(--accent-gold));
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

        .steps-list {
            list-style: none;
            counter-reset: step-counter;
        }

        .steps-list li {
            counter-increment: step-counter;
            padding: 1rem;
            padding-left: 3.5rem;
            position: relative;
            margin-bottom: 0.5rem;
            background: var(--bg-secondary);
            border-radius: 10px;
            color: var(--text-secondary);
        }

        .steps-list li::before {
            content: counter(step-counter);
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            width: 28px;
            height: 28px;
            background: var(--accent-gold);
            color: var(--bg-primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.9rem;
        }

        @media (max-width: 600px) {
            .steps-list li {
                border-radius: 8px;
                padding: 0.8rem;
                padding-left: 3rem;
            }
            .steps-list li::before {
                width: 24px;
                height: 24px;
                font-size: 0.8rem;
                left: 0.8rem;
            }
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .info-grid {
                grid-template-columns: 1fr;
                gap: 8px;
            }
        }

        .info-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1rem;
            border: 1px solid var(--border-color);
            text-align: center;
        }

        .info-card-title {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-bottom: 0.3rem;
        }

        .info-card-value {
            font-size: 1.3rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .alert-type {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1rem;
            margin: 0.5rem 0;
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            border-left: 4px solid var(--accent-cyan);
        }

        .alert-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            flex-shrink: 0;
            background: var(--accent-cyan-dim);
        }

        .alert-info h4 {
            color: var(--text-primary);
            margin-bottom: 0.3rem;
        }

        .alert-info p {
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .notification-preview {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
            display: flex;
            gap: 0.8rem;
            align-items: flex-start;
        }

        .notif-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--accent-gold-dim);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            flex-shrink: 0;
        }

        .notif-content {
            flex: 1;
        }

        .notif-title {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.2rem;
        }

        .notif-body {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .notif-time {
            font-size: 0.75rem;
            color: var(--text-muted);
            margin-top: 0.3rem;
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

        .quiz-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                border: none;
                border-top: 1px solid var(--border-color);
                padding: 1rem;
                margin-top: 8px;
            }
        }

        .quiz-title {
            font-size: 1.3rem;
            color: var(--accent-cyan);
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.2rem;
            margin-bottom: 1rem;
        }

        @media (max-width: 600px) {
            .quiz-question {
                border-radius: 8px;
                padding: 1rem;
            }
        }

        .question-text {
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.8rem 1rem;
            margin-bottom: 0.5rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }

        .quiz-option:hover {
            border-color: var(--accent-cyan);
            background: var(--accent-cyan-dim);
        }

        .quiz-option.correct {
            border-color: var(--accent-green);
            background: var(--accent-green-dim);
            color: var(--accent-green);
        }

        .quiz-option.incorrect {
            border-color: var(--accent-red);
            background: var(--accent-red-dim);
            color: var(--accent-red);
        }

        .quiz-result {
            margin-top: 0.5rem;
            padding: 0.5rem;
            border-radius: 6px;
            font-size: 0.9rem;
            display: none;
        }

        .quiz-result.show { display: block; }

        .quiz-result.correct {
            background: var(--accent-green-dim);
            color: var(--accent-green);
        }

        .quiz-result.incorrect {
            background: var(--accent-red-dim);
            color: var(--accent-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-gold-dim), transparent);
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show { display: block; }

        .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.8rem 2rem;
            background: var(--accent-gold);
            color: var(--bg-primary);
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
        }

        .retake-btn:hover {
            opacity: 0.9;
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
            <span class="lesson-badge">CHƯƠNG 8 - BÀI 4/5</span>
            <h1>Thiết Lập Cảnh Báo</h1>
            <p>Không bỏ lỡ cơ hội dù đang offline</p>
        </header>

        <section class="section">
            <h2 class="section-title"><span class="icon">🔔</span> Tại Sao Cần Cảnh Báo?</h2>
            <p class="content-text">
                Thị trường crypto hoạt động 24/7, nhưng bạn không thể ngồi xem chart suốt ngày.
                <strong>Hệ thống cảnh báo</strong> sẽ thông báo cho bạn khi pattern xuất hiện, dù bạn đang ngủ,
                đang làm việc, hay đang đi chơi.
            </p>

            <div class="highlight-box gold">
                <div class="highlight-title">💡 Lợi Ích Chính</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>Không cần xem chart 24/7</li>
                    <li>Bắt kịp cơ hội ngay khi xuất hiện</li>
                    <li>Giảm stress và FOMO</li>
                    <li>Tập trung vào các setup chất lượng</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/FFBD59?text=Alert+System+Benefits" alt="Lợi ích cảnh báo">
                <p class="image-caption">Hình 8.4.1: Hệ thống cảnh báo giúp bạn không bỏ lỡ cơ hội</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📋</span> Giới Hạn TIER 1</h2>

            <div class="info-grid">
                <div class="info-card">
                    <div class="info-card-title">Số Cảnh Báo Tối Đa</div>
                    <div class="info-card-value">10 alerts</div>
                </div>
                <div class="info-card">
                    <div class="info-card-title">Kênh Nhận Thông Báo</div>
                    <div class="info-card-value">App + Email</div>
                </div>
            </div>

            <div class="highlight-box">
                <div class="highlight-title">📊 So Sánh Tính Năng Alert</div>
                <table style="width: 100%; border-collapse: collapse; margin-top: 0.5rem;">
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 0.5rem; color: var(--text-secondary);">TIER 1</td>
                        <td style="padding: 0.5rem; color: var(--text-primary);">10 alerts, App + Email</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 0.5rem; color: var(--text-secondary);">TIER 2</td>
                        <td style="padding: 0.5rem; color: var(--text-muted);">50 alerts, + Telegram</td>
                    </tr>
                    <tr>
                        <td style="padding: 0.5rem; color: var(--text-secondary);">TIER 3</td>
                        <td style="padding: 0.5rem; color: var(--text-muted);">Unlimited, + Webhook API</td>
                    </tr>
                </table>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📱</span> Các Loại Cảnh Báo</h2>

            <div class="alert-type">
                <div class="alert-icon">📊</div>
                <div class="alert-info">
                    <h4>Pattern Alert</h4>
                    <p>Thông báo khi pattern cụ thể (UPU, DPU...) xuất hiện trên coin bạn theo dõi</p>
                </div>
            </div>

            <div class="alert-type">
                <div class="alert-icon">💰</div>
                <div class="alert-info">
                    <h4>Price Alert</h4>
                    <p>Thông báo khi giá chạm vùng zone bạn đặt (LFZ, HFZ)</p>
                </div>
            </div>

            <div class="alert-type">
                <div class="alert-icon">⭐</div>
                <div class="alert-info">
                    <h4>Score Alert</h4>
                    <p>Thông báo khi có setup với điểm chất lượng cao (80+, 90+)</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/00F0FF?text=3+Alert+Types" alt="3 loại cảnh báo">
                <p class="image-caption">Hình 8.4.2: 3 loại cảnh báo có sẵn trong hệ thống</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">⚙️</span> Cách Tạo Cảnh Báo</h2>

            <ol class="steps-list">
                <li>
                    <strong>Vào GEM Master → Alerts</strong><br>
                    Nhấn icon chuông hoặc menu "Cảnh báo"
                </li>
                <li>
                    <strong>Nhấn "+ Tạo Alert Mới"</strong><br>
                    Mở form thiết lập cảnh báo mới
                </li>
                <li>
                    <strong>Chọn Coin</strong><br>
                    Chọn coin muốn theo dõi (vd: BTC, ETH)
                </li>
                <li>
                    <strong>Chọn Loại Alert</strong><br>
                    Pattern / Price / Score - tùy nhu cầu
                </li>
                <li>
                    <strong>Thiết Lập Điều Kiện</strong><br>
                    Pattern: chọn UPU/DPU... | Price: nhập vùng giá | Score: chọn ngưỡng
                </li>
                <li>
                    <strong>Lưu & Kích Hoạt</strong><br>
                    Nhấn "Lưu" và đảm bảo toggle "Active" bật lên
                </li>
            </ol>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/10B981?text=Create+Alert+Steps" alt="Các bước tạo alert">
                <p class="image-caption">Hình 8.4.3: Hướng dẫn tạo cảnh báo từng bước</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📬</span> Khi Nhận Được Cảnh Báo</h2>
            <p class="content-text">Đây là ví dụ thông báo bạn sẽ nhận được:</p>

            <div class="notification-preview">
                <div class="notif-icon">🔔</div>
                <div class="notif-content">
                    <div class="notif-title">Pattern Alert: BTC/USDT</div>
                    <div class="notif-body">UPU pattern detected on 4H timeframe. Score: 82/100. LFZ: $42,200 - $42,500</div>
                    <div class="notif-time">2 phút trước</div>
                </div>
            </div>

            <div class="notification-preview">
                <div class="notif-icon">💰</div>
                <div class="notif-content">
                    <div class="notif-title">Price Alert: ETH/USDT</div>
                    <div class="notif-body">Price reached your LFZ zone at $2,300. Current: $2,298</div>
                    <div class="notif-time">5 phút trước</div>
                </div>
            </div>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Bước Tiếp Theo Sau Khi Nhận Alert</div>
                <ol style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>Mở app, xem chart coin được cảnh báo</li>
                    <li>Xác nhận pattern bằng mắt</li>
                    <li>Chạy checklist 8 điểm</li>
                    <li>Quyết định có entry hay không</li>
                </ol>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">💡</span> Mẹo Sử Dụng Alert Hiệu Quả</h2>

            <div class="highlight-box purple">
                <div class="highlight-title">📌 Mẹo #1: Chọn Coin Phù Hợp</div>
                <p class="content-text">
                    Với 10 alerts giới hạn, chỉ đặt cho những coin bạn thực sự quan tâm và hay trade.
                    Khuyến nghị: BTC, ETH + 3-4 altcoins yêu thích.
                </p>
            </div>

            <div class="highlight-box purple">
                <div class="highlight-title">📌 Mẹo #2: Ưu Tiên Pattern Alert</div>
                <p class="content-text">
                    Pattern alerts hữu ích hơn price alerts vì AI đã phân tích sẵn.
                    Bạn chỉ cần xác nhận, không phải tự vẽ zone.
                </p>
            </div>

            <div class="highlight-box purple">
                <div class="highlight-title">📌 Mẹo #3: Đặt Score Threshold</div>
                <p class="content-text">
                    Nếu dùng Score Alert, đặt ngưỡng 80+ để chỉ nhận những setup chất lượng cao.
                    Tránh bị spam bởi các setup yếu.
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x300/112250/6A5BFF?text=Alert+Best+Practices" alt="Best practices">
                <p class="image-caption">Hình 8.4.4: Các mẹo sử dụng alert hiệu quả</p>
            </div>
        </section>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 8.4</h3>
            <ul class="summary-list">
                <li>Cảnh báo giúp không bỏ lỡ cơ hội dù không online 24/7</li>
                <li>TIER 1 giới hạn: 10 alerts, nhận qua App và Email</li>
                <li>3 loại alert: Pattern, Price, Score</li>
                <li>6 bước tạo alert: Vào Alerts → Tạo mới → Chọn coin → Loại → Điều kiện → Lưu</li>
                <li>Khi nhận alert: Xác nhận bằng mắt + Chạy checklist trước khi entry</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title"><span class="icon">❓</span> Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">1. TIER 1 được tạo tối đa bao nhiêu alerts?</p>
                <button class="quiz-option" data-index="0">A. 10 alerts</button>
                <button class="quiz-option" data-index="1">B. 50 alerts</button>
                <button class="quiz-option" data-index="2">C. Unlimited</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">2. Khi nhận được Pattern Alert, bước tiếp theo nên làm gì?</p>
                <button class="quiz-option" data-index="0">A. Entry ngay lập tức</button>
                <button class="quiz-option" data-index="1">B. Mở chart xác nhận và chạy checklist</button>
                <button class="quiz-option" data-index="2">C. Bỏ qua vì AI đã phân tích rồi</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Bạn trả lời đúng <span id="correct-count">0</span>/2 câu!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Bài 8.4: Thiết Lập Cảnh Báo</p>
            <p>Tiếp theo: Bài 8.5 - Tổng Kết & Xem Trước TIER 2</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 2;
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
                        result.textContent = ''✓ Chính xác!'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng. Xem đáp án đúng ở trên.'';
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
    <title>Bài 8.4: Thiết Lập Cảnh Báo - GEM Trading Academy</title>
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
            background: var(--accent-gold-dim);
            color: var(--accent-gold);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
            border: 1px solid var(--accent-gold);
        }

        .lesson-header h1 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--text-primary), var(--accent-gold));
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

        .steps-list {
            list-style: none;
            counter-reset: step-counter;
        }

        .steps-list li {
            counter-increment: step-counter;
            padding: 1rem;
            padding-left: 3.5rem;
            position: relative;
            margin-bottom: 0.5rem;
            background: var(--bg-secondary);
            border-radius: 10px;
            color: var(--text-secondary);
        }

        .steps-list li::before {
            content: counter(step-counter);
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            width: 28px;
            height: 28px;
            background: var(--accent-gold);
            color: var(--bg-primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.9rem;
        }

        @media (max-width: 600px) {
            .steps-list li {
                border-radius: 8px;
                padding: 0.8rem;
                padding-left: 3rem;
            }
            .steps-list li::before {
                width: 24px;
                height: 24px;
                font-size: 0.8rem;
                left: 0.8rem;
            }
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .info-grid {
                grid-template-columns: 1fr;
                gap: 8px;
            }
        }

        .info-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1rem;
            border: 1px solid var(--border-color);
            text-align: center;
        }

        .info-card-title {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-bottom: 0.3rem;
        }

        .info-card-value {
            font-size: 1.3rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .alert-type {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1rem;
            margin: 0.5rem 0;
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            border-left: 4px solid var(--accent-cyan);
        }

        .alert-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            flex-shrink: 0;
            background: var(--accent-cyan-dim);
        }

        .alert-info h4 {
            color: var(--text-primary);
            margin-bottom: 0.3rem;
        }

        .alert-info p {
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .notification-preview {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
            display: flex;
            gap: 0.8rem;
            align-items: flex-start;
        }

        .notif-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--accent-gold-dim);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            flex-shrink: 0;
        }

        .notif-content {
            flex: 1;
        }

        .notif-title {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.2rem;
        }

        .notif-body {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .notif-time {
            font-size: 0.75rem;
            color: var(--text-muted);
            margin-top: 0.3rem;
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

        .quiz-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                border: none;
                border-top: 1px solid var(--border-color);
                padding: 1rem;
                margin-top: 8px;
            }
        }

        .quiz-title {
            font-size: 1.3rem;
            color: var(--accent-cyan);
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.2rem;
            margin-bottom: 1rem;
        }

        @media (max-width: 600px) {
            .quiz-question {
                border-radius: 8px;
                padding: 1rem;
            }
        }

        .question-text {
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.8rem 1rem;
            margin-bottom: 0.5rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }

        .quiz-option:hover {
            border-color: var(--accent-cyan);
            background: var(--accent-cyan-dim);
        }

        .quiz-option.correct {
            border-color: var(--accent-green);
            background: var(--accent-green-dim);
            color: var(--accent-green);
        }

        .quiz-option.incorrect {
            border-color: var(--accent-red);
            background: var(--accent-red-dim);
            color: var(--accent-red);
        }

        .quiz-result {
            margin-top: 0.5rem;
            padding: 0.5rem;
            border-radius: 6px;
            font-size: 0.9rem;
            display: none;
        }

        .quiz-result.show { display: block; }

        .quiz-result.correct {
            background: var(--accent-green-dim);
            color: var(--accent-green);
        }

        .quiz-result.incorrect {
            background: var(--accent-red-dim);
            color: var(--accent-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-gold-dim), transparent);
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show { display: block; }

        .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.8rem 2rem;
            background: var(--accent-gold);
            color: var(--bg-primary);
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
        }

        .retake-btn:hover {
            opacity: 0.9;
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
            <span class="lesson-badge">CHƯƠNG 8 - BÀI 4/5</span>
            <h1>Thiết Lập Cảnh Báo</h1>
            <p>Không bỏ lỡ cơ hội dù đang offline</p>
        </header>

        <section class="section">
            <h2 class="section-title"><span class="icon">🔔</span> Tại Sao Cần Cảnh Báo?</h2>
            <p class="content-text">
                Thị trường crypto hoạt động 24/7, nhưng bạn không thể ngồi xem chart suốt ngày.
                <strong>Hệ thống cảnh báo</strong> sẽ thông báo cho bạn khi pattern xuất hiện, dù bạn đang ngủ,
                đang làm việc, hay đang đi chơi.
            </p>

            <div class="highlight-box gold">
                <div class="highlight-title">💡 Lợi Ích Chính</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>Không cần xem chart 24/7</li>
                    <li>Bắt kịp cơ hội ngay khi xuất hiện</li>
                    <li>Giảm stress và FOMO</li>
                    <li>Tập trung vào các setup chất lượng</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/FFBD59?text=Alert+System+Benefits" alt="Lợi ích cảnh báo">
                <p class="image-caption">Hình 8.4.1: Hệ thống cảnh báo giúp bạn không bỏ lỡ cơ hội</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📋</span> Giới Hạn TIER 1</h2>

            <div class="info-grid">
                <div class="info-card">
                    <div class="info-card-title">Số Cảnh Báo Tối Đa</div>
                    <div class="info-card-value">10 alerts</div>
                </div>
                <div class="info-card">
                    <div class="info-card-title">Kênh Nhận Thông Báo</div>
                    <div class="info-card-value">App + Email</div>
                </div>
            </div>

            <div class="highlight-box">
                <div class="highlight-title">📊 So Sánh Tính Năng Alert</div>
                <table style="width: 100%; border-collapse: collapse; margin-top: 0.5rem;">
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 0.5rem; color: var(--text-secondary);">TIER 1</td>
                        <td style="padding: 0.5rem; color: var(--text-primary);">10 alerts, App + Email</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 0.5rem; color: var(--text-secondary);">TIER 2</td>
                        <td style="padding: 0.5rem; color: var(--text-muted);">50 alerts, + Telegram</td>
                    </tr>
                    <tr>
                        <td style="padding: 0.5rem; color: var(--text-secondary);">TIER 3</td>
                        <td style="padding: 0.5rem; color: var(--text-muted);">Unlimited, + Webhook API</td>
                    </tr>
                </table>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📱</span> Các Loại Cảnh Báo</h2>

            <div class="alert-type">
                <div class="alert-icon">📊</div>
                <div class="alert-info">
                    <h4>Pattern Alert</h4>
                    <p>Thông báo khi pattern cụ thể (UPU, DPU...) xuất hiện trên coin bạn theo dõi</p>
                </div>
            </div>

            <div class="alert-type">
                <div class="alert-icon">💰</div>
                <div class="alert-info">
                    <h4>Price Alert</h4>
                    <p>Thông báo khi giá chạm vùng zone bạn đặt (LFZ, HFZ)</p>
                </div>
            </div>

            <div class="alert-type">
                <div class="alert-icon">⭐</div>
                <div class="alert-info">
                    <h4>Score Alert</h4>
                    <p>Thông báo khi có setup với điểm chất lượng cao (80+, 90+)</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/00F0FF?text=3+Alert+Types" alt="3 loại cảnh báo">
                <p class="image-caption">Hình 8.4.2: 3 loại cảnh báo có sẵn trong hệ thống</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">⚙️</span> Cách Tạo Cảnh Báo</h2>

            <ol class="steps-list">
                <li>
                    <strong>Vào GEM Master → Alerts</strong><br>
                    Nhấn icon chuông hoặc menu "Cảnh báo"
                </li>
                <li>
                    <strong>Nhấn "+ Tạo Alert Mới"</strong><br>
                    Mở form thiết lập cảnh báo mới
                </li>
                <li>
                    <strong>Chọn Coin</strong><br>
                    Chọn coin muốn theo dõi (vd: BTC, ETH)
                </li>
                <li>
                    <strong>Chọn Loại Alert</strong><br>
                    Pattern / Price / Score - tùy nhu cầu
                </li>
                <li>
                    <strong>Thiết Lập Điều Kiện</strong><br>
                    Pattern: chọn UPU/DPU... | Price: nhập vùng giá | Score: chọn ngưỡng
                </li>
                <li>
                    <strong>Lưu & Kích Hoạt</strong><br>
                    Nhấn "Lưu" và đảm bảo toggle "Active" bật lên
                </li>
            </ol>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/10B981?text=Create+Alert+Steps" alt="Các bước tạo alert">
                <p class="image-caption">Hình 8.4.3: Hướng dẫn tạo cảnh báo từng bước</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📬</span> Khi Nhận Được Cảnh Báo</h2>
            <p class="content-text">Đây là ví dụ thông báo bạn sẽ nhận được:</p>

            <div class="notification-preview">
                <div class="notif-icon">🔔</div>
                <div class="notif-content">
                    <div class="notif-title">Pattern Alert: BTC/USDT</div>
                    <div class="notif-body">UPU pattern detected on 4H timeframe. Score: 82/100. LFZ: $42,200 - $42,500</div>
                    <div class="notif-time">2 phút trước</div>
                </div>
            </div>

            <div class="notification-preview">
                <div class="notif-icon">💰</div>
                <div class="notif-content">
                    <div class="notif-title">Price Alert: ETH/USDT</div>
                    <div class="notif-body">Price reached your LFZ zone at $2,300. Current: $2,298</div>
                    <div class="notif-time">5 phút trước</div>
                </div>
            </div>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Bước Tiếp Theo Sau Khi Nhận Alert</div>
                <ol style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>Mở app, xem chart coin được cảnh báo</li>
                    <li>Xác nhận pattern bằng mắt</li>
                    <li>Chạy checklist 8 điểm</li>
                    <li>Quyết định có entry hay không</li>
                </ol>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">💡</span> Mẹo Sử Dụng Alert Hiệu Quả</h2>

            <div class="highlight-box purple">
                <div class="highlight-title">📌 Mẹo #1: Chọn Coin Phù Hợp</div>
                <p class="content-text">
                    Với 10 alerts giới hạn, chỉ đặt cho những coin bạn thực sự quan tâm và hay trade.
                    Khuyến nghị: BTC, ETH + 3-4 altcoins yêu thích.
                </p>
            </div>

            <div class="highlight-box purple">
                <div class="highlight-title">📌 Mẹo #2: Ưu Tiên Pattern Alert</div>
                <p class="content-text">
                    Pattern alerts hữu ích hơn price alerts vì AI đã phân tích sẵn.
                    Bạn chỉ cần xác nhận, không phải tự vẽ zone.
                </p>
            </div>

            <div class="highlight-box purple">
                <div class="highlight-title">📌 Mẹo #3: Đặt Score Threshold</div>
                <p class="content-text">
                    Nếu dùng Score Alert, đặt ngưỡng 80+ để chỉ nhận những setup chất lượng cao.
                    Tránh bị spam bởi các setup yếu.
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x300/112250/6A5BFF?text=Alert+Best+Practices" alt="Best practices">
                <p class="image-caption">Hình 8.4.4: Các mẹo sử dụng alert hiệu quả</p>
            </div>
        </section>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 8.4</h3>
            <ul class="summary-list">
                <li>Cảnh báo giúp không bỏ lỡ cơ hội dù không online 24/7</li>
                <li>TIER 1 giới hạn: 10 alerts, nhận qua App và Email</li>
                <li>3 loại alert: Pattern, Price, Score</li>
                <li>6 bước tạo alert: Vào Alerts → Tạo mới → Chọn coin → Loại → Điều kiện → Lưu</li>
                <li>Khi nhận alert: Xác nhận bằng mắt + Chạy checklist trước khi entry</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title"><span class="icon">❓</span> Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">1. TIER 1 được tạo tối đa bao nhiêu alerts?</p>
                <button class="quiz-option" data-index="0">A. 10 alerts</button>
                <button class="quiz-option" data-index="1">B. 50 alerts</button>
                <button class="quiz-option" data-index="2">C. Unlimited</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">2. Khi nhận được Pattern Alert, bước tiếp theo nên làm gì?</p>
                <button class="quiz-option" data-index="0">A. Entry ngay lập tức</button>
                <button class="quiz-option" data-index="1">B. Mở chart xác nhận và chạy checklist</button>
                <button class="quiz-option" data-index="2">C. Bỏ qua vì AI đã phân tích rồi</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Bạn trả lời đúng <span id="correct-count">0</span>/2 câu!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Bài 8.4: Thiết Lập Cảnh Báo</p>
            <p>Tiếp theo: Bài 8.5 - Tổng Kết & Xem Trước TIER 2</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 2;
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
                        result.textContent = ''✓ Chính xác!'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng. Xem đáp án đúng ở trên.'';
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

-- Lesson 8.5: Tổng Kết TIER 1 & Xem Trước TIER 2 - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch8-l5',
  'module-tier-1-ch8',
  'course-tier1-trading-foundation',
  'Bài 8.5: Tổng Kết TIER 1 & Xem Trước TIER 2 - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 8.5: Tổng Kết TIER 1 & Xem Trước TIER 2 - GEM Trading Academy</title>
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

        .pattern-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .pattern-grid {
                grid-template-columns: 1fr;
                gap: 8px;
            }
        }

        .pattern-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.2rem;
            text-align: center;
            border: 1px solid var(--border-color);
        }

        .pattern-card.complete {
            border-color: var(--accent-green);
        }

        .pattern-name {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-gold);
            margin-bottom: 0.3rem;
        }

        .pattern-type {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-bottom: 0.5rem;
        }

        .pattern-winrate {
            background: var(--accent-green-dim);
            color: var(--accent-green);
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            display: inline-block;
        }

        .skill-list {
            list-style: none;
        }

        .skill-list li {
            padding: 0.8rem;
            padding-left: 2.5rem;
            position: relative;
            margin-bottom: 0.5rem;
            background: var(--bg-secondary);
            border-radius: 10px;
            color: var(--text-secondary);
        }

        .skill-list li::before {
            content: "✓";
            position: absolute;
            left: 1rem;
            color: var(--accent-green);
            font-weight: bold;
        }

        .preview-card {
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border: 1px solid var(--accent-purple);
            border-radius: 12px;
            padding: 1.2rem;
            margin: 0.5rem 0;
        }

        .preview-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }

        .preview-title {
            font-weight: 600;
            color: var(--accent-purple);
        }

        .preview-badge {
            background: var(--accent-purple);
            color: var(--text-primary);
            padding: 0.2rem 0.6rem;
            border-radius: 10px;
            font-size: 0.7rem;
            font-weight: 600;
        }

        .preview-desc {
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .checklist-box {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1rem 0;
        }

        .checklist-title {
            color: var(--accent-cyan);
            font-weight: 600;
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }

        .checklist {
            list-style: none;
        }

        .checklist li {
            padding: 0.6rem 0;
            padding-left: 2rem;
            position: relative;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border-color);
        }

        .checklist li:last-child {
            border-bottom: none;
        }

        .checklist li::before {
            content: "☐";
            position: absolute;
            left: 0;
            color: var(--accent-cyan);
            font-size: 1.2rem;
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
            font-size: 1.8rem;
            color: var(--accent-gold);
            margin-bottom: 0.5rem;
        }

        .congrats-subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
        }

        @media (max-width: 600px) {
            .congrats-box {
                border-radius: 0;
                padding: 1.5rem 1rem;
            }
            .congrats-emoji { font-size: 3rem; }
            .congrats-title { font-size: 1.4rem; }
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

        .quiz-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                border: none;
                border-top: 1px solid var(--border-color);
                padding: 1rem;
                margin-top: 8px;
            }
        }

        .quiz-title {
            font-size: 1.3rem;
            color: var(--accent-cyan);
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.2rem;
            margin-bottom: 1rem;
        }

        @media (max-width: 600px) {
            .quiz-question {
                border-radius: 8px;
                padding: 1rem;
            }
        }

        .question-text {
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.8rem 1rem;
            margin-bottom: 0.5rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }

        .quiz-option:hover {
            border-color: var(--accent-cyan);
            background: var(--accent-cyan-dim);
        }

        .quiz-option.correct {
            border-color: var(--accent-green);
            background: var(--accent-green-dim);
            color: var(--accent-green);
        }

        .quiz-option.incorrect {
            border-color: var(--accent-red);
            background: var(--accent-red-dim);
            color: var(--accent-red);
        }

        .quiz-result {
            margin-top: 0.5rem;
            padding: 0.5rem;
            border-radius: 6px;
            font-size: 0.9rem;
            display: none;
        }

        .quiz-result.show { display: block; }

        .quiz-result.correct {
            background: var(--accent-green-dim);
            color: var(--accent-green);
        }

        .quiz-result.incorrect {
            background: var(--accent-red-dim);
            color: var(--accent-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-gold-dim), transparent);
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show { display: block; }

        .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.8rem 2rem;
            background: var(--accent-gold);
            color: var(--bg-primary);
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
        }

        .retake-btn:hover {
            opacity: 0.9;
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
            <span class="lesson-badge">HOÀN THÀNH TIER 1</span>
            <h1>Tổng Kết & Xem Trước TIER 2</h1>
            <p>Nhìn lại hành trình và chuẩn bị cho bước tiếp theo</p>
        </header>

        <div class="congrats-box">
            <div class="congrats-emoji">🎉🏆🎉</div>
            <h2 class="congrats-title">Chúc Mừng!</h2>
            <p class="congrats-subtitle">Bạn đã hoàn thành TIER 1 - GEM Trading Academy</p>
        </div>

        <section class="section">
            <h2 class="section-title"><span class="icon">📊</span> 4 Patterns Đã Học</h2>
            <p class="content-text">
                Trong TIER 1, bạn đã thành thạo 4 patterns cốt lõi của phương pháp GEM Frequency Trading:
            </p>

            <div class="pattern-grid">
                <div class="pattern-card complete">
                    <div class="pattern-name">DPD</div>
                    <div class="pattern-type">Tiếp Diễn Giảm</div>
                    <div class="pattern-winrate">Win Rate: 70%</div>
                </div>
                <div class="pattern-card complete">
                    <div class="pattern-name">UPU</div>
                    <div class="pattern-type">Tiếp Diễn Tăng</div>
                    <div class="pattern-winrate">Win Rate: 68%</div>
                </div>
                <div class="pattern-card complete">
                    <div class="pattern-name">UPD</div>
                    <div class="pattern-type">Đảo Chiều Giảm</div>
                    <div class="pattern-winrate">Win Rate: 65%</div>
                </div>
                <div class="pattern-card complete">
                    <div class="pattern-name">DPU</div>
                    <div class="pattern-type">Đảo Chiều Tăng</div>
                    <div class="pattern-winrate">Win Rate: 66%</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/FFBD59?text=4+Patterns+Mastered" alt="4 patterns đã học">
                <p class="image-caption">Hình 8.5.1: 4 Patterns cốt lõi bạn đã thành thạo</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">✅</span> Kỹ Năng Đã Đạt Được</h2>

            <ul class="skill-list">
                <li><strong>Nhận diện patterns</strong> - Xác định DPD, UPU, UPD, DPU trên chart</li>
                <li><strong>Vẽ zones</strong> - Xác định và vẽ LFZ/HFZ chính xác</li>
                <li><strong>Checklist 8 điểm</strong> - Đánh giá chất lượng setup trước khi entry</li>
                <li><strong>Chiến lược entry</strong> - 3 phương pháp: Aggressive, Standard, Conservative</li>
                <li><strong>Quản lý vốn</strong> - Đặt SL, TP và tính R:R</li>
                <li><strong>Paper trading</strong> - Thực hành không rủi ro</li>
                <li><strong>Backtesting</strong> - Kiểm tra chiến lược với dữ liệu lịch sử</li>
                <li><strong>Sử dụng AI Scanner</strong> - Tìm patterns tự động</li>
            </ul>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🔮</span> Xem Trước TIER 2</h2>
            <p class="content-text">
                TIER 2 sẽ nâng cao kỹ năng của bạn với các nội dung chuyên sâu hơn:
            </p>

            <div class="preview-card">
                <div class="preview-header">
                    <span class="preview-title">🎯 HFZ & LFZ Zone Detection</span>
                    <span class="preview-badge">NEW</span>
                </div>
                <p class="preview-desc">Xác định zones tự động bằng AI, độ chính xác 85%+</p>
            </div>

            <div class="preview-card">
                <div class="preview-header">
                    <span class="preview-title">📊 11 Patterns Nâng Cao</span>
                    <span class="preview-badge">NEW</span>
                </div>
                <p class="preview-desc">DPD-E, UPU-E, DPU-E và 8 patterns phức hợp khác</p>
            </div>

            <div class="preview-card">
                <div class="preview-header">
                    <span class="preview-title">🔔 Multi-Timeframe Analysis</span>
                    <span class="preview-badge">NEW</span>
                </div>
                <p class="preview-desc">Phân tích đồng thời 3 timeframes để xác nhận setup</p>
            </div>

            <div class="preview-card">
                <div class="preview-header">
                    <span class="preview-title">💰 Position Sizing Pro</span>
                    <span class="preview-badge">NEW</span>
                </div>
                <p class="preview-desc">Tính toán position size tối ưu dựa trên volatility</p>
            </div>

            <div class="preview-card">
                <div class="preview-header">
                    <span class="preview-title">🤖 AI Scanner Nâng Cao</span>
                    <span class="preview-badge">UPGRADED</span>
                </div>
                <p class="preview-desc">200 quét/ngày, 150 coins, 3 timeframes, Telegram alerts</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/6A5BFF?text=TIER+2+Preview+Features" alt="Xem trước TIER 2">
                <p class="image-caption">Hình 8.5.2: Các tính năng mới trong TIER 2</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📋</span> Checklist Trước Khi Nâng Cấp</h2>
            <p class="content-text">
                Hãy chắc chắn bạn đã hoàn thành những mục sau trước khi chuyển sang TIER 2:
            </p>

            <div class="checklist-box">
                <h3 class="checklist-title">✅ Checklist Sẵn Sàng TIER 2</h3>
                <ul class="checklist">
                    <li>Paper trade ít nhất 30 ngày với 4 patterns</li>
                    <li>Win Rate paper trade đạt 60%+ trên ít nhất 50 trades</li>
                    <li>Backtest ít nhất 30 trades cho mỗi pattern</li>
                    <li>Có thể nhận diện patterns trong 30 giây</li>
                    <li>Vẽ được LFZ/HFZ chính xác</li>
                    <li>Hiểu và áp dụng được checklist 8 điểm</li>
                    <li>Trading journal ghi chép đầy đủ</li>
                    <li>Quản lý được cảm xúc khi trade thua</li>
                </ul>
            </div>

            <div class="highlight-box gold">
                <div class="highlight-title">💡 Lời Khuyên</div>
                <p class="content-text">
                    Đừng vội nâng cấp lên TIER 2 nếu chưa thành thạo TIER 1. Nền tảng vững chắc quan trọng hơn
                    việc học nhanh. Hãy dành thời gian paper trade và backtest cho đến khi tự tin 100%.
                </p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🚀</span> Bước Tiếp Theo</h2>

            <div class="highlight-box green">
                <div class="highlight-title">📚 Module A & B</div>
                <p class="content-text">
                    Tiếp tục với <strong>Chương 9 (Module A)</strong> và <strong>Chương 10 (Module B)</strong>
                    để hiểu về hành trình chuyển hóa và các cơ hội phát triển trong cộng đồng GEM.
                </p>
            </div>

            <div class="highlight-box purple">
                <div class="highlight-title">🎯 Thực Hành Mỗi Ngày</div>
                <p class="content-text">
                    Dành ít nhất 30 phút/ngày để:<br>
                    • Quét scanner tìm patterns<br>
                    • Paper trade 2-3 setups<br>
                    • Review và ghi journal
                </p>
            </div>

            <div class="highlight-box">
                <div class="highlight-title">💬 Tham Gia Cộng Đồng</div>
                <p class="content-text">
                    Vào group GEM Community để chia sẻ trades, học hỏi từ members khác,
                    và nhận hỗ trợ khi cần thiết.
                </p>
            </div>
        </section>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 8.5</h3>
            <ul class="summary-list">
                <li>Hoàn thành TIER 1 với 4 patterns: DPD, UPU, UPD, DPU</li>
                <li>8 kỹ năng cốt lõi: nhận diện, vẽ zones, checklist, entry, quản lý vốn...</li>
                <li>TIER 2 có: Zone Detection, 11 patterns mới, Multi-TF, AI Scanner nâng cao</li>
                <li>Cần đạt 8 tiêu chí trong checklist trước khi nâng cấp</li>
                <li>Tiếp tục thực hành hàng ngày và tham gia cộng đồng</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title"><span class="icon">❓</span> Kiểm Tra Kiến Thức Cuối Khóa</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. TIER 1 dạy bao nhiêu patterns cốt lõi?</p>
                <button class="quiz-option" data-index="0">A. 2 patterns</button>
                <button class="quiz-option" data-index="1">B. 4 patterns</button>
                <button class="quiz-option" data-index="2">C. 8 patterns</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Trước khi nâng cấp TIER 2, cần paper trade ít nhất bao nhiêu ngày?</p>
                <button class="quiz-option" data-index="0">A. 7 ngày</button>
                <button class="quiz-option" data-index="1">B. 14 ngày</button>
                <button class="quiz-option" data-index="2">C. 30 ngày</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Bạn trả lời đúng <span id="correct-count">0</span>/2 câu!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Bài 8.5: Tổng Kết & Xem Trước TIER 2</p>
            <p>Tiếp theo: Chương 9 - Hành Trình Chuyển Hóa (Module A)</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 2;
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
                        result.textContent = ''✓ Chính xác!'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng. Xem đáp án đúng ở trên.'';
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
    <title>Bài 8.5: Tổng Kết TIER 1 & Xem Trước TIER 2 - GEM Trading Academy</title>
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

        .pattern-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .pattern-grid {
                grid-template-columns: 1fr;
                gap: 8px;
            }
        }

        .pattern-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.2rem;
            text-align: center;
            border: 1px solid var(--border-color);
        }

        .pattern-card.complete {
            border-color: var(--accent-green);
        }

        .pattern-name {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-gold);
            margin-bottom: 0.3rem;
        }

        .pattern-type {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-bottom: 0.5rem;
        }

        .pattern-winrate {
            background: var(--accent-green-dim);
            color: var(--accent-green);
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            display: inline-block;
        }

        .skill-list {
            list-style: none;
        }

        .skill-list li {
            padding: 0.8rem;
            padding-left: 2.5rem;
            position: relative;
            margin-bottom: 0.5rem;
            background: var(--bg-secondary);
            border-radius: 10px;
            color: var(--text-secondary);
        }

        .skill-list li::before {
            content: "✓";
            position: absolute;
            left: 1rem;
            color: var(--accent-green);
            font-weight: bold;
        }

        .preview-card {
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border: 1px solid var(--accent-purple);
            border-radius: 12px;
            padding: 1.2rem;
            margin: 0.5rem 0;
        }

        .preview-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }

        .preview-title {
            font-weight: 600;
            color: var(--accent-purple);
        }

        .preview-badge {
            background: var(--accent-purple);
            color: var(--text-primary);
            padding: 0.2rem 0.6rem;
            border-radius: 10px;
            font-size: 0.7rem;
            font-weight: 600;
        }

        .preview-desc {
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .checklist-box {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1rem 0;
        }

        .checklist-title {
            color: var(--accent-cyan);
            font-weight: 600;
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }

        .checklist {
            list-style: none;
        }

        .checklist li {
            padding: 0.6rem 0;
            padding-left: 2rem;
            position: relative;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border-color);
        }

        .checklist li:last-child {
            border-bottom: none;
        }

        .checklist li::before {
            content: "☐";
            position: absolute;
            left: 0;
            color: var(--accent-cyan);
            font-size: 1.2rem;
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
            font-size: 1.8rem;
            color: var(--accent-gold);
            margin-bottom: 0.5rem;
        }

        .congrats-subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
        }

        @media (max-width: 600px) {
            .congrats-box {
                border-radius: 0;
                padding: 1.5rem 1rem;
            }
            .congrats-emoji { font-size: 3rem; }
            .congrats-title { font-size: 1.4rem; }
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

        .quiz-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                border: none;
                border-top: 1px solid var(--border-color);
                padding: 1rem;
                margin-top: 8px;
            }
        }

        .quiz-title {
            font-size: 1.3rem;
            color: var(--accent-cyan);
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.2rem;
            margin-bottom: 1rem;
        }

        @media (max-width: 600px) {
            .quiz-question {
                border-radius: 8px;
                padding: 1rem;
            }
        }

        .question-text {
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.8rem 1rem;
            margin-bottom: 0.5rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }

        .quiz-option:hover {
            border-color: var(--accent-cyan);
            background: var(--accent-cyan-dim);
        }

        .quiz-option.correct {
            border-color: var(--accent-green);
            background: var(--accent-green-dim);
            color: var(--accent-green);
        }

        .quiz-option.incorrect {
            border-color: var(--accent-red);
            background: var(--accent-red-dim);
            color: var(--accent-red);
        }

        .quiz-result {
            margin-top: 0.5rem;
            padding: 0.5rem;
            border-radius: 6px;
            font-size: 0.9rem;
            display: none;
        }

        .quiz-result.show { display: block; }

        .quiz-result.correct {
            background: var(--accent-green-dim);
            color: var(--accent-green);
        }

        .quiz-result.incorrect {
            background: var(--accent-red-dim);
            color: var(--accent-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-gold-dim), transparent);
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show { display: block; }

        .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.8rem 2rem;
            background: var(--accent-gold);
            color: var(--bg-primary);
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
        }

        .retake-btn:hover {
            opacity: 0.9;
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
            <span class="lesson-badge">HOÀN THÀNH TIER 1</span>
            <h1>Tổng Kết & Xem Trước TIER 2</h1>
            <p>Nhìn lại hành trình và chuẩn bị cho bước tiếp theo</p>
        </header>

        <div class="congrats-box">
            <div class="congrats-emoji">🎉🏆🎉</div>
            <h2 class="congrats-title">Chúc Mừng!</h2>
            <p class="congrats-subtitle">Bạn đã hoàn thành TIER 1 - GEM Trading Academy</p>
        </div>

        <section class="section">
            <h2 class="section-title"><span class="icon">📊</span> 4 Patterns Đã Học</h2>
            <p class="content-text">
                Trong TIER 1, bạn đã thành thạo 4 patterns cốt lõi của phương pháp GEM Frequency Trading:
            </p>

            <div class="pattern-grid">
                <div class="pattern-card complete">
                    <div class="pattern-name">DPD</div>
                    <div class="pattern-type">Tiếp Diễn Giảm</div>
                    <div class="pattern-winrate">Win Rate: 70%</div>
                </div>
                <div class="pattern-card complete">
                    <div class="pattern-name">UPU</div>
                    <div class="pattern-type">Tiếp Diễn Tăng</div>
                    <div class="pattern-winrate">Win Rate: 68%</div>
                </div>
                <div class="pattern-card complete">
                    <div class="pattern-name">UPD</div>
                    <div class="pattern-type">Đảo Chiều Giảm</div>
                    <div class="pattern-winrate">Win Rate: 65%</div>
                </div>
                <div class="pattern-card complete">
                    <div class="pattern-name">DPU</div>
                    <div class="pattern-type">Đảo Chiều Tăng</div>
                    <div class="pattern-winrate">Win Rate: 66%</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/FFBD59?text=4+Patterns+Mastered" alt="4 patterns đã học">
                <p class="image-caption">Hình 8.5.1: 4 Patterns cốt lõi bạn đã thành thạo</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">✅</span> Kỹ Năng Đã Đạt Được</h2>

            <ul class="skill-list">
                <li><strong>Nhận diện patterns</strong> - Xác định DPD, UPU, UPD, DPU trên chart</li>
                <li><strong>Vẽ zones</strong> - Xác định và vẽ LFZ/HFZ chính xác</li>
                <li><strong>Checklist 8 điểm</strong> - Đánh giá chất lượng setup trước khi entry</li>
                <li><strong>Chiến lược entry</strong> - 3 phương pháp: Aggressive, Standard, Conservative</li>
                <li><strong>Quản lý vốn</strong> - Đặt SL, TP và tính R:R</li>
                <li><strong>Paper trading</strong> - Thực hành không rủi ro</li>
                <li><strong>Backtesting</strong> - Kiểm tra chiến lược với dữ liệu lịch sử</li>
                <li><strong>Sử dụng AI Scanner</strong> - Tìm patterns tự động</li>
            </ul>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🔮</span> Xem Trước TIER 2</h2>
            <p class="content-text">
                TIER 2 sẽ nâng cao kỹ năng của bạn với các nội dung chuyên sâu hơn:
            </p>

            <div class="preview-card">
                <div class="preview-header">
                    <span class="preview-title">🎯 HFZ & LFZ Zone Detection</span>
                    <span class="preview-badge">NEW</span>
                </div>
                <p class="preview-desc">Xác định zones tự động bằng AI, độ chính xác 85%+</p>
            </div>

            <div class="preview-card">
                <div class="preview-header">
                    <span class="preview-title">📊 11 Patterns Nâng Cao</span>
                    <span class="preview-badge">NEW</span>
                </div>
                <p class="preview-desc">DPD-E, UPU-E, DPU-E và 8 patterns phức hợp khác</p>
            </div>

            <div class="preview-card">
                <div class="preview-header">
                    <span class="preview-title">🔔 Multi-Timeframe Analysis</span>
                    <span class="preview-badge">NEW</span>
                </div>
                <p class="preview-desc">Phân tích đồng thời 3 timeframes để xác nhận setup</p>
            </div>

            <div class="preview-card">
                <div class="preview-header">
                    <span class="preview-title">💰 Position Sizing Pro</span>
                    <span class="preview-badge">NEW</span>
                </div>
                <p class="preview-desc">Tính toán position size tối ưu dựa trên volatility</p>
            </div>

            <div class="preview-card">
                <div class="preview-header">
                    <span class="preview-title">🤖 AI Scanner Nâng Cao</span>
                    <span class="preview-badge">UPGRADED</span>
                </div>
                <p class="preview-desc">200 quét/ngày, 150 coins, 3 timeframes, Telegram alerts</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/6A5BFF?text=TIER+2+Preview+Features" alt="Xem trước TIER 2">
                <p class="image-caption">Hình 8.5.2: Các tính năng mới trong TIER 2</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📋</span> Checklist Trước Khi Nâng Cấp</h2>
            <p class="content-text">
                Hãy chắc chắn bạn đã hoàn thành những mục sau trước khi chuyển sang TIER 2:
            </p>

            <div class="checklist-box">
                <h3 class="checklist-title">✅ Checklist Sẵn Sàng TIER 2</h3>
                <ul class="checklist">
                    <li>Paper trade ít nhất 30 ngày với 4 patterns</li>
                    <li>Win Rate paper trade đạt 60%+ trên ít nhất 50 trades</li>
                    <li>Backtest ít nhất 30 trades cho mỗi pattern</li>
                    <li>Có thể nhận diện patterns trong 30 giây</li>
                    <li>Vẽ được LFZ/HFZ chính xác</li>
                    <li>Hiểu và áp dụng được checklist 8 điểm</li>
                    <li>Trading journal ghi chép đầy đủ</li>
                    <li>Quản lý được cảm xúc khi trade thua</li>
                </ul>
            </div>

            <div class="highlight-box gold">
                <div class="highlight-title">💡 Lời Khuyên</div>
                <p class="content-text">
                    Đừng vội nâng cấp lên TIER 2 nếu chưa thành thạo TIER 1. Nền tảng vững chắc quan trọng hơn
                    việc học nhanh. Hãy dành thời gian paper trade và backtest cho đến khi tự tin 100%.
                </p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🚀</span> Bước Tiếp Theo</h2>

            <div class="highlight-box green">
                <div class="highlight-title">📚 Module A & B</div>
                <p class="content-text">
                    Tiếp tục với <strong>Chương 9 (Module A)</strong> và <strong>Chương 10 (Module B)</strong>
                    để hiểu về hành trình chuyển hóa và các cơ hội phát triển trong cộng đồng GEM.
                </p>
            </div>

            <div class="highlight-box purple">
                <div class="highlight-title">🎯 Thực Hành Mỗi Ngày</div>
                <p class="content-text">
                    Dành ít nhất 30 phút/ngày để:<br>
                    • Quét scanner tìm patterns<br>
                    • Paper trade 2-3 setups<br>
                    • Review và ghi journal
                </p>
            </div>

            <div class="highlight-box">
                <div class="highlight-title">💬 Tham Gia Cộng Đồng</div>
                <p class="content-text">
                    Vào group GEM Community để chia sẻ trades, học hỏi từ members khác,
                    và nhận hỗ trợ khi cần thiết.
                </p>
            </div>
        </section>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 8.5</h3>
            <ul class="summary-list">
                <li>Hoàn thành TIER 1 với 4 patterns: DPD, UPU, UPD, DPU</li>
                <li>8 kỹ năng cốt lõi: nhận diện, vẽ zones, checklist, entry, quản lý vốn...</li>
                <li>TIER 2 có: Zone Detection, 11 patterns mới, Multi-TF, AI Scanner nâng cao</li>
                <li>Cần đạt 8 tiêu chí trong checklist trước khi nâng cấp</li>
                <li>Tiếp tục thực hành hàng ngày và tham gia cộng đồng</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title"><span class="icon">❓</span> Kiểm Tra Kiến Thức Cuối Khóa</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. TIER 1 dạy bao nhiêu patterns cốt lõi?</p>
                <button class="quiz-option" data-index="0">A. 2 patterns</button>
                <button class="quiz-option" data-index="1">B. 4 patterns</button>
                <button class="quiz-option" data-index="2">C. 8 patterns</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Trước khi nâng cấp TIER 2, cần paper trade ít nhất bao nhiêu ngày?</p>
                <button class="quiz-option" data-index="0">A. 7 ngày</button>
                <button class="quiz-option" data-index="1">B. 14 ngày</button>
                <button class="quiz-option" data-index="2">C. 30 ngày</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Bạn trả lời đúng <span id="correct-count">0</span>/2 câu!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Bài 8.5: Tổng Kết & Xem Trước TIER 2</p>
            <p>Tiếp theo: Chương 9 - Hành Trình Chuyển Hóa (Module A)</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 2;
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
                        result.textContent = ''✓ Chính xác!'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng. Xem đáp án đúng ở trên.'';
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

-- ✅ Done: 5 lessons
