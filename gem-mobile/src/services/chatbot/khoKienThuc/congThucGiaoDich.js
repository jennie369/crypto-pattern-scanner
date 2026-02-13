/**
 * KHO KIẾN THỨC CÔNG THỨC GIAO DỊCH
 * Trading Knowledge Base for GEM Master Chatbot
 *
 * Nội dung:
 * - 6 Công thức Frequency (TIER2): DPD, UPU, UPD, DPU, HFZ, LFZ
 * - 3 Công thức cơ bản (FREE): Đầu Vai, Hai Đỉnh, Hai Đáy
 * - Khái niệm Vùng: Vùng Mới, Vùng Đã Kiểm Tra, Vùng Cung, Vùng Cầu
 *
 * Phân quyền Tier:
 * - FREE: Công thức cơ bản + Vùng Cung/Cầu
 * - TIER1: Cơ bản + Khái niệm vùng
 * - TIER2: Tất cả Công thức Frequency
 * - TIER3: Tất cả nội dung + phân tích nâng cao
 *
 * Nội dung viết theo ngôn ngữ Sư Phụ - đanh thép, chiến lược
 *
 * @version 1.0.0
 * @date 2026-01-28
 */

// ===========================================
// YÊU CẦU TIER
// ===========================================

export const TIER_REQUIREMENTS = {
  FREE: 'FREE',
  TIER1: 'TIER1',
  TIER2: 'TIER2',
  TIER3: 'TIER3',
};

const TIER_HIERARCHY = {
  'FREE': 0,
  'TIER1': 1,
  'TIER2': 2,
  'TIER3': 3,
};

// ===========================================
// LOẠI CÔNG THỨC
// ===========================================

export const FORMULA_TYPES = {
  XU_HUONG_TIEP_TUC: 'xu_huong_tiep_tuc',    // Xu hướng tiếp tục
  DAO_CHIEU: 'dao_chieu',                     // Đảo chiều
  CHAT_LUONG_VUNG: 'chat_luong_vung',         // Chất lượng vùng
  MO_HINH_CO_DIEN: 'mo_hinh_co_dien',         // Mô hình cổ điển
};

// ===========================================
// 6 CÔNG THỨC FREQUENCY (TIER2)
// ===========================================

