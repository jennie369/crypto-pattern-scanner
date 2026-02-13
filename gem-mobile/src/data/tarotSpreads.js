/**
 * Tarot Spreads Configuration
 * Contains spread types, positions, and layout information
 */

export const SPREAD_CATEGORIES = [
  { id: 'all', label: 'Tất cả', icon: 'Grid3X3' },
  { id: 'general', label: 'Tổng quát', icon: 'Sparkles' },
  { id: 'love', label: 'Tình yêu', icon: 'Heart' },
  { id: 'career', label: 'Sự nghiệp', icon: 'Briefcase' },
  { id: 'trading', label: 'Trading', icon: 'TrendingUp' },
  { id: 'advanced', label: 'Nâng cao', icon: 'Crown' },
];

export const LIFE_AREAS = [
  { id: 'general', label: 'Tổng quát', icon: 'Sparkles', color: '#6A5BFF' },
  { id: 'love', label: 'Tình yêu', icon: 'Heart', color: '#FF6B6B' },
  { id: 'career', label: 'Sự nghiệp', icon: 'Briefcase', color: '#FFBD59' },
  { id: 'health', label: 'Sức khỏe', icon: 'Activity', color: '#3AF7A6' },
  { id: 'money', label: 'Tài chính', icon: 'DollarSign', color: '#FFD700' },
  { id: 'family', label: 'Gia đình', icon: 'Home', color: '#00F0FF' },
  { id: 'trading', label: 'Trading', icon: 'TrendingUp', color: '#9C0612' },
];

// Celtic Cross Layout Positions (relative coordinates 0-1)
// Traditional layout: Cross on left, Staff column on right
export const CELTIC_CROSS_LAYOUT = [
  { index: 0, x: 0.28, y: 0.42, rotation: 0 },     // 1. Center/Heart
  { index: 1, x: 0.28, y: 0.58, rotation: 0 },     // 2. Crossing/Challenge
  { index: 2, x: 0.28, y: 0.82, rotation: 0 },     // 3. Foundation (below)
  { index: 3, x: 0.10, y: 0.50, rotation: 0 },     // 4. Recent past (far left)
  { index: 4, x: 0.28, y: 0.18, rotation: 0 },     // 5. Crown (above)
  { index: 5, x: 0.46, y: 0.50, rotation: 0 },     // 6. Near future (right of center)
  { index: 6, x: 0.72, y: 0.82, rotation: 0 },     // 7. Self (staff bottom)
  { index: 7, x: 0.72, y: 0.61, rotation: 0 },     // 8. External
  { index: 8, x: 0.72, y: 0.40, rotation: 0 },     // 9. Hopes & Fears
  { index: 9, x: 0.72, y: 0.18, rotation: 0 },     // 10. Final Outcome (staff top)
];

// Horizontal Layout (different card counts)
// Optimized x positions to stay within safe margins
export const HORIZONTAL_LAYOUT = {
  1: [
    { index: 0, x: 0.5, y: 0.5, rotation: 0 },
  ],
  3: [
    { index: 0, x: 0.18, y: 0.5, rotation: 0 },
    { index: 1, x: 0.5, y: 0.5, rotation: 0 },
    { index: 2, x: 0.82, y: 0.5, rotation: 0 },
  ],
  5: [
    { index: 0, x: 0.12, y: 0.5, rotation: 0 },
    { index: 1, x: 0.31, y: 0.5, rotation: 0 },
    { index: 2, x: 0.5, y: 0.5, rotation: 0 },
    { index: 3, x: 0.69, y: 0.5, rotation: 0 },
    { index: 4, x: 0.88, y: 0.5, rotation: 0 },
  ],
  6: [
    { index: 0, x: 0.18, y: 0.32, rotation: 0 },
    { index: 1, x: 0.5, y: 0.32, rotation: 0 },
    { index: 2, x: 0.82, y: 0.32, rotation: 0 },
    { index: 3, x: 0.18, y: 0.68, rotation: 0 },
    { index: 4, x: 0.5, y: 0.68, rotation: 0 },
    { index: 5, x: 0.82, y: 0.68, rotation: 0 },
  ],
};

// Tier requirements mapping
export const TIER_REQUIREMENTS = {
  FREE: 0,
  TIER1: 1,
  PRO: 1,
  TIER2: 2,
  PREMIUM: 2,
  TIER3: 3,
  VIP: 3,
  ADMIN: 99,
};

/**
 * Get numeric tier level from tier string
 */
export const getTierLevel = (tier) => {
  if (!tier) return 0;
  return TIER_REQUIREMENTS[tier?.toUpperCase()] || 0;
};

/**
 * Check if user can access a spread based on tier
 */
