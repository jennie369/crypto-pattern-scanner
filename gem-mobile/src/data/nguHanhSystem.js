/**
 * Ngũ Hành (Five Elements) System - Vietnamese Feng Shui
 * Used by AI Brain for personalized crystal recommendations
 *
 * Mệnh: Kim (Metal), Mộc (Wood), Thủy (Water), Hỏa (Fire), Thổ (Earth)
 * Sinh: Supporting cycle (tương sinh)
 * Khắc: Conflicting cycle (tương khắc)
 */

// ===========================================
// NGŨ HÀNH CORE DATA
// ===========================================

export const NGU_HANH = {
  kim: {
    id: 'kim',
    name: 'Kim',
    nameEn: 'Metal',
    emoji: '🪙',
    color: '#C0C0C0', // Silver
    colors: ['Trắng', 'Bạc', 'Vàng kim', 'Xám'],
    direction: 'Tây, Tây Bắc',
    season: 'Thu',
    numbers: [4, 9],

    // Tính cách
    personality: {
      positive: ['Quyết đoán', 'Công bằng', 'Mạnh mẽ', 'Kiên định', 'Thẳng thắn'],
      negative: ['Cứng nhắc', 'Lạnh lùng', 'Khó lay chuyển', 'Hay phán xét'],
      career: ['Luật sư', 'Quản lý', 'Tài chính', 'Kỹ sư', 'Quân đội'],
      health: ['Phổi', 'Da', 'Đường hô hấp'],
    },

    // Đá phong thủy
    crystals: {
      main: ['clear_quartz', 'white_jade', 'moonstone', 'howlite'],
      support: ['pyrite', 'hematite', 'tigers_eye'],
      avoid: ['malachite', 'green_aventurine'], // Mộc khắc Kim
    },

    // Mối quan hệ ngũ hành
    relationships: {
      sinh_by: 'tho',   // Thổ sinh Kim (đất tạo ra kim loại)
      sinh_for: 'thuy', // Kim sinh Thủy (kim loại chảy thành nước)
      khac_by: 'hoa',   // Hỏa khắc Kim (lửa nấu chảy kim loại)
      khac_for: 'moc',  // Kim khắc Mộc (kim loại chặt gỗ)
    },

    // AI Response Templates
    templates: {
      greeting: 'Chào bạn mệnh Kim! Bạn là người quyết đoán và công bằng đấy!',
      crystal_intro: 'Mệnh Kim của bạn cần đá màu trắng, bạc để tăng năng lượng.',
      advice: 'Bạn nên tránh đá màu xanh lá (mộc) vì xung khắc với mệnh.',
      selling: 'Thạch Anh Trắng là "best choice" cho mệnh Kim - tăng sự minh mẫn và quyết đoán!',
    },
  },

  moc: {
    id: 'moc',
    name: 'Mộc',
    nameEn: 'Wood',
    emoji: '🌳',
    color: '#228B22', // Forest Green
    colors: ['Xanh lá', 'Xanh ngọc', 'Nâu gỗ'],
    direction: 'Đông, Đông Nam',
    season: 'Xuân',
    numbers: [3, 8],

    personality: {
      positive: ['Sáng tạo', 'Linh hoạt', 'Nhân ái', 'Phát triển', 'Kiên nhẫn'],
      negative: ['Bướng bỉnh', 'Hay lo lắng', 'Thiếu quyết đoán', 'Dễ bị ảnh hưởng'],
      career: ['Giáo dục', 'Y tế', 'Nghệ thuật', 'Môi trường', 'Nông nghiệp'],
      health: ['Gan', 'Mật', 'Mắt', 'Gân cơ'],
    },

    crystals: {
      main: ['green_aventurine', 'malachite', 'jade', 'peridot', 'moss_agate'],
      support: ['amazonite', 'emerald', 'green_fluorite'],
      avoid: ['clear_quartz', 'white_jade'], // Kim khắc Mộc
    },

    relationships: {
      sinh_by: 'thuy',  // Thủy sinh Mộc (nước nuôi cây)
      sinh_for: 'hoa',  // Mộc sinh Hỏa (gỗ tạo ra lửa)
      khac_by: 'kim',   // Kim khắc Mộc (kim loại chặt gỗ)
      khac_for: 'tho',  // Mộc khắc Thổ (cây hút dinh dưỡng đất)
    },

    templates: {
      greeting: 'Chào bạn mệnh Mộc! Bạn như cây xanh - đầy sức sống và sáng tạo!',
      crystal_intro: 'Mệnh Mộc thích hợp với đá xanh lá, xanh ngọc để phát triển.',
      advice: 'Bạn nên tránh đá trắng/bạc (kim) vì có thể khắc chế năng lượng.',
      selling: 'Ngọc Bích Xanh là "must have" cho mệnh Mộc - thu hút tài lộc và sức khỏe!',
    },
  },

  thuy: {
    id: 'thuy',
    name: 'Thủy',
    nameEn: 'Water',
    emoji: '💧',
    color: '#000080', // Navy Blue
    colors: ['Đen', 'Xanh dương đậm', 'Xanh navy'],
    direction: 'Bắc',
    season: 'Đông',
    numbers: [1, 6],

    personality: {
      positive: ['Thông minh', 'Linh hoạt', 'Giao tiếp tốt', 'Thích nghi nhanh', 'Sâu sắc'],
      negative: ['Hay thay đổi', 'Thiếu kiên định', 'Đa nghi', 'Dễ lo âu'],
      career: ['Truyền thông', 'Du lịch', 'Logistics', 'Tâm lý', 'Nghiên cứu'],
      health: ['Thận', 'Bàng quang', 'Xương', 'Hệ sinh sản'],
    },

    crystals: {
      main: ['black_obsidian', 'lapis_lazuli', 'sodalite', 'blue_sapphire', 'labradorite'],
      support: ['aquamarine', 'blue_lace_agate', 'kyanite'],
      avoid: ['carnelian', 'red_jasper', 'sunstone'], // Thổ khắc Thủy
    },

    relationships: {
      sinh_by: 'kim',   // Kim sinh Thủy (kim loại chảy thành nước)
      sinh_for: 'moc',  // Thủy sinh Mộc (nước nuôi cây)
      khac_by: 'tho',   // Thổ khắc Thủy (đất ngăn nước)
      khac_for: 'hoa',  // Thủy khắc Hỏa (nước dập lửa)
    },

    templates: {
      greeting: 'Chào bạn mệnh Thủy! Bạn thông minh và linh hoạt như dòng nước!',
      crystal_intro: 'Mệnh Thủy phù hợp với đá đen, xanh dương để tăng trí tuệ.',
      advice: 'Bạn nên hạn chế đá màu vàng/nâu (thổ) vì xung khắc.',
      selling: 'Obsidian Đen là "shield" hoàn hảo cho mệnh Thủy - bảo vệ và thanh lọc!',
    },
  },

  hoa: {
    id: 'hoa',
    name: 'Hỏa',
    nameEn: 'Fire',
    emoji: '🔥',
    color: '#FF4500', // Red Orange
    colors: ['Đỏ', 'Cam', 'Hồng', 'Tím'],
    direction: 'Nam',
    season: 'Hạ',
    numbers: [2, 7],

    personality: {
      positive: ['Nhiệt tình', 'Lạc quan', 'Năng động', 'Lãnh đạo', 'Quyến rũ'],
      negative: ['Nóng nảy', 'Thiếu kiên nhẫn', 'Bốc đồng', 'Hay ganh tỵ'],
      career: ['Giải trí', 'Marketing', 'Thể thao', 'Chính trị', 'Khởi nghiệp'],
      health: ['Tim', 'Mạch máu', 'Ruột non', 'Mắt'],
    },

    crystals: {
      main: ['carnelian', 'red_jasper', 'garnet', 'sunstone', 'ruby'],
      support: ['fire_opal', 'orange_calcite', 'red_tiger_eye'],
      avoid: ['black_obsidian', 'lapis_lazuli', 'aquamarine'], // Thủy khắc Hỏa
    },

    relationships: {
      sinh_by: 'moc',   // Mộc sinh Hỏa (gỗ tạo lửa)
      sinh_for: 'tho',  // Hỏa sinh Thổ (tro thành đất)
      khac_by: 'thuy',  // Thủy khắc Hỏa (nước dập lửa)
      khac_for: 'kim',  // Hỏa khắc Kim (lửa nấu kim loại)
    },

    templates: {
      greeting: 'Chào bạn mệnh Hỏa! Bạn tỏa năng lượng tích cực như mặt trời!',
      crystal_intro: 'Mệnh Hỏa hợp với đá đỏ, cam, hồng để tăng may mắn.',
      advice: 'Bạn nên tránh đá đen, xanh dương đậm (thủy) vì khắc chế.',
      selling: 'Carnelian là "power stone" cho mệnh Hỏa - tăng sức mạnh và sự tự tin!',
    },
  },

  tho: {
    id: 'tho',
    name: 'Thổ',
    nameEn: 'Earth',
    emoji: '⛰️',
    color: '#DAA520', // Goldenrod
    colors: ['Vàng', 'Nâu', 'Cam đất', 'Be'],
    direction: 'Trung tâm, Tây Nam, Đông Bắc',
    season: 'Giao mùa (Tứ Quý)',
    numbers: [0, 5],

    personality: {
      positive: ['Trung thực', 'Đáng tin cậy', 'Ổn định', 'Chăm chỉ', 'Thực tế'],
      negative: ['Bảo thủ', 'Chậm thay đổi', 'Lo lắng', 'Hay nghi ngờ'],
      career: ['Bất động sản', 'Xây dựng', 'Nông nghiệp', 'Kế toán', 'Ngân hàng'],
      health: ['Dạ dày', 'Lá lách', 'Cơ bắp', 'Hệ tiêu hóa'],
    },

    crystals: {
      main: ['citrine', 'tigers_eye', 'yellow_jasper', 'amber', 'bronzite'],
      support: ['golden_topaz', 'honey_calcite', 'picture_jasper'],
      avoid: ['green_aventurine', 'malachite', 'jade'], // Mộc khắc Thổ
    },

    relationships: {
      sinh_by: 'hoa',   // Hỏa sinh Thổ (tro thành đất)
      sinh_for: 'kim',  // Thổ sinh Kim (đất tạo kim loại)
      khac_by: 'moc',   // Mộc khắc Thổ (cây hút đất)
      khac_for: 'thuy', // Thổ khắc Thủy (đất ngăn nước)
    },

    templates: {
      greeting: 'Chào bạn mệnh Thổ! Bạn là người đáng tin cậy và vững chãi!',
      crystal_intro: 'Mệnh Thổ phù hợp với đá vàng, nâu để tăng sự ổn định.',
      advice: 'Bạn nên hạn chế đá xanh lá (mộc) vì có thể khắc chế.',
      selling: 'Citrine là "đá tài lộc" số 1 cho mệnh Thổ - thu hút tiền bạc và may mắn!',
    },
  },
};

