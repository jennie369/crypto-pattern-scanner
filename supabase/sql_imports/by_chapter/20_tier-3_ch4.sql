-- =====================================================
-- TIER-3 - Chương 4: Whale Tracking
-- Course: course-tier3-trading-mastery
-- File 20/23
-- =====================================================

-- Create/Update Module
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  'module-tier-3-ch4',
  'course-tier3-trading-mastery',
  'Chương 4: Whale Tracking',
  'Theo dõi cá voi',
  4,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Lesson 4.1: Whale Là Ai?
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch4-l1',
  'module-tier-3-ch4',
  'course-tier3-trading-mastery',
  'Bài 4.1: Whale Là Ai?',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 4.1: Whale Là Ai? | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #6366F1; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #6366F1; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #6366F1, #8B5CF6); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1)); border: 1px solid rgba(99,102,241,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255,189,89,0.15), rgba(245,158,11,0.1)); border-color: rgba(255,189,89,0.4); }
        .highlight-box.cyan { background: linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,240,255,0.1)); border-color: rgba(0,240,255,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #6366F1; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .whale-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #6366F1; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .whale-card h4 { color: #6366F1; font-size: 1.1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .whale-type-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin: 1rem 0; }
        .whale-type { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; border-top: 3px solid #6366F1; }
        .whale-type h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.5rem; }
        .whale-type .size { color: #FFBD59; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem; }
        .whale-type p { font-size: 0.9rem; margin-bottom: 0; }
        .stat-row { display: flex; justify-content: space-around; flex-wrap: wrap; gap: 1rem; margin: 1rem 0; }
        .stat-item { text-align: center; padding: 1rem; background: #1a1a2e; border-radius: 8px; flex: 1; min-width: 140px; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: #6366F1; }
        .stat-label { font-size: 0.8rem; color: #a1a1aa; margin-top: 0.25rem; }
        .reason-list { background: #0a0a0f; border-radius: 8px; padding: 1.25rem; margin: 1rem 0; }
        .reason-item { display: flex; gap: 1rem; margin-bottom: 1rem; align-items: flex-start; }
        .reason-item:last-child { margin-bottom: 0; }
        .reason-number { background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.85rem; flex-shrink: 0; }
        .reason-content h4 { color: #ffffff; font-size: 0.95rem; margin-bottom: 0.25rem; }
        .reason-content p { margin-bottom: 0; font-size: 0.9rem; }
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
        .quiz-option:hover { border-color: #6366F1; background: rgba(99,102,241,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .whale-type-grid { grid-template-columns: 1fr; }
            .stat-row { flex-direction: column; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">Whale Là Ai?</h1>
            <p class="lesson-subtitle">Hiểu Về Những Người Chơi Lớn Trong Crypto</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🐋</div>
            <h2 class="section-title">Định Nghĩa Whale</h2>
            <p>Trong crypto, "Whale" (cá voi) là thuật ngữ chỉ những <strong style="color: #6366F1;">người hoặc tổ chức nắm giữ lượng lớn cryptocurrency</strong>. Họ có khả năng ảnh hưởng đáng kể đến giá thị trường thông qua các giao dịch của mình.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🐋 Quy Ước Phổ Biến:</strong> Whale là ví nắm giữ ≥ 1,000 BTC hoặc tương đương (khoảng $40-50 triệu USD)</p>
            </div>

            <div class="stat-row">
                <div class="stat-item">
                    <div class="stat-value">~2,000</div>
                    <div class="stat-label">Ví Whale BTC</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">40%</div>
                    <div class="stat-label">Supply Nắm Giữ</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">$1B+</div>
                    <div class="stat-label">Giao Dịch/Ngày</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/6366F1?text=Whale+Distribution+Chart" alt="Phân Bố Whale">
                <p class="image-caption">Biểu đồ phân bố ví Whale trong thị trường crypto</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">👥</div>
            <h2 class="section-title">Các Loại Whale</h2>
            <p>Không phải tất cả whale đều giống nhau. Hiểu các loại whale giúp bạn dự đoán hành vi của họ:</p>

            <div class="whale-type-grid">
                <div class="whale-type">
                    <h4>🏛️ Tổ Chức (Institutions)</h4>
                    <div class="size">$100M - $10B+</div>
                    <p>Quỹ đầu tư, công ty như MicroStrategy, Tesla. Giao dịch có kế hoạch, ít tác động ngắn hạn.</p>
                </div>

                <div class="whale-type" style="border-top-color: #FFBD59;">
                    <h4>💼 Quỹ Hedge (Hedge Funds)</h4>
                    <div class="size">$50M - $500M</div>
                    <p>Giao dịch tích cực, có thể long/short. Ảnh hưởng lớn đến biến động ngắn hạn.</p>
                </div>

                <div class="whale-type" style="border-top-color: #10B981;">
                    <h4>👤 Early Adopters</h4>
                    <div class="size">$10M - $1B</div>
                    <p>Những người mua BTC sớm (2009-2013). Thường HODL dài hạn, ít trade.</p>
                </div>

                <div class="whale-type" style="border-top-color: #00F0FF;">
                    <h4>🏦 Sàn Giao Dịch</h4>
                    <div class="size">$1B - $50B</div>
                    <p>Ví cold storage của Binance, Coinbase. Di chuyển để rebalance, không phải trade.</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=Whale+Types+Infographic" alt="Các Loại Whale">
                <p class="image-caption">Infographic các loại Whale và đặc điểm của họ</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🎯</div>
            <h2 class="section-title">Tại Sao Theo Dõi Whale?</h2>
            <p>Whale tracking là kỹ năng quan trọng của Elite Trader. Đây là lý do:</p>

            <div class="reason-list">
                <div class="reason-item">
                    <div class="reason-number">1</div>
                    <div class="reason-content">
                        <h4>Họ Có Thông Tin Tốt Hơn</h4>
                        <p>Institutions có team phân tích, insider connections, và resources mà retail không có.</p>
                    </div>
                </div>

                <div class="reason-item">
                    <div class="reason-number">2</div>
                    <div class="reason-content">
                        <h4>Họ Di Chuyển Thị Trường</h4>
                        <p>Một lệnh $50M có thể đẩy giá 2-5%. Biết trước = cơ hội lớn.</p>
                    </div>
                </div>

                <div class="reason-item">
                    <div class="reason-number">3</div>
                    <div class="reason-content">
                        <h4>Họ Không Thể Ẩn</h4>
                        <p>Blockchain là công khai. Mọi giao dịch đều visible - chỉ cần biết cách tìm.</p>
                    </div>
                </div>

                <div class="reason-item">
                    <div class="reason-number">4</div>
                    <div class="reason-content">
                        <h4>Họ Có Pattern</h4>
                        <p>Tích lũy trước khi pump, phân phối trước khi dump. Pattern lặp lại.</p>
                    </div>
                </div>
            </div>

            <div class="highlight-box gold">
                <p style="margin-bottom: 0;"><strong>💡 Pro Tip:</strong> "Trade with whales, not against them." - Đi cùng chiều với whale, không chống lại họ.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🔍</div>
            <h2 class="section-title">Whale Không Thể Ẩn</h2>
            <p>Điểm mạnh lớn nhất của crypto: <strong style="color: #00F0FF;">blockchain là công khai</strong>. Mọi giao dịch đều được ghi lại và ai cũng có thể xem.</p>

            <div class="whale-card">
                <h4>📊 Những Gì Có Thể Theo Dõi:</h4>
                <ul style="margin-bottom: 0;">
                    <li><strong>Wallet addresses:</strong> Theo dõi ví whale đã biết</li>
                    <li><strong>Large transactions:</strong> Giao dịch > $1M</li>
                    <li><strong>Exchange inflows/outflows:</strong> Tiền vào/ra sàn</li>
                    <li><strong>Accumulation patterns:</strong> Mua dần nhiều ngày</li>
                    <li><strong>Distribution patterns:</strong> Bán dần ra</li>
                </ul>
            </div>

            <p>Các công cụ phổ biến để theo dõi whale:</p>
            <ul>
                <li><strong>Whale Alert:</strong> Twitter bot báo giao dịch lớn</li>
                <li><strong>Glassnode:</strong> On-chain analytics cao cấp</li>
                <li><strong>Santiment:</strong> Social + on-chain data</li>
                <li><strong>Etherscan/Blockchain.com:</strong> Xem trực tiếp blockchain</li>
            </ul>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/00F0FF?text=Whale+Tracking+Tools+Dashboard" alt="Công Cụ Theo Dõi Whale">
                <p class="image-caption">Dashboard các công cụ theo dõi whale phổ biến</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⚠️</div>
            <h2 class="section-title">Cảnh Báo: Không Phải Mọi Whale Move Đều Có Ý Nghĩa</h2>
            <p>Trước khi hành động theo whale, hãy hiểu context:</p>

            <ul>
                <li><strong>Exchange rebalancing:</strong> Sàn di chuyển tiền giữa ví hot/cold - không phải trade signal</li>
                <li><strong>OTC trades:</strong> Giao dịch ngoài sàn, không ảnh hưởng giá ngay</li>
                <li><strong>HODL wallets:</strong> Early adopters di chuyển tiền để bảo mật, không phải bán</li>
                <li><strong>Smart contract interactions:</strong> DeFi, staking - không phải dump</li>
            </ul>

            <div class="highlight-box cyan">
                <p style="margin-bottom: 0;"><strong>🛡️ Quy Tắc:</strong> Whale move + GEM pattern confirmation = High probability trade. Whale move alone = Cần xác minh thêm.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/EF4444?text=False+Whale+Signals+Warning" alt="Cảnh Báo Tín Hiệu Sai">
                <p class="image-caption">Các tình huống whale move KHÔNG phải trading signal</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>Whale</strong> là ví nắm ≥ 1,000 BTC hoặc tương đương $40-50M</li>
                <li><strong>4 loại chính:</strong> Institutions, Hedge Funds, Early Adopters, Exchanges</li>
                <li><strong>Theo dõi whale</strong> vì họ có thông tin tốt và di chuyển thị trường</li>
                <li><strong>Blockchain công khai</strong> - whale không thể ẩn giao dịch</li>
                <li><strong>Luôn xác minh context</strong> - không phải mọi whale move đều có ý nghĩa</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">1. Theo quy ước phổ biến, whale BTC là ví nắm giữ bao nhiêu?</p>
                <button class="quiz-option" data-index="0">≥ 100 BTC</button>
                <button class="quiz-option" data-index="1">≥ 500 BTC</button>
                <button class="quiz-option" data-index="2">≥ 1,000 BTC</button>
                <button class="quiz-option" data-index="3">≥ 10,000 BTC</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">2. Tại sao whale KHÔNG THỂ ẩn giao dịch của họ?</p>
                <button class="quiz-option" data-index="0">Vì sàn giao dịch báo cáo</button>
                <button class="quiz-option" data-index="1">Vì blockchain là công khai</button>
                <button class="quiz-option" data-index="2">Vì chính phủ theo dõi</button>
                <button class="quiz-option" data-index="3">Vì họ phải đăng ký với SEC</button>
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
                        res.textContent = ''✗ Chưa đúng. Hãy xem lại nội dung bài học.'';
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
    <title>Bài 4.1: Whale Là Ai? | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #6366F1; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #6366F1; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #6366F1, #8B5CF6); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1)); border: 1px solid rgba(99,102,241,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255,189,89,0.15), rgba(245,158,11,0.1)); border-color: rgba(255,189,89,0.4); }
        .highlight-box.cyan { background: linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,240,255,0.1)); border-color: rgba(0,240,255,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #6366F1; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .whale-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #6366F1; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .whale-card h4 { color: #6366F1; font-size: 1.1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .whale-type-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin: 1rem 0; }
        .whale-type { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; border-top: 3px solid #6366F1; }
        .whale-type h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.5rem; }
        .whale-type .size { color: #FFBD59; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem; }
        .whale-type p { font-size: 0.9rem; margin-bottom: 0; }
        .stat-row { display: flex; justify-content: space-around; flex-wrap: wrap; gap: 1rem; margin: 1rem 0; }
        .stat-item { text-align: center; padding: 1rem; background: #1a1a2e; border-radius: 8px; flex: 1; min-width: 140px; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: #6366F1; }
        .stat-label { font-size: 0.8rem; color: #a1a1aa; margin-top: 0.25rem; }
        .reason-list { background: #0a0a0f; border-radius: 8px; padding: 1.25rem; margin: 1rem 0; }
        .reason-item { display: flex; gap: 1rem; margin-bottom: 1rem; align-items: flex-start; }
        .reason-item:last-child { margin-bottom: 0; }
        .reason-number { background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.85rem; flex-shrink: 0; }
        .reason-content h4 { color: #ffffff; font-size: 0.95rem; margin-bottom: 0.25rem; }
        .reason-content p { margin-bottom: 0; font-size: 0.9rem; }
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
        .quiz-option:hover { border-color: #6366F1; background: rgba(99,102,241,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .whale-type-grid { grid-template-columns: 1fr; }
            .stat-row { flex-direction: column; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">Whale Là Ai?</h1>
            <p class="lesson-subtitle">Hiểu Về Những Người Chơi Lớn Trong Crypto</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🐋</div>
            <h2 class="section-title">Định Nghĩa Whale</h2>
            <p>Trong crypto, "Whale" (cá voi) là thuật ngữ chỉ những <strong style="color: #6366F1;">người hoặc tổ chức nắm giữ lượng lớn cryptocurrency</strong>. Họ có khả năng ảnh hưởng đáng kể đến giá thị trường thông qua các giao dịch của mình.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🐋 Quy Ước Phổ Biến:</strong> Whale là ví nắm giữ ≥ 1,000 BTC hoặc tương đương (khoảng $40-50 triệu USD)</p>
            </div>

            <div class="stat-row">
                <div class="stat-item">
                    <div class="stat-value">~2,000</div>
                    <div class="stat-label">Ví Whale BTC</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">40%</div>
                    <div class="stat-label">Supply Nắm Giữ</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">$1B+</div>
                    <div class="stat-label">Giao Dịch/Ngày</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/6366F1?text=Whale+Distribution+Chart" alt="Phân Bố Whale">
                <p class="image-caption">Biểu đồ phân bố ví Whale trong thị trường crypto</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">👥</div>
            <h2 class="section-title">Các Loại Whale</h2>
            <p>Không phải tất cả whale đều giống nhau. Hiểu các loại whale giúp bạn dự đoán hành vi của họ:</p>

            <div class="whale-type-grid">
                <div class="whale-type">
                    <h4>🏛️ Tổ Chức (Institutions)</h4>
                    <div class="size">$100M - $10B+</div>
                    <p>Quỹ đầu tư, công ty như MicroStrategy, Tesla. Giao dịch có kế hoạch, ít tác động ngắn hạn.</p>
                </div>

                <div class="whale-type" style="border-top-color: #FFBD59;">
                    <h4>💼 Quỹ Hedge (Hedge Funds)</h4>
                    <div class="size">$50M - $500M</div>
                    <p>Giao dịch tích cực, có thể long/short. Ảnh hưởng lớn đến biến động ngắn hạn.</p>
                </div>

                <div class="whale-type" style="border-top-color: #10B981;">
                    <h4>👤 Early Adopters</h4>
                    <div class="size">$10M - $1B</div>
                    <p>Những người mua BTC sớm (2009-2013). Thường HODL dài hạn, ít trade.</p>
                </div>

                <div class="whale-type" style="border-top-color: #00F0FF;">
                    <h4>🏦 Sàn Giao Dịch</h4>
                    <div class="size">$1B - $50B</div>
                    <p>Ví cold storage của Binance, Coinbase. Di chuyển để rebalance, không phải trade.</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=Whale+Types+Infographic" alt="Các Loại Whale">
                <p class="image-caption">Infographic các loại Whale và đặc điểm của họ</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🎯</div>
            <h2 class="section-title">Tại Sao Theo Dõi Whale?</h2>
            <p>Whale tracking là kỹ năng quan trọng của Elite Trader. Đây là lý do:</p>

            <div class="reason-list">
                <div class="reason-item">
                    <div class="reason-number">1</div>
                    <div class="reason-content">
                        <h4>Họ Có Thông Tin Tốt Hơn</h4>
                        <p>Institutions có team phân tích, insider connections, và resources mà retail không có.</p>
                    </div>
                </div>

                <div class="reason-item">
                    <div class="reason-number">2</div>
                    <div class="reason-content">
                        <h4>Họ Di Chuyển Thị Trường</h4>
                        <p>Một lệnh $50M có thể đẩy giá 2-5%. Biết trước = cơ hội lớn.</p>
                    </div>
                </div>

                <div class="reason-item">
                    <div class="reason-number">3</div>
                    <div class="reason-content">
                        <h4>Họ Không Thể Ẩn</h4>
                        <p>Blockchain là công khai. Mọi giao dịch đều visible - chỉ cần biết cách tìm.</p>
                    </div>
                </div>

                <div class="reason-item">
                    <div class="reason-number">4</div>
                    <div class="reason-content">
                        <h4>Họ Có Pattern</h4>
                        <p>Tích lũy trước khi pump, phân phối trước khi dump. Pattern lặp lại.</p>
                    </div>
                </div>
            </div>

            <div class="highlight-box gold">
                <p style="margin-bottom: 0;"><strong>💡 Pro Tip:</strong> "Trade with whales, not against them." - Đi cùng chiều với whale, không chống lại họ.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🔍</div>
            <h2 class="section-title">Whale Không Thể Ẩn</h2>
            <p>Điểm mạnh lớn nhất của crypto: <strong style="color: #00F0FF;">blockchain là công khai</strong>. Mọi giao dịch đều được ghi lại và ai cũng có thể xem.</p>

            <div class="whale-card">
                <h4>📊 Những Gì Có Thể Theo Dõi:</h4>
                <ul style="margin-bottom: 0;">
                    <li><strong>Wallet addresses:</strong> Theo dõi ví whale đã biết</li>
                    <li><strong>Large transactions:</strong> Giao dịch > $1M</li>
                    <li><strong>Exchange inflows/outflows:</strong> Tiền vào/ra sàn</li>
                    <li><strong>Accumulation patterns:</strong> Mua dần nhiều ngày</li>
                    <li><strong>Distribution patterns:</strong> Bán dần ra</li>
                </ul>
            </div>

            <p>Các công cụ phổ biến để theo dõi whale:</p>
            <ul>
                <li><strong>Whale Alert:</strong> Twitter bot báo giao dịch lớn</li>
                <li><strong>Glassnode:</strong> On-chain analytics cao cấp</li>
                <li><strong>Santiment:</strong> Social + on-chain data</li>
                <li><strong>Etherscan/Blockchain.com:</strong> Xem trực tiếp blockchain</li>
            </ul>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/00F0FF?text=Whale+Tracking+Tools+Dashboard" alt="Công Cụ Theo Dõi Whale">
                <p class="image-caption">Dashboard các công cụ theo dõi whale phổ biến</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⚠️</div>
            <h2 class="section-title">Cảnh Báo: Không Phải Mọi Whale Move Đều Có Ý Nghĩa</h2>
            <p>Trước khi hành động theo whale, hãy hiểu context:</p>

            <ul>
                <li><strong>Exchange rebalancing:</strong> Sàn di chuyển tiền giữa ví hot/cold - không phải trade signal</li>
                <li><strong>OTC trades:</strong> Giao dịch ngoài sàn, không ảnh hưởng giá ngay</li>
                <li><strong>HODL wallets:</strong> Early adopters di chuyển tiền để bảo mật, không phải bán</li>
                <li><strong>Smart contract interactions:</strong> DeFi, staking - không phải dump</li>
            </ul>

            <div class="highlight-box cyan">
                <p style="margin-bottom: 0;"><strong>🛡️ Quy Tắc:</strong> Whale move + GEM pattern confirmation = High probability trade. Whale move alone = Cần xác minh thêm.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/EF4444?text=False+Whale+Signals+Warning" alt="Cảnh Báo Tín Hiệu Sai">
                <p class="image-caption">Các tình huống whale move KHÔNG phải trading signal</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>Whale</strong> là ví nắm ≥ 1,000 BTC hoặc tương đương $40-50M</li>
                <li><strong>4 loại chính:</strong> Institutions, Hedge Funds, Early Adopters, Exchanges</li>
                <li><strong>Theo dõi whale</strong> vì họ có thông tin tốt và di chuyển thị trường</li>
                <li><strong>Blockchain công khai</strong> - whale không thể ẩn giao dịch</li>
                <li><strong>Luôn xác minh context</strong> - không phải mọi whale move đều có ý nghĩa</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">1. Theo quy ước phổ biến, whale BTC là ví nắm giữ bao nhiêu?</p>
                <button class="quiz-option" data-index="0">≥ 100 BTC</button>
                <button class="quiz-option" data-index="1">≥ 500 BTC</button>
                <button class="quiz-option" data-index="2">≥ 1,000 BTC</button>
                <button class="quiz-option" data-index="3">≥ 10,000 BTC</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">2. Tại sao whale KHÔNG THỂ ẩn giao dịch của họ?</p>
                <button class="quiz-option" data-index="0">Vì sàn giao dịch báo cáo</button>
                <button class="quiz-option" data-index="1">Vì blockchain là công khai</button>
                <button class="quiz-option" data-index="2">Vì chính phủ theo dõi</button>
                <button class="quiz-option" data-index="3">Vì họ phải đăng ký với SEC</button>
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
                        res.textContent = ''✗ Chưa đúng. Hãy xem lại nội dung bài học.'';
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

-- Lesson 4.2: Phát Hiện Lệnh Lớn
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch4-l2',
  'module-tier-3-ch4',
  'course-tier3-trading-mastery',
  'Bài 4.2: Phát Hiện Lệnh Lớn',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 4.2: Phát Hiện Lệnh Lớn | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #6366F1; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #6366F1; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #6366F1, #8B5CF6); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1)); border: 1px solid rgba(99,102,241,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255,189,89,0.15), rgba(245,158,11,0.1)); border-color: rgba(255,189,89,0.4); }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.1)); border-color: rgba(16,185,129,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #6366F1; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .signal-type-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin: 1rem 0; }
        .signal-type { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; border-left: 4px solid #6366F1; }
        .signal-type h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .signal-type p { font-size: 0.9rem; margin-bottom: 0; }
        .alert-example { background: #0a0a0f; border: 1px solid #3f3f46; border-radius: 8px; padding: 1rem; margin: 1rem 0; font-family: monospace; font-size: 0.9rem; }
        .alert-example .whale-icon { font-size: 1.25rem; }
        .alert-example .amount { color: #FFBD59; font-weight: 600; }
        .alert-example .coin { color: #6366F1; font-weight: 600; }
        .alert-example .direction { color: #10B981; }
        .interpretation-box { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #6366F1; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; }
        .interpretation-box h4 { color: #6366F1; font-size: 1.1rem; margin-bottom: 0.75rem; }
        .volume-bar { background: #1a1a2e; border-radius: 8px; padding: 1rem; margin: 0.5rem 0; }
        .volume-bar-label { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem; }
        .volume-bar-fill { height: 8px; border-radius: 4px; background: linear-gradient(90deg, #6366F1, #8B5CF6); }
        .volume-bar.high .volume-bar-fill { background: linear-gradient(90deg, #10B981, #059669); width: 90%; }
        .volume-bar.normal .volume-bar-fill { background: linear-gradient(90deg, #6366F1, #8B5CF6); width: 50%; }
        .volume-bar.low .volume-bar-fill { background: linear-gradient(90deg, #EF4444, #DC2626); width: 20%; }
        .checklist { background: #0a0a0f; border-radius: 8px; padding: 1.25rem; margin: 1rem 0; }
        .checklist-item { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; align-items: flex-start; }
        .checklist-item:last-child { margin-bottom: 0; }
        .checklist-icon { color: #10B981; font-size: 1.1rem; flex-shrink: 0; }
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
        .quiz-option:hover { border-color: #6366F1; background: rgba(99,102,241,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .signal-type-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">Phát Hiện Lệnh Lớn</h1>
            <p class="lesson-subtitle">Kỹ Thuật Nhận Biết Giao Dịch Whale</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🔍</div>
            <h2 class="section-title">Dấu Hiệu Của Lệnh Lớn</h2>
            <p>Khi whale di chuyển, họ để lại "dấu vết" trên blockchain và thị trường. Biết cách phát hiện những dấu hiệu này là kỹ năng quan trọng của Elite Trader.</p>

            <div class="signal-type-grid">
                <div class="signal-type">
                    <h4>🐋 Large Transfers</h4>
                    <p>Chuyển > $1M giữa ví hoặc từ/đến sàn</p>
                </div>

                <div class="signal-type" style="border-left-color: #FFBD59;">
                    <h4>📊 Volume Spikes</h4>
                    <p>Volume đột biến 300%+ so với trung bình</p>
                </div>

                <div class="signal-type" style="border-left-color: #10B981;">
                    <h4>📈 Block Trades</h4>
                    <p>Lệnh lớn thực hiện ngoài order book thông thường</p>
                </div>

                <div class="signal-type" style="border-left-color: #00F0FF;">
                    <h4>🏦 Exchange Flows</h4>
                    <p>Dòng tiền lớn vào/ra các sàn giao dịch</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/6366F1?text=Large+Order+Detection+Signals" alt="Dấu Hiệu Lệnh Lớn">
                <p class="image-caption">Các dấu hiệu phát hiện lệnh lớn trên thị trường</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🚨</div>
            <h2 class="section-title">Whale Alert: Đọc Và Hiểu</h2>
            <p>Whale Alert là dịch vụ theo dõi giao dịch lớn trên blockchain. Đây là cách đọc một alert điển hình:</p>

            <div class="alert-example">
                <span class="whale-icon">🐋</span>
                <span class="amount">5,000 BTC</span>
                (<span class="coin">$200,000,000</span>) transferred from
                <span class="direction">unknown wallet to Binance</span>
            </div>

            <div class="interpretation-box">
                <h4>📖 Cách Giải Mã Alert Trên:</h4>
                <ul style="margin-bottom: 0;">
                    <li><strong>5,000 BTC ($200M):</strong> Đây là lệnh RẤT LỚN</li>
                    <li><strong>Unknown wallet → Binance:</strong> Di chuyển VÀO sàn = có thể sắp BÁN</li>
                    <li><strong>Timing:</strong> Nếu thấy nhiều alert tương tự = distribution phase</li>
                </ul>
            </div>

            <div class="highlight-box gold">
                <p><strong>💡 Quy Tắc Giải Mã:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li><strong>VÀO sàn:</strong> Whale có thể sắp bán (Bearish signal)</li>
                    <li><strong>RA khỏi sàn:</strong> Whale rút về ví lạnh = HODL (Bullish signal)</li>
                    <li><strong>Wallet → Wallet:</strong> Có thể OTC trade, cần xác minh thêm</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=Whale+Alert+Interpretation+Guide" alt="Hướng Dẫn Đọc Whale Alert">
                <p class="image-caption">Hướng dẫn giải mã các loại Whale Alert</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Volume Bất Thường</h2>
            <p>Volume spike là dấu hiệu quan trọng của hoạt động whale. So sánh với volume trung bình 20 ngày:</p>

            <div class="volume-bar high">
                <div class="volume-bar-label">
                    <span>🟢 High Alert: >300% Average</span>
                    <span style="color: #10B981;">Whale Activity Likely</span>
                </div>
                <div class="volume-bar-fill"></div>
            </div>

            <div class="volume-bar normal">
                <div class="volume-bar-label">
                    <span>🟡 Normal: 80-150% Average</span>
                    <span style="color: #6366F1;">Standard Trading</span>
                </div>
                <div class="volume-bar-fill"></div>
            </div>

            <div class="volume-bar low">
                <div class="volume-bar-label">
                    <span>🔴 Low: <50% Average</span>
                    <span style="color: #EF4444;">Quiet Period</span>
                </div>
                <div class="volume-bar-fill"></div>
            </div>

            <p>Khi thấy volume spike >300%, hãy kiểm tra:</p>
            <ul>
                <li>Có tin tức lớn không? (Nếu không → whale activity)</li>
                <li>Giá đang ở đâu? (Zone support/resistance?)</li>
                <li>Timeframe nào? (Volume spike trên 4H/1D quan trọng hơn 5m)</li>
            </ul>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Volume+Spike+Analysis+Chart" alt="Phân Tích Volume Spike">
                <p class="image-caption">Chart với volume spike và phân tích whale activity</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🎯</div>
            <h2 class="section-title">Block Trades</h2>
            <p>Block trades là giao dịch lớn được thực hiện ngoài order book thông thường, thường qua OTC desk hoặc dark pools.</p>

            <div class="highlight-box">
                <p><strong>📊 Đặc Điểm Block Trade:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li>Size: Thường >$10M một lệnh</li>
                    <li>Execution: Không hiện trên order book công khai</li>
                    <li>Price: Thường ở mức premium/discount nhỏ so với spot</li>
                    <li>Detection: Qua on-chain data sau khi settlement</li>
                </ul>
            </div>

            <p><strong>Tại sao whale dùng block trades?</strong></p>
            <ul>
                <li><strong>Tránh slippage:</strong> Lệnh $50M trên spot sẽ di chuyển giá nhiều</li>
                <li><strong>Privacy:</strong> Không muốn market biết họ đang mua/bán</li>
                <li><strong>Better price:</strong> OTC desks có thể match với counterparty</li>
            </ul>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/8B5CF6?text=Block+Trade+vs+Spot+Comparison" alt="Block Trade vs Spot">
                <p class="image-caption">So sánh Block Trade và giao dịch spot thông thường</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">✅</div>
            <h2 class="section-title">Checklist Phát Hiện Whale</h2>
            <p>Sử dụng checklist này khi phân tích market:</p>

            <div class="checklist">
                <div class="checklist-item">
                    <span class="checklist-icon">✓</span>
                    <span>Kiểm tra Whale Alert (Twitter/Telegram) mỗi 4 giờ</span>
                </div>
                <div class="checklist-item">
                    <span class="checklist-icon">✓</span>
                    <span>So sánh volume hiện tại với MA20 volume</span>
                </div>
                <div class="checklist-item">
                    <span class="checklist-icon">✓</span>
                    <span>Check exchange inflow/outflow trên Glassnode hoặc CryptoQuant</span>
                </div>
                <div class="checklist-item">
                    <span class="checklist-icon">✓</span>
                    <span>Xác minh context: có tin tức giải thích không?</span>
                </div>
                <div class="checklist-item">
                    <span class="checklist-icon">✓</span>
                    <span>Kết hợp với GEM pattern: có zone confluence không?</span>
                </div>
            </div>

            <div class="highlight-box green">
                <p style="margin-bottom: 0;"><strong>🎯 Pro Tip:</strong> Set alert cho Whale Alert bot. Khi nhận được alert lớn (>$50M), ngay lập tức check chart xem có GEM pattern confluence không.</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>4 dấu hiệu whale:</strong> Large transfers, Volume spikes, Block trades, Exchange flows</li>
                <li><strong>Whale Alert:</strong> Vào sàn = bearish, Ra sàn = bullish</li>
                <li><strong>Volume spike >300%</strong> là dấu hiệu mạnh của whale activity</li>
                <li><strong>Block trades</strong> là giao dịch OTC, detection qua on-chain</li>
                <li><strong>Luôn kết hợp</strong> whale signals với GEM patterns</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">1. Khi thấy Whale Alert "5,000 BTC transferred from unknown wallet to Binance", đây là tín hiệu gì?</p>
                <button class="quiz-option" data-index="0">Bearish - whale có thể sắp bán</button>
                <button class="quiz-option" data-index="1">Bullish - whale đang tích lũy</button>
                <button class="quiz-option" data-index="2">Neutral - không có ý nghĩa</button>
                <button class="quiz-option" data-index="3">Bullish - whale rút về cold wallet</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Volume spike bao nhiêu % so với MA20 được coi là "High Alert" cho whale activity?</p>
                <button class="quiz-option" data-index="0">>100%</button>
                <button class="quiz-option" data-index="1">>200%</button>
                <button class="quiz-option" data-index="2">>300%</button>
                <button class="quiz-option" data-index="3">>500%</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">3. Tại sao whale thường dùng block trades thay vì spot market?</p>
                <button class="quiz-option" data-index="0">Vì phí giao dịch thấp hơn</button>
                <button class="quiz-option" data-index="1">Để tránh slippage và giữ privacy</button>
                <button class="quiz-option" data-index="2">Vì tốc độ thực hiện nhanh hơn</button>
                <button class="quiz-option" data-index="3">Vì sàn yêu cầu</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="quiz-score-text">Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite</p>
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
                        res.textContent = ''✗ Chưa đúng. Hãy xem lại nội dung bài học.'';
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
    <title>Bài 4.2: Phát Hiện Lệnh Lớn | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #6366F1; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #6366F1; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #6366F1, #8B5CF6); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1)); border: 1px solid rgba(99,102,241,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255,189,89,0.15), rgba(245,158,11,0.1)); border-color: rgba(255,189,89,0.4); }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.1)); border-color: rgba(16,185,129,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #6366F1; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .signal-type-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin: 1rem 0; }
        .signal-type { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; border-left: 4px solid #6366F1; }
        .signal-type h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .signal-type p { font-size: 0.9rem; margin-bottom: 0; }
        .alert-example { background: #0a0a0f; border: 1px solid #3f3f46; border-radius: 8px; padding: 1rem; margin: 1rem 0; font-family: monospace; font-size: 0.9rem; }
        .alert-example .whale-icon { font-size: 1.25rem; }
        .alert-example .amount { color: #FFBD59; font-weight: 600; }
        .alert-example .coin { color: #6366F1; font-weight: 600; }
        .alert-example .direction { color: #10B981; }
        .interpretation-box { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #6366F1; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; }
        .interpretation-box h4 { color: #6366F1; font-size: 1.1rem; margin-bottom: 0.75rem; }
        .volume-bar { background: #1a1a2e; border-radius: 8px; padding: 1rem; margin: 0.5rem 0; }
        .volume-bar-label { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem; }
        .volume-bar-fill { height: 8px; border-radius: 4px; background: linear-gradient(90deg, #6366F1, #8B5CF6); }
        .volume-bar.high .volume-bar-fill { background: linear-gradient(90deg, #10B981, #059669); width: 90%; }
        .volume-bar.normal .volume-bar-fill { background: linear-gradient(90deg, #6366F1, #8B5CF6); width: 50%; }
        .volume-bar.low .volume-bar-fill { background: linear-gradient(90deg, #EF4444, #DC2626); width: 20%; }
        .checklist { background: #0a0a0f; border-radius: 8px; padding: 1.25rem; margin: 1rem 0; }
        .checklist-item { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; align-items: flex-start; }
        .checklist-item:last-child { margin-bottom: 0; }
        .checklist-icon { color: #10B981; font-size: 1.1rem; flex-shrink: 0; }
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
        .quiz-option:hover { border-color: #6366F1; background: rgba(99,102,241,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .signal-type-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">Phát Hiện Lệnh Lớn</h1>
            <p class="lesson-subtitle">Kỹ Thuật Nhận Biết Giao Dịch Whale</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🔍</div>
            <h2 class="section-title">Dấu Hiệu Của Lệnh Lớn</h2>
            <p>Khi whale di chuyển, họ để lại "dấu vết" trên blockchain và thị trường. Biết cách phát hiện những dấu hiệu này là kỹ năng quan trọng của Elite Trader.</p>

            <div class="signal-type-grid">
                <div class="signal-type">
                    <h4>🐋 Large Transfers</h4>
                    <p>Chuyển > $1M giữa ví hoặc từ/đến sàn</p>
                </div>

                <div class="signal-type" style="border-left-color: #FFBD59;">
                    <h4>📊 Volume Spikes</h4>
                    <p>Volume đột biến 300%+ so với trung bình</p>
                </div>

                <div class="signal-type" style="border-left-color: #10B981;">
                    <h4>📈 Block Trades</h4>
                    <p>Lệnh lớn thực hiện ngoài order book thông thường</p>
                </div>

                <div class="signal-type" style="border-left-color: #00F0FF;">
                    <h4>🏦 Exchange Flows</h4>
                    <p>Dòng tiền lớn vào/ra các sàn giao dịch</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/6366F1?text=Large+Order+Detection+Signals" alt="Dấu Hiệu Lệnh Lớn">
                <p class="image-caption">Các dấu hiệu phát hiện lệnh lớn trên thị trường</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🚨</div>
            <h2 class="section-title">Whale Alert: Đọc Và Hiểu</h2>
            <p>Whale Alert là dịch vụ theo dõi giao dịch lớn trên blockchain. Đây là cách đọc một alert điển hình:</p>

            <div class="alert-example">
                <span class="whale-icon">🐋</span>
                <span class="amount">5,000 BTC</span>
                (<span class="coin">$200,000,000</span>) transferred from
                <span class="direction">unknown wallet to Binance</span>
            </div>

            <div class="interpretation-box">
                <h4>📖 Cách Giải Mã Alert Trên:</h4>
                <ul style="margin-bottom: 0;">
                    <li><strong>5,000 BTC ($200M):</strong> Đây là lệnh RẤT LỚN</li>
                    <li><strong>Unknown wallet → Binance:</strong> Di chuyển VÀO sàn = có thể sắp BÁN</li>
                    <li><strong>Timing:</strong> Nếu thấy nhiều alert tương tự = distribution phase</li>
                </ul>
            </div>

            <div class="highlight-box gold">
                <p><strong>💡 Quy Tắc Giải Mã:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li><strong>VÀO sàn:</strong> Whale có thể sắp bán (Bearish signal)</li>
                    <li><strong>RA khỏi sàn:</strong> Whale rút về ví lạnh = HODL (Bullish signal)</li>
                    <li><strong>Wallet → Wallet:</strong> Có thể OTC trade, cần xác minh thêm</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=Whale+Alert+Interpretation+Guide" alt="Hướng Dẫn Đọc Whale Alert">
                <p class="image-caption">Hướng dẫn giải mã các loại Whale Alert</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Volume Bất Thường</h2>
            <p>Volume spike là dấu hiệu quan trọng của hoạt động whale. So sánh với volume trung bình 20 ngày:</p>

            <div class="volume-bar high">
                <div class="volume-bar-label">
                    <span>🟢 High Alert: >300% Average</span>
                    <span style="color: #10B981;">Whale Activity Likely</span>
                </div>
                <div class="volume-bar-fill"></div>
            </div>

            <div class="volume-bar normal">
                <div class="volume-bar-label">
                    <span>🟡 Normal: 80-150% Average</span>
                    <span style="color: #6366F1;">Standard Trading</span>
                </div>
                <div class="volume-bar-fill"></div>
            </div>

            <div class="volume-bar low">
                <div class="volume-bar-label">
                    <span>🔴 Low: <50% Average</span>
                    <span style="color: #EF4444;">Quiet Period</span>
                </div>
                <div class="volume-bar-fill"></div>
            </div>

            <p>Khi thấy volume spike >300%, hãy kiểm tra:</p>
            <ul>
                <li>Có tin tức lớn không? (Nếu không → whale activity)</li>
                <li>Giá đang ở đâu? (Zone support/resistance?)</li>
                <li>Timeframe nào? (Volume spike trên 4H/1D quan trọng hơn 5m)</li>
            </ul>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Volume+Spike+Analysis+Chart" alt="Phân Tích Volume Spike">
                <p class="image-caption">Chart với volume spike và phân tích whale activity</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🎯</div>
            <h2 class="section-title">Block Trades</h2>
            <p>Block trades là giao dịch lớn được thực hiện ngoài order book thông thường, thường qua OTC desk hoặc dark pools.</p>

            <div class="highlight-box">
                <p><strong>📊 Đặc Điểm Block Trade:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li>Size: Thường >$10M một lệnh</li>
                    <li>Execution: Không hiện trên order book công khai</li>
                    <li>Price: Thường ở mức premium/discount nhỏ so với spot</li>
                    <li>Detection: Qua on-chain data sau khi settlement</li>
                </ul>
            </div>

            <p><strong>Tại sao whale dùng block trades?</strong></p>
            <ul>
                <li><strong>Tránh slippage:</strong> Lệnh $50M trên spot sẽ di chuyển giá nhiều</li>
                <li><strong>Privacy:</strong> Không muốn market biết họ đang mua/bán</li>
                <li><strong>Better price:</strong> OTC desks có thể match với counterparty</li>
            </ul>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/8B5CF6?text=Block+Trade+vs+Spot+Comparison" alt="Block Trade vs Spot">
                <p class="image-caption">So sánh Block Trade và giao dịch spot thông thường</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">✅</div>
            <h2 class="section-title">Checklist Phát Hiện Whale</h2>
            <p>Sử dụng checklist này khi phân tích market:</p>

            <div class="checklist">
                <div class="checklist-item">
                    <span class="checklist-icon">✓</span>
                    <span>Kiểm tra Whale Alert (Twitter/Telegram) mỗi 4 giờ</span>
                </div>
                <div class="checklist-item">
                    <span class="checklist-icon">✓</span>
                    <span>So sánh volume hiện tại với MA20 volume</span>
                </div>
                <div class="checklist-item">
                    <span class="checklist-icon">✓</span>
                    <span>Check exchange inflow/outflow trên Glassnode hoặc CryptoQuant</span>
                </div>
                <div class="checklist-item">
                    <span class="checklist-icon">✓</span>
                    <span>Xác minh context: có tin tức giải thích không?</span>
                </div>
                <div class="checklist-item">
                    <span class="checklist-icon">✓</span>
                    <span>Kết hợp với GEM pattern: có zone confluence không?</span>
                </div>
            </div>

            <div class="highlight-box green">
                <p style="margin-bottom: 0;"><strong>🎯 Pro Tip:</strong> Set alert cho Whale Alert bot. Khi nhận được alert lớn (>$50M), ngay lập tức check chart xem có GEM pattern confluence không.</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>4 dấu hiệu whale:</strong> Large transfers, Volume spikes, Block trades, Exchange flows</li>
                <li><strong>Whale Alert:</strong> Vào sàn = bearish, Ra sàn = bullish</li>
                <li><strong>Volume spike >300%</strong> là dấu hiệu mạnh của whale activity</li>
                <li><strong>Block trades</strong> là giao dịch OTC, detection qua on-chain</li>
                <li><strong>Luôn kết hợp</strong> whale signals với GEM patterns</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">1. Khi thấy Whale Alert "5,000 BTC transferred from unknown wallet to Binance", đây là tín hiệu gì?</p>
                <button class="quiz-option" data-index="0">Bearish - whale có thể sắp bán</button>
                <button class="quiz-option" data-index="1">Bullish - whale đang tích lũy</button>
                <button class="quiz-option" data-index="2">Neutral - không có ý nghĩa</button>
                <button class="quiz-option" data-index="3">Bullish - whale rút về cold wallet</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Volume spike bao nhiêu % so với MA20 được coi là "High Alert" cho whale activity?</p>
                <button class="quiz-option" data-index="0">>100%</button>
                <button class="quiz-option" data-index="1">>200%</button>
                <button class="quiz-option" data-index="2">>300%</button>
                <button class="quiz-option" data-index="3">>500%</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">3. Tại sao whale thường dùng block trades thay vì spot market?</p>
                <button class="quiz-option" data-index="0">Vì phí giao dịch thấp hơn</button>
                <button class="quiz-option" data-index="1">Để tránh slippage và giữ privacy</button>
                <button class="quiz-option" data-index="2">Vì tốc độ thực hiện nhanh hơn</button>
                <button class="quiz-option" data-index="3">Vì sàn yêu cầu</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="quiz-score-text">Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite</p>
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
                        res.textContent = ''✗ Chưa đúng. Hãy xem lại nội dung bài học.'';
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

-- Lesson 4.3: Phân Tích Order Flow
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch4-l3',
  'module-tier-3-ch4',
  'course-tier3-trading-mastery',
  'Bài 4.3: Phân Tích Order Flow',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 4.3: Phân Tích Order Flow | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #6366F1; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #6366F1; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #6366F1, #8B5CF6); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1)); border: 1px solid rgba(99,102,241,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255,189,89,0.15), rgba(245,158,11,0.1)); border-color: rgba(255,189,89,0.4); }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.1)); border-color: rgba(16,185,129,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #6366F1; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .order-book-visual { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .order-book-header { display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 0.75rem; font-size: 0.85rem; }
        .order-book-header .bid { color: #10B981; }
        .order-book-header .ask { color: #EF4444; }
        .order-book-row { display: flex; margin-bottom: 0.25rem; font-size: 0.9rem; }
        .order-book-row .bar { height: 24px; border-radius: 2px; display: flex; align-items: center; padding: 0 0.5rem; }
        .order-book-row .bar.bid { background: rgba(16,185,129,0.3); color: #10B981; justify-content: flex-end; }
        .order-book-row .bar.ask { background: rgba(239,68,68,0.3); color: #EF4444; }
        .order-book-row .price { width: 80px; text-align: center; color: #ffffff; font-weight: 500; }
        .imbalance-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #6366F1; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .imbalance-card h4 { color: #6366F1; font-size: 1.1rem; margin-bottom: 0.75rem; }
        .imbalance-meter { display: flex; align-items: center; gap: 0.5rem; margin: 1rem 0; }
        .imbalance-bar { flex: 1; height: 24px; background: #1a1a2e; border-radius: 4px; overflow: hidden; display: flex; }
        .imbalance-bar .bid-side { background: linear-gradient(90deg, #10B981, #059669); }
        .imbalance-bar .ask-side { background: linear-gradient(90deg, #EF4444, #DC2626); }
        .imbalance-label { font-size: 0.85rem; color: #a1a1aa; }
        .concept-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin: 1rem 0; }
        .concept-card { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; border-top: 3px solid #6366F1; }
        .concept-card h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.5rem; }
        .concept-card p { font-size: 0.9rem; margin-bottom: 0; }
        .footprint-example { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin: 1rem 0; font-family: monospace; font-size: 0.85rem; }
        .footprint-row { display: flex; justify-content: space-between; padding: 0.25rem 0; border-bottom: 1px solid #27272a; }
        .footprint-row:last-child { border-bottom: none; }
        .footprint-row .price { color: #ffffff; }
        .footprint-row .delta { font-weight: 600; }
        .footprint-row .delta.positive { color: #10B981; }
        .footprint-row .delta.negative { color: #EF4444; }
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
        .quiz-option:hover { border-color: #6366F1; background: rgba(99,102,241,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .concept-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">Phân Tích Order Flow</h1>
            <p class="lesson-subtitle">Đọc Dòng Tiền Và Áp Lực Mua/Bán</p>
        </header>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Order Flow Là Gì?</h2>
            <p>Order Flow là phương pháp phân tích <strong style="color: #6366F1;">dòng lệnh mua và bán</strong> trong thời gian thực. Thay vì chỉ nhìn giá (đã xảy ra), order flow cho bạn thấy áp lực đang diễn ra.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Khái Niệm Cốt Lõi:</strong> Giá di chuyển khi có sự mất cân bằng giữa lệnh mua (demand) và lệnh bán (supply). Order flow cho thấy sự mất cân bằng này TRƯỚC KHI giá phản ánh.</p>
            </div>

            <div class="concept-grid">
                <div class="concept-card">
                    <h4>📈 Bid (Lệnh Mua)</h4>
                    <p>Lệnh chờ mua ở giá thấp hơn giá hiện tại. Nhiều bid = demand mạnh.</p>
                </div>

                <div class="concept-card" style="border-top-color: #EF4444;">
                    <h4>📉 Ask (Lệnh Bán)</h4>
                    <p>Lệnh chờ bán ở giá cao hơn giá hiện tại. Nhiều ask = supply mạnh.</p>
                </div>

                <div class="concept-card" style="border-top-color: #10B981;">
                    <h4>⚖️ Imbalance</h4>
                    <p>Sự mất cân bằng bid/ask. Imbalance cao = giá sẽ di chuyển.</p>
                </div>

                <div class="concept-card" style="border-top-color: #FFBD59;">
                    <h4>🔥 Market Orders</h4>
                    <p>Lệnh mua/bán ngay tại giá thị trường. Cho thấy urgency.</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/6366F1?text=Order+Flow+Concept+Diagram" alt="Khái Niệm Order Flow">
                <p class="image-caption">Sơ đồ khái niệm Order Flow và các thành phần</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📖</div>
            <h2 class="section-title">Đọc Order Book (Depth Chart)</h2>
            <p>Order book hiển thị tất cả lệnh mua (bid) và bán (ask) đang chờ thực hiện:</p>

            <div class="order-book-visual">
                <div class="order-book-header">
                    <span class="bid">BID (Mua)</span>
                    <span>Giá</span>
                    <span class="ask">ASK (Bán)</span>
                </div>
                <div class="order-book-row">
                    <div class="bar bid" style="width: 30%;">150 BTC</div>
                    <div class="price">$42,100</div>
                    <div class="bar ask" style="width: 45%;">220 BTC</div>
                </div>
                <div class="order-book-row">
                    <div class="bar bid" style="width: 55%;">280 BTC</div>
                    <div class="price">$42,050</div>
                    <div class="bar ask" style="width: 25%;">120 BTC</div>
                </div>
                <div class="order-book-row">
                    <div class="bar bid" style="width: 70%;">350 BTC</div>
                    <div class="price">$42,000</div>
                    <div class="bar ask" style="width: 15%;">75 BTC</div>
                </div>
            </div>

            <div class="highlight-box gold">
                <p><strong>📖 Đọc Order Book Trên:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li><strong>$42,000:</strong> Có 350 BTC bid vs chỉ 75 BTC ask → Strong support</li>
                    <li><strong>$42,100:</strong> Có 220 BTC ask vs 150 BTC bid → Resistance</li>
                    <li><strong>Kết luận:</strong> Hỗ trợ mạnh ở $42,000, kháng cự ở $42,100</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Order+Book+Depth+Chart+Visual" alt="Order Book Depth">
                <p class="image-caption">Visualization của Order Book với bid/ask imbalance</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⚖️</div>
            <h2 class="section-title">Bid/Ask Imbalance</h2>
            <p>Imbalance là chỉ số quan trọng nhất trong order flow. Nó cho thấy bên nào đang thắng cuộc chiến mua-bán.</p>

            <div class="imbalance-card">
                <h4>📊 Ví Dụ Bid/Ask Imbalance</h4>
                <div class="imbalance-meter">
                    <span class="imbalance-label" style="color: #10B981;">BID 65%</span>
                    <div class="imbalance-bar">
                        <div class="bid-side" style="width: 65%;"></div>
                        <div class="ask-side" style="width: 35%;"></div>
                    </div>
                    <span class="imbalance-label" style="color: #EF4444;">ASK 35%</span>
                </div>
                <p style="margin-bottom: 0; font-size: 0.9rem;">Imbalance 65/35 cho thấy áp lực mua mạnh hơn bán → Bullish bias</p>
            </div>

            <div class="highlight-box">
                <p><strong>📏 Quy Tắc Imbalance:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li><strong>>60% Bid:</strong> Bullish imbalance → Giá có xu hướng tăng</li>
                    <li><strong>>60% Ask:</strong> Bearish imbalance → Giá có xu hướng giảm</li>
                    <li><strong>45-55%:</strong> Balanced → Không có bias rõ ràng</li>
                </ul>
            </div>

            <p><strong>Cảnh báo:</strong> Imbalance có thể thay đổi nhanh. Whale có thể đặt lệnh lớn để "fake" imbalance rồi hủy. Luôn kết hợp với GEM zones.</p>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=Bid+Ask+Imbalance+Analysis" alt="Phân Tích Imbalance">
                <p class="image-caption">Phân tích Bid/Ask Imbalance theo thời gian</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">👣</div>
            <h2 class="section-title">Footprint Charts</h2>
            <p>Footprint chart là công cụ order flow nâng cao, hiển thị lệnh mua/bán thực tế đã khớp tại mỗi mức giá.</p>

            <div class="footprint-example">
                <div class="footprint-row">
                    <span class="price">$42,150</span>
                    <span>Buy: 45 | Sell: 120</span>
                    <span class="delta negative">Delta: -75</span>
                </div>
                <div class="footprint-row">
                    <span class="price">$42,100</span>
                    <span>Buy: 180 | Sell: 95</span>
                    <span class="delta positive">Delta: +85</span>
                </div>
                <div class="footprint-row">
                    <span class="price">$42,050</span>
                    <span>Buy: 220 | Sell: 60</span>
                    <span class="delta positive">Delta: +160</span>
                </div>
                <div class="footprint-row">
                    <span class="price">$42,000</span>
                    <span>Buy: 350 | Sell: 40</span>
                    <span class="delta positive">Delta: +310</span>
                </div>
            </div>

            <div class="highlight-box green">
                <p><strong>📖 Đọc Footprint Chart:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li><strong>Delta dương lớn ($42,000):</strong> Aggressive buying tại zone này</li>
                    <li><strong>Delta âm ($42,150):</strong> Sellers đang chiến thắng ở mức này</li>
                    <li><strong>Pattern:</strong> Strong buying ở $42,000 = likely support</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/8B5CF6?text=Footprint+Chart+Example" alt="Footprint Chart">
                <p class="image-caption">Ví dụ Footprint Chart với delta analysis</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🎯</div>
            <h2 class="section-title">Kết Hợp Order Flow + GEM Patterns</h2>
            <p>Order flow mạnh nhất khi kết hợp với GEM zones và patterns:</p>

            <ul>
                <li><strong>GEM Zone + Strong Bid Imbalance:</strong> High probability long</li>
                <li><strong>GEM Zone + Strong Ask Imbalance:</strong> High probability short</li>
                <li><strong>GEM Zone + Neutral Imbalance:</strong> Chờ thêm xác nhận</li>
            </ul>

            <div class="highlight-box">
                <p><strong>🔥 Elite Setup:</strong></p>
                <p style="margin-bottom: 0;">GEM UPU Pattern + Zone Retest + Bid Imbalance >65% + Bullish Engulfing = <strong style="color: #10B981;">Very High Probability Long</strong></p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/00F0FF?text=Order+Flow+GEM+Pattern+Confluence" alt="Order Flow + GEM">
                <p class="image-caption">Kết hợp Order Flow với GEM Patterns</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>Order Flow</strong> phân tích dòng lệnh mua/bán trong thời gian thực</li>
                <li><strong>Bid/Ask</strong>: Bid = lệnh mua chờ, Ask = lệnh bán chờ</li>
                <li><strong>Imbalance >60%</strong> cho thấy bias rõ ràng (bullish/bearish)</li>
                <li><strong>Footprint charts</strong> hiển thị delta (buy-sell) tại mỗi mức giá</li>
                <li><strong>Kết hợp với GEM</strong> zones để tăng probability</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">1. Khi Bid Imbalance > 60%, điều này cho thấy?</p>
                <button class="quiz-option" data-index="0">Áp lực mua mạnh hơn bán - Bullish bias</button>
                <button class="quiz-option" data-index="1">Áp lực bán mạnh hơn mua - Bearish bias</button>
                <button class="quiz-option" data-index="2">Thị trường balanced - không có bias</button>
                <button class="quiz-option" data-index="3">Không thể kết luận được</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Trong Footprint Chart, "Delta +310 tại $42,000" có nghĩa là?</p>
                <button class="quiz-option" data-index="0">310 lệnh đang chờ tại mức giá đó</button>
                <button class="quiz-option" data-index="1">Có 310 người đang trade</button>
                <button class="quiz-option" data-index="2">Lệnh mua nhiều hơn lệnh bán 310 đơn vị</button>
                <button class="quiz-option" data-index="3">Giá sẽ tăng 310 điểm</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">3. Order Flow nên được sử dụng như thế nào?</p>
                <button class="quiz-option" data-index="0">Thay thế hoàn toàn technical analysis</button>
                <button class="quiz-option" data-index="1">Kết hợp với GEM patterns và zones</button>
                <button class="quiz-option" data-index="2">Chỉ dùng cho scalping ngắn hạn</button>
                <button class="quiz-option" data-index="3">Chỉ dùng khi whale alert xuất hiện</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="quiz-score-text">Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite</p>
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
                        res.textContent = ''✗ Chưa đúng. Hãy xem lại nội dung bài học.'';
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
    <title>Bài 4.3: Phân Tích Order Flow | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #6366F1; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #6366F1; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #6366F1, #8B5CF6); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1)); border: 1px solid rgba(99,102,241,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255,189,89,0.15), rgba(245,158,11,0.1)); border-color: rgba(255,189,89,0.4); }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.1)); border-color: rgba(16,185,129,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #6366F1; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .order-book-visual { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .order-book-header { display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 0.75rem; font-size: 0.85rem; }
        .order-book-header .bid { color: #10B981; }
        .order-book-header .ask { color: #EF4444; }
        .order-book-row { display: flex; margin-bottom: 0.25rem; font-size: 0.9rem; }
        .order-book-row .bar { height: 24px; border-radius: 2px; display: flex; align-items: center; padding: 0 0.5rem; }
        .order-book-row .bar.bid { background: rgba(16,185,129,0.3); color: #10B981; justify-content: flex-end; }
        .order-book-row .bar.ask { background: rgba(239,68,68,0.3); color: #EF4444; }
        .order-book-row .price { width: 80px; text-align: center; color: #ffffff; font-weight: 500; }
        .imbalance-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #6366F1; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .imbalance-card h4 { color: #6366F1; font-size: 1.1rem; margin-bottom: 0.75rem; }
        .imbalance-meter { display: flex; align-items: center; gap: 0.5rem; margin: 1rem 0; }
        .imbalance-bar { flex: 1; height: 24px; background: #1a1a2e; border-radius: 4px; overflow: hidden; display: flex; }
        .imbalance-bar .bid-side { background: linear-gradient(90deg, #10B981, #059669); }
        .imbalance-bar .ask-side { background: linear-gradient(90deg, #EF4444, #DC2626); }
        .imbalance-label { font-size: 0.85rem; color: #a1a1aa; }
        .concept-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin: 1rem 0; }
        .concept-card { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; border-top: 3px solid #6366F1; }
        .concept-card h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.5rem; }
        .concept-card p { font-size: 0.9rem; margin-bottom: 0; }
        .footprint-example { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin: 1rem 0; font-family: monospace; font-size: 0.85rem; }
        .footprint-row { display: flex; justify-content: space-between; padding: 0.25rem 0; border-bottom: 1px solid #27272a; }
        .footprint-row:last-child { border-bottom: none; }
        .footprint-row .price { color: #ffffff; }
        .footprint-row .delta { font-weight: 600; }
        .footprint-row .delta.positive { color: #10B981; }
        .footprint-row .delta.negative { color: #EF4444; }
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
        .quiz-option:hover { border-color: #6366F1; background: rgba(99,102,241,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .concept-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">Phân Tích Order Flow</h1>
            <p class="lesson-subtitle">Đọc Dòng Tiền Và Áp Lực Mua/Bán</p>
        </header>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Order Flow Là Gì?</h2>
            <p>Order Flow là phương pháp phân tích <strong style="color: #6366F1;">dòng lệnh mua và bán</strong> trong thời gian thực. Thay vì chỉ nhìn giá (đã xảy ra), order flow cho bạn thấy áp lực đang diễn ra.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Khái Niệm Cốt Lõi:</strong> Giá di chuyển khi có sự mất cân bằng giữa lệnh mua (demand) và lệnh bán (supply). Order flow cho thấy sự mất cân bằng này TRƯỚC KHI giá phản ánh.</p>
            </div>

            <div class="concept-grid">
                <div class="concept-card">
                    <h4>📈 Bid (Lệnh Mua)</h4>
                    <p>Lệnh chờ mua ở giá thấp hơn giá hiện tại. Nhiều bid = demand mạnh.</p>
                </div>

                <div class="concept-card" style="border-top-color: #EF4444;">
                    <h4>📉 Ask (Lệnh Bán)</h4>
                    <p>Lệnh chờ bán ở giá cao hơn giá hiện tại. Nhiều ask = supply mạnh.</p>
                </div>

                <div class="concept-card" style="border-top-color: #10B981;">
                    <h4>⚖️ Imbalance</h4>
                    <p>Sự mất cân bằng bid/ask. Imbalance cao = giá sẽ di chuyển.</p>
                </div>

                <div class="concept-card" style="border-top-color: #FFBD59;">
                    <h4>🔥 Market Orders</h4>
                    <p>Lệnh mua/bán ngay tại giá thị trường. Cho thấy urgency.</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/6366F1?text=Order+Flow+Concept+Diagram" alt="Khái Niệm Order Flow">
                <p class="image-caption">Sơ đồ khái niệm Order Flow và các thành phần</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📖</div>
            <h2 class="section-title">Đọc Order Book (Depth Chart)</h2>
            <p>Order book hiển thị tất cả lệnh mua (bid) và bán (ask) đang chờ thực hiện:</p>

            <div class="order-book-visual">
                <div class="order-book-header">
                    <span class="bid">BID (Mua)</span>
                    <span>Giá</span>
                    <span class="ask">ASK (Bán)</span>
                </div>
                <div class="order-book-row">
                    <div class="bar bid" style="width: 30%;">150 BTC</div>
                    <div class="price">$42,100</div>
                    <div class="bar ask" style="width: 45%;">220 BTC</div>
                </div>
                <div class="order-book-row">
                    <div class="bar bid" style="width: 55%;">280 BTC</div>
                    <div class="price">$42,050</div>
                    <div class="bar ask" style="width: 25%;">120 BTC</div>
                </div>
                <div class="order-book-row">
                    <div class="bar bid" style="width: 70%;">350 BTC</div>
                    <div class="price">$42,000</div>
                    <div class="bar ask" style="width: 15%;">75 BTC</div>
                </div>
            </div>

            <div class="highlight-box gold">
                <p><strong>📖 Đọc Order Book Trên:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li><strong>$42,000:</strong> Có 350 BTC bid vs chỉ 75 BTC ask → Strong support</li>
                    <li><strong>$42,100:</strong> Có 220 BTC ask vs 150 BTC bid → Resistance</li>
                    <li><strong>Kết luận:</strong> Hỗ trợ mạnh ở $42,000, kháng cự ở $42,100</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Order+Book+Depth+Chart+Visual" alt="Order Book Depth">
                <p class="image-caption">Visualization của Order Book với bid/ask imbalance</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⚖️</div>
            <h2 class="section-title">Bid/Ask Imbalance</h2>
            <p>Imbalance là chỉ số quan trọng nhất trong order flow. Nó cho thấy bên nào đang thắng cuộc chiến mua-bán.</p>

            <div class="imbalance-card">
                <h4>📊 Ví Dụ Bid/Ask Imbalance</h4>
                <div class="imbalance-meter">
                    <span class="imbalance-label" style="color: #10B981;">BID 65%</span>
                    <div class="imbalance-bar">
                        <div class="bid-side" style="width: 65%;"></div>
                        <div class="ask-side" style="width: 35%;"></div>
                    </div>
                    <span class="imbalance-label" style="color: #EF4444;">ASK 35%</span>
                </div>
                <p style="margin-bottom: 0; font-size: 0.9rem;">Imbalance 65/35 cho thấy áp lực mua mạnh hơn bán → Bullish bias</p>
            </div>

            <div class="highlight-box">
                <p><strong>📏 Quy Tắc Imbalance:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li><strong>>60% Bid:</strong> Bullish imbalance → Giá có xu hướng tăng</li>
                    <li><strong>>60% Ask:</strong> Bearish imbalance → Giá có xu hướng giảm</li>
                    <li><strong>45-55%:</strong> Balanced → Không có bias rõ ràng</li>
                </ul>
            </div>

            <p><strong>Cảnh báo:</strong> Imbalance có thể thay đổi nhanh. Whale có thể đặt lệnh lớn để "fake" imbalance rồi hủy. Luôn kết hợp với GEM zones.</p>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=Bid+Ask+Imbalance+Analysis" alt="Phân Tích Imbalance">
                <p class="image-caption">Phân tích Bid/Ask Imbalance theo thời gian</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">👣</div>
            <h2 class="section-title">Footprint Charts</h2>
            <p>Footprint chart là công cụ order flow nâng cao, hiển thị lệnh mua/bán thực tế đã khớp tại mỗi mức giá.</p>

            <div class="footprint-example">
                <div class="footprint-row">
                    <span class="price">$42,150</span>
                    <span>Buy: 45 | Sell: 120</span>
                    <span class="delta negative">Delta: -75</span>
                </div>
                <div class="footprint-row">
                    <span class="price">$42,100</span>
                    <span>Buy: 180 | Sell: 95</span>
                    <span class="delta positive">Delta: +85</span>
                </div>
                <div class="footprint-row">
                    <span class="price">$42,050</span>
                    <span>Buy: 220 | Sell: 60</span>
                    <span class="delta positive">Delta: +160</span>
                </div>
                <div class="footprint-row">
                    <span class="price">$42,000</span>
                    <span>Buy: 350 | Sell: 40</span>
                    <span class="delta positive">Delta: +310</span>
                </div>
            </div>

            <div class="highlight-box green">
                <p><strong>📖 Đọc Footprint Chart:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li><strong>Delta dương lớn ($42,000):</strong> Aggressive buying tại zone này</li>
                    <li><strong>Delta âm ($42,150):</strong> Sellers đang chiến thắng ở mức này</li>
                    <li><strong>Pattern:</strong> Strong buying ở $42,000 = likely support</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/8B5CF6?text=Footprint+Chart+Example" alt="Footprint Chart">
                <p class="image-caption">Ví dụ Footprint Chart với delta analysis</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🎯</div>
            <h2 class="section-title">Kết Hợp Order Flow + GEM Patterns</h2>
            <p>Order flow mạnh nhất khi kết hợp với GEM zones và patterns:</p>

            <ul>
                <li><strong>GEM Zone + Strong Bid Imbalance:</strong> High probability long</li>
                <li><strong>GEM Zone + Strong Ask Imbalance:</strong> High probability short</li>
                <li><strong>GEM Zone + Neutral Imbalance:</strong> Chờ thêm xác nhận</li>
            </ul>

            <div class="highlight-box">
                <p><strong>🔥 Elite Setup:</strong></p>
                <p style="margin-bottom: 0;">GEM UPU Pattern + Zone Retest + Bid Imbalance >65% + Bullish Engulfing = <strong style="color: #10B981;">Very High Probability Long</strong></p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/00F0FF?text=Order+Flow+GEM+Pattern+Confluence" alt="Order Flow + GEM">
                <p class="image-caption">Kết hợp Order Flow với GEM Patterns</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>Order Flow</strong> phân tích dòng lệnh mua/bán trong thời gian thực</li>
                <li><strong>Bid/Ask</strong>: Bid = lệnh mua chờ, Ask = lệnh bán chờ</li>
                <li><strong>Imbalance >60%</strong> cho thấy bias rõ ràng (bullish/bearish)</li>
                <li><strong>Footprint charts</strong> hiển thị delta (buy-sell) tại mỗi mức giá</li>
                <li><strong>Kết hợp với GEM</strong> zones để tăng probability</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">1. Khi Bid Imbalance > 60%, điều này cho thấy?</p>
                <button class="quiz-option" data-index="0">Áp lực mua mạnh hơn bán - Bullish bias</button>
                <button class="quiz-option" data-index="1">Áp lực bán mạnh hơn mua - Bearish bias</button>
                <button class="quiz-option" data-index="2">Thị trường balanced - không có bias</button>
                <button class="quiz-option" data-index="3">Không thể kết luận được</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Trong Footprint Chart, "Delta +310 tại $42,000" có nghĩa là?</p>
                <button class="quiz-option" data-index="0">310 lệnh đang chờ tại mức giá đó</button>
                <button class="quiz-option" data-index="1">Có 310 người đang trade</button>
                <button class="quiz-option" data-index="2">Lệnh mua nhiều hơn lệnh bán 310 đơn vị</button>
                <button class="quiz-option" data-index="3">Giá sẽ tăng 310 điểm</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">3. Order Flow nên được sử dụng như thế nào?</p>
                <button class="quiz-option" data-index="0">Thay thế hoàn toàn technical analysis</button>
                <button class="quiz-option" data-index="1">Kết hợp với GEM patterns và zones</button>
                <button class="quiz-option" data-index="2">Chỉ dùng cho scalping ngắn hạn</button>
                <button class="quiz-option" data-index="3">Chỉ dùng khi whale alert xuất hiện</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="quiz-score-text">Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite</p>
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
                        res.textContent = ''✗ Chưa đúng. Hãy xem lại nội dung bài học.'';
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

-- Lesson 4.4: Tích Hợp Whale Signals
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch4-l4',
  'module-tier-3-ch4',
  'course-tier3-trading-mastery',
  'Bài 4.4: Tích Hợp Whale Signals',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 4.4: Tích Hợp Whale Signals | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #6366F1; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #6366F1; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #6366F1, #8B5CF6); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1)); border: 1px solid rgba(99,102,241,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255,189,89,0.15), rgba(245,158,11,0.1)); border-color: rgba(255,189,89,0.4); }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.1)); border-color: rgba(16,185,129,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #6366F1; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .confluence-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #10B981; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; }
        .confluence-card h4 { color: #10B981; font-size: 1.1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .confluence-score { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 1rem 0; }
        .confluence-item { display: flex; align-items: center; gap: 0.5rem; background: #0a0a0f; padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.85rem; }
        .confluence-item.active { border: 1px solid #10B981; }
        .confluence-item.inactive { opacity: 0.5; }
        .confluence-item .check { color: #10B981; }
        .confluence-item .cross { color: #EF4444; }
        .workflow-step { display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; background: #1a1a2e; border-radius: 8px; align-items: flex-start; }
        .step-number { background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
        .step-content h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.25rem; }
        .step-content p { margin-bottom: 0; font-size: 0.9rem; }
        .score-meter { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .score-bar { height: 24px; background: #1a1a2e; border-radius: 4px; overflow: hidden; margin: 0.5rem 0; }
        .score-fill { height: 100%; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.85rem; }
        .score-fill.high { background: linear-gradient(90deg, #10B981, #059669); }
        .score-fill.medium { background: linear-gradient(90deg, #FFBD59, #F59E0B); }
        .score-fill.low { background: linear-gradient(90deg, #EF4444, #DC2626); }
        .signal-matrix { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin: 1rem 0; }
        .matrix-header { background: #1a1a2e; padding: 0.5rem; text-align: center; font-weight: 600; font-size: 0.8rem; color: #a1a1aa; }
        .matrix-cell { background: #0a0a0f; padding: 0.75rem; text-align: center; font-size: 0.85rem; border-radius: 4px; }
        .matrix-cell.bullish { border-left: 3px solid #10B981; color: #10B981; }
        .matrix-cell.bearish { border-left: 3px solid #EF4444; color: #EF4444; }
        .matrix-cell.neutral { border-left: 3px solid #6366F1; color: #a1a1aa; }
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
        .quiz-option:hover { border-color: #6366F1; background: rgba(99,102,241,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .workflow-step { flex-direction: column; gap: 0.75rem; }
            .step-number { margin: 0 auto; }
            .step-content { text-align: center; }
            .signal-matrix { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">Tích Hợp Whale Signals</h1>
            <p class="lesson-subtitle">Kết Hợp Dữ Liệu Whale Với GEM Zones</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🔗</div>
            <h2 class="section-title">Tại Sao Cần Tích Hợp?</h2>
            <p>Whale signals đơn lẻ có thể gây hiểu lầm. Whale có thể di chuyển tiền vì nhiều lý do: rebalancing, OTC, security... Sức mạnh thực sự đến từ việc <strong style="color: #10B981;">kết hợp whale data với GEM technical analysis</strong>.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🎯 Nguyên Tắc:</strong> Whale Signal + GEM Zone Confluence = High Probability Trade</p>
            </div>

            <div class="confluence-card">
                <h4>✅ Ví Dụ High Confluence Setup</h4>
                <p>ETH/USDT tại zone $2,200:</p>
                <div class="confluence-score">
                    <div class="confluence-item active"><span class="check">✓</span> GEM Zone Support</div>
                    <div class="confluence-item active"><span class="check">✓</span> UPU Pattern</div>
                    <div class="confluence-item active"><span class="check">✓</span> Whale Outflow (từ sàn)</div>
                    <div class="confluence-item active"><span class="check">✓</span> Bid Imbalance >65%</div>
                    <div class="confluence-item active"><span class="check">✓</span> Bullish Engulfing</div>
                </div>
                <p style="margin-bottom: 0;"><strong>Kết quả:</strong> 5/5 factors = Very High Probability Long</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Whale+GEM+Confluence+Diagram" alt="Whale + GEM Confluence">
                <p class="image-caption">Sơ đồ kết hợp Whale Signals với GEM Zones</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Confluence Score System</h2>
            <p>Sử dụng hệ thống điểm confluence để đánh giá setup:</p>

            <div class="score-meter">
                <p><strong>5/5 Factors (100%)</strong></p>
                <div class="score-bar">
                    <div class="score-fill high" style="width: 100%;">VERY HIGH PROBABILITY</div>
                </div>
            </div>

            <div class="score-meter">
                <p><strong>4/5 Factors (80%)</strong></p>
                <div class="score-bar">
                    <div class="score-fill high" style="width: 80%;">HIGH PROBABILITY</div>
                </div>
            </div>

            <div class="score-meter">
                <p><strong>3/5 Factors (60%)</strong></p>
                <div class="score-bar">
                    <div class="score-fill medium" style="width: 60%;">MEDIUM - Proceed with caution</div>
                </div>
            </div>

            <div class="score-meter">
                <p><strong>≤2/5 Factors (≤40%)</strong></p>
                <div class="score-bar">
                    <div class="score-fill low" style="width: 40%;">LOW - Skip or wait</div>
                </div>
            </div>

            <div class="highlight-box gold">
                <p><strong>📏 5 Yếu Tố Confluence:</strong></p>
                <ol style="margin-bottom: 0;">
                    <li><strong>GEM Zone</strong> (Support/Resistance)</li>
                    <li><strong>GEM Pattern</strong> (UPU, UPD, DPU...)</li>
                    <li><strong>Whale Signal</strong> (Inflow/Outflow hợp lý)</li>
                    <li><strong>Order Flow</strong> (Bid/Ask Imbalance)</li>
                    <li><strong>Candlestick</strong> (Confirmation pattern)</li>
                </ol>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📋</div>
            <h2 class="section-title">Quy Trình Tích Hợp</h2>
            <p>Thực hiện theo quy trình này khi nhận được whale alert:</p>

            <div class="workflow-step">
                <div class="step-number">1</div>
                <div class="step-content">
                    <h4>Nhận Whale Alert</h4>
                    <p>Ghi nhận coin, direction (vào/ra sàn), size. Ví dụ: "2,000 BTC → Coinbase"</p>
                </div>
            </div>

            <div class="workflow-step">
                <div class="step-number">2</div>
                <div class="step-content">
                    <h4>Check GEM Zone</h4>
                    <p>Xem giá hiện tại có gần zone support/resistance không? Nếu không → skip.</p>
                </div>
            </div>

            <div class="workflow-step">
                <div class="step-number">3</div>
                <div class="step-content">
                    <h4>Xác Định Pattern</h4>
                    <p>Có GEM pattern đang hình thành không? UPU retest? DPU breakout?</p>
                </div>
            </div>

            <div class="workflow-step">
                <div class="step-number">4</div>
                <div class="step-content">
                    <h4>Kiểm Tra Order Flow</h4>
                    <p>Bid/Ask imbalance có support direction của whale không?</p>
                </div>
            </div>

            <div class="workflow-step">
                <div class="step-number">5</div>
                <div class="step-content">
                    <h4>Chờ Candlestick Confirmation</h4>
                    <p>Không entry ngay. Chờ nến xác nhận như Engulfing, Hammer...</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/6366F1?text=Whale+Integration+Workflow" alt="Quy Trình Tích Hợp">
                <p class="image-caption">Flowchart quy trình tích hợp Whale Signals</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📈</div>
            <h2 class="section-title">Signal Matrix</h2>
            <p>Ma trận nhanh để đánh giá whale signal trong các tình huống khác nhau:</p>

            <div class="signal-matrix">
                <div class="matrix-header">Whale Signal</div>
                <div class="matrix-header">At GEM Zone</div>
                <div class="matrix-header">Kết Luận</div>

                <div class="matrix-cell">Outflow từ sàn</div>
                <div class="matrix-cell">Support zone</div>
                <div class="matrix-cell bullish">🟢 BULLISH</div>

                <div class="matrix-cell">Inflow vào sàn</div>
                <div class="matrix-cell">Resistance zone</div>
                <div class="matrix-cell bearish">🔴 BEARISH</div>

                <div class="matrix-cell">Outflow từ sàn</div>
                <div class="matrix-cell">Resistance zone</div>
                <div class="matrix-cell neutral">⚪ NEUTRAL</div>

                <div class="matrix-cell">Inflow vào sàn</div>
                <div class="matrix-cell">Support zone</div>
                <div class="matrix-cell bearish">🔴 BEARISH (caution)</div>

                <div class="matrix-cell">Wallet → Wallet</div>
                <div class="matrix-cell">Any zone</div>
                <div class="matrix-cell neutral">⚪ Need more context</div>
            </div>

            <div class="highlight-box green">
                <p style="margin-bottom: 0;"><strong>💡 Key Insight:</strong> Whale outflow tại support = Accumulation. Whale inflow tại resistance = Distribution. Đây là các setup có probability cao nhất.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⚠️</div>
            <h2 class="section-title">Cảnh Báo Quan Trọng</h2>
            <p>Một số trường hợp whale signal có thể gây hiểu lầm:</p>

            <ul>
                <li><strong>Exchange rebalancing:</strong> Sàn di chuyển tiền định kỳ, không phải trade signal</li>
                <li><strong>Old whale wallets:</strong> Ví từ 2010 di chuyển có thể chỉ là security update</li>
                <li><strong>Stablecoin moves:</strong> Di chuyển USDT/USDC có thể chuẩn bị mua HOẶC rút ra fiat</li>
                <li><strong>DeFi interactions:</strong> Stake, lend, farm - không phải spot trading</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🛡️ Golden Rule:</strong> Whale signal alone = 1/5 confluence. Cần thêm 3-4 yếu tố khác mới đủ để trade.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/EF4444?text=Whale+Signal+Warnings" alt="Cảnh Báo Whale">
                <p class="image-caption">Các trường hợp whale signal gây hiểu lầm</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>Whale signal đơn lẻ</strong> không đủ - cần kết hợp với GEM analysis</li>
                <li><strong>5 yếu tố confluence:</strong> Zone, Pattern, Whale, Order Flow, Candlestick</li>
                <li><strong>4-5/5 factors</strong> = High probability trade</li>
                <li><strong>Whale outflow + Support</strong> = Bullish setup tốt nhất</li>
                <li><strong>Luôn xác minh context</strong> để tránh false signals</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">1. Trong hệ thống Confluence Score, bao nhiêu factors được coi là "High Probability"?</p>
                <button class="quiz-option" data-index="0">2/5 factors</button>
                <button class="quiz-option" data-index="1">3/5 factors</button>
                <button class="quiz-option" data-index="2">4-5/5 factors</button>
                <button class="quiz-option" data-index="3">Chỉ cần 1 factor mạnh</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">2. Kết hợp nào sau đây là BULLISH setup có probability cao nhất?</p>
                <button class="quiz-option" data-index="0">Whale outflow + GEM support zone + Bullish candle</button>
                <button class="quiz-option" data-index="1">Whale inflow + GEM support zone + Bullish candle</button>
                <button class="quiz-option" data-index="2">Whale outflow + GEM resistance zone</button>
                <button class="quiz-option" data-index="3">Whale move không rõ ràng</button>
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
                        res.textContent = ''✗ Chưa đúng. Hãy xem lại nội dung bài học.'';
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
    <title>Bài 4.4: Tích Hợp Whale Signals | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #6366F1; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #6366F1; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #6366F1, #8B5CF6); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1)); border: 1px solid rgba(99,102,241,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255,189,89,0.15), rgba(245,158,11,0.1)); border-color: rgba(255,189,89,0.4); }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.1)); border-color: rgba(16,185,129,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #6366F1; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .confluence-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #10B981; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; }
        .confluence-card h4 { color: #10B981; font-size: 1.1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .confluence-score { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 1rem 0; }
        .confluence-item { display: flex; align-items: center; gap: 0.5rem; background: #0a0a0f; padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.85rem; }
        .confluence-item.active { border: 1px solid #10B981; }
        .confluence-item.inactive { opacity: 0.5; }
        .confluence-item .check { color: #10B981; }
        .confluence-item .cross { color: #EF4444; }
        .workflow-step { display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; background: #1a1a2e; border-radius: 8px; align-items: flex-start; }
        .step-number { background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
        .step-content h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.25rem; }
        .step-content p { margin-bottom: 0; font-size: 0.9rem; }
        .score-meter { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .score-bar { height: 24px; background: #1a1a2e; border-radius: 4px; overflow: hidden; margin: 0.5rem 0; }
        .score-fill { height: 100%; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.85rem; }
        .score-fill.high { background: linear-gradient(90deg, #10B981, #059669); }
        .score-fill.medium { background: linear-gradient(90deg, #FFBD59, #F59E0B); }
        .score-fill.low { background: linear-gradient(90deg, #EF4444, #DC2626); }
        .signal-matrix { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin: 1rem 0; }
        .matrix-header { background: #1a1a2e; padding: 0.5rem; text-align: center; font-weight: 600; font-size: 0.8rem; color: #a1a1aa; }
        .matrix-cell { background: #0a0a0f; padding: 0.75rem; text-align: center; font-size: 0.85rem; border-radius: 4px; }
        .matrix-cell.bullish { border-left: 3px solid #10B981; color: #10B981; }
        .matrix-cell.bearish { border-left: 3px solid #EF4444; color: #EF4444; }
        .matrix-cell.neutral { border-left: 3px solid #6366F1; color: #a1a1aa; }
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
        .quiz-option:hover { border-color: #6366F1; background: rgba(99,102,241,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .workflow-step { flex-direction: column; gap: 0.75rem; }
            .step-number { margin: 0 auto; }
            .step-content { text-align: center; }
            .signal-matrix { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">Tích Hợp Whale Signals</h1>
            <p class="lesson-subtitle">Kết Hợp Dữ Liệu Whale Với GEM Zones</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🔗</div>
            <h2 class="section-title">Tại Sao Cần Tích Hợp?</h2>
            <p>Whale signals đơn lẻ có thể gây hiểu lầm. Whale có thể di chuyển tiền vì nhiều lý do: rebalancing, OTC, security... Sức mạnh thực sự đến từ việc <strong style="color: #10B981;">kết hợp whale data với GEM technical analysis</strong>.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🎯 Nguyên Tắc:</strong> Whale Signal + GEM Zone Confluence = High Probability Trade</p>
            </div>

            <div class="confluence-card">
                <h4>✅ Ví Dụ High Confluence Setup</h4>
                <p>ETH/USDT tại zone $2,200:</p>
                <div class="confluence-score">
                    <div class="confluence-item active"><span class="check">✓</span> GEM Zone Support</div>
                    <div class="confluence-item active"><span class="check">✓</span> UPU Pattern</div>
                    <div class="confluence-item active"><span class="check">✓</span> Whale Outflow (từ sàn)</div>
                    <div class="confluence-item active"><span class="check">✓</span> Bid Imbalance >65%</div>
                    <div class="confluence-item active"><span class="check">✓</span> Bullish Engulfing</div>
                </div>
                <p style="margin-bottom: 0;"><strong>Kết quả:</strong> 5/5 factors = Very High Probability Long</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Whale+GEM+Confluence+Diagram" alt="Whale + GEM Confluence">
                <p class="image-caption">Sơ đồ kết hợp Whale Signals với GEM Zones</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Confluence Score System</h2>
            <p>Sử dụng hệ thống điểm confluence để đánh giá setup:</p>

            <div class="score-meter">
                <p><strong>5/5 Factors (100%)</strong></p>
                <div class="score-bar">
                    <div class="score-fill high" style="width: 100%;">VERY HIGH PROBABILITY</div>
                </div>
            </div>

            <div class="score-meter">
                <p><strong>4/5 Factors (80%)</strong></p>
                <div class="score-bar">
                    <div class="score-fill high" style="width: 80%;">HIGH PROBABILITY</div>
                </div>
            </div>

            <div class="score-meter">
                <p><strong>3/5 Factors (60%)</strong></p>
                <div class="score-bar">
                    <div class="score-fill medium" style="width: 60%;">MEDIUM - Proceed with caution</div>
                </div>
            </div>

            <div class="score-meter">
                <p><strong>≤2/5 Factors (≤40%)</strong></p>
                <div class="score-bar">
                    <div class="score-fill low" style="width: 40%;">LOW - Skip or wait</div>
                </div>
            </div>

            <div class="highlight-box gold">
                <p><strong>📏 5 Yếu Tố Confluence:</strong></p>
                <ol style="margin-bottom: 0;">
                    <li><strong>GEM Zone</strong> (Support/Resistance)</li>
                    <li><strong>GEM Pattern</strong> (UPU, UPD, DPU...)</li>
                    <li><strong>Whale Signal</strong> (Inflow/Outflow hợp lý)</li>
                    <li><strong>Order Flow</strong> (Bid/Ask Imbalance)</li>
                    <li><strong>Candlestick</strong> (Confirmation pattern)</li>
                </ol>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📋</div>
            <h2 class="section-title">Quy Trình Tích Hợp</h2>
            <p>Thực hiện theo quy trình này khi nhận được whale alert:</p>

            <div class="workflow-step">
                <div class="step-number">1</div>
                <div class="step-content">
                    <h4>Nhận Whale Alert</h4>
                    <p>Ghi nhận coin, direction (vào/ra sàn), size. Ví dụ: "2,000 BTC → Coinbase"</p>
                </div>
            </div>

            <div class="workflow-step">
                <div class="step-number">2</div>
                <div class="step-content">
                    <h4>Check GEM Zone</h4>
                    <p>Xem giá hiện tại có gần zone support/resistance không? Nếu không → skip.</p>
                </div>
            </div>

            <div class="workflow-step">
                <div class="step-number">3</div>
                <div class="step-content">
                    <h4>Xác Định Pattern</h4>
                    <p>Có GEM pattern đang hình thành không? UPU retest? DPU breakout?</p>
                </div>
            </div>

            <div class="workflow-step">
                <div class="step-number">4</div>
                <div class="step-content">
                    <h4>Kiểm Tra Order Flow</h4>
                    <p>Bid/Ask imbalance có support direction của whale không?</p>
                </div>
            </div>

            <div class="workflow-step">
                <div class="step-number">5</div>
                <div class="step-content">
                    <h4>Chờ Candlestick Confirmation</h4>
                    <p>Không entry ngay. Chờ nến xác nhận như Engulfing, Hammer...</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/6366F1?text=Whale+Integration+Workflow" alt="Quy Trình Tích Hợp">
                <p class="image-caption">Flowchart quy trình tích hợp Whale Signals</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📈</div>
            <h2 class="section-title">Signal Matrix</h2>
            <p>Ma trận nhanh để đánh giá whale signal trong các tình huống khác nhau:</p>

            <div class="signal-matrix">
                <div class="matrix-header">Whale Signal</div>
                <div class="matrix-header">At GEM Zone</div>
                <div class="matrix-header">Kết Luận</div>

                <div class="matrix-cell">Outflow từ sàn</div>
                <div class="matrix-cell">Support zone</div>
                <div class="matrix-cell bullish">🟢 BULLISH</div>

                <div class="matrix-cell">Inflow vào sàn</div>
                <div class="matrix-cell">Resistance zone</div>
                <div class="matrix-cell bearish">🔴 BEARISH</div>

                <div class="matrix-cell">Outflow từ sàn</div>
                <div class="matrix-cell">Resistance zone</div>
                <div class="matrix-cell neutral">⚪ NEUTRAL</div>

                <div class="matrix-cell">Inflow vào sàn</div>
                <div class="matrix-cell">Support zone</div>
                <div class="matrix-cell bearish">🔴 BEARISH (caution)</div>

                <div class="matrix-cell">Wallet → Wallet</div>
                <div class="matrix-cell">Any zone</div>
                <div class="matrix-cell neutral">⚪ Need more context</div>
            </div>

            <div class="highlight-box green">
                <p style="margin-bottom: 0;"><strong>💡 Key Insight:</strong> Whale outflow tại support = Accumulation. Whale inflow tại resistance = Distribution. Đây là các setup có probability cao nhất.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⚠️</div>
            <h2 class="section-title">Cảnh Báo Quan Trọng</h2>
            <p>Một số trường hợp whale signal có thể gây hiểu lầm:</p>

            <ul>
                <li><strong>Exchange rebalancing:</strong> Sàn di chuyển tiền định kỳ, không phải trade signal</li>
                <li><strong>Old whale wallets:</strong> Ví từ 2010 di chuyển có thể chỉ là security update</li>
                <li><strong>Stablecoin moves:</strong> Di chuyển USDT/USDC có thể chuẩn bị mua HOẶC rút ra fiat</li>
                <li><strong>DeFi interactions:</strong> Stake, lend, farm - không phải spot trading</li>
            </ul>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🛡️ Golden Rule:</strong> Whale signal alone = 1/5 confluence. Cần thêm 3-4 yếu tố khác mới đủ để trade.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x350/112250/EF4444?text=Whale+Signal+Warnings" alt="Cảnh Báo Whale">
                <p class="image-caption">Các trường hợp whale signal gây hiểu lầm</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>Whale signal đơn lẻ</strong> không đủ - cần kết hợp với GEM analysis</li>
                <li><strong>5 yếu tố confluence:</strong> Zone, Pattern, Whale, Order Flow, Candlestick</li>
                <li><strong>4-5/5 factors</strong> = High probability trade</li>
                <li><strong>Whale outflow + Support</strong> = Bullish setup tốt nhất</li>
                <li><strong>Luôn xác minh context</strong> để tránh false signals</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">1. Trong hệ thống Confluence Score, bao nhiêu factors được coi là "High Probability"?</p>
                <button class="quiz-option" data-index="0">2/5 factors</button>
                <button class="quiz-option" data-index="1">3/5 factors</button>
                <button class="quiz-option" data-index="2">4-5/5 factors</button>
                <button class="quiz-option" data-index="3">Chỉ cần 1 factor mạnh</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">2. Kết hợp nào sau đây là BULLISH setup có probability cao nhất?</p>
                <button class="quiz-option" data-index="0">Whale outflow + GEM support zone + Bullish candle</button>
                <button class="quiz-option" data-index="1">Whale inflow + GEM support zone + Bullish candle</button>
                <button class="quiz-option" data-index="2">Whale outflow + GEM resistance zone</button>
                <button class="quiz-option" data-index="3">Whale move không rõ ràng</button>
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
                        res.textContent = ''✗ Chưa đúng. Hãy xem lại nội dung bài học.'';
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

-- Lesson 4.5: Ví Dụ Whale Tracking
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch4-l5',
  'module-tier-3-ch4',
  'course-tier3-trading-mastery',
  'Bài 4.5: Ví Dụ Whale Tracking',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 4.5: Ví Dụ Whale Tracking | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #6366F1; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #6366F1; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #6366F1, #8B5CF6); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1)); border: 1px solid rgba(99,102,241,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.1)); border-color: rgba(16,185,129,0.4); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255,189,89,0.15), rgba(245,158,11,0.1)); border-color: rgba(255,189,89,0.4); }
        .highlight-box.red { background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.1)); border-color: rgba(239,68,68,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #6366F1; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .case-study-box { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #6366F1; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; }
        .case-study-box h4 { color: #6366F1; font-size: 1.1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .case-study-box.success { border-color: #10B981; }
        .case-study-box.success h4 { color: #10B981; }
        .case-study-box.warning { border-color: #FFBD59; }
        .case-study-box.warning h4 { color: #FFBD59; }
        .whale-alert-box { background: #0a0a0f; border: 1px solid #3f3f46; border-radius: 8px; padding: 1rem; margin: 1rem 0; font-family: monospace; }
        .whale-alert-box .icon { font-size: 1.25rem; }
        .whale-alert-box .amount { color: #FFBD59; font-weight: 600; }
        .whale-alert-box .direction { color: #10B981; }
        .whale-alert-box .direction.sell { color: #EF4444; }
        .confluence-checklist { background: #1a1a2e; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .confluence-item { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; font-size: 0.9rem; }
        .confluence-item:last-child { margin-bottom: 0; }
        .confluence-item .check { color: #10B981; }
        .confluence-item .cross { color: #EF4444; }
        .result-box { display: flex; align-items: center; justify-content: center; gap: 1.5rem; padding: 1.5rem; background: #1a1a2e; border-radius: 8px; margin: 1rem 0; flex-wrap: wrap; }
        .result-value { font-size: 1.75rem; font-weight: 700; text-align: center; }
        .result-value.positive { color: #10B981; }
        .result-value.negative { color: #EF4444; }
        .result-label { font-size: 0.85rem; color: #a1a1aa; margin-top: 0.25rem; }
        .timeline-step { display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; background: #1a1a2e; border-radius: 8px; align-items: flex-start; }
        .timeline-time { background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-weight: 600; font-size: 0.85rem; flex-shrink: 0; }
        .timeline-content h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.25rem; }
        .timeline-content p { margin-bottom: 0; font-size: 0.9rem; }
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
        .quiz-option:hover { border-color: #6366F1; background: rgba(99,102,241,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .timeline-step { flex-direction: column; gap: 0.75rem; }
            .result-box { flex-direction: column; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">Ví Dụ Whale Tracking</h1>
            <p class="lesson-subtitle">Case Studies Thực Tế Với Whale Data</p>
        </header>

        <section class="content-section">
            <div class="section-icon">📚</div>
            <h2 class="section-title">Học Từ Thực Tế</h2>
            <p>Trong bài này, chúng ta sẽ phân tích 3 case studies thực tế về việc sử dụng whale tracking kết hợp với GEM analysis. Mỗi ví dụ sẽ cho thấy toàn bộ quy trình từ alert đến kết quả.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🎯 Mục Tiêu:</strong> Hiểu cách áp dụng whale tracking trong thực tế qua 3 scenarios: trade thành công, tránh trap, và false signal.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">✅</div>
            <h2 class="section-title">Case Study #1: Accumulation Thành Công</h2>

            <div class="case-study-box success">
                <h4>🟢 BTC/USDT - Long từ Whale Accumulation +12%</h4>
                <p>Ngày 10/12/2024, phát hiện pattern accumulation từ nhiều whale alerts.</p>
            </div>

            <div class="whale-alert-box">
                <span class="icon">🐋</span>
                <span class="amount">1,500 BTC</span> ($63M) transferred from
                <span class="direction">Binance → Unknown wallet</span>
            </div>
            <div class="whale-alert-box">
                <span class="icon">🐋</span>
                <span class="amount">2,200 BTC</span> ($92M) transferred from
                <span class="direction">Coinbase → Unknown wallet</span>
            </div>
            <div class="whale-alert-box">
                <span class="icon">🐋</span>
                <span class="amount">800 BTC</span> ($33M) transferred from
                <span class="direction">Kraken → Unknown wallet</span>
            </div>

            <p><strong>Phân Tích:</strong> 3 whale alerts trong 24h, tất cả đều OUTFLOW từ sàn. Tổng cộng 4,500 BTC ($188M) rời sàn.</p>

            <h4 style="color: #ffffff; margin: 1rem 0 0.5rem;">Confluence Check:</h4>
            <div class="confluence-checklist">
                <div class="confluence-item"><span class="check">✓</span> GEM Zone: $41,500 support (tested 3 lần)</div>
                <div class="confluence-item"><span class="check">✓</span> Pattern: UPU retest hoàn thành</div>
                <div class="confluence-item"><span class="check">✓</span> Whale: Massive outflow (accumulation)</div>
                <div class="confluence-item"><span class="check">✓</span> Order Flow: Bid imbalance 68%</div>
                <div class="confluence-item"><span class="check">✓</span> Candlestick: Bullish Engulfing trên 4H</div>
            </div>

            <p><strong>Kết quả:</strong> 5/5 confluence → Entry Long tại $41,800</p>

            <div class="result-box">
                <div>
                    <div class="result-value positive">+12.4%</div>
                    <div class="result-label">Profit Đạt Được</div>
                </div>
                <div>
                    <div class="result-value positive">4.1:1</div>
                    <div class="result-label">Risk/Reward</div>
                </div>
                <div>
                    <div class="result-value">5/5</div>
                    <div class="result-label">Confluence Score</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/10B981?text=BTC+Whale+Accumulation+Chart" alt="BTC Accumulation">
                <p class="image-caption">Chart BTC/USDT với whale accumulation signals</p>
            </div>

            <div class="highlight-box green">
                <p style="margin-bottom: 0;"><strong>🎯 Bài Học:</strong> Nhiều whale outflows liên tiếp từ sàn + GEM zone support = High probability accumulation phase.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🛡️</div>
            <h2 class="section-title">Case Study #2: Tránh Được Trap</h2>

            <div class="case-study-box warning">
                <h4>🟡 ETH/USDT - Skip Signal, Tránh -15% Dump</h4>
                <p>Ngày 15/12/2024, whale alert báo inflow lớn trong khi nhiều người đang bullish.</p>
            </div>

            <div class="whale-alert-box">
                <span class="icon">🐋</span>
                <span class="amount">15,000 ETH</span> ($36M) transferred from
                <span class="direction sell">Unknown wallet → Binance</span>
            </div>
            <div class="whale-alert-box">
                <span class="icon">🐋</span>
                <span class="amount">22,000 ETH</span> ($53M) transferred from
                <span class="direction sell">Unknown wallet → Coinbase</span>
            </div>

            <p><strong>Context:</strong> ETH đang ở $2,400, gần resistance $2,450. Sentiment retail rất bullish.</p>

            <h4 style="color: #ffffff; margin: 1rem 0 0.5rem;">Confluence Check:</h4>
            <div class="confluence-checklist">
                <div class="confluence-item"><span class="check">✓</span> GEM Zone: $2,450 resistance (strong)</div>
                <div class="confluence-item"><span class="cross">✗</span> Pattern: Không có clear pattern</div>
                <div class="confluence-item"><span class="cross">✗</span> Whale: Massive INFLOW (distribution)</div>
                <div class="confluence-item"><span class="cross">✗</span> Order Flow: Ask imbalance 62%</div>
                <div class="confluence-item"><span class="cross">✗</span> Candlestick: Shooting Star forming</div>
            </div>

            <p><strong>Quyết Định:</strong> 1/5 confluence cho long, 4/5 cho short potential → SKIP LONG, consider short</p>

            <h4 style="color: #ffffff; margin: 1rem 0 0.5rem;">Điều Xảy Ra Sau Đó:</h4>
            <div class="timeline-step">
                <span class="timeline-time">2 giờ sau</span>
                <div class="timeline-content">
                    <h4>ETH reject tại $2,450</h4>
                    <p>Giá chạm resistance và bị rejected mạnh</p>
                </div>
            </div>
            <div class="timeline-step">
                <span class="timeline-time">12 giờ sau</span>
                <div class="timeline-content">
                    <h4>ETH dump xuống $2,050</h4>
                    <p>Giảm 15% từ high, đúng như whale distribution signal</p>
                </div>
            </div>

            <div class="result-box">
                <div>
                    <div class="result-value positive">-15% Avoided</div>
                    <div class="result-label">Tránh Được Lỗ</div>
                </div>
                <div>
                    <div class="result-value">Capital Protected</div>
                    <div class="result-label">Vốn An Toàn</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/FFBD59?text=ETH+Distribution+Trap+Avoided" alt="ETH Trap Avoided">
                <p class="image-caption">Chart ETH/USDT với whale distribution warning</p>
            </div>

            <div class="highlight-box gold">
                <p style="margin-bottom: 0;"><strong>🛡️ Bài Học:</strong> Whale inflow lớn tại resistance = Distribution signal. Đừng FOMO theo retail sentiment khi whale đang bán.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">❌</div>
            <h2 class="section-title">Case Study #3: False Signal</h2>

            <div class="case-study-box" style="border-color: #EF4444;">
                <h4 style="color: #EF4444;">🔴 SOL/USDT - Whale Alert Gây Hiểu Lầm</h4>
                <p>Ngày 18/12/2024, whale alert lớn nhưng hóa ra là exchange rebalancing.</p>
            </div>

            <div class="whale-alert-box">
                <span class="icon">🐋</span>
                <span class="amount">500,000 SOL</span> ($55M) transferred from
                <span class="direction sell">Binance Hot Wallet → Binance Cold Wallet</span>
            </div>

            <p><strong>Vấn Đề:</strong> Alert này trông như whale rút tiền khỏi sàn (bullish), nhưng thực ra chỉ là Binance di chuyển nội bộ.</p>

            <h4 style="color: #ffffff; margin: 1rem 0 0.5rem;">Những Trader Đã Mắc Lỗi:</h4>
            <ul>
                <li>Không kiểm tra wallet addresses để xác minh</li>
                <li>Vào Long ngay sau alert mà không chờ confluence</li>
                <li>Bỏ qua việc SOL đang ở mid-range (không có zone)</li>
            </ul>

            <h4 style="color: #ffffff; margin: 1rem 0 0.5rem;">Cách Phát Hiện False Signal:</h4>
            <ul>
                <li><strong>Check wallet labels:</strong> Etherscan/Solscan có label cho exchange wallets</li>
                <li><strong>Pattern không có:</strong> SOL không ở GEM zone nào</li>
                <li><strong>Confluence thấp:</strong> Chỉ có 1/5 factor (whale alert alone)</li>
            </ul>

            <div class="result-box">
                <div>
                    <div class="result-value negative">-4.2%</div>
                    <div class="result-label">Lỗ Nếu Trade</div>
                </div>
                <div>
                    <div class="result-value">1/5</div>
                    <div class="result-label">Confluence (Quá Thấp)</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/EF4444?text=SOL+False+Whale+Signal" alt="SOL False Signal">
                <p class="image-caption">Ví dụ whale alert gây hiểu lầm</p>
            </div>

            <div class="highlight-box red">
                <p style="margin-bottom: 0;"><strong>⚠️ Bài Học:</strong> Whale alert alone = 1/5 confluence. LUÔN kiểm tra wallet source và đợi đủ confluence trước khi trade.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Tổng Kết 3 Case Studies</h2>

            <div class="highlight-box">
                <p><strong>🎯 Key Takeaways:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li><strong>Case 1:</strong> Multiple outflows + GEM zone = High probability accumulation</li>
                    <li><strong>Case 2:</strong> Large inflow at resistance = Distribution warning</li>
                    <li><strong>Case 3:</strong> Single alert without confluence = Potential false signal</li>
                </ul>
            </div>

            <p>Pattern rõ ràng từ 3 cases:</p>
            <ol>
                <li><strong>High confluence (4-5/5)</strong> → Proceed with trade</li>
                <li><strong>Medium (3/5)</strong> → Wait for more confirmation</li>
                <li><strong>Low (1-2/5)</strong> → Skip, không đủ evidence</li>
            </ol>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=3+Case+Studies+Summary" alt="Tổng Kết 3 Cases">
                <p class="image-caption">Infographic tổng kết 3 case studies whale tracking</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>Multiple whale outflows</strong> tại support = Accumulation signal mạnh</li>
                <li><strong>Large inflows</strong> tại resistance = Distribution warning</li>
                <li><strong>Single alert</strong> mà không có confluence = Potential trap</li>
                <li><strong>Luôn verify</strong> wallet source (exchange internal vs real whale)</li>
                <li><strong>Confluence 4-5/5</strong> mới đủ để trade với confidence</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Trong Case Study #1, yếu tố nào cho thấy đây là accumulation phase?</p>
                <button class="quiz-option" data-index="0">Một whale alert duy nhất</button>
                <button class="quiz-option" data-index="1">Nhiều whale outflows từ nhiều sàn cùng lúc</button>
                <button class="quiz-option" data-index="2">Giá đang tăng mạnh</button>
                <button class="quiz-option" data-index="3">Volume thấp bất thường</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Trong Case Study #3, whale alert gây hiểu lầm vì lý do gì?</p>
                <button class="quiz-option" data-index="0">Whale Alert bot bị lỗi</button>
                <button class="quiz-option" data-index="1">Số lượng SOL quá nhỏ</button>
                <button class="quiz-option" data-index="2">Đây là exchange internal transfer, không phải whale thực</button>
                <button class="quiz-option" data-index="3">Market đang sideway</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">3. Bài học quan trọng nhất từ Case Study #2 là gì?</p>
                <button class="quiz-option" data-index="0">Whale inflow lớn tại resistance là warning signal</button>
                <button class="quiz-option" data-index="1">Luôn follow retail sentiment</button>
                <button class="quiz-option" data-index="2">ETH không bao giờ dump</button>
                <button class="quiz-option" data-index="3">Whale alert không quan trọng</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="quiz-score-text">Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite</p>
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
    <title>Bài 4.5: Ví Dụ Whale Tracking | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #6366F1; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #6366F1; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #6366F1, #8B5CF6); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1)); border: 1px solid rgba(99,102,241,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.green { background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.1)); border-color: rgba(16,185,129,0.4); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255,189,89,0.15), rgba(245,158,11,0.1)); border-color: rgba(255,189,89,0.4); }
        .highlight-box.red { background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.1)); border-color: rgba(239,68,68,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #6366F1; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .case-study-box { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #6366F1; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; }
        .case-study-box h4 { color: #6366F1; font-size: 1.1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .case-study-box.success { border-color: #10B981; }
        .case-study-box.success h4 { color: #10B981; }
        .case-study-box.warning { border-color: #FFBD59; }
        .case-study-box.warning h4 { color: #FFBD59; }
        .whale-alert-box { background: #0a0a0f; border: 1px solid #3f3f46; border-radius: 8px; padding: 1rem; margin: 1rem 0; font-family: monospace; }
        .whale-alert-box .icon { font-size: 1.25rem; }
        .whale-alert-box .amount { color: #FFBD59; font-weight: 600; }
        .whale-alert-box .direction { color: #10B981; }
        .whale-alert-box .direction.sell { color: #EF4444; }
        .confluence-checklist { background: #1a1a2e; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .confluence-item { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; font-size: 0.9rem; }
        .confluence-item:last-child { margin-bottom: 0; }
        .confluence-item .check { color: #10B981; }
        .confluence-item .cross { color: #EF4444; }
        .result-box { display: flex; align-items: center; justify-content: center; gap: 1.5rem; padding: 1.5rem; background: #1a1a2e; border-radius: 8px; margin: 1rem 0; flex-wrap: wrap; }
        .result-value { font-size: 1.75rem; font-weight: 700; text-align: center; }
        .result-value.positive { color: #10B981; }
        .result-value.negative { color: #EF4444; }
        .result-label { font-size: 0.85rem; color: #a1a1aa; margin-top: 0.25rem; }
        .timeline-step { display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; background: #1a1a2e; border-radius: 8px; align-items: flex-start; }
        .timeline-time { background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-weight: 600; font-size: 0.85rem; flex-shrink: 0; }
        .timeline-content h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.25rem; }
        .timeline-content p { margin-bottom: 0; font-size: 0.9rem; }
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
        .quiz-option:hover { border-color: #6366F1; background: rgba(99,102,241,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .timeline-step { flex-direction: column; gap: 0.75rem; }
            .result-box { flex-direction: column; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">Ví Dụ Whale Tracking</h1>
            <p class="lesson-subtitle">Case Studies Thực Tế Với Whale Data</p>
        </header>

        <section class="content-section">
            <div class="section-icon">📚</div>
            <h2 class="section-title">Học Từ Thực Tế</h2>
            <p>Trong bài này, chúng ta sẽ phân tích 3 case studies thực tế về việc sử dụng whale tracking kết hợp với GEM analysis. Mỗi ví dụ sẽ cho thấy toàn bộ quy trình từ alert đến kết quả.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🎯 Mục Tiêu:</strong> Hiểu cách áp dụng whale tracking trong thực tế qua 3 scenarios: trade thành công, tránh trap, và false signal.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">✅</div>
            <h2 class="section-title">Case Study #1: Accumulation Thành Công</h2>

            <div class="case-study-box success">
                <h4>🟢 BTC/USDT - Long từ Whale Accumulation +12%</h4>
                <p>Ngày 10/12/2024, phát hiện pattern accumulation từ nhiều whale alerts.</p>
            </div>

            <div class="whale-alert-box">
                <span class="icon">🐋</span>
                <span class="amount">1,500 BTC</span> ($63M) transferred from
                <span class="direction">Binance → Unknown wallet</span>
            </div>
            <div class="whale-alert-box">
                <span class="icon">🐋</span>
                <span class="amount">2,200 BTC</span> ($92M) transferred from
                <span class="direction">Coinbase → Unknown wallet</span>
            </div>
            <div class="whale-alert-box">
                <span class="icon">🐋</span>
                <span class="amount">800 BTC</span> ($33M) transferred from
                <span class="direction">Kraken → Unknown wallet</span>
            </div>

            <p><strong>Phân Tích:</strong> 3 whale alerts trong 24h, tất cả đều OUTFLOW từ sàn. Tổng cộng 4,500 BTC ($188M) rời sàn.</p>

            <h4 style="color: #ffffff; margin: 1rem 0 0.5rem;">Confluence Check:</h4>
            <div class="confluence-checklist">
                <div class="confluence-item"><span class="check">✓</span> GEM Zone: $41,500 support (tested 3 lần)</div>
                <div class="confluence-item"><span class="check">✓</span> Pattern: UPU retest hoàn thành</div>
                <div class="confluence-item"><span class="check">✓</span> Whale: Massive outflow (accumulation)</div>
                <div class="confluence-item"><span class="check">✓</span> Order Flow: Bid imbalance 68%</div>
                <div class="confluence-item"><span class="check">✓</span> Candlestick: Bullish Engulfing trên 4H</div>
            </div>

            <p><strong>Kết quả:</strong> 5/5 confluence → Entry Long tại $41,800</p>

            <div class="result-box">
                <div>
                    <div class="result-value positive">+12.4%</div>
                    <div class="result-label">Profit Đạt Được</div>
                </div>
                <div>
                    <div class="result-value positive">4.1:1</div>
                    <div class="result-label">Risk/Reward</div>
                </div>
                <div>
                    <div class="result-value">5/5</div>
                    <div class="result-label">Confluence Score</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/10B981?text=BTC+Whale+Accumulation+Chart" alt="BTC Accumulation">
                <p class="image-caption">Chart BTC/USDT với whale accumulation signals</p>
            </div>

            <div class="highlight-box green">
                <p style="margin-bottom: 0;"><strong>🎯 Bài Học:</strong> Nhiều whale outflows liên tiếp từ sàn + GEM zone support = High probability accumulation phase.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🛡️</div>
            <h2 class="section-title">Case Study #2: Tránh Được Trap</h2>

            <div class="case-study-box warning">
                <h4>🟡 ETH/USDT - Skip Signal, Tránh -15% Dump</h4>
                <p>Ngày 15/12/2024, whale alert báo inflow lớn trong khi nhiều người đang bullish.</p>
            </div>

            <div class="whale-alert-box">
                <span class="icon">🐋</span>
                <span class="amount">15,000 ETH</span> ($36M) transferred from
                <span class="direction sell">Unknown wallet → Binance</span>
            </div>
            <div class="whale-alert-box">
                <span class="icon">🐋</span>
                <span class="amount">22,000 ETH</span> ($53M) transferred from
                <span class="direction sell">Unknown wallet → Coinbase</span>
            </div>

            <p><strong>Context:</strong> ETH đang ở $2,400, gần resistance $2,450. Sentiment retail rất bullish.</p>

            <h4 style="color: #ffffff; margin: 1rem 0 0.5rem;">Confluence Check:</h4>
            <div class="confluence-checklist">
                <div class="confluence-item"><span class="check">✓</span> GEM Zone: $2,450 resistance (strong)</div>
                <div class="confluence-item"><span class="cross">✗</span> Pattern: Không có clear pattern</div>
                <div class="confluence-item"><span class="cross">✗</span> Whale: Massive INFLOW (distribution)</div>
                <div class="confluence-item"><span class="cross">✗</span> Order Flow: Ask imbalance 62%</div>
                <div class="confluence-item"><span class="cross">✗</span> Candlestick: Shooting Star forming</div>
            </div>

            <p><strong>Quyết Định:</strong> 1/5 confluence cho long, 4/5 cho short potential → SKIP LONG, consider short</p>

            <h4 style="color: #ffffff; margin: 1rem 0 0.5rem;">Điều Xảy Ra Sau Đó:</h4>
            <div class="timeline-step">
                <span class="timeline-time">2 giờ sau</span>
                <div class="timeline-content">
                    <h4>ETH reject tại $2,450</h4>
                    <p>Giá chạm resistance và bị rejected mạnh</p>
                </div>
            </div>
            <div class="timeline-step">
                <span class="timeline-time">12 giờ sau</span>
                <div class="timeline-content">
                    <h4>ETH dump xuống $2,050</h4>
                    <p>Giảm 15% từ high, đúng như whale distribution signal</p>
                </div>
            </div>

            <div class="result-box">
                <div>
                    <div class="result-value positive">-15% Avoided</div>
                    <div class="result-label">Tránh Được Lỗ</div>
                </div>
                <div>
                    <div class="result-value">Capital Protected</div>
                    <div class="result-label">Vốn An Toàn</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/FFBD59?text=ETH+Distribution+Trap+Avoided" alt="ETH Trap Avoided">
                <p class="image-caption">Chart ETH/USDT với whale distribution warning</p>
            </div>

            <div class="highlight-box gold">
                <p style="margin-bottom: 0;"><strong>🛡️ Bài Học:</strong> Whale inflow lớn tại resistance = Distribution signal. Đừng FOMO theo retail sentiment khi whale đang bán.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">❌</div>
            <h2 class="section-title">Case Study #3: False Signal</h2>

            <div class="case-study-box" style="border-color: #EF4444;">
                <h4 style="color: #EF4444;">🔴 SOL/USDT - Whale Alert Gây Hiểu Lầm</h4>
                <p>Ngày 18/12/2024, whale alert lớn nhưng hóa ra là exchange rebalancing.</p>
            </div>

            <div class="whale-alert-box">
                <span class="icon">🐋</span>
                <span class="amount">500,000 SOL</span> ($55M) transferred from
                <span class="direction sell">Binance Hot Wallet → Binance Cold Wallet</span>
            </div>

            <p><strong>Vấn Đề:</strong> Alert này trông như whale rút tiền khỏi sàn (bullish), nhưng thực ra chỉ là Binance di chuyển nội bộ.</p>

            <h4 style="color: #ffffff; margin: 1rem 0 0.5rem;">Những Trader Đã Mắc Lỗi:</h4>
            <ul>
                <li>Không kiểm tra wallet addresses để xác minh</li>
                <li>Vào Long ngay sau alert mà không chờ confluence</li>
                <li>Bỏ qua việc SOL đang ở mid-range (không có zone)</li>
            </ul>

            <h4 style="color: #ffffff; margin: 1rem 0 0.5rem;">Cách Phát Hiện False Signal:</h4>
            <ul>
                <li><strong>Check wallet labels:</strong> Etherscan/Solscan có label cho exchange wallets</li>
                <li><strong>Pattern không có:</strong> SOL không ở GEM zone nào</li>
                <li><strong>Confluence thấp:</strong> Chỉ có 1/5 factor (whale alert alone)</li>
            </ul>

            <div class="result-box">
                <div>
                    <div class="result-value negative">-4.2%</div>
                    <div class="result-label">Lỗ Nếu Trade</div>
                </div>
                <div>
                    <div class="result-value">1/5</div>
                    <div class="result-label">Confluence (Quá Thấp)</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/EF4444?text=SOL+False+Whale+Signal" alt="SOL False Signal">
                <p class="image-caption">Ví dụ whale alert gây hiểu lầm</p>
            </div>

            <div class="highlight-box red">
                <p style="margin-bottom: 0;"><strong>⚠️ Bài Học:</strong> Whale alert alone = 1/5 confluence. LUÔN kiểm tra wallet source và đợi đủ confluence trước khi trade.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Tổng Kết 3 Case Studies</h2>

            <div class="highlight-box">
                <p><strong>🎯 Key Takeaways:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li><strong>Case 1:</strong> Multiple outflows + GEM zone = High probability accumulation</li>
                    <li><strong>Case 2:</strong> Large inflow at resistance = Distribution warning</li>
                    <li><strong>Case 3:</strong> Single alert without confluence = Potential false signal</li>
                </ul>
            </div>

            <p>Pattern rõ ràng từ 3 cases:</p>
            <ol>
                <li><strong>High confluence (4-5/5)</strong> → Proceed with trade</li>
                <li><strong>Medium (3/5)</strong> → Wait for more confirmation</li>
                <li><strong>Low (1-2/5)</strong> → Skip, không đủ evidence</li>
            </ol>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=3+Case+Studies+Summary" alt="Tổng Kết 3 Cases">
                <p class="image-caption">Infographic tổng kết 3 case studies whale tracking</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>Multiple whale outflows</strong> tại support = Accumulation signal mạnh</li>
                <li><strong>Large inflows</strong> tại resistance = Distribution warning</li>
                <li><strong>Single alert</strong> mà không có confluence = Potential trap</li>
                <li><strong>Luôn verify</strong> wallet source (exchange internal vs real whale)</li>
                <li><strong>Confluence 4-5/5</strong> mới đủ để trade với confidence</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Trong Case Study #1, yếu tố nào cho thấy đây là accumulation phase?</p>
                <button class="quiz-option" data-index="0">Một whale alert duy nhất</button>
                <button class="quiz-option" data-index="1">Nhiều whale outflows từ nhiều sàn cùng lúc</button>
                <button class="quiz-option" data-index="2">Giá đang tăng mạnh</button>
                <button class="quiz-option" data-index="3">Volume thấp bất thường</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Trong Case Study #3, whale alert gây hiểu lầm vì lý do gì?</p>
                <button class="quiz-option" data-index="0">Whale Alert bot bị lỗi</button>
                <button class="quiz-option" data-index="1">Số lượng SOL quá nhỏ</button>
                <button class="quiz-option" data-index="2">Đây là exchange internal transfer, không phải whale thực</button>
                <button class="quiz-option" data-index="3">Market đang sideway</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">3. Bài học quan trọng nhất từ Case Study #2 là gì?</p>
                <button class="quiz-option" data-index="0">Whale inflow lớn tại resistance là warning signal</button>
                <button class="quiz-option" data-index="1">Luôn follow retail sentiment</button>
                <button class="quiz-option" data-index="2">ETH không bao giờ dump</button>
                <button class="quiz-option" data-index="3">Whale alert không quan trọng</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-score">
                <p class="quiz-score-text">Bạn trả lời đúng <span id="correct-count">0</span>/3 câu hỏi!</p>
                <button class="retake-btn" onclick="location.reload()">Làm Lại Quiz</button>
            </div>
        </section>

        <footer class="lesson-footer">
            <p>GEM Trading Academy - Tier 3 Elite</p>
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
