/**
 * Zodiac Data - 12 Con Giáp (Chinese/Vietnamese Zodiac)
 * Used by AI Brain for personalized crystal recommendations
 *
 * Includes:
 * - 12 zodiac animals with characteristics
 * - Crystal recommendations per zodiac
 * - Compatibility between zodiacs
 * - AI response templates
 */

// ===========================================
// 12 CON GIÁP CORE DATA
// ===========================================

export const ZODIACS = {
  ty: {
    id: 'ty',
    name: 'Tý',
    animal: 'Chuột',
    animalEn: 'Rat',
    emoji: '🐀',
    years: [1924, 1936, 1948, 1960, 1972, 1984, 1996, 2008, 2020, 2032],
    element: 'thuy', // Ngũ hành
    direction: 'Bắc',
    season: 'Đông',
    hour: '23:00 - 01:00',
    luckyNumbers: [2, 3],
    luckyColors: ['Xanh dương', 'Vàng', 'Xanh lá'],

    personality: {
      positive: ['Thông minh', 'Nhanh nhẹn', 'Tiết kiệm', 'Chu đáo', 'Linh hoạt'],
      negative: ['Hay lo lắng', 'Đa nghi', 'Keo kiệt', 'Hay chỉ trích'],
      love: 'Lãng mạn, trung thành nhưng hay ghen tuông',
      career: 'Phù hợp: Tài chính, Nghiên cứu, Kinh doanh, Viết lách',
    },

    crystals: {
      main: ['amethyst', 'citrine', 'garnet'],
      support: ['clear_quartz', 'jade', 'tigers_eye'],
      avoid: ['ruby', 'fire_opal'],
    },

    // Tam hợp & Lục hợp
    compatibility: {
      best: ['thin', 'than'],      // Tam hợp: Thìn, Thân
      good: ['suu'],               // Lục hợp: Sửu
      neutral: ['dan', 'mao', 'ti', 'ngo', 'mui', 'dau', 'tuat'],
      avoid: ['hoi'],              // Xung: Ngọ
    },

    templates: {
      greeting: 'Chào bạn tuổi Tý! Người tuổi Chuột thông minh và nhạy bén lắm!',
      crystal_intro: 'Tuổi Tý hợp với Thạch Anh Tím để tăng trực giác và may mắn.',
      advice: 'Năm nay Tý nên đeo đá bảo hộ để tránh xung khắc.',
      selling: 'Amethyst là "must-have" cho tuổi Tý - tăng trí tuệ và thu hút tài lộc!',
    },
  },

  suu: {
    id: 'suu',
    name: 'Sửu',
    animal: 'Trâu',
    animalEn: 'Ox',
    emoji: '🐂',
    years: [1925, 1937, 1949, 1961, 1973, 1985, 1997, 2009, 2021, 2033],
    element: 'tho',
    direction: 'Đông Bắc',
    season: 'Cuối Đông',
    hour: '01:00 - 03:00',
    luckyNumbers: [1, 4],
    luckyColors: ['Trắng', 'Vàng', 'Xanh lá'],

    personality: {
      positive: ['Chăm chỉ', 'Đáng tin cậy', 'Kiên nhẫn', 'Thực tế', 'Trung thành'],
      negative: ['Bảo thủ', 'Cứng đầu', 'Chậm thay đổi', 'Hay giữ mối hận'],
      love: 'Chậm nhưng chắc, một khi yêu thì rất sâu đậm',
      career: 'Phù hợp: Nông nghiệp, Xây dựng, Kế toán, Quản lý',
    },

    crystals: {
      main: ['citrine', 'tigers_eye', 'jade'],
      support: ['yellow_jasper', 'bronzite', 'smoky_quartz'],
      avoid: ['malachite', 'green_aventurine'],
    },

    compatibility: {
      best: ['ti', 'dau'],         // Tam hợp: Tỵ, Dậu
      good: ['ty'],                // Lục hợp: Tý
      neutral: ['dan', 'thin', 'ngo', 'than', 'tuat', 'hoi'],
      avoid: ['mao', 'mui'],       // Xung: Mùi; Phá: Mão
    },

    templates: {
      greeting: 'Chào bạn tuổi Sửu! Người tuổi Trâu chăm chỉ và đáng tin cậy!',
      crystal_intro: 'Tuổi Sửu hợp với Citrine để thu hút tài lộc và sự ổn định.',
      advice: 'Đá vàng/nâu giúp tuổi Sửu tăng vận may trong công việc.',
      selling: 'Citrine + Mắt Hổ là combo "tài lộc" cho tuổi Sửu!',
    },
  },

  dan: {
    id: 'dan',
    name: 'Dần',
    animal: 'Hổ',
    animalEn: 'Tiger',
    emoji: '🐅',
    years: [1926, 1938, 1950, 1962, 1974, 1986, 1998, 2010, 2022, 2034],
    element: 'moc',
    direction: 'Đông Bắc',
    season: 'Đầu Xuân',
    hour: '03:00 - 05:00',
    luckyNumbers: [1, 3, 4],
    luckyColors: ['Xanh lá', 'Cam', 'Xám'],

    personality: {
      positive: ['Dũng cảm', 'Tự tin', 'Quyết đoán', 'Lãnh đạo', 'Nhiệt tình'],
      negative: ['Bốc đồng', 'Nóng nảy', 'Độc đoán', 'Hay liều lĩnh'],
      love: 'Đam mê mãnh liệt, yêu thì yêu hết mình',
      career: 'Phù hợp: Quân đội, Thể thao, Kinh doanh, Chính trị',
    },

    crystals: {
      main: ['green_aventurine', 'carnelian', 'tigers_eye'],
      support: ['citrine', 'jade', 'malachite'],
      avoid: ['black_obsidian', 'lapis_lazuli'],
    },

    compatibility: {
      best: ['ngo', 'tuat'],       // Tam hợp: Ngọ, Tuất
      good: ['hoi'],               // Lục hợp: Hợi
      neutral: ['ty', 'suu', 'mao', 'thin', 'mui', 'dau'],
      avoid: ['than', 'ti'],       // Xung: Thân; Hại: Tỵ
    },

    templates: {
      greeting: 'Chào bạn tuổi Dần! Người tuổi Hổ dũng mãnh và đầy năng lượng!',
      crystal_intro: 'Tuổi Dần hợp với Ngọc Bích Xanh để cân bằng năng lượng mạnh mẽ.',
      advice: 'Đá xanh lá giúp tuổi Dần bình tĩnh và kiểm soát cảm xúc tốt hơn.',
      selling: 'Mắt Hổ là "power stone" cho tuổi Dần - tăng uy quyền và thành công!',
    },
  },

  mao: {
    id: 'mao',
    name: 'Mão',
    animal: 'Mèo',
    animalEn: 'Cat/Rabbit',
    emoji: '🐱',
    years: [1927, 1939, 1951, 1963, 1975, 1987, 1999, 2011, 2023, 2035],
    element: 'moc',
    direction: 'Đông',
    season: 'Giữa Xuân',
    hour: '05:00 - 07:00',
    luckyNumbers: [3, 4, 9],
    luckyColors: ['Hồng', 'Tím', 'Xanh lá'],

    personality: {
      positive: ['Dịu dàng', 'Tinh tế', 'Khéo léo', 'Nhạy cảm', 'Nghệ sĩ'],
      negative: ['Nhút nhát', 'Hay lo lắng', 'Thụ động', 'Dễ tổn thương'],
      love: 'Lãng mạn, cần được yêu thương và bảo vệ',
      career: 'Phù hợp: Nghệ thuật, Thiết kế, Ngoại giao, Tư vấn',
    },

    crystals: {
      main: ['rose_quartz', 'amethyst', 'moonstone'],
      support: ['jade', 'lepidolite', 'kunzite'],
      avoid: ['carnelian', 'red_jasper'],
    },

    compatibility: {
      best: ['mui', 'hoi'],        // Tam hợp: Mùi, Hợi
      good: ['tuat'],              // Lục hợp: Tuất
      neutral: ['ty', 'dan', 'thin', 'ti', 'ngo', 'than'],
      avoid: ['suu', 'dau'],       // Xung: Dậu; Phá: Sửu
    },

    templates: {
      greeting: 'Chào bạn tuổi Mão! Người tuổi Mèo dịu dàng và tinh tế!',
      crystal_intro: 'Tuổi Mão hợp với Thạch Anh Hồng để thu hút tình yêu.',
      advice: 'Đá hồng/tím giúp tuổi Mão tự tin và bình an hơn.',
      selling: 'Rose Quartz là đá "duyên lành" cho tuổi Mão - thu hút tình yêu đích thực!',
    },
  },

  thin: {
    id: 'thin',
    name: 'Thìn',
    animal: 'Rồng',
    animalEn: 'Dragon',
    emoji: '🐉',
    years: [1928, 1940, 1952, 1964, 1976, 1988, 2000, 2012, 2024, 2036],
    element: 'tho',
    direction: 'Đông Nam',
    season: 'Cuối Xuân',
    hour: '07:00 - 09:00',
    luckyNumbers: [1, 6, 7],
    luckyColors: ['Vàng', 'Bạc', 'Xám'],

    personality: {
      positive: ['Tham vọng', 'Tự tin', 'Năng động', 'Sáng tạo', 'May mắn'],
      negative: ['Kiêu ngạo', 'Nóng tính', 'Không chịu thua', 'Hay phô trương'],
      love: 'Mạnh mẽ trong tình yêu, cần người hiểu mình',
      career: 'Phù hợp: Lãnh đạo, Kinh doanh, Nghệ thuật, Chính trị',
    },

    crystals: {
      main: ['citrine', 'clear_quartz', 'pyrite'],
      support: ['tigers_eye', 'sunstone', 'gold_sheen_obsidian'],
      avoid: ['black_tourmaline', 'lapis_lazuli'],
    },

    compatibility: {
      best: ['ty', 'than'],        // Tam hợp: Tý, Thân
      good: ['dau'],               // Lục hợp: Dậu
      neutral: ['suu', 'dan', 'mao', 'ti', 'ngo', 'mui', 'hoi'],
      avoid: ['tuat'],             // Xung: Tuất
    },

    templates: {
      greeting: 'Chào bạn tuổi Thìn! Người tuổi Rồng quyền uy và may mắn!',
      crystal_intro: 'Tuổi Thìn hợp với Citrine để tăng vận may và tài lộc.',
      advice: 'Đá vàng/trong suốt giúp tuổi Thìn tỏa sáng và thành công.',
      selling: 'Citrine + Pyrite là combo "vua" cho tuổi Thìn - thu hút tiền bạc!',
    },
  },

  ti: {
    id: 'ti',
    name: 'Tỵ',
    animal: 'Rắn',
    animalEn: 'Snake',
    emoji: '🐍',
    years: [1929, 1941, 1953, 1965, 1977, 1989, 2001, 2013, 2025, 2037],
    element: 'hoa',
    direction: 'Đông Nam',
    season: 'Đầu Hạ',
    hour: '09:00 - 11:00',
    luckyNumbers: [2, 8, 9],
    luckyColors: ['Đỏ', 'Vàng', 'Đen'],

    personality: {
      positive: ['Khôn ngoan', 'Bí ẩn', 'Trực giác mạnh', 'Quyến rũ', 'Kiên định'],
      negative: ['Đa nghi', 'Ghen tuông', 'Ít chia sẻ', 'Hay trả thù'],
      love: 'Bí ẩn và quyến rũ, cần thời gian để tin tưởng',
      career: 'Phù hợp: Tâm lý, Nghiên cứu, Tài chính, Bí mật',
    },

    crystals: {
      main: ['garnet', 'carnelian', 'black_obsidian'],
      support: ['amethyst', 'labradorite', 'ruby'],
      avoid: ['clear_quartz', 'moonstone'],
    },

    compatibility: {
      best: ['suu', 'dau'],        // Tam hợp: Sửu, Dậu
      good: ['than'],              // Lục hợp: Thân
      neutral: ['ty', 'mao', 'thin', 'ngo', 'mui', 'tuat', 'hoi'],
      avoid: ['dan'],              // Hại: Dần
    },

    templates: {
      greeting: 'Chào bạn tuổi Tỵ! Người tuổi Rắn khôn ngoan và bí ẩn!',
      crystal_intro: 'Tuổi Tỵ hợp với Garnet để tăng sức mạnh và bảo vệ.',
      advice: 'Đá đỏ/đen giúp tuổi Tỵ tăng trực giác và quyền lực.',
      selling: 'Obsidian Đen là "shield" bảo vệ cho tuổi Tỵ!',
    },
  },

  ngo: {
    id: 'ngo',
    name: 'Ngọ',
    animal: 'Ngựa',
    animalEn: 'Horse',
    emoji: '🐴',
    years: [1930, 1942, 1954, 1966, 1978, 1990, 2002, 2014, 2026, 2038],
    element: 'hoa',
    direction: 'Nam',
    season: 'Giữa Hạ',
    hour: '11:00 - 13:00',
    luckyNumbers: [2, 3, 7],
    luckyColors: ['Vàng', 'Xanh lá', 'Tím'],

    personality: {
      positive: ['Năng động', 'Tự do', 'Lạc quan', 'Thẳng thắn', 'Nhiệt tình'],
      negative: ['Nóng nảy', 'Thiếu kiên nhẫn', 'Bốc đồng', 'Hay thay đổi'],
      love: 'Đam mê và tự do, cần không gian riêng',
      career: 'Phù hợp: Du lịch, Thể thao, Sales, Truyền thông',
    },

    crystals: {
      main: ['carnelian', 'sunstone', 'citrine'],
      support: ['tigers_eye', 'fire_opal', 'orange_calcite'],
      avoid: ['aquamarine', 'blue_lace_agate'],
    },

    compatibility: {
      best: ['dan', 'tuat'],       // Tam hợp: Dần, Tuất
      good: ['mui'],               // Lục hợp: Mùi
      neutral: ['suu', 'mao', 'thin', 'ti', 'than', 'dau', 'hoi'],
      avoid: ['ty'],               // Xung: Tý
    },

    templates: {
      greeting: 'Chào bạn tuổi Ngọ! Người tuổi Ngựa năng động và tự do!',
      crystal_intro: 'Tuổi Ngọ hợp với Carnelian để tăng năng lượng và may mắn.',
      advice: 'Đá cam/vàng giúp tuổi Ngọ thành công trong sự nghiệp.',
      selling: 'Sunstone là đá "may mắn" cho tuổi Ngọ - thu hút cơ hội mới!',
    },
  },

  mui: {
    id: 'mui',
    name: 'Mùi',
    animal: 'Dê',
    animalEn: 'Goat',
    emoji: '🐐',
    years: [1931, 1943, 1955, 1967, 1979, 1991, 2003, 2015, 2027, 2039],
    element: 'tho',
    direction: 'Tây Nam',
    season: 'Cuối Hạ',
    hour: '13:00 - 15:00',
    luckyNumbers: [2, 7],
    luckyColors: ['Xanh lá', 'Đỏ', 'Tím'],

    personality: {
      positive: ['Dịu dàng', 'Sáng tạo', 'Nghệ sĩ', 'Nhân ái', 'Kiên nhẫn'],
      negative: ['Hay lo lắng', 'Phụ thuộc', 'Thiếu quyết đoán', 'Bi quan'],
      love: 'Lãng mạn và cần được bảo vệ',
      career: 'Phù hợp: Nghệ thuật, Thiết kế, Y tế, Giáo dục',
    },

    crystals: {
      main: ['jade', 'rose_quartz', 'amethyst'],
      support: ['green_aventurine', 'rhodonite', 'lepidolite'],
      avoid: ['tigers_eye', 'pyrite'],
    },

    compatibility: {
      best: ['mao', 'hoi'],        // Tam hợp: Mão, Hợi
      good: ['ngo'],               // Lục hợp: Ngọ
      neutral: ['ty', 'dan', 'thin', 'ti', 'than', 'dau', 'tuat'],
      avoid: ['suu'],              // Xung: Sửu
    },

    templates: {
      greeting: 'Chào bạn tuổi Mùi! Người tuổi Dê dịu dàng và sáng tạo!',
      crystal_intro: 'Tuổi Mùi hợp với Ngọc Bích để tăng bình an và may mắn.',
      advice: 'Đá xanh/hồng giúp tuổi Mùi tự tin và sáng tạo hơn.',
      selling: 'Jade là đá "bình an" cho tuổi Mùi - thu hút sức khỏe và tài lộc!',
    },
  },

  than: {
    id: 'than',
    name: 'Thân',
    animal: 'Khỉ',
    animalEn: 'Monkey',
    emoji: '🐒',
    years: [1932, 1944, 1956, 1968, 1980, 1992, 2004, 2016, 2028, 2040],
    element: 'kim',
    direction: 'Tây Nam',
    season: 'Đầu Thu',
    hour: '15:00 - 17:00',
    luckyNumbers: [4, 9],
    luckyColors: ['Trắng', 'Xanh dương', 'Vàng'],

    personality: {
      positive: ['Thông minh', 'Nhanh nhẹn', 'Hài hước', 'Linh hoạt', 'Sáng tạo'],
      negative: ['Hay lừa dối', 'Bất ổn', 'Thiếu kiên nhẫn', 'Hay khoe khoang'],
      love: 'Vui vẻ và hài hước, nhưng hay thay đổi',
      career: 'Phù hợp: Công nghệ, Giải trí, Marketing, Nghiên cứu',
    },

    crystals: {
      main: ['clear_quartz', 'citrine', 'moonstone'],
      support: ['white_jade', 'howlite', 'blue_lace_agate'],
      avoid: ['garnet', 'carnelian'],
    },

    compatibility: {
      best: ['ty', 'thin'],        // Tam hợp: Tý, Thìn
      good: ['ti'],                // Lục hợp: Tỵ
      neutral: ['suu', 'mao', 'ngo', 'mui', 'dau', 'tuat', 'hoi'],
      avoid: ['dan'],              // Xung: Dần
    },

    templates: {
      greeting: 'Chào bạn tuổi Thân! Người tuổi Khỉ thông minh và hài hước!',
      crystal_intro: 'Tuổi Thân hợp với Thạch Anh Trắng để tăng trí tuệ.',
      advice: 'Đá trắng/trong suốt giúp tuổi Thân sáng suốt và may mắn.',
      selling: 'Clear Quartz là đá "master" cho tuổi Thân - tăng sự minh mẫn!',
    },
  },

  dau: {
    id: 'dau',
    name: 'Dậu',
    animal: 'Gà',
    animalEn: 'Rooster',
    emoji: '🐓',
    years: [1933, 1945, 1957, 1969, 1981, 1993, 2005, 2017, 2029, 2041],
    element: 'kim',
    direction: 'Tây',
    season: 'Giữa Thu',
    hour: '17:00 - 19:00',
    luckyNumbers: [5, 7, 8],
    luckyColors: ['Vàng', 'Nâu', 'Vàng kim'],

    personality: {
      positive: ['Chăm chỉ', 'Tỉ mỉ', 'Trung thực', 'Can đảm', 'Thực tế'],
      negative: ['Hay phê bình', 'Kiêu ngạo', 'Cứng nhắc', 'Hay lo lắng'],
      love: 'Thận trọng trong tình yêu, cần thời gian để tin tưởng',
      career: 'Phù hợp: Quản lý, Kế toán, Quân đội, Nghiên cứu',
    },

    crystals: {
      main: ['citrine', 'pyrite', 'golden_topaz'],
      support: ['tigers_eye', 'bronzite', 'yellow_jasper'],
      avoid: ['rose_quartz', 'kunzite'],
    },

    compatibility: {
      best: ['suu', 'ti'],         // Tam hợp: Sửu, Tỵ
      good: ['thin'],              // Lục hợp: Thìn
      neutral: ['ty', 'dan', 'ngo', 'mui', 'than', 'tuat', 'hoi'],
      avoid: ['mao'],              // Xung: Mão
    },

    templates: {
      greeting: 'Chào bạn tuổi Dậu! Người tuổi Gà chăm chỉ và can đảm!',
      crystal_intro: 'Tuổi Dậu hợp với Citrine để thu hút tài lộc.',
      advice: 'Đá vàng/nâu giúp tuổi Dậu thành công và ổn định.',
      selling: 'Citrine + Pyrite là combo "vàng" cho tuổi Dậu - thu hút tiền bạc!',
    },
  },

  tuat: {
    id: 'tuat',
    name: 'Tuất',
    animal: 'Chó',
    animalEn: 'Dog',
    emoji: '🐕',
    years: [1934, 1946, 1958, 1970, 1982, 1994, 2006, 2018, 2030, 2042],
    element: 'tho',
    direction: 'Tây Bắc',
    season: 'Cuối Thu',
    hour: '19:00 - 21:00',
    luckyNumbers: [3, 4, 9],
    luckyColors: ['Xanh lá', 'Đỏ', 'Tím'],

    personality: {
      positive: ['Trung thành', 'Thẳng thắn', 'Đáng tin cậy', 'Dũng cảm', 'Công bằng'],
      negative: ['Hay lo lắng', 'Bảo thủ', 'Bi quan', 'Cứng đầu'],
      love: 'Trung thành và tận tụy, bảo vệ người yêu',
      career: 'Phù hợp: Công an, Luật sư, Bác sĩ, Xã hội',
    },

    crystals: {
      main: ['jade', 'green_aventurine', 'amethyst'],
      support: ['rhodonite', 'unakite', 'moss_agate'],
      avoid: ['citrine', 'sunstone'],
    },

    compatibility: {
      best: ['dan', 'ngo'],        // Tam hợp: Dần, Ngọ
      good: ['mao'],               // Lục hợp: Mão
      neutral: ['ty', 'suu', 'ti', 'mui', 'than', 'dau', 'hoi'],
      avoid: ['thin'],             // Xung: Thìn
    },

    templates: {
      greeting: 'Chào bạn tuổi Tuất! Người tuổi Chó trung thành và đáng tin cậy!',
      crystal_intro: 'Tuổi Tuất hợp với Ngọc Bích để tăng may mắn và bảo vệ.',
      advice: 'Đá xanh lá/tím giúp tuổi Tuất bình an và tự tin.',
      selling: 'Jade là đá "bảo hộ" cho tuổi Tuất - thu hút may mắn và sức khỏe!',
    },
  },

  hoi: {
    id: 'hoi',
    name: 'Hợi',
    animal: 'Heo',
    animalEn: 'Pig',
    emoji: '🐷',
    years: [1935, 1947, 1959, 1971, 1983, 1995, 2007, 2019, 2031, 2043],
    element: 'thuy',
    direction: 'Tây Bắc',
    season: 'Đầu Đông',
    hour: '21:00 - 23:00',
    luckyNumbers: [2, 5, 8],
    luckyColors: ['Vàng', 'Xám', 'Nâu'],

    personality: {
      positive: ['Hiền lành', 'Hào phóng', 'Trung thực', 'Kiên nhẫn', 'May mắn'],
      negative: ['Cả tin', 'Lười biếng', 'Hay tiêu tiền', 'Thiếu quyết đoán'],
      love: 'Lãng mạn và chung thủy, thích cuộc sống gia đình',
      career: 'Phù hợp: Ẩm thực, Nghệ thuật, Từ thiện, Giải trí',
    },

    crystals: {
      main: ['amethyst', 'lapis_lazuli', 'sodalite'],
      support: ['moonstone', 'aquamarine', 'blue_lace_agate'],
      avoid: ['carnelian', 'fire_opal'],
    },

    compatibility: {
      best: ['mao', 'mui'],        // Tam hợp: Mão, Mùi
      good: ['dan'],               // Lục hợp: Dần
      neutral: ['suu', 'thin', 'ti', 'ngo', 'than', 'dau', 'tuat'],
      avoid: ['ty'],               // Hại: Tỵ (some say Tý xung)
    },

    templates: {
      greeting: 'Chào bạn tuổi Hợi! Người tuổi Heo hiền lành và may mắn!',
      crystal_intro: 'Tuổi Hợi hợp với Thạch Anh Tím để tăng trí tuệ và bình an.',
      advice: 'Đá xanh dương/tím giúp tuổi Hợi tập trung và may mắn.',
      selling: 'Amethyst là đá "trí tuệ" cho tuổi Hợi - tăng may mắn và bình an!',
    },
  },
};

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Lấy tuổi từ năm sinh
 * @param {number} birthYear - Năm sinh
 * @returns {Object} Zodiac data
 */