export const FREQUENCY_FORMULAS = {
  DPD: {
    id: 'DPD',
    ten: 'DPD',
    tenDayDu: 'Down-Pause-Down',
    tenViet: 'Giảm-Nghỉ-Giảm',
    tierYeuCau: TIER_REQUIREMENTS.TIER2,
    loai: FORMULA_TYPES.XU_HUONG_TIEP_TUC,
    laCongThucFrequency: true,
    yNghia: 'Xu hướng giảm tiếp tục sau giai đoạn tích lũy',

    noiDung: `
DPD - Down-Pause-Down (Giảm-Nghỉ-Giảm)
Chiến thuật tiếp diễn xu hướng giảm.

NHẬN DẠNG:
- Giảm 1: Phe bán tấn công, đà giảm mạnh
- Nghỉ: Vùng tích lũy tạm thời, chiến trường nghỉ ngơi
- Giảm 2: Tiếp tục hành quân sau khi kiểm tra vùng nghỉ

VÀO LỆNH:
- Chờ giá quay lại KIỂM TRA vùng nghỉ (vùng Supply)
- Xác nhận: Nến từ chối tại vùng giá (pin bar, engulfing)
- Vào lệnh khi có nến nhấn chìm giảm

PHÒNG THỦ:
- Cắt lỗ: Trên đỉnh vùng nghỉ + đệm an toàn (buffer)
- Không giao dịch nếu vùng đã kiểm tra 2 lần trở lên

CHIẾN THẮNG:
- Tỷ lệ thắng kiểm chứng: 67.3% qua 686 lệnh
- Tỷ lệ lời:lỗ tối thiểu 1:2

TÂM THỨC:
Khi thị trường cho tín hiệu rõ ràng, hãy tin tưởng và hành động. Nghi ngờ là kẻ thù của kỷ luật.
    `.trim(),

    tuKhoa: ['DPD', 'down pause down', 'giảm nghỉ giảm', 'xu hướng giảm', 'trend continuation', 'supply zone', 'tiếp tục giảm'],
    congThucLienQuan: ['UPU', 'HFZ', 'LFZ'],

    viDu: {
      moTa: 'BTC giảm từ 45k xuống 42k, sideway 42k-43k (vùng Supply), rồi breakdown xuống 38k',
      entry: 'Short khi giá FTB vào vùng 42k-43k',
      sl: 'Trên 43.5k',
      tp: '38k hoặc vùng Demand tiếp theo',
      rr: '1:2 tối thiểu',
    },
  },

  UPU: {
    id: 'UPU',
    ten: 'UPU',
    tenDayDu: 'Up-Pause-Up',
    tenViet: 'Tăng-Nghỉ-Tăng',
    tierYeuCau: TIER_REQUIREMENTS.TIER2,
    loai: FORMULA_TYPES.XU_HUONG_TIEP_TUC,
    laCongThucFrequency: true,
    yNghia: 'Xu hướng tăng tiếp tục sau giai đoạn tích lũy',

    noiDung: `
UPU - Up-Pause-Up (Tăng-Nghỉ-Tăng)
Chiến thuật tiếp diễn xu hướng tăng.

NHẬN DẠNG:
- Tăng 1: Phe mua chiếm ưu thế, đà tăng rõ ràng
- Nghỉ: Vùng tích lũy, chuẩn bị cho đợt tấn công tiếp
- Tăng 2: Tiếp tục chiến dịch tăng

VÀO LỆNH:
- Chờ giá quay lại KIỂM TRA vùng nghỉ (vùng Demand)
- Xác nhận: Nến bật lên với lực mua
- Vào lệnh khi có nến nhấn chìm tăng hoặc nến búa

PHÒNG THỦ:
- Cắt lỗ: Dưới đáy vùng nghỉ + đệm an toàn
- Vùng mới tốt hơn vùng đã kiểm tra

CHIẾN THẮNG:
- Tỷ lệ thắng kiểm chứng: 65.8%
- Tỷ lệ lời:lỗ tối thiểu 1:2

TÂM THỨC:
Thị trường tăng là quà tặng. Nhưng lòng tham khiến bạn bỏ lỡ. Hãy vào lệnh khi có setup, không chờ "giá rẻ hơn".
    `.trim(),

    tuKhoa: ['UPU', 'up pause up', 'tăng nghỉ tăng', 'xu hướng tăng', 'trend continuation', 'demand zone', 'tiếp tục tăng'],
    congThucLienQuan: ['DPD', 'HFZ', 'LFZ'],

    viDu: {
      moTa: 'ETH tăng từ 2000 lên 2400, sideway 2300-2400 (vùng Demand), rồi breakout lên 2800',
      entry: 'Long khi giá FTB vào vùng 2300-2400',
      sl: 'Dưới 2250',
      tp: '2800 hoặc vùng Supply tiếp theo',
      rr: '1:2 tối thiểu',
    },
  },

  UPD: {
    id: 'UPD',
    ten: 'UPD',
    tenDayDu: 'Up-Pause-Down',
    tenViet: 'Tăng-Nghỉ-Giảm',
    tierYeuCau: TIER_REQUIREMENTS.TIER2,
    loai: FORMULA_TYPES.DAO_CHIEU,
    laCongThucFrequency: true,
    yNghia: 'Đảo chiều từ tăng sang giảm - Bearish Reversal',

    noiDung: `
UPD - Up-Pause-Down (Tăng-Nghỉ-Giảm)
Chiến thuật đảo chiều từ tăng sang giảm.

NHẬN DẠNG:
- Tăng: Xu hướng tăng kéo dài
- Nghỉ: Consolidation ở đỉnh - vùng Distribution
- Giảm: Breakdown khỏi vùng Pause, bắt đầu xu hướng giảm

ĐIỀU KIỆN XÁC NHẬN:
- Volume tăng khi breakdown
- Giá đóng cửa dưới vùng Pause
- FTB vào vùng Pause thất bại (không vượt được)

VÀO LỆNH:
- Short khi giá quay lại test vùng Distribution (Pause)
- Xác nhận: Nến từ chối mạnh tại vùng giá
- Hoặc short khi breakdown với volume cao

PHÒNG THỦ:
- Cắt lỗ: Trên đỉnh vùng Pause
- Cẩn thận với phá vỡ giả (fakeout)

TÂM THỨC:
Đừng "married to a position". Thị trường không nợ bạn gì cả. Khi dấu hiệu đảo chiều xuất hiện, hãy chấp nhận và thích nghi.
    `.trim(),

    tuKhoa: ['UPD', 'up pause down', 'tăng nghỉ giảm', 'đảo chiều', 'reversal', 'distribution', 'bearish reversal'],
    congThucLienQuan: ['DPU', 'DPD'],

    viDu: {
      moTa: 'SOL tăng từ 80 lên 120, sideway 110-120 (distribution), rồi breakdown xuống 90',
      entry: 'Short khi breakdown dưới 110 hoặc FTB fail',
      sl: 'Trên 122',
      tp: '90 hoặc vùng Demand tiếp theo',
      rr: '1:2 tối thiểu',
    },
  },

  DPU: {
    id: 'DPU',
    ten: 'DPU',
    tenDayDu: 'Down-Pause-Up',
    tenViet: 'Giảm-Nghỉ-Tăng',
    tierYeuCau: TIER_REQUIREMENTS.TIER2,
    loai: FORMULA_TYPES.DAO_CHIEU,
    laCongThucFrequency: true,
    yNghia: 'Đảo chiều từ giảm sang tăng - Bullish Reversal (bắt đáy)',

    noiDung: `
DPU - Down-Pause-Up (Giảm-Nghỉ-Tăng)
Chiến thuật đảo chiều từ giảm sang tăng (bắt đáy).

NHẬN DẠNG:
- Giảm: Xu hướng giảm kéo dài
- Nghỉ: Consolidation ở đáy - vùng Accumulation
- Tăng: Breakout khỏi vùng Pause, bắt đầu xu hướng tăng

ĐIỀU KIỆN XÁC NHẬN:
- Volume tăng khi breakout
- Giá đóng cửa trên vùng Pause
- FTB vào vùng Pause thành công (giữ được support)

VÀO LỆNH:
- Long khi giá quay lại test vùng Accumulation (Pause)
- Xác nhận: Bật lên mạnh từ vùng giá
- Hoặc long khi breakout với volume cao

PHÒNG THỦ:
- Cắt lỗ: Dưới đáy vùng Pause
- Đây là chiến thuật bắt đáy - cần kỷ luật cao

TÂM THỨC:
"Buy when there's blood in the streets" - Baron Rothschild. Nhưng chỉ khi có cấu trúc rõ ràng. Đừng bắt dao rơi mù quáng.
    `.trim(),

    tuKhoa: ['DPU', 'down pause up', 'giảm nghỉ tăng', 'đảo chiều', 'reversal', 'accumulation', 'bullish reversal', 'bắt đáy'],
    congThucLienQuan: ['UPD', 'UPU'],

    viDu: {
      moTa: 'BNB giảm từ 300 xuống 200, sideway 200-220 (accumulation), rồi breakout lên 280',
      entry: 'Long khi breakout trên 220 hoặc FTB success',
      sl: 'Dưới 195',
      tp: '280 hoặc vùng Supply tiếp theo',
      rr: '1:2 tối thiểu',
    },
  },

  HFZ: {
    id: 'HFZ',
    ten: 'HFZ',
    tenDayDu: 'High Frequency Zone',
    tenViet: 'Vùng Tần Số Cao',
    tierYeuCau: TIER_REQUIREMENTS.TIER2,
    loai: FORMULA_TYPES.CHAT_LUONG_VUNG,
    laCongThucFrequency: true,
    yNghia: 'Vùng có xác suất phản ứng cao - Multiple touches, strong reaction',

    noiDung: `
HFZ - High Frequency Zone (Vùng Tần Số Cao)
Vùng có tần số phản ứng cao - nơi giá thường xuyên quay lại và có phản ứng mạnh.

ĐẶC ĐIỂM HFZ:
- Nhiều lần test: 2+ lần giá đã phản ứng tại vùng này
- Phản ứng mạnh: Nến rejection lớn, volume spike
- Confluence: Kết hợp với Fib levels, round numbers, previous S/R

CÁCH ĐÁNH GIÁ:
- Fresh Zone: 0 lần test - Tốt nhất
- Tested 1x: 1 lần test - Vẫn tốt
- Tested 2x+: 2+ lần test - Có thể yếu đi (nhưng nếu vẫn hold = HFZ)

GIAO DỊCH:
- Trade với size lớn hơn khi có HFZ confluence
- Tin tưởng vào vùng đã được chứng minh
- Risk reward vẫn phải tối thiểu 1:2

TÂM THỨC:
Những vùng đã được chứng minh hiệu quả đáng để tin tưởng. Nhưng không có gì là vĩnh viễn. Luôn có stoploss.
    `.trim(),

    tuKhoa: ['HFZ', 'high frequency zone', 'vùng tần số cao', 'zone quality', 'strong zone', 'vùng mạnh'],
    congThucLienQuan: ['LFZ', 'UPU', 'DPD'],

    viDu: {
      moTa: 'Vùng 25000-25200 BTC đã test 3 lần và mỗi lần đều bounce 500+ pips',
      tinhCach: 'Trade với size lớn hơn khi có HFZ confluence',
    },
  },

  LFZ: {
    id: 'LFZ',
    ten: 'LFZ',
    tenDayDu: 'Low Frequency Zone',
    tenViet: 'Vùng Tần Số Thấp',
    tierYeuCau: TIER_REQUIREMENTS.TIER2,
    loai: FORMULA_TYPES.CHAT_LUONG_VUNG,
    laCongThucFrequency: true,
    yNghia: 'Vùng có xác suất phản ứng thấp - Weak zone, likely to break',

    noiDung: `
LFZ - Low Frequency Zone (Vùng Tần Số Thấp)
Vùng có tần số phản ứng thấp - nơi giá có thể dễ dàng xuyên qua.

ĐẶC ĐIỂM LFZ:
- Ít test hoặc phản ứng yếu: Giá chỉ "chạm qua" không có rejection rõ ràng
- Volume thấp: Không có volume spike khi test
- Đã bị break nhiều lần: Vùng đã mất đi sức mạnh

CÁCH XỬ LÝ LFZ:
- KHÔNG giao dịch bounce/rejection tại LFZ
- Coi LFZ như vùng "checkpoint" - giá sẽ slow down nhưng không reverse
- Trade breakout qua LFZ thay vì trade bounce

CẢNH BÁO:
- LFZ thường bị fakeout
- Không tin vào vùng đã yếu
- Nên skip và chờ vùng khác

TÂM THỨC:
Biết điểm yếu của setup cũng quan trọng như biết điểm mạnh. Tránh LFZ là cách bảo vệ vốn tốt nhất.
    `.trim(),

    tuKhoa: ['LFZ', 'low frequency zone', 'vùng tần số thấp', 'weak zone', 'vùng yếu'],
    congThucLienQuan: ['HFZ', 'UPD', 'DPU'],

    viDu: {
      moTa: 'Vùng 1800-1820 ETH đã bị break 2 lần trong tuần qua, mỗi lần chỉ bounce 20-30 pips',
      tinhCach: 'Skip trade tại vùng này hoặc trade breakout',
    },
  },
};