// ===========================================
// TƯƠNG SINH - TƯƠNG KHẮC CYCLES
// ===========================================

export const CYCLES = {
  // Tương Sinh (Supporting): Mỗi hành sinh ra hành tiếp theo
  tuong_sinh: {
    kim: 'thuy',  // Kim sinh Thủy
    thuy: 'moc',  // Thủy sinh Mộc
    moc: 'hoa',   // Mộc sinh Hỏa
    hoa: 'tho',   // Hỏa sinh Thổ
    tho: 'kim',   // Thổ sinh Kim
  },

  // Tương Khắc (Conflicting): Mỗi hành khắc hành cách 1
  tuong_khac: {
    kim: 'moc',   // Kim khắc Mộc
    moc: 'tho',   // Mộc khắc Thổ
    tho: 'thuy',  // Thổ khắc Thủy
    thuy: 'hoa',  // Thủy khắc Hỏa
    hoa: 'kim',   // Hỏa khắc Kim
  },
};

// ===========================================
// NĂM SINH → MỆNH LOOKUP TABLE
// Can Chi: Giáp(0), Ất(1), Bính(2), Đinh(3), Mậu(4), Kỷ(5), Canh(6), Tân(7), Nhâm(8), Quý(9)
// ===========================================

// Bảng nạp âm 60 năm (Lục Thập Hoa Giáp)
const NAP_AM_TABLE = {
  // Giáp Tý - Ất Sửu: Kim (Hải Trung Kim)
  0: 'kim', 1: 'kim',
  // Bính Dần - Đinh Mão: Hỏa (Lư Trung Hỏa)
  2: 'hoa', 3: 'hoa',
  // Mậu Thìn - Kỷ Tỵ: Mộc (Đại Lâm Mộc)
  4: 'moc', 5: 'moc',
  // Canh Ngọ - Tân Mùi: Thổ (Lộ Bàng Thổ)
  6: 'tho', 7: 'tho',
  // Nhâm Thân - Quý Dậu: Kim (Kiếm Phong Kim)
  8: 'kim', 9: 'kim',
  // Giáp Tuất - Ất Hợi: Hỏa (Sơn Đầu Hỏa)
  10: 'hoa', 11: 'hoa',
  // Bính Tý - Đinh Sửu: Thủy (Giản Hạ Thủy)
  12: 'thuy', 13: 'thuy',
  // Mậu Dần - Kỷ Mão: Thổ (Thành Đầu Thổ)
  14: 'tho', 15: 'tho',
  // Canh Thìn - Tân Tỵ: Kim (Bạch Lạp Kim)
  16: 'kim', 17: 'kim',
  // Nhâm Ngọ - Quý Mùi: Mộc (Dương Liễu Mộc)
  18: 'moc', 19: 'moc',
  // Giáp Thân - Ất Dậu: Thủy (Tuyền Trung Thủy)
  20: 'thuy', 21: 'thuy',
  // Bính Tuất - Đinh Hợi: Thổ (Ốc Thượng Thổ)
  22: 'tho', 23: 'tho',
  // Mậu Tý - Kỷ Sửu: Hỏa (Tích Lịch Hỏa)
  24: 'hoa', 25: 'hoa',
  // Canh Dần - Tân Mão: Mộc (Tùng Bách Mộc)
  26: 'moc', 27: 'moc',
  // Nhâm Thìn - Quý Tỵ: Thủy (Trường Lưu Thủy)
  28: 'thuy', 29: 'thuy',
  // Giáp Ngọ - Ất Mùi: Kim (Sa Trung Kim)
  30: 'kim', 31: 'kim',
  // Bính Thân - Đinh Dậu: Hỏa (Sơn Hạ Hỏa)
  32: 'hoa', 33: 'hoa',
  // Mậu Tuất - Kỷ Hợi: Mộc (Bình Địa Mộc)
  34: 'moc', 35: 'moc',
  // Canh Tý - Tân Sửu: Thổ (Bích Thượng Thổ)
  36: 'tho', 37: 'tho',
  // Nhâm Dần - Quý Mão: Kim (Kim Bạc Kim)
  38: 'kim', 39: 'kim',
  // Giáp Thìn - Ất Tỵ: Hỏa (Phú Đăng Hỏa)
  40: 'hoa', 41: 'hoa',
  // Bính Ngọ - Đinh Mùi: Thủy (Thiên Hà Thủy)
  42: 'thuy', 43: 'thuy',
  // Mậu Thân - Kỷ Dậu: Thổ (Đại Trạch Thổ)
  44: 'tho', 45: 'tho',
  // Canh Tuất - Tân Hợi: Kim (Thoa Xuyến Kim)
  46: 'kim', 47: 'kim',
  // Nhâm Tý - Quý Sửu: Mộc (Tang Đố Mộc)
  48: 'moc', 49: 'moc',
  // Giáp Dần - Ất Mão: Thủy (Đại Khê Thủy)
  50: 'thuy', 51: 'thuy',
  // Bính Thìn - Đinh Tỵ: Thổ (Sa Trung Thổ)
  52: 'tho', 53: 'tho',
  // Mậu Ngọ - Kỷ Mùi: Hỏa (Thiên Thượng Hỏa)
  54: 'hoa', 55: 'hoa',
  // Canh Thân - Tân Dậu: Mộc (Thạch Lựu Mộc)
  56: 'moc', 57: 'moc',
  // Nhâm Tuất - Quý Hợi: Thủy (Đại Hải Thủy)
  58: 'thuy', 59: 'thuy',
};

