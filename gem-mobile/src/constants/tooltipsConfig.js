/**
 * GEM Scanner - Tooltips Configuration
 * 15+ contextual help tooltips for Paper Trade
 */

// ═══════════════════════════════════════════════════════════
// ORDER TYPE TOOLTIPS
// ═══════════════════════════════════════════════════════════

export const ORDER_TYPE_TOOLTIPS = {
  limit: {
    id: 'order_type_limit',
    title: 'Lệnh Limit',
    content: 'Lệnh được đặt tại giá bạn chỉ định. Lệnh chỉ khớp khi giá thị trường đạt mức giá limit của bạn.',
    tip: 'Sử dụng lệnh Limit để có giá vào tốt hơn. Phí giao dịch thấp hơn (Maker fee).',
    type: 'info',
  },
  market: {
    id: 'order_type_market',
    title: 'Lệnh Market',
    content: 'Lệnh khớp ngay lập tức tại giá thị trường hiện tại. Đảm bảo khớp nhưng có thể bị slippage.',
    warning: 'Lệnh Market có thể bị trượt giá (slippage) khi thị trường biến động mạnh.',
    type: 'info',
  },
  stop_limit: {
    id: 'order_type_stop_limit',
    title: 'Lệnh Stop Limit',
    content: 'Khi giá chạm mức Stop Price, một lệnh Limit sẽ được tự động đặt tại Limit Price.',
    tip: 'Phù hợp khi bạn muốn vào lệnh sau khi giá xác nhận breakout một mức quan trọng.',
    type: 'info',
  },
  stop_market: {
    id: 'order_type_stop_market',
    title: 'Lệnh Stop Market',
    content: 'Khi giá chạm mức Stop Price, lệnh sẽ được thực hiện ngay ở giá thị trường.',
    tip: 'Đảm bảo khớp lệnh khi breakout, nhưng giá khớp có thể khác Stop Price.',
    type: 'info',
  },
};

// ═══════════════════════════════════════════════════════════
// MARGIN & LEVERAGE TOOLTIPS
// ═══════════════════════════════════════════════════════════

export const MARGIN_TOOLTIPS = {
  marginMode: {
    id: 'margin_mode',
    title: 'Chế độ Margin',
    content: 'Cross: Dùng toàn bộ số dư làm margin, rủi ro thanh lý toàn bộ tài khoản.\n\nIsolated: Chỉ dùng margin được chỉ định cho vị thế, giới hạn tổn thất.',
    tip: 'Khuyên dùng Isolated để kiểm soát rủi ro tốt hơn.',
    warning: 'Cross mode có thể khiến bạn mất toàn bộ tài khoản nếu vị thế bị thanh lý.',
    type: 'warning',
  },
  leverage: {
    id: 'leverage',
    title: 'Đòn bẩy',
    content: 'Đòn bẩy cho phép bạn mở vị thế lớn hơn số vốn thực có. Ví dụ: 20x leverage = $100 mở vị thế $2,000.',
    warning: 'Đòn bẩy cao làm tăng cả lợi nhuận và thua lỗ. Giá thanh lý sẽ gần giá vào lệnh hơn.',
    tip: 'Người mới nên bắt đầu với đòn bẩy thấp (5-10x) để học cách quản lý rủi ro.',
    type: 'warning',
  },
  liquidationPrice: {
    id: 'liquidation_price',
    title: 'Giá thanh lý',
    content: 'Nếu giá thị trường chạm mức này, vị thế sẽ bị đóng tự động để tránh thua lỗ thêm.',
    warning: 'Khi bị thanh lý, bạn mất toàn bộ margin của vị thế (với Isolated) hoặc toàn bộ số dư (với Cross).',
    type: 'warning',
  },
};

// ═══════════════════════════════════════════════════════════
// PRICE & TRIGGER TOOLTIPS
// ═══════════════════════════════════════════════════════════

export const PRICE_TOOLTIPS = {
  priceInput: {
    id: 'price_input',
    title: 'Giá vào lệnh',
    content: 'Giá bạn muốn mua/bán. Với lệnh Limit, lệnh sẽ chờ cho đến khi giá thị trường đạt mức này.',
    tip: 'Nhấn nút BBO để tự động điền giá tốt nhất hiện tại.',
    type: 'help',
  },
  stopPrice: {
    id: 'stop_price',
    title: 'Giá kích hoạt (Stop)',
    content: 'Khi giá thị trường chạm mức này, lệnh Stop của bạn sẽ được kích hoạt.',
    tip: 'Với Long: Stop > giá hiện tại (mua khi breakout lên)\nVới Short: Stop < giá hiện tại (bán khi breakdown xuống)',
    type: 'help',
  },
  triggerType: {
    id: 'trigger_type',
    title: 'Loại giá kích hoạt',
    content: 'Last Price: Giá giao dịch gần nhất trên sàn.\n\nMark Price: Giá trung bình từ nhiều sàn, ổn định hơn.',
    tip: 'Mark Price được khuyến nghị vì ít bị ảnh hưởng bởi price spike.',
    type: 'help',
  },
};

