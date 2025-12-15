// ============================================
// 💡 BADGE TOOLTIP DEFINITIONS
// Nội dung giải thích cho từng loại badge
// ============================================

export const STATE_TOOLTIPS = {
  FRESH: {
    title: '🆕 FRESH - Mới Phát Hiện',
    description: 'Pattern vừa được phát hiện, chưa có giá retest.',
    action: '⏳ Chờ giá quay lại zone để xác nhận.',
    timing: 'Không nên entry ngay.',
    example: 'Pattern detected tại $50k, giá đang ở $51k → CHỜ retest'
  },

  WAITING: {
    title: '⏳ WAITING - Đang Chờ Retest',
    description: 'Giá đang di chuyển về phía zone, chuẩn bị retest.',
    action: '👀 Theo dõi sát, chuẩn bị entry khi vào zone.',
    timing: 'Gần điểm entry, sẵn sàng!',
    example: 'Zone tại $50k, giá đang ở $50.2k (0.4% away) → SẴN SÀNG'
  },

  ACTIVE: {
    title: '✅ ACTIVE - Có Thể Trade Ngay!',
    description: 'Giá ĐANG Ở TRONG ZONE - đây là lúc tốt nhất để entry.',
    action: '🚀 Entry NGAY theo setup (Entry/Stop/Target).',
    timing: 'ĐÂY LÀ LÚC TRADE!',
    example: 'Zone: $49.9k-$50.1k, giá hiện tại: $50.0k → ENTRY!'
  },

  MISSED: {
    title: '❌ MISSED - Đã Bỏ Lỡ',
    description: 'Giá đã đi xa khỏi entry point >5%, không còn cơ hội.',
    action: '❌ BỎ QUA pattern này, tìm pattern khác.',
    timing: 'Quá muộn để entry.',
    example: 'Entry: $50k, giá đang ở $53k (+6%) → BỎ LỠ'
  },

  STOPPED: {
    title: '🛑 STOPPED - Hit Stop Loss',
    description: 'Giá đã chạm stop loss, pattern thất bại.',
    action: '📊 Học hỏi từ trade này, phân tích lại.',
    timing: 'Pattern đã kết thúc (loss).',
    example: 'Stop: $50.5k, giá đạt $50.6k → STOPPED OUT'
  },

  TARGET_HIT: {
    title: '🎯 COMPLETED - Đã Đạt Target',
    description: 'Giá đã chạm target, pattern thành công!',
    action: '🎉 Chốt lời, pattern hoàn thành.',
    timing: 'Pattern đã kết thúc (profit).',
    example: 'Target: $48k, giá đạt $47.9k → PROFIT!'
  },

  EXPIRED: {
    title: '⌛ EXPIRED - Hết Hạn',
    description: 'Quá 7 ngày không retest, pattern không còn hiệu lực.',
    action: '🗑️ Pattern tự động ẩn đi.',
    timing: 'Không còn valid.',
    example: 'Detected 10 ngày trước, không retest → HẾT HẠN'
  }
};

export const TIMEFRAME_TOOLTIPS = {
  BEST: {
    title: '⭐ BEST - Timeframe Tối Ưu',
    description: 'Đây là timeframe TỐT NHẤT để trade pattern này.',
    winRate: 'Win rate cao nhất',
    reliability: 'Độ tin cậy: ⭐⭐⭐⭐⭐',
    recommendation: '💡 KHUYẾN NGHỊ: Trade ở timeframe này.',
    example: 'UPD pattern tốt nhất ở 1D, 1W'
  },

  GOOD: {
    title: '✅ GOOD - Timeframe Tốt',
    description: 'Timeframe này vẫn hoạt động tốt, nhưng không phải optimal.',
    winRate: 'Win rate trung bình đến khá',
    reliability: 'Độ tin cậy: ⭐⭐⭐⭐☆',
    recommendation: '💡 CÓ THỂ: Trade nếu bạn thoải mái với TF này.',
    example: 'UPD ở 4H, 12H vẫn OK nhưng 1D/1W tốt hơn'
  },

  CAUTION: {
    title: '⚠️ CAUTION - Timeframe Cẩn Trọng',
    description: 'Timeframe này KHÔNG TỐI ƯU cho pattern.',
    winRate: 'Win rate thấp hơn đáng kể',
    reliability: 'Độ tin cậy: ⭐⭐☆☆☆',
    recommendation: '⚠️ TRÁNH: Nên switch sang timeframe khác.',
    example: 'UPD ở 1H, 15m có nhiều false signals'
  }
};

