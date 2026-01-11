-- =====================================================
-- TIER-2 - Module A: Transformation Tier 2
-- Course: course-tier2-trading-advanced
-- File 15/23
-- =====================================================

-- Create/Update Module
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  'module-tier-2-ch7',
  'course-tier2-trading-advanced',
  'Module A: Transformation Tier 2',
  'Chuyển đổi tư duy nâng cao',
  7,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Lesson 7.1: Con Người Cũ và Con Người Mới - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch7-l1',
  'module-tier-2-ch7',
  'course-tier2-trading-advanced',
  'Bài 7.1: Con Người Cũ và Con Người Mới - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 7.1: Con Người Cũ và Con Người Mới - GEM Trading Academy</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: #0a0a0f;
            color: #e4e4e7;
            line-height: 1.6;
            font-size: 16px;
        }

        .container {
            max-width: 680px;
            margin: 0 auto;
            background: #0a0a0f;
        }

        .lesson-header {
            padding: 1rem;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(100, 50, 200, 0.1) 100%);
            border-bottom: 1px solid rgba(139, 92, 246, 0.2);
        }

        .lesson-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 0.25rem;
        }

        .lesson-subtitle {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .content-card {
            background: #18181b;
            margin-bottom: 0.5rem;
        }

        .card-header {
            display: flex;
            align-items: center;
            padding: 1rem;
            gap: 0.75rem;
        }

        .card-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            flex-shrink: 0;
        }

        .card-icon.purple { background: rgba(139, 92, 246, 0.2); }
        .card-icon.gold { background: rgba(255, 189, 89, 0.2); }
        .card-icon.cyan { background: rgba(0, 240, 255, 0.2); }
        .card-icon.green { background: rgba(16, 185, 129, 0.2); }
        .card-icon.red { background: rgba(239, 68, 68, 0.2); }

        .card-meta h3 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: #ffffff;
        }

        .card-meta span {
            font-size: 0.75rem;
            color: #71717a;
        }

        .card-body {
            padding: 0 1rem 1rem 1rem;
        }

        .card-body p {
            color: #d4d4d8;
            margin-bottom: 0.75rem;
        }

        .styled-list {
            list-style: none;
            padding: 0;
            margin: 1rem 0;
        }

        .styled-list li {
            padding: 0.75rem 1rem;
            background: rgba(139, 92, 246, 0.05);
            border-left: 3px solid #8B5CF6;
            margin-bottom: 0.5rem;
            border-radius: 0 0.5rem 0.5rem 0;
        }

        .styled-list.red li {
            background: rgba(239, 68, 68, 0.05);
            border-left-color: #EF4444;
        }

        .styled-list.green li {
            background: rgba(16, 185, 129, 0.05);
            border-left-color: #10B981;
        }

        .styled-list.gold li {
            background: rgba(255, 189, 89, 0.05);
            border-left-color: #FFBD59;
        }

        .image-container {
            margin: 1rem 0;
            border-radius: 0.5rem;
            overflow: hidden;
        }

        .image-container img {
            width: 100%;
            height: auto;
            display: block;
        }

        .image-caption {
            font-size: 0.75rem;
            color: #71717a;
            text-align: center;
            padding: 0.5rem;
            background: rgba(0, 0, 0, 0.3);
        }

        /* Comparison Grid */
        .comparison-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .comparison-card {
            border-radius: 0.75rem;
            padding: 1rem;
        }

        .comparison-card.old {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .comparison-card.new {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .comparison-title {
            font-weight: 600;
            font-size: 0.875rem;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .comparison-card.old .comparison-title {
            color: #EF4444;
        }

        .comparison-card.new .comparison-title {
            color: #10B981;
        }

        .comparison-list {
            list-style: none;
            padding: 0;
            font-size: 0.8125rem;
        }

        .comparison-list li {
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            color: #a1a1aa;
        }

        .comparison-list li:last-child {
            border-bottom: none;
        }

        /* Quote Box */
        .quote-box {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(100, 50, 200, 0.15) 100%);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem 0;
            text-align: center;
        }

        .quote-text {
            font-size: 1.125rem;
            font-style: italic;
            color: #fff;
            margin-bottom: 0.5rem;
        }

        .quote-author {
            font-size: 0.8125rem;
            color: #8B5CF6;
        }

        /* Transformation Timeline */
        .timeline {
            margin: 1rem 0;
        }

        .timeline-item {
            display: flex;
            gap: 1rem;
            padding: 1rem 0;
        }

        .timeline-marker {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            color: white;
            flex-shrink: 0;
        }

        .timeline-content h4 {
            font-weight: 600;
            color: #fff;
            margin-bottom: 0.25rem;
        }

        .timeline-content p {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .summary-box {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(100, 50, 200, 0.15) 100%);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem;
        }

        .summary-box h3 {
            color: #8B5CF6;
            font-size: 1rem;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-list {
            list-style: none;
            padding: 0;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: #d4d4d8;
        }

        .summary-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #8B5CF6;
            font-weight: bold;
        }

        .quiz-section {
            background: #18181b;
            margin: 0.5rem 0;
            padding: 1.5rem 1rem;
        }

        .quiz-section h3 {
            color: #ffffff;
            font-size: 1.125rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: rgba(139, 92, 246, 0.05);
            border: 1px solid rgba(139, 92, 246, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 500;
            color: #fff;
            margin-bottom: 0.75rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            text-align: left;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            color: #d4d4d8;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .quiz-option:hover {
            background: rgba(139, 92, 246, 0.1);
            border-color: rgba(139, 92, 246, 0.3);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: #10B981;
            color: #10B981;
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: #EF4444;
            color: #EF4444;
        }

        .quiz-result {
            display: none;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-top: 0.75rem;
            font-weight: 500;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: #10B981;
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: #EF4444;
        }

        .quiz-score {
            display: none;
            text-align: center;
            padding: 1rem;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(100, 50, 200, 0.15) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: #8B5CF6;
        }

        .quiz-score .score-label {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .retake-btn {
            background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1rem;
        }

        .lesson-footer {
            padding: 1.5rem 1rem;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #8B5CF6 0%, #00F0FF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .footer-text {
            font-size: 0.75rem;
            color: #71717a;
            margin-top: 0.25rem;
        }

        @media (max-width: 600px) {
            .container {
                padding: 0;
            }

            .content-card {
                border-radius: 0;
                border-left: none;
                border-right: none;
            }

            .comparison-grid {
                grid-template-columns: 1fr;
            }

            .lesson-title {
                font-size: 1.25rem;
            }
        }

        @media (min-width: 600px) {
            .container {
                padding: 1.5rem;
            }

            .content-card {
                border-radius: 0.75rem;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="lesson-badge">🔮 Module A - Chương 7</span>
            <h1 class="lesson-title">Bài 7.1: Con Người Cũ và Con Người Mới</h1>
            <p class="lesson-subtitle">Hành trình chuyển hóa từ trader nghiệp dư thành trader chuyên nghiệp</p>
        </header>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">🔄</div>
                <div class="card-meta">
                    <h3>Sự Chuyển Hóa Cần Thiết</h3>
                    <span>Từ Amateur đến Professional</span>
                </div>
            </div>
            <div class="card-body">
                <p>Đến đây, bạn đã có đủ <strong>kiến thức kỹ thuật</strong> để trading. Nhưng kiến thức không phải là tất cả. Sự khác biệt giữa trader thất bại và thành công nằm ở <strong>tư duy và hành vi</strong>.</p>

                <div class="quote-box">
                    <div class="quote-text">"Bạn không thể giải quyết vấn đề với cùng tư duy đã tạo ra nó."</div>
                    <div class="quote-author">— Albert Einstein</div>
                </div>

                <p>Module A sẽ giúp bạn thực hiện cuộc chuyển hóa từ "Con Người Cũ" - người trading bằng cảm xúc, sang "Con Người Mới" - trader chuyên nghiệp với kỷ luật thép.</p>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/8B5CF6?text=Old+Self+vs+New+Self" alt="Transformation">
                    <p class="image-caption">Hình 7.1.1: Hành trình chuyển hóa trader</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon red">👤</div>
                <div class="card-meta">
                    <h3>Con Người Cũ - The Old Self</h3>
                    <span>Những thói quen cần loại bỏ</span>
                </div>
            </div>
            <div class="card-body">
                <p>"Con Người Cũ" là phiên bản của bạn bị chi phối bởi cảm xúc và thiếu kỷ luật. Nhận diện để loại bỏ:</p>

                <ul class="styled-list red">
                    <li><strong>Trading cảm xúc:</strong> FOMO vào lệnh vì sợ bỏ lỡ, revenge trading khi thua</li>
                    <li><strong>Không có kế hoạch:</strong> Vào lệnh không có entry/SL/TP rõ ràng</li>
                    <li><strong>Risk quá cao:</strong> All-in một trade, không quản lý position size</li>
                    <li><strong>Thiếu kiên nhẫn:</strong> Vào lệnh khi chưa đủ điều kiện, không chờ confirmation</li>
                    <li><strong>Di chuyển Stop Loss:</strong> Mở rộng SL khi giá đi ngược, hy vọng giá quay lại</li>
                    <li><strong>Không chấp nhận thua:</strong> Từ chối cắt lỗ, hold losing trades quá lâu</li>
                </ul>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/EF4444?text=Bad+Trading+Habits" alt="Bad Habits">
                    <p class="image-caption">Hình 7.1.2: Những thói quen tự phá hủy trong trading</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">🌟</div>
                <div class="card-meta">
                    <h3>Con Người Mới - The New Self</h3>
                    <span>Những phẩm chất cần xây dựng</span>
                </div>
            </div>
            <div class="card-body">
                <p>"Con Người Mới" là trader chuyên nghiệp với mindset đúng đắn:</p>

                <ul class="styled-list green">
                    <li><strong>Kỷ luật tuyệt đối:</strong> Chỉ trade khi đủ điều kiện, tuyệt đối tuân thủ plan</li>
                    <li><strong>Tư duy xác suất:</strong> Hiểu rằng mỗi trade chỉ là 1 trong N trades, không cảm xúc với kết quả đơn lẻ</li>
                    <li><strong>Kiên nhẫn chiến lược:</strong> Chờ đợi setup tốt, không chase entries</li>
                    <li><strong>Risk management:</strong> Luôn tuân thủ 1-2% rule, position sizing đúng</li>
                    <li><strong>Chấp nhận loss:</strong> Hiểu loss là chi phí kinh doanh, cắt nhanh và move on</li>
                    <li><strong>Liên tục học hỏi:</strong> Review trades, journal, cải thiện không ngừng</li>
                </ul>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/10B981?text=Professional+Trader+Mindset" alt="Pro Mindset">
                    <p class="image-caption">Hình 7.1.3: Mindset của trader chuyên nghiệp</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">⚖️</div>
                <div class="card-meta">
                    <h3>So Sánh Chi Tiết</h3>
                    <span>Old Self vs New Self trong từng tình huống</span>
                </div>
            </div>
            <div class="card-body">
                <div class="comparison-grid">
                    <div class="comparison-card old">
                        <div class="comparison-title">❌ Con Người Cũ</div>
                        <ul class="comparison-list">
                            <li>Thấy giá lên → FOMO vào ngay</li>
                            <li>Thua 1 lệnh → Revenge trading</li>
                            <li>SL gần hit → Mở rộng SL</li>
                            <li>Thắng lớn → Tăng size gấp đôi</li>
                            <li>Không có setup → "Cứ thử xem"</li>
                            <li>Loss streak → Tự trách, nản chí</li>
                        </ul>
                    </div>
                    <div class="comparison-card new">
                        <div class="comparison-title">✅ Con Người Mới</div>
                        <ul class="comparison-list">
                            <li>Thấy giá lên → Chờ pullback về zone</li>
                            <li>Thua 1 lệnh → Review và tiếp tục plan</li>
                            <li>SL gần hit → Chấp nhận, để SL làm việc</li>
                            <li>Thắng lớn → Giữ nguyên size, không thay đổi</li>
                            <li>Không có setup → Không trade, chờ đợi</li>
                            <li>Loss streak → Phân tích, cải thiện process</li>
                        </ul>
                    </div>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">🚀</div>
                <div class="card-meta">
                    <h3>Lộ Trình Chuyển Hóa</h3>
                    <span>4 giai đoạn phát triển trader</span>
                </div>
            </div>
            <div class="card-body">
                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-marker">1</div>
                        <div class="timeline-content">
                            <h4>Unconscious Incompetence</h4>
                            <p>Không biết mình không biết gì. Trade theo cảm xúc, không hiểu tại sao thua.</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-marker">2</div>
                        <div class="timeline-content">
                            <h4>Conscious Incompetence</h4>
                            <p>Bắt đầu học và nhận ra những sai lầm. Biết rằng cần cải thiện nhiều.</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-marker">3</div>
                        <div class="timeline-content">
                            <h4>Conscious Competence</h4>
                            <p>Trade đúng nhưng còn cần nỗ lực. Phải tập trung cao độ để làm đúng.</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-marker">4</div>
                        <div class="timeline-content">
                            <h4>Unconscious Competence</h4>
                            <p>Trade đúng một cách tự nhiên. Kỷ luật trở thành thói quen, không cần nỗ lực.</p>
                        </div>
                    </div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/8B5CF6?text=4+Stages+of+Competence" alt="4 Stages">
                    <p class="image-caption">Hình 7.1.4: 4 giai đoạn phát triển năng lực trader</p>
                </div>
            </div>
        </article>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Sự chuyển hóa từ "Con Người Cũ" sang "Con Người Mới" là bắt buộc</li>
                <li>Con Người Cũ: Trading cảm xúc, thiếu kỷ luật, không chấp nhận loss</li>
                <li>Con Người Mới: Kỷ luật, tư duy xác suất, kiên nhẫn, chấp nhận loss</li>
                <li>4 giai đoạn: Từ không biết → biết → làm được → tự động</li>
                <li>Mục tiêu: Đạt Unconscious Competence - kỷ luật trở thành thói quen</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h3>🎯 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="2">
                <p><strong>Câu 1:</strong> "Con Người Cũ" trong trading có đặc điểm gì?</p>
                <button class="quiz-option" data-index="0">Luôn tuân thủ trading plan</button>
                <button class="quiz-option" data-index="1">Có tư duy xác suất tốt</button>
                <button class="quiz-option" data-index="2">Trading dựa trên cảm xúc và FOMO</button>
                <button class="quiz-option" data-index="3">Chấp nhận loss dễ dàng</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="3">
                <p><strong>Câu 2:</strong> Giai đoạn nào là mục tiêu cuối cùng của trader chuyên nghiệp?</p>
                <button class="quiz-option" data-index="0">Unconscious Incompetence</button>
                <button class="quiz-option" data-index="1">Conscious Incompetence</button>
                <button class="quiz-option" data-index="2">Conscious Competence</button>
                <button class="quiz-option" data-index="3">Unconscious Competence</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p><strong>Câu 3:</strong> Khi thua 1 lệnh, "Con Người Mới" sẽ làm gì?</p>
                <button class="quiz-option" data-index="0">Revenge trading để gỡ lại</button>
                <button class="quiz-option" data-index="1">Review trade và tiếp tục theo plan</button>
                <button class="quiz-option" data-index="2">Tăng size lệnh tiếp theo</button>
                <button class="quiz-option" data-index="3">Nghỉ trading vài ngày</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <div class="footer-logo">GEM Trading Academy</div>
            <p class="footer-text">Module A - Hành Trình Chuyển Hóa • Bài 7.1</p>
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
    <title>Bài 7.1: Con Người Cũ và Con Người Mới - GEM Trading Academy</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: #0a0a0f;
            color: #e4e4e7;
            line-height: 1.6;
            font-size: 16px;
        }

        .container {
            max-width: 680px;
            margin: 0 auto;
            background: #0a0a0f;
        }

        .lesson-header {
            padding: 1rem;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(100, 50, 200, 0.1) 100%);
            border-bottom: 1px solid rgba(139, 92, 246, 0.2);
        }

        .lesson-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 0.25rem;
        }

        .lesson-subtitle {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .content-card {
            background: #18181b;
            margin-bottom: 0.5rem;
        }

        .card-header {
            display: flex;
            align-items: center;
            padding: 1rem;
            gap: 0.75rem;
        }

        .card-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            flex-shrink: 0;
        }

        .card-icon.purple { background: rgba(139, 92, 246, 0.2); }
        .card-icon.gold { background: rgba(255, 189, 89, 0.2); }
        .card-icon.cyan { background: rgba(0, 240, 255, 0.2); }
        .card-icon.green { background: rgba(16, 185, 129, 0.2); }
        .card-icon.red { background: rgba(239, 68, 68, 0.2); }

        .card-meta h3 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: #ffffff;
        }

        .card-meta span {
            font-size: 0.75rem;
            color: #71717a;
        }

        .card-body {
            padding: 0 1rem 1rem 1rem;
        }

        .card-body p {
            color: #d4d4d8;
            margin-bottom: 0.75rem;
        }

        .styled-list {
            list-style: none;
            padding: 0;
            margin: 1rem 0;
        }

        .styled-list li {
            padding: 0.75rem 1rem;
            background: rgba(139, 92, 246, 0.05);
            border-left: 3px solid #8B5CF6;
            margin-bottom: 0.5rem;
            border-radius: 0 0.5rem 0.5rem 0;
        }

        .styled-list.red li {
            background: rgba(239, 68, 68, 0.05);
            border-left-color: #EF4444;
        }

        .styled-list.green li {
            background: rgba(16, 185, 129, 0.05);
            border-left-color: #10B981;
        }

        .styled-list.gold li {
            background: rgba(255, 189, 89, 0.05);
            border-left-color: #FFBD59;
        }

        .image-container {
            margin: 1rem 0;
            border-radius: 0.5rem;
            overflow: hidden;
        }

        .image-container img {
            width: 100%;
            height: auto;
            display: block;
        }

        .image-caption {
            font-size: 0.75rem;
            color: #71717a;
            text-align: center;
            padding: 0.5rem;
            background: rgba(0, 0, 0, 0.3);
        }

        /* Comparison Grid */
        .comparison-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .comparison-card {
            border-radius: 0.75rem;
            padding: 1rem;
        }

        .comparison-card.old {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .comparison-card.new {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .comparison-title {
            font-weight: 600;
            font-size: 0.875rem;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .comparison-card.old .comparison-title {
            color: #EF4444;
        }

        .comparison-card.new .comparison-title {
            color: #10B981;
        }

        .comparison-list {
            list-style: none;
            padding: 0;
            font-size: 0.8125rem;
        }

        .comparison-list li {
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            color: #a1a1aa;
        }

        .comparison-list li:last-child {
            border-bottom: none;
        }

        /* Quote Box */
        .quote-box {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(100, 50, 200, 0.15) 100%);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem 0;
            text-align: center;
        }

        .quote-text {
            font-size: 1.125rem;
            font-style: italic;
            color: #fff;
            margin-bottom: 0.5rem;
        }

        .quote-author {
            font-size: 0.8125rem;
            color: #8B5CF6;
        }

        /* Transformation Timeline */
        .timeline {
            margin: 1rem 0;
        }

        .timeline-item {
            display: flex;
            gap: 1rem;
            padding: 1rem 0;
        }

        .timeline-marker {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            color: white;
            flex-shrink: 0;
        }

        .timeline-content h4 {
            font-weight: 600;
            color: #fff;
            margin-bottom: 0.25rem;
        }

        .timeline-content p {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .summary-box {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(100, 50, 200, 0.15) 100%);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem;
        }

        .summary-box h3 {
            color: #8B5CF6;
            font-size: 1rem;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-list {
            list-style: none;
            padding: 0;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: #d4d4d8;
        }

        .summary-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #8B5CF6;
            font-weight: bold;
        }

        .quiz-section {
            background: #18181b;
            margin: 0.5rem 0;
            padding: 1.5rem 1rem;
        }

        .quiz-section h3 {
            color: #ffffff;
            font-size: 1.125rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: rgba(139, 92, 246, 0.05);
            border: 1px solid rgba(139, 92, 246, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 500;
            color: #fff;
            margin-bottom: 0.75rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            text-align: left;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            color: #d4d4d8;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .quiz-option:hover {
            background: rgba(139, 92, 246, 0.1);
            border-color: rgba(139, 92, 246, 0.3);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: #10B981;
            color: #10B981;
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: #EF4444;
            color: #EF4444;
        }

        .quiz-result {
            display: none;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-top: 0.75rem;
            font-weight: 500;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: #10B981;
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: #EF4444;
        }

        .quiz-score {
            display: none;
            text-align: center;
            padding: 1rem;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(100, 50, 200, 0.15) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: #8B5CF6;
        }

        .quiz-score .score-label {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .retake-btn {
            background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1rem;
        }

        .lesson-footer {
            padding: 1.5rem 1rem;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #8B5CF6 0%, #00F0FF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .footer-text {
            font-size: 0.75rem;
            color: #71717a;
            margin-top: 0.25rem;
        }

        @media (max-width: 600px) {
            .container {
                padding: 0;
            }

            .content-card {
                border-radius: 0;
                border-left: none;
                border-right: none;
            }

            .comparison-grid {
                grid-template-columns: 1fr;
            }

            .lesson-title {
                font-size: 1.25rem;
            }
        }

        @media (min-width: 600px) {
            .container {
                padding: 1.5rem;
            }

            .content-card {
                border-radius: 0.75rem;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="lesson-badge">🔮 Module A - Chương 7</span>
            <h1 class="lesson-title">Bài 7.1: Con Người Cũ và Con Người Mới</h1>
            <p class="lesson-subtitle">Hành trình chuyển hóa từ trader nghiệp dư thành trader chuyên nghiệp</p>
        </header>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">🔄</div>
                <div class="card-meta">
                    <h3>Sự Chuyển Hóa Cần Thiết</h3>
                    <span>Từ Amateur đến Professional</span>
                </div>
            </div>
            <div class="card-body">
                <p>Đến đây, bạn đã có đủ <strong>kiến thức kỹ thuật</strong> để trading. Nhưng kiến thức không phải là tất cả. Sự khác biệt giữa trader thất bại và thành công nằm ở <strong>tư duy và hành vi</strong>.</p>

                <div class="quote-box">
                    <div class="quote-text">"Bạn không thể giải quyết vấn đề với cùng tư duy đã tạo ra nó."</div>
                    <div class="quote-author">— Albert Einstein</div>
                </div>

                <p>Module A sẽ giúp bạn thực hiện cuộc chuyển hóa từ "Con Người Cũ" - người trading bằng cảm xúc, sang "Con Người Mới" - trader chuyên nghiệp với kỷ luật thép.</p>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/8B5CF6?text=Old+Self+vs+New+Self" alt="Transformation">
                    <p class="image-caption">Hình 7.1.1: Hành trình chuyển hóa trader</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon red">👤</div>
                <div class="card-meta">
                    <h3>Con Người Cũ - The Old Self</h3>
                    <span>Những thói quen cần loại bỏ</span>
                </div>
            </div>
            <div class="card-body">
                <p>"Con Người Cũ" là phiên bản của bạn bị chi phối bởi cảm xúc và thiếu kỷ luật. Nhận diện để loại bỏ:</p>

                <ul class="styled-list red">
                    <li><strong>Trading cảm xúc:</strong> FOMO vào lệnh vì sợ bỏ lỡ, revenge trading khi thua</li>
                    <li><strong>Không có kế hoạch:</strong> Vào lệnh không có entry/SL/TP rõ ràng</li>
                    <li><strong>Risk quá cao:</strong> All-in một trade, không quản lý position size</li>
                    <li><strong>Thiếu kiên nhẫn:</strong> Vào lệnh khi chưa đủ điều kiện, không chờ confirmation</li>
                    <li><strong>Di chuyển Stop Loss:</strong> Mở rộng SL khi giá đi ngược, hy vọng giá quay lại</li>
                    <li><strong>Không chấp nhận thua:</strong> Từ chối cắt lỗ, hold losing trades quá lâu</li>
                </ul>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/EF4444?text=Bad+Trading+Habits" alt="Bad Habits">
                    <p class="image-caption">Hình 7.1.2: Những thói quen tự phá hủy trong trading</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">🌟</div>
                <div class="card-meta">
                    <h3>Con Người Mới - The New Self</h3>
                    <span>Những phẩm chất cần xây dựng</span>
                </div>
            </div>
            <div class="card-body">
                <p>"Con Người Mới" là trader chuyên nghiệp với mindset đúng đắn:</p>

                <ul class="styled-list green">
                    <li><strong>Kỷ luật tuyệt đối:</strong> Chỉ trade khi đủ điều kiện, tuyệt đối tuân thủ plan</li>
                    <li><strong>Tư duy xác suất:</strong> Hiểu rằng mỗi trade chỉ là 1 trong N trades, không cảm xúc với kết quả đơn lẻ</li>
                    <li><strong>Kiên nhẫn chiến lược:</strong> Chờ đợi setup tốt, không chase entries</li>
                    <li><strong>Risk management:</strong> Luôn tuân thủ 1-2% rule, position sizing đúng</li>
                    <li><strong>Chấp nhận loss:</strong> Hiểu loss là chi phí kinh doanh, cắt nhanh và move on</li>
                    <li><strong>Liên tục học hỏi:</strong> Review trades, journal, cải thiện không ngừng</li>
                </ul>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/10B981?text=Professional+Trader+Mindset" alt="Pro Mindset">
                    <p class="image-caption">Hình 7.1.3: Mindset của trader chuyên nghiệp</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">⚖️</div>
                <div class="card-meta">
                    <h3>So Sánh Chi Tiết</h3>
                    <span>Old Self vs New Self trong từng tình huống</span>
                </div>
            </div>
            <div class="card-body">
                <div class="comparison-grid">
                    <div class="comparison-card old">
                        <div class="comparison-title">❌ Con Người Cũ</div>
                        <ul class="comparison-list">
                            <li>Thấy giá lên → FOMO vào ngay</li>
                            <li>Thua 1 lệnh → Revenge trading</li>
                            <li>SL gần hit → Mở rộng SL</li>
                            <li>Thắng lớn → Tăng size gấp đôi</li>
                            <li>Không có setup → "Cứ thử xem"</li>
                            <li>Loss streak → Tự trách, nản chí</li>
                        </ul>
                    </div>
                    <div class="comparison-card new">
                        <div class="comparison-title">✅ Con Người Mới</div>
                        <ul class="comparison-list">
                            <li>Thấy giá lên → Chờ pullback về zone</li>
                            <li>Thua 1 lệnh → Review và tiếp tục plan</li>
                            <li>SL gần hit → Chấp nhận, để SL làm việc</li>
                            <li>Thắng lớn → Giữ nguyên size, không thay đổi</li>
                            <li>Không có setup → Không trade, chờ đợi</li>
                            <li>Loss streak → Phân tích, cải thiện process</li>
                        </ul>
                    </div>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">🚀</div>
                <div class="card-meta">
                    <h3>Lộ Trình Chuyển Hóa</h3>
                    <span>4 giai đoạn phát triển trader</span>
                </div>
            </div>
            <div class="card-body">
                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-marker">1</div>
                        <div class="timeline-content">
                            <h4>Unconscious Incompetence</h4>
                            <p>Không biết mình không biết gì. Trade theo cảm xúc, không hiểu tại sao thua.</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-marker">2</div>
                        <div class="timeline-content">
                            <h4>Conscious Incompetence</h4>
                            <p>Bắt đầu học và nhận ra những sai lầm. Biết rằng cần cải thiện nhiều.</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-marker">3</div>
                        <div class="timeline-content">
                            <h4>Conscious Competence</h4>
                            <p>Trade đúng nhưng còn cần nỗ lực. Phải tập trung cao độ để làm đúng.</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-marker">4</div>
                        <div class="timeline-content">
                            <h4>Unconscious Competence</h4>
                            <p>Trade đúng một cách tự nhiên. Kỷ luật trở thành thói quen, không cần nỗ lực.</p>
                        </div>
                    </div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/8B5CF6?text=4+Stages+of+Competence" alt="4 Stages">
                    <p class="image-caption">Hình 7.1.4: 4 giai đoạn phát triển năng lực trader</p>
                </div>
            </div>
        </article>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Sự chuyển hóa từ "Con Người Cũ" sang "Con Người Mới" là bắt buộc</li>
                <li>Con Người Cũ: Trading cảm xúc, thiếu kỷ luật, không chấp nhận loss</li>
                <li>Con Người Mới: Kỷ luật, tư duy xác suất, kiên nhẫn, chấp nhận loss</li>
                <li>4 giai đoạn: Từ không biết → biết → làm được → tự động</li>
                <li>Mục tiêu: Đạt Unconscious Competence - kỷ luật trở thành thói quen</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h3>🎯 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="2">
                <p><strong>Câu 1:</strong> "Con Người Cũ" trong trading có đặc điểm gì?</p>
                <button class="quiz-option" data-index="0">Luôn tuân thủ trading plan</button>
                <button class="quiz-option" data-index="1">Có tư duy xác suất tốt</button>
                <button class="quiz-option" data-index="2">Trading dựa trên cảm xúc và FOMO</button>
                <button class="quiz-option" data-index="3">Chấp nhận loss dễ dàng</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="3">
                <p><strong>Câu 2:</strong> Giai đoạn nào là mục tiêu cuối cùng của trader chuyên nghiệp?</p>
                <button class="quiz-option" data-index="0">Unconscious Incompetence</button>
                <button class="quiz-option" data-index="1">Conscious Incompetence</button>
                <button class="quiz-option" data-index="2">Conscious Competence</button>
                <button class="quiz-option" data-index="3">Unconscious Competence</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p><strong>Câu 3:</strong> Khi thua 1 lệnh, "Con Người Mới" sẽ làm gì?</p>
                <button class="quiz-option" data-index="0">Revenge trading để gỡ lại</button>
                <button class="quiz-option" data-index="1">Review trade và tiếp tục theo plan</button>
                <button class="quiz-option" data-index="2">Tăng size lệnh tiếp theo</button>
                <button class="quiz-option" data-index="3">Nghỉ trading vài ngày</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <div class="footer-logo">GEM Trading Academy</div>
            <p class="footer-text">Module A - Hành Trình Chuyển Hóa • Bài 7.1</p>
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

-- Lesson 7.2: Bản Đồ Hành Trình - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch7-l2',
  'module-tier-2-ch7',
  'course-tier2-trading-advanced',
  'Bài 7.2: Bản Đồ Hành Trình - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 7.2: Bản Đồ Hành Trình - GEM Trading Academy</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: #0a0a0f;
            color: #e4e4e7;
            line-height: 1.6;
            font-size: 16px;
        }

        .container {
            max-width: 680px;
            margin: 0 auto;
            background: #0a0a0f;
        }

        .lesson-header {
            padding: 1rem;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(100, 50, 200, 0.1) 100%);
            border-bottom: 1px solid rgba(139, 92, 246, 0.2);
        }

        .lesson-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 0.25rem;
        }

        .lesson-subtitle {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .content-card {
            background: #18181b;
            margin-bottom: 0.5rem;
        }

        .card-header {
            display: flex;
            align-items: center;
            padding: 1rem;
            gap: 0.75rem;
        }

        .card-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            flex-shrink: 0;
        }

        .card-icon.purple { background: rgba(139, 92, 246, 0.2); }
        .card-icon.gold { background: rgba(255, 189, 89, 0.2); }
        .card-icon.cyan { background: rgba(0, 240, 255, 0.2); }
        .card-icon.green { background: rgba(16, 185, 129, 0.2); }

        .card-meta h3 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: #ffffff;
        }

        .card-meta span {
            font-size: 0.75rem;
            color: #71717a;
        }

        .card-body {
            padding: 0 1rem 1rem 1rem;
        }

        .card-body p {
            color: #d4d4d8;
            margin-bottom: 0.75rem;
        }

        .styled-list {
            list-style: none;
            padding: 0;
            margin: 1rem 0;
        }

        .styled-list li {
            padding: 0.75rem 1rem;
            background: rgba(139, 92, 246, 0.05);
            border-left: 3px solid #8B5CF6;
            margin-bottom: 0.5rem;
            border-radius: 0 0.5rem 0.5rem 0;
        }

        .styled-list.gold li {
            background: rgba(255, 189, 89, 0.05);
            border-left-color: #FFBD59;
        }

        .styled-list.green li {
            background: rgba(16, 185, 129, 0.05);
            border-left-color: #10B981;
        }

        .image-container {
            margin: 1rem 0;
            border-radius: 0.5rem;
            overflow: hidden;
        }

        .image-container img {
            width: 100%;
            height: auto;
            display: block;
        }

        .image-caption {
            font-size: 0.75rem;
            color: #71717a;
            text-align: center;
            padding: 0.5rem;
            background: rgba(0, 0, 0, 0.3);
        }

        /* Journey Map */
        .journey-map {
            margin: 1rem 0;
        }

        .journey-stage {
            background: rgba(139, 92, 246, 0.08);
            border: 1px solid rgba(139, 92, 246, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            margin-bottom: 0.75rem;
            position: relative;
        }

        .journey-stage::after {
            content: "↓";
            position: absolute;
            bottom: -1.25rem;
            left: 50%;
            transform: translateX(-50%);
            color: #8B5CF6;
            font-size: 1.25rem;
        }

        .journey-stage:last-child::after {
            display: none;
        }

        .stage-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.5rem;
        }

        .stage-number {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.8125rem;
            color: white;
        }

        .stage-title {
            font-weight: 600;
            color: #fff;
        }

        .stage-duration {
            font-size: 0.6875rem;
            color: #8B5CF6;
            margin-left: auto;
        }

        .stage-content {
            font-size: 0.875rem;
            color: #a1a1aa;
            padding-left: 2.5rem;
        }

        /* Milestone Grid */
        .milestone-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .milestone-card {
            background: rgba(255, 189, 89, 0.08);
            border: 1px solid rgba(255, 189, 89, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
        }

        .milestone-icon {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .milestone-title {
            font-weight: 600;
            color: #FFBD59;
            font-size: 0.875rem;
            margin-bottom: 0.25rem;
        }

        .milestone-desc {
            font-size: 0.75rem;
            color: #a1a1aa;
        }

        /* Quote Box */
        .quote-box {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(100, 50, 200, 0.15) 100%);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem 0;
            text-align: center;
        }

        .quote-text {
            font-size: 1.125rem;
            font-style: italic;
            color: #fff;
            margin-bottom: 0.5rem;
        }

        .quote-author {
            font-size: 0.8125rem;
            color: #8B5CF6;
        }

        .summary-box {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(100, 50, 200, 0.15) 100%);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem;
        }

        .summary-box h3 {
            color: #8B5CF6;
            font-size: 1rem;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-list {
            list-style: none;
            padding: 0;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: #d4d4d8;
        }

        .summary-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #8B5CF6;
            font-weight: bold;
        }

        .quiz-section {
            background: #18181b;
            margin: 0.5rem 0;
            padding: 1.5rem 1rem;
        }

        .quiz-section h3 {
            color: #ffffff;
            font-size: 1.125rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: rgba(139, 92, 246, 0.05);
            border: 1px solid rgba(139, 92, 246, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 500;
            color: #fff;
            margin-bottom: 0.75rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            text-align: left;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            color: #d4d4d8;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .quiz-option:hover {
            background: rgba(139, 92, 246, 0.1);
            border-color: rgba(139, 92, 246, 0.3);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: #10B981;
            color: #10B981;
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: #EF4444;
            color: #EF4444;
        }

        .quiz-result {
            display: none;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-top: 0.75rem;
            font-weight: 500;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: #10B981;
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: #EF4444;
        }

        .quiz-score {
            display: none;
            text-align: center;
            padding: 1rem;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(100, 50, 200, 0.15) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: #8B5CF6;
        }

        .quiz-score .score-label {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .retake-btn {
            background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1rem;
        }

        .lesson-footer {
            padding: 1.5rem 1rem;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #8B5CF6 0%, #00F0FF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .footer-text {
            font-size: 0.75rem;
            color: #71717a;
            margin-top: 0.25rem;
        }

        @media (max-width: 600px) {
            .container {
                padding: 0;
            }

            .content-card {
                border-radius: 0;
                border-left: none;
                border-right: none;
            }

            .milestone-grid {
                grid-template-columns: 1fr;
            }

            .lesson-title {
                font-size: 1.25rem;
            }
        }

        @media (min-width: 600px) {
            .container {
                padding: 1.5rem;
            }

            .content-card {
                border-radius: 0.75rem;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="lesson-badge">🗺️ Module A - Chương 7</span>
            <h1 class="lesson-title">Bài 7.2: Bản Đồ Hành Trình</h1>
            <p class="lesson-subtitle">Roadmap từ beginner đến consistent profitable trader</p>
        </header>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">🗺️</div>
                <div class="card-meta">
                    <h3>Bản Đồ Hành Trình Trader</h3>
                    <span>5 giai đoạn phát triển</span>
                </div>
            </div>
            <div class="card-body">
                <p>Mọi trader thành công đều đi qua cùng một hành trình. Biết bạn đang ở đâu và đích đến ở đâu giúp bạn không nản chí khi gặp khó khăn.</p>

                <div class="quote-box">
                    <div class="quote-text">"Hành trình ngàn dặm bắt đầu từ bước chân đầu tiên."</div>
                    <div class="quote-author">— Lão Tử</div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/8B5CF6?text=Trader+Journey+Roadmap" alt="Journey Map">
                    <p class="image-caption">Hình 7.2.1: Bản đồ hành trình từ beginner đến profitable</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">📍</div>
                <div class="card-meta">
                    <h3>5 Giai Đoạn Phát Triển</h3>
                    <span>Từ Newbie đến Consistent</span>
                </div>
            </div>
            <div class="card-body">
                <div class="journey-map">
                    <div class="journey-stage">
                        <div class="stage-header">
                            <span class="stage-number">1</span>
                            <span class="stage-title">Newbie (Người Mới)</span>
                            <span class="stage-duration">0-3 tháng</span>
                        </div>
                        <div class="stage-content">
                            Học kiến thức cơ bản, làm quen với charts, indicators, price action. Chưa có strategy rõ ràng, thường thua vì thiếu kiến thức.
                        </div>
                    </div>

                    <div class="journey-stage">
                        <div class="stage-header">
                            <span class="stage-number">2</span>
                            <span class="stage-title">Student (Học Viên)</span>
                            <span class="stage-duration">3-6 tháng</span>
                        </div>
                        <div class="stage-content">
                            Học method cụ thể (GEM Method), paper trading intensively. Bắt đầu hiểu market structure, zones, patterns. Vẫn thua nhưng biết tại sao.
                        </div>
                    </div>

                    <div class="journey-stage">
                        <div class="stage-header">
                            <span class="stage-number">3</span>
                            <span class="stage-title">Practitioner (Thực Hành)</span>
                            <span class="stage-duration">6-12 tháng</span>
                        </div>
                        <div class="stage-content">
                            Trading live với size nhỏ. Áp dụng method nhưng còn thiếu nhất quán. Breakeven hoặc lỗ nhẹ. Giai đoạn khó khăn nhất về tâm lý.
                        </div>
                    </div>

                    <div class="journey-stage">
                        <div class="stage-header">
                            <span class="stage-number">4</span>
                            <span class="stage-title">Profitable (Có Lợi Nhuận)</span>
                            <span class="stage-duration">12-24 tháng</span>
                        </div>
                        <div class="stage-content">
                            Consistent profit hàng tháng. Đã master method và tâm lý. Tăng dần position size. Thu nhập từ trading bắt đầu đáng kể.
                        </div>
                    </div>

                    <div class="journey-stage">
                        <div class="stage-header">
                            <span class="stage-number">5</span>
                            <span class="stage-title">Master (Bậc Thầy)</span>
                            <span class="stage-duration">24+ tháng</span>
                        </div>
                        <div class="stage-content">
                            Trading trở thành tự động. Có thể coach người khác. Thu nhập cao và ổn định từ trading. Liên tục tối ưu và phát triển strategy.
                        </div>
                    </div>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">🎯</div>
                <div class="card-meta">
                    <h3>Milestones Quan Trọng</h3>
                    <span>Các mốc đánh dấu tiến bộ</span>
                </div>
            </div>
            <div class="card-body">
                <div class="milestone-grid">
                    <div class="milestone-card">
                        <div class="milestone-icon">📊</div>
                        <div class="milestone-title">100 Paper Trades</div>
                        <div class="milestone-desc">Hoàn thành 100 trades demo với WR ≥ 40%</div>
                    </div>
                    <div class="milestone-card">
                        <div class="milestone-icon">📝</div>
                        <div class="milestone-title">Trading Plan</div>
                        <div class="milestone-desc">Có written plan với rules cụ thể</div>
                    </div>
                    <div class="milestone-card">
                        <div class="milestone-icon">💰</div>
                        <div class="milestone-title">First Profitable Month</div>
                        <div class="milestone-desc">Tháng đầu tiên có lợi nhuận net dương</div>
                    </div>
                    <div class="milestone-card">
                        <div class="milestone-icon">📈</div>
                        <div class="milestone-title">3 Months Consistent</div>
                        <div class="milestone-desc">3 tháng liên tiếp có lợi nhuận</div>
                    </div>
                    <div class="milestone-card">
                        <div class="milestone-icon">🎓</div>
                        <div class="milestone-title">Full-Time Ready</div>
                        <div class="milestone-desc">Thu nhập trading = thu nhập job</div>
                    </div>
                    <div class="milestone-card">
                        <div class="milestone-icon">🏆</div>
                        <div class="milestone-title">Mentor Status</div>
                        <div class="milestone-desc">Có thể dạy và coach người khác</div>
                    </div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/10B981?text=Trading+Milestones+Timeline" alt="Milestones">
                    <p class="image-caption">Hình 7.2.2: Các mốc milestones trên hành trình trader</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">📋</div>
                <div class="card-meta">
                    <h3>Bạn Đang Ở Đâu?</h3>
                    <span>Tự đánh giá vị trí hiện tại</span>
                </div>
            </div>
            <div class="card-body">
                <p>Hoàn thành TIER 2 nghĩa là bạn đang ở cuối giai đoạn <strong>Student</strong> và chuẩn bị bước vào <strong>Practitioner</strong>.</p>

                <ul class="styled-list green">
                    <li><strong>Kiến thức:</strong> Đã có đủ - 24 patterns, MTF, zone grading, risk management</li>
                    <li><strong>Kỹ năng:</strong> Đang phát triển - cần paper trade thêm 100+ trades</li>
                    <li><strong>Tâm lý:</strong> Bắt đầu hình thành - cần trải nghiệm thực tế</li>
                    <li><strong>Thói quen:</strong> Đang xây dựng - journal, review, routine</li>
                </ul>

                <p><strong>Bước tiếp theo:</strong></p>
                <ul class="styled-list gold">
                    <li>Hoàn thành 100 paper trades với GEM Method</li>
                    <li>Đạt win rate ≥ 40% và R:R ≥ 1:2 trên paper</li>
                    <li>Xây dựng trading journal và review thường xuyên</li>
                    <li>Chuẩn bị tâm lý cho live trading</li>
                </ul>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/00F0FF?text=Your+Current+Position" alt="Current Position">
                    <p class="image-caption">Hình 7.2.3: Vị trí của bạn trên bản đồ hành trình</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">⚡</div>
                <div class="card-meta">
                    <h3>Tăng Tốc Hành Trình</h3>
                    <span>Cách rút ngắn thời gian</span>
                </div>
            </div>
            <div class="card-body">
                <p>Hành trình có thể rút ngắn nếu bạn làm đúng những điều sau:</p>

                <ul class="styled-list">
                    <li><strong>Practice Deliberately:</strong> Paper trade có mục đích, không phải random clicking</li>
                    <li><strong>Journal Everything:</strong> Ghi chép mọi trade, review hàng tuần</li>
                    <li><strong>Tìm Mentor:</strong> Học từ người đã đi trước, tránh những sai lầm phổ biến</li>
                    <li><strong>Community:</strong> Tham gia cộng đồng, học hỏi từ peers</li>
                    <li><strong>Focus on Process:</strong> Tập trung vào làm đúng, không chỉ result</li>
                </ul>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/8B5CF6?text=Accelerate+Your+Journey" alt="Accelerate">
                    <p class="image-caption">Hình 7.2.4: Yếu tố tăng tốc hành trình trader</p>
                </div>
            </div>
        </article>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>5 giai đoạn: Newbie → Student → Practitioner → Profitable → Master</li>
                <li>Sau TIER 2: Bạn đang cuối Student, chuẩn bị vào Practitioner</li>
                <li>Milestones quan trọng: 100 paper trades, first profitable month, 3 months consistent</li>
                <li>Tăng tốc bằng: Deliberate practice, journaling, mentor, community</li>
                <li>Timeline trung bình: 12-24 tháng đến consistent profitability</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h3>🎯 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="2">
                <p><strong>Câu 1:</strong> Sau khi hoàn thành TIER 2, bạn đang ở giai đoạn nào trên bản đồ hành trình?</p>
                <button class="quiz-option" data-index="0">Newbie</button>
                <button class="quiz-option" data-index="1">Master</button>
                <button class="quiz-option" data-index="2">Cuối Student, chuẩn bị vào Practitioner</button>
                <button class="quiz-option" data-index="3">Profitable</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p><strong>Câu 2:</strong> Milestone nào đánh dấu bạn đã sẵn sàng trade live?</p>
                <button class="quiz-option" data-index="0">Đọc xong tất cả lessons</button>
                <button class="quiz-option" data-index="1">Hoàn thành 100 paper trades với WR ≥ 40%</button>
                <button class="quiz-option" data-index="2">Có nhiều tiền trong account</button>
                <button class="quiz-option" data-index="3">Thắng liên tiếp 10 trades</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p><strong>Câu 3:</strong> Yếu tố nào giúp tăng tốc hành trình trader?</p>
                <button class="quiz-option" data-index="0">Deliberate practice, journaling, và có mentor</button>
                <button class="quiz-option" data-index="1">Trade với size lớn hơn</button>
                <button class="quiz-option" data-index="2">Trade nhiều cặp tiền hơn</button>
                <button class="quiz-option" data-index="3">Sử dụng nhiều indicators hơn</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <div class="footer-logo">GEM Trading Academy</div>
            <p class="footer-text">Module A - Hành Trình Chuyển Hóa • Bài 7.2</p>
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
    <title>Bài 7.2: Bản Đồ Hành Trình - GEM Trading Academy</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: #0a0a0f;
            color: #e4e4e7;
            line-height: 1.6;
            font-size: 16px;
        }

        .container {
            max-width: 680px;
            margin: 0 auto;
            background: #0a0a0f;
        }

        .lesson-header {
            padding: 1rem;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(100, 50, 200, 0.1) 100%);
            border-bottom: 1px solid rgba(139, 92, 246, 0.2);
        }

        .lesson-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 0.25rem;
        }

        .lesson-subtitle {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .content-card {
            background: #18181b;
            margin-bottom: 0.5rem;
        }

        .card-header {
            display: flex;
            align-items: center;
            padding: 1rem;
            gap: 0.75rem;
        }

        .card-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            flex-shrink: 0;
        }

        .card-icon.purple { background: rgba(139, 92, 246, 0.2); }
        .card-icon.gold { background: rgba(255, 189, 89, 0.2); }
        .card-icon.cyan { background: rgba(0, 240, 255, 0.2); }
        .card-icon.green { background: rgba(16, 185, 129, 0.2); }

        .card-meta h3 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: #ffffff;
        }

        .card-meta span {
            font-size: 0.75rem;
            color: #71717a;
        }

        .card-body {
            padding: 0 1rem 1rem 1rem;
        }

        .card-body p {
            color: #d4d4d8;
            margin-bottom: 0.75rem;
        }

        .styled-list {
            list-style: none;
            padding: 0;
            margin: 1rem 0;
        }

        .styled-list li {
            padding: 0.75rem 1rem;
            background: rgba(139, 92, 246, 0.05);
            border-left: 3px solid #8B5CF6;
            margin-bottom: 0.5rem;
            border-radius: 0 0.5rem 0.5rem 0;
        }

        .styled-list.gold li {
            background: rgba(255, 189, 89, 0.05);
            border-left-color: #FFBD59;
        }

        .styled-list.green li {
            background: rgba(16, 185, 129, 0.05);
            border-left-color: #10B981;
        }

        .image-container {
            margin: 1rem 0;
            border-radius: 0.5rem;
            overflow: hidden;
        }

        .image-container img {
            width: 100%;
            height: auto;
            display: block;
        }

        .image-caption {
            font-size: 0.75rem;
            color: #71717a;
            text-align: center;
            padding: 0.5rem;
            background: rgba(0, 0, 0, 0.3);
        }

        /* Journey Map */
        .journey-map {
            margin: 1rem 0;
        }

        .journey-stage {
            background: rgba(139, 92, 246, 0.08);
            border: 1px solid rgba(139, 92, 246, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            margin-bottom: 0.75rem;
            position: relative;
        }

        .journey-stage::after {
            content: "↓";
            position: absolute;
            bottom: -1.25rem;
            left: 50%;
            transform: translateX(-50%);
            color: #8B5CF6;
            font-size: 1.25rem;
        }

        .journey-stage:last-child::after {
            display: none;
        }

        .stage-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.5rem;
        }

        .stage-number {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.8125rem;
            color: white;
        }

        .stage-title {
            font-weight: 600;
            color: #fff;
        }

        .stage-duration {
            font-size: 0.6875rem;
            color: #8B5CF6;
            margin-left: auto;
        }

        .stage-content {
            font-size: 0.875rem;
            color: #a1a1aa;
            padding-left: 2.5rem;
        }

        /* Milestone Grid */
        .milestone-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .milestone-card {
            background: rgba(255, 189, 89, 0.08);
            border: 1px solid rgba(255, 189, 89, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
        }

        .milestone-icon {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .milestone-title {
            font-weight: 600;
            color: #FFBD59;
            font-size: 0.875rem;
            margin-bottom: 0.25rem;
        }

        .milestone-desc {
            font-size: 0.75rem;
            color: #a1a1aa;
        }

        /* Quote Box */
        .quote-box {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(100, 50, 200, 0.15) 100%);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem 0;
            text-align: center;
        }

        .quote-text {
            font-size: 1.125rem;
            font-style: italic;
            color: #fff;
            margin-bottom: 0.5rem;
        }

        .quote-author {
            font-size: 0.8125rem;
            color: #8B5CF6;
        }

        .summary-box {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(100, 50, 200, 0.15) 100%);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem;
        }

        .summary-box h3 {
            color: #8B5CF6;
            font-size: 1rem;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-list {
            list-style: none;
            padding: 0;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: #d4d4d8;
        }

        .summary-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #8B5CF6;
            font-weight: bold;
        }

        .quiz-section {
            background: #18181b;
            margin: 0.5rem 0;
            padding: 1.5rem 1rem;
        }

        .quiz-section h3 {
            color: #ffffff;
            font-size: 1.125rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: rgba(139, 92, 246, 0.05);
            border: 1px solid rgba(139, 92, 246, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 500;
            color: #fff;
            margin-bottom: 0.75rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            text-align: left;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            color: #d4d4d8;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .quiz-option:hover {
            background: rgba(139, 92, 246, 0.1);
            border-color: rgba(139, 92, 246, 0.3);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: #10B981;
            color: #10B981;
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: #EF4444;
            color: #EF4444;
        }

        .quiz-result {
            display: none;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-top: 0.75rem;
            font-weight: 500;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: #10B981;
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: #EF4444;
        }

        .quiz-score {
            display: none;
            text-align: center;
            padding: 1rem;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(100, 50, 200, 0.15) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: #8B5CF6;
        }

        .quiz-score .score-label {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .retake-btn {
            background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1rem;
        }

        .lesson-footer {
            padding: 1.5rem 1rem;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #8B5CF6 0%, #00F0FF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .footer-text {
            font-size: 0.75rem;
            color: #71717a;
            margin-top: 0.25rem;
        }

        @media (max-width: 600px) {
            .container {
                padding: 0;
            }

            .content-card {
                border-radius: 0;
                border-left: none;
                border-right: none;
            }

            .milestone-grid {
                grid-template-columns: 1fr;
            }

            .lesson-title {
                font-size: 1.25rem;
            }
        }

        @media (min-width: 600px) {
            .container {
                padding: 1.5rem;
            }

            .content-card {
                border-radius: 0.75rem;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="lesson-badge">🗺️ Module A - Chương 7</span>
            <h1 class="lesson-title">Bài 7.2: Bản Đồ Hành Trình</h1>
            <p class="lesson-subtitle">Roadmap từ beginner đến consistent profitable trader</p>
        </header>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">🗺️</div>
                <div class="card-meta">
                    <h3>Bản Đồ Hành Trình Trader</h3>
                    <span>5 giai đoạn phát triển</span>
                </div>
            </div>
            <div class="card-body">
                <p>Mọi trader thành công đều đi qua cùng một hành trình. Biết bạn đang ở đâu và đích đến ở đâu giúp bạn không nản chí khi gặp khó khăn.</p>

                <div class="quote-box">
                    <div class="quote-text">"Hành trình ngàn dặm bắt đầu từ bước chân đầu tiên."</div>
                    <div class="quote-author">— Lão Tử</div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/8B5CF6?text=Trader+Journey+Roadmap" alt="Journey Map">
                    <p class="image-caption">Hình 7.2.1: Bản đồ hành trình từ beginner đến profitable</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">📍</div>
                <div class="card-meta">
                    <h3>5 Giai Đoạn Phát Triển</h3>
                    <span>Từ Newbie đến Consistent</span>
                </div>
            </div>
            <div class="card-body">
                <div class="journey-map">
                    <div class="journey-stage">
                        <div class="stage-header">
                            <span class="stage-number">1</span>
                            <span class="stage-title">Newbie (Người Mới)</span>
                            <span class="stage-duration">0-3 tháng</span>
                        </div>
                        <div class="stage-content">
                            Học kiến thức cơ bản, làm quen với charts, indicators, price action. Chưa có strategy rõ ràng, thường thua vì thiếu kiến thức.
                        </div>
                    </div>

                    <div class="journey-stage">
                        <div class="stage-header">
                            <span class="stage-number">2</span>
                            <span class="stage-title">Student (Học Viên)</span>
                            <span class="stage-duration">3-6 tháng</span>
                        </div>
                        <div class="stage-content">
                            Học method cụ thể (GEM Method), paper trading intensively. Bắt đầu hiểu market structure, zones, patterns. Vẫn thua nhưng biết tại sao.
                        </div>
                    </div>

                    <div class="journey-stage">
                        <div class="stage-header">
                            <span class="stage-number">3</span>
                            <span class="stage-title">Practitioner (Thực Hành)</span>
                            <span class="stage-duration">6-12 tháng</span>
                        </div>
                        <div class="stage-content">
                            Trading live với size nhỏ. Áp dụng method nhưng còn thiếu nhất quán. Breakeven hoặc lỗ nhẹ. Giai đoạn khó khăn nhất về tâm lý.
                        </div>
                    </div>

                    <div class="journey-stage">
                        <div class="stage-header">
                            <span class="stage-number">4</span>
                            <span class="stage-title">Profitable (Có Lợi Nhuận)</span>
                            <span class="stage-duration">12-24 tháng</span>
                        </div>
                        <div class="stage-content">
                            Consistent profit hàng tháng. Đã master method và tâm lý. Tăng dần position size. Thu nhập từ trading bắt đầu đáng kể.
                        </div>
                    </div>

                    <div class="journey-stage">
                        <div class="stage-header">
                            <span class="stage-number">5</span>
                            <span class="stage-title">Master (Bậc Thầy)</span>
                            <span class="stage-duration">24+ tháng</span>
                        </div>
                        <div class="stage-content">
                            Trading trở thành tự động. Có thể coach người khác. Thu nhập cao và ổn định từ trading. Liên tục tối ưu và phát triển strategy.
                        </div>
                    </div>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">🎯</div>
                <div class="card-meta">
                    <h3>Milestones Quan Trọng</h3>
                    <span>Các mốc đánh dấu tiến bộ</span>
                </div>
            </div>
            <div class="card-body">
                <div class="milestone-grid">
                    <div class="milestone-card">
                        <div class="milestone-icon">📊</div>
                        <div class="milestone-title">100 Paper Trades</div>
                        <div class="milestone-desc">Hoàn thành 100 trades demo với WR ≥ 40%</div>
                    </div>
                    <div class="milestone-card">
                        <div class="milestone-icon">📝</div>
                        <div class="milestone-title">Trading Plan</div>
                        <div class="milestone-desc">Có written plan với rules cụ thể</div>
                    </div>
                    <div class="milestone-card">
                        <div class="milestone-icon">💰</div>
                        <div class="milestone-title">First Profitable Month</div>
                        <div class="milestone-desc">Tháng đầu tiên có lợi nhuận net dương</div>
                    </div>
                    <div class="milestone-card">
                        <div class="milestone-icon">📈</div>
                        <div class="milestone-title">3 Months Consistent</div>
                        <div class="milestone-desc">3 tháng liên tiếp có lợi nhuận</div>
                    </div>
                    <div class="milestone-card">
                        <div class="milestone-icon">🎓</div>
                        <div class="milestone-title">Full-Time Ready</div>
                        <div class="milestone-desc">Thu nhập trading = thu nhập job</div>
                    </div>
                    <div class="milestone-card">
                        <div class="milestone-icon">🏆</div>
                        <div class="milestone-title">Mentor Status</div>
                        <div class="milestone-desc">Có thể dạy và coach người khác</div>
                    </div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/10B981?text=Trading+Milestones+Timeline" alt="Milestones">
                    <p class="image-caption">Hình 7.2.2: Các mốc milestones trên hành trình trader</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">📋</div>
                <div class="card-meta">
                    <h3>Bạn Đang Ở Đâu?</h3>
                    <span>Tự đánh giá vị trí hiện tại</span>
                </div>
            </div>
            <div class="card-body">
                <p>Hoàn thành TIER 2 nghĩa là bạn đang ở cuối giai đoạn <strong>Student</strong> và chuẩn bị bước vào <strong>Practitioner</strong>.</p>

                <ul class="styled-list green">
                    <li><strong>Kiến thức:</strong> Đã có đủ - 24 patterns, MTF, zone grading, risk management</li>
                    <li><strong>Kỹ năng:</strong> Đang phát triển - cần paper trade thêm 100+ trades</li>
                    <li><strong>Tâm lý:</strong> Bắt đầu hình thành - cần trải nghiệm thực tế</li>
                    <li><strong>Thói quen:</strong> Đang xây dựng - journal, review, routine</li>
                </ul>

                <p><strong>Bước tiếp theo:</strong></p>
                <ul class="styled-list gold">
                    <li>Hoàn thành 100 paper trades với GEM Method</li>
                    <li>Đạt win rate ≥ 40% và R:R ≥ 1:2 trên paper</li>
                    <li>Xây dựng trading journal và review thường xuyên</li>
                    <li>Chuẩn bị tâm lý cho live trading</li>
                </ul>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/00F0FF?text=Your+Current+Position" alt="Current Position">
                    <p class="image-caption">Hình 7.2.3: Vị trí của bạn trên bản đồ hành trình</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">⚡</div>
                <div class="card-meta">
                    <h3>Tăng Tốc Hành Trình</h3>
                    <span>Cách rút ngắn thời gian</span>
                </div>
            </div>
            <div class="card-body">
                <p>Hành trình có thể rút ngắn nếu bạn làm đúng những điều sau:</p>

                <ul class="styled-list">
                    <li><strong>Practice Deliberately:</strong> Paper trade có mục đích, không phải random clicking</li>
                    <li><strong>Journal Everything:</strong> Ghi chép mọi trade, review hàng tuần</li>
                    <li><strong>Tìm Mentor:</strong> Học từ người đã đi trước, tránh những sai lầm phổ biến</li>
                    <li><strong>Community:</strong> Tham gia cộng đồng, học hỏi từ peers</li>
                    <li><strong>Focus on Process:</strong> Tập trung vào làm đúng, không chỉ result</li>
                </ul>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/8B5CF6?text=Accelerate+Your+Journey" alt="Accelerate">
                    <p class="image-caption">Hình 7.2.4: Yếu tố tăng tốc hành trình trader</p>
                </div>
            </div>
        </article>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>5 giai đoạn: Newbie → Student → Practitioner → Profitable → Master</li>
                <li>Sau TIER 2: Bạn đang cuối Student, chuẩn bị vào Practitioner</li>
                <li>Milestones quan trọng: 100 paper trades, first profitable month, 3 months consistent</li>
                <li>Tăng tốc bằng: Deliberate practice, journaling, mentor, community</li>
                <li>Timeline trung bình: 12-24 tháng đến consistent profitability</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h3>🎯 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="2">
                <p><strong>Câu 1:</strong> Sau khi hoàn thành TIER 2, bạn đang ở giai đoạn nào trên bản đồ hành trình?</p>
                <button class="quiz-option" data-index="0">Newbie</button>
                <button class="quiz-option" data-index="1">Master</button>
                <button class="quiz-option" data-index="2">Cuối Student, chuẩn bị vào Practitioner</button>
                <button class="quiz-option" data-index="3">Profitable</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p><strong>Câu 2:</strong> Milestone nào đánh dấu bạn đã sẵn sàng trade live?</p>
                <button class="quiz-option" data-index="0">Đọc xong tất cả lessons</button>
                <button class="quiz-option" data-index="1">Hoàn thành 100 paper trades với WR ≥ 40%</button>
                <button class="quiz-option" data-index="2">Có nhiều tiền trong account</button>
                <button class="quiz-option" data-index="3">Thắng liên tiếp 10 trades</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p><strong>Câu 3:</strong> Yếu tố nào giúp tăng tốc hành trình trader?</p>
                <button class="quiz-option" data-index="0">Deliberate practice, journaling, và có mentor</button>
                <button class="quiz-option" data-index="1">Trade với size lớn hơn</button>
                <button class="quiz-option" data-index="2">Trade nhiều cặp tiền hơn</button>
                <button class="quiz-option" data-index="3">Sử dụng nhiều indicators hơn</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <div class="footer-logo">GEM Trading Academy</div>
            <p class="footer-text">Module A - Hành Trình Chuyển Hóa • Bài 7.2</p>
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

-- Lesson 7.3: Sự Thay Đổi Thực Sự - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch7-l3',
  'module-tier-2-ch7',
  'course-tier2-trading-advanced',
  'Bài 7.3: Sự Thay Đổi Thực Sự - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 7.3: Sự Thay Đổi Thực Sự - GEM Trading Academy</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: #0a0a0f;
            color: #e4e4e7;
            line-height: 1.6;
            font-size: 16px;
        }

        .container {
            max-width: 680px;
            margin: 0 auto;
            background: #0a0a0f;
        }

        .lesson-header {
            padding: 1rem;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(100, 50, 200, 0.1) 100%);
            border-bottom: 1px solid rgba(139, 92, 246, 0.2);
        }

        .lesson-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 0.25rem;
        }

        .lesson-subtitle {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .content-card {
            background: #18181b;
            margin-bottom: 0.5rem;
        }

        .card-header {
            display: flex;
            align-items: center;
            padding: 1rem;
            gap: 0.75rem;
        }

        .card-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            flex-shrink: 0;
        }

        .card-icon.purple { background: rgba(139, 92, 246, 0.2); }
        .card-icon.gold { background: rgba(255, 189, 89, 0.2); }
        .card-icon.green { background: rgba(16, 185, 129, 0.2); }
        .card-icon.cyan { background: rgba(0, 240, 255, 0.2); }

        .card-meta h3 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: #ffffff;
        }

        .card-meta span {
            font-size: 0.75rem;
            color: #71717a;
        }

        .card-body {
            padding: 0 1rem 1rem 1rem;
        }

        .card-body p {
            color: #d4d4d8;
            margin-bottom: 0.75rem;
        }

        .styled-list {
            list-style: none;
            padding: 0;
            margin: 1rem 0;
        }

        .styled-list li {
            padding: 0.75rem 1rem;
            background: rgba(139, 92, 246, 0.05);
            border-left: 3px solid #8B5CF6;
            margin-bottom: 0.5rem;
            border-radius: 0 0.5rem 0.5rem 0;
        }

        .styled-list.green li {
            background: rgba(16, 185, 129, 0.05);
            border-left-color: #10B981;
        }

        .styled-list.gold li {
            background: rgba(255, 189, 89, 0.05);
            border-left-color: #FFBD59;
        }

        .image-container {
            margin: 1rem 0;
            border-radius: 0.5rem;
            overflow: hidden;
        }

        .image-container img {
            width: 100%;
            height: auto;
            display: block;
        }

        .image-caption {
            font-size: 0.75rem;
            color: #71717a;
            text-align: center;
            padding: 0.5rem;
            background: rgba(0, 0, 0, 0.3);
        }

        /* Change Grid */
        .change-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .change-card {
            background: rgba(16, 185, 129, 0.08);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
        }

        .change-icon {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .change-title {
            font-weight: 600;
            color: #10B981;
            font-size: 0.8125rem;
            margin-bottom: 0.25rem;
        }

        .change-desc {
            font-size: 0.6875rem;
            color: #a1a1aa;
        }

        /* Quote Box */
        .quote-box {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(100, 50, 200, 0.15) 100%);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem 0;
            text-align: center;
        }

        .quote-text {
            font-size: 1.125rem;
            font-style: italic;
            color: #fff;
            margin-bottom: 0.5rem;
        }

        .quote-author {
            font-size: 0.8125rem;
            color: #8B5CF6;
        }

        /* Habit Tracker */
        .habit-box {
            background: rgba(139, 92, 246, 0.08);
            border: 1px solid rgba(139, 92, 246, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .habit-title {
            font-weight: 600;
            color: #8B5CF6;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .habit-list {
            list-style: none;
            padding: 0;
        }

        .habit-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .habit-item:last-child {
            border-bottom: none;
        }

        .habit-checkbox {
            width: 20px;
            height: 20px;
            border: 2px solid #8B5CF6;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
        }

        .habit-text {
            font-size: 0.875rem;
            color: #d4d4d8;
        }

        .summary-box {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(100, 50, 200, 0.15) 100%);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem;
        }

        .summary-box h3 {
            color: #8B5CF6;
            font-size: 1rem;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-list {
            list-style: none;
            padding: 0;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: #d4d4d8;
        }

        .summary-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #8B5CF6;
            font-weight: bold;
        }

        .quiz-section {
            background: #18181b;
            margin: 0.5rem 0;
            padding: 1.5rem 1rem;
        }

        .quiz-section h3 {
            color: #ffffff;
            font-size: 1.125rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: rgba(139, 92, 246, 0.05);
            border: 1px solid rgba(139, 92, 246, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 500;
            color: #fff;
            margin-bottom: 0.75rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            text-align: left;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            color: #d4d4d8;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .quiz-option:hover {
            background: rgba(139, 92, 246, 0.1);
            border-color: rgba(139, 92, 246, 0.3);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: #10B981;
            color: #10B981;
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: #EF4444;
            color: #EF4444;
        }

        .quiz-result {
            display: none;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-top: 0.75rem;
            font-weight: 500;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: #10B981;
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: #EF4444;
        }

        .quiz-score {
            display: none;
            text-align: center;
            padding: 1rem;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(100, 50, 200, 0.15) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: #8B5CF6;
        }

        .quiz-score .score-label {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .retake-btn {
            background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1rem;
        }

        .lesson-footer {
            padding: 1.5rem 1rem;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #8B5CF6 0%, #00F0FF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .footer-text {
            font-size: 0.75rem;
            color: #71717a;
            margin-top: 0.25rem;
        }

        @media (max-width: 600px) {
            .container {
                padding: 0;
            }

            .content-card {
                border-radius: 0;
                border-left: none;
                border-right: none;
            }

            .change-grid {
                grid-template-columns: 1fr;
            }

            .lesson-title {
                font-size: 1.25rem;
            }
        }

        @media (min-width: 600px) {
            .container {
                padding: 1.5rem;
            }

            .content-card {
                border-radius: 0.75rem;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="lesson-badge">🦋 Module A - Chương 7</span>
            <h1 class="lesson-title">Bài 7.3: Sự Thay Đổi Thực Sự</h1>
            <p class="lesson-subtitle">Từ biết đến làm - Hành động tạo nên khác biệt</p>
        </header>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">🔑</div>
                <div class="card-meta">
                    <h3>Bí Mật Của Sự Thay Đổi</h3>
                    <span>Knowledge vs Action</span>
                </div>
            </div>
            <div class="card-body">
                <p>90% traders biết nên làm gì nhưng không làm. Sự khác biệt giữa thành công và thất bại không nằm ở kiến thức, mà ở <strong>hành động nhất quán</strong>.</p>

                <div class="quote-box">
                    <div class="quote-text">"Biết mà không làm, coi như không biết."</div>
                    <div class="quote-author">— Vương Dương Minh</div>
                </div>

                <p>Sự thay đổi thực sự xảy ra khi:</p>
                <ul class="styled-list green">
                    <li><strong>Kiến thức → Hành động:</strong> Áp dụng những gì đã học vào thực tế</li>
                    <li><strong>Hành động → Thói quen:</strong> Lặp đi lặp lại cho đến khi tự động</li>
                    <li><strong>Thói quen → Bản sắc:</strong> Trở thành một phần của con người bạn</li>
                </ul>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/8B5CF6?text=Knowledge+to+Identity" alt="Change Process">
                    <p class="image-caption">Hình 7.3.1: Hành trình từ Kiến thức đến Bản sắc</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">🎯</div>
                <div class="card-meta">
                    <h3>3 Lĩnh Vực Cần Thay Đổi</h3>
                    <span>Mindset - Behavior - Habits</span>
                </div>
            </div>
            <div class="card-body">
                <div class="change-grid">
                    <div class="change-card">
                        <div class="change-icon">🧠</div>
                        <div class="change-title">MINDSET</div>
                        <div class="change-desc">Tư duy xác suất<br>Chấp nhận loss<br>Patience</div>
                    </div>
                    <div class="change-card">
                        <div class="change-icon">⚡</div>
                        <div class="change-title">BEHAVIOR</div>
                        <div class="change-desc">Tuân thủ plan<br>Không FOMO<br>Cut loss nhanh</div>
                    </div>
                    <div class="change-card">
                        <div class="change-icon">🔄</div>
                        <div class="change-title">HABITS</div>
                        <div class="change-desc">Daily routine<br>Journaling<br>Review trades</div>
                    </div>
                </div>

                <p><strong>Mindset thay đổi trước:</strong></p>
                <ul class="styled-list">
                    <li><strong>"Thua là thất bại"</strong> → "Thua là chi phí kinh doanh, một phần của process"</li>
                    <li><strong>"Cần thắng trade này"</strong> → "Đây chỉ là 1 trong 100 trades"</li>
                    <li><strong>"Market sai"</strong> → "Tôi cần điều chỉnh analysis"</li>
                    <li><strong>"Sao tôi không giàu nhanh"</strong> → "Process over profit, consistency over speed"</li>
                </ul>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">📋</div>
                <div class="card-meta">
                    <h3>Daily Habits Của Pro Trader</h3>
                    <span>Routine tạo nên nhất quán</span>
                </div>
            </div>
            <div class="card-body">
                <div class="habit-box">
                    <div class="habit-title">☀️ Morning Routine</div>
                    <ul class="habit-list">
                        <li class="habit-item">
                            <div class="habit-checkbox">☐</div>
                            <div class="habit-text">Check economic calendar cho ngày hôm nay</div>
                        </li>
                        <li class="habit-item">
                            <div class="habit-checkbox">☐</div>
                            <div class="habit-text">Review overnight price action trên HTF</div>
                        </li>
                        <li class="habit-item">
                            <div class="habit-checkbox">☐</div>
                            <div class="habit-text">Mark key zones và potential setups</div>
                        </li>
                        <li class="habit-item">
                            <div class="habit-checkbox">☐</div>
                            <div class="habit-text">Set alerts cho entry zones</div>
                        </li>
                    </ul>
                </div>

                <div class="habit-box">
                    <div class="habit-title">🌙 Evening Routine</div>
                    <ul class="habit-list">
                        <li class="habit-item">
                            <div class="habit-checkbox">☐</div>
                            <div class="habit-text">Review all trades taken today</div>
                        </li>
                        <li class="habit-item">
                            <div class="habit-checkbox">☐</div>
                            <div class="habit-text">Update trading journal với screenshots</div>
                        </li>
                        <li class="habit-item">
                            <div class="habit-checkbox">☐</div>
                            <div class="habit-text">Note lessons learned & mistakes</div>
                        </li>
                        <li class="habit-item">
                            <div class="habit-checkbox">☐</div>
                            <div class="habit-text">Prepare watchlist for tomorrow</div>
                        </li>
                    </ul>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/FFBD59?text=Pro+Trader+Daily+Routine" alt="Daily Routine">
                    <p class="image-caption">Hình 7.3.2: Daily routine của professional trader</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">📝</div>
                <div class="card-meta">
                    <h3>Trading Journal - Công Cụ #1</h3>
                    <span>Không journal = không cải thiện</span>
                </div>
            </div>
            <div class="card-body">
                <p>Trading journal là công cụ quan trọng nhất để cải thiện. Mỗi trade cần ghi lại:</p>

                <ul class="styled-list gold">
                    <li><strong>Setup:</strong> Pattern gì? Zone score bao nhiêu? MTF alignment?</li>
                    <li><strong>Entry:</strong> Lý do vào lệnh? Có confirmation không?</li>
                    <li><strong>Management:</strong> SL/TP ở đâu? Có di chuyển không?</li>
                    <li><strong>Result:</strong> Win/Loss? R:R actual?</li>
                    <li><strong>Psychology:</strong> Cảm xúc trước/trong/sau trade?</li>
                    <li><strong>Lesson:</strong> Rút ra được gì? Cần cải thiện gì?</li>
                </ul>

                <div class="quote-box">
                    <div class="quote-text">"Journal không phải để ghi kết quả, mà để ghi process. Kết quả sẽ đến khi process đúng."</div>
                    <div class="quote-author">— GEM Method</div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/00F0FF?text=Trading+Journal+Template" alt="Journal Template">
                    <p class="image-caption">Hình 7.3.3: Template trading journal cơ bản</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">🚀</div>
                <div class="card-meta">
                    <h3>Cam Kết Thay Đổi</h3>
                    <span>30-Day Challenge</span>
                </div>
            </div>
            <div class="card-body">
                <p>Để biến kiến thức thành thói quen, cam kết làm những điều sau trong <strong>30 ngày liên tiếp</strong>:</p>

                <ul class="styled-list green">
                    <li><strong>Morning:</strong> 15 phút review charts trước khi trade</li>
                    <li><strong>Trading:</strong> Chỉ trade khi có setup từ GEM Method</li>
                    <li><strong>Journal:</strong> Ghi chép mỗi trade, dù win hay loss</li>
                    <li><strong>Review:</strong> 15 phút cuối ngày review những gì đã làm</li>
                    <li><strong>No Revenge:</strong> Thua 2 trades liên tiếp = nghỉ ngày đó</li>
                </ul>

                <p><strong>Sau 30 ngày:</strong> Những hành động này sẽ trở thành thói quen tự động. Bạn không cần nỗ lực để làm chúng nữa.</p>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/8B5CF6?text=30+Day+Trading+Challenge" alt="30 Day Challenge">
                    <p class="image-caption">Hình 7.3.4: 30-Day Challenge để xây dựng thói quen</p>
                </div>
            </div>
        </article>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Sự thay đổi thực sự: Kiến thức → Hành động → Thói quen → Bản sắc</li>
                <li>3 lĩnh vực cần thay đổi: Mindset, Behavior, Habits</li>
                <li>Daily routine: Morning prep + Evening review</li>
                <li>Trading journal là công cụ quan trọng nhất để cải thiện</li>
                <li>30-Day Challenge để biến hành động thành thói quen</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h3>🎯 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="1">
                <p><strong>Câu 1:</strong> Thứ tự đúng của quá trình thay đổi là gì?</p>
                <button class="quiz-option" data-index="0">Thói quen → Hành động → Kiến thức → Bản sắc</button>
                <button class="quiz-option" data-index="1">Kiến thức → Hành động → Thói quen → Bản sắc</button>
                <button class="quiz-option" data-index="2">Bản sắc → Thói quen → Hành động → Kiến thức</button>
                <button class="quiz-option" data-index="3">Hành động → Kiến thức → Bản sắc → Thói quen</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p><strong>Câu 2:</strong> Trading journal nên ghi lại những gì?</p>
                <button class="quiz-option" data-index="0">Setup, Entry, Management, Result, Psychology, Lesson</button>
                <button class="quiz-option" data-index="1">Chỉ win trades</button>
                <button class="quiz-option" data-index="2">Chỉ số tiền lãi/lỗ</button>
                <button class="quiz-option" data-index="3">Chỉ screenshot chart</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p><strong>Câu 3:</strong> Để xây dựng thói quen mới, cần làm nhất quán trong bao lâu?</p>
                <button class="quiz-option" data-index="0">7 ngày</button>
                <button class="quiz-option" data-index="1">14 ngày</button>
                <button class="quiz-option" data-index="2">30 ngày</button>
                <button class="quiz-option" data-index="3">1 năm</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <div class="footer-logo">GEM Trading Academy</div>
            <p class="footer-text">Module A - Hành Trình Chuyển Hóa • Bài 7.3</p>
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
    <title>Bài 7.3: Sự Thay Đổi Thực Sự - GEM Trading Academy</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: #0a0a0f;
            color: #e4e4e7;
            line-height: 1.6;
            font-size: 16px;
        }

        .container {
            max-width: 680px;
            margin: 0 auto;
            background: #0a0a0f;
        }

        .lesson-header {
            padding: 1rem;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(100, 50, 200, 0.1) 100%);
            border-bottom: 1px solid rgba(139, 92, 246, 0.2);
        }

        .lesson-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 0.25rem;
        }

        .lesson-subtitle {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .content-card {
            background: #18181b;
            margin-bottom: 0.5rem;
        }

        .card-header {
            display: flex;
            align-items: center;
            padding: 1rem;
            gap: 0.75rem;
        }

        .card-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            flex-shrink: 0;
        }

        .card-icon.purple { background: rgba(139, 92, 246, 0.2); }
        .card-icon.gold { background: rgba(255, 189, 89, 0.2); }
        .card-icon.green { background: rgba(16, 185, 129, 0.2); }
        .card-icon.cyan { background: rgba(0, 240, 255, 0.2); }

        .card-meta h3 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: #ffffff;
        }

        .card-meta span {
            font-size: 0.75rem;
            color: #71717a;
        }

        .card-body {
            padding: 0 1rem 1rem 1rem;
        }

        .card-body p {
            color: #d4d4d8;
            margin-bottom: 0.75rem;
        }

        .styled-list {
            list-style: none;
            padding: 0;
            margin: 1rem 0;
        }

        .styled-list li {
            padding: 0.75rem 1rem;
            background: rgba(139, 92, 246, 0.05);
            border-left: 3px solid #8B5CF6;
            margin-bottom: 0.5rem;
            border-radius: 0 0.5rem 0.5rem 0;
        }

        .styled-list.green li {
            background: rgba(16, 185, 129, 0.05);
            border-left-color: #10B981;
        }

        .styled-list.gold li {
            background: rgba(255, 189, 89, 0.05);
            border-left-color: #FFBD59;
        }

        .image-container {
            margin: 1rem 0;
            border-radius: 0.5rem;
            overflow: hidden;
        }

        .image-container img {
            width: 100%;
            height: auto;
            display: block;
        }

        .image-caption {
            font-size: 0.75rem;
            color: #71717a;
            text-align: center;
            padding: 0.5rem;
            background: rgba(0, 0, 0, 0.3);
        }

        /* Change Grid */
        .change-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .change-card {
            background: rgba(16, 185, 129, 0.08);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
        }

        .change-icon {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .change-title {
            font-weight: 600;
            color: #10B981;
            font-size: 0.8125rem;
            margin-bottom: 0.25rem;
        }

        .change-desc {
            font-size: 0.6875rem;
            color: #a1a1aa;
        }

        /* Quote Box */
        .quote-box {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(100, 50, 200, 0.15) 100%);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem 0;
            text-align: center;
        }

        .quote-text {
            font-size: 1.125rem;
            font-style: italic;
            color: #fff;
            margin-bottom: 0.5rem;
        }

        .quote-author {
            font-size: 0.8125rem;
            color: #8B5CF6;
        }

        /* Habit Tracker */
        .habit-box {
            background: rgba(139, 92, 246, 0.08);
            border: 1px solid rgba(139, 92, 246, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            margin: 1rem 0;
        }

        .habit-title {
            font-weight: 600;
            color: #8B5CF6;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .habit-list {
            list-style: none;
            padding: 0;
        }

        .habit-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .habit-item:last-child {
            border-bottom: none;
        }

        .habit-checkbox {
            width: 20px;
            height: 20px;
            border: 2px solid #8B5CF6;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
        }

        .habit-text {
            font-size: 0.875rem;
            color: #d4d4d8;
        }

        .summary-box {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(100, 50, 200, 0.15) 100%);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem;
        }

        .summary-box h3 {
            color: #8B5CF6;
            font-size: 1rem;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-list {
            list-style: none;
            padding: 0;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: #d4d4d8;
        }

        .summary-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #8B5CF6;
            font-weight: bold;
        }

        .quiz-section {
            background: #18181b;
            margin: 0.5rem 0;
            padding: 1.5rem 1rem;
        }

        .quiz-section h3 {
            color: #ffffff;
            font-size: 1.125rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: rgba(139, 92, 246, 0.05);
            border: 1px solid rgba(139, 92, 246, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 500;
            color: #fff;
            margin-bottom: 0.75rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            text-align: left;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            color: #d4d4d8;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .quiz-option:hover {
            background: rgba(139, 92, 246, 0.1);
            border-color: rgba(139, 92, 246, 0.3);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: #10B981;
            color: #10B981;
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: #EF4444;
            color: #EF4444;
        }

        .quiz-result {
            display: none;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-top: 0.75rem;
            font-weight: 500;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: #10B981;
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: #EF4444;
        }

        .quiz-score {
            display: none;
            text-align: center;
            padding: 1rem;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(100, 50, 200, 0.15) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: #8B5CF6;
        }

        .quiz-score .score-label {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .retake-btn {
            background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1rem;
        }

        .lesson-footer {
            padding: 1.5rem 1rem;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #8B5CF6 0%, #00F0FF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .footer-text {
            font-size: 0.75rem;
            color: #71717a;
            margin-top: 0.25rem;
        }

        @media (max-width: 600px) {
            .container {
                padding: 0;
            }

            .content-card {
                border-radius: 0;
                border-left: none;
                border-right: none;
            }

            .change-grid {
                grid-template-columns: 1fr;
            }

            .lesson-title {
                font-size: 1.25rem;
            }
        }

        @media (min-width: 600px) {
            .container {
                padding: 1.5rem;
            }

            .content-card {
                border-radius: 0.75rem;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="lesson-badge">🦋 Module A - Chương 7</span>
            <h1 class="lesson-title">Bài 7.3: Sự Thay Đổi Thực Sự</h1>
            <p class="lesson-subtitle">Từ biết đến làm - Hành động tạo nên khác biệt</p>
        </header>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">🔑</div>
                <div class="card-meta">
                    <h3>Bí Mật Của Sự Thay Đổi</h3>
                    <span>Knowledge vs Action</span>
                </div>
            </div>
            <div class="card-body">
                <p>90% traders biết nên làm gì nhưng không làm. Sự khác biệt giữa thành công và thất bại không nằm ở kiến thức, mà ở <strong>hành động nhất quán</strong>.</p>

                <div class="quote-box">
                    <div class="quote-text">"Biết mà không làm, coi như không biết."</div>
                    <div class="quote-author">— Vương Dương Minh</div>
                </div>

                <p>Sự thay đổi thực sự xảy ra khi:</p>
                <ul class="styled-list green">
                    <li><strong>Kiến thức → Hành động:</strong> Áp dụng những gì đã học vào thực tế</li>
                    <li><strong>Hành động → Thói quen:</strong> Lặp đi lặp lại cho đến khi tự động</li>
                    <li><strong>Thói quen → Bản sắc:</strong> Trở thành một phần của con người bạn</li>
                </ul>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/8B5CF6?text=Knowledge+to+Identity" alt="Change Process">
                    <p class="image-caption">Hình 7.3.1: Hành trình từ Kiến thức đến Bản sắc</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">🎯</div>
                <div class="card-meta">
                    <h3>3 Lĩnh Vực Cần Thay Đổi</h3>
                    <span>Mindset - Behavior - Habits</span>
                </div>
            </div>
            <div class="card-body">
                <div class="change-grid">
                    <div class="change-card">
                        <div class="change-icon">🧠</div>
                        <div class="change-title">MINDSET</div>
                        <div class="change-desc">Tư duy xác suất<br>Chấp nhận loss<br>Patience</div>
                    </div>
                    <div class="change-card">
                        <div class="change-icon">⚡</div>
                        <div class="change-title">BEHAVIOR</div>
                        <div class="change-desc">Tuân thủ plan<br>Không FOMO<br>Cut loss nhanh</div>
                    </div>
                    <div class="change-card">
                        <div class="change-icon">🔄</div>
                        <div class="change-title">HABITS</div>
                        <div class="change-desc">Daily routine<br>Journaling<br>Review trades</div>
                    </div>
                </div>

                <p><strong>Mindset thay đổi trước:</strong></p>
                <ul class="styled-list">
                    <li><strong>"Thua là thất bại"</strong> → "Thua là chi phí kinh doanh, một phần của process"</li>
                    <li><strong>"Cần thắng trade này"</strong> → "Đây chỉ là 1 trong 100 trades"</li>
                    <li><strong>"Market sai"</strong> → "Tôi cần điều chỉnh analysis"</li>
                    <li><strong>"Sao tôi không giàu nhanh"</strong> → "Process over profit, consistency over speed"</li>
                </ul>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">📋</div>
                <div class="card-meta">
                    <h3>Daily Habits Của Pro Trader</h3>
                    <span>Routine tạo nên nhất quán</span>
                </div>
            </div>
            <div class="card-body">
                <div class="habit-box">
                    <div class="habit-title">☀️ Morning Routine</div>
                    <ul class="habit-list">
                        <li class="habit-item">
                            <div class="habit-checkbox">☐</div>
                            <div class="habit-text">Check economic calendar cho ngày hôm nay</div>
                        </li>
                        <li class="habit-item">
                            <div class="habit-checkbox">☐</div>
                            <div class="habit-text">Review overnight price action trên HTF</div>
                        </li>
                        <li class="habit-item">
                            <div class="habit-checkbox">☐</div>
                            <div class="habit-text">Mark key zones và potential setups</div>
                        </li>
                        <li class="habit-item">
                            <div class="habit-checkbox">☐</div>
                            <div class="habit-text">Set alerts cho entry zones</div>
                        </li>
                    </ul>
                </div>

                <div class="habit-box">
                    <div class="habit-title">🌙 Evening Routine</div>
                    <ul class="habit-list">
                        <li class="habit-item">
                            <div class="habit-checkbox">☐</div>
                            <div class="habit-text">Review all trades taken today</div>
                        </li>
                        <li class="habit-item">
                            <div class="habit-checkbox">☐</div>
                            <div class="habit-text">Update trading journal với screenshots</div>
                        </li>
                        <li class="habit-item">
                            <div class="habit-checkbox">☐</div>
                            <div class="habit-text">Note lessons learned & mistakes</div>
                        </li>
                        <li class="habit-item">
                            <div class="habit-checkbox">☐</div>
                            <div class="habit-text">Prepare watchlist for tomorrow</div>
                        </li>
                    </ul>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/FFBD59?text=Pro+Trader+Daily+Routine" alt="Daily Routine">
                    <p class="image-caption">Hình 7.3.2: Daily routine của professional trader</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">📝</div>
                <div class="card-meta">
                    <h3>Trading Journal - Công Cụ #1</h3>
                    <span>Không journal = không cải thiện</span>
                </div>
            </div>
            <div class="card-body">
                <p>Trading journal là công cụ quan trọng nhất để cải thiện. Mỗi trade cần ghi lại:</p>

                <ul class="styled-list gold">
                    <li><strong>Setup:</strong> Pattern gì? Zone score bao nhiêu? MTF alignment?</li>
                    <li><strong>Entry:</strong> Lý do vào lệnh? Có confirmation không?</li>
                    <li><strong>Management:</strong> SL/TP ở đâu? Có di chuyển không?</li>
                    <li><strong>Result:</strong> Win/Loss? R:R actual?</li>
                    <li><strong>Psychology:</strong> Cảm xúc trước/trong/sau trade?</li>
                    <li><strong>Lesson:</strong> Rút ra được gì? Cần cải thiện gì?</li>
                </ul>

                <div class="quote-box">
                    <div class="quote-text">"Journal không phải để ghi kết quả, mà để ghi process. Kết quả sẽ đến khi process đúng."</div>
                    <div class="quote-author">— GEM Method</div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/00F0FF?text=Trading+Journal+Template" alt="Journal Template">
                    <p class="image-caption">Hình 7.3.3: Template trading journal cơ bản</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">🚀</div>
                <div class="card-meta">
                    <h3>Cam Kết Thay Đổi</h3>
                    <span>30-Day Challenge</span>
                </div>
            </div>
            <div class="card-body">
                <p>Để biến kiến thức thành thói quen, cam kết làm những điều sau trong <strong>30 ngày liên tiếp</strong>:</p>

                <ul class="styled-list green">
                    <li><strong>Morning:</strong> 15 phút review charts trước khi trade</li>
                    <li><strong>Trading:</strong> Chỉ trade khi có setup từ GEM Method</li>
                    <li><strong>Journal:</strong> Ghi chép mỗi trade, dù win hay loss</li>
                    <li><strong>Review:</strong> 15 phút cuối ngày review những gì đã làm</li>
                    <li><strong>No Revenge:</strong> Thua 2 trades liên tiếp = nghỉ ngày đó</li>
                </ul>

                <p><strong>Sau 30 ngày:</strong> Những hành động này sẽ trở thành thói quen tự động. Bạn không cần nỗ lực để làm chúng nữa.</p>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/8B5CF6?text=30+Day+Trading+Challenge" alt="30 Day Challenge">
                    <p class="image-caption">Hình 7.3.4: 30-Day Challenge để xây dựng thói quen</p>
                </div>
            </div>
        </article>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul class="summary-list">
                <li>Sự thay đổi thực sự: Kiến thức → Hành động → Thói quen → Bản sắc</li>
                <li>3 lĩnh vực cần thay đổi: Mindset, Behavior, Habits</li>
                <li>Daily routine: Morning prep + Evening review</li>
                <li>Trading journal là công cụ quan trọng nhất để cải thiện</li>
                <li>30-Day Challenge để biến hành động thành thói quen</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h3>🎯 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="1">
                <p><strong>Câu 1:</strong> Thứ tự đúng của quá trình thay đổi là gì?</p>
                <button class="quiz-option" data-index="0">Thói quen → Hành động → Kiến thức → Bản sắc</button>
                <button class="quiz-option" data-index="1">Kiến thức → Hành động → Thói quen → Bản sắc</button>
                <button class="quiz-option" data-index="2">Bản sắc → Thói quen → Hành động → Kiến thức</button>
                <button class="quiz-option" data-index="3">Hành động → Kiến thức → Bản sắc → Thói quen</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p><strong>Câu 2:</strong> Trading journal nên ghi lại những gì?</p>
                <button class="quiz-option" data-index="0">Setup, Entry, Management, Result, Psychology, Lesson</button>
                <button class="quiz-option" data-index="1">Chỉ win trades</button>
                <button class="quiz-option" data-index="2">Chỉ số tiền lãi/lỗ</button>
                <button class="quiz-option" data-index="3">Chỉ screenshot chart</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p><strong>Câu 3:</strong> Để xây dựng thói quen mới, cần làm nhất quán trong bao lâu?</p>
                <button class="quiz-option" data-index="0">7 ngày</button>
                <button class="quiz-option" data-index="1">14 ngày</button>
                <button class="quiz-option" data-index="2">30 ngày</button>
                <button class="quiz-option" data-index="3">1 năm</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <div class="footer-logo">GEM Trading Academy</div>
            <p class="footer-text">Module A - Hành Trình Chuyển Hóa • Bài 7.3</p>
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

-- Lesson 7.4: Điều Khiến Bạn Khác Biệt - GEM Trading Academy
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-2-ch7-l4',
  'module-tier-2-ch7',
  'course-tier2-trading-advanced',
  'Bài 7.4: Điều Khiến Bạn Khác Biệt - GEM Trading Academy',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 7.4: Điều Khiến Bạn Khác Biệt - GEM Trading Academy</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: #0a0a0f;
            color: #e4e4e7;
            line-height: 1.6;
            font-size: 16px;
        }

        .container {
            max-width: 680px;
            margin: 0 auto;
            background: #0a0a0f;
        }

        .lesson-header {
            padding: 1rem;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(255, 189, 89, 0.1) 100%);
            border-bottom: 1px solid rgba(139, 92, 246, 0.2);
        }

        .lesson-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8B5CF6 0%, #FFBD59 100%);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 0.25rem;
        }

        .lesson-subtitle {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .content-card {
            background: #18181b;
            margin-bottom: 0.5rem;
        }

        .card-header {
            display: flex;
            align-items: center;
            padding: 1rem;
            gap: 0.75rem;
        }

        .card-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            flex-shrink: 0;
        }

        .card-icon.purple { background: rgba(139, 92, 246, 0.2); }
        .card-icon.gold { background: rgba(255, 189, 89, 0.2); }
        .card-icon.green { background: rgba(16, 185, 129, 0.2); }
        .card-icon.cyan { background: rgba(0, 240, 255, 0.2); }

        .card-meta h3 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: #ffffff;
        }

        .card-meta span {
            font-size: 0.75rem;
            color: #71717a;
        }

        .card-body {
            padding: 0 1rem 1rem 1rem;
        }

        .card-body p {
            color: #d4d4d8;
            margin-bottom: 0.75rem;
        }

        .styled-list {
            list-style: none;
            padding: 0;
            margin: 1rem 0;
        }

        .styled-list li {
            padding: 0.75rem 1rem;
            background: rgba(139, 92, 246, 0.05);
            border-left: 3px solid #8B5CF6;
            margin-bottom: 0.5rem;
            border-radius: 0 0.5rem 0.5rem 0;
        }

        .styled-list.gold li {
            background: rgba(255, 189, 89, 0.05);
            border-left-color: #FFBD59;
        }

        .styled-list.green li {
            background: rgba(16, 185, 129, 0.05);
            border-left-color: #10B981;
        }

        .image-container {
            margin: 1rem 0;
            border-radius: 0.5rem;
            overflow: hidden;
        }

        .image-container img {
            width: 100%;
            height: auto;
            display: block;
        }

        .image-caption {
            font-size: 0.75rem;
            color: #71717a;
            text-align: center;
            padding: 0.5rem;
            background: rgba(0, 0, 0, 0.3);
        }

        /* Edge Cards */
        .edge-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .edge-card {
            background: rgba(255, 189, 89, 0.08);
            border: 1px solid rgba(255, 189, 89, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
        }

        .edge-number {
            font-size: 2rem;
            font-weight: 700;
            color: #FFBD59;
            margin-bottom: 0.25rem;
        }

        .edge-label {
            font-size: 0.75rem;
            color: #a1a1aa;
        }

        /* Quote Box */
        .quote-box {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(100, 50, 200, 0.15) 100%);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem 0;
            text-align: center;
        }

        .quote-text {
            font-size: 1.125rem;
            font-style: italic;
            color: #fff;
            margin-bottom: 0.5rem;
        }

        .quote-author {
            font-size: 0.8125rem;
            color: #8B5CF6;
        }

        /* Advantage List */
        .advantage-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .advantage-card {
            background: rgba(16, 185, 129, 0.08);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            display: flex;
            gap: 0.75rem;
            align-items: flex-start;
        }

        .advantage-icon {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(16, 185, 129, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            flex-shrink: 0;
        }

        .advantage-content h4 {
            font-weight: 600;
            color: #10B981;
            margin-bottom: 0.25rem;
            font-size: 0.9375rem;
        }

        .advantage-content p {
            font-size: 0.8125rem;
            color: #a1a1aa;
            margin: 0;
        }

        /* CTA Box */
        .cta-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
            border: 2px solid rgba(255, 189, 89, 0.3);
            border-radius: 0.75rem;
            padding: 1.5rem;
            margin: 1rem 0;
            text-align: center;
        }

        .cta-box h4 {
            color: #FFBD59;
            font-size: 1.125rem;
            margin-bottom: 0.5rem;
        }

        .cta-box p {
            color: #a1a1aa;
            margin-bottom: 0;
        }

        .summary-box {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(255, 189, 89, 0.15) 100%);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem;
        }

        .summary-box h3 {
            color: #8B5CF6;
            font-size: 1rem;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-list {
            list-style: none;
            padding: 0;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: #d4d4d8;
        }

        .summary-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #FFBD59;
            font-weight: bold;
        }

        .quiz-section {
            background: #18181b;
            margin: 0.5rem 0;
            padding: 1.5rem 1rem;
        }

        .quiz-section h3 {
            color: #ffffff;
            font-size: 1.125rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: rgba(139, 92, 246, 0.05);
            border: 1px solid rgba(139, 92, 246, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 500;
            color: #fff;
            margin-bottom: 0.75rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            text-align: left;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            color: #d4d4d8;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .quiz-option:hover {
            background: rgba(139, 92, 246, 0.1);
            border-color: rgba(139, 92, 246, 0.3);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: #10B981;
            color: #10B981;
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: #EF4444;
            color: #EF4444;
        }

        .quiz-result {
            display: none;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-top: 0.75rem;
            font-weight: 500;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: #10B981;
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: #EF4444;
        }

        .quiz-score {
            display: none;
            text-align: center;
            padding: 1rem;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(255, 189, 89, 0.15) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: #FFBD59;
        }

        .quiz-score .score-label {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .retake-btn {
            background: linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%);
            color: #000;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1rem;
        }

        .lesson-footer {
            padding: 1.5rem 1rem;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #8B5CF6 0%, #FFBD59 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .footer-text {
            font-size: 0.75rem;
            color: #71717a;
            margin-top: 0.25rem;
        }

        @media (max-width: 600px) {
            .container {
                padding: 0;
            }

            .content-card {
                border-radius: 0;
                border-left: none;
                border-right: none;
            }

            .edge-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .lesson-title {
                font-size: 1.25rem;
            }
        }

        @media (min-width: 600px) {
            .container {
                padding: 1.5rem;
            }

            .content-card {
                border-radius: 0.75rem;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .edge-grid {
                grid-template-columns: repeat(4, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="lesson-badge">⭐ Module A - Chương 7</span>
            <h1 class="lesson-title">Bài 7.4: Điều Khiến Bạn Khác Biệt</h1>
            <p class="lesson-subtitle">Your Edge - Lợi thế cạnh tranh của trader GEM Method</p>
        </header>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">🏆</div>
                <div class="card-meta">
                    <h3>Lợi Thế Của Bạn</h3>
                    <span>Your Competitive Edge</span>
                </div>
            </div>
            <div class="card-body">
                <p>Hoàn thành TIER 2, bạn đã có những lợi thế mà <strong>95% traders</strong> không có. Đây là những edge thực sự trong thị trường.</p>

                <div class="edge-grid">
                    <div class="edge-card">
                        <div class="edge-number">24</div>
                        <div class="edge-label">Patterns<br>đã master</div>
                    </div>
                    <div class="edge-card">
                        <div class="edge-number">3</div>
                        <div class="edge-label">Timeframes<br>phân tích</div>
                    </div>
                    <div class="edge-card">
                        <div class="edge-number">10</div>
                        <div class="edge-label">Zone scoring<br>criteria</div>
                    </div>
                    <div class="edge-card">
                        <div class="edge-number">1:2+</div>
                        <div class="edge-label">Average<br>R:R ratio</div>
                    </div>
                </div>

                <div class="quote-box">
                    <div class="quote-text">"Edge không phải là biết nhiều hơn, mà là làm đúng những gì đã biết."</div>
                    <div class="quote-author">— GEM Method</div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/FFBD59?text=Your+Trading+Edge" alt="Your Edge">
                    <p class="image-caption">Hình 7.4.1: Lợi thế cạnh tranh của GEM Trader</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">✅</div>
                <div class="card-meta">
                    <h3>5 Lợi Thế Cụ Thể</h3>
                    <span>So với 95% retail traders</span>
                </div>
            </div>
            <div class="card-body">
                <div class="advantage-grid">
                    <div class="advantage-card">
                        <div class="advantage-icon">📊</div>
                        <div class="advantage-content">
                            <h4>Systematic Method</h4>
                            <p>Có phương pháp rõ ràng thay vì trade random. Mỗi trade có lý do cụ thể dựa trên pattern và zone.</p>
                        </div>
                    </div>

                    <div class="advantage-card">
                        <div class="advantage-icon">🎯</div>
                        <div class="advantage-content">
                            <h4>High-Quality Zones</h4>
                            <p>Chỉ trade tại các zone được chấm điểm cao, không phải random S/R như đa số traders.</p>
                        </div>
                    </div>

                    <div class="advantage-card">
                        <div class="advantage-icon">📈</div>
                        <div class="advantage-content">
                            <h4>Multi-Timeframe Confluence</h4>
                            <p>Phân tích từ HTF xuống LTF, entry tại điểm có nhiều yếu tố hội tụ.</p>
                        </div>
                    </div>

                    <div class="advantage-card">
                        <div class="advantage-icon">💰</div>
                        <div class="advantage-content">
                            <h4>Professional Risk Management</h4>
                            <p>Position sizing đúng công thức, SL có logic, R:R tối thiểu 1:2.</p>
                        </div>
                    </div>

                    <div class="advantage-card">
                        <div class="advantage-icon">🧠</div>
                        <div class="advantage-content">
                            <h4>Trading Psychology</h4>
                            <p>Hiểu về mindset, có framework để xử lý cảm xúc và duy trì kỷ luật.</p>
                        </div>
                    </div>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">📊</div>
                <div class="card-meta">
                    <h3>Thống Kê Thực Tế</h3>
                    <span>Tại sao đa số traders thất bại</span>
                </div>
            </div>
            <div class="card-body">
                <p>Nghiên cứu cho thấy <strong>90-95% retail traders</strong> thua lỗ. Nguyên nhân chính:</p>

                <ul class="styled-list">
                    <li><strong>70%:</strong> Không có trading plan rõ ràng</li>
                    <li><strong>65%:</strong> Risk quá nhiều mỗi trade (>5%)</li>
                    <li><strong>60%:</strong> Không có stop loss hoặc di chuyển SL</li>
                    <li><strong>55%:</strong> Overtrade do FOMO/revenge</li>
                    <li><strong>50%:</strong> Không review và học từ mistakes</li>
                </ul>

                <p><strong>Bạn đã khác:</strong></p>
                <ul class="styled-list green">
                    <li>✓ Có systematic trading plan (GEM Method)</li>
                    <li>✓ Risk management với 1-2% rule</li>
                    <li>✓ SL logic dựa trên zone + buffer</li>
                    <li>✓ Entry rules rõ ràng, không FOMO</li>
                    <li>✓ Journaling và review habits</li>
                </ul>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/10B981?text=Why+Traders+Fail+Statistics" alt="Statistics">
                    <p class="image-caption">Hình 7.4.2: Nguyên nhân thất bại và cách bạn đã vượt qua</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">🚀</div>
                <div class="card-meta">
                    <h3>Maximize Your Edge</h3>
                    <span>Tối đa hóa lợi thế</span>
                </div>
            </div>
            <div class="card-body">
                <p>Để biến edge thành profit thực sự:</p>

                <ul class="styled-list gold">
                    <li><strong>Stick to the method:</strong> Không deviate khỏi GEM Method, không mix với indicators/methods khác</li>
                    <li><strong>Trade your edge:</strong> Chỉ trade khi setup đúng 100%, không trade "gần đúng"</li>
                    <li><strong>Let profits run:</strong> Sử dụng Multi-TP strategy, trailing stop</li>
                    <li><strong>Cut losses quick:</strong> SL hit = accept và move on, không hesitate</li>
                    <li><strong>Journal everything:</strong> Data là king - track để optimize</li>
                </ul>

                <div class="cta-box">
                    <h4>🎯 Remember This</h4>
                    <p>Edge không nằm ở việc đúng 100% trades. Edge nằm ở việc khi đúng bạn earn nhiều hơn khi sai bạn lose. Với win rate 50% và R:R 1:2, bạn đã có positive expectancy.</p>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/00F0FF?text=Maximize+Your+Edge" alt="Maximize Edge">
                    <p class="image-caption">Hình 7.4.3: Framework tối đa hóa lợi thế trading</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">🌟</div>
                <div class="card-meta">
                    <h3>Module A Complete!</h3>
                    <span>Hành trình chuyển hóa hoàn tất</span>
                </div>
            </div>
            <div class="card-body">
                <p>Chúc mừng! Bạn đã hoàn thành <strong>Module A - Hành Trình Chuyển Hóa</strong>. Những điều bạn đã học:</p>

                <ul class="styled-list green">
                    <li>Con Người Cũ vs Con Người Mới - Sự chuyển hóa cần thiết</li>
                    <li>Bản Đồ Hành Trình - Biết mình đang ở đâu và cần đi đâu</li>
                    <li>Sự Thay Đổi Thực Sự - Từ kiến thức đến hành động và thói quen</li>
                    <li>Điều Khiến Bạn Khác Biệt - Edge thực sự của bạn</li>
                </ul>

                <p>Tiếp theo: <strong>Module B - Cơ Hội & Lựa Chọn</strong> sẽ mở ra những cơ hội phát triển sự nghiệp trading của bạn.</p>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/8B5CF6?text=Module+A+Complete" alt="Module A Complete">
                    <p class="image-caption">Hình 7.4.4: Module A Complete - Ready for Module B</p>
                </div>
            </div>
        </article>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Module A</h3>
            <ul class="summary-list">
                <li>Bạn có 5 lợi thế chính: Method, Zones, MTF, Risk Mgt, Psychology</li>
                <li>90-95% traders thua vì không có những điều bạn đã học</li>
                <li>Edge = Win khi đúng > Lose khi sai (không phải đúng 100%)</li>
                <li>Maximize edge: Stick to method, trade your edge, journal everything</li>
                <li>Với WR 50% + R:R 1:2 = Positive expectancy đã có</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h3>🎯 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="2">
                <p><strong>Câu 1:</strong> Lợi thế (Edge) trong trading nghĩa là gì?</p>
                <button class="quiz-option" data-index="0">Đúng 100% mọi trade</button>
                <button class="quiz-option" data-index="1">Biết trước thị trường sẽ đi đâu</button>
                <button class="quiz-option" data-index="2">Khi đúng earn nhiều hơn khi sai lose</button>
                <button class="quiz-option" data-index="3">Có nhiều tiền hơn người khác</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p><strong>Câu 2:</strong> Để maximize edge, điều quan trọng nhất là gì?</p>
                <button class="quiz-option" data-index="0">Stick to method, không deviate</button>
                <button class="quiz-option" data-index="1">Trade nhiều hơn</button>
                <button class="quiz-option" data-index="2">Tăng size mỗi khi thắng</button>
                <button class="quiz-option" data-index="3">Mix nhiều methods khác nhau</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p><strong>Câu 3:</strong> Với win rate 50% và R:R 1:2, kỳ vọng của bạn là gì?</p>
                <button class="quiz-option" data-index="0">Thua trong dài hạn</button>
                <button class="quiz-option" data-index="1">Positive expectancy - có lợi nhuận</button>
                <button class="quiz-option" data-index="2">Breakeven</button>
                <button class="quiz-option" data-index="3">Không xác định được</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <div class="footer-logo">GEM Trading Academy</div>
            <p class="footer-text">Module A Complete - Hành Trình Chuyển Hóa</p>
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
    <title>Bài 7.4: Điều Khiến Bạn Khác Biệt - GEM Trading Academy</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: #0a0a0f;
            color: #e4e4e7;
            line-height: 1.6;
            font-size: 16px;
        }

        .container {
            max-width: 680px;
            margin: 0 auto;
            background: #0a0a0f;
        }

        .lesson-header {
            padding: 1rem;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(255, 189, 89, 0.1) 100%);
            border-bottom: 1px solid rgba(139, 92, 246, 0.2);
        }

        .lesson-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8B5CF6 0%, #FFBD59 100%);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
        }

        .lesson-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 0.25rem;
        }

        .lesson-subtitle {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .content-card {
            background: #18181b;
            margin-bottom: 0.5rem;
        }

        .card-header {
            display: flex;
            align-items: center;
            padding: 1rem;
            gap: 0.75rem;
        }

        .card-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            flex-shrink: 0;
        }

        .card-icon.purple { background: rgba(139, 92, 246, 0.2); }
        .card-icon.gold { background: rgba(255, 189, 89, 0.2); }
        .card-icon.green { background: rgba(16, 185, 129, 0.2); }
        .card-icon.cyan { background: rgba(0, 240, 255, 0.2); }

        .card-meta h3 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: #ffffff;
        }

        .card-meta span {
            font-size: 0.75rem;
            color: #71717a;
        }

        .card-body {
            padding: 0 1rem 1rem 1rem;
        }

        .card-body p {
            color: #d4d4d8;
            margin-bottom: 0.75rem;
        }

        .styled-list {
            list-style: none;
            padding: 0;
            margin: 1rem 0;
        }

        .styled-list li {
            padding: 0.75rem 1rem;
            background: rgba(139, 92, 246, 0.05);
            border-left: 3px solid #8B5CF6;
            margin-bottom: 0.5rem;
            border-radius: 0 0.5rem 0.5rem 0;
        }

        .styled-list.gold li {
            background: rgba(255, 189, 89, 0.05);
            border-left-color: #FFBD59;
        }

        .styled-list.green li {
            background: rgba(16, 185, 129, 0.05);
            border-left-color: #10B981;
        }

        .image-container {
            margin: 1rem 0;
            border-radius: 0.5rem;
            overflow: hidden;
        }

        .image-container img {
            width: 100%;
            height: auto;
            display: block;
        }

        .image-caption {
            font-size: 0.75rem;
            color: #71717a;
            text-align: center;
            padding: 0.5rem;
            background: rgba(0, 0, 0, 0.3);
        }

        /* Edge Cards */
        .edge-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .edge-card {
            background: rgba(255, 189, 89, 0.08);
            border: 1px solid rgba(255, 189, 89, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
        }

        .edge-number {
            font-size: 2rem;
            font-weight: 700;
            color: #FFBD59;
            margin-bottom: 0.25rem;
        }

        .edge-label {
            font-size: 0.75rem;
            color: #a1a1aa;
        }

        /* Quote Box */
        .quote-box {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(100, 50, 200, 0.15) 100%);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem 0;
            text-align: center;
        }

        .quote-text {
            font-size: 1.125rem;
            font-style: italic;
            color: #fff;
            margin-bottom: 0.5rem;
        }

        .quote-author {
            font-size: 0.8125rem;
            color: #8B5CF6;
        }

        /* Advantage List */
        .advantage-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.75rem;
            margin: 1rem 0;
        }

        .advantage-card {
            background: rgba(16, 185, 129, 0.08);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            display: flex;
            gap: 0.75rem;
            align-items: flex-start;
        }

        .advantage-icon {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(16, 185, 129, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            flex-shrink: 0;
        }

        .advantage-content h4 {
            font-weight: 600;
            color: #10B981;
            margin-bottom: 0.25rem;
            font-size: 0.9375rem;
        }

        .advantage-content p {
            font-size: 0.8125rem;
            color: #a1a1aa;
            margin: 0;
        }

        /* CTA Box */
        .cta-box {
            background: linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
            border: 2px solid rgba(255, 189, 89, 0.3);
            border-radius: 0.75rem;
            padding: 1.5rem;
            margin: 1rem 0;
            text-align: center;
        }

        .cta-box h4 {
            color: #FFBD59;
            font-size: 1.125rem;
            margin-bottom: 0.5rem;
        }

        .cta-box p {
            color: #a1a1aa;
            margin-bottom: 0;
        }

        .summary-box {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(255, 189, 89, 0.15) 100%);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin: 1rem;
        }

        .summary-box h3 {
            color: #8B5CF6;
            font-size: 1rem;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .summary-list {
            list-style: none;
            padding: 0;
        }

        .summary-list li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: #d4d4d8;
        }

        .summary-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #FFBD59;
            font-weight: bold;
        }

        .quiz-section {
            background: #18181b;
            margin: 0.5rem 0;
            padding: 1.5rem 1rem;
        }

        .quiz-section h3 {
            color: #ffffff;
            font-size: 1.125rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quiz-question {
            background: rgba(139, 92, 246, 0.05);
            border: 1px solid rgba(139, 92, 246, 0.2);
            border-radius: 0.75rem;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .quiz-question p {
            font-weight: 500;
            color: #fff;
            margin-bottom: 0.75rem;
        }

        .quiz-option {
            display: block;
            width: 100%;
            text-align: left;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            color: #d4d4d8;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .quiz-option:hover {
            background: rgba(139, 92, 246, 0.1);
            border-color: rgba(139, 92, 246, 0.3);
        }

        .quiz-option.correct {
            background: rgba(16, 185, 129, 0.2);
            border-color: #10B981;
            color: #10B981;
        }

        .quiz-option.incorrect {
            background: rgba(239, 68, 68, 0.2);
            border-color: #EF4444;
            color: #EF4444;
        }

        .quiz-result {
            display: none;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-top: 0.75rem;
            font-weight: 500;
        }

        .quiz-result.show {
            display: block;
        }

        .quiz-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: #10B981;
        }

        .quiz-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: #EF4444;
        }

        .quiz-score {
            display: none;
            text-align: center;
            padding: 1rem;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(255, 189, 89, 0.15) 100%);
            border-radius: 0.75rem;
            margin-top: 1rem;
        }

        .quiz-score.show {
            display: block;
        }

        .quiz-score .score-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: #FFBD59;
        }

        .quiz-score .score-label {
            font-size: 0.875rem;
            color: #a1a1aa;
        }

        .retake-btn {
            background: linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%);
            color: #000;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1rem;
        }

        .lesson-footer {
            padding: 1.5rem 1rem;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #8B5CF6 0%, #FFBD59 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .footer-text {
            font-size: 0.75rem;
            color: #71717a;
            margin-top: 0.25rem;
        }

        @media (max-width: 600px) {
            .container {
                padding: 0;
            }

            .content-card {
                border-radius: 0;
                border-left: none;
                border-right: none;
            }

            .edge-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .lesson-title {
                font-size: 1.25rem;
            }
        }

        @media (min-width: 600px) {
            .container {
                padding: 1.5rem;
            }

            .content-card {
                border-radius: 0.75rem;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .edge-grid {
                grid-template-columns: repeat(4, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="lesson-badge">⭐ Module A - Chương 7</span>
            <h1 class="lesson-title">Bài 7.4: Điều Khiến Bạn Khác Biệt</h1>
            <p class="lesson-subtitle">Your Edge - Lợi thế cạnh tranh của trader GEM Method</p>
        </header>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">🏆</div>
                <div class="card-meta">
                    <h3>Lợi Thế Của Bạn</h3>
                    <span>Your Competitive Edge</span>
                </div>
            </div>
            <div class="card-body">
                <p>Hoàn thành TIER 2, bạn đã có những lợi thế mà <strong>95% traders</strong> không có. Đây là những edge thực sự trong thị trường.</p>

                <div class="edge-grid">
                    <div class="edge-card">
                        <div class="edge-number">24</div>
                        <div class="edge-label">Patterns<br>đã master</div>
                    </div>
                    <div class="edge-card">
                        <div class="edge-number">3</div>
                        <div class="edge-label">Timeframes<br>phân tích</div>
                    </div>
                    <div class="edge-card">
                        <div class="edge-number">10</div>
                        <div class="edge-label">Zone scoring<br>criteria</div>
                    </div>
                    <div class="edge-card">
                        <div class="edge-number">1:2+</div>
                        <div class="edge-label">Average<br>R:R ratio</div>
                    </div>
                </div>

                <div class="quote-box">
                    <div class="quote-text">"Edge không phải là biết nhiều hơn, mà là làm đúng những gì đã biết."</div>
                    <div class="quote-author">— GEM Method</div>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/FFBD59?text=Your+Trading+Edge" alt="Your Edge">
                    <p class="image-caption">Hình 7.4.1: Lợi thế cạnh tranh của GEM Trader</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon green">✅</div>
                <div class="card-meta">
                    <h3>5 Lợi Thế Cụ Thể</h3>
                    <span>So với 95% retail traders</span>
                </div>
            </div>
            <div class="card-body">
                <div class="advantage-grid">
                    <div class="advantage-card">
                        <div class="advantage-icon">📊</div>
                        <div class="advantage-content">
                            <h4>Systematic Method</h4>
                            <p>Có phương pháp rõ ràng thay vì trade random. Mỗi trade có lý do cụ thể dựa trên pattern và zone.</p>
                        </div>
                    </div>

                    <div class="advantage-card">
                        <div class="advantage-icon">🎯</div>
                        <div class="advantage-content">
                            <h4>High-Quality Zones</h4>
                            <p>Chỉ trade tại các zone được chấm điểm cao, không phải random S/R như đa số traders.</p>
                        </div>
                    </div>

                    <div class="advantage-card">
                        <div class="advantage-icon">📈</div>
                        <div class="advantage-content">
                            <h4>Multi-Timeframe Confluence</h4>
                            <p>Phân tích từ HTF xuống LTF, entry tại điểm có nhiều yếu tố hội tụ.</p>
                        </div>
                    </div>

                    <div class="advantage-card">
                        <div class="advantage-icon">💰</div>
                        <div class="advantage-content">
                            <h4>Professional Risk Management</h4>
                            <p>Position sizing đúng công thức, SL có logic, R:R tối thiểu 1:2.</p>
                        </div>
                    </div>

                    <div class="advantage-card">
                        <div class="advantage-icon">🧠</div>
                        <div class="advantage-content">
                            <h4>Trading Psychology</h4>
                            <p>Hiểu về mindset, có framework để xử lý cảm xúc và duy trì kỷ luật.</p>
                        </div>
                    </div>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon purple">📊</div>
                <div class="card-meta">
                    <h3>Thống Kê Thực Tế</h3>
                    <span>Tại sao đa số traders thất bại</span>
                </div>
            </div>
            <div class="card-body">
                <p>Nghiên cứu cho thấy <strong>90-95% retail traders</strong> thua lỗ. Nguyên nhân chính:</p>

                <ul class="styled-list">
                    <li><strong>70%:</strong> Không có trading plan rõ ràng</li>
                    <li><strong>65%:</strong> Risk quá nhiều mỗi trade (>5%)</li>
                    <li><strong>60%:</strong> Không có stop loss hoặc di chuyển SL</li>
                    <li><strong>55%:</strong> Overtrade do FOMO/revenge</li>
                    <li><strong>50%:</strong> Không review và học từ mistakes</li>
                </ul>

                <p><strong>Bạn đã khác:</strong></p>
                <ul class="styled-list green">
                    <li>✓ Có systematic trading plan (GEM Method)</li>
                    <li>✓ Risk management với 1-2% rule</li>
                    <li>✓ SL logic dựa trên zone + buffer</li>
                    <li>✓ Entry rules rõ ràng, không FOMO</li>
                    <li>✓ Journaling và review habits</li>
                </ul>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/10B981?text=Why+Traders+Fail+Statistics" alt="Statistics">
                    <p class="image-caption">Hình 7.4.2: Nguyên nhân thất bại và cách bạn đã vượt qua</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon cyan">🚀</div>
                <div class="card-meta">
                    <h3>Maximize Your Edge</h3>
                    <span>Tối đa hóa lợi thế</span>
                </div>
            </div>
            <div class="card-body">
                <p>Để biến edge thành profit thực sự:</p>

                <ul class="styled-list gold">
                    <li><strong>Stick to the method:</strong> Không deviate khỏi GEM Method, không mix với indicators/methods khác</li>
                    <li><strong>Trade your edge:</strong> Chỉ trade khi setup đúng 100%, không trade "gần đúng"</li>
                    <li><strong>Let profits run:</strong> Sử dụng Multi-TP strategy, trailing stop</li>
                    <li><strong>Cut losses quick:</strong> SL hit = accept và move on, không hesitate</li>
                    <li><strong>Journal everything:</strong> Data là king - track để optimize</li>
                </ul>

                <div class="cta-box">
                    <h4>🎯 Remember This</h4>
                    <p>Edge không nằm ở việc đúng 100% trades. Edge nằm ở việc khi đúng bạn earn nhiều hơn khi sai bạn lose. Với win rate 50% và R:R 1:2, bạn đã có positive expectancy.</p>
                </div>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x350/112250/00F0FF?text=Maximize+Your+Edge" alt="Maximize Edge">
                    <p class="image-caption">Hình 7.4.3: Framework tối đa hóa lợi thế trading</p>
                </div>
            </div>
        </article>

        <article class="content-card">
            <div class="card-header">
                <div class="card-icon gold">🌟</div>
                <div class="card-meta">
                    <h3>Module A Complete!</h3>
                    <span>Hành trình chuyển hóa hoàn tất</span>
                </div>
            </div>
            <div class="card-body">
                <p>Chúc mừng! Bạn đã hoàn thành <strong>Module A - Hành Trình Chuyển Hóa</strong>. Những điều bạn đã học:</p>

                <ul class="styled-list green">
                    <li>Con Người Cũ vs Con Người Mới - Sự chuyển hóa cần thiết</li>
                    <li>Bản Đồ Hành Trình - Biết mình đang ở đâu và cần đi đâu</li>
                    <li>Sự Thay Đổi Thực Sự - Từ kiến thức đến hành động và thói quen</li>
                    <li>Điều Khiến Bạn Khác Biệt - Edge thực sự của bạn</li>
                </ul>

                <p>Tiếp theo: <strong>Module B - Cơ Hội & Lựa Chọn</strong> sẽ mở ra những cơ hội phát triển sự nghiệp trading của bạn.</p>

                <div class="image-container">
                    <img src="https://via.placeholder.com/680x300/112250/8B5CF6?text=Module+A+Complete" alt="Module A Complete">
                    <p class="image-caption">Hình 7.4.4: Module A Complete - Ready for Module B</p>
                </div>
            </div>
        </article>

        <div class="summary-box">
            <h3>📝 Tóm Tắt Module A</h3>
            <ul class="summary-list">
                <li>Bạn có 5 lợi thế chính: Method, Zones, MTF, Risk Mgt, Psychology</li>
                <li>90-95% traders thua vì không có những điều bạn đã học</li>
                <li>Edge = Win khi đúng > Lose khi sai (không phải đúng 100%)</li>
                <li>Maximize edge: Stick to method, trade your edge, journal everything</li>
                <li>Với WR 50% + R:R 1:2 = Positive expectancy đã có</li>
            </ul>
        </div>

        <section class="quiz-section">
            <h3>🎯 Kiểm Tra Kiến Thức</h3>

            <div class="quiz-question" data-correct="2">
                <p><strong>Câu 1:</strong> Lợi thế (Edge) trong trading nghĩa là gì?</p>
                <button class="quiz-option" data-index="0">Đúng 100% mọi trade</button>
                <button class="quiz-option" data-index="1">Biết trước thị trường sẽ đi đâu</button>
                <button class="quiz-option" data-index="2">Khi đúng earn nhiều hơn khi sai lose</button>
                <button class="quiz-option" data-index="3">Có nhiều tiền hơn người khác</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p><strong>Câu 2:</strong> Để maximize edge, điều quan trọng nhất là gì?</p>
                <button class="quiz-option" data-index="0">Stick to method, không deviate</button>
                <button class="quiz-option" data-index="1">Trade nhiều hơn</button>
                <button class="quiz-option" data-index="2">Tăng size mỗi khi thắng</button>
                <button class="quiz-option" data-index="3">Mix nhiều methods khác nhau</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p><strong>Câu 3:</strong> Với win rate 50% và R:R 1:2, kỳ vọng của bạn là gì?</p>
                <button class="quiz-option" data-index="0">Thua trong dài hạn</button>
                <button class="quiz-option" data-index="1">Positive expectancy - có lợi nhuận</button>
                <button class="quiz-option" data-index="2">Breakeven</button>
                <button class="quiz-option" data-index="3">Không xác định được</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <div class="score-text"><span id="correct-count">0</span>/3</div>
                <div class="score-label">Câu trả lời đúng</div>
                <button class="retake-btn" onclick="location.reload()">Làm lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <div class="footer-logo">GEM Trading Academy</div>
            <p class="footer-text">Module A Complete - Hành Trình Chuyển Hóa</p>
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

-- ✅ Done: 4 lessons
