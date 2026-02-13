-- =====================================================
-- TIER-1 - Chương 7: Paper Trading
-- Course: course-tier1-trading-foundation
-- File 5/23
-- =====================================================

-- Create/Update Module
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  'module-tier-1-ch7',
  'course-tier1-trading-foundation',
  'Chương 7: Paper Trading',
  'Thực hành giao dịch giả lập',
  7,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Lesson 7.1: Paper Trading Là Gì? - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch7-l1',
  'module-tier-1-ch7',
  'course-tier1-trading-foundation',
  'Bài 7.1: Paper Trading Là Gì? - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 7.1: Paper Trading Là Gì? - GEM Trading Academy</title>
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

        .concept-box {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-green);
        }

        .concept-box h4 { color: var(--accent-green); margin-bottom: 0.75rem; }
        .concept-box p { color: var(--text-secondary); margin-bottom: 0.5rem; }

        .benefits-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .benefits-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: var(--border-color);
                border-radius: 8px;
                overflow: hidden;
            }
        }

        .benefit-card {
            background: var(--bg-secondary);
            padding: 1rem;
            border-radius: 10px;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .benefit-card { border-radius: 0; border: none; }
        }

        .benefit-card h4 { color: var(--accent-cyan); margin-bottom: 0.5rem; font-size: 1rem; }
        .benefit-card p { color: var(--text-secondary); font-size: 0.9rem; margin: 0; }

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
            <span class="lesson-badge">📚 Tier 1 - Bài 7.1</span>
            <h1>Paper Trading Là Gì?</h1>
            <p>Phương pháp thực hành trading không rủi ro cho người mới</p>
        </header>

        <section class="section">
            <h2 class="section-title">Định Nghĩa Paper Trading</h2>
            <div class="section-content">
                <p><strong>Paper Trading</strong> (hay Simulated Trading) là phương pháp thực hành trading với tiền ảo trên thị trường thực. Bạn đặt lệnh giả lập, theo dõi kết quả như thật, nhưng không mất tiền.</p>

                <img src="https://placehold.co/800x400/112250/10B981?text=Paper+Trading+Concept" alt="Paper Trading Concept" class="image-placeholder">

                <div class="concept-box">
                    <h4>📝 Paper Trading = Tập Lái Xe Giả Lập</h4>
                    <p>Giống như học lái xe trên mô phỏng trước khi ra đường thật, paper trading giúp bạn làm quen với trading mà không lo mất tiền.</p>
                    <p>Bạn sẽ học cách đặt lệnh, quản lý vị thế, và quan trọng nhất - kiểm soát tâm lý.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Lợi Ích Của Paper Trading</h2>
            <div class="section-content">
                <p>Tại sao mọi trader nên bắt đầu với paper trading:</p>

                <img src="https://placehold.co/800x350/112250/00F0FF?text=Paper+Trading+Benefits" alt="Paper Trading Benefits" class="image-placeholder">

                <div class="benefits-grid">
                    <div class="benefit-card">
                        <h4>🛡️ Zero Risk</h4>
                        <p>Không mất tiền thật, thoải mái thử nghiệm và mắc sai lầm</p>
                    </div>
                    <div class="benefit-card">
                        <h4>📊 Test Strategy</h4>
                        <p>Kiểm chứng patterns và chiến lược trước khi áp dụng thực tế</p>
                    </div>
                    <div class="benefit-card">
                        <h4>🧠 Build Confidence</h4>
                        <p>Xây dựng sự tự tin trước khi trade tiền thật</p>
                    </div>
                    <div class="benefit-card">
                        <h4>📈 Track Record</h4>
                        <p>Tạo lịch sử giao dịch để đánh giá khả năng</p>
                    </div>
                </div>

                <div class="highlight-box">
                    <h4>💡 Quy Tắc Vàng</h4>
                    <p>Paper trade ít nhất 50-100 trades trước khi chuyển sang tiền thật. Đạt win rate ổn định >55% và profit factor >1.5 trong 2-3 tháng liên tiếp.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Paper Trading Trong GEM App</h2>
            <div class="section-content">
                <p>GEM Mobile App có tính năng Paper Trading tích hợp sẵn:</p>

                <img src="https://placehold.co/800x400/112250/FFBD59?text=GEM+App+Paper+Trading" alt="GEM App Paper Trading" class="image-placeholder">

                <div class="concept-box">
                    <h4>📱 Tính Năng Paper Trading Trong GEM</h4>
                    <p><strong>1. Virtual Balance:</strong> $10,000 USD ảo để thực hành</p>
                    <p><strong>2. Real-Time Prices:</strong> Giá thực từ Binance</p>
                    <p><strong>3. Position Tracking:</strong> Theo dõi lệnh mở, P&L realtime</p>
                    <p><strong>4. Trade History:</strong> Lịch sử giao dịch đầy đủ</p>
                    <p><strong>5. Performance Stats:</strong> Win rate, profit factor, drawdown</p>
                </div>

                <div class="highlight-box">
                    <h4>🎯 Cách Sử Dụng</h4>
                    <p>Vào Scanner → Chọn coin → Nhấn "Paper Trade" → Nhập Entry, SL, TP → Xác nhận. App sẽ tự động track và thông báo khi hit SL/TP.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Paper vs Real Trading</h2>
            <div class="section-content">
                <p>Hiểu sự khác biệt để chuẩn bị tâm lý:</p>

                <img src="https://placehold.co/800x350/112250/6A5BFF?text=Paper+vs+Real+Trading" alt="Paper vs Real Trading" class="image-placeholder">

                <div class="benefits-grid">
                    <div class="benefit-card">
                        <h4>📝 Paper Trading</h4>
                        <p>• Không áp lực tâm lý</p>
                        <p>• Dễ tuân thủ kỷ luật</p>
                        <p>• Không có slippage</p>
                        <p>• Lệnh luôn được khớp</p>
                    </div>
                    <div class="benefit-card">
                        <h4>💰 Real Trading</h4>
                        <p>• Áp lực tâm lý cao</p>
                        <p>• Dễ bị FOMO, FUD</p>
                        <p>• Có slippage thực tế</p>
                        <p>• Liquidity ảnh hưởng</p>
                    </div>
                </div>

                <div class="warning-box">
                    <h4>⚠️ Điểm Khác Biệt Quan Trọng</h4>
                    <p>Tâm lý paper trading và real trading RẤT KHÁC. Nhiều trader paper trade rất giỏi nhưng real trade lại thua. Chuẩn bị tâm lý là step quan trọng nhất khi chuyển sang real.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Khi Nào Chuyển Sang Real?</h2>
            <div class="section-content">
                <p>Tiêu chí để biết bạn đã sẵn sàng:</p>

                <img src="https://placehold.co/800x300/112250/10B981?text=Ready+for+Real+Trading" alt="Ready for Real Trading" class="image-placeholder">

                <div class="concept-box">
                    <h4>✅ Checklist Sẵn Sàng</h4>
                    <p><strong>1. Số trades:</strong> Ít nhất 50-100 paper trades</p>
                    <p><strong>2. Win rate:</strong> Ổn định >55% trong 2+ tháng</p>
                    <p><strong>3. Profit factor:</strong> >1.5 (total profit / total loss)</p>
                    <p><strong>4. Drawdown:</strong> Không quá 20% tại bất kỳ thời điểm nào</p>
                    <p><strong>5. Kỷ luật:</strong> Tuân thủ 100% trading plan</p>
                </div>

                <div class="highlight-box">
                    <h4>💡 Lời Khuyên</h4>
                    <p>Khi bắt đầu real, hãy trade với số tiền NHỎ (1-5% portfolio mỗi trade). Coi 3 tháng đầu như "học phí" - mục tiêu là không mất quá 20% vốn.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Paper Trading = Thực hành với tiền ảo trên thị trường thực</li>
                <li>Lợi ích: Zero risk, test strategy, build confidence</li>
                <li>GEM App có tính năng Paper Trading tích hợp</li>
                <li>Paper trade 50-100 trades trước khi real</li>
                <li>Tiêu chí: Win rate >55%, Profit factor >1.5, Drawdown <20%</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="1">
                    <h4>Câu 1: Nên paper trade bao nhiêu trades trước khi real?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. 5-10 trades</div>
                        <div class="quiz-option" data-index="1">B. 50-100 trades</div>
                        <div class="quiz-option" data-index="2">C. 500+ trades</div>
                        <div class="quiz-option" data-index="3">D. Không cần paper trade</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 2: Win rate tối thiểu nên đạt trước khi real trade?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. 30%</div>
                        <div class="quiz-option" data-index="1">B. 45%</div>
                        <div class="quiz-option" data-index="2">C. 55%</div>
                        <div class="quiz-option" data-index="3">D. 80%</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 3: Điểm khác biệt lớn nhất giữa paper và real trading?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Tâm lý và áp lực</div>
                        <div class="quiz-option" data-index="1">B. Giá cả</div>
                        <div class="quiz-option" data-index="2">C. Timeframe</div>
                        <div class="quiz-option" data-index="3">D. Patterns</div>
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
            <p>🎉 Hoàn thành <span class="highlight">Bài 7.1</span></p>
            <p>Tiếp theo: <strong>Bài 7.2 - Cách Sử Dụng Paper Trade Trong GEM</strong></p>
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
    <title>Bài 7.1: Paper Trading Là Gì? - GEM Trading Academy</title>
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

        .concept-box {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-green);
        }

        .concept-box h4 { color: var(--accent-green); margin-bottom: 0.75rem; }
        .concept-box p { color: var(--text-secondary); margin-bottom: 0.5rem; }

        .benefits-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .benefits-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: var(--border-color);
                border-radius: 8px;
                overflow: hidden;
            }
        }

        .benefit-card {
            background: var(--bg-secondary);
            padding: 1rem;
            border-radius: 10px;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .benefit-card { border-radius: 0; border: none; }
        }

        .benefit-card h4 { color: var(--accent-cyan); margin-bottom: 0.5rem; font-size: 1rem; }
        .benefit-card p { color: var(--text-secondary); font-size: 0.9rem; margin: 0; }

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
            <span class="lesson-badge">📚 Tier 1 - Bài 7.1</span>
            <h1>Paper Trading Là Gì?</h1>
            <p>Phương pháp thực hành trading không rủi ro cho người mới</p>
        </header>

        <section class="section">
            <h2 class="section-title">Định Nghĩa Paper Trading</h2>
            <div class="section-content">
                <p><strong>Paper Trading</strong> (hay Simulated Trading) là phương pháp thực hành trading với tiền ảo trên thị trường thực. Bạn đặt lệnh giả lập, theo dõi kết quả như thật, nhưng không mất tiền.</p>

                <img src="https://placehold.co/800x400/112250/10B981?text=Paper+Trading+Concept" alt="Paper Trading Concept" class="image-placeholder">

                <div class="concept-box">
                    <h4>📝 Paper Trading = Tập Lái Xe Giả Lập</h4>
                    <p>Giống như học lái xe trên mô phỏng trước khi ra đường thật, paper trading giúp bạn làm quen với trading mà không lo mất tiền.</p>
                    <p>Bạn sẽ học cách đặt lệnh, quản lý vị thế, và quan trọng nhất - kiểm soát tâm lý.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Lợi Ích Của Paper Trading</h2>
            <div class="section-content">
                <p>Tại sao mọi trader nên bắt đầu với paper trading:</p>

                <img src="https://placehold.co/800x350/112250/00F0FF?text=Paper+Trading+Benefits" alt="Paper Trading Benefits" class="image-placeholder">

                <div class="benefits-grid">
                    <div class="benefit-card">
                        <h4>🛡️ Zero Risk</h4>
                        <p>Không mất tiền thật, thoải mái thử nghiệm và mắc sai lầm</p>
                    </div>
                    <div class="benefit-card">
                        <h4>📊 Test Strategy</h4>
                        <p>Kiểm chứng patterns và chiến lược trước khi áp dụng thực tế</p>
                    </div>
                    <div class="benefit-card">
                        <h4>🧠 Build Confidence</h4>
                        <p>Xây dựng sự tự tin trước khi trade tiền thật</p>
                    </div>
                    <div class="benefit-card">
                        <h4>📈 Track Record</h4>
                        <p>Tạo lịch sử giao dịch để đánh giá khả năng</p>
                    </div>
                </div>

                <div class="highlight-box">
                    <h4>💡 Quy Tắc Vàng</h4>
                    <p>Paper trade ít nhất 50-100 trades trước khi chuyển sang tiền thật. Đạt win rate ổn định >55% và profit factor >1.5 trong 2-3 tháng liên tiếp.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Paper Trading Trong GEM App</h2>
            <div class="section-content">
                <p>GEM Mobile App có tính năng Paper Trading tích hợp sẵn:</p>

                <img src="https://placehold.co/800x400/112250/FFBD59?text=GEM+App+Paper+Trading" alt="GEM App Paper Trading" class="image-placeholder">

                <div class="concept-box">
                    <h4>📱 Tính Năng Paper Trading Trong GEM</h4>
                    <p><strong>1. Virtual Balance:</strong> $10,000 USD ảo để thực hành</p>
                    <p><strong>2. Real-Time Prices:</strong> Giá thực từ Binance</p>
                    <p><strong>3. Position Tracking:</strong> Theo dõi lệnh mở, P&L realtime</p>
                    <p><strong>4. Trade History:</strong> Lịch sử giao dịch đầy đủ</p>
                    <p><strong>5. Performance Stats:</strong> Win rate, profit factor, drawdown</p>
                </div>

                <div class="highlight-box">
                    <h4>🎯 Cách Sử Dụng</h4>
                    <p>Vào Scanner → Chọn coin → Nhấn "Paper Trade" → Nhập Entry, SL, TP → Xác nhận. App sẽ tự động track và thông báo khi hit SL/TP.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Paper vs Real Trading</h2>
            <div class="section-content">
                <p>Hiểu sự khác biệt để chuẩn bị tâm lý:</p>

                <img src="https://placehold.co/800x350/112250/6A5BFF?text=Paper+vs+Real+Trading" alt="Paper vs Real Trading" class="image-placeholder">

                <div class="benefits-grid">
                    <div class="benefit-card">
                        <h4>📝 Paper Trading</h4>
                        <p>• Không áp lực tâm lý</p>
                        <p>• Dễ tuân thủ kỷ luật</p>
                        <p>• Không có slippage</p>
                        <p>• Lệnh luôn được khớp</p>
                    </div>
                    <div class="benefit-card">
                        <h4>💰 Real Trading</h4>
                        <p>• Áp lực tâm lý cao</p>
                        <p>• Dễ bị FOMO, FUD</p>
                        <p>• Có slippage thực tế</p>
                        <p>• Liquidity ảnh hưởng</p>
                    </div>
                </div>

                <div class="warning-box">
                    <h4>⚠️ Điểm Khác Biệt Quan Trọng</h4>
                    <p>Tâm lý paper trading và real trading RẤT KHÁC. Nhiều trader paper trade rất giỏi nhưng real trade lại thua. Chuẩn bị tâm lý là step quan trọng nhất khi chuyển sang real.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Khi Nào Chuyển Sang Real?</h2>
            <div class="section-content">
                <p>Tiêu chí để biết bạn đã sẵn sàng:</p>

                <img src="https://placehold.co/800x300/112250/10B981?text=Ready+for+Real+Trading" alt="Ready for Real Trading" class="image-placeholder">

                <div class="concept-box">
                    <h4>✅ Checklist Sẵn Sàng</h4>
                    <p><strong>1. Số trades:</strong> Ít nhất 50-100 paper trades</p>
                    <p><strong>2. Win rate:</strong> Ổn định >55% trong 2+ tháng</p>
                    <p><strong>3. Profit factor:</strong> >1.5 (total profit / total loss)</p>
                    <p><strong>4. Drawdown:</strong> Không quá 20% tại bất kỳ thời điểm nào</p>
                    <p><strong>5. Kỷ luật:</strong> Tuân thủ 100% trading plan</p>
                </div>

                <div class="highlight-box">
                    <h4>💡 Lời Khuyên</h4>
                    <p>Khi bắt đầu real, hãy trade với số tiền NHỎ (1-5% portfolio mỗi trade). Coi 3 tháng đầu như "học phí" - mục tiêu là không mất quá 20% vốn.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Paper Trading = Thực hành với tiền ảo trên thị trường thực</li>
                <li>Lợi ích: Zero risk, test strategy, build confidence</li>
                <li>GEM App có tính năng Paper Trading tích hợp</li>
                <li>Paper trade 50-100 trades trước khi real</li>
                <li>Tiêu chí: Win rate >55%, Profit factor >1.5, Drawdown <20%</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="1">
                    <h4>Câu 1: Nên paper trade bao nhiêu trades trước khi real?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. 5-10 trades</div>
                        <div class="quiz-option" data-index="1">B. 50-100 trades</div>
                        <div class="quiz-option" data-index="2">C. 500+ trades</div>
                        <div class="quiz-option" data-index="3">D. Không cần paper trade</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 2: Win rate tối thiểu nên đạt trước khi real trade?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. 30%</div>
                        <div class="quiz-option" data-index="1">B. 45%</div>
                        <div class="quiz-option" data-index="2">C. 55%</div>
                        <div class="quiz-option" data-index="3">D. 80%</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 3: Điểm khác biệt lớn nhất giữa paper và real trading?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Tâm lý và áp lực</div>
                        <div class="quiz-option" data-index="1">B. Giá cả</div>
                        <div class="quiz-option" data-index="2">C. Timeframe</div>
                        <div class="quiz-option" data-index="3">D. Patterns</div>
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
            <p>🎉 Hoàn thành <span class="highlight">Bài 7.1</span></p>
            <p>Tiếp theo: <strong>Bài 7.2 - Cách Sử Dụng Paper Trade Trong GEM</strong></p>
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

