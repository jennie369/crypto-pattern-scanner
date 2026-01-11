-- =====================================================
-- TIER-2 - Chương 1: HFZ - High Frequency Zones
-- Course: course-tier2-trading-advanced
-- File 9/23
-- =====================================================

-- Create/Update Module
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  'module-tier-2-ch1',
  'course-tier2-trading-advanced',
  'Chương 1: HFZ - High Frequency Zones',
  'Vùng kháng cự chất lượng cao',
  1,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Lesson 1.1: HFZ Là Gì? - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch1-l1',
  'module-tier-2-ch1',
  'course-tier2-trading-advanced',
  'Bài 1.1: HFZ Là Gì? - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 1.1: HFZ Là Gì? - GEM Trading Academy</title>
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
            border-bottom: 3px solid var(--error-red);
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
            background: radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 50%);
            animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--error-red) 0%, #DC2626 100%);
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
            border-left: 4px solid var(--error-red);
        }

        @media (min-width: 600px) {
            .content-card {
                border-radius: 16px;
                padding: 2rem;
                margin-bottom: 1.5rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--error-red);
            }
        }

        .content-card h2 {
            font-size: 1.35rem;
            font-weight: 700;
            margin-bottom: 1.25rem;
            color: var(--error-red);
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
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%);
            border: 1px solid rgba(239, 68, 68, 0.3);
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

        .highlight-box.gold {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .highlight-box p {
            margin: 0;
            color: var(--text-primary);
        }

        .image-placeholder {
            background: linear-gradient(145deg, #1a2235 0%, #0d1321 100%);
            border: 2px dashed rgba(239, 68, 68, 0.4);
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
            color: var(--error-red);
            margin: 0;
            font-style: italic;
        }

        .definition-box {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            border: 2px solid var(--error-red);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        .definition-box h3 {
            color: var(--error-red);
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .definition-box .subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
            margin-bottom: 1rem;
        }

        .definition-box .meaning {
            color: var(--text-primary);
            font-size: 1.1rem;
            line-height: 1.6;
        }

        .comparison-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1px;
            background: var(--border-color);
            margin: 1.5rem 0;
        }

        @media (min-width: 600px) {
            .comparison-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                background: transparent;
            }
        }

        .comparison-item {
            padding: 1.25rem;
            text-align: center;
        }

        .comparison-item.hfz {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, var(--bg-card-hover) 100%);
            border-left: 4px solid var(--error-red);
        }

        .comparison-item.lfz {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, var(--bg-card-hover) 100%);
            border-left: 4px solid var(--success-green);
        }

        @media (min-width: 600px) {
            .comparison-item {
                border-radius: 12px;
            }
        }

        .comparison-item h4 {
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
        }

        .comparison-item.hfz h4 { color: var(--error-red); }
        .comparison-item.lfz h4 { color: var(--success-green); }

        .comparison-item p {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin: 0.25rem 0;
        }

        .formula-box {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        .formula-box .formula {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--error-red);
            margin-bottom: 1rem;
            font-family: monospace;
        }

        .formula-box .explanation {
            color: var(--text-secondary);
            font-size: 0.95rem;
        }

        .pattern-source {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            margin: 1.5rem 0;
            justify-content: center;
        }

        .pattern-tag {
            background: var(--bg-card-hover);
            border: 2px solid var(--error-red);
            border-radius: 8px;
            padding: 0.75rem 1.5rem;
            text-align: center;
        }

        .pattern-tag .name {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--error-red);
        }

        .pattern-tag .desc {
            font-size: 0.8rem;
            color: var(--text-secondary);
        }

        .summary-box {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            border: 2px solid var(--error-red);
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
            color: var(--error-red);
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
            color: var(--error-red);
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
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score h3 {
            color: var(--error-red);
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

        .tier-badge {
            display: inline-block;
            background: linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%);
            color: #1a1a2e;
            padding: 0.25rem 0.75rem;
            border-radius: 15px;
            font-size: 0.75rem;
            font-weight: 700;
            margin-left: 0.5rem;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <div class="header-badge">🥈 TIER 2 - Chapter 1</div>
            <h1>HFZ Là Gì? <span class="tier-badge">NÂNG CAO</span></h1>
            <p>High Frequency Zone - Vùng Bán Độc Quyền</p>
        </header>

        <section class="content-section">
            <div class="content-card">
                <h2><span class="icon">🎯</span> Chào Mừng Đến TIER 2!</h2>

                <p>Chúc mừng bạn đã hoàn thành TIER 1! Giờ bạn sẽ học về <strong>Zone Detection</strong> - kỹ năng giúp bạn xác định chính xác vùng giá có xác suất cao.</p>

                <div class="highlight-box gold">
                    <p><strong>📊 Trong TIER 2, bạn sẽ học:</strong></p>
                    <ul style="margin-top: 0.5rem; padding-left: 1.25rem;">
                        <li>HFZ (High Frequency Zone) - Vùng bán</li>
                        <li>LFZ (Low Frequency Zone) - Vùng mua</li>
                        <li>Zone Grading - Chấm điểm chất lượng zone</li>
                        <li>Multi-Timeframe Analysis</li>
                    </ul>
                </div>

                <p>Hãy bắt đầu với <strong>HFZ - High Frequency Zone</strong>!</p>
            </div>

            <div class="content-card">
                <h2><span class="icon">📍</span> Định Nghĩa HFZ</h2>

                <div class="definition-box">
                    <h3>HFZ</h3>
                    <div class="subtitle">High Frequency Zone</div>
                    <div class="meaning">
                        <strong>= Vùng có nhiều lệnh BÁN chờ khớp</strong><br>
                        Khi giá quay lại vùng này, có xác suất cao giá sẽ GIẢM
                    </div>
                </div>

                <h3>Đặc điểm của HFZ:</h3>
                <ul>
                    <li><strong>Vị trí:</strong> Luôn nằm TRÊN giá hiện tại</li>
                    <li><strong>Tín hiệu:</strong> SHORT (bán) khi giá quay lại kiểm tra</li>
                    <li><strong>Nguồn gốc:</strong> Được tạo từ patterns bearish</li>
                    <li><strong>Màu sắc:</strong> Thường đánh dấu bằng màu ĐỎ</li>
                </ul>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/EF4444?text=HFZ+Zone+Example" alt="HFZ Zone Example">
                    <p>📸 Ví dụ HFZ trên chart - Vùng đỏ phía trên giá</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🔄</span> HFZ Được Tạo Từ Patterns Nào?</h2>

                <p>HFZ được hình thành từ 2 patterns chính trong hệ thống GEM Frequency:</p>

                <div class="pattern-source">
                    <div class="pattern-tag">
                        <div class="name">DPD</div>
                        <div class="desc">Down → Pause → Down</div>
                    </div>
                    <div class="pattern-tag">
                        <div class="name">UPD</div>
                        <div class="desc">Up → Pause → Down</div>
                    </div>
                </div>

                <h3>Tại sao những patterns này tạo HFZ?</h3>
                <p>Khi giá tạo pattern DPD hoặc UPD:</p>
                <ol>
                    <li>Phase 1: Giá di chuyển (Up hoặc Down)</li>
                    <li>Phase 2: Giá PAUSE (tích lũy) - <strong>Đây là vùng HFZ!</strong></li>
                    <li>Phase 3: Giá phá xuống (Down)</li>
                </ol>

                <div class="highlight-box">
                    <p><strong>💡 Ghi nhớ:</strong> Vùng Pause trong DPD và UPD chứa nhiều lệnh BÁN của institutional traders. Khi giá quay lại, họ sẽ tiếp tục bán, tạo áp lực giảm giá.</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/0A0E17/EF4444?text=DPD+Creates+HFZ" alt="DPD Creates HFZ">
                    <p>📸 Pattern DPD tạo HFZ tại vùng Pause</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/0A0E17/EF4444?text=UPD+Creates+HFZ" alt="UPD Creates HFZ">
                    <p>📸 Pattern UPD tạo HFZ tại vùng Pause</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">⚡</span> Cách Sử Dụng HFZ Trong Trading</h2>

                <div class="formula-box">
                    <div class="formula">Giá chạm HFZ = TÍN HIỆU SHORT (BÁN)</div>
                    <div class="explanation">Chờ giá quay lại vùng HFZ, tìm xác nhận rejection, và vào lệnh SHORT</div>
                </div>

                <h3>Quy trình trading với HFZ:</h3>
                <ol>
                    <li><strong>Xác định HFZ:</strong> Tìm vùng Pause của DPD hoặc UPD</li>
                    <li><strong>Đợi giá quay lại:</strong> Giá phải chạm vào vùng HFZ</li>
                    <li><strong>Tìm xác nhận:</strong> Nến rejection (Pin bar, Engulfing...)</li>
                    <li><strong>Entry SHORT:</strong> Sau khi có xác nhận bearish</li>
                    <li><strong>Stop Loss:</strong> Trên đỉnh của HFZ zone</li>
                </ol>

                <div class="highlight-box cyan">
                    <p><strong>⚠️ Quan trọng:</strong> KHÔNG bao giờ short ngay khi giá chạm HFZ. Luôn chờ nến xác nhận rejection!</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/00F0FF?text=HFZ+Entry+Process" alt="HFZ Entry Process">
                    <p>📸 Quy trình entry SHORT tại HFZ</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🔍</span> So Sánh HFZ và LFZ</h2>

                <p>Để hiểu rõ hơn về HFZ, hãy so sánh với người anh em của nó - LFZ:</p>

                <div class="comparison-grid">
                    <div class="comparison-item hfz">
                        <h4>🔴 HFZ (Sell Zone)</h4>
                        <p><strong>High Frequency Zone</strong></p>
                        <p>Vị trí: TRÊN giá</p>
                        <p>Tín hiệu: SHORT</p>
                        <p>Từ: DPD, UPD</p>
                        <p>Ý nghĩa: Vùng bán</p>
                    </div>
                    <div class="comparison-item lfz">
                        <h4>🟢 LFZ (Buy Zone)</h4>
                        <p><strong>Low Frequency Zone</strong></p>
                        <p>Vị trí: DƯỚI giá</p>
                        <p>Tín hiệu: LONG</p>
                        <p>Từ: UPU, DPU</p>
                        <p>Ý nghĩa: Vùng mua</p>
                    </div>
                </div>

                <div class="highlight-box green">
                    <p><strong>💡 Mẹo nhớ:</strong></p>
                    <ul style="margin-top: 0.5rem; padding-left: 1.25rem;">
                        <li><strong>HFZ</strong> = "High" = Cao = TRÊN giá = SHORT</li>
                        <li><strong>LFZ</strong> = "Low" = Thấp = DƯỚI giá = LONG</li>
                    </ul>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📊</span> Ví Dụ Thực Tế</h2>

                <h3>Case Study: BTC/USDT - 4H</h3>
                <ol>
                    <li>Giá tạo pattern UPD trên khung 4H</li>
                    <li>Vùng Pause được xác định là HFZ</li>
                    <li>Giá break down khỏi Pause</li>
                    <li>Sau vài ngày, giá quay lại test HFZ</li>
                    <li>Nến Pin bar xuất hiện = Xác nhận rejection</li>
                    <li>Entry SHORT với R:R 1:3</li>
                </ol>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x450/0A0E17/FFBD59?text=BTC+HFZ+Case+Study" alt="BTC HFZ Case Study">
                    <p>📸 Case study: BTC/USDT test HFZ và rejection</p>
                </div>

                <div class="highlight-box purple">
                    <p><strong>📈 Kết quả:</strong> Trade này đạt TP tại R:R 1:2.5 sau 2 ngày. HFZ zone hoạt động như kỳ vọng!</p>
                </div>
            </div>

            <div class="summary-box">
                <h3>📝 Tóm Tắt Bài Học</h3>
                <ul>
                    <li>HFZ = High Frequency Zone = Vùng có nhiều lệnh BÁN chờ</li>
                    <li>HFZ luôn nằm TRÊN giá hiện tại</li>
                    <li>Được tạo từ vùng Pause của DPD hoặc UPD</li>
                    <li>Tín hiệu: SHORT khi giá quay lại test + có xác nhận rejection</li>
                    <li>Luôn chờ nến xác nhận, KHÔNG entry ngay khi chạm zone</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-container">
                <h2><span class="icon">❓</span> Kiểm Tra Kiến Thức</h2>

                <div class="quiz-question" data-correct="1">
                    <p>1. HFZ là viết tắt của gì và có ý nghĩa như thế nào?</p>
                    <button class="quiz-option" data-index="0">A. High Frequency Zone - Vùng mua</button>
                    <button class="quiz-option" data-index="1">B. High Frequency Zone - Vùng bán</button>
                    <button class="quiz-option" data-index="2">C. Low Frequency Zone - Vùng mua</button>
                    <button class="quiz-option" data-index="3">D. Low Frequency Zone - Vùng bán</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <p>2. HFZ được tạo từ những patterns nào?</p>
                    <button class="quiz-option" data-index="0">A. UPU và DPU</button>
                    <button class="quiz-option" data-index="1">B. UPU và UPD</button>
                    <button class="quiz-option" data-index="2">C. DPD và UPD</button>
                    <button class="quiz-option" data-index="3">D. DPD và DPU</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <p>3. Khi trade với HFZ, bạn nên làm gì?</p>
                    <button class="quiz-option" data-index="0">A. Chờ giá chạm zone VÀ có nến xác nhận rejection rồi mới SHORT</button>
                    <button class="quiz-option" data-index="1">B. SHORT ngay khi giá chạm zone</button>
                    <button class="quiz-option" data-index="2">C. LONG khi giá chạm zone</button>
                    <button class="quiz-option" data-index="3">D. Không cần quan tâm đến zone</button>
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
            <p>Bài học thuộc <span class="brand">GEM Trading Academy - TIER 2</span></p>
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
                        result.textContent = ''✓ Chính xác! Bạn đã hiểu về HFZ.'';
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
    <title>Bài 1.1: HFZ Là Gì? - GEM Trading Academy</title>
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
            border-bottom: 3px solid var(--error-red);
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
            background: radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 50%);
            animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--error-red) 0%, #DC2626 100%);
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
            border-left: 4px solid var(--error-red);
        }

        @media (min-width: 600px) {
            .content-card {
                border-radius: 16px;
                padding: 2rem;
                margin-bottom: 1.5rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--error-red);
            }
        }

        .content-card h2 {
            font-size: 1.35rem;
            font-weight: 700;
            margin-bottom: 1.25rem;
            color: var(--error-red);
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
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%);
            border: 1px solid rgba(239, 68, 68, 0.3);
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

        .highlight-box.gold {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .highlight-box p {
            margin: 0;
            color: var(--text-primary);
        }

        .image-placeholder {
            background: linear-gradient(145deg, #1a2235 0%, #0d1321 100%);
            border: 2px dashed rgba(239, 68, 68, 0.4);
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
            color: var(--error-red);
            margin: 0;
            font-style: italic;
        }

        .definition-box {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            border: 2px solid var(--error-red);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        .definition-box h3 {
            color: var(--error-red);
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .definition-box .subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
            margin-bottom: 1rem;
        }

        .definition-box .meaning {
            color: var(--text-primary);
            font-size: 1.1rem;
            line-height: 1.6;
        }

        .comparison-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1px;
            background: var(--border-color);
            margin: 1.5rem 0;
        }

        @media (min-width: 600px) {
            .comparison-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                background: transparent;
            }
        }

        .comparison-item {
            padding: 1.25rem;
            text-align: center;
        }

        .comparison-item.hfz {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, var(--bg-card-hover) 100%);
            border-left: 4px solid var(--error-red);
        }

        .comparison-item.lfz {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, var(--bg-card-hover) 100%);
            border-left: 4px solid var(--success-green);
        }

        @media (min-width: 600px) {
            .comparison-item {
                border-radius: 12px;
            }
        }

        .comparison-item h4 {
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
        }

        .comparison-item.hfz h4 { color: var(--error-red); }
        .comparison-item.lfz h4 { color: var(--success-green); }

        .comparison-item p {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin: 0.25rem 0;
        }

        .formula-box {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        .formula-box .formula {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--error-red);
            margin-bottom: 1rem;
            font-family: monospace;
        }

        .formula-box .explanation {
            color: var(--text-secondary);
            font-size: 0.95rem;
        }

        .pattern-source {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            margin: 1.5rem 0;
            justify-content: center;
        }

        .pattern-tag {
            background: var(--bg-card-hover);
            border: 2px solid var(--error-red);
            border-radius: 8px;
            padding: 0.75rem 1.5rem;
            text-align: center;
        }

        .pattern-tag .name {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--error-red);
        }

        .pattern-tag .desc {
            font-size: 0.8rem;
            color: var(--text-secondary);
        }

        .summary-box {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            border: 2px solid var(--error-red);
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
            color: var(--error-red);
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
            color: var(--error-red);
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
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score h3 {
            color: var(--error-red);
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

        .tier-badge {
            display: inline-block;
            background: linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%);
            color: #1a1a2e;
            padding: 0.25rem 0.75rem;
            border-radius: 15px;
            font-size: 0.75rem;
            font-weight: 700;
            margin-left: 0.5rem;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <div class="header-badge">🥈 TIER 2 - Chapter 1</div>
            <h1>HFZ Là Gì? <span class="tier-badge">NÂNG CAO</span></h1>
            <p>High Frequency Zone - Vùng Bán Độc Quyền</p>
        </header>

        <section class="content-section">
            <div class="content-card">
                <h2><span class="icon">🎯</span> Chào Mừng Đến TIER 2!</h2>

                <p>Chúc mừng bạn đã hoàn thành TIER 1! Giờ bạn sẽ học về <strong>Zone Detection</strong> - kỹ năng giúp bạn xác định chính xác vùng giá có xác suất cao.</p>

                <div class="highlight-box gold">
                    <p><strong>📊 Trong TIER 2, bạn sẽ học:</strong></p>
                    <ul style="margin-top: 0.5rem; padding-left: 1.25rem;">
                        <li>HFZ (High Frequency Zone) - Vùng bán</li>
                        <li>LFZ (Low Frequency Zone) - Vùng mua</li>
                        <li>Zone Grading - Chấm điểm chất lượng zone</li>
                        <li>Multi-Timeframe Analysis</li>
                    </ul>
                </div>

                <p>Hãy bắt đầu với <strong>HFZ - High Frequency Zone</strong>!</p>
            </div>

            <div class="content-card">
                <h2><span class="icon">📍</span> Định Nghĩa HFZ</h2>

                <div class="definition-box">
                    <h3>HFZ</h3>
                    <div class="subtitle">High Frequency Zone</div>
                    <div class="meaning">
                        <strong>= Vùng có nhiều lệnh BÁN chờ khớp</strong><br>
                        Khi giá quay lại vùng này, có xác suất cao giá sẽ GIẢM
                    </div>
                </div>

                <h3>Đặc điểm của HFZ:</h3>
                <ul>
                    <li><strong>Vị trí:</strong> Luôn nằm TRÊN giá hiện tại</li>
                    <li><strong>Tín hiệu:</strong> SHORT (bán) khi giá quay lại kiểm tra</li>
                    <li><strong>Nguồn gốc:</strong> Được tạo từ patterns bearish</li>
                    <li><strong>Màu sắc:</strong> Thường đánh dấu bằng màu ĐỎ</li>
                </ul>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/EF4444?text=HFZ+Zone+Example" alt="HFZ Zone Example">
                    <p>📸 Ví dụ HFZ trên chart - Vùng đỏ phía trên giá</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🔄</span> HFZ Được Tạo Từ Patterns Nào?</h2>

                <p>HFZ được hình thành từ 2 patterns chính trong hệ thống GEM Frequency:</p>

                <div class="pattern-source">
                    <div class="pattern-tag">
                        <div class="name">DPD</div>
                        <div class="desc">Down → Pause → Down</div>
                    </div>
                    <div class="pattern-tag">
                        <div class="name">UPD</div>
                        <div class="desc">Up → Pause → Down</div>
                    </div>
                </div>

                <h3>Tại sao những patterns này tạo HFZ?</h3>
                <p>Khi giá tạo pattern DPD hoặc UPD:</p>
                <ol>
                    <li>Phase 1: Giá di chuyển (Up hoặc Down)</li>
                    <li>Phase 2: Giá PAUSE (tích lũy) - <strong>Đây là vùng HFZ!</strong></li>
                    <li>Phase 3: Giá phá xuống (Down)</li>
                </ol>

                <div class="highlight-box">
                    <p><strong>💡 Ghi nhớ:</strong> Vùng Pause trong DPD và UPD chứa nhiều lệnh BÁN của institutional traders. Khi giá quay lại, họ sẽ tiếp tục bán, tạo áp lực giảm giá.</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/0A0E17/EF4444?text=DPD+Creates+HFZ" alt="DPD Creates HFZ">
                    <p>📸 Pattern DPD tạo HFZ tại vùng Pause</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/0A0E17/EF4444?text=UPD+Creates+HFZ" alt="UPD Creates HFZ">
                    <p>📸 Pattern UPD tạo HFZ tại vùng Pause</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">⚡</span> Cách Sử Dụng HFZ Trong Trading</h2>

                <div class="formula-box">
                    <div class="formula">Giá chạm HFZ = TÍN HIỆU SHORT (BÁN)</div>
                    <div class="explanation">Chờ giá quay lại vùng HFZ, tìm xác nhận rejection, và vào lệnh SHORT</div>
                </div>

                <h3>Quy trình trading với HFZ:</h3>
                <ol>
                    <li><strong>Xác định HFZ:</strong> Tìm vùng Pause của DPD hoặc UPD</li>
                    <li><strong>Đợi giá quay lại:</strong> Giá phải chạm vào vùng HFZ</li>
                    <li><strong>Tìm xác nhận:</strong> Nến rejection (Pin bar, Engulfing...)</li>
                    <li><strong>Entry SHORT:</strong> Sau khi có xác nhận bearish</li>
                    <li><strong>Stop Loss:</strong> Trên đỉnh của HFZ zone</li>
                </ol>

                <div class="highlight-box cyan">
                    <p><strong>⚠️ Quan trọng:</strong> KHÔNG bao giờ short ngay khi giá chạm HFZ. Luôn chờ nến xác nhận rejection!</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/00F0FF?text=HFZ+Entry+Process" alt="HFZ Entry Process">
                    <p>📸 Quy trình entry SHORT tại HFZ</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🔍</span> So Sánh HFZ và LFZ</h2>

                <p>Để hiểu rõ hơn về HFZ, hãy so sánh với người anh em của nó - LFZ:</p>

                <div class="comparison-grid">
                    <div class="comparison-item hfz">
                        <h4>🔴 HFZ (Sell Zone)</h4>
                        <p><strong>High Frequency Zone</strong></p>
                        <p>Vị trí: TRÊN giá</p>
                        <p>Tín hiệu: SHORT</p>
                        <p>Từ: DPD, UPD</p>
                        <p>Ý nghĩa: Vùng bán</p>
                    </div>
                    <div class="comparison-item lfz">
                        <h4>🟢 LFZ (Buy Zone)</h4>
                        <p><strong>Low Frequency Zone</strong></p>
                        <p>Vị trí: DƯỚI giá</p>
                        <p>Tín hiệu: LONG</p>
                        <p>Từ: UPU, DPU</p>
                        <p>Ý nghĩa: Vùng mua</p>
                    </div>
                </div>

                <div class="highlight-box green">
                    <p><strong>💡 Mẹo nhớ:</strong></p>
                    <ul style="margin-top: 0.5rem; padding-left: 1.25rem;">
                        <li><strong>HFZ</strong> = "High" = Cao = TRÊN giá = SHORT</li>
                        <li><strong>LFZ</strong> = "Low" = Thấp = DƯỚI giá = LONG</li>
                    </ul>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📊</span> Ví Dụ Thực Tế</h2>

                <h3>Case Study: BTC/USDT - 4H</h3>
                <ol>
                    <li>Giá tạo pattern UPD trên khung 4H</li>
                    <li>Vùng Pause được xác định là HFZ</li>
                    <li>Giá break down khỏi Pause</li>
                    <li>Sau vài ngày, giá quay lại test HFZ</li>
                    <li>Nến Pin bar xuất hiện = Xác nhận rejection</li>
                    <li>Entry SHORT với R:R 1:3</li>
                </ol>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x450/0A0E17/FFBD59?text=BTC+HFZ+Case+Study" alt="BTC HFZ Case Study">
                    <p>📸 Case study: BTC/USDT test HFZ và rejection</p>
                </div>

                <div class="highlight-box purple">
                    <p><strong>📈 Kết quả:</strong> Trade này đạt TP tại R:R 1:2.5 sau 2 ngày. HFZ zone hoạt động như kỳ vọng!</p>
                </div>
            </div>

            <div class="summary-box">
                <h3>📝 Tóm Tắt Bài Học</h3>
                <ul>
                    <li>HFZ = High Frequency Zone = Vùng có nhiều lệnh BÁN chờ</li>
                    <li>HFZ luôn nằm TRÊN giá hiện tại</li>
                    <li>Được tạo từ vùng Pause của DPD hoặc UPD</li>
                    <li>Tín hiệu: SHORT khi giá quay lại test + có xác nhận rejection</li>
                    <li>Luôn chờ nến xác nhận, KHÔNG entry ngay khi chạm zone</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-container">
                <h2><span class="icon">❓</span> Kiểm Tra Kiến Thức</h2>

                <div class="quiz-question" data-correct="1">
                    <p>1. HFZ là viết tắt của gì và có ý nghĩa như thế nào?</p>
                    <button class="quiz-option" data-index="0">A. High Frequency Zone - Vùng mua</button>
                    <button class="quiz-option" data-index="1">B. High Frequency Zone - Vùng bán</button>
                    <button class="quiz-option" data-index="2">C. Low Frequency Zone - Vùng mua</button>
                    <button class="quiz-option" data-index="3">D. Low Frequency Zone - Vùng bán</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <p>2. HFZ được tạo từ những patterns nào?</p>
                    <button class="quiz-option" data-index="0">A. UPU và DPU</button>
                    <button class="quiz-option" data-index="1">B. UPU và UPD</button>
                    <button class="quiz-option" data-index="2">C. DPD và UPD</button>
                    <button class="quiz-option" data-index="3">D. DPD và DPU</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <p>3. Khi trade với HFZ, bạn nên làm gì?</p>
                    <button class="quiz-option" data-index="0">A. Chờ giá chạm zone VÀ có nến xác nhận rejection rồi mới SHORT</button>
                    <button class="quiz-option" data-index="1">B. SHORT ngay khi giá chạm zone</button>
                    <button class="quiz-option" data-index="2">C. LONG khi giá chạm zone</button>
                    <button class="quiz-option" data-index="3">D. Không cần quan tâm đến zone</button>
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
            <p>Bài học thuộc <span class="brand">GEM Trading Academy - TIER 2</span></p>
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
                        result.textContent = ''✓ Chính xác! Bạn đã hiểu về HFZ.'';
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

-- Lesson 1.2: Cách Vẽ HFZ Chính Xác - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch1-l2',
  'module-tier-2-ch1',
  'course-tier2-trading-advanced',
  'Bài 1.2: Cách Vẽ HFZ Chính Xác - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 1.2: Cách Vẽ HFZ Chính Xác - GEM Trading Academy</title>
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

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.7;
            font-size: 16px;
        }

        .lesson-container { max-width: 800px; margin: 0 auto; background: var(--bg-dark); }

        @media (min-width: 600px) {
            body { padding: 2rem; background: linear-gradient(135deg, #0A0E17 0%, #112250 100%); }
            .lesson-container { background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-color); overflow: hidden; }
        }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem 1rem;
            text-align: center;
            border-bottom: 3px solid var(--error-red);
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--error-red) 0%, #DC2626 100%);
            color: white;
            padding: 0.5rem 1.25rem;
            border-radius: 25px;
            font-size: 0.85rem;
            font-weight: 700;
            margin-bottom: 1rem;
            text-transform: uppercase;
        }

        .lesson-header h1 { font-size: clamp(1.5rem, 5vw, 2rem); font-weight: 700; margin-bottom: 0.5rem; }
        .lesson-header p { color: var(--text-secondary); }

        .content-section { padding: 0; }
        @media (min-width: 600px) { .content-section { padding: 1.5rem; } }

        .content-card {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin-bottom: 1px;
            border-left: 4px solid var(--error-red);
        }

        @media (min-width: 600px) {
            .content-card {
                border-radius: 16px;
                padding: 2rem;
                margin-bottom: 1.5rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--error-red);
            }
        }

        .content-card h2 {
            font-size: 1.35rem;
            font-weight: 700;
            margin-bottom: 1.25rem;
            color: var(--error-red);
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .content-card h3 { font-size: 1.1rem; font-weight: 600; margin: 1.5rem 0 1rem 0; color: var(--accent-cyan); }
        .content-card p { margin-bottom: 1rem; color: var(--text-secondary); line-height: 1.8; }
        .content-card ul, .content-card ol { margin: 1rem 0; padding-left: 1.5rem; color: var(--text-secondary); }
        .content-card li { margin-bottom: 0.75rem; }

        .highlight-box {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1.25rem 0;
        }

        .highlight-box.cyan { background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(0, 240, 255, 0.05) 100%); border-color: rgba(0, 240, 255, 0.3); }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%); border-color: rgba(16, 185, 129, 0.3); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%); border-color: rgba(255, 189, 89, 0.3); }
        .highlight-box p { margin: 0; color: var(--text-primary); }

        .image-placeholder {
            background: linear-gradient(145deg, #1a2235 0%, #0d1321 100%);
            border: 2px dashed rgba(239, 68, 68, 0.4);
            border-radius: 12px;
            padding: 1rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        .image-placeholder img { max-width: 100%; border-radius: 8px; margin-bottom: 0.75rem; }
        .image-placeholder p { font-size: 0.85rem; color: var(--error-red); margin: 0; font-style: italic; }

        .step-card {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1rem 0;
            border-left: 4px solid var(--primary-gold);
        }

        .step-card .step-number {
            display: inline-block;
            width: 2rem;
            height: 2rem;
            background: var(--primary-gold);
            color: var(--primary-navy);
            border-radius: 50%;
            text-align: center;
            line-height: 2rem;
            font-weight: 700;
            margin-right: 0.75rem;
        }

        .step-card h4 { display: inline; color: var(--text-primary); font-size: 1.1rem; }
        .step-card p { margin-top: 0.75rem; color: var(--text-secondary); font-size: 0.95rem; }

        .zone-anatomy {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        .zone-anatomy .zone-visual {
            background: linear-gradient(180deg, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.1) 100%);
            border: 2px solid var(--error-red);
            border-radius: 8px;
            padding: 2rem 1rem;
            margin: 1rem 0;
            position: relative;
        }

        .zone-anatomy .zone-label {
            position: absolute;
            right: 1rem;
            background: var(--error-red);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .zone-anatomy .zone-label.top { top: 0.5rem; }
        .zone-anatomy .zone-label.bottom { bottom: 0.5rem; }

        .rule-box {
            background: var(--primary-navy);
            border: 2px solid var(--error-red);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        .rule-box h4 { color: var(--error-red); margin-bottom: 1rem; }
        .rule-box ul { list-style: none; padding: 0; }
        .rule-box li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; color: var(--text-secondary); }
        .rule-box li::before { content: ''✓''; position: absolute; left: 0; color: var(--error-red); }

        .summary-box {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            border: 2px solid var(--error-red);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin: 0;
        }

        @media (min-width: 600px) { .summary-box { border-radius: 16px; padding: 2rem; margin: 1.5rem; } }

        .summary-box h3 { color: var(--error-red); font-size: 1.25rem; margin-bottom: 1rem; }
        .summary-box ul { list-style: none; padding: 0; }
        .summary-box li { padding: 0.5rem 0; padding-left: 1.75rem; position: relative; color: var(--text-primary); }
        .summary-box li::before { content: ''✓''; position: absolute; left: 0; color: var(--error-red); font-weight: 700; }

        .quiz-section { padding: 0; }
        @media (min-width: 600px) { .quiz-section { padding: 1.5rem; } }

        .quiz-container {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            border-left: 4px solid var(--accent-purple);
        }

        @media (min-width: 600px) {
            .quiz-container { border-radius: 16px; padding: 2rem; border: 1px solid var(--border-color); border-left: 4px solid var(--accent-purple); }
        }

        .quiz-container h2 { color: var(--accent-purple); font-size: 1.35rem; margin-bottom: 1.5rem; }

        .quiz-question {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1.25rem;
            border: 1px solid var(--border-color);
        }

        .quiz-question p { font-weight: 600; margin-bottom: 1rem; color: var(--text-primary); }

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
        }

        .quiz-option:hover { border-color: var(--accent-purple); background: rgba(106, 91, 255, 0.1); }
        .quiz-option.correct { background: rgba(16, 185, 129, 0.2); border-color: var(--success-green); color: var(--success-green); }
        .quiz-option.incorrect { background: rgba(239, 68, 68, 0.2); border-color: var(--error-red); color: var(--error-red); }

        .quiz-result { padding: 0.75rem; border-radius: 8px; margin-top: 0.75rem; font-weight: 600; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: var(--success-green); }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: var(--error-red); }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show { display: block; }
        .quiz-score h3 { color: var(--error-red); margin-bottom: 0.5rem; }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--accent-purple) 0%, #5346E0 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
        }

        .lesson-footer { text-align: center; padding: 2rem 1rem; background: var(--bg-card); border-top: 1px solid var(--border-color); }
        .lesson-footer p { color: var(--text-secondary); font-size: 0.9rem; }
        .lesson-footer .brand { color: var(--primary-gold); font-weight: 700; }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <div class="header-badge">🥈 TIER 2 - Chapter 1</div>
            <h1>Cách Vẽ HFZ Chính Xác</h1>
            <p>Xác định Entry, Stop Loss và độ dày zone chuẩn xác</p>
        </header>

        <section class="content-section">
            <div class="content-card">
                <h2><span class="icon">📐</span> Cấu Trúc HFZ Zone</h2>

                <p>Một HFZ zone được xác định bởi <strong>2 đường ngang</strong>: đường Entry và đường Stop Loss.</p>

                <div class="zone-anatomy">
                    <h4 style="color: var(--error-red); margin-bottom: 1rem;">Cấu Trúc HFZ Zone</h4>
                    <div class="zone-visual">
                        <span class="zone-label top">STOP LOSS (Đỉnh Pause)</span>
                        <p style="color: var(--error-red); font-weight: 700; font-size: 1.25rem;">HFZ ZONE</p>
                        <span class="zone-label bottom">ENTRY (Đáy Pause)</span>
                    </div>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 1rem;">
                        ↑ Giá hiện tại nằm DƯỚI zone này
                    </p>
                </div>

                <div class="highlight-box">
                    <p><strong>💡 Quy tắc vàng:</strong></p>
                    <ul style="margin-top: 0.5rem; padding-left: 1.25rem;">
                        <li><strong>Entry:</strong> Đáy của vùng Pause (gần giá hiện tại nhất)</li>
                        <li><strong>Stop Loss:</strong> Đỉnh của vùng Pause (xa giá hiện tại nhất)</li>
                    </ul>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📝</span> 4 Bước Vẽ HFZ</h2>

                <div class="step-card">
                    <span class="step-number">1</span>
                    <h4>Xác định Pattern DPD hoặc UPD</h4>
                    <p>Tìm pattern có 3 phases: Phase 1 (di chuyển) → Phase 2 (Pause) → Phase 3 (Down)</p>
                </div>

                <div class="step-card">
                    <span class="step-number">2</span>
                    <h4>Xác định vùng Pause</h4>
                    <p>Đây là vùng consolidation/tích lũy giữa Phase 1 và Phase 3. Vùng này chứa nhiều nến đi ngang.</p>
                </div>

                <div class="step-card">
                    <span class="step-number">3</span>
                    <h4>Vẽ đường Entry (đáy Pause)</h4>
                    <p>Đường ngang đi qua điểm THẤP NHẤT của vùng Pause. Đây là nơi giá sẽ chạm đầu tiên khi quay lại.</p>
                </div>

                <div class="step-card">
                    <span class="step-number">4</span>
                    <h4>Vẽ đường Stop Loss (đỉnh Pause)</h4>
                    <p>Đường ngang đi qua điểm CAO NHẤT của vùng Pause. Stop Loss sẽ đặt ngay trên đường này.</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x450/112250/EF4444?text=4+Steps+Draw+HFZ" alt="4 Steps to Draw HFZ">
                    <p>📸 4 bước vẽ HFZ trên chart thực tế</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📏</span> Quy Tắc Độ Dày Zone</h2>

                <p>Độ dày của HFZ zone ảnh hưởng đến <strong>Risk:Reward</strong> và tính khả thi của trade.</p>

                <div class="rule-box">
                    <h4>📐 Quy Tắc Độ Dày Tối Ưu</h4>
                    <ul>
                        <li>Zone quá mỏng (&lt;0.5% giá): R:R tốt nhưng dễ bị stop out sớm</li>
                        <li>Zone vừa phải (0.5-2% giá): Lý tưởng cho hầu hết trades</li>
                        <li>Zone quá dày (&gt;3% giá): R:R kém, cân nhắc bỏ qua</li>
                        <li>Nên target R:R tối thiểu 1:2 sau khi tính zone thickness</li>
                    </ul>
                </div>

                <h3>Công thức tính độ dày:</h3>
                <div class="highlight-box cyan">
                    <p><strong>Độ dày (%) = (Đỉnh Pause - Đáy Pause) / Đáy Pause × 100</strong></p>
                    <p style="margin-top: 0.5rem; font-size: 0.9rem;">Ví dụ: Đỉnh = $105, Đáy = $100 → Độ dày = 5%</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/0A0E17/00F0FF?text=Zone+Thickness+Examples" alt="Zone Thickness Examples">
                    <p>📸 So sánh zone mỏng, vừa và dày</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">⚠️</span> Lỗi Thường Gặp Khi Vẽ HFZ</h2>

                <h3>❌ Lỗi 1: Vẽ zone quá rộng</h3>
                <p>Bao gồm cả những nến không thuộc vùng Pause, làm zone quá dày và R:R kém.</p>

                <h3>❌ Lỗi 2: Vẽ zone quá hẹp</h3>
                <p>Chỉ vẽ theo thân nến, bỏ qua wicks. Zone quá mỏng dễ bị false breakout.</p>

                <h3>❌ Lỗi 3: Nhầm lẫn Entry và Stop</h3>
                <p>Nhớ: Entry = GẦN giá hiện tại, Stop = XA giá hiện tại. Với HFZ, Entry ở đáy, Stop ở đỉnh.</p>

                <div class="highlight-box gold">
                    <p><strong>✅ Cách đúng:</strong> Bao gồm cả thân nến VÀ wicks của các nến trong vùng Pause. Zone nên chứa 70-90% các price action trong vùng consolidation.</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/FFBD59?text=Common+Mistakes" alt="Common Mistakes">
                    <p>📸 So sánh vẽ zone sai và đúng</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🎯</span> Thực Hành: 3 Ví Dụ</h2>

                <h3>Ví dụ 1: ETH/USDT - 4H</h3>
                <p>Pattern UPD với vùng Pause rõ ràng. Zone thickness khoảng 1.5% - lý tưởng.</p>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/0A0E17/EF4444?text=Example+1+ETH" alt="Example 1 ETH">
                    <p>📸 Ví dụ 1: ETH/USDT HFZ zone</p>
                </div>

                <h3>Ví dụ 2: BTC/USDT - 1D</h3>
                <p>Pattern DPD trên daily. Zone dày hơn (~2.5%) nhưng vẫn tradeable với R:R 1:2.</p>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/0A0E17/EF4444?text=Example+2+BTC" alt="Example 2 BTC">
                    <p>📸 Ví dụ 2: BTC/USDT HFZ zone</p>
                </div>

                <h3>Ví dụ 3: SOL/USDT - 1H</h3>
                <p>Zone mỏng (~0.8%) - R:R tuyệt vời nhưng cần tight stop management.</p>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/0A0E17/EF4444?text=Example+3+SOL" alt="Example 3 SOL">
                    <p>📸 Ví dụ 3: SOL/USDT HFZ zone</p>
                </div>
            </div>

            <div class="summary-box">
                <h3>📝 Tóm Tắt Bài Học</h3>
                <ul>
                    <li>HFZ có 2 đường: Entry (đáy Pause) và Stop Loss (đỉnh Pause)</li>
                    <li>4 bước vẽ: Xác định pattern → Tìm Pause → Vẽ Entry → Vẽ Stop</li>
                    <li>Độ dày zone lý tưởng: 0.5-2% giá để có R:R tốt</li>
                    <li>Bao gồm cả wicks, không chỉ thân nến</li>
                    <li>Tránh zone quá dày (&gt;3%) vì R:R kém</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-container">
                <h2>❓ Kiểm Tra Kiến Thức</h2>

                <div class="quiz-question" data-correct="1">
                    <p>1. Với HFZ, đường Entry được vẽ ở đâu?</p>
                    <button class="quiz-option" data-index="0">A. Đỉnh của vùng Pause</button>
                    <button class="quiz-option" data-index="1">B. Đáy của vùng Pause (gần giá hiện tại)</button>
                    <button class="quiz-option" data-index="2">C. Giữa vùng Pause</button>
                    <button class="quiz-option" data-index="3">D. Bên dưới vùng Pause</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <p>2. Độ dày zone lý tưởng cho HFZ là bao nhiêu?</p>
                    <button class="quiz-option" data-index="0">A. Dưới 0.1%</button>
                    <button class="quiz-option" data-index="1">B. Trên 5%</button>
                    <button class="quiz-option" data-index="2">C. 0.5-2% giá</button>
                    <button class="quiz-option" data-index="3">D. Càng dày càng tốt</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <p>3. Khi vẽ HFZ zone, bạn nên làm gì với wicks của nến?</p>
                    <button class="quiz-option" data-index="0">A. Bao gồm cả wicks trong zone</button>
                    <button class="quiz-option" data-index="1">B. Chỉ vẽ theo thân nến</button>
                    <button class="quiz-option" data-index="2">C. Bỏ qua hoàn toàn wicks</button>
                    <button class="quiz-option" data-index="3">D. Chỉ tính wicks dài hơn 1%</button>
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
            <p>Bài học thuộc <span class="brand">GEM Trading Academy - TIER 2</span></p>
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
                        result.textContent = ''✓ Chính xác!'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng.'';
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
    <title>Bài 1.2: Cách Vẽ HFZ Chính Xác - GEM Trading Academy</title>
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

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.7;
            font-size: 16px;
        }

        .lesson-container { max-width: 800px; margin: 0 auto; background: var(--bg-dark); }

        @media (min-width: 600px) {
            body { padding: 2rem; background: linear-gradient(135deg, #0A0E17 0%, #112250 100%); }
            .lesson-container { background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-color); overflow: hidden; }
        }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem 1rem;
            text-align: center;
            border-bottom: 3px solid var(--error-red);
        }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--error-red) 0%, #DC2626 100%);
            color: white;
            padding: 0.5rem 1.25rem;
            border-radius: 25px;
            font-size: 0.85rem;
            font-weight: 700;
            margin-bottom: 1rem;
            text-transform: uppercase;
        }

        .lesson-header h1 { font-size: clamp(1.5rem, 5vw, 2rem); font-weight: 700; margin-bottom: 0.5rem; }
        .lesson-header p { color: var(--text-secondary); }

        .content-section { padding: 0; }
        @media (min-width: 600px) { .content-section { padding: 1.5rem; } }

        .content-card {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin-bottom: 1px;
            border-left: 4px solid var(--error-red);
        }

        @media (min-width: 600px) {
            .content-card {
                border-radius: 16px;
                padding: 2rem;
                margin-bottom: 1.5rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--error-red);
            }
        }

        .content-card h2 {
            font-size: 1.35rem;
            font-weight: 700;
            margin-bottom: 1.25rem;
            color: var(--error-red);
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .content-card h3 { font-size: 1.1rem; font-weight: 600; margin: 1.5rem 0 1rem 0; color: var(--accent-cyan); }
        .content-card p { margin-bottom: 1rem; color: var(--text-secondary); line-height: 1.8; }
        .content-card ul, .content-card ol { margin: 1rem 0; padding-left: 1.5rem; color: var(--text-secondary); }
        .content-card li { margin-bottom: 0.75rem; }

        .highlight-box {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1.25rem 0;
        }

        .highlight-box.cyan { background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(0, 240, 255, 0.05) 100%); border-color: rgba(0, 240, 255, 0.3); }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%); border-color: rgba(16, 185, 129, 0.3); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%); border-color: rgba(255, 189, 89, 0.3); }
        .highlight-box p { margin: 0; color: var(--text-primary); }

        .image-placeholder {
            background: linear-gradient(145deg, #1a2235 0%, #0d1321 100%);
            border: 2px dashed rgba(239, 68, 68, 0.4);
            border-radius: 12px;
            padding: 1rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        .image-placeholder img { max-width: 100%; border-radius: 8px; margin-bottom: 0.75rem; }
        .image-placeholder p { font-size: 0.85rem; color: var(--error-red); margin: 0; font-style: italic; }

        .step-card {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1rem 0;
            border-left: 4px solid var(--primary-gold);
        }

        .step-card .step-number {
            display: inline-block;
            width: 2rem;
            height: 2rem;
            background: var(--primary-gold);
            color: var(--primary-navy);
            border-radius: 50%;
            text-align: center;
            line-height: 2rem;
            font-weight: 700;
            margin-right: 0.75rem;
        }

        .step-card h4 { display: inline; color: var(--text-primary); font-size: 1.1rem; }
        .step-card p { margin-top: 0.75rem; color: var(--text-secondary); font-size: 0.95rem; }

        .zone-anatomy {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        .zone-anatomy .zone-visual {
            background: linear-gradient(180deg, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.1) 100%);
            border: 2px solid var(--error-red);
            border-radius: 8px;
            padding: 2rem 1rem;
            margin: 1rem 0;
            position: relative;
        }

        .zone-anatomy .zone-label {
            position: absolute;
            right: 1rem;
            background: var(--error-red);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .zone-anatomy .zone-label.top { top: 0.5rem; }
        .zone-anatomy .zone-label.bottom { bottom: 0.5rem; }

        .rule-box {
            background: var(--primary-navy);
            border: 2px solid var(--error-red);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        .rule-box h4 { color: var(--error-red); margin-bottom: 1rem; }
        .rule-box ul { list-style: none; padding: 0; }
        .rule-box li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; color: var(--text-secondary); }
        .rule-box li::before { content: ''✓''; position: absolute; left: 0; color: var(--error-red); }

        .summary-box {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            border: 2px solid var(--error-red);
            border-radius: 0;
            padding: 1.5rem 1rem;
            margin: 0;
        }

        @media (min-width: 600px) { .summary-box { border-radius: 16px; padding: 2rem; margin: 1.5rem; } }

        .summary-box h3 { color: var(--error-red); font-size: 1.25rem; margin-bottom: 1rem; }
        .summary-box ul { list-style: none; padding: 0; }
        .summary-box li { padding: 0.5rem 0; padding-left: 1.75rem; position: relative; color: var(--text-primary); }
        .summary-box li::before { content: ''✓''; position: absolute; left: 0; color: var(--error-red); font-weight: 700; }

        .quiz-section { padding: 0; }
        @media (min-width: 600px) { .quiz-section { padding: 1.5rem; } }

        .quiz-container {
            background: var(--bg-card);
            border-radius: 0;
            padding: 1.5rem 1rem;
            border-left: 4px solid var(--accent-purple);
        }

        @media (min-width: 600px) {
            .quiz-container { border-radius: 16px; padding: 2rem; border: 1px solid var(--border-color); border-left: 4px solid var(--accent-purple); }
        }

        .quiz-container h2 { color: var(--accent-purple); font-size: 1.35rem; margin-bottom: 1.5rem; }

        .quiz-question {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1.25rem;
            border: 1px solid var(--border-color);
        }

        .quiz-question p { font-weight: 600; margin-bottom: 1rem; color: var(--text-primary); }

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
        }

        .quiz-option:hover { border-color: var(--accent-purple); background: rgba(106, 91, 255, 0.1); }
        .quiz-option.correct { background: rgba(16, 185, 129, 0.2); border-color: var(--success-green); color: var(--success-green); }
        .quiz-option.incorrect { background: rgba(239, 68, 68, 0.2); border-color: var(--error-red); color: var(--error-red); }

        .quiz-result { padding: 0.75rem; border-radius: 8px; margin-top: 0.75rem; font-weight: 600; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: var(--success-green); }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: var(--error-red); }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show { display: block; }
        .quiz-score h3 { color: var(--error-red); margin-bottom: 0.5rem; }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--accent-purple) 0%, #5346E0 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
        }

        .lesson-footer { text-align: center; padding: 2rem 1rem; background: var(--bg-card); border-top: 1px solid var(--border-color); }
        .lesson-footer p { color: var(--text-secondary); font-size: 0.9rem; }
        .lesson-footer .brand { color: var(--primary-gold); font-weight: 700; }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <div class="header-badge">🥈 TIER 2 - Chapter 1</div>
            <h1>Cách Vẽ HFZ Chính Xác</h1>
            <p>Xác định Entry, Stop Loss và độ dày zone chuẩn xác</p>
        </header>

        <section class="content-section">
            <div class="content-card">
                <h2><span class="icon">📐</span> Cấu Trúc HFZ Zone</h2>

                <p>Một HFZ zone được xác định bởi <strong>2 đường ngang</strong>: đường Entry và đường Stop Loss.</p>

                <div class="zone-anatomy">
                    <h4 style="color: var(--error-red); margin-bottom: 1rem;">Cấu Trúc HFZ Zone</h4>
                    <div class="zone-visual">
                        <span class="zone-label top">STOP LOSS (Đỉnh Pause)</span>
                        <p style="color: var(--error-red); font-weight: 700; font-size: 1.25rem;">HFZ ZONE</p>
                        <span class="zone-label bottom">ENTRY (Đáy Pause)</span>
                    </div>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 1rem;">
                        ↑ Giá hiện tại nằm DƯỚI zone này
                    </p>
                </div>

                <div class="highlight-box">
                    <p><strong>💡 Quy tắc vàng:</strong></p>
                    <ul style="margin-top: 0.5rem; padding-left: 1.25rem;">
                        <li><strong>Entry:</strong> Đáy của vùng Pause (gần giá hiện tại nhất)</li>
                        <li><strong>Stop Loss:</strong> Đỉnh của vùng Pause (xa giá hiện tại nhất)</li>
                    </ul>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📝</span> 4 Bước Vẽ HFZ</h2>

                <div class="step-card">
                    <span class="step-number">1</span>
                    <h4>Xác định Pattern DPD hoặc UPD</h4>
                    <p>Tìm pattern có 3 phases: Phase 1 (di chuyển) → Phase 2 (Pause) → Phase 3 (Down)</p>
                </div>

                <div class="step-card">
                    <span class="step-number">2</span>
                    <h4>Xác định vùng Pause</h4>
                    <p>Đây là vùng consolidation/tích lũy giữa Phase 1 và Phase 3. Vùng này chứa nhiều nến đi ngang.</p>
                </div>

                <div class="step-card">
                    <span class="step-number">3</span>
                    <h4>Vẽ đường Entry (đáy Pause)</h4>
                    <p>Đường ngang đi qua điểm THẤP NHẤT của vùng Pause. Đây là nơi giá sẽ chạm đầu tiên khi quay lại.</p>
                </div>

                <div class="step-card">
                    <span class="step-number">4</span>
                    <h4>Vẽ đường Stop Loss (đỉnh Pause)</h4>
                    <p>Đường ngang đi qua điểm CAO NHẤT của vùng Pause. Stop Loss sẽ đặt ngay trên đường này.</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x450/112250/EF4444?text=4+Steps+Draw+HFZ" alt="4 Steps to Draw HFZ">
                    <p>📸 4 bước vẽ HFZ trên chart thực tế</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📏</span> Quy Tắc Độ Dày Zone</h2>

                <p>Độ dày của HFZ zone ảnh hưởng đến <strong>Risk:Reward</strong> và tính khả thi của trade.</p>

                <div class="rule-box">
                    <h4>📐 Quy Tắc Độ Dày Tối Ưu</h4>
                    <ul>
                        <li>Zone quá mỏng (&lt;0.5% giá): R:R tốt nhưng dễ bị stop out sớm</li>
                        <li>Zone vừa phải (0.5-2% giá): Lý tưởng cho hầu hết trades</li>
                        <li>Zone quá dày (&gt;3% giá): R:R kém, cân nhắc bỏ qua</li>
                        <li>Nên target R:R tối thiểu 1:2 sau khi tính zone thickness</li>
                    </ul>
                </div>

                <h3>Công thức tính độ dày:</h3>
                <div class="highlight-box cyan">
                    <p><strong>Độ dày (%) = (Đỉnh Pause - Đáy Pause) / Đáy Pause × 100</strong></p>
                    <p style="margin-top: 0.5rem; font-size: 0.9rem;">Ví dụ: Đỉnh = $105, Đáy = $100 → Độ dày = 5%</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/0A0E17/00F0FF?text=Zone+Thickness+Examples" alt="Zone Thickness Examples">
                    <p>📸 So sánh zone mỏng, vừa và dày</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">⚠️</span> Lỗi Thường Gặp Khi Vẽ HFZ</h2>

                <h3>❌ Lỗi 1: Vẽ zone quá rộng</h3>
                <p>Bao gồm cả những nến không thuộc vùng Pause, làm zone quá dày và R:R kém.</p>

                <h3>❌ Lỗi 2: Vẽ zone quá hẹp</h3>
                <p>Chỉ vẽ theo thân nến, bỏ qua wicks. Zone quá mỏng dễ bị false breakout.</p>

                <h3>❌ Lỗi 3: Nhầm lẫn Entry và Stop</h3>
                <p>Nhớ: Entry = GẦN giá hiện tại, Stop = XA giá hiện tại. Với HFZ, Entry ở đáy, Stop ở đỉnh.</p>

                <div class="highlight-box gold">
                    <p><strong>✅ Cách đúng:</strong> Bao gồm cả thân nến VÀ wicks của các nến trong vùng Pause. Zone nên chứa 70-90% các price action trong vùng consolidation.</p>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/FFBD59?text=Common+Mistakes" alt="Common Mistakes">
                    <p>📸 So sánh vẽ zone sai và đúng</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🎯</span> Thực Hành: 3 Ví Dụ</h2>

                <h3>Ví dụ 1: ETH/USDT - 4H</h3>
                <p>Pattern UPD với vùng Pause rõ ràng. Zone thickness khoảng 1.5% - lý tưởng.</p>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/0A0E17/EF4444?text=Example+1+ETH" alt="Example 1 ETH">
                    <p>📸 Ví dụ 1: ETH/USDT HFZ zone</p>
                </div>

                <h3>Ví dụ 2: BTC/USDT - 1D</h3>
                <p>Pattern DPD trên daily. Zone dày hơn (~2.5%) nhưng vẫn tradeable với R:R 1:2.</p>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/0A0E17/EF4444?text=Example+2+BTC" alt="Example 2 BTC">
                    <p>📸 Ví dụ 2: BTC/USDT HFZ zone</p>
                </div>

                <h3>Ví dụ 3: SOL/USDT - 1H</h3>
                <p>Zone mỏng (~0.8%) - R:R tuyệt vời nhưng cần tight stop management.</p>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/0A0E17/EF4444?text=Example+3+SOL" alt="Example 3 SOL">
                    <p>📸 Ví dụ 3: SOL/USDT HFZ zone</p>
                </div>
            </div>

            <div class="summary-box">
                <h3>📝 Tóm Tắt Bài Học</h3>
                <ul>
                    <li>HFZ có 2 đường: Entry (đáy Pause) và Stop Loss (đỉnh Pause)</li>
                    <li>4 bước vẽ: Xác định pattern → Tìm Pause → Vẽ Entry → Vẽ Stop</li>
                    <li>Độ dày zone lý tưởng: 0.5-2% giá để có R:R tốt</li>
                    <li>Bao gồm cả wicks, không chỉ thân nến</li>
                    <li>Tránh zone quá dày (&gt;3%) vì R:R kém</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-container">
                <h2>❓ Kiểm Tra Kiến Thức</h2>

                <div class="quiz-question" data-correct="1">
                    <p>1. Với HFZ, đường Entry được vẽ ở đâu?</p>
                    <button class="quiz-option" data-index="0">A. Đỉnh của vùng Pause</button>
                    <button class="quiz-option" data-index="1">B. Đáy của vùng Pause (gần giá hiện tại)</button>
                    <button class="quiz-option" data-index="2">C. Giữa vùng Pause</button>
                    <button class="quiz-option" data-index="3">D. Bên dưới vùng Pause</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <p>2. Độ dày zone lý tưởng cho HFZ là bao nhiêu?</p>
                    <button class="quiz-option" data-index="0">A. Dưới 0.1%</button>
                    <button class="quiz-option" data-index="1">B. Trên 5%</button>
                    <button class="quiz-option" data-index="2">C. 0.5-2% giá</button>
                    <button class="quiz-option" data-index="3">D. Càng dày càng tốt</button>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <p>3. Khi vẽ HFZ zone, bạn nên làm gì với wicks của nến?</p>
                    <button class="quiz-option" data-index="0">A. Bao gồm cả wicks trong zone</button>
                    <button class="quiz-option" data-index="1">B. Chỉ vẽ theo thân nến</button>
                    <button class="quiz-option" data-index="2">C. Bỏ qua hoàn toàn wicks</button>
                    <button class="quiz-option" data-index="3">D. Chỉ tính wicks dài hơn 1%</button>
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
            <p>Bài học thuộc <span class="brand">GEM Trading Academy - TIER 2</span></p>
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
                        result.textContent = ''✓ Chính xác!'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng.'';
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