export const canAccessSpread = (userTier, requiredTier) => {
  const userLevel = getTierLevel(userTier);
  const requiredLevel = getTierLevel(requiredTier);
  return userLevel >= requiredLevel;
};

/**
 * Get tier badge color
 */
export const getTierColor = (tier) => {
  const tierColors = {
    FREE: 'rgba(255, 255, 255, 0.2)',
    TIER1: '#FFBD59',
    PRO: '#FFBD59',
    TIER2: '#3B82F6',
    PREMIUM: '#3B82F6',
    TIER3: '#9C0612',
    VIP: '#9C0612',
    ADMIN: '#6A5BFF',
  };
  return tierColors[tier?.toUpperCase()] || tierColors.FREE;
};

/**
 * Get tier display name
 */
export const getTierDisplayName = (tier) => {
  const tierNames = {
    FREE: 'Miễn phí',
    TIER1: 'Tier 1',
    PRO: 'Pro',
    TIER2: 'Tier 2',
    PREMIUM: 'Premium',
    TIER3: 'Tier 3',
    VIP: 'VIP',
    ADMIN: 'Admin',
  };
  return tierNames[tier?.toUpperCase()] || 'Miễn phí';
};

// Question prompts by life area
export const QUESTION_PROMPTS = {
  general: [
    'Tôi cần biết điều gì hôm nay?',
    'Năng lượng xung quanh tôi là gì?',
    'Điều gì đang ngăn cản tôi tiến về phía trước?',
    'Tôi nên tập trung vào điều gì?',
  ],
  love: [
    'Năng lượng mối quan hệ của tôi hiện tại?',
    'Tôi đã sẵn sàng cho tình yêu chưa?',
    'Điều gì cần chữa lành trong trái tim tôi?',
    'Làm thế nào để cải thiện mối quan hệ?',
  ],
  career: [
    'Tôi nên tập trung vào điều gì trong sự nghiệp?',
    'Đây có phải là công việc phù hợp với tôi?',
    'Cơ hội nghề nghiệp nào đang đến?',
    'Làm thế nào để phát triển kỹ năng?',
  ],
  trading: [
    'Năng lượng thị trường hôm nay như thế nào?',
    'Tôi có nên vào lệnh này không?',
    'Chiến lược giao dịch tuần này?',
    'Điều gì đang ảnh hưởng đến quyết định của tôi?',
  ],
  health: [
    'Sức khỏe của tôi cần chú ý điều gì?',
    'Làm thế nào để cân bằng năng lượng?',
    'Tôi nên chăm sóc bản thân như thế nào?',
    'Điều gì đang gây stress cho tôi?',
  ],
  money: [
    'Tình hình tài chính của tôi như thế nào?',
    'Cơ hội tài chính nào đang đến?',
    'Tôi nên cẩn thận điều gì về tiền bạc?',
    'Làm thế nào để cải thiện tài chính?',
  ],
  family: [
    'Năng lượng gia đình tôi hiện tại?',
    'Làm thế nào để cải thiện quan hệ gia đình?',
    'Điều gì cần chữa lành trong gia đình?',
    'Tôi có thể hỗ trợ gia đình như thế nào?',
  ],
};

