/**
 * Gemral - Tooltip & Feature Discovery Configuration
 * 77 tooltips across 12 categories
 * 15 feature discovery prompts
 *
 * Uses lucide-react-native icons
 * Vietnamese with diacritics
 * Design tokens from utils/tokens.js
 */

// ═══════════════════════════════════════════════════════════════════════════
// TOOLTIPS - 77 tooltips total
// ═══════════════════════════════════════════════════════════════════════════

export const TOOLTIPS = {
  // ═══════════════════════════════════════════════════════════════════════
  // SCANNER TOOLTIPS (13 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  scanner_intro: {
    key: 'scanner_intro',
    title: 'Chào mừng đến Scanner!',
    message:
      'Chọn coin và timeframe, sau đó nhấn SCAN để phát hiện patterns tự động với độ chính xác 68%+.',
    screen: 'Scanner',
    position: 'bottom',
    showOnce: true,
    priority: 1,
  },
  scanner_coin_select: {
    key: 'scanner_coin_select',
    title: 'Chọn Coin',
    message:
      'Nhấn để chọn coin muốn scan. Hỗ trợ 100+ cặp giao dịch phổ biến trên Binance.',
    screen: 'Scanner',
    targetRef: 'coinSelector',
    position: 'bottom',
    trigger: 'first_visit',
  },
  scanner_timeframe: {
    key: 'scanner_timeframe',
    title: 'Khung thời gian',
    message:
      '15m - 1h cho scalping, 4h - 1D cho swing trading. Mỗi timeframe có pattern riêng.',
    screen: 'Scanner',
    targetRef: 'timeframeSelector',
    position: 'bottom',
  },
  scanner_scan_button: {
    key: 'scanner_scan_button',
    title: 'Nút Scan',
    message:
      'Nhấn để bắt đầu quét patterns. FREE tier có 5 lần/ngày, TIER 1+ không giới hạn.',
    screen: 'Scanner',
    targetRef: 'scanButton',
    position: 'top',
  },
  scanner_results: {
    key: 'scanner_results',
    title: 'Kết quả Scan',
    message:
      'Patterns được xếp hạng theo độ tin cậy (%). Nhấn vào pattern để xem chi tiết và trading plan.',
    screen: 'Scanner',
    trigger: 'after_first_scan',
    position: 'top',
    showOnce: true,
  },
  scanner_pattern_card: {
    key: 'scanner_pattern_card',
    title: 'Pattern Card',
    message:
      'Hiển thị loại pattern, độ tin cậy, entry/target/stoploss. Swipe trái để xem thêm.',
    screen: 'Scanner',
    trigger: 'after_first_scan',
    position: 'bottom',
  },
  scanner_favorites: {
    key: 'scanner_favorites',
    title: 'Lưu Favorites',
    message:
      'Nhấn biểu tượng sao để lưu coin yêu thích. Scan nhanh hơn mà không cần chọn lại!',
    screen: 'Scanner',
    trigger: 'after_3_scans',
    position: 'right',
  },
  scanner_multi_tf: {
    key: 'scanner_multi_tf',
    title: 'Multi-Timeframe Scan',
    message:
      'TIER 2+ có thể scan nhiều timeframe cùng lúc. Pattern xuất hiện ở nhiều TF = Tín hiệu mạnh!',
    screen: 'Scanner',
    tier: 'tier2',
    position: 'bottom',
  },
  scanner_alerts: {
    key: 'scanner_alerts',
    title: 'Đặt Alert',
    message:
      'TIER 1+ có thể đặt alert cho coin. Nhận thông báo khi có pattern mới xuất hiện!',
    screen: 'Scanner',
    tier: 'tier1',
    position: 'bottom',
  },
  scanner_history: {
    key: 'scanner_history',
    title: 'Lịch sử Scan',
    message:
      'Xem lại các patterns đã scan trước đó. Theo dõi kết quả thực tế để học hỏi.',
    screen: 'ScanHistory',
    showOnce: true,
  },

  // Pattern Detail Tooltips
  pattern_detail_intro: {
    key: 'pattern_detail_intro',
    title: 'Chi tiết Pattern',
    message:
      'Đây là phân tích chi tiết của pattern. Bao gồm entry, targets, stoploss và R:R ratio.',
    screen: 'PatternDetail',
    showOnce: true,
  },
  pattern_trading_plan: {
    key: 'pattern_trading_plan',
    title: 'Trading Plan',
    message:
      'Kế hoạch giao dịch được AI tự động tạo. Copy và paste vào sổ trading journal của bạn.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  pattern_confidence: {
    key: 'pattern_confidence',
    title: 'Độ tin cậy',
    message:
      'Phần trăm dựa trên backtest historical data. >70% = Tín hiệu mạnh, 50-70% = Trung bình.',
    screen: 'PatternDetail',
    targetRef: 'confidenceBar',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // QUASIMODO (QM) PATTERN TOOLTIPS (6 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  qm_pattern_intro: {
    key: 'qm_pattern_intro',
    title: 'Quasimodo Pattern',
    message:
      'Pattern đảo chiều mạnh nhất (5 sao). Bắt đỉnh/đáy với độ chính xác 73-75%. Giống Head & Shoulders nhưng mạnh hơn!',
    screen: 'PatternDetail',
    showOnce: true,
    priority: 1,
  },
  qm_structure: {
    key: 'qm_structure',
    title: 'Cấu trúc QM',
    message:
      'QM gồm 4 phần: LS (Left Shoulder) → HEAD → RS (Right Shoulder) → BOS. RS không vượt được HEAD là dấu hiệu đảo chiều.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  qm_qml_level: {
    key: 'qm_qml_level',
    title: 'QML - Entry Point',
    message:
      'QML (Quasimodo Level) là điểm entry tối ưu. Đây là Higher Low trước Head (bullish) hoặc Lower High trước Head (bearish).',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  qm_mpl_level: {
    key: 'qm_mpl_level',
    title: 'MPL - Stop Level',
    message:
      'MPL (Maximum Pain Level) = Head price. Đặt stop loss qua MPL + buffer. Nếu giá vượt MPL, pattern thất bại.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  qm_bos: {
    key: 'qm_bos',
    title: 'BOS - Xác nhận',
    message:
      'BOS (Break of Structure) là xác nhận cuối cùng. Bearish QM cần Lower Low, Bullish QM cần Higher High.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  qm_trading_rules: {
    key: 'qm_trading_rules',
    title: 'Quy tắc giao dịch QM',
    message:
      'Entry: Tại QML. Stop: Trên/dưới MPL + buffer. Target: 2-3x risk. Đợi BOS xác nhận trước khi vào lệnh.',
    screen: 'PatternDetail',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // FTR (FAIL TO RETURN) PATTERN TOOLTIPS (6 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  ftr_pattern_intro: {
    key: 'ftr_pattern_intro',
    title: 'FTR Pattern',
    message:
      'FTR = Fail To Return. Pattern continuation mạnh (4 sao). Xảy ra khi giá phá S/R rồi không quay lại được.',
    screen: 'PatternDetail',
    showOnce: true,
    priority: 1,
  },
  ftr_structure: {
    key: 'ftr_structure',
    title: 'Cấu trúc FTR',
    message:
      'FTR gồm: S/R level bị phá → Base zone hình thành → Confirmation với new high/low. Base zone trở thành vùng demand/supply mới.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  ftr_freshness: {
    key: 'ftr_freshness',
    title: 'FTB - First Time Back',
    message:
      'FTB (First Time Back) = Lần đầu giá quay về zone. Zone chưa test = Fresh (tốt nhất). Mỗi lần test, zone yếu đi.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  ftr_zone: {
    key: 'ftr_zone',
    title: 'FTR Zone',
    message:
      'Zone là vùng base sau khi phá S/R. Entry tại cạnh gần (near price), Stop tại cạnh xa (far price) + buffer.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  ftr_break_percent: {
    key: 'ftr_break_percent',
    title: 'Break Percent',
    message:
      'Phần trăm giá di chuyển sau khi phá S/R. Break >1% = mạnh. Break <0.5% = yếu, có thể là fake breakout.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  ftr_return_percent: {
    key: 'ftr_return_percent',
    title: 'Return Ratio',
    message:
      'Tỷ lệ pullback so với break distance. Return <30% = FTR sạch. Return >50% = deep pullback, giảm độ tin cậy.',
    screen: 'PatternDetail',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ZONE CONCEPT TOOLTIPS (5 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  zone_concept_intro: {
    key: 'zone_concept_intro',
    title: 'Zone Trading',
    message:
      'Zone là vùng giá quan trọng thay vì level cố định. HFZ = Supply (bán), LFZ = Demand (mua). Entry tại cạnh gần, Stop tại cạnh xa.',
    screen: 'PatternDetail',
    showOnce: true,
    priority: 1,
  },
  zone_hfz: {
    key: 'zone_hfz',
    title: 'HFZ - Vùng Cung',
    message:
      'HFZ (High Flip Zone) = Vùng Supply. Giá từ dưới đi lên sẽ bị chặn. Entry = LOW của zone, Stop = HIGH của zone.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  zone_lfz: {
    key: 'zone_lfz',
    title: 'LFZ - Vùng Cầu',
    message:
      'LFZ (Low Flip Zone) = Vùng Demand. Giá từ trên đi xuống sẽ được nâng. Entry = HIGH của zone, Stop = LOW của zone.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  zone_width: {
    key: 'zone_width',
    title: 'Độ rộng Zone',
    message:
      'Zone width = Entry - Stop. Zone hẹp (<1%) = Entry chính xác hơn. Zone rộng (>3%) = Cần scale-in hoặc bỏ qua.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  zone_validation: {
    key: 'zone_validation',
    title: 'Kiểm tra Zone',
    message:
      'Zone hợp lệ: Width <3%, R:R >1:2, chưa bị test nhiều lần. Zone không hợp lệ có cảnh báo màu vàng.',
    screen: 'PatternDetail',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ODDS ENHANCERS TOOLTIPS (10 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  odds_enhancers_intro: {
    key: 'odds_enhancers_intro',
    title: 'Odds Enhancers',
    message:
      'Hệ thống 8 tiêu chí chấm điểm zone (0-16). Grade A+ = 14-16 điểm, tăng win rate 10-12%!',
    screen: 'PatternDetail',
    showOnce: true,
    priority: 1,
  },
  odds_departure_strength: {
    key: 'odds_departure_strength',
    title: 'Sức Mạnh Thoát Ly',
    message:
      'Độ mạnh của nến rời khỏi zone. Nến mạnh (body >= 70%, ít wick) = 2 điểm. Nến yếu = 0 điểm.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  odds_time_at_level: {
    key: 'odds_time_at_level',
    title: 'Thời Gian Tại Vùng',
    message:
      'Số nến trong vùng pause. 1-2 nến = 2 điểm (fresh orders). >6 nến = 0 điểm (orders đã fill).',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  odds_freshness: {
    key: 'odds_freshness',
    title: 'Độ Tươi Mới',
    message:
      'Số lần zone đã được test. FTB (chưa test) = 2 điểm. 1-2 lần = 1 điểm. 3+ lần = 0 điểm (stale).',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  odds_profit_margin: {
    key: 'odds_profit_margin',
    title: 'Biên Lợi Nhuận',
    message:
      'Khoảng cách đến opposing zone. >4x zone width = 2 điểm. <2x = 0 điểm (không đủ room).',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  odds_big_picture: {
    key: 'odds_big_picture',
    title: 'Xu Hướng Lớn',
    message:
      'Zone cùng hướng với HTF trend. LFZ + uptrend = 2 điểm. Ngược trend = 0 điểm.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  odds_zone_origin: {
    key: 'odds_zone_origin',
    title: 'Nguồn Gốc Zone',
    message:
      'Loại pattern tạo zone. Decision Point/QM = 2 điểm. FTR/FL = 1 điểm. Regular = 0 điểm.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  odds_arrival_speed: {
    key: 'odds_arrival_speed',
    title: 'Tốc Độ Tiếp Cận',
    message:
      'Giá tiếp cận zone. Chậm, yếu dần (compression) = 2 điểm. Nhanh, mạnh = 0 điểm (có thể break).',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  odds_risk_reward: {
    key: 'odds_risk_reward',
    title: 'Tỷ Lệ R:R',
    message:
      'Tỷ lệ lợi nhuận/rủi ro. >3:1 = 2 điểm. 2-3:1 = 1 điểm. <2:1 = 0 điểm (không nên trade).',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  odds_grade_meaning: {
    key: 'odds_grade_meaning',
    title: 'Ý Nghĩa Grade',
    message:
      'A+ (14-16): Full size. A (12-13): 75%. B (10-11): 50%. C (8-9): 25%. D-F: Skip trade.',
    screen: 'PatternDetail',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // FRESHNESS TRACKING TOOLTIPS (5 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  freshness_intro: {
    key: 'freshness_intro',
    title: 'Zone Freshness',
    message:
      'Theo dõi độ "tươi" của zone. Mỗi lần test, ~35% orders được fill. Zone càng fresh càng tốt!',
    screen: 'PatternDetail',
    showOnce: true,
    priority: 1,
  },
  freshness_ftb: {
    key: 'freshness_ftb',
    title: 'FTB - First Time Back',
    message:
      'Lần đầu tiên giá quay về zone. 100% orders còn nguyên. Cơ hội tốt nhất để entry!',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  freshness_orders: {
    key: 'freshness_orders',
    title: 'Order Absorption',
    message:
      'Mỗi test, ~35% orders bị fill. FTB: 100%. 1 test: ~65%. 2 test: ~42%. 3+ test: <30% (stale).',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  freshness_status: {
    key: 'freshness_status',
    title: 'Trạng Thái Zone',
    message:
      'Fresh (xanh): 0 test. Tested (vàng): 1-2 test. Stale (đỏ): 3+ test - nên skip.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  freshness_best_practice: {
    key: 'freshness_best_practice',
    title: 'Best Practice',
    message:
      'Ưu tiên trade FTB zones. Tránh zone đã test 3+ lần. Kết hợp với Odds Enhancers để chọn setup tốt nhất.',
    screen: 'PatternDetail',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ZONE HIERARCHY TOOLTIPS (8 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  hierarchy_intro: {
    key: 'hierarchy_intro',
    title: 'Thứ Bậc Zone',
    message:
      'Không phải zone nào cũng như nhau! GEM phân loại zones theo thứ bậc: DP > FTR > FL > Regular.',
    screen: 'PatternDetail',
    showOnce: true,
    priority: 1,
  },
  hierarchy_decision_point: {
    key: 'hierarchy_decision_point',
    title: 'Decision Point (DP)',
    message:
      'Origin của major move. Nơi Smart Money bắt đầu accumulate/distribute. Zone mạnh nhất, 5 sao.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  hierarchy_ftr: {
    key: 'hierarchy_ftr',
    title: 'Fail To Return (FTR)',
    message:
      'Zone sau khi break S/R. Price không quay lại được = Smart Money đang add positions. 4 sao.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  hierarchy_flag_limit: {
    key: 'hierarchy_flag_limit',
    title: 'Flag Limit (FL)',
    message:
      'UPU/DPD với base chỉ 1-2 nến. Quick pause trong trend. Khi FL bị engulf = Price đến FL tiếp theo. 3 sao.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  hierarchy_regular: {
    key: 'hierarchy_regular',
    title: 'Regular Zone',
    message:
      'Zone thông thường. Cần thêm confluence (HTF alignment, freshness, odds score) để trade. 2 sao.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  hierarchy_priority: {
    key: 'hierarchy_priority',
    title: 'Ưu Tiên Zone',
    message:
      'Khi có nhiều zone, ưu tiên: DP > FTR > FL > Regular. DP và FTR là "premium zones" nên trade đầu tiên.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  flag_limit_rules: {
    key: 'flag_limit_rules',
    title: 'Quy Tắc FL',
    message:
      'FL phải có base 1-2 nến. Pattern: UPU (bullish) hoặc DPD (bearish). Khi FL bị engulf, price di chuyển đến FL tiếp theo.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  decision_point_rules: {
    key: 'decision_point_rules',
    title: 'Quy Tắc DP',
    message:
      'DP = Origin của move lớn (>3%). Move phải impulsive (>60% nến cùng hướng). Entry tại zone, Target: FL tiếp theo.',
    screen: 'PatternDetail',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // STACKED ZONES + HIDDEN FTR + FTB TOOLTIPS (10 tooltips) - Phase 2B
  // ═══════════════════════════════════════════════════════════════════════

  stacked_zones_intro: {
    key: 'stacked_zones_intro',
    title: 'Stacked Zones',
    message:
      'Khi nhiều zones chồng lên nhau tại cùng vùng giá = Confluence CỰC MẠNH! Đây là A+ Setup.',
    screen: 'PatternDetail',
    showOnce: true,
    priority: 1,
  },
  stacked_confluence_score: {
    key: 'stacked_confluence_score',
    title: 'Confluence Score',
    message:
      'Mỗi zone chồng = +1 điểm. Multi-TF = +2. DP/FTR = +2-3. Score ≥15 = A+ Setup. Score ≥10 = A Setup.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  stacked_tightest_zone: {
    key: 'stacked_tightest_zone',
    title: 'Entry Tại Zone Hẹp Nhất',
    message:
      'Khi có stacked zones, entry tại zone nhỏ nhất (tight zone). SL tại stop của zone lớn nhất = R:R tốt nhất.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  hidden_ftr_intro: {
    key: 'hidden_ftr_intro',
    title: 'Hidden FTR',
    message:
      'FTR ẩn bên trong HTF zone. Zoom xuống LTF để tìm. Giúp refine entry và giảm stop loss.',
    screen: 'PatternDetail',
    showOnce: true,
    priority: 1,
  },
  hidden_ftr_refinement: {
    key: 'hidden_ftr_refinement',
    title: 'Zone Refinement',
    message:
      'Hidden FTR giảm zone width 30-60%. VD: 1D zone 200 pips → 4H Hidden FTR chỉ 80 pips. R:R tăng 2-3x.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  hidden_ftr_ltf_mapping: {
    key: 'hidden_ftr_ltf_mapping',
    title: 'LTF Mapping',
    message:
      '1D → 4H/1H. 4H → 1H/30m. 1H → 15m/5m. Luôn check 2 LTF liên tiếp để tìm Hidden FTR.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  ftb_intro: {
    key: 'ftb_intro',
    title: 'FTB - First Time Back',
    message:
      'Lần ĐẦU TIÊN giá quay về zone sau khi form. Zone còn 100% orders. Entry tốt nhất với win rate cao nhất!',
    screen: 'PatternDetail',
    showOnce: true,
    priority: 1,
  },
  ftb_orders_remaining: {
    key: 'ftb_orders_remaining',
    title: 'Orders Remaining',
    message:
      'FTB: 100% orders. Test 1x: ~70%. Test 2x: ~50%. Test 3+: <30% (stale). Ưu tiên FTB zones!',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  ftb_quality_tiers: {
    key: 'ftb_quality_tiers',
    title: 'FTB Quality Tiers',
    message:
      'Perfect: Đang trong zone + FTB. Excellent: Gần zone <0.5% + FTB. Good: Đang tiến đến + FTB.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  zone_in_zone: {
    key: 'zone_in_zone',
    title: 'Zone-in-Zone (Nested)',
    message:
      'LTF zone nằm hoàn toàn bên trong HTF zone. Cùng direction = Double confluence = Entry chính xác.',
    screen: 'PatternDetail',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // COMPRESSION + INDUCEMENT + LOOK RIGHT TOOLTIPS (12 tooltips) - Phase 2C
  // ═══════════════════════════════════════════════════════════════════════

  compression_intro: {
    key: 'compression_intro',
    title: 'Compression Pattern',
    message:
      'Khi giá nén lại (triangle/wedge) tiến vào zone = Momentum giảm, năng lượng tích tụ. A+ Setup!',
    screen: 'PatternDetail',
    showOnce: true,
    priority: 1,
  },
  compression_types: {
    key: 'compression_types',
    title: 'Loại Compression',
    message:
      'Descending Triangle vào LFZ = BULLISH. Ascending Triangle vào HFZ = BEARISH. Symmetrical theo zone type.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  compression_quality: {
    key: 'compression_quality',
    title: 'Chất Lượng Compression',
    message:
      'Excellent: Nén >60%, 5+ waves. Good: Nén 40-60%. Moderate: <40%. Chất lượng cao = Win rate cao.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  compression_wedges: {
    key: 'compression_wedges',
    title: 'Falling/Rising Wedge',
    message:
      'Falling Wedge vào LFZ = VERY BULLISH. Rising Wedge vào HFZ = VERY BEARISH. Strong reversal setup.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  inducement_intro: {
    key: 'inducement_intro',
    title: 'Inducement / Stop Hunt',
    message:
      'Smart Money grab liquidity trước khi di chuyển thật. Wick dài + close ngược = Inducement!',
    screen: 'PatternDetail',
    showOnce: true,
    priority: 1,
  },
  inducement_mechanism: {
    key: 'inducement_mechanism',
    title: 'Cơ Chế Inducement',
    message:
      '1. Price break S/R tạm thời. 2. Kích hoạt stop loss. 3. SM absorb liquidity. 4. Price đảo chiều mạnh.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  inducement_bullish: {
    key: 'inducement_bullish',
    title: 'Bullish Inducement',
    message:
      'Wick dài xuống dưới zone, close trên zone = Stops bị sweep. SM đã accumulate. Tìm điểm BUY.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  inducement_bearish: {
    key: 'inducement_bearish',
    title: 'Bearish Inducement',
    message:
      'Wick dài lên trên zone, close dưới zone = Stops bị sweep. SM đã distribute. Tìm điểm SELL.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  inducement_reversal: {
    key: 'inducement_reversal',
    title: 'Xác Nhận Reversal',
    message:
      'Sau inducement, đợi 2+ nến ngược hướng để xác nhận. Reversal confirmed = Entry opportunity.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  look_right_intro: {
    key: 'look_right_intro',
    title: 'Look To The Right',
    message:
      'Sau khi tìm zone, PHẢI check bên phải chart. Zone đã bị phá = KHÔNG trade. Zone intact = Valid.',
    screen: 'PatternDetail',
    showOnce: true,
    priority: 1,
  },
  look_right_validation: {
    key: 'look_right_validation',
    title: 'Zone Validation',
    message:
      'FRESH: 0 test. TESTED: 1-2 wicks nhưng chưa close qua. BROKEN: 2+ closes beyond zone = SKIP.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  look_right_confidence: {
    key: 'look_right_confidence',
    title: 'Confidence Score',
    message:
      '100%: Zone chưa bị test. Mỗi wick -5-10%. Mỗi close beyond -30%. <50% = High risk, cân nhắc skip.',
    screen: 'PatternDetail',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIRMATION PATTERNS TOOLTIPS (12 tooltips) - Phase 3A
  // ═══════════════════════════════════════════════════════════════════════

  confirmation_intro: {
    key: 'confirmation_intro',
    title: 'Confirmation Patterns',
    message:
      'Sau khi price vào zone, chờ CONFIRMATION trước khi entry! Confirmation = Nến cho thấy price sẽ reverse.',
    screen: 'PatternDetail',
    showOnce: true,
    priority: 1,
  },
  confirmation_engulfing: {
    key: 'confirmation_engulfing',
    title: 'Engulfing Pattern',
    message:
      'Nến hiện tại "nuốt trọn" nến trước đó. Bullish Engulfing = BUY. Bearish Engulfing = SELL. Engulfing càng lớn = Signal càng mạnh!',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  confirmation_pin_bar: {
    key: 'confirmation_pin_bar',
    title: 'Pin Bar / Rejection',
    message:
      'Nến có râu dài, body nhỏ. Râu dưới dài = Rejection từ dưới = BUY. Râu trên dài = Rejection từ trên = SELL.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  confirmation_hammer: {
    key: 'confirmation_hammer',
    title: 'Hammer & Shooting Star',
    message:
      'Hammer = Pin Bar sau downtrend = BUY signal mạnh. Shooting Star = Pin Bar sau uptrend = SELL signal mạnh.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  confirmation_inside_bar: {
    key: 'confirmation_inside_bar',
    title: 'Inside Bar',
    message:
      'Nến nằm hoàn toàn trong range nến trước = Consolidation. Đợi breakout để xác định hướng. Entry khi break mother bar.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  confirmation_doji: {
    key: 'confirmation_doji',
    title: 'Doji Pattern',
    message:
      'Open ≈ Close = Indecision. Doji một mình chưa đủ, cần confirmation từ nến tiếp theo. Doji + Engulfing = Strong signal!',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  confirmation_morning_star: {
    key: 'confirmation_morning_star',
    title: 'Morning Star',
    message:
      '3-candle bullish reversal: Nến giảm mạnh → Doji/nhỏ → Nến tăng mạnh. Signal cực mạnh (4 điểm)!',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  confirmation_evening_star: {
    key: 'confirmation_evening_star',
    title: 'Evening Star',
    message:
      '3-candle bearish reversal: Nến tăng mạnh → Doji/nhỏ → Nến giảm mạnh. Signal cực mạnh (4 điểm)!',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  confirmation_score: {
    key: 'confirmation_score',
    title: 'Confirmation Score',
    message:
      'Engulfing/Morning Star: 3-4 điểm. Pin Bar/Hammer: 2-3 điểm. Inside Bar/Doji: 1 điểm. Score ≥3 = Entry với confidence!',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  confirmation_strength: {
    key: 'confirmation_strength',
    title: 'Độ Mạnh Confirmation',
    message:
      'Strong (≥5 điểm): Full position. Moderate (3-4 điểm): 75% position. Weak (1-2 điểm): 50% hoặc skip.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  confirmation_zone_match: {
    key: 'confirmation_zone_match',
    title: 'Zone + Confirmation',
    message:
      'LFZ (Demand) → cần Bullish confirmation (Bullish Engulfing, Hammer). HFZ (Supply) → cần Bearish confirmation.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  confirmation_entry_trigger: {
    key: 'confirmation_entry_trigger',
    title: 'Entry Trigger',
    message:
      'Sau khi có confirmation: Engulfing → entry tại close. Pin Bar → entry break high/low. Inside Bar → entry break mother bar.',
    screen: 'PatternDetail',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // EXTENDED ZONES + MPL + PIN ENGULF COMBO TOOLTIPS (12 tooltips) - Phase 3B
  // ═══════════════════════════════════════════════════════════════════════

  extended_zone_intro: {
    key: 'extended_zone_intro',
    title: 'Extended Zones',
    message:
      'Khi giá tạo new high/low trong quá trình accumulate/distribute, zone MỞ RỘNG. Stop loss di chuyển, nhiều orders hơn!',
    screen: 'PatternDetail',
    showOnce: true,
    priority: 1,
  },
  extended_zone_hfz: {
    key: 'extended_zone_hfz',
    title: 'HFZ Extension',
    message:
      'HFZ (Supply) mở rộng khi có new HIGH. Stop loss di chuyển lên. Entry giữ nguyên tại cạnh dưới zone.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  extended_zone_lfz: {
    key: 'extended_zone_lfz',
    title: 'LFZ Extension',
    message:
      'LFZ (Demand) mở rộng khi có new LOW. Stop loss di chuyển xuống. Entry giữ nguyên tại cạnh trên zone.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  extended_zone_risk: {
    key: 'extended_zone_risk',
    title: 'Risk Adjustment',
    message:
      'Zone mở rộng = Stop xa hơn = Risk tăng. Giảm position size tương ứng để giữ risk cố định (% của account).',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  mpl_intro: {
    key: 'mpl_intro',
    title: 'MPL - Most Penetrated Level',
    message:
      'Trong zone có nhiều mức giá. MPL là mức bị "đâm xuyên" nhiều nhất - nơi Smart Money đặt orders nhiều nhất.',
    screen: 'PatternDetail',
    showOnce: true,
    priority: 1,
  },
  mpl_entry: {
    key: 'mpl_entry',
    title: 'MPL Entry',
    message:
      'Dùng MPL làm entry thay vì cạnh zone. Stop nhỏ hơn = R:R cải thiện đáng kể. Excellent MPL = A+ Entry.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  mpl_quality: {
    key: 'mpl_quality',
    title: 'MPL Quality',
    message:
      'Excellent: 5+ penetrations, vị trí optimal. Good: 3-4 penetrations. Moderate: 2 penetrations - cân nhắc dùng zone edge.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  mpl_calculation: {
    key: 'mpl_calculation',
    title: 'Cách Tính MPL',
    message:
      'Chia zone thành 10 levels. Đếm số lần wick đâm qua mỗi level rồi close ngược lại. Level nhiều nhất = MPL.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  pin_engulf_combo_intro: {
    key: 'pin_engulf_combo_intro',
    title: 'Pin + Engulf Combo',
    message:
      'Khi có CẢ Pin Bar VÀ Engulfing tại zone = Signal CỰC MẠNH! Reliability > 85%. A+ Entry opportunity.',
    screen: 'PatternDetail',
    showOnce: true,
    priority: 1,
  },
  pin_engulf_types: {
    key: 'pin_engulf_types',
    title: 'Loại Combo',
    message:
      'Pin → Engulf (phổ biến): +2 bonus. Same candle (hiếm): +3 bonus. Continuation: +1 bonus. Score combo >= 7 = A+ Setup.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  pin_engulf_entry: {
    key: 'pin_engulf_entry',
    title: 'Combo Entry',
    message:
      'Entry tại close của engulfing candle. Stop tại low/high của cả 2 nến. Full position size cho combo setup.',
    screen: 'PatternDetail',
    position: 'bottom',
  },
  pin_engulf_vs_single: {
    key: 'pin_engulf_vs_single',
    title: 'Combo vs Single Pattern',
    message:
      'Combo luôn ưu tiên hơn single pattern. Score cao hơn 3-5 điểm. Reliability cao hơn 10-15%. Đây là setup TỐT NHẤT!',
    screen: 'PatternDetail',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SMART ALERTS TOOLTIPS (12 tooltips) - Phase 3C
  // ═══════════════════════════════════════════════════════════════════════

  smart_alerts_intro: {
    key: 'smart_alerts_intro',
    title: 'Smart Alerts',
    message:
      'Hệ thống cảnh báo thông minh! Không bao giờ miss entry. FTB alerts, Confirmation alerts, Zone broken alerts - tất cả tự động!',
    screen: 'Scanner',
    showOnce: true,
    priority: 1,
  },
  alert_ftb: {
    key: 'alert_ftb',
    title: 'FTB Alert - Quan Trọng Nhất',
    message:
      'Khi price quay lại zone LẦN ĐẦU = FTB. Alert ngay lập tức với priority cao nhất. Đây là entry TỐT NHẤT!',
    screen: 'AlertPanel',
    position: 'bottom',
  },
  alert_ftb_approaching: {
    key: 'alert_ftb_approaching',
    title: 'FTB Approaching',
    message:
      'Alert khi price đến gần zone FTB (< 0.5%). Chuẩn bị sẵn sàng entry! Thời gian để analyze và set orders.',
    screen: 'AlertPanel',
    position: 'bottom',
  },
  alert_zone_approach: {
    key: 'alert_zone_approach',
    title: 'Zone Approach Alert',
    message:
      'Alert khi price tiến đến gần bất kỳ zone nào. Default: < 1% distance. Có thể customize trong Settings.',
    screen: 'AlertPanel',
    position: 'bottom',
  },
  alert_confirmation: {
    key: 'alert_confirmation',
    title: 'Confirmation Alert',
    message:
      'Alert khi có confirmation pattern tại zone: Engulfing, Pin Bar, hoặc Combo. Suggested action BUY/SELL đi kèm!',
    screen: 'AlertPanel',
    position: 'bottom',
  },
  alert_zone_broken: {
    key: 'alert_zone_broken',
    title: 'Zone Broken Alert',
    message:
      'Alert khi zone bị phá vỡ (2+ closes beyond). Hủy orders và tìm zone mới! Đừng cố bắt đáy/đỉnh.',
    screen: 'AlertPanel',
    position: 'bottom',
  },
  alert_pin_engulf_combo: {
    key: 'alert_pin_engulf_combo',
    title: 'Combo Alert',
    message:
      'Alert khi có Pin + Engulf Combo tại zone = A+ Entry! Priority cao nhất. Full position size!',
    screen: 'AlertPanel',
    position: 'bottom',
  },
  alert_stacked_zone: {
    key: 'alert_stacked_zone',
    title: 'Stacked Zone Alert',
    message:
      'Alert khi price tiến đến Stacked Zones (nhiều zones chồng lên nhau). Confluence CỰC MẠNH!',
    screen: 'AlertPanel',
    position: 'bottom',
  },
  alert_high_score: {
    key: 'alert_high_score',
    title: 'High Score Alert',
    message:
      'Alert khi zone có Odds Score >= 14 (A+). Setup chất lượng cao nhất. Full position size!',
    screen: 'AlertPanel',
    position: 'bottom',
  },
  alert_price_level: {
    key: 'alert_price_level',
    title: 'Custom Price Alert',
    message:
      'Tự đặt alert tại bất kỳ price level nào. VD: "Alert khi BTC = $100,000". Đơn giản và hiệu quả!',
    screen: 'AlertPanel',
    position: 'bottom',
  },
  alert_settings: {
    key: 'alert_settings',
    title: 'Alert Settings',
    message:
      'Customize alerts theo ý bạn: Bật/tắt từng loại, set quiet hours, min score để alert, distance threshold.',
    screen: 'AlertSettings',
    position: 'bottom',
  },
  alert_priority: {
    key: 'alert_priority',
    title: 'Alert Priority',
    message:
      'Priority 1 (Vàng): FTB, Combo, Stacked. Priority 2 (Cam): Confirmation. Priority 3 (Xanh): Zone approach. Priority 4 (Xám): Thấp.',
    screen: 'AlertPanel',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // VISION BOARD TOOLTIPS (9 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  visionboard_intro: {
    key: 'visionboard_intro',
    title: 'Vision Board',
    message:
      'Đặt mục tiêu và theo dõi tiến trình hàng ngày. Streak càng dài, động lực càng cao!',
    screen: 'VisionBoard',
    showOnce: true,
    priority: 1,
  },
  visionboard_add_goal: {
    key: 'visionboard_add_goal',
    title: 'Thêm mục tiêu',
    message:
      'Nhấn + để thêm mục tiêu mới. Chia nhỏ mục tiêu lớn thành các bước nhỏ dễ đạt được.',
    screen: 'VisionBoard',
    targetRef: 'addButton',
    position: 'top',
  },
  visionboard_goal_types: {
    key: 'visionboard_goal_types',
    title: '4 loại mục tiêu',
    message:
      'Trading (lợi nhuận), Financial (tiết kiệm), Health (sức khỏe), Learning (học tập).',
    screen: 'AddGoal',
    position: 'bottom',
  },
  visionboard_streak: {
    key: 'visionboard_streak',
    title: 'Streak Counter',
    message:
      'Số ngày liên tiếp hoàn thành mục tiêu. Streak 7+ ngày = Badge đặc biệt!',
    screen: 'VisionBoard',
    targetRef: 'streakCounter',
    position: 'bottom',
  },
  visionboard_progress: {
    key: 'visionboard_progress',
    title: 'Tiến trình',
    message:
      'Thanh tiến trình hiển thị % hoàn thành. Nhấn để update progress hàng ngày.',
    screen: 'VisionBoard',
    position: 'bottom',
  },
  visionboard_rituals: {
    key: 'visionboard_rituals',
    title: 'Daily Rituals',
    message:
      'Thói quen hàng ngày giúp duy trì kỷ luật. Check-in mỗi sáng để bắt đầu ngày mới!',
    screen: 'VisionBoard',
    position: 'top',
  },
  ritual_morning: {
    key: 'ritual_morning',
    title: 'Morning Ritual',
    message:
      'Bắt đầu ngày với meditation, review goals, và đặt intention. 5-10 phút mỗi sáng.',
    screen: 'Rituals',
    showOnce: true,
  },
  ritual_trading: {
    key: 'ritual_trading',
    title: 'Trading Ritual',
    message:
      'Pre-market analysis, check tin tức, xác định các levels quan trọng trước khi trade.',
    screen: 'Rituals',
    showOnce: true,
  },
  ritual_evening: {
    key: 'ritual_evening',
    title: 'Evening Ritual',
    message:
      'Review kết quả trading, journal entries, và chuẩn bị cho ngày mai.',
    screen: 'Rituals',
    showOnce: true,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // HOME/FORUM TOOLTIPS (6 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  forum_intro: {
    key: 'forum_intro',
    title: 'Cộng đồng Traders',
    message:
      'Chia sẻ ý tưởng, thảo luận thị trường, học hỏi từ những trader giàu kinh nghiệm.',
    screen: 'Home',
    showOnce: true,
    priority: 1,
  },
  forum_first_post: {
    key: 'forum_first_post',
    title: 'Đăng bài đầu tiên',
    message:
      'Nhấn + để chia sẻ phân tích, trade idea, hoặc đặt câu hỏi cho cộng đồng.',
    screen: 'Home',
    trigger: 'first_visit',
    position: 'bottom',
  },
  forum_trending: {
    key: 'forum_trending',
    title: 'Trending Topics',
    message:
      'Các chủ đề được thảo luận nhiều nhất. Cập nhật real-time theo thị trường.',
    screen: 'Home',
    targetRef: 'trendingSection',
    position: 'bottom',
  },
  forum_categories: {
    key: 'forum_categories',
    title: 'Chuyên mục',
    message:
      'Lọc bài theo chủ đề: Phân tích kỹ thuật, Tâm lý trading, Tin tức, hoặc Wellness.',
    screen: 'Home',
    targetRef: 'categoryTabs',
    position: 'bottom',
  },
  forum_follow: {
    key: 'forum_follow',
    title: 'Follow Traders',
    message:
      'Follow những trader bạn thích để xem bài viết của họ đầu tiên trong feed.',
    screen: 'Home',
    position: 'bottom',
  },
  forum_reactions: {
    key: 'forum_reactions',
    title: 'Reactions',
    message:
      'Thả tim, bình luận, hoặc share bài viết. Tương tác giúp bạn nhận thêm GEM points!',
    screen: 'Home',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // COURSES TOOLTIPS (5 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  courses_intro: {
    key: 'courses_intro',
    title: 'Học viện GEM',
    message:
      'Khóa học từ cơ bản đến nâng cao. Học trading, tâm lý, và wellness từ chuyên gia.',
    screen: 'Courses',
    showOnce: true,
    priority: 1,
  },
  courses_progress: {
    key: 'courses_progress',
    title: 'Tiến trình học',
    message:
      'Theo dõi % hoàn thành mỗi khóa học. Hoàn thành khóa để nhận certificate!',
    screen: 'Courses',
    position: 'bottom',
  },
  courses_quiz: {
    key: 'courses_quiz',
    title: 'Quiz kiểm tra',
    message:
      'Cuối mỗi module có quiz. Đạt 80%+ để mở khóa module tiếp theo.',
    screen: 'CourseDetail',
    position: 'bottom',
  },
  courses_certificate: {
    key: 'courses_certificate',
    title: 'Chứng chỉ',
    message:
      'Hoàn thành khóa học để nhận certificate. Share lên profile để flex với cộng đồng!',
    screen: 'Courses',
    trigger: 'after_first_lesson',
    position: 'top',
  },
  courses_premium: {
    key: 'courses_premium',
    title: 'Khóa học Premium',
    message:
      'TIER 2+ được truy cập khóa học nâng cao: Chiến lược, Quản lý vốn, Tâm lý cao cấp.',
    screen: 'Courses',
    tier: 'tier2',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ACCOUNT TOOLTIPS (6 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  profile_intro: {
    key: 'profile_intro',
    title: 'Trang cá nhân',
    message:
      'Xem thống kê, badges, và lịch sử hoạt động. Tùy chỉnh profile để cộng đồng biết về bạn.',
    screen: 'Account',
    showOnce: true,
    priority: 1,
  },
  profile_edit: {
    key: 'profile_edit',
    title: 'Chỉnh sửa Profile',
    message:
      'Nhấn icon bút để cập nhật avatar, bio, và thông tin cá nhân.',
    screen: 'Account',
    targetRef: 'editButton',
    position: 'left',
  },
  tier_benefits: {
    key: 'tier_benefits',
    title: 'Quyền lợi theo Tier',
    message:
      'Nhấn để xem chi tiết quyền lợi của từng tier. Nâng cấp để mở khóa thêm tính năng!',
    screen: 'Account',
    targetRef: 'tierCard',
    position: 'bottom',
  },
  tier_upgrade: {
    key: 'tier_upgrade',
    title: 'Nâng cấp Tier',
    message:
      'TIER 1: Scan không giới hạn. TIER 2: Backtesting, Multi-TF. TIER 3: Signals VIP, Mentoring.',
    screen: 'Pricing',
    showOnce: true,
  },
  settings_notifications: {
    key: 'settings_notifications',
    title: 'Cài đặt thông báo',
    message:
      'Tùy chỉnh notifications: Trading alerts, Forum mentions, hoặc Daily reminders.',
    screen: 'Settings',
    targetRef: 'notificationSettings',
    position: 'bottom',
  },
  settings_privacy: {
    key: 'settings_privacy',
    title: 'Quyền riêng tư',
    message:
      'Kiểm soát ai có thể xem profile, trades, và hoạt động của bạn.',
    screen: 'Settings',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // PORTFOLIO & TRADING TOOLTIPS (10 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  portfolio_intro: {
    key: 'portfolio_intro',
    title: 'Portfolio Tracker',
    message:
      'Theo dõi tổng giá trị portfolio, P&L, và phân bố tài sản theo thời gian thực.',
    screen: 'Portfolio',
    showOnce: true,
    priority: 1,
  },
  portfolio_add_trade: {
    key: 'portfolio_add_trade',
    title: 'Thêm Trade',
    message:
      'Nhấn + để log trade mới. Tự động tính P&L, R:R ratio, và thống kê win rate.',
    screen: 'Portfolio',
    targetRef: 'addTradeButton',
    position: 'top',
  },
  portfolio_chart: {
    key: 'portfolio_chart',
    title: 'Performance Chart',
    message:
      'Biểu đồ equity curve theo ngày/tuần/tháng. Vuốt để zoom và xem chi tiết.',
    screen: 'Portfolio',
    targetRef: 'performanceChart',
    position: 'bottom',
  },
  portfolio_stats: {
    key: 'portfolio_stats',
    title: 'Thống kê Trading',
    message:
      'Win rate, average R:R, max drawdown, và các metrics quan trọng khác.',
    screen: 'Portfolio',
    targetRef: 'statsSection',
    position: 'top',
  },

  // Paper Trade
  papertrade_intro: {
    key: 'papertrade_intro',
    title: 'Paper Trading',
    message:
      'Thử nghiệm chiến lược với tiền ảo. Không rủi ro, học hỏi trước khi trade thật!',
    screen: 'PaperTrade',
    showOnce: true,
    priority: 1,
  },
  papertrade_balance: {
    key: 'papertrade_balance',
    title: 'Số dư ảo',
    message:
      'Bắt đầu với $10,000 USDT ảo. Reset bất cứ lúc nào để thử chiến lược mới.',
    screen: 'PaperTrade',
    position: 'bottom',
  },
  papertrade_risk: {
    key: 'papertrade_risk',
    title: 'Quản lý rủi ro',
    message:
      'Đặt stop loss cho mọi lệnh! Khuyến nghị risk 1-2% portfolio mỗi trade.',
    screen: 'PaperTrade',
    targetRef: 'stopLossInput',
    position: 'top',
  },

  // Backtesting
  backtest_intro: {
    key: 'backtest_intro',
    title: 'Backtesting',
    message:
      'Test chiến lược trên dữ liệu quá khứ. Xem pattern hoạt động như thế nào trong thực tế.',
    screen: 'Backtesting',
    showOnce: true,
    priority: 1,
    tier: 'tier1',
  },
  backtest_params: {
    key: 'backtest_params',
    title: 'Thông số Backtest',
    message:
      'Chọn coin, timeframe, và khoảng thời gian. Dữ liệu lịch sử 1-3 năm tùy coin.',
    screen: 'Backtesting',
    position: 'bottom',
  },
  backtest_results: {
    key: 'backtest_results',
    title: 'Kết quả Backtest',
    message:
      'Win rate, profit factor, max drawdown. So sánh với hold strategy để đánh giá.',
    screen: 'BacktestResults',
    showOnce: true,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // GEM MASTER TOOLTIPS (6 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  gemmaster_intro: {
    key: 'gemmaster_intro',
    title: 'GEM Master AI',
    message:
      'Trợ lý giao dịch thông minh. Hỏi về trading, phân tích kỹ thuật, hoặc bốc Tarot miễn phí!',
    screen: 'GemMaster',
    showOnce: true,
    priority: 1,
  },
  gemmaster_chat: {
    key: 'gemmaster_chat',
    title: 'Chat với AI',
    message:
      'Gõ câu hỏi bất kỳ về trading, tâm lý, hoặc chiến lược. AI trả lời 24/7.',
    screen: 'GemMaster',
    targetRef: 'chatInput',
    position: 'top',
  },
  gemmaster_daily_card: {
    key: 'gemmaster_daily_card',
    title: 'Lá bài mỗi ngày',
    message:
      'Bốc Tarot miễn phí 1 lần/ngày. Nhận thông điệp vũ trụ dành riêng cho bạn!',
    screen: 'GemMaster',
    targetRef: 'tarotButton',
    position: 'bottom',
  },
  gemmaster_iching: {
    key: 'gemmaster_iching',
    title: 'I Ching Wisdom',
    message:
      'Gieo quẻ Kinh Dịch miễn phí. Trí tuệ cổ xưa 3000 năm cho quyết định trading.',
    screen: 'GemMaster',
    targetRef: 'ichingButton',
    position: 'bottom',
  },
  gemmaster_history: {
    key: 'gemmaster_history',
    title: 'Lịch sử hội thoại',
    message:
      'Xem lại các cuộc trò chuyện trước. Tìm kiếm theo keyword hoặc ngày.',
    screen: 'GemMaster',
    targetRef: 'historyButton',
    position: 'left',
  },
  gemmaster_crystal: {
    key: 'gemmaster_crystal',
    title: 'Đá năng lượng',
    message:
      'AI gợi ý đá phong thủy phù hợp với bạn. Mua trực tiếp từ YinYangMasters!',
    screen: 'GemMaster',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // GEM ECONOMY TOOLTIPS (5 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  gem_wallet_intro: {
    key: 'gem_wallet_intro',
    title: 'GEM Wallet',
    message:
      'Ví GEM Points của bạn. Dùng để mua courses, unlock premium content, hoặc donate cho người khác.',
    screen: 'GemWallet',
    showOnce: true,
    priority: 1,
  },
  gem_earn: {
    key: 'gem_earn',
    title: 'Cách kiếm GEM',
    message:
      'Đăng bài (+10), Comment hữu ích (+5), Daily check-in (+3), Hoàn thành lesson (+15).',
    screen: 'GemWallet',
    position: 'bottom',
  },
  gem_spend: {
    key: 'gem_spend',
    title: 'Cách dùng GEM',
    message:
      'Mua khóa học premium, unlock badges đặc biệt, hoặc gửi tặng traders khác.',
    screen: 'GemWallet',
    position: 'bottom',
  },
  gem_gifting: {
    key: 'gem_gifting',
    title: 'Tặng GEM',
    message:
      'Gửi GEM cho bạn bè hoặc tip cho bài viết hay. Nhận badge "Generous Giver" khi tặng 100+ GEM.',
    screen: 'GemWallet',
    targetRef: 'giftButton',
    position: 'top',
  },
  gem_withdraw: {
    key: 'gem_withdraw',
    title: 'Rút GEM',
    message:
      'GEM có thể đổi thành voucher mua sắm hoặc giảm giá subscription. Min 500 GEM.',
    screen: 'GemWallet',
    tier: 'tier1',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ADMIN TOOLTIPS (5 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  admin_dashboard: {
    key: 'admin_dashboard',
    title: 'Admin Dashboard',
    message:
      'Tổng quan hệ thống: Users online, revenue hôm nay, tickets pending, và alerts.',
    screen: 'AdminDashboard',
    role: 'admin',
    showOnce: true,
  },
  admin_users: {
    key: 'admin_users',
    title: 'Quản lý Users',
    message:
      'Tìm kiếm, ban/unban, grant tier, và xem activity logs của users.',
    screen: 'UserManagement',
    role: 'admin',
    position: 'bottom',
  },
  admin_revenue: {
    key: 'admin_revenue',
    title: 'Revenue Dashboard',
    message:
      'Theo dõi MRR, subscriptions, refunds, và dự báo revenue theo tháng.',
    screen: 'RevenueDashboard',
    role: 'admin',
    position: 'bottom',
  },
  admin_tickets: {
    key: 'admin_tickets',
    title: 'Support Tickets',
    message:
      'Xem và trả lời tickets từ users. Filter theo priority và status.',
    screen: 'SupportTickets',
    role: 'admin',
    position: 'bottom',
  },
  admin_analytics: {
    key: 'admin_analytics',
    title: 'Analytics',
    message:
      'DAU/MAU, retention rates, feature usage, và conversion funnels.',
    screen: 'Analytics',
    role: 'admin',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // AFFILIATE TOOLTIPS (5 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  referral_intro: {
    key: 'referral_intro',
    title: 'Chương trình giới thiệu',
    message:
      'Mời bạn bè, nhận GEM points và % commission khi họ mua subscription!',
    screen: 'Referral',
    showOnce: true,
    priority: 1,
  },
  referral_code: {
    key: 'referral_code',
    title: 'Mã giới thiệu',
    message:
      'Đây là mã referral của bạn. Copy và share cho bạn bè để họ đăng ký.',
    screen: 'Referral',
    targetRef: 'referralCode',
    position: 'bottom',
  },
  referral_share: {
    key: 'referral_share',
    title: 'Chia sẻ link',
    message:
      'Nhấn nút Share để gửi link qua Messenger, Zalo, hoặc copy link trực tiếp.',
    screen: 'Referral',
    targetRef: 'shareButton',
    position: 'top',
  },
  referral_commission: {
    key: 'referral_commission',
    title: 'Tỷ lệ commission',
    message:
      'Đăng ký: +50 GEM. Mua subscription: +10% giá trị đơn hàng. Milestones bonus thêm!',
    screen: 'Referral',
    position: 'bottom',
  },
  affiliate_dashboard: {
    key: 'affiliate_dashboard',
    title: 'Affiliate Dashboard',
    message:
      'Xem số referrals, tổng commission, và trạng thái payout. Export báo cáo dạng CSV.',
    screen: 'AffiliateDashboard',
    showOnce: true,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // NOTIFICATIONS TOOLTIPS (3 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  alerts_intro: {
    key: 'alerts_intro',
    title: 'Trung tâm thông báo',
    message:
      'Tất cả notifications: Trading alerts, mentions, likes, và system updates.',
    screen: 'Notifications',
    showOnce: true,
    priority: 1,
  },
  alerts_trading: {
    key: 'alerts_trading',
    title: 'Trading Alerts',
    message:
      'Nhận thông báo khi có pattern mới trên coins bạn follow. TIER 1+ có real-time alerts.',
    screen: 'Notifications',
    targetRef: 'tradingAlerts',
    position: 'bottom',
  },
  alerts_customize: {
    key: 'alerts_customize',
    title: 'Tùy chỉnh thông báo',
    message:
      'Bật/tắt từng loại notification. Đặt quiet hours để không bị làm phiền.',
    screen: 'NotificationSettings',
    position: 'bottom',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SHOP TOOLTIPS (4 tooltips)
  // ═══════════════════════════════════════════════════════════════════════

  shop_intro: {
    key: 'shop_intro',
    title: 'Crystal Shop',
    message:
      'Bộ sưu tập đá năng lượng được chọn lọc từ YinYangMasters. Ship toàn quốc!',
    screen: 'Shop',
    showOnce: true,
    priority: 1,
  },
  shop_categories: {
    key: 'shop_categories',
    title: 'Danh mục sản phẩm',
    message:
      'Lọc theo: Đá phong thủy, Vòng tay, Mặt dây chuyền, hoặc theo mục đích sử dụng.',
    screen: 'Shop',
    targetRef: 'categoryFilter',
    position: 'bottom',
  },
  shop_recommendation: {
    key: 'shop_recommendation',
    title: 'Gợi ý cho bạn',
    message:
      'AI gợi ý đá phù hợp dựa trên kết quả Tarot và mục tiêu cá nhân của bạn.',
    screen: 'Shop',
    position: 'top',
  },
  shop_cart: {
    key: 'shop_cart',
    title: 'Giỏ hàng',
    message:
      'Nhấn icon giỏ hàng để xem sản phẩm đã chọn. Áp mã giảm giá khi checkout.',
    screen: 'Shop',
    targetRef: 'cartIcon',
    position: 'left',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE DISCOVERY PROMPTS - 15 prompts total
// ═══════════════════════════════════════════════════════════════════════════

export const FEATURE_DISCOVERY = {
  // ═══════════════════════════════════════════════════════════════════════
  // USAGE-BASED DISCOVERIES (7)
  // ═══════════════════════════════════════════════════════════════════════

  discover_backtesting: {
    key: 'discover_backtesting',
    title: 'Thử tính năng Backtesting!',
    message:
      'Bạn đã scan 5 lần! Thử Backtesting để test chiến lược trên dữ liệu quá khứ.',
    icon: 'Target',
    actionLabel: 'Thử ngay',
    actionScreen: 'Backtesting',
    trigger: { action: 'scan_count', value: 5 },
    tier: 'tier1',
    priority: 1,
  },

  discover_gemmaster: {
    key: 'discover_gemmaster',
    title: 'Đã thử GEM Master chưa?',
    message:
      'Bốc Tarot miễn phí mỗi ngày! Nhận thông điệp vũ trụ dành riêng cho bạn.',
    icon: 'Sparkles',
    actionLabel: 'Bốc Tarot',
    actionScreen: 'GemMaster',
    trigger: { action: 'days_active', value: 3 },
    priority: 2,
  },

  discover_visionboard: {
    key: 'discover_visionboard',
    title: 'Đặt mục tiêu trading!',
    message:
      'Vision Board giúp bạn theo dõi tiến trình và duy trì động lực.',
    icon: 'Target',
    actionLabel: 'Tạo mục tiêu',
    actionScreen: 'VisionBoard',
    trigger: { action: 'trade_count', value: 3 },
    priority: 3,
  },

  discover_journal: {
    key: 'discover_journal',
    title: 'Ghi chép Trading Journal!',
    message:
      'Bạn đã thực hiện 5 trades. Ghi lại để phân tích và cải thiện chiến lược.',
    icon: 'BookOpen',
    actionLabel: 'Mở Journal',
    actionScreen: 'TradingJournal',
    trigger: { action: 'trade_count', value: 5 },
    priority: 4,
  },

  discover_courses: {
    key: 'discover_courses',
    title: 'Nâng cao kiến thức!',
    message:
      'Khóa học miễn phí về trading và tâm lý đang chờ bạn.',
    icon: 'GraduationCap',
    actionLabel: 'Xem khóa học',
    actionScreen: 'Courses',
    trigger: { action: 'days_active', value: 7 },
    priority: 5,
  },

  discover_community: {
    key: 'discover_community',
    title: 'Tham gia cộng đồng!',
    message:
      'Bạn chưa đăng bài nào. Chia sẻ trade idea đầu tiên để nhận +20 GEM!',
    icon: 'Users',
    actionLabel: 'Đăng bài',
    actionScreen: 'CreatePost',
    trigger: { action: 'post_count', value: 0 },
    priority: 6,
  },

  discover_referral: {
    key: 'discover_referral',
    title: 'Mời bạn bè nhận GEM!',
    message:
      'Chương trình referral đã sẵn sàng. Mời 1 người = +50 GEM ngay!',
    icon: 'Gift',
    actionLabel: 'Lấy mã giới thiệu',
    actionScreen: 'Referral',
    trigger: { action: 'days_active', value: 14 },
    priority: 7,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // UPGRADE PROMPTS (5)
  // ═══════════════════════════════════════════════════════════════════════

  upgrade_scan_limit: {
    key: 'upgrade_scan_limit',
    title: 'Hết lượt scan hôm nay',
    message:
      'Bạn đã dùng hết 5 scans miễn phí. Nâng cấp TIER 1 để scan không giới hạn!',
    icon: 'Zap',
    actionLabel: 'Xem gói nâng cấp',
    actionScreen: 'Pricing',
    trigger: { action: 'quota_reached', value: true },
    priority: 1,
    isUpgradePrompt: true,
  },

  upgrade_backtesting: {
    key: 'upgrade_backtesting',
    title: 'Mở khóa Backtesting',
    message:
      'Tính năng này dành cho TIER 1+. Nâng cấp để test chiến lược trên dữ liệu lịch sử!',
    icon: 'Lock',
    actionLabel: 'Xem gói nâng cấp',
    actionScreen: 'Pricing',
    trigger: { action: 'feature_locked', feature: 'backtesting' },
    priority: 2,
    isUpgradePrompt: true,
  },

  upgrade_multi_tf: {
    key: 'upgrade_multi_tf',
    title: 'Multi-Timeframe Scan',
    message:
      'TIER 2+ có thể scan nhiều timeframes cùng lúc. Tín hiệu mạnh hơn, chính xác hơn!',
    icon: 'Layers',
    actionLabel: 'Xem gói nâng cấp',
    actionScreen: 'Pricing',
    trigger: { action: 'feature_locked', feature: 'multi_tf' },
    priority: 3,
    isUpgradePrompt: true,
  },

  upgrade_alerts: {
    key: 'upgrade_alerts',
    title: 'Real-time Alerts',
    message:
      'Nhận thông báo ngay khi có pattern mới! Tính năng dành cho TIER 1+.',
    icon: 'Bell',
    actionLabel: 'Xem gói nâng cấp',
    actionScreen: 'Pricing',
    trigger: { action: 'feature_locked', feature: 'alerts' },
    priority: 4,
    isUpgradePrompt: true,
  },

  upgrade_vip_signals: {
    key: 'upgrade_vip_signals',
    title: 'VIP Signals',
    message:
      'TIER 3 nhận signals độc quyền từ expert traders với win rate 75%+.',
    icon: 'Star',
    actionLabel: 'Xem gói nâng cấp',
    actionScreen: 'Pricing',
    trigger: { action: 'feature_locked', feature: 'vip_signals' },
    priority: 5,
    isUpgradePrompt: true,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // STREAK & ACHIEVEMENT PROMPTS (3)
  // ═══════════════════════════════════════════════════════════════════════

  streak_warning: {
    key: 'streak_warning',
    title: 'Streak sắp mất!',
    message:
      'Bạn có streak {streak} ngày. Đừng quên check-in hôm nay để duy trì!',
    icon: 'Flame',
    actionLabel: 'Check-in ngay',
    actionScreen: 'VisionBoard',
    trigger: { action: 'streak_warning', value: true },
    priority: 1,
  },

  achievement_unlocked: {
    key: 'achievement_unlocked',
    title: 'Huy hiệu mới!',
    message:
      'Bạn vừa mở khóa badge "{badge_name}". Xem collection của bạn!',
    icon: 'Award',
    actionLabel: 'Xem badges',
    actionScreen: 'Achievements',
    trigger: { action: 'achievement_unlocked', value: true },
    priority: 2,
  },

  level_up: {
    key: 'level_up',
    title: 'Lên level!',
    message:
      'Chúc mừng! Bạn đã đạt Level {level}. Mở khóa {reward} mới!',
    icon: 'TrendingUp',
    actionLabel: 'Xem rewards',
    actionScreen: 'Profile',
    trigger: { action: 'level_up', value: true },
    priority: 1,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// TOOLTIP SEQUENCES (Guided Tours)
// ═══════════════════════════════════════════════════════════════════════════

export const TOOLTIP_SEQUENCES = {
  scanner_tour: {
    name: 'Scanner Tour',
    description: 'Hướng dẫn sử dụng Scanner',
    steps: [
      'scanner_intro',
      'scanner_coin_select',
      'scanner_timeframe',
      'scanner_scan_button',
      'scanner_results',
      'scanner_favorites',
    ],
    completionReward: { type: 'gem', amount: 10 },
  },

  advanced_patterns_tour: {
    name: 'Advanced Patterns Tour',
    description: 'Hướng dẫn Quasimodo & FTR Patterns',
    steps: [
      'qm_pattern_intro',
      'qm_structure',
      'qm_qml_level',
      'qm_mpl_level',
      'qm_bos',
      'ftr_pattern_intro',
      'ftr_structure',
      'ftr_freshness',
      'zone_concept_intro',
    ],
    completionReward: { type: 'gem', amount: 20 },
  },

  zone_trading_tour: {
    name: 'Zone Trading Tour',
    description: 'Hiểu rõ Zone Trading',
    steps: [
      'zone_concept_intro',
      'zone_hfz',
      'zone_lfz',
      'zone_width',
      'zone_validation',
    ],
    completionReward: { type: 'gem', amount: 15 },
  },

  odds_enhancers_tour: {
    name: 'Odds Enhancers Tour',
    description: 'Hướng dẫn 8 tiêu chí chấm điểm zone',
    steps: [
      'odds_enhancers_intro',
      'odds_departure_strength',
      'odds_time_at_level',
      'odds_freshness',
      'odds_profit_margin',
      'odds_big_picture',
      'odds_zone_origin',
      'odds_arrival_speed',
      'odds_risk_reward',
      'odds_grade_meaning',
    ],
    completionReward: { type: 'gem', amount: 25 },
  },

  freshness_tracking_tour: {
    name: 'Freshness Tracking Tour',
    description: 'Hiểu độ tươi mới của zone',
    steps: [
      'freshness_intro',
      'freshness_ftb',
      'freshness_orders',
      'freshness_status',
      'freshness_best_practice',
    ],
    completionReward: { type: 'gem', amount: 15 },
  },

  zone_hierarchy_tour: {
    name: 'Zone Hierarchy Tour',
    description: 'Hướng dẫn phân loại zone theo thứ bậc',
    steps: [
      'hierarchy_intro',
      'hierarchy_decision_point',
      'hierarchy_ftr',
      'hierarchy_flag_limit',
      'hierarchy_regular',
      'hierarchy_priority',
      'flag_limit_rules',
      'decision_point_rules',
    ],
    completionReward: { type: 'gem', amount: 30 },
  },

  stacked_zones_tour: {
    name: 'Stacked Zones & FTB Tour',
    description: 'Hướng dẫn Stacked Zones, Hidden FTR và FTB Tracking',
    steps: [
      'stacked_zones_intro',
      'stacked_confluence_score',
      'stacked_tightest_zone',
      'hidden_ftr_intro',
      'hidden_ftr_refinement',
      'hidden_ftr_ltf_mapping',
      'ftb_intro',
      'ftb_orders_remaining',
      'ftb_quality_tiers',
      'zone_in_zone',
    ],
    completionReward: { type: 'gem', amount: 35 },
  },

  compression_inducement_tour: {
    name: 'Compression & Inducement Tour',
    description: 'Hướng dẫn Compression, Stop Hunt và Look Right Rule',
    steps: [
      'compression_intro',
      'compression_types',
      'compression_quality',
      'compression_wedges',
      'inducement_intro',
      'inducement_mechanism',
      'inducement_bullish',
      'inducement_bearish',
      'inducement_reversal',
      'look_right_intro',
      'look_right_validation',
      'look_right_confidence',
    ],
    completionReward: { type: 'gem', amount: 40 },
  },

  confirmation_patterns_tour: {
    name: 'Confirmation Patterns Tour',
    description: 'Hướng dẫn xác nhận entry bằng candlestick patterns',
    steps: [
      'confirmation_intro',
      'confirmation_engulfing',
      'confirmation_pin_bar',
      'confirmation_hammer',
      'confirmation_inside_bar',
      'confirmation_doji',
      'confirmation_morning_star',
      'confirmation_evening_star',
      'confirmation_score',
      'confirmation_strength',
      'confirmation_zone_match',
      'confirmation_entry_trigger',
    ],
    completionReward: { type: 'gem', amount: 45 },
  },

  extended_zones_mpl_tour: {
    name: 'Extended Zones & MPL Tour',
    description: 'Hướng dẫn Extended Zones, MPL và Pin+Engulf Combo',
    steps: [
      'extended_zone_intro',
      'extended_zone_hfz',
      'extended_zone_lfz',
      'extended_zone_risk',
      'mpl_intro',
      'mpl_entry',
      'mpl_quality',
      'mpl_calculation',
      'pin_engulf_combo_intro',
      'pin_engulf_types',
      'pin_engulf_entry',
      'pin_engulf_vs_single',
    ],
    completionReward: { type: 'gem', amount: 50 },
  },

  smart_alerts_tour: {
    name: 'Smart Alerts Tour',
    description: 'Hướng dẫn hệ thống cảnh báo thông minh - FTB, Confirmation, Zone Broken alerts',
    steps: [
      'smart_alerts_intro',
      'alert_ftb',
      'alert_ftb_approaching',
      'alert_confirmation',
      'alert_zone_broken',
      'alert_pin_engulf_combo',
      'alert_stacked_zone',
      'alert_high_score',
      'alert_price_level',
      'alert_settings',
      'alert_priority',
    ],
    completionReward: { type: 'gem', amount: 30 },
  },

  trading_tour: {
    name: 'Trading Tour',
    description: 'Hướng dẫn Paper Trading',
    steps: [
      'papertrade_intro',
      'papertrade_balance',
      'papertrade_risk',
      'portfolio_intro',
      'portfolio_add_trade',
    ],
    completionReward: { type: 'gem', amount: 15 },
  },

  visionboard_tour: {
    name: 'Vision Board Tour',
    description: 'Hướng dẫn đặt mục tiêu',
    steps: [
      'visionboard_intro',
      'visionboard_add_goal',
      'visionboard_goal_types',
      'visionboard_streak',
      'visionboard_rituals',
    ],
    completionReward: { type: 'gem', amount: 10 },
  },

  gemmaster_tour: {
    name: 'GEM Master Tour',
    description: 'Khám phá AI Assistant',
    steps: [
      'gemmaster_intro',
      'gemmaster_chat',
      'gemmaster_daily_card',
      'gemmaster_iching',
      'gemmaster_crystal',
    ],
    completionReward: { type: 'gem', amount: 10 },
  },

  community_tour: {
    name: 'Community Tour',
    description: 'Tham gia cộng đồng',
    steps: [
      'forum_intro',
      'forum_categories',
      'forum_first_post',
      'forum_reactions',
      'forum_follow',
    ],
    completionReward: { type: 'gem', amount: 10 },
  },
};

/**
 * AsyncStorage keys for tooltips
 */
export const TOOLTIP_STORAGE_KEYS = {
  viewedTooltips: '@gem_viewed_tooltips',
  dismissedDiscoveries: '@gem_dismissed_discoveries',
  tourProgress: '@gem_tour_progress',
};

/**
 * Get tooltip count by category
 */
export const getTooltipCounts = () => {
  const categories = {};
  Object.values(TOOLTIPS).forEach((tooltip) => {
    const screen = tooltip?.screen || 'Other';
    categories[screen] = (categories[screen] || 0) + 1;
  });
  return categories;
};

export default {
  TOOLTIPS,
  FEATURE_DISCOVERY,
  TOOLTIP_SEQUENCES,
  TOOLTIP_STORAGE_KEYS,
  getTooltipCounts,
};
