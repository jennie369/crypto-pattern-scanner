-- =====================================================
-- TIER-2 - Chương 5: Zone Grading System
-- Course: course-tier2-trading-advanced
-- File 13/23
-- =====================================================

-- Create/Update Module
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  'module-tier-2-ch5',
  'course-tier2-trading-advanced',
  'Chương 5: Zone Grading System',
  'Hệ thống chấm điểm zones',
  5,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Lesson 5.1: Hệ Thống Chấm Điểm Zone - Tier 2
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch5-l1',
  'module-tier-2-ch5',
  'course-tier2-trading-advanced',
  'Bài 5.1: Hệ Thống Chấm Điểm Zone - Tier 2',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 5.1: Hệ Thống Chấm Điểm Zone - Tier 2</title>
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

        /* Score Meter */
        .score-meter {
            display: flex;
            justify-content: space-between;
            margin: 1.5rem 0;
            padding: 1rem;
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
        }

        .meter-segment {
            flex: 1;
            text-align: center;
            padding: 0.5rem;
            border-radius: 4px;
            margin: 0 2px;
        }

        .meter-segment.low {
            background: rgba(239, 68, 68, 0.2);
            border-bottom: 3px solid var(--danger-red);
        }

        .meter-segment.medium {
            background: rgba(255, 189, 89, 0.2);
            border-bottom: 3px solid var(--accent-gold);
        }

        .meter-segment.high {
            background: rgba(16, 185, 129, 0.2);
            border-bottom: 3px solid var(--success-green);
        }

        .meter-label {
            font-size: 0.75rem;
            color: var(--text-secondary);
        }

        .meter-score {
            font-weight: 700;
            font-size: 1.1rem;
        }

        .meter-segment.low .meter-score { color: var(--danger-red); }
        .meter-segment.medium .meter-score { color: var(--accent-gold); }
        .meter-segment.high .meter-score { color: var(--success-green); }

        /* Criteria Grid */
        .criteria-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .criteria-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: rgba(255,255,255,0.1);
                margin: 1rem -1rem;
                width: calc(100% + 2rem);
            }
        }

        .criteria-card {
            background: var(--bg-card-hover);
            border-radius: 8px;
            padding: 1rem;
            border-left: 3px solid var(--accent-gold);
        }

        @media (max-width: 600px) {
            .criteria-card {
                border-radius: 0;
            }
        }

        .criteria-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }

        .criteria-name {
            font-weight: 600;
            color: var(--accent-gold);
        }

        .criteria-points {
            background: rgba(255, 189, 89, 0.2);
            color: var(--accent-gold);
            padding: 0.25rem 0.75rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 700;
        }

        .criteria-desc {
            font-size: 0.9rem;
            color: var(--text-secondary);
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

        .highlight-red {
            color: var(--danger-red);
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="header-badge">⭐ Tier 2 - Bài 5.1</span>
            <h1 class="lesson-title">Hệ Thống Chấm Điểm Zone</h1>
            <p class="lesson-subtitle">Zone Quality Scoring System</p>
        </header>

        <!-- Section 1: Tại Sao Cần Chấm Điểm -->
        <div class="content-card">
            <div class="card-header">
                <h2>🎯 Tại Sao Cần Chấm Điểm Zone?</h2>
            </div>
            <div class="card-content">
                <p>Không phải tất cả zone đều có <span class="highlight-gold">chất lượng như nhau</span>. Hệ thống chấm điểm giúp bạn:</p>

                <ul class="styled-list">
                    <li><strong>Phân biệt zone tốt và xấu:</strong> Không phải zone nào cũng đáng trade</li>
                    <li><strong>Tăng win rate:</strong> Chỉ trade zone điểm cao → win rate tăng 15-20%</li>
                    <li><strong>Tiết kiệm thời gian:</strong> Bỏ qua zone yếu, focus zone mạnh</li>
                    <li><strong>Quản lý risk tốt hơn:</strong> Size lớn hơn cho zone điểm cao</li>
                </ul>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Sự Thật Phũ Phàng</div>
                    <p>Trader mới thường trade MỌI zone họ thấy → thua nhiều vì zone yếu. Trader giỏi CHỈ trade zone chất lượng cao.</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/FFBD59?text=High+vs+Low+Quality+Zone" alt="Zone Quality Comparison">
                </div>
            </div>
        </div>

        <!-- Section 2: Thang Điểm 1-10 -->
        <div class="content-card">
            <div class="card-header">
                <h2>📊 Thang Điểm Zone 1-10</h2>
            </div>
            <div class="card-content">
                <p>GEM sử dụng thang điểm <span class="highlight-gold">1 đến 10</span> để đánh giá chất lượng zone:</p>

                <div class="score-meter">
                    <div class="meter-segment low">
                        <div class="meter-score">1-4</div>
                        <div class="meter-label">SKIP</div>
                    </div>
                    <div class="meter-segment medium">
                        <div class="meter-score">5-6</div>
                        <div class="meter-label">CAUTION</div>
                    </div>
                    <div class="meter-segment high">
                        <div class="meter-score">7-10</div>
                        <div class="meter-label">TRADE</div>
                    </div>
                </div>

                <div class="info-box danger">
                    <div class="info-box-title">❌ Zone 1-4 Điểm: SKIP</div>
                    <p>Không trade. Zone quá yếu, xác suất win thấp. Bỏ qua và đợi setup tốt hơn.</p>
                </div>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Zone 5-6 Điểm: CAUTION</div>
                    <p>Có thể trade với size NHỎ (50% size bình thường). Cần thêm confirmation mạnh trên LTF.</p>
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Zone 7-10 Điểm: TRADE</div>
                    <p>Trade với size bình thường hoặc lớn hơn. Đây là setup A+ cần tận dụng!</p>
                </div>
            </div>
        </div>

        <!-- Section 3: 6 Tiêu Chí Chấm Điểm -->
        <div class="content-card">
            <div class="card-header">
                <h2>📋 6 Tiêu Chí Chấm Điểm Zone</h2>
            </div>
            <div class="card-content">
                <p>Mỗi zone được đánh giá dựa trên <span class="highlight-gold">6 tiêu chí</span>, tổng tối đa 10 điểm:</p>

                <div class="criteria-grid">
                    <div class="criteria-card">
                        <div class="criteria-header">
                            <span class="criteria-name">1. Freshness</span>
                            <span class="criteria-points">+2</span>
                        </div>
                        <div class="criteria-desc">Zone chưa được test lần nào (FRESH) = +2 điểm</div>
                    </div>
                    <div class="criteria-card">
                        <div class="criteria-header">
                            <span class="criteria-name">2. HTF Confluence</span>
                            <span class="criteria-points">+2</span>
                        </div>
                        <div class="criteria-desc">Zone trùng với HTF zone = +2 điểm</div>
                    </div>
                    <div class="criteria-card">
                        <div class="criteria-header">
                            <span class="criteria-name">3. Strong Departure</span>
                            <span class="criteria-points">+2</span>
                        </div>
                        <div class="criteria-desc">Giá rời khỏi zone mạnh mẽ, nến thân lớn = +2 điểm</div>
                    </div>
                    <div class="criteria-card">
                        <div class="criteria-header">
                            <span class="criteria-name">4. Little Time at Zone</span>
                            <span class="criteria-points">+1</span>
                        </div>
                        <div class="criteria-desc">Giá chỉ ở zone ngắn (<5 nến) = +1 điểm</div>
                    </div>
                    <div class="criteria-card">
                        <div class="criteria-header">
                            <span class="criteria-name">5. Zone Size</span>
                            <span class="criteria-points">+2</span>
                        </div>
                        <div class="criteria-desc">Zone mỏng (<2% giá) = +2 điểm</div>
                    </div>
                    <div class="criteria-card">
                        <div class="criteria-header">
                            <span class="criteria-name">6. Clear Pattern</span>
                            <span class="criteria-points">+1</span>
                        </div>
                        <div class="criteria-desc">Pattern rõ ràng (UPU, DPD...) = +1 điểm</div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/00F0FF?text=6+Scoring+Criteria+Visual" alt="6 Scoring Criteria">
                </div>

                <div class="info-box">
                    <div class="info-box-title">💡 Base Score</div>
                    <p>Mọi zone hợp lệ (có pattern rõ ràng) bắt đầu với <strong>base score = 2 điểm</strong>. Các tiêu chí trên sẽ cộng thêm vào base.</p>
                </div>
            </div>
        </div>

        <!-- Section 4: Ví Dụ Tính Điểm -->
        <div class="content-card">
            <div class="card-header">
                <h2>📝 Ví Dụ Tính Điểm Zone</h2>
            </div>
            <div class="card-content">
                <div class="info-box success">
                    <div class="info-box-title">✅ Ví Dụ Zone Điểm Cao</div>
                    <p><strong>BTC 4H LFZ tại $42,000:</strong></p>
                    <ul class="styled-list">
                        <li>Base score: +2</li>
                        <li>Fresh zone (chưa test): +2</li>
                        <li>Confluence với Daily LFZ: +2</li>
                        <li>Strong departure (nến 3%): +2</li>
                        <li>Little time (3 nến): +1</li>
                    </ul>
                    <p><strong>Tổng: 9/10 điểm → A+ TRADE!</strong></p>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/10B981?text=High+Score+Zone+Example+9-10" alt="High Score Example">
                </div>

                <div class="info-box danger">
                    <div class="info-box-title">❌ Ví Dụ Zone Điểm Thấp</div>
                    <p><strong>ETH 4H HFZ tại $2,450:</strong></p>
                    <ul class="styled-list">
                        <li>Base score: +2</li>
                        <li>Tested 2 lần: +0</li>
                        <li>Không có HTF confluence: +0</li>
                        <li>Weak departure: +0</li>
                        <li>Zone dày (4%): +0</li>
                    </ul>
                    <p><strong>Tổng: 2/10 điểm → SKIP!</strong></p>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/EF4444?text=Low+Score+Zone+Example+2-3" alt="Low Score Example">
                </div>
            </div>
        </div>

        <!-- Section 5: Action Based on Score -->
        <div class="content-card">
            <div class="card-header">
                <h2>🎯 Hành Động Theo Điểm Số</h2>
            </div>
            <div class="card-content">
                <p>Dựa vào điểm số, <span class="highlight-gold">quyết định hành động</span> cụ thể:</p>

                <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                    <thead>
                        <tr>
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--accent-gold); color: var(--accent-gold);">Điểm</th>
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--accent-gold); color: var(--accent-gold);">Hành Động</th>
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--accent-gold); color: var(--accent-gold);">Size</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--danger-red);">1-4</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">SKIP - Không trade</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">0%</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--accent-gold);">5-6</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">Trade thận trọng</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">50%</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green);">7-8</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">Trade bình thường</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">100%</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; color: var(--success-green);">9-10</td>
                            <td style="padding: 0.75rem; color: var(--text-secondary);">Trade mạnh (A+ Setup)</td>
                            <td style="padding: 0.75rem; color: var(--text-secondary);">100-150%</td>
                        </tr>
                    </tbody>
                </table>

                <div class="info-box success">
                    <div class="info-box-title">✅ Pro Tip</div>
                    <p>Ghi lại điểm số của mỗi zone trước khi trade. Sau 50+ trades, review lại xem zone điểm cao có win rate thực sự cao hơn không.</p>
                </div>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Hệ thống chấm điểm <strong>1-10</strong> giúp đánh giá chất lượng zone</li>
                <li><strong>6 tiêu chí:</strong> Freshness, HTF Confluence, Departure, Time, Size, Pattern</li>
                <li><strong>Zone 1-4:</strong> SKIP | <strong>5-6:</strong> Caution | <strong>7-10:</strong> Trade</li>
                <li>Chỉ trade zone <strong>điểm cao</strong> để tăng win rate 15-20%</li>
                <li>Điều chỉnh <strong>position size</strong> theo điểm số zone</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="1">
                <p>1. Zone điểm bao nhiêu nên SKIP không trade?</p>
                <button class="quiz-option" data-index="0">5-6 điểm</button>
                <button class="quiz-option" data-index="1">1-4 điểm</button>
                <button class="quiz-option" data-index="2">7-8 điểm</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p>2. Tiêu chí nào cho +2 điểm khi zone chưa được test lần nào?</p>
                <button class="quiz-option" data-index="0">Freshness</button>
                <button class="quiz-option" data-index="1">Strong Departure</button>
                <button class="quiz-option" data-index="2">Little Time at Zone</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p>3. Với zone 9-10 điểm (A+ Setup), position size nên là bao nhiêu?</p>
                <button class="quiz-option" data-index="0">50% size bình thường</button>
                <button class="quiz-option" data-index="1">100% size bình thường</button>
                <button class="quiz-option" data-index="2">100-150% size bình thường</button>
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
    <title>Bài 5.1: Hệ Thống Chấm Điểm Zone - Tier 2</title>
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

        /* Score Meter */
        .score-meter {
            display: flex;
            justify-content: space-between;
            margin: 1.5rem 0;
            padding: 1rem;
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
        }

        .meter-segment {
            flex: 1;
            text-align: center;
            padding: 0.5rem;
            border-radius: 4px;
            margin: 0 2px;
        }

        .meter-segment.low {
            background: rgba(239, 68, 68, 0.2);
            border-bottom: 3px solid var(--danger-red);
        }

        .meter-segment.medium {
            background: rgba(255, 189, 89, 0.2);
            border-bottom: 3px solid var(--accent-gold);
        }

        .meter-segment.high {
            background: rgba(16, 185, 129, 0.2);
            border-bottom: 3px solid var(--success-green);
        }

        .meter-label {
            font-size: 0.75rem;
            color: var(--text-secondary);
        }

        .meter-score {
            font-weight: 700;
            font-size: 1.1rem;
        }

        .meter-segment.low .meter-score { color: var(--danger-red); }
        .meter-segment.medium .meter-score { color: var(--accent-gold); }
        .meter-segment.high .meter-score { color: var(--success-green); }

        /* Criteria Grid */
        .criteria-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .criteria-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: rgba(255,255,255,0.1);
                margin: 1rem -1rem;
                width: calc(100% + 2rem);
            }
        }

        .criteria-card {
            background: var(--bg-card-hover);
            border-radius: 8px;
            padding: 1rem;
            border-left: 3px solid var(--accent-gold);
        }

        @media (max-width: 600px) {
            .criteria-card {
                border-radius: 0;
            }
        }

        .criteria-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }

        .criteria-name {
            font-weight: 600;
            color: var(--accent-gold);
        }

        .criteria-points {
            background: rgba(255, 189, 89, 0.2);
            color: var(--accent-gold);
            padding: 0.25rem 0.75rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 700;
        }

        .criteria-desc {
            font-size: 0.9rem;
            color: var(--text-secondary);
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

        .highlight-red {
            color: var(--danger-red);
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="header-badge">⭐ Tier 2 - Bài 5.1</span>
            <h1 class="lesson-title">Hệ Thống Chấm Điểm Zone</h1>
            <p class="lesson-subtitle">Zone Quality Scoring System</p>
        </header>

        <!-- Section 1: Tại Sao Cần Chấm Điểm -->
        <div class="content-card">
            <div class="card-header">
                <h2>🎯 Tại Sao Cần Chấm Điểm Zone?</h2>
            </div>
            <div class="card-content">
                <p>Không phải tất cả zone đều có <span class="highlight-gold">chất lượng như nhau</span>. Hệ thống chấm điểm giúp bạn:</p>

                <ul class="styled-list">
                    <li><strong>Phân biệt zone tốt và xấu:</strong> Không phải zone nào cũng đáng trade</li>
                    <li><strong>Tăng win rate:</strong> Chỉ trade zone điểm cao → win rate tăng 15-20%</li>
                    <li><strong>Tiết kiệm thời gian:</strong> Bỏ qua zone yếu, focus zone mạnh</li>
                    <li><strong>Quản lý risk tốt hơn:</strong> Size lớn hơn cho zone điểm cao</li>
                </ul>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Sự Thật Phũ Phàng</div>
                    <p>Trader mới thường trade MỌI zone họ thấy → thua nhiều vì zone yếu. Trader giỏi CHỈ trade zone chất lượng cao.</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/FFBD59?text=High+vs+Low+Quality+Zone" alt="Zone Quality Comparison">
                </div>
            </div>
        </div>

        <!-- Section 2: Thang Điểm 1-10 -->
        <div class="content-card">
            <div class="card-header">
                <h2>📊 Thang Điểm Zone 1-10</h2>
            </div>
            <div class="card-content">
                <p>GEM sử dụng thang điểm <span class="highlight-gold">1 đến 10</span> để đánh giá chất lượng zone:</p>

                <div class="score-meter">
                    <div class="meter-segment low">
                        <div class="meter-score">1-4</div>
                        <div class="meter-label">SKIP</div>
                    </div>
                    <div class="meter-segment medium">
                        <div class="meter-score">5-6</div>
                        <div class="meter-label">CAUTION</div>
                    </div>
                    <div class="meter-segment high">
                        <div class="meter-score">7-10</div>
                        <div class="meter-label">TRADE</div>
                    </div>
                </div>

                <div class="info-box danger">
                    <div class="info-box-title">❌ Zone 1-4 Điểm: SKIP</div>
                    <p>Không trade. Zone quá yếu, xác suất win thấp. Bỏ qua và đợi setup tốt hơn.</p>
                </div>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Zone 5-6 Điểm: CAUTION</div>
                    <p>Có thể trade với size NHỎ (50% size bình thường). Cần thêm confirmation mạnh trên LTF.</p>
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Zone 7-10 Điểm: TRADE</div>
                    <p>Trade với size bình thường hoặc lớn hơn. Đây là setup A+ cần tận dụng!</p>
                </div>
            </div>
        </div>

        <!-- Section 3: 6 Tiêu Chí Chấm Điểm -->
        <div class="content-card">
            <div class="card-header">
                <h2>📋 6 Tiêu Chí Chấm Điểm Zone</h2>
            </div>
            <div class="card-content">
                <p>Mỗi zone được đánh giá dựa trên <span class="highlight-gold">6 tiêu chí</span>, tổng tối đa 10 điểm:</p>

                <div class="criteria-grid">
                    <div class="criteria-card">
                        <div class="criteria-header">
                            <span class="criteria-name">1. Freshness</span>
                            <span class="criteria-points">+2</span>
                        </div>
                        <div class="criteria-desc">Zone chưa được test lần nào (FRESH) = +2 điểm</div>
                    </div>
                    <div class="criteria-card">
                        <div class="criteria-header">
                            <span class="criteria-name">2. HTF Confluence</span>
                            <span class="criteria-points">+2</span>
                        </div>
                        <div class="criteria-desc">Zone trùng với HTF zone = +2 điểm</div>
                    </div>
                    <div class="criteria-card">
                        <div class="criteria-header">
                            <span class="criteria-name">3. Strong Departure</span>
                            <span class="criteria-points">+2</span>
                        </div>
                        <div class="criteria-desc">Giá rời khỏi zone mạnh mẽ, nến thân lớn = +2 điểm</div>
                    </div>
                    <div class="criteria-card">
                        <div class="criteria-header">
                            <span class="criteria-name">4. Little Time at Zone</span>
                            <span class="criteria-points">+1</span>
                        </div>
                        <div class="criteria-desc">Giá chỉ ở zone ngắn (<5 nến) = +1 điểm</div>
                    </div>
                    <div class="criteria-card">
                        <div class="criteria-header">
                            <span class="criteria-name">5. Zone Size</span>
                            <span class="criteria-points">+2</span>
                        </div>
                        <div class="criteria-desc">Zone mỏng (<2% giá) = +2 điểm</div>
                    </div>
                    <div class="criteria-card">
                        <div class="criteria-header">
                            <span class="criteria-name">6. Clear Pattern</span>
                            <span class="criteria-points">+1</span>
                        </div>
                        <div class="criteria-desc">Pattern rõ ràng (UPU, DPD...) = +1 điểm</div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/00F0FF?text=6+Scoring+Criteria+Visual" alt="6 Scoring Criteria">
                </div>

                <div class="info-box">
                    <div class="info-box-title">💡 Base Score</div>
                    <p>Mọi zone hợp lệ (có pattern rõ ràng) bắt đầu với <strong>base score = 2 điểm</strong>. Các tiêu chí trên sẽ cộng thêm vào base.</p>
                </div>
            </div>
        </div>

        <!-- Section 4: Ví Dụ Tính Điểm -->
        <div class="content-card">
            <div class="card-header">
                <h2>📝 Ví Dụ Tính Điểm Zone</h2>
            </div>
            <div class="card-content">
                <div class="info-box success">
                    <div class="info-box-title">✅ Ví Dụ Zone Điểm Cao</div>
                    <p><strong>BTC 4H LFZ tại $42,000:</strong></p>
                    <ul class="styled-list">
                        <li>Base score: +2</li>
                        <li>Fresh zone (chưa test): +2</li>
                        <li>Confluence với Daily LFZ: +2</li>
                        <li>Strong departure (nến 3%): +2</li>
                        <li>Little time (3 nến): +1</li>
                    </ul>
                    <p><strong>Tổng: 9/10 điểm → A+ TRADE!</strong></p>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/10B981?text=High+Score+Zone+Example+9-10" alt="High Score Example">
                </div>

                <div class="info-box danger">
                    <div class="info-box-title">❌ Ví Dụ Zone Điểm Thấp</div>
                    <p><strong>ETH 4H HFZ tại $2,450:</strong></p>
                    <ul class="styled-list">
                        <li>Base score: +2</li>
                        <li>Tested 2 lần: +0</li>
                        <li>Không có HTF confluence: +0</li>
                        <li>Weak departure: +0</li>
                        <li>Zone dày (4%): +0</li>
                    </ul>
                    <p><strong>Tổng: 2/10 điểm → SKIP!</strong></p>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/EF4444?text=Low+Score+Zone+Example+2-3" alt="Low Score Example">
                </div>
            </div>
        </div>

        <!-- Section 5: Action Based on Score -->
        <div class="content-card">
            <div class="card-header">
                <h2>🎯 Hành Động Theo Điểm Số</h2>
            </div>
            <div class="card-content">
                <p>Dựa vào điểm số, <span class="highlight-gold">quyết định hành động</span> cụ thể:</p>

                <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                    <thead>
                        <tr>
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--accent-gold); color: var(--accent-gold);">Điểm</th>
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--accent-gold); color: var(--accent-gold);">Hành Động</th>
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--accent-gold); color: var(--accent-gold);">Size</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--danger-red);">1-4</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">SKIP - Không trade</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">0%</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--accent-gold);">5-6</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">Trade thận trọng</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">50%</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green);">7-8</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">Trade bình thường</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">100%</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; color: var(--success-green);">9-10</td>
                            <td style="padding: 0.75rem; color: var(--text-secondary);">Trade mạnh (A+ Setup)</td>
                            <td style="padding: 0.75rem; color: var(--text-secondary);">100-150%</td>
                        </tr>
                    </tbody>
                </table>

                <div class="info-box success">
                    <div class="info-box-title">✅ Pro Tip</div>
                    <p>Ghi lại điểm số của mỗi zone trước khi trade. Sau 50+ trades, review lại xem zone điểm cao có win rate thực sự cao hơn không.</p>
                </div>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Hệ thống chấm điểm <strong>1-10</strong> giúp đánh giá chất lượng zone</li>
                <li><strong>6 tiêu chí:</strong> Freshness, HTF Confluence, Departure, Time, Size, Pattern</li>
                <li><strong>Zone 1-4:</strong> SKIP | <strong>5-6:</strong> Caution | <strong>7-10:</strong> Trade</li>
                <li>Chỉ trade zone <strong>điểm cao</strong> để tăng win rate 15-20%</li>
                <li>Điều chỉnh <strong>position size</strong> theo điểm số zone</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="1">
                <p>1. Zone điểm bao nhiêu nên SKIP không trade?</p>
                <button class="quiz-option" data-index="0">5-6 điểm</button>
                <button class="quiz-option" data-index="1">1-4 điểm</button>
                <button class="quiz-option" data-index="2">7-8 điểm</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p>2. Tiêu chí nào cho +2 điểm khi zone chưa được test lần nào?</p>
                <button class="quiz-option" data-index="0">Freshness</button>
                <button class="quiz-option" data-index="1">Strong Departure</button>
                <button class="quiz-option" data-index="2">Little Time at Zone</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p>3. Với zone 9-10 điểm (A+ Setup), position size nên là bao nhiêu?</p>
                <button class="quiz-option" data-index="0">50% size bình thường</button>
                <button class="quiz-option" data-index="1">100% size bình thường</button>
                <button class="quiz-option" data-index="2">100-150% size bình thường</button>
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