// ===========================================
// CÔNG THỨC CƠ BẢN (FREE)
// ===========================================

export const BASIC_FORMULAS = {
  DAU_VAI: {
    id: 'DAU_VAI',
    ten: 'Đầu Vai',
    tenDayDu: 'Head and Shoulders',
    tenViet: 'Đầu Vai',
    tierYeuCau: TIER_REQUIREMENTS.FREE,
    loai: FORMULA_TYPES.MO_HINH_CO_DIEN,
    laCongThucFrequency: false,
    yNghia: 'Mô hình đảo chiều từ tăng sang giảm - Classic bearish reversal',

    noiDung: `
ĐẦU VAI - Head and Shoulders
Mô hình đảo chiều cổ điển, báo hiệu xu hướng tăng sắp kết thúc.

CẤU TRÚC:
- Vai trái (Left Shoulder): Đỉnh đầu tiên
- Đầu (Head): Đỉnh cao nhất
- Vai phải (Right Shoulder): Đỉnh thấp hơn đầu
- Đường viền cổ (Neckline): Đường nối 2 đáy

VÀO LỆNH:
- Conservative: Đợi break neckline + retest
- Aggressive: Short ngay khi vai phải hình thành

PHÒNG THỦ:
- Cắt lỗ: Trên đỉnh vai phải + buffer

MỤC TIÊU:
- Bằng khoảng cách từ đầu xuống neckline

TÂM THỨC:
Mô hình đầu vai cần thời gian hình thành. Kiên nhẫn đợi xác nhận. Đừng vội vàng "predict" trước khi pattern hoàn thành.

Đây là công thức cơ bản, người học MIỄN PHÍ có thể học.
    `.trim(),

    tuKhoa: ['đầu vai', 'head and shoulders', 'đảo chiều', 'reversal pattern', 'bearish pattern'],
    congThucLienQuan: ['HAI_DINH', 'HAI_DAY'],
  },

  HAI_DINH: {
    id: 'HAI_DINH',
    ten: 'Hai Đỉnh',
    tenDayDu: 'Double Top',
    tenViet: 'Hai Đỉnh',
    tierYeuCau: TIER_REQUIREMENTS.FREE,
    loai: FORMULA_TYPES.MO_HINH_CO_DIEN,
    laCongThucFrequency: false,
    yNghia: 'Mô hình đảo chiều từ tăng sang giảm - M pattern',

    noiDung: `
HAI ĐỈNH - Double Top (M Pattern)
Mô hình chữ M, báo hiệu xu hướng tăng sắp đảo chiều.

CẤU TRÚC:
- Đỉnh 1: Giá tạo đỉnh cao
- Pullback: Giá giảm xuống support
- Đỉnh 2: Giá test lại đỉnh 1 nhưng không vượt được
- Breakdown: Giá break support (neckline)

ĐIỀU KIỆN XÁC NHẬN:
- 2 đỉnh gần bằng nhau (chênh lệch < 3%)
- Volume đỉnh 2 thấp hơn đỉnh 1
- Break neckline với volume tăng

VÀO LỆNH:
- Short khi break neckline
- Hoặc short khi retest neckline từ dưới lên

PHÒNG THỦ:
- Cắt lỗ: Trên đỉnh 2 + buffer

TÂM THỨC:
"Failed test of high = bearish". Khi thị trường không thể tạo đỉnh cao hơn, phe mua đang yếu đi.

Đây là công thức cơ bản, người học MIỄN PHÍ có thể học.
    `.trim(),

    tuKhoa: ['hai đỉnh', 'double top', 'M pattern', 'đảo chiều', 'bearish reversal'],
    congThucLienQuan: ['DAU_VAI', 'HAI_DAY'],
  },

  HAI_DAY: {
    id: 'HAI_DAY',
    ten: 'Hai Đáy',
    tenDayDu: 'Double Bottom',
    tenViet: 'Hai Đáy',
    tierYeuCau: TIER_REQUIREMENTS.FREE,
    loai: FORMULA_TYPES.MO_HINH_CO_DIEN,
    laCongThucFrequency: false,
    yNghia: 'Mô hình đảo chiều từ giảm sang tăng - W pattern',

    noiDung: `
HAI ĐÁY - Double Bottom (W Pattern)
Mô hình chữ W, báo hiệu xu hướng giảm sắp đảo chiều thành tăng.

CẤU TRÚC:
- Đáy 1: Giá tạo đáy thấp
- Bounce: Giá tăng lên resistance
- Đáy 2: Giá test lại đáy 1 nhưng không thấp hơn
- Breakout: Giá break resistance (neckline)

ĐIỀU KIỆN XÁC NHẬN:
- 2 đáy gần bằng nhau (chênh lệch < 3%)
- Volume đáy 2 thấp hơn đáy 1 (divergence)
- Break neckline với volume tăng

VÀO LỆNH:
- Long khi break neckline
- Hoặc long khi retest neckline từ trên xuống

PHÒNG THỦ:
- Cắt lỗ: Dưới đáy 2 + buffer

TÂM THỨC:
"Failed test of low = bullish". Khi thị trường không thể tạo đáy thấp hơn, phe bán đang kiệt sức.

Đây là công thức cơ bản, người học MIỄN PHÍ có thể học.
    `.trim(),

    tuKhoa: ['hai đáy', 'double bottom', 'W pattern', 'đảo chiều', 'bullish reversal', 'bắt đáy'],
    congThucLienQuan: ['DAU_VAI', 'HAI_DINH'],
  },
};

