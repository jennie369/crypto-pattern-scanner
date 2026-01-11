/**
 * Crystal Knowledge Database
 * Complete crystal data for AI Livestream Commerce
 *
 * Features:
 * - 20+ crystal types with full properties
 * - Selling points for livestream
 * - Objection handlers
 * - Element/Zodiac mappings
 * - Price ranges
 */

// ============================================================================
// CRYSTAL DATABASE
// ============================================================================

export const CRYSTALS = {
  rose_quartz: {
    id: 'rose_quartz',
    name: 'Rose Quartz',
    vietnamese_name: 'Thạch Anh Hồng',
    element: 'earth',
    chakra: 'heart',
    zodiac_signs: ['taurus', 'libra', 'cancer'],
    colors: ['pink', 'rose'],
    hardness: 7,
    price_range: { min: 150000, max: 2000000 },
    benefits: [
      'Thu hút tình yêu và duyên lành',
      'Hàn gắn trái tim tổn thương',
      'Tăng cường tình yêu bản thân',
      'Cải thiện các mối quan hệ',
      'Mang lại sự bình an nội tâm',
    ],
    healing: 'Chữa lành cảm xúc, giảm stress, cải thiện giấc ngủ',
    placement: 'Phòng ngủ, bàn làm việc, gần tim khi đeo',
    cleansing: 'Ánh trăng, nước muối, xô thơm',
    frequency: 350, // Hz
  },

  amethyst: {
    id: 'amethyst',
    name: 'Amethyst',
    vietnamese_name: 'Thạch Anh Tím',
    element: 'air',
    chakra: 'third_eye',
    zodiac_signs: ['pisces', 'virgo', 'aquarius', 'capricorn'],
    colors: ['purple', 'violet'],
    hardness: 7,
    price_range: { min: 200000, max: 3000000 },
    benefits: [
      'Tăng cường trực giác và tâm linh',
      'Giúp ngủ ngon, giảm ác mộng',
      'Thanh lọc năng lượng tiêu cực',
      'Hỗ trợ thiền định',
      'Giảm stress và lo âu',
    ],
    healing: 'Cải thiện giấc ngủ, giảm đau đầu, thanh lọc tâm trí',
    placement: 'Đầu giường, bàn thiền, góc phòng',
    cleansing: 'Ánh trăng (tránh nắng), xô thơm',
    frequency: 417,
  },

  citrine: {
    id: 'citrine',
    name: 'Citrine',
    vietnamese_name: 'Thạch Anh Vàng',
    element: 'fire',
    chakra: 'solar_plexus',
    zodiac_signs: ['gemini', 'aries', 'leo', 'libra'],
    colors: ['yellow', 'golden'],
    hardness: 7,
    price_range: { min: 300000, max: 5000000 },
    benefits: [
      'Thu hút tiền tài và thịnh vượng',
      'Tăng cường sự tự tin',
      'Mang lại năng lượng tích cực',
      'Hỗ trợ sự nghiệp thành công',
      'Thúc đẩy sáng tạo',
    ],
    healing: 'Tăng năng lượng, cải thiện tiêu hóa, giảm trầm cảm',
    placement: 'Góc tài lộc (Đông Nam), két sắt, ví tiền',
    cleansing: 'Ánh nắng sớm, xô thơm (tự thanh lọc)',
    frequency: 528,
  },

  clear_quartz: {
    id: 'clear_quartz',
    name: 'Clear Quartz',
    vietnamese_name: 'Thạch Anh Trắng',
    element: 'all',
    chakra: 'crown',
    zodiac_signs: ['all'],
    colors: ['clear', 'white'],
    hardness: 7,
    price_range: { min: 100000, max: 1500000 },
    benefits: [
      'Khuếch đại năng lượng các đá khác',
      'Làm sạch và thanh lọc',
      'Tăng cường tập trung',
      'Hỗ trợ thiền định',
      'Cân bằng các luân xa',
    ],
    healing: 'Tăng cường miễn dịch, cân bằng năng lượng toàn thân',
    placement: 'Mọi nơi, kết hợp với đá khác',
    cleansing: 'Nước, ánh nắng, ánh trăng, xô thơm',
    frequency: 786,
  },

  black_tourmaline: {
    id: 'black_tourmaline',
    name: 'Black Tourmaline',
    vietnamese_name: 'Tourmaline Đen',
    element: 'earth',
    chakra: 'root',
    zodiac_signs: ['capricorn', 'scorpio'],
    colors: ['black'],
    hardness: 7.5,
    price_range: { min: 200000, max: 2500000 },
    benefits: [
      'Bảo vệ khỏi năng lượng tiêu cực',
      'Chắn sóng điện từ',
      'Grounding - Kết nối đất',
      'Giảm lo âu và sợ hãi',
      'Bảo vệ tâm linh',
    ],
    healing: 'Giải độc, tăng cường tuần hoàn, bảo vệ EMF',
    placement: 'Cửa ra vào, 4 góc nhà, gần thiết bị điện tử',
    cleansing: 'Nước muối, chôn đất, ánh trăng',
    frequency: 174,
  },

  jade: {
    id: 'jade',
    name: 'Jade',
    vietnamese_name: 'Ngọc Bích',
    element: 'wood',
    chakra: 'heart',
    zodiac_signs: ['aries', 'taurus', 'gemini', 'libra'],
    colors: ['green', 'white', 'lavender'],
    hardness: 6.5,
    price_range: { min: 500000, max: 10000000 },
    benefits: [
      'Thu hút may mắn và thịnh vượng',
      'Bảo vệ và trường thọ',
      'Mang lại sự hài hòa',
      'Tăng cường trí tuệ',
      'Biểu tượng của sự cao quý',
    ],
    healing: 'Giải độc, hỗ trợ thận, cân bằng hormone',
    placement: 'Đeo sát người, góc tài lộc, bàn thờ',
    cleansing: 'Nước sạch, ánh trăng, không dùng muối',
    frequency: 639,
  },

  obsidian: {
    id: 'obsidian',
    name: 'Obsidian',
    vietnamese_name: 'Hắc Diện Thạch',
    element: 'fire',
    chakra: 'root',
    zodiac_signs: ['scorpio', 'sagittarius'],
    colors: ['black', 'rainbow', 'snowflake'],
    hardness: 5.5,
    price_range: { min: 150000, max: 2000000 },
    benefits: [
      'Bảo vệ mạnh mẽ',
      'Giải phóng năng lượng tiêu cực',
      'Tăng cường sự thật và trung thực',
      'Hỗ trợ chữa lành trauma',
      'Cắt đứt dây ràng buộc tiêu cực',
    ],
    healing: 'Giải độc, giảm đau, hỗ trợ tiêu hóa',
    placement: 'Cửa ra vào, đeo tay trái',
    cleansing: 'Xô thơm, ánh trăng, không dùng nước',
    frequency: 285,
  },

  tiger_eye: {
    id: 'tiger_eye',
    name: 'Tiger Eye',
    vietnamese_name: 'Mắt Hổ',
    element: 'fire',
    chakra: 'solar_plexus',
    zodiac_signs: ['leo', 'capricorn'],
    colors: ['golden', 'brown'],
    hardness: 7,
    price_range: { min: 150000, max: 1500000 },
    benefits: [
      'Tăng cường sự tự tin và dũng cảm',
      'Bảo vệ khỏi năng lượng xấu',
      'Thu hút may mắn trong kinh doanh',
      'Tăng cường ý chí và quyết tâm',
      'Cân bằng cảm xúc',
    ],
    healing: 'Tăng cường thị lực, hỗ trợ xương khớp',
    placement: 'Đeo tay phải, phòng làm việc',
    cleansing: 'Ánh nắng sớm, xô thơm',
    frequency: 396,
  },

  lapis_lazuli: {
    id: 'lapis_lazuli',
    name: 'Lapis Lazuli',
    vietnamese_name: 'Thanh Kim Thạch',
    element: 'water',
    chakra: 'throat',
    zodiac_signs: ['sagittarius', 'libra'],
    colors: ['blue', 'gold flecks'],
    hardness: 5.5,
    price_range: { min: 300000, max: 4000000 },
    benefits: [
      'Tăng cường giao tiếp và biểu đạt',
      'Kích hoạt trí tuệ và sáng tạo',
      'Hỗ trợ sự thật và trung thực',
      'Tăng cường trực giác',
      'Kết nối tâm linh',
    ],
    healing: 'Giảm đau đầu, hỗ trợ họng, cải thiện giấc ngủ',
    placement: 'Đeo gần cổ, phòng làm việc',
    cleansing: 'Ánh trăng, xô thơm, không dùng nước',
    frequency: 741,
  },

  moonstone: {
    id: 'moonstone',
    name: 'Moonstone',
    vietnamese_name: 'Đá Mặt Trăng',
    element: 'water',
    chakra: 'sacral',
    zodiac_signs: ['cancer', 'libra', 'scorpio'],
    colors: ['white', 'rainbow', 'peach'],
    hardness: 6,
    price_range: { min: 200000, max: 3000000 },
    benefits: [
      'Tăng cường năng lượng nữ tính',
      'Hỗ trợ trực giác và tâm linh',
      'Cân bằng cảm xúc',
      'Bảo vệ khi du lịch',
      'Kết nối với chu kỳ mặt trăng',
    ],
    healing: 'Cân bằng hormone, hỗ trợ sinh sản, giảm PMS',
    placement: 'Đeo sát người, đầu giường',
    cleansing: 'Ánh trăng (đặc biệt trăng tròn), nước',
    frequency: 432,
  },

  carnelian: {
    id: 'carnelian',
    name: 'Carnelian',
    vietnamese_name: 'Mã Não Đỏ',
    element: 'fire',
    chakra: 'sacral',
    zodiac_signs: ['aries', 'leo', 'virgo'],
    colors: ['orange', 'red'],
    hardness: 7,
    price_range: { min: 150000, max: 1500000 },
    benefits: [
      'Tăng cường năng lượng và động lực',
      'Thúc đẩy sáng tạo',
      'Tăng cường sự tự tin',
      'Hỗ trợ tình dục và sinh sản',
      'Mang lại can đảm',
    ],
    healing: 'Tăng tuần hoàn, hỗ trợ tử cung, tăng năng lượng',
    placement: 'Đeo tay phải, phòng ngủ',
    cleansing: 'Ánh nắng, nước',
    frequency: 396,
  },

  aventurine: {
    id: 'aventurine',
    name: 'Green Aventurine',
    vietnamese_name: 'Thạch Anh Xanh',
    element: 'earth',
    chakra: 'heart',
    zodiac_signs: ['aries', 'leo'],
    colors: ['green'],
    hardness: 7,
    price_range: { min: 100000, max: 1000000 },
    benefits: [
      'Thu hút may mắn và cơ hội',
      'Hỗ trợ tài chính và đầu tư',
      'Tăng cường sức khỏe tim mạch',
      'Mang lại sự lạc quan',
      'Giảm stress',
    ],
    healing: 'Hỗ trợ tim mạch, giảm cholesterol, chống viêm',
    placement: 'Ví tiền, két sắt, góc tài lộc',
    cleansing: 'Nước, ánh nắng nhẹ, xô thơm',
    frequency: 528,
  },

  pyrite: {
    id: 'pyrite',
    name: 'Pyrite',
    vietnamese_name: 'Đá Pyrit (Vàng Ngu)',
    element: 'fire',
    chakra: 'solar_plexus',
    zodiac_signs: ['leo'],
    colors: ['gold', 'metallic'],
    hardness: 6.5,
    price_range: { min: 100000, max: 800000 },
    benefits: [
      'Thu hút tiền tài và thịnh vượng',
      'Bảo vệ khỏi năng lượng tiêu cực',
      'Tăng cường sự tự tin',
      'Hỗ trợ kinh doanh',
      'Kích hoạt năng lượng nam tính',
    ],
    healing: 'Tăng cường phổi, hỗ trợ xương',
    placement: 'Góc tài lộc, bàn làm việc, két sắt',
    cleansing: 'Xô thơm, KHÔNG dùng nước (bị oxy hóa)',
    frequency: 528,
  },

  labradorite: {
    id: 'labradorite',
    name: 'Labradorite',
    vietnamese_name: 'Đá Labrado',
    element: 'water',
    chakra: 'third_eye',
    zodiac_signs: ['leo', 'scorpio', 'sagittarius'],
    colors: ['gray', 'blue flash', 'rainbow'],
    hardness: 6.5,
    price_range: { min: 300000, max: 3000000 },
    benefits: [
      'Tăng cường trực giác và tâm linh',
      'Bảo vệ aura',
      'Hỗ trợ transformation',
      'Giảm lo âu',
      'Kích hoạt khả năng psychic',
    ],
    healing: 'Cân bằng hormone, hỗ trợ mắt, giảm stress',
    placement: 'Đeo gần tim, bàn thiền',
    cleansing: 'Ánh trăng, xô thơm',
    frequency: 852,
  },

  aquamarine: {
    id: 'aquamarine',
    name: 'Aquamarine',
    vietnamese_name: 'Ngọc Biển',
    element: 'water',
    chakra: 'throat',
    zodiac_signs: ['pisces', 'aries', 'gemini'],
    colors: ['light blue', 'sea green'],
    hardness: 7.5,
    price_range: { min: 500000, max: 8000000 },
    benefits: [
      'Mang lại sự bình an và tĩnh lặng',
      'Hỗ trợ giao tiếp rõ ràng',
      'Bảo vệ khi đi biển',
      'Giảm stress và lo âu',
      'Tăng cường sự can đảm',
    ],
    healing: 'Hỗ trợ họng, giảm viêm, cải thiện thị lực',
    placement: 'Đeo gần cổ, phòng thiền',
    cleansing: 'Nước biển, ánh trăng',
    frequency: 639,
  },

  rhodonite: {
    id: 'rhodonite',
    name: 'Rhodonite',
    vietnamese_name: 'Đá Rhodonite',
    element: 'earth',
    chakra: 'heart',
    zodiac_signs: ['taurus', 'scorpio'],
    colors: ['pink', 'black veins'],
    hardness: 6,
    price_range: { min: 150000, max: 1500000 },
    benefits: [
      'Chữa lành vết thương tình cảm',
      'Tha thứ và buông bỏ',
      'Tăng cường tình yêu bản thân',
      'Hỗ trợ trong khủng hoảng',
      'Cân bằng cảm xúc',
    ],
    healing: 'Chữa lành tim, hỗ trợ khớp, giảm viêm',
    placement: 'Đeo gần tim, phòng ngủ',
    cleansing: 'Ánh trăng, xô thơm, nước nhẹ',
    frequency: 417,
  },

  lepidolite: {
    id: 'lepidolite',
    name: 'Lepidolite',
    vietnamese_name: 'Đá Lepidolite',
    element: 'water',
    chakra: 'third_eye',
    zodiac_signs: ['libra', 'pisces'],
    colors: ['purple', 'lavender'],
    hardness: 3,
    price_range: { min: 200000, max: 1500000 },
    benefits: [
      'Giảm stress và lo âu',
      'Hỗ trợ giấc ngủ',
      'Cân bằng tâm trạng',
      'Chứa lithium tự nhiên',
      'Hỗ trợ điều trị trầm cảm',
    ],
    healing: 'Giảm lo âu, hỗ trợ thần kinh, cải thiện giấc ngủ',
    placement: 'Đầu giường, đeo gần tim',
    cleansing: 'Ánh trăng, KHÔNG dùng nước',
    frequency: 285,
  },

  blue_lace_agate: {
    id: 'blue_lace_agate',
    name: 'Blue Lace Agate',
    vietnamese_name: 'Mã Não Xanh Dương',
    element: 'water',
    chakra: 'throat',
    zodiac_signs: ['pisces', 'gemini'],
    colors: ['light blue', 'white bands'],
    hardness: 7,
    price_range: { min: 200000, max: 2000000 },
    benefits: [
      'Hỗ trợ giao tiếp nhẹ nhàng',
      'Giảm stress và lo âu',
      'Mang lại sự bình an',
      'Hỗ trợ nói trước đám đông',
      'Làm dịu tâm trí',
    ],
    healing: 'Hỗ trợ họng, giảm viêm, hạ huyết áp',
    placement: 'Đeo gần cổ, bàn làm việc',
    cleansing: 'Nước, ánh trăng, xô thơm',
    frequency: 639,
  },
};

