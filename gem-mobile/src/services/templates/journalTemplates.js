/**
 * Centralized Template Definitions
 *
 * Dùng chung cho tất cả entry points:
 * - GEM Master Chat (InlineChatForm)
 * - Vision Board (GoalCreationForm)
 * - Calendar (JournalEntryForm)
 *
 * Created: 2026-02-02
 */

// ========== FIELD TYPES ==========
export const FIELD_TYPES = {
  TEXT: 'text',
  TEXTAREA: 'textarea',
  SLIDER: 'slider',
  CHECKLIST: 'checklist',
  ACTION_LIST: 'action_list',
  SELECT: 'select',
  DATE: 'date',
  LIFE_AREA: 'life_area',
  MOOD: 'mood',
};

// ========== LIFE AREAS ==========
export const LIFE_AREAS = {
  finance: {
    id: 'finance',
    name: 'Tài chính',
    icon: 'DollarSign',
    color: '#FFD700',
  },
  crypto: {
    id: 'crypto',
    name: 'Crypto',
    icon: 'Bitcoin',
    color: '#FF9800',
  },
  love: {
    id: 'love',
    name: 'Mối quan hệ',
    icon: 'Heart',
    color: '#E91E63',
  },
  career: {
    id: 'career',
    name: 'Sự nghiệp',
    icon: 'Briefcase',
    color: '#6A5BFF',
  },
  health: {
    id: 'health',
    name: 'Sức khỏe',
    icon: 'Activity',
    color: '#3AF7A6',
  },
  personal_growth: {
    id: 'personal_growth',
    name: 'Phát triển cá nhân',
    icon: 'Star',
    color: '#00F0FF',
  },
  spiritual: {
    id: 'spiritual',
    name: 'Tâm linh',
    icon: 'Sparkles',
    color: '#9C0612',
  },
};

// ========== TEMPLATE CATEGORIES ==========
export const TEMPLATE_CATEGORIES = {
  GOAL_FOCUSED: 'goal_focused',
  JOURNAL_FOCUSED: 'journal_focused',
  HYBRID: 'hybrid',
};

// ========== TIER LEVELS ==========
export const TIERS = {
  FREE: 'free',
  TIER1: 'tier1',
  TIER2: 'tier2',
  TIER3: 'tier3',
};