// ===========================================
// KHÁI NIỆM VÙNG GIÁ
// ===========================================

export const ZONE_CONCEPTS = {
  VUNG_MOI: {
    id: 'VUNG_MOI',
    ten: 'Vùng Mới',
    tenDayDu: 'Fresh Zone',
    tenViet: 'Vùng Mới',
    tierYeuCau: TIER_REQUIREMENTS.TIER1,
    loai: FORMULA_TYPES.CHAT_LUONG_VUNG,
    yNghia: 'Vùng chưa được test - Xác suất phản ứng cao nhất',

    noiDung: `
VÙNG MỚI - Fresh Zone
Vùng Supply/Demand chưa bao giờ được test lại.

ĐẶC ĐIỂM:
- Chưa có lần FTB (First Time Back) nào
- Xác suất phản ứng: 70-80%
- Là loại zone có chất lượng cao nhất

CÁCH NHẬN BIẾT:
1. Vùng vừa được tạo bởi impulse move mạnh
2. Giá chưa quay lại test
3. Volume tạo zone rất cao

GIAO DỊCH:
- Ưu tiên trade FTB vào Fresh Zone
- Risk nhỏ hơn vì xác suất cao
- Vẫn phải có stoploss

TÂM THỨC:
Fresh zone như trái cây mới hái - tươi ngon nhất. Đừng bỏ lỡ cơ hội trade FTB.
    `.trim(),

    tuKhoa: ['fresh zone', 'vùng mới', 'FTB', 'first time back', 'chưa test'],
    congThucLienQuan: ['VUNG_DA_KIEM_TRA', 'HFZ'],
  },

  VUNG_DA_KIEM_TRA: {
    id: 'VUNG_DA_KIEM_TRA',
    ten: 'Vùng Đã Kiểm Tra',
    tenDayDu: 'Tested Zone',
    tenViet: 'Vùng Đã Kiểm Tra',
    tierYeuCau: TIER_REQUIREMENTS.TIER1,
    loai: FORMULA_TYPES.CHAT_LUONG_VUNG,
    yNghia: 'Vùng đã được test 1-2 lần - Vẫn có giá trị nhưng yếu hơn Fresh',

    noiDung: `
VÙNG ĐÃ KIỂM TRA - Tested Zone
Vùng đã được giá quay lại test ít nhất 1 lần.

MỨC ĐỘ TEST:
- 1x Tested: Vẫn còn mạnh, trade được (60-70%)
- 2x Tested: Yếu hơn, cần thêm confluence (40-50%)
- 3x+ Tested: Rất yếu, nên skip hoặc trade breakout

ĐÁNH GIÁ CHẤT LƯỢNG:
1. Phản ứng có mạnh không? (rejection candle, volume)
2. Giá có hold được zone không? (no close inside)
3. Có tạo HH/LL sau khi test không?

GIAO DỊCH:
- Vẫn trade được nếu 1-2x tested
- Cần thêm confluence: HFZ, round number, Fib
- Size nhỏ hơn so với Fresh Zone

TÂM THỨC:
Mỗi lần test, zone yếu đi một chút. Như chiếc cầu bị nhiều xe chạy qua. Biết khi nào nên dừng.
    `.trim(),

    tuKhoa: ['tested zone', 'vùng đã kiểm tra', 'zone test count', 'vùng đã test'],
    congThucLienQuan: ['VUNG_MOI', 'LFZ'],
  },

  VUNG_CUNG: {
    id: 'VUNG_CUNG',
    ten: 'Vùng Cung',
    tenDayDu: 'Supply Zone',
    tenViet: 'Vùng Cung',
    tierYeuCau: TIER_REQUIREMENTS.FREE,
    loai: FORMULA_TYPES.CHAT_LUONG_VUNG,
    yNghia: 'Vùng có nhiều seller - Giá thường giảm khi chạm',

    noiDung: `
VÙNG CUNG - Supply Zone
Vùng giá nơi có nhiều seller sẵn sàng bán.

CÁCH NHẬN BIẾT:
1. Base trước drop: Consolidation → Strong drop
2. Volume cao: Nhiều giao dịch xảy ra
3. Giá rời đi nhanh: Impulse move mạnh xuống

GIAO DỊCH:
- Entry: Short khi giá FTB vào Supply Zone
- Stoploss: Trên đỉnh zone + buffer
- Target: Demand Zone tiếp theo hoặc 1:2 RR

PHÂN LOẠI:
- Fresh Supply: Chưa test - Tốt nhất
- Tested Supply: Đã test 1 lần - Vẫn được
- Weak Supply: Đã test 2+ lần - Nên skip

TÂM THỨC:
Supply Zone là nơi "smart money" đã bán. Khi giá quay lại, họ tiếp tục bán. Đi theo dòng tiền lớn.

Đây là kiến thức cơ bản, người học MIỄN PHÍ có thể học.
    `.trim(),

    tuKhoa: ['supply zone', 'vùng cung', 'sell zone', 'resistance zone', 'vùng bán'],
    congThucLienQuan: ['VUNG_CAU', 'DPD'],
  },

  VUNG_CAU: {
    id: 'VUNG_CAU',
    ten: 'Vùng Cầu',
    tenDayDu: 'Demand Zone',
    tenViet: 'Vùng Cầu',
    tierYeuCau: TIER_REQUIREMENTS.FREE,
    loai: FORMULA_TYPES.CHAT_LUONG_VUNG,
    yNghia: 'Vùng có nhiều buyer - Giá thường tăng khi chạm',

    noiDung: `
VÙNG CẦU - Demand Zone
Vùng giá nơi có nhiều buyer sẵn sàng mua.

CÁCH NHẬN BIẾT:
1. Base trước rally: Consolidation → Strong rally
2. Volume cao: Nhiều giao dịch xảy ra
3. Giá rời đi nhanh: Impulse move mạnh lên

GIAO DỊCH:
- Entry: Long khi giá FTB vào Demand Zone
- Stoploss: Dưới đáy zone + buffer
- Target: Supply Zone tiếp theo hoặc 1:2 RR

PHÂN LOẠI:
- Fresh Demand: Chưa test - Tốt nhất
- Tested Demand: Đã test 1 lần - Vẫn được
- Weak Demand: Đã test 2+ lần - Nên skip

TÂM THỨC:
Demand Zone là nơi "smart money" đã mua. Khi giá quay lại, họ tiếp tục accumulate. Đi theo dòng tiền lớn.

Đây là kiến thức cơ bản, người học MIỄN PHÍ có thể học.
    `.trim(),

    tuKhoa: ['demand zone', 'vùng cầu', 'buy zone', 'support zone', 'vùng mua'],
    congThucLienQuan: ['VUNG_CUNG', 'UPU'],
  },
};

