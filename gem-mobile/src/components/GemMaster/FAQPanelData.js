/**
 * FAQ Panel Data - Quick Select Topics & Questions
 * Organized by topic for Binance-style FAQ selection UI
 *
 * Action Types:
 * - navigate_screen: Navigate to a specific screen
 * - message: Send as chat message to AI
 * - questionnaire: Trigger karma questionnaire flow
 * - inline_form: Show InlineChatForm for data collection
 * - courses_overview: AI response + course products
 * - course_detail: AI response + specific course product
 * - affiliate_info: AI response + affiliate CTA
 */

import {
  Sparkles,
  Wand2,
  TrendingUp,
  Lightbulb,
  DollarSign,
  Heart,
  GraduationCap,
  Gem,
  Users,
  Compass,
} from 'lucide-react-native';

// Topic configurations
export const FAQ_TOPICS = [
  {
    id: 'iching',
    label: 'Kinh Dịch',
    subtitle: 'I Ching Reading',
    icon: Sparkles,
    color: '#FFBD59',
    action: 'navigate_screen',
    screen: 'IChing',
  },
  {
    id: 'tarot',
    label: 'Tarot',
    subtitle: 'Card Reading',
    icon: Wand2,
    color: '#00D9FF',
    action: 'navigate_screen',
    screen: 'Tarot',
  },
  {
    id: 'analyze',
    label: 'Phân tích',
    subtitle: 'Analysis',
    icon: TrendingUp,
    color: '#00FF88',
    action: 'show_faq',
  },
  {
    id: 'suggest',
    label: 'Gợi ý',
    subtitle: 'Tips',
    icon: Lightbulb,
    color: '#FF6B9D',
    action: 'show_faq',
  },
  {
    id: 'wealth',
    label: 'Tài lộc',
    subtitle: 'Wealth',
    icon: DollarSign,
    color: '#FFD700',
    action: 'show_faq',
  },
  {
    id: 'love',
    label: 'Tình yêu',
    subtitle: 'Love',
    icon: Heart,
    color: '#FF69B4',
    action: 'show_faq',
  },
  {
    id: 'courses',
    label: 'Khóa học',
    subtitle: 'Courses',
    icon: GraduationCap,
    color: '#3498DB',
    action: 'show_faq',
  },
  {
    id: 'crystals',
    label: 'Thạch anh',
    subtitle: 'Crystals',
    icon: Gem,
    color: '#9B59B6',
    action: 'show_faq',
  },
  {
    id: 'affiliate',
    label: 'Kiếm tiền',
    subtitle: 'Affiliate',
    icon: Users,
    color: '#F59E0B',
    action: 'show_faq',
  },
  {
    id: 'spiritual',
    label: 'Tâm linh',
    subtitle: 'Spiritual',
    icon: Compass,
    color: '#A855F7',
    action: 'show_faq',
  },
];

