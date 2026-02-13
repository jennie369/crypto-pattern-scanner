-- =====================================================
-- TIER-1 - Chương 3: UPU Pattern Mastery
-- Course: course-tier1-trading-foundation
-- File 1/23
-- =====================================================

-- Create/Update Module
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  'module-tier-1-ch3',
  'course-tier1-trading-foundation',
  'Chương 3: UPU Pattern Mastery',
  'Học cách xác định và giao dịch với UPU Pattern',
  3,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Lesson 3.2: Cấu Trúc 3 Phases Của UPU
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch3-l2',
  'module-tier-1-ch3',
  'course-tier1-trading-foundation',
  'Bài 3.2: Cấu Trúc 3 Phases Của UPU',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 3.2: Cấu Trúc 3 Phases Của UPU | GEM Trading Academy</title>

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

        .background-container {
            position: fixed;
            inset: 0;
            z-index: -1;
        }
        .bg-layer-base {
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, var(--navy-dark) 0%, var(--navy) 50%, var(--navy-dark) 100%);
        }
        .orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.3;
        }
        .orb-1 { width: 400px; height: 400px; background: var(--gold); top: -100px; right: -100px; }
        .orb-2 { width: 300px; height: 300px; background: var(--cyan); bottom: 20%; left: -100px; }
        .orb-3 { width: 250px; height: 250px; background: var(--success); bottom: -50px; right: 20%; }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1.5rem;
        }
        @media (max-width: 600px) {
            .lesson-container {
                padding: 0;
            }
        }

        .lesson-header {
            text-align: center;
            padding: var(--space-xl);
            margin-bottom: var(--space-xl);
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            box-shadow: 0 4px 24px rgba(0,0,0,0.2);
        }
        @media (max-width: 600px) {
            .lesson-header {
                padding: var(--space-lg) 16px;
                margin-bottom: 0;
                border: none;
                border-radius: 0;
                box-shadow: none;
                border-bottom: 8px solid var(--bg-primary);
            }
        }
        .lesson-badge {
            display: inline-flex;
            align-items: center;
            gap: var(--space-sm);
            padding: var(--space-sm) var(--space-md);
            background: linear-gradient(135deg, var(--success), var(--cyan));
            border-radius: 50px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: var(--space-md);
            color: var(--navy-dark);
        }
        .lesson-chapter {
            font-size: 0.9rem;
            color: var(--gold);
            font-weight: 600;
            margin-bottom: var(--space-sm);
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .lesson-title {
            font-size: clamp(1.75rem, 5vw, 2.5rem);
            font-weight: 800;
            margin-bottom: var(--space-md);
            background: linear-gradient(135deg, var(--text-primary), var(--gold));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .lesson-meta {
            display: flex;
            justify-content: center;
            gap: var(--space-lg);
            flex-wrap: wrap;
            color: var(--text-muted);
            font-size: 0.85rem;
        }
        .meta-item {
            display: flex;
            align-items: center;
            gap: var(--space-xs);
        }

        .section {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            box-shadow: 0 4px 24px rgba(0,0,0,0.2);
            padding: var(--space-xl);
            margin-bottom: var(--space-lg);
        }
        @media (max-width: 600px) {
            .section {
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-radius: 0;
                box-shadow: none;
                border-bottom: 8px solid var(--bg-primary);
            }
        }

        .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--gold);
            margin-bottom: var(--space-lg);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }
        @media (max-width: 600px) {
            .section-title {
                padding: var(--space-lg) 16px var(--space-md) 16px;
                margin-bottom: 0;
            }
        }

        .section > p {
            color: var(--text-secondary);
            margin-bottom: var(--space-md);
        }
        @media (max-width: 600px) {
            .section > p {
                padding: 0 16px;
            }
        }

        .section > ul, .section > ol {
            color: var(--text-secondary);
            padding-left: 1.5em;
            margin-bottom: var(--space-md);
        }
        @media (max-width: 600px) {
            .section > ul, .section > ol {
                padding-left: calc(16px + 1.5em);
                padding-right: 16px;
            }
        }
        .section li { margin-bottom: var(--space-sm); }

        .highlight-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15), rgba(255, 189, 89, 0.05));
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .highlight-box {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--gold);
                padding: var(--space-md) 16px;
                margin: var(--space-md) 0;
            }
        }
        .highlight-box-title {
            font-weight: 700;
            color: var(--gold);
            margin-bottom: var(--space-sm);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }
        .highlight-box p { color: var(--text-secondary); margin: 0; }

        .definition-box {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.02));
            border: 1px solid rgba(0, 240, 255, 0.2);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .definition-box {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--cyan);
                padding: var(--space-md) 16px;
                margin: var(--space-md) 0;
            }
        }
        .definition-box-title {
            font-weight: 700;
            color: var(--cyan);
            margin-bottom: var(--space-sm);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }

        .image-container {
            margin: var(--space-xl) 0;
            border-radius: var(--radius-md);
            overflow: hidden;
            border: 1px solid var(--glass-border);
        }
        @media (max-width: 600px) {
            .image-container {
                margin: var(--space-md) 0;
                border-radius: 0;
                border: none;
            }
        }
        .image-caption {
            padding: var(--space-sm);
            font-size: 0.85rem;
            color: var(--text-muted);
            font-style: italic;
            text-align: center;
        }
        @media (max-width: 600px) {
            .image-caption {
                padding: var(--space-sm) 16px;
            }
        }

        .pattern-flow {
            display: flex;
            flex-direction: column;
            gap: var(--space-md);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .pattern-flow {
                gap: 1px;
                background: var(--glass-border);
                margin: var(--space-md) 0;
            }
        }
        .flow-phase {
            display: flex;
            gap: var(--space-md);
            align-items: flex-start;
            padding: var(--space-md);
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            transition: all 0.3s ease;
        }
        @media (max-width: 600px) {
            .flow-phase {
                padding: var(--space-md) 16px;
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--gold);
            }
        }
        .flow-phase.up { border-left-color: var(--success); }
        .flow-phase.pause { border-left-color: var(--gold); }
        .phase-icon {
            font-size: 2rem;
            min-width: 50px;
            text-align: center;
        }
        .phase-content { flex: 1; }
        .phase-title {
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: var(--space-xs);
        }
        .flow-phase.up .phase-title { color: var(--success); }
        .flow-phase.pause .phase-title { color: var(--gold); }
        .phase-desc {
            font-size: 0.9rem;
            color: var(--text-muted);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: var(--space-md);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .stats-grid {
                gap: 1px;
                background: var(--glass-border);
                margin: var(--space-md) 0;
            }
        }
        .stat-card {
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            text-align: center;
        }
        @media (max-width: 600px) {
            .stat-card {
                border: none;
                border-radius: 0;
                padding: var(--space-md);
            }
        }
        .stat-value {
            font-size: 1.75rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--cyan), var(--cyan));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        @media (max-width: 600px) {
            .stat-value { font-size: 1.25rem; }
        }
        .stat-label {
            font-size: 0.75rem;
            color: var(--text-muted);
            text-transform: uppercase;
        }
        .stat-card.green .stat-value {
            background: linear-gradient(135deg, var(--success), var(--success));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .stat-card.gold .stat-value {
            background: linear-gradient(135deg, var(--gold), var(--gold));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .summary-box {
            background: linear-gradient(135deg, rgba(0, 200, 83, 0.1), rgba(0, 200, 83, 0.02));
            border: 2px solid var(--success);
            border-radius: var(--radius-lg);
            padding: var(--space-xl);
            margin: var(--space-xl) 0;
        }
        @media (max-width: 600px) {
            .summary-box {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--success);
                padding: var(--space-lg) 16px;
                margin: var(--space-md) 0;
            }
        }
        .summary-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--success);
            margin-bottom: var(--space-lg);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }
        .summary-list { list-style: none; }
        .summary-list li {
            display: flex;
            align-items: flex-start;
            gap: var(--space-sm);
            margin-bottom: var(--space-md);
            color: var(--text-secondary);
        }
        .summary-list li::before {
            content: "✓";
            color: var(--success);
            font-weight: 700;
        }

        .quiz-section {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            padding: var(--space-xl);
            margin-top: var(--space-xl);
        }
        @media (max-width: 600px) {
            .quiz-section {
                border: none;
                border-radius: 0;
                padding: 0;
                margin-top: 0;
                border-top: 8px solid var(--bg-primary);
            }
        }
        .quiz-header {
            text-align: center;
            margin-bottom: var(--space-xl);
        }
        @media (max-width: 600px) {
            .quiz-header {
                padding: var(--space-lg) 16px var(--space-md);
                margin-bottom: 0;
            }
        }
        .quiz-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--gold);
            margin-bottom: var(--space-sm);
        }
        .quiz-subtitle { color: var(--text-muted); font-size: 0.9rem; }

        .quiz-question {
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            margin-bottom: var(--space-lg);
        }
        @media (max-width: 600px) {
            .quiz-question {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--purple);
                padding: var(--space-md) 16px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--glass-border);
            }
        }
        .question-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, var(--gold), var(--gold-dark));
            border-radius: 50%;
            font-weight: 700;
            color: var(--navy-dark);
            margin-bottom: var(--space-md);
        }
        .question-text {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--space-lg);
            line-height: 1.6;
        }

        .quiz-options {
            display: flex;
            flex-direction: column;
            gap: var(--space-sm);
        }
        @media (max-width: 600px) {
            .quiz-options {
                gap: 1px;
                background: var(--glass-border);
                margin-left: -16px;
                margin-right: -16px;
                margin-left: calc(-16px - 4px);
            }
        }
        .quiz-option {
            display: flex;
            align-items: center;
            gap: var(--space-md);
            padding: var(--space-md);
            background: var(--glass-bg);
            border: 2px solid var(--glass-border);
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        @media (max-width: 600px) {
            .quiz-option {
                border: none;
                border-radius: 0;
                border-left: 4px solid transparent;
                padding: var(--space-md) 16px;
            }
        }
        .quiz-option:hover:not(.disabled) {
            border-color: var(--gold);
            background: var(--bg-card);
        }
        @media (max-width: 600px) {
            .quiz-option:hover:not(.disabled) {
                border-left-color: var(--gold);
            }
        }
        .quiz-option.correct {
            border-color: var(--success) !important;
            background: rgba(0, 200, 83, 0.15) !important;
        }
        @media (max-width: 600px) {
            .quiz-option.correct {
                border-left-color: var(--success) !important;
            }
        }
        .quiz-option.incorrect {
            border-color: var(--error) !important;
            background: rgba(255, 82, 82, 0.15) !important;
        }
        @media (max-width: 600px) {
            .quiz-option.incorrect {
                border-left-color: var(--error) !important;
            }
        }
        .quiz-option.disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        .option-marker {
            width: 28px;
            height: 28px;
            min-width: 28px;
            background: var(--glass-bg);
            border: 2px solid var(--glass-border);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.85rem;
        }
        .quiz-option.correct .option-marker {
            background: var(--success);
            border-color: var(--success);
            color: white;
        }
        .quiz-option.incorrect .option-marker {
            background: var(--error);
            border-color: var(--error);
            color: white;
        }
        .option-text { flex: 1; color: var(--text-secondary); }

        .question-feedback {
            margin-top: var(--space-md);
            padding: var(--space-md);
            border-radius: var(--space-sm);
            display: none;
        }
        .question-feedback.show { display: block; }
        .question-feedback.correct {
            background: rgba(0, 200, 83, 0.15);
            border-left: 4px solid var(--success);
        }
        .question-feedback.incorrect {
            background: rgba(255, 82, 82, 0.15);
            border-left: 4px solid var(--error);
        }
        .feedback-title { font-weight: 700; margin-bottom: var(--space-xs); }
        .question-feedback.correct .feedback-title { color: var(--success); }
        .question-feedback.incorrect .feedback-title { color: var(--error); }
        .feedback-text { font-size: 0.9rem; color: var(--text-secondary); }

        .quiz-result {
            text-align: center;
            padding: var(--space-xl);
            display: none;
        }
        .quiz-result.show { display: block; }
        .result-score {
            font-size: 3rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--gold), var(--gold));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: var(--space-md);
        }

        .quiz-buttons {
            display: flex;
            justify-content: center;
            padding: var(--space-lg);
        }
        @media (max-width: 600px) {
            .quiz-buttons { padding: var(--space-lg) 16px; }
        }
        .quiz-btn {
            padding: var(--space-md) var(--space-xl);
            border-radius: var(--radius-md);
            font-weight: 700;
            cursor: pointer;
            border: none;
            font-family: inherit;
            background: var(--glass-bg);
            color: var(--text-primary);
            border: 2px solid var(--glass-border);
        }
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
                <span>📈</span>
                <span>Bullish Pattern</span>
            </div>
            <div class="lesson-chapter">Chapter 3 - UPU Pattern Mastery</div>
            <h1 class="lesson-title">Cấu Trúc 3 Phases Của UPU</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 3.2</span></div>
                <div class="meta-item"><span>⏱️</span><span>8 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>3 câu quiz</span></div>
            </div>
        </header>

        <section class="section">
            <h2 class="section-title"><span>🎯</span> Mục Tiêu Bài Học</h2>
            <p>Sau khi hoàn thành bài học này, bạn sẽ hiểu rõ cấu trúc 3 phases của pattern UPU và cách nhận diện từng phase.</p>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>💡</span> Nhắc Lại</div>
                <p><strong>UPU = Up-Pause-Up</strong> là pattern tiếp diễn xu hướng tăng, tạo ra LFZ (Low Frequency Zone) - vùng mua tiềm năng.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📊</span> Thống Kê UPU Pattern</h2>
            <p>UPU là một trong những pattern có Win Rate cao nhất trong hệ thống GEM Frequency.</p>

            <div class="stats-grid">
                <div class="stat-card green">
                    <div class="stat-value">71%</div>
                    <div class="stat-label">Win Rate</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">1:2.8</div>
                    <div class="stat-label">R:R</div>
                </div>
                <div class="stat-card gold">
                    <div class="stat-value">4H/1D</div>
                    <div class="stat-label">Best TF</div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>🔄</span> Cấu Trúc 3 Phases</h2>
            <p>Pattern UPU được chia thành 3 giai đoạn rõ ràng. Mỗi phase có đặc điểm riêng cần nắm vững.</p>

            <div class="pattern-flow">
                <div class="flow-phase up">
                    <div class="phase-icon">📈</div>
                    <div class="phase-content">
                        <div class="phase-title">PHASE 1: UP (Tăng)</div>
                        <div class="phase-desc">
                            <strong>Điều kiện:</strong><br>
                            • Ít nhất 2 nến tăng liên tiếp<br>
                            • Tăng ≥2% trong phase này<br>
                            • Volume cao, momentum mạnh<br>
                            • Nến thân lớn, ít bóng
                        </div>
                    </div>
                </div>
                <div class="flow-phase pause">
                    <div class="phase-icon">⏸️</div>
                    <div class="phase-content">
                        <div class="phase-title">PHASE 2: PAUSE (Tích Lũy)</div>
                        <div class="phase-desc">
                            <strong>Điều kiện:</strong><br>
                            • Consolidation 1-5 nến<br>
                            • Range &lt;1.5% (đi ngang)<br>
                            • Thân nhỏ, wicks ngắn<br>
                            • <strong style="color: var(--gold);">→ TẠO LFZ TẠI ĐÂY</strong>
                        </div>
                    </div>
                </div>
                <div class="flow-phase up">
                    <div class="phase-icon">📈</div>
                    <div class="phase-content">
                        <div class="phase-title">PHASE 3: UP (Tiếp Tục Tăng)</div>
                        <div class="phase-desc">
                            <strong>Điều kiện:</strong><br>
                            • Tiếp tục tăng ≥2%<br>
                            • Volume tăng khi breakout<br>
                            • Xác nhận pattern hoàn chỉnh<br>
                            • Nến phá vỡ vùng Pause rõ ràng
                        </div>
                    </div>
                </div>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/10B981?text=UPU+3+Phases+Structure" alt="UPU 3 Phases">
            </div>
            <div class="image-caption">Hình 1: Cấu trúc 3 phases của UPU pattern</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📈</span> Phase 1: UP - Chi Tiết</h2>
            <p>Phase 1 là đợt tăng đầu tiên, thể hiện lực mua mạnh từ Smart Money.</p>

            <div class="definition-box">
                <div class="definition-box-title"><span>📌</span> Đặc Điểm Nhận Diện Phase 1</div>
                <p>
                    <strong>1. Số nến:</strong> Tối thiểu 2 nến tăng liên tiếp<br>
                    <strong>2. Biên độ:</strong> Tăng ≥2% từ đáy đến đỉnh phase<br>
                    <strong>3. Volume:</strong> Cao hơn trung bình (thường 1.5x - 2x)<br>
                    <strong>4. Hình dạng nến:</strong> Thân lớn, bóng ngắn (cho thấy lực mua mạnh)
                </p>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/00C853?text=Phase+1+UP+Detail" alt="Phase 1 Detail">
            </div>
            <div class="image-caption">Hình 2: Chi tiết Phase 1 - Đợt tăng đầu tiên</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>⏸️</span> Phase 2: PAUSE - Vùng Vàng</h2>
            <p>Phase 2 là giai đoạn quan trọng nhất vì đây là nơi hình thành <strong style="color: var(--gold);">LFZ (Low Frequency Zone)</strong>.</p>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>⭐</span> Tại Sao Phase 2 Quan Trọng?</div>
                <p>
                    Vùng Pause là nơi Smart Money tích lũy thêm vị thế mua. Khi giá quay lại kiểm tra vùng này,
                    sẽ có lực mua mạnh từ các lệnh chưa khớp, tạo cơ hội entry tuyệt vời.
                </p>
            </div>

            <ul>
                <li><strong>Số nến:</strong> 1-5 nến (thường 2-3 nến)</li>
                <li><strong>Range:</strong> &lt;1.5% (giá đi ngang trong biên độ hẹp)</li>
                <li><strong>Đặc điểm:</strong> Nến thân nhỏ, có thể có bóng hai đầu</li>
                <li><strong>Volume:</strong> Thường giảm so với Phase 1</li>
            </ul>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/FFBD59?text=Phase+2+PAUSE+LFZ+Formation" alt="Phase 2 LFZ">
            </div>
            <div class="image-caption">Hình 3: Phase 2 - Vùng Pause tạo thành LFZ</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>🚀</span> Phase 3: UP - Xác Nhận Pattern</h2>
            <p>Phase 3 xác nhận pattern UPU hoàn chỉnh khi giá tiếp tục tăng và phá vỡ đỉnh Phase 1.</p>

            <ul>
                <li><strong>Breakout:</strong> Giá phá vỡ đỉnh của vùng Pause</li>
                <li><strong>Volume:</strong> Tăng mạnh khi breakout (xác nhận lực mua)</li>
                <li><strong>Biên độ:</strong> Tiếp tục tăng ≥2%</li>
                <li><strong>Momentum:</strong> Nến thân lớn, đóng cửa gần đỉnh</li>
            </ul>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/00F0FF?text=Phase+3+UP+Breakout" alt="Phase 3 Breakout">
            </div>
            <div class="image-caption">Hình 4: Phase 3 - Xác nhận pattern với breakout</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📋</span> Tổng Hợp So Sánh 3 Phases</h2>

            <div class="stats-grid">
                <div class="stat-card green">
                    <div class="stat-value">≥2%</div>
                    <div class="stat-label">Phase 1 Tăng</div>
                </div>
                <div class="stat-card gold">
                    <div class="stat-value">&lt;1.5%</div>
                    <div class="stat-label">Phase 2 Range</div>
                </div>
                <div class="stat-card green">
                    <div class="stat-value">≥2%</div>
                    <div class="stat-label">Phase 3 Tăng</div>
                </div>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/6A5BFF?text=UPU+Complete+Example+Chart" alt="UPU Complete Example">
            </div>
            <div class="image-caption">Hình 5: Ví dụ hoàn chỉnh UPU pattern trên chart</div>
        </section>

        <div class="summary-box">
            <div class="summary-title"><span>📝</span> Tóm Tắt Bài Học</div>
            <ul class="summary-list">
                <li>UPU có 3 phases: UP → PAUSE → UP (Tăng-Nghỉ-Tăng)</li>
                <li>Phase 1: Tăng ≥2%, volume cao, nến thân lớn</li>
                <li>Phase 2: Range &lt;1.5%, 1-5 nến, tạo LFZ tại đây</li>
                <li>Phase 3: Tiếp tục tăng ≥2%, xác nhận pattern hoàn chỉnh</li>
                <li>LFZ từ Phase 2 là vùng entry tiềm năng khi giá retest</li>
            </ul>
        </div>

        <section class="quiz-section">
            <div class="quiz-header">
                <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>
                <p class="quiz-subtitle">Chọn đáp án để nhận phản hồi ngay lập tức</p>
            </div>

            <div class="quiz-question" data-question="1" data-correct="B">
                <div class="question-number">1</div>
                <div class="question-text">Vùng LFZ trong pattern UPU được tạo ra ở phase nào?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Phase 1 (UP đầu tiên)</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Phase 2 (PAUSE)</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Phase 3 (UP thứ hai)</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Tất cả các phase</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-question" data-question="2" data-correct="C">
                <div class="question-number">2</div>
                <div class="question-text">Điều kiện về range của Phase 2 (PAUSE) là gì?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Range ≥2%</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Range ≥1.5%</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Range &lt;1.5%</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Không có điều kiện</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-question" data-question="3" data-correct="A">
                <div class="question-number">3</div>
                <div class="question-text">Phase 3 được coi là hoàn chỉnh khi nào?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Giá tiếp tục tăng ≥2% với volume cao</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Giá chạm lại vùng Pause</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Giá giảm về đáy Phase 1</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Volume giảm mạnh</span>
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
                    correct: ''✓ Chính xác! LFZ được tạo tại Phase 2 (PAUSE) - vùng tích lũy của Smart Money.'',
                    incorrect: ''✗ Sai! LFZ được tạo tại Phase 2 (PAUSE), không phải phase khác.''
                },
                2: {
                    correct: ''✓ Chính xác! Phase 2 phải có range <1.5% để được coi là vùng tích lũy hợp lệ.'',
                    incorrect: ''✗ Sai! Phase 2 cần có range <1.5% (đi ngang trong biên độ hẹp).''
                },
                3: {
                    correct: ''✓ Chính xác! Phase 3 hoàn chỉnh khi giá tiếp tục tăng ≥2% với volume cao.'',
                    incorrect: ''✗ Sai! Phase 3 xác nhận pattern khi giá tiếp tục tăng ≥2% với volume tăng.''
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
                            scoreDiv.textContent = correctCount + ''/'' + totalQuestions;

                            if (correctCount === totalQuestions) {
                                messageDiv.textContent = ''🎉 Xuất sắc!'';
                            } else if (correctCount >= 2) {
                                messageDiv.textContent = ''👍 Tốt lắm!'';
                            } else {
                                messageDiv.textContent = ''📚 Xem lại bài học nhé!'';
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
                        opt.classList.remove(''correct'', ''incorrect'', ''disabled'');
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
    <title>Bài 3.2: Cấu Trúc 3 Phases Của UPU | GEM Trading Academy</title>

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

        .background-container {
            position: fixed;
            inset: 0;
            z-index: -1;
        }
        .bg-layer-base {
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, var(--navy-dark) 0%, var(--navy) 50%, var(--navy-dark) 100%);
        }
        .orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.3;
        }
        .orb-1 { width: 400px; height: 400px; background: var(--gold); top: -100px; right: -100px; }
        .orb-2 { width: 300px; height: 300px; background: var(--cyan); bottom: 20%; left: -100px; }
        .orb-3 { width: 250px; height: 250px; background: var(--success); bottom: -50px; right: 20%; }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1.5rem;
        }
        @media (max-width: 600px) {
            .lesson-container {
                padding: 0;
            }
        }

        .lesson-header {
            text-align: center;
            padding: var(--space-xl);
            margin-bottom: var(--space-xl);
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            box-shadow: 0 4px 24px rgba(0,0,0,0.2);
        }
        @media (max-width: 600px) {
            .lesson-header {
                padding: var(--space-lg) 16px;
                margin-bottom: 0;
                border: none;
                border-radius: 0;
                box-shadow: none;
                border-bottom: 8px solid var(--bg-primary);
            }
        }
        .lesson-badge {
            display: inline-flex;
            align-items: center;
            gap: var(--space-sm);
            padding: var(--space-sm) var(--space-md);
            background: linear-gradient(135deg, var(--success), var(--cyan));
            border-radius: 50px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: var(--space-md);
            color: var(--navy-dark);
        }
        .lesson-chapter {
            font-size: 0.9rem;
            color: var(--gold);
            font-weight: 600;
            margin-bottom: var(--space-sm);
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .lesson-title {
            font-size: clamp(1.75rem, 5vw, 2.5rem);
            font-weight: 800;
            margin-bottom: var(--space-md);
            background: linear-gradient(135deg, var(--text-primary), var(--gold));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .lesson-meta {
            display: flex;
            justify-content: center;
            gap: var(--space-lg);
            flex-wrap: wrap;
            color: var(--text-muted);
            font-size: 0.85rem;
        }
        .meta-item {
            display: flex;
            align-items: center;
            gap: var(--space-xs);
        }

        .section {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            box-shadow: 0 4px 24px rgba(0,0,0,0.2);
            padding: var(--space-xl);
            margin-bottom: var(--space-lg);
        }
        @media (max-width: 600px) {
            .section {
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-radius: 0;
                box-shadow: none;
                border-bottom: 8px solid var(--bg-primary);
            }
        }

        .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--gold);
            margin-bottom: var(--space-lg);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }
        @media (max-width: 600px) {
            .section-title {
                padding: var(--space-lg) 16px var(--space-md) 16px;
                margin-bottom: 0;
            }
        }

        .section > p {
            color: var(--text-secondary);
            margin-bottom: var(--space-md);
        }
        @media (max-width: 600px) {
            .section > p {
                padding: 0 16px;
            }
        }

        .section > ul, .section > ol {
            color: var(--text-secondary);
            padding-left: 1.5em;
            margin-bottom: var(--space-md);
        }
        @media (max-width: 600px) {
            .section > ul, .section > ol {
                padding-left: calc(16px + 1.5em);
                padding-right: 16px;
            }
        }
        .section li { margin-bottom: var(--space-sm); }

        .highlight-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15), rgba(255, 189, 89, 0.05));
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .highlight-box {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--gold);
                padding: var(--space-md) 16px;
                margin: var(--space-md) 0;
            }
        }
        .highlight-box-title {
            font-weight: 700;
            color: var(--gold);
            margin-bottom: var(--space-sm);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }
        .highlight-box p { color: var(--text-secondary); margin: 0; }

        .definition-box {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.02));
            border: 1px solid rgba(0, 240, 255, 0.2);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .definition-box {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--cyan);
                padding: var(--space-md) 16px;
                margin: var(--space-md) 0;
            }
        }
        .definition-box-title {
            font-weight: 700;
            color: var(--cyan);
            margin-bottom: var(--space-sm);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }

        .image-container {
            margin: var(--space-xl) 0;
            border-radius: var(--radius-md);
            overflow: hidden;
            border: 1px solid var(--glass-border);
        }
        @media (max-width: 600px) {
            .image-container {
                margin: var(--space-md) 0;
                border-radius: 0;
                border: none;
            }
        }
        .image-caption {
            padding: var(--space-sm);
            font-size: 0.85rem;
            color: var(--text-muted);
            font-style: italic;
            text-align: center;
        }
        @media (max-width: 600px) {
            .image-caption {
                padding: var(--space-sm) 16px;
            }
        }

        .pattern-flow {
            display: flex;
            flex-direction: column;
            gap: var(--space-md);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .pattern-flow {
                gap: 1px;
                background: var(--glass-border);
                margin: var(--space-md) 0;
            }
        }
        .flow-phase {
            display: flex;
            gap: var(--space-md);
            align-items: flex-start;
            padding: var(--space-md);
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            transition: all 0.3s ease;
        }
        @media (max-width: 600px) {
            .flow-phase {
                padding: var(--space-md) 16px;
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--gold);
            }
        }
        .flow-phase.up { border-left-color: var(--success); }
        .flow-phase.pause { border-left-color: var(--gold); }
        .phase-icon {
            font-size: 2rem;
            min-width: 50px;
            text-align: center;
        }
        .phase-content { flex: 1; }
        .phase-title {
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: var(--space-xs);
        }
        .flow-phase.up .phase-title { color: var(--success); }
        .flow-phase.pause .phase-title { color: var(--gold); }
        .phase-desc {
            font-size: 0.9rem;
            color: var(--text-muted);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: var(--space-md);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .stats-grid {
                gap: 1px;
                background: var(--glass-border);
                margin: var(--space-md) 0;
            }
        }
        .stat-card {
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            text-align: center;
        }
        @media (max-width: 600px) {
            .stat-card {
                border: none;
                border-radius: 0;
                padding: var(--space-md);
            }
        }
        .stat-value {
            font-size: 1.75rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--cyan), var(--cyan));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        @media (max-width: 600px) {
            .stat-value { font-size: 1.25rem; }
        }
        .stat-label {
            font-size: 0.75rem;
            color: var(--text-muted);
            text-transform: uppercase;
        }
        .stat-card.green .stat-value {
            background: linear-gradient(135deg, var(--success), var(--success));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .stat-card.gold .stat-value {
            background: linear-gradient(135deg, var(--gold), var(--gold));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .summary-box {
            background: linear-gradient(135deg, rgba(0, 200, 83, 0.1), rgba(0, 200, 83, 0.02));
            border: 2px solid var(--success);
            border-radius: var(--radius-lg);
            padding: var(--space-xl);
            margin: var(--space-xl) 0;
        }
        @media (max-width: 600px) {
            .summary-box {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--success);
                padding: var(--space-lg) 16px;
                margin: var(--space-md) 0;
            }
        }
        .summary-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--success);
            margin-bottom: var(--space-lg);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }
        .summary-list { list-style: none; }
        .summary-list li {
            display: flex;
            align-items: flex-start;
            gap: var(--space-sm);
            margin-bottom: var(--space-md);
            color: var(--text-secondary);
        }
        .summary-list li::before {
            content: "✓";
            color: var(--success);
            font-weight: 700;
        }

        .quiz-section {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            padding: var(--space-xl);
            margin-top: var(--space-xl);
        }
        @media (max-width: 600px) {
            .quiz-section {
                border: none;
                border-radius: 0;
                padding: 0;
                margin-top: 0;
                border-top: 8px solid var(--bg-primary);
            }
        }
        .quiz-header {
            text-align: center;
            margin-bottom: var(--space-xl);
        }
        @media (max-width: 600px) {
            .quiz-header {
                padding: var(--space-lg) 16px var(--space-md);
                margin-bottom: 0;
            }
        }
        .quiz-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--gold);
            margin-bottom: var(--space-sm);
        }
        .quiz-subtitle { color: var(--text-muted); font-size: 0.9rem; }

        .quiz-question {
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            margin-bottom: var(--space-lg);
        }
        @media (max-width: 600px) {
            .quiz-question {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--purple);
                padding: var(--space-md) 16px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--glass-border);
            }
        }
        .question-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, var(--gold), var(--gold-dark));
            border-radius: 50%;
            font-weight: 700;
            color: var(--navy-dark);
            margin-bottom: var(--space-md);
        }
        .question-text {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--space-lg);
            line-height: 1.6;
        }

        .quiz-options {
            display: flex;
            flex-direction: column;
            gap: var(--space-sm);
        }
        @media (max-width: 600px) {
            .quiz-options {
                gap: 1px;
                background: var(--glass-border);
                margin-left: -16px;
                margin-right: -16px;
                margin-left: calc(-16px - 4px);
            }
        }
        .quiz-option {
            display: flex;
            align-items: center;
            gap: var(--space-md);
            padding: var(--space-md);
            background: var(--glass-bg);
            border: 2px solid var(--glass-border);
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        @media (max-width: 600px) {
            .quiz-option {
                border: none;
                border-radius: 0;
                border-left: 4px solid transparent;
                padding: var(--space-md) 16px;
            }
        }
        .quiz-option:hover:not(.disabled) {
            border-color: var(--gold);
            background: var(--bg-card);
        }
        @media (max-width: 600px) {
            .quiz-option:hover:not(.disabled) {
                border-left-color: var(--gold);
            }
        }
        .quiz-option.correct {
            border-color: var(--success) !important;
            background: rgba(0, 200, 83, 0.15) !important;
        }
        @media (max-width: 600px) {
            .quiz-option.correct {
                border-left-color: var(--success) !important;
            }
        }
        .quiz-option.incorrect {
            border-color: var(--error) !important;
            background: rgba(255, 82, 82, 0.15) !important;
        }
        @media (max-width: 600px) {
            .quiz-option.incorrect {
                border-left-color: var(--error) !important;
            }
        }
        .quiz-option.disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        .option-marker {
            width: 28px;
            height: 28px;
            min-width: 28px;
            background: var(--glass-bg);
            border: 2px solid var(--glass-border);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.85rem;
        }
        .quiz-option.correct .option-marker {
            background: var(--success);
            border-color: var(--success);
            color: white;
        }
        .quiz-option.incorrect .option-marker {
            background: var(--error);
            border-color: var(--error);
            color: white;
        }
        .option-text { flex: 1; color: var(--text-secondary); }

        .question-feedback {
            margin-top: var(--space-md);
            padding: var(--space-md);
            border-radius: var(--space-sm);
            display: none;
        }
        .question-feedback.show { display: block; }
        .question-feedback.correct {
            background: rgba(0, 200, 83, 0.15);
            border-left: 4px solid var(--success);
        }
        .question-feedback.incorrect {
            background: rgba(255, 82, 82, 0.15);
            border-left: 4px solid var(--error);
        }
        .feedback-title { font-weight: 700; margin-bottom: var(--space-xs); }
        .question-feedback.correct .feedback-title { color: var(--success); }
        .question-feedback.incorrect .feedback-title { color: var(--error); }
        .feedback-text { font-size: 0.9rem; color: var(--text-secondary); }

        .quiz-result {
            text-align: center;
            padding: var(--space-xl);
            display: none;
        }
        .quiz-result.show { display: block; }
        .result-score {
            font-size: 3rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--gold), var(--gold));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: var(--space-md);
        }

        .quiz-buttons {
            display: flex;
            justify-content: center;
            padding: var(--space-lg);
        }
        @media (max-width: 600px) {
            .quiz-buttons { padding: var(--space-lg) 16px; }
        }
        .quiz-btn {
            padding: var(--space-md) var(--space-xl);
            border-radius: var(--radius-md);
            font-weight: 700;
            cursor: pointer;
            border: none;
            font-family: inherit;
            background: var(--glass-bg);
            color: var(--text-primary);
            border: 2px solid var(--glass-border);
        }
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
                <span>📈</span>
                <span>Bullish Pattern</span>
            </div>
            <div class="lesson-chapter">Chapter 3 - UPU Pattern Mastery</div>
            <h1 class="lesson-title">Cấu Trúc 3 Phases Của UPU</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 3.2</span></div>
                <div class="meta-item"><span>⏱️</span><span>8 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>3 câu quiz</span></div>
            </div>
        </header>

        <section class="section">
            <h2 class="section-title"><span>🎯</span> Mục Tiêu Bài Học</h2>
            <p>Sau khi hoàn thành bài học này, bạn sẽ hiểu rõ cấu trúc 3 phases của pattern UPU và cách nhận diện từng phase.</p>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>💡</span> Nhắc Lại</div>
                <p><strong>UPU = Up-Pause-Up</strong> là pattern tiếp diễn xu hướng tăng, tạo ra LFZ (Low Frequency Zone) - vùng mua tiềm năng.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📊</span> Thống Kê UPU Pattern</h2>
            <p>UPU là một trong những pattern có Win Rate cao nhất trong hệ thống GEM Frequency.</p>

            <div class="stats-grid">
                <div class="stat-card green">
                    <div class="stat-value">71%</div>
                    <div class="stat-label">Win Rate</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">1:2.8</div>
                    <div class="stat-label">R:R</div>
                </div>
                <div class="stat-card gold">
                    <div class="stat-value">4H/1D</div>
                    <div class="stat-label">Best TF</div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>🔄</span> Cấu Trúc 3 Phases</h2>
            <p>Pattern UPU được chia thành 3 giai đoạn rõ ràng. Mỗi phase có đặc điểm riêng cần nắm vững.</p>

            <div class="pattern-flow">
                <div class="flow-phase up">
                    <div class="phase-icon">📈</div>
                    <div class="phase-content">
                        <div class="phase-title">PHASE 1: UP (Tăng)</div>
                        <div class="phase-desc">
                            <strong>Điều kiện:</strong><br>
                            • Ít nhất 2 nến tăng liên tiếp<br>
                            • Tăng ≥2% trong phase này<br>
                            • Volume cao, momentum mạnh<br>
                            • Nến thân lớn, ít bóng
                        </div>
                    </div>
                </div>
                <div class="flow-phase pause">
                    <div class="phase-icon">⏸️</div>
                    <div class="phase-content">
                        <div class="phase-title">PHASE 2: PAUSE (Tích Lũy)</div>
                        <div class="phase-desc">
                            <strong>Điều kiện:</strong><br>
                            • Consolidation 1-5 nến<br>
                            • Range &lt;1.5% (đi ngang)<br>
                            • Thân nhỏ, wicks ngắn<br>
                            • <strong style="color: var(--gold);">→ TẠO LFZ TẠI ĐÂY</strong>
                        </div>
                    </div>
                </div>
                <div class="flow-phase up">
                    <div class="phase-icon">📈</div>
                    <div class="phase-content">
                        <div class="phase-title">PHASE 3: UP (Tiếp Tục Tăng)</div>
                        <div class="phase-desc">
                            <strong>Điều kiện:</strong><br>
                            • Tiếp tục tăng ≥2%<br>
                            • Volume tăng khi breakout<br>
                            • Xác nhận pattern hoàn chỉnh<br>
                            • Nến phá vỡ vùng Pause rõ ràng
                        </div>
                    </div>
                </div>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/10B981?text=UPU+3+Phases+Structure" alt="UPU 3 Phases">
            </div>
            <div class="image-caption">Hình 1: Cấu trúc 3 phases của UPU pattern</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📈</span> Phase 1: UP - Chi Tiết</h2>
            <p>Phase 1 là đợt tăng đầu tiên, thể hiện lực mua mạnh từ Smart Money.</p>

            <div class="definition-box">
                <div class="definition-box-title"><span>📌</span> Đặc Điểm Nhận Diện Phase 1</div>
                <p>
                    <strong>1. Số nến:</strong> Tối thiểu 2 nến tăng liên tiếp<br>
                    <strong>2. Biên độ:</strong> Tăng ≥2% từ đáy đến đỉnh phase<br>
                    <strong>3. Volume:</strong> Cao hơn trung bình (thường 1.5x - 2x)<br>
                    <strong>4. Hình dạng nến:</strong> Thân lớn, bóng ngắn (cho thấy lực mua mạnh)
                </p>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/00C853?text=Phase+1+UP+Detail" alt="Phase 1 Detail">
            </div>
            <div class="image-caption">Hình 2: Chi tiết Phase 1 - Đợt tăng đầu tiên</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>⏸️</span> Phase 2: PAUSE - Vùng Vàng</h2>
            <p>Phase 2 là giai đoạn quan trọng nhất vì đây là nơi hình thành <strong style="color: var(--gold);">LFZ (Low Frequency Zone)</strong>.</p>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>⭐</span> Tại Sao Phase 2 Quan Trọng?</div>
                <p>
                    Vùng Pause là nơi Smart Money tích lũy thêm vị thế mua. Khi giá quay lại kiểm tra vùng này,
                    sẽ có lực mua mạnh từ các lệnh chưa khớp, tạo cơ hội entry tuyệt vời.
                </p>
            </div>

            <ul>
                <li><strong>Số nến:</strong> 1-5 nến (thường 2-3 nến)</li>
                <li><strong>Range:</strong> &lt;1.5% (giá đi ngang trong biên độ hẹp)</li>
                <li><strong>Đặc điểm:</strong> Nến thân nhỏ, có thể có bóng hai đầu</li>
                <li><strong>Volume:</strong> Thường giảm so với Phase 1</li>
            </ul>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/FFBD59?text=Phase+2+PAUSE+LFZ+Formation" alt="Phase 2 LFZ">
            </div>
            <div class="image-caption">Hình 3: Phase 2 - Vùng Pause tạo thành LFZ</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>🚀</span> Phase 3: UP - Xác Nhận Pattern</h2>
            <p>Phase 3 xác nhận pattern UPU hoàn chỉnh khi giá tiếp tục tăng và phá vỡ đỉnh Phase 1.</p>

            <ul>
                <li><strong>Breakout:</strong> Giá phá vỡ đỉnh của vùng Pause</li>
                <li><strong>Volume:</strong> Tăng mạnh khi breakout (xác nhận lực mua)</li>
                <li><strong>Biên độ:</strong> Tiếp tục tăng ≥2%</li>
                <li><strong>Momentum:</strong> Nến thân lớn, đóng cửa gần đỉnh</li>
            </ul>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/00F0FF?text=Phase+3+UP+Breakout" alt="Phase 3 Breakout">
            </div>
            <div class="image-caption">Hình 4: Phase 3 - Xác nhận pattern với breakout</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📋</span> Tổng Hợp So Sánh 3 Phases</h2>

            <div class="stats-grid">
                <div class="stat-card green">
                    <div class="stat-value">≥2%</div>
                    <div class="stat-label">Phase 1 Tăng</div>
                </div>
                <div class="stat-card gold">
                    <div class="stat-value">&lt;1.5%</div>
                    <div class="stat-label">Phase 2 Range</div>
                </div>
                <div class="stat-card green">
                    <div class="stat-value">≥2%</div>
                    <div class="stat-label">Phase 3 Tăng</div>
                </div>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/6A5BFF?text=UPU+Complete+Example+Chart" alt="UPU Complete Example">
            </div>
            <div class="image-caption">Hình 5: Ví dụ hoàn chỉnh UPU pattern trên chart</div>
        </section>

        <div class="summary-box">
            <div class="summary-title"><span>📝</span> Tóm Tắt Bài Học</div>
            <ul class="summary-list">
                <li>UPU có 3 phases: UP → PAUSE → UP (Tăng-Nghỉ-Tăng)</li>
                <li>Phase 1: Tăng ≥2%, volume cao, nến thân lớn</li>
                <li>Phase 2: Range &lt;1.5%, 1-5 nến, tạo LFZ tại đây</li>
                <li>Phase 3: Tiếp tục tăng ≥2%, xác nhận pattern hoàn chỉnh</li>
                <li>LFZ từ Phase 2 là vùng entry tiềm năng khi giá retest</li>
            </ul>
        </div>

        <section class="quiz-section">
            <div class="quiz-header">
                <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>
                <p class="quiz-subtitle">Chọn đáp án để nhận phản hồi ngay lập tức</p>
            </div>

            <div class="quiz-question" data-question="1" data-correct="B">
                <div class="question-number">1</div>
                <div class="question-text">Vùng LFZ trong pattern UPU được tạo ra ở phase nào?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Phase 1 (UP đầu tiên)</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Phase 2 (PAUSE)</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Phase 3 (UP thứ hai)</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Tất cả các phase</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-question" data-question="2" data-correct="C">
                <div class="question-number">2</div>
                <div class="question-text">Điều kiện về range của Phase 2 (PAUSE) là gì?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Range ≥2%</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Range ≥1.5%</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Range &lt;1.5%</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Không có điều kiện</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-question" data-question="3" data-correct="A">
                <div class="question-number">3</div>
                <div class="question-text">Phase 3 được coi là hoàn chỉnh khi nào?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Giá tiếp tục tăng ≥2% với volume cao</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Giá chạm lại vùng Pause</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Giá giảm về đáy Phase 1</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Volume giảm mạnh</span>
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
                    correct: ''✓ Chính xác! LFZ được tạo tại Phase 2 (PAUSE) - vùng tích lũy của Smart Money.'',
                    incorrect: ''✗ Sai! LFZ được tạo tại Phase 2 (PAUSE), không phải phase khác.''
                },
                2: {
                    correct: ''✓ Chính xác! Phase 2 phải có range <1.5% để được coi là vùng tích lũy hợp lệ.'',
                    incorrect: ''✗ Sai! Phase 2 cần có range <1.5% (đi ngang trong biên độ hẹp).''
                },
                3: {
                    correct: ''✓ Chính xác! Phase 3 hoàn chỉnh khi giá tiếp tục tăng ≥2% với volume cao.'',
                    incorrect: ''✗ Sai! Phase 3 xác nhận pattern khi giá tiếp tục tăng ≥2% với volume tăng.''
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
                            scoreDiv.textContent = correctCount + ''/'' + totalQuestions;

                            if (correctCount === totalQuestions) {
                                messageDiv.textContent = ''🎉 Xuất sắc!'';
                            } else if (correctCount >= 2) {
                                messageDiv.textContent = ''👍 Tốt lắm!'';
                            } else {
                                messageDiv.textContent = ''📚 Xem lại bài học nhé!'';
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
                        opt.classList.remove(''correct'', ''incorrect'', ''disabled'');
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

-- Lesson 3.3: Cách Vẽ LFZ Từ UPU
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch3-l3',
  'module-tier-1-ch3',
  'course-tier1-trading-foundation',
  'Bài 3.3: Cách Vẽ LFZ Từ UPU',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 3.3: Cách Vẽ LFZ Từ UPU | GEM Trading Academy</title>

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
        .orb-3 { width: 250px; height: 250px; background: var(--success); bottom: -50px; right: 20%; }

        .lesson-container { max-width: 800px; margin: 0 auto; padding: 1.5rem; }
        @media (max-width: 600px) { .lesson-container { padding: 0; } }

        .lesson-header { text-align: center; padding: var(--space-xl); margin-bottom: var(--space-xl); background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); box-shadow: 0 4px 24px rgba(0,0,0,0.2); }
        @media (max-width: 600px) { .lesson-header { padding: var(--space-lg) 16px; margin-bottom: 0; border: none; border-radius: 0; box-shadow: none; border-bottom: 8px solid var(--bg-primary); } }
        .lesson-badge { display: inline-flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); background: linear-gradient(135deg, var(--success), var(--cyan)); border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: var(--space-md); color: var(--navy-dark); }
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

        .section > ul, .section > ol { color: var(--text-secondary); padding-left: 1.5em; margin-bottom: var(--space-md); }
        @media (max-width: 600px) { .section > ul, .section > ol { padding-left: calc(16px + 1.5em); padding-right: 16px; } }
        .section li { margin-bottom: var(--space-sm); }

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
        .flow-step { display: flex; gap: var(--space-md); align-items: flex-start; padding: var(--space-md); background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); transition: all 0.3s ease; }
        @media (max-width: 600px) { .flow-step { padding: var(--space-md) 16px; border: none; border-radius: 0; border-left: 4px solid var(--gold); } }
        .flow-step-number { width: 40px; height: 40px; min-width: 40px; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; color: var(--navy-dark); }
        .flow-step-content { flex: 1; }
        .flow-step-title { font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-xs); }
        .flow-step-desc { font-size: 0.9rem; color: var(--text-muted); }

        .summary-box { background: linear-gradient(135deg, rgba(0, 200, 83, 0.1), rgba(0, 200, 83, 0.02)); border: 2px solid var(--success); border-radius: var(--radius-lg); padding: var(--space-xl); margin: var(--space-xl) 0; }
        @media (max-width: 600px) { .summary-box { border: none; border-radius: 0; border-left: 4px solid var(--success); padding: var(--space-lg) 16px; margin: var(--space-md) 0; } }
        .summary-title { font-size: 1.25rem; font-weight: 700; color: var(--success); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
        .summary-list { list-style: none; }
        .summary-list li { display: flex; align-items: flex-start; gap: var(--space-sm); margin-bottom: var(--space-md); color: var(--text-secondary); }
        .summary-list li::before { content: "✓"; color: var(--success); font-weight: 700; }

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
                <span>📈</span>
                <span>Bullish Pattern</span>
            </div>
            <div class="lesson-chapter">Chapter 3 - UPU Pattern Mastery</div>
            <h1 class="lesson-title">Cách Vẽ LFZ Từ UPU</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 3.3</span></div>
                <div class="meta-item"><span>⏱️</span><span>7 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <section class="section">
            <h2 class="section-title"><span>🎯</span> Mục Tiêu Bài Học</h2>
            <p>Sau khi hoàn thành bài học này, bạn sẽ biết cách vẽ chính xác vùng LFZ từ pattern UPU để xác định điểm entry tiềm năng.</p>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>💡</span> Nhắc Lại</div>
                <p><strong>LFZ (Low Frequency Zone)</strong> là vùng tần số thấp - nơi Smart Money tích lũy lệnh MUA. Khi giá quay lại vùng này, sẽ có lực mua mạnh.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📐</span> Quy Trình Vẽ LFZ - 4 Bước</h2>
            <p>Vẽ LFZ từ UPU tuân theo quy trình 4 bước chuẩn.</p>

            <div class="flow-steps">
                <div class="flow-step">
                    <div class="flow-step-number">1</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Xác Định Vùng PAUSE</div>
                        <div class="flow-step-desc">Tìm Phase 2 của UPU pattern - vùng consolidation 1-5 nến với range &lt;1.5%.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">2</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Xác Định Giá Entry (Đỉnh Zone)</div>
                        <div class="flow-step-desc">Giá Entry = Đỉnh của vùng Pause (điểm gần giá hiện tại nhất khi giá retest).</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">3</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Xác Định Giá Stop (Đáy Zone)</div>
                        <div class="flow-step-desc">Giá Stop = Đáy của vùng Pause (điểm xa giá hiện tại nhất).</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">4</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Vẽ Rectangle Box</div>
                        <div class="flow-step-desc">Vẽ hình chữ nhật từ Entry đến Stop, kéo dài về bên phải (zone chưa hết hạn).</div>
                    </div>
                </div>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/10B981?text=LFZ+Drawing+Steps" alt="LFZ Drawing Steps">
            </div>
            <div class="image-caption">Hình 1: Quy trình 4 bước vẽ LFZ từ UPU</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📍</span> Chi Tiết: Entry và Stop</h2>
            <p>Hiểu rõ cách xác định Entry và Stop là chìa khóa để vẽ zone chính xác.</p>

            <div class="definition-box">
                <div class="definition-box-title"><span>📌</span> Giá Entry (Đỉnh Zone)</div>
                <p>
                    <strong>Đỉnh Zone = Giá cao nhất của vùng Pause</strong><br><br>
                    Đây là điểm đầu tiên giá sẽ chạm khi retest từ trên xuống. Entry được đặt tại hoặc gần mức này.
                </p>
            </div>

            <div class="definition-box">
                <div class="definition-box-title"><span>🛑</span> Giá Stop (Đáy Zone)</div>
                <p>
                    <strong>Đáy Zone = Giá thấp nhất của vùng Pause</strong><br><br>
                    Stop Loss đặt dưới đáy zone + buffer 0.5% để tránh bị quét bởi spike.
                </p>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/00F0FF?text=Entry+and+Stop+Levels" alt="Entry and Stop">
            </div>
            <div class="image-caption">Hình 2: Vị trí Entry và Stop Loss trong LFZ</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📏</span> Độ Dày của Zone</h2>
            <p>Độ dày zone ảnh hưởng đến R:R và xác suất thành công.</p>

            <ul>
                <li><strong>Zone mỏng (0.5-1%):</strong> R:R cao hơn, nhưng dễ bị phá vỡ</li>
                <li><strong>Zone vừa (1-1.5%):</strong> Cân bằng giữa R:R và độ tin cậy</li>
                <li><strong>Zone dày (&gt;1.5%):</strong> Cần tránh vì không đạt tiêu chuẩn Pause</li>
            </ul>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>⭐</span> Zone Lý Tưởng</div>
                <p>Zone tốt nhất có độ dày từ <strong>0.5% - 1.5%</strong>, tương ứng với vùng Pause hợp lệ của UPU pattern.</p>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/FFBD59?text=Zone+Thickness+Examples" alt="Zone Thickness">
            </div>
            <div class="image-caption">Hình 3: So sánh độ dày zone khác nhau</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>🔧</span> Thực Hành Trên TradingView</h2>
            <p>Các bước vẽ LFZ trên TradingView:</p>

            <ol>
                <li>Xác định UPU pattern hoàn chỉnh trên chart</li>
                <li>Chọn công cụ <strong>Rectangle</strong> từ thanh công cụ</li>
                <li>Click vào đỉnh của vùng Pause</li>
                <li>Kéo xuống đáy của vùng Pause</li>
                <li>Kéo dài rectangle sang phải</li>
                <li>Đổi màu zone thành <strong>màu xanh lá</strong> (quy ước cho LFZ)</li>
            </ol>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/6A5BFF?text=TradingView+LFZ+Drawing" alt="TradingView Drawing">
            </div>
            <div class="image-caption">Hình 4: Hướng dẫn vẽ LFZ trên TradingView</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>⚠️</span> Lỗi Thường Gặp Khi Vẽ LFZ</h2>

            <div class="warning-box">
                <div class="warning-box-title"><span>❌</span> Lỗi 1: Vẽ Sai Vùng Pause</div>
                <p>Vẽ vùng bao gồm cả Phase 1 hoặc Phase 3, thay vì chỉ Phase 2. Zone phải chỉ bao gồm các nến consolidation.</p>
            </div>

            <div class="warning-box">
                <div class="warning-box-title"><span>❌</span> Lỗi 2: Zone Quá Dày</div>
                <p>Vùng Pause có range &gt;1.5% không phải là consolidation hợp lệ. Nên bỏ qua những pattern như vậy.</p>
            </div>

            <div class="warning-box">
                <div class="warning-box-title"><span>❌</span> Lỗi 3: Không Buffer Stop Loss</div>
                <p>Đặt Stop Loss ngay tại đáy zone mà không thêm buffer 0.5%, dễ bị quét bởi spike.</p>
            </div>
        </section>

        <div class="summary-box">
            <div class="summary-title"><span>📝</span> Tóm Tắt Bài Học</div>
            <ul class="summary-list">
                <li>LFZ được vẽ từ vùng Pause (Phase 2) của UPU pattern</li>
                <li>Entry = Đỉnh của vùng Pause (gần giá hiện tại)</li>
                <li>Stop = Đáy của vùng Pause + buffer 0.5%</li>
                <li>Độ dày zone lý tưởng: 0.5% - 1.5%</li>
                <li>Sử dụng màu xanh lá để đánh dấu LFZ trên chart</li>
            </ul>
        </div>

        <section class="quiz-section">
            <div class="quiz-header">
                <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>
                <p class="quiz-subtitle">Chọn đáp án để nhận phản hồi ngay lập tức</p>
            </div>

            <div class="quiz-question" data-question="1" data-correct="A">
                <div class="question-number">1</div>
                <div class="question-text">Giá Entry của LFZ trong UPU được xác định ở đâu?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Đỉnh của vùng Pause (gần giá hiện tại)</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Đáy của vùng Pause</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Đỉnh của Phase 1</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Đáy của Phase 3</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-question" data-question="2" data-correct="C">
                <div class="question-number">2</div>
                <div class="question-text">Stop Loss nên đặt ở đâu khi trade LFZ?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Ngay tại đỉnh LFZ</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Ngay tại đáy LFZ</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Dưới đáy LFZ - 0.5% buffer</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Tại đỉnh Phase 1</span>
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
                    correct: ''✓ Chính xác! Entry đặt tại đỉnh của vùng Pause - điểm đầu tiên giá chạm khi retest.'',
                    incorrect: ''✗ Sai! Entry cho LFZ là đỉnh của vùng Pause (gần giá hiện tại khi retest từ trên xuống).''
                },
                2: {
                    correct: ''✓ Chính xác! Stop Loss đặt dưới đáy LFZ với buffer 0.5% để tránh bị quét.'',
                    incorrect: ''✗ Sai! Stop Loss cần đặt DƯỚI đáy LFZ với buffer 0.5%.''
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
                            scoreDiv.textContent = correctCount + ''/'' + totalQuestions;

                            if (correctCount === totalQuestions) {
                                messageDiv.textContent = ''🎉 Xuất sắc!'';
                            } else if (correctCount >= 1) {
                                messageDiv.textContent = ''👍 Tốt lắm!'';
                            } else {
                                messageDiv.textContent = ''📚 Xem lại bài học nhé!'';
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
                        opt.classList.remove(''correct'', ''incorrect'', ''disabled'');
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
    <title>Bài 3.3: Cách Vẽ LFZ Từ UPU | GEM Trading Academy</title>

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
        .orb-3 { width: 250px; height: 250px; background: var(--success); bottom: -50px; right: 20%; }

        .lesson-container { max-width: 800px; margin: 0 auto; padding: 1.5rem; }
        @media (max-width: 600px) { .lesson-container { padding: 0; } }

        .lesson-header { text-align: center; padding: var(--space-xl); margin-bottom: var(--space-xl); background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); box-shadow: 0 4px 24px rgba(0,0,0,0.2); }
        @media (max-width: 600px) { .lesson-header { padding: var(--space-lg) 16px; margin-bottom: 0; border: none; border-radius: 0; box-shadow: none; border-bottom: 8px solid var(--bg-primary); } }
        .lesson-badge { display: inline-flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); background: linear-gradient(135deg, var(--success), var(--cyan)); border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: var(--space-md); color: var(--navy-dark); }
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

        .section > ul, .section > ol { color: var(--text-secondary); padding-left: 1.5em; margin-bottom: var(--space-md); }
        @media (max-width: 600px) { .section > ul, .section > ol { padding-left: calc(16px + 1.5em); padding-right: 16px; } }
        .section li { margin-bottom: var(--space-sm); }

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
        .flow-step { display: flex; gap: var(--space-md); align-items: flex-start; padding: var(--space-md); background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); transition: all 0.3s ease; }
        @media (max-width: 600px) { .flow-step { padding: var(--space-md) 16px; border: none; border-radius: 0; border-left: 4px solid var(--gold); } }
        .flow-step-number { width: 40px; height: 40px; min-width: 40px; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; color: var(--navy-dark); }
        .flow-step-content { flex: 1; }
        .flow-step-title { font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-xs); }
        .flow-step-desc { font-size: 0.9rem; color: var(--text-muted); }

        .summary-box { background: linear-gradient(135deg, rgba(0, 200, 83, 0.1), rgba(0, 200, 83, 0.02)); border: 2px solid var(--success); border-radius: var(--radius-lg); padding: var(--space-xl); margin: var(--space-xl) 0; }
        @media (max-width: 600px) { .summary-box { border: none; border-radius: 0; border-left: 4px solid var(--success); padding: var(--space-lg) 16px; margin: var(--space-md) 0; } }
        .summary-title { font-size: 1.25rem; font-weight: 700; color: var(--success); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
        .summary-list { list-style: none; }
        .summary-list li { display: flex; align-items: flex-start; gap: var(--space-sm); margin-bottom: var(--space-md); color: var(--text-secondary); }
        .summary-list li::before { content: "✓"; color: var(--success); font-weight: 700; }

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
                <span>📈</span>
                <span>Bullish Pattern</span>
            </div>
            <div class="lesson-chapter">Chapter 3 - UPU Pattern Mastery</div>
            <h1 class="lesson-title">Cách Vẽ LFZ Từ UPU</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 3.3</span></div>
                <div class="meta-item"><span>⏱️</span><span>7 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <section class="section">
            <h2 class="section-title"><span>🎯</span> Mục Tiêu Bài Học</h2>
            <p>Sau khi hoàn thành bài học này, bạn sẽ biết cách vẽ chính xác vùng LFZ từ pattern UPU để xác định điểm entry tiềm năng.</p>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>💡</span> Nhắc Lại</div>
                <p><strong>LFZ (Low Frequency Zone)</strong> là vùng tần số thấp - nơi Smart Money tích lũy lệnh MUA. Khi giá quay lại vùng này, sẽ có lực mua mạnh.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📐</span> Quy Trình Vẽ LFZ - 4 Bước</h2>
            <p>Vẽ LFZ từ UPU tuân theo quy trình 4 bước chuẩn.</p>

            <div class="flow-steps">
                <div class="flow-step">
                    <div class="flow-step-number">1</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Xác Định Vùng PAUSE</div>
                        <div class="flow-step-desc">Tìm Phase 2 của UPU pattern - vùng consolidation 1-5 nến với range &lt;1.5%.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">2</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Xác Định Giá Entry (Đỉnh Zone)</div>
                        <div class="flow-step-desc">Giá Entry = Đỉnh của vùng Pause (điểm gần giá hiện tại nhất khi giá retest).</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">3</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Xác Định Giá Stop (Đáy Zone)</div>
                        <div class="flow-step-desc">Giá Stop = Đáy của vùng Pause (điểm xa giá hiện tại nhất).</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">4</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Vẽ Rectangle Box</div>
                        <div class="flow-step-desc">Vẽ hình chữ nhật từ Entry đến Stop, kéo dài về bên phải (zone chưa hết hạn).</div>
                    </div>
                </div>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/10B981?text=LFZ+Drawing+Steps" alt="LFZ Drawing Steps">
            </div>
            <div class="image-caption">Hình 1: Quy trình 4 bước vẽ LFZ từ UPU</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📍</span> Chi Tiết: Entry và Stop</h2>
            <p>Hiểu rõ cách xác định Entry và Stop là chìa khóa để vẽ zone chính xác.</p>

            <div class="definition-box">
                <div class="definition-box-title"><span>📌</span> Giá Entry (Đỉnh Zone)</div>
                <p>
                    <strong>Đỉnh Zone = Giá cao nhất của vùng Pause</strong><br><br>
                    Đây là điểm đầu tiên giá sẽ chạm khi retest từ trên xuống. Entry được đặt tại hoặc gần mức này.
                </p>
            </div>

            <div class="definition-box">
                <div class="definition-box-title"><span>🛑</span> Giá Stop (Đáy Zone)</div>
                <p>
                    <strong>Đáy Zone = Giá thấp nhất của vùng Pause</strong><br><br>
                    Stop Loss đặt dưới đáy zone + buffer 0.5% để tránh bị quét bởi spike.
                </p>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/00F0FF?text=Entry+and+Stop+Levels" alt="Entry and Stop">
            </div>
            <div class="image-caption">Hình 2: Vị trí Entry và Stop Loss trong LFZ</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📏</span> Độ Dày của Zone</h2>
            <p>Độ dày zone ảnh hưởng đến R:R và xác suất thành công.</p>

            <ul>
                <li><strong>Zone mỏng (0.5-1%):</strong> R:R cao hơn, nhưng dễ bị phá vỡ</li>
                <li><strong>Zone vừa (1-1.5%):</strong> Cân bằng giữa R:R và độ tin cậy</li>
                <li><strong>Zone dày (&gt;1.5%):</strong> Cần tránh vì không đạt tiêu chuẩn Pause</li>
            </ul>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>⭐</span> Zone Lý Tưởng</div>
                <p>Zone tốt nhất có độ dày từ <strong>0.5% - 1.5%</strong>, tương ứng với vùng Pause hợp lệ của UPU pattern.</p>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/FFBD59?text=Zone+Thickness+Examples" alt="Zone Thickness">
            </div>
            <div class="image-caption">Hình 3: So sánh độ dày zone khác nhau</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>🔧</span> Thực Hành Trên TradingView</h2>
            <p>Các bước vẽ LFZ trên TradingView:</p>

            <ol>
                <li>Xác định UPU pattern hoàn chỉnh trên chart</li>
                <li>Chọn công cụ <strong>Rectangle</strong> từ thanh công cụ</li>
                <li>Click vào đỉnh của vùng Pause</li>
                <li>Kéo xuống đáy của vùng Pause</li>
                <li>Kéo dài rectangle sang phải</li>
                <li>Đổi màu zone thành <strong>màu xanh lá</strong> (quy ước cho LFZ)</li>
            </ol>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/6A5BFF?text=TradingView+LFZ+Drawing" alt="TradingView Drawing">
            </div>
            <div class="image-caption">Hình 4: Hướng dẫn vẽ LFZ trên TradingView</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>⚠️</span> Lỗi Thường Gặp Khi Vẽ LFZ</h2>

            <div class="warning-box">
                <div class="warning-box-title"><span>❌</span> Lỗi 1: Vẽ Sai Vùng Pause</div>
                <p>Vẽ vùng bao gồm cả Phase 1 hoặc Phase 3, thay vì chỉ Phase 2. Zone phải chỉ bao gồm các nến consolidation.</p>
            </div>

            <div class="warning-box">
                <div class="warning-box-title"><span>❌</span> Lỗi 2: Zone Quá Dày</div>
                <p>Vùng Pause có range &gt;1.5% không phải là consolidation hợp lệ. Nên bỏ qua những pattern như vậy.</p>
            </div>

            <div class="warning-box">
                <div class="warning-box-title"><span>❌</span> Lỗi 3: Không Buffer Stop Loss</div>
                <p>Đặt Stop Loss ngay tại đáy zone mà không thêm buffer 0.5%, dễ bị quét bởi spike.</p>
            </div>
        </section>

        <div class="summary-box">
            <div class="summary-title"><span>📝</span> Tóm Tắt Bài Học</div>
            <ul class="summary-list">
                <li>LFZ được vẽ từ vùng Pause (Phase 2) của UPU pattern</li>
                <li>Entry = Đỉnh của vùng Pause (gần giá hiện tại)</li>
                <li>Stop = Đáy của vùng Pause + buffer 0.5%</li>
                <li>Độ dày zone lý tưởng: 0.5% - 1.5%</li>
                <li>Sử dụng màu xanh lá để đánh dấu LFZ trên chart</li>
            </ul>
        </div>

        <section class="quiz-section">
            <div class="quiz-header">
                <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>
                <p class="quiz-subtitle">Chọn đáp án để nhận phản hồi ngay lập tức</p>
            </div>

            <div class="quiz-question" data-question="1" data-correct="A">
                <div class="question-number">1</div>
                <div class="question-text">Giá Entry của LFZ trong UPU được xác định ở đâu?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Đỉnh của vùng Pause (gần giá hiện tại)</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Đáy của vùng Pause</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Đỉnh của Phase 1</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Đáy của Phase 3</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-question" data-question="2" data-correct="C">
                <div class="question-number">2</div>
                <div class="question-text">Stop Loss nên đặt ở đâu khi trade LFZ?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Ngay tại đỉnh LFZ</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Ngay tại đáy LFZ</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Dưới đáy LFZ - 0.5% buffer</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Tại đỉnh Phase 1</span>
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
                    correct: ''✓ Chính xác! Entry đặt tại đỉnh của vùng Pause - điểm đầu tiên giá chạm khi retest.'',
                    incorrect: ''✗ Sai! Entry cho LFZ là đỉnh của vùng Pause (gần giá hiện tại khi retest từ trên xuống).''
                },
                2: {
                    correct: ''✓ Chính xác! Stop Loss đặt dưới đáy LFZ với buffer 0.5% để tránh bị quét.'',
                    incorrect: ''✗ Sai! Stop Loss cần đặt DƯỚI đáy LFZ với buffer 0.5%.''
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
                            scoreDiv.textContent = correctCount + ''/'' + totalQuestions;

                            if (correctCount === totalQuestions) {
                                messageDiv.textContent = ''🎉 Xuất sắc!'';
                            } else if (correctCount >= 1) {
                                messageDiv.textContent = ''👍 Tốt lắm!'';
                            } else {
                                messageDiv.textContent = ''📚 Xem lại bài học nhé!'';
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
                        opt.classList.remove(''correct'', ''incorrect'', ''disabled'');
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

-- Lesson 3.4: Chiến Lược Entry Cho UPU
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch3-l4',
  'module-tier-1-ch3',
  'course-tier1-trading-foundation',
  'Bài 3.4: Chiến Lược Entry Cho UPU',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 3.4: Chiến Lược Entry Cho UPU | GEM Trading Academy</title>

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

        .background-container {
            position: fixed;
            inset: 0;
            z-index: -1;
        }
        .bg-layer-base {
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, var(--navy-dark) 0%, var(--navy) 50%, var(--navy-dark) 100%);
        }
        .orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.3;
        }
        .orb-1 { width: 400px; height: 400px; background: var(--gold); top: -100px; right: -100px; }
        .orb-2 { width: 300px; height: 300px; background: var(--cyan); bottom: 20%; left: -100px; }
        .orb-3 { width: 250px; height: 250px; background: var(--success); bottom: -50px; right: 20%; }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1.5rem;
        }
        @media (max-width: 600px) {
            .lesson-container {
                padding: 0;
            }
        }

        .lesson-header {
            text-align: center;
            padding: var(--space-xl);
            margin-bottom: var(--space-xl);
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            box-shadow: 0 4px 24px rgba(0,0,0,0.2);
        }
        @media (max-width: 600px) {
            .lesson-header {
                padding: var(--space-lg) 16px;
                margin-bottom: 0;
                border: none;
                border-radius: 0;
                box-shadow: none;
                border-bottom: 8px solid var(--bg-primary);
            }
        }
        .lesson-badge {
            display: inline-flex;
            align-items: center;
            gap: var(--space-sm);
            padding: var(--space-sm) var(--space-md);
            background: linear-gradient(135deg, var(--success), #00A844);
            border-radius: 50px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: var(--space-md);
        }
        .lesson-chapter {
            font-size: 0.9rem;
            color: var(--gold);
            font-weight: 600;
            margin-bottom: var(--space-sm);
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .lesson-title {
            font-size: clamp(1.75rem, 5vw, 2.5rem);
            font-weight: 800;
            margin-bottom: var(--space-md);
            background: linear-gradient(135deg, var(--text-primary), var(--gold));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .lesson-meta {
            display: flex;
            justify-content: center;
            gap: var(--space-lg);
            flex-wrap: wrap;
            color: var(--text-muted);
            font-size: 0.85rem;
        }
        .meta-item {
            display: flex;
            align-items: center;
            gap: var(--space-xs);
        }

        .section {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            box-shadow: 0 4px 24px rgba(0,0,0,0.2);
            padding: var(--space-xl);
            margin-bottom: var(--space-lg);
        }
        @media (max-width: 600px) {
            .section {
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-radius: 0;
                box-shadow: none;
                border-bottom: 8px solid var(--bg-primary);
            }
        }

        .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--gold);
            margin-bottom: var(--space-lg);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }
        @media (max-width: 600px) {
            .section-title {
                padding: var(--space-lg) 16px var(--space-md) 16px;
                margin-bottom: 0;
            }
        }

        .section > p {
            color: var(--text-secondary);
            margin-bottom: var(--space-md);
        }
        @media (max-width: 600px) {
            .section > p {
                padding: 0 16px;
            }
        }

        .section > ul, .section > ol {
            color: var(--text-secondary);
            padding-left: 1.5em;
            margin-bottom: var(--space-md);
        }
        @media (max-width: 600px) {
            .section > ul, .section > ol {
                padding-left: calc(16px + 1.5em);
                padding-right: 16px;
            }
        }
        .section li { margin-bottom: var(--space-sm); }

        .highlight-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15), rgba(255, 189, 89, 0.05));
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .highlight-box {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--gold);
                padding: var(--space-md) 16px;
                margin: var(--space-md) 0;
            }
        }
        .highlight-box-title {
            font-weight: 700;
            color: var(--gold);
            margin-bottom: var(--space-sm);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }
        .highlight-box p { color: var(--text-secondary); margin: 0; }

        .definition-box {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.02));
            border: 1px solid rgba(0, 240, 255, 0.2);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .definition-box {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--cyan);
                padding: var(--space-md) 16px;
                margin: var(--space-md) 0;
            }
        }
        .definition-box-title {
            font-weight: 700;
            color: var(--cyan);
            margin-bottom: var(--space-sm);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }

        .warning-box {
            background: linear-gradient(135deg, rgba(156, 6, 18, 0.2), rgba(156, 6, 18, 0.05));
            border: 1px solid rgba(156, 6, 18, 0.4);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .warning-box {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--burgundy);
                padding: var(--space-md) 16px;
                margin: var(--space-md) 0;
            }
        }
        .warning-box-title {
            font-weight: 700;
            color: var(--burgundy-light);
            margin-bottom: var(--space-sm);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }

        .image-container {
            margin: var(--space-xl) 0;
            border-radius: var(--radius-md);
            overflow: hidden;
            border: 1px solid var(--glass-border);
        }
        @media (max-width: 600px) {
            .image-container {
                margin: var(--space-md) 0;
                border-radius: 0;
                border: none;
            }
        }
        .image-caption {
            padding: var(--space-sm);
            font-size: 0.85rem;
            color: var(--text-muted);
            font-style: italic;
            text-align: center;
        }
        @media (max-width: 600px) {
            .image-caption {
                padding: var(--space-sm) 16px;
            }
        }

        .flow-steps {
            display: flex;
            flex-direction: column;
            gap: var(--space-md);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .flow-steps {
                gap: 1px;
                background: var(--glass-border);
                margin: var(--space-md) 0;
            }
        }
        .flow-step {
            display: flex;
            gap: var(--space-md);
            align-items: flex-start;
            padding: var(--space-md);
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            transition: all 0.3s ease;
        }
        @media (max-width: 600px) {
            .flow-step {
                padding: var(--space-md) 16px;
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--gold);
            }
        }
        @media (min-width: 601px) {
            .flow-step:hover {
                border-color: var(--gold);
                transform: translateX(8px);
            }
        }
        .flow-step-number {
            width: 40px;
            height: 40px;
            min-width: 40px;
            background: linear-gradient(135deg, var(--gold), var(--gold-dark));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 1.1rem;
            color: var(--navy-dark);
        }
        .flow-step-content { flex: 1; }
        .flow-step-title {
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: var(--space-xs);
        }
        .flow-step-desc {
            font-size: 0.9rem;
            color: var(--text-muted);
        }

        .patterns-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-md);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .patterns-grid {
                gap: 1px;
                background: var(--glass-border);
                margin: var(--space-md) 0;
            }
        }
        .pattern-card {
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            text-align: center;
            transition: all 0.3s ease;
        }
        @media (max-width: 600px) {
            .pattern-card {
                border: none;
                border-radius: 0;
                padding: var(--space-md);
            }
        }
        @media (min-width: 601px) {
            .pattern-card:hover {
                border-color: var(--success);
                transform: translateY(-4px);
            }
        }
        .pattern-icon { font-size: 2.5rem; margin-bottom: var(--space-sm); }
        .pattern-name { font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-xs); }
        .pattern-desc { font-size: 0.85rem; color: var(--text-muted); }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: var(--space-md);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .stats-grid {
                gap: 1px;
                background: var(--glass-border);
                margin: var(--space-md) 0;
            }
        }
        .stat-card {
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            text-align: center;
        }
        @media (max-width: 600px) {
            .stat-card {
                border: none;
                border-radius: 0;
                padding: var(--space-md);
            }
        }
        .stat-value {
            font-size: 1.75rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--gold), var(--gold));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        @media (max-width: 600px) {
            .stat-value { font-size: 1.25rem; }
        }
        .stat-label {
            font-size: 0.75rem;
            color: var(--text-muted);
            text-transform: uppercase;
        }

        .formula-box {
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.15), rgba(106, 91, 255, 0.05));
            border: 2px solid var(--purple);
            border-radius: var(--radius-lg);
            padding: var(--space-xl);
            margin: var(--space-xl) 0;
            text-align: center;
        }
        @media (max-width: 600px) {
            .formula-box {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--purple);
                padding: var(--space-lg) 16px;
                margin: var(--space-md) 0;
            }
        }
        .formula-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--purple);
            margin-bottom: var(--space-md);
        }
        .formula-content {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            gap: var(--space-sm);
        }
        .formula-item {
            background: var(--bg-card);
            padding: var(--space-sm) var(--space-md);
            border-radius: var(--space-sm);
            border: 1px solid var(--glass-border);
            font-weight: 600;
        }
        .formula-operator {
            color: var(--gold);
            font-size: 1.25rem;
        }

        .example-box {
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            overflow: hidden;
            margin: var(--space-xl) 0;
        }
        @media (max-width: 600px) {
            .example-box {
                border: none;
                border-radius: 0;
                margin: var(--space-md) 0;
            }
        }
        .example-header {
            background: linear-gradient(135deg, var(--success), #00A844);
            padding: var(--space-md) var(--space-lg);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
            font-weight: 700;
        }
        @media (max-width: 600px) {
            .example-header {
                padding: var(--space-md) 16px;
            }
        }
        .example-content {
            padding: var(--space-lg);
        }
        @media (max-width: 600px) {
            .example-content {
                padding: var(--space-md) 16px;
            }
        }
        .example-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-md);
        }
        @media (max-width: 600px) {
            .example-grid {
                grid-template-columns: 1fr;
                gap: var(--space-sm);
            }
        }
        .example-detail-label { font-size: 0.8rem; color: var(--text-muted); }
        .example-detail-value { font-weight: 700; }
        .example-detail-value.entry { color: var(--success); }
        .example-detail-value.stop { color: var(--error); }
        .example-detail-value.target { color: var(--cyan); }

        .summary-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.02));
            border: 2px solid var(--gold);
            border-radius: var(--radius-lg);
            padding: var(--space-xl);
            margin: var(--space-xl) 0;
        }
        @media (max-width: 600px) {
            .summary-box {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--gold);
                padding: var(--space-lg) 16px;
                margin: var(--space-md) 0;
            }
        }
        .summary-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--gold);
            margin-bottom: var(--space-lg);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }
        .summary-list { list-style: none; }
        .summary-list li {
            display: flex;
            align-items: flex-start;
            gap: var(--space-sm);
            margin-bottom: var(--space-md);
            color: var(--text-secondary);
        }
        .summary-list li::before {
            content: "✓";
            color: var(--gold);
            font-weight: 700;
        }

        .quiz-section {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            padding: var(--space-xl);
            margin-top: var(--space-xl);
        }
        @media (max-width: 600px) {
            .quiz-section {
                border: none;
                border-radius: 0;
                padding: 0;
                margin-top: 0;
                border-top: 8px solid var(--bg-primary);
            }
        }
        .quiz-header {
            text-align: center;
            margin-bottom: var(--space-xl);
        }
        @media (max-width: 600px) {
            .quiz-header {
                padding: var(--space-lg) 16px var(--space-md);
                margin-bottom: 0;
            }
        }
        .quiz-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--gold);
            margin-bottom: var(--space-sm);
        }
        .quiz-subtitle { color: var(--text-muted); font-size: 0.9rem; }

        .quiz-question {
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            margin-bottom: var(--space-lg);
        }
        @media (max-width: 600px) {
            .quiz-question {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--purple);
                padding: var(--space-md) 16px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--glass-border);
            }
        }
        .question-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, var(--gold), var(--gold-dark));
            border-radius: 50%;
            font-weight: 700;
            color: var(--navy-dark);
            margin-bottom: var(--space-md);
        }
        .question-text {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--space-lg);
            line-height: 1.6;
        }

        .quiz-options {
            display: flex;
            flex-direction: column;
            gap: var(--space-sm);
        }
        @media (max-width: 600px) {
            .quiz-options {
                gap: 1px;
                background: var(--glass-border);
                margin-left: -16px;
                margin-right: -16px;
                margin-left: calc(-16px - 4px);
            }
        }
        .quiz-option {
            display: flex;
            align-items: center;
            gap: var(--space-md);
            padding: var(--space-md);
            background: var(--glass-bg);
            border: 2px solid var(--glass-border);
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        @media (max-width: 600px) {
            .quiz-option {
                border: none;
                border-radius: 0;
                border-left: 4px solid transparent;
                padding: var(--space-md) 16px;
            }
        }
        .quiz-option:hover:not(.disabled) {
            border-color: var(--gold);
            background: var(--bg-card);
        }
        @media (max-width: 600px) {
            .quiz-option:hover:not(.disabled) {
                border-left-color: var(--gold);
            }
        }
        .quiz-option.selected {
            border-color: var(--gold);
            background: rgba(255, 189, 89, 0.1);
        }
        @media (max-width: 600px) {
            .quiz-option.selected {
                border-left-color: var(--gold);
            }
        }
        .quiz-option.correct {
            border-color: var(--success) !important;
            background: rgba(0, 200, 83, 0.15) !important;
        }
        @media (max-width: 600px) {
            .quiz-option.correct {
                border-left-color: var(--success) !important;
            }
        }
        .quiz-option.incorrect {
            border-color: var(--error) !important;
            background: rgba(255, 82, 82, 0.15) !important;
        }
        @media (max-width: 600px) {
            .quiz-option.incorrect {
                border-left-color: var(--error) !important;
            }
        }
        .quiz-option.disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        .option-marker {
            width: 28px;
            height: 28px;
            min-width: 28px;
            background: var(--glass-bg);
            border: 2px solid var(--glass-border);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.85rem;
        }
        .quiz-option.selected .option-marker {
            background: var(--gold);
            border-color: var(--gold);
            color: var(--navy-dark);
        }
        .quiz-option.correct .option-marker {
            background: var(--success);
            border-color: var(--success);
            color: white;
        }
        .quiz-option.incorrect .option-marker {
            background: var(--error);
            border-color: var(--error);
            color: white;
        }
        .option-text { flex: 1; color: var(--text-secondary); }

        .question-feedback {
            margin-top: var(--space-md);
            padding: var(--space-md);
            border-radius: var(--space-sm);
            display: none;
        }
        .question-feedback.show { display: block; }
        .question-feedback.correct {
            background: rgba(0, 200, 83, 0.15);
            border-left: 4px solid var(--success);
        }
        .question-feedback.incorrect {
            background: rgba(255, 82, 82, 0.15);
            border-left: 4px solid var(--error);
        }
        .feedback-title { font-weight: 700; margin-bottom: var(--space-xs); }
        .question-feedback.correct .feedback-title { color: var(--success); }
        .question-feedback.incorrect .feedback-title { color: var(--error); }
        .feedback-text { font-size: 0.9rem; color: var(--text-secondary); }

        .quiz-result {
            text-align: center;
            padding: var(--space-xl);
            display: none;
        }
        .quiz-result.show { display: block; }
        .result-score {
            font-size: 3rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--gold), var(--gold));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: var(--space-md);
        }
        .result-text {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: var(--space-sm);
        }
        .result-message { color: var(--text-muted); }

        .quiz-buttons {
            display: flex;
            justify-content: center;
            padding: var(--space-lg);
        }
        @media (max-width: 600px) {
            .quiz-buttons { padding: var(--space-lg) 16px; }
        }
        .quiz-btn {
            padding: var(--space-md) var(--space-xl);
            border-radius: var(--radius-md);
            font-weight: 700;
            cursor: pointer;
            border: none;
            font-family: inherit;
            background: var(--glass-bg);
            color: var(--text-primary);
            border: 2px solid var(--glass-border);
        }
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
                <span>📈</span>
                <span>Bullish Pattern</span>
            </div>
            <div class="lesson-chapter">Chapter 3 - UPU Pattern Mastery</div>
            <h1 class="lesson-title">Chiến Lược Entry Cho UPU</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 3.4</span></div>
                <div class="meta-item"><span>⏱️</span><span>8 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>3 câu quiz</span></div>
            </div>
        </header>

        <section class="section">
            <h2 class="section-title"><span>🎯</span> Mục Tiêu Bài Học</h2>
            <p>Sau khi hoàn thành bài học này, bạn sẽ nắm vững chiến lược entry hoàn chỉnh cho pattern UPU và biết cách vào lệnh LONG một cách chính xác.</p>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>💡</span> Nguyên Tắc Vàng</div>
                <p><strong>KHÔNG entry khi giá phá vỡ (breakout).</strong> Luôn đợi giá quay lại kiểm tra vùng LFZ để có điểm vào tối ưu.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📋</span> Quy Trình Entry 5 Bước</h2>
            <p>Chiến lược entry cho UPU tuân theo quy trình 5 bước nghiêm ngặt để đảm bảo tính chính xác.</p>

            <div class="flow-steps">
                <div class="flow-step">
                    <div class="flow-step-number">1</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Nhận Diện UPU Pattern</div>
                        <div class="flow-step-desc">Xác nhận 3 phases: UP → PAUSE → UP. Vùng PAUSE tạo thành LFZ.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">2</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Đợi Giá Retest LFZ</div>
                        <div class="flow-step-desc">Sau Phase 3, giá thường quay lại kiểm tra vùng LFZ trước khi tiếp tục tăng.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">3</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Đợi Nến Xác Nhận</div>
                        <div class="flow-step-desc">Khi giá chạm LFZ, đợi xuất hiện nến xác nhận bullish trước khi vào lệnh.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">4</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Vào Lệnh LONG</div>
                        <div class="flow-step-desc">Entry LONG ngay sau khi nến xác nhận đóng cửa hoàn chỉnh.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">5</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Đặt Stop Loss & Target</div>
                        <div class="flow-step-desc">SL dưới LFZ - 0.5%, Target tối thiểu 1:2 R:R.</div>
                    </div>
                </div>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/00C853?text=UPU+Entry+Flow+5+Buoc" alt="Entry Flow">
            </div>
            <div class="image-caption">Hình 1: Sơ đồ quy trình entry 5 bước cho UPU</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>🕯️</span> Các Nến Xác Nhận Bullish</h2>
            <p>Khi giá chạm vùng LFZ, cần đợi một trong các mẫu nến bullish sau để xác nhận lực mua.</p>

            <div class="patterns-grid">
                <div class="pattern-card">
                    <div class="pattern-icon">🔨</div>
                    <div class="pattern-name">Hammer</div>
                    <div class="pattern-desc">Râu dưới dài ≥2x thân nến</div>
                </div>
                <div class="pattern-card">
                    <div class="pattern-icon">📍</div>
                    <div class="pattern-name">Bullish Pin Bar</div>
                    <div class="pattern-desc">Thân nhỏ, râu dưới dài</div>
                </div>
                <div class="pattern-card">
                    <div class="pattern-icon">🟢</div>
                    <div class="pattern-name">Bullish Engulfing</div>
                    <div class="pattern-desc">Nến xanh nuốt nến đỏ</div>
                </div>
                <div class="pattern-card">
                    <div class="pattern-icon">⭐</div>
                    <div class="pattern-name">Morning Star</div>
                    <div class="pattern-desc">3 nến đảo chiều tăng</div>
                </div>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/00F0FF?text=Bullish+Candlestick+Patterns" alt="Bullish Patterns">
            </div>
            <div class="image-caption">Hình 2: Các mẫu nến xác nhận bullish phổ biến</div>

            <div class="definition-box">
                <div class="definition-box-title"><span>📖</span> Định Nghĩa: Nến Xác Nhận</div>
                <p>Nến xác nhận là nến cho thấy áp lực mua đã xuất hiện tại vùng LFZ. Nến này PHẢI đóng cửa hoàn chỉnh trước khi vào lệnh.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📊</span> Entry, SL & TP</h2>
            <p>Thiết lập vị thế chính xác là chìa khóa quản lý rủi ro hiệu quả.</p>

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
                    <div class="stat-value">71%</div>
                    <div class="stat-label">Win Rate</div>
                </div>
            </div>

            <div class="formula-box">
                <div class="formula-title">🎯 Công Thức Targets</div>
                <div class="formula-content">
                    <span class="formula-item">TP1: 1:1</span>
                    <span class="formula-operator">→</span>
                    <span class="formula-item">TP2: 1:2</span>
                    <span class="formula-operator">→</span>
                    <span class="formula-item">TP3: Measured</span>
                </div>
            </div>

            <div class="example-box">
                <div class="example-header">
                    <span>📈</span>
                    <span>Ví Dụ: SOL/USDT H4</span>
                </div>
                <div class="example-content">
                    <div class="example-grid">
                        <div class="example-detail">
                            <div class="example-detail-label">Entry LONG</div>
                            <div class="example-detail-value entry">$98.50</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Stop Loss</div>
                            <div class="example-detail-value stop">$96.00</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Target 1 (1:1)</div>
                            <div class="example-detail-value target">$101.00</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Target 2 (1:2)</div>
                            <div class="example-detail-value target">$103.50</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/FFBD59?text=SOL+Entry+Example+Chart" alt="SOL Entry Example">
            </div>
            <div class="image-caption">Hình 3: Ví dụ thực tế entry UPU trên SOL/USDT H4</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>⚠️</span> Những Sai Lầm Phổ Biến</h2>
            <p>Tránh những sai lầm sau để tăng tỷ lệ thành công:</p>

            <div class="warning-box">
                <div class="warning-box-title"><span>🚫</span> Sai Lầm #1: Entry Quá Sớm</div>
                <p>KHÔNG vào lệnh ngay khi giá chạm LFZ. Phải đợi nến xác nhận đóng cửa hoàn chỉnh.</p>
            </div>

            <div class="warning-box">
                <div class="warning-box-title"><span>🚫</span> Sai Lầm #2: SL Quá Chặt</div>
                <p>Đặt SL sát LFZ sẽ bị quét dễ dàng. Luôn thêm buffer 0.5% dưới đáy LFZ.</p>
            </div>

            <div class="warning-box">
                <div class="warning-box-title"><span>🚫</span> Sai Lầm #3: Bỏ Qua Volume</div>
                <p>Volume tại nến xác nhận phải cao hơn trung bình. Volume thấp = tín hiệu yếu.</p>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/FF5252?text=Common+Entry+Mistakes" alt="Common Mistakes">
            </div>
            <div class="image-caption">Hình 4: Minh họa các sai lầm phổ biến khi entry UPU</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📝</span> Tổng Kết</h2>

            <div class="summary-box">
                <div class="summary-title"><span>🎯</span> Điểm Chính</div>
                <ul class="summary-list">
                    <li>Quy trình 5 bước: Nhận diện → Retest → Xác Nhận → Entry → Target</li>
                    <li>4 mẫu nến bullish: Hammer, Bullish Pin Bar, Bullish Engulfing, Morning Star</li>
                    <li>Entry LONG sau nến xác nhận đóng cửa, SL dưới LFZ - 0.5%</li>
                    <li>KHÔNG entry khi chưa có nến xác nhận hoặc volume thấp</li>
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
                <div class="question-text">Khi nào là thời điểm đúng để vào lệnh LONG với UPU?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Ngay khi giá chạm vùng LFZ</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Sau khi nến xác nhận bullish đóng cửa</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Khi giá phá vỡ đỉnh Phase 3</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Ngay sau Phase 2 kết thúc</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-question" data-question="2" data-correct="C">
                <div class="question-number">2</div>
                <div class="question-text">Stop Loss cho lệnh LONG từ UPU nên đặt ở đâu?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Ngay tại đáy LFZ</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Trên đỉnh LFZ</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Dưới đáy LFZ - 0.5% buffer</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Tại đáy Phase 1</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-question" data-question="3" data-correct="D">
                <div class="question-number">3</div>
                <div class="question-text">Nến nào KHÔNG phải bullish confirmation cho UPU?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Hammer</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Bullish Engulfing</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Morning Star</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Shooting Star</span>
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
                    correct: ''✓ Chính xác! Luôn đợi nến xác nhận bullish đóng cửa hoàn chỉnh trước khi vào lệnh LONG.'',
                    incorrect: ''✗ Sai! Cần đợi nến xác nhận bullish đóng cửa, không entry sớm khi giá mới chạm LFZ.''
                },
                2: {
                    correct: ''✓ Chính xác! SL đặt dưới đáy LFZ - 0.5% buffer để tránh bị quét bởi biến động nhỏ.'',
                    incorrect: ''✗ Sai! SL cần đặt DƯỚI đáy LFZ - 0.5% buffer để có độ an toàn phù hợp.''
                },
                3: {
                    correct: ''✓ Chính xác! Shooting Star là nến bearish (râu trên dài), dùng cho HFZ, không phải LFZ.'',
                    incorrect: ''✗ Sai! Shooting Star là nến đảo chiều bearish, không phải bullish confirmation.''
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
                                messageDiv.textContent = ''🎉 Xuất sắc! Bạn đã sẵn sàng entry UPU!'';
                            } else if (correctCount >= 2) {
                                messageDiv.textContent = ''👍 Tốt lắm! Ôn lại phần nến xác nhận nhé!'';
                            } else {
                                messageDiv.textContent = ''📚 Xem lại bài học về quy trình entry nhé!'';
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
    <title>Bài 3.4: Chiến Lược Entry Cho UPU | GEM Trading Academy</title>

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

        .background-container {
            position: fixed;
            inset: 0;
            z-index: -1;
        }
        .bg-layer-base {
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, var(--navy-dark) 0%, var(--navy) 50%, var(--navy-dark) 100%);
        }
        .orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.3;
        }
        .orb-1 { width: 400px; height: 400px; background: var(--gold); top: -100px; right: -100px; }
        .orb-2 { width: 300px; height: 300px; background: var(--cyan); bottom: 20%; left: -100px; }
        .orb-3 { width: 250px; height: 250px; background: var(--success); bottom: -50px; right: 20%; }

        .lesson-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1.5rem;
        }
        @media (max-width: 600px) {
            .lesson-container {
                padding: 0;
            }
        }

        .lesson-header {
            text-align: center;
            padding: var(--space-xl);
            margin-bottom: var(--space-xl);
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            box-shadow: 0 4px 24px rgba(0,0,0,0.2);
        }
        @media (max-width: 600px) {
            .lesson-header {
                padding: var(--space-lg) 16px;
                margin-bottom: 0;
                border: none;
                border-radius: 0;
                box-shadow: none;
                border-bottom: 8px solid var(--bg-primary);
            }
        }
        .lesson-badge {
            display: inline-flex;
            align-items: center;
            gap: var(--space-sm);
            padding: var(--space-sm) var(--space-md);
            background: linear-gradient(135deg, var(--success), #00A844);
            border-radius: 50px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: var(--space-md);
        }
        .lesson-chapter {
            font-size: 0.9rem;
            color: var(--gold);
            font-weight: 600;
            margin-bottom: var(--space-sm);
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .lesson-title {
            font-size: clamp(1.75rem, 5vw, 2.5rem);
            font-weight: 800;
            margin-bottom: var(--space-md);
            background: linear-gradient(135deg, var(--text-primary), var(--gold));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .lesson-meta {
            display: flex;
            justify-content: center;
            gap: var(--space-lg);
            flex-wrap: wrap;
            color: var(--text-muted);
            font-size: 0.85rem;
        }
        .meta-item {
            display: flex;
            align-items: center;
            gap: var(--space-xs);
        }

        .section {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            box-shadow: 0 4px 24px rgba(0,0,0,0.2);
            padding: var(--space-xl);
            margin-bottom: var(--space-lg);
        }
        @media (max-width: 600px) {
            .section {
                padding: 0;
                margin-bottom: 0;
                border: none;
                border-radius: 0;
                box-shadow: none;
                border-bottom: 8px solid var(--bg-primary);
            }
        }

        .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--gold);
            margin-bottom: var(--space-lg);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }
        @media (max-width: 600px) {
            .section-title {
                padding: var(--space-lg) 16px var(--space-md) 16px;
                margin-bottom: 0;
            }
        }

        .section > p {
            color: var(--text-secondary);
            margin-bottom: var(--space-md);
        }
        @media (max-width: 600px) {
            .section > p {
                padding: 0 16px;
            }
        }

        .section > ul, .section > ol {
            color: var(--text-secondary);
            padding-left: 1.5em;
            margin-bottom: var(--space-md);
        }
        @media (max-width: 600px) {
            .section > ul, .section > ol {
                padding-left: calc(16px + 1.5em);
                padding-right: 16px;
            }
        }
        .section li { margin-bottom: var(--space-sm); }

        .highlight-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15), rgba(255, 189, 89, 0.05));
            border: 1px solid rgba(255, 189, 89, 0.3);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .highlight-box {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--gold);
                padding: var(--space-md) 16px;
                margin: var(--space-md) 0;
            }
        }
        .highlight-box-title {
            font-weight: 700;
            color: var(--gold);
            margin-bottom: var(--space-sm);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }
        .highlight-box p { color: var(--text-secondary); margin: 0; }

        .definition-box {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 240, 255, 0.02));
            border: 1px solid rgba(0, 240, 255, 0.2);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .definition-box {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--cyan);
                padding: var(--space-md) 16px;
                margin: var(--space-md) 0;
            }
        }
        .definition-box-title {
            font-weight: 700;
            color: var(--cyan);
            margin-bottom: var(--space-sm);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }

        .warning-box {
            background: linear-gradient(135deg, rgba(156, 6, 18, 0.2), rgba(156, 6, 18, 0.05));
            border: 1px solid rgba(156, 6, 18, 0.4);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .warning-box {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--burgundy);
                padding: var(--space-md) 16px;
                margin: var(--space-md) 0;
            }
        }
        .warning-box-title {
            font-weight: 700;
            color: var(--burgundy-light);
            margin-bottom: var(--space-sm);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }

        .image-container {
            margin: var(--space-xl) 0;
            border-radius: var(--radius-md);
            overflow: hidden;
            border: 1px solid var(--glass-border);
        }
        @media (max-width: 600px) {
            .image-container {
                margin: var(--space-md) 0;
                border-radius: 0;
                border: none;
            }
        }
        .image-caption {
            padding: var(--space-sm);
            font-size: 0.85rem;
            color: var(--text-muted);
            font-style: italic;
            text-align: center;
        }
        @media (max-width: 600px) {
            .image-caption {
                padding: var(--space-sm) 16px;
            }
        }

        .flow-steps {
            display: flex;
            flex-direction: column;
            gap: var(--space-md);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .flow-steps {
                gap: 1px;
                background: var(--glass-border);
                margin: var(--space-md) 0;
            }
        }
        .flow-step {
            display: flex;
            gap: var(--space-md);
            align-items: flex-start;
            padding: var(--space-md);
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            transition: all 0.3s ease;
        }
        @media (max-width: 600px) {
            .flow-step {
                padding: var(--space-md) 16px;
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--gold);
            }
        }
        @media (min-width: 601px) {
            .flow-step:hover {
                border-color: var(--gold);
                transform: translateX(8px);
            }
        }
        .flow-step-number {
            width: 40px;
            height: 40px;
            min-width: 40px;
            background: linear-gradient(135deg, var(--gold), var(--gold-dark));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 1.1rem;
            color: var(--navy-dark);
        }
        .flow-step-content { flex: 1; }
        .flow-step-title {
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: var(--space-xs);
        }
        .flow-step-desc {
            font-size: 0.9rem;
            color: var(--text-muted);
        }

        .patterns-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-md);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .patterns-grid {
                gap: 1px;
                background: var(--glass-border);
                margin: var(--space-md) 0;
            }
        }
        .pattern-card {
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            text-align: center;
            transition: all 0.3s ease;
        }
        @media (max-width: 600px) {
            .pattern-card {
                border: none;
                border-radius: 0;
                padding: var(--space-md);
            }
        }
        @media (min-width: 601px) {
            .pattern-card:hover {
                border-color: var(--success);
                transform: translateY(-4px);
            }
        }
        .pattern-icon { font-size: 2.5rem; margin-bottom: var(--space-sm); }
        .pattern-name { font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-xs); }
        .pattern-desc { font-size: 0.85rem; color: var(--text-muted); }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: var(--space-md);
            margin: var(--space-lg) 0;
        }
        @media (max-width: 600px) {
            .stats-grid {
                gap: 1px;
                background: var(--glass-border);
                margin: var(--space-md) 0;
            }
        }
        .stat-card {
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            text-align: center;
        }
        @media (max-width: 600px) {
            .stat-card {
                border: none;
                border-radius: 0;
                padding: var(--space-md);
            }
        }
        .stat-value {
            font-size: 1.75rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--gold), var(--gold));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        @media (max-width: 600px) {
            .stat-value { font-size: 1.25rem; }
        }
        .stat-label {
            font-size: 0.75rem;
            color: var(--text-muted);
            text-transform: uppercase;
        }

        .formula-box {
            background: linear-gradient(135deg, rgba(106, 91, 255, 0.15), rgba(106, 91, 255, 0.05));
            border: 2px solid var(--purple);
            border-radius: var(--radius-lg);
            padding: var(--space-xl);
            margin: var(--space-xl) 0;
            text-align: center;
        }
        @media (max-width: 600px) {
            .formula-box {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--purple);
                padding: var(--space-lg) 16px;
                margin: var(--space-md) 0;
            }
        }
        .formula-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--purple);
            margin-bottom: var(--space-md);
        }
        .formula-content {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            gap: var(--space-sm);
        }
        .formula-item {
            background: var(--bg-card);
            padding: var(--space-sm) var(--space-md);
            border-radius: var(--space-sm);
            border: 1px solid var(--glass-border);
            font-weight: 600;
        }
        .formula-operator {
            color: var(--gold);
            font-size: 1.25rem;
        }

        .example-box {
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            overflow: hidden;
            margin: var(--space-xl) 0;
        }
        @media (max-width: 600px) {
            .example-box {
                border: none;
                border-radius: 0;
                margin: var(--space-md) 0;
            }
        }
        .example-header {
            background: linear-gradient(135deg, var(--success), #00A844);
            padding: var(--space-md) var(--space-lg);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
            font-weight: 700;
        }
        @media (max-width: 600px) {
            .example-header {
                padding: var(--space-md) 16px;
            }
        }
        .example-content {
            padding: var(--space-lg);
        }
        @media (max-width: 600px) {
            .example-content {
                padding: var(--space-md) 16px;
            }
        }
        .example-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-md);
        }
        @media (max-width: 600px) {
            .example-grid {
                grid-template-columns: 1fr;
                gap: var(--space-sm);
            }
        }
        .example-detail-label { font-size: 0.8rem; color: var(--text-muted); }
        .example-detail-value { font-weight: 700; }
        .example-detail-value.entry { color: var(--success); }
        .example-detail-value.stop { color: var(--error); }
        .example-detail-value.target { color: var(--cyan); }

        .summary-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.1), rgba(255, 189, 89, 0.02));
            border: 2px solid var(--gold);
            border-radius: var(--radius-lg);
            padding: var(--space-xl);
            margin: var(--space-xl) 0;
        }
        @media (max-width: 600px) {
            .summary-box {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--gold);
                padding: var(--space-lg) 16px;
                margin: var(--space-md) 0;
            }
        }
        .summary-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--gold);
            margin-bottom: var(--space-lg);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }
        .summary-list { list-style: none; }
        .summary-list li {
            display: flex;
            align-items: flex-start;
            gap: var(--space-sm);
            margin-bottom: var(--space-md);
            color: var(--text-secondary);
        }
        .summary-list li::before {
            content: "✓";
            color: var(--gold);
            font-weight: 700;
        }

        .quiz-section {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            padding: var(--space-xl);
            margin-top: var(--space-xl);
        }
        @media (max-width: 600px) {
            .quiz-section {
                border: none;
                border-radius: 0;
                padding: 0;
                margin-top: 0;
                border-top: 8px solid var(--bg-primary);
            }
        }
        .quiz-header {
            text-align: center;
            margin-bottom: var(--space-xl);
        }
        @media (max-width: 600px) {
            .quiz-header {
                padding: var(--space-lg) 16px var(--space-md);
                margin-bottom: 0;
            }
        }
        .quiz-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--gold);
            margin-bottom: var(--space-sm);
        }
        .quiz-subtitle { color: var(--text-muted); font-size: 0.9rem; }

        .quiz-question {
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            margin-bottom: var(--space-lg);
        }
        @media (max-width: 600px) {
            .quiz-question {
                border: none;
                border-radius: 0;
                border-left: 4px solid var(--purple);
                padding: var(--space-md) 16px;
                margin-bottom: 0;
                border-bottom: 1px solid var(--glass-border);
            }
        }
        .question-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, var(--gold), var(--gold-dark));
            border-radius: 50%;
            font-weight: 700;
            color: var(--navy-dark);
            margin-bottom: var(--space-md);
        }
        .question-text {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--space-lg);
            line-height: 1.6;
        }

        .quiz-options {
            display: flex;
            flex-direction: column;
            gap: var(--space-sm);
        }
        @media (max-width: 600px) {
            .quiz-options {
                gap: 1px;
                background: var(--glass-border);
                margin-left: -16px;
                margin-right: -16px;
                margin-left: calc(-16px - 4px);
            }
        }
        .quiz-option {
            display: flex;
            align-items: center;
            gap: var(--space-md);
            padding: var(--space-md);
            background: var(--glass-bg);
            border: 2px solid var(--glass-border);
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        @media (max-width: 600px) {
            .quiz-option {
                border: none;
                border-radius: 0;
                border-left: 4px solid transparent;
                padding: var(--space-md) 16px;
            }
        }
        .quiz-option:hover:not(.disabled) {
            border-color: var(--gold);
            background: var(--bg-card);
        }
        @media (max-width: 600px) {
            .quiz-option:hover:not(.disabled) {
                border-left-color: var(--gold);
            }
        }
        .quiz-option.selected {
            border-color: var(--gold);
            background: rgba(255, 189, 89, 0.1);
        }
        @media (max-width: 600px) {
            .quiz-option.selected {
                border-left-color: var(--gold);
            }
        }
        .quiz-option.correct {
            border-color: var(--success) !important;
            background: rgba(0, 200, 83, 0.15) !important;
        }
        @media (max-width: 600px) {
            .quiz-option.correct {
                border-left-color: var(--success) !important;
            }
        }
        .quiz-option.incorrect {
            border-color: var(--error) !important;
            background: rgba(255, 82, 82, 0.15) !important;
        }
        @media (max-width: 600px) {
            .quiz-option.incorrect {
                border-left-color: var(--error) !important;
            }
        }
        .quiz-option.disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        .option-marker {
            width: 28px;
            height: 28px;
            min-width: 28px;
            background: var(--glass-bg);
            border: 2px solid var(--glass-border);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.85rem;
        }
        .quiz-option.selected .option-marker {
            background: var(--gold);
            border-color: var(--gold);
            color: var(--navy-dark);
        }
        .quiz-option.correct .option-marker {
            background: var(--success);
            border-color: var(--success);
            color: white;
        }
        .quiz-option.incorrect .option-marker {
            background: var(--error);
            border-color: var(--error);
            color: white;
        }
        .option-text { flex: 1; color: var(--text-secondary); }

        .question-feedback {
            margin-top: var(--space-md);
            padding: var(--space-md);
            border-radius: var(--space-sm);
            display: none;
        }
        .question-feedback.show { display: block; }
        .question-feedback.correct {
            background: rgba(0, 200, 83, 0.15);
            border-left: 4px solid var(--success);
        }
        .question-feedback.incorrect {
            background: rgba(255, 82, 82, 0.15);
            border-left: 4px solid var(--error);
        }
        .feedback-title { font-weight: 700; margin-bottom: var(--space-xs); }
        .question-feedback.correct .feedback-title { color: var(--success); }
        .question-feedback.incorrect .feedback-title { color: var(--error); }
        .feedback-text { font-size: 0.9rem; color: var(--text-secondary); }

        .quiz-result {
            text-align: center;
            padding: var(--space-xl);
            display: none;
        }
        .quiz-result.show { display: block; }
        .result-score {
            font-size: 3rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--gold), var(--gold));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: var(--space-md);
        }
        .result-text {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: var(--space-sm);
        }
        .result-message { color: var(--text-muted); }

        .quiz-buttons {
            display: flex;
            justify-content: center;
            padding: var(--space-lg);
        }
        @media (max-width: 600px) {
            .quiz-buttons { padding: var(--space-lg) 16px; }
        }
        .quiz-btn {
            padding: var(--space-md) var(--space-xl);
            border-radius: var(--radius-md);
            font-weight: 700;
            cursor: pointer;
            border: none;
            font-family: inherit;
            background: var(--glass-bg);
            color: var(--text-primary);
            border: 2px solid var(--glass-border);
        }
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
                <span>📈</span>
                <span>Bullish Pattern</span>
            </div>
            <div class="lesson-chapter">Chapter 3 - UPU Pattern Mastery</div>
            <h1 class="lesson-title">Chiến Lược Entry Cho UPU</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 3.4</span></div>
                <div class="meta-item"><span>⏱️</span><span>8 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>3 câu quiz</span></div>
            </div>
        </header>

        <section class="section">
            <h2 class="section-title"><span>🎯</span> Mục Tiêu Bài Học</h2>
            <p>Sau khi hoàn thành bài học này, bạn sẽ nắm vững chiến lược entry hoàn chỉnh cho pattern UPU và biết cách vào lệnh LONG một cách chính xác.</p>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>💡</span> Nguyên Tắc Vàng</div>
                <p><strong>KHÔNG entry khi giá phá vỡ (breakout).</strong> Luôn đợi giá quay lại kiểm tra vùng LFZ để có điểm vào tối ưu.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📋</span> Quy Trình Entry 5 Bước</h2>
            <p>Chiến lược entry cho UPU tuân theo quy trình 5 bước nghiêm ngặt để đảm bảo tính chính xác.</p>

            <div class="flow-steps">
                <div class="flow-step">
                    <div class="flow-step-number">1</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Nhận Diện UPU Pattern</div>
                        <div class="flow-step-desc">Xác nhận 3 phases: UP → PAUSE → UP. Vùng PAUSE tạo thành LFZ.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">2</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Đợi Giá Retest LFZ</div>
                        <div class="flow-step-desc">Sau Phase 3, giá thường quay lại kiểm tra vùng LFZ trước khi tiếp tục tăng.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">3</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Đợi Nến Xác Nhận</div>
                        <div class="flow-step-desc">Khi giá chạm LFZ, đợi xuất hiện nến xác nhận bullish trước khi vào lệnh.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">4</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Vào Lệnh LONG</div>
                        <div class="flow-step-desc">Entry LONG ngay sau khi nến xác nhận đóng cửa hoàn chỉnh.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">5</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Đặt Stop Loss & Target</div>
                        <div class="flow-step-desc">SL dưới LFZ - 0.5%, Target tối thiểu 1:2 R:R.</div>
                    </div>
                </div>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/00C853?text=UPU+Entry+Flow+5+Buoc" alt="Entry Flow">
            </div>
            <div class="image-caption">Hình 1: Sơ đồ quy trình entry 5 bước cho UPU</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>🕯️</span> Các Nến Xác Nhận Bullish</h2>
            <p>Khi giá chạm vùng LFZ, cần đợi một trong các mẫu nến bullish sau để xác nhận lực mua.</p>

            <div class="patterns-grid">
                <div class="pattern-card">
                    <div class="pattern-icon">🔨</div>
                    <div class="pattern-name">Hammer</div>
                    <div class="pattern-desc">Râu dưới dài ≥2x thân nến</div>
                </div>
                <div class="pattern-card">
                    <div class="pattern-icon">📍</div>
                    <div class="pattern-name">Bullish Pin Bar</div>
                    <div class="pattern-desc">Thân nhỏ, râu dưới dài</div>
                </div>
                <div class="pattern-card">
                    <div class="pattern-icon">🟢</div>
                    <div class="pattern-name">Bullish Engulfing</div>
                    <div class="pattern-desc">Nến xanh nuốt nến đỏ</div>
                </div>
                <div class="pattern-card">
                    <div class="pattern-icon">⭐</div>
                    <div class="pattern-name">Morning Star</div>
                    <div class="pattern-desc">3 nến đảo chiều tăng</div>
                </div>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/00F0FF?text=Bullish+Candlestick+Patterns" alt="Bullish Patterns">
            </div>
            <div class="image-caption">Hình 2: Các mẫu nến xác nhận bullish phổ biến</div>

            <div class="definition-box">
                <div class="definition-box-title"><span>📖</span> Định Nghĩa: Nến Xác Nhận</div>
                <p>Nến xác nhận là nến cho thấy áp lực mua đã xuất hiện tại vùng LFZ. Nến này PHẢI đóng cửa hoàn chỉnh trước khi vào lệnh.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📊</span> Entry, SL & TP</h2>
            <p>Thiết lập vị thế chính xác là chìa khóa quản lý rủi ro hiệu quả.</p>

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
                    <div class="stat-value">71%</div>
                    <div class="stat-label">Win Rate</div>
                </div>
            </div>

            <div class="formula-box">
                <div class="formula-title">🎯 Công Thức Targets</div>
                <div class="formula-content">
                    <span class="formula-item">TP1: 1:1</span>
                    <span class="formula-operator">→</span>
                    <span class="formula-item">TP2: 1:2</span>
                    <span class="formula-operator">→</span>
                    <span class="formula-item">TP3: Measured</span>
                </div>
            </div>

            <div class="example-box">
                <div class="example-header">
                    <span>📈</span>
                    <span>Ví Dụ: SOL/USDT H4</span>
                </div>
                <div class="example-content">
                    <div class="example-grid">
                        <div class="example-detail">
                            <div class="example-detail-label">Entry LONG</div>
                            <div class="example-detail-value entry">$98.50</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Stop Loss</div>
                            <div class="example-detail-value stop">$96.00</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Target 1 (1:1)</div>
                            <div class="example-detail-value target">$101.00</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Target 2 (1:2)</div>
                            <div class="example-detail-value target">$103.50</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/FFBD59?text=SOL+Entry+Example+Chart" alt="SOL Entry Example">
            </div>
            <div class="image-caption">Hình 3: Ví dụ thực tế entry UPU trên SOL/USDT H4</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>⚠️</span> Những Sai Lầm Phổ Biến</h2>
            <p>Tránh những sai lầm sau để tăng tỷ lệ thành công:</p>

            <div class="warning-box">
                <div class="warning-box-title"><span>🚫</span> Sai Lầm #1: Entry Quá Sớm</div>
                <p>KHÔNG vào lệnh ngay khi giá chạm LFZ. Phải đợi nến xác nhận đóng cửa hoàn chỉnh.</p>
            </div>

            <div class="warning-box">
                <div class="warning-box-title"><span>🚫</span> Sai Lầm #2: SL Quá Chặt</div>
                <p>Đặt SL sát LFZ sẽ bị quét dễ dàng. Luôn thêm buffer 0.5% dưới đáy LFZ.</p>
            </div>

            <div class="warning-box">
                <div class="warning-box-title"><span>🚫</span> Sai Lầm #3: Bỏ Qua Volume</div>
                <p>Volume tại nến xác nhận phải cao hơn trung bình. Volume thấp = tín hiệu yếu.</p>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/FF5252?text=Common+Entry+Mistakes" alt="Common Mistakes">
            </div>
            <div class="image-caption">Hình 4: Minh họa các sai lầm phổ biến khi entry UPU</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📝</span> Tổng Kết</h2>

            <div class="summary-box">
                <div class="summary-title"><span>🎯</span> Điểm Chính</div>
                <ul class="summary-list">
                    <li>Quy trình 5 bước: Nhận diện → Retest → Xác Nhận → Entry → Target</li>
                    <li>4 mẫu nến bullish: Hammer, Bullish Pin Bar, Bullish Engulfing, Morning Star</li>
                    <li>Entry LONG sau nến xác nhận đóng cửa, SL dưới LFZ - 0.5%</li>
                    <li>KHÔNG entry khi chưa có nến xác nhận hoặc volume thấp</li>
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
                <div class="question-text">Khi nào là thời điểm đúng để vào lệnh LONG với UPU?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Ngay khi giá chạm vùng LFZ</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Sau khi nến xác nhận bullish đóng cửa</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Khi giá phá vỡ đỉnh Phase 3</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Ngay sau Phase 2 kết thúc</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-question" data-question="2" data-correct="C">
                <div class="question-number">2</div>
                <div class="question-text">Stop Loss cho lệnh LONG từ UPU nên đặt ở đâu?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Ngay tại đáy LFZ</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Trên đỉnh LFZ</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Dưới đáy LFZ - 0.5% buffer</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Tại đáy Phase 1</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-question" data-question="3" data-correct="D">
                <div class="question-number">3</div>
                <div class="question-text">Nến nào KHÔNG phải bullish confirmation cho UPU?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Hammer</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Bullish Engulfing</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Morning Star</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Shooting Star</span>
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
                    correct: ''✓ Chính xác! Luôn đợi nến xác nhận bullish đóng cửa hoàn chỉnh trước khi vào lệnh LONG.'',
                    incorrect: ''✗ Sai! Cần đợi nến xác nhận bullish đóng cửa, không entry sớm khi giá mới chạm LFZ.''
                },
                2: {
                    correct: ''✓ Chính xác! SL đặt dưới đáy LFZ - 0.5% buffer để tránh bị quét bởi biến động nhỏ.'',
                    incorrect: ''✗ Sai! SL cần đặt DƯỚI đáy LFZ - 0.5% buffer để có độ an toàn phù hợp.''
                },
                3: {
                    correct: ''✓ Chính xác! Shooting Star là nến bearish (râu trên dài), dùng cho HFZ, không phải LFZ.'',
                    incorrect: ''✗ Sai! Shooting Star là nến đảo chiều bearish, không phải bullish confirmation.''
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
                                messageDiv.textContent = ''🎉 Xuất sắc! Bạn đã sẵn sàng entry UPU!'';
                            } else if (correctCount >= 2) {
                                messageDiv.textContent = ''👍 Tốt lắm! Ôn lại phần nến xác nhận nhé!'';
                            } else {
                                messageDiv.textContent = ''📚 Xem lại bài học về quy trình entry nhé!'';
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

-- Lesson 3.5: Checklist Xác Nhận UPU
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch3-l5',
  'module-tier-1-ch3',
  'course-tier1-trading-foundation',
  'Bài 3.5: Checklist Xác Nhận UPU',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 3.5: Checklist Xác Nhận UPU | GEM Trading Academy</title>

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
        .orb-3 { width: 250px; height: 250px; background: var(--success); bottom: -50px; right: 20%; }

        .lesson-container { max-width: 800px; margin: 0 auto; padding: 1.5rem; }
        @media (max-width: 600px) { .lesson-container { padding: 0; } }

        .lesson-header { text-align: center; padding: var(--space-xl); margin-bottom: var(--space-xl); background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); box-shadow: 0 4px 24px rgba(0,0,0,0.2); }
        @media (max-width: 600px) { .lesson-header { padding: var(--space-lg) 16px; margin-bottom: 0; border: none; border-radius: 0; box-shadow: none; border-bottom: 8px solid var(--bg-primary); } }
        .lesson-badge { display: inline-flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); background: linear-gradient(135deg, var(--success), #00A844); border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: var(--space-md); }
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

        .warning-box { background: linear-gradient(135deg, rgba(156, 6, 18, 0.2), rgba(156, 6, 18, 0.05)); border: 1px solid rgba(156, 6, 18, 0.4); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .warning-box { border: none; border-radius: 0; border-left: 4px solid var(--burgundy); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .warning-box-title { font-weight: 700; color: var(--burgundy-light); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }

        .image-container { margin: var(--space-xl) 0; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--glass-border); }
        @media (max-width: 600px) { .image-container { margin: var(--space-md) 0; border-radius: 0; border: none; } }
        .image-caption { padding: var(--space-sm); font-size: 0.85rem; color: var(--text-muted); font-style: italic; text-align: center; }
        @media (max-width: 600px) { .image-caption { padding: var(--space-sm) 16px; } }

        .checklist { list-style: none; margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .checklist { margin: var(--space-md) 0; background: var(--glass-border); } }
        .checklist-item { display: flex; align-items: flex-start; gap: var(--space-md); padding: var(--space-md); background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); margin-bottom: var(--space-sm); }
        @media (max-width: 600px) { .checklist-item { padding: var(--space-md) 16px; border: none; border-radius: 0; margin-bottom: 0; border-left: 4px solid var(--gold); } }
        .checklist-icon { width: 24px; height: 24px; min-width: 24px; background: var(--glass-bg); border: 2px solid var(--gold); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--gold); font-size: 0.8rem; }
        .checklist-text { color: var(--text-secondary); flex: 1; }

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
                <span>📈</span>
                <span>Bullish Pattern</span>
            </div>
            <div class="lesson-chapter">Chapter 3 - UPU Pattern Mastery</div>
            <h1 class="lesson-title">Checklist Xác Nhận UPU</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 3.5</span></div>
                <div class="meta-item"><span>⏱️</span><span>6 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <section class="section">
            <h2 class="section-title"><span>🎯</span> Mục Tiêu Bài Học</h2>
            <p>Sau khi hoàn thành bài học này, bạn sẽ có một checklist đầy đủ 8 điểm để xác nhận pattern UPU trước khi vào lệnh và biết cách tránh những lỗi phổ biến.</p>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>💡</span> Tại Sao Cần Checklist?</div>
                <p>Checklist giúp bạn có quy trình rõ ràng, loại bỏ cảm xúc và đảm bảo mọi điều kiện được đáp ứng trước khi vào lệnh. <strong>Traders chuyên nghiệp không bao giờ bỏ qua checklist.</strong></p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>✅</span> Checklist 8 Điểm Xác Nhận UPU</h2>
            <p>Luôn kiểm tra đầy đủ 8 điều kiện sau trước khi vào lệnh LONG:</p>

            <ul class="checklist">
                <li class="checklist-item">
                    <span class="checklist-icon">1</span>
                    <span class="checklist-text"><strong>Phase 1 tăng ≥2%:</strong> Đợt tăng đầu tiên phải rõ ràng, có ít nhất 2% biến động và volume cao</span>
                </li>
                <li class="checklist-item">
                    <span class="checklist-icon">2</span>
                    <span class="checklist-text"><strong>Phase 2 range <1.5%:</strong> Vùng Pause phải hẹp, không quá rộng, từ 1-5 nến</span>
                </li>
                <li class="checklist-item">
                    <span class="checklist-icon">3</span>
                    <span class="checklist-text"><strong>Phase 3 tăng ≥2%:</strong> Đợt tăng thứ hai phải tiếp tục mạnh mẽ, xác nhận pattern</span>
                </li>
                <li class="checklist-item">
                    <span class="checklist-icon">4</span>
                    <span class="checklist-text"><strong>Giá đã quay lại test LFZ:</strong> Giá PHẢI pullback về vùng LFZ, không entry khi breakout</span>
                </li>
                <li class="checklist-item">
                    <span class="checklist-icon">5</span>
                    <span class="checklist-text"><strong>Có nến xác nhận bullish:</strong> Phải có Hammer, Bullish Engulfing hoặc Morning Star</span>
                </li>
                <li class="checklist-item">
                    <span class="checklist-icon">6</span>
                    <span class="checklist-text"><strong>Zone chưa bị phá:</strong> Giá không được đóng cửa dưới đáy LFZ trước đó</span>
                </li>
                <li class="checklist-item">
                    <span class="checklist-icon">7</span>
                    <span class="checklist-text"><strong>Zone đã test <3 lần:</strong> Zone fresh hoặc chỉ bị test 1-2 lần vẫn còn mạnh</span>
                </li>
                <li class="checklist-item">
                    <span class="checklist-icon">8</span>
                    <span class="checklist-text"><strong>R:R ≥ 1:2:</strong> Tỷ lệ Risk:Reward phải từ 1:2 trở lên mới đủ hấp dẫn</span>
                </li>
            </ul>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/00C853?text=UPU+Checklist+8+Points" alt="UPU Checklist">
            </div>
            <div class="image-caption">Hình 1: Checklist 8 điểm xác nhận UPU - In ra và dán cạnh màn hình!</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>⚠️</span> Những Lỗi Phổ Biến Cần Tránh</h2>
            <p>Hầu hết traders mới đều mắc các lỗi này. Hãy học từ sai lầm của người khác!</p>

            <div class="flow-steps">
                <div class="flow-step">
                    <div class="flow-step-number">❌</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Lỗi 1: Entry Khi Breakout</div>
                        <div class="flow-step-desc">FOMO mua ngay khi giá phá đỉnh Phase 3. Đây là lỗi kinh điển khiến bạn mua đỉnh.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">❌</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Lỗi 2: Bỏ Qua Nến Xác Nhận</div>
                        <div class="flow-step-desc">Vào lệnh ngay khi giá chạm LFZ mà không đợi nến bullish xác nhận.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">❌</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Lỗi 3: Zone Quá Rộng</div>
                        <div class="flow-step-desc">Vẽ zone với Phase 2 range >1.5%. Zone rộng = SL xa = R:R kém.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">❌</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Lỗi 4: Trade Zone Đã Yếu</div>
                        <div class="flow-step-desc">Vào lệnh tại zone đã bị test 3+ lần. Zone càng test nhiều càng yếu.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">❌</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Lỗi 5: Bỏ Qua R:R</div>
                        <div class="flow-step-desc">Vào lệnh với R:R <1:2. Dù win rate cao nhưng lợi nhuận không đủ bù lỗ.</div>
                    </div>
                </div>
            </div>

            <div class="warning-box">
                <div class="warning-box-title"><span>🚫</span> Quy Tắc Sắt: NO Checklist = NO Trade</div>
                <p>Nếu BẤT KỲ điều kiện nào trong checklist không được đáp ứng, <strong>KHÔNG VÀO LỆNH.</strong> Thà bỏ lỡ cơ hội còn hơn mất tiền do vi phạm kỷ luật.</p>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/FF5252?text=Common+UPU+Mistakes" alt="Common Mistakes">
            </div>
            <div class="image-caption">Hình 2: 5 lỗi phổ biến khi giao dịch UPU - Hãy tránh xa!</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📊</span> So Sánh: Setup Tốt vs Setup Xấu</h2>
            <p>Hãy xem sự khác biệt giữa một setup UPU chất lượng và một setup kém chất lượng.</p>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/FFBD59?text=Good+vs+Bad+UPU+Setup" alt="Good vs Bad Setup">
            </div>
            <div class="image-caption">Hình 3: So sánh setup UPU tốt (trái) và setup xấu (phải)</div>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>✅</span> Setup Tốt Có Đặc Điểm</div>
                <p>Phase 1 rõ ràng với volume cao → Phase 2 hẹp 1-3 nến → Phase 3 mạnh → Giá retest LFZ → Nến xác nhận rõ → Zone fresh → R:R > 1:2</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📝</span> Tổng Kết</h2>

            <div class="summary-box">
                <div class="summary-title"><span>🎯</span> Điểm Chính</div>
                <ul class="summary-list">
                    <li>Checklist 8 điểm: Phase 1 ≥2%, Phase 2 <1.5%, Phase 3 ≥2%, Retest, Confirmation, Zone intact, <3 tests, R:R ≥1:2</li>
                    <li>5 lỗi phổ biến: Entry breakout, bỏ qua confirmation, zone rộng, zone yếu, bỏ qua R:R</li>
                    <li>Quy tắc sắt: NO Checklist = NO Trade</li>
                    <li>In checklist ra và dán cạnh màn hình để nhắc nhở mỗi khi giao dịch</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-header">
                <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>
                <p class="quiz-subtitle">Chọn đáp án để nhận phản hồi ngay lập tức</p>
            </div>

            <div class="quiz-question" data-question="1" data-correct="D">
                <div class="question-number">1</div>
                <div class="question-text">Trong checklist 8 điểm, điều kiện nào sau đây KHÔNG nằm trong danh sách?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Phase 1 tăng ≥2%</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Zone đã test <3 lần</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">R:R ≥ 1:2</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Volume phải tăng gấp 3 lần</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-question" data-question="2" data-correct="B">
                <div class="question-number">2</div>
                <div class="question-text">Khi zone đã bị test bao nhiêu lần thì được coi là "yếu" và nên tránh?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">1 lần</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">3 lần trở lên</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">5 lần trở lên</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Không quan trọng số lần test</span>
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
                    correct: ''✓ Chính xác! "Volume tăng gấp 3 lần" không nằm trong checklist. Checklist yêu cầu volume cao nhưng không quy định cụ thể phải gấp 3.'',
                    incorrect: ''✗ Sai! Đáp án này là một phần của checklist 8 điểm. "Volume tăng gấp 3 lần" mới là điều kiện KHÔNG có trong checklist.''
                },
                2: {
                    correct: ''✓ Chính xác! Zone bị test 3 lần trở lên được coi là yếu vì lực mua tại đó đã cạn dần.'',
                    incorrect: ''✗ Sai! Zone bị test 3 lần trở lên được coi là yếu. Zone fresh hoặc test 1-2 lần vẫn còn mạnh.''
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
                                messageDiv.textContent = ''🎉 Xuất sắc! Bạn đã nắm vững checklist UPU!'';
                            } else if (correctCount >= 1) {
                                messageDiv.textContent = ''👍 Tốt! Ôn lại checklist để nhớ lâu hơn nhé!'';
                            } else {
                                messageDiv.textContent = ''📚 Đọc lại checklist 8 điểm và in ra dán cạnh màn hình!'';
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
    <title>Bài 3.5: Checklist Xác Nhận UPU | GEM Trading Academy</title>

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
        .orb-3 { width: 250px; height: 250px; background: var(--success); bottom: -50px; right: 20%; }

        .lesson-container { max-width: 800px; margin: 0 auto; padding: 1.5rem; }
        @media (max-width: 600px) { .lesson-container { padding: 0; } }

        .lesson-header { text-align: center; padding: var(--space-xl); margin-bottom: var(--space-xl); background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); box-shadow: 0 4px 24px rgba(0,0,0,0.2); }
        @media (max-width: 600px) { .lesson-header { padding: var(--space-lg) 16px; margin-bottom: 0; border: none; border-radius: 0; box-shadow: none; border-bottom: 8px solid var(--bg-primary); } }
        .lesson-badge { display: inline-flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); background: linear-gradient(135deg, var(--success), #00A844); border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: var(--space-md); }
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

        .warning-box { background: linear-gradient(135deg, rgba(156, 6, 18, 0.2), rgba(156, 6, 18, 0.05)); border: 1px solid rgba(156, 6, 18, 0.4); border-radius: var(--radius-md); padding: var(--space-lg); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .warning-box { border: none; border-radius: 0; border-left: 4px solid var(--burgundy); padding: var(--space-md) 16px; margin: var(--space-md) 0; } }
        .warning-box-title { font-weight: 700; color: var(--burgundy-light); margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }

        .image-container { margin: var(--space-xl) 0; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--glass-border); }
        @media (max-width: 600px) { .image-container { margin: var(--space-md) 0; border-radius: 0; border: none; } }
        .image-caption { padding: var(--space-sm); font-size: 0.85rem; color: var(--text-muted); font-style: italic; text-align: center; }
        @media (max-width: 600px) { .image-caption { padding: var(--space-sm) 16px; } }

        .checklist { list-style: none; margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .checklist { margin: var(--space-md) 0; background: var(--glass-border); } }
        .checklist-item { display: flex; align-items: flex-start; gap: var(--space-md); padding: var(--space-md); background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); margin-bottom: var(--space-sm); }
        @media (max-width: 600px) { .checklist-item { padding: var(--space-md) 16px; border: none; border-radius: 0; margin-bottom: 0; border-left: 4px solid var(--gold); } }
        .checklist-icon { width: 24px; height: 24px; min-width: 24px; background: var(--glass-bg); border: 2px solid var(--gold); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--gold); font-size: 0.8rem; }
        .checklist-text { color: var(--text-secondary); flex: 1; }

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
                <span>📈</span>
                <span>Bullish Pattern</span>
            </div>
            <div class="lesson-chapter">Chapter 3 - UPU Pattern Mastery</div>
            <h1 class="lesson-title">Checklist Xác Nhận UPU</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 3.5</span></div>
                <div class="meta-item"><span>⏱️</span><span>6 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <section class="section">
            <h2 class="section-title"><span>🎯</span> Mục Tiêu Bài Học</h2>
            <p>Sau khi hoàn thành bài học này, bạn sẽ có một checklist đầy đủ 8 điểm để xác nhận pattern UPU trước khi vào lệnh và biết cách tránh những lỗi phổ biến.</p>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>💡</span> Tại Sao Cần Checklist?</div>
                <p>Checklist giúp bạn có quy trình rõ ràng, loại bỏ cảm xúc và đảm bảo mọi điều kiện được đáp ứng trước khi vào lệnh. <strong>Traders chuyên nghiệp không bao giờ bỏ qua checklist.</strong></p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>✅</span> Checklist 8 Điểm Xác Nhận UPU</h2>
            <p>Luôn kiểm tra đầy đủ 8 điều kiện sau trước khi vào lệnh LONG:</p>

            <ul class="checklist">
                <li class="checklist-item">
                    <span class="checklist-icon">1</span>
                    <span class="checklist-text"><strong>Phase 1 tăng ≥2%:</strong> Đợt tăng đầu tiên phải rõ ràng, có ít nhất 2% biến động và volume cao</span>
                </li>
                <li class="checklist-item">
                    <span class="checklist-icon">2</span>
                    <span class="checklist-text"><strong>Phase 2 range <1.5%:</strong> Vùng Pause phải hẹp, không quá rộng, từ 1-5 nến</span>
                </li>
                <li class="checklist-item">
                    <span class="checklist-icon">3</span>
                    <span class="checklist-text"><strong>Phase 3 tăng ≥2%:</strong> Đợt tăng thứ hai phải tiếp tục mạnh mẽ, xác nhận pattern</span>
                </li>
                <li class="checklist-item">
                    <span class="checklist-icon">4</span>
                    <span class="checklist-text"><strong>Giá đã quay lại test LFZ:</strong> Giá PHẢI pullback về vùng LFZ, không entry khi breakout</span>
                </li>
                <li class="checklist-item">
                    <span class="checklist-icon">5</span>
                    <span class="checklist-text"><strong>Có nến xác nhận bullish:</strong> Phải có Hammer, Bullish Engulfing hoặc Morning Star</span>
                </li>
                <li class="checklist-item">
                    <span class="checklist-icon">6</span>
                    <span class="checklist-text"><strong>Zone chưa bị phá:</strong> Giá không được đóng cửa dưới đáy LFZ trước đó</span>
                </li>
                <li class="checklist-item">
                    <span class="checklist-icon">7</span>
                    <span class="checklist-text"><strong>Zone đã test <3 lần:</strong> Zone fresh hoặc chỉ bị test 1-2 lần vẫn còn mạnh</span>
                </li>
                <li class="checklist-item">
                    <span class="checklist-icon">8</span>
                    <span class="checklist-text"><strong>R:R ≥ 1:2:</strong> Tỷ lệ Risk:Reward phải từ 1:2 trở lên mới đủ hấp dẫn</span>
                </li>
            </ul>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/00C853?text=UPU+Checklist+8+Points" alt="UPU Checklist">
            </div>
            <div class="image-caption">Hình 1: Checklist 8 điểm xác nhận UPU - In ra và dán cạnh màn hình!</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>⚠️</span> Những Lỗi Phổ Biến Cần Tránh</h2>
            <p>Hầu hết traders mới đều mắc các lỗi này. Hãy học từ sai lầm của người khác!</p>

            <div class="flow-steps">
                <div class="flow-step">
                    <div class="flow-step-number">❌</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Lỗi 1: Entry Khi Breakout</div>
                        <div class="flow-step-desc">FOMO mua ngay khi giá phá đỉnh Phase 3. Đây là lỗi kinh điển khiến bạn mua đỉnh.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">❌</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Lỗi 2: Bỏ Qua Nến Xác Nhận</div>
                        <div class="flow-step-desc">Vào lệnh ngay khi giá chạm LFZ mà không đợi nến bullish xác nhận.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">❌</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Lỗi 3: Zone Quá Rộng</div>
                        <div class="flow-step-desc">Vẽ zone với Phase 2 range >1.5%. Zone rộng = SL xa = R:R kém.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">❌</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Lỗi 4: Trade Zone Đã Yếu</div>
                        <div class="flow-step-desc">Vào lệnh tại zone đã bị test 3+ lần. Zone càng test nhiều càng yếu.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">❌</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Lỗi 5: Bỏ Qua R:R</div>
                        <div class="flow-step-desc">Vào lệnh với R:R <1:2. Dù win rate cao nhưng lợi nhuận không đủ bù lỗ.</div>
                    </div>
                </div>
            </div>

            <div class="warning-box">
                <div class="warning-box-title"><span>🚫</span> Quy Tắc Sắt: NO Checklist = NO Trade</div>
                <p>Nếu BẤT KỲ điều kiện nào trong checklist không được đáp ứng, <strong>KHÔNG VÀO LỆNH.</strong> Thà bỏ lỡ cơ hội còn hơn mất tiền do vi phạm kỷ luật.</p>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/FF5252?text=Common+UPU+Mistakes" alt="Common Mistakes">
            </div>
            <div class="image-caption">Hình 2: 5 lỗi phổ biến khi giao dịch UPU - Hãy tránh xa!</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📊</span> So Sánh: Setup Tốt vs Setup Xấu</h2>
            <p>Hãy xem sự khác biệt giữa một setup UPU chất lượng và một setup kém chất lượng.</p>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/FFBD59?text=Good+vs+Bad+UPU+Setup" alt="Good vs Bad Setup">
            </div>
            <div class="image-caption">Hình 3: So sánh setup UPU tốt (trái) và setup xấu (phải)</div>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>✅</span> Setup Tốt Có Đặc Điểm</div>
                <p>Phase 1 rõ ràng với volume cao → Phase 2 hẹp 1-3 nến → Phase 3 mạnh → Giá retest LFZ → Nến xác nhận rõ → Zone fresh → R:R > 1:2</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📝</span> Tổng Kết</h2>

            <div class="summary-box">
                <div class="summary-title"><span>🎯</span> Điểm Chính</div>
                <ul class="summary-list">
                    <li>Checklist 8 điểm: Phase 1 ≥2%, Phase 2 <1.5%, Phase 3 ≥2%, Retest, Confirmation, Zone intact, <3 tests, R:R ≥1:2</li>
                    <li>5 lỗi phổ biến: Entry breakout, bỏ qua confirmation, zone rộng, zone yếu, bỏ qua R:R</li>
                    <li>Quy tắc sắt: NO Checklist = NO Trade</li>
                    <li>In checklist ra và dán cạnh màn hình để nhắc nhở mỗi khi giao dịch</li>
                </ul>
            </div>
        </section>

        <section class="quiz-section">
            <div class="quiz-header">
                <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>
                <p class="quiz-subtitle">Chọn đáp án để nhận phản hồi ngay lập tức</p>
            </div>

            <div class="quiz-question" data-question="1" data-correct="D">
                <div class="question-number">1</div>
                <div class="question-text">Trong checklist 8 điểm, điều kiện nào sau đây KHÔNG nằm trong danh sách?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Phase 1 tăng ≥2%</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Zone đã test <3 lần</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">R:R ≥ 1:2</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Volume phải tăng gấp 3 lần</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-question" data-question="2" data-correct="B">
                <div class="question-number">2</div>
                <div class="question-text">Khi zone đã bị test bao nhiêu lần thì được coi là "yếu" và nên tránh?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">1 lần</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">3 lần trở lên</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">5 lần trở lên</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Không quan trọng số lần test</span>
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
                    correct: ''✓ Chính xác! "Volume tăng gấp 3 lần" không nằm trong checklist. Checklist yêu cầu volume cao nhưng không quy định cụ thể phải gấp 3.'',
                    incorrect: ''✗ Sai! Đáp án này là một phần của checklist 8 điểm. "Volume tăng gấp 3 lần" mới là điều kiện KHÔNG có trong checklist.''
                },
                2: {
                    correct: ''✓ Chính xác! Zone bị test 3 lần trở lên được coi là yếu vì lực mua tại đó đã cạn dần.'',
                    incorrect: ''✗ Sai! Zone bị test 3 lần trở lên được coi là yếu. Zone fresh hoặc test 1-2 lần vẫn còn mạnh.''
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
                                messageDiv.textContent = ''🎉 Xuất sắc! Bạn đã nắm vững checklist UPU!'';
                            } else if (correctCount >= 1) {
                                messageDiv.textContent = ''👍 Tốt! Ôn lại checklist để nhớ lâu hơn nhé!'';
                            } else {
                                messageDiv.textContent = ''📚 Đọc lại checklist 8 điểm và in ra dán cạnh màn hình!'';
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

-- Lesson 3.6: Ví Dụ Thực Tế UPU
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-1-ch3-l6',
  'module-tier-1-ch3',
  'course-tier1-trading-foundation',
  'Bài 3.6: Ví Dụ Thực Tế UPU',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 3.6: Ví Dụ Thực Tế UPU | GEM Trading Academy</title>

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
        .orb-3 { width: 250px; height: 250px; background: var(--success); bottom: -50px; right: 20%; }

        .lesson-container { max-width: 800px; margin: 0 auto; padding: 1.5rem; }
        @media (max-width: 600px) { .lesson-container { padding: 0; } }

        .lesson-header { text-align: center; padding: var(--space-xl); margin-bottom: var(--space-xl); background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); box-shadow: 0 4px 24px rgba(0,0,0,0.2); }
        @media (max-width: 600px) { .lesson-header { padding: var(--space-lg) 16px; margin-bottom: 0; border: none; border-radius: 0; box-shadow: none; border-bottom: 8px solid var(--bg-primary); } }
        .lesson-badge { display: inline-flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); background: linear-gradient(135deg, var(--success), #00A844); border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: var(--space-md); }
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

        .image-container { margin: var(--space-xl) 0; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--glass-border); }
        @media (max-width: 600px) { .image-container { margin: var(--space-md) 0; border-radius: 0; border: none; } }
        .image-caption { padding: var(--space-sm); font-size: 0.85rem; color: var(--text-muted); font-style: italic; text-align: center; }
        @media (max-width: 600px) { .image-caption { padding: var(--space-sm) 16px; } }

        .example-box { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); overflow: hidden; margin: var(--space-xl) 0; }
        @media (max-width: 600px) { .example-box { border: none; border-radius: 0; margin: var(--space-md) 0; } }
        .example-header { background: linear-gradient(135deg, var(--success), #00A844); padding: var(--space-md) var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); font-weight: 700; }
        @media (max-width: 600px) { .example-header { padding: var(--space-md) 16px; } }
        .example-content { padding: var(--space-lg); }
        @media (max-width: 600px) { .example-content { padding: var(--space-md) 16px; } }
        .example-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-md); }
        @media (max-width: 600px) { .example-grid { grid-template-columns: 1fr; gap: var(--space-sm); } }
        .example-detail-label { font-size: 0.8rem; color: var(--text-muted); }
        .example-detail-value { font-weight: 700; }
        .example-detail-value.entry { color: var(--success); }
        .example-detail-value.stop { color: var(--error); }
        .example-detail-value.target { color: var(--cyan); }
        .example-detail-value.result { color: var(--gold); }

        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .stats-grid { gap: 1px; background: var(--glass-border); margin: var(--space-md) 0; } }
        .stat-card { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); text-align: center; }
        @media (max-width: 600px) { .stat-card { border: none; border-radius: 0; padding: var(--space-md); } }
        .stat-value { font-size: 1.75rem; font-weight: 800; background: linear-gradient(135deg, var(--gold), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        @media (max-width: 600px) { .stat-value { font-size: 1.25rem; } }
        .stat-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }

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
                <span>📈</span>
                <span>Bullish Pattern</span>
            </div>
            <div class="lesson-chapter">Chapter 3 - UPU Pattern Mastery</div>
            <h1 class="lesson-title">Ví Dụ Thực Tế UPU</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 3.6</span></div>
                <div class="meta-item"><span>⏱️</span><span>10 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <section class="section">
            <h2 class="section-title"><span>🎯</span> Mục Tiêu Bài Học</h2>
            <p>Trong bài học này, chúng ta sẽ phân tích 2 ví dụ thực tế về pattern UPU trên các cặp tiền điện tử phổ biến. Mỗi ví dụ sẽ được phân tích chi tiết từng phase.</p>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>💡</span> Học Từ Thực Tế</div>
                <p><strong>Lý thuyết không đủ.</strong> Phân tích nhiều ví dụ thực tế sẽ giúp bạn nhận diện pattern nhanh và chính xác hơn khi giao dịch thật.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📊</span> Ví Dụ 1: SOL/USDT - Khung H4</h2>
            <p>Đây là một ví dụ UPU kinh điển trên SOL/USDT khung H4, cho thấy cách pattern hoạt động trong xu hướng tăng mạnh.</p>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/00C853?text=SOL+UPU+Example+H4+Chart" alt="SOL UPU Example">
            </div>
            <div class="image-caption">Hình 1: Pattern UPU trên SOL/USDT H4 - Phân tích đầy đủ 3 phases</div>

            <div class="flow-steps">
                <div class="flow-step">
                    <div class="flow-step-number">1</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Phase 1: UP - Đợt Tăng Đầu Tiên</div>
                        <div class="flow-step-desc">SOL tăng từ $85 lên $98 trong 8 nến H4 (tăng 15.3%). Volume tăng cao, cho thấy lực mua mạnh. Đây là đợt tích lũy của Smart Money.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">2</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Phase 2: PAUSE - Vùng Tích Lũy (LFZ)</div>
                        <div class="flow-step-desc">Giá đi ngang trong range $96-$98 suốt 4 nến H4. Volume giảm dần. Đây là vùng Smart Money tiếp tục tích lũy thêm → TẠO LFZ.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">3</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Phase 3: UP - Đợt Tăng Tiếp Theo</div>
                        <div class="flow-step-desc">Giá bứt phá từ $98 lên $115 (tăng 17.3%). Volume đột biến, xác nhận pattern hoàn chỉnh. Retail bắt đầu FOMO mua đuổi.</div>
                    </div>
                </div>
            </div>

            <div class="example-box">
                <div class="example-header">
                    <span>📈</span>
                    <span>Chi Tiết Giao Dịch SOL/USDT</span>
                </div>
                <div class="example-content">
                    <div class="example-grid">
                        <div class="example-detail">
                            <div class="example-detail-label">Entry LONG (tại LFZ)</div>
                            <div class="example-detail-value entry">$97.50</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Stop Loss (dưới LFZ - 0.5%)</div>
                            <div class="example-detail-value stop">$95.52</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Target 1 (1:1 R:R)</div>
                            <div class="example-detail-value target">$99.48</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Target 2 (1:2 R:R)</div>
                            <div class="example-detail-value target">$101.46</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Kết Quả Thực Tế</div>
                            <div class="example-detail-value result">TP2 HIT - +4.1%</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Thời Gian Giữ Lệnh</div>
                            <div class="example-detail-value">16 giờ</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="definition-box">
                <div class="definition-box-title"><span>📖</span> Phân Tích Kết Quả</div>
                <p>Lệnh này đạt TP2 trong 16 giờ với lợi nhuận +4.1%. Nếu giữ tiếp, giá SOL đã tăng lên $115 (+18% từ entry). <strong>Kiên nhẫn chờ retest = lợi nhuận lớn hơn.</strong></p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📊</span> Ví Dụ 2: BNB/USDT - Khung 1D</h2>
            <p>Ví dụ thứ hai trên BNB/USDT khung 1D (Daily), cho thấy UPU hoạt động tốt trên khung thời gian lớn hơn.</p>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/FFBD59?text=BNB+UPU+Example+1D+Chart" alt="BNB UPU Example">
            </div>
            <div class="image-caption">Hình 2: Pattern UPU trên BNB/USDT Daily - Setup swing trade</div>

            <div class="flow-steps">
                <div class="flow-step">
                    <div class="flow-step-number">1</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Phase 1: UP - Rally Mạnh</div>
                        <div class="flow-step-desc">BNB rally từ $280 lên $340 trong 12 ngày (tăng 21.4%). Volume cao liên tục cho thấy dòng tiền lớn đổ vào.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">2</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Phase 2: PAUSE - Consolidation</div>
                        <div class="flow-step-desc">Giá consolidate trong range $335-$345 suốt 5 ngày. Nến thân nhỏ, volume giảm → TẠO LFZ tại $335-$345.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">3</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Phase 3: UP - Continuation</div>
                        <div class="flow-step-desc">Breakout từ $345 lên $420 (tăng 21.7%). Volume bùng nổ, xác nhận xu hướng tăng tiếp tục.</div>
                    </div>
                </div>
            </div>

            <div class="example-box">
                <div class="example-header">
                    <span>📈</span>
                    <span>Chi Tiết Giao Dịch BNB/USDT</span>
                </div>
                <div class="example-content">
                    <div class="example-grid">
                        <div class="example-detail">
                            <div class="example-detail-label">Entry LONG (retest LFZ)</div>
                            <div class="example-detail-value entry">$342</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Stop Loss</div>
                            <div class="example-detail-value stop">$333</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Target 1 (1:1)</div>
                            <div class="example-detail-value target">$351</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Target 2 (1:2)</div>
                            <div class="example-detail-value target">$360</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Kết Quả Thực Tế</div>
                            <div class="example-detail-value result">TP2 HIT - +5.3%</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Thời Gian Giữ Lệnh</div>
                            <div class="example-detail-value">4 ngày</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/00F0FF?text=BNB+Entry+Confirmation" alt="BNB Entry Confirmation">
            </div>
            <div class="image-caption">Hình 3: Nến xác nhận Bullish Engulfing tại LFZ của BNB</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📈</span> Thống Kê 2 Ví Dụ</h2>
            <p>Cả hai giao dịch đều thắng với tỷ lệ R:R tốt:</p>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">2/2</div>
                    <div class="stat-label">Win Rate</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">1:2</div>
                    <div class="stat-label">Trung Bình R:R</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">+9.4%</div>
                    <div class="stat-label">Tổng Lợi Nhuận</div>
                </div>
            </div>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>💡</span> Bài Học Rút Ra</div>
                <p>Cả hai ví dụ đều tuân thủ nguyên tắc <strong>đợi retest</strong>. Nếu FOMO mua khi breakout Phase 3, bạn sẽ mua ở giá cao hơn 3-5% và SL rộng hơn. Kiên nhẫn = Lợi nhuận lớn hơn.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📝</span> Tổng Kết Chapter 3</h2>

            <div class="summary-box">
                <div class="summary-title"><span>🎯</span> UPU Pattern Mastery - Hoàn Thành!</div>
                <ul class="summary-list">
                    <li>UPU là pattern tiếp diễn xu hướng tăng với Win Rate 71%</li>
                    <li>Cấu trúc: UP → PAUSE (tạo LFZ) → UP</li>
                    <li>Entry LONG khi giá retest LFZ + có nến xác nhận bullish</li>
                    <li>SL dưới LFZ - 0.5%, Target tối thiểu 1:2 R:R</li>
                    <li>Checklist 8 điểm giúp đảm bảo kỷ luật giao dịch</li>
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
                <div class="question-text">Trong ví dụ SOL/USDT, vùng LFZ được xác định ở range nào?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">$85 - $90</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">$90 - $95</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">$96 - $98</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">$100 - $105</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-question" data-question="2" data-correct="B">
                <div class="question-number">2</div>
                <div class="question-text">Tại sao đợi retest thay vì mua khi breakout cho kết quả tốt hơn?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Vì mua breakout luôn thua lỗ</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Vì entry thấp hơn, SL chặt hơn, R:R tốt hơn</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Vì giá luôn retest 100% các trường hợp</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Vì có thể dùng leverage cao hơn</span>
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
                    correct: ''✓ Chính xác! LFZ của SOL được xác định tại Phase 2, nơi giá đi ngang trong range $96-$98.'',
                    incorrect: ''✗ Sai! Xem lại bài học - LFZ được tạo tại Phase 2, trong ví dụ này là vùng $96-$98.''
                },
                2: {
                    correct: ''✓ Chính xác! Đợi retest cho phép entry ở giá thấp hơn, đặt SL chặt hơn, từ đó có R:R tốt hơn.'',
                    incorrect: ''✗ Sai! Lý do chính là entry retest cho giá tốt hơn và SL chặt hơn, cải thiện R:R đáng kể.''
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
                                messageDiv.textContent = ''🎉 Xuất sắc! Bạn đã hoàn thành Chapter 3 - UPU Pattern Mastery!'';
                            } else if (correctCount >= 1) {
                                messageDiv.textContent = ''👍 Tốt! Xem lại các ví dụ để hiểu sâu hơn nhé!'';
                            } else {
                                messageDiv.textContent = ''📚 Đọc lại phần phân tích ví dụ để nắm vững kiến thức!'';
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
    <title>Bài 3.6: Ví Dụ Thực Tế UPU | GEM Trading Academy</title>

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
        .orb-3 { width: 250px; height: 250px; background: var(--success); bottom: -50px; right: 20%; }

        .lesson-container { max-width: 800px; margin: 0 auto; padding: 1.5rem; }
        @media (max-width: 600px) { .lesson-container { padding: 0; } }

        .lesson-header { text-align: center; padding: var(--space-xl); margin-bottom: var(--space-xl); background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); box-shadow: 0 4px 24px rgba(0,0,0,0.2); }
        @media (max-width: 600px) { .lesson-header { padding: var(--space-lg) 16px; margin-bottom: 0; border: none; border-radius: 0; box-shadow: none; border-bottom: 8px solid var(--bg-primary); } }
        .lesson-badge { display: inline-flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); background: linear-gradient(135deg, var(--success), #00A844); border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: var(--space-md); }
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

        .image-container { margin: var(--space-xl) 0; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--glass-border); }
        @media (max-width: 600px) { .image-container { margin: var(--space-md) 0; border-radius: 0; border: none; } }
        .image-caption { padding: var(--space-sm); font-size: 0.85rem; color: var(--text-muted); font-style: italic; text-align: center; }
        @media (max-width: 600px) { .image-caption { padding: var(--space-sm) 16px; } }

        .example-box { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); overflow: hidden; margin: var(--space-xl) 0; }
        @media (max-width: 600px) { .example-box { border: none; border-radius: 0; margin: var(--space-md) 0; } }
        .example-header { background: linear-gradient(135deg, var(--success), #00A844); padding: var(--space-md) var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); font-weight: 700; }
        @media (max-width: 600px) { .example-header { padding: var(--space-md) 16px; } }
        .example-content { padding: var(--space-lg); }
        @media (max-width: 600px) { .example-content { padding: var(--space-md) 16px; } }
        .example-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-md); }
        @media (max-width: 600px) { .example-grid { grid-template-columns: 1fr; gap: var(--space-sm); } }
        .example-detail-label { font-size: 0.8rem; color: var(--text-muted); }
        .example-detail-value { font-weight: 700; }
        .example-detail-value.entry { color: var(--success); }
        .example-detail-value.stop { color: var(--error); }
        .example-detail-value.target { color: var(--cyan); }
        .example-detail-value.result { color: var(--gold); }

        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md); margin: var(--space-lg) 0; }
        @media (max-width: 600px) { .stats-grid { gap: 1px; background: var(--glass-border); margin: var(--space-md) 0; } }
        .stat-card { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-lg); text-align: center; }
        @media (max-width: 600px) { .stat-card { border: none; border-radius: 0; padding: var(--space-md); } }
        .stat-value { font-size: 1.75rem; font-weight: 800; background: linear-gradient(135deg, var(--gold), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        @media (max-width: 600px) { .stat-value { font-size: 1.25rem; } }
        .stat-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }

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
                <span>📈</span>
                <span>Bullish Pattern</span>
            </div>
            <div class="lesson-chapter">Chapter 3 - UPU Pattern Mastery</div>
            <h1 class="lesson-title">Ví Dụ Thực Tế UPU</h1>
            <div class="lesson-meta">
                <div class="meta-item"><span>📚</span><span>Bài 3.6</span></div>
                <div class="meta-item"><span>⏱️</span><span>10 phút đọc</span></div>
                <div class="meta-item"><span>📝</span><span>2 câu quiz</span></div>
            </div>
        </header>

        <section class="section">
            <h2 class="section-title"><span>🎯</span> Mục Tiêu Bài Học</h2>
            <p>Trong bài học này, chúng ta sẽ phân tích 2 ví dụ thực tế về pattern UPU trên các cặp tiền điện tử phổ biến. Mỗi ví dụ sẽ được phân tích chi tiết từng phase.</p>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>💡</span> Học Từ Thực Tế</div>
                <p><strong>Lý thuyết không đủ.</strong> Phân tích nhiều ví dụ thực tế sẽ giúp bạn nhận diện pattern nhanh và chính xác hơn khi giao dịch thật.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📊</span> Ví Dụ 1: SOL/USDT - Khung H4</h2>
            <p>Đây là một ví dụ UPU kinh điển trên SOL/USDT khung H4, cho thấy cách pattern hoạt động trong xu hướng tăng mạnh.</p>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/00C853?text=SOL+UPU+Example+H4+Chart" alt="SOL UPU Example">
            </div>
            <div class="image-caption">Hình 1: Pattern UPU trên SOL/USDT H4 - Phân tích đầy đủ 3 phases</div>

            <div class="flow-steps">
                <div class="flow-step">
                    <div class="flow-step-number">1</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Phase 1: UP - Đợt Tăng Đầu Tiên</div>
                        <div class="flow-step-desc">SOL tăng từ $85 lên $98 trong 8 nến H4 (tăng 15.3%). Volume tăng cao, cho thấy lực mua mạnh. Đây là đợt tích lũy của Smart Money.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">2</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Phase 2: PAUSE - Vùng Tích Lũy (LFZ)</div>
                        <div class="flow-step-desc">Giá đi ngang trong range $96-$98 suốt 4 nến H4. Volume giảm dần. Đây là vùng Smart Money tiếp tục tích lũy thêm → TẠO LFZ.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">3</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Phase 3: UP - Đợt Tăng Tiếp Theo</div>
                        <div class="flow-step-desc">Giá bứt phá từ $98 lên $115 (tăng 17.3%). Volume đột biến, xác nhận pattern hoàn chỉnh. Retail bắt đầu FOMO mua đuổi.</div>
                    </div>
                </div>
            </div>

            <div class="example-box">
                <div class="example-header">
                    <span>📈</span>
                    <span>Chi Tiết Giao Dịch SOL/USDT</span>
                </div>
                <div class="example-content">
                    <div class="example-grid">
                        <div class="example-detail">
                            <div class="example-detail-label">Entry LONG (tại LFZ)</div>
                            <div class="example-detail-value entry">$97.50</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Stop Loss (dưới LFZ - 0.5%)</div>
                            <div class="example-detail-value stop">$95.52</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Target 1 (1:1 R:R)</div>
                            <div class="example-detail-value target">$99.48</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Target 2 (1:2 R:R)</div>
                            <div class="example-detail-value target">$101.46</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Kết Quả Thực Tế</div>
                            <div class="example-detail-value result">TP2 HIT - +4.1%</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Thời Gian Giữ Lệnh</div>
                            <div class="example-detail-value">16 giờ</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="definition-box">
                <div class="definition-box-title"><span>📖</span> Phân Tích Kết Quả</div>
                <p>Lệnh này đạt TP2 trong 16 giờ với lợi nhuận +4.1%. Nếu giữ tiếp, giá SOL đã tăng lên $115 (+18% từ entry). <strong>Kiên nhẫn chờ retest = lợi nhuận lớn hơn.</strong></p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📊</span> Ví Dụ 2: BNB/USDT - Khung 1D</h2>
            <p>Ví dụ thứ hai trên BNB/USDT khung 1D (Daily), cho thấy UPU hoạt động tốt trên khung thời gian lớn hơn.</p>

            <div class="image-container">
                <img src="https://placehold.co/800x500/112250/FFBD59?text=BNB+UPU+Example+1D+Chart" alt="BNB UPU Example">
            </div>
            <div class="image-caption">Hình 2: Pattern UPU trên BNB/USDT Daily - Setup swing trade</div>

            <div class="flow-steps">
                <div class="flow-step">
                    <div class="flow-step-number">1</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Phase 1: UP - Rally Mạnh</div>
                        <div class="flow-step-desc">BNB rally từ $280 lên $340 trong 12 ngày (tăng 21.4%). Volume cao liên tục cho thấy dòng tiền lớn đổ vào.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">2</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Phase 2: PAUSE - Consolidation</div>
                        <div class="flow-step-desc">Giá consolidate trong range $335-$345 suốt 5 ngày. Nến thân nhỏ, volume giảm → TẠO LFZ tại $335-$345.</div>
                    </div>
                </div>
                <div class="flow-step">
                    <div class="flow-step-number">3</div>
                    <div class="flow-step-content">
                        <div class="flow-step-title">Phase 3: UP - Continuation</div>
                        <div class="flow-step-desc">Breakout từ $345 lên $420 (tăng 21.7%). Volume bùng nổ, xác nhận xu hướng tăng tiếp tục.</div>
                    </div>
                </div>
            </div>

            <div class="example-box">
                <div class="example-header">
                    <span>📈</span>
                    <span>Chi Tiết Giao Dịch BNB/USDT</span>
                </div>
                <div class="example-content">
                    <div class="example-grid">
                        <div class="example-detail">
                            <div class="example-detail-label">Entry LONG (retest LFZ)</div>
                            <div class="example-detail-value entry">$342</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Stop Loss</div>
                            <div class="example-detail-value stop">$333</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Target 1 (1:1)</div>
                            <div class="example-detail-value target">$351</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Target 2 (1:2)</div>
                            <div class="example-detail-value target">$360</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Kết Quả Thực Tế</div>
                            <div class="example-detail-value result">TP2 HIT - +5.3%</div>
                        </div>
                        <div class="example-detail">
                            <div class="example-detail-label">Thời Gian Giữ Lệnh</div>
                            <div class="example-detail-value">4 ngày</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="image-container">
                <img src="https://placehold.co/800x400/112250/00F0FF?text=BNB+Entry+Confirmation" alt="BNB Entry Confirmation">
            </div>
            <div class="image-caption">Hình 3: Nến xác nhận Bullish Engulfing tại LFZ của BNB</div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📈</span> Thống Kê 2 Ví Dụ</h2>
            <p>Cả hai giao dịch đều thắng với tỷ lệ R:R tốt:</p>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">2/2</div>
                    <div class="stat-label">Win Rate</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">1:2</div>
                    <div class="stat-label">Trung Bình R:R</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">+9.4%</div>
                    <div class="stat-label">Tổng Lợi Nhuận</div>
                </div>
            </div>

            <div class="highlight-box">
                <div class="highlight-box-title"><span>💡</span> Bài Học Rút Ra</div>
                <p>Cả hai ví dụ đều tuân thủ nguyên tắc <strong>đợi retest</strong>. Nếu FOMO mua khi breakout Phase 3, bạn sẽ mua ở giá cao hơn 3-5% và SL rộng hơn. Kiên nhẫn = Lợi nhuận lớn hơn.</p>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title"><span>📝</span> Tổng Kết Chapter 3</h2>

            <div class="summary-box">
                <div class="summary-title"><span>🎯</span> UPU Pattern Mastery - Hoàn Thành!</div>
                <ul class="summary-list">
                    <li>UPU là pattern tiếp diễn xu hướng tăng với Win Rate 71%</li>
                    <li>Cấu trúc: UP → PAUSE (tạo LFZ) → UP</li>
                    <li>Entry LONG khi giá retest LFZ + có nến xác nhận bullish</li>
                    <li>SL dưới LFZ - 0.5%, Target tối thiểu 1:2 R:R</li>
                    <li>Checklist 8 điểm giúp đảm bảo kỷ luật giao dịch</li>
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
                <div class="question-text">Trong ví dụ SOL/USDT, vùng LFZ được xác định ở range nào?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">$85 - $90</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">$90 - $95</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">$96 - $98</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">$100 - $105</span>
                    </div>
                </div>
                <div class="question-feedback">
                    <div class="feedback-title"></div>
                    <div class="feedback-text"></div>
                </div>
            </div>

            <div class="quiz-question" data-question="2" data-correct="B">
                <div class="question-number">2</div>
                <div class="question-text">Tại sao đợi retest thay vì mua khi breakout cho kết quả tốt hơn?</div>
                <div class="quiz-options">
                    <div class="quiz-option" data-option="A">
                        <span class="option-marker">A</span>
                        <span class="option-text">Vì mua breakout luôn thua lỗ</span>
                    </div>
                    <div class="quiz-option" data-option="B">
                        <span class="option-marker">B</span>
                        <span class="option-text">Vì entry thấp hơn, SL chặt hơn, R:R tốt hơn</span>
                    </div>
                    <div class="quiz-option" data-option="C">
                        <span class="option-marker">C</span>
                        <span class="option-text">Vì giá luôn retest 100% các trường hợp</span>
                    </div>
                    <div class="quiz-option" data-option="D">
                        <span class="option-marker">D</span>
                        <span class="option-text">Vì có thể dùng leverage cao hơn</span>
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
                    correct: ''✓ Chính xác! LFZ của SOL được xác định tại Phase 2, nơi giá đi ngang trong range $96-$98.'',
                    incorrect: ''✗ Sai! Xem lại bài học - LFZ được tạo tại Phase 2, trong ví dụ này là vùng $96-$98.''
                },
                2: {
                    correct: ''✓ Chính xác! Đợi retest cho phép entry ở giá thấp hơn, đặt SL chặt hơn, từ đó có R:R tốt hơn.'',
                    incorrect: ''✗ Sai! Lý do chính là entry retest cho giá tốt hơn và SL chặt hơn, cải thiện R:R đáng kể.''
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
                                messageDiv.textContent = ''🎉 Xuất sắc! Bạn đã hoàn thành Chapter 3 - UPU Pattern Mastery!'';
                            } else if (correctCount >= 1) {
                                messageDiv.textContent = ''👍 Tốt! Xem lại các ví dụ để hiểu sâu hơn nhé!'';
                            } else {
                                messageDiv.textContent = ''📚 Đọc lại phần phân tích ví dụ để nắm vững kiến thức!'';
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

-- ✅ Done: 5 lessons