-- Lesson 1.3: Vòng Đời Zone (Zone Lifecycle) - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch1-l3',
  'module-tier-2-ch1',
  'course-tier2-trading-advanced',
  'Bài 1.3: Vòng Đời Zone (Zone Lifecycle) - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 1.3: Vòng Đời Zone (Zone Lifecycle) - GEM Trading Academy</title>
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
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: ''Inter'', sans-serif; background: var(--bg-dark); color: var(--text-primary); line-height: 1.7; font-size: 16px; }
        .lesson-container { max-width: 800px; margin: 0 auto; }
        @media (min-width: 600px) { body { padding: 2rem; background: linear-gradient(135deg, #0A0E17 0%, #112250 100%); } .lesson-container { background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-color); overflow: hidden; } }
        .lesson-header { background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%); padding: 2rem 1rem; text-align: center; border-bottom: 3px solid var(--error-red); }
        .header-badge { display: inline-block; background: linear-gradient(135deg, var(--error-red) 0%, #DC2626 100%); color: white; padding: 0.5rem 1.25rem; border-radius: 25px; font-size: 0.85rem; font-weight: 700; margin-bottom: 1rem; }
        .lesson-header h1 { font-size: clamp(1.5rem, 5vw, 2rem); font-weight: 700; margin-bottom: 0.5rem; }
        .lesson-header p { color: var(--text-secondary); }
        .content-section { padding: 0; }
        @media (min-width: 600px) { .content-section { padding: 1.5rem; } }
        .content-card { background: var(--bg-card); padding: 1.5rem 1rem; margin-bottom: 1px; border-left: 4px solid var(--error-red); }
        @media (min-width: 600px) { .content-card { border-radius: 16px; padding: 2rem; margin-bottom: 1.5rem; border: 1px solid var(--border-color); border-left: 4px solid var(--error-red); } }
        .content-card h2 { font-size: 1.35rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--error-red); display: flex; align-items: center; gap: 0.75rem; }
        .content-card h3 { font-size: 1.1rem; font-weight: 600; margin: 1.5rem 0 1rem 0; color: var(--accent-cyan); }
        .content-card p { margin-bottom: 1rem; color: var(--text-secondary); line-height: 1.8; }
        .content-card ul { margin: 1rem 0; padding-left: 1.5rem; color: var(--text-secondary); }
        .content-card li { margin-bottom: 0.75rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 1.25rem; margin: 1.25rem 0; }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%); border-color: rgba(16, 185, 129, 0.3); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%); border-color: rgba(255, 189, 89, 0.3); }
        .highlight-box p { margin: 0; color: var(--text-primary); }
        .image-placeholder { background: linear-gradient(145deg, #1a2235 0%, #0d1321 100%); border: 2px dashed rgba(239, 68, 68, 0.4); border-radius: 12px; padding: 1rem; margin: 1.5rem 0; text-align: center; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; margin-bottom: 0.75rem; }
        .image-placeholder p { font-size: 0.85rem; color: var(--error-red); margin: 0; font-style: italic; }

        .lifecycle-grid { display: grid; grid-template-columns: 1fr; gap: 1px; background: var(--border-color); margin: 1.5rem 0; }
        @media (min-width: 600px) { .lifecycle-grid { gap: 1rem; background: transparent; } }

        .lifecycle-item { background: var(--bg-card-hover); padding: 1.25rem; position: relative; }
        @media (min-width: 600px) { .lifecycle-item { border-radius: 12px; border: 1px solid var(--border-color); } }

        .lifecycle-item.fresh { border-left: 4px solid var(--success-green); }
        .lifecycle-item.tested1 { border-left: 4px solid var(--accent-cyan); }
        .lifecycle-item.tested2 { border-left: 4px solid var(--primary-gold); }
        .lifecycle-item.weak { border-left: 4px solid var(--error-red); opacity: 0.7; }
        .lifecycle-item.broken { border-left: 4px solid #666; opacity: 0.5; }

        .lifecycle-item .stars { font-size: 1.25rem; margin-bottom: 0.5rem; }
        .lifecycle-item h4 { color: var(--text-primary); margin-bottom: 0.25rem; }
        .lifecycle-item .status { font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; }
        .lifecycle-item.fresh .status { color: var(--success-green); }
        .lifecycle-item.tested1 .status { color: var(--accent-cyan); }
        .lifecycle-item.tested2 .status { color: var(--primary-gold); }
        .lifecycle-item.weak .status { color: var(--error-red); }
        .lifecycle-item.broken .status { color: #666; }
        .lifecycle-item p { font-size: 0.9rem; color: var(--text-secondary); margin: 0; }

        .summary-box { background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%); border: 2px solid var(--error-red); padding: 1.5rem 1rem; margin: 0; }
        @media (min-width: 600px) { .summary-box { border-radius: 16px; padding: 2rem; margin: 1.5rem; } }
        .summary-box h3 { color: var(--error-red); font-size: 1.25rem; margin-bottom: 1rem; }
        .summary-box ul { list-style: none; padding: 0; }
        .summary-box li { padding: 0.5rem 0; padding-left: 1.75rem; position: relative; color: var(--text-primary); }
        .summary-box li::before { content: ''✓''; position: absolute; left: 0; color: var(--error-red); font-weight: 700; }

        .quiz-section { padding: 0; }
        @media (min-width: 600px) { .quiz-section { padding: 1.5rem; } }
        .quiz-container { background: var(--bg-card); padding: 1.5rem 1rem; border-left: 4px solid var(--accent-purple); }
        @media (min-width: 600px) { .quiz-container { border-radius: 16px; padding: 2rem; border: 1px solid var(--border-color); border-left: 4px solid var(--accent-purple); } }
        .quiz-container h2 { color: var(--accent-purple); font-size: 1.35rem; margin-bottom: 1.5rem; }
        .quiz-question { background: var(--bg-card-hover); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem; border: 1px solid var(--border-color); }
        .quiz-question p { font-weight: 600; margin-bottom: 1rem; color: var(--text-primary); }
        .quiz-option { display: block; width: 100%; padding: 0.875rem 1rem; margin-bottom: 0.5rem; background: var(--bg-card); border: 2px solid var(--border-color); border-radius: 8px; color: var(--text-primary); cursor: pointer; text-align: left; transition: all 0.3s; }
        .quiz-option:hover { border-color: var(--accent-purple); }
        .quiz-option.correct { background: rgba(16, 185, 129, 0.2); border-color: var(--success-green); color: var(--success-green); }
        .quiz-option.incorrect { background: rgba(239, 68, 68, 0.2); border-color: var(--error-red); color: var(--error-red); }
        .quiz-result { padding: 0.75rem; border-radius: 8px; margin-top: 0.75rem; font-weight: 600; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: var(--success-green); }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: var(--error-red); }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%); border-radius: 12px; margin-top: 1.5rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score h3 { color: var(--error-red); margin-bottom: 0.5rem; }
        .retake-btn { margin-top: 1rem; padding: 0.75rem 2rem; background: linear-gradient(135deg, var(--accent-purple) 0%, #5346E0 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; background: var(--bg-card); border-top: 1px solid var(--border-color); }
        .lesson-footer p { color: var(--text-secondary); font-size: 0.9rem; }
        .lesson-footer .brand { color: var(--primary-gold); font-weight: 700; }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <div class="header-badge">🥈 TIER 2 - Chapter 1</div>
            <h1>Vòng Đời Zone (Zone Lifecycle)</h1>
            <p>Theo dõi trạng thái zone để tối ưu hóa xác suất thắng</p>
        </header>

        <section class="content-section">
            <div class="content-card">
                <h2><span class="icon">🔄</span> Zone Có Vòng Đời</h2>
                <p>Không phải tất cả các zone đều như nhau. Mỗi zone có <strong>vòng đời</strong> (lifecycle) riêng, và chất lượng zone thay đổi theo thời gian và số lần được test.</p>
                <div class="highlight-box">
                    <p><strong>💡 Nguyên tắc:</strong> Zone chưa bao giờ được test (FRESH) có xác suất thành công cao nhất. Mỗi lần test, zone yếu đi.</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">⭐</span> 5 Trạng Thái Zone</h2>
                <div class="lifecycle-grid">
                    <div class="lifecycle-item fresh">
                        <div class="stars">⭐⭐⭐⭐⭐</div>
                        <h4>FRESH</h4>
                        <div class="status">0 lần test - TỐT NHẤT</div>
                        <p>Zone chưa bao giờ được test. Institutional orders vẫn còn nguyên. Xác suất thành công ~75-80%.</p>
                    </div>
                    <div class="lifecycle-item tested1">
                        <div class="stars">⭐⭐⭐⭐</div>
                        <h4>TESTED_1X</h4>
                        <div class="status">1 lần test - TỐT</div>
                        <p>Đã test 1 lần và rejected. Vẫn còn orders chưa khớp. Xác suất ~65-70%.</p>
                    </div>
                    <div class="lifecycle-item tested2">
                        <div class="stars">⭐⭐⭐</div>
                        <h4>TESTED_2X</h4>
                        <div class="status">2 lần test - ĐƯỢC</div>
                        <p>Đã test 2 lần. Zone đang yếu dần. Cần confluence khác để trade. Xác suất ~55-60%.</p>
                    </div>
                    <div class="lifecycle-item weak">
                        <div class="stars">❌</div>
                        <h4>TESTED_3X+</h4>
                        <div class="status">3+ lần test - BỎ QUA</div>
                        <p>Zone đã bị test quá nhiều. Institutional orders gần hết. Không nên trade.</p>
                    </div>
                    <div class="lifecycle-item broken">
                        <div class="stars">❌❌</div>
                        <h4>BROKEN</h4>
                        <div class="status">Bị phá vỡ - KHÔNG CÒN HIỆU LỰC</div>
                        <p>Giá đã close qua zone. Zone mất hoàn toàn hiệu lực.</p>
                    </div>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📊</span> Cách Theo Dõi Trạng Thái</h2>
                <h3>Bước 1: Đánh dấu zone khi được tạo</h3>
                <p>Khi phát hiện zone mới từ pattern DPD/UPD, đánh dấu là "FRESH" với đầy đủ 5 sao.</p>

                <h3>Bước 2: Update mỗi khi giá test</h3>
                <p>Mỗi lần giá chạm vào zone và bị reject, giảm 1 sao và update trạng thái.</p>

                <h3>Bước 3: Xóa zone khi BROKEN</h3>
                <p>Khi giá close candle TRÊN zone (với HFZ), zone bị phá vỡ. Xóa và không trade nữa.</p>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/EF4444?text=Zone+Status+Tracking" alt="Zone Status Tracking">
                    <p>📸 Cách đánh dấu và theo dõi trạng thái zone</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🎯</span> Quy Tắc Trade Theo Lifecycle</h2>
                <div class="highlight-box green">
                    <p><strong>✅ NÊN TRADE:</strong></p>
                    <ul style="margin-top: 0.5rem; padding-left: 1.25rem;">
                        <li>FRESH zones (5 sao) - Ưu tiên số 1</li>
                        <li>TESTED_1X (4 sao) - Vẫn tốt</li>
                        <li>TESTED_2X (3 sao) - Chỉ với confluence mạnh</li>
                    </ul>
                </div>
                <div class="highlight-box">
                    <p><strong>❌ KHÔNG NÊN TRADE:</strong></p>
                    <ul style="margin-top: 0.5rem; padding-left: 1.25rem;">
                        <li>TESTED_3X+ - Zone đã yếu</li>
                        <li>BROKEN - Zone không còn hiệu lực</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/0A0E17/10B981?text=Trade+Decision+Flow" alt="Trade Decision Flow">
                    <p>📸 Quy trình quyết định trade theo lifecycle</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">💡</span> Ví Dụ Thực Tế</h2>
                <p><strong>Tình huống:</strong> Zone HFZ được tạo từ pattern UPD trên BTC/USDT 4H.</p>
                <ul>
                    <li><strong>Ngày 1:</strong> Zone được tạo → FRESH ⭐⭐⭐⭐⭐</li>
                    <li><strong>Ngày 3:</strong> Giá test zone, tạo pin bar rejection → TESTED_1X ⭐⭐⭐⭐</li>
                    <li><strong>Ngày 5:</strong> Giá test lần 2, engulfing bearish → TESTED_2X ⭐⭐⭐</li>
                    <li><strong>Ngày 8:</strong> Giá test lần 3, yếu rejection → TESTED_3X ❌ (Không trade)</li>
                    <li><strong>Ngày 10:</strong> Giá break và close trên zone → BROKEN ❌❌ (Xóa zone)</li>
                </ul>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/FFBD59?text=Zone+Lifecycle+Example" alt="Zone Lifecycle Example">
                    <p>📸 Ví dụ vòng đời zone trên BTC/USDT</p>
                </div>
            </div>

            <div class="summary-box">
                <h3>📝 Tóm Tắt Bài Học</h3>
                <ul>
                    <li>Zone có 5 trạng thái: FRESH, TESTED_1X, TESTED_2X, TESTED_3X+, BROKEN</li>
                    <li>FRESH zone (chưa test) có xác suất thành công cao nhất</li>
                    <li>Mỗi lần test, zone yếu đi - giảm 1 sao</li>
                    <li>Chỉ trade zone từ 3 sao trở lên (TESTED_2X hoặc tốt hơn)</li>
                    <li>Zone bị BROKEN khi giá close qua - không còn hiệu lực</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-container">
                <h2>❓ Kiểm Tra Kiến Thức</h2>
                <div class="quiz-question" data-correct="0">
                    <p>1. Zone nào có xác suất thành công cao nhất?</p>
                    <button class="quiz-option" data-index="0">A. FRESH - chưa từng được test</button>
                    <button class="quiz-option" data-index="1">B. TESTED_2X - đã test 2 lần</button>
                    <button class="quiz-option" data-index="2">C. TESTED_3X - đã test 3 lần</button>
                    <button class="quiz-option" data-index="3">D. BROKEN - đã bị phá vỡ</button>
                    <div class="quiz-result"></div>
                </div>
                <div class="quiz-question" data-correct="2">
                    <p>2. Khi nào zone bị coi là BROKEN?</p>
                    <button class="quiz-option" data-index="0">A. Khi giá chạm zone lần đầu</button>
                    <button class="quiz-option" data-index="1">B. Khi giá test zone 3 lần</button>
                    <button class="quiz-option" data-index="2">C. Khi giá close candle qua zone</button>
                    <button class="quiz-option" data-index="3">D. Khi zone được tạo quá 7 ngày</button>
                    <div class="quiz-result"></div>
                </div>
                <div class="quiz-score">
                    <h3>🎉 Hoàn thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/2 câu hỏi</p>
                    <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>Bài học thuộc <span class="brand">GEM Trading Academy - TIER 2</span></p>
            <p>© 2024 - Nền tảng đào tạo trading chuyên nghiệp</p>
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
                        result.textContent = ''✗ Chưa đúng.'';
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
    <title>Bài 1.3: Vòng Đời Zone (Zone Lifecycle) - GEM Trading Academy</title>
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
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: ''Inter'', sans-serif; background: var(--bg-dark); color: var(--text-primary); line-height: 1.7; font-size: 16px; }
        .lesson-container { max-width: 800px; margin: 0 auto; }
        @media (min-width: 600px) { body { padding: 2rem; background: linear-gradient(135deg, #0A0E17 0%, #112250 100%); } .lesson-container { background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-color); overflow: hidden; } }
        .lesson-header { background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%); padding: 2rem 1rem; text-align: center; border-bottom: 3px solid var(--error-red); }
        .header-badge { display: inline-block; background: linear-gradient(135deg, var(--error-red) 0%, #DC2626 100%); color: white; padding: 0.5rem 1.25rem; border-radius: 25px; font-size: 0.85rem; font-weight: 700; margin-bottom: 1rem; }
        .lesson-header h1 { font-size: clamp(1.5rem, 5vw, 2rem); font-weight: 700; margin-bottom: 0.5rem; }
        .lesson-header p { color: var(--text-secondary); }
        .content-section { padding: 0; }
        @media (min-width: 600px) { .content-section { padding: 1.5rem; } }
        .content-card { background: var(--bg-card); padding: 1.5rem 1rem; margin-bottom: 1px; border-left: 4px solid var(--error-red); }
        @media (min-width: 600px) { .content-card { border-radius: 16px; padding: 2rem; margin-bottom: 1.5rem; border: 1px solid var(--border-color); border-left: 4px solid var(--error-red); } }
        .content-card h2 { font-size: 1.35rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--error-red); display: flex; align-items: center; gap: 0.75rem; }
        .content-card h3 { font-size: 1.1rem; font-weight: 600; margin: 1.5rem 0 1rem 0; color: var(--accent-cyan); }
        .content-card p { margin-bottom: 1rem; color: var(--text-secondary); line-height: 1.8; }
        .content-card ul { margin: 1rem 0; padding-left: 1.5rem; color: var(--text-secondary); }
        .content-card li { margin-bottom: 0.75rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 1.25rem; margin: 1.25rem 0; }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%); border-color: rgba(16, 185, 129, 0.3); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%); border-color: rgba(255, 189, 89, 0.3); }
        .highlight-box p { margin: 0; color: var(--text-primary); }
        .image-placeholder { background: linear-gradient(145deg, #1a2235 0%, #0d1321 100%); border: 2px dashed rgba(239, 68, 68, 0.4); border-radius: 12px; padding: 1rem; margin: 1.5rem 0; text-align: center; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; margin-bottom: 0.75rem; }
        .image-placeholder p { font-size: 0.85rem; color: var(--error-red); margin: 0; font-style: italic; }

        .lifecycle-grid { display: grid; grid-template-columns: 1fr; gap: 1px; background: var(--border-color); margin: 1.5rem 0; }
        @media (min-width: 600px) { .lifecycle-grid { gap: 1rem; background: transparent; } }

        .lifecycle-item { background: var(--bg-card-hover); padding: 1.25rem; position: relative; }
        @media (min-width: 600px) { .lifecycle-item { border-radius: 12px; border: 1px solid var(--border-color); } }

        .lifecycle-item.fresh { border-left: 4px solid var(--success-green); }
        .lifecycle-item.tested1 { border-left: 4px solid var(--accent-cyan); }
        .lifecycle-item.tested2 { border-left: 4px solid var(--primary-gold); }
        .lifecycle-item.weak { border-left: 4px solid var(--error-red); opacity: 0.7; }
        .lifecycle-item.broken { border-left: 4px solid #666; opacity: 0.5; }

        .lifecycle-item .stars { font-size: 1.25rem; margin-bottom: 0.5rem; }
        .lifecycle-item h4 { color: var(--text-primary); margin-bottom: 0.25rem; }
        .lifecycle-item .status { font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; }
        .lifecycle-item.fresh .status { color: var(--success-green); }
        .lifecycle-item.tested1 .status { color: var(--accent-cyan); }
        .lifecycle-item.tested2 .status { color: var(--primary-gold); }
        .lifecycle-item.weak .status { color: var(--error-red); }
        .lifecycle-item.broken .status { color: #666; }
        .lifecycle-item p { font-size: 0.9rem; color: var(--text-secondary); margin: 0; }

        .summary-box { background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%); border: 2px solid var(--error-red); padding: 1.5rem 1rem; margin: 0; }
        @media (min-width: 600px) { .summary-box { border-radius: 16px; padding: 2rem; margin: 1.5rem; } }
        .summary-box h3 { color: var(--error-red); font-size: 1.25rem; margin-bottom: 1rem; }
        .summary-box ul { list-style: none; padding: 0; }
        .summary-box li { padding: 0.5rem 0; padding-left: 1.75rem; position: relative; color: var(--text-primary); }
        .summary-box li::before { content: ''✓''; position: absolute; left: 0; color: var(--error-red); font-weight: 700; }

        .quiz-section { padding: 0; }
        @media (min-width: 600px) { .quiz-section { padding: 1.5rem; } }
        .quiz-container { background: var(--bg-card); padding: 1.5rem 1rem; border-left: 4px solid var(--accent-purple); }
        @media (min-width: 600px) { .quiz-container { border-radius: 16px; padding: 2rem; border: 1px solid var(--border-color); border-left: 4px solid var(--accent-purple); } }
        .quiz-container h2 { color: var(--accent-purple); font-size: 1.35rem; margin-bottom: 1.5rem; }
        .quiz-question { background: var(--bg-card-hover); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem; border: 1px solid var(--border-color); }
        .quiz-question p { font-weight: 600; margin-bottom: 1rem; color: var(--text-primary); }
        .quiz-option { display: block; width: 100%; padding: 0.875rem 1rem; margin-bottom: 0.5rem; background: var(--bg-card); border: 2px solid var(--border-color); border-radius: 8px; color: var(--text-primary); cursor: pointer; text-align: left; transition: all 0.3s; }
        .quiz-option:hover { border-color: var(--accent-purple); }
        .quiz-option.correct { background: rgba(16, 185, 129, 0.2); border-color: var(--success-green); color: var(--success-green); }
        .quiz-option.incorrect { background: rgba(239, 68, 68, 0.2); border-color: var(--error-red); color: var(--error-red); }
        .quiz-result { padding: 0.75rem; border-radius: 8px; margin-top: 0.75rem; font-weight: 600; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: var(--success-green); }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: var(--error-red); }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%); border-radius: 12px; margin-top: 1.5rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score h3 { color: var(--error-red); margin-bottom: 0.5rem; }
        .retake-btn { margin-top: 1rem; padding: 0.75rem 2rem; background: linear-gradient(135deg, var(--accent-purple) 0%, #5346E0 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; background: var(--bg-card); border-top: 1px solid var(--border-color); }
        .lesson-footer p { color: var(--text-secondary); font-size: 0.9rem; }
        .lesson-footer .brand { color: var(--primary-gold); font-weight: 700; }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <div class="header-badge">🥈 TIER 2 - Chapter 1</div>
            <h1>Vòng Đời Zone (Zone Lifecycle)</h1>
            <p>Theo dõi trạng thái zone để tối ưu hóa xác suất thắng</p>
        </header>

        <section class="content-section">
            <div class="content-card">
                <h2><span class="icon">🔄</span> Zone Có Vòng Đời</h2>
                <p>Không phải tất cả các zone đều như nhau. Mỗi zone có <strong>vòng đời</strong> (lifecycle) riêng, và chất lượng zone thay đổi theo thời gian và số lần được test.</p>
                <div class="highlight-box">
                    <p><strong>💡 Nguyên tắc:</strong> Zone chưa bao giờ được test (FRESH) có xác suất thành công cao nhất. Mỗi lần test, zone yếu đi.</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">⭐</span> 5 Trạng Thái Zone</h2>
                <div class="lifecycle-grid">
                    <div class="lifecycle-item fresh">
                        <div class="stars">⭐⭐⭐⭐⭐</div>
                        <h4>FRESH</h4>
                        <div class="status">0 lần test - TỐT NHẤT</div>
                        <p>Zone chưa bao giờ được test. Institutional orders vẫn còn nguyên. Xác suất thành công ~75-80%.</p>
                    </div>
                    <div class="lifecycle-item tested1">
                        <div class="stars">⭐⭐⭐⭐</div>
                        <h4>TESTED_1X</h4>
                        <div class="status">1 lần test - TỐT</div>
                        <p>Đã test 1 lần và rejected. Vẫn còn orders chưa khớp. Xác suất ~65-70%.</p>
                    </div>
                    <div class="lifecycle-item tested2">
                        <div class="stars">⭐⭐⭐</div>
                        <h4>TESTED_2X</h4>
                        <div class="status">2 lần test - ĐƯỢC</div>
                        <p>Đã test 2 lần. Zone đang yếu dần. Cần confluence khác để trade. Xác suất ~55-60%.</p>
                    </div>
                    <div class="lifecycle-item weak">
                        <div class="stars">❌</div>
                        <h4>TESTED_3X+</h4>
                        <div class="status">3+ lần test - BỎ QUA</div>
                        <p>Zone đã bị test quá nhiều. Institutional orders gần hết. Không nên trade.</p>
                    </div>
                    <div class="lifecycle-item broken">
                        <div class="stars">❌❌</div>
                        <h4>BROKEN</h4>
                        <div class="status">Bị phá vỡ - KHÔNG CÒN HIỆU LỰC</div>
                        <p>Giá đã close qua zone. Zone mất hoàn toàn hiệu lực.</p>
                    </div>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📊</span> Cách Theo Dõi Trạng Thái</h2>
                <h3>Bước 1: Đánh dấu zone khi được tạo</h3>
                <p>Khi phát hiện zone mới từ pattern DPD/UPD, đánh dấu là "FRESH" với đầy đủ 5 sao.</p>

                <h3>Bước 2: Update mỗi khi giá test</h3>
                <p>Mỗi lần giá chạm vào zone và bị reject, giảm 1 sao và update trạng thái.</p>

                <h3>Bước 3: Xóa zone khi BROKEN</h3>
                <p>Khi giá close candle TRÊN zone (với HFZ), zone bị phá vỡ. Xóa và không trade nữa.</p>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/EF4444?text=Zone+Status+Tracking" alt="Zone Status Tracking">
                    <p>📸 Cách đánh dấu và theo dõi trạng thái zone</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🎯</span> Quy Tắc Trade Theo Lifecycle</h2>
                <div class="highlight-box green">
                    <p><strong>✅ NÊN TRADE:</strong></p>
                    <ul style="margin-top: 0.5rem; padding-left: 1.25rem;">
                        <li>FRESH zones (5 sao) - Ưu tiên số 1</li>
                        <li>TESTED_1X (4 sao) - Vẫn tốt</li>
                        <li>TESTED_2X (3 sao) - Chỉ với confluence mạnh</li>
                    </ul>
                </div>
                <div class="highlight-box">
                    <p><strong>❌ KHÔNG NÊN TRADE:</strong></p>
                    <ul style="margin-top: 0.5rem; padding-left: 1.25rem;">
                        <li>TESTED_3X+ - Zone đã yếu</li>
                        <li>BROKEN - Zone không còn hiệu lực</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/0A0E17/10B981?text=Trade+Decision+Flow" alt="Trade Decision Flow">
                    <p>📸 Quy trình quyết định trade theo lifecycle</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">💡</span> Ví Dụ Thực Tế</h2>
                <p><strong>Tình huống:</strong> Zone HFZ được tạo từ pattern UPD trên BTC/USDT 4H.</p>
                <ul>
                    <li><strong>Ngày 1:</strong> Zone được tạo → FRESH ⭐⭐⭐⭐⭐</li>
                    <li><strong>Ngày 3:</strong> Giá test zone, tạo pin bar rejection → TESTED_1X ⭐⭐⭐⭐</li>
                    <li><strong>Ngày 5:</strong> Giá test lần 2, engulfing bearish → TESTED_2X ⭐⭐⭐</li>
                    <li><strong>Ngày 8:</strong> Giá test lần 3, yếu rejection → TESTED_3X ❌ (Không trade)</li>
                    <li><strong>Ngày 10:</strong> Giá break và close trên zone → BROKEN ❌❌ (Xóa zone)</li>
                </ul>

                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/FFBD59?text=Zone+Lifecycle+Example" alt="Zone Lifecycle Example">
                    <p>📸 Ví dụ vòng đời zone trên BTC/USDT</p>
                </div>
            </div>

            <div class="summary-box">
                <h3>📝 Tóm Tắt Bài Học</h3>
                <ul>
                    <li>Zone có 5 trạng thái: FRESH, TESTED_1X, TESTED_2X, TESTED_3X+, BROKEN</li>
                    <li>FRESH zone (chưa test) có xác suất thành công cao nhất</li>
                    <li>Mỗi lần test, zone yếu đi - giảm 1 sao</li>
                    <li>Chỉ trade zone từ 3 sao trở lên (TESTED_2X hoặc tốt hơn)</li>
                    <li>Zone bị BROKEN khi giá close qua - không còn hiệu lực</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-container">
                <h2>❓ Kiểm Tra Kiến Thức</h2>
                <div class="quiz-question" data-correct="0">
                    <p>1. Zone nào có xác suất thành công cao nhất?</p>
                    <button class="quiz-option" data-index="0">A. FRESH - chưa từng được test</button>
                    <button class="quiz-option" data-index="1">B. TESTED_2X - đã test 2 lần</button>
                    <button class="quiz-option" data-index="2">C. TESTED_3X - đã test 3 lần</button>
                    <button class="quiz-option" data-index="3">D. BROKEN - đã bị phá vỡ</button>
                    <div class="quiz-result"></div>
                </div>
                <div class="quiz-question" data-correct="2">
                    <p>2. Khi nào zone bị coi là BROKEN?</p>
                    <button class="quiz-option" data-index="0">A. Khi giá chạm zone lần đầu</button>
                    <button class="quiz-option" data-index="1">B. Khi giá test zone 3 lần</button>
                    <button class="quiz-option" data-index="2">C. Khi giá close candle qua zone</button>
                    <button class="quiz-option" data-index="3">D. Khi zone được tạo quá 7 ngày</button>
                    <div class="quiz-result"></div>
                </div>
                <div class="quiz-score">
                    <h3>🎉 Hoàn thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/2 câu hỏi</p>
                    <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>Bài học thuộc <span class="brand">GEM Trading Academy - TIER 2</span></p>
            <p>© 2024 - Nền tảng đào tạo trading chuyên nghiệp</p>
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
                        result.textContent = ''✗ Chưa đúng.'';
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

-- Lesson 1.4: Chiến Lược Entry Tại HFZ - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch1-l4',
  'module-tier-2-ch1',
  'course-tier2-trading-advanced',
  'Bài 1.4: Chiến Lược Entry Tại HFZ - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 1.4: Chiến Lược Entry Tại HFZ - GEM Trading Academy</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root { --primary-navy: #112250; --primary-gold: #FFBD59; --accent-cyan: #00F0FF; --accent-purple: #6A5BFF; --success-green: #10B981; --error-red: #EF4444; --bg-dark: #0A0E17; --bg-card: #1A1F2E; --bg-card-hover: #252B3D; --text-primary: #FFFFFF; --text-secondary: #A0A9C0; --border-color: rgba(255, 189, 89, 0.2); }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: ''Inter'', sans-serif; background: var(--bg-dark); color: var(--text-primary); line-height: 1.7; font-size: 16px; }
        .lesson-container { max-width: 800px; margin: 0 auto; }
        @media (min-width: 600px) { body { padding: 2rem; background: linear-gradient(135deg, #0A0E17 0%, #112250 100%); } .lesson-container { background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-color); overflow: hidden; } }
        .lesson-header { background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%); padding: 2rem 1rem; text-align: center; border-bottom: 3px solid var(--error-red); }
        .header-badge { display: inline-block; background: linear-gradient(135deg, var(--error-red) 0%, #DC2626 100%); color: white; padding: 0.5rem 1.25rem; border-radius: 25px; font-size: 0.85rem; font-weight: 700; margin-bottom: 1rem; }
        .lesson-header h1 { font-size: clamp(1.5rem, 5vw, 2rem); font-weight: 700; margin-bottom: 0.5rem; }
        .lesson-header p { color: var(--text-secondary); }
        .content-section { padding: 0; }
        @media (min-width: 600px) { .content-section { padding: 1.5rem; } }
        .content-card { background: var(--bg-card); padding: 1.5rem 1rem; margin-bottom: 1px; border-left: 4px solid var(--error-red); }
        @media (min-width: 600px) { .content-card { border-radius: 16px; padding: 2rem; margin-bottom: 1.5rem; border: 1px solid var(--border-color); border-left: 4px solid var(--error-red); } }
        .content-card h2 { font-size: 1.35rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--error-red); display: flex; align-items: center; gap: 0.75rem; }
        .content-card h3 { font-size: 1.1rem; font-weight: 600; margin: 1.5rem 0 1rem 0; color: var(--accent-cyan); }
        .content-card p { margin-bottom: 1rem; color: var(--text-secondary); line-height: 1.8; }
        .content-card ul, .content-card ol { margin: 1rem 0; padding-left: 1.5rem; color: var(--text-secondary); }
        .content-card li { margin-bottom: 0.75rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 1.25rem; margin: 1.25rem 0; }
        .highlight-box.cyan { background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(0, 240, 255, 0.05) 100%); border-color: rgba(0, 240, 255, 0.3); }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%); border-color: rgba(16, 185, 129, 0.3); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%); border-color: rgba(255, 189, 89, 0.3); }
        .highlight-box p { margin: 0; color: var(--text-primary); }
        .image-placeholder { background: linear-gradient(145deg, #1a2235 0%, #0d1321 100%); border: 2px dashed rgba(239, 68, 68, 0.4); border-radius: 12px; padding: 1rem; margin: 1.5rem 0; text-align: center; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; margin-bottom: 0.75rem; }
        .image-placeholder p { font-size: 0.85rem; color: var(--error-red); margin: 0; font-style: italic; }
        .candle-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1.5rem 0; }
        @media (max-width: 600px) { .candle-grid { grid-template-columns: 1fr; gap: 1px; background: var(--border-color); } }
        .candle-card { background: var(--bg-card-hover); padding: 1.25rem; text-align: center; }
        @media (min-width: 600px) { .candle-card { border-radius: 12px; border: 1px solid var(--border-color); } }
        .candle-card .emoji { font-size: 2rem; margin-bottom: 0.5rem; }
        .candle-card h4 { color: var(--error-red); margin-bottom: 0.25rem; }
        .candle-card p { font-size: 0.85rem; color: var(--text-secondary); margin: 0; }
        .step-flow { background: var(--bg-card-hover); border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; }
        .step-item { display: flex; align-items: flex-start; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid var(--border-color); }
        .step-item:last-child { border-bottom: none; }
        .step-num { width: 2rem; height: 2rem; background: var(--error-red); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
        .step-content h4 { color: var(--text-primary); margin-bottom: 0.25rem; }
        .step-content p { color: var(--text-secondary); font-size: 0.9rem; margin: 0; }
        .summary-box { background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%); border: 2px solid var(--error-red); padding: 1.5rem 1rem; margin: 0; }
        @media (min-width: 600px) { .summary-box { border-radius: 16px; padding: 2rem; margin: 1.5rem; } }
        .summary-box h3 { color: var(--error-red); font-size: 1.25rem; margin-bottom: 1rem; }
        .summary-box ul { list-style: none; padding: 0; }
        .summary-box li { padding: 0.5rem 0; padding-left: 1.75rem; position: relative; color: var(--text-primary); }
        .summary-box li::before { content: ''✓''; position: absolute; left: 0; color: var(--error-red); font-weight: 700; }
        .quiz-section { padding: 0; }
        @media (min-width: 600px) { .quiz-section { padding: 1.5rem; } }
        .quiz-container { background: var(--bg-card); padding: 1.5rem 1rem; border-left: 4px solid var(--accent-purple); }
        @media (min-width: 600px) { .quiz-container { border-radius: 16px; padding: 2rem; border: 1px solid var(--border-color); border-left: 4px solid var(--accent-purple); } }
        .quiz-container h2 { color: var(--accent-purple); font-size: 1.35rem; margin-bottom: 1.5rem; }
        .quiz-question { background: var(--bg-card-hover); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem; border: 1px solid var(--border-color); }
        .quiz-question p { font-weight: 600; margin-bottom: 1rem; color: var(--text-primary); }
        .quiz-option { display: block; width: 100%; padding: 0.875rem 1rem; margin-bottom: 0.5rem; background: var(--bg-card); border: 2px solid var(--border-color); border-radius: 8px; color: var(--text-primary); cursor: pointer; text-align: left; transition: all 0.3s; }
        .quiz-option:hover { border-color: var(--accent-purple); }
        .quiz-option.correct { background: rgba(16, 185, 129, 0.2); border-color: var(--success-green); color: var(--success-green); }
        .quiz-option.incorrect { background: rgba(239, 68, 68, 0.2); border-color: var(--error-red); color: var(--error-red); }
        .quiz-result { padding: 0.75rem; border-radius: 8px; margin-top: 0.75rem; font-weight: 600; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: var(--success-green); }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: var(--error-red); }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%); border-radius: 12px; margin-top: 1.5rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score h3 { color: var(--error-red); margin-bottom: 0.5rem; }
        .retake-btn { margin-top: 1rem; padding: 0.75rem 2rem; background: linear-gradient(135deg, var(--accent-purple) 0%, #5346E0 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; background: var(--bg-card); border-top: 1px solid var(--border-color); }
        .lesson-footer p { color: var(--text-secondary); font-size: 0.9rem; }
        .lesson-footer .brand { color: var(--primary-gold); font-weight: 700; }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <div class="header-badge">🥈 TIER 2 - Chapter 1</div>
            <h1>Chiến Lược Entry Tại HFZ</h1>
            <p>Cách vào lệnh SHORT khi giá test vùng HFZ</p>
        </header>

        <section class="content-section">
            <div class="content-card">
                <h2><span class="icon">🎯</span> Quy Trình Entry 5 Bước</h2>
                <div class="step-flow">
                    <div class="step-item">
                        <div class="step-num">1</div>
                        <div class="step-content">
                            <h4>Xác định HFZ zone</h4>
                            <p>Tìm zone từ pattern DPD/UPD, đánh dấu Entry và Stop Loss</p>
                        </div>
                    </div>
                    <div class="step-item">
                        <div class="step-num">2</div>
                        <div class="step-content">
                            <h4>Đợi giá chạm zone</h4>
                            <p>Kiên nhẫn chờ giá di chuyển lên và chạm vào vùng HFZ</p>
                        </div>
                    </div>
                    <div class="step-item">
                        <div class="step-num">3</div>
                        <div class="step-content">
                            <h4>Tìm nến xác nhận rejection</h4>
                            <p>Chờ Pin bar, Engulfing, hoặc Star pattern xuất hiện</p>
                        </div>
                    </div>
                    <div class="step-item">
                        <div class="step-num">4</div>
                        <div class="step-content">
                            <h4>Entry SHORT</h4>
                            <p>Vào lệnh SHORT sau khi nến xác nhận close</p>
                        </div>
                    </div>
                    <div class="step-item">
                        <div class="step-num">5</div>
                        <div class="step-content">
                            <h4>Đặt Stop Loss và Take Profit</h4>
                            <p>SL trên đỉnh zone (+0.5% buffer), TP tại R:R 1:2 trở lên</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🕯️</span> Các Loại Nến Xác Nhận</h2>
                <p>Đây là 3 loại nến rejection phổ biến nhất tại HFZ:</p>
                <div class="candle-grid">
                    <div class="candle-card">
                        <div class="emoji">📍</div>
                        <h4>Pin Bar (Bearish)</h4>
                        <p>Bấc dài phía trên, thân nhỏ phía dưới. Tín hiệu rejection mạnh.</p>
                    </div>
                    <div class="candle-card">
                        <div class="emoji">🔻</div>
                        <h4>Bearish Engulfing</h4>
                        <p>Nến đỏ lớn bao trùm nến xanh trước đó. Tín hiệu đảo chiều.</p>
                    </div>
                    <div class="candle-card">
                        <div class="emoji">⭐</div>
                        <h4>Evening Star</h4>
                        <p>3 nến: xanh + doji + đỏ. Pattern đảo chiều cổ điển.</p>
                    </div>
                </div>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/112250/EF4444?text=Rejection+Candles" alt="Rejection Candles">
                    <p>📸 3 loại nến xác nhận rejection tại HFZ</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">⚠️</span> Nguyên Tắc Vàng</h2>
                <div class="highlight-box">
                    <p><strong>❌ KHÔNG BAO GIỜ:</strong> Entry SHORT ngay khi giá chạm zone mà không có nến xác nhận!</p>
                </div>
                <div class="highlight-box green">
                    <p><strong>✅ LUÔN LUÔN:</strong> Chờ nến xác nhận close hoàn toàn trước khi entry. Kiên nhẫn là chìa khóa!</p>
                </div>
                <h3>Quản lý rủi ro:</h3>
                <ul>
                    <li><strong>Stop Loss:</strong> Đặt trên đỉnh HFZ + 0.5% buffer</li>
                    <li><strong>Position Size:</strong> Rủi ro tối đa 1-2% tài khoản/lệnh</li>
                    <li><strong>Take Profit:</strong> Tối thiểu R:R 1:2, lý tưởng 1:3</li>
                </ul>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/0A0E17/10B981?text=SL+TP+Placement" alt="SL TP Placement">
                    <p>📸 Vị trí đặt Stop Loss và Take Profit</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📊</span> Ví Dụ Entry Thực Tế</h2>
                <p><strong>Setup:</strong> ETH/USDT 4H - HFZ từ pattern UPD</p>
                <ol>
                    <li>HFZ zone: $2,450 - $2,500 (Entry $2,450, SL $2,510)</li>
                    <li>Giá pump lên và chạm $2,460</li>
                    <li>Xuất hiện Bearish Engulfing tại zone</li>
                    <li>Entry SHORT tại $2,455 (sau khi nến close)</li>
                    <li>SL: $2,510 (+0.5% buffer = $2,522)</li>
                    <li>TP: $2,320 (R:R 1:2)</li>
                </ol>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x450/112250/FFBD59?text=Real+Trade+Example" alt="Real Trade Example">
                    <p>📸 Ví dụ trade thực tế với đầy đủ Entry, SL, TP</p>
                </div>
            </div>

            <div class="summary-box">
                <h3>📝 Tóm Tắt Bài Học</h3>
                <ul>
                    <li>5 bước entry: Xác định zone → Chờ chạm → Tìm xác nhận → Entry → Đặt SL/TP</li>
                    <li>3 nến xác nhận chính: Pin Bar, Bearish Engulfing, Evening Star</li>
                    <li>KHÔNG entry khi chưa có nến xác nhận</li>
                    <li>SL đặt trên đỉnh zone + 0.5% buffer</li>
                    <li>Tối thiểu R:R 1:2 để trade có giá trị</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-container">
                <h2>❓ Kiểm Tra Kiến Thức</h2>
                <div class="quiz-question" data-correct="1">
                    <p>1. Khi nào nên entry SHORT tại HFZ?</p>
                    <button class="quiz-option" data-index="0">A. Ngay khi giá chạm zone</button>
                    <button class="quiz-option" data-index="1">B. Sau khi có nến xác nhận rejection close</button>
                    <button class="quiz-option" data-index="2">C. Trước khi giá chạm zone</button>
                    <button class="quiz-option" data-index="3">D. Bất cứ lúc nào</button>
                    <div class="quiz-result"></div>
                </div>
                <div class="quiz-question" data-correct="2">
                    <p>2. Stop Loss nên đặt ở đâu với HFZ?</p>
                    <button class="quiz-option" data-index="0">A. Dưới zone</button>
                    <button class="quiz-option" data-index="1">B. Giữa zone</button>
                    <button class="quiz-option" data-index="2">C. Trên đỉnh zone + buffer</button>
                    <button class="quiz-option" data-index="3">D. Không cần đặt SL</button>
                    <div class="quiz-result"></div>
                </div>
                <div class="quiz-question" data-correct="0">
                    <p>3. Nến nào là tín hiệu rejection mạnh tại HFZ?</p>
                    <button class="quiz-option" data-index="0">A. Bearish Pin Bar với bấc dài phía trên</button>
                    <button class="quiz-option" data-index="1">B. Nến xanh lớn</button>
                    <button class="quiz-option" data-index="2">C. Doji ở giữa trend</button>
                    <button class="quiz-option" data-index="3">D. Morning Star</button>
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
            <p>Bài học thuộc <span class="brand">GEM Trading Academy - TIER 2</span></p>
            <p>© 2024 - Nền tảng đào tạo trading chuyên nghiệp</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 3;
        let answeredCount = 0, correctCount = 0;
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
                        result.textContent = ''✗ Chưa đúng.'';
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
    <title>Bài 1.4: Chiến Lược Entry Tại HFZ - GEM Trading Academy</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root { --primary-navy: #112250; --primary-gold: #FFBD59; --accent-cyan: #00F0FF; --accent-purple: #6A5BFF; --success-green: #10B981; --error-red: #EF4444; --bg-dark: #0A0E17; --bg-card: #1A1F2E; --bg-card-hover: #252B3D; --text-primary: #FFFFFF; --text-secondary: #A0A9C0; --border-color: rgba(255, 189, 89, 0.2); }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: ''Inter'', sans-serif; background: var(--bg-dark); color: var(--text-primary); line-height: 1.7; font-size: 16px; }
        .lesson-container { max-width: 800px; margin: 0 auto; }
        @media (min-width: 600px) { body { padding: 2rem; background: linear-gradient(135deg, #0A0E17 0%, #112250 100%); } .lesson-container { background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-color); overflow: hidden; } }
        .lesson-header { background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%); padding: 2rem 1rem; text-align: center; border-bottom: 3px solid var(--error-red); }
        .header-badge { display: inline-block; background: linear-gradient(135deg, var(--error-red) 0%, #DC2626 100%); color: white; padding: 0.5rem 1.25rem; border-radius: 25px; font-size: 0.85rem; font-weight: 700; margin-bottom: 1rem; }
        .lesson-header h1 { font-size: clamp(1.5rem, 5vw, 2rem); font-weight: 700; margin-bottom: 0.5rem; }
        .lesson-header p { color: var(--text-secondary); }
        .content-section { padding: 0; }
        @media (min-width: 600px) { .content-section { padding: 1.5rem; } }
        .content-card { background: var(--bg-card); padding: 1.5rem 1rem; margin-bottom: 1px; border-left: 4px solid var(--error-red); }
        @media (min-width: 600px) { .content-card { border-radius: 16px; padding: 2rem; margin-bottom: 1.5rem; border: 1px solid var(--border-color); border-left: 4px solid var(--error-red); } }
        .content-card h2 { font-size: 1.35rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--error-red); display: flex; align-items: center; gap: 0.75rem; }
        .content-card h3 { font-size: 1.1rem; font-weight: 600; margin: 1.5rem 0 1rem 0; color: var(--accent-cyan); }
        .content-card p { margin-bottom: 1rem; color: var(--text-secondary); line-height: 1.8; }
        .content-card ul, .content-card ol { margin: 1rem 0; padding-left: 1.5rem; color: var(--text-secondary); }
        .content-card li { margin-bottom: 0.75rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 1.25rem; margin: 1.25rem 0; }
        .highlight-box.cyan { background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(0, 240, 255, 0.05) 100%); border-color: rgba(0, 240, 255, 0.3); }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%); border-color: rgba(16, 185, 129, 0.3); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%); border-color: rgba(255, 189, 89, 0.3); }
        .highlight-box p { margin: 0; color: var(--text-primary); }
        .image-placeholder { background: linear-gradient(145deg, #1a2235 0%, #0d1321 100%); border: 2px dashed rgba(239, 68, 68, 0.4); border-radius: 12px; padding: 1rem; margin: 1.5rem 0; text-align: center; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; margin-bottom: 0.75rem; }
        .image-placeholder p { font-size: 0.85rem; color: var(--error-red); margin: 0; font-style: italic; }
        .candle-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1.5rem 0; }
        @media (max-width: 600px) { .candle-grid { grid-template-columns: 1fr; gap: 1px; background: var(--border-color); } }
        .candle-card { background: var(--bg-card-hover); padding: 1.25rem; text-align: center; }
        @media (min-width: 600px) { .candle-card { border-radius: 12px; border: 1px solid var(--border-color); } }
        .candle-card .emoji { font-size: 2rem; margin-bottom: 0.5rem; }
        .candle-card h4 { color: var(--error-red); margin-bottom: 0.25rem; }
        .candle-card p { font-size: 0.85rem; color: var(--text-secondary); margin: 0; }
        .step-flow { background: var(--bg-card-hover); border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; }
        .step-item { display: flex; align-items: flex-start; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid var(--border-color); }
        .step-item:last-child { border-bottom: none; }
        .step-num { width: 2rem; height: 2rem; background: var(--error-red); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
        .step-content h4 { color: var(--text-primary); margin-bottom: 0.25rem; }
        .step-content p { color: var(--text-secondary); font-size: 0.9rem; margin: 0; }
        .summary-box { background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%); border: 2px solid var(--error-red); padding: 1.5rem 1rem; margin: 0; }
        @media (min-width: 600px) { .summary-box { border-radius: 16px; padding: 2rem; margin: 1.5rem; } }
        .summary-box h3 { color: var(--error-red); font-size: 1.25rem; margin-bottom: 1rem; }
        .summary-box ul { list-style: none; padding: 0; }
        .summary-box li { padding: 0.5rem 0; padding-left: 1.75rem; position: relative; color: var(--text-primary); }
        .summary-box li::before { content: ''✓''; position: absolute; left: 0; color: var(--error-red); font-weight: 700; }
        .quiz-section { padding: 0; }
        @media (min-width: 600px) { .quiz-section { padding: 1.5rem; } }
        .quiz-container { background: var(--bg-card); padding: 1.5rem 1rem; border-left: 4px solid var(--accent-purple); }
        @media (min-width: 600px) { .quiz-container { border-radius: 16px; padding: 2rem; border: 1px solid var(--border-color); border-left: 4px solid var(--accent-purple); } }
        .quiz-container h2 { color: var(--accent-purple); font-size: 1.35rem; margin-bottom: 1.5rem; }
        .quiz-question { background: var(--bg-card-hover); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem; border: 1px solid var(--border-color); }
        .quiz-question p { font-weight: 600; margin-bottom: 1rem; color: var(--text-primary); }
        .quiz-option { display: block; width: 100%; padding: 0.875rem 1rem; margin-bottom: 0.5rem; background: var(--bg-card); border: 2px solid var(--border-color); border-radius: 8px; color: var(--text-primary); cursor: pointer; text-align: left; transition: all 0.3s; }
        .quiz-option:hover { border-color: var(--accent-purple); }
        .quiz-option.correct { background: rgba(16, 185, 129, 0.2); border-color: var(--success-green); color: var(--success-green); }
        .quiz-option.incorrect { background: rgba(239, 68, 68, 0.2); border-color: var(--error-red); color: var(--error-red); }
        .quiz-result { padding: 0.75rem; border-radius: 8px; margin-top: 0.75rem; font-weight: 600; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: var(--success-green); }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: var(--error-red); }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%); border-radius: 12px; margin-top: 1.5rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score h3 { color: var(--error-red); margin-bottom: 0.5rem; }
        .retake-btn { margin-top: 1rem; padding: 0.75rem 2rem; background: linear-gradient(135deg, var(--accent-purple) 0%, #5346E0 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; background: var(--bg-card); border-top: 1px solid var(--border-color); }
        .lesson-footer p { color: var(--text-secondary); font-size: 0.9rem; }
        .lesson-footer .brand { color: var(--primary-gold); font-weight: 700; }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <div class="header-badge">🥈 TIER 2 - Chapter 1</div>
            <h1>Chiến Lược Entry Tại HFZ</h1>
            <p>Cách vào lệnh SHORT khi giá test vùng HFZ</p>
        </header>

        <section class="content-section">
            <div class="content-card">
                <h2><span class="icon">🎯</span> Quy Trình Entry 5 Bước</h2>
                <div class="step-flow">
                    <div class="step-item">
                        <div class="step-num">1</div>
                        <div class="step-content">
                            <h4>Xác định HFZ zone</h4>
                            <p>Tìm zone từ pattern DPD/UPD, đánh dấu Entry và Stop Loss</p>
                        </div>
                    </div>
                    <div class="step-item">
                        <div class="step-num">2</div>
                        <div class="step-content">
                            <h4>Đợi giá chạm zone</h4>
                            <p>Kiên nhẫn chờ giá di chuyển lên và chạm vào vùng HFZ</p>
                        </div>
                    </div>
                    <div class="step-item">
                        <div class="step-num">3</div>
                        <div class="step-content">
                            <h4>Tìm nến xác nhận rejection</h4>
                            <p>Chờ Pin bar, Engulfing, hoặc Star pattern xuất hiện</p>
                        </div>
                    </div>
                    <div class="step-item">
                        <div class="step-num">4</div>
                        <div class="step-content">
                            <h4>Entry SHORT</h4>
                            <p>Vào lệnh SHORT sau khi nến xác nhận close</p>
                        </div>
                    </div>
                    <div class="step-item">
                        <div class="step-num">5</div>
                        <div class="step-content">
                            <h4>Đặt Stop Loss và Take Profit</h4>
                            <p>SL trên đỉnh zone (+0.5% buffer), TP tại R:R 1:2 trở lên</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🕯️</span> Các Loại Nến Xác Nhận</h2>
                <p>Đây là 3 loại nến rejection phổ biến nhất tại HFZ:</p>
                <div class="candle-grid">
                    <div class="candle-card">
                        <div class="emoji">📍</div>
                        <h4>Pin Bar (Bearish)</h4>
                        <p>Bấc dài phía trên, thân nhỏ phía dưới. Tín hiệu rejection mạnh.</p>
                    </div>
                    <div class="candle-card">
                        <div class="emoji">🔻</div>
                        <h4>Bearish Engulfing</h4>
                        <p>Nến đỏ lớn bao trùm nến xanh trước đó. Tín hiệu đảo chiều.</p>
                    </div>
                    <div class="candle-card">
                        <div class="emoji">⭐</div>
                        <h4>Evening Star</h4>
                        <p>3 nến: xanh + doji + đỏ. Pattern đảo chiều cổ điển.</p>
                    </div>
                </div>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x350/112250/EF4444?text=Rejection+Candles" alt="Rejection Candles">
                    <p>📸 3 loại nến xác nhận rejection tại HFZ</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">⚠️</span> Nguyên Tắc Vàng</h2>
                <div class="highlight-box">
                    <p><strong>❌ KHÔNG BAO GIỜ:</strong> Entry SHORT ngay khi giá chạm zone mà không có nến xác nhận!</p>
                </div>
                <div class="highlight-box green">
                    <p><strong>✅ LUÔN LUÔN:</strong> Chờ nến xác nhận close hoàn toàn trước khi entry. Kiên nhẫn là chìa khóa!</p>
                </div>
                <h3>Quản lý rủi ro:</h3>
                <ul>
                    <li><strong>Stop Loss:</strong> Đặt trên đỉnh HFZ + 0.5% buffer</li>
                    <li><strong>Position Size:</strong> Rủi ro tối đa 1-2% tài khoản/lệnh</li>
                    <li><strong>Take Profit:</strong> Tối thiểu R:R 1:2, lý tưởng 1:3</li>
                </ul>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/0A0E17/10B981?text=SL+TP+Placement" alt="SL TP Placement">
                    <p>📸 Vị trí đặt Stop Loss và Take Profit</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📊</span> Ví Dụ Entry Thực Tế</h2>
                <p><strong>Setup:</strong> ETH/USDT 4H - HFZ từ pattern UPD</p>
                <ol>
                    <li>HFZ zone: $2,450 - $2,500 (Entry $2,450, SL $2,510)</li>
                    <li>Giá pump lên và chạm $2,460</li>
                    <li>Xuất hiện Bearish Engulfing tại zone</li>
                    <li>Entry SHORT tại $2,455 (sau khi nến close)</li>
                    <li>SL: $2,510 (+0.5% buffer = $2,522)</li>
                    <li>TP: $2,320 (R:R 1:2)</li>
                </ol>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x450/112250/FFBD59?text=Real+Trade+Example" alt="Real Trade Example">
                    <p>📸 Ví dụ trade thực tế với đầy đủ Entry, SL, TP</p>
                </div>
            </div>

            <div class="summary-box">
                <h3>📝 Tóm Tắt Bài Học</h3>
                <ul>
                    <li>5 bước entry: Xác định zone → Chờ chạm → Tìm xác nhận → Entry → Đặt SL/TP</li>
                    <li>3 nến xác nhận chính: Pin Bar, Bearish Engulfing, Evening Star</li>
                    <li>KHÔNG entry khi chưa có nến xác nhận</li>
                    <li>SL đặt trên đỉnh zone + 0.5% buffer</li>
                    <li>Tối thiểu R:R 1:2 để trade có giá trị</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-container">
                <h2>❓ Kiểm Tra Kiến Thức</h2>
                <div class="quiz-question" data-correct="1">
                    <p>1. Khi nào nên entry SHORT tại HFZ?</p>
                    <button class="quiz-option" data-index="0">A. Ngay khi giá chạm zone</button>
                    <button class="quiz-option" data-index="1">B. Sau khi có nến xác nhận rejection close</button>
                    <button class="quiz-option" data-index="2">C. Trước khi giá chạm zone</button>
                    <button class="quiz-option" data-index="3">D. Bất cứ lúc nào</button>
                    <div class="quiz-result"></div>
                </div>
                <div class="quiz-question" data-correct="2">
                    <p>2. Stop Loss nên đặt ở đâu với HFZ?</p>
                    <button class="quiz-option" data-index="0">A. Dưới zone</button>
                    <button class="quiz-option" data-index="1">B. Giữa zone</button>
                    <button class="quiz-option" data-index="2">C. Trên đỉnh zone + buffer</button>
                    <button class="quiz-option" data-index="3">D. Không cần đặt SL</button>
                    <div class="quiz-result"></div>
                </div>
                <div class="quiz-question" data-correct="0">
                    <p>3. Nến nào là tín hiệu rejection mạnh tại HFZ?</p>
                    <button class="quiz-option" data-index="0">A. Bearish Pin Bar với bấc dài phía trên</button>
                    <button class="quiz-option" data-index="1">B. Nến xanh lớn</button>
                    <button class="quiz-option" data-index="2">C. Doji ở giữa trend</button>
                    <button class="quiz-option" data-index="3">D. Morning Star</button>
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
            <p>Bài học thuộc <span class="brand">GEM Trading Academy - TIER 2</span></p>
            <p>© 2024 - Nền tảng đào tạo trading chuyên nghiệp</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 3;
        let answeredCount = 0, correctCount = 0;
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
                        result.textContent = ''✗ Chưa đúng.'';
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

-- Lesson 1.5: Kết Hợp HFZ Với Đa Khung Thời Gian - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch1-l5',
  'module-tier-2-ch1',
  'course-tier2-trading-advanced',
  'Bài 1.5: Kết Hợp HFZ Với Đa Khung Thời Gian - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 1.5: Kết Hợp HFZ Với Đa Khung Thời Gian - GEM Trading Academy</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root { --primary-navy: #112250; --primary-gold: #FFBD59; --accent-cyan: #00F0FF; --accent-purple: #6A5BFF; --success-green: #10B981; --error-red: #EF4444; --bg-dark: #0A0E17; --bg-card: #1A1F2E; --bg-card-hover: #252B3D; --text-primary: #FFFFFF; --text-secondary: #A0A9C0; --border-color: rgba(255, 189, 89, 0.2); }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: ''Inter'', sans-serif; background: var(--bg-dark); color: var(--text-primary); line-height: 1.7; font-size: 16px; }
        .lesson-container { max-width: 800px; margin: 0 auto; }
        @media (min-width: 600px) { body { padding: 2rem; background: linear-gradient(135deg, #0A0E17 0%, #112250 100%); } .lesson-container { background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-color); overflow: hidden; } }
        .lesson-header { background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%); padding: 2rem 1rem; text-align: center; border-bottom: 3px solid var(--error-red); }
        .header-badge { display: inline-block; background: linear-gradient(135deg, var(--error-red) 0%, #DC2626 100%); color: white; padding: 0.5rem 1.25rem; border-radius: 25px; font-size: 0.85rem; font-weight: 700; margin-bottom: 1rem; }
        .lesson-header h1 { font-size: clamp(1.5rem, 5vw, 2rem); font-weight: 700; margin-bottom: 0.5rem; }
        .lesson-header p { color: var(--text-secondary); }
        .content-section { padding: 0; }
        @media (min-width: 600px) { .content-section { padding: 1.5rem; } }
        .content-card { background: var(--bg-card); padding: 1.5rem 1rem; margin-bottom: 1px; border-left: 4px solid var(--error-red); }
        @media (min-width: 600px) { .content-card { border-radius: 16px; padding: 2rem; margin-bottom: 1.5rem; border: 1px solid var(--border-color); border-left: 4px solid var(--error-red); } }
        .content-card h2 { font-size: 1.35rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--error-red); display: flex; align-items: center; gap: 0.75rem; }
        .content-card h3 { font-size: 1.1rem; font-weight: 600; margin: 1.5rem 0 1rem 0; color: var(--accent-cyan); }
        .content-card p { margin-bottom: 1rem; color: var(--text-secondary); line-height: 1.8; }
        .content-card ul, .content-card ol { margin: 1rem 0; padding-left: 1.5rem; color: var(--text-secondary); }
        .content-card li { margin-bottom: 0.75rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 1.25rem; margin: 1.25rem 0; }
        .highlight-box.cyan { background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(0, 240, 255, 0.05) 100%); border-color: rgba(0, 240, 255, 0.3); }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%); border-color: rgba(16, 185, 129, 0.3); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%); border-color: rgba(255, 189, 89, 0.3); }
        .highlight-box p { margin: 0; color: var(--text-primary); }
        .image-placeholder { background: linear-gradient(145deg, #1a2235 0%, #0d1321 100%); border: 2px dashed rgba(239, 68, 68, 0.4); border-radius: 12px; padding: 1rem; margin: 1.5rem 0; text-align: center; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; margin-bottom: 0.75rem; }
        .image-placeholder p { font-size: 0.85rem; color: var(--error-red); margin: 0; font-style: italic; }
        .tf-hierarchy { display: grid; grid-template-columns: 1fr; gap: 1rem; margin: 1.5rem 0; }
        .tf-card { background: var(--bg-card-hover); border-radius: 12px; padding: 1.25rem; border-left: 4px solid var(--primary-gold); }
        .tf-card.htf { border-left-color: var(--error-red); }
        .tf-card.itf { border-left-color: var(--accent-cyan); }
        .tf-card.ltf { border-left-color: var(--success-green); }
        .tf-card h4 { color: var(--text-primary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .tf-card h4 span { font-size: 1.25rem; }
        .tf-card p { color: var(--text-secondary); font-size: 0.9rem; margin: 0; }
        .confluence-box { background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%); border: 2px solid var(--primary-gold); border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; text-align: center; }
        .confluence-box h4 { color: var(--primary-gold); margin-bottom: 1rem; }
        .confluence-box .formula { font-size: 1.1rem; color: var(--text-primary); }
        .summary-box { background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%); border: 2px solid var(--error-red); padding: 1.5rem 1rem; margin: 0; }
        @media (min-width: 600px) { .summary-box { border-radius: 16px; padding: 2rem; margin: 1.5rem; } }
        .summary-box h3 { color: var(--error-red); font-size: 1.25rem; margin-bottom: 1rem; }
        .summary-box ul { list-style: none; padding: 0; }
        .summary-box li { padding: 0.5rem 0; padding-left: 1.75rem; position: relative; color: var(--text-primary); }
        .summary-box li::before { content: ''✓''; position: absolute; left: 0; color: var(--error-red); font-weight: 700; }
        .quiz-section { padding: 0; }
        @media (min-width: 600px) { .quiz-section { padding: 1.5rem; } }
        .quiz-container { background: var(--bg-card); padding: 1.5rem 1rem; border-left: 4px solid var(--accent-purple); }
        @media (min-width: 600px) { .quiz-container { border-radius: 16px; padding: 2rem; border: 1px solid var(--border-color); border-left: 4px solid var(--accent-purple); } }
        .quiz-container h2 { color: var(--accent-purple); font-size: 1.35rem; margin-bottom: 1.5rem; }
        .quiz-question { background: var(--bg-card-hover); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem; border: 1px solid var(--border-color); }
        .quiz-question p { font-weight: 600; margin-bottom: 1rem; color: var(--text-primary); }
        .quiz-option { display: block; width: 100%; padding: 0.875rem 1rem; margin-bottom: 0.5rem; background: var(--bg-card); border: 2px solid var(--border-color); border-radius: 8px; color: var(--text-primary); cursor: pointer; text-align: left; transition: all 0.3s; }
        .quiz-option:hover { border-color: var(--accent-purple); }
        .quiz-option.correct { background: rgba(16, 185, 129, 0.2); border-color: var(--success-green); color: var(--success-green); }
        .quiz-option.incorrect { background: rgba(239, 68, 68, 0.2); border-color: var(--error-red); color: var(--error-red); }
        .quiz-result { padding: 0.75rem; border-radius: 8px; margin-top: 0.75rem; font-weight: 600; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: var(--success-green); }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: var(--error-red); }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%); border-radius: 12px; margin-top: 1.5rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score h3 { color: var(--error-red); margin-bottom: 0.5rem; }
        .retake-btn { margin-top: 1rem; padding: 0.75rem 2rem; background: linear-gradient(135deg, var(--accent-purple) 0%, #5346E0 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; background: var(--bg-card); border-top: 1px solid var(--border-color); }
        .lesson-footer p { color: var(--text-secondary); font-size: 0.9rem; }
        .lesson-footer .brand { color: var(--primary-gold); font-weight: 700; }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <div class="header-badge">🥈 TIER 2 - Chapter 1</div>
            <h1>Kết Hợp HFZ Với Đa Khung Thời Gian</h1>
            <p>Multi-Timeframe Analysis để tăng xác suất thành công</p>
        </header>

        <section class="content-section">
            <div class="content-card">
                <h2><span class="icon">📊</span> Tại Sao Cần Đa Khung Thời Gian?</h2>
                <p>HFZ trên khung thời gian lớn (HTF) luôn <strong>mạnh hơn</strong> HFZ trên khung thời gian nhỏ (LTF). Bằng cách kết hợp nhiều khung thời gian, bạn có thể:</p>
                <ul>
                    <li>Xác định trend lớn để trade cùng chiều</li>
                    <li>Tìm zones mạnh hơn trên HTF</li>
                    <li>Entry chính xác hơn trên LTF</li>
                    <li>Tăng Win Rate lên 10-15%</li>
                </ul>
                <div class="highlight-box gold">
                    <p><strong>💡 Quy tắc vàng:</strong> HFZ trên Daily mạnh gấp 3-5 lần HFZ trên 1H. Luôn ưu tiên zones từ khung thời gian lớn!</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🏗️</span> Hệ Thống 3 Khung Thời Gian</h2>
                <div class="tf-hierarchy">
                    <div class="tf-card htf">
                        <h4><span>🔴</span> HTF (Higher Timeframe)</h4>
                        <p><strong>Mục đích:</strong> Xác định xu hướng lớn và tìm HFZ chính<br><strong>Ví dụ:</strong> Daily (1D), Weekly (1W)</p>
                    </div>
                    <div class="tf-card itf">
                        <h4><span>🔵</span> ITF (Intermediate Timeframe)</h4>
                        <p><strong>Mục đích:</strong> Xác định zone và cấu trúc pattern<br><strong>Ví dụ:</strong> 4H, 1H</p>
                    </div>
                    <div class="tf-card ltf">
                        <h4><span>🟢</span> LTF (Lower Timeframe)</h4>
                        <p><strong>Mục đích:</strong> Entry chính xác và quản lý lệnh<br><strong>Ví dụ:</strong> 15M, 5M</p>
                    </div>
                </div>
                <h3>Các combo khung thời gian phổ biến:</h3>
                <ul>
                    <li><strong>Swing Trading:</strong> 1D → 4H → 1H</li>
                    <li><strong>Day Trading:</strong> 4H → 1H → 15M</li>
                    <li><strong>Scalping:</strong> 1H → 15M → 5M</li>
                </ul>
            </div>

            <div class="content-card">
                <h2><span class="icon">🎯</span> Confluence = Xác Suất Cao</h2>
                <p>Khi HFZ trên nhiều khung thời gian <strong>trùng nhau</strong>, đó là "confluence" - tín hiệu cực mạnh!</p>
                <div class="confluence-box">
                    <h4>🔥 CONFLUENCE ZONE</h4>
                    <div class="formula">HFZ trên 1D + HFZ trên 4H + HFZ trên 1H<br>= <strong>Super High Probability Trade</strong></div>
                </div>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/FFBD59?text=MTF+Confluence" alt="MTF Confluence">
                    <p>📸 Ví dụ confluence: HFZ trùng trên 3 khung thời gian</p>
                </div>
                <div class="highlight-box green">
                    <p><strong>📈 Thống kê:</strong> Trades có confluence 2+ TF có Win Rate trung bình 70-75%, so với 55-60% khi chỉ dùng 1 TF.</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📝</span> Quy Trình 4 Bước</h2>
                <ol>
                    <li><strong>Bước 1:</strong> Xác định trend trên HTF (Daily). Nếu đang downtrend → Tìm HFZ để SHORT.</li>
                    <li><strong>Bước 2:</strong> Tìm HFZ trên ITF (4H). Đây là zone chính bạn sẽ trade.</li>
                    <li><strong>Bước 3:</strong> Kiểm tra xem HFZ này có trùng với zone nào trên HTF không → Nếu có = Confluence!</li>
                    <li><strong>Bước 4:</strong> Khi giá chạm zone, xuống LTF (15M-1H) để tìm entry chính xác với nến xác nhận.</li>
                </ol>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x450/0A0E17/00F0FF?text=4+Step+MTF+Process" alt="4 Step MTF Process">
                    <p>📸 Quy trình 4 bước phân tích đa khung thời gian</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">💡</span> Ví Dụ Thực Tế</h2>
                <p><strong>Setup:</strong> BTC/USDT Short tại HFZ confluence</p>
                <ul>
                    <li><strong>Daily:</strong> Downtrend rõ ràng, có HFZ tại $45,000-$46,000</li>
                    <li><strong>4H:</strong> Có HFZ tại $45,200-$45,800 (trùng với Daily zone!)</li>
                    <li><strong>1H:</strong> Giá pump lên $45,300, xuất hiện Bearish Engulfing</li>
                    <li><strong>Entry:</strong> SHORT tại $45,250 sau nến confirmation</li>
                    <li><strong>Result:</strong> TP hit tại $43,000 → R:R 1:2.5</li>
                </ul>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/10B981?text=BTC+Confluence+Trade" alt="BTC Confluence Trade">
                    <p>📸 Trade thực tế với confluence HFZ trên Daily + 4H</p>
                </div>
            </div>

            <div class="summary-box">
                <h3>📝 Tóm Tắt Bài Học</h3>
                <ul>
                    <li>HFZ trên HTF mạnh hơn HFZ trên LTF</li>
                    <li>Sử dụng hệ thống 3 khung: HTF (trend) → ITF (zone) → LTF (entry)</li>
                    <li>Confluence = zones trùng nhau = xác suất cao hơn</li>
                    <li>Trades có confluence 2+ TF có Win Rate 70-75%</li>
                    <li>Quy trình: Trend HTF → Zone ITF → Check confluence → Entry LTF</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-container">
                <h2>❓ Kiểm Tra Kiến Thức</h2>
                <div class="quiz-question" data-correct="0">
                    <p>1. HFZ trên khung thời gian nào mạnh nhất?</p>
                    <button class="quiz-option" data-index="0">A. Daily (1D) hoặc Weekly (1W)</button>
                    <button class="quiz-option" data-index="1">B. 5 phút (5M)</button>
                    <button class="quiz-option" data-index="2">C. 15 phút (15M)</button>
                    <button class="quiz-option" data-index="3">D. Tất cả đều như nhau</button>
                    <div class="quiz-result"></div>
                </div>
                <div class="quiz-question" data-correct="2">
                    <p>2. "Confluence" trong MTF analysis có nghĩa là gì?</p>
                    <button class="quiz-option" data-index="0">A. Chỉ dùng 1 khung thời gian</button>
                    <button class="quiz-option" data-index="1">B. Zone trên LTF</button>
                    <button class="quiz-option" data-index="2">C. Zones trùng nhau trên nhiều khung thời gian</button>
                    <button class="quiz-option" data-index="3">D. Entry ngẫu nhiên</button>
                    <div class="quiz-result"></div>
                </div>
                <div class="quiz-score">
                    <h3>🎉 Hoàn thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/2 câu hỏi</p>
                    <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>Bài học thuộc <span class="brand">GEM Trading Academy - TIER 2</span></p>
            <p>© 2024 - Nền tảng đào tạo trading chuyên nghiệp</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 2;
        let answeredCount = 0, correctCount = 0;
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
                        result.textContent = ''✗ Chưa đúng.'';
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
    <title>Bài 1.5: Kết Hợp HFZ Với Đa Khung Thời Gian - GEM Trading Academy</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root { --primary-navy: #112250; --primary-gold: #FFBD59; --accent-cyan: #00F0FF; --accent-purple: #6A5BFF; --success-green: #10B981; --error-red: #EF4444; --bg-dark: #0A0E17; --bg-card: #1A1F2E; --bg-card-hover: #252B3D; --text-primary: #FFFFFF; --text-secondary: #A0A9C0; --border-color: rgba(255, 189, 89, 0.2); }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: ''Inter'', sans-serif; background: var(--bg-dark); color: var(--text-primary); line-height: 1.7; font-size: 16px; }
        .lesson-container { max-width: 800px; margin: 0 auto; }
        @media (min-width: 600px) { body { padding: 2rem; background: linear-gradient(135deg, #0A0E17 0%, #112250 100%); } .lesson-container { background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-color); overflow: hidden; } }
        .lesson-header { background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%); padding: 2rem 1rem; text-align: center; border-bottom: 3px solid var(--error-red); }
        .header-badge { display: inline-block; background: linear-gradient(135deg, var(--error-red) 0%, #DC2626 100%); color: white; padding: 0.5rem 1.25rem; border-radius: 25px; font-size: 0.85rem; font-weight: 700; margin-bottom: 1rem; }
        .lesson-header h1 { font-size: clamp(1.5rem, 5vw, 2rem); font-weight: 700; margin-bottom: 0.5rem; }
        .lesson-header p { color: var(--text-secondary); }
        .content-section { padding: 0; }
        @media (min-width: 600px) { .content-section { padding: 1.5rem; } }
        .content-card { background: var(--bg-card); padding: 1.5rem 1rem; margin-bottom: 1px; border-left: 4px solid var(--error-red); }
        @media (min-width: 600px) { .content-card { border-radius: 16px; padding: 2rem; margin-bottom: 1.5rem; border: 1px solid var(--border-color); border-left: 4px solid var(--error-red); } }
        .content-card h2 { font-size: 1.35rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--error-red); display: flex; align-items: center; gap: 0.75rem; }
        .content-card h3 { font-size: 1.1rem; font-weight: 600; margin: 1.5rem 0 1rem 0; color: var(--accent-cyan); }
        .content-card p { margin-bottom: 1rem; color: var(--text-secondary); line-height: 1.8; }
        .content-card ul, .content-card ol { margin: 1rem 0; padding-left: 1.5rem; color: var(--text-secondary); }
        .content-card li { margin-bottom: 0.75rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 1.25rem; margin: 1.25rem 0; }
        .highlight-box.cyan { background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(0, 240, 255, 0.05) 100%); border-color: rgba(0, 240, 255, 0.3); }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%); border-color: rgba(16, 185, 129, 0.3); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%); border-color: rgba(255, 189, 89, 0.3); }
        .highlight-box p { margin: 0; color: var(--text-primary); }
        .image-placeholder { background: linear-gradient(145deg, #1a2235 0%, #0d1321 100%); border: 2px dashed rgba(239, 68, 68, 0.4); border-radius: 12px; padding: 1rem; margin: 1.5rem 0; text-align: center; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; margin-bottom: 0.75rem; }
        .image-placeholder p { font-size: 0.85rem; color: var(--error-red); margin: 0; font-style: italic; }
        .tf-hierarchy { display: grid; grid-template-columns: 1fr; gap: 1rem; margin: 1.5rem 0; }
        .tf-card { background: var(--bg-card-hover); border-radius: 12px; padding: 1.25rem; border-left: 4px solid var(--primary-gold); }
        .tf-card.htf { border-left-color: var(--error-red); }
        .tf-card.itf { border-left-color: var(--accent-cyan); }
        .tf-card.ltf { border-left-color: var(--success-green); }
        .tf-card h4 { color: var(--text-primary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .tf-card h4 span { font-size: 1.25rem; }
        .tf-card p { color: var(--text-secondary); font-size: 0.9rem; margin: 0; }
        .confluence-box { background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%); border: 2px solid var(--primary-gold); border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; text-align: center; }
        .confluence-box h4 { color: var(--primary-gold); margin-bottom: 1rem; }
        .confluence-box .formula { font-size: 1.1rem; color: var(--text-primary); }
        .summary-box { background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%); border: 2px solid var(--error-red); padding: 1.5rem 1rem; margin: 0; }
        @media (min-width: 600px) { .summary-box { border-radius: 16px; padding: 2rem; margin: 1.5rem; } }
        .summary-box h3 { color: var(--error-red); font-size: 1.25rem; margin-bottom: 1rem; }
        .summary-box ul { list-style: none; padding: 0; }
        .summary-box li { padding: 0.5rem 0; padding-left: 1.75rem; position: relative; color: var(--text-primary); }
        .summary-box li::before { content: ''✓''; position: absolute; left: 0; color: var(--error-red); font-weight: 700; }
        .quiz-section { padding: 0; }
        @media (min-width: 600px) { .quiz-section { padding: 1.5rem; } }
        .quiz-container { background: var(--bg-card); padding: 1.5rem 1rem; border-left: 4px solid var(--accent-purple); }
        @media (min-width: 600px) { .quiz-container { border-radius: 16px; padding: 2rem; border: 1px solid var(--border-color); border-left: 4px solid var(--accent-purple); } }
        .quiz-container h2 { color: var(--accent-purple); font-size: 1.35rem; margin-bottom: 1.5rem; }
        .quiz-question { background: var(--bg-card-hover); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem; border: 1px solid var(--border-color); }
        .quiz-question p { font-weight: 600; margin-bottom: 1rem; color: var(--text-primary); }
        .quiz-option { display: block; width: 100%; padding: 0.875rem 1rem; margin-bottom: 0.5rem; background: var(--bg-card); border: 2px solid var(--border-color); border-radius: 8px; color: var(--text-primary); cursor: pointer; text-align: left; transition: all 0.3s; }
        .quiz-option:hover { border-color: var(--accent-purple); }
        .quiz-option.correct { background: rgba(16, 185, 129, 0.2); border-color: var(--success-green); color: var(--success-green); }
        .quiz-option.incorrect { background: rgba(239, 68, 68, 0.2); border-color: var(--error-red); color: var(--error-red); }
        .quiz-result { padding: 0.75rem; border-radius: 8px; margin-top: 0.75rem; font-weight: 600; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: var(--success-green); }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: var(--error-red); }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%); border-radius: 12px; margin-top: 1.5rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score h3 { color: var(--error-red); margin-bottom: 0.5rem; }
        .retake-btn { margin-top: 1rem; padding: 0.75rem 2rem; background: linear-gradient(135deg, var(--accent-purple) 0%, #5346E0 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; background: var(--bg-card); border-top: 1px solid var(--border-color); }
        .lesson-footer p { color: var(--text-secondary); font-size: 0.9rem; }
        .lesson-footer .brand { color: var(--primary-gold); font-weight: 700; }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <div class="header-badge">🥈 TIER 2 - Chapter 1</div>
            <h1>Kết Hợp HFZ Với Đa Khung Thời Gian</h1>
            <p>Multi-Timeframe Analysis để tăng xác suất thành công</p>
        </header>

        <section class="content-section">
            <div class="content-card">
                <h2><span class="icon">📊</span> Tại Sao Cần Đa Khung Thời Gian?</h2>
                <p>HFZ trên khung thời gian lớn (HTF) luôn <strong>mạnh hơn</strong> HFZ trên khung thời gian nhỏ (LTF). Bằng cách kết hợp nhiều khung thời gian, bạn có thể:</p>
                <ul>
                    <li>Xác định trend lớn để trade cùng chiều</li>
                    <li>Tìm zones mạnh hơn trên HTF</li>
                    <li>Entry chính xác hơn trên LTF</li>
                    <li>Tăng Win Rate lên 10-15%</li>
                </ul>
                <div class="highlight-box gold">
                    <p><strong>💡 Quy tắc vàng:</strong> HFZ trên Daily mạnh gấp 3-5 lần HFZ trên 1H. Luôn ưu tiên zones từ khung thời gian lớn!</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">🏗️</span> Hệ Thống 3 Khung Thời Gian</h2>
                <div class="tf-hierarchy">
                    <div class="tf-card htf">
                        <h4><span>🔴</span> HTF (Higher Timeframe)</h4>
                        <p><strong>Mục đích:</strong> Xác định xu hướng lớn và tìm HFZ chính<br><strong>Ví dụ:</strong> Daily (1D), Weekly (1W)</p>
                    </div>
                    <div class="tf-card itf">
                        <h4><span>🔵</span> ITF (Intermediate Timeframe)</h4>
                        <p><strong>Mục đích:</strong> Xác định zone và cấu trúc pattern<br><strong>Ví dụ:</strong> 4H, 1H</p>
                    </div>
                    <div class="tf-card ltf">
                        <h4><span>🟢</span> LTF (Lower Timeframe)</h4>
                        <p><strong>Mục đích:</strong> Entry chính xác và quản lý lệnh<br><strong>Ví dụ:</strong> 15M, 5M</p>
                    </div>
                </div>
                <h3>Các combo khung thời gian phổ biến:</h3>
                <ul>
                    <li><strong>Swing Trading:</strong> 1D → 4H → 1H</li>
                    <li><strong>Day Trading:</strong> 4H → 1H → 15M</li>
                    <li><strong>Scalping:</strong> 1H → 15M → 5M</li>
                </ul>
            </div>

            <div class="content-card">
                <h2><span class="icon">🎯</span> Confluence = Xác Suất Cao</h2>
                <p>Khi HFZ trên nhiều khung thời gian <strong>trùng nhau</strong>, đó là "confluence" - tín hiệu cực mạnh!</p>
                <div class="confluence-box">
                    <h4>🔥 CONFLUENCE ZONE</h4>
                    <div class="formula">HFZ trên 1D + HFZ trên 4H + HFZ trên 1H<br>= <strong>Super High Probability Trade</strong></div>
                </div>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/FFBD59?text=MTF+Confluence" alt="MTF Confluence">
                    <p>📸 Ví dụ confluence: HFZ trùng trên 3 khung thời gian</p>
                </div>
                <div class="highlight-box green">
                    <p><strong>📈 Thống kê:</strong> Trades có confluence 2+ TF có Win Rate trung bình 70-75%, so với 55-60% khi chỉ dùng 1 TF.</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📝</span> Quy Trình 4 Bước</h2>
                <ol>
                    <li><strong>Bước 1:</strong> Xác định trend trên HTF (Daily). Nếu đang downtrend → Tìm HFZ để SHORT.</li>
                    <li><strong>Bước 2:</strong> Tìm HFZ trên ITF (4H). Đây là zone chính bạn sẽ trade.</li>
                    <li><strong>Bước 3:</strong> Kiểm tra xem HFZ này có trùng với zone nào trên HTF không → Nếu có = Confluence!</li>
                    <li><strong>Bước 4:</strong> Khi giá chạm zone, xuống LTF (15M-1H) để tìm entry chính xác với nến xác nhận.</li>
                </ol>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x450/0A0E17/00F0FF?text=4+Step+MTF+Process" alt="4 Step MTF Process">
                    <p>📸 Quy trình 4 bước phân tích đa khung thời gian</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">💡</span> Ví Dụ Thực Tế</h2>
                <p><strong>Setup:</strong> BTC/USDT Short tại HFZ confluence</p>
                <ul>
                    <li><strong>Daily:</strong> Downtrend rõ ràng, có HFZ tại $45,000-$46,000</li>
                    <li><strong>4H:</strong> Có HFZ tại $45,200-$45,800 (trùng với Daily zone!)</li>
                    <li><strong>1H:</strong> Giá pump lên $45,300, xuất hiện Bearish Engulfing</li>
                    <li><strong>Entry:</strong> SHORT tại $45,250 sau nến confirmation</li>
                    <li><strong>Result:</strong> TP hit tại $43,000 → R:R 1:2.5</li>
                </ul>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/10B981?text=BTC+Confluence+Trade" alt="BTC Confluence Trade">
                    <p>📸 Trade thực tế với confluence HFZ trên Daily + 4H</p>
                </div>
            </div>

            <div class="summary-box">
                <h3>📝 Tóm Tắt Bài Học</h3>
                <ul>
                    <li>HFZ trên HTF mạnh hơn HFZ trên LTF</li>
                    <li>Sử dụng hệ thống 3 khung: HTF (trend) → ITF (zone) → LTF (entry)</li>
                    <li>Confluence = zones trùng nhau = xác suất cao hơn</li>
                    <li>Trades có confluence 2+ TF có Win Rate 70-75%</li>
                    <li>Quy trình: Trend HTF → Zone ITF → Check confluence → Entry LTF</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-container">
                <h2>❓ Kiểm Tra Kiến Thức</h2>
                <div class="quiz-question" data-correct="0">
                    <p>1. HFZ trên khung thời gian nào mạnh nhất?</p>
                    <button class="quiz-option" data-index="0">A. Daily (1D) hoặc Weekly (1W)</button>
                    <button class="quiz-option" data-index="1">B. 5 phút (5M)</button>
                    <button class="quiz-option" data-index="2">C. 15 phút (15M)</button>
                    <button class="quiz-option" data-index="3">D. Tất cả đều như nhau</button>
                    <div class="quiz-result"></div>
                </div>
                <div class="quiz-question" data-correct="2">
                    <p>2. "Confluence" trong MTF analysis có nghĩa là gì?</p>
                    <button class="quiz-option" data-index="0">A. Chỉ dùng 1 khung thời gian</button>
                    <button class="quiz-option" data-index="1">B. Zone trên LTF</button>
                    <button class="quiz-option" data-index="2">C. Zones trùng nhau trên nhiều khung thời gian</button>
                    <button class="quiz-option" data-index="3">D. Entry ngẫu nhiên</button>
                    <div class="quiz-result"></div>
                </div>
                <div class="quiz-score">
                    <h3>🎉 Hoàn thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/2 câu hỏi</p>
                    <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>Bài học thuộc <span class="brand">GEM Trading Academy - TIER 2</span></p>
            <p>© 2024 - Nền tảng đào tạo trading chuyên nghiệp</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 2;
        let answeredCount = 0, correctCount = 0;
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
                        result.textContent = ''✗ Chưa đúng.'';
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

-- Lesson 1.6: Ví Dụ Thực Tế HFZ - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch1-l6',
  'module-tier-2-ch1',
  'course-tier2-trading-advanced',
  'Bài 1.6: Ví Dụ Thực Tế HFZ - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 1.6: Ví Dụ Thực Tế HFZ - GEM Trading Academy</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root { --primary-navy: #112250; --primary-gold: #FFBD59; --accent-cyan: #00F0FF; --accent-purple: #6A5BFF; --success-green: #10B981; --error-red: #EF4444; --bg-dark: #0A0E17; --bg-card: #1A1F2E; --bg-card-hover: #252B3D; --text-primary: #FFFFFF; --text-secondary: #A0A9C0; --border-color: rgba(255, 189, 89, 0.2); }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: ''Inter'', sans-serif; background: var(--bg-dark); color: var(--text-primary); line-height: 1.7; font-size: 16px; }
        .lesson-container { max-width: 800px; margin: 0 auto; }
        @media (min-width: 600px) { body { padding: 2rem; background: linear-gradient(135deg, #0A0E17 0%, #112250 100%); } .lesson-container { background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-color); overflow: hidden; } }
        .lesson-header { background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%); padding: 2rem 1rem; text-align: center; border-bottom: 3px solid var(--error-red); }
        .header-badge { display: inline-block; background: linear-gradient(135deg, var(--error-red) 0%, #DC2626 100%); color: white; padding: 0.5rem 1.25rem; border-radius: 25px; font-size: 0.85rem; font-weight: 700; margin-bottom: 1rem; }
        .lesson-header h1 { font-size: clamp(1.5rem, 5vw, 2rem); font-weight: 700; margin-bottom: 0.5rem; }
        .lesson-header p { color: var(--text-secondary); }
        .content-section { padding: 0; }
        @media (min-width: 600px) { .content-section { padding: 1.5rem; } }
        .content-card { background: var(--bg-card); padding: 1.5rem 1rem; margin-bottom: 1px; border-left: 4px solid var(--error-red); }
        @media (min-width: 600px) { .content-card { border-radius: 16px; padding: 2rem; margin-bottom: 1.5rem; border: 1px solid var(--border-color); border-left: 4px solid var(--error-red); } }
        .content-card h2 { font-size: 1.35rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--error-red); display: flex; align-items: center; gap: 0.75rem; }
        .content-card h3 { font-size: 1.1rem; font-weight: 600; margin: 1.5rem 0 1rem 0; color: var(--accent-cyan); }
        .content-card p { margin-bottom: 1rem; color: var(--text-secondary); line-height: 1.8; }
        .content-card ul, .content-card ol { margin: 1rem 0; padding-left: 1.5rem; color: var(--text-secondary); }
        .content-card li { margin-bottom: 0.75rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 1.25rem; margin: 1.25rem 0; }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%); border-color: rgba(16, 185, 129, 0.3); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%); border-color: rgba(255, 189, 89, 0.3); }
        .highlight-box p { margin: 0; color: var(--text-primary); }
        .image-placeholder { background: linear-gradient(145deg, #1a2235 0%, #0d1321 100%); border: 2px dashed rgba(239, 68, 68, 0.4); border-radius: 12px; padding: 1rem; margin: 1.5rem 0; text-align: center; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; margin-bottom: 0.75rem; }
        .image-placeholder p { font-size: 0.85rem; color: var(--error-red); margin: 0; font-style: italic; }
        .case-study { background: var(--bg-card-hover); border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; border-left: 4px solid var(--primary-gold); }
        .case-study .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
        .case-study .title { font-size: 1.1rem; font-weight: 700; color: var(--primary-gold); }
        .case-study .result { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
        .case-study .result.win { background: rgba(16, 185, 129, 0.2); color: var(--success-green); }
        .case-study .result.loss { background: rgba(239, 68, 68, 0.2); color: var(--error-red); }
        .trade-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin: 1rem 0; }
        @media (max-width: 600px) { .trade-stats { grid-template-columns: repeat(2, 1fr); } }
        .stat-item { background: var(--bg-card); padding: 0.75rem; border-radius: 8px; text-align: center; }
        .stat-item .label { font-size: 0.75rem; color: var(--text-secondary); }
        .stat-item .value { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
        .summary-box { background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%); border: 2px solid var(--error-red); padding: 1.5rem 1rem; margin: 0; }
        @media (min-width: 600px) { .summary-box { border-radius: 16px; padding: 2rem; margin: 1.5rem; } }
        .summary-box h3 { color: var(--error-red); font-size: 1.25rem; margin-bottom: 1rem; }
        .summary-box ul { list-style: none; padding: 0; }
        .summary-box li { padding: 0.5rem 0; padding-left: 1.75rem; position: relative; color: var(--text-primary); }
        .summary-box li::before { content: ''✓''; position: absolute; left: 0; color: var(--error-red); font-weight: 700; }
        .quiz-section { padding: 0; }
        @media (min-width: 600px) { .quiz-section { padding: 1.5rem; } }
        .quiz-container { background: var(--bg-card); padding: 1.5rem 1rem; border-left: 4px solid var(--accent-purple); }
        @media (min-width: 600px) { .quiz-container { border-radius: 16px; padding: 2rem; border: 1px solid var(--border-color); border-left: 4px solid var(--accent-purple); } }
        .quiz-container h2 { color: var(--accent-purple); font-size: 1.35rem; margin-bottom: 1.5rem; }
        .quiz-question { background: var(--bg-card-hover); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem; border: 1px solid var(--border-color); }
        .quiz-question p { font-weight: 600; margin-bottom: 1rem; color: var(--text-primary); }
        .quiz-option { display: block; width: 100%; padding: 0.875rem 1rem; margin-bottom: 0.5rem; background: var(--bg-card); border: 2px solid var(--border-color); border-radius: 8px; color: var(--text-primary); cursor: pointer; text-align: left; transition: all 0.3s; }
        .quiz-option:hover { border-color: var(--accent-purple); }
        .quiz-option.correct { background: rgba(16, 185, 129, 0.2); border-color: var(--success-green); color: var(--success-green); }
        .quiz-option.incorrect { background: rgba(239, 68, 68, 0.2); border-color: var(--error-red); color: var(--error-red); }
        .quiz-result { padding: 0.75rem; border-radius: 8px; margin-top: 0.75rem; font-weight: 600; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: var(--success-green); }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: var(--error-red); }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%); border-radius: 12px; margin-top: 1.5rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score h3 { color: var(--error-red); margin-bottom: 0.5rem; }
        .retake-btn { margin-top: 1rem; padding: 0.75rem 2rem; background: linear-gradient(135deg, var(--accent-purple) 0%, #5346E0 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; background: var(--bg-card); border-top: 1px solid var(--border-color); }
        .lesson-footer p { color: var(--text-secondary); font-size: 0.9rem; }
        .lesson-footer .brand { color: var(--primary-gold); font-weight: 700; }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <div class="header-badge">🥈 TIER 2 - Chapter 1</div>
            <h1>Ví Dụ Thực Tế HFZ</h1>
            <p>5 Case Studies phân tích chi tiết</p>
        </header>

        <section class="content-section">
            <div class="content-card">
                <h2><span class="icon">📊</span> Case Study #1: BTC/USDT - 4H</h2>
                <div class="case-study">
                    <div class="header">
                        <span class="title">🔴 HFZ từ Pattern UPD</span>
                        <span class="result win">✅ WIN +R:R 2.5</span>
                    </div>
                    <p><strong>Bối cảnh:</strong> BTC đang trong downtrend trên Daily. Xuất hiện pattern UPD trên 4H tạo HFZ tại $43,500-$44,200.</p>
                    <div class="trade-stats">
                        <div class="stat-item"><div class="label">Entry</div><div class="value">$43,600</div></div>
                        <div class="stat-item"><div class="label">Stop Loss</div><div class="value">$44,400</div></div>
                        <div class="stat-item"><div class="label">Take Profit</div><div class="value">$41,600</div></div>
                        <div class="stat-item"><div class="label">R:R</div><div class="value">1:2.5</div></div>
                    </div>
                    <p><strong>Diễn biến:</strong> Giá pump lên test HFZ, xuất hiện Bearish Engulfing → Entry SHORT → TP hit sau 18 giờ.</p>
                </div>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/10B981?text=Case+1+BTC+WIN" alt="Case 1 BTC WIN">
                    <p>📸 Case Study #1: BTC HFZ trade thắng</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📊</span> Case Study #2: ETH/USDT - 1H</h2>
                <div class="case-study">
                    <div class="header">
                        <span class="title">🔴 HFZ từ Pattern DPD</span>
                        <span class="result win">✅ WIN +R:R 2.0</span>
                    </div>
                    <p><strong>Bối cảnh:</strong> ETH tạo DPD pattern trên 1H. Zone HFZ tại $2,380-$2,420. Confluence với resistance 4H.</p>
                    <div class="trade-stats">
                        <div class="stat-item"><div class="label">Entry</div><div class="value">$2,390</div></div>
                        <div class="stat-item"><div class="label">Stop Loss</div><div class="value">$2,440</div></div>
                        <div class="stat-item"><div class="label">Take Profit</div><div class="value">$2,290</div></div>
                        <div class="stat-item"><div class="label">R:R</div><div class="value">1:2.0</div></div>
                    </div>
                    <p><strong>Diễn biến:</strong> Pin bar rejection tại zone → Entry → TP hit trong 6 giờ. Trade nhanh gọn.</p>
                </div>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/0A0E17/10B981?text=Case+2+ETH+WIN" alt="Case 2 ETH WIN">
                    <p>📸 Case Study #2: ETH HFZ trade với confluence</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📊</span> Case Study #3: SOL/USDT - 4H (LOSS)</h2>
                <div class="case-study">
                    <div class="header">
                        <span class="title">🔴 HFZ Zone Bị Phá Vỡ</span>
                        <span class="result loss">❌ LOSS -1R</span>
                    </div>
                    <p><strong>Bối cảnh:</strong> SOL có HFZ tại $98-$102 từ UPD pattern. Tuy nhiên, đây là zone đã TESTED_2X.</p>
                    <div class="trade-stats">
                        <div class="stat-item"><div class="label">Entry</div><div class="value">$99</div></div>
                        <div class="stat-item"><div class="label">Stop Loss</div><div class="value">$103</div></div>
                        <div class="stat-item"><div class="label">Take Profit</div><div class="value">$91</div></div>
                        <div class="stat-item"><div class="label">Result</div><div class="value">SL Hit</div></div>
                    </div>
                    <p><strong>Bài học:</strong> Zone đã yếu (TESTED_2X), không có confluence HTF. Breaking news pump BTC → SOL theo → SL hit.</p>
                </div>
                <div class="highlight-box">
                    <p><strong>⚠️ Bài học rút ra:</strong> Không trade zone đã test 2+ lần khi không có confluence mạnh. Luôn check news trước khi entry!</p>
                </div>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/EF4444?text=Case+3+SOL+LOSS" alt="Case 3 SOL LOSS">
                    <p>📸 Case Study #3: SOL trade thua và bài học</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📊</span> Case Study #4: BNB/USDT - Daily</h2>
                <div class="case-study">
                    <div class="header">
                        <span class="title">🔴 HFZ Daily - High Quality</span>
                        <span class="result win">✅ WIN +R:R 3.0</span>
                    </div>
                    <p><strong>Bối cảnh:</strong> BNB tạo UPD trên Daily - zone cực mạnh! FRESH zone tại $320-$335.</p>
                    <div class="trade-stats">
                        <div class="stat-item"><div class="label">Entry</div><div class="value">$322</div></div>
                        <div class="stat-item"><div class="label">Stop Loss</div><div class="value">$340</div></div>
                        <div class="stat-item"><div class="label">Take Profit</div><div class="value">$268</div></div>
                        <div class="stat-item"><div class="label">R:R</div><div class="value">1:3.0</div></div>
                    </div>
                    <p><strong>Diễn biến:</strong> Chờ 5 ngày để giá test zone → Evening Star pattern → Entry → TP hit sau 12 ngày.</p>
                </div>
                <div class="highlight-box green">
                    <p><strong>✅ Key insight:</strong> Zone Daily + FRESH = High probability. Kiên nhẫn chờ đợi được đền đáp xứng đáng!</p>
                </div>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/0A0E17/FFBD59?text=Case+4+BNB+WIN" alt="Case 4 BNB WIN">
                    <p>📸 Case Study #4: BNB Daily zone trade lớn</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📊</span> Case Study #5: DOGE/USDT - 15M Scalp</h2>
                <div class="case-study">
                    <div class="header">
                        <span class="title">🔴 HFZ Scalping</span>
                        <span class="result win">✅ WIN +R:R 1.5</span>
                    </div>
                    <p><strong>Bối cảnh:</strong> DOGE có HFZ 15M tại $0.0825-$0.0835. Trend 1H đang bearish. Quick scalp setup.</p>
                    <div class="trade-stats">
                        <div class="stat-item"><div class="label">Entry</div><div class="value">$0.0828</div></div>
                        <div class="stat-item"><div class="label">Stop Loss</div><div class="value">$0.0840</div></div>
                        <div class="stat-item"><div class="label">Take Profit</div><div class="value">$0.0810</div></div>
                        <div class="stat-item"><div class="label">Duration</div><div class="value">45 phút</div></div>
                    </div>
                    <p><strong>Lưu ý:</strong> Scalp cần R:R thấp hơn (1.5) nhưng execution phải nhanh và chính xác.</p>
                </div>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/00F0FF?text=Case+5+DOGE+SCALP" alt="Case 5 DOGE SCALP">
                    <p>📸 Case Study #5: DOGE scalp nhanh 45 phút</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📈</span> Thống Kê Tổng Hợp</h2>
                <div class="highlight-box gold">
                    <p><strong>📊 Kết quả 5 Case Studies:</strong></p>
                    <ul style="margin-top: 0.5rem; padding-left: 1.25rem;">
                        <li>Win: 4/5 = 80% Win Rate</li>
                        <li>Average R:R: 2.25</li>
                        <li>Best: BNB Daily +3R</li>
                        <li>Worst: SOL -1R (zone yếu)</li>
                    </ul>
                </div>
                <p><strong>Key takeaways:</strong></p>
                <ul>
                    <li>FRESH zones có Win Rate cao hơn</li>
                    <li>Zones trên HTF (Daily, 4H) đáng tin cậy hơn</li>
                    <li>Confluence = thêm 10-15% Win Rate</li>
                    <li>Losses xảy ra khi trade zone yếu hoặc bỏ qua context</li>
                </ul>
            </div>

            <div class="summary-box">
                <h3>📝 Tóm Tắt Chương 1: HFZ Mastery</h3>
                <ul>
                    <li>HFZ = High Frequency Zone = Vùng bán, luôn TRÊN giá</li>
                    <li>Tạo từ DPD và UPD patterns</li>
                    <li>Zone có lifecycle: FRESH → TESTED → BROKEN</li>
                    <li>Entry sau nến xác nhận, SL trên đỉnh zone</li>
                    <li>HTF zones mạnh hơn, confluence tăng Win Rate</li>
                    <li>Thực tế: 80% Win Rate với đúng rules</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-container">
                <h2>❓ Quiz Tổng Kết Chapter 1</h2>
                <div class="quiz-question" data-correct="1">
                    <p>1. Trong 5 case studies, trade nào thua và tại sao?</p>
                    <button class="quiz-option" data-index="0">A. BTC - vì không có nến xác nhận</button>
                    <button class="quiz-option" data-index="1">B. SOL - vì zone đã yếu (TESTED_2X) và không có confluence</button>
                    <button class="quiz-option" data-index="2">C. ETH - vì entry quá sớm</button>
                    <button class="quiz-option" data-index="3">D. Tất cả đều thắng</button>
                    <div class="quiz-result"></div>
                </div>
                <div class="quiz-question" data-correct="0">
                    <p>2. Zone nào trong 5 cases có R:R tốt nhất và tại sao?</p>
                    <button class="quiz-option" data-index="0">A. BNB Daily - vì là FRESH zone trên HTF</button>
                    <button class="quiz-option" data-index="1">B. DOGE 15M - vì scalp nhanh</button>
                    <button class="quiz-option" data-index="2">C. ETH 1H - vì có confluence</button>
                    <button class="quiz-option" data-index="3">D. Tất cả đều như nhau</button>
                    <div class="quiz-result"></div>
                </div>
                <div class="quiz-score">
                    <h3>🎉 Hoàn thành Chapter 1!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/2 câu hỏi</p>
                    <p style="margin-top: 0.5rem; color: var(--success-green);">Tiếp theo: Chapter 2 - LFZ Mastery</p>
                    <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>Bài học thuộc <span class="brand">GEM Trading Academy - TIER 2</span></p>
            <p>© 2024 - Nền tảng đào tạo trading chuyên nghiệp</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 2;
        let answeredCount = 0, correctCount = 0;
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
                        result.textContent = ''✗ Chưa đúng.'';
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
    <title>Bài 1.6: Ví Dụ Thực Tế HFZ - GEM Trading Academy</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root { --primary-navy: #112250; --primary-gold: #FFBD59; --accent-cyan: #00F0FF; --accent-purple: #6A5BFF; --success-green: #10B981; --error-red: #EF4444; --bg-dark: #0A0E17; --bg-card: #1A1F2E; --bg-card-hover: #252B3D; --text-primary: #FFFFFF; --text-secondary: #A0A9C0; --border-color: rgba(255, 189, 89, 0.2); }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: ''Inter'', sans-serif; background: var(--bg-dark); color: var(--text-primary); line-height: 1.7; font-size: 16px; }
        .lesson-container { max-width: 800px; margin: 0 auto; }
        @media (min-width: 600px) { body { padding: 2rem; background: linear-gradient(135deg, #0A0E17 0%, #112250 100%); } .lesson-container { background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-color); overflow: hidden; } }
        .lesson-header { background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%); padding: 2rem 1rem; text-align: center; border-bottom: 3px solid var(--error-red); }
        .header-badge { display: inline-block; background: linear-gradient(135deg, var(--error-red) 0%, #DC2626 100%); color: white; padding: 0.5rem 1.25rem; border-radius: 25px; font-size: 0.85rem; font-weight: 700; margin-bottom: 1rem; }
        .lesson-header h1 { font-size: clamp(1.5rem, 5vw, 2rem); font-weight: 700; margin-bottom: 0.5rem; }
        .lesson-header p { color: var(--text-secondary); }
        .content-section { padding: 0; }
        @media (min-width: 600px) { .content-section { padding: 1.5rem; } }
        .content-card { background: var(--bg-card); padding: 1.5rem 1rem; margin-bottom: 1px; border-left: 4px solid var(--error-red); }
        @media (min-width: 600px) { .content-card { border-radius: 16px; padding: 2rem; margin-bottom: 1.5rem; border: 1px solid var(--border-color); border-left: 4px solid var(--error-red); } }
        .content-card h2 { font-size: 1.35rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--error-red); display: flex; align-items: center; gap: 0.75rem; }
        .content-card h3 { font-size: 1.1rem; font-weight: 600; margin: 1.5rem 0 1rem 0; color: var(--accent-cyan); }
        .content-card p { margin-bottom: 1rem; color: var(--text-secondary); line-height: 1.8; }
        .content-card ul, .content-card ol { margin: 1rem 0; padding-left: 1.5rem; color: var(--text-secondary); }
        .content-card li { margin-bottom: 0.75rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 1.25rem; margin: 1.25rem 0; }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%); border-color: rgba(16, 185, 129, 0.3); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 189, 89, 0.05) 100%); border-color: rgba(255, 189, 89, 0.3); }
        .highlight-box p { margin: 0; color: var(--text-primary); }
        .image-placeholder { background: linear-gradient(145deg, #1a2235 0%, #0d1321 100%); border: 2px dashed rgba(239, 68, 68, 0.4); border-radius: 12px; padding: 1rem; margin: 1.5rem 0; text-align: center; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; margin-bottom: 0.75rem; }
        .image-placeholder p { font-size: 0.85rem; color: var(--error-red); margin: 0; font-style: italic; }
        .case-study { background: var(--bg-card-hover); border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; border-left: 4px solid var(--primary-gold); }
        .case-study .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
        .case-study .title { font-size: 1.1rem; font-weight: 700; color: var(--primary-gold); }
        .case-study .result { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
        .case-study .result.win { background: rgba(16, 185, 129, 0.2); color: var(--success-green); }
        .case-study .result.loss { background: rgba(239, 68, 68, 0.2); color: var(--error-red); }
        .trade-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin: 1rem 0; }
        @media (max-width: 600px) { .trade-stats { grid-template-columns: repeat(2, 1fr); } }
        .stat-item { background: var(--bg-card); padding: 0.75rem; border-radius: 8px; text-align: center; }
        .stat-item .label { font-size: 0.75rem; color: var(--text-secondary); }
        .stat-item .value { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
        .summary-box { background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%); border: 2px solid var(--error-red); padding: 1.5rem 1rem; margin: 0; }
        @media (min-width: 600px) { .summary-box { border-radius: 16px; padding: 2rem; margin: 1.5rem; } }
        .summary-box h3 { color: var(--error-red); font-size: 1.25rem; margin-bottom: 1rem; }
        .summary-box ul { list-style: none; padding: 0; }
        .summary-box li { padding: 0.5rem 0; padding-left: 1.75rem; position: relative; color: var(--text-primary); }
        .summary-box li::before { content: ''✓''; position: absolute; left: 0; color: var(--error-red); font-weight: 700; }
        .quiz-section { padding: 0; }
        @media (min-width: 600px) { .quiz-section { padding: 1.5rem; } }
        .quiz-container { background: var(--bg-card); padding: 1.5rem 1rem; border-left: 4px solid var(--accent-purple); }
        @media (min-width: 600px) { .quiz-container { border-radius: 16px; padding: 2rem; border: 1px solid var(--border-color); border-left: 4px solid var(--accent-purple); } }
        .quiz-container h2 { color: var(--accent-purple); font-size: 1.35rem; margin-bottom: 1.5rem; }
        .quiz-question { background: var(--bg-card-hover); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem; border: 1px solid var(--border-color); }
        .quiz-question p { font-weight: 600; margin-bottom: 1rem; color: var(--text-primary); }
        .quiz-option { display: block; width: 100%; padding: 0.875rem 1rem; margin-bottom: 0.5rem; background: var(--bg-card); border: 2px solid var(--border-color); border-radius: 8px; color: var(--text-primary); cursor: pointer; text-align: left; transition: all 0.3s; }
        .quiz-option:hover { border-color: var(--accent-purple); }
        .quiz-option.correct { background: rgba(16, 185, 129, 0.2); border-color: var(--success-green); color: var(--success-green); }
        .quiz-option.incorrect { background: rgba(239, 68, 68, 0.2); border-color: var(--error-red); color: var(--error-red); }
        .quiz-result { padding: 0.75rem; border-radius: 8px; margin-top: 0.75rem; font-weight: 600; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: var(--success-green); }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: var(--error-red); }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%); border-radius: 12px; margin-top: 1.5rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score h3 { color: var(--error-red); margin-bottom: 0.5rem; }
        .retake-btn { margin-top: 1rem; padding: 0.75rem 2rem; background: linear-gradient(135deg, var(--accent-purple) 0%, #5346E0 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; background: var(--bg-card); border-top: 1px solid var(--border-color); }
        .lesson-footer p { color: var(--text-secondary); font-size: 0.9rem; }
        .lesson-footer .brand { color: var(--primary-gold); font-weight: 700; }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <div class="header-badge">🥈 TIER 2 - Chapter 1</div>
            <h1>Ví Dụ Thực Tế HFZ</h1>
            <p>5 Case Studies phân tích chi tiết</p>
        </header>

        <section class="content-section">
            <div class="content-card">
                <h2><span class="icon">📊</span> Case Study #1: BTC/USDT - 4H</h2>
                <div class="case-study">
                    <div class="header">
                        <span class="title">🔴 HFZ từ Pattern UPD</span>
                        <span class="result win">✅ WIN +R:R 2.5</span>
                    </div>
                    <p><strong>Bối cảnh:</strong> BTC đang trong downtrend trên Daily. Xuất hiện pattern UPD trên 4H tạo HFZ tại $43,500-$44,200.</p>
                    <div class="trade-stats">
                        <div class="stat-item"><div class="label">Entry</div><div class="value">$43,600</div></div>
                        <div class="stat-item"><div class="label">Stop Loss</div><div class="value">$44,400</div></div>
                        <div class="stat-item"><div class="label">Take Profit</div><div class="value">$41,600</div></div>
                        <div class="stat-item"><div class="label">R:R</div><div class="value">1:2.5</div></div>
                    </div>
                    <p><strong>Diễn biến:</strong> Giá pump lên test HFZ, xuất hiện Bearish Engulfing → Entry SHORT → TP hit sau 18 giờ.</p>
                </div>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/10B981?text=Case+1+BTC+WIN" alt="Case 1 BTC WIN">
                    <p>📸 Case Study #1: BTC HFZ trade thắng</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📊</span> Case Study #2: ETH/USDT - 1H</h2>
                <div class="case-study">
                    <div class="header">
                        <span class="title">🔴 HFZ từ Pattern DPD</span>
                        <span class="result win">✅ WIN +R:R 2.0</span>
                    </div>
                    <p><strong>Bối cảnh:</strong> ETH tạo DPD pattern trên 1H. Zone HFZ tại $2,380-$2,420. Confluence với resistance 4H.</p>
                    <div class="trade-stats">
                        <div class="stat-item"><div class="label">Entry</div><div class="value">$2,390</div></div>
                        <div class="stat-item"><div class="label">Stop Loss</div><div class="value">$2,440</div></div>
                        <div class="stat-item"><div class="label">Take Profit</div><div class="value">$2,290</div></div>
                        <div class="stat-item"><div class="label">R:R</div><div class="value">1:2.0</div></div>
                    </div>
                    <p><strong>Diễn biến:</strong> Pin bar rejection tại zone → Entry → TP hit trong 6 giờ. Trade nhanh gọn.</p>
                </div>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/0A0E17/10B981?text=Case+2+ETH+WIN" alt="Case 2 ETH WIN">
                    <p>📸 Case Study #2: ETH HFZ trade với confluence</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📊</span> Case Study #3: SOL/USDT - 4H (LOSS)</h2>
                <div class="case-study">
                    <div class="header">
                        <span class="title">🔴 HFZ Zone Bị Phá Vỡ</span>
                        <span class="result loss">❌ LOSS -1R</span>
                    </div>
                    <p><strong>Bối cảnh:</strong> SOL có HFZ tại $98-$102 từ UPD pattern. Tuy nhiên, đây là zone đã TESTED_2X.</p>
                    <div class="trade-stats">
                        <div class="stat-item"><div class="label">Entry</div><div class="value">$99</div></div>
                        <div class="stat-item"><div class="label">Stop Loss</div><div class="value">$103</div></div>
                        <div class="stat-item"><div class="label">Take Profit</div><div class="value">$91</div></div>
                        <div class="stat-item"><div class="label">Result</div><div class="value">SL Hit</div></div>
                    </div>
                    <p><strong>Bài học:</strong> Zone đã yếu (TESTED_2X), không có confluence HTF. Breaking news pump BTC → SOL theo → SL hit.</p>
                </div>
                <div class="highlight-box">
                    <p><strong>⚠️ Bài học rút ra:</strong> Không trade zone đã test 2+ lần khi không có confluence mạnh. Luôn check news trước khi entry!</p>
                </div>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/EF4444?text=Case+3+SOL+LOSS" alt="Case 3 SOL LOSS">
                    <p>📸 Case Study #3: SOL trade thua và bài học</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📊</span> Case Study #4: BNB/USDT - Daily</h2>
                <div class="case-study">
                    <div class="header">
                        <span class="title">🔴 HFZ Daily - High Quality</span>
                        <span class="result win">✅ WIN +R:R 3.0</span>
                    </div>
                    <p><strong>Bối cảnh:</strong> BNB tạo UPD trên Daily - zone cực mạnh! FRESH zone tại $320-$335.</p>
                    <div class="trade-stats">
                        <div class="stat-item"><div class="label">Entry</div><div class="value">$322</div></div>
                        <div class="stat-item"><div class="label">Stop Loss</div><div class="value">$340</div></div>
                        <div class="stat-item"><div class="label">Take Profit</div><div class="value">$268</div></div>
                        <div class="stat-item"><div class="label">R:R</div><div class="value">1:3.0</div></div>
                    </div>
                    <p><strong>Diễn biến:</strong> Chờ 5 ngày để giá test zone → Evening Star pattern → Entry → TP hit sau 12 ngày.</p>
                </div>
                <div class="highlight-box green">
                    <p><strong>✅ Key insight:</strong> Zone Daily + FRESH = High probability. Kiên nhẫn chờ đợi được đền đáp xứng đáng!</p>
                </div>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/0A0E17/FFBD59?text=Case+4+BNB+WIN" alt="Case 4 BNB WIN">
                    <p>📸 Case Study #4: BNB Daily zone trade lớn</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📊</span> Case Study #5: DOGE/USDT - 15M Scalp</h2>
                <div class="case-study">
                    <div class="header">
                        <span class="title">🔴 HFZ Scalping</span>
                        <span class="result win">✅ WIN +R:R 1.5</span>
                    </div>
                    <p><strong>Bối cảnh:</strong> DOGE có HFZ 15M tại $0.0825-$0.0835. Trend 1H đang bearish. Quick scalp setup.</p>
                    <div class="trade-stats">
                        <div class="stat-item"><div class="label">Entry</div><div class="value">$0.0828</div></div>
                        <div class="stat-item"><div class="label">Stop Loss</div><div class="value">$0.0840</div></div>
                        <div class="stat-item"><div class="label">Take Profit</div><div class="value">$0.0810</div></div>
                        <div class="stat-item"><div class="label">Duration</div><div class="value">45 phút</div></div>
                    </div>
                    <p><strong>Lưu ý:</strong> Scalp cần R:R thấp hơn (1.5) nhưng execution phải nhanh và chính xác.</p>
                </div>
                <div class="image-placeholder">
                    <img src="https://placehold.co/700x400/112250/00F0FF?text=Case+5+DOGE+SCALP" alt="Case 5 DOGE SCALP">
                    <p>📸 Case Study #5: DOGE scalp nhanh 45 phút</p>
                </div>
            </div>

            <div class="content-card">
                <h2><span class="icon">📈</span> Thống Kê Tổng Hợp</h2>
                <div class="highlight-box gold">
                    <p><strong>📊 Kết quả 5 Case Studies:</strong></p>
                    <ul style="margin-top: 0.5rem; padding-left: 1.25rem;">
                        <li>Win: 4/5 = 80% Win Rate</li>
                        <li>Average R:R: 2.25</li>
                        <li>Best: BNB Daily +3R</li>
                        <li>Worst: SOL -1R (zone yếu)</li>
                    </ul>
                </div>
                <p><strong>Key takeaways:</strong></p>
                <ul>
                    <li>FRESH zones có Win Rate cao hơn</li>
                    <li>Zones trên HTF (Daily, 4H) đáng tin cậy hơn</li>
                    <li>Confluence = thêm 10-15% Win Rate</li>
                    <li>Losses xảy ra khi trade zone yếu hoặc bỏ qua context</li>
                </ul>
            </div>

            <div class="summary-box">
                <h3>📝 Tóm Tắt Chương 1: HFZ Mastery</h3>
                <ul>
                    <li>HFZ = High Frequency Zone = Vùng bán, luôn TRÊN giá</li>
                    <li>Tạo từ DPD và UPD patterns</li>
                    <li>Zone có lifecycle: FRESH → TESTED → BROKEN</li>
                    <li>Entry sau nến xác nhận, SL trên đỉnh zone</li>
                    <li>HTF zones mạnh hơn, confluence tăng Win Rate</li>
                    <li>Thực tế: 80% Win Rate với đúng rules</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-container">
                <h2>❓ Quiz Tổng Kết Chapter 1</h2>
                <div class="quiz-question" data-correct="1">
                    <p>1. Trong 5 case studies, trade nào thua và tại sao?</p>
                    <button class="quiz-option" data-index="0">A. BTC - vì không có nến xác nhận</button>
                    <button class="quiz-option" data-index="1">B. SOL - vì zone đã yếu (TESTED_2X) và không có confluence</button>
                    <button class="quiz-option" data-index="2">C. ETH - vì entry quá sớm</button>
                    <button class="quiz-option" data-index="3">D. Tất cả đều thắng</button>
                    <div class="quiz-result"></div>
                </div>
                <div class="quiz-question" data-correct="0">
                    <p>2. Zone nào trong 5 cases có R:R tốt nhất và tại sao?</p>
                    <button class="quiz-option" data-index="0">A. BNB Daily - vì là FRESH zone trên HTF</button>
                    <button class="quiz-option" data-index="1">B. DOGE 15M - vì scalp nhanh</button>
                    <button class="quiz-option" data-index="2">C. ETH 1H - vì có confluence</button>
                    <button class="quiz-option" data-index="3">D. Tất cả đều như nhau</button>
                    <div class="quiz-result"></div>
                </div>
                <div class="quiz-score">
                    <h3>🎉 Hoàn thành Chapter 1!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/2 câu hỏi</p>
                    <p style="margin-top: 0.5rem; color: var(--success-green);">Tiếp theo: Chapter 2 - LFZ Mastery</p>
                    <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>Bài học thuộc <span class="brand">GEM Trading Academy - TIER 2</span></p>
            <p>© 2024 - Nền tảng đào tạo trading chuyên nghiệp</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 2;
        let answeredCount = 0, correctCount = 0;
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
                        result.textContent = ''✗ Chưa đúng.'';
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