-- Lesson 5.2: Odds Enhancers - Tier 2
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch5-l2',
  'module-tier-2-ch5',
  'course-tier2-trading-advanced',
  'Bài 5.2: Odds Enhancers - Tier 2',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 5.2: Odds Enhancers - Tier 2</title>
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
        }

        .info-box.success .info-box-title { color: var(--success-green); }
        .info-box.danger .info-box-title { color: var(--danger-red); }
        .info-box.cyan .info-box-title { color: var(--accent-cyan); }

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

        /* Enhancer Card */
        .enhancer-card {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1rem;
            border-left: 4px solid var(--accent-gold);
        }

        @media (max-width: 600px) {
            .enhancer-card {
                border-radius: 0;
                margin-left: -1rem;
                margin-right: -1rem;
                padding: 1rem;
            }
        }

        .enhancer-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
        }

        .enhancer-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .enhancer-points {
            background: linear-gradient(135deg, var(--accent-gold) 0%, #FFD700 100%);
            color: #112250;
            padding: 0.25rem 1rem;
            border-radius: 50px;
            font-weight: 700;
            font-size: 0.9rem;
        }

        .enhancer-desc {
            color: var(--text-secondary);
            margin-bottom: 0.75rem;
        }

        .enhancer-example {
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
            padding: 0.75rem;
            font-size: 0.9rem;
        }

        .enhancer-example-label {
            color: var(--accent-cyan);
            font-weight: 600;
            margin-bottom: 0.25rem;
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
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="header-badge">⭐ Tier 2 - Bài 5.2</span>
            <h1 class="lesson-title">Odds Enhancers</h1>
            <p class="lesson-subtitle">Yếu Tố Tăng Xác Suất Thắng</p>
        </header>

        <!-- Section 1: Odds Enhancers Là Gì -->
        <div class="content-card">
            <div class="card-header">
                <h2>🎯 Odds Enhancers Là Gì?</h2>
            </div>
            <div class="card-content">
                <p><span class="highlight-gold">Odds Enhancers</span> là các yếu tố bổ sung giúp tăng xác suất thắng của một trade. Mỗi enhancer có điểm số riêng, cộng thêm vào base score của zone.</p>

                <div class="info-box success">
                    <div class="info-box-title">✅ Tại Sao Quan Trọng?</div>
                    <ul class="styled-list">
                        <li>Zone có nhiều enhancers = Xác suất win cao hơn</li>
                        <li>Giúp phân biệt A+ setup vs B/C setup</li>
                        <li>Tăng confidence khi entry</li>
                        <li>Cơ sở để điều chỉnh position size</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/FFBD59?text=Odds+Enhancers+Overview" alt="Odds Enhancers">
                </div>
            </div>
        </div>

        <!-- Enhancer 1: Fresh Zone -->
        <div class="content-card">
            <div class="card-header">
                <h2>1️⃣ Fresh Zone (Chưa Test)</h2>
            </div>
            <div class="card-content">
                <div class="enhancer-card">
                    <div class="enhancer-header">
                        <span class="enhancer-title">FRESH ZONE</span>
                        <span class="enhancer-points">+2 ĐIỂM</span>
                    </div>
                    <div class="enhancer-desc">Zone chưa được test lần nào kể từ khi hình thành. Đây là zone mạnh nhất vì còn nhiều unfilled orders.</div>
                    <div class="enhancer-example">
                        <div class="enhancer-example-label">Ví dụ:</div>
                        BTC tạo LFZ tại $40,000 và giá chưa bao giờ quay lại test → FRESH = +2 điểm
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/10B981?text=Fresh+Zone+Example" alt="Fresh Zone">
                </div>

                <div class="info-box">
                    <div class="info-box-title" style="color: var(--accent-gold);">💡 Tại Sao Fresh Zone Mạnh?</div>
                    <p>Khi zone hình thành, Smart Money để lại nhiều lệnh chưa khớp. Lần đầu giá quay lại, những lệnh này sẽ được trigger → Reaction mạnh!</p>
                </div>
            </div>
        </div>

        <!-- Enhancer 2: HTF Confluence -->
        <div class="content-card">
            <div class="card-header">
                <h2>2️⃣ HTF Confluence</h2>
            </div>
            <div class="card-content">
                <div class="enhancer-card">
                    <div class="enhancer-header">
                        <span class="enhancer-title">HTF CONFLUENCE</span>
                        <span class="enhancer-points">+2 ĐIỂM</span>
                    </div>
                    <div class="enhancer-desc">Zone trùng với zone từ Higher Timeframe (Daily zone overlap với 4H zone).</div>
                    <div class="enhancer-example">
                        <div class="enhancer-example-label">Ví dụ:</div>
                        4H LFZ tại $42,000 + Daily LFZ cũng tại $42,000 → HTF Confluence = +2 điểm
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/6A5BFF?text=HTF+Confluence+Example" alt="HTF Confluence">
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Double Confirmation</div>
                    <p>Khi cả Daily VÀ 4H đều có zone tại cùng vùng giá, đây là <strong>double confirmation</strong> từ Smart Money. Win rate tăng lên 75%+!</p>
                </div>
            </div>
        </div>

        <!-- Enhancer 3: Strong Departure -->
        <div class="content-card">
            <div class="card-header">
                <h2>3️⃣ Strong Departure</h2>
            </div>
            <div class="card-content">
                <div class="enhancer-card">
                    <div class="enhancer-header">
                        <span class="enhancer-title">STRONG DEPARTURE</span>
                        <span class="enhancer-points">+2 ĐIỂM</span>
                    </div>
                    <div class="enhancer-desc">Giá rời khỏi zone với momentum mạnh - nến thân lớn (>2% body), volume cao.</div>
                    <div class="enhancer-example">
                        <div class="enhancer-example-label">Ví dụ:</div>
                        Giá bounce từ LFZ với nến +5% và volume gấp 3 lần average → Strong Departure = +2 điểm
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/00F0FF?text=Strong+Departure+Example" alt="Strong Departure">
                </div>

                <div class="info-box cyan">
                    <div class="info-box-title">💡 Logic Đằng Sau</div>
                    <p>Strong departure = Smart Money đang aggressive tại zone này. Họ muốn giá ra khỏi zone nhanh → Lần test lại sẽ có reaction tương tự.</p>
                </div>
            </div>
        </div>

        <!-- Enhancer 4: Little Time at Zone -->
        <div class="content-card">
            <div class="card-header">
                <h2>4️⃣ Little Time at Zone</h2>
            </div>
            <div class="card-content">
                <div class="enhancer-card">
                    <div class="enhancer-header">
                        <span class="enhancer-title">LITTLE TIME AT ZONE</span>
                        <span class="enhancer-points">+1 ĐIỂM</span>
                    </div>
                    <div class="enhancer-desc">Giá chỉ ở tại zone trong thời gian ngắn (<5 nến) trước khi rời đi.</div>
                    <div class="enhancer-example">
                        <div class="enhancer-example-label">Ví dụ:</div>
                        LFZ hình thành với chỉ 3 nến base trước khi bùng nổ tăng → Little Time = +1 điểm
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/FFBD59?text=Little+Time+at+Zone" alt="Little Time">
                </div>

                <div class="info-box">
                    <div class="info-box-title" style="color: var(--accent-gold);">💡 Ngược Lại</div>
                    <p>Zone với nhiều nến (>10 nến) = Smart Money đã có nhiều thời gian fill orders → Ít unfilled orders còn lại → Zone yếu hơn.</p>
                </div>
            </div>
        </div>

        <!-- Section: Tổng Kết Enhancers -->
        <div class="content-card">
            <div class="card-header">
                <h2>📊 Tổng Kết Tất Cả Enhancers</h2>
            </div>
            <div class="card-content">
                <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                    <thead>
                        <tr>
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--accent-gold); color: var(--accent-gold);">Enhancer</th>
                            <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--accent-gold); color: var(--accent-gold);">Điểm</th>
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--accent-gold); color: var(--accent-gold);">Điều Kiện</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">Fresh Zone</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green); font-weight: 700;">+2</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">Chưa test lần nào</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">HTF Confluence</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green); font-weight: 700;">+2</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">Trùng với HTF zone</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">Strong Departure</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green); font-weight: 700;">+2</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">Nến >2%, volume cao</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">Little Time</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--accent-gold); font-weight: 700;">+1</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);"><5 nến tại zone</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">Thin Zone</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green); font-weight: 700;">+2</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">Zone <2% giá</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem;">Clear Pattern</td>
                            <td style="padding: 0.75rem; text-align: center; color: var(--accent-gold); font-weight: 700;">+1</td>
                            <td style="padding: 0.75rem; color: var(--text-secondary);">UPU/DPD/DPU rõ ràng</td>
                        </tr>
                    </tbody>
                </table>

                <div class="info-box success">
                    <div class="info-box-title">✅ A+ Setup = 8+ Điểm</div>
                    <p>Base (2) + Fresh (2) + HTF Confluence (2) + Strong Departure (2) = <strong>8 điểm</strong> → Đây là setup A+ cần aggressive trade!</p>
                </div>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li><strong>Odds Enhancers</strong> = yếu tố tăng xác suất win</li>
                <li><strong>Fresh Zone:</strong> +2 điểm (chưa test lần nào)</li>
                <li><strong>HTF Confluence:</strong> +2 điểm (trùng HTF zone)</li>
                <li><strong>Strong Departure:</strong> +2 điểm (nến >2%, volume cao)</li>
                <li><strong>Little Time:</strong> +1 điểm (<5 nến tại zone)</li>
                <li>Càng nhiều enhancers = Càng tự tin trade</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="2">
                <p>1. Enhancer nào cho +2 điểm khi zone trùng với zone từ khung lớn hơn?</p>
                <button class="quiz-option" data-index="0">Fresh Zone</button>
                <button class="quiz-option" data-index="1">Strong Departure</button>
                <button class="quiz-option" data-index="2">HTF Confluence</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p>2. Tại sao Fresh Zone mạnh hơn zone đã test?</p>
                <button class="quiz-option" data-index="0">Còn nhiều unfilled orders chưa được trigger</button>
                <button class="quiz-option" data-index="1">Vì chart đẹp hơn</button>
                <button class="quiz-option" data-index="2">Vì volume cao hơn</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p>3. "Strong Departure" đòi hỏi điều kiện gì?</p>
                <button class="quiz-option" data-index="0">Zone phải Fresh</button>
                <button class="quiz-option" data-index="1">Nến rời zone >2% body, volume cao</button>
                <button class="quiz-option" data-index="2">Zone mỏng <1%</button>
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
    <title>Bài 5.2: Odds Enhancers - Tier 2</title>
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
        }

        .info-box.success .info-box-title { color: var(--success-green); }
        .info-box.danger .info-box-title { color: var(--danger-red); }
        .info-box.cyan .info-box-title { color: var(--accent-cyan); }

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

        /* Enhancer Card */
        .enhancer-card {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1rem;
            border-left: 4px solid var(--accent-gold);
        }

        @media (max-width: 600px) {
            .enhancer-card {
                border-radius: 0;
                margin-left: -1rem;
                margin-right: -1rem;
                padding: 1rem;
            }
        }

        .enhancer-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
        }

        .enhancer-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--accent-gold);
        }

        .enhancer-points {
            background: linear-gradient(135deg, var(--accent-gold) 0%, #FFD700 100%);
            color: #112250;
            padding: 0.25rem 1rem;
            border-radius: 50px;
            font-weight: 700;
            font-size: 0.9rem;
        }

        .enhancer-desc {
            color: var(--text-secondary);
            margin-bottom: 0.75rem;
        }

        .enhancer-example {
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
            padding: 0.75rem;
            font-size: 0.9rem;
        }

        .enhancer-example-label {
            color: var(--accent-cyan);
            font-weight: 600;
            margin-bottom: 0.25rem;
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
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="header-badge">⭐ Tier 2 - Bài 5.2</span>
            <h1 class="lesson-title">Odds Enhancers</h1>
            <p class="lesson-subtitle">Yếu Tố Tăng Xác Suất Thắng</p>
        </header>

        <!-- Section 1: Odds Enhancers Là Gì -->
        <div class="content-card">
            <div class="card-header">
                <h2>🎯 Odds Enhancers Là Gì?</h2>
            </div>
            <div class="card-content">
                <p><span class="highlight-gold">Odds Enhancers</span> là các yếu tố bổ sung giúp tăng xác suất thắng của một trade. Mỗi enhancer có điểm số riêng, cộng thêm vào base score của zone.</p>

                <div class="info-box success">
                    <div class="info-box-title">✅ Tại Sao Quan Trọng?</div>
                    <ul class="styled-list">
                        <li>Zone có nhiều enhancers = Xác suất win cao hơn</li>
                        <li>Giúp phân biệt A+ setup vs B/C setup</li>
                        <li>Tăng confidence khi entry</li>
                        <li>Cơ sở để điều chỉnh position size</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/FFBD59?text=Odds+Enhancers+Overview" alt="Odds Enhancers">
                </div>
            </div>
        </div>

        <!-- Enhancer 1: Fresh Zone -->
        <div class="content-card">
            <div class="card-header">
                <h2>1️⃣ Fresh Zone (Chưa Test)</h2>
            </div>
            <div class="card-content">
                <div class="enhancer-card">
                    <div class="enhancer-header">
                        <span class="enhancer-title">FRESH ZONE</span>
                        <span class="enhancer-points">+2 ĐIỂM</span>
                    </div>
                    <div class="enhancer-desc">Zone chưa được test lần nào kể từ khi hình thành. Đây là zone mạnh nhất vì còn nhiều unfilled orders.</div>
                    <div class="enhancer-example">
                        <div class="enhancer-example-label">Ví dụ:</div>
                        BTC tạo LFZ tại $40,000 và giá chưa bao giờ quay lại test → FRESH = +2 điểm
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/10B981?text=Fresh+Zone+Example" alt="Fresh Zone">
                </div>

                <div class="info-box">
                    <div class="info-box-title" style="color: var(--accent-gold);">💡 Tại Sao Fresh Zone Mạnh?</div>
                    <p>Khi zone hình thành, Smart Money để lại nhiều lệnh chưa khớp. Lần đầu giá quay lại, những lệnh này sẽ được trigger → Reaction mạnh!</p>
                </div>
            </div>
        </div>

        <!-- Enhancer 2: HTF Confluence -->
        <div class="content-card">
            <div class="card-header">
                <h2>2️⃣ HTF Confluence</h2>
            </div>
            <div class="card-content">
                <div class="enhancer-card">
                    <div class="enhancer-header">
                        <span class="enhancer-title">HTF CONFLUENCE</span>
                        <span class="enhancer-points">+2 ĐIỂM</span>
                    </div>
                    <div class="enhancer-desc">Zone trùng với zone từ Higher Timeframe (Daily zone overlap với 4H zone).</div>
                    <div class="enhancer-example">
                        <div class="enhancer-example-label">Ví dụ:</div>
                        4H LFZ tại $42,000 + Daily LFZ cũng tại $42,000 → HTF Confluence = +2 điểm
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/6A5BFF?text=HTF+Confluence+Example" alt="HTF Confluence">
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Double Confirmation</div>
                    <p>Khi cả Daily VÀ 4H đều có zone tại cùng vùng giá, đây là <strong>double confirmation</strong> từ Smart Money. Win rate tăng lên 75%+!</p>
                </div>
            </div>
        </div>

        <!-- Enhancer 3: Strong Departure -->
        <div class="content-card">
            <div class="card-header">
                <h2>3️⃣ Strong Departure</h2>
            </div>
            <div class="card-content">
                <div class="enhancer-card">
                    <div class="enhancer-header">
                        <span class="enhancer-title">STRONG DEPARTURE</span>
                        <span class="enhancer-points">+2 ĐIỂM</span>
                    </div>
                    <div class="enhancer-desc">Giá rời khỏi zone với momentum mạnh - nến thân lớn (>2% body), volume cao.</div>
                    <div class="enhancer-example">
                        <div class="enhancer-example-label">Ví dụ:</div>
                        Giá bounce từ LFZ với nến +5% và volume gấp 3 lần average → Strong Departure = +2 điểm
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/00F0FF?text=Strong+Departure+Example" alt="Strong Departure">
                </div>

                <div class="info-box cyan">
                    <div class="info-box-title">💡 Logic Đằng Sau</div>
                    <p>Strong departure = Smart Money đang aggressive tại zone này. Họ muốn giá ra khỏi zone nhanh → Lần test lại sẽ có reaction tương tự.</p>
                </div>
            </div>
        </div>

        <!-- Enhancer 4: Little Time at Zone -->
        <div class="content-card">
            <div class="card-header">
                <h2>4️⃣ Little Time at Zone</h2>
            </div>
            <div class="card-content">
                <div class="enhancer-card">
                    <div class="enhancer-header">
                        <span class="enhancer-title">LITTLE TIME AT ZONE</span>
                        <span class="enhancer-points">+1 ĐIỂM</span>
                    </div>
                    <div class="enhancer-desc">Giá chỉ ở tại zone trong thời gian ngắn (<5 nến) trước khi rời đi.</div>
                    <div class="enhancer-example">
                        <div class="enhancer-example-label">Ví dụ:</div>
                        LFZ hình thành với chỉ 3 nến base trước khi bùng nổ tăng → Little Time = +1 điểm
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/FFBD59?text=Little+Time+at+Zone" alt="Little Time">
                </div>

                <div class="info-box">
                    <div class="info-box-title" style="color: var(--accent-gold);">💡 Ngược Lại</div>
                    <p>Zone với nhiều nến (>10 nến) = Smart Money đã có nhiều thời gian fill orders → Ít unfilled orders còn lại → Zone yếu hơn.</p>
                </div>
            </div>
        </div>

        <!-- Section: Tổng Kết Enhancers -->
        <div class="content-card">
            <div class="card-header">
                <h2>📊 Tổng Kết Tất Cả Enhancers</h2>
            </div>
            <div class="card-content">
                <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                    <thead>
                        <tr>
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--accent-gold); color: var(--accent-gold);">Enhancer</th>
                            <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--accent-gold); color: var(--accent-gold);">Điểm</th>
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--accent-gold); color: var(--accent-gold);">Điều Kiện</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">Fresh Zone</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green); font-weight: 700;">+2</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">Chưa test lần nào</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">HTF Confluence</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green); font-weight: 700;">+2</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">Trùng với HTF zone</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">Strong Departure</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green); font-weight: 700;">+2</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">Nến >2%, volume cao</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">Little Time</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--accent-gold); font-weight: 700;">+1</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);"><5 nến tại zone</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">Thin Zone</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green); font-weight: 700;">+2</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">Zone <2% giá</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem;">Clear Pattern</td>
                            <td style="padding: 0.75rem; text-align: center; color: var(--accent-gold); font-weight: 700;">+1</td>
                            <td style="padding: 0.75rem; color: var(--text-secondary);">UPU/DPD/DPU rõ ràng</td>
                        </tr>
                    </tbody>
                </table>

                <div class="info-box success">
                    <div class="info-box-title">✅ A+ Setup = 8+ Điểm</div>
                    <p>Base (2) + Fresh (2) + HTF Confluence (2) + Strong Departure (2) = <strong>8 điểm</strong> → Đây là setup A+ cần aggressive trade!</p>
                </div>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li><strong>Odds Enhancers</strong> = yếu tố tăng xác suất win</li>
                <li><strong>Fresh Zone:</strong> +2 điểm (chưa test lần nào)</li>
                <li><strong>HTF Confluence:</strong> +2 điểm (trùng HTF zone)</li>
                <li><strong>Strong Departure:</strong> +2 điểm (nến >2%, volume cao)</li>
                <li><strong>Little Time:</strong> +1 điểm (<5 nến tại zone)</li>
                <li>Càng nhiều enhancers = Càng tự tin trade</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="2">
                <p>1. Enhancer nào cho +2 điểm khi zone trùng với zone từ khung lớn hơn?</p>
                <button class="quiz-option" data-index="0">Fresh Zone</button>
                <button class="quiz-option" data-index="1">Strong Departure</button>
                <button class="quiz-option" data-index="2">HTF Confluence</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p>2. Tại sao Fresh Zone mạnh hơn zone đã test?</p>
                <button class="quiz-option" data-index="0">Còn nhiều unfilled orders chưa được trigger</button>
                <button class="quiz-option" data-index="1">Vì chart đẹp hơn</button>
                <button class="quiz-option" data-index="2">Vì volume cao hơn</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p>3. "Strong Departure" đòi hỏi điều kiện gì?</p>
                <button class="quiz-option" data-index="0">Zone phải Fresh</button>
                <button class="quiz-option" data-index="1">Nến rời zone >2% body, volume cao</button>
                <button class="quiz-option" data-index="2">Zone mỏng <1%</button>
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