// ============================================================================
// SELLING POINTS CHO LIVESTREAM
// ============================================================================

export const CRYSTAL_SELLING_POINTS = {
  rose_quartz: {
    quick_pitch: 'Đá của TÌNH YÊU - Thu hút duyên lành, hàn gắn trái tim 💗',
    selling_points: [
      'Bestseller số 1 tại YinYang Masters',
      'Phù hợp với tuổi Tý, Mão, Dậu theo phong thủy',
      'Đá thật 100%, có giấy chứng nhận',
      'Tặng kèm dây đeo cao cấp',
      'Tần số 350Hz - tần số của tình yêu',
    ],
    objection_handlers: {
      'đắt quá': 'Dạ, đây là đá thật chất lượng cao ạ. Em có mẫu size nhỏ hơn với giá mềm hơn từ 150k, để em gợi ý nha!',
      'fake không': 'Dạ, tất cả sản phẩm đều có giấy chứng nhận, anh/chị yên tâm ạ. Em gửi hình thực tế và video nhé!',
      'ship bao lâu': 'Dạ ship nội thành 1-2 ngày, ngoại thành 3-5 ngày ạ. Free ship cho đơn từ 500k!',
      'có tác dụng không': 'Dạ, Rose Quartz là đá được nghiên cứu khoa học về tần số chữa lành. Nhiều khách feedback tích cực lắm ạ!',
    },
    upsell_products: ['amethyst', 'clear_quartz', 'rhodonite'],
    cross_sell: 'Kết hợp với Thạch Anh Tím để tăng trực giác về tình yêu!',
    combo_discount: 'Combo Rose Quartz + Amethyst giảm 15%!',
  },

  amethyst: {
    quick_pitch: 'Đá của TRÍ TUỆ - Tăng trực giác, ngủ ngon, giảm stress 💜',
    selling_points: [
      'Top 3 bestseller',
      'Phù hợp với Song Ngư, Bọ Cạp, Ma Kết',
      'Giúp ngủ ngon, giảm ác mộng',
      'Đặt đầu giường hoặc bàn làm việc',
      'Tần số 417Hz - tần số thanh lọc',
    ],
    objection_handlers: {
      'đắt quá': 'Dạ, Amethyst chất lượng cao có màu tím đậm đẹp lắm ạ. Đầu tư cho sức khỏe và giấc ngủ đáng lắm!',
      'có tác dụng không': 'Dạ, nhiều khách hàng feedback ngủ ngon hơn hẳn. Em gửi review của khách nhé!',
      'màu phai không': 'Dạ, đá thật không phai màu ạ. Chỉ cần tránh ánh nắng trực tiếp lâu là được!',
    },
    upsell_products: ['rose_quartz', 'citrine', 'lepidolite'],
    cross_sell: 'Combo với Rose Quartz - Ngủ ngon, tình yêu viên mãn!',
    combo_discount: 'Combo 3 đá Thạch Anh giảm 20%!',
  },

  citrine: {
    quick_pitch: 'Đá của TÀI LỘC - Thu hút tiền bạc, thịnh vượng 💛',
    selling_points: [
      'Đá may mắn số 1 cho người kinh doanh',
      'Không cần thanh tẩy thường xuyên',
      'Phù hợp mệnh Hỏa, Thổ',
      'Đặt góc Đông Nam để kích hoạt tài lộc',
      'Tần số 528Hz - tần số thịnh vượng',
    ],
    objection_handlers: {
      'đắt quá': 'Dạ, Citrine thật rất hiếm và quý ạ. Đầu tư cho tài lộc mà! Em có size nhỏ hơn với giá tốt hơn!',
      'fake không': 'Dạ, Citrine thật có màu vàng nhạt tự nhiên, không quá đậm. Em có giấy chứng nhận đầy đủ!',
      'có hiệu quả không': 'Dạ, nhiều anh chị kinh doanh đeo và feedback doanh thu tăng. Quan trọng là năng lượng tích cực ạ!',
    },
    upsell_products: ['pyrite', 'jade', 'tiger_eye'],
    cross_sell: 'Combo với Pyrite - Sức mạnh tài chính gấp đôi!',
    combo_discount: 'Combo Tài Lộc (Citrine + Pyrite) giảm 15%!',
  },

  black_tourmaline: {
    quick_pitch: 'Đá BẢO VỆ - Chắn năng lượng xấu, chống sóng điện từ 🖤',
    selling_points: [
      'Bảo vệ 24/7 khỏi negative energy',
      'Chặn sóng điện từ từ điện thoại, laptop',
      'Phù hợp mọi mệnh, mọi tuổi',
      'Đặt 4 góc nhà để tạo lá chắn',
      'Grounding - Kết nối đất mạnh mẽ',
    ],
    objection_handlers: {
      'đắt quá': 'Dạ, Tourmaline đen là đá bảo vệ mạnh nhất. 1 viên bảo vệ cả gia đình ạ!',
      'có cần không': 'Dạ, thời đại digital này sóng điện từ rất nhiều. Ai cũng cần 1 viên bảo vệ ạ!',
    },
    upsell_products: ['obsidian', 'clear_quartz'],
    cross_sell: 'Combo với Thạch Anh Trắng để khuếch đại bảo vệ!',
    combo_discount: 'Bộ Bảo Vệ Gia Đình (4 viên) giảm 25%!',
  },

  jade: {
    quick_pitch: 'Đá NGỌC QUÝ - May mắn, trường thọ, thịnh vượng 💚',
    selling_points: [
      'Biểu tượng của sự cao quý từ ngàn năm',
      'Đá truyền thống của người Việt',
      'Bảo vệ và mang lại may mắn',
      'Ngọc càng đeo càng đẹp, càng bóng',
      'Giữ giá trị theo thời gian',
    ],
    objection_handlers: {
      'đắt quá': 'Dạ, Ngọc Bích thật là đầu tư, giữ giá trị theo thời gian. Còn có ý nghĩa gia truyền nữa ạ!',
      'phân biệt thật giả': 'Dạ, ngọc thật có cảm giác mát, nặng tay, không bị xước dễ. Em có giấy chứng nhận ạ!',
    },
    upsell_products: ['aventurine', 'citrine'],
    cross_sell: 'Combo Ngọc Bích + Thạch Anh Vàng cho tài lộc đỉnh cao!',
    combo_discount: 'Combo Ngọc Quý giảm 10%!',
  },

  tiger_eye: {
    quick_pitch: 'Đá QUYỀN LỰC - Tự tin, dũng cảm, thành công 🐯',
    selling_points: [
      'Đá của người lãnh đạo',
      'Tăng cường sự tự tin và quyết đoán',
      'May mắn trong kinh doanh',
      'Phù hợp với Sư Tử, Ma Kết',
      'Ánh mắt hổ độc đáo, đẹp mắt',
    ],
    objection_handlers: {
      'đắt quá': 'Dạ, Mắt Hổ chất lượng cao có ánh đẹp lắm ạ. Giá này hợp lý cho đá thật!',
      'có tác dụng không': 'Dạ, nhiều anh chị đeo feedback tự tin hơn, quyết đoán hơn trong công việc ạ!',
    },
    upsell_products: ['citrine', 'pyrite', 'carnelian'],
    cross_sell: 'Combo với Citrine cho sự nghiệp thăng tiến!',
    combo_discount: 'Combo Quyền Lực giảm 15%!',
  },
};

