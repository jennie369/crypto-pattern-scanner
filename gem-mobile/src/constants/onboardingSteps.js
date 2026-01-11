/**
 * GEM Scanner - Onboarding Steps Configuration
 * 5-step onboarding flow for Paper Trade Custom Mode
 */

import {
  Rocket,
  Layers,
  TrendingUp,
  Target,
  BarChart3,
} from 'lucide-react-native';
import { COLORS } from '../utils/tokens';

// ═══════════════════════════════════════════════════════════
// ONBOARDING STEPS
// ═══════════════════════════════════════════════════════════

export const ONBOARDING_STEPS = [
  // Step 1: Welcome
  {
    id: 'welcome',
    stepNumber: 1,
    icon: Rocket,
    iconColor: COLORS.gold,
    title: 'Chào mừng đến Paper Trade!',
    titleEn: 'Welcome to Paper Trade!',
    subtitle: 'Giao dịch giả lập như Binance Futures',
    subtitleEn: 'Simulated trading like Binance Futures',
    description: 'Paper Trade cho phép bạn thực hành giao dịch với tiền ảo, không rủi ro mất tiền thật.\n\nĐây là cách tốt nhất để học giao dịch Futures trước khi vào thị trường thực.',
    descriptionEn: 'Paper Trade allows you to practice trading with virtual money, no risk of losing real money.\n\nThis is the best way to learn Futures trading before entering the real market.',
    features: [
      'Tiền ảo $10,000 USDT để thực hành',
      '4 loại lệnh: Limit, Market, Stop Limit, Stop Market',
      'Đòn bẩy lên đến 125x',
      'TP/SL và quản lý rủi ro',
    ],
    featuresEn: [
      '$10,000 USDT virtual money to practice',
      '4 order types: Limit, Market, Stop Limit, Stop Market',
      'Leverage up to 125x',
      'TP/SL and risk management',
    ],
    ctaText: 'Bắt đầu học',
    ctaTextEn: 'Start learning',
  },

  // Step 2: Order Types
  {
    id: 'order_types',
    stepNumber: 2,
    icon: Layers,
    iconColor: COLORS.cyan,
    title: 'Các loại lệnh',
    titleEn: 'Order Types',
    subtitle: '4 loại lệnh giao dịch',
    subtitleEn: '4 trading order types',
    description: 'Mỗi loại lệnh phù hợp với tình huống khác nhau:',
    descriptionEn: 'Each order type is suitable for different situations:',
    features: [
      'Limit: Đặt giá mua/bán mong muốn',
      'Market: Khớp ngay ở giá hiện tại',
      'Stop Limit: Kích hoạt Limit khi giá chạm Stop',
      'Stop Market: Kích hoạt Market khi giá chạm Stop',
    ],
    featuresEn: [
      'Limit: Set desired buy/sell price',
      'Market: Execute immediately at current price',
      'Stop Limit: Activate Limit when price hits Stop',
      'Stop Market: Activate Market when price hits Stop',
    ],
    tip: 'Người mới nên bắt đầu với Limit và Market. Sau khi quen, thử Stop orders.',
    tipEn: 'Beginners should start with Limit and Market. After getting familiar, try Stop orders.',
    ctaText: 'Tiếp theo',
    ctaTextEn: 'Next',
  },

  // Step 3: Leverage & Margin
  {
    id: 'leverage',
    stepNumber: 3,
    icon: TrendingUp,
    iconColor: COLORS.warning,
    title: 'Đòn bẩy & Margin',
    titleEn: 'Leverage & Margin',
    subtitle: 'Hiểu về rủi ro',
    subtitleEn: 'Understanding risk',
    description: 'Đòn bẩy cho phép mở vị thế lớn với vốn nhỏ, nhưng cũng tăng rủi ro.',
    descriptionEn: 'Leverage allows opening large positions with small capital, but also increases risk.',
    features: [
      'Cross: Dùng toàn bộ số dư làm margin',
      'Isolated: Chỉ dùng margin chỉ định (khuyên dùng)',
      'Đòn bẩy cao = Giá thanh lý gần hơn',
      'Luôn kiểm tra giá thanh lý trước khi vào lệnh',
    ],
    featuresEn: [
      'Cross: Use entire balance as margin',
      'Isolated: Use only assigned margin (recommended)',
      'High leverage = Closer liquidation price',
      'Always check liquidation price before entering',
    ],
    warning: 'Với 100x leverage, chỉ cần giá đi ngược 1% là mất 100% margin!',
    warningEn: 'With 100x leverage, just 1% price move against you = 100% margin loss!',
    tip: 'Bắt đầu với 5-10x leverage để học cách quản lý rủi ro.',
    tipEn: 'Start with 5-10x leverage to learn risk management.',
    ctaText: 'Tiếp theo',
    ctaTextEn: 'Next',
  },

  // Step 4: TP/SL
  {
    id: 'tpsl',
    stepNumber: 4,
    icon: Target,
    iconColor: COLORS.success,
    title: 'Chốt lời & Cắt lỗ',
    titleEn: 'Take Profit & Stop Loss',
    subtitle: 'Quản lý rủi ro',
    subtitleEn: 'Risk management',
    description: 'TP và SL giúp tự động đóng vị thế khi giá đạt mục tiêu hoặc giới hạn lỗ.',
    descriptionEn: 'TP and SL help automatically close positions when price reaches target or loss limit.',
    features: [
      'TP (Take Profit): Chốt lời khi đạt mục tiêu',
      'SL (Stop Loss): Cắt lỗ khi giá đi ngược',
      'Luôn đặt SL để bảo vệ vốn',
      'Tỷ lệ Risk:Reward >= 1:2 là tốt',
    ],
    featuresEn: [
      'TP (Take Profit): Lock profit when target reached',
      'SL (Stop Loss): Cut loss when price goes against',
      'Always set SL to protect capital',
      'Risk:Reward ratio >= 1:2 is good',
    ],
    tip: 'Quy tắc vàng: Không bao giờ vào lệnh mà không có SL!',
    tipEn: 'Golden rule: Never enter a trade without a SL!',
    ctaText: 'Tiếp theo',
    ctaTextEn: 'Next',
  },

  // Step 5: Managing Positions
  {
    id: 'positions',
    stepNumber: 5,
    icon: BarChart3,
    iconColor: COLORS.purple,
    title: 'Quản lý vị thế',
    titleEn: 'Managing Positions',
    subtitle: 'Theo dõi & Điều chỉnh',
    subtitleEn: 'Monitor & Adjust',
    description: 'Sau khi vào lệnh, bạn có thể theo dõi và điều chỉnh vị thế trong tab "Vị thế mở".',
    descriptionEn: 'After entering a position, you can monitor and adjust it in the "Open Positions" tab.',
    features: [
      'Xem P&L và ROI real-time',
      'Điều chỉnh TP/SL bất kỳ lúc nào',
      'Đóng một phần hoặc toàn bộ vị thế',
      'Xem lịch sử giao dịch',
    ],
    featuresEn: [
      'View P&L and ROI in real-time',
      'Adjust TP/SL anytime',
      'Close partial or entire position',
      'View trading history',
    ],
    tip: 'Thường xuyên review lịch sử giao dịch để học từ sai lầm và thành công.',
    tipEn: 'Regularly review trading history to learn from mistakes and successes.',
    ctaText: 'Bắt đầu giao dịch',
    ctaTextEn: 'Start Trading',
  },
];

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Get step by ID
 * @param {string} stepId - Step ID ('welcome', 'order_types', etc.)
 * @returns {Object|null} Step configuration
 */
export const getStepById = (stepId) => {
  return ONBOARDING_STEPS.find(step => step.id === stepId) || null;
};

/**
 * Get step by number (1-based)
 * @param {number} stepNumber - Step number (1-5)
 * @returns {Object|null} Step configuration
 */
export const getStepByNumber = (stepNumber) => {
  return ONBOARDING_STEPS[stepNumber - 1] || null;
};

/**
 * Get total number of steps
 * @returns {number} Total steps
 */
export const getTotalSteps = () => {
  return ONBOARDING_STEPS.length;
};

/**
 * Get step IDs in order
 * @returns {string[]} Array of step IDs
 */
export const getStepIds = () => {
  return ONBOARDING_STEPS.map(step => step.id);
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

const onboardingSteps = {
  ONBOARDING_STEPS,
  getStepById,
  getStepByNumber,
  getTotalSteps,
  getStepIds,
};

export default onboardingSteps;