// ===========================================
// KIỂM SOÁT TRUY CẬP TIER
// ===========================================

/**
 * Kiểm tra người dùng có quyền truy cập nội dung không
 * @param {string} userTier - Tier hiện tại của người dùng
 * @param {string} requiredTier - Tier yêu cầu cho nội dung
 * @returns {boolean}
 */
export function checkTierAccess(userTier, requiredTier) {
  const userLevel = TIER_HIERARCHY[userTier] ?? 0;
  const requiredLevel = TIER_HIERARCHY[requiredTier] ?? 0;
  return userLevel >= requiredLevel;
}

/**
 * Lấy nội dung bị khóa (cho người dùng không đủ quyền)
 * @param {Object} formula - Đối tượng công thức
 * @returns {string} Nội dung giới hạn cho công thức bị khóa
 */
function getLockedContent(formula) {
  return `
${formula.ten} (${formula.tenDayDu})

${formula.yNghia}

---
NỘI DUNG NÀY YÊU CẦU ${formula.tierYeuCau}

Nâng cấp để mở khóa:
- Công thức chi tiết
- Ví dụ thực tế
- Hướng dẫn giao dịch
- Bài học tâm thức

Liên hệ hỗ trợ để nâng cấp tier.
  `.trim();
}

/**
 * Lấy thông báo nâng cấp cho nội dung bị khóa
 * @param {string} currentTier - Tier hiện tại của người dùng
 * @param {string} requiredTier - Tier yêu cầu
 * @returns {Object} Thông báo nâng cấp
 */
