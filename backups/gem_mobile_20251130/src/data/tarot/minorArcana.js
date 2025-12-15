/**
 * TAROT MINOR ARCANA - 56 LÁ BÀI
 * 4 bộ: Wands (Lửa), Cups (Nước), Swords (Gió), Pentacles (Đất)
 * Mỗi bộ có 14 lá: Ace đến 10 + Page, Knight, Queen, King
 */

// ===== WANDS - BỘ GẬY (Fire/Lửa) =====
export const WANDS = [
  // Ace of Wands
  {
    id: 'wands-01',
    name: 'Ace of Wands',
    vietnameseName: 'Át Gậy',
    suit: 'Wands',
    suitVietnamese: 'Gậy',
    element: 'Fire',
    number: 1,
    keywords: ['cảm hứng', 'tiềm năng', 'khởi đầu sáng tạo', 'đam mê mới'],
    upright: {
      overview: 'Khởi đầu mới đầy cảm hứng và đam mê. Năng lượng sáng tạo đang bùng cháy.',
      career: { reading: 'Cơ hội mới, dự án sáng tạo, khởi nghiệp', actionSteps: ['Nắm bắt ý tưởng mới', 'Bắt đầu dự án đam mê'] },
      finance: { reading: 'Cơ hội tài chính mới, đầu tư sáng tạo', actionSteps: ['Khám phá nguồn thu nhập mới', 'Đầu tư vào đam mê'] },
      love: { reading: 'Đam mê mới, sự hấp dẫn mạnh mẽ', actionSteps: ['Mở lòng với tình yêu mới', 'Thể hiện đam mê'] }
    },
    reversed: { overview: 'Thiếu cảm hứng, trì hoãn, năng lượng bị chặn', warning: 'Đừng bỏ lỡ cơ hội vì chần chừ' },
    crystals: [{ name: 'Carnelian', vietnameseName: 'Carnelian', reason: 'Kích thích sáng tạo và đam mê', shopHandle: 'carnelian' }],
    affirmations: ['Tôi tràn đầy cảm hứng sáng tạo', 'Khởi đầu mới mang lại cơ hội tuyệt vời']
  },

  // Two of Wands
  {
    id: 'wands-02',
    name: 'Two of Wands',
    vietnameseName: 'Hai Gậy',
    suit: 'Wands',
    suitVietnamese: 'Gậy',
    element: 'Fire',
    number: 2,
    keywords: ['lập kế hoạch', 'quyết định', 'tầm nhìn', 'tiến bộ'],
    upright: {
      overview: 'Lập kế hoạch cho tương lai, đưa ra quyết định quan trọng về hướng đi.',
      career: { reading: 'Lên kế hoạch dài hạn, mở rộng tầm nhìn', actionSteps: ['Đánh giá các lựa chọn', 'Lập kế hoạch chi tiết'] },
      finance: { reading: 'Lập chiến lược đầu tư, planning tài chính', actionSteps: ['Xác định mục tiêu tài chính', 'Nghiên cứu các options'] },
      love: { reading: 'Quyết định về tương lai mối quan hệ', actionSteps: ['Thảo luận về tương lai', 'Lập kế hoạch cùng nhau'] }
    },
    reversed: { overview: 'Thiếu kế hoạch, sợ quyết định, bỏ lỡ cơ hội', warning: 'Đừng để sợ hãi cản trở bạn tiến lên' },
    crystals: [{ name: 'Tiger Eye', vietnameseName: 'Mắt Hổ', reason: 'Tăng tầm nhìn và quyết đoán', shopHandle: 'tiger-eye' }],
    affirmations: ['Tôi có tầm nhìn rõ ràng cho tương lai', 'Tôi tự tin đưa ra quyết định']
  },

  // Three of Wands
  {
    id: 'wands-03',
    name: 'Three of Wands',
    vietnameseName: 'Ba Gậy',
    suit: 'Wands',
    suitVietnamese: 'Gậy',
    element: 'Fire',
    number: 3,
    keywords: ['mở rộng', 'tiến bộ', 'nhìn xa', 'cơ hội'],
    upright: {
      overview: 'Kế hoạch đang thành hình, mở rộng tầm nhìn, tiến bộ rõ rệt.',
      career: { reading: 'Mở rộng kinh doanh, cơ hội quốc tế', actionSteps: ['Mở rộng network', 'Tìm kiếm cơ hội mới'] },
      finance: { reading: 'Đầu tư dài hạn đang sinh lợi', actionSteps: ['Đa dạng hóa đầu tư', 'Mở rộng portfolio'] },
      love: { reading: 'Mối quan hệ phát triển, tương lai tươi sáng', actionSteps: ['Xây dựng tương lai cùng nhau', 'Du lịch cùng partner'] }
    },
    reversed: { overview: 'Trì hoãn, thiếu tầm nhìn, cơ hội bị chặn', warning: 'Kiên nhẫn và đợi thời cơ' },
    crystals: [{ name: 'Citrine', vietnameseName: 'Thạch Anh Vàng', reason: 'Thu hút cơ hội và thành công', shopHandle: 'citrine' }],
    affirmations: ['Cơ hội đang đến với tôi', 'Tôi mở rộng tầm nhìn mỗi ngày']
  },

  // Four of Wands
  {
    id: 'wands-04',
    name: 'Four of Wands',
    vietnameseName: 'Bốn Gậy',
    suit: 'Wands',
    suitVietnamese: 'Gậy',
    element: 'Fire',
    number: 4,
    keywords: ['ăn mừng', 'hòa thuận', 'cột mốc', 'mái ấm'],
    upright: {
      overview: 'Thời điểm ăn mừng thành công, hạnh phúc gia đình, cột mốc quan trọng.',
      career: { reading: 'Hoàn thành dự án, team harmony', actionSteps: ['Ăn mừng thành tích', 'Xây dựng môi trường làm việc tốt'] },
      finance: { reading: 'Ổn định tài chính, đầu tư bất động sản', actionSteps: ['Mua nhà hoặc cải tạo', 'Tận hưởng thành quả'] },
      love: { reading: 'Đính hôn, kết hôn, hạnh phúc gia đình', actionSteps: ['Ăn mừng tình yêu', 'Xây dựng tổ ấm'] }
    },
    reversed: { overview: 'Xung đột gia đình, thiếu ổn định, hoãn kế hoạch', warning: 'Giải quyết mâu thuẫn sớm' },
    crystals: [{ name: 'Rose Quartz', vietnameseName: 'Thạch Anh Hồng', reason: 'Hòa thuận và tình yêu gia đình', shopHandle: 'rose-quartz' }],
    affirmations: ['Tôi ăn mừng mỗi thành công', 'Gia đình là nền tảng của tôi']
  },

  // Five of Wands
  {
    id: 'wands-05',
    name: 'Five of Wands',
    vietnameseName: 'Năm Gậy',
    suit: 'Wands',
    suitVietnamese: 'Gậy',
    element: 'Fire',
    number: 5,
    keywords: ['cạnh tranh', 'xung đột', 'thử thách', 'tranh luận'],
    upright: {
      overview: 'Cạnh tranh lành mạnh, thử thách giúp trưởng thành, tranh luận mang tính xây dựng.',
      career: { reading: 'Cạnh tranh trong công việc, đấu thầu', actionSteps: ['Nổi bật trong đám đông', 'Chấp nhận thử thách'] },
      finance: { reading: 'Cạnh tranh thị trường, so sánh giá', actionSteps: ['Nghiên cứu đối thủ', 'Tìm lợi thế cạnh tranh'] },
      love: { reading: 'Tranh cãi nhỏ, cạnh tranh để giành sự chú ý', actionSteps: ['Giải quyết khác biệt', 'Tôn trọng ý kiến đối phương'] }
    },
    reversed: { overview: 'Tránh xung đột, bỏ cuộc, hoặc xung đột leo thang', warning: 'Đối mặt với thử thách thay vì trốn tránh' },
    crystals: [{ name: 'Red Jasper', vietnameseName: 'Jasper Đỏ', reason: 'Sức mạnh và can đảm trong cạnh tranh', shopHandle: 'red-jasper' }],
    affirmations: ['Thử thách giúp tôi mạnh mẽ hơn', 'Tôi cạnh tranh với tinh thần fair play']
  },

  // Six of Wands
  {
    id: 'wands-06',
    name: 'Six of Wands',
    vietnameseName: 'Sáu Gậy',
    suit: 'Wands',
    suitVietnamese: 'Gậy',
    element: 'Fire',
    number: 6,
    keywords: ['chiến thắng', 'công nhận', 'thành công', 'tự hào'],
    upright: {
      overview: 'Chiến thắng và được công nhận. Thành công công khai, danh tiếng.',
      career: { reading: 'Thăng tiến, được công nhận, leadership', actionSteps: ['Đón nhận thành công', 'Lãnh đạo bằng tấm gương'] },
      finance: { reading: 'Thành công tài chính được công nhận', actionSteps: ['Tận hưởng thành quả', 'Chia sẻ thành công'] },
      love: { reading: 'Mối quan hệ được mọi người ngưỡng mộ', actionSteps: ['Tự hào về tình yêu', 'Ăn mừng cùng nhau'] }
    },
    reversed: { overview: 'Thất bại, thiếu công nhận, ego', warning: 'Khiêm tốn trong thành công' },
    crystals: [{ name: 'Sunstone', vietnameseName: 'Đá Mặt Trời', reason: 'Chiến thắng và sự tự tin', shopHandle: 'sunstone' }],
    affirmations: ['Tôi xứng đáng được công nhận', 'Thành công của tôi truyền cảm hứng cho người khác']
  },

  // Seven of Wands
  {
    id: 'wands-07',
    name: 'Seven of Wands',
    vietnameseName: 'Bảy Gậy',
    suit: 'Wands',
    suitVietnamese: 'Gậy',
    element: 'Fire',
    number: 7,
    keywords: ['bảo vệ', 'kiên định', 'thách thức', 'vị thế'],
    upright: {
      overview: 'Bảo vệ vị thế của mình, đứng vững trước thách thức.',
      career: { reading: 'Bảo vệ dự án, cạnh tranh từ đối thủ', actionSteps: ['Đứng vững lập trường', 'Không từ bỏ vị trí'] },
      finance: { reading: 'Bảo vệ tài sản, cạnh tranh thị trường', actionSteps: ['Giữ vững chiến lược', 'Không bị lung lay'] },
      love: { reading: 'Bảo vệ mối quan hệ khỏi can thiệp bên ngoài', actionSteps: ['Đứng về phía partner', 'Bảo vệ tình yêu'] }
    },
    reversed: { overview: 'Bỏ cuộc, overwhelmed, mất vị thế', warning: 'Đừng để áp lực khiến bạn từ bỏ' },
    crystals: [{ name: 'Black Tourmaline', vietnameseName: 'Tourmaline Đen', reason: 'Bảo vệ và sức mạnh', shopHandle: 'black-tourmaline' }],
    affirmations: ['Tôi đứng vững trước mọi thách thức', 'Tôi bảo vệ những gì quan trọng với mình']
  },

  // Eight of Wands
  {
    id: 'wands-08',
    name: 'Eight of Wands',
    vietnameseName: 'Tám Gậy',
    suit: 'Wands',
    suitVietnamese: 'Gậy',
    element: 'Fire',
    number: 8,
    keywords: ['tốc độ', 'tiến triển nhanh', 'thông điệp', 'hành động'],
    upright: {
      overview: 'Mọi thứ tiến triển nhanh chóng, tin tức đến, hành động quyết liệt.',
      career: { reading: 'Dự án tiến triển nhanh, tin tốt', actionSteps: ['Hành động ngay', 'Đón nhận thay đổi nhanh'] },
      finance: { reading: 'Giao dịch nhanh, cơ hội thoáng qua', actionSteps: ['Quyết định nhanh', 'Nắm bắt timing'] },
      love: { reading: 'Tình yêu phát triển nhanh, liên lạc thường xuyên', actionSteps: ['Giao tiếp tích cực', 'Du lịch cùng nhau'] }
    },
    reversed: { overview: 'Trì hoãn, tin xấu, mất động lực', warning: 'Kiên nhẫn khi mọi thứ chậm lại' },
    crystals: [{ name: 'Clear Quartz', vietnameseName: 'Thạch Anh Trắng', reason: 'Khuếch đại năng lượng và tốc độ', shopHandle: 'clear-quartz' }],
    affirmations: ['Tôi di chuyển nhanh về phía mục tiêu', 'Timing hoàn hảo đang đến với tôi']
  },

  // Nine of Wands
  {
    id: 'wands-09',
    name: 'Nine of Wands',
    vietnameseName: 'Chín Gậy',
    suit: 'Wands',
    suitVietnamese: 'Gậy',
    element: 'Fire',
    number: 9,
    keywords: ['kiên trì', 'sức bền', 'cảnh giác', 'gần đến đích'],
    upright: {
      overview: 'Gần đến đích nhưng mệt mỏi. Cần kiên trì thêm một chút.',
      career: { reading: 'Gần hoàn thành dự án, cần thêm nỗ lực', actionSteps: ['Kiên trì đến cùng', 'Đừng bỏ cuộc lúc này'] },
      finance: { reading: 'Gần đạt mục tiêu tài chính', actionSteps: ['Tiếp tục kế hoạch', 'Đừng bỏ cuộc sớm'] },
      love: { reading: 'Vượt qua thử thách, mối quan hệ bền vững', actionSteps: ['Kiên nhẫn với đối phương', 'Tin vào mối quan hệ'] }
    },
    reversed: { overview: 'Kiệt sức, từ bỏ, paranoid', warning: 'Nghỉ ngơi trước khi tiếp tục' },
    crystals: [{ name: 'Hematite', vietnameseName: 'Hematite', reason: 'Sức bền và grounding', shopHandle: 'hematite' }],
    affirmations: ['Tôi có sức mạnh để đi đến cùng', 'Mỗi thử thách làm tôi mạnh mẽ hơn']
  },

  // Ten of Wands
  {
    id: 'wands-10',
    name: 'Ten of Wands',
    vietnameseName: 'Mười Gậy',
    suit: 'Wands',
    suitVietnamese: 'Gậy',
    element: 'Fire',
    number: 10,
    keywords: ['gánh nặng', 'trách nhiệm', 'quá tải', 'hoàn thành'],
    upright: {
      overview: 'Gánh nặng trách nhiệm, làm việc quá sức, nhưng gần đến đích.',
      career: { reading: 'Quá tải công việc, cần delegate', actionSteps: ['Phân chia công việc', 'Đặt giới hạn'] },
      finance: { reading: 'Gánh nặng tài chính, nhiều khoản chi', actionSteps: ['Đánh giá lại chi tiêu', 'Giảm tải nghĩa vụ'] },
      love: { reading: 'Gánh nặng trong mối quan hệ', actionSteps: ['Chia sẻ trách nhiệm', 'Nói ra khó khăn'] }
    },
    reversed: { overview: 'Buông bỏ gánh nặng, delegation, burn-out', warning: 'Học cách nói không' },
    crystals: [{ name: 'Lepidolite', vietnameseName: 'Lepidolite', reason: 'Giảm stress và buông bỏ', shopHandle: 'lepidolite' }],
    affirmations: ['Tôi buông bỏ những gì không cần thiết', 'Tôi chia sẻ gánh nặng với người khác']
  },

  // Page of Wands
  {
    id: 'wands-page',
    name: 'Page of Wands',
    vietnameseName: 'Thị Vệ Gậy',
    suit: 'Wands',
    suitVietnamese: 'Gậy',
    element: 'Fire',
    number: 11,
    keywords: ['khám phá', 'nhiệt huyết', 'tin vui', 'phiêu lưu'],
    upright: {
      overview: 'Tinh thần phiêu lưu, tin vui đến, khởi đầu đầy nhiệt huyết.',
      career: { reading: 'Cơ hội mới, intern, dự án thử nghiệm', actionSteps: ['Đón nhận cơ hội học hỏi', 'Thể hiện nhiệt huyết'] },
      finance: { reading: 'Ý tưởng kiếm tiền mới', actionSteps: ['Thử nghiệm ý tưởng', 'Học hỏi về đầu tư'] },
      love: { reading: 'Tình yêu mới bắt đầu, flirting vui vẻ', actionSteps: ['Chủ động tiếp cận', 'Tận hưởng sự hồi hộp'] }
    },
    reversed: { overview: 'Thiếu hướng đi, tin xấu, nóng vội', warning: 'Suy nghĩ trước khi hành động' },
    crystals: [{ name: 'Orange Calcite', vietnameseName: 'Calcite Cam', reason: 'Năng lượng trẻ trung và sáng tạo', shopHandle: 'orange-calcite' }],
    affirmations: ['Tôi đón nhận mọi cơ hội học hỏi', 'Nhiệt huyết của tôi truyền cảm hứng cho người khác']
  },

  // Knight of Wands
  {
    id: 'wands-knight',
    name: 'Knight of Wands',
    vietnameseName: 'Kỵ Sĩ Gậy',
    suit: 'Wands',
    suitVietnamese: 'Gậy',
    element: 'Fire',
    number: 12,
    keywords: ['hành động', 'phiêu lưu', 'đam mê', 'liều lĩnh'],
    upright: {
      overview: 'Hành động quyết liệt, tinh thần phiêu lưu, đam mê cháy bỏng.',
      career: { reading: 'Thay đổi nhanh, dự án mạo hiểm', actionSteps: ['Hành động táo bạo', 'Nắm bắt cơ hội'] },
      finance: { reading: 'Đầu tư mạo hiểm, cơ hội nhanh chóng', actionSteps: ['Cân nhắc rủi ro', 'Hành động có tính toán'] },
      love: { reading: 'Đam mê cháy bỏng, tình yêu phiêu lưu', actionSteps: ['Thể hiện đam mê', 'Sống trọn vẹn'] }
    },
    reversed: { overview: 'Nóng vội, bốc đồng, thiếu kiên nhẫn', warning: 'Suy nghĩ trước khi hành động' },
    crystals: [{ name: 'Carnelian', vietnameseName: 'Carnelian', reason: 'Năng lượng và hành động', shopHandle: 'carnelian' }],
    affirmations: ['Tôi hành động với đam mê và trí tuệ', 'Cuộc phiêu lưu chờ đợi tôi']
  },

  // Queen of Wands
  {
    id: 'wands-queen',
    name: 'Queen of Wands',
    vietnameseName: 'Nữ Hoàng Gậy',
    suit: 'Wands',
    suitVietnamese: 'Gậy',
    element: 'Fire',
    number: 13,
    keywords: ['tự tin', 'quyến rũ', 'độc lập', 'sáng tạo'],
    upright: {
      overview: 'Tự tin, quyến rũ, độc lập và sáng tạo. Lãnh đạo với lòng nhiệt huyết.',
      career: { reading: 'Lãnh đạo tự tin, dự án sáng tạo', actionSteps: ['Lãnh đạo với đam mê', 'Thể hiện cá tính'] },
      finance: { reading: 'Độc lập tài chính, kinh doanh sáng tạo', actionSteps: ['Tự tin với quyết định tài chính', 'Đầu tư vào bản thân'] },
      love: { reading: 'Hấp dẫn và quyến rũ, mối quan hệ đam mê', actionSteps: ['Thể hiện sự tự tin', 'Yêu với đam mê'] }
    },
    reversed: { overview: 'Thiếu tự tin, ghen tuông, kiêu ngạo', warning: 'Cân bằng giữa tự tin và khiêm tốn' },
    crystals: [{ name: 'Sunstone', vietnameseName: 'Đá Mặt Trời', reason: 'Tự tin và lãnh đạo', shopHandle: 'sunstone' }],
    affirmations: ['Tôi tự tin với con người của mình', 'Sức hấp dẫn của tôi tỏa sáng tự nhiên']
  },

  // King of Wands
  {
    id: 'wands-king',
    name: 'King of Wands',
    vietnameseName: 'Vua Gậy',
    suit: 'Wands',
    suitVietnamese: 'Gậy',
    element: 'Fire',
    number: 14,
    keywords: ['lãnh đạo', 'tầm nhìn', 'doanh nhân', 'charisma'],
    upright: {
      overview: 'Lãnh đạo tài năng, tầm nhìn xa, doanh nhân thành công.',
      career: { reading: 'CEO, lãnh đạo cấp cao, khởi nghiệp thành công', actionSteps: ['Lãnh đạo với tầm nhìn', 'Truyền cảm hứng cho team'] },
      finance: { reading: 'Thành công tài chính lớn, empire builder', actionSteps: ['Xây dựng đế chế', 'Đầu tư chiến lược'] },
      love: { reading: 'Đối tác mạnh mẽ, mối quan hệ nồng nhiệt', actionSteps: ['Lãnh đạo mối quan hệ với tình yêu', 'Hỗ trợ đam mê của partner'] }
    },
    reversed: { overview: 'Độc đoán, bốc đồng, thiếu kiểm soát', warning: 'Lắng nghe người khác' },
    crystals: [{ name: 'Ruby', vietnameseName: 'Hồng Ngọc', reason: 'Sức mạnh lãnh đạo và đam mê', shopHandle: 'ruby' }],
    affirmations: ['Tôi lãnh đạo với tầm nhìn và lòng nhiệt huyết', 'Tôi truyền cảm hứng cho người khác thành công']
  }
];

