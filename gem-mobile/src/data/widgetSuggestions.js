/**
 * Widget Suggestions - Logic gợi ý widget theo topic
 * Dùng cho GEM Master AI khi suggest widget cho user
 */

export const WIDGET_TYPES = {
  MONEY_AFFIRMATION: {
    id: 'money_affirmation',
    type: 'affirmation',
    title: 'Affirmation Tiền Bạc',
    description: 'Nhắc nhở đọc affirmation tiền bạc mỗi ngày',
    icon: 'coins', // lucide-react-native icon
    affirmations: [
      'Tiền đến với tôi dễ dàng và dồi dào',
      'Tôi là nam châm thu hút tài lộc',
      'Mọi việc tôi làm đều sinh ra tiền',
      'Tôi xứng đáng được giàu có',
      'Tôi vui vẻ khi chi tiền vì tiền sẽ quay lại',
    ],
    trackingType: 'daily_streak',
    goalDays: 21,
  },

  LOVE_HEALING: {
    id: 'love_healing',
    type: 'affirmation',
    title: 'Chữa Lành Tình Yêu',
    description: 'Affirmation yêu thương bản thân và thu hút tình yêu',
    icon: 'heart', // lucide-react-native icon
    affirmations: [
      'Tôi yêu thương và chấp nhận bản thân hoàn toàn',
      'Tôi xứng đáng có tình yêu đích thực',
      'Tim tôi rộng mở để yêu và được yêu',
      'Người phù hợp với tôi đang trên đường đến',
      'Tôi tha thứ cho quá khứ và đón nhận tình yêu mới',
    ],
    trackingType: 'daily_streak',
    goalDays: 21,
  },

  KARMA_TRANSFORMATION: {
    id: 'karma_transformation',
    type: 'exercise',
    title: 'Chuyển Hóa Nghiệp',
    description: 'Bài tập hàng ngày để release nghiệp cũ',
    icon: 'refresh-cw', // lucide-react-native icon
    exercises: [
      {
        day: '1-7',
        task: 'Viết ra 10 niềm tin tiêu cực về tiền/tình yêu từ gia đình',
        duration: '10 phút',
      },
      {
        day: '8-14',
        task: 'Viết thư tha thứ cho 1 người mỗi ngày',
        duration: '15 phút',
      },
      {
        day: '15-21',
        task: 'Viết lại câu chuyện cuộc đời với happy ending',
        duration: '10 phút',
      },
    ],
    trackingType: 'daily_streak',
    goalDays: 21,
  },

  CRYSTAL_REMINDER: {
    id: 'crystal_reminder',
    type: 'reminder',
    title: 'Nhắc Nhở Đá Năng Lượng',
    description: 'Nhắc sạc đá và thiền với đá đúng cách',
    icon: 'gem', // lucide-react-native icon
    reminders: [
      { time: '06:00', task: 'Thiền với đá 5 phút trước khi bắt đầu ngày' },
      { time: '12:00', task: 'Cầm đá và đọc affirmation 1 phút' },
      { time: '21:00', task: 'Sạc đá dưới ánh trăng (nếu có trăng)' },
    ],
    trackingType: 'checklist',
  },

  FREQUENCY_TRACKER: {
    id: 'frequency_tracker',
    type: 'tracker',
    title: 'Theo Dõi Tần Số',
    description: 'Ghi lại cảm xúc và theo dõi tần số hàng ngày',
    icon: 'activity', // lucide-react-native icon
    questions: [
      'Cảm xúc chủ đạo hôm nay là gì?',
      'Bạn có lo lắng về tiền không?',
      'Bạn có suy nghĩ tiêu cực nào lặp lại không?',
    ],
    trackingType: 'daily_log',
  },

  VISION_BOARD_MONEY: {
    id: 'vision_board_money',
    type: 'vision_board',
    title: 'Vision Board Tài Chính 2025',
    description: 'Bảng mục tiêu tài chính với hình ảnh và affirmation',
    icon: 'target', // lucide-react-native icon
    sections: ['Mục tiêu thu nhập', 'Nguồn thu', 'Phong cách sống', 'Đóng góp'],
    trackingType: 'goal_progress',
  },

  VISION_BOARD_LOVE: {
    id: 'vision_board_love',
    type: 'vision_board',
    title: 'Vision Board Tình Yêu',
    description: 'Bảng mục tiêu về mối quan hệ lý tưởng',
    icon: 'heart-handshake', // lucide-react-native icon
    sections: ['Đặc điểm người ấy', 'Cảm xúc trong MQH', 'Hoạt động cùng nhau', 'Tương lai chung'],
    trackingType: 'goal_progress',
  },
};