export function getZodiacByYear(birthYear) {
  const zodiacOrder = ['than', 'dau', 'tuat', 'hoi', 'ty', 'suu', 'dan', 'mao', 'thin', 'ti', 'ngo', 'mui'];
  const index = (birthYear - 4) % 12;
  const zodiacId = zodiacOrder[index];
  return ZODIACS[zodiacId];
}

/**
 * Lấy tuổi từ ID
 * @param {string} zodiacId - ID tuổi (ty, suu, dan, ...)
 * @returns {Object} Zodiac data
 */
export function getZodiac(zodiacId) {
  return ZODIACS[zodiacId?.toLowerCase()] || null;
}

/**
 * Tính tương hợp giữa 2 tuổi
 * @param {string} zodiac1
 * @param {string} zodiac2
 * @returns {Object} { score, relationship, description }
 */
export function calculateZodiacCompatibility(zodiac1, zodiac2) {
  const z1 = ZODIACS[zodiac1?.toLowerCase()];
  const z2 = ZODIACS[zodiac2?.toLowerCase()];

  if (!z1 || !z2) return { score: 0, relationship: 'unknown' };

  const z2Id = zodiac2.toLowerCase();

  if (z1.compatibility.best.includes(z2Id)) {
    return {
      score: 1,
      relationship: 'Tam Hợp / Lục Hợp',
      description: `${z1.animal} và ${z2.animal} rất hợp nhau, hỗ trợ lẫn nhau`,
    };
  }

  if (z1.compatibility.good.includes(z2Id)) {
    return {
      score: 0.8,
      relationship: 'Lục Hợp',
      description: `${z1.animal} và ${z2.animal} hợp nhau, có thể hỗ trợ tốt`,
    };
  }

  if (z1.compatibility.avoid.includes(z2Id)) {
    return {
      score: -0.5,
      relationship: 'Xung / Phá',
      description: `${z1.animal} và ${z2.animal} có thể xung khắc, cần hóa giải`,
    };
  }

  return {
    score: 0.5,
    relationship: 'Bình thường',
    description: `${z1.animal} và ${z2.animal} không có quan hệ đặc biệt`,
  };
}

