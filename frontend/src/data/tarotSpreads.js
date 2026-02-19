/**
 * Tarot Spreads Configuration (Web)
 * Ported from gem-mobile/src/data/tarotSpreads.js
 *
 * Contains spread types, positions, layout information, and tier gating
 */

export const SPREAD_CATEGORIES = [
  { id: 'all', label: 'All', icon: 'Grid3X3' },
  { id: 'general', label: 'General', icon: 'Sparkles' },
  { id: 'love', label: 'Love', icon: 'Heart' },
  { id: 'career', label: 'Career', icon: 'Briefcase' },
  { id: 'trading', label: 'Trading', icon: 'TrendingUp' },
  { id: 'advanced', label: 'Advanced', icon: 'Crown' },
];

export const LIFE_AREAS = [
  { id: 'general', label: 'General', icon: 'Sparkles', color: '#6A5BFF' },
  { id: 'love', label: 'Love', icon: 'Heart', color: '#FF6B6B' },
  { id: 'career', label: 'Career', icon: 'Briefcase', color: '#FFBD59' },
  { id: 'health', label: 'Health', icon: 'Activity', color: '#3AF7A6' },
  { id: 'money', label: 'Finance', icon: 'DollarSign', color: '#FFD700' },
  { id: 'family', label: 'Family', icon: 'Home', color: '#00F0FF' },
  { id: 'trading', label: 'Trading', icon: 'TrendingUp', color: '#9C0612' },
];

// Celtic Cross Layout Positions (relative coordinates 0-1)
export const CELTIC_CROSS_LAYOUT = [
  { index: 0, x: 0.28, y: 0.42, rotation: 0 },
  { index: 1, x: 0.28, y: 0.58, rotation: 0 },
  { index: 2, x: 0.28, y: 0.82, rotation: 0 },
  { index: 3, x: 0.10, y: 0.50, rotation: 0 },
  { index: 4, x: 0.28, y: 0.18, rotation: 0 },
  { index: 5, x: 0.46, y: 0.50, rotation: 0 },
  { index: 6, x: 0.72, y: 0.82, rotation: 0 },
  { index: 7, x: 0.72, y: 0.61, rotation: 0 },
  { index: 8, x: 0.72, y: 0.40, rotation: 0 },
  { index: 9, x: 0.72, y: 0.18, rotation: 0 },
];