// FAQ Questions by Topic
export const FAQ_QUESTIONS = {
  analyze: [
    {
      id: 'analyze_fomo_btc',
      text: 'BTC tăng 5% rồi, muốn mua ngay!',
      action: 'message',
      prompt: 'Muốn mua BTC ngay, tăng 5% rồi! Không muốn bỏ lỡ cơ hội!',
      isFOMO: true,
      tag: 'FOMO TEST',
    },
    {
      id: 'analyze_btc',
      text: 'Phân tích giá Bitcoin hiện tại',
      action: 'message',
      prompt: 'Phân tích giá Bitcoin hiện tại',
    },
    {
      id: 'analyze_eth',
      text: 'Phân tích giá Ethereum',
      action: 'message',
      prompt: 'Phân tích giá Ethereum hiện tại',
    },
    {
      id: 'analyze_bnb',
      text: 'Phân tích coin BNB',
      action: 'message',
      prompt: 'Phân tích coin BNB hiện tại',
    },
    {
      id: 'analyze_market',
      text: 'Phân tích xu hướng thị trường crypto',
      action: 'message',
      prompt: 'Phân tích xu hướng thị trường crypto hiện tại',
    },
    {
      id: 'analyze_frequency',
      text: 'Phân tích tần số năng lượng của tôi',
      action: 'inline_form',
      formType: 'frequency_analysis',
    },
    {
      id: 'analyze_longshort',
      text: 'Thị trường hôm nay nên Long hay Short?',
      action: 'message',
      prompt: 'Thị trường crypto hôm nay nên Long hay Short? Phân tích xu hướng và đưa ra khuyến nghị.',
    },
  ],

  suggest: [
    {
      id: 'suggest_career',
      text: 'Tôi nên đổi việc hay ở lại?',
      action: 'message',
      prompt: 'Tôi nên đổi việc hay ở lại công ty hiện tại? Hãy phân tích và đưa ra framework giúp tôi đưa ra quyết định.',
      isDeep: true,
      tag: 'CAREER',
    },
    {
      id: 'suggest_newbie',
      text: 'Gợi ý chiến lược đầu tư crypto cho người mới',
      action: 'message',
      prompt: 'Gợi ý chiến lược đầu tư crypto cho người mới bắt đầu',
    },
    {
      id: 'suggest_coins',
      text: 'Gợi ý coin tiềm năng tuần này',
      action: 'message',
      prompt: 'Gợi ý các coin tiềm năng tuần này dựa trên phân tích kỹ thuật',
    },
    {
      id: 'suggest_visionboard',
      text: 'Gợi ý cách đặt mục tiêu trong Visionboard',
      action: 'inline_form',
      formType: 'goal_setting',
    },
    {
      id: 'suggest_fomo',
      text: 'Gợi ý cách tránh FOMO khi trade',
      action: 'message',
      prompt: 'Gợi ý cách tránh FOMO khi trading crypto',
    },
    {
      id: 'suggest_tier',
      text: 'Tôi nên học TIER nào phù hợp?',
      action: 'message',
      prompt: 'Tư vấn tôi nên học TIER trading nào phù hợp với trình độ của tôi',
    },
    {
      id: 'suggest_winrate',
      text: 'So sánh win rate các TIER',
      action: 'message',
      prompt: 'So sánh win rate giữa các TIER trading của Gemral',
    },
  ],

  wealth: [
    {
      id: 'wealth_leak',
      text: 'Tại sao tiền cứ tuột khỏi tay tôi?',
      action: 'message',
      prompt: 'Tại sao tiền cứ tuột khỏi tay tôi? Phân tích gốc rễ vấn đề từ góc nhìn năng lượng và tâm lý, đưa ra bài tập chữa lành.',
      isDeep: true,
      tag: 'DEEP QUESTION',
    },
    {
      id: 'wealth_manifest',
      text: 'Hướng dẫn manifest tiền bạc',
      action: 'inline_form',
      formType: 'manifest_wealth',
    },
    {
      id: 'wealth_karma',
      text: 'Nghiệp tiền bạc của tôi là gì?',
      action: 'questionnaire',
      karmaType: 'money',
    },
    {
      id: 'wealth_block',
      text: 'Tại sao tôi bị block tiền?',
      action: 'message',
      prompt: 'Tại sao tôi bị block tiền? Phân tích và hướng dẫn cách tháo gỡ.',
    },
    {
      id: 'wealth_exercise',
      text: 'Bài tập "Chi tiền trong hạnh phúc"',
      action: 'message',
      prompt: 'Hướng dẫn chi tiết bài tập "Chi tiền trong hạnh phúc"',
    },
    {
      id: 'wealth_ritual',
      text: 'Ritual nghi thức manifest may mắn',
      action: 'navigate_ritual',
      screen: 'LetterToUniverseRitual',
      briefMessage: 'Nghi thức "Thư Gửi Vũ Trụ" là cách tuyệt vời để gửi ý định manifest của bạn đến vũ trụ. Hãy viết điều ước của bạn với lòng biết ơn và niềm tin.',
    },
    {
      id: 'wealth_crystal',
      text: 'Đá nào hỗ trợ tài chính?',
      action: 'message_crystal',
      prompt: 'Đá thạch anh nào hỗ trợ tài chính tốt nhất?',
      crystalTags: ['Citrine', 'Thạch Anh Vàng', 'money', 'abundance'],
    },
    {
      id: 'wealth_scarcity',
      text: 'Làm sao để thoát tư duy thiếu hụt?',
      action: 'message',
      prompt: 'Làm sao để thoát tư duy thiếu hụt (scarcity mindset)?',
    },
  ],

  love: [
    {
      id: 'love_destiny',
      text: 'Người ấy có phải định mệnh của tôi không?',
      action: 'message',
      prompt: 'Người ấy có phải định mệnh của tôi không? Hãy phân tích từ góc nhìn năng lượng và tâm linh.',
      isDeep: true,
      tag: 'DEEP QUESTION',
    },
    {
      id: 'love_manifest',
      text: 'Hướng dẫn manifest tình yêu',
      action: 'inline_form',
      formType: 'manifest_love',
    },
    {
      id: 'love_wrong',
      text: 'Tại sao tôi luôn gặp sai người?',
      action: 'message',
      prompt: 'Tại sao tôi luôn gặp sai người trong tình yêu? Phân tích và hướng dẫn.',
    },
    {
      id: 'love_karma',
      text: 'Nghiệp tình yêu của tôi là gì?',
      action: 'questionnaire',
      karmaType: 'love',
    },
    {
      id: 'love_self',
      text: 'Làm sao để yêu bản thân hơn?',
      action: 'message',
      prompt: 'Làm sao để yêu bản thân hơn? Hướng dẫn chi tiết.',
    },
    {
      id: 'love_crystal',
      text: 'Đá nào hỗ trợ tình duyên?',
      action: 'message_crystal',
      prompt: 'Đá thạch anh nào hỗ trợ tình duyên tốt nhất?',
      crystalTags: ['Rose Quartz', 'Thạch Anh Hồng', 'love', 'relationship'],
    },
  ],

  courses: [
    {
      id: 'courses_intro',
      text: 'Giới thiệu các khóa học của Gemral',
      action: 'courses_overview',
      prompt: 'Giới thiệu các khóa học của Gemral',
    },
    {
      id: 'courses_tier',
      text: 'So sánh các TIER khóa học trading',
      action: 'message',
      prompt: 'So sánh chi tiết các TIER khóa học trading của Gemral',
    },
    {
      id: 'courses_frequency',
      text: 'Khóa 7 Ngày Khai Mở Tần Số Gốc',
      action: 'course_detail',
      prompt: 'Giới thiệu Khóa 7 Ngày Khai Mở Tần Số Gốc',
      courseTags: ['Tần Số Gốc', 'Khai Mở', '7 Ngày'],
    },
    {
      id: 'courses_love',
      text: 'Khóa Kích Hoạt Tần Số Tình Yêu',
      action: 'course_detail',
      prompt: 'Giới thiệu Khóa Kích Hoạt Tần Số Tình Yêu',
      courseTags: ['Tình Yêu', 'Tần Số', 'Kích Hoạt'],
    },
    {
      id: 'courses_millionaire',
      text: 'Khóa Tư Duy Triệu Phú',
      action: 'course_detail',
      prompt: 'Giới thiệu Khóa Tư Duy Triệu Phú - Manifest Tiền Bạc',
      courseTags: ['Triệu Phú', 'Manifest', 'Tiền Bạc'],
    },
    {
      id: 'courses_tier2',
      text: 'Khóa Trading TIER 2 có gì khác TIER 1?',
      action: 'message',
      prompt: 'Khóa Trading TIER 2 có gì khác TIER 1? So sánh chi tiết.',
    },
  ],

  crystals: [
    {
      id: 'crystals_intro',
      text: 'Giới thiệu các loại đá thạch anh',
      action: 'message_crystal',
      prompt: 'Giới thiệu các loại đá thạch anh và công dụng',
      crystalTags: ['crystal', 'thạch anh'],
    },
    {
      id: 'crystals_match',
      text: 'Đá nào phù hợp với tôi?',
      action: 'inline_form',
      formType: 'crystal_match',
    },
    {
      id: 'crystals_charge',
      text: 'Hướng dẫn sạc và kích hoạt đá',
      action: 'message',
      prompt: 'Hướng dẫn cách sạc và kích hoạt đá thạch anh đúng cách',
    },
    {
      id: 'crystals_chakra',
      text: 'Đá chữa lành theo Chakra',
      action: 'message',
      prompt: 'Hướng dẫn chọn đá chữa lành theo từng Chakra',
    },
    {
      id: 'crystals_citrine',
      text: 'Thạch Anh Vàng - Money Magnet',
      action: 'message_crystal',
      prompt: 'Giới thiệu Thạch Anh Vàng (Citrine) - Money Magnet',
      crystalTags: ['Citrine', 'Thạch Anh Vàng'],
    },
    {
      id: 'crystals_rose',
      text: 'Thạch Anh Hồng - Tình yêu',
      action: 'message_crystal',
      prompt: 'Giới thiệu Thạch Anh Hồng (Rose Quartz) - Đá tình yêu',
      crystalTags: ['Rose Quartz', 'Thạch Anh Hồng'],
    },
    {
      id: 'crystals_amethyst',
      text: 'Thạch Anh Tím - Tâm linh',
      action: 'message_crystal',
      prompt: 'Giới thiệu Thạch Anh Tím (Amethyst) - Đá tâm thức',
      crystalTags: ['Amethyst', 'Thạch Anh Tím'],
    },
  ],

  affiliate: [
    {
      id: 'affiliate_how',
      text: 'Làm sao để trở thành affiliate, KOL/KOC?',
      action: 'affiliate_info',
      prompt: 'Hướng dẫn cách trở thành affiliate, KOL/KOC của Gemral',
    },
    {
      id: 'affiliate_register',
      text: 'Muốn đăng ký trở thành Partner của Gemral',
      action: 'navigate_partnership',
      screen: 'PartnershipRegistration',
    },
  ],

  spiritual: [
    {
      id: 'spiritual_potential',
      text: 'Điều gì đang ngăn cản tôi sống đúng tiềm năng?',
      action: 'message',
      prompt: 'Điều gì đang ngăn cản tôi sống đúng tiềm năng? Hãy đào sâu vào gốc rễ vấn đề và đưa ra insight giúp tôi chuyển hóa.',
      isDeep: true,
      tag: 'LIFE-CHANGING',
    },
    {
      id: 'spiritual_frequency',
      text: 'Tôi đang ở mức tần số nào?',
      action: 'inline_form',
      formType: 'frequency_analysis',
    },
    {
      id: 'spiritual_meditation',
      text: 'Hướng dẫn thiền kết nối Higher Self',
      action: 'message',
      prompt: 'Hướng dẫn chi tiết thiền kết nối Higher Self',
    },
    {
      id: 'spiritual_exercise',
      text: 'Bài tập nâng cao tần số năng lượng',
      action: 'message',
      prompt: 'Các bài tập nâng cao tần số năng lượng hiệu quả',
    },
    {
      id: 'spiritual_karma',
      text: 'Đây có phải là nghiệp tài chính không?',
      action: 'message',
      prompt: 'Đây có phải là nghiệp tài chính không? Giải thích về nghiệp tài chính và cách nhận biết.',
    },
    {
      id: 'spiritual_philosophy',
      text: 'Tìm hiểu về Học Thuyết Chuyển Hóa Nội Tâm',
      action: 'message',
      prompt: 'Giới thiệu về Học Thuyết Chuyển Hóa Nội Tâm của YinYang Masters',
    },
    {
      id: 'spiritual_tired',
      text: 'Tại sao tôi luôn cảm thấy thiếu năng lượng?',
      action: 'message',
      prompt: 'Tại sao tôi luôn cảm thấy thiếu năng lượng? Phân tích nguyên nhân và giải pháp.',
    },
  ],
};

// Get topic by ID
export const getTopicById = (topicId) => {
  return FAQ_TOPICS.find(topic => topic.id === topicId);
};

// Get questions for a topic
export const getQuestionsForTopic = (topicId) => {
  return FAQ_QUESTIONS[topicId] || [];
};

export default {
  FAQ_TOPICS,
  FAQ_QUESTIONS,
  getTopicById,
  getQuestionsForTopic,
};