export function getUpgradeMessage(currentTier, requiredTier) {
  const messages = {
    'FREE_TIER1': {
      title: 'Nâng cấp lên TIER 1',
      message: 'Mở khóa Zone Concepts và nhiều tính năng hơn!',
      benefits: ['Fresh/Tested Zone', 'Paper Trading', 'Thêm patterns'],
    },
    'FREE_TIER2': {
      title: 'Nâng cấp lên TIER 2',
      message: 'Mở khóa 6 Frequency Formulas - Công thức độc quyền!',
      benefits: ['6 Frequency Formulas', 'HFZ/LFZ Analysis', 'AI Signals'],
    },
    'TIER1_TIER2': {
      title: 'Nâng cấp lên TIER 2',
      message: 'Mở khóa 6 Frequency Formulas - Công thức độc quyền!',
      benefits: ['6 Frequency Formulas', 'HFZ/LFZ Analysis', 'AI Signals'],
    },
  };

  const key = `${currentTier}_${requiredTier}`;
  return messages[key] || messages['FREE_TIER2'];
}

// ===========================================
// HÀM TÌM KIẾM
// ===========================================

/**
 * Lấy tất cả công thức kết hợp
 */
export function getAllFormulas() {
  return {
    ...FREQUENCY_FORMULAS,
    ...BASIC_FORMULAS,
    ...ZONE_CONCEPTS,
  };
}

