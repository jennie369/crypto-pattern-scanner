-- =====================================================
-- TIER-2 - Chương 6: Risk Management Nâng Cao
-- Course: course-tier2-trading-advanced
-- File 14/23
-- =====================================================

-- Create/Update Module
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  'module-tier-2-ch6',
  'course-tier2-trading-advanced',
  'Chương 6: Risk Management Nâng Cao',
  'Quản lý rủi ro chuyên sâu',
  6,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Lesson 6.1: Công Thức Tính Khối Lượng Lệnh - Tier 2
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch6-l1',
  'module-tier-2-ch6',
  'course-tier2-trading-advanced',
  'Bài 6.1: Công Thức Tính Khối Lượng Lệnh - Tier 2',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 6.1: Công Thức Tính Khối Lượng Lệnh - Tier 2</title>
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

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
        }

        .lesson-container { max-width: 800px; margin: 0 auto; padding: 1rem; }

        @media (max-width: 600px) { .lesson-container { padding: 0; } }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem;
            margin-bottom: 1.5rem;
            border-radius: 16px;
            text-align: center;
        }

        @media (max-width: 600px) { .lesson-header { border-radius: 0; padding: 1.5rem 1rem; } }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--danger-red) 0%, #F87171 100%);
            color: white;
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 1rem;
        }

        .lesson-title { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: var(--text-secondary); font-size: 1rem; }

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
                border-left: 4px solid var(--danger-red);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
        }

        .card-header {
            background: rgba(239, 68, 68, 0.1);
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) { .card-header { padding: 1rem; } }

        .card-header h2 { font-size: 1.25rem; color: var(--danger-red); }

        .card-content { padding: 1.5rem; }
        @media (max-width: 600px) { .card-content { padding: 1rem; } }
        .card-content p { margin-bottom: 1rem; color: var(--text-secondary); }

        .image-placeholder {
            width: 100%;
            background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
            border-radius: 8px;
            margin: 1rem 0;
            overflow: hidden;
        }

        @media (max-width: 600px) {
            .image-placeholder { border-radius: 0; margin: 1rem -1rem; width: calc(100% + 2rem); }
        }

        .image-placeholder img { width: 100%; height: auto; display: block; }

        .info-box {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) { .info-box { border-radius: 4px; } }

        .info-box.success { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3); }
        .info-box.warning { background: rgba(255, 189, 89, 0.1); border-color: rgba(255, 189, 89, 0.3); }
        .info-box.cyan { background: rgba(0, 240, 255, 0.1); border-color: rgba(0, 240, 255, 0.3); }

        .info-box-title { font-weight: 600; margin-bottom: 0.5rem; color: var(--danger-red); }
        .info-box.success .info-box-title { color: var(--success-green); }
        .info-box.warning .info-box-title { color: var(--accent-gold); }
        .info-box.cyan .info-box-title { color: var(--accent-cyan); }

        .styled-list { list-style: none; padding: 0; }
        .styled-list li {
            padding: 0.75rem 0;
            padding-left: 2rem;
            position: relative;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            color: var(--text-secondary);
        }
        .styled-list li:last-child { border-bottom: none; }
        .styled-list li::before {
            content: ''→'';
            position: absolute;
            left: 0;
            color: var(--danger-red);
            font-weight: bold;
        }

        /* Formula Box */
        .formula-box {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(106, 91, 255, 0.1) 100%);
            border: 2px solid var(--danger-red);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        .formula-title { color: var(--danger-red); font-weight: 700; margin-bottom: 1rem; }
        .formula-text {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-primary);
            background: rgba(0,0,0,0.3);
            padding: 1rem;
            border-radius: 8px;
            font-family: monospace;
        }

        /* Calculator Example */
        .calc-example {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .calc-example { border-radius: 0; margin: 1rem -1rem; padding: 1rem; width: calc(100% + 2rem); }
        }

        .calc-row {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .calc-row:last-child { border-bottom: none; }
        .calc-label { color: var(--text-secondary); }
        .calc-value { font-weight: 600; color: var(--accent-cyan); }
        .calc-result { color: var(--success-green); font-size: 1.25rem; }

        /* Summary Box */
        .summary-box {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(106, 91, 255, 0.1) 100%);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                border-left: 4px solid var(--danger-red);
                border-right: none;
                border-top: none;
                border-bottom: none;
            }
        }

        .summary-box h3 { color: var(--danger-red); margin-bottom: 1rem; }
        .summary-list { list-style: none; padding: 0; }
        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }
        .summary-list li::before { content: ''✓''; position: absolute; left: 0; color: var(--success-green); }

        /* Quiz Section */
        .quiz-section {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) { .quiz-section { border-radius: 0; padding: 1rem; margin-top: 1rem; } }

        .quiz-section h3 { color: var(--accent-gold); margin-bottom: 1.5rem; }

        .quiz-question {
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }
        .quiz-question p { font-weight: 600; margin-bottom: 1rem; }

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
            text-align: left;
            transition: all 0.3s ease;
        }

        .quiz-option:hover { background: rgba(255,255,255,0.1); border-color: var(--danger-red); }
        .quiz-option.correct { background: rgba(16, 185, 129, 0.2); border-color: var(--success-green); }
        .quiz-option.incorrect { background: rgba(239, 68, 68, 0.2); border-color: var(--danger-red); }

        .quiz-result { padding: 1rem; border-radius: 8px; margin-top: 0.5rem; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.1); color: var(--success-green); }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.1); color: var(--danger-red); }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(106, 91, 255, 0.1) 100%);
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show { display: block; }
        .score-number { font-size: 2.5rem; font-weight: 700; color: var(--danger-red); }
        .score-label { color: var(--text-secondary); }

        .btn-retake {
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--danger-red) 0%, #F87171 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            cursor: pointer;
        }

        .lesson-footer { text-align: center; padding: 2rem; color: var(--text-secondary); font-size: 0.9rem; }
        .highlight { color: var(--accent-cyan); font-weight: 600; }
        .highlight-gold { color: var(--accent-gold); font-weight: 600; }
        .highlight-red { color: var(--danger-red); font-weight: 600; }
        .highlight-green { color: var(--success-green); font-weight: 600; }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="header-badge">🛡️ Tier 2 - Bài 6.1</span>
            <h1 class="lesson-title">Công Thức Tính Khối Lượng Lệnh</h1>
            <p class="lesson-subtitle">Position Sizing Formula</p>
        </header>

        <!-- Section 1: Tại Sao Position Sizing Quan Trọng -->
        <div class="content-card">
            <div class="card-header">
                <h2>🎯 Tại Sao Position Sizing Quan Trọng?</h2>
            </div>
            <div class="card-content">
                <p><span class="highlight-red">Position Sizing</span> (kích thước vị thế) là yếu tố quan trọng nhất trong quản lý rủi ro. Nó quyết định bạn sống sót hay cháy tài khoản.</p>

                <div class="info-box">
                    <div class="info-box-title">⚠️ Sự Thật Phũ Phàng</div>
                    <p><strong>90% trader thua</strong> không phải vì strategy sai, mà vì position sizing sai. Họ trade quá lớn, 1 trade thua = mất 10-20% tài khoản.</p>
                </div>

                <ul class="styled-list">
                    <li><strong>Trade quá lớn:</strong> 1 trade thua có thể destroy tài khoản</li>
                    <li><strong>Trade quá nhỏ:</strong> Lợi nhuận không đáng kể, mất motivation</li>
                    <li><strong>Position sizing đúng:</strong> Cho phép thua 10-20 trade liên tiếp mà vẫn sống</li>
                </ul>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/EF4444?text=Position+Sizing+Impact" alt="Position Sizing Impact">
                </div>
            </div>
        </div>

        <!-- Section 2: Quy Tắc 1-2% -->
        <div class="content-card">
            <div class="card-header">
                <h2>📐 Quy Tắc 1-2% Rủi Ro</h2>
            </div>
            <div class="card-content">
                <p>Quy tắc vàng trong trading: <span class="highlight-red">Không bao giờ rủi ro quá 2%</span> tài khoản trên một trade.</p>

                <div class="info-box success">
                    <div class="info-box-title">✅ Tại Sao 1-2%?</div>
                    <ul class="styled-list">
                        <li>Thua 10 trade liên tiếp = Chỉ mất ~20% tài khoản</li>
                        <li>Có thể phục hồi từ losing streak</li>
                        <li>Không bị stress quá mức ảnh hưởng judgment</li>
                        <li>Cho phép trade với tâm lý thoải mái</li>
                    </ul>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                    <thead>
                        <tr>
                            <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--danger-red); color: var(--danger-red);">% Risk</th>
                            <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--danger-red); color: var(--danger-red);">10 Trade Thua</th>
                            <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--danger-red); color: var(--danger-red);">Còn Lại</th>
                            <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--danger-red); color: var(--danger-red);">Đánh Giá</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">1%</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">-10%</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green);">90%</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green);">Tốt</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">2%</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">-18%</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green);">82%</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green);">OK</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">5%</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">-40%</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--accent-gold);">60%</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--accent-gold);">Nguy Hiểm</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; text-align: center;">10%</td>
                            <td style="padding: 0.75rem; text-align: center;">-65%</td>
                            <td style="padding: 0.75rem; text-align: center; color: var(--danger-red);">35%</td>
                            <td style="padding: 0.75rem; text-align: center; color: var(--danger-red);">Cháy TK</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Section 3: Công Thức -->
        <div class="content-card">
            <div class="card-header">
                <h2>📊 Công Thức Tính Khối Lượng</h2>
            </div>
            <div class="card-content">
                <div class="formula-box">
                    <div class="formula-title">🔥 CÔNG THỨC POSITION SIZING</div>
                    <div class="formula-text">
                        Khối Lượng = (Tài Khoản × Rủi Ro%) / (Entry - Stop)
                    </div>
                </div>

                <p><span class="highlight">Giải thích các thành phần:</span></p>
                <ul class="styled-list">
                    <li><strong>Tài Khoản:</strong> Số dư hiện tại (USD)</li>
                    <li><strong>Rủi Ro%:</strong> % tài khoản bạn chấp nhận mất (1-2%)</li>
                    <li><strong>Entry:</strong> Giá vào lệnh</li>
                    <li><strong>Stop:</strong> Giá stop loss</li>
                    <li><strong>Khối Lượng:</strong> Số lượng coin/contract để trade</li>
                </ul>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/00F0FF?text=Position+Sizing+Formula" alt="Position Sizing Formula">
                </div>
            </div>
        </div>

        <!-- Section 4: Ví Dụ Thực Tế -->
        <div class="content-card">
            <div class="card-header">
                <h2>📝 Ví Dụ Tính Toán Thực Tế</h2>
            </div>
            <div class="card-content">
                <p><span class="highlight-gold">Ví dụ 1:</span> Long BTC tại LFZ</p>

                <div class="calc-example">
                    <div class="calc-row">
                        <span class="calc-label">Tài Khoản:</span>
                        <span class="calc-value">$10,000</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Rủi Ro (2%):</span>
                        <span class="calc-value">$200</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Entry Price:</span>
                        <span class="calc-value">$42,000</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Stop Loss:</span>
                        <span class="calc-value">$41,500 (dưới LFZ)</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Risk per Unit:</span>
                        <span class="calc-value">$500</span>
                    </div>
                    <div class="calc-row" style="border-top: 2px solid var(--success-green); margin-top: 0.5rem; padding-top: 0.75rem;">
                        <span class="calc-label"><strong>Khối Lượng:</strong></span>
                        <span class="calc-result">$200 / $500 = 0.4 BTC</span>
                    </div>
                </div>

                <p><span class="highlight-gold">Ví dụ 2:</span> Short ETH tại HFZ</p>

                <div class="calc-example">
                    <div class="calc-row">
                        <span class="calc-label">Tài Khoản:</span>
                        <span class="calc-value">$5,000</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Rủi Ro (1%):</span>
                        <span class="calc-value">$50</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Entry Price:</span>
                        <span class="calc-value">$2,500</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Stop Loss:</span>
                        <span class="calc-value">$2,550 (trên HFZ)</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Risk per Unit:</span>
                        <span class="calc-value">$50</span>
                    </div>
                    <div class="calc-row" style="border-top: 2px solid var(--success-green); margin-top: 0.5rem; padding-top: 0.75rem;">
                        <span class="calc-label"><strong>Khối Lượng:</strong></span>
                        <span class="calc-result">$50 / $50 = 1 ETH</span>
                    </div>
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Pro Tip</div>
                    <p>Sử dụng Position Size Calculator trong GEM Scanner App để tính tự động. Chỉ cần nhập Entry và SL, app sẽ tính khối lượng cho bạn!</p>
                </div>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Quy tắc vàng: <strong>Không rủi ro quá 1-2%</strong> tài khoản/trade</li>
                <li>Công thức: <strong>Khối Lượng = (TK × Risk%) / (Entry - Stop)</strong></li>
                <li>Position sizing đúng cho phép sống sót qua <strong>losing streaks</strong></li>
                <li>Trade quá lớn = <strong>con đường nhanh nhất</strong> đến cháy tài khoản</li>
                <li>Sử dụng <strong>calculator tools</strong> để tính chính xác</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="1">
                <p>1. Theo quy tắc 2%, với tài khoản $10,000, bạn có thể rủi ro tối đa bao nhiêu mỗi trade?</p>
                <button class="quiz-option" data-index="0">$100</button>
                <button class="quiz-option" data-index="1">$200</button>
                <button class="quiz-option" data-index="2">$500</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p>2. Với TK $5,000, Risk 2% ($100), Entry $100, SL $95, khối lượng là bao nhiêu?</p>
                <button class="quiz-option" data-index="0">10 đơn vị</button>
                <button class="quiz-option" data-index="1">15 đơn vị</button>
                <button class="quiz-option" data-index="2">20 đơn vị</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p>3. Tại sao 90% trader thua lỗ?</p>
                <button class="quiz-option" data-index="0">Position sizing sai, trade quá lớn</button>
                <button class="quiz-option" data-index="1">Strategy sai</button>
                <button class="quiz-option" data-index="2">Không đủ vốn</button>
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
    <title>Bài 6.1: Công Thức Tính Khối Lượng Lệnh - Tier 2</title>
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

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
        }

        .lesson-container { max-width: 800px; margin: 0 auto; padding: 1rem; }

        @media (max-width: 600px) { .lesson-container { padding: 0; } }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem;
            margin-bottom: 1.5rem;
            border-radius: 16px;
            text-align: center;
        }

        @media (max-width: 600px) { .lesson-header { border-radius: 0; padding: 1.5rem 1rem; } }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--danger-red) 0%, #F87171 100%);
            color: white;
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 1rem;
        }

        .lesson-title { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: var(--text-secondary); font-size: 1rem; }

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
                border-left: 4px solid var(--danger-red);
                border-right: none;
                border-top: none;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
        }

        .card-header {
            background: rgba(239, 68, 68, 0.1);
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) { .card-header { padding: 1rem; } }

        .card-header h2 { font-size: 1.25rem; color: var(--danger-red); }

        .card-content { padding: 1.5rem; }
        @media (max-width: 600px) { .card-content { padding: 1rem; } }
        .card-content p { margin-bottom: 1rem; color: var(--text-secondary); }

        .image-placeholder {
            width: 100%;
            background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
            border-radius: 8px;
            margin: 1rem 0;
            overflow: hidden;
        }

        @media (max-width: 600px) {
            .image-placeholder { border-radius: 0; margin: 1rem -1rem; width: calc(100% + 2rem); }
        }

        .image-placeholder img { width: 100%; height: auto; display: block; }

        .info-box {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) { .info-box { border-radius: 4px; } }

        .info-box.success { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3); }
        .info-box.warning { background: rgba(255, 189, 89, 0.1); border-color: rgba(255, 189, 89, 0.3); }
        .info-box.cyan { background: rgba(0, 240, 255, 0.1); border-color: rgba(0, 240, 255, 0.3); }

        .info-box-title { font-weight: 600; margin-bottom: 0.5rem; color: var(--danger-red); }
        .info-box.success .info-box-title { color: var(--success-green); }
        .info-box.warning .info-box-title { color: var(--accent-gold); }
        .info-box.cyan .info-box-title { color: var(--accent-cyan); }

        .styled-list { list-style: none; padding: 0; }
        .styled-list li {
            padding: 0.75rem 0;
            padding-left: 2rem;
            position: relative;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            color: var(--text-secondary);
        }
        .styled-list li:last-child { border-bottom: none; }
        .styled-list li::before {
            content: ''→'';
            position: absolute;
            left: 0;
            color: var(--danger-red);
            font-weight: bold;
        }

        /* Formula Box */
        .formula-box {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(106, 91, 255, 0.1) 100%);
            border: 2px solid var(--danger-red);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        .formula-title { color: var(--danger-red); font-weight: 700; margin-bottom: 1rem; }
        .formula-text {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-primary);
            background: rgba(0,0,0,0.3);
            padding: 1rem;
            border-radius: 8px;
            font-family: monospace;
        }

        /* Calculator Example */
        .calc-example {
            background: var(--bg-card-hover);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .calc-example { border-radius: 0; margin: 1rem -1rem; padding: 1rem; width: calc(100% + 2rem); }
        }

        .calc-row {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .calc-row:last-child { border-bottom: none; }
        .calc-label { color: var(--text-secondary); }
        .calc-value { font-weight: 600; color: var(--accent-cyan); }
        .calc-result { color: var(--success-green); font-size: 1.25rem; }

        /* Summary Box */
        .summary-box {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(106, 91, 255, 0.1) 100%);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                border-left: 4px solid var(--danger-red);
                border-right: none;
                border-top: none;
                border-bottom: none;
            }
        }

        .summary-box h3 { color: var(--danger-red); margin-bottom: 1rem; }
        .summary-list { list-style: none; padding: 0; }
        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }
        .summary-list li::before { content: ''✓''; position: absolute; left: 0; color: var(--success-green); }

        /* Quiz Section */
        .quiz-section {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 600px) { .quiz-section { border-radius: 0; padding: 1rem; margin-top: 1rem; } }

        .quiz-section h3 { color: var(--accent-gold); margin-bottom: 1.5rem; }

        .quiz-question {
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }
        .quiz-question p { font-weight: 600; margin-bottom: 1rem; }

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
            text-align: left;
            transition: all 0.3s ease;
        }

        .quiz-option:hover { background: rgba(255,255,255,0.1); border-color: var(--danger-red); }
        .quiz-option.correct { background: rgba(16, 185, 129, 0.2); border-color: var(--success-green); }
        .quiz-option.incorrect { background: rgba(239, 68, 68, 0.2); border-color: var(--danger-red); }

        .quiz-result { padding: 1rem; border-radius: 8px; margin-top: 0.5rem; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.1); color: var(--success-green); }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.1); color: var(--danger-red); }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(106, 91, 255, 0.1) 100%);
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-score.show { display: block; }
        .score-number { font-size: 2.5rem; font-weight: 700; color: var(--danger-red); }
        .score-label { color: var(--text-secondary); }

        .btn-retake {
            margin-top: 1rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--danger-red) 0%, #F87171 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            cursor: pointer;
        }

        .lesson-footer { text-align: center; padding: 2rem; color: var(--text-secondary); font-size: 0.9rem; }
        .highlight { color: var(--accent-cyan); font-weight: 600; }
        .highlight-gold { color: var(--accent-gold); font-weight: 600; }
        .highlight-red { color: var(--danger-red); font-weight: 600; }
        .highlight-green { color: var(--success-green); font-weight: 600; }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="header-badge">🛡️ Tier 2 - Bài 6.1</span>
            <h1 class="lesson-title">Công Thức Tính Khối Lượng Lệnh</h1>
            <p class="lesson-subtitle">Position Sizing Formula</p>
        </header>

        <!-- Section 1: Tại Sao Position Sizing Quan Trọng -->
        <div class="content-card">
            <div class="card-header">
                <h2>🎯 Tại Sao Position Sizing Quan Trọng?</h2>
            </div>
            <div class="card-content">
                <p><span class="highlight-red">Position Sizing</span> (kích thước vị thế) là yếu tố quan trọng nhất trong quản lý rủi ro. Nó quyết định bạn sống sót hay cháy tài khoản.</p>

                <div class="info-box">
                    <div class="info-box-title">⚠️ Sự Thật Phũ Phàng</div>
                    <p><strong>90% trader thua</strong> không phải vì strategy sai, mà vì position sizing sai. Họ trade quá lớn, 1 trade thua = mất 10-20% tài khoản.</p>
                </div>

                <ul class="styled-list">
                    <li><strong>Trade quá lớn:</strong> 1 trade thua có thể destroy tài khoản</li>
                    <li><strong>Trade quá nhỏ:</strong> Lợi nhuận không đáng kể, mất motivation</li>
                    <li><strong>Position sizing đúng:</strong> Cho phép thua 10-20 trade liên tiếp mà vẫn sống</li>
                </ul>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/EF4444?text=Position+Sizing+Impact" alt="Position Sizing Impact">
                </div>
            </div>
        </div>

        <!-- Section 2: Quy Tắc 1-2% -->
        <div class="content-card">
            <div class="card-header">
                <h2>📐 Quy Tắc 1-2% Rủi Ro</h2>
            </div>
            <div class="card-content">
                <p>Quy tắc vàng trong trading: <span class="highlight-red">Không bao giờ rủi ro quá 2%</span> tài khoản trên một trade.</p>

                <div class="info-box success">
                    <div class="info-box-title">✅ Tại Sao 1-2%?</div>
                    <ul class="styled-list">
                        <li>Thua 10 trade liên tiếp = Chỉ mất ~20% tài khoản</li>
                        <li>Có thể phục hồi từ losing streak</li>
                        <li>Không bị stress quá mức ảnh hưởng judgment</li>
                        <li>Cho phép trade với tâm lý thoải mái</li>
                    </ul>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                    <thead>
                        <tr>
                            <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--danger-red); color: var(--danger-red);">% Risk</th>
                            <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--danger-red); color: var(--danger-red);">10 Trade Thua</th>
                            <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--danger-red); color: var(--danger-red);">Còn Lại</th>
                            <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--danger-red); color: var(--danger-red);">Đánh Giá</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">1%</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">-10%</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green);">90%</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green);">Tốt</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">2%</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">-18%</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green);">82%</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--success-green);">OK</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">5%</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">-40%</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--accent-gold);">60%</td>
                            <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--accent-gold);">Nguy Hiểm</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; text-align: center;">10%</td>
                            <td style="padding: 0.75rem; text-align: center;">-65%</td>
                            <td style="padding: 0.75rem; text-align: center; color: var(--danger-red);">35%</td>
                            <td style="padding: 0.75rem; text-align: center; color: var(--danger-red);">Cháy TK</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Section 3: Công Thức -->
        <div class="content-card">
            <div class="card-header">
                <h2>📊 Công Thức Tính Khối Lượng</h2>
            </div>
            <div class="card-content">
                <div class="formula-box">
                    <div class="formula-title">🔥 CÔNG THỨC POSITION SIZING</div>
                    <div class="formula-text">
                        Khối Lượng = (Tài Khoản × Rủi Ro%) / (Entry - Stop)
                    </div>
                </div>

                <p><span class="highlight">Giải thích các thành phần:</span></p>
                <ul class="styled-list">
                    <li><strong>Tài Khoản:</strong> Số dư hiện tại (USD)</li>
                    <li><strong>Rủi Ro%:</strong> % tài khoản bạn chấp nhận mất (1-2%)</li>
                    <li><strong>Entry:</strong> Giá vào lệnh</li>
                    <li><strong>Stop:</strong> Giá stop loss</li>
                    <li><strong>Khối Lượng:</strong> Số lượng coin/contract để trade</li>
                </ul>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/00F0FF?text=Position+Sizing+Formula" alt="Position Sizing Formula">
                </div>
            </div>
        </div>

        <!-- Section 4: Ví Dụ Thực Tế -->
        <div class="content-card">
            <div class="card-header">
                <h2>📝 Ví Dụ Tính Toán Thực Tế</h2>
            </div>
            <div class="card-content">
                <p><span class="highlight-gold">Ví dụ 1:</span> Long BTC tại LFZ</p>

                <div class="calc-example">
                    <div class="calc-row">
                        <span class="calc-label">Tài Khoản:</span>
                        <span class="calc-value">$10,000</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Rủi Ro (2%):</span>
                        <span class="calc-value">$200</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Entry Price:</span>
                        <span class="calc-value">$42,000</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Stop Loss:</span>
                        <span class="calc-value">$41,500 (dưới LFZ)</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Risk per Unit:</span>
                        <span class="calc-value">$500</span>
                    </div>
                    <div class="calc-row" style="border-top: 2px solid var(--success-green); margin-top: 0.5rem; padding-top: 0.75rem;">
                        <span class="calc-label"><strong>Khối Lượng:</strong></span>
                        <span class="calc-result">$200 / $500 = 0.4 BTC</span>
                    </div>
                </div>

                <p><span class="highlight-gold">Ví dụ 2:</span> Short ETH tại HFZ</p>

                <div class="calc-example">
                    <div class="calc-row">
                        <span class="calc-label">Tài Khoản:</span>
                        <span class="calc-value">$5,000</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Rủi Ro (1%):</span>
                        <span class="calc-value">$50</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Entry Price:</span>
                        <span class="calc-value">$2,500</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Stop Loss:</span>
                        <span class="calc-value">$2,550 (trên HFZ)</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Risk per Unit:</span>
                        <span class="calc-value">$50</span>
                    </div>
                    <div class="calc-row" style="border-top: 2px solid var(--success-green); margin-top: 0.5rem; padding-top: 0.75rem;">
                        <span class="calc-label"><strong>Khối Lượng:</strong></span>
                        <span class="calc-result">$50 / $50 = 1 ETH</span>
                    </div>
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Pro Tip</div>
                    <p>Sử dụng Position Size Calculator trong GEM Scanner App để tính tự động. Chỉ cần nhập Entry và SL, app sẽ tính khối lượng cho bạn!</p>
                </div>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Quy tắc vàng: <strong>Không rủi ro quá 1-2%</strong> tài khoản/trade</li>
                <li>Công thức: <strong>Khối Lượng = (TK × Risk%) / (Entry - Stop)</strong></li>
                <li>Position sizing đúng cho phép sống sót qua <strong>losing streaks</strong></li>
                <li>Trade quá lớn = <strong>con đường nhanh nhất</strong> đến cháy tài khoản</li>
                <li>Sử dụng <strong>calculator tools</strong> để tính chính xác</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="1">
                <p>1. Theo quy tắc 2%, với tài khoản $10,000, bạn có thể rủi ro tối đa bao nhiêu mỗi trade?</p>
                <button class="quiz-option" data-index="0">$100</button>
                <button class="quiz-option" data-index="1">$200</button>
                <button class="quiz-option" data-index="2">$500</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p>2. Với TK $5,000, Risk 2% ($100), Entry $100, SL $95, khối lượng là bao nhiêu?</p>
                <button class="quiz-option" data-index="0">10 đơn vị</button>
                <button class="quiz-option" data-index="1">15 đơn vị</button>
                <button class="quiz-option" data-index="2">20 đơn vị</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p>3. Tại sao 90% trader thua lỗ?</p>
                <button class="quiz-option" data-index="0">Position sizing sai, trade quá lớn</button>
                <button class="quiz-option" data-index="1">Strategy sai</button>
                <button class="quiz-option" data-index="2">Không đủ vốn</button>
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