/**
 * Lấy đá phù hợp cho tuổi
 * @param {string} zodiacId
 * @returns {Object} { main, support, avoid }
 */
export function getCrystalsForZodiac(zodiacId) {
  const zodiac = ZODIACS[zodiacId?.toLowerCase()];
  if (!zodiac) return null;
  return zodiac.crystals;
}

/**
 * Lấy template cho tuổi
 * @param {string} zodiacId
 * @param {string} templateType
 * @returns {string}
 */
export function getZodiacTemplate(zodiacId, templateType) {
  const zodiac = ZODIACS[zodiacId?.toLowerCase()];
  if (!zodiac) return '';
  return zodiac.templates[templateType] || '';
}

/**
 * Lấy tất cả tuổi
 * @returns {Array}
 */
export function getAllZodiacs() {
  return Object.values(ZODIACS);
}

/**
 * Tìm tuổi tương hợp nhất
 * @param {string} zodiacId
 * @returns {Array} Danh sách tuổi tương hợp
 */
export function getCompatibleZodiacs(zodiacId) {
  const zodiac = ZODIACS[zodiacId?.toLowerCase()];
  if (!zodiac) return [];

  const compatible = [...zodiac.compatibility.best, ...zodiac.compatibility.good];
  return compatible.map(id => ZODIACS[id]);
}

