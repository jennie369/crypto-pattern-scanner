// Course data structure and management
export const coursesData = {
  frequencyTrading: {
    id: 'frequency-trading',
    title: 'Khóa Học FREQUENCY TRADING',
    subtitle: 'Học cách trading chuyên nghiệp với 17 chương chi tiết',
    description: 'Phương pháp Zone Retest độc quyền với tỷ lệ thắng 68%+',
    instructor: {
      name: 'Master Gem',
      avatar: '👨‍🏫', // Emoji placeholder
      title: 'Chuyên Gia Trading & Metaphysics',
      experience: '10+ năm kinh nghiệm trading & spirituality'
    },
    tiers: [
      {
        id: 'free',
        name: 'FREE TRIAL',
        price: 0,
        duration: 'Truy cập miễn phí',
        features: [
          'Truy cập 3 chương đầu',
          'Video giới thiệu',
          'Tài liệu cơ bản',
          'Chat cộng đồng (chỉ đọc)'
        ],
        locked: [],
        badge: { text: 'FREE', color: '#00FF88' }
      },
      {
        id: 'tier1',
        name: 'GÓI 1',
        price: 11000000,
        duration: '12 tháng',
        features: [
          'Khóa học GÓI 1',
          'Scanner PRO',
          'Chatbot PRO',
          '12 tháng',
          'Truy cập đầy đủ 7 chương đầu'
        ],
        popularLabel: 'POPULAR',
        badge: { text: 'PRO', color: '#FFBD59' }
      },
      {
        id: 'tier2',
        name: 'GÓI 2',
        price: 21000000,
        duration: '12 tháng',
        features: [
          'Tất cả tính năng GÓI 1',
          'AI Prediction Tool',
          'Backtesting Engine',
          'Priority Support',
          'Private Community Access',
          'Truy cập 12 chương'
        ],
        badge: { text: 'ELITE', color: '#8B5CF6' }
      },
      {
        id: 'tier3',
        name: 'GÓI 3',
        price: 68000000,
        duration: '24 tháng',
        features: [
          'Tất cả tính năng GÓI 2',
          'Whale Tracker',
          'Custom Indicators',
          '1-on-1 Coaching Sessions',
          'Lifetime Updates',
          'VIP Community',
          'Truy cập toàn bộ 17 chương'
        ],
        badge: { text: 'VIP', color: '#FF0080' }
      }
    ],
    chapters: [
      // FREE CHAPTERS (1-3)
      {
        number: 1,
        title: 'Introduction to Frequency Trading',
        duration: '45 phút',
        lessons: [
          { title: 'Giới thiệu phương pháp', duration: '15:30', type: 'video', free: true },
          { title: 'Tại sao Zone Retest hiệu quả', duration: '12:45', type: 'video', free: true },
          { title: 'Tài liệu tham khảo', duration: '5:00', type: 'document', free: true },
          { title: 'Bài test đầu vào', duration: '12:00', type: 'exercise', free: true }
        ],
        tier: 'free'
      },
      {
        number: 2,
        title: 'Market Structure & Zones',
        duration: '1 giờ 20 phút',
        lessons: [
          { title: 'Xác định HFZ & LFZ', duration: '25:00', type: 'video', free: true },
          { title: 'Vẽ zone trên biểu đồ', duration: '30:00', type: 'video', free: true },
          { title: 'Bài tập thực hành', duration: '25:00', type: 'exercise', free: true }
        ],
        tier: 'free'
      },
      {
        number: 3,
        title: 'Pattern Recognition',
        duration: '2 giờ',
        lessons: [
          { title: 'DPD Pattern', duration: '30:00', type: 'video', free: true },
          { title: 'UPU Pattern', duration: '30:00', type: 'video', free: true },
          { title: 'Head & Shoulders', duration: '30:00', type: 'video', free: true },
          { title: 'Double Top/Bottom', duration: '30:00', type: 'video', free: true }
        ],
        tier: 'free'
      },

      // TIER 1 CHAPTERS (4-7)
      {
        number: 4,
        title: 'Entry & Exit Strategies',
        duration: '1 giờ 45 phút',
        lessons: [
          { title: 'Điểm vào lệnh tối ưu', duration: '35:00', type: 'video' },
          { title: 'Confirmation candles', duration: '25:00', type: 'video' },
          { title: 'Stop loss placement', duration: '25:00', type: 'video' },
          { title: 'Take profit strategies', duration: '20:00', type: 'video' }
        ],
        tier: 'tier1'
      },
      {
        number: 5,
        title: 'Risk Management',
        duration: '1 giờ 30 phút',
        lessons: [
          { title: 'Quy tắc 1% Risk', duration: '20:00', type: 'video' },
          { title: 'Risk/Reward Ratio', duration: '25:00', type: 'video' },
          { title: 'Quản lý vốn hiệu quả', duration: '30:00', type: 'video' },
          { title: 'Bài tập tính toán risk', duration: '15:00', type: 'exercise' }
        ],
        tier: 'tier1'
      },
      {
        number: 6,
        title: 'Position Sizing',
        duration: '1 giờ 15 phút',
        lessons: [
          { title: 'Kelly Criterion', duration: '20:00', type: 'video' },
          { title: 'Fixed Fractional Method', duration: '20:00', type: 'video' },
          { title: 'Optimal F Formula', duration: '20:00', type: 'video' },
          { title: 'Position Size Calculator', duration: '15:00', type: 'exercise' }
        ],
        tier: 'tier1'
      },
      {
        number: 7,
        title: 'Multi-Timeframe Analysis',
        duration: '2 giờ',
        lessons: [
          { title: 'Top-down Analysis', duration: '30:00', type: 'video' },
          { title: 'Correlation giữa các timeframes', duration: '30:00', type: 'video' },
          { title: 'HTF bias vs LTF entries', duration: '35:00', type: 'video' },
          { title: 'Thực hành MTF Analysis', duration: '25:00', type: 'exercise' }
        ],
        tier: 'tier1'
      },

      // TIER 2 CHAPTERS (8-12)
      {
        number: 8,
        title: 'Advanced Zone Techniques',
        duration: '1 giờ 50 phút',
        lessons: [
          { title: 'Supply & Demand Zones', duration: '30:00', type: 'video' },
          { title: 'Order Blocks', duration: '30:00', type: 'video' },
          { title: 'Breaker Blocks', duration: '25:00', type: 'video' },
          { title: 'Advanced Zone Practice', duration: '25:00', type: 'exercise' }
        ],
        tier: 'tier2'
      },
      {
        number: 9,
        title: 'Volume Profile Analysis',
        duration: '1 giờ 40 phút',
        lessons: [
          { title: 'Point of Control (POC)', duration: '25:00', type: 'video' },
          { title: 'Value Area High/Low', duration: '25:00', type: 'video' },
          { title: 'Volume Nodes', duration: '25:00', type: 'video' },
          { title: 'Volume Profile Strategies', duration: '25:00', type: 'video' }
        ],
        tier: 'tier2'
      },
      {
        number: 10,
        title: 'Order Flow Reading',
        duration: '2 giờ 10 phút',
        lessons: [
          { title: 'Tape Reading Basics', duration: '35:00', type: 'video' },
          { title: 'Footprint Charts', duration: '35:00', type: 'video' },
          { title: 'Delta & CVD', duration: '30:00', type: 'video' },
          { title: 'Order Flow Exercises', duration: '30:00', type: 'exercise' }
        ],
        tier: 'tier2'
      },
      {
        number: 11,
        title: 'Smart Money Concepts',
        duration: '2 giờ',
        lessons: [
          { title: 'Market Structure Shifts', duration: '30:00', type: 'video' },
          { title: 'Liquidity Sweeps', duration: '30:00', type: 'video' },
          { title: 'Fair Value Gaps', duration: '30:00', type: 'video' },
          { title: 'Smart Money Practice', duration: '30:00', type: 'exercise' }
        ],
        tier: 'tier2'
      },
      {
        number: 12,
        title: 'Algorithmic Pattern Detection',
        duration: '1 giờ 55 phút',
        lessons: [
          { title: 'Fractal Patterns', duration: '30:00', type: 'video' },
          { title: 'Harmonic Patterns', duration: '30:00', type: 'video' },
          { title: 'Elliott Wave Theory', duration: '35:00', type: 'video' },
          { title: 'Pattern Recognition Tool', duration: '20:00', type: 'exercise' }
        ],
        tier: 'tier2'
      },

      // TIER 3 CHAPTERS (13-17)
      {
        number: 13,
        title: 'Backtesting Strategies',
        duration: '2 giờ 30 phút',
        lessons: [
          { title: 'Backtesting Framework', duration: '40:00', type: 'video' },
          { title: 'Statistical Analysis', duration: '40:00', type: 'video' },
          { title: 'Optimization vs Overfitting', duration: '35:00', type: 'video' },
          { title: 'Backtest Your Strategy', duration: '35:00', type: 'exercise' }
        ],
        tier: 'tier3'
      },
      {
        number: 14,
        title: 'Building Custom Indicators',
        duration: '2 giờ 15 phút',
        lessons: [
          { title: 'Pine Script Basics', duration: '35:00', type: 'video' },
          { title: 'Creating Custom Indicators', duration: '40:00', type: 'video' },
          { title: 'Alerts & Automation', duration: '30:00', type: 'video' },
          { title: 'Build Your Indicator', duration: '30:00', type: 'exercise' }
        ],
        tier: 'tier3'
      },
      {
        number: 15,
        title: 'Whale Tracking Techniques',
        duration: '2 giờ',
        lessons: [
          { title: 'On-Chain Analysis', duration: '35:00', type: 'video' },
          { title: 'Large Transaction Monitoring', duration: '30:00', type: 'video' },
          { title: 'Exchange Flow Analysis', duration: '30:00', type: 'video' },
          { title: 'Whale Alert Practice', duration: '25:00', type: 'exercise' }
        ],
        tier: 'tier3'
      },
      {
        number: 16,
        title: 'Portfolio Management',
        duration: '2 giờ 20 phút',
        lessons: [
          { title: 'Asset Allocation', duration: '35:00', type: 'video' },
          { title: 'Diversification Strategies', duration: '35:00', type: 'video' },
          { title: 'Rebalancing Techniques', duration: '35:00', type: 'video' },
          { title: 'Portfolio Optimization', duration: '35:00', type: 'exercise' }
        ],
        tier: 'tier3'
      },
      {
        number: 17,
        title: 'Advanced Trading Psychology',
        duration: '2 giờ 30 phút',
        lessons: [
          { title: 'Overcoming Fear & Greed', duration: '40:00', type: 'video' },
          { title: 'Building Trading Discipline', duration: '35:00', type: 'video' },
          { title: 'Managing Drawdowns', duration: '30:00', type: 'video' },
          { title: 'Long-term Success Mindset', duration: '45:00', type: 'video' }
        ],
        tier: 'tier3'
      }
    ],
    stats: {
      students: 1247,
      rating: 4.9,
      reviews: 342,
      duration: '33 giờ video',
      updates: 'Cập nhật hàng tuần'
    }
  }
};

// Course access checker
export function hasAccessToChapter(userTier, chapterTier) {
  const tierHierarchy = ['free', 'tier1', 'tier2', 'tier3'];
  const userTierIndex = tierHierarchy.indexOf(userTier);
  const chapterTierIndex = tierHierarchy.indexOf(chapterTier);
  return userTierIndex >= chapterTierIndex;
}

// Progress tracking
export function calculateProgress(userProgress, totalLessons) {
  if (!userProgress || totalLessons === 0) return 0;
  return Math.round((userProgress.completedLessons / totalLessons) * 100);
}