// Mapping topic -> widget suggestion
export const TOPIC_WIDGET_MAPPING = {
  // Tiền bạc
  money: ['MONEY_AFFIRMATION', 'KARMA_TRANSFORMATION', 'VISION_BOARD_MONEY'],
  money_karma: ['KARMA_TRANSFORMATION', 'MONEY_AFFIRMATION'],
  money_frequency: ['FREQUENCY_TRACKER', 'MONEY_AFFIRMATION'],
  money_block: ['MONEY_AFFIRMATION', 'KARMA_TRANSFORMATION'],

  // Tình yêu
  love: ['LOVE_HEALING', 'KARMA_TRANSFORMATION', 'VISION_BOARD_LOVE'],
  love_karma: ['KARMA_TRANSFORMATION', 'LOVE_HEALING'],
  love_frequency: ['FREQUENCY_TRACKER', 'LOVE_HEALING'],
  wrong_person: ['LOVE_HEALING', 'KARMA_TRANSFORMATION'],

  // Nghiệp
  karma: ['KARMA_TRANSFORMATION', 'FREQUENCY_TRACKER'],

  // Đá
  crystal: ['CRYSTAL_REMINDER'],

  // Vision Board
  vision_board: ['VISION_BOARD_MONEY', 'VISION_BOARD_LOVE'],
  vision_board_money: ['VISION_BOARD_MONEY'],
  vision_board_love: ['VISION_BOARD_LOVE'],

  // Tần số
  frequency: ['FREQUENCY_TRACKER', 'MONEY_AFFIRMATION', 'LOVE_HEALING'],
};

/**
 * Get widget suggestion for a topic
 * @param {string} topic - Topic category
 * @returns {object} - Widget type object
 */
export const getWidgetSuggestion = (topic) => {
  const widgetIds = TOPIC_WIDGET_MAPPING[topic] || ['FREQUENCY_TRACKER'];
  const primaryWidgetId = widgetIds[0];
  return WIDGET_TYPES[primaryWidgetId] || WIDGET_TYPES.FREQUENCY_TRACKER;
};

/**
 * Get all widget suggestions for a topic
 * @param {string} topic - Topic category
 * @returns {Array} - Array of widget type objects
 */
export const getAllWidgetSuggestions = (topic) => {
  const widgetIds = TOPIC_WIDGET_MAPPING[topic] || ['FREQUENCY_TRACKER'];
  return widgetIds.map(id => WIDGET_TYPES[id]).filter(Boolean);
};

/**
 * Detect topic from user message
 * @param {string} message - User message
 * @returns {string} - Detected topic
 */
export const detectTopicFromMessage = (message) => {
  const lowerMessage = message.toLowerCase();

  // Money-related
  if (lowerMessage.includes('tiền') ||
      lowerMessage.includes('tài chính') ||
      lowerMessage.includes('kinh doanh') ||
      lowerMessage.includes('thu nhập') ||
      lowerMessage.includes('giàu') ||
      lowerMessage.includes('nghèo')) {
    if (lowerMessage.includes('nghiệp') || lowerMessage.includes('karma')) {
      return 'money_karma';
    }
    if (lowerMessage.includes('tần số') || lowerMessage.includes('năng lượng')) {
      return 'money_frequency';
    }
    if (lowerMessage.includes('block') || lowerMessage.includes('tắc')) {
      return 'money_block';
    }
    return 'money';
  }

  // Love-related
  if (lowerMessage.includes('tình yêu') ||
      lowerMessage.includes('quan hệ') ||
      lowerMessage.includes('người yêu') ||
      lowerMessage.includes('cô đơn') ||
      lowerMessage.includes('chia tay')) {
    if (lowerMessage.includes('nghiệp') || lowerMessage.includes('karma')) {
      return 'love_karma';
    }
    if (lowerMessage.includes('sai người') || lowerMessage.includes('không phù hợp')) {
      return 'wrong_person';
    }
    if (lowerMessage.includes('tần số')) {
      return 'love_frequency';
    }
    return 'love';
  }

  // Karma-related
  if (lowerMessage.includes('nghiệp') ||
      lowerMessage.includes('karma') ||
      lowerMessage.includes('chuyển hóa')) {
    return 'karma';
  }

  // Crystal-related
  if (lowerMessage.includes('đá') ||
      lowerMessage.includes('crystal') ||
      lowerMessage.includes('thạch anh')) {
    return 'crystal';
  }

  // Vision Board
  if (lowerMessage.includes('vision board') ||
      lowerMessage.includes('mục tiêu') ||
      lowerMessage.includes('ước mơ')) {
    return 'vision_board';
  }

  // Frequency
  if (lowerMessage.includes('tần số') ||
      lowerMessage.includes('năng lượng') ||
      lowerMessage.includes('hawkins')) {
    return 'frequency';
  }

  return 'general';
};

export default {
  WIDGET_TYPES,
  TOPIC_WIDGET_MAPPING,
  getWidgetSuggestion,
  getAllWidgetSuggestions,
  detectTopicFromMessage,
};
