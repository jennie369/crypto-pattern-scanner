-- =====================================================
-- TIER-3 - Chương 1: Flag & Pennant Mastery
-- Course: course-tier3-trading-mastery
-- File 17/23
-- =====================================================

-- Create/Update Module
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  'module-tier-3-ch1',
  'course-tier3-trading-mastery',
  'Chương 1: Flag & Pennant Mastery',
  'Master các mẫu hình Flag và Pennant',
  1,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Lesson 1.1: Flag Pattern Là Gì?
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch1-l1',
  'module-tier-3-ch1',
  'course-tier3-trading-mastery',
  'Bài 1.1: Flag Pattern Là Gì?',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 1.1: Flag Pattern Là Gì?</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a0a2e 0%, #0a0a0f 100%); padding: 2rem 1.5rem; border-bottom: 3px solid #8B5CF6; }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #8B5CF6, #7c3aed); color: #fff; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: #a1a1aa; font-size: 0.9rem; }
        .content-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .section-label { display: inline-block; background: rgba(139, 92, 246, 0.2); color: #8B5CF6; padding: 0.2rem 0.6rem; border-radius: 0.375rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.75rem; }
        .section-title { font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.05)); border-color: rgba(255, 189, 89, 0.3); }
        .highlight-box.cyan { background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.05)); border-color: rgba(0, 240, 255, 0.3); }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border-color: rgba(16, 185, 129, 0.3); }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; }
        .grid-item.purple { border-left: 3px solid #8B5CF6; }
        .grid-item.gold { border-left: 3px solid #FFBD59; }
        .grid-item.cyan { border-left: 3px solid #00F0FF; }
        .grid-item.green { border-left: 3px solid #10B981; }
        .phase-card { display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; background: rgba(255, 255, 255, 0.02); border-radius: 0.5rem; border-left: 3px solid #8B5CF6; }
        .phase-number { width: 40px; height: 40px; background: linear-gradient(135deg, #8B5CF6, #7c3aed); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; flex-shrink: 0; }
        .phase-content h4 { color: #fff; margin-bottom: 0.5rem; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #0a0a0f); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .key-point { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem; background: rgba(139, 92, 246, 0.1); border-radius: 0.375rem; margin: 0.5rem 0; }
        .key-point-icon { color: #8B5CF6; font-size: 1.2rem; }
        .summary-box { background: linear-gradient(135deg, #1a0a2e, #0a0a0f); border: 1px solid #8B5CF6; border-radius: 0.75rem; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #8B5CF6; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-list { list-style: none; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
        .summary-list li::before { content: "→"; position: absolute; left: 0; color: #8B5CF6; }
        .quiz-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .quiz-question { background: rgba(255, 255, 255, 0.02); padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .question-text { font-weight: 600; color: #fff; margin-bottom: 1rem; }
        .quiz-option { padding: 0.875rem 1rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.03); border: 1px solid #27272a; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; }
        .quiz-option:hover { border-color: #8B5CF6; background: rgba(139, 92, 246, 0.1); }
        .quiz-option.correct { border-color: #10B981; background: rgba(16, 185, 129, 0.2); }
        .quiz-option.incorrect { border-color: #ef4444; background: rgba(239, 68, 68, 0.2); }
        .option-letter { width: 24px; height: 24px; border-radius: 50%; background: #27272a; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
        .quiz-result { padding: 0.75rem; margin-top: 0.75rem; border-radius: 0.375rem; font-weight: 500; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border-radius: 0.5rem; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .score-text { font-size: 1.5rem; font-weight: 700; color: #8B5CF6; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #7c3aed); color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.8rem; border-top: 1px solid #27272a; margin-top: 2rem; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0; border-radius: 0; border-left: 4px solid #27272a; border-right: none; border-top: none; border-bottom: 1px solid #27272a; padding: 1.25rem 1rem; }
            .summary-box { margin: 0; border-radius: 0; }
            .quiz-section { margin: 0; border-radius: 0; }
            .grid-2 { grid-template-columns: 1fr; gap: 1px; background: #27272a; border-radius: 0.5rem; overflow: hidden; }
            .grid-item { border-radius: 0; border: none; border-left: 3px solid; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="lesson-header">
            <span class="lesson-badge">Tier 3 Elite</span>
            <h1 class="lesson-title">Bài 1.1: Flag Pattern Là Gì?</h1>
            <p class="lesson-subtitle">Tìm hiểu pattern tiếp diễn mạnh mẽ trong trading chuyên nghiệp</p>
        </div>

        <div class="content-section">
            <span class="section-label">📚 Định nghĩa</span>
            <h2 class="section-title">Flag Pattern - Cờ Tiếp Diễn</h2>
            <p>Flag Pattern (mẫu hình Cờ) là một trong những continuation patterns (mẫu hình tiếp diễn) đáng tin cậy nhất trong phân tích kỹ thuật. Pattern này xuất hiện sau một đợt di chuyển giá mạnh và báo hiệu sự tiếp tục của trend hiện tại.</p>

            <div class="highlight-box">
                <p><strong>🎯 Định nghĩa chính xác:</strong></p>
                <p style="margin-top: 0.5rem;">Flag Pattern là sự consolidation (tích lũy) ngắn hạn hình thành sau một đợt di chuyển giá mạnh (gọi là "cột cờ"), với giá dao động trong một kênh hẹp nghiêng ngược hướng với trend chính.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x400/1a0a2e/8B5CF6?text=Flag+Pattern+-+Anatomy" alt="Flag Pattern Anatomy">
                <p class="image-caption">Hình 1.1.1: Cấu trúc cơ bản của Flag Pattern</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🔧 Cấu trúc</span>
            <h2 class="section-title">3 Thành Phần Của Flag Pattern</h2>

            <div class="phase-card">
                <div class="phase-number">1</div>
                <div class="phase-content">
                    <h4>Flagpole (Cột Cờ)</h4>
                    <p>Đợt di chuyển giá mạnh và nhanh theo một hướng. Đây là động lực ban đầu tạo nên trend. Volume thường cao trong giai đoạn này.</p>
                </div>
            </div>

            <div class="phase-card">
                <div class="phase-number">2</div>
                <div class="phase-content">
                    <h4>Flag (Lá Cờ)</h4>
                    <p>Giai đoạn consolidation sau cột cờ. Giá dao động trong một kênh hẹp, nghiêng nhẹ ngược hướng với trend. Volume giảm dần trong giai đoạn này.</p>
                </div>
            </div>

            <div class="phase-card">
                <div class="phase-number">3</div>
                <div class="phase-content">
                    <h4>Breakout</h4>
                    <p>Giá phá vỡ khỏi Flag theo hướng của trend ban đầu. Volume tăng mạnh khi breakout xảy ra, xác nhận sự tiếp tục của trend.</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/FFBD59?text=Flag+3+Components+-+Diagram" alt="Flag Components">
                <p class="image-caption">Hình 1.1.2: 3 thành phần của Flag Pattern</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Đặc điểm</span>
            <h2 class="section-title">Nhận Diện Flag Pattern</h2>

            <div class="grid-2">
                <div class="grid-item purple">
                    <h4 style="color: #8B5CF6; margin-bottom: 0.5rem;">📏 Độ Dốc Của Flag</h4>
                    <p style="font-size: 0.9rem;">Flag nghiêng ngược hướng với trend: Bullish Flag nghiêng xuống, Bearish Flag nghiêng lên.</p>
                </div>
                <div class="grid-item gold">
                    <h4 style="color: #FFBD59; margin-bottom: 0.5rem;">📉 Volume Pattern</h4>
                    <p style="font-size: 0.9rem;">Volume cao ở flagpole, giảm dần trong flag, tăng mạnh khi breakout.</p>
                </div>
                <div class="grid-item cyan">
                    <h4 style="color: #00F0FF; margin-bottom: 0.5rem;">⏱️ Thời Gian</h4>
                    <p style="font-size: 0.9rem;">Flag thường kéo dài 1-3 tuần (timeframe daily). Quá ngắn hoặc quá dài giảm độ tin cậy.</p>
                </div>
                <div class="grid-item green">
                    <h4 style="color: #10B981; margin-bottom: 0.5rem;">🎯 Price Target</h4>
                    <p style="font-size: 0.9rem;">Mục tiêu = Breakout point + Chiều cao Flagpole. Đây là cách tính target chuẩn.</p>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚡ Tâm lý</span>
            <h2 class="section-title">Tâm Lý Đằng Sau Flag Pattern</h2>

            <div class="highlight-box gold">
                <p><strong>🧠 Giải thích tâm lý:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li><strong>Flagpole:</strong> Lực mua/bán mạnh đẩy giá nhanh chóng theo một hướng</li>
                    <li><strong>Flag:</strong> Những người mua/bán sớm chốt lời, nhưng không có lực đối nghịch đủ mạnh</li>
                    <li><strong>Breakout:</strong> Lực mua/bán mới vào cuộc, tiếp tục trend ban đầu</li>
                </ul>
            </div>

            <div class="key-point">
                <span class="key-point-icon">💡</span>
                <div>
                    <strong>Key Insight:</strong> Flag Pattern phản ánh sự "nghỉ ngơi" của trend chính. Đây không phải là reversal, mà là pause trước khi tiếp tục.
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/10B981?text=Flag+Psychology+-+Explanation" alt="Flag Psychology">
                <p class="image-caption">Hình 1.1.3: Tâm lý thị trường trong Flag Pattern</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📈 So sánh</span>
            <h2 class="section-title">Flag vs Các Pattern Khác</h2>

            <div class="highlight-box cyan">
                <p><strong>Flag vs Channel:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Flag: Ngắn hạn (1-3 tuần), nghiêng ngược trend</li>
                    <li>Channel: Dài hạn hơn, có thể theo hoặc ngược trend</li>
                </ul>
            </div>

            <div class="highlight-box">
                <p><strong>Flag vs Pennant:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Flag: Hình chữ nhật, các đường biên song song</li>
                    <li>Pennant: Hình tam giác, các đường biên hội tụ</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x300/1a0a2e/8B5CF6?text=Flag+vs+Other+Patterns" alt="Flag vs Others">
                <p class="image-caption">Hình 1.1.4: So sánh Flag với các pattern tương tự</p>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Flag Pattern là continuation pattern đáng tin cậy</li>
                <li>3 thành phần: Flagpole, Flag, Breakout</li>
                <li>Flag nghiêng ngược hướng với trend chính</li>
                <li>Volume: cao ở flagpole, giảm ở flag, tăng ở breakout</li>
                <li>Price target = Breakout + Chiều cao Flagpole</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Flag Pattern là loại pattern gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Reversal pattern (đảo chiều)</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Continuation pattern (tiếp diễn)</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Consolidation pattern (tích lũy)</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">2. Trong Bullish Flag, phần Flag nghiêng theo hướng nào?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Nghiêng xuống (ngược hướng trend tăng)</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Nghiêng lên (cùng hướng trend tăng)</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Ngang (không nghiêng)</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Kết quả: <span id="correct-count">0</span>/2</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </div>

        <div class="lesson-footer">
            <p>© 2024 GEM Trading Academy - Tier 3 Elite</p>
        </div>
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
                        result.textContent = ''✗ Chưa đúng. Hãy xem lại nội dung bài học.'';
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
</html>',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 1.1: Flag Pattern Là Gì?</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a0a2e 0%, #0a0a0f 100%); padding: 2rem 1.5rem; border-bottom: 3px solid #8B5CF6; }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #8B5CF6, #7c3aed); color: #fff; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: #a1a1aa; font-size: 0.9rem; }
        .content-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .section-label { display: inline-block; background: rgba(139, 92, 246, 0.2); color: #8B5CF6; padding: 0.2rem 0.6rem; border-radius: 0.375rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.75rem; }
        .section-title { font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.05)); border-color: rgba(255, 189, 89, 0.3); }
        .highlight-box.cyan { background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.05)); border-color: rgba(0, 240, 255, 0.3); }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border-color: rgba(16, 185, 129, 0.3); }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; }
        .grid-item.purple { border-left: 3px solid #8B5CF6; }
        .grid-item.gold { border-left: 3px solid #FFBD59; }
        .grid-item.cyan { border-left: 3px solid #00F0FF; }
        .grid-item.green { border-left: 3px solid #10B981; }
        .phase-card { display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; background: rgba(255, 255, 255, 0.02); border-radius: 0.5rem; border-left: 3px solid #8B5CF6; }
        .phase-number { width: 40px; height: 40px; background: linear-gradient(135deg, #8B5CF6, #7c3aed); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; flex-shrink: 0; }
        .phase-content h4 { color: #fff; margin-bottom: 0.5rem; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #0a0a0f); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .key-point { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem; background: rgba(139, 92, 246, 0.1); border-radius: 0.375rem; margin: 0.5rem 0; }
        .key-point-icon { color: #8B5CF6; font-size: 1.2rem; }
        .summary-box { background: linear-gradient(135deg, #1a0a2e, #0a0a0f); border: 1px solid #8B5CF6; border-radius: 0.75rem; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #8B5CF6; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-list { list-style: none; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
        .summary-list li::before { content: "→"; position: absolute; left: 0; color: #8B5CF6; }
        .quiz-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .quiz-question { background: rgba(255, 255, 255, 0.02); padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .question-text { font-weight: 600; color: #fff; margin-bottom: 1rem; }
        .quiz-option { padding: 0.875rem 1rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.03); border: 1px solid #27272a; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; }
        .quiz-option:hover { border-color: #8B5CF6; background: rgba(139, 92, 246, 0.1); }
        .quiz-option.correct { border-color: #10B981; background: rgba(16, 185, 129, 0.2); }
        .quiz-option.incorrect { border-color: #ef4444; background: rgba(239, 68, 68, 0.2); }
        .option-letter { width: 24px; height: 24px; border-radius: 50%; background: #27272a; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
        .quiz-result { padding: 0.75rem; margin-top: 0.75rem; border-radius: 0.375rem; font-weight: 500; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border-radius: 0.5rem; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .score-text { font-size: 1.5rem; font-weight: 700; color: #8B5CF6; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #7c3aed); color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.8rem; border-top: 1px solid #27272a; margin-top: 2rem; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0; border-radius: 0; border-left: 4px solid #27272a; border-right: none; border-top: none; border-bottom: 1px solid #27272a; padding: 1.25rem 1rem; }
            .summary-box { margin: 0; border-radius: 0; }
            .quiz-section { margin: 0; border-radius: 0; }
            .grid-2 { grid-template-columns: 1fr; gap: 1px; background: #27272a; border-radius: 0.5rem; overflow: hidden; }
            .grid-item { border-radius: 0; border: none; border-left: 3px solid; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="lesson-header">
            <span class="lesson-badge">Tier 3 Elite</span>
            <h1 class="lesson-title">Bài 1.1: Flag Pattern Là Gì?</h1>
            <p class="lesson-subtitle">Tìm hiểu pattern tiếp diễn mạnh mẽ trong trading chuyên nghiệp</p>
        </div>

        <div class="content-section">
            <span class="section-label">📚 Định nghĩa</span>
            <h2 class="section-title">Flag Pattern - Cờ Tiếp Diễn</h2>
            <p>Flag Pattern (mẫu hình Cờ) là một trong những continuation patterns (mẫu hình tiếp diễn) đáng tin cậy nhất trong phân tích kỹ thuật. Pattern này xuất hiện sau một đợt di chuyển giá mạnh và báo hiệu sự tiếp tục của trend hiện tại.</p>

            <div class="highlight-box">
                <p><strong>🎯 Định nghĩa chính xác:</strong></p>
                <p style="margin-top: 0.5rem;">Flag Pattern là sự consolidation (tích lũy) ngắn hạn hình thành sau một đợt di chuyển giá mạnh (gọi là "cột cờ"), với giá dao động trong một kênh hẹp nghiêng ngược hướng với trend chính.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x400/1a0a2e/8B5CF6?text=Flag+Pattern+-+Anatomy" alt="Flag Pattern Anatomy">
                <p class="image-caption">Hình 1.1.1: Cấu trúc cơ bản của Flag Pattern</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🔧 Cấu trúc</span>
            <h2 class="section-title">3 Thành Phần Của Flag Pattern</h2>

            <div class="phase-card">
                <div class="phase-number">1</div>
                <div class="phase-content">
                    <h4>Flagpole (Cột Cờ)</h4>
                    <p>Đợt di chuyển giá mạnh và nhanh theo một hướng. Đây là động lực ban đầu tạo nên trend. Volume thường cao trong giai đoạn này.</p>
                </div>
            </div>

            <div class="phase-card">
                <div class="phase-number">2</div>
                <div class="phase-content">
                    <h4>Flag (Lá Cờ)</h4>
                    <p>Giai đoạn consolidation sau cột cờ. Giá dao động trong một kênh hẹp, nghiêng nhẹ ngược hướng với trend. Volume giảm dần trong giai đoạn này.</p>
                </div>
            </div>

            <div class="phase-card">
                <div class="phase-number">3</div>
                <div class="phase-content">
                    <h4>Breakout</h4>
                    <p>Giá phá vỡ khỏi Flag theo hướng của trend ban đầu. Volume tăng mạnh khi breakout xảy ra, xác nhận sự tiếp tục của trend.</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/FFBD59?text=Flag+3+Components+-+Diagram" alt="Flag Components">
                <p class="image-caption">Hình 1.1.2: 3 thành phần của Flag Pattern</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Đặc điểm</span>
            <h2 class="section-title">Nhận Diện Flag Pattern</h2>

            <div class="grid-2">
                <div class="grid-item purple">
                    <h4 style="color: #8B5CF6; margin-bottom: 0.5rem;">📏 Độ Dốc Của Flag</h4>
                    <p style="font-size: 0.9rem;">Flag nghiêng ngược hướng với trend: Bullish Flag nghiêng xuống, Bearish Flag nghiêng lên.</p>
                </div>
                <div class="grid-item gold">
                    <h4 style="color: #FFBD59; margin-bottom: 0.5rem;">📉 Volume Pattern</h4>
                    <p style="font-size: 0.9rem;">Volume cao ở flagpole, giảm dần trong flag, tăng mạnh khi breakout.</p>
                </div>
                <div class="grid-item cyan">
                    <h4 style="color: #00F0FF; margin-bottom: 0.5rem;">⏱️ Thời Gian</h4>
                    <p style="font-size: 0.9rem;">Flag thường kéo dài 1-3 tuần (timeframe daily). Quá ngắn hoặc quá dài giảm độ tin cậy.</p>
                </div>
                <div class="grid-item green">
                    <h4 style="color: #10B981; margin-bottom: 0.5rem;">🎯 Price Target</h4>
                    <p style="font-size: 0.9rem;">Mục tiêu = Breakout point + Chiều cao Flagpole. Đây là cách tính target chuẩn.</p>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚡ Tâm lý</span>
            <h2 class="section-title">Tâm Lý Đằng Sau Flag Pattern</h2>

            <div class="highlight-box gold">
                <p><strong>🧠 Giải thích tâm lý:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li><strong>Flagpole:</strong> Lực mua/bán mạnh đẩy giá nhanh chóng theo một hướng</li>
                    <li><strong>Flag:</strong> Những người mua/bán sớm chốt lời, nhưng không có lực đối nghịch đủ mạnh</li>
                    <li><strong>Breakout:</strong> Lực mua/bán mới vào cuộc, tiếp tục trend ban đầu</li>
                </ul>
            </div>

            <div class="key-point">
                <span class="key-point-icon">💡</span>
                <div>
                    <strong>Key Insight:</strong> Flag Pattern phản ánh sự "nghỉ ngơi" của trend chính. Đây không phải là reversal, mà là pause trước khi tiếp tục.
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/10B981?text=Flag+Psychology+-+Explanation" alt="Flag Psychology">
                <p class="image-caption">Hình 1.1.3: Tâm lý thị trường trong Flag Pattern</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📈 So sánh</span>
            <h2 class="section-title">Flag vs Các Pattern Khác</h2>

            <div class="highlight-box cyan">
                <p><strong>Flag vs Channel:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Flag: Ngắn hạn (1-3 tuần), nghiêng ngược trend</li>
                    <li>Channel: Dài hạn hơn, có thể theo hoặc ngược trend</li>
                </ul>
            </div>

            <div class="highlight-box">
                <p><strong>Flag vs Pennant:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Flag: Hình chữ nhật, các đường biên song song</li>
                    <li>Pennant: Hình tam giác, các đường biên hội tụ</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x300/1a0a2e/8B5CF6?text=Flag+vs+Other+Patterns" alt="Flag vs Others">
                <p class="image-caption">Hình 1.1.4: So sánh Flag với các pattern tương tự</p>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Flag Pattern là continuation pattern đáng tin cậy</li>
                <li>3 thành phần: Flagpole, Flag, Breakout</li>
                <li>Flag nghiêng ngược hướng với trend chính</li>
                <li>Volume: cao ở flagpole, giảm ở flag, tăng ở breakout</li>
                <li>Price target = Breakout + Chiều cao Flagpole</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Flag Pattern là loại pattern gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Reversal pattern (đảo chiều)</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Continuation pattern (tiếp diễn)</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Consolidation pattern (tích lũy)</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">2. Trong Bullish Flag, phần Flag nghiêng theo hướng nào?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Nghiêng xuống (ngược hướng trend tăng)</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Nghiêng lên (cùng hướng trend tăng)</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Ngang (không nghiêng)</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Kết quả: <span id="correct-count">0</span>/2</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </div>

        <div class="lesson-footer">
            <p>© 2024 GEM Trading Academy - Tier 3 Elite</p>
        </div>
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
                        result.textContent = ''✗ Chưa đúng. Hãy xem lại nội dung bài học.'';
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

-- Lesson 1.2: Bullish vs Bearish Flag
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch1-l2',
  'module-tier-3-ch1',
  'course-tier3-trading-mastery',
  'Bài 1.2: Bullish vs Bearish Flag',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 1.2: Bullish vs Bearish Flag</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a0a2e 0%, #0a0a0f 100%); padding: 2rem 1.5rem; border-bottom: 3px solid #8B5CF6; }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #8B5CF6, #7c3aed); color: #fff; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: #a1a1aa; font-size: 0.9rem; }
        .content-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .section-label { display: inline-block; background: rgba(139, 92, 246, 0.2); color: #8B5CF6; padding: 0.2rem 0.6rem; border-radius: 0.375rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.75rem; }
        .section-title { font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border-color: rgba(16, 185, 129, 0.3); }
        .highlight-box.red { background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05)); border-color: rgba(239, 68, 68, 0.3); }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; }
        .grid-item.green { border-color: #10B981; background: rgba(16, 185, 129, 0.05); }
        .grid-item.red { border-color: #ef4444; background: rgba(239, 68, 68, 0.05); }
        .comparison-table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }
        .comparison-table th { background: #27272a; padding: 0.75rem; text-align: left; font-weight: 600; }
        .comparison-table th:nth-child(2) { color: #10B981; }
        .comparison-table th:nth-child(3) { color: #ef4444; }
        .comparison-table td { padding: 0.75rem; border-bottom: 1px solid #27272a; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #0a0a0f); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .step-list { list-style: none; margin: 1rem 0; }
        .step-list li { padding: 0.75rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.02); border-radius: 0.375rem; border-left: 3px solid #8B5CF6; }
        .summary-box { background: linear-gradient(135deg, #1a0a2e, #0a0a0f); border: 1px solid #8B5CF6; border-radius: 0.75rem; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #8B5CF6; margin-bottom: 1rem; }
        .summary-list { list-style: none; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
        .summary-list li::before { content: "→"; position: absolute; left: 0; color: #8B5CF6; }
        .quiz-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .quiz-question { background: rgba(255, 255, 255, 0.02); padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .question-text { font-weight: 600; color: #fff; margin-bottom: 1rem; }
        .quiz-option { padding: 0.875rem 1rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.03); border: 1px solid #27272a; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; }
        .quiz-option:hover { border-color: #8B5CF6; background: rgba(139, 92, 246, 0.1); }
        .quiz-option.correct { border-color: #10B981; background: rgba(16, 185, 129, 0.2); }
        .quiz-option.incorrect { border-color: #ef4444; background: rgba(239, 68, 68, 0.2); }
        .option-letter { width: 24px; height: 24px; border-radius: 50%; background: #27272a; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
        .quiz-result { padding: 0.75rem; margin-top: 0.75rem; border-radius: 0.375rem; font-weight: 500; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border-radius: 0.5rem; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .score-text { font-size: 1.5rem; font-weight: 700; color: #8B5CF6; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #7c3aed); color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.8rem; border-top: 1px solid #27272a; margin-top: 2rem; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0; border-radius: 0; border-left: 4px solid #27272a; border-right: none; border-top: none; border-bottom: 1px solid #27272a; padding: 1.25rem 1rem; }
            .summary-box, .quiz-section { margin: 0; border-radius: 0; }
            .grid-2 { grid-template-columns: 1fr; gap: 0.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="lesson-header">
            <span class="lesson-badge">Tier 3 Elite</span>
            <h1 class="lesson-title">Bài 1.2: Bullish vs Bearish Flag</h1>
            <p class="lesson-subtitle">Phân biệt và giao dịch 2 loại Flag Pattern</p>
        </div>

        <div class="content-section">
            <span class="section-label">📈 Bullish Flag</span>
            <h2 class="section-title">Bullish Flag - Cờ Tăng</h2>

            <div class="highlight-box green">
                <p><strong>🟢 Đặc điểm Bullish Flag:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Xuất hiện trong uptrend (xu hướng tăng)</li>
                    <li>Flagpole: Giá tăng mạnh với volume cao</li>
                    <li>Flag: Nghiêng xuống nhẹ (correction nhẹ)</li>
                    <li>Breakout: Phá vỡ lên trên với volume tăng</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/0a2e1a/10B981?text=Bullish+Flag+-+Anatomy" alt="Bullish Flag">
                <p class="image-caption">Hình 1.2.1: Cấu trúc Bullish Flag Pattern</p>
            </div>

            <ul class="step-list">
                <li><strong>Entry Point:</strong> Khi giá breakout lên trên đường trendline trên của Flag</li>
                <li><strong>Stop Loss:</strong> Dưới đáy của Flag hoặc dưới đường trendline dưới</li>
                <li><strong>Take Profit:</strong> Entry + Chiều cao Flagpole</li>
            </ul>
        </div>

        <div class="content-section">
            <span class="section-label">📉 Bearish Flag</span>
            <h2 class="section-title">Bearish Flag - Cờ Giảm</h2>

            <div class="highlight-box red">
                <p><strong>🔴 Đặc điểm Bearish Flag:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Xuất hiện trong downtrend (xu hướng giảm)</li>
                    <li>Flagpole: Giá giảm mạnh với volume cao</li>
                    <li>Flag: Nghiêng lên nhẹ (bounce nhẹ)</li>
                    <li>Breakout: Phá vỡ xuống dưới với volume tăng</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/2e0a0a/ef4444?text=Bearish+Flag+-+Anatomy" alt="Bearish Flag">
                <p class="image-caption">Hình 1.2.2: Cấu trúc Bearish Flag Pattern</p>
            </div>

            <ul class="step-list">
                <li><strong>Entry Point:</strong> Khi giá breakout xuống dưới đường trendline dưới của Flag</li>
                <li><strong>Stop Loss:</strong> Trên đỉnh của Flag hoặc trên đường trendline trên</li>
                <li><strong>Take Profit:</strong> Entry - Chiều cao Flagpole</li>
            </ul>
        </div>

        <div class="content-section">
            <span class="section-label">⚖️ So sánh</span>
            <h2 class="section-title">Bảng So Sánh Chi Tiết</h2>

            <table class="comparison-table">
                <tr>
                    <th>Tiêu Chí</th>
                    <th>Bullish Flag</th>
                    <th>Bearish Flag</th>
                </tr>
                <tr>
                    <td>Trend chính</td>
                    <td>Uptrend</td>
                    <td>Downtrend</td>
                </tr>
                <tr>
                    <td>Flagpole</td>
                    <td>Tăng mạnh</td>
                    <td>Giảm mạnh</td>
                </tr>
                <tr>
                    <td>Flag nghiêng</td>
                    <td>Nghiêng xuống</td>
                    <td>Nghiêng lên</td>
                </tr>
                <tr>
                    <td>Breakout</td>
                    <td>Phá vỡ lên</td>
                    <td>Phá vỡ xuống</td>
                </tr>
                <tr>
                    <td>Lệnh</td>
                    <td>Long (Buy)</td>
                    <td>Short (Sell)</td>
                </tr>
                <tr>
                    <td>Volume</td>
                    <td>Tăng khi breakout</td>
                    <td>Tăng khi breakout</td>
                </tr>
            </table>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/8B5CF6?text=Bullish+vs+Bearish+Flag+-+Side+by+Side" alt="Comparison">
                <p class="image-caption">Hình 1.2.3: So sánh song song 2 loại Flag</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚠️ Cảnh báo</span>
            <h2 class="section-title">Những Điểm Cần Lưu Ý</h2>

            <div class="grid-2">
                <div class="grid-item green">
                    <h4 style="color: #10B981; margin-bottom: 0.5rem;">✓ Dấu Hiệu Tốt</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>Volume giảm trong Flag</li>
                        <li>Flag ngắn (1-3 tuần)</li>
                        <li>Độ dốc Flag vừa phải</li>
                        <li>Breakout với volume cao</li>
                    </ul>
                </div>
                <div class="grid-item red">
                    <h4 style="color: #ef4444; margin-bottom: 0.5rem;">✗ Dấu Hiệu Xấu</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>Volume tăng trong Flag</li>
                        <li>Flag kéo dài quá lâu</li>
                        <li>Flag quá dốc (có thể là reversal)</li>
                        <li>Breakout thiếu volume</li>
                    </ul>
                </div>
            </div>

            <div class="highlight-box">
                <p><strong>💡 Pro Tip:</strong> Nếu Flag retrace quá 50% của Flagpole, đó có thể không còn là Flag Pattern nữa. Hãy cẩn thận và chờ xác nhận thêm.</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🎯 Mục tiêu giá</span>
            <h2 class="section-title">Cách Tính Price Target</h2>

            <div class="highlight-box">
                <p><strong>📐 Công thức:</strong></p>
                <p style="margin-top: 0.5rem; font-size: 1.1rem; color: #8B5CF6;"><strong>Target = Breakout Point ± Chiều cao Flagpole</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Bullish: Target = Breakout + Flagpole height</li>
                    <li>Bearish: Target = Breakout - Flagpole height</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/FFBD59?text=Price+Target+Calculation" alt="Price Target">
                <p class="image-caption">Hình 1.2.4: Cách tính mục tiêu giá cho Flag Pattern</p>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Bullish Flag: Uptrend → Flag nghiêng xuống → Breakout lên</li>
                <li>Bearish Flag: Downtrend → Flag nghiêng lên → Breakout xuống</li>
                <li>Volume giảm trong Flag, tăng mạnh khi breakout</li>
                <li>Price Target = Breakout ± Chiều cao Flagpole</li>
                <li>Flag không nên retrace quá 50% của Flagpole</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">1. Trong Bearish Flag, phần Flag nghiêng theo hướng nào?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Nghiêng lên (ngược hướng trend giảm)</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Nghiêng xuống (cùng hướng trend giảm)</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Đi ngang</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Khi nào Flag Pattern có thể không còn hợp lệ?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Khi Flag retrace 20% của Flagpole</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Khi Flag kéo dài 1 tuần</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Khi Flag retrace quá 50% của Flagpole</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Kết quả: <span id="correct-count">0</span>/2</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </div>

        <div class="lesson-footer">
            <p>© 2024 GEM Trading Academy - Tier 3 Elite</p>
        </div>
    </div>

    <script>
        const totalQuestions = 2; let answeredCount = 0; let correctCount = 0;
        document.querySelectorAll(''.quiz-question'').forEach(question => {
            const correctIndex = parseInt(question.dataset.correct);
            const options = question.querySelectorAll(''.quiz-option'');
            const result = question.querySelector(''.quiz-result'');
            options.forEach(option => {
                option.addEventListener(''click'', function() {
                    if (question.classList.contains(''answered'')) return;
                    question.classList.add(''answered''); answeredCount++;
                    const selectedIndex = parseInt(this.dataset.index);
                    if (selectedIndex === correctIndex) { this.classList.add(''correct''); result.textContent = ''✓ Chính xác!''; result.className = ''quiz-result show correct''; correctCount++; }
                    else { this.classList.add(''incorrect''); options[correctIndex].classList.add(''correct''); result.textContent = ''✗ Chưa đúng.''; result.className = ''quiz-result show incorrect''; }
                    if (answeredCount === totalQuestions) { document.getElementById(''correct-count'').textContent = correctCount; document.querySelector(''.quiz-score'').classList.add(''show''); }
                });
            });
        });
    </script>
</body>
</html>',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 1.2: Bullish vs Bearish Flag</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a0a2e 0%, #0a0a0f 100%); padding: 2rem 1.5rem; border-bottom: 3px solid #8B5CF6; }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #8B5CF6, #7c3aed); color: #fff; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: #a1a1aa; font-size: 0.9rem; }
        .content-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .section-label { display: inline-block; background: rgba(139, 92, 246, 0.2); color: #8B5CF6; padding: 0.2rem 0.6rem; border-radius: 0.375rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.75rem; }
        .section-title { font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border-color: rgba(16, 185, 129, 0.3); }
        .highlight-box.red { background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05)); border-color: rgba(239, 68, 68, 0.3); }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; }
        .grid-item.green { border-color: #10B981; background: rgba(16, 185, 129, 0.05); }
        .grid-item.red { border-color: #ef4444; background: rgba(239, 68, 68, 0.05); }
        .comparison-table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }
        .comparison-table th { background: #27272a; padding: 0.75rem; text-align: left; font-weight: 600; }
        .comparison-table th:nth-child(2) { color: #10B981; }
        .comparison-table th:nth-child(3) { color: #ef4444; }
        .comparison-table td { padding: 0.75rem; border-bottom: 1px solid #27272a; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #0a0a0f); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .step-list { list-style: none; margin: 1rem 0; }
        .step-list li { padding: 0.75rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.02); border-radius: 0.375rem; border-left: 3px solid #8B5CF6; }
        .summary-box { background: linear-gradient(135deg, #1a0a2e, #0a0a0f); border: 1px solid #8B5CF6; border-radius: 0.75rem; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #8B5CF6; margin-bottom: 1rem; }
        .summary-list { list-style: none; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
        .summary-list li::before { content: "→"; position: absolute; left: 0; color: #8B5CF6; }
        .quiz-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .quiz-question { background: rgba(255, 255, 255, 0.02); padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .question-text { font-weight: 600; color: #fff; margin-bottom: 1rem; }
        .quiz-option { padding: 0.875rem 1rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.03); border: 1px solid #27272a; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; }
        .quiz-option:hover { border-color: #8B5CF6; background: rgba(139, 92, 246, 0.1); }
        .quiz-option.correct { border-color: #10B981; background: rgba(16, 185, 129, 0.2); }
        .quiz-option.incorrect { border-color: #ef4444; background: rgba(239, 68, 68, 0.2); }
        .option-letter { width: 24px; height: 24px; border-radius: 50%; background: #27272a; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
        .quiz-result { padding: 0.75rem; margin-top: 0.75rem; border-radius: 0.375rem; font-weight: 500; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border-radius: 0.5rem; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .score-text { font-size: 1.5rem; font-weight: 700; color: #8B5CF6; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #7c3aed); color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.8rem; border-top: 1px solid #27272a; margin-top: 2rem; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0; border-radius: 0; border-left: 4px solid #27272a; border-right: none; border-top: none; border-bottom: 1px solid #27272a; padding: 1.25rem 1rem; }
            .summary-box, .quiz-section { margin: 0; border-radius: 0; }
            .grid-2 { grid-template-columns: 1fr; gap: 0.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="lesson-header">
            <span class="lesson-badge">Tier 3 Elite</span>
            <h1 class="lesson-title">Bài 1.2: Bullish vs Bearish Flag</h1>
            <p class="lesson-subtitle">Phân biệt và giao dịch 2 loại Flag Pattern</p>
        </div>

        <div class="content-section">
            <span class="section-label">📈 Bullish Flag</span>
            <h2 class="section-title">Bullish Flag - Cờ Tăng</h2>

            <div class="highlight-box green">
                <p><strong>🟢 Đặc điểm Bullish Flag:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Xuất hiện trong uptrend (xu hướng tăng)</li>
                    <li>Flagpole: Giá tăng mạnh với volume cao</li>
                    <li>Flag: Nghiêng xuống nhẹ (correction nhẹ)</li>
                    <li>Breakout: Phá vỡ lên trên với volume tăng</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/0a2e1a/10B981?text=Bullish+Flag+-+Anatomy" alt="Bullish Flag">
                <p class="image-caption">Hình 1.2.1: Cấu trúc Bullish Flag Pattern</p>
            </div>

            <ul class="step-list">
                <li><strong>Entry Point:</strong> Khi giá breakout lên trên đường trendline trên của Flag</li>
                <li><strong>Stop Loss:</strong> Dưới đáy của Flag hoặc dưới đường trendline dưới</li>
                <li><strong>Take Profit:</strong> Entry + Chiều cao Flagpole</li>
            </ul>
        </div>

        <div class="content-section">
            <span class="section-label">📉 Bearish Flag</span>
            <h2 class="section-title">Bearish Flag - Cờ Giảm</h2>

            <div class="highlight-box red">
                <p><strong>🔴 Đặc điểm Bearish Flag:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Xuất hiện trong downtrend (xu hướng giảm)</li>
                    <li>Flagpole: Giá giảm mạnh với volume cao</li>
                    <li>Flag: Nghiêng lên nhẹ (bounce nhẹ)</li>
                    <li>Breakout: Phá vỡ xuống dưới với volume tăng</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/2e0a0a/ef4444?text=Bearish+Flag+-+Anatomy" alt="Bearish Flag">
                <p class="image-caption">Hình 1.2.2: Cấu trúc Bearish Flag Pattern</p>
            </div>

            <ul class="step-list">
                <li><strong>Entry Point:</strong> Khi giá breakout xuống dưới đường trendline dưới của Flag</li>
                <li><strong>Stop Loss:</strong> Trên đỉnh của Flag hoặc trên đường trendline trên</li>
                <li><strong>Take Profit:</strong> Entry - Chiều cao Flagpole</li>
            </ul>
        </div>

        <div class="content-section">
            <span class="section-label">⚖️ So sánh</span>
            <h2 class="section-title">Bảng So Sánh Chi Tiết</h2>

            <table class="comparison-table">
                <tr>
                    <th>Tiêu Chí</th>
                    <th>Bullish Flag</th>
                    <th>Bearish Flag</th>
                </tr>
                <tr>
                    <td>Trend chính</td>
                    <td>Uptrend</td>
                    <td>Downtrend</td>
                </tr>
                <tr>
                    <td>Flagpole</td>
                    <td>Tăng mạnh</td>
                    <td>Giảm mạnh</td>
                </tr>
                <tr>
                    <td>Flag nghiêng</td>
                    <td>Nghiêng xuống</td>
                    <td>Nghiêng lên</td>
                </tr>
                <tr>
                    <td>Breakout</td>
                    <td>Phá vỡ lên</td>
                    <td>Phá vỡ xuống</td>
                </tr>
                <tr>
                    <td>Lệnh</td>
                    <td>Long (Buy)</td>
                    <td>Short (Sell)</td>
                </tr>
                <tr>
                    <td>Volume</td>
                    <td>Tăng khi breakout</td>
                    <td>Tăng khi breakout</td>
                </tr>
            </table>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/8B5CF6?text=Bullish+vs+Bearish+Flag+-+Side+by+Side" alt="Comparison">
                <p class="image-caption">Hình 1.2.3: So sánh song song 2 loại Flag</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚠️ Cảnh báo</span>
            <h2 class="section-title">Những Điểm Cần Lưu Ý</h2>

            <div class="grid-2">
                <div class="grid-item green">
                    <h4 style="color: #10B981; margin-bottom: 0.5rem;">✓ Dấu Hiệu Tốt</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>Volume giảm trong Flag</li>
                        <li>Flag ngắn (1-3 tuần)</li>
                        <li>Độ dốc Flag vừa phải</li>
                        <li>Breakout với volume cao</li>
                    </ul>
                </div>
                <div class="grid-item red">
                    <h4 style="color: #ef4444; margin-bottom: 0.5rem;">✗ Dấu Hiệu Xấu</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>Volume tăng trong Flag</li>
                        <li>Flag kéo dài quá lâu</li>
                        <li>Flag quá dốc (có thể là reversal)</li>
                        <li>Breakout thiếu volume</li>
                    </ul>
                </div>
            </div>

            <div class="highlight-box">
                <p><strong>💡 Pro Tip:</strong> Nếu Flag retrace quá 50% của Flagpole, đó có thể không còn là Flag Pattern nữa. Hãy cẩn thận và chờ xác nhận thêm.</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🎯 Mục tiêu giá</span>
            <h2 class="section-title">Cách Tính Price Target</h2>

            <div class="highlight-box">
                <p><strong>📐 Công thức:</strong></p>
                <p style="margin-top: 0.5rem; font-size: 1.1rem; color: #8B5CF6;"><strong>Target = Breakout Point ± Chiều cao Flagpole</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Bullish: Target = Breakout + Flagpole height</li>
                    <li>Bearish: Target = Breakout - Flagpole height</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/FFBD59?text=Price+Target+Calculation" alt="Price Target">
                <p class="image-caption">Hình 1.2.4: Cách tính mục tiêu giá cho Flag Pattern</p>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Bullish Flag: Uptrend → Flag nghiêng xuống → Breakout lên</li>
                <li>Bearish Flag: Downtrend → Flag nghiêng lên → Breakout xuống</li>
                <li>Volume giảm trong Flag, tăng mạnh khi breakout</li>
                <li>Price Target = Breakout ± Chiều cao Flagpole</li>
                <li>Flag không nên retrace quá 50% của Flagpole</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">1. Trong Bearish Flag, phần Flag nghiêng theo hướng nào?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Nghiêng lên (ngược hướng trend giảm)</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Nghiêng xuống (cùng hướng trend giảm)</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Đi ngang</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Khi nào Flag Pattern có thể không còn hợp lệ?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Khi Flag retrace 20% của Flagpole</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Khi Flag kéo dài 1 tuần</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Khi Flag retrace quá 50% của Flagpole</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Kết quả: <span id="correct-count">0</span>/2</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </div>

        <div class="lesson-footer">
            <p>© 2024 GEM Trading Academy - Tier 3 Elite</p>
        </div>
    </div>

    <script>
        const totalQuestions = 2; let answeredCount = 0; let correctCount = 0;
        document.querySelectorAll(''.quiz-question'').forEach(question => {
            const correctIndex = parseInt(question.dataset.correct);
            const options = question.querySelectorAll(''.quiz-option'');
            const result = question.querySelector(''.quiz-result'');
            options.forEach(option => {
                option.addEventListener(''click'', function() {
                    if (question.classList.contains(''answered'')) return;
                    question.classList.add(''answered''); answeredCount++;
                    const selectedIndex = parseInt(this.dataset.index);
                    if (selectedIndex === correctIndex) { this.classList.add(''correct''); result.textContent = ''✓ Chính xác!''; result.className = ''quiz-result show correct''; correctCount++; }
                    else { this.classList.add(''incorrect''); options[correctIndex].classList.add(''correct''); result.textContent = ''✗ Chưa đúng.''; result.className = ''quiz-result show incorrect''; }
                    if (answeredCount === totalQuestions) { document.getElementById(''correct-count'').textContent = correctCount; document.querySelector(''.quiz-score'').classList.add(''show''); }
                });
            });
        });
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

-- Lesson 1.3: Pennant Pattern
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch1-l3',
  'module-tier-3-ch1',
  'course-tier3-trading-mastery',
  'Bài 1.3: Pennant Pattern',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 1.3: Pennant Pattern</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a0a2e 0%, #0a0a0f 100%); padding: 2rem 1.5rem; border-bottom: 3px solid #8B5CF6; }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #8B5CF6, #7c3aed); color: #fff; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: #a1a1aa; font-size: 0.9rem; }
        .content-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .section-label { display: inline-block; background: rgba(139, 92, 246, 0.2); color: #8B5CF6; padding: 0.2rem 0.6rem; border-radius: 0.375rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.75rem; }
        .section-title { font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.05)); border-color: rgba(255, 189, 89, 0.3); }
        .highlight-box.cyan { background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.05)); border-color: rgba(0, 240, 255, 0.3); }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; }
        .grid-item.purple { border-left: 3px solid #8B5CF6; }
        .grid-item.gold { border-left: 3px solid #FFBD59; }
        .grid-item.cyan { border-left: 3px solid #00F0FF; }
        .grid-item.green { border-left: 3px solid #10B981; }
        .phase-card { display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; background: rgba(255, 255, 255, 0.02); border-radius: 0.5rem; border-left: 3px solid #8B5CF6; }
        .phase-number { width: 40px; height: 40px; background: linear-gradient(135deg, #8B5CF6, #7c3aed); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; flex-shrink: 0; }
        .phase-content h4 { color: #fff; margin-bottom: 0.5rem; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #0a0a0f); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .comparison-table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }
        .comparison-table th { background: #27272a; padding: 0.75rem; text-align: left; font-weight: 600; color: #8B5CF6; }
        .comparison-table td { padding: 0.75rem; border-bottom: 1px solid #27272a; }
        .summary-box { background: linear-gradient(135deg, #1a0a2e, #0a0a0f); border: 1px solid #8B5CF6; border-radius: 0.75rem; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #8B5CF6; margin-bottom: 1rem; }
        .summary-list { list-style: none; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
        .summary-list li::before { content: "→"; position: absolute; left: 0; color: #8B5CF6; }
        .quiz-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .quiz-question { background: rgba(255, 255, 255, 0.02); padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .question-text { font-weight: 600; color: #fff; margin-bottom: 1rem; }
        .quiz-option { padding: 0.875rem 1rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.03); border: 1px solid #27272a; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; }
        .quiz-option:hover { border-color: #8B5CF6; background: rgba(139, 92, 246, 0.1); }
        .quiz-option.correct { border-color: #10B981; background: rgba(16, 185, 129, 0.2); }
        .quiz-option.incorrect { border-color: #ef4444; background: rgba(239, 68, 68, 0.2); }
        .option-letter { width: 24px; height: 24px; border-radius: 50%; background: #27272a; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
        .quiz-result { padding: 0.75rem; margin-top: 0.75rem; border-radius: 0.375rem; font-weight: 500; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border-radius: 0.5rem; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .score-text { font-size: 1.5rem; font-weight: 700; color: #8B5CF6; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #7c3aed); color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.8rem; border-top: 1px solid #27272a; margin-top: 2rem; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0; border-radius: 0; border-left: 4px solid #27272a; border-right: none; border-top: none; border-bottom: 1px solid #27272a; padding: 1.25rem 1rem; }
            .summary-box, .quiz-section { margin: 0; border-radius: 0; }
            .grid-2 { grid-template-columns: 1fr; gap: 0.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="lesson-header">
            <span class="lesson-badge">Tier 3 Elite</span>
            <h1 class="lesson-title">Bài 1.3: Pennant Pattern</h1>
            <p class="lesson-subtitle">Pattern tam giác nhỏ - anh em với Flag Pattern</p>
        </div>

        <div class="content-section">
            <span class="section-label">📚 Định nghĩa</span>
            <h2 class="section-title">Pennant Pattern Là Gì?</h2>
            <p>Pennant Pattern (Cờ Đuôi Nheo) là continuation pattern tương tự như Flag, nhưng thay vì có hình chữ nhật, nó có hình tam giác nhỏ hội tụ. Pattern này cũng xuất hiện sau một đợt di chuyển giá mạnh.</p>

            <div class="highlight-box">
                <p><strong>🔺 Định nghĩa:</strong></p>
                <p style="margin-top: 0.5rem;">Pennant là sự consolidation ngắn hạn có hình dạng tam giác đối xứng nhỏ, hình thành sau một flagpole mạnh. Các đường trendline hội tụ tại một điểm (apex).</p>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x400/1a0a2e/8B5CF6?text=Pennant+Pattern+-+Structure" alt="Pennant Pattern">
                <p class="image-caption">Hình 1.3.1: Cấu trúc Pennant Pattern</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🔧 Cấu trúc</span>
            <h2 class="section-title">3 Thành Phần Của Pennant</h2>

            <div class="phase-card">
                <div class="phase-number">1</div>
                <div class="phase-content">
                    <h4>Flagpole (Cột Cờ)</h4>
                    <p>Giống như Flag, Pennant cũng bắt đầu bằng một đợt di chuyển giá mạnh và nhanh với volume cao.</p>
                </div>
            </div>

            <div class="phase-card">
                <div class="phase-number">2</div>
                <div class="phase-content">
                    <h4>Pennant (Tam Giác)</h4>
                    <p>Giai đoạn consolidation hình tam giác nhỏ. Các đường trendline trên và dưới hội tụ dần. Volume giảm trong giai đoạn này.</p>
                </div>
            </div>

            <div class="phase-card">
                <div class="phase-number">3</div>
                <div class="phase-content">
                    <h4>Breakout</h4>
                    <p>Giá phá vỡ theo hướng của trend ban đầu. Breakout thường xảy ra trước khi giá đến apex (đỉnh tam giác).</p>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚖️ So sánh</span>
            <h2 class="section-title">Flag vs Pennant - Điểm Khác Biệt</h2>

            <table class="comparison-table">
                <tr>
                    <th>Đặc Điểm</th>
                    <th>Flag</th>
                    <th>Pennant</th>
                </tr>
                <tr>
                    <td>Hình dạng</td>
                    <td>Hình chữ nhật (parallelogram)</td>
                    <td>Hình tam giác (triangle)</td>
                </tr>
                <tr>
                    <td>Đường biên</td>
                    <td>Song song</td>
                    <td>Hội tụ</td>
                </tr>
                <tr>
                    <td>Độ nghiêng</td>
                    <td>Nghiêng ngược trend</td>
                    <td>Đối xứng (không nghiêng)</td>
                </tr>
                <tr>
                    <td>Thời gian</td>
                    <td>1-3 tuần</td>
                    <td>1-3 tuần (thường ngắn hơn)</td>
                </tr>
                <tr>
                    <td>Điểm breakout</td>
                    <td>Phá đường biên song song</td>
                    <td>Phá trước khi đến apex</td>
                </tr>
            </table>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/00F0FF?text=Flag+vs+Pennant+-+Comparison" alt="Flag vs Pennant">
                <p class="image-caption">Hình 1.3.2: So sánh trực quan Flag và Pennant</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📈📉 Hai loại</span>
            <h2 class="section-title">Bullish Pennant vs Bearish Pennant</h2>

            <div class="grid-2">
                <div class="grid-item green">
                    <h4 style="color: #10B981; margin-bottom: 0.5rem;">🟢 Bullish Pennant</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>Xuất hiện trong uptrend</li>
                        <li>Flagpole tăng mạnh</li>
                        <li>Pennant hội tụ</li>
                        <li>Breakout lên trên</li>
                    </ul>
                </div>
                <div class="grid-item" style="border-left: 3px solid #ef4444;">
                    <h4 style="color: #ef4444; margin-bottom: 0.5rem;">🔴 Bearish Pennant</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>Xuất hiện trong downtrend</li>
                        <li>Flagpole giảm mạnh</li>
                        <li>Pennant hội tụ</li>
                        <li>Breakout xuống dưới</li>
                    </ul>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/FFBD59?text=Bullish+vs+Bearish+Pennant" alt="Pennant Types">
                <p class="image-caption">Hình 1.3.3: Hai loại Pennant Pattern</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🎯 Giao dịch</span>
            <h2 class="section-title">Cách Trading Pennant</h2>

            <div class="highlight-box gold">
                <p><strong>📋 Quy tắc trading Pennant:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li><strong>Entry:</strong> Khi giá breakout khỏi đường biên Pennant</li>
                    <li><strong>Stop Loss:</strong> Đặt ở phía đối diện của Pennant</li>
                    <li><strong>Target:</strong> Entry ± Chiều cao Flagpole</li>
                    <li><strong>Confirmation:</strong> Volume tăng mạnh khi breakout</li>
                </ul>
            </div>

            <div class="highlight-box cyan">
                <p><strong>⚠️ Lưu ý quan trọng:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Breakout nên xảy ra trong 2/3 đầu của Pennant</li>
                    <li>Nếu giá đi đến apex mà chưa breakout → pattern yếu</li>
                    <li>Volume giảm trong Pennant là dấu hiệu tích cực</li>
                </ul>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Pennant là continuation pattern hình tam giác nhỏ</li>
                <li>Khác với Flag: đường biên hội tụ thay vì song song</li>
                <li>3 thành phần: Flagpole, Pennant (triangle), Breakout</li>
                <li>Breakout nên xảy ra trước khi giá đến apex</li>
                <li>Target = Entry ± Chiều cao Flagpole</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Điểm khác biệt chính giữa Flag và Pennant là gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Flag có volume cao hơn Pennant</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Flag có đường biên song song, Pennant có đường biên hội tụ</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Flag xuất hiện trong uptrend, Pennant xuất hiện trong downtrend</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">2. Breakout của Pennant nên xảy ra khi nào?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Trong 2/3 đầu của Pennant, trước khi đến apex</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Tại apex của Pennant</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Sau khi giá vượt qua apex</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Kết quả: <span id="correct-count">0</span>/2</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </div>

        <div class="lesson-footer">
            <p>© 2024 GEM Trading Academy - Tier 3 Elite</p>
        </div>
    </div>

    <script>
        const totalQuestions = 2; let answeredCount = 0; let correctCount = 0;
        document.querySelectorAll(''.quiz-question'').forEach(question => {
            const correctIndex = parseInt(question.dataset.correct);
            const options = question.querySelectorAll(''.quiz-option'');
            const result = question.querySelector(''.quiz-result'');
            options.forEach(option => {
                option.addEventListener(''click'', function() {
                    if (question.classList.contains(''answered'')) return;
                    question.classList.add(''answered''); answeredCount++;
                    const selectedIndex = parseInt(this.dataset.index);
                    if (selectedIndex === correctIndex) { this.classList.add(''correct''); result.textContent = ''✓ Chính xác!''; result.className = ''quiz-result show correct''; correctCount++; }
                    else { this.classList.add(''incorrect''); options[correctIndex].classList.add(''correct''); result.textContent = ''✗ Chưa đúng.''; result.className = ''quiz-result show incorrect''; }
                    if (answeredCount === totalQuestions) { document.getElementById(''correct-count'').textContent = correctCount; document.querySelector(''.quiz-score'').classList.add(''show''); }
                });
            });
        });
    </script>
</body>
</html>',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 1.3: Pennant Pattern</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a0a2e 0%, #0a0a0f 100%); padding: 2rem 1.5rem; border-bottom: 3px solid #8B5CF6; }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #8B5CF6, #7c3aed); color: #fff; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: #a1a1aa; font-size: 0.9rem; }
        .content-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .section-label { display: inline-block; background: rgba(139, 92, 246, 0.2); color: #8B5CF6; padding: 0.2rem 0.6rem; border-radius: 0.375rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.75rem; }
        .section-title { font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.05)); border-color: rgba(255, 189, 89, 0.3); }
        .highlight-box.cyan { background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.05)); border-color: rgba(0, 240, 255, 0.3); }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; }
        .grid-item.purple { border-left: 3px solid #8B5CF6; }
        .grid-item.gold { border-left: 3px solid #FFBD59; }
        .grid-item.cyan { border-left: 3px solid #00F0FF; }
        .grid-item.green { border-left: 3px solid #10B981; }
        .phase-card { display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; background: rgba(255, 255, 255, 0.02); border-radius: 0.5rem; border-left: 3px solid #8B5CF6; }
        .phase-number { width: 40px; height: 40px; background: linear-gradient(135deg, #8B5CF6, #7c3aed); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; flex-shrink: 0; }
        .phase-content h4 { color: #fff; margin-bottom: 0.5rem; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #0a0a0f); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .comparison-table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }
        .comparison-table th { background: #27272a; padding: 0.75rem; text-align: left; font-weight: 600; color: #8B5CF6; }
        .comparison-table td { padding: 0.75rem; border-bottom: 1px solid #27272a; }
        .summary-box { background: linear-gradient(135deg, #1a0a2e, #0a0a0f); border: 1px solid #8B5CF6; border-radius: 0.75rem; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #8B5CF6; margin-bottom: 1rem; }
        .summary-list { list-style: none; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
        .summary-list li::before { content: "→"; position: absolute; left: 0; color: #8B5CF6; }
        .quiz-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .quiz-question { background: rgba(255, 255, 255, 0.02); padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .question-text { font-weight: 600; color: #fff; margin-bottom: 1rem; }
        .quiz-option { padding: 0.875rem 1rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.03); border: 1px solid #27272a; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; }
        .quiz-option:hover { border-color: #8B5CF6; background: rgba(139, 92, 246, 0.1); }
        .quiz-option.correct { border-color: #10B981; background: rgba(16, 185, 129, 0.2); }
        .quiz-option.incorrect { border-color: #ef4444; background: rgba(239, 68, 68, 0.2); }
        .option-letter { width: 24px; height: 24px; border-radius: 50%; background: #27272a; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
        .quiz-result { padding: 0.75rem; margin-top: 0.75rem; border-radius: 0.375rem; font-weight: 500; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border-radius: 0.5rem; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .score-text { font-size: 1.5rem; font-weight: 700; color: #8B5CF6; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #7c3aed); color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.8rem; border-top: 1px solid #27272a; margin-top: 2rem; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0; border-radius: 0; border-left: 4px solid #27272a; border-right: none; border-top: none; border-bottom: 1px solid #27272a; padding: 1.25rem 1rem; }
            .summary-box, .quiz-section { margin: 0; border-radius: 0; }
            .grid-2 { grid-template-columns: 1fr; gap: 0.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="lesson-header">
            <span class="lesson-badge">Tier 3 Elite</span>
            <h1 class="lesson-title">Bài 1.3: Pennant Pattern</h1>
            <p class="lesson-subtitle">Pattern tam giác nhỏ - anh em với Flag Pattern</p>
        </div>

        <div class="content-section">
            <span class="section-label">📚 Định nghĩa</span>
            <h2 class="section-title">Pennant Pattern Là Gì?</h2>
            <p>Pennant Pattern (Cờ Đuôi Nheo) là continuation pattern tương tự như Flag, nhưng thay vì có hình chữ nhật, nó có hình tam giác nhỏ hội tụ. Pattern này cũng xuất hiện sau một đợt di chuyển giá mạnh.</p>

            <div class="highlight-box">
                <p><strong>🔺 Định nghĩa:</strong></p>
                <p style="margin-top: 0.5rem;">Pennant là sự consolidation ngắn hạn có hình dạng tam giác đối xứng nhỏ, hình thành sau một flagpole mạnh. Các đường trendline hội tụ tại một điểm (apex).</p>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x400/1a0a2e/8B5CF6?text=Pennant+Pattern+-+Structure" alt="Pennant Pattern">
                <p class="image-caption">Hình 1.3.1: Cấu trúc Pennant Pattern</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🔧 Cấu trúc</span>
            <h2 class="section-title">3 Thành Phần Của Pennant</h2>

            <div class="phase-card">
                <div class="phase-number">1</div>
                <div class="phase-content">
                    <h4>Flagpole (Cột Cờ)</h4>
                    <p>Giống như Flag, Pennant cũng bắt đầu bằng một đợt di chuyển giá mạnh và nhanh với volume cao.</p>
                </div>
            </div>

            <div class="phase-card">
                <div class="phase-number">2</div>
                <div class="phase-content">
                    <h4>Pennant (Tam Giác)</h4>
                    <p>Giai đoạn consolidation hình tam giác nhỏ. Các đường trendline trên và dưới hội tụ dần. Volume giảm trong giai đoạn này.</p>
                </div>
            </div>

            <div class="phase-card">
                <div class="phase-number">3</div>
                <div class="phase-content">
                    <h4>Breakout</h4>
                    <p>Giá phá vỡ theo hướng của trend ban đầu. Breakout thường xảy ra trước khi giá đến apex (đỉnh tam giác).</p>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚖️ So sánh</span>
            <h2 class="section-title">Flag vs Pennant - Điểm Khác Biệt</h2>

            <table class="comparison-table">
                <tr>
                    <th>Đặc Điểm</th>
                    <th>Flag</th>
                    <th>Pennant</th>
                </tr>
                <tr>
                    <td>Hình dạng</td>
                    <td>Hình chữ nhật (parallelogram)</td>
                    <td>Hình tam giác (triangle)</td>
                </tr>
                <tr>
                    <td>Đường biên</td>
                    <td>Song song</td>
                    <td>Hội tụ</td>
                </tr>
                <tr>
                    <td>Độ nghiêng</td>
                    <td>Nghiêng ngược trend</td>
                    <td>Đối xứng (không nghiêng)</td>
                </tr>
                <tr>
                    <td>Thời gian</td>
                    <td>1-3 tuần</td>
                    <td>1-3 tuần (thường ngắn hơn)</td>
                </tr>
                <tr>
                    <td>Điểm breakout</td>
                    <td>Phá đường biên song song</td>
                    <td>Phá trước khi đến apex</td>
                </tr>
            </table>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/00F0FF?text=Flag+vs+Pennant+-+Comparison" alt="Flag vs Pennant">
                <p class="image-caption">Hình 1.3.2: So sánh trực quan Flag và Pennant</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📈📉 Hai loại</span>
            <h2 class="section-title">Bullish Pennant vs Bearish Pennant</h2>

            <div class="grid-2">
                <div class="grid-item green">
                    <h4 style="color: #10B981; margin-bottom: 0.5rem;">🟢 Bullish Pennant</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>Xuất hiện trong uptrend</li>
                        <li>Flagpole tăng mạnh</li>
                        <li>Pennant hội tụ</li>
                        <li>Breakout lên trên</li>
                    </ul>
                </div>
                <div class="grid-item" style="border-left: 3px solid #ef4444;">
                    <h4 style="color: #ef4444; margin-bottom: 0.5rem;">🔴 Bearish Pennant</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>Xuất hiện trong downtrend</li>
                        <li>Flagpole giảm mạnh</li>
                        <li>Pennant hội tụ</li>
                        <li>Breakout xuống dưới</li>
                    </ul>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/FFBD59?text=Bullish+vs+Bearish+Pennant" alt="Pennant Types">
                <p class="image-caption">Hình 1.3.3: Hai loại Pennant Pattern</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🎯 Giao dịch</span>
            <h2 class="section-title">Cách Trading Pennant</h2>

            <div class="highlight-box gold">
                <p><strong>📋 Quy tắc trading Pennant:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li><strong>Entry:</strong> Khi giá breakout khỏi đường biên Pennant</li>
                    <li><strong>Stop Loss:</strong> Đặt ở phía đối diện của Pennant</li>
                    <li><strong>Target:</strong> Entry ± Chiều cao Flagpole</li>
                    <li><strong>Confirmation:</strong> Volume tăng mạnh khi breakout</li>
                </ul>
            </div>

            <div class="highlight-box cyan">
                <p><strong>⚠️ Lưu ý quan trọng:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Breakout nên xảy ra trong 2/3 đầu của Pennant</li>
                    <li>Nếu giá đi đến apex mà chưa breakout → pattern yếu</li>
                    <li>Volume giảm trong Pennant là dấu hiệu tích cực</li>
                </ul>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Pennant là continuation pattern hình tam giác nhỏ</li>
                <li>Khác với Flag: đường biên hội tụ thay vì song song</li>
                <li>3 thành phần: Flagpole, Pennant (triangle), Breakout</li>
                <li>Breakout nên xảy ra trước khi giá đến apex</li>
                <li>Target = Entry ± Chiều cao Flagpole</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Điểm khác biệt chính giữa Flag và Pennant là gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Flag có volume cao hơn Pennant</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Flag có đường biên song song, Pennant có đường biên hội tụ</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Flag xuất hiện trong uptrend, Pennant xuất hiện trong downtrend</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">2. Breakout của Pennant nên xảy ra khi nào?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Trong 2/3 đầu của Pennant, trước khi đến apex</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Tại apex của Pennant</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Sau khi giá vượt qua apex</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Kết quả: <span id="correct-count">0</span>/2</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </div>

        <div class="lesson-footer">
            <p>© 2024 GEM Trading Academy - Tier 3 Elite</p>
        </div>
    </div>

    <script>
        const totalQuestions = 2; let answeredCount = 0; let correctCount = 0;
        document.querySelectorAll(''.quiz-question'').forEach(question => {
            const correctIndex = parseInt(question.dataset.correct);
            const options = question.querySelectorAll(''.quiz-option'');
            const result = question.querySelector(''.quiz-result'');
            options.forEach(option => {
                option.addEventListener(''click'', function() {
                    if (question.classList.contains(''answered'')) return;
                    question.classList.add(''answered''); answeredCount++;
                    const selectedIndex = parseInt(this.dataset.index);
                    if (selectedIndex === correctIndex) { this.classList.add(''correct''); result.textContent = ''✓ Chính xác!''; result.className = ''quiz-result show correct''; correctCount++; }
                    else { this.classList.add(''incorrect''); options[correctIndex].classList.add(''correct''); result.textContent = ''✗ Chưa đúng.''; result.className = ''quiz-result show incorrect''; }
                    if (answeredCount === totalQuestions) { document.getElementById(''correct-count'').textContent = correctCount; document.querySelector(''.quiz-score'').classList.add(''show''); }
                });
            });
        });
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

-- Lesson 1.4: Trading Flag & Pennant
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch1-l4',
  'module-tier-3-ch1',
  'course-tier3-trading-mastery',
  'Bài 1.4: Trading Flag & Pennant',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 1.4: Trading Flag & Pennant</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a0a2e 0%, #0a0a0f 100%); padding: 2rem 1.5rem; border-bottom: 3px solid #8B5CF6; }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #8B5CF6, #7c3aed); color: #fff; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: #a1a1aa; font-size: 0.9rem; }
        .content-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .section-label { display: inline-block; background: rgba(139, 92, 246, 0.2); color: #8B5CF6; padding: 0.2rem 0.6rem; border-radius: 0.375rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.75rem; }
        .section-title { font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.05)); border-color: rgba(255, 189, 89, 0.3); }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border-color: rgba(16, 185, 129, 0.3); }
        .highlight-box.red { background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05)); border-color: rgba(239, 68, 68, 0.3); }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; }
        .grid-item.purple { border-left: 3px solid #8B5CF6; }
        .grid-item.gold { border-left: 3px solid #FFBD59; }
        .grid-item.green { border-left: 3px solid #10B981; }
        .grid-item.red { border-left: 3px solid #ef4444; }
        .step-card { display: flex; gap: 1rem; margin: 1rem 0; padding: 1.25rem; background: rgba(255, 255, 255, 0.02); border-radius: 0.5rem; border-left: 4px solid #8B5CF6; }
        .step-number { width: 48px; height: 48px; background: linear-gradient(135deg, #8B5CF6, #7c3aed); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700; color: #fff; flex-shrink: 0; }
        .step-content h4 { color: #fff; margin-bottom: 0.5rem; }
        .checklist { list-style: none; margin: 1rem 0; }
        .checklist li { padding: 0.5rem; margin: 0.25rem 0; background: rgba(255, 255, 255, 0.02); border-radius: 0.375rem; display: flex; align-items: center; gap: 0.5rem; }
        .checklist li::before { content: "☐"; color: #8B5CF6; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #0a0a0f); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .summary-box { background: linear-gradient(135deg, #1a0a2e, #0a0a0f); border: 1px solid #8B5CF6; border-radius: 0.75rem; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #8B5CF6; margin-bottom: 1rem; }
        .summary-list { list-style: none; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
        .summary-list li::before { content: "→"; position: absolute; left: 0; color: #8B5CF6; }
        .quiz-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .quiz-question { background: rgba(255, 255, 255, 0.02); padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .question-text { font-weight: 600; color: #fff; margin-bottom: 1rem; }
        .quiz-option { padding: 0.875rem 1rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.03); border: 1px solid #27272a; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; }
        .quiz-option:hover { border-color: #8B5CF6; background: rgba(139, 92, 246, 0.1); }
        .quiz-option.correct { border-color: #10B981; background: rgba(16, 185, 129, 0.2); }
        .quiz-option.incorrect { border-color: #ef4444; background: rgba(239, 68, 68, 0.2); }
        .option-letter { width: 24px; height: 24px; border-radius: 50%; background: #27272a; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
        .quiz-result { padding: 0.75rem; margin-top: 0.75rem; border-radius: 0.375rem; font-weight: 500; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border-radius: 0.5rem; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .score-text { font-size: 1.5rem; font-weight: 700; color: #8B5CF6; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #7c3aed); color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.8rem; border-top: 1px solid #27272a; margin-top: 2rem; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0; border-radius: 0; border-left: 4px solid #27272a; border-right: none; border-top: none; border-bottom: 1px solid #27272a; padding: 1.25rem 1rem; }
            .summary-box, .quiz-section { margin: 0; border-radius: 0; }
            .grid-2 { grid-template-columns: 1fr; gap: 0.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="lesson-header">
            <span class="lesson-badge">Tier 3 Elite</span>
            <h1 class="lesson-title">Bài 1.4: Trading Flag & Pennant</h1>
            <p class="lesson-subtitle">Chiến lược giao dịch chi tiết với Flag và Pennant</p>
        </div>

        <div class="content-section">
            <span class="section-label">📋 Quy trình</span>
            <h2 class="section-title">5-Step Trading Process</h2>

            <div class="step-card">
                <div class="step-number">1</div>
                <div class="step-content">
                    <h4>Xác Định Trend Chính</h4>
                    <p>Kiểm tra trend trên timeframe cao hơn. Flag/Pennant hoạt động tốt nhất khi theo hướng trend chính của thị trường.</p>
                </div>
            </div>

            <div class="step-card">
                <div class="step-number">2</div>
                <div class="step-content">
                    <h4>Nhận Diện Pattern</h4>
                    <p>Tìm Flagpole (đợt di chuyển mạnh) + Flag/Pennant (consolidation). Xác nhận volume giảm trong giai đoạn consolidation.</p>
                </div>
            </div>

            <div class="step-card">
                <div class="step-number">3</div>
                <div class="step-content">
                    <h4>Chờ Breakout</h4>
                    <p>Không vào lệnh sớm! Chờ giá phá vỡ đường biên pattern với volume tăng. Có thể chờ retest để entry an toàn hơn.</p>
                </div>
            </div>

            <div class="step-card">
                <div class="step-number">4</div>
                <div class="step-content">
                    <h4>Đặt Stop Loss</h4>
                    <p>SL đặt bên kia pattern: Bullish → dưới đáy Flag/Pennant. Bearish → trên đỉnh Flag/Pennant.</p>
                </div>
            </div>

            <div class="step-card">
                <div class="step-number">5</div>
                <div class="step-content">
                    <h4>Set Take Profit</h4>
                    <p>Target = Entry ± Chiều cao Flagpole. Có thể chia thành TP1, TP2 để quản lý lệnh tốt hơn.</p>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">✅ Checklist</span>
            <h2 class="section-title">Pre-Trade Checklist</h2>

            <ul class="checklist">
                <li>Trend chính trên HTF cùng hướng với pattern?</li>
                <li>Flagpole đủ mạnh và nhanh (volume cao)?</li>
                <li>Consolidation ngắn (1-3 tuần)?</li>
                <li>Volume giảm trong Flag/Pennant?</li>
                <li>Flag không retrace quá 50% Flagpole?</li>
                <li>Breakout có volume confirmation?</li>
                <li>R:R tối thiểu 1:2?</li>
            </ul>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/8B5CF6?text=Trading+Checklist+-+Visualization" alt="Trading Checklist">
                <p class="image-caption">Hình 1.4.1: Pre-trade checklist visualization</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🎯 Entry Strategies</span>
            <h2 class="section-title">3 Chiến Lược Entry</h2>

            <div class="grid-2">
                <div class="grid-item purple">
                    <h4 style="color: #8B5CF6; margin-bottom: 0.5rem;">1. Breakout Entry</h4>
                    <p style="font-size: 0.9rem;">Vào lệnh ngay khi giá breakout. Ưu điểm: Không bỏ lỡ cơ hội. Nhược điểm: Risk cao hơn nếu false breakout.</p>
                </div>
                <div class="grid-item gold">
                    <h4 style="color: #FFBD59; margin-bottom: 0.5rem;">2. Retest Entry</h4>
                    <p style="font-size: 0.9rem;">Chờ giá retest đường biên sau breakout. Ưu điểm: Entry tốt hơn, SL chặt hơn. Nhược điểm: Có thể bỏ lỡ nếu không retest.</p>
                </div>
            </div>

            <div class="highlight-box green">
                <h4 style="color: #10B981; margin-bottom: 0.5rem;">3. Split Entry (Khuyên dùng)</h4>
                <p>Chia position thành 2 phần: 50% vào khi breakout, 50% vào khi retest. Cân bằng giữa opportunity và risk management.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x400/1a0a2e/10B981?text=3+Entry+Strategies+-+Chart+Example" alt="Entry Strategies">
                <p class="image-caption">Hình 1.4.2: 3 chiến lược entry trên chart thực tế</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⛔ Stop Loss</span>
            <h2 class="section-title">Đặt Stop Loss Đúng Cách</h2>

            <div class="grid-2">
                <div class="grid-item green">
                    <h4 style="color: #10B981; margin-bottom: 0.5rem;">Bullish Flag/Pennant</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>SL dưới đáy của pattern</li>
                        <li>Hoặc dưới đường trendline dưới</li>
                        <li>Buffer: 1-2 ATR bên dưới</li>
                    </ul>
                </div>
                <div class="grid-item red">
                    <h4 style="color: #ef4444; margin-bottom: 0.5rem;">Bearish Flag/Pennant</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>SL trên đỉnh của pattern</li>
                        <li>Hoặc trên đường trendline trên</li>
                        <li>Buffer: 1-2 ATR bên trên</li>
                    </ul>
                </div>
            </div>

            <div class="highlight-box gold">
                <p><strong>💡 Pro Tip:</strong> Sử dụng ATR (Average True Range) để thêm buffer vào SL. Điều này giúp tránh bị stop out do biến động nhỏ.</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">💰 Take Profit</span>
            <h2 class="section-title">Chiến Lược Take Profit</h2>

            <div class="highlight-box">
                <p><strong>📐 Công thức tính Target:</strong></p>
                <p style="margin-top: 0.5rem; font-size: 1.1rem; color: #8B5CF6;"><strong>Target = Entry Point ± Flagpole Height</strong></p>
            </div>

            <div class="grid-2">
                <div class="grid-item purple">
                    <h4 style="color: #8B5CF6; margin-bottom: 0.5rem;">TP1 (50%)</h4>
                    <p style="font-size: 0.9rem;">50% chiều cao Flagpole. Chốt 50% position, move SL to breakeven.</p>
                </div>
                <div class="grid-item gold">
                    <h4 style="color: #FFBD59; margin-bottom: 0.5rem;">TP2 (100%)</h4>
                    <p style="font-size: 0.9rem;">100% chiều cao Flagpole. Chốt 30-40% position còn lại.</p>
                </div>
            </div>

            <div class="highlight-box green">
                <p><strong>TP3 (Trail):</strong> Với 10-20% cuối, trailing stop theo swing high/low. Để profit run nếu trend mạnh.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/FFBD59?text=Multi-TP+Strategy+-+Chart" alt="Multi-TP">
                <p class="image-caption">Hình 1.4.3: Chiến lược Multi-TP trên Flag Pattern</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚠️ Lưu ý</span>
            <h2 class="section-title">Những Lỗi Thường Gặp</h2>

            <div class="highlight-box red">
                <p><strong>❌ Tránh những lỗi sau:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Vào lệnh quá sớm (trước breakout)</li>
                    <li>Không chờ volume confirmation</li>
                    <li>SL quá chặt → bị stop out sớm</li>
                    <li>Không check trend HTF</li>
                    <li>Giao dịch pattern yếu (retrace >50%)</li>
                    <li>FOMO khi đã lỡ breakout</li>
                </ul>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>5-Step Process: Trend → Pattern → Breakout → SL → TP</li>
                <li>3 Entry Strategies: Breakout, Retest, Split Entry</li>
                <li>SL đặt bên kia pattern với buffer (1-2 ATR)</li>
                <li>Multi-TP: TP1 (50%), TP2 (100%), TP3 (Trail)</li>
                <li>Luôn check pre-trade checklist trước khi vào lệnh</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">1. Split Entry strategy là gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Vào 100% position khi breakout</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Chỉ vào lệnh khi retest</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Chia position: 50% breakout, 50% retest</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">2. Target của Flag/Pennant được tính như thế nào?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Entry + Chiều cao của Flag</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Entry + Chiều cao của Flagpole</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Entry + 2x chiều cao của Flag</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Kết quả: <span id="correct-count">0</span>/2</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </div>

        <div class="lesson-footer">
            <p>© 2024 GEM Trading Academy - Tier 3 Elite</p>
        </div>
    </div>

    <script>
        const totalQuestions = 2; let answeredCount = 0; let correctCount = 0;
        document.querySelectorAll(''.quiz-question'').forEach(question => {
            const correctIndex = parseInt(question.dataset.correct);
            const options = question.querySelectorAll(''.quiz-option'');
            const result = question.querySelector(''.quiz-result'');
            options.forEach(option => {
                option.addEventListener(''click'', function() {
                    if (question.classList.contains(''answered'')) return;
                    question.classList.add(''answered''); answeredCount++;
                    const selectedIndex = parseInt(this.dataset.index);
                    if (selectedIndex === correctIndex) { this.classList.add(''correct''); result.textContent = ''✓ Chính xác!''; result.className = ''quiz-result show correct''; correctCount++; }
                    else { this.classList.add(''incorrect''); options[correctIndex].classList.add(''correct''); result.textContent = ''✗ Chưa đúng.''; result.className = ''quiz-result show incorrect''; }
                    if (answeredCount === totalQuestions) { document.getElementById(''correct-count'').textContent = correctCount; document.querySelector(''.quiz-score'').classList.add(''show''); }
                });
            });
        });
    </script>
</body>
</html>',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 1.4: Trading Flag & Pennant</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a0a2e 0%, #0a0a0f 100%); padding: 2rem 1.5rem; border-bottom: 3px solid #8B5CF6; }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #8B5CF6, #7c3aed); color: #fff; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: #a1a1aa; font-size: 0.9rem; }
        .content-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .section-label { display: inline-block; background: rgba(139, 92, 246, 0.2); color: #8B5CF6; padding: 0.2rem 0.6rem; border-radius: 0.375rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.75rem; }
        .section-title { font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.05)); border-color: rgba(255, 189, 89, 0.3); }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border-color: rgba(16, 185, 129, 0.3); }
        .highlight-box.red { background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05)); border-color: rgba(239, 68, 68, 0.3); }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; }
        .grid-item.purple { border-left: 3px solid #8B5CF6; }
        .grid-item.gold { border-left: 3px solid #FFBD59; }
        .grid-item.green { border-left: 3px solid #10B981; }
        .grid-item.red { border-left: 3px solid #ef4444; }
        .step-card { display: flex; gap: 1rem; margin: 1rem 0; padding: 1.25rem; background: rgba(255, 255, 255, 0.02); border-radius: 0.5rem; border-left: 4px solid #8B5CF6; }
        .step-number { width: 48px; height: 48px; background: linear-gradient(135deg, #8B5CF6, #7c3aed); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700; color: #fff; flex-shrink: 0; }
        .step-content h4 { color: #fff; margin-bottom: 0.5rem; }
        .checklist { list-style: none; margin: 1rem 0; }
        .checklist li { padding: 0.5rem; margin: 0.25rem 0; background: rgba(255, 255, 255, 0.02); border-radius: 0.375rem; display: flex; align-items: center; gap: 0.5rem; }
        .checklist li::before { content: "☐"; color: #8B5CF6; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #0a0a0f); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .summary-box { background: linear-gradient(135deg, #1a0a2e, #0a0a0f); border: 1px solid #8B5CF6; border-radius: 0.75rem; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #8B5CF6; margin-bottom: 1rem; }
        .summary-list { list-style: none; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
        .summary-list li::before { content: "→"; position: absolute; left: 0; color: #8B5CF6; }
        .quiz-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .quiz-question { background: rgba(255, 255, 255, 0.02); padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .question-text { font-weight: 600; color: #fff; margin-bottom: 1rem; }
        .quiz-option { padding: 0.875rem 1rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.03); border: 1px solid #27272a; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; }
        .quiz-option:hover { border-color: #8B5CF6; background: rgba(139, 92, 246, 0.1); }
        .quiz-option.correct { border-color: #10B981; background: rgba(16, 185, 129, 0.2); }
        .quiz-option.incorrect { border-color: #ef4444; background: rgba(239, 68, 68, 0.2); }
        .option-letter { width: 24px; height: 24px; border-radius: 50%; background: #27272a; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
        .quiz-result { padding: 0.75rem; margin-top: 0.75rem; border-radius: 0.375rem; font-weight: 500; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border-radius: 0.5rem; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .score-text { font-size: 1.5rem; font-weight: 700; color: #8B5CF6; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #7c3aed); color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.8rem; border-top: 1px solid #27272a; margin-top: 2rem; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0; border-radius: 0; border-left: 4px solid #27272a; border-right: none; border-top: none; border-bottom: 1px solid #27272a; padding: 1.25rem 1rem; }
            .summary-box, .quiz-section { margin: 0; border-radius: 0; }
            .grid-2 { grid-template-columns: 1fr; gap: 0.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="lesson-header">
            <span class="lesson-badge">Tier 3 Elite</span>
            <h1 class="lesson-title">Bài 1.4: Trading Flag & Pennant</h1>
            <p class="lesson-subtitle">Chiến lược giao dịch chi tiết với Flag và Pennant</p>
        </div>

        <div class="content-section">
            <span class="section-label">📋 Quy trình</span>
            <h2 class="section-title">5-Step Trading Process</h2>

            <div class="step-card">
                <div class="step-number">1</div>
                <div class="step-content">
                    <h4>Xác Định Trend Chính</h4>
                    <p>Kiểm tra trend trên timeframe cao hơn. Flag/Pennant hoạt động tốt nhất khi theo hướng trend chính của thị trường.</p>
                </div>
            </div>

            <div class="step-card">
                <div class="step-number">2</div>
                <div class="step-content">
                    <h4>Nhận Diện Pattern</h4>
                    <p>Tìm Flagpole (đợt di chuyển mạnh) + Flag/Pennant (consolidation). Xác nhận volume giảm trong giai đoạn consolidation.</p>
                </div>
            </div>

            <div class="step-card">
                <div class="step-number">3</div>
                <div class="step-content">
                    <h4>Chờ Breakout</h4>
                    <p>Không vào lệnh sớm! Chờ giá phá vỡ đường biên pattern với volume tăng. Có thể chờ retest để entry an toàn hơn.</p>
                </div>
            </div>

            <div class="step-card">
                <div class="step-number">4</div>
                <div class="step-content">
                    <h4>Đặt Stop Loss</h4>
                    <p>SL đặt bên kia pattern: Bullish → dưới đáy Flag/Pennant. Bearish → trên đỉnh Flag/Pennant.</p>
                </div>
            </div>

            <div class="step-card">
                <div class="step-number">5</div>
                <div class="step-content">
                    <h4>Set Take Profit</h4>
                    <p>Target = Entry ± Chiều cao Flagpole. Có thể chia thành TP1, TP2 để quản lý lệnh tốt hơn.</p>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">✅ Checklist</span>
            <h2 class="section-title">Pre-Trade Checklist</h2>

            <ul class="checklist">
                <li>Trend chính trên HTF cùng hướng với pattern?</li>
                <li>Flagpole đủ mạnh và nhanh (volume cao)?</li>
                <li>Consolidation ngắn (1-3 tuần)?</li>
                <li>Volume giảm trong Flag/Pennant?</li>
                <li>Flag không retrace quá 50% Flagpole?</li>
                <li>Breakout có volume confirmation?</li>
                <li>R:R tối thiểu 1:2?</li>
            </ul>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/8B5CF6?text=Trading+Checklist+-+Visualization" alt="Trading Checklist">
                <p class="image-caption">Hình 1.4.1: Pre-trade checklist visualization</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🎯 Entry Strategies</span>
            <h2 class="section-title">3 Chiến Lược Entry</h2>

            <div class="grid-2">
                <div class="grid-item purple">
                    <h4 style="color: #8B5CF6; margin-bottom: 0.5rem;">1. Breakout Entry</h4>
                    <p style="font-size: 0.9rem;">Vào lệnh ngay khi giá breakout. Ưu điểm: Không bỏ lỡ cơ hội. Nhược điểm: Risk cao hơn nếu false breakout.</p>
                </div>
                <div class="grid-item gold">
                    <h4 style="color: #FFBD59; margin-bottom: 0.5rem;">2. Retest Entry</h4>
                    <p style="font-size: 0.9rem;">Chờ giá retest đường biên sau breakout. Ưu điểm: Entry tốt hơn, SL chặt hơn. Nhược điểm: Có thể bỏ lỡ nếu không retest.</p>
                </div>
            </div>

            <div class="highlight-box green">
                <h4 style="color: #10B981; margin-bottom: 0.5rem;">3. Split Entry (Khuyên dùng)</h4>
                <p>Chia position thành 2 phần: 50% vào khi breakout, 50% vào khi retest. Cân bằng giữa opportunity và risk management.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x400/1a0a2e/10B981?text=3+Entry+Strategies+-+Chart+Example" alt="Entry Strategies">
                <p class="image-caption">Hình 1.4.2: 3 chiến lược entry trên chart thực tế</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⛔ Stop Loss</span>
            <h2 class="section-title">Đặt Stop Loss Đúng Cách</h2>

            <div class="grid-2">
                <div class="grid-item green">
                    <h4 style="color: #10B981; margin-bottom: 0.5rem;">Bullish Flag/Pennant</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>SL dưới đáy của pattern</li>
                        <li>Hoặc dưới đường trendline dưới</li>
                        <li>Buffer: 1-2 ATR bên dưới</li>
                    </ul>
                </div>
                <div class="grid-item red">
                    <h4 style="color: #ef4444; margin-bottom: 0.5rem;">Bearish Flag/Pennant</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>SL trên đỉnh của pattern</li>
                        <li>Hoặc trên đường trendline trên</li>
                        <li>Buffer: 1-2 ATR bên trên</li>
                    </ul>
                </div>
            </div>

            <div class="highlight-box gold">
                <p><strong>💡 Pro Tip:</strong> Sử dụng ATR (Average True Range) để thêm buffer vào SL. Điều này giúp tránh bị stop out do biến động nhỏ.</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">💰 Take Profit</span>
            <h2 class="section-title">Chiến Lược Take Profit</h2>

            <div class="highlight-box">
                <p><strong>📐 Công thức tính Target:</strong></p>
                <p style="margin-top: 0.5rem; font-size: 1.1rem; color: #8B5CF6;"><strong>Target = Entry Point ± Flagpole Height</strong></p>
            </div>

            <div class="grid-2">
                <div class="grid-item purple">
                    <h4 style="color: #8B5CF6; margin-bottom: 0.5rem;">TP1 (50%)</h4>
                    <p style="font-size: 0.9rem;">50% chiều cao Flagpole. Chốt 50% position, move SL to breakeven.</p>
                </div>
                <div class="grid-item gold">
                    <h4 style="color: #FFBD59; margin-bottom: 0.5rem;">TP2 (100%)</h4>
                    <p style="font-size: 0.9rem;">100% chiều cao Flagpole. Chốt 30-40% position còn lại.</p>
                </div>
            </div>

            <div class="highlight-box green">
                <p><strong>TP3 (Trail):</strong> Với 10-20% cuối, trailing stop theo swing high/low. Để profit run nếu trend mạnh.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/FFBD59?text=Multi-TP+Strategy+-+Chart" alt="Multi-TP">
                <p class="image-caption">Hình 1.4.3: Chiến lược Multi-TP trên Flag Pattern</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚠️ Lưu ý</span>
            <h2 class="section-title">Những Lỗi Thường Gặp</h2>

            <div class="highlight-box red">
                <p><strong>❌ Tránh những lỗi sau:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Vào lệnh quá sớm (trước breakout)</li>
                    <li>Không chờ volume confirmation</li>
                    <li>SL quá chặt → bị stop out sớm</li>
                    <li>Không check trend HTF</li>
                    <li>Giao dịch pattern yếu (retrace >50%)</li>
                    <li>FOMO khi đã lỡ breakout</li>
                </ul>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>5-Step Process: Trend → Pattern → Breakout → SL → TP</li>
                <li>3 Entry Strategies: Breakout, Retest, Split Entry</li>
                <li>SL đặt bên kia pattern với buffer (1-2 ATR)</li>
                <li>Multi-TP: TP1 (50%), TP2 (100%), TP3 (Trail)</li>
                <li>Luôn check pre-trade checklist trước khi vào lệnh</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">1. Split Entry strategy là gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Vào 100% position khi breakout</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Chỉ vào lệnh khi retest</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Chia position: 50% breakout, 50% retest</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">2. Target của Flag/Pennant được tính như thế nào?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Entry + Chiều cao của Flag</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Entry + Chiều cao của Flagpole</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Entry + 2x chiều cao của Flag</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Kết quả: <span id="correct-count">0</span>/2</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </div>

        <div class="lesson-footer">
            <p>© 2024 GEM Trading Academy - Tier 3 Elite</p>
        </div>
    </div>

    <script>
        const totalQuestions = 2; let answeredCount = 0; let correctCount = 0;
        document.querySelectorAll(''.quiz-question'').forEach(question => {
            const correctIndex = parseInt(question.dataset.correct);
            const options = question.querySelectorAll(''.quiz-option'');
            const result = question.querySelector(''.quiz-result'');
            options.forEach(option => {
                option.addEventListener(''click'', function() {
                    if (question.classList.contains(''answered'')) return;
                    question.classList.add(''answered''); answeredCount++;
                    const selectedIndex = parseInt(this.dataset.index);
                    if (selectedIndex === correctIndex) { this.classList.add(''correct''); result.textContent = ''✓ Chính xác!''; result.className = ''quiz-result show correct''; correctCount++; }
                    else { this.classList.add(''incorrect''); options[correctIndex].classList.add(''correct''); result.textContent = ''✗ Chưa đúng.''; result.className = ''quiz-result show incorrect''; }
                    if (answeredCount === totalQuestions) { document.getElementById(''correct-count'').textContent = correctCount; document.querySelector(''.quiz-score'').classList.add(''show''); }
                });
            });
        });
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

-- Lesson 1.5: Ví Dụ Thực Tế Flag & Pennant
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch1-l5',
  'module-tier-3-ch1',
  'course-tier3-trading-mastery',
  'Bài 1.5: Ví Dụ Thực Tế Flag & Pennant',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 1.5: Ví Dụ Thực Tế Flag & Pennant</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a0a2e 0%, #0a0a0f 100%); padding: 2rem 1.5rem; border-bottom: 3px solid #8B5CF6; }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #8B5CF6, #7c3aed); color: #fff; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: #a1a1aa; font-size: 0.9rem; }
        .content-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .section-label { display: inline-block; background: rgba(139, 92, 246, 0.2); color: #8B5CF6; padding: 0.2rem 0.6rem; border-radius: 0.375rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.75rem; }
        .section-title { font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border-color: rgba(16, 185, 129, 0.3); }
        .highlight-box.red { background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05)); border-color: rgba(239, 68, 68, 0.3); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.05)); border-color: rgba(255, 189, 89, 0.3); }
        .case-study { background: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 0.75rem; padding: 1.25rem; margin: 1rem 0; }
        .case-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #27272a; }
        .case-title { font-weight: 700; color: #fff; }
        .case-result { padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.8rem; font-weight: 600; }
        .case-result.win { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .case-result.loss { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .trade-details { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin: 1rem 0; font-size: 0.9rem; }
        .trade-detail { padding: 0.5rem; background: rgba(255, 255, 255, 0.02); border-radius: 0.375rem; }
        .trade-label { color: #71717a; font-size: 0.8rem; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #0a0a0f); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .lesson-box { background: rgba(255, 189, 89, 0.1); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .lesson-box h4 { color: #FFBD59; margin-bottom: 0.5rem; }
        .summary-box { background: linear-gradient(135deg, #1a0a2e, #0a0a0f); border: 1px solid #8B5CF6; border-radius: 0.75rem; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #8B5CF6; margin-bottom: 1rem; }
        .summary-list { list-style: none; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
        .summary-list li::before { content: "→"; position: absolute; left: 0; color: #8B5CF6; }
        .quiz-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .quiz-question { background: rgba(255, 255, 255, 0.02); padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .question-text { font-weight: 600; color: #fff; margin-bottom: 1rem; }
        .quiz-option { padding: 0.875rem 1rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.03); border: 1px solid #27272a; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; }
        .quiz-option:hover { border-color: #8B5CF6; background: rgba(139, 92, 246, 0.1); }
        .quiz-option.correct { border-color: #10B981; background: rgba(16, 185, 129, 0.2); }
        .quiz-option.incorrect { border-color: #ef4444; background: rgba(239, 68, 68, 0.2); }
        .option-letter { width: 24px; height: 24px; border-radius: 50%; background: #27272a; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
        .quiz-result { padding: 0.75rem; margin-top: 0.75rem; border-radius: 0.375rem; font-weight: 500; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border-radius: 0.5rem; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .score-text { font-size: 1.5rem; font-weight: 700; color: #8B5CF6; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #7c3aed); color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.8rem; border-top: 1px solid #27272a; margin-top: 2rem; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0; border-radius: 0; border-left: 4px solid #27272a; border-right: none; border-top: none; border-bottom: 1px solid #27272a; padding: 1.25rem 1rem; }
            .summary-box, .quiz-section { margin: 0; border-radius: 0; }
            .trade-details { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="lesson-header">
            <span class="lesson-badge">Tier 3 Elite</span>
            <h1 class="lesson-title">Bài 1.5: Ví Dụ Thực Tế Flag & Pennant</h1>
            <p class="lesson-subtitle">Case studies thực tế trên BTC, ETH và altcoins</p>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Case Study 1</span>
            <h2 class="section-title">BTC Bullish Flag - 4H Chart</h2>

            <div class="case-study">
                <div class="case-header">
                    <span class="case-title">BTC/USDT - Bullish Flag</span>
                    <span class="case-result win">+12.5% Win</span>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/700x400/0a2e1a/10B981?text=BTC+Bullish+Flag+-+4H+Chart" alt="BTC Bullish Flag">
                    <p class="image-caption">Chart 1: BTC Bullish Flag trên timeframe 4H</p>
                </div>

                <div class="trade-details">
                    <div class="trade-detail">
                        <div class="trade-label">Entry</div>
                        <div><strong>$42,500</strong> (Breakout)</div>
                    </div>
                    <div class="trade-detail">
                        <div class="trade-label">Stop Loss</div>
                        <div><strong>$41,200</strong> (Dưới Flag)</div>
                    </div>
                    <div class="trade-detail">
                        <div class="trade-label">Target</div>
                        <div><strong>$47,800</strong> (Flagpole height)</div>
                    </div>
                    <div class="trade-detail">
                        <div class="trade-label">R:R Ratio</div>
                        <div><strong>1:4.1</strong></div>
                    </div>
                </div>

                <div class="highlight-box green">
                    <p><strong>📝 Phân tích:</strong></p>
                    <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                        <li>Flagpole: Tăng từ $38,000 → $42,800 (+12.6%)</li>
                        <li>Flag: Consolidation 5 ngày, nghiêng xuống nhẹ</li>
                        <li>Volume: Giảm 60% trong Flag, tăng 200% khi breakout</li>
                        <li>Kết quả: Giá đạt target $47,800 sau 3 ngày</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Case Study 2</span>
            <h2 class="section-title">ETH Bearish Pennant - 1H Chart</h2>

            <div class="case-study">
                <div class="case-header">
                    <span class="case-title">ETH/USDT - Bearish Pennant</span>
                    <span class="case-result win">+8.3% Win</span>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/700x400/2e0a0a/ef4444?text=ETH+Bearish+Pennant+-+1H+Chart" alt="ETH Bearish Pennant">
                    <p class="image-caption">Chart 2: ETH Bearish Pennant trên timeframe 1H</p>
                </div>

                <div class="trade-details">
                    <div class="trade-detail">
                        <div class="trade-label">Entry</div>
                        <div><strong>$2,280</strong> (Breakout Short)</div>
                    </div>
                    <div class="trade-detail">
                        <div class="trade-label">Stop Loss</div>
                        <div><strong>$2,350</strong> (Trên Pennant)</div>
                    </div>
                    <div class="trade-detail">
                        <div class="trade-label">Target</div>
                        <div><strong>$2,090</strong> (Flagpole height)</div>
                    </div>
                    <div class="trade-detail">
                        <div class="trade-label">R:R Ratio</div>
                        <div><strong>1:2.7</strong></div>
                    </div>
                </div>

                <div class="highlight-box red">
                    <p><strong>📝 Phân tích:</strong></p>
                    <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                        <li>Flagpole: Giảm từ $2,480 → $2,290 (-7.7%)</li>
                        <li>Pennant: Triangle hội tụ 8 giờ</li>
                        <li>Volume: Pattern volume giảm chuẩn</li>
                        <li>Breakout xảy ra ở 2/3 đầu Pennant (lý tưởng)</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Case Study 3</span>
            <h2 class="section-title">SOL Failed Flag - Bài Học Từ Thất Bại</h2>

            <div class="case-study">
                <div class="case-header">
                    <span class="case-title">SOL/USDT - Failed Bullish Flag</span>
                    <span class="case-result loss">-2.1% Loss</span>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/700x400/2e1a0a/FFBD59?text=SOL+Failed+Flag+-+Learning+Example" alt="SOL Failed Flag">
                    <p class="image-caption">Chart 3: SOL Failed Flag - Ví dụ thất bại</p>
                </div>

                <div class="trade-details">
                    <div class="trade-detail">
                        <div class="trade-label">Entry</div>
                        <div><strong>$98.50</strong></div>
                    </div>
                    <div class="trade-detail">
                        <div class="trade-label">Stop Loss</div>
                        <div><strong>$96.40</strong></div>
                    </div>
                    <div class="trade-detail">
                        <div class="trade-label">Exit (SL Hit)</div>
                        <div><strong>$96.40</strong></div>
                    </div>
                    <div class="trade-detail">
                        <div class="trade-label">Loss</div>
                        <div><strong>-2.1%</strong></div>
                    </div>
                </div>

                <div class="lesson-box">
                    <h4>📚 Bài Học Rút Ra:</h4>
                    <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                        <li>Flag kéo dài quá lâu (>2 tuần) → mất momentum</li>
                        <li>Volume không giảm trong Flag → có selling pressure</li>
                        <li>Breakout không có volume confirmation</li>
                        <li>Trend HTF (Daily) đang sideways → thiếu hỗ trợ</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Case Study 4</span>
            <h2 class="section-title">AVAX Bullish Pennant - Multi-TP Success</h2>

            <div class="case-study">
                <div class="case-header">
                    <span class="case-title">AVAX/USDT - Bullish Pennant với Multi-TP</span>
                    <span class="case-result win">+18.7% Win</span>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/700x400/1a0a2e/8B5CF6?text=AVAX+Pennant+-+Multi-TP+Strategy" alt="AVAX Pennant">
                    <p class="image-caption">Chart 4: AVAX Pennant với chiến lược Multi-TP</p>
                </div>

                <div class="highlight-box">
                    <p><strong>📊 Chi tiết Multi-TP:</strong></p>
                    <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                        <li><strong>Entry:</strong> $35.20 (50% position breakout, 50% retest)</li>
                        <li><strong>TP1 ($38.80):</strong> Chốt 50%, move SL to BE</li>
                        <li><strong>TP2 ($42.40):</strong> Chốt 30%</li>
                        <li><strong>TP3 (Trail):</strong> Trailing stop, chốt ở $45.20</li>
                    </ul>
                </div>

                <div class="highlight-box gold">
                    <p><strong>💡 Key Takeaway:</strong> Multi-TP strategy giúp secure profit sớm và để profit run. Kết quả trung bình +18.7% thay vì chỉ +10% nếu chốt hết ở TP1.</p>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🎯 Tổng hợp</span>
            <h2 class="section-title">Thống Kê Từ Các Case Studies</h2>

            <div class="highlight-box">
                <p><strong>📈 Kết quả 4 trades:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Win Rate: 75% (3/4 trades)</li>
                    <li>Avg Win: +13.2%</li>
                    <li>Avg Loss: -2.1%</li>
                    <li>Profit Factor: 6.3x</li>
                    <li>Avg R:R: 1:3.3</li>
                </ul>
            </div>

            <div class="lesson-box">
                <h4>🔑 Các Yếu Tố Quyết Định Thành Công:</h4>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Volume confirmation khi breakout</li>
                    <li>Trend HTF hỗ trợ pattern</li>
                    <li>Pattern không kéo dài quá lâu</li>
                    <li>SL placement hợp lý (với buffer)</li>
                    <li>Multi-TP strategy để maximize profit</li>
                </ul>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Chapter 1</h3>
            <ul class="summary-list">
                <li>Flag & Pennant là continuation patterns đáng tin cậy</li>
                <li>3 thành phần: Flagpole, Flag/Pennant, Breakout</li>
                <li>Volume giảm trong consolidation, tăng khi breakout</li>
                <li>Split Entry + Multi-TP = Tối ưu risk/reward</li>
                <li>Luôn check HTF trend và volume confirmation</li>
                <li>Chấp nhận losses nhỏ, để profits run</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Chapter 1</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Trong Case Study SOL Failed Flag, nguyên nhân chính dẫn đến thất bại là gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Stop loss đặt quá chặt</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Flag kéo dài quá lâu và volume không giảm</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Entry quá sớm trước breakout</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Multi-TP strategy giúp trader đạt được điều gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Giảm win rate nhưng tăng profit</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Loại bỏ hoàn toàn rủi ro</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Secure profit sớm và để profit run</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Kết quả: <span id="correct-count">0</span>/2</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </div>

        <div class="lesson-footer">
            <p>© 2024 GEM Trading Academy - Tier 3 Elite</p>
            <p style="margin-top: 0.5rem; color: #8B5CF6;">Hoàn thành Chapter 1: Flag & Pennant Patterns ✓</p>
        </div>
    </div>

    <script>
        const totalQuestions = 2; let answeredCount = 0; let correctCount = 0;
        document.querySelectorAll(''.quiz-question'').forEach(question => {
            const correctIndex = parseInt(question.dataset.correct);
            const options = question.querySelectorAll(''.quiz-option'');
            const result = question.querySelector(''.quiz-result'');
            options.forEach(option => {
                option.addEventListener(''click'', function() {
                    if (question.classList.contains(''answered'')) return;
                    question.classList.add(''answered''); answeredCount++;
                    const selectedIndex = parseInt(this.dataset.index);
                    if (selectedIndex === correctIndex) { this.classList.add(''correct''); result.textContent = ''✓ Chính xác!''; result.className = ''quiz-result show correct''; correctCount++; }
                    else { this.classList.add(''incorrect''); options[correctIndex].classList.add(''correct''); result.textContent = ''✗ Chưa đúng.''; result.className = ''quiz-result show incorrect''; }
                    if (answeredCount === totalQuestions) { document.getElementById(''correct-count'').textContent = correctCount; document.querySelector(''.quiz-score'').classList.add(''show''); }
                });
            });
        });
    </script>
</body>
</html>',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 1.5: Ví Dụ Thực Tế Flag & Pennant</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a0a2e 0%, #0a0a0f 100%); padding: 2rem 1.5rem; border-bottom: 3px solid #8B5CF6; }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #8B5CF6, #7c3aed); color: #fff; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: #a1a1aa; font-size: 0.9rem; }
        .content-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .section-label { display: inline-block; background: rgba(139, 92, 246, 0.2); color: #8B5CF6; padding: 0.2rem 0.6rem; border-radius: 0.375rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.75rem; }
        .section-title { font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border-color: rgba(16, 185, 129, 0.3); }
        .highlight-box.red { background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05)); border-color: rgba(239, 68, 68, 0.3); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.05)); border-color: rgba(255, 189, 89, 0.3); }
        .case-study { background: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 0.75rem; padding: 1.25rem; margin: 1rem 0; }
        .case-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #27272a; }
        .case-title { font-weight: 700; color: #fff; }
        .case-result { padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.8rem; font-weight: 600; }
        .case-result.win { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .case-result.loss { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .trade-details { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin: 1rem 0; font-size: 0.9rem; }
        .trade-detail { padding: 0.5rem; background: rgba(255, 255, 255, 0.02); border-radius: 0.375rem; }
        .trade-label { color: #71717a; font-size: 0.8rem; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #0a0a0f); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .lesson-box { background: rgba(255, 189, 89, 0.1); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .lesson-box h4 { color: #FFBD59; margin-bottom: 0.5rem; }
        .summary-box { background: linear-gradient(135deg, #1a0a2e, #0a0a0f); border: 1px solid #8B5CF6; border-radius: 0.75rem; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #8B5CF6; margin-bottom: 1rem; }
        .summary-list { list-style: none; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
        .summary-list li::before { content: "→"; position: absolute; left: 0; color: #8B5CF6; }
        .quiz-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .quiz-question { background: rgba(255, 255, 255, 0.02); padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .question-text { font-weight: 600; color: #fff; margin-bottom: 1rem; }
        .quiz-option { padding: 0.875rem 1rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.03); border: 1px solid #27272a; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; }
        .quiz-option:hover { border-color: #8B5CF6; background: rgba(139, 92, 246, 0.1); }
        .quiz-option.correct { border-color: #10B981; background: rgba(16, 185, 129, 0.2); }
        .quiz-option.incorrect { border-color: #ef4444; background: rgba(239, 68, 68, 0.2); }
        .option-letter { width: 24px; height: 24px; border-radius: 50%; background: #27272a; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
        .quiz-result { padding: 0.75rem; margin-top: 0.75rem; border-radius: 0.375rem; font-weight: 500; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border-radius: 0.5rem; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .score-text { font-size: 1.5rem; font-weight: 700; color: #8B5CF6; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #7c3aed); color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.8rem; border-top: 1px solid #27272a; margin-top: 2rem; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0; border-radius: 0; border-left: 4px solid #27272a; border-right: none; border-top: none; border-bottom: 1px solid #27272a; padding: 1.25rem 1rem; }
            .summary-box, .quiz-section { margin: 0; border-radius: 0; }
            .trade-details { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="lesson-header">
            <span class="lesson-badge">Tier 3 Elite</span>
            <h1 class="lesson-title">Bài 1.5: Ví Dụ Thực Tế Flag & Pennant</h1>
            <p class="lesson-subtitle">Case studies thực tế trên BTC, ETH và altcoins</p>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Case Study 1</span>
            <h2 class="section-title">BTC Bullish Flag - 4H Chart</h2>

            <div class="case-study">
                <div class="case-header">
                    <span class="case-title">BTC/USDT - Bullish Flag</span>
                    <span class="case-result win">+12.5% Win</span>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/700x400/0a2e1a/10B981?text=BTC+Bullish+Flag+-+4H+Chart" alt="BTC Bullish Flag">
                    <p class="image-caption">Chart 1: BTC Bullish Flag trên timeframe 4H</p>
                </div>

                <div class="trade-details">
                    <div class="trade-detail">
                        <div class="trade-label">Entry</div>
                        <div><strong>$42,500</strong> (Breakout)</div>
                    </div>
                    <div class="trade-detail">
                        <div class="trade-label">Stop Loss</div>
                        <div><strong>$41,200</strong> (Dưới Flag)</div>
                    </div>
                    <div class="trade-detail">
                        <div class="trade-label">Target</div>
                        <div><strong>$47,800</strong> (Flagpole height)</div>
                    </div>
                    <div class="trade-detail">
                        <div class="trade-label">R:R Ratio</div>
                        <div><strong>1:4.1</strong></div>
                    </div>
                </div>

                <div class="highlight-box green">
                    <p><strong>📝 Phân tích:</strong></p>
                    <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                        <li>Flagpole: Tăng từ $38,000 → $42,800 (+12.6%)</li>
                        <li>Flag: Consolidation 5 ngày, nghiêng xuống nhẹ</li>
                        <li>Volume: Giảm 60% trong Flag, tăng 200% khi breakout</li>
                        <li>Kết quả: Giá đạt target $47,800 sau 3 ngày</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Case Study 2</span>
            <h2 class="section-title">ETH Bearish Pennant - 1H Chart</h2>

            <div class="case-study">
                <div class="case-header">
                    <span class="case-title">ETH/USDT - Bearish Pennant</span>
                    <span class="case-result win">+8.3% Win</span>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/700x400/2e0a0a/ef4444?text=ETH+Bearish+Pennant+-+1H+Chart" alt="ETH Bearish Pennant">
                    <p class="image-caption">Chart 2: ETH Bearish Pennant trên timeframe 1H</p>
                </div>

                <div class="trade-details">
                    <div class="trade-detail">
                        <div class="trade-label">Entry</div>
                        <div><strong>$2,280</strong> (Breakout Short)</div>
                    </div>
                    <div class="trade-detail">
                        <div class="trade-label">Stop Loss</div>
                        <div><strong>$2,350</strong> (Trên Pennant)</div>
                    </div>
                    <div class="trade-detail">
                        <div class="trade-label">Target</div>
                        <div><strong>$2,090</strong> (Flagpole height)</div>
                    </div>
                    <div class="trade-detail">
                        <div class="trade-label">R:R Ratio</div>
                        <div><strong>1:2.7</strong></div>
                    </div>
                </div>

                <div class="highlight-box red">
                    <p><strong>📝 Phân tích:</strong></p>
                    <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                        <li>Flagpole: Giảm từ $2,480 → $2,290 (-7.7%)</li>
                        <li>Pennant: Triangle hội tụ 8 giờ</li>
                        <li>Volume: Pattern volume giảm chuẩn</li>
                        <li>Breakout xảy ra ở 2/3 đầu Pennant (lý tưởng)</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Case Study 3</span>
            <h2 class="section-title">SOL Failed Flag - Bài Học Từ Thất Bại</h2>

            <div class="case-study">
                <div class="case-header">
                    <span class="case-title">SOL/USDT - Failed Bullish Flag</span>
                    <span class="case-result loss">-2.1% Loss</span>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/700x400/2e1a0a/FFBD59?text=SOL+Failed+Flag+-+Learning+Example" alt="SOL Failed Flag">
                    <p class="image-caption">Chart 3: SOL Failed Flag - Ví dụ thất bại</p>
                </div>

                <div class="trade-details">
                    <div class="trade-detail">
                        <div class="trade-label">Entry</div>
                        <div><strong>$98.50</strong></div>
                    </div>
                    <div class="trade-detail">
                        <div class="trade-label">Stop Loss</div>
                        <div><strong>$96.40</strong></div>
                    </div>
                    <div class="trade-detail">
                        <div class="trade-label">Exit (SL Hit)</div>
                        <div><strong>$96.40</strong></div>
                    </div>
                    <div class="trade-detail">
                        <div class="trade-label">Loss</div>
                        <div><strong>-2.1%</strong></div>
                    </div>
                </div>

                <div class="lesson-box">
                    <h4>📚 Bài Học Rút Ra:</h4>
                    <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                        <li>Flag kéo dài quá lâu (>2 tuần) → mất momentum</li>
                        <li>Volume không giảm trong Flag → có selling pressure</li>
                        <li>Breakout không có volume confirmation</li>
                        <li>Trend HTF (Daily) đang sideways → thiếu hỗ trợ</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Case Study 4</span>
            <h2 class="section-title">AVAX Bullish Pennant - Multi-TP Success</h2>

            <div class="case-study">
                <div class="case-header">
                    <span class="case-title">AVAX/USDT - Bullish Pennant với Multi-TP</span>
                    <span class="case-result win">+18.7% Win</span>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/700x400/1a0a2e/8B5CF6?text=AVAX+Pennant+-+Multi-TP+Strategy" alt="AVAX Pennant">
                    <p class="image-caption">Chart 4: AVAX Pennant với chiến lược Multi-TP</p>
                </div>

                <div class="highlight-box">
                    <p><strong>📊 Chi tiết Multi-TP:</strong></p>
                    <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                        <li><strong>Entry:</strong> $35.20 (50% position breakout, 50% retest)</li>
                        <li><strong>TP1 ($38.80):</strong> Chốt 50%, move SL to BE</li>
                        <li><strong>TP2 ($42.40):</strong> Chốt 30%</li>
                        <li><strong>TP3 (Trail):</strong> Trailing stop, chốt ở $45.20</li>
                    </ul>
                </div>

                <div class="highlight-box gold">
                    <p><strong>💡 Key Takeaway:</strong> Multi-TP strategy giúp secure profit sớm và để profit run. Kết quả trung bình +18.7% thay vì chỉ +10% nếu chốt hết ở TP1.</p>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🎯 Tổng hợp</span>
            <h2 class="section-title">Thống Kê Từ Các Case Studies</h2>

            <div class="highlight-box">
                <p><strong>📈 Kết quả 4 trades:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Win Rate: 75% (3/4 trades)</li>
                    <li>Avg Win: +13.2%</li>
                    <li>Avg Loss: -2.1%</li>
                    <li>Profit Factor: 6.3x</li>
                    <li>Avg R:R: 1:3.3</li>
                </ul>
            </div>

            <div class="lesson-box">
                <h4>🔑 Các Yếu Tố Quyết Định Thành Công:</h4>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Volume confirmation khi breakout</li>
                    <li>Trend HTF hỗ trợ pattern</li>
                    <li>Pattern không kéo dài quá lâu</li>
                    <li>SL placement hợp lý (với buffer)</li>
                    <li>Multi-TP strategy để maximize profit</li>
                </ul>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Chapter 1</h3>
            <ul class="summary-list">
                <li>Flag & Pennant là continuation patterns đáng tin cậy</li>
                <li>3 thành phần: Flagpole, Flag/Pennant, Breakout</li>
                <li>Volume giảm trong consolidation, tăng khi breakout</li>
                <li>Split Entry + Multi-TP = Tối ưu risk/reward</li>
                <li>Luôn check HTF trend và volume confirmation</li>
                <li>Chấp nhận losses nhỏ, để profits run</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Chapter 1</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Trong Case Study SOL Failed Flag, nguyên nhân chính dẫn đến thất bại là gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Stop loss đặt quá chặt</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Flag kéo dài quá lâu và volume không giảm</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Entry quá sớm trước breakout</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Multi-TP strategy giúp trader đạt được điều gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Giảm win rate nhưng tăng profit</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Loại bỏ hoàn toàn rủi ro</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Secure profit sớm và để profit run</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Kết quả: <span id="correct-count">0</span>/2</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </div>

        <div class="lesson-footer">
            <p>© 2024 GEM Trading Academy - Tier 3 Elite</p>
            <p style="margin-top: 0.5rem; color: #8B5CF6;">Hoàn thành Chapter 1: Flag & Pennant Patterns ✓</p>
        </div>
    </div>

    <script>
        const totalQuestions = 2; let answeredCount = 0; let correctCount = 0;
        document.querySelectorAll(''.quiz-question'').forEach(question => {
            const correctIndex = parseInt(question.dataset.correct);
            const options = question.querySelectorAll(''.quiz-option'');
            const result = question.querySelector(''.quiz-result'');
            options.forEach(option => {
                option.addEventListener(''click'', function() {
                    if (question.classList.contains(''answered'')) return;
                    question.classList.add(''answered''); answeredCount++;
                    const selectedIndex = parseInt(this.dataset.index);
                    if (selectedIndex === correctIndex) { this.classList.add(''correct''); result.textContent = ''✓ Chính xác!''; result.className = ''quiz-result show correct''; correctCount++; }
                    else { this.classList.add(''incorrect''); options[correctIndex].classList.add(''correct''); result.textContent = ''✗ Chưa đúng.''; result.className = ''quiz-result show incorrect''; }
                    if (answeredCount === totalQuestions) { document.getElementById(''correct-count'').textContent = correctCount; document.querySelector(''.quiz-score'').classList.add(''show''); }
                });
            });
        });
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