-- Lesson 6.2: Đặt Stop Loss Đúng Cách - Tier 2
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch6-l2',
  'module-tier-2-ch6',
  'course-tier2-trading-advanced',
  'Bài 6.2: Đặt Stop Loss Đúng Cách - Tier 2',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 6.2: Đặt Stop Loss Đúng Cách - Tier 2</title>
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

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.6;
        }

        .lesson-container { max-width: 800px; margin: 0 auto; padding: 1rem; }
        @media (max-width: 600px) { .lesson-container { padding: 0; } }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem;
            margin-bottom: 1.5rem;
            border-radius: 16px;
            text-align: center;
        }
        @media (max-width: 600px) { .lesson-header { border-radius: 0; padding: 1.5rem 1rem; } }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--danger-red) 0%, #F87171 100%);
            color: white;
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .lesson-title { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: var(--text-secondary); }

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
                border-left: 4px solid var(--danger-red);
                border-right: none; border-top: none;
            }
        }

        .card-header {
            background: rgba(239, 68, 68, 0.1);
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        @media (max-width: 600px) { .card-header { padding: 1rem; } }
        .card-header h2 { font-size: 1.25rem; color: var(--danger-red); }

        .card-content { padding: 1.5rem; }
        @media (max-width: 600px) { .card-content { padding: 1rem; } }
        .card-content p { margin-bottom: 1rem; color: var(--text-secondary); }

        .image-placeholder {
            width: 100%; background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
            border-radius: 8px; margin: 1rem 0; overflow: hidden;
        }
        @media (max-width: 600px) { .image-placeholder { border-radius: 0; margin: 1rem -1rem; width: calc(100% + 2rem); } }
        .image-placeholder img { width: 100%; height: auto; display: block; }

        .info-box {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px; padding: 1rem; margin: 1rem 0;
        }
        @media (max-width: 600px) { .info-box { border-radius: 4px; } }
        .info-box.success { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3); }
        .info-box.warning { background: rgba(255, 189, 89, 0.1); border-color: rgba(255, 189, 89, 0.3); }

        .info-box-title { font-weight: 600; margin-bottom: 0.5rem; color: var(--danger-red); }
        .info-box.success .info-box-title { color: var(--success-green); }
        .info-box.warning .info-box-title { color: var(--accent-gold); }

        .styled-list { list-style: none; padding: 0; }
        .styled-list li {
            padding: 0.75rem 0; padding-left: 2rem; position: relative;
            border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--text-secondary);
        }
        .styled-list li:last-child { border-bottom: none; }
        .styled-list li::before { content: ''→''; position: absolute; left: 0; color: var(--danger-red); font-weight: bold; }

        /* Rules Grid */
        .rules-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        @media (max-width: 600px) {
            .rules-grid { grid-template-columns: 1fr; gap: 1px; background: rgba(255,255,255,0.1); margin: 1rem -1rem; width: calc(100% + 2rem); }
        }

        .rule-card {
            background: var(--bg-card-hover); border-radius: 8px; padding: 1rem;
            border-left: 3px solid var(--danger-red);
        }
        @media (max-width: 600px) { .rule-card { border-radius: 0; } }

        .rule-card.do { border-left-color: var(--success-green); }
        .rule-card.dont { border-left-color: var(--danger-red); }

        .rule-title { font-weight: 700; margin-bottom: 0.5rem; }
        .rule-card.do .rule-title { color: var(--success-green); }
        .rule-card.dont .rule-title { color: var(--danger-red); }

        .rule-desc { color: var(--text-secondary); font-size: 0.9rem; }

        .summary-box {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(106, 91, 255, 0.1) 100%);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0;
        }
        @media (max-width: 600px) {
            .summary-box { border-radius: 0; border-left: 4px solid var(--danger-red); border-right: none; border-top: none; border-bottom: none; }
        }
        .summary-box h3 { color: var(--danger-red); margin-bottom: 1rem; }
        .summary-list { list-style: none; padding: 0; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; color: var(--text-secondary); }
        .summary-list li::before { content: ''✓''; position: absolute; left: 0; color: var(--success-green); }

        .quiz-section {
            background: var(--bg-card); border-radius: 12px; padding: 1.5rem;
            margin-top: 2rem; border: 1px solid rgba(255,255,255,0.1);
        }
        @media (max-width: 600px) { .quiz-section { border-radius: 0; padding: 1rem; margin-top: 1rem; } }
        .quiz-section h3 { color: var(--accent-gold); margin-bottom: 1.5rem; }

        .quiz-question { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
        .quiz-question p { font-weight: 600; margin-bottom: 1rem; }

        .quiz-option {
            display: block; width: 100%; padding: 0.75rem 1rem; margin-bottom: 0.5rem;
            background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px; color: var(--text-primary); cursor: pointer; text-align: left;
        }
        .quiz-option:hover { background: rgba(255,255,255,0.1); border-color: var(--danger-red); }
        .quiz-option.correct { background: rgba(16, 185, 129, 0.2); border-color: var(--success-green); }
        .quiz-option.incorrect { background: rgba(239, 68, 68, 0.2); border-color: var(--danger-red); }

        .quiz-result { padding: 1rem; border-radius: 8px; margin-top: 0.5rem; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.1); color: var(--success-green); }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.1); color: var(--danger-red); }

        .quiz-score {
            text-align: center; padding: 1.5rem;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(106, 91, 255, 0.1) 100%);
            border-radius: 12px; margin-top: 1rem; display: none;
        }
        .quiz-score.show { display: block; }
        .score-number { font-size: 2.5rem; font-weight: 700; color: var(--danger-red); }
        .score-label { color: var(--text-secondary); }
        .btn-retake {
            margin-top: 1rem; padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--danger-red) 0%, #F87171 100%);
            border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;
        }

        .lesson-footer { text-align: center; padding: 2rem; color: var(--text-secondary); font-size: 0.9rem; }
        .highlight-red { color: var(--danger-red); font-weight: 600; }
        .highlight-green { color: var(--success-green); font-weight: 600; }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="header-badge">🛡️ Tier 2 - Bài 6.2</span>
            <h1 class="lesson-title">Đặt Stop Loss Đúng Cách</h1>
            <p class="lesson-subtitle">Proper Stop Loss Placement</p>
        </header>

        <!-- Section 1: Tầm Quan Trọng Stop Loss -->
        <div class="content-card">
            <div class="card-header">
                <h2>🎯 Stop Loss - Bảo Hiểm Tài Khoản</h2>
            </div>
            <div class="card-content">
                <p><span class="highlight-red">Stop Loss</span> là công cụ bảo vệ quan trọng nhất. Nó giới hạn thua lỗ khi market đi ngược dự đoán.</p>

                <div class="info-box">
                    <div class="info-box-title">⚠️ Không Có SL = Gambling</div>
                    <p>Trade không có SL giống như lái xe không có phanh. Có thể đi được một lúc, nhưng tai nạn là chắc chắn!</p>
                </div>

                <ul class="styled-list">
                    <li><strong>SL bảo vệ vốn:</strong> Giới hạn loss ở mức chấp nhận được</li>
                    <li><strong>SL loại bỏ emotion:</strong> Không cần quyết định khi đang thua</li>
                    <li><strong>SL cho phép sleep:</strong> Market 24/7 nhưng bạn cần nghỉ ngơi</li>
                </ul>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/EF4444?text=Stop+Loss+Protection" alt="Stop Loss Protection">
                </div>
            </div>
        </div>

        <!-- Section 2: Quy Tắc Đặt SL -->
        <div class="content-card">
            <div class="card-header">
                <h2>📐 Quy Tắc Đặt Stop Loss</h2>
            </div>
            <div class="card-content">
                <p>GEM khuyến nghị đặt SL theo nguyên tắc <span class="highlight-red">"Ngoài Zone + Buffer"</span>:</p>

                <div class="rules-grid">
                    <div class="rule-card do">
                        <div class="rule-title">✅ LONG Position</div>
                        <div class="rule-desc">Đặt SL <strong>DƯỚI</strong> LFZ + buffer 0.5%.<br>Ví dụ: LFZ $42,000-$42,500 → SL $41,790</div>
                    </div>
                    <div class="rule-card do">
                        <div class="rule-title">✅ SHORT Position</div>
                        <div class="rule-desc">Đặt SL <strong>TRÊN</strong> HFZ + buffer 0.5%.<br>Ví dụ: HFZ $2,450-$2,500 → SL $2,512</div>
                    </div>
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Buffer 0.5% - Tại Sao?</div>
                    <ul class="styled-list">
                        <li>Tránh bị "stop hunt" bởi wicks</li>
                        <li>Cho phép giá test zone edge</li>
                        <li>Không quá xa để RR vẫn tốt</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/10B981?text=SL+Below+Zone+%2B+Buffer" alt="SL Placement">
                </div>
            </div>
        </div>

        <!-- Section 3: DO và DON''T -->
        <div class="content-card">
            <div class="card-header">
                <h2>✅❌ DO & DON''T với Stop Loss</h2>
            </div>
            <div class="card-content">
                <div class="rules-grid">
                    <div class="rule-card do">
                        <div class="rule-title">✅ DO: Đặt SL trước khi Entry</div>
                        <div class="rule-desc">Luôn biết SL ở đâu TRƯỚC khi vào lệnh. Không entry nếu không xác định được SL hợp lý.</div>
                    </div>
                    <div class="rule-card dont">
                        <div class="rule-title">❌ DON''T: Mở rộng SL</div>
                        <div class="rule-desc">KHÔNG BAO GIỜ di chuyển SL xa hơn sau khi entry. Đây là lỗi phổ biến nhất!</div>
                    </div>
                    <div class="rule-card do">
                        <div class="rule-title">✅ DO: Di chuyển SL gần hơn</div>
                        <div class="rule-desc">Trailing SL lên breakeven hoặc lock profit khi trade đang thắng.</div>
                    </div>
                    <div class="rule-card dont">
                        <div class="rule-title">❌ DON''T: Trade không SL</div>
                        <div class="rule-desc">Mọi trade PHẢI có SL. "Mental stop" không đáng tin cậy khi có emotion.</div>
                    </div>
                </div>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Trailing Stop Rules</div>
                    <ul class="styled-list">
                        <li><strong>Sau TP1 hit:</strong> Move SL lên breakeven</li>
                        <li><strong>Giá tạo HH/HL mới:</strong> Trail SL theo structure</li>
                        <li><strong>Không trail quá chặt:</strong> Cho phép pullback nhỏ</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/FFBD59?text=Trailing+Stop+Example" alt="Trailing Stop">
                </div>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>SL = <strong>Bảo hiểm tài khoản</strong>, không trade nếu không có SL</li>
                <li>Đặt SL <strong>ngoài zone + buffer 0.5%</strong></li>
                <li><strong>KHÔNG BAO GIỜ</strong> mở rộng SL sau khi entry</li>
                <li>CHỈ di chuyển SL <strong>gần hơn</strong> (trailing stop)</li>
                <li>SL phải được xác định <strong>TRƯỚC khi entry</strong></li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="0">
                <p>1. Với Long position tại LFZ $42,000-$42,500, SL nên đặt ở đâu?</p>
                <button class="quiz-option" data-index="0">Dưới LFZ + buffer (~$41,790)</button>
                <button class="quiz-option" data-index="1">Ngay tại $42,000</button>
                <button class="quiz-option" data-index="2">Trên LFZ</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p>2. Khi trade đang thua và giá gần SL, bạn nên làm gì?</p>
                <button class="quiz-option" data-index="0">Mở rộng SL để không bị hit</button>
                <button class="quiz-option" data-index="1">Để SL nguyên, chấp nhận thua nếu hit</button>
                <button class="quiz-option" data-index="2">Cancel SL và hy vọng giá quay lại</button>
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
                question.querySelectorAll(''.quiz-option'').forEach(opt => opt.classList.remove(''correct'', ''incorrect''));
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
    <title>Bài 6.2: Đặt Stop Loss Đúng Cách - Tier 2</title>
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

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.6;
        }

        .lesson-container { max-width: 800px; margin: 0 auto; padding: 1rem; }
        @media (max-width: 600px) { .lesson-container { padding: 0; } }

        .lesson-header {
            background: linear-gradient(135deg, var(--primary-navy) 0%, #1a3a7a 100%);
            padding: 2rem;
            margin-bottom: 1.5rem;
            border-radius: 16px;
            text-align: center;
        }
        @media (max-width: 600px) { .lesson-header { border-radius: 0; padding: 1.5rem 1rem; } }

        .header-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--danger-red) 0%, #F87171 100%);
            color: white;
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .lesson-title { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: var(--text-secondary); }

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
                border-left: 4px solid var(--danger-red);
                border-right: none; border-top: none;
            }
        }

        .card-header {
            background: rgba(239, 68, 68, 0.1);
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        @media (max-width: 600px) { .card-header { padding: 1rem; } }
        .card-header h2 { font-size: 1.25rem; color: var(--danger-red); }

        .card-content { padding: 1.5rem; }
        @media (max-width: 600px) { .card-content { padding: 1rem; } }
        .card-content p { margin-bottom: 1rem; color: var(--text-secondary); }

        .image-placeholder {
            width: 100%; background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
            border-radius: 8px; margin: 1rem 0; overflow: hidden;
        }
        @media (max-width: 600px) { .image-placeholder { border-radius: 0; margin: 1rem -1rem; width: calc(100% + 2rem); } }
        .image-placeholder img { width: 100%; height: auto; display: block; }

        .info-box {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px; padding: 1rem; margin: 1rem 0;
        }
        @media (max-width: 600px) { .info-box { border-radius: 4px; } }
        .info-box.success { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3); }
        .info-box.warning { background: rgba(255, 189, 89, 0.1); border-color: rgba(255, 189, 89, 0.3); }

        .info-box-title { font-weight: 600; margin-bottom: 0.5rem; color: var(--danger-red); }
        .info-box.success .info-box-title { color: var(--success-green); }
        .info-box.warning .info-box-title { color: var(--accent-gold); }

        .styled-list { list-style: none; padding: 0; }
        .styled-list li {
            padding: 0.75rem 0; padding-left: 2rem; position: relative;
            border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--text-secondary);
        }
        .styled-list li:last-child { border-bottom: none; }
        .styled-list li::before { content: ''→''; position: absolute; left: 0; color: var(--danger-red); font-weight: bold; }

        /* Rules Grid */
        .rules-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        @media (max-width: 600px) {
            .rules-grid { grid-template-columns: 1fr; gap: 1px; background: rgba(255,255,255,0.1); margin: 1rem -1rem; width: calc(100% + 2rem); }
        }

        .rule-card {
            background: var(--bg-card-hover); border-radius: 8px; padding: 1rem;
            border-left: 3px solid var(--danger-red);
        }
        @media (max-width: 600px) { .rule-card { border-radius: 0; } }

        .rule-card.do { border-left-color: var(--success-green); }
        .rule-card.dont { border-left-color: var(--danger-red); }

        .rule-title { font-weight: 700; margin-bottom: 0.5rem; }
        .rule-card.do .rule-title { color: var(--success-green); }
        .rule-card.dont .rule-title { color: var(--danger-red); }

        .rule-desc { color: var(--text-secondary); font-size: 0.9rem; }

        .summary-box {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(106, 91, 255, 0.1) 100%);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0;
        }
        @media (max-width: 600px) {
            .summary-box { border-radius: 0; border-left: 4px solid var(--danger-red); border-right: none; border-top: none; border-bottom: none; }
        }
        .summary-box h3 { color: var(--danger-red); margin-bottom: 1rem; }
        .summary-list { list-style: none; padding: 0; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; color: var(--text-secondary); }
        .summary-list li::before { content: ''✓''; position: absolute; left: 0; color: var(--success-green); }

        .quiz-section {
            background: var(--bg-card); border-radius: 12px; padding: 1.5rem;
            margin-top: 2rem; border: 1px solid rgba(255,255,255,0.1);
        }
        @media (max-width: 600px) { .quiz-section { border-radius: 0; padding: 1rem; margin-top: 1rem; } }
        .quiz-section h3 { color: var(--accent-gold); margin-bottom: 1.5rem; }

        .quiz-question { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
        .quiz-question p { font-weight: 600; margin-bottom: 1rem; }

        .quiz-option {
            display: block; width: 100%; padding: 0.75rem 1rem; margin-bottom: 0.5rem;
            background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px; color: var(--text-primary); cursor: pointer; text-align: left;
        }
        .quiz-option:hover { background: rgba(255,255,255,0.1); border-color: var(--danger-red); }
        .quiz-option.correct { background: rgba(16, 185, 129, 0.2); border-color: var(--success-green); }
        .quiz-option.incorrect { background: rgba(239, 68, 68, 0.2); border-color: var(--danger-red); }

        .quiz-result { padding: 1rem; border-radius: 8px; margin-top: 0.5rem; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.1); color: var(--success-green); }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.1); color: var(--danger-red); }

        .quiz-score {
            text-align: center; padding: 1.5rem;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(106, 91, 255, 0.1) 100%);
            border-radius: 12px; margin-top: 1rem; display: none;
        }
        .quiz-score.show { display: block; }
        .score-number { font-size: 2.5rem; font-weight: 700; color: var(--danger-red); }
        .score-label { color: var(--text-secondary); }
        .btn-retake {
            margin-top: 1rem; padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--danger-red) 0%, #F87171 100%);
            border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;
        }

        .lesson-footer { text-align: center; padding: 2rem; color: var(--text-secondary); font-size: 0.9rem; }
        .highlight-red { color: var(--danger-red); font-weight: 600; }
        .highlight-green { color: var(--success-green); font-weight: 600; }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="header-badge">🛡️ Tier 2 - Bài 6.2</span>
            <h1 class="lesson-title">Đặt Stop Loss Đúng Cách</h1>
            <p class="lesson-subtitle">Proper Stop Loss Placement</p>
        </header>

        <!-- Section 1: Tầm Quan Trọng Stop Loss -->
        <div class="content-card">
            <div class="card-header">
                <h2>🎯 Stop Loss - Bảo Hiểm Tài Khoản</h2>
            </div>
            <div class="card-content">
                <p><span class="highlight-red">Stop Loss</span> là công cụ bảo vệ quan trọng nhất. Nó giới hạn thua lỗ khi market đi ngược dự đoán.</p>

                <div class="info-box">
                    <div class="info-box-title">⚠️ Không Có SL = Gambling</div>
                    <p>Trade không có SL giống như lái xe không có phanh. Có thể đi được một lúc, nhưng tai nạn là chắc chắn!</p>
                </div>

                <ul class="styled-list">
                    <li><strong>SL bảo vệ vốn:</strong> Giới hạn loss ở mức chấp nhận được</li>
                    <li><strong>SL loại bỏ emotion:</strong> Không cần quyết định khi đang thua</li>
                    <li><strong>SL cho phép sleep:</strong> Market 24/7 nhưng bạn cần nghỉ ngơi</li>
                </ul>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/EF4444?text=Stop+Loss+Protection" alt="Stop Loss Protection">
                </div>
            </div>
        </div>

        <!-- Section 2: Quy Tắc Đặt SL -->
        <div class="content-card">
            <div class="card-header">
                <h2>📐 Quy Tắc Đặt Stop Loss</h2>
            </div>
            <div class="card-content">
                <p>GEM khuyến nghị đặt SL theo nguyên tắc <span class="highlight-red">"Ngoài Zone + Buffer"</span>:</p>

                <div class="rules-grid">
                    <div class="rule-card do">
                        <div class="rule-title">✅ LONG Position</div>
                        <div class="rule-desc">Đặt SL <strong>DƯỚI</strong> LFZ + buffer 0.5%.<br>Ví dụ: LFZ $42,000-$42,500 → SL $41,790</div>
                    </div>
                    <div class="rule-card do">
                        <div class="rule-title">✅ SHORT Position</div>
                        <div class="rule-desc">Đặt SL <strong>TRÊN</strong> HFZ + buffer 0.5%.<br>Ví dụ: HFZ $2,450-$2,500 → SL $2,512</div>
                    </div>
                </div>

                <div class="info-box success">
                    <div class="info-box-title">✅ Buffer 0.5% - Tại Sao?</div>
                    <ul class="styled-list">
                        <li>Tránh bị "stop hunt" bởi wicks</li>
                        <li>Cho phép giá test zone edge</li>
                        <li>Không quá xa để RR vẫn tốt</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x400/112250/10B981?text=SL+Below+Zone+%2B+Buffer" alt="SL Placement">
                </div>
            </div>
        </div>

        <!-- Section 3: DO và DON''T -->
        <div class="content-card">
            <div class="card-header">
                <h2>✅❌ DO & DON''T với Stop Loss</h2>
            </div>
            <div class="card-content">
                <div class="rules-grid">
                    <div class="rule-card do">
                        <div class="rule-title">✅ DO: Đặt SL trước khi Entry</div>
                        <div class="rule-desc">Luôn biết SL ở đâu TRƯỚC khi vào lệnh. Không entry nếu không xác định được SL hợp lý.</div>
                    </div>
                    <div class="rule-card dont">
                        <div class="rule-title">❌ DON''T: Mở rộng SL</div>
                        <div class="rule-desc">KHÔNG BAO GIỜ di chuyển SL xa hơn sau khi entry. Đây là lỗi phổ biến nhất!</div>
                    </div>
                    <div class="rule-card do">
                        <div class="rule-title">✅ DO: Di chuyển SL gần hơn</div>
                        <div class="rule-desc">Trailing SL lên breakeven hoặc lock profit khi trade đang thắng.</div>
                    </div>
                    <div class="rule-card dont">
                        <div class="rule-title">❌ DON''T: Trade không SL</div>
                        <div class="rule-desc">Mọi trade PHẢI có SL. "Mental stop" không đáng tin cậy khi có emotion.</div>
                    </div>
                </div>

                <div class="info-box warning">
                    <div class="info-box-title">⚠️ Trailing Stop Rules</div>
                    <ul class="styled-list">
                        <li><strong>Sau TP1 hit:</strong> Move SL lên breakeven</li>
                        <li><strong>Giá tạo HH/HL mới:</strong> Trail SL theo structure</li>
                        <li><strong>Không trail quá chặt:</strong> Cho phép pullback nhỏ</li>
                    </ul>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/800x350/112250/FFBD59?text=Trailing+Stop+Example" alt="Trailing Stop">
                </div>
            </div>
        </div>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>SL = <strong>Bảo hiểm tài khoản</strong>, không trade nếu không có SL</li>
                <li>Đặt SL <strong>ngoài zone + buffer 0.5%</strong></li>
                <li><strong>KHÔNG BAO GIỜ</strong> mở rộng SL sau khi entry</li>
                <li>CHỈ di chuyển SL <strong>gần hơn</strong> (trailing stop)</li>
                <li>SL phải được xác định <strong>TRƯỚC khi entry</strong></li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <div class="quiz-section">
            <h3>📝 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="0">
                <p>1. Với Long position tại LFZ $42,000-$42,500, SL nên đặt ở đâu?</p>
                <button class="quiz-option" data-index="0">Dưới LFZ + buffer (~$41,790)</button>
                <button class="quiz-option" data-index="1">Ngay tại $42,000</button>
                <button class="quiz-option" data-index="2">Trên LFZ</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p>2. Khi trade đang thua và giá gần SL, bạn nên làm gì?</p>
                <button class="quiz-option" data-index="0">Mở rộng SL để không bị hit</button>
                <button class="quiz-option" data-index="1">Để SL nguyên, chấp nhận thua nếu hit</button>
                <button class="quiz-option" data-index="2">Cancel SL và hy vọng giá quay lại</button>
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
                question.querySelectorAll(''.quiz-option'').forEach(opt => opt.classList.remove(''correct'', ''incorrect''));
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