// ===== CUPS - BỘ CỐC (Water/Nước) =====
export const CUPS = [
  // Ace of Cups
  {
    id: 'cups-01',
    name: 'Ace of Cups',
    vietnameseName: 'Át Cốc',
    suit: 'Cups',
    suitVietnamese: 'Cốc',
    element: 'Water',
    number: 1,
    keywords: ['tình yêu mới', 'cảm xúc', 'trực giác', 'sáng tạo'],
    upright: {
      overview: 'Tình yêu mới, cảm xúc tràn đầy, khởi đầu về mặt tinh thần.',
      career: { reading: 'Công việc mang lại thỏa mãn cảm xúc', actionSteps: ['Theo đuổi công việc yêu thích', 'Kết nối với đồng nghiệp'] },
      finance: { reading: 'Đầu tư từ trái tim', actionSteps: ['Đầu tư vào những gì bạn yêu', 'Để cảm xúc hướng dẫn'] },
      love: { reading: 'Tình yêu mới, cảm xúc sâu sắc', actionSteps: ['Mở lòng đón nhận tình yêu', 'Thể hiện cảm xúc'] }
    },
    reversed: { overview: 'Chặn cảm xúc, từ chối tình yêu', warning: 'Mở lòng để nhận tình yêu' },
    crystals: [{ name: 'Rose Quartz', vietnameseName: 'Thạch Anh Hồng', reason: 'Mở chakra tim và tình yêu', shopHandle: 'rose-quartz' }],
    affirmations: ['Tôi mở lòng đón nhận tình yêu', 'Cảm xúc của tôi là nguồn sức mạnh']
  },

  // Two of Cups
  {
    id: 'cups-02',
    name: 'Two of Cups',
    vietnameseName: 'Hai Cốc',
    suit: 'Cups',
    suitVietnamese: 'Cốc',
    element: 'Water',
    number: 2,
    keywords: ['kết nối', 'đối tác', 'tình yêu đôi lứa', 'hài hòa'],
    upright: {
      overview: 'Kết nối sâu sắc giữa hai người, partnership, tình yêu đôi lứa.',
      career: { reading: 'Partnership kinh doanh, hợp tác tốt', actionSteps: ['Xây dựng mối quan hệ đối tác', 'Hợp tác win-win'] },
      finance: { reading: 'Hợp tác tài chính, chia sẻ nguồn lực', actionSteps: ['Partner đầu tư', 'Kết hợp sức mạnh'] },
      love: { reading: 'Tình yêu đích thực, soulmate, đính hôn', actionSteps: ['Cam kết với đối phương', 'Nuôi dưỡng kết nối'] }
    },
    reversed: { overview: 'Mất cân bằng trong mối quan hệ, chia tay', warning: 'Làm việc để cân bằng mối quan hệ' },
    crystals: [{ name: 'Rhodonite', vietnameseName: 'Rhodonite', reason: 'Tình yêu và cân bằng cảm xúc', shopHandle: 'rhodonite' }],
    affirmations: ['Tôi thu hút những mối quan hệ cân bằng', 'Tình yêu của tôi được đáp lại']
  },

  // Three of Cups
  {
    id: 'cups-03',
    name: 'Three of Cups',
    vietnameseName: 'Ba Cốc',
    suit: 'Cups',
    suitVietnamese: 'Cốc',
    element: 'Water',
    number: 3,
    keywords: ['ăn mừng', 'tình bạn', 'cộng đồng', 'niềm vui'],
    upright: {
      overview: 'Ăn mừng với bạn bè, tình bạn sâu sắc, niềm vui cộng đồng.',
      career: { reading: 'Team building, ăn mừng thành công nhóm', actionSteps: ['Ăn mừng với team', 'Xây dựng cộng đồng'] },
      finance: { reading: 'Thành công được chia sẻ, đầu tư nhóm', actionSteps: ['Chia sẻ thành công', 'Đầu tư cùng bạn bè'] },
      love: { reading: 'Thời gian vui vẻ với bạn bè và người yêu', actionSteps: ['Gặp gỡ bạn bè', 'Ăn mừng tình yêu'] }
    },
    reversed: { overview: 'Cô lập, drama nhóm bạn, quá đà', warning: 'Cân bằng giữa vui chơi và trách nhiệm' },
    crystals: [{ name: 'Citrine', vietnameseName: 'Thạch Anh Vàng', reason: 'Niềm vui và năng lượng tích cực', shopHandle: 'citrine' }],
    affirmations: ['Tôi ăn mừng cuộc sống với người thân yêu', 'Tình bạn làm giàu cuộc sống của tôi']
  },

  // Four of Cups
  {
    id: 'cups-04',
    name: 'Four of Cups',
    vietnameseName: 'Bốn Cốc',
    suit: 'Cups',
    suitVietnamese: 'Cốc',
    element: 'Water',
    number: 4,
    keywords: ['thiền định', 'buồn chán', 'bỏ lỡ cơ hội', 'nội tâm'],
    upright: {
      overview: 'Thời gian nội tâm, có thể buồn chán hoặc bỏ lỡ cơ hội trước mắt.',
      career: { reading: 'Không hài lòng, bỏ lỡ cơ hội', actionSteps: ['Nhìn xung quanh', 'Đánh giá các options'] },
      finance: { reading: 'Bỏ lỡ cơ hội đầu tư', actionSteps: ['Mở mắt với cơ hội', 'Đừng đóng cửa'] },
      love: { reading: 'Buồn chán trong mối quan hệ, apathy', actionSteps: ['Làm mới mối quan hệ', 'Thoát khỏi vùng comfort'] }
    },
    reversed: { overview: 'Nhận ra cơ hội, thoát khỏi buồn chán', warning: 'Đón nhận những gì cuộc sống mang đến' },
    crystals: [{ name: 'Amazonite', vietnameseName: 'Amazonite', reason: 'Mở rộng tầm nhìn', shopHandle: 'amazonite' }],
    affirmations: ['Tôi nhìn thấy cơ hội xung quanh mình', 'Tôi biết ơn những gì tôi có']
  },

  // Five of Cups
  {
    id: 'cups-05',
    name: 'Five of Cups',
    vietnameseName: 'Năm Cốc',
    suit: 'Cups',
    suitVietnamese: 'Cốc',
    element: 'Water',
    number: 5,
    keywords: ['mất mát', 'đau buồn', 'tiếc nuối', 'chữa lành'],
    upright: {
      overview: 'Đau buồn và mất mát, nhưng vẫn còn hy vọng phía sau.',
      career: { reading: 'Mất việc, thất bại dự án, thất vọng', actionSteps: ['Cho phép mình đau buồn', 'Nhìn vào những gì còn lại'] },
      finance: { reading: 'Mất tiền, đầu tư thất bại', actionSteps: ['Học từ sai lầm', 'Không bỏ cuộc'] },
      love: { reading: 'Chia tay, mất mát tình cảm', actionSteps: ['Chữa lành trái tim', 'Không đóng cửa với tình yêu'] }
    },
    reversed: { overview: 'Bắt đầu chữa lành, chấp nhận mất mát', warning: 'Thời gian sẽ chữa lành' },
    crystals: [{ name: 'Apache Tears', vietnameseName: 'Nước Mắt Apache', reason: 'Chữa lành đau buồn', shopHandle: 'apache-tears' }],
    affirmations: ['Tôi cho phép mình đau buồn và chữa lành', 'Mất mát mở đường cho điều mới']
  },

  // Six of Cups
  {
    id: 'cups-06',
    name: 'Six of Cups',
    vietnameseName: 'Sáu Cốc',
    suit: 'Cups',
    suitVietnamese: 'Cốc',
    element: 'Water',
    number: 6,
    keywords: ['hoài niệm', 'tuổi thơ', 'ngây thơ', 'quà tặng'],
    upright: {
      overview: 'Hoài niệm, kỷ niệm tuổi thơ, sự ngây thơ, quà tặng từ quá khứ.',
      career: { reading: 'Quay về công việc cũ, reunion đồng nghiệp', actionSteps: ['Kết nối lại với quá khứ', 'Áp dụng bài học cũ'] },
      finance: { reading: 'Thừa kế, quà tặng bất ngờ', actionSteps: ['Đón nhận với lòng biết ơn', 'Cho đi để nhận lại'] },
      love: { reading: 'Tình yêu thuở nhỏ quay lại, romance ngây thơ', actionSteps: ['Kết nối với inner child', 'Yêu với trái tim thuần khiết'] }
    },
    reversed: { overview: 'Bám víu quá khứ, không tiến lên', warning: 'Sống ở hiện tại' },
    crystals: [{ name: 'Pink Opal', vietnameseName: 'Opal Hồng', reason: 'Chữa lành inner child', shopHandle: 'pink-opal' }],
    affirmations: ['Tôi trân trọng kỷ niệm đẹp', 'Inner child của tôi được yêu thương']
  },

  // Seven of Cups
  {
    id: 'cups-07',
    name: 'Seven of Cups',
    vietnameseName: 'Bảy Cốc',
    suit: 'Cups',
    suitVietnamese: 'Cốc',
    element: 'Water',
    number: 7,
    keywords: ['ảo tưởng', 'lựa chọn', 'mơ mộng', 'tưởng tượng'],
    upright: {
      overview: 'Nhiều lựa chọn, có thể là ảo tưởng. Cần phân biệt thực tế và mơ mộng.',
      career: { reading: 'Nhiều options, khó quyết định', actionSteps: ['Đánh giá thực tế từng option', 'Đừng chạy theo ảo tưởng'] },
      finance: { reading: 'Nhiều cơ hội, một số có thể là scam', actionSteps: ['Nghiên cứu kỹ', 'Đừng để lòng tham dẫn dắt'] },
      love: { reading: 'Mơ mộng về tình yêu, không thực tế', actionSteps: ['Đánh giá thực tế mối quan hệ', 'Đừng idealize đối phương'] }
    },
    reversed: { overview: 'Tập trung, quyết định rõ ràng', warning: 'Chọn một và commit' },
    crystals: [{ name: 'Fluorite', vietnameseName: 'Fluorite', reason: 'Sáng suốt và tập trung', shopHandle: 'fluorite' }],
    affirmations: ['Tôi nhìn rõ sự thật qua ảo tưởng', 'Tôi đưa ra quyết định sáng suốt']
  },

  // Eight of Cups
  {
    id: 'cups-08',
    name: 'Eight of Cups',
    vietnameseName: 'Tám Cốc',
    suit: 'Cups',
    suitVietnamese: 'Cốc',
    element: 'Water',
    number: 8,
    keywords: ['rời bỏ', 'tìm kiếm', 'thất vọng', 'hành trình'],
    upright: {
      overview: 'Rời bỏ để tìm kiếm điều ý nghĩa hơn. Bước đi can đảm dù đau đớn.',
      career: { reading: 'Từ bỏ công việc không còn ý nghĩa', actionSteps: ['Dũng cảm rời bỏ', 'Tìm kiếm mục đích'] },
      finance: { reading: 'Từ bỏ đầu tư không sinh lợi', actionSteps: ['Cut loss', 'Tìm kiếm cơ hội mới'] },
      love: { reading: 'Rời bỏ mối quan hệ không còn phù hợp', actionSteps: ['Dũng cảm bước đi', 'Tìm kiếm tình yêu đích thực'] }
    },
    reversed: { overview: 'Sợ rời bỏ, bám víu, chần chừ', warning: 'Đôi khi cần bước đi' },
    crystals: [{ name: 'Labradorite', vietnameseName: 'Labradorite', reason: 'Hỗ trợ thay đổi và tìm kiếm', shopHandle: 'labradorite' }],
    affirmations: ['Tôi dũng cảm tìm kiếm điều ý nghĩa', 'Rời bỏ mở đường cho điều mới']
  },

  // Nine of Cups
  {
    id: 'cups-09',
    name: 'Nine of Cups',
    vietnameseName: 'Chín Cốc',
    suit: 'Cups',
    suitVietnamese: 'Cốc',
    element: 'Water',
    number: 9,
    keywords: ['ước nguyện thành', 'thỏa mãn', 'hạnh phúc', 'sung túc'],
    upright: {
      overview: 'Lá bài ước nguyện - những gì bạn mong muốn sẽ thành hiện thực.',
      career: { reading: 'Đạt được mục tiêu mong ước', actionSteps: ['Ăn mừng thành công', 'Biết ơn thành quả'] },
      finance: { reading: 'Thỏa mãn tài chính, ước mơ thành hiện thực', actionSteps: ['Tận hưởng thành quả', 'Chia sẻ niềm vui'] },
      love: { reading: 'Mối quan hệ mơ ước, hạnh phúc viên mãn', actionSteps: ['Tận hưởng tình yêu', 'Biết ơn đối phương'] }
    },
    reversed: { overview: 'Tham lam, không thỏa mãn, ước mơ hão', warning: 'Biết ơn những gì bạn có' },
    crystals: [{ name: 'Citrine', vietnameseName: 'Thạch Anh Vàng', reason: 'Manifestation và niềm vui', shopHandle: 'citrine' }],
    affirmations: ['Ước nguyện của tôi thành hiện thực', 'Tôi xứng đáng với hạnh phúc']
  },

  // Ten of Cups
  {
    id: 'cups-10',
    name: 'Ten of Cups',
    vietnameseName: 'Mười Cốc',
    suit: 'Cups',
    suitVietnamese: 'Cốc',
    element: 'Water',
    number: 10,
    keywords: ['hạnh phúc gia đình', 'hòa thuận', 'viên mãn', 'tình yêu trọn vẹn'],
    upright: {
      overview: 'Hạnh phúc gia đình trọn vẹn, tình yêu viên mãn, giấc mơ thành hiện thực.',
      career: { reading: 'Work-life balance hoàn hảo', actionSteps: ['Ưu tiên gia đình', 'Tìm công việc hài hòa'] },
      finance: { reading: 'Gia đình sung túc', actionSteps: ['Đầu tư vì gia đình', 'Chia sẻ thịnh vượng'] },
      love: { reading: 'Hôn nhân hạnh phúc, gia đình yêu thương', actionSteps: ['Trân trọng gia đình', 'Xây dựng tổ ấm'] }
    },
    reversed: { overview: 'Xung đột gia đình, mất hòa thuận', warning: 'Làm lành với gia đình' },
    crystals: [{ name: 'Emerald', vietnameseName: 'Ngọc Lục Bảo', reason: 'Tình yêu gia đình và trung thành', shopHandle: 'emerald' }],
    affirmations: ['Gia đình là kho báu lớn nhất của tôi', 'Tôi sống trong tình yêu và hòa thuận']
  },

  // Page of Cups
  {
    id: 'cups-page',
    name: 'Page of Cups',
    vietnameseName: 'Thị Vệ Cốc',
    suit: 'Cups',
    suitVietnamese: 'Cốc',
    element: 'Water',
    number: 11,
    keywords: ['sáng tạo', 'trực giác', 'tin vui tình cảm', 'nhạy cảm'],
    upright: {
      overview: 'Tin vui về tình cảm, trực giác phát triển, sáng tạo nghệ thuật.',
      career: { reading: 'Công việc sáng tạo, cơ hội mới về nghệ thuật', actionSteps: ['Theo đuổi sáng tạo', 'Tin vào trực giác'] },
      finance: { reading: 'Cơ hội từ sáng tạo', actionSteps: ['Đầu tư vào nghệ thuật', 'Lắng nghe intuition'] },
      love: { reading: 'Tin vui tình yêu, tỏ tình, lời mời hẹn hò', actionSteps: ['Mở lòng với tình yêu', 'Thể hiện cảm xúc'] }
    },
    reversed: { overview: 'Chặn sáng tạo, tin buồn tình cảm', warning: 'Mở lòng và thể hiện' },
    crystals: [{ name: 'Aquamarine', vietnameseName: 'Ngọc Biển', reason: 'Trực giác và sáng tạo', shopHandle: 'aquamarine' }],
    affirmations: ['Trực giác của tôi luôn đúng', 'Tôi mở lòng đón nhận tin vui']
  },

  // Knight of Cups
  {
    id: 'cups-knight',
    name: 'Knight of Cups',
    vietnameseName: 'Kỵ Sĩ Cốc',
    suit: 'Cups',
    suitVietnamese: 'Cốc',
    element: 'Water',
    number: 12,
    keywords: ['lãng mạn', 'quyến rũ', 'lời mời', 'nghệ sĩ'],
    upright: {
      overview: 'Lời mời lãng mạn, người theo đuổi quyến rũ, nghệ sĩ đam mê.',
      career: { reading: 'Công việc nghệ thuật, cơ hội sáng tạo', actionSteps: ['Theo đuổi đam mê nghệ thuật', 'Chấp nhận lời mời'] },
      finance: { reading: 'Đầu tư vào nghệ thuật, cơ hội từ sáng tạo', actionSteps: ['Follow the heart', 'Đầu tư vào đam mê'] },
      love: { reading: 'Lời tỏ tình, người theo đuổi lãng mạn', actionSteps: ['Mở lòng với romance', 'Đón nhận tình yêu'] }
    },
    reversed: { overview: 'Người lừa dối, ảo tưởng tình yêu', warning: 'Đừng tin lời hứa suông' },
    crystals: [{ name: 'Moonstone', vietnameseName: 'Đá Mặt Trăng', reason: 'Tình yêu và trực giác', shopHandle: 'moonstone' }],
    affirmations: ['Tôi theo đuổi tình yêu với trái tim mở', 'Romance đang đến với tôi']
  },

  // Queen of Cups
  {
    id: 'cups-queen',
    name: 'Queen of Cups',
    vietnameseName: 'Nữ Hoàng Cốc',
    suit: 'Cups',
    suitVietnamese: 'Cốc',
    element: 'Water',
    number: 13,
    keywords: ['từ bi', 'trực giác', 'nuôi dưỡng', 'nhạy cảm'],
    upright: {
      overview: 'Từ bi, trực giác mạnh mẽ, nuôi dưỡng và chữa lành.',
      career: { reading: 'Công việc chữa lành, counseling, nghệ thuật', actionSteps: ['Dùng trực giác trong công việc', 'Chăm sóc đồng nghiệp'] },
      finance: { reading: 'Đầu tư theo trực giác', actionSteps: ['Tin vào gut feeling', 'Không đầu tư nếu cảm thấy không đúng'] },
      love: { reading: 'Tình yêu sâu sắc, từ bi và thấu hiểu', actionSteps: ['Yêu thương vô điều kiện', 'Lắng nghe đối phương'] }
    },
    reversed: { overview: 'Quá nhạy cảm, co-dependent, mất ranh giới', warning: 'Bảo vệ năng lượng của mình' },
    crystals: [{ name: 'Pearl', vietnameseName: 'Ngọc Trai', reason: 'Trực giác và nữ tính', shopHandle: 'pearl' }],
    affirmations: ['Trực giác của tôi là kim chỉ nam', 'Tôi yêu thương với lòng từ bi']
  },

  // King of Cups
  {
    id: 'cups-king',
    name: 'King of Cups',
    vietnameseName: 'Vua Cốc',
    suit: 'Cups',
    suitVietnamese: 'Cốc',
    element: 'Water',
    number: 14,
    keywords: ['cảm xúc ổn định', 'trí tuệ cảm xúc', 'diplomacy', 'từ bi'],
    upright: {
      overview: 'Làm chủ cảm xúc, trí tuệ cảm xúc cao, diplomat, advisor.',
      career: { reading: 'Lãnh đạo với EQ cao, mentor, counselor', actionSteps: ['Lãnh đạo bằng cảm xúc', 'Hỗ trợ team'] },
      finance: { reading: 'Quyết định tài chính bình tĩnh', actionSteps: ['Không để cảm xúc chi phối', 'Đầu tư thông minh'] },
      love: { reading: 'Đối tác trưởng thành về cảm xúc', actionSteps: ['Giao tiếp cảm xúc', 'Hỗ trợ cảm xúc partner'] }
    },
    reversed: { overview: 'Đàn áp cảm xúc, thao túng, mood swings', warning: 'Đối mặt với cảm xúc' },
    crystals: [{ name: 'Blue Sapphire', vietnameseName: 'Saphire Xanh', reason: 'Trí tuệ và bình tĩnh', shopHandle: 'blue-sapphire' }],
    affirmations: ['Tôi làm chủ cảm xúc của mình', 'Trí tuệ cảm xúc là sức mạnh của tôi']
  }
];