-- Lesson 5.3: Zone Scoring Worksheet - Tier 2
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch5-l3',
  'module-tier-2-ch5',
  'course-tier2-trading-advanced',
  'Bài 5.3: Zone Scoring Worksheet - Tier 2',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 5.3: Zone Scoring Worksheet - Tier 2</title>
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
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                padding: 1.5rem 1rem;
            }
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
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .lesson-subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
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
        }

        .info-box.success .info-box-title { color: var(--success-green); }
        .info-box.danger .info-box-title { color: var(--danger-red); }

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

        /* Worksheet Table */
        .worksheet {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .worksheet {
                border-radius: 0;
                margin: 1rem -1rem;
                padding: 1rem;
                width: calc(100% + 2rem);
            }
        }

        .worksheet-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--accent-gold);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .worksheet-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .worksheet-row:last-child {
            border-bottom: none;
        }

        .worksheet-label {
            color: var(--text-secondary);
        }

        .worksheet-value {
            font-weight: 600;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            background: rgba(255, 189, 89, 0.2);
            color: var(--accent-gold);
        }

        .worksheet-total {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 2px solid var(--accent-gold);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .worksheet-total-label {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--text-primary);
        }

        .worksheet-total-value {
            font-size: 1.5rem;
            font-weight: 700;
            padding: 0.5rem 1rem;
            border-radius: 8px;
        }

        .worksheet-total-value.high {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success-green);
        }

        .worksheet-total-value.low {
            background: rgba(239, 68, 68, 0.2);
            color: var(--danger-red);
        }

        /* Checklist Interactive */
        .checklist {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .checklist {
                border-radius: 0;
                margin: 1rem -1rem;
                padding: 1rem;
                width: calc(100% + 2rem);
            }
        }

        .checklist-item {
            display: flex;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .checklist-checkbox {
            width: 24px;
            height: 24px;
            border: 2px solid var(--accent-gold);
            border-radius: 4px;
            margin-right: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .checklist-checkbox.checked {
            background: var(--accent-gold);
        }

        .checklist-checkbox.checked::after {
            content: ''✓'';
            color: #112250;
            font-weight: bold;
        }

        .checklist-label {
            flex: 1;
            color: var(--text-secondary);
        }

        .checklist-points {
            font-weight: 600;
            color: var(--accent-gold);
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
            <span class="header-badge">⭐ Tier 2 - Bài 5.3</span>
            <h1 class="lesson-title">Zone Scoring Worksheet</h1>
            <p class="lesson-subtitle">Bảng Chấm Điểm Zone Thực Tế</p>
        </header>

        <!-- Section 1: Giới Thiệu Worksheet -->
        <div class="content-card">
            <div class="card-header">
                <h2>📋 Zone Scoring Worksheet</h2>
            </div>
            <div class="card-content">
                <p><span class="highlight-gold">Zone Scoring Worksheet</span> là công cụ giúp bạn đánh giá chất lượng zone một cách hệ thống trước mỗi trade. Sử dụng worksheet này mỗi lần bạn định trade một zone.</p>

                <div class="info-box success">
                    <div class="info-box-title">✅ Lợi Ích Sử Dụng Worksheet</div>
                    <ul class="styled-list">
                        <li>Tránh trade zone kém chất lượng (emotion trading)</li>
                        <li>Tăng tính kỷ luật và nhất quán</li>
                        <li>Dễ dàng review và cải thiện strategy</li>
                        <li>Dữ liệu để backtesting và forward testing</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/FFBD59?text=Zone+Scoring+Worksheet+Overview" alt="Worksheet Overview">
                </div>
            </div>
        </div>

        <!-- Section 2: Mẫu Worksheet High Score -->
        <div class="content-card">
            <div class="card-header">
                <h2>✅ Ví Dụ: Zone Điểm Cao (8/10)</h2>
            </div>
            <div class="card-content">
                <div class="worksheet">
                    <div class="worksheet-title">📊 BTC 4H LFZ @ $42,000</div>

                    <div class="worksheet-row">
                        <span class="worksheet-label">Base Score (Valid Pattern)</span>
                        <span class="worksheet-value">+2</span>
                    </div>
                    <div class="worksheet-row">
                        <span class="worksheet-label">Fresh Zone (Chưa test)</span>
                        <span class="worksheet-value">+2</span>
                    </div>
                    <div class="worksheet-row">
                        <span class="worksheet-label">HTF Confluence (Daily LFZ)</span>
                        <span class="worksheet-value">+2</span>
                    </div>
                    <div class="worksheet-row">
                        <span class="worksheet-label">Strong Departure (Nến +4%)</span>
                        <span class="worksheet-value">+2</span>
                    </div>
                    <div class="worksheet-row">
                        <span class="worksheet-label">Little Time (4 nến)</span>
                        <span class="worksheet-value">+0</span>
                    </div>
                    <div class="worksheet-row">
                        <span class="worksheet-label">Thin Zone (2.5%)</span>
                        <span class="worksheet-value">+0</span>
                    </div>

                    <div class="worksheet-total">
                        <span class="worksheet-total-label">TỔNG ĐIỂM:</span>
                        <span class="worksheet-total-value high">8/10</span>
                    </div>
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Quyết Định: TRADE</div>
                    <p>Zone 8/10 = <strong>A+ Setup</strong>. Trade với 100% position size. RR target tối thiểu 2:1.</p>
                </div>
            </div>
        </div>

        <!-- Section 3: Mẫu Worksheet Low Score -->
        <div class="content-card">
            <div class="card-header">
                <h2>❌ Ví Dụ: Zone Điểm Thấp (3/10)</h2>
            </div>
            <div class="card-content">
                <div class="worksheet">
                    <div class="worksheet-title">📊 ETH 4H HFZ @ $2,500</div>

                    <div class="worksheet-row">
                        <span class="worksheet-label">Base Score (Valid Pattern)</span>
                        <span class="worksheet-value">+2</span>
                    </div>
                    <div class="worksheet-row">
                        <span class="worksheet-label">Fresh Zone (Đã test 2 lần)</span>
                        <span class="worksheet-value" style="background: rgba(239, 68, 68, 0.2); color: var(--danger-red);">+0</span>
                    </div>
                    <div class="worksheet-row">
                        <span class="worksheet-label">HTF Confluence (Không có)</span>
                        <span class="worksheet-value" style="background: rgba(239, 68, 68, 0.2); color: var(--danger-red);">+0</span>
                    </div>
                    <div class="worksheet-row">
                        <span class="worksheet-label">Strong Departure (Yếu)</span>
                        <span class="worksheet-value" style="background: rgba(239, 68, 68, 0.2); color: var(--danger-red);">+0</span>
                    </div>
                    <div class="worksheet-row">
                        <span class="worksheet-label">Little Time (12 nến)</span>
                        <span class="worksheet-value" style="background: rgba(239, 68, 68, 0.2); color: var(--danger-red);">+0</span>
                    </div>
                    <div class="worksheet-row">
                        <span class="worksheet-label">Thin Zone (Zone dày 4%)</span>
                        <span class="worksheet-value">+1</span>
                    </div>

                    <div class="worksheet-total">
                        <span class="worksheet-total-label">TỔNG ĐIỂM:</span>
                        <span class="worksheet-total-value low">3/10</span>
                    </div>
                </div>

                <div class="info-box danger">
                    <div class="info-box-title">❌ Quyết Định: SKIP</div>
                    <p>Zone 3/10 = <strong>Low Quality</strong>. KHÔNG trade. Đợi setup tốt hơn.</p>
                </div>
            </div>
        </div>

        <!-- Section 4: Cách Sử Dụng -->
        <div class="content-card">
            <div class="card-header">
                <h2>🔧 Cách Sử Dụng Worksheet</h2>
            </div>
            <div class="card-content">
                <p><span class="highlight-gold">Quy trình 4 bước</span> sử dụng worksheet trước mỗi trade:</p>

                <ul class="styled-list">
                    <li><strong>Bước 1:</strong> Mở worksheet (app note, spreadsheet, hoặc in ra giấy)</li>
                    <li><strong>Bước 2:</strong> Điền thông tin zone (Coin, TF, Type, Price)</li>
                    <li><strong>Bước 3:</strong> Check từng tiêu chí và cộng điểm</li>
                    <li><strong>Bước 4:</strong> Quyết định dựa trên tổng điểm</li>
                </ul>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/00F0FF?text=Worksheet+Usage+Workflow" alt="Worksheet Workflow">
                </div>

                <div class="info-box">
                    <div class="info-box-title" style="color: var(--accent-gold);">💡 Pro Tip: Trading Journal</div>
                    <p>Lưu lại tất cả worksheet để review sau. Sau 50+ trades, bạn sẽ thấy pattern: zone điểm cao có win rate cao hơn rõ rệt!</p>
                </div>
            </div>
        </div>

        <!-- Section 5: Template Download -->
        <div class="content-card">
            <div class="card-header">
                <h2>📥 Zone Scoring Template</h2>
            </div>
            <div class="card-content">
                <p>Copy template dưới đây để sử dụng trong Trading Journal của bạn:</p>

                <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; font-family: monospace; font-size: 0.85rem; color: var(--text-secondary);">
                    <pre style="white-space: pre-wrap;">
═══════════════════════════════════
ZONE SCORING WORKSHEET
═══════════════════════════════════
Date: ___________
Coin: ___________
Timeframe: ___________
Zone Type: LFZ / HFZ
Zone Price: ___________

CRITERIA                    POINTS
───────────────────────────────────
Base Score (Valid Pattern)  [+2]
Fresh Zone                  [  ]  +2
HTF Confluence              [  ]  +2
Strong Departure            [  ]  +2
Little Time (<5 candles)    [  ]  +1
Thin Zone (<2%)             [  ]  +2
Clear Pattern               [  ]  +1
───────────────────────────────────
TOTAL SCORE:               ___/10

DECISION:
[ ] SKIP (1-4)
[ ] CAUTION (5-6) - 50% size
[ ] TRADE (7-8) - 100% size
[ ] A+ TRADE (9-10) - 100-150% size
═══════════════════════════════════
                    </pre>
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Gợi Ý</div>
                    <p>Tạo template này trong Notion, Google Sheets, hoặc app trading journal. Điền trước MỖI trade để build discipline.</p>
                </div>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li><strong>Worksheet</strong> giúp đánh giá zone hệ thống, tránh emotional trading</li>
                <li>Điền <strong>TẤT CẢ tiêu chí</strong> trước khi quyết định trade</li>
                <li><strong>Zone 1-4:</strong> SKIP | <strong>5-6:</strong> Caution | <strong>7+:</strong> Trade</li>
                <li>Lưu worksheets vào <strong>Trading Journal</strong> để review</li>
                <li>Sau 50+ trades, phân tích win rate theo điểm số</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="0">
                <p>1. Mục đích chính của Zone Scoring Worksheet là gì?</p>
                <button class="quiz-option" data-index="0">Đánh giá chất lượng zone hệ thống, tránh emotional trading</button>
                <button class="quiz-option" data-index="1">Để vẽ zone đẹp hơn</button>
                <button class="quiz-option" data-index="2">Để tính profit target</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p>2. Zone 8/10 điểm nên trade với position size bao nhiêu?</p>
                <button class="quiz-option" data-index="0">50% size bình thường</button>
                <button class="quiz-option" data-index="1">Không trade</button>
                <button class="quiz-option" data-index="2">100% size bình thường</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-number"><span id="correct-count">0</span>/2</div>
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
    <title>Bài 5.3: Zone Scoring Worksheet - Tier 2</title>
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
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                padding: 1.5rem 1rem;
            }
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
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .lesson-subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
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
        }

        .info-box.success .info-box-title { color: var(--success-green); }
        .info-box.danger .info-box-title { color: var(--danger-red); }

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

        /* Worksheet Table */
        .worksheet {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .worksheet {
                border-radius: 0;
                margin: 1rem -1rem;
                padding: 1rem;
                width: calc(100% + 2rem);
            }
        }

        .worksheet-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--accent-gold);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .worksheet-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .worksheet-row:last-child {
            border-bottom: none;
        }

        .worksheet-label {
            color: var(--text-secondary);
        }

        .worksheet-value {
            font-weight: 600;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            background: rgba(255, 189, 89, 0.2);
            color: var(--accent-gold);
        }

        .worksheet-total {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 2px solid var(--accent-gold);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .worksheet-total-label {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--text-primary);
        }

        .worksheet-total-value {
            font-size: 1.5rem;
            font-weight: 700;
            padding: 0.5rem 1rem;
            border-radius: 8px;
        }

        .worksheet-total-value.high {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success-green);
        }

        .worksheet-total-value.low {
            background: rgba(239, 68, 68, 0.2);
            color: var(--danger-red);
        }

        /* Checklist Interactive */
        .checklist {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .checklist {
                border-radius: 0;
                margin: 1rem -1rem;
                padding: 1rem;
                width: calc(100% + 2rem);
            }
        }

        .checklist-item {
            display: flex;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .checklist-checkbox {
            width: 24px;
            height: 24px;
            border: 2px solid var(--accent-gold);
            border-radius: 4px;
            margin-right: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .checklist-checkbox.checked {
            background: var(--accent-gold);
        }

        .checklist-checkbox.checked::after {
            content: ''✓'';
            color: #112250;
            font-weight: bold;
        }

        .checklist-label {
            flex: 1;
            color: var(--text-secondary);
        }

        .checklist-points {
            font-weight: 600;
            color: var(--accent-gold);
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
            <span class="header-badge">⭐ Tier 2 - Bài 5.3</span>
            <h1 class="lesson-title">Zone Scoring Worksheet</h1>
            <p class="lesson-subtitle">Bảng Chấm Điểm Zone Thực Tế</p>
        </header>

        <!-- Section 1: Giới Thiệu Worksheet -->
        <div class="content-card">
            <div class="card-header">
                <h2>📋 Zone Scoring Worksheet</h2>
            </div>
            <div class="card-content">
                <p><span class="highlight-gold">Zone Scoring Worksheet</span> là công cụ giúp bạn đánh giá chất lượng zone một cách hệ thống trước mỗi trade. Sử dụng worksheet này mỗi lần bạn định trade một zone.</p>

                <div class="info-box success">
                    <div class="info-box-title">✅ Lợi Ích Sử Dụng Worksheet</div>
                    <ul class="styled-list">
                        <li>Tránh trade zone kém chất lượng (emotion trading)</li>
                        <li>Tăng tính kỷ luật và nhất quán</li>
                        <li>Dễ dàng review và cải thiện strategy</li>
                        <li>Dữ liệu để backtesting và forward testing</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/FFBD59?text=Zone+Scoring+Worksheet+Overview" alt="Worksheet Overview">
                </div>
            </div>
        </div>

        <!-- Section 2: Mẫu Worksheet High Score -->
        <div class="content-card">
            <div class="card-header">
                <h2>✅ Ví Dụ: Zone Điểm Cao (8/10)</h2>
            </div>
            <div class="card-content">
                <div class="worksheet">
                    <div class="worksheet-title">📊 BTC 4H LFZ @ $42,000</div>

                    <div class="worksheet-row">
                        <span class="worksheet-label">Base Score (Valid Pattern)</span>
                        <span class="worksheet-value">+2</span>
                    </div>
                    <div class="worksheet-row">
                        <span class="worksheet-label">Fresh Zone (Chưa test)</span>
                        <span class="worksheet-value">+2</span>
                    </div>
                    <div class="worksheet-row">
                        <span class="worksheet-label">HTF Confluence (Daily LFZ)</span>
                        <span class="worksheet-value">+2</span>
                    </div>
                    <div class="worksheet-row">
                        <span class="worksheet-label">Strong Departure (Nến +4%)</span>
                        <span class="worksheet-value">+2</span>
                    </div>
                    <div class="worksheet-row">
                        <span class="worksheet-label">Little Time (4 nến)</span>
                        <span class="worksheet-value">+0</span>
                    </div>
                    <div class="worksheet-row">
                        <span class="worksheet-label">Thin Zone (2.5%)</span>
                        <span class="worksheet-value">+0</span>
                    </div>

                    <div class="worksheet-total">
                        <span class="worksheet-total-label">TỔNG ĐIỂM:</span>
                        <span class="worksheet-total-value high">8/10</span>
                    </div>
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Quyết Định: TRADE</div>
                    <p>Zone 8/10 = <strong>A+ Setup</strong>. Trade với 100% position size. RR target tối thiểu 2:1.</p>
                </div>
            </div>
        </div>

        <!-- Section 3: Mẫu Worksheet Low Score -->
        <div class="content-card">
            <div class="card-header">
                <h2>❌ Ví Dụ: Zone Điểm Thấp (3/10)</h2>
            </div>
            <div class="card-content">
                <div class="worksheet">
                    <div class="worksheet-title">📊 ETH 4H HFZ @ $2,500</div>

                    <div class="worksheet-row">
                        <span class="worksheet-label">Base Score (Valid Pattern)</span>
                        <span class="worksheet-value">+2</span>
                    </div>
                    <div class="worksheet-row">
                        <span class="worksheet-label">Fresh Zone (Đã test 2 lần)</span>
                        <span class="worksheet-value" style="background: rgba(239, 68, 68, 0.2); color: var(--danger-red);">+0</span>
                    </div>
                    <div class="worksheet-row">
                        <span class="worksheet-label">HTF Confluence (Không có)</span>
                        <span class="worksheet-value" style="background: rgba(239, 68, 68, 0.2); color: var(--danger-red);">+0</span>
                    </div>
                    <div class="worksheet-row">
                        <span class="worksheet-label">Strong Departure (Yếu)</span>
                        <span class="worksheet-value" style="background: rgba(239, 68, 68, 0.2); color: var(--danger-red);">+0</span>
                    </div>
                    <div class="worksheet-row">
                        <span class="worksheet-label">Little Time (12 nến)</span>
                        <span class="worksheet-value" style="background: rgba(239, 68, 68, 0.2); color: var(--danger-red);">+0</span>
                    </div>
                    <div class="worksheet-row">
                        <span class="worksheet-label">Thin Zone (Zone dày 4%)</span>
                        <span class="worksheet-value">+1</span>
                    </div>

                    <div class="worksheet-total">
                        <span class="worksheet-total-label">TỔNG ĐIỂM:</span>
                        <span class="worksheet-total-value low">3/10</span>
                    </div>
                </div>

                <div class="info-box danger">
                    <div class="info-box-title">❌ Quyết Định: SKIP</div>
                    <p>Zone 3/10 = <strong>Low Quality</strong>. KHÔNG trade. Đợi setup tốt hơn.</p>
                </div>
            </div>
        </div>

        <!-- Section 4: Cách Sử Dụng -->
        <div class="content-card">
            <div class="card-header">
                <h2>🔧 Cách Sử Dụng Worksheet</h2>
            </div>
            <div class="card-content">
                <p><span class="highlight-gold">Quy trình 4 bước</span> sử dụng worksheet trước mỗi trade:</p>

                <ul class="styled-list">
                    <li><strong>Bước 1:</strong> Mở worksheet (app note, spreadsheet, hoặc in ra giấy)</li>
                    <li><strong>Bước 2:</strong> Điền thông tin zone (Coin, TF, Type, Price)</li>
                    <li><strong>Bước 3:</strong> Check từng tiêu chí và cộng điểm</li>
                    <li><strong>Bước 4:</strong> Quyết định dựa trên tổng điểm</li>
                </ul>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/00F0FF?text=Worksheet+Usage+Workflow" alt="Worksheet Workflow">
                </div>

                <div class="info-box">
                    <div class="info-box-title" style="color: var(--accent-gold);">💡 Pro Tip: Trading Journal</div>
                    <p>Lưu lại tất cả worksheet để review sau. Sau 50+ trades, bạn sẽ thấy pattern: zone điểm cao có win rate cao hơn rõ rệt!</p>
                </div>
            </div>
        </div>

        <!-- Section 5: Template Download -->
        <div class="content-card">
            <div class="card-header">
                <h2>📥 Zone Scoring Template</h2>
            </div>
            <div class="card-content">
                <p>Copy template dưới đây để sử dụng trong Trading Journal của bạn:</p>

                <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; font-family: monospace; font-size: 0.85rem; color: var(--text-secondary);">
                    <pre style="white-space: pre-wrap;">
═══════════════════════════════════
ZONE SCORING WORKSHEET
═══════════════════════════════════
Date: ___________
Coin: ___________
Timeframe: ___________
Zone Type: LFZ / HFZ
Zone Price: ___________

CRITERIA                    POINTS
───────────────────────────────────
Base Score (Valid Pattern)  [+2]
Fresh Zone                  [  ]  +2
HTF Confluence              [  ]  +2
Strong Departure            [  ]  +2
Little Time (<5 candles)    [  ]  +1
Thin Zone (<2%)             [  ]  +2
Clear Pattern               [  ]  +1
───────────────────────────────────
TOTAL SCORE:               ___/10

DECISION:
[ ] SKIP (1-4)
[ ] CAUTION (5-6) - 50% size
[ ] TRADE (7-8) - 100% size
[ ] A+ TRADE (9-10) - 100-150% size
═══════════════════════════════════
                    </pre>
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Gợi Ý</div>
                    <p>Tạo template này trong Notion, Google Sheets, hoặc app trading journal. Điền trước MỖI trade để build discipline.</p>
                </div>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li><strong>Worksheet</strong> giúp đánh giá zone hệ thống, tránh emotional trading</li>
                <li>Điền <strong>TẤT CẢ tiêu chí</strong> trước khi quyết định trade</li>
                <li><strong>Zone 1-4:</strong> SKIP | <strong>5-6:</strong> Caution | <strong>7+:</strong> Trade</li>
                <li>Lưu worksheets vào <strong>Trading Journal</strong> để review</li>
                <li>Sau 50+ trades, phân tích win rate theo điểm số</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="0">
                <p>1. Mục đích chính của Zone Scoring Worksheet là gì?</p>
                <button class="quiz-option" data-index="0">Đánh giá chất lượng zone hệ thống, tránh emotional trading</button>
                <button class="quiz-option" data-index="1">Để vẽ zone đẹp hơn</button>
                <button class="quiz-option" data-index="2">Để tính profit target</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p>2. Zone 8/10 điểm nên trade với position size bao nhiêu?</p>
                <button class="quiz-option" data-index="0">50% size bình thường</button>
                <button class="quiz-option" data-index="1">Không trade</button>
                <button class="quiz-option" data-index="2">100% size bình thường</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-number"><span id="correct-count">0</span>/2</div>
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

-- Lesson 5.4: Filter Zones Trên Scanner - Tier 2
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch5-l4',
  'module-tier-2-ch5',
  'course-tier2-trading-advanced',
  'Bài 5.4: Filter Zones Trên Scanner - Tier 2',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 5.4: Filter Zones Trên Scanner - Tier 2</title>
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
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                padding: 1.5rem 1rem;
            }
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
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .lesson-subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
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
        }

        .info-box.warning .info-box-title { color: var(--accent-gold); }
        .info-box.success .info-box-title { color: var(--success-green); }
        .info-box.danger .info-box-title { color: var(--danger-red); }

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

        /* Filter Card */
        .filter-card {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1rem;
            border-left: 4px solid var(--accent-cyan);
        }

        @media (max-width: 600px) {
            .filter-card {
                border-radius: 0;
                margin-left: -1rem;
                margin-right: -1rem;
                padding: 1rem;
            }
        }

        .filter-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
        }

        .filter-name {
            font-weight: 700;
            color: var(--accent-cyan);
        }

        .filter-toggle {
            background: var(--success-green);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .filter-desc {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        /* Step Cards */
        .step-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .step-grid {
                grid-template-columns: 1fr;
                gap: 0.5rem;
            }
        }

        .step-card {
            background: var(--bg-card-hover);
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
        }

        .step-number {
            width: 32px;
            height: 32px;
            background: var(--accent-cyan);
            color: white;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .step-title {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .step-desc {
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
                border-left: 4px solid var(--accent-cyan);
                border-right: none;
                border-top: none;
                border-bottom: none;
            }
        }

        .summary-box h3 {
            color: var(--accent-cyan);
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
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="header-badge">📱 Tier 2 - Bài 5.4</span>
            <h1 class="lesson-title">Filter Zones Trên Scanner</h1>
            <p class="lesson-subtitle">Tự Động Lọc Zones Chất Lượng Cao</p>
        </header>

        <!-- Section 1: GEM Scanner Filters -->
        <div class="content-card">
            <div class="card-header">
                <h2>📊 GEM Scanner - Zone Filters</h2>
            </div>
            <div class="card-content">
                <p><span class="highlight">GEM Scanner</span> có tính năng filter tự động giúp bạn chỉ thấy zones chất lượng cao, tiết kiệm thời gian scan thủ công.</p>

                <div class="info-box success">
                    <div class="info-box-title">✅ Lợi Ích Sử Dụng Filters</div>
                    <ul class="styled-list">
                        <li>Tiết kiệm 80% thời gian scan thủ công</li>
                        <li>Tự động loại bỏ zones yếu (điểm thấp)</li>
                        <li>Focus vào setups chất lượng cao</li>
                        <li>Không bỏ lỡ opportunities trên nhiều coins</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/00F0FF?text=GEM+Scanner+Interface" alt="GEM Scanner">
                </div>
            </div>
        </div>

        <!-- Section 2: Available Filters -->
        <div class="content-card">
            <div class="card-header">
                <h2>🔧 Các Bộ Lọc Có Sẵn</h2>
            </div>
            <div class="card-content">
                <p>GEM Scanner cung cấp các <span class="highlight">filter</span> sau để lọc zones:</p>

                <div class="filter-card">
                    <div class="filter-header">
                        <span class="filter-name">🌟 Fresh Zones Only</span>
                        <span class="filter-toggle">ON</span>
                    </div>
                    <div class="filter-desc">Chỉ hiện zones chưa được test lần nào. Loại bỏ zones đã test 1x, 2x, 3x+.</div>
                </div>

                <div class="filter-card">
                    <div class="filter-header">
                        <span class="filter-name">📊 Minimum Score</span>
                        <span class="filter-toggle">≥ 7</span>
                    </div>
                    <div class="filter-desc">Chỉ hiện zones có tổng điểm từ 7/10 trở lên. Loại bỏ zones yếu.</div>
                </div>

                <div class="filter-card">
                    <div class="filter-header">
                        <span class="filter-name">⏰ Timeframe</span>
                        <span class="filter-toggle">4H+</span>
                    </div>
                    <div class="filter-desc">Chỉ hiện zones từ 4H trở lên. Loại bỏ zones noise từ 1H, 15M.</div>
                </div>

                <div class="filter-card">
                    <div class="filter-header">
                        <span class="filter-name">📏 Zone Proximity</span>
                        <span class="filter-toggle">< 3%</span>
                    </div>
                    <div class="filter-desc">Chỉ hiện zones mà giá hiện tại cách không quá 3%. Loại bỏ zones xa.</div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/FFBD59?text=Filter+Settings+Panel" alt="Filter Settings">
                </div>
            </div>
        </div>

        <!-- Section 3: Recommended Settings -->
        <div class="content-card">
            <div class="card-header">
                <h2>⚙️ Cài Đặt Filter Khuyến Nghị</h2>
            </div>
            <div class="card-content">
                <p>GEM khuyến nghị cài đặt filter cho <span class="highlight-gold">Swing Trader</span>:</p>

                <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                    <thead>
                        <tr>
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--accent-cyan); color: var(--accent-cyan);">Filter</th>
                            <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--accent-cyan); color: var(--accent-cyan);">Swing Trade</th>
                            <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--accent-cyan); color: var(--accent-cyan);">Day Trade</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">Fresh Only</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green);">ON</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--accent-gold);">Optional</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">Min Score</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">≥ 7</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">≥ 6</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">Timeframe</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">4H, Daily</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">1H, 4H</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem;">Proximity</td>
                            <td style="padding: 0.75rem; text-align: center;">< 5%</td>
                            <td style="padding: 0.75rem; text-align: center;">< 2%</td>
                        </tr>
                    </tbody>
                </table>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Lưu Ý</div>
                    <p>Filter quá chặt → Ít signals. Filter quá lỏng → Quá nhiều signals kém chất lượng. Tìm balance phù hợp với style trading của bạn.</p>
                </div>
            </div>
        </div>

        <!-- Section 4: Setup Alerts -->
        <div class="content-card">
            <div class="card-header">
                <h2>🔔 Thiết Lập Alerts</h2>
            </div>
            <div class="card-content">
                <p>Kết hợp filters với <span class="highlight">Alerts</span> để không bỏ lỡ opportunities:</p>

                <div class="step-grid">
                    <div class="step-card">
                        <div class="step-number">1</div>
                        <div class="step-title">Cài Đặt Filters</div>
                        <div class="step-desc">Chọn các filter phù hợp với style</div>
                    </div>
                    <div class="step-card">
                        <div class="step-number">2</div>
                        <div class="step-title">Bật Alert</div>
                        <div class="step-desc">Enable push notification</div>
                    </div>
                    <div class="step-card">
                        <div class="step-number">3</div>
                        <div class="step-title">Nhận Thông Báo</div>
                        <div class="step-desc">Khi giá gần zone chất lượng cao</div>
                    </div>
                    <div class="step-card">
                        <div class="step-number">4</div>
                        <div class="step-title">Phân Tích & Trade</div>
                        <div class="step-desc">Mở chart, verify, và entry</div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/10B981?text=Alert+Notification+Example" alt="Alert Setup">
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Workflow Hiệu Quả</div>
                    <p>Với filters + alerts, bạn không cần ngồi nhìn chart cả ngày. Chỉ cần mở app khi nhận notification và phân tích setup!</p>
                </div>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li><strong>GEM Scanner</strong> có filters tự động lọc zones chất lượng</li>
                <li>Filters chính: <strong>Fresh Only, Min Score, Timeframe, Proximity</strong></li>
                <li>Swing Trade: Fresh ON, Score ≥7, TF 4H+, Proximity <5%</li>
                <li>Kết hợp với <strong>Alerts</strong> để không bỏ lỡ opportunities</li>
                <li>Tiết kiệm 80% thời gian so với scan thủ công</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="1">
                <p>1. Filter "Fresh Zones Only" có tác dụng gì?</p>
                <button class="quiz-option" data-index="0">Chỉ hiện zones mới tạo trong 24h</button>
                <button class="quiz-option" data-index="1">Chỉ hiện zones chưa được test lần nào</button>
                <button class="quiz-option" data-index="2">Chỉ hiện zones từ HTF</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p>2. Với Swing Trade, Min Score nên cài đặt là bao nhiêu?</p>
                <button class="quiz-option" data-index="0">≥ 7</button>
                <button class="quiz-option" data-index="1">≥ 5</button>
                <button class="quiz-option" data-index="2">≥ 9</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-number"><span id="correct-count">0</span>/2</div>
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
    <title>Bài 5.4: Filter Zones Trên Scanner - Tier 2</title>
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
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                padding: 1.5rem 1rem;
            }
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
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .lesson-subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
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
        }

        .info-box.warning .info-box-title { color: var(--accent-gold); }
        .info-box.success .info-box-title { color: var(--success-green); }
        .info-box.danger .info-box-title { color: var(--danger-red); }

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

        /* Filter Card */
        .filter-card {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1rem;
            border-left: 4px solid var(--accent-cyan);
        }

        @media (max-width: 600px) {
            .filter-card {
                border-radius: 0;
                margin-left: -1rem;
                margin-right: -1rem;
                padding: 1rem;
            }
        }

        .filter-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
        }

        .filter-name {
            font-weight: 700;
            color: var(--accent-cyan);
        }

        .filter-toggle {
            background: var(--success-green);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .filter-desc {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        /* Step Cards */
        .step-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .step-grid {
                grid-template-columns: 1fr;
                gap: 0.5rem;
            }
        }

        .step-card {
            background: var(--bg-card-hover);
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
        }

        .step-number {
            width: 32px;
            height: 32px;
            background: var(--accent-cyan);
            color: white;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .step-title {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .step-desc {
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
                border-left: 4px solid var(--accent-cyan);
                border-right: none;
                border-top: none;
                border-bottom: none;
            }
        }

        .summary-box h3 {
            color: var(--accent-cyan);
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
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="header-badge">📱 Tier 2 - Bài 5.4</span>
            <h1 class="lesson-title">Filter Zones Trên Scanner</h1>
            <p class="lesson-subtitle">Tự Động Lọc Zones Chất Lượng Cao</p>
        </header>

        <!-- Section 1: GEM Scanner Filters -->
        <div class="content-card">
            <div class="card-header">
                <h2>📊 GEM Scanner - Zone Filters</h2>
            </div>
            <div class="card-content">
                <p><span class="highlight">GEM Scanner</span> có tính năng filter tự động giúp bạn chỉ thấy zones chất lượng cao, tiết kiệm thời gian scan thủ công.</p>

                <div class="info-box success">
                    <div class="info-box-title">✅ Lợi Ích Sử Dụng Filters</div>
                    <ul class="styled-list">
                        <li>Tiết kiệm 80% thời gian scan thủ công</li>
                        <li>Tự động loại bỏ zones yếu (điểm thấp)</li>
                        <li>Focus vào setups chất lượng cao</li>
                        <li>Không bỏ lỡ opportunities trên nhiều coins</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/00F0FF?text=GEM+Scanner+Interface" alt="GEM Scanner">
                </div>
            </div>
        </div>

        <!-- Section 2: Available Filters -->
        <div class="content-card">
            <div class="card-header">
                <h2>🔧 Các Bộ Lọc Có Sẵn</h2>
            </div>
            <div class="card-content">
                <p>GEM Scanner cung cấp các <span class="highlight">filter</span> sau để lọc zones:</p>

                <div class="filter-card">
                    <div class="filter-header">
                        <span class="filter-name">🌟 Fresh Zones Only</span>
                        <span class="filter-toggle">ON</span>
                    </div>
                    <div class="filter-desc">Chỉ hiện zones chưa được test lần nào. Loại bỏ zones đã test 1x, 2x, 3x+.</div>
                </div>

                <div class="filter-card">
                    <div class="filter-header">
                        <span class="filter-name">📊 Minimum Score</span>
                        <span class="filter-toggle">≥ 7</span>
                    </div>
                    <div class="filter-desc">Chỉ hiện zones có tổng điểm từ 7/10 trở lên. Loại bỏ zones yếu.</div>
                </div>

                <div class="filter-card">
                    <div class="filter-header">
                        <span class="filter-name">⏰ Timeframe</span>
                        <span class="filter-toggle">4H+</span>
                    </div>
                    <div class="filter-desc">Chỉ hiện zones từ 4H trở lên. Loại bỏ zones noise từ 1H, 15M.</div>
                </div>

                <div class="filter-card">
                    <div class="filter-header">
                        <span class="filter-name">📏 Zone Proximity</span>
                        <span class="filter-toggle">< 3%</span>
                    </div>
                    <div class="filter-desc">Chỉ hiện zones mà giá hiện tại cách không quá 3%. Loại bỏ zones xa.</div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/FFBD59?text=Filter+Settings+Panel" alt="Filter Settings">
                </div>
            </div>
        </div>

        <!-- Section 3: Recommended Settings -->
        <div class="content-card">
            <div class="card-header">
                <h2>⚙️ Cài Đặt Filter Khuyến Nghị</h2>
            </div>
            <div class="card-content">
                <p>GEM khuyến nghị cài đặt filter cho <span class="highlight-gold">Swing Trader</span>:</p>

                <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                    <thead>
                        <tr>
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--accent-cyan); color: var(--accent-cyan);">Filter</th>
                            <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--accent-cyan); color: var(--accent-cyan);">Swing Trade</th>
                            <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--accent-cyan); color: var(--accent-cyan);">Day Trade</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">Fresh Only</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green);">ON</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--accent-gold);">Optional</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">Min Score</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">≥ 7</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">≥ 6</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">Timeframe</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">4H, Daily</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">1H, 4H</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem;">Proximity</td>
                            <td style="padding: 0.75rem; text-align: center;">< 5%</td>
                            <td style="padding: 0.75rem; text-align: center;">< 2%</td>
                        </tr>
                    </tbody>
                </table>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Lưu Ý</div>
                    <p>Filter quá chặt → Ít signals. Filter quá lỏng → Quá nhiều signals kém chất lượng. Tìm balance phù hợp với style trading của bạn.</p>
                </div>
            </div>
        </div>

        <!-- Section 4: Setup Alerts -->
        <div class="content-card">
            <div class="card-header">
                <h2>🔔 Thiết Lập Alerts</h2>
            </div>
            <div class="card-content">
                <p>Kết hợp filters với <span class="highlight">Alerts</span> để không bỏ lỡ opportunities:</p>

                <div class="step-grid">
                    <div class="step-card">
                        <div class="step-number">1</div>
                        <div class="step-title">Cài Đặt Filters</div>
                        <div class="step-desc">Chọn các filter phù hợp với style</div>
                    </div>
                    <div class="step-card">
                        <div class="step-number">2</div>
                        <div class="step-title">Bật Alert</div>
                        <div class="step-desc">Enable push notification</div>
                    </div>
                    <div class="step-card">
                        <div class="step-number">3</div>
                        <div class="step-title">Nhận Thông Báo</div>
                        <div class="step-desc">Khi giá gần zone chất lượng cao</div>
                    </div>
                    <div class="step-card">
                        <div class="step-number">4</div>
                        <div class="step-title">Phân Tích & Trade</div>
                        <div class="step-desc">Mở chart, verify, và entry</div>
                    </div>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/10B981?text=Alert+Notification+Example" alt="Alert Setup">
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Workflow Hiệu Quả</div>
                    <p>Với filters + alerts, bạn không cần ngồi nhìn chart cả ngày. Chỉ cần mở app khi nhận notification và phân tích setup!</p>
                </div>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li><strong>GEM Scanner</strong> có filters tự động lọc zones chất lượng</li>
                <li>Filters chính: <strong>Fresh Only, Min Score, Timeframe, Proximity</strong></li>
                <li>Swing Trade: Fresh ON, Score ≥7, TF 4H+, Proximity <5%</li>
                <li>Kết hợp với <strong>Alerts</strong> để không bỏ lỡ opportunities</li>
                <li>Tiết kiệm 80% thời gian so với scan thủ công</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="1">
                <p>1. Filter "Fresh Zones Only" có tác dụng gì?</p>
                <button class="quiz-option" data-index="0">Chỉ hiện zones mới tạo trong 24h</button>
                <button class="quiz-option" data-index="1">Chỉ hiện zones chưa được test lần nào</button>
                <button class="quiz-option" data-index="2">Chỉ hiện zones từ HTF</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p>2. Với Swing Trade, Min Score nên cài đặt là bao nhiêu?</p>
                <button class="quiz-option" data-index="0">≥ 7</button>
                <button class="quiz-option" data-index="1">≥ 5</button>
                <button class="quiz-option" data-index="2">≥ 9</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-number"><span id="correct-count">0</span>/2</div>
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