// Tên đầy đủ của mệnh (Nạp Âm)
export const NAP_AM_NAMES = {
  0: 'Hải Trung Kim', 1: 'Hải Trung Kim',
  2: 'Lư Trung Hỏa', 3: 'Lư Trung Hỏa',
  4: 'Đại Lâm Mộc', 5: 'Đại Lâm Mộc',
  6: 'Lộ Bàng Thổ', 7: 'Lộ Bàng Thổ',
  8: 'Kiếm Phong Kim', 9: 'Kiếm Phong Kim',
  10: 'Sơn Đầu Hỏa', 11: 'Sơn Đầu Hỏa',
  12: 'Giản Hạ Thủy', 13: 'Giản Hạ Thủy',
  14: 'Thành Đầu Thổ', 15: 'Thành Đầu Thổ',
  16: 'Bạch Lạp Kim', 17: 'Bạch Lạp Kim',
  18: 'Dương Liễu Mộc', 19: 'Dương Liễu Mộc',
  20: 'Tuyền Trung Thủy', 21: 'Tuyền Trung Thủy',
  22: 'Ốc Thượng Thổ', 23: 'Ốc Thượng Thổ',
  24: 'Tích Lịch Hỏa', 25: 'Tích Lịch Hỏa',
  26: 'Tùng Bách Mộc', 27: 'Tùng Bách Mộc',
  28: 'Trường Lưu Thủy', 29: 'Trường Lưu Thủy',
  30: 'Sa Trung Kim', 31: 'Sa Trung Kim',
  32: 'Sơn Hạ Hỏa', 33: 'Sơn Hạ Hỏa',
  34: 'Bình Địa Mộc', 35: 'Bình Địa Mộc',
  36: 'Bích Thượng Thổ', 37: 'Bích Thượng Thổ',
  38: 'Kim Bạc Kim', 39: 'Kim Bạc Kim',
  40: 'Phú Đăng Hỏa', 41: 'Phú Đăng Hỏa',
  42: 'Thiên Hà Thủy', 43: 'Thiên Hà Thủy',
  44: 'Đại Trạch Thổ', 45: 'Đại Trạch Thổ',
  46: 'Thoa Xuyến Kim', 47: 'Thoa Xuyến Kim',
  48: 'Tang Đố Mộc', 49: 'Tang Đố Mộc',
  50: 'Đại Khê Thủy', 51: 'Đại Khê Thủy',
  52: 'Sa Trung Thổ', 53: 'Sa Trung Thổ',
  54: 'Thiên Thượng Hỏa', 55: 'Thiên Thượng Hỏa',
  56: 'Thạch Lựu Mộc', 57: 'Thạch Lựu Mộc',
  58: 'Đại Hải Thủy', 59: 'Đại Hải Thủy',
};

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Tính mệnh ngũ hành từ năm sinh (Âm lịch)
 * @param {number} birthYear - Năm sinh (VD: 1990)
 * @returns {Object} { menh, napAm, napAmName }
 */