// ===== SWORDS - BỘ KIẾM (Air/Gió) =====
export const SWORDS = [
  // Ace of Swords
  {
    id: 'swords-01',
    name: 'Ace of Swords',
    vietnameseName: 'Át Kiếm',
    suit: 'Swords',
    suitVietnamese: 'Kiếm',
    element: 'Air',
    number: 1,
    keywords: ['sự thật', 'sáng suốt', 'ý tưởng mới', 'chiến thắng tinh thần'],
    upright: {
      overview: 'Sự thật được phơi bày, ý tưởng đột phá, chiến thắng bằng trí tuệ.',
      career: { reading: 'Ý tưởng mới, breakthrough, clarity', actionSteps: ['Theo đuổi ý tưởng', 'Giao tiếp rõ ràng'] },
      finance: { reading: 'Chiến lược tài chính mới, clarity', actionSteps: ['Đánh giá khách quan', 'Quyết định sáng suốt'] },
      love: { reading: 'Sự thật trong tình yêu, giao tiếp rõ ràng', actionSteps: ['Nói sự thật', 'Giao tiếp trực tiếp'] }
    },
    reversed: { overview: 'Suy nghĩ mơ hồ, lừa dối, thông tin sai', warning: 'Tìm kiếm sự thật' },
    crystals: [{ name: 'Clear Quartz', vietnameseName: 'Thạch Anh Trắng', reason: 'Sáng suốt và sự thật', shopHandle: 'clear-quartz' }],
    affirmations: ['Tôi nhìn thấy sự thật rõ ràng', 'Trí tuệ của tôi cắt qua mọi ảo tưởng']
  },

  // Two of Swords
  {
    id: 'swords-02',
    name: 'Two of Swords',
    vietnameseName: 'Hai Kiếm',
    suit: 'Swords',
    suitVietnamese: 'Kiếm',
    element: 'Air',
    number: 2,
    keywords: ['bế tắc', 'quyết định khó', 'từ chối nhìn', 'cân bằng'],
    upright: {
      overview: 'Bế tắc, khó quyết định, từ chối nhìn sự thật.',
      career: { reading: 'Khó chọn giữa hai options', actionSteps: ['Thu thập thêm thông tin', 'Đừng vội quyết định'] },
      finance: { reading: 'Phân vân giữa các lựa chọn đầu tư', actionSteps: ['Cân nhắc kỹ', 'Đợi thêm thông tin'] },
      love: { reading: 'Không biết chọn ai, bế tắc tình cảm', actionSteps: ['Lắng nghe trái tim', 'Mở mắt nhìn sự thật'] }
    },
    reversed: { overview: 'Đưa ra quyết định, sự thật được phơi bày', warning: 'Đã đến lúc quyết định' },
    crystals: [{ name: 'Sodalite', vietnameseName: 'Sodalite', reason: 'Sáng suốt và quyết đoán', shopHandle: 'sodalite' }],
    affirmations: ['Tôi có đủ thông tin để quyết định', 'Tôi mở mắt đối diện sự thật']
  },

  // Three of Swords
  {
    id: 'swords-03',
    name: 'Three of Swords',
    vietnameseName: 'Ba Kiếm',
    suit: 'Swords',
    suitVietnamese: 'Kiếm',
    element: 'Air',
    number: 3,
    keywords: ['đau lòng', 'phản bội', 'đau buồn', 'sự thật đau đớn'],
    upright: {
      overview: 'Đau lòng, phản bội, sự thật đau đớn cần được đối mặt.',
      career: { reading: 'Bị phản bội, tin xấu công việc', actionSteps: ['Cho phép đau buồn', 'Học từ kinh nghiệm'] },
      finance: { reading: 'Mất tiền, bị lừa', actionSteps: ['Chấp nhận mất mát', 'Cẩn thận hơn'] },
      love: { reading: 'Chia tay, phản bội, đau lòng', actionSteps: ['Chữa lành trái tim', 'Không đóng cửa với tình yêu'] }
    },
    reversed: { overview: 'Bắt đầu chữa lành, vượt qua đau buồn', warning: 'Thời gian chữa lành mọi vết thương' },
    crystals: [{ name: 'Rose Quartz', vietnameseName: 'Thạch Anh Hồng', reason: 'Chữa lành trái tim', shopHandle: 'rose-quartz' }],
    affirmations: ['Đau buồn là phần của quá trình chữa lành', 'Trái tim tôi sẽ hồi phục']
  },

  // Four of Swords
  {
    id: 'swords-04',
    name: 'Four of Swords',
    vietnameseName: 'Bốn Kiếm',
    suit: 'Swords',
    suitVietnamese: 'Kiếm',
    element: 'Air',
    number: 4,
    keywords: ['nghỉ ngơi', 'hồi phục', 'thiền định', 'rút lui'],
    upright: {
      overview: 'Thời gian nghỉ ngơi và phục hồi. Rút lui để sạc năng lượng.',
      career: { reading: 'Cần nghỉ phép, burn-out cần nghỉ', actionSteps: ['Nghỉ ngơi', 'Thiền định'] },
      finance: { reading: 'Tạm dừng các quyết định tài chính', actionSteps: ['Không vội vàng', 'Nghỉ ngơi trước khi quyết định'] },
      love: { reading: 'Cần không gian riêng, time-out', actionSteps: ['Dành thời gian cho bản thân', 'Hồi phục năng lượng'] }
    },
    reversed: { overview: 'Sẵn sàng hành động trở lại, hồi phục', warning: 'Đừng vội vàng quay lại' },
    crystals: [{ name: 'Amethyst', vietnameseName: 'Thạch Anh Tím', reason: 'Thiền định và bình an', shopHandle: 'amethyst' }],
    affirmations: ['Nghỉ ngơi là một phần của thành công', 'Tôi cho phép mình hồi phục']
  },

  // Five of Swords
  {
    id: 'swords-05',
    name: 'Five of Swords',
    vietnameseName: 'Năm Kiếm',
    suit: 'Swords',
    suitVietnamese: 'Kiếm',
    element: 'Air',
    number: 5,
    keywords: ['xung đột', 'thắng lợi pyrrhic', 'lừa dối', 'thua cuộc'],
    upright: {
      overview: 'Xung đột, chiến thắng bằng mọi giá, có thể thắng nhưng mất nhiều hơn được.',
      career: { reading: 'Xung đột văn phòng, thắng lợi pyrrhic', actionSteps: ['Chọn battles wisely', 'Đôi khi bỏ cuộc là thắng'] },
      finance: { reading: 'Mất tiền vì xung đột, kiện tụng', actionSteps: ['Tránh tranh chấp', 'Hòa giải nếu có thể'] },
      love: { reading: 'Cãi vã, không ai chịu thua', actionSteps: ['Hòa giải', 'Đừng để ego phá hủy tình yêu'] }
    },
    reversed: { overview: 'Hòa giải, học từ xung đột', warning: 'Đôi khi rút lui là thắng lợi' },
    crystals: [{ name: 'Black Tourmaline', vietnameseName: 'Tourmaline Đen', reason: 'Bảo vệ khỏi năng lượng tiêu cực', shopHandle: 'black-tourmaline' }],
    affirmations: ['Tôi chọn hòa bình thay vì chiến thắng', 'Tôi học từ mọi xung đột']
  },

  // Six of Swords
  {
    id: 'swords-06',
    name: 'Six of Swords',
    vietnameseName: 'Sáu Kiếm',
    suit: 'Swords',
    suitVietnamese: 'Kiếm',
    element: 'Air',
    number: 6,
    keywords: ['chuyển tiếp', 'rời bỏ', 'chữa lành', 'hành trình'],
    upright: {
      overview: 'Chuyển tiếp sang giai đoạn mới, rời bỏ khó khăn, hành trình chữa lành.',
      career: { reading: 'Chuyển công việc, rời môi trường độc hại', actionSteps: ['Tiến về phía trước', 'Để lại quá khứ'] },
      finance: { reading: 'Thoát khỏi vấn đề tài chính', actionSteps: ['Di chuyển về phía ổn định', 'Bỏ lại nợ nần'] },
      love: { reading: 'Chuyển sang giai đoạn mới, chữa lành sau chia tay', actionSteps: ['Tiến về phía trước', 'Chữa lành từ từ'] }
    },
    reversed: { overview: 'Mắc kẹt, không thể rời bỏ', warning: 'Đã đến lúc tiến về phía trước' },
    crystals: [{ name: 'Aquamarine', vietnameseName: 'Ngọc Biển', reason: 'Hỗ trợ chuyển tiếp và chữa lành', shopHandle: 'aquamarine' }],
    affirmations: ['Tôi di chuyển về phía bình yên', 'Để lại quá khứ để đón tương lai']
  },

  // Seven of Swords
  {
    id: 'swords-07',
    name: 'Seven of Swords',
    vietnameseName: 'Bảy Kiếm',
    suit: 'Swords',
    suitVietnamese: 'Kiếm',
    element: 'Air',
    number: 7,
    keywords: ['lừa dối', 'chiến lược', 'trốn tránh', 'lấy cắp'],
    upright: {
      overview: 'Lừa dối hoặc được lừa, chiến lược lén lút, cần cảnh giác.',
      career: { reading: 'Ai đó lừa dối, office politics', actionSteps: ['Cảnh giác với đồng nghiệp', 'Bảo vệ thông tin'] },
      finance: { reading: 'Có thể bị lừa, scam', actionSteps: ['Kiểm tra kỹ giao dịch', 'Đừng tin quá dễ'] },
      love: { reading: 'Lừa dối trong mối quan hệ, bí mật', actionSteps: ['Tìm sự thật', 'Đối mặt với vấn đề'] }
    },
    reversed: { overview: 'Bị phát hiện, sự thật phơi bày, hối hận', warning: 'Sự thật luôn được phơi bày' },
    crystals: [{ name: 'Tiger Eye', vietnameseName: 'Mắt Hổ', reason: 'Nhìn thấu lừa dối', shopHandle: 'tiger-eye' }],
    affirmations: ['Tôi nhìn thấy sự thật đằng sau lời nói', 'Tôi bảo vệ bản thân khỏi lừa dối']
  },

  // Eight of Swords
  {
    id: 'swords-08',
    name: 'Eight of Swords',
    vietnameseName: 'Tám Kiếm',
    suit: 'Swords',
    suitVietnamese: 'Kiếm',
    element: 'Air',
    number: 8,
    keywords: ['bế tắc', 'tự giam', 'sợ hãi', 'giới hạn'],
    upright: {
      overview: 'Cảm giác bị mắc kẹt, nhưng rào cản là do bạn tự tạo ra.',
      career: { reading: 'Cảm giác không có lối thoát', actionSteps: ['Nhận ra bạn có lựa chọn', 'Tìm cách thoát ra'] },
      finance: { reading: 'Cảm giác bế tắc tài chính', actionSteps: ['Tìm options mới', 'Đừng tự giới hạn'] },
      love: { reading: 'Cảm giác bị mắc kẹt trong mối quan hệ', actionSteps: ['Nhận ra bạn có quyền chọn', 'Tìm sự giúp đỡ'] }
    },
    reversed: { overview: 'Giải phóng bản thân, nhìn thấy options', warning: 'Bạn có nhiều lựa chọn hơn bạn nghĩ' },
    crystals: [{ name: 'Lepidolite', vietnameseName: 'Lepidolite', reason: 'Giải phóng và bình an', shopHandle: 'lepidolite' }],
    affirmations: ['Tôi tự do để chọn con đường của mình', 'Rào cản của tôi chỉ là ảo tưởng']
  },

  // Nine of Swords
  {
    id: 'swords-09',
    name: 'Nine of Swords',
    vietnameseName: 'Chín Kiếm',
    suit: 'Swords',
    suitVietnamese: 'Kiếm',
    element: 'Air',
    number: 9,
    keywords: ['lo lắng', 'ác mộng', 'tội lỗi', 'sợ hãi'],
    upright: {
      overview: 'Lo lắng, ác mộng, suy nghĩ tiêu cực. Nỗi sợ có thể lớn hơn thực tế.',
      career: { reading: 'Lo lắng về công việc, mất ngủ', actionSteps: ['Đối mặt với nỗi sợ', 'Nói chuyện với ai đó'] },
      finance: { reading: 'Lo lắng về tiền bạc, stress', actionSteps: ['Lập kế hoạch giảm lo', 'Đừng để nỗi sợ kiểm soát'] },
      love: { reading: 'Lo lắng về mối quan hệ, jealousy', actionSteps: ['Giao tiếp với đối phương', 'Đừng tưởng tượng quá nhiều'] }
    },
    reversed: { overview: 'Bắt đầu hồi phục, nỗi sợ giảm dần', warning: 'Tìm sự giúp đỡ nếu cần' },
    crystals: [{ name: 'Smoky Quartz', vietnameseName: 'Thạch Anh Khói', reason: 'Giải tỏa lo lắng', shopHandle: 'smoky-quartz' }],
    affirmations: ['Nỗi sợ của tôi không kiểm soát tôi', 'Tôi đối mặt với lo lắng bằng sự bình tĩnh']
  },

  // Ten of Swords
  {
    id: 'swords-10',
    name: 'Ten of Swords',
    vietnameseName: 'Mười Kiếm',
    suit: 'Swords',
    suitVietnamese: 'Kiếm',
    element: 'Air',
    number: 10,
    keywords: ['kết thúc đau đớn', 'đáy vực', 'phản bội', 'tái sinh'],
    upright: {
      overview: 'Kết thúc đau đớn, đáy vực, nhưng mặt trời đang mọc phía xa.',
      career: { reading: 'Bị sa thải, dự án thất bại hoàn toàn', actionSteps: ['Chấp nhận kết thúc', 'Chuẩn bị cho khởi đầu mới'] },
      finance: { reading: 'Phá sản, mất hết', actionSteps: ['Chấp nhận và bắt đầu lại', 'Học từ sai lầm'] },
      love: { reading: 'Kết thúc mối quan hệ, phản bội hoàn toàn', actionSteps: ['Chấp nhận kết thúc', 'Chữa lành và tiến lên'] }
    },
    reversed: { overview: 'Bắt đầu hồi phục, vượt qua đáy vực', warning: 'Sau đêm tối là bình minh' },
    crystals: [{ name: 'Obsidian', vietnameseName: 'Obsidian', reason: 'Chuyển hóa và tái sinh', shopHandle: 'obsidian' }],
    affirmations: ['Mọi kết thúc là khởi đầu mới', 'Tôi vươn lên từ đống tro tàn']
  },

  // Page of Swords
  {
    id: 'swords-page',
    name: 'Page of Swords',
    vietnameseName: 'Thị Vệ Kiếm',
    suit: 'Swords',
    suitVietnamese: 'Kiếm',
    element: 'Air',
    number: 11,
    keywords: ['tò mò', 'tin tức', 'nhanh nhẹn', 'giao tiếp'],
    upright: {
      overview: 'Tò mò trí tuệ, tin tức đến, nhanh nhẹn trong giao tiếp.',
      career: { reading: 'Tin tức công việc, cơ hội học hỏi', actionSteps: ['Tìm hiểu thêm', 'Giao tiếp hiệu quả'] },
      finance: { reading: 'Tin tức tài chính, cần nghiên cứu', actionSteps: ['Thu thập thông tin', 'Đừng vội quyết định'] },
      love: { reading: 'Tin tức về tình yêu, giao tiếp mới', actionSteps: ['Lắng nghe', 'Giao tiếp rõ ràng'] }
    },
    reversed: { overview: 'Tin đồn, giao tiếp kém, gossip', warning: 'Kiểm chứng thông tin' },
    crystals: [{ name: 'Blue Lace Agate', vietnameseName: 'Mã Não Xanh', reason: 'Giao tiếp rõ ràng', shopHandle: 'blue-lace-agate' }],
    affirmations: ['Tôi giao tiếp với sự rõ ràng', 'Trí tò mò của tôi dẫn đến tri thức']
  },

  // Knight of Swords
  {
    id: 'swords-knight',
    name: 'Knight of Swords',
    vietnameseName: 'Kỵ Sĩ Kiếm',
    suit: 'Swords',
    suitVietnamese: 'Kiếm',
    element: 'Air',
    number: 12,
    keywords: ['hành động nhanh', 'quyết đoán', 'tham vọng', 'xung đột'],
    upright: {
      overview: 'Hành động nhanh và quyết đoán, lao về phía trước với tham vọng.',
      career: { reading: 'Tiến nhanh trong sự nghiệp, quyết đoán', actionSteps: ['Hành động nhanh', 'Theo đuổi mục tiêu'] },
      finance: { reading: 'Quyết định tài chính nhanh', actionSteps: ['Nắm bắt cơ hội', 'Đừng chần chừ'] },
      love: { reading: 'Thay đổi nhanh trong tình yêu', actionSteps: ['Giao tiếp trực tiếp', 'Đừng vội vàng'] }
    },
    reversed: { overview: 'Quá vội vàng, thiếu kế hoạch, xung đột', warning: 'Suy nghĩ trước khi hành động' },
    crystals: [{ name: 'Lapis Lazuli', vietnameseName: 'Thanh Kim Thạch', reason: 'Trí tuệ và quyết đoán', shopHandle: 'lapis-lazuli' }],
    affirmations: ['Tôi hành động với trí tuệ và quyết tâm', 'Tốc độ đi kèm với sự sáng suốt']
  },

  // Queen of Swords
  {
    id: 'swords-queen',
    name: 'Queen of Swords',
    vietnameseName: 'Nữ Hoàng Kiếm',
    suit: 'Swords',
    suitVietnamese: 'Kiếm',
    element: 'Air',
    number: 13,
    keywords: ['trực tiếp', 'độc lập', 'sáng suốt', 'kinh nghiệm'],
    upright: {
      overview: 'Phụ nữ thông minh, độc lập, trực tiếp và sáng suốt từ kinh nghiệm.',
      career: { reading: 'Lãnh đạo bằng trí tuệ, advisor đáng tin', actionSteps: ['Tin vào phán đoán', 'Giao tiếp trực tiếp'] },
      finance: { reading: 'Quyết định tài chính sáng suốt', actionSteps: ['Phân tích khách quan', 'Không để cảm xúc chi phối'] },
      love: { reading: 'Cần sự trung thực, độc lập trong tình yêu', actionSteps: ['Giao tiếp thẳng thắn', 'Giữ sự độc lập'] }
    },
    reversed: { overview: 'Quá lạnh lùng, cay nghiệt, thiếu từ bi', warning: 'Cân bằng logic và cảm xúc' },
    crystals: [{ name: 'Amazonite', vietnameseName: 'Amazonite', reason: 'Sự thật và lòng từ bi', shopHandle: 'amazonite' }],
    affirmations: ['Tôi nói sự thật với lòng từ bi', 'Trí tuệ của tôi đến từ kinh nghiệm']
  },

  // King of Swords
  {
    id: 'swords-king',
    name: 'King of Swords',
    vietnameseName: 'Vua Kiếm',
    suit: 'Swords',
    suitVietnamese: 'Kiếm',
    element: 'Air',
    number: 14,
    keywords: ['quyền lực trí tuệ', 'công lý', 'luật sư', 'phán xét'],
    upright: {
      overview: 'Quyền lực trí tuệ, công lý, người phán xét công bằng.',
      career: { reading: 'Luật sư, judge, intellectual leader', actionSteps: ['Quyết định với logic', 'Công bằng với tất cả'] },
      finance: { reading: 'Quyết định tài chính thông minh', actionSteps: ['Phân tích kỹ lưỡng', 'Tìm lời khuyên chuyên gia'] },
      love: { reading: 'Đối tác thông minh, cần giao tiếp logic', actionSteps: ['Nói chuyện hợp lý', 'Tôn trọng quan điểm'] }
    },
    reversed: { overview: 'Lạm dụng quyền lực, độc đoán, bất công', warning: 'Quyền lực cần đi kèm trách nhiệm' },
    crystals: [{ name: 'Blue Sapphire', vietnameseName: 'Saphire Xanh', reason: 'Trí tuệ và công lý', shopHandle: 'blue-sapphire' }],
    affirmations: ['Tôi phán xét với sự công bằng', 'Trí tuệ của tôi phục vụ công lý']
  }
];