// ========== TEMPLATE DEFINITIONS ==========
export const TEMPLATES = {
  // ==========================================
  // GOAL BASIC - Mục tiêu cơ bản
  // ==========================================
  goal_basic: {
    id: 'goal_basic',
    name: 'Mục tiêu cơ bản',
    nameEn: 'Basic Goal',
    icon: 'Target',
    description: 'Tạo mục tiêu đơn giản với hành động',
    category: TEMPLATE_CATEGORIES.GOAL_FOCUSED,

    triggerKeywords: ['mục tiêu', 'goal', 'muốn đạt', 'đặt mục tiêu', 'tôi muốn'],
    confidenceThreshold: 0.7,

    requiredTier: TIERS.FREE,

    fields: [
      {
        id: 'title',
        type: FIELD_TYPES.TEXT,
        label: 'Tên mục tiêu *',
        placeholder: 'Ví dụ: Đạt 100 triệu tiết kiệm',
        required: true,
        maxLength: 200,
        autoFillFromContext: true,
      },
      {
        id: 'description',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Mô tả chi tiết',
        placeholder: 'Tại sao mục tiêu này quan trọng với bạn?',
        required: false,
        minRows: 2,
        maxLength: 1000,
      },
      {
        id: 'life_area',
        type: FIELD_TYPES.LIFE_AREA,
        label: 'Lĩnh vực *',
        required: true,
      },
      {
        id: 'actions',
        type: FIELD_TYPES.ACTION_LIST,
        label: 'Kế hoạch hành động',
        allowAdd: true,
        canCreateGoal: true,
        requireLifeArea: false,
        maxItems: 10,
        defaultChecked: true,
        placeholder: 'Thêm hành động...',
      },
      {
        id: 'affirmation',
        type: FIELD_TYPES.TEXT,
        label: 'Khẳng định (tùy chọn)',
        placeholder: 'Ví dụ: Tôi xứng đáng với sự giàu có',
        optional: true,
        canCreateGoal: true,
        maxLength: 200,
      },
      {
        id: 'ritual',
        type: FIELD_TYPES.TEXT,
        label: 'Nghi thức (tùy chọn)',
        placeholder: 'Ví dụ: Review mỗi sáng Chủ nhật',
        optional: true,
        canCreateGoal: true,
        hint: 'Thói quen giúp bạn duy trì mục tiêu',
        maxLength: 200,
      },
    ],

    outputType: 'goal',
    defaultLifeArea: null,

    tooltips: {
      form: 'Đặt mục tiêu SMART: Cụ thể, Đo được, Khả thi, Thực tế, Có thời hạn.',
      actions: 'Chia mục tiêu thành các bước nhỏ để dễ thực hiện.',
      affirmation: 'Khẳng định tích cực giúp não bộ tin vào khả năng của bạn.',
      ritual: 'Nghi thức giúp duy trì động lực dài hạn.',
    },

    validation: {
      minFieldsFilled: 2,
      requireAtLeastOneAction: true,
    },
  },

  // ==========================================
  // FEAR-SETTING - Đối diện nỗi sợ
  // ==========================================
  fear_setting: {
    id: 'fear_setting',
    name: 'Đối diện nỗi sợ',
    nameEn: 'Fear-Setting',
    icon: 'AlertTriangle',
    description: 'Phân tích nỗi sợ để vượt qua',
    category: TEMPLATE_CATEGORIES.HYBRID,

    triggerKeywords: ['sợ', 'lo lắng', 'không dám', 'e ngại', 'lo sợ', 'băn khoăn', 'ngại', 'fear', 'sợ thất bại'],
    confidenceThreshold: 0.6,

    requiredTier: TIERS.TIER1, // TIER1 (Pro)

    fields: [
      {
        id: 'fear_target',
        type: FIELD_TYPES.TEXT,
        label: 'Điều bạn muốn làm nhưng sợ *',
        placeholder: 'Ví dụ: Nghỉ việc để khởi nghiệp',
        required: true,
        autoFillFromContext: true,
        maxLength: 200,
      },
      {
        id: 'worst_case',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Kịch bản xấu nhất là gì? *',
        hint: 'Cụ thể: Mất gì? Bao nhiêu? Bao lâu?',
        required: true,
        minRows: 3,
        maxLength: 1000,
      },
      {
        id: 'mitigation',
        type: FIELD_TYPES.ACTION_LIST,
        label: 'Làm gì để giảm thiểu rủi ro?',
        allowAdd: true,
        canCreateGoal: true,
        requireLifeArea: true,
        maxItems: 10,
        defaultChecked: false,
        placeholder: 'Thêm biện pháp...',
      },
      {
        id: 'recovery',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Cách phục hồi nếu thất bại? *',
        hint: 'Bạn sẽ làm gì để trở lại nếu mọi thứ không như ý?',
        required: true,
        minRows: 2,
        maxLength: 1000,
      },
      {
        id: 'affirmation',
        type: FIELD_TYPES.TEXT,
        label: 'Khẳng định',
        placeholder: 'Ta có khả năng phục hồi dù điều gì xảy ra',
        optional: true,
        canCreateGoal: true,
        defaultValue: 'Ta có khả năng phục hồi dù điều gì xảy ra',
        maxLength: 200,
      },
      {
        id: 'ritual',
        type: FIELD_TYPES.TEXT,
        label: 'Nghi thức',
        placeholder: 'Ví dụ: Review kế hoạch mỗi sáng Chủ nhật',
        optional: true,
        canCreateGoal: true,
        maxLength: 200,
      },
    ],

    outputType: 'hybrid',
    defaultLifeArea: 'career',

    tooltips: {
      form: 'Fear-Setting (Tim Ferriss) giúp bạn thấy rủi ro thực sự nhỏ hơn tưởng tượng rất nhiều.',
      worst_case: 'Hãy cụ thể nhất có thể. Điều tồi tệ nhất thực sự là gì? Thường không tệ như ta nghĩ.',
      mitigation: 'Tick vào những hành động bạn muốn commit để tạo thành mục tiêu theo dõi.',
      recovery: 'Biết cách phục hồi giúp bạn tự tin hành động hơn.',
    },

    validation: {
      minFieldsFilled: 3,
      requireAtLeastOneAction: false,
    },
  },

  // ==========================================
  // THINK DAY - Review cuộc sống
  // ==========================================
  think_day: {
    id: 'think_day',
    name: 'Think Day',
    nameEn: 'Think Day',
    icon: 'Brain',
    description: 'Dành thời gian suy nghĩ về cuộc sống',
    category: TEMPLATE_CATEGORIES.HYBRID,

    triggerKeywords: ['mất cân bằng', 'review cuộc sống', 'think day', 'đánh giá lại', 'nhìn lại', 'suy nghĩ về cuộc sống'],
    confidenceThreshold: 0.7,

    requiredTier: TIERS.TIER1, // TIER1 (Pro)

    fields: [
      {
        id: 'energy_level',
        type: FIELD_TYPES.SLIDER,
        label: 'Năng lượng hôm nay',
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 5,
        labels: { 1: 'Kiệt sức', 5: 'Bình thường', 10: 'Tràn đầy' },
      },
      {
        id: 'weekly_feeling',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Trong tuần qua, bạn cảm thấy thế nào?',
        placeholder: 'Chia sẻ cảm xúc, suy nghĩ của bạn...',
        required: true,
        minRows: 3,
        maxLength: 2000,
      },
      {
        id: 'no_fail_action',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Nếu biết chắc KHÔNG THỂ THẤT BẠI, bạn sẽ làm gì?',
        placeholder: 'Hãy mơ lớn, không giới hạn...',
        required: true,
        minRows: 2,
        maxLength: 1000,
      },
      {
        id: 'ideal_life_3y',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Cuộc sống LÝ TƯỞNG 3 năm nữa trông thế nào?',
        placeholder: 'Mô tả chi tiết: công việc, gia đình, sức khỏe, tài chính...',
        required: true,
        minRows: 3,
        maxLength: 2000,
      },
      {
        id: 'fear_of_judgment',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Điều gì bạn đang làm CHỈ VÌ SỢ người khác nghĩ?',
        placeholder: 'Hãy thành thật với bản thân...',
        required: false,
        minRows: 2,
        maxLength: 1000,
      },
      {
        id: 'actions',
        type: FIELD_TYPES.ACTION_LIST,
        label: '3 việc bạn sẽ làm từ hôm nay',
        allowAdd: true,
        canCreateGoal: true,
        requireLifeArea: true,
        maxItems: 5,
        minItems: 1,
        defaultChecked: false,
        placeholder: 'Thêm hành động...',
      },
      {
        id: 'affirmation',
        type: FIELD_TYPES.TEXT,
        label: 'Khẳng định (tùy chọn)',
        placeholder: 'Ví dụ: Tôi sống đúng với giá trị của mình',
        optional: true,
        canCreateGoal: true,
        maxLength: 200,
      },
      {
        id: 'ritual',
        type: FIELD_TYPES.TEXT,
        label: 'Nghi thức (tùy chọn)',
        placeholder: 'Ví dụ: Think Day mỗi tháng một lần',
        optional: true,
        canCreateGoal: true,
        maxLength: 200,
      },
    ],

    outputType: 'hybrid',
    defaultLifeArea: 'personal_growth',

    tooltips: {
      form: 'Think Day - Ngày dành cho việc suy nghĩ chiến lược về cuộc sống, không làm việc.',
      no_fail_action: 'Câu hỏi này giúp bạn nhận ra những gì thực sự muốn, không bị giới hạn bởi nỗi sợ.',
      ideal_life_3y: 'Tưởng tượng chi tiết giúp não bộ tìm cách đạt được.',
      actions: 'Tick vào hành động bạn muốn commit để tạo mục tiêu theo dõi.',
    },

    validation: {
      minFieldsFilled: 4,
      requireAtLeastOneAction: true,
    },
  },

  // ==========================================
  // GRATITUDE - Biết ơn
  // ==========================================
  gratitude: {
    id: 'gratitude',
    name: 'Biết ơn',
    nameEn: 'Gratitude',
    icon: 'Heart',
    description: '3 điều biết ơn hôm nay',
    category: TEMPLATE_CATEGORIES.HYBRID,

    triggerKeywords: ['biết ơn', 'cảm ơn', 'grateful', 'thankful', 'hạnh phúc'],
    confidenceThreshold: 0.7,

    requiredTier: TIERS.FREE,

    fields: [
      {
        id: 'grateful_1',
        type: FIELD_TYPES.TEXT,
        label: 'Điều 1 bạn biết ơn *',
        placeholder: 'Ví dụ: Sức khỏe của gia đình',
        required: true,
        maxLength: 200,
      },
      {
        id: 'grateful_2',
        type: FIELD_TYPES.TEXT,
        label: 'Điều 2 bạn biết ơn *',
        placeholder: 'Ví dụ: Công việc ổn định',
        required: true,
        maxLength: 200,
      },
      {
        id: 'grateful_3',
        type: FIELD_TYPES.TEXT,
        label: 'Điều 3 bạn biết ơn *',
        placeholder: 'Ví dụ: Bạn bè tốt',
        required: true,
        maxLength: 200,
      },
      {
        id: 'why_grateful',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Tại sao những điều này quan trọng?',
        placeholder: 'Chia sẻ thêm...',
        optional: true,
        minRows: 2,
        maxLength: 500,
      },
      {
        id: 'actions',
        type: FIELD_TYPES.ACTION_LIST,
        label: 'Từ lòng biết ơn, bạn muốn làm gì?',
        allowAdd: true,
        canCreateGoal: true,
        requireLifeArea: true,
        maxItems: 5,
        optional: true,
        defaultChecked: false,
        placeholder: 'Thêm hành động...',
      },
    ],

    outputType: 'hybrid',
    defaultLifeArea: 'personal_growth',

    tooltips: {
      form: 'Thực hành biết ơn mỗi ngày giúp tăng hạnh phúc và sức khỏe tinh thần.',
      actions: 'Biến lòng biết ơn thành hành động cụ thể.',
    },

    validation: {
      minFieldsFilled: 3,
      requireAtLeastOneAction: false,
    },
  },

  // ==========================================
  // DAILY WINS - Chiến thắng hôm nay
  // ==========================================
  daily_wins: {
    id: 'daily_wins',
    name: 'Chiến thắng hôm nay',
    nameEn: 'Daily Wins',
    icon: 'Trophy',
    description: 'Ghi nhận thành tựu trong ngày',
    category: TEMPLATE_CATEGORIES.JOURNAL_FOCUSED,

    triggerKeywords: ['thắng', 'thành tựu', 'đã làm được', 'hôm nay đã', 'win', 'hoàn thành'],
    confidenceThreshold: 0.7,

    requiredTier: TIERS.TIER2, // TIER2 (Premium)

    fields: [
      {
        id: 'wins',
        type: FIELD_TYPES.CHECKLIST,
        label: 'Những việc bạn đã hoàn thành hôm nay',
        allowAdd: true,
        minItems: 1,
        maxItems: 10,
        placeholder: 'Thêm chiến thắng...',
      },
      {
        id: 'feeling',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Bạn cảm thấy thế nào về những thành tựu này?',
        placeholder: 'Chia sẻ cảm xúc của bạn...',
        optional: true,
        minRows: 2,
        maxLength: 500,
      },
      {
        id: 'tomorrow_focus',
        type: FIELD_TYPES.ACTION_LIST,
        label: 'Ngày mai bạn sẽ tập trung vào điều gì?',
        allowAdd: true,
        canCreateGoal: true,
        requireLifeArea: true,
        maxItems: 3,
        optional: true,
        defaultChecked: false,
        placeholder: 'Thêm focus...',
      },
    ],

    outputType: 'journal',
    defaultLifeArea: 'personal_growth',

    tooltips: {
      form: 'Ghi nhận thành tựu mỗi ngày giúp tăng động lực và tự tin.',
      wins: 'Dù nhỏ đến đâu cũng đáng ghi nhận!',
    },

    validation: {
      minFieldsFilled: 1,
      requireAtLeastOneAction: false,
    },
  },

  // ==========================================
  // WEEKLY PLANNING - Tuần mới
  // ==========================================
  weekly_planning: {
    id: 'weekly_planning',
    name: 'Tuần mới',
    nameEn: 'Weekly Planning',
    icon: 'Calendar',
    description: 'Lên kế hoạch cho tuần mới',
    category: TEMPLATE_CATEGORIES.HYBRID,

    triggerKeywords: ['tuần này', 'tuần mới', 'kế hoạch tuần', 'tuần tới', 'weekly'],
    confidenceThreshold: 0.7,

    requiredTier: TIERS.TIER1,

    fields: [
      {
        id: 'last_week_review',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Tuần trước bạn đã làm được gì? *',
        placeholder: 'Những thành tựu, tiến triển...',
        required: true,
        minRows: 2,
        maxLength: 1000,
      },
      {
        id: 'last_week_lesson',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Bài học từ tuần trước? *',
        placeholder: 'Điều gì hiệu quả? Điều gì cần cải thiện?',
        required: true,
        minRows: 2,
        maxLength: 1000,
      },
      {
        id: 'weekly_goals',
        type: FIELD_TYPES.ACTION_LIST,
        label: '3-5 mục tiêu cho tuần này',
        allowAdd: true,
        canCreateGoal: true,
        requireLifeArea: true,
        minItems: 3,
        maxItems: 5,
        defaultChecked: false,
        placeholder: 'Thêm mục tiêu...',
      },
      {
        id: 'weekly_affirmation',
        type: FIELD_TYPES.TEXT,
        label: 'Khẳng định cho tuần này',
        placeholder: 'Ví dụ: Tuần này tôi sẽ hoàn thành mọi việc',
        optional: true,
        canCreateGoal: true,
        maxLength: 200,
      },
    ],

    outputType: 'hybrid',
    defaultLifeArea: 'personal_growth',

    tooltips: {
      form: 'Lập kế hoạch tuần giúp bạn có định hướng rõ ràng và tăng hiệu suất.',
      weekly_goals: 'Tick vào mục tiêu bạn muốn theo dõi trong Vision Board.',
    },

    validation: {
      minFieldsFilled: 3,
      requireAtLeastOneAction: true,
    },
  },

  // ==========================================
  // VISION 3-5 YEARS - Tầm nhìn
  // ==========================================
  vision_3_5_years: {
    id: 'vision_3_5_years',
    name: 'Tầm nhìn 3-5 năm',
    nameEn: 'Vision 3-5 Years',
    icon: 'Telescope',
    description: 'Thiết kế cuộc sống lý tưởng',
    category: TEMPLATE_CATEGORIES.HYBRID,

    triggerKeywords: ['tương lai', '5 năm', '3 năm', 'tầm nhìn', 'lý tưởng', 'vision'],
    confidenceThreshold: 0.7,

    requiredTier: TIERS.TIER2, // TIER2 (Premium)

    fields: [
      {
        id: 'career_vision',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Sự nghiệp của bạn 3-5 năm nữa? *',
        placeholder: 'Vị trí, công ty, thu nhập, thành tựu...',
        required: true,
        minRows: 2,
        maxLength: 1000,
        lifeArea: 'career',
      },
      {
        id: 'health_vision',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Sức khỏe và thể chất? *',
        placeholder: 'Cân nặng, thể lực, thói quen...',
        required: true,
        minRows: 2,
        maxLength: 1000,
        lifeArea: 'health',
      },
      {
        id: 'relationship_vision',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Các mối quan hệ (gia đình, bạn bè, tình yêu)? *',
        placeholder: 'Ai bên cạnh bạn? Mối quan hệ như thế nào?',
        required: true,
        minRows: 2,
        maxLength: 1000,
        lifeArea: 'love',
      },
      {
        id: 'finance_vision',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Tài chính? *',
        placeholder: 'Thu nhập, tiết kiệm, đầu tư, tài sản...',
        required: true,
        minRows: 2,
        maxLength: 1000,
        lifeArea: 'finance',
      },
      {
        id: 'first_steps',
        type: FIELD_TYPES.ACTION_LIST,
        label: 'Bước đầu tiên để đi đến tầm nhìn đó?',
        allowAdd: true,
        canCreateGoal: true,
        requireLifeArea: true,
        maxItems: 5,
        defaultChecked: false,
        placeholder: 'Thêm bước đầu...',
      },
    ],

    outputType: 'hybrid',
    defaultLifeArea: 'personal_growth',

    tooltips: {
      form: 'Tầm nhìn rõ ràng là la bàn dẫn lối mọi quyết định.',
      first_steps: 'Tick vào bước đầu tiên bạn muốn cam kết thực hiện.',
    },

    validation: {
      minFieldsFilled: 4,
      requireAtLeastOneAction: false,
    },
  },

  // ==========================================
  // FREE FORM - Suy ngẫm mỗi ngày
  // ==========================================
  free_form: {
    id: 'free_form',
    name: 'Suy ngẫm mỗi ngày',
    nameEn: 'Daily Reflection',
    icon: 'BookOpen',
    description: 'Ghi chép suy nghĩ, trải nghiệm',
    category: TEMPLATE_CATEGORIES.JOURNAL_FOCUSED,

    triggerKeywords: [], // Không auto-trigger
    confidenceThreshold: 1.0,

    requiredTier: TIERS.FREE,

    fields: [
      {
        id: 'title',
        type: FIELD_TYPES.TEXT,
        label: 'Tiêu đề (tùy chọn)',
        placeholder: 'Đặt tên cho bài viết...',
        optional: true,
        maxLength: 200,
      },
      {
        id: 'content',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Viết những gì bạn muốn... *',
        placeholder: 'Suy nghĩ, cảm xúc, ý tưởng...',
        required: true,
        minRows: 10,
        maxLength: 10000,
      },
      {
        id: 'mood',
        type: FIELD_TYPES.MOOD,
        label: 'Tâm trạng',
        optional: true,
      },
      {
        id: 'actions',
        type: FIELD_TYPES.ACTION_LIST,
        label: 'Hành động (nếu có)',
        allowAdd: true,
        canCreateGoal: true,
        requireLifeArea: true,
        maxItems: 5,
        optional: true,
        defaultChecked: false,
        placeholder: 'Thêm hành động...',
      },
    ],

    outputType: 'journal',
    defaultLifeArea: 'personal_growth',

    tooltips: {
      form: 'Viết tự do giúp giải tỏa suy nghĩ và khám phá bản thân.',
    },

    validation: {
      minFieldsFilled: 1,
      requireAtLeastOneAction: false,
    },
  },

  // ==========================================
  // TRADING JOURNAL - Nhật ký giao dịch
  // ==========================================
  trading_journal: {
    id: 'trading_journal',
    name: 'Nhật ký Trading',
    nameEn: 'Trading Journal',
    icon: 'TrendingUp',
    description: 'Ghi chép giao dịch',
    category: TEMPLATE_CATEGORIES.JOURNAL_FOCUSED,

    triggerKeywords: ['lệnh', 'trade', 'giao dịch', 'trading', 'entry', 'exit'],
    confidenceThreshold: 0.8,

    requiredTier: TIERS.TIER2,

    fields: [
      {
        id: 'pair',
        type: FIELD_TYPES.TEXT,
        label: 'Cặp giao dịch *',
        placeholder: 'Ví dụ: BTC/USDT',
        required: true,
        maxLength: 20,
      },
      {
        id: 'direction',
        type: FIELD_TYPES.SELECT,
        label: 'Hướng *',
        options: [
          { value: 'long', label: 'Long (Mua)' },
          { value: 'short', label: 'Short (Bán)' },
        ],
        required: true,
      },
      {
        id: 'entry_price',
        type: FIELD_TYPES.TEXT,
        label: 'Giá vào lệnh *',
        placeholder: '0.00',
        required: true,
        maxLength: 20,
      },
      {
        id: 'exit_price',
        type: FIELD_TYPES.TEXT,
        label: 'Giá thoát lệnh',
        placeholder: '0.00',
        optional: true,
        maxLength: 20,
      },
      {
        id: 'position_size',
        type: FIELD_TYPES.TEXT,
        label: 'Khối lượng *',
        placeholder: '0.00',
        required: true,
        maxLength: 20,
      },
      {
        id: 'pnl',
        type: FIELD_TYPES.TEXT,
        label: 'Lãi/Lỗ (USDT)',
        placeholder: '0.00',
        optional: true,
        maxLength: 20,
      },
      {
        id: 'reason',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Lý do vào lệnh *',
        placeholder: 'Setup, tín hiệu, pattern...',
        required: true,
        minRows: 2,
        maxLength: 1000,
      },
      {
        id: 'lesson',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Bài học',
        placeholder: 'Điều gì tốt? Cần cải thiện gì?',
        optional: true,
        minRows: 2,
        maxLength: 1000,
      },
      {
        id: 'emotion',
        type: FIELD_TYPES.SLIDER,
        label: 'Mức độ tự tin khi vào lệnh',
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 5,
        labels: { 1: 'FOMO', 5: 'Bình thường', 10: 'Tự tin' },
      },
    ],

    outputType: 'journal',
    defaultLifeArea: 'crypto',

    tooltips: {
      form: 'Ghi chép giao dịch giúp bạn phát hiện patterns và cải thiện.',
      emotion: 'Theo dõi cảm xúc giúp tránh FOMO và FUD.',
    },

    validation: {
      minFieldsFilled: 4,
      requireAtLeastOneAction: false,
    },
  },

  // ==========================================
  // SIMPLE EVENT - Sự kiện đơn giản
  // ==========================================
  simple_event: {
    id: 'simple_event',
    name: 'Sự kiện đơn giản',
    nameEn: 'Simple Event',
    icon: 'Calendar',
    description: 'Tạo sự kiện nhanh',
    category: TEMPLATE_CATEGORIES.JOURNAL_FOCUSED,

    triggerKeywords: ['sự kiện', 'event', 'lịch', 'hẹn', 'cuộc họp'],
    confidenceThreshold: 0.8,

    requiredTier: TIERS.FREE,

    fields: [
      {
        id: 'title',
        type: FIELD_TYPES.TEXT,
        label: 'Tiêu đề sự kiện *',
        placeholder: 'Ví dụ: Họp team buổi sáng',
        required: true,
        maxLength: 200,
      },
      {
        id: 'description',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Mô tả (tùy chọn)',
        placeholder: 'Thêm chi tiết về sự kiện...',
        optional: true,
        minRows: 2,
        maxLength: 500,
      },
      {
        id: 'time',
        type: FIELD_TYPES.TEXT,
        label: 'Thời gian',
        placeholder: 'Ví dụ: 9:00 AM',
        optional: true,
        maxLength: 50,
      },
      {
        id: 'location',
        type: FIELD_TYPES.TEXT,
        label: 'Địa điểm',
        placeholder: 'Ví dụ: Phòng họp A',
        optional: true,
        maxLength: 200,
      },
    ],

    outputType: 'journal',
    defaultLifeArea: 'personal_growth',

    tooltips: {
      form: 'Tạo sự kiện nhanh để ghi nhớ các cuộc hẹn quan trọng.',
    },

    validation: {
      minFieldsFilled: 1,
      requireAtLeastOneAction: false,
    },
  },

  // ==========================================
  // PROSPERITY FREQUENCY - Tần số thịnh vượng (VIP)
  // ==========================================
  prosperity_frequency: {
    id: 'prosperity_frequency',
    name: 'Tần Số Thịnh Vượng',
    nameEn: 'Prosperity Frequency',
    icon: 'Sparkles',
    description: 'Tổng hợp tài chính + tâm linh',
    category: TEMPLATE_CATEGORIES.HYBRID,

    triggerKeywords: ['thịnh vượng', 'prosperity', 'tần số', 'frequency', 'law of attraction', 'luật hấp dẫn'],
    confidenceThreshold: 0.8,

    requiredTier: TIERS.TIER3,

    fields: [
      {
        id: 'financial_status',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Tình trạng tài chính hiện tại *',
        placeholder: 'Mô tả chi tiết tình trạng tài chính...',
        required: true,
        minRows: 3,
        maxLength: 2000,
        lifeArea: 'finance',
        suggestions: [
          'Thu nhập ổn định từ công việc chính',
          'Có nguồn thu nhập thụ động từ đầu tư',
          'Đang tiết kiệm được 20-30% thu nhập',
          'Chi tiêu vượt quá thu nhập tháng này',
          'Có quỹ khẩn cấp 6 tháng chi phí',
          'Đang trong giai đoạn tích lũy',
        ],
      },
      {
        id: 'energy_level',
        type: FIELD_TYPES.SLIDER,
        label: 'Năng lượng tài chính hôm nay',
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 5,
        labels: { 1: 'Thiếu hụt', 5: 'Ổn định', 10: 'Dồi dào' },
      },
      {
        id: 'spiritual_reflection',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Suy ngẫm tâm linh về tiền bạc *',
        placeholder: 'Bạn tin gì về tiền bạc?',
        required: true,
        minRows: 3,
        maxLength: 2000,
        lifeArea: 'spiritual',
        suggestions: [
          'Tiền bạc là năng lượng trao đổi giá trị',
          'Tôi có niềm tin giới hạn: tiền khó kiếm',
          'Tôi đang học cách yêu tiền mà không bám víu',
          'Tôi tin rằng mình xứng đáng với sự giàu có',
          'Tiền bạc không xấu, cách dùng mới quan trọng',
          'Tôi cần chữa lành mối quan hệ với tiền bạc',
        ],
      },
      {
        id: 'abundance_affirmation',
        type: FIELD_TYPES.TEXT,
        label: 'Khẳng định sự dồi dào *',
        placeholder: 'Chọn hoặc viết khẳng định...',
        required: true,
        maxLength: 300,
        suggestions: [
          'Tôi xứng đáng được giàu có và hạnh phúc',
          'Tiền bạc đến với tôi dễ dàng và liên tục',
          'Tôi thu hút sự thịnh vượng mỗi ngày',
          'Tôi là nam châm thu hút tài lộc',
          'Vũ trụ luôn cung cấp đủ cho tôi',
          'Tôi biết ơn mọi nguồn thu nhập',
        ],
      },
      {
        id: 'gratitude_money',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Biết ơn về tài chính',
        placeholder: 'Liệt kê những điều bạn biết ơn...',
        required: false,
        minRows: 2,
        maxLength: 1000,
        suggestions: [
          'Biết ơn vì có công việc ổn định',
          'Biết ơn vì có mái nhà che nắng mưa',
          'Biết ơn vì có đủ tiền cho nhu cầu cơ bản',
          'Biết ơn những cơ hội kiếm tiền đến với tôi',
          'Biết ơn khả năng tạo ra giá trị của mình',
        ],
      },
      {
        id: 'money_intentions',
        type: FIELD_TYPES.ACTION_LIST,
        label: 'Ý định tài chính tuần này',
        allowAdd: true,
        canCreateGoal: true,
        requireLifeArea: true,
        maxItems: 5,
        defaultChecked: false,
        placeholder: 'Thêm ý định...',
        suggestions: [
          { text: 'Ghi chép chi tiêu hàng ngày', lifeArea: 'finance' },
          { text: 'Tiết kiệm thêm 10% thu nhập', lifeArea: 'finance' },
          { text: 'Tìm hiểu một kênh đầu tư mới', lifeArea: 'finance' },
          { text: 'Thiền về sự dồi dào 10 phút mỗi sáng', lifeArea: 'spiritual' },
          { text: 'Đọc một cuốn sách về tài chính', lifeArea: 'personal_growth' },
        ],
      },
      {
        id: 'ritual',
        type: FIELD_TYPES.TEXT,
        label: 'Nghi thức thịnh vượng (tùy chọn)',
        placeholder: 'Chọn hoặc tự tạo nghi thức...',
        optional: true,
        canCreateGoal: true,
        maxLength: 200,
      },
    ],

    outputType: 'hybrid',
    defaultLifeArea: 'finance',

    tooltips: {
      form: 'Nhật ký bậc thầy kết hợp tài chính và tâm linh - dành riêng cho VIP.',
      financial_status: 'Mô tả chân thực để nhận diện thực trạng.',
      spiritual_reflection: 'Nhận diện và chuyển hóa những niềm tin giới hạn về tiền bạc.',
      abundance_affirmation: 'Não bộ tin vào những gì bạn khẳng định liên tục.',
      money_intentions: 'Tick vào để tạo mục tiêu theo dõi.',
    },

    validation: {
      minFieldsFilled: 4,
      requireAtLeastOneAction: false,
    },
  },

  // ==========================================
  // ADVANCED TRADING PSYCHOLOGY - Tâm lý giao dịch nâng cao (VIP)
  // ==========================================
  advanced_trading_psychology: {
    id: 'advanced_trading_psychology',
    name: 'Tâm Lý Giao Dịch Nâng Cao',
    nameEn: 'Advanced Trading Psychology',
    icon: 'BrainCircuit',
    description: 'Phân tích bias, kiểm soát tâm lý',
    category: TEMPLATE_CATEGORIES.JOURNAL_FOCUSED,

    triggerKeywords: ['tâm lý trading', 'trading psychology', 'bias', 'FOMO', 'fear', 'greed', 'tham lam'],
    confidenceThreshold: 0.8,

    requiredTier: TIERS.TIER3,

    fields: [
      {
        id: 'session_type',
        type: FIELD_TYPES.SELECT,
        label: 'Loại phiên giao dịch *',
        options: [
          { value: 'pre_session', label: 'Trước phiên - Chuẩn bị tâm lý' },
          { value: 'during_session', label: 'Trong phiên - Ghi nhận real-time' },
          { value: 'post_session', label: 'Sau phiên - Review & phân tích' },
        ],
        required: true,
      },
      {
        id: 'emotional_state',
        type: FIELD_TYPES.SLIDER,
        label: 'Trạng thái cảm xúc',
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 5,
        labels: { 1: 'Sợ hãi', 5: 'Bình tĩnh', 10: 'Tự tin quá mức' },
      },
      {
        id: 'bias_check',
        type: FIELD_TYPES.CHECKLIST,
        label: 'Nhận dạng Bias (tick những gì bạn cảm thấy)',
        allowAdd: false,
        defaultItems: [
          { id: 'fomo', label: 'FOMO - Sợ bỏ lỡ cơ hội', checked: false },
          { id: 'revenge', label: 'Revenge Trading - Gỡ lỗ', checked: false },
          { id: 'overconfidence', label: 'Overconfidence - Quá tự tin', checked: false },
          { id: 'loss_aversion', label: 'Loss Aversion - Sợ lỗ', checked: false },
          { id: 'anchoring', label: 'Anchoring - Neo giá', checked: false },
          { id: 'confirmation', label: 'Confirmation Bias - Tìm kiếm đồng ý', checked: false },
          { id: 'recency', label: 'Recency Bias - Ưu tiên gần đây', checked: false },
          { id: 'sunk_cost', label: 'Sunk Cost - Chi phí chìm', checked: false },
        ],
      },
      {
        id: 'trigger_analysis',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Phân tích nguyên nhân *',
        placeholder: 'Điều gì gây ra những cảm xúc/bias này?',
        required: true,
        minRows: 3,
        maxLength: 2000,
        suggestions: [
          'Xem tin tức tiêu cực về thị trường',
          'Portfolio đang âm nặng',
          'Vừa miss một trade lớn',
          'Áp lực từ việc so sánh với người khác',
          'Giao dịch liên tục không nghỉ ngơi',
          'Kỳ vọng quá cao về profit',
          'Sợ mất số tiền đã kiếm được',
        ],
      },
      {
        id: 'pattern_recognition',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Nhận dạng pattern cảm xúc',
        placeholder: 'Bạn nhận ra pattern nào lặp lại?',
        required: false,
        minRows: 2,
        maxLength: 1500,
        suggestions: [
          'Luôn FOMO sau khi miss trade tốt',
          'Revenge trade ngay sau khi thua',
          'Quá tự tin sau chuỗi thắng liên tiếp',
          'Sợ vào lệnh sau chuỗi thua',
          'Cắt lỗ quá sớm khi đang đúng',
          'Để lỗ chạy quá lâu vì hy vọng',
        ],
      },
      {
        id: 'coping_strategy',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Chiến lược đối phó *',
        placeholder: 'Bạn sẽ làm gì để kiểm soát?',
        required: true,
        minRows: 2,
        maxLength: 1500,
        suggestions: [
          'Tạm dừng trading 24h sau khi thua',
          'Giảm position size 50%',
          'Chỉ trade theo setup đã backtest',
          'Viết journal trước và sau mỗi lệnh',
          'Thiền định 10 phút trước khi trade',
          'Đặt giới hạn lỗ trong ngày',
          'Tắt app sau khi đạt target',
        ],
      },
      {
        id: 'rule_violations',
        type: FIELD_TYPES.CHECKLIST,
        label: 'Vi phạm quy tắc trading (nếu có)',
        allowAdd: true,
        maxItems: 10,
        placeholder: 'Thêm quy tắc đã vi phạm...',
        defaultItems: [
          { id: 'no_sl', label: 'Không đặt Stop Loss', checked: false },
          { id: 'oversize', label: 'Vào lệnh quá size cho phép', checked: false },
          { id: 'no_plan', label: 'Trade không có kế hoạch rõ ràng', checked: false },
          { id: 'against_trend', label: 'Trade ngược trend chính', checked: false },
          { id: 'emotional', label: 'Trade theo cảm xúc, không logic', checked: false },
          { id: 'overtrade', label: 'Overtrade - quá nhiều lệnh', checked: false },
        ],
      },
      {
        id: 'lesson_learned',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Bài học rút ra',
        placeholder: 'Hôm nay bạn học được gì?',
        required: false,
        minRows: 2,
        maxLength: 1000,
        suggestions: [
          'Kiên nhẫn là chìa khóa thành công',
          'Kỷ luật quan trọng hơn chiến thuật',
          'Không có setup hoàn hảo, chỉ có quản lý rủi ro tốt',
          'Cảm xúc là kẻ thù lớn nhất của trader',
          'Nghỉ ngơi đúng lúc giúp trade tốt hơn',
        ],
      },
      {
        id: 'mental_actions',
        type: FIELD_TYPES.ACTION_LIST,
        label: 'Hành động cải thiện tâm lý',
        allowAdd: true,
        canCreateGoal: true,
        requireLifeArea: true,
        maxItems: 5,
        defaultChecked: false,
        placeholder: 'Thêm hành động...',
        suggestions: [
          { text: 'Viết trading plan chi tiết cho tuần tới', lifeArea: 'crypto' },
          { text: 'Backtest chiến lược với 100 trades', lifeArea: 'crypto' },
          { text: 'Thiền định mỗi sáng trước khi mở app', lifeArea: 'health' },
          { text: 'Đọc sách Trading in the Zone', lifeArea: 'personal_growth' },
          { text: 'Tập thể dục để giảm stress', lifeArea: 'health' },
        ],
      },
    ],

    outputType: 'journal',
    defaultLifeArea: 'crypto',

    tooltips: {
      form: 'Nhật ký tâm lý giao dịch chuyên sâu - giúp bạn nhận diện và kiểm soát bias.',
      bias_check: 'Tick vào những bias bạn cảm thấy để theo dõi pattern theo thời gian.',
      trigger_analysis: 'Hiểu nguyên nhân giúp bạn kiểm soát tốt hơn.',
      pattern_recognition: 'Nhận ra pattern lặp lại là bước đầu tiên để thay đổi.',
      coping_strategy: 'Chọn chiến lược phù hợp với tình huống của bạn.',
      mental_actions: 'Tick vào hành động bạn cam kết để tạo mục tiêu theo dõi.',
    },

    validation: {
      minFieldsFilled: 4,
      requireAtLeastOneAction: false,
    },
  },
};