export function calculateMenh(birthYear) {
  // Tính vị trí trong chu kỳ 60 năm
  // Năm 1924 = Giáp Tý = vị trí 0
  const baseYear = 1924;
  let napAm = (birthYear - baseYear) % 60;
  if (napAm < 0) napAm += 60;

  const menh = NAP_AM_TABLE[napAm];
  const napAmName = NAP_AM_NAMES[napAm];

  return {
    menh,
    napAm,
    napAmName,
    menhData: NGU_HANH[menh],
  };
}

/**
 * Lấy thông tin mệnh từ ID
 * @param {string} menhId - kim, moc, thuy, hoa, tho
 * @returns {Object} Menh data
 */
export function getMenh(menhId) {
  return NGU_HANH[menhId?.toLowerCase()] || null;
}

/**
 * Kiểm tra 2 mệnh có tương sinh không
 * @param {string} menh1 - Mệnh thứ nhất
 * @param {string} menh2 - Mệnh thứ hai
 * @returns {Object} { isSinh, direction, description }
 */
export function checkTuongSinh(menh1, menh2) {
  const m1 = menh1?.toLowerCase();
  const m2 = menh2?.toLowerCase();

  if (CYCLES.tuong_sinh[m1] === m2) {
    return {
      isSinh: true,
      direction: `${NGU_HANH[m1].name} sinh ${NGU_HANH[m2].name}`,
      description: `${NGU_HANH[m1].name} hỗ trợ và tạo sinh khí cho ${NGU_HANH[m2].name}`,
      score: 1,
    };
  }

  if (CYCLES.tuong_sinh[m2] === m1) {
    return {
      isSinh: true,
      direction: `${NGU_HANH[m2].name} sinh ${NGU_HANH[m1].name}`,
      description: `${NGU_HANH[m2].name} hỗ trợ và tạo sinh khí cho ${NGU_HANH[m1].name}`,
      score: 1,
    };
  }

  return { isSinh: false, score: 0 };
}

