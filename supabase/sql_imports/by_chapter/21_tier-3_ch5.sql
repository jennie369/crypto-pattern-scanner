-- =====================================================
-- TIER-3 - Chương 5: Risk Management Elite
-- Course: course-tier3-trading-mastery
-- File 21/23
-- =====================================================

-- Create/Update Module
INSERT INTO course_modules (id, course_id, title, description, order_index, created_at, updated_at)
VALUES (
  'module-tier-3-ch5',
  'course-tier3-trading-mastery',
  'Chương 5: Risk Management Elite',
  'Quản lý rủi ro bậc thầy',
  5,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- Lesson 5.1: Quản Lý Danh Mục
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch5-l1',
  'module-tier-3-ch5',
  'course-tier3-trading-mastery',
  'Bài 5.1: Quản Lý Danh Mục',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 5.1: Quản Lý Danh Mục | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #10B981; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #10B981; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #10B981, #059669); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255,189,89,0.15), rgba(245,158,11,0.1)); border-color: rgba(255,189,89,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #10B981; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .allocation-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 1rem 0; }
        .allocation-card { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; text-align: center; border-top: 3px solid #10B981; }
        .allocation-card h4 { color: #ffffff; font-size: 0.9rem; margin-bottom: 0.5rem; }
        .allocation-card .percent { font-size: 1.5rem; font-weight: 700; color: #10B981; }
        .allocation-card .detail { font-size: 0.8rem; color: #a1a1aa; margin-top: 0.25rem; }
        .sector-table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        .sector-table th, .sector-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #27272a; }
        .sector-table th { background: #1a1a2e; color: #a1a1aa; font-weight: 600; font-size: 0.85rem; }
        .sector-table td { color: #d4d4d8; }
        .sector-table .sector-name { color: #ffffff; font-weight: 500; }
        .correlation-grid { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin: 1rem 0; font-size: 0.85rem; }
        .correlation-header { display: grid; grid-template-columns: 80px repeat(4, 1fr); gap: 0.5rem; font-weight: 600; color: #a1a1aa; margin-bottom: 0.5rem; text-align: center; }
        .correlation-row { display: grid; grid-template-columns: 80px repeat(4, 1fr); gap: 0.5rem; margin-bottom: 0.25rem; text-align: center; }
        .correlation-row .label { color: #ffffff; text-align: left; }
        .correlation-cell { padding: 0.25rem; border-radius: 4px; }
        .correlation-cell.high { background: rgba(239,68,68,0.3); color: #EF4444; }
        .correlation-cell.medium { background: rgba(255,189,89,0.3); color: #FFBD59; }
        .correlation-cell.low { background: rgba(16,185,129,0.3); color: #10B981; }
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
        .quiz-option:hover { border-color: #10B981; background: rgba(16,185,129,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(16,185,129,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .allocation-grid { grid-template-columns: repeat(2, 1fr); }
            .sector-table { font-size: 0.85rem; }
            .correlation-header, .correlation-row { font-size: 0.75rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">Quản Lý Danh Mục</h1>
            <p class="lesson-subtitle">Đa Dạng Hóa & Phân Bổ Vốn Chuyên Nghiệp</p>
        </header>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Tại Sao Cần Quản Lý Danh Mục?</h2>
            <p>Ở Tier 1 và Tier 2, bạn học cách trade từng lệnh riêng lẻ. Tier 3 Elite nâng cao lên việc <strong style="color: #10B981;">quản lý danh mục tổng thể</strong> như một fund manager chuyên nghiệp.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Nguyên Tắc Cốt Lõi:</strong> "Don''t put all eggs in one basket" - Không bỏ tất cả trứng vào một giỏ. Diversification là key.</p>
            </div>

            <p>Lợi ích của quản lý danh mục đúng cách:</p>
            <ul>
                <li><strong>Giảm rủi ro tổng thể:</strong> Một coin dump không destroy portfolio</li>
                <li><strong>Tối ưu returns:</strong> Catch nhiều cơ hội khác nhau</li>
                <li><strong>Ổn định tâm lý:</strong> Không lo lắng quá mức về 1 vị thế</li>
                <li><strong>Scalable:</strong> Dễ dàng scale lên khi vốn lớn hơn</li>
            </ul>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Portfolio+Management+Benefits" alt="Portfolio Benefits">
                <p class="image-caption">Lợi ích của quản lý danh mục chuyên nghiệp</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">💰</div>
            <h2 class="section-title">Mô Hình Phân Bổ Vốn</h2>
            <p>GEM Academy khuyến nghị mô hình phân bổ sau cho Elite Traders:</p>

            <div class="allocation-grid">
                <div class="allocation-card">
                    <h4>🟢 Core Holdings</h4>
                    <div class="percent">50%</div>
                    <div class="detail">BTC, ETH (HODL)</div>
                </div>
                <div class="allocation-card" style="border-top-color: #FFBD59;">
                    <h4>🟡 Active Trading</h4>
                    <div class="percent" style="color: #FFBD59;">30%</div>
                    <div class="detail">GEM Pattern Trades</div>
                </div>
                <div class="allocation-card" style="border-top-color: #6366F1;">
                    <h4>🟣 High Risk</h4>
                    <div class="percent" style="color: #6366F1;">15%</div>
                    <div class="detail">New narratives</div>
                </div>
                <div class="allocation-card" style="border-top-color: #00F0FF;">
                    <h4>🔵 Cash Reserve</h4>
                    <div class="percent" style="color: #00F0FF;">5%</div>
                    <div class="detail">Stablecoins</div>
                </div>
            </div>

            <div class="highlight-box gold">
                <p><strong>📏 Quy Tắc Vàng:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li>Core Holdings (50%): Không trade, chỉ HODL long-term</li>
                    <li>Active Trading (30%): Sử dụng GEM patterns, max 5 vị thế mở</li>
                    <li>High Risk (15%): Chấp nhận có thể mất, tìm 10x-100x</li>
                    <li>Cash Reserve (5%): Luôn có tiền mặt cho cơ hội đột xuất</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=Portfolio+Allocation+Pie+Chart" alt="Portfolio Allocation">
                <p class="image-caption">Biểu đồ phân bổ danh mục theo mô hình GEM</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🏭</div>
            <h2 class="section-title">Phân Bổ Theo Lĩnh Vực</h2>
            <p>Trong phần Active Trading (30%), nên đa dạng theo sector để giảm sector-specific risk:</p>

            <table class="sector-table">
                <thead>
                    <tr>
                        <th>Sector</th>
                        <th>Tỷ Lệ</th>
                        <th>Ví Dụ</th>
                        <th>Đặc Điểm</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="sector-name">Layer 1</td>
                        <td>25%</td>
                        <td>SOL, AVAX, SUI</td>
                        <td>Stable, high liquidity</td>
                    </tr>
                    <tr>
                        <td class="sector-name">DeFi</td>
                        <td>20%</td>
                        <td>UNI, AAVE, MKR</td>
                        <td>Yield, utility</td>
                    </tr>
                    <tr>
                        <td class="sector-name">AI/Data</td>
                        <td>20%</td>
                        <td>FET, RNDR, TAO</td>
                        <td>High growth potential</td>
                    </tr>
                    <tr>
                        <td class="sector-name">Gaming</td>
                        <td>15%</td>
                        <td>IMX, GALA, AXS</td>
                        <td>Volatile, narrative-driven</td>
                    </tr>
                    <tr>
                        <td class="sector-name">Meme/Social</td>
                        <td>10%</td>
                        <td>DOGE, SHIB, PEPE</td>
                        <td>Very high risk</td>
                    </tr>
                    <tr>
                        <td class="sector-name">Infrastructure</td>
                        <td>10%</td>
                        <td>LINK, GRT, AR</td>
                        <td>Essential services</td>
                    </tr>
                </tbody>
            </table>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/6366F1?text=Sector+Allocation+Chart" alt="Sector Allocation">
                <p class="image-caption">Phân bổ Active Trading theo sector</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🔗</div>
            <h2 class="section-title">Phân Tích Tương Quan</h2>
            <p>Hiểu correlation giữa các coins để tránh "fake diversification" - tưởng đa dạng nhưng thực ra cùng move:</p>

            <div class="correlation-grid">
                <div class="correlation-header">
                    <span></span>
                    <span>BTC</span>
                    <span>ETH</span>
                    <span>SOL</span>
                    <span>LINK</span>
                </div>
                <div class="correlation-row">
                    <span class="label">BTC</span>
                    <span class="correlation-cell">1.00</span>
                    <span class="correlation-cell high">0.85</span>
                    <span class="correlation-cell high">0.78</span>
                    <span class="correlation-cell medium">0.62</span>
                </div>
                <div class="correlation-row">
                    <span class="label">ETH</span>
                    <span class="correlation-cell high">0.85</span>
                    <span class="correlation-cell">1.00</span>
                    <span class="correlation-cell high">0.82</span>
                    <span class="correlation-cell medium">0.71</span>
                </div>
                <div class="correlation-row">
                    <span class="label">SOL</span>
                    <span class="correlation-cell high">0.78</span>
                    <span class="correlation-cell high">0.82</span>
                    <span class="correlation-cell">1.00</span>
                    <span class="correlation-cell medium">0.65</span>
                </div>
                <div class="correlation-row">
                    <span class="label">LINK</span>
                    <span class="correlation-cell medium">0.62</span>
                    <span class="correlation-cell medium">0.71</span>
                    <span class="correlation-cell medium">0.65</span>
                    <span class="correlation-cell">1.00</span>
                </div>
            </div>

            <div class="highlight-box">
                <p><strong>📊 Đọc Correlation:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li><strong style="color: #EF4444;">0.7-1.0 (High):</strong> Move cùng chiều, không thực sự đa dạng</li>
                    <li><strong style="color: #FFBD59;">0.4-0.7 (Medium):</strong> Có correlation nhưng độc lập phần nào</li>
                    <li><strong style="color: #10B981;">0-0.4 (Low):</strong> Độc lập, tốt cho diversification</li>
                </ul>
            </div>

            <p><strong>Implication:</strong> BTC-ETH-SOL có correlation cao (~0.8). Nếu hold cả 3 với tỷ lệ lớn, bạn không thực sự diversified. Cần thêm assets với correlation thấp.</p>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/00F0FF?text=Correlation+Matrix+Heatmap" alt="Correlation Matrix">
                <p class="image-caption">Heatmap correlation giữa các cryptocurrencies</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⚖️</div>
            <h2 class="section-title">Rebalancing Strategy</h2>
            <p>Danh mục cần được rebalance định kỳ để duy trì tỷ lệ mục tiêu:</p>

            <ul>
                <li><strong>Monthly rebalance:</strong> Review và điều chỉnh mỗi tháng</li>
                <li><strong>Threshold rebalance:</strong> Khi allocation lệch >5% so với target</li>
                <li><strong>Event-driven:</strong> Sau major market moves hoặc thay đổi thesis</li>
            </ul>

            <div class="highlight-box gold">
                <p><strong>💡 Ví Dụ Rebalance:</strong></p>
                <p style="margin-bottom: 0;">Core Holdings tăng từ 50% lên 60% do BTC pump mạnh → Bán 10% BTC, chuyển sang Active Trading hoặc Cash Reserve để về lại 50%.</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>Mô hình 50-30-15-5:</strong> Core, Active, High Risk, Cash</li>
                <li><strong>Diversify theo sector:</strong> Layer 1, DeFi, AI, Gaming...</li>
                <li><strong>Hiểu correlation:</strong> Tránh fake diversification</li>
                <li><strong>Rebalance định kỳ:</strong> Monthly hoặc khi lệch >5%</li>
                <li><strong>Max 5 vị thế mở</strong> trong Active Trading</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Trong mô hình GEM, tỷ lệ nào dành cho Active Trading?</p>
                <button class="quiz-option" data-index="0">50%</button>
                <button class="quiz-option" data-index="1">30%</button>
                <button class="quiz-option" data-index="2">15%</button>
                <button class="quiz-option" data-index="3">5%</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Correlation 0.85 giữa BTC và ETH có nghĩa là?</p>
                <button class="quiz-option" data-index="0">Chúng move ngược chiều nhau</button>
                <button class="quiz-option" data-index="1">Chúng hoàn toàn độc lập</button>
                <button class="quiz-option" data-index="2">Chúng thường move cùng chiều, không thực sự đa dạng</button>
                <button class="quiz-option" data-index="3">ETH mạnh hơn BTC 85%</button>
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
    <title>Bài 5.1: Quản Lý Danh Mục | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #10B981; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #10B981; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #10B981, #059669); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255,189,89,0.15), rgba(245,158,11,0.1)); border-color: rgba(255,189,89,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #10B981; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .allocation-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 1rem 0; }
        .allocation-card { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; text-align: center; border-top: 3px solid #10B981; }
        .allocation-card h4 { color: #ffffff; font-size: 0.9rem; margin-bottom: 0.5rem; }
        .allocation-card .percent { font-size: 1.5rem; font-weight: 700; color: #10B981; }
        .allocation-card .detail { font-size: 0.8rem; color: #a1a1aa; margin-top: 0.25rem; }
        .sector-table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        .sector-table th, .sector-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #27272a; }
        .sector-table th { background: #1a1a2e; color: #a1a1aa; font-weight: 600; font-size: 0.85rem; }
        .sector-table td { color: #d4d4d8; }
        .sector-table .sector-name { color: #ffffff; font-weight: 500; }
        .correlation-grid { background: #0a0a0f; border-radius: 8px; padding: 1rem; margin: 1rem 0; font-size: 0.85rem; }
        .correlation-header { display: grid; grid-template-columns: 80px repeat(4, 1fr); gap: 0.5rem; font-weight: 600; color: #a1a1aa; margin-bottom: 0.5rem; text-align: center; }
        .correlation-row { display: grid; grid-template-columns: 80px repeat(4, 1fr); gap: 0.5rem; margin-bottom: 0.25rem; text-align: center; }
        .correlation-row .label { color: #ffffff; text-align: left; }
        .correlation-cell { padding: 0.25rem; border-radius: 4px; }
        .correlation-cell.high { background: rgba(239,68,68,0.3); color: #EF4444; }
        .correlation-cell.medium { background: rgba(255,189,89,0.3); color: #FFBD59; }
        .correlation-cell.low { background: rgba(16,185,129,0.3); color: #10B981; }
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
        .quiz-option:hover { border-color: #10B981; background: rgba(16,185,129,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(16,185,129,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .allocation-grid { grid-template-columns: repeat(2, 1fr); }
            .sector-table { font-size: 0.85rem; }
            .correlation-header, .correlation-row { font-size: 0.75rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">Quản Lý Danh Mục</h1>
            <p class="lesson-subtitle">Đa Dạng Hóa & Phân Bổ Vốn Chuyên Nghiệp</p>
        </header>

        <section class="content-section">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Tại Sao Cần Quản Lý Danh Mục?</h2>
            <p>Ở Tier 1 và Tier 2, bạn học cách trade từng lệnh riêng lẻ. Tier 3 Elite nâng cao lên việc <strong style="color: #10B981;">quản lý danh mục tổng thể</strong> như một fund manager chuyên nghiệp.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Nguyên Tắc Cốt Lõi:</strong> "Don''t put all eggs in one basket" - Không bỏ tất cả trứng vào một giỏ. Diversification là key.</p>
            </div>

            <p>Lợi ích của quản lý danh mục đúng cách:</p>
            <ul>
                <li><strong>Giảm rủi ro tổng thể:</strong> Một coin dump không destroy portfolio</li>
                <li><strong>Tối ưu returns:</strong> Catch nhiều cơ hội khác nhau</li>
                <li><strong>Ổn định tâm lý:</strong> Không lo lắng quá mức về 1 vị thế</li>
                <li><strong>Scalable:</strong> Dễ dàng scale lên khi vốn lớn hơn</li>
            </ul>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Portfolio+Management+Benefits" alt="Portfolio Benefits">
                <p class="image-caption">Lợi ích của quản lý danh mục chuyên nghiệp</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">💰</div>
            <h2 class="section-title">Mô Hình Phân Bổ Vốn</h2>
            <p>GEM Academy khuyến nghị mô hình phân bổ sau cho Elite Traders:</p>

            <div class="allocation-grid">
                <div class="allocation-card">
                    <h4>🟢 Core Holdings</h4>
                    <div class="percent">50%</div>
                    <div class="detail">BTC, ETH (HODL)</div>
                </div>
                <div class="allocation-card" style="border-top-color: #FFBD59;">
                    <h4>🟡 Active Trading</h4>
                    <div class="percent" style="color: #FFBD59;">30%</div>
                    <div class="detail">GEM Pattern Trades</div>
                </div>
                <div class="allocation-card" style="border-top-color: #6366F1;">
                    <h4>🟣 High Risk</h4>
                    <div class="percent" style="color: #6366F1;">15%</div>
                    <div class="detail">New narratives</div>
                </div>
                <div class="allocation-card" style="border-top-color: #00F0FF;">
                    <h4>🔵 Cash Reserve</h4>
                    <div class="percent" style="color: #00F0FF;">5%</div>
                    <div class="detail">Stablecoins</div>
                </div>
            </div>

            <div class="highlight-box gold">
                <p><strong>📏 Quy Tắc Vàng:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li>Core Holdings (50%): Không trade, chỉ HODL long-term</li>
                    <li>Active Trading (30%): Sử dụng GEM patterns, max 5 vị thế mở</li>
                    <li>High Risk (15%): Chấp nhận có thể mất, tìm 10x-100x</li>
                    <li>Cash Reserve (5%): Luôn có tiền mặt cho cơ hội đột xuất</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=Portfolio+Allocation+Pie+Chart" alt="Portfolio Allocation">
                <p class="image-caption">Biểu đồ phân bổ danh mục theo mô hình GEM</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🏭</div>
            <h2 class="section-title">Phân Bổ Theo Lĩnh Vực</h2>
            <p>Trong phần Active Trading (30%), nên đa dạng theo sector để giảm sector-specific risk:</p>

            <table class="sector-table">
                <thead>
                    <tr>
                        <th>Sector</th>
                        <th>Tỷ Lệ</th>
                        <th>Ví Dụ</th>
                        <th>Đặc Điểm</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="sector-name">Layer 1</td>
                        <td>25%</td>
                        <td>SOL, AVAX, SUI</td>
                        <td>Stable, high liquidity</td>
                    </tr>
                    <tr>
                        <td class="sector-name">DeFi</td>
                        <td>20%</td>
                        <td>UNI, AAVE, MKR</td>
                        <td>Yield, utility</td>
                    </tr>
                    <tr>
                        <td class="sector-name">AI/Data</td>
                        <td>20%</td>
                        <td>FET, RNDR, TAO</td>
                        <td>High growth potential</td>
                    </tr>
                    <tr>
                        <td class="sector-name">Gaming</td>
                        <td>15%</td>
                        <td>IMX, GALA, AXS</td>
                        <td>Volatile, narrative-driven</td>
                    </tr>
                    <tr>
                        <td class="sector-name">Meme/Social</td>
                        <td>10%</td>
                        <td>DOGE, SHIB, PEPE</td>
                        <td>Very high risk</td>
                    </tr>
                    <tr>
                        <td class="sector-name">Infrastructure</td>
                        <td>10%</td>
                        <td>LINK, GRT, AR</td>
                        <td>Essential services</td>
                    </tr>
                </tbody>
            </table>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/6366F1?text=Sector+Allocation+Chart" alt="Sector Allocation">
                <p class="image-caption">Phân bổ Active Trading theo sector</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🔗</div>
            <h2 class="section-title">Phân Tích Tương Quan</h2>
            <p>Hiểu correlation giữa các coins để tránh "fake diversification" - tưởng đa dạng nhưng thực ra cùng move:</p>

            <div class="correlation-grid">
                <div class="correlation-header">
                    <span></span>
                    <span>BTC</span>
                    <span>ETH</span>
                    <span>SOL</span>
                    <span>LINK</span>
                </div>
                <div class="correlation-row">
                    <span class="label">BTC</span>
                    <span class="correlation-cell">1.00</span>
                    <span class="correlation-cell high">0.85</span>
                    <span class="correlation-cell high">0.78</span>
                    <span class="correlation-cell medium">0.62</span>
                </div>
                <div class="correlation-row">
                    <span class="label">ETH</span>
                    <span class="correlation-cell high">0.85</span>
                    <span class="correlation-cell">1.00</span>
                    <span class="correlation-cell high">0.82</span>
                    <span class="correlation-cell medium">0.71</span>
                </div>
                <div class="correlation-row">
                    <span class="label">SOL</span>
                    <span class="correlation-cell high">0.78</span>
                    <span class="correlation-cell high">0.82</span>
                    <span class="correlation-cell">1.00</span>
                    <span class="correlation-cell medium">0.65</span>
                </div>
                <div class="correlation-row">
                    <span class="label">LINK</span>
                    <span class="correlation-cell medium">0.62</span>
                    <span class="correlation-cell medium">0.71</span>
                    <span class="correlation-cell medium">0.65</span>
                    <span class="correlation-cell">1.00</span>
                </div>
            </div>

            <div class="highlight-box">
                <p><strong>📊 Đọc Correlation:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li><strong style="color: #EF4444;">0.7-1.0 (High):</strong> Move cùng chiều, không thực sự đa dạng</li>
                    <li><strong style="color: #FFBD59;">0.4-0.7 (Medium):</strong> Có correlation nhưng độc lập phần nào</li>
                    <li><strong style="color: #10B981;">0-0.4 (Low):</strong> Độc lập, tốt cho diversification</li>
                </ul>
            </div>

            <p><strong>Implication:</strong> BTC-ETH-SOL có correlation cao (~0.8). Nếu hold cả 3 với tỷ lệ lớn, bạn không thực sự diversified. Cần thêm assets với correlation thấp.</p>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/00F0FF?text=Correlation+Matrix+Heatmap" alt="Correlation Matrix">
                <p class="image-caption">Heatmap correlation giữa các cryptocurrencies</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⚖️</div>
            <h2 class="section-title">Rebalancing Strategy</h2>
            <p>Danh mục cần được rebalance định kỳ để duy trì tỷ lệ mục tiêu:</p>

            <ul>
                <li><strong>Monthly rebalance:</strong> Review và điều chỉnh mỗi tháng</li>
                <li><strong>Threshold rebalance:</strong> Khi allocation lệch >5% so với target</li>
                <li><strong>Event-driven:</strong> Sau major market moves hoặc thay đổi thesis</li>
            </ul>

            <div class="highlight-box gold">
                <p><strong>💡 Ví Dụ Rebalance:</strong></p>
                <p style="margin-bottom: 0;">Core Holdings tăng từ 50% lên 60% do BTC pump mạnh → Bán 10% BTC, chuyển sang Active Trading hoặc Cash Reserve để về lại 50%.</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>Mô hình 50-30-15-5:</strong> Core, Active, High Risk, Cash</li>
                <li><strong>Diversify theo sector:</strong> Layer 1, DeFi, AI, Gaming...</li>
                <li><strong>Hiểu correlation:</strong> Tránh fake diversification</li>
                <li><strong>Rebalance định kỳ:</strong> Monthly hoặc khi lệch >5%</li>
                <li><strong>Max 5 vị thế mở</strong> trong Active Trading</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Trong mô hình GEM, tỷ lệ nào dành cho Active Trading?</p>
                <button class="quiz-option" data-index="0">50%</button>
                <button class="quiz-option" data-index="1">30%</button>
                <button class="quiz-option" data-index="2">15%</button>
                <button class="quiz-option" data-index="3">5%</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Correlation 0.85 giữa BTC và ETH có nghĩa là?</p>
                <button class="quiz-option" data-index="0">Chúng move ngược chiều nhau</button>
                <button class="quiz-option" data-index="1">Chúng hoàn toàn độc lập</button>
                <button class="quiz-option" data-index="2">Chúng thường move cùng chiều, không thực sự đa dạng</button>
                <button class="quiz-option" data-index="3">ETH mạnh hơn BTC 85%</button>
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

-- Lesson 5.2: Kiểm Soát Drawdown
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch5-l2',
  'module-tier-3-ch5',
  'course-tier3-trading-mastery',
  'Bài 5.2: Kiểm Soát Drawdown',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 5.2: Kiểm Soát Drawdown | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #10B981; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #10B981; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #10B981, #059669); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.red { background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.1)); border-color: rgba(239,68,68,0.4); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255,189,89,0.15), rgba(245,158,11,0.1)); border-color: rgba(255,189,89,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #10B981; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .drawdown-meter { background: #0a0a0f; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; }
        .drawdown-bar { height: 32px; background: #1a1a2e; border-radius: 4px; overflow: hidden; margin: 0.75rem 0; position: relative; }
        .drawdown-fill { height: 100%; position: absolute; left: 0; top: 0; display: flex; align-items: center; padding-left: 0.75rem; font-weight: 600; font-size: 0.85rem; }
        .drawdown-fill.safe { background: linear-gradient(90deg, #10B981, #059669); width: 50%; color: white; }
        .drawdown-fill.warning { background: linear-gradient(90deg, #FFBD59, #F59E0B); width: 75%; color: #0a0a0f; }
        .drawdown-fill.danger { background: linear-gradient(90deg, #EF4444, #DC2626); width: 100%; color: white; }
        .drawdown-label { font-size: 0.9rem; color: #a1a1aa; display: flex; justify-content: space-between; }
        .rule-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #10B981; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .rule-card.warning { border-color: #FFBD59; }
        .rule-card.danger { border-color: #EF4444; }
        .rule-card h4 { font-size: 1.1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .rule-card h4.safe { color: #10B981; }
        .rule-card h4.warning { color: #FFBD59; }
        .rule-card h4.danger { color: #EF4444; }
        .recovery-table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        .recovery-table th, .recovery-table td { padding: 0.75rem; text-align: center; border-bottom: 1px solid #27272a; }
        .recovery-table th { background: #1a1a2e; color: #a1a1aa; font-weight: 600; font-size: 0.85rem; }
        .recovery-table td { color: #d4d4d8; }
        .recovery-table .loss { color: #EF4444; }
        .recovery-table .gain { color: #10B981; }
        .circuit-breaker { background: #0a0a0f; border: 2px solid #EF4444; border-radius: 8px; padding: 1.25rem; margin: 1rem 0; }
        .circuit-breaker h4 { color: #EF4444; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
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
        .quiz-option:hover { border-color: #10B981; background: rgba(16,185,129,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(16,185,129,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">Kiểm Soát Drawdown</h1>
            <p class="lesson-subtitle">Bảo Vệ Vốn Khỏi Thua Lỗ Quá Mức</p>
        </header>

        <section class="content-section">
            <div class="section-icon">📉</div>
            <h2 class="section-title">Drawdown Là Gì?</h2>
            <p><strong style="color: #EF4444;">Drawdown</strong> là phần trăm giảm từ đỉnh cao nhất của tài khoản xuống đáy thấp nhất. Đây là chỉ số quan trọng nhất để đánh giá rủi ro thực sự.</p>

            <div class="highlight-box">
                <p><strong>📊 Công Thức:</strong></p>
                <p style="margin-bottom: 0; font-family: monospace; color: #10B981;">Drawdown = (Peak Value - Current Value) / Peak Value × 100%</p>
            </div>

            <p><strong>Ví dụ:</strong> Tài khoản từ $100,000 giảm xuống $85,000 = Drawdown 15%</p>

            <div class="drawdown-meter">
                <div class="drawdown-label">
                    <span>Drawdown Level</span>
                    <span>Risk Status</span>
                </div>
                <div class="drawdown-bar">
                    <div class="drawdown-fill safe">0-5% SAFE</div>
                </div>
                <div class="drawdown-bar">
                    <div class="drawdown-fill warning">5-10% WARNING</div>
                </div>
                <div class="drawdown-bar">
                    <div class="drawdown-fill danger">10%+ DANGER</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/EF4444?text=Drawdown+Visualization+Chart" alt="Drawdown Chart">
                <p class="image-caption">Visualization của drawdown trên equity curve</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⚠️</div>
            <h2 class="section-title">Toán Học Của Recovery</h2>
            <p>Điều nguy hiểm về drawdown: <strong style="color: #EF4444;">Recovery khó hơn loss rất nhiều</strong>. Hãy xem bảng sau:</p>

            <table class="recovery-table">
                <thead>
                    <tr>
                        <th>Drawdown</th>
                        <th>% Cần Để Recovery</th>
                        <th>Độ Khó</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="loss">-10%</td>
                        <td class="gain">+11.1%</td>
                        <td>Dễ</td>
                    </tr>
                    <tr>
                        <td class="loss">-20%</td>
                        <td class="gain">+25%</td>
                        <td>Trung bình</td>
                    </tr>
                    <tr>
                        <td class="loss">-30%</td>
                        <td class="gain">+43%</td>
                        <td>Khó</td>
                    </tr>
                    <tr>
                        <td class="loss">-50%</td>
                        <td class="gain">+100%</td>
                        <td>Rất khó</td>
                    </tr>
                    <tr>
                        <td class="loss">-75%</td>
                        <td class="gain">+300%</td>
                        <td>Gần như impossible</td>
                    </tr>
                </tbody>
            </table>

            <div class="highlight-box red">
                <p style="margin-bottom: 0;"><strong>🚨 Insight Quan Trọng:</strong> Mất 50% cần lãi 100% để về hòa. Đây là lý do drawdown control quan trọng hơn chasing profits!</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=Recovery+Math+Visualization" alt="Recovery Math">
                <p class="image-caption">Mối quan hệ giữa drawdown và recovery requirement</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📏</div>
            <h2 class="section-title">Quy Tắc Drawdown Tối Đa</h2>
            <p>GEM Academy đặt ra các ngưỡng drawdown rõ ràng với actions tương ứng:</p>

            <div class="rule-card">
                <h4 class="safe">🟢 0-5% Drawdown: Normal Zone</h4>
                <ul style="margin-bottom: 0;">
                    <li>Trading bình thường, full position size</li>
                    <li>Có thể có tối đa 5 vị thế mở</li>
                    <li>Tập trung vào tìm high-quality setups</li>
                </ul>
            </div>

            <div class="rule-card warning">
                <h4 class="warning">🟡 5-10% Drawdown: Caution Zone</h4>
                <ul style="margin-bottom: 0;">
                    <li>Giảm position size xuống 50%</li>
                    <li>Tối đa 3 vị thế mở</li>
                    <li>Chỉ trade A+ setups (confluence 4-5/5)</li>
                    <li>Review trading journal để tìm nguyên nhân</li>
                </ul>
            </div>

            <div class="rule-card danger">
                <h4 class="danger">🔴 10%+ Drawdown: Danger Zone</h4>
                <ul style="margin-bottom: 0;">
                    <li><strong>NGỪNG TRADING ngay lập tức</strong></li>
                    <li>Đóng tất cả vị thế rủi ro</li>
                    <li>Nghỉ ngơi ít nhất 48-72 giờ</li>
                    <li>Review toàn bộ strategy trước khi quay lại</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Drawdown+Zones+Rules" alt="Drawdown Zones">
                <p class="image-caption">Ba zones drawdown và actions tương ứng</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🔌</div>
            <h2 class="section-title">Circuit Breakers</h2>
            <p>"Circuit breaker" là cơ chế tự động dừng trading khi đạt ngưỡng thua lỗ nhất định:</p>

            <div class="circuit-breaker">
                <h4>⚡ Daily Circuit Breaker</h4>
                <p style="margin-bottom: 0;"><strong>Trigger:</strong> Thua 3 lệnh liên tiếp HOẶC mất 2% tài khoản trong ngày<br>
                <strong>Action:</strong> Ngừng trading trong ngày, review journal</p>
            </div>

            <div class="circuit-breaker">
                <h4>⚡ Weekly Circuit Breaker</h4>
                <p style="margin-bottom: 0;"><strong>Trigger:</strong> Drawdown 5% trong tuần<br>
                <strong>Action:</strong> Giảm size 50%, chỉ trade A+ setups</p>
            </div>

            <div class="circuit-breaker">
                <h4>⚡ Monthly Circuit Breaker</h4>
                <p style="margin-bottom: 0;"><strong>Trigger:</strong> Drawdown 10% trong tháng<br>
                <strong>Action:</strong> NGỪNG trading hoàn toàn, seek mentorship</p>
            </div>

            <div class="highlight-box gold">
                <p style="margin-bottom: 0;"><strong>💡 Tại Sao Circuit Breakers Quan Trọng?</strong> Chúng ngăn chặn "revenge trading" và "tilt" - hai kẻ thù lớn nhất khi đang thua.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📈</div>
            <h2 class="section-title">Chiến Lược Phục Hồi</h2>
            <p>Khi đã vào vùng drawdown, đây là cách phục hồi an toàn:</p>

            <ol>
                <li><strong>Acknowledge và accept:</strong> Không denial, chấp nhận thực tế</li>
                <li><strong>Stop the bleeding:</strong> Đóng vị thế thua, không average down</li>
                <li><strong>Rest và review:</strong> Nghỉ ngơi, đọc lại journal để hiểu tại sao</li>
                <li><strong>Reduce size:</strong> Khi quay lại, trade với size nhỏ hơn</li>
                <li><strong>Build confidence:</strong> Tập trung win rate trước, size sau</li>
            </ol>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🎯 Recovery Mantra:</strong> "Slow and steady wins the race." Đừng cố gấp đôi size để "gỡ" nhanh - đây là cách nhanh nhất để thua thêm.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=Recovery+Strategy+Flowchart" alt="Recovery Strategy">
                <p class="image-caption">Flowchart chiến lược phục hồi sau drawdown</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>Drawdown</strong> = % giảm từ đỉnh xuống đáy</li>
                <li><strong>Recovery math:</strong> Mất 50% cần lãi 100% để về hòa</li>
                <li><strong>Max drawdown:</strong> 10% là ngưỡng NGỪNG TRADING</li>
                <li><strong>Circuit breakers:</strong> 3 losing trades hoặc 2% daily = stop</li>
                <li><strong>Recovery:</strong> Slow, reduce size, rebuild confidence</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">1. Nếu tài khoản mất 50%, cần bao nhiêu % lợi nhuận để về hòa?</p>
                <button class="quiz-option" data-index="0">50%</button>
                <button class="quiz-option" data-index="1">75%</button>
                <button class="quiz-option" data-index="2">100%</button>
                <button class="quiz-option" data-index="3">150%</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">2. Khi drawdown đạt 5-10%, trader nên làm gì?</p>
                <button class="quiz-option" data-index="0">Tăng size để gỡ nhanh</button>
                <button class="quiz-option" data-index="1">Giảm size 50%, chỉ trade A+ setups</button>
                <button class="quiz-option" data-index="2">Trading bình thường</button>
                <button class="quiz-option" data-index="3">Đóng tất cả vị thế và nghỉ 1 tháng</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">3. Daily Circuit Breaker trigger khi nào?</p>
                <button class="quiz-option" data-index="0">3 lệnh thua liên tiếp hoặc mất 2% trong ngày</button>
                <button class="quiz-option" data-index="1">5 lệnh thua trong tuần</button>
                <button class="quiz-option" data-index="2">Drawdown 10%</button>
                <button class="quiz-option" data-index="3">Khi market crash</button>
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
    <title>Bài 5.2: Kiểm Soát Drawdown | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #10B981; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #10B981; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #10B981, #059669); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.red { background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.1)); border-color: rgba(239,68,68,0.4); }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255,189,89,0.15), rgba(245,158,11,0.1)); border-color: rgba(255,189,89,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #10B981; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .drawdown-meter { background: #0a0a0f; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; }
        .drawdown-bar { height: 32px; background: #1a1a2e; border-radius: 4px; overflow: hidden; margin: 0.75rem 0; position: relative; }
        .drawdown-fill { height: 100%; position: absolute; left: 0; top: 0; display: flex; align-items: center; padding-left: 0.75rem; font-weight: 600; font-size: 0.85rem; }
        .drawdown-fill.safe { background: linear-gradient(90deg, #10B981, #059669); width: 50%; color: white; }
        .drawdown-fill.warning { background: linear-gradient(90deg, #FFBD59, #F59E0B); width: 75%; color: #0a0a0f; }
        .drawdown-fill.danger { background: linear-gradient(90deg, #EF4444, #DC2626); width: 100%; color: white; }
        .drawdown-label { font-size: 0.9rem; color: #a1a1aa; display: flex; justify-content: space-between; }
        .rule-card { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #10B981; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .rule-card.warning { border-color: #FFBD59; }
        .rule-card.danger { border-color: #EF4444; }
        .rule-card h4 { font-size: 1.1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .rule-card h4.safe { color: #10B981; }
        .rule-card h4.warning { color: #FFBD59; }
        .rule-card h4.danger { color: #EF4444; }
        .recovery-table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        .recovery-table th, .recovery-table td { padding: 0.75rem; text-align: center; border-bottom: 1px solid #27272a; }
        .recovery-table th { background: #1a1a2e; color: #a1a1aa; font-weight: 600; font-size: 0.85rem; }
        .recovery-table td { color: #d4d4d8; }
        .recovery-table .loss { color: #EF4444; }
        .recovery-table .gain { color: #10B981; }
        .circuit-breaker { background: #0a0a0f; border: 2px solid #EF4444; border-radius: 8px; padding: 1.25rem; margin: 1rem 0; }
        .circuit-breaker h4 { color: #EF4444; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
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
        .quiz-option:hover { border-color: #10B981; background: rgba(16,185,129,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(16,185,129,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">Kiểm Soát Drawdown</h1>
            <p class="lesson-subtitle">Bảo Vệ Vốn Khỏi Thua Lỗ Quá Mức</p>
        </header>

        <section class="content-section">
            <div class="section-icon">📉</div>
            <h2 class="section-title">Drawdown Là Gì?</h2>
            <p><strong style="color: #EF4444;">Drawdown</strong> là phần trăm giảm từ đỉnh cao nhất của tài khoản xuống đáy thấp nhất. Đây là chỉ số quan trọng nhất để đánh giá rủi ro thực sự.</p>

            <div class="highlight-box">
                <p><strong>📊 Công Thức:</strong></p>
                <p style="margin-bottom: 0; font-family: monospace; color: #10B981;">Drawdown = (Peak Value - Current Value) / Peak Value × 100%</p>
            </div>

            <p><strong>Ví dụ:</strong> Tài khoản từ $100,000 giảm xuống $85,000 = Drawdown 15%</p>

            <div class="drawdown-meter">
                <div class="drawdown-label">
                    <span>Drawdown Level</span>
                    <span>Risk Status</span>
                </div>
                <div class="drawdown-bar">
                    <div class="drawdown-fill safe">0-5% SAFE</div>
                </div>
                <div class="drawdown-bar">
                    <div class="drawdown-fill warning">5-10% WARNING</div>
                </div>
                <div class="drawdown-bar">
                    <div class="drawdown-fill danger">10%+ DANGER</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/EF4444?text=Drawdown+Visualization+Chart" alt="Drawdown Chart">
                <p class="image-caption">Visualization của drawdown trên equity curve</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⚠️</div>
            <h2 class="section-title">Toán Học Của Recovery</h2>
            <p>Điều nguy hiểm về drawdown: <strong style="color: #EF4444;">Recovery khó hơn loss rất nhiều</strong>. Hãy xem bảng sau:</p>

            <table class="recovery-table">
                <thead>
                    <tr>
                        <th>Drawdown</th>
                        <th>% Cần Để Recovery</th>
                        <th>Độ Khó</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="loss">-10%</td>
                        <td class="gain">+11.1%</td>
                        <td>Dễ</td>
                    </tr>
                    <tr>
                        <td class="loss">-20%</td>
                        <td class="gain">+25%</td>
                        <td>Trung bình</td>
                    </tr>
                    <tr>
                        <td class="loss">-30%</td>
                        <td class="gain">+43%</td>
                        <td>Khó</td>
                    </tr>
                    <tr>
                        <td class="loss">-50%</td>
                        <td class="gain">+100%</td>
                        <td>Rất khó</td>
                    </tr>
                    <tr>
                        <td class="loss">-75%</td>
                        <td class="gain">+300%</td>
                        <td>Gần như impossible</td>
                    </tr>
                </tbody>
            </table>

            <div class="highlight-box red">
                <p style="margin-bottom: 0;"><strong>🚨 Insight Quan Trọng:</strong> Mất 50% cần lãi 100% để về hòa. Đây là lý do drawdown control quan trọng hơn chasing profits!</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=Recovery+Math+Visualization" alt="Recovery Math">
                <p class="image-caption">Mối quan hệ giữa drawdown và recovery requirement</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📏</div>
            <h2 class="section-title">Quy Tắc Drawdown Tối Đa</h2>
            <p>GEM Academy đặt ra các ngưỡng drawdown rõ ràng với actions tương ứng:</p>

            <div class="rule-card">
                <h4 class="safe">🟢 0-5% Drawdown: Normal Zone</h4>
                <ul style="margin-bottom: 0;">
                    <li>Trading bình thường, full position size</li>
                    <li>Có thể có tối đa 5 vị thế mở</li>
                    <li>Tập trung vào tìm high-quality setups</li>
                </ul>
            </div>

            <div class="rule-card warning">
                <h4 class="warning">🟡 5-10% Drawdown: Caution Zone</h4>
                <ul style="margin-bottom: 0;">
                    <li>Giảm position size xuống 50%</li>
                    <li>Tối đa 3 vị thế mở</li>
                    <li>Chỉ trade A+ setups (confluence 4-5/5)</li>
                    <li>Review trading journal để tìm nguyên nhân</li>
                </ul>
            </div>

            <div class="rule-card danger">
                <h4 class="danger">🔴 10%+ Drawdown: Danger Zone</h4>
                <ul style="margin-bottom: 0;">
                    <li><strong>NGỪNG TRADING ngay lập tức</strong></li>
                    <li>Đóng tất cả vị thế rủi ro</li>
                    <li>Nghỉ ngơi ít nhất 48-72 giờ</li>
                    <li>Review toàn bộ strategy trước khi quay lại</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Drawdown+Zones+Rules" alt="Drawdown Zones">
                <p class="image-caption">Ba zones drawdown và actions tương ứng</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🔌</div>
            <h2 class="section-title">Circuit Breakers</h2>
            <p>"Circuit breaker" là cơ chế tự động dừng trading khi đạt ngưỡng thua lỗ nhất định:</p>

            <div class="circuit-breaker">
                <h4>⚡ Daily Circuit Breaker</h4>
                <p style="margin-bottom: 0;"><strong>Trigger:</strong> Thua 3 lệnh liên tiếp HOẶC mất 2% tài khoản trong ngày<br>
                <strong>Action:</strong> Ngừng trading trong ngày, review journal</p>
            </div>

            <div class="circuit-breaker">
                <h4>⚡ Weekly Circuit Breaker</h4>
                <p style="margin-bottom: 0;"><strong>Trigger:</strong> Drawdown 5% trong tuần<br>
                <strong>Action:</strong> Giảm size 50%, chỉ trade A+ setups</p>
            </div>

            <div class="circuit-breaker">
                <h4>⚡ Monthly Circuit Breaker</h4>
                <p style="margin-bottom: 0;"><strong>Trigger:</strong> Drawdown 10% trong tháng<br>
                <strong>Action:</strong> NGỪNG trading hoàn toàn, seek mentorship</p>
            </div>

            <div class="highlight-box gold">
                <p style="margin-bottom: 0;"><strong>💡 Tại Sao Circuit Breakers Quan Trọng?</strong> Chúng ngăn chặn "revenge trading" và "tilt" - hai kẻ thù lớn nhất khi đang thua.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📈</div>
            <h2 class="section-title">Chiến Lược Phục Hồi</h2>
            <p>Khi đã vào vùng drawdown, đây là cách phục hồi an toàn:</p>

            <ol>
                <li><strong>Acknowledge và accept:</strong> Không denial, chấp nhận thực tế</li>
                <li><strong>Stop the bleeding:</strong> Đóng vị thế thua, không average down</li>
                <li><strong>Rest và review:</strong> Nghỉ ngơi, đọc lại journal để hiểu tại sao</li>
                <li><strong>Reduce size:</strong> Khi quay lại, trade với size nhỏ hơn</li>
                <li><strong>Build confidence:</strong> Tập trung win rate trước, size sau</li>
            </ol>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>🎯 Recovery Mantra:</strong> "Slow and steady wins the race." Đừng cố gấp đôi size để "gỡ" nhanh - đây là cách nhanh nhất để thua thêm.</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=Recovery+Strategy+Flowchart" alt="Recovery Strategy">
                <p class="image-caption">Flowchart chiến lược phục hồi sau drawdown</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>Drawdown</strong> = % giảm từ đỉnh xuống đáy</li>
                <li><strong>Recovery math:</strong> Mất 50% cần lãi 100% để về hòa</li>
                <li><strong>Max drawdown:</strong> 10% là ngưỡng NGỪNG TRADING</li>
                <li><strong>Circuit breakers:</strong> 3 losing trades hoặc 2% daily = stop</li>
                <li><strong>Recovery:</strong> Slow, reduce size, rebuild confidence</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">1. Nếu tài khoản mất 50%, cần bao nhiêu % lợi nhuận để về hòa?</p>
                <button class="quiz-option" data-index="0">50%</button>
                <button class="quiz-option" data-index="1">75%</button>
                <button class="quiz-option" data-index="2">100%</button>
                <button class="quiz-option" data-index="3">150%</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">2. Khi drawdown đạt 5-10%, trader nên làm gì?</p>
                <button class="quiz-option" data-index="0">Tăng size để gỡ nhanh</button>
                <button class="quiz-option" data-index="1">Giảm size 50%, chỉ trade A+ setups</button>
                <button class="quiz-option" data-index="2">Trading bình thường</button>
                <button class="quiz-option" data-index="3">Đóng tất cả vị thế và nghỉ 1 tháng</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">3. Daily Circuit Breaker trigger khi nào?</p>
                <button class="quiz-option" data-index="0">3 lệnh thua liên tiếp hoặc mất 2% trong ngày</button>
                <button class="quiz-option" data-index="1">5 lệnh thua trong tuần</button>
                <button class="quiz-option" data-index="2">Drawdown 10%</button>
                <button class="quiz-option" data-index="3">Khi market crash</button>
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

-- Lesson 5.3: Tâm Lý Giao Dịch Chuyên Sâu
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch5-l3',
  'module-tier-3-ch5',
  'course-tier3-trading-mastery',
  'Bài 5.3: Tâm Lý Giao Dịch Chuyên Sâu',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 5.3: Tâm Lý Giao Dịch Chuyên Sâu | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #10B981; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #10B981; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #10B981, #059669); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.purple { background: linear-gradient(135deg, rgba(139,92,246,0.15), rgba(109,40,217,0.1)); border-color: rgba(139,92,246,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #10B981; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .karma-meter { background: #0a0a0f; border-radius: 8px; padding: 1.25rem; margin: 1rem 0; }
        .karma-bar { height: 24px; background: #1a1a2e; border-radius: 12px; overflow: hidden; margin: 0.75rem 0; }
        .karma-fill { height: 100%; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.85rem; color: white; }
        .karma-fill.high { background: linear-gradient(90deg, #10B981, #059669); width: 85%; }
        .karma-fill.medium { background: linear-gradient(90deg, #FFBD59, #F59E0B); width: 55%; }
        .karma-fill.low { background: linear-gradient(90deg, #EF4444, #DC2626); width: 25%; }
        .emotion-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .emotion-card { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; border-left: 4px solid #EF4444; }
        .emotion-card.positive { border-left-color: #10B981; }
        .emotion-card h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.5rem; }
        .emotion-card p { font-size: 0.9rem; margin-bottom: 0; }
        .mindfulness-step { display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; background: #1a1a2e; border-radius: 8px; align-items: flex-start; }
        .step-number { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
        .step-content h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.25rem; }
        .step-content p { margin-bottom: 0; font-size: 0.9rem; }
        .summary-box { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #8B5CF6; border-radius: 12px; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #8B5CF6; font-size: 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-box ul { margin: 0; }
        .summary-box li { margin-bottom: 0.5rem; }
        .quiz-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border: 2px solid #3f3f46; }
        .quiz-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1.5rem; text-align: center; }
        .quiz-question { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem; }
        .question-text { font-weight: 500; color: #ffffff; margin-bottom: 1rem; }
        .quiz-option { display: block; width: 100%; text-align: left; background: #0a0a0f; border: 2px solid #3f3f46; border-radius: 8px; padding: 0.875rem 1rem; margin-bottom: 0.5rem; color: #d4d4d8; cursor: pointer; transition: all 0.2s; }
        .quiz-option:hover { border-color: #10B981; background: rgba(16,185,129,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(16,185,129,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .emotion-grid { grid-template-columns: 1fr; }
            .mindfulness-step { flex-direction: column; gap: 0.75rem; }
            .step-number { margin: 0 auto; }
            .step-content { text-align: center; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">Tâm Lý Giao Dịch Chuyên Sâu</h1>
            <p class="lesson-subtitle">Mastery Cảm Xúc Với Hệ Thống Karma</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🧠</div>
            <h2 class="section-title">Tâm Lý: 80% Của Trading</h2>
            <p>Ở Tier 3 Elite, bạn đã có kỹ năng kỹ thuật. Bây giờ, thách thức lớn nhất là <strong style="color: #8B5CF6;">kiểm soát tâm lý</strong>. Nhiều trader giỏi về kỹ thuật vẫn thua vì không kiểm soát được cảm xúc.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Quote:</strong> "The market is a device for transferring money from the impatient to the patient." - Warren Buffett</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=Trading+Psychology+Pyramid" alt="Trading Psychology">
                <p class="image-caption">Pyramid: Technical Skills là nền, Psychology là đỉnh</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⭐</div>
            <h2 class="section-title">Hệ Thống Karma</h2>
            <p>GEM sử dụng hệ thống Karma để theo dõi và cải thiện trạng thái tâm lý. Karma Score phản ánh "sức khỏe tâm lý" của bạn:</p>

            <div class="karma-meter">
                <p><strong>Karma Score: 85/100</strong> (Trade-ready)</p>
                <div class="karma-bar">
                    <div class="karma-fill high">85 - EXCELLENT</div>
                </div>
            </div>

            <div class="karma-meter">
                <p><strong>Karma Score: 55/100</strong> (Caution)</p>
                <div class="karma-bar">
                    <div class="karma-fill medium">55 - MEDIUM</div>
                </div>
            </div>

            <div class="karma-meter">
                <p><strong>Karma Score: 25/100</strong> (Do NOT trade)</p>
                <div class="karma-bar">
                    <div class="karma-fill low">25 - LOW</div>
                </div>
            </div>

            <div class="highlight-box purple">
                <p><strong>📏 Quy Tắc Karma:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li><strong>70+ Score:</strong> Trade bình thường</li>
                    <li><strong>50-70 Score:</strong> Giảm size, chỉ A+ setups</li>
                    <li><strong>Dưới 50:</strong> KHÔNG TRADE - nghỉ ngơi</li>
                </ul>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">😤</div>
            <h2 class="section-title">Nhận Biết Cảm Xúc Tiêu Cực</h2>
            <p>Đây là các cảm xúc nguy hiểm nhất trong trading:</p>

            <div class="emotion-grid">
                <div class="emotion-card">
                    <h4>🔥 FOMO (Fear Of Missing Out)</h4>
                    <p>Sợ bỏ lỡ cơ hội, chase giá lên. Thường dẫn đến buy high.</p>
                </div>
                <div class="emotion-card">
                    <h4>😠 Revenge Trading</h4>
                    <p>Sau khi thua, vào lệnh ngay để "gỡ". Thường thua thêm.</p>
                </div>
                <div class="emotion-card">
                    <h4>🏆 Overconfidence</h4>
                    <p>Sau winning streak, tự tin quá mức, tăng size quá lớn.</p>
                </div>
                <div class="emotion-card">
                    <h4>😰 Fear (Sợ Hãi)</h4>
                    <p>Sau losing streak, sợ vào lệnh, bỏ lỡ cơ hội tốt.</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/EF4444?text=Negative+Emotions+Cycle" alt="Negative Emotions">
                <p class="image-caption">Vòng xoáy cảm xúc tiêu cực trong trading</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🧘</div>
            <h2 class="section-title">Thực Hành Chánh Niệm</h2>
            <p>GEM khuyến nghị thực hành chánh niệm (mindfulness) trước mỗi session trading:</p>

            <div class="mindfulness-step">
                <div class="step-number">1</div>
                <div class="step-content">
                    <h4>Pause (30 giây)</h4>
                    <p>Ngồi yên, nhắm mắt, hít thở sâu 3 lần</p>
                </div>
            </div>

            <div class="mindfulness-step">
                <div class="step-number">2</div>
                <div class="step-content">
                    <h4>Body Scan (1 phút)</h4>
                    <p>Nhận biết cảm giác trong cơ thể - căng thẳng ở đâu?</p>
                </div>
            </div>

            <div class="mindfulness-step">
                <div class="step-number">3</div>
                <div class="step-content">
                    <h4>Emotion Check (30 giây)</h4>
                    <p>Hỏi: "Tôi đang cảm thấy thế nào? FOMO? Fear? Neutral?"</p>
                </div>
            </div>

            <div class="mindfulness-step">
                <div class="step-number">4</div>
                <div class="step-content">
                    <h4>Intention Setting (30 giây)</h4>
                    <p>Đặt ý định: "Hôm nay tôi sẽ tuân thủ rules, chấp nhận mọi kết quả"</p>
                </div>
            </div>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>⏱️ Tổng thời gian:</strong> 2.5-3 phút. Làm mỗi ngày trước khi mở chart.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">✅</div>
            <h2 class="section-title">Positive Emotions</h2>
            <p>Thay vì chống lại cảm xúc tiêu cực, hãy nuôi dưỡng cảm xúc tích cực:</p>

            <div class="emotion-grid">
                <div class="emotion-card positive">
                    <h4>🎯 Discipline (Kỷ Luật)</h4>
                    <p>Tuân thủ rules bất kể kết quả. Pride trong process, không phải profit.</p>
                </div>
                <div class="emotion-card positive">
                    <h4>🧘 Detachment (Không Dính Mắc)</h4>
                    <p>Chấp nhận uncertainty. Mỗi trade chỉ là 1 sample trong chuỗi dài.</p>
                </div>
                <div class="emotion-card positive">
                    <h4>🙏 Gratitude (Biết Ơn)</h4>
                    <p>Biết ơn cơ hội được trade. Mỗi loss là bài học, không phải thất bại.</p>
                </div>
                <div class="emotion-card positive">
                    <h4>⏳ Patience (Kiên Nhẫn)</h4>
                    <p>Chờ đợi setup đúng. Không trade là lựa chọn hợp lệ.</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Positive+Trading+Mindset" alt="Positive Mindset">
                <p class="image-caption">Mindset tích cực của Elite Trader</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>Psychology = 80%</strong> của trading success</li>
                <li><strong>Karma Score 70+:</strong> Trade bình thường, dưới 50: KHÔNG trade</li>
                <li><strong>4 cảm xúc nguy hiểm:</strong> FOMO, Revenge, Overconfidence, Fear</li>
                <li><strong>Mindfulness routine:</strong> 3 phút trước mỗi session</li>
                <li><strong>Nuôi dưỡng:</strong> Discipline, Detachment, Gratitude, Patience</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">1. Karma Score bao nhiêu thì KHÔNG NÊN trade?</p>
                <button class="quiz-option" data-index="0">Dưới 70</button>
                <button class="quiz-option" data-index="1">Dưới 60</button>
                <button class="quiz-option" data-index="2">Dưới 50</button>
                <button class="quiz-option" data-index="3">Dưới 80</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">2. "Revenge Trading" là gì?</p>
                <button class="quiz-option" data-index="0">Trade theo trend để "trả thù" market</button>
                <button class="quiz-option" data-index="1">Sau khi thua, vào lệnh ngay để "gỡ"</button>
                <button class="quiz-option" data-index="2">Trade khi thị trường sideway</button>
                <button class="quiz-option" data-index="3">Đóng lệnh sớm để bảo vệ profit</button>
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
    <title>Bài 5.3: Tâm Lý Giao Dịch Chuyên Sâu | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #10B981; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #10B981; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #10B981, #059669); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.purple { background: linear-gradient(135deg, rgba(139,92,246,0.15), rgba(109,40,217,0.1)); border-color: rgba(139,92,246,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #10B981; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .karma-meter { background: #0a0a0f; border-radius: 8px; padding: 1.25rem; margin: 1rem 0; }
        .karma-bar { height: 24px; background: #1a1a2e; border-radius: 12px; overflow: hidden; margin: 0.75rem 0; }
        .karma-fill { height: 100%; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.85rem; color: white; }
        .karma-fill.high { background: linear-gradient(90deg, #10B981, #059669); width: 85%; }
        .karma-fill.medium { background: linear-gradient(90deg, #FFBD59, #F59E0B); width: 55%; }
        .karma-fill.low { background: linear-gradient(90deg, #EF4444, #DC2626); width: 25%; }
        .emotion-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .emotion-card { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; border-left: 4px solid #EF4444; }
        .emotion-card.positive { border-left-color: #10B981; }
        .emotion-card h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.5rem; }
        .emotion-card p { font-size: 0.9rem; margin-bottom: 0; }
        .mindfulness-step { display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; background: #1a1a2e; border-radius: 8px; align-items: flex-start; }
        .step-number { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
        .step-content h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.25rem; }
        .step-content p { margin-bottom: 0; font-size: 0.9rem; }
        .summary-box { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #8B5CF6; border-radius: 12px; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #8B5CF6; font-size: 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-box ul { margin: 0; }
        .summary-box li { margin-bottom: 0.5rem; }
        .quiz-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border: 2px solid #3f3f46; }
        .quiz-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1.5rem; text-align: center; }
        .quiz-question { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem; }
        .question-text { font-weight: 500; color: #ffffff; margin-bottom: 1rem; }
        .quiz-option { display: block; width: 100%; text-align: left; background: #0a0a0f; border: 2px solid #3f3f46; border-radius: 8px; padding: 0.875rem 1rem; margin-bottom: 0.5rem; color: #d4d4d8; cursor: pointer; transition: all 0.2s; }
        .quiz-option:hover { border-color: #10B981; background: rgba(16,185,129,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(16,185,129,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .emotion-grid { grid-template-columns: 1fr; }
            .mindfulness-step { flex-direction: column; gap: 0.75rem; }
            .step-number { margin: 0 auto; }
            .step-content { text-align: center; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">Tâm Lý Giao Dịch Chuyên Sâu</h1>
            <p class="lesson-subtitle">Mastery Cảm Xúc Với Hệ Thống Karma</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🧠</div>
            <h2 class="section-title">Tâm Lý: 80% Của Trading</h2>
            <p>Ở Tier 3 Elite, bạn đã có kỹ năng kỹ thuật. Bây giờ, thách thức lớn nhất là <strong style="color: #8B5CF6;">kiểm soát tâm lý</strong>. Nhiều trader giỏi về kỹ thuật vẫn thua vì không kiểm soát được cảm xúc.</p>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Quote:</strong> "The market is a device for transferring money from the impatient to the patient." - Warren Buffett</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=Trading+Psychology+Pyramid" alt="Trading Psychology">
                <p class="image-caption">Pyramid: Technical Skills là nền, Psychology là đỉnh</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">⭐</div>
            <h2 class="section-title">Hệ Thống Karma</h2>
            <p>GEM sử dụng hệ thống Karma để theo dõi và cải thiện trạng thái tâm lý. Karma Score phản ánh "sức khỏe tâm lý" của bạn:</p>

            <div class="karma-meter">
                <p><strong>Karma Score: 85/100</strong> (Trade-ready)</p>
                <div class="karma-bar">
                    <div class="karma-fill high">85 - EXCELLENT</div>
                </div>
            </div>

            <div class="karma-meter">
                <p><strong>Karma Score: 55/100</strong> (Caution)</p>
                <div class="karma-bar">
                    <div class="karma-fill medium">55 - MEDIUM</div>
                </div>
            </div>

            <div class="karma-meter">
                <p><strong>Karma Score: 25/100</strong> (Do NOT trade)</p>
                <div class="karma-bar">
                    <div class="karma-fill low">25 - LOW</div>
                </div>
            </div>

            <div class="highlight-box purple">
                <p><strong>📏 Quy Tắc Karma:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li><strong>70+ Score:</strong> Trade bình thường</li>
                    <li><strong>50-70 Score:</strong> Giảm size, chỉ A+ setups</li>
                    <li><strong>Dưới 50:</strong> KHÔNG TRADE - nghỉ ngơi</li>
                </ul>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">😤</div>
            <h2 class="section-title">Nhận Biết Cảm Xúc Tiêu Cực</h2>
            <p>Đây là các cảm xúc nguy hiểm nhất trong trading:</p>

            <div class="emotion-grid">
                <div class="emotion-card">
                    <h4>🔥 FOMO (Fear Of Missing Out)</h4>
                    <p>Sợ bỏ lỡ cơ hội, chase giá lên. Thường dẫn đến buy high.</p>
                </div>
                <div class="emotion-card">
                    <h4>😠 Revenge Trading</h4>
                    <p>Sau khi thua, vào lệnh ngay để "gỡ". Thường thua thêm.</p>
                </div>
                <div class="emotion-card">
                    <h4>🏆 Overconfidence</h4>
                    <p>Sau winning streak, tự tin quá mức, tăng size quá lớn.</p>
                </div>
                <div class="emotion-card">
                    <h4>😰 Fear (Sợ Hãi)</h4>
                    <p>Sau losing streak, sợ vào lệnh, bỏ lỡ cơ hội tốt.</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/EF4444?text=Negative+Emotions+Cycle" alt="Negative Emotions">
                <p class="image-caption">Vòng xoáy cảm xúc tiêu cực trong trading</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🧘</div>
            <h2 class="section-title">Thực Hành Chánh Niệm</h2>
            <p>GEM khuyến nghị thực hành chánh niệm (mindfulness) trước mỗi session trading:</p>

            <div class="mindfulness-step">
                <div class="step-number">1</div>
                <div class="step-content">
                    <h4>Pause (30 giây)</h4>
                    <p>Ngồi yên, nhắm mắt, hít thở sâu 3 lần</p>
                </div>
            </div>

            <div class="mindfulness-step">
                <div class="step-number">2</div>
                <div class="step-content">
                    <h4>Body Scan (1 phút)</h4>
                    <p>Nhận biết cảm giác trong cơ thể - căng thẳng ở đâu?</p>
                </div>
            </div>

            <div class="mindfulness-step">
                <div class="step-number">3</div>
                <div class="step-content">
                    <h4>Emotion Check (30 giây)</h4>
                    <p>Hỏi: "Tôi đang cảm thấy thế nào? FOMO? Fear? Neutral?"</p>
                </div>
            </div>

            <div class="mindfulness-step">
                <div class="step-number">4</div>
                <div class="step-content">
                    <h4>Intention Setting (30 giây)</h4>
                    <p>Đặt ý định: "Hôm nay tôi sẽ tuân thủ rules, chấp nhận mọi kết quả"</p>
                </div>
            </div>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>⏱️ Tổng thời gian:</strong> 2.5-3 phút. Làm mỗi ngày trước khi mở chart.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">✅</div>
            <h2 class="section-title">Positive Emotions</h2>
            <p>Thay vì chống lại cảm xúc tiêu cực, hãy nuôi dưỡng cảm xúc tích cực:</p>

            <div class="emotion-grid">
                <div class="emotion-card positive">
                    <h4>🎯 Discipline (Kỷ Luật)</h4>
                    <p>Tuân thủ rules bất kể kết quả. Pride trong process, không phải profit.</p>
                </div>
                <div class="emotion-card positive">
                    <h4>🧘 Detachment (Không Dính Mắc)</h4>
                    <p>Chấp nhận uncertainty. Mỗi trade chỉ là 1 sample trong chuỗi dài.</p>
                </div>
                <div class="emotion-card positive">
                    <h4>🙏 Gratitude (Biết Ơn)</h4>
                    <p>Biết ơn cơ hội được trade. Mỗi loss là bài học, không phải thất bại.</p>
                </div>
                <div class="emotion-card positive">
                    <h4>⏳ Patience (Kiên Nhẫn)</h4>
                    <p>Chờ đợi setup đúng. Không trade là lựa chọn hợp lệ.</p>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Positive+Trading+Mindset" alt="Positive Mindset">
                <p class="image-caption">Mindset tích cực của Elite Trader</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>Psychology = 80%</strong> của trading success</li>
                <li><strong>Karma Score 70+:</strong> Trade bình thường, dưới 50: KHÔNG trade</li>
                <li><strong>4 cảm xúc nguy hiểm:</strong> FOMO, Revenge, Overconfidence, Fear</li>
                <li><strong>Mindfulness routine:</strong> 3 phút trước mỗi session</li>
                <li><strong>Nuôi dưỡng:</strong> Discipline, Detachment, Gratitude, Patience</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">1. Karma Score bao nhiêu thì KHÔNG NÊN trade?</p>
                <button class="quiz-option" data-index="0">Dưới 70</button>
                <button class="quiz-option" data-index="1">Dưới 60</button>
                <button class="quiz-option" data-index="2">Dưới 50</button>
                <button class="quiz-option" data-index="3">Dưới 80</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">2. "Revenge Trading" là gì?</p>
                <button class="quiz-option" data-index="0">Trade theo trend để "trả thù" market</button>
                <button class="quiz-option" data-index="1">Sau khi thua, vào lệnh ngay để "gỡ"</button>
                <button class="quiz-option" data-index="2">Trade khi thị trường sideway</button>
                <button class="quiz-option" data-index="3">Đóng lệnh sớm để bảo vệ profit</button>
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

-- Lesson 5.4: Chiến Lược Giao Dịch Nâng Cao
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch5-l4',
  'module-tier-3-ch5',
  'course-tier3-trading-mastery',
  'Bài 5.4: Chiến Lược Giao Dịch Nâng Cao',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 5.4: Chiến Lược Giao Dịch Nâng Cao | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #10B981; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #10B981; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #10B981, #059669); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255,189,89,0.15), rgba(245,158,11,0.1)); border-color: rgba(255,189,89,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #10B981; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .pattern-combo { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #10B981; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .pattern-combo h4 { color: #10B981; font-size: 1.1rem; margin-bottom: 0.75rem; }
        .strategy-card { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; margin: 1rem 0; border-left: 4px solid #6366F1; }
        .strategy-card h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.5rem; }
        .strategy-card .win-rate { color: #10B981; font-weight: 600; }
        .case-study { background: #0a0a0f; border-radius: 8px; padding: 1.25rem; margin: 1rem 0; border: 1px solid #3f3f46; }
        .case-study h4 { color: #FFBD59; margin-bottom: 0.75rem; }
        .summary-box { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #8B5CF6; border-radius: 12px; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #8B5CF6; font-size: 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-box ul { margin: 0; }
        .summary-box li { margin-bottom: 0.5rem; }
        .quiz-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border: 2px solid #3f3f46; }
        .quiz-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1.5rem; text-align: center; }
        .quiz-question { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem; }
        .question-text { font-weight: 500; color: #ffffff; margin-bottom: 1rem; }
        .quiz-option { display: block; width: 100%; text-align: left; background: #0a0a0f; border: 2px solid #3f3f46; border-radius: 8px; padding: 0.875rem 1rem; margin-bottom: 0.5rem; color: #d4d4d8; cursor: pointer; transition: all 0.2s; }
        .quiz-option:hover { border-color: #10B981; background: rgba(16,185,129,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(16,185,129,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">Chiến Lược Giao Dịch Nâng Cao</h1>
            <p class="lesson-subtitle">Kết Hợp 24 Patterns Một Cách Hiệu Quả</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🎯</div>
            <h2 class="section-title">24 Patterns - Bộ Công Cụ Hoàn Chỉnh</h2>
            <p>Sau 3 Tier, bạn đã nắm vững 24 patterns của GEM Trading System. Bây giờ là lúc học cách <strong style="color: #10B981;">kết hợp chúng một cách chiến lược</strong> để tối đa hóa edge.</p>

            <div class="highlight-box">
                <p><strong>📊 Tổng Quan 24 Patterns:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li><strong>GEM Core (6):</strong> UPU, UPD, DPU, DPD, CxH, CxL</li>
                    <li><strong>Classic (6):</strong> Double Top/Bottom, H&S, Triangle, Wedge, Channel</li>
                    <li><strong>Candlestick (6):</strong> Engulfing, Hammer, Doji, Star patterns, Three Methods</li>
                    <li><strong>Continuation (6):</strong> Flag, Pennant, Retest patterns</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=24+Patterns+Overview+Grid" alt="24 Patterns">
                <p class="image-caption">Grid 24 patterns trong GEM Trading System</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🔗</div>
            <h2 class="section-title">Kết Hợp Patterns Hiệu Quả</h2>
            <p>Một số kết hợp patterns có probability cao hơn khi trade cùng nhau:</p>

            <div class="pattern-combo">
                <h4>🟢 Combo 1: Zone Retest + Candlestick Confirmation</h4>
                <p>GEM Zone (UPU/DPU) + Engulfing/Hammer tại zone = <strong style="color: #10B981;">Win Rate 72%</strong></p>
                <ul style="margin-bottom: 0;">
                    <li>Entry: Sau khi candlestick confirmation close</li>
                    <li>SL: Dưới/trên zone</li>
                    <li>TP: Next major zone</li>
                </ul>
            </div>

            <div class="pattern-combo" style="border-color: #FFBD59;">
                <h4 style="color: #FFBD59;">🟡 Combo 2: Breakout + Flag Continuation</h4>
                <p>GEM Breakout + Flag pattern = <strong style="color: #FFBD59;">Win Rate 68%</strong></p>
                <ul style="margin-bottom: 0;">
                    <li>Breakout đầu tiên = flagpole</li>
                    <li>Consolidation = flag</li>
                    <li>Entry: Flag breakout với volume</li>
                </ul>
            </div>

            <div class="pattern-combo" style="border-color: #6366F1;">
                <h4 style="color: #6366F1;">🟣 Combo 3: Classic + GEM Zone Confluence</h4>
                <p>Double Bottom + GEM Support Zone = <strong style="color: #6366F1;">Win Rate 75%</strong></p>
                <ul style="margin-bottom: 0;">
                    <li>Double bottom tại GEM zone = extra confirmation</li>
                    <li>Neckline break = entry signal</li>
                    <li>Target: 1:1 height projection</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/FFBD59?text=Pattern+Combinations+Chart" alt="Pattern Combos">
                <p class="image-caption">Ví dụ các pattern combinations trên chart</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📋</div>
            <h2 class="section-title">Multi-Strategy Approach</h2>
            <p>Elite Traders không chỉ dùng một strategy. Họ có "playbook" với nhiều strategies cho các market conditions khác nhau:</p>

            <div class="strategy-card">
                <h4>📈 Trending Market Strategy</h4>
                <p>Sử dụng: Breakouts, Flag/Pennant continuations, Retest entries</p>
                <p class="win-rate">Best in: Strong trend với higher highs/lower lows</p>
            </div>

            <div class="strategy-card" style="border-left-color: #FFBD59;">
                <h4>↔️ Ranging Market Strategy</h4>
                <p>Sử dụng: Zone bounces (UPU/DPU), Double tops/bottoms at range extremes</p>
                <p class="win-rate">Best in: Clear support/resistance boundaries</p>
            </div>

            <div class="strategy-card" style="border-left-color: #EF4444;">
                <h4>💥 High Volatility Strategy</h4>
                <p>Sử dụng: Wider stops, smaller size, focus on major zones only</p>
                <p class="win-rate">Best in: News events, market uncertainty</p>
            </div>

            <div class="highlight-box gold">
                <p style="margin-bottom: 0;"><strong>💡 Pro Tip:</strong> Xác định market condition TRƯỚC khi chọn strategy. "Right strategy, wrong market" = thua.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📚</div>
            <h2 class="section-title">Case Study: Pro Trader Analysis</h2>
            <p>Phân tích từ một Elite Trader trong GEM community:</p>

            <div class="case-study">
                <h4>🏆 BTC Trade: +23% trong 2 tuần</h4>
                <ul>
                    <li><strong>Setup:</strong> UPU zone $38,500 + Double Bottom + Bullish Engulfing</li>
                    <li><strong>Confluence:</strong> 5/5 factors (Zone + Pattern + Candlestick + Volume + Whale outflow)</li>
                    <li><strong>Entry:</strong> $38,800 sau Engulfing close</li>
                    <li><strong>SL:</strong> $37,500 (-3.3%)</li>
                    <li><strong>TP:</strong> $47,500 (next major resistance)</li>
                    <li><strong>Result:</strong> Hit TP sau 12 ngày, +23% gain</li>
                </ul>
            </div>

            <p><strong>Lessons từ trade này:</strong></p>
            <ul>
                <li>Patience: Chờ đủ 5/5 confluence mới entry</li>
                <li>Multi-pattern: Kết hợp GEM + Classic + Candlestick</li>
                <li>Risk/Reward: 7:1 ratio trước khi vào lệnh</li>
            </ul>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/8B5CF6?text=Pro+Trader+Case+Study+Chart" alt="Case Study">
                <p class="image-caption">Chart phân tích trade BTC của Pro Trader</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>24 patterns</strong> là toolkit hoàn chỉnh của GEM Trader</li>
                <li><strong>Kết hợp patterns</strong> tăng win rate (Zone + Candlestick = 72%)</li>
                <li><strong>Multi-strategy:</strong> Trending, Ranging, High Volatility</li>
                <li><strong>Xác định market condition</strong> trước khi chọn strategy</li>
                <li><strong>Patience + Confluence</strong> là key của Pro Traders</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">1. Combo "Zone Retest + Candlestick Confirmation" có win rate khoảng bao nhiêu?</p>
                <button class="quiz-option" data-index="0">72%</button>
                <button class="quiz-option" data-index="1">55%</button>
                <button class="quiz-option" data-index="2">90%</button>
                <button class="quiz-option" data-index="3">40%</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Trong Ranging Market, nên sử dụng strategy nào?</p>
                <button class="quiz-option" data-index="0">Breakout và Flag continuation</button>
                <button class="quiz-option" data-index="1">Wider stops và focus major zones</button>
                <button class="quiz-option" data-index="2">Zone bounces và Double tops/bottoms</button>
                <button class="quiz-option" data-index="3">Scalping với tight stops</button>
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
    <title>Bài 5.4: Chiến Lược Giao Dịch Nâng Cao | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #10B981; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #10B981; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #10B981, #059669); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.gold { background: linear-gradient(135deg, rgba(255,189,89,0.15), rgba(245,158,11,0.1)); border-color: rgba(255,189,89,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #10B981; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .pattern-combo { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #10B981; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; }
        .pattern-combo h4 { color: #10B981; font-size: 1.1rem; margin-bottom: 0.75rem; }
        .strategy-card { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; margin: 1rem 0; border-left: 4px solid #6366F1; }
        .strategy-card h4 { color: #ffffff; font-size: 1rem; margin-bottom: 0.5rem; }
        .strategy-card .win-rate { color: #10B981; font-weight: 600; }
        .case-study { background: #0a0a0f; border-radius: 8px; padding: 1.25rem; margin: 1rem 0; border: 1px solid #3f3f46; }
        .case-study h4 { color: #FFBD59; margin-bottom: 0.75rem; }
        .summary-box { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #8B5CF6; border-radius: 12px; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #8B5CF6; font-size: 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-box ul { margin: 0; }
        .summary-box li { margin-bottom: 0.5rem; }
        .quiz-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border: 2px solid #3f3f46; }
        .quiz-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1.5rem; text-align: center; }
        .quiz-question { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem; }
        .question-text { font-weight: 500; color: #ffffff; margin-bottom: 1rem; }
        .quiz-option { display: block; width: 100%; text-align: left; background: #0a0a0f; border: 2px solid #3f3f46; border-radius: 8px; padding: 0.875rem 1rem; margin-bottom: 0.5rem; color: #d4d4d8; cursor: pointer; transition: all 0.2s; }
        .quiz-option:hover { border-color: #10B981; background: rgba(16,185,129,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(16,185,129,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">Chiến Lược Giao Dịch Nâng Cao</h1>
            <p class="lesson-subtitle">Kết Hợp 24 Patterns Một Cách Hiệu Quả</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🎯</div>
            <h2 class="section-title">24 Patterns - Bộ Công Cụ Hoàn Chỉnh</h2>
            <p>Sau 3 Tier, bạn đã nắm vững 24 patterns của GEM Trading System. Bây giờ là lúc học cách <strong style="color: #10B981;">kết hợp chúng một cách chiến lược</strong> để tối đa hóa edge.</p>

            <div class="highlight-box">
                <p><strong>📊 Tổng Quan 24 Patterns:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li><strong>GEM Core (6):</strong> UPU, UPD, DPU, DPD, CxH, CxL</li>
                    <li><strong>Classic (6):</strong> Double Top/Bottom, H&S, Triangle, Wedge, Channel</li>
                    <li><strong>Candlestick (6):</strong> Engulfing, Hammer, Doji, Star patterns, Three Methods</li>
                    <li><strong>Continuation (6):</strong> Flag, Pennant, Retest patterns</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=24+Patterns+Overview+Grid" alt="24 Patterns">
                <p class="image-caption">Grid 24 patterns trong GEM Trading System</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🔗</div>
            <h2 class="section-title">Kết Hợp Patterns Hiệu Quả</h2>
            <p>Một số kết hợp patterns có probability cao hơn khi trade cùng nhau:</p>

            <div class="pattern-combo">
                <h4>🟢 Combo 1: Zone Retest + Candlestick Confirmation</h4>
                <p>GEM Zone (UPU/DPU) + Engulfing/Hammer tại zone = <strong style="color: #10B981;">Win Rate 72%</strong></p>
                <ul style="margin-bottom: 0;">
                    <li>Entry: Sau khi candlestick confirmation close</li>
                    <li>SL: Dưới/trên zone</li>
                    <li>TP: Next major zone</li>
                </ul>
            </div>

            <div class="pattern-combo" style="border-color: #FFBD59;">
                <h4 style="color: #FFBD59;">🟡 Combo 2: Breakout + Flag Continuation</h4>
                <p>GEM Breakout + Flag pattern = <strong style="color: #FFBD59;">Win Rate 68%</strong></p>
                <ul style="margin-bottom: 0;">
                    <li>Breakout đầu tiên = flagpole</li>
                    <li>Consolidation = flag</li>
                    <li>Entry: Flag breakout với volume</li>
                </ul>
            </div>

            <div class="pattern-combo" style="border-color: #6366F1;">
                <h4 style="color: #6366F1;">🟣 Combo 3: Classic + GEM Zone Confluence</h4>
                <p>Double Bottom + GEM Support Zone = <strong style="color: #6366F1;">Win Rate 75%</strong></p>
                <ul style="margin-bottom: 0;">
                    <li>Double bottom tại GEM zone = extra confirmation</li>
                    <li>Neckline break = entry signal</li>
                    <li>Target: 1:1 height projection</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/FFBD59?text=Pattern+Combinations+Chart" alt="Pattern Combos">
                <p class="image-caption">Ví dụ các pattern combinations trên chart</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📋</div>
            <h2 class="section-title">Multi-Strategy Approach</h2>
            <p>Elite Traders không chỉ dùng một strategy. Họ có "playbook" với nhiều strategies cho các market conditions khác nhau:</p>

            <div class="strategy-card">
                <h4>📈 Trending Market Strategy</h4>
                <p>Sử dụng: Breakouts, Flag/Pennant continuations, Retest entries</p>
                <p class="win-rate">Best in: Strong trend với higher highs/lower lows</p>
            </div>

            <div class="strategy-card" style="border-left-color: #FFBD59;">
                <h4>↔️ Ranging Market Strategy</h4>
                <p>Sử dụng: Zone bounces (UPU/DPU), Double tops/bottoms at range extremes</p>
                <p class="win-rate">Best in: Clear support/resistance boundaries</p>
            </div>

            <div class="strategy-card" style="border-left-color: #EF4444;">
                <h4>💥 High Volatility Strategy</h4>
                <p>Sử dụng: Wider stops, smaller size, focus on major zones only</p>
                <p class="win-rate">Best in: News events, market uncertainty</p>
            </div>

            <div class="highlight-box gold">
                <p style="margin-bottom: 0;"><strong>💡 Pro Tip:</strong> Xác định market condition TRƯỚC khi chọn strategy. "Right strategy, wrong market" = thua.</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">📚</div>
            <h2 class="section-title">Case Study: Pro Trader Analysis</h2>
            <p>Phân tích từ một Elite Trader trong GEM community:</p>

            <div class="case-study">
                <h4>🏆 BTC Trade: +23% trong 2 tuần</h4>
                <ul>
                    <li><strong>Setup:</strong> UPU zone $38,500 + Double Bottom + Bullish Engulfing</li>
                    <li><strong>Confluence:</strong> 5/5 factors (Zone + Pattern + Candlestick + Volume + Whale outflow)</li>
                    <li><strong>Entry:</strong> $38,800 sau Engulfing close</li>
                    <li><strong>SL:</strong> $37,500 (-3.3%)</li>
                    <li><strong>TP:</strong> $47,500 (next major resistance)</li>
                    <li><strong>Result:</strong> Hit TP sau 12 ngày, +23% gain</li>
                </ul>
            </div>

            <p><strong>Lessons từ trade này:</strong></p>
            <ul>
                <li>Patience: Chờ đủ 5/5 confluence mới entry</li>
                <li>Multi-pattern: Kết hợp GEM + Classic + Candlestick</li>
                <li>Risk/Reward: 7:1 ratio trước khi vào lệnh</li>
            </ul>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x450/112250/8B5CF6?text=Pro+Trader+Case+Study+Chart" alt="Case Study">
                <p class="image-caption">Chart phân tích trade BTC của Pro Trader</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>24 patterns</strong> là toolkit hoàn chỉnh của GEM Trader</li>
                <li><strong>Kết hợp patterns</strong> tăng win rate (Zone + Candlestick = 72%)</li>
                <li><strong>Multi-strategy:</strong> Trending, Ranging, High Volatility</li>
                <li><strong>Xác định market condition</strong> trước khi chọn strategy</li>
                <li><strong>Patience + Confluence</strong> là key của Pro Traders</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">1. Combo "Zone Retest + Candlestick Confirmation" có win rate khoảng bao nhiêu?</p>
                <button class="quiz-option" data-index="0">72%</button>
                <button class="quiz-option" data-index="1">55%</button>
                <button class="quiz-option" data-index="2">90%</button>
                <button class="quiz-option" data-index="3">40%</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="2">
                <p class="question-text">2. Trong Ranging Market, nên sử dụng strategy nào?</p>
                <button class="quiz-option" data-index="0">Breakout và Flag continuation</button>
                <button class="quiz-option" data-index="1">Wider stops và focus major zones</button>
                <button class="quiz-option" data-index="2">Zone bounces và Double tops/bottoms</button>
                <button class="quiz-option" data-index="3">Scalping với tight stops</button>
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

-- Lesson 5.5: Tốt Nghiệp & Đối Tác
INSERT INTO course_lessons (id, module_id, course_id, title, type, html_content, content, order_index, duration_minutes, is_preview, created_at, updated_at)
VALUES (
  'lesson-tier-3-ch5-l5',
  'module-tier-3-ch5',
  'course-tier3-trading-mastery',
  'Bài 5.5: Tốt Nghiệp & Đối Tác',
  'article',
  '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bài 5.5: Tốt Nghiệp & Đối Tác | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #FFBD59; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #FFBD59; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #FFBD59, #F59E0B); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(255,189,89,0.1), rgba(245,158,11,0.1)); border: 1px solid rgba(255,189,89,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.purple { background: linear-gradient(135deg, rgba(139,92,246,0.15), rgba(109,40,217,0.1)); border-color: rgba(139,92,246,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #FFBD59; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .certificate-box { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 3px solid #FFBD59; border-radius: 16px; padding: 2rem; margin: 1.5rem 0; text-align: center; }
        .certificate-box h3 { color: #FFBD59; font-size: 1.5rem; margin-bottom: 0.5rem; }
        .certificate-box .title { color: #ffffff; font-size: 1.1rem; margin-bottom: 1rem; }
        .partner-card { background: #1a1a2e; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; border-top: 4px solid #8B5CF6; }
        .partner-card h4 { color: #8B5CF6; font-size: 1.1rem; margin-bottom: 0.75rem; }
        .partner-benefits { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .benefit-item { background: #0a0a0f; border-radius: 8px; padding: 1rem; text-align: center; }
        .benefit-item .value { font-size: 1.5rem; font-weight: 700; color: #10B981; }
        .benefit-item .label { font-size: 0.85rem; color: #a1a1aa; margin-top: 0.25rem; }
        .commission-table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        .commission-table th, .commission-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #27272a; }
        .commission-table th { background: #1a1a2e; color: #a1a1aa; font-weight: 600; }
        .commission-table td { color: #d4d4d8; }
        .commission-table .rate { color: #10B981; font-weight: 600; }
        .summary-box { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #8B5CF6; border-radius: 12px; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #8B5CF6; font-size: 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-box ul { margin: 0; }
        .summary-box li { margin-bottom: 0.5rem; }
        .quiz-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border: 2px solid #3f3f46; }
        .quiz-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1.5rem; text-align: center; }
        .quiz-question { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem; }
        .question-text { font-weight: 500; color: #ffffff; margin-bottom: 1rem; }
        .quiz-option { display: block; width: 100%; text-align: left; background: #0a0a0f; border: 2px solid #3f3f46; border-radius: 8px; padding: 0.875rem 1rem; margin-bottom: 0.5rem; color: #d4d4d8; cursor: pointer; transition: all 0.2s; }
        .quiz-option:hover { border-color: #FFBD59; background: rgba(255,189,89,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(255,189,89,0.2), rgba(139,92,246,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .partner-benefits { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">Tốt Nghiệp & Đối Tác</h1>
            <p class="lesson-subtitle">Chứng Chỉ TIER 3 & Cơ Hội Partnership</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🎓</div>
            <h2 class="section-title">Chúc Mừng! Bạn Đã Hoàn Thành</h2>
            <p>Sau hành trình qua 3 Tier và 25+ chapters, bạn đã sở hữu bộ kiến thức và kỹ năng của một <strong style="color: #FFBD59;">Elite Trader</strong>. Đây không phải điểm kết thúc, mà là điểm bắt đầu của một chương mới.</p>

            <div class="certificate-box">
                <h3>🏆 CHỨNG CHỈ HOÀN THÀNH</h3>
                <p class="title">GEM Trading Academy - TIER 3 ELITE</p>
                <p style="color: #a1a1aa; margin-bottom: 0;">Đã hoàn thành đầy đủ chương trình đào tạo nâng cao</p>
            </div>

            <div class="highlight-box">
                <p><strong>📋 Những Gì Bạn Đã Đạt Được:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li>Thành thạo 24 patterns của GEM Trading System</li>
                    <li>Hiểu sâu về Flag, Pennant, và Candlestick patterns</li>
                    <li>Sử dụng AI Signals và Whale Tracking</li>
                    <li>Quản lý danh mục và risk như professional</li>
                    <li>Kiểm soát tâm lý với hệ thống Karma</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=Elite+Trader+Certificate" alt="Certificate">
                <p class="image-caption">Chứng chỉ GEM Trading Academy - TIER 3 Elite</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🤝</div>
            <h2 class="section-title">Cơ Hội Trở Thành Partner</h2>
            <p>Với việc hoàn thành Tier 3, bạn đủ điều kiện tham gia <strong style="color: #8B5CF6;">Chương Trình Đối Tác GEM</strong>. Đây là cơ hội tạo thu nhập bằng cách chia sẻ kiến thức đã học.</p>

            <div class="partner-card">
                <h4>🌟 Hệ Thống CTV 5 Tier</h4>
                <ol>
                    <li><strong>Bronze (Đồng):</strong> Bắt đầu ngay, 10% Digital, 6% Physical</li>
                    <li><strong>Silver (Bạc):</strong> Từ 50M doanh số, 15% Digital, 8% Physical</li>
                    <li><strong>Gold (Vàng):</strong> Từ 150M, 20% Digital, 10% Physical</li>
                    <li><strong>Platinum (Bạch Kim):</strong> Từ 400M, 25% Digital, 12% Physical</li>
                    <li><strong>Diamond (Kim Cương):</strong> Từ 800M, 30% Digital, 15% Physical</li>
                </ol>
            </div>

            <div class="partner-benefits">
                <div class="benefit-item">
                    <div class="value">10-30%</div>
                    <div class="label">Digital theo Tier</div>
                </div>
                <div class="benefit-item">
                    <div class="value">6-15%</div>
                    <div class="label">Physical theo Tier</div>
                </div>
                <div class="benefit-item">
                    <div class="value">2-4%</div>
                    <div class="label">Sub-Affiliate</div>
                </div>
                <div class="benefit-item">
                    <div class="value">∞</div>
                    <div class="label">Recurring Income</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=Partnership+Tiers+Diagram" alt="Partnership Tiers">
                <p class="image-caption">3 cấp độ Partnership và lộ trình thăng tiến</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">💰</div>
            <h2 class="section-title">Bảng Hoa Hồng CTV 5 Tier</h2>
            <p>Chi tiết hoa hồng theo từng tier (sản phẩm Digital):</p>

            <table class="commission-table">
                <thead>
                    <tr>
                        <th>Tier</th>
                        <th>Ngưỡng</th>
                        <th>Digital</th>
                        <th>Physical</th>
                        <th>Sub-Aff</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>🥉 Bronze (Đồng)</td>
                        <td>0đ</td>
                        <td class="rate">10%</td>
                        <td>6%</td>
                        <td>2%</td>
                    </tr>
                    <tr>
                        <td>🥈 Silver (Bạc)</td>
                        <td>50M</td>
                        <td class="rate">15%</td>
                        <td>8%</td>
                        <td>2.5%</td>
                    </tr>
                    <tr>
                        <td>🥇 Gold (Vàng)</td>
                        <td>150M</td>
                        <td class="rate">20%</td>
                        <td>10%</td>
                        <td>3%</td>
                    </tr>
                    <tr>
                        <td>💎 Platinum</td>
                        <td>400M</td>
                        <td class="rate">25%</td>
                        <td>12%</td>
                        <td>3.5%</td>
                    </tr>
                    <tr>
                        <td>💠 Diamond</td>
                        <td>800M</td>
                        <td class="rate">30%</td>
                        <td>15%</td>
                        <td>4%</td>
                    </tr>
                </tbody>
            </table>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Ví Dụ:</strong> CTV Bronze bán khóa TIER 1 (2M) → Nhận 200,000đ (10%). Nếu lên Diamond → Nhận 600,000đ (30%) cho cùng sản phẩm!</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🚀</div>
            <h2 class="section-title">Các Bước Tiếp Theo</h2>
            <p>Để bắt đầu hành trình Partner:</p>

            <ol>
                <li><strong>Đăng ký CTV:</strong> Liên hệ support để nhận link affiliate cá nhân</li>
                <li><strong>Nhận marketing kit:</strong> Banners, scripts, content templates</li>
                <li><strong>Bắt đầu chia sẻ:</strong> Social media, groups, word of mouth</li>
                <li><strong>Track & Optimize:</strong> Dashboard theo dõi conversions</li>
                <li><strong>Thăng cấp:</strong> 10 referrals → Đại Đối Tác eligible</li>
            </ol>

            <div class="highlight-box purple">
                <p style="margin-bottom: 0;"><strong>🎯 Mục Tiêu:</strong> Nhiều CTV đã đạt thu nhập 50-100 triệu/tháng từ affiliate. Bạn có thể là người tiếp theo!</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Partner+Success+Stories" alt="Success Stories">
                <p class="image-caption">Câu chuyện thành công từ các Partners</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>Hoàn thành TIER 3</strong> = Chứng chỉ Elite Trader</li>
                <li><strong>CTV 5 Tier:</strong> Bronze → Silver → Gold → Platinum → Diamond</li>
                <li><strong>Hoa hồng Digital:</strong> 10% (Bronze) đến 30% (Diamond)</li>
                <li><strong>Recurring income:</strong> Thu nhập thụ động từ referrals + Sub-Aff</li>
                <li><strong>Bắt đầu ngay:</strong> Đăng ký trong app GEM → Account → Affiliate</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Hoa hồng CTV cho sản phẩm Full Bundle là bao nhiêu?</p>
                <button class="quiz-option" data-index="0">1,500,000đ</button>
                <button class="quiz-option" data-index="1">2,400,000đ</button>
                <button class="quiz-option" data-index="2">3,200,000đ</button>
                <button class="quiz-option" data-index="3">4,000,000đ</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">2. Cần bao nhiêu referrals để đủ điều kiện thăng cấp Đại Đối Tác?</p>
                <button class="quiz-option" data-index="0">10 referrals</button>
                <button class="quiz-option" data-index="1">5 referrals</button>
                <button class="quiz-option" data-index="2">20 referrals</button>
                <button class="quiz-option" data-index="3">50 referrals</button>
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
    <title>Bài 5.5: Tốt Nghiệp & Đối Tác | GEM Trading Academy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, sans-serif; background: #0a0a0f; color: #e4e4e7; line-height: 1.7; font-size: 16px; }
        .container { max-width: 800px; margin: 0 auto; }
        .lesson-header { background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-bottom: 3px solid #FFBD59; padding: 2rem 1.5rem; text-align: center; }
        .tier-badge { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 1rem; }
        .lesson-title { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
        .lesson-subtitle { font-size: 1rem; color: #a1a1aa; }
        .content-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border-left: 4px solid #FFBD59; }
        .section-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''''; width: 4px; height: 24px; background: linear-gradient(180deg, #FFBD59, #F59E0B); border-radius: 2px; }
        p { margin-bottom: 1rem; color: #d4d4d8; }
        .highlight-box { background: linear-gradient(135deg, rgba(255,189,89,0.1), rgba(245,158,11,0.1)); border: 1px solid rgba(255,189,89,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .highlight-box.purple { background: linear-gradient(135deg, rgba(139,92,246,0.15), rgba(109,40,217,0.1)); border-color: rgba(139,92,246,0.4); }
        ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
        li { margin-bottom: 0.5rem; color: #d4d4d8; }
        li strong { color: #FFBD59; }
        .image-placeholder { background: linear-gradient(135deg, #1e1e2e, #13131a); border: 2px dashed #3f3f46; border-radius: 12px; padding: 3rem 1.5rem; text-align: center; margin: 1.5rem 0; }
        .image-placeholder img { max-width: 100%; border-radius: 8px; }
        .image-caption { font-size: 0.85rem; color: #71717a; margin-top: 0.75rem; font-style: italic; }
        .certificate-box { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 3px solid #FFBD59; border-radius: 16px; padding: 2rem; margin: 1.5rem 0; text-align: center; }
        .certificate-box h3 { color: #FFBD59; font-size: 1.5rem; margin-bottom: 0.5rem; }
        .certificate-box .title { color: #ffffff; font-size: 1.1rem; margin-bottom: 1rem; }
        .partner-card { background: #1a1a2e; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; border-top: 4px solid #8B5CF6; }
        .partner-card h4 { color: #8B5CF6; font-size: 1.1rem; margin-bottom: 0.75rem; }
        .partner-benefits { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; }
        .benefit-item { background: #0a0a0f; border-radius: 8px; padding: 1rem; text-align: center; }
        .benefit-item .value { font-size: 1.5rem; font-weight: 700; color: #10B981; }
        .benefit-item .label { font-size: 0.85rem; color: #a1a1aa; margin-top: 0.25rem; }
        .commission-table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        .commission-table th, .commission-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #27272a; }
        .commission-table th { background: #1a1a2e; color: #a1a1aa; font-weight: 600; }
        .commission-table td { color: #d4d4d8; }
        .commission-table .rate { color: #10B981; font-weight: 600; }
        .summary-box { background: linear-gradient(135deg, #1a1a2e, #13131a); border: 2px solid #8B5CF6; border-radius: 12px; padding: 1.5rem; margin: 1rem; }
        .summary-box h3 { color: #8B5CF6; font-size: 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .summary-box ul { margin: 0; }
        .summary-box li { margin-bottom: 0.5rem; }
        .quiz-section { background: #13131a; border-radius: 12px; padding: 1.5rem; margin: 1rem; border: 2px solid #3f3f46; }
        .quiz-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 1.5rem; text-align: center; }
        .quiz-question { background: #1a1a2e; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem; }
        .question-text { font-weight: 500; color: #ffffff; margin-bottom: 1rem; }
        .quiz-option { display: block; width: 100%; text-align: left; background: #0a0a0f; border: 2px solid #3f3f46; border-radius: 8px; padding: 0.875rem 1rem; margin-bottom: 0.5rem; color: #d4d4d8; cursor: pointer; transition: all 0.2s; }
        .quiz-option:hover { border-color: #FFBD59; background: rgba(255,189,89,0.05); }
        .quiz-option.correct { background: rgba(16,185,129,0.2); border-color: #10B981; color: #10B981; }
        .quiz-option.incorrect { background: rgba(239,68,68,0.2); border-color: #EF4444; color: #EF4444; }
        .quiz-result { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; font-weight: 500; display: none; text-align: center; }
        .quiz-result.show { display: block; }
        .quiz-result.correct { background: rgba(16,185,129,0.2); color: #10B981; }
        .quiz-result.incorrect { background: rgba(239,68,68,0.2); color: #EF4444; }
        .quiz-score { text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(255,189,89,0.2), rgba(139,92,246,0.1)); border-radius: 8px; margin-top: 1rem; display: none; }
        .quiz-score.show { display: block; }
        .quiz-score-text { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
        .retake-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .lesson-footer { text-align: center; padding: 2rem 1rem; color: #71717a; font-size: 0.85rem; border-top: 1px solid #27272a; margin: 2rem 1rem 0; }
        @media (max-width: 600px) {
            .container { padding: 0; }
            .content-section, .summary-box, .quiz-section { margin: 0.5rem 0; border-radius: 0; padding: 1.25rem 1rem; }
            .lesson-header { padding: 1.5rem 1rem; }
            .lesson-title { font-size: 1.5rem; }
            .partner-benefits { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="lesson-header">
            <span class="tier-badge">TIER 3 - Elite</span>
            <h1 class="lesson-title">Tốt Nghiệp & Đối Tác</h1>
            <p class="lesson-subtitle">Chứng Chỉ TIER 3 & Cơ Hội Partnership</p>
        </header>

        <section class="content-section">
            <div class="section-icon">🎓</div>
            <h2 class="section-title">Chúc Mừng! Bạn Đã Hoàn Thành</h2>
            <p>Sau hành trình qua 3 Tier và 25+ chapters, bạn đã sở hữu bộ kiến thức và kỹ năng của một <strong style="color: #FFBD59;">Elite Trader</strong>. Đây không phải điểm kết thúc, mà là điểm bắt đầu của một chương mới.</p>

            <div class="certificate-box">
                <h3>🏆 CHỨNG CHỈ HOÀN THÀNH</h3>
                <p class="title">GEM Trading Academy - TIER 3 ELITE</p>
                <p style="color: #a1a1aa; margin-bottom: 0;">Đã hoàn thành đầy đủ chương trình đào tạo nâng cao</p>
            </div>

            <div class="highlight-box">
                <p><strong>📋 Những Gì Bạn Đã Đạt Được:</strong></p>
                <ul style="margin-bottom: 0;">
                    <li>Thành thạo 24 patterns của GEM Trading System</li>
                    <li>Hiểu sâu về Flag, Pennant, và Candlestick patterns</li>
                    <li>Sử dụng AI Signals và Whale Tracking</li>
                    <li>Quản lý danh mục và risk như professional</li>
                    <li>Kiểm soát tâm lý với hệ thống Karma</li>
                </ul>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/FFBD59?text=Elite+Trader+Certificate" alt="Certificate">
                <p class="image-caption">Chứng chỉ GEM Trading Academy - TIER 3 Elite</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🤝</div>
            <h2 class="section-title">Cơ Hội Trở Thành Partner</h2>
            <p>Với việc hoàn thành Tier 3, bạn đủ điều kiện tham gia <strong style="color: #8B5CF6;">Chương Trình Đối Tác GEM</strong>. Đây là cơ hội tạo thu nhập bằng cách chia sẻ kiến thức đã học.</p>

            <div class="partner-card">
                <h4>🌟 Hệ Thống CTV 5 Tier</h4>
                <ol>
                    <li><strong>Bronze (Đồng):</strong> Bắt đầu ngay, 10% Digital, 6% Physical</li>
                    <li><strong>Silver (Bạc):</strong> Từ 50M doanh số, 15% Digital, 8% Physical</li>
                    <li><strong>Gold (Vàng):</strong> Từ 150M, 20% Digital, 10% Physical</li>
                    <li><strong>Platinum (Bạch Kim):</strong> Từ 400M, 25% Digital, 12% Physical</li>
                    <li><strong>Diamond (Kim Cương):</strong> Từ 800M, 30% Digital, 15% Physical</li>
                </ol>
            </div>

            <div class="partner-benefits">
                <div class="benefit-item">
                    <div class="value">10-30%</div>
                    <div class="label">Digital theo Tier</div>
                </div>
                <div class="benefit-item">
                    <div class="value">6-15%</div>
                    <div class="label">Physical theo Tier</div>
                </div>
                <div class="benefit-item">
                    <div class="value">2-4%</div>
                    <div class="label">Sub-Affiliate</div>
                </div>
                <div class="benefit-item">
                    <div class="value">∞</div>
                    <div class="label">Recurring Income</div>
                </div>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/8B5CF6?text=Partnership+Tiers+Diagram" alt="Partnership Tiers">
                <p class="image-caption">3 cấp độ Partnership và lộ trình thăng tiến</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">💰</div>
            <h2 class="section-title">Bảng Hoa Hồng CTV 5 Tier</h2>
            <p>Chi tiết hoa hồng theo từng tier (sản phẩm Digital):</p>

            <table class="commission-table">
                <thead>
                    <tr>
                        <th>Tier</th>
                        <th>Ngưỡng</th>
                        <th>Digital</th>
                        <th>Physical</th>
                        <th>Sub-Aff</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>🥉 Bronze (Đồng)</td>
                        <td>0đ</td>
                        <td class="rate">10%</td>
                        <td>6%</td>
                        <td>2%</td>
                    </tr>
                    <tr>
                        <td>🥈 Silver (Bạc)</td>
                        <td>50M</td>
                        <td class="rate">15%</td>
                        <td>8%</td>
                        <td>2.5%</td>
                    </tr>
                    <tr>
                        <td>🥇 Gold (Vàng)</td>
                        <td>150M</td>
                        <td class="rate">20%</td>
                        <td>10%</td>
                        <td>3%</td>
                    </tr>
                    <tr>
                        <td>💎 Platinum</td>
                        <td>400M</td>
                        <td class="rate">25%</td>
                        <td>12%</td>
                        <td>3.5%</td>
                    </tr>
                    <tr>
                        <td>💠 Diamond</td>
                        <td>800M</td>
                        <td class="rate">30%</td>
                        <td>15%</td>
                        <td>4%</td>
                    </tr>
                </tbody>
            </table>

            <div class="highlight-box">
                <p style="margin-bottom: 0;"><strong>💡 Ví Dụ:</strong> CTV Bronze bán khóa TIER 1 (2M) → Nhận 200,000đ (10%). Nếu lên Diamond → Nhận 600,000đ (30%) cho cùng sản phẩm!</p>
            </div>
        </section>

        <section class="content-section">
            <div class="section-icon">🚀</div>
            <h2 class="section-title">Các Bước Tiếp Theo</h2>
            <p>Để bắt đầu hành trình Partner:</p>

            <ol>
                <li><strong>Đăng ký CTV:</strong> Liên hệ support để nhận link affiliate cá nhân</li>
                <li><strong>Nhận marketing kit:</strong> Banners, scripts, content templates</li>
                <li><strong>Bắt đầu chia sẻ:</strong> Social media, groups, word of mouth</li>
                <li><strong>Track & Optimize:</strong> Dashboard theo dõi conversions</li>
                <li><strong>Thăng cấp:</strong> 10 referrals → Đại Đối Tác eligible</li>
            </ol>

            <div class="highlight-box purple">
                <p style="margin-bottom: 0;"><strong>🎯 Mục Tiêu:</strong> Nhiều CTV đã đạt thu nhập 50-100 triệu/tháng từ affiliate. Bạn có thể là người tiếp theo!</p>
            </div>

            <div class="image-placeholder">
                <img src="https://placehold.co/700x400/112250/10B981?text=Partner+Success+Stories" alt="Success Stories">
                <p class="image-caption">Câu chuyện thành công từ các Partners</p>
            </div>
        </section>

        <section class="summary-box">
            <h3>📝 Tóm Tắt Bài Học</h3>
            <ul>
                <li><strong>Hoàn thành TIER 3</strong> = Chứng chỉ Elite Trader</li>
                <li><strong>CTV 5 Tier:</strong> Bronze → Silver → Gold → Platinum → Diamond</li>
                <li><strong>Hoa hồng Digital:</strong> 10% (Bronze) đến 30% (Diamond)</li>
                <li><strong>Recurring income:</strong> Thu nhập thụ động từ referrals + Sub-Aff</li>
                <li><strong>Bắt đầu ngay:</strong> Đăng ký trong app GEM → Account → Affiliate</li>
            </ul>
        </section>

        <section class="quiz-section">
            <h2 class="quiz-title">📝 Kiểm Tra Kiến Thức</h2>

            <div class="quiz-question" data-correct="1">
                <p class="question-text">1. Hoa hồng CTV cho sản phẩm Full Bundle là bao nhiêu?</p>
                <button class="quiz-option" data-index="0">1,500,000đ</button>
                <button class="quiz-option" data-index="1">2,400,000đ</button>
                <button class="quiz-option" data-index="2">3,200,000đ</button>
                <button class="quiz-option" data-index="3">4,000,000đ</button>
                <div class="quiz-result"></div>
            </div>

            <div class="quiz-question" data-correct="0">
                <p class="question-text">2. Cần bao nhiêu referrals để đủ điều kiện thăng cấp Đại Đối Tác?</p>
                <button class="quiz-option" data-index="0">10 referrals</button>
                <button class="quiz-option" data-index="1">5 referrals</button>
                <button class="quiz-option" data-index="2">20 referrals</button>
                <button class="quiz-option" data-index="3">50 referrals</button>
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