// ============================================================================
// CRYSTAL KEYWORDS - Quick lookup by intention
// ============================================================================

export const CRYSTAL_KEYWORDS = {
  // Intentions
  'tình yêu': ['rose_quartz', 'rhodonite', 'moonstone'],
  'tiền tài': ['citrine', 'pyrite', 'jade', 'aventurine'],
  'sức khỏe': ['amethyst', 'clear_quartz', 'jade'],
  'may mắn': ['jade', 'aventurine', 'citrine', 'tiger_eye'],
  'bảo vệ': ['black_tourmaline', 'obsidian', 'tiger_eye'],
  'ngủ ngon': ['amethyst', 'lepidolite', 'moonstone'],
  'giảm stress': ['amethyst', 'lepidolite', 'blue_lace_agate'],
  'tự tin': ['tiger_eye', 'carnelian', 'citrine'],
  'trực giác': ['amethyst', 'labradorite', 'moonstone', 'lapis_lazuli'],
  'sáng tạo': ['carnelian', 'citrine', 'lapis_lazuli'],
  'giao tiếp': ['lapis_lazuli', 'blue_lace_agate', 'aquamarine'],
  'chữa lành': ['rose_quartz', 'rhodonite', 'clear_quartz'],
  'thiền định': ['amethyst', 'clear_quartz', 'labradorite'],
  'kinh doanh': ['citrine', 'pyrite', 'tiger_eye', 'jade'],

  // Chakras
  'chakra gốc': ['black_tourmaline', 'obsidian', 'carnelian'],
  'chakra xương cùng': ['carnelian', 'moonstone'],
  'chakra đám rối': ['citrine', 'tiger_eye', 'pyrite'],
  'chakra tim': ['rose_quartz', 'jade', 'aventurine', 'rhodonite'],
  'chakra cổ họng': ['lapis_lazuli', 'blue_lace_agate', 'aquamarine'],
  'chakra mắt thứ ba': ['amethyst', 'labradorite', 'lapis_lazuli'],
  'chakra vương miện': ['clear_quartz', 'amethyst'],
};

