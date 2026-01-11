-- =====================================================
-- TIER-1 - Chương 6: Classic Patterns
-- Course: course-tier1-trading-foundation
-- File 4/23
-- =====================================================

-- Create/Update Module
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  'module-tier-1-ch6',
  'course-tier1-trading-foundation',
  'Chương 6: Classic Patterns',
  'Các mẫu hình kỹ thuật cổ điển',
  6,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Lesson 6.1: Tổng Quan Classic Patterns - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch6-l1',
  'module-tier-1-ch6',
  'course-tier1-trading-foundation',
  'Bài 6.1: Tổng Quan Classic Patterns - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 6.1: Tổng Quan Classic Patterns - GEM Trading Academy</title>
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
            color: var(--accent-purple);
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
            background: var(--accent-purple);
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

        .pattern-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .pattern-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: var(--border-color);
                border-radius: 8px;
                overflow: hidden;
            }
        }

        .pattern-card {
            background: var(--bg-secondary);
            padding: 1.25rem;
            border-radius: 12px;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .pattern-card { border-radius: 0; border: none; }
        }

        .pattern-card h4 { margin-bottom: 0.5rem; font-size: 1rem; }
        .pattern-card.continuation h4 { color: var(--accent-cyan); }
        .pattern-card.reversal h4 { color: var(--accent-gold); }

        .pattern-card p { color: var(--text-secondary); font-size: 0.9rem; margin: 0; }

        .category-box {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-cyan);
        }

        .category-box.reversal { border-left-color: var(--accent-gold); }

        .category-box h4 { margin-bottom: 0.75rem; font-size: 1.1rem; }
        .category-box.continuation h4 { color: var(--accent-cyan); }
        .category-box.reversal h4 { color: var(--accent-gold); }

        .category-box ul { list-style: none; padding: 0; margin: 0; }

        .category-box li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border-color);
        }

        .category-box li:last-child { border-bottom: none; }

        .category-box li::before {
            content: ''→'';
            position: absolute;
            left: 0;
            color: var(--accent-cyan);
        }

        .category-box.reversal li::before { color: var(--accent-gold); }

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
            <span class="lesson-badge">📚 Tier 1 - Bài 6.1</span>
            <h1>Tổng Quan Classic Patterns</h1>
            <p>Phân loại và giới thiệu các mẫu hình giá cổ điển trong trading</p>
        </header>

        <section class="section">
            <h2 class="section-title">Classic Patterns Là Gì?</h2>
            <div class="section-content">
                <p><strong>Classic Patterns</strong> là các mẫu hình giá được phát hiện và sử dụng bởi traders từ hàng thập kỷ. Chúng xuất hiện lặp đi lặp lại trên mọi thị trường và timeframe.</p>

                <img src="https://placehold.co/800x400/112250/6A5BFF?text=Classic+Patterns+Overview" alt="Classic Patterns Overview" class="image-placeholder">

                <div class="highlight-box">
                    <h4>💡 Tại Sao Classic Patterns Hoạt Động?</h4>
                    <p>Patterns phản ánh tâm lý tập thể của traders. Khi nhiều người cùng nhận ra một pattern, họ hành động tương tự → tạo ra self-fulfilling prophecy.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">2 Loại Pattern Chính</h2>
            <div class="section-content">
                <p>Classic patterns được chia thành 2 nhóm lớn dựa trên hướng đi sau khi hoàn thành:</p>

                <img src="https://placehold.co/800x350/112250/00F0FF?text=Continuation+vs+Reversal" alt="Continuation vs Reversal" class="image-placeholder">

                <div class="pattern-grid">
                    <div class="pattern-card continuation">
                        <h4>📈 Continuation Patterns</h4>
                        <p>Pattern tiếp diễn - Giá sẽ tiếp tục theo hướng trend hiện tại sau khi hoàn thành pattern.</p>
                    </div>
                    <div class="pattern-card reversal">
                        <h4>🔄 Reversal Patterns</h4>
                        <p>Pattern đảo chiều - Giá sẽ đảo ngược hướng trend hiện tại sau khi hoàn thành pattern.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Continuation Patterns Phổ Biến</h2>
            <div class="section-content">
                <p>Những pattern báo hiệu trend sẽ tiếp tục:</p>

                <img src="https://placehold.co/800x400/112250/00F0FF?text=Continuation+Patterns+Examples" alt="Continuation Patterns Examples" class="image-placeholder">

                <div class="category-box continuation">
                    <h4>📊 Continuation Patterns</h4>
                    <ul>
                        <li><strong>Flag (Cờ):</strong> Consolidation ngắn hạn trong trend mạnh</li>
                        <li><strong>Pennant (Cờ đuôi nheo):</strong> Tam giác nhỏ sau impulse move</li>
                        <li><strong>Triangle (Tam giác):</strong> Ascending, Descending, Symmetrical</li>
                        <li><strong>Rectangle (Hình chữ nhật):</strong> Sideway box với support/resistance rõ</li>
                        <li><strong>Cup & Handle:</strong> Hình tách và tay cầm trong uptrend</li>
                    </ul>
                </div>

                <div class="info-box">
                    <h4>🎯 Khi Nào Trade Continuation?</h4>
                    <p>Trade theo hướng trend hiện tại khi pattern break theo chiều trend. Ví dụ: Uptrend + Bull Flag break up = LONG.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Reversal Patterns Phổ Biến</h2>
            <div class="section-content">
                <p>Những pattern báo hiệu trend sắp đảo chiều:</p>

                <img src="https://placehold.co/800x400/112250/FFBD59?text=Reversal+Patterns+Examples" alt="Reversal Patterns Examples" class="image-placeholder">

                <div class="category-box reversal">
                    <h4>🔄 Reversal Patterns</h4>
                    <ul>
                        <li><strong>Head & Shoulders:</strong> Ba đỉnh với đỉnh giữa cao nhất</li>
                        <li><strong>Inverse Head & Shoulders:</strong> Ba đáy với đáy giữa thấp nhất</li>
                        <li><strong>Double Top (Hai đỉnh):</strong> Test đỉnh 2 lần rồi đảo xuống</li>
                        <li><strong>Double Bottom (Hai đáy):</strong> Test đáy 2 lần rồi đảo lên</li>
                        <li><strong>Triple Top/Bottom:</strong> 3 lần test đỉnh/đáy</li>
                    </ul>
                </div>

                <div class="highlight-box">
                    <h4>⚠️ Lưu Ý Quan Trọng</h4>
                    <p>Reversal patterns chỉ có giá trị khi xuất hiện sau một trend rõ ràng. Không có trend trước = không phải reversal pattern.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">So Sánh Với GEM Patterns</h2>
            <div class="section-content">
                <p>GEM Frequency Patterns (DPD, UPU, UPD, DPU) thực chất là dạng đơn giản hóa của classic patterns:</p>

                <img src="https://placehold.co/800x350/112250/10B981?text=GEM+vs+Classic+Patterns" alt="GEM vs Classic Patterns" class="image-placeholder">

                <div class="pattern-grid">
                    <div class="pattern-card continuation">
                        <h4>DPD, UPU → Continuation</h4>
                        <p>Tương tự Flag, Pennant - pattern tạm nghỉ rồi tiếp tục trend</p>
                    </div>
                    <div class="pattern-card reversal">
                        <h4>UPD, DPU → Reversal</h4>
                        <p>Tương tự Double Top/Bottom - pattern đảo chiều tại đỉnh/đáy</p>
                    </div>
                </div>

                <div class="info-box">
                    <h4>💡 Lợi Thế Của GEM Method</h4>
                    <p>GEM patterns đơn giản hơn, dễ nhận diện hơn, và có rules rõ ràng (HFZ/LFZ). Classic patterns bổ sung thêm context và confirmation.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Classic Patterns chia làm 2 loại: Continuation và Reversal</li>
                <li>Continuation: Flag, Pennant, Triangle, Rectangle, Cup & Handle</li>
                <li>Reversal: Head & Shoulders, Double Top/Bottom, Triple Top/Bottom</li>
                <li>GEM patterns (DPD, UPU, UPD, DPU) là phiên bản đơn giản hóa</li>
                <li>Kết hợp GEM + Classic patterns tăng accuracy</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="0">
                    <h4>Câu 1: Bull Flag thuộc loại pattern nào?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Continuation Pattern</div>
                        <div class="quiz-option" data-index="1">B. Reversal Pattern</div>
                        <div class="quiz-option" data-index="2">C. Cả hai</div>
                        <div class="quiz-option" data-index="3">D. Không phải pattern</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="1">
                    <h4>Câu 2: Head & Shoulders pattern cho tín hiệu gì?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Continuation (tiếp tục trend)</div>
                        <div class="quiz-option" data-index="1">B. Reversal (đảo chiều)</div>
                        <div class="quiz-option" data-index="2">C. Sideway</div>
                        <div class="quiz-option" data-index="3">D. Không xác định</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 3: DPU và UPD trong GEM method tương tự loại pattern nào?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Continuation patterns</div>
                        <div class="quiz-option" data-index="1">B. Range patterns</div>
                        <div class="quiz-option" data-index="2">C. Reversal patterns</div>
                        <div class="quiz-option" data-index="3">D. Không liên quan</div>
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
            <p>🎉 Hoàn thành <span class="highlight">Bài 6.1</span></p>
            <p>Tiếp theo: <strong>Bài 6.2 - Flag & Pennant Patterns</strong></p>
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
    <title>Bài 6.1: Tổng Quan Classic Patterns - GEM Trading Academy</title>
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
            color: var(--accent-purple);
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
            background: var(--accent-purple);
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

        .pattern-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .pattern-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: var(--border-color);
                border-radius: 8px;
                overflow: hidden;
            }
        }

        .pattern-card {
            background: var(--bg-secondary);
            padding: 1.25rem;
            border-radius: 12px;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .pattern-card { border-radius: 0; border: none; }
        }

        .pattern-card h4 { margin-bottom: 0.5rem; font-size: 1rem; }
        .pattern-card.continuation h4 { color: var(--accent-cyan); }
        .pattern-card.reversal h4 { color: var(--accent-gold); }

        .pattern-card p { color: var(--text-secondary); font-size: 0.9rem; margin: 0; }

        .category-box {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-cyan);
        }

        .category-box.reversal { border-left-color: var(--accent-gold); }

        .category-box h4 { margin-bottom: 0.75rem; font-size: 1.1rem; }
        .category-box.continuation h4 { color: var(--accent-cyan); }
        .category-box.reversal h4 { color: var(--accent-gold); }

        .category-box ul { list-style: none; padding: 0; margin: 0; }

        .category-box li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border-color);
        }

        .category-box li:last-child { border-bottom: none; }

        .category-box li::before {
            content: ''→'';
            position: absolute;
            left: 0;
            color: var(--accent-cyan);
        }

        .category-box.reversal li::before { color: var(--accent-gold); }

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
            <span class="lesson-badge">📚 Tier 1 - Bài 6.1</span>
            <h1>Tổng Quan Classic Patterns</h1>
            <p>Phân loại và giới thiệu các mẫu hình giá cổ điển trong trading</p>
        </header>

        <section class="section">
            <h2 class="section-title">Classic Patterns Là Gì?</h2>
            <div class="section-content">
                <p><strong>Classic Patterns</strong> là các mẫu hình giá được phát hiện và sử dụng bởi traders từ hàng thập kỷ. Chúng xuất hiện lặp đi lặp lại trên mọi thị trường và timeframe.</p>

                <img src="https://placehold.co/800x400/112250/6A5BFF?text=Classic+Patterns+Overview" alt="Classic Patterns Overview" class="image-placeholder">

                <div class="highlight-box">
                    <h4>💡 Tại Sao Classic Patterns Hoạt Động?</h4>
                    <p>Patterns phản ánh tâm lý tập thể của traders. Khi nhiều người cùng nhận ra một pattern, họ hành động tương tự → tạo ra self-fulfilling prophecy.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">2 Loại Pattern Chính</h2>
            <div class="section-content">
                <p>Classic patterns được chia thành 2 nhóm lớn dựa trên hướng đi sau khi hoàn thành:</p>

                <img src="https://placehold.co/800x350/112250/00F0FF?text=Continuation+vs+Reversal" alt="Continuation vs Reversal" class="image-placeholder">

                <div class="pattern-grid">
                    <div class="pattern-card continuation">
                        <h4>📈 Continuation Patterns</h4>
                        <p>Pattern tiếp diễn - Giá sẽ tiếp tục theo hướng trend hiện tại sau khi hoàn thành pattern.</p>
                    </div>
                    <div class="pattern-card reversal">
                        <h4>🔄 Reversal Patterns</h4>
                        <p>Pattern đảo chiều - Giá sẽ đảo ngược hướng trend hiện tại sau khi hoàn thành pattern.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Continuation Patterns Phổ Biến</h2>
            <div class="section-content">
                <p>Những pattern báo hiệu trend sẽ tiếp tục:</p>

                <img src="https://placehold.co/800x400/112250/00F0FF?text=Continuation+Patterns+Examples" alt="Continuation Patterns Examples" class="image-placeholder">

                <div class="category-box continuation">
                    <h4>📊 Continuation Patterns</h4>
                    <ul>
                        <li><strong>Flag (Cờ):</strong> Consolidation ngắn hạn trong trend mạnh</li>
                        <li><strong>Pennant (Cờ đuôi nheo):</strong> Tam giác nhỏ sau impulse move</li>
                        <li><strong>Triangle (Tam giác):</strong> Ascending, Descending, Symmetrical</li>
                        <li><strong>Rectangle (Hình chữ nhật):</strong> Sideway box với support/resistance rõ</li>
                        <li><strong>Cup & Handle:</strong> Hình tách và tay cầm trong uptrend</li>
                    </ul>
                </div>

                <div class="info-box">
                    <h4>🎯 Khi Nào Trade Continuation?</h4>
                    <p>Trade theo hướng trend hiện tại khi pattern break theo chiều trend. Ví dụ: Uptrend + Bull Flag break up = LONG.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Reversal Patterns Phổ Biến</h2>
            <div class="section-content">
                <p>Những pattern báo hiệu trend sắp đảo chiều:</p>

                <img src="https://placehold.co/800x400/112250/FFBD59?text=Reversal+Patterns+Examples" alt="Reversal Patterns Examples" class="image-placeholder">

                <div class="category-box reversal">
                    <h4>🔄 Reversal Patterns</h4>
                    <ul>
                        <li><strong>Head & Shoulders:</strong> Ba đỉnh với đỉnh giữa cao nhất</li>
                        <li><strong>Inverse Head & Shoulders:</strong> Ba đáy với đáy giữa thấp nhất</li>
                        <li><strong>Double Top (Hai đỉnh):</strong> Test đỉnh 2 lần rồi đảo xuống</li>
                        <li><strong>Double Bottom (Hai đáy):</strong> Test đáy 2 lần rồi đảo lên</li>
                        <li><strong>Triple Top/Bottom:</strong> 3 lần test đỉnh/đáy</li>
                    </ul>
                </div>

                <div class="highlight-box">
                    <h4>⚠️ Lưu Ý Quan Trọng</h4>
                    <p>Reversal patterns chỉ có giá trị khi xuất hiện sau một trend rõ ràng. Không có trend trước = không phải reversal pattern.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">So Sánh Với GEM Patterns</h2>
            <div class="section-content">
                <p>GEM Frequency Patterns (DPD, UPU, UPD, DPU) thực chất là dạng đơn giản hóa của classic patterns:</p>

                <img src="https://placehold.co/800x350/112250/10B981?text=GEM+vs+Classic+Patterns" alt="GEM vs Classic Patterns" class="image-placeholder">

                <div class="pattern-grid">
                    <div class="pattern-card continuation">
                        <h4>DPD, UPU → Continuation</h4>
                        <p>Tương tự Flag, Pennant - pattern tạm nghỉ rồi tiếp tục trend</p>
                    </div>
                    <div class="pattern-card reversal">
                        <h4>UPD, DPU → Reversal</h4>
                        <p>Tương tự Double Top/Bottom - pattern đảo chiều tại đỉnh/đáy</p>
                    </div>
                </div>

                <div class="info-box">
                    <h4>💡 Lợi Thế Của GEM Method</h4>
                    <p>GEM patterns đơn giản hơn, dễ nhận diện hơn, và có rules rõ ràng (HFZ/LFZ). Classic patterns bổ sung thêm context và confirmation.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Classic Patterns chia làm 2 loại: Continuation và Reversal</li>
                <li>Continuation: Flag, Pennant, Triangle, Rectangle, Cup & Handle</li>
                <li>Reversal: Head & Shoulders, Double Top/Bottom, Triple Top/Bottom</li>
                <li>GEM patterns (DPD, UPU, UPD, DPU) là phiên bản đơn giản hóa</li>
                <li>Kết hợp GEM + Classic patterns tăng accuracy</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="0">
                    <h4>Câu 1: Bull Flag thuộc loại pattern nào?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Continuation Pattern</div>
                        <div class="quiz-option" data-index="1">B. Reversal Pattern</div>
                        <div class="quiz-option" data-index="2">C. Cả hai</div>
                        <div class="quiz-option" data-index="3">D. Không phải pattern</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="1">
                    <h4>Câu 2: Head & Shoulders pattern cho tín hiệu gì?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Continuation (tiếp tục trend)</div>
                        <div class="quiz-option" data-index="1">B. Reversal (đảo chiều)</div>
                        <div class="quiz-option" data-index="2">C. Sideway</div>
                        <div class="quiz-option" data-index="3">D. Không xác định</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 3: DPU và UPD trong GEM method tương tự loại pattern nào?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Continuation patterns</div>
                        <div class="quiz-option" data-index="1">B. Range patterns</div>
                        <div class="quiz-option" data-index="2">C. Reversal patterns</div>
                        <div class="quiz-option" data-index="3">D. Không liên quan</div>
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
            <p>🎉 Hoàn thành <span class="highlight">Bài 6.1</span></p>
            <p>Tiếp theo: <strong>Bài 6.2 - Flag & Pennant Patterns</strong></p>
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