export const DIRECTION_TOOLTIPS = {
  LONG: {
    title: '🔺 LONG - Mua Vào',
    description: 'Pattern tín hiệu TĂNG GIÁ (Bullish).',
    action: 'Entry: MUA (Buy)',
    profit: 'Lời khi giá TĂNG',
    risk: 'Stop loss ở DƯỚI entry',
    example: 'Entry $50k → Target $52k (profit nếu tăng)'
  },

  SHORT: {
    title: '🔻 SHORT - Bán Ra',
    description: 'Pattern tín hiệu GIẢM GIÁ (Bearish).',
    action: 'Entry: BÁN (Sell/Short)',
    profit: 'Lời khi giá GIẢM',
    risk: 'Stop loss ở TRÊN entry',
    example: 'Entry $50k → Target $48k (profit nếu giảm)'
  },

  BREAKOUT: {
    title: '⚡ BREAKOUT - Chờ Phá Vỡ',
    description: 'Pattern TRUNG LẬP, chờ breakout.',
    action: 'Entry: CHỜ xác định hướng (lên hoặc xuống)',
    profit: 'Trade theo hướng breakout',
    risk: 'Stop ở phía đối diện breakout',
    example: 'Triangle: Breakout lên → LONG, xuống → SHORT'
  },

  UNKNOWN: {
    title: '❓ UNKNOWN - Chưa Xác Định',
    description: 'Pattern chưa được nhận diện hoặc không có trong hệ thống.',
    action: 'Kiểm tra lại pattern type hoặc chờ nhận diện đúng',
    profit: 'Không thể xác định',
    risk: 'Không nên trade khi chưa rõ direction',
    example: 'Pattern cần được cập nhật hoặc sửa lại tên'
  }
};

export const PATTERN_TYPE_TOOLTIPS = {
  REVERSAL: {
    title: '🔄 REVERSAL - Đảo Chiều',
    description: 'Pattern đảo chiều xu hướng (uptrend → downtrend hoặc ngược lại).',
    characteristics: [
      'Xảy ra ở đỉnh/đáy của trend',
      'Signal thay đổi hướng giá',
      'Cần confirmation mạnh'
    ],
    risk: 'RISK CAO HƠN - Đảo chiều khó dự đoán',
    examples: 'UPD, DPU, Head & Shoulders, Double Top/Bottom'
  },

  CONTINUATION: {
    title: '➡️ CONTINUATION - Tiếp Diễn',
    description: 'Pattern tiếp tục xu hướng hiện tại sau khi nghỉ ngắn.',
    characteristics: [
      'Xảy ra giữa trend',
      'Pause ngắn rồi tiếp tục',
      'Win rate cao hơn reversal'
    ],
    risk: 'RISK THẤP HƠN - Trend đang mạnh',
    examples: 'DPD, UPU, Bull/Bear Flag, Cup & Handle'
  },

  BREAKOUT: {
    title: '💥 BREAKOUT - Phá Vỡ Range',
    description: 'Pattern phá vỡ vùng consolidation, hướng chưa rõ.',
    characteristics: [
      'Giá đi ngang trong range',
      'Chờ breakout xác định hướng',
      'Trade theo hướng break'
    ],
    risk: 'RISK TRUNG BÌNH - Phụ thuộc breakout direction',
    examples: 'Symmetrical Triangle, Rectangle, Wedge'
  },

  ZONE: {
    title: '📍 ZONE - Vùng Tần Suất',
    description: 'Zone được test nhiều lần, kháng cự/hỗ trợ mạnh.',
    characteristics: [
      'Giá reject nhiều lần tại zone',
      'Zone càng nhiều test càng mạnh',
      'Entry tại zone retest'
    ],
    risk: 'RISK THẤP - Zone đã proven',
    examples: 'HFZ (kháng cự), LFZ (hỗ trợ)'
  }
};
