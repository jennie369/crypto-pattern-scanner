/**
 * Gemral - Welcome Screen Configuration
 * 5 slides for first-time users
 *
 * Uses lucide-react-native icons
 * Vietnamese with diacritics
 * Design tokens from utils/tokens.js
 */

import {
  Scan,
  Sparkles,
  Target,
  Users,
  Gem,
  TrendingUp,
  Brain,
  Flame,
  MessageCircle,
  Shield,
} from 'lucide-react-native';

/**
 * Welcome Slides Configuration
 * Each slide has: id, title, subtitle, description, icon, iconColor, bgGradient, features
 */
export const WELCOME_SLIDES = [
  {
    id: 'welcome',
    title: 'Chào mừng đến Gemral',
    subtitle: 'Nền tảng Trading & Wellness độc đáo',
    description:
      'Kết hợp phân tích kỹ thuật hiện đại với trí tuệ cổ xưa. Tăng win rate, cân bằng năng lượng.',
    icon: Gem,
    iconColor: '#FFBD59', // Gold
    bgGradient: ['#0A0A1A', '#1A1A2E'],
    features: [
      { icon: TrendingUp, text: 'Win rate 68%+' },
      { icon: Brain, text: 'AI Trading Assistant' },
      { icon: Sparkles, text: 'Tarot & I Ching miễn phí' },
    ],
  },
  {
    id: 'scanner',
    title: 'GEM Scanner',
    subtitle: 'Phát hiện patterns tự động',
    description:
      'Quét 100+ coins trong vài giây. Phát hiện 7 patterns với độ chính xác cao dựa trên GEM Frequency Method.',
    icon: Scan,
    iconColor: '#4CAF50', // Green
    bgGradient: ['#0A1A0A', '#1A2E1A'],
    features: [
      { icon: Scan, text: 'Scan 100+ coins' },
      { icon: Target, text: '7 patterns chuẩn xác' },
      { icon: Shield, text: 'Risk management tự động' },
    ],
  },
  {
    id: 'gemmaster',
    title: 'GEM Master AI',
    subtitle: 'Trợ lý giao dịch thông minh',
    description:
      'Hỏi đáp về trading, phân tích kỹ thuật. Bốc Tarot và I Ching miễn phí mỗi ngày để nhận thông điệp vũ trụ.',
    icon: Sparkles,
    iconColor: '#9C27B0', // Purple
    bgGradient: ['#1A0A1A', '#2E1A2E'],
    features: [
      { icon: MessageCircle, text: 'Chat AI thông minh' },
      { icon: Sparkles, text: 'Tarot hàng ngày' },
      { icon: Brain, text: 'I Ching wisdom' },
    ],
  },
  {
    id: 'visionboard',
    title: 'Vision Board',
    subtitle: 'Đặt mục tiêu & theo dõi tiến trình',
    description:
      'Visualize mục tiêu trading và cuộc sống. Theo dõi streaks, xây dựng thói quen kỷ luật mỗi ngày.',
    icon: Target,
    iconColor: '#FF9800', // Orange
    bgGradient: ['#1A0F0A', '#2E1A0F'],
    features: [
      { icon: Target, text: 'Đặt mục tiêu rõ ràng' },
      { icon: Flame, text: 'Streak tracking' },
      { icon: TrendingUp, text: 'Phân tích tiến trình' },
    ],
  },
  {
    id: 'community',
    title: 'Cộng đồng Traders',
    subtitle: 'Kết nối & học hỏi cùng nhau',
    description:
      'Chia sẻ chiến lược, thảo luận thị trường, học hỏi từ những trader giàu kinh nghiệm trong cộng đồng.',
    icon: Users,
    iconColor: '#2196F3', // Blue
    bgGradient: ['#0A0F1A', '#0F1A2E'],
    features: [
      { icon: Users, text: 'Cộng đồng sôi động' },
      { icon: MessageCircle, text: 'Thảo luận real-time' },
      { icon: TrendingUp, text: 'Signals từ experts' },
    ],
  },
];

/**
 * Call-to-Action Buttons on last slide
 */
export const WELCOME_CTA = {
  primaryButton: {
    text: 'Bắt đầu ngay',
    action: 'register',
  },
  secondaryButton: {
    text: 'Đã có tài khoản? Đăng nhập',
    action: 'login',
  },
};

/**
 * AsyncStorage keys
 */
export const WELCOME_STORAGE_KEYS = {
  completed: '@gem_welcome_completed',
  progress: '@gem_welcome_progress',
};

export default {
  WELCOME_SLIDES,
  WELCOME_CTA,
  WELCOME_STORAGE_KEYS,
};