/**
 * Kiểm tra 2 mệnh có tương khắc không
 * @param {string} menh1 - Mệnh thứ nhất
 * @param {string} menh2 - Mệnh thứ hai
 * @returns {Object} { isKhac, direction, description }
 */
export function checkTuongKhac(menh1, menh2) {
  const m1 = menh1?.toLowerCase();
  const m2 = menh2?.toLowerCase();

  if (CYCLES.tuong_khac[m1] === m2) {
    return {
      isKhac: true,
      direction: `${NGU_HANH[m1].name} khắc ${NGU_HANH[m2].name}`,
      description: `${NGU_HANH[m1].name} chế ngự và làm yếu ${NGU_HANH[m2].name}`,
      score: -1,
    };
  }

  if (CYCLES.tuong_khac[m2] === m1) {
    return {
      isKhac: true,
      direction: `${NGU_HANH[m2].name} khắc ${NGU_HANH[m1].name}`,
      description: `${NGU_HANH[m2].name} chế ngự và làm yếu ${NGU_HANH[m1].name}`,
      score: -1,
    };
  }

  return { isKhac: false, score: 0 };
}

/**
 * Tính điểm tương hợp giữa 2 mệnh
 * @param {string} menh1
 * @param {string} menh2
 * @returns {Object} { score, relationship, description }
 */
