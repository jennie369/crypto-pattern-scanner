-- =====================================================
-- TIER-3 - Chương 3: AI Signals Integration
-- Course: course-tier3-trading-mastery
-- File 19/23
-- =====================================================

-- Create/Update Module
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  'module-tier-3-ch3',
  'course-tier3-trading-mastery',
  'Chương 3: AI Signals Integration',
  'Tích hợp tín hiệu AI',
  3,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Lesson 3.1: Giới Thiệu GEM AI Brain
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch3-l1',
  'module-tier-3-ch3',
  'course-tier3-trading-mastery',
  'Bài 3.1: Giới Thiệu GEM AI Brain',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 3.1: Giới Thiệu GEM AI Brain</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a0a2e 0%, #0a0a0f 100%); padding: 2rem 1.5rem; border-bottom: 3px solid #00F0FF; }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #00F0FF, #0ea5e9); color: #000; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: #a1a1aa; font-size: 0.9rem; }
        .content-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .section-label { display: inline-block; background: rgba(0, 240, 255, 0.2); color: #00F0FF; padding: 0.2rem 0.6rem; border-radius: 0.375rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.75rem; }
        .section-title { font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.05)); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .highlight-box.purple { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border-color: rgba(139, 92, 246, 0.3); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.05)); border-color: rgba(255, 189, 89, 0.3); }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; text-align: center; }
        .grid-item.cyan { border-color: #00F0FF; background: rgba(0, 240, 255, 0.05); }
        .grid-item.purple { border-color: #8B5CF6; background: rgba(139, 92, 246, 0.05); }
        .grid-item.gold { border-color: #FFBD59; background: rgba(255, 189, 89, 0.05); }
        .feature-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .feature-card { display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; background: rgba(255, 255, 255, 0.02); border-radius: 0.5rem; border-left: 3px solid #00F0FF; }
        .feature-number { width: 40px; height: 40px; background: linear-gradient(135deg, #00F0FF, #0ea5e9); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #000; flex-shrink: 0; }
        .feature-content h4 { color: #fff; margin-bottom: 0.5rem; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #0a0a0f); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .summary-box { background: linear-gradient(135deg, #0a1a2e, #0a0a0f); border: 1px solid #00F0FF; border-radius: 0.75rem; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #00F0FF; margin-bottom: 1rem; }
        .summary-list { list-style: none; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
        .summary-list li::before { content: "→"; position: absolute; left: 0; color: #00F0FF; }
        .quiz-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .quiz-question { background: rgba(255, 255, 255, 0.02); padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .question-text { font-weight: 600; color: #fff; margin-bottom: 1rem; }
        .quiz-option { padding: 0.875rem 1rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.03); border: 1px solid #27272a; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; }
        .quiz-option:hover { border-color: #00F0FF; background: rgba(0, 240, 255, 0.1); }
        .quiz-option.correct { border-color: #10B981; background: rgba(16, 185, 129, 0.2); }
        .quiz-option.incorrect { border-color: #ef4444; background: rgba(239, 68, 68, 0.2); }
        .option-letter { width: 24px; height: 24px; border-radius: 50%; background: #27272a; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
        .quiz-result { padding: 0.75rem; margin-top: 0.75rem; border-radius: 0.375rem; font-weight: 500; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.05)); border-radius: 0.5rem; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .score-text { font-size: 1.5rem; font-weight: 700; color: #00F0FF; }
        .retake-btn { background: linear-gradient(135deg, #00F0FF, #0ea5e9); color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.8rem; border-top: 1px solid #27272a; margin-top: 2rem; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0; border-radius: 0; border-left: 4px solid #27272a; border-right: none; border-top: none; border-bottom: 1px solid #27272a; padding: 1.25rem 1rem; }
            .summary-box, .quiz-section { margin: 0; border-radius: 0; }
            .grid-3 { grid-template-columns: 1fr; gap: 0.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="lesson-header">
            <span class="lesson-badge">AI Trading</span>
            <h1 class="lesson-title">Bài 3.1: Giới Thiệu GEM AI Brain</h1>
            <p class="lesson-subtitle">Hệ thống AI hỗ trợ trading của GEM</p>
        </div>

        <div class="content-section">
            <span class="section-label">🤖 Tổng quan</span>
            <h2 class="section-title">GEM AI Brain Là Gì?</h2>
            <p>GEM AI Brain là hệ thống trí tuệ nhân tạo được xây dựng để hỗ trợ traders trong việc phát hiện patterns, phân tích thị trường, và đưa ra signals chất lượng cao.</p>

            <div class="highlight-box">
                <p><strong>🧠 Khả năng của GEM AI Brain:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Quét thị trường 24/7 không mệt mỏi</li>
                    <li>Phát hiện patterns trên 100+ coins và nhiều timeframes</li>
                    <li>Tính toán điểm chất lượng (Quality Score) cho mỗi setup</li>
                    <li>Gửi alerts real-time khi có cơ hội tốt</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/0a1a2e/00F0FF?text=GEM+AI+Brain+-+System+Overview" alt="GEM AI Brain">
                <p class="image-caption">Hình 3.1.1: Tổng quan hệ thống GEM AI Brain</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚙️ Tính năng</span>
            <h2 class="section-title">3 Tính Năng Chính</h2>

            <div class="grid-3">
                <div class="grid-item cyan">
                    <div class="feature-icon">📡</div>
                    <h4 style="color: #00F0FF;">Pattern Scanner</h4>
                    <p style="font-size: 0.85rem; color: #a1a1aa;">Quét và phát hiện 24+ patterns tự động</p>
                </div>
                <div class="grid-item purple">
                    <div class="feature-icon">📊</div>
                    <h4 style="color: #8B5CF6;">Quality Scorer</h4>
                    <p style="font-size: 0.85rem; color: #a1a1aa;">Chấm điểm chất lượng từ 0-100</p>
                </div>
                <div class="grid-item gold">
                    <div class="feature-icon">🔔</div>
                    <h4 style="color: #FFBD59;">Smart Alerts</h4>
                    <p style="font-size: 0.85rem; color: #a1a1aa;">Thông báo real-time khi có setup tốt</p>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📡 Scanner</span>
            <h2 class="section-title">Pattern Scanner</h2>

            <div class="feature-card">
                <div class="feature-number">1</div>
                <div class="feature-content">
                    <h4>Multi-Coin Scanning</h4>
                    <p>Quét 100+ coins cùng lúc: BTC, ETH, và top altcoins trên Binance. Không bỏ lỡ cơ hội nào.</p>
                </div>
            </div>

            <div class="feature-card">
                <div class="feature-number">2</div>
                <div class="feature-content">
                    <h4>Multi-Timeframe Analysis</h4>
                    <p>Phân tích đồng thời 5M, 15M, 1H, 4H, Daily. Tìm confluences giữa các timeframes.</p>
                </div>
            </div>

            <div class="feature-card">
                <div class="feature-number">3</div>
                <div class="feature-content">
                    <h4>24 Patterns Detection</h4>
                    <p>Nhận diện tất cả patterns trong GEM Method: UPU, UPD, DPU, DPD, Flags, Triangles, Candlesticks...</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x400/0a1a2e/8B5CF6?text=Pattern+Scanner+-+Dashboard" alt="Pattern Scanner">
                <p class="image-caption">Hình 3.1.2: Giao diện Pattern Scanner</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Scoring</span>
            <h2 class="section-title">Quality Scoring System</h2>

            <div class="highlight-box purple">
                <p><strong>📈 Cách tính Quality Score (0-100):</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li><strong>Pattern Clarity:</strong> 0-25 điểm</li>
                    <li><strong>Zone Quality:</strong> 0-25 điểm</li>
                    <li><strong>Volume Confirmation:</strong> 0-20 điểm</li>
                    <li><strong>MTF Alignment:</strong> 0-20 điểm</li>
                    <li><strong>R:R Ratio:</strong> 0-10 điểm</li>
                </ul>
            </div>

            <div class="highlight-box gold">
                <p><strong>🎯 Cách sử dụng Score:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li><strong>80-100:</strong> A+ Setup - Trade với size lớn</li>
                    <li><strong>70-79:</strong> A Setup - Trade bình thường</li>
                    <li><strong>60-69:</strong> B Setup - Trade với size nhỏ</li>
                    <li><strong>&lt;60:</strong> Skip - Không đủ chất lượng</li>
                </ul>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚠️ Lưu ý</span>
            <h2 class="section-title">AI Là Công Cụ, Không Phải Phép Màu</h2>

            <div class="highlight-box" style="border-color: rgba(239, 68, 68, 0.3);">
                <p><strong>❌ AI KHÔNG thay thế được:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Quyết định cuối cùng của trader</li>
                    <li>Risk management cá nhân</li>
                    <li>Hiểu biết về thị trường và context</li>
                    <li>Kỷ luật và tâm lý trading</li>
                </ul>
            </div>

            <div class="highlight-box">
                <p><strong>✅ AI giúp bạn:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Tiết kiệm thời gian scan thị trường</li>
                    <li>Không bỏ lỡ cơ hội khi bạn đang ngủ</li>
                    <li>Đánh giá khách quan, không có cảm xúc</li>
                    <li>Nhất quán trong việc phát hiện patterns</li>
                </ul>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>GEM AI Brain: Hệ thống AI quét thị trường 24/7</li>
                <li>3 tính năng: Pattern Scanner, Quality Scorer, Smart Alerts</li>
                <li>Quality Score 0-100 giúp đánh giá chất lượng setup</li>
                <li>AI là công cụ hỗ trợ, không thay thế quyết định của trader</li>
                <li>Kết hợp AI signals + phân tích cá nhân = Hiệu quả cao nhất</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Quality Score từ 70-79 nghĩa là gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Skip trade - không đủ chất lượng</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>A Setup - Trade bình thường</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>A+ Setup - Trade với size lớn</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. AI có thể thay thế được điều gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Quyết định cuối cùng của trader</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Risk management cá nhân</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Không thể thay thế các điều trên, chỉ là công cụ hỗ trợ</span>
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
    <title>Bài 3.1: Giới Thiệu GEM AI Brain</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a0a2e 0%, #0a0a0f 100%); padding: 2rem 1.5rem; border-bottom: 3px solid #00F0FF; }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #00F0FF, #0ea5e9); color: #000; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: #a1a1aa; font-size: 0.9rem; }
        .content-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .section-label { display: inline-block; background: rgba(0, 240, 255, 0.2); color: #00F0FF; padding: 0.2rem 0.6rem; border-radius: 0.375rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.75rem; }
        .section-title { font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.05)); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .highlight-box.purple { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border-color: rgba(139, 92, 246, 0.3); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.05)); border-color: rgba(255, 189, 89, 0.3); }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; text-align: center; }
        .grid-item.cyan { border-color: #00F0FF; background: rgba(0, 240, 255, 0.05); }
        .grid-item.purple { border-color: #8B5CF6; background: rgba(139, 92, 246, 0.05); }
        .grid-item.gold { border-color: #FFBD59; background: rgba(255, 189, 89, 0.05); }
        .feature-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .feature-card { display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; background: rgba(255, 255, 255, 0.02); border-radius: 0.5rem; border-left: 3px solid #00F0FF; }
        .feature-number { width: 40px; height: 40px; background: linear-gradient(135deg, #00F0FF, #0ea5e9); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #000; flex-shrink: 0; }
        .feature-content h4 { color: #fff; margin-bottom: 0.5rem; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #0a0a0f); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .summary-box { background: linear-gradient(135deg, #0a1a2e, #0a0a0f); border: 1px solid #00F0FF; border-radius: 0.75rem; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #00F0FF; margin-bottom: 1rem; }
        .summary-list { list-style: none; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
        .summary-list li::before { content: "→"; position: absolute; left: 0; color: #00F0FF; }
        .quiz-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .quiz-question { background: rgba(255, 255, 255, 0.02); padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .question-text { font-weight: 600; color: #fff; margin-bottom: 1rem; }
        .quiz-option { padding: 0.875rem 1rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.03); border: 1px solid #27272a; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; }
        .quiz-option:hover { border-color: #00F0FF; background: rgba(0, 240, 255, 0.1); }
        .quiz-option.correct { border-color: #10B981; background: rgba(16, 185, 129, 0.2); }
        .quiz-option.incorrect { border-color: #ef4444; background: rgba(239, 68, 68, 0.2); }
        .option-letter { width: 24px; height: 24px; border-radius: 50%; background: #27272a; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
        .quiz-result { padding: 0.75rem; margin-top: 0.75rem; border-radius: 0.375rem; font-weight: 500; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.05)); border-radius: 0.5rem; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .score-text { font-size: 1.5rem; font-weight: 700; color: #00F0FF; }
        .retake-btn { background: linear-gradient(135deg, #00F0FF, #0ea5e9); color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.8rem; border-top: 1px solid #27272a; margin-top: 2rem; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0; border-radius: 0; border-left: 4px solid #27272a; border-right: none; border-top: none; border-bottom: 1px solid #27272a; padding: 1.25rem 1rem; }
            .summary-box, .quiz-section { margin: 0; border-radius: 0; }
            .grid-3 { grid-template-columns: 1fr; gap: 0.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="lesson-header">
            <span class="lesson-badge">AI Trading</span>
            <h1 class="lesson-title">Bài 3.1: Giới Thiệu GEM AI Brain</h1>
            <p class="lesson-subtitle">Hệ thống AI hỗ trợ trading của GEM</p>
        </div>

        <div class="content-section">
            <span class="section-label">🤖 Tổng quan</span>
            <h2 class="section-title">GEM AI Brain Là Gì?</h2>
            <p>GEM AI Brain là hệ thống trí tuệ nhân tạo được xây dựng để hỗ trợ traders trong việc phát hiện patterns, phân tích thị trường, và đưa ra signals chất lượng cao.</p>

            <div class="highlight-box">
                <p><strong>🧠 Khả năng của GEM AI Brain:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Quét thị trường 24/7 không mệt mỏi</li>
                    <li>Phát hiện patterns trên 100+ coins và nhiều timeframes</li>
                    <li>Tính toán điểm chất lượng (Quality Score) cho mỗi setup</li>
                    <li>Gửi alerts real-time khi có cơ hội tốt</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/0a1a2e/00F0FF?text=GEM+AI+Brain+-+System+Overview" alt="GEM AI Brain">
                <p class="image-caption">Hình 3.1.1: Tổng quan hệ thống GEM AI Brain</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚙️ Tính năng</span>
            <h2 class="section-title">3 Tính Năng Chính</h2>

            <div class="grid-3">
                <div class="grid-item cyan">
                    <div class="feature-icon">📡</div>
                    <h4 style="color: #00F0FF;">Pattern Scanner</h4>
                    <p style="font-size: 0.85rem; color: #a1a1aa;">Quét và phát hiện 24+ patterns tự động</p>
                </div>
                <div class="grid-item purple">
                    <div class="feature-icon">📊</div>
                    <h4 style="color: #8B5CF6;">Quality Scorer</h4>
                    <p style="font-size: 0.85rem; color: #a1a1aa;">Chấm điểm chất lượng từ 0-100</p>
                </div>
                <div class="grid-item gold">
                    <div class="feature-icon">🔔</div>
                    <h4 style="color: #FFBD59;">Smart Alerts</h4>
                    <p style="font-size: 0.85rem; color: #a1a1aa;">Thông báo real-time khi có setup tốt</p>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📡 Scanner</span>
            <h2 class="section-title">Pattern Scanner</h2>

            <div class="feature-card">
                <div class="feature-number">1</div>
                <div class="feature-content">
                    <h4>Multi-Coin Scanning</h4>
                    <p>Quét 100+ coins cùng lúc: BTC, ETH, và top altcoins trên Binance. Không bỏ lỡ cơ hội nào.</p>
                </div>
            </div>

            <div class="feature-card">
                <div class="feature-number">2</div>
                <div class="feature-content">
                    <h4>Multi-Timeframe Analysis</h4>
                    <p>Phân tích đồng thời 5M, 15M, 1H, 4H, Daily. Tìm confluences giữa các timeframes.</p>
                </div>
            </div>

            <div class="feature-card">
                <div class="feature-number">3</div>
                <div class="feature-content">
                    <h4>24 Patterns Detection</h4>
                    <p>Nhận diện tất cả patterns trong GEM Method: UPU, UPD, DPU, DPD, Flags, Triangles, Candlesticks...</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x400/0a1a2e/8B5CF6?text=Pattern+Scanner+-+Dashboard" alt="Pattern Scanner">
                <p class="image-caption">Hình 3.1.2: Giao diện Pattern Scanner</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Scoring</span>
            <h2 class="section-title">Quality Scoring System</h2>

            <div class="highlight-box purple">
                <p><strong>📈 Cách tính Quality Score (0-100):</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li><strong>Pattern Clarity:</strong> 0-25 điểm</li>
                    <li><strong>Zone Quality:</strong> 0-25 điểm</li>
                    <li><strong>Volume Confirmation:</strong> 0-20 điểm</li>
                    <li><strong>MTF Alignment:</strong> 0-20 điểm</li>
                    <li><strong>R:R Ratio:</strong> 0-10 điểm</li>
                </ul>
            </div>

            <div class="highlight-box gold">
                <p><strong>🎯 Cách sử dụng Score:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li><strong>80-100:</strong> A+ Setup - Trade với size lớn</li>
                    <li><strong>70-79:</strong> A Setup - Trade bình thường</li>
                    <li><strong>60-69:</strong> B Setup - Trade với size nhỏ</li>
                    <li><strong>&lt;60:</strong> Skip - Không đủ chất lượng</li>
                </ul>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚠️ Lưu ý</span>
            <h2 class="section-title">AI Là Công Cụ, Không Phải Phép Màu</h2>

            <div class="highlight-box" style="border-color: rgba(239, 68, 68, 0.3);">
                <p><strong>❌ AI KHÔNG thay thế được:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Quyết định cuối cùng của trader</li>
                    <li>Risk management cá nhân</li>
                    <li>Hiểu biết về thị trường và context</li>
                    <li>Kỷ luật và tâm lý trading</li>
                </ul>
            </div>

            <div class="highlight-box">
                <p><strong>✅ AI giúp bạn:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Tiết kiệm thời gian scan thị trường</li>
                    <li>Không bỏ lỡ cơ hội khi bạn đang ngủ</li>
                    <li>Đánh giá khách quan, không có cảm xúc</li>
                    <li>Nhất quán trong việc phát hiện patterns</li>
                </ul>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>GEM AI Brain: Hệ thống AI quét thị trường 24/7</li>
                <li>3 tính năng: Pattern Scanner, Quality Scorer, Smart Alerts</li>
                <li>Quality Score 0-100 giúp đánh giá chất lượng setup</li>
                <li>AI là công cụ hỗ trợ, không thay thế quyết định của trader</li>
                <li>Kết hợp AI signals + phân tích cá nhân = Hiệu quả cao nhất</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Quality Score từ 70-79 nghĩa là gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Skip trade - không đủ chất lượng</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>A Setup - Trade bình thường</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>A+ Setup - Trade với size lớn</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. AI có thể thay thế được điều gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Quyết định cuối cùng của trader</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Risk management cá nhân</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Không thể thay thế các điều trên, chỉ là công cụ hỗ trợ</span>
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

-- Lesson 3.2: Cách Đọc AI Signals
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch3-l2',
  'module-tier-3-ch3',
  'course-tier3-trading-mastery',
  'Bài 3.2: Cách Đọc AI Signals',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 3.2: Cách Đọc AI Signals</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a0a2e 0%, #0a0a0f 100%); padding: 2rem 1.5rem; border-bottom: 3px solid #00F0FF; }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #00F0FF, #0ea5e9); color: #000; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: #a1a1aa; font-size: 0.9rem; }
        .content-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .section-label { display: inline-block; background: rgba(0, 240, 255, 0.2); color: #00F0FF; padding: 0.2rem 0.6rem; border-radius: 0.375rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.75rem; }
        .section-title { font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1rem; }
        .signal-card { background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 0.75rem; padding: 1.25rem; margin: 1rem 0; }
        .signal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .signal-pair { font-weight: 700; color: #fff; font-size: 1.1rem; }
        .signal-score { padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.8rem; font-weight: 600; background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .signal-details { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-top: 1rem; font-size: 0.9rem; }
        .signal-detail { padding: 0.5rem; background: rgba(255, 255, 255, 0.02); border-radius: 0.375rem; }
        .signal-label { color: #71717a; font-size: 0.8rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.05)); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.05)); border-color: rgba(255, 189, 89, 0.3); }
        .highlight-box.purple { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border-color: rgba(139, 92, 246, 0.3); }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; }
        .grid-item.green { border-left: 3px solid #10B981; }
        .grid-item.red { border-left: 3px solid #ef4444; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #0a0a0f); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .summary-box { background: linear-gradient(135deg, #0a1a2e, #0a0a0f); border: 1px solid #00F0FF; border-radius: 0.75rem; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #00F0FF; margin-bottom: 1rem; }
        .summary-list { list-style: none; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
        .summary-list li::before { content: "→"; position: absolute; left: 0; color: #00F0FF; }
        .quiz-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .quiz-question { background: rgba(255, 255, 255, 0.02); padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .question-text { font-weight: 600; color: #fff; margin-bottom: 1rem; }
        .quiz-option { padding: 0.875rem 1rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.03); border: 1px solid #27272a; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; }
        .quiz-option:hover { border-color: #00F0FF; background: rgba(0, 240, 255, 0.1); }
        .quiz-option.correct { border-color: #10B981; background: rgba(16, 185, 129, 0.2); }
        .quiz-option.incorrect { border-color: #ef4444; background: rgba(239, 68, 68, 0.2); }
        .option-letter { width: 24px; height: 24px; border-radius: 50%; background: #27272a; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
        .quiz-result { padding: 0.75rem; margin-top: 0.75rem; border-radius: 0.375rem; font-weight: 500; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.05)); border-radius: 0.5rem; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .score-text { font-size: 1.5rem; font-weight: 700; color: #00F0FF; }
        .retake-btn { background: linear-gradient(135deg, #00F0FF, #0ea5e9); color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.8rem; border-top: 1px solid #27272a; margin-top: 2rem; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0; border-radius: 0; border-left: 4px solid #27272a; }
            .summary-box, .quiz-section { margin: 0; border-radius: 0; }
            .grid-2, .signal-details { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="lesson-header">
            <span class="lesson-badge">AI Trading</span>
            <h1 class="lesson-title">Bài 3.2: Cách Đọc AI Signals</h1>
            <p class="lesson-subtitle">Hiểu và sử dụng signals từ GEM AI Brain</p>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Cấu trúc</span>
            <h2 class="section-title">Anatomy Of An AI Signal</h2>

            <div class="signal-card">
                <div class="signal-header">
                    <span class="signal-pair">🚀 BTC/USDT - LONG</span>
                    <span class="signal-score">Score: 85/100</span>
                </div>
                <p><strong>Pattern:</strong> UPU at LFZ | <strong>Timeframe:</strong> 4H</p>
                <div class="signal-details">
                    <div class="signal-detail"><div class="signal-label">Entry Zone</div><div><strong>$41,200 - $41,500</strong></div></div>
                    <div class="signal-detail"><div class="signal-label">Stop Loss</div><div><strong>$40,100</strong></div></div>
                    <div class="signal-detail"><div class="signal-label">TP1</div><div><strong>$43,800</strong></div></div>
                    <div class="signal-detail"><div class="signal-label">TP2</div><div><strong>$46,200</strong></div></div>
                    <div class="signal-detail"><div class="signal-label">R:R</div><div><strong>1:2.3</strong></div></div>
                    <div class="signal-detail"><div class="signal-label">MTF Align</div><div><strong>4/5 ✓</strong></div></div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/0a1a2e/00F0FF?text=AI+Signal+Anatomy+-+Diagram" alt="Signal Anatomy">
                <p class="image-caption">Hình 3.2.1: Các thành phần của một AI Signal</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🔍 Chi tiết</span>
            <h2 class="section-title">Giải Thích Từng Thành Phần</h2>

            <div class="highlight-box">
                <p><strong>📈 Coin & Direction:</strong></p>
                <p style="margin-top: 0.5rem;">Cho biết coin nào và hướng trade (LONG = Buy, SHORT = Sell)</p>
            </div>

            <div class="highlight-box purple">
                <p><strong>🎯 Quality Score (0-100):</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>80-100: A+ Setup (high confidence)</li>
                    <li>70-79: A Setup (good confidence)</li>
                    <li>60-69: B Setup (moderate confidence)</li>
                    <li>&lt;60: Không đủ chất lượng</li>
                </ul>
            </div>

            <div class="highlight-box gold">
                <p><strong>📊 Pattern & Timeframe:</strong></p>
                <p style="margin-top: 0.5rem;">Pattern được phát hiện và timeframe chính. VD: "UPU at LFZ | 4H" = Pattern UPU tại vùng LFZ trên chart 4H</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">✅ Validation</span>
            <h2 class="section-title">Xác Nhận Signal Trước Khi Trade</h2>

            <div class="grid-2">
                <div class="grid-item green">
                    <h4 style="color: #10B981; margin-bottom: 0.5rem;">✓ Nên Trade Khi</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>Score ≥ 70</li>
                        <li>R:R ≥ 1:2</li>
                        <li>MTF Alignment ≥ 3/5</li>
                        <li>Giá trong Entry Zone</li>
                        <li>Không có news lớn</li>
                    </ul>
                </div>
                <div class="grid-item red">
                    <h4 style="color: #ef4444; margin-bottom: 0.5rem;">✗ Skip Trade Khi</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>Score &lt; 60</li>
                        <li>R:R &lt; 1:1.5</li>
                        <li>MTF Alignment &lt; 3/5</li>
                        <li>Giá đã vượt Entry Zone</li>
                        <li>Đang có news quan trọng</li>
                    </ul>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/0a1a2e/10B981?text=Signal+Validation+Checklist" alt="Validation">
                <p class="image-caption">Hình 3.2.2: Checklist xác nhận signal</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚠️ Lưu ý</span>
            <h2 class="section-title">Những Điều Cần Nhớ</h2>

            <div class="highlight-box" style="border-color: rgba(239, 68, 68, 0.3);">
                <p><strong>❌ KHÔNG nên:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Trade mù quáng theo mọi signal</li>
                    <li>Bỏ qua risk management</li>
                    <li>Vào lệnh khi giá đã vượt entry zone</li>
                    <li>Tăng size vì "AI bảo"</li>
                </ul>
            </div>

            <div class="highlight-box">
                <p><strong>✅ NÊN làm:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Kiểm tra chart trước khi trade</li>
                    <li>Áp dụng position sizing của bạn</li>
                    <li>Chờ entry zone nếu giá chưa đến</li>
                    <li>Kết hợp với phân tích cá nhân</li>
                </ul>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>AI Signal gồm: Coin, Direction, Score, Pattern, Entry, SL, TP</li>
                <li>Quality Score giúp filter signals: ≥70 = trade, &lt;60 = skip</li>
                <li>Luôn validate signal trước khi trade</li>
                <li>Không trade mù quáng, kết hợp phân tích cá nhân</li>
                <li>Tuân thủ risk management riêng của bạn</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">1. Score 75/100 nghĩa là gì?</p>
                <div class="quiz-option" data-index="0"><span class="option-letter">A</span><span>A Setup - Good confidence, có thể trade</span></div>
                <div class="quiz-option" data-index="1"><span class="option-letter">B</span><span>Skip trade - không đủ chất lượng</span></div>
                <div class="quiz-option" data-index="2"><span class="option-letter">C</span><span>A+ Setup - Trade với size lớn</span></div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Khi nào KHÔNG nên trade theo AI signal?</p>
                <div class="quiz-option" data-index="0"><span class="option-letter">A</span><span>Khi score ≥ 70</span></div>
                <div class="quiz-option" data-index="1"><span class="option-letter">B</span><span>Khi R:R ≥ 1:2</span></div>
                <div class="quiz-option" data-index="2"><span class="option-letter">C</span><span>Khi giá đã vượt qua entry zone</span></div>
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
        document.querySelectorAll(''.quiz-question'').forEach(q => {
            const ci = parseInt(q.dataset.correct); const opts = q.querySelectorAll(''.quiz-option''); const res = q.querySelector(''.quiz-result'');
            opts.forEach(o => { o.addEventListener(''click'', function() {
                if (q.classList.contains(''answered'')) return; q.classList.add(''answered''); answeredCount++;
                const si = parseInt(this.dataset.index);
                if (si === ci) { this.classList.add(''correct''); res.textContent = ''✓ Chính xác!''; res.className = ''quiz-result show correct''; correctCount++; }
                else { this.classList.add(''incorrect''); opts[ci].classList.add(''correct''); res.textContent = ''✗ Chưa đúng.''; res.className = ''quiz-result show incorrect''; }
                if (answeredCount === totalQuestions) { document.getElementById(''correct-count'').textContent = correctCount; document.querySelector(''.quiz-score'').classList.add(''show''); }
            }); });
        });
    </script>
</body>
</html>',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 3.2: Cách Đọc AI Signals</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a0a2e 0%, #0a0a0f 100%); padding: 2rem 1.5rem; border-bottom: 3px solid #00F0FF; }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #00F0FF, #0ea5e9); color: #000; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: #a1a1aa; font-size: 0.9rem; }
        .content-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .section-label { display: inline-block; background: rgba(0, 240, 255, 0.2); color: #00F0FF; padding: 0.2rem 0.6rem; border-radius: 0.375rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.75rem; }
        .section-title { font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1rem; }
        .signal-card { background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 0.75rem; padding: 1.25rem; margin: 1rem 0; }
        .signal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .signal-pair { font-weight: 700; color: #fff; font-size: 1.1rem; }
        .signal-score { padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.8rem; font-weight: 600; background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .signal-details { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-top: 1rem; font-size: 0.9rem; }
        .signal-detail { padding: 0.5rem; background: rgba(255, 255, 255, 0.02); border-radius: 0.375rem; }
        .signal-label { color: #71717a; font-size: 0.8rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.05)); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.05)); border-color: rgba(255, 189, 89, 0.3); }
        .highlight-box.purple { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border-color: rgba(139, 92, 246, 0.3); }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; }
        .grid-item.green { border-left: 3px solid #10B981; }
        .grid-item.red { border-left: 3px solid #ef4444; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #0a0a0f); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .summary-box { background: linear-gradient(135deg, #0a1a2e, #0a0a0f); border: 1px solid #00F0FF; border-radius: 0.75rem; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #00F0FF; margin-bottom: 1rem; }
        .summary-list { list-style: none; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
        .summary-list li::before { content: "→"; position: absolute; left: 0; color: #00F0FF; }
        .quiz-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .quiz-question { background: rgba(255, 255, 255, 0.02); padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .question-text { font-weight: 600; color: #fff; margin-bottom: 1rem; }
        .quiz-option { padding: 0.875rem 1rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.03); border: 1px solid #27272a; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; }
        .quiz-option:hover { border-color: #00F0FF; background: rgba(0, 240, 255, 0.1); }
        .quiz-option.correct { border-color: #10B981; background: rgba(16, 185, 129, 0.2); }
        .quiz-option.incorrect { border-color: #ef4444; background: rgba(239, 68, 68, 0.2); }
        .option-letter { width: 24px; height: 24px; border-radius: 50%; background: #27272a; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
        .quiz-result { padding: 0.75rem; margin-top: 0.75rem; border-radius: 0.375rem; font-weight: 500; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.05)); border-radius: 0.5rem; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .score-text { font-size: 1.5rem; font-weight: 700; color: #00F0FF; }
        .retake-btn { background: linear-gradient(135deg, #00F0FF, #0ea5e9); color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.8rem; border-top: 1px solid #27272a; margin-top: 2rem; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section { margin: 0; border-radius: 0; border-left: 4px solid #27272a; }
            .summary-box, .quiz-section { margin: 0; border-radius: 0; }
            .grid-2, .signal-details { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="lesson-header">
            <span class="lesson-badge">AI Trading</span>
            <h1 class="lesson-title">Bài 3.2: Cách Đọc AI Signals</h1>
            <p class="lesson-subtitle">Hiểu và sử dụng signals từ GEM AI Brain</p>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Cấu trúc</span>
            <h2 class="section-title">Anatomy Of An AI Signal</h2>

            <div class="signal-card">
                <div class="signal-header">
                    <span class="signal-pair">🚀 BTC/USDT - LONG</span>
                    <span class="signal-score">Score: 85/100</span>
                </div>
                <p><strong>Pattern:</strong> UPU at LFZ | <strong>Timeframe:</strong> 4H</p>
                <div class="signal-details">
                    <div class="signal-detail"><div class="signal-label">Entry Zone</div><div><strong>$41,200 - $41,500</strong></div></div>
                    <div class="signal-detail"><div class="signal-label">Stop Loss</div><div><strong>$40,100</strong></div></div>
                    <div class="signal-detail"><div class="signal-label">TP1</div><div><strong>$43,800</strong></div></div>
                    <div class="signal-detail"><div class="signal-label">TP2</div><div><strong>$46,200</strong></div></div>
                    <div class="signal-detail"><div class="signal-label">R:R</div><div><strong>1:2.3</strong></div></div>
                    <div class="signal-detail"><div class="signal-label">MTF Align</div><div><strong>4/5 ✓</strong></div></div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/0a1a2e/00F0FF?text=AI+Signal+Anatomy+-+Diagram" alt="Signal Anatomy">
                <p class="image-caption">Hình 3.2.1: Các thành phần của một AI Signal</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🔍 Chi tiết</span>
            <h2 class="section-title">Giải Thích Từng Thành Phần</h2>

            <div class="highlight-box">
                <p><strong>📈 Coin & Direction:</strong></p>
                <p style="margin-top: 0.5rem;">Cho biết coin nào và hướng trade (LONG = Buy, SHORT = Sell)</p>
            </div>

            <div class="highlight-box purple">
                <p><strong>🎯 Quality Score (0-100):</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>80-100: A+ Setup (high confidence)</li>
                    <li>70-79: A Setup (good confidence)</li>
                    <li>60-69: B Setup (moderate confidence)</li>
                    <li>&lt;60: Không đủ chất lượng</li>
                </ul>
            </div>

            <div class="highlight-box gold">
                <p><strong>📊 Pattern & Timeframe:</strong></p>
                <p style="margin-top: 0.5rem;">Pattern được phát hiện và timeframe chính. VD: "UPU at LFZ | 4H" = Pattern UPU tại vùng LFZ trên chart 4H</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">✅ Validation</span>
            <h2 class="section-title">Xác Nhận Signal Trước Khi Trade</h2>

            <div class="grid-2">
                <div class="grid-item green">
                    <h4 style="color: #10B981; margin-bottom: 0.5rem;">✓ Nên Trade Khi</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>Score ≥ 70</li>
                        <li>R:R ≥ 1:2</li>
                        <li>MTF Alignment ≥ 3/5</li>
                        <li>Giá trong Entry Zone</li>
                        <li>Không có news lớn</li>
                    </ul>
                </div>
                <div class="grid-item red">
                    <h4 style="color: #ef4444; margin-bottom: 0.5rem;">✗ Skip Trade Khi</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>Score &lt; 60</li>
                        <li>R:R &lt; 1:1.5</li>
                        <li>MTF Alignment &lt; 3/5</li>
                        <li>Giá đã vượt Entry Zone</li>
                        <li>Đang có news quan trọng</li>
                    </ul>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/0a1a2e/10B981?text=Signal+Validation+Checklist" alt="Validation">
                <p class="image-caption">Hình 3.2.2: Checklist xác nhận signal</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚠️ Lưu ý</span>
            <h2 class="section-title">Những Điều Cần Nhớ</h2>

            <div class="highlight-box" style="border-color: rgba(239, 68, 68, 0.3);">
                <p><strong>❌ KHÔNG nên:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Trade mù quáng theo mọi signal</li>
                    <li>Bỏ qua risk management</li>
                    <li>Vào lệnh khi giá đã vượt entry zone</li>
                    <li>Tăng size vì "AI bảo"</li>
                </ul>
            </div>

            <div class="highlight-box">
                <p><strong>✅ NÊN làm:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Kiểm tra chart trước khi trade</li>
                    <li>Áp dụng position sizing của bạn</li>
                    <li>Chờ entry zone nếu giá chưa đến</li>
                    <li>Kết hợp với phân tích cá nhân</li>
                </ul>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>AI Signal gồm: Coin, Direction, Score, Pattern, Entry, SL, TP</li>
                <li>Quality Score giúp filter signals: ≥70 = trade, &lt;60 = skip</li>
                <li>Luôn validate signal trước khi trade</li>
                <li>Không trade mù quáng, kết hợp phân tích cá nhân</li>
                <li>Tuân thủ risk management riêng của bạn</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">1. Score 75/100 nghĩa là gì?</p>
                <div class="quiz-option" data-index="0"><span class="option-letter">A</span><span>A Setup - Good confidence, có thể trade</span></div>
                <div class="quiz-option" data-index="1"><span class="option-letter">B</span><span>Skip trade - không đủ chất lượng</span></div>
                <div class="quiz-option" data-index="2"><span class="option-letter">C</span><span>A+ Setup - Trade với size lớn</span></div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Khi nào KHÔNG nên trade theo AI signal?</p>
                <div class="quiz-option" data-index="0"><span class="option-letter">A</span><span>Khi score ≥ 70</span></div>
                <div class="quiz-option" data-index="1"><span class="option-letter">B</span><span>Khi R:R ≥ 1:2</span></div>
                <div class="quiz-option" data-index="2"><span class="option-letter">C</span><span>Khi giá đã vượt qua entry zone</span></div>
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
        document.querySelectorAll(''.quiz-question'').forEach(q => {
            const ci = parseInt(q.dataset.correct); const opts = q.querySelectorAll(''.quiz-option''); const res = q.querySelector(''.quiz-result'');
            opts.forEach(o => { o.addEventListener(''click'', function() {
                if (q.classList.contains(''answered'')) return; q.classList.add(''answered''); answeredCount++;
                const si = parseInt(this.dataset.index);
                if (si === ci) { this.classList.add(''correct''); res.textContent = ''✓ Chính xác!''; res.className = ''quiz-result show correct''; correctCount++; }
                else { this.classList.add(''incorrect''); opts[ci].classList.add(''correct''); res.textContent = ''✗ Chưa đúng.''; res.className = ''quiz-result show incorrect''; }
                if (answeredCount === totalQuestions) { document.getElementById(''correct-count'').textContent = correctCount; document.querySelector(''.quiz-score'').classList.add(''show''); }
            }); });
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

-- Lesson 3.3: Thiết Lập Cảnh Báo Tự Động
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch3-l3',
  'module-tier-3-ch3',
  'course-tier3-trading-mastery',
  'Bài 3.3: Thiết Lập Cảnh Báo Tự Động',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 3.3: Thiết Lập Cảnh Báo Tự Động</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a0a2e 0%, #0a0a0f 100%); padding: 2rem 1.5rem; border-bottom: 3px solid #00F0FF; }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #00F0FF, #0ea5e9); color: #000; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: #a1a1aa; font-size: 0.9rem; }
        .content-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .section-label { display: inline-block; background: rgba(0, 240, 255, 0.2); color: #00F0FF; padding: 0.2rem 0.6rem; border-radius: 0.375rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.75rem; }
        .section-title { font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.05)); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.05)); border-color: rgba(255, 189, 89, 0.3); }
        .highlight-box.purple { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border-color: rgba(139, 92, 246, 0.3); }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; }
        .grid-item.cyan { border-left: 3px solid #00F0FF; }
        .grid-item.gold { border-left: 3px solid #FFBD59; }
        .step-card { display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; background: rgba(255, 255, 255, 0.02); border-radius: 0.5rem; border-left: 3px solid #00F0FF; }
        .step-number { width: 40px; height: 40px; background: linear-gradient(135deg, #00F0FF, #0ea5e9); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #000; flex-shrink: 0; }
        .step-content h4 { color: #fff; margin-bottom: 0.5rem; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #0a0a0f); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .alert-types { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin: 1rem 0; }
        .alert-type { padding: 0.75rem; background: rgba(255, 255, 255, 0.02); border-radius: 0.5rem; text-align: center; }
        .alert-icon { font-size: 2rem; margin-bottom: 0.5rem; }
        .summary-box { background: linear-gradient(135deg, #0a1a2e, #0a0a0f); border: 1px solid #00F0FF; border-radius: 0.75rem; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #00F0FF; margin-bottom: 1rem; }
        .summary-list { list-style: none; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
        .summary-list li::before { content: "→"; position: absolute; left: 0; color: #00F0FF; }
        .quiz-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .quiz-question { background: rgba(255, 255, 255, 0.02); padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .question-text { font-weight: 600; color: #fff; margin-bottom: 1rem; }
        .quiz-option { padding: 0.875rem 1rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.03); border: 1px solid #27272a; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; }
        .quiz-option:hover { border-color: #00F0FF; background: rgba(0, 240, 255, 0.1); }
        .quiz-option.correct { border-color: #10B981; background: rgba(16, 185, 129, 0.2); }
        .quiz-option.incorrect { border-color: #ef4444; background: rgba(239, 68, 68, 0.2); }
        .option-letter { width: 24px; height: 24px; border-radius: 50%; background: #27272a; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
        .quiz-result { padding: 0.75rem; margin-top: 0.75rem; border-radius: 0.375rem; font-weight: 500; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.05)); border-radius: 0.5rem; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .score-text { font-size: 1.5rem; font-weight: 700; color: #00F0FF; }
        .retake-btn { background: linear-gradient(135deg, #00F0FF, #0ea5e9); color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.8rem; border-top: 1px solid #27272a; margin-top: 2rem; }
        @media (max-width: 600px) { .container { padding: 0; } .content-section { margin: 0; border-radius: 0; border-left: 4px solid #27272a; } .summary-box, .quiz-section { margin: 0; border-radius: 0; } .grid-2, .alert-types { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="lesson-header">
            <span class="lesson-badge">AI Trading</span>
            <h1 class="lesson-title">Bài 3.3: Thiết Lập Cảnh Báo Tự Động</h1>
            <p class="lesson-subtitle">Không bỏ lỡ cơ hội trading với Smart Alerts</p>
        </div>

        <div class="content-section">
            <span class="section-label">🔔 Tổng quan</span>
            <h2 class="section-title">Smart Alerts System</h2>
            <p>GEM AI Brain có thể gửi cảnh báo tự động đến bạn khi phát hiện setup tốt. Điều này giúp bạn không bỏ lỡ cơ hội, kể cả khi đang ngủ hay bận việc khác.</p>

            <div class="alert-types">
                <div class="alert-type"><div class="alert-icon">📱</div><h4 style="color: #00F0FF;">Push Notification</h4><p style="font-size: 0.85rem; color: #a1a1aa;">Thông báo trên điện thoại</p></div>
                <div class="alert-type"><div class="alert-icon">📧</div><h4 style="color: #FFBD59;">Email Alert</h4><p style="font-size: 0.85rem; color: #a1a1aa;">Email với chi tiết đầy đủ</p></div>
                <div class="alert-type"><div class="alert-icon">💬</div><h4 style="color: #8B5CF6;">In-App Alert</h4><p style="font-size: 0.85rem; color: #a1a1aa;">Thông báo trong GEM App</p></div>
                <div class="alert-type"><div class="alert-icon">🔊</div><h4 style="color: #10B981;">Sound Alert</h4><p style="font-size: 0.85rem; color: #a1a1aa;">Âm thanh cảnh báo</p></div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚙️ Thiết lập</span>
            <h2 class="section-title">Cách Thiết Lập Alerts</h2>

            <div class="step-card">
                <div class="step-number">1</div>
                <div class="step-content"><h4>Mở GEM App → Settings</h4><p>Vào phần cài đặt trong ứng dụng GEM</p></div>
            </div>
            <div class="step-card">
                <div class="step-number">2</div>
                <div class="step-content"><h4>Chọn "Alert Preferences"</h4><p>Tìm mục thiết lập cảnh báo</p></div>
            </div>
            <div class="step-card">
                <div class="step-number">3</div>
                <div class="step-content"><h4>Tùy chỉnh Filters</h4><p>Chọn coins, timeframes, minimum score (khuyến nghị ≥70)</p></div>
            </div>
            <div class="step-card">
                <div class="step-number">4</div>
                <div class="step-content"><h4>Bật Alert Channels</h4><p>Chọn kênh nhận: Push, Email, hoặc cả hai</p></div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x400/0a1a2e/00F0FF?text=Alert+Settings+-+Step+by+Step" alt="Alert Settings">
                <p class="image-caption">Hình 3.3.1: Giao diện thiết lập cảnh báo</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🎯 Tối ưu</span>
            <h2 class="section-title">Best Practices Cho Alerts</h2>

            <div class="grid-2">
                <div class="grid-item cyan">
                    <h4 style="color: #00F0FF; margin-bottom: 0.5rem;">Minimum Score ≥ 70</h4>
                    <p style="font-size: 0.9rem;">Chỉ nhận alerts khi setup có chất lượng tốt, tránh bị "ngập" trong signals kém</p>
                </div>
                <div class="grid-item gold">
                    <h4 style="color: #FFBD59; margin-bottom: 0.5rem;">Chọn Coins Quan Tâm</h4>
                    <p style="font-size: 0.9rem;">Không cần nhận alerts cho tất cả 100+ coins. Chọn 10-20 coins bạn quan tâm</p>
                </div>
            </div>

            <div class="highlight-box">
                <p><strong>⏰ Quiet Hours:</strong> Thiết lập thời gian không nhận alerts (VD: 23:00 - 07:00) để không bị làm phiền khi ngủ. Alerts sẽ được lưu lại và bạn có thể xem lại sau.</p>
            </div>

            <div class="highlight-box gold">
                <p><strong>💡 Pro Tip:</strong> Sử dụng "Priority Alerts" cho setup A+ (Score ≥ 85). Chỉ những setup chất lượng cao nhất mới gửi thông báo priority với âm thanh riêng.</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Khuyến nghị</span>
            <h2 class="section-title">Cấu Hình Khuyến Nghị</h2>

            <div class="highlight-box purple">
                <p><strong>🎯 Cấu hình cho Beginner:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Minimum Score: 80</li>
                    <li>Coins: Top 10 (BTC, ETH, SOL, AVAX...)</li>
                    <li>Timeframes: 4H, Daily</li>
                    <li>Max alerts/day: 10</li>
                </ul>
            </div>

            <div class="highlight-box">
                <p><strong>🚀 Cấu hình cho Advanced:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Minimum Score: 70</li>
                    <li>Coins: Top 30</li>
                    <li>Timeframes: 1H, 4H, Daily</li>
                    <li>Max alerts/day: Unlimited</li>
                </ul>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>4 kênh alert: Push, Email, In-App, Sound</li>
                <li>Thiết lập filters: Coins, Timeframes, Minimum Score</li>
                <li>Sử dụng Quiet Hours để không bị làm phiền</li>
                <li>Priority Alerts cho setup A+ (Score ≥ 85)</li>
                <li>Beginner: Score ≥ 80, Advanced: Score ≥ 70</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Minimum Score khuyến nghị cho Beginner là bao nhiêu?</p>
                <div class="quiz-option" data-index="0"><span class="option-letter">A</span><span>60</span></div>
                <div class="quiz-option" data-index="1"><span class="option-letter">B</span><span>80</span></div>
                <div class="quiz-option" data-index="2"><span class="option-letter">C</span><span>50</span></div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">2. "Quiet Hours" dùng để làm gì?</p>
                <div class="quiz-option" data-index="0"><span class="option-letter">A</span><span>Thiết lập thời gian không nhận alerts</span></div>
                <div class="quiz-option" data-index="1"><span class="option-letter">B</span><span>Tắt hoàn toàn hệ thống alerts</span></div>
                <div class="quiz-option" data-index="2"><span class="option-letter">C</span><span>Giảm âm lượng thông báo</span></div>
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
        document.querySelectorAll(''.quiz-question'').forEach(q => { const ci = parseInt(q.dataset.correct); const opts = q.querySelectorAll(''.quiz-option''); const res = q.querySelector(''.quiz-result'');
            opts.forEach(o => { o.addEventListener(''click'', function() { if (q.classList.contains(''answered'')) return; q.classList.add(''answered''); answeredCount++; const si = parseInt(this.dataset.index);
                if (si === ci) { this.classList.add(''correct''); res.textContent = ''✓ Chính xác!''; res.className = ''quiz-result show correct''; correctCount++; }
                else { this.classList.add(''incorrect''); opts[ci].classList.add(''correct''); res.textContent = ''✗ Chưa đúng.''; res.className = ''quiz-result show incorrect''; }
                if (answeredCount === totalQuestions) { document.getElementById(''correct-count'').textContent = correctCount; document.querySelector(''.quiz-score'').classList.add(''show''); } }); }); });
    </script>
</body>
</html>',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 3.3: Thiết Lập Cảnh Báo Tự Động</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a0a2e 0%, #0a0a0f 100%); padding: 2rem 1.5rem; border-bottom: 3px solid #00F0FF; }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #00F0FF, #0ea5e9); color: #000; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: #a1a1aa; font-size: 0.9rem; }
        .content-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .section-label { display: inline-block; background: rgba(0, 240, 255, 0.2); color: #00F0FF; padding: 0.2rem 0.6rem; border-radius: 0.375rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.75rem; }
        .section-title { font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.05)); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.05)); border-color: rgba(255, 189, 89, 0.3); }
        .highlight-box.purple { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border-color: rgba(139, 92, 246, 0.3); }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; }
        .grid-item.cyan { border-left: 3px solid #00F0FF; }
        .grid-item.gold { border-left: 3px solid #FFBD59; }
        .step-card { display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; background: rgba(255, 255, 255, 0.02); border-radius: 0.5rem; border-left: 3px solid #00F0FF; }
        .step-number { width: 40px; height: 40px; background: linear-gradient(135deg, #00F0FF, #0ea5e9); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #000; flex-shrink: 0; }
        .step-content h4 { color: #fff; margin-bottom: 0.5rem; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #0a0a0f); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .alert-types { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin: 1rem 0; }
        .alert-type { padding: 0.75rem; background: rgba(255, 255, 255, 0.02); border-radius: 0.5rem; text-align: center; }
        .alert-icon { font-size: 2rem; margin-bottom: 0.5rem; }
        .summary-box { background: linear-gradient(135deg, #0a1a2e, #0a0a0f); border: 1px solid #00F0FF; border-radius: 0.75rem; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #00F0FF; margin-bottom: 1rem; }
        .summary-list { list-style: none; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
        .summary-list li::before { content: "→"; position: absolute; left: 0; color: #00F0FF; }
        .quiz-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .quiz-question { background: rgba(255, 255, 255, 0.02); padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .question-text { font-weight: 600; color: #fff; margin-bottom: 1rem; }
        .quiz-option { padding: 0.875rem 1rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.03); border: 1px solid #27272a; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; }
        .quiz-option:hover { border-color: #00F0FF; background: rgba(0, 240, 255, 0.1); }
        .quiz-option.correct { border-color: #10B981; background: rgba(16, 185, 129, 0.2); }
        .quiz-option.incorrect { border-color: #ef4444; background: rgba(239, 68, 68, 0.2); }
        .option-letter { width: 24px; height: 24px; border-radius: 50%; background: #27272a; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
        .quiz-result { padding: 0.75rem; margin-top: 0.75rem; border-radius: 0.375rem; font-weight: 500; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.05)); border-radius: 0.5rem; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .score-text { font-size: 1.5rem; font-weight: 700; color: #00F0FF; }
        .retake-btn { background: linear-gradient(135deg, #00F0FF, #0ea5e9); color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.8rem; border-top: 1px solid #27272a; margin-top: 2rem; }
        @media (max-width: 600px) { .container { padding: 0; } .content-section { margin: 0; border-radius: 0; border-left: 4px solid #27272a; } .summary-box, .quiz-section { margin: 0; border-radius: 0; } .grid-2, .alert-types { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="lesson-header">
            <span class="lesson-badge">AI Trading</span>
            <h1 class="lesson-title">Bài 3.3: Thiết Lập Cảnh Báo Tự Động</h1>
            <p class="lesson-subtitle">Không bỏ lỡ cơ hội trading với Smart Alerts</p>
        </div>

        <div class="content-section">
            <span class="section-label">🔔 Tổng quan</span>
            <h2 class="section-title">Smart Alerts System</h2>
            <p>GEM AI Brain có thể gửi cảnh báo tự động đến bạn khi phát hiện setup tốt. Điều này giúp bạn không bỏ lỡ cơ hội, kể cả khi đang ngủ hay bận việc khác.</p>

            <div class="alert-types">
                <div class="alert-type"><div class="alert-icon">📱</div><h4 style="color: #00F0FF;">Push Notification</h4><p style="font-size: 0.85rem; color: #a1a1aa;">Thông báo trên điện thoại</p></div>
                <div class="alert-type"><div class="alert-icon">📧</div><h4 style="color: #FFBD59;">Email Alert</h4><p style="font-size: 0.85rem; color: #a1a1aa;">Email với chi tiết đầy đủ</p></div>
                <div class="alert-type"><div class="alert-icon">💬</div><h4 style="color: #8B5CF6;">In-App Alert</h4><p style="font-size: 0.85rem; color: #a1a1aa;">Thông báo trong GEM App</p></div>
                <div class="alert-type"><div class="alert-icon">🔊</div><h4 style="color: #10B981;">Sound Alert</h4><p style="font-size: 0.85rem; color: #a1a1aa;">Âm thanh cảnh báo</p></div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚙️ Thiết lập</span>
            <h2 class="section-title">Cách Thiết Lập Alerts</h2>

            <div class="step-card">
                <div class="step-number">1</div>
                <div class="step-content"><h4>Mở GEM App → Settings</h4><p>Vào phần cài đặt trong ứng dụng GEM</p></div>
            </div>
            <div class="step-card">
                <div class="step-number">2</div>
                <div class="step-content"><h4>Chọn "Alert Preferences"</h4><p>Tìm mục thiết lập cảnh báo</p></div>
            </div>
            <div class="step-card">
                <div class="step-number">3</div>
                <div class="step-content"><h4>Tùy chỉnh Filters</h4><p>Chọn coins, timeframes, minimum score (khuyến nghị ≥70)</p></div>
            </div>
            <div class="step-card">
                <div class="step-number">4</div>
                <div class="step-content"><h4>Bật Alert Channels</h4><p>Chọn kênh nhận: Push, Email, hoặc cả hai</p></div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x400/0a1a2e/00F0FF?text=Alert+Settings+-+Step+by+Step" alt="Alert Settings">
                <p class="image-caption">Hình 3.3.1: Giao diện thiết lập cảnh báo</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🎯 Tối ưu</span>
            <h2 class="section-title">Best Practices Cho Alerts</h2>

            <div class="grid-2">
                <div class="grid-item cyan">
                    <h4 style="color: #00F0FF; margin-bottom: 0.5rem;">Minimum Score ≥ 70</h4>
                    <p style="font-size: 0.9rem;">Chỉ nhận alerts khi setup có chất lượng tốt, tránh bị "ngập" trong signals kém</p>
                </div>
                <div class="grid-item gold">
                    <h4 style="color: #FFBD59; margin-bottom: 0.5rem;">Chọn Coins Quan Tâm</h4>
                    <p style="font-size: 0.9rem;">Không cần nhận alerts cho tất cả 100+ coins. Chọn 10-20 coins bạn quan tâm</p>
                </div>
            </div>

            <div class="highlight-box">
                <p><strong>⏰ Quiet Hours:</strong> Thiết lập thời gian không nhận alerts (VD: 23:00 - 07:00) để không bị làm phiền khi ngủ. Alerts sẽ được lưu lại và bạn có thể xem lại sau.</p>
            </div>

            <div class="highlight-box gold">
                <p><strong>💡 Pro Tip:</strong> Sử dụng "Priority Alerts" cho setup A+ (Score ≥ 85). Chỉ những setup chất lượng cao nhất mới gửi thông báo priority với âm thanh riêng.</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Khuyến nghị</span>
            <h2 class="section-title">Cấu Hình Khuyến Nghị</h2>

            <div class="highlight-box purple">
                <p><strong>🎯 Cấu hình cho Beginner:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Minimum Score: 80</li>
                    <li>Coins: Top 10 (BTC, ETH, SOL, AVAX...)</li>
                    <li>Timeframes: 4H, Daily</li>
                    <li>Max alerts/day: 10</li>
                </ul>
            </div>

            <div class="highlight-box">
                <p><strong>🚀 Cấu hình cho Advanced:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Minimum Score: 70</li>
                    <li>Coins: Top 30</li>
                    <li>Timeframes: 1H, 4H, Daily</li>
                    <li>Max alerts/day: Unlimited</li>
                </ul>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>4 kênh alert: Push, Email, In-App, Sound</li>
                <li>Thiết lập filters: Coins, Timeframes, Minimum Score</li>
                <li>Sử dụng Quiet Hours để không bị làm phiền</li>
                <li>Priority Alerts cho setup A+ (Score ≥ 85)</li>
                <li>Beginner: Score ≥ 80, Advanced: Score ≥ 70</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Minimum Score khuyến nghị cho Beginner là bao nhiêu?</p>
                <div class="quiz-option" data-index="0"><span class="option-letter">A</span><span>60</span></div>
                <div class="quiz-option" data-index="1"><span class="option-letter">B</span><span>80</span></div>
                <div class="quiz-option" data-index="2"><span class="option-letter">C</span><span>50</span></div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">2. "Quiet Hours" dùng để làm gì?</p>
                <div class="quiz-option" data-index="0"><span class="option-letter">A</span><span>Thiết lập thời gian không nhận alerts</span></div>
                <div class="quiz-option" data-index="1"><span class="option-letter">B</span><span>Tắt hoàn toàn hệ thống alerts</span></div>
                <div class="quiz-option" data-index="2"><span class="option-letter">C</span><span>Giảm âm lượng thông báo</span></div>
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
        document.querySelectorAll(''.quiz-question'').forEach(q => { const ci = parseInt(q.dataset.correct); const opts = q.querySelectorAll(''.quiz-option''); const res = q.querySelector(''.quiz-result'');
            opts.forEach(o => { o.addEventListener(''click'', function() { if (q.classList.contains(''answered'')) return; q.classList.add(''answered''); answeredCount++; const si = parseInt(this.dataset.index);
                if (si === ci) { this.classList.add(''correct''); res.textContent = ''✓ Chính xác!''; res.className = ''quiz-result show correct''; correctCount++; }
                else { this.classList.add(''incorrect''); opts[ci].classList.add(''correct''); res.textContent = ''✗ Chưa đúng.''; res.className = ''quiz-result show incorrect''; }
                if (answeredCount === totalQuestions) { document.getElementById(''correct-count'').textContent = correctCount; document.querySelector(''.quiz-score'').classList.add(''show''); } }); }); });
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

-- Lesson 3.4: AI + Phân Tích Con Người
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch3-l4',
  'module-tier-3-ch3',
  'course-tier3-trading-mastery',
  'Bài 3.4: AI + Phân Tích Con Người',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 3.4: AI + Phân Tích Con Người | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #00F0FF; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #00F0FF; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #00F0FF, #8B5CF6); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(0,240,255,0.1), rgba(139,92,246,0.1)); border: 1px solid rgba(0,240,255,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.purple { background: linear-gradient(135deg, rgba(139,92,246,0.15), rgba(109,40,217,0.1)); border-color: rgba(139,92,246,0.4); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255,189,89,0.15), rgba(245,158,11,0.1)); border-color: rgba(255,189,89,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #00F0FF; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }
        .comparison-card { background: #1a1a2e; border-radius: 8px; padding: 1rem; border-top: 3px solid #00F0FF; }
        .comparison-card.human { border-top-color: #FFBD59; }
        .comparison-card h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .workflow-step { display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; background: #1a1a2e; border-radius: 8px; align-items: flex-start; }
        .step-number { background: linear-gradient(135deg, #00F0FF, #8B5CF6); color: #0a0a0f; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
        .step-content h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.25rem; }
        .step-content p { margin-bottom: 0; font-size: 0.9rem; }
        .formula-box { background: #0a0a0f; border: 2px solid #8B5CF6; border-radius: 8px; padding: 1.5rem; text-align: center; margin: 1rem 0; }
        .formula-box .formula { font-size: 1.25rem; color: #00F0FF; font-weight: 600; margin-bottom: 0.5rem; }
        .stat-row { display: flex; justify-content: space-around; flex-wrap: wrap; gap: 1rem; margin: 1rem 0; }
        .stat-item { text-align: center; padding: 1rem; background: #1a1a2e; border-radius: 8px; flex: 1; min-width: 120px; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: #8B5CF6; }
        .stat-label { font-size: 0.8rem; color: #a1a1aa; margin-top: 0.25rem; }
        .summary-box { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #8B5CF6; border-radius: 12px; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #8B5CF6; font-size: 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-box ul { margin: 0; }
        .summary-box li { margin-bottom: 0.5rem; }
        .quiz-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border: 2px solid #3f3f46; }
        .quiz-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1.5rem; text-align: center; }
        .quiz-question { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem; }
        .quiz-question:last-of-type { margin-bottom: 0; }
        .question-text { font-weight: 500; color: #ffffff; margin-bottom: 1rem; }
        .quiz-option { display: block; width: 100%; text-align: left; background: #0a0a0f; border: 2px solid #3f3f46; border-radius: 8px; padding: 0.875rem 1rem; margin-bottom: 0.5rem; color: #d4d4d8; cursor: pointer; transition: all 0.2s; }
        .quiz-option:hover { border-color: #00F0FF; background: rgba(0,240,255,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(0,240,255,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .comparison-grid { grid-template-columns: 1fr; gap: 0.5rem; }
            .workflow-step { flex-direction: column; gap: 0.75rem; }
            .step-number { margin: 0 auto; }
            .step-content { text-align: center; }
            .stat-row { flex-direction: column; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">AI + Phân Tích Con Người</h1>
            <p class="lesson-subtitle">Kết Hợp Tốt Nhất Của Cả Hai Thế Giới</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🤝</div>
            <h2 class="section-title">AI & Con Người: Đối Tác Hoàn Hảo</h2>
            <p>Trong trading, nhiều người lầm tưởng phải chọn một: hoặc tin hoàn toàn vào AI, hoặc phân tích thủ công. Thực tế, <strong style="color: #00F0FF;">sức mạnh thực sự đến từ sự kết hợp</strong> của cả hai.</p>

            <div class="highlight-box purple">
                <p style="margin-bottom: 0;"><strong>💡 Nguyên Tắc Vàng:</strong> AI làm bộ lọc sơ bộ (scanning) - Con người ra quyết định cuối cùng (decision)</p>
            </div>

            <div class="comparison-grid">
                <div class="comparison-card">
                    <h4>🤖 AI Giỏi Ở</h4>
                    <ul style="padding-left: 1rem; margin: 0;">
                        <li>Scan 100+ coins cùng lúc</li>
                        <li>Phát hiện patterns 24/7</li>
                        <li>Không bị cảm xúc chi phối</li>
                        <li>Tính toán confluence nhanh</li>
                        <li>Không bỏ sót tín hiệu</li>
                    </ul>
                </div>
                <div class="comparison-card human">
                    <h4>👤 Con Người Giỏi Ở</h4>
                    <ul style="padding-left: 1rem; margin: 0;">
                        <li>Đánh giá context thị trường</li>
                        <li>Nhận biết tin tức/sự kiện</li>
                        <li>Quản lý position size</li>
                        <li>Điều chỉnh theo tình huống</li>
                        <li>Ra quyết định cuối cùng</li>
                    </ul>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/00F0FF?text=AI+vs+Human+Comparison+Chart" alt="So Sánh AI và Con Người">
                <p class="image-caption">So sánh điểm mạnh của AI và phân tích con người</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🔄</div>
            <h2 class="section-title">Quy Trình Hybrid Trading</h2>
            <p>Quy trình kết hợp AI + Con Người được thiết kế để tận dụng tối đa điểm mạnh của cả hai:</p>

            <div class="workflow-step">
                <div class="step-number">1</div>
                <div class="step-content">
                    <h4>AI Scanning (Tự Động)</h4>
                    <p>AI quét 100+ coins trên 5 timeframes, phát hiện patterns và zones. Loại bỏ 95% "noise" ngay từ đầu.</p>
                </div>
            </div>

            <div class="workflow-step">
                <div class="step-number">2</div>
                <div class="step-content">
                    <h4>AI Filtering (Chất Lượng)</h4>
                    <p>Chỉ giữ lại setups có Quality Score ≥ 70. Sắp xếp theo confluence level từ cao xuống thấp.</p>
                </div>
            </div>

            <div class="workflow-step">
                <div class="step-number">3</div>
                <div class="step-content">
                    <h4>Human Review (Xác Nhận)</h4>
                    <p>Trader xem xét top 5-10 setups. Kiểm tra news, context thị trường, và lý do cá nhân để trade hoặc không.</p>
                </div>
            </div>

            <div class="workflow-step">
                <div class="step-number">4</div>
                <div class="step-content">
                    <h4>Human Decision (Quyết Định)</h4>
                    <p>Xác định position size, entry timing, và risk management. Đây là bước QUAN TRỌNG NHẤT.</p>
                </div>
            </div>

            <div class="workflow-step">
                <div class="step-number">5</div>
                <div class="step-content">
                    <h4>AI Monitoring (Theo Dõi)</h4>
                    <p>Sau khi vào lệnh, AI tiếp tục theo dõi và cảnh báo nếu có thay đổi quan trọng.</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/8B5CF6?text=Hybrid+Trading+Workflow+Diagram" alt="Quy Trình Hybrid Trading">
                <p class="image-caption">Sơ đồ quy trình Hybrid Trading 5 bước</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Hiệu Quả Của Phương Pháp Hybrid</h2>
            <p>Dữ liệu từ cộng đồng GEM cho thấy sự khác biệt rõ rệt giữa các phương pháp:</p>

            <div class="stat-row">
                <div class="stat-item">
                    <div class="stat-value">52%</div>
                    <div class="stat-label">Chỉ AI (Auto)</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">58%</div>
                    <div class="stat-label">Chỉ Manual</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" style="color: #10B981;">72%</div>
                    <div class="stat-label">Hybrid (AI + Human)</div>
                </div>
            </div>

            <div class="highlight-box gold">
                <p><strong>📈 Insight:</strong> Phương pháp Hybrid cho win rate cao hơn 14-20% so với dùng riêng AI hoặc phân tích thủ công.</p>
            </div>

            <div class="formula-box">
                <div class="formula">Win Rate = AI Precision × Human Judgment</div>
                <p style="margin-bottom: 0; color: #a1a1aa; font-size: 0.9rem;">Kết hợp độ chính xác của AI với phán đoán context của con người</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Win+Rate+Comparison+Chart" alt="So Sánh Win Rate">
                <p class="image-caption">So sánh win rate giữa các phương pháp trading</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">✅</div>
            <h2 class="section-title">Human Checklist Trước Mỗi Trade</h2>
            <p>Khi AI đưa ra signal có Quality Score cao, hãy chạy qua checklist này trước khi vào lệnh:</p>

            <div class="highlight-box">
                <p><strong>🔍 5 Câu Hỏi Phải Trả Lời:</strong></p>
                <ol>
                    <li><strong>Tin tức lớn sắp tới?</strong> (FOMC, CPI, ETH upgrade...)</li>
                    <li><strong>BTC đang làm gì?</strong> (Correlation check)</li>
                    <li><strong>Risk/Reward có hợp lý?</strong> (Tối thiểu 1:2)</li>
                    <li><strong>Vị thế hiện tại?</strong> (Không overexposure)</li>
                    <li><strong>Tâm lý sẵn sàng?</strong> (Karma score ok?)</li>
                </ol>
            </div>

            <p>Nếu bất kỳ câu nào trả lời "Không" hoặc "Không chắc", hãy <strong style="color: #FFBD59;">SKIP trade đó</strong>. Sẽ có cơ hội khác.</p>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=Human+Checklist+UI+Mockup" alt="Checklist Con Người">
                <p class="image-caption">Checklist 5 câu hỏi trước mỗi trade</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⚠️</div>
            <h2 class="section-title">Khi Nào Override AI Signal?</h2>
            <p>Có những tình huống bạn nên override (bỏ qua) signal của AI, dù score cao:</p>

            <ul>
                <li><strong>Trước tin tức lớn 2-4h:</strong> Volatility có thể phá vỡ mọi pattern</li>
                <li><strong>BTC đang dump mạnh:</strong> Altcoins thường follow, dù signal bullish</li>
                <li><strong>Volume quá thấp:</strong> AI có thể nhầm lẫn khi liquidity kém</li>
                <li><strong>Đã có nhiều lệnh mở:</strong> Tránh overexposure dù signal đẹp</li>
                <li><strong>Tâm lý không ổn:</strong> Revenge trading, FOMO, hoặc mệt mỏi</li>
            </ul>

            <div class="highlight-box purple">
                <p style="margin-bottom: 0;"><strong>🛡️ Quy Tắc An Toàn:</strong> Khi nghi ngờ, ĐỪNG trade. Bảo toàn vốn quan trọng hơn bất kỳ signal nào.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/EF4444?text=Override+Scenarios+Infographic" alt="Override Scenarios">
                <p class="image-caption">Các tình huống nên override AI signal</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>Kết hợp AI + Human</strong> cho win rate cao nhất (72%)</li>
                <li><strong>AI làm scanning</strong>, con người làm quyết định</li>
                <li><strong>5 bước Hybrid</strong>: Scan → Filter → Review → Decide → Monitor</li>
                <li><strong>Luôn chạy checklist</strong> 5 câu hỏi trước mỗi trade</li>
                <li><strong>Biết khi nào override</strong> AI signal để bảo vệ vốn</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">1. Trong quy trình Hybrid Trading, bước nào QUAN TRỌNG NHẤT?</p>
                <button class="quiz-option" data-index="0">AI Scanning - quét patterns</button>
                <button class="quiz-option" data-index="1">AI Filtering - lọc theo score</button>
                <button class="quiz-option" data-index="2">Human Decision - quyết định cuối cùng</button>
                <button class="quiz-option" data-index="3">AI Monitoring - theo dõi lệnh</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">2. Khi nào bạn NÊN override AI signal dù Quality Score cao?</p>
                <button class="quiz-option" data-index="0">Khi AI chạy chậm hơn bình thường</button>
                <button class="quiz-option" data-index="1">Trước tin tức lớn như FOMC 2-4 giờ</button>
                <button class="quiz-option" data-index="2">Khi market đang trending mạnh</button>
                <button class="quiz-option" data-index="3">Khi đã có lợi nhuận trong ngày</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="quiz-score-text">Bạn trả lời đúng <span id="correct-count">0</span>/2 câu hỏi!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite</p>
            <p>© 2024 GEM Trading. All rights reserved.</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 2;
        let answeredCount = 0;
        let correctCount = 0;
        document.querySelectorAll(''.quiz-question'').forEach(q => {
            const ci = parseInt(q.dataset.correct);
            const opts = q.querySelectorAll(''.quiz-option'');
            const res = q.querySelector(''.quiz-result'');
            opts.forEach(o => {
                o.addEventListener(''click'', function() {
                    if (q.classList.contains(''answered'')) return;
                    q.classList.add(''answered'');
                    answeredCount++;
                    const si = parseInt(this.dataset.index);
                    if (si === ci) {
                        this.classList.add(''correct'');
                        res.textContent = ''✓ Chính xác! Con người ra quyết định cuối cùng là bước quan trọng nhất.'';
                        res.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        opts[ci].classList.add(''correct'');
                        res.textContent = ''✗ Chưa đúng. Human Decision (quyết định cuối cùng) là bước quan trọng nhất.'';
                        res.className = ''quiz-result show incorrect'';
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
    <title>Bài 3.4: AI + Phân Tích Con Người | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #00F0FF; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #00F0FF; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #00F0FF, #8B5CF6); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(0,240,255,0.1), rgba(139,92,246,0.1)); border: 1px solid rgba(0,240,255,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.purple { background: linear-gradient(135deg, rgba(139,92,246,0.15), rgba(109,40,217,0.1)); border-color: rgba(139,92,246,0.4); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255,189,89,0.15), rgba(245,158,11,0.1)); border-color: rgba(255,189,89,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #00F0FF; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }
        .comparison-card { background: #1a1a2e; border-radius: 8px; padding: 1rem; border-top: 3px solid #00F0FF; }
        .comparison-card.human { border-top-color: #FFBD59; }
        .comparison-card h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .workflow-step { display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; background: #1a1a2e; border-radius: 8px; align-items: flex-start; }
        .step-number { background: linear-gradient(135deg, #00F0FF, #8B5CF6); color: #0a0a0f; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
        .step-content h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.25rem; }
        .step-content p { margin-bottom: 0; font-size: 0.9rem; }
        .formula-box { background: #0a0a0f; border: 2px solid #8B5CF6; border-radius: 8px; padding: 1.5rem; text-align: center; margin: 1rem 0; }
        .formula-box .formula { font-size: 1.25rem; color: #00F0FF; font-weight: 600; margin-bottom: 0.5rem; }
        .stat-row { display: flex; justify-content: space-around; flex-wrap: wrap; gap: 1rem; margin: 1rem 0; }
        .stat-item { text-align: center; padding: 1rem; background: #1a1a2e; border-radius: 8px; flex: 1; min-width: 120px; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: #8B5CF6; }
        .stat-label { font-size: 0.8rem; color: #a1a1aa; margin-top: 0.25rem; }
        .summary-box { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #8B5CF6; border-radius: 12px; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #8B5CF6; font-size: 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-box ul { margin: 0; }
        .summary-box li { margin-bottom: 0.5rem; }
        .quiz-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border: 2px solid #3f3f46; }
        .quiz-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1.5rem; text-align: center; }
        .quiz-question { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem; }
        .quiz-question:last-of-type { margin-bottom: 0; }
        .question-text { font-weight: 500; color: #ffffff; margin-bottom: 1rem; }
        .quiz-option { display: block; width: 100%; text-align: left; background: #0a0a0f; border: 2px solid #3f3f46; border-radius: 8px; padding: 0.875rem 1rem; margin-bottom: 0.5rem; color: #d4d4d8; cursor: pointer; transition: all 0.2s; }
        .quiz-option:hover { border-color: #00F0FF; background: rgba(0,240,255,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(0,240,255,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .comparison-grid { grid-template-columns: 1fr; gap: 0.5rem; }
            .workflow-step { flex-direction: column; gap: 0.75rem; }
            .step-number { margin: 0 auto; }
            .step-content { text-align: center; }
            .stat-row { flex-direction: column; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">AI + Phân Tích Con Người</h1>
            <p class="lesson-subtitle">Kết Hợp Tốt Nhất Của Cả Hai Thế Giới</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🤝</div>
            <h2 class="section-title">AI & Con Người: Đối Tác Hoàn Hảo</h2>
            <p>Trong trading, nhiều người lầm tưởng phải chọn một: hoặc tin hoàn toàn vào AI, hoặc phân tích thủ công. Thực tế, <strong style="color: #00F0FF;">sức mạnh thực sự đến từ sự kết hợp</strong> của cả hai.</p>

            <div class="highlight-box purple">
                <p style="margin-bottom: 0;"><strong>💡 Nguyên Tắc Vàng:</strong> AI làm bộ lọc sơ bộ (scanning) - Con người ra quyết định cuối cùng (decision)</p>
            </div>

            <div class="comparison-grid">
                <div class="comparison-card">
                    <h4>🤖 AI Giỏi Ở</h4>
                    <ul style="padding-left: 1rem; margin: 0;">
                        <li>Scan 100+ coins cùng lúc</li>
                        <li>Phát hiện patterns 24/7</li>
                        <li>Không bị cảm xúc chi phối</li>
                        <li>Tính toán confluence nhanh</li>
                        <li>Không bỏ sót tín hiệu</li>
                    </ul>
                </div>
                <div class="comparison-card human">
                    <h4>👤 Con Người Giỏi Ở</h4>
                    <ul style="padding-left: 1rem; margin: 0;">
                        <li>Đánh giá context thị trường</li>
                        <li>Nhận biết tin tức/sự kiện</li>
                        <li>Quản lý position size</li>
                        <li>Điều chỉnh theo tình huống</li>
                        <li>Ra quyết định cuối cùng</li>
                    </ul>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/00F0FF?text=AI+vs+Human+Comparison+Chart" alt="So Sánh AI và Con Người">
                <p class="image-caption">So sánh điểm mạnh của AI và phân tích con người</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🔄</div>
            <h2 class="section-title">Quy Trình Hybrid Trading</h2>
            <p>Quy trình kết hợp AI + Con Người được thiết kế để tận dụng tối đa điểm mạnh của cả hai:</p>

            <div class="workflow-step">
                <div class="step-number">1</div>
                <div class="step-content">
                    <h4>AI Scanning (Tự Động)</h4>
                    <p>AI quét 100+ coins trên 5 timeframes, phát hiện patterns và zones. Loại bỏ 95% "noise" ngay từ đầu.</p>
                </div>
            </div>

            <div class="workflow-step">
                <div class="step-number">2</div>
                <div class="step-content">
                    <h4>AI Filtering (Chất Lượng)</h4>
                    <p>Chỉ giữ lại setups có Quality Score ≥ 70. Sắp xếp theo confluence level từ cao xuống thấp.</p>
                </div>
            </div>

            <div class="workflow-step">
                <div class="step-number">3</div>
                <div class="step-content">
                    <h4>Human Review (Xác Nhận)</h4>
                    <p>Trader xem xét top 5-10 setups. Kiểm tra news, context thị trường, và lý do cá nhân để trade hoặc không.</p>
                </div>
            </div>

            <div class="workflow-step">
                <div class="step-number">4</div>
                <div class="step-content">
                    <h4>Human Decision (Quyết Định)</h4>
                    <p>Xác định position size, entry timing, và risk management. Đây là bước QUAN TRỌNG NHẤT.</p>
                </div>
            </div>

            <div class="workflow-step">
                <div class="step-number">5</div>
                <div class="step-content">
                    <h4>AI Monitoring (Theo Dõi)</h4>
                    <p>Sau khi vào lệnh, AI tiếp tục theo dõi và cảnh báo nếu có thay đổi quan trọng.</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/8B5CF6?text=Hybrid+Trading+Workflow+Diagram" alt="Quy Trình Hybrid Trading">
                <p class="image-caption">Sơ đồ quy trình Hybrid Trading 5 bước</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Hiệu Quả Của Phương Pháp Hybrid</h2>
            <p>Dữ liệu từ cộng đồng GEM cho thấy sự khác biệt rõ rệt giữa các phương pháp:</p>

            <div class="stat-row">
                <div class="stat-item">
                    <div class="stat-value">52%</div>
                    <div class="stat-label">Chỉ AI (Auto)</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">58%</div>
                    <div class="stat-label">Chỉ Manual</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" style="color: #10B981;">72%</div>
                    <div class="stat-label">Hybrid (AI + Human)</div>
                </div>
            </div>

            <div class="highlight-box gold">
                <p><strong>📈 Insight:</strong> Phương pháp Hybrid cho win rate cao hơn 14-20% so với dùng riêng AI hoặc phân tích thủ công.</p>
            </div>

            <div class="formula-box">
                <div class="formula">Win Rate = AI Precision × Human Judgment</div>
                <p style="margin-bottom: 0; color: #a1a1aa; font-size: 0.9rem;">Kết hợp độ chính xác của AI với phán đoán context của con người</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Win+Rate+Comparison+Chart" alt="So Sánh Win Rate">
                <p class="image-caption">So sánh win rate giữa các phương pháp trading</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">✅</div>
            <h2 class="section-title">Human Checklist Trước Mỗi Trade</h2>
            <p>Khi AI đưa ra signal có Quality Score cao, hãy chạy qua checklist này trước khi vào lệnh:</p>

            <div class="highlight-box">
                <p><strong>🔍 5 Câu Hỏi Phải Trả Lời:</strong></p>
                <ol>
                    <li><strong>Tin tức lớn sắp tới?</strong> (FOMC, CPI, ETH upgrade...)</li>
                    <li><strong>BTC đang làm gì?</strong> (Correlation check)</li>
                    <li><strong>Risk/Reward có hợp lý?</strong> (Tối thiểu 1:2)</li>
                    <li><strong>Vị thế hiện tại?</strong> (Không overexposure)</li>
                    <li><strong>Tâm lý sẵn sàng?</strong> (Karma score ok?)</li>
                </ol>
            </div>

            <p>Nếu bất kỳ câu nào trả lời "Không" hoặc "Không chắc", hãy <strong style="color: #FFBD59;">SKIP trade đó</strong>. Sẽ có cơ hội khác.</p>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=Human+Checklist+UI+Mockup" alt="Checklist Con Người">
                <p class="image-caption">Checklist 5 câu hỏi trước mỗi trade</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⚠️</div>
            <h2 class="section-title">Khi Nào Override AI Signal?</h2>
            <p>Có những tình huống bạn nên override (bỏ qua) signal của AI, dù score cao:</p>

            <ul>
                <li><strong>Trước tin tức lớn 2-4h:</strong> Volatility có thể phá vỡ mọi pattern</li>
                <li><strong>BTC đang dump mạnh:</strong> Altcoins thường follow, dù signal bullish</li>
                <li><strong>Volume quá thấp:</strong> AI có thể nhầm lẫn khi liquidity kém</li>
                <li><strong>Đã có nhiều lệnh mở:</strong> Tránh overexposure dù signal đẹp</li>
                <li><strong>Tâm lý không ổn:</strong> Revenge trading, FOMO, hoặc mệt mỏi</li>
            </ul>

            <div class="highlight-box purple">
                <p style="margin-bottom: 0;"><strong>🛡️ Quy Tắc An Toàn:</strong> Khi nghi ngờ, ĐỪNG trade. Bảo toàn vốn quan trọng hơn bất kỳ signal nào.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/EF4444?text=Override+Scenarios+Infographic" alt="Override Scenarios">
                <p class="image-caption">Các tình huống nên override AI signal</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>Kết hợp AI + Human</strong> cho win rate cao nhất (72%)</li>
                <li><strong>AI làm scanning</strong>, con người làm quyết định</li>
                <li><strong>5 bước Hybrid</strong>: Scan → Filter → Review → Decide → Monitor</li>
                <li><strong>Luôn chạy checklist</strong> 5 câu hỏi trước mỗi trade</li>
                <li><strong>Biết khi nào override</strong> AI signal để bảo vệ vốn</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">1. Trong quy trình Hybrid Trading, bước nào QUAN TRỌNG NHẤT?</p>
                <button class="quiz-option" data-index="0">AI Scanning - quét patterns</button>
                <button class="quiz-option" data-index="1">AI Filtering - lọc theo score</button>
                <button class="quiz-option" data-index="2">Human Decision - quyết định cuối cùng</button>
                <button class="quiz-option" data-index="3">AI Monitoring - theo dõi lệnh</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">2. Khi nào bạn NÊN override AI signal dù Quality Score cao?</p>
                <button class="quiz-option" data-index="0">Khi AI chạy chậm hơn bình thường</button>
                <button class="quiz-option" data-index="1">Trước tin tức lớn như FOMC 2-4 giờ</button>
                <button class="quiz-option" data-index="2">Khi market đang trending mạnh</button>
                <button class="quiz-option" data-index="3">Khi đã có lợi nhuận trong ngày</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="quiz-score-text">Bạn trả lời đúng <span id="correct-count">0</span>/2 câu hỏi!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite</p>
            <p>© 2024 GEM Trading. All rights reserved.</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 2;
        let answeredCount = 0;
        let correctCount = 0;
        document.querySelectorAll(''.quiz-question'').forEach(q => {
            const ci = parseInt(q.dataset.correct);
            const opts = q.querySelectorAll(''.quiz-option'');
            const res = q.querySelector(''.quiz-result'');
            opts.forEach(o => {
                o.addEventListener(''click'', function() {
                    if (q.classList.contains(''answered'')) return;
                    q.classList.add(''answered'');
                    answeredCount++;
                    const si = parseInt(this.dataset.index);
                    if (si === ci) {
                        this.classList.add(''correct'');
                        res.textContent = ''✓ Chính xác! Con người ra quyết định cuối cùng là bước quan trọng nhất.'';
                        res.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        opts[ci].classList.add(''correct'');
                        res.textContent = ''✗ Chưa đúng. Human Decision (quyết định cuối cùng) là bước quan trọng nhất.'';
                        res.className = ''quiz-result show incorrect'';
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

-- Lesson 3.5: Ví Dụ AI Signals
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch3-l5',
  'module-tier-3-ch3',
  'course-tier3-trading-mastery',
  'Bài 3.5: Ví Dụ AI Signals',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 3.5: Ví Dụ AI Signals | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #00F0FF; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #00F0FF; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #00F0FF, #8B5CF6); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(0,240,255,0.1), rgba(139,92,246,0.1)); border: 1px solid rgba(0,240,255,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.1)); border-color: rgba(16,185,129,0.4); }
        .highlight-box.red { background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.1)); border-color: rgba(239,68,68,0.4); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255,189,89,0.15), rgba(245,158,11,0.1)); border-color: rgba(255,189,89,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #00F0FF; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .case-study-box { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #00F0FF; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; }
        .case-study-box h4 { color: #00F0FF; font-size: 1.1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .case-study-box.success { border-color: #10B981; }
        .case-study-box.success h4 { color: #10B981; }
        .case-study-box.warning { border-color: #FFBD59; }
        .case-study-box.warning h4 { color: #FFBD59; }
        .signal-card { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin: 1rem 0; border: 1px solid #3f3f46; }
        .signal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .signal-pair { font-size: 1.1rem; font-weight: 600; color: #ffffff; }
        .signal-score { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
        .signal-score.high { background: rgba(16,185,129,0.2); color: #10B981; }
        .signal-score.medium { background: rgba(255,189,89,0.2); color: #FFBD59; }
        .signal-details { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; font-size: 0.9rem; }
        .signal-detail { display: flex; justify-content: space-between; }
        .signal-detail-label { color: #71717a; }
        .signal-detail-value { color: #ffffff; font-weight: 500; }
        .timeline-step { display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; background: #1a1a2e; border-radius: 8px; align-items: flex-start; }
        .timeline-time { background: linear-gradient(135deg, #00F0FF, #8B5CF6); color: #0a0a0f; padding: 0.25rem 0.75rem; border-radius: 4px; font-weight: 600; font-size: 0.85rem; flex-shrink: 0; }
        .timeline-content h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.25rem; }
        .timeline-content p { margin-bottom: 0; font-size: 0.9rem; }
        .result-box { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 1.5rem; background: #1a1a2e; border-radius: 8px; margin: 1rem 0; }
        .result-value { font-size: 1.75rem; font-weight: 700; }
        .result-value.positive { color: #10B981; }
        .result-value.negative { color: #EF4444; }
        .result-label { color: #a1a1aa; font-size: 0.9rem; }
        .summary-box { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #8B5CF6; border-radius: 12px; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #8B5CF6; font-size: 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-box ul { margin: 0; }
        .summary-box li { margin-bottom: 0.5rem; }
        .quiz-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border: 2px solid #3f3f46; }
        .quiz-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1.5rem; text-align: center; }
        .quiz-question { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem; }
        .quiz-question:last-of-type { margin-bottom: 0; }
        .question-text { font-weight: 500; color: #ffffff; margin-bottom: 1rem; }
        .quiz-option { display: block; width: 100%; text-align: left; background: #0a0a0f; border: 2px solid #3f3f46; border-radius: 8px; padding: 0.875rem 1rem; margin-bottom: 0.5rem; color: #d4d4d8; cursor: pointer; transition: all 0.2s; }
        .quiz-option:hover { border-color: #00F0FF; background: rgba(0,240,255,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(0,240,255,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .case-study-box { margin: 1rem 0; }
            .signal-details { grid-template-columns: 1fr; }
            .timeline-step { flex-direction: column; gap: 0.75rem; }
            .result-box { flex-direction: column; text-align: center; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">Ví Dụ AI Signals</h1>
            <p class="lesson-subtitle">Case Studies Thực Tế Với GEM AI Brain</p>
        </header>

        <section class="content-section">
            <div class="section-icon">📚</div>
            <h2 class="section-title">Học Từ Ví Dụ Thực Tế</h2>
            <p>Trong bài này, chúng ta sẽ phân tích 3 case studies thực tế về cách sử dụng AI Signals kết hợp với phân tích con người. Mỗi ví dụ sẽ cho thấy quy trình đầy đủ từ nhận signal đến kết quả.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Mục Tiêu:</strong> Hiểu rõ quy trình Hybrid Trading qua 3 scenarios khác nhau: trade thành công, trade thất bại, và quyết định skip.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">✅</div>
            <h2 class="section-title">Case Study #1: Trade Thành Công</h2>

            <div class="case-study-box success">
                <h4>🟢 ETH/USDT - Long Setup thắng +18%</h4>
                <p>Ngày 15/12/2024, AI phát hiện UPU pattern trên ETH 4H với confluence cao.</p>
            </div>

            <div class="signal-card">
                <div class="signal-header">
                    <span class="signal-pair">📊 ETH/USDT</span>
                    <span class="signal-score high">Score: 87</span>
                </div>
                <div class="signal-details">
                    <div class="signal-detail">
                        <span class="signal-detail-label">Pattern:</span>
                        <span class="signal-detail-value">UPU Retest</span>
                    </div>
                    <div class="signal-detail">
                        <span class="signal-detail-label">Timeframe:</span>
                        <span class="signal-detail-value">4H</span>
                    </div>
                    <div class="signal-detail">
                        <span class="signal-detail-label">Zone:</span>
                        <span class="signal-detail-value">$2,180 Support</span>
                    </div>
                    <div class="signal-detail">
                        <span class="signal-detail-label">Confluence:</span>
                        <span class="signal-detail-value">4/5 factors</span>
                    </div>
                </div>
            </div>

            <h4 style="color: #ffffff; margin: 1rem 0 0.5rem;">Timeline Quyết Định:</h4>

            <div class="timeline-step">
                <span class="timeline-time">14:00</span>
                <div class="timeline-content">
                    <h4>AI Alert Nhận Được</h4>
                    <p>AI phát hiện ETH đang retest zone $2,180 với UPU pattern. Quality Score 87/100.</p>
                </div>
            </div>

            <div class="timeline-step">
                <span class="timeline-time">14:15</span>
                <div class="timeline-content">
                    <h4>Human Review</h4>
                    <p>Kiểm tra checklist: Không có tin tức lớn, BTC đang sideway ổn định, Karma score tốt.</p>
                </div>
            </div>

            <div class="timeline-step">
                <span class="timeline-time">14:30</span>
                <div class="timeline-content">
                    <h4>Xác Nhận Candlestick</h4>
                    <p>Thấy Bullish Engulfing hình thành tại zone. Quyết định vào lệnh Long.</p>
                </div>
            </div>

            <div class="timeline-step">
                <span class="timeline-time">14:35</span>
                <div class="timeline-content">
                    <h4>Entry Executed</h4>
                    <p>Entry: $2,185 | SL: $2,120 (-3%) | TP: $2,580 (+18%)</p>
                </div>
            </div>

            <div class="result-box">
                <div>
                    <div class="result-value positive">+18.1%</div>
                    <div class="result-label">Lợi Nhuận Đạt Được</div>
                </div>
                <div>
                    <div class="result-value positive">6:1</div>
                    <div class="result-label">Risk/Reward</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/10B981?text=ETH+UPU+Pattern+Chart+Win" alt="ETH UPU Pattern Thắng">
                <p class="image-caption">Chart ETH/USDT 4H với UPU Pattern và kết quả trade</p>
            </div>

            <div class="highlight-box green">
                <p style="margin-bottom: 0;"><strong>🎯 Key Takeaway:</strong> AI score 87 + Human confirmation (candlestick + checklist pass) = Trade thành công với R:R 6:1</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">❌</div>
            <h2 class="section-title">Case Study #2: Trade Thất Bại - Bài Học</h2>

            <div class="case-study-box" style="border-color: #EF4444;">
                <h4 style="color: #EF4444;">🔴 SOL/USDT - Long Setup hit SL -2.5%</h4>
                <p>Ngày 18/12/2024, trade với AI signal nhưng bỏ qua context quan trọng.</p>
            </div>

            <div class="signal-card">
                <div class="signal-header">
                    <span class="signal-pair">📊 SOL/USDT</span>
                    <span class="signal-score high">Score: 82</span>
                </div>
                <div class="signal-details">
                    <div class="signal-detail">
                        <span class="signal-detail-label">Pattern:</span>
                        <span class="signal-detail-value">DPU Breakout</span>
                    </div>
                    <div class="signal-detail">
                        <span class="signal-detail-label">Timeframe:</span>
                        <span class="signal-detail-value">1H</span>
                    </div>
                    <div class="signal-detail">
                        <span class="signal-detail-label">Zone:</span>
                        <span class="signal-detail-value">$98 Resistance</span>
                    </div>
                    <div class="signal-detail">
                        <span class="signal-detail-label">Confluence:</span>
                        <span class="signal-detail-value">3/5 factors</span>
                    </div>
                </div>
            </div>

            <h4 style="color: #ffffff; margin: 1rem 0 0.5rem;">Điều Gì Đã Xảy Ra:</h4>

            <ul>
                <li><strong>Bỏ qua tin tức:</strong> FOMC meeting diễn ra 2 giờ sau entry</li>
                <li><strong>BTC đang yếu:</strong> BTC đang tạo lower high, không phải thời điểm long altcoins</li>
                <li><strong>Vội vàng entry:</strong> Không chờ candlestick confirmation đầy đủ</li>
            </ul>

            <div class="result-box">
                <div>
                    <div class="result-value negative">-2.5%</div>
                    <div class="result-label">Lỗ Chịu Được</div>
                </div>
                <div>
                    <div class="result-value" style="color: #FFBD59;">Checklist Fail</div>
                    <div class="result-label">Bỏ Qua 2/5 Câu</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/EF4444?text=SOL+Failed+Trade+Analysis" alt="SOL Trade Thất Bại">
                <p class="image-caption">Phân tích trade SOL thất bại với các yếu tố bỏ qua</p>
            </div>

            <div class="highlight-box red">
                <p style="margin-bottom: 0;"><strong>📚 Bài Học:</strong> AI score cao (82) vẫn có thể thua nếu bỏ qua Human Checklist. Luôn kiểm tra tin tức và BTC context trước khi trade.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⏸️</div>
            <h2 class="section-title">Case Study #3: Quyết Định SKIP</h2>

            <div class="case-study-box warning">
                <h4>🟡 AVAX/USDT - Skip Signal, Tránh Được -8%</h4>
                <p>Ngày 20/12/2024, AI đưa signal nhưng trader quyết định skip dựa trên context.</p>
            </div>

            <div class="signal-card">
                <div class="signal-header">
                    <span class="signal-pair">📊 AVAX/USDT</span>
                    <span class="signal-score medium">Score: 74</span>
                </div>
                <div class="signal-details">
                    <div class="signal-detail">
                        <span class="signal-detail-label">Pattern:</span>
                        <span class="signal-detail-value">UPD Support</span>
                    </div>
                    <div class="signal-detail">
                        <span class="signal-detail-label">Timeframe:</span>
                        <span class="signal-detail-value">4H</span>
                    </div>
                    <div class="signal-detail">
                        <span class="signal-detail-label">Zone:</span>
                        <span class="signal-detail-value">$38 Support</span>
                    </div>
                    <div class="signal-detail">
                        <span class="signal-detail-label">Confluence:</span>
                        <span class="signal-detail-value">3/5 factors</span>
                    </div>
                </div>
            </div>

            <h4 style="color: #ffffff; margin: 1rem 0 0.5rem;">Lý Do Skip:</h4>

            <ul>
                <li><strong>Score chỉ 74:</strong> Đủ threshold nhưng không outstanding</li>
                <li><strong>BTC đang dump:</strong> BTC giảm 4% trong 24h, risk cho altcoins cao</li>
                <li><strong>Đã có 2 lệnh mở:</strong> Thêm AVAX sẽ overexposure crypto</li>
                <li><strong>Volume thấp bất thường:</strong> Liquidity kém, dễ bị stop hunt</li>
            </ul>

            <h4 style="color: #ffffff; margin: 1rem 0 0.5rem;">Điều Xảy Ra Sau Đó:</h4>
            <p>AVAX break support $38 và dump thêm 8% xuống $35. Nếu đã entry, SL sẽ hit và còn có thể bị slippage.</p>

            <div class="result-box">
                <div>
                    <div class="result-value positive">0%</div>
                    <div class="result-label">Không Mất Tiền</div>
                </div>
                <div>
                    <div class="result-value positive">-8% Avoided</div>
                    <div class="result-label">Tránh Được Lỗ</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/FFBD59?text=AVAX+Skip+Decision+Chart" alt="AVAX Skip Decision">
                <p class="image-caption">Chart AVAX và lý do quyết định skip trade</p>
            </div>

            <div class="highlight-box gold">
                <p style="margin-bottom: 0;"><strong>💡 Wisdom:</strong> Đôi khi KHÔNG trade là trade tốt nhất. AI chỉ là công cụ - con người vẫn có quyền quyết định cuối cùng.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Tổng Kết 3 Case Studies</h2>

            <div class="highlight-box">
                <p><strong>🎯 Pattern Nhận Ra:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li><strong>Case 1 (Win):</strong> AI Score cao + Human Checklist PASS = Entry</li>
                    <li><strong>Case 2 (Lose):</strong> AI Score cao + Human Checklist FAIL = Không nên entry</li>
                    <li><strong>Case 3 (Skip):</strong> AI Score trung bình + Context xấu = Skip</li>
                </ul>
            </div>

            <p>Điều quan trọng không phải là win rate 100% (không thể đạt được), mà là:</p>
            <ol>
                <li><strong>Tuân thủ quy trình:</strong> AI Scan → Human Review → Decision</li>
                <li><strong>Bảo toàn vốn:</strong> Chấp nhận skip trade hơn là mất tiền</li>
                <li><strong>Học từ lỗi:</strong> Mỗi trade (win hay lose) đều là bài học</li>
            </ol>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=3+Case+Studies+Summary+Infographic" alt="Tổng Kết 3 Cases">
                <p class="image-caption">Infographic tổng kết 3 case studies và bài học</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>AI Score cao không đảm bảo win</strong> - cần Human Review</li>
                <li><strong>Checklist 5 câu</strong> là yếu tố quyết định cuối cùng</li>
                <li><strong>Skip trade</strong> khi context không phù hợp dù signal đẹp</li>
                <li><strong>Tin tức và BTC context</strong> là 2 yếu tố override quan trọng nhất</li>
                <li><strong>Trade tốt nhất</strong> đôi khi là không trade</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Trong Case Study #2 (SOL thua), yếu tố nào đã bị bỏ qua?</p>
                <button class="quiz-option" data-index="0">AI Score quá thấp</button>
                <button class="quiz-option" data-index="1">Tin tức FOMC và BTC context</button>
                <button class="quiz-option" data-index="2">Pattern không đúng</button>
                <button class="quiz-option" data-index="3">Zone support sai</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Trong Case Study #3 (AVAX skip), quyết định skip đã giúp tránh được bao nhiêu % lỗ tiềm năng?</p>
                <button class="quiz-option" data-index="0">2.5%</button>
                <button class="quiz-option" data-index="1">5%</button>
                <button class="quiz-option" data-index="2">8%</button>
                <button class="quiz-option" data-index="3">18%</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="quiz-score-text">Bạn trả lời đúng <span id="correct-count">0</span>/2 câu hỏi!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite</p>
            <p>© 2024 GEM Trading. All rights reserved.</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 2;
        let answeredCount = 0;
        let correctCount = 0;
        document.querySelectorAll(''.quiz-question'').forEach(q => {
            const ci = parseInt(q.dataset.correct);
            const opts = q.querySelectorAll(''.quiz-option'');
            const res = q.querySelector(''.quiz-result'');
            opts.forEach(o => {
                o.addEventListener(''click'', function() {
                    if (q.classList.contains(''answered'')) return;
                    q.classList.add(''answered'');
                    answeredCount++;
                    const si = parseInt(this.dataset.index);
                    if (si === ci) {
                        this.classList.add(''correct'');
                        res.textContent = ''✓ Chính xác!'';
                        res.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        opts[ci].classList.add(''correct'');
                        res.textContent = ''✗ Chưa đúng. Hãy xem lại case study.'';
                        res.className = ''quiz-result show incorrect'';
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
    <title>Bài 3.5: Ví Dụ AI Signals | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #00F0FF; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #00F0FF; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #00F0FF, #8B5CF6); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(0,240,255,0.1), rgba(139,92,246,0.1)); border: 1px solid rgba(0,240,255,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.1)); border-color: rgba(16,185,129,0.4); }
        .highlight-box.red { background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.1)); border-color: rgba(239,68,68,0.4); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255,189,89,0.15), rgba(245,158,11,0.1)); border-color: rgba(255,189,89,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #00F0FF; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .case-study-box { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #00F0FF; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; }
        .case-study-box h4 { color: #00F0FF; font-size: 1.1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .case-study-box.success { border-color: #10B981; }
        .case-study-box.success h4 { color: #10B981; }
        .case-study-box.warning { border-color: #FFBD59; }
        .case-study-box.warning h4 { color: #FFBD59; }
        .signal-card { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin: 1rem 0; border: 1px solid #3f3f46; }
        .signal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .signal-pair { font-size: 1.1rem; font-weight: 600; color: #ffffff; }
        .signal-score { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
        .signal-score.high { background: rgba(16,185,129,0.2); color: #10B981; }
        .signal-score.medium { background: rgba(255,189,89,0.2); color: #FFBD59; }
        .signal-details { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; font-size: 0.9rem; }
        .signal-detail { display: flex; justify-content: space-between; }
        .signal-detail-label { color: #71717a; }
        .signal-detail-value { color: #ffffff; font-weight: 500; }
        .timeline-step { display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; background: #1a1a2e; border-radius: 8px; align-items: flex-start; }
        .timeline-time { background: linear-gradient(135deg, #00F0FF, #8B5CF6); color: #0a0a0f; padding: 0.25rem 0.75rem; border-radius: 4px; font-weight: 600; font-size: 0.85rem; flex-shrink: 0; }
        .timeline-content h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.25rem; }
        .timeline-content p { margin-bottom: 0; font-size: 0.9rem; }
        .result-box { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 1.5rem; background: #1a1a2e; border-radius: 8px; margin: 1rem 0; }
        .result-value { font-size: 1.75rem; font-weight: 700; }
        .result-value.positive { color: #10B981; }
        .result-value.negative { color: #EF4444; }
        .result-label { color: #a1a1aa; font-size: 0.9rem; }
        .summary-box { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #8B5CF6; border-radius: 12px; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #8B5CF6; font-size: 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-box ul { margin: 0; }
        .summary-box li { margin-bottom: 0.5rem; }
        .quiz-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border: 2px solid #3f3f46; }
        .quiz-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1.5rem; text-align: center; }
        .quiz-question { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem; }
        .quiz-question:last-of-type { margin-bottom: 0; }
        .question-text { font-weight: 500; color: #ffffff; margin-bottom: 1rem; }
        .quiz-option { display: block; width: 100%; text-align: left; background: #0a0a0f; border: 2px solid #3f3f46; border-radius: 8px; padding: 0.875rem 1rem; margin-bottom: 0.5rem; color: #d4d4d8; cursor: pointer; transition: all 0.2s; }
        .quiz-option:hover { border-color: #00F0FF; background: rgba(0,240,255,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(0,240,255,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .case-study-box { margin: 1rem 0; }
            .signal-details { grid-template-columns: 1fr; }
            .timeline-step { flex-direction: column; gap: 0.75rem; }
            .result-box { flex-direction: column; text-align: center; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">Ví Dụ AI Signals</h1>
            <p class="lesson-subtitle">Case Studies Thực Tế Với GEM AI Brain</p>
        </header>

        <section class="content-section">
            <div class="section-icon">📚</div>
            <h2 class="section-title">Học Từ Ví Dụ Thực Tế</h2>
            <p>Trong bài này, chúng ta sẽ phân tích 3 case studies thực tế về cách sử dụng AI Signals kết hợp với phân tích con người. Mỗi ví dụ sẽ cho thấy quy trình đầy đủ từ nhận signal đến kết quả.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Mục Tiêu:</strong> Hiểu rõ quy trình Hybrid Trading qua 3 scenarios khác nhau: trade thành công, trade thất bại, và quyết định skip.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">✅</div>
            <h2 class="section-title">Case Study #1: Trade Thành Công</h2>

            <div class="case-study-box success">
                <h4>🟢 ETH/USDT - Long Setup thắng +18%</h4>
                <p>Ngày 15/12/2024, AI phát hiện UPU pattern trên ETH 4H với confluence cao.</p>
            </div>

            <div class="signal-card">
                <div class="signal-header">
                    <span class="signal-pair">📊 ETH/USDT</span>
                    <span class="signal-score high">Score: 87</span>
                </div>
                <div class="signal-details">
                    <div class="signal-detail">
                        <span class="signal-detail-label">Pattern:</span>
                        <span class="signal-detail-value">UPU Retest</span>
                    </div>
                    <div class="signal-detail">
                        <span class="signal-detail-label">Timeframe:</span>
                        <span class="signal-detail-value">4H</span>
                    </div>
                    <div class="signal-detail">
                        <span class="signal-detail-label">Zone:</span>
                        <span class="signal-detail-value">$2,180 Support</span>
                    </div>
                    <div class="signal-detail">
                        <span class="signal-detail-label">Confluence:</span>
                        <span class="signal-detail-value">4/5 factors</span>
                    </div>
                </div>
            </div>

            <h4 style="color: #ffffff; margin: 1rem 0 0.5rem;">Timeline Quyết Định:</h4>

            <div class="timeline-step">
                <span class="timeline-time">14:00</span>
                <div class="timeline-content">
                    <h4>AI Alert Nhận Được</h4>
                    <p>AI phát hiện ETH đang retest zone $2,180 với UPU pattern. Quality Score 87/100.</p>
                </div>
            </div>

            <div class="timeline-step">
                <span class="timeline-time">14:15</span>
                <div class="timeline-content">
                    <h4>Human Review</h4>
                    <p>Kiểm tra checklist: Không có tin tức lớn, BTC đang sideway ổn định, Karma score tốt.</p>
                </div>
            </div>

            <div class="timeline-step">
                <span class="timeline-time">14:30</span>
                <div class="timeline-content">
                    <h4>Xác Nhận Candlestick</h4>
                    <p>Thấy Bullish Engulfing hình thành tại zone. Quyết định vào lệnh Long.</p>
                </div>
            </div>

            <div class="timeline-step">
                <span class="timeline-time">14:35</span>
                <div class="timeline-content">
                    <h4>Entry Executed</h4>
                    <p>Entry: $2,185 | SL: $2,120 (-3%) | TP: $2,580 (+18%)</p>
                </div>
            </div>

            <div class="result-box">
                <div>
                    <div class="result-value positive">+18.1%</div>
                    <div class="result-label">Lợi Nhuận Đạt Được</div>
                </div>
                <div>
                    <div class="result-value positive">6:1</div>
                    <div class="result-label">Risk/Reward</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/10B981?text=ETH+UPU+Pattern+Chart+Win" alt="ETH UPU Pattern Thắng">
                <p class="image-caption">Chart ETH/USDT 4H với UPU Pattern và kết quả trade</p>
            </div>

            <div class="highlight-box green">
                <p style="margin-bottom: 0;"><strong>🎯 Key Takeaway:</strong> AI score 87 + Human confirmation (candlestick + checklist pass) = Trade thành công với R:R 6:1</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">❌</div>
            <h2 class="section-title">Case Study #2: Trade Thất Bại - Bài Học</h2>

            <div class="case-study-box" style="border-color: #EF4444;">
                <h4 style="color: #EF4444;">🔴 SOL/USDT - Long Setup hit SL -2.5%</h4>
                <p>Ngày 18/12/2024, trade với AI signal nhưng bỏ qua context quan trọng.</p>
            </div>

            <div class="signal-card">
                <div class="signal-header">
                    <span class="signal-pair">📊 SOL/USDT</span>
                    <span class="signal-score high">Score: 82</span>
                </div>
                <div class="signal-details">
                    <div class="signal-detail">
                        <span class="signal-detail-label">Pattern:</span>
                        <span class="signal-detail-value">DPU Breakout</span>
                    </div>
                    <div class="signal-detail">
                        <span class="signal-detail-label">Timeframe:</span>
                        <span class="signal-detail-value">1H</span>
                    </div>
                    <div class="signal-detail">
                        <span class="signal-detail-label">Zone:</span>
                        <span class="signal-detail-value">$98 Resistance</span>
                    </div>
                    <div class="signal-detail">
                        <span class="signal-detail-label">Confluence:</span>
                        <span class="signal-detail-value">3/5 factors</span>
                    </div>
                </div>
            </div>

            <h4 style="color: #ffffff; margin: 1rem 0 0.5rem;">Điều Gì Đã Xảy Ra:</h4>

            <ul>
                <li><strong>Bỏ qua tin tức:</strong> FOMC meeting diễn ra 2 giờ sau entry</li>
                <li><strong>BTC đang yếu:</strong> BTC đang tạo lower high, không phải thời điểm long altcoins</li>
                <li><strong>Vội vàng entry:</strong> Không chờ candlestick confirmation đầy đủ</li>
            </ul>

            <div class="result-box">
                <div>
                    <div class="result-value negative">-2.5%</div>
                    <div class="result-label">Lỗ Chịu Được</div>
                </div>
                <div>
                    <div class="result-value" style="color: #FFBD59;">Checklist Fail</div>
                    <div class="result-label">Bỏ Qua 2/5 Câu</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/EF4444?text=SOL+Failed+Trade+Analysis" alt="SOL Trade Thất Bại">
                <p class="image-caption">Phân tích trade SOL thất bại với các yếu tố bỏ qua</p>
            </div>

            <div class="highlight-box red">
                <p style="margin-bottom: 0;"><strong>📚 Bài Học:</strong> AI score cao (82) vẫn có thể thua nếu bỏ qua Human Checklist. Luôn kiểm tra tin tức và BTC context trước khi trade.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⏸️</div>
            <h2 class="section-title">Case Study #3: Quyết Định SKIP</h2>

            <div class="case-study-box warning">
                <h4>🟡 AVAX/USDT - Skip Signal, Tránh Được -8%</h4>
                <p>Ngày 20/12/2024, AI đưa signal nhưng trader quyết định skip dựa trên context.</p>
            </div>

            <div class="signal-card">
                <div class="signal-header">
                    <span class="signal-pair">📊 AVAX/USDT</span>
                    <span class="signal-score medium">Score: 74</span>
                </div>
                <div class="signal-details">
                    <div class="signal-detail">
                        <span class="signal-detail-label">Pattern:</span>
                        <span class="signal-detail-value">UPD Support</span>
                    </div>
                    <div class="signal-detail">
                        <span class="signal-detail-label">Timeframe:</span>
                        <span class="signal-detail-value">4H</span>
                    </div>
                    <div class="signal-detail">
                        <span class="signal-detail-label">Zone:</span>
                        <span class="signal-detail-value">$38 Support</span>
                    </div>
                    <div class="signal-detail">
                        <span class="signal-detail-label">Confluence:</span>
                        <span class="signal-detail-value">3/5 factors</span>
                    </div>
                </div>
            </div>

            <h4 style="color: #ffffff; margin: 1rem 0 0.5rem;">Lý Do Skip:</h4>

            <ul>
                <li><strong>Score chỉ 74:</strong> Đủ threshold nhưng không outstanding</li>
                <li><strong>BTC đang dump:</strong> BTC giảm 4% trong 24h, risk cho altcoins cao</li>
                <li><strong>Đã có 2 lệnh mở:</strong> Thêm AVAX sẽ overexposure crypto</li>
                <li><strong>Volume thấp bất thường:</strong> Liquidity kém, dễ bị stop hunt</li>
            </ul>

            <h4 style="color: #ffffff; margin: 1rem 0 0.5rem;">Điều Xảy Ra Sau Đó:</h4>
            <p>AVAX break support $38 và dump thêm 8% xuống $35. Nếu đã entry, SL sẽ hit và còn có thể bị slippage.</p>

            <div class="result-box">
                <div>
                    <div class="result-value positive">0%</div>
                    <div class="result-label">Không Mất Tiền</div>
                </div>
                <div>
                    <div class="result-value positive">-8% Avoided</div>
                    <div class="result-label">Tránh Được Lỗ</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/FFBD59?text=AVAX+Skip+Decision+Chart" alt="AVAX Skip Decision">
                <p class="image-caption">Chart AVAX và lý do quyết định skip trade</p>
            </div>

            <div class="highlight-box gold">
                <p style="margin-bottom: 0;"><strong>💡 Wisdom:</strong> Đôi khi KHÔNG trade là trade tốt nhất. AI chỉ là công cụ - con người vẫn có quyền quyết định cuối cùng.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Tổng Kết 3 Case Studies</h2>

            <div class="highlight-box">
                <p><strong>🎯 Pattern Nhận Ra:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li><strong>Case 1 (Win):</strong> AI Score cao + Human Checklist PASS = Entry</li>
                    <li><strong>Case 2 (Lose):</strong> AI Score cao + Human Checklist FAIL = Không nên entry</li>
                    <li><strong>Case 3 (Skip):</strong> AI Score trung bình + Context xấu = Skip</li>
                </ul>
            </div>

            <p>Điều quan trọng không phải là win rate 100% (không thể đạt được), mà là:</p>
            <ol>
                <li><strong>Tuân thủ quy trình:</strong> AI Scan → Human Review → Decision</li>
                <li><strong>Bảo toàn vốn:</strong> Chấp nhận skip trade hơn là mất tiền</li>
                <li><strong>Học từ lỗi:</strong> Mỗi trade (win hay lose) đều là bài học</li>
            </ol>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=3+Case+Studies+Summary+Infographic" alt="Tổng Kết 3 Cases">
                <p class="image-caption">Infographic tổng kết 3 case studies và bài học</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>AI Score cao không đảm bảo win</strong> - cần Human Review</li>
                <li><strong>Checklist 5 câu</strong> là yếu tố quyết định cuối cùng</li>
                <li><strong>Skip trade</strong> khi context không phù hợp dù signal đẹp</li>
                <li><strong>Tin tức và BTC context</strong> là 2 yếu tố override quan trọng nhất</li>
                <li><strong>Trade tốt nhất</strong> đôi khi là không trade</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Trong Case Study #2 (SOL thua), yếu tố nào đã bị bỏ qua?</p>
                <button class="quiz-option" data-index="0">AI Score quá thấp</button>
                <button class="quiz-option" data-index="1">Tin tức FOMC và BTC context</button>
                <button class="quiz-option" data-index="2">Pattern không đúng</button>
                <button class="quiz-option" data-index="3">Zone support sai</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Trong Case Study #3 (AVAX skip), quyết định skip đã giúp tránh được bao nhiêu % lỗ tiềm năng?</p>
                <button class="quiz-option" data-index="0">2.5%</button>
                <button class="quiz-option" data-index="1">5%</button>
                <button class="quiz-option" data-index="2">8%</button>
                <button class="quiz-option" data-index="3">18%</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="quiz-score-text">Bạn trả lời đúng <span id="correct-count">0</span>/2 câu hỏi!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite</p>
            <p>© 2024 GEM Trading. All rights reserved.</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 2;
        let answeredCount = 0;
        let correctCount = 0;
        document.querySelectorAll(''.quiz-question'').forEach(q => {
            const ci = parseInt(q.dataset.correct);
            const opts = q.querySelectorAll(''.quiz-option'');
            const res = q.querySelector(''.quiz-result'');
            opts.forEach(o => {
                o.addEventListener(''click'', function() {
                    if (q.classList.contains(''answered'')) return;
                    q.classList.add(''answered'');
                    answeredCount++;
                    const si = parseInt(this.dataset.index);
                    if (si === ci) {
                        this.classList.add(''correct'');
                        res.textContent = ''✓ Chính xác!'';
                        res.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        opts[ci].classList.add(''correct'');
                        res.textContent = ''✗ Chưa đúng. Hãy xem lại case study.'';
                        res.className = ''quiz-result show incorrect'';
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
