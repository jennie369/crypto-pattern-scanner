-- =====================================================
-- TIER-2 - Chương 2: LFZ - Low Frequency Zones
-- Course: course-tier2-trading-advanced
-- File 10/23
-- =====================================================

-- Create/Update Module
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  'module-tier-2-ch2',
  'course-tier2-trading-advanced',
  'Chương 2: LFZ - Low Frequency Zones',
  'Vùng hỗ trợ chất lượng cao',
  2,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Lesson 2.1: LFZ Là Gì?
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch2-l1',
  'module-tier-2-ch2',
  'course-tier2-trading-advanced',
  'Bài 2.1: LFZ Là Gì?',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 2.1: LFZ Là Gì? | GEM Trading Academy</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <style>
        :root {
            --primary-navy: #112250;
            --accent-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --error-red: #EF4444;
            --text-primary: #FFFFFF;
            --text-secondary: #A0AEC0;
            --bg-card: rgba(255, 255, 255, 0.05);
            --bg-card-hover: rgba(255, 255, 255, 0.08);
            --border-subtle: rgba(255, 255, 255, 0.1);
            --gradient-gold: linear-gradient(135deg, #FFBD59 0%, #FFCF87 100%);
            --gradient-green: linear-gradient(135deg, #10B981 0%, #34D399 100%);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--primary-navy);
            color: var(--text-primary);
            line-height: 1.7;
            min-height: 100vh;
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--primary-navy);
        }

        /* HEADER */
        .lesson-header {
            padding: 2rem 1.5rem;
            background: linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, transparent 100%);
            border-bottom: 1px solid var(--border-subtle);
            text-align: center;
        }

        .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--gradient-green);
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #000;
            margin-bottom: 1rem;
        }

        .lesson-chapter {
            font-size: 0.875rem;
            color: var(--success-green);
            font-weight: 500;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .lesson-meta {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            flex-wrap: wrap;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* CONTENT SECTION */
        .content-section {
            padding: 0;
        }

        .content-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1rem;
            padding: 1.5rem;
            border-left: 4px solid var(--success-green);
        }

        .content-card h2 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--success-green);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .content-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 1.25rem 0 0.75rem 0;
            color: var(--text-primary);
        }

        .content-card p {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            font-size: 0.9375rem;
        }

        .content-card ul, .content-card ol {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            padding-left: 1.5rem;
        }

        .content-card li {
            margin-bottom: 0.5rem;
            font-size: 0.9375rem;
        }

        /* IMAGE PLACEHOLDER */
        .image-placeholder {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
            border: 2px dashed var(--success-green);
            border-radius: 0.75rem;
            padding: 3rem 1.5rem;
            text-align: center;
            margin: 1.25rem 0;
        }

        .image-placeholder .icon {
            font-size: 2.5rem;
            margin-bottom: 0.75rem;
        }

        .image-placeholder .label {
            font-size: 0.875rem;
            color: var(--success-green);
            font-weight: 600;
        }

        .image-placeholder .dimensions {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
        }

        /* INFO BOX */
        .info-box {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .info-box.green {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .info-box-title {
            font-weight: 600;
            color: var(--success-green);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .info-box p {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin: 0;
        }

        /* PATTERN BOX */
        .pattern-box {
            background: rgba(16, 185, 129, 0.15);
            border: 2px solid var(--success-green);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem 0;
            text-align: center;
        }

        .pattern-name {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--success-green);
            margin-bottom: 0.5rem;
        }

        .pattern-meaning {
            font-size: 1rem;
            color: var(--text-secondary);
        }

        /* COMPARISON GRID */
        .comparison-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        .compare-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
        }

        .compare-card.lfz {
            border-color: var(--success-green);
            background: rgba(16, 185, 129, 0.1);
        }

        .compare-card.hfz {
            border-color: var(--error-red);
            background: rgba(239, 68, 68, 0.1);
        }

        .compare-title {
            font-size: 1rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .compare-card.lfz .compare-title {
            color: var(--success-green);
        }

        .compare-card.hfz .compare-title {
            color: var(--error-red);
        }

        .compare-text {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        /* FEATURE LIST */
        .feature-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .feature-item {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 0.75rem;
            background: var(--bg-card);
            border-radius: 0.5rem;
        }

        .feature-icon {
            width: 2rem;
            height: 2rem;
            background: rgba(16, 185, 129, 0.2);
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .feature-content h4 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .feature-content p {
            font-size: 0.8125rem;
            color: var(--text-secondary);
            margin: 0;
        }

        /* SUMMARY BOX */
        .summary-box {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            margin: 1.5rem 1rem;
        }

        .summary-box h3 {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--success-green);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .summary-box li {
            position: relative;
            padding-left: 1.5rem;
            margin-bottom: 0.625rem;
            color: var(--text-secondary);
            font-size: 0.9375rem;
        }

        .summary-box li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-weight: bold;
        }

        /* QUIZ SECTION */
        .quiz-section {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1.5rem 1rem;
            padding: 1.5rem;
        }

        .quiz-header {
            text-align: center;
            margin-bottom: 1.5rem;
        }

        .quiz-header h3 {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
            margin-bottom: 0.25rem;
        }

        .quiz-header p {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .quiz-question {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin-bottom: 1rem;
        }

        .question-text {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .quiz-options {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.9375rem;
            color: var(--text-secondary);
        }

        .quiz-option:hover:not(.correct):not(.incorrect) {
            background: var(--bg-card-hover);
            border-color: var(--accent-gold);
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
            margin-top: 0.75rem;
            padding: 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success-green);
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: var(--error-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .score-text {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--gradient-gold);
            border: none;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #000;
            cursor: pointer;
            transition: transform 0.2s ease;
        }

        .retake-btn:hover {
            transform: scale(1.02);
        }

        /* FOOTER */
        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            border-top: 1px solid var(--border-subtle);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .footer-logo .gem {
            color: var(--accent-gold);
        }

        .footer-text {
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* MOBILE RESPONSIVE */
        @media (max-width: 600px) {
            .content-card {
                margin: 0.75rem 0;
                border-radius: 0;
                border-left: 4px solid var(--success-green);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-subtle);
            }

            .summary-box,
            .quiz-section {
                margin: 1rem 0;
                border-radius: 0;
            }

            .lesson-header {
                padding: 1.5rem 1rem;
            }

            .lesson-title {
                font-size: 1.5rem;
            }

            .comparison-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <!-- HEADER -->
        <header class="lesson-header">
            <div class="header-badge">
                <span>📈</span>
                <span>Tier 2 - Nâng Cao</span>
            </div>
            <div class="lesson-chapter">Chapter 2 - LFZ Mastery</div>
            <h1 class="lesson-title">LFZ Là Gì?</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 2.1</span></div>
                <div class="meta-item"><span>⏱️</span><span>10 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>3 câu quiz</span></div>
            </div>
        </header>

        <!-- CONTENT -->
        <main class="content-section">
            <!-- Section 1: Giới thiệu LFZ -->
            <div class="content-card">
                <h2>🟢 Low Frequency Zone Là Gì?</h2>

                <div class="pattern-box">
                    <div class="pattern-name">LFZ - Low Frequency Zone</div>
                    <div class="pattern-meaning">Vùng có nhiều lệnh MUA chờ khớp</div>
                </div>

                <p><strong>LFZ (Low Frequency Zone)</strong> là vùng giá mà tại đó có rất nhiều lệnh BUY đang chờ được thực hiện. Đây là vùng giá mà Smart Money đã đặt lệnh mua sẵn và đang chờ giá quay về để khớp lệnh.</p>

                <div class="info-box green">
                    <div class="info-box-title">💡 Tại Sao Gọi Là "Low Frequency"?</div>
                    <p>Giá ít khi quay lại vùng này (low frequency = tần suất thấp). Khi giá về, đây là cơ hội MUA tuyệt vời vì có nhiều lệnh mua đang chờ đẩy giá lên.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📊</div>
                    <div class="label">Hình 2.1.1: LFZ - Vùng Mua Với Nhiều Lệnh Chờ</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 2: LFZ được tạo từ đâu -->
            <div class="content-card">
                <h2>📊 LFZ Được Tạo Từ Những Pattern Nào?</h2>

                <p>LFZ được tạo ra khi giá di chuyển với momentum mạnh rồi tạo vùng tích lũy nhỏ trước khi tiếp tục tăng. Có 2 patterns chính tạo ra LFZ:</p>

                <div class="comparison-grid">
                    <div class="compare-card lfz">
                        <div class="compare-title">UPU Pattern</div>
                        <div class="compare-text">Up-Pause-Up<br>Tiếp diễn tăng</div>
                    </div>
                    <div class="compare-card lfz">
                        <div class="compare-title">DPU Pattern</div>
                        <div class="compare-text">Down-Pause-Up<br>Đảo chiều tăng</div>
                    </div>
                </div>

                <h3>UPU - Tiếp Diễn Xu Hướng Tăng</h3>
                <p>Giá đang trong xu hướng tăng → Tạm nghỉ (Pause) → Tiếp tục tăng. Vùng Pause chính là LFZ.</p>

                <div class="image-placeholder">
                    <div class="icon">📈</div>
                    <div class="label">Hình 2.1.2: UPU Pattern Tạo LFZ</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>

                <h3>DPU - Đảo Chiều Từ Giảm Sang Tăng</h3>
                <p>Giá đang giảm → Dừng lại (Pause) → Đảo chiều tăng. Vùng Pause là LFZ - nơi Smart Money bắt đáy.</p>

                <div class="image-placeholder">
                    <div class="icon">🔄</div>
                    <div class="label">Hình 2.1.3: DPU Pattern Tạo LFZ</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 3: Vị trí LFZ -->
            <div class="content-card">
                <h2>📍 Vị Trí Của LFZ Trên Biểu Đồ</h2>

                <div class="info-box green">
                    <div class="info-box-title">🔑 Quy Tắc Vàng</div>
                    <p><strong>LFZ luôn nằm DƯỚI giá hiện tại!</strong> Nếu zone nằm trên giá hiện tại, đó là HFZ, không phải LFZ.</p>
                </div>

                <p>Tại sao LFZ luôn ở dưới? Vì đây là vùng mua - trader cần giá GIẢM về vùng này để có thể mua vào với giá tốt.</p>

                <div class="feature-list">
                    <div class="feature-item">
                        <div class="feature-icon">📍</div>
                        <div class="feature-content">
                            <h4>Vị Trí</h4>
                            <p>Luôn nằm DƯỚI giá hiện tại (price is above LFZ)</p>
                        </div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">🎯</div>
                        <div class="feature-content">
                            <h4>Tín Hiệu</h4>
                            <p>LONG (mua) khi giá quay lại test LFZ</p>
                        </div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">⏳</div>
                        <div class="feature-content">
                            <h4>Đợi Chờ</h4>
                            <p>Kiên nhẫn đợi giá pullback về LFZ trước khi entry</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🗺️</div>
                    <div class="label">Hình 2.1.4: Vị Trí LFZ So Với Giá Hiện Tại</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 4: So sánh LFZ vs HFZ -->
            <div class="content-card">
                <h2>⚖️ So Sánh LFZ và HFZ</h2>

                <p>Hiểu rõ sự khác biệt giữa LFZ và HFZ là nền tảng quan trọng của GEM Frequency Method:</p>

                <div class="comparison-grid">
                    <div class="compare-card lfz">
                        <div class="compare-title">🟢 LFZ</div>
                        <div class="compare-text">
                            Low Frequency Zone<br>
                            Vùng MUA<br>
                            Nằm DƯỚI giá<br>
                            Signal: LONG
                        </div>
                    </div>
                    <div class="compare-card hfz">
                        <div class="compare-title">🔴 HFZ</div>
                        <div class="compare-text">
                            High Frequency Zone<br>
                            Vùng BÁN<br>
                            Nằm TRÊN giá<br>
                            Signal: SHORT
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">⚖️</div>
                    <div class="label">Hình 2.1.5: So Sánh LFZ vs HFZ Trên Biểu Đồ</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 5: Tại sao LFZ hiệu quả -->
            <div class="content-card">
                <h2>💪 Tại Sao Trade Tại LFZ Hiệu Quả?</h2>

                <div class="feature-list">
                    <div class="feature-item">
                        <div class="feature-icon">🏦</div>
                        <div class="feature-content">
                            <h4>Smart Money Accumulation</h4>
                            <p>Đây là vùng các tổ chức lớn đặt lệnh mua. Khi giá về, có nhiều buying pressure.</p>
                        </div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">🎯</div>
                        <div class="feature-content">
                            <h4>Entry Tối Ưu</h4>
                            <p>Mua tại LFZ = mua với giá rẻ, stoploss nhỏ, potential profit lớn.</p>
                        </div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">📈</div>
                        <div class="feature-content">
                            <h4>Momentum Hỗ Trợ</h4>
                            <p>Sau khi bounce từ LFZ, giá thường tiếp tục xu hướng tăng với momentum mạnh.</p>
                        </div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">🛡️</div>
                        <div class="feature-content">
                            <h4>Risk:Reward Tốt</h4>
                            <p>LFZ có win rate 68-72% với R:R trung bình 1:2.5 đến 1:3.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- SUMMARY -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul>
                <li>LFZ là vùng có nhiều lệnh MUA chờ khớp (Low Frequency Zone)</li>
                <li>LFZ được tạo từ 2 patterns: UPU và DPU</li>
                <li>LFZ luôn nằm DƯỚI giá hiện tại</li>
                <li>Tín hiệu: LONG khi giá quay lại test LFZ</li>
                <li>Trade tại LFZ cho entry tối ưu với R:R tốt</li>
            </ul>
        </div>

        <!-- QUIZ -->
        <div class="quiz-section">
            <div class="quiz-header">
                <h3>🎯 Kiểm Tra Kiến Thức</h3>
                <p>Trả lời các câu hỏi để củng cố bài học</p>
            </div>

            <div class="quiz-question" data-correct="1">
                <div class="question-text">Câu 1: LFZ là viết tắt của gì và có nghĩa là gì?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Low Frequency Zone - Vùng có ít người giao dịch</div>
                    <div class="quiz-option" data-index="1">Low Frequency Zone - Vùng có nhiều lệnh MUA chờ khớp</div>
                    <div class="quiz-option" data-index="2">Long Frequency Zone - Vùng mở lệnh long thường xuyên</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <div class="question-text">Câu 2: LFZ nằm ở vị trí nào so với giá hiện tại?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Nằm TRÊN giá hiện tại</div>
                    <div class="quiz-option" data-index="1">Có thể nằm trên hoặc dưới giá hiện tại</div>
                    <div class="quiz-option" data-index="2">Luôn nằm DƯỚI giá hiện tại</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <div class="question-text">Câu 3: Patterns nào tạo ra LFZ?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">UPU và DPU</div>
                    <div class="quiz-option" data-index="1">DPD và UPD</div>
                    <div class="quiz-option" data-index="2">UPU và DPD</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text">🎉 Bạn trả lời đúng <span id="correct-count">0</span>/3 câu!</div>
                <button class="retake-btn" onclick="resetQuiz()">Làm Lại Quiz</button>
            </div>
        </div>

        <!-- FOOTER -->
        <footer class="lesson-footer">
            <div class="footer-logo">
                <span class="gem">GEM</span> Trading Academy
            </div>
            <div class="footer-text">© 2024 GEM Trading Academy. All rights reserved.</div>
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

        function resetQuiz() {
            answeredCount = 0;
            correctCount = 0;

            document.querySelectorAll(''.quiz-question'').forEach(question => {
                question.classList.remove(''answered'');
                question.querySelectorAll(''.quiz-option'').forEach(opt => {
                    opt.classList.remove(''correct'', ''incorrect'');
                });
                question.querySelector(''.quiz-result'').className = ''quiz-result'';
            });

            document.querySelector(''.quiz-score'').classList.remove(''show'');
        }
    </script>
</body>
</html>',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 2.1: LFZ Là Gì? | GEM Trading Academy</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <style>
        :root {
            --primary-navy: #112250;
            --accent-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --error-red: #EF4444;
            --text-primary: #FFFFFF;
            --text-secondary: #A0AEC0;
            --bg-card: rgba(255, 255, 255, 0.05);
            --bg-card-hover: rgba(255, 255, 255, 0.08);
            --border-subtle: rgba(255, 255, 255, 0.1);
            --gradient-gold: linear-gradient(135deg, #FFBD59 0%, #FFCF87 100%);
            --gradient-green: linear-gradient(135deg, #10B981 0%, #34D399 100%);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--primary-navy);
            color: var(--text-primary);
            line-height: 1.7;
            min-height: 100vh;
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--primary-navy);
        }

        /* HEADER */
        .lesson-header {
            padding: 2rem 1.5rem;
            background: linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, transparent 100%);
            border-bottom: 1px solid var(--border-subtle);
            text-align: center;
        }

        .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--gradient-green);
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #000;
            margin-bottom: 1rem;
        }

        .lesson-chapter {
            font-size: 0.875rem;
            color: var(--success-green);
            font-weight: 500;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .lesson-meta {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            flex-wrap: wrap;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* CONTENT SECTION */
        .content-section {
            padding: 0;
        }

        .content-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1rem;
            padding: 1.5rem;
            border-left: 4px solid var(--success-green);
        }

        .content-card h2 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--success-green);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .content-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 1.25rem 0 0.75rem 0;
            color: var(--text-primary);
        }

        .content-card p {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            font-size: 0.9375rem;
        }

        .content-card ul, .content-card ol {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            padding-left: 1.5rem;
        }

        .content-card li {
            margin-bottom: 0.5rem;
            font-size: 0.9375rem;
        }

        /* IMAGE PLACEHOLDER */
        .image-placeholder {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
            border: 2px dashed var(--success-green);
            border-radius: 0.75rem;
            padding: 3rem 1.5rem;
            text-align: center;
            margin: 1.25rem 0;
        }

        .image-placeholder .icon {
            font-size: 2.5rem;
            margin-bottom: 0.75rem;
        }

        .image-placeholder .label {
            font-size: 0.875rem;
            color: var(--success-green);
            font-weight: 600;
        }

        .image-placeholder .dimensions {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
        }

        /* INFO BOX */
        .info-box {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .info-box.green {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .info-box-title {
            font-weight: 600;
            color: var(--success-green);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .info-box p {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin: 0;
        }

        /* PATTERN BOX */
        .pattern-box {
            background: rgba(16, 185, 129, 0.15);
            border: 2px solid var(--success-green);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem 0;
            text-align: center;
        }

        .pattern-name {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--success-green);
            margin-bottom: 0.5rem;
        }

        .pattern-meaning {
            font-size: 1rem;
            color: var(--text-secondary);
        }

        /* COMPARISON GRID */
        .comparison-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        .compare-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
        }

        .compare-card.lfz {
            border-color: var(--success-green);
            background: rgba(16, 185, 129, 0.1);
        }

        .compare-card.hfz {
            border-color: var(--error-red);
            background: rgba(239, 68, 68, 0.1);
        }

        .compare-title {
            font-size: 1rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .compare-card.lfz .compare-title {
            color: var(--success-green);
        }

        .compare-card.hfz .compare-title {
            color: var(--error-red);
        }

        .compare-text {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        /* FEATURE LIST */
        .feature-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .feature-item {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 0.75rem;
            background: var(--bg-card);
            border-radius: 0.5rem;
        }

        .feature-icon {
            width: 2rem;
            height: 2rem;
            background: rgba(16, 185, 129, 0.2);
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .feature-content h4 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .feature-content p {
            font-size: 0.8125rem;
            color: var(--text-secondary);
            margin: 0;
        }

        /* SUMMARY BOX */
        .summary-box {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            margin: 1.5rem 1rem;
        }

        .summary-box h3 {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--success-green);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .summary-box li {
            position: relative;
            padding-left: 1.5rem;
            margin-bottom: 0.625rem;
            color: var(--text-secondary);
            font-size: 0.9375rem;
        }

        .summary-box li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-weight: bold;
        }

        /* QUIZ SECTION */
        .quiz-section {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1.5rem 1rem;
            padding: 1.5rem;
        }

        .quiz-header {
            text-align: center;
            margin-bottom: 1.5rem;
        }

        .quiz-header h3 {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
            margin-bottom: 0.25rem;
        }

        .quiz-header p {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .quiz-question {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin-bottom: 1rem;
        }

        .question-text {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .quiz-options {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.9375rem;
            color: var(--text-secondary);
        }

        .quiz-option:hover:not(.correct):not(.incorrect) {
            background: var(--bg-card-hover);
            border-color: var(--accent-gold);
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
            margin-top: 0.75rem;
            padding: 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success-green);
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: var(--error-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .score-text {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--gradient-gold);
            border: none;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #000;
            cursor: pointer;
            transition: transform 0.2s ease;
        }

        .retake-btn:hover {
            transform: scale(1.02);
        }

        /* FOOTER */
        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            border-top: 1px solid var(--border-subtle);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .footer-logo .gem {
            color: var(--accent-gold);
        }

        .footer-text {
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* MOBILE RESPONSIVE */
        @media (max-width: 600px) {
            .content-card {
                margin: 0.75rem 0;
                border-radius: 0;
                border-left: 4px solid var(--success-green);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-subtle);
            }

            .summary-box,
            .quiz-section {
                margin: 1rem 0;
                border-radius: 0;
            }

            .lesson-header {
                padding: 1.5rem 1rem;
            }

            .lesson-title {
                font-size: 1.5rem;
            }

            .comparison-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <!-- HEADER -->
        <header class="lesson-header">
            <div class="header-badge">
                <span>📈</span>
                <span>Tier 2 - Nâng Cao</span>
            </div>
            <div class="lesson-chapter">Chapter 2 - LFZ Mastery</div>
            <h1 class="lesson-title">LFZ Là Gì?</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 2.1</span></div>
                <div class="meta-item"><span>⏱️</span><span>10 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>3 câu quiz</span></div>
            </div>
        </header>

        <!-- CONTENT -->
        <main class="content-section">
            <!-- Section 1: Giới thiệu LFZ -->
            <div class="content-card">
                <h2>🟢 Low Frequency Zone Là Gì?</h2>

                <div class="pattern-box">
                    <div class="pattern-name">LFZ - Low Frequency Zone</div>
                    <div class="pattern-meaning">Vùng có nhiều lệnh MUA chờ khớp</div>
                </div>

                <p><strong>LFZ (Low Frequency Zone)</strong> là vùng giá mà tại đó có rất nhiều lệnh BUY đang chờ được thực hiện. Đây là vùng giá mà Smart Money đã đặt lệnh mua sẵn và đang chờ giá quay về để khớp lệnh.</p>

                <div class="info-box green">
                    <div class="info-box-title">💡 Tại Sao Gọi Là "Low Frequency"?</div>
                    <p>Giá ít khi quay lại vùng này (low frequency = tần suất thấp). Khi giá về, đây là cơ hội MUA tuyệt vời vì có nhiều lệnh mua đang chờ đẩy giá lên.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📊</div>
                    <div class="label">Hình 2.1.1: LFZ - Vùng Mua Với Nhiều Lệnh Chờ</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 2: LFZ được tạo từ đâu -->
            <div class="content-card">
                <h2>📊 LFZ Được Tạo Từ Những Pattern Nào?</h2>

                <p>LFZ được tạo ra khi giá di chuyển với momentum mạnh rồi tạo vùng tích lũy nhỏ trước khi tiếp tục tăng. Có 2 patterns chính tạo ra LFZ:</p>

                <div class="comparison-grid">
                    <div class="compare-card lfz">
                        <div class="compare-title">UPU Pattern</div>
                        <div class="compare-text">Up-Pause-Up<br>Tiếp diễn tăng</div>
                    </div>
                    <div class="compare-card lfz">
                        <div class="compare-title">DPU Pattern</div>
                        <div class="compare-text">Down-Pause-Up<br>Đảo chiều tăng</div>
                    </div>
                </div>

                <h3>UPU - Tiếp Diễn Xu Hướng Tăng</h3>
                <p>Giá đang trong xu hướng tăng → Tạm nghỉ (Pause) → Tiếp tục tăng. Vùng Pause chính là LFZ.</p>

                <div class="image-placeholder">
                    <div class="icon">📈</div>
                    <div class="label">Hình 2.1.2: UPU Pattern Tạo LFZ</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>

                <h3>DPU - Đảo Chiều Từ Giảm Sang Tăng</h3>
                <p>Giá đang giảm → Dừng lại (Pause) → Đảo chiều tăng. Vùng Pause là LFZ - nơi Smart Money bắt đáy.</p>

                <div class="image-placeholder">
                    <div class="icon">🔄</div>
                    <div class="label">Hình 2.1.3: DPU Pattern Tạo LFZ</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 3: Vị trí LFZ -->
            <div class="content-card">
                <h2>📍 Vị Trí Của LFZ Trên Biểu Đồ</h2>

                <div class="info-box green">
                    <div class="info-box-title">🔑 Quy Tắc Vàng</div>
                    <p><strong>LFZ luôn nằm DƯỚI giá hiện tại!</strong> Nếu zone nằm trên giá hiện tại, đó là HFZ, không phải LFZ.</p>
                </div>

                <p>Tại sao LFZ luôn ở dưới? Vì đây là vùng mua - trader cần giá GIẢM về vùng này để có thể mua vào với giá tốt.</p>

                <div class="feature-list">
                    <div class="feature-item">
                        <div class="feature-icon">📍</div>
                        <div class="feature-content">
                            <h4>Vị Trí</h4>
                            <p>Luôn nằm DƯỚI giá hiện tại (price is above LFZ)</p>
                        </div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">🎯</div>
                        <div class="feature-content">
                            <h4>Tín Hiệu</h4>
                            <p>LONG (mua) khi giá quay lại test LFZ</p>
                        </div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">⏳</div>
                        <div class="feature-content">
                            <h4>Đợi Chờ</h4>
                            <p>Kiên nhẫn đợi giá pullback về LFZ trước khi entry</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🗺️</div>
                    <div class="label">Hình 2.1.4: Vị Trí LFZ So Với Giá Hiện Tại</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 4: So sánh LFZ vs HFZ -->
            <div class="content-card">
                <h2>⚖️ So Sánh LFZ và HFZ</h2>

                <p>Hiểu rõ sự khác biệt giữa LFZ và HFZ là nền tảng quan trọng của GEM Frequency Method:</p>

                <div class="comparison-grid">
                    <div class="compare-card lfz">
                        <div class="compare-title">🟢 LFZ</div>
                        <div class="compare-text">
                            Low Frequency Zone<br>
                            Vùng MUA<br>
                            Nằm DƯỚI giá<br>
                            Signal: LONG
                        </div>
                    </div>
                    <div class="compare-card hfz">
                        <div class="compare-title">🔴 HFZ</div>
                        <div class="compare-text">
                            High Frequency Zone<br>
                            Vùng BÁN<br>
                            Nằm TRÊN giá<br>
                            Signal: SHORT
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">⚖️</div>
                    <div class="label">Hình 2.1.5: So Sánh LFZ vs HFZ Trên Biểu Đồ</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 5: Tại sao LFZ hiệu quả -->
            <div class="content-card">
                <h2>💪 Tại Sao Trade Tại LFZ Hiệu Quả?</h2>

                <div class="feature-list">
                    <div class="feature-item">
                        <div class="feature-icon">🏦</div>
                        <div class="feature-content">
                            <h4>Smart Money Accumulation</h4>
                            <p>Đây là vùng các tổ chức lớn đặt lệnh mua. Khi giá về, có nhiều buying pressure.</p>
                        </div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">🎯</div>
                        <div class="feature-content">
                            <h4>Entry Tối Ưu</h4>
                            <p>Mua tại LFZ = mua với giá rẻ, stoploss nhỏ, potential profit lớn.</p>
                        </div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">📈</div>
                        <div class="feature-content">
                            <h4>Momentum Hỗ Trợ</h4>
                            <p>Sau khi bounce từ LFZ, giá thường tiếp tục xu hướng tăng với momentum mạnh.</p>
                        </div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">🛡️</div>
                        <div class="feature-content">
                            <h4>Risk:Reward Tốt</h4>
                            <p>LFZ có win rate 68-72% với R:R trung bình 1:2.5 đến 1:3.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- SUMMARY -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul>
                <li>LFZ là vùng có nhiều lệnh MUA chờ khớp (Low Frequency Zone)</li>
                <li>LFZ được tạo từ 2 patterns: UPU và DPU</li>
                <li>LFZ luôn nằm DƯỚI giá hiện tại</li>
                <li>Tín hiệu: LONG khi giá quay lại test LFZ</li>
                <li>Trade tại LFZ cho entry tối ưu với R:R tốt</li>
            </ul>
        </div>

        <!-- QUIZ -->
        <div class="quiz-section">
            <div class="quiz-header">
                <h3>🎯 Kiểm Tra Kiến Thức</h3>
                <p>Trả lời các câu hỏi để củng cố bài học</p>
            </div>

            <div class="quiz-question" data-correct="1">
                <div class="question-text">Câu 1: LFZ là viết tắt của gì và có nghĩa là gì?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Low Frequency Zone - Vùng có ít người giao dịch</div>
                    <div class="quiz-option" data-index="1">Low Frequency Zone - Vùng có nhiều lệnh MUA chờ khớp</div>
                    <div class="quiz-option" data-index="2">Long Frequency Zone - Vùng mở lệnh long thường xuyên</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <div class="question-text">Câu 2: LFZ nằm ở vị trí nào so với giá hiện tại?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Nằm TRÊN giá hiện tại</div>
                    <div class="quiz-option" data-index="1">Có thể nằm trên hoặc dưới giá hiện tại</div>
                    <div class="quiz-option" data-index="2">Luôn nằm DƯỚI giá hiện tại</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <div class="question-text">Câu 3: Patterns nào tạo ra LFZ?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">UPU và DPU</div>
                    <div class="quiz-option" data-index="1">DPD và UPD</div>
                    <div class="quiz-option" data-index="2">UPU và DPD</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text">🎉 Bạn trả lời đúng <span id="correct-count">0</span>/3 câu!</div>
                <button class="retake-btn" onclick="resetQuiz()">Làm Lại Quiz</button>
            </div>
        </div>

        <!-- FOOTER -->
        <footer class="lesson-footer">
            <div class="footer-logo">
                <span class="gem">GEM</span> Trading Academy
            </div>
            <div class="footer-text">© 2024 GEM Trading Academy. All rights reserved.</div>
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

        function resetQuiz() {
            answeredCount = 0;
            correctCount = 0;

            document.querySelectorAll(''.quiz-question'').forEach(question => {
                question.classList.remove(''answered'');
                question.querySelectorAll(''.quiz-option'').forEach(opt => {
                    opt.classList.remove(''correct'', ''incorrect'');
                });
                question.querySelector(''.quiz-result'').className = ''quiz-result'';
            });

            document.querySelector(''.quiz-score'').classList.remove(''show'');
        }
    </script>
</body>
</html>',
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

-- Lesson 2.2: Cách Vẽ LFZ Chính Xác
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch2-l2',
  'module-tier-2-ch2',
  'course-tier2-trading-advanced',
  'Bài 2.2: Cách Vẽ LFZ Chính Xác',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 2.2: Cách Vẽ LFZ Chính Xác | GEM Trading Academy</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <style>
        :root {
            --primary-navy: #112250;
            --accent-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --error-red: #EF4444;
            --text-primary: #FFFFFF;
            --text-secondary: #A0AEC0;
            --bg-card: rgba(255, 255, 255, 0.05);
            --bg-card-hover: rgba(255, 255, 255, 0.08);
            --border-subtle: rgba(255, 255, 255, 0.1);
            --gradient-gold: linear-gradient(135deg, #FFBD59 0%, #FFCF87 100%);
            --gradient-green: linear-gradient(135deg, #10B981 0%, #34D399 100%);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--primary-navy);
            color: var(--text-primary);
            line-height: 1.7;
            min-height: 100vh;
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--primary-navy);
        }

        /* HEADER */
        .lesson-header {
            padding: 2rem 1.5rem;
            background: linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, transparent 100%);
            border-bottom: 1px solid var(--border-subtle);
            text-align: center;
        }

        .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--gradient-green);
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #000;
            margin-bottom: 1rem;
        }

        .lesson-chapter {
            font-size: 0.875rem;
            color: var(--success-green);
            font-weight: 500;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .lesson-meta {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            flex-wrap: wrap;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* CONTENT SECTION */
        .content-section {
            padding: 0;
        }

        .content-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1rem;
            padding: 1.5rem;
            border-left: 4px solid var(--success-green);
        }

        .content-card h2 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--success-green);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .content-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 1.25rem 0 0.75rem 0;
            color: var(--text-primary);
        }

        .content-card p {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            font-size: 0.9375rem;
        }

        .content-card ul, .content-card ol {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            padding-left: 1.5rem;
        }

        .content-card li {
            margin-bottom: 0.5rem;
            font-size: 0.9375rem;
        }

        /* IMAGE PLACEHOLDER */
        .image-placeholder {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
            border: 2px dashed var(--success-green);
            border-radius: 0.75rem;
            padding: 3rem 1.5rem;
            text-align: center;
            margin: 1.25rem 0;
        }

        .image-placeholder .icon {
            font-size: 2.5rem;
            margin-bottom: 0.75rem;
        }

        .image-placeholder .label {
            font-size: 0.875rem;
            color: var(--success-green);
            font-weight: 600;
        }

        .image-placeholder .dimensions {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
        }

        /* INFO BOX */
        .info-box {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .info-box.warning {
            background: rgba(255, 189, 89, 0.1);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .info-box.warning .info-box-title {
            color: var(--accent-gold);
        }

        .info-box-title {
            font-weight: 600;
            color: var(--success-green);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .info-box p {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin: 0;
        }

        /* STEP LIST */
        .step-list {
            counter-reset: step-counter;
            list-style: none;
            padding: 0;
            margin: 1rem 0;
        }

        .step-item {
            position: relative;
            padding: 1rem;
            padding-left: 3.5rem;
            background: var(--bg-card);
            border-radius: 0.75rem;
            margin-bottom: 0.75rem;
            border: 1px solid var(--border-subtle);
        }

        .step-item::before {
            counter-increment: step-counter;
            content: counter(step-counter);
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            width: 2rem;
            height: 2rem;
            background: var(--gradient-green);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.875rem;
            color: #000;
        }

        .step-item h4 {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .step-item p {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin: 0;
        }

        /* CODE BOX */
        .code-box {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border-subtle);
            border-radius: 0.5rem;
            padding: 1rem;
            margin: 1rem 0;
            font-family: ''JetBrains Mono'', monospace;
            font-size: 0.875rem;
            color: var(--accent-cyan);
        }

        .code-label {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
            font-family: ''Inter'', sans-serif;
        }

        /* CHECKLIST */
        .checklist {
            list-style: none;
            padding: 0;
            margin: 1rem 0;
        }

        .checklist li {
            padding: 0.5rem 0;
            padding-left: 2rem;
            position: relative;
            font-size: 0.9375rem;
            color: var(--text-secondary);
        }

        .checklist li::before {
            content: "☐";
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-size: 1rem;
        }

        /* EXAMPLE TABLE */
        .example-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            font-size: 0.875rem;
        }

        .example-table th,
        .example-table td {
            padding: 0.75rem;
            border: 1px solid var(--border-subtle);
            text-align: left;
        }

        .example-table th {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success-green);
            font-weight: 600;
        }

        .example-table td {
            color: var(--text-secondary);
        }

        /* SUMMARY BOX */
        .summary-box {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            margin: 1.5rem 1rem;
        }

        .summary-box h3 {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--success-green);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .summary-box li {
            position: relative;
            padding-left: 1.5rem;
            margin-bottom: 0.625rem;
            color: var(--text-secondary);
            font-size: 0.9375rem;
        }

        .summary-box li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-weight: bold;
        }

        /* QUIZ SECTION */
        .quiz-section {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1.5rem 1rem;
            padding: 1.5rem;
        }

        .quiz-header {
            text-align: center;
            margin-bottom: 1.5rem;
        }

        .quiz-header h3 {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
            margin-bottom: 0.25rem;
        }

        .quiz-header p {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .quiz-question {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin-bottom: 1rem;
        }

        .question-text {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .quiz-options {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.9375rem;
            color: var(--text-secondary);
        }

        .quiz-option:hover:not(.correct):not(.incorrect) {
            background: var(--bg-card-hover);
            border-color: var(--accent-gold);
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
            margin-top: 0.75rem;
            padding: 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success-green);
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: var(--error-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .score-text {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--gradient-gold);
            border: none;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #000;
            cursor: pointer;
            transition: transform 0.2s ease;
        }

        .retake-btn:hover {
            transform: scale(1.02);
        }

        /* FOOTER */
        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            border-top: 1px solid var(--border-subtle);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .footer-logo .gem {
            color: var(--accent-gold);
        }

        .footer-text {
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* MOBILE RESPONSIVE */
        @media (max-width: 600px) {
            .content-card {
                margin: 0.75rem 0;
                border-radius: 0;
                border-left: 4px solid var(--success-green);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-subtle);
            }

            .summary-box,
            .quiz-section {
                margin: 1rem 0;
                border-radius: 0;
            }

            .lesson-header {
                padding: 1.5rem 1rem;
            }

            .lesson-title {
                font-size: 1.5rem;
            }

            .example-table {
                font-size: 0.75rem;
            }

            .example-table th,
            .example-table td {
                padding: 0.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <!-- HEADER -->
        <header class="lesson-header">
            <div class="header-badge">
                <span>📈</span>
                <span>Tier 2 - Nâng Cao</span>
            </div>
            <div class="lesson-chapter">Chapter 2 - LFZ Mastery</div>
            <h1 class="lesson-title">Cách Vẽ LFZ Chính Xác</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 2.2</span></div>
                <div class="meta-item"><span>⏱️</span><span>12 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>3 câu quiz</span></div>
            </div>
        </header>

        <!-- CONTENT -->
        <main class="content-section">
            <!-- Section 1: Nguyên tắc vẽ LFZ -->
            <div class="content-card">
                <h2>📐 Nguyên Tắc Cơ Bản Khi Vẽ LFZ</h2>

                <p>Vẽ LFZ chính xác là kỹ năng quan trọng nhất trong GEM Frequency Method. Một LFZ được vẽ sai có thể dẫn đến entry kém, stoploss bị quét, hoặc miss opportunity.</p>

                <div class="info-box">
                    <div class="info-box-title">🔑 Quy Tắc Vàng Khi Vẽ LFZ</div>
                    <p>Entry Line = ĐỈNH của vùng Pause (gần giá hiện tại nhất)<br>
                    Stop Line = ĐÁY của vùng Pause (xa giá hiện tại nhất)</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📐</div>
                    <div class="label">Hình 2.2.1: Cấu Trúc LFZ - Entry và Stop Lines</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 2: 4 Bước Vẽ LFZ -->
            <div class="content-card">
                <h2>🎯 4 Bước Vẽ LFZ Chính Xác</h2>

                <div class="step-list">
                    <div class="step-item">
                        <h4>Xác Định Pattern</h4>
                        <p>Tìm UPU hoặc DPU pattern trên chart. Đảm bảo đủ 3 phases rõ ràng.</p>
                    </div>
                    <div class="step-item">
                        <h4>Đánh Dấu Vùng Pause</h4>
                        <p>Xác định điểm bắt đầu và kết thúc của Phase 2 (Pause). Đây là vùng tích lũy/consolidation.</p>
                    </div>
                    <div class="step-item">
                        <h4>Vẽ Entry Line</h4>
                        <p>Kẻ đường ngang tại ĐỈNH của vùng Pause. Đây là điểm entry khi giá pullback về.</p>
                    </div>
                    <div class="step-item">
                        <h4>Vẽ Stop Line</h4>
                        <p>Kẻ đường ngang tại ĐÁY của vùng Pause. Đây là điểm đặt stoploss.</p>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📝</div>
                    <div class="label">Hình 2.2.2: 4 Bước Vẽ LFZ Từ UPU Pattern</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Section 3: Quy tắc độ dày zone -->
            <div class="content-card">
                <h2>📏 Quy Tắc Độ Dày Zone</h2>

                <p>Độ dày của LFZ ảnh hưởng trực tiếp đến chất lượng trade. Zone quá dày = stoploss lớn, R:R kém. Zone quá mỏng = dễ bị false breakout.</p>

                <table class="example-table">
                    <thead>
                        <tr>
                            <th>Độ Dày</th>
                            <th>% Giá</th>
                            <th>Đánh Giá</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Quá Mỏng</td>
                            <td>< 0.3%</td>
                            <td>⚠️ Rủi ro cao</td>
                            <td>Thêm buffer hoặc skip</td>
                        </tr>
                        <tr>
                            <td>Lý Tưởng</td>
                            <td>0.5% - 1.5%</td>
                            <td>✅ Tối ưu</td>
                            <td>Trade với confidence cao</td>
                        </tr>
                        <tr>
                            <td>Chấp Nhận</td>
                            <td>1.5% - 2%</td>
                            <td>⚡ OK</td>
                            <td>Giảm position size</td>
                        </tr>
                        <tr>
                            <td>Quá Dày</td>
                            <td>> 2%</td>
                            <td>❌ R:R kém</td>
                            <td>Skip hoặc đợi retest</td>
                        </tr>
                    </tbody>
                </table>

                <div class="code-box">
                    <div class="code-label">Công thức tính độ dày zone:</div>
                    Độ dày (%) = (Stop Price - Entry Price) / Entry Price × 100
                </div>

                <div class="image-placeholder">
                    <div class="icon">📊</div>
                    <div class="label">Hình 2.2.3: So Sánh LFZ Mỏng vs Dày vs Lý Tưởng</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 4: Sai lầm thường gặp -->
            <div class="content-card">
                <h2>⚠️ Sai Lầm Thường Gặp Khi Vẽ LFZ</h2>

                <h3>1. Vẽ Ngược Entry và Stop</h3>
                <p>Với LFZ: Entry ở ĐỈNH Pause, Stop ở ĐÁY Pause. Nhiều người vẽ ngược lại!</p>

                <h3>2. Bỏ Qua Wicks</h3>
                <p>Phải tính cả shadow/wick của nến, không chỉ body. Zone nên bao phủ toàn bộ vùng Pause.</p>

                <h3>3. Zone Quá Tight</h3>
                <p>Vẽ zone quá sát = dễ bị sweep trước khi bounce. Nên thêm buffer 0.1-0.2%.</p>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Lưu Ý Quan Trọng</div>
                    <p>Khi không chắc chắn về vùng Pause, hãy mở rộng zone một chút để tránh bị stop hunt. Tốt hơn là có stoploss lớn hơn một chút nhưng không bị quét.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">❌</div>
                    <div class="label">Hình 2.2.4: Sai Lầm Phổ Biến vs Cách Vẽ Đúng</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 5: Thực hành -->
            <div class="content-card">
                <h2>✏️ Checklist Vẽ LFZ</h2>

                <p>Sử dụng checklist này mỗi khi vẽ LFZ để đảm bảo chính xác:</p>

                <ul class="checklist">
                    <li>Đã xác nhận pattern là UPU hoặc DPU</li>
                    <li>Phase 1 có momentum rõ ràng (≥2% move)</li>
                    <li>Phase 2 (Pause) là consolidation thật, không phải correction</li>
                    <li>Entry Line vẽ tại ĐỈNH của Pause</li>
                    <li>Stop Line vẽ tại ĐÁY của Pause</li>
                    <li>Độ dày zone trong khoảng 0.5% - 2%</li>
                    <li>Zone bao phủ cả wicks, không chỉ body</li>
                    <li>Zone nằm DƯỚI giá hiện tại</li>
                </ul>

                <div class="image-placeholder">
                    <div class="icon">✏️</div>
                    <div class="label">Hình 2.2.5: Ví Dụ Thực Hành - Vẽ LFZ Đúng Cách</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>
        </main>

        <!-- SUMMARY -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Entry Line = ĐỈNH của vùng Pause (gần giá hiện tại)</li>
                <li>Stop Line = ĐÁY của vùng Pause (xa giá hiện tại)</li>
                <li>4 bước: Xác định pattern → Đánh dấu Pause → Vẽ Entry → Vẽ Stop</li>
                <li>Độ dày zone lý tưởng: 0.5% - 1.5%</li>
                <li>Luôn tính cả wicks khi vẽ zone</li>
            </ul>
        </div>

        <!-- QUIZ -->
        <div class="quiz-section">
            <div class="quiz-header">
                <h3>🎯 Kiểm Tra Kiến Thức</h3>
                <p>Trả lời các câu hỏi để củng cố bài học</p>
            </div>

            <div class="quiz-question" data-correct="0">
                <div class="question-text">Câu 1: Khi vẽ LFZ, Entry Line được đặt ở đâu?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Tại ĐỈNH của vùng Pause (gần giá hiện tại nhất)</div>
                    <div class="quiz-option" data-index="1">Tại ĐÁY của vùng Pause (xa giá hiện tại nhất)</div>
                    <div class="quiz-option" data-index="2">Tại giữa vùng Pause</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <div class="question-text">Câu 2: Độ dày zone lý tưởng cho LFZ là bao nhiêu?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">< 0.3% giá</div>
                    <div class="quiz-option" data-index="1">0.5% - 1.5% giá</div>
                    <div class="quiz-option" data-index="2">> 3% giá</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <div class="question-text">Câu 3: Khi vẽ zone, điều nào sau đây ĐÚNG?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Chỉ cần vẽ theo body nến, bỏ qua wicks</div>
                    <div class="quiz-option" data-index="1">Vẽ càng tight càng tốt để có R:R cao</div>
                    <div class="quiz-option" data-index="2">Phải tính cả wicks/shadows của nến</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text">🎉 Bạn trả lời đúng <span id="correct-count">0</span>/3 câu!</div>
                <button class="retake-btn" onclick="resetQuiz()">Làm Lại Quiz</button>
            </div>
        </div>

        <!-- FOOTER -->
        <footer class="lesson-footer">
            <div class="footer-logo">
                <span class="gem">GEM</span> Trading Academy
            </div>
            <div class="footer-text">© 2024 GEM Trading Academy. All rights reserved.</div>
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

        function resetQuiz() {
            answeredCount = 0;
            correctCount = 0;

            document.querySelectorAll(''.quiz-question'').forEach(question => {
                question.classList.remove(''answered'');
                question.querySelectorAll(''.quiz-option'').forEach(opt => {
                    opt.classList.remove(''correct'', ''incorrect'');
                });
                question.querySelector(''.quiz-result'').className = ''quiz-result'';
            });

            document.querySelector(''.quiz-score'').classList.remove(''show'');
        }
    </script>
</body>
</html>',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 2.2: Cách Vẽ LFZ Chính Xác | GEM Trading Academy</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <style>
        :root {
            --primary-navy: #112250;
            --accent-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --error-red: #EF4444;
            --text-primary: #FFFFFF;
            --text-secondary: #A0AEC0;
            --bg-card: rgba(255, 255, 255, 0.05);
            --bg-card-hover: rgba(255, 255, 255, 0.08);
            --border-subtle: rgba(255, 255, 255, 0.1);
            --gradient-gold: linear-gradient(135deg, #FFBD59 0%, #FFCF87 100%);
            --gradient-green: linear-gradient(135deg, #10B981 0%, #34D399 100%);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--primary-navy);
            color: var(--text-primary);
            line-height: 1.7;
            min-height: 100vh;
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--primary-navy);
        }

        /* HEADER */
        .lesson-header {
            padding: 2rem 1.5rem;
            background: linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, transparent 100%);
            border-bottom: 1px solid var(--border-subtle);
            text-align: center;
        }

        .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--gradient-green);
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #000;
            margin-bottom: 1rem;
        }

        .lesson-chapter {
            font-size: 0.875rem;
            color: var(--success-green);
            font-weight: 500;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .lesson-meta {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            flex-wrap: wrap;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* CONTENT SECTION */
        .content-section {
            padding: 0;
        }

        .content-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1rem;
            padding: 1.5rem;
            border-left: 4px solid var(--success-green);
        }

        .content-card h2 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--success-green);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .content-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 1.25rem 0 0.75rem 0;
            color: var(--text-primary);
        }

        .content-card p {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            font-size: 0.9375rem;
        }

        .content-card ul, .content-card ol {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            padding-left: 1.5rem;
        }

        .content-card li {
            margin-bottom: 0.5rem;
            font-size: 0.9375rem;
        }

        /* IMAGE PLACEHOLDER */
        .image-placeholder {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
            border: 2px dashed var(--success-green);
            border-radius: 0.75rem;
            padding: 3rem 1.5rem;
            text-align: center;
            margin: 1.25rem 0;
        }

        .image-placeholder .icon {
            font-size: 2.5rem;
            margin-bottom: 0.75rem;
        }

        .image-placeholder .label {
            font-size: 0.875rem;
            color: var(--success-green);
            font-weight: 600;
        }

        .image-placeholder .dimensions {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
        }

        /* INFO BOX */
        .info-box {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .info-box.warning {
            background: rgba(255, 189, 89, 0.1);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .info-box.warning .info-box-title {
            color: var(--accent-gold);
        }

        .info-box-title {
            font-weight: 600;
            color: var(--success-green);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .info-box p {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin: 0;
        }

        /* STEP LIST */
        .step-list {
            counter-reset: step-counter;
            list-style: none;
            padding: 0;
            margin: 1rem 0;
        }

        .step-item {
            position: relative;
            padding: 1rem;
            padding-left: 3.5rem;
            background: var(--bg-card);
            border-radius: 0.75rem;
            margin-bottom: 0.75rem;
            border: 1px solid var(--border-subtle);
        }

        .step-item::before {
            counter-increment: step-counter;
            content: counter(step-counter);
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            width: 2rem;
            height: 2rem;
            background: var(--gradient-green);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.875rem;
            color: #000;
        }

        .step-item h4 {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .step-item p {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin: 0;
        }

        /* CODE BOX */
        .code-box {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border-subtle);
            border-radius: 0.5rem;
            padding: 1rem;
            margin: 1rem 0;
            font-family: ''JetBrains Mono'', monospace;
            font-size: 0.875rem;
            color: var(--accent-cyan);
        }

        .code-label {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
            font-family: ''Inter'', sans-serif;
        }

        /* CHECKLIST */
        .checklist {
            list-style: none;
            padding: 0;
            margin: 1rem 0;
        }

        .checklist li {
            padding: 0.5rem 0;
            padding-left: 2rem;
            position: relative;
            font-size: 0.9375rem;
            color: var(--text-secondary);
        }

        .checklist li::before {
            content: "☐";
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-size: 1rem;
        }

        /* EXAMPLE TABLE */
        .example-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            font-size: 0.875rem;
        }

        .example-table th,
        .example-table td {
            padding: 0.75rem;
            border: 1px solid var(--border-subtle);
            text-align: left;
        }

        .example-table th {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success-green);
            font-weight: 600;
        }

        .example-table td {
            color: var(--text-secondary);
        }

        /* SUMMARY BOX */
        .summary-box {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            margin: 1.5rem 1rem;
        }

        .summary-box h3 {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--success-green);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .summary-box li {
            position: relative;
            padding-left: 1.5rem;
            margin-bottom: 0.625rem;
            color: var(--text-secondary);
            font-size: 0.9375rem;
        }

        .summary-box li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-weight: bold;
        }

        /* QUIZ SECTION */
        .quiz-section {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1.5rem 1rem;
            padding: 1.5rem;
        }

        .quiz-header {
            text-align: center;
            margin-bottom: 1.5rem;
        }

        .quiz-header h3 {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
            margin-bottom: 0.25rem;
        }

        .quiz-header p {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .quiz-question {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin-bottom: 1rem;
        }

        .question-text {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .quiz-options {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.9375rem;
            color: var(--text-secondary);
        }

        .quiz-option:hover:not(.correct):not(.incorrect) {
            background: var(--bg-card-hover);
            border-color: var(--accent-gold);
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
            margin-top: 0.75rem;
            padding: 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success-green);
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: var(--error-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .score-text {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--gradient-gold);
            border: none;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #000;
            cursor: pointer;
            transition: transform 0.2s ease;
        }

        .retake-btn:hover {
            transform: scale(1.02);
        }

        /* FOOTER */
        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            border-top: 1px solid var(--border-subtle);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .footer-logo .gem {
            color: var(--accent-gold);
        }

        .footer-text {
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* MOBILE RESPONSIVE */
        @media (max-width: 600px) {
            .content-card {
                margin: 0.75rem 0;
                border-radius: 0;
                border-left: 4px solid var(--success-green);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-subtle);
            }

            .summary-box,
            .quiz-section {
                margin: 1rem 0;
                border-radius: 0;
            }

            .lesson-header {
                padding: 1.5rem 1rem;
            }

            .lesson-title {
                font-size: 1.5rem;
            }

            .example-table {
                font-size: 0.75rem;
            }

            .example-table th,
            .example-table td {
                padding: 0.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <!-- HEADER -->
        <header class="lesson-header">
            <div class="header-badge">
                <span>📈</span>
                <span>Tier 2 - Nâng Cao</span>
            </div>
            <div class="lesson-chapter">Chapter 2 - LFZ Mastery</div>
            <h1 class="lesson-title">Cách Vẽ LFZ Chính Xác</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 2.2</span></div>
                <div class="meta-item"><span>⏱️</span><span>12 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>3 câu quiz</span></div>
            </div>
        </header>

        <!-- CONTENT -->
        <main class="content-section">
            <!-- Section 1: Nguyên tắc vẽ LFZ -->
            <div class="content-card">
                <h2>📐 Nguyên Tắc Cơ Bản Khi Vẽ LFZ</h2>

                <p>Vẽ LFZ chính xác là kỹ năng quan trọng nhất trong GEM Frequency Method. Một LFZ được vẽ sai có thể dẫn đến entry kém, stoploss bị quét, hoặc miss opportunity.</p>

                <div class="info-box">
                    <div class="info-box-title">🔑 Quy Tắc Vàng Khi Vẽ LFZ</div>
                    <p>Entry Line = ĐỈNH của vùng Pause (gần giá hiện tại nhất)<br>
                    Stop Line = ĐÁY của vùng Pause (xa giá hiện tại nhất)</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📐</div>
                    <div class="label">Hình 2.2.1: Cấu Trúc LFZ - Entry và Stop Lines</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 2: 4 Bước Vẽ LFZ -->
            <div class="content-card">
                <h2>🎯 4 Bước Vẽ LFZ Chính Xác</h2>

                <div class="step-list">
                    <div class="step-item">
                        <h4>Xác Định Pattern</h4>
                        <p>Tìm UPU hoặc DPU pattern trên chart. Đảm bảo đủ 3 phases rõ ràng.</p>
                    </div>
                    <div class="step-item">
                        <h4>Đánh Dấu Vùng Pause</h4>
                        <p>Xác định điểm bắt đầu và kết thúc của Phase 2 (Pause). Đây là vùng tích lũy/consolidation.</p>
                    </div>
                    <div class="step-item">
                        <h4>Vẽ Entry Line</h4>
                        <p>Kẻ đường ngang tại ĐỈNH của vùng Pause. Đây là điểm entry khi giá pullback về.</p>
                    </div>
                    <div class="step-item">
                        <h4>Vẽ Stop Line</h4>
                        <p>Kẻ đường ngang tại ĐÁY của vùng Pause. Đây là điểm đặt stoploss.</p>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📝</div>
                    <div class="label">Hình 2.2.2: 4 Bước Vẽ LFZ Từ UPU Pattern</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Section 3: Quy tắc độ dày zone -->
            <div class="content-card">
                <h2>📏 Quy Tắc Độ Dày Zone</h2>

                <p>Độ dày của LFZ ảnh hưởng trực tiếp đến chất lượng trade. Zone quá dày = stoploss lớn, R:R kém. Zone quá mỏng = dễ bị false breakout.</p>

                <table class="example-table">
                    <thead>
                        <tr>
                            <th>Độ Dày</th>
                            <th>% Giá</th>
                            <th>Đánh Giá</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Quá Mỏng</td>
                            <td>< 0.3%</td>
                            <td>⚠️ Rủi ro cao</td>
                            <td>Thêm buffer hoặc skip</td>
                        </tr>
                        <tr>
                            <td>Lý Tưởng</td>
                            <td>0.5% - 1.5%</td>
                            <td>✅ Tối ưu</td>
                            <td>Trade với confidence cao</td>
                        </tr>
                        <tr>
                            <td>Chấp Nhận</td>
                            <td>1.5% - 2%</td>
                            <td>⚡ OK</td>
                            <td>Giảm position size</td>
                        </tr>
                        <tr>
                            <td>Quá Dày</td>
                            <td>> 2%</td>
                            <td>❌ R:R kém</td>
                            <td>Skip hoặc đợi retest</td>
                        </tr>
                    </tbody>
                </table>

                <div class="code-box">
                    <div class="code-label">Công thức tính độ dày zone:</div>
                    Độ dày (%) = (Stop Price - Entry Price) / Entry Price × 100
                </div>

                <div class="image-placeholder">
                    <div class="icon">📊</div>
                    <div class="label">Hình 2.2.3: So Sánh LFZ Mỏng vs Dày vs Lý Tưởng</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 4: Sai lầm thường gặp -->
            <div class="content-card">
                <h2>⚠️ Sai Lầm Thường Gặp Khi Vẽ LFZ</h2>

                <h3>1. Vẽ Ngược Entry và Stop</h3>
                <p>Với LFZ: Entry ở ĐỈNH Pause, Stop ở ĐÁY Pause. Nhiều người vẽ ngược lại!</p>

                <h3>2. Bỏ Qua Wicks</h3>
                <p>Phải tính cả shadow/wick của nến, không chỉ body. Zone nên bao phủ toàn bộ vùng Pause.</p>

                <h3>3. Zone Quá Tight</h3>
                <p>Vẽ zone quá sát = dễ bị sweep trước khi bounce. Nên thêm buffer 0.1-0.2%.</p>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Lưu Ý Quan Trọng</div>
                    <p>Khi không chắc chắn về vùng Pause, hãy mở rộng zone một chút để tránh bị stop hunt. Tốt hơn là có stoploss lớn hơn một chút nhưng không bị quét.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">❌</div>
                    <div class="label">Hình 2.2.4: Sai Lầm Phổ Biến vs Cách Vẽ Đúng</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 5: Thực hành -->
            <div class="content-card">
                <h2>✏️ Checklist Vẽ LFZ</h2>

                <p>Sử dụng checklist này mỗi khi vẽ LFZ để đảm bảo chính xác:</p>

                <ul class="checklist">
                    <li>Đã xác nhận pattern là UPU hoặc DPU</li>
                    <li>Phase 1 có momentum rõ ràng (≥2% move)</li>
                    <li>Phase 2 (Pause) là consolidation thật, không phải correction</li>
                    <li>Entry Line vẽ tại ĐỈNH của Pause</li>
                    <li>Stop Line vẽ tại ĐÁY của Pause</li>
                    <li>Độ dày zone trong khoảng 0.5% - 2%</li>
                    <li>Zone bao phủ cả wicks, không chỉ body</li>
                    <li>Zone nằm DƯỚI giá hiện tại</li>
                </ul>

                <div class="image-placeholder">
                    <div class="icon">✏️</div>
                    <div class="label">Hình 2.2.5: Ví Dụ Thực Hành - Vẽ LFZ Đúng Cách</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>
        </main>

        <!-- SUMMARY -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Entry Line = ĐỈNH của vùng Pause (gần giá hiện tại)</li>
                <li>Stop Line = ĐÁY của vùng Pause (xa giá hiện tại)</li>
                <li>4 bước: Xác định pattern → Đánh dấu Pause → Vẽ Entry → Vẽ Stop</li>
                <li>Độ dày zone lý tưởng: 0.5% - 1.5%</li>
                <li>Luôn tính cả wicks khi vẽ zone</li>
            </ul>
        </div>

        <!-- QUIZ -->
        <div class="quiz-section">
            <div class="quiz-header">
                <h3>🎯 Kiểm Tra Kiến Thức</h3>
                <p>Trả lời các câu hỏi để củng cố bài học</p>
            </div>

            <div class="quiz-question" data-correct="0">
                <div class="question-text">Câu 1: Khi vẽ LFZ, Entry Line được đặt ở đâu?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Tại ĐỈNH của vùng Pause (gần giá hiện tại nhất)</div>
                    <div class="quiz-option" data-index="1">Tại ĐÁY của vùng Pause (xa giá hiện tại nhất)</div>
                    <div class="quiz-option" data-index="2">Tại giữa vùng Pause</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <div class="question-text">Câu 2: Độ dày zone lý tưởng cho LFZ là bao nhiêu?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">< 0.3% giá</div>
                    <div class="quiz-option" data-index="1">0.5% - 1.5% giá</div>
                    <div class="quiz-option" data-index="2">> 3% giá</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <div class="question-text">Câu 3: Khi vẽ zone, điều nào sau đây ĐÚNG?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Chỉ cần vẽ theo body nến, bỏ qua wicks</div>
                    <div class="quiz-option" data-index="1">Vẽ càng tight càng tốt để có R:R cao</div>
                    <div class="quiz-option" data-index="2">Phải tính cả wicks/shadows của nến</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text">🎉 Bạn trả lời đúng <span id="correct-count">0</span>/3 câu!</div>
                <button class="retake-btn" onclick="resetQuiz()">Làm Lại Quiz</button>
            </div>
        </div>

        <!-- FOOTER -->
        <footer class="lesson-footer">
            <div class="footer-logo">
                <span class="gem">GEM</span> Trading Academy
            </div>
            <div class="footer-text">© 2024 GEM Trading Academy. All rights reserved.</div>
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

        function resetQuiz() {
            answeredCount = 0;
            correctCount = 0;

            document.querySelectorAll(''.quiz-question'').forEach(question => {
                question.classList.remove(''answered'');
                question.querySelectorAll(''.quiz-option'').forEach(opt => {
                    opt.classList.remove(''correct'', ''incorrect'');
                });
                question.querySelector(''.quiz-result'').className = ''quiz-result'';
            });

            document.querySelector(''.quiz-score'').classList.remove(''show'');
        }
    </script>
</body>
</html>',
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

-- Lesson 2.3: Xác Nhận Entry Tại LFZ
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch2-l3',
  'module-tier-2-ch2',
  'course-tier2-trading-advanced',
  'Bài 2.3: Xác Nhận Entry Tại LFZ',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 2.3: Xác Nhận Entry Tại LFZ | GEM Trading Academy</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <style>
        :root {
            --primary-navy: #112250;
            --accent-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --error-red: #EF4444;
            --text-primary: #FFFFFF;
            --text-secondary: #A0AEC0;
            --bg-card: rgba(255, 255, 255, 0.05);
            --bg-card-hover: rgba(255, 255, 255, 0.08);
            --border-subtle: rgba(255, 255, 255, 0.1);
            --gradient-gold: linear-gradient(135deg, #FFBD59 0%, #FFCF87 100%);
            --gradient-green: linear-gradient(135deg, #10B981 0%, #34D399 100%);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--primary-navy);
            color: var(--text-primary);
            line-height: 1.7;
            min-height: 100vh;
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--primary-navy);
        }

        /* HEADER */
        .lesson-header {
            padding: 2rem 1.5rem;
            background: linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, transparent 100%);
            border-bottom: 1px solid var(--border-subtle);
            text-align: center;
        }

        .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--gradient-green);
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #000;
            margin-bottom: 1rem;
        }

        .lesson-chapter {
            font-size: 0.875rem;
            color: var(--success-green);
            font-weight: 500;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .lesson-meta {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            flex-wrap: wrap;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* CONTENT SECTION */
        .content-section {
            padding: 0;
        }

        .content-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1rem;
            padding: 1.5rem;
            border-left: 4px solid var(--success-green);
        }

        .content-card h2 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--success-green);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .content-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 1.25rem 0 0.75rem 0;
            color: var(--text-primary);
        }

        .content-card p {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            font-size: 0.9375rem;
        }

        .content-card ul, .content-card ol {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            padding-left: 1.5rem;
        }

        .content-card li {
            margin-bottom: 0.5rem;
            font-size: 0.9375rem;
        }

        /* IMAGE PLACEHOLDER */
        .image-placeholder {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
            border: 2px dashed var(--success-green);
            border-radius: 0.75rem;
            padding: 3rem 1.5rem;
            text-align: center;
            margin: 1.25rem 0;
        }

        .image-placeholder .icon {
            font-size: 2.5rem;
            margin-bottom: 0.75rem;
        }

        .image-placeholder .label {
            font-size: 0.875rem;
            color: var(--success-green);
            font-weight: 600;
        }

        .image-placeholder .dimensions {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
        }

        /* INFO BOX */
        .info-box {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .info-box.warning {
            background: rgba(255, 189, 89, 0.1);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .info-box.warning .info-box-title {
            color: var(--accent-gold);
        }

        .info-box-title {
            font-weight: 600;
            color: var(--success-green);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .info-box p {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin: 0;
        }

        /* CANDLE PATTERN CARDS */
        .candle-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
        }

        .candle-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
        }

        .candle-card.strong {
            border-color: var(--success-green);
            background: rgba(16, 185, 129, 0.1);
        }

        .candle-icon {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }

        .candle-name {
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .candle-signal {
            font-size: 0.8125rem;
            color: var(--success-green);
        }

        .candle-desc {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.5rem;
        }

        /* VOLUME INDICATOR */
        .volume-box {
            background: rgba(0, 240, 255, 0.1);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .volume-title {
            font-weight: 600;
            color: var(--accent-cyan);
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .volume-levels {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        .volume-level {
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.8125rem;
            font-weight: 500;
        }

        .volume-level.low {
            background: rgba(239, 68, 68, 0.2);
            color: var(--error-red);
        }

        .volume-level.medium {
            background: rgba(255, 189, 89, 0.2);
            color: var(--accent-gold);
        }

        .volume-level.high {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success-green);
        }

        /* FLOW STEPS */
        .flow-container {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin: 1rem 0;
        }

        .flow-step {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: var(--bg-card);
            border-radius: 0.75rem;
            border: 1px solid var(--border-subtle);
        }

        .flow-number {
            width: 2.5rem;
            height: 2.5rem;
            background: var(--gradient-green);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1rem;
            color: #000;
            flex-shrink: 0;
        }

        .flow-content h4 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .flow-content p {
            font-size: 0.8125rem;
            color: var(--text-secondary);
            margin: 0;
        }

        .flow-arrow {
            text-align: center;
            color: var(--success-green);
            font-size: 1.25rem;
        }

        /* SUMMARY BOX */
        .summary-box {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            margin: 1.5rem 1rem;
        }

        .summary-box h3 {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--success-green);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .summary-box li {
            position: relative;
            padding-left: 1.5rem;
            margin-bottom: 0.625rem;
            color: var(--text-secondary);
            font-size: 0.9375rem;
        }

        .summary-box li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-weight: bold;
        }

        /* QUIZ SECTION */
        .quiz-section {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1.5rem 1rem;
            padding: 1.5rem;
        }

        .quiz-header {
            text-align: center;
            margin-bottom: 1.5rem;
        }

        .quiz-header h3 {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
            margin-bottom: 0.25rem;
        }

        .quiz-header p {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .quiz-question {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin-bottom: 1rem;
        }

        .question-text {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .quiz-options {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.9375rem;
            color: var(--text-secondary);
        }

        .quiz-option:hover:not(.correct):not(.incorrect) {
            background: var(--bg-card-hover);
            border-color: var(--accent-gold);
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
            margin-top: 0.75rem;
            padding: 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success-green);
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: var(--error-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .score-text {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--gradient-gold);
            border: none;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #000;
            cursor: pointer;
            transition: transform 0.2s ease;
        }

        .retake-btn:hover {
            transform: scale(1.02);
        }

        /* FOOTER */
        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            border-top: 1px solid var(--border-subtle);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .footer-logo .gem {
            color: var(--accent-gold);
        }

        .footer-text {
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* MOBILE RESPONSIVE */
        @media (max-width: 600px) {
            .content-card {
                margin: 0.75rem 0;
                border-radius: 0;
                border-left: 4px solid var(--success-green);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-subtle);
            }

            .summary-box,
            .quiz-section {
                margin: 1rem 0;
                border-radius: 0;
            }

            .lesson-header {
                padding: 1.5rem 1rem;
            }

            .lesson-title {
                font-size: 1.5rem;
            }

            .candle-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <!-- HEADER -->
        <header class="lesson-header">
            <div class="header-badge">
                <span>📈</span>
                <span>Tier 2 - Nâng Cao</span>
            </div>
            <div class="lesson-chapter">Chapter 2 - LFZ Mastery</div>
            <h1 class="lesson-title">Xác Nhận Entry Tại LFZ</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 2.3</span></div>
                <div class="meta-item"><span>⏱️</span><span>10 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <!-- CONTENT -->
        <main class="content-section">
            <!-- Section 1: Tại sao cần xác nhận -->
            <div class="content-card">
                <h2>❓ Tại Sao Cần Xác Nhận Entry?</h2>

                <p>Không phải mọi lần giá chạm LFZ đều nên entry! Đợi xác nhận (confirmation) giúp tăng win rate từ 60% lên 72%+ và giảm false entries.</p>

                <div class="info-box">
                    <div class="info-box-title">💡 Xác Nhận = Bằng Chứng Buyers Đang Tham Gia</div>
                    <p>Khi giá về LFZ, chúng ta cần thấy dấu hiệu buyers đang mua vào (buying pressure) trước khi entry LONG. Các candlestick patterns và volume là những confirmation tốt nhất.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🎯</div>
                    <div class="label">Hình 2.3.1: Entry Không Xác Nhận vs Có Xác Nhận</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 2: Bullish Candlestick Patterns -->
            <div class="content-card">
                <h2>🕯️ Các Mẫu Nến Bullish Xác Nhận</h2>

                <p>Đây là những candlestick patterns cho tín hiệu LONG mạnh khi xuất hiện tại LFZ:</p>

                <div class="candle-grid">
                    <div class="candle-card strong">
                        <div class="candle-icon">🔨</div>
                        <div class="candle-name">Hammer</div>
                        <div class="candle-signal">⭐⭐⭐ Mạnh</div>
                        <div class="candle-desc">Bóng dưới dài ≥2x body<br>Thân nến nhỏ ở trên</div>
                    </div>
                    <div class="candle-card strong">
                        <div class="candle-icon">🌅</div>
                        <div class="candle-name">Morning Star</div>
                        <div class="candle-signal">⭐⭐⭐ Mạnh</div>
                        <div class="candle-desc">Pattern 3 nến<br>Đảo chiều từ giảm → tăng</div>
                    </div>
                    <div class="candle-card strong">
                        <div class="candle-icon">🔥</div>
                        <div class="candle-name">Bullish Engulfing</div>
                        <div class="candle-signal">⭐⭐⭐ Rất mạnh</div>
                        <div class="candle-desc">Nến xanh nuốt trọn nến đỏ<br>Volume cao = tuyệt vời</div>
                    </div>
                    <div class="candle-card">
                        <div class="candle-icon">🪢</div>
                        <div class="candle-name">Tweezer Bottom</div>
                        <div class="candle-signal">⭐⭐ Khá</div>
                        <div class="candle-desc">2 nến có đáy bằng nhau<br>Double test support</div>
                    </div>
                    <div class="candle-card">
                        <div class="candle-icon">📍</div>
                        <div class="candle-name">Dragonfly Doji</div>
                        <div class="candle-signal">⭐⭐ Khá</div>
                        <div class="candle-desc">Body cực nhỏ, bóng dưới dài<br>Buyers reject giá thấp</div>
                    </div>
                    <div class="candle-card">
                        <div class="candle-icon">💹</div>
                        <div class="candle-name">Piercing Pattern</div>
                        <div class="candle-signal">⭐⭐ Khá</div>
                        <div class="candle-desc">Nến xanh close > 50% nến đỏ<br>Bullish reversal</div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🕯️</div>
                    <div class="label">Hình 2.3.2: 6 Mẫu Nến Bullish Confirmation</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Section 3: Volume Confirmation -->
            <div class="content-card">
                <h2>📊 Volume Confirmation</h2>

                <p>Volume là "nhiên liệu" của price movement. Khi bounce từ LFZ có volume cao, xác suất thành công tăng đáng kể.</p>

                <div class="volume-box">
                    <div class="volume-title">📈 Đánh Giá Volume Khi Entry LFZ</div>
                    <div class="volume-levels">
                        <div class="volume-level high">Volume > 1.5x TB = Tuyệt vời ✓</div>
                        <div class="volume-level medium">Volume = TB = Chấp nhận</div>
                        <div class="volume-level low">Volume < 0.5x TB = Cẩn thận!</div>
                    </div>
                </div>

                <h3>Cách Đọc Volume Tại LFZ</h3>
                <ul>
                    <li><strong>Volume tăng đột biến + nến xanh:</strong> Buying pressure mạnh, entry confident</li>
                    <li><strong>Volume bình thường + nến xanh:</strong> OK, có thể entry với position size nhỏ hơn</li>
                    <li><strong>Volume thấp + nến xanh:</strong> Thiếu conviction, nên đợi thêm confirmation</li>
                    <li><strong>Volume cao + nến đỏ:</strong> Selling pressure, LFZ có thể bị phá vỡ</li>
                </ul>

                <div class="image-placeholder">
                    <div class="icon">📊</div>
                    <div class="label">Hình 2.3.3: Volume Analysis Tại LFZ</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 4: Quy trình Entry -->
            <div class="content-card">
                <h2>🎯 Quy Trình Entry 5 Bước</h2>

                <div class="flow-container">
                    <div class="flow-step">
                        <div class="flow-number">1</div>
                        <div class="flow-content">
                            <h4>Đợi Giá Chạm LFZ</h4>
                            <p>Giá pullback về vùng LFZ đã vẽ trước đó</p>
                        </div>
                    </div>
                    <div class="flow-arrow">↓</div>
                    <div class="flow-step">
                        <div class="flow-number">2</div>
                        <div class="flow-content">
                            <h4>Quan Sát Phản Ứng</h4>
                            <p>Xem giá phản ứng thế nào khi chạm zone (reject hay xuyên qua)</p>
                        </div>
                    </div>
                    <div class="flow-arrow">↓</div>
                    <div class="flow-step">
                        <div class="flow-number">3</div>
                        <div class="flow-content">
                            <h4>Đợi Bullish Candle</h4>
                            <p>Đợi xuất hiện một trong các mẫu nến bullish confirmation</p>
                        </div>
                    </div>
                    <div class="flow-arrow">↓</div>
                    <div class="flow-step">
                        <div class="flow-number">4</div>
                        <div class="flow-content">
                            <h4>Kiểm Tra Volume</h4>
                            <p>Xác nhận volume >= trung bình trên nến bullish</p>
                        </div>
                    </div>
                    <div class="flow-arrow">↓</div>
                    <div class="flow-step">
                        <div class="flow-number">5</div>
                        <div class="flow-content">
                            <h4>Entry LONG</h4>
                            <p>Mở lệnh LONG, SL dưới đáy LFZ, TP theo R:R tối thiểu 1:2</p>
                        </div>
                    </div>
                </div>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Lưu Ý Quan Trọng</div>
                    <p>KHÔNG entry ngay khi giá chạm LFZ! Luôn đợi ít nhất 1 nến bullish confirmation đóng cửa hoàn toàn trước khi vào lệnh.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🎯</div>
                    <div class="label">Hình 2.3.4: Quy Trình Entry 5 Bước Tại LFZ</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Section 5: Ví dụ thực tế -->
            <div class="content-card">
                <h2>📈 Ví Dụ Thực Tế</h2>

                <h3>Case Study: BTC/USDT 4H</h3>
                <p>BTC tạo UPU pattern → LFZ tại $41,500-$42,000. Giá pullback về test LFZ:</p>

                <ol>
                    <li><strong>Giá chạm $41,650</strong> - Trong vùng LFZ ✓</li>
                    <li><strong>Hammer candle hình thành</strong> - Bóng dưới dài reject $41,500 ✓</li>
                    <li><strong>Volume spike 180% so với TB</strong> - Buying pressure mạnh ✓</li>
                    <li><strong>Entry LONG tại $41,800</strong> sau khi Hammer close</li>
                    <li><strong>SL: $41,400</strong> (dưới đáy LFZ)</li>
                    <li><strong>TP1: $43,000</strong> (R:R 1:2), <strong>TP2: $44,200</strong> (R:R 1:3)</li>
                </ol>

                <div class="image-placeholder">
                    <div class="icon">📈</div>
                    <div class="label">Hình 2.3.5: Case Study - Entry LFZ Với Hammer + Volume</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>
        </main>

        <!-- SUMMARY -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Luôn đợi xác nhận trước khi entry tại LFZ</li>
                <li>3 mẫu nến mạnh nhất: Hammer, Morning Star, Bullish Engulfing</li>
                <li>Volume > 1.5x trung bình = tín hiệu mạnh</li>
                <li>Quy trình 5 bước: Chạm zone → Quan sát → Bullish candle → Volume → Entry</li>
                <li>KHÔNG entry ngay khi giá chạm zone, đợi candle close</li>
            </ul>
        </div>

        <!-- QUIZ -->
        <div class="quiz-section">
            <div class="quiz-header">
                <h3>🎯 Kiểm Tra Kiến Thức</h3>
                <p>Trả lời các câu hỏi để củng cố bài học</p>
            </div>

            <div class="quiz-question" data-correct="1">
                <div class="question-text">Câu 1: Mẫu nến nào sau đây cho tín hiệu bullish MẠNH NHẤT khi xuất hiện tại LFZ?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Doji thường</div>
                    <div class="quiz-option" data-index="1">Bullish Engulfing với volume cao</div>
                    <div class="quiz-option" data-index="2">Nến xanh nhỏ body</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <div class="question-text">Câu 2: Khi nào là thời điểm đúng để entry LONG tại LFZ?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Sau khi nến bullish confirmation đóng cửa hoàn toàn</div>
                    <div class="quiz-option" data-index="1">Ngay khi giá chạm vào LFZ</div>
                    <div class="quiz-option" data-index="2">Khi thấy nến đỏ trong LFZ</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text">🎉 Bạn trả lời đúng <span id="correct-count">0</span>/2 câu!</div>
                <button class="retake-btn" onclick="resetQuiz()">Làm Lại Quiz</button>
            </div>
        </div>

        <!-- FOOTER -->
        <footer class="lesson-footer">
            <div class="footer-logo">
                <span class="gem">GEM</span> Trading Academy
            </div>
            <div class="footer-text">© 2024 GEM Trading Academy. All rights reserved.</div>
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

        function resetQuiz() {
            answeredCount = 0;
            correctCount = 0;

            document.querySelectorAll(''.quiz-question'').forEach(question => {
                question.classList.remove(''answered'');
                question.querySelectorAll(''.quiz-option'').forEach(opt => {
                    opt.classList.remove(''correct'', ''incorrect'');
                });
                question.querySelector(''.quiz-result'').className = ''quiz-result'';
            });

            document.querySelector(''.quiz-score'').classList.remove(''show'');
        }
    </script>
</body>
</html>',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 2.3: Xác Nhận Entry Tại LFZ | GEM Trading Academy</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <style>
        :root {
            --primary-navy: #112250;
            --accent-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --error-red: #EF4444;
            --text-primary: #FFFFFF;
            --text-secondary: #A0AEC0;
            --bg-card: rgba(255, 255, 255, 0.05);
            --bg-card-hover: rgba(255, 255, 255, 0.08);
            --border-subtle: rgba(255, 255, 255, 0.1);
            --gradient-gold: linear-gradient(135deg, #FFBD59 0%, #FFCF87 100%);
            --gradient-green: linear-gradient(135deg, #10B981 0%, #34D399 100%);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--primary-navy);
            color: var(--text-primary);
            line-height: 1.7;
            min-height: 100vh;
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--primary-navy);
        }

        /* HEADER */
        .lesson-header {
            padding: 2rem 1.5rem;
            background: linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, transparent 100%);
            border-bottom: 1px solid var(--border-subtle);
            text-align: center;
        }

        .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--gradient-green);
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #000;
            margin-bottom: 1rem;
        }

        .lesson-chapter {
            font-size: 0.875rem;
            color: var(--success-green);
            font-weight: 500;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .lesson-meta {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            flex-wrap: wrap;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* CONTENT SECTION */
        .content-section {
            padding: 0;
        }

        .content-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1rem;
            padding: 1.5rem;
            border-left: 4px solid var(--success-green);
        }

        .content-card h2 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--success-green);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .content-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 1.25rem 0 0.75rem 0;
            color: var(--text-primary);
        }

        .content-card p {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            font-size: 0.9375rem;
        }

        .content-card ul, .content-card ol {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            padding-left: 1.5rem;
        }

        .content-card li {
            margin-bottom: 0.5rem;
            font-size: 0.9375rem;
        }

        /* IMAGE PLACEHOLDER */
        .image-placeholder {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
            border: 2px dashed var(--success-green);
            border-radius: 0.75rem;
            padding: 3rem 1.5rem;
            text-align: center;
            margin: 1.25rem 0;
        }

        .image-placeholder .icon {
            font-size: 2.5rem;
            margin-bottom: 0.75rem;
        }

        .image-placeholder .label {
            font-size: 0.875rem;
            color: var(--success-green);
            font-weight: 600;
        }

        .image-placeholder .dimensions {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
        }

        /* INFO BOX */
        .info-box {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .info-box.warning {
            background: rgba(255, 189, 89, 0.1);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .info-box.warning .info-box-title {
            color: var(--accent-gold);
        }

        .info-box-title {
            font-weight: 600;
            color: var(--success-green);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .info-box p {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin: 0;
        }

        /* CANDLE PATTERN CARDS */
        .candle-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
        }

        .candle-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
        }

        .candle-card.strong {
            border-color: var(--success-green);
            background: rgba(16, 185, 129, 0.1);
        }

        .candle-icon {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }

        .candle-name {
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .candle-signal {
            font-size: 0.8125rem;
            color: var(--success-green);
        }

        .candle-desc {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.5rem;
        }

        /* VOLUME INDICATOR */
        .volume-box {
            background: rgba(0, 240, 255, 0.1);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .volume-title {
            font-weight: 600;
            color: var(--accent-cyan);
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .volume-levels {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        .volume-level {
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.8125rem;
            font-weight: 500;
        }

        .volume-level.low {
            background: rgba(239, 68, 68, 0.2);
            color: var(--error-red);
        }

        .volume-level.medium {
            background: rgba(255, 189, 89, 0.2);
            color: var(--accent-gold);
        }

        .volume-level.high {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success-green);
        }

        /* FLOW STEPS */
        .flow-container {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin: 1rem 0;
        }

        .flow-step {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: var(--bg-card);
            border-radius: 0.75rem;
            border: 1px solid var(--border-subtle);
        }

        .flow-number {
            width: 2.5rem;
            height: 2.5rem;
            background: var(--gradient-green);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1rem;
            color: #000;
            flex-shrink: 0;
        }

        .flow-content h4 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .flow-content p {
            font-size: 0.8125rem;
            color: var(--text-secondary);
            margin: 0;
        }

        .flow-arrow {
            text-align: center;
            color: var(--success-green);
            font-size: 1.25rem;
        }

        /* SUMMARY BOX */
        .summary-box {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            margin: 1.5rem 1rem;
        }

        .summary-box h3 {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--success-green);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .summary-box li {
            position: relative;
            padding-left: 1.5rem;
            margin-bottom: 0.625rem;
            color: var(--text-secondary);
            font-size: 0.9375rem;
        }

        .summary-box li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-weight: bold;
        }

        /* QUIZ SECTION */
        .quiz-section {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1.5rem 1rem;
            padding: 1.5rem;
        }

        .quiz-header {
            text-align: center;
            margin-bottom: 1.5rem;
        }

        .quiz-header h3 {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
            margin-bottom: 0.25rem;
        }

        .quiz-header p {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .quiz-question {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin-bottom: 1rem;
        }

        .question-text {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .quiz-options {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.9375rem;
            color: var(--text-secondary);
        }

        .quiz-option:hover:not(.correct):not(.incorrect) {
            background: var(--bg-card-hover);
            border-color: var(--accent-gold);
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
            margin-top: 0.75rem;
            padding: 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success-green);
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: var(--error-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .score-text {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--gradient-gold);
            border: none;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #000;
            cursor: pointer;
            transition: transform 0.2s ease;
        }

        .retake-btn:hover {
            transform: scale(1.02);
        }

        /* FOOTER */
        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            border-top: 1px solid var(--border-subtle);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .footer-logo .gem {
            color: var(--accent-gold);
        }

        .footer-text {
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* MOBILE RESPONSIVE */
        @media (max-width: 600px) {
            .content-card {
                margin: 0.75rem 0;
                border-radius: 0;
                border-left: 4px solid var(--success-green);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-subtle);
            }

            .summary-box,
            .quiz-section {
                margin: 1rem 0;
                border-radius: 0;
            }

            .lesson-header {
                padding: 1.5rem 1rem;
            }

            .lesson-title {
                font-size: 1.5rem;
            }

            .candle-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <!-- HEADER -->
        <header class="lesson-header">
            <div class="header-badge">
                <span>📈</span>
                <span>Tier 2 - Nâng Cao</span>
            </div>
            <div class="lesson-chapter">Chapter 2 - LFZ Mastery</div>
            <h1 class="lesson-title">Xác Nhận Entry Tại LFZ</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 2.3</span></div>
                <div class="meta-item"><span>⏱️</span><span>10 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <!-- CONTENT -->
        <main class="content-section">
            <!-- Section 1: Tại sao cần xác nhận -->
            <div class="content-card">
                <h2>❓ Tại Sao Cần Xác Nhận Entry?</h2>

                <p>Không phải mọi lần giá chạm LFZ đều nên entry! Đợi xác nhận (confirmation) giúp tăng win rate từ 60% lên 72%+ và giảm false entries.</p>

                <div class="info-box">
                    <div class="info-box-title">💡 Xác Nhận = Bằng Chứng Buyers Đang Tham Gia</div>
                    <p>Khi giá về LFZ, chúng ta cần thấy dấu hiệu buyers đang mua vào (buying pressure) trước khi entry LONG. Các candlestick patterns và volume là những confirmation tốt nhất.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🎯</div>
                    <div class="label">Hình 2.3.1: Entry Không Xác Nhận vs Có Xác Nhận</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 2: Bullish Candlestick Patterns -->
            <div class="content-card">
                <h2>🕯️ Các Mẫu Nến Bullish Xác Nhận</h2>

                <p>Đây là những candlestick patterns cho tín hiệu LONG mạnh khi xuất hiện tại LFZ:</p>

                <div class="candle-grid">
                    <div class="candle-card strong">
                        <div class="candle-icon">🔨</div>
                        <div class="candle-name">Hammer</div>
                        <div class="candle-signal">⭐⭐⭐ Mạnh</div>
                        <div class="candle-desc">Bóng dưới dài ≥2x body<br>Thân nến nhỏ ở trên</div>
                    </div>
                    <div class="candle-card strong">
                        <div class="candle-icon">🌅</div>
                        <div class="candle-name">Morning Star</div>
                        <div class="candle-signal">⭐⭐⭐ Mạnh</div>
                        <div class="candle-desc">Pattern 3 nến<br>Đảo chiều từ giảm → tăng</div>
                    </div>
                    <div class="candle-card strong">
                        <div class="candle-icon">🔥</div>
                        <div class="candle-name">Bullish Engulfing</div>
                        <div class="candle-signal">⭐⭐⭐ Rất mạnh</div>
                        <div class="candle-desc">Nến xanh nuốt trọn nến đỏ<br>Volume cao = tuyệt vời</div>
                    </div>
                    <div class="candle-card">
                        <div class="candle-icon">🪢</div>
                        <div class="candle-name">Tweezer Bottom</div>
                        <div class="candle-signal">⭐⭐ Khá</div>
                        <div class="candle-desc">2 nến có đáy bằng nhau<br>Double test support</div>
                    </div>
                    <div class="candle-card">
                        <div class="candle-icon">📍</div>
                        <div class="candle-name">Dragonfly Doji</div>
                        <div class="candle-signal">⭐⭐ Khá</div>
                        <div class="candle-desc">Body cực nhỏ, bóng dưới dài<br>Buyers reject giá thấp</div>
                    </div>
                    <div class="candle-card">
                        <div class="candle-icon">💹</div>
                        <div class="candle-name">Piercing Pattern</div>
                        <div class="candle-signal">⭐⭐ Khá</div>
                        <div class="candle-desc">Nến xanh close > 50% nến đỏ<br>Bullish reversal</div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🕯️</div>
                    <div class="label">Hình 2.3.2: 6 Mẫu Nến Bullish Confirmation</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Section 3: Volume Confirmation -->
            <div class="content-card">
                <h2>📊 Volume Confirmation</h2>

                <p>Volume là "nhiên liệu" của price movement. Khi bounce từ LFZ có volume cao, xác suất thành công tăng đáng kể.</p>

                <div class="volume-box">
                    <div class="volume-title">📈 Đánh Giá Volume Khi Entry LFZ</div>
                    <div class="volume-levels">
                        <div class="volume-level high">Volume > 1.5x TB = Tuyệt vời ✓</div>
                        <div class="volume-level medium">Volume = TB = Chấp nhận</div>
                        <div class="volume-level low">Volume < 0.5x TB = Cẩn thận!</div>
                    </div>
                </div>

                <h3>Cách Đọc Volume Tại LFZ</h3>
                <ul>
                    <li><strong>Volume tăng đột biến + nến xanh:</strong> Buying pressure mạnh, entry confident</li>
                    <li><strong>Volume bình thường + nến xanh:</strong> OK, có thể entry với position size nhỏ hơn</li>
                    <li><strong>Volume thấp + nến xanh:</strong> Thiếu conviction, nên đợi thêm confirmation</li>
                    <li><strong>Volume cao + nến đỏ:</strong> Selling pressure, LFZ có thể bị phá vỡ</li>
                </ul>

                <div class="image-placeholder">
                    <div class="icon">📊</div>
                    <div class="label">Hình 2.3.3: Volume Analysis Tại LFZ</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 4: Quy trình Entry -->
            <div class="content-card">
                <h2>🎯 Quy Trình Entry 5 Bước</h2>

                <div class="flow-container">
                    <div class="flow-step">
                        <div class="flow-number">1</div>
                        <div class="flow-content">
                            <h4>Đợi Giá Chạm LFZ</h4>
                            <p>Giá pullback về vùng LFZ đã vẽ trước đó</p>
                        </div>
                    </div>
                    <div class="flow-arrow">↓</div>
                    <div class="flow-step">
                        <div class="flow-number">2</div>
                        <div class="flow-content">
                            <h4>Quan Sát Phản Ứng</h4>
                            <p>Xem giá phản ứng thế nào khi chạm zone (reject hay xuyên qua)</p>
                        </div>
                    </div>
                    <div class="flow-arrow">↓</div>
                    <div class="flow-step">
                        <div class="flow-number">3</div>
                        <div class="flow-content">
                            <h4>Đợi Bullish Candle</h4>
                            <p>Đợi xuất hiện một trong các mẫu nến bullish confirmation</p>
                        </div>
                    </div>
                    <div class="flow-arrow">↓</div>
                    <div class="flow-step">
                        <div class="flow-number">4</div>
                        <div class="flow-content">
                            <h4>Kiểm Tra Volume</h4>
                            <p>Xác nhận volume >= trung bình trên nến bullish</p>
                        </div>
                    </div>
                    <div class="flow-arrow">↓</div>
                    <div class="flow-step">
                        <div class="flow-number">5</div>
                        <div class="flow-content">
                            <h4>Entry LONG</h4>
                            <p>Mở lệnh LONG, SL dưới đáy LFZ, TP theo R:R tối thiểu 1:2</p>
                        </div>
                    </div>
                </div>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Lưu Ý Quan Trọng</div>
                    <p>KHÔNG entry ngay khi giá chạm LFZ! Luôn đợi ít nhất 1 nến bullish confirmation đóng cửa hoàn toàn trước khi vào lệnh.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🎯</div>
                    <div class="label">Hình 2.3.4: Quy Trình Entry 5 Bước Tại LFZ</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Section 5: Ví dụ thực tế -->
            <div class="content-card">
                <h2>📈 Ví Dụ Thực Tế</h2>

                <h3>Case Study: BTC/USDT 4H</h3>
                <p>BTC tạo UPU pattern → LFZ tại $41,500-$42,000. Giá pullback về test LFZ:</p>

                <ol>
                    <li><strong>Giá chạm $41,650</strong> - Trong vùng LFZ ✓</li>
                    <li><strong>Hammer candle hình thành</strong> - Bóng dưới dài reject $41,500 ✓</li>
                    <li><strong>Volume spike 180% so với TB</strong> - Buying pressure mạnh ✓</li>
                    <li><strong>Entry LONG tại $41,800</strong> sau khi Hammer close</li>
                    <li><strong>SL: $41,400</strong> (dưới đáy LFZ)</li>
                    <li><strong>TP1: $43,000</strong> (R:R 1:2), <strong>TP2: $44,200</strong> (R:R 1:3)</li>
                </ol>

                <div class="image-placeholder">
                    <div class="icon">📈</div>
                    <div class="label">Hình 2.3.5: Case Study - Entry LFZ Với Hammer + Volume</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>
        </main>

        <!-- SUMMARY -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Luôn đợi xác nhận trước khi entry tại LFZ</li>
                <li>3 mẫu nến mạnh nhất: Hammer, Morning Star, Bullish Engulfing</li>
                <li>Volume > 1.5x trung bình = tín hiệu mạnh</li>
                <li>Quy trình 5 bước: Chạm zone → Quan sát → Bullish candle → Volume → Entry</li>
                <li>KHÔNG entry ngay khi giá chạm zone, đợi candle close</li>
            </ul>
        </div>

        <!-- QUIZ -->
        <div class="quiz-section">
            <div class="quiz-header">
                <h3>🎯 Kiểm Tra Kiến Thức</h3>
                <p>Trả lời các câu hỏi để củng cố bài học</p>
            </div>

            <div class="quiz-question" data-correct="1">
                <div class="question-text">Câu 1: Mẫu nến nào sau đây cho tín hiệu bullish MẠNH NHẤT khi xuất hiện tại LFZ?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Doji thường</div>
                    <div class="quiz-option" data-index="1">Bullish Engulfing với volume cao</div>
                    <div class="quiz-option" data-index="2">Nến xanh nhỏ body</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <div class="question-text">Câu 2: Khi nào là thời điểm đúng để entry LONG tại LFZ?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Sau khi nến bullish confirmation đóng cửa hoàn toàn</div>
                    <div class="quiz-option" data-index="1">Ngay khi giá chạm vào LFZ</div>
                    <div class="quiz-option" data-index="2">Khi thấy nến đỏ trong LFZ</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text">🎉 Bạn trả lời đúng <span id="correct-count">0</span>/2 câu!</div>
                <button class="retake-btn" onclick="resetQuiz()">Làm Lại Quiz</button>
            </div>
        </div>

        <!-- FOOTER -->
        <footer class="lesson-footer">
            <div class="footer-logo">
                <span class="gem">GEM</span> Trading Academy
            </div>
            <div class="footer-text">© 2024 GEM Trading Academy. All rights reserved.</div>
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

        function resetQuiz() {
            answeredCount = 0;
            correctCount = 0;

            document.querySelectorAll(''.quiz-question'').forEach(question => {
                question.classList.remove(''answered'');
                question.querySelectorAll(''.quiz-option'').forEach(opt => {
                    opt.classList.remove(''correct'', ''incorrect'');
                });
                question.querySelector(''.quiz-result'').className = ''quiz-result'';
            });

            document.querySelector(''.quiz-score'').classList.remove(''show'');
        }
    </script>
</body>
</html>',
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

-- Lesson 2.4: So Sánh HFZ và LFZ
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch2-l4',
  'module-tier-2-ch2',
  'course-tier2-trading-advanced',
  'Bài 2.4: So Sánh HFZ và LFZ',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 2.4: So Sánh HFZ và LFZ | GEM Trading Academy</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <style>
        :root {
            --primary-navy: #112250;
            --accent-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --error-red: #EF4444;
            --text-primary: #FFFFFF;
            --text-secondary: #A0AEC0;
            --bg-card: rgba(255, 255, 255, 0.05);
            --bg-card-hover: rgba(255, 255, 255, 0.08);
            --border-subtle: rgba(255, 255, 255, 0.1);
            --gradient-gold: linear-gradient(135deg, #FFBD59 0%, #FFCF87 100%);
            --gradient-green: linear-gradient(135deg, #10B981 0%, #34D399 100%);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--primary-navy);
            color: var(--text-primary);
            line-height: 1.7;
            min-height: 100vh;
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--primary-navy);
        }

        /* HEADER */
        .lesson-header {
            padding: 2rem 1.5rem;
            background: linear-gradient(180deg, rgba(106, 91, 255, 0.15) 0%, transparent 100%);
            border-bottom: 1px solid var(--border-subtle);
            text-align: center;
        }

        .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: linear-gradient(135deg, #6A5BFF 0%, #8B7FFF 100%);
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #fff;
            margin-bottom: 1rem;
        }

        .lesson-chapter {
            font-size: 0.875rem;
            color: var(--accent-purple);
            font-weight: 500;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .lesson-meta {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            flex-wrap: wrap;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* CONTENT SECTION */
        .content-section {
            padding: 0;
        }

        .content-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1rem;
            padding: 1.5rem;
            border-left: 4px solid var(--accent-purple);
        }

        .content-card h2 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--accent-purple);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .content-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 1.25rem 0 0.75rem 0;
            color: var(--text-primary);
        }

        .content-card p {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            font-size: 0.9375rem;
        }

        .content-card ul, .content-card ol {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            padding-left: 1.5rem;
        }

        .content-card li {
            margin-bottom: 0.5rem;
            font-size: 0.9375rem;
        }

        /* IMAGE PLACEHOLDER */
        .image-placeholder {
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.2) 0%, rgba(106, 91, 255, 0.1) 100%);
            border: 2px dashed var(--accent-purple);
            border-radius: 0.75rem;
            padding: 3rem 1.5rem;
            text-align: center;
            margin: 1.25rem 0;
        }

        .image-placeholder .icon {
            font-size: 2.5rem;
            margin-bottom: 0.75rem;
        }

        .image-placeholder .label {
            font-size: 0.875rem;
            color: var(--accent-purple);
            font-weight: 600;
        }

        .image-placeholder .dimensions {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
        }

        /* COMPARISON TABLE */
        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            font-size: 0.875rem;
        }

        .comparison-table th,
        .comparison-table td {
            padding: 0.875rem;
            border: 1px solid var(--border-subtle);
            text-align: left;
        }

        .comparison-table th {
            background: rgba(106, 91, 255, 0.2);
            font-weight: 600;
        }

        .comparison-table th:first-child {
            color: var(--text-primary);
        }

        .comparison-table th.lfz {
            color: var(--success-green);
            text-align: center;
        }

        .comparison-table th.hfz {
            color: var(--error-red);
            text-align: center;
        }

        .comparison-table td {
            color: var(--text-secondary);
        }

        .comparison-table td:nth-child(2) {
            background: rgba(16, 185, 129, 0.05);
            text-align: center;
        }

        .comparison-table td:nth-child(3) {
            background: rgba(239, 68, 68, 0.05);
            text-align: center;
        }

        /* VS CARDS */
        .vs-container {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            gap: 1rem;
            align-items: center;
            margin: 1.5rem 0;
        }

        .zone-card {
            background: var(--bg-card);
            border-radius: 1rem;
            padding: 1.5rem;
            text-align: center;
        }

        .zone-card.lfz {
            border: 2px solid var(--success-green);
            background: rgba(16, 185, 129, 0.1);
        }

        .zone-card.hfz {
            border: 2px solid var(--error-red);
            background: rgba(239, 68, 68, 0.1);
        }

        .zone-emoji {
            font-size: 3rem;
            margin-bottom: 0.75rem;
        }

        .zone-name {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .zone-card.lfz .zone-name {
            color: var(--success-green);
        }

        .zone-card.hfz .zone-name {
            color: var(--error-red);
        }

        .zone-desc {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .vs-divider {
            font-size: 2rem;
            font-weight: 700;
            color: var(--accent-purple);
        }

        /* DECISION BOX */
        .decision-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        .decision-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.75rem;
            padding: 1rem;
        }

        .decision-card h4 {
            font-size: 0.9375rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .decision-card.lfz h4 {
            color: var(--success-green);
        }

        .decision-card.hfz h4 {
            color: var(--error-red);
        }

        .decision-card ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .decision-card li {
            font-size: 0.8125rem;
            color: var(--text-secondary);
            padding: 0.25rem 0;
            padding-left: 1.25rem;
            position: relative;
        }

        .decision-card.lfz li::before {
            content: "→";
            position: absolute;
            left: 0;
            color: var(--success-green);
        }

        .decision-card.hfz li::before {
            content: "→";
            position: absolute;
            left: 0;
            color: var(--error-red);
        }

        /* INFO BOX */
        .info-box {
            background: rgba(106, 91, 255, 0.1);
            border: 1px solid rgba(106, 91, 255, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .info-box-title {
            font-weight: 600;
            color: var(--accent-purple);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .info-box p {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin: 0;
        }

        /* SIMILARITY LIST */
        .similarity-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin: 1rem 0;
        }

        .similarity-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            background: rgba(106, 91, 255, 0.1);
            border-radius: 0.5rem;
            border-left: 3px solid var(--accent-purple);
        }

        .similarity-icon {
            font-size: 1.25rem;
        }

        .similarity-text {
            font-size: 0.9375rem;
            color: var(--text-secondary);
        }

        /* SUMMARY BOX */
        .summary-box {
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.2) 0%, rgba(106, 91, 255, 0.05) 100%);
            border: 1px solid rgba(106, 91, 255, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            margin: 1.5rem 1rem;
        }

        .summary-box h3 {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--accent-purple);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .summary-box li {
            position: relative;
            padding-left: 1.5rem;
            margin-bottom: 0.625rem;
            color: var(--text-secondary);
            font-size: 0.9375rem;
        }

        .summary-box li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--accent-purple);
            font-weight: bold;
        }

        /* QUIZ SECTION */
        .quiz-section {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1.5rem 1rem;
            padding: 1.5rem;
        }

        .quiz-header {
            text-align: center;
            margin-bottom: 1.5rem;
        }

        .quiz-header h3 {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
            margin-bottom: 0.25rem;
        }

        .quiz-header p {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .quiz-question {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin-bottom: 1rem;
        }

        .question-text {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .quiz-options {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.9375rem;
            color: var(--text-secondary);
        }

        .quiz-option:hover:not(.correct):not(.incorrect) {
            background: var(--bg-card-hover);
            border-color: var(--accent-gold);
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
            margin-top: 0.75rem;
            padding: 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success-green);
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: var(--error-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .score-text {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--gradient-gold);
            border: none;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #000;
            cursor: pointer;
            transition: transform 0.2s ease;
        }

        .retake-btn:hover {
            transform: scale(1.02);
        }

        /* FOOTER */
        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            border-top: 1px solid var(--border-subtle);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .footer-logo .gem {
            color: var(--accent-gold);
        }

        .footer-text {
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* MOBILE RESPONSIVE */
        @media (max-width: 600px) {
            .content-card {
                margin: 0.75rem 0;
                border-radius: 0;
                border-left: 4px solid var(--accent-purple);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-subtle);
            }

            .summary-box,
            .quiz-section {
                margin: 1rem 0;
                border-radius: 0;
            }

            .lesson-header {
                padding: 1.5rem 1rem;
            }

            .lesson-title {
                font-size: 1.5rem;
            }

            .vs-container {
                grid-template-columns: 1fr;
            }

            .vs-divider {
                transform: rotate(90deg);
            }

            .decision-grid {
                grid-template-columns: 1fr;
            }

            .comparison-table {
                font-size: 0.75rem;
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
        <!-- HEADER -->
        <header class="lesson-header">
            <div class="header-badge">
                <span>📈</span>
                <span>Tier 2 - Nâng Cao</span>
            </div>
            <div class="lesson-chapter">Chapter 2 - LFZ Mastery</div>
            <h1 class="lesson-title">So Sánh HFZ và LFZ</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 2.4</span></div>
                <div class="meta-item"><span>⏱️</span><span>12 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>3 câu quiz</span></div>
            </div>
        </header>

        <!-- CONTENT -->
        <main class="content-section">
            <!-- Section 1: Overview -->
            <div class="content-card">
                <h2>⚖️ HFZ vs LFZ - Hai Mặt Của Đồng Xu</h2>

                <p>HFZ và LFZ là hai khái niệm cốt lõi trong GEM Frequency Method. Hiểu rõ sự giống và khác nhau giúp bạn áp dụng đúng zone trong mọi tình huống thị trường.</p>

                <div class="vs-container">
                    <div class="zone-card lfz">
                        <div class="zone-emoji">🟢</div>
                        <div class="zone-name">LFZ</div>
                        <div class="zone-desc">Low Frequency Zone<br>Vùng MUA</div>
                    </div>
                    <div class="vs-divider">VS</div>
                    <div class="zone-card hfz">
                        <div class="zone-emoji">🔴</div>
                        <div class="zone-name">HFZ</div>
                        <div class="zone-desc">High Frequency Zone<br>Vùng BÁN</div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">⚖️</div>
                    <div class="label">Hình 2.4.1: HFZ vs LFZ Trên Cùng Biểu Đồ</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 2: Bảng so sánh chi tiết -->
            <div class="content-card">
                <h2>📊 Bảng So Sánh Chi Tiết</h2>

                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th>Tiêu Chí</th>
                            <th class="lfz">🟢 LFZ</th>
                            <th class="hfz">🔴 HFZ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Tên Đầy Đủ</strong></td>
                            <td>Low Frequency Zone</td>
                            <td>High Frequency Zone</td>
                        </tr>
                        <tr>
                            <td><strong>Loại Lệnh</strong></td>
                            <td>Lệnh MUA chờ khớp</td>
                            <td>Lệnh BÁN chờ khớp</td>
                        </tr>
                        <tr>
                            <td><strong>Vị Trí</strong></td>
                            <td>DƯỚI giá hiện tại</td>
                            <td>TRÊN giá hiện tại</td>
                        </tr>
                        <tr>
                            <td><strong>Tín Hiệu</strong></td>
                            <td>LONG (Buy)</td>
                            <td>SHORT (Sell)</td>
                        </tr>
                        <tr>
                            <td><strong>Patterns Tạo Ra</strong></td>
                            <td>UPU, DPU</td>
                            <td>DPD, UPD</td>
                        </tr>
                        <tr>
                            <td><strong>Entry Line</strong></td>
                            <td>ĐỈNH của Pause</td>
                            <td>ĐÁY của Pause</td>
                        </tr>
                        <tr>
                            <td><strong>Stop Line</strong></td>
                            <td>ĐÁY của Pause</td>
                            <td>ĐỈNH của Pause</td>
                        </tr>
                        <tr>
                            <td><strong>Confirmation</strong></td>
                            <td>Bullish candles</td>
                            <td>Bearish candles</td>
                        </tr>
                    </tbody>
                </table>

                <div class="image-placeholder">
                    <div class="icon">📊</div>
                    <div class="label">Hình 2.4.2: Entry và Stop Lines - LFZ vs HFZ</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 3: Điểm giống nhau -->
            <div class="content-card">
                <h2>🤝 Điểm Giống Nhau</h2>

                <p>Mặc dù đối lập về hướng trade, HFZ và LFZ chia sẻ nhiều đặc điểm quan trọng:</p>

                <div class="similarity-list">
                    <div class="similarity-item">
                        <div class="similarity-icon">📐</div>
                        <div class="similarity-text">Đều được vẽ từ vùng Pause của 3-phase pattern</div>
                    </div>
                    <div class="similarity-item">
                        <div class="similarity-icon">⏳</div>
                        <div class="similarity-text">Đều có Zone Lifecycle: FRESH → TESTED → BROKEN</div>
                    </div>
                    <div class="similarity-item">
                        <div class="similarity-icon">✅</div>
                        <div class="similarity-text">Đều cần xác nhận (confirmation candle) trước khi entry</div>
                    </div>
                    <div class="similarity-item">
                        <div class="similarity-icon">📏</div>
                        <div class="similarity-text">Đều có quy tắc độ dày zone: 0.5% - 2% là lý tưởng</div>
                    </div>
                    <div class="similarity-item">
                        <div class="similarity-icon">🎯</div>
                        <div class="similarity-text">Đều cho R:R tốt: trung bình 1:2 đến 1:3</div>
                    </div>
                    <div class="similarity-item">
                        <div class="similarity-icon">🏦</div>
                        <div class="similarity-text">Đều đại diện cho vùng Smart Money đặt lệnh</div>
                    </div>
                </div>
            </div>

            <!-- Section 4: Khi nào trade -->
            <div class="content-card">
                <h2>🎯 Khi Nào Trade HFZ, Khi Nào Trade LFZ?</h2>

                <div class="decision-grid">
                    <div class="decision-card lfz">
                        <h4>🟢 Trade LFZ Khi:</h4>
                        <ul>
                            <li>Thị trường đang uptrend hoặc sideways</li>
                            <li>Muốn mua vào với giá tốt</li>
                            <li>Thấy UPU hoặc DPU pattern</li>
                            <li>LFZ có confluence với support level</li>
                            <li>Bullish divergence xuất hiện</li>
                        </ul>
                    </div>
                    <div class="decision-card hfz">
                        <h4>🔴 Trade HFZ Khi:</h4>
                        <ul>
                            <li>Thị trường đang downtrend hoặc sideways</li>
                            <li>Muốn bán ra với giá cao</li>
                            <li>Thấy DPD hoặc UPD pattern</li>
                            <li>HFZ có confluence với resistance level</li>
                            <li>Bearish divergence xuất hiện</li>
                        </ul>
                    </div>
                </div>

                <div class="info-box">
                    <div class="info-box-title">💡 Pro Tip: Trade Theo Trend</div>
                    <p>Trong uptrend, ưu tiên trade LFZ (buy the dip). Trong downtrend, ưu tiên trade HFZ (sell the rally). Counter-trend trades có win rate thấp hơn.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📈</div>
                    <div class="label">Hình 2.4.3: Trade LFZ Trong Uptrend, HFZ Trong Downtrend</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 5: Confluence -->
            <div class="content-card">
                <h2>🔥 HFZ + LFZ Confluence</h2>

                <p>Khi HFZ của timeframe cao (HTF) trùng với LFZ của timeframe thấp (LTF), đó là tín hiệu <strong>đặc biệt quan trọng</strong>!</p>

                <h3>Ví Dụ Confluence:</h3>
                <ul>
                    <li><strong>Daily LFZ</strong> trùng với <strong>4H LFZ</strong> = Strong Buy Zone</li>
                    <li><strong>Weekly HFZ</strong> trùng với <strong>Daily HFZ</strong> = Strong Sell Zone</li>
                    <li><strong>LFZ</strong> trùng với <strong>Previous Support</strong> = Extra confirmation</li>
                </ul>

                <div class="info-box">
                    <div class="info-box-title">🎯 Confluence Score</div>
                    <p>Mỗi yếu tố confluence thêm 1 điểm. Zone có ≥3 điểm confluence được coi là "High Quality Zone" với win rate 75%+.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🔥</div>
                    <div class="label">Hình 2.4.4: Multi-Timeframe Confluence - LFZ + Support</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>
        </main>

        <!-- SUMMARY -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul>
                <li>LFZ = Vùng mua (dưới giá), HFZ = Vùng bán (trên giá)</li>
                <li>LFZ từ UPU/DPU, HFZ từ DPD/UPD</li>
                <li>Cả hai đều cần confirmation và có zone lifecycle</li>
                <li>Trade LFZ trong uptrend, trade HFZ trong downtrend</li>
                <li>Confluence (nhiều yếu tố trùng nhau) tăng win rate đáng kể</li>
            </ul>
        </div>

        <!-- QUIZ -->
        <div class="quiz-section">
            <div class="quiz-header">
                <h3>🎯 Kiểm Tra Kiến Thức</h3>
                <p>Trả lời các câu hỏi để củng cố bài học</p>
            </div>

            <div class="quiz-question" data-correct="2">
                <div class="question-text">Câu 1: Patterns nào tạo ra HFZ?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">UPU và DPU</div>
                    <div class="quiz-option" data-index="1">UPU và UPD</div>
                    <div class="quiz-option" data-index="2">DPD và UPD</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <div class="question-text">Câu 2: Trong thị trường uptrend, nên ưu tiên trade zone nào?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">LFZ (Buy the dip)</div>
                    <div class="quiz-option" data-index="1">HFZ (Sell the rally)</div>
                    <div class="quiz-option" data-index="2">Không trade zone nào</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <div class="question-text">Câu 3: Entry Line của LFZ nằm ở đâu so với Entry Line của HFZ?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Giống nhau - đều ở giữa Pause zone</div>
                    <div class="quiz-option" data-index="1">Ngược nhau - LFZ ở ĐỈNH Pause, HFZ ở ĐÁY Pause</div>
                    <div class="quiz-option" data-index="2">Ngược nhau - LFZ ở ĐÁY Pause, HFZ ở ĐỈNH Pause</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text">🎉 Bạn trả lời đúng <span id="correct-count">0</span>/3 câu!</div>
                <button class="retake-btn" onclick="resetQuiz()">Làm Lại Quiz</button>
            </div>
        </div>

        <!-- FOOTER -->
        <footer class="lesson-footer">
            <div class="footer-logo">
                <span class="gem">GEM</span> Trading Academy
            </div>
            <div class="footer-text">© 2024 GEM Trading Academy. All rights reserved.</div>
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

        function resetQuiz() {
            answeredCount = 0;
            correctCount = 0;

            document.querySelectorAll(''.quiz-question'').forEach(question => {
                question.classList.remove(''answered'');
                question.querySelectorAll(''.quiz-option'').forEach(opt => {
                    opt.classList.remove(''correct'', ''incorrect'');
                });
                question.querySelector(''.quiz-result'').className = ''quiz-result'';
            });

            document.querySelector(''.quiz-score'').classList.remove(''show'');
        }
    </script>
</body>
</html>',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 2.4: So Sánh HFZ và LFZ | GEM Trading Academy</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <style>
        :root {
            --primary-navy: #112250;
            --accent-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --error-red: #EF4444;
            --text-primary: #FFFFFF;
            --text-secondary: #A0AEC0;
            --bg-card: rgba(255, 255, 255, 0.05);
            --bg-card-hover: rgba(255, 255, 255, 0.08);
            --border-subtle: rgba(255, 255, 255, 0.1);
            --gradient-gold: linear-gradient(135deg, #FFBD59 0%, #FFCF87 100%);
            --gradient-green: linear-gradient(135deg, #10B981 0%, #34D399 100%);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--primary-navy);
            color: var(--text-primary);
            line-height: 1.7;
            min-height: 100vh;
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--primary-navy);
        }

        /* HEADER */
        .lesson-header {
            padding: 2rem 1.5rem;
            background: linear-gradient(180deg, rgba(106, 91, 255, 0.15) 0%, transparent 100%);
            border-bottom: 1px solid var(--border-subtle);
            text-align: center;
        }

        .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: linear-gradient(135deg, #6A5BFF 0%, #8B7FFF 100%);
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #fff;
            margin-bottom: 1rem;
        }

        .lesson-chapter {
            font-size: 0.875rem;
            color: var(--accent-purple);
            font-weight: 500;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .lesson-meta {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            flex-wrap: wrap;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* CONTENT SECTION */
        .content-section {
            padding: 0;
        }

        .content-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1rem;
            padding: 1.5rem;
            border-left: 4px solid var(--accent-purple);
        }

        .content-card h2 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--accent-purple);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .content-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 1.25rem 0 0.75rem 0;
            color: var(--text-primary);
        }

        .content-card p {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            font-size: 0.9375rem;
        }

        .content-card ul, .content-card ol {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            padding-left: 1.5rem;
        }

        .content-card li {
            margin-bottom: 0.5rem;
            font-size: 0.9375rem;
        }

        /* IMAGE PLACEHOLDER */
        .image-placeholder {
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.2) 0%, rgba(106, 91, 255, 0.1) 100%);
            border: 2px dashed var(--accent-purple);
            border-radius: 0.75rem;
            padding: 3rem 1.5rem;
            text-align: center;
            margin: 1.25rem 0;
        }

        .image-placeholder .icon {
            font-size: 2.5rem;
            margin-bottom: 0.75rem;
        }

        .image-placeholder .label {
            font-size: 0.875rem;
            color: var(--accent-purple);
            font-weight: 600;
        }

        .image-placeholder .dimensions {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
        }

        /* COMPARISON TABLE */
        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            font-size: 0.875rem;
        }

        .comparison-table th,
        .comparison-table td {
            padding: 0.875rem;
            border: 1px solid var(--border-subtle);
            text-align: left;
        }

        .comparison-table th {
            background: rgba(106, 91, 255, 0.2);
            font-weight: 600;
        }

        .comparison-table th:first-child {
            color: var(--text-primary);
        }

        .comparison-table th.lfz {
            color: var(--success-green);
            text-align: center;
        }

        .comparison-table th.hfz {
            color: var(--error-red);
            text-align: center;
        }

        .comparison-table td {
            color: var(--text-secondary);
        }

        .comparison-table td:nth-child(2) {
            background: rgba(16, 185, 129, 0.05);
            text-align: center;
        }

        .comparison-table td:nth-child(3) {
            background: rgba(239, 68, 68, 0.05);
            text-align: center;
        }

        /* VS CARDS */
        .vs-container {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            gap: 1rem;
            align-items: center;
            margin: 1.5rem 0;
        }

        .zone-card {
            background: var(--bg-card);
            border-radius: 1rem;
            padding: 1.5rem;
            text-align: center;
        }

        .zone-card.lfz {
            border: 2px solid var(--success-green);
            background: rgba(16, 185, 129, 0.1);
        }

        .zone-card.hfz {
            border: 2px solid var(--error-red);
            background: rgba(239, 68, 68, 0.1);
        }

        .zone-emoji {
            font-size: 3rem;
            margin-bottom: 0.75rem;
        }

        .zone-name {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .zone-card.lfz .zone-name {
            color: var(--success-green);
        }

        .zone-card.hfz .zone-name {
            color: var(--error-red);
        }

        .zone-desc {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .vs-divider {
            font-size: 2rem;
            font-weight: 700;
            color: var(--accent-purple);
        }

        /* DECISION BOX */
        .decision-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        .decision-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.75rem;
            padding: 1rem;
        }

        .decision-card h4 {
            font-size: 0.9375rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .decision-card.lfz h4 {
            color: var(--success-green);
        }

        .decision-card.hfz h4 {
            color: var(--error-red);
        }

        .decision-card ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .decision-card li {
            font-size: 0.8125rem;
            color: var(--text-secondary);
            padding: 0.25rem 0;
            padding-left: 1.25rem;
            position: relative;
        }

        .decision-card.lfz li::before {
            content: "→";
            position: absolute;
            left: 0;
            color: var(--success-green);
        }

        .decision-card.hfz li::before {
            content: "→";
            position: absolute;
            left: 0;
            color: var(--error-red);
        }

        /* INFO BOX */
        .info-box {
            background: rgba(106, 91, 255, 0.1);
            border: 1px solid rgba(106, 91, 255, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .info-box-title {
            font-weight: 600;
            color: var(--accent-purple);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .info-box p {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin: 0;
        }

        /* SIMILARITY LIST */
        .similarity-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin: 1rem 0;
        }

        .similarity-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            background: rgba(106, 91, 255, 0.1);
            border-radius: 0.5rem;
            border-left: 3px solid var(--accent-purple);
        }

        .similarity-icon {
            font-size: 1.25rem;
        }

        .similarity-text {
            font-size: 0.9375rem;
            color: var(--text-secondary);
        }

        /* SUMMARY BOX */
        .summary-box {
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.2) 0%, rgba(106, 91, 255, 0.05) 100%);
            border: 1px solid rgba(106, 91, 255, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            margin: 1.5rem 1rem;
        }

        .summary-box h3 {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--accent-purple);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .summary-box li {
            position: relative;
            padding-left: 1.5rem;
            margin-bottom: 0.625rem;
            color: var(--text-secondary);
            font-size: 0.9375rem;
        }

        .summary-box li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--accent-purple);
            font-weight: bold;
        }

        /* QUIZ SECTION */
        .quiz-section {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1.5rem 1rem;
            padding: 1.5rem;
        }

        .quiz-header {
            text-align: center;
            margin-bottom: 1.5rem;
        }

        .quiz-header h3 {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
            margin-bottom: 0.25rem;
        }

        .quiz-header p {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .quiz-question {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin-bottom: 1rem;
        }

        .question-text {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .quiz-options {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.9375rem;
            color: var(--text-secondary);
        }

        .quiz-option:hover:not(.correct):not(.incorrect) {
            background: var(--bg-card-hover);
            border-color: var(--accent-gold);
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
            margin-top: 0.75rem;
            padding: 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success-green);
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: var(--error-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .score-text {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--gradient-gold);
            border: none;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #000;
            cursor: pointer;
            transition: transform 0.2s ease;
        }

        .retake-btn:hover {
            transform: scale(1.02);
        }

        /* FOOTER */
        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            border-top: 1px solid var(--border-subtle);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .footer-logo .gem {
            color: var(--accent-gold);
        }

        .footer-text {
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* MOBILE RESPONSIVE */
        @media (max-width: 600px) {
            .content-card {
                margin: 0.75rem 0;
                border-radius: 0;
                border-left: 4px solid var(--accent-purple);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-subtle);
            }

            .summary-box,
            .quiz-section {
                margin: 1rem 0;
                border-radius: 0;
            }

            .lesson-header {
                padding: 1.5rem 1rem;
            }

            .lesson-title {
                font-size: 1.5rem;
            }

            .vs-container {
                grid-template-columns: 1fr;
            }

            .vs-divider {
                transform: rotate(90deg);
            }

            .decision-grid {
                grid-template-columns: 1fr;
            }

            .comparison-table {
                font-size: 0.75rem;
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
        <!-- HEADER -->
        <header class="lesson-header">
            <div class="header-badge">
                <span>📈</span>
                <span>Tier 2 - Nâng Cao</span>
            </div>
            <div class="lesson-chapter">Chapter 2 - LFZ Mastery</div>
            <h1 class="lesson-title">So Sánh HFZ và LFZ</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 2.4</span></div>
                <div class="meta-item"><span>⏱️</span><span>12 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>3 câu quiz</span></div>
            </div>
        </header>

        <!-- CONTENT -->
        <main class="content-section">
            <!-- Section 1: Overview -->
            <div class="content-card">
                <h2>⚖️ HFZ vs LFZ - Hai Mặt Của Đồng Xu</h2>

                <p>HFZ và LFZ là hai khái niệm cốt lõi trong GEM Frequency Method. Hiểu rõ sự giống và khác nhau giúp bạn áp dụng đúng zone trong mọi tình huống thị trường.</p>

                <div class="vs-container">
                    <div class="zone-card lfz">
                        <div class="zone-emoji">🟢</div>
                        <div class="zone-name">LFZ</div>
                        <div class="zone-desc">Low Frequency Zone<br>Vùng MUA</div>
                    </div>
                    <div class="vs-divider">VS</div>
                    <div class="zone-card hfz">
                        <div class="zone-emoji">🔴</div>
                        <div class="zone-name">HFZ</div>
                        <div class="zone-desc">High Frequency Zone<br>Vùng BÁN</div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">⚖️</div>
                    <div class="label">Hình 2.4.1: HFZ vs LFZ Trên Cùng Biểu Đồ</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 2: Bảng so sánh chi tiết -->
            <div class="content-card">
                <h2>📊 Bảng So Sánh Chi Tiết</h2>

                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th>Tiêu Chí</th>
                            <th class="lfz">🟢 LFZ</th>
                            <th class="hfz">🔴 HFZ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Tên Đầy Đủ</strong></td>
                            <td>Low Frequency Zone</td>
                            <td>High Frequency Zone</td>
                        </tr>
                        <tr>
                            <td><strong>Loại Lệnh</strong></td>
                            <td>Lệnh MUA chờ khớp</td>
                            <td>Lệnh BÁN chờ khớp</td>
                        </tr>
                        <tr>
                            <td><strong>Vị Trí</strong></td>
                            <td>DƯỚI giá hiện tại</td>
                            <td>TRÊN giá hiện tại</td>
                        </tr>
                        <tr>
                            <td><strong>Tín Hiệu</strong></td>
                            <td>LONG (Buy)</td>
                            <td>SHORT (Sell)</td>
                        </tr>
                        <tr>
                            <td><strong>Patterns Tạo Ra</strong></td>
                            <td>UPU, DPU</td>
                            <td>DPD, UPD</td>
                        </tr>
                        <tr>
                            <td><strong>Entry Line</strong></td>
                            <td>ĐỈNH của Pause</td>
                            <td>ĐÁY của Pause</td>
                        </tr>
                        <tr>
                            <td><strong>Stop Line</strong></td>
                            <td>ĐÁY của Pause</td>
                            <td>ĐỈNH của Pause</td>
                        </tr>
                        <tr>
                            <td><strong>Confirmation</strong></td>
                            <td>Bullish candles</td>
                            <td>Bearish candles</td>
                        </tr>
                    </tbody>
                </table>

                <div class="image-placeholder">
                    <div class="icon">📊</div>
                    <div class="label">Hình 2.4.2: Entry và Stop Lines - LFZ vs HFZ</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 3: Điểm giống nhau -->
            <div class="content-card">
                <h2>🤝 Điểm Giống Nhau</h2>

                <p>Mặc dù đối lập về hướng trade, HFZ và LFZ chia sẻ nhiều đặc điểm quan trọng:</p>

                <div class="similarity-list">
                    <div class="similarity-item">
                        <div class="similarity-icon">📐</div>
                        <div class="similarity-text">Đều được vẽ từ vùng Pause của 3-phase pattern</div>
                    </div>
                    <div class="similarity-item">
                        <div class="similarity-icon">⏳</div>
                        <div class="similarity-text">Đều có Zone Lifecycle: FRESH → TESTED → BROKEN</div>
                    </div>
                    <div class="similarity-item">
                        <div class="similarity-icon">✅</div>
                        <div class="similarity-text">Đều cần xác nhận (confirmation candle) trước khi entry</div>
                    </div>
                    <div class="similarity-item">
                        <div class="similarity-icon">📏</div>
                        <div class="similarity-text">Đều có quy tắc độ dày zone: 0.5% - 2% là lý tưởng</div>
                    </div>
                    <div class="similarity-item">
                        <div class="similarity-icon">🎯</div>
                        <div class="similarity-text">Đều cho R:R tốt: trung bình 1:2 đến 1:3</div>
                    </div>
                    <div class="similarity-item">
                        <div class="similarity-icon">🏦</div>
                        <div class="similarity-text">Đều đại diện cho vùng Smart Money đặt lệnh</div>
                    </div>
                </div>
            </div>

            <!-- Section 4: Khi nào trade -->
            <div class="content-card">
                <h2>🎯 Khi Nào Trade HFZ, Khi Nào Trade LFZ?</h2>

                <div class="decision-grid">
                    <div class="decision-card lfz">
                        <h4>🟢 Trade LFZ Khi:</h4>
                        <ul>
                            <li>Thị trường đang uptrend hoặc sideways</li>
                            <li>Muốn mua vào với giá tốt</li>
                            <li>Thấy UPU hoặc DPU pattern</li>
                            <li>LFZ có confluence với support level</li>
                            <li>Bullish divergence xuất hiện</li>
                        </ul>
                    </div>
                    <div class="decision-card hfz">
                        <h4>🔴 Trade HFZ Khi:</h4>
                        <ul>
                            <li>Thị trường đang downtrend hoặc sideways</li>
                            <li>Muốn bán ra với giá cao</li>
                            <li>Thấy DPD hoặc UPD pattern</li>
                            <li>HFZ có confluence với resistance level</li>
                            <li>Bearish divergence xuất hiện</li>
                        </ul>
                    </div>
                </div>

                <div class="info-box">
                    <div class="info-box-title">💡 Pro Tip: Trade Theo Trend</div>
                    <p>Trong uptrend, ưu tiên trade LFZ (buy the dip). Trong downtrend, ưu tiên trade HFZ (sell the rally). Counter-trend trades có win rate thấp hơn.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📈</div>
                    <div class="label">Hình 2.4.3: Trade LFZ Trong Uptrend, HFZ Trong Downtrend</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 5: Confluence -->
            <div class="content-card">
                <h2>🔥 HFZ + LFZ Confluence</h2>

                <p>Khi HFZ của timeframe cao (HTF) trùng với LFZ của timeframe thấp (LTF), đó là tín hiệu <strong>đặc biệt quan trọng</strong>!</p>

                <h3>Ví Dụ Confluence:</h3>
                <ul>
                    <li><strong>Daily LFZ</strong> trùng với <strong>4H LFZ</strong> = Strong Buy Zone</li>
                    <li><strong>Weekly HFZ</strong> trùng với <strong>Daily HFZ</strong> = Strong Sell Zone</li>
                    <li><strong>LFZ</strong> trùng với <strong>Previous Support</strong> = Extra confirmation</li>
                </ul>

                <div class="info-box">
                    <div class="info-box-title">🎯 Confluence Score</div>
                    <p>Mỗi yếu tố confluence thêm 1 điểm. Zone có ≥3 điểm confluence được coi là "High Quality Zone" với win rate 75%+.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🔥</div>
                    <div class="label">Hình 2.4.4: Multi-Timeframe Confluence - LFZ + Support</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>
        </main>

        <!-- SUMMARY -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul>
                <li>LFZ = Vùng mua (dưới giá), HFZ = Vùng bán (trên giá)</li>
                <li>LFZ từ UPU/DPU, HFZ từ DPD/UPD</li>
                <li>Cả hai đều cần confirmation và có zone lifecycle</li>
                <li>Trade LFZ trong uptrend, trade HFZ trong downtrend</li>
                <li>Confluence (nhiều yếu tố trùng nhau) tăng win rate đáng kể</li>
            </ul>
        </div>

        <!-- QUIZ -->
        <div class="quiz-section">
            <div class="quiz-header">
                <h3>🎯 Kiểm Tra Kiến Thức</h3>
                <p>Trả lời các câu hỏi để củng cố bài học</p>
            </div>

            <div class="quiz-question" data-correct="2">
                <div class="question-text">Câu 1: Patterns nào tạo ra HFZ?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">UPU và DPU</div>
                    <div class="quiz-option" data-index="1">UPU và UPD</div>
                    <div class="quiz-option" data-index="2">DPD và UPD</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <div class="question-text">Câu 2: Trong thị trường uptrend, nên ưu tiên trade zone nào?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">LFZ (Buy the dip)</div>
                    <div class="quiz-option" data-index="1">HFZ (Sell the rally)</div>
                    <div class="quiz-option" data-index="2">Không trade zone nào</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <div class="question-text">Câu 3: Entry Line của LFZ nằm ở đâu so với Entry Line của HFZ?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Giống nhau - đều ở giữa Pause zone</div>
                    <div class="quiz-option" data-index="1">Ngược nhau - LFZ ở ĐỈNH Pause, HFZ ở ĐÁY Pause</div>
                    <div class="quiz-option" data-index="2">Ngược nhau - LFZ ở ĐÁY Pause, HFZ ở ĐỈNH Pause</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text">🎉 Bạn trả lời đúng <span id="correct-count">0</span>/3 câu!</div>
                <button class="retake-btn" onclick="resetQuiz()">Làm Lại Quiz</button>
            </div>
        </div>

        <!-- FOOTER -->
        <footer class="lesson-footer">
            <div class="footer-logo">
                <span class="gem">GEM</span> Trading Academy
            </div>
            <div class="footer-text">© 2024 GEM Trading Academy. All rights reserved.</div>
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

        function resetQuiz() {
            answeredCount = 0;
            correctCount = 0;

            document.querySelectorAll(''.quiz-question'').forEach(question => {
                question.classList.remove(''answered'');
                question.querySelectorAll(''.quiz-option'').forEach(opt => {
                    opt.classList.remove(''correct'', ''incorrect'');
                });
                question.querySelector(''.quiz-result'').className = ''quiz-result'';
            });

            document.querySelector(''.quiz-score'').classList.remove(''show'');
        }
    </script>
</body>
</html>',
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

-- Lesson 2.5: Kết Hợp LFZ Với Classic Patterns
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch2-l5',
  'module-tier-2-ch2',
  'course-tier2-trading-advanced',
  'Bài 2.5: Kết Hợp LFZ Với Classic Patterns',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 2.5: Kết Hợp LFZ Với Classic Patterns | GEM Trading Academy</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <style>
        :root {
            --primary-navy: #112250;
            --accent-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --error-red: #EF4444;
            --text-primary: #FFFFFF;
            --text-secondary: #A0AEC0;
            --bg-card: rgba(255, 255, 255, 0.05);
            --bg-card-hover: rgba(255, 255, 255, 0.08);
            --border-subtle: rgba(255, 255, 255, 0.1);
            --gradient-gold: linear-gradient(135deg, #FFBD59 0%, #FFCF87 100%);
            --gradient-green: linear-gradient(135deg, #10B981 0%, #34D399 100%);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--primary-navy);
            color: var(--text-primary);
            line-height: 1.7;
            min-height: 100vh;
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--primary-navy);
        }

        /* HEADER */
        .lesson-header {
            padding: 2rem 1.5rem;
            background: linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, transparent 100%);
            border-bottom: 1px solid var(--border-subtle);
            text-align: center;
        }

        .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--gradient-green);
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #000;
            margin-bottom: 1rem;
        }

        .lesson-chapter {
            font-size: 0.875rem;
            color: var(--success-green);
            font-weight: 500;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .lesson-meta {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            flex-wrap: wrap;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* CONTENT SECTION */
        .content-section {
            padding: 0;
        }

        .content-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1rem;
            padding: 1.5rem;
            border-left: 4px solid var(--success-green);
        }

        .content-card h2 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--success-green);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .content-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 1.25rem 0 0.75rem 0;
            color: var(--text-primary);
        }

        .content-card p {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            font-size: 0.9375rem;
        }

        .content-card ul, .content-card ol {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            padding-left: 1.5rem;
        }

        .content-card li {
            margin-bottom: 0.5rem;
            font-size: 0.9375rem;
        }

        /* IMAGE PLACEHOLDER */
        .image-placeholder {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
            border: 2px dashed var(--success-green);
            border-radius: 0.75rem;
            padding: 3rem 1.5rem;
            text-align: center;
            margin: 1.25rem 0;
        }

        .image-placeholder .icon {
            font-size: 2.5rem;
            margin-bottom: 0.75rem;
        }

        .image-placeholder .label {
            font-size: 0.875rem;
            color: var(--success-green);
            font-weight: 600;
        }

        .image-placeholder .dimensions {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
        }

        /* COMBO CARDS */
        .combo-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
            margin: 1rem 0;
        }

        .combo-card {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 1rem;
            padding: 1.25rem;
            position: relative;
            overflow: hidden;
        }

        .combo-card::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: var(--gradient-green);
        }

        .combo-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
        }

        .combo-icon {
            font-size: 2rem;
        }

        .combo-title {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--success-green);
        }

        .combo-subtitle {
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        .combo-body {
            padding-left: 0.5rem;
        }

        .combo-body p {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
        }

        .win-rate-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            background: rgba(16, 185, 129, 0.2);
            padding: 0.375rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--success-green);
            margin-top: 0.5rem;
        }

        /* INFO BOX */
        .info-box {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .info-box.gold {
            background: rgba(255, 189, 89, 0.1);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .info-box.gold .info-box-title {
            color: var(--accent-gold);
        }

        .info-box-title {
            font-weight: 600;
            color: var(--success-green);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .info-box p {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin: 0;
        }

        /* CHECKLIST */
        .confluence-checklist {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .confluence-checklist h4 {
            font-size: 1rem;
            font-weight: 600;
            color: var(--accent-gold);
            margin-bottom: 0.75rem;
        }

        .confluence-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .confluence-list li {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0;
            font-size: 0.875rem;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border-subtle);
        }

        .confluence-list li:last-child {
            border-bottom: none;
        }

        .confluence-score {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 1.5rem;
            height: 1.5rem;
            background: var(--success-green);
            border-radius: 50%;
            font-size: 0.75rem;
            font-weight: 700;
            color: #000;
        }

        /* EXAMPLE BOX */
        .example-box {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        .example-title {
            font-size: 1rem;
            font-weight: 600;
            color: var(--accent-cyan);
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .example-box ol {
            padding-left: 1.25rem;
            margin: 0;
        }

        .example-box li {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
        }

        /* SUMMARY BOX */
        .summary-box {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            margin: 1.5rem 1rem;
        }

        .summary-box h3 {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--success-green);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .summary-box li {
            position: relative;
            padding-left: 1.5rem;
            margin-bottom: 0.625rem;
            color: var(--text-secondary);
            font-size: 0.9375rem;
        }

        .summary-box li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-weight: bold;
        }

        /* QUIZ SECTION */
        .quiz-section {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1.5rem 1rem;
            padding: 1.5rem;
        }

        .quiz-header {
            text-align: center;
            margin-bottom: 1.5rem;
        }

        .quiz-header h3 {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
            margin-bottom: 0.25rem;
        }

        .quiz-header p {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .quiz-question {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin-bottom: 1rem;
        }

        .question-text {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .quiz-options {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.9375rem;
            color: var(--text-secondary);
        }

        .quiz-option:hover:not(.correct):not(.incorrect) {
            background: var(--bg-card-hover);
            border-color: var(--accent-gold);
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
            margin-top: 0.75rem;
            padding: 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success-green);
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: var(--error-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .score-text {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--gradient-gold);
            border: none;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #000;
            cursor: pointer;
            transition: transform 0.2s ease;
        }

        .retake-btn:hover {
            transform: scale(1.02);
        }

        /* FOOTER */
        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            border-top: 1px solid var(--border-subtle);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .footer-logo .gem {
            color: var(--accent-gold);
        }

        .footer-text {
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* MOBILE RESPONSIVE */
        @media (max-width: 600px) {
            .content-card {
                margin: 0.75rem 0;
                border-radius: 0;
                border-left: 4px solid var(--success-green);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-subtle);
            }

            .summary-box,
            .quiz-section {
                margin: 1rem 0;
                border-radius: 0;
            }

            .lesson-header {
                padding: 1.5rem 1rem;
            }

            .lesson-title {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <!-- HEADER -->
        <header class="lesson-header">
            <div class="header-badge">
                <span>📈</span>
                <span>Tier 2 - Nâng Cao</span>
            </div>
            <div class="lesson-chapter">Chapter 2 - LFZ Mastery</div>
            <h1 class="lesson-title">Kết Hợp LFZ Với Classic Patterns</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 2.5</span></div>
                <div class="meta-item"><span>⏱️</span><span>10 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <!-- CONTENT -->
        <main class="content-section">
            <!-- Section 1: Tại sao kết hợp -->
            <div class="content-card">
                <h2>🔥 Sức Mạnh Của Confluence</h2>

                <p>Khi LFZ trùng với một Classic Pattern, xác suất thành công tăng đáng kể. Đây gọi là <strong>Confluence</strong> - nhiều tín hiệu cùng chỉ về một hướng.</p>

                <div class="info-box gold">
                    <div class="info-box-title">💡 Tại Sao Confluence Quan Trọng?</div>
                    <p>Mỗi tín hiệu đơn lẻ có win rate ~60-70%. Khi 2-3 tín hiệu trùng nhau, win rate có thể lên 75-85%. Đây là cách Smart Money trade với high probability.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🔥</div>
                    <div class="label">Hình 2.5.1: LFZ Confluence Với Double Bottom</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 2: LFZ + Double Bottom -->
            <div class="content-card">
                <h2>📊 LFZ + Double Bottom</h2>

                <div class="combo-grid">
                    <div class="combo-card">
                        <div class="combo-header">
                            <div class="combo-icon">🔄</div>
                            <div>
                                <div class="combo-title">Double Bottom + LFZ</div>
                                <div class="combo-subtitle">Bullish Reversal Combo</div>
                            </div>
                        </div>
                        <div class="combo-body">
                            <p><strong>Double Bottom</strong> là pattern đảo chiều classic khi giá test một mức support 2 lần rồi bounce lên. Khi đáy thứ 2 trùng với LFZ, đây là setup cực mạnh!</p>
                            <p><strong>Cách xác nhận:</strong></p>
                            <ul>
                                <li>Đáy 1 và Đáy 2 gần bằng nhau (±1%)</li>
                                <li>Đáy 2 nằm trong hoặc gần LFZ</li>
                                <li>Volume đáy 2 cao hơn đáy 1</li>
                                <li>Bullish candle xuất hiện tại LFZ</li>
                            </ul>
                            <div class="win-rate-badge">⭐ Win Rate: 78%</div>
                        </div>
                    </div>
                </div>

                <div class="example-box">
                    <div class="example-title">📌 Ví Dụ: ETH/USDT 4H</div>
                    <ol>
                        <li>ETH tạo đáy 1 tại $2,100</li>
                        <li>Bounce lên $2,400 rồi retrace</li>
                        <li>Tạo đáy 2 tại $2,110 - trùng với LFZ từ DPU pattern trước đó</li>
                        <li>Hammer candle xuất hiện + volume spike</li>
                        <li>Entry LONG tại $2,130, SL $2,050, TP $2,500</li>
                        <li>Kết quả: TP hit, +17% profit</li>
                    </ol>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📊</div>
                    <div class="label">Hình 2.5.2: Case Study - Double Bottom + LFZ</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Section 3: LFZ + Inverse Head & Shoulders -->
            <div class="content-card">
                <h2>👤 LFZ + Inverse Head & Shoulders</h2>

                <div class="combo-grid">
                    <div class="combo-card">
                        <div class="combo-header">
                            <div class="combo-icon">👤</div>
                            <div>
                                <div class="combo-title">Inverse H&S + LFZ</div>
                                <div class="combo-subtitle">Bullish Reversal Combo</div>
                            </div>
                        </div>
                        <div class="combo-body">
                            <p><strong>Inverse Head & Shoulders</strong> là pattern đảo chiều mạnh nhất trong technical analysis. Khi vai phải (right shoulder) trùng với LFZ, setup này gần như "hoàn hảo"!</p>
                            <p><strong>Cách xác nhận:</strong></p>
                            <ul>
                                <li>Left Shoulder → Head (lower) → Right Shoulder</li>
                                <li>Right Shoulder nằm trong LFZ</li>
                                <li>Neckline rõ ràng làm resistance</li>
                                <li>Volume tăng dần từ Head đến Right Shoulder</li>
                            </ul>
                            <div class="win-rate-badge">⭐ Win Rate: 82%</div>
                        </div>
                    </div>
                </div>

                <div class="info-box">
                    <div class="info-box-title">💡 Entry Strategy</div>
                    <p>Có 2 cách entry: (1) Aggressive - Entry ngay khi right shoulder bounce từ LFZ với bullish candle, (2) Conservative - Đợi neckline breakout rồi mới entry. Cách 1 cho R:R tốt hơn, cách 2 an toàn hơn.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">👤</div>
                    <div class="label">Hình 2.5.3: Inverse Head & Shoulders + LFZ Entry</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Section 4: LFZ + Trendline Support -->
            <div class="content-card">
                <h2>📈 LFZ + Trendline Support</h2>

                <p>Khi LFZ trùng với đường trendline đang hoạt động, đây là setup "textbook" cho trade.</p>

                <h3>Cách Xác Nhận:</h3>
                <ul>
                    <li>Uptrend đang active với ít nhất 2 điểm chạm trendline</li>
                    <li>LFZ nằm trên hoặc gần trendline</li>
                    <li>Giá pullback về test cả LFZ và trendline cùng lúc</li>
                    <li>Bullish rejection candle tại confluence zone</li>
                </ul>

                <div class="image-placeholder">
                    <div class="icon">📈</div>
                    <div class="label">Hình 2.5.4: LFZ Confluence Với Trendline Support</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 5: Confluence Scoring -->
            <div class="content-card">
                <h2>🎯 Confluence Scoring System</h2>

                <p>Sử dụng hệ thống chấm điểm confluence để đánh giá chất lượng setup:</p>

                <div class="confluence-checklist">
                    <h4>📋 Confluence Checklist</h4>
                    <ul class="confluence-list">
                        <li><span class="confluence-score">+1</span> LFZ từ FRESH zone (chưa test)</li>
                        <li><span class="confluence-score">+1</span> LFZ trùng với Previous Support</li>
                        <li><span class="confluence-score">+1</span> LFZ trùng với Classic Pattern (Double Bottom, IH&S)</li>
                        <li><span class="confluence-score">+1</span> LFZ trùng với Trendline Support</li>
                        <li><span class="confluence-score">+1</span> LFZ trùng với Fibonacci Level (50%, 61.8%)</li>
                        <li><span class="confluence-score">+1</span> LFZ trùng với Round Number ($50,000, $3,000...)</li>
                        <li><span class="confluence-score">+1</span> Higher Timeframe LFZ hỗ trợ</li>
                    </ul>
                </div>

                <div class="info-box gold">
                    <div class="info-box-title">🎯 Cách Đánh Giá</div>
                    <p><strong>Score 1-2:</strong> Trade với position size nhỏ<br>
                    <strong>Score 3-4:</strong> Trade với position size bình thường<br>
                    <strong>Score 5+:</strong> High confidence trade, có thể tăng position size</p>
                </div>
            </div>
        </main>

        <!-- SUMMARY -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Confluence = Nhiều tín hiệu cùng chỉ một hướng → Win rate cao hơn</li>
                <li>LFZ + Double Bottom: Win rate ~78%</li>
                <li>LFZ + Inverse Head & Shoulders: Win rate ~82%</li>
                <li>LFZ + Trendline: Setup "textbook" cho buy the dip</li>
                <li>Dùng Confluence Scoring để đánh giá chất lượng setup</li>
            </ul>
        </div>

        <!-- QUIZ -->
        <div class="quiz-section">
            <div class="quiz-header">
                <h3>🎯 Kiểm Tra Kiến Thức</h3>
                <p>Trả lời các câu hỏi để củng cố bài học</p>
            </div>

            <div class="quiz-question" data-correct="2">
                <div class="question-text">Câu 1: Khi LFZ trùng với đáy của Inverse Head & Shoulders pattern, phần nào của pattern nên nằm trong LFZ để có setup tốt nhất?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Left Shoulder</div>
                    <div class="quiz-option" data-index="1">Head</div>
                    <div class="quiz-option" data-index="2">Right Shoulder</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <div class="question-text">Câu 2: Confluence Score bao nhiêu được coi là "High Confidence Trade"?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Score 1-2</div>
                    <div class="quiz-option" data-index="1">Score 5+</div>
                    <div class="quiz-option" data-index="2">Score 3-4</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text">🎉 Bạn trả lời đúng <span id="correct-count">0</span>/2 câu!</div>
                <button class="retake-btn" onclick="resetQuiz()">Làm Lại Quiz</button>
            </div>
        </div>

        <!-- FOOTER -->
        <footer class="lesson-footer">
            <div class="footer-logo">
                <span class="gem">GEM</span> Trading Academy
            </div>
            <div class="footer-text">© 2024 GEM Trading Academy. All rights reserved.</div>
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

        function resetQuiz() {
            answeredCount = 0;
            correctCount = 0;

            document.querySelectorAll(''.quiz-question'').forEach(question => {
                question.classList.remove(''answered'');
                question.querySelectorAll(''.quiz-option'').forEach(opt => {
                    opt.classList.remove(''correct'', ''incorrect'');
                });
                question.querySelector(''.quiz-result'').className = ''quiz-result'';
            });

            document.querySelector(''.quiz-score'').classList.remove(''show'');
        }
    </script>
</body>
</html>',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 2.5: Kết Hợp LFZ Với Classic Patterns | GEM Trading Academy</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <style>
        :root {
            --primary-navy: #112250;
            --accent-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --error-red: #EF4444;
            --text-primary: #FFFFFF;
            --text-secondary: #A0AEC0;
            --bg-card: rgba(255, 255, 255, 0.05);
            --bg-card-hover: rgba(255, 255, 255, 0.08);
            --border-subtle: rgba(255, 255, 255, 0.1);
            --gradient-gold: linear-gradient(135deg, #FFBD59 0%, #FFCF87 100%);
            --gradient-green: linear-gradient(135deg, #10B981 0%, #34D399 100%);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--primary-navy);
            color: var(--text-primary);
            line-height: 1.7;
            min-height: 100vh;
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--primary-navy);
        }

        /* HEADER */
        .lesson-header {
            padding: 2rem 1.5rem;
            background: linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, transparent 100%);
            border-bottom: 1px solid var(--border-subtle);
            text-align: center;
        }

        .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--gradient-green);
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #000;
            margin-bottom: 1rem;
        }

        .lesson-chapter {
            font-size: 0.875rem;
            color: var(--success-green);
            font-weight: 500;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .lesson-meta {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            flex-wrap: wrap;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* CONTENT SECTION */
        .content-section {
            padding: 0;
        }

        .content-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1rem;
            padding: 1.5rem;
            border-left: 4px solid var(--success-green);
        }

        .content-card h2 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--success-green);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .content-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 1.25rem 0 0.75rem 0;
            color: var(--text-primary);
        }

        .content-card p {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            font-size: 0.9375rem;
        }

        .content-card ul, .content-card ol {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            padding-left: 1.5rem;
        }

        .content-card li {
            margin-bottom: 0.5rem;
            font-size: 0.9375rem;
        }

        /* IMAGE PLACEHOLDER */
        .image-placeholder {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
            border: 2px dashed var(--success-green);
            border-radius: 0.75rem;
            padding: 3rem 1.5rem;
            text-align: center;
            margin: 1.25rem 0;
        }

        .image-placeholder .icon {
            font-size: 2.5rem;
            margin-bottom: 0.75rem;
        }

        .image-placeholder .label {
            font-size: 0.875rem;
            color: var(--success-green);
            font-weight: 600;
        }

        .image-placeholder .dimensions {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
        }

        /* COMBO CARDS */
        .combo-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
            margin: 1rem 0;
        }

        .combo-card {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 1rem;
            padding: 1.25rem;
            position: relative;
            overflow: hidden;
        }

        .combo-card::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: var(--gradient-green);
        }

        .combo-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
        }

        .combo-icon {
            font-size: 2rem;
        }

        .combo-title {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--success-green);
        }

        .combo-subtitle {
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        .combo-body {
            padding-left: 0.5rem;
        }

        .combo-body p {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
        }

        .win-rate-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            background: rgba(16, 185, 129, 0.2);
            padding: 0.375rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--success-green);
            margin-top: 0.5rem;
        }

        /* INFO BOX */
        .info-box {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .info-box.gold {
            background: rgba(255, 189, 89, 0.1);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .info-box.gold .info-box-title {
            color: var(--accent-gold);
        }

        .info-box-title {
            font-weight: 600;
            color: var(--success-green);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .info-box p {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin: 0;
        }

        /* CHECKLIST */
        .confluence-checklist {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .confluence-checklist h4 {
            font-size: 1rem;
            font-weight: 600;
            color: var(--accent-gold);
            margin-bottom: 0.75rem;
        }

        .confluence-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .confluence-list li {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0;
            font-size: 0.875rem;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border-subtle);
        }

        .confluence-list li:last-child {
            border-bottom: none;
        }

        .confluence-score {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 1.5rem;
            height: 1.5rem;
            background: var(--success-green);
            border-radius: 50%;
            font-size: 0.75rem;
            font-weight: 700;
            color: #000;
        }

        /* EXAMPLE BOX */
        .example-box {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        .example-title {
            font-size: 1rem;
            font-weight: 600;
            color: var(--accent-cyan);
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .example-box ol {
            padding-left: 1.25rem;
            margin: 0;
        }

        .example-box li {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
        }

        /* SUMMARY BOX */
        .summary-box {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            margin: 1.5rem 1rem;
        }

        .summary-box h3 {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--success-green);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .summary-box li {
            position: relative;
            padding-left: 1.5rem;
            margin-bottom: 0.625rem;
            color: var(--text-secondary);
            font-size: 0.9375rem;
        }

        .summary-box li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-weight: bold;
        }

        /* QUIZ SECTION */
        .quiz-section {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1.5rem 1rem;
            padding: 1.5rem;
        }

        .quiz-header {
            text-align: center;
            margin-bottom: 1.5rem;
        }

        .quiz-header h3 {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
            margin-bottom: 0.25rem;
        }

        .quiz-header p {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .quiz-question {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin-bottom: 1rem;
        }

        .question-text {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .quiz-options {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.9375rem;
            color: var(--text-secondary);
        }

        .quiz-option:hover:not(.correct):not(.incorrect) {
            background: var(--bg-card-hover);
            border-color: var(--accent-gold);
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
            margin-top: 0.75rem;
            padding: 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success-green);
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: var(--error-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .score-text {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--gradient-gold);
            border: none;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #000;
            cursor: pointer;
            transition: transform 0.2s ease;
        }

        .retake-btn:hover {
            transform: scale(1.02);
        }

        /* FOOTER */
        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            border-top: 1px solid var(--border-subtle);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .footer-logo .gem {
            color: var(--accent-gold);
        }

        .footer-text {
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* MOBILE RESPONSIVE */
        @media (max-width: 600px) {
            .content-card {
                margin: 0.75rem 0;
                border-radius: 0;
                border-left: 4px solid var(--success-green);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-subtle);
            }

            .summary-box,
            .quiz-section {
                margin: 1rem 0;
                border-radius: 0;
            }

            .lesson-header {
                padding: 1.5rem 1rem;
            }

            .lesson-title {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <!-- HEADER -->
        <header class="lesson-header">
            <div class="header-badge">
                <span>📈</span>
                <span>Tier 2 - Nâng Cao</span>
            </div>
            <div class="lesson-chapter">Chapter 2 - LFZ Mastery</div>
            <h1 class="lesson-title">Kết Hợp LFZ Với Classic Patterns</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 2.5</span></div>
                <div class="meta-item"><span>⏱️</span><span>10 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <!-- CONTENT -->
        <main class="content-section">
            <!-- Section 1: Tại sao kết hợp -->
            <div class="content-card">
                <h2>🔥 Sức Mạnh Của Confluence</h2>

                <p>Khi LFZ trùng với một Classic Pattern, xác suất thành công tăng đáng kể. Đây gọi là <strong>Confluence</strong> - nhiều tín hiệu cùng chỉ về một hướng.</p>

                <div class="info-box gold">
                    <div class="info-box-title">💡 Tại Sao Confluence Quan Trọng?</div>
                    <p>Mỗi tín hiệu đơn lẻ có win rate ~60-70%. Khi 2-3 tín hiệu trùng nhau, win rate có thể lên 75-85%. Đây là cách Smart Money trade với high probability.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🔥</div>
                    <div class="label">Hình 2.5.1: LFZ Confluence Với Double Bottom</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 2: LFZ + Double Bottom -->
            <div class="content-card">
                <h2>📊 LFZ + Double Bottom</h2>

                <div class="combo-grid">
                    <div class="combo-card">
                        <div class="combo-header">
                            <div class="combo-icon">🔄</div>
                            <div>
                                <div class="combo-title">Double Bottom + LFZ</div>
                                <div class="combo-subtitle">Bullish Reversal Combo</div>
                            </div>
                        </div>
                        <div class="combo-body">
                            <p><strong>Double Bottom</strong> là pattern đảo chiều classic khi giá test một mức support 2 lần rồi bounce lên. Khi đáy thứ 2 trùng với LFZ, đây là setup cực mạnh!</p>
                            <p><strong>Cách xác nhận:</strong></p>
                            <ul>
                                <li>Đáy 1 và Đáy 2 gần bằng nhau (±1%)</li>
                                <li>Đáy 2 nằm trong hoặc gần LFZ</li>
                                <li>Volume đáy 2 cao hơn đáy 1</li>
                                <li>Bullish candle xuất hiện tại LFZ</li>
                            </ul>
                            <div class="win-rate-badge">⭐ Win Rate: 78%</div>
                        </div>
                    </div>
                </div>

                <div class="example-box">
                    <div class="example-title">📌 Ví Dụ: ETH/USDT 4H</div>
                    <ol>
                        <li>ETH tạo đáy 1 tại $2,100</li>
                        <li>Bounce lên $2,400 rồi retrace</li>
                        <li>Tạo đáy 2 tại $2,110 - trùng với LFZ từ DPU pattern trước đó</li>
                        <li>Hammer candle xuất hiện + volume spike</li>
                        <li>Entry LONG tại $2,130, SL $2,050, TP $2,500</li>
                        <li>Kết quả: TP hit, +17% profit</li>
                    </ol>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📊</div>
                    <div class="label">Hình 2.5.2: Case Study - Double Bottom + LFZ</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Section 3: LFZ + Inverse Head & Shoulders -->
            <div class="content-card">
                <h2>👤 LFZ + Inverse Head & Shoulders</h2>

                <div class="combo-grid">
                    <div class="combo-card">
                        <div class="combo-header">
                            <div class="combo-icon">👤</div>
                            <div>
                                <div class="combo-title">Inverse H&S + LFZ</div>
                                <div class="combo-subtitle">Bullish Reversal Combo</div>
                            </div>
                        </div>
                        <div class="combo-body">
                            <p><strong>Inverse Head & Shoulders</strong> là pattern đảo chiều mạnh nhất trong technical analysis. Khi vai phải (right shoulder) trùng với LFZ, setup này gần như "hoàn hảo"!</p>
                            <p><strong>Cách xác nhận:</strong></p>
                            <ul>
                                <li>Left Shoulder → Head (lower) → Right Shoulder</li>
                                <li>Right Shoulder nằm trong LFZ</li>
                                <li>Neckline rõ ràng làm resistance</li>
                                <li>Volume tăng dần từ Head đến Right Shoulder</li>
                            </ul>
                            <div class="win-rate-badge">⭐ Win Rate: 82%</div>
                        </div>
                    </div>
                </div>

                <div class="info-box">
                    <div class="info-box-title">💡 Entry Strategy</div>
                    <p>Có 2 cách entry: (1) Aggressive - Entry ngay khi right shoulder bounce từ LFZ với bullish candle, (2) Conservative - Đợi neckline breakout rồi mới entry. Cách 1 cho R:R tốt hơn, cách 2 an toàn hơn.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">👤</div>
                    <div class="label">Hình 2.5.3: Inverse Head & Shoulders + LFZ Entry</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Section 4: LFZ + Trendline Support -->
            <div class="content-card">
                <h2>📈 LFZ + Trendline Support</h2>

                <p>Khi LFZ trùng với đường trendline đang hoạt động, đây là setup "textbook" cho trade.</p>

                <h3>Cách Xác Nhận:</h3>
                <ul>
                    <li>Uptrend đang active với ít nhất 2 điểm chạm trendline</li>
                    <li>LFZ nằm trên hoặc gần trendline</li>
                    <li>Giá pullback về test cả LFZ và trendline cùng lúc</li>
                    <li>Bullish rejection candle tại confluence zone</li>
                </ul>

                <div class="image-placeholder">
                    <div class="icon">📈</div>
                    <div class="label">Hình 2.5.4: LFZ Confluence Với Trendline Support</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 5: Confluence Scoring -->
            <div class="content-card">
                <h2>🎯 Confluence Scoring System</h2>

                <p>Sử dụng hệ thống chấm điểm confluence để đánh giá chất lượng setup:</p>

                <div class="confluence-checklist">
                    <h4>📋 Confluence Checklist</h4>
                    <ul class="confluence-list">
                        <li><span class="confluence-score">+1</span> LFZ từ FRESH zone (chưa test)</li>
                        <li><span class="confluence-score">+1</span> LFZ trùng với Previous Support</li>
                        <li><span class="confluence-score">+1</span> LFZ trùng với Classic Pattern (Double Bottom, IH&S)</li>
                        <li><span class="confluence-score">+1</span> LFZ trùng với Trendline Support</li>
                        <li><span class="confluence-score">+1</span> LFZ trùng với Fibonacci Level (50%, 61.8%)</li>
                        <li><span class="confluence-score">+1</span> LFZ trùng với Round Number ($50,000, $3,000...)</li>
                        <li><span class="confluence-score">+1</span> Higher Timeframe LFZ hỗ trợ</li>
                    </ul>
                </div>

                <div class="info-box gold">
                    <div class="info-box-title">🎯 Cách Đánh Giá</div>
                    <p><strong>Score 1-2:</strong> Trade với position size nhỏ<br>
                    <strong>Score 3-4:</strong> Trade với position size bình thường<br>
                    <strong>Score 5+:</strong> High confidence trade, có thể tăng position size</p>
                </div>
            </div>
        </main>

        <!-- SUMMARY -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Confluence = Nhiều tín hiệu cùng chỉ một hướng → Win rate cao hơn</li>
                <li>LFZ + Double Bottom: Win rate ~78%</li>
                <li>LFZ + Inverse Head & Shoulders: Win rate ~82%</li>
                <li>LFZ + Trendline: Setup "textbook" cho buy the dip</li>
                <li>Dùng Confluence Scoring để đánh giá chất lượng setup</li>
            </ul>
        </div>

        <!-- QUIZ -->
        <div class="quiz-section">
            <div class="quiz-header">
                <h3>🎯 Kiểm Tra Kiến Thức</h3>
                <p>Trả lời các câu hỏi để củng cố bài học</p>
            </div>

            <div class="quiz-question" data-correct="2">
                <div class="question-text">Câu 1: Khi LFZ trùng với đáy của Inverse Head & Shoulders pattern, phần nào của pattern nên nằm trong LFZ để có setup tốt nhất?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Left Shoulder</div>
                    <div class="quiz-option" data-index="1">Head</div>
                    <div class="quiz-option" data-index="2">Right Shoulder</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <div class="question-text">Câu 2: Confluence Score bao nhiêu được coi là "High Confidence Trade"?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Score 1-2</div>
                    <div class="quiz-option" data-index="1">Score 5+</div>
                    <div class="quiz-option" data-index="2">Score 3-4</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text">🎉 Bạn trả lời đúng <span id="correct-count">0</span>/2 câu!</div>
                <button class="retake-btn" onclick="resetQuiz()">Làm Lại Quiz</button>
            </div>
        </div>

        <!-- FOOTER -->
        <footer class="lesson-footer">
            <div class="footer-logo">
                <span class="gem">GEM</span> Trading Academy
            </div>
            <div class="footer-text">© 2024 GEM Trading Academy. All rights reserved.</div>
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

        function resetQuiz() {
            answeredCount = 0;
            correctCount = 0;

            document.querySelectorAll(''.quiz-question'').forEach(question => {
                question.classList.remove(''answered'');
                question.querySelectorAll(''.quiz-option'').forEach(opt => {
                    opt.classList.remove(''correct'', ''incorrect'');
                });
                question.querySelector(''.quiz-result'').className = ''quiz-result'';
            });

            document.querySelector(''.quiz-score'').classList.remove(''show'');
        }
    </script>
</body>
</html>',
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

-- Lesson 2.6: Ví Dụ Thực Tế LFZ
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch2-l6',
  'module-tier-2-ch2',
  'course-tier2-trading-advanced',
  'Bài 2.6: Ví Dụ Thực Tế LFZ',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 2.6: Ví Dụ Thực Tế LFZ | GEM Trading Academy</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <style>
        :root {
            --primary-navy: #112250;
            --accent-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --error-red: #EF4444;
            --text-primary: #FFFFFF;
            --text-secondary: #A0AEC0;
            --bg-card: rgba(255, 255, 255, 0.05);
            --bg-card-hover: rgba(255, 255, 255, 0.08);
            --border-subtle: rgba(255, 255, 255, 0.1);
            --gradient-gold: linear-gradient(135deg, #FFBD59 0%, #FFCF87 100%);
            --gradient-green: linear-gradient(135deg, #10B981 0%, #34D399 100%);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--primary-navy);
            color: var(--text-primary);
            line-height: 1.7;
            min-height: 100vh;
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--primary-navy);
        }

        /* HEADER */
        .lesson-header {
            padding: 2rem 1.5rem;
            background: linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, transparent 100%);
            border-bottom: 1px solid var(--border-subtle);
            text-align: center;
        }

        .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--gradient-green);
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #000;
            margin-bottom: 1rem;
        }

        .lesson-chapter {
            font-size: 0.875rem;
            color: var(--success-green);
            font-weight: 500;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .lesson-meta {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            flex-wrap: wrap;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* CONTENT SECTION */
        .content-section {
            padding: 0;
        }

        .content-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1rem;
            padding: 1.5rem;
            border-left: 4px solid var(--success-green);
        }

        .content-card h2 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--success-green);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .content-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 1.25rem 0 0.75rem 0;
            color: var(--text-primary);
        }

        .content-card p {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            font-size: 0.9375rem;
        }

        .content-card ul, .content-card ol {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            padding-left: 1.5rem;
        }

        .content-card li {
            margin-bottom: 0.5rem;
            font-size: 0.9375rem;
        }

        /* IMAGE PLACEHOLDER */
        .image-placeholder {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
            border: 2px dashed var(--success-green);
            border-radius: 0.75rem;
            padding: 3rem 1.5rem;
            text-align: center;
            margin: 1.25rem 0;
        }

        .image-placeholder .icon {
            font-size: 2.5rem;
            margin-bottom: 0.75rem;
        }

        .image-placeholder .label {
            font-size: 0.875rem;
            color: var(--success-green);
            font-weight: 600;
        }

        .image-placeholder .dimensions {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
        }

        /* CASE STUDY CARD */
        .case-card {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 1rem;
            overflow: hidden;
            margin: 1rem 0;
        }

        .case-header {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 100%);
            padding: 1rem 1.25rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .case-title {
            font-size: 1rem;
            font-weight: 700;
            color: var(--text-primary);
        }

        .case-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .case-badge.win {
            background: rgba(16, 185, 129, 0.3);
            color: var(--success-green);
        }

        .case-badge.loss {
            background: rgba(239, 68, 68, 0.3);
            color: var(--error-red);
        }

        .case-body {
            padding: 1.25rem;
        }

        .case-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.5rem;
            margin-bottom: 1rem;
        }

        .stat-item {
            background: var(--bg-card);
            border-radius: 0.5rem;
            padding: 0.75rem;
            text-align: center;
        }

        .stat-label {
            font-size: 0.6875rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.25rem;
        }

        .stat-value {
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        .stat-value.green {
            color: var(--success-green);
        }

        .stat-value.red {
            color: var(--error-red);
        }

        .case-analysis {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .case-analysis h4 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }

        .case-analysis ol {
            padding-left: 1.25rem;
            margin: 0.5rem 0;
        }

        .case-analysis li {
            margin-bottom: 0.25rem;
        }

        /* LESSON BOX */
        .lesson-box {
            background: rgba(255, 189, 89, 0.1);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
            margin-top: 1rem;
        }

        .lesson-box-title {
            font-weight: 600;
            color: var(--accent-gold);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .lesson-box p {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin: 0;
        }

        /* SUMMARY BOX */
        .summary-box {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            margin: 1.5rem 1rem;
        }

        .summary-box h3 {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--success-green);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .summary-box li {
            position: relative;
            padding-left: 1.5rem;
            margin-bottom: 0.625rem;
            color: var(--text-secondary);
            font-size: 0.9375rem;
        }

        .summary-box li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-weight: bold;
        }

        /* QUIZ SECTION */
        .quiz-section {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1.5rem 1rem;
            padding: 1.5rem;
        }

        .quiz-header {
            text-align: center;
            margin-bottom: 1.5rem;
        }

        .quiz-header h3 {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
            margin-bottom: 0.25rem;
        }

        .quiz-header p {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .quiz-question {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin-bottom: 1rem;
        }

        .question-text {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .quiz-options {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.9375rem;
            color: var(--text-secondary);
        }

        .quiz-option:hover:not(.correct):not(.incorrect) {
            background: var(--bg-card-hover);
            border-color: var(--accent-gold);
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
            margin-top: 0.75rem;
            padding: 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success-green);
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: var(--error-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .score-text {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--gradient-gold);
            border: none;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #000;
            cursor: pointer;
            transition: transform 0.2s ease;
        }

        .retake-btn:hover {
            transform: scale(1.02);
        }

        /* FOOTER */
        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            border-top: 1px solid var(--border-subtle);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .footer-logo .gem {
            color: var(--accent-gold);
        }

        .footer-text {
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* MOBILE RESPONSIVE */
        @media (max-width: 600px) {
            .content-card {
                margin: 0.75rem 0;
                border-radius: 0;
                border-left: 4px solid var(--success-green);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-subtle);
            }

            .summary-box,
            .quiz-section {
                margin: 1rem 0;
                border-radius: 0;
            }

            .lesson-header {
                padding: 1.5rem 1rem;
            }

            .lesson-title {
                font-size: 1.5rem;
            }

            .case-stats {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <!-- HEADER -->
        <header class="lesson-header">
            <div class="header-badge">
                <span>📈</span>
                <span>Tier 2 - Nâng Cao</span>
            </div>
            <div class="lesson-chapter">Chapter 2 - LFZ Mastery</div>
            <h1 class="lesson-title">Ví Dụ Thực Tế LFZ</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 2.6</span></div>
                <div class="meta-item"><span>⏱️</span><span>15 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <!-- CONTENT -->
        <main class="content-section">
            <!-- Intro -->
            <div class="content-card">
                <h2>📊 Học Từ Thực Tế</h2>
                <p>Bài học này phân tích 5 case study thực tế về trade LFZ - bao gồm cả lệnh WIN và LOSS. Mục đích là hiểu rõ khi nào LFZ hoạt động tốt và khi nào cần cẩn thận.</p>
            </div>

            <!-- Case Study 1: WIN -->
            <div class="content-card">
                <h2>📈 Case Study #1: BTC/USDT 4H - UPU Pattern</h2>

                <div class="case-card">
                    <div class="case-header">
                        <div class="case-title">BTC/USDT - LONG tại LFZ</div>
                        <div class="case-badge win">✓ WIN +18.5%</div>
                    </div>
                    <div class="case-body">
                        <div class="case-stats">
                            <div class="stat-item">
                                <div class="stat-label">Entry</div>
                                <div class="stat-value">$42,150</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Stop</div>
                                <div class="stat-value">$41,400</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Target</div>
                                <div class="stat-value">$44,400</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">R:R</div>
                                <div class="stat-value green">1:3</div>
                            </div>
                        </div>

                        <div class="case-analysis">
                            <h4>Phân Tích:</h4>
                            <ol>
                                <li><strong>Pattern:</strong> UPU rõ ràng trên 4H timeframe</li>
                                <li><strong>LFZ:</strong> Vùng $41,800 - $42,300 (FRESH, chưa test)</li>
                                <li><strong>Confirmation:</strong> Hammer candle với volume 2x trung bình</li>
                                <li><strong>Confluence:</strong> LFZ trùng với Daily EMA 21</li>
                                <li><strong>Kết quả:</strong> TP hit sau 2 ngày, profit +18.5%</li>
                            </ol>
                        </div>

                        <div class="lesson-box">
                            <div class="lesson-box-title">💡 Bài Học</div>
                            <p>FRESH LFZ + Strong confirmation (Hammer + High volume) + Confluence (EMA) = High probability trade.</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📈</div>
                    <div class="label">Hình 2.6.1: BTC/USDT 4H - UPU LFZ Win Trade</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Case Study 2: WIN -->
            <div class="content-card">
                <h2>📈 Case Study #2: ETH/USDT 1D - DPU Pattern</h2>

                <div class="case-card">
                    <div class="case-header">
                        <div class="case-title">ETH/USDT - LONG tại LFZ (Reversal)</div>
                        <div class="case-badge win">✓ WIN +24%</div>
                    </div>
                    <div class="case-body">
                        <div class="case-stats">
                            <div class="stat-item">
                                <div class="stat-label">Entry</div>
                                <div class="stat-value">$2,180</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Stop</div>
                                <div class="stat-value">$2,050</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Target</div>
                                <div class="stat-value">$2,570</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">R:R</div>
                                <div class="stat-value green">1:3</div>
                            </div>
                        </div>

                        <div class="case-analysis">
                            <h4>Phân Tích:</h4>
                            <ol>
                                <li><strong>Pattern:</strong> DPU - Đảo chiều từ downtrend</li>
                                <li><strong>LFZ:</strong> Vùng $2,100 - $2,200</li>
                                <li><strong>Confirmation:</strong> Morning Star pattern + Bullish divergence RSI</li>
                                <li><strong>Confluence:</strong> Double Bottom + Previous support</li>
                                <li><strong>Kết quả:</strong> Rally mạnh, TP hit sau 1 tuần</li>
                            </ol>
                        </div>

                        <div class="lesson-box">
                            <div class="lesson-box-title">💡 Bài Học</div>
                            <p>DPU + LFZ tại Double Bottom + RSI Divergence = Strong reversal setup. Pattern 3 nến (Morning Star) cho xác nhận mạnh.</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🔄</div>
                    <div class="label">Hình 2.6.2: ETH/USDT Daily - DPU Reversal Win</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Case Study 3: LOSS -->
            <div class="content-card">
                <h2>📉 Case Study #3: SOL/USDT 4H - LFZ Bị Phá</h2>

                <div class="case-card">
                    <div class="case-header">
                        <div class="case-title">SOL/USDT - LFZ Failed</div>
                        <div class="case-badge loss">✗ LOSS -1.8%</div>
                    </div>
                    <div class="case-body">
                        <div class="case-stats">
                            <div class="stat-item">
                                <div class="stat-label">Entry</div>
                                <div class="stat-value">$98.50</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Stop</div>
                                <div class="stat-value">$96.70</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Target</div>
                                <div class="stat-value">$104.00</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Result</div>
                                <div class="stat-value red">SL Hit</div>
                            </div>
                        </div>

                        <div class="case-analysis">
                            <h4>Phân Tích Sai Lầm:</h4>
                            <ol>
                                <li><strong>Vấn đề 1:</strong> LFZ đã được test 2 lần trước đó (TESTED_2X)</li>
                                <li><strong>Vấn đề 2:</strong> BTC đang trong downtrend mạnh (market context xấu)</li>
                                <li><strong>Vấn đề 3:</strong> Volume confirmation yếu (chỉ 0.8x trung bình)</li>
                                <li><strong>Vấn đề 4:</strong> Entry quá sớm, không đợi candle close</li>
                                <li><strong>Kết quả:</strong> LFZ bị phá vỡ, SL hit</li>
                            </ol>
                        </div>

                        <div class="lesson-box">
                            <div class="lesson-box-title">⚠️ Bài Học Từ Loss</div>
                            <p>TESTED_2X zone yếu hơn FRESH zone nhiều. Luôn kiểm tra market context (BTC) và đợi strong confirmation trước khi entry.</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📉</div>
                    <div class="label">Hình 2.6.3: SOL/USDT - LFZ Breakdown Analysis</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Case Study 4: WIN -->
            <div class="content-card">
                <h2>📈 Case Study #4: BNB/USDT 1H - Scalp Trade</h2>

                <div class="case-card">
                    <div class="case-header">
                        <div class="case-title">BNB/USDT - Quick Scalp tại LFZ</div>
                        <div class="case-badge win">✓ WIN +4.2%</div>
                    </div>
                    <div class="case-body">
                        <div class="case-stats">
                            <div class="stat-item">
                                <div class="stat-label">Entry</div>
                                <div class="stat-value">$312.50</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Stop</div>
                                <div class="stat-value">$308.00</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Target</div>
                                <div class="stat-value">$321.50</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">R:R</div>
                                <div class="stat-value green">1:2</div>
                            </div>
                        </div>

                        <div class="case-analysis">
                            <h4>Phân Tích:</h4>
                            <ol>
                                <li><strong>Timeframe:</strong> 1H cho scalp trade</li>
                                <li><strong>Pattern:</strong> UPU mini trong uptrend 4H</li>
                                <li><strong>LFZ:</strong> FRESH zone, độ dày ~1.2%</li>
                                <li><strong>Confirmation:</strong> Bullish engulfing tại LFZ</li>
                                <li><strong>Kết quả:</strong> TP hit trong 4 giờ</li>
                            </ol>
                        </div>

                        <div class="lesson-box">
                            <div class="lesson-box-title">💡 Bài Học</div>
                            <p>LFZ trên timeframe thấp (1H) hiệu quả khi aligned với trend timeframe cao (4H uptrend). Quick TP, không tham.</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">⚡</div>
                    <div class="label">Hình 2.6.4: BNB/USDT 1H - Scalp Trade Win</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Case Study 5: WIN với Trailing Stop -->
            <div class="content-card">
                <h2>📈 Case Study #5: AVAX/USDT 4H - Trailing Stop</h2>

                <div class="case-card">
                    <div class="case-header">
                        <div class="case-title">AVAX/USDT - LFZ + Trailing Stop</div>
                        <div class="case-badge win">✓ WIN +32%</div>
                    </div>
                    <div class="case-body">
                        <div class="case-stats">
                            <div class="stat-item">
                                <div class="stat-label">Entry</div>
                                <div class="stat-value">$28.50</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Initial SL</div>
                                <div class="stat-value">$27.00</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Final Exit</div>
                                <div class="stat-value">$37.60</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">R:R</div>
                                <div class="stat-value green">1:6</div>
                            </div>
                        </div>

                        <div class="case-analysis">
                            <h4>Phân Tích:</h4>
                            <ol>
                                <li><strong>Setup:</strong> DPU reversal + LFZ at major support</li>
                                <li><strong>Strategy:</strong> TP1 hit → Move SL to entry (breakeven)</li>
                                <li><strong>Trailing:</strong> Trail SL theo swing lows mới</li>
                                <li><strong>Exit:</strong> Trailing SL hit sau khi AVAX rally 32%</li>
                                <li><strong>Key:</strong> Let winners run!</li>
                            </ol>
                        </div>

                        <div class="lesson-box">
                            <div class="lesson-box-title">💡 Bài Học</div>
                            <p>Khi trade đúng hướng, dùng trailing stop để maximize profit. Đừng TP quá sớm khi trend mạnh.</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🎯</div>
                    <div class="label">Hình 2.6.5: AVAX/USDT - Trailing Stop Management</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>
        </main>

        <!-- SUMMARY -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt 5 Case Studies</h3>
            <ul>
                <li>Case 1: FRESH LFZ + Strong volume = High win rate</li>
                <li>Case 2: DPU + Double Bottom + Divergence = Strong reversal</li>
                <li>Case 3: TESTED zone + Bad context = Higher loss risk</li>
                <li>Case 4: LTF LFZ aligned với HTF trend = Good scalp setup</li>
                <li>Case 5: Use trailing stop to let winners run</li>
            </ul>
        </div>

        <!-- QUIZ -->
        <div class="quiz-section">
            <div class="quiz-header">
                <h3>🎯 Kiểm Tra Kiến Thức</h3>
                <p>Trả lời các câu hỏi để củng cố bài học</p>
            </div>

            <div class="quiz-question" data-correct="1">
                <div class="question-text">Câu 1: Trong Case Study #3 (SOL LOSS), đâu là nguyên nhân chính dẫn đến thua lỗ?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Entry price quá cao</div>
                    <div class="quiz-option" data-index="1">LFZ đã TESTED_2X + Market context xấu + Volume yếu</div>
                    <div class="quiz-option" data-index="2">Stoploss đặt quá sát</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <div class="question-text">Câu 2: Khi trade đã có lợi nhuận, chiến lược nào giúp maximize profit như Case #5?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Đóng 100% position ngay khi có lãi nhỏ</div>
                    <div class="quiz-option" data-index="1">Giữ nguyên stoploss ban đầu</div>
                    <div class="quiz-option" data-index="2">Dùng trailing stop theo swing lows mới</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text">🎉 Bạn trả lời đúng <span id="correct-count">0</span>/2 câu!</div>
                <button class="retake-btn" onclick="resetQuiz()">Làm Lại Quiz</button>
            </div>
        </div>

        <!-- FOOTER -->
        <footer class="lesson-footer">
            <div class="footer-logo">
                <span class="gem">GEM</span> Trading Academy
            </div>
            <div class="footer-text">© 2024 GEM Trading Academy. All rights reserved.</div>
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

        function resetQuiz() {
            answeredCount = 0;
            correctCount = 0;

            document.querySelectorAll(''.quiz-question'').forEach(question => {
                question.classList.remove(''answered'');
                question.querySelectorAll(''.quiz-option'').forEach(opt => {
                    opt.classList.remove(''correct'', ''incorrect'');
                });
                question.querySelector(''.quiz-result'').className = ''quiz-result'';
            });

            document.querySelector(''.quiz-score'').classList.remove(''show'');
        }
    </script>
</body>
</html>',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 2.6: Ví Dụ Thực Tế LFZ | GEM Trading Academy</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <style>
        :root {
            --primary-navy: #112250;
            --accent-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --error-red: #EF4444;
            --text-primary: #FFFFFF;
            --text-secondary: #A0AEC0;
            --bg-card: rgba(255, 255, 255, 0.05);
            --bg-card-hover: rgba(255, 255, 255, 0.08);
            --border-subtle: rgba(255, 255, 255, 0.1);
            --gradient-gold: linear-gradient(135deg, #FFBD59 0%, #FFCF87 100%);
            --gradient-green: linear-gradient(135deg, #10B981 0%, #34D399 100%);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--primary-navy);
            color: var(--text-primary);
            line-height: 1.7;
            min-height: 100vh;
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--primary-navy);
        }

        /* HEADER */
        .lesson-header {
            padding: 2rem 1.5rem;
            background: linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, transparent 100%);
            border-bottom: 1px solid var(--border-subtle);
            text-align: center;
        }

        .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--gradient-green);
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #000;
            margin-bottom: 1rem;
        }

        .lesson-chapter {
            font-size: 0.875rem;
            color: var(--success-green);
            font-weight: 500;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .lesson-meta {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            flex-wrap: wrap;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* CONTENT SECTION */
        .content-section {
            padding: 0;
        }

        .content-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1rem;
            padding: 1.5rem;
            border-left: 4px solid var(--success-green);
        }

        .content-card h2 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--success-green);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .content-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 1.25rem 0 0.75rem 0;
            color: var(--text-primary);
        }

        .content-card p {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            font-size: 0.9375rem;
        }

        .content-card ul, .content-card ol {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            padding-left: 1.5rem;
        }

        .content-card li {
            margin-bottom: 0.5rem;
            font-size: 0.9375rem;
        }

        /* IMAGE PLACEHOLDER */
        .image-placeholder {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
            border: 2px dashed var(--success-green);
            border-radius: 0.75rem;
            padding: 3rem 1.5rem;
            text-align: center;
            margin: 1.25rem 0;
        }

        .image-placeholder .icon {
            font-size: 2.5rem;
            margin-bottom: 0.75rem;
        }

        .image-placeholder .label {
            font-size: 0.875rem;
            color: var(--success-green);
            font-weight: 600;
        }

        .image-placeholder .dimensions {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
        }

        /* CASE STUDY CARD */
        .case-card {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 1rem;
            overflow: hidden;
            margin: 1rem 0;
        }

        .case-header {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 100%);
            padding: 1rem 1.25rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .case-title {
            font-size: 1rem;
            font-weight: 700;
            color: var(--text-primary);
        }

        .case-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .case-badge.win {
            background: rgba(16, 185, 129, 0.3);
            color: var(--success-green);
        }

        .case-badge.loss {
            background: rgba(239, 68, 68, 0.3);
            color: var(--error-red);
        }

        .case-body {
            padding: 1.25rem;
        }

        .case-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.5rem;
            margin-bottom: 1rem;
        }

        .stat-item {
            background: var(--bg-card);
            border-radius: 0.5rem;
            padding: 0.75rem;
            text-align: center;
        }

        .stat-label {
            font-size: 0.6875rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.25rem;
        }

        .stat-value {
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        .stat-value.green {
            color: var(--success-green);
        }

        .stat-value.red {
            color: var(--error-red);
        }

        .case-analysis {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .case-analysis h4 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }

        .case-analysis ol {
            padding-left: 1.25rem;
            margin: 0.5rem 0;
        }

        .case-analysis li {
            margin-bottom: 0.25rem;
        }

        /* LESSON BOX */
        .lesson-box {
            background: rgba(255, 189, 89, 0.1);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
            margin-top: 1rem;
        }

        .lesson-box-title {
            font-weight: 600;
            color: var(--accent-gold);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .lesson-box p {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin: 0;
        }

        /* SUMMARY BOX */
        .summary-box {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            margin: 1.5rem 1rem;
        }

        .summary-box h3 {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--success-green);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .summary-box li {
            position: relative;
            padding-left: 1.5rem;
            margin-bottom: 0.625rem;
            color: var(--text-secondary);
            font-size: 0.9375rem;
        }

        .summary-box li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-weight: bold;
        }

        /* QUIZ SECTION */
        .quiz-section {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1.5rem 1rem;
            padding: 1.5rem;
        }

        .quiz-header {
            text-align: center;
            margin-bottom: 1.5rem;
        }

        .quiz-header h3 {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
            margin-bottom: 0.25rem;
        }

        .quiz-header p {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .quiz-question {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin-bottom: 1rem;
        }

        .question-text {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .quiz-options {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.9375rem;
            color: var(--text-secondary);
        }

        .quiz-option:hover:not(.correct):not(.incorrect) {
            background: var(--bg-card-hover);
            border-color: var(--accent-gold);
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
            margin-top: 0.75rem;
            padding: 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success-green);
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: var(--error-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .score-text {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--gradient-gold);
            border: none;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #000;
            cursor: pointer;
            transition: transform 0.2s ease;
        }

        .retake-btn:hover {
            transform: scale(1.02);
        }

        /* FOOTER */
        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            border-top: 1px solid var(--border-subtle);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .footer-logo .gem {
            color: var(--accent-gold);
        }

        .footer-text {
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        /* MOBILE RESPONSIVE */
        @media (max-width: 600px) {
            .content-card {
                margin: 0.75rem 0;
                border-radius: 0;
                border-left: 4px solid var(--success-green);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-subtle);
            }

            .summary-box,
            .quiz-section {
                margin: 1rem 0;
                border-radius: 0;
            }

            .lesson-header {
                padding: 1.5rem 1rem;
            }

            .lesson-title {
                font-size: 1.5rem;
            }

            .case-stats {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <!-- HEADER -->
        <header class="lesson-header">
            <div class="header-badge">
                <span>📈</span>
                <span>Tier 2 - Nâng Cao</span>
            </div>
            <div class="lesson-chapter">Chapter 2 - LFZ Mastery</div>
            <h1 class="lesson-title">Ví Dụ Thực Tế LFZ</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 2.6</span></div>
                <div class="meta-item"><span>⏱️</span><span>15 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <!-- CONTENT -->
        <main class="content-section">
            <!-- Intro -->
            <div class="content-card">
                <h2>📊 Học Từ Thực Tế</h2>
                <p>Bài học này phân tích 5 case study thực tế về trade LFZ - bao gồm cả lệnh WIN và LOSS. Mục đích là hiểu rõ khi nào LFZ hoạt động tốt và khi nào cần cẩn thận.</p>
            </div>

            <!-- Case Study 1: WIN -->
            <div class="content-card">
                <h2>📈 Case Study #1: BTC/USDT 4H - UPU Pattern</h2>

                <div class="case-card">
                    <div class="case-header">
                        <div class="case-title">BTC/USDT - LONG tại LFZ</div>
                        <div class="case-badge win">✓ WIN +18.5%</div>
                    </div>
                    <div class="case-body">
                        <div class="case-stats">
                            <div class="stat-item">
                                <div class="stat-label">Entry</div>
                                <div class="stat-value">$42,150</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Stop</div>
                                <div class="stat-value">$41,400</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Target</div>
                                <div class="stat-value">$44,400</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">R:R</div>
                                <div class="stat-value green">1:3</div>
                            </div>
                        </div>

                        <div class="case-analysis">
                            <h4>Phân Tích:</h4>
                            <ol>
                                <li><strong>Pattern:</strong> UPU rõ ràng trên 4H timeframe</li>
                                <li><strong>LFZ:</strong> Vùng $41,800 - $42,300 (FRESH, chưa test)</li>
                                <li><strong>Confirmation:</strong> Hammer candle với volume 2x trung bình</li>
                                <li><strong>Confluence:</strong> LFZ trùng với Daily EMA 21</li>
                                <li><strong>Kết quả:</strong> TP hit sau 2 ngày, profit +18.5%</li>
                            </ol>
                        </div>

                        <div class="lesson-box">
                            <div class="lesson-box-title">💡 Bài Học</div>
                            <p>FRESH LFZ + Strong confirmation (Hammer + High volume) + Confluence (EMA) = High probability trade.</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📈</div>
                    <div class="label">Hình 2.6.1: BTC/USDT 4H - UPU LFZ Win Trade</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Case Study 2: WIN -->
            <div class="content-card">
                <h2>📈 Case Study #2: ETH/USDT 1D - DPU Pattern</h2>

                <div class="case-card">
                    <div class="case-header">
                        <div class="case-title">ETH/USDT - LONG tại LFZ (Reversal)</div>
                        <div class="case-badge win">✓ WIN +24%</div>
                    </div>
                    <div class="case-body">
                        <div class="case-stats">
                            <div class="stat-item">
                                <div class="stat-label">Entry</div>
                                <div class="stat-value">$2,180</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Stop</div>
                                <div class="stat-value">$2,050</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Target</div>
                                <div class="stat-value">$2,570</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">R:R</div>
                                <div class="stat-value green">1:3</div>
                            </div>
                        </div>

                        <div class="case-analysis">
                            <h4>Phân Tích:</h4>
                            <ol>
                                <li><strong>Pattern:</strong> DPU - Đảo chiều từ downtrend</li>
                                <li><strong>LFZ:</strong> Vùng $2,100 - $2,200</li>
                                <li><strong>Confirmation:</strong> Morning Star pattern + Bullish divergence RSI</li>
                                <li><strong>Confluence:</strong> Double Bottom + Previous support</li>
                                <li><strong>Kết quả:</strong> Rally mạnh, TP hit sau 1 tuần</li>
                            </ol>
                        </div>

                        <div class="lesson-box">
                            <div class="lesson-box-title">💡 Bài Học</div>
                            <p>DPU + LFZ tại Double Bottom + RSI Divergence = Strong reversal setup. Pattern 3 nến (Morning Star) cho xác nhận mạnh.</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🔄</div>
                    <div class="label">Hình 2.6.2: ETH/USDT Daily - DPU Reversal Win</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Case Study 3: LOSS -->
            <div class="content-card">
                <h2>📉 Case Study #3: SOL/USDT 4H - LFZ Bị Phá</h2>

                <div class="case-card">
                    <div class="case-header">
                        <div class="case-title">SOL/USDT - LFZ Failed</div>
                        <div class="case-badge loss">✗ LOSS -1.8%</div>
                    </div>
                    <div class="case-body">
                        <div class="case-stats">
                            <div class="stat-item">
                                <div class="stat-label">Entry</div>
                                <div class="stat-value">$98.50</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Stop</div>
                                <div class="stat-value">$96.70</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Target</div>
                                <div class="stat-value">$104.00</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Result</div>
                                <div class="stat-value red">SL Hit</div>
                            </div>
                        </div>

                        <div class="case-analysis">
                            <h4>Phân Tích Sai Lầm:</h4>
                            <ol>
                                <li><strong>Vấn đề 1:</strong> LFZ đã được test 2 lần trước đó (TESTED_2X)</li>
                                <li><strong>Vấn đề 2:</strong> BTC đang trong downtrend mạnh (market context xấu)</li>
                                <li><strong>Vấn đề 3:</strong> Volume confirmation yếu (chỉ 0.8x trung bình)</li>
                                <li><strong>Vấn đề 4:</strong> Entry quá sớm, không đợi candle close</li>
                                <li><strong>Kết quả:</strong> LFZ bị phá vỡ, SL hit</li>
                            </ol>
                        </div>

                        <div class="lesson-box">
                            <div class="lesson-box-title">⚠️ Bài Học Từ Loss</div>
                            <p>TESTED_2X zone yếu hơn FRESH zone nhiều. Luôn kiểm tra market context (BTC) và đợi strong confirmation trước khi entry.</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📉</div>
                    <div class="label">Hình 2.6.3: SOL/USDT - LFZ Breakdown Analysis</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Case Study 4: WIN -->
            <div class="content-card">
                <h2>📈 Case Study #4: BNB/USDT 1H - Scalp Trade</h2>

                <div class="case-card">
                    <div class="case-header">
                        <div class="case-title">BNB/USDT - Quick Scalp tại LFZ</div>
                        <div class="case-badge win">✓ WIN +4.2%</div>
                    </div>
                    <div class="case-body">
                        <div class="case-stats">
                            <div class="stat-item">
                                <div class="stat-label">Entry</div>
                                <div class="stat-value">$312.50</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Stop</div>
                                <div class="stat-value">$308.00</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Target</div>
                                <div class="stat-value">$321.50</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">R:R</div>
                                <div class="stat-value green">1:2</div>
                            </div>
                        </div>

                        <div class="case-analysis">
                            <h4>Phân Tích:</h4>
                            <ol>
                                <li><strong>Timeframe:</strong> 1H cho scalp trade</li>
                                <li><strong>Pattern:</strong> UPU mini trong uptrend 4H</li>
                                <li><strong>LFZ:</strong> FRESH zone, độ dày ~1.2%</li>
                                <li><strong>Confirmation:</strong> Bullish engulfing tại LFZ</li>
                                <li><strong>Kết quả:</strong> TP hit trong 4 giờ</li>
                            </ol>
                        </div>

                        <div class="lesson-box">
                            <div class="lesson-box-title">💡 Bài Học</div>
                            <p>LFZ trên timeframe thấp (1H) hiệu quả khi aligned với trend timeframe cao (4H uptrend). Quick TP, không tham.</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">⚡</div>
                    <div class="label">Hình 2.6.4: BNB/USDT 1H - Scalp Trade Win</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Case Study 5: WIN với Trailing Stop -->
            <div class="content-card">
                <h2>📈 Case Study #5: AVAX/USDT 4H - Trailing Stop</h2>

                <div class="case-card">
                    <div class="case-header">
                        <div class="case-title">AVAX/USDT - LFZ + Trailing Stop</div>
                        <div class="case-badge win">✓ WIN +32%</div>
                    </div>
                    <div class="case-body">
                        <div class="case-stats">
                            <div class="stat-item">
                                <div class="stat-label">Entry</div>
                                <div class="stat-value">$28.50</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Initial SL</div>
                                <div class="stat-value">$27.00</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Final Exit</div>
                                <div class="stat-value">$37.60</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">R:R</div>
                                <div class="stat-value green">1:6</div>
                            </div>
                        </div>

                        <div class="case-analysis">
                            <h4>Phân Tích:</h4>
                            <ol>
                                <li><strong>Setup:</strong> DPU reversal + LFZ at major support</li>
                                <li><strong>Strategy:</strong> TP1 hit → Move SL to entry (breakeven)</li>
                                <li><strong>Trailing:</strong> Trail SL theo swing lows mới</li>
                                <li><strong>Exit:</strong> Trailing SL hit sau khi AVAX rally 32%</li>
                                <li><strong>Key:</strong> Let winners run!</li>
                            </ol>
                        </div>

                        <div class="lesson-box">
                            <div class="lesson-box-title">💡 Bài Học</div>
                            <p>Khi trade đúng hướng, dùng trailing stop để maximize profit. Đừng TP quá sớm khi trend mạnh.</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🎯</div>
                    <div class="label">Hình 2.6.5: AVAX/USDT - Trailing Stop Management</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>
        </main>

        <!-- SUMMARY -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt 5 Case Studies</h3>
            <ul>
                <li>Case 1: FRESH LFZ + Strong volume = High win rate</li>
                <li>Case 2: DPU + Double Bottom + Divergence = Strong reversal</li>
                <li>Case 3: TESTED zone + Bad context = Higher loss risk</li>
                <li>Case 4: LTF LFZ aligned với HTF trend = Good scalp setup</li>
                <li>Case 5: Use trailing stop to let winners run</li>
            </ul>
        </div>

        <!-- QUIZ -->
        <div class="quiz-section">
            <div class="quiz-header">
                <h3>🎯 Kiểm Tra Kiến Thức</h3>
                <p>Trả lời các câu hỏi để củng cố bài học</p>
            </div>

            <div class="quiz-question" data-correct="1">
                <div class="question-text">Câu 1: Trong Case Study #3 (SOL LOSS), đâu là nguyên nhân chính dẫn đến thua lỗ?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Entry price quá cao</div>
                    <div class="quiz-option" data-index="1">LFZ đã TESTED_2X + Market context xấu + Volume yếu</div>
                    <div class="quiz-option" data-index="2">Stoploss đặt quá sát</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <div class="question-text">Câu 2: Khi trade đã có lợi nhuận, chiến lược nào giúp maximize profit như Case #5?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Đóng 100% position ngay khi có lãi nhỏ</div>
                    <div class="quiz-option" data-index="1">Giữ nguyên stoploss ban đầu</div>
                    <div class="quiz-option" data-index="2">Dùng trailing stop theo swing lows mới</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text">🎉 Bạn trả lời đúng <span id="correct-count">0</span>/2 câu!</div>
                <button class="retake-btn" onclick="resetQuiz()">Làm Lại Quiz</button>
            </div>
        </div>

        <!-- FOOTER -->
        <footer class="lesson-footer">
            <div class="footer-logo">
                <span class="gem">GEM</span> Trading Academy
            </div>
            <div class="footer-text">© 2024 GEM Trading Academy. All rights reserved.</div>
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

        function resetQuiz() {
            answeredCount = 0;
            correctCount = 0;

            document.querySelectorAll(''.quiz-question'').forEach(question => {
                question.classList.remove(''answered'');
                question.querySelectorAll(''.quiz-option'').forEach(opt => {
                    opt.classList.remove(''correct'', ''incorrect'');
                });
                question.querySelector(''.quiz-result'').className = ''quiz-result'';
            });

            document.querySelector(''.quiz-score'').classList.remove(''show'');
        }
    </script>
</body>
</html>',
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

-- ✅ Done: 6 lessons