/**
 * Kiểm tra đá có phù hợp với tuổi không
 * @param {string} crystalId
 * @param {string} zodiacId
 * @returns {Object} { isCompatible, level, reason }
 */
export function checkCrystalZodiacCompatibility(crystalId, zodiacId) {
  const zodiac = ZODIACS[zodiacId?.toLowerCase()];
  if (!zodiac) return { isCompatible: false, level: 'unknown' };

  const { main, support, avoid } = zodiac.crystals;

  if (main.includes(crystalId)) {
    return {
      isCompatible: true,
      level: 'excellent',
      reason: `${crystalId} là đá chủ đạo cho tuổi ${zodiac.animal}`,
    };
  }

  if (support.includes(crystalId)) {
    return {
      isCompatible: true,
      level: 'good',
      reason: `${crystalId} hỗ trợ tốt cho tuổi ${zodiac.animal}`,
    };
  }

  if (avoid.includes(crystalId)) {
    return {
      isCompatible: false,
      level: 'avoid',
      reason: `${crystalId} không nên dùng cho tuổi ${zodiac.animal}`,
    };
  }

  return {
    isCompatible: true,
    level: 'neutral',
    reason: `${crystalId} có thể dùng cho tuổi ${zodiac.animal}`,
  };
}

// ===========================================
// SELLING POINTS FOR LIVESTREAM
// ===========================================