-- Lesson 6.3: Chiến Lược Take Profit - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch6-l3',
  'module-tier-2-ch6',
  'course-tier2-trading-advanced',
  'Bài 6.3: Chiến Lược Take Profit - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 6.3: Chiến Lược Take Profit - GEM Trading Academy</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: #0a0a0f;
            color: #e4e4e7;
            line-height: 1.6;
            font-size: 16px;
        }

        /* Container - Facebook Style */
        .container {
            max-width: 680px;
            margin: 0 auto;
            background: #0a0a0f;
        }

        /* Header - Compact Style */
        .lesson-header {
            padding: 1rem;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 78, 59, 0.1) 100%);
            border-bottom: 1px solid rgba(16, 185, 129, 0.2);
        }

        .lesson-badge {
            display: inline-block;
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 0.25rem;
        }

        .lesson-subtitle {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        /* Content Card - Facebook Post Style */
        .content-card {
            background: #18181b;
            margin-bottom: 0.5rem;
        }

        .card-header {
            display: flex;
            align-items: center;
            padding: 1rem;
            gap: 0.75rem;
        }

        .card-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            flex-shrink: 0;
        }

        .card-icon.green { background: rgba(16, 185, 129, 0.2); }
        .card-icon.cyan { background: rgba(0, 240, 255, 0.2); }
        .card-icon.gold { background: rgba(255, 189, 89, 0.2); }
        .card-icon.purple { background: rgba(139, 92, 246, 0.2); }
        .card-icon.red { background: rgba(239, 68, 68, 0.2); }

        .card-meta h3 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: #ffffff;
        }

        .card-meta span {
            font-size: 0.75rem;
            color: #71717a;
        }

        .card-body {
            padding: 0 1rem 1rem 1rem;
        }

        .card-body p {
            color: #d4d4d8;
            margin-bottom: 0.75rem;
        }

        /* Lists */
        .styled-list {
            list-style: none;
            padding: 0;
            margin: 1rem 0;
        }

        .styled-list li {
            padding: 0.75rem 1rem;
            background: rgba(16, 185, 129, 0.05);
            border-left: 3px solid #10B981;
            margin-bottom: 0.5rem;
            border-radius: 0 0.5rem 0.5rem 0;
        }

        .styled-list.gold li {
            background: rgba(255, 189, 89, 0.05);
            border-left-color: #FFBD59;
        }

        .styled-list.cyan li {
            background: rgba(0, 240, 255, 0.05);
            border-left-color: #00F0FF;
        }

        .styled-list.purple li {
            background: rgba(139, 92, 246, 0.05);
            border-left-color: #8B5CF6;
        }

        /* Formula Box */
        .formula-box {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 78, 59, 0.15) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem 0;
            text-align: center;
        }

        .formula-box.gold {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(200, 150, 50, 0.15) 100%);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .formula-box .formula {
            font-family: ''SF Mono'', Monaco, ''Courier New'', monospace;
            font-size: 1.25rem;
            font-weight: 700;
            color: #10B981;
            margin-bottom: 0.5rem;
        }

        .formula-box.gold .formula {
            color: #FFBD59;
        }

        .formula-box .formula-desc {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        /* Image Container */
        .image-container {
            margin: 1rem 0;
            border-radius: 0.5rem;
            overflow: hidden;
        }

        .image-container img {
            width: 100%;
            height: auto;
            display: block;
        }

        .image-caption {
            font-size: 0.75rem;
            color: #71717a;
            text-align: center;
            padding: 0.5rem;
            background: rgba(0, 0, 0, 0.3);
        }

        /* TP Strategy Cards */
        .tp-strategy-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .tp-card {
            background: rgba(16, 185, 129, 0.08);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
        }

        .tp-card.gold {
            background: rgba(255, 189, 89, 0.08);
            border-color: rgba(255, 189, 89, 0.2);
        }

        .tp-card.purple {
            background: rgba(139, 92, 246, 0.08);
            border-color: rgba(139, 92, 246, 0.2);
        }

        .tp-card-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
        }

        .tp-badge {
            background: #10B981;
            color: white;
            font-size: 0.75rem;
            font-weight: 700;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
        }

        .tp-card.gold .tp-badge {
            background: #FFBD59;
            color: #000;
        }

        .tp-card.purple .tp-badge {
            background: #8B5CF6;
        }

        .tp-title {
            font-weight: 600;
            color: #fff;
        }

        .tp-content {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .tp-ratio {
            display: inline-block;
            background: rgba(16, 185, 129, 0.2);
            color: #10B981;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-weight: 600;
            margin-top: 0.5rem;
        }

        .tp-card.gold .tp-ratio {
            background: rgba(255, 189, 89, 0.2);
            color: #FFBD59;
        }

        .tp-card.purple .tp-ratio {
            background: rgba(139, 92, 246, 0.2);
            color: #8B5CF6;
        }

        /* Comparison Table */
        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            font-size: 0.875rem;
        }

        .comparison-table th {
            background: rgba(16, 185, 129, 0.2);
            color: #10B981;
            padding: 0.75rem;
            text-align: left;
            font-weight: 600;
        }

        .comparison-table td {
            padding: 0.75rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .comparison-table tr:nth-child(even) {
            background: rgba(255, 255, 255, 0.02);
        }

        /* Tip Box */
        .tip-box {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .tip-box.warning {
            background: rgba(245, 158, 11, 0.1);
            border-color: rgba(245, 158, 11, 0.3);
        }

        .tip-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            color: #10B981;
            margin-bottom: 0.5rem;
        }

        .tip-box.warning .tip-header {
            color: #F59E0B;
        }

        /* Summary Box */
        .summary-box {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 78, 59, 0.15) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem;
        }

        .summary-box h3 {
            color: #10B981;
            font-size: 1rem;
            margin-bottom: 0.75rem;
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
            color: #d4d4d8;
        }

        .summary-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #10B981;
            font-weight: bold;
        }

        /* Quiz Section */
        .quiz-section {
            background: #18181b;
            margin: 0.5rem 0;
            padding: 1.5rem 1rem;
        }

        .quiz-section h3 {
            color: #ffffff;
            font-size: 1.125rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: rgba(16, 185, 129, 0.05);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 500;
            color: #fff;
            margin-bottom: 0.75rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            text-align: left;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            color: #d4d4d8;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .quiz-option:hover {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: #10B981;
            color: #10B981;
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: #EF4444;
            color: #EF4444;
        }

        .quiz-result {
            display: none;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-top: 0.75rem;
            font-weight: 500;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: #10B981;
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: #EF4444;
        }

        .quiz-score {
            display: none;
            text-align: center;
            padding: 1rem;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 78, 59, 0.15) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: #10B981;
        }

        .quiz-score .score-label {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .retake-btn {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1rem;
        }

        /* Footer */
        .lesson-footer {
            padding: 1.5rem 1rem;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #10B981 0%, #00F0FF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .footer-text {
            font-size: 0.75rem;
            color: #71717a;
            margin-top: 0.25rem;
        }

        /* Responsive - Mobile First */
        @media (max-width: 600px) {
            .container {
                padding: 0;
            }

            .content-card {
                border-radius: 0;
                border-left: none;
                border-right: none;
            }

            .card-body {
                padding: 0 1rem 1rem 1rem;
            }

            .tp-strategy-grid {
                gap: 0.5rem;
            }

            .lesson-title {
                font-size: 1.25rem;
            }
        }

        @media (min-width: 600px) {
            .container {
                padding: 1.5rem;
            }

            .content-card {
                border-radius: 0.75rem;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .tp-strategy-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="lesson-header">
            <span class="lesson-badge">📊 Tier 2 - Chương 6</span>
            <h1 class="lesson-title">Bài 6.3: Chiến Lược Take Profit</h1>
            <p class="lesson-subtitle">3 cấp độ TP tối ưu hóa lợi nhuận - Trailing Stop khi thị trường thuận lợi</p>
        </header>

        <!-- Section 1: Multi-TP Strategy -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">💰</div>
                <div class="card-meta">
                    <h3>Chiến Lược Multi-TP</h3>
                    <span>Chia TP thay vì "All or Nothing"</span>
                </div>
            </div>
            <div class="card-body">
                <p>Thay vì đặt một TP duy nhất và hy vọng, GEM Method sử dụng <strong>Multi-TP Strategy</strong> với 3 cấp độ để lock profit dần dần.</p>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x400/112250/10B981?text=Multi-TP+Strategy+Diagram" alt="Multi-TP Strategy">
                    <p class="image-caption">Hình 6.3.1: Chiến lược chia TP thành 3 cấp độ</p>
                </div>

                <div class="formula-box">
                    <div class="formula">Tổng Position = TP1 (50%) + TP2 (30%) + TP3 (20%)</div>
                    <div class="formula-desc">Chia position ra 3 phần với tỷ lệ khuyến nghị</div>
                </div>

                <p><strong>Tại sao Multi-TP?</strong></p>
                <ul class="styled-list">
                    <li><strong>Lock Profit sớm:</strong> TP1 đảm bảo không thua nếu giá đảo chiều</li>
                    <li><strong>Capture trend:</strong> TP2, TP3 cho phép "let profit run"</li>
                    <li><strong>Giảm stress:</strong> Không phải quyết định tất cả tại một điểm</li>
                    <li><strong>Tối ưu R:R:</strong> Trung bình lại được R:R cao hơn 1:2</li>
                </ul>
            </div>
        </article>

        <!-- Section 2: Three TP Levels -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">🎯</div>
                <div class="card-meta">
                    <h3>3 Cấp Độ Take Profit</h3>
                    <span>TP1 - Bảo vệ | TP2 - Target | TP3 - Bonus</span>
                </div>
            </div>
            <div class="card-body">
                <div class="tp-strategy-grid">
                    <div class="tp-card">
                        <div class="tp-card-header">
                            <span class="tp-badge">TP1</span>
                            <span class="tp-title">Conservative</span>
                        </div>
                        <div class="tp-content">
                            <p><strong>Mục tiêu:</strong> Lock profit nhanh</p>
                            <p><strong>Vị trí:</strong> R:R 1:1 đến 1:2</p>
                            <p><strong>Khối lượng:</strong> 50% position</p>
                            <span class="tp-ratio">R:R 1:2</span>
                        </div>
                    </div>

                    <div class="tp-card gold">
                        <div class="tp-card-header">
                            <span class="tp-badge">TP2</span>
                            <span class="tp-title">Measured Move</span>
                        </div>
                        <div class="tp-content">
                            <p><strong>Mục tiêu:</strong> Zone đối diện gần nhất</p>
                            <p><strong>Vị trí:</strong> Measured move hoặc S/R</p>
                            <p><strong>Khối lượng:</strong> 30% position</p>
                            <span class="tp-ratio">R:R 1:3+</span>
                        </div>
                    </div>

                    <div class="tp-card purple">
                        <div class="tp-card-header">
                            <span class="tp-badge">TP3</span>
                            <span class="tp-title">Trailing</span>
                        </div>
                        <div class="tp-content">
                            <p><strong>Mục tiêu:</strong> Let profit run</p>
                            <p><strong>Vị trí:</strong> Trailing stop ATR-based</p>
                            <p><strong>Khối lượng:</strong> 20% position</p>
                            <span class="tp-ratio">R:R 1:5+</span>
                        </div>
                    </div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x400/112250/FFBD59?text=TP1+TP2+TP3+Visualization" alt="3 TP Levels">
                    <p class="image-caption">Hình 6.3.2: Vị trí 3 TP trên chart thực tế</p>
                </div>
            </div>
        </article>

        <!-- Section 3: TP1 - Conservative -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">🔒</div>
                <div class="card-meta">
                    <h3>TP1: Conservative Target</h3>
                    <span>Lock profit sớm - Bảo vệ vốn</span>
                </div>
            </div>
            <div class="card-body">
                <p><strong>TP1</strong> là mục tiêu an toàn nhất - đảm bảo bạn có profit dù thị trường đảo chiều.</p>

                <div class="formula-box">
                    <div class="formula">TP1 = Entry ± (SL Distance × 2)</div>
                    <div class="formula-desc">Tối thiểu R:R 1:2 để có kỳ vọng dương</div>
                </div>

                <p><strong>Cách xác định TP1:</strong></p>
                <ul class="styled-list cyan">
                    <li><strong>Cách 1:</strong> 2 lần khoảng cách Stop Loss (R:R 1:2)</li>
                    <li><strong>Cách 2:</strong> Swing high/low gần nhất (minor resistance/support)</li>
                    <li><strong>Cách 3:</strong> 50% Fibonacci của leg trước đó</li>
                </ul>

                <div class="tip-box">
                    <div class="tip-header">💡 TP1 Rule</div>
                    <p>Khi TP1 hit → Move SL to Breakeven (Entry). Từ đây trade của bạn là <strong>"Free Trade"</strong> - không còn risk.</p>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/10B981?text=TP1+Hit+Move+SL+to+BE" alt="TP1 và Move SL to BE">
                    <p class="image-caption">Hình 6.3.3: Sau TP1 - Di chuyển SL về Entry (Breakeven)</p>
                </div>
            </div>
        </article>

        <!-- Section 4: TP2 - Measured Move -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">📐</div>
                <div class="card-meta">
                    <h3>TP2: Measured Move</h3>
                    <span>Zone đối diện hoặc Measured Move</span>
                </div>
            </div>
            <div class="card-body">
                <p><strong>TP2</strong> sử dụng kỹ thuật <strong>Measured Move</strong> hoặc target vào zone đối diện gần nhất.</p>

                <div class="formula-box gold">
                    <div class="formula">TP2 = Opposite Zone hoặc AB = CD Move</div>
                    <div class="formula-desc">Measured Move: Leg 2 = Leg 1 (AB = CD pattern)</div>
                </div>

                <p><strong>2 cách xác định TP2:</strong></p>
                <table class="comparison-table">
                    <tr>
                        <th>Phương pháp</th>
                        <th>Cách áp dụng</th>
                        <th>Khi nào dùng</th>
                    </tr>
                    <tr>
                        <td><strong>Zone đối diện</strong></td>
                        <td>HFZ/LFZ gần nhất phía đối diện</td>
                        <td>Có zone rõ ràng trên chart</td>
                    </tr>
                    <tr>
                        <td><strong>Measured Move</strong></td>
                        <td>AB = CD (Leg 1 = Leg 2)</td>
                        <td>Không có zone rõ ràng</td>
                    </tr>
                </table>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x400/112250/FFBD59?text=TP2+Measured+Move+ABCD" alt="Measured Move TP2">
                    <p class="image-caption">Hình 6.3.4: Measured Move - AB = CD để xác định TP2</p>
                </div>
            </div>
        </article>

        <!-- Section 5: TP3 - Trailing Stop -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">🚀</div>
                <div class="card-meta">
                    <h3>TP3: Trailing Stop</h3>
                    <span>Let profit run - Capture extended moves</span>
                </div>
            </div>
            <div class="card-body">
                <p><strong>TP3</strong> không có target cố định - sử dụng <strong>Trailing Stop</strong> để capture maximum move khi thị trường trending mạnh.</p>

                <div class="formula-box">
                    <div class="formula">Trailing Stop = Close - (ATR × 2)</div>
                    <div class="formula-desc">Di chuyển SL theo ATR khi giá tiếp tục đi đúng hướng</div>
                </div>

                <p><strong>Các phương pháp Trailing:</strong></p>
                <ul class="styled-list purple">
                    <li><strong>ATR Trailing:</strong> SL = Close - (ATR × 2) cho Long, Close + (ATR × 2) cho Short</li>
                    <li><strong>Swing Trailing:</strong> SL dưới swing low gần nhất (Long) hoặc trên swing high (Short)</li>
                    <li><strong>EMA Trailing:</strong> SL theo EMA 20 hoặc EMA 8 trên LTF</li>
                    <li><strong>Chandelier Exit:</strong> ATR-based từ highest high trong N bars</li>
                </ul>

                <div class="tip-box warning">
                    <div class="tip-header">⚠️ Trailing Rule</div>
                    <p>Trailing stop chỉ được di chuyển <strong>theo hướng có lợi</strong>. KHÔNG BAO GIỜ di chuyển trailing stop ngược lại (widening SL).</p>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x400/112250/8B5CF6?text=Trailing+Stop+ATR+Based" alt="Trailing Stop">
                    <p class="image-caption">Hình 6.3.5: Trailing Stop di chuyển theo swing lows</p>
                </div>
            </div>
        </article>

        <!-- Section 6: Complete Example -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">📊</div>
                <div class="card-meta">
                    <h3>Ví Dụ Hoàn Chỉnh</h3>
                    <span>Trade với Multi-TP Strategy</span>
                </div>
            </div>
            <div class="card-body">
                <p>Áp dụng Multi-TP cho trade Long BTCUSDT từ LFZ:</p>

                <table class="comparison-table">
                    <tr>
                        <th>Thông tin</th>
                        <th>Giá trị</th>
                    </tr>
                    <tr>
                        <td>Entry</td>
                        <td>$42,500</td>
                    </tr>
                    <tr>
                        <td>Stop Loss</td>
                        <td>$42,000 (SL Distance: $500)</td>
                    </tr>
                    <tr>
                        <td>Position Size</td>
                        <td>1 BTC ($42,500)</td>
                    </tr>
                </table>

                <div class="tp-strategy-grid">
                    <div class="tp-card">
                        <div class="tp-card-header">
                            <span class="tp-badge">TP1</span>
                            <span class="tp-title">$43,500</span>
                        </div>
                        <div class="tp-content">
                            <p>$500 × 2 = $1,000 profit</p>
                            <p>Sell 0.5 BTC (50%)</p>
                            <p><strong>Profit: +$500</strong></p>
                            <span class="tp-ratio">R:R 1:2</span>
                        </div>
                    </div>

                    <div class="tp-card gold">
                        <div class="tp-card-header">
                            <span class="tp-badge">TP2</span>
                            <span class="tp-title">$44,500</span>
                        </div>
                        <div class="tp-content">
                            <p>HFZ target (measured move)</p>
                            <p>Sell 0.3 BTC (30%)</p>
                            <p><strong>Profit: +$600</strong></p>
                            <span class="tp-ratio">R:R 1:4</span>
                        </div>
                    </div>

                    <div class="tp-card purple">
                        <div class="tp-card-header">
                            <span class="tp-badge">TP3</span>
                            <span class="tp-title">Trailing</span>
                        </div>
                        <div class="tp-content">
                            <p>Trailing stop ATR × 2</p>
                            <p>Exit 0.2 BTC (20%)</p>
                            <p><strong>Potential: +$800+</strong></p>
                            <span class="tp-ratio">R:R 1:6+</span>
                        </div>
                    </div>
                </div>

                <div class="formula-box">
                    <div class="formula">Total Profit: $500 + $600 + $800 = $1,900</div>
                    <div class="formula-desc">Average R:R ≈ 1:3.8 (so với risk $500)</div>
                </div>
            </div>
        </article>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Multi-TP Strategy: Chia position thành 3 phần (50%/30%/20%)</li>
                <li>TP1 (R:R 1:2): Lock profit sớm, move SL to Breakeven</li>
                <li>TP2 (Measured Move): Zone đối diện hoặc AB = CD pattern</li>
                <li>TP3 (Trailing): ATR-based trailing để capture extended moves</li>
                <li>Average R:R với Multi-TP thường cao hơn 1:3</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <section class="quiz-section">
            <h3>🎯 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="1">
                <p><strong>Câu 1:</strong> Sau khi TP1 hit, bạn nên làm gì với Stop Loss?</p>
                <button class="quiz-option" data-index="0">Giữ nguyên vị trí SL ban đầu</button>
                <button class="quiz-option" data-index="1">Di chuyển SL về Entry (Breakeven)</button>
                <button class="quiz-option" data-index="2">Đóng toàn bộ position</button>
                <button class="quiz-option" data-index="3">Mở rộng SL để cho trade "thở"</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p><strong>Câu 2:</strong> TP2 sử dụng phương pháp nào để xác định target?</p>
                <button class="quiz-option" data-index="0">Luôn là R:R 1:2</button>
                <button class="quiz-option" data-index="1">Fibonacci 61.8%</button>
                <button class="quiz-option" data-index="2">Zone đối diện hoặc Measured Move (AB=CD)</button>
                <button class="quiz-option" data-index="3">EMA 200</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p><strong>Câu 3:</strong> Trailing Stop được phép di chuyển theo hướng nào?</p>
                <button class="quiz-option" data-index="0">Chỉ theo hướng có lợi (tighten SL)</button>
                <button class="quiz-option" data-index="1">Cả hai hướng tùy market condition</button>
                <button class="quiz-option" data-index="2">Chỉ khi đạt TP target</button>
                <button class="quiz-option" data-index="3">Không được di chuyển sau khi đặt</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <!-- Footer -->
        <footer class="lesson-footer">
            <div class="footer-logo">GEM Trading Academy</div>
            <p class="footer-text">Tier 2 - Advanced Trading • Bài 6.3</p>
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
                        result.textContent = ''✓ Chính xác! Sau TP1 luôn move SL to BE để có "Free Trade".'';
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
    <title>Bài 6.3: Chiến Lược Take Profit - GEM Trading Academy</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: #0a0a0f;
            color: #e4e4e7;
            line-height: 1.6;
            font-size: 16px;
        }

        /* Container - Facebook Style */
        .container {
            max-width: 680px;
            margin: 0 auto;
            background: #0a0a0f;
        }

        /* Header - Compact Style */
        .lesson-header {
            padding: 1rem;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 78, 59, 0.1) 100%);
            border-bottom: 1px solid rgba(16, 185, 129, 0.2);
        }

        .lesson-badge {
            display: inline-block;
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 0.25rem;
        }

        .lesson-subtitle {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        /* Content Card - Facebook Post Style */
        .content-card {
            background: #18181b;
            margin-bottom: 0.5rem;
        }

        .card-header {
            display: flex;
            align-items: center;
            padding: 1rem;
            gap: 0.75rem;
        }

        .card-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            flex-shrink: 0;
        }

        .card-icon.green { background: rgba(16, 185, 129, 0.2); }
        .card-icon.cyan { background: rgba(0, 240, 255, 0.2); }
        .card-icon.gold { background: rgba(255, 189, 89, 0.2); }
        .card-icon.purple { background: rgba(139, 92, 246, 0.2); }
        .card-icon.red { background: rgba(239, 68, 68, 0.2); }

        .card-meta h3 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: #ffffff;
        }

        .card-meta span {
            font-size: 0.75rem;
            color: #71717a;
        }

        .card-body {
            padding: 0 1rem 1rem 1rem;
        }

        .card-body p {
            color: #d4d4d8;
            margin-bottom: 0.75rem;
        }

        /* Lists */
        .styled-list {
            list-style: none;
            padding: 0;
            margin: 1rem 0;
        }

        .styled-list li {
            padding: 0.75rem 1rem;
            background: rgba(16, 185, 129, 0.05);
            border-left: 3px solid #10B981;
            margin-bottom: 0.5rem;
            border-radius: 0 0.5rem 0.5rem 0;
        }

        .styled-list.gold li {
            background: rgba(255, 189, 89, 0.05);
            border-left-color: #FFBD59;
        }

        .styled-list.cyan li {
            background: rgba(0, 240, 255, 0.05);
            border-left-color: #00F0FF;
        }

        .styled-list.purple li {
            background: rgba(139, 92, 246, 0.05);
            border-left-color: #8B5CF6;
        }

        /* Formula Box */
        .formula-box {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 78, 59, 0.15) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem 0;
            text-align: center;
        }

        .formula-box.gold {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(200, 150, 50, 0.15) 100%);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .formula-box .formula {
            font-family: ''SF Mono'', Monaco, ''Courier New'', monospace;
            font-size: 1.25rem;
            font-weight: 700;
            color: #10B981;
            margin-bottom: 0.5rem;
        }

        .formula-box.gold .formula {
            color: #FFBD59;
        }

        .formula-box .formula-desc {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        /* Image Container */
        .image-container {
            margin: 1rem 0;
            border-radius: 0.5rem;
            overflow: hidden;
        }

        .image-container img {
            width: 100%;
            height: auto;
            display: block;
        }

        .image-caption {
            font-size: 0.75rem;
            color: #71717a;
            text-align: center;
            padding: 0.5rem;
            background: rgba(0, 0, 0, 0.3);
        }

        /* TP Strategy Cards */
        .tp-strategy-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .tp-card {
            background: rgba(16, 185, 129, 0.08);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
        }

        .tp-card.gold {
            background: rgba(255, 189, 89, 0.08);
            border-color: rgba(255, 189, 89, 0.2);
        }

        .tp-card.purple {
            background: rgba(139, 92, 246, 0.08);
            border-color: rgba(139, 92, 246, 0.2);
        }

        .tp-card-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
        }

        .tp-badge {
            background: #10B981;
            color: white;
            font-size: 0.75rem;
            font-weight: 700;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
        }

        .tp-card.gold .tp-badge {
            background: #FFBD59;
            color: #000;
        }

        .tp-card.purple .tp-badge {
            background: #8B5CF6;
        }

        .tp-title {
            font-weight: 600;
            color: #fff;
        }

        .tp-content {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .tp-ratio {
            display: inline-block;
            background: rgba(16, 185, 129, 0.2);
            color: #10B981;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-weight: 600;
            margin-top: 0.5rem;
        }

        .tp-card.gold .tp-ratio {
            background: rgba(255, 189, 89, 0.2);
            color: #FFBD59;
        }

        .tp-card.purple .tp-ratio {
            background: rgba(139, 92, 246, 0.2);
            color: #8B5CF6;
        }

        /* Comparison Table */
        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            font-size: 0.875rem;
        }

        .comparison-table th {
            background: rgba(16, 185, 129, 0.2);
            color: #10B981;
            padding: 0.75rem;
            text-align: left;
            font-weight: 600;
        }

        .comparison-table td {
            padding: 0.75rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .comparison-table tr:nth-child(even) {
            background: rgba(255, 255, 255, 0.02);
        }

        /* Tip Box */
        .tip-box {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .tip-box.warning {
            background: rgba(245, 158, 11, 0.1);
            border-color: rgba(245, 158, 11, 0.3);
        }

        .tip-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            color: #10B981;
            margin-bottom: 0.5rem;
        }

        .tip-box.warning .tip-header {
            color: #F59E0B;
        }

        /* Summary Box */
        .summary-box {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 78, 59, 0.15) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem;
        }

        .summary-box h3 {
            color: #10B981;
            font-size: 1rem;
            margin-bottom: 0.75rem;
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
            color: #d4d4d8;
        }

        .summary-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #10B981;
            font-weight: bold;
        }

        /* Quiz Section */
        .quiz-section {
            background: #18181b;
            margin: 0.5rem 0;
            padding: 1.5rem 1rem;
        }

        .quiz-section h3 {
            color: #ffffff;
            font-size: 1.125rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: rgba(16, 185, 129, 0.05);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 500;
            color: #fff;
            margin-bottom: 0.75rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            text-align: left;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            color: #d4d4d8;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .quiz-option:hover {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: #10B981;
            color: #10B981;
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: #EF4444;
            color: #EF4444;
        }

        .quiz-result {
            display: none;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-top: 0.75rem;
            font-weight: 500;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: #10B981;
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: #EF4444;
        }

        .quiz-score {
            display: none;
            text-align: center;
            padding: 1rem;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 78, 59, 0.15) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: #10B981;
        }

        .quiz-score .score-label {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .retake-btn {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1rem;
        }

        /* Footer */
        .lesson-footer {
            padding: 1.5rem 1rem;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #10B981 0%, #00F0FF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .footer-text {
            font-size: 0.75rem;
            color: #71717a;
            margin-top: 0.25rem;
        }

        /* Responsive - Mobile First */
        @media (max-width: 600px) {
            .container {
                padding: 0;
            }

            .content-card {
                border-radius: 0;
                border-left: none;
                border-right: none;
            }

            .card-body {
                padding: 0 1rem 1rem 1rem;
            }

            .tp-strategy-grid {
                gap: 0.5rem;
            }

            .lesson-title {
                font-size: 1.25rem;
            }
        }

        @media (min-width: 600px) {
            .container {
                padding: 1.5rem;
            }

            .content-card {
                border-radius: 0.75rem;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .tp-strategy-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="lesson-header">
            <span class="lesson-badge">📊 Tier 2 - Chương 6</span>
            <h1 class="lesson-title">Bài 6.3: Chiến Lược Take Profit</h1>
            <p class="lesson-subtitle">3 cấp độ TP tối ưu hóa lợi nhuận - Trailing Stop khi thị trường thuận lợi</p>
        </header>

        <!-- Section 1: Multi-TP Strategy -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">💰</div>
                <div class="card-meta">
                    <h3>Chiến Lược Multi-TP</h3>
                    <span>Chia TP thay vì "All or Nothing"</span>
                </div>
            </div>
            <div class="card-body">
                <p>Thay vì đặt một TP duy nhất và hy vọng, GEM Method sử dụng <strong>Multi-TP Strategy</strong> với 3 cấp độ để lock profit dần dần.</p>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x400/112250/10B981?text=Multi-TP+Strategy+Diagram" alt="Multi-TP Strategy">
                    <p class="image-caption">Hình 6.3.1: Chiến lược chia TP thành 3 cấp độ</p>
                </div>

                <div class="formula-box">
                    <div class="formula">Tổng Position = TP1 (50%) + TP2 (30%) + TP3 (20%)</div>
                    <div class="formula-desc">Chia position ra 3 phần với tỷ lệ khuyến nghị</div>
                </div>

                <p><strong>Tại sao Multi-TP?</strong></p>
                <ul class="styled-list">
                    <li><strong>Lock Profit sớm:</strong> TP1 đảm bảo không thua nếu giá đảo chiều</li>
                    <li><strong>Capture trend:</strong> TP2, TP3 cho phép "let profit run"</li>
                    <li><strong>Giảm stress:</strong> Không phải quyết định tất cả tại một điểm</li>
                    <li><strong>Tối ưu R:R:</strong> Trung bình lại được R:R cao hơn 1:2</li>
                </ul>
            </div>
        </article>

        <!-- Section 2: Three TP Levels -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">🎯</div>
                <div class="card-meta">
                    <h3>3 Cấp Độ Take Profit</h3>
                    <span>TP1 - Bảo vệ | TP2 - Target | TP3 - Bonus</span>
                </div>
            </div>
            <div class="card-body">
                <div class="tp-strategy-grid">
                    <div class="tp-card">
                        <div class="tp-card-header">
                            <span class="tp-badge">TP1</span>
                            <span class="tp-title">Conservative</span>
                        </div>
                        <div class="tp-content">
                            <p><strong>Mục tiêu:</strong> Lock profit nhanh</p>
                            <p><strong>Vị trí:</strong> R:R 1:1 đến 1:2</p>
                            <p><strong>Khối lượng:</strong> 50% position</p>
                            <span class="tp-ratio">R:R 1:2</span>
                        </div>
                    </div>

                    <div class="tp-card gold">
                        <div class="tp-card-header">
                            <span class="tp-badge">TP2</span>
                            <span class="tp-title">Measured Move</span>
                        </div>
                        <div class="tp-content">
                            <p><strong>Mục tiêu:</strong> Zone đối diện gần nhất</p>
                            <p><strong>Vị trí:</strong> Measured move hoặc S/R</p>
                            <p><strong>Khối lượng:</strong> 30% position</p>
                            <span class="tp-ratio">R:R 1:3+</span>
                        </div>
                    </div>

                    <div class="tp-card purple">
                        <div class="tp-card-header">
                            <span class="tp-badge">TP3</span>
                            <span class="tp-title">Trailing</span>
                        </div>
                        <div class="tp-content">
                            <p><strong>Mục tiêu:</strong> Let profit run</p>
                            <p><strong>Vị trí:</strong> Trailing stop ATR-based</p>
                            <p><strong>Khối lượng:</strong> 20% position</p>
                            <span class="tp-ratio">R:R 1:5+</span>
                        </div>
                    </div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x400/112250/FFBD59?text=TP1+TP2+TP3+Visualization" alt="3 TP Levels">
                    <p class="image-caption">Hình 6.3.2: Vị trí 3 TP trên chart thực tế</p>
                </div>
            </div>
        </article>

        <!-- Section 3: TP1 - Conservative -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">🔒</div>
                <div class="card-meta">
                    <h3>TP1: Conservative Target</h3>
                    <span>Lock profit sớm - Bảo vệ vốn</span>
                </div>
            </div>
            <div class="card-body">
                <p><strong>TP1</strong> là mục tiêu an toàn nhất - đảm bảo bạn có profit dù thị trường đảo chiều.</p>

                <div class="formula-box">
                    <div class="formula">TP1 = Entry ± (SL Distance × 2)</div>
                    <div class="formula-desc">Tối thiểu R:R 1:2 để có kỳ vọng dương</div>
                </div>

                <p><strong>Cách xác định TP1:</strong></p>
                <ul class="styled-list cyan">
                    <li><strong>Cách 1:</strong> 2 lần khoảng cách Stop Loss (R:R 1:2)</li>
                    <li><strong>Cách 2:</strong> Swing high/low gần nhất (minor resistance/support)</li>
                    <li><strong>Cách 3:</strong> 50% Fibonacci của leg trước đó</li>
                </ul>

                <div class="tip-box">
                    <div class="tip-header">💡 TP1 Rule</div>
                    <p>Khi TP1 hit → Move SL to Breakeven (Entry). Từ đây trade của bạn là <strong>"Free Trade"</strong> - không còn risk.</p>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/10B981?text=TP1+Hit+Move+SL+to+BE" alt="TP1 và Move SL to BE">
                    <p class="image-caption">Hình 6.3.3: Sau TP1 - Di chuyển SL về Entry (Breakeven)</p>
                </div>
            </div>
        </article>

        <!-- Section 4: TP2 - Measured Move -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">📐</div>
                <div class="card-meta">
                    <h3>TP2: Measured Move</h3>
                    <span>Zone đối diện hoặc Measured Move</span>
                </div>
            </div>
            <div class="card-body">
                <p><strong>TP2</strong> sử dụng kỹ thuật <strong>Measured Move</strong> hoặc target vào zone đối diện gần nhất.</p>

                <div class="formula-box gold">
                    <div class="formula">TP2 = Opposite Zone hoặc AB = CD Move</div>
                    <div class="formula-desc">Measured Move: Leg 2 = Leg 1 (AB = CD pattern)</div>
                </div>

                <p><strong>2 cách xác định TP2:</strong></p>
                <table class="comparison-table">
                    <tr>
                        <th>Phương pháp</th>
                        <th>Cách áp dụng</th>
                        <th>Khi nào dùng</th>
                    </tr>
                    <tr>
                        <td><strong>Zone đối diện</strong></td>
                        <td>HFZ/LFZ gần nhất phía đối diện</td>
                        <td>Có zone rõ ràng trên chart</td>
                    </tr>
                    <tr>
                        <td><strong>Measured Move</strong></td>
                        <td>AB = CD (Leg 1 = Leg 2)</td>
                        <td>Không có zone rõ ràng</td>
                    </tr>
                </table>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x400/112250/FFBD59?text=TP2+Measured+Move+ABCD" alt="Measured Move TP2">
                    <p class="image-caption">Hình 6.3.4: Measured Move - AB = CD để xác định TP2</p>
                </div>
            </div>
        </article>

        <!-- Section 5: TP3 - Trailing Stop -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">🚀</div>
                <div class="card-meta">
                    <h3>TP3: Trailing Stop</h3>
                    <span>Let profit run - Capture extended moves</span>
                </div>
            </div>
            <div class="card-body">
                <p><strong>TP3</strong> không có target cố định - sử dụng <strong>Trailing Stop</strong> để capture maximum move khi thị trường trending mạnh.</p>

                <div class="formula-box">
                    <div class="formula">Trailing Stop = Close - (ATR × 2)</div>
                    <div class="formula-desc">Di chuyển SL theo ATR khi giá tiếp tục đi đúng hướng</div>
                </div>

                <p><strong>Các phương pháp Trailing:</strong></p>
                <ul class="styled-list purple">
                    <li><strong>ATR Trailing:</strong> SL = Close - (ATR × 2) cho Long, Close + (ATR × 2) cho Short</li>
                    <li><strong>Swing Trailing:</strong> SL dưới swing low gần nhất (Long) hoặc trên swing high (Short)</li>
                    <li><strong>EMA Trailing:</strong> SL theo EMA 20 hoặc EMA 8 trên LTF</li>
                    <li><strong>Chandelier Exit:</strong> ATR-based từ highest high trong N bars</li>
                </ul>

                <div class="tip-box warning">
                    <div class="tip-header">⚠️ Trailing Rule</div>
                    <p>Trailing stop chỉ được di chuyển <strong>theo hướng có lợi</strong>. KHÔNG BAO GIỜ di chuyển trailing stop ngược lại (widening SL).</p>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x400/112250/8B5CF6?text=Trailing+Stop+ATR+Based" alt="Trailing Stop">
                    <p class="image-caption">Hình 6.3.5: Trailing Stop di chuyển theo swing lows</p>
                </div>
            </div>
        </article>

        <!-- Section 6: Complete Example -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">📊</div>
                <div class="card-meta">
                    <h3>Ví Dụ Hoàn Chỉnh</h3>
                    <span>Trade với Multi-TP Strategy</span>
                </div>
            </div>
            <div class="card-body">
                <p>Áp dụng Multi-TP cho trade Long BTCUSDT từ LFZ:</p>

                <table class="comparison-table">
                    <tr>
                        <th>Thông tin</th>
                        <th>Giá trị</th>
                    </tr>
                    <tr>
                        <td>Entry</td>
                        <td>$42,500</td>
                    </tr>
                    <tr>
                        <td>Stop Loss</td>
                        <td>$42,000 (SL Distance: $500)</td>
                    </tr>
                    <tr>
                        <td>Position Size</td>
                        <td>1 BTC ($42,500)</td>
                    </tr>
                </table>

                <div class="tp-strategy-grid">
                    <div class="tp-card">
                        <div class="tp-card-header">
                            <span class="tp-badge">TP1</span>
                            <span class="tp-title">$43,500</span>
                        </div>
                        <div class="tp-content">
                            <p>$500 × 2 = $1,000 profit</p>
                            <p>Sell 0.5 BTC (50%)</p>
                            <p><strong>Profit: +$500</strong></p>
                            <span class="tp-ratio">R:R 1:2</span>
                        </div>
                    </div>

                    <div class="tp-card gold">
                        <div class="tp-card-header">
                            <span class="tp-badge">TP2</span>
                            <span class="tp-title">$44,500</span>
                        </div>
                        <div class="tp-content">
                            <p>HFZ target (measured move)</p>
                            <p>Sell 0.3 BTC (30%)</p>
                            <p><strong>Profit: +$600</strong></p>
                            <span class="tp-ratio">R:R 1:4</span>
                        </div>
                    </div>

                    <div class="tp-card purple">
                        <div class="tp-card-header">
                            <span class="tp-badge">TP3</span>
                            <span class="tp-title">Trailing</span>
                        </div>
                        <div class="tp-content">
                            <p>Trailing stop ATR × 2</p>
                            <p>Exit 0.2 BTC (20%)</p>
                            <p><strong>Potential: +$800+</strong></p>
                            <span class="tp-ratio">R:R 1:6+</span>
                        </div>
                    </div>
                </div>

                <div class="formula-box">
                    <div class="formula">Total Profit: $500 + $600 + $800 = $1,900</div>
                    <div class="formula-desc">Average R:R ≈ 1:3.8 (so với risk $500)</div>
                </div>
            </div>
        </article>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Multi-TP Strategy: Chia position thành 3 phần (50%/30%/20%)</li>
                <li>TP1 (R:R 1:2): Lock profit sớm, move SL to Breakeven</li>
                <li>TP2 (Measured Move): Zone đối diện hoặc AB = CD pattern</li>
                <li>TP3 (Trailing): ATR-based trailing để capture extended moves</li>
                <li>Average R:R với Multi-TP thường cao hơn 1:3</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <section class="quiz-section">
            <h3>🎯 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="1">
                <p><strong>Câu 1:</strong> Sau khi TP1 hit, bạn nên làm gì với Stop Loss?</p>
                <button class="quiz-option" data-index="0">Giữ nguyên vị trí SL ban đầu</button>
                <button class="quiz-option" data-index="1">Di chuyển SL về Entry (Breakeven)</button>
                <button class="quiz-option" data-index="2">Đóng toàn bộ position</button>
                <button class="quiz-option" data-index="3">Mở rộng SL để cho trade "thở"</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p><strong>Câu 2:</strong> TP2 sử dụng phương pháp nào để xác định target?</p>
                <button class="quiz-option" data-index="0">Luôn là R:R 1:2</button>
                <button class="quiz-option" data-index="1">Fibonacci 61.8%</button>
                <button class="quiz-option" data-index="2">Zone đối diện hoặc Measured Move (AB=CD)</button>
                <button class="quiz-option" data-index="3">EMA 200</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p><strong>Câu 3:</strong> Trailing Stop được phép di chuyển theo hướng nào?</p>
                <button class="quiz-option" data-index="0">Chỉ theo hướng có lợi (tighten SL)</button>
                <button class="quiz-option" data-index="1">Cả hai hướng tùy market condition</button>
                <button class="quiz-option" data-index="2">Chỉ khi đạt TP target</button>
                <button class="quiz-option" data-index="3">Không được di chuyển sau khi đặt</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <!-- Footer -->
        <footer class="lesson-footer">
            <div class="footer-logo">GEM Trading Academy</div>
            <p class="footer-text">Tier 2 - Advanced Trading • Bài 6.3</p>
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
                        result.textContent = ''✓ Chính xác! Sau TP1 luôn move SL to BE để có "Free Trade".'';
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

-- Lesson 6.4: Quy Tắc "Nhìn Sang Phải" - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch6-l4',
  'module-tier-2-ch6',
  'course-tier2-trading-advanced',
  'Bài 6.4: Quy Tắc "Nhìn Sang Phải" - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 6.4: Quy Tắc "Nhìn Sang Phải" - GEM Trading Academy</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: #0a0a0f;
            color: #e4e4e7;
            line-height: 1.6;
            font-size: 16px;
        }

        /* Container - Facebook Style */
        .container {
            max-width: 680px;
            margin: 0 auto;
            background: #0a0a0f;
        }

        /* Header - Compact Style */
        .lesson-header {
            padding: 1rem;
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(17, 34, 80, 0.3) 100%);
            border-bottom: 1px solid rgba(0, 240, 255, 0.2);
        }

        .lesson-badge {
            display: inline-block;
            background: linear-gradient(135deg, #00F0FF 0%, #0080FF 100%);
            color: #000;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 0.25rem;
        }

        .lesson-subtitle {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        /* Content Card - Facebook Post Style */
        .content-card {
            background: #18181b;
            margin-bottom: 0.5rem;
        }

        .card-header {
            display: flex;
            align-items: center;
            padding: 1rem;
            gap: 0.75rem;
        }

        .card-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            flex-shrink: 0;
        }

        .card-icon.cyan { background: rgba(0, 240, 255, 0.2); }
        .card-icon.gold { background: rgba(255, 189, 89, 0.2); }
        .card-icon.red { background: rgba(239, 68, 68, 0.2); }
        .card-icon.green { background: rgba(16, 185, 129, 0.2); }
        .card-icon.purple { background: rgba(139, 92, 246, 0.2); }

        .card-meta h3 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: #ffffff;
        }

        .card-meta span {
            font-size: 0.75rem;
            color: #71717a;
        }

        .card-body {
            padding: 0 1rem 1rem 1rem;
        }

        .card-body p {
            color: #d4d4d8;
            margin-bottom: 0.75rem;
        }

        /* Lists */
        .styled-list {
            list-style: none;
            padding: 0;
            margin: 1rem 0;
        }

        .styled-list li {
            padding: 0.75rem 1rem;
            background: rgba(0, 240, 255, 0.05);
            border-left: 3px solid #00F0FF;
            margin-bottom: 0.5rem;
            border-radius: 0 0.5rem 0.5rem 0;
        }

        .styled-list.red li {
            background: rgba(239, 68, 68, 0.05);
            border-left-color: #EF4444;
        }

        .styled-list.green li {
            background: rgba(16, 185, 129, 0.05);
            border-left-color: #10B981;
        }

        .styled-list.gold li {
            background: rgba(255, 189, 89, 0.05);
            border-left-color: #FFBD59;
        }

        /* Concept Box */
        .concept-box {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(17, 34, 80, 0.2) 100%);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem 0;
            text-align: center;
        }

        .concept-box.red {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(100, 20, 20, 0.2) 100%);
            border-color: rgba(239, 68, 68, 0.3);
        }

        .concept-box .concept-text {
            font-size: 1.25rem;
            font-weight: 700;
            color: #00F0FF;
            margin-bottom: 0.5rem;
        }

        .concept-box.red .concept-text {
            color: #EF4444;
        }

        .concept-box .concept-desc {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        /* Image Container */
        .image-container {
            margin: 1rem 0;
            border-radius: 0.5rem;
            overflow: hidden;
        }

        .image-container img {
            width: 100%;
            height: auto;
            display: block;
        }

        .image-caption {
            font-size: 0.75rem;
            color: #71717a;
            text-align: center;
            padding: 0.5rem;
            background: rgba(0, 0, 0, 0.3);
        }

        /* Obstacle Cards */
        .obstacle-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .obstacle-card {
            background: rgba(239, 68, 68, 0.08);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
        }

        .obstacle-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }

        .obstacle-icon {
            font-size: 1.25rem;
        }

        .obstacle-name {
            font-weight: 600;
            color: #EF4444;
        }

        .obstacle-desc {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        /* Checklist Box */
        .checklist-box {
            background: rgba(0, 240, 255, 0.05);
            border: 1px solid rgba(0, 240, 255, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .checklist-title {
            font-weight: 600;
            color: #00F0FF;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .checklist-items {
            list-style: none;
            padding: 0;
        }

        .checklist-items li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: #d4d4d8;
            font-size: 0.9375rem;
        }

        .checklist-items li::before {
            content: "☐";
            position: absolute;
            left: 0;
            color: #00F0FF;
        }

        /* Comparison Table */
        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            font-size: 0.875rem;
        }

        .comparison-table th {
            background: rgba(0, 240, 255, 0.2);
            color: #00F0FF;
            padding: 0.75rem;
            text-align: left;
            font-weight: 600;
        }

        .comparison-table td {
            padding: 0.75rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .comparison-table tr:nth-child(even) {
            background: rgba(255, 255, 255, 0.02);
        }

        /* Decision Box */
        .decision-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .decision-card {
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
        }

        .decision-card.go {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .decision-card.no-go {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .decision-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        .decision-title {
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .decision-card.go .decision-title {
            color: #10B981;
        }

        .decision-card.no-go .decision-title {
            color: #EF4444;
        }

        .decision-desc {
            font-size: 0.8125rem;
            color: #a1a1aa;
        }

        /* Tip Box */
        .tip-box {
            background: rgba(0, 240, 255, 0.1);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .tip-box.warning {
            background: rgba(245, 158, 11, 0.1);
            border-color: rgba(245, 158, 11, 0.3);
        }

        .tip-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            color: #00F0FF;
            margin-bottom: 0.5rem;
        }

        .tip-box.warning .tip-header {
            color: #F59E0B;
        }

        /* Summary Box */
        .summary-box {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(17, 34, 80, 0.2) 100%);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem;
        }

        .summary-box h3 {
            color: #00F0FF;
            font-size: 1rem;
            margin-bottom: 0.75rem;
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
            color: #d4d4d8;
        }

        .summary-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #00F0FF;
            font-weight: bold;
        }

        /* Quiz Section */
        .quiz-section {
            background: #18181b;
            margin: 0.5rem 0;
            padding: 1.5rem 1rem;
        }

        .quiz-section h3 {
            color: #ffffff;
            font-size: 1.125rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: rgba(0, 240, 255, 0.05);
            border: 1px solid rgba(0, 240, 255, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 500;
            color: #fff;
            margin-bottom: 0.75rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            text-align: left;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            color: #d4d4d8;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .quiz-option:hover {
            background: rgba(0, 240, 255, 0.1);
            border-color: rgba(0, 240, 255, 0.3);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: #10B981;
            color: #10B981;
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: #EF4444;
            color: #EF4444;
        }

        .quiz-result {
            display: none;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-top: 0.75rem;
            font-weight: 500;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: #10B981;
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: #EF4444;
        }

        .quiz-score {
            display: none;
            text-align: center;
            padding: 1rem;
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(17, 34, 80, 0.2) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: #00F0FF;
        }

        .quiz-score .score-label {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .retake-btn {
            background: linear-gradient(135deg, #00F0FF 0%, #0080FF 100%);
            color: #000;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1rem;
        }

        /* Footer */
        .lesson-footer {
            padding: 1.5rem 1rem;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #00F0FF 0%, #FFBD59 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .footer-text {
            font-size: 0.75rem;
            color: #71717a;
            margin-top: 0.25rem;
        }

        /* Responsive - Mobile First */
        @media (max-width: 600px) {
            .container {
                padding: 0;
            }

            .content-card {
                border-radius: 0;
                border-left: none;
                border-right: none;
            }

            .card-body {
                padding: 0 1rem 1rem 1rem;
            }

            .decision-grid {
                grid-template-columns: 1fr;
            }

            .lesson-title {
                font-size: 1.25rem;
            }
        }

        @media (min-width: 600px) {
            .container {
                padding: 1.5rem;
            }

            .content-card {
                border-radius: 0.75rem;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .obstacle-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="lesson-header">
            <span class="lesson-badge">🔍 Tier 2 - Chương 6</span>
            <h1 class="lesson-title">Bài 6.4: Quy Tắc "Nhìn Sang Phải"</h1>
            <p class="lesson-subtitle">Look Right Rule - Kiểm tra chướng ngại vật trước khi vào lệnh</p>
        </header>

        <!-- Section 1: Look Right Rule Concept -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">👁️</div>
                <div class="card-meta">
                    <h3>Quy Tắc Nhìn Sang Phải</h3>
                    <span>"Look Right Before You Trade"</span>
                </div>
            </div>
            <div class="card-body">
                <p>Trước khi vào bất kỳ lệnh nào, bạn phải <strong>"nhìn sang phải"</strong> - kiểm tra xem có chướng ngại vật nào chặn đường đến TP không.</p>

                <div class="concept-box">
                    <div class="concept-text">LOOK RIGHT = Check Obstacles Before Entry</div>
                    <div class="concept-desc">Nếu có chướng ngại vật lớn trước TP1 → KHÔNG VÀO LỆNH</div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x400/112250/00F0FF?text=Look+Right+Rule+Visualization" alt="Look Right Rule">
                    <p class="image-caption">Hình 6.4.1: "Nhìn sang phải" để check obstacles trước khi entry</p>
                </div>

                <p><strong>Tại sao cần Look Right?</strong></p>
                <ul class="styled-list">
                    <li>Zone tốt ≠ Trade tốt nếu có obstacle chặn đường</li>
                    <li>R:R trên giấy có thể không đạt được do resistance/support</li>
                    <li>Tránh vào trade có xác suất thấp dù zone chất lượng cao</li>
                    <li>Giúp filter 30-40% bad trades ngay từ đầu</li>
                </ul>
            </div>
        </article>

        <!-- Section 2: Types of Obstacles -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon red">🚧</div>
                <div class="card-meta">
                    <h3>5 Loại Chướng Ngại Vật</h3>
                    <span>Obstacles cần kiểm tra trước khi trade</span>
                </div>
            </div>
            <div class="card-body">
                <div class="obstacle-grid">
                    <div class="obstacle-card">
                        <div class="obstacle-header">
                            <span class="obstacle-icon">📊</span>
                            <span class="obstacle-name">Opposite Zone</span>
                        </div>
                        <div class="obstacle-desc">HFZ phía trên (nếu Long) hoặc LFZ phía dưới (nếu Short) nằm quá gần entry</div>
                    </div>

                    <div class="obstacle-card">
                        <div class="obstacle-header">
                            <span class="obstacle-icon">📈</span>
                            <span class="obstacle-name">Major S/R Level</span>
                        </div>
                        <div class="obstacle-desc">Daily/Weekly support hoặc resistance mạnh trên đường đi</div>
                    </div>

                    <div class="obstacle-card">
                        <div class="obstacle-header">
                            <span class="obstacle-icon">💹</span>
                            <span class="obstacle-name">Round Number</span>
                        </div>
                        <div class="obstacle-desc">Số tròn tâm lý (40,000 / 50,000 / 100,000) thường có phản ứng mạnh</div>
                    </div>

                    <div class="obstacle-card">
                        <div class="obstacle-header">
                            <span class="obstacle-icon">📉</span>
                            <span class="obstacle-name">EMA 200</span>
                        </div>
                        <div class="obstacle-desc">EMA 200 (Daily) là dynamic support/resistance cực mạnh</div>
                    </div>

                    <div class="obstacle-card">
                        <div class="obstacle-header">
                            <span class="obstacle-icon">⏸️</span>
                            <span class="obstacle-name">Previous High/Low</span>
                        </div>
                        <div class="obstacle-desc">Swing high/low của tuần trước, tháng trước thường được test lại</div>
                    </div>

                    <div class="obstacle-card">
                        <div class="obstacle-header">
                            <span class="obstacle-icon">📋</span>
                            <span class="obstacle-name">Gap/Fair Value</span>
                        </div>
                        <div class="obstacle-desc">CME Gap hoặc Fair Value Gap chưa được fill</div>
                    </div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x400/112250/EF4444?text=6+Types+of+Obstacles" alt="Types of Obstacles">
                    <p class="image-caption">Hình 6.4.2: 6 loại chướng ngại vật thường gặp</p>
                </div>
            </div>
        </article>

        <!-- Section 3: Look Right Checklist -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">✅</div>
                <div class="card-meta">
                    <h3>Look Right Checklist</h3>
                    <span>Quy trình kiểm tra 5 bước</span>
                </div>
            </div>
            <div class="card-body">
                <p>Trước MỖI lệnh, chạy qua checklist này:</p>

                <div class="checklist-box">
                    <div class="checklist-title">📋 Pre-Entry Obstacle Check</div>
                    <ul class="checklist-items">
                        <li>Có zone đối diện nào trong khoảng R:R 1:1 không?</li>
                        <li>Có major S/R level (Daily/Weekly) trên đường đi không?</li>
                        <li>Có round number quan trọng không? (40K, 50K, 100K...)</li>
                        <li>EMA 200 (Daily) nằm ở đâu so với TP target?</li>
                        <li>Có unfilled gap hoặc FVG trên đường đi không?</li>
                    </ul>
                </div>

                <p><strong>Quy tắc đánh giá:</strong></p>
                <table class="comparison-table">
                    <tr>
                        <th>Obstacle Location</th>
                        <th>Action</th>
                    </tr>
                    <tr>
                        <td>Obstacle trước TP1 (R:R &lt; 1:2)</td>
                        <td style="color: #EF4444;"><strong>❌ SKIP TRADE</strong></td>
                    </tr>
                    <tr>
                        <td>Obstacle giữa TP1 và TP2</td>
                        <td style="color: #F59E0B;"><strong>⚠️ Adjust TP2 xuống obstacle</strong></td>
                    </tr>
                    <tr>
                        <td>Obstacle sau TP2</td>
                        <td style="color: #10B981;"><strong>✓ OK - Không ảnh hưởng</strong></td>
                    </tr>
                </table>
            </div>
        </article>

        <!-- Section 4: R:R Minimum -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">📐</div>
                <div class="card-meta">
                    <h3>Quy Tắc R:R Tối Thiểu</h3>
                    <span>Minimum R:R 1:2 để có kỳ vọng dương</span>
                </div>
            </div>
            <div class="card-body">
                <p>Nếu obstacle chặn đường khiến R:R xuống dưới <strong>1:2</strong>, trade đó có kỳ vọng âm dù zone chất lượng cao.</p>

                <div class="concept-box red">
                    <div class="concept-text">R:R < 1:2 = KHÔNG VÀO LỆNH</div>
                    <div class="concept-desc">Dù zone score 10/10 - nếu obstacle chặn khiến R:R thấp, phải skip</div>
                </div>

                <p><strong>Toán học R:R:</strong></p>
                <ul class="styled-list gold">
                    <li><strong>Win rate 50%:</strong> Cần R:R ≥ 1:2 để có lợi nhuận dương</li>
                    <li><strong>Win rate 40%:</strong> Cần R:R ≥ 1:3 để breakeven</li>
                    <li><strong>Win rate 60%:</strong> R:R 1:1.5 vẫn có lợi nhuận</li>
                </ul>

                <div class="tip-box warning">
                    <div class="tip-header">⚠️ Quan trọng</div>
                    <p>GEM Method với win rate ~50-55% yêu cầu <strong>R:R tối thiểu 1:2</strong> để có kỳ vọng dương. Đây là quy tắc KHÔNG thương lượng.</p>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/FFBD59?text=RR+Calculation+Example" alt="R:R Calculation">
                    <p class="image-caption">Hình 6.4.3: Tính R:R thực tế khi có obstacle</p>
                </div>
            </div>
        </article>

        <!-- Section 5: Decision Framework -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">🎯</div>
                <div class="card-meta">
                    <h3>Framework Quyết Định</h3>
                    <span>GO hoặc NO-GO dựa trên Look Right</span>
                </div>
            </div>
            <div class="card-body">
                <div class="decision-grid">
                    <div class="decision-card go">
                        <div class="decision-icon">✅</div>
                        <div class="decision-title">GO - Vào Lệnh</div>
                        <div class="decision-desc">
                            • Không có obstacle trước TP1<br>
                            • R:R ≥ 1:2<br>
                            • Clear path đến target
                        </div>
                    </div>

                    <div class="decision-card no-go">
                        <div class="decision-icon">❌</div>
                        <div class="decision-title">NO-GO - Skip</div>
                        <div class="decision-desc">
                            • Có obstacle trước TP1<br>
                            • R:R < 1:2<br>
                            • Nhiều confluent obstacles
                        </div>
                    </div>
                </div>

                <p><strong>Ví dụ thực tế:</strong></p>
                <table class="comparison-table">
                    <tr>
                        <th>Tình huống</th>
                        <th>Phân tích</th>
                        <th>Quyết định</th>
                    </tr>
                    <tr>
                        <td>Long từ LFZ, HFZ cách 1R</td>
                        <td>R:R chỉ 1:1</td>
                        <td style="color: #EF4444;">❌ SKIP</td>
                    </tr>
                    <tr>
                        <td>Long từ LFZ, EMA200 cách 3R</td>
                        <td>R:R = 1:3, EMA sau TP1</td>
                        <td style="color: #10B981;">✅ GO</td>
                    </tr>
                    <tr>
                        <td>Short từ HFZ, round number 50K cách 2.5R</td>
                        <td>R:R 1:2.5, adjust TP2</td>
                        <td style="color: #F59E0B;">⚠️ GO (adjust TP)</td>
                    </tr>
                </table>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x400/112250/10B981?text=GO+vs+NO-GO+Examples" alt="GO vs NO-GO">
                    <p class="image-caption">Hình 6.4.4: Ví dụ GO trade vs NO-GO trade</p>
                </div>
            </div>
        </article>

        <!-- Section 6: Real Example -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">📊</div>
                <div class="card-meta">
                    <h3>Ví Dụ Thực Tế</h3>
                    <span>Áp dụng Look Right Rule</span>
                </div>
            </div>
            <div class="card-body">
                <p><strong>Scenario:</strong> Long opportunity từ LFZ tại $42,000</p>

                <table class="comparison-table">
                    <tr>
                        <th>Thông tin Trade</th>
                        <th>Giá trị</th>
                    </tr>
                    <tr>
                        <td>Entry (LFZ)</td>
                        <td>$42,000</td>
                    </tr>
                    <tr>
                        <td>Stop Loss</td>
                        <td>$41,500 (SL distance: $500)</td>
                    </tr>
                    <tr>
                        <td>TP1 Target (R:R 1:2)</td>
                        <td>$43,000</td>
                    </tr>
                </table>

                <p style="margin-top: 1rem;"><strong>Look Right Check:</strong></p>
                <ul class="styled-list red">
                    <li><strong>Obstacle 1:</strong> Previous Week High tại $42,800</li>
                    <li><strong>Obstacle 2:</strong> HFZ bắt đầu từ $42,750</li>
                    <li><strong>Kết luận:</strong> Obstacle chặn TRƯỚC TP1!</li>
                </ul>

                <div class="concept-box red">
                    <div class="concept-text">QUYẾT ĐỊNH: ❌ NO-GO</div>
                    <div class="concept-desc">R:R thực tế chỉ ~1:1.5 do obstacle - SKIP trade này</div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x400/112250/8B5CF6?text=Look+Right+Case+Study" alt="Case Study">
                    <p class="image-caption">Hình 6.4.5: Case study - Trade bị skip do obstacle</p>
                </div>
            </div>
        </article>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Look Right Rule: Luôn check obstacles trước khi entry</li>
                <li>6 loại obstacles: Opposite Zone, S/R, Round Number, EMA200, Prev H/L, Gap</li>
                <li>Obstacle trước TP1 với R:R < 1:2 → SKIP trade</li>
                <li>Obstacle giữa TP1-TP2 → Adjust TP2 xuống obstacle</li>
                <li>R:R tối thiểu 1:2 là quy tắc bắt buộc</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <section class="quiz-section">
            <h3>🎯 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="2">
                <p><strong>Câu 1:</strong> Khi có obstacle chặn đường trước TP1 khiến R:R < 1:2, bạn nên làm gì?</p>
                <button class="quiz-option" data-index="0">Vẫn vào lệnh vì zone score cao</button>
                <button class="quiz-option" data-index="1">Mở rộng SL để tăng R:R</button>
                <button class="quiz-option" data-index="2">Skip trade - chờ cơ hội khác</button>
                <button class="quiz-option" data-index="3">Vào lệnh với size nhỏ hơn</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p><strong>Câu 2:</strong> Loại nào KHÔNG phải là obstacle cần check trong Look Right Rule?</p>
                <button class="quiz-option" data-index="0">Opposite Zone (HFZ/LFZ)</button>
                <button class="quiz-option" data-index="1">RSI oversold/overbought level</button>
                <button class="quiz-option" data-index="2">EMA 200 Daily</button>
                <button class="quiz-option" data-index="3">Round Number (50K, 100K)</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p><strong>Câu 3:</strong> R:R tối thiểu bắt buộc trong GEM Method là bao nhiêu?</p>
                <button class="quiz-option" data-index="0">1:2 (Reward gấp đôi Risk)</button>
                <button class="quiz-option" data-index="1">1:1 (Reward bằng Risk)</button>
                <button class="quiz-option" data-index="2">1:3 (Reward gấp 3 Risk)</button>
                <button class="quiz-option" data-index="3">Không có yêu cầu cố định</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <!-- Footer -->
        <footer class="lesson-footer">
            <div class="footer-logo">GEM Trading Academy</div>
            <p class="footer-text">Tier 2 - Advanced Trading • Bài 6.4</p>
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
    <title>Bài 6.4: Quy Tắc "Nhìn Sang Phải" - GEM Trading Academy</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: #0a0a0f;
            color: #e4e4e7;
            line-height: 1.6;
            font-size: 16px;
        }

        /* Container - Facebook Style */
        .container {
            max-width: 680px;
            margin: 0 auto;
            background: #0a0a0f;
        }

        /* Header - Compact Style */
        .lesson-header {
            padding: 1rem;
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(17, 34, 80, 0.3) 100%);
            border-bottom: 1px solid rgba(0, 240, 255, 0.2);
        }

        .lesson-badge {
            display: inline-block;
            background: linear-gradient(135deg, #00F0FF 0%, #0080FF 100%);
            color: #000;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 0.25rem;
        }

        .lesson-subtitle {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        /* Content Card - Facebook Post Style */
        .content-card {
            background: #18181b;
            margin-bottom: 0.5rem;
        }

        .card-header {
            display: flex;
            align-items: center;
            padding: 1rem;
            gap: 0.75rem;
        }

        .card-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            flex-shrink: 0;
        }

        .card-icon.cyan { background: rgba(0, 240, 255, 0.2); }
        .card-icon.gold { background: rgba(255, 189, 89, 0.2); }
        .card-icon.red { background: rgba(239, 68, 68, 0.2); }
        .card-icon.green { background: rgba(16, 185, 129, 0.2); }
        .card-icon.purple { background: rgba(139, 92, 246, 0.2); }

        .card-meta h3 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: #ffffff;
        }

        .card-meta span {
            font-size: 0.75rem;
            color: #71717a;
        }

        .card-body {
            padding: 0 1rem 1rem 1rem;
        }

        .card-body p {
            color: #d4d4d8;
            margin-bottom: 0.75rem;
        }

        /* Lists */
        .styled-list {
            list-style: none;
            padding: 0;
            margin: 1rem 0;
        }

        .styled-list li {
            padding: 0.75rem 1rem;
            background: rgba(0, 240, 255, 0.05);
            border-left: 3px solid #00F0FF;
            margin-bottom: 0.5rem;
            border-radius: 0 0.5rem 0.5rem 0;
        }

        .styled-list.red li {
            background: rgba(239, 68, 68, 0.05);
            border-left-color: #EF4444;
        }

        .styled-list.green li {
            background: rgba(16, 185, 129, 0.05);
            border-left-color: #10B981;
        }

        .styled-list.gold li {
            background: rgba(255, 189, 89, 0.05);
            border-left-color: #FFBD59;
        }

        /* Concept Box */
        .concept-box {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(17, 34, 80, 0.2) 100%);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem 0;
            text-align: center;
        }

        .concept-box.red {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(100, 20, 20, 0.2) 100%);
            border-color: rgba(239, 68, 68, 0.3);
        }

        .concept-box .concept-text {
            font-size: 1.25rem;
            font-weight: 700;
            color: #00F0FF;
            margin-bottom: 0.5rem;
        }

        .concept-box.red .concept-text {
            color: #EF4444;
        }

        .concept-box .concept-desc {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        /* Image Container */
        .image-container {
            margin: 1rem 0;
            border-radius: 0.5rem;
            overflow: hidden;
        }

        .image-container img {
            width: 100%;
            height: auto;
            display: block;
        }

        .image-caption {
            font-size: 0.75rem;
            color: #71717a;
            text-align: center;
            padding: 0.5rem;
            background: rgba(0, 0, 0, 0.3);
        }

        /* Obstacle Cards */
        .obstacle-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .obstacle-card {
            background: rgba(239, 68, 68, 0.08);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
        }

        .obstacle-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }

        .obstacle-icon {
            font-size: 1.25rem;
        }

        .obstacle-name {
            font-weight: 600;
            color: #EF4444;
        }

        .obstacle-desc {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        /* Checklist Box */
        .checklist-box {
            background: rgba(0, 240, 255, 0.05);
            border: 1px solid rgba(0, 240, 255, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .checklist-title {
            font-weight: 600;
            color: #00F0FF;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .checklist-items {
            list-style: none;
            padding: 0;
        }

        .checklist-items li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: #d4d4d8;
            font-size: 0.9375rem;
        }

        .checklist-items li::before {
            content: "☐";
            position: absolute;
            left: 0;
            color: #00F0FF;
        }

        /* Comparison Table */
        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            font-size: 0.875rem;
        }

        .comparison-table th {
            background: rgba(0, 240, 255, 0.2);
            color: #00F0FF;
            padding: 0.75rem;
            text-align: left;
            font-weight: 600;
        }

        .comparison-table td {
            padding: 0.75rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .comparison-table tr:nth-child(even) {
            background: rgba(255, 255, 255, 0.02);
        }

        /* Decision Box */
        .decision-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .decision-card {
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
        }

        .decision-card.go {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .decision-card.no-go {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .decision-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        .decision-title {
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .decision-card.go .decision-title {
            color: #10B981;
        }

        .decision-card.no-go .decision-title {
            color: #EF4444;
        }

        .decision-desc {
            font-size: 0.8125rem;
            color: #a1a1aa;
        }

        /* Tip Box */
        .tip-box {
            background: rgba(0, 240, 255, 0.1);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .tip-box.warning {
            background: rgba(245, 158, 11, 0.1);
            border-color: rgba(245, 158, 11, 0.3);
        }

        .tip-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            color: #00F0FF;
            margin-bottom: 0.5rem;
        }

        .tip-box.warning .tip-header {
            color: #F59E0B;
        }

        /* Summary Box */
        .summary-box {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(17, 34, 80, 0.2) 100%);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem;
        }

        .summary-box h3 {
            color: #00F0FF;
            font-size: 1rem;
            margin-bottom: 0.75rem;
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
            color: #d4d4d8;
        }

        .summary-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #00F0FF;
            font-weight: bold;
        }

        /* Quiz Section */
        .quiz-section {
            background: #18181b;
            margin: 0.5rem 0;
            padding: 1.5rem 1rem;
        }

        .quiz-section h3 {
            color: #ffffff;
            font-size: 1.125rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: rgba(0, 240, 255, 0.05);
            border: 1px solid rgba(0, 240, 255, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 500;
            color: #fff;
            margin-bottom: 0.75rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            text-align: left;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            color: #d4d4d8;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .quiz-option:hover {
            background: rgba(0, 240, 255, 0.1);
            border-color: rgba(0, 240, 255, 0.3);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: #10B981;
            color: #10B981;
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: #EF4444;
            color: #EF4444;
        }

        .quiz-result {
            display: none;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-top: 0.75rem;
            font-weight: 500;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: #10B981;
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: #EF4444;
        }

        .quiz-score {
            display: none;
            text-align: center;
            padding: 1rem;
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(17, 34, 80, 0.2) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: #00F0FF;
        }

        .quiz-score .score-label {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .retake-btn {
            background: linear-gradient(135deg, #00F0FF 0%, #0080FF 100%);
            color: #000;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1rem;
        }

        /* Footer */
        .lesson-footer {
            padding: 1.5rem 1rem;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #00F0FF 0%, #FFBD59 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .footer-text {
            font-size: 0.75rem;
            color: #71717a;
            margin-top: 0.25rem;
        }

        /* Responsive - Mobile First */
        @media (max-width: 600px) {
            .container {
                padding: 0;
            }

            .content-card {
                border-radius: 0;
                border-left: none;
                border-right: none;
            }

            .card-body {
                padding: 0 1rem 1rem 1rem;
            }

            .decision-grid {
                grid-template-columns: 1fr;
            }

            .lesson-title {
                font-size: 1.25rem;
            }
        }

        @media (min-width: 600px) {
            .container {
                padding: 1.5rem;
            }

            .content-card {
                border-radius: 0.75rem;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .obstacle-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="lesson-header">
            <span class="lesson-badge">🔍 Tier 2 - Chương 6</span>
            <h1 class="lesson-title">Bài 6.4: Quy Tắc "Nhìn Sang Phải"</h1>
            <p class="lesson-subtitle">Look Right Rule - Kiểm tra chướng ngại vật trước khi vào lệnh</p>
        </header>

        <!-- Section 1: Look Right Rule Concept -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">👁️</div>
                <div class="card-meta">
                    <h3>Quy Tắc Nhìn Sang Phải</h3>
                    <span>"Look Right Before You Trade"</span>
                </div>
            </div>
            <div class="card-body">
                <p>Trước khi vào bất kỳ lệnh nào, bạn phải <strong>"nhìn sang phải"</strong> - kiểm tra xem có chướng ngại vật nào chặn đường đến TP không.</p>

                <div class="concept-box">
                    <div class="concept-text">LOOK RIGHT = Check Obstacles Before Entry</div>
                    <div class="concept-desc">Nếu có chướng ngại vật lớn trước TP1 → KHÔNG VÀO LỆNH</div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x400/112250/00F0FF?text=Look+Right+Rule+Visualization" alt="Look Right Rule">
                    <p class="image-caption">Hình 6.4.1: "Nhìn sang phải" để check obstacles trước khi entry</p>
                </div>

                <p><strong>Tại sao cần Look Right?</strong></p>
                <ul class="styled-list">
                    <li>Zone tốt ≠ Trade tốt nếu có obstacle chặn đường</li>
                    <li>R:R trên giấy có thể không đạt được do resistance/support</li>
                    <li>Tránh vào trade có xác suất thấp dù zone chất lượng cao</li>
                    <li>Giúp filter 30-40% bad trades ngay từ đầu</li>
                </ul>
            </div>
        </article>

        <!-- Section 2: Types of Obstacles -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon red">🚧</div>
                <div class="card-meta">
                    <h3>5 Loại Chướng Ngại Vật</h3>
                    <span>Obstacles cần kiểm tra trước khi trade</span>
                </div>
            </div>
            <div class="card-body">
                <div class="obstacle-grid">
                    <div class="obstacle-card">
                        <div class="obstacle-header">
                            <span class="obstacle-icon">📊</span>
                            <span class="obstacle-name">Opposite Zone</span>
                        </div>
                        <div class="obstacle-desc">HFZ phía trên (nếu Long) hoặc LFZ phía dưới (nếu Short) nằm quá gần entry</div>
                    </div>

                    <div class="obstacle-card">
                        <div class="obstacle-header">
                            <span class="obstacle-icon">📈</span>
                            <span class="obstacle-name">Major S/R Level</span>
                        </div>
                        <div class="obstacle-desc">Daily/Weekly support hoặc resistance mạnh trên đường đi</div>
                    </div>

                    <div class="obstacle-card">
                        <div class="obstacle-header">
                            <span class="obstacle-icon">💹</span>
                            <span class="obstacle-name">Round Number</span>
                        </div>
                        <div class="obstacle-desc">Số tròn tâm lý (40,000 / 50,000 / 100,000) thường có phản ứng mạnh</div>
                    </div>

                    <div class="obstacle-card">
                        <div class="obstacle-header">
                            <span class="obstacle-icon">📉</span>
                            <span class="obstacle-name">EMA 200</span>
                        </div>
                        <div class="obstacle-desc">EMA 200 (Daily) là dynamic support/resistance cực mạnh</div>
                    </div>

                    <div class="obstacle-card">
                        <div class="obstacle-header">
                            <span class="obstacle-icon">⏸️</span>
                            <span class="obstacle-name">Previous High/Low</span>
                        </div>
                        <div class="obstacle-desc">Swing high/low của tuần trước, tháng trước thường được test lại</div>
                    </div>

                    <div class="obstacle-card">
                        <div class="obstacle-header">
                            <span class="obstacle-icon">📋</span>
                            <span class="obstacle-name">Gap/Fair Value</span>
                        </div>
                        <div class="obstacle-desc">CME Gap hoặc Fair Value Gap chưa được fill</div>
                    </div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x400/112250/EF4444?text=6+Types+of+Obstacles" alt="Types of Obstacles">
                    <p class="image-caption">Hình 6.4.2: 6 loại chướng ngại vật thường gặp</p>
                </div>
            </div>
        </article>

        <!-- Section 3: Look Right Checklist -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">✅</div>
                <div class="card-meta">
                    <h3>Look Right Checklist</h3>
                    <span>Quy trình kiểm tra 5 bước</span>
                </div>
            </div>
            <div class="card-body">
                <p>Trước MỖI lệnh, chạy qua checklist này:</p>

                <div class="checklist-box">
                    <div class="checklist-title">📋 Pre-Entry Obstacle Check</div>
                    <ul class="checklist-items">
                        <li>Có zone đối diện nào trong khoảng R:R 1:1 không?</li>
                        <li>Có major S/R level (Daily/Weekly) trên đường đi không?</li>
                        <li>Có round number quan trọng không? (40K, 50K, 100K...)</li>
                        <li>EMA 200 (Daily) nằm ở đâu so với TP target?</li>
                        <li>Có unfilled gap hoặc FVG trên đường đi không?</li>
                    </ul>
                </div>

                <p><strong>Quy tắc đánh giá:</strong></p>
                <table class="comparison-table">
                    <tr>
                        <th>Obstacle Location</th>
                        <th>Action</th>
                    </tr>
                    <tr>
                        <td>Obstacle trước TP1 (R:R &lt; 1:2)</td>
                        <td style="color: #EF4444;"><strong>❌ SKIP TRADE</strong></td>
                    </tr>
                    <tr>
                        <td>Obstacle giữa TP1 và TP2</td>
                        <td style="color: #F59E0B;"><strong>⚠️ Adjust TP2 xuống obstacle</strong></td>
                    </tr>
                    <tr>
                        <td>Obstacle sau TP2</td>
                        <td style="color: #10B981;"><strong>✓ OK - Không ảnh hưởng</strong></td>
                    </tr>
                </table>
            </div>
        </article>

        <!-- Section 4: R:R Minimum -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">📐</div>
                <div class="card-meta">
                    <h3>Quy Tắc R:R Tối Thiểu</h3>
                    <span>Minimum R:R 1:2 để có kỳ vọng dương</span>
                </div>
            </div>
            <div class="card-body">
                <p>Nếu obstacle chặn đường khiến R:R xuống dưới <strong>1:2</strong>, trade đó có kỳ vọng âm dù zone chất lượng cao.</p>

                <div class="concept-box red">
                    <div class="concept-text">R:R < 1:2 = KHÔNG VÀO LỆNH</div>
                    <div class="concept-desc">Dù zone score 10/10 - nếu obstacle chặn khiến R:R thấp, phải skip</div>
                </div>

                <p><strong>Toán học R:R:</strong></p>
                <ul class="styled-list gold">
                    <li><strong>Win rate 50%:</strong> Cần R:R ≥ 1:2 để có lợi nhuận dương</li>
                    <li><strong>Win rate 40%:</strong> Cần R:R ≥ 1:3 để breakeven</li>
                    <li><strong>Win rate 60%:</strong> R:R 1:1.5 vẫn có lợi nhuận</li>
                </ul>

                <div class="tip-box warning">
                    <div class="tip-header">⚠️ Quan trọng</div>
                    <p>GEM Method với win rate ~50-55% yêu cầu <strong>R:R tối thiểu 1:2</strong> để có kỳ vọng dương. Đây là quy tắc KHÔNG thương lượng.</p>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/FFBD59?text=RR+Calculation+Example" alt="R:R Calculation">
                    <p class="image-caption">Hình 6.4.3: Tính R:R thực tế khi có obstacle</p>
                </div>
            </div>
        </article>

        <!-- Section 5: Decision Framework -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">🎯</div>
                <div class="card-meta">
                    <h3>Framework Quyết Định</h3>
                    <span>GO hoặc NO-GO dựa trên Look Right</span>
                </div>
            </div>
            <div class="card-body">
                <div class="decision-grid">
                    <div class="decision-card go">
                        <div class="decision-icon">✅</div>
                        <div class="decision-title">GO - Vào Lệnh</div>
                        <div class="decision-desc">
                            • Không có obstacle trước TP1<br>
                            • R:R ≥ 1:2<br>
                            • Clear path đến target
                        </div>
                    </div>

                    <div class="decision-card no-go">
                        <div class="decision-icon">❌</div>
                        <div class="decision-title">NO-GO - Skip</div>
                        <div class="decision-desc">
                            • Có obstacle trước TP1<br>
                            • R:R < 1:2<br>
                            • Nhiều confluent obstacles
                        </div>
                    </div>
                </div>

                <p><strong>Ví dụ thực tế:</strong></p>
                <table class="comparison-table">
                    <tr>
                        <th>Tình huống</th>
                        <th>Phân tích</th>
                        <th>Quyết định</th>
                    </tr>
                    <tr>
                        <td>Long từ LFZ, HFZ cách 1R</td>
                        <td>R:R chỉ 1:1</td>
                        <td style="color: #EF4444;">❌ SKIP</td>
                    </tr>
                    <tr>
                        <td>Long từ LFZ, EMA200 cách 3R</td>
                        <td>R:R = 1:3, EMA sau TP1</td>
                        <td style="color: #10B981;">✅ GO</td>
                    </tr>
                    <tr>
                        <td>Short từ HFZ, round number 50K cách 2.5R</td>
                        <td>R:R 1:2.5, adjust TP2</td>
                        <td style="color: #F59E0B;">⚠️ GO (adjust TP)</td>
                    </tr>
                </table>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x400/112250/10B981?text=GO+vs+NO-GO+Examples" alt="GO vs NO-GO">
                    <p class="image-caption">Hình 6.4.4: Ví dụ GO trade vs NO-GO trade</p>
                </div>
            </div>
        </article>

        <!-- Section 6: Real Example -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">📊</div>
                <div class="card-meta">
                    <h3>Ví Dụ Thực Tế</h3>
                    <span>Áp dụng Look Right Rule</span>
                </div>
            </div>
            <div class="card-body">
                <p><strong>Scenario:</strong> Long opportunity từ LFZ tại $42,000</p>

                <table class="comparison-table">
                    <tr>
                        <th>Thông tin Trade</th>
                        <th>Giá trị</th>
                    </tr>
                    <tr>
                        <td>Entry (LFZ)</td>
                        <td>$42,000</td>
                    </tr>
                    <tr>
                        <td>Stop Loss</td>
                        <td>$41,500 (SL distance: $500)</td>
                    </tr>
                    <tr>
                        <td>TP1 Target (R:R 1:2)</td>
                        <td>$43,000</td>
                    </tr>
                </table>

                <p style="margin-top: 1rem;"><strong>Look Right Check:</strong></p>
                <ul class="styled-list red">
                    <li><strong>Obstacle 1:</strong> Previous Week High tại $42,800</li>
                    <li><strong>Obstacle 2:</strong> HFZ bắt đầu từ $42,750</li>
                    <li><strong>Kết luận:</strong> Obstacle chặn TRƯỚC TP1!</li>
                </ul>

                <div class="concept-box red">
                    <div class="concept-text">QUYẾT ĐỊNH: ❌ NO-GO</div>
                    <div class="concept-desc">R:R thực tế chỉ ~1:1.5 do obstacle - SKIP trade này</div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x400/112250/8B5CF6?text=Look+Right+Case+Study" alt="Case Study">
                    <p class="image-caption">Hình 6.4.5: Case study - Trade bị skip do obstacle</p>
                </div>
            </div>
        </article>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Look Right Rule: Luôn check obstacles trước khi entry</li>
                <li>6 loại obstacles: Opposite Zone, S/R, Round Number, EMA200, Prev H/L, Gap</li>
                <li>Obstacle trước TP1 với R:R < 1:2 → SKIP trade</li>
                <li>Obstacle giữa TP1-TP2 → Adjust TP2 xuống obstacle</li>
                <li>R:R tối thiểu 1:2 là quy tắc bắt buộc</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <section class="quiz-section">
            <h3>🎯 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="2">
                <p><strong>Câu 1:</strong> Khi có obstacle chặn đường trước TP1 khiến R:R < 1:2, bạn nên làm gì?</p>
                <button class="quiz-option" data-index="0">Vẫn vào lệnh vì zone score cao</button>
                <button class="quiz-option" data-index="1">Mở rộng SL để tăng R:R</button>
                <button class="quiz-option" data-index="2">Skip trade - chờ cơ hội khác</button>
                <button class="quiz-option" data-index="3">Vào lệnh với size nhỏ hơn</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p><strong>Câu 2:</strong> Loại nào KHÔNG phải là obstacle cần check trong Look Right Rule?</p>
                <button class="quiz-option" data-index="0">Opposite Zone (HFZ/LFZ)</button>
                <button class="quiz-option" data-index="1">RSI oversold/overbought level</button>
                <button class="quiz-option" data-index="2">EMA 200 Daily</button>
                <button class="quiz-option" data-index="3">Round Number (50K, 100K)</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p><strong>Câu 3:</strong> R:R tối thiểu bắt buộc trong GEM Method là bao nhiêu?</p>
                <button class="quiz-option" data-index="0">1:2 (Reward gấp đôi Risk)</button>
                <button class="quiz-option" data-index="1">1:1 (Reward bằng Risk)</button>
                <button class="quiz-option" data-index="2">1:3 (Reward gấp 3 Risk)</button>
                <button class="quiz-option" data-index="3">Không có yêu cầu cố định</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <!-- Footer -->
        <footer class="lesson-footer">
            <div class="footer-logo">GEM Trading Academy</div>
            <p class="footer-text">Tier 2 - Advanced Trading • Bài 6.4</p>
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

-- Lesson 6.5: Tổng Kết & Xem Trước TIER 3 - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch6-l5',
  'module-tier-2-ch6',
  'course-tier2-trading-advanced',
  'Bài 6.5: Tổng Kết & Xem Trước TIER 3 - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 6.5: Tổng Kết & Xem Trước TIER 3 - GEM Trading Academy</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: #0a0a0f;
            color: #e4e4e7;
            line-height: 1.6;
            font-size: 16px;
        }

        /* Container - Facebook Style */
        .container {
            max-width: 680px;
            margin: 0 auto;
            background: #0a0a0f;
        }

        /* Header - Compact Style */
        .lesson-header {
            padding: 1rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
            border-bottom: 1px solid rgba(255, 189, 89, 0.2);
        }

        .lesson-badge {
            display: inline-block;
            background: linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%);
            color: #000;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 0.25rem;
        }

        .lesson-subtitle {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        /* Content Card - Facebook Post Style */
        .content-card {
            background: #18181b;
            margin-bottom: 0.5rem;
        }

        .card-header {
            display: flex;
            align-items: center;
            padding: 1rem;
            gap: 0.75rem;
        }

        .card-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            flex-shrink: 0;
        }

        .card-icon.gold { background: rgba(255, 189, 89, 0.2); }
        .card-icon.purple { background: rgba(139, 92, 246, 0.2); }
        .card-icon.cyan { background: rgba(0, 240, 255, 0.2); }
        .card-icon.green { background: rgba(16, 185, 129, 0.2); }
        .card-icon.red { background: rgba(239, 68, 68, 0.2); }

        .card-meta h3 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: #ffffff;
        }

        .card-meta span {
            font-size: 0.75rem;
            color: #71717a;
        }

        .card-body {
            padding: 0 1rem 1rem 1rem;
        }

        .card-body p {
            color: #d4d4d8;
            margin-bottom: 0.75rem;
        }

        /* Lists */
        .styled-list {
            list-style: none;
            padding: 0;
            margin: 1rem 0;
        }

        .styled-list li {
            padding: 0.75rem 1rem;
            background: rgba(255, 189, 89, 0.05);
            border-left: 3px solid #FFBD59;
            margin-bottom: 0.5rem;
            border-radius: 0 0.5rem 0.5rem 0;
        }

        .styled-list.purple li {
            background: rgba(139, 92, 246, 0.05);
            border-left-color: #8B5CF6;
        }

        .styled-list.cyan li {
            background: rgba(0, 240, 255, 0.05);
            border-left-color: #00F0FF;
        }

        .styled-list.green li {
            background: rgba(16, 185, 129, 0.05);
            border-left-color: #10B981;
        }

        /* Image Container */
        .image-container {
            margin: 1rem 0;
            border-radius: 0.5rem;
            overflow: hidden;
        }

        .image-container img {
            width: 100%;
            height: auto;
            display: block;
        }

        .image-caption {
            font-size: 0.75rem;
            color: #71717a;
            text-align: center;
            padding: 0.5rem;
            background: rgba(0, 0, 0, 0.3);
        }

        /* Tier Progress */
        .tier-progress {
            background: rgba(255, 189, 89, 0.1);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        .tier-progress h4 {
            color: #FFBD59;
            font-size: 1rem;
            margin-bottom: 1rem;
            text-align: center;
        }

        .progress-bar {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            height: 1.5rem;
            overflow: hidden;
            margin-bottom: 0.5rem;
        }

        .progress-fill {
            background: linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%);
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #000;
            font-weight: 600;
            font-size: 0.75rem;
        }

        .progress-label {
            text-align: center;
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        /* Skill Cards Grid */
        .skill-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .skill-card {
            background: rgba(16, 185, 129, 0.08);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
        }

        .skill-icon {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .skill-name {
            font-size: 0.8125rem;
            font-weight: 600;
            color: #10B981;
            margin-bottom: 0.25rem;
        }

        .skill-status {
            font-size: 0.6875rem;
            color: #71717a;
        }

        /* Tier 3 Preview Cards */
        .preview-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .preview-card {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(100, 50, 200, 0.1) 100%);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
        }

        .preview-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
        }

        .preview-badge {
            background: #8B5CF6;
            color: white;
            font-size: 0.6875rem;
            font-weight: 700;
            padding: 0.2rem 0.5rem;
            border-radius: 0.25rem;
        }

        .preview-title {
            font-weight: 600;
            color: #fff;
            font-size: 0.9375rem;
        }

        .preview-desc {
            font-size: 0.8125rem;
            color: #a1a1aa;
            line-height: 1.5;
        }

        .preview-topics {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 0.75rem;
        }

        .topic-tag {
            background: rgba(139, 92, 246, 0.2);
            color: #8B5CF6;
            font-size: 0.6875rem;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
        }

        /* Comparison Table */
        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            font-size: 0.875rem;
        }

        .comparison-table th {
            background: rgba(255, 189, 89, 0.2);
            color: #FFBD59;
            padding: 0.75rem;
            text-align: left;
            font-weight: 600;
        }

        .comparison-table td {
            padding: 0.75rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .comparison-table tr:nth-child(even) {
            background: rgba(255, 255, 255, 0.02);
        }

        /* Checklist Box */
        .checklist-box {
            background: rgba(16, 185, 129, 0.05);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .checklist-title {
            font-weight: 600;
            color: #10B981;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .checklist-items {
            list-style: none;
            padding: 0;
        }

        .checklist-items li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: #d4d4d8;
            font-size: 0.9375rem;
        }

        .checklist-items li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #10B981;
            font-weight: bold;
        }

        /* CTA Box */
        .cta-box {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(100, 50, 200, 0.2) 100%);
            border: 2px solid rgba(139, 92, 246, 0.5);
            border-radius: 0.75rem;
            padding: 1.5rem;
            margin: 1rem 0;
            text-align: center;
        }

        .cta-box h4 {
            color: #8B5CF6;
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
        }

        .cta-box p {
            color: #a1a1aa;
            margin-bottom: 1rem;
        }

        .cta-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
            color: white;
            padding: 0.5rem 1.5rem;
            border-radius: 2rem;
            font-weight: 600;
            font-size: 0.875rem;
        }

        /* Tip Box */
        .tip-box {
            background: rgba(255, 189, 89, 0.1);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .tip-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            color: #FFBD59;
            margin-bottom: 0.5rem;
        }

        /* Summary Box */
        .summary-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem;
        }

        .summary-box h3 {
            color: #FFBD59;
            font-size: 1rem;
            margin-bottom: 0.75rem;
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
            color: #d4d4d8;
        }

        .summary-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #FFBD59;
            font-weight: bold;
        }

        /* Quiz Section */
        .quiz-section {
            background: #18181b;
            margin: 0.5rem 0;
            padding: 1.5rem 1rem;
        }

        .quiz-section h3 {
            color: #ffffff;
            font-size: 1.125rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: rgba(255, 189, 89, 0.05);
            border: 1px solid rgba(255, 189, 89, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 500;
            color: #fff;
            margin-bottom: 0.75rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            text-align: left;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            color: #d4d4d8;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .quiz-option:hover {
            background: rgba(255, 189, 89, 0.1);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: #10B981;
            color: #10B981;
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: #EF4444;
            color: #EF4444;
        }

        .quiz-result {
            display: none;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-top: 0.75rem;
            font-weight: 500;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: #10B981;
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: #EF4444;
        }

        .quiz-score {
            display: none;
            text-align: center;
            padding: 1rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: #FFBD59;
        }

        .quiz-score .score-label {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .retake-btn {
            background: linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%);
            color: #000;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1rem;
        }

        /* Footer */
        .lesson-footer {
            padding: 1.5rem 1rem;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #FFBD59 0%, #8B5CF6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .footer-text {
            font-size: 0.75rem;
            color: #71717a;
            margin-top: 0.25rem;
        }

        /* Responsive - Mobile First */
        @media (max-width: 600px) {
            .container {
                padding: 0;
            }

            .content-card {
                border-radius: 0;
                border-left: none;
                border-right: none;
            }

            .card-body {
                padding: 0 1rem 1rem 1rem;
            }

            .skill-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .lesson-title {
                font-size: 1.25rem;
            }
        }

        @media (min-width: 600px) {
            .container {
                padding: 1.5rem;
            }

            .content-card {
                border-radius: 0.75rem;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .skill-grid {
                grid-template-columns: repeat(4, 1fr);
            }

            .preview-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="lesson-header">
            <span class="lesson-badge">🎓 Tier 2 - Chương 6</span>
            <h1 class="lesson-title">Bài 6.5: Tổng Kết & Xem Trước TIER 3</h1>
            <p class="lesson-subtitle">Ôn tập kiến thức TIER 2 - Chuẩn bị cho TIER 3 Elite</p>
        </header>

        <!-- Section 1: Tier 2 Completion -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">🏆</div>
                <div class="card-meta">
                    <h3>Chúc Mừng Hoàn Thành TIER 2!</h3>
                    <span>Advanced Trading Mastery</span>
                </div>
            </div>
            <div class="card-body">
                <p>Bạn đã hoàn thành <strong>TIER 2 - Advanced Trading</strong>! Đây là bước tiến quan trọng trong hành trình trở thành trader chuyên nghiệp.</p>

                <div class="tier-progress">
                    <h4>🎯 Tiến Trình Học Tập</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 66%;">TIER 2 Complete - 66%</div>
                    </div>
                    <p class="progress-label">Còn TIER 3 để hoàn thành chương trình</p>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/FFBD59?text=TIER+2+COMPLETE+CERTIFICATE" alt="Tier 2 Complete">
                    <p class="image-caption">Chứng nhận hoàn thành TIER 2 - Advanced Trading</p>
                </div>
            </div>
        </article>

        <!-- Section 2: Skills Acquired -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">✅</div>
                <div class="card-meta">
                    <h3>Kỹ Năng Đã Thành Thạo</h3>
                    <span>8 Core Skills từ TIER 2</span>
                </div>
            </div>
            <div class="card-body">
                <div class="skill-grid">
                    <div class="skill-card">
                        <div class="skill-icon">🔄</div>
                        <div class="skill-name">Pattern Combos</div>
                        <div class="skill-status">✓ Hoàn thành</div>
                    </div>
                    <div class="skill-card">
                        <div class="skill-icon">📊</div>
                        <div class="skill-name">MTF Analysis</div>
                        <div class="skill-status">✓ Hoàn thành</div>
                    </div>
                    <div class="skill-card">
                        <div class="skill-icon">⭐</div>
                        <div class="skill-name">Zone Grading</div>
                        <div class="skill-status">✓ Hoàn thành</div>
                    </div>
                    <div class="skill-card">
                        <div class="skill-icon">💰</div>
                        <div class="skill-name">Risk Management</div>
                        <div class="skill-status">✓ Hoàn thành</div>
                    </div>
                    <div class="skill-card">
                        <div class="skill-icon">🎯</div>
                        <div class="skill-name">Multi-TP Strategy</div>
                        <div class="skill-status">✓ Hoàn thành</div>
                    </div>
                    <div class="skill-card">
                        <div class="skill-icon">👁️</div>
                        <div class="skill-name">Look Right Rule</div>
                        <div class="skill-status">✓ Hoàn thành</div>
                    </div>
                    <div class="skill-card">
                        <div class="skill-icon">📈</div>
                        <div class="skill-name">Zone Hierarchy</div>
                        <div class="skill-status">✓ Hoàn thành</div>
                    </div>
                    <div class="skill-card">
                        <div class="skill-icon">🧮</div>
                        <div class="skill-name">Position Sizing</div>
                        <div class="skill-status">✓ Hoàn thành</div>
                    </div>
                </div>

                <div class="checklist-box">
                    <div class="checklist-title">📋 TIER 2 Mastery Checklist</div>
                    <ul class="checklist-items">
                        <li>Nhận diện được 8 Pattern Combos nâng cao</li>
                        <li>Áp dụng Multi-Timeframe Analysis với 3 khung thời gian</li>
                        <li>Chấm điểm Zone với Odds Enhancers</li>
                        <li>Tính Position Size đúng công thức</li>
                        <li>Đặt Stop Loss theo Zone + Buffer</li>
                        <li>Sử dụng Multi-TP Strategy (TP1/TP2/TP3)</li>
                        <li>Áp dụng Look Right Rule trước mỗi trade</li>
                    </ul>
                </div>
            </div>
        </article>

        <!-- Section 3: Tier 2 Key Formulas -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">📐</div>
                <div class="card-meta">
                    <h3>Công Thức Quan Trọng TIER 2</h3>
                    <span>Cheat sheet để tham khảo</span>
                </div>
            </div>
            <div class="card-body">
                <table class="comparison-table">
                    <tr>
                        <th>Công thức</th>
                        <th>Áp dụng</th>
                    </tr>
                    <tr>
                        <td><strong>Position Size</strong><br>= (TK × Risk%) / (Entry - SL)</td>
                        <td>Tính khối lượng lệnh đúng</td>
                    </tr>
                    <tr>
                        <td><strong>Stop Loss</strong><br>= Zone Edge + 0.5% Buffer</td>
                        <td>Đặt SL ngoài zone</td>
                    </tr>
                    <tr>
                        <td><strong>TP1</strong><br>= Entry ± (SL × 2)</td>
                        <td>Target R:R 1:2</td>
                    </tr>
                    <tr>
                        <td><strong>TP2</strong><br>= Measured Move (AB=CD)</td>
                        <td>Zone đối diện</td>
                    </tr>
                    <tr>
                        <td><strong>Trailing Stop</strong><br>= Close - (ATR × 2)</td>
                        <td>Lock profit khi trending</td>
                    </tr>
                    <tr>
                        <td><strong>Zone Score</strong><br>= Base + Odds Enhancers</td>
                        <td>Chấm điểm 1-10</td>
                    </tr>
                </table>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/00F0FF?text=TIER+2+Formula+Cheat+Sheet" alt="Formula Cheat Sheet">
                    <p class="image-caption">Hình 6.5.1: Cheat Sheet các công thức TIER 2</p>
                </div>
            </div>
        </article>

        <!-- Section 4: Tier 3 Preview -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">🚀</div>
                <div class="card-meta">
                    <h3>Xem Trước TIER 3 - Elite</h3>
                    <span>Nội dung nâng cao cho Pro Traders</span>
                </div>
            </div>
            <div class="card-body">
                <p>TIER 3 sẽ đưa bạn lên cấp độ <strong>Elite Trader</strong> với các kỹ thuật và chiến lược chuyên sâu nhất.</p>

                <div class="preview-grid">
                    <div class="preview-card">
                        <div class="preview-header">
                            <span class="preview-badge">CH.1</span>
                            <span class="preview-title">Order Flow & Liquidity</span>
                        </div>
                        <div class="preview-desc">Đọc dòng tiền thực, phân tích liquidity pools, và smart money concepts.</div>
                        <div class="preview-topics">
                            <span class="topic-tag">Order Flow</span>
                            <span class="topic-tag">Liquidity</span>
                            <span class="topic-tag">SMC</span>
                        </div>
                    </div>

                    <div class="preview-card">
                        <div class="preview-header">
                            <span class="preview-badge">CH.2</span>
                            <span class="preview-title">Advanced Entry Techniques</span>
                        </div>
                        <div class="preview-desc">Refinement entries, LTF patterns, và confirmation techniques.</div>
                        <div class="preview-topics">
                            <span class="topic-tag">Refinement</span>
                            <span class="topic-tag">LTF Entry</span>
                            <span class="topic-tag">Confirmation</span>
                        </div>
                    </div>

                    <div class="preview-card">
                        <div class="preview-header">
                            <span class="preview-badge">CH.3</span>
                            <span class="preview-title">Market Structure Deep Dive</span>
                        </div>
                        <div class="preview-desc">BOS, CHoCH, market structure shifts và trend identification.</div>
                        <div class="preview-topics">
                            <span class="topic-tag">BOS</span>
                            <span class="topic-tag">CHoCH</span>
                            <span class="topic-tag">MSS</span>
                        </div>
                    </div>

                    <div class="preview-card">
                        <div class="preview-header">
                            <span class="preview-badge">CH.4</span>
                            <span class="preview-title">Trading Psychology Elite</span>
                        </div>
                        <div class="preview-desc">Advanced mindset, drawdown management, và peak performance.</div>
                        <div class="preview-topics">
                            <span class="topic-tag">Mindset</span>
                            <span class="topic-tag">Drawdown</span>
                            <span class="topic-tag">Performance</span>
                        </div>
                    </div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x400/112250/8B5CF6?text=TIER+3+Elite+Preview" alt="Tier 3 Preview">
                    <p class="image-caption">Hình 6.5.2: TIER 3 - Hành trình trở thành Elite Trader</p>
                </div>
            </div>
        </article>

        <!-- Section 5: Requirements for Tier 3 -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">📋</div>
                <div class="card-meta">
                    <h3>Yêu Cầu Trước TIER 3</h3>
                    <span>Checklist chuẩn bị</span>
                </div>
            </div>
            <div class="card-body">
                <p>Để tối ưu việc học TIER 3, bạn cần đảm bảo:</p>

                <ul class="styled-list">
                    <li><strong>Paper Trade ít nhất 50 trades</strong> với GEM Method từ TIER 1 & 2</li>
                    <li><strong>Win rate ≥ 40%</strong> trên paper trades</li>
                    <li><strong>Hiểu rõ</strong> tất cả 24 patterns cơ bản</li>
                    <li><strong>Nhuần nhuyễn</strong> Multi-Timeframe Analysis</li>
                    <li><strong>Áp dụng được</strong> Position Sizing và Risk Management</li>
                </ul>

                <div class="tip-box">
                    <div class="tip-header">💡 Lời Khuyên</div>
                    <p>Nếu win rate dưới 40% trên paper trades, hãy ôn lại TIER 1 & 2 trước khi tiếp tục. TIER 3 sẽ không hiệu quả nếu foundation chưa vững.</p>
                </div>

                <table class="comparison-table">
                    <tr>
                        <th>Tiêu chí</th>
                        <th>Yêu cầu</th>
                        <th>Check</th>
                    </tr>
                    <tr>
                        <td>Paper Trades</td>
                        <td>≥ 50 trades</td>
                        <td>☐</td>
                    </tr>
                    <tr>
                        <td>Win Rate</td>
                        <td>≥ 40%</td>
                        <td>☐</td>
                    </tr>
                    <tr>
                        <td>Average R:R</td>
                        <td>≥ 1:2</td>
                        <td>☐</td>
                    </tr>
                    <tr>
                        <td>Pattern Recognition</td>
                        <td>24/24 patterns</td>
                        <td>☐</td>
                    </tr>
                    <tr>
                        <td>MTF Analysis</td>
                        <td>Thành thạo</td>
                        <td>☐</td>
                    </tr>
                </table>
            </div>
        </article>

        <!-- Section 6: CTA -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">🎯</div>
                <div class="card-meta">
                    <h3>Bước Tiếp Theo</h3>
                    <span>Hành động ngay!</span>
                </div>
            </div>
            <div class="card-body">
                <div class="cta-box">
                    <h4>🚀 Sẵn Sàng Cho TIER 3?</h4>
                    <p>Hoàn thành 50 paper trades với win rate ≥ 40%, sau đó đăng ký TIER 3 - Elite Trading để tiếp tục hành trình!</p>
                    <span class="cta-badge">TIER 3 - COMING SOON</span>
                </div>

                <ul class="styled-list purple">
                    <li><strong>Bước 1:</strong> Review lại tất cả lessons TIER 2</li>
                    <li><strong>Bước 2:</strong> Practice paper trading với GEM Scanner</li>
                    <li><strong>Bước 3:</strong> Track journal ít nhất 50 trades</li>
                    <li><strong>Bước 4:</strong> Đạt win rate ≥ 40% và R:R ≥ 1:2</li>
                    <li><strong>Bước 5:</strong> Đăng ký TIER 3 khi đã sẵn sàng</li>
                </ul>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/8B5CF6?text=Your+Elite+Trader+Journey" alt="Elite Journey">
                    <p class="image-caption">Hình 6.5.3: Hành trình trở thành Elite Trader</p>
                </div>
            </div>
        </article>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📝 Tóm Tắt TIER 2</h3>
            <ul class="summary-list">
                <li>Thành thạo 8 Pattern Combos nâng cao</li>
                <li>Multi-Timeframe Analysis: HTF → ITF → LTF</li>
                <li>Zone Grading System với Odds Enhancers</li>
                <li>Position Sizing và Risk Management chuyên nghiệp</li>
                <li>Multi-TP Strategy: TP1/TP2/TP3 với trailing</li>
                <li>Look Right Rule để filter bad trades</li>
                <li>Cần 50+ paper trades với WR ≥ 40% trước TIER 3</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <section class="quiz-section">
            <h3>🎯 Quiz Tổng Kết TIER 2</h3>

            <div class="quiz-question" data-correct="2">
                <p><strong>Câu 1:</strong> Công thức tính Position Size trong GEM Method là gì?</p>
                <button class="quiz-option" data-index="0">(Entry - SL) / (TK × Risk%)</button>
                <button class="quiz-option" data-index="1">TK × Risk% × Entry</button>
                <button class="quiz-option" data-index="2">(TK × Risk%) / (Entry - SL)</button>
                <button class="quiz-option" data-index="3">Risk% / SL Distance</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p><strong>Câu 2:</strong> Look Right Rule yêu cầu bạn phải làm gì trước khi vào lệnh?</p>
                <button class="quiz-option" data-index="0">Check RSI overbought/oversold</button>
                <button class="quiz-option" data-index="1">Check obstacles trên đường đến TP</button>
                <button class="quiz-option" data-index="2">Check volume spike</button>
                <button class="quiz-option" data-index="3">Check EMA crossover</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p><strong>Câu 3:</strong> R:R tối thiểu bắt buộc trong GEM Method để có kỳ vọng dương là bao nhiêu?</p>
                <button class="quiz-option" data-index="0">1:2 (Reward gấp đôi Risk)</button>
                <button class="quiz-option" data-index="1">1:1 (Reward bằng Risk)</button>
                <button class="quiz-option" data-index="2">1:3 (Reward gấp 3 Risk)</button>
                <button class="quiz-option" data-index="3">Tùy market condition</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <!-- Footer -->
        <footer class="lesson-footer">
            <div class="footer-logo">GEM Trading Academy</div>
            <p class="footer-text">Tier 2 Complete - Advanced Trading Mastery</p>
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
    <title>Bài 6.5: Tổng Kết & Xem Trước TIER 3 - GEM Trading Academy</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: #0a0a0f;
            color: #e4e4e7;
            line-height: 1.6;
            font-size: 16px;
        }

        /* Container - Facebook Style */
        .container {
            max-width: 680px;
            margin: 0 auto;
            background: #0a0a0f;
        }

        /* Header - Compact Style */
        .lesson-header {
            padding: 1rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
            border-bottom: 1px solid rgba(255, 189, 89, 0.2);
        }

        .lesson-badge {
            display: inline-block;
            background: linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%);
            color: #000;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 0.25rem;
        }

        .lesson-subtitle {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        /* Content Card - Facebook Post Style */
        .content-card {
            background: #18181b;
            margin-bottom: 0.5rem;
        }

        .card-header {
            display: flex;
            align-items: center;
            padding: 1rem;
            gap: 0.75rem;
        }

        .card-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            flex-shrink: 0;
        }

        .card-icon.gold { background: rgba(255, 189, 89, 0.2); }
        .card-icon.purple { background: rgba(139, 92, 246, 0.2); }
        .card-icon.cyan { background: rgba(0, 240, 255, 0.2); }
        .card-icon.green { background: rgba(16, 185, 129, 0.2); }
        .card-icon.red { background: rgba(239, 68, 68, 0.2); }

        .card-meta h3 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: #ffffff;
        }

        .card-meta span {
            font-size: 0.75rem;
            color: #71717a;
        }

        .card-body {
            padding: 0 1rem 1rem 1rem;
        }

        .card-body p {
            color: #d4d4d8;
            margin-bottom: 0.75rem;
        }

        /* Lists */
        .styled-list {
            list-style: none;
            padding: 0;
            margin: 1rem 0;
        }

        .styled-list li {
            padding: 0.75rem 1rem;
            background: rgba(255, 189, 89, 0.05);
            border-left: 3px solid #FFBD59;
            margin-bottom: 0.5rem;
            border-radius: 0 0.5rem 0.5rem 0;
        }

        .styled-list.purple li {
            background: rgba(139, 92, 246, 0.05);
            border-left-color: #8B5CF6;
        }

        .styled-list.cyan li {
            background: rgba(0, 240, 255, 0.05);
            border-left-color: #00F0FF;
        }

        .styled-list.green li {
            background: rgba(16, 185, 129, 0.05);
            border-left-color: #10B981;
        }

        /* Image Container */
        .image-container {
            margin: 1rem 0;
            border-radius: 0.5rem;
            overflow: hidden;
        }

        .image-container img {
            width: 100%;
            height: auto;
            display: block;
        }

        .image-caption {
            font-size: 0.75rem;
            color: #71717a;
            text-align: center;
            padding: 0.5rem;
            background: rgba(0, 0, 0, 0.3);
        }

        /* Tier Progress */
        .tier-progress {
            background: rgba(255, 189, 89, 0.1);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        .tier-progress h4 {
            color: #FFBD59;
            font-size: 1rem;
            margin-bottom: 1rem;
            text-align: center;
        }

        .progress-bar {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            height: 1.5rem;
            overflow: hidden;
            margin-bottom: 0.5rem;
        }

        .progress-fill {
            background: linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%);
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #000;
            font-weight: 600;
            font-size: 0.75rem;
        }

        .progress-label {
            text-align: center;
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        /* Skill Cards Grid */
        .skill-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .skill-card {
            background: rgba(16, 185, 129, 0.08);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
        }

        .skill-icon {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .skill-name {
            font-size: 0.8125rem;
            font-weight: 600;
            color: #10B981;
            margin-bottom: 0.25rem;
        }

        .skill-status {
            font-size: 0.6875rem;
            color: #71717a;
        }

        /* Tier 3 Preview Cards */
        .preview-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .preview-card {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(100, 50, 200, 0.1) 100%);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
        }

        .preview-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
        }

        .preview-badge {
            background: #8B5CF6;
            color: white;
            font-size: 0.6875rem;
            font-weight: 700;
            padding: 0.2rem 0.5rem;
            border-radius: 0.25rem;
        }

        .preview-title {
            font-weight: 600;
            color: #fff;
            font-size: 0.9375rem;
        }

        .preview-desc {
            font-size: 0.8125rem;
            color: #a1a1aa;
            line-height: 1.5;
        }

        .preview-topics {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 0.75rem;
        }

        .topic-tag {
            background: rgba(139, 92, 246, 0.2);
            color: #8B5CF6;
            font-size: 0.6875rem;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
        }

        /* Comparison Table */
        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            font-size: 0.875rem;
        }

        .comparison-table th {
            background: rgba(255, 189, 89, 0.2);
            color: #FFBD59;
            padding: 0.75rem;
            text-align: left;
            font-weight: 600;
        }

        .comparison-table td {
            padding: 0.75rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .comparison-table tr:nth-child(even) {
            background: rgba(255, 255, 255, 0.02);
        }

        /* Checklist Box */
        .checklist-box {
            background: rgba(16, 185, 129, 0.05);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .checklist-title {
            font-weight: 600;
            color: #10B981;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .checklist-items {
            list-style: none;
            padding: 0;
        }

        .checklist-items li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: #d4d4d8;
            font-size: 0.9375rem;
        }

        .checklist-items li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #10B981;
            font-weight: bold;
        }

        /* CTA Box */
        .cta-box {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(100, 50, 200, 0.2) 100%);
            border: 2px solid rgba(139, 92, 246, 0.5);
            border-radius: 0.75rem;
            padding: 1.5rem;
            margin: 1rem 0;
            text-align: center;
        }

        .cta-box h4 {
            color: #8B5CF6;
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
        }

        .cta-box p {
            color: #a1a1aa;
            margin-bottom: 1rem;
        }

        .cta-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
            color: white;
            padding: 0.5rem 1.5rem;
            border-radius: 2rem;
            font-weight: 600;
            font-size: 0.875rem;
        }

        /* Tip Box */
        .tip-box {
            background: rgba(255, 189, 89, 0.1);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .tip-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            color: #FFBD59;
            margin-bottom: 0.5rem;
        }

        /* Summary Box */
        .summary-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem;
        }

        .summary-box h3 {
            color: #FFBD59;
            font-size: 1rem;
            margin-bottom: 0.75rem;
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
            color: #d4d4d8;
        }

        .summary-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #FFBD59;
            font-weight: bold;
        }

        /* Quiz Section */
        .quiz-section {
            background: #18181b;
            margin: 0.5rem 0;
            padding: 1.5rem 1rem;
        }

        .quiz-section h3 {
            color: #ffffff;
            font-size: 1.125rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: rgba(255, 189, 89, 0.05);
            border: 1px solid rgba(255, 189, 89, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 500;
            color: #fff;
            margin-bottom: 0.75rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            text-align: left;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            color: #d4d4d8;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .quiz-option:hover {
            background: rgba(255, 189, 89, 0.1);
            border-color: rgba(255, 189, 89, 0.3);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: #10B981;
            color: #10B981;
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: #EF4444;
            color: #EF4444;
        }

        .quiz-result {
            display: none;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-top: 0.75rem;
            font-weight: 500;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: #10B981;
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: #EF4444;
        }

        .quiz-score {
            display: none;
            text-align: center;
            padding: 1rem;
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: #FFBD59;
        }

        .quiz-score .score-label {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .retake-btn {
            background: linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%);
            color: #000;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1rem;
        }

        /* Footer */
        .lesson-footer {
            padding: 1.5rem 1rem;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #FFBD59 0%, #8B5CF6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .footer-text {
            font-size: 0.75rem;
            color: #71717a;
            margin-top: 0.25rem;
        }

        /* Responsive - Mobile First */
        @media (max-width: 600px) {
            .container {
                padding: 0;
            }

            .content-card {
                border-radius: 0;
                border-left: none;
                border-right: none;
            }

            .card-body {
                padding: 0 1rem 1rem 1rem;
            }

            .skill-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .lesson-title {
                font-size: 1.25rem;
            }
        }

        @media (min-width: 600px) {
            .container {
                padding: 1.5rem;
            }

            .content-card {
                border-radius: 0.75rem;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .skill-grid {
                grid-template-columns: repeat(4, 1fr);
            }

            .preview-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="lesson-header">
            <span class="lesson-badge">🎓 Tier 2 - Chương 6</span>
            <h1 class="lesson-title">Bài 6.5: Tổng Kết & Xem Trước TIER 3</h1>
            <p class="lesson-subtitle">Ôn tập kiến thức TIER 2 - Chuẩn bị cho TIER 3 Elite</p>
        </header>

        <!-- Section 1: Tier 2 Completion -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">🏆</div>
                <div class="card-meta">
                    <h3>Chúc Mừng Hoàn Thành TIER 2!</h3>
                    <span>Advanced Trading Mastery</span>
                </div>
            </div>
            <div class="card-body">
                <p>Bạn đã hoàn thành <strong>TIER 2 - Advanced Trading</strong>! Đây là bước tiến quan trọng trong hành trình trở thành trader chuyên nghiệp.</p>

                <div class="tier-progress">
                    <h4>🎯 Tiến Trình Học Tập</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 66%;">TIER 2 Complete - 66%</div>
                    </div>
                    <p class="progress-label">Còn TIER 3 để hoàn thành chương trình</p>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/FFBD59?text=TIER+2+COMPLETE+CERTIFICATE" alt="Tier 2 Complete">
                    <p class="image-caption">Chứng nhận hoàn thành TIER 2 - Advanced Trading</p>
                </div>
            </div>
        </article>

        <!-- Section 2: Skills Acquired -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">✅</div>
                <div class="card-meta">
                    <h3>Kỹ Năng Đã Thành Thạo</h3>
                    <span>8 Core Skills từ TIER 2</span>
                </div>
            </div>
            <div class="card-body">
                <div class="skill-grid">
                    <div class="skill-card">
                        <div class="skill-icon">🔄</div>
                        <div class="skill-name">Pattern Combos</div>
                        <div class="skill-status">✓ Hoàn thành</div>
                    </div>
                    <div class="skill-card">
                        <div class="skill-icon">📊</div>
                        <div class="skill-name">MTF Analysis</div>
                        <div class="skill-status">✓ Hoàn thành</div>
                    </div>
                    <div class="skill-card">
                        <div class="skill-icon">⭐</div>
                        <div class="skill-name">Zone Grading</div>
                        <div class="skill-status">✓ Hoàn thành</div>
                    </div>
                    <div class="skill-card">
                        <div class="skill-icon">💰</div>
                        <div class="skill-name">Risk Management</div>
                        <div class="skill-status">✓ Hoàn thành</div>
                    </div>
                    <div class="skill-card">
                        <div class="skill-icon">🎯</div>
                        <div class="skill-name">Multi-TP Strategy</div>
                        <div class="skill-status">✓ Hoàn thành</div>
                    </div>
                    <div class="skill-card">
                        <div class="skill-icon">👁️</div>
                        <div class="skill-name">Look Right Rule</div>
                        <div class="skill-status">✓ Hoàn thành</div>
                    </div>
                    <div class="skill-card">
                        <div class="skill-icon">📈</div>
                        <div class="skill-name">Zone Hierarchy</div>
                        <div class="skill-status">✓ Hoàn thành</div>
                    </div>
                    <div class="skill-card">
                        <div class="skill-icon">🧮</div>
                        <div class="skill-name">Position Sizing</div>
                        <div class="skill-status">✓ Hoàn thành</div>
                    </div>
                </div>

                <div class="checklist-box">
                    <div class="checklist-title">📋 TIER 2 Mastery Checklist</div>
                    <ul class="checklist-items">
                        <li>Nhận diện được 8 Pattern Combos nâng cao</li>
                        <li>Áp dụng Multi-Timeframe Analysis với 3 khung thời gian</li>
                        <li>Chấm điểm Zone với Odds Enhancers</li>
                        <li>Tính Position Size đúng công thức</li>
                        <li>Đặt Stop Loss theo Zone + Buffer</li>
                        <li>Sử dụng Multi-TP Strategy (TP1/TP2/TP3)</li>
                        <li>Áp dụng Look Right Rule trước mỗi trade</li>
                    </ul>
                </div>
            </div>
        </article>

        <!-- Section 3: Tier 2 Key Formulas -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">📐</div>
                <div class="card-meta">
                    <h3>Công Thức Quan Trọng TIER 2</h3>
                    <span>Cheat sheet để tham khảo</span>
                </div>
            </div>
            <div class="card-body">
                <table class="comparison-table">
                    <tr>
                        <th>Công thức</th>
                        <th>Áp dụng</th>
                    </tr>
                    <tr>
                        <td><strong>Position Size</strong><br>= (TK × Risk%) / (Entry - SL)</td>
                        <td>Tính khối lượng lệnh đúng</td>
                    </tr>
                    <tr>
                        <td><strong>Stop Loss</strong><br>= Zone Edge + 0.5% Buffer</td>
                        <td>Đặt SL ngoài zone</td>
                    </tr>
                    <tr>
                        <td><strong>TP1</strong><br>= Entry ± (SL × 2)</td>
                        <td>Target R:R 1:2</td>
                    </tr>
                    <tr>
                        <td><strong>TP2</strong><br>= Measured Move (AB=CD)</td>
                        <td>Zone đối diện</td>
                    </tr>
                    <tr>
                        <td><strong>Trailing Stop</strong><br>= Close - (ATR × 2)</td>
                        <td>Lock profit khi trending</td>
                    </tr>
                    <tr>
                        <td><strong>Zone Score</strong><br>= Base + Odds Enhancers</td>
                        <td>Chấm điểm 1-10</td>
                    </tr>
                </table>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/00F0FF?text=TIER+2+Formula+Cheat+Sheet" alt="Formula Cheat Sheet">
                    <p class="image-caption">Hình 6.5.1: Cheat Sheet các công thức TIER 2</p>
                </div>
            </div>
        </article>

        <!-- Section 4: Tier 3 Preview -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">🚀</div>
                <div class="card-meta">
                    <h3>Xem Trước TIER 3 - Elite</h3>
                    <span>Nội dung nâng cao cho Pro Traders</span>
                </div>
            </div>
            <div class="card-body">
                <p>TIER 3 sẽ đưa bạn lên cấp độ <strong>Elite Trader</strong> với các kỹ thuật và chiến lược chuyên sâu nhất.</p>

                <div class="preview-grid">
                    <div class="preview-card">
                        <div class="preview-header">
                            <span class="preview-badge">CH.1</span>
                            <span class="preview-title">Order Flow & Liquidity</span>
                        </div>
                        <div class="preview-desc">Đọc dòng tiền thực, phân tích liquidity pools, và smart money concepts.</div>
                        <div class="preview-topics">
                            <span class="topic-tag">Order Flow</span>
                            <span class="topic-tag">Liquidity</span>
                            <span class="topic-tag">SMC</span>
                        </div>
                    </div>

                    <div class="preview-card">
                        <div class="preview-header">
                            <span class="preview-badge">CH.2</span>
                            <span class="preview-title">Advanced Entry Techniques</span>
                        </div>
                        <div class="preview-desc">Refinement entries, LTF patterns, và confirmation techniques.</div>
                        <div class="preview-topics">
                            <span class="topic-tag">Refinement</span>
                            <span class="topic-tag">LTF Entry</span>
                            <span class="topic-tag">Confirmation</span>
                        </div>
                    </div>

                    <div class="preview-card">
                        <div class="preview-header">
                            <span class="preview-badge">CH.3</span>
                            <span class="preview-title">Market Structure Deep Dive</span>
                        </div>
                        <div class="preview-desc">BOS, CHoCH, market structure shifts và trend identification.</div>
                        <div class="preview-topics">
                            <span class="topic-tag">BOS</span>
                            <span class="topic-tag">CHoCH</span>
                            <span class="topic-tag">MSS</span>
                        </div>
                    </div>

                    <div class="preview-card">
                        <div class="preview-header">
                            <span class="preview-badge">CH.4</span>
                            <span class="preview-title">Trading Psychology Elite</span>
                        </div>
                        <div class="preview-desc">Advanced mindset, drawdown management, và peak performance.</div>
                        <div class="preview-topics">
                            <span class="topic-tag">Mindset</span>
                            <span class="topic-tag">Drawdown</span>
                            <span class="topic-tag">Performance</span>
                        </div>
                    </div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x400/112250/8B5CF6?text=TIER+3+Elite+Preview" alt="Tier 3 Preview">
                    <p class="image-caption">Hình 6.5.2: TIER 3 - Hành trình trở thành Elite Trader</p>
                </div>
            </div>
        </article>

        <!-- Section 5: Requirements for Tier 3 -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">📋</div>
                <div class="card-meta">
                    <h3>Yêu Cầu Trước TIER 3</h3>
                    <span>Checklist chuẩn bị</span>
                </div>
            </div>
            <div class="card-body">
                <p>Để tối ưu việc học TIER 3, bạn cần đảm bảo:</p>

                <ul class="styled-list">
                    <li><strong>Paper Trade ít nhất 50 trades</strong> với GEM Method từ TIER 1 & 2</li>
                    <li><strong>Win rate ≥ 40%</strong> trên paper trades</li>
                    <li><strong>Hiểu rõ</strong> tất cả 24 patterns cơ bản</li>
                    <li><strong>Nhuần nhuyễn</strong> Multi-Timeframe Analysis</li>
                    <li><strong>Áp dụng được</strong> Position Sizing và Risk Management</li>
                </ul>

                <div class="tip-box">
                    <div class="tip-header">💡 Lời Khuyên</div>
                    <p>Nếu win rate dưới 40% trên paper trades, hãy ôn lại TIER 1 & 2 trước khi tiếp tục. TIER 3 sẽ không hiệu quả nếu foundation chưa vững.</p>
                </div>

                <table class="comparison-table">
                    <tr>
                        <th>Tiêu chí</th>
                        <th>Yêu cầu</th>
                        <th>Check</th>
                    </tr>
                    <tr>
                        <td>Paper Trades</td>
                        <td>≥ 50 trades</td>
                        <td>☐</td>
                    </tr>
                    <tr>
                        <td>Win Rate</td>
                        <td>≥ 40%</td>
                        <td>☐</td>
                    </tr>
                    <tr>
                        <td>Average R:R</td>
                        <td>≥ 1:2</td>
                        <td>☐</td>
                    </tr>
                    <tr>
                        <td>Pattern Recognition</td>
                        <td>24/24 patterns</td>
                        <td>☐</td>
                    </tr>
                    <tr>
                        <td>MTF Analysis</td>
                        <td>Thành thạo</td>
                        <td>☐</td>
                    </tr>
                </table>
            </div>
        </article>

        <!-- Section 6: CTA -->
        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">🎯</div>
                <div class="card-meta">
                    <h3>Bước Tiếp Theo</h3>
                    <span>Hành động ngay!</span>
                </div>
            </div>
            <div class="card-body">
                <div class="cta-box">
                    <h4>🚀 Sẵn Sàng Cho TIER 3?</h4>
                    <p>Hoàn thành 50 paper trades với win rate ≥ 40%, sau đó đăng ký TIER 3 - Elite Trading để tiếp tục hành trình!</p>
                    <span class="cta-badge">TIER 3 - COMING SOON</span>
                </div>

                <ul class="styled-list purple">
                    <li><strong>Bước 1:</strong> Review lại tất cả lessons TIER 2</li>
                    <li><strong>Bước 2:</strong> Practice paper trading với GEM Scanner</li>
                    <li><strong>Bước 3:</strong> Track journal ít nhất 50 trades</li>
                    <li><strong>Bước 4:</strong> Đạt win rate ≥ 40% và R:R ≥ 1:2</li>
                    <li><strong>Bước 5:</strong> Đăng ký TIER 3 khi đã sẵn sàng</li>
                </ul>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/8B5CF6?text=Your+Elite+Trader+Journey" alt="Elite Journey">
                    <p class="image-caption">Hình 6.5.3: Hành trình trở thành Elite Trader</p>
                </div>
            </div>
        </article>

        <!-- Summary Box -->
        <div class="summary-box">
            <h3>📝 Tóm Tắt TIER 2</h3>
            <ul class="summary-list">
                <li>Thành thạo 8 Pattern Combos nâng cao</li>
                <li>Multi-Timeframe Analysis: HTF → ITF → LTF</li>
                <li>Zone Grading System với Odds Enhancers</li>
                <li>Position Sizing và Risk Management chuyên nghiệp</li>
                <li>Multi-TP Strategy: TP1/TP2/TP3 với trailing</li>
                <li>Look Right Rule để filter bad trades</li>
                <li>Cần 50+ paper trades với WR ≥ 40% trước TIER 3</li>
            </ul>
        </div>

        <!-- Quiz Section -->
        <section class="quiz-section">
            <h3>🎯 Quiz Tổng Kết TIER 2</h3>

            <div class="quiz-question" data-correct="2">
                <p><strong>Câu 1:</strong> Công thức tính Position Size trong GEM Method là gì?</p>
                <button class="quiz-option" data-index="0">(Entry - SL) / (TK × Risk%)</button>
                <button class="quiz-option" data-index="1">TK × Risk% × Entry</button>
                <button class="quiz-option" data-index="2">(TK × Risk%) / (Entry - SL)</button>
                <button class="quiz-option" data-index="3">Risk% / SL Distance</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p><strong>Câu 2:</strong> Look Right Rule yêu cầu bạn phải làm gì trước khi vào lệnh?</p>
                <button class="quiz-option" data-index="0">Check RSI overbought/oversold</button>
                <button class="quiz-option" data-index="1">Check obstacles trên đường đến TP</button>
                <button class="quiz-option" data-index="2">Check volume spike</button>
                <button class="quiz-option" data-index="3">Check EMA crossover</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p><strong>Câu 3:</strong> R:R tối thiểu bắt buộc trong GEM Method để có kỳ vọng dương là bao nhiêu?</p>
                <button class="quiz-option" data-index="0">1:2 (Reward gấp đôi Risk)</button>
                <button class="quiz-option" data-index="1">1:1 (Reward bằng Risk)</button>
                <button class="quiz-option" data-index="2">1:3 (Reward gấp 3 Risk)</button>
                <button class="quiz-option" data-index="3">Tùy market condition</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <!-- Footer -->
        <footer class="lesson-footer">
            <div class="footer-logo">GEM Trading Academy</div>
            <p class="footer-text">Tier 2 Complete - Advanced Trading Mastery</p>
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