export const HORIZONTAL_LAYOUT = {
  1: [{ index: 0, x: 0.5, y: 0.5, rotation: 0 }],
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

export const getTierLevel = (tier) => {
  if (!tier) return 0;
  return TIER_REQUIREMENTS[tier?.toUpperCase()] || 0;
};

export const canAccessSpread = (userTier, requiredTier) => {
  const userLevel = getTierLevel(userTier);
  const requiredLevel = getTierLevel(requiredTier);
  return userLevel >= requiredLevel;
};

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

export const getTierDisplayName = (tier) => {
  const tierNames = {
    FREE: 'Free',
    TIER1: 'Tier 1',
    PRO: 'Pro',
    TIER2: 'Tier 2',
    PREMIUM: 'Premium',
    TIER3: 'Tier 3',
    VIP: 'VIP',
    ADMIN: 'Admin',
  };
  return tierNames[tier?.toUpperCase()] || 'Free';
};

export const QUESTION_PROMPTS = {
  general: [
    'What do I need to know today?',
    'What energy surrounds me?',
    'What is holding me back?',
    'What should I focus on?',
  ],
  love: [
    'What is the energy of my relationship?',
    'Am I ready for love?',
    'What needs healing in my heart?',
    'How can I improve my relationship?',
  ],
  career: [
    'What should I focus on in my career?',
    'Is this the right job for me?',
    'What career opportunities are coming?',
    'How can I develop my skills?',
  ],
  trading: [
    'What is the market energy today?',
    'Should I enter this trade?',
    'What is my trading strategy this week?',
    'What is influencing my decisions?',
  ],
  health: [
    'What does my health need attention on?',
    'How can I balance my energy?',
    'How should I care for myself?',
    'What is causing me stress?',
  ],
  money: [
    'How is my financial situation?',
    'What financial opportunities are coming?',
    'What should I be careful about with money?',
    'How can I improve my finances?',
  ],
  family: [
    'What is my family energy right now?',
    'How can I improve family relationships?',
    'What needs healing in my family?',
    'How can I support my family?',
  ],
};

// Default local spreads (fallback if API fails)
export const DEFAULT_SPREADS = [
  {
    spread_id: 'single-card',
    name_vi: 'Mot La',
    name_en: 'Single Card',
    description_vi: 'Rut mot la de nhan thong diep nhanh cho ngay hom nay.',
    cards: 1,
    category: 'general',
    tier_required: 'FREE',
    positions: [
      { index: 0, name_vi: 'Thong diep hom nay', name_en: "Today's Message", description_vi: 'Nang luong va huong dan cho ngay hom nay' },
    ],
    layout_type: 'horizontal',
    estimated_time: '2-3 min',
    display_order: 1,
  },
  {
    spread_id: 'past-present-future',
    name_vi: 'Qua Khu - Hien Tai - Tuong Lai',
    name_en: 'Past Present Future',
    description_vi: 'Trai 3 la kinh dien de thay dong chay thoi gian.',
    cards: 3,
    category: 'general',
    tier_required: 'FREE',
    positions: [
      { index: 0, name_vi: 'Qua khu', name_en: 'Past', description_vi: 'Those that have happened and affect the present' },
      { index: 1, name_vi: 'Hien tai', name_en: 'Present', description_vi: 'Current situation and energy' },
      { index: 2, name_vi: 'Tuong lai', name_en: 'Future', description_vi: 'Direction and possible outcome' },
    ],
    layout_type: 'horizontal',
    estimated_time: '5-7 min',
    display_order: 2,
  },
  {
    spread_id: 'mind-body-spirit',
    name_vi: 'Tam - Than - Linh',
    name_en: 'Mind Body Spirit',
    description_vi: 'Kham pha su can bang giua tam tri, the xac va tam thuc.',
    cards: 3,
    category: 'general',
    tier_required: 'FREE',
    positions: [
      { index: 0, name_vi: 'Tam tri', name_en: 'Mind', description_vi: 'Mental state and thoughts' },
      { index: 1, name_vi: 'The xac', name_en: 'Body', description_vi: 'Health and physical energy' },
      { index: 2, name_vi: 'Tam thuc', name_en: 'Spirit', description_vi: 'Spiritual connection and intuition' },
    ],
    layout_type: 'horizontal',
    estimated_time: '5-7 min',
    display_order: 3,
  },
  {
    spread_id: 'decision-making',
    name_vi: 'Ra Quyet Dinh',
    name_en: 'Decision Making',
    description_vi: 'So sanh hai lua chon va nhan loi khuyen.',
    cards: 3,
    category: 'general',
    tier_required: 'FREE',
    positions: [
      { index: 0, name_vi: 'Lua chon A', name_en: 'Option A', description_vi: 'Energy and outcome of first choice' },
      { index: 1, name_vi: 'Lua chon B', name_en: 'Option B', description_vi: 'Energy and outcome of second choice' },
      { index: 2, name_vi: 'Loi khuyen', name_en: 'Advice', description_vi: 'Guidance from the universe' },
    ],
    layout_type: 'horizontal',
    estimated_time: '5-7 min',
    display_order: 4,
  },
  {
    spread_id: 'celtic-cross',
    name_vi: 'Celtic Cross',
    name_en: 'Celtic Cross',
    description_vi: 'Trai bai nang cao voi 10 la, phan tich sau moi khia canh.',
    cards: 10,
    category: 'advanced',
    tier_required: 'TIER1',
    positions: [
      { index: 0, name_vi: 'Hien tai/Trai tim', name_en: 'Present/Heart', description_vi: 'Current situation and core issue' },
      { index: 1, name_vi: 'Thach thuc', name_en: 'Challenge', description_vi: 'Obstacle or opposing energy' },
      { index: 2, name_vi: 'Nen tang', name_en: 'Foundation', description_vi: 'Origin, distant past' },
      { index: 3, name_vi: 'Qua khu gan', name_en: 'Recent Past', description_vi: 'Recent events with influence' },
      { index: 4, name_vi: 'Ket qua tot nhat', name_en: 'Best Outcome', description_vi: 'Best possible result' },
      { index: 5, name_vi: 'Tuong lai gan', name_en: 'Near Future', description_vi: 'What will happen in 2-3 months' },
      { index: 6, name_vi: 'Ban than', name_en: 'Self', description_vi: 'Your attitude and approach' },
      { index: 7, name_vi: 'Anh huong ben ngoai', name_en: 'External', description_vi: 'Environment and people around you' },
      { index: 8, name_vi: 'Hy vong & So hai', name_en: 'Hopes & Fears', description_vi: 'What you hope for and fear' },
      { index: 9, name_vi: 'Ket qua cuoi cung', name_en: 'Final Outcome', description_vi: 'Outcome if you follow current path' },
    ],
    layout_type: 'cross',
    estimated_time: '15-20 min',
    display_order: 10,
  },
  {
    spread_id: 'should-i-buy',
    name_vi: 'Nen Mua Khong?',
    name_en: 'Should I Buy?',
    description_vi: 'Ask the market about entry/exit/hold decision.',
    cards: 3,
    category: 'trading',
    tier_required: 'TIER1',
    positions: [
      { index: 0, name_vi: 'Nang luong thi truong', name_en: 'Market Energy', description_vi: 'Market sentiment and current trend' },
      { index: 1, name_vi: 'Quyet dinh', name_en: 'Decision', description_vi: 'Entry / Exit / Hold guidance' },
      { index: 2, name_vi: 'Ket qua', name_en: 'Outcome', description_vi: 'Potential outcome of the decision' },
    ],
    layout_type: 'horizontal',
    estimated_time: '5-7 min',
    display_order: 40,
  },
  {
    spread_id: 'market-outlook',
    name_vi: 'Trien Vong Thi Truong',
    name_en: 'Market Outlook',
    description_vi: 'Comprehensive market analysis with 5 cards.',
    cards: 5,
    category: 'trading',
    tier_required: 'TIER1',
    positions: [
      { index: 0, name_vi: 'Tinh trang hien tai', name_en: 'Current State', description_vi: 'Market energy right now' },
      { index: 1, name_vi: 'Anh huong an', name_en: 'Hidden Influences', description_vi: 'Factors not yet recognized' },
      { index: 2, name_vi: 'Rui ro', name_en: 'Risks', description_vi: 'Risks to watch for' },
      { index: 3, name_vi: 'Co hoi', name_en: 'Opportunities', description_vi: 'Opportunities to seize' },
      { index: 4, name_vi: 'Du bao tuan', name_en: 'Weekly Forecast', description_vi: 'Next week trend' },
    ],
    layout_type: 'horizontal',
    estimated_time: '10-12 min',
    display_order: 41,
  },
  {
    spread_id: 'love-relationship',
    name_vi: 'Moi Quan He Tinh Yeu',
    name_en: 'Love Relationship',
    description_vi: 'Explore the energy between you and your partner.',
    cards: 6,
    category: 'love',
    tier_required: 'TIER1',
    positions: [
      { index: 0, name_vi: 'Ban', name_en: 'You', description_vi: 'Your energy and feelings' },
      { index: 1, name_vi: 'Doi phuong', name_en: 'Partner', description_vi: "Partner's energy and feelings" },
      { index: 2, name_vi: 'Ket noi', name_en: 'Connection', description_vi: 'Shared energy between you two' },
      { index: 3, name_vi: 'Thach thuc', name_en: 'Challenge', description_vi: 'Obstacle to overcome' },
      { index: 4, name_vi: 'Diem manh', name_en: 'Strength', description_vi: 'What makes the relationship strong' },
      { index: 5, name_vi: 'Huong di', name_en: 'Direction', description_vi: 'Future of the relationship' },
    ],
    layout_type: 'custom',
    estimated_time: '10-12 min',
    display_order: 20,
  },
  {
    spread_id: 'career-path',
    name_vi: 'Con Duong Su Nghiep',
    name_en: 'Career Path',
    description_vi: 'Career analysis with 5 important aspects.',
    cards: 5,
    category: 'career',
    tier_required: 'TIER1',
    positions: [
      { index: 0, name_vi: 'Vi tri hien tai', name_en: 'Current Position', description_vi: 'Current career status' },
      { index: 1, name_vi: 'Muc tieu', name_en: 'Goals', description_vi: 'What you are working toward' },
      { index: 2, name_vi: 'Tro ngai', name_en: 'Obstacles', description_vi: 'Challenges on the path' },
      { index: 3, name_vi: 'Co hoi', name_en: 'Opportunities', description_vi: 'Opportunities opening up' },
      { index: 4, name_vi: 'Ket qua', name_en: 'Outcome', description_vi: 'Outcome if you pursue' },
    ],
    layout_type: 'horizontal',
    estimated_time: '8-10 min',
    display_order: 30,
  },
];

export const getCategoryIcon = (categoryId) => {
  const category = SPREAD_CATEGORIES.find(c => c.id === categoryId);
  return category?.icon || 'Sparkles';
};

export const getLifeAreaById = (areaId) => {
  return LIFE_AREAS.find(a => a.id === areaId) || LIFE_AREAS[0];
};

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