/**
 * Tìm kiếm công thức theo từ khóa
 * @param {string} query - Truy vấn tìm kiếm
 * @param {string} userTier - Tier của người dùng (FREE, TIER1, TIER2, TIER3)
 * @returns {Array} Các công thức phù hợp
 */
export function searchFormulas(query, userTier = 'FREE') {
  const normalizedQuery = query.toLowerCase().trim();
  const allFormulas = getAllFormulas();
  const results = [];

  for (const [id, formula] of Object.entries(allFormulas)) {
    let score = 0;

    // Khớp chính xác ID
    if (id.toLowerCase() === normalizedQuery) score += 1.5;

    // Khớp tên
    if (formula.ten?.toLowerCase().includes(normalizedQuery)) score += 1.0;
    if (formula.tenDayDu?.toLowerCase().includes(normalizedQuery)) score += 0.9;
    if (formula.tenViet?.toLowerCase().includes(normalizedQuery)) score += 0.8;

    // Khớp từ khóa
    if (formula.tuKhoa?.some(k => k.toLowerCase().includes(normalizedQuery))) {
      score += 0.7;
    }

    // Khớp nội dung (trọng số thấp hơn)
    if (formula.yNghia?.toLowerCase().includes(normalizedQuery)) score += 0.5;

    if (score > 0) {
      const isAccessible = checkTierAccess(userTier, formula.tierYeuCau);
      results.push({
        ...formula,
        score,
        isLocked: !isAccessible,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Lấy công thức theo ID
 * @param {string} id - ID công thức
 * @param {string} userTier - Tier của người dùng
 * @returns {Object|null} Công thức với thông tin truy cập
 */
export function getFormulaById(id, userTier = 'FREE') {
  const allFormulas = getAllFormulas();
  const formula = allFormulas[id] || allFormulas[id.toUpperCase()];

  if (!formula) return null;

  const isAccessible = checkTierAccess(userTier, formula.tierYeuCau);

  return {
    ...formula,
    isLocked: !isAccessible,
    // Nếu bị khóa, chỉ trả về thông tin giới hạn
    noiDung: isAccessible ? formula.noiDung : getLockedContent(formula),
  };
}

/**
 * Lấy công thức theo tier
 * @param {string} tier - Tier để lọc
 * @returns {Array} Các công thức có sẵn cho tier đó
 */
export function getFormulasByTier(tier) {
  const allFormulas = getAllFormulas();
  return Object.values(allFormulas).filter(f =>
    checkTierAccess(tier, f.tierYeuCau)
  );
}

/**
 * Lấy công thức theo loại
 * @param {string} loai - Loại công thức
 * @param {string} userTier - Tier của người dùng
 * @returns {Array} Các công thức phù hợp
 */
export function getFormulasByType(loai, userTier = 'FREE') {
  const allFormulas = getAllFormulas();
  return Object.values(allFormulas)
    .filter(f => f.loai === loai)
    .map(f => ({
      ...f,
      isLocked: !checkTierAccess(userTier, f.tierYeuCau),
    }));
}

/**
 * Chỉ lấy Frequency Formulas (TIER2)
 */
export function getFrequencyFormulas(userTier = 'FREE') {
  return Object.values(FREQUENCY_FORMULAS).map(f => ({
    ...f,
    isLocked: !checkTierAccess(userTier, f.tierYeuCau),
  }));
}

/**
 * Lấy công thức liên quan
 * @param {string} formulaId - ID công thức nguồn
 * @param {string} userTier - Tier của người dùng
 * @returns {Array} Các công thức liên quan
 */
export function getRelatedFormulas(formulaId, userTier = 'FREE') {
  const formula = getFormulaById(formulaId, userTier);
  if (!formula || !formula.congThucLienQuan) return [];

  return formula.congThucLienQuan
    .map(id => getFormulaById(id, userTier))
    .filter(f => f !== null);
}

// ===========================================
// ĐỊNH DẠNG NGỮ CẢNH AI
// ===========================================

/**
 * Định dạng công thức cho ngữ cảnh AI prompt
 * @param {Object} formula - Đối tượng công thức
 * @returns {string} Ngữ cảnh đã định dạng cho AI
 */
export function formatForAIContext(formula) {
  if (!formula) return '';

  return `
## ${formula.ten} (${formula.tenDayDu})
**Loại**: ${formula.loai}
**Ý nghĩa**: ${formula.yNghia}

${formula.noiDung}

**Từ khóa**: ${formula.tuKhoa?.join(', ')}
**Công thức liên quan**: ${formula.congThucLienQuan?.join(', ')}
  `.trim();
}

/**
 * Xây dựng ngữ cảnh kiến thức cho chatbot
 * @param {string} userMessage - Tin nhắn của người dùng
 * @param {string} userTier - Tier của người dùng
 * @returns {Object} Ngữ cảnh cho AI prompt
 */
export function buildKnowledgeContext(userMessage, userTier) {
  const results = searchFormulas(userMessage, userTier);

  if (results.length === 0) {
    return { found: false, context: '' };
  }

  // Lấy top 3 công thức liên quan
  const topResults = results.slice(0, 3);
  const context = topResults
    .filter(r => !r.isLocked)
    .map(r => formatForAIContext(r))
    .join('\n\n---\n\n');

  const lockedResults = topResults.filter(r => r.isLocked);

  return {
    found: true,
    context,
    formulas: topResults,
    lockedFormulas: lockedResults,
    hasLockedContent: lockedResults.length > 0,
  };
}

// ===========================================
// EXPORTS
// ===========================================

export default {
  // Hằng số
  TIER_REQUIREMENTS,
  FORMULA_TYPES,
  // Dữ liệu
  FREQUENCY_FORMULAS,
  BASIC_FORMULAS,
  ZONE_CONCEPTS,
  // Hàm
  checkTierAccess,
  getUpgradeMessage,
  getAllFormulas,
  searchFormulas,
  getFormulaById,
  getFormulasByTier,
  getFormulasByType,
  getFrequencyFormulas,
  getRelatedFormulas,
  formatForAIContext,
  buildKnowledgeContext,
};