-- Lesson 7.2: Hướng Dẫn Paper Trade Trong GEM - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch7-l2',
  'module-tier-1-ch7',
  'course-tier1-trading-foundation',
  'Bài 7.2: Hướng Dẫn Paper Trade Trong GEM - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 7.2: Hướng Dẫn Paper Trade Trong GEM - GEM Trading Academy</title>
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
            border-left: 4px solid var(--accent-cyan);
        }

        .step-card h4 { color: var(--accent-cyan); margin-bottom: 0.75rem; }
        .step-card p { color: var(--text-secondary); margin-bottom: 0.5rem; }

        .form-preview {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border: 1px solid var(--border-color);
        }

        .form-preview h4 { color: var(--accent-gold); margin-bottom: 1rem; }

        .form-field {
            display: flex;
            justify-content: space-between;
            padding: 0.6rem 0;
            border-bottom: 1px solid var(--border-color);
        }

        .form-field:last-child { border-bottom: none; }

        .field-label { color: var(--text-muted); }
        .field-value { color: var(--text-primary); font-weight: 500; }
        .field-value.green { color: var(--accent-green); }
        .field-value.red { color: var(--accent-red); }

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
        }

        @media (max-width: 600px) {
            .quiz-title {
                font-size: 1.15rem;
                padding: 16px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
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
            <span class="lesson-badge">📚 Tier 1 - Bài 7.2</span>
            <h1>Hướng Dẫn Paper Trade Trong GEM</h1>
            <p>Step-by-step tạo và quản lý paper trade trong GEM App</p>
        </header>

        <section class="section">
            <h2 class="section-title">Bước 1: Truy Cập Paper Trade</h2>
            <div class="section-content">
                <p>Có 2 cách để vào tính năng Paper Trade:</p>

                <img src="https://placehold.co/800x400/112250/00F0FF?text=Access+Paper+Trade+Screen" alt="Access Paper Trade Screen" class="image-placeholder">

                <div class="step-card">
                    <h4>📱 Cách 1: Từ Scanner</h4>
                    <p>Tab Scanner → Chọn coin có pattern → Nhấn nút "Paper Trade" màu xanh</p>
                </div>

                <div class="step-card">
                    <h4>📱 Cách 2: Từ Menu</h4>
                    <p>Account → Paper Trade History → Nhấn "+" để tạo trade mới</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Bước 2: Điền Thông Tin Trade</h2>
            <div class="section-content">
                <p>Form tạo paper trade yêu cầu các thông tin sau:</p>

                <img src="https://placehold.co/800x400/112250/FFBD59?text=Paper+Trade+Form" alt="Paper Trade Form" class="image-placeholder">

                <div class="form-preview">
                    <h4>📝 Paper Trade Form</h4>
                    <div class="form-field">
                        <span class="field-label">Coin</span>
                        <span class="field-value">BTC/USDT</span>
                    </div>
                    <div class="form-field">
                        <span class="field-label">Direction</span>
                        <span class="field-value green">LONG</span>
                    </div>
                    <div class="form-field">
                        <span class="field-label">Entry Price</span>
                        <span class="field-value">$42,500</span>
                    </div>
                    <div class="form-field">
                        <span class="field-label">Stop Loss</span>
                        <span class="field-value red">$41,000</span>
                    </div>
                    <div class="form-field">
                        <span class="field-label">Take Profit</span>
                        <span class="field-value green">$46,000</span>
                    </div>
                    <div class="form-field">
                        <span class="field-label">Position Size</span>
                        <span class="field-value">$500 (5%)</span>
                    </div>
                </div>

                <div class="highlight-box">
                    <h4>💡 Position Sizing</h4>
                    <p>GEM tự động tính size dựa trên % risk bạn chọn (1-5%). Với $10,000 balance và 2% risk = $200 max loss per trade.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Bước 3: Xác Nhận và Theo Dõi</h2>
            <div class="section-content">
                <p>Sau khi submit, trade sẽ được tracking tự động:</p>

                <img src="https://placehold.co/800x350/112250/10B981?text=Trade+Tracking+Screen" alt="Trade Tracking Screen" class="image-placeholder">

                <div class="step-card">
                    <h4>📊 Open Positions</h4>
                    <p>• Xem tất cả lệnh đang mở</p>
                    <p>• P&L cập nhật realtime</p>
                    <p>• % distance đến SL/TP</p>
                    <p>• Có thể close manual bất cứ lúc nào</p>
                </div>

                <div class="step-card">
                    <h4>🔔 Notifications</h4>
                    <p>App sẽ push notification khi:</p>
                    <p>• Giá chạm 50% way to TP</p>
                    <p>• Giá gần SL (80%)</p>
                    <p>• Khi hit SL hoặc TP</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Bước 4: Review Trade History</h2>
            <div class="section-content">
                <p>Phân tích kết quả các trades đã đóng:</p>

                <img src="https://placehold.co/800x350/112250/6A5BFF?text=Trade+History+Analytics" alt="Trade History Analytics" class="image-placeholder">

                <div class="form-preview">
                    <h4>📈 Performance Metrics</h4>
                    <div class="form-field">
                        <span class="field-label">Total Trades</span>
                        <span class="field-value">47</span>
                    </div>
                    <div class="form-field">
                        <span class="field-label">Win Rate</span>
                        <span class="field-value green">61.7%</span>
                    </div>
                    <div class="form-field">
                        <span class="field-label">Profit Factor</span>
                        <span class="field-value green">1.82</span>
                    </div>
                    <div class="form-field">
                        <span class="field-label">Max Drawdown</span>
                        <span class="field-value red">-8.3%</span>
                    </div>
                    <div class="form-field">
                        <span class="field-label">Total P&L</span>
                        <span class="field-value green">+$1,247</span>
                    </div>
                </div>

                <div class="warning-box">
                    <h4>⚠️ Đừng Reset Balance</h4>
                    <p>Tránh reset balance khi đang drawdown. Hãy trade như tiền thật - học cách hồi phục từ losing streak là skill quan trọng.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Tips Paper Trade Hiệu Quả</h2>
            <div class="section-content">
                <img src="https://placehold.co/800x300/112250/FFBD59?text=Paper+Trading+Tips" alt="Paper Trading Tips" class="image-placeholder">

                <div class="step-card">
                    <h4>✅ Best Practices</h4>
                    <p><strong>1. Trade như thật:</strong> Nghiêm túc với mỗi trade, không random</p>
                    <p><strong>2. Ghi chú:</strong> Viết lý do entry/exit mỗi trade</p>
                    <p><strong>3. Screenshot:</strong> Lưu chart setup của mỗi trade</p>
                    <p><strong>4. Review weekly:</strong> Phân tích trades hàng tuần</p>
                    <p><strong>5. Không cheat:</strong> Không close sớm khi gần SL</p>
                </div>

                <div class="highlight-box">
                    <h4>💡 Journal Template</h4>
                    <p>Mỗi trade nên ghi: Pattern (DPU/UPD...), Entry reason, SL/TP logic, Result, Lessons learned. GEM App có sẵn Notes field cho mỗi trade.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Truy cập Paper Trade từ Scanner hoặc Account menu</li>
                <li>Điền đầy đủ: Coin, Direction, Entry, SL, TP, Size</li>
                <li>App tự động track và notify khi hit SL/TP</li>
                <li>Review Performance Metrics thường xuyên</li>
                <li>Trade nghiêm túc, ghi chú, không cheat</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="1">
                    <h4>Câu 1: Virtual balance mặc định trong GEM Paper Trade là bao nhiêu?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. $1,000</div>
                        <div class="quiz-option" data-index="1">B. $10,000</div>
                        <div class="quiz-option" data-index="2">C. $100,000</div>
                        <div class="quiz-option" data-index="3">D. Không giới hạn</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 2: Nên làm gì sau mỗi paper trade?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Ghi chú lý do entry/exit và lessons learned</div>
                        <div class="quiz-option" data-index="1">B. Reset balance nếu thua</div>
                        <div class="quiz-option" data-index="2">C. Bỏ qua và trade tiếp</div>
                        <div class="quiz-option" data-index="3">D. Chỉ ghi khi trade thắng</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 3: GEM App notify khi nào?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Chỉ khi thắng</div>
                        <div class="quiz-option" data-index="1">B. Chỉ khi thua</div>
                        <div class="quiz-option" data-index="2">C. Khi gần SL/TP và khi hit SL/TP</div>
                        <div class="quiz-option" data-index="3">D. Không có notification</div>
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
            <p>🎉 Hoàn thành <span class="highlight">Bài 7.2</span></p>
            <p>Tiếp theo: <strong>Bài 7.3 - Trading Journal & Record Keeping</strong></p>
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
    <title>Bài 7.2: Hướng Dẫn Paper Trade Trong GEM - GEM Trading Academy</title>
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
            border-left: 4px solid var(--accent-cyan);
        }

        .step-card h4 { color: var(--accent-cyan); margin-bottom: 0.75rem; }
        .step-card p { color: var(--text-secondary); margin-bottom: 0.5rem; }

        .form-preview {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border: 1px solid var(--border-color);
        }

        .form-preview h4 { color: var(--accent-gold); margin-bottom: 1rem; }

        .form-field {
            display: flex;
            justify-content: space-between;
            padding: 0.6rem 0;
            border-bottom: 1px solid var(--border-color);
        }

        .form-field:last-child { border-bottom: none; }

        .field-label { color: var(--text-muted); }
        .field-value { color: var(--text-primary); font-weight: 500; }
        .field-value.green { color: var(--accent-green); }
        .field-value.red { color: var(--accent-red); }

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
        }

        @media (max-width: 600px) {
            .quiz-title {
                font-size: 1.15rem;
                padding: 16px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
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
            <span class="lesson-badge">📚 Tier 1 - Bài 7.2</span>
            <h1>Hướng Dẫn Paper Trade Trong GEM</h1>
            <p>Step-by-step tạo và quản lý paper trade trong GEM App</p>
        </header>

        <section class="section">
            <h2 class="section-title">Bước 1: Truy Cập Paper Trade</h2>
            <div class="section-content">
                <p>Có 2 cách để vào tính năng Paper Trade:</p>

                <img src="https://placehold.co/800x400/112250/00F0FF?text=Access+Paper+Trade+Screen" alt="Access Paper Trade Screen" class="image-placeholder">

                <div class="step-card">
                    <h4>📱 Cách 1: Từ Scanner</h4>
                    <p>Tab Scanner → Chọn coin có pattern → Nhấn nút "Paper Trade" màu xanh</p>
                </div>

                <div class="step-card">
                    <h4>📱 Cách 2: Từ Menu</h4>
                    <p>Account → Paper Trade History → Nhấn "+" để tạo trade mới</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Bước 2: Điền Thông Tin Trade</h2>
            <div class="section-content">
                <p>Form tạo paper trade yêu cầu các thông tin sau:</p>

                <img src="https://placehold.co/800x400/112250/FFBD59?text=Paper+Trade+Form" alt="Paper Trade Form" class="image-placeholder">

                <div class="form-preview">
                    <h4>📝 Paper Trade Form</h4>
                    <div class="form-field">
                        <span class="field-label">Coin</span>
                        <span class="field-value">BTC/USDT</span>
                    </div>
                    <div class="form-field">
                        <span class="field-label">Direction</span>
                        <span class="field-value green">LONG</span>
                    </div>
                    <div class="form-field">
                        <span class="field-label">Entry Price</span>
                        <span class="field-value">$42,500</span>
                    </div>
                    <div class="form-field">
                        <span class="field-label">Stop Loss</span>
                        <span class="field-value red">$41,000</span>
                    </div>
                    <div class="form-field">
                        <span class="field-label">Take Profit</span>
                        <span class="field-value green">$46,000</span>
                    </div>
                    <div class="form-field">
                        <span class="field-label">Position Size</span>
                        <span class="field-value">$500 (5%)</span>
                    </div>
                </div>

                <div class="highlight-box">
                    <h4>💡 Position Sizing</h4>
                    <p>GEM tự động tính size dựa trên % risk bạn chọn (1-5%). Với $10,000 balance và 2% risk = $200 max loss per trade.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Bước 3: Xác Nhận và Theo Dõi</h2>
            <div class="section-content">
                <p>Sau khi submit, trade sẽ được tracking tự động:</p>

                <img src="https://placehold.co/800x350/112250/10B981?text=Trade+Tracking+Screen" alt="Trade Tracking Screen" class="image-placeholder">

                <div class="step-card">
                    <h4>📊 Open Positions</h4>
                    <p>• Xem tất cả lệnh đang mở</p>
                    <p>• P&L cập nhật realtime</p>
                    <p>• % distance đến SL/TP</p>
                    <p>• Có thể close manual bất cứ lúc nào</p>
                </div>

                <div class="step-card">
                    <h4>🔔 Notifications</h4>
                    <p>App sẽ push notification khi:</p>
                    <p>• Giá chạm 50% way to TP</p>
                    <p>• Giá gần SL (80%)</p>
                    <p>• Khi hit SL hoặc TP</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Bước 4: Review Trade History</h2>
            <div class="section-content">
                <p>Phân tích kết quả các trades đã đóng:</p>

                <img src="https://placehold.co/800x350/112250/6A5BFF?text=Trade+History+Analytics" alt="Trade History Analytics" class="image-placeholder">

                <div class="form-preview">
                    <h4>📈 Performance Metrics</h4>
                    <div class="form-field">
                        <span class="field-label">Total Trades</span>
                        <span class="field-value">47</span>
                    </div>
                    <div class="form-field">
                        <span class="field-label">Win Rate</span>
                        <span class="field-value green">61.7%</span>
                    </div>
                    <div class="form-field">
                        <span class="field-label">Profit Factor</span>
                        <span class="field-value green">1.82</span>
                    </div>
                    <div class="form-field">
                        <span class="field-label">Max Drawdown</span>
                        <span class="field-value red">-8.3%</span>
                    </div>
                    <div class="form-field">
                        <span class="field-label">Total P&L</span>
                        <span class="field-value green">+$1,247</span>
                    </div>
                </div>

                <div class="warning-box">
                    <h4>⚠️ Đừng Reset Balance</h4>
                    <p>Tránh reset balance khi đang drawdown. Hãy trade như tiền thật - học cách hồi phục từ losing streak là skill quan trọng.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Tips Paper Trade Hiệu Quả</h2>
            <div class="section-content">
                <img src="https://placehold.co/800x300/112250/FFBD59?text=Paper+Trading+Tips" alt="Paper Trading Tips" class="image-placeholder">

                <div class="step-card">
                    <h4>✅ Best Practices</h4>
                    <p><strong>1. Trade như thật:</strong> Nghiêm túc với mỗi trade, không random</p>
                    <p><strong>2. Ghi chú:</strong> Viết lý do entry/exit mỗi trade</p>
                    <p><strong>3. Screenshot:</strong> Lưu chart setup của mỗi trade</p>
                    <p><strong>4. Review weekly:</strong> Phân tích trades hàng tuần</p>
                    <p><strong>5. Không cheat:</strong> Không close sớm khi gần SL</p>
                </div>

                <div class="highlight-box">
                    <h4>💡 Journal Template</h4>
                    <p>Mỗi trade nên ghi: Pattern (DPU/UPD...), Entry reason, SL/TP logic, Result, Lessons learned. GEM App có sẵn Notes field cho mỗi trade.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Truy cập Paper Trade từ Scanner hoặc Account menu</li>
                <li>Điền đầy đủ: Coin, Direction, Entry, SL, TP, Size</li>
                <li>App tự động track và notify khi hit SL/TP</li>
                <li>Review Performance Metrics thường xuyên</li>
                <li>Trade nghiêm túc, ghi chú, không cheat</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="1">
                    <h4>Câu 1: Virtual balance mặc định trong GEM Paper Trade là bao nhiêu?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. $1,000</div>
                        <div class="quiz-option" data-index="1">B. $10,000</div>
                        <div class="quiz-option" data-index="2">C. $100,000</div>
                        <div class="quiz-option" data-index="3">D. Không giới hạn</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 2: Nên làm gì sau mỗi paper trade?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Ghi chú lý do entry/exit và lessons learned</div>
                        <div class="quiz-option" data-index="1">B. Reset balance nếu thua</div>
                        <div class="quiz-option" data-index="2">C. Bỏ qua và trade tiếp</div>
                        <div class="quiz-option" data-index="3">D. Chỉ ghi khi trade thắng</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 3: GEM App notify khi nào?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Chỉ khi thắng</div>
                        <div class="quiz-option" data-index="1">B. Chỉ khi thua</div>
                        <div class="quiz-option" data-index="2">C. Khi gần SL/TP và khi hit SL/TP</div>
                        <div class="quiz-option" data-index="3">D. Không có notification</div>
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
            <p>🎉 Hoàn thành <span class="highlight">Bài 7.2</span></p>
            <p>Tiếp theo: <strong>Bài 7.3 - Trading Journal & Record Keeping</strong></p>
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

-- Lesson 7.3: Trading Journal & Record Keeping - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch7-l3',
  'module-tier-1-ch7',
  'course-tier1-trading-foundation',
  'Bài 7.3: Trading Journal & Record Keeping - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 7.3: Trading Journal & Record Keeping - GEM Trading Academy</title>
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

        .journal-template {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border: 1px solid var(--border-color);
        }

        .journal-template h4 { color: var(--accent-gold); margin-bottom: 1rem; }

        .journal-field {
            margin-bottom: 1rem;
        }

        .journal-field label {
            display: block;
            color: var(--accent-cyan);
            font-size: 0.9rem;
            margin-bottom: 0.25rem;
        }

        .journal-field .value {
            color: var(--text-secondary);
            padding: 0.5rem;
            background: var(--bg-card);
            border-radius: 6px;
            border-left: 3px solid var(--accent-gold);
        }

        .concept-box {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-cyan);
        }

        .concept-box h4 { color: var(--accent-cyan); margin-bottom: 0.75rem; }
        .concept-box p { color: var(--text-secondary); margin-bottom: 0.5rem; }

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
        }

        @media (max-width: 600px) {
            .quiz-title {
                padding: 16px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
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
        .quiz-score h3 { color: var(--accent-purple); }

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
            <span class="lesson-badge">📚 Tier 1 - Bài 7.3</span>
            <h1>Trading Journal & Record Keeping</h1>
            <p>Cách ghi chép và phân tích trades để cải thiện liên tục</p>
        </header>

        <section class="section">
            <h2 class="section-title">Tại Sao Cần Trading Journal?</h2>
            <div class="section-content">
                <p><strong>Trading Journal</strong> là nhật ký giao dịch ghi lại chi tiết mỗi trade. Đây là công cụ quan trọng nhất để cải thiện performance.</p>

                <img src="https://placehold.co/800x350/112250/FFBD59?text=Trading+Journal+Importance" alt="Trading Journal Importance" class="image-placeholder">

                <div class="concept-box">
                    <h4>📈 Lợi Ích Của Journal</h4>
                    <p><strong>1. Identify Patterns:</strong> Phát hiện những sai lầm lặp lại</p>
                    <p><strong>2. Measure Progress:</strong> Đo lường sự tiến bộ theo thời gian</p>
                    <p><strong>3. Emotional Awareness:</strong> Nhận biết tâm lý ảnh hưởng trading</p>
                    <p><strong>4. Strategy Refinement:</strong> Tinh chỉnh strategy dựa trên data</p>
                </div>

                <div class="highlight-box">
                    <h4>💡 Thống Kê</h4>
                    <p>Traders có journal ghi chép đầy đủ có win rate cao hơn 15-20% so với traders không ghi chép (theo research từ Trading Psychology).</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Journal Template</h2>
            <div class="section-content">
                <p>Template ghi chép cho mỗi trade:</p>

                <img src="https://placehold.co/800x400/112250/00F0FF?text=Journal+Template" alt="Journal Template" class="image-placeholder">

                <div class="journal-template">
                    <h4>📝 Trade Entry #47</h4>

                    <div class="journal-field">
                        <label>Date & Time</label>
                        <div class="value">2024-12-15 14:30 UTC</div>
                    </div>

                    <div class="journal-field">
                        <label>Symbol & Direction</label>
                        <div class="value">BTC/USDT - LONG</div>
                    </div>

                    <div class="journal-field">
                        <label>Pattern/Setup</label>
                        <div class="value">DPU - Break LFZ với volume spike 2.1x</div>
                    </div>

                    <div class="journal-field">
                        <label>Entry Reason</label>
                        <div class="value">Phase PAUSE 5 ngày, volume cạn, break LFZ $42,500 với strong bullish candle. D1 neutral, cho phép LONG.</div>
                    </div>

                    <div class="journal-field">
                        <label>Entry/SL/TP</label>
                        <div class="value">Entry: $42,700 | SL: $41,200 | TP: $46,500</div>
                    </div>

                    <div class="journal-field">
                        <label>R:R & Position Size</label>
                        <div class="value">R:R = 2.5:1 | Size: $500 (5% portfolio)</div>
                    </div>

                    <div class="journal-field">
                        <label>Result</label>
                        <div class="value">✅ TP HIT | +$475 (+8.9%)</div>
                    </div>

                    <div class="journal-field">
                        <label>Lessons Learned</label>
                        <div class="value">DPU trên H4 với D1 neutral cho kết quả tốt. Volume confirmation quan trọng - nên đợi spike ≥2x.</div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Metrics Cần Track</h2>
            <div class="section-content">
                <p>Các chỉ số quan trọng cần theo dõi hàng tuần/tháng:</p>

                <img src="https://placehold.co/800x350/112250/10B981?text=Key+Trading+Metrics" alt="Key Trading Metrics" class="image-placeholder">

                <div class="concept-box">
                    <h4>📊 Essential Metrics</h4>
                    <p><strong>Win Rate:</strong> % trades thắng / tổng trades (Target: >55%)</p>
                    <p><strong>Profit Factor:</strong> Total profit / Total loss (Target: >1.5)</p>
                    <p><strong>Average R:R:</strong> Trung bình R:R của winning trades (Target: >2:1)</p>
                    <p><strong>Max Drawdown:</strong> % loss lớn nhất từ peak (Target: <20%)</p>
                    <p><strong>Expectancy:</strong> (Win% × Avg Win) - (Loss% × Avg Loss) (Target: >0)</p>
                </div>

                <div class="concept-box">
                    <h4>📈 Pattern Analysis</h4>
                    <p><strong>Best Pattern:</strong> Pattern nào có win rate cao nhất?</p>
                    <p><strong>Best Timeframe:</strong> TF nào trade tốt nhất?</p>
                    <p><strong>Best Time:</strong> Giờ nào trong ngày trade tốt nhất?</p>
                    <p><strong>Worst Mistakes:</strong> Sai lầm nào lặp lại nhiều nhất?</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Weekly Review Process</h2>
            <div class="section-content">
                <p>Quy trình review hàng tuần:</p>

                <img src="https://placehold.co/800x300/112250/6A5BFF?text=Weekly+Review+Process" alt="Weekly Review Process" class="image-placeholder">

                <div class="concept-box">
                    <h4>📋 Sunday Review Checklist</h4>
                    <p><strong>1. Tổng hợp trades:</strong> Số trades, wins, losses</p>
                    <p><strong>2. Tính metrics:</strong> Win rate, PF, drawdown tuần này</p>
                    <p><strong>3. Phân tích losers:</strong> Xem lại tất cả losing trades - tại sao thua?</p>
                    <p><strong>4. Pattern analysis:</strong> Pattern nào work, pattern nào không?</p>
                    <p><strong>5. Emotional check:</strong> Có trade nào do FOMO/FUD không?</p>
                    <p><strong>6. Action items:</strong> Viết 1-3 điều cải thiện tuần tới</p>
                </div>

                <div class="highlight-box">
                    <h4>💡 Focus On Losers</h4>
                    <p>Học từ losing trades quan trọng hơn winning trades. Mỗi loss là một bài học - đảm bảo không lặp lại cùng một sai lầm.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Trading Journal giúp identify patterns và cải thiện liên tục</li>
                <li>Ghi đầy đủ: Setup, Entry reason, SL/TP, Result, Lessons</li>
                <li>Track metrics: Win rate, Profit Factor, Max Drawdown</li>
                <li>Weekly review vào Chủ nhật, focus vào losing trades</li>
                <li>Action items: Viết 1-3 điều cải thiện mỗi tuần</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="2">
                    <h4>Câu 1: Profit Factor target là bao nhiêu?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. > 0.5</div>
                        <div class="quiz-option" data-index="1">B. > 1.0</div>
                        <div class="quiz-option" data-index="2">C. > 1.5</div>
                        <div class="quiz-option" data-index="3">D. > 3.0</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 2: Khi review, nên focus vào trades nào?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Losing trades - học từ sai lầm</div>
                        <div class="quiz-option" data-index="1">B. Chỉ winning trades</div>
                        <div class="quiz-option" data-index="2">C. Trades có profit cao nhất</div>
                        <div class="quiz-option" data-index="3">D. Không cần review</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="1">
                    <h4>Câu 3: Max Drawdown target là bao nhiêu?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. < 50%</div>
                        <div class="quiz-option" data-index="1">B. < 20%</div>
                        <div class="quiz-option" data-index="2">C. < 5%</div>
                        <div class="quiz-option" data-index="3">D. 0%</div>
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
            <p>🎉 Hoàn thành <span class="highlight">Bài 7.3</span></p>
            <p>Tiếp theo: <strong>Bài 7.4 - Paper Trading Challenge 30 Ngày</strong></p>
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
    <title>Bài 7.3: Trading Journal & Record Keeping - GEM Trading Academy</title>
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

        .journal-template {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border: 1px solid var(--border-color);
        }

        .journal-template h4 { color: var(--accent-gold); margin-bottom: 1rem; }

        .journal-field {
            margin-bottom: 1rem;
        }

        .journal-field label {
            display: block;
            color: var(--accent-cyan);
            font-size: 0.9rem;
            margin-bottom: 0.25rem;
        }

        .journal-field .value {
            color: var(--text-secondary);
            padding: 0.5rem;
            background: var(--bg-card);
            border-radius: 6px;
            border-left: 3px solid var(--accent-gold);
        }

        .concept-box {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-cyan);
        }

        .concept-box h4 { color: var(--accent-cyan); margin-bottom: 0.75rem; }
        .concept-box p { color: var(--text-secondary); margin-bottom: 0.5rem; }

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
        }

        @media (max-width: 600px) {
            .quiz-title {
                padding: 16px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--border-color);
            }
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
        .quiz-score h3 { color: var(--accent-purple); }

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
            <span class="lesson-badge">📚 Tier 1 - Bài 7.3</span>
            <h1>Trading Journal & Record Keeping</h1>
            <p>Cách ghi chép và phân tích trades để cải thiện liên tục</p>
        </header>

        <section class="section">
            <h2 class="section-title">Tại Sao Cần Trading Journal?</h2>
            <div class="section-content">
                <p><strong>Trading Journal</strong> là nhật ký giao dịch ghi lại chi tiết mỗi trade. Đây là công cụ quan trọng nhất để cải thiện performance.</p>

                <img src="https://placehold.co/800x350/112250/FFBD59?text=Trading+Journal+Importance" alt="Trading Journal Importance" class="image-placeholder">

                <div class="concept-box">
                    <h4>📈 Lợi Ích Của Journal</h4>
                    <p><strong>1. Identify Patterns:</strong> Phát hiện những sai lầm lặp lại</p>
                    <p><strong>2. Measure Progress:</strong> Đo lường sự tiến bộ theo thời gian</p>
                    <p><strong>3. Emotional Awareness:</strong> Nhận biết tâm lý ảnh hưởng trading</p>
                    <p><strong>4. Strategy Refinement:</strong> Tinh chỉnh strategy dựa trên data</p>
                </div>

                <div class="highlight-box">
                    <h4>💡 Thống Kê</h4>
                    <p>Traders có journal ghi chép đầy đủ có win rate cao hơn 15-20% so với traders không ghi chép (theo research từ Trading Psychology).</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Journal Template</h2>
            <div class="section-content">
                <p>Template ghi chép cho mỗi trade:</p>

                <img src="https://placehold.co/800x400/112250/00F0FF?text=Journal+Template" alt="Journal Template" class="image-placeholder">

                <div class="journal-template">
                    <h4>📝 Trade Entry #47</h4>

                    <div class="journal-field">
                        <label>Date & Time</label>
                        <div class="value">2024-12-15 14:30 UTC</div>
                    </div>

                    <div class="journal-field">
                        <label>Symbol & Direction</label>
                        <div class="value">BTC/USDT - LONG</div>
                    </div>

                    <div class="journal-field">
                        <label>Pattern/Setup</label>
                        <div class="value">DPU - Break LFZ với volume spike 2.1x</div>
                    </div>

                    <div class="journal-field">
                        <label>Entry Reason</label>
                        <div class="value">Phase PAUSE 5 ngày, volume cạn, break LFZ $42,500 với strong bullish candle. D1 neutral, cho phép LONG.</div>
                    </div>

                    <div class="journal-field">
                        <label>Entry/SL/TP</label>
                        <div class="value">Entry: $42,700 | SL: $41,200 | TP: $46,500</div>
                    </div>

                    <div class="journal-field">
                        <label>R:R & Position Size</label>
                        <div class="value">R:R = 2.5:1 | Size: $500 (5% portfolio)</div>
                    </div>

                    <div class="journal-field">
                        <label>Result</label>
                        <div class="value">✅ TP HIT | +$475 (+8.9%)</div>
                    </div>

                    <div class="journal-field">
                        <label>Lessons Learned</label>
                        <div class="value">DPU trên H4 với D1 neutral cho kết quả tốt. Volume confirmation quan trọng - nên đợi spike ≥2x.</div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Metrics Cần Track</h2>
            <div class="section-content">
                <p>Các chỉ số quan trọng cần theo dõi hàng tuần/tháng:</p>

                <img src="https://placehold.co/800x350/112250/10B981?text=Key+Trading+Metrics" alt="Key Trading Metrics" class="image-placeholder">

                <div class="concept-box">
                    <h4>📊 Essential Metrics</h4>
                    <p><strong>Win Rate:</strong> % trades thắng / tổng trades (Target: >55%)</p>
                    <p><strong>Profit Factor:</strong> Total profit / Total loss (Target: >1.5)</p>
                    <p><strong>Average R:R:</strong> Trung bình R:R của winning trades (Target: >2:1)</p>
                    <p><strong>Max Drawdown:</strong> % loss lớn nhất từ peak (Target: <20%)</p>
                    <p><strong>Expectancy:</strong> (Win% × Avg Win) - (Loss% × Avg Loss) (Target: >0)</p>
                </div>

                <div class="concept-box">
                    <h4>📈 Pattern Analysis</h4>
                    <p><strong>Best Pattern:</strong> Pattern nào có win rate cao nhất?</p>
                    <p><strong>Best Timeframe:</strong> TF nào trade tốt nhất?</p>
                    <p><strong>Best Time:</strong> Giờ nào trong ngày trade tốt nhất?</p>
                    <p><strong>Worst Mistakes:</strong> Sai lầm nào lặp lại nhiều nhất?</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Weekly Review Process</h2>
            <div class="section-content">
                <p>Quy trình review hàng tuần:</p>

                <img src="https://placehold.co/800x300/112250/6A5BFF?text=Weekly+Review+Process" alt="Weekly Review Process" class="image-placeholder">

                <div class="concept-box">
                    <h4>📋 Sunday Review Checklist</h4>
                    <p><strong>1. Tổng hợp trades:</strong> Số trades, wins, losses</p>
                    <p><strong>2. Tính metrics:</strong> Win rate, PF, drawdown tuần này</p>
                    <p><strong>3. Phân tích losers:</strong> Xem lại tất cả losing trades - tại sao thua?</p>
                    <p><strong>4. Pattern analysis:</strong> Pattern nào work, pattern nào không?</p>
                    <p><strong>5. Emotional check:</strong> Có trade nào do FOMO/FUD không?</p>
                    <p><strong>6. Action items:</strong> Viết 1-3 điều cải thiện tuần tới</p>
                </div>

                <div class="highlight-box">
                    <h4>💡 Focus On Losers</h4>
                    <p>Học từ losing trades quan trọng hơn winning trades. Mỗi loss là một bài học - đảm bảo không lặp lại cùng một sai lầm.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Trading Journal giúp identify patterns và cải thiện liên tục</li>
                <li>Ghi đầy đủ: Setup, Entry reason, SL/TP, Result, Lessons</li>
                <li>Track metrics: Win rate, Profit Factor, Max Drawdown</li>
                <li>Weekly review vào Chủ nhật, focus vào losing trades</li>
                <li>Action items: Viết 1-3 điều cải thiện mỗi tuần</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="2">
                    <h4>Câu 1: Profit Factor target là bao nhiêu?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. > 0.5</div>
                        <div class="quiz-option" data-index="1">B. > 1.0</div>
                        <div class="quiz-option" data-index="2">C. > 1.5</div>
                        <div class="quiz-option" data-index="3">D. > 3.0</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 2: Khi review, nên focus vào trades nào?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Losing trades - học từ sai lầm</div>
                        <div class="quiz-option" data-index="1">B. Chỉ winning trades</div>
                        <div class="quiz-option" data-index="2">C. Trades có profit cao nhất</div>
                        <div class="quiz-option" data-index="3">D. Không cần review</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="1">
                    <h4>Câu 3: Max Drawdown target là bao nhiêu?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. < 50%</div>
                        <div class="quiz-option" data-index="1">B. < 20%</div>
                        <div class="quiz-option" data-index="2">C. < 5%</div>
                        <div class="quiz-option" data-index="3">D. 0%</div>
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
            <p>🎉 Hoàn thành <span class="highlight">Bài 7.3</span></p>
            <p>Tiếp theo: <strong>Bài 7.4 - Paper Trading Challenge 30 Ngày</strong></p>
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

