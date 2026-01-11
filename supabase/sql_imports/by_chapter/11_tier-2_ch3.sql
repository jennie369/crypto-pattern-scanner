-- =====================================================
-- TIER-2 - Chương 3: Advanced Triangles
-- Course: course-tier2-trading-advanced
-- File 11/23
-- =====================================================

-- Create/Update Module
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  'module-tier-2-ch3',
  'course-tier2-trading-advanced',
  'Chương 3: Advanced Triangles',
  'Mẫu hình tam giác nâng cao',
  3,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Lesson 3.1: Ascending Triangle - Tam Giác Tăng
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch3-l1',
  'module-tier-2-ch3',
  'course-tier2-trading-advanced',
  'Bài 3.1: Ascending Triangle - Tam Giác Tăng',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 3.1: Ascending Triangle - Tam Giác Tăng | GEM Trading Academy</title>

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
            --gradient-cyan: linear-gradient(135deg, #00F0FF 0%, #00C4CC 100%);
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
            background: linear-gradient(180deg, rgba(0, 240, 255, 0.15) 0%, transparent 100%);
            border-bottom: 1px solid var(--border-subtle);
            text-align: center;
        }

        .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--gradient-cyan);
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
            color: var(--accent-cyan);
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
            border-left: 4px solid var(--accent-cyan);
        }

        .content-card h2 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--accent-cyan);
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
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(0, 240, 255, 0.1) 100%);
            border: 2px dashed var(--accent-cyan);
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
            color: var(--accent-cyan);
            font-weight: 600;
        }

        .image-placeholder .dimensions {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
        }

        /* PATTERN VISUAL */
        .pattern-visual {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 0.75rem;
            padding: 1.5rem;
            margin: 1rem 0;
            text-align: center;
            font-family: ''JetBrains Mono'', monospace;
        }

        .pattern-diagram {
            font-size: 0.75rem;
            color: var(--accent-cyan);
            line-height: 1.4;
            white-space: pre;
        }

        /* INFO BOX */
        .info-box {
            background: rgba(0, 240, 255, 0.1);
            border: 1px solid rgba(0, 240, 255, 0.3);
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
            color: var(--accent-cyan);
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

        /* STAT GRID */
        .stat-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        .stat-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
        }

        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-cyan);
            margin-bottom: 0.25rem;
        }

        .stat-label {
            font-size: 0.75rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
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
            background: var(--gradient-cyan);
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

        /* SUMMARY BOX */
        .summary-box {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(0, 240, 255, 0.05) 100%);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            margin: 1.5rem 1rem;
        }

        .summary-box h3 {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--accent-cyan);
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
            color: var(--accent-cyan);
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
                border-left: 4px solid var(--accent-cyan);
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

            .stat-grid {
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
            <div class="lesson-chapter">Chapter 3 - Triangle Patterns</div>
            <h1 class="lesson-title">Ascending Triangle - Tam Giác Tăng</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 3.1</span></div>
                <div class="meta-item"><span>⏱️</span><span>10 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>3 câu quiz</span></div>
            </div>
        </header>

        <!-- CONTENT -->
        <main class="content-section">
            <!-- Section 1: Định nghĩa -->
            <div class="content-card">
                <h2>📐 Ascending Triangle Là Gì?</h2>

                <p><strong>Ascending Triangle</strong> (Tam Giác Tăng) là mô hình tiếp diễn bullish được hình thành khi giá tạo ra đường kháng cự ngang (flat resistance) và đường hỗ trợ nghiêng lên (rising support).</p>

                <div class="pattern-visual">
                    <div class="pattern-diagram">
         ┌─────────────────────── Resistance (Flat)
         │    ╱╲    ╱╲    ╱╲
         │   ╱  ╲  ╱  ╲  ╱  ╲────▶ Breakout!
         │  ╱    ╲╱    ╲╱
         │ ╱
         ╱─────────────────────── Support (Rising)
                    </div>
                </div>

                <div class="stat-grid">
                    <div class="stat-card">
                        <div class="stat-value">70%</div>
                        <div class="stat-label">Win Rate</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">1:2.5</div>
                        <div class="stat-label">Avg R:R</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">75%</div>
                        <div class="stat-label">Breakout Up</div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📐</div>
                    <div class="label">Hình 3.1.1: Cấu Trúc Ascending Triangle</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 2: Cấu trúc -->
            <div class="content-card">
                <h2>🔍 Cấu Trúc Chi Tiết</h2>

                <h3>1. Đường Kháng Cự Ngang (Flat Resistance)</h3>
                <ul>
                    <li>Giá test cùng một mức kháng cự ít nhất 2-3 lần</li>
                    <li>Các đỉnh gần như bằng nhau (±0.5%)</li>
                    <li>Đây là vùng có nhiều lệnh SELL chờ sẵn</li>
                </ul>

                <h3>2. Đường Hỗ Trợ Nghiêng Lên (Rising Support)</h3>
                <ul>
                    <li>Các đáy cao dần (higher lows)</li>
                    <li>Ít nhất 2-3 điểm chạm trendline</li>
                    <li>Cho thấy buyers đang aggressive hơn</li>
                </ul>

                <h3>3. Volume Pattern</h3>
                <ul>
                    <li>Volume giảm dần trong quá trình hình thành</li>
                    <li>Volume spike khi breakout - XÁC NHẬN QUAN TRỌNG!</li>
                </ul>

                <div class="info-box">
                    <div class="info-box-title">💡 Tại Sao Ascending Triangle Bullish?</div>
                    <p>Higher lows cho thấy buyers sẵn sàng mua ở giá cao hơn. Áp lực mua tăng dần trong khi sellers giữ nguyên giá bán → Cuối cùng buyers thắng và breakout lên.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🔍</div>
                    <div class="label">Hình 3.1.2: Volume Giảm Trong Triangle, Spike Khi Breakout</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 3: Cách nhận diện -->
            <div class="content-card">
                <h2>✅ Checklist Nhận Diện Ascending Triangle</h2>

                <div class="step-list">
                    <div class="step-item">
                        <h4>Xác Định Trend Trước Đó</h4>
                        <p>Ascending Triangle thường xuất hiện trong uptrend (continuation pattern)</p>
                    </div>
                    <div class="step-item">
                        <h4>Tìm Flat Resistance</h4>
                        <p>Ít nhất 2 đỉnh ngang nhau, các lần test không phá được resistance</p>
                    </div>
                    <div class="step-item">
                        <h4>Xác Nhận Rising Support</h4>
                        <p>Vẽ trendline nối các đáy - phải có độ dốc lên rõ ràng</p>
                    </div>
                    <div class="step-item">
                        <h4>Kiểm Tra Volume</h4>
                        <p>Volume giảm dần, tạo "squeeze" trước breakout</p>
                    </div>
                    <div class="step-item">
                        <h4>Đợi Breakout</h4>
                        <p>Breakout kèm volume spike = xác nhận mạnh</p>
                    </div>
                </div>
            </div>

            <!-- Section 4: Chiến lược trade -->
            <div class="content-card">
                <h2>🎯 Chiến Lược Trade Ascending Triangle</h2>

                <h3>Entry Strategies:</h3>

                <p><strong>1. Breakout Entry (Conservative):</strong></p>
                <ul>
                    <li>Đợi nến đóng cửa TRÊN resistance</li>
                    <li>Volume breakout > 1.5x trung bình</li>
                    <li>Entry tại candle close hoặc pullback về resistance (now support)</li>
                </ul>

                <p><strong>2. Anticipation Entry (Aggressive):</strong></p>
                <ul>
                    <li>Entry khi giá bounce từ rising support</li>
                    <li>SL dưới trendline</li>
                    <li>Rủi ro cao hơn nhưng R:R tốt hơn</li>
                </ul>

                <h3>Target Calculation:</h3>
                <p><strong>Measured Move:</strong> Đo chiều cao triangle (từ resistance đến đáy đầu tiên), cộng vào điểm breakout.</p>

                <div class="info-box gold">
                    <div class="info-box-title">🎯 Ví Dụ Tính Target</div>
                    <p>Resistance: $50,000 | Đáy đầu tiên: $45,000<br>
                    Chiều cao = $5,000<br>
                    Target = $50,000 + $5,000 = $55,000</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🎯</div>
                    <div class="label">Hình 3.1.3: Entry Points và Target Calculation</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Section 5: Lưu ý -->
            <div class="content-card">
                <h2>⚠️ Lưu Ý Quan Trọng</h2>

                <ul>
                    <li><strong>False Breakout:</strong> ~25% breakouts thất bại. Luôn đợi confirmation (candle close + volume)</li>
                    <li><strong>Time Factor:</strong> Triangle nên hoàn thành trong 3-8 tuần. Quá lâu = mất momentum</li>
                    <li><strong>Breakout Direction:</strong> 75% breakout lên, 25% breakdown. Không phải lúc nào cũng bullish!</li>
                    <li><strong>Retests:</strong> ~60% breakouts có retest. Đây là cơ hội entry thứ hai</li>
                </ul>

                <div class="image-placeholder">
                    <div class="icon">⚠️</div>
                    <div class="label">Hình 3.1.4: False Breakout vs Valid Breakout</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>
        </main>

        <!-- SUMMARY -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Ascending Triangle = Flat resistance + Rising support</li>
                <li>Bullish continuation pattern với 70% win rate</li>
                <li>Volume giảm dần, spike khi breakout</li>
                <li>Target = Chiều cao triangle + Breakout point</li>
                <li>Luôn đợi confirmation trước khi entry</li>
            </ul>
        </div>

        <!-- QUIZ -->
        <div class="quiz-section">
            <div class="quiz-header">
                <h3>🎯 Kiểm Tra Kiến Thức</h3>
                <p>Trả lời các câu hỏi để củng cố bài học</p>
            </div>

            <div class="quiz-question" data-correct="1">
                <div class="question-text">Câu 1: Ascending Triangle có đặc điểm gì?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Đường resistance nghiêng lên + đường support ngang</div>
                    <div class="quiz-option" data-index="1">Đường resistance ngang + đường support nghiêng lên</div>
                    <div class="quiz-option" data-index="2">Cả hai đường đều nghiêng lên</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <div class="question-text">Câu 2: Volume pattern điển hình trong Ascending Triangle là gì?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Volume tăng dần trong triangle</div>
                    <div class="quiz-option" data-index="1">Volume không thay đổi</div>
                    <div class="quiz-option" data-index="2">Volume giảm dần, spike khi breakout</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <div class="question-text">Câu 3: Tỷ lệ Ascending Triangle breakout lên là bao nhiêu?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">~75% breakout lên</div>
                    <div class="quiz-option" data-index="1">~50% breakout lên</div>
                    <div class="quiz-option" data-index="2">~90% breakout lên</div>
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
    <title>Bài 3.1: Ascending Triangle - Tam Giác Tăng | GEM Trading Academy</title>

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
            --gradient-cyan: linear-gradient(135deg, #00F0FF 0%, #00C4CC 100%);
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
            background: linear-gradient(180deg, rgba(0, 240, 255, 0.15) 0%, transparent 100%);
            border-bottom: 1px solid var(--border-subtle);
            text-align: center;
        }

        .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--gradient-cyan);
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
            color: var(--accent-cyan);
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
            border-left: 4px solid var(--accent-cyan);
        }

        .content-card h2 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--accent-cyan);
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
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(0, 240, 255, 0.1) 100%);
            border: 2px dashed var(--accent-cyan);
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
            color: var(--accent-cyan);
            font-weight: 600;
        }

        .image-placeholder .dimensions {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
        }

        /* PATTERN VISUAL */
        .pattern-visual {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 0.75rem;
            padding: 1.5rem;
            margin: 1rem 0;
            text-align: center;
            font-family: ''JetBrains Mono'', monospace;
        }

        .pattern-diagram {
            font-size: 0.75rem;
            color: var(--accent-cyan);
            line-height: 1.4;
            white-space: pre;
        }

        /* INFO BOX */
        .info-box {
            background: rgba(0, 240, 255, 0.1);
            border: 1px solid rgba(0, 240, 255, 0.3);
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
            color: var(--accent-cyan);
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

        /* STAT GRID */
        .stat-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        .stat-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
        }

        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-cyan);
            margin-bottom: 0.25rem;
        }

        .stat-label {
            font-size: 0.75rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
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
            background: var(--gradient-cyan);
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

        /* SUMMARY BOX */
        .summary-box {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(0, 240, 255, 0.05) 100%);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            margin: 1.5rem 1rem;
        }

        .summary-box h3 {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--accent-cyan);
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
            color: var(--accent-cyan);
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
                border-left: 4px solid var(--accent-cyan);
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

            .stat-grid {
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
            <div class="lesson-chapter">Chapter 3 - Triangle Patterns</div>
            <h1 class="lesson-title">Ascending Triangle - Tam Giác Tăng</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 3.1</span></div>
                <div class="meta-item"><span>⏱️</span><span>10 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>3 câu quiz</span></div>
            </div>
        </header>

        <!-- CONTENT -->
        <main class="content-section">
            <!-- Section 1: Định nghĩa -->
            <div class="content-card">
                <h2>📐 Ascending Triangle Là Gì?</h2>

                <p><strong>Ascending Triangle</strong> (Tam Giác Tăng) là mô hình tiếp diễn bullish được hình thành khi giá tạo ra đường kháng cự ngang (flat resistance) và đường hỗ trợ nghiêng lên (rising support).</p>

                <div class="pattern-visual">
                    <div class="pattern-diagram">
         ┌─────────────────────── Resistance (Flat)
         │    ╱╲    ╱╲    ╱╲
         │   ╱  ╲  ╱  ╲  ╱  ╲────▶ Breakout!
         │  ╱    ╲╱    ╲╱
         │ ╱
         ╱─────────────────────── Support (Rising)
                    </div>
                </div>

                <div class="stat-grid">
                    <div class="stat-card">
                        <div class="stat-value">70%</div>
                        <div class="stat-label">Win Rate</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">1:2.5</div>
                        <div class="stat-label">Avg R:R</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">75%</div>
                        <div class="stat-label">Breakout Up</div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📐</div>
                    <div class="label">Hình 3.1.1: Cấu Trúc Ascending Triangle</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 2: Cấu trúc -->
            <div class="content-card">
                <h2>🔍 Cấu Trúc Chi Tiết</h2>

                <h3>1. Đường Kháng Cự Ngang (Flat Resistance)</h3>
                <ul>
                    <li>Giá test cùng một mức kháng cự ít nhất 2-3 lần</li>
                    <li>Các đỉnh gần như bằng nhau (±0.5%)</li>
                    <li>Đây là vùng có nhiều lệnh SELL chờ sẵn</li>
                </ul>

                <h3>2. Đường Hỗ Trợ Nghiêng Lên (Rising Support)</h3>
                <ul>
                    <li>Các đáy cao dần (higher lows)</li>
                    <li>Ít nhất 2-3 điểm chạm trendline</li>
                    <li>Cho thấy buyers đang aggressive hơn</li>
                </ul>

                <h3>3. Volume Pattern</h3>
                <ul>
                    <li>Volume giảm dần trong quá trình hình thành</li>
                    <li>Volume spike khi breakout - XÁC NHẬN QUAN TRỌNG!</li>
                </ul>

                <div class="info-box">
                    <div class="info-box-title">💡 Tại Sao Ascending Triangle Bullish?</div>
                    <p>Higher lows cho thấy buyers sẵn sàng mua ở giá cao hơn. Áp lực mua tăng dần trong khi sellers giữ nguyên giá bán → Cuối cùng buyers thắng và breakout lên.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🔍</div>
                    <div class="label">Hình 3.1.2: Volume Giảm Trong Triangle, Spike Khi Breakout</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 3: Cách nhận diện -->
            <div class="content-card">
                <h2>✅ Checklist Nhận Diện Ascending Triangle</h2>

                <div class="step-list">
                    <div class="step-item">
                        <h4>Xác Định Trend Trước Đó</h4>
                        <p>Ascending Triangle thường xuất hiện trong uptrend (continuation pattern)</p>
                    </div>
                    <div class="step-item">
                        <h4>Tìm Flat Resistance</h4>
                        <p>Ít nhất 2 đỉnh ngang nhau, các lần test không phá được resistance</p>
                    </div>
                    <div class="step-item">
                        <h4>Xác Nhận Rising Support</h4>
                        <p>Vẽ trendline nối các đáy - phải có độ dốc lên rõ ràng</p>
                    </div>
                    <div class="step-item">
                        <h4>Kiểm Tra Volume</h4>
                        <p>Volume giảm dần, tạo "squeeze" trước breakout</p>
                    </div>
                    <div class="step-item">
                        <h4>Đợi Breakout</h4>
                        <p>Breakout kèm volume spike = xác nhận mạnh</p>
                    </div>
                </div>
            </div>

            <!-- Section 4: Chiến lược trade -->
            <div class="content-card">
                <h2>🎯 Chiến Lược Trade Ascending Triangle</h2>

                <h3>Entry Strategies:</h3>

                <p><strong>1. Breakout Entry (Conservative):</strong></p>
                <ul>
                    <li>Đợi nến đóng cửa TRÊN resistance</li>
                    <li>Volume breakout > 1.5x trung bình</li>
                    <li>Entry tại candle close hoặc pullback về resistance (now support)</li>
                </ul>

                <p><strong>2. Anticipation Entry (Aggressive):</strong></p>
                <ul>
                    <li>Entry khi giá bounce từ rising support</li>
                    <li>SL dưới trendline</li>
                    <li>Rủi ro cao hơn nhưng R:R tốt hơn</li>
                </ul>

                <h3>Target Calculation:</h3>
                <p><strong>Measured Move:</strong> Đo chiều cao triangle (từ resistance đến đáy đầu tiên), cộng vào điểm breakout.</p>

                <div class="info-box gold">
                    <div class="info-box-title">🎯 Ví Dụ Tính Target</div>
                    <p>Resistance: $50,000 | Đáy đầu tiên: $45,000<br>
                    Chiều cao = $5,000<br>
                    Target = $50,000 + $5,000 = $55,000</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🎯</div>
                    <div class="label">Hình 3.1.3: Entry Points và Target Calculation</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Section 5: Lưu ý -->
            <div class="content-card">
                <h2>⚠️ Lưu Ý Quan Trọng</h2>

                <ul>
                    <li><strong>False Breakout:</strong> ~25% breakouts thất bại. Luôn đợi confirmation (candle close + volume)</li>
                    <li><strong>Time Factor:</strong> Triangle nên hoàn thành trong 3-8 tuần. Quá lâu = mất momentum</li>
                    <li><strong>Breakout Direction:</strong> 75% breakout lên, 25% breakdown. Không phải lúc nào cũng bullish!</li>
                    <li><strong>Retests:</strong> ~60% breakouts có retest. Đây là cơ hội entry thứ hai</li>
                </ul>

                <div class="image-placeholder">
                    <div class="icon">⚠️</div>
                    <div class="label">Hình 3.1.4: False Breakout vs Valid Breakout</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>
        </main>

        <!-- SUMMARY -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Ascending Triangle = Flat resistance + Rising support</li>
                <li>Bullish continuation pattern với 70% win rate</li>
                <li>Volume giảm dần, spike khi breakout</li>
                <li>Target = Chiều cao triangle + Breakout point</li>
                <li>Luôn đợi confirmation trước khi entry</li>
            </ul>
        </div>

        <!-- QUIZ -->
        <div class="quiz-section">
            <div class="quiz-header">
                <h3>🎯 Kiểm Tra Kiến Thức</h3>
                <p>Trả lời các câu hỏi để củng cố bài học</p>
            </div>

            <div class="quiz-question" data-correct="1">
                <div class="question-text">Câu 1: Ascending Triangle có đặc điểm gì?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Đường resistance nghiêng lên + đường support ngang</div>
                    <div class="quiz-option" data-index="1">Đường resistance ngang + đường support nghiêng lên</div>
                    <div class="quiz-option" data-index="2">Cả hai đường đều nghiêng lên</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <div class="question-text">Câu 2: Volume pattern điển hình trong Ascending Triangle là gì?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Volume tăng dần trong triangle</div>
                    <div class="quiz-option" data-index="1">Volume không thay đổi</div>
                    <div class="quiz-option" data-index="2">Volume giảm dần, spike khi breakout</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <div class="question-text">Câu 3: Tỷ lệ Ascending Triangle breakout lên là bao nhiêu?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">~75% breakout lên</div>
                    <div class="quiz-option" data-index="1">~50% breakout lên</div>
                    <div class="quiz-option" data-index="2">~90% breakout lên</div>
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

-- Lesson 3.2: Descending Triangle - Tam Giác Giảm
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch3-l2',
  'module-tier-2-ch3',
  'course-tier2-trading-advanced',
  'Bài 3.2: Descending Triangle - Tam Giác Giảm',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 3.2: Descending Triangle - Tam Giác Giảm | GEM Trading Academy</title>

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
            --gradient-red: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
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
            background: linear-gradient(180deg, rgba(239, 68, 68, 0.15) 0%, transparent 100%);
            border-bottom: 1px solid var(--border-subtle);
            text-align: center;
        }

        .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--gradient-red);
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
            color: var(--error-red);
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

        /* CONTENT */
        .content-section {
            padding: 0;
        }

        .content-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1rem;
            padding: 1.5rem;
            border-left: 4px solid var(--error-red);
        }

        .content-card h2 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--error-red);
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
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
            border: 2px dashed var(--error-red);
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
            color: var(--error-red);
            font-weight: 600;
        }

        .image-placeholder .dimensions {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
        }

        /* PATTERN VISUAL */
        .pattern-visual {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 0.75rem;
            padding: 1.5rem;
            margin: 1rem 0;
            text-align: center;
            font-family: ''JetBrains Mono'', monospace;
        }

        .pattern-diagram {
            font-size: 0.75rem;
            color: var(--error-red);
            line-height: 1.4;
            white-space: pre;
        }

        /* STAT GRID */
        .stat-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        .stat-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
        }

        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--error-red);
            margin-bottom: 0.25rem;
        }

        .stat-label {
            font-size: 0.75rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* INFO BOX */
        .info-box {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
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
            color: var(--error-red);
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

        /* COMPARISON */
        .compare-box {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin: 1rem 0;
        }

        .compare-item {
            background: var(--bg-card);
            border-radius: 0.75rem;
            padding: 1rem;
            border: 1px solid var(--border-subtle);
        }

        .compare-item.asc {
            border-color: var(--success-green);
        }

        .compare-item.desc {
            border-color: var(--error-red);
        }

        .compare-title {
            font-weight: 600;
            font-size: 0.9375rem;
            margin-bottom: 0.5rem;
        }

        .compare-item.asc .compare-title {
            color: var(--success-green);
        }

        .compare-item.desc .compare-title {
            color: var(--error-red);
        }

        .compare-item ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .compare-item li {
            font-size: 0.8125rem;
            color: var(--text-secondary);
            padding: 0.25rem 0;
        }

        /* SUMMARY BOX */
        .summary-box {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            margin: 1.5rem 1rem;
        }

        .summary-box h3 {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--error-red);
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
            color: var(--error-red);
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
                border-left: 4px solid var(--error-red);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-subtle);
            }

            .summary-box,
            .quiz-section {
                margin: 1rem 0;
                border-radius: 0;
            }

            .stat-grid,
            .compare-box {
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
                <span>📉</span>
                <span>Tier 2 - Nâng Cao</span>
            </div>
            <div class="lesson-chapter">Chapter 3 - Triangle Patterns</div>
            <h1 class="lesson-title">Descending Triangle - Tam Giác Giảm</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 3.2</span></div>
                <div class="meta-item"><span>⏱️</span><span>10 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>3 câu quiz</span></div>
            </div>
        </header>

        <!-- CONTENT -->
        <main class="content-section">
            <!-- Section 1: Định nghĩa -->
            <div class="content-card">
                <h2>📐 Descending Triangle Là Gì?</h2>

                <p><strong>Descending Triangle</strong> (Tam Giác Giảm) là mô hình tiếp diễn bearish được hình thành khi giá tạo ra đường hỗ trợ ngang (flat support) và đường kháng cự nghiêng xuống (falling resistance).</p>

                <div class="pattern-visual">
                    <div class="pattern-diagram">
        ╲─────────────────────── Resistance (Falling)
         ╲   ╱╲    ╱╲    ╱╲
          ╲ ╱  ╲  ╱  ╲  ╱  ╲
           ╲    ╲╱    ╲╱    ╲
            ╲                 ╲────▶ Breakdown!
         └─────────────────────── Support (Flat)
                    </div>
                </div>

                <div class="stat-grid">
                    <div class="stat-card">
                        <div class="stat-value">68%</div>
                        <div class="stat-label">Win Rate</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">1:2.5</div>
                        <div class="stat-label">Avg R:R</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">72%</div>
                        <div class="stat-label">Break Down</div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📐</div>
                    <div class="label">Hình 3.2.1: Cấu Trúc Descending Triangle</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 2: Cấu trúc -->
            <div class="content-card">
                <h2>🔍 Cấu Trúc Chi Tiết</h2>

                <h3>1. Đường Hỗ Trợ Ngang (Flat Support)</h3>
                <ul>
                    <li>Giá test cùng một mức support ít nhất 2-3 lần</li>
                    <li>Các đáy gần như bằng nhau (±0.5%)</li>
                    <li>Đây là vùng có nhiều lệnh BUY đang giữ giá</li>
                </ul>

                <h3>2. Đường Kháng Cự Nghiêng Xuống (Falling Resistance)</h3>
                <ul>
                    <li>Các đỉnh thấp dần (lower highs)</li>
                    <li>Ít nhất 2-3 điểm chạm trendline</li>
                    <li>Cho thấy sellers đang aggressive hơn</li>
                </ul>

                <h3>3. Volume Pattern</h3>
                <ul>
                    <li>Volume giảm dần trong quá trình hình thành</li>
                    <li>Volume spike khi breakdown - XÁC NHẬN QUAN TRỌNG!</li>
                </ul>

                <div class="info-box">
                    <div class="info-box-title">💡 Tại Sao Descending Triangle Bearish?</div>
                    <p>Lower highs cho thấy sellers sẵn sàng bán ở giá thấp hơn. Áp lực bán tăng dần trong khi buyers cố giữ support → Cuối cùng sellers thắng và breakdown xuống.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🔍</div>
                    <div class="label">Hình 3.2.2: Lower Highs Tạo Falling Resistance</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 3: So sánh với Ascending -->
            <div class="content-card">
                <h2>⚖️ So Sánh: Ascending vs Descending Triangle</h2>

                <div class="compare-box">
                    <div class="compare-item asc">
                        <div class="compare-title">📈 Ascending Triangle</div>
                        <ul>
                            <li>Resistance: Flat (ngang)</li>
                            <li>Support: Rising (nghiêng lên)</li>
                            <li>Bias: Bullish</li>
                            <li>Signal: LONG</li>
                            <li>75% breakout lên</li>
                        </ul>
                    </div>
                    <div class="compare-item desc">
                        <div class="compare-title">📉 Descending Triangle</div>
                        <ul>
                            <li>Resistance: Falling (nghiêng xuống)</li>
                            <li>Support: Flat (ngang)</li>
                            <li>Bias: Bearish</li>
                            <li>Signal: SHORT</li>
                            <li>72% breakdown xuống</li>
                        </ul>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">⚖️</div>
                    <div class="label">Hình 3.2.3: So Sánh Ascending vs Descending Triangle</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 4: Chiến lược trade -->
            <div class="content-card">
                <h2>🎯 Chiến Lược Trade Descending Triangle</h2>

                <h3>Entry Strategies:</h3>

                <p><strong>1. Breakdown Entry (Conservative):</strong></p>
                <ul>
                    <li>Đợi nến đóng cửa DƯỚI support</li>
                    <li>Volume breakdown > 1.5x trung bình</li>
                    <li>Entry tại candle close hoặc pullback về support (now resistance)</li>
                </ul>

                <p><strong>2. Anticipation Entry (Aggressive):</strong></p>
                <ul>
                    <li>Entry khi giá reject từ falling resistance</li>
                    <li>SL trên trendline</li>
                    <li>Rủi ro cao hơn nhưng R:R tốt hơn</li>
                </ul>

                <h3>Target Calculation:</h3>
                <p><strong>Measured Move:</strong> Đo chiều cao triangle (từ đỉnh đầu tiên đến support), trừ đi từ điểm breakdown.</p>

                <div class="info-box gold">
                    <div class="info-box-title">🎯 Ví Dụ Tính Target</div>
                    <p>Đỉnh đầu tiên: $52,000 | Support: $48,000<br>
                    Chiều cao = $4,000<br>
                    Target = $48,000 - $4,000 = $44,000</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🎯</div>
                    <div class="label">Hình 3.2.4: Entry Points và Target Calculation</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Section 5: Lưu ý -->
            <div class="content-card">
                <h2>⚠️ Lưu Ý Quan Trọng</h2>

                <ul>
                    <li><strong>False Breakdown:</strong> ~28% breakdowns thất bại. Volume confirmation cực kỳ quan trọng</li>
                    <li><strong>Counter-trend Risk:</strong> Descending Triangle trong uptrend có thể breakout lên thay vì breakdown</li>
                    <li><strong>Stop Loss:</strong> Đặt SL trên resistance line hoặc trên swing high gần nhất</li>
                    <li><strong>Retests:</strong> ~55% breakdowns có retest support (now resistance)</li>
                </ul>

                <div class="image-placeholder">
                    <div class="icon">⚠️</div>
                    <div class="label">Hình 3.2.5: False Breakdown và Retest Pattern</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>
        </main>

        <!-- SUMMARY -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Descending Triangle = Falling resistance + Flat support</li>
                <li>Bearish continuation pattern với 68% win rate</li>
                <li>72% xác suất breakdown xuống</li>
                <li>Target = Support - Chiều cao triangle</li>
                <li>Volume spike khi breakdown = xác nhận mạnh</li>
            </ul>
        </div>

        <!-- QUIZ -->
        <div class="quiz-section">
            <div class="quiz-header">
                <h3>🎯 Kiểm Tra Kiến Thức</h3>
                <p>Trả lời các câu hỏi để củng cố bài học</p>
            </div>

            <div class="quiz-question" data-correct="0">
                <div class="question-text">Câu 1: Descending Triangle có đặc điểm gì?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Đường resistance nghiêng xuống + đường support ngang</div>
                    <div class="quiz-option" data-index="1">Đường resistance ngang + đường support nghiêng lên</div>
                    <div class="quiz-option" data-index="2">Cả hai đường đều nghiêng xuống</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <div class="question-text">Câu 2: Lower highs trong Descending Triangle cho thấy điều gì?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Buyers đang mạnh hơn</div>
                    <div class="quiz-option" data-index="1">Thị trường đang sideways</div>
                    <div class="quiz-option" data-index="2">Sellers đang aggressive hơn, sẵn sàng bán ở giá thấp hơn</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <div class="question-text">Câu 3: Cách tính target cho Descending Triangle breakdown?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Support + Chiều cao triangle</div>
                    <div class="quiz-option" data-index="1">Support - Chiều cao triangle</div>
                    <div class="quiz-option" data-index="2">Resistance - Chiều cao triangle</div>
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
    <title>Bài 3.2: Descending Triangle - Tam Giác Giảm | GEM Trading Academy</title>

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
            --gradient-red: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
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
            background: linear-gradient(180deg, rgba(239, 68, 68, 0.15) 0%, transparent 100%);
            border-bottom: 1px solid var(--border-subtle);
            text-align: center;
        }

        .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--gradient-red);
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
            color: var(--error-red);
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

        /* CONTENT */
        .content-section {
            padding: 0;
        }

        .content-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1rem;
            padding: 1.5rem;
            border-left: 4px solid var(--error-red);
        }

        .content-card h2 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--error-red);
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
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
            border: 2px dashed var(--error-red);
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
            color: var(--error-red);
            font-weight: 600;
        }

        .image-placeholder .dimensions {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
        }

        /* PATTERN VISUAL */
        .pattern-visual {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 0.75rem;
            padding: 1.5rem;
            margin: 1rem 0;
            text-align: center;
            font-family: ''JetBrains Mono'', monospace;
        }

        .pattern-diagram {
            font-size: 0.75rem;
            color: var(--error-red);
            line-height: 1.4;
            white-space: pre;
        }

        /* STAT GRID */
        .stat-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        .stat-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
        }

        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--error-red);
            margin-bottom: 0.25rem;
        }

        .stat-label {
            font-size: 0.75rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* INFO BOX */
        .info-box {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
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
            color: var(--error-red);
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

        /* COMPARISON */
        .compare-box {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin: 1rem 0;
        }

        .compare-item {
            background: var(--bg-card);
            border-radius: 0.75rem;
            padding: 1rem;
            border: 1px solid var(--border-subtle);
        }

        .compare-item.asc {
            border-color: var(--success-green);
        }

        .compare-item.desc {
            border-color: var(--error-red);
        }

        .compare-title {
            font-weight: 600;
            font-size: 0.9375rem;
            margin-bottom: 0.5rem;
        }

        .compare-item.asc .compare-title {
            color: var(--success-green);
        }

        .compare-item.desc .compare-title {
            color: var(--error-red);
        }

        .compare-item ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .compare-item li {
            font-size: 0.8125rem;
            color: var(--text-secondary);
            padding: 0.25rem 0;
        }

        /* SUMMARY BOX */
        .summary-box {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            margin: 1.5rem 1rem;
        }

        .summary-box h3 {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--error-red);
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
            color: var(--error-red);
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
                border-left: 4px solid var(--error-red);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-subtle);
            }

            .summary-box,
            .quiz-section {
                margin: 1rem 0;
                border-radius: 0;
            }

            .stat-grid,
            .compare-box {
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
                <span>📉</span>
                <span>Tier 2 - Nâng Cao</span>
            </div>
            <div class="lesson-chapter">Chapter 3 - Triangle Patterns</div>
            <h1 class="lesson-title">Descending Triangle - Tam Giác Giảm</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 3.2</span></div>
                <div class="meta-item"><span>⏱️</span><span>10 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>3 câu quiz</span></div>
            </div>
        </header>

        <!-- CONTENT -->
        <main class="content-section">
            <!-- Section 1: Định nghĩa -->
            <div class="content-card">
                <h2>📐 Descending Triangle Là Gì?</h2>

                <p><strong>Descending Triangle</strong> (Tam Giác Giảm) là mô hình tiếp diễn bearish được hình thành khi giá tạo ra đường hỗ trợ ngang (flat support) và đường kháng cự nghiêng xuống (falling resistance).</p>

                <div class="pattern-visual">
                    <div class="pattern-diagram">
        ╲─────────────────────── Resistance (Falling)
         ╲   ╱╲    ╱╲    ╱╲
          ╲ ╱  ╲  ╱  ╲  ╱  ╲
           ╲    ╲╱    ╲╱    ╲
            ╲                 ╲────▶ Breakdown!
         └─────────────────────── Support (Flat)
                    </div>
                </div>

                <div class="stat-grid">
                    <div class="stat-card">
                        <div class="stat-value">68%</div>
                        <div class="stat-label">Win Rate</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">1:2.5</div>
                        <div class="stat-label">Avg R:R</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">72%</div>
                        <div class="stat-label">Break Down</div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📐</div>
                    <div class="label">Hình 3.2.1: Cấu Trúc Descending Triangle</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 2: Cấu trúc -->
            <div class="content-card">
                <h2>🔍 Cấu Trúc Chi Tiết</h2>

                <h3>1. Đường Hỗ Trợ Ngang (Flat Support)</h3>
                <ul>
                    <li>Giá test cùng một mức support ít nhất 2-3 lần</li>
                    <li>Các đáy gần như bằng nhau (±0.5%)</li>
                    <li>Đây là vùng có nhiều lệnh BUY đang giữ giá</li>
                </ul>

                <h3>2. Đường Kháng Cự Nghiêng Xuống (Falling Resistance)</h3>
                <ul>
                    <li>Các đỉnh thấp dần (lower highs)</li>
                    <li>Ít nhất 2-3 điểm chạm trendline</li>
                    <li>Cho thấy sellers đang aggressive hơn</li>
                </ul>

                <h3>3. Volume Pattern</h3>
                <ul>
                    <li>Volume giảm dần trong quá trình hình thành</li>
                    <li>Volume spike khi breakdown - XÁC NHẬN QUAN TRỌNG!</li>
                </ul>

                <div class="info-box">
                    <div class="info-box-title">💡 Tại Sao Descending Triangle Bearish?</div>
                    <p>Lower highs cho thấy sellers sẵn sàng bán ở giá thấp hơn. Áp lực bán tăng dần trong khi buyers cố giữ support → Cuối cùng sellers thắng và breakdown xuống.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🔍</div>
                    <div class="label">Hình 3.2.2: Lower Highs Tạo Falling Resistance</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 3: So sánh với Ascending -->
            <div class="content-card">
                <h2>⚖️ So Sánh: Ascending vs Descending Triangle</h2>

                <div class="compare-box">
                    <div class="compare-item asc">
                        <div class="compare-title">📈 Ascending Triangle</div>
                        <ul>
                            <li>Resistance: Flat (ngang)</li>
                            <li>Support: Rising (nghiêng lên)</li>
                            <li>Bias: Bullish</li>
                            <li>Signal: LONG</li>
                            <li>75% breakout lên</li>
                        </ul>
                    </div>
                    <div class="compare-item desc">
                        <div class="compare-title">📉 Descending Triangle</div>
                        <ul>
                            <li>Resistance: Falling (nghiêng xuống)</li>
                            <li>Support: Flat (ngang)</li>
                            <li>Bias: Bearish</li>
                            <li>Signal: SHORT</li>
                            <li>72% breakdown xuống</li>
                        </ul>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">⚖️</div>
                    <div class="label">Hình 3.2.3: So Sánh Ascending vs Descending Triangle</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 4: Chiến lược trade -->
            <div class="content-card">
                <h2>🎯 Chiến Lược Trade Descending Triangle</h2>

                <h3>Entry Strategies:</h3>

                <p><strong>1. Breakdown Entry (Conservative):</strong></p>
                <ul>
                    <li>Đợi nến đóng cửa DƯỚI support</li>
                    <li>Volume breakdown > 1.5x trung bình</li>
                    <li>Entry tại candle close hoặc pullback về support (now resistance)</li>
                </ul>

                <p><strong>2. Anticipation Entry (Aggressive):</strong></p>
                <ul>
                    <li>Entry khi giá reject từ falling resistance</li>
                    <li>SL trên trendline</li>
                    <li>Rủi ro cao hơn nhưng R:R tốt hơn</li>
                </ul>

                <h3>Target Calculation:</h3>
                <p><strong>Measured Move:</strong> Đo chiều cao triangle (từ đỉnh đầu tiên đến support), trừ đi từ điểm breakdown.</p>

                <div class="info-box gold">
                    <div class="info-box-title">🎯 Ví Dụ Tính Target</div>
                    <p>Đỉnh đầu tiên: $52,000 | Support: $48,000<br>
                    Chiều cao = $4,000<br>
                    Target = $48,000 - $4,000 = $44,000</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🎯</div>
                    <div class="label">Hình 3.2.4: Entry Points và Target Calculation</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Section 5: Lưu ý -->
            <div class="content-card">
                <h2>⚠️ Lưu Ý Quan Trọng</h2>

                <ul>
                    <li><strong>False Breakdown:</strong> ~28% breakdowns thất bại. Volume confirmation cực kỳ quan trọng</li>
                    <li><strong>Counter-trend Risk:</strong> Descending Triangle trong uptrend có thể breakout lên thay vì breakdown</li>
                    <li><strong>Stop Loss:</strong> Đặt SL trên resistance line hoặc trên swing high gần nhất</li>
                    <li><strong>Retests:</strong> ~55% breakdowns có retest support (now resistance)</li>
                </ul>

                <div class="image-placeholder">
                    <div class="icon">⚠️</div>
                    <div class="label">Hình 3.2.5: False Breakdown và Retest Pattern</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>
        </main>

        <!-- SUMMARY -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Descending Triangle = Falling resistance + Flat support</li>
                <li>Bearish continuation pattern với 68% win rate</li>
                <li>72% xác suất breakdown xuống</li>
                <li>Target = Support - Chiều cao triangle</li>
                <li>Volume spike khi breakdown = xác nhận mạnh</li>
            </ul>
        </div>

        <!-- QUIZ -->
        <div class="quiz-section">
            <div class="quiz-header">
                <h3>🎯 Kiểm Tra Kiến Thức</h3>
                <p>Trả lời các câu hỏi để củng cố bài học</p>
            </div>

            <div class="quiz-question" data-correct="0">
                <div class="question-text">Câu 1: Descending Triangle có đặc điểm gì?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Đường resistance nghiêng xuống + đường support ngang</div>
                    <div class="quiz-option" data-index="1">Đường resistance ngang + đường support nghiêng lên</div>
                    <div class="quiz-option" data-index="2">Cả hai đường đều nghiêng xuống</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <div class="question-text">Câu 2: Lower highs trong Descending Triangle cho thấy điều gì?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Buyers đang mạnh hơn</div>
                    <div class="quiz-option" data-index="1">Thị trường đang sideways</div>
                    <div class="quiz-option" data-index="2">Sellers đang aggressive hơn, sẵn sàng bán ở giá thấp hơn</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <div class="question-text">Câu 3: Cách tính target cho Descending Triangle breakdown?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Support + Chiều cao triangle</div>
                    <div class="quiz-option" data-index="1">Support - Chiều cao triangle</div>
                    <div class="quiz-option" data-index="2">Resistance - Chiều cao triangle</div>
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

-- Lesson 3.3: Symmetrical Triangle - Tam Giác Cân
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch3-l3',
  'module-tier-2-ch3',
  'course-tier2-trading-advanced',
  'Bài 3.3: Symmetrical Triangle - Tam Giác Cân',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 3.3: Symmetrical Triangle - Tam Giác Cân | GEM Trading Academy</title>

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
            --gradient-purple: linear-gradient(135deg, #6A5BFF 0%, #8B7FFF 100%);
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
            background: var(--gradient-purple);
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

        /* CONTENT */
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

        /* PATTERN VISUAL */
        .pattern-visual {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 0.75rem;
            padding: 1.5rem;
            margin: 1rem 0;
            text-align: center;
            font-family: ''JetBrains Mono'', monospace;
        }

        .pattern-diagram {
            font-size: 0.75rem;
            color: var(--accent-purple);
            line-height: 1.4;
            white-space: pre;
        }

        /* STAT GRID */
        .stat-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        .stat-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
        }

        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-purple);
            margin-bottom: 0.25rem;
        }

        .stat-label {
            font-size: 0.75rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* INFO BOX */
        .info-box {
            background: rgba(106, 91, 255, 0.1);
            border: 1px solid rgba(106, 91, 255, 0.3);
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

        /* DECISION FLOW */
        .decision-flow {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        .decision-title {
            font-size: 1rem;
            font-weight: 600;
            color: var(--accent-gold);
            text-align: center;
            margin-bottom: 1rem;
        }

        .decision-step {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem;
            margin-bottom: 0.5rem;
        }

        .decision-icon {
            font-size: 1.5rem;
        }

        .decision-content {
            flex: 1;
        }

        .decision-content h4 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        .decision-content p {
            font-size: 0.8125rem;
            color: var(--text-secondary);
            margin: 0;
        }

        .decision-arrow {
            text-align: center;
            color: var(--accent-purple);
            font-size: 1.25rem;
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

            .stat-grid {
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
                <span>⚡</span>
                <span>Tier 2 - Nâng Cao</span>
            </div>
            <div class="lesson-chapter">Chapter 3 - Triangle Patterns</div>
            <h1 class="lesson-title">Symmetrical Triangle - Tam Giác Cân</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 3.3</span></div>
                <div class="meta-item"><span>⏱️</span><span>10 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <!-- CONTENT -->
        <main class="content-section">
            <!-- Section 1: Định nghĩa -->
            <div class="content-card">
                <h2>📐 Symmetrical Triangle Là Gì?</h2>

                <p><strong>Symmetrical Triangle</strong> (Tam Giác Cân) là mô hình trung lập được hình thành khi cả resistance và support đều hội tụ về một điểm. Đây là pattern "đợi chờ" - hướng breakout phụ thuộc vào xu hướng trước đó.</p>

                <div class="pattern-visual">
                    <div class="pattern-diagram">
        ╲
         ╲    ╱╲    ╱╲    ╱        Converging
          ╲  ╱  ╲  ╱  ╲  ╱          Lines
           ╲╱    ╲╱    ╲╱
           ╱╲    ╱╲    ╱╲           ?
          ╱  ╲  ╱  ╲  ╱  ╲         Break
         ╱    ╲╱    ╲╱    ╲        Which Way?
        ╱
                    </div>
                </div>

                <div class="stat-grid">
                    <div class="stat-card">
                        <div class="stat-value">65%</div>
                        <div class="stat-label">Win Rate</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">1:2</div>
                        <div class="stat-label">Avg R:R</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">60%</div>
                        <div class="stat-label">Theo Trend</div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📐</div>
                    <div class="label">Hình 3.3.1: Cấu Trúc Symmetrical Triangle</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 2: Đặc điểm -->
            <div class="content-card">
                <h2>🔍 Đặc Điểm Nhận Dạng</h2>

                <h3>1. Hai Đường Hội Tụ</h3>
                <ul>
                    <li><strong>Resistance:</strong> Nghiêng xuống (lower highs)</li>
                    <li><strong>Support:</strong> Nghiêng lên (higher lows)</li>
                    <li>Hai đường gặp nhau tại apex (đỉnh tam giác)</li>
                </ul>

                <h3>2. Volume Giảm Dần</h3>
                <ul>
                    <li>Đặc trưng nhất của Symmetrical Triangle</li>
                    <li>Thể hiện sự do dự của thị trường</li>
                    <li>Volume spike khi breakout là xác nhận mạnh</li>
                </ul>

                <h3>3. Điểm Breakout Lý Tưởng</h3>
                <ul>
                    <li>Breakout nên xảy ra trong khoảng 2/3 đến 3/4 chiều dài triangle</li>
                    <li>Breakout quá gần apex có thể yếu hoặc false</li>
                </ul>

                <div class="info-box">
                    <div class="info-box-title">💡 Quy Tắc Quan Trọng</div>
                    <p>Symmetrical Triangle là CONTINUATION pattern - 60% breakout theo hướng trend trước đó. Uptrend trước đó → có xu hướng breakout lên. Downtrend trước đó → có xu hướng breakdown xuống.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🔍</div>
                    <div class="label">Hình 3.3.2: Breakout Zone - 2/3 đến 3/4 Triangle</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 3: Cách xác định hướng breakout -->
            <div class="content-card">
                <h2>🧭 Cách Dự Đoán Hướng Breakout</h2>

                <div class="decision-flow">
                    <div class="decision-title">📊 Decision Framework</div>

                    <div class="decision-step">
                        <div class="decision-icon">1️⃣</div>
                        <div class="decision-content">
                            <h4>Xác Định Trend Trước Đó</h4>
                            <p>Uptrend → Bias bullish (60%) | Downtrend → Bias bearish (60%)</p>
                        </div>
                    </div>

                    <div class="decision-arrow">↓</div>

                    <div class="decision-step">
                        <div class="decision-icon">2️⃣</div>
                        <div class="decision-content">
                            <h4>Quan Sát Volume</h4>
                            <p>Volume tăng khi test resistance → bullish | Volume tăng khi test support → bearish</p>
                        </div>
                    </div>

                    <div class="decision-arrow">↓</div>

                    <div class="decision-step">
                        <div class="decision-icon">3️⃣</div>
                        <div class="decision-content">
                            <h4>Kiểm Tra Higher Timeframe</h4>
                            <p>Trend HTF hỗ trợ hướng nào thì breakout hướng đó xác suất cao hơn</p>
                        </div>
                    </div>

                    <div class="decision-arrow">↓</div>

                    <div class="decision-step">
                        <div class="decision-icon">4️⃣</div>
                        <div class="decision-content">
                            <h4>Đợi Confirmation</h4>
                            <p>KHÔNG đoán hướng - Đợi breakout + volume spike + candle close</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🧭</div>
                    <div class="label">Hình 3.3.3: Symmetrical Triangle Trong Uptrend vs Downtrend</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 4: Chiến lược trade -->
            <div class="content-card">
                <h2>🎯 Chiến Lược Trade</h2>

                <h3>Strategy 1: Wait for Breakout (Recommended)</h3>
                <ul>
                    <li>Đợi nến đóng cửa ngoài triangle</li>
                    <li>Volume confirmation > 1.5x trung bình</li>
                    <li>Entry sau breakout hoặc khi retest</li>
                    <li>SL bên kia triangle</li>
                </ul>

                <h3>Strategy 2: Trade Cả Hai Hướng</h3>
                <ul>
                    <li>Đặt pending orders cả hai phía (Buy Stop + Sell Stop)</li>
                    <li>Khi một lệnh trigger, cancel lệnh còn lại</li>
                    <li>SL = chiều cao triangle × 0.5</li>
                </ul>

                <h3>Target Calculation:</h3>
                <p>Đo chiều cao triangle (đầu rộng nhất), add/subtract từ điểm breakout.</p>

                <div class="info-box gold">
                    <div class="info-box-title">🎯 Ví Dụ Target</div>
                    <p>Chiều cao triangle: $3,000<br>
                    Breakout tại: $45,000<br>
                    Target Up: $45,000 + $3,000 = $48,000<br>
                    Target Down: $45,000 - $3,000 = $42,000</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🎯</div>
                    <div class="label">Hình 3.3.4: Entry, SL, Target cho Symmetrical Triangle</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Section 5: Lưu ý -->
            <div class="content-card">
                <h2>⚠️ Lưu Ý Quan Trọng</h2>

                <ul>
                    <li><strong>False Breakout Risk:</strong> Cao hơn Ascending/Descending Triangle. Luôn đợi confirmation</li>
                    <li><strong>Apex Trap:</strong> Tránh entry khi giá gần apex - breakout thường yếu</li>
                    <li><strong>Time Factor:</strong> Triangle nên complete trong 1-3 tháng. Quá lâu = mất momentum</li>
                    <li><strong>Multiple Tests:</strong> Cần ít nhất 2 touches mỗi đường trendline</li>
                </ul>
            </div>
        </main>

        <!-- SUMMARY -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Symmetrical Triangle = Resistance nghiêng xuống + Support nghiêng lên</li>
                <li>Pattern trung lập - 60% breakout theo trend trước đó</li>
                <li>Volume giảm dần là đặc trưng nhất</li>
                <li>Breakout nên xảy ra trong khoảng 2/3-3/4 chiều dài triangle</li>
                <li>KHÔNG đoán hướng - Đợi confirmation</li>
            </ul>
        </div>

        <!-- QUIZ -->
        <div class="quiz-section">
            <div class="quiz-header">
                <h3>🎯 Kiểm Tra Kiến Thức</h3>
                <p>Trả lời các câu hỏi để củng cố bài học</p>
            </div>

            <div class="quiz-question" data-correct="1">
                <div class="question-text">Câu 1: Symmetrical Triangle thường breakout theo hướng nào?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Luôn luôn breakout lên</div>
                    <div class="quiz-option" data-index="1">60% theo hướng trend trước đó</div>
                    <div class="quiz-option" data-index="2">50/50 ngẫu nhiên</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <div class="question-text">Câu 2: Breakout nên xảy ra ở vị trí nào trong Symmetrical Triangle?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Ngay tại apex (đỉnh tam giác)</div>
                    <div class="quiz-option" data-index="1">Trong 1/3 đầu tiên của triangle</div>
                    <div class="quiz-option" data-index="2">Trong khoảng 2/3 đến 3/4 chiều dài triangle</div>
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
    <title>Bài 3.3: Symmetrical Triangle - Tam Giác Cân | GEM Trading Academy</title>

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
            --gradient-purple: linear-gradient(135deg, #6A5BFF 0%, #8B7FFF 100%);
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
            background: var(--gradient-purple);
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

        /* CONTENT */
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

        /* PATTERN VISUAL */
        .pattern-visual {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 0.75rem;
            padding: 1.5rem;
            margin: 1rem 0;
            text-align: center;
            font-family: ''JetBrains Mono'', monospace;
        }

        .pattern-diagram {
            font-size: 0.75rem;
            color: var(--accent-purple);
            line-height: 1.4;
            white-space: pre;
        }

        /* STAT GRID */
        .stat-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        .stat-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
        }

        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-purple);
            margin-bottom: 0.25rem;
        }

        .stat-label {
            font-size: 0.75rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* INFO BOX */
        .info-box {
            background: rgba(106, 91, 255, 0.1);
            border: 1px solid rgba(106, 91, 255, 0.3);
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

        /* DECISION FLOW */
        .decision-flow {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        .decision-title {
            font-size: 1rem;
            font-weight: 600;
            color: var(--accent-gold);
            text-align: center;
            margin-bottom: 1rem;
        }

        .decision-step {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem;
            margin-bottom: 0.5rem;
        }

        .decision-icon {
            font-size: 1.5rem;
        }

        .decision-content {
            flex: 1;
        }

        .decision-content h4 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        .decision-content p {
            font-size: 0.8125rem;
            color: var(--text-secondary);
            margin: 0;
        }

        .decision-arrow {
            text-align: center;
            color: var(--accent-purple);
            font-size: 1.25rem;
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

            .stat-grid {
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
                <span>⚡</span>
                <span>Tier 2 - Nâng Cao</span>
            </div>
            <div class="lesson-chapter">Chapter 3 - Triangle Patterns</div>
            <h1 class="lesson-title">Symmetrical Triangle - Tam Giác Cân</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 3.3</span></div>
                <div class="meta-item"><span>⏱️</span><span>10 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <!-- CONTENT -->
        <main class="content-section">
            <!-- Section 1: Định nghĩa -->
            <div class="content-card">
                <h2>📐 Symmetrical Triangle Là Gì?</h2>

                <p><strong>Symmetrical Triangle</strong> (Tam Giác Cân) là mô hình trung lập được hình thành khi cả resistance và support đều hội tụ về một điểm. Đây là pattern "đợi chờ" - hướng breakout phụ thuộc vào xu hướng trước đó.</p>

                <div class="pattern-visual">
                    <div class="pattern-diagram">
        ╲
         ╲    ╱╲    ╱╲    ╱        Converging
          ╲  ╱  ╲  ╱  ╲  ╱          Lines
           ╲╱    ╲╱    ╲╱
           ╱╲    ╱╲    ╱╲           ?
          ╱  ╲  ╱  ╲  ╱  ╲         Break
         ╱    ╲╱    ╲╱    ╲        Which Way?
        ╱
                    </div>
                </div>

                <div class="stat-grid">
                    <div class="stat-card">
                        <div class="stat-value">65%</div>
                        <div class="stat-label">Win Rate</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">1:2</div>
                        <div class="stat-label">Avg R:R</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">60%</div>
                        <div class="stat-label">Theo Trend</div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📐</div>
                    <div class="label">Hình 3.3.1: Cấu Trúc Symmetrical Triangle</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 2: Đặc điểm -->
            <div class="content-card">
                <h2>🔍 Đặc Điểm Nhận Dạng</h2>

                <h3>1. Hai Đường Hội Tụ</h3>
                <ul>
                    <li><strong>Resistance:</strong> Nghiêng xuống (lower highs)</li>
                    <li><strong>Support:</strong> Nghiêng lên (higher lows)</li>
                    <li>Hai đường gặp nhau tại apex (đỉnh tam giác)</li>
                </ul>

                <h3>2. Volume Giảm Dần</h3>
                <ul>
                    <li>Đặc trưng nhất của Symmetrical Triangle</li>
                    <li>Thể hiện sự do dự của thị trường</li>
                    <li>Volume spike khi breakout là xác nhận mạnh</li>
                </ul>

                <h3>3. Điểm Breakout Lý Tưởng</h3>
                <ul>
                    <li>Breakout nên xảy ra trong khoảng 2/3 đến 3/4 chiều dài triangle</li>
                    <li>Breakout quá gần apex có thể yếu hoặc false</li>
                </ul>

                <div class="info-box">
                    <div class="info-box-title">💡 Quy Tắc Quan Trọng</div>
                    <p>Symmetrical Triangle là CONTINUATION pattern - 60% breakout theo hướng trend trước đó. Uptrend trước đó → có xu hướng breakout lên. Downtrend trước đó → có xu hướng breakdown xuống.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🔍</div>
                    <div class="label">Hình 3.3.2: Breakout Zone - 2/3 đến 3/4 Triangle</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 3: Cách xác định hướng breakout -->
            <div class="content-card">
                <h2>🧭 Cách Dự Đoán Hướng Breakout</h2>

                <div class="decision-flow">
                    <div class="decision-title">📊 Decision Framework</div>

                    <div class="decision-step">
                        <div class="decision-icon">1️⃣</div>
                        <div class="decision-content">
                            <h4>Xác Định Trend Trước Đó</h4>
                            <p>Uptrend → Bias bullish (60%) | Downtrend → Bias bearish (60%)</p>
                        </div>
                    </div>

                    <div class="decision-arrow">↓</div>

                    <div class="decision-step">
                        <div class="decision-icon">2️⃣</div>
                        <div class="decision-content">
                            <h4>Quan Sát Volume</h4>
                            <p>Volume tăng khi test resistance → bullish | Volume tăng khi test support → bearish</p>
                        </div>
                    </div>

                    <div class="decision-arrow">↓</div>

                    <div class="decision-step">
                        <div class="decision-icon">3️⃣</div>
                        <div class="decision-content">
                            <h4>Kiểm Tra Higher Timeframe</h4>
                            <p>Trend HTF hỗ trợ hướng nào thì breakout hướng đó xác suất cao hơn</p>
                        </div>
                    </div>

                    <div class="decision-arrow">↓</div>

                    <div class="decision-step">
                        <div class="decision-icon">4️⃣</div>
                        <div class="decision-content">
                            <h4>Đợi Confirmation</h4>
                            <p>KHÔNG đoán hướng - Đợi breakout + volume spike + candle close</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🧭</div>
                    <div class="label">Hình 3.3.3: Symmetrical Triangle Trong Uptrend vs Downtrend</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 4: Chiến lược trade -->
            <div class="content-card">
                <h2>🎯 Chiến Lược Trade</h2>

                <h3>Strategy 1: Wait for Breakout (Recommended)</h3>
                <ul>
                    <li>Đợi nến đóng cửa ngoài triangle</li>
                    <li>Volume confirmation > 1.5x trung bình</li>
                    <li>Entry sau breakout hoặc khi retest</li>
                    <li>SL bên kia triangle</li>
                </ul>

                <h3>Strategy 2: Trade Cả Hai Hướng</h3>
                <ul>
                    <li>Đặt pending orders cả hai phía (Buy Stop + Sell Stop)</li>
                    <li>Khi một lệnh trigger, cancel lệnh còn lại</li>
                    <li>SL = chiều cao triangle × 0.5</li>
                </ul>

                <h3>Target Calculation:</h3>
                <p>Đo chiều cao triangle (đầu rộng nhất), add/subtract từ điểm breakout.</p>

                <div class="info-box gold">
                    <div class="info-box-title">🎯 Ví Dụ Target</div>
                    <p>Chiều cao triangle: $3,000<br>
                    Breakout tại: $45,000<br>
                    Target Up: $45,000 + $3,000 = $48,000<br>
                    Target Down: $45,000 - $3,000 = $42,000</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🎯</div>
                    <div class="label">Hình 3.3.4: Entry, SL, Target cho Symmetrical Triangle</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Section 5: Lưu ý -->
            <div class="content-card">
                <h2>⚠️ Lưu Ý Quan Trọng</h2>

                <ul>
                    <li><strong>False Breakout Risk:</strong> Cao hơn Ascending/Descending Triangle. Luôn đợi confirmation</li>
                    <li><strong>Apex Trap:</strong> Tránh entry khi giá gần apex - breakout thường yếu</li>
                    <li><strong>Time Factor:</strong> Triangle nên complete trong 1-3 tháng. Quá lâu = mất momentum</li>
                    <li><strong>Multiple Tests:</strong> Cần ít nhất 2 touches mỗi đường trendline</li>
                </ul>
            </div>
        </main>

        <!-- SUMMARY -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Symmetrical Triangle = Resistance nghiêng xuống + Support nghiêng lên</li>
                <li>Pattern trung lập - 60% breakout theo trend trước đó</li>
                <li>Volume giảm dần là đặc trưng nhất</li>
                <li>Breakout nên xảy ra trong khoảng 2/3-3/4 chiều dài triangle</li>
                <li>KHÔNG đoán hướng - Đợi confirmation</li>
            </ul>
        </div>

        <!-- QUIZ -->
        <div class="quiz-section">
            <div class="quiz-header">
                <h3>🎯 Kiểm Tra Kiến Thức</h3>
                <p>Trả lời các câu hỏi để củng cố bài học</p>
            </div>

            <div class="quiz-question" data-correct="1">
                <div class="question-text">Câu 1: Symmetrical Triangle thường breakout theo hướng nào?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Luôn luôn breakout lên</div>
                    <div class="quiz-option" data-index="1">60% theo hướng trend trước đó</div>
                    <div class="quiz-option" data-index="2">50/50 ngẫu nhiên</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <div class="question-text">Câu 2: Breakout nên xảy ra ở vị trí nào trong Symmetrical Triangle?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Ngay tại apex (đỉnh tam giác)</div>
                    <div class="quiz-option" data-index="1">Trong 1/3 đầu tiên của triangle</div>
                    <div class="quiz-option" data-index="2">Trong khoảng 2/3 đến 3/4 chiều dài triangle</div>
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

-- Lesson 3.4: Kết Hợp Triangles Với GEM Zones
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch3-l4',
  'module-tier-2-ch3',
  'course-tier2-trading-advanced',
  'Bài 3.4: Kết Hợp Triangles Với GEM Zones',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 3.4: Kết Hợp Triangles Với GEM Zones | GEM Trading Academy</title>

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
            background: linear-gradient(180deg, rgba(255, 189, 89, 0.15) 0%, transparent 100%);
            border-bottom: 1px solid var(--border-subtle);
            text-align: center;
        }

        .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--gradient-gold);
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
            color: var(--accent-gold);
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

        /* CONTENT */
        .content-section {
            padding: 0;
        }

        .content-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1rem;
            padding: 1.5rem;
            border-left: 4px solid var(--accent-gold);
        }

        .content-card h2 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--accent-gold);
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
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.1) 100%);
            border: 2px dashed var(--accent-gold);
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
            color: var(--accent-gold);
            font-weight: 600;
        }

        .image-placeholder .dimensions {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
        }

        /* COMBO CARD */
        .combo-card {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        .combo-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
        }

        .combo-icon {
            font-size: 2rem;
        }

        .combo-title {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .combo-subtitle {
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        .combo-winrate {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            background: rgba(16, 185, 129, 0.2);
            padding: 0.375rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--success-green);
            margin-top: 0.75rem;
        }

        /* INFO BOX */
        .info-box {
            background: rgba(255, 189, 89, 0.1);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .info-box.cyan {
            background: rgba(0, 240, 255, 0.1);
            border-color: rgba(0, 240, 255, 0.3);
        }

        .info-box.cyan .info-box-title {
            color: var(--accent-cyan);
        }

        .info-box-title {
            font-weight: 600;
            color: var(--accent-gold);
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

        /* STEP CARDS */
        .step-cards {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .step-card {
            display: flex;
            gap: 1rem;
            padding: 1rem;
            background: var(--bg-card);
            border-radius: 0.75rem;
            border: 1px solid var(--border-subtle);
        }

        .step-number {
            width: 2.5rem;
            height: 2.5rem;
            background: var(--gradient-gold);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1rem;
            color: #000;
            flex-shrink: 0;
        }

        .step-content h4 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .step-content p {
            font-size: 0.8125rem;
            color: var(--text-secondary);
            margin: 0;
        }

        /* SUMMARY BOX */
        .summary-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            margin: 1.5rem 1rem;
        }

        .summary-box h3 {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--accent-gold);
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
            color: var(--accent-gold);
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
                border-left: 4px solid var(--accent-gold);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-subtle);
            }

            .summary-box,
            .quiz-section {
                margin: 1rem 0;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <!-- HEADER -->
        <header class="lesson-header">
            <div class="header-badge">
                <span>🔥</span>
                <span>Tier 2 - Nâng Cao</span>
            </div>
            <div class="lesson-chapter">Chapter 3 - Triangle Patterns</div>
            <h1 class="lesson-title">Kết Hợp Triangles Với GEM Zones</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 3.4</span></div>
                <div class="meta-item"><span>⏱️</span><span>12 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <!-- CONTENT -->
        <main class="content-section">
            <!-- Section 1: Tại sao kết hợp -->
            <div class="content-card">
                <h2>🔥 Sức Mạnh Kết Hợp: Triangles + GEM Zones</h2>

                <p>Khi triangle patterns kết hợp với HFZ/LFZ, bạn có <strong>"High Probability Setup"</strong> với win rate vượt trội. Đây là kỹ thuật nâng cao độc quyền của GEM Frequency Method.</p>

                <div class="info-box">
                    <div class="info-box-title">💡 Logic Đằng Sau</div>
                    <p>Triangle cho bạn <strong>structure</strong> và <strong>target</strong>. GEM Zone cho bạn <strong>entry point chính xác</strong> và <strong>confirmation</strong>. Kết hợp = Trade với confidence cao nhất.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🔥</div>
                    <div class="label">Hình 3.4.1: Ascending Triangle + LFZ Entry</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 2: Combo 1 - Ascending Triangle + LFZ -->
            <div class="content-card">
                <h2>📈 Combo #1: Ascending Triangle + LFZ</h2>

                <div class="combo-card">
                    <div class="combo-header">
                        <div class="combo-icon">📈🟢</div>
                        <div>
                            <div class="combo-title">Ascending Triangle + LFZ</div>
                            <div class="combo-subtitle">High Probability Long Setup</div>
                        </div>
                    </div>

                    <p><strong>Cách hoạt động:</strong></p>
                    <ul>
                        <li>Trong Ascending Triangle, rising support tạo ra các LFZ</li>
                        <li>Mỗi lần giá bounce từ support = Có thể là LFZ entry</li>
                        <li>Entry tại LFZ + Triangle support = Double confirmation</li>
                    </ul>

                    <div class="combo-winrate">⭐ Win Rate: 78%</div>
                </div>

                <div class="step-cards">
                    <div class="step-card">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h4>Xác Định Ascending Triangle</h4>
                            <p>Flat resistance + Rising support, ít nhất 2 touches mỗi đường</p>
                        </div>
                    </div>
                    <div class="step-card">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h4>Tìm LFZ Bên Trong Triangle</h4>
                            <p>Các vùng Pause từ mini UPU patterns trên rising support</p>
                        </div>
                    </div>
                    <div class="step-card">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h4>Entry Tại LFZ + Support</h4>
                            <p>Đợi giá pullback về LFZ, xác nhận bằng bullish candle</p>
                        </div>
                    </div>
                    <div class="step-card">
                        <div class="step-number">4</div>
                        <div class="step-content">
                            <h4>SL và TP</h4>
                            <p>SL dưới support line | TP1: Resistance | TP2: Measured move breakout</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📈</div>
                    <div class="label">Hình 3.4.2: Entry Points Tại LFZ Trong Ascending Triangle</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Section 3: Combo 2 - Descending Triangle + HFZ -->
            <div class="content-card">
                <h2>📉 Combo #2: Descending Triangle + HFZ</h2>

                <div class="combo-card">
                    <div class="combo-header">
                        <div class="combo-icon">📉🔴</div>
                        <div>
                            <div class="combo-title">Descending Triangle + HFZ</div>
                            <div class="combo-subtitle">High Probability Short Setup</div>
                        </div>
                    </div>

                    <p><strong>Cách hoạt động:</strong></p>
                    <ul>
                        <li>Trong Descending Triangle, falling resistance tạo ra các HFZ</li>
                        <li>Mỗi lần giá reject từ resistance = Có thể là HFZ entry</li>
                        <li>Entry tại HFZ + Triangle resistance = Double confirmation</li>
                    </ul>

                    <div class="combo-winrate">⭐ Win Rate: 76%</div>
                </div>

                <p><strong>Entry Strategy:</strong></p>
                <ol>
                    <li>Xác định Descending Triangle (Falling resistance + Flat support)</li>
                    <li>Tìm mini DPD/UPD patterns tạo HFZ trên falling resistance</li>
                    <li>Entry SHORT khi giá rally vào HFZ + confirmation candle</li>
                    <li>SL trên resistance line | TP: Flat support hoặc breakdown target</li>
                </ol>

                <div class="image-placeholder">
                    <div class="icon">📉</div>
                    <div class="label">Hình 3.4.3: HFZ Entry Trong Descending Triangle</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Section 4: Breakout + Zone -->
            <div class="content-card">
                <h2>🚀 Breakout Trading Với GEM Zones</h2>

                <p>Không chỉ trade bên trong triangle, bạn còn có thể dùng GEM Zones để trade breakout hiệu quả hơn:</p>

                <h3>Kỹ Thuật: Zone Retest Entry</h3>
                <ul>
                    <li><strong>Step 1:</strong> Đợi breakout xảy ra với volume spike</li>
                    <li><strong>Step 2:</strong> Đánh dấu breakout level như một zone mới</li>
                    <li><strong>Step 3:</strong> Đợi giá retest zone này</li>
                    <li><strong>Step 4:</strong> Entry tại retest với confirmation candle</li>
                </ul>

                <div class="info-box cyan">
                    <div class="info-box-title">🎯 Ví Dụ Cụ Thể</div>
                    <p>Ascending Triangle breakout tại $50,000. Giá rally lên $52,000 rồi pullback về $50,000. Đây bây giờ là LFZ (resistance trở thành support). Entry LONG tại $50,100 với Hammer candle, SL $49,500, TP $54,000.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🚀</div>
                    <div class="label">Hình 3.4.4: Breakout + Retest Zone Entry</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Section 5: Confluence Scoring -->
            <div class="content-card">
                <h2>📊 Confluence Score Cho Triangle + Zone</h2>

                <p>Đánh giá chất lượng setup bằng confluence scoring:</p>

                <ul>
                    <li><strong>+1 điểm:</strong> Triangle pattern rõ ràng (≥3 touches mỗi đường)</li>
                    <li><strong>+1 điểm:</strong> GEM Zone (HFZ/LFZ) trùng với triangle boundary</li>
                    <li><strong>+1 điểm:</strong> Volume pattern đúng (giảm dần trong triangle)</li>
                    <li><strong>+1 điểm:</strong> Higher timeframe support/resistance</li>
                    <li><strong>+1 điểm:</strong> RSI divergence hỗ trợ</li>
                    <li><strong>+1 điểm:</strong> EMA/SMA confluence</li>
                </ul>

                <div class="info-box">
                    <div class="info-box-title">🎯 Quy Tắc Entry</div>
                    <p><strong>Score 3-4:</strong> Good setup - Trade với position size bình thường<br>
                    <strong>Score 5-6:</strong> Excellent setup - Có thể tăng position size 1.5x</p>
                </div>
            </div>
        </main>

        <!-- SUMMARY -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Ascending Triangle + LFZ = High probability long setup (78% win rate)</li>
                <li>Descending Triangle + HFZ = High probability short setup (76% win rate)</li>
                <li>Breakout retest là cơ hội entry tuyệt vời với zone mới</li>
                <li>Dùng confluence scoring để đánh giá chất lượng setup</li>
                <li>Kết hợp triangle + zone = Double confirmation</li>
            </ul>
        </div>

        <!-- QUIZ -->
        <div class="quiz-section">
            <div class="quiz-header">
                <h3>🎯 Kiểm Tra Kiến Thức</h3>
                <p>Trả lời các câu hỏi để củng cố bài học</p>
            </div>

            <div class="quiz-question" data-correct="0">
                <div class="question-text">Câu 1: Trong Ascending Triangle, zone nào thường được tạo ra tại rising support?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">LFZ (Low Frequency Zone) - Vùng mua</div>
                    <div class="quiz-option" data-index="1">HFZ (High Frequency Zone) - Vùng bán</div>
                    <div class="quiz-option" data-index="2">Không có zone nào được tạo ra</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <div class="question-text">Câu 2: Sau khi Ascending Triangle breakout lên, vùng breakout level trở thành gì?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">HFZ - Vùng bán</div>
                    <div class="quiz-option" data-index="1">Không thay đổi gì</div>
                    <div class="quiz-option" data-index="2">LFZ - Vùng mua (resistance thành support)</div>
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
    <title>Bài 3.4: Kết Hợp Triangles Với GEM Zones | GEM Trading Academy</title>

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
            background: linear-gradient(180deg, rgba(255, 189, 89, 0.15) 0%, transparent 100%);
            border-bottom: 1px solid var(--border-subtle);
            text-align: center;
        }

        .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--gradient-gold);
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
            color: var(--accent-gold);
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

        /* CONTENT */
        .content-section {
            padding: 0;
        }

        .content-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1rem;
            padding: 1.5rem;
            border-left: 4px solid var(--accent-gold);
        }

        .content-card h2 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--accent-gold);
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
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.1) 100%);
            border: 2px dashed var(--accent-gold);
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
            color: var(--accent-gold);
            font-weight: 600;
        }

        .image-placeholder .dimensions {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
        }

        /* COMBO CARD */
        .combo-card {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        .combo-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
        }

        .combo-icon {
            font-size: 2rem;
        }

        .combo-title {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .combo-subtitle {
            font-size: 0.8125rem;
            color: var(--text-secondary);
        }

        .combo-winrate {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            background: rgba(16, 185, 129, 0.2);
            padding: 0.375rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--success-green);
            margin-top: 0.75rem;
        }

        /* INFO BOX */
        .info-box {
            background: rgba(255, 189, 89, 0.1);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .info-box.cyan {
            background: rgba(0, 240, 255, 0.1);
            border-color: rgba(0, 240, 255, 0.3);
        }

        .info-box.cyan .info-box-title {
            color: var(--accent-cyan);
        }

        .info-box-title {
            font-weight: 600;
            color: var(--accent-gold);
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

        /* STEP CARDS */
        .step-cards {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .step-card {
            display: flex;
            gap: 1rem;
            padding: 1rem;
            background: var(--bg-card);
            border-radius: 0.75rem;
            border: 1px solid var(--border-subtle);
        }

        .step-number {
            width: 2.5rem;
            height: 2.5rem;
            background: var(--gradient-gold);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1rem;
            color: #000;
            flex-shrink: 0;
        }

        .step-content h4 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .step-content p {
            font-size: 0.8125rem;
            color: var(--text-secondary);
            margin: 0;
        }

        /* SUMMARY BOX */
        .summary-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            margin: 1.5rem 1rem;
        }

        .summary-box h3 {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--accent-gold);
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
            color: var(--accent-gold);
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
                border-left: 4px solid var(--accent-gold);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-subtle);
            }

            .summary-box,
            .quiz-section {
                margin: 1rem 0;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <!-- HEADER -->
        <header class="lesson-header">
            <div class="header-badge">
                <span>🔥</span>
                <span>Tier 2 - Nâng Cao</span>
            </div>
            <div class="lesson-chapter">Chapter 3 - Triangle Patterns</div>
            <h1 class="lesson-title">Kết Hợp Triangles Với GEM Zones</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 3.4</span></div>
                <div class="meta-item"><span>⏱️</span><span>12 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <!-- CONTENT -->
        <main class="content-section">
            <!-- Section 1: Tại sao kết hợp -->
            <div class="content-card">
                <h2>🔥 Sức Mạnh Kết Hợp: Triangles + GEM Zones</h2>

                <p>Khi triangle patterns kết hợp với HFZ/LFZ, bạn có <strong>"High Probability Setup"</strong> với win rate vượt trội. Đây là kỹ thuật nâng cao độc quyền của GEM Frequency Method.</p>

                <div class="info-box">
                    <div class="info-box-title">💡 Logic Đằng Sau</div>
                    <p>Triangle cho bạn <strong>structure</strong> và <strong>target</strong>. GEM Zone cho bạn <strong>entry point chính xác</strong> và <strong>confirmation</strong>. Kết hợp = Trade với confidence cao nhất.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🔥</div>
                    <div class="label">Hình 3.4.1: Ascending Triangle + LFZ Entry</div>
                    <div class="dimensions">1200 x 600px</div>
                </div>
            </div>

            <!-- Section 2: Combo 1 - Ascending Triangle + LFZ -->
            <div class="content-card">
                <h2>📈 Combo #1: Ascending Triangle + LFZ</h2>

                <div class="combo-card">
                    <div class="combo-header">
                        <div class="combo-icon">📈🟢</div>
                        <div>
                            <div class="combo-title">Ascending Triangle + LFZ</div>
                            <div class="combo-subtitle">High Probability Long Setup</div>
                        </div>
                    </div>

                    <p><strong>Cách hoạt động:</strong></p>
                    <ul>
                        <li>Trong Ascending Triangle, rising support tạo ra các LFZ</li>
                        <li>Mỗi lần giá bounce từ support = Có thể là LFZ entry</li>
                        <li>Entry tại LFZ + Triangle support = Double confirmation</li>
                    </ul>

                    <div class="combo-winrate">⭐ Win Rate: 78%</div>
                </div>

                <div class="step-cards">
                    <div class="step-card">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h4>Xác Định Ascending Triangle</h4>
                            <p>Flat resistance + Rising support, ít nhất 2 touches mỗi đường</p>
                        </div>
                    </div>
                    <div class="step-card">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h4>Tìm LFZ Bên Trong Triangle</h4>
                            <p>Các vùng Pause từ mini UPU patterns trên rising support</p>
                        </div>
                    </div>
                    <div class="step-card">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h4>Entry Tại LFZ + Support</h4>
                            <p>Đợi giá pullback về LFZ, xác nhận bằng bullish candle</p>
                        </div>
                    </div>
                    <div class="step-card">
                        <div class="step-number">4</div>
                        <div class="step-content">
                            <h4>SL và TP</h4>
                            <p>SL dưới support line | TP1: Resistance | TP2: Measured move breakout</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📈</div>
                    <div class="label">Hình 3.4.2: Entry Points Tại LFZ Trong Ascending Triangle</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Section 3: Combo 2 - Descending Triangle + HFZ -->
            <div class="content-card">
                <h2>📉 Combo #2: Descending Triangle + HFZ</h2>

                <div class="combo-card">
                    <div class="combo-header">
                        <div class="combo-icon">📉🔴</div>
                        <div>
                            <div class="combo-title">Descending Triangle + HFZ</div>
                            <div class="combo-subtitle">High Probability Short Setup</div>
                        </div>
                    </div>

                    <p><strong>Cách hoạt động:</strong></p>
                    <ul>
                        <li>Trong Descending Triangle, falling resistance tạo ra các HFZ</li>
                        <li>Mỗi lần giá reject từ resistance = Có thể là HFZ entry</li>
                        <li>Entry tại HFZ + Triangle resistance = Double confirmation</li>
                    </ul>

                    <div class="combo-winrate">⭐ Win Rate: 76%</div>
                </div>

                <p><strong>Entry Strategy:</strong></p>
                <ol>
                    <li>Xác định Descending Triangle (Falling resistance + Flat support)</li>
                    <li>Tìm mini DPD/UPD patterns tạo HFZ trên falling resistance</li>
                    <li>Entry SHORT khi giá rally vào HFZ + confirmation candle</li>
                    <li>SL trên resistance line | TP: Flat support hoặc breakdown target</li>
                </ol>

                <div class="image-placeholder">
                    <div class="icon">📉</div>
                    <div class="label">Hình 3.4.3: HFZ Entry Trong Descending Triangle</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Section 4: Breakout + Zone -->
            <div class="content-card">
                <h2>🚀 Breakout Trading Với GEM Zones</h2>

                <p>Không chỉ trade bên trong triangle, bạn còn có thể dùng GEM Zones để trade breakout hiệu quả hơn:</p>

                <h3>Kỹ Thuật: Zone Retest Entry</h3>
                <ul>
                    <li><strong>Step 1:</strong> Đợi breakout xảy ra với volume spike</li>
                    <li><strong>Step 2:</strong> Đánh dấu breakout level như một zone mới</li>
                    <li><strong>Step 3:</strong> Đợi giá retest zone này</li>
                    <li><strong>Step 4:</strong> Entry tại retest với confirmation candle</li>
                </ul>

                <div class="info-box cyan">
                    <div class="info-box-title">🎯 Ví Dụ Cụ Thể</div>
                    <p>Ascending Triangle breakout tại $50,000. Giá rally lên $52,000 rồi pullback về $50,000. Đây bây giờ là LFZ (resistance trở thành support). Entry LONG tại $50,100 với Hammer candle, SL $49,500, TP $54,000.</p>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🚀</div>
                    <div class="label">Hình 3.4.4: Breakout + Retest Zone Entry</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Section 5: Confluence Scoring -->
            <div class="content-card">
                <h2>📊 Confluence Score Cho Triangle + Zone</h2>

                <p>Đánh giá chất lượng setup bằng confluence scoring:</p>

                <ul>
                    <li><strong>+1 điểm:</strong> Triangle pattern rõ ràng (≥3 touches mỗi đường)</li>
                    <li><strong>+1 điểm:</strong> GEM Zone (HFZ/LFZ) trùng với triangle boundary</li>
                    <li><strong>+1 điểm:</strong> Volume pattern đúng (giảm dần trong triangle)</li>
                    <li><strong>+1 điểm:</strong> Higher timeframe support/resistance</li>
                    <li><strong>+1 điểm:</strong> RSI divergence hỗ trợ</li>
                    <li><strong>+1 điểm:</strong> EMA/SMA confluence</li>
                </ul>

                <div class="info-box">
                    <div class="info-box-title">🎯 Quy Tắc Entry</div>
                    <p><strong>Score 3-4:</strong> Good setup - Trade với position size bình thường<br>
                    <strong>Score 5-6:</strong> Excellent setup - Có thể tăng position size 1.5x</p>
                </div>
            </div>
        </main>

        <!-- SUMMARY -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Ascending Triangle + LFZ = High probability long setup (78% win rate)</li>
                <li>Descending Triangle + HFZ = High probability short setup (76% win rate)</li>
                <li>Breakout retest là cơ hội entry tuyệt vời với zone mới</li>
                <li>Dùng confluence scoring để đánh giá chất lượng setup</li>
                <li>Kết hợp triangle + zone = Double confirmation</li>
            </ul>
        </div>

        <!-- QUIZ -->
        <div class="quiz-section">
            <div class="quiz-header">
                <h3>🎯 Kiểm Tra Kiến Thức</h3>
                <p>Trả lời các câu hỏi để củng cố bài học</p>
            </div>

            <div class="quiz-question" data-correct="0">
                <div class="question-text">Câu 1: Trong Ascending Triangle, zone nào thường được tạo ra tại rising support?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">LFZ (Low Frequency Zone) - Vùng mua</div>
                    <div class="quiz-option" data-index="1">HFZ (High Frequency Zone) - Vùng bán</div>
                    <div class="quiz-option" data-index="2">Không có zone nào được tạo ra</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <div class="question-text">Câu 2: Sau khi Ascending Triangle breakout lên, vùng breakout level trở thành gì?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">HFZ - Vùng bán</div>
                    <div class="quiz-option" data-index="1">Không thay đổi gì</div>
                    <div class="quiz-option" data-index="2">LFZ - Vùng mua (resistance thành support)</div>
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

-- Lesson 3.5: Ví Dụ Thực Tế Triangle Patterns
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch3-l5',
  'module-tier-2-ch3',
  'course-tier2-trading-advanced',
  'Bài 3.5: Ví Dụ Thực Tế Triangle Patterns',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 3.5: Ví Dụ Thực Tế Triangle Patterns | GEM Trading Academy</title>

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
            background: linear-gradient(180deg, rgba(0, 240, 255, 0.15) 0%, transparent 100%);
            border-bottom: 1px solid var(--border-subtle);
            text-align: center;
        }

        .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: linear-gradient(135deg, #00F0FF 0%, #00C4CC 100%);
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
            color: var(--accent-cyan);
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

        /* CONTENT */
        .content-section {
            padding: 0;
        }

        .content-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1rem;
            padding: 1.5rem;
            border-left: 4px solid var(--accent-cyan);
        }

        .content-card h2 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--accent-cyan);
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
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(0, 240, 255, 0.1) 100%);
            border: 2px dashed var(--accent-cyan);
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
            color: var(--accent-cyan);
            font-weight: 600;
        }

        .image-placeholder .dimensions {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
        }

        /* CASE CARD */
        .case-card {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 1rem;
            overflow: hidden;
            margin: 1rem 0;
        }

        .case-header {
            padding: 1rem 1.25rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .case-header.asc {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 100%);
        }

        .case-header.desc {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.1) 100%);
        }

        .case-header.sym {
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.3) 0%, rgba(106, 91, 255, 0.1) 100%);
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
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(0, 240, 255, 0.05) 100%);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            margin: 1.5rem 1rem;
        }

        .summary-box h3 {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--accent-cyan);
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
            color: var(--accent-cyan);
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
                border-left: 4px solid var(--accent-cyan);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-subtle);
            }

            .summary-box,
            .quiz-section {
                margin: 1rem 0;
                border-radius: 0;
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
                <span>📊</span>
                <span>Tier 2 - Nâng Cao</span>
            </div>
            <div class="lesson-chapter">Chapter 3 - Triangle Patterns</div>
            <h1 class="lesson-title">Ví Dụ Thực Tế Triangle Patterns</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 3.5</span></div>
                <div class="meta-item"><span>⏱️</span><span>15 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <!-- CONTENT -->
        <main class="content-section">
            <!-- Intro -->
            <div class="content-card">
                <h2>📈 Học Từ Case Studies Thực Tế</h2>
                <p>Phân tích 4 case studies thực tế về Triangle Patterns - bao gồm cả WIN và LOSS trades. Hiểu rõ điều gì làm setup thành công và thất bại.</p>
            </div>

            <!-- Case Study 1: Ascending Triangle WIN -->
            <div class="content-card">
                <h2>📈 Case #1: BTC/USDT - Ascending Triangle Breakout</h2>

                <div class="case-card">
                    <div class="case-header asc">
                        <div class="case-title">BTC/USDT 4H - Ascending Triangle</div>
                        <div class="case-badge win">✓ WIN +22%</div>
                    </div>
                    <div class="case-body">
                        <div class="case-stats">
                            <div class="stat-item">
                                <div class="stat-label">Entry</div>
                                <div class="stat-value">$43,200</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Stop</div>
                                <div class="stat-value">$41,800</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Target</div>
                                <div class="stat-value">$48,500</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">R:R</div>
                                <div class="stat-value green">1:3.8</div>
                            </div>
                        </div>

                        <div class="case-analysis">
                            <h4>Phân Tích Setup:</h4>
                            <ol>
                                <li><strong>Pattern:</strong> Ascending Triangle hình thành trong 18 ngày</li>
                                <li><strong>Resistance:</strong> $43,000 - test 3 lần không phá</li>
                                <li><strong>Support:</strong> Rising trendline với 4 điểm chạm</li>
                                <li><strong>Volume:</strong> Giảm dần 40%, spike 3x khi breakout</li>
                                <li><strong>Entry:</strong> Sau breakout + retest $43,000 (confirmation candle)</li>
                                <li><strong>Kết quả:</strong> Rally 22% trong 8 ngày</li>
                            </ol>
                        </div>

                        <div class="lesson-box">
                            <div class="lesson-box-title">💡 Key Takeaway</div>
                            <p>Breakout + Retest entry an toàn hơn breakout entry trực tiếp. Volume spike 3x xác nhận breakout mạnh.</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📈</div>
                    <div class="label">Hình 3.5.1: BTC Ascending Triangle Breakout</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Case Study 2: Descending Triangle WIN -->
            <div class="content-card">
                <h2>📉 Case #2: ETH/USDT - Descending Triangle Breakdown</h2>

                <div class="case-card">
                    <div class="case-header desc">
                        <div class="case-title">ETH/USDT Daily - Descending Triangle</div>
                        <div class="case-badge win">✓ WIN +18%</div>
                    </div>
                    <div class="case-body">
                        <div class="case-stats">
                            <div class="stat-item">
                                <div class="stat-label">Entry</div>
                                <div class="stat-value">$2,080</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Stop</div>
                                <div class="stat-value">$2,250</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Target</div>
                                <div class="stat-value">$1,750</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">R:R</div>
                                <div class="stat-value green">1:2</div>
                            </div>
                        </div>

                        <div class="case-analysis">
                            <h4>Phân Tích Setup:</h4>
                            <ol>
                                <li><strong>Context:</strong> Downtrend trước đó, Descending Triangle = continuation</li>
                                <li><strong>Support:</strong> $2,100 - flat line, test 4 lần</li>
                                <li><strong>Resistance:</strong> Lower highs tạo falling trendline</li>
                                <li><strong>Confluence:</strong> HFZ từ UPD pattern trùng với falling resistance</li>
                                <li><strong>Entry:</strong> Sau nến đóng dưới $2,100 với volume cao</li>
                                <li><strong>Kết quả:</strong> Drop về $1,780, close partial tại TP</li>
                            </ol>
                        </div>

                        <div class="lesson-box">
                            <div class="lesson-box-title">💡 Key Takeaway</div>
                            <p>Descending Triangle trong downtrend = High probability short. HFZ confluence tăng confidence cho entry.</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📉</div>
                    <div class="label">Hình 3.5.2: ETH Descending Triangle Breakdown + HFZ</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Case Study 3: Symmetrical Triangle LOSS -->
            <div class="content-card">
                <h2>⚠️ Case #3: SOL/USDT - False Breakout</h2>

                <div class="case-card">
                    <div class="case-header sym">
                        <div class="case-title">SOL/USDT 4H - Symmetrical Triangle</div>
                        <div class="case-badge loss">✗ LOSS -2.5%</div>
                    </div>
                    <div class="case-body">
                        <div class="case-stats">
                            <div class="stat-item">
                                <div class="stat-label">Entry</div>
                                <div class="stat-value">$98.50</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Stop</div>
                                <div class="stat-value">$96.00</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Target</div>
                                <div class="stat-value">$108.00</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Result</div>
                                <div class="stat-value red">SL Hit</div>
                            </div>
                        </div>

                        <div class="case-analysis">
                            <h4>Phân Tích Sai Lầm:</h4>
                            <ol>
                                <li><strong>Sai lầm 1:</strong> Entry ngay khi breakout, không đợi candle close</li>
                                <li><strong>Sai lầm 2:</strong> Volume breakout chỉ 1.2x (yếu, cần ≥1.5x)</li>
                                <li><strong>Sai lầm 3:</strong> Breakout quá gần apex (trong 10% cuối triangle)</li>
                                <li><strong>Sai lầm 4:</strong> BTC đang trong downtrend, SOL không nên long</li>
                                <li><strong>Kết quả:</strong> False breakout, giá reverse và hit SL</li>
                            </ol>
                        </div>

                        <div class="lesson-box">
                            <div class="lesson-box-title">⚠️ Bài Học Từ Loss</div>
                            <p>Symmetrical Triangle có false breakout risk cao. Luôn đợi candle close + volume confirmation. Tránh entry gần apex và check market context.</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">⚠️</div>
                    <div class="label">Hình 3.5.3: SOL False Breakout - What Went Wrong</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Case Study 4: Triangle + LFZ WIN -->
            <div class="content-card">
                <h2>🔥 Case #4: AVAX/USDT - Ascending Triangle + LFZ Combo</h2>

                <div class="case-card">
                    <div class="case-header asc">
                        <div class="case-title">AVAX/USDT 4H - Triangle + LFZ</div>
                        <div class="case-badge win">✓ WIN +28%</div>
                    </div>
                    <div class="case-body">
                        <div class="case-stats">
                            <div class="stat-item">
                                <div class="stat-label">Entry</div>
                                <div class="stat-value">$32.50</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Stop</div>
                                <div class="stat-value">$30.80</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Target</div>
                                <div class="stat-value">$40.00</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">R:R</div>
                                <div class="stat-value green">1:4.4</div>
                            </div>
                        </div>

                        <div class="case-analysis">
                            <h4>Phân Tích Setup:</h4>
                            <ol>
                                <li><strong>Pattern:</strong> Ascending Triangle trong uptrend</li>
                                <li><strong>LFZ:</strong> Vùng $31.80-$32.80 từ mini UPU trên support line</li>
                                <li><strong>Entry:</strong> Tại LFZ + rising support + Hammer candle</li>
                                <li><strong>Confluence Score:</strong> 5/6 (Triangle + LFZ + Support + EMA + HTF trend)</li>
                                <li><strong>Execution:</strong> Entry sớm trong triangle thay vì đợi breakout</li>
                                <li><strong>Kết quả:</strong> Breakout mạnh, trail stop cho R:R 1:4.4</li>
                            </ol>
                        </div>

                        <div class="lesson-box">
                            <div class="lesson-box-title">💡 Key Takeaway</div>
                            <p>Entry tại LFZ bên trong triangle cho R:R tốt hơn nhiều so với đợi breakout. High confluence = High confidence trade.</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🔥</div>
                    <div class="label">Hình 3.5.4: AVAX Triangle + LFZ Combo Trade</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>
        </main>

        <!-- SUMMARY -->
        <div class="summary-box">
            <h3>📋 Key Lessons Từ 4 Case Studies</h3>
            <ul>
                <li>Case 1: Breakout + Retest entry an toàn hơn, volume spike quan trọng</li>
                <li>Case 2: Trade theo trend + HFZ confluence = High win rate</li>
                <li>Case 3: Tránh entry gần apex, luôn đợi candle close + volume</li>
                <li>Case 4: Entry tại zone trong triangle cho R:R tốt hơn breakout entry</li>
            </ul>
        </div>

        <!-- QUIZ -->
        <div class="quiz-section">
            <div class="quiz-header">
                <h3>🎯 Kiểm Tra Kiến Thức</h3>
                <p>Trả lời các câu hỏi để củng cố bài học</p>
            </div>

            <div class="quiz-question" data-correct="1">
                <div class="question-text">Câu 1: Trong Case #3 (SOL LOSS), đâu là sai lầm chính dẫn đến false breakout?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Stop loss đặt quá sát</div>
                    <div class="quiz-option" data-index="1">Entry không đợi candle close + Volume yếu + Breakout gần apex</div>
                    <div class="quiz-option" data-index="2">Target quá xa</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <div class="question-text">Câu 2: Trong Case #4 (AVAX WIN), tại sao entry tại LFZ trong triangle lại cho R:R tốt hơn?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Entry sớm hơn = giá tốt hơn + stoploss gần support = R:R cao hơn</div>
                    <div class="quiz-option" data-index="1">Vì LFZ không bao giờ fail</div>
                    <div class="quiz-option" data-index="2">Vì không cần confirmation khi entry tại LFZ</div>
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
    <title>Bài 3.5: Ví Dụ Thực Tế Triangle Patterns | GEM Trading Academy</title>

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
            background: linear-gradient(180deg, rgba(0, 240, 255, 0.15) 0%, transparent 100%);
            border-bottom: 1px solid var(--border-subtle);
            text-align: center;
        }

        .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: linear-gradient(135deg, #00F0FF 0%, #00C4CC 100%);
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
            color: var(--accent-cyan);
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

        /* CONTENT */
        .content-section {
            padding: 0;
        }

        .content-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin: 1rem;
            padding: 1.5rem;
            border-left: 4px solid var(--accent-cyan);
        }

        .content-card h2 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--accent-cyan);
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
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(0, 240, 255, 0.1) 100%);
            border: 2px dashed var(--accent-cyan);
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
            color: var(--accent-cyan);
            font-weight: 600;
        }

        .image-placeholder .dimensions {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
        }

        /* CASE CARD */
        .case-card {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 1rem;
            overflow: hidden;
            margin: 1rem 0;
        }

        .case-header {
            padding: 1rem 1.25rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .case-header.asc {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 100%);
        }

        .case-header.desc {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.1) 100%);
        }

        .case-header.sym {
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.3) 0%, rgba(106, 91, 255, 0.1) 100%);
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
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(0, 240, 255, 0.05) 100%);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            margin: 1.5rem 1rem;
        }

        .summary-box h3 {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--accent-cyan);
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
            color: var(--accent-cyan);
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
                border-left: 4px solid var(--accent-cyan);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid var(--border-subtle);
            }

            .summary-box,
            .quiz-section {
                margin: 1rem 0;
                border-radius: 0;
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
                <span>📊</span>
                <span>Tier 2 - Nâng Cao</span>
            </div>
            <div class="lesson-chapter">Chapter 3 - Triangle Patterns</div>
            <h1 class="lesson-title">Ví Dụ Thực Tế Triangle Patterns</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 3.5</span></div>
                <div class="meta-item"><span>⏱️</span><span>15 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <!-- CONTENT -->
        <main class="content-section">
            <!-- Intro -->
            <div class="content-card">
                <h2>📈 Học Từ Case Studies Thực Tế</h2>
                <p>Phân tích 4 case studies thực tế về Triangle Patterns - bao gồm cả WIN và LOSS trades. Hiểu rõ điều gì làm setup thành công và thất bại.</p>
            </div>

            <!-- Case Study 1: Ascending Triangle WIN -->
            <div class="content-card">
                <h2>📈 Case #1: BTC/USDT - Ascending Triangle Breakout</h2>

                <div class="case-card">
                    <div class="case-header asc">
                        <div class="case-title">BTC/USDT 4H - Ascending Triangle</div>
                        <div class="case-badge win">✓ WIN +22%</div>
                    </div>
                    <div class="case-body">
                        <div class="case-stats">
                            <div class="stat-item">
                                <div class="stat-label">Entry</div>
                                <div class="stat-value">$43,200</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Stop</div>
                                <div class="stat-value">$41,800</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Target</div>
                                <div class="stat-value">$48,500</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">R:R</div>
                                <div class="stat-value green">1:3.8</div>
                            </div>
                        </div>

                        <div class="case-analysis">
                            <h4>Phân Tích Setup:</h4>
                            <ol>
                                <li><strong>Pattern:</strong> Ascending Triangle hình thành trong 18 ngày</li>
                                <li><strong>Resistance:</strong> $43,000 - test 3 lần không phá</li>
                                <li><strong>Support:</strong> Rising trendline với 4 điểm chạm</li>
                                <li><strong>Volume:</strong> Giảm dần 40%, spike 3x khi breakout</li>
                                <li><strong>Entry:</strong> Sau breakout + retest $43,000 (confirmation candle)</li>
                                <li><strong>Kết quả:</strong> Rally 22% trong 8 ngày</li>
                            </ol>
                        </div>

                        <div class="lesson-box">
                            <div class="lesson-box-title">💡 Key Takeaway</div>
                            <p>Breakout + Retest entry an toàn hơn breakout entry trực tiếp. Volume spike 3x xác nhận breakout mạnh.</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📈</div>
                    <div class="label">Hình 3.5.1: BTC Ascending Triangle Breakout</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Case Study 2: Descending Triangle WIN -->
            <div class="content-card">
                <h2>📉 Case #2: ETH/USDT - Descending Triangle Breakdown</h2>

                <div class="case-card">
                    <div class="case-header desc">
                        <div class="case-title">ETH/USDT Daily - Descending Triangle</div>
                        <div class="case-badge win">✓ WIN +18%</div>
                    </div>
                    <div class="case-body">
                        <div class="case-stats">
                            <div class="stat-item">
                                <div class="stat-label">Entry</div>
                                <div class="stat-value">$2,080</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Stop</div>
                                <div class="stat-value">$2,250</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Target</div>
                                <div class="stat-value">$1,750</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">R:R</div>
                                <div class="stat-value green">1:2</div>
                            </div>
                        </div>

                        <div class="case-analysis">
                            <h4>Phân Tích Setup:</h4>
                            <ol>
                                <li><strong>Context:</strong> Downtrend trước đó, Descending Triangle = continuation</li>
                                <li><strong>Support:</strong> $2,100 - flat line, test 4 lần</li>
                                <li><strong>Resistance:</strong> Lower highs tạo falling trendline</li>
                                <li><strong>Confluence:</strong> HFZ từ UPD pattern trùng với falling resistance</li>
                                <li><strong>Entry:</strong> Sau nến đóng dưới $2,100 với volume cao</li>
                                <li><strong>Kết quả:</strong> Drop về $1,780, close partial tại TP</li>
                            </ol>
                        </div>

                        <div class="lesson-box">
                            <div class="lesson-box-title">💡 Key Takeaway</div>
                            <p>Descending Triangle trong downtrend = High probability short. HFZ confluence tăng confidence cho entry.</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">📉</div>
                    <div class="label">Hình 3.5.2: ETH Descending Triangle Breakdown + HFZ</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Case Study 3: Symmetrical Triangle LOSS -->
            <div class="content-card">
                <h2>⚠️ Case #3: SOL/USDT - False Breakout</h2>

                <div class="case-card">
                    <div class="case-header sym">
                        <div class="case-title">SOL/USDT 4H - Symmetrical Triangle</div>
                        <div class="case-badge loss">✗ LOSS -2.5%</div>
                    </div>
                    <div class="case-body">
                        <div class="case-stats">
                            <div class="stat-item">
                                <div class="stat-label">Entry</div>
                                <div class="stat-value">$98.50</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Stop</div>
                                <div class="stat-value">$96.00</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Target</div>
                                <div class="stat-value">$108.00</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Result</div>
                                <div class="stat-value red">SL Hit</div>
                            </div>
                        </div>

                        <div class="case-analysis">
                            <h4>Phân Tích Sai Lầm:</h4>
                            <ol>
                                <li><strong>Sai lầm 1:</strong> Entry ngay khi breakout, không đợi candle close</li>
                                <li><strong>Sai lầm 2:</strong> Volume breakout chỉ 1.2x (yếu, cần ≥1.5x)</li>
                                <li><strong>Sai lầm 3:</strong> Breakout quá gần apex (trong 10% cuối triangle)</li>
                                <li><strong>Sai lầm 4:</strong> BTC đang trong downtrend, SOL không nên long</li>
                                <li><strong>Kết quả:</strong> False breakout, giá reverse và hit SL</li>
                            </ol>
                        </div>

                        <div class="lesson-box">
                            <div class="lesson-box-title">⚠️ Bài Học Từ Loss</div>
                            <p>Symmetrical Triangle có false breakout risk cao. Luôn đợi candle close + volume confirmation. Tránh entry gần apex và check market context.</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">⚠️</div>
                    <div class="label">Hình 3.5.3: SOL False Breakout - What Went Wrong</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>

            <!-- Case Study 4: Triangle + LFZ WIN -->
            <div class="content-card">
                <h2>🔥 Case #4: AVAX/USDT - Ascending Triangle + LFZ Combo</h2>

                <div class="case-card">
                    <div class="case-header asc">
                        <div class="case-title">AVAX/USDT 4H - Triangle + LFZ</div>
                        <div class="case-badge win">✓ WIN +28%</div>
                    </div>
                    <div class="case-body">
                        <div class="case-stats">
                            <div class="stat-item">
                                <div class="stat-label">Entry</div>
                                <div class="stat-value">$32.50</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Stop</div>
                                <div class="stat-value">$30.80</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Target</div>
                                <div class="stat-value">$40.00</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">R:R</div>
                                <div class="stat-value green">1:4.4</div>
                            </div>
                        </div>

                        <div class="case-analysis">
                            <h4>Phân Tích Setup:</h4>
                            <ol>
                                <li><strong>Pattern:</strong> Ascending Triangle trong uptrend</li>
                                <li><strong>LFZ:</strong> Vùng $31.80-$32.80 từ mini UPU trên support line</li>
                                <li><strong>Entry:</strong> Tại LFZ + rising support + Hammer candle</li>
                                <li><strong>Confluence Score:</strong> 5/6 (Triangle + LFZ + Support + EMA + HTF trend)</li>
                                <li><strong>Execution:</strong> Entry sớm trong triangle thay vì đợi breakout</li>
                                <li><strong>Kết quả:</strong> Breakout mạnh, trail stop cho R:R 1:4.4</li>
                            </ol>
                        </div>

                        <div class="lesson-box">
                            <div class="lesson-box-title">💡 Key Takeaway</div>
                            <p>Entry tại LFZ bên trong triangle cho R:R tốt hơn nhiều so với đợi breakout. High confluence = High confidence trade.</p>
                        </div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <div class="icon">🔥</div>
                    <div class="label">Hình 3.5.4: AVAX Triangle + LFZ Combo Trade</div>
                    <div class="dimensions">1200 x 700px</div>
                </div>
            </div>
        </main>

        <!-- SUMMARY -->
        <div class="summary-box">
            <h3>📋 Key Lessons Từ 4 Case Studies</h3>
            <ul>
                <li>Case 1: Breakout + Retest entry an toàn hơn, volume spike quan trọng</li>
                <li>Case 2: Trade theo trend + HFZ confluence = High win rate</li>
                <li>Case 3: Tránh entry gần apex, luôn đợi candle close + volume</li>
                <li>Case 4: Entry tại zone trong triangle cho R:R tốt hơn breakout entry</li>
            </ul>
        </div>

        <!-- QUIZ -->
        <div class="quiz-section">
            <div class="quiz-header">
                <h3>🎯 Kiểm Tra Kiến Thức</h3>
                <p>Trả lời các câu hỏi để củng cố bài học</p>
            </div>

            <div class="quiz-question" data-correct="1">
                <div class="question-text">Câu 1: Trong Case #3 (SOL LOSS), đâu là sai lầm chính dẫn đến false breakout?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Stop loss đặt quá sát</div>
                    <div class="quiz-option" data-index="1">Entry không đợi candle close + Volume yếu + Breakout gần apex</div>
                    <div class="quiz-option" data-index="2">Target quá xa</div>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <div class="question-text">Câu 2: Trong Case #4 (AVAX WIN), tại sao entry tại LFZ trong triangle lại cho R:R tốt hơn?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-index="0">Entry sớm hơn = giá tốt hơn + stoploss gần support = R:R cao hơn</div>
                    <div class="quiz-option" data-index="1">Vì LFZ không bao giờ fail</div>
                    <div class="quiz-option" data-index="2">Vì không cần confirmation khi entry tại LFZ</div>
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

-- ✅ Done: 5 lessons