export function calculateCompatibility(menh1, menh2) {
  const m1 = menh1?.toLowerCase();
  const m2 = menh2?.toLowerCase();

  if (m1 === m2) {
    return {
      score: 0.8,
      relationship: 'Tỷ Hòa',
      description: 'Cùng mệnh - Hòa hợp, hiểu nhau',
    };
  }

  const sinh = checkTuongSinh(m1, m2);
  if (sinh.isSinh) {
    return {
      score: 1,
      relationship: 'Tương Sinh',
      description: sinh.description,
    };
  }

  const khac = checkTuongKhac(m1, m2);
  if (khac.isKhac) {
    return {
      score: -0.5,
      relationship: 'Tương Khắc',
      description: khac.description,
    };
  }

  return {
    score: 0.5,
    relationship: 'Trung Hòa',
    description: 'Không sinh không khắc - Quan hệ bình thường',
  };
}

/**
 * Lấy đá phù hợp cho mệnh
 * @param {string} menhId
 * @returns {Object} { main, support, avoid }
 */
export function getCrystalsForMenh(menhId) {
  const menh = NGU_HANH[menhId?.toLowerCase()];
  if (!menh) return null;
  return menh.crystals;
}

/**
 * Kiểm tra đá có phù hợp với mệnh không
 * @param {string} crystalId
 * @param {string} menhId
 * @returns {Object} { isCompatible, level, reason }
 */