// ===== PENTACLES - BỘ TIỀN (Earth/Đất) =====
export const PENTACLES = [
  // Ace of Pentacles
  {
    id: 'pentacles-01',
    name: 'Ace of Pentacles',
    vietnameseName: 'Át Tiền',
    suit: 'Pentacles',
    suitVietnamese: 'Tiền',
    element: 'Earth',
    number: 1,
    keywords: ['cơ hội tài chính', 'khởi đầu vật chất', 'thịnh vượng', 'nền tảng'],
    upright: {
      overview: 'Cơ hội tài chính mới, khởi đầu thịnh vượng, nền tảng vật chất vững chắc.',
      career: { reading: 'Công việc mới, cơ hội kinh doanh', actionSteps: ['Nắm bắt cơ hội', 'Xây dựng nền tảng'] },
      finance: { reading: 'Cơ hội đầu tư, tiền đến', actionSteps: ['Đầu tư thông minh', 'Tiết kiệm cho tương lai'] },
      love: { reading: 'Mối quan hệ ổn định về vật chất', actionSteps: ['Xây dựng nền tảng', 'Lên kế hoạch tài chính chung'] }
    },
    reversed: { overview: 'Bỏ lỡ cơ hội, thiếu kế hoạch tài chính', warning: 'Đừng bỏ lỡ cơ hội' },
    crystals: [{ name: 'Green Aventurine', vietnameseName: 'Aventurine Xanh', reason: 'May mắn và thịnh vượng', shopHandle: 'green-aventurine' }],
    affirmations: ['Tôi mở lòng đón nhận thịnh vượng', 'Cơ hội tài chính đến với tôi']
  },

  // Two of Pentacles
  {
    id: 'pentacles-02',
    name: 'Two of Pentacles',
    vietnameseName: 'Hai Tiền',
    suit: 'Pentacles',
    suitVietnamese: 'Tiền',
    element: 'Earth',
    number: 2,
    keywords: ['cân bằng', 'linh hoạt', 'ưu tiên', 'đa nhiệm'],
    upright: {
      overview: 'Cân bằng nhiều trách nhiệm, linh hoạt thích ứng với thay đổi.',
      career: { reading: 'Đa nhiệm, cân bằng nhiều dự án', actionSteps: ['Ưu tiên thông minh', 'Linh hoạt thích ứng'] },
      finance: { reading: 'Cân bằng thu chi, quản lý nhiều khoản', actionSteps: ['Lập ngân sách', 'Đa dạng nguồn thu'] },
      love: { reading: 'Cân bằng tình yêu và công việc', actionSteps: ['Chia sẻ trách nhiệm', 'Linh hoạt với thời gian'] }
    },
    reversed: { overview: 'Mất cân bằng, quá tải, thiếu tổ chức', warning: 'Đơn giản hóa cuộc sống' },
    crystals: [{ name: 'Jasper', vietnameseName: 'Jasper', reason: 'Cân bằng và ổn định', shopHandle: 'jasper' }],
    affirmations: ['Tôi cân bằng mọi khía cạnh cuộc sống', 'Tôi linh hoạt thích ứng với thay đổi']
  },

  // Three of Pentacles
  {
    id: 'pentacles-03',
    name: 'Three of Pentacles',
    vietnameseName: 'Ba Tiền',
    suit: 'Pentacles',
    suitVietnamese: 'Tiền',
    element: 'Earth',
    number: 3,
    keywords: ['teamwork', 'kỹ năng', 'học hỏi', 'xây dựng'],
    upright: {
      overview: 'Làm việc nhóm hiệu quả, phát triển kỹ năng, xây dựng từ nền tảng.',
      career: { reading: 'Teamwork thành công, được công nhận kỹ năng', actionSteps: ['Hợp tác hiệu quả', 'Phát triển expertise'] },
      finance: { reading: 'Thu nhập từ kỹ năng, đầu tư vào giáo dục', actionSteps: ['Học thêm kỹ năng', 'Đầu tư vào bản thân'] },
      love: { reading: 'Xây dựng mối quan hệ cùng nhau', actionSteps: ['Làm việc như một team', 'Học hỏi lẫn nhau'] }
    },
    reversed: { overview: 'Thiếu teamwork, kỹ năng yếu, xung đột nhóm', warning: 'Hợp tác thay vì làm một mình' },
    crystals: [{ name: 'Carnelian', vietnameseName: 'Carnelian', reason: 'Sáng tạo và động lực', shopHandle: 'carnelian' }],
    affirmations: ['Kỹ năng của tôi được công nhận', 'Tôi hợp tác hiệu quả với người khác']
  },

  // Four of Pentacles
  {
    id: 'pentacles-04',
    name: 'Four of Pentacles',
    vietnameseName: 'Bốn Tiền',
    suit: 'Pentacles',
    suitVietnamese: 'Tiền',
    element: 'Earth',
    number: 4,
    keywords: ['an ninh', 'kiểm soát', 'bảo thủ', 'giữ chặt'],
    upright: {
      overview: 'Tập trung vào an ninh tài chính, có thể giữ chặt quá mức.',
      career: { reading: 'Giữ vị trí an toàn, không muốn thay đổi', actionSteps: ['Đánh giá rủi ro', 'Đừng quá bảo thủ'] },
      finance: { reading: 'Tiết kiệm tốt, có thể keo kiệt', actionSteps: ['Cân bằng tiết kiệm và hưởng thụ', 'Đừng quá lo lắng'] },
      love: { reading: 'Quá kiểm soát, sợ mất', actionSteps: ['Buông bỏ kiểm soát', 'Tin tưởng đối phương'] }
    },
    reversed: { overview: 'Buông bỏ, chia sẻ, hoặc mất kiểm soát', warning: 'Cân bằng giữa an ninh và tự do' },
    crystals: [{ name: 'Pyrite', vietnameseName: 'Pyrite', reason: 'Thịnh vượng và bảo vệ', shopHandle: 'pyrite' }],
    affirmations: ['Tôi tin tưởng vào sự dồi dào của vũ trụ', 'An ninh đến từ bên trong']
  },

  // Five of Pentacles
  {
    id: 'pentacles-05',
    name: 'Five of Pentacles',
    vietnameseName: 'Năm Tiền',
    suit: 'Pentacles',
    suitVietnamese: 'Tiền',
    element: 'Earth',
    number: 5,
    keywords: ['khó khăn tài chính', 'cô đơn', 'bệnh tật', 'loại trừ'],
    upright: {
      overview: 'Khó khăn tài chính, cảm giác bị loại trừ, thời kỳ khó khăn.',
      career: { reading: 'Thất nghiệp, khó khăn công việc', actionSteps: ['Tìm sự giúp đỡ', 'Đừng từ bỏ'] },
      finance: { reading: 'Thiếu tiền, nợ nần', actionSteps: ['Tìm nguồn hỗ trợ', 'Lập kế hoạch phục hồi'] },
      love: { reading: 'Cô đơn, khó khăn trong mối quan hệ', actionSteps: ['Tìm sự hỗ trợ', 'Đừng cô lập bản thân'] }
    },
    reversed: { overview: 'Phục hồi, tìm được sự giúp đỡ', warning: 'Sự giúp đỡ đang đến' },
    crystals: [{ name: 'Black Tourmaline', vietnameseName: 'Tourmaline Đen', reason: 'Bảo vệ trong thời khó khăn', shopHandle: 'black-tourmaline' }],
    affirmations: ['Tôi vượt qua mọi khó khăn', 'Sự giúp đỡ đang đến với tôi']
  },

  // Six of Pentacles
  {
    id: 'pentacles-06',
    name: 'Six of Pentacles',
    vietnameseName: 'Sáu Tiền',
    suit: 'Pentacles',
    suitVietnamese: 'Tiền',
    element: 'Earth',
    number: 6,
    keywords: ['cho đi', 'nhận lại', 'từ thiện', 'cân bằng'],
    upright: {
      overview: 'Cho và nhận cân bằng, từ thiện, chia sẻ thịnh vượng.',
      career: { reading: 'Được mentor hỗ trợ hoặc mentor người khác', actionSteps: ['Chia sẻ kiến thức', 'Nhận sự giúp đỡ'] },
      finance: { reading: 'Cho đi hoặc nhận được giúp đỡ tài chính', actionSteps: ['Từ thiện nếu có thể', 'Nhận giúp đỡ nếu cần'] },
      love: { reading: 'Cân bằng cho và nhận trong tình yêu', actionSteps: ['Chia sẻ công bằng', 'Biết ơn điều nhận được'] }
    },
    reversed: { overview: 'Mất cân bằng trong cho-nhận, lợi dụng', warning: 'Đảm bảo sự công bằng' },
    crystals: [{ name: 'Green Jade', vietnameseName: 'Ngọc Bích Xanh', reason: 'May mắn và từ bi', shopHandle: 'green-jade' }],
    affirmations: ['Tôi cho đi với niềm vui', 'Sự dồi dào của tôi được chia sẻ']
  },

  // Seven of Pentacles
  {
    id: 'pentacles-07',
    name: 'Seven of Pentacles',
    vietnameseName: 'Bảy Tiền',
    suit: 'Pentacles',
    suitVietnamese: 'Tiền',
    element: 'Earth',
    number: 7,
    keywords: ['đánh giá', 'kiên nhẫn', 'đầu tư dài hạn', 'chờ đợi'],
    upright: {
      overview: 'Đánh giá tiến độ, kiên nhẫn chờ đợi kết quả từ đầu tư.',
      career: { reading: 'Đánh giá sự nghiệp, chờ đợi thành quả', actionSteps: ['Kiên nhẫn', 'Đánh giá tiến độ'] },
      finance: { reading: 'Đầu tư dài hạn đang phát triển', actionSteps: ['Kiên nhẫn với đầu tư', 'Đánh giá portfolio'] },
      love: { reading: 'Đánh giá mối quan hệ, kiên nhẫn', actionSteps: ['Nhìn lại hành trình', 'Tiếp tục nuôi dưỡng'] }
    },
    reversed: { overview: 'Thiếu kiên nhẫn, đầu tư không sinh lợi', warning: 'Đánh giá lại và điều chỉnh' },
    crystals: [{ name: 'Moss Agate', vietnameseName: 'Mã Não Rêu', reason: 'Kiên nhẫn và tăng trưởng', shopHandle: 'moss-agate' }],
    affirmations: ['Tôi kiên nhẫn với quá trình', 'Đầu tư của tôi đang sinh lợi']
  },

  // Eight of Pentacles
  {
    id: 'pentacles-08',
    name: 'Eight of Pentacles',
    vietnameseName: 'Tám Tiền',
    suit: 'Pentacles',
    suitVietnamese: 'Tiền',
    element: 'Earth',
    number: 8,
    keywords: ['chăm chỉ', 'kỹ năng', 'học tập', 'cống hiến'],
    upright: {
      overview: 'Chăm chỉ làm việc, phát triển kỹ năng, dedication to craft.',
      career: { reading: 'Làm việc chăm chỉ, học tập liên tục', actionSteps: ['Nâng cao kỹ năng', 'Cống hiến cho công việc'] },
      finance: { reading: 'Thu nhập từ công việc chăm chỉ', actionSteps: ['Đầu tư vào kỹ năng', 'Kiên trì với kế hoạch'] },
      love: { reading: 'Làm việc để cải thiện mối quan hệ', actionSteps: ['Cống hiến cho tình yêu', 'Phát triển bản thân'] }
    },
    reversed: { overview: 'Lười biếng, thiếu tập trung, perfectionism', warning: 'Quay lại làm việc' },
    crystals: [{ name: 'Tiger Eye', vietnameseName: 'Mắt Hổ', reason: 'Tập trung và quyết tâm', shopHandle: 'tiger-eye' }],
    affirmations: ['Tôi cống hiến cho việc làm chủ kỹ năng', 'Công việc chăm chỉ mang lại thành quả']
  },

  // Nine of Pentacles
  {
    id: 'pentacles-09',
    name: 'Nine of Pentacles',
    vietnameseName: 'Chín Tiền',
    suit: 'Pentacles',
    suitVietnamese: 'Tiền',
    element: 'Earth',
    number: 9,
    keywords: ['độc lập', 'sung túc', 'tự lập', 'thưởng thức'],
    upright: {
      overview: 'Độc lập tài chính, tận hưởng thành quả lao động, cuộc sống sung túc.',
      career: { reading: 'Thành công độc lập, tự doanh', actionSteps: ['Tận hưởng thành quả', 'Duy trì độc lập'] },
      finance: { reading: 'Sung túc, tự do tài chính', actionSteps: ['Hưởng thụ cuộc sống', 'Duy trì sự thịnh vượng'] },
      love: { reading: 'Độc lập trong tình yêu, self-love', actionSteps: ['Yêu bản thân', 'Không phụ thuộc'] }
    },
    reversed: { overview: 'Phụ thuộc, mất độc lập, thiếu tự tin', warning: 'Xây dựng lại sự tự lập' },
    crystals: [{ name: 'Citrine', vietnameseName: 'Thạch Anh Vàng', reason: 'Thịnh vượng và tự tin', shopHandle: 'citrine' }],
    affirmations: ['Tôi độc lập và tự do', 'Tôi tận hưởng thành quả của mình']
  },

  // Ten of Pentacles
  {
    id: 'pentacles-10',
    name: 'Ten of Pentacles',
    vietnameseName: 'Mười Tiền',
    suit: 'Pentacles',
    suitVietnamese: 'Tiền',
    element: 'Earth',
    number: 10,
    keywords: ['di sản', 'gia đình', 'thịnh vượng lâu dài', 'truyền thống'],
    upright: {
      overview: 'Di sản gia đình, thịnh vượng nhiều thế hệ, ổn định lâu dài.',
      career: { reading: 'Doanh nghiệp gia đình, sự nghiệp bền vững', actionSteps: ['Xây dựng di sản', 'Tạo giá trị lâu dài'] },
      finance: { reading: 'Thừa kế, thịnh vượng gia đình', actionSteps: ['Bảo vệ tài sản', 'Kế hoạch cho thế hệ sau'] },
      love: { reading: 'Gia đình hạnh phúc, truyền thống', actionSteps: ['Xây dựng nền tảng gia đình', 'Tôn trọng truyền thống'] }
    },
    reversed: { overview: 'Xung đột gia đình, mất di sản, thiếu ổn định', warning: 'Bảo vệ di sản gia đình' },
    crystals: [{ name: 'Green Jade', vietnameseName: 'Ngọc Bích Xanh', reason: 'May mắn gia đình và thịnh vượng', shopHandle: 'green-jade' }],
    affirmations: ['Tôi xây dựng di sản cho tương lai', 'Gia đình tôi thịnh vượng qua nhiều thế hệ']
  },

  // Page of Pentacles
  {
    id: 'pentacles-page',
    name: 'Page of Pentacles',
    vietnameseName: 'Thị Vệ Tiền',
    suit: 'Pentacles',
    suitVietnamese: 'Tiền',
    element: 'Earth',
    number: 11,
    keywords: ['học tập', 'cơ hội mới', 'thực tế', 'manifestation'],
    upright: {
      overview: 'Cơ hội học tập, khởi đầu thực tế, manifestation bắt đầu.',
      career: { reading: 'Cơ hội học việc, intern, khóa học mới', actionSteps: ['Học hỏi chăm chỉ', 'Nắm bắt cơ hội'] },
      finance: { reading: 'Bắt đầu tiết kiệm, học về tài chính', actionSteps: ['Học quản lý tiền', 'Bắt đầu đầu tư nhỏ'] },
      love: { reading: 'Bắt đầu mối quan hệ mới với nền tảng vững', actionSteps: ['Xây dựng từ từ', 'Thực tế với kỳ vọng'] }
    },
    reversed: { overview: 'Thiếu tập trung, bỏ lỡ cơ hội học tập', warning: 'Tập trung vào mục tiêu' },
    crystals: [{ name: 'Malachite', vietnameseName: 'Malachite', reason: 'Học tập và transformation', shopHandle: 'malachite' }],
    affirmations: ['Tôi sẵn sàng học hỏi và phát triển', 'Cơ hội đang đến với tôi']
  },

  // Knight of Pentacles
  {
    id: 'pentacles-knight',
    name: 'Knight of Pentacles',
    vietnameseName: 'Kỵ Sĩ Tiền',
    suit: 'Pentacles',
    suitVietnamese: 'Tiền',
    element: 'Earth',
    number: 12,
    keywords: ['chăm chỉ', 'đáng tin', 'kiên nhẫn', 'có phương pháp'],
    upright: {
      overview: 'Làm việc chăm chỉ và có phương pháp, đáng tin cậy, kiên nhẫn.',
      career: { reading: 'Nhân viên đáng tin, tiến bộ đều đặn', actionSteps: ['Làm việc có kế hoạch', 'Kiên nhẫn với mục tiêu'] },
      finance: { reading: 'Đầu tư an toàn, tiết kiệm đều đặn', actionSteps: ['Chiến lược dài hạn', 'Không mạo hiểm'] },
      love: { reading: 'Đối tác đáng tin, mối quan hệ ổn định', actionSteps: ['Xây dựng niềm tin', 'Kiên nhẫn với nhau'] }
    },
    reversed: { overview: 'Quá bảo thủ, chậm chạp, thiếu linh hoạt', warning: 'Đôi khi cần mạo hiểm' },
    crystals: [{ name: 'Obsidian', vietnameseName: 'Obsidian', reason: 'Grounding và bảo vệ', shopHandle: 'obsidian' }],
    affirmations: ['Tôi tiến về phía trước với sự kiên nhẫn', 'Công việc đều đặn mang lại thành quả']
  },

  // Queen of Pentacles
  {
    id: 'pentacles-queen',
    name: 'Queen of Pentacles',
    vietnameseName: 'Nữ Hoàng Tiền',
    suit: 'Pentacles',
    suitVietnamese: 'Tiền',
    element: 'Earth',
    number: 13,
    keywords: ['nuôi dưỡng', 'thực tế', 'sung túc', 'homemaker'],
    upright: {
      overview: 'Nuôi dưỡng và thực tế, tạo ra không gian ấm cúng, quản lý tài chính tốt.',
      career: { reading: 'Quản lý giỏi, chăm lo môi trường làm việc', actionSteps: ['Tạo môi trường tích cực', 'Quản lý nguồn lực tốt'] },
      finance: { reading: 'Quản lý tài chính gia đình tốt', actionSteps: ['Tiết kiệm thông minh', 'Đầu tư vào gia đình'] },
      love: { reading: 'Chăm sóc gia đình, tình yêu thực tế', actionSteps: ['Chăm lo cho người thân', 'Tạo tổ ấm'] }
    },
    reversed: { overview: 'Quá lo lắng về tiền, bỏ bê bản thân', warning: 'Cân bằng cho và nhận' },
    crystals: [{ name: 'Emerald', vietnameseName: 'Ngọc Lục Bảo', reason: 'Thịnh vượng và tình yêu', shopHandle: 'emerald' }],
    affirmations: ['Tôi nuôi dưỡng bản thân và người thân', 'Sự sung túc chảy qua tôi']
  },

  // King of Pentacles
  {
    id: 'pentacles-king',
    name: 'King of Pentacles',
    vietnameseName: 'Vua Tiền',
    suit: 'Pentacles',
    suitVietnamese: 'Tiền',
    element: 'Earth',
    number: 14,
    keywords: ['thành công vật chất', 'lãnh đạo', 'doanh nhân', 'ổn định'],
    upright: {
      overview: 'Thành công vật chất, lãnh đạo kinh doanh, ổn định và giàu có.',
      career: { reading: 'CEO, doanh nhân thành công, leader', actionSteps: ['Lãnh đạo với trách nhiệm', 'Xây dựng empire'] },
      finance: { reading: 'Giàu có, đầu tư thành công', actionSteps: ['Quản lý tài sản', 'Chia sẻ thịnh vượng'] },
      love: { reading: 'Đối tác thành công, cung cấp an ninh', actionSteps: ['Cung cấp ổn định', 'Không chỉ tiền bạc'] }
    },
    reversed: { overview: 'Tham lam, workaholic, materialism', warning: 'Tiền không phải tất cả' },
    crystals: [{ name: 'Ruby', vietnameseName: 'Hồng Ngọc', reason: 'Thịnh vượng và quyền lực', shopHandle: 'ruby' }],
    affirmations: ['Tôi thành công trong mọi lĩnh vực cuộc sống', 'Tôi sử dụng thịnh vượng để giúp đỡ người khác']
  }
];

// ===== COMBINED MINOR ARCANA =====
export const MINOR_ARCANA = [...WANDS, ...CUPS, ...SWORDS, ...PENTACLES];

// ===== HELPER FUNCTIONS =====

// Lấy lá bài theo ID
export const getMinorArcanaCard = (id) => {
  return MINOR_ARCANA.find(card => card.id === id);
};

// Lấy lá bài theo suit
export const getCardsBySuit = (suit) => {
  const suitMap = {
    'wands': WANDS,
    'cups': CUPS,
    'swords': SWORDS,
    'pentacles': PENTACLES
  };
  return suitMap[suit.toLowerCase()] || [];
};

// Lấy random card từ Minor Arcana
export const getRandomMinorArcana = () => {
  const randomIndex = Math.floor(Math.random() * MINOR_ARCANA.length);
  return MINOR_ARCANA[randomIndex];
};

// Lấy random card từ một suit cụ thể
export const getRandomCardFromSuit = (suit) => {
  const cards = getCardsBySuit(suit);
  if (cards.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * cards.length);
  return cards[randomIndex];
};

// Export default
export default MINOR_ARCANA;