// ========== HELPER FUNCTIONS ==========

/**
 * Get template by ID
 * @param {string} templateId
 * @returns {Object|null}
 */
export const getTemplate = (templateId) => {
  return TEMPLATES[templateId] || null;
};

/**
 * Get all templates
 * @returns {Array}
 */
export const getAllTemplates = () => {
  return Object.values(TEMPLATES);
};

/**
 * Get templates by category
 * @param {string} category
 * @returns {Array}
 */
export const getTemplatesByCategory = (category) => {
  return Object.values(TEMPLATES).filter((t) => t.category === category);
};

/**
 * Get templates available for user tier
 * Uses centralized templateAccessControl.js for consistent tier checking
 * @param {string} userTier
 * @returns {Array}
 */
export const getTemplatesForTier = (userTier) => {
  // Import dynamically to avoid circular dependency
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { checkTemplateAccess } = require('../../config/templateAccessControl');

  return Object.values(TEMPLATES).filter((template) => {
    const access = checkTemplateAccess(template.id, userTier);
    return access.allowed;
  });
};

/**
 * Check if user can access template
 * DELEGATES to centralized templateAccessControl.js for consistent tier checking
 * @param {string} templateId
 * @param {string} userTier
 * @param {string} userRole - Optional role for admin/manager bypass
 * @returns {Object} { allowed: boolean, reason?: string, upgradeRequired?: string }
 */