export function checkCrystalCompatibility(crystalId, menhId) {
  const menh = NGU_HANH[menhId?.toLowerCase()];
  if (!menh) return { isCompatible: false, level: 'unknown', reason: 'Không tìm thấy mệnh' };

  const { main, support, avoid } = menh.crystals;

  if (main.includes(crystalId)) {
    return {
      isCompatible: true,
      level: 'excellent',
      reason: `${crystalId} là đá chủ đạo cho mệnh ${menh.name}`,
    };
  }

  if (support.includes(crystalId)) {
    return {
      isCompatible: true,
      level: 'good',
      reason: `${crystalId} hỗ trợ tốt cho mệnh ${menh.name}`,
    };
  }

  if (avoid.includes(crystalId)) {
    return {
      isCompatible: false,
      level: 'avoid',
      reason: `${crystalId} không nên dùng cho mệnh ${menh.name} vì khắc chế`,
    };
  }

  return {
    isCompatible: true,
    level: 'neutral',
    reason: `${crystalId} có thể dùng cho mệnh ${menh.name}`,
  };
}

/**
 * Lấy AI template cho mệnh
 * @param {string} menhId
 * @param {string} templateType - greeting, crystal_intro, advice, selling
 * @returns {string} Template text
 */
export function getMenhTemplate(menhId, templateType) {
  const menh = NGU_HANH[menhId?.toLowerCase()];
  if (!menh) return '';
  return menh.templates[templateType] || '';
}

/**
 * Lấy tất cả mệnh dưới dạng array
 * @returns {Array} Array of menh objects
 */
export function getAllMenh() {
  return Object.values(NGU_HANH);
}

/**
 * Tìm mệnh dựa trên màu sắc
 * @param {string} color - Màu sắc (VD: 'xanh', 'đỏ')
 * @returns {Array} Danh sách mệnh phù hợp
 */
export function findMenhByColor(color) {
  const lowerColor = color?.toLowerCase();
  return Object.values(NGU_HANH).filter(menh =>
    menh.colors.some(c => c.toLowerCase().includes(lowerColor))
  );
}

// ===========================================
// SELLING POINTS FOR LIVESTREAM
// ===========================================

export const MENH_SELLING_POINTS = {
  kim: {
    hook: 'Mệnh KIM - Quyết đoán & Thành công!',
    crystals_pitch: 'Đá trắng/bạc tăng sức mạnh, giúp ra quyết định sáng suốt!',
    urgency: 'Người mệnh Kim nên có Thạch Anh Trắng để tăng vận khí!',
  },
  moc: {
    hook: 'Mệnh MỘC - Sáng tạo & Phát triển!',
    crystals_pitch: 'Đá xanh lá hỗ trợ sức khỏe, sự nghiệp phát triển!',
    urgency: 'Ngọc Bích là must-have cho mệnh Mộc để thu hút tài lộc!',
  },
  thuy: {
    hook: 'Mệnh THỦY - Thông minh & Linh hoạt!',
    crystals_pitch: 'Đá đen/xanh dương tăng trí tuệ, bảo vệ năng lượng!',
    urgency: 'Obsidian Đen là "shield" bảo vệ cho mệnh Thủy!',
  },
  hoa: {
    hook: 'Mệnh HỎA - Nhiệt tình & Quyến rũ!',
    crystals_pitch: 'Đá đỏ/cam tăng may mắn, sức hút cá nhân!',
    urgency: 'Carnelian giúp mệnh Hỏa tỏa sáng và thành công!',
  },
  tho: {
    hook: 'Mệnh THỔ - Ổn định & Đáng tin!',
    crystals_pitch: 'Đá vàng/nâu thu hút tài lộc, sự ổn định!',
    urgency: 'Citrine là đá tài lộc số 1 cho mệnh Thổ!',
  },
};

export default {
  NGU_HANH,
  CYCLES,
  NAP_AM_NAMES,
  MENH_SELLING_POINTS,
  calculateMenh,
  getMenh,
  checkTuongSinh,
  checkTuongKhac,
  calculateCompatibility,
  getCrystalsForMenh,
  checkCrystalCompatibility,
  getMenhTemplate,
  getAllMenh,
  findMenhByColor,
};