-- Lesson 6.2: Flag & Pennant Patterns - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch6-l2',
  'module-tier-1-ch6',
  'course-tier1-trading-foundation',
  'Bài 6.2: Flag & Pennant Patterns - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 6.2: Flag & Pennant Patterns - GEM Trading Academy</title>
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

        .pattern-box {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-green);
        }

        .pattern-box.bear { border-left-color: var(--accent-red); }

        .pattern-box h4 { margin-bottom: 0.75rem; font-size: 1.1rem; }
        .pattern-box.bull h4 { color: var(--accent-green); }
        .pattern-box.bear h4 { color: var(--accent-red); }

        .pattern-box p { color: var(--text-secondary); margin-bottom: 0.5rem; }

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

        .comparison-card h4 { margin-bottom: 0.5rem; font-size: 1rem; }
        .comparison-card.flag h4 { color: var(--accent-cyan); }
        .comparison-card.pennant h4 { color: var(--accent-gold); }

        .comparison-card p { color: var(--text-secondary); font-size: 0.9rem; margin: 0; }

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

        .entry-box {
            background: linear-gradient(135deg, var(--accent-green-dim), transparent);
            border: 1px solid var(--accent-green);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        .entry-box h4 { color: var(--accent-green); margin-bottom: 0.75rem; }

        .entry-box ul { list-style: none; padding: 0; }

        .entry-box li {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
        }

        .entry-box li:last-child { border-bottom: none; }

        .data-label { color: var(--text-muted); }
        .data-value { color: var(--text-primary); font-weight: 500; }
        .data-value.green { color: var(--accent-green); }
        .data-value.red { color: var(--accent-red); }
        .data-value.gold { color: var(--accent-gold); }

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
            <span class="lesson-badge">📚 Tier 1 - Bài 6.2</span>
            <h1>Flag & Pennant Patterns</h1>
            <p>Hai continuation patterns mạnh nhất trong trend trading</p>
        </header>

        <section class="section">
            <h2 class="section-title">Flag Pattern - Cờ</h2>
            <div class="section-content">
                <p><strong>Flag (Cờ)</strong> là continuation pattern xuất hiện sau một impulse move mạnh. Giá consolidate trong một channel hẹp nghiêng ngược hướng trend trước khi tiếp tục.</p>

                <img src="https://placehold.co/800x400/112250/10B981?text=Bull+Flag+Pattern" alt="Bull Flag Pattern" class="image-placeholder">

                <div class="pattern-box bull">
                    <h4>🟢 Bull Flag (Cờ Tăng)</h4>
                    <p><strong>Pole:</strong> Sóng tăng mạnh, nhanh (impulse wave)</p>
                    <p><strong>Flag:</strong> Channel giảm nhẹ (pullback 30-50% của pole)</p>
                    <p><strong>Break:</strong> Giá break lên khỏi flag → LONG</p>
                    <p><strong>Target:</strong> Chiều dài pole tính từ điểm break</p>
                </div>

                <div class="pattern-box bear">
                    <h4>🔴 Bear Flag (Cờ Giảm)</h4>
                    <p><strong>Pole:</strong> Sóng giảm mạnh, nhanh</p>
                    <p><strong>Flag:</strong> Channel tăng nhẹ (rebound 30-50%)</p>
                    <p><strong>Break:</strong> Giá break xuống khỏi flag → SHORT</p>
                    <p><strong>Target:</strong> Chiều dài pole tính từ điểm break</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Pennant Pattern - Cờ Đuôi Nheo</h2>
            <div class="section-content">
                <p><strong>Pennant (Cờ đuôi nheo)</strong> tương tự Flag nhưng consolidation có dạng tam giác hội tụ thay vì channel.</p>

                <img src="https://placehold.co/800x400/112250/FFBD59?text=Pennant+Pattern" alt="Pennant Pattern" class="image-placeholder">

                <div class="comparison-grid">
                    <div class="comparison-card flag">
                        <h4>🚩 Flag</h4>
                        <p>• Hình dạng: Channel song song</p>
                        <p>• Nghiêng ngược hướng trend</p>
                        <p>• Thời gian: 1-4 tuần</p>
                        <p>• Volume: Giảm dần trong flag</p>
                    </div>
                    <div class="comparison-card pennant">
                        <h4>🔺 Pennant</h4>
                        <p>• Hình dạng: Tam giác hội tụ</p>
                        <p>• Symmetrical (cân xứng)</p>
                        <p>• Thời gian: 1-3 tuần (ngắn hơn)</p>
                        <p>• Volume: Giảm mạnh hơn flag</p>
                    </div>
                </div>

                <div class="highlight-box">
                    <h4>💡 Điểm Chung</h4>
                    <p>Cả Flag và Pennant đều cần có <strong>Pole</strong> trước (impulse move). Không có pole = không phải Flag/Pennant. Volume phải giảm trong consolidation và spike khi break.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Cách Trade Flag & Pennant</h2>
            <div class="section-content">
                <p>Chiến lược entry và exit cho Flag/Pennant patterns:</p>

                <img src="https://placehold.co/800x400/112250/00F0FF?text=Trading+Flag+Pennant" alt="Trading Flag Pennant" class="image-placeholder">

                <div class="entry-box">
                    <h4>📈 Bull Flag Entry (Ví Dụ)</h4>
                    <ul>
                        <li><span class="data-label">Entry</span><span class="data-value green">Break trên flag resistance</span></li>
                        <li><span class="data-label">Stop Loss</span><span class="data-value red">Dưới đáy flag</span></li>
                        <li><span class="data-label">Target 1</span><span class="data-value gold">50% chiều dài pole</span></li>
                        <li><span class="data-label">Target 2</span><span class="data-value gold">100% chiều dài pole</span></li>
                        <li><span class="data-label">Confirmation</span><span class="data-value">Volume spike khi break</span></li>
                    </ul>
                </div>

                <div class="pattern-box bull">
                    <h4>📐 Tính Target Bằng Pole</h4>
                    <p><strong>Bước 1:</strong> Đo chiều dài pole (từ đáy đến đỉnh của impulse)</p>
                    <p><strong>Bước 2:</strong> Lấy breakout point + chiều dài pole = Target</p>
                    <p><strong>Ví dụ:</strong> Pole = $10, Breakout = $100 → Target = $110</p>
                </div>

                <div class="warning-box">
                    <h4>⚠️ False Break Warning</h4>
                    <p>Đợi nến đóng cửa ngoài pattern trước khi entry. Break intraday có thể là false break. Volume confirmation là must-have.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Liên Hệ Với GEM Patterns</h2>
            <div class="section-content">
                <p>Flag và Pennant rất giống với DPD và UPU trong GEM Method:</p>

                <img src="https://placehold.co/800x350/112250/6A5BFF?text=Flag+vs+GEM+Pattern" alt="Flag vs GEM Pattern" class="image-placeholder">

                <div class="comparison-grid">
                    <div class="comparison-card flag">
                        <h4>Bull Flag ≈ DPD</h4>
                        <p>• Cả hai: Tăng → Pause → Tăng tiếp</p>
                        <p>• Entry: Break resistance/HFZ</p>
                        <p>• Signal: LONG</p>
                    </div>
                    <div class="comparison-card pennant">
                        <h4>Bear Flag ≈ UPU</h4>
                        <p>• Cả hai: Giảm → Pause → Giảm tiếp</p>
                        <p>• Entry: Break support/LFZ</p>
                        <p>• Signal: SHORT</p>
                    </div>
                </div>

                <div class="highlight-box">
                    <h4>💡 Lợi Thế Kết Hợp</h4>
                    <p>Khi Flag/Pennant trùng với GEM pattern, probability tăng đáng kể. Ví dụ: Bull Flag + DPD confirmed = setup có win rate cao hơn.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Flag: Channel nghiêng ngược trend, xuất hiện sau impulse move</li>
                <li>Pennant: Tam giác hội tụ, ngắn hơn flag</li>
                <li>Cả hai cần có Pole (impulse) trước đó</li>
                <li>Target = Chiều dài pole tính từ breakout point</li>
                <li>Bull Flag ≈ DPD, Bear Flag ≈ UPU trong GEM Method</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="1">
                    <h4>Câu 1: Flag và Pennant khác nhau chủ yếu ở điểm nào?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Hướng trade</div>
                        <div class="quiz-option" data-index="1">B. Hình dạng consolidation (channel vs tam giác)</div>
                        <div class="quiz-option" data-index="2">C. Cần có pole hay không</div>
                        <div class="quiz-option" data-index="3">D. Volume</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 2: Target của Bull Flag được tính như thế nào?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Chiều rộng flag x 2</div>
                        <div class="quiz-option" data-index="1">B. ATR x 3</div>
                        <div class="quiz-option" data-index="2">C. Chiều dài pole + breakout point</div>
                        <div class="quiz-option" data-index="3">D. Fibonacci 1.618</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 3: Bull Flag tương tự pattern nào trong GEM Method?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. DPD (Down-Pause-Down tiếp)</div>
                        <div class="quiz-option" data-index="1">B. UPD (Up-Pause-Down)</div>
                        <div class="quiz-option" data-index="2">C. DPU (Down-Pause-Up)</div>
                        <div class="quiz-option" data-index="3">D. UPU (Up-Pause-Up)</div>
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
            <p>🎉 Hoàn thành <span class="highlight">Bài 6.2</span></p>
            <p>Tiếp theo: <strong>Bài 6.3 - Triangle Patterns</strong></p>
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
    <title>Bài 6.2: Flag & Pennant Patterns - GEM Trading Academy</title>
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

        .pattern-box {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-green);
        }

        .pattern-box.bear { border-left-color: var(--accent-red); }

        .pattern-box h4 { margin-bottom: 0.75rem; font-size: 1.1rem; }
        .pattern-box.bull h4 { color: var(--accent-green); }
        .pattern-box.bear h4 { color: var(--accent-red); }

        .pattern-box p { color: var(--text-secondary); margin-bottom: 0.5rem; }

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

        .comparison-card h4 { margin-bottom: 0.5rem; font-size: 1rem; }
        .comparison-card.flag h4 { color: var(--accent-cyan); }
        .comparison-card.pennant h4 { color: var(--accent-gold); }

        .comparison-card p { color: var(--text-secondary); font-size: 0.9rem; margin: 0; }

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

        .entry-box {
            background: linear-gradient(135deg, var(--accent-green-dim), transparent);
            border: 1px solid var(--accent-green);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        .entry-box h4 { color: var(--accent-green); margin-bottom: 0.75rem; }

        .entry-box ul { list-style: none; padding: 0; }

        .entry-box li {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
        }

        .entry-box li:last-child { border-bottom: none; }

        .data-label { color: var(--text-muted); }
        .data-value { color: var(--text-primary); font-weight: 500; }
        .data-value.green { color: var(--accent-green); }
        .data-value.red { color: var(--accent-red); }
        .data-value.gold { color: var(--accent-gold); }

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
            <span class="lesson-badge">📚 Tier 1 - Bài 6.2</span>
            <h1>Flag & Pennant Patterns</h1>
            <p>Hai continuation patterns mạnh nhất trong trend trading</p>
        </header>

        <section class="section">
            <h2 class="section-title">Flag Pattern - Cờ</h2>
            <div class="section-content">
                <p><strong>Flag (Cờ)</strong> là continuation pattern xuất hiện sau một impulse move mạnh. Giá consolidate trong một channel hẹp nghiêng ngược hướng trend trước khi tiếp tục.</p>

                <img src="https://placehold.co/800x400/112250/10B981?text=Bull+Flag+Pattern" alt="Bull Flag Pattern" class="image-placeholder">

                <div class="pattern-box bull">
                    <h4>🟢 Bull Flag (Cờ Tăng)</h4>
                    <p><strong>Pole:</strong> Sóng tăng mạnh, nhanh (impulse wave)</p>
                    <p><strong>Flag:</strong> Channel giảm nhẹ (pullback 30-50% của pole)</p>
                    <p><strong>Break:</strong> Giá break lên khỏi flag → LONG</p>
                    <p><strong>Target:</strong> Chiều dài pole tính từ điểm break</p>
                </div>

                <div class="pattern-box bear">
                    <h4>🔴 Bear Flag (Cờ Giảm)</h4>
                    <p><strong>Pole:</strong> Sóng giảm mạnh, nhanh</p>
                    <p><strong>Flag:</strong> Channel tăng nhẹ (rebound 30-50%)</p>
                    <p><strong>Break:</strong> Giá break xuống khỏi flag → SHORT</p>
                    <p><strong>Target:</strong> Chiều dài pole tính từ điểm break</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Pennant Pattern - Cờ Đuôi Nheo</h2>
            <div class="section-content">
                <p><strong>Pennant (Cờ đuôi nheo)</strong> tương tự Flag nhưng consolidation có dạng tam giác hội tụ thay vì channel.</p>

                <img src="https://placehold.co/800x400/112250/FFBD59?text=Pennant+Pattern" alt="Pennant Pattern" class="image-placeholder">

                <div class="comparison-grid">
                    <div class="comparison-card flag">
                        <h4>🚩 Flag</h4>
                        <p>• Hình dạng: Channel song song</p>
                        <p>• Nghiêng ngược hướng trend</p>
                        <p>• Thời gian: 1-4 tuần</p>
                        <p>• Volume: Giảm dần trong flag</p>
                    </div>
                    <div class="comparison-card pennant">
                        <h4>🔺 Pennant</h4>
                        <p>• Hình dạng: Tam giác hội tụ</p>
                        <p>• Symmetrical (cân xứng)</p>
                        <p>• Thời gian: 1-3 tuần (ngắn hơn)</p>
                        <p>• Volume: Giảm mạnh hơn flag</p>
                    </div>
                </div>

                <div class="highlight-box">
                    <h4>💡 Điểm Chung</h4>
                    <p>Cả Flag và Pennant đều cần có <strong>Pole</strong> trước (impulse move). Không có pole = không phải Flag/Pennant. Volume phải giảm trong consolidation và spike khi break.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Cách Trade Flag & Pennant</h2>
            <div class="section-content">
                <p>Chiến lược entry và exit cho Flag/Pennant patterns:</p>

                <img src="https://placehold.co/800x400/112250/00F0FF?text=Trading+Flag+Pennant" alt="Trading Flag Pennant" class="image-placeholder">

                <div class="entry-box">
                    <h4>📈 Bull Flag Entry (Ví Dụ)</h4>
                    <ul>
                        <li><span class="data-label">Entry</span><span class="data-value green">Break trên flag resistance</span></li>
                        <li><span class="data-label">Stop Loss</span><span class="data-value red">Dưới đáy flag</span></li>
                        <li><span class="data-label">Target 1</span><span class="data-value gold">50% chiều dài pole</span></li>
                        <li><span class="data-label">Target 2</span><span class="data-value gold">100% chiều dài pole</span></li>
                        <li><span class="data-label">Confirmation</span><span class="data-value">Volume spike khi break</span></li>
                    </ul>
                </div>

                <div class="pattern-box bull">
                    <h4>📐 Tính Target Bằng Pole</h4>
                    <p><strong>Bước 1:</strong> Đo chiều dài pole (từ đáy đến đỉnh của impulse)</p>
                    <p><strong>Bước 2:</strong> Lấy breakout point + chiều dài pole = Target</p>
                    <p><strong>Ví dụ:</strong> Pole = $10, Breakout = $100 → Target = $110</p>
                </div>

                <div class="warning-box">
                    <h4>⚠️ False Break Warning</h4>
                    <p>Đợi nến đóng cửa ngoài pattern trước khi entry. Break intraday có thể là false break. Volume confirmation là must-have.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Liên Hệ Với GEM Patterns</h2>
            <div class="section-content">
                <p>Flag và Pennant rất giống với DPD và UPU trong GEM Method:</p>

                <img src="https://placehold.co/800x350/112250/6A5BFF?text=Flag+vs+GEM+Pattern" alt="Flag vs GEM Pattern" class="image-placeholder">

                <div class="comparison-grid">
                    <div class="comparison-card flag">
                        <h4>Bull Flag ≈ DPD</h4>
                        <p>• Cả hai: Tăng → Pause → Tăng tiếp</p>
                        <p>• Entry: Break resistance/HFZ</p>
                        <p>• Signal: LONG</p>
                    </div>
                    <div class="comparison-card pennant">
                        <h4>Bear Flag ≈ UPU</h4>
                        <p>• Cả hai: Giảm → Pause → Giảm tiếp</p>
                        <p>• Entry: Break support/LFZ</p>
                        <p>• Signal: SHORT</p>
                    </div>
                </div>

                <div class="highlight-box">
                    <h4>💡 Lợi Thế Kết Hợp</h4>
                    <p>Khi Flag/Pennant trùng với GEM pattern, probability tăng đáng kể. Ví dụ: Bull Flag + DPD confirmed = setup có win rate cao hơn.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Flag: Channel nghiêng ngược trend, xuất hiện sau impulse move</li>
                <li>Pennant: Tam giác hội tụ, ngắn hơn flag</li>
                <li>Cả hai cần có Pole (impulse) trước đó</li>
                <li>Target = Chiều dài pole tính từ breakout point</li>
                <li>Bull Flag ≈ DPD, Bear Flag ≈ UPU trong GEM Method</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="1">
                    <h4>Câu 1: Flag và Pennant khác nhau chủ yếu ở điểm nào?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Hướng trade</div>
                        <div class="quiz-option" data-index="1">B. Hình dạng consolidation (channel vs tam giác)</div>
                        <div class="quiz-option" data-index="2">C. Cần có pole hay không</div>
                        <div class="quiz-option" data-index="3">D. Volume</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 2: Target của Bull Flag được tính như thế nào?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Chiều rộng flag x 2</div>
                        <div class="quiz-option" data-index="1">B. ATR x 3</div>
                        <div class="quiz-option" data-index="2">C. Chiều dài pole + breakout point</div>
                        <div class="quiz-option" data-index="3">D. Fibonacci 1.618</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 3: Bull Flag tương tự pattern nào trong GEM Method?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. DPD (Down-Pause-Down tiếp)</div>
                        <div class="quiz-option" data-index="1">B. UPD (Up-Pause-Down)</div>
                        <div class="quiz-option" data-index="2">C. DPU (Down-Pause-Up)</div>
                        <div class="quiz-option" data-index="3">D. UPU (Up-Pause-Up)</div>
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
            <p>🎉 Hoàn thành <span class="highlight">Bài 6.2</span></p>
            <p>Tiếp theo: <strong>Bài 6.3 - Triangle Patterns</strong></p>
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

-- Lesson 6.3: Triangle Patterns - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch6-l3',
  'module-tier-1-ch6',
  'course-tier1-trading-foundation',
  'Bài 6.3: Triangle Patterns - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 6.3: Triangle Patterns - GEM Trading Academy</title>
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

        .triangle-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .triangle-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: var(--border-color);
                border-radius: 8px;
                overflow: hidden;
            }
        }

        .triangle-card {
            background: var(--bg-secondary);
            padding: 1rem;
            border-radius: 10px;
            border: 1px solid var(--border-color);
            text-align: center;
        }

        @media (max-width: 600px) {
            .triangle-card { border-radius: 0; border: none; }
        }

        .triangle-card h4 { margin-bottom: 0.5rem; font-size: 1rem; }
        .triangle-card.ascending h4 { color: var(--accent-green); }
        .triangle-card.descending h4 { color: var(--accent-red); }
        .triangle-card.symmetrical h4 { color: var(--accent-gold); }

        .triangle-card p { color: var(--text-secondary); font-size: 0.85rem; margin: 0; }

        .pattern-box {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-green);
        }

        .pattern-box.descending { border-left-color: var(--accent-red); }
        .pattern-box.symmetrical { border-left-color: var(--accent-gold); }

        .pattern-box h4 { margin-bottom: 0.75rem; font-size: 1.1rem; }
        .pattern-box.ascending h4 { color: var(--accent-green); }
        .pattern-box.descending h4 { color: var(--accent-red); }
        .pattern-box.symmetrical h4 { color: var(--accent-gold); }

        .pattern-box p { color: var(--text-secondary); margin-bottom: 0.5rem; }

        .highlight-box {
            background: var(--accent-cyan-dim);
            border: 1px solid var(--accent-cyan);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .highlight-box { border-radius: 8px; border-left: 4px solid var(--accent-cyan); }
        }

        .highlight-box h4 { color: var(--accent-cyan); margin-bottom: 0.5rem; }
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

        .entry-box {
            background: linear-gradient(135deg, var(--accent-green-dim), transparent);
            border: 1px solid var(--accent-green);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        .entry-box h4 { color: var(--accent-green); margin-bottom: 0.75rem; }

        .entry-box ul { list-style: none; padding: 0; }

        .entry-box li {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
        }

        .entry-box li:last-child { border-bottom: none; }

        .data-label { color: var(--text-muted); }
        .data-value { color: var(--text-primary); font-weight: 500; }
        .data-value.green { color: var(--accent-green); }
        .data-value.red { color: var(--accent-red); }
        .data-value.gold { color: var(--accent-gold); }

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
            <span class="lesson-badge">📚 Tier 1 - Bài 6.3</span>
            <h1>Triangle Patterns</h1>
            <p>Ba loại tam giác và cách trade từng loại hiệu quả</p>
        </header>

        <section class="section">
            <h2 class="section-title">3 Loại Triangle Pattern</h2>
            <div class="section-content">
                <p>Triangle là một trong những continuation patterns phổ biến nhất. Có 3 loại chính, mỗi loại có đặc điểm và bias riêng:</p>

                <img src="https://placehold.co/800x400/112250/FFBD59?text=3+Triangle+Types" alt="3 Triangle Types" class="image-placeholder">

                <div class="triangle-grid">
                    <div class="triangle-card ascending">
                        <h4>📈 Ascending</h4>
                        <p>Higher lows + Flat top</p>
                        <p>Bias: Bullish</p>
                    </div>
                    <div class="triangle-card descending">
                        <h4>📉 Descending</h4>
                        <p>Flat bottom + Lower highs</p>
                        <p>Bias: Bearish</p>
                    </div>
                    <div class="triangle-card symmetrical">
                        <h4>⚖️ Symmetrical</h4>
                        <p>Higher lows + Lower highs</p>
                        <p>Bias: Neutral</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Ascending Triangle - Tam Giác Tăng</h2>
            <div class="section-content">
                <p><strong>Ascending Triangle</strong> có đỉnh phẳng (flat resistance) và đáy ngày càng cao (higher lows). Pattern này có bias bullish.</p>

                <img src="https://placehold.co/800x400/112250/10B981?text=Ascending+Triangle" alt="Ascending Triangle" class="image-placeholder">

                <div class="pattern-box ascending">
                    <h4>📈 Đặc Điểm Ascending Triangle</h4>
                    <p><strong>Resistance:</strong> Ngang (flat), test 2-3 lần</p>
                    <p><strong>Support:</strong> Đường chéo đi lên (higher lows)</p>
                    <p><strong>Bias:</strong> Bullish - 70% break lên</p>
                    <p><strong>Entry:</strong> Break trên flat resistance</p>
                    <p><strong>Target:</strong> Chiều cao tam giác (đáy đến đỉnh)</p>
                </div>

                <div class="highlight-box">
                    <h4>💡 Tâm Lý Thị Trường</h4>
                    <p>Buyers ngày càng aggressive (mua cao hơn mỗi lần). Sellers hold ở một mức cố định. Cuối cùng buyers thắng và break resistance.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Descending Triangle - Tam Giác Giảm</h2>
            <div class="section-content">
                <p><strong>Descending Triangle</strong> là bản đảo ngược của Ascending - đáy phẳng và đỉnh ngày càng thấp. Bias bearish.</p>

                <img src="https://placehold.co/800x400/112250/EF4444?text=Descending+Triangle" alt="Descending Triangle" class="image-placeholder">

                <div class="pattern-box descending">
                    <h4>📉 Đặc Điểm Descending Triangle</h4>
                    <p><strong>Support:</strong> Ngang (flat), test 2-3 lần</p>
                    <p><strong>Resistance:</strong> Đường chéo đi xuống (lower highs)</p>
                    <p><strong>Bias:</strong> Bearish - 70% break xuống</p>
                    <p><strong>Entry:</strong> Break dưới flat support</p>
                    <p><strong>Target:</strong> Chiều cao tam giác (đỉnh đến đáy)</p>
                </div>

                <div class="warning-box">
                    <h4>⚠️ Lưu Ý</h4>
                    <p>Mặc dù có bias, 30% triangles vẫn break ngược hướng. Luôn đợi confirmation và có SL.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Symmetrical Triangle - Tam Giác Cân</h2>
            <div class="section-content">
                <p><strong>Symmetrical Triangle</strong> có cả hai đường đều nghiêng về apex. Neutral - break theo hướng trend trước đó.</p>

                <img src="https://placehold.co/800x400/112250/FFBD59?text=Symmetrical+Triangle" alt="Symmetrical Triangle" class="image-placeholder">

                <div class="pattern-box symmetrical">
                    <h4>⚖️ Đặc Điểm Symmetrical Triangle</h4>
                    <p><strong>Support:</strong> Đường chéo đi lên (higher lows)</p>
                    <p><strong>Resistance:</strong> Đường chéo đi xuống (lower highs)</p>
                    <p><strong>Bias:</strong> Neutral - theo trend trước đó</p>
                    <p><strong>Entry:</strong> Chờ break một trong hai đường</p>
                    <p><strong>Target:</strong> Chiều cao tam giác tại phần rộng nhất</p>
                </div>

                <div class="highlight-box">
                    <h4>📊 Quy Tắc Symmetrical</h4>
                    <p>• Trong Uptrend → 60% break lên<br>
                    • Trong Downtrend → 60% break xuống<br>
                    • Không có trend rõ → 50/50</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Chiến Lược Trade Triangle</h2>
            <div class="section-content">
                <p>Áp dụng chung cho cả 3 loại triangle:</p>

                <img src="https://placehold.co/800x350/112250/00F0FF?text=Triangle+Trading+Strategy" alt="Triangle Trading Strategy" class="image-placeholder">

                <div class="entry-box">
                    <h4>📐 Trading Rules</h4>
                    <ul>
                        <li><span class="data-label">Entry</span><span class="data-value green">Nến đóng cửa ngoài triangle</span></li>
                        <li><span class="data-label">Confirmation</span><span class="data-value">Volume spike khi break</span></li>
                        <li><span class="data-label">Stop Loss</span><span class="data-value red">Trong triangle (opposite side)</span></li>
                        <li><span class="data-label">Target</span><span class="data-value gold">Chiều cao triangle</span></li>
                        <li><span class="data-label">Best Zone</span><span class="data-value">Break trong 2/3 đầu của triangle</span></li>
                    </ul>
                </div>

                <div class="warning-box">
                    <h4>⚠️ Apex Warning</h4>
                    <p>Nếu giá tiến quá gần apex (đỉnh nhọn) trước khi break, pattern yếu đi đáng kể. Tốt nhất break trong 2/3 đầu của pattern.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Ascending Triangle: Flat top + Higher lows → Bullish bias (70%)</li>
                <li>Descending Triangle: Flat bottom + Lower highs → Bearish bias (70%)</li>
                <li>Symmetrical Triangle: Both angled → Follows prior trend</li>
                <li>Target = Chiều cao triangle tại phần rộng nhất</li>
                <li>Break tốt nhất trong 2/3 đầu của pattern, tránh apex</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="0">
                    <h4>Câu 1: Ascending Triangle có đặc điểm gì?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Flat top + Higher lows</div>
                        <div class="quiz-option" data-index="1">B. Flat bottom + Lower highs</div>
                        <div class="quiz-option" data-index="2">C. Both angled</div>
                        <div class="quiz-option" data-index="3">D. Parallel lines</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 2: Symmetrical Triangle có bias như thế nào?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Luôn bullish</div>
                        <div class="quiz-option" data-index="1">B. Luôn bearish</div>
                        <div class="quiz-option" data-index="2">C. Theo hướng trend trước đó</div>
                        <div class="quiz-option" data-index="3">D. Không thể trade</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="1">
                    <h4>Câu 3: Triangle break tốt nhất ở vị trí nào?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Tại apex (đỉnh nhọn)</div>
                        <div class="quiz-option" data-index="1">B. Trong 2/3 đầu của pattern</div>
                        <div class="quiz-option" data-index="2">C. Ngay khi hình thành</div>
                        <div class="quiz-option" data-index="3">D. Bất kỳ vị trí nào</div>
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
            <p>🎉 Hoàn thành <span class="highlight">Bài 6.3</span></p>
            <p>Tiếp theo: <strong>Bài 6.4 - Head & Shoulders Pattern</strong></p>
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
    <title>Bài 6.3: Triangle Patterns - GEM Trading Academy</title>
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

        .triangle-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .triangle-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: var(--border-color);
                border-radius: 8px;
                overflow: hidden;
            }
        }

        .triangle-card {
            background: var(--bg-secondary);
            padding: 1rem;
            border-radius: 10px;
            border: 1px solid var(--border-color);
            text-align: center;
        }

        @media (max-width: 600px) {
            .triangle-card { border-radius: 0; border: none; }
        }

        .triangle-card h4 { margin-bottom: 0.5rem; font-size: 1rem; }
        .triangle-card.ascending h4 { color: var(--accent-green); }
        .triangle-card.descending h4 { color: var(--accent-red); }
        .triangle-card.symmetrical h4 { color: var(--accent-gold); }

        .triangle-card p { color: var(--text-secondary); font-size: 0.85rem; margin: 0; }

        .pattern-box {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-green);
        }

        .pattern-box.descending { border-left-color: var(--accent-red); }
        .pattern-box.symmetrical { border-left-color: var(--accent-gold); }

        .pattern-box h4 { margin-bottom: 0.75rem; font-size: 1.1rem; }
        .pattern-box.ascending h4 { color: var(--accent-green); }
        .pattern-box.descending h4 { color: var(--accent-red); }
        .pattern-box.symmetrical h4 { color: var(--accent-gold); }

        .pattern-box p { color: var(--text-secondary); margin-bottom: 0.5rem; }

        .highlight-box {
            background: var(--accent-cyan-dim);
            border: 1px solid var(--accent-cyan);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .highlight-box { border-radius: 8px; border-left: 4px solid var(--accent-cyan); }
        }

        .highlight-box h4 { color: var(--accent-cyan); margin-bottom: 0.5rem; }
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

        .entry-box {
            background: linear-gradient(135deg, var(--accent-green-dim), transparent);
            border: 1px solid var(--accent-green);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        .entry-box h4 { color: var(--accent-green); margin-bottom: 0.75rem; }

        .entry-box ul { list-style: none; padding: 0; }

        .entry-box li {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
        }

        .entry-box li:last-child { border-bottom: none; }

        .data-label { color: var(--text-muted); }
        .data-value { color: var(--text-primary); font-weight: 500; }
        .data-value.green { color: var(--accent-green); }
        .data-value.red { color: var(--accent-red); }
        .data-value.gold { color: var(--accent-gold); }

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
            <span class="lesson-badge">📚 Tier 1 - Bài 6.3</span>
            <h1>Triangle Patterns</h1>
            <p>Ba loại tam giác và cách trade từng loại hiệu quả</p>
        </header>

        <section class="section">
            <h2 class="section-title">3 Loại Triangle Pattern</h2>
            <div class="section-content">
                <p>Triangle là một trong những continuation patterns phổ biến nhất. Có 3 loại chính, mỗi loại có đặc điểm và bias riêng:</p>

                <img src="https://placehold.co/800x400/112250/FFBD59?text=3+Triangle+Types" alt="3 Triangle Types" class="image-placeholder">

                <div class="triangle-grid">
                    <div class="triangle-card ascending">
                        <h4>📈 Ascending</h4>
                        <p>Higher lows + Flat top</p>
                        <p>Bias: Bullish</p>
                    </div>
                    <div class="triangle-card descending">
                        <h4>📉 Descending</h4>
                        <p>Flat bottom + Lower highs</p>
                        <p>Bias: Bearish</p>
                    </div>
                    <div class="triangle-card symmetrical">
                        <h4>⚖️ Symmetrical</h4>
                        <p>Higher lows + Lower highs</p>
                        <p>Bias: Neutral</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Ascending Triangle - Tam Giác Tăng</h2>
            <div class="section-content">
                <p><strong>Ascending Triangle</strong> có đỉnh phẳng (flat resistance) và đáy ngày càng cao (higher lows). Pattern này có bias bullish.</p>

                <img src="https://placehold.co/800x400/112250/10B981?text=Ascending+Triangle" alt="Ascending Triangle" class="image-placeholder">

                <div class="pattern-box ascending">
                    <h4>📈 Đặc Điểm Ascending Triangle</h4>
                    <p><strong>Resistance:</strong> Ngang (flat), test 2-3 lần</p>
                    <p><strong>Support:</strong> Đường chéo đi lên (higher lows)</p>
                    <p><strong>Bias:</strong> Bullish - 70% break lên</p>
                    <p><strong>Entry:</strong> Break trên flat resistance</p>
                    <p><strong>Target:</strong> Chiều cao tam giác (đáy đến đỉnh)</p>
                </div>

                <div class="highlight-box">
                    <h4>💡 Tâm Lý Thị Trường</h4>
                    <p>Buyers ngày càng aggressive (mua cao hơn mỗi lần). Sellers hold ở một mức cố định. Cuối cùng buyers thắng và break resistance.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Descending Triangle - Tam Giác Giảm</h2>
            <div class="section-content">
                <p><strong>Descending Triangle</strong> là bản đảo ngược của Ascending - đáy phẳng và đỉnh ngày càng thấp. Bias bearish.</p>

                <img src="https://placehold.co/800x400/112250/EF4444?text=Descending+Triangle" alt="Descending Triangle" class="image-placeholder">

                <div class="pattern-box descending">
                    <h4>📉 Đặc Điểm Descending Triangle</h4>
                    <p><strong>Support:</strong> Ngang (flat), test 2-3 lần</p>
                    <p><strong>Resistance:</strong> Đường chéo đi xuống (lower highs)</p>
                    <p><strong>Bias:</strong> Bearish - 70% break xuống</p>
                    <p><strong>Entry:</strong> Break dưới flat support</p>
                    <p><strong>Target:</strong> Chiều cao tam giác (đỉnh đến đáy)</p>
                </div>

                <div class="warning-box">
                    <h4>⚠️ Lưu Ý</h4>
                    <p>Mặc dù có bias, 30% triangles vẫn break ngược hướng. Luôn đợi confirmation và có SL.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Symmetrical Triangle - Tam Giác Cân</h2>
            <div class="section-content">
                <p><strong>Symmetrical Triangle</strong> có cả hai đường đều nghiêng về apex. Neutral - break theo hướng trend trước đó.</p>

                <img src="https://placehold.co/800x400/112250/FFBD59?text=Symmetrical+Triangle" alt="Symmetrical Triangle" class="image-placeholder">

                <div class="pattern-box symmetrical">
                    <h4>⚖️ Đặc Điểm Symmetrical Triangle</h4>
                    <p><strong>Support:</strong> Đường chéo đi lên (higher lows)</p>
                    <p><strong>Resistance:</strong> Đường chéo đi xuống (lower highs)</p>
                    <p><strong>Bias:</strong> Neutral - theo trend trước đó</p>
                    <p><strong>Entry:</strong> Chờ break một trong hai đường</p>
                    <p><strong>Target:</strong> Chiều cao tam giác tại phần rộng nhất</p>
                </div>

                <div class="highlight-box">
                    <h4>📊 Quy Tắc Symmetrical</h4>
                    <p>• Trong Uptrend → 60% break lên<br>
                    • Trong Downtrend → 60% break xuống<br>
                    • Không có trend rõ → 50/50</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Chiến Lược Trade Triangle</h2>
            <div class="section-content">
                <p>Áp dụng chung cho cả 3 loại triangle:</p>

                <img src="https://placehold.co/800x350/112250/00F0FF?text=Triangle+Trading+Strategy" alt="Triangle Trading Strategy" class="image-placeholder">

                <div class="entry-box">
                    <h4>📐 Trading Rules</h4>
                    <ul>
                        <li><span class="data-label">Entry</span><span class="data-value green">Nến đóng cửa ngoài triangle</span></li>
                        <li><span class="data-label">Confirmation</span><span class="data-value">Volume spike khi break</span></li>
                        <li><span class="data-label">Stop Loss</span><span class="data-value red">Trong triangle (opposite side)</span></li>
                        <li><span class="data-label">Target</span><span class="data-value gold">Chiều cao triangle</span></li>
                        <li><span class="data-label">Best Zone</span><span class="data-value">Break trong 2/3 đầu của triangle</span></li>
                    </ul>
                </div>

                <div class="warning-box">
                    <h4>⚠️ Apex Warning</h4>
                    <p>Nếu giá tiến quá gần apex (đỉnh nhọn) trước khi break, pattern yếu đi đáng kể. Tốt nhất break trong 2/3 đầu của pattern.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Ascending Triangle: Flat top + Higher lows → Bullish bias (70%)</li>
                <li>Descending Triangle: Flat bottom + Lower highs → Bearish bias (70%)</li>
                <li>Symmetrical Triangle: Both angled → Follows prior trend</li>
                <li>Target = Chiều cao triangle tại phần rộng nhất</li>
                <li>Break tốt nhất trong 2/3 đầu của pattern, tránh apex</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="0">
                    <h4>Câu 1: Ascending Triangle có đặc điểm gì?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Flat top + Higher lows</div>
                        <div class="quiz-option" data-index="1">B. Flat bottom + Lower highs</div>
                        <div class="quiz-option" data-index="2">C. Both angled</div>
                        <div class="quiz-option" data-index="3">D. Parallel lines</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 2: Symmetrical Triangle có bias như thế nào?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Luôn bullish</div>
                        <div class="quiz-option" data-index="1">B. Luôn bearish</div>
                        <div class="quiz-option" data-index="2">C. Theo hướng trend trước đó</div>
                        <div class="quiz-option" data-index="3">D. Không thể trade</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="1">
                    <h4>Câu 3: Triangle break tốt nhất ở vị trí nào?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Tại apex (đỉnh nhọn)</div>
                        <div class="quiz-option" data-index="1">B. Trong 2/3 đầu của pattern</div>
                        <div class="quiz-option" data-index="2">C. Ngay khi hình thành</div>
                        <div class="quiz-option" data-index="3">D. Bất kỳ vị trí nào</div>
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
            <p>🎉 Hoàn thành <span class="highlight">Bài 6.3</span></p>
            <p>Tiếp theo: <strong>Bài 6.4 - Head & Shoulders Pattern</strong></p>
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

-- Lesson 6.4: Head & Shoulders Pattern - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch6-l4',
  'module-tier-1-ch6',
  'course-tier1-trading-foundation',
  'Bài 6.4: Head & Shoulders Pattern - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 6.4: Head & Shoulders Pattern - GEM Trading Academy</title>
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
            background: var(--accent-red-dim);
            color: var(--accent-red);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
            border: 1px solid var(--accent-red);
        }

        .lesson-header h1 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--text-primary), var(--accent-red));
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
            color: var(--accent-red);
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
            background: var(--accent-red);
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

        .pattern-box {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-red);
        }

        .pattern-box.inverse { border-left-color: var(--accent-green); }

        .pattern-box h4 { margin-bottom: 0.75rem; font-size: 1.1rem; }
        .pattern-box.standard h4 { color: var(--accent-red); }
        .pattern-box.inverse h4 { color: var(--accent-green); }

        .pattern-box p { color: var(--text-secondary); margin-bottom: 0.5rem; }

        .component-list {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        .component-list h4 { color: var(--accent-gold); margin-bottom: 0.75rem; }

        .component-list ul { list-style: none; padding: 0; }

        .component-list li {
            padding: 0.6rem 0;
            padding-left: 2rem;
            position: relative;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border-color);
        }

        .component-list li:last-child { border-bottom: none; }

        .component-list li::before {
            content: ''●'';
            position: absolute;
            left: 0;
            color: var(--accent-gold);
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

        .entry-box {
            background: linear-gradient(135deg, var(--accent-red-dim), transparent);
            border: 1px solid var(--accent-red);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        .entry-box h4 { color: var(--accent-red); margin-bottom: 0.75rem; }

        .entry-box ul { list-style: none; padding: 0; }

        .entry-box li {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
        }

        .entry-box li:last-child { border-bottom: none; }

        .data-label { color: var(--text-muted); }
        .data-value { color: var(--text-primary); font-weight: 500; }
        .data-value.green { color: var(--accent-green); }
        .data-value.red { color: var(--accent-red); }
        .data-value.gold { color: var(--accent-gold); }

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
            <span class="lesson-badge">📚 Tier 1 - Bài 6.4</span>
            <h1>Head & Shoulders Pattern</h1>
            <p>Pattern đảo chiều mạnh nhất trong Technical Analysis</p>
        </header>

        <section class="section">
            <h2 class="section-title">Head & Shoulders Là Gì?</h2>
            <div class="section-content">
                <p><strong>Head & Shoulders (H&S)</strong> là reversal pattern cổ điển nhất và có độ tin cậy cao nhất. Pattern này báo hiệu sự kết thúc của uptrend và bắt đầu downtrend mới.</p>

                <img src="https://placehold.co/800x400/112250/EF4444?text=Head+and+Shoulders+Pattern" alt="Head and Shoulders Pattern" class="image-placeholder">

                <div class="component-list">
                    <h4>🎯 Các Thành Phần H&S</h4>
                    <ul>
                        <li><strong>Left Shoulder:</strong> Đỉnh đầu tiên, pullback về neckline</li>
                        <li><strong>Head:</strong> Đỉnh cao nhất, pullback về neckline</li>
                        <li><strong>Right Shoulder:</strong> Đỉnh thấp hơn head, break neckline</li>
                        <li><strong>Neckline:</strong> Đường nối 2 đáy giữa các đỉnh</li>
                    </ul>
                </div>

                <div class="highlight-box">
                    <h4>💡 Ý Nghĩa Tâm Lý</h4>
                    <p>Bulls thất bại trong việc đẩy giá lên cao mới (right shoulder < head). Bears bắt đầu chiếm ưu thế. Break neckline = confirm đảo chiều.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Standard H&S - Bearish Reversal</h2>
            <div class="section-content">
                <p><strong>Standard H&S</strong> xuất hiện ở đỉnh uptrend, báo hiệu đảo chiều xuống:</p>

                <img src="https://placehold.co/800x400/112250/EF4444?text=Standard+H%26S+Bearish" alt="Standard H&S Bearish" class="image-placeholder">

                <div class="pattern-box standard">
                    <h4>📉 Standard H&S (Bearish)</h4>
                    <p><strong>Điều kiện:</strong> Xuất hiện sau uptrend rõ ràng</p>
                    <p><strong>Signal:</strong> SHORT khi break neckline</p>
                    <p><strong>Volume:</strong> Giảm dần từ left shoulder → head → right shoulder</p>
                    <p><strong>Target:</strong> Khoảng cách từ head đến neckline</p>
                </div>

                <div class="entry-box">
                    <h4>📊 Trading Setup</h4>
                    <ul>
                        <li><span class="data-label">Entry</span><span class="data-value red">Break dưới neckline</span></li>
                        <li><span class="data-label">Stop Loss</span><span class="data-value">Trên right shoulder</span></li>
                        <li><span class="data-label">Target</span><span class="data-value gold">Head → Neckline distance</span></li>
                        <li><span class="data-label">Confirmation</span><span class="data-value">Volume spike khi break</span></li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Inverse H&S - Bullish Reversal</h2>
            <div class="section-content">
                <p><strong>Inverse H&S</strong> là bản đảo ngược, xuất hiện ở đáy downtrend, báo hiệu đảo chiều lên:</p>

                <img src="https://placehold.co/800x400/112250/10B981?text=Inverse+H%26S+Bullish" alt="Inverse H&S Bullish" class="image-placeholder">

                <div class="pattern-box inverse">
                    <h4>📈 Inverse H&S (Bullish)</h4>
                    <p><strong>Điều kiện:</strong> Xuất hiện sau downtrend rõ ràng</p>
                    <p><strong>Signal:</strong> LONG khi break neckline</p>
                    <p><strong>Volume:</strong> Tăng dần, đặc biệt khi break</p>
                    <p><strong>Target:</strong> Khoảng cách từ head đến neckline</p>
                </div>

                <div class="highlight-box">
                    <h4>📊 So Sánh Với GEM Patterns</h4>
                    <p>• Standard H&S ≈ UPD (đảo chiều từ uptrend)<br>
                    • Inverse H&S ≈ DPU (đảo chiều từ downtrend)<br>
                    • Kết hợp cả hai hệ thống tăng confirmation</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Cách Tính Target</h2>
            <div class="section-content">
                <p>Target được tính từ khoảng cách head đến neckline:</p>

                <img src="https://placehold.co/800x350/112250/FFBD59?text=H%26S+Target+Calculation" alt="H&S Target Calculation" class="image-placeholder">

                <div class="component-list">
                    <h4>📐 Công Thức Target</h4>
                    <ul>
                        <li><strong>Bước 1:</strong> Đo khoảng cách từ Head đến Neckline (= D)</li>
                        <li><strong>Bước 2:</strong> Target = Breakout Point ± D</li>
                        <li><strong>Ví dụ Standard:</strong> Head $100, Neckline $90, D = $10 → Target = $90 - $10 = $80</li>
                        <li><strong>Ví dụ Inverse:</strong> Head $50, Neckline $60, D = $10 → Target = $60 + $10 = $70</li>
                    </ul>
                </div>

                <div class="warning-box">
                    <h4>⚠️ Lưu Ý Quan Trọng</h4>
                    <p>Target là mức tối thiểu, giá có thể đi xa hơn. Sử dụng partial profit: 50% tại target, trailing stop cho 50% còn lại.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Volume Confirmation</h2>
            <div class="section-content">
                <p>Volume đóng vai trò quan trọng trong việc xác nhận H&S:</p>

                <img src="https://placehold.co/800x300/112250/00F0FF?text=H%26S+Volume+Pattern" alt="H&S Volume Pattern" class="image-placeholder">

                <div class="pattern-box standard">
                    <h4>📊 Volume Trong Standard H&S</h4>
                    <p><strong>Left Shoulder:</strong> Volume cao nhất</p>
                    <p><strong>Head:</strong> Volume thấp hơn (cảnh báo)</p>
                    <p><strong>Right Shoulder:</strong> Volume thấp nhất</p>
                    <p><strong>Breakout:</strong> Volume spike mạnh → confirm</p>
                </div>

                <div class="highlight-box">
                    <h4>💡 Volume Divergence</h4>
                    <p>Giá tạo đỉnh cao hơn (head) nhưng volume thấp hơn = bearish divergence, báo hiệu sức mạnh uptrend đang suy yếu.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>H&S gồm 4 phần: Left Shoulder, Head, Right Shoulder, Neckline</li>
                <li>Standard H&S: Bearish reversal, SHORT khi break neckline</li>
                <li>Inverse H&S: Bullish reversal, LONG khi break neckline</li>
                <li>Target = Khoảng cách từ Head đến Neckline</li>
                <li>Volume phải giảm dần và spike khi breakout</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="1">
                    <h4>Câu 1: Standard H&S xuất hiện ở đâu và cho tín hiệu gì?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Đáy downtrend, LONG</div>
                        <div class="quiz-option" data-index="1">B. Đỉnh uptrend, SHORT</div>
                        <div class="quiz-option" data-index="2">C. Giữa sideway, không trade</div>
                        <div class="quiz-option" data-index="3">D. Bất kỳ đâu, LONG hoặc SHORT</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 2: Target của H&S được tính như thế nào?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Chiều rộng pattern x 2</div>
                        <div class="quiz-option" data-index="1">B. ATR x 3</div>
                        <div class="quiz-option" data-index="2">C. Khoảng cách từ Head đến Neckline</div>
                        <div class="quiz-option" data-index="3">D. Fibonacci 1.618</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 3: Volume trong Standard H&S có đặc điểm gì?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Giảm dần từ Left Shoulder → Head → Right Shoulder</div>
                        <div class="quiz-option" data-index="1">B. Tăng dần</div>
                        <div class="quiz-option" data-index="2">C. Không thay đổi</div>
                        <div class="quiz-option" data-index="3">D. Head có volume cao nhất</div>
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
            <p>🎉 Hoàn thành <span class="highlight">Bài 6.4</span></p>
            <p>Tiếp theo: <strong>Bài 6.5 - Double Top & Double Bottom</strong></p>
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
    <title>Bài 6.4: Head & Shoulders Pattern - GEM Trading Academy</title>
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
            background: var(--accent-red-dim);
            color: var(--accent-red);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
            border: 1px solid var(--accent-red);
        }

        .lesson-header h1 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--text-primary), var(--accent-red));
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
            color: var(--accent-red);
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
            background: var(--accent-red);
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

        .pattern-box {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-red);
        }

        .pattern-box.inverse { border-left-color: var(--accent-green); }

        .pattern-box h4 { margin-bottom: 0.75rem; font-size: 1.1rem; }
        .pattern-box.standard h4 { color: var(--accent-red); }
        .pattern-box.inverse h4 { color: var(--accent-green); }

        .pattern-box p { color: var(--text-secondary); margin-bottom: 0.5rem; }

        .component-list {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        .component-list h4 { color: var(--accent-gold); margin-bottom: 0.75rem; }

        .component-list ul { list-style: none; padding: 0; }

        .component-list li {
            padding: 0.6rem 0;
            padding-left: 2rem;
            position: relative;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border-color);
        }

        .component-list li:last-child { border-bottom: none; }

        .component-list li::before {
            content: ''●'';
            position: absolute;
            left: 0;
            color: var(--accent-gold);
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

        .entry-box {
            background: linear-gradient(135deg, var(--accent-red-dim), transparent);
            border: 1px solid var(--accent-red);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        .entry-box h4 { color: var(--accent-red); margin-bottom: 0.75rem; }

        .entry-box ul { list-style: none; padding: 0; }

        .entry-box li {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
        }

        .entry-box li:last-child { border-bottom: none; }

        .data-label { color: var(--text-muted); }
        .data-value { color: var(--text-primary); font-weight: 500; }
        .data-value.green { color: var(--accent-green); }
        .data-value.red { color: var(--accent-red); }
        .data-value.gold { color: var(--accent-gold); }

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
            <span class="lesson-badge">📚 Tier 1 - Bài 6.4</span>
            <h1>Head & Shoulders Pattern</h1>
            <p>Pattern đảo chiều mạnh nhất trong Technical Analysis</p>
        </header>

        <section class="section">
            <h2 class="section-title">Head & Shoulders Là Gì?</h2>
            <div class="section-content">
                <p><strong>Head & Shoulders (H&S)</strong> là reversal pattern cổ điển nhất và có độ tin cậy cao nhất. Pattern này báo hiệu sự kết thúc của uptrend và bắt đầu downtrend mới.</p>

                <img src="https://placehold.co/800x400/112250/EF4444?text=Head+and+Shoulders+Pattern" alt="Head and Shoulders Pattern" class="image-placeholder">

                <div class="component-list">
                    <h4>🎯 Các Thành Phần H&S</h4>
                    <ul>
                        <li><strong>Left Shoulder:</strong> Đỉnh đầu tiên, pullback về neckline</li>
                        <li><strong>Head:</strong> Đỉnh cao nhất, pullback về neckline</li>
                        <li><strong>Right Shoulder:</strong> Đỉnh thấp hơn head, break neckline</li>
                        <li><strong>Neckline:</strong> Đường nối 2 đáy giữa các đỉnh</li>
                    </ul>
                </div>

                <div class="highlight-box">
                    <h4>💡 Ý Nghĩa Tâm Lý</h4>
                    <p>Bulls thất bại trong việc đẩy giá lên cao mới (right shoulder < head). Bears bắt đầu chiếm ưu thế. Break neckline = confirm đảo chiều.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Standard H&S - Bearish Reversal</h2>
            <div class="section-content">
                <p><strong>Standard H&S</strong> xuất hiện ở đỉnh uptrend, báo hiệu đảo chiều xuống:</p>

                <img src="https://placehold.co/800x400/112250/EF4444?text=Standard+H%26S+Bearish" alt="Standard H&S Bearish" class="image-placeholder">

                <div class="pattern-box standard">
                    <h4>📉 Standard H&S (Bearish)</h4>
                    <p><strong>Điều kiện:</strong> Xuất hiện sau uptrend rõ ràng</p>
                    <p><strong>Signal:</strong> SHORT khi break neckline</p>
                    <p><strong>Volume:</strong> Giảm dần từ left shoulder → head → right shoulder</p>
                    <p><strong>Target:</strong> Khoảng cách từ head đến neckline</p>
                </div>

                <div class="entry-box">
                    <h4>📊 Trading Setup</h4>
                    <ul>
                        <li><span class="data-label">Entry</span><span class="data-value red">Break dưới neckline</span></li>
                        <li><span class="data-label">Stop Loss</span><span class="data-value">Trên right shoulder</span></li>
                        <li><span class="data-label">Target</span><span class="data-value gold">Head → Neckline distance</span></li>
                        <li><span class="data-label">Confirmation</span><span class="data-value">Volume spike khi break</span></li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Inverse H&S - Bullish Reversal</h2>
            <div class="section-content">
                <p><strong>Inverse H&S</strong> là bản đảo ngược, xuất hiện ở đáy downtrend, báo hiệu đảo chiều lên:</p>

                <img src="https://placehold.co/800x400/112250/10B981?text=Inverse+H%26S+Bullish" alt="Inverse H&S Bullish" class="image-placeholder">

                <div class="pattern-box inverse">
                    <h4>📈 Inverse H&S (Bullish)</h4>
                    <p><strong>Điều kiện:</strong> Xuất hiện sau downtrend rõ ràng</p>
                    <p><strong>Signal:</strong> LONG khi break neckline</p>
                    <p><strong>Volume:</strong> Tăng dần, đặc biệt khi break</p>
                    <p><strong>Target:</strong> Khoảng cách từ head đến neckline</p>
                </div>

                <div class="highlight-box">
                    <h4>📊 So Sánh Với GEM Patterns</h4>
                    <p>• Standard H&S ≈ UPD (đảo chiều từ uptrend)<br>
                    • Inverse H&S ≈ DPU (đảo chiều từ downtrend)<br>
                    • Kết hợp cả hai hệ thống tăng confirmation</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Cách Tính Target</h2>
            <div class="section-content">
                <p>Target được tính từ khoảng cách head đến neckline:</p>

                <img src="https://placehold.co/800x350/112250/FFBD59?text=H%26S+Target+Calculation" alt="H&S Target Calculation" class="image-placeholder">

                <div class="component-list">
                    <h4>📐 Công Thức Target</h4>
                    <ul>
                        <li><strong>Bước 1:</strong> Đo khoảng cách từ Head đến Neckline (= D)</li>
                        <li><strong>Bước 2:</strong> Target = Breakout Point ± D</li>
                        <li><strong>Ví dụ Standard:</strong> Head $100, Neckline $90, D = $10 → Target = $90 - $10 = $80</li>
                        <li><strong>Ví dụ Inverse:</strong> Head $50, Neckline $60, D = $10 → Target = $60 + $10 = $70</li>
                    </ul>
                </div>

                <div class="warning-box">
                    <h4>⚠️ Lưu Ý Quan Trọng</h4>
                    <p>Target là mức tối thiểu, giá có thể đi xa hơn. Sử dụng partial profit: 50% tại target, trailing stop cho 50% còn lại.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Volume Confirmation</h2>
            <div class="section-content">
                <p>Volume đóng vai trò quan trọng trong việc xác nhận H&S:</p>

                <img src="https://placehold.co/800x300/112250/00F0FF?text=H%26S+Volume+Pattern" alt="H&S Volume Pattern" class="image-placeholder">

                <div class="pattern-box standard">
                    <h4>📊 Volume Trong Standard H&S</h4>
                    <p><strong>Left Shoulder:</strong> Volume cao nhất</p>
                    <p><strong>Head:</strong> Volume thấp hơn (cảnh báo)</p>
                    <p><strong>Right Shoulder:</strong> Volume thấp nhất</p>
                    <p><strong>Breakout:</strong> Volume spike mạnh → confirm</p>
                </div>

                <div class="highlight-box">
                    <h4>💡 Volume Divergence</h4>
                    <p>Giá tạo đỉnh cao hơn (head) nhưng volume thấp hơn = bearish divergence, báo hiệu sức mạnh uptrend đang suy yếu.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>H&S gồm 4 phần: Left Shoulder, Head, Right Shoulder, Neckline</li>
                <li>Standard H&S: Bearish reversal, SHORT khi break neckline</li>
                <li>Inverse H&S: Bullish reversal, LONG khi break neckline</li>
                <li>Target = Khoảng cách từ Head đến Neckline</li>
                <li>Volume phải giảm dần và spike khi breakout</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="1">
                    <h4>Câu 1: Standard H&S xuất hiện ở đâu và cho tín hiệu gì?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Đáy downtrend, LONG</div>
                        <div class="quiz-option" data-index="1">B. Đỉnh uptrend, SHORT</div>
                        <div class="quiz-option" data-index="2">C. Giữa sideway, không trade</div>
                        <div class="quiz-option" data-index="3">D. Bất kỳ đâu, LONG hoặc SHORT</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 2: Target của H&S được tính như thế nào?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Chiều rộng pattern x 2</div>
                        <div class="quiz-option" data-index="1">B. ATR x 3</div>
                        <div class="quiz-option" data-index="2">C. Khoảng cách từ Head đến Neckline</div>
                        <div class="quiz-option" data-index="3">D. Fibonacci 1.618</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 3: Volume trong Standard H&S có đặc điểm gì?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Giảm dần từ Left Shoulder → Head → Right Shoulder</div>
                        <div class="quiz-option" data-index="1">B. Tăng dần</div>
                        <div class="quiz-option" data-index="2">C. Không thay đổi</div>
                        <div class="quiz-option" data-index="3">D. Head có volume cao nhất</div>
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
            <p>🎉 Hoàn thành <span class="highlight">Bài 6.4</span></p>
            <p>Tiếp theo: <strong>Bài 6.5 - Double Top & Double Bottom</strong></p>
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

-- Lesson 6.5: Double Top & Double Bottom - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch6-l5',
  'module-tier-1-ch6',
  'course-tier1-trading-foundation',
  'Bài 6.5: Double Top & Double Bottom - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 6.5: Double Top & Double Bottom - GEM Trading Academy</title>
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
            color: var(--accent-purple);
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
            background: var(--accent-purple);
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
            padding: 1.25rem;
            border-radius: 12px;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .comparison-card { border-radius: 0; border: none; }
        }

        .comparison-card h4 { margin-bottom: 0.75rem; font-size: 1.05rem; }
        .comparison-card.top h4 { color: var(--accent-red); }
        .comparison-card.bottom h4 { color: var(--accent-green); }

        .comparison-card p { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; }

        .pattern-box {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-red);
        }

        .pattern-box.bottom { border-left-color: var(--accent-green); }

        .pattern-box h4 { margin-bottom: 0.75rem; font-size: 1.1rem; }
        .pattern-box.top h4 { color: var(--accent-red); }
        .pattern-box.bottom h4 { color: var(--accent-green); }

        .pattern-box p { color: var(--text-secondary); margin-bottom: 0.5rem; }

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

        .entry-box {
            background: linear-gradient(135deg, var(--accent-cyan-dim), transparent);
            border: 1px solid var(--accent-cyan);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        .entry-box h4 { color: var(--accent-cyan); margin-bottom: 0.75rem; }

        .entry-box ul { list-style: none; padding: 0; }

        .entry-box li {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
        }

        .entry-box li:last-child { border-bottom: none; }

        .data-label { color: var(--text-muted); }
        .data-value { color: var(--text-primary); font-weight: 500; }
        .data-value.green { color: var(--accent-green); }
        .data-value.red { color: var(--accent-red); }
        .data-value.gold { color: var(--accent-gold); }

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
            <span class="lesson-badge">📚 Tier 1 - Bài 6.5</span>
            <h1>Double Top & Double Bottom</h1>
            <p>Patterns đảo chiều phổ biến nhất trong trading</p>
        </header>

        <section class="section">
            <h2 class="section-title">Tổng Quan Double Patterns</h2>
            <div class="section-content">
                <p><strong>Double Top</strong> và <strong>Double Bottom</strong> là reversal patterns dễ nhận diện nhất và rất phổ biến trên mọi thị trường.</p>

                <img src="https://placehold.co/800x400/112250/6A5BFF?text=Double+Top+and+Bottom" alt="Double Top and Bottom" class="image-placeholder">

                <div class="comparison-grid">
                    <div class="comparison-card top">
                        <h4>🔻 Double Top</h4>
                        <p>• Hình chữ "M"</p>
                        <p>• Xuất hiện sau uptrend</p>
                        <p>• Báo hiệu đảo chiều xuống</p>
                        <p>• Signal: SHORT</p>
                    </div>
                    <div class="comparison-card bottom">
                        <h4>🔺 Double Bottom</h4>
                        <p>• Hình chữ "W"</p>
                        <p>• Xuất hiện sau downtrend</p>
                        <p>• Báo hiệu đảo chiều lên</p>
                        <p>• Signal: LONG</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Double Top - Hai Đỉnh</h2>
            <div class="section-content">
                <p><strong>Double Top</strong> hình thành khi giá test đỉnh 2 lần nhưng không thể vượt qua:</p>

                <img src="https://placehold.co/800x400/112250/EF4444?text=Double+Top+Pattern" alt="Double Top Pattern" class="image-placeholder">

                <div class="pattern-box top">
                    <h4>📉 Đặc Điểm Double Top</h4>
                    <p><strong>Đỉnh 1:</strong> Giá tạo high mới trong uptrend</p>
                    <p><strong>Pullback:</strong> Giá điều chỉnh xuống, tạo neckline</p>
                    <p><strong>Đỉnh 2:</strong> Test lại đỉnh 1 nhưng không vượt qua (±1-2%)</p>
                    <p><strong>Break:</strong> Phá vỡ neckline xuống = SHORT signal</p>
                </div>

                <div class="highlight-box">
                    <h4>💡 Tâm Lý Thị Trường</h4>
                    <p>Bulls cố gắng đẩy giá lên cao mới 2 lần nhưng thất bại. Mỗi lần thất bại làm suy yếu momentum. Khi break neckline, bears chiếm ưu thế.</p>
                </div>

                <div class="entry-box">
                    <h4>📊 Double Top Trading Setup</h4>
                    <ul>
                        <li><span class="data-label">Entry</span><span class="data-value red">Break dưới neckline</span></li>
                        <li><span class="data-label">Stop Loss</span><span class="data-value">Trên đỉnh 2 (+ buffer)</span></li>
                        <li><span class="data-label">Target</span><span class="data-value gold">Chiều cao pattern (đỉnh → neckline)</span></li>
                        <li><span class="data-label">Volume</span><span class="data-value">Đỉnh 2 volume < Đỉnh 1</span></li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Double Bottom - Hai Đáy</h2>
            <div class="section-content">
                <p><strong>Double Bottom</strong> là bản đảo ngược - giá test đáy 2 lần rồi đảo chiều lên:</p>

                <img src="https://placehold.co/800x400/112250/10B981?text=Double+Bottom+Pattern" alt="Double Bottom Pattern" class="image-placeholder">

                <div class="pattern-box bottom">
                    <h4>📈 Đặc Điểm Double Bottom</h4>
                    <p><strong>Đáy 1:</strong> Giá tạo low mới trong downtrend</p>
                    <p><strong>Bounce:</strong> Giá hồi phục lên, tạo neckline</p>
                    <p><strong>Đáy 2:</strong> Test lại đáy 1 nhưng không phá (±1-2%)</p>
                    <p><strong>Break:</strong> Phá vỡ neckline lên = LONG signal</p>
                </div>

                <div class="entry-box">
                    <h4>📊 Double Bottom Trading Setup</h4>
                    <ul>
                        <li><span class="data-label">Entry</span><span class="data-value green">Break trên neckline</span></li>
                        <li><span class="data-label">Stop Loss</span><span class="data-value">Dưới đáy 2 (+ buffer)</span></li>
                        <li><span class="data-label">Target</span><span class="data-value gold">Chiều cao pattern (neckline → đáy)</span></li>
                        <li><span class="data-label">Volume</span><span class="data-value">Đáy 2 volume có thể tăng nhẹ (bullish)</span></li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Validation Rules</h2>
            <div class="section-content">
                <p>Không phải pattern nào trông giống Double Top/Bottom cũng valid. Kiểm tra các tiêu chí sau:</p>

                <img src="https://placehold.co/800x350/112250/FFBD59?text=Validation+Criteria" alt="Validation Criteria" class="image-placeholder">

                <div class="pattern-box top">
                    <h4>✅ Tiêu Chí Validation</h4>
                    <p><strong>1. Trend trước đó:</strong> Phải có uptrend (Double Top) hoặc downtrend (Double Bottom) rõ ràng</p>
                    <p><strong>2. Khoảng cách 2 đỉnh/đáy:</strong> Tương đương nhau (±1-3%)</p>
                    <p><strong>3. Thời gian:</strong> Đủ xa nhau (ít nhất vài nến), không quá gần</p>
                    <p><strong>4. Volume:</strong> Giảm ở đỉnh/đáy 2 so với đỉnh/đáy 1</p>
                </div>

                <div class="warning-box">
                    <h4>⚠️ Invalid Patterns</h4>
                    <p>• Hai đỉnh/đáy quá gần nhau (< 5 nến) → có thể chỉ là noise<br>
                    • Chênh lệch quá lớn (> 5%) → không phải double pattern<br>
                    • Không có trend trước đó → không phải reversal</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Liên Hệ Với GEM Patterns</h2>
            <div class="section-content">
                <p>Double patterns rất tương đồng với UPD và DPU trong GEM Method:</p>

                <img src="https://placehold.co/800x300/112250/00F0FF?text=Double+vs+GEM+Patterns" alt="Double vs GEM Patterns" class="image-placeholder">

                <div class="comparison-grid">
                    <div class="comparison-card top">
                        <h4>Double Top ≈ UPD</h4>
                        <p>• Cả hai: Test đỉnh → Thất bại → Đảo xuống</p>
                        <p>• UPD có HFZ = Neckline của Double Top</p>
                        <p>• Kết hợp cả hai tăng confidence</p>
                    </div>
                    <div class="comparison-card bottom">
                        <h4>Double Bottom ≈ DPU</h4>
                        <p>• Cả hai: Test đáy → Giữ được → Đảo lên</p>
                        <p>• DPU có LFZ = Neckline của Double Bottom</p>
                        <p>• Kết hợp cả hai tăng confidence</p>
                    </div>
                </div>

                <div class="highlight-box">
                    <h4>💡 Best Practice</h4>
                    <p>Khi Double Top/Bottom trùng với UPD/DPU setup trên GEM Method, đó là high probability trade. Entry với size lớn hơn.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Double Top (M): Test đỉnh 2 lần, fail, SHORT khi break neckline</li>
                <li>Double Bottom (W): Test đáy 2 lần, hold, LONG khi break neckline</li>
                <li>Target = Chiều cao pattern từ đỉnh/đáy đến neckline</li>
                <li>Volume phải giảm ở đỉnh/đáy thứ 2</li>
                <li>Double Top ≈ UPD, Double Bottom ≈ DPU trong GEM Method</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="0">
                    <h4>Câu 1: Double Top có hình dạng giống chữ gì?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Chữ M</div>
                        <div class="quiz-option" data-index="1">B. Chữ W</div>
                        <div class="quiz-option" data-index="2">C. Chữ V</div>
                        <div class="quiz-option" data-index="3">D. Chữ U</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 2: Đặc điểm volume ở đỉnh 2 của Double Top?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Cao hơn đỉnh 1</div>
                        <div class="quiz-option" data-index="1">B. Bằng đỉnh 1</div>
                        <div class="quiz-option" data-index="2">C. Thấp hơn đỉnh 1</div>
                        <div class="quiz-option" data-index="3">D. Không quan trọng</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="1">
                    <h4>Câu 3: Double Bottom tương đương với pattern nào trong GEM Method?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. UPD</div>
                        <div class="quiz-option" data-index="1">B. DPU</div>
                        <div class="quiz-option" data-index="2">C. DPD</div>
                        <div class="quiz-option" data-index="3">D. UPU</div>
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
            <p>🎉 Hoàn thành <span class="highlight">Bài 6.5</span></p>
            <p>Tiếp theo: <strong>Bài 6.6 - Classic Patterns Tổng Kết</strong></p>
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
    <title>Bài 6.5: Double Top & Double Bottom - GEM Trading Academy</title>
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
            color: var(--accent-purple);
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
            background: var(--accent-purple);
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
            padding: 1.25rem;
            border-radius: 12px;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .comparison-card { border-radius: 0; border: none; }
        }

        .comparison-card h4 { margin-bottom: 0.75rem; font-size: 1.05rem; }
        .comparison-card.top h4 { color: var(--accent-red); }
        .comparison-card.bottom h4 { color: var(--accent-green); }

        .comparison-card p { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; }

        .pattern-box {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-red);
        }

        .pattern-box.bottom { border-left-color: var(--accent-green); }

        .pattern-box h4 { margin-bottom: 0.75rem; font-size: 1.1rem; }
        .pattern-box.top h4 { color: var(--accent-red); }
        .pattern-box.bottom h4 { color: var(--accent-green); }

        .pattern-box p { color: var(--text-secondary); margin-bottom: 0.5rem; }

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

        .entry-box {
            background: linear-gradient(135deg, var(--accent-cyan-dim), transparent);
            border: 1px solid var(--accent-cyan);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        .entry-box h4 { color: var(--accent-cyan); margin-bottom: 0.75rem; }

        .entry-box ul { list-style: none; padding: 0; }

        .entry-box li {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
        }

        .entry-box li:last-child { border-bottom: none; }

        .data-label { color: var(--text-muted); }
        .data-value { color: var(--text-primary); font-weight: 500; }
        .data-value.green { color: var(--accent-green); }
        .data-value.red { color: var(--accent-red); }
        .data-value.gold { color: var(--accent-gold); }

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
            <span class="lesson-badge">📚 Tier 1 - Bài 6.5</span>
            <h1>Double Top & Double Bottom</h1>
            <p>Patterns đảo chiều phổ biến nhất trong trading</p>
        </header>

        <section class="section">
            <h2 class="section-title">Tổng Quan Double Patterns</h2>
            <div class="section-content">
                <p><strong>Double Top</strong> và <strong>Double Bottom</strong> là reversal patterns dễ nhận diện nhất và rất phổ biến trên mọi thị trường.</p>

                <img src="https://placehold.co/800x400/112250/6A5BFF?text=Double+Top+and+Bottom" alt="Double Top and Bottom" class="image-placeholder">

                <div class="comparison-grid">
                    <div class="comparison-card top">
                        <h4>🔻 Double Top</h4>
                        <p>• Hình chữ "M"</p>
                        <p>• Xuất hiện sau uptrend</p>
                        <p>• Báo hiệu đảo chiều xuống</p>
                        <p>• Signal: SHORT</p>
                    </div>
                    <div class="comparison-card bottom">
                        <h4>🔺 Double Bottom</h4>
                        <p>• Hình chữ "W"</p>
                        <p>• Xuất hiện sau downtrend</p>
                        <p>• Báo hiệu đảo chiều lên</p>
                        <p>• Signal: LONG</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Double Top - Hai Đỉnh</h2>
            <div class="section-content">
                <p><strong>Double Top</strong> hình thành khi giá test đỉnh 2 lần nhưng không thể vượt qua:</p>

                <img src="https://placehold.co/800x400/112250/EF4444?text=Double+Top+Pattern" alt="Double Top Pattern" class="image-placeholder">

                <div class="pattern-box top">
                    <h4>📉 Đặc Điểm Double Top</h4>
                    <p><strong>Đỉnh 1:</strong> Giá tạo high mới trong uptrend</p>
                    <p><strong>Pullback:</strong> Giá điều chỉnh xuống, tạo neckline</p>
                    <p><strong>Đỉnh 2:</strong> Test lại đỉnh 1 nhưng không vượt qua (±1-2%)</p>
                    <p><strong>Break:</strong> Phá vỡ neckline xuống = SHORT signal</p>
                </div>

                <div class="highlight-box">
                    <h4>💡 Tâm Lý Thị Trường</h4>
                    <p>Bulls cố gắng đẩy giá lên cao mới 2 lần nhưng thất bại. Mỗi lần thất bại làm suy yếu momentum. Khi break neckline, bears chiếm ưu thế.</p>
                </div>

                <div class="entry-box">
                    <h4>📊 Double Top Trading Setup</h4>
                    <ul>
                        <li><span class="data-label">Entry</span><span class="data-value red">Break dưới neckline</span></li>
                        <li><span class="data-label">Stop Loss</span><span class="data-value">Trên đỉnh 2 (+ buffer)</span></li>
                        <li><span class="data-label">Target</span><span class="data-value gold">Chiều cao pattern (đỉnh → neckline)</span></li>
                        <li><span class="data-label">Volume</span><span class="data-value">Đỉnh 2 volume < Đỉnh 1</span></li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Double Bottom - Hai Đáy</h2>
            <div class="section-content">
                <p><strong>Double Bottom</strong> là bản đảo ngược - giá test đáy 2 lần rồi đảo chiều lên:</p>

                <img src="https://placehold.co/800x400/112250/10B981?text=Double+Bottom+Pattern" alt="Double Bottom Pattern" class="image-placeholder">

                <div class="pattern-box bottom">
                    <h4>📈 Đặc Điểm Double Bottom</h4>
                    <p><strong>Đáy 1:</strong> Giá tạo low mới trong downtrend</p>
                    <p><strong>Bounce:</strong> Giá hồi phục lên, tạo neckline</p>
                    <p><strong>Đáy 2:</strong> Test lại đáy 1 nhưng không phá (±1-2%)</p>
                    <p><strong>Break:</strong> Phá vỡ neckline lên = LONG signal</p>
                </div>

                <div class="entry-box">
                    <h4>📊 Double Bottom Trading Setup</h4>
                    <ul>
                        <li><span class="data-label">Entry</span><span class="data-value green">Break trên neckline</span></li>
                        <li><span class="data-label">Stop Loss</span><span class="data-value">Dưới đáy 2 (+ buffer)</span></li>
                        <li><span class="data-label">Target</span><span class="data-value gold">Chiều cao pattern (neckline → đáy)</span></li>
                        <li><span class="data-label">Volume</span><span class="data-value">Đáy 2 volume có thể tăng nhẹ (bullish)</span></li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Validation Rules</h2>
            <div class="section-content">
                <p>Không phải pattern nào trông giống Double Top/Bottom cũng valid. Kiểm tra các tiêu chí sau:</p>

                <img src="https://placehold.co/800x350/112250/FFBD59?text=Validation+Criteria" alt="Validation Criteria" class="image-placeholder">

                <div class="pattern-box top">
                    <h4>✅ Tiêu Chí Validation</h4>
                    <p><strong>1. Trend trước đó:</strong> Phải có uptrend (Double Top) hoặc downtrend (Double Bottom) rõ ràng</p>
                    <p><strong>2. Khoảng cách 2 đỉnh/đáy:</strong> Tương đương nhau (±1-3%)</p>
                    <p><strong>3. Thời gian:</strong> Đủ xa nhau (ít nhất vài nến), không quá gần</p>
                    <p><strong>4. Volume:</strong> Giảm ở đỉnh/đáy 2 so với đỉnh/đáy 1</p>
                </div>

                <div class="warning-box">
                    <h4>⚠️ Invalid Patterns</h4>
                    <p>• Hai đỉnh/đáy quá gần nhau (< 5 nến) → có thể chỉ là noise<br>
                    • Chênh lệch quá lớn (> 5%) → không phải double pattern<br>
                    • Không có trend trước đó → không phải reversal</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Liên Hệ Với GEM Patterns</h2>
            <div class="section-content">
                <p>Double patterns rất tương đồng với UPD và DPU trong GEM Method:</p>

                <img src="https://placehold.co/800x300/112250/00F0FF?text=Double+vs+GEM+Patterns" alt="Double vs GEM Patterns" class="image-placeholder">

                <div class="comparison-grid">
                    <div class="comparison-card top">
                        <h4>Double Top ≈ UPD</h4>
                        <p>• Cả hai: Test đỉnh → Thất bại → Đảo xuống</p>
                        <p>• UPD có HFZ = Neckline của Double Top</p>
                        <p>• Kết hợp cả hai tăng confidence</p>
                    </div>
                    <div class="comparison-card bottom">
                        <h4>Double Bottom ≈ DPU</h4>
                        <p>• Cả hai: Test đáy → Giữ được → Đảo lên</p>
                        <p>• DPU có LFZ = Neckline của Double Bottom</p>
                        <p>• Kết hợp cả hai tăng confidence</p>
                    </div>
                </div>

                <div class="highlight-box">
                    <h4>💡 Best Practice</h4>
                    <p>Khi Double Top/Bottom trùng với UPD/DPU setup trên GEM Method, đó là high probability trade. Entry với size lớn hơn.</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>Double Top (M): Test đỉnh 2 lần, fail, SHORT khi break neckline</li>
                <li>Double Bottom (W): Test đáy 2 lần, hold, LONG khi break neckline</li>
                <li>Target = Chiều cao pattern từ đỉnh/đáy đến neckline</li>
                <li>Volume phải giảm ở đỉnh/đáy thứ 2</li>
                <li>Double Top ≈ UPD, Double Bottom ≈ DPU trong GEM Method</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="0">
                    <h4>Câu 1: Double Top có hình dạng giống chữ gì?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Chữ M</div>
                        <div class="quiz-option" data-index="1">B. Chữ W</div>
                        <div class="quiz-option" data-index="2">C. Chữ V</div>
                        <div class="quiz-option" data-index="3">D. Chữ U</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 2: Đặc điểm volume ở đỉnh 2 của Double Top?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Cao hơn đỉnh 1</div>
                        <div class="quiz-option" data-index="1">B. Bằng đỉnh 1</div>
                        <div class="quiz-option" data-index="2">C. Thấp hơn đỉnh 1</div>
                        <div class="quiz-option" data-index="3">D. Không quan trọng</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="1">
                    <h4>Câu 3: Double Bottom tương đương với pattern nào trong GEM Method?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. UPD</div>
                        <div class="quiz-option" data-index="1">B. DPU</div>
                        <div class="quiz-option" data-index="2">C. DPD</div>
                        <div class="quiz-option" data-index="3">D. UPU</div>
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
            <p>🎉 Hoàn thành <span class="highlight">Bài 6.5</span></p>
            <p>Tiếp theo: <strong>Bài 6.6 - Classic Patterns Tổng Kết</strong></p>
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

-- Lesson 6.6: Classic Patterns Tổng Kết - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch6-l6',
  'module-tier-1-ch6',
  'course-tier1-trading-foundation',
  'Bài 6.6: Classic Patterns Tổng Kết - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 6.6: Classic Patterns Tổng Kết - GEM Trading Academy</title>
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

        .cheatsheet-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            font-size: 0.9rem;
        }

        .cheatsheet-table th, .cheatsheet-table td {
            padding: 0.75rem 0.5rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }

        .cheatsheet-table th {
            background: var(--bg-secondary);
            color: var(--accent-gold);
            font-weight: 600;
        }

        .cheatsheet-table td { color: var(--text-secondary); }

        .cheatsheet-table .signal-long { color: var(--accent-green); font-weight: 600; }
        .cheatsheet-table .signal-short { color: var(--accent-red); font-weight: 600; }
        .cheatsheet-table .signal-both { color: var(--accent-gold); font-weight: 600; }

        @media (max-width: 600px) {
            .cheatsheet-table { font-size: 0.8rem; }
            .cheatsheet-table th, .cheatsheet-table td { padding: 0.5rem 0.25rem; }
        }

        .workflow-box {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-cyan);
        }

        .workflow-box h4 { color: var(--accent-cyan); margin-bottom: 0.75rem; }

        .workflow-box ol { padding-left: 1.5rem; }

        .workflow-box li {
            padding: 0.5rem 0;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border-color);
        }

        .workflow-box li:last-child { border-bottom: none; }

        .mapping-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .mapping-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: var(--border-color);
                border-radius: 8px;
                overflow: hidden;
            }
        }

        .mapping-card {
            background: var(--bg-secondary);
            padding: 1rem;
            border-radius: 10px;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .mapping-card { border-radius: 0; border: none; }
        }

        .mapping-card h4 { margin-bottom: 0.5rem; font-size: 1rem; }
        .mapping-card.classic h4 { color: var(--accent-purple); }
        .mapping-card.gem h4 { color: var(--accent-cyan); }

        .mapping-card p { color: var(--text-secondary); font-size: 0.9rem; margin: 0; }

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
            <span class="lesson-badge">📚 Tier 1 - Bài 6.6</span>
            <h1>Classic Patterns Tổng Kết</h1>
            <p>Cheatsheet và workflow kết hợp Classic + GEM Patterns</p>
        </header>

        <section class="section">
            <h2 class="section-title">Cheatsheet Tổng Hợp</h2>
            <div class="section-content">
                <p>Bảng tổng hợp tất cả Classic Patterns đã học:</p>

                <img src="https://placehold.co/800x350/112250/FFBD59?text=All+Classic+Patterns+Cheatsheet" alt="All Classic Patterns Cheatsheet" class="image-placeholder">

                <table class="cheatsheet-table">
                    <thead>
                        <tr>
                            <th>Pattern</th>
                            <th>Loại</th>
                            <th>Signal</th>
                            <th>Target</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Bull Flag</td>
                            <td>Continuation</td>
                            <td class="signal-long">LONG</td>
                            <td>Chiều dài pole</td>
                        </tr>
                        <tr>
                            <td>Bear Flag</td>
                            <td>Continuation</td>
                            <td class="signal-short">SHORT</td>
                            <td>Chiều dài pole</td>
                        </tr>
                        <tr>
                            <td>Pennant</td>
                            <td>Continuation</td>
                            <td class="signal-both">Theo trend</td>
                            <td>Chiều dài pole</td>
                        </tr>
                        <tr>
                            <td>Ascending Triangle</td>
                            <td>Continuation</td>
                            <td class="signal-long">LONG (70%)</td>
                            <td>Chiều cao triangle</td>
                        </tr>
                        <tr>
                            <td>Descending Triangle</td>
                            <td>Continuation</td>
                            <td class="signal-short">SHORT (70%)</td>
                            <td>Chiều cao triangle</td>
                        </tr>
                        <tr>
                            <td>Symmetrical Triangle</td>
                            <td>Continuation</td>
                            <td class="signal-both">Theo trend</td>
                            <td>Chiều cao triangle</td>
                        </tr>
                        <tr>
                            <td>Head & Shoulders</td>
                            <td>Reversal</td>
                            <td class="signal-short">SHORT</td>
                            <td>Head → Neckline</td>
                        </tr>
                        <tr>
                            <td>Inverse H&S</td>
                            <td>Reversal</td>
                            <td class="signal-long">LONG</td>
                            <td>Head → Neckline</td>
                        </tr>
                        <tr>
                            <td>Double Top</td>
                            <td>Reversal</td>
                            <td class="signal-short">SHORT</td>
                            <td>Đỉnh → Neckline</td>
                        </tr>
                        <tr>
                            <td>Double Bottom</td>
                            <td>Reversal</td>
                            <td class="signal-long">LONG</td>
                            <td>Đáy → Neckline</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Mapping Classic ↔ GEM Patterns</h2>
            <div class="section-content">
                <p>Liên hệ giữa Classic Patterns và GEM Frequency Patterns:</p>

                <img src="https://placehold.co/800x350/112250/00F0FF?text=Classic+to+GEM+Mapping" alt="Classic to GEM Mapping" class="image-placeholder">

                <div class="mapping-grid">
                    <div class="mapping-card classic">
                        <h4>Bull Flag, Ascending Triangle</h4>
                        <p>≈ <strong>DPD</strong> (Down-Pause-Down tiếp)<br>
                        Continuation trong uptrend → LONG</p>
                    </div>
                    <div class="mapping-card gem">
                        <h4>Bear Flag, Descending Triangle</h4>
                        <p>≈ <strong>UPU</strong> (Up-Pause-Up tiếp)<br>
                        Continuation trong downtrend → SHORT</p>
                    </div>
                    <div class="mapping-card classic">
                        <h4>H&S, Double Top</h4>
                        <p>≈ <strong>UPD</strong> (Up-Pause-Down)<br>
                        Reversal từ uptrend → SHORT</p>
                    </div>
                    <div class="mapping-card gem">
                        <h4>Inverse H&S, Double Bottom</h4>
                        <p>≈ <strong>DPU</strong> (Down-Pause-Up)<br>
                        Reversal từ downtrend → LONG</p>
                    </div>
                </div>

                <div class="highlight-box">
                    <h4>💡 High Probability Setup</h4>
                    <p>Khi Classic Pattern confirm với GEM Pattern cùng hướng, probability tăng lên đáng kể. Đây là các setup "A+ Grade" đáng trade với size lớn hơn.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Trading Workflow</h2>
            <div class="section-content">
                <p>Quy trình kết hợp Classic + GEM Patterns:</p>

                <img src="https://placehold.co/800x350/112250/10B981?text=Combined+Trading+Workflow" alt="Combined Trading Workflow" class="image-placeholder">

                <div class="workflow-box">
                    <h4>📋 5-Step Workflow</h4>
                    <ol>
                        <li><strong>Xác định Trend:</strong> Higher TF trend là gì? (Uptrend, Downtrend, Sideway)</li>
                        <li><strong>Scan GEM Pattern:</strong> DPD/UPU (continuation) hay UPD/DPU (reversal)?</li>
                        <li><strong>Check Classic Pattern:</strong> Có Flag, Triangle, H&S, Double nào confirm không?</li>
                        <li><strong>Volume Confirmation:</strong> Volume có đúng pattern không? (giảm trong consolidation, spike khi break)</li>
                        <li><strong>Entry:</strong> Nếu cả GEM + Classic confirm → Entry với size tăng. Nếu chỉ 1 → Size chuẩn.</li>
                    </ol>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Best Practices</h2>
            <div class="section-content">
                <p>Những nguyên tắc quan trọng khi trade patterns:</p>

                <img src="https://placehold.co/800x300/112250/6A5BFF?text=Trading+Best+Practices" alt="Trading Best Practices" class="image-placeholder">

                <div class="workflow-box">
                    <h4>✅ DO (Nên Làm)</h4>
                    <ol>
                        <li>Đợi break và close confirmation, không entry sớm</li>
                        <li>Luôn có Stop Loss rõ ràng trước khi entry</li>
                        <li>Trade theo hướng higher TF trend</li>
                        <li>Volume confirmation là bắt buộc</li>
                        <li>Partial profit: 50% tại Target 1, trailing cho phần còn lại</li>
                    </ol>
                </div>

                <div class="workflow-box">
                    <h4>❌ DON''T (Không Nên)</h4>
                    <ol>
                        <li>Entry dựa trên pattern chưa hoàn thành</li>
                        <li>Bỏ qua volume - pattern không có volume = weak</li>
                        <li>Trade reversal trong strong trend (H&S trong bull run mạnh)</li>
                        <li>Oversize khi pattern không rõ ràng</li>
                        <li>Move SL ngược hướng trade</li>
                    </ol>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Chương 6</h3>
            <ul>
                <li>Classic Patterns gồm Continuation (Flag, Triangle) và Reversal (H&S, Double Top/Bottom)</li>
                <li>GEM Patterns (DPD, UPU, UPD, DPU) là phiên bản đơn giản hóa</li>
                <li>Kết hợp Classic + GEM cho confirmation mạnh hơn</li>
                <li>Luôn cần volume confirmation trước khi entry</li>
                <li>Trade theo higher TF trend để tăng probability</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Tổng Hợp</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="2">
                    <h4>Câu 1: Bull Flag trong Classic Patterns tương ứng với pattern nào trong GEM Method?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. UPD</div>
                        <div class="quiz-option" data-index="1">B. DPU</div>
                        <div class="quiz-option" data-index="2">C. DPD</div>
                        <div class="quiz-option" data-index="3">D. UPU</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 2: Khi nào nên trade với size lớn hơn?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Khi cả Classic và GEM Pattern đều confirm cùng hướng</div>
                        <div class="quiz-option" data-index="1">B. Khi chỉ có 1 pattern</div>
                        <div class="quiz-option" data-index="2">C. Khi không có volume</div>
                        <div class="quiz-option" data-index="3">D. Khi đi ngược higher TF trend</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="1">
                    <h4>Câu 3: Yếu tố nào là BẮT BUỘC để confirm pattern break?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Tin tức tốt</div>
                        <div class="quiz-option" data-index="1">B. Volume spike</div>
                        <div class="quiz-option" data-index="2">C. RSI overbought</div>
                        <div class="quiz-option" data-index="3">D. Social media hype</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🏆 Hoàn Thành Chương 6!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <button class="retake-btn" onclick="retakeQuiz()">Làm Lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>🎉 Chúc mừng! Bạn đã hoàn thành <span class="highlight">Chương 6: Classic Patterns</span></p>
            <p>Tiếp theo: <strong>Chương 7 - Paper Trading: Thực Hành Không Rủi Ro</strong></p>
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
    <title>Bài 6.6: Classic Patterns Tổng Kết - GEM Trading Academy</title>
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

        .cheatsheet-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            font-size: 0.9rem;
        }

        .cheatsheet-table th, .cheatsheet-table td {
            padding: 0.75rem 0.5rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }

        .cheatsheet-table th {
            background: var(--bg-secondary);
            color: var(--accent-gold);
            font-weight: 600;
        }

        .cheatsheet-table td { color: var(--text-secondary); }

        .cheatsheet-table .signal-long { color: var(--accent-green); font-weight: 600; }
        .cheatsheet-table .signal-short { color: var(--accent-red); font-weight: 600; }
        .cheatsheet-table .signal-both { color: var(--accent-gold); font-weight: 600; }

        @media (max-width: 600px) {
            .cheatsheet-table { font-size: 0.8rem; }
            .cheatsheet-table th, .cheatsheet-table td { padding: 0.5rem 0.25rem; }
        }

        .workflow-box {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border-left: 4px solid var(--accent-cyan);
        }

        .workflow-box h4 { color: var(--accent-cyan); margin-bottom: 0.75rem; }

        .workflow-box ol { padding-left: 1.5rem; }

        .workflow-box li {
            padding: 0.5rem 0;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border-color);
        }

        .workflow-box li:last-child { border-bottom: none; }

        .mapping-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .mapping-grid {
                grid-template-columns: 1fr;
                gap: 1px;
                background: var(--border-color);
                border-radius: 8px;
                overflow: hidden;
            }
        }

        .mapping-card {
            background: var(--bg-secondary);
            padding: 1rem;
            border-radius: 10px;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .mapping-card { border-radius: 0; border: none; }
        }

        .mapping-card h4 { margin-bottom: 0.5rem; font-size: 1rem; }
        .mapping-card.classic h4 { color: var(--accent-purple); }
        .mapping-card.gem h4 { color: var(--accent-cyan); }

        .mapping-card p { color: var(--text-secondary); font-size: 0.9rem; margin: 0; }

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
            <span class="lesson-badge">📚 Tier 1 - Bài 6.6</span>
            <h1>Classic Patterns Tổng Kết</h1>
            <p>Cheatsheet và workflow kết hợp Classic + GEM Patterns</p>
        </header>

        <section class="section">
            <h2 class="section-title">Cheatsheet Tổng Hợp</h2>
            <div class="section-content">
                <p>Bảng tổng hợp tất cả Classic Patterns đã học:</p>

                <img src="https://placehold.co/800x350/112250/FFBD59?text=All+Classic+Patterns+Cheatsheet" alt="All Classic Patterns Cheatsheet" class="image-placeholder">

                <table class="cheatsheet-table">
                    <thead>
                        <tr>
                            <th>Pattern</th>
                            <th>Loại</th>
                            <th>Signal</th>
                            <th>Target</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Bull Flag</td>
                            <td>Continuation</td>
                            <td class="signal-long">LONG</td>
                            <td>Chiều dài pole</td>
                        </tr>
                        <tr>
                            <td>Bear Flag</td>
                            <td>Continuation</td>
                            <td class="signal-short">SHORT</td>
                            <td>Chiều dài pole</td>
                        </tr>
                        <tr>
                            <td>Pennant</td>
                            <td>Continuation</td>
                            <td class="signal-both">Theo trend</td>
                            <td>Chiều dài pole</td>
                        </tr>
                        <tr>
                            <td>Ascending Triangle</td>
                            <td>Continuation</td>
                            <td class="signal-long">LONG (70%)</td>
                            <td>Chiều cao triangle</td>
                        </tr>
                        <tr>
                            <td>Descending Triangle</td>
                            <td>Continuation</td>
                            <td class="signal-short">SHORT (70%)</td>
                            <td>Chiều cao triangle</td>
                        </tr>
                        <tr>
                            <td>Symmetrical Triangle</td>
                            <td>Continuation</td>
                            <td class="signal-both">Theo trend</td>
                            <td>Chiều cao triangle</td>
                        </tr>
                        <tr>
                            <td>Head & Shoulders</td>
                            <td>Reversal</td>
                            <td class="signal-short">SHORT</td>
                            <td>Head → Neckline</td>
                        </tr>
                        <tr>
                            <td>Inverse H&S</td>
                            <td>Reversal</td>
                            <td class="signal-long">LONG</td>
                            <td>Head → Neckline</td>
                        </tr>
                        <tr>
                            <td>Double Top</td>
                            <td>Reversal</td>
                            <td class="signal-short">SHORT</td>
                            <td>Đỉnh → Neckline</td>
                        </tr>
                        <tr>
                            <td>Double Bottom</td>
                            <td>Reversal</td>
                            <td class="signal-long">LONG</td>
                            <td>Đáy → Neckline</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Mapping Classic ↔ GEM Patterns</h2>
            <div class="section-content">
                <p>Liên hệ giữa Classic Patterns và GEM Frequency Patterns:</p>

                <img src="https://placehold.co/800x350/112250/00F0FF?text=Classic+to+GEM+Mapping" alt="Classic to GEM Mapping" class="image-placeholder">

                <div class="mapping-grid">
                    <div class="mapping-card classic">
                        <h4>Bull Flag, Ascending Triangle</h4>
                        <p>≈ <strong>DPD</strong> (Down-Pause-Down tiếp)<br>
                        Continuation trong uptrend → LONG</p>
                    </div>
                    <div class="mapping-card gem">
                        <h4>Bear Flag, Descending Triangle</h4>
                        <p>≈ <strong>UPU</strong> (Up-Pause-Up tiếp)<br>
                        Continuation trong downtrend → SHORT</p>
                    </div>
                    <div class="mapping-card classic">
                        <h4>H&S, Double Top</h4>
                        <p>≈ <strong>UPD</strong> (Up-Pause-Down)<br>
                        Reversal từ uptrend → SHORT</p>
                    </div>
                    <div class="mapping-card gem">
                        <h4>Inverse H&S, Double Bottom</h4>
                        <p>≈ <strong>DPU</strong> (Down-Pause-Up)<br>
                        Reversal từ downtrend → LONG</p>
                    </div>
                </div>

                <div class="highlight-box">
                    <h4>💡 High Probability Setup</h4>
                    <p>Khi Classic Pattern confirm với GEM Pattern cùng hướng, probability tăng lên đáng kể. Đây là các setup "A+ Grade" đáng trade với size lớn hơn.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Trading Workflow</h2>
            <div class="section-content">
                <p>Quy trình kết hợp Classic + GEM Patterns:</p>

                <img src="https://placehold.co/800x350/112250/10B981?text=Combined+Trading+Workflow" alt="Combined Trading Workflow" class="image-placeholder">

                <div class="workflow-box">
                    <h4>📋 5-Step Workflow</h4>
                    <ol>
                        <li><strong>Xác định Trend:</strong> Higher TF trend là gì? (Uptrend, Downtrend, Sideway)</li>
                        <li><strong>Scan GEM Pattern:</strong> DPD/UPU (continuation) hay UPD/DPU (reversal)?</li>
                        <li><strong>Check Classic Pattern:</strong> Có Flag, Triangle, H&S, Double nào confirm không?</li>
                        <li><strong>Volume Confirmation:</strong> Volume có đúng pattern không? (giảm trong consolidation, spike khi break)</li>
                        <li><strong>Entry:</strong> Nếu cả GEM + Classic confirm → Entry với size tăng. Nếu chỉ 1 → Size chuẩn.</li>
                    </ol>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Best Practices</h2>
            <div class="section-content">
                <p>Những nguyên tắc quan trọng khi trade patterns:</p>

                <img src="https://placehold.co/800x300/112250/6A5BFF?text=Trading+Best+Practices" alt="Trading Best Practices" class="image-placeholder">

                <div class="workflow-box">
                    <h4>✅ DO (Nên Làm)</h4>
                    <ol>
                        <li>Đợi break và close confirmation, không entry sớm</li>
                        <li>Luôn có Stop Loss rõ ràng trước khi entry</li>
                        <li>Trade theo hướng higher TF trend</li>
                        <li>Volume confirmation là bắt buộc</li>
                        <li>Partial profit: 50% tại Target 1, trailing cho phần còn lại</li>
                    </ol>
                </div>

                <div class="workflow-box">
                    <h4>❌ DON''T (Không Nên)</h4>
                    <ol>
                        <li>Entry dựa trên pattern chưa hoàn thành</li>
                        <li>Bỏ qua volume - pattern không có volume = weak</li>
                        <li>Trade reversal trong strong trend (H&S trong bull run mạnh)</li>
                        <li>Oversize khi pattern không rõ ràng</li>
                        <li>Move SL ngược hướng trade</li>
                    </ol>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Chương 6</h3>
            <ul>
                <li>Classic Patterns gồm Continuation (Flag, Triangle) và Reversal (H&S, Double Top/Bottom)</li>
                <li>GEM Patterns (DPD, UPU, UPD, DPU) là phiên bản đơn giản hóa</li>
                <li>Kết hợp Classic + GEM cho confirmation mạnh hơn</li>
                <li>Luôn cần volume confirmation trước khi entry</li>
                <li>Trade theo higher TF trend để tăng probability</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Tổng Hợp</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="2">
                    <h4>Câu 1: Bull Flag trong Classic Patterns tương ứng với pattern nào trong GEM Method?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. UPD</div>
                        <div class="quiz-option" data-index="1">B. DPU</div>
                        <div class="quiz-option" data-index="2">C. DPD</div>
                        <div class="quiz-option" data-index="3">D. UPU</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 2: Khi nào nên trade với size lớn hơn?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Khi cả Classic và GEM Pattern đều confirm cùng hướng</div>
                        <div class="quiz-option" data-index="1">B. Khi chỉ có 1 pattern</div>
                        <div class="quiz-option" data-index="2">C. Khi không có volume</div>
                        <div class="quiz-option" data-index="3">D. Khi đi ngược higher TF trend</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="1">
                    <h4>Câu 3: Yếu tố nào là BẮT BUỘC để confirm pattern break?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Tin tức tốt</div>
                        <div class="quiz-option" data-index="1">B. Volume spike</div>
                        <div class="quiz-option" data-index="2">C. RSI overbought</div>
                        <div class="quiz-option" data-index="3">D. Social media hype</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-score">
                    <h3>🏆 Hoàn Thành Chương 6!</h3>
                    <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                    <button class="retake-btn" onclick="retakeQuiz()">Làm Lại Quiz</button>
                </div>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>🎉 Chúc mừng! Bạn đã hoàn thành <span class="highlight">Chương 6: Classic Patterns</span></p>
            <p>Tiếp theo: <strong>Chương 7 - Paper Trading: Thực Hành Không Rủi Ro</strong></p>
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