export const canAccessTemplate = (templateId, userTier, userRole = null) => {
  const template = TEMPLATES[templateId];
  if (!template) {
    return { allowed: false, reason: 'Template không tồn tại' };
  }

  // Import dynamically to avoid circular dependency
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { checkTemplateAccess, getUpgradePromptForTemplate } = require('../../config/templateAccessControl');

  // Use centralized access control
  const access = checkTemplateAccess(templateId, userTier, userRole);

  if (!access.allowed) {
    // Get upgrade info for more detailed message
    const upgradeInfo = getUpgradePromptForTemplate(templateId, userTier);
    return {
      allowed: false,
      reason: access.reason || `Cần nâng cấp lên ${upgradeInfo.targetTier} để sử dụng`,
      upgradeRequired: upgradeInfo.targetTier,
    };
  }

  return { allowed: true };
};

/**
 * Get life area by ID
 * @param {string} lifeAreaId
 * @returns {Object|null}
 */
export const getLifeArea = (lifeAreaId) => {
  return LIFE_AREAS[lifeAreaId] || null;
};

/**
 * Get all life areas
 * @returns {Array}
 */
export const getAllLifeAreas = () => {
  return Object.values(LIFE_AREAS);
};

/**
 * Get templates that can be triggered by keywords
 * @returns {Array}
 */
export const getTriggeredTemplates = () => {
  return Object.values(TEMPLATES).filter(
    (t) => t.triggerKeywords && t.triggerKeywords.length > 0
  );
};

export default {
  FIELD_TYPES,
  LIFE_AREAS,
  TEMPLATE_CATEGORIES,
  TIERS,
  TEMPLATES,
  getTemplate,
  getAllTemplates,
  getTemplatesByCategory,
  getTemplatesForTier,
  canAccessTemplate,
  getLifeArea,
  getAllLifeAreas,
  getTriggeredTemplates,
};
