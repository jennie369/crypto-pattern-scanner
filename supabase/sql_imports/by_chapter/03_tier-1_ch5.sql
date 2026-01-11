-- =====================================================
-- TIER-1 - Chương 5: DPU Pattern
-- Course: course-tier1-trading-foundation
-- File 3/23
-- =====================================================

-- Create/Update Module
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  'module-tier-1-ch5',
  'course-tier1-trading-foundation',
  'Chương 5: DPU Pattern',
  'Master DPU Pattern trong trading',
  5,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Lesson 5.1: DPU Pattern Là Gì? - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch5-l1',
  'module-tier-1-ch5',
  'course-tier1-trading-foundation',
  'Bài 5.1: DPU Pattern Là Gì? - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 5.1: DPU Pattern Là Gì? - GEM Trading Academy</title>
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --bg-card: #1a1a25;
            --bg-card-hover: #22222f;
            --text-primary: #ffffff;
            --text-secondary: #a0a0b0;
            --text-muted: #6a6a7a;
            --border-color: #2a2a3a;
            --border-light: #3a3a4a;
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
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
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
                padding: 1.5rem 1rem;
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

        .lesson-header p { color: var(--text-secondary); font-size: 1rem; }

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
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .section-content { padding: 0 16px 16px 16px; }
        }

        .section-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-cyan);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .section-title {
                font-size: 1.15rem;
                padding: 16px;
                padding-bottom: 12px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .section-title::before { display: none; }
        }

        .section-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-cyan);
            border-radius: 2px;
        }

        .section p, .section li { color: var(--text-secondary); margin-bottom: 0.8rem; }
        .section ul, .section ol { padding-left: 1.5rem; }
        .section li { margin-bottom: 0.5rem; }

        .image-placeholder {
            width: 100%;
            border-radius: 12px;
            margin: 1rem 0;
            display: block;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .image-placeholder { border-radius: 8px; margin: 1rem 0; }
        }

        .concept-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .concept-card {
                border-radius: 8px;
                border-left: 4px solid var(--accent-cyan);
            }
        }

        .concept-card h4 {
            color: var(--accent-cyan);
            margin-bottom: 0.75rem;
            font-size: 1.1rem;
        }

        .concept-card p { color: var(--text-secondary); margin-bottom: 0.5rem; }

        .highlight-box {
            background: var(--accent-gold-dim);
            border: 1px solid var(--accent-gold);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .highlight-box {
                border-radius: 8px;
                border-left: 4px solid var(--accent-gold);
            }
        }

        .highlight-box h4 { color: var(--accent-gold); margin-bottom: 0.5rem; }
        .highlight-box p { color: var(--text-secondary); margin-bottom: 0; }

        .info-box {
            background: var(--accent-cyan-dim);
            border: 1px solid var(--accent-cyan);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .info-box {
                border-radius: 8px;
                border-left: 4px solid var(--accent-cyan);
            }
        }

        .info-box h4 { color: var(--accent-cyan); margin-bottom: 0.5rem; }
        .info-box p { color: var(--text-secondary); margin-bottom: 0; }

        .pattern-box {
            background: linear-gradient(135deg, var(--accent-green-dim), transparent);
            border: 2px solid var(--accent-green);
            border-radius: 16px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        @media (max-width: 600px) {
            .pattern-box {
                border-radius: 8px;
                padding: 1.25rem;
            }
        }

        .pattern-box h3 {
            font-size: 2rem;
            color: var(--accent-green);
            margin-bottom: 0.5rem;
        }

        .pattern-box .formula {
            font-size: 1.5rem;
            color: var(--text-primary);
            font-weight: 600;
            margin: 1rem 0;
        }

        .pattern-box p { color: var(--text-secondary); }

        .comparison-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .comparison-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: var(--border-color);
                border-radius: 8px;
                overflow: hidden;
            }
        }

        .comparison-card {
            background: var(--bg-secondary);
            padding: 1rem;
            border-radius: 10px;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .comparison-card { border-radius: 0; border: none; }
        }

        .comparison-card h4 {
            font-size: 1rem;
            margin-bottom: 0.5rem;
        }

        .comparison-card.buy h4 { color: var(--accent-green); }
        .comparison-card.sell h4 { color: var(--accent-red); }

        .comparison-card p { color: var(--text-secondary); font-size: 0.9rem; margin: 0; }

        .summary-box {
            background: linear-gradient(135deg, var(--accent-gold-dim), transparent);
            border: 1px solid var(--accent-gold);
            border-radius: 16px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                padding: 1.25rem 16px;
                margin: 0;
                border-left: 4px solid var(--accent-gold);
                border-right: none;
                border-top: none;
            }
        }

        .summary-box h3 { color: var(--accent-gold); margin-bottom: 1rem; }
        .summary-box ul { list-style: none; padding-left: 0; }

        .summary-box li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-box li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--accent-gold);
            font-weight: bold;
        }

        .quiz-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .quiz-content { padding: 0 16px 16px 16px; }
        }

        .quiz-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-purple);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .quiz-title {
                font-size: 1.15rem;
                padding: 16px;
                padding-bottom: 12px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .quiz-title::before { display: none; }
        }

        .quiz-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-purple);
            border-radius: 2px;
        }

        .quiz-question {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-question { border-radius: 8px; border-left: 4px solid var(--accent-purple); }
        }

        .quiz-question h4 { color: var(--text-primary); margin-bottom: 1rem; font-size: 1rem; }
        .quiz-options { display: flex; flex-direction: column; gap: 0.5rem; }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            color: var(--text-secondary);
        }

        .quiz-option:hover { background: var(--bg-card-hover); border-color: var(--accent-purple); }
        .quiz-option.correct { border-color: var(--accent-green); background: var(--accent-green-dim); color: var(--accent-green); }
        .quiz-option.incorrect { border-color: var(--accent-red); background: var(--accent-red-dim); color: var(--accent-red); }

        .quiz-result { padding: 1rem; border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: var(--accent-green-dim); border: 1px solid var(--accent-green); color: var(--accent-green); }
        .quiz-result.incorrect { background: var(--accent-red-dim); border: 1px solid var(--accent-red); color: var(--accent-red); }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border: 1px solid var(--accent-purple);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show { display: block; }
        .quiz-score h3 { color: var(--accent-purple); font-size: 1.5rem; margin-bottom: 0.5rem; }
        .quiz-score p { color: var(--text-secondary); }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--accent-purple);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            background: var(--bg-secondary);
            border-radius: 16px;
            border: 1px solid var(--border-color);
            margin-top: 1.5rem;
        }

        @media (max-width: 600px) {
            .lesson-footer {
                border-radius: 0;
                border-left: none;
                border-right: none;
                border-bottom: none;
                margin-top: 0;
            }
        }

        .lesson-footer p { color: var(--text-secondary); margin-bottom: 1rem; }
        .lesson-footer .highlight { color: var(--accent-gold); font-weight: 600; }
        strong { color: var(--accent-gold); }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">📚 Tier 1 - Bài 5.1</span>
            <h1>DPU Pattern Là Gì?</h1>
            <p>Pattern đảo chiều từ downtrend sang uptrend - Cơ hội mua đáy</p>
        </header>

        <section class="section">
            <h2 class="section-title">Giới Thiệu DPU Pattern</h2>
            <div class="section-content">
                <p><strong>DPU (Down - Pause - Up)</strong> là một trong 4 pattern cốt lõi của GEM Frequency Method. Đây là pattern đảo chiều từ downtrend, cho tín hiệu mua (LONG) khi thị trường chuẩn bị đảo chiều đi lên.</p>

                <img src="https://placehold.co/800x400/112250/10B981?text=DPU+Pattern+Overview" alt="DPU Pattern Overview" class="image-placeholder">

                <div class="pattern-box">
                    <h3>DPU Pattern</h3>
                    <div class="formula">📉 DOWN → ⏸️ PAUSE → 📈 UP</div>
                    <p>Tín hiệu: <strong style="color: var(--accent-green);">LONG (Mua)</strong></p>
                </div>

                <div class="concept-card">
                    <h4>🔑 Ý Nghĩa Pattern</h4>
                    <p><strong>D (Down):</strong> Giá giảm mạnh, tạo đáy mới hoặc test vùng hỗ trợ quan trọng.</p>
                    <p><strong>P (Pause):</strong> Phe bán kiệt sức, giá sideway tích lũy, volume cạn kiệt.</p>
                    <p><strong>U (Up):</strong> Phe mua quay lại, phá vỡ LFZ (Low Frequency Zone) đi lên.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">So Sánh Với Pattern Khác</h2>
            <div class="section-content">
                <p>DPU là "bản đảo ngược" của UPD. Cả hai đều là pattern đảo chiều nhưng theo hướng ngược nhau:</p>

                <img src="https://placehold.co/800x350/112250/FFBD59?text=DPU+vs+UPD+Comparison" alt="DPU vs UPD Comparison" class="image-placeholder">

                <div class="comparison-grid">
                    <div class="comparison-card buy">
                        <h4>DPU - Đảo Chiều Lên</h4>
                        <p>• Xuất hiện sau downtrend</p>
                        <p>• Tín hiệu LONG (mua)</p>
                        <p>• Tìm điểm mua đáy</p>
                        <p>• LFZ làm điểm entry</p>
                    </div>
                    <div class="comparison-card sell">
                        <h4>UPD - Đảo Chiều Xuống</h4>
                        <p>• Xuất hiện sau uptrend</p>
                        <p>• Tín hiệu SHORT (bán)</p>
                        <p>• Tìm điểm bán đỉnh</p>
                        <p>• HFZ làm điểm entry</p>
                    </div>
                </div>

                <div class="info-box">
                    <h4>💡 Key Insight</h4>
                    <p>DPU thường xuất hiện tại vùng hỗ trợ mạnh hoặc sau một đợt bán tháo (sell-off). Khi volume giảm mạnh trong phase Pause, đó là dấu hiệu phe bán đã kiệt sức.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Khi Nào DPU Xuất Hiện?</h2>
            <div class="section-content">
                <p>DPU thường hình thành trong các điều kiện thị trường sau:</p>

                <img src="https://placehold.co/800x400/112250/00F0FF?text=DPU+Market+Conditions" alt="DPU Market Conditions" class="image-placeholder">

                <div class="concept-card">
                    <h4>📍 Điều Kiện Lý Tưởng Cho DPU</h4>
                    <p><strong>1. Downtrend mạnh:</strong> Giá đã giảm đáng kể (10-30% hoặc hơn)</p>
                    <p><strong>2. Vùng hỗ trợ quan trọng:</strong> Đáy cũ, support tâm lý, hoặc Fib 0.618-0.786</p>
                    <p><strong>3. Volume cạn:</strong> Seller exhaustion - phe bán không còn lực</p>
                    <p><strong>4. Divergence:</strong> RSI/MACD tạo higher low trong khi giá lower low</p>
                </div>

                <div class="highlight-box">
                    <h4>🎯 Vị Trí Tốt Nhất</h4>
                    <p>DPU có win rate cao nhất khi xuất hiện tại:</p>
                    <p>• Vùng đáy cũ (previous low)<br>
                    • Monthly/Weekly support zone<br>
                    • Fibonacci retracement 0.618 - 0.786<br>
                    • Volume profile POC (Point of Control)</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Tâm Lý Thị Trường Đằng Sau DPU</h2>
            <div class="section-content">
                <p>Hiểu tâm lý giúp bạn trade với confidence cao hơn:</p>

                <img src="https://placehold.co/800x350/112250/6A5BFF?text=Market+Psychology+DPU" alt="Market Psychology DPU" class="image-placeholder">

                <div class="concept-card">
                    <h4>Phase 1: DOWN - Sự Hoảng Loạn</h4>
                    <p>• Retail panic sell, weak hands bị rũ bỏ</p>
                    <p>• Tin tức tiêu cực tràn ngập</p>
                    <p>• Fear đạt đỉnh, mọi người nghĩ sẽ về 0</p>
                    <p>• <strong>Thực tế:</strong> Smart money đang âm thầm tích lũy</p>
                </div>

                <div class="concept-card">
                    <h4>Phase 2: PAUSE - Sự Kiệt Sức</h4>
                    <p>• Ai muốn bán đã bán xong</p>
                    <p>• Volume giảm mạnh, thị trường "chết"</p>
                    <p>• Không ai quan tâm, tin tức im ắng</p>
                    <p>• <strong>Thực tế:</strong> Accumulation phase - tích lũy âm thầm</p>
                </div>

                <div class="concept-card">
                    <h4>Phase 3: UP - Sự Thức Tỉnh</h4>
                    <p>• Giá bất ngờ tăng, volume quay lại</p>
                    <p>• FOMO bắt đầu khi retail nhận ra trend đổi</p>
                    <p>• Tin tức bắt đầu tích cực hơn</p>
                    <p>• <strong>Thực tế:</strong> Smart money đã mua đầy, bắt đầu đẩy giá</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>DPU = Down - Pause - Up: Pattern đảo chiều từ downtrend sang uptrend</li>
                <li>Cho tín hiệu LONG (mua) - Cơ hội "buy the dip" thực sự</li>
                <li>Tốt nhất khi xuất hiện tại vùng support mạnh (đáy cũ, Fib 0.618)</li>
                <li>Phase Pause quan trọng: Volume cạn = phe bán kiệt sức</li>
                <li>Hiểu tâm lý: Mua khi người khác sợ, đợi confirmation</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="2">
                    <h4>Câu 1: DPU cho tín hiệu gì?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. SHORT (Bán)</div>
                        <div class="quiz-option" data-index="1">B. Hold</div>
                        <div class="quiz-option" data-index="2">C. LONG (Mua)</div>
                        <div class="quiz-option" data-index="3">D. Không giao dịch</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="1">
                    <h4>Câu 2: Trong phase Pause của DPU, điều gì xảy ra với volume?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Tăng mạnh</div>
                        <div class="quiz-option" data-index="1">B. Giảm mạnh (cạn kiệt)</div>
                        <div class="quiz-option" data-index="2">C. Không đổi</div>
                        <div class="quiz-option" data-index="3">D. Biến động ngẫu nhiên</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 3: DPU có win rate cao nhất khi xuất hiện ở đâu?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Vùng support mạnh (đáy cũ, Fib 0.618)</div>
                        <div class="quiz-option" data-index="1">B. Giữa không trung</div>
                        <div class="quiz-option" data-index="2">C. Gần all-time high</div>
                        <div class="quiz-option" data-index="3">D. Trong sideway range</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🏆 Hoàn Thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <button class="retake-btn" onclick="retakeQuiz()">Làm Lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>🎉 Hoàn thành <span class="highlight">Bài 5.1</span></p>
            <p>Tiếp theo: <strong>Bài 5.2 - Cấu Trúc 3 Phases Của DPU</strong></p>
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
                        result.textContent = ''✗ Chưa đúng. Xem đáp án đúng.'';
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
            document.querySelectorAll(''.quiz-question'').forEach(q => {
                q.classList.remove(''answered'');
                q.querySelectorAll(''.quiz-option'').forEach(o => o.classList.remove(''correct'', ''incorrect''));
                q.querySelector(''.quiz-result'').className = ''quiz-result'';
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
    <title>Bài 5.1: DPU Pattern Là Gì? - GEM Trading Academy</title>
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --bg-card: #1a1a25;
            --bg-card-hover: #22222f;
            --text-primary: #ffffff;
            --text-secondary: #a0a0b0;
            --text-muted: #6a6a7a;
            --border-color: #2a2a3a;
            --border-light: #3a3a4a;
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
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
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
                padding: 1.5rem 1rem;
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

        .lesson-header p { color: var(--text-secondary); font-size: 1rem; }

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
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .section-content { padding: 0 16px 16px 16px; }
        }

        .section-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-cyan);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .section-title {
                font-size: 1.15rem;
                padding: 16px;
                padding-bottom: 12px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .section-title::before { display: none; }
        }

        .section-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-cyan);
            border-radius: 2px;
        }

        .section p, .section li { color: var(--text-secondary); margin-bottom: 0.8rem; }
        .section ul, .section ol { padding-left: 1.5rem; }
        .section li { margin-bottom: 0.5rem; }

        .image-placeholder {
            width: 100%;
            border-radius: 12px;
            margin: 1rem 0;
            display: block;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .image-placeholder { border-radius: 8px; margin: 1rem 0; }
        }

        .concept-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .concept-card {
                border-radius: 8px;
                border-left: 4px solid var(--accent-cyan);
            }
        }

        .concept-card h4 {
            color: var(--accent-cyan);
            margin-bottom: 0.75rem;
            font-size: 1.1rem;
        }

        .concept-card p { color: var(--text-secondary); margin-bottom: 0.5rem; }

        .highlight-box {
            background: var(--accent-gold-dim);
            border: 1px solid var(--accent-gold);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .highlight-box {
                border-radius: 8px;
                border-left: 4px solid var(--accent-gold);
            }
        }

        .highlight-box h4 { color: var(--accent-gold); margin-bottom: 0.5rem; }
        .highlight-box p { color: var(--text-secondary); margin-bottom: 0; }

        .info-box {
            background: var(--accent-cyan-dim);
            border: 1px solid var(--accent-cyan);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .info-box {
                border-radius: 8px;
                border-left: 4px solid var(--accent-cyan);
            }
        }

        .info-box h4 { color: var(--accent-cyan); margin-bottom: 0.5rem; }
        .info-box p { color: var(--text-secondary); margin-bottom: 0; }

        .pattern-box {
            background: linear-gradient(135deg, var(--accent-green-dim), transparent);
            border: 2px solid var(--accent-green);
            border-radius: 16px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            text-align: center;
        }

        @media (max-width: 600px) {
            .pattern-box {
                border-radius: 8px;
                padding: 1.25rem;
            }
        }

        .pattern-box h3 {
            font-size: 2rem;
            color: var(--accent-green);
            margin-bottom: 0.5rem;
        }

        .pattern-box .formula {
            font-size: 1.5rem;
            color: var(--text-primary);
            font-weight: 600;
            margin: 1rem 0;
        }

        .pattern-box p { color: var(--text-secondary); }

        .comparison-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .comparison-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: var(--border-color);
                border-radius: 8px;
                overflow: hidden;
            }
        }

        .comparison-card {
            background: var(--bg-secondary);
            padding: 1rem;
            border-radius: 10px;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .comparison-card { border-radius: 0; border: none; }
        }

        .comparison-card h4 {
            font-size: 1rem;
            margin-bottom: 0.5rem;
        }

        .comparison-card.buy h4 { color: var(--accent-green); }
        .comparison-card.sell h4 { color: var(--accent-red); }

        .comparison-card p { color: var(--text-secondary); font-size: 0.9rem; margin: 0; }

        .summary-box {
            background: linear-gradient(135deg, var(--accent-gold-dim), transparent);
            border: 1px solid var(--accent-gold);
            border-radius: 16px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                padding: 1.25rem 16px;
                margin: 0;
                border-left: 4px solid var(--accent-gold);
                border-right: none;
                border-top: none;
            }
        }

        .summary-box h3 { color: var(--accent-gold); margin-bottom: 1rem; }
        .summary-box ul { list-style: none; padding-left: 0; }

        .summary-box li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-box li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--accent-gold);
            font-weight: bold;
        }

        .quiz-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .quiz-content { padding: 0 16px 16px 16px; }
        }

        .quiz-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-purple);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .quiz-title {
                font-size: 1.15rem;
                padding: 16px;
                padding-bottom: 12px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .quiz-title::before { display: none; }
        }

        .quiz-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-purple);
            border-radius: 2px;
        }

        .quiz-question {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-question { border-radius: 8px; border-left: 4px solid var(--accent-purple); }
        }

        .quiz-question h4 { color: var(--text-primary); margin-bottom: 1rem; font-size: 1rem; }
        .quiz-options { display: flex; flex-direction: column; gap: 0.5rem; }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            color: var(--text-secondary);
        }

        .quiz-option:hover { background: var(--bg-card-hover); border-color: var(--accent-purple); }
        .quiz-option.correct { border-color: var(--accent-green); background: var(--accent-green-dim); color: var(--accent-green); }
        .quiz-option.incorrect { border-color: var(--accent-red); background: var(--accent-red-dim); color: var(--accent-red); }

        .quiz-result { padding: 1rem; border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: var(--accent-green-dim); border: 1px solid var(--accent-green); color: var(--accent-green); }
        .quiz-result.incorrect { background: var(--accent-red-dim); border: 1px solid var(--accent-red); color: var(--accent-red); }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border: 1px solid var(--accent-purple);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show { display: block; }
        .quiz-score h3 { color: var(--accent-purple); font-size: 1.5rem; margin-bottom: 0.5rem; }
        .quiz-score p { color: var(--text-secondary); }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--accent-purple);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            background: var(--bg-secondary);
            border-radius: 16px;
            border: 1px solid var(--border-color);
            margin-top: 1.5rem;
        }

        @media (max-width: 600px) {
            .lesson-footer {
                border-radius: 0;
                border-left: none;
                border-right: none;
                border-bottom: none;
                margin-top: 0;
            }
        }

        .lesson-footer p { color: var(--text-secondary); margin-bottom: 1rem; }
        .lesson-footer .highlight { color: var(--accent-gold); font-weight: 600; }
        strong { color: var(--accent-gold); }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">📚 Tier 1 - Bài 5.1</span>
            <h1>DPU Pattern Là Gì?</h1>
            <p>Pattern đảo chiều từ downtrend sang uptrend - Cơ hội mua đáy</p>
        </header>

        <section class="section">
            <h2 class="section-title">Giới Thiệu DPU Pattern</h2>
            <div class="section-content">
                <p><strong>DPU (Down - Pause - Up)</strong> là một trong 4 pattern cốt lõi của GEM Frequency Method. Đây là pattern đảo chiều từ downtrend, cho tín hiệu mua (LONG) khi thị trường chuẩn bị đảo chiều đi lên.</p>

                <img src="https://placehold.co/800x400/112250/10B981?text=DPU+Pattern+Overview" alt="DPU Pattern Overview" class="image-placeholder">

                <div class="pattern-box">
                    <h3>DPU Pattern</h3>
                    <div class="formula">📉 DOWN → ⏸️ PAUSE → 📈 UP</div>
                    <p>Tín hiệu: <strong style="color: var(--accent-green);">LONG (Mua)</strong></p>
                </div>

                <div class="concept-card">
                    <h4>🔑 Ý Nghĩa Pattern</h4>
                    <p><strong>D (Down):</strong> Giá giảm mạnh, tạo đáy mới hoặc test vùng hỗ trợ quan trọng.</p>
                    <p><strong>P (Pause):</strong> Phe bán kiệt sức, giá sideway tích lũy, volume cạn kiệt.</p>
                    <p><strong>U (Up):</strong> Phe mua quay lại, phá vỡ LFZ (Low Frequency Zone) đi lên.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">So Sánh Với Pattern Khác</h2>
            <div class="section-content">
                <p>DPU là "bản đảo ngược" của UPD. Cả hai đều là pattern đảo chiều nhưng theo hướng ngược nhau:</p>

                <img src="https://placehold.co/800x350/112250/FFBD59?text=DPU+vs+UPD+Comparison" alt="DPU vs UPD Comparison" class="image-placeholder">

                <div class="comparison-grid">
                    <div class="comparison-card buy">
                        <h4>DPU - Đảo Chiều Lên</h4>
                        <p>• Xuất hiện sau downtrend</p>
                        <p>• Tín hiệu LONG (mua)</p>
                        <p>• Tìm điểm mua đáy</p>
                        <p>• LFZ làm điểm entry</p>
                    </div>
                    <div class="comparison-card sell">
                        <h4>UPD - Đảo Chiều Xuống</h4>
                        <p>• Xuất hiện sau uptrend</p>
                        <p>• Tín hiệu SHORT (bán)</p>
                        <p>• Tìm điểm bán đỉnh</p>
                        <p>• HFZ làm điểm entry</p>
                    </div>
                </div>

                <div class="info-box">
                    <h4>💡 Key Insight</h4>
                    <p>DPU thường xuất hiện tại vùng hỗ trợ mạnh hoặc sau một đợt bán tháo (sell-off). Khi volume giảm mạnh trong phase Pause, đó là dấu hiệu phe bán đã kiệt sức.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Khi Nào DPU Xuất Hiện?</h2>
            <div class="section-content">
                <p>DPU thường hình thành trong các điều kiện thị trường sau:</p>

                <img src="https://placehold.co/800x400/112250/00F0FF?text=DPU+Market+Conditions" alt="DPU Market Conditions" class="image-placeholder">

                <div class="concept-card">
                    <h4>📍 Điều Kiện Lý Tưởng Cho DPU</h4>
                    <p><strong>1. Downtrend mạnh:</strong> Giá đã giảm đáng kể (10-30% hoặc hơn)</p>
                    <p><strong>2. Vùng hỗ trợ quan trọng:</strong> Đáy cũ, support tâm lý, hoặc Fib 0.618-0.786</p>
                    <p><strong>3. Volume cạn:</strong> Seller exhaustion - phe bán không còn lực</p>
                    <p><strong>4. Divergence:</strong> RSI/MACD tạo higher low trong khi giá lower low</p>
                </div>

                <div class="highlight-box">
                    <h4>🎯 Vị Trí Tốt Nhất</h4>
                    <p>DPU có win rate cao nhất khi xuất hiện tại:</p>
                    <p>• Vùng đáy cũ (previous low)<br>
                    • Monthly/Weekly support zone<br>
                    • Fibonacci retracement 0.618 - 0.786<br>
                    • Volume profile POC (Point of Control)</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Tâm Lý Thị Trường Đằng Sau DPU</h2>
            <div class="section-content">
                <p>Hiểu tâm lý giúp bạn trade với confidence cao hơn:</p>

                <img src="https://placehold.co/800x350/112250/6A5BFF?text=Market+Psychology+DPU" alt="Market Psychology DPU" class="image-placeholder">

                <div class="concept-card">
                    <h4>Phase 1: DOWN - Sự Hoảng Loạn</h4>
                    <p>• Retail panic sell, weak hands bị rũ bỏ</p>
                    <p>• Tin tức tiêu cực tràn ngập</p>
                    <p>• Fear đạt đỉnh, mọi người nghĩ sẽ về 0</p>
                    <p>• <strong>Thực tế:</strong> Smart money đang âm thầm tích lũy</p>
                </div>

                <div class="concept-card">
                    <h4>Phase 2: PAUSE - Sự Kiệt Sức</h4>
                    <p>• Ai muốn bán đã bán xong</p>
                    <p>• Volume giảm mạnh, thị trường "chết"</p>
                    <p>• Không ai quan tâm, tin tức im ắng</p>
                    <p>• <strong>Thực tế:</strong> Accumulation phase - tích lũy âm thầm</p>
                </div>

                <div class="concept-card">
                    <h4>Phase 3: UP - Sự Thức Tỉnh</h4>
                    <p>• Giá bất ngờ tăng, volume quay lại</p>
                    <p>• FOMO bắt đầu khi retail nhận ra trend đổi</p>
                    <p>• Tin tức bắt đầu tích cực hơn</p>
                    <p>• <strong>Thực tế:</strong> Smart money đã mua đầy, bắt đầu đẩy giá</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>DPU = Down - Pause - Up: Pattern đảo chiều từ downtrend sang uptrend</li>
                <li>Cho tín hiệu LONG (mua) - Cơ hội "buy the dip" thực sự</li>
                <li>Tốt nhất khi xuất hiện tại vùng support mạnh (đáy cũ, Fib 0.618)</li>
                <li>Phase Pause quan trọng: Volume cạn = phe bán kiệt sức</li>
                <li>Hiểu tâm lý: Mua khi người khác sợ, đợi confirmation</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="2">
                    <h4>Câu 1: DPU cho tín hiệu gì?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. SHORT (Bán)</div>
                        <div class="quiz-option" data-index="1">B. Hold</div>
                        <div class="quiz-option" data-index="2">C. LONG (Mua)</div>
                        <div class="quiz-option" data-index="3">D. Không giao dịch</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="1">
                    <h4>Câu 2: Trong phase Pause của DPU, điều gì xảy ra với volume?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Tăng mạnh</div>
                        <div class="quiz-option" data-index="1">B. Giảm mạnh (cạn kiệt)</div>
                        <div class="quiz-option" data-index="2">C. Không đổi</div>
                        <div class="quiz-option" data-index="3">D. Biến động ngẫu nhiên</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 3: DPU có win rate cao nhất khi xuất hiện ở đâu?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Vùng support mạnh (đáy cũ, Fib 0.618)</div>
                        <div class="quiz-option" data-index="1">B. Giữa không trung</div>
                        <div class="quiz-option" data-index="2">C. Gần all-time high</div>
                        <div class="quiz-option" data-index="3">D. Trong sideway range</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🏆 Hoàn Thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <button class="retake-btn" onclick="retakeQuiz()">Làm Lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>🎉 Hoàn thành <span class="highlight">Bài 5.1</span></p>
            <p>Tiếp theo: <strong>Bài 5.2 - Cấu Trúc 3 Phases Của DPU</strong></p>
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
                        result.textContent = ''✗ Chưa đúng. Xem đáp án đúng.'';
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
            document.querySelectorAll(''.quiz-question'').forEach(q => {
                q.classList.remove(''answered'');
                q.querySelectorAll(''.quiz-option'').forEach(o => o.classList.remove(''correct'', ''incorrect''));
                q.querySelector(''.quiz-result'').className = ''quiz-result'';
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

-- Lesson 5.2: Cấu Trúc 3 Phases Của DPU - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch5-l2',
  'module-tier-1-ch5',
  'course-tier1-trading-foundation',
  'Bài 5.2: Cấu Trúc 3 Phases Của DPU - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 5.2: Cấu Trúc 3 Phases Của DPU - GEM Trading Academy</title>
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --bg-card: #1a1a25;
            --bg-card-hover: #22222f;
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
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .section-content { padding: 0 16px 16px 16px; }
        }

        .section-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-cyan);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .section-title {
                font-size: 1.15rem;
                padding: 16px;
                padding-bottom: 12px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .section-title::before { display: none; }
        }

        .section-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-cyan);
            border-radius: 2px;
        }

        .section p, .section li { color: var(--text-secondary); margin-bottom: 0.8rem; }
        .section ul { padding-left: 1.5rem; }

        .image-placeholder {
            width: 100%;
            border-radius: 12px;
            margin: 1rem 0;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .image-placeholder { border-radius: 8px; }
        }

        .phase-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-red);
        }

        .phase-card.pause { border-left-color: var(--accent-gold); }
        .phase-card.up { border-left-color: var(--accent-green); }

        .phase-card h4 { margin-bottom: 0.75rem; font-size: 1.1rem; }
        .phase-card.down h4 { color: var(--accent-red); }
        .phase-card.pause h4 { color: var(--accent-gold); }
        .phase-card.up h4 { color: var(--accent-green); }

        .phase-card p { color: var(--text-secondary); margin-bottom: 0.5rem; font-size: 0.95rem; }

        .checklist {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        .checklist h4 { color: var(--accent-cyan); margin-bottom: 0.75rem; }
        .checklist ul { list-style: none; padding: 0; }

        .checklist li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border-color);
        }

        .checklist li:last-child { border-bottom: none; }

        .checklist li::before {
            content: ''☐'';
            position: absolute;
            left: 0;
            color: var(--accent-cyan);
        }

        .highlight-box {
            background: var(--accent-gold-dim);
            border: 1px solid var(--accent-gold);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .highlight-box { border-radius: 8px; border-left: 4px solid var(--accent-gold); }
        }

        .highlight-box h4 { color: var(--accent-gold); margin-bottom: 0.5rem; }
        .highlight-box p { color: var(--text-secondary); margin: 0; }

        .warning-box {
            background: var(--accent-red-dim);
            border: 1px solid var(--accent-red);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .warning-box { border-radius: 8px; border-left: 4px solid var(--accent-red); }
        }

        .warning-box h4 { color: var(--accent-red); margin-bottom: 0.5rem; }
        .warning-box p { color: var(--text-secondary); margin: 0; }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .stats-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: var(--border-color);
                border-radius: 8px;
                overflow: hidden;
            }
        }

        .stat-card {
            background: var(--bg-secondary);
            padding: 1rem;
            border-radius: 10px;
            text-align: center;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .stat-card { border-radius: 0; border: none; }
        }

        .stat-card .value {
            font-size: 1.3rem;
            font-weight: 700;
            display: block;
            margin-bottom: 0.25rem;
        }

        .stat-card .value.red { color: var(--accent-red); }
        .stat-card .value.gold { color: var(--accent-gold); }
        .stat-card .value.green { color: var(--accent-green); }

        .stat-card .label { font-size: 0.85rem; color: var(--text-muted); }

        .summary-box {
            background: linear-gradient(135deg, var(--accent-gold-dim), transparent);
            border: 1px solid var(--accent-gold);
            border-radius: 16px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                padding: 1.25rem 16px;
                margin: 0;
                border-left: 4px solid var(--accent-gold);
                border-right: none;
                border-top: none;
            }
        }

        .summary-box h3 { color: var(--accent-gold); margin-bottom: 1rem; }
        .summary-box ul { list-style: none; padding: 0; }

        .summary-box li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-box li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--accent-gold);
        }

        .quiz-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .quiz-content { padding: 0 16px 16px 16px; }
        }

        .quiz-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-purple);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .quiz-title {
                font-size: 1.15rem;
                padding: 16px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .quiz-title::before { display: none; }
        }

        .quiz-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-purple);
            border-radius: 2px;
        }

        .quiz-question {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-question { border-radius: 8px; border-left: 4px solid var(--accent-purple); }
        }

        .quiz-question h4 { color: var(--text-primary); margin-bottom: 1rem; }
        .quiz-options { display: flex; flex-direction: column; gap: 0.5rem; }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            color: var(--text-secondary);
        }

        .quiz-option:hover { border-color: var(--accent-purple); }
        .quiz-option.correct { border-color: var(--accent-green); background: var(--accent-green-dim); color: var(--accent-green); }
        .quiz-option.incorrect { border-color: var(--accent-red); background: var(--accent-red-dim); color: var(--accent-red); }

        .quiz-result { padding: 1rem; border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: var(--accent-green-dim); border: 1px solid var(--accent-green); color: var(--accent-green); }
        .quiz-result.incorrect { background: var(--accent-red-dim); border: 1px solid var(--accent-red); color: var(--accent-red); }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border: 1px solid var(--accent-purple);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show { display: block; }
        .quiz-score h3 { color: var(--accent-purple); margin-bottom: 0.5rem; }
        .quiz-score p { color: var(--text-secondary); }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--accent-purple);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            background: var(--bg-secondary);
            border-radius: 16px;
            border: 1px solid var(--border-color);
            margin-top: 1.5rem;
        }

        @media (max-width: 600px) {
            .lesson-footer { border-radius: 0; border: none; margin-top: 0; }
        }

        .lesson-footer p { color: var(--text-secondary); margin-bottom: 1rem; }
        .lesson-footer .highlight { color: var(--accent-gold); font-weight: 600; }
        strong { color: var(--accent-gold); }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">📚 Tier 1 - Bài 5.2</span>
            <h1>Cấu Trúc 3 Phases Của DPU</h1>
            <p>Phân tích chi tiết từng phase để nhận diện chính xác pattern</p>
        </header>

        <section class="section">
            <h2 class="section-title">Tổng Quan 3 Phases</h2>
            <div class="section-content">
                <p>Mỗi DPU pattern đều trải qua 3 giai đoạn rõ ràng. Hiểu sâu từng phase giúp bạn nhận diện sớm và entry đúng thời điểm.</p>

                <img src="https://placehold.co/800x400/112250/10B981?text=DPU+3+Phases+Structure" alt="DPU 3 Phases Structure" class="image-placeholder">

                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="value red">📉 DOWN</span>
                        <span class="label">Sóng giảm mạnh</span>
                    </div>
                    <div class="stat-card">
                        <span class="value gold">⏸️ PAUSE</span>
                        <span class="label">Tích lũy đáy</span>
                    </div>
                    <div class="stat-card">
                        <span class="value green">📈 UP</span>
                        <span class="label">Đảo chiều tăng</span>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Phase 1: DOWN - Sóng Giảm</h2>
            <div class="section-content">
                <p>Phase đầu tiên là sóng giảm tạo điều kiện cho đảo chiều:</p>

                <img src="https://placehold.co/800x350/112250/EF4444?text=Phase+1+DOWN+Detail" alt="Phase 1 DOWN Detail" class="image-placeholder">

                <div class="phase-card down">
                    <h4>📉 Đặc Điểm Phase DOWN</h4>
                    <p><strong>Giá:</strong> Giảm mạnh, tạo lower lows liên tiếp</p>
                    <p><strong>Volume:</strong> Cao trong đợt bán tháo, tạo climax sell</p>
                    <p><strong>Tâm lý:</strong> Fear, panic, weak hands bị rũ bỏ</p>
                    <p><strong>Thời gian:</strong> Ngắn và dữ dội, hoặc kéo dài grinding down</p>
                </div>

                <div class="checklist">
                    <h4>✅ Checklist Phase DOWN</h4>
                    <ul>
                        <li>Giá giảm ít nhất 10-15% từ đỉnh gần nhất</li>
                        <li>Xuất hiện ít nhất 1 nến bán tháo volume cao (climax)</li>
                        <li>Chạm vùng support quan trọng (đáy cũ, Fib, trendline)</li>
                        <li>RSI vào vùng oversold (&lt; 30) hoặc tạo divergence</li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Phase 2: PAUSE - Tích Lũy Đáy</h2>
            <div class="section-content">
                <p>Phase quan trọng nhất - nơi smart money tích lũy:</p>

                <img src="https://placehold.co/800x350/112250/FFBD59?text=Phase+2+PAUSE+Accumulation" alt="Phase 2 PAUSE Accumulation" class="image-placeholder">

                <div class="phase-card pause">
                    <h4>⏸️ Đặc Điểm Phase PAUSE</h4>
                    <p><strong>Giá:</strong> Sideway, dao động trong range hẹp tại đáy</p>
                    <p><strong>Volume:</strong> Giảm mạnh - cạn kiệt, không ai muốn bán nữa</p>
                    <p><strong>Tâm lý:</strong> Chán nản, mất quan tâm, "crypto is dead"</p>
                    <p><strong>Thời gian:</strong> Có thể kéo dài, đòi hỏi kiên nhẫn</p>
                </div>

                <div class="highlight-box">
                    <h4>💡 LFZ Formation</h4>
                    <p>Trong phase PAUSE, vùng sideway hình thành <strong>LFZ (Low Frequency Zone)</strong> - đây chính là vùng tích lũy. Khi giá break UP khỏi LFZ với volume, đó là tín hiệu LONG.</p>
                </div>

                <div class="checklist">
                    <h4>✅ Checklist Phase PAUSE</h4>
                    <ul>
                        <li>Giá sideway tối thiểu 3-5 nến trên TF đang trade</li>
                        <li>Volume giảm 50% hoặc hơn so với phase DOWN</li>
                        <li>Range sideway rõ ràng, xác định được đỉnh-đáy LFZ</li>
                        <li>Không có lower low mới (giữ được đáy)</li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Phase 3: UP - Đảo Chiều Tăng</h2>
            <div class="section-content">
                <p>Phase confirmation - khi trend mới bắt đầu:</p>

                <img src="https://placehold.co/800x350/112250/10B981?text=Phase+3+UP+Breakout" alt="Phase 3 UP Breakout" class="image-placeholder">

                <div class="phase-card up">
                    <h4>📈 Đặc Điểm Phase UP</h4>
                    <p><strong>Giá:</strong> Break UP khỏi LFZ, tạo higher high</p>
                    <p><strong>Volume:</strong> Tăng đột biến khi break - confirmation quan trọng</p>
                    <p><strong>Tâm lý:</strong> Surprise, FOMO bắt đầu xuất hiện</p>
                    <p><strong>Thời gian:</strong> Nhanh và mạnh nếu đúng reversal</p>
                </div>

                <div class="warning-box">
                    <h4>⚠️ Cảnh Báo False Break</h4>
                    <p>Không phải mọi break đều thật. Đợi nến đóng cửa phía trên LFZ và volume confirmation. False break thường có volume yếu và nến đóng lại trong range.</p>
                </div>

                <div class="checklist">
                    <h4>✅ Checklist Phase UP (Entry Signal)</h4>
                    <ul>
                        <li>Nến đóng cửa trên LFZ (đỉnh vùng tích lũy)</li>
                        <li>Volume tăng gấp 1.5-2 lần so với trung bình phase PAUSE</li>
                        <li>Không có divergence bearish trên RSI/MACD</li>
                        <li>Higher TF không trong downtrend mạnh</li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Timeline Điển Hình Của DPU</h2>
            <div class="section-content">
                <p>Tỷ lệ thời gian giữa các phase thường như sau:</p>

                <img src="https://placehold.co/800x300/112250/6A5BFF?text=DPU+Timeline+Ratio" alt="DPU Timeline Ratio" class="image-placeholder">

                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="value red">20-30%</span>
                        <span class="label">Phase DOWN</span>
                    </div>
                    <div class="stat-card">
                        <span class="value gold">50-60%</span>
                        <span class="label">Phase PAUSE</span>
                    </div>
                    <div class="stat-card">
                        <span class="value green">10-20%</span>
                        <span class="label">Phase UP</span>
                    </div>
                </div>

                <div class="highlight-box">
                    <h4>📊 Ví Dụ Thực Tế</h4>
                    <p>Nếu pattern hình thành trong 10 ngày:<br>
                    • DOWN: 2-3 ngày giảm mạnh<br>
                    • PAUSE: 5-6 ngày sideway tích lũy<br>
                    • UP: 1-2 ngày break và xác nhận</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Phase DOWN: Sóng giảm mạnh + volume cao + chạm support</li>
                <li>Phase PAUSE: Sideway tại đáy + volume cạn + LFZ hình thành</li>
                <li>Phase UP: Break LFZ + volume spike = Entry LONG</li>
                <li>PAUSE chiếm 50-60% thời gian - cần kiên nhẫn chờ đợi</li>
                <li>Luôn đợi confirmation từ volume khi break</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="1">
                    <h4>Câu 1: Phase nào chiếm nhiều thời gian nhất trong DPU?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. DOWN</div>
                        <div class="quiz-option" data-index="1">B. PAUSE</div>
                        <div class="quiz-option" data-index="2">C. UP</div>
                        <div class="quiz-option" data-index="3">D. Bằng nhau</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 2: Volume trong phase PAUSE có đặc điểm gì?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Tăng mạnh</div>
                        <div class="quiz-option" data-index="1">B. Biến động lớn</div>
                        <div class="quiz-option" data-index="2">C. Giảm mạnh (cạn kiệt)</div>
                        <div class="quiz-option" data-index="3">D. Không thay đổi</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 3: LFZ trong DPU hình thành ở phase nào?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Phase PAUSE (vùng sideway đáy)</div>
                        <div class="quiz-option" data-index="1">B. Phase DOWN</div>
                        <div class="quiz-option" data-index="2">C. Phase UP</div>
                        <div class="quiz-option" data-index="3">D. Trước Phase DOWN</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🏆 Hoàn Thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <button class="retake-btn" onclick="retakeQuiz()">Làm Lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>🎉 Hoàn thành <span class="highlight">Bài 5.2</span></p>
            <p>Tiếp theo: <strong>Bài 5.3 - Cách Vẽ LFZ Chính Xác Trong DPU</strong></p>
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

        function retakeQuiz() {
            answeredCount = 0;
            correctCount = 0;
            document.querySelectorAll(''.quiz-question'').forEach(q => {
                q.classList.remove(''answered'');
                q.querySelectorAll(''.quiz-option'').forEach(o => o.classList.remove(''correct'', ''incorrect''));
                q.querySelector(''.quiz-result'').className = ''quiz-result'';
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
    <title>Bài 5.2: Cấu Trúc 3 Phases Của DPU - GEM Trading Academy</title>
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --bg-card: #1a1a25;
            --bg-card-hover: #22222f;
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
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .section-content { padding: 0 16px 16px 16px; }
        }

        .section-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-cyan);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .section-title {
                font-size: 1.15rem;
                padding: 16px;
                padding-bottom: 12px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .section-title::before { display: none; }
        }

        .section-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-cyan);
            border-radius: 2px;
        }

        .section p, .section li { color: var(--text-secondary); margin-bottom: 0.8rem; }
        .section ul { padding-left: 1.5rem; }

        .image-placeholder {
            width: 100%;
            border-radius: 12px;
            margin: 1rem 0;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .image-placeholder { border-radius: 8px; }
        }

        .phase-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-red);
        }

        .phase-card.pause { border-left-color: var(--accent-gold); }
        .phase-card.up { border-left-color: var(--accent-green); }

        .phase-card h4 { margin-bottom: 0.75rem; font-size: 1.1rem; }
        .phase-card.down h4 { color: var(--accent-red); }
        .phase-card.pause h4 { color: var(--accent-gold); }
        .phase-card.up h4 { color: var(--accent-green); }

        .phase-card p { color: var(--text-secondary); margin-bottom: 0.5rem; font-size: 0.95rem; }

        .checklist {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        .checklist h4 { color: var(--accent-cyan); margin-bottom: 0.75rem; }
        .checklist ul { list-style: none; padding: 0; }

        .checklist li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border-color);
        }

        .checklist li:last-child { border-bottom: none; }

        .checklist li::before {
            content: ''☐'';
            position: absolute;
            left: 0;
            color: var(--accent-cyan);
        }

        .highlight-box {
            background: var(--accent-gold-dim);
            border: 1px solid var(--accent-gold);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .highlight-box { border-radius: 8px; border-left: 4px solid var(--accent-gold); }
        }

        .highlight-box h4 { color: var(--accent-gold); margin-bottom: 0.5rem; }
        .highlight-box p { color: var(--text-secondary); margin: 0; }

        .warning-box {
            background: var(--accent-red-dim);
            border: 1px solid var(--accent-red);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .warning-box { border-radius: 8px; border-left: 4px solid var(--accent-red); }
        }

        .warning-box h4 { color: var(--accent-red); margin-bottom: 0.5rem; }
        .warning-box p { color: var(--text-secondary); margin: 0; }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .stats-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: var(--border-color);
                border-radius: 8px;
                overflow: hidden;
            }
        }

        .stat-card {
            background: var(--bg-secondary);
            padding: 1rem;
            border-radius: 10px;
            text-align: center;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .stat-card { border-radius: 0; border: none; }
        }

        .stat-card .value {
            font-size: 1.3rem;
            font-weight: 700;
            display: block;
            margin-bottom: 0.25rem;
        }

        .stat-card .value.red { color: var(--accent-red); }
        .stat-card .value.gold { color: var(--accent-gold); }
        .stat-card .value.green { color: var(--accent-green); }

        .stat-card .label { font-size: 0.85rem; color: var(--text-muted); }

        .summary-box {
            background: linear-gradient(135deg, var(--accent-gold-dim), transparent);
            border: 1px solid var(--accent-gold);
            border-radius: 16px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                padding: 1.25rem 16px;
                margin: 0;
                border-left: 4px solid var(--accent-gold);
                border-right: none;
                border-top: none;
            }
        }

        .summary-box h3 { color: var(--accent-gold); margin-bottom: 1rem; }
        .summary-box ul { list-style: none; padding: 0; }

        .summary-box li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-box li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--accent-gold);
        }

        .quiz-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .quiz-content { padding: 0 16px 16px 16px; }
        }

        .quiz-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-purple);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .quiz-title {
                font-size: 1.15rem;
                padding: 16px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .quiz-title::before { display: none; }
        }

        .quiz-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-purple);
            border-radius: 2px;
        }

        .quiz-question {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-question { border-radius: 8px; border-left: 4px solid var(--accent-purple); }
        }

        .quiz-question h4 { color: var(--text-primary); margin-bottom: 1rem; }
        .quiz-options { display: flex; flex-direction: column; gap: 0.5rem; }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            color: var(--text-secondary);
        }

        .quiz-option:hover { border-color: var(--accent-purple); }
        .quiz-option.correct { border-color: var(--accent-green); background: var(--accent-green-dim); color: var(--accent-green); }
        .quiz-option.incorrect { border-color: var(--accent-red); background: var(--accent-red-dim); color: var(--accent-red); }

        .quiz-result { padding: 1rem; border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: var(--accent-green-dim); border: 1px solid var(--accent-green); color: var(--accent-green); }
        .quiz-result.incorrect { background: var(--accent-red-dim); border: 1px solid var(--accent-red); color: var(--accent-red); }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border: 1px solid var(--accent-purple);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show { display: block; }
        .quiz-score h3 { color: var(--accent-purple); margin-bottom: 0.5rem; }
        .quiz-score p { color: var(--text-secondary); }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--accent-purple);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            background: var(--bg-secondary);
            border-radius: 16px;
            border: 1px solid var(--border-color);
            margin-top: 1.5rem;
        }

        @media (max-width: 600px) {
            .lesson-footer { border-radius: 0; border: none; margin-top: 0; }
        }

        .lesson-footer p { color: var(--text-secondary); margin-bottom: 1rem; }
        .lesson-footer .highlight { color: var(--accent-gold); font-weight: 600; }
        strong { color: var(--accent-gold); }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">📚 Tier 1 - Bài 5.2</span>
            <h1>Cấu Trúc 3 Phases Của DPU</h1>
            <p>Phân tích chi tiết từng phase để nhận diện chính xác pattern</p>
        </header>

        <section class="section">
            <h2 class="section-title">Tổng Quan 3 Phases</h2>
            <div class="section-content">
                <p>Mỗi DPU pattern đều trải qua 3 giai đoạn rõ ràng. Hiểu sâu từng phase giúp bạn nhận diện sớm và entry đúng thời điểm.</p>

                <img src="https://placehold.co/800x400/112250/10B981?text=DPU+3+Phases+Structure" alt="DPU 3 Phases Structure" class="image-placeholder">

                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="value red">📉 DOWN</span>
                        <span class="label">Sóng giảm mạnh</span>
                    </div>
                    <div class="stat-card">
                        <span class="value gold">⏸️ PAUSE</span>
                        <span class="label">Tích lũy đáy</span>
                    </div>
                    <div class="stat-card">
                        <span class="value green">📈 UP</span>
                        <span class="label">Đảo chiều tăng</span>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Phase 1: DOWN - Sóng Giảm</h2>
            <div class="section-content">
                <p>Phase đầu tiên là sóng giảm tạo điều kiện cho đảo chiều:</p>

                <img src="https://placehold.co/800x350/112250/EF4444?text=Phase+1+DOWN+Detail" alt="Phase 1 DOWN Detail" class="image-placeholder">

                <div class="phase-card down">
                    <h4>📉 Đặc Điểm Phase DOWN</h4>
                    <p><strong>Giá:</strong> Giảm mạnh, tạo lower lows liên tiếp</p>
                    <p><strong>Volume:</strong> Cao trong đợt bán tháo, tạo climax sell</p>
                    <p><strong>Tâm lý:</strong> Fear, panic, weak hands bị rũ bỏ</p>
                    <p><strong>Thời gian:</strong> Ngắn và dữ dội, hoặc kéo dài grinding down</p>
                </div>

                <div class="checklist">
                    <h4>✅ Checklist Phase DOWN</h4>
                    <ul>
                        <li>Giá giảm ít nhất 10-15% từ đỉnh gần nhất</li>
                        <li>Xuất hiện ít nhất 1 nến bán tháo volume cao (climax)</li>
                        <li>Chạm vùng support quan trọng (đáy cũ, Fib, trendline)</li>
                        <li>RSI vào vùng oversold (&lt; 30) hoặc tạo divergence</li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Phase 2: PAUSE - Tích Lũy Đáy</h2>
            <div class="section-content">
                <p>Phase quan trọng nhất - nơi smart money tích lũy:</p>

                <img src="https://placehold.co/800x350/112250/FFBD59?text=Phase+2+PAUSE+Accumulation" alt="Phase 2 PAUSE Accumulation" class="image-placeholder">

                <div class="phase-card pause">
                    <h4>⏸️ Đặc Điểm Phase PAUSE</h4>
                    <p><strong>Giá:</strong> Sideway, dao động trong range hẹp tại đáy</p>
                    <p><strong>Volume:</strong> Giảm mạnh - cạn kiệt, không ai muốn bán nữa</p>
                    <p><strong>Tâm lý:</strong> Chán nản, mất quan tâm, "crypto is dead"</p>
                    <p><strong>Thời gian:</strong> Có thể kéo dài, đòi hỏi kiên nhẫn</p>
                </div>

                <div class="highlight-box">
                    <h4>💡 LFZ Formation</h4>
                    <p>Trong phase PAUSE, vùng sideway hình thành <strong>LFZ (Low Frequency Zone)</strong> - đây chính là vùng tích lũy. Khi giá break UP khỏi LFZ với volume, đó là tín hiệu LONG.</p>
                </div>

                <div class="checklist">
                    <h4>✅ Checklist Phase PAUSE</h4>
                    <ul>
                        <li>Giá sideway tối thiểu 3-5 nến trên TF đang trade</li>
                        <li>Volume giảm 50% hoặc hơn so với phase DOWN</li>
                        <li>Range sideway rõ ràng, xác định được đỉnh-đáy LFZ</li>
                        <li>Không có lower low mới (giữ được đáy)</li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Phase 3: UP - Đảo Chiều Tăng</h2>
            <div class="section-content">
                <p>Phase confirmation - khi trend mới bắt đầu:</p>

                <img src="https://placehold.co/800x350/112250/10B981?text=Phase+3+UP+Breakout" alt="Phase 3 UP Breakout" class="image-placeholder">

                <div class="phase-card up">
                    <h4>📈 Đặc Điểm Phase UP</h4>
                    <p><strong>Giá:</strong> Break UP khỏi LFZ, tạo higher high</p>
                    <p><strong>Volume:</strong> Tăng đột biến khi break - confirmation quan trọng</p>
                    <p><strong>Tâm lý:</strong> Surprise, FOMO bắt đầu xuất hiện</p>
                    <p><strong>Thời gian:</strong> Nhanh và mạnh nếu đúng reversal</p>
                </div>

                <div class="warning-box">
                    <h4>⚠️ Cảnh Báo False Break</h4>
                    <p>Không phải mọi break đều thật. Đợi nến đóng cửa phía trên LFZ và volume confirmation. False break thường có volume yếu và nến đóng lại trong range.</p>
                </div>

                <div class="checklist">
                    <h4>✅ Checklist Phase UP (Entry Signal)</h4>
                    <ul>
                        <li>Nến đóng cửa trên LFZ (đỉnh vùng tích lũy)</li>
                        <li>Volume tăng gấp 1.5-2 lần so với trung bình phase PAUSE</li>
                        <li>Không có divergence bearish trên RSI/MACD</li>
                        <li>Higher TF không trong downtrend mạnh</li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Timeline Điển Hình Của DPU</h2>
            <div class="section-content">
                <p>Tỷ lệ thời gian giữa các phase thường như sau:</p>

                <img src="https://placehold.co/800x300/112250/6A5BFF?text=DPU+Timeline+Ratio" alt="DPU Timeline Ratio" class="image-placeholder">

                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="value red">20-30%</span>
                        <span class="label">Phase DOWN</span>
                    </div>
                    <div class="stat-card">
                        <span class="value gold">50-60%</span>
                        <span class="label">Phase PAUSE</span>
                    </div>
                    <div class="stat-card">
                        <span class="value green">10-20%</span>
                        <span class="label">Phase UP</span>
                    </div>
                </div>

                <div class="highlight-box">
                    <h4>📊 Ví Dụ Thực Tế</h4>
                    <p>Nếu pattern hình thành trong 10 ngày:<br>
                    • DOWN: 2-3 ngày giảm mạnh<br>
                    • PAUSE: 5-6 ngày sideway tích lũy<br>
                    • UP: 1-2 ngày break và xác nhận</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Phase DOWN: Sóng giảm mạnh + volume cao + chạm support</li>
                <li>Phase PAUSE: Sideway tại đáy + volume cạn + LFZ hình thành</li>
                <li>Phase UP: Break LFZ + volume spike = Entry LONG</li>
                <li>PAUSE chiếm 50-60% thời gian - cần kiên nhẫn chờ đợi</li>
                <li>Luôn đợi confirmation từ volume khi break</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="1">
                    <h4>Câu 1: Phase nào chiếm nhiều thời gian nhất trong DPU?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. DOWN</div>
                        <div class="quiz-option" data-index="1">B. PAUSE</div>
                        <div class="quiz-option" data-index="2">C. UP</div>
                        <div class="quiz-option" data-index="3">D. Bằng nhau</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 2: Volume trong phase PAUSE có đặc điểm gì?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Tăng mạnh</div>
                        <div class="quiz-option" data-index="1">B. Biến động lớn</div>
                        <div class="quiz-option" data-index="2">C. Giảm mạnh (cạn kiệt)</div>
                        <div class="quiz-option" data-index="3">D. Không thay đổi</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 3: LFZ trong DPU hình thành ở phase nào?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Phase PAUSE (vùng sideway đáy)</div>
                        <div class="quiz-option" data-index="1">B. Phase DOWN</div>
                        <div class="quiz-option" data-index="2">C. Phase UP</div>
                        <div class="quiz-option" data-index="3">D. Trước Phase DOWN</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🏆 Hoàn Thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <button class="retake-btn" onclick="retakeQuiz()">Làm Lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>🎉 Hoàn thành <span class="highlight">Bài 5.2</span></p>
            <p>Tiếp theo: <strong>Bài 5.3 - Cách Vẽ LFZ Chính Xác Trong DPU</strong></p>
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

        function retakeQuiz() {
            answeredCount = 0;
            correctCount = 0;
            document.querySelectorAll(''.quiz-question'').forEach(q => {
                q.classList.remove(''answered'');
                q.querySelectorAll(''.quiz-option'').forEach(o => o.classList.remove(''correct'', ''incorrect''));
                q.querySelector(''.quiz-result'').className = ''quiz-result'';
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

-- Lesson 5.3: Cách Vẽ LFZ Chính Xác - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch5-l3',
  'module-tier-1-ch5',
  'course-tier1-trading-foundation',
  'Bài 5.3: Cách Vẽ LFZ Chính Xác - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 5.3: Cách Vẽ LFZ Chính Xác - GEM Trading Academy</title>
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --bg-card: #1a1a25;
            --bg-card-hover: #22222f;
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
            background: var(--accent-green-dim);
            color: var(--accent-green);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
            border: 1px solid var(--accent-green);
        }

        .lesson-header h1 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--text-primary), var(--accent-green));
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
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .section-content { padding: 0 16px 16px 16px; }
        }

        .section-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-green);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .section-title {
                font-size: 1.15rem;
                padding: 16px;
                padding-bottom: 12px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .section-title::before { display: none; }
        }

        .section-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-green);
            border-radius: 2px;
        }

        .section p, .section li { color: var(--text-secondary); margin-bottom: 0.8rem; }
        .section ul, .section ol { padding-left: 1.5rem; }

        .image-placeholder {
            width: 100%;
            border-radius: 12px;
            margin: 1rem 0;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .image-placeholder { border-radius: 8px; }
        }

        .step-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-green);
        }

        .step-card h4 {
            color: var(--accent-green);
            margin-bottom: 0.75rem;
            font-size: 1.1rem;
        }

        .step-card p { color: var(--text-secondary); margin-bottom: 0.5rem; }

        .highlight-box {
            background: var(--accent-gold-dim);
            border: 1px solid var(--accent-gold);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .highlight-box { border-radius: 8px; border-left: 4px solid var(--accent-gold); }
        }

        .highlight-box h4 { color: var(--accent-gold); margin-bottom: 0.5rem; }
        .highlight-box p { color: var(--text-secondary); margin: 0; }

        .warning-box {
            background: var(--accent-red-dim);
            border: 1px solid var(--accent-red);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .warning-box { border-radius: 8px; border-left: 4px solid var(--accent-red); }
        }

        .warning-box h4 { color: var(--accent-red); margin-bottom: 0.5rem; }
        .warning-box p { color: var(--text-secondary); margin: 0; }

        .info-box {
            background: var(--accent-cyan-dim);
            border: 1px solid var(--accent-cyan);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .info-box { border-radius: 8px; border-left: 4px solid var(--accent-cyan); }
        }

        .info-box h4 { color: var(--accent-cyan); margin-bottom: 0.5rem; }
        .info-box p { color: var(--text-secondary); margin: 0; }

        .comparison-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .comparison-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: var(--border-color);
                border-radius: 8px;
                overflow: hidden;
            }
        }

        .comparison-card {
            background: var(--bg-secondary);
            padding: 1rem;
            border-radius: 10px;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .comparison-card { border-radius: 0; border: none; }
        }

        .comparison-card h4 { font-size: 1rem; margin-bottom: 0.5rem; }
        .comparison-card.correct h4 { color: var(--accent-green); }
        .comparison-card.wrong h4 { color: var(--accent-red); }
        .comparison-card p { color: var(--text-secondary); font-size: 0.9rem; margin: 0; }

        .summary-box {
            background: linear-gradient(135deg, var(--accent-gold-dim), transparent);
            border: 1px solid var(--accent-gold);
            border-radius: 16px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                padding: 1.25rem 16px;
                margin: 0;
                border-left: 4px solid var(--accent-gold);
                border-right: none;
                border-top: none;
            }
        }

        .summary-box h3 { color: var(--accent-gold); margin-bottom: 1rem; }
        .summary-box ul { list-style: none; padding: 0; }

        .summary-box li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-box li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--accent-gold);
        }

        .quiz-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .quiz-content { padding: 0 16px 16px 16px; }
        }

        .quiz-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-purple);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .quiz-title {
                font-size: 1.15rem;
                padding: 16px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .quiz-title::before { display: none; }
        }

        .quiz-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-purple);
            border-radius: 2px;
        }

        .quiz-question {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-question { border-radius: 8px; border-left: 4px solid var(--accent-purple); }
        }

        .quiz-question h4 { color: var(--text-primary); margin-bottom: 1rem; }
        .quiz-options { display: flex; flex-direction: column; gap: 0.5rem; }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            color: var(--text-secondary);
        }

        .quiz-option:hover { border-color: var(--accent-purple); }
        .quiz-option.correct { border-color: var(--accent-green); background: var(--accent-green-dim); color: var(--accent-green); }
        .quiz-option.incorrect { border-color: var(--accent-red); background: var(--accent-red-dim); color: var(--accent-red); }

        .quiz-result { padding: 1rem; border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: var(--accent-green-dim); border: 1px solid var(--accent-green); color: var(--accent-green); }
        .quiz-result.incorrect { background: var(--accent-red-dim); border: 1px solid var(--accent-red); color: var(--accent-red); }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border: 1px solid var(--accent-purple);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show { display: block; }
        .quiz-score h3 { color: var(--accent-purple); margin-bottom: 0.5rem; }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--accent-purple);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            background: var(--bg-secondary);
            border-radius: 16px;
            border: 1px solid var(--border-color);
            margin-top: 1.5rem;
        }

        @media (max-width: 600px) {
            .lesson-footer { border-radius: 0; border: none; margin-top: 0; }
        }

        .lesson-footer p { color: var(--text-secondary); margin-bottom: 1rem; }
        .lesson-footer .highlight { color: var(--accent-gold); font-weight: 600; }
        strong { color: var(--accent-gold); }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">📚 Tier 1 - Bài 5.3</span>
            <h1>Cách Vẽ LFZ Chính Xác</h1>
            <p>Kỹ thuật xác định vùng tích lũy đáy để entry LONG chính xác</p>
        </header>

        <section class="section">
            <h2 class="section-title">LFZ Là Gì?</h2>
            <div class="section-content">
                <p><strong>LFZ (Low Frequency Zone)</strong> là vùng tích lũy hình thành trong phase PAUSE của DPU. Đây là nơi smart money âm thầm mua vào trước khi đẩy giá lên.</p>

                <img src="https://placehold.co/800x400/112250/10B981?text=LFZ+Definition+Diagram" alt="LFZ Definition Diagram" class="image-placeholder">

                <div class="highlight-box">
                    <h4>💡 Ý Nghĩa Của LFZ</h4>
                    <p>• <strong>Low:</strong> Vùng giá thấp (đáy của pattern)<br>
                    • <strong>Frequency:</strong> Tần suất giao dịch thấp (volume cạn)<br>
                    • <strong>Zone:</strong> Không phải một điểm, mà là một VÙNG</p>
                </div>

                <div class="info-box">
                    <h4>📊 LFZ vs HFZ</h4>
                    <p>LFZ xuất hiện trong DPU (pattern LONG) - vùng mua.<br>
                    HFZ xuất hiện trong UPD (pattern SHORT) - vùng bán.<br>
                    Cách vẽ tương tự, nhưng vị trí ngược nhau.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">4 Bước Vẽ LFZ Chuẩn</h2>
            <div class="section-content">
                <p>Quy trình 4 bước để xác định LFZ chính xác:</p>

                <img src="https://placehold.co/800x400/112250/FFBD59?text=4+Steps+Draw+LFZ" alt="4 Steps Draw LFZ" class="image-placeholder">

                <div class="step-card">
                    <h4>Bước 1: Xác Định Phase DOWN Hoàn Tất</h4>
                    <p>Đợi sóng DOWN kết thúc - giá ngừng tạo lower low mới.</p>
                    <p>Dấu hiệu: Volume giảm, xuất hiện nến đảo chiều (hammer, doji) tại đáy.</p>
                </div>

                <div class="step-card">
                    <h4>Bước 2: Đánh Dấu Đáy Của Phase DOWN</h4>
                    <p>Kẻ đường ngang tại mức giá thấp nhất (low) của nến đáy.</p>
                    <p>Đây là cạnh DƯỚI của LFZ - mức Stop Loss reference.</p>
                </div>

                <div class="step-card">
                    <h4>Bước 3: Xác Định Đỉnh Của Vùng Sideway</h4>
                    <p>Kẻ đường ngang tại high của các nến trong phase PAUSE.</p>
                    <p>Đây là cạnh TRÊN của LFZ - mức break cần vượt qua.</p>
                </div>

                <div class="step-card">
                    <h4>Bước 4: Tô Màu Và Đặt Tên Vùng</h4>
                    <p>Tô màu xanh (green) cho vùng giữa 2 đường.</p>
                    <p>Ghi chú: "LFZ - Accumulation Zone" để dễ theo dõi.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Ví Dụ Thực Tế: Vẽ LFZ Trên BTC</h2>
            <div class="section-content">
                <p>Áp dụng 4 bước trên vào chart BTC thực tế:</p>

                <img src="https://placehold.co/800x450/112250/00F0FF?text=BTC+LFZ+Example" alt="BTC LFZ Example" class="image-placeholder">

                <div class="step-card">
                    <h4>📍 Case Study: BTC/USDT H4</h4>
                    <p><strong>Phase DOWN:</strong> BTC giảm từ $44,000 → $38,500 (-12.5%)</p>
                    <p><strong>Đáy (LFZ Bottom):</strong> $38,500 - low của nến hammer</p>
                    <p><strong>Sideway Range:</strong> $38,500 - $40,200</p>
                    <p><strong>LFZ Top:</strong> $40,200 - high của consolidation</p>
                    <p><strong>LFZ Width:</strong> $1,700 (~4.4%)</p>
                </div>

                <div class="highlight-box">
                    <h4>✅ Entry Signal</h4>
                    <p>Khi nến H4 đóng cửa trên $40,200 với volume tăng → Entry LONG<br>
                    Stop Loss: Dưới $38,500 (đáy LFZ)<br>
                    Take Profit: Fibonacci extension 1.618 hoặc resistance tiếp theo</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Sai Lầm Thường Gặp Khi Vẽ LFZ</h2>
            <div class="section-content">
                <p>Tránh những lỗi phổ biến này:</p>

                <img src="https://placehold.co/800x350/112250/EF4444?text=Common+LFZ+Mistakes" alt="Common LFZ Mistakes" class="image-placeholder">

                <div class="comparison-grid">
                    <div class="comparison-card correct">
                        <h4>✅ Đúng</h4>
                        <p>• Đợi ít nhất 3-5 nến sideway</p>
                        <p>• Vẽ zone bao trùm cả wicks</p>
                        <p>• Chờ break confirmation</p>
                    </div>
                    <div class="comparison-card wrong">
                        <h4>❌ Sai</h4>
                        <p>• Vẽ quá sớm khi mới 1-2 nến</p>
                        <p>• Chỉ vẽ theo body, bỏ wicks</p>
                        <p>• Entry ngay khi chạm zone</p>
                    </div>
                </div>

                <div class="warning-box">
                    <h4>⚠️ Lỗi Nghiêm Trọng #1: Vẽ Quá Chặt</h4>
                    <p>LFZ cần có độ rộng hợp lý (2-5% range). Nếu vẽ quá chặt, sẽ bị stop out bởi noise. Luôn include cả wicks của nến trong zone.</p>
                </div>

                <div class="warning-box">
                    <h4>⚠️ Lỗi Nghiêm Trọng #2: Nhầm Với Bounce Bình Thường</h4>
                    <p>Không phải mọi bounce từ đáy đều là DPU. Cần đủ thời gian sideway (phase PAUSE) và volume confirmation khi break. Bounce 1-2 nến rồi tiếp tục giảm = không phải DPU.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">LFZ Trên Các Timeframe Khác Nhau</h2>
            <div class="section-content">
                <p>Độ rộng LFZ thay đổi theo timeframe:</p>

                <img src="https://placehold.co/800x350/112250/6A5BFF?text=LFZ+Multi+Timeframe" alt="LFZ Multi Timeframe" class="image-placeholder">

                <div class="step-card">
                    <h4>📊 LFZ Width Guidelines</h4>
                    <p><strong>M15-H1:</strong> 1-2% range (scalping, day trade)</p>
                    <p><strong>H4-D1:</strong> 2-5% range (swing trade)</p>
                    <p><strong>Weekly:</strong> 5-10% range (position trade)</p>
                    <p><strong>Monthly:</strong> 10-20% range (investment)</p>
                </div>

                <div class="info-box">
                    <h4>💡 Multi-TF Confluence</h4>
                    <p>LFZ mạnh nhất khi trùng với support của TF cao hơn. Ví dụ: LFZ trên H4 trùng với weekly support → probability tăng đáng kể.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>LFZ = Low Frequency Zone - vùng tích lũy trong phase PAUSE của DPU</li>
                <li>4 bước vẽ: Xác định DOWN kết thúc → Đánh dấu đáy → Xác định đỉnh sideway → Tô màu</li>
                <li>LFZ cần bao gồm cả wicks, không chỉ body nến</li>
                <li>Đợi ít nhất 3-5 nến sideway trước khi vẽ LFZ</li>
                <li>Entry khi nến đóng cửa trên LFZ với volume confirmation</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="1">
                    <h4>Câu 1: Cạnh trên của LFZ được xác định từ đâu?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Low của nến đáy</div>
                        <div class="quiz-option" data-index="1">B. High của các nến trong phase PAUSE</div>
                        <div class="quiz-option" data-index="2">C. Close của nến cuối</div>
                        <div class="quiz-option" data-index="3">D. Open của nến đầu</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 2: Cần bao nhiêu nến sideway tối thiểu để vẽ LFZ?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. 1 nến</div>
                        <div class="quiz-option" data-index="1">B. 2 nến</div>
                        <div class="quiz-option" data-index="2">C. 3-5 nến</div>
                        <div class="quiz-option" data-index="3">D. 10+ nến</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 3: Khi vẽ LFZ, nên bao gồm phần nào của nến?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Cả body và wicks</div>
                        <div class="quiz-option" data-index="1">B. Chỉ body</div>
                        <div class="quiz-option" data-index="2">C. Chỉ wicks</div>
                        <div class="quiz-option" data-index="3">D. Chỉ close price</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🏆 Hoàn Thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <button class="retake-btn" onclick="retakeQuiz()">Làm Lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>🎉 Hoàn thành <span class="highlight">Bài 5.3</span></p>
            <p>Tiếp theo: <strong>Bài 5.4 - Chiến Lược Entry DPU</strong></p>
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

        function retakeQuiz() {
            answeredCount = 0;
            correctCount = 0;
            document.querySelectorAll(''.quiz-question'').forEach(q => {
                q.classList.remove(''answered'');
                q.querySelectorAll(''.quiz-option'').forEach(o => o.classList.remove(''correct'', ''incorrect''));
                q.querySelector(''.quiz-result'').className = ''quiz-result'';
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
    <title>Bài 5.3: Cách Vẽ LFZ Chính Xác - GEM Trading Academy</title>
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --bg-card: #1a1a25;
            --bg-card-hover: #22222f;
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
            background: var(--accent-green-dim);
            color: var(--accent-green);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
            border: 1px solid var(--accent-green);
        }

        .lesson-header h1 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--text-primary), var(--accent-green));
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
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .section-content { padding: 0 16px 16px 16px; }
        }

        .section-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-green);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .section-title {
                font-size: 1.15rem;
                padding: 16px;
                padding-bottom: 12px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .section-title::before { display: none; }
        }

        .section-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-green);
            border-radius: 2px;
        }

        .section p, .section li { color: var(--text-secondary); margin-bottom: 0.8rem; }
        .section ul, .section ol { padding-left: 1.5rem; }

        .image-placeholder {
            width: 100%;
            border-radius: 12px;
            margin: 1rem 0;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .image-placeholder { border-radius: 8px; }
        }

        .step-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-green);
        }

        .step-card h4 {
            color: var(--accent-green);
            margin-bottom: 0.75rem;
            font-size: 1.1rem;
        }

        .step-card p { color: var(--text-secondary); margin-bottom: 0.5rem; }

        .highlight-box {
            background: var(--accent-gold-dim);
            border: 1px solid var(--accent-gold);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .highlight-box { border-radius: 8px; border-left: 4px solid var(--accent-gold); }
        }

        .highlight-box h4 { color: var(--accent-gold); margin-bottom: 0.5rem; }
        .highlight-box p { color: var(--text-secondary); margin: 0; }

        .warning-box {
            background: var(--accent-red-dim);
            border: 1px solid var(--accent-red);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .warning-box { border-radius: 8px; border-left: 4px solid var(--accent-red); }
        }

        .warning-box h4 { color: var(--accent-red); margin-bottom: 0.5rem; }
        .warning-box p { color: var(--text-secondary); margin: 0; }

        .info-box {
            background: var(--accent-cyan-dim);
            border: 1px solid var(--accent-cyan);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .info-box { border-radius: 8px; border-left: 4px solid var(--accent-cyan); }
        }

        .info-box h4 { color: var(--accent-cyan); margin-bottom: 0.5rem; }
        .info-box p { color: var(--text-secondary); margin: 0; }

        .comparison-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .comparison-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: var(--border-color);
                border-radius: 8px;
                overflow: hidden;
            }
        }

        .comparison-card {
            background: var(--bg-secondary);
            padding: 1rem;
            border-radius: 10px;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .comparison-card { border-radius: 0; border: none; }
        }

        .comparison-card h4 { font-size: 1rem; margin-bottom: 0.5rem; }
        .comparison-card.correct h4 { color: var(--accent-green); }
        .comparison-card.wrong h4 { color: var(--accent-red); }
        .comparison-card p { color: var(--text-secondary); font-size: 0.9rem; margin: 0; }

        .summary-box {
            background: linear-gradient(135deg, var(--accent-gold-dim), transparent);
            border: 1px solid var(--accent-gold);
            border-radius: 16px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                padding: 1.25rem 16px;
                margin: 0;
                border-left: 4px solid var(--accent-gold);
                border-right: none;
                border-top: none;
            }
        }

        .summary-box h3 { color: var(--accent-gold); margin-bottom: 1rem; }
        .summary-box ul { list-style: none; padding: 0; }

        .summary-box li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-box li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--accent-gold);
        }

        .quiz-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .quiz-content { padding: 0 16px 16px 16px; }
        }

        .quiz-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-purple);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .quiz-title {
                font-size: 1.15rem;
                padding: 16px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .quiz-title::before { display: none; }
        }

        .quiz-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-purple);
            border-radius: 2px;
        }

        .quiz-question {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-question { border-radius: 8px; border-left: 4px solid var(--accent-purple); }
        }

        .quiz-question h4 { color: var(--text-primary); margin-bottom: 1rem; }
        .quiz-options { display: flex; flex-direction: column; gap: 0.5rem; }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            color: var(--text-secondary);
        }

        .quiz-option:hover { border-color: var(--accent-purple); }
        .quiz-option.correct { border-color: var(--accent-green); background: var(--accent-green-dim); color: var(--accent-green); }
        .quiz-option.incorrect { border-color: var(--accent-red); background: var(--accent-red-dim); color: var(--accent-red); }

        .quiz-result { padding: 1rem; border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: var(--accent-green-dim); border: 1px solid var(--accent-green); color: var(--accent-green); }
        .quiz-result.incorrect { background: var(--accent-red-dim); border: 1px solid var(--accent-red); color: var(--accent-red); }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border: 1px solid var(--accent-purple);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show { display: block; }
        .quiz-score h3 { color: var(--accent-purple); margin-bottom: 0.5rem; }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--accent-purple);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            background: var(--bg-secondary);
            border-radius: 16px;
            border: 1px solid var(--border-color);
            margin-top: 1.5rem;
        }

        @media (max-width: 600px) {
            .lesson-footer { border-radius: 0; border: none; margin-top: 0; }
        }

        .lesson-footer p { color: var(--text-secondary); margin-bottom: 1rem; }
        .lesson-footer .highlight { color: var(--accent-gold); font-weight: 600; }
        strong { color: var(--accent-gold); }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">📚 Tier 1 - Bài 5.3</span>
            <h1>Cách Vẽ LFZ Chính Xác</h1>
            <p>Kỹ thuật xác định vùng tích lũy đáy để entry LONG chính xác</p>
        </header>

        <section class="section">
            <h2 class="section-title">LFZ Là Gì?</h2>
            <div class="section-content">
                <p><strong>LFZ (Low Frequency Zone)</strong> là vùng tích lũy hình thành trong phase PAUSE của DPU. Đây là nơi smart money âm thầm mua vào trước khi đẩy giá lên.</p>

                <img src="https://placehold.co/800x400/112250/10B981?text=LFZ+Definition+Diagram" alt="LFZ Definition Diagram" class="image-placeholder">

                <div class="highlight-box">
                    <h4>💡 Ý Nghĩa Của LFZ</h4>
                    <p>• <strong>Low:</strong> Vùng giá thấp (đáy của pattern)<br>
                    • <strong>Frequency:</strong> Tần suất giao dịch thấp (volume cạn)<br>
                    • <strong>Zone:</strong> Không phải một điểm, mà là một VÙNG</p>
                </div>

                <div class="info-box">
                    <h4>📊 LFZ vs HFZ</h4>
                    <p>LFZ xuất hiện trong DPU (pattern LONG) - vùng mua.<br>
                    HFZ xuất hiện trong UPD (pattern SHORT) - vùng bán.<br>
                    Cách vẽ tương tự, nhưng vị trí ngược nhau.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">4 Bước Vẽ LFZ Chuẩn</h2>
            <div class="section-content">
                <p>Quy trình 4 bước để xác định LFZ chính xác:</p>

                <img src="https://placehold.co/800x400/112250/FFBD59?text=4+Steps+Draw+LFZ" alt="4 Steps Draw LFZ" class="image-placeholder">

                <div class="step-card">
                    <h4>Bước 1: Xác Định Phase DOWN Hoàn Tất</h4>
                    <p>Đợi sóng DOWN kết thúc - giá ngừng tạo lower low mới.</p>
                    <p>Dấu hiệu: Volume giảm, xuất hiện nến đảo chiều (hammer, doji) tại đáy.</p>
                </div>

                <div class="step-card">
                    <h4>Bước 2: Đánh Dấu Đáy Của Phase DOWN</h4>
                    <p>Kẻ đường ngang tại mức giá thấp nhất (low) của nến đáy.</p>
                    <p>Đây là cạnh DƯỚI của LFZ - mức Stop Loss reference.</p>
                </div>

                <div class="step-card">
                    <h4>Bước 3: Xác Định Đỉnh Của Vùng Sideway</h4>
                    <p>Kẻ đường ngang tại high của các nến trong phase PAUSE.</p>
                    <p>Đây là cạnh TRÊN của LFZ - mức break cần vượt qua.</p>
                </div>

                <div class="step-card">
                    <h4>Bước 4: Tô Màu Và Đặt Tên Vùng</h4>
                    <p>Tô màu xanh (green) cho vùng giữa 2 đường.</p>
                    <p>Ghi chú: "LFZ - Accumulation Zone" để dễ theo dõi.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Ví Dụ Thực Tế: Vẽ LFZ Trên BTC</h2>
            <div class="section-content">
                <p>Áp dụng 4 bước trên vào chart BTC thực tế:</p>

                <img src="https://placehold.co/800x450/112250/00F0FF?text=BTC+LFZ+Example" alt="BTC LFZ Example" class="image-placeholder">

                <div class="step-card">
                    <h4>📍 Case Study: BTC/USDT H4</h4>
                    <p><strong>Phase DOWN:</strong> BTC giảm từ $44,000 → $38,500 (-12.5%)</p>
                    <p><strong>Đáy (LFZ Bottom):</strong> $38,500 - low của nến hammer</p>
                    <p><strong>Sideway Range:</strong> $38,500 - $40,200</p>
                    <p><strong>LFZ Top:</strong> $40,200 - high của consolidation</p>
                    <p><strong>LFZ Width:</strong> $1,700 (~4.4%)</p>
                </div>

                <div class="highlight-box">
                    <h4>✅ Entry Signal</h4>
                    <p>Khi nến H4 đóng cửa trên $40,200 với volume tăng → Entry LONG<br>
                    Stop Loss: Dưới $38,500 (đáy LFZ)<br>
                    Take Profit: Fibonacci extension 1.618 hoặc resistance tiếp theo</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Sai Lầm Thường Gặp Khi Vẽ LFZ</h2>
            <div class="section-content">
                <p>Tránh những lỗi phổ biến này:</p>

                <img src="https://placehold.co/800x350/112250/EF4444?text=Common+LFZ+Mistakes" alt="Common LFZ Mistakes" class="image-placeholder">

                <div class="comparison-grid">
                    <div class="comparison-card correct">
                        <h4>✅ Đúng</h4>
                        <p>• Đợi ít nhất 3-5 nến sideway</p>
                        <p>• Vẽ zone bao trùm cả wicks</p>
                        <p>• Chờ break confirmation</p>
                    </div>
                    <div class="comparison-card wrong">
                        <h4>❌ Sai</h4>
                        <p>• Vẽ quá sớm khi mới 1-2 nến</p>
                        <p>• Chỉ vẽ theo body, bỏ wicks</p>
                        <p>• Entry ngay khi chạm zone</p>
                    </div>
                </div>

                <div class="warning-box">
                    <h4>⚠️ Lỗi Nghiêm Trọng #1: Vẽ Quá Chặt</h4>
                    <p>LFZ cần có độ rộng hợp lý (2-5% range). Nếu vẽ quá chặt, sẽ bị stop out bởi noise. Luôn include cả wicks của nến trong zone.</p>
                </div>

                <div class="warning-box">
                    <h4>⚠️ Lỗi Nghiêm Trọng #2: Nhầm Với Bounce Bình Thường</h4>
                    <p>Không phải mọi bounce từ đáy đều là DPU. Cần đủ thời gian sideway (phase PAUSE) và volume confirmation khi break. Bounce 1-2 nến rồi tiếp tục giảm = không phải DPU.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">LFZ Trên Các Timeframe Khác Nhau</h2>
            <div class="section-content">
                <p>Độ rộng LFZ thay đổi theo timeframe:</p>

                <img src="https://placehold.co/800x350/112250/6A5BFF?text=LFZ+Multi+Timeframe" alt="LFZ Multi Timeframe" class="image-placeholder">

                <div class="step-card">
                    <h4>📊 LFZ Width Guidelines</h4>
                    <p><strong>M15-H1:</strong> 1-2% range (scalping, day trade)</p>
                    <p><strong>H4-D1:</strong> 2-5% range (swing trade)</p>
                    <p><strong>Weekly:</strong> 5-10% range (position trade)</p>
                    <p><strong>Monthly:</strong> 10-20% range (investment)</p>
                </div>

                <div class="info-box">
                    <h4>💡 Multi-TF Confluence</h4>
                    <p>LFZ mạnh nhất khi trùng với support của TF cao hơn. Ví dụ: LFZ trên H4 trùng với weekly support → probability tăng đáng kể.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>LFZ = Low Frequency Zone - vùng tích lũy trong phase PAUSE của DPU</li>
                <li>4 bước vẽ: Xác định DOWN kết thúc → Đánh dấu đáy → Xác định đỉnh sideway → Tô màu</li>
                <li>LFZ cần bao gồm cả wicks, không chỉ body nến</li>
                <li>Đợi ít nhất 3-5 nến sideway trước khi vẽ LFZ</li>
                <li>Entry khi nến đóng cửa trên LFZ với volume confirmation</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="1">
                    <h4>Câu 1: Cạnh trên của LFZ được xác định từ đâu?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Low của nến đáy</div>
                        <div class="quiz-option" data-index="1">B. High của các nến trong phase PAUSE</div>
                        <div class="quiz-option" data-index="2">C. Close của nến cuối</div>
                        <div class="quiz-option" data-index="3">D. Open của nến đầu</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 2: Cần bao nhiêu nến sideway tối thiểu để vẽ LFZ?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. 1 nến</div>
                        <div class="quiz-option" data-index="1">B. 2 nến</div>
                        <div class="quiz-option" data-index="2">C. 3-5 nến</div>
                        <div class="quiz-option" data-index="3">D. 10+ nến</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 3: Khi vẽ LFZ, nên bao gồm phần nào của nến?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Cả body và wicks</div>
                        <div class="quiz-option" data-index="1">B. Chỉ body</div>
                        <div class="quiz-option" data-index="2">C. Chỉ wicks</div>
                        <div class="quiz-option" data-index="3">D. Chỉ close price</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🏆 Hoàn Thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <button class="retake-btn" onclick="retakeQuiz()">Làm Lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>🎉 Hoàn thành <span class="highlight">Bài 5.3</span></p>
            <p>Tiếp theo: <strong>Bài 5.4 - Chiến Lược Entry DPU</strong></p>
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

        function retakeQuiz() {
            answeredCount = 0;
            correctCount = 0;
            document.querySelectorAll(''.quiz-question'').forEach(q => {
                q.classList.remove(''answered'');
                q.querySelectorAll(''.quiz-option'').forEach(o => o.classList.remove(''correct'', ''incorrect''));
                q.querySelector(''.quiz-result'').className = ''quiz-result'';
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

-- Lesson 5.4: Chiến Lược Entry DPU - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch5-l4',
  'module-tier-1-ch5',
  'course-tier1-trading-foundation',
  'Bài 5.4: Chiến Lược Entry DPU - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 5.4: Chiến Lược Entry DPU - GEM Trading Academy</title>
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --bg-card: #1a1a25;
            --bg-card-hover: #22222f;
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
            background: var(--accent-green-dim);
            color: var(--accent-green);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
            border: 1px solid var(--accent-green);
        }

        .lesson-header h1 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--text-primary), var(--accent-green));
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
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .section-content { padding: 0 16px 16px 16px; }
        }

        .section-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-green);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .section-title {
                font-size: 1.15rem;
                padding: 16px;
                padding-bottom: 12px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .section-title::before { display: none; }
        }

        .section-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-green);
            border-radius: 2px;
        }

        .section p, .section li { color: var(--text-secondary); margin-bottom: 0.8rem; }
        .section ul, .section ol { padding-left: 1.5rem; }

        .image-placeholder {
            width: 100%;
            border-radius: 12px;
            margin: 1rem 0;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .image-placeholder { border-radius: 8px; }
        }

        .strategy-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border: 2px solid var(--accent-green);
        }

        .strategy-card h4 {
            color: var(--accent-green);
            margin-bottom: 0.75rem;
            font-size: 1.1rem;
        }

        .strategy-card p { color: var(--text-secondary); margin-bottom: 0.5rem; }

        .entry-box {
            background: linear-gradient(135deg, var(--accent-green-dim), transparent);
            border: 1px solid var(--accent-green);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .entry-box { border-radius: 8px; }
        }

        .entry-box h4 { color: var(--accent-green); margin-bottom: 0.75rem; }

        .entry-box ul { list-style: none; padding: 0; }

        .entry-box li {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            color: var(--text-secondary);
        }

        .entry-box li:last-child { border-bottom: none; }

        .entry-box .label { color: var(--text-muted); }
        .entry-box .value { color: var(--text-primary); font-weight: 500; }
        .entry-box .value.green { color: var(--accent-green); }
        .entry-box .value.red { color: var(--accent-red); }
        .entry-box .value.gold { color: var(--accent-gold); }

        .highlight-box {
            background: var(--accent-gold-dim);
            border: 1px solid var(--accent-gold);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .highlight-box { border-radius: 8px; border-left: 4px solid var(--accent-gold); }
        }

        .highlight-box h4 { color: var(--accent-gold); margin-bottom: 0.5rem; }
        .highlight-box p { color: var(--text-secondary); margin: 0; }

        .warning-box {
            background: var(--accent-red-dim);
            border: 1px solid var(--accent-red);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .warning-box { border-radius: 8px; border-left: 4px solid var(--accent-red); }
        }

        .warning-box h4 { color: var(--accent-red); margin-bottom: 0.5rem; }
        .warning-box p { color: var(--text-secondary); margin: 0; }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .stats-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: var(--border-color);
                border-radius: 8px;
                overflow: hidden;
            }
        }

        .stat-card {
            background: var(--bg-secondary);
            padding: 1rem;
            border-radius: 10px;
            text-align: center;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .stat-card { border-radius: 0; border: none; }
        }

        .stat-card .value {
            font-size: 1.3rem;
            font-weight: 700;
            display: block;
            color: var(--accent-green);
        }

        .stat-card .label { font-size: 0.85rem; color: var(--text-muted); }

        .summary-box {
            background: linear-gradient(135deg, var(--accent-gold-dim), transparent);
            border: 1px solid var(--accent-gold);
            border-radius: 16px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                padding: 1.25rem 16px;
                margin: 0;
                border-left: 4px solid var(--accent-gold);
                border-right: none;
                border-top: none;
            }
        }

        .summary-box h3 { color: var(--accent-gold); margin-bottom: 1rem; }
        .summary-box ul { list-style: none; padding: 0; }

        .summary-box li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-box li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--accent-gold);
        }

        .quiz-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .quiz-content { padding: 0 16px 16px 16px; }
        }

        .quiz-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-purple);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .quiz-title {
                font-size: 1.15rem;
                padding: 16px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .quiz-title::before { display: none; }
        }

        .quiz-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-purple);
            border-radius: 2px;
        }

        .quiz-question {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-question { border-radius: 8px; border-left: 4px solid var(--accent-purple); }
        }

        .quiz-question h4 { color: var(--text-primary); margin-bottom: 1rem; }
        .quiz-options { display: flex; flex-direction: column; gap: 0.5rem; }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            color: var(--text-secondary);
        }

        .quiz-option:hover { border-color: var(--accent-purple); }
        .quiz-option.correct { border-color: var(--accent-green); background: var(--accent-green-dim); color: var(--accent-green); }
        .quiz-option.incorrect { border-color: var(--accent-red); background: var(--accent-red-dim); color: var(--accent-red); }

        .quiz-result { padding: 1rem; border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: var(--accent-green-dim); border: 1px solid var(--accent-green); color: var(--accent-green); }
        .quiz-result.incorrect { background: var(--accent-red-dim); border: 1px solid var(--accent-red); color: var(--accent-red); }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border: 1px solid var(--accent-purple);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show { display: block; }
        .quiz-score h3 { color: var(--accent-purple); margin-bottom: 0.5rem; }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--accent-purple);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            background: var(--bg-secondary);
            border-radius: 16px;
            border: 1px solid var(--border-color);
            margin-top: 1.5rem;
        }

        @media (max-width: 600px) {
            .lesson-footer { border-radius: 0; border: none; margin-top: 0; }
        }

        .lesson-footer p { color: var(--text-secondary); margin-bottom: 1rem; }
        .lesson-footer .highlight { color: var(--accent-gold); font-weight: 600; }
        strong { color: var(--accent-gold); }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">📚 Tier 1 - Bài 5.4</span>
            <h1>Chiến Lược Entry DPU</h1>
            <p>3 phương pháp entry và quản lý vị thế LONG từ DPU pattern</p>
        </header>

        <section class="section">
            <h2 class="section-title">Tổng Quan 3 Phương Pháp Entry</h2>
            <div class="section-content">
                <p>Có 3 cách tiếp cận entry cho DPU, mỗi cách phù hợp với risk profile khác nhau:</p>

                <img src="https://placehold.co/800x400/112250/10B981?text=3+DPU+Entry+Methods" alt="3 DPU Entry Methods" class="image-placeholder">

                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="value">Aggressive</span>
                        <span class="label">Entry sớm, R:R cao</span>
                    </div>
                    <div class="stat-card">
                        <span class="value">Standard</span>
                        <span class="label">Cân bằng risk/reward</span>
                    </div>
                    <div class="stat-card">
                        <span class="value">Conservative</span>
                        <span class="label">An toàn, win rate cao</span>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Entry #1: Aggressive - Trong LFZ</h2>
            <div class="section-content">
                <p>Entry ngay trong vùng LFZ khi có dấu hiệu reversal:</p>

                <img src="https://placehold.co/800x350/112250/EF4444?text=Aggressive+Entry+LFZ" alt="Aggressive Entry LFZ" class="image-placeholder">

                <div class="strategy-card">
                    <h4>⚡ Aggressive Entry</h4>
                    <p><strong>Điều kiện:</strong> Nến reversal (hammer, engulfing) xuất hiện trong LFZ</p>
                    <p><strong>Entry:</strong> Close của nến reversal</p>
                    <p><strong>Stop Loss:</strong> Dưới đáy LFZ (thường 1-2% dưới low)</p>
                    <p><strong>Ưu điểm:</strong> R:R cao nhất (3:1 - 5:1)</p>
                    <p><strong>Nhược điểm:</strong> Win rate thấp hơn (~50-55%)</p>
                </div>

                <div class="entry-box">
                    <h4>📊 Ví Dụ Aggressive Entry</h4>
                    <ul>
                        <li><span class="label">LFZ Range</span><span class="value">$38,500 - $40,200</span></li>
                        <li><span class="label">Entry</span><span class="value green">$39,000 (trong LFZ)</span></li>
                        <li><span class="label">Stop Loss</span><span class="value red">$38,000 (-2.6%)</span></li>
                        <li><span class="label">Target</span><span class="value gold">$43,000 (+10.3%)</span></li>
                        <li><span class="label">R:R Ratio</span><span class="value gold">4:1</span></li>
                    </ul>
                </div>

                <div class="warning-box">
                    <h4>⚠️ Rủi Ro</h4>
                    <p>Entry aggressive dễ bị stop out nếu giá retest đáy LFZ. Chỉ phù hợp với trader có kinh nghiệm và quản lý risk tốt.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Entry #2: Standard - Break LFZ</h2>
            <div class="section-content">
                <p>Entry khi nến đóng cửa phía trên LFZ - phương pháp được khuyến nghị:</p>

                <img src="https://placehold.co/800x350/112250/10B981?text=Standard+Entry+Break+LFZ" alt="Standard Entry Break LFZ" class="image-placeholder">

                <div class="strategy-card">
                    <h4>✅ Standard Entry (Khuyến Nghị)</h4>
                    <p><strong>Điều kiện:</strong> Nến đóng cửa TRÊN cạnh trên LFZ + Volume spike</p>
                    <p><strong>Entry:</strong> Close của nến break hoặc pullback nhỏ</p>
                    <p><strong>Stop Loss:</strong> Dưới LFZ hoặc giữa LFZ</p>
                    <p><strong>Ưu điểm:</strong> Cân bằng tốt giữa R:R (2.5:1 - 3:1) và win rate (60-65%)</p>
                    <p><strong>Nhược điểm:</strong> Miss một phần profit nếu giá pump mạnh</p>
                </div>

                <div class="entry-box">
                    <h4>📊 Ví Dụ Standard Entry</h4>
                    <ul>
                        <li><span class="label">LFZ Top</span><span class="value">$40,200</span></li>
                        <li><span class="label">Entry</span><span class="value green">$40,500 (trên LFZ)</span></li>
                        <li><span class="label">Stop Loss</span><span class="value red">$39,200 (-3.2%)</span></li>
                        <li><span class="label">Target</span><span class="value gold">$44,500 (+9.9%)</span></li>
                        <li><span class="label">R:R Ratio</span><span class="value gold">3:1</span></li>
                    </ul>
                </div>

                <div class="highlight-box">
                    <h4>💡 Volume Confirmation</h4>
                    <p>Nến break LFZ phải có volume tăng ít nhất 1.5x so với trung bình 5 nến trước. Nếu volume yếu, có thể là false break - đợi retest.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Entry #3: Conservative - Retest LFZ</h2>
            <div class="section-content">
                <p>Đợi giá break rồi pullback retest LFZ trước khi entry:</p>

                <img src="https://placehold.co/800x350/112250/00F0FF?text=Conservative+Entry+Retest" alt="Conservative Entry Retest" class="image-placeholder">

                <div class="strategy-card">
                    <h4>🛡️ Conservative Entry</h4>
                    <p><strong>Điều kiện:</strong> Giá break LFZ → pullback về test đỉnh LFZ → bounce lên</p>
                    <p><strong>Entry:</strong> Khi nến bounce từ vùng LFZ top</p>
                    <p><strong>Stop Loss:</strong> Dưới LFZ</p>
                    <p><strong>Ưu điểm:</strong> Win rate cao nhất (65-70%), entry giá tốt</p>
                    <p><strong>Nhược điểm:</strong> Không phải lúc nào cũng có retest, có thể miss trade</p>
                </div>

                <div class="entry-box">
                    <h4>📊 Ví Dụ Conservative Entry</h4>
                    <ul>
                        <li><span class="label">Break Price</span><span class="value">$40,500</span></li>
                        <li><span class="label">Retest Level</span><span class="value">$40,200 (LFZ top)</span></li>
                        <li><span class="label">Entry</span><span class="value green">$40,300 (bounce)</span></li>
                        <li><span class="label">Stop Loss</span><span class="value red">$39,200 (-2.7%)</span></li>
                        <li><span class="label">Target</span><span class="value gold">$44,500 (+10.4%)</span></li>
                        <li><span class="label">R:R Ratio</span><span class="value gold">3.8:1</span></li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Stop Loss & Take Profit</h2>
            <div class="section-content">
                <p>Quản lý vị thế đúng cách quyết định profitability dài hạn:</p>

                <img src="https://placehold.co/800x350/112250/FFBD59?text=SL+TP+Management" alt="SL TP Management" class="image-placeholder">

                <div class="strategy-card">
                    <h4>🛑 Stop Loss Rules</h4>
                    <p><strong>Rule #1:</strong> SL luôn đặt DƯỚI đáy LFZ (buffer 1-2%)</p>
                    <p><strong>Rule #2:</strong> Không bao giờ move SL xuống thấp hơn</p>
                    <p><strong>Rule #3:</strong> Move SL lên breakeven sau khi profit 1R</p>
                    <p><strong>Rule #4:</strong> Trailing stop khi trend mạnh</p>
                </div>

                <div class="strategy-card">
                    <h4>🎯 Take Profit Targets</h4>
                    <p><strong>TP1 (50%):</strong> Previous resistance hoặc 1.618 Fib extension</p>
                    <p><strong>TP2 (30%):</strong> 2.618 Fib extension hoặc next major resistance</p>
                    <p><strong>TP3 (20%):</strong> Trailing stop cho "moon bag"</p>
                </div>

                <div class="highlight-box">
                    <h4>💡 Partial Profit Strategy</h4>
                    <p>Không chốt hết 100% tại một điểm. Chia thành 2-3 phần để maximize profit trong trường hợp trend mạnh, đồng thời lock profit sớm.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>3 phương pháp entry: Aggressive (trong LFZ), Standard (break LFZ), Conservative (retest)</li>
                <li>Standard entry được khuyến nghị cho đa số trader: R:R 2.5-3:1, win rate 60-65%</li>
                <li>Volume confirmation là yếu tố bắt buộc khi break LFZ</li>
                <li>SL luôn đặt dưới đáy LFZ với buffer 1-2%</li>
                <li>Chia TP thành 2-3 phần để optimize profit</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="1">
                    <h4>Câu 1: Phương pháp entry nào được khuyến nghị cho đa số trader?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Aggressive (trong LFZ)</div>
                        <div class="quiz-option" data-index="1">B. Standard (break LFZ)</div>
                        <div class="quiz-option" data-index="2">C. Conservative (retest)</div>
                        <div class="quiz-option" data-index="3">D. Tất cả đều như nhau</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 2: Stop Loss nên đặt ở đâu trong DPU trade?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Trên đỉnh LFZ</div>
                        <div class="quiz-option" data-index="1">B. Giữa LFZ</div>
                        <div class="quiz-option" data-index="2">C. Dưới đáy LFZ (với buffer)</div>
                        <div class="quiz-option" data-index="3">D. Không cần SL</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 3: Khi nào nên move SL lên breakeven?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Sau khi profit 1R</div>
                        <div class="quiz-option" data-index="1">B. Ngay sau khi entry</div>
                        <div class="quiz-option" data-index="2">C. Khi đạt TP cuối</div>
                        <div class="quiz-option" data-index="3">D. Không bao giờ move</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🏆 Hoàn Thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <button class="retake-btn" onclick="retakeQuiz()">Làm Lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>🎉 Hoàn thành <span class="highlight">Bài 5.4</span></p>
            <p>Tiếp theo: <strong>Bài 5.5 - DPU Checklist 8 Điểm</strong></p>
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

        function retakeQuiz() {
            answeredCount = 0;
            correctCount = 0;
            document.querySelectorAll(''.quiz-question'').forEach(q => {
                q.classList.remove(''answered'');
                q.querySelectorAll(''.quiz-option'').forEach(o => o.classList.remove(''correct'', ''incorrect''));
                q.querySelector(''.quiz-result'').className = ''quiz-result'';
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
    <title>Bài 5.4: Chiến Lược Entry DPU - GEM Trading Academy</title>
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --bg-card: #1a1a25;
            --bg-card-hover: #22222f;
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
            background: var(--accent-green-dim);
            color: var(--accent-green);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
            border: 1px solid var(--accent-green);
        }

        .lesson-header h1 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--text-primary), var(--accent-green));
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
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .section-content { padding: 0 16px 16px 16px; }
        }

        .section-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-green);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .section-title {
                font-size: 1.15rem;
                padding: 16px;
                padding-bottom: 12px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .section-title::before { display: none; }
        }

        .section-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-green);
            border-radius: 2px;
        }

        .section p, .section li { color: var(--text-secondary); margin-bottom: 0.8rem; }
        .section ul, .section ol { padding-left: 1.5rem; }

        .image-placeholder {
            width: 100%;
            border-radius: 12px;
            margin: 1rem 0;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .image-placeholder { border-radius: 8px; }
        }

        .strategy-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border: 2px solid var(--accent-green);
        }

        .strategy-card h4 {
            color: var(--accent-green);
            margin-bottom: 0.75rem;
            font-size: 1.1rem;
        }

        .strategy-card p { color: var(--text-secondary); margin-bottom: 0.5rem; }

        .entry-box {
            background: linear-gradient(135deg, var(--accent-green-dim), transparent);
            border: 1px solid var(--accent-green);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .entry-box { border-radius: 8px; }
        }

        .entry-box h4 { color: var(--accent-green); margin-bottom: 0.75rem; }

        .entry-box ul { list-style: none; padding: 0; }

        .entry-box li {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            color: var(--text-secondary);
        }

        .entry-box li:last-child { border-bottom: none; }

        .entry-box .label { color: var(--text-muted); }
        .entry-box .value { color: var(--text-primary); font-weight: 500; }
        .entry-box .value.green { color: var(--accent-green); }
        .entry-box .value.red { color: var(--accent-red); }
        .entry-box .value.gold { color: var(--accent-gold); }

        .highlight-box {
            background: var(--accent-gold-dim);
            border: 1px solid var(--accent-gold);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .highlight-box { border-radius: 8px; border-left: 4px solid var(--accent-gold); }
        }

        .highlight-box h4 { color: var(--accent-gold); margin-bottom: 0.5rem; }
        .highlight-box p { color: var(--text-secondary); margin: 0; }

        .warning-box {
            background: var(--accent-red-dim);
            border: 1px solid var(--accent-red);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .warning-box { border-radius: 8px; border-left: 4px solid var(--accent-red); }
        }

        .warning-box h4 { color: var(--accent-red); margin-bottom: 0.5rem; }
        .warning-box p { color: var(--text-secondary); margin: 0; }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .stats-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: var(--border-color);
                border-radius: 8px;
                overflow: hidden;
            }
        }

        .stat-card {
            background: var(--bg-secondary);
            padding: 1rem;
            border-radius: 10px;
            text-align: center;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .stat-card { border-radius: 0; border: none; }
        }

        .stat-card .value {
            font-size: 1.3rem;
            font-weight: 700;
            display: block;
            color: var(--accent-green);
        }

        .stat-card .label { font-size: 0.85rem; color: var(--text-muted); }

        .summary-box {
            background: linear-gradient(135deg, var(--accent-gold-dim), transparent);
            border: 1px solid var(--accent-gold);
            border-radius: 16px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                padding: 1.25rem 16px;
                margin: 0;
                border-left: 4px solid var(--accent-gold);
                border-right: none;
                border-top: none;
            }
        }

        .summary-box h3 { color: var(--accent-gold); margin-bottom: 1rem; }
        .summary-box ul { list-style: none; padding: 0; }

        .summary-box li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-box li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--accent-gold);
        }

        .quiz-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .quiz-content { padding: 0 16px 16px 16px; }
        }

        .quiz-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-purple);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .quiz-title {
                font-size: 1.15rem;
                padding: 16px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .quiz-title::before { display: none; }
        }

        .quiz-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-purple);
            border-radius: 2px;
        }

        .quiz-question {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-question { border-radius: 8px; border-left: 4px solid var(--accent-purple); }
        }

        .quiz-question h4 { color: var(--text-primary); margin-bottom: 1rem; }
        .quiz-options { display: flex; flex-direction: column; gap: 0.5rem; }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            color: var(--text-secondary);
        }

        .quiz-option:hover { border-color: var(--accent-purple); }
        .quiz-option.correct { border-color: var(--accent-green); background: var(--accent-green-dim); color: var(--accent-green); }
        .quiz-option.incorrect { border-color: var(--accent-red); background: var(--accent-red-dim); color: var(--accent-red); }

        .quiz-result { padding: 1rem; border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: var(--accent-green-dim); border: 1px solid var(--accent-green); color: var(--accent-green); }
        .quiz-result.incorrect { background: var(--accent-red-dim); border: 1px solid var(--accent-red); color: var(--accent-red); }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border: 1px solid var(--accent-purple);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show { display: block; }
        .quiz-score h3 { color: var(--accent-purple); margin-bottom: 0.5rem; }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--accent-purple);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            background: var(--bg-secondary);
            border-radius: 16px;
            border: 1px solid var(--border-color);
            margin-top: 1.5rem;
        }

        @media (max-width: 600px) {
            .lesson-footer { border-radius: 0; border: none; margin-top: 0; }
        }

        .lesson-footer p { color: var(--text-secondary); margin-bottom: 1rem; }
        .lesson-footer .highlight { color: var(--accent-gold); font-weight: 600; }
        strong { color: var(--accent-gold); }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">📚 Tier 1 - Bài 5.4</span>
            <h1>Chiến Lược Entry DPU</h1>
            <p>3 phương pháp entry và quản lý vị thế LONG từ DPU pattern</p>
        </header>

        <section class="section">
            <h2 class="section-title">Tổng Quan 3 Phương Pháp Entry</h2>
            <div class="section-content">
                <p>Có 3 cách tiếp cận entry cho DPU, mỗi cách phù hợp với risk profile khác nhau:</p>

                <img src="https://placehold.co/800x400/112250/10B981?text=3+DPU+Entry+Methods" alt="3 DPU Entry Methods" class="image-placeholder">

                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="value">Aggressive</span>
                        <span class="label">Entry sớm, R:R cao</span>
                    </div>
                    <div class="stat-card">
                        <span class="value">Standard</span>
                        <span class="label">Cân bằng risk/reward</span>
                    </div>
                    <div class="stat-card">
                        <span class="value">Conservative</span>
                        <span class="label">An toàn, win rate cao</span>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Entry #1: Aggressive - Trong LFZ</h2>
            <div class="section-content">
                <p>Entry ngay trong vùng LFZ khi có dấu hiệu reversal:</p>

                <img src="https://placehold.co/800x350/112250/EF4444?text=Aggressive+Entry+LFZ" alt="Aggressive Entry LFZ" class="image-placeholder">

                <div class="strategy-card">
                    <h4>⚡ Aggressive Entry</h4>
                    <p><strong>Điều kiện:</strong> Nến reversal (hammer, engulfing) xuất hiện trong LFZ</p>
                    <p><strong>Entry:</strong> Close của nến reversal</p>
                    <p><strong>Stop Loss:</strong> Dưới đáy LFZ (thường 1-2% dưới low)</p>
                    <p><strong>Ưu điểm:</strong> R:R cao nhất (3:1 - 5:1)</p>
                    <p><strong>Nhược điểm:</strong> Win rate thấp hơn (~50-55%)</p>
                </div>

                <div class="entry-box">
                    <h4>📊 Ví Dụ Aggressive Entry</h4>
                    <ul>
                        <li><span class="label">LFZ Range</span><span class="value">$38,500 - $40,200</span></li>
                        <li><span class="label">Entry</span><span class="value green">$39,000 (trong LFZ)</span></li>
                        <li><span class="label">Stop Loss</span><span class="value red">$38,000 (-2.6%)</span></li>
                        <li><span class="label">Target</span><span class="value gold">$43,000 (+10.3%)</span></li>
                        <li><span class="label">R:R Ratio</span><span class="value gold">4:1</span></li>
                    </ul>
                </div>

                <div class="warning-box">
                    <h4>⚠️ Rủi Ro</h4>
                    <p>Entry aggressive dễ bị stop out nếu giá retest đáy LFZ. Chỉ phù hợp với trader có kinh nghiệm và quản lý risk tốt.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Entry #2: Standard - Break LFZ</h2>
            <div class="section-content">
                <p>Entry khi nến đóng cửa phía trên LFZ - phương pháp được khuyến nghị:</p>

                <img src="https://placehold.co/800x350/112250/10B981?text=Standard+Entry+Break+LFZ" alt="Standard Entry Break LFZ" class="image-placeholder">

                <div class="strategy-card">
                    <h4>✅ Standard Entry (Khuyến Nghị)</h4>
                    <p><strong>Điều kiện:</strong> Nến đóng cửa TRÊN cạnh trên LFZ + Volume spike</p>
                    <p><strong>Entry:</strong> Close của nến break hoặc pullback nhỏ</p>
                    <p><strong>Stop Loss:</strong> Dưới LFZ hoặc giữa LFZ</p>
                    <p><strong>Ưu điểm:</strong> Cân bằng tốt giữa R:R (2.5:1 - 3:1) và win rate (60-65%)</p>
                    <p><strong>Nhược điểm:</strong> Miss một phần profit nếu giá pump mạnh</p>
                </div>

                <div class="entry-box">
                    <h4>📊 Ví Dụ Standard Entry</h4>
                    <ul>
                        <li><span class="label">LFZ Top</span><span class="value">$40,200</span></li>
                        <li><span class="label">Entry</span><span class="value green">$40,500 (trên LFZ)</span></li>
                        <li><span class="label">Stop Loss</span><span class="value red">$39,200 (-3.2%)</span></li>
                        <li><span class="label">Target</span><span class="value gold">$44,500 (+9.9%)</span></li>
                        <li><span class="label">R:R Ratio</span><span class="value gold">3:1</span></li>
                    </ul>
                </div>

                <div class="highlight-box">
                    <h4>💡 Volume Confirmation</h4>
                    <p>Nến break LFZ phải có volume tăng ít nhất 1.5x so với trung bình 5 nến trước. Nếu volume yếu, có thể là false break - đợi retest.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Entry #3: Conservative - Retest LFZ</h2>
            <div class="section-content">
                <p>Đợi giá break rồi pullback retest LFZ trước khi entry:</p>

                <img src="https://placehold.co/800x350/112250/00F0FF?text=Conservative+Entry+Retest" alt="Conservative Entry Retest" class="image-placeholder">

                <div class="strategy-card">
                    <h4>🛡️ Conservative Entry</h4>
                    <p><strong>Điều kiện:</strong> Giá break LFZ → pullback về test đỉnh LFZ → bounce lên</p>
                    <p><strong>Entry:</strong> Khi nến bounce từ vùng LFZ top</p>
                    <p><strong>Stop Loss:</strong> Dưới LFZ</p>
                    <p><strong>Ưu điểm:</strong> Win rate cao nhất (65-70%), entry giá tốt</p>
                    <p><strong>Nhược điểm:</strong> Không phải lúc nào cũng có retest, có thể miss trade</p>
                </div>

                <div class="entry-box">
                    <h4>📊 Ví Dụ Conservative Entry</h4>
                    <ul>
                        <li><span class="label">Break Price</span><span class="value">$40,500</span></li>
                        <li><span class="label">Retest Level</span><span class="value">$40,200 (LFZ top)</span></li>
                        <li><span class="label">Entry</span><span class="value green">$40,300 (bounce)</span></li>
                        <li><span class="label">Stop Loss</span><span class="value red">$39,200 (-2.7%)</span></li>
                        <li><span class="label">Target</span><span class="value gold">$44,500 (+10.4%)</span></li>
                        <li><span class="label">R:R Ratio</span><span class="value gold">3.8:1</span></li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Stop Loss & Take Profit</h2>
            <div class="section-content">
                <p>Quản lý vị thế đúng cách quyết định profitability dài hạn:</p>

                <img src="https://placehold.co/800x350/112250/FFBD59?text=SL+TP+Management" alt="SL TP Management" class="image-placeholder">

                <div class="strategy-card">
                    <h4>🛑 Stop Loss Rules</h4>
                    <p><strong>Rule #1:</strong> SL luôn đặt DƯỚI đáy LFZ (buffer 1-2%)</p>
                    <p><strong>Rule #2:</strong> Không bao giờ move SL xuống thấp hơn</p>
                    <p><strong>Rule #3:</strong> Move SL lên breakeven sau khi profit 1R</p>
                    <p><strong>Rule #4:</strong> Trailing stop khi trend mạnh</p>
                </div>

                <div class="strategy-card">
                    <h4>🎯 Take Profit Targets</h4>
                    <p><strong>TP1 (50%):</strong> Previous resistance hoặc 1.618 Fib extension</p>
                    <p><strong>TP2 (30%):</strong> 2.618 Fib extension hoặc next major resistance</p>
                    <p><strong>TP3 (20%):</strong> Trailing stop cho "moon bag"</p>
                </div>

                <div class="highlight-box">
                    <h4>💡 Partial Profit Strategy</h4>
                    <p>Không chốt hết 100% tại một điểm. Chia thành 2-3 phần để maximize profit trong trường hợp trend mạnh, đồng thời lock profit sớm.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>3 phương pháp entry: Aggressive (trong LFZ), Standard (break LFZ), Conservative (retest)</li>
                <li>Standard entry được khuyến nghị cho đa số trader: R:R 2.5-3:1, win rate 60-65%</li>
                <li>Volume confirmation là yếu tố bắt buộc khi break LFZ</li>
                <li>SL luôn đặt dưới đáy LFZ với buffer 1-2%</li>
                <li>Chia TP thành 2-3 phần để optimize profit</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="1">
                    <h4>Câu 1: Phương pháp entry nào được khuyến nghị cho đa số trader?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Aggressive (trong LFZ)</div>
                        <div class="quiz-option" data-index="1">B. Standard (break LFZ)</div>
                        <div class="quiz-option" data-index="2">C. Conservative (retest)</div>
                        <div class="quiz-option" data-index="3">D. Tất cả đều như nhau</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 2: Stop Loss nên đặt ở đâu trong DPU trade?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Trên đỉnh LFZ</div>
                        <div class="quiz-option" data-index="1">B. Giữa LFZ</div>
                        <div class="quiz-option" data-index="2">C. Dưới đáy LFZ (với buffer)</div>
                        <div class="quiz-option" data-index="3">D. Không cần SL</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 3: Khi nào nên move SL lên breakeven?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Sau khi profit 1R</div>
                        <div class="quiz-option" data-index="1">B. Ngay sau khi entry</div>
                        <div class="quiz-option" data-index="2">C. Khi đạt TP cuối</div>
                        <div class="quiz-option" data-index="3">D. Không bao giờ move</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🏆 Hoàn Thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <button class="retake-btn" onclick="retakeQuiz()">Làm Lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>🎉 Hoàn thành <span class="highlight">Bài 5.4</span></p>
            <p>Tiếp theo: <strong>Bài 5.5 - DPU Checklist 8 Điểm</strong></p>
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

        function retakeQuiz() {
            answeredCount = 0;
            correctCount = 0;
            document.querySelectorAll(''.quiz-question'').forEach(q => {
                q.classList.remove(''answered'');
                q.querySelectorAll(''.quiz-option'').forEach(o => o.classList.remove(''correct'', ''incorrect''));
                q.querySelector(''.quiz-result'').className = ''quiz-result'';
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

-- Lesson 5.5: DPU Checklist 8 Điểm - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch5-l5',
  'module-tier-1-ch5',
  'course-tier1-trading-foundation',
  'Bài 5.5: DPU Checklist 8 Điểm - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 5.5: DPU Checklist 8 Điểm - GEM Trading Academy</title>
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --bg-card: #1a1a25;
            --bg-card-hover: #22222f;
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
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .section-content { padding: 0 16px 16px 16px; }
        }

        .section-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-gold);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .section-title {
                font-size: 1.15rem;
                padding: 16px;
                padding-bottom: 12px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .section-title::before { display: none; }
        }

        .section-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-gold);
            border-radius: 2px;
        }

        .section p, .section li { color: var(--text-secondary); margin-bottom: 0.8rem; }

        .image-placeholder {
            width: 100%;
            border-radius: 12px;
            margin: 1rem 0;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .image-placeholder { border-radius: 8px; }
        }

        .checklist-item {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-green);
            display: flex;
            gap: 1rem;
            align-items: flex-start;
        }

        @media (max-width: 600px) {
            .checklist-item { border-radius: 8px; }
        }

        .checklist-number {
            background: var(--accent-green);
            color: var(--bg-primary);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            flex-shrink: 0;
        }

        .checklist-content h4 {
            color: var(--accent-green);
            margin-bottom: 0.5rem;
            font-size: 1.05rem;
        }

        .checklist-content p {
            color: var(--text-secondary);
            margin: 0;
            font-size: 0.95rem;
        }

        .score-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }

        .score-table th, .score-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }

        .score-table th {
            background: var(--bg-secondary);
            color: var(--accent-gold);
            font-weight: 600;
        }

        .score-table td { color: var(--text-secondary); }

        .score-table .score {
            text-align: center;
            font-weight: 600;
            color: var(--accent-green);
        }

        .highlight-box {
            background: var(--accent-gold-dim);
            border: 1px solid var(--accent-gold);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .highlight-box { border-radius: 8px; border-left: 4px solid var(--accent-gold); }
        }

        .highlight-box h4 { color: var(--accent-gold); margin-bottom: 0.5rem; }
        .highlight-box p { color: var(--text-secondary); margin: 0; }

        .grading-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 0.75rem 0;
            border: 1px solid var(--border-color);
        }

        .grading-card.excellent { border-left: 4px solid var(--accent-green); }
        .grading-card.good { border-left: 4px solid var(--accent-cyan); }
        .grading-card.fair { border-left: 4px solid var(--accent-gold); }
        .grading-card.poor { border-left: 4px solid var(--accent-red); }

        .grading-card h4 { margin-bottom: 0.5rem; font-size: 1.05rem; }
        .grading-card.excellent h4 { color: var(--accent-green); }
        .grading-card.good h4 { color: var(--accent-cyan); }
        .grading-card.fair h4 { color: var(--accent-gold); }
        .grading-card.poor h4 { color: var(--accent-red); }

        .grading-card p { color: var(--text-secondary); margin: 0; font-size: 0.95rem; }

        .summary-box {
            background: linear-gradient(135deg, var(--accent-gold-dim), transparent);
            border: 1px solid var(--accent-gold);
            border-radius: 16px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                padding: 1.25rem 16px;
                margin: 0;
                border-left: 4px solid var(--accent-gold);
                border-right: none;
                border-top: none;
            }
        }

        .summary-box h3 { color: var(--accent-gold); margin-bottom: 1rem; }
        .summary-box ul { list-style: none; padding: 0; }

        .summary-box li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-box li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--accent-gold);
        }

        .quiz-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .quiz-content { padding: 0 16px 16px 16px; }
        }

        .quiz-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-purple);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .quiz-title {
                font-size: 1.15rem;
                padding: 16px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .quiz-title::before { display: none; }
        }

        .quiz-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-purple);
            border-radius: 2px;
        }

        .quiz-question {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-question { border-radius: 8px; border-left: 4px solid var(--accent-purple); }
        }

        .quiz-question h4 { color: var(--text-primary); margin-bottom: 1rem; }
        .quiz-options { display: flex; flex-direction: column; gap: 0.5rem; }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            color: var(--text-secondary);
        }

        .quiz-option:hover { border-color: var(--accent-purple); }
        .quiz-option.correct { border-color: var(--accent-green); background: var(--accent-green-dim); color: var(--accent-green); }
        .quiz-option.incorrect { border-color: var(--accent-red); background: var(--accent-red-dim); color: var(--accent-red); }

        .quiz-result { padding: 1rem; border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: var(--accent-green-dim); border: 1px solid var(--accent-green); color: var(--accent-green); }
        .quiz-result.incorrect { background: var(--accent-red-dim); border: 1px solid var(--accent-red); color: var(--accent-red); }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border: 1px solid var(--accent-purple);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show { display: block; }
        .quiz-score h3 { color: var(--accent-purple); margin-bottom: 0.5rem; }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--accent-purple);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            background: var(--bg-secondary);
            border-radius: 16px;
            border: 1px solid var(--border-color);
            margin-top: 1.5rem;
        }

        @media (max-width: 600px) {
            .lesson-footer { border-radius: 0; border: none; margin-top: 0; }
        }

        .lesson-footer p { color: var(--text-secondary); margin-bottom: 1rem; }
        .lesson-footer .highlight { color: var(--accent-gold); font-weight: 600; }
        strong { color: var(--accent-gold); }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">📚 Tier 1 - Bài 5.5</span>
            <h1>DPU Checklist 8 Điểm</h1>
            <p>Hệ thống đánh giá chất lượng setup DPU trước khi entry</p>
        </header>

        <section class="section">
            <h2 class="section-title">Tại Sao Cần Checklist?</h2>
            <div class="section-content">
                <p>Checklist giúp bạn đánh giá khách quan chất lượng setup, tránh FOMO và entry vào những setup kém chất lượng.</p>

                <img src="https://placehold.co/800x350/112250/10B981?text=DPU+8+Point+Checklist" alt="DPU 8 Point Checklist" class="image-placeholder">

                <div class="highlight-box">
                    <h4>🎯 Quy Tắc Vàng</h4>
                    <p>Chỉ trade khi đạt tối thiểu <strong>6/8 điểm</strong> (75%). Setup dưới 6 điểm có win rate thấp và không đáng risk.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">8 Điểm Checklist Chi Tiết</h2>
            <div class="section-content">
                <div class="checklist-item">
                    <div class="checklist-number">1</div>
                    <div class="checklist-content">
                        <h4>Phase DOWN Rõ Ràng</h4>
                        <p>Giá đã giảm đáng kể (≥10%) với downtrend rõ ràng. Có ít nhất 3-5 nến giảm liên tiếp tạo lower lows.</p>
                    </div>
                </div>

                <div class="checklist-item">
                    <div class="checklist-number">2</div>
                    <div class="checklist-content">
                        <h4>Chạm Vùng Support Quan Trọng</h4>
                        <p>Đáy của Phase DOWN chạm support mạnh: đáy cũ, Fib 0.618-0.786, trendline, hoặc psychological level.</p>
                    </div>
                </div>

                <div class="checklist-item">
                    <div class="checklist-number">3</div>
                    <div class="checklist-content">
                        <h4>Volume Cạn Trong Phase PAUSE</h4>
                        <p>Volume giảm ≥50% so với phase DOWN. Đây là dấu hiệu phe bán đã kiệt sức, không còn áp lực bán.</p>
                    </div>
                </div>

                <div class="checklist-item">
                    <div class="checklist-number">4</div>
                    <div class="checklist-content">
                        <h4>LFZ Hình Thành Đủ Thời Gian</h4>
                        <p>Phase PAUSE kéo dài ít nhất 3-5 nến với range sideway rõ ràng. LFZ có thể vẽ chính xác.</p>
                    </div>
                </div>

                <img src="https://placehold.co/800x350/112250/FFBD59?text=Checklist+Items+5-8" alt="Checklist Items 5-8" class="image-placeholder">

                <div class="checklist-item">
                    <div class="checklist-number">5</div>
                    <div class="checklist-content">
                        <h4>Nến Break LFZ Với Volume</h4>
                        <p>Nến đóng cửa trên LFZ với volume tăng ≥1.5x so với trung bình. Không có false break.</p>
                    </div>
                </div>

                <div class="checklist-item">
                    <div class="checklist-number">6</div>
                    <div class="checklist-content">
                        <h4>RSI/MACD Confirmation</h4>
                        <p>RSI không overbought, MACD có bullish crossover hoặc bullish divergence. Indicator hỗ trợ hướng LONG.</p>
                    </div>
                </div>

                <div class="checklist-item">
                    <div class="checklist-number">7</div>
                    <div class="checklist-content">
                        <h4>Higher TF Không Bearish Mạnh</h4>
                        <p>TF cao hơn (D1 nếu trade H4) không trong downtrend mạnh. Tốt nhất là neutral hoặc bullish.</p>
                    </div>
                </div>

                <div class="checklist-item">
                    <div class="checklist-number">8</div>
                    <div class="checklist-content">
                        <h4>R:R Ratio ≥ 2.5:1</h4>
                        <p>Target (resistance tiếp theo) cho R:R ít nhất 2.5:1. Nếu R:R thấp hơn, không đáng trade.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Bảng Tính Điểm</h2>
            <div class="section-content">
                <p>Mỗi điểm checklist có giá trị 1 điểm. Tổng điểm quyết định chất lượng setup:</p>

                <table class="score-table">
                    <thead>
                        <tr>
                            <th>Tiêu Chí</th>
                            <th class="score">Điểm</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>1. Phase DOWN rõ ràng</td><td class="score">1</td></tr>
                        <tr><td>2. Chạm support quan trọng</td><td class="score">1</td></tr>
                        <tr><td>3. Volume cạn trong PAUSE</td><td class="score">1</td></tr>
                        <tr><td>4. LFZ hình thành đủ</td><td class="score">1</td></tr>
                        <tr><td>5. Break LFZ với volume</td><td class="score">1</td></tr>
                        <tr><td>6. RSI/MACD confirmation</td><td class="score">1</td></tr>
                        <tr><td>7. Higher TF không bearish</td><td class="score">1</td></tr>
                        <tr><td>8. R:R ≥ 2.5:1</td><td class="score">1</td></tr>
                        <tr><td><strong>TỔNG</strong></td><td class="score"><strong>/8</strong></td></tr>
                    </tbody>
                </table>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Đánh Giá Chất Lượng Setup</h2>
            <div class="section-content">
                <img src="https://placehold.co/800x300/112250/6A5BFF?text=Setup+Quality+Grades" alt="Setup Quality Grades" class="image-placeholder">

                <div class="grading-card excellent">
                    <h4>⭐ A Grade: 8/8 Điểm</h4>
                    <p>Setup hoàn hảo. Full size position. Win rate ước tính: 70-75%</p>
                </div>

                <div class="grading-card good">
                    <h4>✅ B Grade: 7/8 Điểm</h4>
                    <p>Setup tốt. Full size position. Win rate ước tính: 65-70%</p>
                </div>

                <div class="grading-card fair">
                    <h4>⚠️ C Grade: 6/8 Điểm</h4>
                    <p>Setup chấp nhận được. 50-75% size position. Win rate ước tính: 55-60%</p>
                </div>

                <div class="grading-card poor">
                    <h4>❌ D Grade: ≤5/8 Điểm</h4>
                    <p>KHÔNG TRADE. Setup kém chất lượng, win rate không đáng risk.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Ví Dụ Thực Tế Chấm Điểm</h2>
            <div class="section-content">
                <p>Áp dụng checklist vào một setup DPU thực tế:</p>

                <img src="https://placehold.co/800x350/112250/00F0FF?text=Scoring+Example+ETH" alt="Scoring Example ETH" class="image-placeholder">

                <table class="score-table">
                    <thead>
                        <tr>
                            <th>Tiêu Chí</th>
                            <th>Đánh Giá</th>
                            <th class="score">Điểm</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>1. Phase DOWN</td><td>ETH giảm 18% trong 1 tuần ✓</td><td class="score">1</td></tr>
                        <tr><td>2. Support</td><td>Chạm Fib 0.618 + đáy cũ ✓</td><td class="score">1</td></tr>
                        <tr><td>3. Volume PAUSE</td><td>Giảm 55% so với DOWN ✓</td><td class="score">1</td></tr>
                        <tr><td>4. LFZ</td><td>5 nến sideway, range rõ ✓</td><td class="score">1</td></tr>
                        <tr><td>5. Break volume</td><td>Volume spike 2x ✓</td><td class="score">1</td></tr>
                        <tr><td>6. RSI/MACD</td><td>Bullish divergence RSI ✓</td><td class="score">1</td></tr>
                        <tr><td>7. Higher TF</td><td>D1 neutral (không bearish) ✓</td><td class="score">1</td></tr>
                        <tr><td>8. R:R</td><td>3.2:1 ✓</td><td class="score">1</td></tr>
                        <tr><td><strong>TỔNG</strong></td><td><strong>Grade A - Perfect Setup</strong></td><td class="score"><strong>8/8</strong></td></tr>
                    </tbody>
                </table>

                <div class="highlight-box">
                    <h4>✅ Kết Luận</h4>
                    <p>Setup này đạt 8/8 điểm = Grade A. Entry với full size position, confidence cao.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>8 điểm checklist đánh giá toàn diện chất lượng DPU setup</li>
                <li>Tối thiểu 6/8 điểm (Grade C) mới nên trade</li>
                <li>7-8 điểm (Grade A-B): Full size position</li>
                <li>6 điểm (Grade C): 50-75% size position</li>
                <li>≤5 điểm: KHÔNG TRADE, đợi setup tốt hơn</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="2">
                    <h4>Câu 1: Tối thiểu cần bao nhiêu điểm để trade DPU?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. 4/8 điểm</div>
                        <div class="quiz-option" data-index="1">B. 5/8 điểm</div>
                        <div class="quiz-option" data-index="2">C. 6/8 điểm</div>
                        <div class="quiz-option" data-index="3">D. 8/8 điểm</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="1">
                    <h4>Câu 2: Setup 7/8 điểm được xếp hạng gì?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Grade A</div>
                        <div class="quiz-option" data-index="1">B. Grade B</div>
                        <div class="quiz-option" data-index="2">C. Grade C</div>
                        <div class="quiz-option" data-index="3">D. Grade D</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 3: Điểm số nào cho thấy volume đúng trong checklist?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Volume PAUSE giảm ≥50% và break volume tăng ≥1.5x</div>
                        <div class="quiz-option" data-index="1">B. Volume tăng liên tục</div>
                        <div class="quiz-option" data-index="2">C. Volume không thay đổi</div>
                        <div class="quiz-option" data-index="3">D. Volume không quan trọng</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🏆 Hoàn Thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <button class="retake-btn" onclick="retakeQuiz()">Làm Lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>🎉 Hoàn thành <span class="highlight">Bài 5.5</span></p>
            <p>Tiếp theo: <strong>Bài 5.6 - Ví Dụ Thực Tế DPU</strong></p>
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

        function retakeQuiz() {
            answeredCount = 0;
            correctCount = 0;
            document.querySelectorAll(''.quiz-question'').forEach(q => {
                q.classList.remove(''answered'');
                q.querySelectorAll(''.quiz-option'').forEach(o => o.classList.remove(''correct'', ''incorrect''));
                q.querySelector(''.quiz-result'').className = ''quiz-result'';
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
    <title>Bài 5.5: DPU Checklist 8 Điểm - GEM Trading Academy</title>
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --bg-card: #1a1a25;
            --bg-card-hover: #22222f;
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
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .section-content { padding: 0 16px 16px 16px; }
        }

        .section-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-gold);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .section-title {
                font-size: 1.15rem;
                padding: 16px;
                padding-bottom: 12px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .section-title::before { display: none; }
        }

        .section-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-gold);
            border-radius: 2px;
        }

        .section p, .section li { color: var(--text-secondary); margin-bottom: 0.8rem; }

        .image-placeholder {
            width: 100%;
            border-radius: 12px;
            margin: 1rem 0;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .image-placeholder { border-radius: 8px; }
        }

        .checklist-item {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-green);
            display: flex;
            gap: 1rem;
            align-items: flex-start;
        }

        @media (max-width: 600px) {
            .checklist-item { border-radius: 8px; }
        }

        .checklist-number {
            background: var(--accent-green);
            color: var(--bg-primary);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            flex-shrink: 0;
        }

        .checklist-content h4 {
            color: var(--accent-green);
            margin-bottom: 0.5rem;
            font-size: 1.05rem;
        }

        .checklist-content p {
            color: var(--text-secondary);
            margin: 0;
            font-size: 0.95rem;
        }

        .score-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }

        .score-table th, .score-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }

        .score-table th {
            background: var(--bg-secondary);
            color: var(--accent-gold);
            font-weight: 600;
        }

        .score-table td { color: var(--text-secondary); }

        .score-table .score {
            text-align: center;
            font-weight: 600;
            color: var(--accent-green);
        }

        .highlight-box {
            background: var(--accent-gold-dim);
            border: 1px solid var(--accent-gold);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .highlight-box { border-radius: 8px; border-left: 4px solid var(--accent-gold); }
        }

        .highlight-box h4 { color: var(--accent-gold); margin-bottom: 0.5rem; }
        .highlight-box p { color: var(--text-secondary); margin: 0; }

        .grading-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 0.75rem 0;
            border: 1px solid var(--border-color);
        }

        .grading-card.excellent { border-left: 4px solid var(--accent-green); }
        .grading-card.good { border-left: 4px solid var(--accent-cyan); }
        .grading-card.fair { border-left: 4px solid var(--accent-gold); }
        .grading-card.poor { border-left: 4px solid var(--accent-red); }

        .grading-card h4 { margin-bottom: 0.5rem; font-size: 1.05rem; }
        .grading-card.excellent h4 { color: var(--accent-green); }
        .grading-card.good h4 { color: var(--accent-cyan); }
        .grading-card.fair h4 { color: var(--accent-gold); }
        .grading-card.poor h4 { color: var(--accent-red); }

        .grading-card p { color: var(--text-secondary); margin: 0; font-size: 0.95rem; }

        .summary-box {
            background: linear-gradient(135deg, var(--accent-gold-dim), transparent);
            border: 1px solid var(--accent-gold);
            border-radius: 16px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                padding: 1.25rem 16px;
                margin: 0;
                border-left: 4px solid var(--accent-gold);
                border-right: none;
                border-top: none;
            }
        }

        .summary-box h3 { color: var(--accent-gold); margin-bottom: 1rem; }
        .summary-box ul { list-style: none; padding: 0; }

        .summary-box li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-box li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--accent-gold);
        }

        .quiz-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .quiz-content { padding: 0 16px 16px 16px; }
        }

        .quiz-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-purple);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .quiz-title {
                font-size: 1.15rem;
                padding: 16px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .quiz-title::before { display: none; }
        }

        .quiz-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-purple);
            border-radius: 2px;
        }

        .quiz-question {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-question { border-radius: 8px; border-left: 4px solid var(--accent-purple); }
        }

        .quiz-question h4 { color: var(--text-primary); margin-bottom: 1rem; }
        .quiz-options { display: flex; flex-direction: column; gap: 0.5rem; }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            color: var(--text-secondary);
        }

        .quiz-option:hover { border-color: var(--accent-purple); }
        .quiz-option.correct { border-color: var(--accent-green); background: var(--accent-green-dim); color: var(--accent-green); }
        .quiz-option.incorrect { border-color: var(--accent-red); background: var(--accent-red-dim); color: var(--accent-red); }

        .quiz-result { padding: 1rem; border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: var(--accent-green-dim); border: 1px solid var(--accent-green); color: var(--accent-green); }
        .quiz-result.incorrect { background: var(--accent-red-dim); border: 1px solid var(--accent-red); color: var(--accent-red); }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border: 1px solid var(--accent-purple);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show { display: block; }
        .quiz-score h3 { color: var(--accent-purple); margin-bottom: 0.5rem; }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--accent-purple);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            background: var(--bg-secondary);
            border-radius: 16px;
            border: 1px solid var(--border-color);
            margin-top: 1.5rem;
        }

        @media (max-width: 600px) {
            .lesson-footer { border-radius: 0; border: none; margin-top: 0; }
        }

        .lesson-footer p { color: var(--text-secondary); margin-bottom: 1rem; }
        .lesson-footer .highlight { color: var(--accent-gold); font-weight: 600; }
        strong { color: var(--accent-gold); }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">📚 Tier 1 - Bài 5.5</span>
            <h1>DPU Checklist 8 Điểm</h1>
            <p>Hệ thống đánh giá chất lượng setup DPU trước khi entry</p>
        </header>

        <section class="section">
            <h2 class="section-title">Tại Sao Cần Checklist?</h2>
            <div class="section-content">
                <p>Checklist giúp bạn đánh giá khách quan chất lượng setup, tránh FOMO và entry vào những setup kém chất lượng.</p>

                <img src="https://placehold.co/800x350/112250/10B981?text=DPU+8+Point+Checklist" alt="DPU 8 Point Checklist" class="image-placeholder">

                <div class="highlight-box">
                    <h4>🎯 Quy Tắc Vàng</h4>
                    <p>Chỉ trade khi đạt tối thiểu <strong>6/8 điểm</strong> (75%). Setup dưới 6 điểm có win rate thấp và không đáng risk.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">8 Điểm Checklist Chi Tiết</h2>
            <div class="section-content">
                <div class="checklist-item">
                    <div class="checklist-number">1</div>
                    <div class="checklist-content">
                        <h4>Phase DOWN Rõ Ràng</h4>
                        <p>Giá đã giảm đáng kể (≥10%) với downtrend rõ ràng. Có ít nhất 3-5 nến giảm liên tiếp tạo lower lows.</p>
                    </div>
                </div>

                <div class="checklist-item">
                    <div class="checklist-number">2</div>
                    <div class="checklist-content">
                        <h4>Chạm Vùng Support Quan Trọng</h4>
                        <p>Đáy của Phase DOWN chạm support mạnh: đáy cũ, Fib 0.618-0.786, trendline, hoặc psychological level.</p>
                    </div>
                </div>

                <div class="checklist-item">
                    <div class="checklist-number">3</div>
                    <div class="checklist-content">
                        <h4>Volume Cạn Trong Phase PAUSE</h4>
                        <p>Volume giảm ≥50% so với phase DOWN. Đây là dấu hiệu phe bán đã kiệt sức, không còn áp lực bán.</p>
                    </div>
                </div>

                <div class="checklist-item">
                    <div class="checklist-number">4</div>
                    <div class="checklist-content">
                        <h4>LFZ Hình Thành Đủ Thời Gian</h4>
                        <p>Phase PAUSE kéo dài ít nhất 3-5 nến với range sideway rõ ràng. LFZ có thể vẽ chính xác.</p>
                    </div>
                </div>

                <img src="https://placehold.co/800x350/112250/FFBD59?text=Checklist+Items+5-8" alt="Checklist Items 5-8" class="image-placeholder">

                <div class="checklist-item">
                    <div class="checklist-number">5</div>
                    <div class="checklist-content">
                        <h4>Nến Break LFZ Với Volume</h4>
                        <p>Nến đóng cửa trên LFZ với volume tăng ≥1.5x so với trung bình. Không có false break.</p>
                    </div>
                </div>

                <div class="checklist-item">
                    <div class="checklist-number">6</div>
                    <div class="checklist-content">
                        <h4>RSI/MACD Confirmation</h4>
                        <p>RSI không overbought, MACD có bullish crossover hoặc bullish divergence. Indicator hỗ trợ hướng LONG.</p>
                    </div>
                </div>

                <div class="checklist-item">
                    <div class="checklist-number">7</div>
                    <div class="checklist-content">
                        <h4>Higher TF Không Bearish Mạnh</h4>
                        <p>TF cao hơn (D1 nếu trade H4) không trong downtrend mạnh. Tốt nhất là neutral hoặc bullish.</p>
                    </div>
                </div>

                <div class="checklist-item">
                    <div class="checklist-number">8</div>
                    <div class="checklist-content">
                        <h4>R:R Ratio ≥ 2.5:1</h4>
                        <p>Target (resistance tiếp theo) cho R:R ít nhất 2.5:1. Nếu R:R thấp hơn, không đáng trade.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Bảng Tính Điểm</h2>
            <div class="section-content">
                <p>Mỗi điểm checklist có giá trị 1 điểm. Tổng điểm quyết định chất lượng setup:</p>

                <table class="score-table">
                    <thead>
                        <tr>
                            <th>Tiêu Chí</th>
                            <th class="score">Điểm</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>1. Phase DOWN rõ ràng</td><td class="score">1</td></tr>
                        <tr><td>2. Chạm support quan trọng</td><td class="score">1</td></tr>
                        <tr><td>3. Volume cạn trong PAUSE</td><td class="score">1</td></tr>
                        <tr><td>4. LFZ hình thành đủ</td><td class="score">1</td></tr>
                        <tr><td>5. Break LFZ với volume</td><td class="score">1</td></tr>
                        <tr><td>6. RSI/MACD confirmation</td><td class="score">1</td></tr>
                        <tr><td>7. Higher TF không bearish</td><td class="score">1</td></tr>
                        <tr><td>8. R:R ≥ 2.5:1</td><td class="score">1</td></tr>
                        <tr><td><strong>TỔNG</strong></td><td class="score"><strong>/8</strong></td></tr>
                    </tbody>
                </table>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Đánh Giá Chất Lượng Setup</h2>
            <div class="section-content">
                <img src="https://placehold.co/800x300/112250/6A5BFF?text=Setup+Quality+Grades" alt="Setup Quality Grades" class="image-placeholder">

                <div class="grading-card excellent">
                    <h4>⭐ A Grade: 8/8 Điểm</h4>
                    <p>Setup hoàn hảo. Full size position. Win rate ước tính: 70-75%</p>
                </div>

                <div class="grading-card good">
                    <h4>✅ B Grade: 7/8 Điểm</h4>
                    <p>Setup tốt. Full size position. Win rate ước tính: 65-70%</p>
                </div>

                <div class="grading-card fair">
                    <h4>⚠️ C Grade: 6/8 Điểm</h4>
                    <p>Setup chấp nhận được. 50-75% size position. Win rate ước tính: 55-60%</p>
                </div>

                <div class="grading-card poor">
                    <h4>❌ D Grade: ≤5/8 Điểm</h4>
                    <p>KHÔNG TRADE. Setup kém chất lượng, win rate không đáng risk.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Ví Dụ Thực Tế Chấm Điểm</h2>
            <div class="section-content">
                <p>Áp dụng checklist vào một setup DPU thực tế:</p>

                <img src="https://placehold.co/800x350/112250/00F0FF?text=Scoring+Example+ETH" alt="Scoring Example ETH" class="image-placeholder">

                <table class="score-table">
                    <thead>
                        <tr>
                            <th>Tiêu Chí</th>
                            <th>Đánh Giá</th>
                            <th class="score">Điểm</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>1. Phase DOWN</td><td>ETH giảm 18% trong 1 tuần ✓</td><td class="score">1</td></tr>
                        <tr><td>2. Support</td><td>Chạm Fib 0.618 + đáy cũ ✓</td><td class="score">1</td></tr>
                        <tr><td>3. Volume PAUSE</td><td>Giảm 55% so với DOWN ✓</td><td class="score">1</td></tr>
                        <tr><td>4. LFZ</td><td>5 nến sideway, range rõ ✓</td><td class="score">1</td></tr>
                        <tr><td>5. Break volume</td><td>Volume spike 2x ✓</td><td class="score">1</td></tr>
                        <tr><td>6. RSI/MACD</td><td>Bullish divergence RSI ✓</td><td class="score">1</td></tr>
                        <tr><td>7. Higher TF</td><td>D1 neutral (không bearish) ✓</td><td class="score">1</td></tr>
                        <tr><td>8. R:R</td><td>3.2:1 ✓</td><td class="score">1</td></tr>
                        <tr><td><strong>TỔNG</strong></td><td><strong>Grade A - Perfect Setup</strong></td><td class="score"><strong>8/8</strong></td></tr>
                    </tbody>
                </table>

                <div class="highlight-box">
                    <h4>✅ Kết Luận</h4>
                    <p>Setup này đạt 8/8 điểm = Grade A. Entry với full size position, confidence cao.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>8 điểm checklist đánh giá toàn diện chất lượng DPU setup</li>
                <li>Tối thiểu 6/8 điểm (Grade C) mới nên trade</li>
                <li>7-8 điểm (Grade A-B): Full size position</li>
                <li>6 điểm (Grade C): 50-75% size position</li>
                <li>≤5 điểm: KHÔNG TRADE, đợi setup tốt hơn</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="2">
                    <h4>Câu 1: Tối thiểu cần bao nhiêu điểm để trade DPU?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. 4/8 điểm</div>
                        <div class="quiz-option" data-index="1">B. 5/8 điểm</div>
                        <div class="quiz-option" data-index="2">C. 6/8 điểm</div>
                        <div class="quiz-option" data-index="3">D. 8/8 điểm</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="1">
                    <h4>Câu 2: Setup 7/8 điểm được xếp hạng gì?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Grade A</div>
                        <div class="quiz-option" data-index="1">B. Grade B</div>
                        <div class="quiz-option" data-index="2">C. Grade C</div>
                        <div class="quiz-option" data-index="3">D. Grade D</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 3: Điểm số nào cho thấy volume đúng trong checklist?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Volume PAUSE giảm ≥50% và break volume tăng ≥1.5x</div>
                        <div class="quiz-option" data-index="1">B. Volume tăng liên tục</div>
                        <div class="quiz-option" data-index="2">C. Volume không thay đổi</div>
                        <div class="quiz-option" data-index="3">D. Volume không quan trọng</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🏆 Hoàn Thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <button class="retake-btn" onclick="retakeQuiz()">Làm Lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>🎉 Hoàn thành <span class="highlight">Bài 5.5</span></p>
            <p>Tiếp theo: <strong>Bài 5.6 - Ví Dụ Thực Tế DPU</strong></p>
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

        function retakeQuiz() {
            answeredCount = 0;
            correctCount = 0;
            document.querySelectorAll(''.quiz-question'').forEach(q => {
                q.classList.remove(''answered'');
                q.querySelectorAll(''.quiz-option'').forEach(o => o.classList.remove(''correct'', ''incorrect''));
                q.querySelector(''.quiz-result'').className = ''quiz-result'';
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

-- Lesson 5.6: Ví Dụ Thực Tế DPU - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch5-l6',
  'module-tier-1-ch5',
  'course-tier1-trading-foundation',
  'Bài 5.6: Ví Dụ Thực Tế DPU - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 5.6: Ví Dụ Thực Tế DPU - GEM Trading Academy</title>
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --bg-card: #1a1a25;
            --bg-card-hover: #22222f;
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
            background: var(--accent-green-dim);
            color: var(--accent-green);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
            border: 1px solid var(--accent-green);
        }

        .lesson-header h1 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--text-primary), var(--accent-green));
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
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .section-content { padding: 0 16px 16px 16px; }
        }

        .section-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-green);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .section-title {
                font-size: 1.15rem;
                padding: 16px;
                padding-bottom: 12px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .section-title::before { display: none; }
        }

        .section-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-green);
            border-radius: 2px;
        }

        .section p, .section li { color: var(--text-secondary); margin-bottom: 0.8rem; }
        .section ul { padding-left: 1.5rem; }

        .image-placeholder {
            width: 100%;
            border-radius: 12px;
            margin: 1rem 0;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .image-placeholder { border-radius: 8px; }
        }

        .case-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .case-card { border-radius: 8px; border-left: 4px solid var(--accent-green); }
        }

        .case-card h4 {
            color: var(--accent-green);
            margin-bottom: 0.75rem;
            font-size: 1.1rem;
        }

        .case-card ul { list-style: none; padding: 0; }

        .case-card li {
            padding: 0.4rem 0;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
        }

        .case-card li:last-child { border-bottom: none; }

        .data-label { color: var(--text-muted); }
        .data-value { color: var(--text-primary); font-weight: 500; }
        .data-value.green { color: var(--accent-green); }
        .data-value.red { color: var(--accent-red); }
        .data-value.gold { color: var(--accent-gold); }

        .timeline-box {
            position: relative;
            padding-left: 20px;
            border-left: 3px solid var(--accent-green);
            margin: 1rem 0;
        }

        .timeline-item {
            position: relative;
            padding-bottom: 1.5rem;
        }

        .timeline-item:last-child { padding-bottom: 0; }

        .timeline-item::before {
            content: '''';
            position: absolute;
            left: -26px;
            top: 6px;
            width: 12px;
            height: 12px;
            background: var(--accent-green);
            border-radius: 50%;
        }

        .timeline-item h5 {
            color: var(--accent-green);
            font-size: 1rem;
            margin-bottom: 0.25rem;
        }

        .timeline-item p { color: var(--text-secondary); font-size: 0.95rem; }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .stats-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: var(--border-color);
                border-radius: 8px;
                overflow: hidden;
            }
        }

        .stat-card {
            background: var(--bg-secondary);
            padding: 1rem;
            border-radius: 10px;
            text-align: center;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .stat-card { border-radius: 0; border: none; }
        }

        .stat-card .value {
            font-size: 1.3rem;
            font-weight: 700;
            display: block;
            color: var(--accent-green);
        }

        .stat-card .label { font-size: 0.85rem; color: var(--text-muted); }

        .highlight-box {
            background: var(--accent-gold-dim);
            border: 1px solid var(--accent-gold);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .highlight-box { border-radius: 8px; border-left: 4px solid var(--accent-gold); }
        }

        .highlight-box h4 { color: var(--accent-gold); margin-bottom: 0.5rem; }
        .highlight-box p { color: var(--text-secondary); margin: 0; }

        .success-box {
            background: var(--accent-green-dim);
            border: 1px solid var(--accent-green);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .success-box { border-radius: 8px; border-left: 4px solid var(--accent-green); }
        }

        .success-box h4 { color: var(--accent-green); margin-bottom: 0.5rem; }
        .success-box p { color: var(--text-secondary); margin: 0; }

        .trade-result {
            background: linear-gradient(135deg, var(--accent-green-dim), transparent);
            border: 2px solid var(--accent-green);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        .trade-result h4 {
            color: var(--accent-gold);
            margin-bottom: 1rem;
        }

        .trade-result ul { list-style: none; padding: 0; }

        .trade-result li {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
        }

        .trade-result li:last-child { border-bottom: none; }

        .summary-box {
            background: linear-gradient(135deg, var(--accent-gold-dim), transparent);
            border: 1px solid var(--accent-gold);
            border-radius: 16px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                padding: 1.25rem 16px;
                margin: 0;
                border-left: 4px solid var(--accent-gold);
                border-right: none;
                border-top: none;
            }
        }

        .summary-box h3 { color: var(--accent-gold); margin-bottom: 1rem; }
        .summary-box ul { list-style: none; padding: 0; }

        .summary-box li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-box li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--accent-gold);
        }

        .quiz-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .quiz-content { padding: 0 16px 16px 16px; }
        }

        .quiz-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-purple);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .quiz-title {
                font-size: 1.15rem;
                padding: 16px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .quiz-title::before { display: none; }
        }

        .quiz-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-purple);
            border-radius: 2px;
        }

        .quiz-question {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-question { border-radius: 8px; border-left: 4px solid var(--accent-purple); }
        }

        .quiz-question h4 { color: var(--text-primary); margin-bottom: 1rem; }
        .quiz-options { display: flex; flex-direction: column; gap: 0.5rem; }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            color: var(--text-secondary);
        }

        .quiz-option:hover { border-color: var(--accent-purple); }
        .quiz-option.correct { border-color: var(--accent-green); background: var(--accent-green-dim); color: var(--accent-green); }
        .quiz-option.incorrect { border-color: var(--accent-red); background: var(--accent-red-dim); color: var(--accent-red); }

        .quiz-result { padding: 1rem; border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: var(--accent-green-dim); border: 1px solid var(--accent-green); color: var(--accent-green); }
        .quiz-result.incorrect { background: var(--accent-red-dim); border: 1px solid var(--accent-red); color: var(--accent-red); }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border: 1px solid var(--accent-purple);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show { display: block; }
        .quiz-score h3 { color: var(--accent-purple); margin-bottom: 0.5rem; }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--accent-purple);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            background: var(--bg-secondary);
            border-radius: 16px;
            border: 1px solid var(--border-color);
            margin-top: 1.5rem;
        }

        @media (max-width: 600px) {
            .lesson-footer { border-radius: 0; border: none; margin-top: 0; }
        }

        .lesson-footer p { color: var(--text-secondary); margin-bottom: 1rem; }
        .lesson-footer .highlight { color: var(--accent-gold); font-weight: 600; }
        strong { color: var(--accent-gold); }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">📚 Tier 1 - Bài 5.6</span>
            <h1>Ví Dụ Thực Tế DPU Pattern</h1>
            <p>Case study chi tiết với SOL và AVAX - Từ nhận diện đến profit</p>
        </header>

        <section class="section">
            <h2 class="section-title">Case Study #1: SOL/USDT - DPU Hoàn Hảo</h2>
            <div class="section-content">
                <p>Phân tích chi tiết một giao dịch DPU thực tế trên SOL - một trong những setup đẹp nhất trong Q4 2024.</p>

                <img src="https://placehold.co/800x400/112250/10B981?text=SOL+DPU+Pattern+Overview" alt="SOL DPU Pattern Overview" class="image-placeholder">

                <div class="case-card">
                    <h4>📊 Thông Tin Giao Dịch</h4>
                    <ul>
                        <li><span class="data-label">Coin</span><span class="data-value">SOL/USDT</span></li>
                        <li><span class="data-label">Khung thời gian</span><span class="data-value">H4</span></li>
                        <li><span class="data-label">Xu hướng D1</span><span class="data-value gold">Neutral (sideway lớn)</span></li>
                        <li><span class="data-label">Checklist Score</span><span class="data-value green">8/8 - Grade A</span></li>
                    </ul>
                </div>

                <div class="timeline-box">
                    <div class="timeline-item">
                        <h5>Phase 1: DOWN - Sóng Giảm Mạnh</h5>
                        <p>SOL giảm từ $180 xuống $130 (-27.8%) trong 10 ngày. Volume cao, panic sell rõ ràng.</p>
                    </div>
                    <div class="timeline-item">
                        <h5>Phase 2: PAUSE - Tích Lũy Đáy</h5>
                        <p>Sideway tại vùng $125-$135 trong 6 ngày. Volume giảm 65%, hình thành LFZ rõ ràng.</p>
                    </div>
                    <div class="timeline-item">
                        <h5>Phase 3: UP - Break LFZ</h5>
                        <p>Nến H4 đóng cửa trên $135 với volume spike 2.3x → Entry LONG confirmed.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Chi Tiết Entry & Exit - SOL Trade</h2>
            <div class="section-content">
                <p>Áp dụng chiến lược Standard Entry cho giao dịch này:</p>

                <img src="https://placehold.co/800x400/112250/FFBD59?text=SOL+Entry+Exit+Points" alt="SOL Entry Exit Points" class="image-placeholder">

                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="value">$136</span>
                        <span class="label">Entry (trên LFZ)</span>
                    </div>
                    <div class="stat-card">
                        <span class="value">$123</span>
                        <span class="label">Stop Loss</span>
                    </div>
                    <div class="stat-card">
                        <span class="value">$175</span>
                        <span class="label">Take Profit</span>
                    </div>
                    <div class="stat-card">
                        <span class="value" style="color: var(--accent-gold);">3:1</span>
                        <span class="label">Risk/Reward</span>
                    </div>
                </div>

                <div class="highlight-box">
                    <h4>📐 Tính Toán Chi Tiết</h4>
                    <p><strong>Risk:</strong> $136 - $123 = $13 (9.6%)<br>
                    <strong>Reward:</strong> $175 - $136 = $39 (28.7%)<br>
                    <strong>R:R Ratio:</strong> 39 / 13 = 3:1 ✓</p>
                </div>

                <div class="trade-result">
                    <h4>📈 Kết Quả Giao Dịch</h4>
                    <ul>
                        <li><span class="data-label">Thời gian hold</span><span class="data-value">12 ngày</span></li>
                        <li><span class="data-label">Giá cao nhất đạt</span><span class="data-value green">$185</span></li>
                        <li><span class="data-label">TP1 ($160) đạt</span><span class="data-value green">+17.6%</span></li>
                        <li><span class="data-label">TP2 ($175) đạt</span><span class="data-value green">+28.7%</span></li>
                        <li><span class="data-label">Đánh giá</span><span class="data-value gold">Perfect DPU Setup</span></li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Case Study #2: AVAX/USDT - DPU Với Retest</h2>
            <div class="section-content">
                <p>Ví dụ về DPU với Conservative Entry (retest LFZ):</p>

                <img src="https://placehold.co/800x400/112250/00F0FF?text=AVAX+DPU+Retest+Setup" alt="AVAX DPU Retest Setup" class="image-placeholder">

                <div class="case-card">
                    <h4>📊 Thông Tin Giao Dịch</h4>
                    <ul>
                        <li><span class="data-label">Coin</span><span class="data-value">AVAX/USDT</span></li>
                        <li><span class="data-label">Khung thời gian</span><span class="data-value">D1</span></li>
                        <li><span class="data-label">Entry Style</span><span class="data-value">Conservative (Retest)</span></li>
                        <li><span class="data-label">Checklist Score</span><span class="data-value green">7/8 - Grade B</span></li>
                    </ul>
                </div>

                <p><strong>Diễn Biến Pattern:</strong></p>
                <ul>
                    <li><strong>Phase DOWN:</strong> AVAX giảm từ $42 → $28 (-33%) trong 2 tuần</li>
                    <li><strong>Phase PAUSE:</strong> Sideway $27-$30 trong 8 ngày, volume cạn</li>
                    <li><strong>Break:</strong> Nến D1 vượt $30, nhưng không entry ngay</li>
                    <li><strong>Retest:</strong> Giá pullback về $29.5 (LFZ top) và bounce</li>
                    <li><strong>Entry:</strong> $30.2 khi bounce từ retest confirmed</li>
                </ul>

                <div class="success-box">
                    <h4>✅ Lợi Thế Của Retest Entry</h4>
                    <p>• Entry giá tốt hơn: $30.2 thay vì $31.5 (break price)<br>
                    • SL chặt hơn: $27 thay vì $26<br>
                    • R:R cải thiện từ 2.8:1 lên 3.5:1<br>
                    • Confirmation mạnh hơn (retest = support mới)</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Kết Quả AVAX Trade</h2>
            <div class="section-content">
                <img src="https://placehold.co/800x350/112250/6A5BFF?text=AVAX+Trade+Result" alt="AVAX Trade Result" class="image-placeholder">

                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="value">$30.2</span>
                        <span class="label">Entry Price</span>
                    </div>
                    <div class="stat-card">
                        <span class="value">$27</span>
                        <span class="label">Stop Loss</span>
                    </div>
                    <div class="stat-card">
                        <span class="value">$41.5</span>
                        <span class="label">TP (Prev High)</span>
                    </div>
                    <div class="stat-card">
                        <span class="value" style="color: var(--accent-green);">3.5:1</span>
                        <span class="label">R:R Ratio</span>
                    </div>
                </div>

                <div class="trade-result">
                    <h4>📈 Kết Quả Thực Tế</h4>
                    <ul>
                        <li><span class="data-label">Kết quả</span><span class="data-value green">TP HIT</span></li>
                        <li><span class="data-label">Profit</span><span class="data-value green">+37.4%</span></li>
                        <li><span class="data-label">Thời gian hold</span><span class="data-value">18 ngày</span></li>
                        <li><span class="data-label">Giá cao nhất</span><span class="data-value">$44.2</span></li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Bài Học Từ 2 Case Study</h2>
            <div class="section-content">
                <p>Tổng kết những điểm quan trọng:</p>

                <img src="https://placehold.co/800x300/112250/FFBD59?text=Key+Lessons+DPU" alt="Key Lessons DPU" class="image-placeholder">

                <div class="case-card">
                    <h4>📌 5 Bài Học Quan Trọng</h4>
                    <p><strong>1. Patience trong Phase PAUSE:</strong> Cả 2 trade đều có phase PAUSE kéo dài (6-8 ngày). Kiên nhẫn chờ đợi là key.</p>
                    <p><strong>2. Volume tell the truth:</strong> Volume giảm 60%+ trong PAUSE, spike 2x+ khi break.</p>
                    <p><strong>3. Support confluence:</strong> SOL chạm $130 (đáy cũ), AVAX chạm $28 (Fib 0.618).</p>
                    <p><strong>4. Retest = Better Entry:</strong> AVAX retest cho R:R tốt hơn (3.5:1 vs 2.8:1).</p>
                    <p><strong>5. Higher TF context:</strong> Cả 2 đều neutral/bullish trên D1 → safe to go LONG.</p>
                </div>

                <div class="highlight-box">
                    <h4>💡 Pro Tip</h4>
                    <p>DPU hoạt động tốt nhất trong bull market correction hoặc khi tổng thể thị trường neutral. Tránh DPU trong bear market mạnh - pattern sẽ fail nhiều hơn.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>SOL DPU: Standard entry → +28.7% profit, 8/8 checklist score</li>
                <li>AVAX DPU: Conservative retest entry → +37.4% profit, 7/8 score</li>
                <li>Phase PAUSE kéo dài là bình thường - kiên nhẫn chờ break</li>
                <li>Volume confirmation là yếu tố then chốt cả 2 case</li>
                <li>Retest entry cho R:R tốt hơn nhưng không phải lúc nào cũng có</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="1">
                    <h4>Câu 1: Trong case SOL, volume trong Phase PAUSE giảm bao nhiêu %?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. 30%</div>
                        <div class="quiz-option" data-index="1">B. 65%</div>
                        <div class="quiz-option" data-index="2">C. 90%</div>
                        <div class="quiz-option" data-index="3">D. Không đổi</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 2: Lợi thế của Retest Entry trong case AVAX là gì?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Entry nhanh hơn</div>
                        <div class="quiz-option" data-index="1">B. Không cần SL</div>
                        <div class="quiz-option" data-index="2">C. Entry giá tốt hơn, R:R cao hơn</div>
                        <div class="quiz-option" data-index="3">D. Win rate 100%</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 3: DPU hoạt động tốt nhất trong điều kiện thị trường nào?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Bull market correction hoặc thị trường neutral</div>
                        <div class="quiz-option" data-index="1">B. Bear market mạnh</div>
                        <div class="quiz-option" data-index="2">C. All-time high</div>
                        <div class="quiz-option" data-index="3">D. Bất kỳ lúc nào</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🏆 Hoàn Thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <button class="retake-btn" onclick="retakeQuiz()">Làm Lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>🎉 Chúc mừng! Bạn đã hoàn thành <span class="highlight">Chương 5: DPU Pattern</span></p>
            <p>Tiếp theo: <strong>Chương 6 - Classic Patterns: Continuation & Reversal</strong></p>
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

        function retakeQuiz() {
            answeredCount = 0;
            correctCount = 0;
            document.querySelectorAll(''.quiz-question'').forEach(q => {
                q.classList.remove(''answered'');
                q.querySelectorAll(''.quiz-option'').forEach(o => o.classList.remove(''correct'', ''incorrect''));
                q.querySelector(''.quiz-result'').className = ''quiz-result'';
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
    <title>Bài 5.6: Ví Dụ Thực Tế DPU - GEM Trading Academy</title>
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --bg-card: #1a1a25;
            --bg-card-hover: #22222f;
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
            background: var(--accent-green-dim);
            color: var(--accent-green);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
            border: 1px solid var(--accent-green);
        }

        .lesson-header h1 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--text-primary), var(--accent-green));
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
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .section-content { padding: 0 16px 16px 16px; }
        }

        .section-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-green);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .section-title {
                font-size: 1.15rem;
                padding: 16px;
                padding-bottom: 12px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .section-title::before { display: none; }
        }

        .section-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-green);
            border-radius: 2px;
        }

        .section p, .section li { color: var(--text-secondary); margin-bottom: 0.8rem; }
        .section ul { padding-left: 1.5rem; }

        .image-placeholder {
            width: 100%;
            border-radius: 12px;
            margin: 1rem 0;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .image-placeholder { border-radius: 8px; }
        }

        .case-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .case-card { border-radius: 8px; border-left: 4px solid var(--accent-green); }
        }

        .case-card h4 {
            color: var(--accent-green);
            margin-bottom: 0.75rem;
            font-size: 1.1rem;
        }

        .case-card ul { list-style: none; padding: 0; }

        .case-card li {
            padding: 0.4rem 0;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
        }

        .case-card li:last-child { border-bottom: none; }

        .data-label { color: var(--text-muted); }
        .data-value { color: var(--text-primary); font-weight: 500; }
        .data-value.green { color: var(--accent-green); }
        .data-value.red { color: var(--accent-red); }
        .data-value.gold { color: var(--accent-gold); }

        .timeline-box {
            position: relative;
            padding-left: 20px;
            border-left: 3px solid var(--accent-green);
            margin: 1rem 0;
        }

        .timeline-item {
            position: relative;
            padding-bottom: 1.5rem;
        }

        .timeline-item:last-child { padding-bottom: 0; }

        .timeline-item::before {
            content: '''';
            position: absolute;
            left: -26px;
            top: 6px;
            width: 12px;
            height: 12px;
            background: var(--accent-green);
            border-radius: 50%;
        }

        .timeline-item h5 {
            color: var(--accent-green);
            font-size: 1rem;
            margin-bottom: 0.25rem;
        }

        .timeline-item p { color: var(--text-secondary); font-size: 0.95rem; }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .stats-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: var(--border-color);
                border-radius: 8px;
                overflow: hidden;
            }
        }

        .stat-card {
            background: var(--bg-secondary);
            padding: 1rem;
            border-radius: 10px;
            text-align: center;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .stat-card { border-radius: 0; border: none; }
        }

        .stat-card .value {
            font-size: 1.3rem;
            font-weight: 700;
            display: block;
            color: var(--accent-green);
        }

        .stat-card .label { font-size: 0.85rem; color: var(--text-muted); }

        .highlight-box {
            background: var(--accent-gold-dim);
            border: 1px solid var(--accent-gold);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .highlight-box { border-radius: 8px; border-left: 4px solid var(--accent-gold); }
        }

        .highlight-box h4 { color: var(--accent-gold); margin-bottom: 0.5rem; }
        .highlight-box p { color: var(--text-secondary); margin: 0; }

        .success-box {
            background: var(--accent-green-dim);
            border: 1px solid var(--accent-green);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .success-box { border-radius: 8px; border-left: 4px solid var(--accent-green); }
        }

        .success-box h4 { color: var(--accent-green); margin-bottom: 0.5rem; }
        .success-box p { color: var(--text-secondary); margin: 0; }

        .trade-result {
            background: linear-gradient(135deg, var(--accent-green-dim), transparent);
            border: 2px solid var(--accent-green);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        .trade-result h4 {
            color: var(--accent-gold);
            margin-bottom: 1rem;
        }

        .trade-result ul { list-style: none; padding: 0; }

        .trade-result li {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
        }

        .trade-result li:last-child { border-bottom: none; }

        .summary-box {
            background: linear-gradient(135deg, var(--accent-gold-dim), transparent);
            border: 1px solid var(--accent-gold);
            border-radius: 16px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        @media (max-width: 600px) {
            .summary-box {
                border-radius: 0;
                padding: 1.25rem 16px;
                margin: 0;
                border-left: 4px solid var(--accent-gold);
                border-right: none;
                border-top: none;
            }
        }

        .summary-box h3 { color: var(--accent-gold); margin-bottom: 1rem; }
        .summary-box ul { list-style: none; padding: 0; }

        .summary-box li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
        }

        .summary-box li::before {
            content: ''✓'';
            position: absolute;
            left: 0;
            color: var(--accent-gold);
        }

        .quiz-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-section {
                border-radius: 0;
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-bottom: 8px solid var(--bg-primary);
            }
            .quiz-content { padding: 0 16px 16px 16px; }
        }

        .quiz-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--accent-purple);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        @media (max-width: 600px) {
            .quiz-title {
                font-size: 1.15rem;
                padding: 16px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
            .quiz-title::before { display: none; }
        }

        .quiz-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-purple);
            border-radius: 2px;
        }

        .quiz-question {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .quiz-question { border-radius: 8px; border-left: 4px solid var(--accent-purple); }
        }

        .quiz-question h4 { color: var(--text-primary); margin-bottom: 1rem; }
        .quiz-options { display: flex; flex-direction: column; gap: 0.5rem; }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            color: var(--text-secondary);
        }

        .quiz-option:hover { border-color: var(--accent-purple); }
        .quiz-option.correct { border-color: var(--accent-green); background: var(--accent-green-dim); color: var(--accent-green); }
        .quiz-option.incorrect { border-color: var(--accent-red); background: var(--accent-red-dim); color: var(--accent-red); }

        .quiz-result { padding: 1rem; border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: var(--accent-green-dim); border: 1px solid var(--accent-green); color: var(--accent-green); }
        .quiz-result.incorrect { background: var(--accent-red-dim); border: 1px solid var(--accent-red); color: var(--accent-red); }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border: 1px solid var(--accent-purple);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show { display: block; }
        .quiz-score h3 { color: var(--accent-purple); margin-bottom: 0.5rem; }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--accent-purple);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }

        .lesson-footer {
            text-align: center;
            padding: 2rem 1rem;
            background: var(--bg-secondary);
            border-radius: 16px;
            border: 1px solid var(--border-color);
            margin-top: 1.5rem;
        }

        @media (max-width: 600px) {
            .lesson-footer { border-radius: 0; border: none; margin-top: 0; }
        }

        .lesson-footer p { color: var(--text-secondary); margin-bottom: 1rem; }
        .lesson-footer .highlight { color: var(--accent-gold); font-weight: 600; }
        strong { color: var(--accent-gold); }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">📚 Tier 1 - Bài 5.6</span>
            <h1>Ví Dụ Thực Tế DPU Pattern</h1>
            <p>Case study chi tiết với SOL và AVAX - Từ nhận diện đến profit</p>
        </header>

        <section class="section">
            <h2 class="section-title">Case Study #1: SOL/USDT - DPU Hoàn Hảo</h2>
            <div class="section-content">
                <p>Phân tích chi tiết một giao dịch DPU thực tế trên SOL - một trong những setup đẹp nhất trong Q4 2024.</p>

                <img src="https://placehold.co/800x400/112250/10B981?text=SOL+DPU+Pattern+Overview" alt="SOL DPU Pattern Overview" class="image-placeholder">

                <div class="case-card">
                    <h4>📊 Thông Tin Giao Dịch</h4>
                    <ul>
                        <li><span class="data-label">Coin</span><span class="data-value">SOL/USDT</span></li>
                        <li><span class="data-label">Khung thời gian</span><span class="data-value">H4</span></li>
                        <li><span class="data-label">Xu hướng D1</span><span class="data-value gold">Neutral (sideway lớn)</span></li>
                        <li><span class="data-label">Checklist Score</span><span class="data-value green">8/8 - Grade A</span></li>
                    </ul>
                </div>

                <div class="timeline-box">
                    <div class="timeline-item">
                        <h5>Phase 1: DOWN - Sóng Giảm Mạnh</h5>
                        <p>SOL giảm từ $180 xuống $130 (-27.8%) trong 10 ngày. Volume cao, panic sell rõ ràng.</p>
                    </div>
                    <div class="timeline-item">
                        <h5>Phase 2: PAUSE - Tích Lũy Đáy</h5>
                        <p>Sideway tại vùng $125-$135 trong 6 ngày. Volume giảm 65%, hình thành LFZ rõ ràng.</p>
                    </div>
                    <div class="timeline-item">
                        <h5>Phase 3: UP - Break LFZ</h5>
                        <p>Nến H4 đóng cửa trên $135 với volume spike 2.3x → Entry LONG confirmed.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Chi Tiết Entry & Exit - SOL Trade</h2>
            <div class="section-content">
                <p>Áp dụng chiến lược Standard Entry cho giao dịch này:</p>

                <img src="https://placehold.co/800x400/112250/FFBD59?text=SOL+Entry+Exit+Points" alt="SOL Entry Exit Points" class="image-placeholder">

                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="value">$136</span>
                        <span class="label">Entry (trên LFZ)</span>
                    </div>
                    <div class="stat-card">
                        <span class="value">$123</span>
                        <span class="label">Stop Loss</span>
                    </div>
                    <div class="stat-card">
                        <span class="value">$175</span>
                        <span class="label">Take Profit</span>
                    </div>
                    <div class="stat-card">
                        <span class="value" style="color: var(--accent-gold);">3:1</span>
                        <span class="label">Risk/Reward</span>
                    </div>
                </div>

                <div class="highlight-box">
                    <h4>📐 Tính Toán Chi Tiết</h4>
                    <p><strong>Risk:</strong> $136 - $123 = $13 (9.6%)<br>
                    <strong>Reward:</strong> $175 - $136 = $39 (28.7%)<br>
                    <strong>R:R Ratio:</strong> 39 / 13 = 3:1 ✓</p>
                </div>

                <div class="trade-result">
                    <h4>📈 Kết Quả Giao Dịch</h4>
                    <ul>
                        <li><span class="data-label">Thời gian hold</span><span class="data-value">12 ngày</span></li>
                        <li><span class="data-label">Giá cao nhất đạt</span><span class="data-value green">$185</span></li>
                        <li><span class="data-label">TP1 ($160) đạt</span><span class="data-value green">+17.6%</span></li>
                        <li><span class="data-label">TP2 ($175) đạt</span><span class="data-value green">+28.7%</span></li>
                        <li><span class="data-label">Đánh giá</span><span class="data-value gold">Perfect DPU Setup</span></li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Case Study #2: AVAX/USDT - DPU Với Retest</h2>
            <div class="section-content">
                <p>Ví dụ về DPU với Conservative Entry (retest LFZ):</p>

                <img src="https://placehold.co/800x400/112250/00F0FF?text=AVAX+DPU+Retest+Setup" alt="AVAX DPU Retest Setup" class="image-placeholder">

                <div class="case-card">
                    <h4>📊 Thông Tin Giao Dịch</h4>
                    <ul>
                        <li><span class="data-label">Coin</span><span class="data-value">AVAX/USDT</span></li>
                        <li><span class="data-label">Khung thời gian</span><span class="data-value">D1</span></li>
                        <li><span class="data-label">Entry Style</span><span class="data-value">Conservative (Retest)</span></li>
                        <li><span class="data-label">Checklist Score</span><span class="data-value green">7/8 - Grade B</span></li>
                    </ul>
                </div>

                <p><strong>Diễn Biến Pattern:</strong></p>
                <ul>
                    <li><strong>Phase DOWN:</strong> AVAX giảm từ $42 → $28 (-33%) trong 2 tuần</li>
                    <li><strong>Phase PAUSE:</strong> Sideway $27-$30 trong 8 ngày, volume cạn</li>
                    <li><strong>Break:</strong> Nến D1 vượt $30, nhưng không entry ngay</li>
                    <li><strong>Retest:</strong> Giá pullback về $29.5 (LFZ top) và bounce</li>
                    <li><strong>Entry:</strong> $30.2 khi bounce từ retest confirmed</li>
                </ul>

                <div class="success-box">
                    <h4>✅ Lợi Thế Của Retest Entry</h4>
                    <p>• Entry giá tốt hơn: $30.2 thay vì $31.5 (break price)<br>
                    • SL chặt hơn: $27 thay vì $26<br>
                    • R:R cải thiện từ 2.8:1 lên 3.5:1<br>
                    • Confirmation mạnh hơn (retest = support mới)</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Kết Quả AVAX Trade</h2>
            <div class="section-content">
                <img src="https://placehold.co/800x350/112250/6A5BFF?text=AVAX+Trade+Result" alt="AVAX Trade Result" class="image-placeholder">

                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="value">$30.2</span>
                        <span class="label">Entry Price</span>
                    </div>
                    <div class="stat-card">
                        <span class="value">$27</span>
                        <span class="label">Stop Loss</span>
                    </div>
                    <div class="stat-card">
                        <span class="value">$41.5</span>
                        <span class="label">TP (Prev High)</span>
                    </div>
                    <div class="stat-card">
                        <span class="value" style="color: var(--accent-green);">3.5:1</span>
                        <span class="label">R:R Ratio</span>
                    </div>
                </div>

                <div class="trade-result">
                    <h4>📈 Kết Quả Thực Tế</h4>
                    <ul>
                        <li><span class="data-label">Kết quả</span><span class="data-value green">TP HIT</span></li>
                        <li><span class="data-label">Profit</span><span class="data-value green">+37.4%</span></li>
                        <li><span class="data-label">Thời gian hold</span><span class="data-value">18 ngày</span></li>
                        <li><span class="data-label">Giá cao nhất</span><span class="data-value">$44.2</span></li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Bài Học Từ 2 Case Study</h2>
            <div class="section-content">
                <p>Tổng kết những điểm quan trọng:</p>

                <img src="https://placehold.co/800x300/112250/FFBD59?text=Key+Lessons+DPU" alt="Key Lessons DPU" class="image-placeholder">

                <div class="case-card">
                    <h4>📌 5 Bài Học Quan Trọng</h4>
                    <p><strong>1. Patience trong Phase PAUSE:</strong> Cả 2 trade đều có phase PAUSE kéo dài (6-8 ngày). Kiên nhẫn chờ đợi là key.</p>
                    <p><strong>2. Volume tell the truth:</strong> Volume giảm 60%+ trong PAUSE, spike 2x+ khi break.</p>
                    <p><strong>3. Support confluence:</strong> SOL chạm $130 (đáy cũ), AVAX chạm $28 (Fib 0.618).</p>
                    <p><strong>4. Retest = Better Entry:</strong> AVAX retest cho R:R tốt hơn (3.5:1 vs 2.8:1).</p>
                    <p><strong>5. Higher TF context:</strong> Cả 2 đều neutral/bullish trên D1 → safe to go LONG.</p>
                </div>

                <div class="highlight-box">
                    <h4>💡 Pro Tip</h4>
                    <p>DPU hoạt động tốt nhất trong bull market correction hoặc khi tổng thể thị trường neutral. Tránh DPU trong bear market mạnh - pattern sẽ fail nhiều hơn.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>SOL DPU: Standard entry → +28.7% profit, 8/8 checklist score</li>
                <li>AVAX DPU: Conservative retest entry → +37.4% profit, 7/8 score</li>
                <li>Phase PAUSE kéo dài là bình thường - kiên nhẫn chờ break</li>
                <li>Volume confirmation là yếu tố then chốt cả 2 case</li>
                <li>Retest entry cho R:R tốt hơn nhưng không phải lúc nào cũng có</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="1">
                    <h4>Câu 1: Trong case SOL, volume trong Phase PAUSE giảm bao nhiêu %?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. 30%</div>
                        <div class="quiz-option" data-index="1">B. 65%</div>
                        <div class="quiz-option" data-index="2">C. 90%</div>
                        <div class="quiz-option" data-index="3">D. Không đổi</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 2: Lợi thế của Retest Entry trong case AVAX là gì?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Entry nhanh hơn</div>
                        <div class="quiz-option" data-index="1">B. Không cần SL</div>
                        <div class="quiz-option" data-index="2">C. Entry giá tốt hơn, R:R cao hơn</div>
                        <div class="quiz-option" data-index="3">D. Win rate 100%</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 3: DPU hoạt động tốt nhất trong điều kiện thị trường nào?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Bull market correction hoặc thị trường neutral</div>
                        <div class="quiz-option" data-index="1">B. Bear market mạnh</div>
                        <div class="quiz-option" data-index="2">C. All-time high</div>
                        <div class="quiz-option" data-index="3">D. Bất kỳ lúc nào</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🏆 Hoàn Thành!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <button class="retake-btn" onclick="retakeQuiz()">Làm Lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>🎉 Chúc mừng! Bạn đã hoàn thành <span class="highlight">Chương 5: DPU Pattern</span></p>
            <p>Tiếp theo: <strong>Chương 6 - Classic Patterns: Continuation & Reversal</strong></p>
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

        function retakeQuiz() {
            answeredCount = 0;
            correctCount = 0;
            document.querySelectorAll(''.quiz-question'').forEach(q => {
                q.classList.remove(''answered'');
                q.querySelectorAll(''.quiz-option'').forEach(o => o.classList.remove(''correct'', ''incorrect''));
                q.querySelector(''.quiz-result'').className = ''quiz-result'';
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
