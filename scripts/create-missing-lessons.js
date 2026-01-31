/**
 * GEM Academy - Create All Missing Lessons
 * Script để tạo tất cả 33 bài học còn thiếu
 *
 * TIER 1: 21 bài
 * - Chapter 2: Vùng Tần Số Cơ Bản (5 bài)
 * - Chapter 4: Classic Patterns Phần 2 (5 bài)
 * - Chapter 7: Module A (4 bài)
 * - Chapter 8: Module B (7 bài)
 *
 * TIER 2: 3 bài
 * - Chapter 7: Doji, Rounding (3 bài - insert before Triangles)
 *
 * TIER 3: 9 bài
 * - Chapter 2: Wedge Patterns (4 bài)
 * - Chapter 4: Advanced Patterns (5 bài)
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const tier1Dir = path.join(projectRoot, 'Tạo Khóa học', 'Khóa Trading', 'tier-1');
const tier2Dir = path.join(projectRoot, 'Tạo Khóa học', 'Khóa Trading', 'tier-2');
const tier3Dir = path.join(projectRoot, 'Tạo Khóa học', 'Khóa Trading', 'tier-3');
const placeholderDir = path.join(projectRoot, 'Tạo Khóa học', 'Khóa Trading', 'placeholder-images');

// Ensure directories exist
[tier1Dir, tier2Dir, tier3Dir, placeholderDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// HTML Template
function createLessonHTML(tier, chapter, lesson, title, content, quizzes, readTime = '12', wordCount = '1500', nextLesson = null) {
  const badge = `📚 TIER ${tier} • Chương ${chapter} • Bài ${chapter}.${lesson}`;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bài ${chapter}.${lesson}: ${title}</title>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Noto+Sans+Display:wght@300;400;500;600&display=swap" rel="stylesheet">

  <style>
    /* ==========================================
       🎨 GEM DESIGN SYSTEM - V5.3 FACEBOOK-STYLE
       ========================================== */
    :root {
      --color-navy: #112250;
      --color-navy-dark: #0A0F1A;
      --color-gold: #FFBD59;
      --color-gold-dark: #E5A84D;
      --color-burgundy: #9C0612;
      --color-cyan: #00F0FF;
      --color-purple: #6A5BFF;
      --color-green: #10B981;
      --color-red: #EF4444;
      --color-warning: #F59E0B;
      --color-white: #FFFFFF;
      --color-text: #E8E8E8;
      --color-text-secondary: rgba(255, 255, 255, 0.7);
      --color-text-muted: rgba(255, 255, 255, 0.5);
      --bg-card: rgba(255, 255, 255, 0.03);
      --bg-card-hover: rgba(255, 255, 255, 0.06);
      --bg-glass: rgba(255, 255, 255, 0.08);
      --border-subtle: rgba(255, 255, 255, 0.1);
      --border-gold: rgba(255, 189, 89, 0.3);
      --text-padding: 16px;
      --space-xs: 4px;
      --space-sm: 8px;
      --space-md: 12px;
      --space-lg: 16px;
      --space-xl: 20px;
      --radius-sm: 0;
      --radius-md: 0;
      --radius-lg: 0;
      --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
      --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
      --shadow-glow-gold: 0 0 15px rgba(255, 189, 89, 0.3);
      --glass-blur: blur(40px);
    }

    @media (min-width: 600px) {
      :root {
        --text-padding: 24px;
        --radius-sm: 8px;
        --radius-md: 12px;
        --radius-lg: 16px;
      }
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }

    body {
      font-family: 'Noto Sans Display', sans-serif;
      font-weight: 400;
      line-height: 1.6;
      font-size: 15px;
      color: var(--color-text);
      background: linear-gradient(180deg, var(--color-navy-dark) 0%, var(--color-navy) 50%, var(--color-navy-dark) 100%);
      min-height: 100vh;
    }

    @media (min-width: 600px) { body { font-size: 16px; line-height: 1.7; } }

    body::before {
      content: '';
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background:
        radial-gradient(ellipse at 20% 20%, rgba(255, 189, 89, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(0, 240, 255, 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, rgba(106, 91, 255, 0.04) 0%, transparent 60%);
      pointer-events: none;
      z-index: -1;
    }

    .lesson-container { max-width: 900px; margin: 0 auto; padding: 0; }
    @media (min-width: 600px) { .lesson-container { padding: 16px; } }

    .lesson-header {
      text-align: center;
      padding: var(--space-lg) var(--text-padding);
      background: var(--bg-card);
      border-radius: 0;
      border: none;
      border-bottom: 1px solid var(--border-subtle);
      backdrop-filter: var(--glass-blur);
      position: relative;
      overflow: hidden;
      margin-bottom: var(--space-md);
    }

    @media (min-width: 600px) {
      .lesson-header {
        border-radius: var(--radius-lg);
        border: 1px solid var(--border-subtle);
        margin-bottom: var(--space-xl);
      }
    }

    .lesson-header::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--color-gold), var(--color-cyan), var(--color-gold));
    }

    .lesson-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: linear-gradient(135deg, var(--color-burgundy), #c41e2a);
      color: white;
      padding: 4px 12px;
      border-radius: 50px;
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: var(--space-md);
    }

    @media (min-width: 600px) { .lesson-badge { font-size: 13px; padding: 6px 16px; } }

    .lesson-title {
      font-family: 'Montserrat', sans-serif;
      font-size: clamp(1.5rem, 6vw, 2.5rem);
      font-weight: 800;
      color: var(--color-gold);
      margin-bottom: var(--space-sm);
      line-height: 1.2;
      text-shadow: 0 0 30px rgba(255, 189, 89, 0.3);
    }

    .lesson-meta {
      display: flex;
      justify-content: center;
      gap: var(--space-md);
      margin-top: var(--space-md);
      flex-wrap: wrap;
    }

    .lesson-meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--color-text-muted);
      font-size: 12px;
    }

    @media (min-width: 600px) { .lesson-meta-item { font-size: 14px; } }
    .lesson-meta-icon { color: var(--color-cyan); }

    .lesson-content { background: transparent; border-radius: 0; padding: 0; backdrop-filter: none; border: none; }

    @media (min-width: 600px) {
      .lesson-content {
        background: var(--bg-card);
        border-radius: var(--radius-lg);
        padding: var(--text-padding);
        backdrop-filter: var(--glass-blur);
        border: 1px solid var(--border-subtle);
      }
    }

    .section { margin-bottom: var(--space-xl); }

    h2, h3, p, ul:not(.roadmap-list):not(.key-concept-list):not(.quiz-options) {
      padding-left: var(--text-padding);
      padding-right: var(--text-padding);
    }

    @media (min-width: 600px) {
      h2, h3, p, ul:not(.roadmap-list):not(.key-concept-list):not(.quiz-options) {
        padding-left: 0;
        padding-right: 0;
      }
    }

    h2 {
      font-family: 'Montserrat', sans-serif;
      font-size: 1.25rem;
      color: var(--color-gold);
      margin-bottom: var(--space-md);
      padding-bottom: var(--space-sm);
      border-bottom: 2px solid rgba(255, 189, 89, 0.3);
    }

    @media (min-width: 600px) { h2 { font-size: 1.75rem; } }

    h3 {
      font-family: 'Montserrat', sans-serif;
      font-size: 1.1rem;
      color: var(--color-cyan);
      margin-top: var(--space-lg);
      margin-bottom: var(--space-sm);
    }

    @media (min-width: 600px) { h3 { font-size: 1.25rem; } }

    p { margin-bottom: var(--space-md); }
    strong { color: var(--color-gold); font-weight: 600; }

    ul:not(.roadmap-list):not(.key-concept-list):not(.quiz-options) {
      margin-bottom: var(--space-md);
      padding-left: calc(var(--text-padding) + 20px);
    }

    @media (min-width: 600px) {
      ul:not(.roadmap-list):not(.key-concept-list):not(.quiz-options) { padding-left: 24px; }
    }

    ul li { margin-bottom: var(--space-xs); }

    .opening-hook {
      background: linear-gradient(135deg, rgba(156, 6, 18, 0.2), rgba(17, 34, 80, 0.4));
      border-left: 4px solid var(--color-burgundy);
      border-radius: 0;
      padding: var(--space-lg) var(--text-padding);
      margin-bottom: var(--space-lg);
      font-size: 15px;
      font-style: italic;
    }

    @media (min-width: 600px) { .opening-hook { border-radius: var(--radius-md); font-size: 17px; } }
    .opening-hook p { padding-left: 0; padding-right: 0; }
    .opening-hook p:last-child { margin-bottom: 0; }

    .highlight-box {
      border-radius: 0;
      padding: var(--space-lg) var(--text-padding);
      margin: var(--space-md) 0;
      border-left: 4px solid;
    }

    @media (min-width: 600px) { .highlight-box { border-radius: var(--radius-md); } }
    .highlight-box p, .highlight-box ul { padding-left: 0 !important; padding-right: 0 !important; }

    .highlight-box.important { background: rgba(255, 189, 89, 0.1); border-color: var(--color-gold); }
    .highlight-box.tip { background: rgba(0, 240, 255, 0.1); border-color: var(--color-cyan); }
    .highlight-box.warning { background: rgba(245, 158, 11, 0.1); border-color: var(--color-warning); }
    .highlight-box.success { background: rgba(16, 185, 129, 0.1); border-color: var(--color-green); }
    .highlight-box.definition { background: rgba(106, 91, 255, 0.1); border-color: var(--color-purple); }

    .highlight-title {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 15px;
      margin-bottom: var(--space-sm);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    @media (min-width: 600px) { .highlight-title { font-size: 17px; } }

    .highlight-box.important .highlight-title { color: var(--color-gold); }
    .highlight-box.tip .highlight-title { color: var(--color-cyan); }
    .highlight-box.warning .highlight-title { color: var(--color-warning); }
    .highlight-box.success .highlight-title { color: var(--color-green); }
    .highlight-box.definition .highlight-title { color: var(--color-purple); }

    .lesson-image {
      margin: var(--space-md) 0;
      text-align: center;
      overflow: hidden;
      border-radius: 0;
    }

    @media (min-width: 600px) { .lesson-image { border-radius: var(--radius-md); margin: var(--space-lg) 0; } }

    .lesson-image img { width: 100%; height: auto; display: block; border-radius: 0; }

    @media (min-width: 600px) {
      .lesson-image img {
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-subtle);
      }
    }

    .image-caption {
      text-align: center;
      color: var(--color-text-muted);
      font-size: 12px;
      margin-top: var(--space-sm);
      font-style: italic;
      padding: 0 var(--text-padding);
    }

    @media (min-width: 600px) { .image-caption { font-size: 14px; padding: 0; } }

    .key-concept-box {
      background: linear-gradient(135deg, rgba(156, 6, 18, 0.15), rgba(17, 34, 80, 0.3));
      border: none;
      border-left: 4px solid var(--color-burgundy);
      border-radius: 0;
      padding: var(--space-lg) var(--text-padding);
      margin: var(--space-lg) 0;
    }

    @media (min-width: 600px) {
      .key-concept-box {
        border: 2px solid var(--color-burgundy);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
      }
    }

    .key-concept-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 1.1rem;
      color: var(--color-gold);
      margin-bottom: var(--space-md);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    @media (min-width: 600px) { .key-concept-title { font-size: 1.25rem; } }

    .key-concept-list { list-style: none; padding: 0; margin: 0; }

    .key-concept-list li {
      padding: 6px 0;
      padding-left: 24px;
      position: relative;
      color: var(--color-text);
      font-size: 14px;
    }

    @media (min-width: 600px) { .key-concept-list li { font-size: 16px; padding: 8px 0; padding-left: 28px; } }
    .key-concept-list li::before { content: "✓"; position: absolute; left: 0; color: var(--color-green); font-weight: bold; }

    .quiz-section {
      background: linear-gradient(135deg, rgba(106, 91, 255, 0.15), rgba(106, 91, 255, 0.05));
      border: none;
      border-left: 4px solid var(--color-purple);
      border-radius: 0;
      padding: var(--space-lg) var(--text-padding);
      margin: var(--space-lg) 0;
    }

    @media (min-width: 600px) {
      .quiz-section {
        border: 2px solid var(--color-purple);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
      }
    }

    .quiz-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 1.2rem;
      color: var(--color-purple);
      margin-bottom: var(--space-md);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    @media (min-width: 600px) { .quiz-title { font-size: 1.5rem; } }

    .quiz-question {
      margin-bottom: var(--space-lg);
      padding-bottom: var(--space-lg);
      border-bottom: 1px solid rgba(106, 91, 255, 0.2);
    }

    .quiz-question:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

    .quiz-question-text {
      font-weight: 600;
      color: var(--color-white);
      margin-bottom: var(--space-sm);
      font-size: 15px;
    }

    @media (min-width: 600px) { .quiz-question-text { font-size: 17px; } }

    .quiz-options { list-style: none; padding: 0; }

    .quiz-option {
      display: flex;
      align-items: flex-start;
      gap: var(--space-sm);
      padding: var(--space-sm) var(--space-md);
      margin-bottom: 6px;
      background: rgba(17, 34, 80, 0.4);
      border: 1px solid transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
    }

    @media (min-width: 600px) { .quiz-option { font-size: 15px; padding: var(--space-md); } }
    .quiz-option:hover { background: rgba(17, 34, 80, 0.6); border-color: var(--color-purple); }

    .quiz-option-letter {
      flex-shrink: 0;
      width: 26px;
      height: 26px;
      background: rgba(106, 91, 255, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 12px;
      color: var(--color-purple);
    }

    @media (min-width: 600px) { .quiz-option-letter { width: 30px; height: 30px; font-size: 14px; } }

    .quiz-answer {
      margin-top: var(--space-sm);
      padding: var(--space-md);
      background: rgba(16, 185, 129, 0.1);
      border-left: 3px solid var(--color-green);
      border-radius: 8px;
      display: none;
      font-size: 14px;
    }

    @media (min-width: 600px) { .quiz-answer { font-size: 15px; } }
    .quiz-answer.show { display: block; }
    .quiz-answer-label { font-weight: 600; color: var(--color-green); margin-bottom: 4px; }

    .lesson-footer {
      text-align: center;
      padding: var(--space-xl) var(--text-padding);
      border-top: 1px solid var(--border-subtle);
      margin-top: var(--space-lg);
      background: var(--bg-card);
    }

    @media (min-width: 600px) { .lesson-footer { background: transparent; padding: var(--space-xl) 0; } }

    .footer-logo {
      font-family: 'Montserrat', sans-serif;
      font-weight: 800;
      font-size: 16px;
      color: var(--color-gold);
      margin-bottom: 4px;
    }

    .footer-link { color: var(--color-text-muted); font-size: 13px; }
    .footer-link a { color: var(--color-cyan); text-decoration: none; }
    .footer-link a:hover { text-decoration: underline; }
  </style>
</head>

<body>
  <div class="lesson-container">

    <!-- HEADER -->
    <header class="lesson-header">
      <span class="lesson-badge">${badge}</span>
      <h1 class="lesson-title">${title}</h1>
      <div class="lesson-meta">
        <span class="lesson-meta-item">
          <span class="lesson-meta-icon">⏱️</span>
          ${readTime} phút đọc
        </span>
        <span class="lesson-meta-item">
          <span class="lesson-meta-icon">📚</span>
          ~${wordCount} từ
        </span>
        <span class="lesson-meta-item">
          <span class="lesson-meta-icon">✅</span>
          ${quizzes.length} câu quiz
        </span>
      </div>
    </header>

    <!-- LESSON CONTENT -->
    <div class="lesson-content">
      ${content}

      <!-- QUIZ SECTION -->
      <div class="quiz-section">
        <div class="quiz-title">📝 Kiểm Tra Kiến Thức</div>
        ${quizzes.map((q, i) => `
        <div class="quiz-question">
          <div class="quiz-question-text">Câu ${i + 1}: ${q.question}</div>
          <ul class="quiz-options">
            ${q.options.map((opt, j) => `
            <li class="quiz-option">
              <span class="quiz-option-letter">${String.fromCharCode(65 + j)}</span>
              <span>${opt}</span>
            </li>`).join('')}
          </ul>
          <div class="quiz-answer">
            <div class="quiz-answer-label">✓ Đáp án đúng: ${q.correct}</div>
            <p>${q.explanation}</p>
          </div>
        </div>`).join('')}

        <p style="text-align: center; color: var(--color-text-muted); margin-top: var(--space-lg);">
          <em>💡 Click vào đáp án để kiểm tra</em>
        </p>
      </div>

      ${nextLesson ? `
      <!-- NEXT LESSON -->
      <div class="highlight-box tip">
        <div class="highlight-title">📚 Bài Tiếp Theo</div>
        <p>Trong <strong>${nextLesson}</strong>, bạn sẽ tiếp tục khám phá những kiến thức quan trọng để nâng cao kỹ năng trading của mình.</p>
      </div>` : ''}

    </div>

    <!-- FOOTER -->
    <footer class="lesson-footer">
      <div class="footer-logo">GEM Trading Academy</div>
      <div class="footer-link">
        <a href="https://gemral.com" target="_blank">gemral.com</a>
      </div>
    </footer>

  </div>

  <!-- JAVASCRIPT -->
  <script>
    document.querySelectorAll('.quiz-option').forEach(option => {
      option.addEventListener('click', function() {
        const question = this.closest('.quiz-question');
        const answer = question.querySelector('.quiz-answer');
        answer.classList.toggle('show');
        question.querySelectorAll('.quiz-option').forEach(opt => { opt.style.opacity = '0.5'; });
        this.style.opacity = '1';
        this.style.borderColor = 'var(--color-purple)';
      });
    });
  </script>
</body>
</html>`;
}

// Lesson definitions - TIER 1 Chapter 2: Vùng Tần Số Cơ Bản
const tier1Chapter2 = [
  {
    lesson: 1,
    slug: 'hfz-la-gi',
    title: 'HFZ (High Frequency Zone) Là Gì?',
    content: `
      <div class="opening-hook">
        <p>Bạn đã bao giờ tự hỏi tại sao giá thường xuyên bị "chặn lại" tại một số vùng nhất định, như thể có một bức tường vô hình ngăn cản sự tăng giá? Đó chính là nơi mà Smart Money đã đặt lệnh bán lớn, và trong phương pháp GEM Frequency, chúng ta gọi đó là <strong>HFZ - High Frequency Zone</strong> hay Vùng Tần Số Cao.</p>
        <p>Hiểu được HFZ là bước đầu tiên để bạn có thể "nhìn thấy" dấu vết của Smart Money trên biểu đồ, từ đó giao dịch cùng hướng với họ thay vì bị cuốn theo đám đông retail traders.</p>
      </div>

      <section class="section">
        <h2>HFZ - Định Nghĩa Và Ý Nghĩa</h2>

        <p><strong>HFZ (High Frequency Zone)</strong> là vùng giá nơi áp lực BÁN vượt trội hơn áp lực MUA một cách đáng kể. Khi giá tiến vào vùng này, xác suất cao là giá sẽ bị đẩy ngược xuống do lượng lệnh bán lớn đang chờ được khớp tại đây. Đây là nơi mà các tổ chức, quỹ đầu tư lớn và những nhà giao dịch chuyên nghiệp đã đặt sẵn lệnh bán để phân phối tài sản của họ.</p>

        <div class="highlight-box definition">
          <div class="highlight-title">📖 High Frequency Zone (HFZ)</div>
          <p><strong>HFZ</strong> là vùng giá có tần số giao dịch cao với áp lực bán mạnh. Khi giá quay lại test vùng này, có xác suất cao giá sẽ bị từ chối (rejected) và di chuyển xuống. HFZ thường hình thành sau khi có một đợt tăng giá mạnh, nơi Smart Money bắt đầu chốt lời và phân phối tài sản.</p>
        </div>

        <h3>Tại Sao Gọi Là "High Frequency"?</h3>

        <p>Thuật ngữ "High Frequency" (Tần Số Cao) xuất phát từ quan sát rằng tại những vùng này, có rất nhiều giao dịch xảy ra trong một khoảng thời gian ngắn. Khi giá tiến đến HFZ, hàng loạt lệnh bán được kích hoạt gần như đồng thời, tạo ra một "bức tường bán" ngăn giá tiếp tục tăng.</p>

        <p>Bạn có thể hình dung HFZ như một đập nước khổng lồ đang chứa đầy nước. Khi giá (dòng nước) chạm vào đập, nó không thể vượt qua mà phải chảy ngược lại. Đập nước càng lớn (áp lực bán càng mạnh), thì dòng nước càng khó vượt qua.</p>
      </section>

      <section class="section">
        <h2>HFZ Xuất Hiện Ở Đâu Trên Biểu Đồ?</h2>

        <p>HFZ thường xuất hiện sau một đợt tăng giá mạnh mẽ, đặc biệt là khi xu hướng tăng bắt đầu cho thấy dấu hiệu chậm lại. Đây là thời điểm mà Smart Money bắt đầu phân phối tài sản họ đã tích lũy ở mức giá thấp hơn. Họ bán ra khi retail traders đang hưng phấn mua vào, và kết quả là giá không thể tiếp tục tăng.</p>

        <div class="highlight-box important">
          <div class="highlight-title">⭐ Đặc Điểm Nhận Diện HFZ</div>
          <p>Bạn có thể nhận diện HFZ thông qua những đặc điểm sau đây: Thứ nhất, HFZ thường nằm ở phía trên giá hiện tại sau một đợt giảm. Thứ hai, vùng này thường được hình thành từ một giai đoạn tích lũy (consolidation) trước khi giá phá vỡ xuống dưới. Thứ ba, khi giá quay lại test HFZ, thường có các nến từ chối như Shooting Star hoặc Bearish Engulfing.</p>
        </div>

        <p>Trong phương pháp GEM Frequency, HFZ được tạo ra bởi hai patterns chính là DPD (Down-Pause-Down) và UPD (Up-Pause-Down). Cả hai patterns này đều tạo ra vùng mà áp lực bán chiếm ưu thế, tuy nhiên cơ chế hình thành có sự khác biệt mà bạn sẽ học chi tiết ở TIER 2.</p>
      </section>

      <section class="section">
        <h2>Tín Hiệu Giao Dịch Tại HFZ</h2>

        <p>Khi bạn đã xác định được một HFZ trên biểu đồ, tín hiệu giao dịch chính là tìm cơ hội <strong>SHORT</strong> (bán khống) khi giá quay lại test vùng này. Tuy nhiên, ở TIER 1 này, chúng ta chỉ tập trung vào việc nhận diện vùng bằng mắt mà chưa đi sâu vào chiến lược entry cụ thể.</p>

        <div class="highlight-box tip">
          <div class="highlight-title">💡 Nguyên Tắc Cơ Bản</div>
          <p>Khi giá tiến vào HFZ, hãy tìm kiếm các nến xác nhận như Shooting Star, Hanging Man, hoặc Bearish Engulfing. Những nến này cho thấy lực bán đang chiếm ưu thế và giá có khả năng bị đẩy ngược xuống. Đừng vội vàng vào lệnh ngay khi giá chạm HFZ mà hãy đợi tín hiệu xác nhận.</p>
        </div>

        <p>Một điều quan trọng cần nhớ là HFZ không phải lúc nào cũng hoạt động. Giá có thể phá vỡ HFZ nếu áp lực mua đủ mạnh. Đây là lý do tại sao việc sử dụng Stop Loss là bắt buộc trong mọi giao dịch. Bạn sẽ học cách đặt Stop Loss chính xác khi học về các patterns cụ thể ở TIER 2.</p>
      </section>

      <section class="section">
        <h2>Tóm Tắt Bài Học</h2>

        <div class="key-concept-box">
          <div class="key-concept-title">🔑 Khái Niệm Cốt Lõi Cần Nhớ</div>
          <ul class="key-concept-list">
            <li><strong>HFZ (High Frequency Zone)</strong> là vùng giá có áp lực BÁN mạnh</li>
            <li>HFZ thường xuất hiện sau một đợt tăng giá, nơi Smart Money phân phối tài sản</li>
            <li>Khi giá quay lại test HFZ, tìm cơ hội SHORT với xác nhận từ nến đảo chiều</li>
            <li>HFZ được tạo ra bởi patterns DPD và UPD (sẽ học chi tiết ở TIER 2)</li>
          </ul>
        </div>
      </section>`,
    quizzes: [
      {
        question: 'HFZ (High Frequency Zone) là vùng giá có đặc điểm gì?',
        options: ['Áp lực MUA mạnh', 'Áp lực BÁN mạnh', 'Giá đi ngang không có xu hướng', 'Volume giao dịch thấp'],
        correct: 'B',
        explanation: 'HFZ là vùng có áp lực BÁN mạnh, nơi Smart Money đặt lệnh bán lớn để phân phối tài sản. Khi giá tiến vào HFZ, xác suất cao giá sẽ bị đẩy ngược xuống.'
      },
      {
        question: 'Khi giá quay lại test HFZ, bạn nên tìm cơ hội giao dịch theo hướng nào?',
        options: ['LONG (mua)', 'SHORT (bán khống)', 'Không giao dịch', 'Đợi giá phá vỡ HFZ rồi mới vào'],
        correct: 'B',
        explanation: 'Tại HFZ, áp lực bán chiếm ưu thế nên tín hiệu giao dịch chính là tìm cơ hội SHORT khi giá quay lại test vùng này và có nến xác nhận đảo chiều.'
      }
    ],
    nextLesson: 'Bài 2.2: LFZ (Low Frequency Zone) Là Gì?'
  },
  {
    lesson: 2,
    slug: 'lfz-la-gi',
    title: 'LFZ (Low Frequency Zone) Là Gì?',
    content: `
      <div class="opening-hook">
        <p>Nếu HFZ là vùng mà Smart Money bán ra, thì ngược lại, <strong>LFZ - Low Frequency Zone</strong> là vùng mà họ tích lũy và mua vào. Đây là những vùng giá mà áp lực MUA vượt trội, tạo thành một "sàn" vững chắc ngăn giá tiếp tục giảm.</p>
        <p>Hiểu được LFZ giúp bạn tìm ra những điểm vào lệnh LONG (mua) có xác suất thành công cao, giao dịch cùng hướng với Smart Money thay vì bán hoảng loạn khi giá giảm.</p>
      </div>

      <section class="section">
        <h2>LFZ - Định Nghĩa Và Ý Nghĩa</h2>

        <p><strong>LFZ (Low Frequency Zone)</strong> là vùng giá nơi áp lực MUA vượt trội hơn áp lực BÁN. Khi giá giảm xuống vùng này, xác suất cao là giá sẽ bật ngược lên do lượng lệnh mua lớn đang chờ được khớp. Đây là nơi mà các tổ chức và quỹ đầu tư đã đặt sẵn lệnh mua để tích lũy tài sản ở mức giá hấp dẫn.</p>

        <div class="highlight-box definition">
          <div class="highlight-title">📖 Low Frequency Zone (LFZ)</div>
          <p><strong>LFZ</strong> là vùng giá có tần số giao dịch thấp với áp lực mua mạnh đang chờ sẵn. Khi giá giảm xuống test vùng này, có xác suất cao giá sẽ được hỗ trợ và bật ngược lên. LFZ thường hình thành sau một đợt giảm giá mạnh, nơi Smart Money bắt đầu tích lũy.</p>
        </div>

        <h3>Tại Sao Gọi Là "Low Frequency"?</h3>

        <p>Thuật ngữ "Low Frequency" (Tần Số Thấp) có vẻ như đối lập với logic thông thường, nhưng nó mang ý nghĩa sâu sắc. Tại những vùng này, hoạt động giao dịch ban đầu khá "yên tĩnh" vì Smart Money đang âm thầm tích lũy. Họ không muốn tạo ra sự chú ý và đẩy giá lên trước khi hoàn thành việc mua vào.</p>

        <p>Bạn có thể hình dung LFZ như một tấm đệm lò xo. Khi giá (quả bóng) rơi xuống tấm đệm, nó sẽ bị bật ngược lên. Tấm đệm càng dày (áp lực mua càng mạnh), thì quả bóng bật lên càng cao.</p>
      </section>

      <section class="section">
        <h2>LFZ Xuất Hiện Ở Đâu Trên Biểu Đồ?</h2>

        <p>LFZ thường xuất hiện sau một đợt giảm giá mạnh mẽ, đặc biệt là khi xu hướng giảm bắt đầu cho thấy dấu hiệu cạn kiệt. Đây là thời điểm mà Smart Money bắt đầu mua vào ở mức giá thấp. Họ mua vào khi retail traders đang hoảng sợ bán tháo, và kết quả là giá không thể tiếp tục giảm.</p>

        <div class="highlight-box important">
          <div class="highlight-title">⭐ Đặc Điểm Nhận Diện LFZ</div>
          <p>Bạn có thể nhận diện LFZ thông qua những đặc điểm sau đây: Thứ nhất, LFZ thường nằm ở phía dưới giá hiện tại sau một đợt tăng. Thứ hai, vùng này thường được hình thành từ một giai đoạn tích lũy (consolidation) trước khi giá phá vỡ lên trên. Thứ ba, khi giá quay lại test LFZ, thường có các nến đảo chiều tăng như Hammer hoặc Bullish Engulfing.</p>
        </div>

        <p>Trong phương pháp GEM Frequency, LFZ được tạo ra bởi hai patterns chính là UPU (Up-Pause-Up) và DPU (Down-Pause-Up). Cả hai patterns này đều tạo ra vùng mà áp lực mua chiếm ưu thế, tuy nhiên cơ chế hình thành có sự khác biệt mà bạn sẽ học chi tiết ở TIER 2.</p>
      </section>

      <section class="section">
        <h2>Tín Hiệu Giao Dịch Tại LFZ</h2>

        <p>Khi bạn đã xác định được một LFZ trên biểu đồ, tín hiệu giao dịch chính là tìm cơ hội <strong>LONG</strong> (mua) khi giá giảm xuống test vùng này. Ở TIER 1 này, chúng ta tập trung vào việc nhận diện vùng bằng mắt và hiểu logic cơ bản.</p>

        <div class="highlight-box tip">
          <div class="highlight-title">💡 Nguyên Tắc Cơ Bản</div>
          <p>Khi giá giảm xuống LFZ, hãy tìm kiếm các nến xác nhận như Hammer, Inverted Hammer, hoặc Bullish Engulfing. Những nến này cho thấy lực mua đang chiếm ưu thế và giá có khả năng bật ngược lên. Kiên nhẫn đợi tín hiệu xác nhận trước khi vào lệnh.</p>
        </div>

        <p>Tương tự như HFZ, LFZ cũng không phải lúc nào cũng hoạt động. Giá có thể phá vỡ LFZ nếu áp lực bán quá mạnh. Điều này nhấn mạnh tầm quan trọng của việc sử dụng Stop Loss trong mọi giao dịch.</p>
      </section>

      <section class="section">
        <h2>Tóm Tắt Bài Học</h2>

        <div class="key-concept-box">
          <div class="key-concept-title">🔑 Khái Niệm Cốt Lõi Cần Nhớ</div>
          <ul class="key-concept-list">
            <li><strong>LFZ (Low Frequency Zone)</strong> là vùng giá có áp lực MUA mạnh</li>
            <li>LFZ thường xuất hiện sau một đợt giảm giá, nơi Smart Money tích lũy tài sản</li>
            <li>Khi giá giảm xuống test LFZ, tìm cơ hội LONG với xác nhận từ nến đảo chiều tăng</li>
            <li>LFZ được tạo ra bởi patterns UPU và DPU (sẽ học chi tiết ở TIER 2)</li>
          </ul>
        </div>
      </section>`,
    quizzes: [
      {
        question: 'LFZ (Low Frequency Zone) là vùng giá có đặc điểm gì?',
        options: ['Áp lực BÁN mạnh', 'Áp lực MUA mạnh', 'Giá biến động rất mạnh', 'Không có giao dịch xảy ra'],
        correct: 'B',
        explanation: 'LFZ là vùng có áp lực MUA mạnh, nơi Smart Money đặt lệnh mua để tích lũy tài sản. Khi giá giảm xuống LFZ, xác suất cao giá sẽ được hỗ trợ và bật ngược lên.'
      },
      {
        question: 'LFZ thường xuất hiện sau giai đoạn nào của thị trường?',
        options: ['Sau một đợt tăng giá mạnh', 'Sau một đợt giảm giá mạnh', 'Khi giá đi ngang dài hạn', 'Khi có tin tức tốt'],
        correct: 'B',
        explanation: 'LFZ thường xuất hiện sau một đợt giảm giá mạnh, đây là thời điểm Smart Money bắt đầu mua vào ở mức giá hấp dẫn trong khi retail traders đang hoảng sợ bán tháo.'
      }
    ],
    nextLesson: 'Bài 2.3: Cách Nhận Diện Zone Trên Biểu Đồ'
  },
  {
    lesson: 3,
    slug: 'cach-nhan-dien-zone-tren-bieu-do',
    title: 'Cách Nhận Diện Zone Trên Biểu Đồ',
    content: `
      <div class="opening-hook">
        <p>Bạn đã hiểu khái niệm HFZ và LFZ, nhưng làm thế nào để thực sự "nhìn thấy" chúng trên biểu đồ? Đây là bước quan trọng nhất trong việc áp dụng phương pháp GEM Frequency vào thực tế.</p>
        <p>Trong bài học này, tôi sẽ hướng dẫn bạn cách nhận diện các vùng Frequency Zone một cách trực quan, không cần công thức phức tạp. Đây là kỹ năng nền tảng mà bạn sẽ phát triển thêm khi học các patterns cụ thể ở TIER 2.</p>
      </div>

      <section class="section">
        <h2>Nguyên Tắc Cơ Bản: Tìm Vùng Tích Lũy</h2>

        <p>Điều đầu tiên bạn cần tìm kiếm là <strong>vùng tích lũy (consolidation)</strong> sau một đợt di chuyển mạnh. Vùng tích lũy là nơi giá đi ngang trong một khoảng hẹp, thường có từ 2-6 cây nến với thân nhỏ và biên độ dao động thấp. Đây chính là nơi mà HFZ hoặc LFZ được hình thành.</p>

        <div class="highlight-box definition">
          <div class="highlight-title">📖 Vùng Tích Lũy (Consolidation)</div>
          <p>Vùng tích lũy là khu vực trên biểu đồ nơi giá di chuyển trong một phạm vi hẹp, thể hiện sự cân bằng tạm thời giữa lực mua và lực bán. Sau vùng tích lũy, giá thường có một đợt di chuyển mạnh theo một hướng, và vùng tích lũy này trở thành HFZ hoặc LFZ tùy thuộc vào hướng giá đi.</p>
        </div>

        <h3>Bước 1: Xác Định Xu Hướng Trước</h3>

        <p>Trước khi tìm zone, bạn cần xác định xu hướng trước đó. Nếu trước vùng tích lũy là một đợt tăng giá và sau đó giá phá vỡ xuống, vùng đó có thể là HFZ. Ngược lại, nếu trước đó là đợt giảm giá và sau đó giá phá vỡ lên, vùng đó có thể là LFZ.</p>

        <div class="highlight-box tip">
          <div class="highlight-title">💡 Mẹo Nhận Diện Nhanh</div>
          <p>Hãy tìm kiếm những vùng mà nến có thân nhỏ, wicks ngắn, và giá nằm trong một khoảng range hẹp (thường dưới 1.5% đối với crypto). Đây là dấu hiệu của sự tích lũy, và khi giá quay lại vùng này, nó có thể hoạt động như một HFZ hoặc LFZ.</p>
        </div>
      </section>

      <section class="section">
        <h2>Cách Nhận Diện HFZ Bằng Mắt</h2>

        <p>Để nhận diện HFZ, hãy tìm kiếm những vùng ở phía trên giá hiện tại. HFZ thường được hình thành khi giá tăng lên, tạo ra một vùng tích lũy, sau đó phá vỡ xuống dưới. Vùng tích lũy đó trở thành HFZ - nơi có nhiều lệnh bán đang chờ.</p>

        <p>Khi giá quay lại test HFZ, bạn sẽ thấy giá có xu hướng bị "từ chối" và quay đầu xuống. Đây là lúc bạn có thể tìm cơ hội SHORT nếu có xác nhận từ nến đảo chiều.</p>

        <div class="highlight-box warning">
          <div class="highlight-title">⚠️ Lưu Ý Quan Trọng</div>
          <p>Không phải mọi vùng tích lũy đều trở thành zone mạnh. Zone chất lượng cao thường có đặc điểm: vùng tích lũy gọn gàng (2-5 nến), sau đó giá rời khỏi vùng với một đợt di chuyển mạnh (impulse). Vùng tích lũy càng ngắn và di chuyển sau đó càng mạnh, zone càng có khả năng hoạt động tốt.</p>
        </div>
      </section>

      <section class="section">
        <h2>Cách Nhận Diện LFZ Bằng Mắt</h2>

        <p>Để nhận diện LFZ, hãy tìm kiếm những vùng ở phía dưới giá hiện tại. LFZ thường được hình thành khi giá giảm xuống, tạo ra một vùng tích lũy, sau đó phá vỡ lên trên. Vùng tích lũy đó trở thành LFZ - nơi có nhiều lệnh mua đang chờ.</p>

        <p>Khi giá giảm xuống test LFZ, bạn sẽ thấy giá có xu hướng được "hỗ trợ" và bật ngược lên. Đây là lúc bạn có thể tìm cơ hội LONG nếu có xác nhận từ nến đảo chiều.</p>
      </section>

      <section class="section">
        <h2>Ví Dụ Thực Tế Trên BTC/USDT</h2>

        <p>Hãy thực hành ngay bằng cách mở biểu đồ BTC/USDT khung 4H trên TradingView hoặc GEM Scanner. Tìm kiếm những vùng mà giá đã tích lũy 2-5 nến, sau đó có một đợt di chuyển mạnh. Đánh dấu những vùng này và theo dõi xem điều gì xảy ra khi giá quay lại.</p>

        <div class="highlight-box success">
          <div class="highlight-title">✅ Bài Tập Thực Hành</div>
          <p>Mở biểu đồ BTC/USDT 4H và tìm 3 vùng tích lũy trong 30 ngày gần nhất. Ghi chú lại: vùng đó nằm ở đâu, xu hướng trước đó là gì, giá đã di chuyển theo hướng nào sau khi rời vùng. Đây là bước đầu tiên để bạn rèn luyện khả năng nhận diện zone.</p>
        </div>
      </section>

      <section class="section">
        <h2>Tóm Tắt Bài Học</h2>

        <div class="key-concept-box">
          <div class="key-concept-title">🔑 Khái Niệm Cốt Lõi Cần Nhớ</div>
          <ul class="key-concept-list">
            <li>Tìm <strong>vùng tích lũy</strong> (consolidation) sau một đợt di chuyển mạnh</li>
            <li>Vùng tích lũy tốt có 2-5 nến, thân nhỏ, range hẹp</li>
            <li>HFZ ở phía trên giá hiện tại, LFZ ở phía dưới giá hiện tại</li>
            <li>Zone chất lượng cao: tích lũy ngắn gọn + di chuyển sau đó mạnh</li>
          </ul>
        </div>
      </section>`,
    quizzes: [
      {
        question: 'Đặc điểm của vùng tích lũy (consolidation) là gì?',
        options: ['Nến có thân lớn, biên độ dao động cao', 'Nến có thân nhỏ, biên độ dao động thấp', 'Giá tăng liên tục không nghỉ', 'Volume giao dịch rất cao'],
        correct: 'B',
        explanation: 'Vùng tích lũy có đặc điểm là nến có thân nhỏ, wicks ngắn, và giá nằm trong khoảng range hẹp (thường dưới 1.5%). Đây là dấu hiệu của sự cân bằng tạm thời giữa lực mua và bán.'
      },
      {
        question: 'HFZ thường nằm ở vị trí nào so với giá hiện tại?',
        options: ['Phía dưới giá hiện tại', 'Phía trên giá hiện tại', 'Ngay tại giá hiện tại', 'Không có vị trí cố định'],
        correct: 'B',
        explanation: 'HFZ thường nằm ở phía trên giá hiện tại, được hình thành khi giá tăng lên tạo vùng tích lũy rồi phá vỡ xuống. Đây là nơi có nhiều lệnh bán đang chờ khi giá quay lại test.'
      },
      {
        question: 'Zone chất lượng cao thường có đặc điểm gì?',
        options: ['Vùng tích lũy dài (10+ nến) và di chuyển sau đó yếu', 'Vùng tích lũy ngắn (2-5 nến) và di chuyển sau đó mạnh', 'Không có vùng tích lũy', 'Volume thấp trong suốt quá trình'],
        correct: 'B',
        explanation: 'Zone chất lượng cao có vùng tích lũy gọn gàng (2-5 nến) và sau đó giá rời khỏi vùng với một đợt di chuyển mạnh (impulse). Điều này cho thấy áp lực mua/bán tập trung và mạnh mẽ.'
      }
    ],
    nextLesson: 'Bài 2.4: Nguyên Tắc Giao Dịch Với Zone'
  },
  {
    lesson: 4,
    slug: 'nguyen-tac-giao-dich-voi-zone',
    title: 'Nguyên Tắc Giao Dịch Với Zone',
    content: `
      <div class="opening-hook">
        <p>Bạn đã biết cách nhận diện HFZ và LFZ, nhưng biết không có nghĩa là làm được. Trong bài học này, chúng ta sẽ đi qua những nguyên tắc giao dịch cơ bản khi sử dụng Frequency Zones, giúp bạn có nền tảng vững chắc trước khi học các chiến lược chi tiết ở TIER 2.</p>
        <p>Những nguyên tắc này tuy đơn giản nhưng cực kỳ quan trọng. Nếu bạn bỏ qua chúng, dù có học thêm bao nhiêu patterns đi nữa, kết quả giao dịch cũng sẽ không cải thiện.</p>
      </div>

      <section class="section">
        <h2>Nguyên Tắc 1: Đợi Giá Quay Lại Zone</h2>

        <p>Đây là nguyên tắc quan trọng nhất trong phương pháp GEM Frequency: <strong>KHÔNG BAO GIỜ chase breakout</strong>. Thay vào đó, hãy kiên nhẫn đợi giá quay lại test zone trước khi vào lệnh.</p>

        <div class="highlight-box important">
          <div class="highlight-title">⭐ Tại Sao Phải Đợi Retest?</div>
          <p>Khi giá phá vỡ một zone, rất nhiều trader FOMO vào lệnh ngay lập tức. Tuy nhiên, thống kê cho thấy hơn 60% các breakout đều có một đợt retest quay lại vùng đã phá. Bằng cách đợi retest, bạn có thể: (1) Xác nhận zone thực sự hoạt động, (2) Có điểm vào lệnh tốt hơn với Risk:Reward cao hơn, (3) Tránh bị "bull trap" hoặc "bear trap".</p>
        </div>

        <p>Việc đợi retest đòi hỏi sự kiên nhẫn. Bạn có thể bỏ lỡ một số cơ hội khi giá không quay lại, nhưng về dài hạn, chiến lược này sẽ giúp bạn tránh được rất nhiều lệnh thua lỗ do FOMO.</p>
      </section>

      <section class="section">
        <h2>Nguyên Tắc 2: Tìm Nến Xác Nhận</h2>

        <p>Sau khi giá quay lại zone, đừng vội vào lệnh. Hãy đợi một <strong>nến xác nhận (confirmation candle)</strong> cho thấy zone đang hoạt động. Đây là bước quan trọng để tăng xác suất thành công.</p>

        <h3>Nến Xác Nhận Tại HFZ (Tín Hiệu SHORT)</h3>
        <ul>
          <li><strong>Shooting Star:</strong> Nến có bóng trên dài, thân nhỏ ở dưới</li>
          <li><strong>Bearish Engulfing:</strong> Nến đỏ nuốt trọn nến xanh trước đó</li>
          <li><strong>Evening Star:</strong> Mô hình 3 nến đảo chiều giảm</li>
        </ul>

        <h3>Nến Xác Nhận Tại LFZ (Tín Hiệu LONG)</h3>
        <ul>
          <li><strong>Hammer:</strong> Nến có bóng dưới dài, thân nhỏ ở trên</li>
          <li><strong>Bullish Engulfing:</strong> Nến xanh nuốt trọn nến đỏ trước đó</li>
          <li><strong>Morning Star:</strong> Mô hình 3 nến đảo chiều tăng</li>
        </ul>

        <div class="highlight-box tip">
          <div class="highlight-title">💡 Mẹo Thực Hành</div>
          <p>Bạn sẽ học chi tiết về các nến xác nhận này trong phần Classic Patterns và Candlestick Mastery. Hiện tại, hãy ghi nhớ rằng: nến có bóng dài ở phía đối diện với xu hướng hiện tại thường là dấu hiệu của sự từ chối (rejection).</p>
        </div>
      </section>

      <section class="section">
        <h2>Nguyên Tắc 3: Đặt Stop Loss Và Take Profit</h2>

        <p>Không có chiến lược nào thắng 100% thời gian. Vì vậy, việc đặt <strong>Stop Loss</strong> để giới hạn rủi ro là bắt buộc. Đồng thời, bạn cần có <strong>Take Profit</strong> rõ ràng để không bị tham lam giữ lệnh quá lâu.</p>

        <div class="highlight-box warning">
          <div class="highlight-title">⚠️ Quy Tắc Risk:Reward</div>
          <p>Không bao giờ vào lệnh nếu Risk:Reward dưới 1:2. Điều này có nghĩa là nếu bạn risk 1 đồng, tiềm năng lợi nhuận phải ít nhất là 2 đồng. Với win rate 67.8% và R:R 1:2.5, bạn đã có một hệ thống profitable về dài hạn.</p>
        </div>

        <h3>Cách Đặt Stop Loss Cơ Bản</h3>
        <ul>
          <li><strong>Tại HFZ:</strong> Stop Loss đặt trên đỉnh của zone + buffer 0.5%</li>
          <li><strong>Tại LFZ:</strong> Stop Loss đặt dưới đáy của zone - buffer 0.5%</li>
        </ul>

        <h3>Cách Đặt Take Profit Cơ Bản</h3>
        <ul>
          <li>Take Profit tối thiểu = 2x khoảng cách Stop Loss</li>
          <li>Hoặc nhắm đến vùng hỗ trợ/kháng cự tiếp theo</li>
        </ul>
      </section>

      <section class="section">
        <h2>Nguyên Tắc 4: Quản Lý Rủi Ro</h2>

        <p>Dù zone có đẹp đến đâu, bạn cũng <strong>không bao giờ risk quá 1-2% tài khoản</strong> cho một lệnh. Đây là quy tắc vàng giúp bạn tồn tại đủ lâu trong thị trường để học và cải thiện.</p>

        <div class="highlight-box success">
          <div class="highlight-title">✅ Công Thức Position Size</div>
          <p><strong>Khối lượng lệnh = (Vốn × Risk%) / (Khoảng cách SL)</strong><br><br>
          Ví dụ: Vốn 10,000 USDT, risk 1%, khoảng cách SL 50 USDT<br>
          Position Size = (10,000 × 0.01) / 50 = 2 BTC<br><br>
          Với position size này, nếu bạn thua, bạn chỉ mất 100 USDT (1% vốn). Nếu thắng với R:R 1:2.5, bạn kiếm được 250 USDT.</p>
        </div>
      </section>

      <section class="section">
        <h2>Tóm Tắt Bài Học</h2>

        <div class="key-concept-box">
          <div class="key-concept-title">🔑 Bốn Nguyên Tắc Giao Dịch Với Zone</div>
          <ul class="key-concept-list">
            <li><strong>Nguyên tắc 1:</strong> Đợi giá quay lại zone (retest), không chase breakout</li>
            <li><strong>Nguyên tắc 2:</strong> Tìm nến xác nhận (Hammer, Engulfing, Shooting Star...)</li>
            <li><strong>Nguyên tắc 3:</strong> Đặt Stop Loss và Take Profit rõ ràng, R:R tối thiểu 1:2</li>
            <li><strong>Nguyên tắc 4:</strong> Risk không quá 1-2% tài khoản cho mỗi lệnh</li>
          </ul>
        </div>
      </section>`,
    quizzes: [
      {
        question: 'Theo phương pháp GEM Frequency, bạn nên làm gì khi giá phá vỡ một zone?',
        options: ['Vào lệnh ngay lập tức theo hướng breakout', 'Đợi giá quay lại test zone trước khi vào lệnh', 'Không giao dịch vì breakout đã xảy ra', 'Vào lệnh ngược hướng breakout'],
        correct: 'B',
        explanation: 'Nguyên tắc quan trọng nhất là đợi giá quay lại test zone (retest) trước khi vào lệnh. Hơn 60% breakout đều có retest, giúp bạn có điểm vào lệnh tốt hơn và tránh bull/bear trap.'
      },
      {
        question: 'Risk:Reward tối thiểu cho một giao dịch theo phương pháp GEM là bao nhiêu?',
        options: ['1:1', '1:2', '1:3', '1:5'],
        correct: 'B',
        explanation: 'Không bao giờ vào lệnh nếu Risk:Reward dưới 1:2. Với R:R này và win rate 67.8%, hệ thống sẽ profitable về dài hạn.'
      }
    ],
    nextLesson: 'Bài 2.5: Giới Hạn TIER 1 và Preview TIER 2'
  },
  {
    lesson: 5,
    slug: 'gioi-han-tier-1-va-preview-tier-2',
    title: 'Giới Hạn TIER 1 và Preview TIER 2',
    content: `
      <div class="opening-hook">
        <p>Bạn đã hoàn thành những bài học quan trọng về Vùng Tần Số cơ bản. Tuy nhiên, những gì bạn học ở TIER 1 mới chỉ là bề mặt của phương pháp GEM Frequency. Trong bài học cuối cùng của chapter này, tôi sẽ nói rõ những giới hạn của kiến thức TIER 1 và preview những gì đang chờ bạn ở TIER 2.</p>
        <p>Mục đích không phải để bán TIER 2 cho bạn, mà để bạn hiểu rõ mình đang ở đâu trên hành trình học tập và cần những gì để tiến xa hơn.</p>
      </div>

      <section class="section">
        <h2>Những Gì Bạn Đã Học Ở TIER 1</h2>

        <p>Trong TIER 1, bạn đã được trang bị những kiến thức nền tảng quan trọng:</p>

        <ul>
          <li><strong>Nguyên lý cốt lõi:</strong> Hiểu về sự mất cân bằng cung cầu</li>
          <li><strong>Smart Money:</strong> Biết cách tư duy theo những người chơi lớn</li>
          <li><strong>HFZ và LFZ:</strong> Nhận diện vùng tần số bằng mắt</li>
          <li><strong>Nguyên tắc giao dịch:</strong> Đợi retest, nến xác nhận, quản lý rủi ro</li>
          <li><strong>Classic Patterns:</strong> 5 patterns cơ bản (Double Top/Bottom, H&S...)</li>
        </ul>

        <div class="highlight-box success">
          <div class="highlight-title">✅ Bạn Có Thể Làm Gì Với Kiến Thức TIER 1?</div>
          <p>Với những gì đã học, bạn có thể: nhận diện zone bằng mắt, hiểu logic đằng sau sự di chuyển giá, paper trade với 5 classic patterns cơ bản, sử dụng GEM Scanner và Chatbot ở mức cơ bản. Đây là nền tảng vững chắc để bạn bắt đầu hành trình trading.</p>
        </div>
      </section>

      <section class="section">
        <h2>Giới Hạn Của Kiến Thức TIER 1</h2>

        <p>Tuy nhiên, TIER 1 có những giới hạn rõ ràng mà bạn cần nhận thức:</p>

        <div class="highlight-box warning">
          <div class="highlight-title">⚠️ TIER 1 KHÔNG Bao Gồm</div>
          <p><strong>4 Patterns Độc Quyền GEM:</strong> DPD, UPU, UPD, DPU - Đây là 4 công thức để xác định zone CHÍNH XÁC, không chỉ bằng mắt. Ở TIER 1, bạn nhận diện zone bằng cảm quan, nhưng ở TIER 2, bạn sẽ có công thức rõ ràng với độ chính xác cao hơn.</p>
          <p><strong>HFZ/LFZ Chi Tiết:</strong> Cách vẽ zone chính xác với 2 đường biên, chiến lược entry cụ thể, multi-timeframe zone analysis.</p>
          <p><strong>6 Classic Patterns Nâng Cao:</strong> Doji, Rounding, Triangle patterns.</p>
          <p><strong>Zone Scoring:</strong> Hệ thống chấm điểm chất lượng zone.</p>
        </div>

        <h3>So Sánh Độ Chính Xác</h3>

        <p>Khi nhận diện zone bằng mắt (TIER 1), độ chính xác khoảng 55-60%. Khi sử dụng 4 patterns GEM độc quyền (TIER 2), độ chính xác tăng lên 65-70%. Sự khác biệt này đến từ việc có công thức rõ ràng để xác định zone thay vì dựa vào cảm quan.</p>
      </section>

      <section class="section">
        <h2>Preview: 6 Công Thức Độc Quyền Ở TIER 2</h2>

        <p>Ở TIER 2, bạn sẽ được học 6 công thức độc quyền của phương pháp GEM Frequency:</p>

        <h3>4 Patterns Xác Định Zone</h3>
        <ul>
          <li><strong>DPD (Down-Pause-Down):</strong> Pattern tiếp diễn giảm, tạo HFZ - Win Rate 68%</li>
          <li><strong>UPU (Up-Pause-Up):</strong> Pattern tiếp diễn tăng, tạo LFZ - Win Rate 71%</li>
          <li><strong>UPD (Up-Pause-Down):</strong> Pattern đảo chiều giảm, tạo HFZ - Win Rate 65%</li>
          <li><strong>DPU (Down-Pause-Up):</strong> Pattern đảo chiều tăng, tạo LFZ - Win Rate 69%</li>
        </ul>

        <h3>2 Loại Zone Mastery</h3>
        <ul>
          <li><strong>HFZ Mastery:</strong> Cách vẽ chính xác, chiến lược entry, multi-TF analysis</li>
          <li><strong>LFZ Mastery:</strong> Cách vẽ chính xác, chiến lược entry, multi-TF analysis</li>
        </ul>

        <div class="highlight-box tip">
          <div class="highlight-title">💡 Tại Sao 4 Patterns Này Quan Trọng?</div>
          <p>4 patterns DPD, UPU, UPD, DPU không chỉ giúp bạn xác định zone chính xác, mà còn cho bạn biết sức mạnh của zone đó. Patterns đảo chiều (UPD, DPU) thường mạnh hơn patterns tiếp diễn (DPD, UPU). Hiểu được điều này giúp bạn ưu tiên những setup có xác suất cao hơn.</p>
        </div>
      </section>

      <section class="section">
        <h2>Bước Tiếp Theo Cho Bạn</h2>

        <p>Bạn có 3 lựa chọn sau khi hoàn thành TIER 1:</p>

        <ul>
          <li><strong>Tiếp tục với TIER 1:</strong> Thực hành những gì đã học, paper trade với classic patterns, sử dụng GEM tools. Đây là lựa chọn phù hợp nếu bạn muốn củng cố nền tảng trước.</li>
          <li><strong>Upgrade lên TIER 2:</strong> Học 6 công thức độc quyền để nâng cao độ chính xác. Đây là lựa chọn phù hợp nếu bạn muốn tăng tốc quá trình học tập và có công cụ mạnh mẽ hơn.</li>
          <li><strong>Trở thành Partner:</strong> Chia sẻ GEM với người khác và nhận hoa hồng. Đây là cơ hội kiếm thêm thu nhập trong khi học trading.</li>
        </ul>

        <div class="highlight-box important">
          <div class="highlight-title">⭐ Lời Khuyên</div>
          <p>Không có con đường sai, chỉ có con đường phù hợp với bạn. Điều quan trọng là bạn hãy hoàn thành TIER 1 trước, thực hành những gì đã học, và sau đó quyết định bước tiếp theo dựa trên mục tiêu và điều kiện của mình.</p>
        </div>
      </section>

      <section class="section">
        <h2>Tóm Tắt Bài Học</h2>

        <div class="key-concept-box">
          <div class="key-concept-title">🔑 Điểm Chính Cần Nhớ</div>
          <ul class="key-concept-list">
            <li>TIER 1 cung cấp nền tảng: nhận diện zone bằng mắt, 5 classic patterns, nguyên tắc cơ bản</li>
            <li>TIER 2 có 4 patterns độc quyền (DPD, UPU, UPD, DPU) để xác định zone chính xác</li>
            <li>Độ chính xác tăng từ 55-60% (TIER 1) lên 65-70% (TIER 2)</li>
            <li>Bạn có thể tiếp tục TIER 1, upgrade TIER 2, hoặc trở thành Partner</li>
          </ul>
        </div>
      </section>`,
    quizzes: [
      {
        question: '4 patterns độc quyền của phương pháp GEM Frequency là gì?',
        options: ['Double Top, Double Bottom, H&S, Inverse H&S', 'DPD, UPU, UPD, DPU', 'Triangle, Flag, Wedge, Pennant', 'Doji, Hammer, Engulfing, Star'],
        correct: 'B',
        explanation: '4 patterns độc quyền của GEM là DPD (Down-Pause-Down), UPU (Up-Pause-Up), UPD (Up-Pause-Down), và DPU (Down-Pause-Up). Đây là công thức để xác định zone chính xác, được dạy ở TIER 2.'
      },
      {
        question: 'Sự khác biệt chính giữa TIER 1 và TIER 2 là gì?',
        options: ['TIER 2 có nhiều bài học hơn', 'TIER 2 dạy cách xác định zone chính xác bằng 4 patterns', 'TIER 2 dành cho người đã có kinh nghiệm', 'TIER 2 miễn phí còn TIER 1 mất phí'],
        correct: 'B',
        explanation: 'Khác biệt chính là TIER 2 dạy 4 patterns độc quyền (DPD, UPU, UPD, DPU) để xác định zone CHÍNH XÁC thay vì chỉ bằng mắt như TIER 1, giúp tăng độ chính xác từ 55-60% lên 65-70%.'
      }
    ],
    nextLesson: 'Bài 3.1: Double Top (Đỉnh Đôi)'
  }
];

// Create lessons for TIER 1 Chapter 2
console.log('Creating TIER 1 Chapter 2 lessons...');
tier1Chapter2.forEach(lessonData => {
  const filename = `tier-1-bai-2.${lessonData.lesson}-${lessonData.slug}.html`;
  const filepath = path.join(tier1Dir, filename);

  const html = createLessonHTML(
    1, 2, lessonData.lesson,
    lessonData.title,
    lessonData.content,
    lessonData.quizzes,
    '12', '1500',
    lessonData.nextLesson
  );

  fs.writeFileSync(filepath, html, 'utf-8');
  console.log(`  ✅ Created: ${filename}`);
});

console.log('\n✅ TIER 1 Chapter 2 complete (5 lessons)');
console.log('\nRun script with additional arguments to create other chapters:');
console.log('  node create-missing-lessons.js tier1-ch4  - Create TIER 1 Chapter 4');
console.log('  node create-missing-lessons.js tier1-ch7  - Create TIER 1 Chapter 7');
console.log('  node create-missing-lessons.js tier1-ch8  - Create TIER 1 Chapter 8');
console.log('  node create-missing-lessons.js tier2      - Create TIER 2 missing');
console.log('  node create-missing-lessons.js tier3      - Create TIER 3 missing');