-- Lesson 5.5: Ví Dụ Thực Tế Zone Grading - Tier 2
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch5-l5',
  'module-tier-2-ch5',
  'course-tier2-trading-advanced',
  'Bài 5.5: Ví Dụ Thực Tế Zone Grading - Tier 2',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 5.5: Ví Dụ Thực Tế Zone Grading - Tier 2</title>
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
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                padding: 1.5rem 1rem;
            }
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
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .lesson-subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
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
        }

        .card-header.win h2 {
            color: var(--success-green);
        }

        .card-header.skip h2 {
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

        .info-box.success {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .info-box.danger {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
        }

        .info-box.warning {
            background: rgba(255, 189, 89, 0.1);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .info-box-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .info-box.success .info-box-title { color: var(--success-green); }
        .info-box.danger .info-box-title { color: var(--danger-red); }
        .info-box.warning .info-box-title { color: var(--accent-gold); }

        .styled-list {
            list-style: none;
            padding: 0;
        }

        .styled-list li {
            padding: 0.5rem 0;
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

        .case-study.high-score {
            border-left-color: var(--success-green);
        }

        .case-study.low-score {
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

        .case-study.high-score .case-title {
            color: var(--success-green);
        }

        .case-study.low-score .case-title {
            color: var(--danger-red);
        }

        .case-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .case-badge.high {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success-green);
        }

        .case-badge.low {
            background: rgba(239, 68, 68, 0.2);
            color: var(--danger-red);
        }

        /* Score Breakdown */
        .score-breakdown {
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
        }

        .score-row {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .score-row:last-child {
            border-bottom: none;
        }

        .score-label {
            color: var(--text-secondary);
        }

        .score-value {
            font-weight: 600;
        }

        .score-value.positive {
            color: var(--success-green);
        }

        .score-value.zero {
            color: var(--danger-red);
        }

        .score-total {
            margin-top: 0.5rem;
            padding-top: 0.5rem;
            border-top: 2px solid var(--accent-purple);
            display: flex;
            justify-content: space-between;
            font-weight: 700;
        }

        .score-total-value {
            font-size: 1.25rem;
        }

        .score-total-value.high { color: var(--success-green); }
        .score-total-value.low { color: var(--danger-red); }

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
            <span class="header-badge">📊 Tier 2 - Bài 5.5</span>
            <h1 class="lesson-title">Ví Dụ Thực Tế Zone Grading</h1>
            <p class="lesson-subtitle">So Sánh Zones Điểm Cao vs Điểm Thấp</p>
        </header>

        <!-- Intro -->
        <div class="content-card">
            <div class="card-header">
                <h2>📚 Giới Thiệu Case Studies</h2>
            </div>
            <div class="card-content">
                <p>Bài này sẽ so sánh <span class="highlight-green">3 zones điểm cao</span> và <span class="highlight-red">2 zones điểm thấp</span> để bạn thấy sự khác biệt rõ ràng và tại sao nên SKIP zones yếu.</p>

                <div class="info-box">
                    <div class="info-box-title" style="color: var(--accent-purple);">💡 Mục Đích</div>
                    <p>Sau bài này, bạn sẽ có "con mắt" để nhận biết zone chất lượng ngay khi nhìn chart, không cần tính điểm chi tiết.</p>
                </div>
            </div>
        </div>

        <!-- Case 1: High Score BTC -->
        <div class="case-study high-score">
            <div class="case-header">
                <span class="case-title">✅ Case 1: BTC 4H LFZ - Điểm Cao</span>
                <span class="case-badge high">9/10 → WIN +5.2%</span>
            </div>

            <div class="score-breakdown">
                <div class="score-row">
                    <span class="score-label">Base Score (UPU Pattern)</span>
                    <span class="score-value positive">+2</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Fresh Zone (Chưa test)</span>
                    <span class="score-value positive">+2</span>
                </div>
                <div class="score-row">
                    <span class="score-label">HTF Confluence (Daily LFZ)</span>
                    <span class="score-value positive">+2</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Strong Departure (+4.5% candle)</span>
                    <span class="score-value positive">+2</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Little Time (3 candles)</span>
                    <span class="score-value positive">+1</span>
                </div>
                <div class="score-total">
                    <span>TOTAL SCORE:</span>
                    <span class="score-total-value high">9/10</span>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/800x400/112250/10B981?text=BTC+High+Score+Zone+9-10" alt="BTC High Score">
            </div>

            <div class="info-box success">
                <div class="info-box-title">✅ Kết Quả</div>
                <p>Trade với 100% size. Entry $42,000, SL $41,500, TP $44,200. Profit <strong>+5.2%</strong>, RR 4.4:1. Perfect setup!</p>
            </div>
        </div>

        <!-- Case 2: Low Score ETH -->
        <div class="case-study low-score">
            <div class="case-header">
                <span class="case-title">❌ Case 2: ETH 4H HFZ - Điểm Thấp</span>
                <span class="case-badge low">3/10 → SKIP (Đúng!)</span>
            </div>

            <div class="score-breakdown">
                <div class="score-row">
                    <span class="score-label">Base Score (DPD Pattern)</span>
                    <span class="score-value positive">+2</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Fresh Zone (Đã test 2 lần)</span>
                    <span class="score-value zero">+0</span>
                </div>
                <div class="score-row">
                    <span class="score-label">HTF Confluence (Không có)</span>
                    <span class="score-value zero">+0</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Strong Departure (Yếu, +1.2%)</span>
                    <span class="score-value zero">+0</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Little Time (12 candles)</span>
                    <span class="score-value zero">+0</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Zone Size (Dày 4.5%)</span>
                    <span class="score-value positive">+1</span>
                </div>
                <div class="score-total">
                    <span>TOTAL SCORE:</span>
                    <span class="score-total-value low">3/10</span>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/800x400/112250/EF4444?text=ETH+Low+Score+Zone+3-10" alt="ETH Low Score">
            </div>

            <div class="info-box danger">
                <div class="info-box-title">❌ Nếu Trade</div>
                <p>Giá break qua zone lần 3, SL sẽ bị hit. <strong>SKIP đúng quyết định!</strong> Trader không có hệ thống sẽ vào và thua.</p>
            </div>
        </div>

        <!-- Case 3: High Score SOL -->
        <div class="case-study high-score">
            <div class="case-header">
                <span class="case-title">✅ Case 3: SOL Daily LFZ - Điểm Cao</span>
                <span class="case-badge high">8/10 → WIN +7.8%</span>
            </div>

            <div class="score-breakdown">
                <div class="score-row">
                    <span class="score-label">Base Score (DPU Pattern)</span>
                    <span class="score-value positive">+2</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Fresh Zone (Chưa test)</span>
                    <span class="score-value positive">+2</span>
                </div>
                <div class="score-row">
                    <span class="score-label">HTF Confluence (Weekly support)</span>
                    <span class="score-value positive">+2</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Strong Departure (+6.2% candle)</span>
                    <span class="score-value positive">+2</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Little Time (5 candles)</span>
                    <span class="score-value zero">+0</span>
                </div>
                <div class="score-total">
                    <span>TOTAL SCORE:</span>
                    <span class="score-total-value high">8/10</span>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/800x400/112250/10B981?text=SOL+High+Score+Zone+8-10" alt="SOL High Score">
            </div>

            <div class="info-box success">
                <div class="info-box-title">✅ Kết Quả</div>
                <p>Daily LFZ từ DPU reversal pattern. Entry $95, SL $91, TP $105. Profit <strong>+7.8%</strong>. A+ swing trade!</p>
            </div>
        </div>

        <!-- Case 4: Low Score BNB -->
        <div class="case-study low-score">
            <div class="case-header">
                <span class="case-title">❌ Case 4: BNB 1H LFZ - Điểm Thấp</span>
                <span class="case-badge low">4/10 → SKIP (Đúng!)</span>
            </div>

            <div class="score-breakdown">
                <div class="score-row">
                    <span class="score-label">Base Score (UPU Pattern)</span>
                    <span class="score-value positive">+2</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Fresh Zone (Test 1 lần)</span>
                    <span class="score-value zero">+0</span>
                </div>
                <div class="score-row">
                    <span class="score-label">HTF Confluence (Không có)</span>
                    <span class="score-value zero">+0</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Strong Departure (Trung bình)</span>
                    <span class="score-value positive">+1</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Little Time (4 candles)</span>
                    <span class="score-value positive">+1</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Timeframe (Chỉ 1H - yếu)</span>
                    <span class="score-value zero">+0</span>
                </div>
                <div class="score-total">
                    <span>TOTAL SCORE:</span>
                    <span class="score-total-value low">4/10</span>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/800x400/112250/EF4444?text=BNB+Low+Score+1H+Zone" alt="BNB Low Score">
            </div>

            <div class="info-box danger">
                <div class="info-box-title">❌ Nếu Trade</div>
                <p>Zone 1H không có HTF support → dễ bị break. Giá chỉ bounce nhẹ rồi tiếp tục giảm. <strong>SKIP đúng!</strong></p>
            </div>
        </div>

        <!-- Comparison Summary -->
        <div class="content-card">
            <div class="card-header">
                <h2>📊 So Sánh Tổng Hợp</h2>
            </div>
            <div class="card-content">
                <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                    <thead>
                        <tr>
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--accent-purple); color: var(--accent-purple);">Zone</th>
                            <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--accent-purple); color: var(--accent-purple);">Score</th>
                            <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--accent-purple); color: var(--accent-purple);">Action</th>
                            <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--accent-purple); color: var(--accent-purple);">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">BTC 4H LFZ</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green); font-weight: 700;">9/10</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green);">TRADE</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green);">+5.2%</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">ETH 4H HFZ</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--danger-red); font-weight: 700;">3/10</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--danger-red);">SKIP</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">Avoid loss</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">SOL Daily LFZ</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green); font-weight: 700;">8/10</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green);">TRADE</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green);">+7.8%</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem;">BNB 1H LFZ</td>
                            <td style="padding: 0.75rem; text-align: center; color: var(--danger-red); font-weight: 700;">4/10</td>
                            <td style="padding: 0.75rem; text-align: center; color: var(--danger-red);">SKIP</td>
                            <td style="padding: 0.75rem; text-align: center; color: var(--text-secondary);">Avoid loss</td>
                        </tr>
                    </tbody>
                </table>

                <div class="info-box success">
                    <div class="info-box-title">✅ Key Insight</div>
                    <p>Zones điểm cao (7+) có <strong>win rate 75%+</strong>. Zones điểm thấp (1-4) có <strong>win rate <45%</strong>. Hệ thống scoring giúp filter hiệu quả!</p>
                </div>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Zone <strong>điểm cao (7+)</strong> có characteristics rõ: Fresh, HTF confluence, Strong departure</li>
                <li>Zone <strong>điểm thấp (1-4)</strong> thiếu nhiều enhancers, dễ bị break</li>
                <li>SKIP zones yếu = <strong>tránh được thua lỗ</strong> không cần thiết</li>
                <li>Sau practice, bạn sẽ <strong>"thấy"</strong> zone chất lượng ngay lập tức</li>
                <li>Hệ thống scoring loại bỏ <strong>emotional trading</strong></li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="1">
                <p>1. Trong các case study, zone nào có điểm cao nhất?</p>
                <button class="quiz-option" data-index="0">SOL Daily LFZ (8/10)</button>
                <button class="quiz-option" data-index="1">BTC 4H LFZ (9/10)</button>
                <button class="quiz-option" data-index="2">ETH 4H HFZ (3/10)</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p>2. Tại sao ETH 4H HFZ chỉ có 3/10 điểm?</p>
                <button class="quiz-option" data-index="0">Pattern không rõ ràng</button>
                <button class="quiz-option" data-index="1">Timeframe quá nhỏ</button>
                <button class="quiz-option" data-index="2">Đã test 2 lần, không có HTF confluence, departure yếu</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-number"><span id="correct-count">0</span>/2</div>
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
    <title>Bài 5.5: Ví Dụ Thực Tế Zone Grading - Tier 2</title>
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
        }

        @media (max-width: 600px) {
            .lesson-header {
                border-radius: 0;
                padding: 1.5rem 1rem;
            }
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
        }

        .lesson-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .lesson-subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
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
        }

        .card-header.win h2 {
            color: var(--success-green);
        }

        .card-header.skip h2 {
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

        .info-box.success {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .info-box.danger {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
        }

        .info-box.warning {
            background: rgba(255, 189, 89, 0.1);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .info-box-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .info-box.success .info-box-title { color: var(--success-green); }
        .info-box.danger .info-box-title { color: var(--danger-red); }
        .info-box.warning .info-box-title { color: var(--accent-gold); }

        .styled-list {
            list-style: none;
            padding: 0;
        }

        .styled-list li {
            padding: 0.5rem 0;
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

        .case-study.high-score {
            border-left-color: var(--success-green);
        }

        .case-study.low-score {
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

        .case-study.high-score .case-title {
            color: var(--success-green);
        }

        .case-study.low-score .case-title {
            color: var(--danger-red);
        }

        .case-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .case-badge.high {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success-green);
        }

        .case-badge.low {
            background: rgba(239, 68, 68, 0.2);
            color: var(--danger-red);
        }

        /* Score Breakdown */
        .score-breakdown {
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
        }

        .score-row {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .score-row:last-child {
            border-bottom: none;
        }

        .score-label {
            color: var(--text-secondary);
        }

        .score-value {
            font-weight: 600;
        }

        .score-value.positive {
            color: var(--success-green);
        }

        .score-value.zero {
            color: var(--danger-red);
        }

        .score-total {
            margin-top: 0.5rem;
            padding-top: 0.5rem;
            border-top: 2px solid var(--accent-purple);
            display: flex;
            justify-content: space-between;
            font-weight: 700;
        }

        .score-total-value {
            font-size: 1.25rem;
        }

        .score-total-value.high { color: var(--success-green); }
        .score-total-value.low { color: var(--danger-red); }

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
            <span class="header-badge">📊 Tier 2 - Bài 5.5</span>
            <h1 class="lesson-title">Ví Dụ Thực Tế Zone Grading</h1>
            <p class="lesson-subtitle">So Sánh Zones Điểm Cao vs Điểm Thấp</p>
        </header>

        <!-- Intro -->
        <div class="content-card">
            <div class="card-header">
                <h2>📚 Giới Thiệu Case Studies</h2>
            </div>
            <div class="card-content">
                <p>Bài này sẽ so sánh <span class="highlight-green">3 zones điểm cao</span> và <span class="highlight-red">2 zones điểm thấp</span> để bạn thấy sự khác biệt rõ ràng và tại sao nên SKIP zones yếu.</p>

                <div class="info-box">
                    <div class="info-box-title" style="color: var(--accent-purple);">💡 Mục Đích</div>
                    <p>Sau bài này, bạn sẽ có "con mắt" để nhận biết zone chất lượng ngay khi nhìn chart, không cần tính điểm chi tiết.</p>
                </div>
            </div>
        </div>

        <!-- Case 1: High Score BTC -->
        <div class="case-study high-score">
            <div class="case-header">
                <span class="case-title">✅ Case 1: BTC 4H LFZ - Điểm Cao</span>
                <span class="case-badge high">9/10 → WIN +5.2%</span>
            </div>

            <div class="score-breakdown">
                <div class="score-row">
                    <span class="score-label">Base Score (UPU Pattern)</span>
                    <span class="score-value positive">+2</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Fresh Zone (Chưa test)</span>
                    <span class="score-value positive">+2</span>
                </div>
                <div class="score-row">
                    <span class="score-label">HTF Confluence (Daily LFZ)</span>
                    <span class="score-value positive">+2</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Strong Departure (+4.5% candle)</span>
                    <span class="score-value positive">+2</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Little Time (3 candles)</span>
                    <span class="score-value positive">+1</span>
                </div>
                <div class="score-total">
                    <span>TOTAL SCORE:</span>
                    <span class="score-total-value high">9/10</span>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/800x400/112250/10B981?text=BTC+High+Score+Zone+9-10" alt="BTC High Score">
            </div>

            <div class="info-box success">
                <div class="info-box-title">✅ Kết Quả</div>
                <p>Trade với 100% size. Entry $42,000, SL $41,500, TP $44,200. Profit <strong>+5.2%</strong>, RR 4.4:1. Perfect setup!</p>
            </div>
        </div>

        <!-- Case 2: Low Score ETH -->
        <div class="case-study low-score">
            <div class="case-header">
                <span class="case-title">❌ Case 2: ETH 4H HFZ - Điểm Thấp</span>
                <span class="case-badge low">3/10 → SKIP (Đúng!)</span>
            </div>

            <div class="score-breakdown">
                <div class="score-row">
                    <span class="score-label">Base Score (DPD Pattern)</span>
                    <span class="score-value positive">+2</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Fresh Zone (Đã test 2 lần)</span>
                    <span class="score-value zero">+0</span>
                </div>
                <div class="score-row">
                    <span class="score-label">HTF Confluence (Không có)</span>
                    <span class="score-value zero">+0</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Strong Departure (Yếu, +1.2%)</span>
                    <span class="score-value zero">+0</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Little Time (12 candles)</span>
                    <span class="score-value zero">+0</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Zone Size (Dày 4.5%)</span>
                    <span class="score-value positive">+1</span>
                </div>
                <div class="score-total">
                    <span>TOTAL SCORE:</span>
                    <span class="score-total-value low">3/10</span>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/800x400/112250/EF4444?text=ETH+Low+Score+Zone+3-10" alt="ETH Low Score">
            </div>

            <div class="info-box danger">
                <div class="info-box-title">❌ Nếu Trade</div>
                <p>Giá break qua zone lần 3, SL sẽ bị hit. <strong>SKIP đúng quyết định!</strong> Trader không có hệ thống sẽ vào và thua.</p>
            </div>
        </div>

        <!-- Case 3: High Score SOL -->
        <div class="case-study high-score">
            <div class="case-header">
                <span class="case-title">✅ Case 3: SOL Daily LFZ - Điểm Cao</span>
                <span class="case-badge high">8/10 → WIN +7.8%</span>
            </div>

            <div class="score-breakdown">
                <div class="score-row">
                    <span class="score-label">Base Score (DPU Pattern)</span>
                    <span class="score-value positive">+2</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Fresh Zone (Chưa test)</span>
                    <span class="score-value positive">+2</span>
                </div>
                <div class="score-row">
                    <span class="score-label">HTF Confluence (Weekly support)</span>
                    <span class="score-value positive">+2</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Strong Departure (+6.2% candle)</span>
                    <span class="score-value positive">+2</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Little Time (5 candles)</span>
                    <span class="score-value zero">+0</span>
                </div>
                <div class="score-total">
                    <span>TOTAL SCORE:</span>
                    <span class="score-total-value high">8/10</span>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/800x400/112250/10B981?text=SOL+High+Score+Zone+8-10" alt="SOL High Score">
            </div>

            <div class="info-box success">
                <div class="info-box-title">✅ Kết Quả</div>
                <p>Daily LFZ từ DPU reversal pattern. Entry $95, SL $91, TP $105. Profit <strong>+7.8%</strong>. A+ swing trade!</p>
            </div>
        </div>

        <!-- Case 4: Low Score BNB -->
        <div class="case-study low-score">
            <div class="case-header">
                <span class="case-title">❌ Case 4: BNB 1H LFZ - Điểm Thấp</span>
                <span class="case-badge low">4/10 → SKIP (Đúng!)</span>
            </div>

            <div class="score-breakdown">
                <div class="score-row">
                    <span class="score-label">Base Score (UPU Pattern)</span>
                    <span class="score-value positive">+2</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Fresh Zone (Test 1 lần)</span>
                    <span class="score-value zero">+0</span>
                </div>
                <div class="score-row">
                    <span class="score-label">HTF Confluence (Không có)</span>
                    <span class="score-value zero">+0</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Strong Departure (Trung bình)</span>
                    <span class="score-value positive">+1</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Little Time (4 candles)</span>
                    <span class="score-value positive">+1</span>
                </div>
                <div class="score-row">
                    <span class="score-label">Timeframe (Chỉ 1H - yếu)</span>
                    <span class="score-value zero">+0</span>
                </div>
                <div class="score-total">
                    <span>TOTAL SCORE:</span>
                    <span class="score-total-value low">4/10</span>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/800x400/112250/EF4444?text=BNB+Low+Score+1H+Zone" alt="BNB Low Score">
            </div>

            <div class="info-box danger">
                <div class="info-box-title">❌ Nếu Trade</div>
                <p>Zone 1H không có HTF support → dễ bị break. Giá chỉ bounce nhẹ rồi tiếp tục giảm. <strong>SKIP đúng!</strong></p>
            </div>
        </div>

        <!-- Comparison Summary -->
        <div class="content-card">
            <div class="card-header">
                <h2>📊 So Sánh Tổng Hợp</h2>
            </div>
            <div class="card-content">
                <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                    <thead>
                        <tr>
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--accent-purple); color: var(--accent-purple);">Zone</th>
                            <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--accent-purple); color: var(--accent-purple);">Score</th>
                            <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--accent-purple); color: var(--accent-purple);">Action</th>
                            <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--accent-purple); color: var(--accent-purple);">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">BTC 4H LFZ</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green); font-weight: 700;">9/10</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green);">TRADE</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green);">+5.2%</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">ETH 4H HFZ</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--danger-red); font-weight: 700;">3/10</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--danger-red);">SKIP</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">Avoid loss</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">SOL Daily LFZ</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green); font-weight: 700;">8/10</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green);">TRADE</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green);">+7.8%</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem;">BNB 1H LFZ</td>
                            <td style="padding: 0.75rem; text-align: center; color: var(--danger-red); font-weight: 700;">4/10</td>
                            <td style="padding: 0.75rem; text-align: center; color: var(--danger-red);">SKIP</td>
                            <td style="padding: 0.75rem; text-align: center; color: var(--text-secondary);">Avoid loss</td>
                        </tr>
                    </tbody>
                </table>

                <div class="info-box success">
                    <div class="info-box-title">✅ Key Insight</div>
                    <p>Zones điểm cao (7+) có <strong>win rate 75%+</strong>. Zones điểm thấp (1-4) có <strong>win rate <45%</strong>. Hệ thống scoring giúp filter hiệu quả!</p>
                </div>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Zone <strong>điểm cao (7+)</strong> có characteristics rõ: Fresh, HTF confluence, Strong departure</li>
                <li>Zone <strong>điểm thấp (1-4)</strong> thiếu nhiều enhancers, dễ bị break</li>
                <li>SKIP zones yếu = <strong>tránh được thua lỗ</strong> không cần thiết</li>
                <li>Sau practice, bạn sẽ <strong>"thấy"</strong> zone chất lượng ngay lập tức</li>
                <li>Hệ thống scoring loại bỏ <strong>emotional trading</strong></li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="1">
                <p>1. Trong các case study, zone nào có điểm cao nhất?</p>
                <button class="quiz-option" data-index="0">SOL Daily LFZ (8/10)</button>
                <button class="quiz-option" data-index="1">BTC 4H LFZ (9/10)</button>
                <button class="quiz-option" data-index="2">ETH 4H HFZ (3/10)</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p>2. Tại sao ETH 4H HFZ chỉ có 3/10 điểm?</p>
                <button class="quiz-option" data-index="0">Pattern không rõ ràng</button>
                <button class="quiz-option" data-index="1">Timeframe quá nhỏ</button>
                <button class="quiz-option" data-index="2">Đã test 2 lần, không có HTF confluence, departure yếu</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-number"><span id="correct-count">0</span>/2</div>
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