// Default local spreads (fallback if API fails)
export const DEFAULT_SPREADS = [
  {
    spread_id: 'single-card',
    name_vi: 'Một Lá',
    name_en: 'Single Card',
    description_vi: 'Rút một lá để nhận thông điệp nhanh cho ngày hôm nay.',
    cards: 1,
    category: 'general',
    tier_required: 'FREE',
    positions: [
      { index: 0, name_vi: 'Thông điệp hôm nay', name_en: "Today's Message", description_vi: 'Năng lượng và hướng dẫn cho ngày hôm nay' },
    ],
    layout_type: 'horizontal',
    estimated_time: '2-3 phút',
    display_order: 1,
  },
  {
    spread_id: 'past-present-future',
    name_vi: 'Quá Khứ - Hiện Tại - Tương Lai',
    name_en: 'Past Present Future',
    description_vi: 'Trải 3 lá kinh điển để thấy dòng chảy thời gian của vấn đề.',
    cards: 3,
    category: 'general',
    tier_required: 'FREE',
    positions: [
      { index: 0, name_vi: 'Quá khứ', name_en: 'Past', description_vi: 'Những gì đã xảy ra và ảnh hưởng đến hiện tại' },
      { index: 1, name_vi: 'Hiện tại', name_en: 'Present', description_vi: 'Tình huống và năng lượng hiện tại' },
      { index: 2, name_vi: 'Tương lai', name_en: 'Future', description_vi: 'Hướng đi và kết quả có thể xảy ra' },
    ],
    layout_type: 'horizontal',
    estimated_time: '5-7 phút',
    display_order: 2,
  },
  {
    spread_id: 'mind-body-spirit',
    name_vi: 'Tâm - Thân - Linh',
    name_en: 'Mind Body Spirit',
    description_vi: 'Khám phá sự cân bằng giữa tâm trí, thể xác và tâm thức.',
    cards: 3,
    category: 'general',
    tier_required: 'FREE',
    positions: [
      { index: 0, name_vi: 'Tâm trí', name_en: 'Mind', description_vi: 'Trạng thái tinh thần và suy nghĩ' },
      { index: 1, name_vi: 'Thể xác', name_en: 'Body', description_vi: 'Sức khỏe và năng lượng vật lý' },
      { index: 2, name_vi: 'Tâm thức', name_en: 'Spirit', description_vi: 'Kết nối tâm thức và trực giác' },
    ],
    layout_type: 'horizontal',
    estimated_time: '5-7 phút',
    display_order: 3,
  },
  {
    spread_id: 'decision-making',
    name_vi: 'Ra Quyết Định',
    name_en: 'Decision Making',
    description_vi: 'So sánh hai lựa chọn và nhận lời khuyên từ vũ trụ.',
    cards: 3,
    category: 'general',
    tier_required: 'FREE',
    positions: [
      { index: 0, name_vi: 'Lựa chọn A', name_en: 'Option A', description_vi: 'Năng lượng và kết quả của lựa chọn đầu tiên' },
      { index: 1, name_vi: 'Lựa chọn B', name_en: 'Option B', description_vi: 'Năng lượng và kết quả của lựa chọn thứ hai' },
      { index: 2, name_vi: 'Lời khuyên', name_en: 'Advice', description_vi: 'Hướng dẫn từ vũ trụ' },
    ],
    layout_type: 'horizontal',
    estimated_time: '5-7 phút',
    display_order: 4,
  },
  {
    spread_id: 'celtic-cross',
    name_vi: 'Celtic Cross',
    name_en: 'Celtic Cross',
    description_vi: 'Trải bài nâng cao với 10 lá, phân tích sâu mọi khía cạnh.',
    cards: 10,
    category: 'advanced',
    tier_required: 'TIER1',
    positions: [
      { index: 0, name_vi: 'Hiện tại/Trái tim', name_en: 'Present/Heart', description_vi: 'Tình huống hiện tại và bản chất vấn đề' },
      { index: 1, name_vi: 'Thách thức', name_en: 'Challenge', description_vi: 'Trở ngại hoặc năng lượng đối lập' },
      { index: 2, name_vi: 'Nền tảng', name_en: 'Foundation', description_vi: 'Nguồn gốc, quá khứ xa' },
      { index: 3, name_vi: 'Quá khứ gần', name_en: 'Recent Past', description_vi: 'Những sự kiện gần đây ảnh hưởng' },
      { index: 4, name_vi: 'Kết quả tốt nhất', name_en: 'Best Outcome', description_vi: 'Khả năng tốt nhất có thể đạt được' },
      { index: 5, name_vi: 'Tương lai gần', name_en: 'Near Future', description_vi: 'Những gì sẽ xảy ra trong 2-3 tháng' },
      { index: 6, name_vi: 'Bản thân', name_en: 'Self', description_vi: 'Thái độ và cách bạn đang tiếp cận' },
      { index: 7, name_vi: 'Ảnh hưởng bên ngoài', name_en: 'External', description_vi: 'Môi trường và người xung quanh' },
      { index: 8, name_vi: 'Hy vọng & Sợ hãi', name_en: 'Hopes & Fears', description_vi: 'Điều bạn mong muốn và lo ngại' },
      { index: 9, name_vi: 'Kết quả cuối cùng', name_en: 'Final Outcome', description_vi: 'Kết quả nếu đi theo hướng hiện tại' },
    ],
    layout_type: 'cross',
    estimated_time: '15-20 phút',
    display_order: 10,
  },
  {
    spread_id: 'should-i-buy',
    name_vi: 'Nên Mua Không?',
    name_en: 'Should I Buy?',
    description_vi: 'Hỏi thị trường về quyết định entry/exit/hold.',
    cards: 3,
    category: 'trading',
    tier_required: 'TIER1',
    positions: [
      { index: 0, name_vi: 'Năng lượng thị trường', name_en: 'Market Energy', description_vi: 'Sentiment và xu hướng thị trường hiện tại' },
      { index: 1, name_vi: 'Quyết định', name_en: 'Decision', description_vi: 'Entry / Exit / Hold - Hướng dẫn hành động' },
      { index: 2, name_vi: 'Kết quả', name_en: 'Outcome', description_vi: 'Kết quả tiềm năng của quyết định' },
    ],
    layout_type: 'horizontal',
    estimated_time: '5-7 phút',
    display_order: 40,
  },
  {
    spread_id: 'market-outlook',
    name_vi: 'Triển Vọng Thị Trường',
    name_en: 'Market Outlook',
    description_vi: 'Phân tích toàn diện thị trường với 5 lá.',
    cards: 5,
    category: 'trading',
    tier_required: 'TIER1',
    positions: [
      { index: 0, name_vi: 'Tình trạng hiện tại', name_en: 'Current State', description_vi: 'Năng lượng thị trường ngay bây giờ' },
      { index: 1, name_vi: 'Ảnh hưởng ẩn', name_en: 'Hidden Influences', description_vi: 'Các yếu tố chưa được nhận ra' },
      { index: 2, name_vi: 'Rủi ro', name_en: 'Risks', description_vi: 'Nguy cơ cần cảnh giác' },
      { index: 3, name_vi: 'Cơ hội', name_en: 'Opportunities', description_vi: 'Cơ hội có thể nắm bắt' },
      { index: 4, name_vi: 'Dự báo tuần', name_en: 'Weekly Forecast', description_vi: 'Xu hướng tuần tới' },
    ],
    layout_type: 'horizontal',
    estimated_time: '10-12 phút',
    display_order: 41,
  },
  {
    spread_id: 'love-relationship',
    name_vi: 'Mối Quan Hệ Tình Yêu',
    name_en: 'Love Relationship',
    description_vi: 'Khám phá năng lượng giữa bạn và đối phương.',
    cards: 6,
    category: 'love',
    tier_required: 'TIER1',
    positions: [
      { index: 0, name_vi: 'Bạn', name_en: 'You', description_vi: 'Năng lượng và cảm xúc của bạn' },
      { index: 1, name_vi: 'Đối phương', name_en: 'Partner', description_vi: 'Năng lượng và cảm xúc của đối phương' },
      { index: 2, name_vi: 'Kết nối', name_en: 'Connection', description_vi: 'Năng lượng chung giữa hai người' },
      { index: 3, name_vi: 'Thách thức', name_en: 'Challenge', description_vi: 'Trở ngại cần vượt qua' },
      { index: 4, name_vi: 'Điểm mạnh', name_en: 'Strength', description_vi: 'Điều làm mối quan hệ vững chắc' },
      { index: 5, name_vi: 'Hướng đi', name_en: 'Direction', description_vi: 'Tương lai của mối quan hệ' },
    ],
    layout_type: 'custom',
    estimated_time: '10-12 phút',
    display_order: 20,
  },
  {
    spread_id: 'career-path',
    name_vi: 'Con Đường Sự Nghiệp',
    name_en: 'Career Path',
    description_vi: 'Phân tích sự nghiệp với 5 khía cạnh quan trọng.',
    cards: 5,
    category: 'career',
    tier_required: 'TIER1',
    positions: [
      { index: 0, name_vi: 'Vị trí hiện tại', name_en: 'Current Position', description_vi: 'Tình trạng sự nghiệp hiện tại' },
      { index: 1, name_vi: 'Mục tiêu', name_en: 'Goals', description_vi: 'Điều bạn đang hướng tới' },
      { index: 2, name_vi: 'Trở ngại', name_en: 'Obstacles', description_vi: 'Thách thức trên con đường' },
      { index: 3, name_vi: 'Cơ hội', name_en: 'Opportunities', description_vi: 'Cơ hội đang mở ra' },
      { index: 4, name_vi: 'Kết quả', name_en: 'Outcome', description_vi: 'Kết quả nếu theo đuổi' },
    ],
    layout_type: 'horizontal',
    estimated_time: '8-10 phút',
    display_order: 30,
  },
];

/**
 * Get category icon component name
 */
export const getCategoryIcon = (categoryId) => {
  const category = SPREAD_CATEGORIES.find(c => c.id === categoryId);
  return category?.icon || 'Sparkles';
};

/**
 * Get life area by ID
 */
export const getLifeAreaById = (areaId) => {
  return LIFE_AREAS.find(a => a.id === areaId) || LIFE_AREAS[0];
};

/**
 * Get question prompts for a life area
 */
export const getPromptsForArea = (areaId) => {
  return QUESTION_PROMPTS[areaId] || QUESTION_PROMPTS.general;
};

export default {
  SPREAD_CATEGORIES,
  LIFE_AREAS,
  CELTIC_CROSS_LAYOUT,
  HORIZONTAL_LAYOUT,
  TIER_REQUIREMENTS,
  QUESTION_PROMPTS,
  DEFAULT_SPREADS,
  getTierLevel,
  canAccessSpread,
  getTierColor,
  getTierDisplayName,
  getCategoryIcon,
  getLifeAreaById,
  getPromptsForArea,
};
