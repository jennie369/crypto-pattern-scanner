-- =====================================================
-- TIER-2 - Chương 4: Multi-Timeframe Analysis
-- Course: course-tier2-trading-advanced
-- File 12/23
-- =====================================================

-- Create/Update Module
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  'module-tier-2-ch4',
  'course-tier2-trading-advanced',
  'Chương 4: Multi-Timeframe Analysis',
  'Phân tích đa khung thời gian',
  4,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Lesson 4.1: Nguyên Tắc Đa Khung Thời Gian - Tier 2
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch4-l1',
  'module-tier-2-ch4',
  'course-tier2-trading-advanced',
  'Bài 4.1: Nguyên Tắc Đa Khung Thời Gian - Tier 2',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 4.1: Nguyên Tắc Đa Khung Thời Gian - Tier 2</title>
    <style>
        :root {
            --primary-navy: #112250;
            --accent-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --danger-red: #EF4444;
            --text-primary: #FFFFFF;
            --text-secondary: #A0AEC0;
            --bg-dark: #0a0a0f;
            --bg-card: #1a1a2e;
            --bg-card-hover: #252540;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1rem;
        }

        @media (max-width: 600px) {
            .lesson-container {
                padding: 0;
            }
        }

        /* Header Section */
        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem;
            margin-bottom: 1.5rem;
            border-radius: 16px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                padding: 1.5rem 1rem;
            }
        }

        .lesson-header::before {
            content: '''';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url(''data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="%23FFBD59" opacity="0.3"/><circle cx="80" cy="40" r="1.5" fill="%2300F0FF" opacity="0.3"/><circle cx="40" cy="70" r="1" fill="%236A5BFF" opacity="0.3"/></svg>'');
            opacity: 0.5;
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%);
            color: white;
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
        }

        .lesson-subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
            position: relative;
            z-index: 1;
        }

        /* Content Cards */
        .content-card {
            background: var(--bg-card);
            border-radius: 12px;
            margin-bottom: 1.5rem;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .content-card {
                border-radius: 0;
                border-left: 4px solid var(--accent-cyan);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
        }

        .card-header {
            background: rgba(0, 240, 255, 0.1);
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .card-header {
                padding: 1rem;
            }
        }

        .card-header h2 {
            font-size: 1.25rem;
            color: var(--accent-cyan);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .card-content {
            padding: 1.5rem;
        }

        @media (max-width: 600px) {
            .card-content {
                padding: 1rem;
            }
        }

        .card-content p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
        }

        .card-content p:last-child {
            margin-bottom: 0;
        }

        /* Image Placeholders */
        .image-placeholder {
            width: 100%;
            background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 1rem 0;
            overflow: hidden;
            position: relative;
        }

        @media (max-width: 600px) {
            .image-placeholder {
                border-radius: 0;
                margin: 1rem -1rem;
                width: calc(100% + 2rem);
            }
        }

        .image-placeholder img {
            width: 100%;
            height: auto;
            display: block;
        }

        /* Info Boxes */
        .info-box {
            background: rgba(0, 240, 255, 0.1);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .info-box {
                border-radius: 4px;
            }
        }

        .info-box.warning {
            background: rgba(255, 189, 89, 0.1);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .info-box.success {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .info-box.danger {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
        }

        .info-box-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .info-box.warning .info-box-title {
            color: var(--accent-gold);
        }

        .info-box.success .info-box-title {
            color: var(--success-green);
        }

        .info-box.danger .info-box-title {
            color: var(--danger-red);
        }

        /* Lists */
        .styled-list {
            list-style: none;
            padding: 0;
        }

        .styled-list li {
            padding: 0.75rem 0;
            padding-left: 2rem;
            position: relative;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            color: var(--text-secondary);
        }

        .styled-list li:last-child {
            border-bottom: none;
        }

        .styled-list li::before {
            content: ''→'';
            position: absolute;
            left: 0;
            color: var(--accent-cyan);
            font-weight: bold;
        }

        /* Timeframe Grid */
        .tf-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .tf-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: rgba(255,255,255,0.1);
                margin: 1rem -1rem;
                width: calc(100% + 2rem);
            }
        }

        .tf-card {
            background: rgba(0, 240, 255, 0.1);
            border: 1px solid rgba(0, 240, 255, 0.2);
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
        }

        @media (max-width: 600px) {
            .tf-card {
                border-radius: 0;
                border: none;
                background: var(--bg-card);
            }
        }

        .tf-card.htf {
            background: rgba(106, 91, 255, 0.1);
            border-color: rgba(106, 91, 255, 0.3);
        }

        .tf-card.itf {
            background: rgba(0, 240, 255, 0.1);
            border-color: rgba(0, 240, 255, 0.3);
        }

        .tf-card.ltf {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .tf-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 0.25rem;
        }

        .tf-card.htf .tf-label { color: var(--accent-purple); }
        .tf-card.itf .tf-label { color: var(--accent-cyan); }
        .tf-card.ltf .tf-label { color: var(--success-green); }

        .tf-name {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
        }

        .tf-purpose {
            font-size: 0.85rem;
            color: var(--text-secondary);
        }

        /* Summary Box */
        .summary-box {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(106, 91, 255, 0.1) 100%);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                margin: 1.5rem 0;
                border-left: 4px solid var(--accent-cyan);
                border-right: none;
                border-top: none;
                border-bottom: none;
            }
        }

        .summary-box h3 {
            color: var(--accent-cyan);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-list {
            list-style: none;
            padding: 0;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-list li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--success-green);
        }

        /* Quiz Section */
        .quiz-section {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                padding: 1rem;
                margin-top: 1rem;
            }
        }

        .quiz-section h3 {
            color: var(--accent-gold);
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }

        .quiz-option:hover {
            background: rgba(255,255,255,0.1);
            border-color: var(--accent-cyan);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--success-green);
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: var(--danger-red);
        }

        .quiz-result {
            padding: 1rem;
            border-radius: 8px;
            margin-top: 0.5rem;
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
            color: var(--danger-red);
        }

        /* Quiz Score */
        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(106, 91, 255, 0.1) 100%);
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .score-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--accent-cyan);
        }

        .score-label {
            color: var(--text-secondary);
        }

        .btn-retake {
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s ease;
        }

        .btn-retake:hover {
            transform: scale(1.05);
        }

        /* Footer */
        .lesson-footer {
            text-align: center;
            padding: 2rem;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .highlight {
            color: var(--accent-cyan);
            font-weight: 600;
        }

        .highlight-gold {
            color: var(--accent-gold);
            font-weight: 600;
        }

        .highlight-green {
            color: var(--success-green);
            font-weight: 600;
        }

        .highlight-purple {
            color: var(--accent-purple);
            font-weight: 600;
        }

        /* Flow Diagram */
        .flow-diagram {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            margin: 1.5rem 0;
            flex-wrap: wrap;
        }

        .flow-box {
            background: rgba(106, 91, 255, 0.2);
            border: 1px solid var(--accent-purple);
            padding: 0.75rem 1rem;
            border-radius: 8px;
            text-align: center;
            min-width: 100px;
        }

        .flow-box.htf {
            background: rgba(106, 91, 255, 0.2);
            border-color: var(--accent-purple);
        }

        .flow-box.itf {
            background: rgba(0, 240, 255, 0.2);
            border-color: var(--accent-cyan);
        }

        .flow-box.ltf {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--success-green);
        }

        .flow-arrow {
            color: var(--accent-gold);
            font-size: 1.5rem;
        }

        @media (max-width: 600px) {
            .flow-diagram {
                flex-direction: column;
            }
            .flow-arrow {
                transform: rotate(90deg);
            }
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="header-badge">📊 Tier 2 - Bài 4.1</span>
            <h1 class="lesson-title">Nguyên Tắc Đa Khung Thời Gian</h1>
            <p class="lesson-subtitle">Multi-Timeframe Analysis Foundation</p>
        </header>

        <!-- Section 1: Tại Sao Cần Phân Tích Đa TF -->
        <div class="content-card">
            <div class="card-header">
                <h2>🎯 Tại Sao Cần Phân Tích Đa Khung Thời Gian?</h2>
            </div>
            <div class="card-content">
                <p>Trong trading, <span class="highlight">một khung thời gian đơn lẻ không đủ</span> để có cái nhìn toàn diện về thị trường. Phân tích đa khung thời gian (Multi-Timeframe Analysis - MTF) giúp bạn:</p>

                <ul class="styled-list">
                    <li><strong>Xác định xu hướng chính:</strong> Biết mình đang trade theo hay ngược trend</li>
                    <li><strong>Tìm zone chất lượng:</strong> Zone từ khung lớn có sức mạnh hơn</li>
                    <li><strong>Entry chính xác:</strong> Vào lệnh đúng timing với risk nhỏ</li>
                    <li><strong>Tránh trade ngược dòng:</strong> Không Long trong downtrend lớn</li>
                </ul>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Sai Lầm Phổ Biến</div>
                    <p>Nhiều trader chỉ nhìn 1 khung thời gian → bị "tunnel vision" → entry ngược trend lớn → thua lỗ.</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/00F0FF?text=Single+TF+vs+Multi-TF+Vision" alt="So sánh Single TF vs Multi-TF">
                </div>
            </div>
        </div>

        <!-- Section 2: Nguyên Tắc Top-Down -->
        <div class="content-card">
            <div class="card-header">
                <h2>📐 Nguyên Tắc Top-Down Analysis</h2>
            </div>
            <div class="card-content">
                <p>GEM Frequency Trading sử dụng phương pháp <span class="highlight">Top-Down</span> - phân tích từ khung lớn xuống khung nhỏ:</p>

                <div class="flow-diagram">
                    <div class="flow-box htf">
                        <div style="font-weight: 700; color: var(--accent-purple);">HTF</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">Higher TF</div>
                    </div>
                    <span class="flow-arrow">→</span>
                    <div class="flow-box itf">
                        <div style="font-weight: 700; color: var(--accent-cyan);">ITF</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">Intermediate TF</div>
                    </div>
                    <span class="flow-arrow">→</span>
                    <div class="flow-box ltf">
                        <div style="font-weight: 700; color: var(--success-green);">LTF</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">Lower TF</div>
                    </div>
                </div>

                <div class="tf-grid">
                    <div class="tf-card htf">
                        <div class="tf-label">Higher Timeframe</div>
                        <div class="tf-name">HTF</div>
                        <div class="tf-purpose">Xác định xu hướng lớn</div>
                    </div>
                    <div class="tf-card itf">
                        <div class="tf-label">Intermediate TF</div>
                        <div class="tf-name">ITF</div>
                        <div class="tf-purpose">Xác định zone giao dịch</div>
                    </div>
                    <div class="tf-card ltf">
                        <div class="tf-label">Lower Timeframe</div>
                        <div class="tf-name">LTF</div>
                        <div class="tf-purpose">Entry chính xác</div>
                    </div>
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Quy Tắc Vàng</div>
                    <p><strong>Luôn trade theo hướng của HTF!</strong> Nếu HTF uptrend → chỉ tìm cơ hội Long. Nếu HTF downtrend → chỉ tìm cơ hội Short.</p>
                </div>
            </div>
        </div>

        <!-- Section 3: Chức Năng Mỗi Khung -->
        <div class="content-card">
            <div class="card-header">
                <h2>🔍 Chức Năng Cụ Thể Của Mỗi Khung</h2>
            </div>
            <div class="card-content">
                <p><span class="highlight-purple">HTF (Higher Timeframe)</span> - Khung thời gian cao nhất:</p>
                <ul class="styled-list">
                    <li>Xác định <strong>xu hướng chính</strong> của thị trường</li>
                    <li>Tìm các <strong>key level</strong> quan trọng nhất</li>
                    <li>Xác định <strong>bias</strong> (Long only hay Short only)</li>
                    <li>Ví dụ: Daily, Weekly cho swing trade</li>
                </ul>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/6A5BFF?text=HTF+Trend+%26+Key+Levels" alt="HTF Trend và Key Levels">
                </div>

                <p><span class="highlight">ITF (Intermediate Timeframe)</span> - Khung trung gian:</p>
                <ul class="styled-list">
                    <li>Xác định <strong>GEM Zones</strong> (HFZ/LFZ)</li>
                    <li>Tìm các <strong>pattern</strong> đang hình thành</li>
                    <li>Đánh giá <strong>zone lifecycle</strong> (Fresh, Tested)</li>
                    <li>Ví dụ: 4H, 1H cho swing trade</li>
                </ul>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/00F0FF?text=ITF+Zone+Identification" alt="ITF Zone Identification">
                </div>

                <p><span class="highlight-green">LTF (Lower Timeframe)</span> - Khung thấp nhất:</p>
                <ul class="styled-list">
                    <li>Tìm <strong>entry trigger</strong> chính xác</li>
                    <li>Xác định <strong>stoploss</strong> tối ưu</li>
                    <li>Quản lý <strong>risk:reward</strong></li>
                    <li>Ví dụ: 15M, 5M cho swing trade entry</li>
                </ul>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/10B981?text=LTF+Entry+Trigger" alt="LTF Entry Trigger">
                </div>
            </div>
        </div>

        <!-- Section 4: Ưu Điểm MTF -->
        <div class="content-card">
            <div class="card-header">
                <h2>💎 Ưu Điểm Của Multi-Timeframe Analysis</h2>
            </div>
            <div class="card-content">
                <div class="info-box success">
                    <div class="info-box-title">1. Tăng Win Rate</div>
                    <p>Trade cùng hướng HTF trend có xác suất thành công cao hơn 60-70% so với trade ngược trend.</p>
                </div>

                <div class="info-box success">
                    <div class="info-box-title">2. Risk Nhỏ Hơn</div>
                    <p>Entry trên LTF cho phép đặt stoploss chặt hơn → risk giảm 50-70% so với entry trên ITF.</p>
                </div>

                <div class="info-box success">
                    <div class="info-box-title">3. Reward Lớn Hơn</div>
                    <p>Target dựa trên ITF/HTF → target xa hơn → RR ratio cải thiện đáng kể (3:1 - 5:1).</p>
                </div>

                <div class="info-box success">
                    <div class="info-box-title">4. Giảm Fake Signal</div>
                    <p>Signal phải confirm trên nhiều TF → lọc bớt noise và false breakout.</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/FFBD59?text=MTF+Benefits+Comparison" alt="MTF Benefits">
                </div>
            </div>
        </div>

        <!-- Section 5: Common Mistakes -->
        <div class="content-card">
            <div class="card-header">
                <h2>⚠️ Lỗi Thường Gặp Khi Phân Tích MTF</h2>
            </div>
            <div class="card-content">
                <div class="info-box danger">
                    <div class="info-box-title">❌ Lỗi 1: Bỏ Qua HTF</div>
                    <p>Chỉ nhìn chart 15M → Long trong downtrend Daily → Bị cuốn theo trend lớn.</p>
                </div>

                <div class="info-box danger">
                    <div class="info-box-title">❌ Lỗi 2: Quá Nhiều TF</div>
                    <p>Phân tích 5-6 TF cùng lúc → Confusion, analysis paralysis → Bỏ lỡ cơ hội.</p>
                </div>

                <div class="info-box danger">
                    <div class="info-box-title">❌ Lỗi 3: Không Nhất Quán</div>
                    <p>Mỗi trade dùng TF khác nhau → Không có hệ thống rõ ràng → Kết quả không đồng nhất.</p>
                </div>

                <div class="info-box">
                    <div class="info-box-title">✓ Giải Pháp</div>
                    <p>Chọn <span class="highlight">3 khung cố định</span> phù hợp với style trading của bạn và luôn tuân thủ quy trình HTF → ITF → LTF.</p>
                </div>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li><strong>Multi-Timeframe Analysis</strong> = phân tích từ khung lớn xuống nhỏ</li>
                <li><strong>HTF</strong> xác định xu hướng và bias (Long only / Short only)</li>
                <li><strong>ITF</strong> xác định GEM Zones và patterns</li>
                <li><strong>LTF</strong> tìm entry trigger và đặt stoploss chính xác</li>
                <li>Luôn trade <strong>theo hướng HTF</strong> để tăng win rate</li>
                <li>Chỉ dùng <strong>3 khung cố định</strong> để tránh confusion</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="1">
                <p>1. Trong Multi-Timeframe Analysis, khung nào dùng để xác định xu hướng chính?</p>
                <button class="quiz-option" data-index="0">LTF (Lower Timeframe)</button>
                <button class="quiz-option" data-index="1">HTF (Higher Timeframe)</button>
                <button class="quiz-option" data-index="2">ITF (Intermediate Timeframe)</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p>2. Khung nào được dùng để xác định GEM Zones (HFZ/LFZ)?</p>
                <button class="quiz-option" data-index="0">HTF</button>
                <button class="quiz-option" data-index="1">LTF</button>
                <button class="quiz-option" data-index="2">ITF</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p>3. Nếu HTF (Daily) đang trong downtrend, bạn nên làm gì?</p>
                <button class="quiz-option" data-index="0">Chỉ tìm cơ hội Short, không Long</button>
                <button class="quiz-option" data-index="1">Tìm cơ hội Long để bắt đáy</button>
                <button class="quiz-option" data-index="2">Không giao dịch cho đến khi có uptrend</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-number"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="btn-retake" onclick="retakeQuiz()">Làm Lại Quiz</button>
            </div>
        </div>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 2</p>
            <p>© 2025 GEM Frequency Trading Method</p>
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

        function retakeQuiz() {
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
    <title>Bài 4.1: Nguyên Tắc Đa Khung Thời Gian - Tier 2</title>
    <style>
        :root {
            --primary-navy: #112250;
            --accent-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --danger-red: #EF4444;
            --text-primary: #FFFFFF;
            --text-secondary: #A0AEC0;
            --bg-dark: #0a0a0f;
            --bg-card: #1a1a2e;
            --bg-card-hover: #252540;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1rem;
        }

        @media (max-width: 600px) {
            .lesson-container {
                padding: 0;
            }
        }

        /* Header Section */
        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem;
            margin-bottom: 1.5rem;
            border-radius: 16px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                padding: 1.5rem 1rem;
            }
        }

        .lesson-header::before {
            content: '''';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url(''data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="%23FFBD59" opacity="0.3"/><circle cx="80" cy="40" r="1.5" fill="%2300F0FF" opacity="0.3"/><circle cx="40" cy="70" r="1" fill="%236A5BFF" opacity="0.3"/></svg>'');
            opacity: 0.5;
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%);
            color: white;
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
        }

        .lesson-subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
            position: relative;
            z-index: 1;
        }

        /* Content Cards */
        .content-card {
            background: var(--bg-card);
            border-radius: 12px;
            margin-bottom: 1.5rem;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .content-card {
                border-radius: 0;
                border-left: 4px solid var(--accent-cyan);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
        }

        .card-header {
            background: rgba(0, 240, 255, 0.1);
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .card-header {
                padding: 1rem;
            }
        }

        .card-header h2 {
            font-size: 1.25rem;
            color: var(--accent-cyan);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .card-content {
            padding: 1.5rem;
        }

        @media (max-width: 600px) {
            .card-content {
                padding: 1rem;
            }
        }

        .card-content p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
        }

        .card-content p:last-child {
            margin-bottom: 0;
        }

        /* Image Placeholders */
        .image-placeholder {
            width: 100%;
            background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 1rem 0;
            overflow: hidden;
            position: relative;
        }

        @media (max-width: 600px) {
            .image-placeholder {
                border-radius: 0;
                margin: 1rem -1rem;
                width: calc(100% + 2rem);
            }
        }

        .image-placeholder img {
            width: 100%;
            height: auto;
            display: block;
        }

        /* Info Boxes */
        .info-box {
            background: rgba(0, 240, 255, 0.1);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .info-box {
                border-radius: 4px;
            }
        }

        .info-box.warning {
            background: rgba(255, 189, 89, 0.1);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .info-box.success {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .info-box.danger {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
        }

        .info-box-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .info-box.warning .info-box-title {
            color: var(--accent-gold);
        }

        .info-box.success .info-box-title {
            color: var(--success-green);
        }

        .info-box.danger .info-box-title {
            color: var(--danger-red);
        }

        /* Lists */
        .styled-list {
            list-style: none;
            padding: 0;
        }

        .styled-list li {
            padding: 0.75rem 0;
            padding-left: 2rem;
            position: relative;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            color: var(--text-secondary);
        }

        .styled-list li:last-child {
            border-bottom: none;
        }

        .styled-list li::before {
            content: ''→'';
            position: absolute;
            left: 0;
            color: var(--accent-cyan);
            font-weight: bold;
        }

        /* Timeframe Grid */
        .tf-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .tf-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: rgba(255,255,255,0.1);
                margin: 1rem -1rem;
                width: calc(100% + 2rem);
            }
        }

        .tf-card {
            background: rgba(0, 240, 255, 0.1);
            border: 1px solid rgba(0, 240, 255, 0.2);
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
        }

        @media (max-width: 600px) {
            .tf-card {
                border-radius: 0;
                border: none;
                background: var(--bg-card);
            }
        }

        .tf-card.htf {
            background: rgba(106, 91, 255, 0.1);
            border-color: rgba(106, 91, 255, 0.3);
        }

        .tf-card.itf {
            background: rgba(0, 240, 255, 0.1);
            border-color: rgba(0, 240, 255, 0.3);
        }

        .tf-card.ltf {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .tf-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 0.25rem;
        }

        .tf-card.htf .tf-label { color: var(--accent-purple); }
        .tf-card.itf .tf-label { color: var(--accent-cyan); }
        .tf-card.ltf .tf-label { color: var(--success-green); }

        .tf-name {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
        }

        .tf-purpose {
            font-size: 0.85rem;
            color: var(--text-secondary);
        }

        /* Summary Box */
        .summary-box {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(106, 91, 255, 0.1) 100%);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                margin: 1.5rem 0;
                border-left: 4px solid var(--accent-cyan);
                border-right: none;
                border-top: none;
                border-bottom: none;
            }
        }

        .summary-box h3 {
            color: var(--accent-cyan);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-list {
            list-style: none;
            padding: 0;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-list li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--success-green);
        }

        /* Quiz Section */
        .quiz-section {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                padding: 1rem;
                margin-top: 1rem;
            }
        }

        .quiz-section h3 {
            color: var(--accent-gold);
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }

        .quiz-option:hover {
            background: rgba(255,255,255,0.1);
            border-color: var(--accent-cyan);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--success-green);
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: var(--danger-red);
        }

        .quiz-result {
            padding: 1rem;
            border-radius: 8px;
            margin-top: 0.5rem;
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
            color: var(--danger-red);
        }

        /* Quiz Score */
        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(106, 91, 255, 0.1) 100%);
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .score-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--accent-cyan);
        }

        .score-label {
            color: var(--text-secondary);
        }

        .btn-retake {
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s ease;
        }

        .btn-retake:hover {
            transform: scale(1.05);
        }

        /* Footer */
        .lesson-footer {
            text-align: center;
            padding: 2rem;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .highlight {
            color: var(--accent-cyan);
            font-weight: 600;
        }

        .highlight-gold {
            color: var(--accent-gold);
            font-weight: 600;
        }

        .highlight-green {
            color: var(--success-green);
            font-weight: 600;
        }

        .highlight-purple {
            color: var(--accent-purple);
            font-weight: 600;
        }

        /* Flow Diagram */
        .flow-diagram {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            margin: 1.5rem 0;
            flex-wrap: wrap;
        }

        .flow-box {
            background: rgba(106, 91, 255, 0.2);
            border: 1px solid var(--accent-purple);
            padding: 0.75rem 1rem;
            border-radius: 8px;
            text-align: center;
            min-width: 100px;
        }

        .flow-box.htf {
            background: rgba(106, 91, 255, 0.2);
            border-color: var(--accent-purple);
        }

        .flow-box.itf {
            background: rgba(0, 240, 255, 0.2);
            border-color: var(--accent-cyan);
        }

        .flow-box.ltf {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--success-green);
        }

        .flow-arrow {
            color: var(--accent-gold);
            font-size: 1.5rem;
        }

        @media (max-width: 600px) {
            .flow-diagram {
                flex-direction: column;
            }
            .flow-arrow {
                transform: rotate(90deg);
            }
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="header-badge">📊 Tier 2 - Bài 4.1</span>
            <h1 class="lesson-title">Nguyên Tắc Đa Khung Thời Gian</h1>
            <p class="lesson-subtitle">Multi-Timeframe Analysis Foundation</p>
        </header>

        <!-- Section 1: Tại Sao Cần Phân Tích Đa TF -->
        <div class="content-card">
            <div class="card-header">
                <h2>🎯 Tại Sao Cần Phân Tích Đa Khung Thời Gian?</h2>
            </div>
            <div class="card-content">
                <p>Trong trading, <span class="highlight">một khung thời gian đơn lẻ không đủ</span> để có cái nhìn toàn diện về thị trường. Phân tích đa khung thời gian (Multi-Timeframe Analysis - MTF) giúp bạn:</p>

                <ul class="styled-list">
                    <li><strong>Xác định xu hướng chính:</strong> Biết mình đang trade theo hay ngược trend</li>
                    <li><strong>Tìm zone chất lượng:</strong> Zone từ khung lớn có sức mạnh hơn</li>
                    <li><strong>Entry chính xác:</strong> Vào lệnh đúng timing với risk nhỏ</li>
                    <li><strong>Tránh trade ngược dòng:</strong> Không Long trong downtrend lớn</li>
                </ul>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Sai Lầm Phổ Biến</div>
                    <p>Nhiều trader chỉ nhìn 1 khung thời gian → bị "tunnel vision" → entry ngược trend lớn → thua lỗ.</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/00F0FF?text=Single+TF+vs+Multi-TF+Vision" alt="So sánh Single TF vs Multi-TF">
                </div>
            </div>
        </div>

        <!-- Section 2: Nguyên Tắc Top-Down -->
        <div class="content-card">
            <div class="card-header">
                <h2>📐 Nguyên Tắc Top-Down Analysis</h2>
            </div>
            <div class="card-content">
                <p>GEM Frequency Trading sử dụng phương pháp <span class="highlight">Top-Down</span> - phân tích từ khung lớn xuống khung nhỏ:</p>

                <div class="flow-diagram">
                    <div class="flow-box htf">
                        <div style="font-weight: 700; color: var(--accent-purple);">HTF</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">Higher TF</div>
                    </div>
                    <span class="flow-arrow">→</span>
                    <div class="flow-box itf">
                        <div style="font-weight: 700; color: var(--accent-cyan);">ITF</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">Intermediate TF</div>
                    </div>
                    <span class="flow-arrow">→</span>
                    <div class="flow-box ltf">
                        <div style="font-weight: 700; color: var(--success-green);">LTF</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">Lower TF</div>
                    </div>
                </div>

                <div class="tf-grid">
                    <div class="tf-card htf">
                        <div class="tf-label">Higher Timeframe</div>
                        <div class="tf-name">HTF</div>
                        <div class="tf-purpose">Xác định xu hướng lớn</div>
                    </div>
                    <div class="tf-card itf">
                        <div class="tf-label">Intermediate TF</div>
                        <div class="tf-name">ITF</div>
                        <div class="tf-purpose">Xác định zone giao dịch</div>
                    </div>
                    <div class="tf-card ltf">
                        <div class="tf-label">Lower Timeframe</div>
                        <div class="tf-name">LTF</div>
                        <div class="tf-purpose">Entry chính xác</div>
                    </div>
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Quy Tắc Vàng</div>
                    <p><strong>Luôn trade theo hướng của HTF!</strong> Nếu HTF uptrend → chỉ tìm cơ hội Long. Nếu HTF downtrend → chỉ tìm cơ hội Short.</p>
                </div>
            </div>
        </div>

        <!-- Section 3: Chức Năng Mỗi Khung -->
        <div class="content-card">
            <div class="card-header">
                <h2>🔍 Chức Năng Cụ Thể Của Mỗi Khung</h2>
            </div>
            <div class="card-content">
                <p><span class="highlight-purple">HTF (Higher Timeframe)</span> - Khung thời gian cao nhất:</p>
                <ul class="styled-list">
                    <li>Xác định <strong>xu hướng chính</strong> của thị trường</li>
                    <li>Tìm các <strong>key level</strong> quan trọng nhất</li>
                    <li>Xác định <strong>bias</strong> (Long only hay Short only)</li>
                    <li>Ví dụ: Daily, Weekly cho swing trade</li>
                </ul>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/6A5BFF?text=HTF+Trend+%26+Key+Levels" alt="HTF Trend và Key Levels">
                </div>

                <p><span class="highlight">ITF (Intermediate Timeframe)</span> - Khung trung gian:</p>
                <ul class="styled-list">
                    <li>Xác định <strong>GEM Zones</strong> (HFZ/LFZ)</li>
                    <li>Tìm các <strong>pattern</strong> đang hình thành</li>
                    <li>Đánh giá <strong>zone lifecycle</strong> (Fresh, Tested)</li>
                    <li>Ví dụ: 4H, 1H cho swing trade</li>
                </ul>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/00F0FF?text=ITF+Zone+Identification" alt="ITF Zone Identification">
                </div>

                <p><span class="highlight-green">LTF (Lower Timeframe)</span> - Khung thấp nhất:</p>
                <ul class="styled-list">
                    <li>Tìm <strong>entry trigger</strong> chính xác</li>
                    <li>Xác định <strong>stoploss</strong> tối ưu</li>
                    <li>Quản lý <strong>risk:reward</strong></li>
                    <li>Ví dụ: 15M, 5M cho swing trade entry</li>
                </ul>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/10B981?text=LTF+Entry+Trigger" alt="LTF Entry Trigger">
                </div>
            </div>
        </div>

        <!-- Section 4: Ưu Điểm MTF -->
        <div class="content-card">
            <div class="card-header">
                <h2>💎 Ưu Điểm Của Multi-Timeframe Analysis</h2>
            </div>
            <div class="card-content">
                <div class="info-box success">
                    <div class="info-box-title">1. Tăng Win Rate</div>
                    <p>Trade cùng hướng HTF trend có xác suất thành công cao hơn 60-70% so với trade ngược trend.</p>
                </div>

                <div class="info-box success">
                    <div class="info-box-title">2. Risk Nhỏ Hơn</div>
                    <p>Entry trên LTF cho phép đặt stoploss chặt hơn → risk giảm 50-70% so với entry trên ITF.</p>
                </div>

                <div class="info-box success">
                    <div class="info-box-title">3. Reward Lớn Hơn</div>
                    <p>Target dựa trên ITF/HTF → target xa hơn → RR ratio cải thiện đáng kể (3:1 - 5:1).</p>
                </div>

                <div class="info-box success">
                    <div class="info-box-title">4. Giảm Fake Signal</div>
                    <p>Signal phải confirm trên nhiều TF → lọc bớt noise và false breakout.</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/FFBD59?text=MTF+Benefits+Comparison" alt="MTF Benefits">
                </div>
            </div>
        </div>

        <!-- Section 5: Common Mistakes -->
        <div class="content-card">
            <div class="card-header">
                <h2>⚠️ Lỗi Thường Gặp Khi Phân Tích MTF</h2>
            </div>
            <div class="card-content">
                <div class="info-box danger">
                    <div class="info-box-title">❌ Lỗi 1: Bỏ Qua HTF</div>
                    <p>Chỉ nhìn chart 15M → Long trong downtrend Daily → Bị cuốn theo trend lớn.</p>
                </div>

                <div class="info-box danger">
                    <div class="info-box-title">❌ Lỗi 2: Quá Nhiều TF</div>
                    <p>Phân tích 5-6 TF cùng lúc → Confusion, analysis paralysis → Bỏ lỡ cơ hội.</p>
                </div>

                <div class="info-box danger">
                    <div class="info-box-title">❌ Lỗi 3: Không Nhất Quán</div>
                    <p>Mỗi trade dùng TF khác nhau → Không có hệ thống rõ ràng → Kết quả không đồng nhất.</p>
                </div>

                <div class="info-box">
                    <div class="info-box-title">✓ Giải Pháp</div>
                    <p>Chọn <span class="highlight">3 khung cố định</span> phù hợp với style trading của bạn và luôn tuân thủ quy trình HTF → ITF → LTF.</p>
                </div>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li><strong>Multi-Timeframe Analysis</strong> = phân tích từ khung lớn xuống nhỏ</li>
                <li><strong>HTF</strong> xác định xu hướng và bias (Long only / Short only)</li>
                <li><strong>ITF</strong> xác định GEM Zones và patterns</li>
                <li><strong>LTF</strong> tìm entry trigger và đặt stoploss chính xác</li>
                <li>Luôn trade <strong>theo hướng HTF</strong> để tăng win rate</li>
                <li>Chỉ dùng <strong>3 khung cố định</strong> để tránh confusion</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="1">
                <p>1. Trong Multi-Timeframe Analysis, khung nào dùng để xác định xu hướng chính?</p>
                <button class="quiz-option" data-index="0">LTF (Lower Timeframe)</button>
                <button class="quiz-option" data-index="1">HTF (Higher Timeframe)</button>
                <button class="quiz-option" data-index="2">ITF (Intermediate Timeframe)</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p>2. Khung nào được dùng để xác định GEM Zones (HFZ/LFZ)?</p>
                <button class="quiz-option" data-index="0">HTF</button>
                <button class="quiz-option" data-index="1">LTF</button>
                <button class="quiz-option" data-index="2">ITF</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p>3. Nếu HTF (Daily) đang trong downtrend, bạn nên làm gì?</p>
                <button class="quiz-option" data-index="0">Chỉ tìm cơ hội Short, không Long</button>
                <button class="quiz-option" data-index="1">Tìm cơ hội Long để bắt đáy</button>
                <button class="quiz-option" data-index="2">Không giao dịch cho đến khi có uptrend</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-number"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="btn-retake" onclick="retakeQuiz()">Làm Lại Quiz</button>
            </div>
        </div>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 2</p>
            <p>© 2025 GEM Frequency Trading Method</p>
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

        function retakeQuiz() {
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

-- Lesson 4.2: Hệ Thống 3 Khung Thời Gian - Tier 2
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch4-l2',
  'module-tier-2-ch4',
  'course-tier2-trading-advanced',
  'Bài 4.2: Hệ Thống 3 Khung Thời Gian - Tier 2',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 4.2: Hệ Thống 3 Khung Thời Gian - Tier 2</title>
    <style>
        :root {
            --primary-navy: #112250;
            --accent-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --danger-red: #EF4444;
            --text-primary: #FFFFFF;
            --text-secondary: #A0AEC0;
            --bg-dark: #0a0a0f;
            --bg-card: #1a1a2e;
            --bg-card-hover: #252540;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1rem;
        }

        @media (max-width: 600px) {
            .lesson-container {
                padding: 0;
            }
        }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem;
            margin-bottom: 1.5rem;
            border-radius: 16px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                padding: 1.5rem 1rem;
            }
        }

        .lesson-header::before {
            content: '''';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url(''data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="%23FFBD59" opacity="0.3"/><circle cx="80" cy="40" r="1.5" fill="%2300F0FF" opacity="0.3"/><circle cx="40" cy="70" r="1" fill="%236A5BFF" opacity="0.3"/></svg>'');
            opacity: 0.5;
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%);
            color: white;
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
        }

        .lesson-subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
            position: relative;
            z-index: 1;
        }

        .content-card {
            background: var(--bg-card);
            border-radius: 12px;
            margin-bottom: 1.5rem;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .content-card {
                border-radius: 0;
                border-left: 4px solid var(--accent-cyan);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
        }

        .card-header {
            background: rgba(0, 240, 255, 0.1);
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .card-header {
                padding: 1rem;
            }
        }

        .card-header h2 {
            font-size: 1.25rem;
            color: var(--accent-cyan);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .card-content {
            padding: 1.5rem;
        }

        @media (max-width: 600px) {
            .card-content {
                padding: 1rem;
            }
        }

        .card-content p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
        }

        .image-placeholder {
            width: 100%;
            background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 1rem 0;
            overflow: hidden;
        }

        @media (max-width: 600px) {
            .image-placeholder {
                border-radius: 0;
                margin: 1rem -1rem;
                width: calc(100% + 2rem);
            }
        }

        .image-placeholder img {
            width: 100%;
            height: auto;
            display: block;
        }

        .info-box {
            background: rgba(0, 240, 255, 0.1);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .info-box {
                border-radius: 4px;
            }
        }

        .info-box.warning {
            background: rgba(255, 189, 89, 0.1);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .info-box.success {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .info-box.danger {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
        }

        .info-box-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .info-box.warning .info-box-title {
            color: var(--accent-gold);
        }

        .info-box.success .info-box-title {
            color: var(--success-green);
        }

        .info-box.danger .info-box-title {
            color: var(--danger-red);
        }

        .styled-list {
            list-style: none;
            padding: 0;
        }

        .styled-list li {
            padding: 0.75rem 0;
            padding-left: 2rem;
            position: relative;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            color: var(--text-secondary);
        }

        .styled-list li:last-child {
            border-bottom: none;
        }

        .styled-list li::before {
            content: ''→'';
            position: absolute;
            left: 0;
            color: var(--accent-cyan);
            font-weight: bold;
        }

        /* Trading Style Table */
        .style-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }

        .style-table th,
        .style-table td {
            padding: 0.75rem;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.1);
        }

        .style-table th {
            background: rgba(0, 240, 255, 0.1);
            color: var(--accent-cyan);
            font-weight: 600;
        }

        .style-table td {
            background: var(--bg-card);
            color: var(--text-secondary);
        }

        .style-table tr:hover td {
            background: var(--bg-card-hover);
        }

        @media (max-width: 600px) {
            .style-table {
                font-size: 0.85rem;
            }
            .style-table th,
            .style-table td {
                padding: 0.5rem;
            }
        }

        /* TF Combo Cards */
        .combo-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .combo-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: rgba(255,255,255,0.1);
                margin: 1rem -1rem;
                width: calc(100% + 2rem);
            }
        }

        .combo-card {
            background: rgba(106, 91, 255, 0.1);
            border: 1px solid rgba(106, 91, 255, 0.3);
            border-radius: 12px;
            padding: 1.25rem;
        }

        @media (max-width: 600px) {
            .combo-card {
                border-radius: 0;
                border: none;
                background: var(--bg-card);
            }
        }

        .combo-card.recommended {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .combo-title {
            font-weight: 700;
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .combo-card.recommended .combo-title {
            color: var(--success-green);
        }

        .combo-tf {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 0.75rem 0;
            padding: 0.75rem;
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
        }

        .combo-tf span {
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-weight: 600;
            font-size: 0.85rem;
        }

        .tf-htf { background: rgba(106, 91, 255, 0.3); color: var(--accent-purple); }
        .tf-itf { background: rgba(0, 240, 255, 0.3); color: var(--accent-cyan); }
        .tf-ltf { background: rgba(16, 185, 129, 0.3); color: var(--success-green); }

        .combo-arrow {
            color: var(--accent-gold);
        }

        .combo-desc {
            font-size: 0.9rem;
            color: var(--text-secondary);
        }

        /* Summary Box */
        .summary-box {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(106, 91, 255, 0.1) 100%);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                margin: 1.5rem 0;
                border-left: 4px solid var(--accent-cyan);
                border-right: none;
                border-top: none;
                border-bottom: none;
            }
        }

        .summary-box h3 {
            color: var(--accent-cyan);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-list {
            list-style: none;
            padding: 0;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-list li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--success-green);
        }

        /* Quiz Section */
        .quiz-section {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                padding: 1rem;
                margin-top: 1rem;
            }
        }

        .quiz-section h3 {
            color: var(--accent-gold);
            margin-bottom: 1.5rem;
        }

        .quiz-question {
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }

        .quiz-option:hover {
            background: rgba(255,255,255,0.1);
            border-color: var(--accent-cyan);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--success-green);
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: var(--danger-red);
        }

        .quiz-result {
            padding: 1rem;
            border-radius: 8px;
            margin-top: 0.5rem;
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
            color: var(--danger-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(106, 91, 255, 0.1) 100%);
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .score-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--accent-cyan);
        }

        .score-label {
            color: var(--text-secondary);
        }

        .btn-retake {
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            cursor: pointer;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .highlight {
            color: var(--accent-cyan);
            font-weight: 600;
        }

        .highlight-gold {
            color: var(--accent-gold);
            font-weight: 600;
        }

        .highlight-green {
            color: var(--success-green);
            font-weight: 600;
        }

        .highlight-purple {
            color: var(--accent-purple);
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="header-badge">📊 Tier 2 - Bài 4.2</span>
            <h1 class="lesson-title">Hệ Thống 3 Khung Thời Gian</h1>
            <p class="lesson-subtitle">Choosing the Right Timeframe Combinations</p>
        </header>

        <!-- Section 1: Tỷ Lệ Giữa Các Khung -->
        <div class="content-card">
            <div class="card-header">
                <h2>📐 Tỷ Lệ Chuẩn Giữa Các Khung Thời Gian</h2>
            </div>
            <div class="card-content">
                <p>Để Multi-Timeframe Analysis hiệu quả, các khung thời gian cần có <span class="highlight">tỷ lệ phù hợp</span>. GEM khuyến nghị:</p>

                <div class="info-box success">
                    <div class="info-box-title">✅ Tỷ Lệ Vàng: 4x - 6x</div>
                    <p>Mỗi khung nên gấp 4-6 lần khung kế tiếp. Ví dụ: Daily (24h) → 4H (4h) → 1H (1h) có tỷ lệ 6:4:1</p>
                </div>

                <ul class="styled-list">
                    <li><strong>Quá gần nhau (2x):</strong> Thông tin trùng lặp, không có thêm insight</li>
                    <li><strong>Quá xa nhau (10x+):</strong> Bỏ sót thông tin quan trọng ở giữa</li>
                    <li><strong>Tỷ lệ 4-6x:</strong> Cân bằng tốt giữa chi tiết và bức tranh lớn</li>
                </ul>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/00F0FF?text=Timeframe+Ratio+4x-6x" alt="Timeframe Ratio">
                </div>
            </div>
        </div>

        <!-- Section 2: Combo Theo Style -->
        <div class="content-card">
            <div class="card-header">
                <h2>🎯 Combo Khung Thời Gian Theo Style</h2>
            </div>
            <div class="card-content">
                <p>Chọn combo phù hợp với <span class="highlight">trading style</span> của bạn:</p>

                <table class="style-table">
                    <thead>
                        <tr>
                            <th>Style</th>
                            <th>HTF</th>
                            <th>ITF</th>
                            <th>LTF</th>
                            <th>Hold Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Scalping</strong></td>
                            <td>1H</td>
                            <td>15M</td>
                            <td>5M</td>
                            <td>5-30 phút</td>
                        </tr>
                        <tr>
                            <td><strong>Day Trade</strong></td>
                            <td>4H</td>
                            <td>1H</td>
                            <td>15M</td>
                            <td>1-8 giờ</td>
                        </tr>
                        <tr>
                            <td><strong>Swing Trade</strong></td>
                            <td>Daily</td>
                            <td>4H</td>
                            <td>1H</td>
                            <td>2-10 ngày</td>
                        </tr>
                        <tr>
                            <td><strong>Position</strong></td>
                            <td>Weekly</td>
                            <td>Daily</td>
                            <td>4H</td>
                            <td>2-8 tuần</td>
                        </tr>
                    </tbody>
                </table>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Lưu Ý Quan Trọng</div>
                    <p>Một khi đã chọn combo, <strong>KHÔNG thay đổi</strong> giữa chừng. Nhất quán là chìa khóa thành công.</p>
                </div>
            </div>
        </div>

        <!-- Section 3: Swing Trade Combo -->
        <div class="content-card">
            <div class="card-header">
                <h2>📈 Combo Swing Trade (Khuyến Nghị)</h2>
            </div>
            <div class="card-content">
                <p>GEM khuyến nghị <span class="highlight-green">Swing Trade</span> combo cho đa số trader vì:</p>

                <div class="combo-grid">
                    <div class="combo-card recommended">
                        <div class="combo-title">⭐ Daily → 4H → 1H</div>
                        <div class="combo-tf">
                            <span class="tf-htf">D1</span>
                            <span class="combo-arrow">→</span>
                            <span class="tf-itf">4H</span>
                            <span class="combo-arrow">→</span>
                            <span class="tf-ltf">1H</span>
                        </div>
                        <div class="combo-desc">Phù hợp crypto 24/7, cân bằng giữa tần suất trade và chất lượng setup</div>
                    </div>
                    <div class="combo-card">
                        <div class="combo-title">📊 4H → 1H → 15M</div>
                        <div class="combo-tf">
                            <span class="tf-htf">4H</span>
                            <span class="combo-arrow">→</span>
                            <span class="tf-itf">1H</span>
                            <span class="combo-arrow">→</span>
                            <span class="tf-ltf">15M</span>
                        </div>
                        <div class="combo-desc">Active swing, nhiều cơ hội hơn nhưng cần theo dõi thường xuyên hơn</div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/10B981?text=D1+4H+1H+Combo+Example" alt="Swing Trade Combo">
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Tại Sao Daily-4H-1H?</div>
                    <ul class="styled-list">
                        <li>D1 cho trend rõ ràng, ít noise</li>
                        <li>4H đủ chi tiết để vẽ zone chính xác</li>
                        <li>1H cho entry trigger không quá nhanh</li>
                        <li>Phù hợp với người đi làm, check chart 2-3 lần/ngày</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Section 4: Day Trade Combo -->
        <div class="content-card">
            <div class="card-header">
                <h2>⚡ Combo Day Trade</h2>
            </div>
            <div class="card-content">
                <p>Cho trader có thể <span class="highlight">theo dõi chart liên tục</span>:</p>

                <div class="combo-grid">
                    <div class="combo-card">
                        <div class="combo-title">📊 4H → 1H → 15M</div>
                        <div class="combo-tf">
                            <span class="tf-htf">4H</span>
                            <span class="combo-arrow">→</span>
                            <span class="tf-itf">1H</span>
                            <span class="combo-arrow">→</span>
                            <span class="tf-ltf">15M</span>
                        </div>
                        <div class="combo-desc">Standard day trade, 2-5 setups/ngày</div>
                    </div>
                    <div class="combo-card">
                        <div class="combo-title">📈 1H → 30M → 5M</div>
                        <div class="combo-tf">
                            <span class="tf-htf">1H</span>
                            <span class="combo-arrow">→</span>
                            <span class="tf-itf">30M</span>
                            <span class="combo-arrow">→</span>
                            <span class="tf-ltf">5M</span>
                        </div>
                        <div class="combo-desc">Active day trade, nhiều cơ hội nhưng cần experience</div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/00F0FF?text=4H+1H+15M+Day+Trade" alt="Day Trade Combo">
                </div>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Yêu Cầu Day Trade</div>
                    <ul class="styled-list">
                        <li>Cần online 4-8 giờ/ngày</li>
                        <li>Phản ứng nhanh với market</li>
                        <li>Quản lý emotion tốt (nhiều trade/ngày)</li>
                        <li>Không phù hợp với người đi làm full-time</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Section 5: Workflow -->
        <div class="content-card">
            <div class="card-header">
                <h2>🔄 Workflow Phân Tích 3 Khung</h2>
            </div>
            <div class="card-content">
                <p>Quy trình <span class="highlight">step-by-step</span> khi phân tích:</p>

                <div class="info-box">
                    <div class="info-box-title" style="color: var(--accent-purple);">Step 1: HTF Analysis</div>
                    <ul class="styled-list">
                        <li>Mở chart HTF (Daily)</li>
                        <li>Xác định trend: Uptrend / Downtrend / Sideway</li>
                        <li>Đánh dấu key level quan trọng</li>
                        <li>Quyết định bias: Long only / Short only / No trade</li>
                    </ul>
                </div>

                <div class="info-box">
                    <div class="info-box-title" style="color: var(--accent-cyan);">Step 2: ITF Analysis</div>
                    <ul class="styled-list">
                        <li>Chuyển sang ITF (4H)</li>
                        <li>Vẽ GEM Zones (HFZ / LFZ)</li>
                        <li>Xác định zone lifecycle (Fresh / Tested)</li>
                        <li>Tìm pattern đang hình thành</li>
                    </ul>
                </div>

                <div class="info-box">
                    <div class="info-box-title" style="color: var(--success-green);">Step 3: LTF Entry</div>
                    <ul class="styled-list">
                        <li>Đợi giá về zone trên ITF</li>
                        <li>Chuyển sang LTF (1H)</li>
                        <li>Tìm confirmation candle / pattern</li>
                        <li>Đặt entry, stoploss, take profit</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x450/112250/FFBD59?text=3-Step+MTF+Workflow" alt="MTF Workflow">
                </div>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Tỷ lệ chuẩn giữa các khung: <strong>4x - 6x</strong></li>
                <li><strong>Swing Trade:</strong> Daily → 4H → 1H (khuyến nghị)</li>
                <li><strong>Day Trade:</strong> 4H → 1H → 15M</li>
                <li>Chọn combo phù hợp với lifestyle và <strong>không thay đổi</strong></li>
                <li>Luôn tuân theo workflow: <strong>HTF → ITF → LTF</strong></li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="1">
                <p>1. Tỷ lệ chuẩn giữa các khung thời gian trong MTF là bao nhiêu?</p>
                <button class="quiz-option" data-index="0">2x - 3x</button>
                <button class="quiz-option" data-index="1">4x - 6x</button>
                <button class="quiz-option" data-index="2">8x - 10x</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p>2. Combo nào được GEM khuyến nghị cho đa số trader?</p>
                <button class="quiz-option" data-index="0">1H → 15M → 5M (Scalping)</button>
                <button class="quiz-option" data-index="1">4H → 1H → 15M (Day Trade)</button>
                <button class="quiz-option" data-index="2">Daily → 4H → 1H (Swing Trade)</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p>3. Trong workflow 3 bước, bước nào đầu tiên?</p>
                <button class="quiz-option" data-index="0">HTF Analysis - xác định trend và bias</button>
                <button class="quiz-option" data-index="1">ITF Analysis - vẽ GEM Zones</button>
                <button class="quiz-option" data-index="2">LTF Entry - tìm confirmation</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-number"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="btn-retake" onclick="retakeQuiz()">Làm Lại Quiz</button>
            </div>
        </div>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 2</p>
            <p>© 2025 GEM Frequency Trading Method</p>
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

        function retakeQuiz() {
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
    <title>Bài 4.2: Hệ Thống 3 Khung Thời Gian - Tier 2</title>
    <style>
        :root {
            --primary-navy: #112250;
            --accent-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --danger-red: #EF4444;
            --text-primary: #FFFFFF;
            --text-secondary: #A0AEC0;
            --bg-dark: #0a0a0f;
            --bg-card: #1a1a2e;
            --bg-card-hover: #252540;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1rem;
        }

        @media (max-width: 600px) {
            .lesson-container {
                padding: 0;
            }
        }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem;
            margin-bottom: 1.5rem;
            border-radius: 16px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                padding: 1.5rem 1rem;
            }
        }

        .lesson-header::before {
            content: '''';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url(''data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="%23FFBD59" opacity="0.3"/><circle cx="80" cy="40" r="1.5" fill="%2300F0FF" opacity="0.3"/><circle cx="40" cy="70" r="1" fill="%236A5BFF" opacity="0.3"/></svg>'');
            opacity: 0.5;
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%);
            color: white;
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
        }

        .lesson-subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
            position: relative;
            z-index: 1;
        }

        .content-card {
            background: var(--bg-card);
            border-radius: 12px;
            margin-bottom: 1.5rem;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .content-card {
                border-radius: 0;
                border-left: 4px solid var(--accent-cyan);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
        }

        .card-header {
            background: rgba(0, 240, 255, 0.1);
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .card-header {
                padding: 1rem;
            }
        }

        .card-header h2 {
            font-size: 1.25rem;
            color: var(--accent-cyan);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .card-content {
            padding: 1.5rem;
        }

        @media (max-width: 600px) {
            .card-content {
                padding: 1rem;
            }
        }

        .card-content p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
        }

        .image-placeholder {
            width: 100%;
            background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 1rem 0;
            overflow: hidden;
        }

        @media (max-width: 600px) {
            .image-placeholder {
                border-radius: 0;
                margin: 1rem -1rem;
                width: calc(100% + 2rem);
            }
        }

        .image-placeholder img {
            width: 100%;
            height: auto;
            display: block;
        }

        .info-box {
            background: rgba(0, 240, 255, 0.1);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .info-box {
                border-radius: 4px;
            }
        }

        .info-box.warning {
            background: rgba(255, 189, 89, 0.1);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .info-box.success {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .info-box.danger {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
        }

        .info-box-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .info-box.warning .info-box-title {
            color: var(--accent-gold);
        }

        .info-box.success .info-box-title {
            color: var(--success-green);
        }

        .info-box.danger .info-box-title {
            color: var(--danger-red);
        }

        .styled-list {
            list-style: none;
            padding: 0;
        }

        .styled-list li {
            padding: 0.75rem 0;
            padding-left: 2rem;
            position: relative;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            color: var(--text-secondary);
        }

        .styled-list li:last-child {
            border-bottom: none;
        }

        .styled-list li::before {
            content: ''→'';
            position: absolute;
            left: 0;
            color: var(--accent-cyan);
            font-weight: bold;
        }

        /* Trading Style Table */
        .style-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }

        .style-table th,
        .style-table td {
            padding: 0.75rem;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.1);
        }

        .style-table th {
            background: rgba(0, 240, 255, 0.1);
            color: var(--accent-cyan);
            font-weight: 600;
        }

        .style-table td {
            background: var(--bg-card);
            color: var(--text-secondary);
        }

        .style-table tr:hover td {
            background: var(--bg-card-hover);
        }

        @media (max-width: 600px) {
            .style-table {
                font-size: 0.85rem;
            }
            .style-table th,
            .style-table td {
                padding: 0.5rem;
            }
        }

        /* TF Combo Cards */
        .combo-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .combo-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: rgba(255,255,255,0.1);
                margin: 1rem -1rem;
                width: calc(100% + 2rem);
            }
        }

        .combo-card {
            background: rgba(106, 91, 255, 0.1);
            border: 1px solid rgba(106, 91, 255, 0.3);
            border-radius: 12px;
            padding: 1.25rem;
        }

        @media (max-width: 600px) {
            .combo-card {
                border-radius: 0;
                border: none;
                background: var(--bg-card);
            }
        }

        .combo-card.recommended {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .combo-title {
            font-weight: 700;
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .combo-card.recommended .combo-title {
            color: var(--success-green);
        }

        .combo-tf {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 0.75rem 0;
            padding: 0.75rem;
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
        }

        .combo-tf span {
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-weight: 600;
            font-size: 0.85rem;
        }

        .tf-htf { background: rgba(106, 91, 255, 0.3); color: var(--accent-purple); }
        .tf-itf { background: rgba(0, 240, 255, 0.3); color: var(--accent-cyan); }
        .tf-ltf { background: rgba(16, 185, 129, 0.3); color: var(--success-green); }

        .combo-arrow {
            color: var(--accent-gold);
        }

        .combo-desc {
            font-size: 0.9rem;
            color: var(--text-secondary);
        }

        /* Summary Box */
        .summary-box {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(106, 91, 255, 0.1) 100%);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                margin: 1.5rem 0;
                border-left: 4px solid var(--accent-cyan);
                border-right: none;
                border-top: none;
                border-bottom: none;
            }
        }

        .summary-box h3 {
            color: var(--accent-cyan);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-list {
            list-style: none;
            padding: 0;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-list li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--success-green);
        }

        /* Quiz Section */
        .quiz-section {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                padding: 1rem;
                margin-top: 1rem;
            }
        }

        .quiz-section h3 {
            color: var(--accent-gold);
            margin-bottom: 1.5rem;
        }

        .quiz-question {
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }

        .quiz-option:hover {
            background: rgba(255,255,255,0.1);
            border-color: var(--accent-cyan);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--success-green);
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: var(--danger-red);
        }

        .quiz-result {
            padding: 1rem;
            border-radius: 8px;
            margin-top: 0.5rem;
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
            color: var(--danger-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(106, 91, 255, 0.1) 100%);
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .score-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--accent-cyan);
        }

        .score-label {
            color: var(--text-secondary);
        }

        .btn-retake {
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            cursor: pointer;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .highlight {
            color: var(--accent-cyan);
            font-weight: 600;
        }

        .highlight-gold {
            color: var(--accent-gold);
            font-weight: 600;
        }

        .highlight-green {
            color: var(--success-green);
            font-weight: 600;
        }

        .highlight-purple {
            color: var(--accent-purple);
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="header-badge">📊 Tier 2 - Bài 4.2</span>
            <h1 class="lesson-title">Hệ Thống 3 Khung Thời Gian</h1>
            <p class="lesson-subtitle">Choosing the Right Timeframe Combinations</p>
        </header>

        <!-- Section 1: Tỷ Lệ Giữa Các Khung -->
        <div class="content-card">
            <div class="card-header">
                <h2>📐 Tỷ Lệ Chuẩn Giữa Các Khung Thời Gian</h2>
            </div>
            <div class="card-content">
                <p>Để Multi-Timeframe Analysis hiệu quả, các khung thời gian cần có <span class="highlight">tỷ lệ phù hợp</span>. GEM khuyến nghị:</p>

                <div class="info-box success">
                    <div class="info-box-title">✅ Tỷ Lệ Vàng: 4x - 6x</div>
                    <p>Mỗi khung nên gấp 4-6 lần khung kế tiếp. Ví dụ: Daily (24h) → 4H (4h) → 1H (1h) có tỷ lệ 6:4:1</p>
                </div>

                <ul class="styled-list">
                    <li><strong>Quá gần nhau (2x):</strong> Thông tin trùng lặp, không có thêm insight</li>
                    <li><strong>Quá xa nhau (10x+):</strong> Bỏ sót thông tin quan trọng ở giữa</li>
                    <li><strong>Tỷ lệ 4-6x:</strong> Cân bằng tốt giữa chi tiết và bức tranh lớn</li>
                </ul>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/00F0FF?text=Timeframe+Ratio+4x-6x" alt="Timeframe Ratio">
                </div>
            </div>
        </div>

        <!-- Section 2: Combo Theo Style -->
        <div class="content-card">
            <div class="card-header">
                <h2>🎯 Combo Khung Thời Gian Theo Style</h2>
            </div>
            <div class="card-content">
                <p>Chọn combo phù hợp với <span class="highlight">trading style</span> của bạn:</p>

                <table class="style-table">
                    <thead>
                        <tr>
                            <th>Style</th>
                            <th>HTF</th>
                            <th>ITF</th>
                            <th>LTF</th>
                            <th>Hold Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Scalping</strong></td>
                            <td>1H</td>
                            <td>15M</td>
                            <td>5M</td>
                            <td>5-30 phút</td>
                        </tr>
                        <tr>
                            <td><strong>Day Trade</strong></td>
                            <td>4H</td>
                            <td>1H</td>
                            <td>15M</td>
                            <td>1-8 giờ</td>
                        </tr>
                        <tr>
                            <td><strong>Swing Trade</strong></td>
                            <td>Daily</td>
                            <td>4H</td>
                            <td>1H</td>
                            <td>2-10 ngày</td>
                        </tr>
                        <tr>
                            <td><strong>Position</strong></td>
                            <td>Weekly</td>
                            <td>Daily</td>
                            <td>4H</td>
                            <td>2-8 tuần</td>
                        </tr>
                    </tbody>
                </table>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Lưu Ý Quan Trọng</div>
                    <p>Một khi đã chọn combo, <strong>KHÔNG thay đổi</strong> giữa chừng. Nhất quán là chìa khóa thành công.</p>
                </div>
            </div>
        </div>

        <!-- Section 3: Swing Trade Combo -->
        <div class="content-card">
            <div class="card-header">
                <h2>📈 Combo Swing Trade (Khuyến Nghị)</h2>
            </div>
            <div class="card-content">
                <p>GEM khuyến nghị <span class="highlight-green">Swing Trade</span> combo cho đa số trader vì:</p>

                <div class="combo-grid">
                    <div class="combo-card recommended">
                        <div class="combo-title">⭐ Daily → 4H → 1H</div>
                        <div class="combo-tf">
                            <span class="tf-htf">D1</span>
                            <span class="combo-arrow">→</span>
                            <span class="tf-itf">4H</span>
                            <span class="combo-arrow">→</span>
                            <span class="tf-ltf">1H</span>
                        </div>
                        <div class="combo-desc">Phù hợp crypto 24/7, cân bằng giữa tần suất trade và chất lượng setup</div>
                    </div>
                    <div class="combo-card">
                        <div class="combo-title">📊 4H → 1H → 15M</div>
                        <div class="combo-tf">
                            <span class="tf-htf">4H</span>
                            <span class="combo-arrow">→</span>
                            <span class="tf-itf">1H</span>
                            <span class="combo-arrow">→</span>
                            <span class="tf-ltf">15M</span>
                        </div>
                        <div class="combo-desc">Active swing, nhiều cơ hội hơn nhưng cần theo dõi thường xuyên hơn</div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/10B981?text=D1+4H+1H+Combo+Example" alt="Swing Trade Combo">
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Tại Sao Daily-4H-1H?</div>
                    <ul class="styled-list">
                        <li>D1 cho trend rõ ràng, ít noise</li>
                        <li>4H đủ chi tiết để vẽ zone chính xác</li>
                        <li>1H cho entry trigger không quá nhanh</li>
                        <li>Phù hợp với người đi làm, check chart 2-3 lần/ngày</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Section 4: Day Trade Combo -->
        <div class="content-card">
            <div class="card-header">
                <h2>⚡ Combo Day Trade</h2>
            </div>
            <div class="card-content">
                <p>Cho trader có thể <span class="highlight">theo dõi chart liên tục</span>:</p>

                <div class="combo-grid">
                    <div class="combo-card">
                        <div class="combo-title">📊 4H → 1H → 15M</div>
                        <div class="combo-tf">
                            <span class="tf-htf">4H</span>
                            <span class="combo-arrow">→</span>
                            <span class="tf-itf">1H</span>
                            <span class="combo-arrow">→</span>
                            <span class="tf-ltf">15M</span>
                        </div>
                        <div class="combo-desc">Standard day trade, 2-5 setups/ngày</div>
                    </div>
                    <div class="combo-card">
                        <div class="combo-title">📈 1H → 30M → 5M</div>
                        <div class="combo-tf">
                            <span class="tf-htf">1H</span>
                            <span class="combo-arrow">→</span>
                            <span class="tf-itf">30M</span>
                            <span class="combo-arrow">→</span>
                            <span class="tf-ltf">5M</span>
                        </div>
                        <div class="combo-desc">Active day trade, nhiều cơ hội nhưng cần experience</div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/00F0FF?text=4H+1H+15M+Day+Trade" alt="Day Trade Combo">
                </div>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Yêu Cầu Day Trade</div>
                    <ul class="styled-list">
                        <li>Cần online 4-8 giờ/ngày</li>
                        <li>Phản ứng nhanh với market</li>
                        <li>Quản lý emotion tốt (nhiều trade/ngày)</li>
                        <li>Không phù hợp với người đi làm full-time</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Section 5: Workflow -->
        <div class="content-card">
            <div class="card-header">
                <h2>🔄 Workflow Phân Tích 3 Khung</h2>
            </div>
            <div class="card-content">
                <p>Quy trình <span class="highlight">step-by-step</span> khi phân tích:</p>

                <div class="info-box">
                    <div class="info-box-title" style="color: var(--accent-purple);">Step 1: HTF Analysis</div>
                    <ul class="styled-list">
                        <li>Mở chart HTF (Daily)</li>
                        <li>Xác định trend: Uptrend / Downtrend / Sideway</li>
                        <li>Đánh dấu key level quan trọng</li>
                        <li>Quyết định bias: Long only / Short only / No trade</li>
                    </ul>
                </div>

                <div class="info-box">
                    <div class="info-box-title" style="color: var(--accent-cyan);">Step 2: ITF Analysis</div>
                    <ul class="styled-list">
                        <li>Chuyển sang ITF (4H)</li>
                        <li>Vẽ GEM Zones (HFZ / LFZ)</li>
                        <li>Xác định zone lifecycle (Fresh / Tested)</li>
                        <li>Tìm pattern đang hình thành</li>
                    </ul>
                </div>

                <div class="info-box">
                    <div class="info-box-title" style="color: var(--success-green);">Step 3: LTF Entry</div>
                    <ul class="styled-list">
                        <li>Đợi giá về zone trên ITF</li>
                        <li>Chuyển sang LTF (1H)</li>
                        <li>Tìm confirmation candle / pattern</li>
                        <li>Đặt entry, stoploss, take profit</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x450/112250/FFBD59?text=3-Step+MTF+Workflow" alt="MTF Workflow">
                </div>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Tỷ lệ chuẩn giữa các khung: <strong>4x - 6x</strong></li>
                <li><strong>Swing Trade:</strong> Daily → 4H → 1H (khuyến nghị)</li>
                <li><strong>Day Trade:</strong> 4H → 1H → 15M</li>
                <li>Chọn combo phù hợp với lifestyle và <strong>không thay đổi</strong></li>
                <li>Luôn tuân theo workflow: <strong>HTF → ITF → LTF</strong></li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="1">
                <p>1. Tỷ lệ chuẩn giữa các khung thời gian trong MTF là bao nhiêu?</p>
                <button class="quiz-option" data-index="0">2x - 3x</button>
                <button class="quiz-option" data-index="1">4x - 6x</button>
                <button class="quiz-option" data-index="2">8x - 10x</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p>2. Combo nào được GEM khuyến nghị cho đa số trader?</p>
                <button class="quiz-option" data-index="0">1H → 15M → 5M (Scalping)</button>
                <button class="quiz-option" data-index="1">4H → 1H → 15M (Day Trade)</button>
                <button class="quiz-option" data-index="2">Daily → 4H → 1H (Swing Trade)</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p>3. Trong workflow 3 bước, bước nào đầu tiên?</p>
                <button class="quiz-option" data-index="0">HTF Analysis - xác định trend và bias</button>
                <button class="quiz-option" data-index="1">ITF Analysis - vẽ GEM Zones</button>
                <button class="quiz-option" data-index="2">LTF Entry - tìm confirmation</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-number"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="btn-retake" onclick="retakeQuiz()">Làm Lại Quiz</button>
            </div>
        </div>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 2</p>
            <p>© 2025 GEM Frequency Trading Method</p>
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

        function retakeQuiz() {
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

-- Lesson 4.3: Zone Hierarchy - Tier 2
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch4-l3',
  'module-tier-2-ch4',
  'course-tier2-trading-advanced',
  'Bài 4.3: Zone Hierarchy - Tier 2',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 4.3: Zone Hierarchy - Tier 2</title>
    <style>
        :root {
            --primary-navy: #112250;
            --accent-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --danger-red: #EF4444;
            --text-primary: #FFFFFF;
            --text-secondary: #A0AEC0;
            --bg-dark: #0a0a0f;
            --bg-card: #1a1a2e;
            --bg-card-hover: #252540;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1rem;
        }

        @media (max-width: 600px) {
            .lesson-container {
                padding: 0;
            }
        }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem;
            margin-bottom: 1.5rem;
            border-radius: 16px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                padding: 1.5rem 1rem;
            }
        }

        .lesson-header::before {
            content: '''';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url(''data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="%23FFBD59" opacity="0.3"/><circle cx="80" cy="40" r="1.5" fill="%2300F0FF" opacity="0.3"/><circle cx="40" cy="70" r="1" fill="%236A5BFF" opacity="0.3"/></svg>'');
            opacity: 0.5;
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--accent-gold) 0%, #FFD700 100%);
            color: #112250;
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
        }

        .lesson-subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
            position: relative;
            z-index: 1;
        }

        .content-card {
            background: var(--bg-card);
            border-radius: 12px;
            margin-bottom: 1.5rem;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .content-card {
                border-radius: 0;
                border-left: 4px solid var(--accent-gold);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
        }

        .card-header {
            background: rgba(255, 189, 89, 0.1);
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .card-header {
                padding: 1rem;
            }
        }

        .card-header h2 {
            font-size: 1.25rem;
            color: var(--accent-gold);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .card-content {
            padding: 1.5rem;
        }

        @media (max-width: 600px) {
            .card-content {
                padding: 1rem;
            }
        }

        .card-content p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
        }

        .image-placeholder {
            width: 100%;
            background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 1rem 0;
            overflow: hidden;
        }

        @media (max-width: 600px) {
            .image-placeholder {
                border-radius: 0;
                margin: 1rem -1rem;
                width: calc(100% + 2rem);
            }
        }

        .image-placeholder img {
            width: 100%;
            height: auto;
            display: block;
        }

        .info-box {
            background: rgba(255, 189, 89, 0.1);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .info-box {
                border-radius: 4px;
            }
        }

        .info-box.warning {
            background: rgba(255, 189, 89, 0.1);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .info-box.success {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .info-box.danger {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
        }

        .info-box.cyan {
            background: rgba(0, 240, 255, 0.1);
            border-color: rgba(0, 240, 255, 0.3);
        }

        .info-box-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .info-box.warning .info-box-title {
            color: var(--accent-gold);
        }

        .info-box.success .info-box-title {
            color: var(--success-green);
        }

        .info-box.danger .info-box-title {
            color: var(--danger-red);
        }

        .info-box.cyan .info-box-title {
            color: var(--accent-cyan);
        }

        .styled-list {
            list-style: none;
            padding: 0;
        }

        .styled-list li {
            padding: 0.75rem 0;
            padding-left: 2rem;
            position: relative;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            color: var(--text-secondary);
        }

        .styled-list li:last-child {
            border-bottom: none;
        }

        .styled-list li::before {
            content: ''→'';
            position: absolute;
            left: 0;
            color: var(--accent-gold);
            font-weight: bold;
        }

        /* Hierarchy Pyramid */
        .hierarchy-pyramid {
            margin: 1.5rem 0;
            text-align: center;
        }

        .pyramid-level {
            margin: 0.5rem auto;
            padding: 1rem;
            border-radius: 8px;
            font-weight: 600;
        }

        .pyramid-level.htf {
            width: 50%;
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.3) 0%, rgba(106, 91, 255, 0.1) 100%);
            border: 2px solid var(--accent-purple);
            color: var(--accent-purple);
        }

        .pyramid-level.itf {
            width: 70%;
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.3) 0%, rgba(0, 240, 255, 0.1) 100%);
            border: 2px solid var(--accent-cyan);
            color: var(--accent-cyan);
        }

        .pyramid-level.ltf {
            width: 90%;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 100%);
            border: 2px solid var(--success-green);
            color: var(--success-green);
        }

        @media (max-width: 600px) {
            .pyramid-level.htf { width: 70%; }
            .pyramid-level.itf { width: 85%; }
            .pyramid-level.ltf { width: 100%; }
        }

        .pyramid-label {
            font-size: 0.85rem;
            color: var(--text-secondary);
            font-weight: normal;
        }

        /* Zone Strength Cards */
        .strength-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .strength-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: rgba(255,255,255,0.1);
                margin: 1rem -1rem;
                width: calc(100% + 2rem);
            }
        }

        .strength-card {
            background: var(--bg-card-hover);
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
        }

        @media (max-width: 600px) {
            .strength-card {
                border-radius: 0;
            }
        }

        .strength-card.high {
            border-left: 4px solid var(--accent-purple);
        }

        .strength-card.medium {
            border-left: 4px solid var(--accent-cyan);
        }

        .strength-card.low {
            border-left: 4px solid var(--success-green);
        }

        .strength-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        .strength-title {
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .strength-card.high .strength-title { color: var(--accent-purple); }
        .strength-card.medium .strength-title { color: var(--accent-cyan); }
        .strength-card.low .strength-title { color: var(--success-green); }

        .strength-score {
            font-size: 1.5rem;
            font-weight: 700;
        }

        .strength-desc {
            font-size: 0.85rem;
            color: var(--text-secondary);
        }

        /* Comparison Table */
        .compare-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }

        .compare-table th,
        .compare-table td {
            padding: 0.75rem;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.1);
        }

        .compare-table th {
            background: rgba(255, 189, 89, 0.1);
            color: var(--accent-gold);
            font-weight: 600;
        }

        .compare-table td {
            background: var(--bg-card);
            color: var(--text-secondary);
        }

        @media (max-width: 600px) {
            .compare-table {
                font-size: 0.85rem;
            }
            .compare-table th,
            .compare-table td {
                padding: 0.5rem;
            }
        }

        /* Summary Box */
        .summary-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.1) 0%, rgba(106, 91, 255, 0.1) 100%);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                margin: 1.5rem 0;
                border-left: 4px solid var(--accent-gold);
                border-right: none;
                border-top: none;
                border-bottom: none;
            }
        }

        .summary-box h3 {
            color: var(--accent-gold);
            margin-bottom: 1rem;
        }

        .summary-list {
            list-style: none;
            padding: 0;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-list li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--success-green);
        }

        /* Quiz Section */
        .quiz-section {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                padding: 1rem;
                margin-top: 1rem;
            }
        }

        .quiz-section h3 {
            color: var(--accent-gold);
            margin-bottom: 1.5rem;
        }

        .quiz-question {
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }

        .quiz-option:hover {
            background: rgba(255,255,255,0.1);
            border-color: var(--accent-gold);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--success-green);
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: var(--danger-red);
        }

        .quiz-result {
            padding: 1rem;
            border-radius: 8px;
            margin-top: 0.5rem;
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
            color: var(--danger-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.1) 0%, rgba(106, 91, 255, 0.1) 100%);
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .score-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .score-label {
            color: var(--text-secondary);
        }

        .btn-retake {
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--accent-gold) 0%, #FFD700 100%);
            border: none;
            border-radius: 8px;
            color: #112250;
            font-weight: 600;
            cursor: pointer;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .highlight {
            color: var(--accent-cyan);
            font-weight: 600;
        }

        .highlight-gold {
            color: var(--accent-gold);
            font-weight: 600;
        }

        .highlight-green {
            color: var(--success-green);
            font-weight: 600;
        }

        .highlight-purple {
            color: var(--accent-purple);
            font-weight: 600;
        }

        .highlight-red {
            color: var(--danger-red);
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="header-badge">📊 Tier 2 - Bài 4.3</span>
            <h1 class="lesson-title">Zone Hierarchy</h1>
            <p class="lesson-subtitle">Zone Strength Based on Timeframe</p>
        </header>

        <!-- Section 1: Zone Hierarchy Concept -->
        <div class="content-card">
            <div class="card-header">
                <h2>👑 Zone Hierarchy Là Gì?</h2>
            </div>
            <div class="card-content">
                <p><span class="highlight-gold">Zone Hierarchy</span> = Hệ thống phân cấp sức mạnh của zone dựa trên khung thời gian. Không phải tất cả zone đều có giá trị như nhau!</p>

                <div class="hierarchy-pyramid">
                    <div class="pyramid-level htf">
                        👑 HTF ZONE (Daily+)
                        <div class="pyramid-label">Strongest - Respected Most</div>
                    </div>
                    <div class="pyramid-level itf">
                        ⭐ ITF ZONE (4H)
                        <div class="pyramid-label">Medium - Good for Trading</div>
                    </div>
                    <div class="pyramid-level ltf">
                        📍 LTF ZONE (1H)
                        <div class="pyramid-label">Weak - Entry Refinement Only</div>
                    </div>
                </div>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Quy Tắc Quan Trọng</div>
                    <p><strong>Zone từ khung lớn hơn sẽ "đè" zone từ khung nhỏ hơn.</strong> Khi 2 zone xung đột, luôn ưu tiên HTF zone.</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/FFBD59?text=Zone+Hierarchy+Pyramid" alt="Zone Hierarchy">
                </div>
            </div>
        </div>

        <!-- Section 2: Zone Strength Scoring -->
        <div class="content-card">
            <div class="card-header">
                <h2>📊 Điểm Số Sức Mạnh Zone</h2>
            </div>
            <div class="card-content">
                <p>Mỗi zone được chấm điểm dựa trên <span class="highlight">khung thời gian</span> nó được vẽ:</p>

                <div class="strength-grid">
                    <div class="strength-card high">
                        <div class="strength-icon">👑</div>
                        <div class="strength-title">HTF Zone</div>
                        <div class="strength-score">10/10</div>
                        <div class="strength-desc">Daily, Weekly</div>
                    </div>
                    <div class="strength-card medium">
                        <div class="strength-icon">⭐</div>
                        <div class="strength-title">ITF Zone</div>
                        <div class="strength-score">7/10</div>
                        <div class="strength-desc">4H</div>
                    </div>
                    <div class="strength-card low">
                        <div class="strength-icon">📍</div>
                        <div class="strength-title">LTF Zone</div>
                        <div class="strength-score">4/10</div>
                        <div class="strength-desc">1H, 15M</div>
                    </div>
                </div>

                <table class="compare-table">
                    <thead>
                        <tr>
                            <th>Đặc Điểm</th>
                            <th>HTF Zone</th>
                            <th>ITF Zone</th>
                            <th>LTF Zone</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Win Rate</strong></td>
                            <td style="color: var(--success-green);">70-80%</td>
                            <td style="color: var(--accent-cyan);">60-70%</td>
                            <td style="color: var(--accent-gold);">50-60%</td>
                        </tr>
                        <tr>
                            <td><strong>Reaction Size</strong></td>
                            <td>Lớn (100+ pips)</td>
                            <td>Trung bình (50-100 pips)</td>
                            <td>Nhỏ (10-50 pips)</td>
                        </tr>
                        <tr>
                            <td><strong>Tần Suất</strong></td>
                            <td>Hiếm (1-2/tuần)</td>
                            <td>Vừa (3-5/tuần)</td>
                            <td>Nhiều (5+/ngày)</td>
                        </tr>
                        <tr>
                            <td><strong>Hold Time</strong></td>
                            <td>Days - Weeks</td>
                            <td>Hours - Days</td>
                            <td>Minutes - Hours</td>
                        </tr>
                    </tbody>
                </table>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/00F0FF?text=Zone+Strength+Comparison" alt="Zone Strength">
                </div>
            </div>
        </div>

        <!-- Section 3: Confluence Zones -->
        <div class="content-card">
            <div class="card-header">
                <h2>💎 Confluence Zones - Khi Zones Chồng Lên Nhau</h2>
            </div>
            <div class="card-content">
                <p>Khi zone từ nhiều khung thời gian <span class="highlight-gold">overlap</span> (chồng lên nhau), sức mạnh được nhân lên:</p>

                <div class="info-box success">
                    <div class="info-box-title">✅ HTF + ITF Confluence = PREMIUM ZONE</div>
                    <p>Daily zone + 4H zone cùng vùng giá → Sức mạnh 10 + 7 = <strong>17/10</strong> → Trade với confidence cao nhất!</p>
                </div>

                <div class="info-box cyan">
                    <div class="info-box-title">💡 ITF + LTF Confluence</div>
                    <p>4H zone + 1H zone → Sức mạnh 7 + 4 = <strong>11/10</strong> → Good setup, RR tốt.</p>
                </div>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Chỉ LTF Zone</div>
                    <p>Chỉ có 1H zone, không có HTF/ITF support → Sức mạnh <strong>4/10</strong> → Scalp only, không hold lâu.</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/10B981?text=Confluence+Zone+Example" alt="Confluence Zones">
                </div>

                <p><span class="highlight-green">Ví dụ thực tế:</span></p>
                <ul class="styled-list">
                    <li><strong>BTC Daily LFZ:</strong> $42,000 - $42,500</li>
                    <li><strong>BTC 4H LFZ:</strong> $42,100 - $42,400</li>
                    <li><strong>Confluence zone:</strong> $42,100 - $42,400 (overlap) → PREMIUM LONG ZONE</li>
                </ul>
            </div>
        </div>

        <!-- Section 4: Zone Conflict -->
        <div class="content-card">
            <div class="card-header">
                <h2>⚔️ Zone Conflict - Khi Zones Xung Đột</h2>
            </div>
            <div class="card-content">
                <p>Đôi khi zone từ các khung khác nhau cho <span class="highlight-red">tín hiệu ngược nhau</span>:</p>

                <div class="info-box danger">
                    <div class="info-box-title">❌ Ví Dụ Zone Conflict</div>
                    <ul class="styled-list">
                        <li><strong>Daily HFZ (sell zone):</strong> $45,000</li>
                        <li><strong>4H LFZ (buy zone):</strong> $44,800</li>
                        <li>Giá hiện tại: $44,900 (ở giữa 2 zone)</li>
                    </ul>
                </div>

                <p><span class="highlight-gold">Cách giải quyết:</span></p>

                <div class="info-box success">
                    <div class="info-box-title">✅ Quy Tắc: HTF Wins!</div>
                    <p>Khi có conflict, <strong>LUÔN ưu tiên HTF zone</strong>. Trong ví dụ trên → Ưu tiên Daily HFZ → SELL setup có priority cao hơn.</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/EF4444?text=Zone+Conflict+Resolution" alt="Zone Conflict">
                </div>

                <div class="info-box cyan">
                    <div class="info-box-title">💡 Best Practice</div>
                    <ul class="styled-list">
                        <li><strong>Avoid trading</strong> khi có zone conflict</li>
                        <li>Đợi giá phá vỡ một trong hai zone</li>
                        <li>Hoặc trade theo HTF với size nhỏ hơn bình thường</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Section 5: Practical Application -->
        <div class="content-card">
            <div class="card-header">
                <h2>🎯 Áp Dụng Zone Hierarchy</h2>
            </div>
            <div class="card-content">
                <p><span class="highlight">Checklist</span> trước khi trade bất kỳ zone nào:</p>

                <div class="info-box">
                    <div class="info-box-title">☑️ Zone Hierarchy Checklist</div>
                    <ul class="styled-list">
                        <li>Zone này từ khung nào? (HTF/ITF/LTF)</li>
                        <li>Có zone từ khung lớn hơn support không?</li>
                        <li>Có confluence với zone khác không?</li>
                        <li>Có zone conflict với khung lớn hơn không?</li>
                        <li>Score tổng là bao nhiêu? (&gt;7 = trade, &lt;7 = skip)</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x450/112250/6A5BFF?text=Zone+Hierarchy+Checklist+Workflow" alt="Hierarchy Checklist">
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Pro Tip</div>
                    <p>Đánh dấu zone trên chart với màu khác nhau theo khung:<br>
                    <span class="highlight-purple">■ Purple = HTF</span> | <span class="highlight">■ Cyan = ITF</span> | <span class="highlight-green">■ Green = LTF</span></p>
                </div>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li><strong>Zone Hierarchy:</strong> HTF zone > ITF zone > LTF zone</li>
                <li><strong>HTF zone (Daily+):</strong> 10/10 strength, win rate 70-80%</li>
                <li><strong>ITF zone (4H):</strong> 7/10 strength, win rate 60-70%</li>
                <li><strong>LTF zone (1H):</strong> 4/10 strength, entry refinement only</li>
                <li><strong>Confluence:</strong> Zones overlap = sức mạnh cộng dồn</li>
                <li><strong>Conflict:</strong> HTF luôn wins khi có xung đột</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="0">
                <p>1. Zone từ khung thời gian nào có sức mạnh cao nhất?</p>
                <button class="quiz-option" data-index="0">HTF (Daily, Weekly)</button>
                <button class="quiz-option" data-index="1">ITF (4H)</button>
                <button class="quiz-option" data-index="2">LTF (1H, 15M)</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p>2. Khi Daily LFZ và 4H LFZ overlap cùng vùng giá, đây gọi là gì?</p>
                <button class="quiz-option" data-index="0">Zone Conflict</button>
                <button class="quiz-option" data-index="1">Confluence Zone</button>
                <button class="quiz-option" data-index="2">Broken Zone</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p>3. Khi Daily HFZ (sell) và 4H LFZ (buy) xung đột, bạn nên làm gì?</p>
                <button class="quiz-option" data-index="0">Trade theo 4H LFZ vì gần hơn</button>
                <button class="quiz-option" data-index="1">Trade cả hai hướng</button>
                <button class="quiz-option" data-index="2">Ưu tiên Daily HFZ hoặc không trade</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-number"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="btn-retake" onclick="retakeQuiz()">Làm Lại Quiz</button>
            </div>
        </div>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 2</p>
            <p>© 2025 GEM Frequency Trading Method</p>
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

        function retakeQuiz() {
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
    <title>Bài 4.3: Zone Hierarchy - Tier 2</title>
    <style>
        :root {
            --primary-navy: #112250;
            --accent-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --danger-red: #EF4444;
            --text-primary: #FFFFFF;
            --text-secondary: #A0AEC0;
            --bg-dark: #0a0a0f;
            --bg-card: #1a1a2e;
            --bg-card-hover: #252540;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1rem;
        }

        @media (max-width: 600px) {
            .lesson-container {
                padding: 0;
            }
        }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem;
            margin-bottom: 1.5rem;
            border-radius: 16px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                padding: 1.5rem 1rem;
            }
        }

        .lesson-header::before {
            content: '''';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url(''data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="%23FFBD59" opacity="0.3"/><circle cx="80" cy="40" r="1.5" fill="%2300F0FF" opacity="0.3"/><circle cx="40" cy="70" r="1" fill="%236A5BFF" opacity="0.3"/></svg>'');
            opacity: 0.5;
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--accent-gold) 0%, #FFD700 100%);
            color: #112250;
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
        }

        .lesson-subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
            position: relative;
            z-index: 1;
        }

        .content-card {
            background: var(--bg-card);
            border-radius: 12px;
            margin-bottom: 1.5rem;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .content-card {
                border-radius: 0;
                border-left: 4px solid var(--accent-gold);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
        }

        .card-header {
            background: rgba(255, 189, 89, 0.1);
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .card-header {
                padding: 1rem;
            }
        }

        .card-header h2 {
            font-size: 1.25rem;
            color: var(--accent-gold);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .card-content {
            padding: 1.5rem;
        }

        @media (max-width: 600px) {
            .card-content {
                padding: 1rem;
            }
        }

        .card-content p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
        }

        .image-placeholder {
            width: 100%;
            background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 1rem 0;
            overflow: hidden;
        }

        @media (max-width: 600px) {
            .image-placeholder {
                border-radius: 0;
                margin: 1rem -1rem;
                width: calc(100% + 2rem);
            }
        }

        .image-placeholder img {
            width: 100%;
            height: auto;
            display: block;
        }

        .info-box {
            background: rgba(255, 189, 89, 0.1);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .info-box {
                border-radius: 4px;
            }
        }

        .info-box.warning {
            background: rgba(255, 189, 89, 0.1);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .info-box.success {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .info-box.danger {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
        }

        .info-box.cyan {
            background: rgba(0, 240, 255, 0.1);
            border-color: rgba(0, 240, 255, 0.3);
        }

        .info-box-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .info-box.warning .info-box-title {
            color: var(--accent-gold);
        }

        .info-box.success .info-box-title {
            color: var(--success-green);
        }

        .info-box.danger .info-box-title {
            color: var(--danger-red);
        }

        .info-box.cyan .info-box-title {
            color: var(--accent-cyan);
        }

        .styled-list {
            list-style: none;
            padding: 0;
        }

        .styled-list li {
            padding: 0.75rem 0;
            padding-left: 2rem;
            position: relative;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            color: var(--text-secondary);
        }

        .styled-list li:last-child {
            border-bottom: none;
        }

        .styled-list li::before {
            content: ''→'';
            position: absolute;
            left: 0;
            color: var(--accent-gold);
            font-weight: bold;
        }

        /* Hierarchy Pyramid */
        .hierarchy-pyramid {
            margin: 1.5rem 0;
            text-align: center;
        }

        .pyramid-level {
            margin: 0.5rem auto;
            padding: 1rem;
            border-radius: 8px;
            font-weight: 600;
        }

        .pyramid-level.htf {
            width: 50%;
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.3) 0%, rgba(106, 91, 255, 0.1) 100%);
            border: 2px solid var(--accent-purple);
            color: var(--accent-purple);
        }

        .pyramid-level.itf {
            width: 70%;
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.3) 0%, rgba(0, 240, 255, 0.1) 100%);
            border: 2px solid var(--accent-cyan);
            color: var(--accent-cyan);
        }

        .pyramid-level.ltf {
            width: 90%;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 100%);
            border: 2px solid var(--success-green);
            color: var(--success-green);
        }

        @media (max-width: 600px) {
            .pyramid-level.htf { width: 70%; }
            .pyramid-level.itf { width: 85%; }
            .pyramid-level.ltf { width: 100%; }
        }

        .pyramid-label {
            font-size: 0.85rem;
            color: var(--text-secondary);
            font-weight: normal;
        }

        /* Zone Strength Cards */
        .strength-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .strength-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: rgba(255,255,255,0.1);
                margin: 1rem -1rem;
                width: calc(100% + 2rem);
            }
        }

        .strength-card {
            background: var(--bg-card-hover);
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
        }

        @media (max-width: 600px) {
            .strength-card {
                border-radius: 0;
            }
        }

        .strength-card.high {
            border-left: 4px solid var(--accent-purple);
        }

        .strength-card.medium {
            border-left: 4px solid var(--accent-cyan);
        }

        .strength-card.low {
            border-left: 4px solid var(--success-green);
        }

        .strength-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        .strength-title {
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .strength-card.high .strength-title { color: var(--accent-purple); }
        .strength-card.medium .strength-title { color: var(--accent-cyan); }
        .strength-card.low .strength-title { color: var(--success-green); }

        .strength-score {
            font-size: 1.5rem;
            font-weight: 700;
        }

        .strength-desc {
            font-size: 0.85rem;
            color: var(--text-secondary);
        }

        /* Comparison Table */
        .compare-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }

        .compare-table th,
        .compare-table td {
            padding: 0.75rem;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.1);
        }

        .compare-table th {
            background: rgba(255, 189, 89, 0.1);
            color: var(--accent-gold);
            font-weight: 600;
        }

        .compare-table td {
            background: var(--bg-card);
            color: var(--text-secondary);
        }

        @media (max-width: 600px) {
            .compare-table {
                font-size: 0.85rem;
            }
            .compare-table th,
            .compare-table td {
                padding: 0.5rem;
            }
        }

        /* Summary Box */
        .summary-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.1) 0%, rgba(106, 91, 255, 0.1) 100%);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                margin: 1.5rem 0;
                border-left: 4px solid var(--accent-gold);
                border-right: none;
                border-top: none;
                border-bottom: none;
            }
        }

        .summary-box h3 {
            color: var(--accent-gold);
            margin-bottom: 1rem;
        }

        .summary-list {
            list-style: none;
            padding: 0;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-list li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--success-green);
        }

        /* Quiz Section */
        .quiz-section {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                padding: 1rem;
                margin-top: 1rem;
            }
        }

        .quiz-section h3 {
            color: var(--accent-gold);
            margin-bottom: 1.5rem;
        }

        .quiz-question {
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }

        .quiz-option:hover {
            background: rgba(255,255,255,0.1);
            border-color: var(--accent-gold);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--success-green);
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: var(--danger-red);
        }

        .quiz-result {
            padding: 1rem;
            border-radius: 8px;
            margin-top: 0.5rem;
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
            color: var(--danger-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.1) 0%, rgba(106, 91, 255, 0.1) 100%);
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .score-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .score-label {
            color: var(--text-secondary);
        }

        .btn-retake {
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--accent-gold) 0%, #FFD700 100%);
            border: none;
            border-radius: 8px;
            color: #112250;
            font-weight: 600;
            cursor: pointer;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .highlight {
            color: var(--accent-cyan);
            font-weight: 600;
        }

        .highlight-gold {
            color: var(--accent-gold);
            font-weight: 600;
        }

        .highlight-green {
            color: var(--success-green);
            font-weight: 600;
        }

        .highlight-purple {
            color: var(--accent-purple);
            font-weight: 600;
        }

        .highlight-red {
            color: var(--danger-red);
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="header-badge">📊 Tier 2 - Bài 4.3</span>
            <h1 class="lesson-title">Zone Hierarchy</h1>
            <p class="lesson-subtitle">Zone Strength Based on Timeframe</p>
        </header>

        <!-- Section 1: Zone Hierarchy Concept -->
        <div class="content-card">
            <div class="card-header">
                <h2>👑 Zone Hierarchy Là Gì?</h2>
            </div>
            <div class="card-content">
                <p><span class="highlight-gold">Zone Hierarchy</span> = Hệ thống phân cấp sức mạnh của zone dựa trên khung thời gian. Không phải tất cả zone đều có giá trị như nhau!</p>

                <div class="hierarchy-pyramid">
                    <div class="pyramid-level htf">
                        👑 HTF ZONE (Daily+)
                        <div class="pyramid-label">Strongest - Respected Most</div>
                    </div>
                    <div class="pyramid-level itf">
                        ⭐ ITF ZONE (4H)
                        <div class="pyramid-label">Medium - Good for Trading</div>
                    </div>
                    <div class="pyramid-level ltf">
                        📍 LTF ZONE (1H)
                        <div class="pyramid-label">Weak - Entry Refinement Only</div>
                    </div>
                </div>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Quy Tắc Quan Trọng</div>
                    <p><strong>Zone từ khung lớn hơn sẽ "đè" zone từ khung nhỏ hơn.</strong> Khi 2 zone xung đột, luôn ưu tiên HTF zone.</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/FFBD59?text=Zone+Hierarchy+Pyramid" alt="Zone Hierarchy">
                </div>
            </div>
        </div>

        <!-- Section 2: Zone Strength Scoring -->
        <div class="content-card">
            <div class="card-header">
                <h2>📊 Điểm Số Sức Mạnh Zone</h2>
            </div>
            <div class="card-content">
                <p>Mỗi zone được chấm điểm dựa trên <span class="highlight">khung thời gian</span> nó được vẽ:</p>

                <div class="strength-grid">
                    <div class="strength-card high">
                        <div class="strength-icon">👑</div>
                        <div class="strength-title">HTF Zone</div>
                        <div class="strength-score">10/10</div>
                        <div class="strength-desc">Daily, Weekly</div>
                    </div>
                    <div class="strength-card medium">
                        <div class="strength-icon">⭐</div>
                        <div class="strength-title">ITF Zone</div>
                        <div class="strength-score">7/10</div>
                        <div class="strength-desc">4H</div>
                    </div>
                    <div class="strength-card low">
                        <div class="strength-icon">📍</div>
                        <div class="strength-title">LTF Zone</div>
                        <div class="strength-score">4/10</div>
                        <div class="strength-desc">1H, 15M</div>
                    </div>
                </div>

                <table class="compare-table">
                    <thead>
                        <tr>
                            <th>Đặc Điểm</th>
                            <th>HTF Zone</th>
                            <th>ITF Zone</th>
                            <th>LTF Zone</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Win Rate</strong></td>
                            <td style="color: var(--success-green);">70-80%</td>
                            <td style="color: var(--accent-cyan);">60-70%</td>
                            <td style="color: var(--accent-gold);">50-60%</td>
                        </tr>
                        <tr>
                            <td><strong>Reaction Size</strong></td>
                            <td>Lớn (100+ pips)</td>
                            <td>Trung bình (50-100 pips)</td>
                            <td>Nhỏ (10-50 pips)</td>
                        </tr>
                        <tr>
                            <td><strong>Tần Suất</strong></td>
                            <td>Hiếm (1-2/tuần)</td>
                            <td>Vừa (3-5/tuần)</td>
                            <td>Nhiều (5+/ngày)</td>
                        </tr>
                        <tr>
                            <td><strong>Hold Time</strong></td>
                            <td>Days - Weeks</td>
                            <td>Hours - Days</td>
                            <td>Minutes - Hours</td>
                        </tr>
                    </tbody>
                </table>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/00F0FF?text=Zone+Strength+Comparison" alt="Zone Strength">
                </div>
            </div>
        </div>

        <!-- Section 3: Confluence Zones -->
        <div class="content-card">
            <div class="card-header">
                <h2>💎 Confluence Zones - Khi Zones Chồng Lên Nhau</h2>
            </div>
            <div class="card-content">
                <p>Khi zone từ nhiều khung thời gian <span class="highlight-gold">overlap</span> (chồng lên nhau), sức mạnh được nhân lên:</p>

                <div class="info-box success">
                    <div class="info-box-title">✅ HTF + ITF Confluence = PREMIUM ZONE</div>
                    <p>Daily zone + 4H zone cùng vùng giá → Sức mạnh 10 + 7 = <strong>17/10</strong> → Trade với confidence cao nhất!</p>
                </div>

                <div class="info-box cyan">
                    <div class="info-box-title">💡 ITF + LTF Confluence</div>
                    <p>4H zone + 1H zone → Sức mạnh 7 + 4 = <strong>11/10</strong> → Good setup, RR tốt.</p>
                </div>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Chỉ LTF Zone</div>
                    <p>Chỉ có 1H zone, không có HTF/ITF support → Sức mạnh <strong>4/10</strong> → Scalp only, không hold lâu.</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/10B981?text=Confluence+Zone+Example" alt="Confluence Zones">
                </div>

                <p><span class="highlight-green">Ví dụ thực tế:</span></p>
                <ul class="styled-list">
                    <li><strong>BTC Daily LFZ:</strong> $42,000 - $42,500</li>
                    <li><strong>BTC 4H LFZ:</strong> $42,100 - $42,400</li>
                    <li><strong>Confluence zone:</strong> $42,100 - $42,400 (overlap) → PREMIUM LONG ZONE</li>
                </ul>
            </div>
        </div>

        <!-- Section 4: Zone Conflict -->
        <div class="content-card">
            <div class="card-header">
                <h2>⚔️ Zone Conflict - Khi Zones Xung Đột</h2>
            </div>
            <div class="card-content">
                <p>Đôi khi zone từ các khung khác nhau cho <span class="highlight-red">tín hiệu ngược nhau</span>:</p>

                <div class="info-box danger">
                    <div class="info-box-title">❌ Ví Dụ Zone Conflict</div>
                    <ul class="styled-list">
                        <li><strong>Daily HFZ (sell zone):</strong> $45,000</li>
                        <li><strong>4H LFZ (buy zone):</strong> $44,800</li>
                        <li>Giá hiện tại: $44,900 (ở giữa 2 zone)</li>
                    </ul>
                </div>

                <p><span class="highlight-gold">Cách giải quyết:</span></p>

                <div class="info-box success">
                    <div class="info-box-title">✅ Quy Tắc: HTF Wins!</div>
                    <p>Khi có conflict, <strong>LUÔN ưu tiên HTF zone</strong>. Trong ví dụ trên → Ưu tiên Daily HFZ → SELL setup có priority cao hơn.</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/EF4444?text=Zone+Conflict+Resolution" alt="Zone Conflict">
                </div>

                <div class="info-box cyan">
                    <div class="info-box-title">💡 Best Practice</div>
                    <ul class="styled-list">
                        <li><strong>Avoid trading</strong> khi có zone conflict</li>
                        <li>Đợi giá phá vỡ một trong hai zone</li>
                        <li>Hoặc trade theo HTF với size nhỏ hơn bình thường</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Section 5: Practical Application -->
        <div class="content-card">
            <div class="card-header">
                <h2>🎯 Áp Dụng Zone Hierarchy</h2>
            </div>
            <div class="card-content">
                <p><span class="highlight">Checklist</span> trước khi trade bất kỳ zone nào:</p>

                <div class="info-box">
                    <div class="info-box-title">☑️ Zone Hierarchy Checklist</div>
                    <ul class="styled-list">
                        <li>Zone này từ khung nào? (HTF/ITF/LTF)</li>
                        <li>Có zone từ khung lớn hơn support không?</li>
                        <li>Có confluence với zone khác không?</li>
                        <li>Có zone conflict với khung lớn hơn không?</li>
                        <li>Score tổng là bao nhiêu? (&gt;7 = trade, &lt;7 = skip)</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x450/112250/6A5BFF?text=Zone+Hierarchy+Checklist+Workflow" alt="Hierarchy Checklist">
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Pro Tip</div>
                    <p>Đánh dấu zone trên chart với màu khác nhau theo khung:<br>
                    <span class="highlight-purple">■ Purple = HTF</span> | <span class="highlight">■ Cyan = ITF</span> | <span class="highlight-green">■ Green = LTF</span></p>
                </div>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li><strong>Zone Hierarchy:</strong> HTF zone > ITF zone > LTF zone</li>
                <li><strong>HTF zone (Daily+):</strong> 10/10 strength, win rate 70-80%</li>
                <li><strong>ITF zone (4H):</strong> 7/10 strength, win rate 60-70%</li>
                <li><strong>LTF zone (1H):</strong> 4/10 strength, entry refinement only</li>
                <li><strong>Confluence:</strong> Zones overlap = sức mạnh cộng dồn</li>
                <li><strong>Conflict:</strong> HTF luôn wins khi có xung đột</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="0">
                <p>1. Zone từ khung thời gian nào có sức mạnh cao nhất?</p>
                <button class="quiz-option" data-index="0">HTF (Daily, Weekly)</button>
                <button class="quiz-option" data-index="1">ITF (4H)</button>
                <button class="quiz-option" data-index="2">LTF (1H, 15M)</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p>2. Khi Daily LFZ và 4H LFZ overlap cùng vùng giá, đây gọi là gì?</p>
                <button class="quiz-option" data-index="0">Zone Conflict</button>
                <button class="quiz-option" data-index="1">Confluence Zone</button>
                <button class="quiz-option" data-index="2">Broken Zone</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p>3. Khi Daily HFZ (sell) và 4H LFZ (buy) xung đột, bạn nên làm gì?</p>
                <button class="quiz-option" data-index="0">Trade theo 4H LFZ vì gần hơn</button>
                <button class="quiz-option" data-index="1">Trade cả hai hướng</button>
                <button class="quiz-option" data-index="2">Ưu tiên Daily HFZ hoặc không trade</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-number"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="btn-retake" onclick="retakeQuiz()">Làm Lại Quiz</button>
            </div>
        </div>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 2</p>
            <p>© 2025 GEM Frequency Trading Method</p>
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

        function retakeQuiz() {
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

-- Lesson 4.4: Entry Chính Xác Trên LTF - Tier 2
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch4-l4',
  'module-tier-2-ch4',
  'course-tier2-trading-advanced',
  'Bài 4.4: Entry Chính Xác Trên LTF - Tier 2',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 4.4: Entry Chính Xác Trên LTF - Tier 2</title>
    <style>
        :root {
            --primary-navy: #112250;
            --accent-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --danger-red: #EF4444;
            --text-primary: #FFFFFF;
            --text-secondary: #A0AEC0;
            --bg-dark: #0a0a0f;
            --bg-card: #1a1a2e;
            --bg-card-hover: #252540;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1rem;
        }

        @media (max-width: 600px) {
            .lesson-container {
                padding: 0;
            }
        }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem;
            margin-bottom: 1.5rem;
            border-radius: 16px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                padding: 1.5rem 1rem;
            }
        }

        .lesson-header::before {
            content: '''';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url(''data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="%23FFBD59" opacity="0.3"/><circle cx="80" cy="40" r="1.5" fill="%2300F0FF" opacity="0.3"/><circle cx="40" cy="70" r="1" fill="%236A5BFF" opacity="0.3"/></svg>'');
            opacity: 0.5;
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--success-green) 0%, #34D399 100%);
            color: white;
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
        }

        .lesson-subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
            position: relative;
            z-index: 1;
        }

        .content-card {
            background: var(--bg-card);
            border-radius: 12px;
            margin-bottom: 1.5rem;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .content-card {
                border-radius: 0;
                border-left: 4px solid var(--success-green);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
        }

        .card-header {
            background: rgba(16, 185, 129, 0.1);
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .card-header {
                padding: 1rem;
            }
        }

        .card-header h2 {
            font-size: 1.25rem;
            color: var(--success-green);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .card-content {
            padding: 1.5rem;
        }

        @media (max-width: 600px) {
            .card-content {
                padding: 1rem;
            }
        }

        .card-content p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
        }

        .image-placeholder {
            width: 100%;
            background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 1rem 0;
            overflow: hidden;
        }

        @media (max-width: 600px) {
            .image-placeholder {
                border-radius: 0;
                margin: 1rem -1rem;
                width: calc(100% + 2rem);
            }
        }

        .image-placeholder img {
            width: 100%;
            height: auto;
            display: block;
        }

        .info-box {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .info-box {
                border-radius: 4px;
            }
        }

        .info-box.warning {
            background: rgba(255, 189, 89, 0.1);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .info-box.success {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .info-box.danger {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
        }

        .info-box.cyan {
            background: rgba(0, 240, 255, 0.1);
            border-color: rgba(0, 240, 255, 0.3);
        }

        .info-box-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .info-box.warning .info-box-title {
            color: var(--accent-gold);
        }

        .info-box.success .info-box-title {
            color: var(--success-green);
        }

        .info-box.danger .info-box-title {
            color: var(--danger-red);
        }

        .info-box.cyan .info-box-title {
            color: var(--accent-cyan);
        }

        .styled-list {
            list-style: none;
            padding: 0;
        }

        .styled-list li {
            padding: 0.75rem 0;
            padding-left: 2rem;
            position: relative;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            color: var(--text-secondary);
        }

        .styled-list li:last-child {
            border-bottom: none;
        }

        .styled-list li::before {
            content: ''→'';
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-weight: bold;
        }

        /* Trigger Grid */
        .trigger-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .trigger-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: rgba(255,255,255,0.1);
                margin: 1rem -1rem;
                width: calc(100% + 2rem);
            }
        }

        .trigger-card {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 12px;
            padding: 1.25rem;
        }

        @media (max-width: 600px) {
            .trigger-card {
                border-radius: 0;
                border: none;
                background: var(--bg-card);
            }
        }

        .trigger-card.sell {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
        }

        .trigger-title {
            font-weight: 700;
            font-size: 1.1rem;
            margin-bottom: 0.75rem;
            color: var(--success-green);
        }

        .trigger-card.sell .trigger-title {
            color: var(--danger-red);
        }

        .trigger-list {
            list-style: none;
            padding: 0;
        }

        .trigger-list li {
            padding: 0.5rem 0;
            font-size: 0.9rem;
            color: var(--text-secondary);
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .trigger-list li:last-child {
            border-bottom: none;
        }

        /* Step Cards */
        .step-card {
            background: var(--bg-card-hover);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
            border-left: 4px solid var(--success-green);
        }

        .step-number {
            display: inline-block;
            width: 28px;
            height: 28px;
            background: var(--success-green);
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 28px;
            font-weight: 700;
            margin-right: 0.5rem;
        }

        .step-title {
            font-weight: 600;
            display: inline;
        }

        .step-desc {
            margin-top: 0.5rem;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        /* Summary Box */
        .summary-box {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(0, 240, 255, 0.1) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                margin: 1.5rem 0;
                border-left: 4px solid var(--success-green);
                border-right: none;
                border-top: none;
                border-bottom: none;
            }
        }

        .summary-box h3 {
            color: var(--success-green);
            margin-bottom: 1rem;
        }

        .summary-list {
            list-style: none;
            padding: 0;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-list li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--success-green);
        }

        /* Quiz Section */
        .quiz-section {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                padding: 1rem;
                margin-top: 1rem;
            }
        }

        .quiz-section h3 {
            color: var(--accent-gold);
            margin-bottom: 1.5rem;
        }

        .quiz-question {
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }

        .quiz-option:hover {
            background: rgba(255,255,255,0.1);
            border-color: var(--success-green);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--success-green);
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: var(--danger-red);
        }

        .quiz-result {
            padding: 1rem;
            border-radius: 8px;
            margin-top: 0.5rem;
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
            color: var(--danger-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(0, 240, 255, 0.1) 100%);
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .score-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--success-green);
        }

        .score-label {
            color: var(--text-secondary);
        }

        .btn-retake {
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--success-green) 0%, #34D399 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            cursor: pointer;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .highlight {
            color: var(--accent-cyan);
            font-weight: 600;
        }

        .highlight-gold {
            color: var(--accent-gold);
            font-weight: 600;
        }

        .highlight-green {
            color: var(--success-green);
            font-weight: 600;
        }

        .highlight-red {
            color: var(--danger-red);
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="header-badge">📊 Tier 2 - Bài 4.4</span>
            <h1 class="lesson-title">Entry Chính Xác Trên LTF</h1>
            <p class="lesson-subtitle">Precision Entry Techniques</p>
        </header>

        <!-- Section 1: Tại Sao Entry Trên LTF -->
        <div class="content-card">
            <div class="card-header">
                <h2>🎯 Tại Sao Entry Trên LTF?</h2>
            </div>
            <div class="card-content">
                <p>Sau khi đã xác định <span class="highlight">bias từ HTF</span> và <span class="highlight">zone từ ITF</span>, bước cuối cùng là tìm entry chính xác trên <span class="highlight-green">LTF (Lower Timeframe)</span>.</p>

                <div class="info-box success">
                    <div class="info-box-title">✅ Lợi Ích Entry Trên LTF</div>
                    <ul class="styled-list">
                        <li><strong>Stoploss nhỏ hơn:</strong> Risk giảm 50-70%</li>
                        <li><strong>RR ratio cao hơn:</strong> Từ 2:1 lên 4:1 - 5:1</li>
                        <li><strong>Timing chính xác:</strong> Vào đúng điểm reversal</li>
                        <li><strong>Confirm reaction:</strong> Thấy giá phản ứng trước khi vào</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/10B981?text=ITF+Entry+vs+LTF+Entry+Comparison" alt="ITF vs LTF Entry">
                </div>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Rủi Ro Nếu Entry Trên ITF</div>
                    <p>Entry ngay khi giá chạm ITF zone → Stoploss rộng → Risk lớn → RR thấp → Dễ bị stopped out bởi spike.</p>
                </div>
            </div>
        </div>

        <!-- Section 2: Entry Triggers cho Long -->
        <div class="content-card">
            <div class="card-header">
                <h2>📈 Entry Triggers Cho LONG (tại LFZ)</h2>
            </div>
            <div class="card-content">
                <p>Khi giá về <span class="highlight-green">LFZ trên ITF</span>, chuyển sang LTF và tìm các trigger sau:</p>

                <div class="trigger-grid">
                    <div class="trigger-card">
                        <div class="trigger-title">🕯️ Bullish Candle Patterns</div>
                        <ul class="trigger-list">
                            <li>✓ Bullish Engulfing</li>
                            <li>✓ Hammer / Pin Bar</li>
                            <li>✓ Morning Star</li>
                            <li>✓ Bullish Harami</li>
                            <li>✓ Double Bottom (LTF)</li>
                        </ul>
                    </div>
                    <div class="trigger-card">
                        <div class="trigger-title">📊 Structure Confirmation</div>
                        <ul class="trigger-list">
                            <li>✓ Higher High (HH)</li>
                            <li>✓ Higher Low (HL)</li>
                            <li>✓ Break of LTF downtrend</li>
                            <li>✓ LFZ created on LTF</li>
                            <li>✓ Volume increase on bounce</li>
                        </ul>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x450/112250/10B981?text=Long+Entry+Triggers+on+LTF" alt="Long Entry Triggers">
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Entry Setup Mạnh Nhất</div>
                    <p><strong>LTF Break of Structure + Bullish Engulfing</strong> tại ITF LFZ = Setup có win rate cao nhất (70%+)</p>
                </div>
            </div>
        </div>

        <!-- Section 3: Entry Triggers cho Short -->
        <div class="content-card">
            <div class="card-header">
                <h2>📉 Entry Triggers Cho SHORT (tại HFZ)</h2>
            </div>
            <div class="card-content">
                <p>Khi giá về <span class="highlight-red">HFZ trên ITF</span>, chuyển sang LTF và tìm các trigger sau:</p>

                <div class="trigger-grid">
                    <div class="trigger-card sell">
                        <div class="trigger-title">🕯️ Bearish Candle Patterns</div>
                        <ul class="trigger-list">
                            <li>✓ Bearish Engulfing</li>
                            <li>✓ Shooting Star / Inverted Hammer</li>
                            <li>✓ Evening Star</li>
                            <li>✓ Bearish Harami</li>
                            <li>✓ Double Top (LTF)</li>
                        </ul>
                    </div>
                    <div class="trigger-card sell">
                        <div class="trigger-title">📊 Structure Confirmation</div>
                        <ul class="trigger-list">
                            <li>✓ Lower High (LH)</li>
                            <li>✓ Lower Low (LL)</li>
                            <li>✓ Break of LTF uptrend</li>
                            <li>✓ HFZ created on LTF</li>
                            <li>✓ Volume increase on rejection</li>
                        </ul>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x450/112250/EF4444?text=Short+Entry+Triggers+on+LTF" alt="Short Entry Triggers">
                </div>

                <div class="info-box danger">
                    <div class="info-box-title">💡 Entry Setup Mạnh Nhất</div>
                    <p><strong>LTF Break of Structure + Bearish Engulfing</strong> tại ITF HFZ = Setup Short có win rate cao nhất (70%+)</p>
                </div>
            </div>
        </div>

        <!-- Section 4: Step-by-Step Entry Process -->
        <div class="content-card">
            <div class="card-header">
                <h2>📋 Quy Trình Entry 5 Bước</h2>
            </div>
            <div class="card-content">
                <div class="step-card">
                    <span class="step-number">1</span>
                    <span class="step-title">Set Alert tại ITF Zone</span>
                    <div class="step-desc">Đặt alert khi giá đến gần zone (cách 0.5-1% giá). Không ngồi nhìn chart liên tục.</div>
                </div>

                <div class="step-card">
                    <span class="step-number">2</span>
                    <span class="step-title">Chuyển sang LTF khi Alert</span>
                    <div class="step-desc">Khi alert trigger, mở chart LTF (1H hoặc 15M). Quan sát price action tại zone.</div>
                </div>

                <div class="step-card">
                    <span class="step-number">3</span>
                    <span class="step-title">Đợi Entry Trigger</span>
                    <div class="step-desc">KHÔNG vào ngay! Đợi bullish/bearish trigger xuất hiện. Có thể mất 1-4 candles.</div>
                </div>

                <div class="step-card">
                    <span class="step-number">4</span>
                    <span class="step-title">Xác Định Stoploss</span>
                    <div class="step-desc">Stoploss = Below/Above LTF swing low/high + buffer. Thường là 5-15 pips dưới zone.</div>
                </div>

                <div class="step-card">
                    <span class="step-number">5</span>
                    <span class="step-title">Vào Lệnh với Risk:Reward</span>
                    <div class="step-desc">Check RR ratio ≥ 2:1. Nếu đạt → Entry. Nếu không → Skip hoặc đợi setup tốt hơn.</div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x450/112250/FFBD59?text=5-Step+Entry+Process" alt="Entry Process">
                </div>
            </div>
        </div>

        <!-- Section 5: Common Mistakes -->
        <div class="content-card">
            <div class="card-header">
                <h2>⚠️ Lỗi Thường Gặp Khi Entry LTF</h2>
            </div>
            <div class="card-content">
                <div class="info-box danger">
                    <div class="info-box-title">❌ Lỗi 1: Entry Quá Sớm</div>
                    <p>Vào ngay khi giá chạm zone mà không đợi confirmation → Bị stopped out bởi liquidity grab.</p>
                </div>

                <div class="info-box danger">
                    <div class="info-box-title">❌ Lỗi 2: Entry Quá Muộn</div>
                    <p>Đợi quá nhiều confirmation → Giá đã move xa → Stoploss rộng, RR thấp.</p>
                </div>

                <div class="info-box danger">
                    <div class="info-box-title">❌ Lỗi 3: Stoploss Quá Chặt</div>
                    <p>Đặt SL ngay dưới trigger candle → Dễ bị stopped out bởi noise. Nên đặt dưới zone.</p>
                </div>

                <div class="info-box danger">
                    <div class="info-box-title">❌ Lỗi 4: Bỏ Qua RR Check</div>
                    <p>Entry mà không tính RR → Trade với RR 1:1 hoặc thấp hơn → Long-term loss.</p>
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Giải Pháp</div>
                    <p>Luôn tuân thủ quy trình 5 bước. <strong>Patience = Profits.</strong> Bỏ lỡ trade tốt còn hơn vào trade xấu.</p>
                </div>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Entry trên <strong>LTF</strong> giúp giảm risk 50-70%, tăng RR lên 4:1+</li>
                <li><strong>Long triggers:</strong> Bullish Engulfing, Hammer, HH-HL structure</li>
                <li><strong>Short triggers:</strong> Bearish Engulfing, Shooting Star, LH-LL structure</li>
                <li>Tuân thủ <strong>quy trình 5 bước:</strong> Alert → LTF → Trigger → SL → RR check</li>
                <li><strong>Không vào sớm:</strong> Đợi confirmation trên LTF</li>
                <li><strong>RR ≥ 2:1</strong> là yêu cầu bắt buộc trước khi entry</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="1">
                <p>1. Tại sao nên entry trên LTF thay vì ITF?</p>
                <button class="quiz-option" data-index="0">Vì LTF có nhiều cơ hội hơn</button>
                <button class="quiz-option" data-index="1">Vì stoploss nhỏ hơn và RR ratio cao hơn</button>
                <button class="quiz-option" data-index="2">Vì LTF dễ đọc hơn ITF</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p>2. Trigger nào mạnh nhất cho LONG entry tại LFZ?</p>
                <button class="quiz-option" data-index="0">LTF Break of Structure + Bullish Engulfing</button>
                <button class="quiz-option" data-index="1">Chỉ cần giá chạm LFZ</button>
                <button class="quiz-option" data-index="2">RSI oversold</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p>3. Trong quy trình 5 bước, bước nào sau khi đợi Entry Trigger?</p>
                <button class="quiz-option" data-index="0">Chuyển sang LTF</button>
                <button class="quiz-option" data-index="1">Vào lệnh ngay</button>
                <button class="quiz-option" data-index="2">Xác định Stoploss</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-number"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="btn-retake" onclick="retakeQuiz()">Làm Lại Quiz</button>
            </div>
        </div>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 2</p>
            <p>© 2025 GEM Frequency Trading Method</p>
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

        function retakeQuiz() {
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
    <title>Bài 4.4: Entry Chính Xác Trên LTF - Tier 2</title>
    <style>
        :root {
            --primary-navy: #112250;
            --accent-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --danger-red: #EF4444;
            --text-primary: #FFFFFF;
            --text-secondary: #A0AEC0;
            --bg-dark: #0a0a0f;
            --bg-card: #1a1a2e;
            --bg-card-hover: #252540;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1rem;
        }

        @media (max-width: 600px) {
            .lesson-container {
                padding: 0;
            }
        }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem;
            margin-bottom: 1.5rem;
            border-radius: 16px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                padding: 1.5rem 1rem;
            }
        }

        .lesson-header::before {
            content: '''';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url(''data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="%23FFBD59" opacity="0.3"/><circle cx="80" cy="40" r="1.5" fill="%2300F0FF" opacity="0.3"/><circle cx="40" cy="70" r="1" fill="%236A5BFF" opacity="0.3"/></svg>'');
            opacity: 0.5;
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--success-green) 0%, #34D399 100%);
            color: white;
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
        }

        .lesson-subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
            position: relative;
            z-index: 1;
        }

        .content-card {
            background: var(--bg-card);
            border-radius: 12px;
            margin-bottom: 1.5rem;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .content-card {
                border-radius: 0;
                border-left: 4px solid var(--success-green);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
        }

        .card-header {
            background: rgba(16, 185, 129, 0.1);
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .card-header {
                padding: 1rem;
            }
        }

        .card-header h2 {
            font-size: 1.25rem;
            color: var(--success-green);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .card-content {
            padding: 1.5rem;
        }

        @media (max-width: 600px) {
            .card-content {
                padding: 1rem;
            }
        }

        .card-content p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
        }

        .image-placeholder {
            width: 100%;
            background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 1rem 0;
            overflow: hidden;
        }

        @media (max-width: 600px) {
            .image-placeholder {
                border-radius: 0;
                margin: 1rem -1rem;
                width: calc(100% + 2rem);
            }
        }

        .image-placeholder img {
            width: 100%;
            height: auto;
            display: block;
        }

        .info-box {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .info-box {
                border-radius: 4px;
            }
        }

        .info-box.warning {
            background: rgba(255, 189, 89, 0.1);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .info-box.success {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .info-box.danger {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
        }

        .info-box.cyan {
            background: rgba(0, 240, 255, 0.1);
            border-color: rgba(0, 240, 255, 0.3);
        }

        .info-box-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .info-box.warning .info-box-title {
            color: var(--accent-gold);
        }

        .info-box.success .info-box-title {
            color: var(--success-green);
        }

        .info-box.danger .info-box-title {
            color: var(--danger-red);
        }

        .info-box.cyan .info-box-title {
            color: var(--accent-cyan);
        }

        .styled-list {
            list-style: none;
            padding: 0;
        }

        .styled-list li {
            padding: 0.75rem 0;
            padding-left: 2rem;
            position: relative;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            color: var(--text-secondary);
        }

        .styled-list li:last-child {
            border-bottom: none;
        }

        .styled-list li::before {
            content: ''→'';
            position: absolute;
            left: 0;
            color: var(--success-green);
            font-weight: bold;
        }

        /* Trigger Grid */
        .trigger-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .trigger-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: rgba(255,255,255,0.1);
                margin: 1rem -1rem;
                width: calc(100% + 2rem);
            }
        }

        .trigger-card {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 12px;
            padding: 1.25rem;
        }

        @media (max-width: 600px) {
            .trigger-card {
                border-radius: 0;
                border: none;
                background: var(--bg-card);
            }
        }

        .trigger-card.sell {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
        }

        .trigger-title {
            font-weight: 700;
            font-size: 1.1rem;
            margin-bottom: 0.75rem;
            color: var(--success-green);
        }

        .trigger-card.sell .trigger-title {
            color: var(--danger-red);
        }

        .trigger-list {
            list-style: none;
            padding: 0;
        }

        .trigger-list li {
            padding: 0.5rem 0;
            font-size: 0.9rem;
            color: var(--text-secondary);
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .trigger-list li:last-child {
            border-bottom: none;
        }

        /* Step Cards */
        .step-card {
            background: var(--bg-card-hover);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
            border-left: 4px solid var(--success-green);
        }

        .step-number {
            display: inline-block;
            width: 28px;
            height: 28px;
            background: var(--success-green);
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 28px;
            font-weight: 700;
            margin-right: 0.5rem;
        }

        .step-title {
            font-weight: 600;
            display: inline;
        }

        .step-desc {
            margin-top: 0.5rem;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        /* Summary Box */
        .summary-box {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(0, 240, 255, 0.1) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                margin: 1.5rem 0;
                border-left: 4px solid var(--success-green);
                border-right: none;
                border-top: none;
                border-bottom: none;
            }
        }

        .summary-box h3 {
            color: var(--success-green);
            margin-bottom: 1rem;
        }

        .summary-list {
            list-style: none;
            padding: 0;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-list li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--success-green);
        }

        /* Quiz Section */
        .quiz-section {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                padding: 1rem;
                margin-top: 1rem;
            }
        }

        .quiz-section h3 {
            color: var(--accent-gold);
            margin-bottom: 1.5rem;
        }

        .quiz-question {
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }

        .quiz-option:hover {
            background: rgba(255,255,255,0.1);
            border-color: var(--success-green);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--success-green);
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: var(--danger-red);
        }

        .quiz-result {
            padding: 1rem;
            border-radius: 8px;
            margin-top: 0.5rem;
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
            color: var(--danger-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(0, 240, 255, 0.1) 100%);
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .score-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--success-green);
        }

        .score-label {
            color: var(--text-secondary);
        }

        .btn-retake {
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--success-green) 0%, #34D399 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            cursor: pointer;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .highlight {
            color: var(--accent-cyan);
            font-weight: 600;
        }

        .highlight-gold {
            color: var(--accent-gold);
            font-weight: 600;
        }

        .highlight-green {
            color: var(--success-green);
            font-weight: 600;
        }

        .highlight-red {
            color: var(--danger-red);
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="header-badge">📊 Tier 2 - Bài 4.4</span>
            <h1 class="lesson-title">Entry Chính Xác Trên LTF</h1>
            <p class="lesson-subtitle">Precision Entry Techniques</p>
        </header>

        <!-- Section 1: Tại Sao Entry Trên LTF -->
        <div class="content-card">
            <div class="card-header">
                <h2>🎯 Tại Sao Entry Trên LTF?</h2>
            </div>
            <div class="card-content">
                <p>Sau khi đã xác định <span class="highlight">bias từ HTF</span> và <span class="highlight">zone từ ITF</span>, bước cuối cùng là tìm entry chính xác trên <span class="highlight-green">LTF (Lower Timeframe)</span>.</p>

                <div class="info-box success">
                    <div class="info-box-title">✅ Lợi Ích Entry Trên LTF</div>
                    <ul class="styled-list">
                        <li><strong>Stoploss nhỏ hơn:</strong> Risk giảm 50-70%</li>
                        <li><strong>RR ratio cao hơn:</strong> Từ 2:1 lên 4:1 - 5:1</li>
                        <li><strong>Timing chính xác:</strong> Vào đúng điểm reversal</li>
                        <li><strong>Confirm reaction:</strong> Thấy giá phản ứng trước khi vào</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/10B981?text=ITF+Entry+vs+LTF+Entry+Comparison" alt="ITF vs LTF Entry">
                </div>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Rủi Ro Nếu Entry Trên ITF</div>
                    <p>Entry ngay khi giá chạm ITF zone → Stoploss rộng → Risk lớn → RR thấp → Dễ bị stopped out bởi spike.</p>
                </div>
            </div>
        </div>

        <!-- Section 2: Entry Triggers cho Long -->
        <div class="content-card">
            <div class="card-header">
                <h2>📈 Entry Triggers Cho LONG (tại LFZ)</h2>
            </div>
            <div class="card-content">
                <p>Khi giá về <span class="highlight-green">LFZ trên ITF</span>, chuyển sang LTF và tìm các trigger sau:</p>

                <div class="trigger-grid">
                    <div class="trigger-card">
                        <div class="trigger-title">🕯️ Bullish Candle Patterns</div>
                        <ul class="trigger-list">
                            <li>✓ Bullish Engulfing</li>
                            <li>✓ Hammer / Pin Bar</li>
                            <li>✓ Morning Star</li>
                            <li>✓ Bullish Harami</li>
                            <li>✓ Double Bottom (LTF)</li>
                        </ul>
                    </div>
                    <div class="trigger-card">
                        <div class="trigger-title">📊 Structure Confirmation</div>
                        <ul class="trigger-list">
                            <li>✓ Higher High (HH)</li>
                            <li>✓ Higher Low (HL)</li>
                            <li>✓ Break of LTF downtrend</li>
                            <li>✓ LFZ created on LTF</li>
                            <li>✓ Volume increase on bounce</li>
                        </ul>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x450/112250/10B981?text=Long+Entry+Triggers+on+LTF" alt="Long Entry Triggers">
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Entry Setup Mạnh Nhất</div>
                    <p><strong>LTF Break of Structure + Bullish Engulfing</strong> tại ITF LFZ = Setup có win rate cao nhất (70%+)</p>
                </div>
            </div>
        </div>

        <!-- Section 3: Entry Triggers cho Short -->
        <div class="content-card">
            <div class="card-header">
                <h2>📉 Entry Triggers Cho SHORT (tại HFZ)</h2>
            </div>
            <div class="card-content">
                <p>Khi giá về <span class="highlight-red">HFZ trên ITF</span>, chuyển sang LTF và tìm các trigger sau:</p>

                <div class="trigger-grid">
                    <div class="trigger-card sell">
                        <div class="trigger-title">🕯️ Bearish Candle Patterns</div>
                        <ul class="trigger-list">
                            <li>✓ Bearish Engulfing</li>
                            <li>✓ Shooting Star / Inverted Hammer</li>
                            <li>✓ Evening Star</li>
                            <li>✓ Bearish Harami</li>
                            <li>✓ Double Top (LTF)</li>
                        </ul>
                    </div>
                    <div class="trigger-card sell">
                        <div class="trigger-title">📊 Structure Confirmation</div>
                        <ul class="trigger-list">
                            <li>✓ Lower High (LH)</li>
                            <li>✓ Lower Low (LL)</li>
                            <li>✓ Break of LTF uptrend</li>
                            <li>✓ HFZ created on LTF</li>
                            <li>✓ Volume increase on rejection</li>
                        </ul>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x450/112250/EF4444?text=Short+Entry+Triggers+on+LTF" alt="Short Entry Triggers">
                </div>

                <div class="info-box danger">
                    <div class="info-box-title">💡 Entry Setup Mạnh Nhất</div>
                    <p><strong>LTF Break of Structure + Bearish Engulfing</strong> tại ITF HFZ = Setup Short có win rate cao nhất (70%+)</p>
                </div>
            </div>
        </div>

        <!-- Section 4: Step-by-Step Entry Process -->
        <div class="content-card">
            <div class="card-header">
                <h2>📋 Quy Trình Entry 5 Bước</h2>
            </div>
            <div class="card-content">
                <div class="step-card">
                    <span class="step-number">1</span>
                    <span class="step-title">Set Alert tại ITF Zone</span>
                    <div class="step-desc">Đặt alert khi giá đến gần zone (cách 0.5-1% giá). Không ngồi nhìn chart liên tục.</div>
                </div>

                <div class="step-card">
                    <span class="step-number">2</span>
                    <span class="step-title">Chuyển sang LTF khi Alert</span>
                    <div class="step-desc">Khi alert trigger, mở chart LTF (1H hoặc 15M). Quan sát price action tại zone.</div>
                </div>

                <div class="step-card">
                    <span class="step-number">3</span>
                    <span class="step-title">Đợi Entry Trigger</span>
                    <div class="step-desc">KHÔNG vào ngay! Đợi bullish/bearish trigger xuất hiện. Có thể mất 1-4 candles.</div>
                </div>

                <div class="step-card">
                    <span class="step-number">4</span>
                    <span class="step-title">Xác Định Stoploss</span>
                    <div class="step-desc">Stoploss = Below/Above LTF swing low/high + buffer. Thường là 5-15 pips dưới zone.</div>
                </div>

                <div class="step-card">
                    <span class="step-number">5</span>
                    <span class="step-title">Vào Lệnh với Risk:Reward</span>
                    <div class="step-desc">Check RR ratio ≥ 2:1. Nếu đạt → Entry. Nếu không → Skip hoặc đợi setup tốt hơn.</div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x450/112250/FFBD59?text=5-Step+Entry+Process" alt="Entry Process">
                </div>
            </div>
        </div>

        <!-- Section 5: Common Mistakes -->
        <div class="content-card">
            <div class="card-header">
                <h2>⚠️ Lỗi Thường Gặp Khi Entry LTF</h2>
            </div>
            <div class="card-content">
                <div class="info-box danger">
                    <div class="info-box-title">❌ Lỗi 1: Entry Quá Sớm</div>
                    <p>Vào ngay khi giá chạm zone mà không đợi confirmation → Bị stopped out bởi liquidity grab.</p>
                </div>

                <div class="info-box danger">
                    <div class="info-box-title">❌ Lỗi 2: Entry Quá Muộn</div>
                    <p>Đợi quá nhiều confirmation → Giá đã move xa → Stoploss rộng, RR thấp.</p>
                </div>

                <div class="info-box danger">
                    <div class="info-box-title">❌ Lỗi 3: Stoploss Quá Chặt</div>
                    <p>Đặt SL ngay dưới trigger candle → Dễ bị stopped out bởi noise. Nên đặt dưới zone.</p>
                </div>

                <div class="info-box danger">
                    <div class="info-box-title">❌ Lỗi 4: Bỏ Qua RR Check</div>
                    <p>Entry mà không tính RR → Trade với RR 1:1 hoặc thấp hơn → Long-term loss.</p>
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Giải Pháp</div>
                    <p>Luôn tuân thủ quy trình 5 bước. <strong>Patience = Profits.</strong> Bỏ lỡ trade tốt còn hơn vào trade xấu.</p>
                </div>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Entry trên <strong>LTF</strong> giúp giảm risk 50-70%, tăng RR lên 4:1+</li>
                <li><strong>Long triggers:</strong> Bullish Engulfing, Hammer, HH-HL structure</li>
                <li><strong>Short triggers:</strong> Bearish Engulfing, Shooting Star, LH-LL structure</li>
                <li>Tuân thủ <strong>quy trình 5 bước:</strong> Alert → LTF → Trigger → SL → RR check</li>
                <li><strong>Không vào sớm:</strong> Đợi confirmation trên LTF</li>
                <li><strong>RR ≥ 2:1</strong> là yêu cầu bắt buộc trước khi entry</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="1">
                <p>1. Tại sao nên entry trên LTF thay vì ITF?</p>
                <button class="quiz-option" data-index="0">Vì LTF có nhiều cơ hội hơn</button>
                <button class="quiz-option" data-index="1">Vì stoploss nhỏ hơn và RR ratio cao hơn</button>
                <button class="quiz-option" data-index="2">Vì LTF dễ đọc hơn ITF</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p>2. Trigger nào mạnh nhất cho LONG entry tại LFZ?</p>
                <button class="quiz-option" data-index="0">LTF Break of Structure + Bullish Engulfing</button>
                <button class="quiz-option" data-index="1">Chỉ cần giá chạm LFZ</button>
                <button class="quiz-option" data-index="2">RSI oversold</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p>3. Trong quy trình 5 bước, bước nào sau khi đợi Entry Trigger?</p>
                <button class="quiz-option" data-index="0">Chuyển sang LTF</button>
                <button class="quiz-option" data-index="1">Vào lệnh ngay</button>
                <button class="quiz-option" data-index="2">Xác định Stoploss</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-number"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="btn-retake" onclick="retakeQuiz()">Làm Lại Quiz</button>
            </div>
        </div>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 2</p>
            <p>© 2025 GEM Frequency Trading Method</p>
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

        function retakeQuiz() {
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

-- Lesson 4.5: Ví Dụ Thực Tế Multi-TF - Tier 2
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch4-l5',
  'module-tier-2-ch4',
  'course-tier2-trading-advanced',
  'Bài 4.5: Ví Dụ Thực Tế Multi-TF - Tier 2',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 4.5: Ví Dụ Thực Tế Multi-TF - Tier 2</title>
    <style>
        :root {
            --primary-navy: #112250;
            --accent-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --danger-red: #EF4444;
            --text-primary: #FFFFFF;
            --text-secondary: #A0AEC0;
            --bg-dark: #0a0a0f;
            --bg-card: #1a1a2e;
            --bg-card-hover: #252540;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1rem;
        }

        @media (max-width: 600px) {
            .lesson-container {
                padding: 0;
            }
        }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem;
            margin-bottom: 1.5rem;
            border-radius: 16px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                padding: 1.5rem 1rem;
            }
        }

        .lesson-header::before {
            content: '''';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url(''data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="%23FFBD59" opacity="0.3"/><circle cx="80" cy="40" r="1.5" fill="%2300F0FF" opacity="0.3"/><circle cx="40" cy="70" r="1" fill="%236A5BFF" opacity="0.3"/></svg>'');
            opacity: 0.5;
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--accent-purple) 0%, #8B7BFF 100%);
            color: white;
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
        }

        .lesson-subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
            position: relative;
            z-index: 1;
        }

        .content-card {
            background: var(--bg-card);
            border-radius: 12px;
            margin-bottom: 1.5rem;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .content-card {
                border-radius: 0;
                border-left: 4px solid var(--accent-purple);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
        }

        .card-header {
            background: rgba(106, 91, 255, 0.1);
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .card-header {
                padding: 1rem;
            }
        }

        .card-header h2 {
            font-size: 1.25rem;
            color: var(--accent-purple);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .card-header.win h2 {
            color: var(--success-green);
        }

        .card-header.loss h2 {
            color: var(--danger-red);
        }

        .card-content {
            padding: 1.5rem;
        }

        @media (max-width: 600px) {
            .card-content {
                padding: 1rem;
            }
        }

        .card-content p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
        }

        .image-placeholder {
            width: 100%;
            background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 1rem 0;
            overflow: hidden;
        }

        @media (max-width: 600px) {
            .image-placeholder {
                border-radius: 0;
                margin: 1rem -1rem;
                width: calc(100% + 2rem);
            }
        }

        .image-placeholder img {
            width: 100%;
            height: auto;
            display: block;
        }

        .info-box {
            background: rgba(106, 91, 255, 0.1);
            border: 1px solid rgba(106, 91, 255, 0.3);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .info-box {
                border-radius: 4px;
            }
        }

        .info-box.warning {
            background: rgba(255, 189, 89, 0.1);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .info-box.success {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .info-box.danger {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
        }

        .info-box.cyan {
            background: rgba(0, 240, 255, 0.1);
            border-color: rgba(0, 240, 255, 0.3);
        }

        .info-box-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .info-box.warning .info-box-title {
            color: var(--accent-gold);
        }

        .info-box.success .info-box-title {
            color: var(--success-green);
        }

        .info-box.danger .info-box-title {
            color: var(--danger-red);
        }

        .info-box.cyan .info-box-title {
            color: var(--accent-cyan);
        }

        .styled-list {
            list-style: none;
            padding: 0;
        }

        .styled-list li {
            padding: 0.75rem 0;
            padding-left: 2rem;
            position: relative;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            color: var(--text-secondary);
        }

        .styled-list li:last-child {
            border-bottom: none;
        }

        .styled-list li::before {
            content: ''→'';
            position: absolute;
            left: 0;
            color: var(--accent-purple);
            font-weight: bold;
        }

        /* Case Study Card */
        .case-study {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            border-left: 4px solid var(--accent-purple);
        }

        @media (max-width: 600px) {
            .case-study {
                border-radius: 0;
                margin: 1rem -1rem;
                padding: 1rem;
                width: calc(100% + 2rem);
            }
        }

        .case-study.win {
            border-left-color: var(--success-green);
        }

        .case-study.loss {
            border-left-color: var(--danger-red);
        }

        .case-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .case-title {
            font-size: 1.1rem;
            font-weight: 700;
        }

        .case-study.win .case-title {
            color: var(--success-green);
        }

        .case-study.loss .case-title {
            color: var(--danger-red);
        }

        .case-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .case-badge.win {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success-green);
        }

        .case-badge.loss {
            background: rgba(239, 68, 68, 0.2);
            color: var(--danger-red);
        }

        /* Trade Details Grid */
        .trade-details {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.5rem;
            margin: 1rem 0;
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
            padding: 0.75rem;
        }

        @media (max-width: 600px) {
            .trade-details {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        .trade-detail-item {
            text-align: center;
        }

        .trade-detail-label {
            font-size: 0.75rem;
            color: var(--text-secondary);
            text-transform: uppercase;
        }

        .trade-detail-value {
            font-weight: 700;
            color: var(--text-primary);
        }

        .trade-detail-value.positive {
            color: var(--success-green);
        }

        .trade-detail-value.negative {
            color: var(--danger-red);
        }

        /* Timeline Steps */
        .timeline {
            margin: 1rem 0;
        }

        .timeline-step {
            display: flex;
            gap: 1rem;
            padding: 0.75rem 0;
            border-left: 2px solid rgba(255,255,255,0.1);
            padding-left: 1rem;
            margin-left: 0.5rem;
            position: relative;
        }

        .timeline-step::before {
            content: '''';
            position: absolute;
            left: -6px;
            top: 1rem;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--accent-purple);
        }

        .timeline-step.htf::before { background: var(--accent-purple); }
        .timeline-step.itf::before { background: var(--accent-cyan); }
        .timeline-step.ltf::before { background: var(--success-green); }
        .timeline-step.result::before { background: var(--accent-gold); }

        .timeline-content {
            flex: 1;
        }

        .timeline-label {
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 0.25rem;
        }

        .timeline-step.htf .timeline-label { color: var(--accent-purple); }
        .timeline-step.itf .timeline-label { color: var(--accent-cyan); }
        .timeline-step.ltf .timeline-label { color: var(--success-green); }
        .timeline-step.result .timeline-label { color: var(--accent-gold); }

        .timeline-text {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        /* Summary Box */
        .summary-box {
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.1) 0%, rgba(0, 240, 255, 0.1) 100%);
            border: 1px solid rgba(106, 91, 255, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                margin: 1.5rem 0;
                border-left: 4px solid var(--accent-purple);
                border-right: none;
                border-top: none;
                border-bottom: none;
            }
        }

        .summary-box h3 {
            color: var(--accent-purple);
            margin-bottom: 1rem;
        }

        .summary-list {
            list-style: none;
            padding: 0;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-list li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--success-green);
        }

        /* Quiz Section */
        .quiz-section {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                padding: 1rem;
                margin-top: 1rem;
            }
        }

        .quiz-section h3 {
            color: var(--accent-gold);
            margin-bottom: 1.5rem;
        }

        .quiz-question {
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }

        .quiz-option:hover {
            background: rgba(255,255,255,0.1);
            border-color: var(--accent-purple);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--success-green);
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: var(--danger-red);
        }

        .quiz-result {
            padding: 1rem;
            border-radius: 8px;
            margin-top: 0.5rem;
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
            color: var(--danger-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.1) 0%, rgba(0, 240, 255, 0.1) 100%);
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .score-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--accent-purple);
        }

        .score-label {
            color: var(--text-secondary);
        }

        .btn-retake {
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--accent-purple) 0%, #8B7BFF 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            cursor: pointer;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .highlight {
            color: var(--accent-cyan);
            font-weight: 600;
        }

        .highlight-gold {
            color: var(--accent-gold);
            font-weight: 600;
        }

        .highlight-green {
            color: var(--success-green);
            font-weight: 600;
        }

        .highlight-purple {
            color: var(--accent-purple);
            font-weight: 600;
        }

        .highlight-red {
            color: var(--danger-red);
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="header-badge">📊 Tier 2 - Bài 4.5</span>
            <h1 class="lesson-title">Ví Dụ Thực Tế Multi-TF</h1>
            <p class="lesson-subtitle">Real Case Studies with Full MTF Analysis</p>
        </header>

        <!-- Intro -->
        <div class="content-card">
            <div class="card-header">
                <h2>📚 Giới Thiệu Case Studies</h2>
            </div>
            <div class="card-content">
                <p>Bài học này sẽ đi qua <span class="highlight-purple">4 case study thực tế</span> áp dụng đầy đủ quy trình Multi-Timeframe Analysis:</p>

                <ul class="styled-list">
                    <li><span class="highlight-green">Case 1:</span> BTC Long - Confluence Zone Setup (WIN)</li>
                    <li><span class="highlight-green">Case 2:</span> ETH Short - HFZ + HTF Downtrend (WIN)</li>
                    <li><span class="highlight-red">Case 3:</span> BNB Long - Zone Conflict (LOSS)</li>
                    <li><span class="highlight-gold">Case 4:</span> SOL Long - Perfect MTF Alignment (WIN)</li>
                </ul>

                <div class="info-box">
                    <div class="info-box-title">💡 Cách Đọc Case Study</div>
                    <p>Mỗi case sẽ trình bày: HTF Analysis → ITF Zone → LTF Entry → Kết quả và Bài học</p>
                </div>
            </div>
        </div>

        <!-- Case Study 1: BTC Long -->
        <div class="case-study win">
            <div class="case-header">
                <span class="case-title">📈 Case 1: BTC/USDT Long - Confluence Zone</span>
                <span class="case-badge win">WIN +4.2%</span>
            </div>

            <div class="trade-details">
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Coin</div>
                    <div class="trade-detail-value">BTC</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Direction</div>
                    <div class="trade-detail-value positive">LONG</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">RR Ratio</div>
                    <div class="trade-detail-value">3.5:1</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Result</div>
                    <div class="trade-detail-value positive">+4.2%</div>
                </div>
            </div>

            <div class="timeline">
                <div class="timeline-step htf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 1: HTF (Daily)</div>
                        <div class="timeline-text">BTC đang trong uptrend rõ ràng. Higher highs và higher lows. Bias: LONG ONLY.</div>
                    </div>
                </div>
                <div class="timeline-step itf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 2: ITF (4H)</div>
                        <div class="timeline-text">LFZ được vẽ tại $41,800 - $42,200 từ UPU pattern. Daily LFZ overlap tại $41,900. → CONFLUENCE ZONE!</div>
                    </div>
                </div>
                <div class="timeline-step ltf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 3: LTF (1H)</div>
                        <div class="timeline-text">Giá về LFZ và tạo Bullish Engulfing + Break of 1H downtrend. Entry: $42,050. SL: $41,700 (below zone).</div>
                    </div>
                </div>
                <div class="timeline-step result">
                    <div class="timeline-content">
                        <div class="timeline-label">Kết Quả</div>
                        <div class="timeline-text">TP hit tại $43,270. Profit +4.2%. RR achieved: 3.5:1. Total trade time: 18 hours.</div>
                    </div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/800x450/112250/10B981?text=BTC+Long+Multi-TF+Analysis" alt="BTC Long Case">
            </div>

            <div class="info-box success">
                <div class="info-box-title">✅ Bài Học Từ Case 1</div>
                <p><strong>Confluence zone</strong> (Daily + 4H LFZ overlap) mang lại confidence cao. Entry trên 1H với trigger rõ ràng giúp SL chặt và RR lớn.</p>
            </div>
        </div>

        <!-- Case Study 2: ETH Short -->
        <div class="case-study win">
            <div class="case-header">
                <span class="case-title">📉 Case 2: ETH/USDT Short - HFZ Rejection</span>
                <span class="case-badge win">WIN +3.8%</span>
            </div>

            <div class="trade-details">
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Coin</div>
                    <div class="trade-detail-value">ETH</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Direction</div>
                    <div class="trade-detail-value negative">SHORT</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">RR Ratio</div>
                    <div class="trade-detail-value">2.8:1</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Result</div>
                    <div class="trade-detail-value positive">+3.8%</div>
                </div>
            </div>

            <div class="timeline">
                <div class="timeline-step htf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 1: HTF (Daily)</div>
                        <div class="timeline-text">ETH đang trong downtrend. Lower highs và lower lows liên tục. Bias: SHORT ONLY.</div>
                    </div>
                </div>
                <div class="timeline-step itf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 2: ITF (4H)</div>
                        <div class="timeline-text">HFZ được xác định tại $2,450 - $2,490 từ DPD pattern. Zone còn FRESH, chưa test lần nào.</div>
                    </div>
                </div>
                <div class="timeline-step ltf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 3: LTF (1H)</div>
                        <div class="timeline-text">Giá spike lên HFZ, tạo Bearish Engulfing mạnh + Volume spike. Entry: $2,465. SL: $2,510 (above zone).</div>
                    </div>
                </div>
                <div class="timeline-step result">
                    <div class="timeline-content">
                        <div class="timeline-label">Kết Quả</div>
                        <div class="timeline-text">TP hit tại $2,340. Profit +3.8%. Trade aligned với HTF trend → smooth move to target.</div>
                    </div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/800x450/112250/EF4444?text=ETH+Short+Multi-TF+Analysis" alt="ETH Short Case">
            </div>

            <div class="info-box success">
                <div class="info-box-title">✅ Bài Học Từ Case 2</div>
                <p>Trade <strong>theo hướng HTF</strong> luôn smooth hơn. Fresh HFZ + HTF downtrend = High probability short setup.</p>
            </div>
        </div>

        <!-- Case Study 3: BNB Loss -->
        <div class="case-study loss">
            <div class="case-header">
                <span class="case-title">⚠️ Case 3: BNB/USDT Long - Zone Conflict</span>
                <span class="case-badge loss">LOSS -1.5%</span>
            </div>

            <div class="trade-details">
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Coin</div>
                    <div class="trade-detail-value">BNB</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Direction</div>
                    <div class="trade-detail-value positive">LONG</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">RR Ratio</div>
                    <div class="trade-detail-value">2:1</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Result</div>
                    <div class="trade-detail-value negative">-1.5%</div>
                </div>
            </div>

            <div class="timeline">
                <div class="timeline-step htf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 1: HTF (Daily)</div>
                        <div class="timeline-text">BNB trong range, có Daily HFZ ngay phía trên tại $320. Không clear trend.</div>
                    </div>
                </div>
                <div class="timeline-step itf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 2: ITF (4H)</div>
                        <div class="timeline-text">4H LFZ tại $305 - $308. NHƯNG Daily HFZ chỉ cách $12 (3.5%) → Zone Conflict!</div>
                    </div>
                </div>
                <div class="timeline-step ltf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 3: LTF (1H)</div>
                        <div class="timeline-text">Vào Long tại 4H LFZ với Bullish Engulfing. Entry: $306.5. SL: $302.</div>
                    </div>
                </div>
                <div class="timeline-step result">
                    <div class="timeline-content">
                        <div class="timeline-label">Kết Quả</div>
                        <div class="timeline-text">Giá bounce lên $315 rồi reject mạnh từ Daily HFZ $320. SL hit. Loss -1.5%.</div>
                    </div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/800x450/112250/FFBD59?text=BNB+Zone+Conflict+Case" alt="BNB Loss Case">
            </div>

            <div class="info-box danger">
                <div class="info-box-title">❌ Bài Học Từ Case 3</div>
                <p><strong>Zone Conflict là red flag!</strong> Khi ITF LFZ nằm gần HTF HFZ, upside bị giới hạn. Nên SKIP trade hoặc take partial profit sớm.</p>
            </div>
        </div>

        <!-- Case Study 4: SOL Win -->
        <div class="case-study win">
            <div class="case-header">
                <span class="case-title">⭐ Case 4: SOL/USDT Long - Perfect Alignment</span>
                <span class="case-badge win">WIN +6.5%</span>
            </div>

            <div class="trade-details">
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Coin</div>
                    <div class="trade-detail-value">SOL</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Direction</div>
                    <div class="trade-detail-value positive">LONG</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">RR Ratio</div>
                    <div class="trade-detail-value">4.3:1</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Result</div>
                    <div class="trade-detail-value positive">+6.5%</div>
                </div>
            </div>

            <div class="timeline">
                <div class="timeline-step htf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 1: HTF (Daily)</div>
                        <div class="timeline-text">SOL strong uptrend, vừa break ATH. Daily LFZ tại $95 - $100 từ last impulse base.</div>
                    </div>
                </div>
                <div class="timeline-step itf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 2: ITF (4H)</div>
                        <div class="timeline-text">4H LFZ overlap với Daily tại $97 - $100. FRESH zone + Confluence = A+ Setup!</div>
                    </div>
                </div>
                <div class="timeline-step ltf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 3: LTF (1H)</div>
                        <div class="timeline-text">Giá về zone, tạo Double Bottom + Bullish Engulfing trên 1H. Entry: $98.5. SL: $95 (below zone).</div>
                    </div>
                </div>
                <div class="timeline-step result">
                    <div class="timeline-content">
                        <div class="timeline-label">Kết Quả</div>
                        <div class="timeline-text">SOL rally mạnh lên $113.5. TP hit với +6.5% profit. Perfect trade với full MTF alignment!</div>
                    </div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/800x450/112250/6A5BFF?text=SOL+Perfect+MTF+Alignment" alt="SOL Win Case">
            </div>

            <div class="info-box success">
                <div class="info-box-title">⭐ Bài Học Từ Case 4</div>
                <p><strong>Perfect MTF Alignment</strong> = HTF uptrend + HTF/ITF confluence zone + LTF trigger → High probability, high reward setup. Đây là "A+ Trade" cần chờ đợi!</p>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Các Case Study</h3>
            <ul class="summary-list">
                <li><strong>Case 1 (BTC):</strong> Confluence zone tăng confidence → WIN</li>
                <li><strong>Case 2 (ETH):</strong> Trade theo HTF trend luôn smooth → WIN</li>
                <li><strong>Case 3 (BNB):</strong> Zone Conflict = Red Flag → LOSS</li>
                <li><strong>Case 4 (SOL):</strong> Perfect MTF Alignment = A+ Setup → BIG WIN</li>
                <li><strong>Key Takeaway:</strong> Chờ đợi setup có HTF/ITF alignment, tránh zone conflict</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="2">
                <p>1. Trong Case 3 (BNB), lý do chính trade thua là gì?</p>
                <button class="quiz-option" data-index="0">Entry trigger không rõ ràng</button>
                <button class="quiz-option" data-index="1">Stoploss đặt quá chặt</button>
                <button class="quiz-option" data-index="2">Zone Conflict - Daily HFZ chặn upside</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p>2. "Perfect MTF Alignment" bao gồm những yếu tố nào?</p>
                <button class="quiz-option" data-index="0">HTF trend + HTF/ITF confluence + LTF trigger</button>
                <button class="quiz-option" data-index="1">Chỉ cần LTF trigger mạnh</button>
                <button class="quiz-option" data-index="2">RSI oversold + MACD cross</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p>3. Trong Case 2 (ETH Short), yếu tố nào giúp trade smooth nhất?</p>
                <button class="quiz-option" data-index="0">Zone còn Fresh</button>
                <button class="quiz-option" data-index="1">Trade theo hướng HTF downtrend</button>
                <button class="quiz-option" data-index="2">Bearish Engulfing candle</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-number"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="btn-retake" onclick="retakeQuiz()">Làm Lại Quiz</button>
            </div>
        </div>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 2</p>
            <p>© 2025 GEM Frequency Trading Method</p>
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

        function retakeQuiz() {
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
    <title>Bài 4.5: Ví Dụ Thực Tế Multi-TF - Tier 2</title>
    <style>
        :root {
            --primary-navy: #112250;
            --accent-gold: #FFBD59;
            --accent-cyan: #00F0FF;
            --accent-purple: #6A5BFF;
            --success-green: #10B981;
            --danger-red: #EF4444;
            --text-primary: #FFFFFF;
            --text-secondary: #A0AEC0;
            --bg-dark: #0a0a0f;
            --bg-card: #1a1a2e;
            --bg-card-hover: #252540;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1rem;
        }

        @media (max-width: 600px) {
            .lesson-container {
                padding: 0;
            }
        }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem;
            margin-bottom: 1.5rem;
            border-radius: 16px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                padding: 1.5rem 1rem;
            }
        }

        .lesson-header::before {
            content: '''';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url(''data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="%23FFBD59" opacity="0.3"/><circle cx="80" cy="40" r="1.5" fill="%2300F0FF" opacity="0.3"/><circle cx="40" cy="70" r="1" fill="%236A5BFF" opacity="0.3"/></svg>'');
            opacity: 0.5;
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--accent-purple) 0%, #8B7BFF 100%);
            color: white;
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
        }

        .lesson-subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
            position: relative;
            z-index: 1;
        }

        .content-card {
            background: var(--bg-card);
            border-radius: 12px;
            margin-bottom: 1.5rem;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .content-card {
                border-radius: 0;
                border-left: 4px solid var(--accent-purple);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
        }

        .card-header {
            background: rgba(106, 91, 255, 0.1);
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .card-header {
                padding: 1rem;
            }
        }

        .card-header h2 {
            font-size: 1.25rem;
            color: var(--accent-purple);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .card-header.win h2 {
            color: var(--success-green);
        }

        .card-header.loss h2 {
            color: var(--danger-red);
        }

        .card-content {
            padding: 1.5rem;
        }

        @media (max-width: 600px) {
            .card-content {
                padding: 1rem;
            }
        }

        .card-content p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
        }

        .image-placeholder {
            width: 100%;
            background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 1rem 0;
            overflow: hidden;
        }

        @media (max-width: 600px) {
            .image-placeholder {
                border-radius: 0;
                margin: 1rem -1rem;
                width: calc(100% + 2rem);
            }
        }

        .image-placeholder img {
            width: 100%;
            height: auto;
            display: block;
        }

        .info-box {
            background: rgba(106, 91, 255, 0.1);
            border: 1px solid rgba(106, 91, 255, 0.3);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .info-box {
                border-radius: 4px;
            }
        }

        .info-box.warning {
            background: rgba(255, 189, 89, 0.1);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .info-box.success {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .info-box.danger {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
        }

        .info-box.cyan {
            background: rgba(0, 240, 255, 0.1);
            border-color: rgba(0, 240, 255, 0.3);
        }

        .info-box-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .info-box.warning .info-box-title {
            color: var(--accent-gold);
        }

        .info-box.success .info-box-title {
            color: var(--success-green);
        }

        .info-box.danger .info-box-title {
            color: var(--danger-red);
        }

        .info-box.cyan .info-box-title {
            color: var(--accent-cyan);
        }

        .styled-list {
            list-style: none;
            padding: 0;
        }

        .styled-list li {
            padding: 0.75rem 0;
            padding-left: 2rem;
            position: relative;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            color: var(--text-secondary);
        }

        .styled-list li:last-child {
            border-bottom: none;
        }

        .styled-list li::before {
            content: ''→'';
            position: absolute;
            left: 0;
            color: var(--accent-purple);
            font-weight: bold;
        }

        /* Case Study Card */
        .case-study {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            border-left: 4px solid var(--accent-purple);
        }

        @media (max-width: 600px) {
            .case-study {
                border-radius: 0;
                margin: 1rem -1rem;
                padding: 1rem;
                width: calc(100% + 2rem);
            }
        }

        .case-study.win {
            border-left-color: var(--success-green);
        }

        .case-study.loss {
            border-left-color: var(--danger-red);
        }

        .case-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .case-title {
            font-size: 1.1rem;
            font-weight: 700;
        }

        .case-study.win .case-title {
            color: var(--success-green);
        }

        .case-study.loss .case-title {
            color: var(--danger-red);
        }

        .case-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .case-badge.win {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success-green);
        }

        .case-badge.loss {
            background: rgba(239, 68, 68, 0.2);
            color: var(--danger-red);
        }

        /* Trade Details Grid */
        .trade-details {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.5rem;
            margin: 1rem 0;
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
            padding: 0.75rem;
        }

        @media (max-width: 600px) {
            .trade-details {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        .trade-detail-item {
            text-align: center;
        }

        .trade-detail-label {
            font-size: 0.75rem;
            color: var(--text-secondary);
            text-transform: uppercase;
        }

        .trade-detail-value {
            font-weight: 700;
            color: var(--text-primary);
        }

        .trade-detail-value.positive {
            color: var(--success-green);
        }

        .trade-detail-value.negative {
            color: var(--danger-red);
        }

        /* Timeline Steps */
        .timeline {
            margin: 1rem 0;
        }

        .timeline-step {
            display: flex;
            gap: 1rem;
            padding: 0.75rem 0;
            border-left: 2px solid rgba(255,255,255,0.1);
            padding-left: 1rem;
            margin-left: 0.5rem;
            position: relative;
        }

        .timeline-step::before {
            content: '''';
            position: absolute;
            left: -6px;
            top: 1rem;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--accent-purple);
        }

        .timeline-step.htf::before { background: var(--accent-purple); }
        .timeline-step.itf::before { background: var(--accent-cyan); }
        .timeline-step.ltf::before { background: var(--success-green); }
        .timeline-step.result::before { background: var(--accent-gold); }

        .timeline-content {
            flex: 1;
        }

        .timeline-label {
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 0.25rem;
        }

        .timeline-step.htf .timeline-label { color: var(--accent-purple); }
        .timeline-step.itf .timeline-label { color: var(--accent-cyan); }
        .timeline-step.ltf .timeline-label { color: var(--success-green); }
        .timeline-step.result .timeline-label { color: var(--accent-gold); }

        .timeline-text {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        /* Summary Box */
        .summary-box {
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.1) 0%, rgba(0, 240, 255, 0.1) 100%);
            border: 1px solid rgba(106, 91, 255, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                margin: 1.5rem 0;
                border-left: 4px solid var(--accent-purple);
                border-right: none;
                border-top: none;
                border-bottom: none;
            }
        }

        .summary-box h3 {
            color: var(--accent-purple);
            margin-bottom: 1rem;
        }

        .summary-list {
            list-style: none;
            padding: 0;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-list li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--success-green);
        }

        /* Quiz Section */
        .quiz-section {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                padding: 1rem;
                margin-top: 1rem;
            }
        }

        .quiz-section h3 {
            color: var(--accent-gold);
            margin-bottom: 1.5rem;
        }

        .quiz-question {
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }

        .quiz-option:hover {
            background: rgba(255,255,255,0.1);
            border-color: var(--accent-purple);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--success-green);
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: var(--danger-red);
        }

        .quiz-result {
            padding: 1rem;
            border-radius: 8px;
            margin-top: 0.5rem;
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
            color: var(--danger-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.1) 0%, rgba(0, 240, 255, 0.1) 100%);
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .score-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--accent-purple);
        }

        .score-label {
            color: var(--text-secondary);
        }

        .btn-retake {
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--accent-purple) 0%, #8B7BFF 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            cursor: pointer;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .highlight {
            color: var(--accent-cyan);
            font-weight: 600;
        }

        .highlight-gold {
            color: var(--accent-gold);
            font-weight: 600;
        }

        .highlight-green {
            color: var(--success-green);
            font-weight: 600;
        }

        .highlight-purple {
            color: var(--accent-purple);
            font-weight: 600;
        }

        .highlight-red {
            color: var(--danger-red);
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="header-badge">📊 Tier 2 - Bài 4.5</span>
            <h1 class="lesson-title">Ví Dụ Thực Tế Multi-TF</h1>
            <p class="lesson-subtitle">Real Case Studies with Full MTF Analysis</p>
        </header>

        <!-- Intro -->
        <div class="content-card">
            <div class="card-header">
                <h2>📚 Giới Thiệu Case Studies</h2>
            </div>
            <div class="card-content">
                <p>Bài học này sẽ đi qua <span class="highlight-purple">4 case study thực tế</span> áp dụng đầy đủ quy trình Multi-Timeframe Analysis:</p>

                <ul class="styled-list">
                    <li><span class="highlight-green">Case 1:</span> BTC Long - Confluence Zone Setup (WIN)</li>
                    <li><span class="highlight-green">Case 2:</span> ETH Short - HFZ + HTF Downtrend (WIN)</li>
                    <li><span class="highlight-red">Case 3:</span> BNB Long - Zone Conflict (LOSS)</li>
                    <li><span class="highlight-gold">Case 4:</span> SOL Long - Perfect MTF Alignment (WIN)</li>
                </ul>

                <div class="info-box">
                    <div class="info-box-title">💡 Cách Đọc Case Study</div>
                    <p>Mỗi case sẽ trình bày: HTF Analysis → ITF Zone → LTF Entry → Kết quả và Bài học</p>
                </div>
            </div>
        </div>

        <!-- Case Study 1: BTC Long -->
        <div class="case-study win">
            <div class="case-header">
                <span class="case-title">📈 Case 1: BTC/USDT Long - Confluence Zone</span>
                <span class="case-badge win">WIN +4.2%</span>
            </div>

            <div class="trade-details">
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Coin</div>
                    <div class="trade-detail-value">BTC</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Direction</div>
                    <div class="trade-detail-value positive">LONG</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">RR Ratio</div>
                    <div class="trade-detail-value">3.5:1</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Result</div>
                    <div class="trade-detail-value positive">+4.2%</div>
                </div>
            </div>

            <div class="timeline">
                <div class="timeline-step htf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 1: HTF (Daily)</div>
                        <div class="timeline-text">BTC đang trong uptrend rõ ràng. Higher highs và higher lows. Bias: LONG ONLY.</div>
                    </div>
                </div>
                <div class="timeline-step itf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 2: ITF (4H)</div>
                        <div class="timeline-text">LFZ được vẽ tại $41,800 - $42,200 từ UPU pattern. Daily LFZ overlap tại $41,900. → CONFLUENCE ZONE!</div>
                    </div>
                </div>
                <div class="timeline-step ltf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 3: LTF (1H)</div>
                        <div class="timeline-text">Giá về LFZ và tạo Bullish Engulfing + Break of 1H downtrend. Entry: $42,050. SL: $41,700 (below zone).</div>
                    </div>
                </div>
                <div class="timeline-step result">
                    <div class="timeline-content">
                        <div class="timeline-label">Kết Quả</div>
                        <div class="timeline-text">TP hit tại $43,270. Profit +4.2%. RR achieved: 3.5:1. Total trade time: 18 hours.</div>
                    </div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/800x450/112250/10B981?text=BTC+Long+Multi-TF+Analysis" alt="BTC Long Case">
            </div>

            <div class="info-box success">
                <div class="info-box-title">✅ Bài Học Từ Case 1</div>
                <p><strong>Confluence zone</strong> (Daily + 4H LFZ overlap) mang lại confidence cao. Entry trên 1H với trigger rõ ràng giúp SL chặt và RR lớn.</p>
            </div>
        </div>

        <!-- Case Study 2: ETH Short -->
        <div class="case-study win">
            <div class="case-header">
                <span class="case-title">📉 Case 2: ETH/USDT Short - HFZ Rejection</span>
                <span class="case-badge win">WIN +3.8%</span>
            </div>

            <div class="trade-details">
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Coin</div>
                    <div class="trade-detail-value">ETH</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Direction</div>
                    <div class="trade-detail-value negative">SHORT</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">RR Ratio</div>
                    <div class="trade-detail-value">2.8:1</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Result</div>
                    <div class="trade-detail-value positive">+3.8%</div>
                </div>
            </div>

            <div class="timeline">
                <div class="timeline-step htf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 1: HTF (Daily)</div>
                        <div class="timeline-text">ETH đang trong downtrend. Lower highs và lower lows liên tục. Bias: SHORT ONLY.</div>
                    </div>
                </div>
                <div class="timeline-step itf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 2: ITF (4H)</div>
                        <div class="timeline-text">HFZ được xác định tại $2,450 - $2,490 từ DPD pattern. Zone còn FRESH, chưa test lần nào.</div>
                    </div>
                </div>
                <div class="timeline-step ltf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 3: LTF (1H)</div>
                        <div class="timeline-text">Giá spike lên HFZ, tạo Bearish Engulfing mạnh + Volume spike. Entry: $2,465. SL: $2,510 (above zone).</div>
                    </div>
                </div>
                <div class="timeline-step result">
                    <div class="timeline-content">
                        <div class="timeline-label">Kết Quả</div>
                        <div class="timeline-text">TP hit tại $2,340. Profit +3.8%. Trade aligned với HTF trend → smooth move to target.</div>
                    </div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/800x450/112250/EF4444?text=ETH+Short+Multi-TF+Analysis" alt="ETH Short Case">
            </div>

            <div class="info-box success">
                <div class="info-box-title">✅ Bài Học Từ Case 2</div>
                <p>Trade <strong>theo hướng HTF</strong> luôn smooth hơn. Fresh HFZ + HTF downtrend = High probability short setup.</p>
            </div>
        </div>

        <!-- Case Study 3: BNB Loss -->
        <div class="case-study loss">
            <div class="case-header">
                <span class="case-title">⚠️ Case 3: BNB/USDT Long - Zone Conflict</span>
                <span class="case-badge loss">LOSS -1.5%</span>
            </div>

            <div class="trade-details">
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Coin</div>
                    <div class="trade-detail-value">BNB</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Direction</div>
                    <div class="trade-detail-value positive">LONG</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">RR Ratio</div>
                    <div class="trade-detail-value">2:1</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Result</div>
                    <div class="trade-detail-value negative">-1.5%</div>
                </div>
            </div>

            <div class="timeline">
                <div class="timeline-step htf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 1: HTF (Daily)</div>
                        <div class="timeline-text">BNB trong range, có Daily HFZ ngay phía trên tại $320. Không clear trend.</div>
                    </div>
                </div>
                <div class="timeline-step itf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 2: ITF (4H)</div>
                        <div class="timeline-text">4H LFZ tại $305 - $308. NHƯNG Daily HFZ chỉ cách $12 (3.5%) → Zone Conflict!</div>
                    </div>
                </div>
                <div class="timeline-step ltf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 3: LTF (1H)</div>
                        <div class="timeline-text">Vào Long tại 4H LFZ với Bullish Engulfing. Entry: $306.5. SL: $302.</div>
                    </div>
                </div>
                <div class="timeline-step result">
                    <div class="timeline-content">
                        <div class="timeline-label">Kết Quả</div>
                        <div class="timeline-text">Giá bounce lên $315 rồi reject mạnh từ Daily HFZ $320. SL hit. Loss -1.5%.</div>
                    </div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/800x450/112250/FFBD59?text=BNB+Zone+Conflict+Case" alt="BNB Loss Case">
            </div>

            <div class="info-box danger">
                <div class="info-box-title">❌ Bài Học Từ Case 3</div>
                <p><strong>Zone Conflict là red flag!</strong> Khi ITF LFZ nằm gần HTF HFZ, upside bị giới hạn. Nên SKIP trade hoặc take partial profit sớm.</p>
            </div>
        </div>

        <!-- Case Study 4: SOL Win -->
        <div class="case-study win">
            <div class="case-header">
                <span class="case-title">⭐ Case 4: SOL/USDT Long - Perfect Alignment</span>
                <span class="case-badge win">WIN +6.5%</span>
            </div>

            <div class="trade-details">
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Coin</div>
                    <div class="trade-detail-value">SOL</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Direction</div>
                    <div class="trade-detail-value positive">LONG</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">RR Ratio</div>
                    <div class="trade-detail-value">4.3:1</div>
                </div>
                <div class="trade-detail-item">
                    <div class="trade-detail-label">Result</div>
                    <div class="trade-detail-value positive">+6.5%</div>
                </div>
            </div>

            <div class="timeline">
                <div class="timeline-step htf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 1: HTF (Daily)</div>
                        <div class="timeline-text">SOL strong uptrend, vừa break ATH. Daily LFZ tại $95 - $100 từ last impulse base.</div>
                    </div>
                </div>
                <div class="timeline-step itf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 2: ITF (4H)</div>
                        <div class="timeline-text">4H LFZ overlap với Daily tại $97 - $100. FRESH zone + Confluence = A+ Setup!</div>
                    </div>
                </div>
                <div class="timeline-step ltf">
                    <div class="timeline-content">
                        <div class="timeline-label">Step 3: LTF (1H)</div>
                        <div class="timeline-text">Giá về zone, tạo Double Bottom + Bullish Engulfing trên 1H. Entry: $98.5. SL: $95 (below zone).</div>
                    </div>
                </div>
                <div class="timeline-step result">
                    <div class="timeline-content">
                        <div class="timeline-label">Kết Quả</div>
                        <div class="timeline-text">SOL rally mạnh lên $113.5. TP hit với +6.5% profit. Perfect trade với full MTF alignment!</div>
                    </div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/800x450/112250/6A5BFF?text=SOL+Perfect+MTF+Alignment" alt="SOL Win Case">
            </div>

            <div class="info-box success">
                <div class="info-box-title">⭐ Bài Học Từ Case 4</div>
                <p><strong>Perfect MTF Alignment</strong> = HTF uptrend + HTF/ITF confluence zone + LTF trigger → High probability, high reward setup. Đây là "A+ Trade" cần chờ đợi!</p>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Các Case Study</h3>
            <ul class="summary-list">
                <li><strong>Case 1 (BTC):</strong> Confluence zone tăng confidence → WIN</li>
                <li><strong>Case 2 (ETH):</strong> Trade theo HTF trend luôn smooth → WIN</li>
                <li><strong>Case 3 (BNB):</strong> Zone Conflict = Red Flag → LOSS</li>
                <li><strong>Case 4 (SOL):</strong> Perfect MTF Alignment = A+ Setup → BIG WIN</li>
                <li><strong>Key Takeaway:</strong> Chờ đợi setup có HTF/ITF alignment, tránh zone conflict</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="2">
                <p>1. Trong Case 3 (BNB), lý do chính trade thua là gì?</p>
                <button class="quiz-option" data-index="0">Entry trigger không rõ ràng</button>
                <button class="quiz-option" data-index="1">Stoploss đặt quá chặt</button>
                <button class="quiz-option" data-index="2">Zone Conflict - Daily HFZ chặn upside</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p>2. "Perfect MTF Alignment" bao gồm những yếu tố nào?</p>
                <button class="quiz-option" data-index="0">HTF trend + HTF/ITF confluence + LTF trigger</button>
                <button class="quiz-option" data-index="1">Chỉ cần LTF trigger mạnh</button>
                <button class="quiz-option" data-index="2">RSI oversold + MACD cross</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p>3. Trong Case 2 (ETH Short), yếu tố nào giúp trade smooth nhất?</p>
                <button class="quiz-option" data-index="0">Zone còn Fresh</button>
                <button class="quiz-option" data-index="1">Trade theo hướng HTF downtrend</button>
                <button class="quiz-option" data-index="2">Bearish Engulfing candle</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-number"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="btn-retake" onclick="retakeQuiz()">Làm Lại Quiz</button>
            </div>
        </div>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 2</p>
            <p>© 2025 GEM Frequency Trading Method</p>
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

        function retakeQuiz() {
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