// ═══════════════════════════════════════════════════════════
// QUANTITY TOOLTIPS
// ═══════════════════════════════════════════════════════════

export const QUANTITY_TOOLTIPS = {
  quantitySlider: {
    id: 'quantity_slider',
    title: 'Số lượng vị thế',
    content: 'Kéo thanh trượt hoặc nhấn nút % để chọn phần trăm số dư muốn sử dụng.',
    tip: 'Nên giới hạn mỗi giao dịch ở 2-5% tổng vốn để quản lý rủi ro.',
    type: 'help',
  },
  maxPosition: {
    id: 'max_position',
    title: 'Vị thế tối đa',
    content: 'Giá trị vị thế lớn nhất bạn có thể mở dựa trên số dư và đòn bẩy hiện tại.',
    tip: 'Không nên sử dụng 100% vị thế tối đa - hãy để dự phòng cho phí và biến động.',
    type: 'help',
  },
};

// ═══════════════════════════════════════════════════════════
// TP/SL TOOLTIPS
// ═══════════════════════════════════════════════════════════

export const TPSL_TOOLTIPS = {
  takeProfit: {
    id: 'take_profit',
    title: 'Chốt lời (Take Profit)',
    content: 'Tự động đóng vị thế và chốt lời khi giá đạt mức TP.',
    tip: 'Đặt TP ở mức resistance/support quan trọng. Nên có tỷ lệ Risk:Reward tối thiểu 1:2.',
    type: 'help',
  },
  stopLoss: {
    id: 'stop_loss',
    title: 'Cắt lỗ (Stop Loss)',
    content: 'Tự động đóng vị thế để giới hạn thua lỗ khi giá đi ngược hướng.',
    tip: 'Luôn đặt SL khi vào lệnh. Đặt SL dưới/trên mức support/resistance quan trọng.',
    warning: 'Không đặt SL có thể dẫn đến thua lỗ lớn hoặc bị thanh lý.',
    type: 'warning',
  },
  riskReward: {
    id: 'risk_reward',
    title: 'Risk:Reward',
    content: 'Tỷ lệ giữa mức lỗ tiềm năng (Risk) và lời tiềm năng (Reward).\n\nVí dụ: 1:2 nghĩa là lời gấp 2 lần lỗ.',
    tip: 'Tỷ lệ R:R >= 1:2 được coi là tốt. Giúp bạn profitable dù chỉ thắng 40% giao dịch.',
    type: 'tip',
  },
};

// ═══════════════════════════════════════════════════════════
// ORDER OPTIONS TOOLTIPS
// ═══════════════════════════════════════════════════════════

export const ORDER_OPTIONS_TOOLTIPS = {
  reduceOnly: {
    id: 'reduce_only',
    title: 'Reduce Only',
    content: 'Lệnh chỉ có thể giảm size vị thế hiện có, không thể mở vị thế mới hoặc đảo chiều.',
    tip: 'Sử dụng khi muốn đóng một phần vị thế mà không muốn vô tình mở vị thế ngược.',
    type: 'help',
  },
  postOnly: {
    id: 'post_only',
    title: 'Post Only',
    content: 'Lệnh sẽ chỉ được thêm vào order book dưới dạng Maker, không khớp ngay như Taker.',
    tip: 'Đảm bảo bạn luôn được hưởng phí Maker thấp hơn.',
    type: 'help',
  },
  timeInForce: {
    id: 'time_in_force',
    title: 'Thời hạn lệnh',
    content: 'GTC: Lệnh tồn tại cho đến khi khớp hoặc bạn hủy.\n\nIOC: Khớp ngay phần có thể, hủy phần còn lại.\n\nFOK: Khớp toàn bộ hoặc hủy toàn bộ.',
    tip: 'GTC phổ biến nhất. Sử dụng IOC/FOK khi cần kiểm soát chặt việc khớp lệnh.',
    type: 'help',
  },
};

// ═══════════════════════════════════════════════════════════
// FEE & CALCULATION TOOLTIPS
// ═══════════════════════════════════════════════════════════