// ============================================================================
// CRYSTAL COMBOS
// ============================================================================

export const CRYSTAL_COMBOS = {
  love_combo: {
    name: 'Combo Tình Yêu',
    crystals: ['rose_quartz', 'rhodonite', 'moonstone'],
    discount: 15,
    description: 'Thu hút và nuôi dưỡng tình yêu đích thực',
  },
  wealth_combo: {
    name: 'Combo Tài Lộc',
    crystals: ['citrine', 'pyrite', 'jade'],
    discount: 15,
    description: 'Kích hoạt năng lượng thịnh vượng',
  },
  protection_combo: {
    name: 'Combo Bảo Vệ',
    crystals: ['black_tourmaline', 'obsidian', 'tiger_eye'],
    discount: 15,
    description: 'Tạo lá chắn bảo vệ toàn diện',
  },
  sleep_combo: {
    name: 'Combo Ngủ Ngon',
    crystals: ['amethyst', 'lepidolite', 'moonstone'],
    discount: 15,
    description: 'Cải thiện giấc ngủ và giảm stress',
  },
  business_combo: {
    name: 'Combo Kinh Doanh',
    crystals: ['citrine', 'tiger_eye', 'jade'],
    discount: 20,
    description: 'Thành công trong sự nghiệp và kinh doanh',
  },
  chakra_set: {
    name: 'Bộ 7 Chakra',
    crystals: ['black_tourmaline', 'carnelian', 'citrine', 'rose_quartz', 'lapis_lazuli', 'amethyst', 'clear_quartz'],
    discount: 25,
    description: 'Cân bằng tất cả 7 luân xa',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get crystal by ID
 */
export const getCrystal = (crystalId) => {
  return CRYSTALS[crystalId] || null;
};

/**
 * Get selling points for crystal
 */
export const getSellingPoints = (crystalId) => {
  return CRYSTAL_SELLING_POINTS[crystalId] || null;
};

/**
 * Get crystals by keyword/intention
 */
export const getCrystalsByKeyword = (keyword) => {
  const normalizedKeyword = keyword.toLowerCase();
  return CRYSTAL_KEYWORDS[normalizedKeyword] || [];
};

/**
 * Get crystals by element
 */
export const getCrystalsByElement = (element) => {
  return Object.values(CRYSTALS).filter(
    (crystal) => crystal.element === element || crystal.element === 'all'
  );
};

/**
 * Get crystals by zodiac
 */
export const getCrystalsByZodiac = (zodiac) => {
  return Object.values(CRYSTALS).filter(
    (crystal) =>
      crystal.zodiac_signs.includes(zodiac) ||
      crystal.zodiac_signs.includes('all')
  );
};

/**
 * Get objection handler
 */
export const getObjectionHandler = (crystalId, objection) => {
  const sellingPoint = CRYSTAL_SELLING_POINTS[crystalId];
  if (!sellingPoint) return null;

  // Normalize objection
  const normalizedObjection = objection.toLowerCase();

  // Find matching handler
  for (const [key, response] of Object.entries(sellingPoint.objection_handlers)) {
    if (normalizedObjection.includes(key)) {
      return response;
    }
  }

  return null;
};

export default CRYSTALS;
