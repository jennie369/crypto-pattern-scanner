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

    requiredTier: TIERS.FREE,

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

    requiredTier: TIERS.FREE,

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

    requiredTier: TIERS.FREE,

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

    requiredTier: TIERS.TIER1,

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
  // FREE FORM - Tự do
  // ==========================================
  free_form: {
    id: 'free_form',
    name: 'Tự do',
    nameEn: 'Free Form',
    icon: 'Edit3',
    description: 'Viết bất cứ điều gì',
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
 * @param {string} userTier
 * @returns {Array}
 */
export const getTemplatesForTier = (userTier) => {
  const tierOrder = [TIERS.FREE, TIERS.TIER1, TIERS.TIER2, TIERS.TIER3];
  const userTierIndex = tierOrder.indexOf(userTier?.toLowerCase() || TIERS.FREE);

  return Object.values(TEMPLATES).filter((template) => {
    const requiredIndex = tierOrder.indexOf(template.requiredTier);
    return requiredIndex <= userTierIndex;
  });
};

/**
 * Check if user can access template
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

  // Admin/Manager bypass - check both role and tier
  const normalizedTier = userTier?.toString().toLowerCase() || 'free';
  const normalizedRole = userRole?.toString().toLowerCase() || '';

  if (normalizedRole === 'admin' || normalizedRole === 'manager' ||
      normalizedTier === 'admin' || normalizedTier === 'manager') {
    return { allowed: true };
  }

  const tierOrder = [TIERS.FREE, TIERS.TIER1, TIERS.TIER2, TIERS.TIER3];
  const userTierIndex = tierOrder.indexOf(normalizedTier);
  const requiredTierIndex = tierOrder.indexOf(template.requiredTier);

  // If user tier not found in order, default to free (index 0)
  const effectiveUserIndex = userTierIndex >= 0 ? userTierIndex : 0;

  if (effectiveUserIndex < requiredTierIndex) {
    const tierNames = {
      [TIERS.FREE]: 'Miễn phí',
      [TIERS.TIER1]: 'Tier 1',
      [TIERS.TIER2]: 'Tier 2',
      [TIERS.TIER3]: 'Tier 3',
    };
    return {
      allowed: false,
      reason: `Cần nâng cấp lên ${tierNames[template.requiredTier] || template.requiredTier} để sử dụng`,
      upgradeRequired: template.requiredTier,
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