export const ZODIAC_SELLING_POINTS = {
  ty: { hook: 'Tuổi TÝ thông minh!', stone: 'Amethyst', pitch: 'Tăng trí tuệ và may mắn!' },
  suu: { hook: 'Tuổi SỬU chăm chỉ!', stone: 'Citrine', pitch: 'Thu hút tài lộc ổn định!' },
  dan: { hook: 'Tuổi DẦN dũng mãnh!', stone: 'Mắt Hổ', pitch: 'Tăng sức mạnh và thành công!' },
  mao: { hook: 'Tuổi MÃO dịu dàng!', stone: 'Rose Quartz', pitch: 'Thu hút tình yêu đích thực!' },
  thin: { hook: 'Tuổi THÌN may mắn!', stone: 'Citrine', pitch: 'Vận may và quyền lực!' },
  ti: { hook: 'Tuổi TỴ khôn ngoan!', stone: 'Garnet', pitch: 'Bảo vệ và tăng sức mạnh!' },
  ngo: { hook: 'Tuổi NGỌ năng động!', stone: 'Carnelian', pitch: 'Năng lượng và cơ hội mới!' },
  mui: { hook: 'Tuổi MÙI sáng tạo!', stone: 'Jade', pitch: 'Bình an và tài lộc!' },
  than: { hook: 'Tuổi THÂN linh hoạt!', stone: 'Clear Quartz', pitch: 'Tăng trí tuệ và sự minh mẫn!' },
  dau: { hook: 'Tuổi DẬU can đảm!', stone: 'Citrine', pitch: 'Thu hút tiền bạc!' },
  tuat: { hook: 'Tuổi TUẤT trung thành!', stone: 'Jade', pitch: 'May mắn và bảo hộ!' },
  hoi: { hook: 'Tuổi HỢI may mắn!', stone: 'Amethyst', pitch: 'Trí tuệ và bình an!' },
};

// ===========================================
// CURRENT YEAR PREDICTIONS
// ===========================================

export const YEARLY_PREDICTIONS = {
  2025: {
    year_animal: 'ti', // Năm Ất Tỵ 2025
    lucky_zodiacs: ['suu', 'dau', 'than'],
    caution_zodiacs: ['dan', 'hoi'],
    general_advice: 'Năm Ất Tỵ 2025 thuộc hành Hỏa, người mệnh Mộc/Kim cần đeo đá bảo hộ.',
  },
};

export default {
  ZODIACS,
  ZODIAC_SELLING_POINTS,
  YEARLY_PREDICTIONS,
  getZodiacByYear,
  getZodiac,
  calculateZodiacCompatibility,
  getCrystalsForZodiac,
  getZodiacTemplate,
  getAllZodiacs,
  getCompatibleZodiacs,
  checkCrystalZodiacCompatibility,
};
