/**
 * Course Data for Landing Page
 * Sample data structure for course grid display
 * Using UPPERCASE tier values: 'TIER1', 'TIER2', 'TIER3'
 */

export const SAMPLE_COURSES = [
  {
    id: 'freq-trading-1',
    title: 'GEM Frequency Method - Level 1',
    description: 'Master the fundamentals of frequency-based trading with proven patterns. Learn market structure and basic entry/exit strategies.',
    thumbnail: '/images/courses/trading-tier1.png',
    instructor: {
      name: 'Jennie Chu',
      avatar: '/images/instructors/jennie-chu.jpg'
    },
    rating: 4.9,
    studentCount: 1234,
    duration: '8 hours',
    lessonCount: 12,
    tier: 1, // TIER1
    price: 11000000,
    progress: undefined, // Will be set based on user enrollment
    category: 'trading'
  },
  {
    id: 'freq-trading-2',
    title: 'Advanced Pattern Recognition',
    description: 'Deep dive into advanced frequency patterns. Master volume profile analysis and order flow techniques for precise entries.',
    thumbnail: '/images/courses/trading-tier2.png',
    instructor: {
      name: 'Jennie Chu',
      avatar: '/images/instructors/jennie-chu.jpg'
    },
    rating: 4.8,
    studentCount: 856,
    duration: '12 hours',
    lessonCount: 18,
    tier: 2, // TIER2
    price: 21000000,
    progress: undefined,
    category: 'trading'
  },
  {
    id: 'freq-trading-3',
    title: 'Elite Trading Mastery',
    description: 'Professional-level trading strategies with backtesting, whale tracking, and portfolio management. Become a master trader.',
    thumbnail: '/images/courses/trading-tier3.png',
    instructor: {
      name: 'Jennie Chu',
      avatar: '/images/instructors/jennie-chu.jpg'
    },
    rating: 5.0,
    studentCount: 423,
    duration: '20 hours',
    lessonCount: 28,
    tier: 3, // TIER3
    price: 68000000,
    progress: undefined,
    category: 'trading'
  },
  {
    id: 'spiritual-frequency',
    title: '7 Ngày Khai Mở Tần Số',
    description: 'Transform your spiritual energy and unlock abundance consciousness. Learn ancient frequency activation techniques.',
    thumbnail: '/images/courses/spiritual-frequency.png',
    instructor: {
      name: 'Master Jennie',
      avatar: '/images/instructors/jennie-spiritual.jpg'
    },
    rating: 4.9,
    studentCount: 2156,
    duration: '7 days',
    lessonCount: 7,
    tier: 0, // FREE - Standalone purchase
    price: 1990000,
    progress: undefined,
    category: 'spiritual'
  },
  {
    id: 'love-activation',
    title: 'Kích Hoạt Tình Yêu',
    description: 'Activate your heart chakra and attract true love. Healing meditations and energy work for relationships.',
    thumbnail: '/images/courses/love-activation.png',
    instructor: {
      name: 'Master Jennie',
      avatar: '/images/instructors/jennie-spiritual.jpg'
    },
    rating: 4.7,
    studentCount: 1842,
    duration: '5 hours',
    lessonCount: 8,
    tier: 0, // FREE - Standalone purchase
    price: 399000,
    progress: undefined,
    category: 'spiritual'
  },
  {
    id: 'millionaire-mindset',
    title: 'Tư Duy Triệu Phú',
    description: 'Reprogram your subconscious for wealth and abundance. Learn money manifestation secrets from the masters.',
    thumbnail: '/images/courses/millionaire-mindset.png',
    instructor: {
      name: 'Master Jennie',
      avatar: '/images/instructors/jennie-spiritual.jpg'
    },
    rating: 4.8,
    studentCount: 1523,
    duration: '6 hours',
    lessonCount: 10,
    tier: 0, // FREE - Standalone purchase
    price: 499000,
    progress: undefined,
    category: 'spiritual'
  }
];