export const CALCULATION_TOOLTIPS = {
  tradingFee: {
    id: 'trading_fee',
    title: 'Phí giao dịch',
    content: 'Maker fee: 0.02% (đặt lệnh vào order book)\nTaker fee: 0.04% (khớp lệnh có sẵn)',
    tip: 'Sử dụng lệnh Limit để được hưởng Maker fee thấp hơn.',
    type: 'help',
  },
  initialMargin: {
    id: 'initial_margin',
    title: 'Margin ban đầu',
    content: 'Số tiền cần đặt cọc để mở vị thế.\n\nCông thức: Giá trị vị thế / Đòn bẩy',
    type: 'help',
  },
  maintenanceMargin: {
    id: 'maintenance_margin',
    title: 'Margin duy trì',
    content: 'Mức margin tối thiểu cần giữ. Nếu margin giảm xuống dưới mức này, vị thế sẽ bị thanh lý.',
    type: 'help',
  },
  roe: {
    id: 'roe',
    title: 'ROI (Return on Investment)',
    content: 'Tỷ lệ lợi nhuận/lỗ trên margin đã sử dụng.\n\nCông thức: (P&L / Margin) × 100%',
    tip: 'ROI = P&L% × Leverage. Với 10x leverage, 1% price move = 10% ROI.',
    type: 'help',
  },
  pnl: {
    id: 'pnl',
    title: 'P&L (Profit & Loss)',
    content: 'Lợi nhuận hoặc thua lỗ chưa thực hiện của vị thế hiện tại.',
    type: 'help',
  },
};

// ═══════════════════════════════════════════════════════════
// ZONE BOUNDARY TOOLTIPS (Phase 1A)
// ═══════════════════════════════════════════════════════════

