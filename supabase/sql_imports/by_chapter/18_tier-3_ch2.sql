-- =====================================================
-- TIER-3 - Chương 2: Candlestick Patterns Elite
-- Course: course-tier3-trading-mastery
-- File 18/23
-- =====================================================

-- Create/Update Module
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  'module-tier-3-ch2',
  'course-tier3-trading-mastery',
  'Chương 2: Candlestick Patterns Elite',
  'Mẫu hình nến chuyên sâu',
  2,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Lesson 2.1: Doji và Spinning Top
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch2-l1',
  'module-tier-3-ch2',
  'course-tier3-trading-mastery',
  'Bài 2.1: Doji và Spinning Top',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 2.1: Doji và Spinning Top</title>
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
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; text-align: center; }
        .grid-item.purple { border-color: #8B5CF6; }
        .grid-item.gold { border-color: #FFBD59; }
        .grid-item.cyan { border-color: #00F0FF; }
        .candle-visual { font-size: 3rem; margin-bottom: 0.5rem; }
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
            .grid-2, .grid-3 { grid-template-columns: 1fr; gap: 0.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="lesson-header">
            <span class="lesson-badge">Tier 3 Elite</span>
            <h1 class="lesson-title">Bài 2.1: Doji và Spinning Top</h1>
            <p class="lesson-subtitle">Candlesticks báo hiệu sự do dự của thị trường</p>
        </div>

        <div class="content-section">
            <span class="section-label">📚 Giới thiệu</span>
            <h2 class="section-title">Candlestick Indecision Patterns</h2>
            <p>Doji và Spinning Top là những candlestick patterns phản ánh sự cân bằng giữa lực mua và lực bán. Chúng thường xuất hiện tại các điểm đảo chiều tiềm năng.</p>

            <div class="highlight-box">
                <p><strong>🎯 Ý nghĩa chung:</strong></p>
                <p style="margin-top: 0.5rem;">Cả Doji và Spinning Top đều cho thấy thị trường đang "do dự" - không bên nào (bulls hay bears) chiếm ưu thế rõ ràng. Đây là tín hiệu quan trọng cho potential reversal.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/8B5CF6?text=Doji+%26+Spinning+Top+-+Overview" alt="Doji & Spinning Top">
                <p class="image-caption">Hình 2.1.1: Tổng quan về Doji và Spinning Top</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🕯️ Doji</span>
            <h2 class="section-title">Các Loại Doji</h2>

            <div class="grid-3">
                <div class="grid-item purple">
                    <div class="candle-visual">➕</div>
                    <h4 style="color: #8B5CF6;">Standard Doji</h4>
                    <p style="font-size: 0.85rem; color: #a1a1aa;">Open = Close, bóng trên = bóng dưới</p>
                </div>
                <div class="grid-item gold">
                    <div class="candle-visual">✝️</div>
                    <h4 style="color: #FFBD59;">Dragonfly Doji</h4>
                    <p style="font-size: 0.85rem; color: #a1a1aa;">Bóng dưới dài, không có bóng trên</p>
                </div>
                <div class="grid-item cyan">
                    <div class="candle-visual">⬆️</div>
                    <h4 style="color: #00F0FF;">Gravestone Doji</h4>
                    <p style="font-size: 0.85rem; color: #a1a1aa;">Bóng trên dài, không có bóng dưới</p>
                </div>
            </div>

            <div class="highlight-box gold">
                <p><strong>📊 Đặc điểm Doji:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Body rất nhỏ hoặc không có (Open ≈ Close)</li>
                    <li>Có thể có bóng trên và/hoặc bóng dưới</li>
                    <li>Phản ánh sự cân bằng hoàn hảo giữa buyers và sellers</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/FFBD59?text=4+Types+of+Doji+-+Chart" alt="Doji Types">
                <p class="image-caption">Hình 2.1.2: 4 loại Doji phổ biến</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🔄 Spinning Top</span>
            <h2 class="section-title">Spinning Top Pattern</h2>

            <div class="grid-2">
                <div class="grid-item purple">
                    <div class="candle-visual">🟢</div>
                    <h4 style="color: #10B981;">Bullish Spinning Top</h4>
                    <p style="font-size: 0.9rem;">Body nhỏ màu xanh, bóng trên và dưới dài tương đương</p>
                </div>
                <div class="grid-item" style="border-color: #ef4444;">
                    <div class="candle-visual">🔴</div>
                    <h4 style="color: #ef4444;">Bearish Spinning Top</h4>
                    <p style="font-size: 0.9rem;">Body nhỏ màu đỏ, bóng trên và dưới dài tương đương</p>
                </div>
            </div>

            <div class="highlight-box cyan">
                <p><strong>📊 Đặc điểm Spinning Top:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Body nhỏ (nhưng có thể nhìn thấy được, không như Doji)</li>
                    <li>Bóng trên và bóng dưới dài (thường dài hơn body)</li>
                    <li>Màu của body không quan trọng bằng context</li>
                </ul>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚖️ So sánh</span>
            <h2 class="section-title">Doji vs Spinning Top</h2>

            <table class="comparison-table">
                <tr>
                    <th>Đặc Điểm</th>
                    <th>Doji</th>
                    <th>Spinning Top</th>
                </tr>
                <tr>
                    <td>Body size</td>
                    <td>Gần như không có</td>
                    <td>Nhỏ nhưng có thể thấy</td>
                </tr>
                <tr>
                    <td>Open vs Close</td>
                    <td>Gần bằng nhau</td>
                    <td>Khác nhau một chút</td>
                </tr>
                <tr>
                    <td>Shadows</td>
                    <td>Có thể có hoặc không</td>
                    <td>Thường dài và cân đối</td>
                </tr>
                <tr>
                    <td>Signal strength</td>
                    <td>Mạnh hơn</td>
                    <td>Yếu hơn một chút</td>
                </tr>
                <tr>
                    <td>Meaning</td>
                    <td>Cân bằng hoàn hảo</td>
                    <td>Cân bằng tương đối</td>
                </tr>
            </table>
        </div>

        <div class="content-section">
            <span class="section-label">📈 Context</span>
            <h2 class="section-title">Context Quan Trọng</h2>

            <div class="highlight-box">
                <p><strong>⚠️ Quan trọng:</strong> Doji và Spinning Top TỰ BẢN THÂN không phải là buy/sell signal. Chúng cần được đặt trong CONTEXT đúng.</p>
            </div>

            <div class="grid-2">
                <div class="grid-item" style="border-left: 3px solid #10B981;">
                    <h4 style="color: #10B981; margin-bottom: 0.5rem;">🟢 Bullish Context</h4>
                    <p style="font-size: 0.9rem;">Doji/Spinning Top xuất hiện sau downtrend + tại support zone = potential bullish reversal</p>
                </div>
                <div class="grid-item" style="border-left: 3px solid #ef4444;">
                    <h4 style="color: #ef4444; margin-bottom: 0.5rem;">🔴 Bearish Context</h4>
                    <p style="font-size: 0.9rem;">Doji/Spinning Top xuất hiện sau uptrend + tại resistance zone = potential bearish reversal</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/10B981?text=Doji+Context+-+Support+%26+Resistance" alt="Doji Context">
                <p class="image-caption">Hình 2.1.3: Doji trong context bullish và bearish</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🎯 Trading</span>
            <h2 class="section-title">Cách Trading Với Doji & Spinning Top</h2>

            <div class="highlight-box gold">
                <p><strong>📋 Quy tắc trading:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li><strong>Không trade ngay:</strong> Chờ nến xác nhận tiếp theo</li>
                    <li><strong>Bullish confirmation:</strong> Nến xanh đóng trên high của Doji</li>
                    <li><strong>Bearish confirmation:</strong> Nến đỏ đóng dưới low của Doji</li>
                    <li><strong>Stop Loss:</strong> Đặt ở phía đối diện của Doji</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/8B5CF6?text=Doji+Trading+Setup+-+Example" alt="Doji Trading">
                <p class="image-caption">Hình 2.1.4: Ví dụ setup trade với Doji</p>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Doji: Body gần như không có (Open ≈ Close)</li>
                <li>Spinning Top: Body nhỏ với bóng dài cân đối</li>
                <li>Cả hai đều báo hiệu sự do dự/indecision</li>
                <li>Context quan trọng: Sau trend + tại S/R zone</li>
                <li>Luôn chờ nến xác nhận trước khi vào lệnh</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Điểm khác biệt chính giữa Doji và Spinning Top?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Spinning Top không có bóng</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Doji gần như không có body, Spinning Top có body nhỏ</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Doji luôn bullish, Spinning Top luôn bearish</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Khi nào Doji có thể báo hiệu bearish reversal?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Khi xuất hiện trong downtrend</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Khi có màu đỏ</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Khi xuất hiện sau uptrend tại resistance zone</span>
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
    <title>Bài 2.1: Doji và Spinning Top</title>
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
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; text-align: center; }
        .grid-item.purple { border-color: #8B5CF6; }
        .grid-item.gold { border-color: #FFBD59; }
        .grid-item.cyan { border-color: #00F0FF; }
        .candle-visual { font-size: 3rem; margin-bottom: 0.5rem; }
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
            .grid-2, .grid-3 { grid-template-columns: 1fr; gap: 0.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="lesson-header">
            <span class="lesson-badge">Tier 3 Elite</span>
            <h1 class="lesson-title">Bài 2.1: Doji và Spinning Top</h1>
            <p class="lesson-subtitle">Candlesticks báo hiệu sự do dự của thị trường</p>
        </div>

        <div class="content-section">
            <span class="section-label">📚 Giới thiệu</span>
            <h2 class="section-title">Candlestick Indecision Patterns</h2>
            <p>Doji và Spinning Top là những candlestick patterns phản ánh sự cân bằng giữa lực mua và lực bán. Chúng thường xuất hiện tại các điểm đảo chiều tiềm năng.</p>

            <div class="highlight-box">
                <p><strong>🎯 Ý nghĩa chung:</strong></p>
                <p style="margin-top: 0.5rem;">Cả Doji và Spinning Top đều cho thấy thị trường đang "do dự" - không bên nào (bulls hay bears) chiếm ưu thế rõ ràng. Đây là tín hiệu quan trọng cho potential reversal.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/8B5CF6?text=Doji+%26+Spinning+Top+-+Overview" alt="Doji & Spinning Top">
                <p class="image-caption">Hình 2.1.1: Tổng quan về Doji và Spinning Top</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🕯️ Doji</span>
            <h2 class="section-title">Các Loại Doji</h2>

            <div class="grid-3">
                <div class="grid-item purple">
                    <div class="candle-visual">➕</div>
                    <h4 style="color: #8B5CF6;">Standard Doji</h4>
                    <p style="font-size: 0.85rem; color: #a1a1aa;">Open = Close, bóng trên = bóng dưới</p>
                </div>
                <div class="grid-item gold">
                    <div class="candle-visual">✝️</div>
                    <h4 style="color: #FFBD59;">Dragonfly Doji</h4>
                    <p style="font-size: 0.85rem; color: #a1a1aa;">Bóng dưới dài, không có bóng trên</p>
                </div>
                <div class="grid-item cyan">
                    <div class="candle-visual">⬆️</div>
                    <h4 style="color: #00F0FF;">Gravestone Doji</h4>
                    <p style="font-size: 0.85rem; color: #a1a1aa;">Bóng trên dài, không có bóng dưới</p>
                </div>
            </div>

            <div class="highlight-box gold">
                <p><strong>📊 Đặc điểm Doji:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Body rất nhỏ hoặc không có (Open ≈ Close)</li>
                    <li>Có thể có bóng trên và/hoặc bóng dưới</li>
                    <li>Phản ánh sự cân bằng hoàn hảo giữa buyers và sellers</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/FFBD59?text=4+Types+of+Doji+-+Chart" alt="Doji Types">
                <p class="image-caption">Hình 2.1.2: 4 loại Doji phổ biến</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🔄 Spinning Top</span>
            <h2 class="section-title">Spinning Top Pattern</h2>

            <div class="grid-2">
                <div class="grid-item purple">
                    <div class="candle-visual">🟢</div>
                    <h4 style="color: #10B981;">Bullish Spinning Top</h4>
                    <p style="font-size: 0.9rem;">Body nhỏ màu xanh, bóng trên và dưới dài tương đương</p>
                </div>
                <div class="grid-item" style="border-color: #ef4444;">
                    <div class="candle-visual">🔴</div>
                    <h4 style="color: #ef4444;">Bearish Spinning Top</h4>
                    <p style="font-size: 0.9rem;">Body nhỏ màu đỏ, bóng trên và dưới dài tương đương</p>
                </div>
            </div>

            <div class="highlight-box cyan">
                <p><strong>📊 Đặc điểm Spinning Top:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Body nhỏ (nhưng có thể nhìn thấy được, không như Doji)</li>
                    <li>Bóng trên và bóng dưới dài (thường dài hơn body)</li>
                    <li>Màu của body không quan trọng bằng context</li>
                </ul>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚖️ So sánh</span>
            <h2 class="section-title">Doji vs Spinning Top</h2>

            <table class="comparison-table">
                <tr>
                    <th>Đặc Điểm</th>
                    <th>Doji</th>
                    <th>Spinning Top</th>
                </tr>
                <tr>
                    <td>Body size</td>
                    <td>Gần như không có</td>
                    <td>Nhỏ nhưng có thể thấy</td>
                </tr>
                <tr>
                    <td>Open vs Close</td>
                    <td>Gần bằng nhau</td>
                    <td>Khác nhau một chút</td>
                </tr>
                <tr>
                    <td>Shadows</td>
                    <td>Có thể có hoặc không</td>
                    <td>Thường dài và cân đối</td>
                </tr>
                <tr>
                    <td>Signal strength</td>
                    <td>Mạnh hơn</td>
                    <td>Yếu hơn một chút</td>
                </tr>
                <tr>
                    <td>Meaning</td>
                    <td>Cân bằng hoàn hảo</td>
                    <td>Cân bằng tương đối</td>
                </tr>
            </table>
        </div>

        <div class="content-section">
            <span class="section-label">📈 Context</span>
            <h2 class="section-title">Context Quan Trọng</h2>

            <div class="highlight-box">
                <p><strong>⚠️ Quan trọng:</strong> Doji và Spinning Top TỰ BẢN THÂN không phải là buy/sell signal. Chúng cần được đặt trong CONTEXT đúng.</p>
            </div>

            <div class="grid-2">
                <div class="grid-item" style="border-left: 3px solid #10B981;">
                    <h4 style="color: #10B981; margin-bottom: 0.5rem;">🟢 Bullish Context</h4>
                    <p style="font-size: 0.9rem;">Doji/Spinning Top xuất hiện sau downtrend + tại support zone = potential bullish reversal</p>
                </div>
                <div class="grid-item" style="border-left: 3px solid #ef4444;">
                    <h4 style="color: #ef4444; margin-bottom: 0.5rem;">🔴 Bearish Context</h4>
                    <p style="font-size: 0.9rem;">Doji/Spinning Top xuất hiện sau uptrend + tại resistance zone = potential bearish reversal</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/10B981?text=Doji+Context+-+Support+%26+Resistance" alt="Doji Context">
                <p class="image-caption">Hình 2.1.3: Doji trong context bullish và bearish</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🎯 Trading</span>
            <h2 class="section-title">Cách Trading Với Doji & Spinning Top</h2>

            <div class="highlight-box gold">
                <p><strong>📋 Quy tắc trading:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li><strong>Không trade ngay:</strong> Chờ nến xác nhận tiếp theo</li>
                    <li><strong>Bullish confirmation:</strong> Nến xanh đóng trên high của Doji</li>
                    <li><strong>Bearish confirmation:</strong> Nến đỏ đóng dưới low của Doji</li>
                    <li><strong>Stop Loss:</strong> Đặt ở phía đối diện của Doji</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/8B5CF6?text=Doji+Trading+Setup+-+Example" alt="Doji Trading">
                <p class="image-caption">Hình 2.1.4: Ví dụ setup trade với Doji</p>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Doji: Body gần như không có (Open ≈ Close)</li>
                <li>Spinning Top: Body nhỏ với bóng dài cân đối</li>
                <li>Cả hai đều báo hiệu sự do dự/indecision</li>
                <li>Context quan trọng: Sau trend + tại S/R zone</li>
                <li>Luôn chờ nến xác nhận trước khi vào lệnh</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Điểm khác biệt chính giữa Doji và Spinning Top?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Spinning Top không có bóng</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Doji gần như không có body, Spinning Top có body nhỏ</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Doji luôn bullish, Spinning Top luôn bearish</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Khi nào Doji có thể báo hiệu bearish reversal?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Khi xuất hiện trong downtrend</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Khi có màu đỏ</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Khi xuất hiện sau uptrend tại resistance zone</span>
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

-- Lesson 2.2: Engulfing Patterns
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch2-l2',
  'module-tier-3-ch2',
  'course-tier3-trading-mastery',
  'Bài 2.2: Engulfing Patterns',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 2.2: Engulfing Patterns</title>
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
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; }
        .grid-item.green { border-color: #10B981; background: rgba(16, 185, 129, 0.05); }
        .grid-item.red { border-color: #ef4444; background: rgba(239, 68, 68, 0.05); }
        .candle-pair { display: flex; justify-content: center; align-items: flex-end; gap: 0.5rem; font-size: 2.5rem; margin-bottom: 0.75rem; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #0a0a0f); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .checklist { list-style: none; margin: 1rem 0; }
        .checklist li { padding: 0.5rem; margin: 0.25rem 0; background: rgba(255, 255, 255, 0.02); border-radius: 0.375rem; display: flex; align-items: center; gap: 0.5rem; }
        .checklist li::before { content: "✓"; color: #10B981; font-weight: bold; }
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
            <h1 class="lesson-title">Bài 2.2: Engulfing Patterns</h1>
            <p class="lesson-subtitle">Pattern đảo chiều mạnh nhất trong candlestick</p>
        </div>

        <div class="content-section">
            <span class="section-label">📚 Định nghĩa</span>
            <h2 class="section-title">Engulfing Pattern Là Gì?</h2>
            <p>Engulfing Pattern là một candlestick pattern gồm 2 nến, trong đó nến thứ 2 hoàn toàn "nuốt chửng" (engulf) nến thứ nhất. Đây là một trong những reversal patterns đáng tin cậy nhất.</p>

            <div class="highlight-box">
                <p><strong>🎯 Định nghĩa:</strong></p>
                <p style="margin-top: 0.5rem;">Body của nến thứ 2 phải hoàn toàn bao phủ (cover) body của nến thứ nhất. Nến 2 phải khác màu với nến 1.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/8B5CF6?text=Engulfing+Pattern+-+Definition" alt="Engulfing Pattern">
                <p class="image-caption">Hình 2.2.1: Cấu trúc Engulfing Pattern</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📈📉 Hai loại</span>
            <h2 class="section-title">Bullish vs Bearish Engulfing</h2>

            <div class="grid-2">
                <div class="grid-item green">
                    <div class="candle-pair">
                        <span style="font-size: 2rem;">🔴</span>
                        <span style="font-size: 3rem;">🟢</span>
                    </div>
                    <h4 style="color: #10B981; margin-bottom: 0.5rem;">Bullish Engulfing</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>Xuất hiện sau downtrend</li>
                        <li>Nến 1: Đỏ (bearish)</li>
                        <li>Nến 2: Xanh lớn, nuốt nến 1</li>
                        <li>Signal: Bullish reversal</li>
                    </ul>
                </div>
                <div class="grid-item red">
                    <div class="candle-pair">
                        <span style="font-size: 2rem;">🟢</span>
                        <span style="font-size: 3rem;">🔴</span>
                    </div>
                    <h4 style="color: #ef4444; margin-bottom: 0.5rem;">Bearish Engulfing</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>Xuất hiện sau uptrend</li>
                        <li>Nến 1: Xanh (bullish)</li>
                        <li>Nến 2: Đỏ lớn, nuốt nến 1</li>
                        <li>Signal: Bearish reversal</li>
                    </ul>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x400/1a0a2e/10B981?text=Bullish+vs+Bearish+Engulfing" alt="Engulfing Types">
                <p class="image-caption">Hình 2.2.2: So sánh 2 loại Engulfing</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">✅ Validation</span>
            <h2 class="section-title">Checklist Xác Nhận Engulfing</h2>

            <ul class="checklist">
                <li>Xuất hiện sau trend rõ ràng (up hoặc down)</li>
                <li>Body nến 2 hoàn toàn bao phủ body nến 1</li>
                <li>Nến 2 khác màu với nến 1</li>
                <li>Nến 2 có volume cao hơn nến 1</li>
                <li>Xuất hiện tại vùng S/R quan trọng (bonus)</li>
                <li>Confluence với các signals khác (bonus)</li>
            </ul>

            <div class="highlight-box gold">
                <p><strong>💡 Pro Tip:</strong> Engulfing pattern mạnh hơn khi nến 2 cũng engulf shadows của nến 1 (không chỉ body).</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🎯 Trading</span>
            <h2 class="section-title">Cách Trading Engulfing</h2>

            <div class="highlight-box green">
                <p><strong>🟢 Bullish Engulfing Setup:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li><strong>Entry:</strong> Mở cửa nến tiếp theo sau Engulfing</li>
                    <li><strong>Aggressive:</strong> Close của nến Engulfing</li>
                    <li><strong>Stop Loss:</strong> Dưới low của pattern</li>
                    <li><strong>Target:</strong> Resistance gần nhất hoặc R:R 1:2</li>
                </ul>
            </div>

            <div class="highlight-box red">
                <p><strong>🔴 Bearish Engulfing Setup:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li><strong>Entry:</strong> Mở cửa nến tiếp theo sau Engulfing</li>
                    <li><strong>Aggressive:</strong> Close của nến Engulfing</li>
                    <li><strong>Stop Loss:</strong> Trên high của pattern</li>
                    <li><strong>Target:</strong> Support gần nhất hoặc R:R 1:2</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/FFBD59?text=Engulfing+Trade+Setup+-+Entry%2C+SL%2C+TP" alt="Engulfing Trade">
                <p class="image-caption">Hình 2.2.3: Setup trade với Engulfing Pattern</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚠️ Cảnh báo</span>
            <h2 class="section-title">Những Điểm Cần Tránh</h2>

            <div class="highlight-box" style="border-color: rgba(239, 68, 68, 0.3);">
                <p><strong>❌ Engulfing yếu/không hợp lệ:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Không có trend trước đó (consolidation)</li>
                    <li>Nến 2 không hoàn toàn bao phủ body nến 1</li>
                    <li>Volume nến 2 thấp</li>
                    <li>Xuất hiện giữa trend (không phải ở S/R)</li>
                    <li>Cùng màu với nến trước</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x300/1a0a2e/ef4444?text=Invalid+Engulfing+-+Examples" alt="Invalid Engulfing">
                <p class="image-caption">Hình 2.2.4: Ví dụ Engulfing không hợp lệ</p>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Engulfing: Pattern 2 nến, nến 2 nuốt hoàn toàn nến 1</li>
                <li>Bullish Engulfing: Sau downtrend, nến xanh nuốt nến đỏ</li>
                <li>Bearish Engulfing: Sau uptrend, nến đỏ nuốt nến xanh</li>
                <li>Volume nến 2 cao hơn nến 1 = confirmation tốt</li>
                <li>SL đặt ở phía đối diện của pattern</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">1. Bullish Engulfing xuất hiện trong điều kiện nào?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Sau downtrend, nến xanh nuốt nến đỏ</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Sau uptrend, nến xanh nuốt nến đỏ</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Trong consolidation</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">2. Engulfing pattern mạnh hơn khi có thêm điều kiện nào?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Nến 2 có volume thấp hơn nến 1</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Nến 2 engulf cả shadows của nến 1</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Cả 2 nến cùng màu</span>
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
    <title>Bài 2.2: Engulfing Patterns</title>
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
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; }
        .grid-item.green { border-color: #10B981; background: rgba(16, 185, 129, 0.05); }
        .grid-item.red { border-color: #ef4444; background: rgba(239, 68, 68, 0.05); }
        .candle-pair { display: flex; justify-content: center; align-items: flex-end; gap: 0.5rem; font-size: 2.5rem; margin-bottom: 0.75rem; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #0a0a0f); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .checklist { list-style: none; margin: 1rem 0; }
        .checklist li { padding: 0.5rem; margin: 0.25rem 0; background: rgba(255, 255, 255, 0.02); border-radius: 0.375rem; display: flex; align-items: center; gap: 0.5rem; }
        .checklist li::before { content: "✓"; color: #10B981; font-weight: bold; }
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
            <h1 class="lesson-title">Bài 2.2: Engulfing Patterns</h1>
            <p class="lesson-subtitle">Pattern đảo chiều mạnh nhất trong candlestick</p>
        </div>

        <div class="content-section">
            <span class="section-label">📚 Định nghĩa</span>
            <h2 class="section-title">Engulfing Pattern Là Gì?</h2>
            <p>Engulfing Pattern là một candlestick pattern gồm 2 nến, trong đó nến thứ 2 hoàn toàn "nuốt chửng" (engulf) nến thứ nhất. Đây là một trong những reversal patterns đáng tin cậy nhất.</p>

            <div class="highlight-box">
                <p><strong>🎯 Định nghĩa:</strong></p>
                <p style="margin-top: 0.5rem;">Body của nến thứ 2 phải hoàn toàn bao phủ (cover) body của nến thứ nhất. Nến 2 phải khác màu với nến 1.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/8B5CF6?text=Engulfing+Pattern+-+Definition" alt="Engulfing Pattern">
                <p class="image-caption">Hình 2.2.1: Cấu trúc Engulfing Pattern</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📈📉 Hai loại</span>
            <h2 class="section-title">Bullish vs Bearish Engulfing</h2>

            <div class="grid-2">
                <div class="grid-item green">
                    <div class="candle-pair">
                        <span style="font-size: 2rem;">🔴</span>
                        <span style="font-size: 3rem;">🟢</span>
                    </div>
                    <h4 style="color: #10B981; margin-bottom: 0.5rem;">Bullish Engulfing</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>Xuất hiện sau downtrend</li>
                        <li>Nến 1: Đỏ (bearish)</li>
                        <li>Nến 2: Xanh lớn, nuốt nến 1</li>
                        <li>Signal: Bullish reversal</li>
                    </ul>
                </div>
                <div class="grid-item red">
                    <div class="candle-pair">
                        <span style="font-size: 2rem;">🟢</span>
                        <span style="font-size: 3rem;">🔴</span>
                    </div>
                    <h4 style="color: #ef4444; margin-bottom: 0.5rem;">Bearish Engulfing</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>Xuất hiện sau uptrend</li>
                        <li>Nến 1: Xanh (bullish)</li>
                        <li>Nến 2: Đỏ lớn, nuốt nến 1</li>
                        <li>Signal: Bearish reversal</li>
                    </ul>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x400/1a0a2e/10B981?text=Bullish+vs+Bearish+Engulfing" alt="Engulfing Types">
                <p class="image-caption">Hình 2.2.2: So sánh 2 loại Engulfing</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">✅ Validation</span>
            <h2 class="section-title">Checklist Xác Nhận Engulfing</h2>

            <ul class="checklist">
                <li>Xuất hiện sau trend rõ ràng (up hoặc down)</li>
                <li>Body nến 2 hoàn toàn bao phủ body nến 1</li>
                <li>Nến 2 khác màu với nến 1</li>
                <li>Nến 2 có volume cao hơn nến 1</li>
                <li>Xuất hiện tại vùng S/R quan trọng (bonus)</li>
                <li>Confluence với các signals khác (bonus)</li>
            </ul>

            <div class="highlight-box gold">
                <p><strong>💡 Pro Tip:</strong> Engulfing pattern mạnh hơn khi nến 2 cũng engulf shadows của nến 1 (không chỉ body).</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🎯 Trading</span>
            <h2 class="section-title">Cách Trading Engulfing</h2>

            <div class="highlight-box green">
                <p><strong>🟢 Bullish Engulfing Setup:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li><strong>Entry:</strong> Mở cửa nến tiếp theo sau Engulfing</li>
                    <li><strong>Aggressive:</strong> Close của nến Engulfing</li>
                    <li><strong>Stop Loss:</strong> Dưới low của pattern</li>
                    <li><strong>Target:</strong> Resistance gần nhất hoặc R:R 1:2</li>
                </ul>
            </div>

            <div class="highlight-box red">
                <p><strong>🔴 Bearish Engulfing Setup:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li><strong>Entry:</strong> Mở cửa nến tiếp theo sau Engulfing</li>
                    <li><strong>Aggressive:</strong> Close của nến Engulfing</li>
                    <li><strong>Stop Loss:</strong> Trên high của pattern</li>
                    <li><strong>Target:</strong> Support gần nhất hoặc R:R 1:2</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/FFBD59?text=Engulfing+Trade+Setup+-+Entry%2C+SL%2C+TP" alt="Engulfing Trade">
                <p class="image-caption">Hình 2.2.3: Setup trade với Engulfing Pattern</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚠️ Cảnh báo</span>
            <h2 class="section-title">Những Điểm Cần Tránh</h2>

            <div class="highlight-box" style="border-color: rgba(239, 68, 68, 0.3);">
                <p><strong>❌ Engulfing yếu/không hợp lệ:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Không có trend trước đó (consolidation)</li>
                    <li>Nến 2 không hoàn toàn bao phủ body nến 1</li>
                    <li>Volume nến 2 thấp</li>
                    <li>Xuất hiện giữa trend (không phải ở S/R)</li>
                    <li>Cùng màu với nến trước</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x300/1a0a2e/ef4444?text=Invalid+Engulfing+-+Examples" alt="Invalid Engulfing">
                <p class="image-caption">Hình 2.2.4: Ví dụ Engulfing không hợp lệ</p>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Engulfing: Pattern 2 nến, nến 2 nuốt hoàn toàn nến 1</li>
                <li>Bullish Engulfing: Sau downtrend, nến xanh nuốt nến đỏ</li>
                <li>Bearish Engulfing: Sau uptrend, nến đỏ nuốt nến xanh</li>
                <li>Volume nến 2 cao hơn nến 1 = confirmation tốt</li>
                <li>SL đặt ở phía đối diện của pattern</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">1. Bullish Engulfing xuất hiện trong điều kiện nào?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Sau downtrend, nến xanh nuốt nến đỏ</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Sau uptrend, nến xanh nuốt nến đỏ</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Trong consolidation</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">2. Engulfing pattern mạnh hơn khi có thêm điều kiện nào?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Nến 2 có volume thấp hơn nến 1</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Nến 2 engulf cả shadows của nến 1</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Cả 2 nến cùng màu</span>
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

-- Lesson 2.3: Hammer và Shooting Star
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch2-l3',
  'module-tier-3-ch2',
  'course-tier3-trading-mastery',
  'Bài 2.3: Hammer và Shooting Star',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 2.3: Hammer và Shooting Star</title>
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
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; text-align: center; }
        .grid-item.green { border-color: #10B981; background: rgba(16, 185, 129, 0.05); }
        .grid-item.red { border-color: #ef4444; background: rgba(239, 68, 68, 0.05); }
        .candle-visual { font-size: 4rem; margin-bottom: 0.5rem; }
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
            <h1 class="lesson-title">Bài 2.3: Hammer và Shooting Star</h1>
            <p class="lesson-subtitle">Reversal patterns single candle đáng tin cậy</p>
        </div>

        <div class="content-section">
            <span class="section-label">🔨 Hammer</span>
            <h2 class="section-title">Hammer Pattern - Bullish Reversal</h2>

            <div class="grid-item green" style="max-width: 300px; margin: 1rem auto;">
                <div class="candle-visual">🔨</div>
                <h4 style="color: #10B981;">Hammer</h4>
                <p style="font-size: 0.9rem; color: #a1a1aa;">Body nhỏ ở trên, bóng dưới dài</p>
            </div>

            <div class="highlight-box green">
                <p><strong>📊 Đặc điểm Hammer:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Xuất hiện sau downtrend</li>
                    <li>Body nhỏ ở phần trên của nến</li>
                    <li>Bóng dưới dài (ít nhất 2x body)</li>
                    <li>Không có hoặc có rất ít bóng trên</li>
                    <li>Màu body không quan trọng (xanh mạnh hơn)</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/0a2e1a/10B981?text=Hammer+Pattern+-+Chart+Example" alt="Hammer Pattern">
                <p class="image-caption">Hình 2.3.1: Hammer tại support zone</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⭐ Shooting Star</span>
            <h2 class="section-title">Shooting Star Pattern - Bearish Reversal</h2>

            <div class="grid-item red" style="max-width: 300px; margin: 1rem auto;">
                <div class="candle-visual">🌠</div>
                <h4 style="color: #ef4444;">Shooting Star</h4>
                <p style="font-size: 0.9rem; color: #a1a1aa;">Body nhỏ ở dưới, bóng trên dài</p>
            </div>

            <div class="highlight-box red">
                <p><strong>📊 Đặc điểm Shooting Star:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Xuất hiện sau uptrend</li>
                    <li>Body nhỏ ở phần dưới của nến</li>
                    <li>Bóng trên dài (ít nhất 2x body)</li>
                    <li>Không có hoặc có rất ít bóng dưới</li>
                    <li>Màu body không quan trọng (đỏ mạnh hơn)</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/2e0a0a/ef4444?text=Shooting+Star+-+Chart+Example" alt="Shooting Star">
                <p class="image-caption">Hình 2.3.2: Shooting Star tại resistance zone</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚖️ So sánh</span>
            <h2 class="section-title">Hammer vs Shooting Star</h2>

            <table class="comparison-table">
                <tr>
                    <th>Đặc Điểm</th>
                    <th style="color: #10B981;">Hammer</th>
                    <th style="color: #ef4444;">Shooting Star</th>
                </tr>
                <tr>
                    <td>Trend trước đó</td>
                    <td>Downtrend</td>
                    <td>Uptrend</td>
                </tr>
                <tr>
                    <td>Vị trí body</td>
                    <td>Phần trên của nến</td>
                    <td>Phần dưới của nến</td>
                </tr>
                <tr>
                    <td>Bóng dài</td>
                    <td>Bóng dưới</td>
                    <td>Bóng trên</td>
                </tr>
                <tr>
                    <td>Signal</td>
                    <td>Bullish reversal</td>
                    <td>Bearish reversal</td>
                </tr>
                <tr>
                    <td>Vị trí lý tưởng</td>
                    <td>Tại support zone</td>
                    <td>Tại resistance zone</td>
                </tr>
            </table>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x300/1a0a2e/8B5CF6?text=Hammer+vs+Shooting+Star+-+Comparison" alt="Comparison">
                <p class="image-caption">Hình 2.3.3: So sánh trực quan 2 patterns</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">👥 Biến thể</span>
            <h2 class="section-title">Inverted Hammer & Hanging Man</h2>

            <div class="grid-2">
                <div class="grid-item" style="border-color: #10B981;">
                    <h4 style="color: #10B981; margin-bottom: 0.5rem;">🔄 Inverted Hammer</h4>
                    <p style="font-size: 0.9rem;">Giống Shooting Star về hình dạng nhưng xuất hiện sau DOWNTREND → Bullish signal</p>
                </div>
                <div class="grid-item" style="border-color: #ef4444;">
                    <h4 style="color: #ef4444; margin-bottom: 0.5rem;">☠️ Hanging Man</h4>
                    <p style="font-size: 0.9rem;">Giống Hammer về hình dạng nhưng xuất hiện sau UPTREND → Bearish signal</p>
                </div>
            </div>

            <div class="highlight-box gold">
                <p><strong>💡 Key Point:</strong> Hình dạng giống nhau, nhưng CONTEXT (trend trước đó) quyết định ý nghĩa của pattern!</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🎯 Trading</span>
            <h2 class="section-title">Setup Trade</h2>

            <div class="highlight-box">
                <p><strong>📋 Quy tắc trading:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li><strong>Hammer Entry:</strong> Trên high của Hammer, sau nến xanh xác nhận</li>
                    <li><strong>Hammer SL:</strong> Dưới low của Hammer</li>
                    <li><strong>Shooting Star Entry:</strong> Dưới low của Shooting Star, sau nến đỏ xác nhận</li>
                    <li><strong>Shooting Star SL:</strong> Trên high của Shooting Star</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/FFBD59?text=Hammer+%26+Shooting+Star+-+Trade+Setup" alt="Trade Setup">
                <p class="image-caption">Hình 2.3.4: Trade setup với Entry, SL, TP</p>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Hammer: Body trên, bóng dưới dài, sau downtrend = Bullish</li>
                <li>Shooting Star: Body dưới, bóng trên dài, sau uptrend = Bearish</li>
                <li>Bóng dài ít nhất 2x body size</li>
                <li>Context (trend + S/R zone) quan trọng hơn màu sắc</li>
                <li>Chờ nến xác nhận trước khi vào lệnh</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Hammer pattern có đặc điểm gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Body lớn, không có bóng</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Body nhỏ ở trên, bóng dưới dài (2x body)</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Body nhỏ ở dưới, bóng trên dài</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">2. Hanging Man khác gì với Hammer?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Hình dạng giống nhau, nhưng xuất hiện sau uptrend (bearish)</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Hoàn toàn khác nhau về hình dạng</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Hanging Man có bóng trên dài</span>
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
    <title>Bài 2.3: Hammer và Shooting Star</title>
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
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; text-align: center; }
        .grid-item.green { border-color: #10B981; background: rgba(16, 185, 129, 0.05); }
        .grid-item.red { border-color: #ef4444; background: rgba(239, 68, 68, 0.05); }
        .candle-visual { font-size: 4rem; margin-bottom: 0.5rem; }
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
            <h1 class="lesson-title">Bài 2.3: Hammer và Shooting Star</h1>
            <p class="lesson-subtitle">Reversal patterns single candle đáng tin cậy</p>
        </div>

        <div class="content-section">
            <span class="section-label">🔨 Hammer</span>
            <h2 class="section-title">Hammer Pattern - Bullish Reversal</h2>

            <div class="grid-item green" style="max-width: 300px; margin: 1rem auto;">
                <div class="candle-visual">🔨</div>
                <h4 style="color: #10B981;">Hammer</h4>
                <p style="font-size: 0.9rem; color: #a1a1aa;">Body nhỏ ở trên, bóng dưới dài</p>
            </div>

            <div class="highlight-box green">
                <p><strong>📊 Đặc điểm Hammer:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Xuất hiện sau downtrend</li>
                    <li>Body nhỏ ở phần trên của nến</li>
                    <li>Bóng dưới dài (ít nhất 2x body)</li>
                    <li>Không có hoặc có rất ít bóng trên</li>
                    <li>Màu body không quan trọng (xanh mạnh hơn)</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/0a2e1a/10B981?text=Hammer+Pattern+-+Chart+Example" alt="Hammer Pattern">
                <p class="image-caption">Hình 2.3.1: Hammer tại support zone</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⭐ Shooting Star</span>
            <h2 class="section-title">Shooting Star Pattern - Bearish Reversal</h2>

            <div class="grid-item red" style="max-width: 300px; margin: 1rem auto;">
                <div class="candle-visual">🌠</div>
                <h4 style="color: #ef4444;">Shooting Star</h4>
                <p style="font-size: 0.9rem; color: #a1a1aa;">Body nhỏ ở dưới, bóng trên dài</p>
            </div>

            <div class="highlight-box red">
                <p><strong>📊 Đặc điểm Shooting Star:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Xuất hiện sau uptrend</li>
                    <li>Body nhỏ ở phần dưới của nến</li>
                    <li>Bóng trên dài (ít nhất 2x body)</li>
                    <li>Không có hoặc có rất ít bóng dưới</li>
                    <li>Màu body không quan trọng (đỏ mạnh hơn)</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/2e0a0a/ef4444?text=Shooting+Star+-+Chart+Example" alt="Shooting Star">
                <p class="image-caption">Hình 2.3.2: Shooting Star tại resistance zone</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚖️ So sánh</span>
            <h2 class="section-title">Hammer vs Shooting Star</h2>

            <table class="comparison-table">
                <tr>
                    <th>Đặc Điểm</th>
                    <th style="color: #10B981;">Hammer</th>
                    <th style="color: #ef4444;">Shooting Star</th>
                </tr>
                <tr>
                    <td>Trend trước đó</td>
                    <td>Downtrend</td>
                    <td>Uptrend</td>
                </tr>
                <tr>
                    <td>Vị trí body</td>
                    <td>Phần trên của nến</td>
                    <td>Phần dưới của nến</td>
                </tr>
                <tr>
                    <td>Bóng dài</td>
                    <td>Bóng dưới</td>
                    <td>Bóng trên</td>
                </tr>
                <tr>
                    <td>Signal</td>
                    <td>Bullish reversal</td>
                    <td>Bearish reversal</td>
                </tr>
                <tr>
                    <td>Vị trí lý tưởng</td>
                    <td>Tại support zone</td>
                    <td>Tại resistance zone</td>
                </tr>
            </table>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x300/1a0a2e/8B5CF6?text=Hammer+vs+Shooting+Star+-+Comparison" alt="Comparison">
                <p class="image-caption">Hình 2.3.3: So sánh trực quan 2 patterns</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">👥 Biến thể</span>
            <h2 class="section-title">Inverted Hammer & Hanging Man</h2>

            <div class="grid-2">
                <div class="grid-item" style="border-color: #10B981;">
                    <h4 style="color: #10B981; margin-bottom: 0.5rem;">🔄 Inverted Hammer</h4>
                    <p style="font-size: 0.9rem;">Giống Shooting Star về hình dạng nhưng xuất hiện sau DOWNTREND → Bullish signal</p>
                </div>
                <div class="grid-item" style="border-color: #ef4444;">
                    <h4 style="color: #ef4444; margin-bottom: 0.5rem;">☠️ Hanging Man</h4>
                    <p style="font-size: 0.9rem;">Giống Hammer về hình dạng nhưng xuất hiện sau UPTREND → Bearish signal</p>
                </div>
            </div>

            <div class="highlight-box gold">
                <p><strong>💡 Key Point:</strong> Hình dạng giống nhau, nhưng CONTEXT (trend trước đó) quyết định ý nghĩa của pattern!</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🎯 Trading</span>
            <h2 class="section-title">Setup Trade</h2>

            <div class="highlight-box">
                <p><strong>📋 Quy tắc trading:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li><strong>Hammer Entry:</strong> Trên high của Hammer, sau nến xanh xác nhận</li>
                    <li><strong>Hammer SL:</strong> Dưới low của Hammer</li>
                    <li><strong>Shooting Star Entry:</strong> Dưới low của Shooting Star, sau nến đỏ xác nhận</li>
                    <li><strong>Shooting Star SL:</strong> Trên high của Shooting Star</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/FFBD59?text=Hammer+%26+Shooting+Star+-+Trade+Setup" alt="Trade Setup">
                <p class="image-caption">Hình 2.3.4: Trade setup với Entry, SL, TP</p>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Hammer: Body trên, bóng dưới dài, sau downtrend = Bullish</li>
                <li>Shooting Star: Body dưới, bóng trên dài, sau uptrend = Bearish</li>
                <li>Bóng dài ít nhất 2x body size</li>
                <li>Context (trend + S/R zone) quan trọng hơn màu sắc</li>
                <li>Chờ nến xác nhận trước khi vào lệnh</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Hammer pattern có đặc điểm gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Body lớn, không có bóng</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Body nhỏ ở trên, bóng dưới dài (2x body)</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Body nhỏ ở dưới, bóng trên dài</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">2. Hanging Man khác gì với Hammer?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Hình dạng giống nhau, nhưng xuất hiện sau uptrend (bearish)</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Hoàn toàn khác nhau về hình dạng</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Hanging Man có bóng trên dài</span>
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

-- Lesson 2.4: Three Methods Pattern
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch2-l4',
  'module-tier-3-ch2',
  'course-tier3-trading-mastery',
  'Bài 2.4: Three Methods Pattern',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 2.4: Three Methods Pattern</title>
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
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; }
        .grid-item.green { border-color: #10B981; background: rgba(16, 185, 129, 0.05); }
        .grid-item.red { border-color: #ef4444; background: rgba(239, 68, 68, 0.05); }
        .candle-sequence { display: flex; justify-content: center; align-items: flex-end; gap: 0.25rem; font-size: 1.5rem; margin: 1rem 0; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 0.5rem; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #0a0a0f); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .step-list { list-style: none; counter-reset: step; }
        .step-list li { padding: 0.75rem 0 0.75rem 2.5rem; position: relative; border-left: 2px solid #27272a; margin-left: 1rem; }
        .step-list li::before { counter-increment: step; content: counter(step); position: absolute; left: -1rem; width: 2rem; height: 2rem; background: #8B5CF6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; }
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
            <h1 class="lesson-title">Bài 2.4: Three Methods Pattern</h1>
            <p class="lesson-subtitle">Continuation pattern 5 nến mạnh mẽ</p>
        </div>

        <div class="content-section">
            <span class="section-label">📚 Định nghĩa</span>
            <h2 class="section-title">Three Methods Là Gì?</h2>
            <p>Three Methods là một continuation pattern gồm 5 nến, cho thấy trend đang "nghỉ ngơi" trước khi tiếp tục. Có 2 loại: Rising Three Methods (bullish) và Falling Three Methods (bearish).</p>

            <div class="highlight-box">
                <p><strong>🎯 Đặc điểm chính:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Pattern gồm 5 nến (1 lớn + 3 nhỏ + 1 lớn)</li>
                    <li>3 nến giữa đi ngược hướng trend nhưng không vượt qua nến 1</li>
                    <li>Nến 5 xác nhận sự tiếp tục của trend</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/8B5CF6?text=Three+Methods+-+Overview" alt="Three Methods">
                <p class="image-caption">Hình 2.4.1: Cấu trúc Three Methods Pattern</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📈 Rising</span>
            <h2 class="section-title">Rising Three Methods - Bullish Continuation</h2>

            <div class="candle-sequence">
                <span style="font-size: 3rem; color: #10B981;">▌</span>
                <span style="font-size: 1.5rem; color: #ef4444;">▌</span>
                <span style="font-size: 1.5rem; color: #ef4444;">▌</span>
                <span style="font-size: 1.5rem; color: #ef4444;">▌</span>
                <span style="font-size: 3rem; color: #10B981;">▌</span>
            </div>

            <div class="highlight-box green">
                <p><strong>🟢 Cấu trúc Rising Three Methods:</strong></p>
                <ol style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Nến 1: Nến xanh dài trong uptrend</li>
                    <li>Nến 2-4: 3 nến đỏ nhỏ, nằm trong range của nến 1</li>
                    <li>Nến 5: Nến xanh dài, close trên high của nến 1</li>
                </ol>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/0a2e1a/10B981?text=Rising+Three+Methods+-+Example" alt="Rising Three Methods">
                <p class="image-caption">Hình 2.4.2: Rising Three Methods trên chart</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📉 Falling</span>
            <h2 class="section-title">Falling Three Methods - Bearish Continuation</h2>

            <div class="candle-sequence">
                <span style="font-size: 3rem; color: #ef4444;">▌</span>
                <span style="font-size: 1.5rem; color: #10B981;">▌</span>
                <span style="font-size: 1.5rem; color: #10B981;">▌</span>
                <span style="font-size: 1.5rem; color: #10B981;">▌</span>
                <span style="font-size: 3rem; color: #ef4444;">▌</span>
            </div>

            <div class="highlight-box red">
                <p><strong>🔴 Cấu trúc Falling Three Methods:</strong></p>
                <ol style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Nến 1: Nến đỏ dài trong downtrend</li>
                    <li>Nến 2-4: 3 nến xanh nhỏ, nằm trong range của nến 1</li>
                    <li>Nến 5: Nến đỏ dài, close dưới low của nến 1</li>
                </ol>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/2e0a0a/ef4444?text=Falling+Three+Methods+-+Example" alt="Falling Three Methods">
                <p class="image-caption">Hình 2.4.3: Falling Three Methods trên chart</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🧠 Tâm lý</span>
            <h2 class="section-title">Tâm Lý Đằng Sau Pattern</h2>

            <ul class="step-list">
                <li><strong>Nến 1:</strong> Trend mạnh, bên chiếm ưu thế đẩy giá mạnh</li>
                <li><strong>Nến 2-4:</strong> Bên đối lập cố gắng đảo chiều nhưng yếu</li>
                <li><strong>Nến 5:</strong> Bên chiếm ưu thế quay lại, tiếp tục đẩy giá</li>
            </ul>

            <div class="highlight-box gold">
                <p><strong>💡 Key Insight:</strong> 3 nến giữa là "profit-taking" hoặc "pullback" tự nhiên, không phải reversal thực sự. Nến 5 xác nhận trend vẫn intact.</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🎯 Trading</span>
            <h2 class="section-title">Cách Trading Three Methods</h2>

            <div class="grid-2">
                <div class="grid-item green">
                    <h4 style="color: #10B981; margin-bottom: 0.5rem;">Rising Setup</h4>
                    <p style="font-size: 0.9rem;"><strong>Entry:</strong> Close nến 5 hoặc mở cửa nến 6</p>
                    <p style="font-size: 0.9rem;"><strong>SL:</strong> Dưới low của 3 nến giữa</p>
                    <p style="font-size: 0.9rem;"><strong>TP:</strong> R:R 1:2 hoặc resistance</p>
                </div>
                <div class="grid-item red">
                    <h4 style="color: #ef4444; margin-bottom: 0.5rem;">Falling Setup</h4>
                    <p style="font-size: 0.9rem;"><strong>Entry:</strong> Close nến 5 hoặc mở cửa nến 6</p>
                    <p style="font-size: 0.9rem;"><strong>SL:</strong> Trên high của 3 nến giữa</p>
                    <p style="font-size: 0.9rem;"><strong>TP:</strong> R:R 1:2 hoặc support</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/FFBD59?text=Three+Methods+-+Trade+Setup" alt="Trade Setup">
                <p class="image-caption">Hình 2.4.4: Entry, SL, TP cho Three Methods</p>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Three Methods: Pattern 5 nến, continuation</li>
                <li>Rising: Nến xanh lớn + 3 đỏ nhỏ + nến xanh lớn</li>
                <li>Falling: Nến đỏ lớn + 3 xanh nhỏ + nến đỏ lớn</li>
                <li>3 nến giữa phải nằm trong range của nến 1</li>
                <li>Nến 5 phải close vượt qua extreme của nến 1</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">1. Rising Three Methods gồm những nến gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>5 nến xanh liên tiếp</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>3 nến xanh + 2 nến đỏ</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Nến xanh lớn + 3 nến đỏ nhỏ + nến xanh lớn</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">2. Điều kiện quan trọng của 3 nến giữa là gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Phải vượt qua range của nến 1</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Nằm trong range của nến 1</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Có volume cao hơn nến 1</span>
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
    <title>Bài 2.4: Three Methods Pattern</title>
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
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; }
        .grid-item.green { border-color: #10B981; background: rgba(16, 185, 129, 0.05); }
        .grid-item.red { border-color: #ef4444; background: rgba(239, 68, 68, 0.05); }
        .candle-sequence { display: flex; justify-content: center; align-items: flex-end; gap: 0.25rem; font-size: 1.5rem; margin: 1rem 0; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 0.5rem; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #0a0a0f); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .step-list { list-style: none; counter-reset: step; }
        .step-list li { padding: 0.75rem 0 0.75rem 2.5rem; position: relative; border-left: 2px solid #27272a; margin-left: 1rem; }
        .step-list li::before { counter-increment: step; content: counter(step); position: absolute; left: -1rem; width: 2rem; height: 2rem; background: #8B5CF6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; }
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
            <h1 class="lesson-title">Bài 2.4: Three Methods Pattern</h1>
            <p class="lesson-subtitle">Continuation pattern 5 nến mạnh mẽ</p>
        </div>

        <div class="content-section">
            <span class="section-label">📚 Định nghĩa</span>
            <h2 class="section-title">Three Methods Là Gì?</h2>
            <p>Three Methods là một continuation pattern gồm 5 nến, cho thấy trend đang "nghỉ ngơi" trước khi tiếp tục. Có 2 loại: Rising Three Methods (bullish) và Falling Three Methods (bearish).</p>

            <div class="highlight-box">
                <p><strong>🎯 Đặc điểm chính:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Pattern gồm 5 nến (1 lớn + 3 nhỏ + 1 lớn)</li>
                    <li>3 nến giữa đi ngược hướng trend nhưng không vượt qua nến 1</li>
                    <li>Nến 5 xác nhận sự tiếp tục của trend</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/8B5CF6?text=Three+Methods+-+Overview" alt="Three Methods">
                <p class="image-caption">Hình 2.4.1: Cấu trúc Three Methods Pattern</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📈 Rising</span>
            <h2 class="section-title">Rising Three Methods - Bullish Continuation</h2>

            <div class="candle-sequence">
                <span style="font-size: 3rem; color: #10B981;">▌</span>
                <span style="font-size: 1.5rem; color: #ef4444;">▌</span>
                <span style="font-size: 1.5rem; color: #ef4444;">▌</span>
                <span style="font-size: 1.5rem; color: #ef4444;">▌</span>
                <span style="font-size: 3rem; color: #10B981;">▌</span>
            </div>

            <div class="highlight-box green">
                <p><strong>🟢 Cấu trúc Rising Three Methods:</strong></p>
                <ol style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Nến 1: Nến xanh dài trong uptrend</li>
                    <li>Nến 2-4: 3 nến đỏ nhỏ, nằm trong range của nến 1</li>
                    <li>Nến 5: Nến xanh dài, close trên high của nến 1</li>
                </ol>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/0a2e1a/10B981?text=Rising+Three+Methods+-+Example" alt="Rising Three Methods">
                <p class="image-caption">Hình 2.4.2: Rising Three Methods trên chart</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📉 Falling</span>
            <h2 class="section-title">Falling Three Methods - Bearish Continuation</h2>

            <div class="candle-sequence">
                <span style="font-size: 3rem; color: #ef4444;">▌</span>
                <span style="font-size: 1.5rem; color: #10B981;">▌</span>
                <span style="font-size: 1.5rem; color: #10B981;">▌</span>
                <span style="font-size: 1.5rem; color: #10B981;">▌</span>
                <span style="font-size: 3rem; color: #ef4444;">▌</span>
            </div>

            <div class="highlight-box red">
                <p><strong>🔴 Cấu trúc Falling Three Methods:</strong></p>
                <ol style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Nến 1: Nến đỏ dài trong downtrend</li>
                    <li>Nến 2-4: 3 nến xanh nhỏ, nằm trong range của nến 1</li>
                    <li>Nến 5: Nến đỏ dài, close dưới low của nến 1</li>
                </ol>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/2e0a0a/ef4444?text=Falling+Three+Methods+-+Example" alt="Falling Three Methods">
                <p class="image-caption">Hình 2.4.3: Falling Three Methods trên chart</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🧠 Tâm lý</span>
            <h2 class="section-title">Tâm Lý Đằng Sau Pattern</h2>

            <ul class="step-list">
                <li><strong>Nến 1:</strong> Trend mạnh, bên chiếm ưu thế đẩy giá mạnh</li>
                <li><strong>Nến 2-4:</strong> Bên đối lập cố gắng đảo chiều nhưng yếu</li>
                <li><strong>Nến 5:</strong> Bên chiếm ưu thế quay lại, tiếp tục đẩy giá</li>
            </ul>

            <div class="highlight-box gold">
                <p><strong>💡 Key Insight:</strong> 3 nến giữa là "profit-taking" hoặc "pullback" tự nhiên, không phải reversal thực sự. Nến 5 xác nhận trend vẫn intact.</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🎯 Trading</span>
            <h2 class="section-title">Cách Trading Three Methods</h2>

            <div class="grid-2">
                <div class="grid-item green">
                    <h4 style="color: #10B981; margin-bottom: 0.5rem;">Rising Setup</h4>
                    <p style="font-size: 0.9rem;"><strong>Entry:</strong> Close nến 5 hoặc mở cửa nến 6</p>
                    <p style="font-size: 0.9rem;"><strong>SL:</strong> Dưới low của 3 nến giữa</p>
                    <p style="font-size: 0.9rem;"><strong>TP:</strong> R:R 1:2 hoặc resistance</p>
                </div>
                <div class="grid-item red">
                    <h4 style="color: #ef4444; margin-bottom: 0.5rem;">Falling Setup</h4>
                    <p style="font-size: 0.9rem;"><strong>Entry:</strong> Close nến 5 hoặc mở cửa nến 6</p>
                    <p style="font-size: 0.9rem;"><strong>SL:</strong> Trên high của 3 nến giữa</p>
                    <p style="font-size: 0.9rem;"><strong>TP:</strong> R:R 1:2 hoặc support</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/FFBD59?text=Three+Methods+-+Trade+Setup" alt="Trade Setup">
                <p class="image-caption">Hình 2.4.4: Entry, SL, TP cho Three Methods</p>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Three Methods: Pattern 5 nến, continuation</li>
                <li>Rising: Nến xanh lớn + 3 đỏ nhỏ + nến xanh lớn</li>
                <li>Falling: Nến đỏ lớn + 3 xanh nhỏ + nến đỏ lớn</li>
                <li>3 nến giữa phải nằm trong range của nến 1</li>
                <li>Nến 5 phải close vượt qua extreme của nến 1</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">1. Rising Three Methods gồm những nến gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>5 nến xanh liên tiếp</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>3 nến xanh + 2 nến đỏ</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Nến xanh lớn + 3 nến đỏ nhỏ + nến xanh lớn</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">2. Điều kiện quan trọng của 3 nến giữa là gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Phải vượt qua range của nến 1</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Nằm trong range của nến 1</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Có volume cao hơn nến 1</span>
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

-- Lesson 2.5: Candlesticks Làm Xác Nhận
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch2-l5',
  'module-tier-3-ch2',
  'course-tier3-trading-mastery',
  'Bài 2.5: Candlesticks Làm Xác Nhận',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 2.5: Candlesticks Làm Xác Nhận</title>
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
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.05)); border-color: rgba(255, 189, 89, 0.3); }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; }
        .grid-item.purple { border-left: 3px solid #8B5CF6; }
        .grid-item.gold { border-left: 3px solid #FFBD59; }
        .grid-item.green { border-left: 3px solid #10B981; }
        .confluence-example { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .confluence-example h4 { color: #10B981; margin-bottom: 0.5rem; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #0a0a0f); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .checklist { list-style: none; margin: 1rem 0; }
        .checklist li { padding: 0.5rem; margin: 0.25rem 0; background: rgba(255, 255, 255, 0.02); border-radius: 0.375rem; display: flex; align-items: center; gap: 0.5rem; }
        .checklist li::before { content: "✓"; color: #10B981; font-weight: bold; }
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
            <h1 class="lesson-title">Bài 2.5: Candlesticks Làm Xác Nhận</h1>
            <p class="lesson-subtitle">Sử dụng candlesticks để confirm các setup khác</p>
        </div>

        <div class="content-section">
            <span class="section-label">📚 Khái niệm</span>
            <h2 class="section-title">Candlesticks Làm Confluence</h2>
            <p>Trong trading chuyên nghiệp, candlestick patterns không được sử dụng đơn lẻ. Thay vào đó, chúng được dùng như confirmation (xác nhận) cho các setup khác như zones, patterns, hoặc indicators.</p>

            <div class="highlight-box">
                <p><strong>🎯 Nguyên tắc Confluence:</strong></p>
                <p style="margin-top: 0.5rem;">Candlestick pattern + Zone/Pattern + Volume = High-probability setup</p>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/8B5CF6?text=Candlestick+Confluence+-+Concept" alt="Candlestick Confluence">
                <p class="image-caption">Hình 2.5.1: Candlestick như lớp xác nhận cuối cùng</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">✅ Với Zones</span>
            <h2 class="section-title">Candlesticks Xác Nhận Zones</h2>

            <div class="confluence-example">
                <h4>Ví dụ: HFZ + Bearish Engulfing</h4>
                <p>Giá đến HFZ (vùng bán) → Xuất hiện Bearish Engulfing → Xác nhận sellers đang vào cuộc → Short với confidence cao hơn</p>
            </div>

            <div class="confluence-example">
                <h4>Ví dụ: LFZ + Hammer</h4>
                <p>Giá đến LFZ (vùng mua) → Xuất hiện Hammer → Xác nhận buyers đang reject giá thấp → Long với confidence cao hơn</p>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x400/1a0a2e/10B981?text=Zone+%2B+Candlestick+-+Example" alt="Zone + Candlestick">
                <p class="image-caption">Hình 2.5.2: Zone + Candlestick confirmation</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Với Patterns</span>
            <h2 class="section-title">Candlesticks Xác Nhận Chart Patterns</h2>

            <div class="grid-2">
                <div class="grid-item green">
                    <h4 style="color: #10B981; margin-bottom: 0.5rem;">Flag + Bullish Candle</h4>
                    <p style="font-size: 0.9rem;">Breakout khỏi Flag với nến Marubozu xanh mạnh → Confirmation tốt</p>
                </div>
                <div class="grid-item" style="border-left: 3px solid #ef4444;">
                    <h4 style="color: #ef4444; margin-bottom: 0.5rem;">Double Top + Bearish Engulfing</h4>
                    <p style="font-size: 0.9rem;">Đỉnh thứ 2 của Double Top có Bearish Engulfing → Strong sell signal</p>
                </div>
            </div>

            <div class="highlight-box gold">
                <p><strong>💡 Key Insight:</strong> Candlestick patterns là "final trigger" - chờ pattern này xuất hiện trước khi pull trigger vào lệnh.</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📋 Checklist</span>
            <h2 class="section-title">Confirmation Checklist</h2>

            <ul class="checklist">
                <li>Có zone (HFZ/LFZ) hoặc S/R level quan trọng?</li>
                <li>Có chart pattern hỗ trợ (Flag, Triangle, etc.)?</li>
                <li>Candlestick pattern xuất hiện tại vị trí đó?</li>
                <li>Volume hỗ trợ candlestick pattern?</li>
                <li>Trend HTF cùng hướng với signal?</li>
            </ul>

            <div class="highlight-box">
                <p><strong>📊 Scoring System:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>5/5 confirmations = A+ setup (full size)</li>
                    <li>4/5 confirmations = A setup (normal size)</li>
                    <li>3/5 confirmations = B setup (reduced size)</li>
                    <li>&lt;3 confirmations = Skip trade</li>
                </ul>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🎯 Best Practices</span>
            <h2 class="section-title">Candlesticks Mạnh Nhất Để Confirm</h2>

            <div class="grid-2">
                <div class="grid-item purple">
                    <h4 style="color: #8B5CF6; margin-bottom: 0.5rem;">🟢 Bullish Confirmation</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>Bullish Engulfing</li>
                        <li>Hammer</li>
                        <li>Morning Star</li>
                        <li>Three White Soldiers</li>
                    </ul>
                </div>
                <div class="grid-item gold">
                    <h4 style="color: #FFBD59; margin-bottom: 0.5rem;">🔴 Bearish Confirmation</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>Bearish Engulfing</li>
                        <li>Shooting Star</li>
                        <li>Evening Star</li>
                        <li>Three Black Crows</li>
                    </ul>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/FFBD59?text=Top+Confirmation+Candles" alt="Top Confirmation">
                <p class="image-caption">Hình 2.5.3: Top candlesticks để confirm entry</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚠️ Cảnh báo</span>
            <h2 class="section-title">Khi KHÔNG Nên Sử Dụng</h2>

            <div class="highlight-box" style="border-color: rgba(239, 68, 68, 0.3);">
                <p><strong>❌ Tránh dùng candlesticks confirmation khi:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Không có zone hoặc pattern hỗ trợ</li>
                    <li>Candlestick xuất hiện giữa "no man''s land"</li>
                    <li>Volume quá thấp</li>
                    <li>Ngược hướng trend lớn</li>
                    <li>Trong thời gian news quan trọng</li>
                </ul>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Candlesticks là lớp confirmation cuối cùng, không phải signal đơn lẻ</li>
                <li>Kết hợp: Zone + Pattern + Candlestick = High-probability setup</li>
                <li>Engulfing và Hammer/Shooting Star là confirmations mạnh nhất</li>
                <li>Sử dụng scoring system để đánh giá chất lượng setup</li>
                <li>Không trade candlestick đơn lẻ mà không có context</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Candlesticks nên được sử dụng như thế nào trong trading chuyên nghiệp?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Như signal đơn lẻ để vào lệnh</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Như confirmation cho zones và patterns khác</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Chỉ dùng trên timeframe 1 phút</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Setup 3/5 confirmations nên được xử lý như thế nào?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Trade với full size</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Skip trade hoàn toàn</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Trade với reduced size (B setup)</span>
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
    <title>Bài 2.5: Candlesticks Làm Xác Nhận</title>
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
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.05)); border-color: rgba(255, 189, 89, 0.3); }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; }
        .grid-item.purple { border-left: 3px solid #8B5CF6; }
        .grid-item.gold { border-left: 3px solid #FFBD59; }
        .grid-item.green { border-left: 3px solid #10B981; }
        .confluence-example { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .confluence-example h4 { color: #10B981; margin-bottom: 0.5rem; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #0a0a0f); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .checklist { list-style: none; margin: 1rem 0; }
        .checklist li { padding: 0.5rem; margin: 0.25rem 0; background: rgba(255, 255, 255, 0.02); border-radius: 0.375rem; display: flex; align-items: center; gap: 0.5rem; }
        .checklist li::before { content: "✓"; color: #10B981; font-weight: bold; }
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
            <h1 class="lesson-title">Bài 2.5: Candlesticks Làm Xác Nhận</h1>
            <p class="lesson-subtitle">Sử dụng candlesticks để confirm các setup khác</p>
        </div>

        <div class="content-section">
            <span class="section-label">📚 Khái niệm</span>
            <h2 class="section-title">Candlesticks Làm Confluence</h2>
            <p>Trong trading chuyên nghiệp, candlestick patterns không được sử dụng đơn lẻ. Thay vào đó, chúng được dùng như confirmation (xác nhận) cho các setup khác như zones, patterns, hoặc indicators.</p>

            <div class="highlight-box">
                <p><strong>🎯 Nguyên tắc Confluence:</strong></p>
                <p style="margin-top: 0.5rem;">Candlestick pattern + Zone/Pattern + Volume = High-probability setup</p>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/8B5CF6?text=Candlestick+Confluence+-+Concept" alt="Candlestick Confluence">
                <p class="image-caption">Hình 2.5.1: Candlestick như lớp xác nhận cuối cùng</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">✅ Với Zones</span>
            <h2 class="section-title">Candlesticks Xác Nhận Zones</h2>

            <div class="confluence-example">
                <h4>Ví dụ: HFZ + Bearish Engulfing</h4>
                <p>Giá đến HFZ (vùng bán) → Xuất hiện Bearish Engulfing → Xác nhận sellers đang vào cuộc → Short với confidence cao hơn</p>
            </div>

            <div class="confluence-example">
                <h4>Ví dụ: LFZ + Hammer</h4>
                <p>Giá đến LFZ (vùng mua) → Xuất hiện Hammer → Xác nhận buyers đang reject giá thấp → Long với confidence cao hơn</p>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x400/1a0a2e/10B981?text=Zone+%2B+Candlestick+-+Example" alt="Zone + Candlestick">
                <p class="image-caption">Hình 2.5.2: Zone + Candlestick confirmation</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Với Patterns</span>
            <h2 class="section-title">Candlesticks Xác Nhận Chart Patterns</h2>

            <div class="grid-2">
                <div class="grid-item green">
                    <h4 style="color: #10B981; margin-bottom: 0.5rem;">Flag + Bullish Candle</h4>
                    <p style="font-size: 0.9rem;">Breakout khỏi Flag với nến Marubozu xanh mạnh → Confirmation tốt</p>
                </div>
                <div class="grid-item" style="border-left: 3px solid #ef4444;">
                    <h4 style="color: #ef4444; margin-bottom: 0.5rem;">Double Top + Bearish Engulfing</h4>
                    <p style="font-size: 0.9rem;">Đỉnh thứ 2 của Double Top có Bearish Engulfing → Strong sell signal</p>
                </div>
            </div>

            <div class="highlight-box gold">
                <p><strong>💡 Key Insight:</strong> Candlestick patterns là "final trigger" - chờ pattern này xuất hiện trước khi pull trigger vào lệnh.</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📋 Checklist</span>
            <h2 class="section-title">Confirmation Checklist</h2>

            <ul class="checklist">
                <li>Có zone (HFZ/LFZ) hoặc S/R level quan trọng?</li>
                <li>Có chart pattern hỗ trợ (Flag, Triangle, etc.)?</li>
                <li>Candlestick pattern xuất hiện tại vị trí đó?</li>
                <li>Volume hỗ trợ candlestick pattern?</li>
                <li>Trend HTF cùng hướng với signal?</li>
            </ul>

            <div class="highlight-box">
                <p><strong>📊 Scoring System:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>5/5 confirmations = A+ setup (full size)</li>
                    <li>4/5 confirmations = A setup (normal size)</li>
                    <li>3/5 confirmations = B setup (reduced size)</li>
                    <li>&lt;3 confirmations = Skip trade</li>
                </ul>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🎯 Best Practices</span>
            <h2 class="section-title">Candlesticks Mạnh Nhất Để Confirm</h2>

            <div class="grid-2">
                <div class="grid-item purple">
                    <h4 style="color: #8B5CF6; margin-bottom: 0.5rem;">🟢 Bullish Confirmation</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>Bullish Engulfing</li>
                        <li>Hammer</li>
                        <li>Morning Star</li>
                        <li>Three White Soldiers</li>
                    </ul>
                </div>
                <div class="grid-item gold">
                    <h4 style="color: #FFBD59; margin-bottom: 0.5rem;">🔴 Bearish Confirmation</h4>
                    <ul style="font-size: 0.9rem; margin-left: 1rem;">
                        <li>Bearish Engulfing</li>
                        <li>Shooting Star</li>
                        <li>Evening Star</li>
                        <li>Three Black Crows</li>
                    </ul>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/1a0a2e/FFBD59?text=Top+Confirmation+Candles" alt="Top Confirmation">
                <p class="image-caption">Hình 2.5.3: Top candlesticks để confirm entry</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚠️ Cảnh báo</span>
            <h2 class="section-title">Khi KHÔNG Nên Sử Dụng</h2>

            <div class="highlight-box" style="border-color: rgba(239, 68, 68, 0.3);">
                <p><strong>❌ Tránh dùng candlesticks confirmation khi:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Không có zone hoặc pattern hỗ trợ</li>
                    <li>Candlestick xuất hiện giữa "no man''s land"</li>
                    <li>Volume quá thấp</li>
                    <li>Ngược hướng trend lớn</li>
                    <li>Trong thời gian news quan trọng</li>
                </ul>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Candlesticks là lớp confirmation cuối cùng, không phải signal đơn lẻ</li>
                <li>Kết hợp: Zone + Pattern + Candlestick = High-probability setup</li>
                <li>Engulfing và Hammer/Shooting Star là confirmations mạnh nhất</li>
                <li>Sử dụng scoring system để đánh giá chất lượng setup</li>
                <li>Không trade candlestick đơn lẻ mà không có context</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Candlesticks nên được sử dụng như thế nào trong trading chuyên nghiệp?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Như signal đơn lẻ để vào lệnh</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Như confirmation cho zones và patterns khác</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Chỉ dùng trên timeframe 1 phút</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Setup 3/5 confirmations nên được xử lý như thế nào?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Trade với full size</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Skip trade hoàn toàn</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Trade với reduced size (B setup)</span>
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

-- Lesson 2.6: Ví Dụ Thực Tế Candlesticks
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch2-l6',
  'module-tier-3-ch2',
  'course-tier3-trading-mastery',
  'Bài 2.6: Ví Dụ Thực Tế Candlesticks',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 2.6: Ví Dụ Thực Tế Candlesticks</title>
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
        .case-study { background: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 0.75rem; padding: 1.25rem; margin: 1rem 0; }
        .case-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #27272a; }
        .case-title { font-weight: 700; color: #fff; }
        .case-result { padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.8rem; font-weight: 600; }
        .case-result.win { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .case-result.loss { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .highlight-box { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border-color: rgba(16, 185, 129, 0.3); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.05)); border-color: rgba(255, 189, 89, 0.3); }
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
            <h1 class="lesson-title">Bài 2.6: Ví Dụ Thực Tế Candlesticks</h1>
            <p class="lesson-subtitle">Case studies candlestick patterns trên crypto</p>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Case 1</span>
            <h2 class="section-title">BTC - Hammer tại LFZ</h2>

            <div class="case-study">
                <div class="case-header">
                    <span class="case-title">BTC/USDT 4H - Hammer + LFZ Confluence</span>
                    <span class="case-result win">+9.2% Win</span>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/700x400/0a2e1a/10B981?text=BTC+Hammer+at+LFZ+-+4H+Chart" alt="BTC Hammer">
                    <p class="image-caption">Chart 1: Hammer xuất hiện tại LFZ quan trọng</p>
                </div>

                <div class="trade-details">
                    <div class="trade-detail"><div class="trade-label">Pattern</div><div><strong>Hammer + LFZ</strong></div></div>
                    <div class="trade-detail"><div class="trade-label">Confluences</div><div><strong>5/5</strong> (Zone, Volume, HTF, Candle, Pattern)</div></div>
                    <div class="trade-detail"><div class="trade-label">Entry</div><div><strong>$41,200</strong></div></div>
                    <div class="trade-detail"><div class="trade-label">R:R</div><div><strong>1:3.2</strong></div></div>
                </div>

                <div class="highlight-box green">
                    <p><strong>📝 Phân tích:</strong> Hammer xuất hiện chính xác tại LFZ đã xác định trước. Volume spike khi tạo bóng dưới dài. Daily trend vẫn bullish. Entry sau nến xanh xác nhận.</p>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Case 2</span>
            <h2 class="section-title">ETH - Bearish Engulfing tại HFZ</h2>

            <div class="case-study">
                <div class="case-header">
                    <span class="case-title">ETH/USDT 1H - Bearish Engulfing + HFZ</span>
                    <span class="case-result win">+6.8% Win</span>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/700x400/2e0a0a/ef4444?text=ETH+Bearish+Engulfing+at+HFZ" alt="ETH Bearish Engulfing">
                    <p class="image-caption">Chart 2: Bearish Engulfing tại HFZ</p>
                </div>

                <div class="trade-details">
                    <div class="trade-detail"><div class="trade-label">Pattern</div><div><strong>Bearish Engulfing + HFZ</strong></div></div>
                    <div class="trade-detail"><div class="trade-label">Confluences</div><div><strong>4/5</strong></div></div>
                    <div class="trade-detail"><div class="trade-label">Entry</div><div><strong>$2,380</strong> (Short)</div></div>
                    <div class="trade-detail"><div class="trade-label">R:R</div><div><strong>1:2.4</strong></div></div>
                </div>

                <div class="highlight-box" style="border-color: rgba(239, 68, 68, 0.3);">
                    <p><strong>📝 Phân tích:</strong> Giá test HFZ lần 2. Bearish Engulfing mạnh với volume cao gấp 2x average. Entry ngay close của Engulfing. SL trên high của pattern.</p>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Case 3</span>
            <h2 class="section-title">SOL - Morning Star Failed Setup</h2>

            <div class="case-study">
                <div class="case-header">
                    <span class="case-title">SOL/USDT 4H - Morning Star (Thất bại)</span>
                    <span class="case-result loss">-1.8% Loss</span>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/700x400/2e1a0a/FFBD59?text=SOL+Morning+Star+-+Failed+Setup" alt="SOL Failed">
                    <p class="image-caption">Chart 3: Morning Star không có confluence đủ</p>
                </div>

                <div class="trade-details">
                    <div class="trade-detail"><div class="trade-label">Pattern</div><div><strong>Morning Star</strong></div></div>
                    <div class="trade-detail"><div class="trade-label">Confluences</div><div><strong>2/5</strong> (Thiếu zone, thiếu HTF support)</div></div>
                    <div class="trade-detail"><div class="trade-label">Entry</div><div><strong>$98.50</strong></div></div>
                    <div class="trade-detail"><div class="trade-label">Result</div><div><strong>SL hit</strong></div></div>
                </div>

                <div class="lesson-box">
                    <h4>📚 Bài Học:</h4>
                    <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                        <li>Morning Star xuất hiện giữa "no man''s land" - không có zone</li>
                        <li>Daily trend đang bearish → ngược hướng setup</li>
                        <li>Volume yếu, không có confirmation</li>
                        <li>Confluences: 2/5 → Nên skip trade này</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Case 4</span>
            <h2 class="section-title">AVAX - Shooting Star + Resistance</h2>

            <div class="case-study">
                <div class="case-header">
                    <span class="case-title">AVAX/USDT 4H - Shooting Star Perfect Setup</span>
                    <span class="case-result win">+11.5% Win</span>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/700x400/1a0a2e/8B5CF6?text=AVAX+Shooting+Star+-+Perfect+Setup" alt="AVAX Shooting Star">
                    <p class="image-caption">Chart 4: Shooting Star tại resistance với đầy đủ confluences</p>
                </div>

                <div class="highlight-box gold">
                    <p><strong>✅ 5/5 Confluences:</strong></p>
                    <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                        <li>✓ HFZ/Resistance zone rõ ràng</li>
                        <li>✓ Shooting Star pattern hoàn hảo</li>
                        <li>✓ Volume spike (rejection)</li>
                        <li>✓ Daily trend sideways/bearish</li>
                        <li>✓ RSI divergence bearish</li>
                    </ul>
                </div>

                <div class="highlight-box green">
                    <p><strong>💰 Kết quả:</strong> Short từ $38.50, TP đạt ở $34.00. Multi-TP strategy: TP1 ở $36.50 (50%), TP2 ở $34.00 (50%). Tổng +11.5% profit.</p>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📈 Thống kê</span>
            <h2 class="section-title">Tổng Hợp 4 Case Studies</h2>

            <div class="highlight-box">
                <p><strong>📊 Kết quả:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Win Rate: 75% (3/4)</li>
                    <li>Avg Win: +9.2%</li>
                    <li>Avg Loss: -1.8%</li>
                    <li>Profit Factor: 5.1x</li>
                </ul>
            </div>

            <div class="lesson-box">
                <h4>🔑 Key Takeaways:</h4>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Setup 5/5 và 4/5 confluences: 100% win rate</li>
                    <li>Setup 2/5 confluences: Loss (nên skip)</li>
                    <li>Zone + Candlestick = High probability</li>
                    <li>Volume confirmation rất quan trọng</li>
                </ul>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Chapter 2</h3>
            <ul class="summary-list">
                <li>Doji & Spinning Top: Signals indecision, cần context</li>
                <li>Engulfing: Reversal pattern mạnh nhất</li>
                <li>Hammer & Shooting Star: Single candle reversal</li>
                <li>Three Methods: Continuation pattern 5 nến</li>
                <li>Candlesticks làm confirmation, không phải signal đơn lẻ</li>
                <li>Confluence scoring: 4-5/5 = trade, &lt;3 = skip</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Final Quiz</span>
            <h2 class="section-title">Quiz Chapter 2</h2>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">1. Trong case study SOL, tại sao trade bị loss?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Thiếu confluences (2/5), không có zone, ngược HTF trend</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Stop loss đặt sai vị trí</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Entry quá sớm</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Setup lý tưởng để trade candlestick pattern cần ít nhất bao nhiêu confluences?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>1-2 confluences</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>2-3 confluences</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>4-5 confluences</span>
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
            <p style="margin-top: 0.5rem; color: #8B5CF6;">Hoàn thành Chapter 2: Candlestick Mastery ✓</p>
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
    <title>Bài 2.6: Ví Dụ Thực Tế Candlesticks</title>
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
        .case-study { background: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 0.75rem; padding: 1.25rem; margin: 1rem 0; }
        .case-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #27272a; }
        .case-title { font-weight: 700; color: #fff; }
        .case-result { padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.8rem; font-weight: 600; }
        .case-result.win { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .case-result.loss { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .highlight-box { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border-color: rgba(16, 185, 129, 0.3); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.05)); border-color: rgba(255, 189, 89, 0.3); }
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
            <h1 class="lesson-title">Bài 2.6: Ví Dụ Thực Tế Candlesticks</h1>
            <p class="lesson-subtitle">Case studies candlestick patterns trên crypto</p>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Case 1</span>
            <h2 class="section-title">BTC - Hammer tại LFZ</h2>

            <div class="case-study">
                <div class="case-header">
                    <span class="case-title">BTC/USDT 4H - Hammer + LFZ Confluence</span>
                    <span class="case-result win">+9.2% Win</span>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/700x400/0a2e1a/10B981?text=BTC+Hammer+at+LFZ+-+4H+Chart" alt="BTC Hammer">
                    <p class="image-caption">Chart 1: Hammer xuất hiện tại LFZ quan trọng</p>
                </div>

                <div class="trade-details">
                    <div class="trade-detail"><div class="trade-label">Pattern</div><div><strong>Hammer + LFZ</strong></div></div>
                    <div class="trade-detail"><div class="trade-label">Confluences</div><div><strong>5/5</strong> (Zone, Volume, HTF, Candle, Pattern)</div></div>
                    <div class="trade-detail"><div class="trade-label">Entry</div><div><strong>$41,200</strong></div></div>
                    <div class="trade-detail"><div class="trade-label">R:R</div><div><strong>1:3.2</strong></div></div>
                </div>

                <div class="highlight-box green">
                    <p><strong>📝 Phân tích:</strong> Hammer xuất hiện chính xác tại LFZ đã xác định trước. Volume spike khi tạo bóng dưới dài. Daily trend vẫn bullish. Entry sau nến xanh xác nhận.</p>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Case 2</span>
            <h2 class="section-title">ETH - Bearish Engulfing tại HFZ</h2>

            <div class="case-study">
                <div class="case-header">
                    <span class="case-title">ETH/USDT 1H - Bearish Engulfing + HFZ</span>
                    <span class="case-result win">+6.8% Win</span>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/700x400/2e0a0a/ef4444?text=ETH+Bearish+Engulfing+at+HFZ" alt="ETH Bearish Engulfing">
                    <p class="image-caption">Chart 2: Bearish Engulfing tại HFZ</p>
                </div>

                <div class="trade-details">
                    <div class="trade-detail"><div class="trade-label">Pattern</div><div><strong>Bearish Engulfing + HFZ</strong></div></div>
                    <div class="trade-detail"><div class="trade-label">Confluences</div><div><strong>4/5</strong></div></div>
                    <div class="trade-detail"><div class="trade-label">Entry</div><div><strong>$2,380</strong> (Short)</div></div>
                    <div class="trade-detail"><div class="trade-label">R:R</div><div><strong>1:2.4</strong></div></div>
                </div>

                <div class="highlight-box" style="border-color: rgba(239, 68, 68, 0.3);">
                    <p><strong>📝 Phân tích:</strong> Giá test HFZ lần 2. Bearish Engulfing mạnh với volume cao gấp 2x average. Entry ngay close của Engulfing. SL trên high của pattern.</p>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Case 3</span>
            <h2 class="section-title">SOL - Morning Star Failed Setup</h2>

            <div class="case-study">
                <div class="case-header">
                    <span class="case-title">SOL/USDT 4H - Morning Star (Thất bại)</span>
                    <span class="case-result loss">-1.8% Loss</span>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/700x400/2e1a0a/FFBD59?text=SOL+Morning+Star+-+Failed+Setup" alt="SOL Failed">
                    <p class="image-caption">Chart 3: Morning Star không có confluence đủ</p>
                </div>

                <div class="trade-details">
                    <div class="trade-detail"><div class="trade-label">Pattern</div><div><strong>Morning Star</strong></div></div>
                    <div class="trade-detail"><div class="trade-label">Confluences</div><div><strong>2/5</strong> (Thiếu zone, thiếu HTF support)</div></div>
                    <div class="trade-detail"><div class="trade-label">Entry</div><div><strong>$98.50</strong></div></div>
                    <div class="trade-detail"><div class="trade-label">Result</div><div><strong>SL hit</strong></div></div>
                </div>

                <div class="lesson-box">
                    <h4>📚 Bài Học:</h4>
                    <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                        <li>Morning Star xuất hiện giữa "no man''s land" - không có zone</li>
                        <li>Daily trend đang bearish → ngược hướng setup</li>
                        <li>Volume yếu, không có confirmation</li>
                        <li>Confluences: 2/5 → Nên skip trade này</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Case 4</span>
            <h2 class="section-title">AVAX - Shooting Star + Resistance</h2>

            <div class="case-study">
                <div class="case-header">
                    <span class="case-title">AVAX/USDT 4H - Shooting Star Perfect Setup</span>
                    <span class="case-result win">+11.5% Win</span>
                </div>

                <div class="image-placeholder">
                    <img src="https://via.placeholder.com/700x400/1a0a2e/8B5CF6?text=AVAX+Shooting+Star+-+Perfect+Setup" alt="AVAX Shooting Star">
                    <p class="image-caption">Chart 4: Shooting Star tại resistance với đầy đủ confluences</p>
                </div>

                <div class="highlight-box gold">
                    <p><strong>✅ 5/5 Confluences:</strong></p>
                    <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                        <li>✓ HFZ/Resistance zone rõ ràng</li>
                        <li>✓ Shooting Star pattern hoàn hảo</li>
                        <li>✓ Volume spike (rejection)</li>
                        <li>✓ Daily trend sideways/bearish</li>
                        <li>✓ RSI divergence bearish</li>
                    </ul>
                </div>

                <div class="highlight-box green">
                    <p><strong>💰 Kết quả:</strong> Short từ $38.50, TP đạt ở $34.00. Multi-TP strategy: TP1 ở $36.50 (50%), TP2 ở $34.00 (50%). Tổng +11.5% profit.</p>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📈 Thống kê</span>
            <h2 class="section-title">Tổng Hợp 4 Case Studies</h2>

            <div class="highlight-box">
                <p><strong>📊 Kết quả:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Win Rate: 75% (3/4)</li>
                    <li>Avg Win: +9.2%</li>
                    <li>Avg Loss: -1.8%</li>
                    <li>Profit Factor: 5.1x</li>
                </ul>
            </div>

            <div class="lesson-box">
                <h4>🔑 Key Takeaways:</h4>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Setup 5/5 và 4/5 confluences: 100% win rate</li>
                    <li>Setup 2/5 confluences: Loss (nên skip)</li>
                    <li>Zone + Candlestick = High probability</li>
                    <li>Volume confirmation rất quan trọng</li>
                </ul>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Chapter 2</h3>
            <ul class="summary-list">
                <li>Doji & Spinning Top: Signals indecision, cần context</li>
                <li>Engulfing: Reversal pattern mạnh nhất</li>
                <li>Hammer & Shooting Star: Single candle reversal</li>
                <li>Three Methods: Continuation pattern 5 nến</li>
                <li>Candlesticks làm confirmation, không phải signal đơn lẻ</li>
                <li>Confluence scoring: 4-5/5 = trade, &lt;3 = skip</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Final Quiz</span>
            <h2 class="section-title">Quiz Chapter 2</h2>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">1. Trong case study SOL, tại sao trade bị loss?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Thiếu confluences (2/5), không có zone, ngược HTF trend</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Stop loss đặt sai vị trí</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Entry quá sớm</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Setup lý tưởng để trade candlestick pattern cần ít nhất bao nhiêu confluences?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>1-2 confluences</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>2-3 confluences</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>4-5 confluences</span>
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
            <p style="margin-top: 0.5rem; color: #8B5CF6;">Hoàn thành Chapter 2: Candlestick Mastery ✓</p>
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
