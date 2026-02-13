-- =====================================================
-- TIER-1 - Chương 4: UPD Pattern
-- Course: course-tier1-trading-foundation
-- File 2/23
-- =====================================================

-- Create/Update Module
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  'module-tier-1-ch4',
  'course-tier1-trading-foundation',
  'Chương 4: UPD Pattern',
  'Hiểu về UPD Pattern và ứng dụng',
  4,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Lesson 4.1: UPD Là Gì?
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch4-l1',
  'module-tier-1-ch4',
  'course-tier1-trading-foundation',
  'Bài 4.1: UPD Là Gì?',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 4.1: UPD Là Gì? | GEM Trading Academy</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <style>
        :root {
            --navy: #112250;
            --navy-dark: #0a1628;
            --gold: #FFBD59;
            --gold-dark: #E5A73D;
            --cyan: #00F0FF;
            --purple: #6A5BFF;
            --burgundy: #9C0612;
            --burgundy-light: #C41E2A;
            --success: #00C853;
            --error: #FF5252;
            --bg-primary: #0a1628;
            --bg-card: rgba(17, 34, 80, 0.6);
            --text-primary: #FFFFFF;
            --text-secondary: rgba(255, 255, 255, 0.85);
            --text-muted: rgba(255, 255, 255, 0.6);
            --glass-bg: rgba(17, 34, 80, 0.4);
            --glass-border: rgba(255, 189, 89, 0.2);
            --space-xs: 4px;
            --space-sm: 8px;
            --space-md: 16px;
            --space-lg: 24px;
            --space-xl: 32px;
            --radius-md: 12px;
            --radius-lg: 16px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: ''Montserrat'', sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
        }

        img { max-width: 100%; height: auto; display: block; }

        .background-container { position: fixed; inset: 0; z-index: -1; }
        .bg-layer-base { position: absolute; inset: 0; background: linear-gradient(180deg, var(--navy-dark) 0%, var(--navy) 50%, var(--navy-dark) 100%); }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3; }
        .orb-1 { width: 400px; height: 400px; background: var(--gold); top: -100px; right: -100px; }
        .orb-2 { width: 300px; height: 300px; background: var(--cyan); bottom: 20%; left: -100px; }
        .orb-3 { width: 250px; height: 250px; background: var(--burgundy); bottom: -50px; right: 20%; }

        .lesson-container { max-width: 800px; margin: 0 auto; padding: 1.5rem; }
        @media (max-width: 600px) { .lesson-container { padding: 0; } }

        .lesson-header { text-align: center; padding: var(--space-xl); margin-bottom: var(--space-xl); background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); box-shadow: 0 4px 24px rgba(0,0,0,0.2); }
        @media (max-width: 600px) { .lesson-header { padding: var(--space-lg) 16px; margin-bottom: 0; border: none; border-radius: 0; box-shadow: none; border-bottom: 8px solid var(--bg-primary); } }
        .lesson-badge { display: inline-flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); background: linear-gradient(135deg, var(--burgundy), var(--burgundy-light)); border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: var(--space-md); }
        .lesson-chapter { font-size: 0.9rem; color: var(--gold); font-weight: 600; margin-bottom: var(--space-sm); text-transform: uppercase; letter-spacing: 2px; }
        .lesson-title { font-size: clamp(1.75rem, 5vw, 2.5rem); font-weight: 800; margin-bottom: var(--space-md); background: linear-gradient(135deg, var(--text-primary), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lesson-meta { display: flex; justify-content: center; gap: var(--space-lg); flex-wrap: wrap; color: var(--text-muted); font-size: 0.85rem; }
        .meta-item { display: flex; align-items: center; gap: var(--space-xs); }

        .section { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); box-shadow: 0 4px 24px rgba(0,0,0,0.2); padding: var(--space-xl); margin-bottom: var(--space-lg); }
        @media (max-width: 600px) { .section { padding: 0; margin-bottom: 0; border: none; border-radius: 0; box-shadow: none; border-bottom: 8px solid var(--bg-primary); } }

        .section-title { font-size: 1.5rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
        @media (max-width: 600px) { .section-title { padding: var(--space-lg) 16px var(--space-md) 16px; margin-bottom: 0; } }

        .section > p { color: var(--text-secondary); margin-bottom: var(--space-md); }
        @media (max-width: 600px) { .section > p { padding: 0 16px; } }

        .highlight-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15), rgba(255, 189, 89, 0.05)); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .highlight-box { border: none; border-radius: 0; border-left: 4px solid var(--gold); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .highlight-box-title { font-weight: 700; color: var(--gold); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }
        .highlight-box p { color: var(--text-secondary); margin: 0; }

        .definition-box { background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.02)); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .definition-box { border: none; border-radius: 0; border-left: 4px solid var(--cyan); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .definition-box-title { font-weight: 700; color: var(--cyan); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }

        .warning-box { background: linear-gradient(135deg, rgba(156, 6, 18, 0.2), rgba(156, 6, 18, 0.05)); border: 1px solid rgba(156, 6, 18, 0.4); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .warning-box { border: none; border-radius: 0; border-left: 4px solid var(--burgundy); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .warning-box-title { font-weight: 700; color: var(--burgundy-light); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }

        .image-container { margin: var(--space-xl) 0; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--glass-border); }
        @media (max-width: 600px) { .image-container { margin: var(--space-md) 0; border-radius: 0; border: none; } }
        .image-caption { padding: var(--space-sm); font-size: 0.85rem; color: var(--text-muted); font-style: italic; text-align: center; }
        @media (max-width: 600px) { .image-caption { padding: var(--space-sm) 16px; } }

        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 1px; background: var(--glass-border); margin: var(--space-md) 0; } }
        .stat-card { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); text-align: center; }
        @media (max-width: 600px) { .stat-card { border: none; border-radius: 0; padding: var(--space-md); } }
        .stat-value { font-size: 1.75rem; font-weight: 800; background: linear-gradient(135deg, var(--gold), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        @media (max-width: 600px) { .stat-value { font-size: 1.25rem; } }
        .stat-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }

        .formula-box { background: linear-gradient(135deg, rgba(106, 91, 255, 0.15), rgba(106, 91, 255, 0.05)); border: 2px solid var(--purple); border-radius: var(--radius-lg); padding: var(--space-xl); margin: var(--space-xl) 0; text-align: center; }
        @media (max-width: 600px) { .formula-box { border: none; border-radius: 0; border-left: 4px solid var(--purple); padding: var(--space-lg) 16px; margin: var(--space-md) 0; } }
        .formula-title { font-size: 1.1rem; font-weight: 700; color: var(--purple); margin-bottom: var(--space-md); }
        .formula-content { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: var(--space-sm); }
        .formula-item { background: var(--bg-card); padding: var(--space-sm) var(--space-md); border-radius: var(--space-sm); border: 1px solid var(--glass-border); font-weight: 600; }
        .formula-operator { color: var(--gold); font-size: 1.25rem; }

        .patterns-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-md); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .patterns-grid { gap: 1px; background: var(--glass-border); margin: var(--space-md) 0; } }
        .pattern-card { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); text-align: center; }
        @media (max-width: 600px) { .pattern-card { border: none; border-radius: 0; padding: var(--space-md); } }
        .pattern-icon { font-size: 2.5rem; margin-bottom: var(--space-sm); }
        .pattern-name { font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-xs); }
        .pattern-desc { font-size: 0.85rem; color: var(--text-muted); }

        .summary-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.02)); border: 2px solid var(--gold); border-radius: var(--radius-lg); padding: var(--space-xl); margin: var(--space-xl) 0; }
        @media (max-width: 600px) { .summary-box { border: none; border-radius: 0; border-left: 4px solid var(--gold); padding: var(--space-lg) 16px; margin: var(--space-md) 0; } }
        .summary-title { font-size: 1.25rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
        .summary-list { list-style: none; }
        .summary-list li { display: flex; align-items: flex-start; gap: var(--space-sm); margin-bottom: var(--space-md); color: var(--text-secondary); }
        .summary-list li::before { content: "✓"; color: var(--gold); font-weight: 700; }

        .quiz-section { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: var(--space-xl); margin-top: var(--space-xl); }
        @media (max-width: 600px) { .quiz-section { border: none; border-radius: 0; padding: 0; margin-top: 0; border-top: 8px solid var(--bg-primary); } }
        .quiz-header { text-align: center; margin-bottom: var(--space-xl); }
        @media (max-width: 600px) { .quiz-header { padding: var(--space-lg) 16px var(--space-md); margin-bottom: 0; } }
        .quiz-title { font-size: 1.5rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-sm); }
        .quiz-subtitle { color: var(--text-muted); font-size: 0.9rem; }

        .quiz-question { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); margin-bottom: var(--space-lg); }
        @media (max-width: 600px) { .quiz-question { border: none; border-radius: 0; border-left: 4px solid var(--purple); padding: var(--space-md) 16px; margin-bottom: 0; border-bottom: 1px solid var(--glass-border); } }
        .question-number { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); border-radius: 50%; font-weight: 700; color: var(--navy-dark); margin-bottom: var(--space-md); }
        .question-text { font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-lg); line-height: 1.6; }

        .quiz-options { display: flex; flex-direction: column; gap: var(--space-sm); }
        @media (max-width: 600px) { .quiz-options { gap: 1px; background: var(--glass-border); margin-left: -16px; margin-right: -16px; margin-left: calc(-16px - 4px); } }
        .quiz-option { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md); background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: var(--radius-md); cursor: pointer; transition: all 0.3s ease; }
        @media (max-width: 600px) { .quiz-option { border: none; border-radius: 0; border-left: 4px solid transparent; padding: var(--space-md) 16px; } }
        .quiz-option:hover:not(.disabled) { border-color: var(--gold); background: var(--bg-card); }
        @media (max-width: 600px) { .quiz-option:hover:not(.disabled) { border-left-color: var(--gold); } }
        .quiz-option.selected { border-color: var(--gold); background: rgba(255, 189, 89, 0.1); }
        @media (max-width: 600px) { .quiz-option.selected { border-left-color: var(--gold); } }
        .quiz-option.correct { border-color: var(--success) !important; background: rgba(0, 200, 83, 0.15) !important; }
        @media (max-width: 600px) { .quiz-option.correct { border-left-color: var(--success) !important; } }
        .quiz-option.incorrect { border-color: var(--error) !important; background: rgba(255, 82, 82, 0.15) !important; }
        @media (max-width: 600px) { .quiz-option.incorrect { border-left-color: var(--error) !important; } }
        .quiz-option.disabled { opacity: 0.7; cursor: not-allowed; }
        .option-marker { width: 28px; height: 28px; min-width: 28px; background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; }
        .quiz-option.selected .option-marker { background: var(--gold); border-color: var(--gold); color: var(--navy-dark); }
        .quiz-option.correct .option-marker { background: var(--success); border-color: var(--success); color: white; }
        .quiz-option.incorrect .option-marker { background: var(--error); border-color: var(--error); color: white; }
        .option-text { flex: 1; color: var(--text-secondary); }

        .question-feedback { margin-top: var(--space-md); padding: var(--space-md); border-radius: var(--space-sm); display: none; }
        .question-feedback.show { display: block; }
        .question-feedback.correct { background: rgba(0, 200, 83, 0.15); border-left: 4px solid var(--success); }
        .question-feedback.incorrect { background: rgba(255, 82, 82, 0.15); border-left: 4px solid var(--error); }
        .feedback-title { font-weight: 700; margin-bottom: var(--space-xs); }
        .question-feedback.correct .feedback-title { color: var(--success); }
        .question-feedback.incorrect .feedback-title { color: var(--error); }
        .feedback-text { font-size: 0.9rem; color: var(--text-secondary); }

        .quiz-result { text-align: center; padding: var(--space-xl); display: none; }
        .quiz-result.show { display: block; }
        .result-score { font-size: 3rem; font-weight: 800; background: linear-gradient(135deg, var(--gold), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: var(--space-md); }
        .result-text { font-size: 1.25rem; font-weight: 700; margin-bottom: var(--space-sm); }
        .result-message { color: var(--text-muted); }

        .quiz-buttons { display: flex; justify-content: center; padding: var(--space-lg); }
        @media (max-width: 600px) { .quiz-buttons { padding: var(--space-lg) 16px; } }
        .quiz-btn { padding: var(--space-md) var(--space-xl); border-radius: var(--radius-md); font-weight: 700; cursor: pointer; border: none; font-family: inherit; background: var(--glass-bg); color: var(--text-primary); border: 2px solid var(--glass-border); }
        .quiz-btn:hover { border-color: var(--gold); }
    </style>
</head>
<body>
    <div class="background-container">
        <div class="bg-layer-base"></div>
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
    </div>

    <div class="lesson-container">

        <header class="lesson-header">
            <div class="lesson-badge">
                <span>📉</span>
                <span>Reversal Pattern</span>
            </div>
            <div class="lesson-chapter">Chapter 4 - UPD Pattern</div>
            <h1 class="lesson-title">UPD Là Gì?</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 4.1</span></div>
                <div class="meta-item"><span>⏱️</span><span>7 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <section class="section">
            <h2 class="section-title"><span>🎯</span> Mục Tiêu Bài Học</h2>
            <p>Trong bài học này, bạn sẽ được giới thiệu về pattern UPD (Up-Pause-Down) - một trong những pattern ĐẢO CHIỀU mạnh nhất trong hệ thống GEM Frequency Trading.</p>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>⭐</span> Pattern Mạnh!</div>
                <p>UPD là pattern REVERSAL (đảo chiều), mạnh hơn DPD (continuation) vì nó bắt được <strong>điểm đảo chiều xu hướng</strong> - nơi Smart Money phân phối tài sản và Retail bị bẫy.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📖</span> Định Nghĩa UPD</h2>
            <p>UPD là viết tắt của <strong>Up - Pause - Down</strong>, mô tả chuyển động giá đặc trưng:</p>

            <div class="definition-box">
                <div class="definition-box-title"><span>📚</span> UPD - Up Pause Down</div>
                <p><strong>Tăng → Nghỉ → Giảm</strong> - Giá tăng mạnh, sau đó đi ngang (tích lũy/phân phối), rồi đảo chiều giảm. Đây là pattern đảo chiều xu hướng, báo hiệu kết thúc trend tăng.</p>
            </div>

            <div class="formula-box">
                <div class="formula-title">🔄 Công Thức UPD</div>
                <div class="formula-content">
                    <span class="formula-item">📈 UP</span>
                    <span class="formula-operator">→</span>
                    <span class="formula-item">⏸️ PAUSE</span>
                    <span class="formula-operator">→</span>
                    <span class="formula-item">📉 DOWN</span>
                </div>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/FFBD59?text=UPD+Pattern+Structure" alt="UPD Structure">
            </div>
            <div class="image-caption">Hình 1: Cấu trúc pattern UPD - Tăng → Nghỉ → Giảm</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📊</span> Thông Số Quan Trọng</h2>
            <p>Dưới đây là các thông số backtest của pattern UPD trên thị trường crypto:</p>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">65%</div>
                    <div class="stat-label">Win Rate</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">1:2.2</div>
                    <div class="stat-label">Avg R:R</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">HFZ</div>
                    <div class="stat-label">Zone Tạo Ra</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">⭐</div>
                    <div class="stat-label">Độ Mạnh</div>
                </div>
            </div>

            <div class="patterns-grid">
                <div class="pattern-card">
                    <div class="pattern-icon">🔄</div>
                    <div class="pattern-name">Loại Pattern</div>
                    <div class="pattern-desc">REVERSAL - Đảo chiều xu hướng giảm</div>
                </div>
                <div class="pattern-card">
                    <div class="pattern-icon">📍</div>
                    <div class="pattern-name">Zone Tạo Ra</div>
                    <div class="pattern-desc">HFZ - High Frequency Zone (Vùng Bán)</div>
                </div>
                <div class="pattern-card">
                    <div class="pattern-icon">📉</div>
                    <div class="pattern-name">Hướng Trade</div>
                    <div class="pattern-desc">SHORT - Vào lệnh bán khi retest HFZ</div>
                </div>
                <div class="pattern-card">
                    <div class="pattern-icon">⚡</div>
                    <div class="pattern-name">Sức Mạnh</div>
                    <div class="pattern-desc">MẠNH hơn DPD - Bắt đỉnh xu hướng</div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>⚡</span> Tại Sao UPD Mạnh Hơn DPD?</h2>
            <p>UPD và DPD đều tạo ra HFZ, nhưng UPD mạnh hơn vì lý do sau:</p>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>💡</span> Logic Đằng Sau UPD</div>
                <p>UPD xuất hiện tại ĐỈNH xu hướng tăng. Đây là nơi Smart Money <strong>phân phối tài sản</strong> cho Retail đang FOMO mua đuổi. Khi giá quay lại test HFZ, áp lực bán từ Smart Money còn rất mạnh.</p>
            </div>

            <div class="warning-box">
                <div class="warning-box-title"><span>🔍</span> Bẫy Giá Kinh Điển</div>
                <p>Trong Phase 1 (UP), Retail thấy giá tăng mạnh và FOMO mua đuổi. Trong Phase 2 (PAUSE), Smart Money bán dần cho Retail. Phase 3 (DOWN) là lúc bẫy sập - Retail bị kẹt ở đỉnh.</p>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/FF5252?text=Smart+Money+Distribution+at+UPD" alt="Smart Money Distribution">
            </div>
            <div class="image-caption">Hình 2: Smart Money phân phối tại vùng PAUSE của UPD</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>🆚</span> So Sánh UPD vs DPD</h2>
            <p>Hiểu rõ sự khác biệt giữa UPD và DPD sẽ giúp bạn chọn đúng pattern cho từng tình huống:</p>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/00F0FF?text=UPD+vs+DPD+Comparison" alt="UPD vs DPD">
            </div>
            <div class="image-caption">Hình 3: So sánh UPD (Reversal) và DPD (Continuation)</div>

            <div class="definition-box">
                <div class="definition-box-title"><span>📊</span> Khi Nào Dùng UPD?</div>
                <p>Sử dụng UPD khi bạn nhận thấy xu hướng tăng đã kéo dài và có dấu hiệu kiệt sức. UPD giúp bạn bắt được điểm đảo chiều - nơi trend tăng kết thúc và trend giảm bắt đầu.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📝</span> Tổng Kết</h2>

            <div class="summary-box">
                <div class="summary-title"><span>🎯</span> Điểm Chính</div>
                <ul class="summary-list">
                    <li>UPD = Up-Pause-Down (Tăng-Nghỉ-Giảm) - Pattern đảo chiều xu hướng giảm</li>
                    <li>Tạo ra HFZ (High Frequency Zone) - Vùng Bán mạnh</li>
                    <li>Win Rate 65%, R:R trung bình 1:2.2</li>
                    <li>MẠNH hơn DPD vì bắt được điểm đảo chiều, nơi Smart Money phân phối</li>
                    <li>Sử dụng khi xu hướng tăng có dấu hiệu kiệt sức</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-header">
                <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>
                <p class="quiz-subtitle">Chọn đáp án để nhận phản hồi ngay lập tức</p>
            </div>

            <div class="quiz-question" data-question="1" data-correct="B">
                <div class="question-number">1</div>
                <div class="question-text">UPD là viết tắt của gì?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Up-Push-Down</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Up-Pause-Down</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Ultra-Price-Drop</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Up-Peak-Down</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-question" data-question="2" data-correct="C">
                <div class="question-number">2</div>
                <div class="question-text">Tại sao UPD được coi là pattern mạnh hơn DPD?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Vì UPD có Win Rate cao hơn</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Vì UPD xuất hiện nhiều hơn</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Vì UPD bắt được điểm đảo chiều xu hướng</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Vì UPD tạo ra zone rộng hơn</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-result">
                <div class="result-score">0/2</div>
                <div class="result-text">Hoàn thành!</div>
                <div class="result-message"></div>
            </div>

            <div class="quiz-buttons">
                <button class="quiz-btn" id="retakeQuiz" style="display: none;">Làm Lại</button>
            </div>
        </section>

    </div>

    <script>
        document.addEventListener(''DOMContentLoaded'', function() {
            const questions = document.querySelectorAll(''.quiz-question'');
            const retakeBtn = document.getElementById(''retakeQuiz'');
            const resultDiv = document.querySelector(''.quiz-result'');

            let answeredCount = 0;
            let correctCount = 0;
            const totalQuestions = 2;

            const explanations = {
                1: {
                    correct: ''✓ Chính xác! UPD = Up-Pause-Down, mô tả chuyển động: Tăng → Nghỉ → Giảm.'',
                    incorrect: ''✗ Sai! UPD là viết tắt của Up-Pause-Down (Tăng-Nghỉ-Giảm).''
                },
                2: {
                    correct: ''✓ Chính xác! UPD mạnh hơn vì nó là pattern đảo chiều, bắt được điểm kết thúc xu hướng tăng.'',
                    incorrect: ''✗ Sai! UPD mạnh hơn DPD vì nó bắt được điểm đảo chiều xu hướng - nơi Smart Money phân phối.''
                }
            };

            questions.forEach(question => {
                const options = question.querySelectorAll(''.quiz-option'');
                const correctAnswer = question.dataset.correct;
                const questionNum = question.dataset.question;
                const feedbackDiv = question.querySelector(''.question-feedback'');
                const feedbackTitle = feedbackDiv.querySelector(''.feedback-title'');
                const feedbackText = feedbackDiv.querySelector(''.feedback-text'');

                options.forEach(option => {
                    option.addEventListener(''click'', function() {
                        if (question.classList.contains(''answered'')) return;

                        question.classList.add(''answered'');
                        answeredCount++;

                        const selectedOption = this.dataset.option;
                        const isCorrect = selectedOption === correctAnswer;

                        options.forEach(opt => opt.classList.add(''disabled''));
                        this.classList.add(''selected'');

                        if (isCorrect) {
                            this.classList.add(''correct'');
                            correctCount++;
                            feedbackDiv.classList.add(''correct'');
                            feedbackTitle.textContent = ''✓ Chính xác!'';
                            feedbackText.textContent = explanations[questionNum].correct;
                        } else {
                            this.classList.add(''incorrect'');
                            feedbackDiv.classList.add(''incorrect'');
                            feedbackTitle.textContent = ''✗ Sai rồi!'';
                            feedbackText.textContent = explanations[questionNum].incorrect;
                            options.forEach(opt => {
                                if (opt.dataset.option === correctAnswer) {
                                    opt.classList.add(''correct'');
                                }
                            });
                        }

                        feedbackDiv.classList.add(''show'');

                        if (answeredCount === totalQuestions) {
                            const scoreDiv = resultDiv.querySelector(''.result-score'');
                            const messageDiv = resultDiv.querySelector(''.result-message'');
                            scoreDiv.textContent = `${correctCount}/${totalQuestions}`;

                            if (correctCount === totalQuestions) {
                                messageDiv.textContent = ''🎉 Xuất sắc! Bạn đã nắm vững định nghĩa UPD!'';
                            } else if (correctCount >= 1) {
                                messageDiv.textContent = ''👍 Tốt! Tiếp tục học các bài tiếp theo!'';
                            } else {
                                messageDiv.textContent = ''📚 Đọc lại phần định nghĩa để hiểu rõ hơn!'';
                            }

                            resultDiv.classList.add(''show'');
                            retakeBtn.style.display = ''inline-block'';
                        }
                    });
                });
            });

            retakeBtn.addEventListener(''click'', function() {
                answeredCount = 0;
                correctCount = 0;

                questions.forEach(question => {
                    question.classList.remove(''answered'');
                    const options = question.querySelectorAll(''.quiz-option'');
                    const feedbackDiv = question.querySelector(''.question-feedback'');

                    options.forEach(opt => {
                        opt.classList.remove(''selected'', ''correct'', ''incorrect'', ''disabled'');
                    });
                    feedbackDiv.classList.remove(''show'', ''correct'', ''incorrect'');
                });

                resultDiv.classList.remove(''show'');
                retakeBtn.style.display = ''none'';
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
    <title>Bài 4.1: UPD Là Gì? | GEM Trading Academy</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <style>
        :root {
            --navy: #112250;
            --navy-dark: #0a1628;
            --gold: #FFBD59;
            --gold-dark: #E5A73D;
            --cyan: #00F0FF;
            --purple: #6A5BFF;
            --burgundy: #9C0612;
            --burgundy-light: #C41E2A;
            --success: #00C853;
            --error: #FF5252;
            --bg-primary: #0a1628;
            --bg-card: rgba(17, 34, 80, 0.6);
            --text-primary: #FFFFFF;
            --text-secondary: rgba(255, 255, 255, 0.85);
            --text-muted: rgba(255, 255, 255, 0.6);
            --glass-bg: rgba(17, 34, 80, 0.4);
            --glass-border: rgba(255, 189, 89, 0.2);
            --space-xs: 4px;
            --space-sm: 8px;
            --space-md: 16px;
            --space-lg: 24px;
            --space-xl: 32px;
            --radius-md: 12px;
            --radius-lg: 16px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: ''Montserrat'', sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
        }

        img { max-width: 100%; height: auto; display: block; }

        .background-container { position: fixed; inset: 0; z-index: -1; }
        .bg-layer-base { position: absolute; inset: 0; background: linear-gradient(180deg, var(--navy-dark) 0%, var(--navy) 50%, var(--navy-dark) 100%); }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3; }
        .orb-1 { width: 400px; height: 400px; background: var(--gold); top: -100px; right: -100px; }
        .orb-2 { width: 300px; height: 300px; background: var(--cyan); bottom: 20%; left: -100px; }
        .orb-3 { width: 250px; height: 250px; background: var(--burgundy); bottom: -50px; right: 20%; }

        .lesson-container { max-width: 800px; margin: 0 auto; padding: 1.5rem; }
        @media (max-width: 600px) { .lesson-container { padding: 0; } }

        .lesson-header { text-align: center; padding: var(--space-xl); margin-bottom: var(--space-xl); background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); box-shadow: 0 4px 24px rgba(0,0,0,0.2); }
        @media (max-width: 600px) { .lesson-header { padding: var(--space-lg) 16px; margin-bottom: 0; border: none; border-radius: 0; box-shadow: none; border-bottom: 8px solid var(--bg-primary); } }
        .lesson-badge { display: inline-flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); background: linear-gradient(135deg, var(--burgundy), var(--burgundy-light)); border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: var(--space-md); }
        .lesson-chapter { font-size: 0.9rem; color: var(--gold); font-weight: 600; margin-bottom: var(--space-sm); text-transform: uppercase; letter-spacing: 2px; }
        .lesson-title { font-size: clamp(1.75rem, 5vw, 2.5rem); font-weight: 800; margin-bottom: var(--space-md); background: linear-gradient(135deg, var(--text-primary), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lesson-meta { display: flex; justify-content: center; gap: var(--space-lg); flex-wrap: wrap; color: var(--text-muted); font-size: 0.85rem; }
        .meta-item { display: flex; align-items: center; gap: var(--space-xs); }

        .section { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); box-shadow: 0 4px 24px rgba(0,0,0,0.2); padding: var(--space-xl); margin-bottom: var(--space-lg); }
        @media (max-width: 600px) { .section { padding: 0; margin-bottom: 0; border: none; border-radius: 0; box-shadow: none; border-bottom: 8px solid var(--bg-primary); } }

        .section-title { font-size: 1.5rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
        @media (max-width: 600px) { .section-title { padding: var(--space-lg) 16px var(--space-md) 16px; margin-bottom: 0; } }

        .section > p { color: var(--text-secondary); margin-bottom: var(--space-md); }
        @media (max-width: 600px) { .section > p { padding: 0 16px; } }

        .highlight-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15), rgba(255, 189, 89, 0.05)); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .highlight-box { border: none; border-radius: 0; border-left: 4px solid var(--gold); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .highlight-box-title { font-weight: 700; color: var(--gold); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }
        .highlight-box p { color: var(--text-secondary); margin: 0; }

        .definition-box { background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.02)); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .definition-box { border: none; border-radius: 0; border-left: 4px solid var(--cyan); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .definition-box-title { font-weight: 700; color: var(--cyan); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }

        .warning-box { background: linear-gradient(135deg, rgba(156, 6, 18, 0.2), rgba(156, 6, 18, 0.05)); border: 1px solid rgba(156, 6, 18, 0.4); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .warning-box { border: none; border-radius: 0; border-left: 4px solid var(--burgundy); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .warning-box-title { font-weight: 700; color: var(--burgundy-light); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }

        .image-container { margin: var(--space-xl) 0; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--glass-border); }
        @media (max-width: 600px) { .image-container { margin: var(--space-md) 0; border-radius: 0; border: none; } }
        .image-caption { padding: var(--space-sm); font-size: 0.85rem; color: var(--text-muted); font-style: italic; text-align: center; }
        @media (max-width: 600px) { .image-caption { padding: var(--space-sm) 16px; } }

        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 1px; background: var(--glass-border); margin: var(--space-md) 0; } }
        .stat-card { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); text-align: center; }
        @media (max-width: 600px) { .stat-card { border: none; border-radius: 0; padding: var(--space-md); } }
        .stat-value { font-size: 1.75rem; font-weight: 800; background: linear-gradient(135deg, var(--gold), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        @media (max-width: 600px) { .stat-value { font-size: 1.25rem; } }
        .stat-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }

        .formula-box { background: linear-gradient(135deg, rgba(106, 91, 255, 0.15), rgba(106, 91, 255, 0.05)); border: 2px solid var(--purple); border-radius: var(--radius-lg); padding: var(--space-xl); margin: var(--space-xl) 0; text-align: center; }
        @media (max-width: 600px) { .formula-box { border: none; border-radius: 0; border-left: 4px solid var(--purple); padding: var(--space-lg) 16px; margin: var(--space-md) 0; } }
        .formula-title { font-size: 1.1rem; font-weight: 700; color: var(--purple); margin-bottom: var(--space-md); }
        .formula-content { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: var(--space-sm); }
        .formula-item { background: var(--bg-card); padding: var(--space-sm) var(--space-md); border-radius: var(--space-sm); border: 1px solid var(--glass-border); font-weight: 600; }
        .formula-operator { color: var(--gold); font-size: 1.25rem; }

        .patterns-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-md); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .patterns-grid { gap: 1px; background: var(--glass-border); margin: var(--space-md) 0; } }
        .pattern-card { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); text-align: center; }
        @media (max-width: 600px) { .pattern-card { border: none; border-radius: 0; padding: var(--space-md); } }
        .pattern-icon { font-size: 2.5rem; margin-bottom: var(--space-sm); }
        .pattern-name { font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-xs); }
        .pattern-desc { font-size: 0.85rem; color: var(--text-muted); }

        .summary-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.02)); border: 2px solid var(--gold); border-radius: var(--radius-lg); padding: var(--space-xl); margin: var(--space-xl) 0; }
        @media (max-width: 600px) { .summary-box { border: none; border-radius: 0; border-left: 4px solid var(--gold); padding: var(--space-lg) 16px; margin: var(--space-md) 0; } }
        .summary-title { font-size: 1.25rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
        .summary-list { list-style: none; }
        .summary-list li { display: flex; align-items: flex-start; gap: var(--space-sm); margin-bottom: var(--space-md); color: var(--text-secondary); }
        .summary-list li::before { content: "✓"; color: var(--gold); font-weight: 700; }

        .quiz-section { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: var(--space-xl); margin-top: var(--space-xl); }
        @media (max-width: 600px) { .quiz-section { border: none; border-radius: 0; padding: 0; margin-top: 0; border-top: 8px solid var(--bg-primary); } }
        .quiz-header { text-align: center; margin-bottom: var(--space-xl); }
        @media (max-width: 600px) { .quiz-header { padding: var(--space-lg) 16px var(--space-md); margin-bottom: 0; } }
        .quiz-title { font-size: 1.5rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-sm); }
        .quiz-subtitle { color: var(--text-muted); font-size: 0.9rem; }

        .quiz-question { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); margin-bottom: var(--space-lg); }
        @media (max-width: 600px) { .quiz-question { border: none; border-radius: 0; border-left: 4px solid var(--purple); padding: var(--space-md) 16px; margin-bottom: 0; border-bottom: 1px solid var(--glass-border); } }
        .question-number { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); border-radius: 50%; font-weight: 700; color: var(--navy-dark); margin-bottom: var(--space-md); }
        .question-text { font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-lg); line-height: 1.6; }

        .quiz-options { display: flex; flex-direction: column; gap: var(--space-sm); }
        @media (max-width: 600px) { .quiz-options { gap: 1px; background: var(--glass-border); margin-left: -16px; margin-right: -16px; margin-left: calc(-16px - 4px); } }
        .quiz-option { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md); background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: var(--radius-md); cursor: pointer; transition: all 0.3s ease; }
        @media (max-width: 600px) { .quiz-option { border: none; border-radius: 0; border-left: 4px solid transparent; padding: var(--space-md) 16px; } }
        .quiz-option:hover:not(.disabled) { border-color: var(--gold); background: var(--bg-card); }
        @media (max-width: 600px) { .quiz-option:hover:not(.disabled) { border-left-color: var(--gold); } }
        .quiz-option.selected { border-color: var(--gold); background: rgba(255, 189, 89, 0.1); }
        @media (max-width: 600px) { .quiz-option.selected { border-left-color: var(--gold); } }
        .quiz-option.correct { border-color: var(--success) !important; background: rgba(0, 200, 83, 0.15) !important; }
        @media (max-width: 600px) { .quiz-option.correct { border-left-color: var(--success) !important; } }
        .quiz-option.incorrect { border-color: var(--error) !important; background: rgba(255, 82, 82, 0.15) !important; }
        @media (max-width: 600px) { .quiz-option.incorrect { border-left-color: var(--error) !important; } }
        .quiz-option.disabled { opacity: 0.7; cursor: not-allowed; }
        .option-marker { width: 28px; height: 28px; min-width: 28px; background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; }
        .quiz-option.selected .option-marker { background: var(--gold); border-color: var(--gold); color: var(--navy-dark); }
        .quiz-option.correct .option-marker { background: var(--success); border-color: var(--success); color: white; }
        .quiz-option.incorrect .option-marker { background: var(--error); border-color: var(--error); color: white; }
        .option-text { flex: 1; color: var(--text-secondary); }

        .question-feedback { margin-top: var(--space-md); padding: var(--space-md); border-radius: var(--space-sm); display: none; }
        .question-feedback.show { display: block; }
        .question-feedback.correct { background: rgba(0, 200, 83, 0.15); border-left: 4px solid var(--success); }
        .question-feedback.incorrect { background: rgba(255, 82, 82, 0.15); border-left: 4px solid var(--error); }
        .feedback-title { font-weight: 700; margin-bottom: var(--space-xs); }
        .question-feedback.correct .feedback-title { color: var(--success); }
        .question-feedback.incorrect .feedback-title { color: var(--error); }
        .feedback-text { font-size: 0.9rem; color: var(--text-secondary); }

        .quiz-result { text-align: center; padding: var(--space-xl); display: none; }
        .quiz-result.show { display: block; }
        .result-score { font-size: 3rem; font-weight: 800; background: linear-gradient(135deg, var(--gold), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: var(--space-md); }
        .result-text { font-size: 1.25rem; font-weight: 700; margin-bottom: var(--space-sm); }
        .result-message { color: var(--text-muted); }

        .quiz-buttons { display: flex; justify-content: center; padding: var(--space-lg); }
        @media (max-width: 600px) { .quiz-buttons { padding: var(--space-lg) 16px; } }
        .quiz-btn { padding: var(--space-md) var(--space-xl); border-radius: var(--radius-md); font-weight: 700; cursor: pointer; border: none; font-family: inherit; background: var(--glass-bg); color: var(--text-primary); border: 2px solid var(--glass-border); }
        .quiz-btn:hover { border-color: var(--gold); }
    </style>
</head>
<body>
    <div class="background-container">
        <div class="bg-layer-base"></div>
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
    </div>

    <div class="lesson-container">

        <header class="lesson-header">
            <div class="lesson-badge">
                <span>📉</span>
                <span>Reversal Pattern</span>
            </div>
            <div class="lesson-chapter">Chapter 4 - UPD Pattern</div>
            <h1 class="lesson-title">UPD Là Gì?</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 4.1</span></div>
                <div class="meta-item"><span>⏱️</span><span>7 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <section class="section">
            <h2 class="section-title"><span>🎯</span> Mục Tiêu Bài Học</h2>
            <p>Trong bài học này, bạn sẽ được giới thiệu về pattern UPD (Up-Pause-Down) - một trong những pattern ĐẢO CHIỀU mạnh nhất trong hệ thống GEM Frequency Trading.</p>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>⭐</span> Pattern Mạnh!</div>
                <p>UPD là pattern REVERSAL (đảo chiều), mạnh hơn DPD (continuation) vì nó bắt được <strong>điểm đảo chiều xu hướng</strong> - nơi Smart Money phân phối tài sản và Retail bị bẫy.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📖</span> Định Nghĩa UPD</h2>
            <p>UPD là viết tắt của <strong>Up - Pause - Down</strong>, mô tả chuyển động giá đặc trưng:</p>

            <div class="definition-box">
                <div class="definition-box-title"><span>📚</span> UPD - Up Pause Down</div>
                <p><strong>Tăng → Nghỉ → Giảm</strong> - Giá tăng mạnh, sau đó đi ngang (tích lũy/phân phối), rồi đảo chiều giảm. Đây là pattern đảo chiều xu hướng, báo hiệu kết thúc trend tăng.</p>
            </div>

            <div class="formula-box">
                <div class="formula-title">🔄 Công Thức UPD</div>
                <div class="formula-content">
                    <span class="formula-item">📈 UP</span>
                    <span class="formula-operator">→</span>
                    <span class="formula-item">⏸️ PAUSE</span>
                    <span class="formula-operator">→</span>
                    <span class="formula-item">📉 DOWN</span>
                </div>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/FFBD59?text=UPD+Pattern+Structure" alt="UPD Structure">
            </div>
            <div class="image-caption">Hình 1: Cấu trúc pattern UPD - Tăng → Nghỉ → Giảm</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📊</span> Thông Số Quan Trọng</h2>
            <p>Dưới đây là các thông số backtest của pattern UPD trên thị trường crypto:</p>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">65%</div>
                    <div class="stat-label">Win Rate</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">1:2.2</div>
                    <div class="stat-label">Avg R:R</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">HFZ</div>
                    <div class="stat-label">Zone Tạo Ra</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">⭐</div>
                    <div class="stat-label">Độ Mạnh</div>
                </div>
            </div>

            <div class="patterns-grid">
                <div class="pattern-card">
                    <div class="pattern-icon">🔄</div>
                    <div class="pattern-name">Loại Pattern</div>
                    <div class="pattern-desc">REVERSAL - Đảo chiều xu hướng giảm</div>
                </div>
                <div class="pattern-card">
                    <div class="pattern-icon">📍</div>
                    <div class="pattern-name">Zone Tạo Ra</div>
                    <div class="pattern-desc">HFZ - High Frequency Zone (Vùng Bán)</div>
                </div>
                <div class="pattern-card">
                    <div class="pattern-icon">📉</div>
                    <div class="pattern-name">Hướng Trade</div>
                    <div class="pattern-desc">SHORT - Vào lệnh bán khi retest HFZ</div>
                </div>
                <div class="pattern-card">
                    <div class="pattern-icon">⚡</div>
                    <div class="pattern-name">Sức Mạnh</div>
                    <div class="pattern-desc">MẠNH hơn DPD - Bắt đỉnh xu hướng</div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>⚡</span> Tại Sao UPD Mạnh Hơn DPD?</h2>
            <p>UPD và DPD đều tạo ra HFZ, nhưng UPD mạnh hơn vì lý do sau:</p>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>💡</span> Logic Đằng Sau UPD</div>
                <p>UPD xuất hiện tại ĐỈNH xu hướng tăng. Đây là nơi Smart Money <strong>phân phối tài sản</strong> cho Retail đang FOMO mua đuổi. Khi giá quay lại test HFZ, áp lực bán từ Smart Money còn rất mạnh.</p>
            </div>

            <div class="warning-box">
                <div class="warning-box-title"><span>🔍</span> Bẫy Giá Kinh Điển</div>
                <p>Trong Phase 1 (UP), Retail thấy giá tăng mạnh và FOMO mua đuổi. Trong Phase 2 (PAUSE), Smart Money bán dần cho Retail. Phase 3 (DOWN) là lúc bẫy sập - Retail bị kẹt ở đỉnh.</p>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/FF5252?text=Smart+Money+Distribution+at+UPD" alt="Smart Money Distribution">
            </div>
            <div class="image-caption">Hình 2: Smart Money phân phối tại vùng PAUSE của UPD</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>🆚</span> So Sánh UPD vs DPD</h2>
            <p>Hiểu rõ sự khác biệt giữa UPD và DPD sẽ giúp bạn chọn đúng pattern cho từng tình huống:</p>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/00F0FF?text=UPD+vs+DPD+Comparison" alt="UPD vs DPD">
            </div>
            <div class="image-caption">Hình 3: So sánh UPD (Reversal) và DPD (Continuation)</div>

            <div class="definition-box">
                <div class="definition-box-title"><span>📊</span> Khi Nào Dùng UPD?</div>
                <p>Sử dụng UPD khi bạn nhận thấy xu hướng tăng đã kéo dài và có dấu hiệu kiệt sức. UPD giúp bạn bắt được điểm đảo chiều - nơi trend tăng kết thúc và trend giảm bắt đầu.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📝</span> Tổng Kết</h2>

            <div class="summary-box">
                <div class="summary-title"><span>🎯</span> Điểm Chính</div>
                <ul class="summary-list">
                    <li>UPD = Up-Pause-Down (Tăng-Nghỉ-Giảm) - Pattern đảo chiều xu hướng giảm</li>
                    <li>Tạo ra HFZ (High Frequency Zone) - Vùng Bán mạnh</li>
                    <li>Win Rate 65%, R:R trung bình 1:2.2</li>
                    <li>MẠNH hơn DPD vì bắt được điểm đảo chiều, nơi Smart Money phân phối</li>
                    <li>Sử dụng khi xu hướng tăng có dấu hiệu kiệt sức</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-header">
                <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>
                <p class="quiz-subtitle">Chọn đáp án để nhận phản hồi ngay lập tức</p>
            </div>

            <div class="quiz-question" data-question="1" data-correct="B">
                <div class="question-number">1</div>
                <div class="question-text">UPD là viết tắt của gì?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Up-Push-Down</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Up-Pause-Down</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Ultra-Price-Drop</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Up-Peak-Down</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-question" data-question="2" data-correct="C">
                <div class="question-number">2</div>
                <div class="question-text">Tại sao UPD được coi là pattern mạnh hơn DPD?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Vì UPD có Win Rate cao hơn</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Vì UPD xuất hiện nhiều hơn</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Vì UPD bắt được điểm đảo chiều xu hướng</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Vì UPD tạo ra zone rộng hơn</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-result">
                <div class="result-score">0/2</div>
                <div class="result-text">Hoàn thành!</div>
                <div class="result-message"></div>
            </div>

            <div class="quiz-buttons">
                <button class="quiz-btn" id="retakeQuiz" style="display: none;">Làm Lại</button>
            </div>
        </section>

    </div>

    <script>
        document.addEventListener(''DOMContentLoaded'', function() {
            const questions = document.querySelectorAll(''.quiz-question'');
            const retakeBtn = document.getElementById(''retakeQuiz'');
            const resultDiv = document.querySelector(''.quiz-result'');

            let answeredCount = 0;
            let correctCount = 0;
            const totalQuestions = 2;

            const explanations = {
                1: {
                    correct: ''✓ Chính xác! UPD = Up-Pause-Down, mô tả chuyển động: Tăng → Nghỉ → Giảm.'',
                    incorrect: ''✗ Sai! UPD là viết tắt của Up-Pause-Down (Tăng-Nghỉ-Giảm).''
                },
                2: {
                    correct: ''✓ Chính xác! UPD mạnh hơn vì nó là pattern đảo chiều, bắt được điểm kết thúc xu hướng tăng.'',
                    incorrect: ''✗ Sai! UPD mạnh hơn DPD vì nó bắt được điểm đảo chiều xu hướng - nơi Smart Money phân phối.''
                }
            };

            questions.forEach(question => {
                const options = question.querySelectorAll(''.quiz-option'');
                const correctAnswer = question.dataset.correct;
                const questionNum = question.dataset.question;
                const feedbackDiv = question.querySelector(''.question-feedback'');
                const feedbackTitle = feedbackDiv.querySelector(''.feedback-title'');
                const feedbackText = feedbackDiv.querySelector(''.feedback-text'');

                options.forEach(option => {
                    option.addEventListener(''click'', function() {
                        if (question.classList.contains(''answered'')) return;

                        question.classList.add(''answered'');
                        answeredCount++;

                        const selectedOption = this.dataset.option;
                        const isCorrect = selectedOption === correctAnswer;

                        options.forEach(opt => opt.classList.add(''disabled''));
                        this.classList.add(''selected'');

                        if (isCorrect) {
                            this.classList.add(''correct'');
                            correctCount++;
                            feedbackDiv.classList.add(''correct'');
                            feedbackTitle.textContent = ''✓ Chính xác!'';
                            feedbackText.textContent = explanations[questionNum].correct;
                        } else {
                            this.classList.add(''incorrect'');
                            feedbackDiv.classList.add(''incorrect'');
                            feedbackTitle.textContent = ''✗ Sai rồi!'';
                            feedbackText.textContent = explanations[questionNum].incorrect;
                            options.forEach(opt => {
                                if (opt.dataset.option === correctAnswer) {
                                    opt.classList.add(''correct'');
                                }
                            });
                        }

                        feedbackDiv.classList.add(''show'');

                        if (answeredCount === totalQuestions) {
                            const scoreDiv = resultDiv.querySelector(''.result-score'');
                            const messageDiv = resultDiv.querySelector(''.result-message'');
                            scoreDiv.textContent = `${correctCount}/${totalQuestions}`;

                            if (correctCount === totalQuestions) {
                                messageDiv.textContent = ''🎉 Xuất sắc! Bạn đã nắm vững định nghĩa UPD!'';
                            } else if (correctCount >= 1) {
                                messageDiv.textContent = ''👍 Tốt! Tiếp tục học các bài tiếp theo!'';
                            } else {
                                messageDiv.textContent = ''📚 Đọc lại phần định nghĩa để hiểu rõ hơn!'';
                            }

                            resultDiv.classList.add(''show'');
                            retakeBtn.style.display = ''inline-block'';
                        }
                    });
                });
            });

            retakeBtn.addEventListener(''click'', function() {
                answeredCount = 0;
                correctCount = 0;

                questions.forEach(question => {
                    question.classList.remove(''answered'');
                    const options = question.querySelectorAll(''.quiz-option'');
                    const feedbackDiv = question.querySelector(''.question-feedback'');

                    options.forEach(opt => {
                        opt.classList.remove(''selected'', ''correct'', ''incorrect'', ''disabled'');
                    });
                    feedbackDiv.classList.remove(''show'', ''correct'', ''incorrect'');
                });

                resultDiv.classList.remove(''show'');
                retakeBtn.style.display = ''none'';
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

-- Lesson 4.2: Cấu Trúc 3 Phases Của UPD
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch4-l2',
  'module-tier-1-ch4',
  'course-tier1-trading-foundation',
  'Bài 4.2: Cấu Trúc 3 Phases Của UPD',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 4.2: Cấu Trúc 3 Phases Của UPD | GEM Trading Academy</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <style>
        :root {
            --navy: #112250;
            --navy-dark: #0a1628;
            --gold: #FFBD59;
            --gold-dark: #E5A73D;
            --cyan: #00F0FF;
            --purple: #6A5BFF;
            --burgundy: #9C0612;
            --burgundy-light: #C41E2A;
            --success: #00C853;
            --error: #FF5252;
            --bg-primary: #0a1628;
            --bg-card: rgba(17, 34, 80, 0.6);
            --text-primary: #FFFFFF;
            --text-secondary: rgba(255, 255, 255, 0.85);
            --text-muted: rgba(255, 255, 255, 0.6);
            --glass-bg: rgba(17, 34, 80, 0.4);
            --glass-border: rgba(255, 189, 89, 0.2);
            --space-xs: 4px;
            --space-sm: 8px;
            --space-md: 16px;
            --space-lg: 24px;
            --space-xl: 32px;
            --radius-md: 12px;
            --radius-lg: 16px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: ''Montserrat'', sans-serif; background: var(--bg-primary); color: var(--text-primary); line-height: 1.6; }
        img { max-width: 100%; height: auto; display: block; }

        .background-container { position: fixed; inset: 0; z-index: -1; }
        .bg-layer-base { position: absolute; inset: 0; background: linear-gradient(180deg, var(--navy-dark) 0%, var(--navy) 50%, var(--navy-dark) 100%); }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3; }
        .orb-1 { width: 400px; height: 400px; background: var(--gold); top: -100px; right: -100px; }
        .orb-2 { width: 300px; height: 300px; background: var(--cyan); bottom: 20%; left: -100px; }
        .orb-3 { width: 250px; height: 250px; background: var(--burgundy); bottom: -50px; right: 20%; }

        .lesson-container { max-width: 800px; margin: 0 auto; padding: 1.5rem; }
        @media (max-width: 600px) { .lesson-container { padding: 0; } }

        .lesson-header { text-align: center; padding: var(--space-xl); margin-bottom: var(--space-xl); background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); box-shadow: 0 4px 24px rgba(0,0,0,0.2); }
        @media (max-width: 600px) { .lesson-header { padding: var(--space-lg) 16px; margin-bottom: 0; border: none; border-radius: 0; box-shadow: none; border-bottom: 8px solid var(--bg-primary); } }
        .lesson-badge { display: inline-flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); background: linear-gradient(135deg, var(--burgundy), var(--burgundy-light)); border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: var(--space-md); }
        .lesson-chapter { font-size: 0.9rem; color: var(--gold); font-weight: 600; margin-bottom: var(--space-sm); text-transform: uppercase; letter-spacing: 2px; }
        .lesson-title { font-size: clamp(1.75rem, 5vw, 2.5rem); font-weight: 800; margin-bottom: var(--space-md); background: linear-gradient(135deg, var(--text-primary), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lesson-meta { display: flex; justify-content: center; gap: var(--space-lg); flex-wrap: wrap; color: var(--text-muted); font-size: 0.85rem; }
        .meta-item { display: flex; align-items: center; gap: var(--space-xs); }

        .section { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); box-shadow: 0 4px 24px rgba(0,0,0,0.2); padding: var(--space-xl); margin-bottom: var(--space-lg); }
        @media (max-width: 600px) { .section { padding: 0; margin-bottom: 0; border: none; border-radius: 0; box-shadow: none; border-bottom: 8px solid var(--bg-primary); } }

        .section-title { font-size: 1.5rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
        @media (max-width: 600px) { .section-title { padding: var(--space-lg) 16px var(--space-md) 16px; margin-bottom: 0; } }

        .section > p { color: var(--text-secondary); margin-bottom: var(--space-md); }
        @media (max-width: 600px) { .section > p { padding: 0 16px; } }

        .highlight-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15), rgba(255, 189, 89, 0.05)); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .highlight-box { border: none; border-radius: 0; border-left: 4px solid var(--gold); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .highlight-box-title { font-weight: 700; color: var(--gold); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }
        .highlight-box p { color: var(--text-secondary); margin: 0; }

        .definition-box { background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.02)); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .definition-box { border: none; border-radius: 0; border-left: 4px solid var(--cyan); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .definition-box-title { font-weight: 700; color: var(--cyan); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }

        .warning-box { background: linear-gradient(135deg, rgba(156, 6, 18, 0.2), rgba(156, 6, 18, 0.05)); border: 1px solid rgba(156, 6, 18, 0.4); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .warning-box { border: none; border-radius: 0; border-left: 4px solid var(--burgundy); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .warning-box-title { font-weight: 700; color: var(--burgundy-light); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }

        .image-container { margin: var(--space-xl) 0; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--glass-border); }
        @media (max-width: 600px) { .image-container { margin: var(--space-md) 0; border-radius: 0; border: none; } }
        .image-caption { padding: var(--space-sm); font-size: 0.85rem; color: var(--text-muted); font-style: italic; text-align: center; }
        @media (max-width: 600px) { .image-caption { padding: var(--space-sm) 16px; } }

        .flow-steps { display: flex; flex-direction: column; gap: var(--space-md); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .flow-steps { gap: 1px; background: var(--glass-border); margin: var(--space-md) 0; } }
        .flow-step { display: flex; gap: var(--space-md); align-items: flex-start; padding: var(--space-md); background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); }
        @media (max-width: 600px) { .flow-step { padding: var(--space-md) 16px; border: none; border-radius: 0; border-left: 4px solid var(--gold); } }
        .flow-step-number { width: 40px; height: 40px; min-width: 40px; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; color: var(--navy-dark); }
        .flow-step-content { flex: 1; }
        .flow-step-title { font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-xs); }
        .flow-step-desc { font-size: 0.9rem; color: var(--text-muted); }

        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .stats-grid { gap: 1px; background: var(--glass-border); margin: var(--space-md) 0; } }
        .stat-card { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); text-align: center; }
        @media (max-width: 600px) { .stat-card { border: none; border-radius: 0; padding: var(--space-md); } }
        .stat-value { font-size: 1.75rem; font-weight: 800; background: linear-gradient(135deg, var(--gold), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        @media (max-width: 600px) { .stat-value { font-size: 1.25rem; } }
        .stat-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }

        .summary-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.02)); border: 2px solid var(--gold); border-radius: var(--radius-lg); padding: var(--space-xl); margin: var(--space-xl) 0; }
        @media (max-width: 600px) { .summary-box { border: none; border-radius: 0; border-left: 4px solid var(--gold); padding: var(--space-lg) 16px; margin: var(--space-md) 0; } }
        .summary-title { font-size: 1.25rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
        .summary-list { list-style: none; }
        .summary-list li { display: flex; align-items: flex-start; gap: var(--space-sm); margin-bottom: var(--space-md); color: var(--text-secondary); }
        .summary-list li::before { content: "✓"; color: var(--gold); font-weight: 700; }

        .quiz-section { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: var(--space-xl); margin-top: var(--space-xl); }
        @media (max-width: 600px) { .quiz-section { border: none; border-radius: 0; padding: 0; margin-top: 0; border-top: 8px solid var(--bg-primary); } }
        .quiz-header { text-align: center; margin-bottom: var(--space-xl); }
        @media (max-width: 600px) { .quiz-header { padding: var(--space-lg) 16px var(--space-md); margin-bottom: 0; } }
        .quiz-title { font-size: 1.5rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-sm); }
        .quiz-subtitle { color: var(--text-muted); font-size: 0.9rem; }

        .quiz-question { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); margin-bottom: var(--space-lg); }
        @media (max-width: 600px) { .quiz-question { border: none; border-radius: 0; border-left: 4px solid var(--purple); padding: var(--space-md) 16px; margin-bottom: 0; border-bottom: 1px solid var(--glass-border); } }
        .question-number { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); border-radius: 50%; font-weight: 700; color: var(--navy-dark); margin-bottom: var(--space-md); }
        .question-text { font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-lg); line-height: 1.6; }

        .quiz-options { display: flex; flex-direction: column; gap: var(--space-sm); }
        @media (max-width: 600px) { .quiz-options { gap: 1px; background: var(--glass-border); margin-left: -16px; margin-right: -16px; margin-left: calc(-16px - 4px); } }
        .quiz-option { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md); background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: var(--radius-md); cursor: pointer; transition: all 0.3s ease; }
        @media (max-width: 600px) { .quiz-option { border: none; border-radius: 0; border-left: 4px solid transparent; padding: var(--space-md) 16px; } }
        .quiz-option:hover:not(.disabled) { border-color: var(--gold); background: var(--bg-card); }
        @media (max-width: 600px) { .quiz-option:hover:not(.disabled) { border-left-color: var(--gold); } }
        .quiz-option.correct { border-color: var(--success) !important; background: rgba(0, 200, 83, 0.15) !important; }
        @media (max-width: 600px) { .quiz-option.correct { border-left-color: var(--success) !important; } }
        .quiz-option.incorrect { border-color: var(--error) !important; background: rgba(255, 82, 82, 0.15) !important; }
        @media (max-width: 600px) { .quiz-option.incorrect { border-left-color: var(--error) !important; } }
        .quiz-option.disabled { opacity: 0.7; cursor: not-allowed; }
        .option-marker { width: 28px; height: 28px; min-width: 28px; background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; }
        .quiz-option.correct .option-marker { background: var(--success); border-color: var(--success); color: white; }
        .quiz-option.incorrect .option-marker { background: var(--error); border-color: var(--error); color: white; }
        .option-text { flex: 1; color: var(--text-secondary); }

        .question-feedback { margin-top: var(--space-md); padding: var(--space-md); border-radius: var(--space-sm); display: none; }
        .question-feedback.show { display: block; }
        .question-feedback.correct { background: rgba(0, 200, 83, 0.15); border-left: 4px solid var(--success); }
        .question-feedback.incorrect { background: rgba(255, 82, 82, 0.15); border-left: 4px solid var(--error); }
        .feedback-title { font-weight: 700; margin-bottom: var(--space-xs); }
        .question-feedback.correct .feedback-title { color: var(--success); }
        .question-feedback.incorrect .feedback-title { color: var(--error); }
        .feedback-text { font-size: 0.9rem; color: var(--text-secondary); }

        .quiz-result { text-align: center; padding: var(--space-xl); display: none; }
        .quiz-result.show { display: block; }
        .result-score { font-size: 3rem; font-weight: 800; background: linear-gradient(135deg, var(--gold), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: var(--space-md); }

        .quiz-buttons { display: flex; justify-content: center; padding: var(--space-lg); }
        @media (max-width: 600px) { .quiz-buttons { padding: var(--space-lg) 16px; } }
        .quiz-btn { padding: var(--space-md) var(--space-xl); border-radius: var(--radius-md); font-weight: 700; cursor: pointer; border: none; font-family: inherit; background: var(--glass-bg); color: var(--text-primary); border: 2px solid var(--glass-border); }
        .quiz-btn:hover { border-color: var(--gold); }
    </style>
</head>
<body>
    <div class="background-container">
        <div class="bg-layer-base"></div>
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
    </div>

    <div class="lesson-container">

        <header class="lesson-header">
            <div class="lesson-badge">
                <span>📉</span>
                <span>Reversal Pattern</span>
            </div>
            <div class="lesson-chapter">Chapter 4 - UPD Pattern</div>
            <h1 class="lesson-title">Cấu Trúc 3 Phases Của UPD</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 4.2</span></div>
                <div class="meta-item"><span>⏱️</span><span>8 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>3 câu quiz</span></div>
            </div>
        </header>

        <section class="section">
            <h2 class="section-title"><span>🎯</span> Mục Tiêu Bài Học</h2>
            <p>Trong bài học này, bạn sẽ học chi tiết về cấu trúc 3 phases của pattern UPD và cách nhận diện từng phase một cách chính xác.</p>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>💡</span> Ghi Nhớ Quan Trọng</div>
                <p>UPD có cấu trúc <strong>UP → PAUSE → DOWN</strong>. Vùng PAUSE chính là nơi Smart Money phân phối, tạo thành <strong>HFZ (High Frequency Zone)</strong>.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📈</span> Phase 1: UP - Đợt Tăng Cuối</h2>
            <p>Phase 1 là đợt tăng mạnh cuối cùng của xu hướng tăng. Đây thường là lúc Retail FOMO mua đuổi.</p>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">≥2%</div>
                    <div class="stat-label">Tăng Tối Thiểu</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">Cao</div>
                    <div class="stat-label">Volume</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">FOMO</div>
                    <div class="stat-label">Tâm Lý Retail</div>
                </div>
            </div>

            <div class="flow-steps">
                <div class="flow-step">
                    <div class="flow-step-number">📈</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Đặc Điểm Phase 1</div>
                        <div class="flow-step-desc">Giá tăng mạnh ≥2% với volume cao. Retail FOMO mua đuổi theo trend. Đây thường là đợt tăng cuối của xu hướng tăng dài hạn.</div>
                    </div>
                </div>
            </div>

            <div class="definition-box">
                <div class="definition-box-title"><span>🔍</span> Dấu Hiệu Nhận Biết</div>
                <p>Nến thân lớn, chủ yếu là nến xanh. Volume cao do Retail đổ xô vào mua. Tin tức tích cực tràn lan, sentiment thị trường cực kỳ lạc quan.</p>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/00C853?text=UPD+Phase+1+UP" alt="Phase 1 UP">
            </div>
            <div class="image-caption">Hình 1: Phase 1 của UPD - Đợt tăng mạnh cuối cùng</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>⏸️</span> Phase 2: PAUSE - Vùng Phân Phối (HFZ)</h2>
            <p>Phase 2 là vùng tích lũy/phân phối. Đây là nơi Smart Money bán dần cho Retail và tạo thành HFZ.</p>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value"><1.5%</div>
                    <div class="stat-label">Range Tối Đa</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">1-5</div>
                    <div class="stat-label">Số Nến</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">Cao</div>
                    <div class="stat-label">Volume Ẩn</div>
                </div>
            </div>

            <div class="flow-steps">
                <div class="flow-step">
                    <div class="flow-step-number">⏸️</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Đặc Điểm Phase 2 (TẠO HFZ)</div>
                        <div class="flow-step-desc">Giá đi ngang trong range hẹp <1.5%, từ 1-5 nến. Nến thân nhỏ, wicks ngắn. Volume vẫn cao nhưng giá không tăng → Smart Money đang PHÂN PHỐI.</div>
                    </div>
                </div>
            </div>

            <div class="warning-box">
                <div class="warning-box-title"><span>⚠️</span> Quan Trọng!</div>
                <p>Volume cao + Giá đi ngang = <strong>Smart Money đang bán</strong>. Họ cần Retail tiếp tục mua để hấp thụ lượng bán của họ. Đây là dấu hiệu phân phối kinh điển.</p>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/FFBD59?text=UPD+Phase+2+PAUSE+HFZ" alt="Phase 2 PAUSE">
            </div>
            <div class="image-caption">Hình 2: Phase 2 - Vùng PAUSE tạo thành HFZ (High Frequency Zone)</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📉</span> Phase 3: DOWN - Đảo Chiều Giảm</h2>
            <p>Phase 3 là đợt giảm mạnh sau khi Smart Money hoàn tất phân phối. Đây là "bẫy giá" cho Retail đã mua ở Phase 1.</p>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">≥2%</div>
                    <div class="stat-label">Giảm Tối Thiểu</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">Đột Biến</div>
                    <div class="stat-label">Volume</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">Hoảng</div>
                    <div class="stat-label">Tâm Lý Retail</div>
                </div>
            </div>

            <div class="flow-steps">
                <div class="flow-step">
                    <div class="flow-step-number">📉</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Đặc Điểm Phase 3</div>
                        <div class="flow-step-desc">Giá đảo chiều giảm mạnh ≥2%. Volume đột biến. Nến đỏ thân lớn, ít chồng lấn. Retail hoảng loạn cắt lỗ, tạo thêm áp lực bán.</div>
                    </div>
                </div>
            </div>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>🎯</span> Xác Nhận Pattern</div>
                <p>Phase 3 xác nhận pattern UPD hoàn chỉnh. Sau Phase 3, giá thường quay lại test HFZ (vùng PAUSE) trước khi tiếp tục giảm → <strong>Cơ hội SHORT!</strong></p>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/FF5252?text=UPD+Phase+3+DOWN" alt="Phase 3 DOWN">
            </div>
            <div class="image-caption">Hình 3: Phase 3 - Đảo chiều giảm mạnh, xác nhận pattern UPD</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>🔄</span> Tổng Quan 3 Phases</h2>
            <p>Dưới đây là tổng quan đầy đủ về cấu trúc 3 phases của UPD:</p>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/00F0FF?text=UPD+Complete+3+Phases+Structure" alt="UPD Complete Structure">
            </div>
            <div class="image-caption">Hình 4: Cấu trúc đầy đủ 3 phases của UPD với HFZ</div>

            <div class="summary-box">
                <div class="summary-title"><span>🎯</span> Tổng Kết 3 Phases</div>
                <ul class="summary-list">
                    <li><strong>Phase 1 (UP):</strong> Tăng ≥2%, volume cao, Retail FOMO mua đuổi</li>
                    <li><strong>Phase 2 (PAUSE):</strong> Range <1.5%, 1-5 nến, Smart Money phân phối → TẠO HFZ</li>
                    <li><strong>Phase 3 (DOWN):</strong> Giảm ≥2%, volume đột biến, đảo chiều xu hướng</li>
                    <li>Sau Phase 3: Giá thường retest HFZ → Cơ hội vào lệnh SHORT</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-header">
                <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>
                <p class="quiz-subtitle">Chọn đáp án để nhận phản hồi ngay lập tức</p>
            </div>

            <div class="quiz-question" data-question="1" data-correct="B">
                <div class="question-number">1</div>
                <div class="question-text">Trong Phase 2 của UPD, điều gì đang xảy ra?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Retail đang bán tháo</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Smart Money đang phân phối cho Retail</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Không có giao dịch nào</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Smart Money đang tích lũy thêm</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-question" data-question="2" data-correct="C">
                <div class="question-number">2</div>
                <div class="question-text">Phase 2 của UPD tạo ra vùng gì?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">LFZ - Low Frequency Zone</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Support Zone</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">HFZ - High Frequency Zone</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Resistance Zone</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-question" data-question="3" data-correct="A">
                <div class="question-number">3</div>
                <div class="question-text">Vùng PAUSE trong UPD nên có range tối đa bao nhiêu?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">< 1.5%</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">< 5%</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">< 10%</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Không giới hạn</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-result">
                <div class="result-score">0/3</div>
                <div class="result-text">Hoàn thành!</div>
                <div class="result-message"></div>
            </div>

            <div class="quiz-buttons">
                <button class="quiz-btn" id="retakeQuiz" style="display: none;">Làm Lại</button>
            </div>
        </section>

    </div>

    <script>
        document.addEventListener(''DOMContentLoaded'', function() {
            const questions = document.querySelectorAll(''.quiz-question'');
            const retakeBtn = document.getElementById(''retakeQuiz'');
            const resultDiv = document.querySelector(''.quiz-result'');

            let answeredCount = 0;
            let correctCount = 0;
            const totalQuestions = 3;

            const explanations = {
                1: {
                    correct: ''✓ Chính xác! Trong Phase 2 (PAUSE), Smart Money đang phân phối (bán) cho Retail đang FOMO mua.'',
                    incorrect: ''✗ Sai! Phase 2 là giai đoạn Smart Money phân phối tài sản cho Retail.''
                },
                2: {
                    correct: ''✓ Chính xác! UPD tạo ra HFZ (High Frequency Zone) - vùng áp lực bán mạnh.'',
                    incorrect: ''✗ Sai! UPD là pattern tạo ra HFZ (High Frequency Zone) - vùng Bán.''
                },
                3: {
                    correct: ''✓ Chính xác! Vùng PAUSE cần có range <1.5% để được coi là hợp lệ.'',
                    incorrect: ''✗ Sai! Vùng PAUSE phải có range <1.5%. Range quá rộng = zone không chất lượng.''
                }
            };

            questions.forEach(question => {
                const options = question.querySelectorAll(''.quiz-option'');
                const correctAnswer = question.dataset.correct;
                const questionNum = question.dataset.question;
                const feedbackDiv = question.querySelector(''.question-feedback'');
                const feedbackTitle = feedbackDiv.querySelector(''.feedback-title'');
                const feedbackText = feedbackDiv.querySelector(''.feedback-text'');

                options.forEach(option => {
                    option.addEventListener(''click'', function() {
                        if (question.classList.contains(''answered'')) return;
                        question.classList.add(''answered'');
                        answeredCount++;
                        const selectedOption = this.dataset.option;
                        const isCorrect = selectedOption === correctAnswer;
                        options.forEach(opt => opt.classList.add(''disabled''));
                        if (isCorrect) {
                            this.classList.add(''correct'');
                            correctCount++;
                            feedbackDiv.classList.add(''correct'');
                            feedbackTitle.textContent = ''✓ Chính xác!'';
                            feedbackText.textContent = explanations[questionNum].correct;
                        } else {
                            this.classList.add(''incorrect'');
                            feedbackDiv.classList.add(''incorrect'');
                            feedbackTitle.textContent = ''✗ Sai rồi!'';
                            feedbackText.textContent = explanations[questionNum].incorrect;
                            options.forEach(opt => { if (opt.dataset.option === correctAnswer) opt.classList.add(''correct''); });
                        }
                        feedbackDiv.classList.add(''show'');
                        if (answeredCount === totalQuestions) {
                            resultDiv.querySelector(''.result-score'').textContent = `${correctCount}/${totalQuestions}`;
                            resultDiv.querySelector(''.result-message'').textContent = correctCount === totalQuestions ? ''🎉 Xuất sắc!'' : correctCount >= 2 ? ''👍 Tốt lắm!'' : ''📚 Xem lại bài học nhé!'';
                            resultDiv.classList.add(''show'');
                            retakeBtn.style.display = ''inline-block'';
                        }
                    });
                });
            });

            retakeBtn.addEventListener(''click'', function() {
                answeredCount = 0; correctCount = 0;
                questions.forEach(q => {
                    q.classList.remove(''answered'');
                    q.querySelectorAll(''.quiz-option'').forEach(o => o.classList.remove(''correct'', ''incorrect'', ''disabled''));
                    q.querySelector(''.question-feedback'').classList.remove(''show'', ''correct'', ''incorrect'');
                });
                resultDiv.classList.remove(''show'');
                retakeBtn.style.display = ''none'';
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
    <title>Bài 4.2: Cấu Trúc 3 Phases Của UPD | GEM Trading Academy</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <style>
        :root {
            --navy: #112250;
            --navy-dark: #0a1628;
            --gold: #FFBD59;
            --gold-dark: #E5A73D;
            --cyan: #00F0FF;
            --purple: #6A5BFF;
            --burgundy: #9C0612;
            --burgundy-light: #C41E2A;
            --success: #00C853;
            --error: #FF5252;
            --bg-primary: #0a1628;
            --bg-card: rgba(17, 34, 80, 0.6);
            --text-primary: #FFFFFF;
            --text-secondary: rgba(255, 255, 255, 0.85);
            --text-muted: rgba(255, 255, 255, 0.6);
            --glass-bg: rgba(17, 34, 80, 0.4);
            --glass-border: rgba(255, 189, 89, 0.2);
            --space-xs: 4px;
            --space-sm: 8px;
            --space-md: 16px;
            --space-lg: 24px;
            --space-xl: 32px;
            --radius-md: 12px;
            --radius-lg: 16px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: ''Montserrat'', sans-serif; background: var(--bg-primary); color: var(--text-primary); line-height: 1.6; }
        img { max-width: 100%; height: auto; display: block; }

        .background-container { position: fixed; inset: 0; z-index: -1; }
        .bg-layer-base { position: absolute; inset: 0; background: linear-gradient(180deg, var(--navy-dark) 0%, var(--navy) 50%, var(--navy-dark) 100%); }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3; }
        .orb-1 { width: 400px; height: 400px; background: var(--gold); top: -100px; right: -100px; }
        .orb-2 { width: 300px; height: 300px; background: var(--cyan); bottom: 20%; left: -100px; }
        .orb-3 { width: 250px; height: 250px; background: var(--burgundy); bottom: -50px; right: 20%; }

        .lesson-container { max-width: 800px; margin: 0 auto; padding: 1.5rem; }
        @media (max-width: 600px) { .lesson-container { padding: 0; } }

        .lesson-header { text-align: center; padding: var(--space-xl); margin-bottom: var(--space-xl); background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); box-shadow: 0 4px 24px rgba(0,0,0,0.2); }
        @media (max-width: 600px) { .lesson-header { padding: var(--space-lg) 16px; margin-bottom: 0; border: none; border-radius: 0; box-shadow: none; border-bottom: 8px solid var(--bg-primary); } }
        .lesson-badge { display: inline-flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); background: linear-gradient(135deg, var(--burgundy), var(--burgundy-light)); border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: var(--space-md); }
        .lesson-chapter { font-size: 0.9rem; color: var(--gold); font-weight: 600; margin-bottom: var(--space-sm); text-transform: uppercase; letter-spacing: 2px; }
        .lesson-title { font-size: clamp(1.75rem, 5vw, 2.5rem); font-weight: 800; margin-bottom: var(--space-md); background: linear-gradient(135deg, var(--text-primary), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lesson-meta { display: flex; justify-content: center; gap: var(--space-lg); flex-wrap: wrap; color: var(--text-muted); font-size: 0.85rem; }
        .meta-item { display: flex; align-items: center; gap: var(--space-xs); }

        .section { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); box-shadow: 0 4px 24px rgba(0,0,0,0.2); padding: var(--space-xl); margin-bottom: var(--space-lg); }
        @media (max-width: 600px) { .section { padding: 0; margin-bottom: 0; border: none; border-radius: 0; box-shadow: none; border-bottom: 8px solid var(--bg-primary); } }

        .section-title { font-size: 1.5rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
        @media (max-width: 600px) { .section-title { padding: var(--space-lg) 16px var(--space-md) 16px; margin-bottom: 0; } }

        .section > p { color: var(--text-secondary); margin-bottom: var(--space-md); }
        @media (max-width: 600px) { .section > p { padding: 0 16px; } }

        .highlight-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15), rgba(255, 189, 89, 0.05)); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .highlight-box { border: none; border-radius: 0; border-left: 4px solid var(--gold); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .highlight-box-title { font-weight: 700; color: var(--gold); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }
        .highlight-box p { color: var(--text-secondary); margin: 0; }

        .definition-box { background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.02)); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .definition-box { border: none; border-radius: 0; border-left: 4px solid var(--cyan); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .definition-box-title { font-weight: 700; color: var(--cyan); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }

        .warning-box { background: linear-gradient(135deg, rgba(156, 6, 18, 0.2), rgba(156, 6, 18, 0.05)); border: 1px solid rgba(156, 6, 18, 0.4); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .warning-box { border: none; border-radius: 0; border-left: 4px solid var(--burgundy); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .warning-box-title { font-weight: 700; color: var(--burgundy-light); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }

        .image-container { margin: var(--space-xl) 0; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--glass-border); }
        @media (max-width: 600px) { .image-container { margin: var(--space-md) 0; border-radius: 0; border: none; } }
        .image-caption { padding: var(--space-sm); font-size: 0.85rem; color: var(--text-muted); font-style: italic; text-align: center; }
        @media (max-width: 600px) { .image-caption { padding: var(--space-sm) 16px; } }

        .flow-steps { display: flex; flex-direction: column; gap: var(--space-md); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .flow-steps { gap: 1px; background: var(--glass-border); margin: var(--space-md) 0; } }
        .flow-step { display: flex; gap: var(--space-md); align-items: flex-start; padding: var(--space-md); background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); }
        @media (max-width: 600px) { .flow-step { padding: var(--space-md) 16px; border: none; border-radius: 0; border-left: 4px solid var(--gold); } }
        .flow-step-number { width: 40px; height: 40px; min-width: 40px; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; color: var(--navy-dark); }
        .flow-step-content { flex: 1; }
        .flow-step-title { font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-xs); }
        .flow-step-desc { font-size: 0.9rem; color: var(--text-muted); }

        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .stats-grid { gap: 1px; background: var(--glass-border); margin: var(--space-md) 0; } }
        .stat-card { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); text-align: center; }
        @media (max-width: 600px) { .stat-card { border: none; border-radius: 0; padding: var(--space-md); } }
        .stat-value { font-size: 1.75rem; font-weight: 800; background: linear-gradient(135deg, var(--gold), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        @media (max-width: 600px) { .stat-value { font-size: 1.25rem; } }
        .stat-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }

        .summary-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.02)); border: 2px solid var(--gold); border-radius: var(--radius-lg); padding: var(--space-xl); margin: var(--space-xl) 0; }
        @media (max-width: 600px) { .summary-box { border: none; border-radius: 0; border-left: 4px solid var(--gold); padding: var(--space-lg) 16px; margin: var(--space-md) 0; } }
        .summary-title { font-size: 1.25rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
        .summary-list { list-style: none; }
        .summary-list li { display: flex; align-items: flex-start; gap: var(--space-sm); margin-bottom: var(--space-md); color: var(--text-secondary); }
        .summary-list li::before { content: "✓"; color: var(--gold); font-weight: 700; }

        .quiz-section { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: var(--space-xl); margin-top: var(--space-xl); }
        @media (max-width: 600px) { .quiz-section { border: none; border-radius: 0; padding: 0; margin-top: 0; border-top: 8px solid var(--bg-primary); } }
        .quiz-header { text-align: center; margin-bottom: var(--space-xl); }
        @media (max-width: 600px) { .quiz-header { padding: var(--space-lg) 16px var(--space-md); margin-bottom: 0; } }
        .quiz-title { font-size: 1.5rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-sm); }
        .quiz-subtitle { color: var(--text-muted); font-size: 0.9rem; }

        .quiz-question { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); margin-bottom: var(--space-lg); }
        @media (max-width: 600px) { .quiz-question { border: none; border-radius: 0; border-left: 4px solid var(--purple); padding: var(--space-md) 16px; margin-bottom: 0; border-bottom: 1px solid var(--glass-border); } }
        .question-number { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); border-radius: 50%; font-weight: 700; color: var(--navy-dark); margin-bottom: var(--space-md); }
        .question-text { font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-lg); line-height: 1.6; }

        .quiz-options { display: flex; flex-direction: column; gap: var(--space-sm); }
        @media (max-width: 600px) { .quiz-options { gap: 1px; background: var(--glass-border); margin-left: -16px; margin-right: -16px; margin-left: calc(-16px - 4px); } }
        .quiz-option { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md); background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: var(--radius-md); cursor: pointer; transition: all 0.3s ease; }
        @media (max-width: 600px) { .quiz-option { border: none; border-radius: 0; border-left: 4px solid transparent; padding: var(--space-md) 16px; } }
        .quiz-option:hover:not(.disabled) { border-color: var(--gold); background: var(--bg-card); }
        @media (max-width: 600px) { .quiz-option:hover:not(.disabled) { border-left-color: var(--gold); } }
        .quiz-option.correct { border-color: var(--success) !important; background: rgba(0, 200, 83, 0.15) !important; }
        @media (max-width: 600px) { .quiz-option.correct { border-left-color: var(--success) !important; } }
        .quiz-option.incorrect { border-color: var(--error) !important; background: rgba(255, 82, 82, 0.15) !important; }
        @media (max-width: 600px) { .quiz-option.incorrect { border-left-color: var(--error) !important; } }
        .quiz-option.disabled { opacity: 0.7; cursor: not-allowed; }
        .option-marker { width: 28px; height: 28px; min-width: 28px; background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; }
        .quiz-option.correct .option-marker { background: var(--success); border-color: var(--success); color: white; }
        .quiz-option.incorrect .option-marker { background: var(--error); border-color: var(--error); color: white; }
        .option-text { flex: 1; color: var(--text-secondary); }

        .question-feedback { margin-top: var(--space-md); padding: var(--space-md); border-radius: var(--space-sm); display: none; }
        .question-feedback.show { display: block; }
        .question-feedback.correct { background: rgba(0, 200, 83, 0.15); border-left: 4px solid var(--success); }
        .question-feedback.incorrect { background: rgba(255, 82, 82, 0.15); border-left: 4px solid var(--error); }
        .feedback-title { font-weight: 700; margin-bottom: var(--space-xs); }
        .question-feedback.correct .feedback-title { color: var(--success); }
        .question-feedback.incorrect .feedback-title { color: var(--error); }
        .feedback-text { font-size: 0.9rem; color: var(--text-secondary); }

        .quiz-result { text-align: center; padding: var(--space-xl); display: none; }
        .quiz-result.show { display: block; }
        .result-score { font-size: 3rem; font-weight: 800; background: linear-gradient(135deg, var(--gold), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: var(--space-md); }

        .quiz-buttons { display: flex; justify-content: center; padding: var(--space-lg); }
        @media (max-width: 600px) { .quiz-buttons { padding: var(--space-lg) 16px; } }
        .quiz-btn { padding: var(--space-md) var(--space-xl); border-radius: var(--radius-md); font-weight: 700; cursor: pointer; border: none; font-family: inherit; background: var(--glass-bg); color: var(--text-primary); border: 2px solid var(--glass-border); }
        .quiz-btn:hover { border-color: var(--gold); }
    </style>
</head>
<body>
    <div class="background-container">
        <div class="bg-layer-base"></div>
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
    </div>

    <div class="lesson-container">

        <header class="lesson-header">
            <div class="lesson-badge">
                <span>📉</span>
                <span>Reversal Pattern</span>
            </div>
            <div class="lesson-chapter">Chapter 4 - UPD Pattern</div>
            <h1 class="lesson-title">Cấu Trúc 3 Phases Của UPD</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 4.2</span></div>
                <div class="meta-item"><span>⏱️</span><span>8 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>3 câu quiz</span></div>
            </div>
        </header>

        <section class="section">
            <h2 class="section-title"><span>🎯</span> Mục Tiêu Bài Học</h2>
            <p>Trong bài học này, bạn sẽ học chi tiết về cấu trúc 3 phases của pattern UPD và cách nhận diện từng phase một cách chính xác.</p>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>💡</span> Ghi Nhớ Quan Trọng</div>
                <p>UPD có cấu trúc <strong>UP → PAUSE → DOWN</strong>. Vùng PAUSE chính là nơi Smart Money phân phối, tạo thành <strong>HFZ (High Frequency Zone)</strong>.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📈</span> Phase 1: UP - Đợt Tăng Cuối</h2>
            <p>Phase 1 là đợt tăng mạnh cuối cùng của xu hướng tăng. Đây thường là lúc Retail FOMO mua đuổi.</p>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">≥2%</div>
                    <div class="stat-label">Tăng Tối Thiểu</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">Cao</div>
                    <div class="stat-label">Volume</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">FOMO</div>
                    <div class="stat-label">Tâm Lý Retail</div>
                </div>
            </div>

            <div class="flow-steps">
                <div class="flow-step">
                    <div class="flow-step-number">📈</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Đặc Điểm Phase 1</div>
                        <div class="flow-step-desc">Giá tăng mạnh ≥2% với volume cao. Retail FOMO mua đuổi theo trend. Đây thường là đợt tăng cuối của xu hướng tăng dài hạn.</div>
                    </div>
                </div>
            </div>

            <div class="definition-box">
                <div class="definition-box-title"><span>🔍</span> Dấu Hiệu Nhận Biết</div>
                <p>Nến thân lớn, chủ yếu là nến xanh. Volume cao do Retail đổ xô vào mua. Tin tức tích cực tràn lan, sentiment thị trường cực kỳ lạc quan.</p>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/00C853?text=UPD+Phase+1+UP" alt="Phase 1 UP">
            </div>
            <div class="image-caption">Hình 1: Phase 1 của UPD - Đợt tăng mạnh cuối cùng</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>⏸️</span> Phase 2: PAUSE - Vùng Phân Phối (HFZ)</h2>
            <p>Phase 2 là vùng tích lũy/phân phối. Đây là nơi Smart Money bán dần cho Retail và tạo thành HFZ.</p>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value"><1.5%</div>
                    <div class="stat-label">Range Tối Đa</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">1-5</div>
                    <div class="stat-label">Số Nến</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">Cao</div>
                    <div class="stat-label">Volume Ẩn</div>
                </div>
            </div>

            <div class="flow-steps">
                <div class="flow-step">
                    <div class="flow-step-number">⏸️</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Đặc Điểm Phase 2 (TẠO HFZ)</div>
                        <div class="flow-step-desc">Giá đi ngang trong range hẹp <1.5%, từ 1-5 nến. Nến thân nhỏ, wicks ngắn. Volume vẫn cao nhưng giá không tăng → Smart Money đang PHÂN PHỐI.</div>
                    </div>
                </div>
            </div>

            <div class="warning-box">
                <div class="warning-box-title"><span>⚠️</span> Quan Trọng!</div>
                <p>Volume cao + Giá đi ngang = <strong>Smart Money đang bán</strong>. Họ cần Retail tiếp tục mua để hấp thụ lượng bán của họ. Đây là dấu hiệu phân phối kinh điển.</p>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/FFBD59?text=UPD+Phase+2+PAUSE+HFZ" alt="Phase 2 PAUSE">
            </div>
            <div class="image-caption">Hình 2: Phase 2 - Vùng PAUSE tạo thành HFZ (High Frequency Zone)</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📉</span> Phase 3: DOWN - Đảo Chiều Giảm</h2>
            <p>Phase 3 là đợt giảm mạnh sau khi Smart Money hoàn tất phân phối. Đây là "bẫy giá" cho Retail đã mua ở Phase 1.</p>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">≥2%</div>
                    <div class="stat-label">Giảm Tối Thiểu</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">Đột Biến</div>
                    <div class="stat-label">Volume</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">Hoảng</div>
                    <div class="stat-label">Tâm Lý Retail</div>
                </div>
            </div>

            <div class="flow-steps">
                <div class="flow-step">
                    <div class="flow-step-number">📉</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Đặc Điểm Phase 3</div>
                        <div class="flow-step-desc">Giá đảo chiều giảm mạnh ≥2%. Volume đột biến. Nến đỏ thân lớn, ít chồng lấn. Retail hoảng loạn cắt lỗ, tạo thêm áp lực bán.</div>
                    </div>
                </div>
            </div>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>🎯</span> Xác Nhận Pattern</div>
                <p>Phase 3 xác nhận pattern UPD hoàn chỉnh. Sau Phase 3, giá thường quay lại test HFZ (vùng PAUSE) trước khi tiếp tục giảm → <strong>Cơ hội SHORT!</strong></p>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/FF5252?text=UPD+Phase+3+DOWN" alt="Phase 3 DOWN">
            </div>
            <div class="image-caption">Hình 3: Phase 3 - Đảo chiều giảm mạnh, xác nhận pattern UPD</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>🔄</span> Tổng Quan 3 Phases</h2>
            <p>Dưới đây là tổng quan đầy đủ về cấu trúc 3 phases của UPD:</p>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/00F0FF?text=UPD+Complete+3+Phases+Structure" alt="UPD Complete Structure">
            </div>
            <div class="image-caption">Hình 4: Cấu trúc đầy đủ 3 phases của UPD với HFZ</div>

            <div class="summary-box">
                <div class="summary-title"><span>🎯</span> Tổng Kết 3 Phases</div>
                <ul class="summary-list">
                    <li><strong>Phase 1 (UP):</strong> Tăng ≥2%, volume cao, Retail FOMO mua đuổi</li>
                    <li><strong>Phase 2 (PAUSE):</strong> Range <1.5%, 1-5 nến, Smart Money phân phối → TẠO HFZ</li>
                    <li><strong>Phase 3 (DOWN):</strong> Giảm ≥2%, volume đột biến, đảo chiều xu hướng</li>
                    <li>Sau Phase 3: Giá thường retest HFZ → Cơ hội vào lệnh SHORT</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-header">
                <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>
                <p class="quiz-subtitle">Chọn đáp án để nhận phản hồi ngay lập tức</p>
            </div>

            <div class="quiz-question" data-question="1" data-correct="B">
                <div class="question-number">1</div>
                <div class="question-text">Trong Phase 2 của UPD, điều gì đang xảy ra?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Retail đang bán tháo</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Smart Money đang phân phối cho Retail</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Không có giao dịch nào</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Smart Money đang tích lũy thêm</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-question" data-question="2" data-correct="C">
                <div class="question-number">2</div>
                <div class="question-text">Phase 2 của UPD tạo ra vùng gì?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">LFZ - Low Frequency Zone</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Support Zone</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">HFZ - High Frequency Zone</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Resistance Zone</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-question" data-question="3" data-correct="A">
                <div class="question-number">3</div>
                <div class="question-text">Vùng PAUSE trong UPD nên có range tối đa bao nhiêu?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">< 1.5%</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">< 5%</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">< 10%</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Không giới hạn</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-result">
                <div class="result-score">0/3</div>
                <div class="result-text">Hoàn thành!</div>
                <div class="result-message"></div>
            </div>

            <div class="quiz-buttons">
                <button class="quiz-btn" id="retakeQuiz" style="display: none;">Làm Lại</button>
            </div>
        </section>

    </div>

    <script>
        document.addEventListener(''DOMContentLoaded'', function() {
            const questions = document.querySelectorAll(''.quiz-question'');
            const retakeBtn = document.getElementById(''retakeQuiz'');
            const resultDiv = document.querySelector(''.quiz-result'');

            let answeredCount = 0;
            let correctCount = 0;
            const totalQuestions = 3;

            const explanations = {
                1: {
                    correct: ''✓ Chính xác! Trong Phase 2 (PAUSE), Smart Money đang phân phối (bán) cho Retail đang FOMO mua.'',
                    incorrect: ''✗ Sai! Phase 2 là giai đoạn Smart Money phân phối tài sản cho Retail.''
                },
                2: {
                    correct: ''✓ Chính xác! UPD tạo ra HFZ (High Frequency Zone) - vùng áp lực bán mạnh.'',
                    incorrect: ''✗ Sai! UPD là pattern tạo ra HFZ (High Frequency Zone) - vùng Bán.''
                },
                3: {
                    correct: ''✓ Chính xác! Vùng PAUSE cần có range <1.5% để được coi là hợp lệ.'',
                    incorrect: ''✗ Sai! Vùng PAUSE phải có range <1.5%. Range quá rộng = zone không chất lượng.''
                }
            };

            questions.forEach(question => {
                const options = question.querySelectorAll(''.quiz-option'');
                const correctAnswer = question.dataset.correct;
                const questionNum = question.dataset.question;
                const feedbackDiv = question.querySelector(''.question-feedback'');
                const feedbackTitle = feedbackDiv.querySelector(''.feedback-title'');
                const feedbackText = feedbackDiv.querySelector(''.feedback-text'');

                options.forEach(option => {
                    option.addEventListener(''click'', function() {
                        if (question.classList.contains(''answered'')) return;
                        question.classList.add(''answered'');
                        answeredCount++;
                        const selectedOption = this.dataset.option;
                        const isCorrect = selectedOption === correctAnswer;
                        options.forEach(opt => opt.classList.add(''disabled''));
                        if (isCorrect) {
                            this.classList.add(''correct'');
                            correctCount++;
                            feedbackDiv.classList.add(''correct'');
                            feedbackTitle.textContent = ''✓ Chính xác!'';
                            feedbackText.textContent = explanations[questionNum].correct;
                        } else {
                            this.classList.add(''incorrect'');
                            feedbackDiv.classList.add(''incorrect'');
                            feedbackTitle.textContent = ''✗ Sai rồi!'';
                            feedbackText.textContent = explanations[questionNum].incorrect;
                            options.forEach(opt => { if (opt.dataset.option === correctAnswer) opt.classList.add(''correct''); });
                        }
                        feedbackDiv.classList.add(''show'');
                        if (answeredCount === totalQuestions) {
                            resultDiv.querySelector(''.result-score'').textContent = `${correctCount}/${totalQuestions}`;
                            resultDiv.querySelector(''.result-message'').textContent = correctCount === totalQuestions ? ''🎉 Xuất sắc!'' : correctCount >= 2 ? ''👍 Tốt lắm!'' : ''📚 Xem lại bài học nhé!'';
                            resultDiv.classList.add(''show'');
                            retakeBtn.style.display = ''inline-block'';
                        }
                    });
                });
            });

            retakeBtn.addEventListener(''click'', function() {
                answeredCount = 0; correctCount = 0;
                questions.forEach(q => {
                    q.classList.remove(''answered'');
                    q.querySelectorAll(''.quiz-option'').forEach(o => o.classList.remove(''correct'', ''incorrect'', ''disabled''));
                    q.querySelector(''.question-feedback'').classList.remove(''show'', ''correct'', ''incorrect'');
                });
                resultDiv.classList.remove(''show'');
                retakeBtn.style.display = ''none'';
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

-- Lesson 4.3: Tại Sao UPD Là Pattern Mạnh?
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch4-l3',
  'module-tier-1-ch4',
  'course-tier1-trading-foundation',
  'Bài 4.3: Tại Sao UPD Là Pattern Mạnh?',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 4.3: Tại Sao UPD Là Pattern Mạnh? | GEM Trading Academy</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root { --navy: #112250; --navy-dark: #0a1628; --gold: #FFBD59; --gold-dark: #E5A73D; --cyan: #00F0FF; --purple: #6A5BFF; --burgundy: #9C0612; --burgundy-light: #C41E2A; --success: #00C853; --error: #FF5252; --bg-primary: #0a1628; --bg-card: rgba(17, 34, 80, 0.6); --text-primary: #FFFFFF; --text-secondary: rgba(255, 255, 255, 0.85); --text-muted: rgba(255, 255, 255, 0.6); --glass-bg: rgba(17, 34, 80, 0.4); --glass-border: rgba(255, 189, 89, 0.2); --space-xs: 4px; --space-sm: 8px; --space-md: 16px; --space-lg: 24px; --space-xl: 32px; --radius-md: 12px; --radius-lg: 16px; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: ''Montserrat'', sans-serif; background: var(--bg-primary); color: var(--text-primary); line-height: 1.6; }
        img { max-width: 100%; height: auto; display: block; }
        .background-container { position: fixed; inset: 0; z-index: -1; }
        .bg-layer-base { position: absolute; inset: 0; background: linear-gradient(180deg, var(--navy-dark) 0%, var(--navy) 50%, var(--navy-dark) 100%); }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3; }
        .orb-1 { width: 400px; height: 400px; background: var(--gold); top: -100px; right: -100px; }
        .orb-2 { width: 300px; height: 300px; background: var(--cyan); bottom: 20%; left: -100px; }
        .orb-3 { width: 250px; height: 250px; background: var(--burgundy); bottom: -50px; right: 20%; }
        .lesson-container { max-width: 800px; margin: 0 auto; padding: 1.5rem; }
        @media (max-width: 600px) { .lesson-container { padding: 0; } }
        .lesson-header { text-align: center; padding: var(--space-xl); margin-bottom: var(--space-xl); background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); }
        @media (max-width: 600px) { .lesson-header { padding: var(--space-lg) 16px; margin-bottom: 0; border: none; border-radius: 0; border-bottom: 8px solid var(--bg-primary); } }
        .lesson-badge { display: inline-flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); background: linear-gradient(135deg, var(--burgundy), var(--burgundy-light)); border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: var(--space-md); }
        .lesson-chapter { font-size: 0.9rem; color: var(--gold); font-weight: 600; margin-bottom: var(--space-sm); text-transform: uppercase; letter-spacing: 2px; }
        .lesson-title { font-size: clamp(1.75rem, 5vw, 2.5rem); font-weight: 800; margin-bottom: var(--space-md); background: linear-gradient(135deg, var(--text-primary), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lesson-meta { display: flex; justify-content: center; gap: var(--space-lg); flex-wrap: wrap; color: var(--text-muted); font-size: 0.85rem; }
        .meta-item { display: flex; align-items: center; gap: var(--space-xs); }
        .section { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: var(--space-xl); margin-bottom: var(--space-lg); }
        @media (max-width: 600px) { .section { padding: 0; margin-bottom: 0; border: none; border-radius: 0; border-bottom: 8px solid var(--bg-primary); } }
        .section-title { font-size: 1.5rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
        @media (max-width: 600px) { .section-title { padding: var(--space-lg) 16px var(--space-md) 16px; margin-bottom: 0; } }
        .section > p { color: var(--text-secondary); margin-bottom: var(--space-md); }
        @media (max-width: 600px) { .section > p { padding: 0 16px; } }
        .highlight-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15), rgba(255, 189, 89, 0.05)); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .highlight-box { border: none; border-radius: 0; border-left: 4px solid var(--gold); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .highlight-box-title { font-weight: 700; color: var(--gold); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }
        .highlight-box p { color: var(--text-secondary); margin: 0; }
        .definition-box { background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.02)); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .definition-box { border: none; border-radius: 0; border-left: 4px solid var(--cyan); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .definition-box-title { font-weight: 700; color: var(--cyan); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }
        .warning-box { background: linear-gradient(135deg, rgba(156, 6, 18, 0.2), rgba(156, 6, 18, 0.05)); border: 1px solid rgba(156, 6, 18, 0.4); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .warning-box { border: none; border-radius: 0; border-left: 4px solid var(--burgundy); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .warning-box-title { font-weight: 700; color: var(--burgundy-light); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }
        .image-container { margin: var(--space-xl) 0; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--glass-border); }
        @media (max-width: 600px) { .image-container { margin: var(--space-md) 0; border-radius: 0; border: none; } }
        .image-caption { padding: var(--space-sm); font-size: 0.85rem; color: var(--text-muted); font-style: italic; text-align: center; }
        @media (max-width: 600px) { .image-caption { padding: var(--space-sm) 16px; } }
        .flow-steps { display: flex; flex-direction: column; gap: var(--space-md); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .flow-steps { gap: 1px; background: var(--glass-border); margin: var(--space-md) 0; } }
        .flow-step { display: flex; gap: var(--space-md); align-items: flex-start; padding: var(--space-md); background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); }
        @media (max-width: 600px) { .flow-step { padding: var(--space-md) 16px; border: none; border-radius: 0; border-left: 4px solid var(--gold); } }
        .flow-step-number { width: 40px; height: 40px; min-width: 40px; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; color: var(--navy-dark); }
        .flow-step-content { flex: 1; }
        .flow-step-title { font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-xs); }
        .flow-step-desc { font-size: 0.9rem; color: var(--text-muted); }
        .summary-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.02)); border: 2px solid var(--gold); border-radius: var(--radius-lg); padding: var(--space-xl); margin: var(--space-xl) 0; }
        @media (max-width: 600px) { .summary-box { border: none; border-radius: 0; border-left: 4px solid var(--gold); padding: var(--space-lg) 16px; margin: var(--space-md) 0; } }
        .summary-title { font-size: 1.25rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
        .summary-list { list-style: none; }
        .summary-list li { display: flex; align-items: flex-start; gap: var(--space-sm); margin-bottom: var(--space-md); color: var(--text-secondary); }
        .summary-list li::before { content: "✓"; color: var(--gold); font-weight: 700; }
        .quiz-section { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: var(--space-xl); margin-top: var(--space-xl); }
        @media (max-width: 600px) { .quiz-section { border: none; border-radius: 0; padding: 0; margin-top: 0; border-top: 8px solid var(--bg-primary); } }
        .quiz-header { text-align: center; margin-bottom: var(--space-xl); }
        @media (max-width: 600px) { .quiz-header { padding: var(--space-lg) 16px var(--space-md); margin-bottom: 0; } }
        .quiz-title { font-size: 1.5rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-sm); }
        .quiz-subtitle { color: var(--text-muted); font-size: 0.9rem; }
        .quiz-question { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); margin-bottom: var(--space-lg); }
        @media (max-width: 600px) { .quiz-question { border: none; border-radius: 0; border-left: 4px solid var(--purple); padding: var(--space-md) 16px; margin-bottom: 0; border-bottom: 1px solid var(--glass-border); } }
        .question-number { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); border-radius: 50%; font-weight: 700; color: var(--navy-dark); margin-bottom: var(--space-md); }
        .question-text { font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-lg); line-height: 1.6; }
        .quiz-options { display: flex; flex-direction: column; gap: var(--space-sm); }
        @media (max-width: 600px) { .quiz-options { gap: 1px; background: var(--glass-border); margin-left: calc(-16px - 4px); margin-right: -16px; } }
        .quiz-option { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md); background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: var(--radius-md); cursor: pointer; transition: all 0.3s ease; }
        @media (max-width: 600px) { .quiz-option { border: none; border-radius: 0; border-left: 4px solid transparent; padding: var(--space-md) 16px; } }
        .quiz-option:hover:not(.disabled) { border-color: var(--gold); }
        .quiz-option.correct { border-color: var(--success) !important; background: rgba(0, 200, 83, 0.15) !important; }
        @media (max-width: 600px) { .quiz-option.correct { border-left-color: var(--success) !important; } }
        .quiz-option.incorrect { border-color: var(--error) !important; background: rgba(255, 82, 82, 0.15) !important; }
        @media (max-width: 600px) { .quiz-option.incorrect { border-left-color: var(--error) !important; } }
        .quiz-option.disabled { opacity: 0.7; cursor: not-allowed; }
        .option-marker { width: 28px; height: 28px; min-width: 28px; background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; }
        .quiz-option.correct .option-marker { background: var(--success); border-color: var(--success); color: white; }
        .quiz-option.incorrect .option-marker { background: var(--error); border-color: var(--error); color: white; }
        .option-text { flex: 1; color: var(--text-secondary); }
        .question-feedback { margin-top: var(--space-md); padding: var(--space-md); border-radius: var(--space-sm); display: none; }
        .question-feedback.show { display: block; }
        .question-feedback.correct { background: rgba(0, 200, 83, 0.15); border-left: 4px solid var(--success); }
        .question-feedback.incorrect { background: rgba(255, 82, 82, 0.15); border-left: 4px solid var(--error); }
        .feedback-title { font-weight: 700; margin-bottom: var(--space-xs); }
        .question-feedback.correct .feedback-title { color: var(--success); }
        .question-feedback.incorrect .feedback-title { color: var(--error); }
        .feedback-text { font-size: 0.9rem; color: var(--text-secondary); }
        .quiz-result { text-align: center; padding: var(--space-xl); display: none; }
        .quiz-result.show { display: block; }
        .result-score { font-size: 3rem; font-weight: 800; background: linear-gradient(135deg, var(--gold), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: var(--space-md); }
        .quiz-buttons { display: flex; justify-content: center; padding: var(--space-lg); }
        @media (max-width: 600px) { .quiz-buttons { padding: var(--space-lg) 16px; } }
        .quiz-btn { padding: var(--space-md) var(--space-xl); border-radius: var(--radius-md); font-weight: 700; cursor: pointer; border: none; font-family: inherit; background: var(--glass-bg); color: var(--text-primary); border: 2px solid var(--glass-border); }
        .quiz-btn:hover { border-color: var(--gold); }
    </style>
</head>
<body>
    <div class="background-container">
        <div class="bg-layer-base"></div>
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
    </div>

    <div class="lesson-container">
        <header class="lesson-header">
            <div class="lesson-badge"><span>📉</span><span>Reversal Pattern</span></div>
            <div class="lesson-chapter">Chapter 4 - UPD Pattern</div>
            <h1 class="lesson-title">Tại Sao UPD Là Pattern Mạnh?</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 4.3</span></div>
                <div class="meta-item"><span>⏱️</span><span>7 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <section class="section">
            <h2 class="section-title"><span>🎯</span> Mục Tiêu Bài Học</h2>
            <p>Trong bài học này, bạn sẽ hiểu sâu về lý do tại sao UPD được coi là một trong những pattern mạnh nhất trong hệ thống GEM Frequency Trading.</p>
            <div class="highlight-box">
                <div class="highlight-box-title"><span>⭐</span> Sức Mạnh Của UPD</div>
                <p>UPD mạnh vì nó bắt được <strong>điểm đảo chiều xu hướng</strong> - nơi Smart Money phân phối và Retail bị bẫy. Còn nhiều lệnh bán chưa khớp = áp lực bán cực mạnh khi retest.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>💰</span> Logic Smart Money Phía Sau UPD</h2>
            <p>Để hiểu tại sao UPD mạnh, cần hiểu cách Smart Money hoạt động:</p>
            <div class="flow-steps">
                <div class="flow-step">
                    <div class="flow-step-number">1</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Phase 1: Smart Money Đẩy Giá Lên</div>
                        <div class="flow-step-desc">Smart Money đẩy giá tăng mạnh để thu hút sự chú ý của Retail. Tin tức tích cực lan tràn, tạo FOMO.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">2</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Phase 2: Smart Money Bán Dần</div>
                        <div class="flow-step-desc">Tại vùng PAUSE, Smart Money bán dần cho Retail đang FOMO mua đuổi. Họ cần Retail hấp thụ lượng bán khổng lồ.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">3</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Phase 3: Bẫy Sập</div>
                        <div class="flow-step-desc">Sau khi phân phối xong, giá đảo chiều giảm. Retail bị kẹt ở đỉnh, hoảng loạn cắt lỗ, tạo thêm áp lực bán.</div>
                    </div>
                </div>
            </div>
            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/FFBD59?text=Smart+Money+Cycle+at+UPD" alt="Smart Money Cycle">
            </div>
            <div class="image-caption">Hình 1: Chu kỳ Smart Money tại pattern UPD</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>🔥</span> Tại Sao HFZ Từ UPD Mạnh?</h2>
            <p>HFZ tạo từ UPD mạnh hơn HFZ tạo từ DPD vì những lý do sau:</p>
            <div class="definition-box">
                <div class="definition-box-title"><span>💡</span> Lý Do 1: Còn Nhiều Lệnh Bán Chưa Khớp</div>
                <p>Tại Phase 2, Smart Money không thể bán hết trong một lần. Khi giá quay lại test HFZ, những lệnh bán còn lại sẽ được kích hoạt → áp lực bán cực mạnh.</p>
            </div>
            <div class="definition-box">
                <div class="definition-box-title"><span>💡</span> Lý Do 2: Retail Bị Bẫy Ở Đỉnh</div>
                <p>Những Retail mua ở Phase 1 và Phase 2 đang thua lỗ. Khi giá quay lại gần vùng họ mua, nhiều người sẽ cắt lỗ hòa vốn → thêm áp lực bán.</p>
            </div>
            <div class="definition-box">
                <div class="definition-box-title"><span>💡</span> Lý Do 3: Tâm Lý Thị Trường Đã Đổi</div>
                <p>Sau Phase 3 giảm mạnh, sentiment thị trường chuyển từ tham lam sang sợ hãi. Người mua mới ít, người bán nhiều.</p>
            </div>
            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/FF5252?text=Trapped+Retail+at+HFZ" alt="Trapped Retail">
            </div>
            <div class="image-caption">Hình 2: Retail bị bẫy tại HFZ - Tạo áp lực bán khi retest</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>⚡</span> So Sánh Sức Mạnh: UPD vs DPD</h2>
            <p>Cả UPD và DPD đều tạo HFZ, nhưng UPD mạnh hơn:</p>
            <div class="warning-box">
                <div class="warning-box-title"><span>📊</span> DPD (Continuation)</div>
                <p>DPD xuất hiện TRONG xu hướng giảm. HFZ tạo ra là điểm nghỉ trước khi giảm tiếp. Mạnh, nhưng xu hướng có thể đã yếu dần.</p>
            </div>
            <div class="highlight-box">
                <div class="highlight-box-title"><span>⭐</span> UPD (Reversal)</div>
                <p>UPD xuất hiện TẠI ĐỈNH xu hướng tăng. HFZ tạo ra bắt được điểm đảo chiều. Mạnh hơn vì đây là khởi đầu của xu hướng giảm mới!</p>
            </div>
            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/00F0FF?text=UPD+vs+DPD+Strength" alt="UPD vs DPD">
            </div>
            <div class="image-caption">Hình 3: So sánh sức mạnh HFZ từ UPD và DPD</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📝</span> Tổng Kết</h2>
            <div class="summary-box">
                <div class="summary-title"><span>🎯</span> Điểm Chính</div>
                <ul class="summary-list">
                    <li>UPD mạnh vì bắt được điểm đảo chiều xu hướng - nơi trend tăng kết thúc</li>
                    <li>Smart Money đã bán tại Phase 2, còn nhiều lệnh bán chưa khớp</li>
                    <li>Retail bị bẫy ở đỉnh, tạo thêm áp lực bán khi cắt lỗ</li>
                    <li>HFZ từ UPD mạnh hơn DPD vì đây là khởi đầu xu hướng giảm mới</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-header">
                <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>
                <p class="quiz-subtitle">Chọn đáp án để nhận phản hồi ngay lập tức</p>
            </div>
            <div class="quiz-question" data-question="1" data-correct="C">
                <div class="question-number">1</div>
                <div class="question-text">Tại sao HFZ từ UPD có áp lực bán mạnh khi giá retest?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A"><span class="option-marker">A</span><span class="option-text">Vì zone rộng hơn</span></div>
                    <div class="quiz-option" data-option="B"><span class="option-marker">B</span><span class="option-text">Vì xuất hiện nhiều hơn</span></div>
                    <div class="quiz-option" data-option="C"><span class="option-marker">C</span><span class="option-text">Vì còn nhiều lệnh bán chưa khớp và Retail bị bẫy</span></div>
                    <div class="quiz-option" data-option="D"><span class="option-marker">D</span><span class="option-text">Vì volume thấp</span></div>
                </div>
                <div class="question-feedback"><div class="feedback-title"></div><div class="feedback-text"></div></div>
            </div>
            <div class="quiz-question" data-question="2" data-correct="B">
                <div class="question-number">2</div>
                <div class="question-text">UPD xuất hiện ở vị trí nào trong xu hướng?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A"><span class="option-marker">A</span><span class="option-text">Giữa xu hướng giảm</span></div>
                    <div class="quiz-option" data-option="B"><span class="option-marker">B</span><span class="option-text">Tại đỉnh xu hướng tăng</span></div>
                    <div class="quiz-option" data-option="C"><span class="option-marker">C</span><span class="option-text">Tại đáy xu hướng giảm</span></div>
                    <div class="quiz-option" data-option="D"><span class="option-marker">D</span><span class="option-text">Giữa xu hướng tăng</span></div>
                </div>
                <div class="question-feedback"><div class="feedback-title"></div><div class="feedback-text"></div></div>
            </div>
            <div class="quiz-result"><div class="result-score">0/2</div><div class="result-text">Hoàn thành!</div><div class="result-message"></div></div>
            <div class="quiz-buttons"><button class="quiz-btn" id="retakeQuiz" style="display: none;">Làm Lại</button></div>
        </section>
    </div>

    <script>
        document.addEventListener(''DOMContentLoaded'', function() {
            const questions = document.querySelectorAll(''.quiz-question'');
            const retakeBtn = document.getElementById(''retakeQuiz'');
            const resultDiv = document.querySelector(''.quiz-result'');
            let answeredCount = 0, correctCount = 0;
            const totalQuestions = 2;
            const explanations = {
                1: { correct: ''✓ Chính xác! HFZ từ UPD mạnh vì còn nhiều lệnh bán chưa khớp và Retail bị bẫy ở đỉnh.'', incorrect: ''✗ Sai! Lý do chính là còn nhiều lệnh bán chưa khớp và Retail bị bẫy tại đỉnh.'' },
                2: { correct: ''✓ Chính xác! UPD xuất hiện tại đỉnh xu hướng tăng - điểm đảo chiều.'', incorrect: ''✗ Sai! UPD là pattern đảo chiều, xuất hiện tại ĐỈNH xu hướng tăng.'' }
            };
            questions.forEach(q => {
                const opts = q.querySelectorAll(''.quiz-option'');
                opts.forEach(o => {
                    o.addEventListener(''click'', function() {
                        if (q.classList.contains(''answered'')) return;
                        q.classList.add(''answered''); answeredCount++;
                        const sel = this.dataset.option, corr = q.dataset.correct, isCor = sel === corr;
                        opts.forEach(op => op.classList.add(''disabled''));
                        if (isCor) { this.classList.add(''correct''); correctCount++; q.querySelector(''.question-feedback'').classList.add(''correct''); }
                        else { this.classList.add(''incorrect''); q.querySelector(''.question-feedback'').classList.add(''incorrect''); opts.forEach(op => { if(op.dataset.option === corr) op.classList.add(''correct''); }); }
                        q.querySelector(''.feedback-title'').textContent = isCor ? ''✓ Chính xác!'' : ''✗ Sai rồi!'';
                        q.querySelector(''.feedback-text'').textContent = explanations[q.dataset.question][isCor ? ''correct'' : ''incorrect''];
                        q.querySelector(''.question-feedback'').classList.add(''show'');
                        if (answeredCount === totalQuestions) {
                            resultDiv.querySelector(''.result-score'').textContent = `${correctCount}/${totalQuestions}`;
                            resultDiv.querySelector(''.result-message'').textContent = correctCount === totalQuestions ? ''🎉 Xuất sắc!'' : ''📚 Ôn lại bài nhé!'';
                            resultDiv.classList.add(''show''); retakeBtn.style.display = ''inline-block'';
                        }
                    });
                });
            });
            retakeBtn.addEventListener(''click'', function() {
                answeredCount = 0; correctCount = 0;
                questions.forEach(q => { q.classList.remove(''answered''); q.querySelectorAll(''.quiz-option'').forEach(o => o.classList.remove(''correct'', ''incorrect'', ''disabled'')); q.querySelector(''.question-feedback'').classList.remove(''show'', ''correct'', ''incorrect''); });
                resultDiv.classList.remove(''show''); retakeBtn.style.display = ''none'';
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
    <title>Bài 4.3: Tại Sao UPD Là Pattern Mạnh? | GEM Trading Academy</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root { --navy: #112250; --navy-dark: #0a1628; --gold: #FFBD59; --gold-dark: #E5A73D; --cyan: #00F0FF; --purple: #6A5BFF; --burgundy: #9C0612; --burgundy-light: #C41E2A; --success: #00C853; --error: #FF5252; --bg-primary: #0a1628; --bg-card: rgba(17, 34, 80, 0.6); --text-primary: #FFFFFF; --text-secondary: rgba(255, 255, 255, 0.85); --text-muted: rgba(255, 255, 255, 0.6); --glass-bg: rgba(17, 34, 80, 0.4); --glass-border: rgba(255, 189, 89, 0.2); --space-xs: 4px; --space-sm: 8px; --space-md: 16px; --space-lg: 24px; --space-xl: 32px; --radius-md: 12px; --radius-lg: 16px; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: ''Montserrat'', sans-serif; background: var(--bg-primary); color: var(--text-primary); line-height: 1.6; }
        img { max-width: 100%; height: auto; display: block; }
        .background-container { position: fixed; inset: 0; z-index: -1; }
        .bg-layer-base { position: absolute; inset: 0; background: linear-gradient(180deg, var(--navy-dark) 0%, var(--navy) 50%, var(--navy-dark) 100%); }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3; }
        .orb-1 { width: 400px; height: 400px; background: var(--gold); top: -100px; right: -100px; }
        .orb-2 { width: 300px; height: 300px; background: var(--cyan); bottom: 20%; left: -100px; }
        .orb-3 { width: 250px; height: 250px; background: var(--burgundy); bottom: -50px; right: 20%; }
        .lesson-container { max-width: 800px; margin: 0 auto; padding: 1.5rem; }
        @media (max-width: 600px) { .lesson-container { padding: 0; } }
        .lesson-header { text-align: center; padding: var(--space-xl); margin-bottom: var(--space-xl); background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); }
        @media (max-width: 600px) { .lesson-header { padding: var(--space-lg) 16px; margin-bottom: 0; border: none; border-radius: 0; border-bottom: 8px solid var(--bg-primary); } }
        .lesson-badge { display: inline-flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); background: linear-gradient(135deg, var(--burgundy), var(--burgundy-light)); border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: var(--space-md); }
        .lesson-chapter { font-size: 0.9rem; color: var(--gold); font-weight: 600; margin-bottom: var(--space-sm); text-transform: uppercase; letter-spacing: 2px; }
        .lesson-title { font-size: clamp(1.75rem, 5vw, 2.5rem); font-weight: 800; margin-bottom: var(--space-md); background: linear-gradient(135deg, var(--text-primary), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lesson-meta { display: flex; justify-content: center; gap: var(--space-lg); flex-wrap: wrap; color: var(--text-muted); font-size: 0.85rem; }
        .meta-item { display: flex; align-items: center; gap: var(--space-xs); }
        .section { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: var(--space-xl); margin-bottom: var(--space-lg); }
        @media (max-width: 600px) { .section { padding: 0; margin-bottom: 0; border: none; border-radius: 0; border-bottom: 8px solid var(--bg-primary); } }
        .section-title { font-size: 1.5rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
        @media (max-width: 600px) { .section-title { padding: var(--space-lg) 16px var(--space-md) 16px; margin-bottom: 0; } }
        .section > p { color: var(--text-secondary); margin-bottom: var(--space-md); }
        @media (max-width: 600px) { .section > p { padding: 0 16px; } }
        .highlight-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15), rgba(255, 189, 89, 0.05)); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .highlight-box { border: none; border-radius: 0; border-left: 4px solid var(--gold); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .highlight-box-title { font-weight: 700; color: var(--gold); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }
        .highlight-box p { color: var(--text-secondary); margin: 0; }
        .definition-box { background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.02)); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .definition-box { border: none; border-radius: 0; border-left: 4px solid var(--cyan); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .definition-box-title { font-weight: 700; color: var(--cyan); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }
        .warning-box { background: linear-gradient(135deg, rgba(156, 6, 18, 0.2), rgba(156, 6, 18, 0.05)); border: 1px solid rgba(156, 6, 18, 0.4); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .warning-box { border: none; border-radius: 0; border-left: 4px solid var(--burgundy); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .warning-box-title { font-weight: 700; color: var(--burgundy-light); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }
        .image-container { margin: var(--space-xl) 0; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--glass-border); }
        @media (max-width: 600px) { .image-container { margin: var(--space-md) 0; border-radius: 0; border: none; } }
        .image-caption { padding: var(--space-sm); font-size: 0.85rem; color: var(--text-muted); font-style: italic; text-align: center; }
        @media (max-width: 600px) { .image-caption { padding: var(--space-sm) 16px; } }
        .flow-steps { display: flex; flex-direction: column; gap: var(--space-md); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .flow-steps { gap: 1px; background: var(--glass-border); margin: var(--space-md) 0; } }
        .flow-step { display: flex; gap: var(--space-md); align-items: flex-start; padding: var(--space-md); background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); }
        @media (max-width: 600px) { .flow-step { padding: var(--space-md) 16px; border: none; border-radius: 0; border-left: 4px solid var(--gold); } }
        .flow-step-number { width: 40px; height: 40px; min-width: 40px; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; color: var(--navy-dark); }
        .flow-step-content { flex: 1; }
        .flow-step-title { font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-xs); }
        .flow-step-desc { font-size: 0.9rem; color: var(--text-muted); }
        .summary-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.02)); border: 2px solid var(--gold); border-radius: var(--radius-lg); padding: var(--space-xl); margin: var(--space-xl) 0; }
        @media (max-width: 600px) { .summary-box { border: none; border-radius: 0; border-left: 4px solid var(--gold); padding: var(--space-lg) 16px; margin: var(--space-md) 0; } }
        .summary-title { font-size: 1.25rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
        .summary-list { list-style: none; }
        .summary-list li { display: flex; align-items: flex-start; gap: var(--space-sm); margin-bottom: var(--space-md); color: var(--text-secondary); }
        .summary-list li::before { content: "✓"; color: var(--gold); font-weight: 700; }
        .quiz-section { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: var(--space-xl); margin-top: var(--space-xl); }
        @media (max-width: 600px) { .quiz-section { border: none; border-radius: 0; padding: 0; margin-top: 0; border-top: 8px solid var(--bg-primary); } }
        .quiz-header { text-align: center; margin-bottom: var(--space-xl); }
        @media (max-width: 600px) { .quiz-header { padding: var(--space-lg) 16px var(--space-md); margin-bottom: 0; } }
        .quiz-title { font-size: 1.5rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-sm); }
        .quiz-subtitle { color: var(--text-muted); font-size: 0.9rem; }
        .quiz-question { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); margin-bottom: var(--space-lg); }
        @media (max-width: 600px) { .quiz-question { border: none; border-radius: 0; border-left: 4px solid var(--purple); padding: var(--space-md) 16px; margin-bottom: 0; border-bottom: 1px solid var(--glass-border); } }
        .question-number { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); border-radius: 50%; font-weight: 700; color: var(--navy-dark); margin-bottom: var(--space-md); }
        .question-text { font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-lg); line-height: 1.6; }
        .quiz-options { display: flex; flex-direction: column; gap: var(--space-sm); }
        @media (max-width: 600px) { .quiz-options { gap: 1px; background: var(--glass-border); margin-left: calc(-16px - 4px); margin-right: -16px; } }
        .quiz-option { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md); background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: var(--radius-md); cursor: pointer; transition: all 0.3s ease; }
        @media (max-width: 600px) { .quiz-option { border: none; border-radius: 0; border-left: 4px solid transparent; padding: var(--space-md) 16px; } }
        .quiz-option:hover:not(.disabled) { border-color: var(--gold); }
        .quiz-option.correct { border-color: var(--success) !important; background: rgba(0, 200, 83, 0.15) !important; }
        @media (max-width: 600px) { .quiz-option.correct { border-left-color: var(--success) !important; } }
        .quiz-option.incorrect { border-color: var(--error) !important; background: rgba(255, 82, 82, 0.15) !important; }
        @media (max-width: 600px) { .quiz-option.incorrect { border-left-color: var(--error) !important; } }
        .quiz-option.disabled { opacity: 0.7; cursor: not-allowed; }
        .option-marker { width: 28px; height: 28px; min-width: 28px; background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; }
        .quiz-option.correct .option-marker { background: var(--success); border-color: var(--success); color: white; }
        .quiz-option.incorrect .option-marker { background: var(--error); border-color: var(--error); color: white; }
        .option-text { flex: 1; color: var(--text-secondary); }
        .question-feedback { margin-top: var(--space-md); padding: var(--space-md); border-radius: var(--space-sm); display: none; }
        .question-feedback.show { display: block; }
        .question-feedback.correct { background: rgba(0, 200, 83, 0.15); border-left: 4px solid var(--success); }
        .question-feedback.incorrect { background: rgba(255, 82, 82, 0.15); border-left: 4px solid var(--error); }
        .feedback-title { font-weight: 700; margin-bottom: var(--space-xs); }
        .question-feedback.correct .feedback-title { color: var(--success); }
        .question-feedback.incorrect .feedback-title { color: var(--error); }
        .feedback-text { font-size: 0.9rem; color: var(--text-secondary); }
        .quiz-result { text-align: center; padding: var(--space-xl); display: none; }
        .quiz-result.show { display: block; }
        .result-score { font-size: 3rem; font-weight: 800; background: linear-gradient(135deg, var(--gold), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: var(--space-md); }
        .quiz-buttons { display: flex; justify-content: center; padding: var(--space-lg); }
        @media (max-width: 600px) { .quiz-buttons { padding: var(--space-lg) 16px; } }
        .quiz-btn { padding: var(--space-md) var(--space-xl); border-radius: var(--radius-md); font-weight: 700; cursor: pointer; border: none; font-family: inherit; background: var(--glass-bg); color: var(--text-primary); border: 2px solid var(--glass-border); }
        .quiz-btn:hover { border-color: var(--gold); }
    </style>
</head>
<body>
    <div class="background-container">
        <div class="bg-layer-base"></div>
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
    </div>

    <div class="lesson-container">
        <header class="lesson-header">
            <div class="lesson-badge"><span>📉</span><span>Reversal Pattern</span></div>
            <div class="lesson-chapter">Chapter 4 - UPD Pattern</div>
            <h1 class="lesson-title">Tại Sao UPD Là Pattern Mạnh?</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 4.3</span></div>
                <div class="meta-item"><span>⏱️</span><span>7 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <section class="section">
            <h2 class="section-title"><span>🎯</span> Mục Tiêu Bài Học</h2>
            <p>Trong bài học này, bạn sẽ hiểu sâu về lý do tại sao UPD được coi là một trong những pattern mạnh nhất trong hệ thống GEM Frequency Trading.</p>
            <div class="highlight-box">
                <div class="highlight-box-title"><span>⭐</span> Sức Mạnh Của UPD</div>
                <p>UPD mạnh vì nó bắt được <strong>điểm đảo chiều xu hướng</strong> - nơi Smart Money phân phối và Retail bị bẫy. Còn nhiều lệnh bán chưa khớp = áp lực bán cực mạnh khi retest.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>💰</span> Logic Smart Money Phía Sau UPD</h2>
            <p>Để hiểu tại sao UPD mạnh, cần hiểu cách Smart Money hoạt động:</p>
            <div class="flow-steps">
                <div class="flow-step">
                    <div class="flow-step-number">1</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Phase 1: Smart Money Đẩy Giá Lên</div>
                        <div class="flow-step-desc">Smart Money đẩy giá tăng mạnh để thu hút sự chú ý của Retail. Tin tức tích cực lan tràn, tạo FOMO.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">2</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Phase 2: Smart Money Bán Dần</div>
                        <div class="flow-step-desc">Tại vùng PAUSE, Smart Money bán dần cho Retail đang FOMO mua đuổi. Họ cần Retail hấp thụ lượng bán khổng lồ.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">3</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Phase 3: Bẫy Sập</div>
                        <div class="flow-step-desc">Sau khi phân phối xong, giá đảo chiều giảm. Retail bị kẹt ở đỉnh, hoảng loạn cắt lỗ, tạo thêm áp lực bán.</div>
                    </div>
                </div>
            </div>
            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/FFBD59?text=Smart+Money+Cycle+at+UPD" alt="Smart Money Cycle">
            </div>
            <div class="image-caption">Hình 1: Chu kỳ Smart Money tại pattern UPD</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>🔥</span> Tại Sao HFZ Từ UPD Mạnh?</h2>
            <p>HFZ tạo từ UPD mạnh hơn HFZ tạo từ DPD vì những lý do sau:</p>
            <div class="definition-box">
                <div class="definition-box-title"><span>💡</span> Lý Do 1: Còn Nhiều Lệnh Bán Chưa Khớp</div>
                <p>Tại Phase 2, Smart Money không thể bán hết trong một lần. Khi giá quay lại test HFZ, những lệnh bán còn lại sẽ được kích hoạt → áp lực bán cực mạnh.</p>
            </div>
            <div class="definition-box">
                <div class="definition-box-title"><span>💡</span> Lý Do 2: Retail Bị Bẫy Ở Đỉnh</div>
                <p>Những Retail mua ở Phase 1 và Phase 2 đang thua lỗ. Khi giá quay lại gần vùng họ mua, nhiều người sẽ cắt lỗ hòa vốn → thêm áp lực bán.</p>
            </div>
            <div class="definition-box">
                <div class="definition-box-title"><span>💡</span> Lý Do 3: Tâm Lý Thị Trường Đã Đổi</div>
                <p>Sau Phase 3 giảm mạnh, sentiment thị trường chuyển từ tham lam sang sợ hãi. Người mua mới ít, người bán nhiều.</p>
            </div>
            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/FF5252?text=Trapped+Retail+at+HFZ" alt="Trapped Retail">
            </div>
            <div class="image-caption">Hình 2: Retail bị bẫy tại HFZ - Tạo áp lực bán khi retest</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>⚡</span> So Sánh Sức Mạnh: UPD vs DPD</h2>
            <p>Cả UPD và DPD đều tạo HFZ, nhưng UPD mạnh hơn:</p>
            <div class="warning-box">
                <div class="warning-box-title"><span>📊</span> DPD (Continuation)</div>
                <p>DPD xuất hiện TRONG xu hướng giảm. HFZ tạo ra là điểm nghỉ trước khi giảm tiếp. Mạnh, nhưng xu hướng có thể đã yếu dần.</p>
            </div>
            <div class="highlight-box">
                <div class="highlight-box-title"><span>⭐</span> UPD (Reversal)</div>
                <p>UPD xuất hiện TẠI ĐỈNH xu hướng tăng. HFZ tạo ra bắt được điểm đảo chiều. Mạnh hơn vì đây là khởi đầu của xu hướng giảm mới!</p>
            </div>
            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/00F0FF?text=UPD+vs+DPD+Strength" alt="UPD vs DPD">
            </div>
            <div class="image-caption">Hình 3: So sánh sức mạnh HFZ từ UPD và DPD</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📝</span> Tổng Kết</h2>
            <div class="summary-box">
                <div class="summary-title"><span>🎯</span> Điểm Chính</div>
                <ul class="summary-list">
                    <li>UPD mạnh vì bắt được điểm đảo chiều xu hướng - nơi trend tăng kết thúc</li>
                    <li>Smart Money đã bán tại Phase 2, còn nhiều lệnh bán chưa khớp</li>
                    <li>Retail bị bẫy ở đỉnh, tạo thêm áp lực bán khi cắt lỗ</li>
                    <li>HFZ từ UPD mạnh hơn DPD vì đây là khởi đầu xu hướng giảm mới</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-header">
                <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>
                <p class="quiz-subtitle">Chọn đáp án để nhận phản hồi ngay lập tức</p>
            </div>
            <div class="quiz-question" data-question="1" data-correct="C">
                <div class="question-number">1</div>
                <div class="question-text">Tại sao HFZ từ UPD có áp lực bán mạnh khi giá retest?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A"><span class="option-marker">A</span><span class="option-text">Vì zone rộng hơn</span></div>
                    <div class="quiz-option" data-option="B"><span class="option-marker">B</span><span class="option-text">Vì xuất hiện nhiều hơn</span></div>
                    <div class="quiz-option" data-option="C"><span class="option-marker">C</span><span class="option-text">Vì còn nhiều lệnh bán chưa khớp và Retail bị bẫy</span></div>
                    <div class="quiz-option" data-option="D"><span class="option-marker">D</span><span class="option-text">Vì volume thấp</span></div>
                </div>
                <div class="question-feedback"><div class="feedback-title"></div><div class="feedback-text"></div></div>
            </div>
            <div class="quiz-question" data-question="2" data-correct="B">
                <div class="question-number">2</div>
                <div class="question-text">UPD xuất hiện ở vị trí nào trong xu hướng?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A"><span class="option-marker">A</span><span class="option-text">Giữa xu hướng giảm</span></div>
                    <div class="quiz-option" data-option="B"><span class="option-marker">B</span><span class="option-text">Tại đỉnh xu hướng tăng</span></div>
                    <div class="quiz-option" data-option="C"><span class="option-marker">C</span><span class="option-text">Tại đáy xu hướng giảm</span></div>
                    <div class="quiz-option" data-option="D"><span class="option-marker">D</span><span class="option-text">Giữa xu hướng tăng</span></div>
                </div>
                <div class="question-feedback"><div class="feedback-title"></div><div class="feedback-text"></div></div>
            </div>
            <div class="quiz-result"><div class="result-score">0/2</div><div class="result-text">Hoàn thành!</div><div class="result-message"></div></div>
            <div class="quiz-buttons"><button class="quiz-btn" id="retakeQuiz" style="display: none;">Làm Lại</button></div>
        </section>
    </div>

    <script>
        document.addEventListener(''DOMContentLoaded'', function() {
            const questions = document.querySelectorAll(''.quiz-question'');
            const retakeBtn = document.getElementById(''retakeQuiz'');
            const resultDiv = document.querySelector(''.quiz-result'');
            let answeredCount = 0, correctCount = 0;
            const totalQuestions = 2;
            const explanations = {
                1: { correct: ''✓ Chính xác! HFZ từ UPD mạnh vì còn nhiều lệnh bán chưa khớp và Retail bị bẫy ở đỉnh.'', incorrect: ''✗ Sai! Lý do chính là còn nhiều lệnh bán chưa khớp và Retail bị bẫy tại đỉnh.'' },
                2: { correct: ''✓ Chính xác! UPD xuất hiện tại đỉnh xu hướng tăng - điểm đảo chiều.'', incorrect: ''✗ Sai! UPD là pattern đảo chiều, xuất hiện tại ĐỈNH xu hướng tăng.'' }
            };
            questions.forEach(q => {
                const opts = q.querySelectorAll(''.quiz-option'');
                opts.forEach(o => {
                    o.addEventListener(''click'', function() {
                        if (q.classList.contains(''answered'')) return;
                        q.classList.add(''answered''); answeredCount++;
                        const sel = this.dataset.option, corr = q.dataset.correct, isCor = sel === corr;
                        opts.forEach(op => op.classList.add(''disabled''));
                        if (isCor) { this.classList.add(''correct''); correctCount++; q.querySelector(''.question-feedback'').classList.add(''correct''); }
                        else { this.classList.add(''incorrect''); q.querySelector(''.question-feedback'').classList.add(''incorrect''); opts.forEach(op => { if(op.dataset.option === corr) op.classList.add(''correct''); }); }
                        q.querySelector(''.feedback-title'').textContent = isCor ? ''✓ Chính xác!'' : ''✗ Sai rồi!'';
                        q.querySelector(''.feedback-text'').textContent = explanations[q.dataset.question][isCor ? ''correct'' : ''incorrect''];
                        q.querySelector(''.question-feedback'').classList.add(''show'');
                        if (answeredCount === totalQuestions) {
                            resultDiv.querySelector(''.result-score'').textContent = `${correctCount}/${totalQuestions}`;
                            resultDiv.querySelector(''.result-message'').textContent = correctCount === totalQuestions ? ''🎉 Xuất sắc!'' : ''📚 Ôn lại bài nhé!'';
                            resultDiv.classList.add(''show''); retakeBtn.style.display = ''inline-block'';
                        }
                    });
                });
            });
            retakeBtn.addEventListener(''click'', function() {
                answeredCount = 0; correctCount = 0;
                questions.forEach(q => { q.classList.remove(''answered''); q.querySelectorAll(''.quiz-option'').forEach(o => o.classList.remove(''correct'', ''incorrect'', ''disabled'')); q.querySelector(''.question-feedback'').classList.remove(''show'', ''correct'', ''incorrect''); });
                resultDiv.classList.remove(''show''); retakeBtn.style.display = ''none'';
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

-- Lesson 4.4: Chiến Lược Entry Cho UPD
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch4-l4',
  'module-tier-1-ch4',
  'course-tier1-trading-foundation',
  'Bài 4.4: Chiến Lược Entry Cho UPD',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 4.4: Chiến Lược Entry Cho UPD | GEM Trading Academy</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root { --navy: #112250; --navy-dark: #0a1628; --gold: #FFBD59; --gold-dark: #E5A73D; --cyan: #00F0FF; --purple: #6A5BFF; --burgundy: #9C0612; --burgundy-light: #C41E2A; --success: #00C853; --error: #FF5252; --bg-primary: #0a1628; --bg-card: rgba(17, 34, 80, 0.6); --text-primary: #FFFFFF; --text-secondary: rgba(255, 255, 255, 0.85); --text-muted: rgba(255, 255, 255, 0.6); --glass-bg: rgba(17, 34, 80, 0.4); --glass-border: rgba(255, 189, 89, 0.2); --space-xs: 4px; --space-sm: 8px; --space-md: 16px; --space-lg: 24px; --space-xl: 32px; --radius-md: 12px; --radius-lg: 16px; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: ''Montserrat'', sans-serif; background: var(--bg-primary); color: var(--text-primary); line-height: 1.6; }
        img { max-width: 100%; height: auto; display: block; }
        .background-container { position: fixed; inset: 0; z-index: -1; }
        .bg-layer-base { position: absolute; inset: 0; background: linear-gradient(180deg, var(--navy-dark) 0%, var(--navy) 50%, var(--navy-dark) 100%); }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3; }
        .orb-1 { width: 400px; height: 400px; background: var(--gold); top: -100px; right: -100px; }
        .orb-2 { width: 300px; height: 300px; background: var(--cyan); bottom: 20%; left: -100px; }
        .orb-3 { width: 250px; height: 250px; background: var(--burgundy); bottom: -50px; right: 20%; }
        .lesson-container { max-width: 800px; margin: 0 auto; padding: 1.5rem; }
        @media (max-width: 600px) { .lesson-container { padding: 0; } }
        .lesson-header { text-align: center; padding: var(--space-xl); margin-bottom: var(--space-xl); background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); }
        @media (max-width: 600px) { .lesson-header { padding: var(--space-lg) 16px; margin-bottom: 0; border: none; border-radius: 0; border-bottom: 8px solid var(--bg-primary); } }
        .lesson-badge { display: inline-flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); background: linear-gradient(135deg, var(--burgundy), var(--burgundy-light)); border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: var(--space-md); }
        .lesson-chapter { font-size: 0.9rem; color: var(--gold); font-weight: 600; margin-bottom: var(--space-sm); text-transform: uppercase; letter-spacing: 2px; }
        .lesson-title { font-size: clamp(1.75rem, 5vw, 2.5rem); font-weight: 800; margin-bottom: var(--space-md); background: linear-gradient(135deg, var(--text-primary), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lesson-meta { display: flex; justify-content: center; gap: var(--space-lg); flex-wrap: wrap; color: var(--text-muted); font-size: 0.85rem; }
        .meta-item { display: flex; align-items: center; gap: var(--space-xs); }
        .section { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: var(--space-xl); margin-bottom: var(--space-lg); }
        @media (max-width: 600px) { .section { padding: 0; margin-bottom: 0; border: none; border-radius: 0; border-bottom: 8px solid var(--bg-primary); } }
        .section-title { font-size: 1.5rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
        @media (max-width: 600px) { .section-title { padding: var(--space-lg) 16px var(--space-md) 16px; margin-bottom: 0; } }
        .section > p { color: var(--text-secondary); margin-bottom: var(--space-md); }
        @media (max-width: 600px) { .section > p { padding: 0 16px; } }
        .highlight-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15), rgba(255, 189, 89, 0.05)); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .highlight-box { border: none; border-radius: 0; border-left: 4px solid var(--gold); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .highlight-box-title { font-weight: 700; color: var(--gold); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }
        .highlight-box p { color: var(--text-secondary); margin: 0; }
        .image-container { margin: var(--space-xl) 0; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--glass-border); }
        @media (max-width: 600px) { .image-container { margin: var(--space-md) 0; border-radius: 0; border: none; } }
        .image-caption { padding: var(--space-sm); font-size: 0.85rem; color: var(--text-muted); font-style: italic; text-align: center; }
        @media (max-width: 600px) { .image-caption { padding: var(--space-sm) 16px; } }
        .flow-steps { display: flex; flex-direction: column; gap: var(--space-md); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .flow-steps { gap: 1px; background: var(--glass-border); margin: var(--space-md) 0; } }
        .flow-step { display: flex; gap: var(--space-md); align-items: flex-start; padding: var(--space-md); background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); }
        @media (max-width: 600px) { .flow-step { padding: var(--space-md) 16px; border: none; border-radius: 0; border-left: 4px solid var(--gold); } }
        .flow-step-number { width: 40px; height: 40px; min-width: 40px; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; color: var(--navy-dark); }
        .flow-step-content { flex: 1; }
        .flow-step-title { font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-xs); }
        .flow-step-desc { font-size: 0.9rem; color: var(--text-muted); }
        .patterns-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-md); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .patterns-grid { gap: 1px; background: var(--glass-border); margin: var(--space-md) 0; } }
        .pattern-card { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); text-align: center; }
        @media (max-width: 600px) { .pattern-card { border: none; border-radius: 0; padding: var(--space-md); } }
        .pattern-icon { font-size: 2.5rem; margin-bottom: var(--space-sm); }
        .pattern-name { font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-xs); }
        .pattern-desc { font-size: 0.85rem; color: var(--text-muted); }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .stats-grid { gap: 1px; background: var(--glass-border); margin: var(--space-md) 0; } }
        .stat-card { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); text-align: center; }
        @media (max-width: 600px) { .stat-card { border: none; border-radius: 0; padding: var(--space-md); } }
        .stat-value { font-size: 1.75rem; font-weight: 800; background: linear-gradient(135deg, var(--gold), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        @media (max-width: 600px) { .stat-value { font-size: 1.25rem; } }
        .stat-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }
        .example-box { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); overflow: hidden; margin: var(--space-xl) 0; }
        @media (max-width: 600px) { .example-box { border: none; border-radius: 0; margin: var(--space-md) 0; } }
        .example-header { background: linear-gradient(135deg, var(--burgundy), var(--burgundy-light)); padding: var(--space-md) var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); font-weight: 700; }
        @media (max-width: 600px) { .example-header { padding: var(--space-md) 16px; } }
        .example-content { padding: var(--space-lg); }
        @media (max-width: 600px) { .example-content { padding: var(--space-md) 16px; } }
        .example-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-md); }
        @media (max-width: 600px) { .example-grid { grid-template-columns: 1fr; gap: var(--space-sm); } }
        .example-detail-label { font-size: 0.8rem; color: var(--text-muted); }
        .example-detail-value { font-weight: 700; }
        .example-detail-value.entry { color: var(--burgundy-light); }
        .example-detail-value.stop { color: var(--error); }
        .example-detail-value.target { color: var(--success); }
        .summary-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.02)); border: 2px solid var(--gold); border-radius: var(--radius-lg); padding: var(--space-xl); margin: var(--space-xl) 0; }
        @media (max-width: 600px) { .summary-box { border: none; border-radius: 0; border-left: 4px solid var(--gold); padding: var(--space-lg) 16px; margin: var(--space-md) 0; } }
        .summary-title { font-size: 1.25rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
        .summary-list { list-style: none; }
        .summary-list li { display: flex; align-items: flex-start; gap: var(--space-sm); margin-bottom: var(--space-md); color: var(--text-secondary); }
        .summary-list li::before { content: "✓"; color: var(--gold); font-weight: 700; }
        .quiz-section { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: var(--space-xl); margin-top: var(--space-xl); }
        @media (max-width: 600px) { .quiz-section { border: none; border-radius: 0; padding: 0; margin-top: 0; border-top: 8px solid var(--bg-primary); } }
        .quiz-header { text-align: center; margin-bottom: var(--space-xl); }
        @media (max-width: 600px) { .quiz-header { padding: var(--space-lg) 16px var(--space-md); margin-bottom: 0; } }
        .quiz-title { font-size: 1.5rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-sm); }
        .quiz-subtitle { color: var(--text-muted); font-size: 0.9rem; }
        .quiz-question { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); margin-bottom: var(--space-lg); }
        @media (max-width: 600px) { .quiz-question { border: none; border-radius: 0; border-left: 4px solid var(--purple); padding: var(--space-md) 16px; margin-bottom: 0; border-bottom: 1px solid var(--glass-border); } }
        .question-number { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); border-radius: 50%; font-weight: 700; color: var(--navy-dark); margin-bottom: var(--space-md); }
        .question-text { font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-lg); line-height: 1.6; }
        .quiz-options { display: flex; flex-direction: column; gap: var(--space-sm); }
        @media (max-width: 600px) { .quiz-options { gap: 1px; background: var(--glass-border); margin-left: calc(-16px - 4px); margin-right: -16px; } }
        .quiz-option { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md); background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: var(--radius-md); cursor: pointer; transition: all 0.3s ease; }
        @media (max-width: 600px) { .quiz-option { border: none; border-radius: 0; border-left: 4px solid transparent; padding: var(--space-md) 16px; } }
        .quiz-option:hover:not(.disabled) { border-color: var(--gold); }
        .quiz-option.correct { border-color: var(--success) !important; background: rgba(0, 200, 83, 0.15) !important; }
        @media (max-width: 600px) { .quiz-option.correct { border-left-color: var(--success) !important; } }
        .quiz-option.incorrect { border-color: var(--error) !important; background: rgba(255, 82, 82, 0.15) !important; }
        @media (max-width: 600px) { .quiz-option.incorrect { border-left-color: var(--error) !important; } }
        .quiz-option.disabled { opacity: 0.7; cursor: not-allowed; }
        .option-marker { width: 28px; height: 28px; min-width: 28px; background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; }
        .quiz-option.correct .option-marker { background: var(--success); border-color: var(--success); color: white; }
        .quiz-option.incorrect .option-marker { background: var(--error); border-color: var(--error); color: white; }
        .option-text { flex: 1; color: var(--text-secondary); }
        .question-feedback { margin-top: var(--space-md); padding: var(--space-md); border-radius: var(--space-sm); display: none; }
        .question-feedback.show { display: block; }
        .question-feedback.correct { background: rgba(0, 200, 83, 0.15); border-left: 4px solid var(--success); }
        .question-feedback.incorrect { background: rgba(255, 82, 82, 0.15); border-left: 4px solid var(--error); }
        .feedback-title { font-weight: 700; margin-bottom: var(--space-xs); }
        .question-feedback.correct .feedback-title { color: var(--success); }
        .question-feedback.incorrect .feedback-title { color: var(--error); }
        .feedback-text { font-size: 0.9rem; color: var(--text-secondary); }
        .quiz-result { text-align: center; padding: var(--space-xl); display: none; }
        .quiz-result.show { display: block; }
        .result-score { font-size: 3rem; font-weight: 800; background: linear-gradient(135deg, var(--gold), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: var(--space-md); }
        .quiz-buttons { display: flex; justify-content: center; padding: var(--space-lg); }
        @media (max-width: 600px) { .quiz-buttons { padding: var(--space-lg) 16px; } }
        .quiz-btn { padding: var(--space-md) var(--space-xl); border-radius: var(--radius-md); font-weight: 700; cursor: pointer; border: none; font-family: inherit; background: var(--glass-bg); color: var(--text-primary); border: 2px solid var(--glass-border); }
        .quiz-btn:hover { border-color: var(--gold); }
    </style>
</head>
<body>
    <div class="background-container"><div class="bg-layer-base"></div><div class="orb orb-1"></div><div class="orb orb-2"></div><div class="orb orb-3"></div></div>

    <div class="lesson-container">
        <header class="lesson-header">
            <div class="lesson-badge"><span>📉</span><span>Reversal Pattern</span></div>
            <div class="lesson-chapter">Chapter 4 - UPD Pattern</div>
            <h1 class="lesson-title">Chiến Lược Entry Cho UPD</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 4.4</span></div>
                <div class="meta-item"><span>⏱️</span><span>8 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>3 câu quiz</span></div>
            </div>
        </header>

        <section class="section">
            <h2 class="section-title"><span>🎯</span> Mục Tiêu Bài Học</h2>
            <p>Sau khi hoàn thành bài học này, bạn sẽ nắm vững chiến lược entry hoàn chỉnh cho pattern UPD - cách vào lệnh SHORT chính xác.</p>
            <div class="highlight-box">
                <div class="highlight-box-title"><span>💡</span> Nguyên Tắc Vàng</div>
                <p><strong>KHÔNG entry khi giá phá vỡ (breakdown).</strong> Luôn đợi giá quay lại kiểm tra vùng HFZ để có điểm SHORT tối ưu.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📋</span> Quy Trình Entry 5 Bước</h2>
            <p>Chiến lược entry cho UPD tuân theo quy trình 5 bước nghiêm ngặt:</p>
            <div class="flow-steps">
                <div class="flow-step">
                    <div class="flow-step-number">1</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Nhận Diện UPD Pattern</div>
                        <div class="flow-step-desc">Xác nhận 3 phases: UP → PAUSE → DOWN. Vùng PAUSE tạo thành HFZ.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">2</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Đợi Giá Retest HFZ</div>
                        <div class="flow-step-desc">Sau Phase 3, giá thường quay lại kiểm tra vùng HFZ trước khi tiếp tục giảm.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">3</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Đợi Nến Xác Nhận Bearish</div>
                        <div class="flow-step-desc">Khi giá chạm HFZ, đợi xuất hiện nến xác nhận bearish như Pin Bar, Shooting Star, Bearish Engulfing.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">4</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Vào Lệnh SHORT</div>
                        <div class="flow-step-desc">Entry SHORT ngay sau khi nến xác nhận đóng cửa hoàn chỉnh.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">5</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Đặt Stop Loss & Target</div>
                        <div class="flow-step-desc">SL trên HFZ + 0.5%, Target tối thiểu về đáy Phase 3 hoặc 1:2 R:R.</div>
                    </div>
                </div>
            </div>
            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/FF5252?text=UPD+Entry+Flow+5+Steps" alt="Entry Flow">
            </div>
            <div class="image-caption">Hình 1: Sơ đồ quy trình entry 5 bước cho UPD</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>🕯️</span> Các Nến Xác Nhận Bearish</h2>
            <p>Khi giá chạm vùng HFZ, cần đợi một trong các mẫu nến bearish sau:</p>
            <div class="patterns-grid">
                <div class="pattern-card">
                    <div class="pattern-icon">📍</div>
                    <div class="pattern-name">Bearish Pin Bar</div>
                    <div class="pattern-desc">Râu trên dài ≥2x thân nến</div>
                </div>
                <div class="pattern-card">
                    <div class="pattern-icon">⭐</div>
                    <div class="pattern-name">Shooting Star</div>
                    <div class="pattern-desc">Thân nhỏ ở dưới, râu trên dài</div>
                </div>
                <div class="pattern-card">
                    <div class="pattern-icon">🔴</div>
                    <div class="pattern-name">Bearish Engulfing</div>
                    <div class="pattern-desc">Nến đỏ nuốt hoàn toàn nến xanh</div>
                </div>
                <div class="pattern-card">
                    <div class="pattern-icon">🌙</div>
                    <div class="pattern-name">Evening Star</div>
                    <div class="pattern-desc">3 nến đảo chiều giảm</div>
                </div>
            </div>
            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/FFBD59?text=Bearish+Confirmation+Candles" alt="Bearish Candles">
            </div>
            <div class="image-caption">Hình 2: Các mẫu nến xác nhận bearish phổ biến</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📊</span> Entry, SL & TP</h2>
            <p>Thiết lập vị thế chính xác là chìa khóa quản lý rủi ro hiệu quả:</p>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">1:2</div>
                    <div class="stat-label">Tối Thiểu R:R</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">0.5%</div>
                    <div class="stat-label">Buffer SL</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">65%</div>
                    <div class="stat-label">Win Rate</div>
                </div>
            </div>
            <div class="example-box">
                <div class="example-header"><span>📉</span><span>Ví Dụ: BTC/USDT H4</span></div>
                <div class="example-content">
                    <div class="example-grid">
                        <div class="example-detail">
                            <div class="example-detail-label">Entry SHORT</div>
                            <div class="example-detail-value entry">$67,200</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Stop Loss</div>
                            <div class="example-detail-value stop">$68,036</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Target 1 (1:1)</div>
                            <div class="example-detail-value target">$66,364</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Target 2 (1:2)</div>
                            <div class="example-detail-value target">$65,528</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/00F0FF?text=BTC+UPD+Entry+Example" alt="BTC Entry Example">
            </div>
            <div class="image-caption">Hình 3: Ví dụ thực tế entry UPD trên BTC/USDT H4</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📝</span> Tổng Kết</h2>
            <div class="summary-box">
                <div class="summary-title"><span>🎯</span> Điểm Chính</div>
                <ul class="summary-list">
                    <li>Quy trình 5 bước: Nhận diện → Retest → Xác Nhận → Entry → Target</li>
                    <li>4 mẫu nến bearish: Pin Bar, Shooting Star, Bearish Engulfing, Evening Star</li>
                    <li>Entry SHORT sau nến xác nhận đóng cửa, SL trên HFZ + 0.5%</li>
                    <li>Target tối thiểu về đáy Phase 3 hoặc 1:2 R:R</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-header">
                <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>
                <p class="quiz-subtitle">Chọn đáp án để nhận phản hồi ngay lập tức</p>
            </div>
            <div class="quiz-question" data-question="1" data-correct="B">
                <div class="question-number">1</div>
                <div class="question-text">Khi nào là thời điểm đúng để vào lệnh SHORT với UPD?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A"><span class="option-marker">A</span><span class="option-text">Ngay khi giá chạm HFZ</span></div>
                    <div class="quiz-option" data-option="B"><span class="option-marker">B</span><span class="option-text">Sau khi nến xác nhận bearish đóng cửa</span></div>
                    <div class="quiz-option" data-option="C"><span class="option-marker">C</span><span class="option-text">Khi giá phá vỡ đáy Phase 3</span></div>
                    <div class="quiz-option" data-option="D"><span class="option-marker">D</span><span class="option-text">Ngay sau Phase 2 kết thúc</span></div>
                </div>
                <div class="question-feedback"><div class="feedback-title"></div><div class="feedback-text"></div></div>
            </div>
            <div class="quiz-question" data-question="2" data-correct="C">
                <div class="question-number">2</div>
                <div class="question-text">Stop Loss cho lệnh SHORT từ UPD nên đặt ở đâu?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A"><span class="option-marker">A</span><span class="option-text">Ngay tại đỉnh HFZ</span></div>
                    <div class="quiz-option" data-option="B"><span class="option-marker">B</span><span class="option-text">Dưới đáy HFZ</span></div>
                    <div class="quiz-option" data-option="C"><span class="option-marker">C</span><span class="option-text">Trên đỉnh HFZ + 0.5% buffer</span></div>
                    <div class="quiz-option" data-option="D"><span class="option-marker">D</span><span class="option-text">Tại đỉnh Phase 1</span></div>
                </div>
                <div class="question-feedback"><div class="feedback-title"></div><div class="feedback-text"></div></div>
            </div>
            <div class="quiz-question" data-question="3" data-correct="D">
                <div class="question-number">3</div>
                <div class="question-text">Nến nào KHÔNG phải bearish confirmation?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A"><span class="option-marker">A</span><span class="option-text">Shooting Star</span></div>
                    <div class="quiz-option" data-option="B"><span class="option-marker">B</span><span class="option-text">Bearish Engulfing</span></div>
                    <div class="quiz-option" data-option="C"><span class="option-marker">C</span><span class="option-text">Evening Star</span></div>
                    <div class="quiz-option" data-option="D"><span class="option-marker">D</span><span class="option-text">Hammer</span></div>
                </div>
                <div class="question-feedback"><div class="feedback-title"></div><div class="feedback-text"></div></div>
            </div>
            <div class="quiz-result"><div class="result-score">0/3</div><div class="result-text">Hoàn thành!</div><div class="result-message"></div></div>
            <div class="quiz-buttons"><button class="quiz-btn" id="retakeQuiz" style="display: none;">Làm Lại</button></div>
        </section>
    </div>

    <script>
        document.addEventListener(''DOMContentLoaded'', function() {
            const questions = document.querySelectorAll(''.quiz-question'');
            const retakeBtn = document.getElementById(''retakeQuiz'');
            const resultDiv = document.querySelector(''.quiz-result'');
            let answeredCount = 0, correctCount = 0;
            const totalQuestions = 3;
            const explanations = {
                1: { correct: ''✓ Chính xác! Luôn đợi nến xác nhận bearish đóng cửa hoàn chỉnh trước khi vào lệnh SHORT.'', incorrect: ''✗ Sai! Cần đợi nến xác nhận bearish đóng cửa, không entry sớm khi giá mới chạm HFZ.'' },
                2: { correct: ''✓ Chính xác! SL đặt trên đỉnh HFZ + 0.5% buffer để tránh bị quét bởi biến động nhỏ.'', incorrect: ''✗ Sai! SL cần đặt TRÊN đỉnh HFZ + 0.5% buffer cho lệnh SHORT.'' },
                3: { correct: ''✓ Chính xác! Hammer là nến bullish (râu dưới dài), dùng cho LFZ, không phải bearish.'', incorrect: ''✗ Sai! Hammer là nến đảo chiều bullish, không phải bearish confirmation.'' }
            };
            questions.forEach(q => {
                const opts = q.querySelectorAll(''.quiz-option'');
                opts.forEach(o => {
                    o.addEventListener(''click'', function() {
                        if (q.classList.contains(''answered'')) return;
                        q.classList.add(''answered''); answeredCount++;
                        const sel = this.dataset.option, corr = q.dataset.correct, isCor = sel === corr;
                        opts.forEach(op => op.classList.add(''disabled''));
                        if (isCor) { this.classList.add(''correct''); correctCount++; q.querySelector(''.question-feedback'').classList.add(''correct''); }
                        else { this.classList.add(''incorrect''); q.querySelector(''.question-feedback'').classList.add(''incorrect''); opts.forEach(op => { if(op.dataset.option === corr) op.classList.add(''correct''); }); }
                        q.querySelector(''.feedback-title'').textContent = isCor ? ''✓ Chính xác!'' : ''✗ Sai rồi!'';
                        q.querySelector(''.feedback-text'').textContent = explanations[q.dataset.question][isCor ? ''correct'' : ''incorrect''];
                        q.querySelector(''.question-feedback'').classList.add(''show'');
                        if (answeredCount === totalQuestions) {
                            resultDiv.querySelector(''.result-score'').textContent = `${correctCount}/${totalQuestions}`;
                            resultDiv.querySelector(''.result-message'').textContent = correctCount === totalQuestions ? ''🎉 Xuất sắc!'' : correctCount >= 2 ? ''👍 Tốt lắm!'' : ''📚 Xem lại bài nhé!'';
                            resultDiv.classList.add(''show''); retakeBtn.style.display = ''inline-block'';
                        }
                    });
                });
            });
            retakeBtn.addEventListener(''click'', function() {
                answeredCount = 0; correctCount = 0;
                questions.forEach(q => { q.classList.remove(''answered''); q.querySelectorAll(''.quiz-option'').forEach(o => o.classList.remove(''correct'', ''incorrect'', ''disabled'')); q.querySelector(''.question-feedback'').classList.remove(''show'', ''correct'', ''incorrect''); });
                resultDiv.classList.remove(''show''); retakeBtn.style.display = ''none'';
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
    <title>Bài 4.4: Chiến Lược Entry Cho UPD | GEM Trading Academy</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root { --navy: #112250; --navy-dark: #0a1628; --gold: #FFBD59; --gold-dark: #E5A73D; --cyan: #00F0FF; --purple: #6A5BFF; --burgundy: #9C0612; --burgundy-light: #C41E2A; --success: #00C853; --error: #FF5252; --bg-primary: #0a1628; --bg-card: rgba(17, 34, 80, 0.6); --text-primary: #FFFFFF; --text-secondary: rgba(255, 255, 255, 0.85); --text-muted: rgba(255, 255, 255, 0.6); --glass-bg: rgba(17, 34, 80, 0.4); --glass-border: rgba(255, 189, 89, 0.2); --space-xs: 4px; --space-sm: 8px; --space-md: 16px; --space-lg: 24px; --space-xl: 32px; --radius-md: 12px; --radius-lg: 16px; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: ''Montserrat'', sans-serif; background: var(--bg-primary); color: var(--text-primary); line-height: 1.6; }
        img { max-width: 100%; height: auto; display: block; }
        .background-container { position: fixed; inset: 0; z-index: -1; }
        .bg-layer-base { position: absolute; inset: 0; background: linear-gradient(180deg, var(--navy-dark) 0%, var(--navy) 50%, var(--navy-dark) 100%); }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3; }
        .orb-1 { width: 400px; height: 400px; background: var(--gold); top: -100px; right: -100px; }
        .orb-2 { width: 300px; height: 300px; background: var(--cyan); bottom: 20%; left: -100px; }
        .orb-3 { width: 250px; height: 250px; background: var(--burgundy); bottom: -50px; right: 20%; }
        .lesson-container { max-width: 800px; margin: 0 auto; padding: 1.5rem; }
        @media (max-width: 600px) { .lesson-container { padding: 0; } }
        .lesson-header { text-align: center; padding: var(--space-xl); margin-bottom: var(--space-xl); background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); }
        @media (max-width: 600px) { .lesson-header { padding: var(--space-lg) 16px; margin-bottom: 0; border: none; border-radius: 0; border-bottom: 8px solid var(--bg-primary); } }
        .lesson-badge { display: inline-flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); background: linear-gradient(135deg, var(--burgundy), var(--burgundy-light)); border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: var(--space-md); }
        .lesson-chapter { font-size: 0.9rem; color: var(--gold); font-weight: 600; margin-bottom: var(--space-sm); text-transform: uppercase; letter-spacing: 2px; }
        .lesson-title { font-size: clamp(1.75rem, 5vw, 2.5rem); font-weight: 800; margin-bottom: var(--space-md); background: linear-gradient(135deg, var(--text-primary), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lesson-meta { display: flex; justify-content: center; gap: var(--space-lg); flex-wrap: wrap; color: var(--text-muted); font-size: 0.85rem; }
        .meta-item { display: flex; align-items: center; gap: var(--space-xs); }
        .section { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: var(--space-xl); margin-bottom: var(--space-lg); }
        @media (max-width: 600px) { .section { padding: 0; margin-bottom: 0; border: none; border-radius: 0; border-bottom: 8px solid var(--bg-primary); } }
        .section-title { font-size: 1.5rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
        @media (max-width: 600px) { .section-title { padding: var(--space-lg) 16px var(--space-md) 16px; margin-bottom: 0; } }
        .section > p { color: var(--text-secondary); margin-bottom: var(--space-md); }
        @media (max-width: 600px) { .section > p { padding: 0 16px; } }
        .highlight-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15), rgba(255, 189, 89, 0.05)); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .highlight-box { border: none; border-radius: 0; border-left: 4px solid var(--gold); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .highlight-box-title { font-weight: 700; color: var(--gold); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }
        .highlight-box p { color: var(--text-secondary); margin: 0; }
        .image-container { margin: var(--space-xl) 0; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--glass-border); }
        @media (max-width: 600px) { .image-container { margin: var(--space-md) 0; border-radius: 0; border: none; } }
        .image-caption { padding: var(--space-sm); font-size: 0.85rem; color: var(--text-muted); font-style: italic; text-align: center; }
        @media (max-width: 600px) { .image-caption { padding: var(--space-sm) 16px; } }
        .flow-steps { display: flex; flex-direction: column; gap: var(--space-md); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .flow-steps { gap: 1px; background: var(--glass-border); margin: var(--space-md) 0; } }
        .flow-step { display: flex; gap: var(--space-md); align-items: flex-start; padding: var(--space-md); background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); }
        @media (max-width: 600px) { .flow-step { padding: var(--space-md) 16px; border: none; border-radius: 0; border-left: 4px solid var(--gold); } }
        .flow-step-number { width: 40px; height: 40px; min-width: 40px; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; color: var(--navy-dark); }
        .flow-step-content { flex: 1; }
        .flow-step-title { font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-xs); }
        .flow-step-desc { font-size: 0.9rem; color: var(--text-muted); }
        .patterns-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-md); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .patterns-grid { gap: 1px; background: var(--glass-border); margin: var(--space-md) 0; } }
        .pattern-card { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); text-align: center; }
        @media (max-width: 600px) { .pattern-card { border: none; border-radius: 0; padding: var(--space-md); } }
        .pattern-icon { font-size: 2.5rem; margin-bottom: var(--space-sm); }
        .pattern-name { font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-xs); }
        .pattern-desc { font-size: 0.85rem; color: var(--text-muted); }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .stats-grid { gap: 1px; background: var(--glass-border); margin: var(--space-md) 0; } }
        .stat-card { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); text-align: center; }
        @media (max-width: 600px) { .stat-card { border: none; border-radius: 0; padding: var(--space-md); } }
        .stat-value { font-size: 1.75rem; font-weight: 800; background: linear-gradient(135deg, var(--gold), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        @media (max-width: 600px) { .stat-value { font-size: 1.25rem; } }
        .stat-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }
        .example-box { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); overflow: hidden; margin: var(--space-xl) 0; }
        @media (max-width: 600px) { .example-box { border: none; border-radius: 0; margin: var(--space-md) 0; } }
        .example-header { background: linear-gradient(135deg, var(--burgundy), var(--burgundy-light)); padding: var(--space-md) var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); font-weight: 700; }
        @media (max-width: 600px) { .example-header { padding: var(--space-md) 16px; } }
        .example-content { padding: var(--space-lg); }
        @media (max-width: 600px) { .example-content { padding: var(--space-md) 16px; } }
        .example-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-md); }
        @media (max-width: 600px) { .example-grid { grid-template-columns: 1fr; gap: var(--space-sm); } }
        .example-detail-label { font-size: 0.8rem; color: var(--text-muted); }
        .example-detail-value { font-weight: 700; }
        .example-detail-value.entry { color: var(--burgundy-light); }
        .example-detail-value.stop { color: var(--error); }
        .example-detail-value.target { color: var(--success); }
        .summary-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.02)); border: 2px solid var(--gold); border-radius: var(--radius-lg); padding: var(--space-xl); margin: var(--space-xl) 0; }
        @media (max-width: 600px) { .summary-box { border: none; border-radius: 0; border-left: 4px solid var(--gold); padding: var(--space-lg) 16px; margin: var(--space-md) 0; } }
        .summary-title { font-size: 1.25rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
        .summary-list { list-style: none; }
        .summary-list li { display: flex; align-items: flex-start; gap: var(--space-sm); margin-bottom: var(--space-md); color: var(--text-secondary); }
        .summary-list li::before { content: "✓"; color: var(--gold); font-weight: 700; }
        .quiz-section { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: var(--space-xl); margin-top: var(--space-xl); }
        @media (max-width: 600px) { .quiz-section { border: none; border-radius: 0; padding: 0; margin-top: 0; border-top: 8px solid var(--bg-primary); } }
        .quiz-header { text-align: center; margin-bottom: var(--space-xl); }
        @media (max-width: 600px) { .quiz-header { padding: var(--space-lg) 16px var(--space-md); margin-bottom: 0; } }
        .quiz-title { font-size: 1.5rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-sm); }
        .quiz-subtitle { color: var(--text-muted); font-size: 0.9rem; }
        .quiz-question { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); margin-bottom: var(--space-lg); }
        @media (max-width: 600px) { .quiz-question { border: none; border-radius: 0; border-left: 4px solid var(--purple); padding: var(--space-md) 16px; margin-bottom: 0; border-bottom: 1px solid var(--glass-border); } }
        .question-number { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); border-radius: 50%; font-weight: 700; color: var(--navy-dark); margin-bottom: var(--space-md); }
        .question-text { font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-lg); line-height: 1.6; }
        .quiz-options { display: flex; flex-direction: column; gap: var(--space-sm); }
        @media (max-width: 600px) { .quiz-options { gap: 1px; background: var(--glass-border); margin-left: calc(-16px - 4px); margin-right: -16px; } }
        .quiz-option { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md); background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: var(--radius-md); cursor: pointer; transition: all 0.3s ease; }
        @media (max-width: 600px) { .quiz-option { border: none; border-radius: 0; border-left: 4px solid transparent; padding: var(--space-md) 16px; } }
        .quiz-option:hover:not(.disabled) { border-color: var(--gold); }
        .quiz-option.correct { border-color: var(--success) !important; background: rgba(0, 200, 83, 0.15) !important; }
        @media (max-width: 600px) { .quiz-option.correct { border-left-color: var(--success) !important; } }
        .quiz-option.incorrect { border-color: var(--error) !important; background: rgba(255, 82, 82, 0.15) !important; }
        @media (max-width: 600px) { .quiz-option.incorrect { border-left-color: var(--error) !important; } }
        .quiz-option.disabled { opacity: 0.7; cursor: not-allowed; }
        .option-marker { width: 28px; height: 28px; min-width: 28px; background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; }
        .quiz-option.correct .option-marker { background: var(--success); border-color: var(--success); color: white; }
        .quiz-option.incorrect .option-marker { background: var(--error); border-color: var(--error); color: white; }
        .option-text { flex: 1; color: var(--text-secondary); }
        .question-feedback { margin-top: var(--space-md); padding: var(--space-md); border-radius: var(--space-sm); display: none; }
        .question-feedback.show { display: block; }
        .question-feedback.correct { background: rgba(0, 200, 83, 0.15); border-left: 4px solid var(--success); }
        .question-feedback.incorrect { background: rgba(255, 82, 82, 0.15); border-left: 4px solid var(--error); }
        .feedback-title { font-weight: 700; margin-bottom: var(--space-xs); }
        .question-feedback.correct .feedback-title { color: var(--success); }
        .question-feedback.incorrect .feedback-title { color: var(--error); }
        .feedback-text { font-size: 0.9rem; color: var(--text-secondary); }
        .quiz-result { text-align: center; padding: var(--space-xl); display: none; }
        .quiz-result.show { display: block; }
        .result-score { font-size: 3rem; font-weight: 800; background: linear-gradient(135deg, var(--gold), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: var(--space-md); }
        .quiz-buttons { display: flex; justify-content: center; padding: var(--space-lg); }
        @media (max-width: 600px) { .quiz-buttons { padding: var(--space-lg) 16px; } }
        .quiz-btn { padding: var(--space-md) var(--space-xl); border-radius: var(--radius-md); font-weight: 700; cursor: pointer; border: none; font-family: inherit; background: var(--glass-bg); color: var(--text-primary); border: 2px solid var(--glass-border); }
        .quiz-btn:hover { border-color: var(--gold); }
    </style>
</head>
<body>
    <div class="background-container"><div class="bg-layer-base"></div><div class="orb orb-1"></div><div class="orb orb-2"></div><div class="orb orb-3"></div></div>

    <div class="lesson-container">
        <header class="lesson-header">
            <div class="lesson-badge"><span>📉</span><span>Reversal Pattern</span></div>
            <div class="lesson-chapter">Chapter 4 - UPD Pattern</div>
            <h1 class="lesson-title">Chiến Lược Entry Cho UPD</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 4.4</span></div>
                <div class="meta-item"><span>⏱️</span><span>8 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>3 câu quiz</span></div>
            </div>
        </header>

        <section class="section">
            <h2 class="section-title"><span>🎯</span> Mục Tiêu Bài Học</h2>
            <p>Sau khi hoàn thành bài học này, bạn sẽ nắm vững chiến lược entry hoàn chỉnh cho pattern UPD - cách vào lệnh SHORT chính xác.</p>
            <div class="highlight-box">
                <div class="highlight-box-title"><span>💡</span> Nguyên Tắc Vàng</div>
                <p><strong>KHÔNG entry khi giá phá vỡ (breakdown).</strong> Luôn đợi giá quay lại kiểm tra vùng HFZ để có điểm SHORT tối ưu.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📋</span> Quy Trình Entry 5 Bước</h2>
            <p>Chiến lược entry cho UPD tuân theo quy trình 5 bước nghiêm ngặt:</p>
            <div class="flow-steps">
                <div class="flow-step">
                    <div class="flow-step-number">1</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Nhận Diện UPD Pattern</div>
                        <div class="flow-step-desc">Xác nhận 3 phases: UP → PAUSE → DOWN. Vùng PAUSE tạo thành HFZ.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">2</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Đợi Giá Retest HFZ</div>
                        <div class="flow-step-desc">Sau Phase 3, giá thường quay lại kiểm tra vùng HFZ trước khi tiếp tục giảm.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">3</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Đợi Nến Xác Nhận Bearish</div>
                        <div class="flow-step-desc">Khi giá chạm HFZ, đợi xuất hiện nến xác nhận bearish như Pin Bar, Shooting Star, Bearish Engulfing.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">4</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Vào Lệnh SHORT</div>
                        <div class="flow-step-desc">Entry SHORT ngay sau khi nến xác nhận đóng cửa hoàn chỉnh.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">5</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Đặt Stop Loss & Target</div>
                        <div class="flow-step-desc">SL trên HFZ + 0.5%, Target tối thiểu về đáy Phase 3 hoặc 1:2 R:R.</div>
                    </div>
                </div>
            </div>
            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/FF5252?text=UPD+Entry+Flow+5+Steps" alt="Entry Flow">
            </div>
            <div class="image-caption">Hình 1: Sơ đồ quy trình entry 5 bước cho UPD</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>🕯️</span> Các Nến Xác Nhận Bearish</h2>
            <p>Khi giá chạm vùng HFZ, cần đợi một trong các mẫu nến bearish sau:</p>
            <div class="patterns-grid">
                <div class="pattern-card">
                    <div class="pattern-icon">📍</div>
                    <div class="pattern-name">Bearish Pin Bar</div>
                    <div class="pattern-desc">Râu trên dài ≥2x thân nến</div>
                </div>
                <div class="pattern-card">
                    <div class="pattern-icon">⭐</div>
                    <div class="pattern-name">Shooting Star</div>
                    <div class="pattern-desc">Thân nhỏ ở dưới, râu trên dài</div>
                </div>
                <div class="pattern-card">
                    <div class="pattern-icon">🔴</div>
                    <div class="pattern-name">Bearish Engulfing</div>
                    <div class="pattern-desc">Nến đỏ nuốt hoàn toàn nến xanh</div>
                </div>
                <div class="pattern-card">
                    <div class="pattern-icon">🌙</div>
                    <div class="pattern-name">Evening Star</div>
                    <div class="pattern-desc">3 nến đảo chiều giảm</div>
                </div>
            </div>
            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/FFBD59?text=Bearish+Confirmation+Candles" alt="Bearish Candles">
            </div>
            <div class="image-caption">Hình 2: Các mẫu nến xác nhận bearish phổ biến</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📊</span> Entry, SL & TP</h2>
            <p>Thiết lập vị thế chính xác là chìa khóa quản lý rủi ro hiệu quả:</p>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">1:2</div>
                    <div class="stat-label">Tối Thiểu R:R</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">0.5%</div>
                    <div class="stat-label">Buffer SL</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">65%</div>
                    <div class="stat-label">Win Rate</div>
                </div>
            </div>
            <div class="example-box">
                <div class="example-header"><span>📉</span><span>Ví Dụ: BTC/USDT H4</span></div>
                <div class="example-content">
                    <div class="example-grid">
                        <div class="example-detail">
                            <div class="example-detail-label">Entry SHORT</div>
                            <div class="example-detail-value entry">$67,200</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Stop Loss</div>
                            <div class="example-detail-value stop">$68,036</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Target 1 (1:1)</div>
                            <div class="example-detail-value target">$66,364</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Target 2 (1:2)</div>
                            <div class="example-detail-value target">$65,528</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/00F0FF?text=BTC+UPD+Entry+Example" alt="BTC Entry Example">
            </div>
            <div class="image-caption">Hình 3: Ví dụ thực tế entry UPD trên BTC/USDT H4</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📝</span> Tổng Kết</h2>
            <div class="summary-box">
                <div class="summary-title"><span>🎯</span> Điểm Chính</div>
                <ul class="summary-list">
                    <li>Quy trình 5 bước: Nhận diện → Retest → Xác Nhận → Entry → Target</li>
                    <li>4 mẫu nến bearish: Pin Bar, Shooting Star, Bearish Engulfing, Evening Star</li>
                    <li>Entry SHORT sau nến xác nhận đóng cửa, SL trên HFZ + 0.5%</li>
                    <li>Target tối thiểu về đáy Phase 3 hoặc 1:2 R:R</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-header">
                <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>
                <p class="quiz-subtitle">Chọn đáp án để nhận phản hồi ngay lập tức</p>
            </div>
            <div class="quiz-question" data-question="1" data-correct="B">
                <div class="question-number">1</div>
                <div class="question-text">Khi nào là thời điểm đúng để vào lệnh SHORT với UPD?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A"><span class="option-marker">A</span><span class="option-text">Ngay khi giá chạm HFZ</span></div>
                    <div class="quiz-option" data-option="B"><span class="option-marker">B</span><span class="option-text">Sau khi nến xác nhận bearish đóng cửa</span></div>
                    <div class="quiz-option" data-option="C"><span class="option-marker">C</span><span class="option-text">Khi giá phá vỡ đáy Phase 3</span></div>
                    <div class="quiz-option" data-option="D"><span class="option-marker">D</span><span class="option-text">Ngay sau Phase 2 kết thúc</span></div>
                </div>
                <div class="question-feedback"><div class="feedback-title"></div><div class="feedback-text"></div></div>
            </div>
            <div class="quiz-question" data-question="2" data-correct="C">
                <div class="question-number">2</div>
                <div class="question-text">Stop Loss cho lệnh SHORT từ UPD nên đặt ở đâu?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A"><span class="option-marker">A</span><span class="option-text">Ngay tại đỉnh HFZ</span></div>
                    <div class="quiz-option" data-option="B"><span class="option-marker">B</span><span class="option-text">Dưới đáy HFZ</span></div>
                    <div class="quiz-option" data-option="C"><span class="option-marker">C</span><span class="option-text">Trên đỉnh HFZ + 0.5% buffer</span></div>
                    <div class="quiz-option" data-option="D"><span class="option-marker">D</span><span class="option-text">Tại đỉnh Phase 1</span></div>
                </div>
                <div class="question-feedback"><div class="feedback-title"></div><div class="feedback-text"></div></div>
            </div>
            <div class="quiz-question" data-question="3" data-correct="D">
                <div class="question-number">3</div>
                <div class="question-text">Nến nào KHÔNG phải bearish confirmation?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A"><span class="option-marker">A</span><span class="option-text">Shooting Star</span></div>
                    <div class="quiz-option" data-option="B"><span class="option-marker">B</span><span class="option-text">Bearish Engulfing</span></div>
                    <div class="quiz-option" data-option="C"><span class="option-marker">C</span><span class="option-text">Evening Star</span></div>
                    <div class="quiz-option" data-option="D"><span class="option-marker">D</span><span class="option-text">Hammer</span></div>
                </div>
                <div class="question-feedback"><div class="feedback-title"></div><div class="feedback-text"></div></div>
            </div>
            <div class="quiz-result"><div class="result-score">0/3</div><div class="result-text">Hoàn thành!</div><div class="result-message"></div></div>
            <div class="quiz-buttons"><button class="quiz-btn" id="retakeQuiz" style="display: none;">Làm Lại</button></div>
        </section>
    </div>

    <script>
        document.addEventListener(''DOMContentLoaded'', function() {
            const questions = document.querySelectorAll(''.quiz-question'');
            const retakeBtn = document.getElementById(''retakeQuiz'');
            const resultDiv = document.querySelector(''.quiz-result'');
            let answeredCount = 0, correctCount = 0;
            const totalQuestions = 3;
            const explanations = {
                1: { correct: ''✓ Chính xác! Luôn đợi nến xác nhận bearish đóng cửa hoàn chỉnh trước khi vào lệnh SHORT.'', incorrect: ''✗ Sai! Cần đợi nến xác nhận bearish đóng cửa, không entry sớm khi giá mới chạm HFZ.'' },
                2: { correct: ''✓ Chính xác! SL đặt trên đỉnh HFZ + 0.5% buffer để tránh bị quét bởi biến động nhỏ.'', incorrect: ''✗ Sai! SL cần đặt TRÊN đỉnh HFZ + 0.5% buffer cho lệnh SHORT.'' },
                3: { correct: ''✓ Chính xác! Hammer là nến bullish (râu dưới dài), dùng cho LFZ, không phải bearish.'', incorrect: ''✗ Sai! Hammer là nến đảo chiều bullish, không phải bearish confirmation.'' }
            };
            questions.forEach(q => {
                const opts = q.querySelectorAll(''.quiz-option'');
                opts.forEach(o => {
                    o.addEventListener(''click'', function() {
                        if (q.classList.contains(''answered'')) return;
                        q.classList.add(''answered''); answeredCount++;
                        const sel = this.dataset.option, corr = q.dataset.correct, isCor = sel === corr;
                        opts.forEach(op => op.classList.add(''disabled''));
                        if (isCor) { this.classList.add(''correct''); correctCount++; q.querySelector(''.question-feedback'').classList.add(''correct''); }
                        else { this.classList.add(''incorrect''); q.querySelector(''.question-feedback'').classList.add(''incorrect''); opts.forEach(op => { if(op.dataset.option === corr) op.classList.add(''correct''); }); }
                        q.querySelector(''.feedback-title'').textContent = isCor ? ''✓ Chính xác!'' : ''✗ Sai rồi!'';
                        q.querySelector(''.feedback-text'').textContent = explanations[q.dataset.question][isCor ? ''correct'' : ''incorrect''];
                        q.querySelector(''.question-feedback'').classList.add(''show'');
                        if (answeredCount === totalQuestions) {
                            resultDiv.querySelector(''.result-score'').textContent = `${correctCount}/${totalQuestions}`;
                            resultDiv.querySelector(''.result-message'').textContent = correctCount === totalQuestions ? ''🎉 Xuất sắc!'' : correctCount >= 2 ? ''👍 Tốt lắm!'' : ''📚 Xem lại bài nhé!'';
                            resultDiv.classList.add(''show''); retakeBtn.style.display = ''inline-block'';
                        }
                    });
                });
            });
            retakeBtn.addEventListener(''click'', function() {
                answeredCount = 0; correctCount = 0;
                questions.forEach(q => { q.classList.remove(''answered''); q.querySelectorAll(''.quiz-option'').forEach(o => o.classList.remove(''correct'', ''incorrect'', ''disabled'')); q.querySelector(''.question-feedback'').classList.remove(''show'', ''correct'', ''incorrect''); });
                resultDiv.classList.remove(''show''); retakeBtn.style.display = ''none'';
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

-- Lesson 4.5: Phân Biệt UPD và DPD
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch4-l5',
  'module-tier-1-ch4',
  'course-tier1-trading-foundation',
  'Bài 4.5: Phân Biệt UPD và DPD',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 4.5: Phân Biệt UPD và DPD | GEM Trading Academy</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root { --navy: #112250; --navy-dark: #0a1628; --gold: #FFBD59; --gold-dark: #E5A73D; --cyan: #00F0FF; --purple: #6A5BFF; --burgundy: #9C0612; --burgundy-light: #C41E2A; --success: #00C853; --error: #FF5252; --bg-primary: #0a1628; --bg-card: rgba(17, 34, 80, 0.6); --text-primary: #FFFFFF; --text-secondary: rgba(255, 255, 255, 0.85); --text-muted: rgba(255, 255, 255, 0.6); --glass-bg: rgba(17, 34, 80, 0.4); --glass-border: rgba(255, 189, 89, 0.2); --space-xs: 4px; --space-sm: 8px; --space-md: 16px; --space-lg: 24px; --space-xl: 32px; --radius-md: 12px; --radius-lg: 16px; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: ''Montserrat'', sans-serif; background: var(--bg-primary); color: var(--text-primary); line-height: 1.6; }
        img { max-width: 100%; height: auto; display: block; }
        .background-container { position: fixed; inset: 0; z-index: -1; }
        .bg-layer-base { position: absolute; inset: 0; background: linear-gradient(180deg, var(--navy-dark) 0%, var(--navy) 50%, var(--navy-dark) 100%); }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3; }
        .orb-1 { width: 400px; height: 400px; background: var(--gold); top: -100px; right: -100px; }
        .orb-2 { width: 300px; height: 300px; background: var(--cyan); bottom: 20%; left: -100px; }
        .orb-3 { width: 250px; height: 250px; background: var(--burgundy); bottom: -50px; right: 20%; }
        .lesson-container { max-width: 800px; margin: 0 auto; padding: 1.5rem; }
        @media (max-width: 600px) { .lesson-container { padding: 0; } }
        .lesson-header { text-align: center; padding: var(--space-xl); margin-bottom: var(--space-xl); background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); }
        @media (max-width: 600px) { .lesson-header { padding: var(--space-lg) 16px; margin-bottom: 0; border: none; border-radius: 0; border-bottom: 8px solid var(--bg-primary); } }
        .lesson-badge { display: inline-flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); background: linear-gradient(135deg, var(--burgundy), var(--burgundy-light)); border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: var(--space-md); }
        .lesson-chapter { font-size: 0.9rem; color: var(--gold); font-weight: 600; margin-bottom: var(--space-sm); text-transform: uppercase; letter-spacing: 2px; }
        .lesson-title { font-size: clamp(1.75rem, 5vw, 2.5rem); font-weight: 800; margin-bottom: var(--space-md); background: linear-gradient(135deg, var(--text-primary), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lesson-meta { display: flex; justify-content: center; gap: var(--space-lg); flex-wrap: wrap; color: var(--text-muted); font-size: 0.85rem; }
        .meta-item { display: flex; align-items: center; gap: var(--space-xs); }
        .section { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: var(--space-xl); margin-bottom: var(--space-lg); }
        @media (max-width: 600px) { .section { padding: 0; margin-bottom: 0; border: none; border-radius: 0; border-bottom: 8px solid var(--bg-primary); } }
        .section-title { font-size: 1.5rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
        @media (max-width: 600px) { .section-title { padding: var(--space-lg) 16px var(--space-md) 16px; margin-bottom: 0; } }
        .section > p { color: var(--text-secondary); margin-bottom: var(--space-md); }
        @media (max-width: 600px) { .section > p { padding: 0 16px; } }
        .highlight-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15), rgba(255, 189, 89, 0.05)); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .highlight-box { border: none; border-radius: 0; border-left: 4px solid var(--gold); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .highlight-box-title { font-weight: 700; color: var(--gold); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }
        .highlight-box p { color: var(--text-secondary); margin: 0; }
        .definition-box { background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.02)); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .definition-box { border: none; border-radius: 0; border-left: 4px solid var(--cyan); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .definition-box-title { font-weight: 700; color: var(--cyan); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }
        .warning-box { background: linear-gradient(135deg, rgba(156, 6, 18, 0.2), rgba(156, 6, 18, 0.05)); border: 1px solid rgba(156, 6, 18, 0.4); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .warning-box { border: none; border-radius: 0; border-left: 4px solid var(--burgundy); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .warning-box-title { font-weight: 700; color: var(--burgundy-light); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }
        .image-container { margin: var(--space-xl) 0; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--glass-border); }
        @media (max-width: 600px) { .image-container { margin: var(--space-md) 0; border-radius: 0; border: none; } }
        .image-caption { padding: var(--space-sm); font-size: 0.85rem; color: var(--text-muted); font-style: italic; text-align: center; }
        @media (max-width: 600px) { .image-caption { padding: var(--space-sm) 16px; } }
        .patterns-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-md); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .patterns-grid { gap: 1px; background: var(--glass-border); margin: var(--space-md) 0; } }
        .pattern-card { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); text-align: center; }
        @media (max-width: 600px) { .pattern-card { border: none; border-radius: 0; padding: var(--space-md); } }
        .pattern-icon { font-size: 2.5rem; margin-bottom: var(--space-sm); }
        .pattern-name { font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-xs); }
        .pattern-desc { font-size: 0.85rem; color: var(--text-muted); }
        .summary-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.02)); border: 2px solid var(--gold); border-radius: var(--radius-lg); padding: var(--space-xl); margin: var(--space-xl) 0; }
        @media (max-width: 600px) { .summary-box { border: none; border-radius: 0; border-left: 4px solid var(--gold); padding: var(--space-lg) 16px; margin: var(--space-md) 0; } }
        .summary-title { font-size: 1.25rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
        .summary-list { list-style: none; }
        .summary-list li { display: flex; align-items: flex-start; gap: var(--space-sm); margin-bottom: var(--space-md); color: var(--text-secondary); }
        .summary-list li::before { content: "✓"; color: var(--gold); font-weight: 700; }
        .quiz-section { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: var(--space-xl); margin-top: var(--space-xl); }
        @media (max-width: 600px) { .quiz-section { border: none; border-radius: 0; padding: 0; margin-top: 0; border-top: 8px solid var(--bg-primary); } }
        .quiz-header { text-align: center; margin-bottom: var(--space-xl); }
        @media (max-width: 600px) { .quiz-header { padding: var(--space-lg) 16px var(--space-md); margin-bottom: 0; } }
        .quiz-title { font-size: 1.5rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-sm); }
        .quiz-subtitle { color: var(--text-muted); font-size: 0.9rem; }
        .quiz-question { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); margin-bottom: var(--space-lg); }
        @media (max-width: 600px) { .quiz-question { border: none; border-radius: 0; border-left: 4px solid var(--purple); padding: var(--space-md) 16px; margin-bottom: 0; border-bottom: 1px solid var(--glass-border); } }
        .question-number { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); border-radius: 50%; font-weight: 700; color: var(--navy-dark); margin-bottom: var(--space-md); }
        .question-text { font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-lg); line-height: 1.6; }
        .quiz-options { display: flex; flex-direction: column; gap: var(--space-sm); }
        @media (max-width: 600px) { .quiz-options { gap: 1px; background: var(--glass-border); margin-left: calc(-16px - 4px); margin-right: -16px; } }
        .quiz-option { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md); background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: var(--radius-md); cursor: pointer; }
        @media (max-width: 600px) { .quiz-option { border: none; border-radius: 0; border-left: 4px solid transparent; padding: var(--space-md) 16px; } }
        .quiz-option:hover:not(.disabled) { border-color: var(--gold); }
        .quiz-option.correct { border-color: var(--success) !important; background: rgba(0, 200, 83, 0.15) !important; }
        @media (max-width: 600px) { .quiz-option.correct { border-left-color: var(--success) !important; } }
        .quiz-option.incorrect { border-color: var(--error) !important; background: rgba(255, 82, 82, 0.15) !important; }
        @media (max-width: 600px) { .quiz-option.incorrect { border-left-color: var(--error) !important; } }
        .quiz-option.disabled { opacity: 0.7; cursor: not-allowed; }
        .option-marker { width: 28px; height: 28px; min-width: 28px; background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; }
        .quiz-option.correct .option-marker { background: var(--success); border-color: var(--success); color: white; }
        .quiz-option.incorrect .option-marker { background: var(--error); border-color: var(--error); color: white; }
        .option-text { flex: 1; color: var(--text-secondary); }
        .question-feedback { margin-top: var(--space-md); padding: var(--space-md); border-radius: var(--space-sm); display: none; }
        .question-feedback.show { display: block; }
        .question-feedback.correct { background: rgba(0, 200, 83, 0.15); border-left: 4px solid var(--success); }
        .question-feedback.incorrect { background: rgba(255, 82, 82, 0.15); border-left: 4px solid var(--error); }
        .feedback-title { font-weight: 700; margin-bottom: var(--space-xs); }
        .question-feedback.correct .feedback-title { color: var(--success); }
        .question-feedback.incorrect .feedback-title { color: var(--error); }
        .feedback-text { font-size: 0.9rem; color: var(--text-secondary); }
        .quiz-result { text-align: center; padding: var(--space-xl); display: none; }
        .quiz-result.show { display: block; }
        .result-score { font-size: 3rem; font-weight: 800; background: linear-gradient(135deg, var(--gold), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: var(--space-md); }
        .quiz-buttons { display: flex; justify-content: center; padding: var(--space-lg); }
        @media (max-width: 600px) { .quiz-buttons { padding: var(--space-lg) 16px; } }
        .quiz-btn { padding: var(--space-md) var(--space-xl); border-radius: var(--radius-md); font-weight: 700; cursor: pointer; border: none; font-family: inherit; background: var(--glass-bg); color: var(--text-primary); border: 2px solid var(--glass-border); }
        .quiz-btn:hover { border-color: var(--gold); }
    </style>
</head>
<body>
    <div class="background-container"><div class="bg-layer-base"></div><div class="orb orb-1"></div><div class="orb orb-2"></div><div class="orb orb-3"></div></div>

    <div class="lesson-container">
        <header class="lesson-header">
            <div class="lesson-badge"><span>📉</span><span>Reversal Pattern</span></div>
            <div class="lesson-chapter">Chapter 4 - UPD Pattern</div>
            <h1 class="lesson-title">Phân Biệt UPD và DPD</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 4.5</span></div>
                <div class="meta-item"><span>⏱️</span><span>6 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <section class="section">
            <h2 class="section-title"><span>🎯</span> Mục Tiêu Bài Học</h2>
            <p>Trong bài học này, bạn sẽ học cách phân biệt UPD và DPD - hai pattern đều tạo ra HFZ nhưng có tính chất và cách sử dụng khác nhau.</p>
            <div class="highlight-box">
                <div class="highlight-box-title"><span>💡</span> Sự Khác Biệt Cốt Lõi</div>
                <p><strong>UPD = Đảo chiều</strong> (kết thúc xu hướng tăng) | <strong>DPD = Tiếp diễn</strong> (trong xu hướng giảm). Hiểu đúng bối cảnh sẽ giúp bạn chọn đúng pattern để giao dịch.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>🆚</span> So Sánh Trực Quan</h2>
            <p>Dưới đây là bảng so sánh chi tiết giữa UPD và DPD:</p>
            <div class="patterns-grid">
                <div class="pattern-card">
                    <div class="pattern-icon">🔄</div>
                    <div class="pattern-name">UPD (Reversal)</div>
                    <div class="pattern-desc">Up → Pause → Down<br>Đảo chiều xu hướng giảm<br>Xuất hiện tại ĐỈNH</div>
                </div>
                <div class="pattern-card">
                    <div class="pattern-icon">📉</div>
                    <div class="pattern-name">DPD (Continuation)</div>
                    <div class="pattern-desc">Down → Pause → Down<br>Tiếp diễn xu hướng giảm<br>Xuất hiện TRONG trend giảm</div>
                </div>
            </div>
            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/FFBD59?text=UPD+vs+DPD+Visual+Comparison" alt="UPD vs DPD">
            </div>
            <div class="image-caption">Hình 1: So sánh trực quan UPD (trái) và DPD (phải)</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📊</span> Khi Nào Dùng UPD?</h2>
            <p>Sử dụng UPD khi bạn muốn bắt điểm đảo chiều xu hướng:</p>
            <div class="definition-box">
                <div class="definition-box-title"><span>⭐</span> Bối Cảnh Phù Hợp Cho UPD</div>
                <p>• Xu hướng tăng đã kéo dài<br>• Giá đang ở vùng cao lịch sử hoặc kháng cự mạnh<br>• Xuất hiện dấu hiệu kiệt sức (volume giảm dù giá tăng)<br>• Sentiment thị trường quá lạc quan, FOMO cao</p>
            </div>
            <div class="highlight-box">
                <div class="highlight-box-title"><span>💡</span> Ưu Điểm UPD</div>
                <p>Bắt được điểm đảo chiều = Entry tại đỉnh xu hướng = Lợi nhuận tiềm năng lớn hơn. Tuy nhiên, cần xác nhận kỹ hơn vì đang đi ngược trend.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📊</span> Khi Nào Dùng DPD?</h2>
            <p>Sử dụng DPD khi bạn muốn theo trend giảm đang diễn ra:</p>
            <div class="definition-box">
                <div class="definition-box-title"><span>📉</span> Bối Cảnh Phù Hợp Cho DPD</div>
                <p>• Xu hướng giảm đã xác định rõ ràng<br>• Giá đang trong giai đoạn pullback (nghỉ) sau đợt giảm<br>• Không có dấu hiệu đảo chiều tăng<br>• Sentiment thị trường vẫn bearish</p>
            </div>
            <div class="warning-box">
                <div class="warning-box-title"><span>⚠️</span> Lưu Ý Với DPD</div>
                <p>Xu hướng giảm càng kéo dài, DPD càng yếu dần. Sau 3-4 DPD liên tiếp, hãy cảnh giác vì trend có thể sắp đảo chiều.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>🎯</span> Cách Nhận Biết Bối Cảnh</h2>
            <p>Để chọn đúng pattern, hãy tự hỏi những câu hỏi sau:</p>
            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/00F0FF?text=Context+Analysis+Flowchart" alt="Context Analysis">
            </div>
            <div class="image-caption">Hình 2: Sơ đồ phân tích bối cảnh để chọn đúng pattern</div>
            <div class="highlight-box">
                <div class="highlight-box-title"><span>❓</span> Câu Hỏi Phân Tích</div>
                <p>1. Xu hướng trước đó là gì? (Tăng → UPD, Giảm → DPD)<br>2. Giá đang ở vùng nào? (Đỉnh → UPD, Trong trend → DPD)<br>3. Phase 1 của pattern là gì? (UP → UPD, DOWN → DPD)</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📝</span> Tổng Kết</h2>
            <div class="summary-box">
                <div class="summary-title"><span>🎯</span> Điểm Chính</div>
                <ul class="summary-list">
                    <li>UPD là pattern ĐẢO CHIỀU - dùng để kết thúc xu hướng tăng</li>
                    <li>DPD là pattern TIẾP DIỄN - dùng trong xu hướng giảm đang diễn ra</li>
                    <li>Phân tích bối cảnh trước khi chọn pattern để giao dịch</li>
                    <li>UPD mạnh hơn DPD nhưng cần xác nhận kỹ hơn</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-header">
                <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>
                <p class="quiz-subtitle">Chọn đáp án để nhận phản hồi ngay lập tức</p>
            </div>
            <div class="quiz-question" data-question="1" data-correct="A">
                <div class="question-number">1</div>
                <div class="question-text">Khi xu hướng tăng đã kéo dài và bạn thấy pattern có cấu trúc UP → PAUSE → DOWN, đây là pattern gì?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A"><span class="option-marker">A</span><span class="option-text">UPD - Pattern đảo chiều</span></div>
                    <div class="quiz-option" data-option="B"><span class="option-marker">B</span><span class="option-text">DPD - Pattern tiếp diễn</span></div>
                    <div class="quiz-option" data-option="C"><span class="option-marker">C</span><span class="option-text">UPU - Pattern tăng</span></div>
                    <div class="quiz-option" data-option="D"><span class="option-marker">D</span><span class="option-text">DPU - Pattern đảo chiều tăng</span></div>
                </div>
                <div class="question-feedback"><div class="feedback-title"></div><div class="feedback-text"></div></div>
            </div>
            <div class="quiz-question" data-question="2" data-correct="C">
                <div class="question-number">2</div>
                <div class="question-text">DPD nên được sử dụng trong bối cảnh nào?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A"><span class="option-marker">A</span><span class="option-text">Khi xu hướng tăng sắp kết thúc</span></div>
                    <div class="quiz-option" data-option="B"><span class="option-marker">B</span><span class="option-text">Khi giá đang ở đỉnh lịch sử</span></div>
                    <div class="quiz-option" data-option="C"><span class="option-marker">C</span><span class="option-text">Trong xu hướng giảm đang diễn ra</span></div>
                    <div class="quiz-option" data-option="D"><span class="option-marker">D</span><span class="option-text">Khi muốn bắt đáy</span></div>
                </div>
                <div class="question-feedback"><div class="feedback-title"></div><div class="feedback-text"></div></div>
            </div>
            <div class="quiz-result"><div class="result-score">0/2</div><div class="result-text">Hoàn thành!</div><div class="result-message"></div></div>
            <div class="quiz-buttons"><button class="quiz-btn" id="retakeQuiz" style="display: none;">Làm Lại</button></div>
        </section>
    </div>

    <script>
        document.addEventListener(''DOMContentLoaded'', function() {
            const questions = document.querySelectorAll(''.quiz-question'');
            const retakeBtn = document.getElementById(''retakeQuiz'');
            const resultDiv = document.querySelector(''.quiz-result'');
            let answeredCount = 0, correctCount = 0;
            const totalQuestions = 2;
            const explanations = {
                1: { correct: ''✓ Chính xác! UP → PAUSE → DOWN là cấu trúc của UPD - pattern đảo chiều xu hướng giảm.'', incorrect: ''✗ Sai! UP → PAUSE → DOWN là UPD. DPD có cấu trúc DOWN → PAUSE → DOWN.'' },
                2: { correct: ''✓ Chính xác! DPD là pattern tiếp diễn, dùng trong xu hướng giảm đang diễn ra.'', incorrect: ''✗ Sai! DPD là pattern tiếp diễn xu hướng giảm, chỉ nên dùng khi trend giảm đã xác định.'' }
            };
            questions.forEach(q => {
                const opts = q.querySelectorAll(''.quiz-option'');
                opts.forEach(o => {
                    o.addEventListener(''click'', function() {
                        if (q.classList.contains(''answered'')) return;
                        q.classList.add(''answered''); answeredCount++;
                        const sel = this.dataset.option, corr = q.dataset.correct, isCor = sel === corr;
                        opts.forEach(op => op.classList.add(''disabled''));
                        if (isCor) { this.classList.add(''correct''); correctCount++; q.querySelector(''.question-feedback'').classList.add(''correct''); }
                        else { this.classList.add(''incorrect''); q.querySelector(''.question-feedback'').classList.add(''incorrect''); opts.forEach(op => { if(op.dataset.option === corr) op.classList.add(''correct''); }); }
                        q.querySelector(''.feedback-title'').textContent = isCor ? ''✓ Chính xác!'' : ''✗ Sai rồi!'';
                        q.querySelector(''.feedback-text'').textContent = explanations[q.dataset.question][isCor ? ''correct'' : ''incorrect''];
                        q.querySelector(''.question-feedback'').classList.add(''show'');
                        if (answeredCount === totalQuestions) {
                            resultDiv.querySelector(''.result-score'').textContent = `${correctCount}/${totalQuestions}`;
                            resultDiv.querySelector(''.result-message'').textContent = correctCount === totalQuestions ? ''🎉 Xuất sắc!'' : ''📚 Ôn lại bài nhé!'';
                            resultDiv.classList.add(''show''); retakeBtn.style.display = ''inline-block'';
                        }
                    });
                });
            });
            retakeBtn.addEventListener(''click'', function() {
                answeredCount = 0; correctCount = 0;
                questions.forEach(q => { q.classList.remove(''answered''); q.querySelectorAll(''.quiz-option'').forEach(o => o.classList.remove(''correct'', ''incorrect'', ''disabled'')); q.querySelector(''.question-feedback'').classList.remove(''show'', ''correct'', ''incorrect''); });
                resultDiv.classList.remove(''show''); retakeBtn.style.display = ''none'';
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
    <title>Bài 4.5: Phân Biệt UPD và DPD | GEM Trading Academy</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root { --navy: #112250; --navy-dark: #0a1628; --gold: #FFBD59; --gold-dark: #E5A73D; --cyan: #00F0FF; --purple: #6A5BFF; --burgundy: #9C0612; --burgundy-light: #C41E2A; --success: #00C853; --error: #FF5252; --bg-primary: #0a1628; --bg-card: rgba(17, 34, 80, 0.6); --text-primary: #FFFFFF; --text-secondary: rgba(255, 255, 255, 0.85); --text-muted: rgba(255, 255, 255, 0.6); --glass-bg: rgba(17, 34, 80, 0.4); --glass-border: rgba(255, 189, 89, 0.2); --space-xs: 4px; --space-sm: 8px; --space-md: 16px; --space-lg: 24px; --space-xl: 32px; --radius-md: 12px; --radius-lg: 16px; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: ''Montserrat'', sans-serif; background: var(--bg-primary); color: var(--text-primary); line-height: 1.6; }
        img { max-width: 100%; height: auto; display: block; }
        .background-container { position: fixed; inset: 0; z-index: -1; }
        .bg-layer-base { position: absolute; inset: 0; background: linear-gradient(180deg, var(--navy-dark) 0%, var(--navy) 50%, var(--navy-dark) 100%); }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3; }
        .orb-1 { width: 400px; height: 400px; background: var(--gold); top: -100px; right: -100px; }
        .orb-2 { width: 300px; height: 300px; background: var(--cyan); bottom: 20%; left: -100px; }
        .orb-3 { width: 250px; height: 250px; background: var(--burgundy); bottom: -50px; right: 20%; }
        .lesson-container { max-width: 800px; margin: 0 auto; padding: 1.5rem; }
        @media (max-width: 600px) { .lesson-container { padding: 0; } }
        .lesson-header { text-align: center; padding: var(--space-xl); margin-bottom: var(--space-xl); background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); }
        @media (max-width: 600px) { .lesson-header { padding: var(--space-lg) 16px; margin-bottom: 0; border: none; border-radius: 0; border-bottom: 8px solid var(--bg-primary); } }
        .lesson-badge { display: inline-flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); background: linear-gradient(135deg, var(--burgundy), var(--burgundy-light)); border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: var(--space-md); }
        .lesson-chapter { font-size: 0.9rem; color: var(--gold); font-weight: 600; margin-bottom: var(--space-sm); text-transform: uppercase; letter-spacing: 2px; }
        .lesson-title { font-size: clamp(1.75rem, 5vw, 2.5rem); font-weight: 800; margin-bottom: var(--space-md); background: linear-gradient(135deg, var(--text-primary), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lesson-meta { display: flex; justify-content: center; gap: var(--space-lg); flex-wrap: wrap; color: var(--text-muted); font-size: 0.85rem; }
        .meta-item { display: flex; align-items: center; gap: var(--space-xs); }
        .section { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: var(--space-xl); margin-bottom: var(--space-lg); }
        @media (max-width: 600px) { .section { padding: 0; margin-bottom: 0; border: none; border-radius: 0; border-bottom: 8px solid var(--bg-primary); } }
        .section-title { font-size: 1.5rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
        @media (max-width: 600px) { .section-title { padding: var(--space-lg) 16px var(--space-md) 16px; margin-bottom: 0; } }
        .section > p { color: var(--text-secondary); margin-bottom: var(--space-md); }
        @media (max-width: 600px) { .section > p { padding: 0 16px; } }
        .highlight-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.15), rgba(255, 189, 89, 0.05)); border: 1px solid rgba(255, 189, 89, 0.3); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .highlight-box { border: none; border-radius: 0; border-left: 4px solid var(--gold); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .highlight-box-title { font-weight: 700; color: var(--gold); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }
        .highlight-box p { color: var(--text-secondary); margin: 0; }
        .definition-box { background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.02)); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .definition-box { border: none; border-radius: 0; border-left: 4px solid var(--cyan); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .definition-box-title { font-weight: 700; color: var(--cyan); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }
        .warning-box { background: linear-gradient(135deg, rgba(156, 6, 18, 0.2), rgba(156, 6, 18, 0.05)); border: 1px solid rgba(156, 6, 18, 0.4); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .warning-box { border: none; border-radius: 0; border-left: 4px solid var(--burgundy); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .warning-box-title { font-weight: 700; color: var(--burgundy-light); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }
        .image-container { margin: var(--space-xl) 0; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--glass-border); }
        @media (max-width: 600px) { .image-container { margin: var(--space-md) 0; border-radius: 0; border: none; } }
        .image-caption { padding: var(--space-sm); font-size: 0.85rem; color: var(--text-muted); font-style: italic; text-align: center; }
        @media (max-width: 600px) { .image-caption { padding: var(--space-sm) 16px; } }
        .patterns-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-md); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .patterns-grid { gap: 1px; background: var(--glass-border); margin: var(--space-md) 0; } }
        .pattern-card { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); text-align: center; }
        @media (max-width: 600px) { .pattern-card { border: none; border-radius: 0; padding: var(--space-md); } }
        .pattern-icon { font-size: 2.5rem; margin-bottom: var(--space-sm); }
        .pattern-name { font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-xs); }
        .pattern-desc { font-size: 0.85rem; color: var(--text-muted); }
        .summary-box { background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.02)); border: 2px solid var(--gold); border-radius: var(--radius-lg); padding: var(--space-xl); margin: var(--space-xl) 0; }
        @media (max-width: 600px) { .summary-box { border: none; border-radius: 0; border-left: 4px solid var(--gold); padding: var(--space-lg) 16px; margin: var(--space-md) 0; } }
        .summary-title { font-size: 1.25rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
        .summary-list { list-style: none; }
        .summary-list li { display: flex; align-items: flex-start; gap: var(--space-sm); margin-bottom: var(--space-md); color: var(--text-secondary); }
        .summary-list li::before { content: "✓"; color: var(--gold); font-weight: 700; }
        .quiz-section { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: var(--space-xl); margin-top: var(--space-xl); }
        @media (max-width: 600px) { .quiz-section { border: none; border-radius: 0; padding: 0; margin-top: 0; border-top: 8px solid var(--bg-primary); } }
        .quiz-header { text-align: center; margin-bottom: var(--space-xl); }
        @media (max-width: 600px) { .quiz-header { padding: var(--space-lg) 16px var(--space-md); margin-bottom: 0; } }
        .quiz-title { font-size: 1.5rem; font-weight: 700; color: var(--gold); margin-bottom: var(--space-sm); }
        .quiz-subtitle { color: var(--text-muted); font-size: 0.9rem; }
        .quiz-question { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); margin-bottom: var(--space-lg); }
        @media (max-width: 600px) { .quiz-question { border: none; border-radius: 0; border-left: 4px solid var(--purple); padding: var(--space-md) 16px; margin-bottom: 0; border-bottom: 1px solid var(--glass-border); } }
        .question-number { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); border-radius: 50%; font-weight: 700; color: var(--navy-dark); margin-bottom: var(--space-md); }
        .question-text { font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-lg); line-height: 1.6; }
        .quiz-options { display: flex; flex-direction: column; gap: var(--space-sm); }
        @media (max-width: 600px) { .quiz-options { gap: 1px; background: var(--glass-border); margin-left: calc(-16px - 4px); margin-right: -16px; } }
        .quiz-option { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md); background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: var(--radius-md); cursor: pointer; }
        @media (max-width: 600px) { .quiz-option { border: none; border-radius: 0; border-left: 4px solid transparent; padding: var(--space-md) 16px; } }
        .quiz-option:hover:not(.disabled) { border-color: var(--gold); }
        .quiz-option.correct { border-color: var(--success) !important; background: rgba(0, 200, 83, 0.15) !important; }
        @media (max-width: 600px) { .quiz-option.correct { border-left-color: var(--success) !important; } }
        .quiz-option.incorrect { border-color: var(--error) !important; background: rgba(255, 82, 82, 0.15) !important; }
        @media (max-width: 600px) { .quiz-option.incorrect { border-left-color: var(--error) !important; } }
        .quiz-option.disabled { opacity: 0.7; cursor: not-allowed; }
        .option-marker { width: 28px; height: 28px; min-width: 28px; background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; }
        .quiz-option.correct .option-marker { background: var(--success); border-color: var(--success); color: white; }
        .quiz-option.incorrect .option-marker { background: var(--error); border-color: var(--error); color: white; }
        .option-text { flex: 1; color: var(--text-secondary); }
        .question-feedback { margin-top: var(--space-md); padding: var(--space-md); border-radius: var(--space-sm); display: none; }
        .question-feedback.show { display: block; }
        .question-feedback.correct { background: rgba(0, 200, 83, 0.15); border-left: 4px solid var(--success); }
        .question-feedback.incorrect { background: rgba(255, 82, 82, 0.15); border-left: 4px solid var(--error); }
        .feedback-title { font-weight: 700; margin-bottom: var(--space-xs); }
        .question-feedback.correct .feedback-title { color: var(--success); }
        .question-feedback.incorrect .feedback-title { color: var(--error); }
        .feedback-text { font-size: 0.9rem; color: var(--text-secondary); }
        .quiz-result { text-align: center; padding: var(--space-xl); display: none; }
        .quiz-result.show { display: block; }
        .result-score { font-size: 3rem; font-weight: 800; background: linear-gradient(135deg, var(--gold), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: var(--space-md); }
        .quiz-buttons { display: flex; justify-content: center; padding: var(--space-lg); }
        @media (max-width: 600px) { .quiz-buttons { padding: var(--space-lg) 16px; } }
        .quiz-btn { padding: var(--space-md) var(--space-xl); border-radius: var(--radius-md); font-weight: 700; cursor: pointer; border: none; font-family: inherit; background: var(--glass-bg); color: var(--text-primary); border: 2px solid var(--glass-border); }
        .quiz-btn:hover { border-color: var(--gold); }
    </style>
</head>
<body>
    <div class="background-container"><div class="bg-layer-base"></div><div class="orb orb-1"></div><div class="orb orb-2"></div><div class="orb orb-3"></div></div>

    <div class="lesson-container">
        <header class="lesson-header">
            <div class="lesson-badge"><span>📉</span><span>Reversal Pattern</span></div>
            <div class="lesson-chapter">Chapter 4 - UPD Pattern</div>
            <h1 class="lesson-title">Phân Biệt UPD và DPD</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 4.5</span></div>
                <div class="meta-item"><span>⏱️</span><span>6 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <section class="section">
            <h2 class="section-title"><span>🎯</span> Mục Tiêu Bài Học</h2>
            <p>Trong bài học này, bạn sẽ học cách phân biệt UPD và DPD - hai pattern đều tạo ra HFZ nhưng có tính chất và cách sử dụng khác nhau.</p>
            <div class="highlight-box">
                <div class="highlight-box-title"><span>💡</span> Sự Khác Biệt Cốt Lõi</div>
                <p><strong>UPD = Đảo chiều</strong> (kết thúc xu hướng tăng) | <strong>DPD = Tiếp diễn</strong> (trong xu hướng giảm). Hiểu đúng bối cảnh sẽ giúp bạn chọn đúng pattern để giao dịch.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>🆚</span> So Sánh Trực Quan</h2>
            <p>Dưới đây là bảng so sánh chi tiết giữa UPD và DPD:</p>
            <div class="patterns-grid">
                <div class="pattern-card">
                    <div class="pattern-icon">🔄</div>
                    <div class="pattern-name">UPD (Reversal)</div>
                    <div class="pattern-desc">Up → Pause → Down<br>Đảo chiều xu hướng giảm<br>Xuất hiện tại ĐỈNH</div>
                </div>
                <div class="pattern-card">
                    <div class="pattern-icon">📉</div>
                    <div class="pattern-name">DPD (Continuation)</div>
                    <div class="pattern-desc">Down → Pause → Down<br>Tiếp diễn xu hướng giảm<br>Xuất hiện TRONG trend giảm</div>
                </div>
            </div>
            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/FFBD59?text=UPD+vs+DPD+Visual+Comparison" alt="UPD vs DPD">
            </div>
            <div class="image-caption">Hình 1: So sánh trực quan UPD (trái) và DPD (phải)</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📊</span> Khi Nào Dùng UPD?</h2>
            <p>Sử dụng UPD khi bạn muốn bắt điểm đảo chiều xu hướng:</p>
            <div class="definition-box">
                <div class="definition-box-title"><span>⭐</span> Bối Cảnh Phù Hợp Cho UPD</div>
                <p>• Xu hướng tăng đã kéo dài<br>• Giá đang ở vùng cao lịch sử hoặc kháng cự mạnh<br>• Xuất hiện dấu hiệu kiệt sức (volume giảm dù giá tăng)<br>• Sentiment thị trường quá lạc quan, FOMO cao</p>
            </div>
            <div class="highlight-box">
                <div class="highlight-box-title"><span>💡</span> Ưu Điểm UPD</div>
                <p>Bắt được điểm đảo chiều = Entry tại đỉnh xu hướng = Lợi nhuận tiềm năng lớn hơn. Tuy nhiên, cần xác nhận kỹ hơn vì đang đi ngược trend.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📊</span> Khi Nào Dùng DPD?</h2>
            <p>Sử dụng DPD khi bạn muốn theo trend giảm đang diễn ra:</p>
            <div class="definition-box">
                <div class="definition-box-title"><span>📉</span> Bối Cảnh Phù Hợp Cho DPD</div>
                <p>• Xu hướng giảm đã xác định rõ ràng<br>• Giá đang trong giai đoạn pullback (nghỉ) sau đợt giảm<br>• Không có dấu hiệu đảo chiều tăng<br>• Sentiment thị trường vẫn bearish</p>
            </div>
            <div class="warning-box">
                <div class="warning-box-title"><span>⚠️</span> Lưu Ý Với DPD</div>
                <p>Xu hướng giảm càng kéo dài, DPD càng yếu dần. Sau 3-4 DPD liên tiếp, hãy cảnh giác vì trend có thể sắp đảo chiều.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>🎯</span> Cách Nhận Biết Bối Cảnh</h2>
            <p>Để chọn đúng pattern, hãy tự hỏi những câu hỏi sau:</p>
            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/00F0FF?text=Context+Analysis+Flowchart" alt="Context Analysis">
            </div>
            <div class="image-caption">Hình 2: Sơ đồ phân tích bối cảnh để chọn đúng pattern</div>
            <div class="highlight-box">
                <div class="highlight-box-title"><span>❓</span> Câu Hỏi Phân Tích</div>
                <p>1. Xu hướng trước đó là gì? (Tăng → UPD, Giảm → DPD)<br>2. Giá đang ở vùng nào? (Đỉnh → UPD, Trong trend → DPD)<br>3. Phase 1 của pattern là gì? (UP → UPD, DOWN → DPD)</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📝</span> Tổng Kết</h2>
            <div class="summary-box">
                <div class="summary-title"><span>🎯</span> Điểm Chính</div>
                <ul class="summary-list">
                    <li>UPD là pattern ĐẢO CHIỀU - dùng để kết thúc xu hướng tăng</li>
                    <li>DPD là pattern TIẾP DIỄN - dùng trong xu hướng giảm đang diễn ra</li>
                    <li>Phân tích bối cảnh trước khi chọn pattern để giao dịch</li>
                    <li>UPD mạnh hơn DPD nhưng cần xác nhận kỹ hơn</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-header">
                <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>
                <p class="quiz-subtitle">Chọn đáp án để nhận phản hồi ngay lập tức</p>
            </div>
            <div class="quiz-question" data-question="1" data-correct="A">
                <div class="question-number">1</div>
                <div class="question-text">Khi xu hướng tăng đã kéo dài và bạn thấy pattern có cấu trúc UP → PAUSE → DOWN, đây là pattern gì?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A"><span class="option-marker">A</span><span class="option-text">UPD - Pattern đảo chiều</span></div>
                    <div class="quiz-option" data-option="B"><span class="option-marker">B</span><span class="option-text">DPD - Pattern tiếp diễn</span></div>
                    <div class="quiz-option" data-option="C"><span class="option-marker">C</span><span class="option-text">UPU - Pattern tăng</span></div>
                    <div class="quiz-option" data-option="D"><span class="option-marker">D</span><span class="option-text">DPU - Pattern đảo chiều tăng</span></div>
                </div>
                <div class="question-feedback"><div class="feedback-title"></div><div class="feedback-text"></div></div>
            </div>
            <div class="quiz-question" data-question="2" data-correct="C">
                <div class="question-number">2</div>
                <div class="question-text">DPD nên được sử dụng trong bối cảnh nào?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A"><span class="option-marker">A</span><span class="option-text">Khi xu hướng tăng sắp kết thúc</span></div>
                    <div class="quiz-option" data-option="B"><span class="option-marker">B</span><span class="option-text">Khi giá đang ở đỉnh lịch sử</span></div>
                    <div class="quiz-option" data-option="C"><span class="option-marker">C</span><span class="option-text">Trong xu hướng giảm đang diễn ra</span></div>
                    <div class="quiz-option" data-option="D"><span class="option-marker">D</span><span class="option-text">Khi muốn bắt đáy</span></div>
                </div>
                <div class="question-feedback"><div class="feedback-title"></div><div class="feedback-text"></div></div>
            </div>
            <div class="quiz-result"><div class="result-score">0/2</div><div class="result-text">Hoàn thành!</div><div class="result-message"></div></div>
            <div class="quiz-buttons"><button class="quiz-btn" id="retakeQuiz" style="display: none;">Làm Lại</button></div>
        </section>
    </div>

    <script>
        document.addEventListener(''DOMContentLoaded'', function() {
            const questions = document.querySelectorAll(''.quiz-question'');
            const retakeBtn = document.getElementById(''retakeQuiz'');
            const resultDiv = document.querySelector(''.quiz-result'');
            let answeredCount = 0, correctCount = 0;
            const totalQuestions = 2;
            const explanations = {
                1: { correct: ''✓ Chính xác! UP → PAUSE → DOWN là cấu trúc của UPD - pattern đảo chiều xu hướng giảm.'', incorrect: ''✗ Sai! UP → PAUSE → DOWN là UPD. DPD có cấu trúc DOWN → PAUSE → DOWN.'' },
                2: { correct: ''✓ Chính xác! DPD là pattern tiếp diễn, dùng trong xu hướng giảm đang diễn ra.'', incorrect: ''✗ Sai! DPD là pattern tiếp diễn xu hướng giảm, chỉ nên dùng khi trend giảm đã xác định.'' }
            };
            questions.forEach(q => {
                const opts = q.querySelectorAll(''.quiz-option'');
                opts.forEach(o => {
                    o.addEventListener(''click'', function() {
                        if (q.classList.contains(''answered'')) return;
                        q.classList.add(''answered''); answeredCount++;
                        const sel = this.dataset.option, corr = q.dataset.correct, isCor = sel === corr;
                        opts.forEach(op => op.classList.add(''disabled''));
                        if (isCor) { this.classList.add(''correct''); correctCount++; q.querySelector(''.question-feedback'').classList.add(''correct''); }
                        else { this.classList.add(''incorrect''); q.querySelector(''.question-feedback'').classList.add(''incorrect''); opts.forEach(op => { if(op.dataset.option === corr) op.classList.add(''correct''); }); }
                        q.querySelector(''.feedback-title'').textContent = isCor ? ''✓ Chính xác!'' : ''✗ Sai rồi!'';
                        q.querySelector(''.feedback-text'').textContent = explanations[q.dataset.question][isCor ? ''correct'' : ''incorrect''];
                        q.querySelector(''.question-feedback'').classList.add(''show'');
                        if (answeredCount === totalQuestions) {
                            resultDiv.querySelector(''.result-score'').textContent = `${correctCount}/${totalQuestions}`;
                            resultDiv.querySelector(''.result-message'').textContent = correctCount === totalQuestions ? ''🎉 Xuất sắc!'' : ''📚 Ôn lại bài nhé!'';
                            resultDiv.classList.add(''show''); retakeBtn.style.display = ''inline-block'';
                        }
                    });
                });
            });
            retakeBtn.addEventListener(''click'', function() {
                answeredCount = 0; correctCount = 0;
                questions.forEach(q => { q.classList.remove(''answered''); q.querySelectorAll(''.quiz-option'').forEach(o => o.classList.remove(''correct'', ''incorrect'', ''disabled'')); q.querySelector(''.question-feedback'').classList.remove(''show'', ''correct'', ''incorrect''); });
                resultDiv.classList.remove(''show''); retakeBtn.style.display = ''none'';
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

-- Lesson 4.6: Ví Dụ Thực Tế UPD - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch4-l6',
  'module-tier-1-ch4',
  'course-tier1-trading-foundation',
  'Bài 4.6: Ví Dụ Thực Tế UPD - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 4.6: Ví Dụ Thực Tế UPD - GEM Trading Academy</title>
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
            --nav-bg: #0d0d12;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
            overflow-x: hidden;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1.5rem;
            padding-bottom: 100px;
        }

        @media (max-width: 600px) {
            .lesson-container {
                padding: 0;
                padding-bottom: 80px;
            }
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
            background: linear-gradient(135deg, var(--text-primary), var(--accent-gold));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        @media (max-width: 600px) {
            .lesson-header h1 {
                font-size: 1.4rem;
            }
        }

        .lesson-header p {
            color: var(--text-secondary);
            font-size: 1rem;
        }

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

            .section-content {
                padding: 0 16px 16px 16px;
            }
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
        }

        .section-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-cyan);
            border-radius: 2px;
        }

        @media (max-width: 600px) {
            .section-title::before {
                display: none;
            }
        }

        .section p, .section li {
            color: var(--text-secondary);
            margin-bottom: 0.8rem;
        }

        .section ul, .section ol {
            padding-left: 1.5rem;
        }

        .section li {
            margin-bottom: 0.5rem;
        }

        .image-placeholder {
            width: 100%;
            border-radius: 12px;
            margin: 1rem 0;
            display: block;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .image-placeholder {
                border-radius: 8px;
                margin: 1rem 0;
            }
        }

        .example-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .example-card {
                border-radius: 8px;
                margin: 1rem 0;
                border-left: 4px solid var(--accent-green);
            }
        }

        .example-card h4 {
            color: var(--accent-green);
            margin-bottom: 0.75rem;
            font-size: 1.1rem;
        }

        .example-card p {
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
            font-size: 0.95rem;
        }

        .example-card ul {
            list-style: none;
            padding-left: 0;
            margin-top: 0.75rem;
        }

        .example-card li {
            padding: 0.4rem 0;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
        }

        .example-card li:last-child {
            border-bottom: none;
        }

        .data-label {
            color: var(--text-muted);
        }

        .data-value {
            color: var(--text-primary);
            font-weight: 500;
        }

        .data-value.green {
            color: var(--accent-green);
        }

        .data-value.red {
            color: var(--accent-red);
        }

        .data-value.gold {
            color: var(--accent-gold);
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
                border-left: 4px solid var(--accent-cyan);
            }
        }

        .highlight-box h4 {
            color: var(--accent-cyan);
            margin-bottom: 0.5rem;
        }

        .highlight-box p {
            color: var(--text-secondary);
            margin-bottom: 0;
        }

        .warning-box {
            background: var(--accent-red-dim);
            border: 1px solid var(--accent-red);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .warning-box {
                border-radius: 8px;
                border-left: 4px solid var(--accent-red);
            }
        }

        .warning-box h4 {
            color: var(--accent-red);
            margin-bottom: 0.5rem;
        }

        .warning-box p, .warning-box li {
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
        }

        .success-box {
            background: var(--accent-green-dim);
            border: 1px solid var(--accent-green);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .success-box {
                border-radius: 8px;
                border-left: 4px solid var(--accent-green);
            }
        }

        .success-box h4 {
            color: var(--accent-green);
            margin-bottom: 0.5rem;
        }

        .success-box p {
            color: var(--text-secondary);
            margin-bottom: 0;
        }

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

        .summary-box h3 {
            color: var(--accent-gold);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding-left: 0;
        }

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

            .quiz-content {
                padding: 0 16px 16px 16px;
            }
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

            .quiz-title::before {
                display: none;
            }
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
            .quiz-question {
                border-radius: 8px;
                border-left: 4px solid var(--accent-purple);
            }
        }

        .quiz-question h4 {
            color: var(--text-primary);
            margin-bottom: 1rem;
            font-size: 1rem;
        }

        .quiz-options {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            color: var(--text-secondary);
        }

        .quiz-option:hover {
            background: var(--bg-card-hover);
            border-color: var(--accent-purple);
        }

        .quiz-option.selected {
            border-color: var(--accent-purple);
            background: var(--accent-purple-dim);
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
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: var(--accent-green-dim);
            border: 1px solid var(--accent-green);
            color: var(--accent-green);
        }

        .quiz-result.incorrect {
            background: var(--accent-red-dim);
            border: 1px solid var(--accent-red);
            color: var(--accent-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border: 1px solid var(--accent-purple);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score h3 {
            color: var(--accent-purple);
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .quiz-score p {
            color: var(--text-secondary);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--accent-purple);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.2s ease;
        }

        .retake-btn:hover {
            background: var(--accent-purple-dim);
            border: 1px solid var(--accent-purple);
        }

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
            .stat-card {
                border-radius: 0;
                border: none;
            }
        }

        .stat-card .value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-green);
            display: block;
        }

        .stat-card .label {
            font-size: 0.85rem;
            color: var(--text-muted);
        }

        .trade-result {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border: 1px solid var(--accent-green);
        }

        @media (max-width: 600px) {
            .trade-result {
                border-radius: 8px;
            }
        }

        .trade-result h4 {
            color: var(--accent-gold);
            margin-bottom: 1rem;
            font-size: 1.1rem;
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

        .lesson-footer p {
            color: var(--text-secondary);
            margin-bottom: 1rem;
        }

        .lesson-footer .highlight {
            color: var(--accent-gold);
            font-weight: 600;
        }

        strong {
            color: var(--accent-gold);
        }

        .timeline-box {
            position: relative;
            padding-left: 20px;
            border-left: 3px solid var(--accent-cyan);
            margin: 1rem 0;
        }

        .timeline-item {
            position: relative;
            padding-bottom: 1.5rem;
        }

        .timeline-item:last-child {
            padding-bottom: 0;
        }

        .timeline-item::before {
            content: '''';
            position: absolute;
            left: -26px;
            top: 6px;
            width: 12px;
            height: 12px;
            background: var(--accent-cyan);
            border-radius: 50%;
        }

        .timeline-item h5 {
            color: var(--accent-cyan);
            font-size: 1rem;
            margin-bottom: 0.25rem;
        }

        .timeline-item p {
            color: var(--text-secondary);
            font-size: 0.95rem;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">📚 Tier 1 - Bài 4.6</span>
            <h1>Ví Dụ Thực Tế UPD Pattern</h1>
            <p>Case study chi tiết với ETH và BTC - Từ nhận diện đến thực thi</p>
        </header>

        <section class="section">
            <h2 class="section-title">Case Study #1: ETH/USDT - UPD Hoàn Hảo</h2>
            <div class="section-content">
                <p>Phân tích chi tiết một giao dịch UPD thực tế trên ETH, từ lúc hình thành pattern đến khi chốt lời thành công.</p>

                <img src="https://placehold.co/800x400/112250/FFBD59?text=ETH+UPD+Pattern+Overview" alt="ETH UPD Pattern Overview" class="image-placeholder">

                <div class="example-card">
                    <h4>📊 Thông Tin Giao Dịch</h4>
                    <ul>
                        <li><span class="data-label">Coin</span><span class="data-value">ETH/USDT</span></li>
                        <li><span class="data-label">Khung thời gian</span><span class="data-value">H4</span></li>
                        <li><span class="data-label">Thời điểm</span><span class="data-value">Q4 2024</span></li>
                        <li><span class="data-label">Xu hướng lớn</span><span class="data-value green">Uptrend (D1)</span></li>
                    </ul>
                </div>

                <div class="timeline-box">
                    <div class="timeline-item">
                        <h5>Phase 1: UP - Sóng Tăng Mạnh</h5>
                        <p>ETH tăng từ $2,800 lên $3,200 (+14.3%) trong 5 ngày. Volume tăng đều đặn, ĐỈNH xác nhận tại $3,200.</p>
                    </div>
                    <div class="timeline-item">
                        <h5>Phase 2: PAUSE - Tích Lũy</h5>
                        <p>Giá dao động sideway $3,100 - $3,200 trong 4 ngày. Volume giảm 60%, hình thành HFZ tại vùng đỉnh.</p>
                    </div>
                    <div class="timeline-item">
                        <h5>Phase 3: DOWN - Break HFZ</h5>
                        <p>Nến D1 phá vỡ $3,100 (HFZ), volume tăng gấp 2 lần → Tín hiệu SHORT confirmed.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Chi Tiết Entry & Exit - ETH Trade</h2>
            <div class="section-content">
                <p>Áp dụng 8-Point Checklist cho giao dịch này:</p>

                <img src="https://placehold.co/800x400/112250/00F0FF?text=ETH+Entry+Exit+Points" alt="ETH Entry Exit Points" class="image-placeholder">

                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="value">$3,095</span>
                        <span class="label">Entry (dưới HFZ)</span>
                    </div>
                    <div class="stat-card">
                        <span class="value">$3,210</span>
                        <span class="label">Stop Loss</span>
                    </div>
                    <div class="stat-card">
                        <span class="value">$2,750</span>
                        <span class="label">Take Profit</span>
                    </div>
                    <div class="stat-card">
                        <span class="value" style="color: var(--accent-gold);">3:1</span>
                        <span class="label">Risk/Reward</span>
                    </div>
                </div>

                <div class="highlight-box">
                    <h4>📐 Tính Toán Risk/Reward</h4>
                    <p><strong>Risk:</strong> $3,210 - $3,095 = $115 (3.7%)<br>
                    <strong>Reward:</strong> $3,095 - $2,750 = $345 (11.1%)<br>
                    <strong>R:R Ratio:</strong> 345 / 115 = 3:1 ✓</p>
                </div>

                <div class="trade-result">
                    <h4>📈 Kết Quả Giao Dịch</h4>
                    <ul>
                        <li><span class="data-label">Thời gian hold</span><span class="data-value">6 ngày</span></li>
                        <li><span class="data-label">Target đạt</span><span class="data-value green">100% ($2,750)</span></li>
                        <li><span class="data-label">Profit</span><span class="data-value green">+11.1%</span></li>
                        <li><span class="data-label">Đánh giá</span><span class="data-value gold">Perfect UPD Setup</span></li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Case Study #2: BTC/USDT - UPD Trên D1</h2>
            <div class="section-content">
                <p>Phân tích một UPD trên khung D1 của BTC - Timeframe lớn hơn, setup chắc chắn hơn.</p>

                <img src="https://placehold.co/800x400/112250/10B981?text=BTC+D1+UPD+Pattern" alt="BTC D1 UPD Pattern" class="image-placeholder">

                <div class="example-card">
                    <h4>📊 Thông Tin Giao Dịch</h4>
                    <ul>
                        <li><span class="data-label">Coin</span><span class="data-value">BTC/USDT</span></li>
                        <li><span class="data-label">Khung thời gian</span><span class="data-value">D1</span></li>
                        <li><span class="data-label">Context</span><span class="data-value">Weekly resistance</span></li>
                        <li><span class="data-label">Signal strength</span><span class="data-value gold">Strong (8/8)</span></li>
                    </ul>
                </div>

                <p><strong>Diễn biến Pattern:</strong></p>
                <ul>
                    <li><strong>Phase 1 (UP):</strong> BTC rally từ $62,000 → $69,500 (+12%) trong 2 tuần</li>
                    <li><strong>Phase 2 (PAUSE):</strong> Sideway tại $68,000-$69,500 trong 5 ngày, volume cạn kiệt</li>
                    <li><strong>Phase 3 (DOWN):</strong> Break HFZ $68,000 với volume spike</li>
                </ul>

                <div class="success-box">
                    <h4>✅ Yếu Tố Xác Nhận Mạnh</h4>
                    <p>• Weekly resistance tại $70K<br>
                    • RSI divergence trên H4<br>
                    • Volume dry-up trong Phase 2<br>
                    • News catalyst: Fed hawkish</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Phân Tích Kỹ Thuật Chi Tiết - BTC</h2>
            <div class="section-content">
                <img src="https://placehold.co/800x450/112250/6A5BFF?text=BTC+Technical+Analysis" alt="BTC Technical Analysis" class="image-placeholder">

                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="value">$67,800</span>
                        <span class="label">Entry Price</span>
                    </div>
                    <div class="stat-card">
                        <span class="value">$70,000</span>
                        <span class="label">Stop Loss</span>
                    </div>
                    <div class="stat-card">
                        <span class="value">$61,200</span>
                        <span class="label">TP (Previous LFZ)</span>
                    </div>
                    <div class="stat-card">
                        <span class="value" style="color: var(--accent-green);">3:1</span>
                        <span class="label">R:R Ratio</span>
                    </div>
                </div>

                <div class="trade-result">
                    <h4>📈 Kết Quả Thực Tế</h4>
                    <ul>
                        <li><span class="data-label">Kết quả</span><span class="data-value green">TP HIT</span></li>
                        <li><span class="data-label">Profit</span><span class="data-value green">+9.7%</span></li>
                        <li><span class="data-label">Thời gian</span><span class="data-value">8 ngày</span></li>
                        <li><span class="data-label">Giá thấp nhất</span><span class="data-value">$60,800</span></li>
                    </ul>
                </div>

                <div class="highlight-box">
                    <h4>💡 Bài Học Từ Trade Này</h4>
                    <p>BTC trên D1 cho UPD setup cực kỳ đáng tin cậy. Pattern hình thành trong 2-3 tuần nhưng probability cao hơn nhiều so với H1-H4.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Bài Học Từ Các Case Study</h2>
            <div class="section-content">
                <p>Tổng kết những điểm quan trọng từ 2 giao dịch thực tế:</p>

                <img src="https://placehold.co/800x350/112250/FFBD59?text=Key+Lessons+Summary" alt="Key Lessons Summary" class="image-placeholder">

                <div class="example-card">
                    <h4>📌 5 Bài Học Quan Trọng</h4>
                    <p><strong>1. Confirmation là số 1:</strong> Không entry sớm, đợi nến break HFZ rõ ràng.</p>
                    <p><strong>2. Volume tell the truth:</strong> Cả 2 trade đều có volume spike khi break.</p>
                    <p><strong>3. Context matters:</strong> Trade theo chiều với resistance lớn (ETH đỉnh cũ, BTC weekly).</p>
                    <p><strong>4. R:R minimum 2.5:1:</strong> Cả 2 trade đều đạt 3:1, đảm bảo edge dài hạn.</p>
                    <p><strong>5. Patience pays:</strong> Chờ setup hoàn hảo, không FOMO vào pattern đang hình thành.</p>
                </div>

                <div class="warning-box">
                    <h4>⚠️ Sai Lầm Cần Tránh</h4>
                    <p>• <strong>ĐỪNG</strong> short khi chưa có nến confirmation phá HFZ</p>
                    <p>• <strong>ĐỪNG</strong> đặt SL quá sát HFZ (cần buffer 1-2%)</p>
                    <p>• <strong>ĐỪNG</strong> trade UPD trong uptrend mạnh trên TF cao hơn</p>
                    <p>• <strong>ĐỪNG</strong> ignore divergence signals trên RSI/MACD</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>ETH UPD trên H4 cho profit +11.1% với setup hoàn hảo 8/8 checklist</li>
                <li>BTC UPD trên D1 cho profit +9.7% nhờ weekly resistance confluence</li>
                <li>Cả 2 trade đều có R:R 3:1 - quan trọng cho profitability dài hạn</li>
                <li>Volume confirmation là yếu tố then chốt trong cả 2 case</li>
                <li>Context (higher TF resistance) tăng probability đáng kể</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="1">
                    <h4>Câu 1: Trong case ETH, tại sao entry được đặt tại $3,095 thay vì $3,100?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Để có giá đẹp hơn</div>
                        <div class="quiz-option" data-index="1">B. Entry dưới HFZ một chút để confirm break thật</div>
                        <div class="quiz-option" data-index="2">C. Do limit order không khớp</div>
                        <div class="quiz-option" data-index="3">D. Ngẫu nhiên</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 2: Yếu tố nào làm BTC UPD setup có probability cao?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Giá cao</div>
                        <div class="quiz-option" data-index="1">B. Volume thấp</div>
                        <div class="quiz-option" data-index="2">C. Weekly resistance confluence và RSI divergence</div>
                        <div class="quiz-option" data-index="3">D. Đang uptrend</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 3: R:R ratio tối thiểu nên đạt bao nhiêu cho UPD trade?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. 2.5:1 trở lên</div>
                        <div class="quiz-option" data-index="1">B. 1:1</div>
                        <div class="quiz-option" data-index="2">C. 1.5:1</div>
                        <div class="quiz-option" data-index="3">D. 5:1</div>
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
            <p>🎉 Chúc mừng! Bạn đã hoàn thành <span class="highlight">Chương 4: UPD Pattern</span></p>
            <p>Tiếp theo: <strong>Chương 5 - DPU Pattern: Đảo Chiều Từ Downtrend</strong></p>
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
                        result.textContent = ''✓ Chính xác! Entry dưới HFZ để xác nhận breakout thật sự.'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng. Xem đáp án đúng được đánh dấu màu xanh.'';
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
                    opt.classList.remove(''correct'', ''incorrect'', ''selected'');
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
    <title>Bài 4.6: Ví Dụ Thực Tế UPD - GEM Trading Academy</title>
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
            --nav-bg: #0d0d12;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
            overflow-x: hidden;
        }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1.5rem;
            padding-bottom: 100px;
        }

        @media (max-width: 600px) {
            .lesson-container {
                padding: 0;
                padding-bottom: 80px;
            }
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
            background: linear-gradient(135deg, var(--text-primary), var(--accent-gold));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        @media (max-width: 600px) {
            .lesson-header h1 {
                font-size: 1.4rem;
            }
        }

        .lesson-header p {
            color: var(--text-secondary);
            font-size: 1rem;
        }

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

            .section-content {
                padding: 0 16px 16px 16px;
            }
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
        }

        .section-title::before {
            content: '''';
            width: 4px;
            height: 24px;
            background: var(--accent-cyan);
            border-radius: 2px;
        }

        @media (max-width: 600px) {
            .section-title::before {
                display: none;
            }
        }

        .section p, .section li {
            color: var(--text-secondary);
            margin-bottom: 0.8rem;
        }

        .section ul, .section ol {
            padding-left: 1.5rem;
        }

        .section li {
            margin-bottom: 0.5rem;
        }

        .image-placeholder {
            width: 100%;
            border-radius: 12px;
            margin: 1rem 0;
            display: block;
            border: 1px solid var(--border-color);
        }

        @media (max-width: 600px) {
            .image-placeholder {
                border-radius: 8px;
                margin: 1rem 0;
            }
        }

        .example-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .example-card {
                border-radius: 8px;
                margin: 1rem 0;
                border-left: 4px solid var(--accent-green);
            }
        }

        .example-card h4 {
            color: var(--accent-green);
            margin-bottom: 0.75rem;
            font-size: 1.1rem;
        }

        .example-card p {
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
            font-size: 0.95rem;
        }

        .example-card ul {
            list-style: none;
            padding-left: 0;
            margin-top: 0.75rem;
        }

        .example-card li {
            padding: 0.4rem 0;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
        }

        .example-card li:last-child {
            border-bottom: none;
        }

        .data-label {
            color: var(--text-muted);
        }

        .data-value {
            color: var(--text-primary);
            font-weight: 500;
        }

        .data-value.green {
            color: var(--accent-green);
        }

        .data-value.red {
            color: var(--accent-red);
        }

        .data-value.gold {
            color: var(--accent-gold);
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
                border-left: 4px solid var(--accent-cyan);
            }
        }

        .highlight-box h4 {
            color: var(--accent-cyan);
            margin-bottom: 0.5rem;
        }

        .highlight-box p {
            color: var(--text-secondary);
            margin-bottom: 0;
        }

        .warning-box {
            background: var(--accent-red-dim);
            border: 1px solid var(--accent-red);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .warning-box {
                border-radius: 8px;
                border-left: 4px solid var(--accent-red);
            }
        }

        .warning-box h4 {
            color: var(--accent-red);
            margin-bottom: 0.5rem;
        }

        .warning-box p, .warning-box li {
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
        }

        .success-box {
            background: var(--accent-green-dim);
            border: 1px solid var(--accent-green);
            border-radius: 12px;
            padding: 1rem;
            margin: 1rem 0;
        }

        @media (max-width: 600px) {
            .success-box {
                border-radius: 8px;
                border-left: 4px solid var(--accent-green);
            }
        }

        .success-box h4 {
            color: var(--accent-green);
            margin-bottom: 0.5rem;
        }

        .success-box p {
            color: var(--text-secondary);
            margin-bottom: 0;
        }

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

        .summary-box h3 {
            color: var(--accent-gold);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-box ul {
            list-style: none;
            padding-left: 0;
        }

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

            .quiz-content {
                padding: 0 16px 16px 16px;
            }
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

            .quiz-title::before {
                display: none;
            }
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
            .quiz-question {
                border-radius: 8px;
                border-left: 4px solid var(--accent-purple);
            }
        }

        .quiz-question h4 {
            color: var(--text-primary);
            margin-bottom: 1rem;
            font-size: 1rem;
        }

        .quiz-options {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .quiz-option {
            padding: 0.875rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            color: var(--text-secondary);
        }

        .quiz-option:hover {
            background: var(--bg-card-hover);
            border-color: var(--accent-purple);
        }

        .quiz-option.selected {
            border-color: var(--accent-purple);
            background: var(--accent-purple-dim);
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
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
            display: none;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: var(--accent-green-dim);
            border: 1px solid var(--accent-green);
            color: var(--accent-green);
        }

        .quiz-result.incorrect {
            background: var(--accent-red-dim);
            border: 1px solid var(--accent-red);
            color: var(--accent-red);
        }

        .quiz-score {
            text-align: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--accent-purple-dim), transparent);
            border: 1px solid var(--accent-purple);
            border-radius: 12px;
            margin-top: 1.5rem;
            display: none;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score h3 {
            color: var(--accent-purple);
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .quiz-score p {
            color: var(--text-secondary);
        }

        .retake-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--accent-purple);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.2s ease;
        }

        .retake-btn:hover {
            background: var(--accent-purple-dim);
            border: 1px solid var(--accent-purple);
        }

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
            .stat-card {
                border-radius: 0;
                border: none;
            }
        }

        .stat-card .value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-green);
            display: block;
        }

        .stat-card .label {
            font-size: 0.85rem;
            color: var(--text-muted);
        }

        .trade-result {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.25rem;
            margin: 1rem 0;
            border: 1px solid var(--accent-green);
        }

        @media (max-width: 600px) {
            .trade-result {
                border-radius: 8px;
            }
        }

        .trade-result h4 {
            color: var(--accent-gold);
            margin-bottom: 1rem;
            font-size: 1.1rem;
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

        .lesson-footer p {
            color: var(--text-secondary);
            margin-bottom: 1rem;
        }

        .lesson-footer .highlight {
            color: var(--accent-gold);
            font-weight: 600;
        }

        strong {
            color: var(--accent-gold);
        }

        .timeline-box {
            position: relative;
            padding-left: 20px;
            border-left: 3px solid var(--accent-cyan);
            margin: 1rem 0;
        }

        .timeline-item {
            position: relative;
            padding-bottom: 1.5rem;
        }

        .timeline-item:last-child {
            padding-bottom: 0;
        }

        .timeline-item::before {
            content: '''';
            position: absolute;
            left: -26px;
            top: 6px;
            width: 12px;
            height: 12px;
            background: var(--accent-cyan);
            border-radius: 50%;
        }

        .timeline-item h5 {
            color: var(--accent-cyan);
            font-size: 1rem;
            margin-bottom: 0.25rem;
        }

        .timeline-item p {
            color: var(--text-secondary);
            font-size: 0.95rem;
        }
    </style>
</head>
<body>
    <div class="lesson-container">
        <header class="lesson-header">
            <span class="lesson-badge">📚 Tier 1 - Bài 4.6</span>
            <h1>Ví Dụ Thực Tế UPD Pattern</h1>
            <p>Case study chi tiết với ETH và BTC - Từ nhận diện đến thực thi</p>
        </header>

        <section class="section">
            <h2 class="section-title">Case Study #1: ETH/USDT - UPD Hoàn Hảo</h2>
            <div class="section-content">
                <p>Phân tích chi tiết một giao dịch UPD thực tế trên ETH, từ lúc hình thành pattern đến khi chốt lời thành công.</p>

                <img src="https://placehold.co/800x400/112250/FFBD59?text=ETH+UPD+Pattern+Overview" alt="ETH UPD Pattern Overview" class="image-placeholder">

                <div class="example-card">
                    <h4>📊 Thông Tin Giao Dịch</h4>
                    <ul>
                        <li><span class="data-label">Coin</span><span class="data-value">ETH/USDT</span></li>
                        <li><span class="data-label">Khung thời gian</span><span class="data-value">H4</span></li>
                        <li><span class="data-label">Thời điểm</span><span class="data-value">Q4 2024</span></li>
                        <li><span class="data-label">Xu hướng lớn</span><span class="data-value green">Uptrend (D1)</span></li>
                    </ul>
                </div>

                <div class="timeline-box">
                    <div class="timeline-item">
                        <h5>Phase 1: UP - Sóng Tăng Mạnh</h5>
                        <p>ETH tăng từ $2,800 lên $3,200 (+14.3%) trong 5 ngày. Volume tăng đều đặn, ĐỈNH xác nhận tại $3,200.</p>
                    </div>
                    <div class="timeline-item">
                        <h5>Phase 2: PAUSE - Tích Lũy</h5>
                        <p>Giá dao động sideway $3,100 - $3,200 trong 4 ngày. Volume giảm 60%, hình thành HFZ tại vùng đỉnh.</p>
                    </div>
                    <div class="timeline-item">
                        <h5>Phase 3: DOWN - Break HFZ</h5>
                        <p>Nến D1 phá vỡ $3,100 (HFZ), volume tăng gấp 2 lần → Tín hiệu SHORT confirmed.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Chi Tiết Entry & Exit - ETH Trade</h2>
            <div class="section-content">
                <p>Áp dụng 8-Point Checklist cho giao dịch này:</p>

                <img src="https://placehold.co/800x400/112250/00F0FF?text=ETH+Entry+Exit+Points" alt="ETH Entry Exit Points" class="image-placeholder">

                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="value">$3,095</span>
                        <span class="label">Entry (dưới HFZ)</span>
                    </div>
                    <div class="stat-card">
                        <span class="value">$3,210</span>
                        <span class="label">Stop Loss</span>
                    </div>
                    <div class="stat-card">
                        <span class="value">$2,750</span>
                        <span class="label">Take Profit</span>
                    </div>
                    <div class="stat-card">
                        <span class="value" style="color: var(--accent-gold);">3:1</span>
                        <span class="label">Risk/Reward</span>
                    </div>
                </div>

                <div class="highlight-box">
                    <h4>📐 Tính Toán Risk/Reward</h4>
                    <p><strong>Risk:</strong> $3,210 - $3,095 = $115 (3.7%)<br>
                    <strong>Reward:</strong> $3,095 - $2,750 = $345 (11.1%)<br>
                    <strong>R:R Ratio:</strong> 345 / 115 = 3:1 ✓</p>
                </div>

                <div class="trade-result">
                    <h4>📈 Kết Quả Giao Dịch</h4>
                    <ul>
                        <li><span class="data-label">Thời gian hold</span><span class="data-value">6 ngày</span></li>
                        <li><span class="data-label">Target đạt</span><span class="data-value green">100% ($2,750)</span></li>
                        <li><span class="data-label">Profit</span><span class="data-value green">+11.1%</span></li>
                        <li><span class="data-label">Đánh giá</span><span class="data-value gold">Perfect UPD Setup</span></li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Case Study #2: BTC/USDT - UPD Trên D1</h2>
            <div class="section-content">
                <p>Phân tích một UPD trên khung D1 của BTC - Timeframe lớn hơn, setup chắc chắn hơn.</p>

                <img src="https://placehold.co/800x400/112250/10B981?text=BTC+D1+UPD+Pattern" alt="BTC D1 UPD Pattern" class="image-placeholder">

                <div class="example-card">
                    <h4>📊 Thông Tin Giao Dịch</h4>
                    <ul>
                        <li><span class="data-label">Coin</span><span class="data-value">BTC/USDT</span></li>
                        <li><span class="data-label">Khung thời gian</span><span class="data-value">D1</span></li>
                        <li><span class="data-label">Context</span><span class="data-value">Weekly resistance</span></li>
                        <li><span class="data-label">Signal strength</span><span class="data-value gold">Strong (8/8)</span></li>
                    </ul>
                </div>

                <p><strong>Diễn biến Pattern:</strong></p>
                <ul>
                    <li><strong>Phase 1 (UP):</strong> BTC rally từ $62,000 → $69,500 (+12%) trong 2 tuần</li>
                    <li><strong>Phase 2 (PAUSE):</strong> Sideway tại $68,000-$69,500 trong 5 ngày, volume cạn kiệt</li>
                    <li><strong>Phase 3 (DOWN):</strong> Break HFZ $68,000 với volume spike</li>
                </ul>

                <div class="success-box">
                    <h4>✅ Yếu Tố Xác Nhận Mạnh</h4>
                    <p>• Weekly resistance tại $70K<br>
                    • RSI divergence trên H4<br>
                    • Volume dry-up trong Phase 2<br>
                    • News catalyst: Fed hawkish</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Phân Tích Kỹ Thuật Chi Tiết - BTC</h2>
            <div class="section-content">
                <img src="https://placehold.co/800x450/112250/6A5BFF?text=BTC+Technical+Analysis" alt="BTC Technical Analysis" class="image-placeholder">

                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="value">$67,800</span>
                        <span class="label">Entry Price</span>
                    </div>
                    <div class="stat-card">
                        <span class="value">$70,000</span>
                        <span class="label">Stop Loss</span>
                    </div>
                    <div class="stat-card">
                        <span class="value">$61,200</span>
                        <span class="label">TP (Previous LFZ)</span>
                    </div>
                    <div class="stat-card">
                        <span class="value" style="color: var(--accent-green);">3:1</span>
                        <span class="label">R:R Ratio</span>
                    </div>
                </div>

                <div class="trade-result">
                    <h4>📈 Kết Quả Thực Tế</h4>
                    <ul>
                        <li><span class="data-label">Kết quả</span><span class="data-value green">TP HIT</span></li>
                        <li><span class="data-label">Profit</span><span class="data-value green">+9.7%</span></li>
                        <li><span class="data-label">Thời gian</span><span class="data-value">8 ngày</span></li>
                        <li><span class="data-label">Giá thấp nhất</span><span class="data-value">$60,800</span></li>
                    </ul>
                </div>

                <div class="highlight-box">
                    <h4>💡 Bài Học Từ Trade Này</h4>
                    <p>BTC trên D1 cho UPD setup cực kỳ đáng tin cậy. Pattern hình thành trong 2-3 tuần nhưng probability cao hơn nhiều so với H1-H4.</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Bài Học Từ Các Case Study</h2>
            <div class="section-content">
                <p>Tổng kết những điểm quan trọng từ 2 giao dịch thực tế:</p>

                <img src="https://placehold.co/800x350/112250/FFBD59?text=Key+Lessons+Summary" alt="Key Lessons Summary" class="image-placeholder">

                <div class="example-card">
                    <h4>📌 5 Bài Học Quan Trọng</h4>
                    <p><strong>1. Confirmation là số 1:</strong> Không entry sớm, đợi nến break HFZ rõ ràng.</p>
                    <p><strong>2. Volume tell the truth:</strong> Cả 2 trade đều có volume spike khi break.</p>
                    <p><strong>3. Context matters:</strong> Trade theo chiều với resistance lớn (ETH đỉnh cũ, BTC weekly).</p>
                    <p><strong>4. R:R minimum 2.5:1:</strong> Cả 2 trade đều đạt 3:1, đảm bảo edge dài hạn.</p>
                    <p><strong>5. Patience pays:</strong> Chờ setup hoàn hảo, không FOMO vào pattern đang hình thành.</p>
                </div>

                <div class="warning-box">
                    <h4>⚠️ Sai Lầm Cần Tránh</h4>
                    <p>• <strong>ĐỪNG</strong> short khi chưa có nến confirmation phá HFZ</p>
                    <p>• <strong>ĐỪNG</strong> đặt SL quá sát HFZ (cần buffer 1-2%)</p>
                    <p>• <strong>ĐỪNG</strong> trade UPD trong uptrend mạnh trên TF cao hơn</p>
                    <p>• <strong>ĐỪNG</strong> ignore divergence signals trên RSI/MACD</p>
                </div>
            </div>
        </section>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li>ETH UPD trên H4 cho profit +11.1% với setup hoàn hảo 8/8 checklist</li>
                <li>BTC UPD trên D1 cho profit +9.7% nhờ weekly resistance confluence</li>
                <li>Cả 2 trade đều có R:R 3:1 - quan trọng cho profitability dài hạn</li>
                <li>Volume confirmation là yếu tố then chốt trong cả 2 case</li>
                <li>Context (higher TF resistance) tăng probability đáng kể</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h2 class="quiz-title">🎯 Kiểm Tra Hiểu Biết</h2>
            <div class="quiz-content">
                <div class="quiz-question" data-correct="1">
                    <h4>Câu 1: Trong case ETH, tại sao entry được đặt tại $3,095 thay vì $3,100?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Để có giá đẹp hơn</div>
                        <div class="quiz-option" data-index="1">B. Entry dưới HFZ một chút để confirm break thật</div>
                        <div class="quiz-option" data-index="2">C. Do limit order không khớp</div>
                        <div class="quiz-option" data-index="3">D. Ngẫu nhiên</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="2">
                    <h4>Câu 2: Yếu tố nào làm BTC UPD setup có probability cao?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. Giá cao</div>
                        <div class="quiz-option" data-index="1">B. Volume thấp</div>
                        <div class="quiz-option" data-index="2">C. Weekly resistance confluence và RSI divergence</div>
                        <div class="quiz-option" data-index="3">D. Đang uptrend</div>
                    </div>
                    <div class="quiz-result"></div>
                </div>

                <div class="quiz-question" data-correct="0">
                    <h4>Câu 3: R:R ratio tối thiểu nên đạt bao nhiêu cho UPD trade?</h4>
                    <div class="quiz-options">
                        <div class="quiz-option" data-index="0">A. 2.5:1 trở lên</div>
                        <div class="quiz-option" data-index="1">B. 1:1</div>
                        <div class="quiz-option" data-index="2">C. 1.5:1</div>
                        <div class="quiz-option" data-index="3">D. 5:1</div>
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
            <p>🎉 Chúc mừng! Bạn đã hoàn thành <span class="highlight">Chương 4: UPD Pattern</span></p>
            <p>Tiếp theo: <strong>Chương 5 - DPU Pattern: Đảo Chiều Từ Downtrend</strong></p>
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
                        result.textContent = ''✓ Chính xác! Entry dưới HFZ để xác nhận breakout thật sự.'';
                        result.className = ''quiz-result show correct'';
                        correctCount++;
                    } else {
                        this.classList.add(''incorrect'');
                        options[correctIndex].classList.add(''correct'');
                        result.textContent = ''✗ Chưa đúng. Xem đáp án đúng được đánh dấu màu xanh.'';
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
                    opt.classList.remove(''correct'', ''incorrect'', ''selected'');
                });
                question.querySelector(''.quiz-result'').className = ''quiz-result'';
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