export const ZONE_TOOLTIPS = {
  zoneEntry: {
    id: 'zone_entry',
    title: 'Giá Entry (Near Price)',
    content: 'Biên "gần" của zone - nơi giá chạm đầu tiên khi tiến vào vùng.\n\n• HFZ: Entry = LOW của pause (giá đi lên từ dưới)\n• LFZ: Entry = HIGH của pause (giá đi xuống từ trên)',
    tip: 'Entry là mức giá để bạn chuẩn bị vào lệnh khi giá chạm zone.',
    type: 'help',
  },
  zoneStop: {
    id: 'zone_stop',
    title: 'Giá Stop (Far Price)',
    content: 'Biên "xa" của zone - mức invalidation. Nếu giá phá vỡ mức này, tín hiệu không còn hợp lệ.\n\n• HFZ: Stop = HIGH của pause\n• LFZ: Stop = LOW của pause',
    tip: 'Đặt stop loss của bạn vượt qua mức này một chút (buffer) để tránh bị stop hunt.',
    warning: 'Nếu giá phá vỡ stop price, hãy cân nhắc đóng lệnh và chờ tín hiệu mới.',
    type: 'warning',
  },
  zoneWidth: {
    id: 'zone_width',
    title: 'Độ rộng Zone',
    content: 'Khoảng cách giữa Entry và Stop. Zone quá hẹp có thể không đủ significant, zone quá rộng cần refine xuống LTF.',
    tip: 'Zone lý tưởng nên có độ rộng 0.5x - 2x ATR. Nếu > 4x ATR, hãy zoom xuống timeframe thấp hơn để tìm zone chính xác hơn.',
    type: 'help',
  },
  hfzZone: {
    id: 'hfz_zone',
    title: 'Vùng Cung (HFZ)',
    content: 'High Frequency Zone - vùng có lực bán mạnh. Giá có xu hướng giảm sau khi chạm zone này.\n\nPatterns: UPD, DPD, Head & Shoulders, Double Top',
    tip: 'Với HFZ, chuẩn bị SELL khi giá tiến vào zone. Entry ở LOW, Stop ở HIGH.',
    type: 'help',
  },
  lfzZone: {
    id: 'lfz_zone',
    title: 'Vùng Cầu (LFZ)',
    content: 'Low Frequency Zone - vùng có lực mua mạnh. Giá có xu hướng tăng sau khi chạm zone này.\n\nPatterns: DPU, UPU, Inverse H&S, Double Bottom',
    tip: 'Với LFZ, chuẩn bị BUY khi giá tiến vào zone. Entry ở HIGH, Stop ở LOW.',
    type: 'help',
  },
  patternStrength: {
    id: 'pattern_strength',
    title: 'Độ mạnh Pattern',
    content: '⭐⭐⭐⭐⭐ (5 sao): UPD, DPU - Đảo chiều - Win rate 70-72%\n⭐⭐⭐⭐ (4 sao): H&S, Double Top/Bottom - Classic - Win rate 67-72%\n⭐⭐⭐ (3 sao): DPD, UPU - Tiếp diễn - Win rate 56-58%',
    tip: 'Ưu tiên giao dịch với patterns 5 sao (đảo chiều) để có win rate cao nhất.',
    type: 'tip',
  },
  reversalPattern: {
    id: 'reversal_pattern',
    title: 'Pattern Đảo chiều',
    content: 'Patterns báo hiệu trend sẽ đảo hướng.\n\n• UPD: Từ tăng → giảm\n• DPU: Từ giảm → tăng\n\nĐộ mạnh: 5/5 sao, Win rate: 70-72%',
    tip: 'Reversal patterns có xác suất thành công cao nhất. Đặc biệt mạnh khi xuất hiện ở HTF (4H, 1D).',
    type: 'tip',
  },
  continuationPattern: {
    id: 'continuation_pattern',
    title: 'Pattern Tiếp diễn',
    content: 'Patterns báo hiệu trend sẽ tiếp tục.\n\n• DPD: Tiếp tục giảm\n• UPU: Tiếp tục tăng\n\nĐộ mạnh: 3/5 sao, Win rate: 56-58%',
    tip: 'Continuation patterns phù hợp để pyramiding - thêm vào vị thế đã có lợi nhuận.',
    type: 'help',
  },
  zoneRiskReward: {
    id: 'zone_risk_reward',
    title: 'Risk:Reward của Zone',
    content: 'Tỷ lệ R:R được tính dựa trên:\n• Risk = khoảng cách từ Entry đến Stop\n• Reward = khoảng cách từ Entry đến Target (zone đối diện)\n\n✅ >= 1:2: Chấp nhận được\n✅ >= 1:3: Tốt\n✅ >= 1:4: Xuất sắc',
    warning: 'Không nên vào lệnh nếu R:R < 1:2. Dù win rate cao, P&L tổng sẽ âm.',
    type: 'warning',
  },
  zoneDistance: {
    id: 'zone_distance',
    title: 'Khoảng cách đến Zone',
    content: 'Cho biết giá hiện tại cách zone bao xa.\n\n• "Trong zone": Giá đang nằm trong vùng Entry-Stop\n• "Đang tiến gần": Cách < 1%\n• "Cách zone X%": Cần chờ giá tiến gần hơn',
    tip: 'Đợi giá tiến vào zone rồi mới vào lệnh. Không FOMO khi giá còn xa zone.',
    type: 'help',
  },
  zoneValidation: {
    id: 'zone_validation',
    title: 'Chất lượng Zone',
    content: 'Zone được đánh giá dựa trên độ rộng so với ATR.\n\n✅ Excellent: <= 1x ATR\n✅ Good: <= 1.5x ATR\n⚠️ Acceptable: <= 2.5x ATR\n⛔ Extended: > 4x ATR (cần refine)',
    tip: 'Zone quá rộng (> 4x ATR) nghĩa là risk/stop loss quá lớn. Zoom xuống LTF để tìm entry chính xác hơn.',
    type: 'help',
  },
};

// ═══════════════════════════════════════════════════════════
// COMBINED EXPORT
// ═══════════════════════════════════════════════════════════

export const PAPER_TRADE_TOOLTIPS = {
  // Order Types
  ...ORDER_TYPE_TOOLTIPS,

  // Margin & Leverage
  ...MARGIN_TOOLTIPS,

  // Price & Trigger
  ...PRICE_TOOLTIPS,

  // Quantity
  ...QUANTITY_TOOLTIPS,

  // TP/SL
  ...TPSL_TOOLTIPS,

  // Order Options
  ...ORDER_OPTIONS_TOOLTIPS,

  // Calculations
  ...CALCULATION_TOOLTIPS,

  // Zone Boundaries (Phase 1A)
  ...ZONE_TOOLTIPS,
};

// Helper to get tooltip by ID
export const getTooltipById = (id) => {
  return Object.values(PAPER_TRADE_TOOLTIPS).find(t => t.id === id);
};

// Default export
const tooltipsConfig = {
  ORDER_TYPE_TOOLTIPS,
  MARGIN_TOOLTIPS,
  PRICE_TOOLTIPS,
  QUANTITY_TOOLTIPS,
  TPSL_TOOLTIPS,
  ORDER_OPTIONS_TOOLTIPS,
  CALCULATION_TOOLTIPS,
  ZONE_TOOLTIPS,
  PAPER_TRADE_TOOLTIPS,
  getTooltipById,
};

export default tooltipsConfig;