-- Lesson 7.4: Backtesting Cơ Bản - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch7-l4',
  'module-tier-1-ch7',
  'course-tier1-trading-foundation',
  'Bài 7.4: Backtesting Cơ Bản - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 7.4: Backtesting Cơ Bản - GEM Trading Academy</title>
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

        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }

        .comparison-table th,
        .comparison-table td {
            padding: 0.8rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }

        .comparison-table th {
            background: var(--bg-secondary);
            color: var(--accent-gold);
            font-weight: 600;
        }

        .comparison-table td {
            color: var(--text-secondary);
        }

        @media (max-width: 600px) {
            .comparison-table th,
            .comparison-table td {
                padding: 0.6rem 0.4rem;
                font-size: 0.85rem;
            }
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
            content: "□";
            position: absolute;
            left: 0;
            color: var(--accent-cyan);
            font-size: 1.2rem;
        }

        .formula-box {
            background: var(--bg-secondary);
            border-radius: 10px;
            padding: 1rem;
            margin: 1rem 0;
            font-family: monospace;
            text-align: center;
            font-size: 1.1rem;
            color: var(--accent-cyan);
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">CHƯƠNG 7 - BÀI 4/5</span>
            <h1>Backtesting Cơ Bản</h1>
            <p>Kiểm tra chiến lược với dữ liệu lịch sử</p>
        </header>

        <section class="section">
            <h2 class="section-title"><span class="icon">📊</span> Backtesting Là Gì?</h2>
            <p class="content-text">
                Backtesting là quá trình <strong>kiểm tra chiến lược trading</strong> bằng cách áp dụng các quy tắc của bạn
                lên dữ liệu giá lịch sử. Đây là cách để xác minh xem pattern và chiến lược của bạn có thực sự hiệu quả không
                trước khi mạo hiểm tiền thật.
            </p>

            <div class="highlight-box gold">
                <div class="highlight-title">💡 Tại Sao Backtesting Quan Trọng?</div>
                <p class="content-text">
                    Nếu một chiến lược không hoạt động trên dữ liệu quá khứ, rất khó để nó hoạt động trong tương lai.
                    Backtesting giúp bạn <strong>loại bỏ những chiến lược kém hiệu quả</strong> và tập trung vào những gì thực sự có lợi.
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/FFBD59?text=Backtesting+Overview" alt="Backtesting Overview">
                <p class="image-caption">Hình 7.4.1: Quy trình backtesting patterns trên chart</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🔍</span> Quy Trình Backtesting 5 Bước</h2>

            <ol class="steps-list">
                <li>
                    <strong>Chọn Cặp Coin & Timeframe</strong><br>
                    Chọn coin bạn thường trade và timeframe ưa thích (khuyến nghị 1H hoặc 4H cho người mới)
                </li>
                <li>
                    <strong>Lùi Về Quá Khứ</strong><br>
                    Kéo chart về 50-100 nến trước (TradingView: nhấn giữ và kéo chart sang phải)
                </li>
                <li>
                    <strong>Tìm Pattern</strong><br>
                    Xác định các pattern GEM (UPU, UPD, DPU...) theo đúng checklist đã học
                </li>
                <li>
                    <strong>Đánh Dấu Entry/SL/TP</strong><br>
                    Sử dụng công cụ vẽ để mark vị trí entry, stop loss và take profit giả định
                </li>
                <li>
                    <strong>Kiểm Tra Kết Quả</strong><br>
                    Tiến về phía trước để xem trade thắng hay thua, ghi nhận vào bảng thống kê
                </li>
            </ol>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/00F0FF?text=Backtesting+5+Steps+Process" alt="Quy trình 5 bước">
                <p class="image-caption">Hình 7.4.2: Minh họa quy trình backtesting 5 bước</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📋</span> Mẫu Bảng Backtesting</h2>
            <p class="content-text">
                Sử dụng bảng này để ghi chép kết quả mỗi lần backtest:
            </p>

            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Cột</th>
                        <th>Nội Dung Ghi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>#</td>
                        <td>Số thứ tự trade</td>
                    </tr>
                    <tr>
                        <td>Ngày</td>
                        <td>Ngày của pattern (trên chart lịch sử)</td>
                    </tr>
                    <tr>
                        <td>Pattern</td>
                        <td>Loại pattern (UPU, UPD, DPU...)</td>
                    </tr>
                    <tr>
                        <td>Entry</td>
                        <td>Giá vào lệnh</td>
                    </tr>
                    <tr>
                        <td>SL</td>
                        <td>Giá stop loss</td>
                    </tr>
                    <tr>
                        <td>TP</td>
                        <td>Giá take profit</td>
                    </tr>
                    <tr>
                        <td>R:R</td>
                        <td>Tỷ lệ Risk:Reward</td>
                    </tr>
                    <tr>
                        <td>Kết quả</td>
                        <td>Win / Loss / BE</td>
                    </tr>
                </tbody>
            </table>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/10B981?text=Backtest+Record+Template" alt="Mẫu bảng backtest">
                <p class="image-caption">Hình 7.4.3: Mẫu Excel backtesting đơn giản</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📈</span> Tính Toán Win Rate Cá Nhân</h2>
            <p class="content-text">
                Sau khi backtest ít nhất <strong>20-30 trades</strong>, bạn có thể tính được Win Rate cá nhân cho từng pattern:
            </p>

            <div class="formula-box">
                Win Rate = (Số Trade Thắng / Tổng Số Trade) × 100%
            </div>

            <div class="info-grid">
                <div class="info-card">
                    <div class="info-card-title">Ví dụ: 30 trades UPU</div>
                    <div class="info-card-value">21 Win</div>
                    <p class="content-text" style="font-size: 0.85rem; margin-top: 0.3rem;">= 70% Win Rate</p>
                </div>
                <div class="info-card">
                    <div class="info-card-title">Mục tiêu tối thiểu</div>
                    <div class="info-card-value">&ge; 60%</div>
                    <p class="content-text" style="font-size: 0.85rem; margin-top: 0.3rem;">để có lợi nhuận ổn định</p>
                </div>
            </div>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Win Rate Tham Khảo GEM Patterns</div>
                <ul class="checklist">
                    <li>UPU: 68-72% (dựa trên 500+ mẫu)</li>
                    <li>UPD: 65-70% (dựa trên 400+ mẫu)</li>
                    <li>DPU: 66-71% (dựa trên 450+ mẫu)</li>
                </ul>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">⚠️</span> Lỗi Thường Gặp Khi Backtesting</h2>

            <div class="highlight-box red">
                <div class="highlight-title">❌ Lỗi #1: Lookahead Bias</div>
                <p class="content-text">
                    "Nhìn trước" kết quả rồi mới xác định entry. Hãy che phần chart phía trước và chỉ xem những gì đã xảy ra.
                </p>
            </div>

            <div class="highlight-box red">
                <div class="highlight-title">❌ Lỗi #2: Cherry Picking</div>
                <p class="content-text">
                    Chỉ chọn những pattern đẹp nhất để backtest. Hãy backtest TẤT CẢ patterns bạn thấy, kể cả những pattern không hoàn hảo.
                </p>
            </div>

            <div class="highlight-box red">
                <div class="highlight-title">❌ Lỗi #3: Sample Size Quá Nhỏ</div>
                <p class="content-text">
                    Backtest 5-10 trades rồi kết luận. Cần ít nhất 30 trades cho mỗi pattern để có kết quả đáng tin cậy.
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/EF4444?text=Common+Backtesting+Errors" alt="Các lỗi phổ biến">
                <p class="image-caption">Hình 7.4.4: 3 lỗi phổ biến cần tránh khi backtesting</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🛠️</span> Công Cụ Backtesting</h2>

            <div class="info-grid">
                <div class="info-card">
                    <div class="info-card-title">TradingView Replay</div>
                    <div class="info-card-value" style="font-size: 1rem;">Bar Replay Mode</div>
                    <p class="content-text" style="font-size: 0.85rem; margin-top: 0.3rem;">
                        Cho phép "chạy lại" chart từng nến một. Miễn phí trên TradingView.
                    </p>
                </div>
                <div class="info-card">
                    <div class="info-card-title">Excel/Google Sheets</div>
                    <div class="info-card-value" style="font-size: 1rem;">Bảng Tính</div>
                    <p class="content-text" style="font-size: 0.85rem; margin-top: 0.3rem;">
                        Tự tạo bảng ghi chép kết quả, tính toán Win Rate tự động.
                    </p>
                </div>
            </div>

            <div class="highlight-box">
                <div class="highlight-title">💡 Mẹo: Sử Dụng Bar Replay TradingView</div>
                <ol class="steps-list">
                    <li>Mở chart coin bạn muốn backtest</li>
                    <li>Click biểu tượng "Replay" (nút play) trên thanh công cụ</li>
                    <li>Chọn thời điểm bắt đầu (kéo thanh đến ngày cần test)</li>
                    <li>Nhấn Play để chart chạy từng nến</li>
                </ol>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/6A5BFF?text=TradingView+Bar+Replay" alt="TradingView Replay">
                <p class="image-caption">Hình 7.4.5: Giao diện Bar Replay trên TradingView</p>
            </div>
        </section>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 7.4</h3>
            <ul class="summary-list">
                <li>Backtesting giúp kiểm tra hiệu quả chiến lược trên dữ liệu quá khứ</li>
                <li>Quy trình 5 bước: Chọn coin → Lùi chart → Tìm pattern → Mark entry → Kiểm tra</li>
                <li>Cần ít nhất 30 trades/pattern để có Win Rate đáng tin cậy</li>
                <li>Tránh lookahead bias, cherry picking và sample size quá nhỏ</li>
                <li>Sử dụng TradingView Bar Replay + Excel để backtest hiệu quả</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title"><span class="icon">❓</span> Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Cần backtest ít nhất bao nhiêu trades cho một pattern để có kết quả đáng tin cậy?</p>
                <button class="quiz-option" data-index="0">A. 5-10 trades</button>
                <button class="quiz-option" data-index="1">B. 30+ trades</button>
                <button class="quiz-option" data-index="2">C. 3 trades là đủ</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. "Lookahead Bias" trong backtesting là gì?</p>
                <button class="quiz-option" data-index="0">A. Backtest quá nhiều patterns</button>
                <button class="quiz-option" data-index="1">B. Sử dụng sai timeframe</button>
                <button class="quiz-option" data-index="2">C. Nhìn trước kết quả rồi mới xác định entry</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">3. Win Rate tối thiểu nên đạt bao nhiêu để trading có lợi nhuận ổn định?</p>
                <button class="quiz-option" data-index="0">A. 60%</button>
                <button class="quiz-option" data-index="1">B. 30%</button>
                <button class="quiz-option" data-index="2">C. 90%</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Bạn trả lời đúng <span id="correct-count">0</span>/3 câu!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Bài 7.4: Backtesting Cơ Bản</p>
            <p>Tiếp theo: Bài 7.5 - Từ Paper Trading Đến Giao Dịch Thật</p>
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
    <title>Bài 7.4: Backtesting Cơ Bản - GEM Trading Academy</title>
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

        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }

        .comparison-table th,
        .comparison-table td {
            padding: 0.8rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }

        .comparison-table th {
            background: var(--bg-secondary);
            color: var(--accent-gold);
            font-weight: 600;
        }

        .comparison-table td {
            color: var(--text-secondary);
        }

        @media (max-width: 600px) {
            .comparison-table th,
            .comparison-table td {
                padding: 0.6rem 0.4rem;
                font-size: 0.85rem;
            }
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
            content: "□";
            position: absolute;
            left: 0;
            color: var(--accent-cyan);
            font-size: 1.2rem;
        }

        .formula-box {
            background: var(--bg-secondary);
            border-radius: 10px;
            padding: 1rem;
            margin: 1rem 0;
            font-family: monospace;
            text-align: center;
            font-size: 1.1rem;
            color: var(--accent-cyan);
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">CHƯƠNG 7 - BÀI 4/5</span>
            <h1>Backtesting Cơ Bản</h1>
            <p>Kiểm tra chiến lược với dữ liệu lịch sử</p>
        </header>

        <section class="section">
            <h2 class="section-title"><span class="icon">📊</span> Backtesting Là Gì?</h2>
            <p class="content-text">
                Backtesting là quá trình <strong>kiểm tra chiến lược trading</strong> bằng cách áp dụng các quy tắc của bạn
                lên dữ liệu giá lịch sử. Đây là cách để xác minh xem pattern và chiến lược của bạn có thực sự hiệu quả không
                trước khi mạo hiểm tiền thật.
            </p>

            <div class="highlight-box gold">
                <div class="highlight-title">💡 Tại Sao Backtesting Quan Trọng?</div>
                <p class="content-text">
                    Nếu một chiến lược không hoạt động trên dữ liệu quá khứ, rất khó để nó hoạt động trong tương lai.
                    Backtesting giúp bạn <strong>loại bỏ những chiến lược kém hiệu quả</strong> và tập trung vào những gì thực sự có lợi.
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/FFBD59?text=Backtesting+Overview" alt="Backtesting Overview">
                <p class="image-caption">Hình 7.4.1: Quy trình backtesting patterns trên chart</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🔍</span> Quy Trình Backtesting 5 Bước</h2>

            <ol class="steps-list">
                <li>
                    <strong>Chọn Cặp Coin & Timeframe</strong><br>
                    Chọn coin bạn thường trade và timeframe ưa thích (khuyến nghị 1H hoặc 4H cho người mới)
                </li>
                <li>
                    <strong>Lùi Về Quá Khứ</strong><br>
                    Kéo chart về 50-100 nến trước (TradingView: nhấn giữ và kéo chart sang phải)
                </li>
                <li>
                    <strong>Tìm Pattern</strong><br>
                    Xác định các pattern GEM (UPU, UPD, DPU...) theo đúng checklist đã học
                </li>
                <li>
                    <strong>Đánh Dấu Entry/SL/TP</strong><br>
                    Sử dụng công cụ vẽ để mark vị trí entry, stop loss và take profit giả định
                </li>
                <li>
                    <strong>Kiểm Tra Kết Quả</strong><br>
                    Tiến về phía trước để xem trade thắng hay thua, ghi nhận vào bảng thống kê
                </li>
            </ol>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/00F0FF?text=Backtesting+5+Steps+Process" alt="Quy trình 5 bước">
                <p class="image-caption">Hình 7.4.2: Minh họa quy trình backtesting 5 bước</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📋</span> Mẫu Bảng Backtesting</h2>
            <p class="content-text">
                Sử dụng bảng này để ghi chép kết quả mỗi lần backtest:
            </p>

            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Cột</th>
                        <th>Nội Dung Ghi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>#</td>
                        <td>Số thứ tự trade</td>
                    </tr>
                    <tr>
                        <td>Ngày</td>
                        <td>Ngày của pattern (trên chart lịch sử)</td>
                    </tr>
                    <tr>
                        <td>Pattern</td>
                        <td>Loại pattern (UPU, UPD, DPU...)</td>
                    </tr>
                    <tr>
                        <td>Entry</td>
                        <td>Giá vào lệnh</td>
                    </tr>
                    <tr>
                        <td>SL</td>
                        <td>Giá stop loss</td>
                    </tr>
                    <tr>
                        <td>TP</td>
                        <td>Giá take profit</td>
                    </tr>
                    <tr>
                        <td>R:R</td>
                        <td>Tỷ lệ Risk:Reward</td>
                    </tr>
                    <tr>
                        <td>Kết quả</td>
                        <td>Win / Loss / BE</td>
                    </tr>
                </tbody>
            </table>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/10B981?text=Backtest+Record+Template" alt="Mẫu bảng backtest">
                <p class="image-caption">Hình 7.4.3: Mẫu Excel backtesting đơn giản</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📈</span> Tính Toán Win Rate Cá Nhân</h2>
            <p class="content-text">
                Sau khi backtest ít nhất <strong>20-30 trades</strong>, bạn có thể tính được Win Rate cá nhân cho từng pattern:
            </p>

            <div class="formula-box">
                Win Rate = (Số Trade Thắng / Tổng Số Trade) × 100%
            </div>

            <div class="info-grid">
                <div class="info-card">
                    <div class="info-card-title">Ví dụ: 30 trades UPU</div>
                    <div class="info-card-value">21 Win</div>
                    <p class="content-text" style="font-size: 0.85rem; margin-top: 0.3rem;">= 70% Win Rate</p>
                </div>
                <div class="info-card">
                    <div class="info-card-title">Mục tiêu tối thiểu</div>
                    <div class="info-card-value">&ge; 60%</div>
                    <p class="content-text" style="font-size: 0.85rem; margin-top: 0.3rem;">để có lợi nhuận ổn định</p>
                </div>
            </div>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Win Rate Tham Khảo GEM Patterns</div>
                <ul class="checklist">
                    <li>UPU: 68-72% (dựa trên 500+ mẫu)</li>
                    <li>UPD: 65-70% (dựa trên 400+ mẫu)</li>
                    <li>DPU: 66-71% (dựa trên 450+ mẫu)</li>
                </ul>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">⚠️</span> Lỗi Thường Gặp Khi Backtesting</h2>

            <div class="highlight-box red">
                <div class="highlight-title">❌ Lỗi #1: Lookahead Bias</div>
                <p class="content-text">
                    "Nhìn trước" kết quả rồi mới xác định entry. Hãy che phần chart phía trước và chỉ xem những gì đã xảy ra.
                </p>
            </div>

            <div class="highlight-box red">
                <div class="highlight-title">❌ Lỗi #2: Cherry Picking</div>
                <p class="content-text">
                    Chỉ chọn những pattern đẹp nhất để backtest. Hãy backtest TẤT CẢ patterns bạn thấy, kể cả những pattern không hoàn hảo.
                </p>
            </div>

            <div class="highlight-box red">
                <div class="highlight-title">❌ Lỗi #3: Sample Size Quá Nhỏ</div>
                <p class="content-text">
                    Backtest 5-10 trades rồi kết luận. Cần ít nhất 30 trades cho mỗi pattern để có kết quả đáng tin cậy.
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/EF4444?text=Common+Backtesting+Errors" alt="Các lỗi phổ biến">
                <p class="image-caption">Hình 7.4.4: 3 lỗi phổ biến cần tránh khi backtesting</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🛠️</span> Công Cụ Backtesting</h2>

            <div class="info-grid">
                <div class="info-card">
                    <div class="info-card-title">TradingView Replay</div>
                    <div class="info-card-value" style="font-size: 1rem;">Bar Replay Mode</div>
                    <p class="content-text" style="font-size: 0.85rem; margin-top: 0.3rem;">
                        Cho phép "chạy lại" chart từng nến một. Miễn phí trên TradingView.
                    </p>
                </div>
                <div class="info-card">
                    <div class="info-card-title">Excel/Google Sheets</div>
                    <div class="info-card-value" style="font-size: 1rem;">Bảng Tính</div>
                    <p class="content-text" style="font-size: 0.85rem; margin-top: 0.3rem;">
                        Tự tạo bảng ghi chép kết quả, tính toán Win Rate tự động.
                    </p>
                </div>
            </div>

            <div class="highlight-box">
                <div class="highlight-title">💡 Mẹo: Sử Dụng Bar Replay TradingView</div>
                <ol class="steps-list">
                    <li>Mở chart coin bạn muốn backtest</li>
                    <li>Click biểu tượng "Replay" (nút play) trên thanh công cụ</li>
                    <li>Chọn thời điểm bắt đầu (kéo thanh đến ngày cần test)</li>
                    <li>Nhấn Play để chart chạy từng nến</li>
                </ol>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/6A5BFF?text=TradingView+Bar+Replay" alt="TradingView Replay">
                <p class="image-caption">Hình 7.4.5: Giao diện Bar Replay trên TradingView</p>
            </div>
        </section>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 7.4</h3>
            <ul class="summary-list">
                <li>Backtesting giúp kiểm tra hiệu quả chiến lược trên dữ liệu quá khứ</li>
                <li>Quy trình 5 bước: Chọn coin → Lùi chart → Tìm pattern → Mark entry → Kiểm tra</li>
                <li>Cần ít nhất 30 trades/pattern để có Win Rate đáng tin cậy</li>
                <li>Tránh lookahead bias, cherry picking và sample size quá nhỏ</li>
                <li>Sử dụng TradingView Bar Replay + Excel để backtest hiệu quả</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title"><span class="icon">❓</span> Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Cần backtest ít nhất bao nhiêu trades cho một pattern để có kết quả đáng tin cậy?</p>
                <button class="quiz-option" data-index="0">A. 5-10 trades</button>
                <button class="quiz-option" data-index="1">B. 30+ trades</button>
                <button class="quiz-option" data-index="2">C. 3 trades là đủ</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. "Lookahead Bias" trong backtesting là gì?</p>
                <button class="quiz-option" data-index="0">A. Backtest quá nhiều patterns</button>
                <button class="quiz-option" data-index="1">B. Sử dụng sai timeframe</button>
                <button class="quiz-option" data-index="2">C. Nhìn trước kết quả rồi mới xác định entry</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">3. Win Rate tối thiểu nên đạt bao nhiêu để trading có lợi nhuận ổn định?</p>
                <button class="quiz-option" data-index="0">A. 60%</button>
                <button class="quiz-option" data-index="1">B. 30%</button>
                <button class="quiz-option" data-index="2">C. 90%</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Bạn trả lời đúng <span id="correct-count">0</span>/3 câu!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Bài 7.4: Backtesting Cơ Bản</p>
            <p>Tiếp theo: Bài 7.5 - Từ Paper Trading Đến Giao Dịch Thật</p>
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

-- Lesson 7.5: Từ Paper Trading Đến Giao Dịch Thật - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch7-l5',
  'module-tier-1-ch7',
  'course-tier1-trading-foundation',
  'Bài 7.5: Từ Paper Trading Đến Giao Dịch Thật - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 7.5: Từ Paper Trading Đến Giao Dịch Thật - GEM Trading Academy</title>
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

        .checklist-box {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1rem 0;
        }

        .checklist-title {
            color: var(--accent-gold);
            font-weight: 600;
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }

        .checklist {
            list-style: none;
        }

        .checklist li {
            padding: 0.8rem 0;
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

        .milestone-card {
            background: linear-gradient(135deg, var(--accent-green-dim), transparent);
            border: 1px solid var(--accent-green);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1rem 0;
            text-align: center;
        }

        .milestone-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--accent-green);
        }

        .milestone-label {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .warning-box {
            background: var(--accent-red-dim);
            border: 1px solid var(--accent-red);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        .warning-title {
            color: var(--accent-red);
            font-weight: 600;
            margin-bottom: 0.5rem;
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

        .compare-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1rem;
            border: 1px solid var(--border-color);
        }

        .compare-card.good {
            border-color: var(--accent-green);
        }

        .compare-card.bad {
            border-color: var(--accent-red);
        }

        .compare-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .compare-title.good { color: var(--accent-green); }
        .compare-title.bad { color: var(--accent-red); }

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

        .congrats-box {
            background: linear-gradient(135deg, var(--accent-purple-dim), var(--accent-gold-dim));
            border: 2px solid var(--accent-gold);
            border-radius: 16px;
            padding: 2rem;
            text-align: center;
            margin: 2rem 0;
        }

        .congrats-emoji {
            font-size: 3rem;
            margin-bottom: 1rem;
        }

        .congrats-title {
            font-size: 1.5rem;
            color: var(--accent-gold);
            margin-bottom: 0.5rem;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">CHƯƠNG 7 - BÀI 5/5</span>
            <h1>Từ Paper Trading Đến Giao Dịch Thật</h1>
            <p>Khi nào sẵn sàng và cách chuyển đổi an toàn</p>
        </header>

        <section class="section">
            <h2 class="section-title"><span class="icon">🎯</span> Khi Nào Sẵn Sàng Giao Dịch Thật?</h2>
            <p class="content-text">
                Đây là câu hỏi quan trọng nhất mà mọi trader mới đều đặt ra. Không có thời điểm "hoàn hảo", nhưng có
                những <strong>tiêu chí cụ thể</strong> giúp bạn biết khi nào đã sẵn sàng.
            </p>

            <div class="highlight-box gold">
                <div class="highlight-title">💡 Nguyên Tắc Vàng</div>
                <p class="content-text">
                    <strong>"Khi paper trading không còn thú vị và trở thành thói quen tự nhiên"</strong> - đó là lúc
                    bạn đã sẵn sàng cho bước tiếp theo.
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/FFBD59?text=Paper+To+Real+Trading+Journey" alt="Paper to Real Journey">
                <p class="image-caption">Hình 7.5.1: Hành trình từ Paper Trading đến Real Trading</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">✅</span> Checklist Sẵn Sàng Giao Dịch Thật</h2>
            <p class="content-text">
                Đánh dấu từng mục bên dưới. Nếu bạn hoàn thành ít nhất <strong>8/10 tiêu chí</strong>, bạn đã sẵn sàng:
            </p>

            <div class="checklist-box">
                <h3 class="checklist-title">📋 10 Tiêu Chí Sẵn Sàng</h3>
                <ul class="checklist">
                    <li><strong>Paper Trade ít nhất 30 ngày</strong> liên tục</li>
                    <li><strong>Win Rate &ge; 60%</strong> trên ít nhất 50 trades</li>
                    <li><strong>Tuân thủ 100% kỷ luật</strong> trong 2 tuần gần nhất</li>
                    <li><strong>Hiểu rõ ít nhất 3 patterns</strong> và có thể nhận diện nhanh</li>
                    <li><strong>Quản lý được cảm xúc</strong> khi trade thua liên tiếp</li>
                    <li><strong>Có Trading Journal</strong> ghi chép đầy đủ</li>
                    <li><strong>Biết tính Position Size</strong> dựa trên số vốn</li>
                    <li><strong>Có kế hoạch quản lý vốn</strong> (không risk quá 2%/trade)</li>
                    <li><strong>Có số tiền sẵn sàng mất</strong> mà không ảnh hưởng cuộc sống</li>
                    <li><strong>Đã backtest</strong> ít nhất 30 trades cho pattern chính</li>
                </ul>
            </div>

            <div class="info-grid">
                <div class="milestone-card">
                    <div class="milestone-number">30+</div>
                    <div class="milestone-label">Ngày Paper Trade</div>
                </div>
                <div class="milestone-card">
                    <div class="milestone-number">60%+</div>
                    <div class="milestone-label">Win Rate Tối Thiểu</div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">💰</span> Bắt Đầu Với Vốn Bao Nhiêu?</h2>
            <p class="content-text">
                Một trong những sai lầm lớn nhất là bắt đầu với số vốn quá lớn. Dưới đây là khuyến nghị:
            </p>

            <div class="info-grid">
                <div class="info-card">
                    <div class="info-card-title">Vốn Khởi Đầu Lý Tưởng</div>
                    <div class="info-card-value">$100-500</div>
                    <p class="content-text" style="font-size: 0.85rem; margin-top: 0.3rem;">
                        Đủ để học mà không quá đau nếu mất
                    </p>
                </div>
                <div class="info-card">
                    <div class="info-card-title">Risk/Trade Tối Đa</div>
                    <div class="info-card-value">1-2%</div>
                    <p class="content-text" style="font-size: 0.85rem; margin-top: 0.3rem;">
                        $1-10/trade với $500 vốn
                    </p>
                </div>
            </div>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Quy Tắc Vốn An Toàn</div>
                <p class="content-text">
                    Chỉ sử dụng <strong>số tiền bạn có thể mất hoàn toàn</strong> mà không ảnh hưởng đến cuộc sống.
                    Đây KHÔNG phải tiền tiết kiệm, tiền học phí, hay tiền sinh hoạt.
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/10B981?text=Capital+Management+Strategy" alt="Quản lý vốn">
                <p class="image-caption">Hình 7.5.2: Chiến lược quản lý vốn cho người mới</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📈</span> 4 Giai Đoạn Chuyển Đổi</h2>
            <p class="content-text">
                Thay vì nhảy thẳng từ paper vào real trading, hãy đi qua 4 giai đoạn sau:
            </p>

            <ol class="steps-list">
                <li>
                    <strong>Giai đoạn 1: Micro Position</strong><br>
                    Trade với $5-10/lệnh trong 2 tuần đầu. Mục tiêu: làm quen với cảm giác tiền thật.
                </li>
                <li>
                    <strong>Giai đoạn 2: Small Position</strong><br>
                    Tăng lên $20-50/lệnh sau khi có 10 trades profitable. Mục tiêu: kiểm soát cảm xúc.
                </li>
                <li>
                    <strong>Giai đoạn 3: Regular Position</strong><br>
                    Áp dụng quy tắc 1-2% risk/trade. Mục tiêu: tối ưu chiến lược.
                </li>
                <li>
                    <strong>Giai đoạn 4: Scale Up</strong><br>
                    Tăng vốn khi đã profitable 3 tháng liên tiếp. Không vội vàng!
                </li>
            </ol>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/00F0FF?text=4+Transition+Phases" alt="4 giai đoạn chuyển đổi">
                <p class="image-caption">Hình 7.5.3: Lộ trình 4 giai đoạn chuyển đổi an toàn</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🧠</span> Quản Lý Tâm Lý Khi Trade Thật</h2>
            <p class="content-text">
                Sự khác biệt lớn nhất giữa paper và real trading là <strong>yếu tố tâm lý</strong>.
                Chuẩn bị tinh thần cho những điều sau:
            </p>

            <div class="comparison-grid">
                <div class="compare-card good">
                    <div class="compare-title good">✅ Kỳ Vọng Đúng</div>
                    <ul style="color: var(--text-secondary); padding-left: 1rem;">
                        <li>Sẽ có trades thua</li>
                        <li>Cảm xúc sẽ mạnh hơn paper</li>
                        <li>Cần thời gian để thích nghi</li>
                        <li>Win rate có thể giảm ban đầu</li>
                    </ul>
                </div>
                <div class="compare-card bad">
                    <div class="compare-title bad">❌ Kỳ Vọng Sai</div>
                    <ul style="color: var(--text-secondary); padding-left: 1rem;">
                        <li>Sẽ thắng ngay từ đầu</li>
                        <li>Cảm xúc giống paper trading</li>
                        <li>Làm giàu nhanh chóng</li>
                        <li>Không bao giờ thua</li>
                    </ul>
                </div>
            </div>

            <div class="warning-box">
                <div class="warning-title">⚠️ Dấu Hiệu Cần Dừng Lại</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>Thua 3 trades liên tiếp → Nghỉ 24h</li>
                    <li>Mất 10% vốn trong 1 tuần → Review chiến lược</li>
                    <li>Không ngủ được vì lo lắng → Giảm position size</li>
                    <li>Trade revenge (gấp lại sau khi thua) → Quay về paper</li>
                </ul>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🛡️</span> Quy Tắc Bảo Vệ Vốn</h2>

            <div class="highlight-box red">
                <div class="highlight-title">🔒 Quy Tắc #1: Giới Hạn Thua</div>
                <p class="content-text">
                    Đặt giới hạn thua tối đa <strong>5%/ngày</strong> và <strong>15%/tuần</strong>.
                    Khi chạm giới hạn, DỪNG trading trong ngày/tuần đó.
                </p>
            </div>

            <div class="highlight-box purple">
                <div class="highlight-title">📊 Quy Tắc #2: Risk Management</div>
                <p class="content-text">
                    Không bao giờ risk quá <strong>2% vốn</strong> cho 1 trade.
                    Với $500 vốn → Max loss/trade = $10.
                </p>
            </div>

            <div class="highlight-box">
                <div class="highlight-title">📅 Quy Tắc #3: Review Hàng Tuần</div>
                <p class="content-text">
                    Cuối mỗi tuần, review tất cả trades: pattern nào hiệu quả, lỗi nào lặp lại,
                    và điều chỉnh cho tuần sau.
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/EF4444?text=Risk+Management+Rules" alt="Quy tắc quản lý rủi ro">
                <p class="image-caption">Hình 7.5.4: 3 quy tắc bảo vệ vốn quan trọng nhất</p>
            </div>
        </section>

        <div class="congrats-box">
            <div class="congrats-emoji">🎉</div>
            <h3 class="congrats-title">Chúc Mừng Hoàn Thành Chương 7!</h3>
            <p class="content-text">
                Bạn đã nắm vững kiến thức về Paper Trading, Backtesting, Trading Journal và sẵn sàng
                cho bước tiếp theo. Tiếp tục với Chương 8 để học cách sử dụng GEM Master AI!
            </p>
        </div>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 7.5</h3>
            <ul class="summary-list">
                <li>Cần đạt ít nhất 8/10 tiêu chí để sẵn sàng trade thật</li>
                <li>Bắt đầu với vốn nhỏ ($100-500) và risk 1-2%/trade</li>
                <li>Đi qua 4 giai đoạn chuyển đổi: Micro → Small → Regular → Scale</li>
                <li>Quản lý tâm lý là yếu tố quan trọng nhất khi trade thật</li>
                <li>Đặt giới hạn thua 5%/ngày, 15%/tuần để bảo vệ vốn</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title"><span class="icon">❓</span> Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Nên paper trade ít nhất bao nhiêu ngày trước khi chuyển sang real trading?</p>
                <button class="quiz-option" data-index="0">A. 7 ngày</button>
                <button class="quiz-option" data-index="1">B. 30 ngày</button>
                <button class="quiz-option" data-index="2">C. 3 ngày là đủ</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Risk tối đa nên là bao nhiêu % vốn cho mỗi trade?</p>
                <button class="quiz-option" data-index="0">A. 10%</button>
                <button class="quiz-option" data-index="1">B. 5%</button>
                <button class="quiz-option" data-index="2">C. 1-2%</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">3. Khi thua 3 trades liên tiếp, bạn nên làm gì?</p>
                <button class="quiz-option" data-index="0">A. Nghỉ 24 giờ</button>
                <button class="quiz-option" data-index="1">B. Trade gấp đôi để gỡ lại</button>
                <button class="quiz-option" data-index="2">C. Tiếp tục trade bình thường</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Bạn trả lời đúng <span id="correct-count">0</span>/3 câu!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Bài 7.5: Từ Paper Trading Đến Giao Dịch Thật</p>
            <p>Tiếp theo: Chương 8 - GEM Master AI Cơ Bản</p>
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
    <title>Bài 7.5: Từ Paper Trading Đến Giao Dịch Thật - GEM Trading Academy</title>
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

        .checklist-box {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1rem 0;
        }

        .checklist-title {
            color: var(--accent-gold);
            font-weight: 600;
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }

        .checklist {
            list-style: none;
        }

        .checklist li {
            padding: 0.8rem 0;
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

        .milestone-card {
            background: linear-gradient(135deg, var(--accent-green-dim), transparent);
            border: 1px solid var(--accent-green);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1rem 0;
            text-align: center;
        }

        .milestone-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--accent-green);
        }

        .milestone-label {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .warning-box {
            background: var(--accent-red-dim);
            border: 1px solid var(--accent-red);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        .warning-title {
            color: var(--accent-red);
            font-weight: 600;
            margin-bottom: 0.5rem;
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

        .compare-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1rem;
            border: 1px solid var(--border-color);
        }

        .compare-card.good {
            border-color: var(--accent-green);
        }

        .compare-card.bad {
            border-color: var(--accent-red);
        }

        .compare-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .compare-title.good { color: var(--accent-green); }
        .compare-title.bad { color: var(--accent-red); }

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

        .congrats-box {
            background: linear-gradient(135deg, var(--accent-purple-dim), var(--accent-gold-dim));
            border: 2px solid var(--accent-gold);
            border-radius: 16px;
            padding: 2rem;
            text-align: center;
            margin: 2rem 0;
        }

        .congrats-emoji {
            font-size: 3rem;
            margin-bottom: 1rem;
        }

        .congrats-title {
            font-size: 1.5rem;
            color: var(--accent-gold);
            margin-bottom: 0.5rem;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">CHƯƠNG 7 - BÀI 5/5</span>
            <h1>Từ Paper Trading Đến Giao Dịch Thật</h1>
            <p>Khi nào sẵn sàng và cách chuyển đổi an toàn</p>
        </header>

        <section class="section">
            <h2 class="section-title"><span class="icon">🎯</span> Khi Nào Sẵn Sàng Giao Dịch Thật?</h2>
            <p class="content-text">
                Đây là câu hỏi quan trọng nhất mà mọi trader mới đều đặt ra. Không có thời điểm "hoàn hảo", nhưng có
                những <strong>tiêu chí cụ thể</strong> giúp bạn biết khi nào đã sẵn sàng.
            </p>

            <div class="highlight-box gold">
                <div class="highlight-title">💡 Nguyên Tắc Vàng</div>
                <p class="content-text">
                    <strong>"Khi paper trading không còn thú vị và trở thành thói quen tự nhiên"</strong> - đó là lúc
                    bạn đã sẵn sàng cho bước tiếp theo.
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/FFBD59?text=Paper+To+Real+Trading+Journey" alt="Paper to Real Journey">
                <p class="image-caption">Hình 7.5.1: Hành trình từ Paper Trading đến Real Trading</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">✅</span> Checklist Sẵn Sàng Giao Dịch Thật</h2>
            <p class="content-text">
                Đánh dấu từng mục bên dưới. Nếu bạn hoàn thành ít nhất <strong>8/10 tiêu chí</strong>, bạn đã sẵn sàng:
            </p>

            <div class="checklist-box">
                <h3 class="checklist-title">📋 10 Tiêu Chí Sẵn Sàng</h3>
                <ul class="checklist">
                    <li><strong>Paper Trade ít nhất 30 ngày</strong> liên tục</li>
                    <li><strong>Win Rate &ge; 60%</strong> trên ít nhất 50 trades</li>
                    <li><strong>Tuân thủ 100% kỷ luật</strong> trong 2 tuần gần nhất</li>
                    <li><strong>Hiểu rõ ít nhất 3 patterns</strong> và có thể nhận diện nhanh</li>
                    <li><strong>Quản lý được cảm xúc</strong> khi trade thua liên tiếp</li>
                    <li><strong>Có Trading Journal</strong> ghi chép đầy đủ</li>
                    <li><strong>Biết tính Position Size</strong> dựa trên số vốn</li>
                    <li><strong>Có kế hoạch quản lý vốn</strong> (không risk quá 2%/trade)</li>
                    <li><strong>Có số tiền sẵn sàng mất</strong> mà không ảnh hưởng cuộc sống</li>
                    <li><strong>Đã backtest</strong> ít nhất 30 trades cho pattern chính</li>
                </ul>
            </div>

            <div class="info-grid">
                <div class="milestone-card">
                    <div class="milestone-number">30+</div>
                    <div class="milestone-label">Ngày Paper Trade</div>
                </div>
                <div class="milestone-card">
                    <div class="milestone-number">60%+</div>
                    <div class="milestone-label">Win Rate Tối Thiểu</div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">💰</span> Bắt Đầu Với Vốn Bao Nhiêu?</h2>
            <p class="content-text">
                Một trong những sai lầm lớn nhất là bắt đầu với số vốn quá lớn. Dưới đây là khuyến nghị:
            </p>

            <div class="info-grid">
                <div class="info-card">
                    <div class="info-card-title">Vốn Khởi Đầu Lý Tưởng</div>
                    <div class="info-card-value">$100-500</div>
                    <p class="content-text" style="font-size: 0.85rem; margin-top: 0.3rem;">
                        Đủ để học mà không quá đau nếu mất
                    </p>
                </div>
                <div class="info-card">
                    <div class="info-card-title">Risk/Trade Tối Đa</div>
                    <div class="info-card-value">1-2%</div>
                    <p class="content-text" style="font-size: 0.85rem; margin-top: 0.3rem;">
                        $1-10/trade với $500 vốn
                    </p>
                </div>
            </div>

            <div class="highlight-box green">
                <div class="highlight-title">✅ Quy Tắc Vốn An Toàn</div>
                <p class="content-text">
                    Chỉ sử dụng <strong>số tiền bạn có thể mất hoàn toàn</strong> mà không ảnh hưởng đến cuộc sống.
                    Đây KHÔNG phải tiền tiết kiệm, tiền học phí, hay tiền sinh hoạt.
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/10B981?text=Capital+Management+Strategy" alt="Quản lý vốn">
                <p class="image-caption">Hình 7.5.2: Chiến lược quản lý vốn cho người mới</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">📈</span> 4 Giai Đoạn Chuyển Đổi</h2>
            <p class="content-text">
                Thay vì nhảy thẳng từ paper vào real trading, hãy đi qua 4 giai đoạn sau:
            </p>

            <ol class="steps-list">
                <li>
                    <strong>Giai đoạn 1: Micro Position</strong><br>
                    Trade với $5-10/lệnh trong 2 tuần đầu. Mục tiêu: làm quen với cảm giác tiền thật.
                </li>
                <li>
                    <strong>Giai đoạn 2: Small Position</strong><br>
                    Tăng lên $20-50/lệnh sau khi có 10 trades profitable. Mục tiêu: kiểm soát cảm xúc.
                </li>
                <li>
                    <strong>Giai đoạn 3: Regular Position</strong><br>
                    Áp dụng quy tắc 1-2% risk/trade. Mục tiêu: tối ưu chiến lược.
                </li>
                <li>
                    <strong>Giai đoạn 4: Scale Up</strong><br>
                    Tăng vốn khi đã profitable 3 tháng liên tiếp. Không vội vàng!
                </li>
            </ol>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/00F0FF?text=4+Transition+Phases" alt="4 giai đoạn chuyển đổi">
                <p class="image-caption">Hình 7.5.3: Lộ trình 4 giai đoạn chuyển đổi an toàn</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🧠</span> Quản Lý Tâm Lý Khi Trade Thật</h2>
            <p class="content-text">
                Sự khác biệt lớn nhất giữa paper và real trading là <strong>yếu tố tâm lý</strong>.
                Chuẩn bị tinh thần cho những điều sau:
            </p>

            <div class="comparison-grid">
                <div class="compare-card good">
                    <div class="compare-title good">✅ Kỳ Vọng Đúng</div>
                    <ul style="color: var(--text-secondary); padding-left: 1rem;">
                        <li>Sẽ có trades thua</li>
                        <li>Cảm xúc sẽ mạnh hơn paper</li>
                        <li>Cần thời gian để thích nghi</li>
                        <li>Win rate có thể giảm ban đầu</li>
                    </ul>
                </div>
                <div class="compare-card bad">
                    <div class="compare-title bad">❌ Kỳ Vọng Sai</div>
                    <ul style="color: var(--text-secondary); padding-left: 1rem;">
                        <li>Sẽ thắng ngay từ đầu</li>
                        <li>Cảm xúc giống paper trading</li>
                        <li>Làm giàu nhanh chóng</li>
                        <li>Không bao giờ thua</li>
                    </ul>
                </div>
            </div>

            <div class="warning-box">
                <div class="warning-title">⚠️ Dấu Hiệu Cần Dừng Lại</div>
                <ul style="color: var(--text-secondary); padding-left: 1rem; margin-top: 0.5rem;">
                    <li>Thua 3 trades liên tiếp → Nghỉ 24h</li>
                    <li>Mất 10% vốn trong 1 tuần → Review chiến lược</li>
                    <li>Không ngủ được vì lo lắng → Giảm position size</li>
                    <li>Trade revenge (gấp lại sau khi thua) → Quay về paper</li>
                </ul>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span class="icon">🛡️</span> Quy Tắc Bảo Vệ Vốn</h2>

            <div class="highlight-box red">
                <div class="highlight-title">🔒 Quy Tắc #1: Giới Hạn Thua</div>
                <p class="content-text">
                    Đặt giới hạn thua tối đa <strong>5%/ngày</strong> và <strong>15%/tuần</strong>.
                    Khi chạm giới hạn, DỪNG trading trong ngày/tuần đó.
                </p>
            </div>

            <div class="highlight-box purple">
                <div class="highlight-title">📊 Quy Tắc #2: Risk Management</div>
                <p class="content-text">
                    Không bao giờ risk quá <strong>2% vốn</strong> cho 1 trade.
                    Với $500 vốn → Max loss/trade = $10.
                </p>
            </div>

            <div class="highlight-box">
                <div class="highlight-title">📅 Quy Tắc #3: Review Hàng Tuần</div>
                <p class="content-text">
                    Cuối mỗi tuần, review tất cả trades: pattern nào hiệu quả, lỗi nào lặp lại,
                    và điều chỉnh cho tuần sau.
                </p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/EF4444?text=Risk+Management+Rules" alt="Quy tắc quản lý rủi ro">
                <p class="image-caption">Hình 7.5.4: 3 quy tắc bảo vệ vốn quan trọng nhất</p>
            </div>
        </section>

        <div class="congrats-box">
            <div class="congrats-emoji">🎉</div>
            <h3 class="congrats-title">Chúc Mừng Hoàn Thành Chương 7!</h3>
            <p class="content-text">
                Bạn đã nắm vững kiến thức về Paper Trading, Backtesting, Trading Journal và sẵn sàng
                cho bước tiếp theo. Tiếp tục với Chương 8 để học cách sử dụng GEM Master AI!
            </p>
        </div>

        <div class="summary-box">
            <h3 class="summary-title">📝 Tóm Tắt Bài 7.5</h3>
            <ul class="summary-list">
                <li>Cần đạt ít nhất 8/10 tiêu chí để sẵn sàng trade thật</li>
                <li>Bắt đầu với vốn nhỏ ($100-500) và risk 1-2%/trade</li>
                <li>Đi qua 4 giai đoạn chuyển đổi: Micro → Small → Regular → Scale</li>
                <li>Quản lý tâm lý là yếu tố quan trọng nhất khi trade thật</li>
                <li>Đặt giới hạn thua 5%/ngày, 15%/tuần để bảo vệ vốn</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title"><span class="icon">❓</span> Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Nên paper trade ít nhất bao nhiêu ngày trước khi chuyển sang real trading?</p>
                <button class="quiz-option" data-index="0">A. 7 ngày</button>
                <button class="quiz-option" data-index="1">B. 30 ngày</button>
                <button class="quiz-option" data-index="2">C. 3 ngày là đủ</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Risk tối đa nên là bao nhiêu % vốn cho mỗi trade?</p>
                <button class="quiz-option" data-index="0">A. 10%</button>
                <button class="quiz-option" data-index="1">B. 5%</button>
                <button class="quiz-option" data-index="2">C. 1-2%</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">3. Khi thua 3 trades liên tiếp, bạn nên làm gì?</p>
                <button class="quiz-option" data-index="0">A. Nghỉ 24 giờ</button>
                <button class="quiz-option" data-index="1">B. Trade gấp đôi để gỡ lại</button>
                <button class="quiz-option" data-index="2">C. Tiếp tục trade bình thường</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Bạn trả lời đúng <span id="correct-count">0</span>/3 câu!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Bài 7.5: Từ Paper Trading Đến Giao Dịch Thật</p>
            <p>Tiếp theo: Chương 8 - GEM Master AI Cơ Bản</p>
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