export const SAMPLE_LEARNING_PATHS = [
  {
    id: 'path-beginner',
    name: 'Complete Trader Journey',
    description: 'From zero to professional trader in 3 months. Master all fundamental concepts and basic strategies.',
    icon: '🚀',
    totalHours: 24,
    courseCount: 6,
    progress: 40,
    difficulty: 'beginner',
    courses: [
      { id: 'c1', name: 'Trading Basics', duration: '4h', completed: true },
      { id: 'c2', name: 'Technical Analysis', duration: '5h', completed: true },
      { id: 'c3', name: 'GEM Method Intro', duration: '6h', completed: false },
      { id: 'c4', name: 'Risk Management', duration: '3h', completed: false },
      { id: 'c5', name: 'Position Sizing', duration: '4h', completed: false },
      { id: 'c6', name: 'Live Trading Practice', duration: '2h', completed: false }
    ]
  },
  {
    id: 'path-intermediate',
    name: 'Advanced Trading Mastery',
    description: 'Take your trading to the next level with advanced patterns and institutional techniques.',
    icon: '🔥',
    totalHours: 32,
    courseCount: 8,
    progress: 15,
    difficulty: 'intermediate',
    courses: [
      { id: 'c7', name: 'Advanced Patterns', duration: '6h', completed: true },
      { id: 'c8', name: 'Volume Profile', duration: '5h', completed: false },
      { id: 'c9', name: 'Order Flow Analysis', duration: '4h', completed: false },
      { id: 'c10', name: 'Smart Money Concepts', duration: '5h', completed: false },
      { id: 'c11', name: 'Multi-Timeframe Analysis', duration: '4h', completed: false },
      { id: 'c12', name: 'Advanced Support/Resistance', duration: '3h', completed: false },
      { id: 'c13', name: 'Algorithmic Pattern Detection', duration: '3h', completed: false },
      { id: 'c14', name: 'Live Market Analysis', duration: '2h', completed: false }
    ]
  },
  {
    id: 'path-elite',
    name: 'Professional Trader Path',
    description: 'Become an elite professional trader with institutional-grade strategies and tools.',
    icon: '💎',
    totalHours: 40,
    courseCount: 10,
    progress: 0,
    difficulty: 'advanced',
    courses: [
      { id: 'c15', name: 'Professional Backtesting', duration: '6h', completed: false },
      { id: 'c16', name: 'Custom Indicators', duration: '5h', completed: false },
      { id: 'c17', name: 'Whale Tracking Systems', duration: '4h', completed: false },
      { id: 'c18', name: 'Portfolio Management', duration: '5h', completed: false },
      { id: 'c19', name: 'Trading Psychology Mastery', duration: '4h', completed: false },
      { id: 'c20', name: 'Risk Models', duration: '3h', completed: false },
      { id: 'c21', name: 'Automated Trading Systems', duration: '5h', completed: false },
      { id: 'c22', name: 'Market Making Strategies', duration: '4h', completed: false },
      { id: 'c23', name: 'Institutional Trading Techniques', duration: '3h', completed: false },
      { id: 'c24', name: 'Professional Certification', duration: '1h', completed: false }
    ]
  }
];

// Helper function to get courses for a specific tier
export const getCoursesByTier = (tier) => {
  return SAMPLE_COURSES.filter(course => course.tier === tier);
};

// Helper function to get courses by category
export const getCoursesByCategory = (category) => {
  if (category === 'all') return SAMPLE_COURSES;
  return SAMPLE_COURSES.filter(course => course.category === category);
};

// Helper function to get enrolled courses with progress
export const getEnrolledCourses = (userProgress = []) => {
  return SAMPLE_COURSES.map(course => {
    const progress = userProgress.find(p => p.courseId === course.id);
    return {
      ...course,
      progress: progress ? progress.percentage : undefined
    };
  });
};
