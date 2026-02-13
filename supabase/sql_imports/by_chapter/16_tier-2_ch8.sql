-- =====================================================
-- TIER-2 - Module B: Opportunities Tier 2
-- Course: course-tier2-trading-advanced
-- File 16/23
-- =====================================================

-- Create/Update Module
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  'module-tier-2-ch8',
  'course-tier2-trading-advanced',
  'Module B: Opportunities Tier 2',
  'Cơ hội partnership',
  8,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Lesson 8.1: Ngã Ba Đường - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch8-l1',
  'module-tier-2-ch8',
  'course-tier2-trading-advanced',
  'Bài 8.1: Ngã Ba Đường - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 8.1: Ngã Ba Đường - GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #0a0a0f; color: #e4e4e7; line-height: 1.6; font-size: 16px; }
        .container { max-width: 680px; margin: 0 auto; background: #0a0a0f; }
        .lesson-header { padding: 1rem; background: linear-gradient(135deg, rgba(255, 189, 89, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border-bottom: 1px solid rgba(255, 189, 89, 0.2); }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%); color: #000; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #ffffff; margin-bottom: 0.25rem; }
        .lesson-subtitle { font-size: 0.875rem; color: #a1a1aa; }
        .content-card { background: #18181b; margin-bottom: 0.5rem; }
        .card-header { display: flex; align-items: center; padding: 1rem; gap: 0.75rem; }
        .card-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; }
        .card-icon.gold { background: rgba(255, 189, 89, 0.2); }
        .card-icon.purple { background: rgba(139, 92, 246, 0.2); }
        .card-icon.cyan { background: rgba(0, 240, 255, 0.2); }
        .card-icon.green { background: rgba(16, 185, 129, 0.2); }
        .card-meta h3 { font-size: 0.9375rem; font-weight: 600; color: #ffffff; }
        .card-meta span { font-size: 0.75rem; color: #71717a; }
        .card-body { padding: 0 1rem 1rem 1rem; }
        .card-body p { color: #d4d4d8; margin-bottom: 0.75rem; }
        .styled-list { list-style: none; padding: 0; margin: 1rem 0; }
        .styled-list li { padding: 0.75rem 1rem; background: rgba(255, 189, 89, 0.05); border-left: 3px solid #FFBD59; margin-bottom: 0.5rem; border-radius: 0 0.5rem 0.5rem 0; }
        .styled-list.purple li { background: rgba(139, 92, 246, 0.05); border-left-color: #8B5CF6; }
        .styled-list.green li { background: rgba(16, 185, 129, 0.05); border-left-color: #10B981; }
        .image-container { margin: 1rem 0; border-radius: 0.5rem; overflow: hidden; }
        .image-container img { width: 100%; height: auto; display: block; }
        .image-caption { font-size: 0.75rem; color: #71717a; text-align: center; padding: 0.5rem; background: rgba(0, 0, 0, 0.3); }
        .path-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin: 1rem 0; }
        .path-card { background: rgba(255, 189, 89, 0.08); border: 1px solid rgba(255, 189, 89, 0.2); border-radius: 0.75rem; padding: 1rem; text-align: center; }
        .path-icon { font-size: 2rem; margin-bottom: 0.5rem; }
        .path-title { font-weight: 600; color: #FFBD59; font-size: 0.875rem; margin-bottom: 0.25rem; }
        .path-desc { font-size: 0.6875rem; color: #a1a1aa; }
        .quote-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: 0.75rem; padding: 1.25rem; margin: 1rem 0; text-align: center; }
        .quote-text { font-size: 1.125rem; font-style: italic; color: #fff; margin-bottom: 0.5rem; }
        .quote-author { font-size: 0.8125rem; color: #FFBD59; }
        .summary-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: 0.75rem; padding: 1.25rem; margin: 1rem; }
        .summary-box h3 { color: #FFBD59; font-size: 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-list { list-style: none; padding: 0; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; color: #d4d4d8; }
        .summary-list li::before { content: "✓"; position: absolute; left: 0; color: #FFBD59; font-weight: bold; }
        .quiz-section { background: #18181b; margin: 0.5rem 0; padding: 1.5rem 1rem; }
        .quiz-section h3 { color: #ffffff; font-size: 1.125rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .quiz-question { background: rgba(255, 189, 89, 0.05); border: 1px solid rgba(255, 189, 89, 0.2); border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem; }
        .quiz-question p { font-weight: 500; color: #fff; margin-bottom: 0.75rem; }
        .quiz-option { display: block; width: 100%; text-align: left; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem; padding: 0.75rem 1rem; margin-bottom: 0.5rem; color: #d4d4d8; cursor: pointer; transition: all 0.2s ease; }
        .quiz-option:hover { background: rgba(255, 189, 89, 0.1); border-color: rgba(255, 189, 89, 0.3); }
        .quiz-option.correct { background: rgba(16, 185, 129, 0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239, 68, 68, 0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { display: none; padding: 0.75rem; border-radius: 0.5rem; margin-top: 0.75rem; font-weight: 500; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.1); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.1); color: #EF4444; }
        .quiz-score { display: none; text-align: center; padding: 1rem; background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%); border-radius: 0.75rem; margin-top: 1rem; }
        .quiz-score.show { display: block; }
        .quiz-score .score-text { font-size: 1.5rem; font-weight: 700; color: #FFBD59; }
        .quiz-score .score-label { font-size: 0.875rem; color: #a1a1aa; }
        .retake-btn { background: linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%); color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { padding: 1.5rem 1rem; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1); }
        .footer-logo { font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, #FFBD59 0%, #8B5CF6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .footer-text { font-size: 0.75rem; color: #71717a; margin-top: 0.25rem; }
        @media (max-width: 600px) { .container { padding: 0; } .content-card { border-radius: 0; border-left: none; border-right: none; } .path-grid { grid-template-columns: 1fr; } .lesson-title { font-size: 1.25rem; } }
        @media (min-width: 600px) { .container { padding: 1.5rem; } .content-card { border-radius: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.1); } }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="lesson-badge">🚀 Module B - Chương 8</span>
            <h1 class="lesson-title">Bài 8.1: Ngã Ba Đường</h1>
            <p class="lesson-subtitle">3 con đường phát triển sau khi hoàn thành TIER 2</p>
        </header>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">🔀</div>
                <div class="card-meta">
                    <h3>Ngã Ba Đường Của Bạn</h3>
                    <span>Crossroads - Điểm quyết định</span>
                </div>
            </div>
            <div class="card-body">
                <p>Bạn đang ở một điểm quan trọng trong hành trình trading. Từ đây, có <strong>3 con đường</strong> bạn có thể chọn. Mỗi con đường đều có thể dẫn đến thành công.</p>

                <div class="quote-box">
                    <div class="quote-text">"Ở mỗi ngã ba đường, quyết định bạn chọn sẽ định hình cuộc sống của bạn."</div>
                    <div class="quote-author">— Robert Frost</div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/FFBD59?text=Crossroads+3+Paths" alt="Crossroads">
                    <p class="image-caption">Hình 8.1.1: 3 con đường phát triển sau TIER 2</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">🛤️</div>
                <div class="card-meta">
                    <h3>3 Con Đường</h3>
                    <span>Chọn hướng phù hợp với bạn</span>
                </div>
            </div>
            <div class="card-body">
                <div class="path-grid">
                    <div class="path-card">
                        <div class="path-icon">📈</div>
                        <div class="path-title">Path 1: Solo Trader</div>
                        <div class="path-desc">Trade độc lập<br>Tự quản lý vốn<br>Tự chịu trách nhiệm</div>
                    </div>
                    <div class="path-card">
                        <div class="path-icon">🎓</div>
                        <div class="path-title">Path 2: Accelerate</div>
                        <div class="path-desc">Học TIER 3 Elite<br>Coaching 1-1<br>Rút ngắn thời gian</div>
                    </div>
                    <div class="path-card">
                        <div class="path-icon">🤝</div>
                        <div class="path-title">Path 3: Partner</div>
                        <div class="path-desc">Trở thành đối tác<br>Xây dựng income stream<br>Giúp người khác</div>
                    </div>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">📈</div>
                <div class="card-meta">
                    <h3>Path 1: Solo Trader</h3>
                    <span>Tự mình chinh phục thị trường</span>
                </div>
            </div>
            <div class="card-body">
                <p>Tiếp tục hành trình một mình với kiến thức đã có. Phù hợp nếu:</p>
                <ul class="styled-list green">
                    <li><strong>Có thời gian:</strong> Sẵn sàng dành 12-24 tháng để đạt consistent profitability</li>
                    <li><strong>Tự kỷ luật cao:</strong> Có thể tự giữ kỷ luật mà không cần accountability</li>
                    <li><strong>Vốn đủ:</strong> Có đủ vốn để paper trade rồi live trade với size nhỏ</li>
                    <li><strong>Kiên nhẫn:</strong> Sẵn sàng học từ mistakes trong quá trình</li>
                </ul>
                <p><strong>Challenges:</strong> Longer learning curve, thiếu support khi gặp khó khăn, dễ drift khỏi method.</p>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">🎓</div>
                <div class="card-meta">
                    <h3>Path 2: Accelerate với TIER 3</h3>
                    <span>Rút ngắn hành trình với Elite Training</span>
                </div>
            </div>
            <div class="card-body">
                <p>Tiếp tục học <strong>TIER 3 - Elite Trading</strong> để master advanced techniques. Phù hợp nếu:</p>
                <ul class="styled-list purple">
                    <li><strong>Muốn fast-track:</strong> Muốn rút ngắn thời gian từ 24 tháng xuống 6-12 tháng</li>
                    <li><strong>Cần mentorship:</strong> Muốn có guidance từ trader đã thành công</li>
                    <li><strong>Ambitious:</strong> Muốn đạt level cao hơn - full-time trader</li>
                    <li><strong>Sẵn sàng đầu tư:</strong> Hiểu rằng đầu tư vào bản thân là khoản đầu tư tốt nhất</li>
                </ul>
                <p><strong>Benefits:</strong> Advanced techniques, 1-1 coaching, accelerated timeline, network với pro traders.</p>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">🤝</div>
                <div class="card-meta">
                    <h3>Path 3: Partnership</h3>
                    <span>Xây dựng income stream từ GEM</span>
                </div>
            </div>
            <div class="card-body">
                <p>Trở thành <strong>GEM Partner</strong> - giúp người khác học trading và earn income. Phù hợp nếu:</p>
                <ul class="styled-list">
                    <li><strong>Thích giúp người khác:</strong> Có passion chia sẻ kiến thức</li>
                    <li><strong>Muốn multiple income:</strong> Trading + Affiliate/Partner income</li>
                    <li><strong>Có network:</strong> Biết nhiều người quan tâm đến trading/crypto</li>
                    <li><strong>Entrepreneurial:</strong> Muốn xây dựng business bên cạnh trading</li>
                </ul>
                <p><strong>Benefits:</strong> Passive income stream, community leadership, accelerated learning qua teaching.</p>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">🎯</div>
                <div class="card-meta">
                    <h3>Không Có Đường Sai</h3>
                    <span>Mỗi path đều dẫn đến thành công</span>
                </div>
            </div>
            <div class="card-body">
                <p>Quan trọng là bạn <strong>chọn và commit</strong>. Cả 3 con đường đều có thể dẫn đến consistent profitability - chỉ khác ở tốc độ và resources.</p>

                <div class="quote-box">
                    <div class="quote-text">"Đường nào cũng đúng, miễn là bạn đi đến cuối."</div>
                    <div class="quote-author">— GEM Method</div>
                </div>

                <p>Module B tiếp theo sẽ giới thiệu chi tiết về các công cụ và cơ hội giúp bạn accelerate journey của mình.</p>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/00F0FF?text=All+Paths+Lead+to+Success" alt="Success">
                    <p class="image-caption">Hình 8.1.2: Mọi con đường đều dẫn đến thành công</p>
                </div>
            </div>
        </article>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>3 con đường: Solo Trader, Accelerate (TIER 3), Partnership</li>
                <li>Solo: Tự học, cần kiên nhẫn 12-24 tháng</li>
                <li>Accelerate: Fast-track với coaching, rút ngắn xuống 6-12 tháng</li>
                <li>Partnership: Multiple income streams, help others while earning</li>
                <li>Không có đường sai - chỉ cần chọn và commit</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h3>🎯 Kiểm Tra Kiến Thức</h3>
            <div class="quiz-question" data-correct="2">
                <p><strong>Câu 1:</strong> Con đường nào phù hợp nếu bạn muốn rút ngắn thời gian học?</p>
                <button class="quiz-option" data-index="0">Solo Trader</button>
                <button class="quiz-option" data-index="1">Partnership</button>
                <button class="quiz-option" data-index="2">Accelerate với TIER 3</button>
                <button class="quiz-option" data-index="3">Không có con đường nào</button>
                <div class="quiz-result"></div>
            </div>
            <div class="quiz-question" data-correct="1">
                <p><strong>Câu 2:</strong> Partnership path phù hợp với ai?</p>
                <button class="quiz-option" data-index="0">Người chỉ muốn trade một mình</button>
                <button class="quiz-option" data-index="1">Người thích giúp người khác và muốn multiple income</button>
                <button class="quiz-option" data-index="2">Người không có network</button>
                <button class="quiz-option" data-index="3">Người không muốn đầu tư</button>
                <div class="quiz-result"></div>
            </div>
            <div class="quiz-score">
                <div class="score-text"><span id="correct-count">0</span>/2</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <div class="footer-logo">GEM Trading Academy</div>
            <p class="footer-text">Module B - Cơ Hội & Lựa Chọn • Bài 8.1</p>
        </footer>
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
</html>
',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 8.1: Ngã Ba Đường - GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #0a0a0f; color: #e4e4e7; line-height: 1.6; font-size: 16px; }
        .container { max-width: 680px; margin: 0 auto; background: #0a0a0f; }
        .lesson-header { padding: 1rem; background: linear-gradient(135deg, rgba(255, 189, 89, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border-bottom: 1px solid rgba(255, 189, 89, 0.2); }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%); color: #000; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #ffffff; margin-bottom: 0.25rem; }
        .lesson-subtitle { font-size: 0.875rem; color: #a1a1aa; }
        .content-card { background: #18181b; margin-bottom: 0.5rem; }
        .card-header { display: flex; align-items: center; padding: 1rem; gap: 0.75rem; }
        .card-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; }
        .card-icon.gold { background: rgba(255, 189, 89, 0.2); }
        .card-icon.purple { background: rgba(139, 92, 246, 0.2); }
        .card-icon.cyan { background: rgba(0, 240, 255, 0.2); }
        .card-icon.green { background: rgba(16, 185, 129, 0.2); }
        .card-meta h3 { font-size: 0.9375rem; font-weight: 600; color: #ffffff; }
        .card-meta span { font-size: 0.75rem; color: #71717a; }
        .card-body { padding: 0 1rem 1rem 1rem; }
        .card-body p { color: #d4d4d8; margin-bottom: 0.75rem; }
        .styled-list { list-style: none; padding: 0; margin: 1rem 0; }
        .styled-list li { padding: 0.75rem 1rem; background: rgba(255, 189, 89, 0.05); border-left: 3px solid #FFBD59; margin-bottom: 0.5rem; border-radius: 0 0.5rem 0.5rem 0; }
        .styled-list.purple li { background: rgba(139, 92, 246, 0.05); border-left-color: #8B5CF6; }
        .styled-list.green li { background: rgba(16, 185, 129, 0.05); border-left-color: #10B981; }
        .image-container { margin: 1rem 0; border-radius: 0.5rem; overflow: hidden; }
        .image-container img { width: 100%; height: auto; display: block; }
        .image-caption { font-size: 0.75rem; color: #71717a; text-align: center; padding: 0.5rem; background: rgba(0, 0, 0, 0.3); }
        .path-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin: 1rem 0; }
        .path-card { background: rgba(255, 189, 89, 0.08); border: 1px solid rgba(255, 189, 89, 0.2); border-radius: 0.75rem; padding: 1rem; text-align: center; }
        .path-icon { font-size: 2rem; margin-bottom: 0.5rem; }
        .path-title { font-weight: 600; color: #FFBD59; font-size: 0.875rem; margin-bottom: 0.25rem; }
        .path-desc { font-size: 0.6875rem; color: #a1a1aa; }
        .quote-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: 0.75rem; padding: 1.25rem; margin: 1rem 0; text-align: center; }
        .quote-text { font-size: 1.125rem; font-style: italic; color: #fff; margin-bottom: 0.5rem; }
        .quote-author { font-size: 0.8125rem; color: #FFBD59; }
        .summary-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: 0.75rem; padding: 1.25rem; margin: 1rem; }
        .summary-box h3 { color: #FFBD59; font-size: 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-list { list-style: none; padding: 0; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; color: #d4d4d8; }
        .summary-list li::before { content: "✓"; position: absolute; left: 0; color: #FFBD59; font-weight: bold; }
        .quiz-section { background: #18181b; margin: 0.5rem 0; padding: 1.5rem 1rem; }
        .quiz-section h3 { color: #ffffff; font-size: 1.125rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .quiz-question { background: rgba(255, 189, 89, 0.05); border: 1px solid rgba(255, 189, 89, 0.2); border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem; }
        .quiz-question p { font-weight: 500; color: #fff; margin-bottom: 0.75rem; }
        .quiz-option { display: block; width: 100%; text-align: left; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem; padding: 0.75rem 1rem; margin-bottom: 0.5rem; color: #d4d4d8; cursor: pointer; transition: all 0.2s ease; }
        .quiz-option:hover { background: rgba(255, 189, 89, 0.1); border-color: rgba(255, 189, 89, 0.3); }
        .quiz-option.correct { background: rgba(16, 185, 129, 0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239, 68, 68, 0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { display: none; padding: 0.75rem; border-radius: 0.5rem; margin-top: 0.75rem; font-weight: 500; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.1); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.1); color: #EF4444; }
        .quiz-score { display: none; text-align: center; padding: 1rem; background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%); border-radius: 0.75rem; margin-top: 1rem; }
        .quiz-score.show { display: block; }
        .quiz-score .score-text { font-size: 1.5rem; font-weight: 700; color: #FFBD59; }
        .quiz-score .score-label { font-size: 0.875rem; color: #a1a1aa; }
        .retake-btn { background: linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%); color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { padding: 1.5rem 1rem; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1); }
        .footer-logo { font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, #FFBD59 0%, #8B5CF6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .footer-text { font-size: 0.75rem; color: #71717a; margin-top: 0.25rem; }
        @media (max-width: 600px) { .container { padding: 0; } .content-card { border-radius: 0; border-left: none; border-right: none; } .path-grid { grid-template-columns: 1fr; } .lesson-title { font-size: 1.25rem; } }
        @media (min-width: 600px) { .container { padding: 1.5rem; } .content-card { border-radius: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.1); } }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="lesson-badge">🚀 Module B - Chương 8</span>
            <h1 class="lesson-title">Bài 8.1: Ngã Ba Đường</h1>
            <p class="lesson-subtitle">3 con đường phát triển sau khi hoàn thành TIER 2</p>
        </header>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">🔀</div>
                <div class="card-meta">
                    <h3>Ngã Ba Đường Của Bạn</h3>
                    <span>Crossroads - Điểm quyết định</span>
                </div>
            </div>
            <div class="card-body">
                <p>Bạn đang ở một điểm quan trọng trong hành trình trading. Từ đây, có <strong>3 con đường</strong> bạn có thể chọn. Mỗi con đường đều có thể dẫn đến thành công.</p>

                <div class="quote-box">
                    <div class="quote-text">"Ở mỗi ngã ba đường, quyết định bạn chọn sẽ định hình cuộc sống của bạn."</div>
                    <div class="quote-author">— Robert Frost</div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/FFBD59?text=Crossroads+3+Paths" alt="Crossroads">
                    <p class="image-caption">Hình 8.1.1: 3 con đường phát triển sau TIER 2</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">🛤️</div>
                <div class="card-meta">
                    <h3>3 Con Đường</h3>
                    <span>Chọn hướng phù hợp với bạn</span>
                </div>
            </div>
            <div class="card-body">
                <div class="path-grid">
                    <div class="path-card">
                        <div class="path-icon">📈</div>
                        <div class="path-title">Path 1: Solo Trader</div>
                        <div class="path-desc">Trade độc lập<br>Tự quản lý vốn<br>Tự chịu trách nhiệm</div>
                    </div>
                    <div class="path-card">
                        <div class="path-icon">🎓</div>
                        <div class="path-title">Path 2: Accelerate</div>
                        <div class="path-desc">Học TIER 3 Elite<br>Coaching 1-1<br>Rút ngắn thời gian</div>
                    </div>
                    <div class="path-card">
                        <div class="path-icon">🤝</div>
                        <div class="path-title">Path 3: Partner</div>
                        <div class="path-desc">Trở thành đối tác<br>Xây dựng income stream<br>Giúp người khác</div>
                    </div>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">📈</div>
                <div class="card-meta">
                    <h3>Path 1: Solo Trader</h3>
                    <span>Tự mình chinh phục thị trường</span>
                </div>
            </div>
            <div class="card-body">
                <p>Tiếp tục hành trình một mình với kiến thức đã có. Phù hợp nếu:</p>
                <ul class="styled-list green">
                    <li><strong>Có thời gian:</strong> Sẵn sàng dành 12-24 tháng để đạt consistent profitability</li>
                    <li><strong>Tự kỷ luật cao:</strong> Có thể tự giữ kỷ luật mà không cần accountability</li>
                    <li><strong>Vốn đủ:</strong> Có đủ vốn để paper trade rồi live trade với size nhỏ</li>
                    <li><strong>Kiên nhẫn:</strong> Sẵn sàng học từ mistakes trong quá trình</li>
                </ul>
                <p><strong>Challenges:</strong> Longer learning curve, thiếu support khi gặp khó khăn, dễ drift khỏi method.</p>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">🎓</div>
                <div class="card-meta">
                    <h3>Path 2: Accelerate với TIER 3</h3>
                    <span>Rút ngắn hành trình với Elite Training</span>
                </div>
            </div>
            <div class="card-body">
                <p>Tiếp tục học <strong>TIER 3 - Elite Trading</strong> để master advanced techniques. Phù hợp nếu:</p>
                <ul class="styled-list purple">
                    <li><strong>Muốn fast-track:</strong> Muốn rút ngắn thời gian từ 24 tháng xuống 6-12 tháng</li>
                    <li><strong>Cần mentorship:</strong> Muốn có guidance từ trader đã thành công</li>
                    <li><strong>Ambitious:</strong> Muốn đạt level cao hơn - full-time trader</li>
                    <li><strong>Sẵn sàng đầu tư:</strong> Hiểu rằng đầu tư vào bản thân là khoản đầu tư tốt nhất</li>
                </ul>
                <p><strong>Benefits:</strong> Advanced techniques, 1-1 coaching, accelerated timeline, network với pro traders.</p>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">🤝</div>
                <div class="card-meta">
                    <h3>Path 3: Partnership</h3>
                    <span>Xây dựng income stream từ GEM</span>
                </div>
            </div>
            <div class="card-body">
                <p>Trở thành <strong>GEM Partner</strong> - giúp người khác học trading và earn income. Phù hợp nếu:</p>
                <ul class="styled-list">
                    <li><strong>Thích giúp người khác:</strong> Có passion chia sẻ kiến thức</li>
                    <li><strong>Muốn multiple income:</strong> Trading + Affiliate/Partner income</li>
                    <li><strong>Có network:</strong> Biết nhiều người quan tâm đến trading/crypto</li>
                    <li><strong>Entrepreneurial:</strong> Muốn xây dựng business bên cạnh trading</li>
                </ul>
                <p><strong>Benefits:</strong> Passive income stream, community leadership, accelerated learning qua teaching.</p>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">🎯</div>
                <div class="card-meta">
                    <h3>Không Có Đường Sai</h3>
                    <span>Mỗi path đều dẫn đến thành công</span>
                </div>
            </div>
            <div class="card-body">
                <p>Quan trọng là bạn <strong>chọn và commit</strong>. Cả 3 con đường đều có thể dẫn đến consistent profitability - chỉ khác ở tốc độ và resources.</p>

                <div class="quote-box">
                    <div class="quote-text">"Đường nào cũng đúng, miễn là bạn đi đến cuối."</div>
                    <div class="quote-author">— GEM Method</div>
                </div>

                <p>Module B tiếp theo sẽ giới thiệu chi tiết về các công cụ và cơ hội giúp bạn accelerate journey của mình.</p>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/00F0FF?text=All+Paths+Lead+to+Success" alt="Success">
                    <p class="image-caption">Hình 8.1.2: Mọi con đường đều dẫn đến thành công</p>
                </div>
            </div>
        </article>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>3 con đường: Solo Trader, Accelerate (TIER 3), Partnership</li>
                <li>Solo: Tự học, cần kiên nhẫn 12-24 tháng</li>
                <li>Accelerate: Fast-track với coaching, rút ngắn xuống 6-12 tháng</li>
                <li>Partnership: Multiple income streams, help others while earning</li>
                <li>Không có đường sai - chỉ cần chọn và commit</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h3>🎯 Kiểm Tra Kiến Thức</h3>
            <div class="quiz-question" data-correct="2">
                <p><strong>Câu 1:</strong> Con đường nào phù hợp nếu bạn muốn rút ngắn thời gian học?</p>
                <button class="quiz-option" data-index="0">Solo Trader</button>
                <button class="quiz-option" data-index="1">Partnership</button>
                <button class="quiz-option" data-index="2">Accelerate với TIER 3</button>
                <button class="quiz-option" data-index="3">Không có con đường nào</button>
                <div class="quiz-result"></div>
            </div>
            <div class="quiz-question" data-correct="1">
                <p><strong>Câu 2:</strong> Partnership path phù hợp với ai?</p>
                <button class="quiz-option" data-index="0">Người chỉ muốn trade một mình</button>
                <button class="quiz-option" data-index="1">Người thích giúp người khác và muốn multiple income</button>
                <button class="quiz-option" data-index="2">Người không có network</button>
                <button class="quiz-option" data-index="3">Người không muốn đầu tư</button>
                <div class="quiz-result"></div>
            </div>
            <div class="quiz-score">
                <div class="score-text"><span id="correct-count">0</span>/2</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <div class="footer-logo">GEM Trading Academy</div>
            <p class="footer-text">Module B - Cơ Hội & Lựa Chọn • Bài 8.1</p>
        </footer>
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

-- Lesson 8.2: Công Cụ Tăng Tốc - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch8-l2',
  'module-tier-2-ch8',
  'course-tier2-trading-advanced',
  'Bài 8.2: Công Cụ Tăng Tốc - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 8.2: Công Cụ Tăng Tốc - GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #0a0a0f; color: #e4e4e7; line-height: 1.6; font-size: 16px; }
        .container { max-width: 680px; margin: 0 auto; background: #0a0a0f; }
        .lesson-header { padding: 1rem; background: linear-gradient(135deg, rgba(255, 189, 89, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border-bottom: 1px solid rgba(255, 189, 89, 0.2); }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%); color: #000; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #ffffff; margin-bottom: 0.25rem; }
        .lesson-subtitle { font-size: 0.875rem; color: #a1a1aa; }
        .content-card { background: #18181b; margin-bottom: 0.5rem; }
        .card-header { display: flex; align-items: center; padding: 1rem; gap: 0.75rem; }
        .card-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; }
        .card-icon.gold { background: rgba(255, 189, 89, 0.2); }
        .card-icon.purple { background: rgba(139, 92, 246, 0.2); }
        .card-icon.cyan { background: rgba(0, 240, 255, 0.2); }
        .card-icon.green { background: rgba(16, 185, 129, 0.2); }
        .card-meta h3 { font-size: 0.9375rem; font-weight: 600; color: #ffffff; }
        .card-meta span { font-size: 0.75rem; color: #71717a; }
        .card-body { padding: 0 1rem 1rem 1rem; }
        .card-body p { color: #d4d4d8; margin-bottom: 0.75rem; }
        .styled-list { list-style: none; padding: 0; margin: 1rem 0; }
        .styled-list li { padding: 0.75rem 1rem; background: rgba(255, 189, 89, 0.05); border-left: 3px solid #FFBD59; margin-bottom: 0.5rem; border-radius: 0 0.5rem 0.5rem 0; }
        .styled-list.purple li { background: rgba(139, 92, 246, 0.05); border-left-color: #8B5CF6; }
        .styled-list.green li { background: rgba(16, 185, 129, 0.05); border-left-color: #10B981; }
        .styled-list.cyan li { background: rgba(0, 240, 255, 0.05); border-left-color: #00F0FF; }
        .image-container { margin: 1rem 0; border-radius: 0.5rem; overflow: hidden; }
        .image-container img { width: 100%; height: auto; display: block; }
        .image-caption { font-size: 0.75rem; color: #71717a; text-align: center; padding: 0.5rem; background: rgba(0, 0, 0, 0.3); }
        .tool-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin: 1rem 0; }
        .tool-card { background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 0.75rem; padding: 1rem; }
        .tool-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .tool-title { font-weight: 600; color: #00F0FF; font-size: 0.875rem; margin-bottom: 0.25rem; }
        .tool-desc { font-size: 0.75rem; color: #a1a1aa; }
        .summary-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: 0.75rem; padding: 1.25rem; margin: 1rem; }
        .summary-box h3 { color: #FFBD59; font-size: 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-list { list-style: none; padding: 0; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; color: #d4d4d8; }
        .summary-list li::before { content: "✓"; position: absolute; left: 0; color: #FFBD59; font-weight: bold; }
        .quiz-section { background: #18181b; margin: 0.5rem 0; padding: 1.5rem 1rem; }
        .quiz-section h3 { color: #ffffff; font-size: 1.125rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .quiz-question { background: rgba(255, 189, 89, 0.05); border: 1px solid rgba(255, 189, 89, 0.2); border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem; }
        .quiz-question p { font-weight: 500; color: #fff; margin-bottom: 0.75rem; }
        .quiz-option { display: block; width: 100%; text-align: left; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem; padding: 0.75rem 1rem; margin-bottom: 0.5rem; color: #d4d4d8; cursor: pointer; transition: all 0.2s ease; }
        .quiz-option:hover { background: rgba(255, 189, 89, 0.1); border-color: rgba(255, 189, 89, 0.3); }
        .quiz-option.correct { background: rgba(16, 185, 129, 0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239, 68, 68, 0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { display: none; padding: 0.75rem; border-radius: 0.5rem; margin-top: 0.75rem; font-weight: 500; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.1); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.1); color: #EF4444; }
        .quiz-score { display: none; text-align: center; padding: 1rem; background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%); border-radius: 0.75rem; margin-top: 1rem; }
        .quiz-score.show { display: block; }
        .quiz-score .score-text { font-size: 1.5rem; font-weight: 700; color: #FFBD59; }
        .quiz-score .score-label { font-size: 0.875rem; color: #a1a1aa; }
        .retake-btn { background: linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%); color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { padding: 1.5rem 1rem; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1); }
        .footer-logo { font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, #FFBD59 0%, #8B5CF6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .footer-text { font-size: 0.75rem; color: #71717a; margin-top: 0.25rem; }
        @media (max-width: 600px) { .container { padding: 0; } .content-card { border-radius: 0; border-left: none; border-right: none; } .tool-grid { grid-template-columns: 1fr; } .lesson-title { font-size: 1.25rem; } }
        @media (min-width: 600px) { .container { padding: 1.5rem; } .content-card { border-radius: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.1); } }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="lesson-badge">⚡ Module B - Chương 8</span>
            <h1 class="lesson-title">Bài 8.2: Công Cụ Tăng Tốc</h1>
            <p class="lesson-subtitle">Các tools và resources giúp accelerate journey của bạn</p>
        </header>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">🛠️</div>
                <div class="card-meta">
                    <h3>Công Cụ Trong GEM Ecosystem</h3>
                    <span>Tools đã có sẵn cho bạn</span>
                </div>
            </div>
            <div class="card-body">
                <p>GEM Trading Academy cung cấp một <strong>ecosystem đầy đủ</strong> các công cụ giúp bạn học và trade hiệu quả hơn.</p>

                <div class="tool-grid">
                    <div class="tool-card">
                        <div class="tool-icon">🤖</div>
                        <div class="tool-title">GEM Master AI</div>
                        <div class="tool-desc">Chatbot AI hỗ trợ phân tích, trả lời câu hỏi trading 24/7</div>
                    </div>
                    <div class="tool-card">
                        <div class="tool-icon">📡</div>
                        <div class="tool-title">GEM Scanner</div>
                        <div class="tool-desc">Auto scan patterns trên 100+ coins, alert khi có setup</div>
                    </div>
                    <div class="tool-card">
                        <div class="tool-icon">📱</div>
                        <div class="tool-title">GEM Mobile App</div>
                        <div class="tool-desc">App mobile với courses, scanner, community</div>
                    </div>
                    <div class="tool-card">
                        <div class="tool-icon">👥</div>
                        <div class="tool-title">GEM Community</div>
                        <div class="tool-desc">Forum, discussion groups, peer support</div>
                    </div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/00F0FF?text=GEM+Ecosystem+Tools" alt="GEM Tools">
                    <p class="image-caption">Hình 8.2.1: GEM Ecosystem - Bộ công cụ trading đầy đủ</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">🤖</div>
                <div class="card-meta">
                    <h3>GEM Master AI</h3>
                    <span>AI-Powered Trading Assistant</span>
                </div>
            </div>
            <div class="card-body">
                <p><strong>GEM Master AI</strong> là chatbot AI được train với toàn bộ kiến thức GEM Method, hỗ trợ bạn 24/7.</p>
                <ul class="styled-list purple">
                    <li><strong>Pattern Analysis:</strong> Upload chart, AI nhận diện patterns và zones</li>
                    <li><strong>Trade Planning:</strong> Hỏi về entry/SL/TP, AI suggest dựa trên method</li>
                    <li><strong>Learning Support:</strong> Giải đáp mọi câu hỏi về GEM Method</li>
                    <li><strong>Trade Review:</strong> Analyze trades của bạn, chỉ ra mistakes</li>
                </ul>
                <p><em>*Tính năng AI Analysis có trong subscription plans</em></p>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">📡</div>
                <div class="card-meta">
                    <h3>GEM Scanner</h3>
                    <span>Auto Pattern Detection</span>
                </div>
            </div>
            <div class="card-body">
                <p><strong>GEM Scanner</strong> auto scan hơn 100 coins trên multiple timeframes, alert khi phát hiện high-quality setups.</p>
                <ul class="styled-list green">
                    <li><strong>Auto Scan:</strong> Scan 24/7, không cần ngồi nhìn charts</li>
                    <li><strong>Zone Detection:</strong> Tự động detect HFZ và LFZ</li>
                    <li><strong>Pattern Recognition:</strong> Nhận diện 24 patterns của GEM Method</li>
                    <li><strong>Alert System:</strong> Push notification khi có setup phù hợp criteria</li>
                    <li><strong>Multi-TF Filter:</strong> Chỉ alert khi có MTF alignment</li>
                </ul>
                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/10B981?text=GEM+Scanner+Dashboard" alt="Scanner">
                    <p class="image-caption">Hình 8.2.2: GEM Scanner - Auto scan và alert</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">🎓</div>
                <div class="card-meta">
                    <h3>TIER 3 - Elite Training</h3>
                    <span>Advanced course cho serious traders</span>
                </div>
            </div>
            <div class="card-body">
                <p><strong>TIER 3</strong> dành cho traders muốn đạt level cao nhất:</p>
                <ul class="styled-list">
                    <li><strong>Advanced Techniques:</strong> Order flow, liquidity concepts, refinement entries</li>
                    <li><strong>Market Structure:</strong> BOS, CHoCH, market structure shifts</li>
                    <li><strong>Psychology Elite:</strong> Advanced mindset, drawdown management</li>
                    <li><strong>Live Trading:</strong> Real-time analysis sessions với mentor</li>
                    <li><strong>1-1 Coaching:</strong> Personalized guidance từ pro trader</li>
                </ul>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">👥</div>
                <div class="card-meta">
                    <h3>GEM Community</h3>
                    <span>Network và Support System</span>
                </div>
            </div>
            <div class="card-body">
                <p>Community là yếu tố quan trọng trong journey của trader:</p>
                <ul class="styled-list cyan">
                    <li><strong>Discussion Forum:</strong> Thảo luận setups, share analysis</li>
                    <li><strong>Trade Ideas:</strong> Chia sẻ và học từ trades của members</li>
                    <li><strong>Accountability:</strong> Peer support giữ bạn on track</li>
                    <li><strong>Networking:</strong> Kết nối với traders cùng level</li>
                </ul>
                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/00F0FF?text=GEM+Community+Forum" alt="Community">
                    <p class="image-caption">Hình 8.2.3: GEM Community - Kết nối và học hỏi</p>
                </div>
            </div>
        </article>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>GEM Master AI: Chatbot hỗ trợ phân tích 24/7</li>
                <li>GEM Scanner: Auto scan patterns trên 100+ coins</li>
                <li>GEM Mobile App: Courses và tools trong tay</li>
                <li>GEM Community: Network và peer support</li>
                <li>TIER 3: Elite training với advanced techniques</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h3>🎯 Kiểm Tra Kiến Thức</h3>
            <div class="quiz-question" data-correct="1">
                <p><strong>Câu 1:</strong> GEM Scanner làm gì?</p>
                <button class="quiz-option" data-index="0">Trả lời câu hỏi về trading</button>
                <button class="quiz-option" data-index="1">Auto scan patterns và alert khi có setup</button>
                <button class="quiz-option" data-index="2">Chat với community members</button>
                <button class="quiz-option" data-index="3">Teaching 1-1</button>
                <div class="quiz-result"></div>
            </div>
            <div class="quiz-question" data-correct="0">
                <p><strong>Câu 2:</strong> Community giúp trader như thế nào?</p>
                <button class="quiz-option" data-index="0">Accountability, peer support, và networking</button>
                <button class="quiz-option" data-index="1">Chỉ cung cấp signals</button>
                <button class="quiz-option" data-index="2">Giao dịch thay cho bạn</button>
                <button class="quiz-option" data-index="3">Không có lợi ích gì</button>
                <div class="quiz-result"></div>
            </div>
            <div class="quiz-score">
                <div class="score-text"><span id="correct-count">0</span>/2</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <div class="footer-logo">GEM Trading Academy</div>
            <p class="footer-text">Module B - Cơ Hội & Lựa Chọn • Bài 8.2</p>
        </footer>
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
</html>
',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 8.2: Công Cụ Tăng Tốc - GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #0a0a0f; color: #e4e4e7; line-height: 1.6; font-size: 16px; }
        .container { max-width: 680px; margin: 0 auto; background: #0a0a0f; }
        .lesson-header { padding: 1rem; background: linear-gradient(135deg, rgba(255, 189, 89, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border-bottom: 1px solid rgba(255, 189, 89, 0.2); }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%); color: #000; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #ffffff; margin-bottom: 0.25rem; }
        .lesson-subtitle { font-size: 0.875rem; color: #a1a1aa; }
        .content-card { background: #18181b; margin-bottom: 0.5rem; }
        .card-header { display: flex; align-items: center; padding: 1rem; gap: 0.75rem; }
        .card-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; }
        .card-icon.gold { background: rgba(255, 189, 89, 0.2); }
        .card-icon.purple { background: rgba(139, 92, 246, 0.2); }
        .card-icon.cyan { background: rgba(0, 240, 255, 0.2); }
        .card-icon.green { background: rgba(16, 185, 129, 0.2); }
        .card-meta h3 { font-size: 0.9375rem; font-weight: 600; color: #ffffff; }
        .card-meta span { font-size: 0.75rem; color: #71717a; }
        .card-body { padding: 0 1rem 1rem 1rem; }
        .card-body p { color: #d4d4d8; margin-bottom: 0.75rem; }
        .styled-list { list-style: none; padding: 0; margin: 1rem 0; }
        .styled-list li { padding: 0.75rem 1rem; background: rgba(255, 189, 89, 0.05); border-left: 3px solid #FFBD59; margin-bottom: 0.5rem; border-radius: 0 0.5rem 0.5rem 0; }
        .styled-list.purple li { background: rgba(139, 92, 246, 0.05); border-left-color: #8B5CF6; }
        .styled-list.green li { background: rgba(16, 185, 129, 0.05); border-left-color: #10B981; }
        .styled-list.cyan li { background: rgba(0, 240, 255, 0.05); border-left-color: #00F0FF; }
        .image-container { margin: 1rem 0; border-radius: 0.5rem; overflow: hidden; }
        .image-container img { width: 100%; height: auto; display: block; }
        .image-caption { font-size: 0.75rem; color: #71717a; text-align: center; padding: 0.5rem; background: rgba(0, 0, 0, 0.3); }
        .tool-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin: 1rem 0; }
        .tool-card { background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 0.75rem; padding: 1rem; }
        .tool-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .tool-title { font-weight: 600; color: #00F0FF; font-size: 0.875rem; margin-bottom: 0.25rem; }
        .tool-desc { font-size: 0.75rem; color: #a1a1aa; }
        .summary-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: 0.75rem; padding: 1.25rem; margin: 1rem; }
        .summary-box h3 { color: #FFBD59; font-size: 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-list { list-style: none; padding: 0; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; color: #d4d4d8; }
        .summary-list li::before { content: "✓"; position: absolute; left: 0; color: #FFBD59; font-weight: bold; }
        .quiz-section { background: #18181b; margin: 0.5rem 0; padding: 1.5rem 1rem; }
        .quiz-section h3 { color: #ffffff; font-size: 1.125rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .quiz-question { background: rgba(255, 189, 89, 0.05); border: 1px solid rgba(255, 189, 89, 0.2); border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem; }
        .quiz-question p { font-weight: 500; color: #fff; margin-bottom: 0.75rem; }
        .quiz-option { display: block; width: 100%; text-align: left; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem; padding: 0.75rem 1rem; margin-bottom: 0.5rem; color: #d4d4d8; cursor: pointer; transition: all 0.2s ease; }
        .quiz-option:hover { background: rgba(255, 189, 89, 0.1); border-color: rgba(255, 189, 89, 0.3); }
        .quiz-option.correct { background: rgba(16, 185, 129, 0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239, 68, 68, 0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { display: none; padding: 0.75rem; border-radius: 0.5rem; margin-top: 0.75rem; font-weight: 500; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.1); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.1); color: #EF4444; }
        .quiz-score { display: none; text-align: center; padding: 1rem; background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%); border-radius: 0.75rem; margin-top: 1rem; }
        .quiz-score.show { display: block; }
        .quiz-score .score-text { font-size: 1.5rem; font-weight: 700; color: #FFBD59; }
        .quiz-score .score-label { font-size: 0.875rem; color: #a1a1aa; }
        .retake-btn { background: linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%); color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { padding: 1.5rem 1rem; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1); }
        .footer-logo { font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, #FFBD59 0%, #8B5CF6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .footer-text { font-size: 0.75rem; color: #71717a; margin-top: 0.25rem; }
        @media (max-width: 600px) { .container { padding: 0; } .content-card { border-radius: 0; border-left: none; border-right: none; } .tool-grid { grid-template-columns: 1fr; } .lesson-title { font-size: 1.25rem; } }
        @media (min-width: 600px) { .container { padding: 1.5rem; } .content-card { border-radius: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.1); } }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="lesson-badge">⚡ Module B - Chương 8</span>
            <h1 class="lesson-title">Bài 8.2: Công Cụ Tăng Tốc</h1>
            <p class="lesson-subtitle">Các tools và resources giúp accelerate journey của bạn</p>
        </header>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">🛠️</div>
                <div class="card-meta">
                    <h3>Công Cụ Trong GEM Ecosystem</h3>
                    <span>Tools đã có sẵn cho bạn</span>
                </div>
            </div>
            <div class="card-body">
                <p>GEM Trading Academy cung cấp một <strong>ecosystem đầy đủ</strong> các công cụ giúp bạn học và trade hiệu quả hơn.</p>

                <div class="tool-grid">
                    <div class="tool-card">
                        <div class="tool-icon">🤖</div>
                        <div class="tool-title">GEM Master AI</div>
                        <div class="tool-desc">Chatbot AI hỗ trợ phân tích, trả lời câu hỏi trading 24/7</div>
                    </div>
                    <div class="tool-card">
                        <div class="tool-icon">📡</div>
                        <div class="tool-title">GEM Scanner</div>
                        <div class="tool-desc">Auto scan patterns trên 100+ coins, alert khi có setup</div>
                    </div>
                    <div class="tool-card">
                        <div class="tool-icon">📱</div>
                        <div class="tool-title">GEM Mobile App</div>
                        <div class="tool-desc">App mobile với courses, scanner, community</div>
                    </div>
                    <div class="tool-card">
                        <div class="tool-icon">👥</div>
                        <div class="tool-title">GEM Community</div>
                        <div class="tool-desc">Forum, discussion groups, peer support</div>
                    </div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/00F0FF?text=GEM+Ecosystem+Tools" alt="GEM Tools">
                    <p class="image-caption">Hình 8.2.1: GEM Ecosystem - Bộ công cụ trading đầy đủ</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">🤖</div>
                <div class="card-meta">
                    <h3>GEM Master AI</h3>
                    <span>AI-Powered Trading Assistant</span>
                </div>
            </div>
            <div class="card-body">
                <p><strong>GEM Master AI</strong> là chatbot AI được train với toàn bộ kiến thức GEM Method, hỗ trợ bạn 24/7.</p>
                <ul class="styled-list purple">
                    <li><strong>Pattern Analysis:</strong> Upload chart, AI nhận diện patterns và zones</li>
                    <li><strong>Trade Planning:</strong> Hỏi về entry/SL/TP, AI suggest dựa trên method</li>
                    <li><strong>Learning Support:</strong> Giải đáp mọi câu hỏi về GEM Method</li>
                    <li><strong>Trade Review:</strong> Analyze trades của bạn, chỉ ra mistakes</li>
                </ul>
                <p><em>*Tính năng AI Analysis có trong subscription plans</em></p>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">📡</div>
                <div class="card-meta">
                    <h3>GEM Scanner</h3>
                    <span>Auto Pattern Detection</span>
                </div>
            </div>
            <div class="card-body">
                <p><strong>GEM Scanner</strong> auto scan hơn 100 coins trên multiple timeframes, alert khi phát hiện high-quality setups.</p>
                <ul class="styled-list green">
                    <li><strong>Auto Scan:</strong> Scan 24/7, không cần ngồi nhìn charts</li>
                    <li><strong>Zone Detection:</strong> Tự động detect HFZ và LFZ</li>
                    <li><strong>Pattern Recognition:</strong> Nhận diện 24 patterns của GEM Method</li>
                    <li><strong>Alert System:</strong> Push notification khi có setup phù hợp criteria</li>
                    <li><strong>Multi-TF Filter:</strong> Chỉ alert khi có MTF alignment</li>
                </ul>
                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/10B981?text=GEM+Scanner+Dashboard" alt="Scanner">
                    <p class="image-caption">Hình 8.2.2: GEM Scanner - Auto scan và alert</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">🎓</div>
                <div class="card-meta">
                    <h3>TIER 3 - Elite Training</h3>
                    <span>Advanced course cho serious traders</span>
                </div>
            </div>
            <div class="card-body">
                <p><strong>TIER 3</strong> dành cho traders muốn đạt level cao nhất:</p>
                <ul class="styled-list">
                    <li><strong>Advanced Techniques:</strong> Order flow, liquidity concepts, refinement entries</li>
                    <li><strong>Market Structure:</strong> BOS, CHoCH, market structure shifts</li>
                    <li><strong>Psychology Elite:</strong> Advanced mindset, drawdown management</li>
                    <li><strong>Live Trading:</strong> Real-time analysis sessions với mentor</li>
                    <li><strong>1-1 Coaching:</strong> Personalized guidance từ pro trader</li>
                </ul>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">👥</div>
                <div class="card-meta">
                    <h3>GEM Community</h3>
                    <span>Network và Support System</span>
                </div>
            </div>
            <div class="card-body">
                <p>Community là yếu tố quan trọng trong journey của trader:</p>
                <ul class="styled-list cyan">
                    <li><strong>Discussion Forum:</strong> Thảo luận setups, share analysis</li>
                    <li><strong>Trade Ideas:</strong> Chia sẻ và học từ trades của members</li>
                    <li><strong>Accountability:</strong> Peer support giữ bạn on track</li>
                    <li><strong>Networking:</strong> Kết nối với traders cùng level</li>
                </ul>
                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/00F0FF?text=GEM+Community+Forum" alt="Community">
                    <p class="image-caption">Hình 8.2.3: GEM Community - Kết nối và học hỏi</p>
                </div>
            </div>
        </article>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>GEM Master AI: Chatbot hỗ trợ phân tích 24/7</li>
                <li>GEM Scanner: Auto scan patterns trên 100+ coins</li>
                <li>GEM Mobile App: Courses và tools trong tay</li>
                <li>GEM Community: Network và peer support</li>
                <li>TIER 3: Elite training với advanced techniques</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h3>🎯 Kiểm Tra Kiến Thức</h3>
            <div class="quiz-question" data-correct="1">
                <p><strong>Câu 1:</strong> GEM Scanner làm gì?</p>
                <button class="quiz-option" data-index="0">Trả lời câu hỏi về trading</button>
                <button class="quiz-option" data-index="1">Auto scan patterns và alert khi có setup</button>
                <button class="quiz-option" data-index="2">Chat với community members</button>
                <button class="quiz-option" data-index="3">Teaching 1-1</button>
                <div class="quiz-result"></div>
            </div>
            <div class="quiz-question" data-correct="0">
                <p><strong>Câu 2:</strong> Community giúp trader như thế nào?</p>
                <button class="quiz-option" data-index="0">Accountability, peer support, và networking</button>
                <button class="quiz-option" data-index="1">Chỉ cung cấp signals</button>
                <button class="quiz-option" data-index="2">Giao dịch thay cho bạn</button>
                <button class="quiz-option" data-index="3">Không có lợi ích gì</button>
                <div class="quiz-result"></div>
            </div>
            <div class="quiz-score">
                <div class="score-text"><span id="correct-count">0</span>/2</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <div class="footer-logo">GEM Trading Academy</div>
            <p class="footer-text">Module B - Cơ Hội & Lựa Chọn • Bài 8.2</p>
        </footer>
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

-- Lesson 8.3: Cơ Hội Đối Tác - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch8-l3',
  'module-tier-2-ch8',
  'course-tier2-trading-advanced',
  'Bài 8.3: Cơ Hội Đối Tác - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 8.3: Cơ Hội Đối Tác - GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #FFBD59; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #FFBD59, #F59E0B); color: #0a0a0f; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #FFBD59; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #FFBD59, #F59E0B); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(255,189,89,0.1), rgba(245,158,11,0.1)); border: 1px solid rgba(255,189,89,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        ul { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #FFBD59; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }

        /* CTV Tier Table */
        .tier-table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.85rem; }
        .tier-table th { background: #1a1a2e; color: #FFBD59; padding: 0.75rem 0.5rem; text-align: center; border: 1px solid #27272a; }
        .tier-table td { padding: 0.75rem 0.5rem; text-align: center; border: 1px solid #27272a; background: #0f0f1a; }
        .tier-table tr:hover td { background: #1a1a2e; }
        .tier-icon { font-size: 1.1rem; }

        /* Partner Cards */
        .partner-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #FFBD59; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .partner-card h4 { color: #FFBD59; font-size: 1.1rem; margin-bottom: 0.75rem; }
        .benefit-list { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin: 0.75rem 0; }
        .benefit-item { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
        .benefit-item:last-child { margin-bottom: 0; }
        .benefit-item .check { color: #10B981; }

        /* Comparison Grid */
        .comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }
        .comparison-card { background: #1a1a2e; border-radius: 12px; padding: 1.25rem; }
        .comparison-card h5 { color: #FFBD59; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .comparison-card.kol { border: 2px solid #8B5CF6; }
        .comparison-card.kol h5 { color: #8B5CF6; }

        /* Quiz styles */
        .quiz-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #8B5CF6; }
        .quiz-title { font-size: 1.25rem; font-weight: 600; color: #8B5CF6; margin-bottom: 1rem; }
        .quiz-question { background: #1a1a2e; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
        .quiz-question p { font-weight: 600; color: #ffffff; margin-bottom: 0.75rem; }
        .quiz-option { display: block; width: 100%; padding: 0.75rem 1rem; margin-bottom: 0.5rem; background: #0f0f1a; border: 2px solid #27272a; border-radius: 8px; color: #d4d4d8; cursor: pointer; text-align: left; transition: all 0.2s; }
        .quiz-option:hover { border-color: #8B5CF6; background: rgba(139,92,246,0.1); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { display: none; padding: 0.75rem; border-radius: 8px; margin-top: 0.5rem; font-weight: 600; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { display: none; text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(255,189,89,0.1), rgba(16,185,129,0.1)); border-radius: 12px; margin-top: 1rem; }
        .quiz-score.show { display: block; }
        .quiz-score h3 { color: #FFBD59; margin-bottom: 0.5rem; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }

        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .tier-table { font-size: 0.7rem; }
            .tier-table th, .tier-table td { padding: 0.4rem 0.25rem; }
            .comparison-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 2 - Nâng Cao</span>
            <span class="module-badge">MODULE B</span>
            <h1 class="lesson-title">Cơ Hội Đối Tác</h1>
            <p class="lesson-subtitle">CTV & KOL Affiliate Program - Chi Tiết Đầy Đủ</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🤝</div>
            <h2 class="section-title">Tổng Quan Chương Trình</h2>
            <p>Sau khi hoàn thành TIER 2, bạn đã có kiến thức vững chắc và có thể cân nhắc tham gia <strong style="color: #FFBD59;">Chương Trình Đối Tác GEM</strong> để tạo nguồn thu nhập bổ sung.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Lợi Thế TIER 2:</strong> Với kiến thức nâng cao, bạn có thể chia sẻ giá trị thật sự cho người mới và xây dựng uy tín trong cộng đồng.</p>
            </div>

            <p>GEM có <strong>2 chương trình đối tác</strong>:</p>
            <div class="comparison-grid">
                <div class="comparison-card">
                    <h5>🥇 CTV (Cộng Tác Viên)</h5>
                    <ul style="padding-left: 1rem; margin: 0;">
                        <li>Ai cũng đăng ký được</li>
                        <li>5 cấp bậc: Bronze → Diamond</li>
                        <li>Commission 10-30%</li>
                        <li>Auto-approve sau 3 ngày</li>
                    </ul>
                </div>
                <div class="comparison-card kol">
                    <h5>⭐ KOL Affiliate</h5>
                    <ul style="padding-left: 1rem; margin: 0;">
                        <li>Yêu cầu 20K+ followers</li>
                        <li>Flat rate: 20% cả Digital & Physical</li>
                        <li>Sub-affiliate: 3.5%</li>
                        <li>Admin duyệt thủ công</li>
                    </ul>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=CTV+vs+KOL+Comparison" alt="Program Comparison">
                <p class="image-caption">So sánh CTV và KOL Affiliate</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Bảng Hoa Hồng CTV - Đầy Đủ</h2>
            <p>Chương trình CTV có <strong>5 cấp bậc</strong> với hoa hồng tăng theo doanh số tích lũy:</p>

            <table class="tier-table">
                <thead>
                    <tr>
                        <th>Cấp Bậc</th>
                        <th>Ngưỡng (VND)</th>
                        <th>Digital</th>
                        <th>Physical</th>
                        <th>Sub-Aff</th>
                        <th>Thanh toán</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><span class="tier-icon">🥉</span> Bronze</td>
                        <td>0</td>
                        <td><strong style="color: #10B981;">10%</strong></td>
                        <td>6%</td>
                        <td>2%</td>
                        <td>Hàng tháng</td>
                    </tr>
                    <tr>
                        <td><span class="tier-icon">🥈</span> Silver</td>
                        <td>50M</td>
                        <td><strong style="color: #10B981;">15%</strong></td>
                        <td>8%</td>
                        <td>2.5%</td>
                        <td>Hàng tháng</td>
                    </tr>
                    <tr>
                        <td><span class="tier-icon">🥇</span> Gold</td>
                        <td>150M</td>
                        <td><strong style="color: #10B981;">20%</strong></td>
                        <td>10%</td>
                        <td>3%</td>
                        <td>2 lần/tháng</td>
                    </tr>
                    <tr>
                        <td><span class="tier-icon">💎</span> Platinum</td>
                        <td>400M</td>
                        <td><strong style="color: #10B981;">25%</strong></td>
                        <td>12%</td>
                        <td>3.5%</td>
                        <td>Hàng tuần</td>
                    </tr>
                    <tr>
                        <td><span class="tier-icon">👑</span> Diamond</td>
                        <td>800M</td>
                        <td><strong style="color: #10B981;">30%</strong></td>
                        <td>15%</td>
                        <td>4%</td>
                        <td>Hàng tuần</td>
                    </tr>
                </tbody>
            </table>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>📝 Lưu ý quan trọng:</strong><br>
                • <strong>Thăng cấp:</strong> Tự động khi đạt ngưỡng doanh số<br>
                • <strong>Giữ cấp:</strong> Cần duy trì 10% threshold mỗi tháng<br>
                • <strong>Giảm cấp:</strong> Nếu doanh số tháng < 10% threshold</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⭐</div>
            <h2 class="section-title">KOL Affiliate - Chi Tiết</h2>
            <p>Dành cho influencers có lượng followers lớn:</p>

            <div class="partner-card" style="border-color: #8B5CF6;">
                <h4 style="color: #8B5CF6;">⭐ Chương Trình KOL Affiliate</h4>
                <p><strong>Điều kiện BẮT BUỘC:</strong> 20,000+ followers (không có ngoại lệ)</p>
                <div class="benefit-list">
                    <div class="benefit-item"><span class="check">✓</span> Digital Products: <strong style="color: #10B981;">20%</strong></div>
                    <div class="benefit-item"><span class="check">✓</span> Physical Products: <strong style="color: #10B981;">20%</strong></div>
                    <div class="benefit-item"><span class="check">✓</span> Sub-Affiliate: <strong style="color: #10B981;">3.5%</strong></div>
                    <div class="benefit-item"><span class="check">✓</span> Thanh toán: 2 lần/tháng (ngày 1 và 15)</div>
                    <div class="benefit-item"><span class="check">✓</span> Platforms: YouTube, Facebook, TikTok, Instagram, Twitter, Discord, Telegram</div>
                </div>
            </div>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>⚠️ Quan trọng:</strong> Dù đã là CTV, bạn vẫn PHẢI có 20K+ followers để đăng ký KOL. Không có ngoại lệ nào cho quy tắc này.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=KOL+Affiliate+Benefits" alt="KOL Benefits">
                <p class="image-caption">Lợi ích của chương trình KOL Affiliate</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">💰</div>
            <h2 class="section-title">Sub-Affiliate System</h2>
            <p>Hệ thống Sub-Affiliate cho phép bạn kiếm thêm từ những CTV/KOL mà bạn giới thiệu:</p>

            <div class="partner-card">
                <h4>📊 Cách Hoạt Động Sub-Affiliate</h4>
                <div class="benefit-list">
                    <div class="benefit-item"><span class="check">1.</span> Bạn (A) giới thiệu người B đăng ký CTV/KOL</div>
                    <div class="benefit-item"><span class="check">2.</span> B bán hàng → B nhận commission chính</div>
                    <div class="benefit-item"><span class="check">3.</span> Bạn (A) nhận Sub-Aff % từ doanh số của B</div>
                </div>
                <p style="margin-top: 1rem;"><strong>Ví dụ:</strong> Bạn là CTV Gold (Sub-Aff 3%), B bán 10 triệu → Bạn nhận 300k từ B.</p>
            </div>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Chiến lược:</strong> Xây dựng team CTV dưới bạn để tạo nguồn thu nhập passive từ Sub-Affiliate.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🚀</div>
            <h2 class="section-title">Cách Bắt Đầu</h2>
            <p>Quy trình đăng ký đơn giản:</p>

            <ul>
                <li><strong>CTV:</strong> App GEM → Account → Affiliate → Đăng ký CTV → Auto-approve sau 3 ngày</li>
                <li><strong>KOL:</strong> Cần có 20K+ followers → Submit links profile → Admin review</li>
            </ul>

            <div class="partner-card" style="border-color: #10B981;">
                <h4 style="color: #10B981;">✅ Sau Khi Được Duyệt</h4>
                <div class="benefit-list">
                    <div class="benefit-item"><span class="check">✓</span> Nhận link referral cá nhân</div>
                    <div class="benefit-item"><span class="check">✓</span> Truy cập Partner Dashboard</div>
                    <div class="benefit-item"><span class="check">✓</span> Marketing materials có sẵn</div>
                    <div class="benefit-item"><span class="check">✓</span> Track earnings realtime</div>
                </div>
            </div>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="2">
                <p>1. Hoa hồng Digital cao nhất của CTV là bao nhiêu?</p>
                <button class="quiz-option" data-index="0">A. 20% (Gold)</button>
                <button class="quiz-option" data-index="1">B. 25% (Platinum)</button>
                <button class="quiz-option" data-index="2">C. 30% (Diamond)</button>
                <button class="quiz-option" data-index="3">D. 40%</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p>2. Yêu cầu để đăng ký KOL Affiliate là gì?</p>
                <button class="quiz-option" data-index="0">A. Hoàn thành TIER 2</button>
                <button class="quiz-option" data-index="1">B. 20,000+ followers (bắt buộc)</button>
                <button class="quiz-option" data-index="2">C. Là CTV Gold trở lên</button>
                <button class="quiz-option" data-index="3">D. Không có yêu cầu</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p>3. Sub-Affiliate rate của CTV Diamond là bao nhiêu?</p>
                <button class="quiz-option" data-index="0">A. 4%</button>
                <button class="quiz-option" data-index="1">B. 3.5%</button>
                <button class="quiz-option" data-index="2">C. 5%</button>
                <button class="quiz-option" data-index="3">D. 3%</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <h3>🎉 Hoàn thành!</h3>
                <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 2 Nâng Cao - Module B</p>
            <p>© 2024 GEM Trading. All rights reserved.</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 3;
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
                        res.textContent = ''✗ Chưa đúng.'';
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
    <title>Bài 8.3: Cơ Hội Đối Tác - GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #FFBD59; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #FFBD59, #F59E0B); color: #0a0a0f; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .module-badge { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 0.5rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #FFBD59; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #FFBD59, #F59E0B); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(255,189,89,0.1), rgba(245,158,11,0.1)); border: 1px solid rgba(255,189,89,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        ul { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #FFBD59; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }

        /* CTV Tier Table */
        .tier-table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.85rem; }
        .tier-table th { background: #1a1a2e; color: #FFBD59; padding: 0.75rem 0.5rem; text-align: center; border: 1px solid #27272a; }
        .tier-table td { padding: 0.75rem 0.5rem; text-align: center; border: 1px solid #27272a; background: #0f0f1a; }
        .tier-table tr:hover td { background: #1a1a2e; }
        .tier-icon { font-size: 1.1rem; }

        /* Partner Cards */
        .partner-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #FFBD59; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .partner-card h4 { color: #FFBD59; font-size: 1.1rem; margin-bottom: 0.75rem; }
        .benefit-list { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin: 0.75rem 0; }
        .benefit-item { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
        .benefit-item:last-child { margin-bottom: 0; }
        .benefit-item .check { color: #10B981; }

        /* Comparison Grid */
        .comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }
        .comparison-card { background: #1a1a2e; border-radius: 12px; padding: 1.25rem; }
        .comparison-card h5 { color: #FFBD59; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .comparison-card.kol { border: 2px solid #8B5CF6; }
        .comparison-card.kol h5 { color: #8B5CF6; }

        /* Quiz styles */
        .quiz-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #8B5CF6; }
        .quiz-title { font-size: 1.25rem; font-weight: 600; color: #8B5CF6; margin-bottom: 1rem; }
        .quiz-question { background: #1a1a2e; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
        .quiz-question p { font-weight: 600; color: #ffffff; margin-bottom: 0.75rem; }
        .quiz-option { display: block; width: 100%; padding: 0.75rem 1rem; margin-bottom: 0.5rem; background: #0f0f1a; border: 2px solid #27272a; border-radius: 8px; color: #d4d4d8; cursor: pointer; text-align: left; transition: all 0.2s; }
        .quiz-option:hover { border-color: #8B5CF6; background: rgba(139,92,246,0.1); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { display: none; padding: 0.75rem; border-radius: 8px; margin-top: 0.5rem; font-weight: 600; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { display: none; text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(255,189,89,0.1), rgba(16,185,129,0.1)); border-radius: 12px; margin-top: 1rem; }
        .quiz-score.show { display: block; }
        .quiz-score h3 { color: #FFBD59; margin-bottom: 0.5rem; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }

        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .tier-table { font-size: 0.7rem; }
            .tier-table th, .tier-table td { padding: 0.4rem 0.25rem; }
            .comparison-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 2 - Nâng Cao</span>
            <span class="module-badge">MODULE B</span>
            <h1 class="lesson-title">Cơ Hội Đối Tác</h1>
            <p class="lesson-subtitle">CTV & KOL Affiliate Program - Chi Tiết Đầy Đủ</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🤝</div>
            <h2 class="section-title">Tổng Quan Chương Trình</h2>
            <p>Sau khi hoàn thành TIER 2, bạn đã có kiến thức vững chắc và có thể cân nhắc tham gia <strong style="color: #FFBD59;">Chương Trình Đối Tác GEM</strong> để tạo nguồn thu nhập bổ sung.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Lợi Thế TIER 2:</strong> Với kiến thức nâng cao, bạn có thể chia sẻ giá trị thật sự cho người mới và xây dựng uy tín trong cộng đồng.</p>
            </div>

            <p>GEM có <strong>2 chương trình đối tác</strong>:</p>
            <div class="comparison-grid">
                <div class="comparison-card">
                    <h5>🥇 CTV (Cộng Tác Viên)</h5>
                    <ul style="padding-left: 1rem; margin: 0;">
                        <li>Ai cũng đăng ký được</li>
                        <li>5 cấp bậc: Bronze → Diamond</li>
                        <li>Commission 10-30%</li>
                        <li>Auto-approve sau 3 ngày</li>
                    </ul>
                </div>
                <div class="comparison-card kol">
                    <h5>⭐ KOL Affiliate</h5>
                    <ul style="padding-left: 1rem; margin: 0;">
                        <li>Yêu cầu 20K+ followers</li>
                        <li>Flat rate: 20% cả Digital & Physical</li>
                        <li>Sub-affiliate: 3.5%</li>
                        <li>Admin duyệt thủ công</li>
                    </ul>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=CTV+vs+KOL+Comparison" alt="Program Comparison">
                <p class="image-caption">So sánh CTV và KOL Affiliate</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Bảng Hoa Hồng CTV - Đầy Đủ</h2>
            <p>Chương trình CTV có <strong>5 cấp bậc</strong> với hoa hồng tăng theo doanh số tích lũy:</p>

            <table class="tier-table">
                <thead>
                    <tr>
                        <th>Cấp Bậc</th>
                        <th>Ngưỡng (VND)</th>
                        <th>Digital</th>
                        <th>Physical</th>
                        <th>Sub-Aff</th>
                        <th>Thanh toán</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><span class="tier-icon">🥉</span> Bronze</td>
                        <td>0</td>
                        <td><strong style="color: #10B981;">10%</strong></td>
                        <td>6%</td>
                        <td>2%</td>
                        <td>Hàng tháng</td>
                    </tr>
                    <tr>
                        <td><span class="tier-icon">🥈</span> Silver</td>
                        <td>50M</td>
                        <td><strong style="color: #10B981;">15%</strong></td>
                        <td>8%</td>
                        <td>2.5%</td>
                        <td>Hàng tháng</td>
                    </tr>
                    <tr>
                        <td><span class="tier-icon">🥇</span> Gold</td>
                        <td>150M</td>
                        <td><strong style="color: #10B981;">20%</strong></td>
                        <td>10%</td>
                        <td>3%</td>
                        <td>2 lần/tháng</td>
                    </tr>
                    <tr>
                        <td><span class="tier-icon">💎</span> Platinum</td>
                        <td>400M</td>
                        <td><strong style="color: #10B981;">25%</strong></td>
                        <td>12%</td>
                        <td>3.5%</td>
                        <td>Hàng tuần</td>
                    </tr>
                    <tr>
                        <td><span class="tier-icon">👑</span> Diamond</td>
                        <td>800M</td>
                        <td><strong style="color: #10B981;">30%</strong></td>
                        <td>15%</td>
                        <td>4%</td>
                        <td>Hàng tuần</td>
                    </tr>
                </tbody>
            </table>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>📝 Lưu ý quan trọng:</strong><br>
                • <strong>Thăng cấp:</strong> Tự động khi đạt ngưỡng doanh số<br>
                • <strong>Giữ cấp:</strong> Cần duy trì 10% threshold mỗi tháng<br>
                • <strong>Giảm cấp:</strong> Nếu doanh số tháng < 10% threshold</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⭐</div>
            <h2 class="section-title">KOL Affiliate - Chi Tiết</h2>
            <p>Dành cho influencers có lượng followers lớn:</p>

            <div class="partner-card" style="border-color: #8B5CF6;">
                <h4 style="color: #8B5CF6;">⭐ Chương Trình KOL Affiliate</h4>
                <p><strong>Điều kiện BẮT BUỘC:</strong> 20,000+ followers (không có ngoại lệ)</p>
                <div class="benefit-list">
                    <div class="benefit-item"><span class="check">✓</span> Digital Products: <strong style="color: #10B981;">20%</strong></div>
                    <div class="benefit-item"><span class="check">✓</span> Physical Products: <strong style="color: #10B981;">20%</strong></div>
                    <div class="benefit-item"><span class="check">✓</span> Sub-Affiliate: <strong style="color: #10B981;">3.5%</strong></div>
                    <div class="benefit-item"><span class="check">✓</span> Thanh toán: 2 lần/tháng (ngày 1 và 15)</div>
                    <div class="benefit-item"><span class="check">✓</span> Platforms: YouTube, Facebook, TikTok, Instagram, Twitter, Discord, Telegram</div>
                </div>
            </div>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>⚠️ Quan trọng:</strong> Dù đã là CTV, bạn vẫn PHẢI có 20K+ followers để đăng ký KOL. Không có ngoại lệ nào cho quy tắc này.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=KOL+Affiliate+Benefits" alt="KOL Benefits">
                <p class="image-caption">Lợi ích của chương trình KOL Affiliate</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">💰</div>
            <h2 class="section-title">Sub-Affiliate System</h2>
            <p>Hệ thống Sub-Affiliate cho phép bạn kiếm thêm từ những CTV/KOL mà bạn giới thiệu:</p>

            <div class="partner-card">
                <h4>📊 Cách Hoạt Động Sub-Affiliate</h4>
                <div class="benefit-list">
                    <div class="benefit-item"><span class="check">1.</span> Bạn (A) giới thiệu người B đăng ký CTV/KOL</div>
                    <div class="benefit-item"><span class="check">2.</span> B bán hàng → B nhận commission chính</div>
                    <div class="benefit-item"><span class="check">3.</span> Bạn (A) nhận Sub-Aff % từ doanh số của B</div>
                </div>
                <p style="margin-top: 1rem;"><strong>Ví dụ:</strong> Bạn là CTV Gold (Sub-Aff 3%), B bán 10 triệu → Bạn nhận 300k từ B.</p>
            </div>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Chiến lược:</strong> Xây dựng team CTV dưới bạn để tạo nguồn thu nhập passive từ Sub-Affiliate.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🚀</div>
            <h2 class="section-title">Cách Bắt Đầu</h2>
            <p>Quy trình đăng ký đơn giản:</p>

            <ul>
                <li><strong>CTV:</strong> App GEM → Account → Affiliate → Đăng ký CTV → Auto-approve sau 3 ngày</li>
                <li><strong>KOL:</strong> Cần có 20K+ followers → Submit links profile → Admin review</li>
            </ul>

            <div class="partner-card" style="border-color: #10B981;">
                <h4 style="color: #10B981;">✅ Sau Khi Được Duyệt</h4>
                <div class="benefit-list">
                    <div class="benefit-item"><span class="check">✓</span> Nhận link referral cá nhân</div>
                    <div class="benefit-item"><span class="check">✓</span> Truy cập Partner Dashboard</div>
                    <div class="benefit-item"><span class="check">✓</span> Marketing materials có sẵn</div>
                    <div class="benefit-item"><span class="check">✓</span> Track earnings realtime</div>
                </div>
            </div>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="2">
                <p>1. Hoa hồng Digital cao nhất của CTV là bao nhiêu?</p>
                <button class="quiz-option" data-index="0">A. 20% (Gold)</button>
                <button class="quiz-option" data-index="1">B. 25% (Platinum)</button>
                <button class="quiz-option" data-index="2">C. 30% (Diamond)</button>
                <button class="quiz-option" data-index="3">D. 40%</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p>2. Yêu cầu để đăng ký KOL Affiliate là gì?</p>
                <button class="quiz-option" data-index="0">A. Hoàn thành TIER 2</button>
                <button class="quiz-option" data-index="1">B. 20,000+ followers (bắt buộc)</button>
                <button class="quiz-option" data-index="2">C. Là CTV Gold trở lên</button>
                <button class="quiz-option" data-index="3">D. Không có yêu cầu</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p>3. Sub-Affiliate rate của CTV Diamond là bao nhiêu?</p>
                <button class="quiz-option" data-index="0">A. 4%</button>
                <button class="quiz-option" data-index="1">B. 3.5%</button>
                <button class="quiz-option" data-index="2">C. 5%</button>
                <button class="quiz-option" data-index="3">D. 3%</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <h3>🎉 Hoàn thành!</h3>
                <p>Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi</p>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 2 Nâng Cao - Module B</p>
            <p>© 2024 GEM Trading. All rights reserved.</p>
        </footer>
    </div>

    <script>
        const totalQuestions = 3;
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
                        res.textContent = ''✗ Chưa đúng.'';
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

-- Lesson 8.4: Câu Chuyện Thành Công - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch8-l4',
  'module-tier-2-ch8',
  'course-tier2-trading-advanced',
  'Bài 8.4: Câu Chuyện Thành Công - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 8.4: Câu Chuyện Thành Công - GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #0a0a0f; color: #e4e4e7; line-height: 1.6; font-size: 16px; }
        .container { max-width: 680px; margin: 0 auto; background: #0a0a0f; }
        .lesson-header { padding: 1rem; background: linear-gradient(135deg, rgba(255, 189, 89, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border-bottom: 1px solid rgba(255, 189, 89, 0.2); }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%); color: #000; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #ffffff; margin-bottom: 0.25rem; }
        .lesson-subtitle { font-size: 0.875rem; color: #a1a1aa; }
        .content-card { background: #18181b; margin-bottom: 0.5rem; }
        .card-header { display: flex; align-items: center; padding: 1rem; gap: 0.75rem; }
        .card-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; }
        .card-icon.gold { background: rgba(255, 189, 89, 0.2); }
        .card-icon.green { background: rgba(16, 185, 129, 0.2); }
        .card-icon.purple { background: rgba(139, 92, 246, 0.2); }
        .card-icon.cyan { background: rgba(0, 240, 255, 0.2); }
        .card-meta h3 { font-size: 0.9375rem; font-weight: 600; color: #ffffff; }
        .card-meta span { font-size: 0.75rem; color: #71717a; }
        .card-body { padding: 0 1rem 1rem 1rem; }
        .card-body p { color: #d4d4d8; margin-bottom: 0.75rem; }
        .image-container { margin: 1rem 0; border-radius: 0.5rem; overflow: hidden; }
        .image-container img { width: 100%; height: auto; display: block; }
        .image-caption { font-size: 0.75rem; color: #71717a; text-align: center; padding: 0.5rem; background: rgba(0, 0, 0, 0.3); }
        .story-card { background: rgba(255, 189, 89, 0.08); border: 1px solid rgba(255, 189, 89, 0.2); border-radius: 0.75rem; padding: 1.25rem; margin: 1rem 0; }
        .story-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
        .story-avatar { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
        .story-info h4 { font-weight: 600; color: #FFBD59; }
        .story-info span { font-size: 0.75rem; color: #71717a; }
        .story-content { font-size: 0.9375rem; color: #d4d4d8; line-height: 1.7; }
        .story-content em { color: #FFBD59; font-style: normal; font-weight: 500; }
        .story-stats { display: flex; gap: 1rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
        .stat-item { text-align: center; }
        .stat-value { font-size: 1.25rem; font-weight: 700; color: #10B981; }
        .stat-label { font-size: 0.6875rem; color: #71717a; }
        .quote-box { background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(100, 50, 200, 0.15) 100%); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 0.75rem; padding: 1.25rem; margin: 1rem 0; text-align: center; }
        .quote-text { font-size: 1.125rem; font-style: italic; color: #fff; margin-bottom: 0.5rem; }
        .quote-author { font-size: 0.8125rem; color: #8B5CF6; }
        .summary-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: 0.75rem; padding: 1.25rem; margin: 1rem; }
        .summary-box h3 { color: #FFBD59; font-size: 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-list { list-style: none; padding: 0; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; color: #d4d4d8; }
        .summary-list li::before { content: "✓"; position: absolute; left: 0; color: #FFBD59; font-weight: bold; }
        .quiz-section { background: #18181b; margin: 0.5rem 0; padding: 1.5rem 1rem; }
        .quiz-section h3 { color: #ffffff; font-size: 1.125rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .quiz-question { background: rgba(255, 189, 89, 0.05); border: 1px solid rgba(255, 189, 89, 0.2); border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem; }
        .quiz-question p { font-weight: 500; color: #fff; margin-bottom: 0.75rem; }
        .quiz-option { display: block; width: 100%; text-align: left; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem; padding: 0.75rem 1rem; margin-bottom: 0.5rem; color: #d4d4d8; cursor: pointer; transition: all 0.2s ease; }
        .quiz-option:hover { background: rgba(255, 189, 89, 0.1); border-color: rgba(255, 189, 89, 0.3); }
        .quiz-option.correct { background: rgba(16, 185, 129, 0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239, 68, 68, 0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { display: none; padding: 0.75rem; border-radius: 0.5rem; margin-top: 0.75rem; font-weight: 500; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.1); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.1); color: #EF4444; }
        .quiz-score { display: none; text-align: center; padding: 1rem; background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%); border-radius: 0.75rem; margin-top: 1rem; }
        .quiz-score.show { display: block; }
        .quiz-score .score-text { font-size: 1.5rem; font-weight: 700; color: #FFBD59; }
        .quiz-score .score-label { font-size: 0.875rem; color: #a1a1aa; }
        .retake-btn { background: linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%); color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { padding: 1.5rem 1rem; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1); }
        .footer-logo { font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, #FFBD59 0%, #8B5CF6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .footer-text { font-size: 0.75rem; color: #71717a; margin-top: 0.25rem; }
        @media (max-width: 600px) { .container { padding: 0; } .content-card { border-radius: 0; border-left: none; border-right: none; } .lesson-title { font-size: 1.25rem; } }
        @media (min-width: 600px) { .container { padding: 1.5rem; } .content-card { border-radius: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.1); } }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="lesson-badge">🌟 Module B - Chương 8</span>
            <h1 class="lesson-title">Bài 8.4: Câu Chuyện Thành Công</h1>
            <p class="lesson-subtitle">Học hỏi từ những traders đã thành công với GEM Method</p>
        </header>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">🏆</div>
                <div class="card-meta">
                    <h3>Những Traders Đã Thành Công</h3>
                    <span>Real stories, real results</span>
                </div>
            </div>
            <div class="card-body">
                <p>Những câu chuyện dưới đây là từ những traders thực sự đã áp dụng GEM Method và đạt được kết quả. Họ đều bắt đầu từ con số 0 giống như bạn.</p>
                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/FFBD59?text=Success+Stories" alt="Success Stories">
                    <p class="image-caption">Hình 8.4.1: Câu chuyện từ GEM Community</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">📈</div>
                <div class="card-meta">
                    <h3>Story #1: Minh - From Zero to Consistent</h3>
                    <span>6 tháng journey</span>
                </div>
            </div>
            <div class="card-body">
                <div class="story-card">
                    <div class="story-header">
                        <div class="story-avatar">M</div>
                        <div class="story-info">
                            <h4>Minh Nguyễn</h4>
                            <span>Kỹ sư IT • Hà Nội</span>
                        </div>
                    </div>
                    <div class="story-content">
                        <p>"Tôi đã mất <em>2 năm trade random</em>, thua tổng cộng $8,000. Không có method, không có kỷ luật, chỉ trade theo cảm xúc và tin tức.</p>
                        <p>Khi tìm thấy GEM Method, mọi thứ thay đổi. <em>100 paper trades đầu tiên</em> giúp tôi hiểu ra trading là về process, không phải luck.</p>
                        <p>Sau 6 tháng: <em>3 tháng liên tiếp profitable</em>. Thu nhập từ trading đã bằng 50% lương IT. Kế hoạch của tôi là full-time trader trong 2 năm tới."</p>
                    </div>
                    <div class="story-stats">
                        <div class="stat-item"><div class="stat-value">52%</div><div class="stat-label">Win Rate</div></div>
                        <div class="stat-item"><div class="stat-value">1:2.3</div><div class="stat-label">Avg R:R</div></div>
                        <div class="stat-item"><div class="stat-value">+15%</div><div class="stat-label">Monthly ROI</div></div>
                    </div>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">👩‍💼</div>
                <div class="card-meta">
                    <h3>Story #2: Linh - Part-time to Full Income</h3>
                    <span>Trading + Partner combo</span>
                </div>
            </div>
            <div class="card-body">
                <div class="story-card">
                    <div class="story-header">
                        <div class="story-avatar">L</div>
                        <div class="story-info">
                            <h4>Linh Trần</h4>
                            <span>Marketing Manager • TP.HCM</span>
                        </div>
                    </div>
                    <div class="story-content">
                        <p>"Tôi vừa trade vừa làm Partner Program. <em>Network marketing của tôi</em> phù hợp với việc giới thiệu GEM cho bạn bè.</p>
                        <p>Kết quả: <em>Trading income + Partner income</em> đã cao hơn lương full-time. Tôi vừa nghỉ việc và focus 100% vào trading và building community.</p>
                        <p>Bí quyết: <em>Consistency over speed</em>. Không cố làm nhanh, làm đúng từng bước."</p>
                    </div>
                    <div class="story-stats">
                        <div class="stat-item"><div class="stat-value">48%</div><div class="stat-label">Win Rate</div></div>
                        <div class="stat-item"><div class="stat-value">$2,500</div><div class="stat-label">Partner/month</div></div>
                        <div class="stat-item"><div class="stat-value">25</div><div class="stat-label">Referrals</div></div>
                    </div>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">🎓</div>
                <div class="card-meta">
                    <h3>Story #3: Đức - Student to Pro Trader</h3>
                    <span>TIER 3 accelerated journey</span>
                </div>
            </div>
            <div class="card-body">
                <div class="story-card">
                    <div class="story-header">
                        <div class="story-avatar">Đ</div>
                        <div class="story-info">
                            <h4>Đức Phạm</h4>
                            <span>Former University Student • Đà Nẵng</span>
                        </div>
                    </div>
                    <div class="story-content">
                        <p>"Tôi bắt đầu khi còn sinh viên, với vốn chỉ $500. Sau TIER 2, tôi quyết định đầu tư vào <em>TIER 3 + 1-1 Coaching</em>.</p>
                        <p>Đó là quyết định tốt nhất. Mentor giúp tôi <em>tránh 90% mistakes</em> mà tôi sẽ mắc phải nếu tự học.</p>
                        <p>Hiện tại: Full-time trader, <em>thu nhập gấp 5 lần</em> mức lương entry-level của ngành tôi học."</p>
                    </div>
                    <div class="story-stats">
                        <div class="stat-item"><div class="stat-value">55%</div><div class="stat-label">Win Rate</div></div>
                        <div class="stat-item"><div class="stat-value">1:2.8</div><div class="stat-label">Avg R:R</div></div>
                        <div class="stat-item"><div class="stat-value">8</div><div class="stat-label">Months to Pro</div></div>
                    </div>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">💡</div>
                <div class="card-meta">
                    <h3>Bài Học Chung</h3>
                    <span>What successful traders have in common</span>
                </div>
            </div>
            <div class="card-body">
                <div class="quote-box">
                    <div class="quote-text">"Không ai thành công overnight. Nhưng ai cũng có thể thành công nếu commit đủ lâu."</div>
                    <div class="quote-author">— GEM Community</div>
                </div>
                <p><strong>Common patterns từ successful traders:</strong></p>
                <ul class="summary-list">
                    <li>Đều hoàn thành đủ paper trades trước khi live</li>
                    <li>Tuân thủ method 100%, không deviate</li>
                    <li>Journal và review trades regularly</li>
                    <li>Không give up dù có drawdowns</li>
                    <li>Tìm kiếm support từ community/mentor khi cần</li>
                </ul>
            </div>
        </article>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Success stories đến từ traders bình thường như bạn</li>
                <li>Common factor: Consistency, discipline, và patience</li>
                <li>Combo Trading + Partner income có thể replace full-time job</li>
                <li>TIER 3 + Coaching accelerate journey đáng kể</li>
                <li>Key: Commit to process, results will follow</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h3>🎯 Kiểm Tra Kiến Thức</h3>
            <div class="quiz-question" data-correct="0">
                <p><strong>Câu 1:</strong> Yếu tố chung của những traders thành công là gì?</p>
                <button class="quiz-option" data-index="0">Consistency, discipline, và patience</button>
                <button class="quiz-option" data-index="1">May mắn và timing tốt</button>
                <button class="quiz-option" data-index="2">Vốn ban đầu lớn</button>
                <button class="quiz-option" data-index="3">Sử dụng nhiều indicators</button>
                <div class="quiz-result"></div>
            </div>
            <div class="quiz-question" data-correct="2">
                <p><strong>Câu 2:</strong> Đức đã làm gì để accelerate journey của mình?</p>
                <button class="quiz-option" data-index="0">Trade với leverage cao</button>
                <button class="quiz-option" data-index="1">Copy trades từ người khác</button>
                <button class="quiz-option" data-index="2">Đầu tư vào TIER 3 + 1-1 Coaching</button>
                <button class="quiz-option" data-index="3">Bỏ paper trading đi live ngay</button>
                <div class="quiz-result"></div>
            </div>
            <div class="quiz-score">
                <div class="score-text"><span id="correct-count">0</span>/2</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <div class="footer-logo">GEM Trading Academy</div>
            <p class="footer-text">Module B - Cơ Hội & Lựa Chọn • Bài 8.4</p>
        </footer>
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
</html>
',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 8.4: Câu Chuyện Thành Công - GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #0a0a0f; color: #e4e4e7; line-height: 1.6; font-size: 16px; }
        .container { max-width: 680px; margin: 0 auto; background: #0a0a0f; }
        .lesson-header { padding: 1rem; background: linear-gradient(135deg, rgba(255, 189, 89, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border-bottom: 1px solid rgba(255, 189, 89, 0.2); }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%); color: #000; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #ffffff; margin-bottom: 0.25rem; }
        .lesson-subtitle { font-size: 0.875rem; color: #a1a1aa; }
        .content-card { background: #18181b; margin-bottom: 0.5rem; }
        .card-header { display: flex; align-items: center; padding: 1rem; gap: 0.75rem; }
        .card-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; }
        .card-icon.gold { background: rgba(255, 189, 89, 0.2); }
        .card-icon.green { background: rgba(16, 185, 129, 0.2); }
        .card-icon.purple { background: rgba(139, 92, 246, 0.2); }
        .card-icon.cyan { background: rgba(0, 240, 255, 0.2); }
        .card-meta h3 { font-size: 0.9375rem; font-weight: 600; color: #ffffff; }
        .card-meta span { font-size: 0.75rem; color: #71717a; }
        .card-body { padding: 0 1rem 1rem 1rem; }
        .card-body p { color: #d4d4d8; margin-bottom: 0.75rem; }
        .image-container { margin: 1rem 0; border-radius: 0.5rem; overflow: hidden; }
        .image-container img { width: 100%; height: auto; display: block; }
        .image-caption { font-size: 0.75rem; color: #71717a; text-align: center; padding: 0.5rem; background: rgba(0, 0, 0, 0.3); }
        .story-card { background: rgba(255, 189, 89, 0.08); border: 1px solid rgba(255, 189, 89, 0.2); border-radius: 0.75rem; padding: 1.25rem; margin: 1rem 0; }
        .story-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
        .story-avatar { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
        .story-info h4 { font-weight: 600; color: #FFBD59; }
        .story-info span { font-size: 0.75rem; color: #71717a; }
        .story-content { font-size: 0.9375rem; color: #d4d4d8; line-height: 1.7; }
        .story-content em { color: #FFBD59; font-style: normal; font-weight: 500; }
        .story-stats { display: flex; gap: 1rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
        .stat-item { text-align: center; }
        .stat-value { font-size: 1.25rem; font-weight: 700; color: #10B981; }
        .stat-label { font-size: 0.6875rem; color: #71717a; }
        .quote-box { background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(100, 50, 200, 0.15) 100%); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 0.75rem; padding: 1.25rem; margin: 1rem 0; text-align: center; }
        .quote-text { font-size: 1.125rem; font-style: italic; color: #fff; margin-bottom: 0.5rem; }
        .quote-author { font-size: 0.8125rem; color: #8B5CF6; }
        .summary-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: 0.75rem; padding: 1.25rem; margin: 1rem; }
        .summary-box h3 { color: #FFBD59; font-size: 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-list { list-style: none; padding: 0; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; color: #d4d4d8; }
        .summary-list li::before { content: "✓"; position: absolute; left: 0; color: #FFBD59; font-weight: bold; }
        .quiz-section { background: #18181b; margin: 0.5rem 0; padding: 1.5rem 1rem; }
        .quiz-section h3 { color: #ffffff; font-size: 1.125rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .quiz-question { background: rgba(255, 189, 89, 0.05); border: 1px solid rgba(255, 189, 89, 0.2); border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem; }
        .quiz-question p { font-weight: 500; color: #fff; margin-bottom: 0.75rem; }
        .quiz-option { display: block; width: 100%; text-align: left; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem; padding: 0.75rem 1rem; margin-bottom: 0.5rem; color: #d4d4d8; cursor: pointer; transition: all 0.2s ease; }
        .quiz-option:hover { background: rgba(255, 189, 89, 0.1); border-color: rgba(255, 189, 89, 0.3); }
        .quiz-option.correct { background: rgba(16, 185, 129, 0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239, 68, 68, 0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { display: none; padding: 0.75rem; border-radius: 0.5rem; margin-top: 0.75rem; font-weight: 500; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.1); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.1); color: #EF4444; }
        .quiz-score { display: none; text-align: center; padding: 1rem; background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%); border-radius: 0.75rem; margin-top: 1rem; }
        .quiz-score.show { display: block; }
        .quiz-score .score-text { font-size: 1.5rem; font-weight: 700; color: #FFBD59; }
        .quiz-score .score-label { font-size: 0.875rem; color: #a1a1aa; }
        .retake-btn { background: linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%); color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { padding: 1.5rem 1rem; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1); }
        .footer-logo { font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, #FFBD59 0%, #8B5CF6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .footer-text { font-size: 0.75rem; color: #71717a; margin-top: 0.25rem; }
        @media (max-width: 600px) { .container { padding: 0; } .content-card { border-radius: 0; border-left: none; border-right: none; } .lesson-title { font-size: 1.25rem; } }
        @media (min-width: 600px) { .container { padding: 1.5rem; } .content-card { border-radius: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.1); } }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="lesson-badge">🌟 Module B - Chương 8</span>
            <h1 class="lesson-title">Bài 8.4: Câu Chuyện Thành Công</h1>
            <p class="lesson-subtitle">Học hỏi từ những traders đã thành công với GEM Method</p>
        </header>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">🏆</div>
                <div class="card-meta">
                    <h3>Những Traders Đã Thành Công</h3>
                    <span>Real stories, real results</span>
                </div>
            </div>
            <div class="card-body">
                <p>Những câu chuyện dưới đây là từ những traders thực sự đã áp dụng GEM Method và đạt được kết quả. Họ đều bắt đầu từ con số 0 giống như bạn.</p>
                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/FFBD59?text=Success+Stories" alt="Success Stories">
                    <p class="image-caption">Hình 8.4.1: Câu chuyện từ GEM Community</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">📈</div>
                <div class="card-meta">
                    <h3>Story #1: Minh - From Zero to Consistent</h3>
                    <span>6 tháng journey</span>
                </div>
            </div>
            <div class="card-body">
                <div class="story-card">
                    <div class="story-header">
                        <div class="story-avatar">M</div>
                        <div class="story-info">
                            <h4>Minh Nguyễn</h4>
                            <span>Kỹ sư IT • Hà Nội</span>
                        </div>
                    </div>
                    <div class="story-content">
                        <p>"Tôi đã mất <em>2 năm trade random</em>, thua tổng cộng $8,000. Không có method, không có kỷ luật, chỉ trade theo cảm xúc và tin tức.</p>
                        <p>Khi tìm thấy GEM Method, mọi thứ thay đổi. <em>100 paper trades đầu tiên</em> giúp tôi hiểu ra trading là về process, không phải luck.</p>
                        <p>Sau 6 tháng: <em>3 tháng liên tiếp profitable</em>. Thu nhập từ trading đã bằng 50% lương IT. Kế hoạch của tôi là full-time trader trong 2 năm tới."</p>
                    </div>
                    <div class="story-stats">
                        <div class="stat-item"><div class="stat-value">52%</div><div class="stat-label">Win Rate</div></div>
                        <div class="stat-item"><div class="stat-value">1:2.3</div><div class="stat-label">Avg R:R</div></div>
                        <div class="stat-item"><div class="stat-value">+15%</div><div class="stat-label">Monthly ROI</div></div>
                    </div>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">👩‍💼</div>
                <div class="card-meta">
                    <h3>Story #2: Linh - Part-time to Full Income</h3>
                    <span>Trading + Partner combo</span>
                </div>
            </div>
            <div class="card-body">
                <div class="story-card">
                    <div class="story-header">
                        <div class="story-avatar">L</div>
                        <div class="story-info">
                            <h4>Linh Trần</h4>
                            <span>Marketing Manager • TP.HCM</span>
                        </div>
                    </div>
                    <div class="story-content">
                        <p>"Tôi vừa trade vừa làm Partner Program. <em>Network marketing của tôi</em> phù hợp với việc giới thiệu GEM cho bạn bè.</p>
                        <p>Kết quả: <em>Trading income + Partner income</em> đã cao hơn lương full-time. Tôi vừa nghỉ việc và focus 100% vào trading và building community.</p>
                        <p>Bí quyết: <em>Consistency over speed</em>. Không cố làm nhanh, làm đúng từng bước."</p>
                    </div>
                    <div class="story-stats">
                        <div class="stat-item"><div class="stat-value">48%</div><div class="stat-label">Win Rate</div></div>
                        <div class="stat-item"><div class="stat-value">$2,500</div><div class="stat-label">Partner/month</div></div>
                        <div class="stat-item"><div class="stat-value">25</div><div class="stat-label">Referrals</div></div>
                    </div>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">🎓</div>
                <div class="card-meta">
                    <h3>Story #3: Đức - Student to Pro Trader</h3>
                    <span>TIER 3 accelerated journey</span>
                </div>
            </div>
            <div class="card-body">
                <div class="story-card">
                    <div class="story-header">
                        <div class="story-avatar">Đ</div>
                        <div class="story-info">
                            <h4>Đức Phạm</h4>
                            <span>Former University Student • Đà Nẵng</span>
                        </div>
                    </div>
                    <div class="story-content">
                        <p>"Tôi bắt đầu khi còn sinh viên, với vốn chỉ $500. Sau TIER 2, tôi quyết định đầu tư vào <em>TIER 3 + 1-1 Coaching</em>.</p>
                        <p>Đó là quyết định tốt nhất. Mentor giúp tôi <em>tránh 90% mistakes</em> mà tôi sẽ mắc phải nếu tự học.</p>
                        <p>Hiện tại: Full-time trader, <em>thu nhập gấp 5 lần</em> mức lương entry-level của ngành tôi học."</p>
                    </div>
                    <div class="story-stats">
                        <div class="stat-item"><div class="stat-value">55%</div><div class="stat-label">Win Rate</div></div>
                        <div class="stat-item"><div class="stat-value">1:2.8</div><div class="stat-label">Avg R:R</div></div>
                        <div class="stat-item"><div class="stat-value">8</div><div class="stat-label">Months to Pro</div></div>
                    </div>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">💡</div>
                <div class="card-meta">
                    <h3>Bài Học Chung</h3>
                    <span>What successful traders have in common</span>
                </div>
            </div>
            <div class="card-body">
                <div class="quote-box">
                    <div class="quote-text">"Không ai thành công overnight. Nhưng ai cũng có thể thành công nếu commit đủ lâu."</div>
                    <div class="quote-author">— GEM Community</div>
                </div>
                <p><strong>Common patterns từ successful traders:</strong></p>
                <ul class="summary-list">
                    <li>Đều hoàn thành đủ paper trades trước khi live</li>
                    <li>Tuân thủ method 100%, không deviate</li>
                    <li>Journal và review trades regularly</li>
                    <li>Không give up dù có drawdowns</li>
                    <li>Tìm kiếm support từ community/mentor khi cần</li>
                </ul>
            </div>
        </article>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Success stories đến từ traders bình thường như bạn</li>
                <li>Common factor: Consistency, discipline, và patience</li>
                <li>Combo Trading + Partner income có thể replace full-time job</li>
                <li>TIER 3 + Coaching accelerate journey đáng kể</li>
                <li>Key: Commit to process, results will follow</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h3>🎯 Kiểm Tra Kiến Thức</h3>
            <div class="quiz-question" data-correct="0">
                <p><strong>Câu 1:</strong> Yếu tố chung của những traders thành công là gì?</p>
                <button class="quiz-option" data-index="0">Consistency, discipline, và patience</button>
                <button class="quiz-option" data-index="1">May mắn và timing tốt</button>
                <button class="quiz-option" data-index="2">Vốn ban đầu lớn</button>
                <button class="quiz-option" data-index="3">Sử dụng nhiều indicators</button>
                <div class="quiz-result"></div>
            </div>
            <div class="quiz-question" data-correct="2">
                <p><strong>Câu 2:</strong> Đức đã làm gì để accelerate journey của mình?</p>
                <button class="quiz-option" data-index="0">Trade với leverage cao</button>
                <button class="quiz-option" data-index="1">Copy trades từ người khác</button>
                <button class="quiz-option" data-index="2">Đầu tư vào TIER 3 + 1-1 Coaching</button>
                <button class="quiz-option" data-index="3">Bỏ paper trading đi live ngay</button>
                <div class="quiz-result"></div>
            </div>
            <div class="quiz-score">
                <div class="score-text"><span id="correct-count">0</span>/2</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <div class="footer-logo">GEM Trading Academy</div>
            <p class="footer-text">Module B - Cơ Hội & Lựa Chọn • Bài 8.4</p>
        </footer>
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

-- Lesson 8.5: Lợi Thế Đi Sớm - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch8-l5',
  'module-tier-2-ch8',
  'course-tier2-trading-advanced',
  'Bài 8.5: Lợi Thế Đi Sớm - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 8.5: Lợi Thế Đi Sớm - GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #0a0a0f; color: #e4e4e7; line-height: 1.6; font-size: 16px; }
        .container { max-width: 680px; margin: 0 auto; background: #0a0a0f; }
        .lesson-header { padding: 1rem; background: linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(255, 189, 89, 0.1) 100%); border-bottom: 1px solid rgba(0, 240, 255, 0.2); }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #00F0FF 0%, #FFBD59 100%); color: #000; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #ffffff; margin-bottom: 0.25rem; }
        .lesson-subtitle { font-size: 0.875rem; color: #a1a1aa; }
        .content-card { background: #18181b; margin-bottom: 0.5rem; }
        .card-header { display: flex; align-items: center; padding: 1rem; gap: 0.75rem; }
        .card-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; }
        .card-icon.cyan { background: rgba(0, 240, 255, 0.2); }
        .card-icon.gold { background: rgba(255, 189, 89, 0.2); }
        .card-icon.green { background: rgba(16, 185, 129, 0.2); }
        .card-icon.purple { background: rgba(139, 92, 246, 0.2); }
        .card-meta h3 { font-size: 0.9375rem; font-weight: 600; color: #ffffff; }
        .card-meta span { font-size: 0.75rem; color: #71717a; }
        .card-body { padding: 0 1rem 1rem 1rem; }
        .card-body p { color: #d4d4d8; margin-bottom: 0.75rem; }
        .styled-list { list-style: none; padding: 0; margin: 1rem 0; }
        .styled-list li { padding: 0.75rem 1rem; background: rgba(0, 240, 255, 0.05); border-left: 3px solid #00F0FF; margin-bottom: 0.5rem; border-radius: 0 0.5rem 0.5rem 0; }
        .styled-list.gold li { background: rgba(255, 189, 89, 0.05); border-left-color: #FFBD59; }
        .styled-list.green li { background: rgba(16, 185, 129, 0.05); border-left-color: #10B981; }
        .image-container { margin: 1rem 0; border-radius: 0.5rem; overflow: hidden; }
        .image-container img { width: 100%; height: auto; display: block; }
        .image-caption { font-size: 0.75rem; color: #71717a; text-align: center; padding: 0.5rem; background: rgba(0, 0, 0, 0.3); }
        .advantage-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin: 1rem 0; }
        .advantage-card { background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 0.75rem; padding: 1rem; text-align: center; }
        .advantage-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .advantage-title { font-weight: 600; color: #00F0FF; font-size: 0.8125rem; margin-bottom: 0.25rem; }
        .advantage-desc { font-size: 0.6875rem; color: #a1a1aa; }
        .urgency-box { background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(255, 189, 89, 0.15) 100%); border: 2px solid rgba(239, 68, 68, 0.3); border-radius: 0.75rem; padding: 1.25rem; margin: 1rem 0; text-align: center; }
        .urgency-title { color: #EF4444; font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; }
        .urgency-text { color: #d4d4d8; font-size: 0.9375rem; }
        .summary-box { background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(255, 189, 89, 0.15) 100%); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 0.75rem; padding: 1.25rem; margin: 1rem; }
        .summary-box h3 { color: #00F0FF; font-size: 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-list { list-style: none; padding: 0; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; color: #d4d4d8; }
        .summary-list li::before { content: "✓"; position: absolute; left: 0; color: #00F0FF; font-weight: bold; }
        .quiz-section { background: #18181b; margin: 0.5rem 0; padding: 1.5rem 1rem; }
        .quiz-section h3 { color: #ffffff; font-size: 1.125rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .quiz-question { background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem; }
        .quiz-question p { font-weight: 500; color: #fff; margin-bottom: 0.75rem; }
        .quiz-option { display: block; width: 100%; text-align: left; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem; padding: 0.75rem 1rem; margin-bottom: 0.5rem; color: #d4d4d8; cursor: pointer; transition: all 0.2s ease; }
        .quiz-option:hover { background: rgba(0, 240, 255, 0.1); border-color: rgba(0, 240, 255, 0.3); }
        .quiz-option.correct { background: rgba(16, 185, 129, 0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239, 68, 68, 0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { display: none; padding: 0.75rem; border-radius: 0.5rem; margin-top: 0.75rem; font-weight: 500; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.1); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.1); color: #EF4444; }
        .quiz-score { display: none; text-align: center; padding: 1rem; background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(255, 189, 89, 0.15) 100%); border-radius: 0.75rem; margin-top: 1rem; }
        .quiz-score.show { display: block; }
        .quiz-score .score-text { font-size: 1.5rem; font-weight: 700; color: #00F0FF; }
        .quiz-score .score-label { font-size: 0.875rem; color: #a1a1aa; }
        .retake-btn { background: linear-gradient(135deg, #00F0FF 0%, #0080FF 100%); color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { padding: 1.5rem 1rem; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1); }
        .footer-logo { font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, #00F0FF 0%, #FFBD59 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .footer-text { font-size: 0.75rem; color: #71717a; margin-top: 0.25rem; }
        @media (max-width: 600px) { .container { padding: 0; } .content-card { border-radius: 0; border-left: none; border-right: none; } .advantage-grid { grid-template-columns: 1fr; } .lesson-title { font-size: 1.25rem; } }
        @media (min-width: 600px) { .container { padding: 1.5rem; } .content-card { border-radius: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.1); } }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="lesson-badge">⚡ Module B - Chương 8</span>
            <h1 class="lesson-title">Bài 8.5: Lợi Thế Đi Sớm</h1>
            <p class="lesson-subtitle">First Mover Advantage - Tại sao timing matters</p>
        </header>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">⏰</div>
                <div class="card-meta">
                    <h3>First Mover Advantage</h3>
                    <span>Người đi sớm có lợi thế</span>
                </div>
            </div>
            <div class="card-body">
                <p>Trong mọi lĩnh vực, <strong>người đi sớm</strong> luôn có lợi thế. Trading và GEM ecosystem cũng vậy.</p>
                <ul class="styled-list">
                    <li><strong>Early Adopters:</strong> Những người học sớm, làm sớm thường thành công hơn</li>
                    <li><strong>Market Growth:</strong> Crypto market vẫn còn non trẻ, cơ hội còn rất lớn</li>
                    <li><strong>GEM Ecosystem:</strong> Đang mở rộng, partner đi sớm được lợi nhiều nhất</li>
                </ul>
                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/00F0FF?text=First+Mover+Advantage" alt="First Mover">
                    <p class="image-caption">Hình 8.5.1: Lợi thế của người đi sớm</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">🚀</div>
                <div class="card-meta">
                    <h3>4 Lợi Thế Cụ Thể</h3>
                    <span>Khi bạn hành động ngay</span>
                </div>
            </div>
            <div class="card-body">
                <div class="advantage-grid">
                    <div class="advantage-card">
                        <div class="advantage-icon">📈</div>
                        <div class="advantage-title">Compound Time</div>
                        <div class="advantage-desc">Bắt đầu sớm = nhiều năm compound hơn</div>
                    </div>
                    <div class="advantage-card">
                        <div class="advantage-icon">🎯</div>
                        <div class="advantage-title">Less Competition</div>
                        <div class="advantage-desc">Thị trường chưa đông, cơ hội rõ ràng hơn</div>
                    </div>
                    <div class="advantage-card">
                        <div class="advantage-icon">💰</div>
                        <div class="advantage-title">Partner Rewards</div>
                        <div class="advantage-desc">Early partners nhận incentives cao hơn</div>
                    </div>
                    <div class="advantage-card">
                        <div class="advantage-icon">🌟</div>
                        <div class="advantage-title">Community Status</div>
                        <div class="advantage-desc">OG members được respect và có influence</div>
                    </div>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">📊</div>
                <div class="card-meta">
                    <h3>Crypto Market Still Early</h3>
                    <span>Adoption vẫn còn thấp</span>
                </div>
            </div>
            <div class="card-body">
                <p>Nhiều người nghĩ đã "trễ" khi vào crypto. Thực tế:</p>
                <ul class="styled-list green">
                    <li><strong>Global Adoption:</strong> Chỉ ~5% dân số thế giới sở hữu crypto</li>
                    <li><strong>Institutional:</strong> Các tổ chức lớn mới bắt đầu tham gia</li>
                    <li><strong>Regulation:</strong> Khung pháp lý đang hình thành, mở đường cho mass adoption</li>
                    <li><strong>Technology:</strong> Blockchain vẫn đang phát triển, use cases mới liên tục</li>
                </ul>
                <p>Nếu internet năm 2000 là "early", thì crypto hiện tại cũng tương đương.</p>
                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/10B981?text=Crypto+Adoption+Curve" alt="Adoption">
                    <p class="image-caption">Hình 8.5.2: Crypto adoption vẫn đang ở early phase</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">⚠️</div>
                <div class="card-meta">
                    <h3>Chi Phí Của Việc Chờ Đợi</h3>
                    <span>Cost of inaction</span>
                </div>
            </div>
            <div class="card-body">
                <div class="urgency-box">
                    <div class="urgency-title">⏳ Mỗi Ngày Chờ Đợi Là Một Ngày Mất Đi</div>
                    <div class="urgency-text">Thời gian là tài sản quý giá nhất. Không thể mua, không thể lấy lại.</div>
                </div>
                <ul class="styled-list gold">
                    <li><strong>Opportunity Cost:</strong> Tiền bạn không kiếm được vì không trade</li>
                    <li><strong>Learning Delay:</strong> Mỗi ngày chờ = 1 ngày chậm hơn đạt profitability</li>
                    <li><strong>Market Cycles:</strong> Miss bull run = phải chờ 4 năm cho cycle tiếp</li>
                    <li><strong>Partner Opportunity:</strong> Network bạn biết sẽ được người khác tiếp cận</li>
                </ul>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">🎯</div>
                <div class="card-meta">
                    <h3>Hành Động Ngay</h3>
                    <span>Action beats perfection</span>
                </div>
            </div>
            <div class="card-body">
                <p>Không cần phải perfect để bắt đầu. Cần bắt đầu để trở nên perfect.</p>
                <ul class="styled-list">
                    <li><strong>Start Paper Trading:</strong> Ngay hôm nay, không cần chờ</li>
                    <li><strong>Join Community:</strong> Kết nối với members, học từ nhau</li>
                    <li><strong>Consider TIER 3:</strong> Nếu muốn fast-track</li>
                    <li><strong>Explore Partnership:</strong> Nếu có network phù hợp</li>
                </ul>
                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/00F0FF?text=Take+Action+Now" alt="Action">
                    <p class="image-caption">Hình 8.5.3: Hành động ngay, hoàn thiện sau</p>
                </div>
            </div>
        </article>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>First Mover Advantage: Người đi sớm luôn có lợi thế</li>
                <li>Crypto vẫn early: Chỉ ~5% adoption toàn cầu</li>
                <li>4 lợi thế: Compound time, less competition, rewards, status</li>
                <li>Cost of waiting: Opportunity cost, learning delay, miss cycles</li>
                <li>Action trumps perfection: Bắt đầu ngay, hoàn thiện dần</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h3>🎯 Kiểm Tra Kiến Thức</h3>
            <div class="quiz-question" data-correct="1">
                <p><strong>Câu 1:</strong> Tỷ lệ adoption crypto toàn cầu hiện tại khoảng bao nhiêu?</p>
                <button class="quiz-option" data-index="0">~50%</button>
                <button class="quiz-option" data-index="1">~5%</button>
                <button class="quiz-option" data-index="2">~25%</button>
                <button class="quiz-option" data-index="3">~75%</button>
                <div class="quiz-result"></div>
            </div>
            <div class="quiz-question" data-correct="0">
                <p><strong>Câu 2:</strong> "First Mover Advantage" nghĩa là gì?</p>
                <button class="quiz-option" data-index="0">Người đi sớm có lợi thế hơn người đến sau</button>
                <button class="quiz-option" data-index="1">Người có nhiều tiền nhất sẽ thắng</button>
                <button class="quiz-option" data-index="2">Chờ đợi là chiến lược tốt nhất</button>
                <button class="quiz-option" data-index="3">Nên đợi market ổn định mới vào</button>
                <div class="quiz-result"></div>
            </div>
            <div class="quiz-score">
                <div class="score-text"><span id="correct-count">0</span>/2</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <div class="footer-logo">GEM Trading Academy</div>
            <p class="footer-text">Module B - Cơ Hội & Lựa Chọn • Bài 8.5</p>
        </footer>
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
</html>
',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 8.5: Lợi Thế Đi Sớm - GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #0a0a0f; color: #e4e4e7; line-height: 1.6; font-size: 16px; }
        .container { max-width: 680px; margin: 0 auto; background: #0a0a0f; }
        .lesson-header { padding: 1rem; background: linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(255, 189, 89, 0.1) 100%); border-bottom: 1px solid rgba(0, 240, 255, 0.2); }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #00F0FF 0%, #FFBD59 100%); color: #000; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #ffffff; margin-bottom: 0.25rem; }
        .lesson-subtitle { font-size: 0.875rem; color: #a1a1aa; }
        .content-card { background: #18181b; margin-bottom: 0.5rem; }
        .card-header { display: flex; align-items: center; padding: 1rem; gap: 0.75rem; }
        .card-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; }
        .card-icon.cyan { background: rgba(0, 240, 255, 0.2); }
        .card-icon.gold { background: rgba(255, 189, 89, 0.2); }
        .card-icon.green { background: rgba(16, 185, 129, 0.2); }
        .card-icon.purple { background: rgba(139, 92, 246, 0.2); }
        .card-meta h3 { font-size: 0.9375rem; font-weight: 600; color: #ffffff; }
        .card-meta span { font-size: 0.75rem; color: #71717a; }
        .card-body { padding: 0 1rem 1rem 1rem; }
        .card-body p { color: #d4d4d8; margin-bottom: 0.75rem; }
        .styled-list { list-style: none; padding: 0; margin: 1rem 0; }
        .styled-list li { padding: 0.75rem 1rem; background: rgba(0, 240, 255, 0.05); border-left: 3px solid #00F0FF; margin-bottom: 0.5rem; border-radius: 0 0.5rem 0.5rem 0; }
        .styled-list.gold li { background: rgba(255, 189, 89, 0.05); border-left-color: #FFBD59; }
        .styled-list.green li { background: rgba(16, 185, 129, 0.05); border-left-color: #10B981; }
        .image-container { margin: 1rem 0; border-radius: 0.5rem; overflow: hidden; }
        .image-container img { width: 100%; height: auto; display: block; }
        .image-caption { font-size: 0.75rem; color: #71717a; text-align: center; padding: 0.5rem; background: rgba(0, 0, 0, 0.3); }
        .advantage-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin: 1rem 0; }
        .advantage-card { background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 0.75rem; padding: 1rem; text-align: center; }
        .advantage-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .advantage-title { font-weight: 600; color: #00F0FF; font-size: 0.8125rem; margin-bottom: 0.25rem; }
        .advantage-desc { font-size: 0.6875rem; color: #a1a1aa; }
        .urgency-box { background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(255, 189, 89, 0.15) 100%); border: 2px solid rgba(239, 68, 68, 0.3); border-radius: 0.75rem; padding: 1.25rem; margin: 1rem 0; text-align: center; }
        .urgency-title { color: #EF4444; font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; }
        .urgency-text { color: #d4d4d8; font-size: 0.9375rem; }
        .summary-box { background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(255, 189, 89, 0.15) 100%); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 0.75rem; padding: 1.25rem; margin: 1rem; }
        .summary-box h3 { color: #00F0FF; font-size: 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-list { list-style: none; padding: 0; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; color: #d4d4d8; }
        .summary-list li::before { content: "✓"; position: absolute; left: 0; color: #00F0FF; font-weight: bold; }
        .quiz-section { background: #18181b; margin: 0.5rem 0; padding: 1.5rem 1rem; }
        .quiz-section h3 { color: #ffffff; font-size: 1.125rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .quiz-question { background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem; }
        .quiz-question p { font-weight: 500; color: #fff; margin-bottom: 0.75rem; }
        .quiz-option { display: block; width: 100%; text-align: left; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem; padding: 0.75rem 1rem; margin-bottom: 0.5rem; color: #d4d4d8; cursor: pointer; transition: all 0.2s ease; }
        .quiz-option:hover { background: rgba(0, 240, 255, 0.1); border-color: rgba(0, 240, 255, 0.3); }
        .quiz-option.correct { background: rgba(16, 185, 129, 0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239, 68, 68, 0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { display: none; padding: 0.75rem; border-radius: 0.5rem; margin-top: 0.75rem; font-weight: 500; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.1); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.1); color: #EF4444; }
        .quiz-score { display: none; text-align: center; padding: 1rem; background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(255, 189, 89, 0.15) 100%); border-radius: 0.75rem; margin-top: 1rem; }
        .quiz-score.show { display: block; }
        .quiz-score .score-text { font-size: 1.5rem; font-weight: 700; color: #00F0FF; }
        .quiz-score .score-label { font-size: 0.875rem; color: #a1a1aa; }
        .retake-btn { background: linear-gradient(135deg, #00F0FF 0%, #0080FF 100%); color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { padding: 1.5rem 1rem; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1); }
        .footer-logo { font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, #00F0FF 0%, #FFBD59 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .footer-text { font-size: 0.75rem; color: #71717a; margin-top: 0.25rem; }
        @media (max-width: 600px) { .container { padding: 0; } .content-card { border-radius: 0; border-left: none; border-right: none; } .advantage-grid { grid-template-columns: 1fr; } .lesson-title { font-size: 1.25rem; } }
        @media (min-width: 600px) { .container { padding: 1.5rem; } .content-card { border-radius: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.1); } }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="lesson-badge">⚡ Module B - Chương 8</span>
            <h1 class="lesson-title">Bài 8.5: Lợi Thế Đi Sớm</h1>
            <p class="lesson-subtitle">First Mover Advantage - Tại sao timing matters</p>
        </header>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">⏰</div>
                <div class="card-meta">
                    <h3>First Mover Advantage</h3>
                    <span>Người đi sớm có lợi thế</span>
                </div>
            </div>
            <div class="card-body">
                <p>Trong mọi lĩnh vực, <strong>người đi sớm</strong> luôn có lợi thế. Trading và GEM ecosystem cũng vậy.</p>
                <ul class="styled-list">
                    <li><strong>Early Adopters:</strong> Những người học sớm, làm sớm thường thành công hơn</li>
                    <li><strong>Market Growth:</strong> Crypto market vẫn còn non trẻ, cơ hội còn rất lớn</li>
                    <li><strong>GEM Ecosystem:</strong> Đang mở rộng, partner đi sớm được lợi nhiều nhất</li>
                </ul>
                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/00F0FF?text=First+Mover+Advantage" alt="First Mover">
                    <p class="image-caption">Hình 8.5.1: Lợi thế của người đi sớm</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">🚀</div>
                <div class="card-meta">
                    <h3>4 Lợi Thế Cụ Thể</h3>
                    <span>Khi bạn hành động ngay</span>
                </div>
            </div>
            <div class="card-body">
                <div class="advantage-grid">
                    <div class="advantage-card">
                        <div class="advantage-icon">📈</div>
                        <div class="advantage-title">Compound Time</div>
                        <div class="advantage-desc">Bắt đầu sớm = nhiều năm compound hơn</div>
                    </div>
                    <div class="advantage-card">
                        <div class="advantage-icon">🎯</div>
                        <div class="advantage-title">Less Competition</div>
                        <div class="advantage-desc">Thị trường chưa đông, cơ hội rõ ràng hơn</div>
                    </div>
                    <div class="advantage-card">
                        <div class="advantage-icon">💰</div>
                        <div class="advantage-title">Partner Rewards</div>
                        <div class="advantage-desc">Early partners nhận incentives cao hơn</div>
                    </div>
                    <div class="advantage-card">
                        <div class="advantage-icon">🌟</div>
                        <div class="advantage-title">Community Status</div>
                        <div class="advantage-desc">OG members được respect và có influence</div>
                    </div>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">📊</div>
                <div class="card-meta">
                    <h3>Crypto Market Still Early</h3>
                    <span>Adoption vẫn còn thấp</span>
                </div>
            </div>
            <div class="card-body">
                <p>Nhiều người nghĩ đã "trễ" khi vào crypto. Thực tế:</p>
                <ul class="styled-list green">
                    <li><strong>Global Adoption:</strong> Chỉ ~5% dân số thế giới sở hữu crypto</li>
                    <li><strong>Institutional:</strong> Các tổ chức lớn mới bắt đầu tham gia</li>
                    <li><strong>Regulation:</strong> Khung pháp lý đang hình thành, mở đường cho mass adoption</li>
                    <li><strong>Technology:</strong> Blockchain vẫn đang phát triển, use cases mới liên tục</li>
                </ul>
                <p>Nếu internet năm 2000 là "early", thì crypto hiện tại cũng tương đương.</p>
                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/10B981?text=Crypto+Adoption+Curve" alt="Adoption">
                    <p class="image-caption">Hình 8.5.2: Crypto adoption vẫn đang ở early phase</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">⚠️</div>
                <div class="card-meta">
                    <h3>Chi Phí Của Việc Chờ Đợi</h3>
                    <span>Cost of inaction</span>
                </div>
            </div>
            <div class="card-body">
                <div class="urgency-box">
                    <div class="urgency-title">⏳ Mỗi Ngày Chờ Đợi Là Một Ngày Mất Đi</div>
                    <div class="urgency-text">Thời gian là tài sản quý giá nhất. Không thể mua, không thể lấy lại.</div>
                </div>
                <ul class="styled-list gold">
                    <li><strong>Opportunity Cost:</strong> Tiền bạn không kiếm được vì không trade</li>
                    <li><strong>Learning Delay:</strong> Mỗi ngày chờ = 1 ngày chậm hơn đạt profitability</li>
                    <li><strong>Market Cycles:</strong> Miss bull run = phải chờ 4 năm cho cycle tiếp</li>
                    <li><strong>Partner Opportunity:</strong> Network bạn biết sẽ được người khác tiếp cận</li>
                </ul>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">🎯</div>
                <div class="card-meta">
                    <h3>Hành Động Ngay</h3>
                    <span>Action beats perfection</span>
                </div>
            </div>
            <div class="card-body">
                <p>Không cần phải perfect để bắt đầu. Cần bắt đầu để trở nên perfect.</p>
                <ul class="styled-list">
                    <li><strong>Start Paper Trading:</strong> Ngay hôm nay, không cần chờ</li>
                    <li><strong>Join Community:</strong> Kết nối với members, học từ nhau</li>
                    <li><strong>Consider TIER 3:</strong> Nếu muốn fast-track</li>
                    <li><strong>Explore Partnership:</strong> Nếu có network phù hợp</li>
                </ul>
                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/00F0FF?text=Take+Action+Now" alt="Action">
                    <p class="image-caption">Hình 8.5.3: Hành động ngay, hoàn thiện sau</p>
                </div>
            </div>
        </article>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>First Mover Advantage: Người đi sớm luôn có lợi thế</li>
                <li>Crypto vẫn early: Chỉ ~5% adoption toàn cầu</li>
                <li>4 lợi thế: Compound time, less competition, rewards, status</li>
                <li>Cost of waiting: Opportunity cost, learning delay, miss cycles</li>
                <li>Action trumps perfection: Bắt đầu ngay, hoàn thiện dần</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h3>🎯 Kiểm Tra Kiến Thức</h3>
            <div class="quiz-question" data-correct="1">
                <p><strong>Câu 1:</strong> Tỷ lệ adoption crypto toàn cầu hiện tại khoảng bao nhiêu?</p>
                <button class="quiz-option" data-index="0">~50%</button>
                <button class="quiz-option" data-index="1">~5%</button>
                <button class="quiz-option" data-index="2">~25%</button>
                <button class="quiz-option" data-index="3">~75%</button>
                <div class="quiz-result"></div>
            </div>
            <div class="quiz-question" data-correct="0">
                <p><strong>Câu 2:</strong> "First Mover Advantage" nghĩa là gì?</p>
                <button class="quiz-option" data-index="0">Người đi sớm có lợi thế hơn người đến sau</button>
                <button class="quiz-option" data-index="1">Người có nhiều tiền nhất sẽ thắng</button>
                <button class="quiz-option" data-index="2">Chờ đợi là chiến lược tốt nhất</button>
                <button class="quiz-option" data-index="3">Nên đợi market ổn định mới vào</button>
                <div class="quiz-result"></div>
            </div>
            <div class="quiz-score">
                <div class="score-text"><span id="correct-count">0</span>/2</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <div class="footer-logo">GEM Trading Academy</div>
            <p class="footer-text">Module B - Cơ Hội & Lựa Chọn • Bài 8.5</p>
        </footer>
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

-- Lesson 8.6: Khung Quyết Định - Module B
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch8-l6',
  'module-tier-2-ch8',
  'course-tier2-trading-advanced',
  'Bài 8.6: Khung Quyết Định - Module B',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 8.6: Khung Quyết Định - Module B</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #112250 0%, #1a1a2e 100%); padding: 2rem 1.5rem; border-bottom: 3px solid #FFBD59; }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #FFBD59, #f59e0b); color: #000; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: #a1a1aa; font-size: 0.9rem; }
        .content-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .section-label { display: inline-block; background: rgba(255, 189, 89, 0.2); color: #FFBD59; padding: 0.2rem 0.6rem; border-radius: 0.375rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.75rem; }
        .section-title { font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(245, 158, 11, 0.05)); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .highlight-box.cyan { background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.05)); border-color: rgba(0, 240, 255, 0.3); }
        .highlight-box.purple { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border-color: rgba(139, 92, 246, 0.3); }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border-color: rgba(16, 185, 129, 0.3); }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; }
        .grid-item.gold { border-left: 3px solid #FFBD59; }
        .grid-item.cyan { border-left: 3px solid #00F0FF; }
        .grid-item.purple { border-left: 3px solid #8B5CF6; }
        .grid-item.green { border-left: 3px solid #10B981; }
        .comparison-table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }
        .comparison-table th { background: #27272a; padding: 0.75rem; text-align: left; font-weight: 600; color: #FFBD59; }
        .comparison-table td { padding: 0.75rem; border-bottom: 1px solid #27272a; }
        .comparison-table tr:hover { background: rgba(255, 255, 255, 0.02); }
        .framework-step { display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; background: rgba(255, 255, 255, 0.02); border-radius: 0.5rem; border-left: 3px solid #FFBD59; }
        .step-number { width: 40px; height: 40px; background: linear-gradient(135deg, #FFBD59, #f59e0b); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #000; flex-shrink: 0; }
        .step-content h4 { color: #fff; margin-bottom: 0.5rem; }
        .checklist { list-style: none; margin: 1rem 0; }
        .checklist li { padding: 0.75rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.02); border-radius: 0.375rem; display: flex; align-items: center; gap: 0.75rem; }
        .checklist li::before { content: "□"; color: #FFBD59; font-size: 1.2rem; }
        .checklist li.checked::before { content: "✓"; color: #10B981; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #112250); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .summary-box { background: linear-gradient(135deg, #112250, #1a1a2e); border: 1px solid #FFBD59; border-radius: 0.75rem; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #FFBD59; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-list { list-style: none; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
        .summary-list li::before { content: "→"; position: absolute; left: 0; color: #FFBD59; }
        .quiz-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .quiz-question { background: rgba(255, 255, 255, 0.02); padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .question-text { font-weight: 600; color: #fff; margin-bottom: 1rem; }
        .quiz-option { padding: 0.875rem 1rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.03); border: 1px solid #27272a; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; }
        .quiz-option:hover { border-color: #FFBD59; background: rgba(255, 189, 89, 0.1); }
        .quiz-option.correct { border-color: #10B981; background: rgba(16, 185, 129, 0.2); }
        .quiz-option.incorrect { border-color: #ef4444; background: rgba(239, 68, 68, 0.2); }
        .option-letter { width: 24px; height: 24px; border-radius: 50%; background: #27272a; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
        .quiz-result { padding: 0.75rem; margin-top: 0.75rem; border-radius: 0.375rem; font-weight: 500; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(245, 158, 11, 0.05)); border-radius: 0.5rem; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .score-text { font-size: 1.5rem; font-weight: 700; color: #FFBD59; }
        .retake-btn { background: linear-gradient(135deg, #FFBD59, #f59e0b); color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
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
            <span class="lesson-badge">Module B</span>
            <h1 class="lesson-title">Bài 8.6: Khung Quyết Định</h1>
            <p class="lesson-subtitle">Framework giúp bạn đưa ra quyết định đúng đắn về hành trình trading</p>
        </div>

        <div class="content-section">
            <span class="section-label">📋 Tổng quan</span>
            <h2 class="section-title">Tại Sao Cần Framework Quyết Định?</h2>
            <p>Trong trading cũng như trong cuộc sống, những quyết định quan trọng cần được suy xét kỹ lưỡng. Framework quyết định giúp bạn:</p>
            <div class="highlight-box">
                <p><strong>🎯 Mục đích của Framework:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Loại bỏ cảm xúc khỏi quá trình ra quyết định</li>
                    <li>Đánh giá khách quan các lựa chọn</li>
                    <li>Xác định rõ chi phí cơ hội</li>
                    <li>Đưa ra quyết định phù hợp với mục tiêu cá nhân</li>
                </ul>
            </div>
            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/112250/FFBD59?text=Framework+Quyet+Dinh+-+Overview" alt="Framework quyết định">
                <p class="image-caption">Hình 8.6.1: Khung quyết định 5 bước</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🔢 5 Bước</span>
            <h2 class="section-title">5-Step Decision Framework</h2>

            <div class="framework-step">
                <div class="step-number">1</div>
                <div class="step-content">
                    <h4>Xác Định Mục Tiêu</h4>
                    <p>Bạn muốn đạt được gì trong 6 tháng, 1 năm, 3 năm? Trading có vai trò gì trong kế hoạch tài chính của bạn?</p>
                </div>
            </div>

            <div class="framework-step">
                <div class="step-number">2</div>
                <div class="step-content">
                    <h4>Đánh Giá Tình Huống Hiện Tại</h4>
                    <p>Vốn hiện có, thời gian có thể dành cho trading, kiến thức và kỹ năng hiện tại, các ràng buộc khác.</p>
                </div>
            </div>

            <div class="framework-step">
                <div class="step-number">3</div>
                <div class="step-content">
                    <h4>Liệt Kê Các Lựa Chọn</h4>
                    <p>Tự học → Tier 3 → Partner Program. Mỗi lựa chọn có ưu và nhược điểm riêng.</p>
                </div>
            </div>

            <div class="framework-step">
                <div class="step-number">4</div>
                <div class="step-content">
                    <h4>Phân Tích Chi Phí - Lợi Ích</h4>
                    <p>Không chỉ tiền bạc, mà còn thời gian, năng lượng, chi phí cơ hội.</p>
                </div>
            </div>

            <div class="framework-step">
                <div class="step-number">5</div>
                <div class="step-content">
                    <h4>Đưa Ra Quyết Định và Cam Kết</h4>
                    <p>Chọn phương án phù hợp nhất và cam kết thực hiện 100%.</p>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚖️ So sánh</span>
            <h2 class="section-title">Ma Trận Quyết Định</h2>
            <p>Đánh giá 3 lựa chọn theo các tiêu chí quan trọng:</p>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x400/112250/00F0FF?text=Ma+Tran+Quyet+Dinh+-+3+Lua+Chon" alt="Ma trận quyết định">
                <p class="image-caption">Hình 8.6.2: Ma trận so sánh 3 lựa chọn</p>
            </div>

            <table class="comparison-table">
                <tr>
                    <th>Tiêu Chí</th>
                    <th>Tự Học</th>
                    <th>Tier 3</th>
                    <th>Partner</th>
                </tr>
                <tr>
                    <td>Chi phí ban đầu</td>
                    <td>$0</td>
                    <td>$$$</td>
                    <td>$$$$</td>
                </tr>
                <tr>
                    <td>Thời gian đạt profitable</td>
                    <td>2-5 năm</td>
                    <td>6-12 tháng</td>
                    <td>3-6 tháng</td>
                </tr>
                <tr>
                    <td>Tỷ lệ thành công</td>
                    <td>~5%</td>
                    <td>~40%</td>
                    <td>~60%</td>
                </tr>
                <tr>
                    <td>Hỗ trợ</td>
                    <td>Không</td>
                    <td>Cộng đồng</td>
                    <td>1-1 Mentorship</td>
                </tr>
                <tr>
                    <td>Thu nhập thụ động</td>
                    <td>Không</td>
                    <td>Không</td>
                    <td>Có (10-30% theo tier CTV)</td>
                </tr>
            </table>
        </div>

        <div class="content-section">
            <span class="section-label">✅ Checklist</span>
            <h2 class="section-title">Checklist Ra Quyết Định</h2>
            <p>Trả lời những câu hỏi này trước khi quyết định:</p>

            <ul class="checklist">
                <li>Tôi đã hiểu rõ 3 lựa chọn và ưu/nhược điểm của từng cái?</li>
                <li>Mục tiêu tài chính của tôi trong 1 năm tới là gì?</li>
                <li>Tôi có bao nhiêu thời gian dành cho trading mỗi ngày?</li>
                <li>Tôi sẵn sàng đầu tư bao nhiêu vào việc học?</li>
                <li>Tôi có muốn tạo thu nhập thụ động từ việc giới thiệu không?</li>
                <li>Tôi học tốt nhất theo cách nào: tự học hay có mentor?</li>
            </ul>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/112250/10B981?text=Checklist+Tu+Danh+Gia" alt="Checklist tự đánh giá">
                <p class="image-caption">Hình 8.6.3: Checklist tự đánh giá trước khi quyết định</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🎯 Gợi ý</span>
            <h2 class="section-title">Lựa Chọn Phù Hợp Theo Profile</h2>

            <div class="grid-2">
                <div class="grid-item gold">
                    <h4 style="color: #FFBD59; margin-bottom: 0.5rem;">👤 Profile A: Tự Học</h4>
                    <p style="font-size: 0.9rem;">Phù hợp nếu: Có nhiều thời gian tự do, thích tự khám phá, chấp nhận đường dài 2-5 năm, vốn học tập hạn chế</p>
                </div>
                <div class="grid-item cyan">
                    <h4 style="color: #00F0FF; margin-bottom: 0.5rem;">🚀 Profile B: Tier 3</h4>
                    <p style="font-size: 0.9rem;">Phù hợp nếu: Muốn rút ngắn thời gian, sẵn sàng đầu tư cho kiến thức, cần hệ thống và công cụ hỗ trợ</p>
                </div>
                <div class="grid-item purple">
                    <h4 style="color: #8B5CF6; margin-bottom: 0.5rem;">💎 Profile C: Partner</h4>
                    <p style="font-size: 0.9rem;">Phù hợp nếu: Muốn kết quả nhanh nhất, cần mentorship 1-1, muốn xây dựng nguồn thu nhập thụ động</p>
                </div>
                <div class="grid-item green">
                    <h4 style="color: #10B981; margin-bottom: 0.5rem;">🌟 Profile D: Hybrid</h4>
                    <p style="font-size: 0.9rem;">Phù hợp nếu: Bắt đầu với Tier 3, sau đó nâng cấp Partner khi thấy kết quả và muốn phát triển thêm</p>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚠️ Lưu ý</span>
            <h2 class="section-title">Những Điều Cần Tránh</h2>

            <div class="highlight-box" style="border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.1);">
                <p><strong>❌ Đừng quyết định khi:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Đang trong trạng thái cảm xúc (FOMO, sợ hãi, hưng phấn)</li>
                    <li>Chưa hiểu rõ các lựa chọn</li>
                    <li>Bị áp lực từ người khác</li>
                    <li>Chưa đánh giá đầy đủ tình huống tài chính cá nhân</li>
                </ul>
            </div>

            <div class="highlight-box green">
                <p><strong>✓ Hãy quyết định khi:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Đã nghiên cứu kỹ và hiểu rõ các lựa chọn</li>
                    <li>Biết rõ mục tiêu và timeline của bản thân</li>
                    <li>Tài chính cho phép (không vay mượn để học)</li>
                    <li>Sẵn sàng cam kết 100% với quyết định</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x300/112250/FFBD59?text=Quyet+Dinh+Dung+Dan+-+Checklist" alt="Quyết định đúng đắn">
                <p class="image-caption">Hình 8.6.4: Quyết định đúng đắn = Thời điểm đúng + Thông tin đầy đủ</p>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Framework 5 bước giúp ra quyết định có hệ thống</li>
                <li>Ma trận quyết định so sánh khách quan 3 lựa chọn</li>
                <li>Xác định profile phù hợp với bản thân</li>
                <li>Tránh quyết định dựa trên cảm xúc hoặc áp lực</li>
                <li>Cam kết 100% với quyết định đã chọn</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Bước đầu tiên trong Framework Quyết Định là gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Liệt kê các lựa chọn</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Xác định mục tiêu của bản thân</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Phân tích chi phí - lợi ích</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Khi nào KHÔNG nên đưa ra quyết định quan trọng?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Khi đã nghiên cứu kỹ các lựa chọn</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Khi biết rõ mục tiêu của bản thân</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Khi đang trong trạng thái FOMO hoặc sợ hãi</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Kết quả: <span id="correct-count">0</span>/2</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </div>

        <div class="lesson-footer">
            <p>© 2024 GEM Trading Academy - Module B: Cơ Hội & Lựa Chọn</p>
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
                        result.textContent = ''✓ Chính xác! Xác định mục tiêu là bước đầu tiên.'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng. Hãy xem lại Framework 5 bước.'';
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
    <title>Bài 8.6: Khung Quyết Định - Module B</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #112250 0%, #1a1a2e 100%); padding: 2rem 1.5rem; border-bottom: 3px solid #FFBD59; }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #FFBD59, #f59e0b); color: #000; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: #a1a1aa; font-size: 0.9rem; }
        .content-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .section-label { display: inline-block; background: rgba(255, 189, 89, 0.2); color: #FFBD59; padding: 0.2rem 0.6rem; border-radius: 0.375rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.75rem; }
        .section-title { font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(245, 158, 11, 0.05)); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .highlight-box.cyan { background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.05)); border-color: rgba(0, 240, 255, 0.3); }
        .highlight-box.purple { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border-color: rgba(139, 92, 246, 0.3); }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border-color: rgba(16, 185, 129, 0.3); }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; }
        .grid-item.gold { border-left: 3px solid #FFBD59; }
        .grid-item.cyan { border-left: 3px solid #00F0FF; }
        .grid-item.purple { border-left: 3px solid #8B5CF6; }
        .grid-item.green { border-left: 3px solid #10B981; }
        .comparison-table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }
        .comparison-table th { background: #27272a; padding: 0.75rem; text-align: left; font-weight: 600; color: #FFBD59; }
        .comparison-table td { padding: 0.75rem; border-bottom: 1px solid #27272a; }
        .comparison-table tr:hover { background: rgba(255, 255, 255, 0.02); }
        .framework-step { display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; background: rgba(255, 255, 255, 0.02); border-radius: 0.5rem; border-left: 3px solid #FFBD59; }
        .step-number { width: 40px; height: 40px; background: linear-gradient(135deg, #FFBD59, #f59e0b); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #000; flex-shrink: 0; }
        .step-content h4 { color: #fff; margin-bottom: 0.5rem; }
        .checklist { list-style: none; margin: 1rem 0; }
        .checklist li { padding: 0.75rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.02); border-radius: 0.375rem; display: flex; align-items: center; gap: 0.75rem; }
        .checklist li::before { content: "□"; color: #FFBD59; font-size: 1.2rem; }
        .checklist li.checked::before { content: "✓"; color: #10B981; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #112250); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .summary-box { background: linear-gradient(135deg, #112250, #1a1a2e); border: 1px solid #FFBD59; border-radius: 0.75rem; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #FFBD59; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-list { list-style: none; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
        .summary-list li::before { content: "→"; position: absolute; left: 0; color: #FFBD59; }
        .quiz-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .quiz-question { background: rgba(255, 255, 255, 0.02); padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .question-text { font-weight: 600; color: #fff; margin-bottom: 1rem; }
        .quiz-option { padding: 0.875rem 1rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.03); border: 1px solid #27272a; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; }
        .quiz-option:hover { border-color: #FFBD59; background: rgba(255, 189, 89, 0.1); }
        .quiz-option.correct { border-color: #10B981; background: rgba(16, 185, 129, 0.2); }
        .quiz-option.incorrect { border-color: #ef4444; background: rgba(239, 68, 68, 0.2); }
        .option-letter { width: 24px; height: 24px; border-radius: 50%; background: #27272a; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
        .quiz-result { padding: 0.75rem; margin-top: 0.75rem; border-radius: 0.375rem; font-weight: 500; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(245, 158, 11, 0.05)); border-radius: 0.5rem; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .score-text { font-size: 1.5rem; font-weight: 700; color: #FFBD59; }
        .retake-btn { background: linear-gradient(135deg, #FFBD59, #f59e0b); color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
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
            <span class="lesson-badge">Module B</span>
            <h1 class="lesson-title">Bài 8.6: Khung Quyết Định</h1>
            <p class="lesson-subtitle">Framework giúp bạn đưa ra quyết định đúng đắn về hành trình trading</p>
        </div>

        <div class="content-section">
            <span class="section-label">📋 Tổng quan</span>
            <h2 class="section-title">Tại Sao Cần Framework Quyết Định?</h2>
            <p>Trong trading cũng như trong cuộc sống, những quyết định quan trọng cần được suy xét kỹ lưỡng. Framework quyết định giúp bạn:</p>
            <div class="highlight-box">
                <p><strong>🎯 Mục đích của Framework:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Loại bỏ cảm xúc khỏi quá trình ra quyết định</li>
                    <li>Đánh giá khách quan các lựa chọn</li>
                    <li>Xác định rõ chi phí cơ hội</li>
                    <li>Đưa ra quyết định phù hợp với mục tiêu cá nhân</li>
                </ul>
            </div>
            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/112250/FFBD59?text=Framework+Quyet+Dinh+-+Overview" alt="Framework quyết định">
                <p class="image-caption">Hình 8.6.1: Khung quyết định 5 bước</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🔢 5 Bước</span>
            <h2 class="section-title">5-Step Decision Framework</h2>

            <div class="framework-step">
                <div class="step-number">1</div>
                <div class="step-content">
                    <h4>Xác Định Mục Tiêu</h4>
                    <p>Bạn muốn đạt được gì trong 6 tháng, 1 năm, 3 năm? Trading có vai trò gì trong kế hoạch tài chính của bạn?</p>
                </div>
            </div>

            <div class="framework-step">
                <div class="step-number">2</div>
                <div class="step-content">
                    <h4>Đánh Giá Tình Huống Hiện Tại</h4>
                    <p>Vốn hiện có, thời gian có thể dành cho trading, kiến thức và kỹ năng hiện tại, các ràng buộc khác.</p>
                </div>
            </div>

            <div class="framework-step">
                <div class="step-number">3</div>
                <div class="step-content">
                    <h4>Liệt Kê Các Lựa Chọn</h4>
                    <p>Tự học → Tier 3 → Partner Program. Mỗi lựa chọn có ưu và nhược điểm riêng.</p>
                </div>
            </div>

            <div class="framework-step">
                <div class="step-number">4</div>
                <div class="step-content">
                    <h4>Phân Tích Chi Phí - Lợi Ích</h4>
                    <p>Không chỉ tiền bạc, mà còn thời gian, năng lượng, chi phí cơ hội.</p>
                </div>
            </div>

            <div class="framework-step">
                <div class="step-number">5</div>
                <div class="step-content">
                    <h4>Đưa Ra Quyết Định và Cam Kết</h4>
                    <p>Chọn phương án phù hợp nhất và cam kết thực hiện 100%.</p>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚖️ So sánh</span>
            <h2 class="section-title">Ma Trận Quyết Định</h2>
            <p>Đánh giá 3 lựa chọn theo các tiêu chí quan trọng:</p>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x400/112250/00F0FF?text=Ma+Tran+Quyet+Dinh+-+3+Lua+Chon" alt="Ma trận quyết định">
                <p class="image-caption">Hình 8.6.2: Ma trận so sánh 3 lựa chọn</p>
            </div>

            <table class="comparison-table">
                <tr>
                    <th>Tiêu Chí</th>
                    <th>Tự Học</th>
                    <th>Tier 3</th>
                    <th>Partner</th>
                </tr>
                <tr>
                    <td>Chi phí ban đầu</td>
                    <td>$0</td>
                    <td>$$$</td>
                    <td>$$$$</td>
                </tr>
                <tr>
                    <td>Thời gian đạt profitable</td>
                    <td>2-5 năm</td>
                    <td>6-12 tháng</td>
                    <td>3-6 tháng</td>
                </tr>
                <tr>
                    <td>Tỷ lệ thành công</td>
                    <td>~5%</td>
                    <td>~40%</td>
                    <td>~60%</td>
                </tr>
                <tr>
                    <td>Hỗ trợ</td>
                    <td>Không</td>
                    <td>Cộng đồng</td>
                    <td>1-1 Mentorship</td>
                </tr>
                <tr>
                    <td>Thu nhập thụ động</td>
                    <td>Không</td>
                    <td>Không</td>
                    <td>Có (10-30% theo tier CTV)</td>
                </tr>
            </table>
        </div>

        <div class="content-section">
            <span class="section-label">✅ Checklist</span>
            <h2 class="section-title">Checklist Ra Quyết Định</h2>
            <p>Trả lời những câu hỏi này trước khi quyết định:</p>

            <ul class="checklist">
                <li>Tôi đã hiểu rõ 3 lựa chọn và ưu/nhược điểm của từng cái?</li>
                <li>Mục tiêu tài chính của tôi trong 1 năm tới là gì?</li>
                <li>Tôi có bao nhiêu thời gian dành cho trading mỗi ngày?</li>
                <li>Tôi sẵn sàng đầu tư bao nhiêu vào việc học?</li>
                <li>Tôi có muốn tạo thu nhập thụ động từ việc giới thiệu không?</li>
                <li>Tôi học tốt nhất theo cách nào: tự học hay có mentor?</li>
            </ul>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/112250/10B981?text=Checklist+Tu+Danh+Gia" alt="Checklist tự đánh giá">
                <p class="image-caption">Hình 8.6.3: Checklist tự đánh giá trước khi quyết định</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🎯 Gợi ý</span>
            <h2 class="section-title">Lựa Chọn Phù Hợp Theo Profile</h2>

            <div class="grid-2">
                <div class="grid-item gold">
                    <h4 style="color: #FFBD59; margin-bottom: 0.5rem;">👤 Profile A: Tự Học</h4>
                    <p style="font-size: 0.9rem;">Phù hợp nếu: Có nhiều thời gian tự do, thích tự khám phá, chấp nhận đường dài 2-5 năm, vốn học tập hạn chế</p>
                </div>
                <div class="grid-item cyan">
                    <h4 style="color: #00F0FF; margin-bottom: 0.5rem;">🚀 Profile B: Tier 3</h4>
                    <p style="font-size: 0.9rem;">Phù hợp nếu: Muốn rút ngắn thời gian, sẵn sàng đầu tư cho kiến thức, cần hệ thống và công cụ hỗ trợ</p>
                </div>
                <div class="grid-item purple">
                    <h4 style="color: #8B5CF6; margin-bottom: 0.5rem;">💎 Profile C: Partner</h4>
                    <p style="font-size: 0.9rem;">Phù hợp nếu: Muốn kết quả nhanh nhất, cần mentorship 1-1, muốn xây dựng nguồn thu nhập thụ động</p>
                </div>
                <div class="grid-item green">
                    <h4 style="color: #10B981; margin-bottom: 0.5rem;">🌟 Profile D: Hybrid</h4>
                    <p style="font-size: 0.9rem;">Phù hợp nếu: Bắt đầu với Tier 3, sau đó nâng cấp Partner khi thấy kết quả và muốn phát triển thêm</p>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">⚠️ Lưu ý</span>
            <h2 class="section-title">Những Điều Cần Tránh</h2>

            <div class="highlight-box" style="border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.1);">
                <p><strong>❌ Đừng quyết định khi:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Đang trong trạng thái cảm xúc (FOMO, sợ hãi, hưng phấn)</li>
                    <li>Chưa hiểu rõ các lựa chọn</li>
                    <li>Bị áp lực từ người khác</li>
                    <li>Chưa đánh giá đầy đủ tình huống tài chính cá nhân</li>
                </ul>
            </div>

            <div class="highlight-box green">
                <p><strong>✓ Hãy quyết định khi:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Đã nghiên cứu kỹ và hiểu rõ các lựa chọn</li>
                    <li>Biết rõ mục tiêu và timeline của bản thân</li>
                    <li>Tài chính cho phép (không vay mượn để học)</li>
                    <li>Sẵn sàng cam kết 100% với quyết định</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x300/112250/FFBD59?text=Quyet+Dinh+Dung+Dan+-+Checklist" alt="Quyết định đúng đắn">
                <p class="image-caption">Hình 8.6.4: Quyết định đúng đắn = Thời điểm đúng + Thông tin đầy đủ</p>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Framework 5 bước giúp ra quyết định có hệ thống</li>
                <li>Ma trận quyết định so sánh khách quan 3 lựa chọn</li>
                <li>Xác định profile phù hợp với bản thân</li>
                <li>Tránh quyết định dựa trên cảm xúc hoặc áp lực</li>
                <li>Cam kết 100% với quyết định đã chọn</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Kiểm Tra</span>
            <h2 class="section-title">Quiz Nhanh</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Bước đầu tiên trong Framework Quyết Định là gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Liệt kê các lựa chọn</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Xác định mục tiêu của bản thân</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Phân tích chi phí - lợi ích</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Khi nào KHÔNG nên đưa ra quyết định quan trọng?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Khi đã nghiên cứu kỹ các lựa chọn</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Khi biết rõ mục tiêu của bản thân</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Khi đang trong trạng thái FOMO hoặc sợ hãi</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Kết quả: <span id="correct-count">0</span>/2</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </div>

        <div class="lesson-footer">
            <p>© 2024 GEM Trading Academy - Module B: Cơ Hội & Lựa Chọn</p>
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
                        result.textContent = ''✓ Chính xác! Xác định mục tiêu là bước đầu tiên.'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng. Hãy xem lại Framework 5 bước.'';
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

-- Lesson 8.7: Các Bước Tiếp Theo - Module B
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch8-l7',
  'module-tier-2-ch8',
  'course-tier2-trading-advanced',
  'Bài 8.7: Các Bước Tiếp Theo - Module B',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 8.7: Các Bước Tiếp Theo - Module B</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #112250 0%, #1a1a2e 100%); padding: 2rem 1.5rem; border-bottom: 3px solid #FFBD59; }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #FFBD59, #f59e0b); color: #000; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: #a1a1aa; font-size: 0.9rem; }
        .content-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .section-label { display: inline-block; background: rgba(255, 189, 89, 0.2); color: #FFBD59; padding: 0.2rem 0.6rem; border-radius: 0.375rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.75rem; }
        .section-title { font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(245, 158, 11, 0.05)); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .highlight-box.cyan { background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.05)); border-color: rgba(0, 240, 255, 0.3); }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border-color: rgba(16, 185, 129, 0.3); }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; text-align: center; }
        .grid-item.gold { border-color: #FFBD59; background: rgba(255, 189, 89, 0.05); }
        .grid-item.cyan { border-color: #00F0FF; background: rgba(0, 240, 255, 0.05); }
        .grid-item.purple { border-color: #8B5CF6; background: rgba(139, 92, 246, 0.05); }
        .step-card { display: flex; gap: 1rem; margin: 1rem 0; padding: 1.25rem; background: rgba(255, 255, 255, 0.02); border-radius: 0.5rem; border-left: 4px solid #FFBD59; }
        .step-number { width: 48px; height: 48px; background: linear-gradient(135deg, #FFBD59, #f59e0b); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700; color: #000; flex-shrink: 0; }
        .step-content h4 { color: #fff; margin-bottom: 0.5rem; font-size: 1rem; }
        .cta-box { background: linear-gradient(135deg, #112250, #1a1a2e); border: 2px solid #FFBD59; border-radius: 0.75rem; padding: 1.5rem; margin: 1rem 0; text-align: center; }
        .cta-box h3 { color: #FFBD59; font-size: 1.25rem; margin-bottom: 0.75rem; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #FFBD59, #f59e0b); color: #000; padding: 0.875rem 2rem; border-radius: 0.5rem; font-weight: 700; text-decoration: none; margin-top: 1rem; }
        .contact-card { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; margin: 0.5rem 0; display: flex; align-items: center; gap: 1rem; }
        .contact-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #FFBD59, #f59e0b); border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #112250); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .summary-box { background: linear-gradient(135deg, #112250, #1a1a2e); border: 1px solid #FFBD59; border-radius: 0.75rem; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #FFBD59; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-list { list-style: none; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
        .summary-list li::before { content: "→"; position: absolute; left: 0; color: #FFBD59; }
        .congrats-box { background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1)); border: 2px solid #10B981; border-radius: 0.75rem; padding: 2rem; text-align: center; margin: 1rem; }
        .congrats-box h2 { color: #10B981; font-size: 1.5rem; margin-bottom: 0.5rem; }
        .quiz-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .quiz-question { background: rgba(255, 255, 255, 0.02); padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .question-text { font-weight: 600; color: #fff; margin-bottom: 1rem; }
        .quiz-option { padding: 0.875rem 1rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.03); border: 1px solid #27272a; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; }
        .quiz-option:hover { border-color: #FFBD59; background: rgba(255, 189, 89, 0.1); }
        .quiz-option.correct { border-color: #10B981; background: rgba(16, 185, 129, 0.2); }
        .quiz-option.incorrect { border-color: #ef4444; background: rgba(239, 68, 68, 0.2); }
        .option-letter { width: 24px; height: 24px; border-radius: 50%; background: #27272a; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
        .quiz-result { padding: 0.75rem; margin-top: 0.75rem; border-radius: 0.375rem; font-weight: 500; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(245, 158, 11, 0.05)); border-radius: 0.5rem; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .score-text { font-size: 1.5rem; font-weight: 700; color: #FFBD59; }
        .retake-btn { background: linear-gradient(135deg, #FFBD59, #f59e0b); color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.8rem; border-top: 1px solid #27272a; margin-top: 2rem; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .congrats-box { margin: 0; border-radius: 0; border-left: 4px solid #27272a; border-right: none; border-top: none; border-bottom: 1px solid #27272a; padding: 1.25rem 1rem; }
            .summary-box, .quiz-section { margin: 0; border-radius: 0; }
            .grid-3 { grid-template-columns: 1fr; gap: 0.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="lesson-header">
            <span class="lesson-badge">Kết Thúc Tier 2</span>
            <h1 class="lesson-title">Bài 8.7: Các Bước Tiếp Theo</h1>
            <p class="lesson-subtitle">Hành động cụ thể sau khi hoàn thành Tier 2</p>
        </div>

        <div class="congrats-box">
            <h2>🎉 Chúc Mừng!</h2>
            <p style="font-size: 1.1rem; margin-bottom: 1rem;">Bạn đã hoàn thành Tier 2 - GEM Advanced!</p>
            <p style="color: #a1a1aa;">Bạn đã nắm vững những kiến thức và kỹ năng nâng cao trong trading. Bây giờ là lúc quyết định bước tiếp theo.</p>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Tổng kết</span>
            <h2 class="section-title">Những Gì Bạn Đã Học Trong Tier 2</h2>

            <div class="grid-3">
                <div class="grid-item gold">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📈</div>
                    <h4 style="color: #FFBD59; margin-bottom: 0.25rem;">Advanced Patterns</h4>
                    <p style="font-size: 0.85rem; color: #a1a1aa;">12 patterns nâng cao</p>
                </div>
                <div class="grid-item cyan">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎯</div>
                    <h4 style="color: #00F0FF; margin-bottom: 0.25rem;">Entry Mastery</h4>
                    <p style="font-size: 0.85rem; color: #a1a1aa;">Kỹ thuật vào lệnh chính xác</p>
                </div>
                <div class="grid-item purple">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚖️</div>
                    <h4 style="color: #8B5CF6; margin-bottom: 0.25rem;">Risk Management</h4>
                    <p style="font-size: 0.85rem; color: #a1a1aa;">Quản lý rủi ro chuyên nghiệp</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/112250/10B981?text=Tier+2+Completion+-+Certificate" alt="Tier 2 Completion">
                <p class="image-caption">Hình 8.7.1: Hoàn thành Tier 2 - GEM Advanced</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🚀 Lộ trình</span>
            <h2 class="section-title">3 Lựa Chọn Cho Bước Tiếp Theo</h2>

            <div class="step-card">
                <div class="step-number">A</div>
                <div class="step-content">
                    <h4>Tiếp Tục Tự Thực Hành</h4>
                    <p>Áp dụng kiến thức Tier 2 vào Paper Trading. Tự đánh giá và cải thiện. Phù hợp nếu bạn có thời gian và kiên nhẫn để tự học.</p>
                </div>
            </div>

            <div class="step-card" style="border-left-color: #00F0FF;">
                <div class="step-number" style="background: linear-gradient(135deg, #00F0FF, #0ea5e9);">B</div>
                <div class="step-content">
                    <h4>Nâng Cấp Lên Tier 3 - Elite</h4>
                    <p>Học tiếp kiến thức Elite: Multi-Timeframe Analysis, Advanced Confluence, Institutional Trading Concepts. Nhận hỗ trợ từ cộng đồng GEM.</p>
                </div>
            </div>

            <div class="step-card" style="border-left-color: #8B5CF6;">
                <div class="step-number" style="background: linear-gradient(135deg, #8B5CF6, #7c3aed);">C</div>
                <div class="step-content">
                    <h4>Tham Gia Partner Program</h4>
                    <p>Mentorship 1-1, Signal Group riêng, Thu nhập thụ động 10-30% theo tier CTV. Đường nhanh nhất đến kết quả, phù hợp cho ai muốn nghiêm túc theo đuổi.</p>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📋 Hành động</span>
            <h2 class="section-title">Các Bước Tiếp Theo Cụ Thể</h2>

            <div class="step-card">
                <div class="step-number">1</div>
                <div class="step-content">
                    <h4>Xem Lại Kết Quả Paper Trading</h4>
                    <p>Đánh giá win rate, R:R trung bình, số trade mỗi tuần. Xác định điểm mạnh và điểm cần cải thiện.</p>
                </div>
            </div>

            <div class="step-card">
                <div class="step-number">2</div>
                <div class="step-content">
                    <h4>Áp Dụng Framework Quyết Định</h4>
                    <p>Sử dụng 5-Step Framework từ Bài 8.6. Xác định mục tiêu, đánh giá tình huống, phân tích các lựa chọn.</p>
                </div>
            </div>

            <div class="step-card">
                <div class="step-number">3</div>
                <div class="step-content">
                    <h4>Liên Hệ Nếu Cần Tư Vấn</h4>
                    <p>Đội ngũ GEM sẵn sàng hỗ trợ bạn chọn hướng đi phù hợp nhất. Không có áp lực, chỉ có giải đáp thắc mắc.</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/112250/FFBD59?text=Next+Steps+-+Action+Plan" alt="Action Plan">
                <p class="image-caption">Hình 8.7.2: Lộ trình hành động sau Tier 2</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📞 Liên hệ</span>
            <h2 class="section-title">Kênh Hỗ Trợ</h2>

            <div class="contact-card">
                <div class="contact-icon">💬</div>
                <div>
                    <strong>GEM Master Chatbot</strong>
                    <p style="font-size: 0.9rem; color: #a1a1aa;">Hỏi đáp 24/7 trong App GEM</p>
                </div>
            </div>

            <div class="contact-card">
                <div class="contact-icon">👥</div>
                <div>
                    <strong>Cộng Đồng GEM Forum</strong>
                    <p style="font-size: 0.9rem; color: #a1a1aa;">Kết nối với các trader khác trong App</p>
                </div>
            </div>

            <div class="contact-card">
                <div class="contact-icon">📧</div>
                <div>
                    <strong>Email Support</strong>
                    <p style="font-size: 0.9rem; color: #a1a1aa;">support@gemtrading.academy</p>
                </div>
            </div>

            <div class="contact-card">
                <div class="contact-icon">🎓</div>
                <div>
                    <strong>Tư Vấn Nâng Cấp</strong>
                    <p style="font-size: 0.9rem; color: #a1a1aa;">Liên hệ trong App để được tư vấn 1-1</p>
                </div>
            </div>
        </div>

        <div class="cta-box">
            <h3>🎯 Sẵn Sàng Cho Bước Tiếp Theo?</h3>
            <p>Dù bạn chọn con đường nào, GEM luôn đồng hành cùng bạn.</p>
            <p style="margin-top: 0.75rem; color: #a1a1aa; font-size: 0.9rem;">Tier 3 Elite hoặc Partner Program - Cơ hội để đạt level tiếp theo trong hành trình trading.</p>
            <div class="image-placeholder" style="margin-top: 1rem; padding: 2rem;">
                <img src="https://via.placeholder.com/600x300/112250/FFBD59?text=GEM+Academy+-+Your+Journey+Continues" alt="Your Journey Continues">
                <p class="image-caption">Hình 8.7.3: Hành trình của bạn tiếp tục...</p>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Tier 2</h3>
            <ul class="summary-list">
                <li>Hoàn thành 43 bài học nâng cao về GEM Method</li>
                <li>Nắm vững 12 Advanced Patterns và Entry Techniques</li>
                <li>Hiểu sâu Risk Management và Position Sizing chuyên nghiệp</li>
                <li>3 lựa chọn tiếp theo: Tự thực hành, Tier 3, hoặc Partner Program</li>
                <li>Sử dụng Framework Quyết Định để chọn hướng phù hợp nhất</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Final Quiz</span>
            <h2 class="section-title">Quiz Cuối Tier 2</h2>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">1. Sau khi hoàn thành Tier 2, bước đầu tiên nên làm là gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Ngay lập tức nâng cấp Tier 3</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Nghỉ ngơi và quên đi trading</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Xem lại kết quả Paper Trading và áp dụng Framework Quyết Định</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">2. Partner Program phù hợp với ai nhất?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Người mới hoàn toàn chưa biết gì về trading</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Người muốn kết quả nhanh nhất với mentorship 1-1 và thu nhập thụ động</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Người chỉ muốn học lý thuyết mà không thực hành</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Kết quả: <span id="correct-count">0</span>/2</p>
                <p style="margin-top: 0.5rem;">🎉 Chúc mừng hoàn thành Tier 2!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </div>

        <div class="lesson-footer">
            <p>© 2024 GEM Trading Academy - Tier 2 Complete!</p>
            <p style="margin-top: 0.5rem; color: #FFBD59;">Cảm ơn bạn đã học cùng GEM. Hẹn gặp lại ở Tier 3! 🚀</p>
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
    <title>Bài 8.7: Các Bước Tiếp Theo - Module B</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #112250 0%, #1a1a2e 100%); padding: 2rem 1.5rem; border-bottom: 3px solid #FFBD59; }
        .lesson-badge { display: inline-block; background: linear-gradient(135deg, #FFBD59, #f59e0b); color: #000; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem; }
        .lesson-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .lesson-subtitle { color: #a1a1aa; font-size: 0.9rem; }
        .content-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .section-label { display: inline-block; background: rgba(255, 189, 89, 0.2); color: #FFBD59; padding: 0.2rem 0.6rem; border-radius: 0.375rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.75rem; }
        .section-title { font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1rem; }
        .highlight-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(245, 158, 11, 0.05)); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .highlight-box.cyan { background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.05)); border-color: rgba(0, 240, 255, 0.3); }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border-color: rgba(16, 185, 129, 0.3); }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1rem 0; }
        .grid-item { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; text-align: center; }
        .grid-item.gold { border-color: #FFBD59; background: rgba(255, 189, 89, 0.05); }
        .grid-item.cyan { border-color: #00F0FF; background: rgba(0, 240, 255, 0.05); }
        .grid-item.purple { border-color: #8B5CF6; background: rgba(139, 92, 246, 0.05); }
        .step-card { display: flex; gap: 1rem; margin: 1rem 0; padding: 1.25rem; background: rgba(255, 255, 255, 0.02); border-radius: 0.5rem; border-left: 4px solid #FFBD59; }
        .step-number { width: 48px; height: 48px; background: linear-gradient(135deg, #FFBD59, #f59e0b); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700; color: #000; flex-shrink: 0; }
        .step-content h4 { color: #fff; margin-bottom: 0.5rem; font-size: 1rem; }
        .cta-box { background: linear-gradient(135deg, #112250, #1a1a2e); border: 2px solid #FFBD59; border-radius: 0.75rem; padding: 1.5rem; margin: 1rem 0; text-align: center; }
        .cta-box h3 { color: #FFBD59; font-size: 1.25rem; margin-bottom: 0.75rem; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #FFBD59, #f59e0b); color: #000; padding: 0.875rem 2rem; border-radius: 0.5rem; font-weight: 700; text-decoration: none; margin-top: 1rem; }
        .contact-card { background: rgba(255, 255, 255, 0.02); border: 1px solid #27272a; border-radius: 0.5rem; padding: 1rem; margin: 0.5rem 0; display: flex; align-items: center; gap: 1rem; }
        .contact-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #FFBD59, #f59e0b); border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
        .image-placeholder { background: linear-gradient(135deg, #1a1a2e, #112250); border: 2px dashed #27272a; border-radius: 0.5rem; padding: 3rem 1rem; text-align: center; margin: 1rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 0.375rem; }
        .image-caption { font-size: 0.8rem; color: #71717a; margin-top: 0.5rem; }
        .summary-box { background: linear-gradient(135deg, #112250, #1a1a2e); border: 1px solid #FFBD59; border-radius: 0.75rem; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #FFBD59; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-list { list-style: none; }
        .summary-list li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
        .summary-list li::before { content: "→"; position: absolute; left: 0; color: #FFBD59; }
        .congrats-box { background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1)); border: 2px solid #10B981; border-radius: 0.75rem; padding: 2rem; text-align: center; margin: 1rem; }
        .congrats-box h2 { color: #10B981; font-size: 1.5rem; margin-bottom: 0.5rem; }
        .quiz-section { background: #18181b; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #27272a; }
        .quiz-question { background: rgba(255, 255, 255, 0.02); padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .question-text { font-weight: 600; color: #fff; margin-bottom: 1rem; }
        .quiz-option { padding: 0.875rem 1rem; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.03); border: 1px solid #27272a; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; }
        .quiz-option:hover { border-color: #FFBD59; background: rgba(255, 189, 89, 0.1); }
        .quiz-option.correct { border-color: #10B981; background: rgba(16, 185, 129, 0.2); }
        .quiz-option.incorrect { border-color: #ef4444; background: rgba(239, 68, 68, 0.2); }
        .option-letter { width: 24px; height: 24px; border-radius: 50%; background: #27272a; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
        .quiz-result { padding: 0.75rem; margin-top: 0.75rem; border-radius: 0.375rem; font-weight: 500; display: none; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(245, 158, 11, 0.05)); border-radius: 0.5rem; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .score-text { font-size: 1.5rem; font-weight: 700; color: #FFBD59; }
        .retake-btn { background: linear-gradient(135deg, #FFBD59, #f59e0b); color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.8rem; border-top: 1px solid #27272a; margin-top: 2rem; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .congrats-box { margin: 0; border-radius: 0; border-left: 4px solid #27272a; border-right: none; border-top: none; border-bottom: 1px solid #27272a; padding: 1.25rem 1rem; }
            .summary-box, .quiz-section { margin: 0; border-radius: 0; }
            .grid-3 { grid-template-columns: 1fr; gap: 0.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="lesson-header">
            <span class="lesson-badge">Kết Thúc Tier 2</span>
            <h1 class="lesson-title">Bài 8.7: Các Bước Tiếp Theo</h1>
            <p class="lesson-subtitle">Hành động cụ thể sau khi hoàn thành Tier 2</p>
        </div>

        <div class="congrats-box">
            <h2>🎉 Chúc Mừng!</h2>
            <p style="font-size: 1.1rem; margin-bottom: 1rem;">Bạn đã hoàn thành Tier 2 - GEM Advanced!</p>
            <p style="color: #a1a1aa;">Bạn đã nắm vững những kiến thức và kỹ năng nâng cao trong trading. Bây giờ là lúc quyết định bước tiếp theo.</p>
        </div>

        <div class="content-section">
            <span class="section-label">📊 Tổng kết</span>
            <h2 class="section-title">Những Gì Bạn Đã Học Trong Tier 2</h2>

            <div class="grid-3">
                <div class="grid-item gold">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📈</div>
                    <h4 style="color: #FFBD59; margin-bottom: 0.25rem;">Advanced Patterns</h4>
                    <p style="font-size: 0.85rem; color: #a1a1aa;">12 patterns nâng cao</p>
                </div>
                <div class="grid-item cyan">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎯</div>
                    <h4 style="color: #00F0FF; margin-bottom: 0.25rem;">Entry Mastery</h4>
                    <p style="font-size: 0.85rem; color: #a1a1aa;">Kỹ thuật vào lệnh chính xác</p>
                </div>
                <div class="grid-item purple">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚖️</div>
                    <h4 style="color: #8B5CF6; margin-bottom: 0.25rem;">Risk Management</h4>
                    <p style="font-size: 0.85rem; color: #a1a1aa;">Quản lý rủi ro chuyên nghiệp</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/112250/10B981?text=Tier+2+Completion+-+Certificate" alt="Tier 2 Completion">
                <p class="image-caption">Hình 8.7.1: Hoàn thành Tier 2 - GEM Advanced</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">🚀 Lộ trình</span>
            <h2 class="section-title">3 Lựa Chọn Cho Bước Tiếp Theo</h2>

            <div class="step-card">
                <div class="step-number">A</div>
                <div class="step-content">
                    <h4>Tiếp Tục Tự Thực Hành</h4>
                    <p>Áp dụng kiến thức Tier 2 vào Paper Trading. Tự đánh giá và cải thiện. Phù hợp nếu bạn có thời gian và kiên nhẫn để tự học.</p>
                </div>
            </div>

            <div class="step-card" style="border-left-color: #00F0FF;">
                <div class="step-number" style="background: linear-gradient(135deg, #00F0FF, #0ea5e9);">B</div>
                <div class="step-content">
                    <h4>Nâng Cấp Lên Tier 3 - Elite</h4>
                    <p>Học tiếp kiến thức Elite: Multi-Timeframe Analysis, Advanced Confluence, Institutional Trading Concepts. Nhận hỗ trợ từ cộng đồng GEM.</p>
                </div>
            </div>

            <div class="step-card" style="border-left-color: #8B5CF6;">
                <div class="step-number" style="background: linear-gradient(135deg, #8B5CF6, #7c3aed);">C</div>
                <div class="step-content">
                    <h4>Tham Gia Partner Program</h4>
                    <p>Mentorship 1-1, Signal Group riêng, Thu nhập thụ động 10-30% theo tier CTV. Đường nhanh nhất đến kết quả, phù hợp cho ai muốn nghiêm túc theo đuổi.</p>
                </div>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📋 Hành động</span>
            <h2 class="section-title">Các Bước Tiếp Theo Cụ Thể</h2>

            <div class="step-card">
                <div class="step-number">1</div>
                <div class="step-content">
                    <h4>Xem Lại Kết Quả Paper Trading</h4>
                    <p>Đánh giá win rate, R:R trung bình, số trade mỗi tuần. Xác định điểm mạnh và điểm cần cải thiện.</p>
                </div>
            </div>

            <div class="step-card">
                <div class="step-number">2</div>
                <div class="step-content">
                    <h4>Áp Dụng Framework Quyết Định</h4>
                    <p>Sử dụng 5-Step Framework từ Bài 8.6. Xác định mục tiêu, đánh giá tình huống, phân tích các lựa chọn.</p>
                </div>
            </div>

            <div class="step-card">
                <div class="step-number">3</div>
                <div class="step-content">
                    <h4>Liên Hệ Nếu Cần Tư Vấn</h4>
                    <p>Đội ngũ GEM sẵn sàng hỗ trợ bạn chọn hướng đi phù hợp nhất. Không có áp lực, chỉ có giải đáp thắc mắc.</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://via.placeholder.com/700x350/112250/FFBD59?text=Next+Steps+-+Action+Plan" alt="Action Plan">
                <p class="image-caption">Hình 8.7.2: Lộ trình hành động sau Tier 2</p>
            </div>
        </div>

        <div class="content-section">
            <span class="section-label">📞 Liên hệ</span>
            <h2 class="section-title">Kênh Hỗ Trợ</h2>

            <div class="contact-card">
                <div class="contact-icon">💬</div>
                <div>
                    <strong>GEM Master Chatbot</strong>
                    <p style="font-size: 0.9rem; color: #a1a1aa;">Hỏi đáp 24/7 trong App GEM</p>
                </div>
            </div>

            <div class="contact-card">
                <div class="contact-icon">👥</div>
                <div>
                    <strong>Cộng Đồng GEM Forum</strong>
                    <p style="font-size: 0.9rem; color: #a1a1aa;">Kết nối với các trader khác trong App</p>
                </div>
            </div>

            <div class="contact-card">
                <div class="contact-icon">📧</div>
                <div>
                    <strong>Email Support</strong>
                    <p style="font-size: 0.9rem; color: #a1a1aa;">support@gemtrading.academy</p>
                </div>
            </div>

            <div class="contact-card">
                <div class="contact-icon">🎓</div>
                <div>
                    <strong>Tư Vấn Nâng Cấp</strong>
                    <p style="font-size: 0.9rem; color: #a1a1aa;">Liên hệ trong App để được tư vấn 1-1</p>
                </div>
            </div>
        </div>

        <div class="cta-box">
            <h3>🎯 Sẵn Sàng Cho Bước Tiếp Theo?</h3>
            <p>Dù bạn chọn con đường nào, GEM luôn đồng hành cùng bạn.</p>
            <p style="margin-top: 0.75rem; color: #a1a1aa; font-size: 0.9rem;">Tier 3 Elite hoặc Partner Program - Cơ hội để đạt level tiếp theo trong hành trình trading.</p>
            <div class="image-placeholder" style="margin-top: 1rem; padding: 2rem;">
                <img src="https://via.placeholder.com/600x300/112250/FFBD59?text=GEM+Academy+-+Your+Journey+Continues" alt="Your Journey Continues">
                <p class="image-caption">Hình 8.7.3: Hành trình của bạn tiếp tục...</p>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Tóm Tắt Tier 2</h3>
            <ul class="summary-list">
                <li>Hoàn thành 43 bài học nâng cao về GEM Method</li>
                <li>Nắm vững 12 Advanced Patterns và Entry Techniques</li>
                <li>Hiểu sâu Risk Management và Position Sizing chuyên nghiệp</li>
                <li>3 lựa chọn tiếp theo: Tự thực hành, Tier 3, hoặc Partner Program</li>
                <li>Sử dụng Framework Quyết Định để chọn hướng phù hợp nhất</li>
            </ul>
        </div>

        <div class="quiz-section">
            <span class="section-label">📝 Final Quiz</span>
            <h2 class="section-title">Quiz Cuối Tier 2</h2>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">1. Sau khi hoàn thành Tier 2, bước đầu tiên nên làm là gì?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Ngay lập tức nâng cấp Tier 3</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Nghỉ ngơi và quên đi trading</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Xem lại kết quả Paper Trading và áp dụng Framework Quyết Định</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">2. Partner Program phù hợp với ai nhất?</p>
                <div class="quiz-option" data-index="0">
                    <span class="option-letter">A</span>
                    <span>Người mới hoàn toàn chưa biết gì về trading</span>
                </div>
                <div class="quiz-option" data-index="1">
                    <span class="option-letter">B</span>
                    <span>Người muốn kết quả nhanh nhất với mentorship 1-1 và thu nhập thụ động</span>
                </div>
                <div class="quiz-option" data-index="2">
                    <span class="option-letter">C</span>
                    <span>Người chỉ muốn học lý thuyết mà không thực hành</span>
                </div>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="score-text">Kết quả: <span id="correct-count">0</span>/2</p>
                <p style="margin-top: 0.5rem;">🎉 Chúc mừng hoàn thành Tier 2!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại</button>
            </div>
        </div>

        <div class="lesson-footer">
            <p>© 2024 GEM Trading Academy - Tier 2 Complete!</p>
            <p style="margin-top: 0.5rem; color: #FFBD59;">Cảm ơn bạn đã học cùng GEM. Hẹn gặp lại ở Tier 3! 🚀</p>
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
  7,
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

-- ✅ Done: 7 lessons
