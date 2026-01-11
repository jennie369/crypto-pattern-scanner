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
      'Kết hợp phân tích kỹ thuật hiện đại với trí tuệ cổ xưa phương Đông. Nâng cao tỷ lệ thắng, cân bằng năng lượng và tâm trí để giao dịch hiệu quả hơn.',
    icon: Gem,
    iconColor: '#FFBD59', // Gold
    bgGradient: ['#0A0A1A', '#1A1A2E'],
    features: [
      { icon: TrendingUp, text: 'Tỷ lệ thắng 68%+' },
      { icon: Brain, text: 'Trợ lý AI thông minh' },
      { icon: Sparkles, text: 'Tarot & Kinh Dịch miễn phí' },
    ],
  },
  {
    id: 'scanner',
    title: 'GEM Scanner',
    subtitle: 'Phát hiện mẫu nến tự động',
    description:
      'Quét hơn 100 đồng coin chỉ trong vài giây. Hệ thống tự động nhận diện 24 mẫu nến theo phương pháp GEM Frequency với độ chính xác cao, kèm điểm Entry/TP/SL rõ ràng.',
    icon: Scan,
    iconColor: '#4CAF50', // Green
    bgGradient: ['#0A1A0A', '#1A2E1A'],
    features: [
      { icon: Scan, text: 'Quét hơn 100 đồng coin' },
      { icon: Target, text: '24 mẫu nến GEM Frequency độc quyền' },
      { icon: Shield, text: 'Quản lý rủi ro tự động' },
    ],
  },
  {
    id: 'gemmaster',
    title: 'GEM Master AI',
    subtitle: 'Trợ lý giao dịch thông minh',
    description:
      'Hỏi đáp về trading, phân tích kỹ thuật mọi lúc mọi nơi. Bốc bài Tarot và xin quẻ Kinh Dịch miễn phí mỗi ngày để nhận thông điệp từ vũ trụ.',
    icon: Sparkles,
    iconColor: '#9C27B0', // Purple
    bgGradient: ['#1A0A1A', '#2E1A2E'],
    features: [
      { icon: MessageCircle, text: 'Chat AI thông minh' },
      { icon: Sparkles, text: 'Bốc bài Tarot hàng ngày' },
      { icon: Brain, text: 'Xin quẻ Kinh Dịch' },
    ],
  },
  {
    id: 'visionboard',
    title: 'Vision Board',
    subtitle: 'Đặt mục tiêu & theo dõi tiến trình',
    description:
      'Hình dung và thiết lập mục tiêu trading cũng như cuộc sống. Theo dõi chuỗi ngày liên tục, xây dựng thói quen kỷ luật để trở thành trader chuyên nghiệp.',
    icon: Target,
    iconColor: '#FF9800', // Orange
    bgGradient: ['#1A0F0A', '#2E1A0F'],
    features: [
      { icon: Target, text: 'Đặt mục tiêu rõ ràng' },
      { icon: Flame, text: 'Theo dõi chuỗi ngày' },
      { icon: TrendingUp, text: 'Phân tích tiến trình' },
    ],
  },
  {
    id: 'community',
    title: 'Cộng đồng Traders',
    subtitle: 'Kết nối & học hỏi cùng nhau',
    description:
      'Chia sẻ chiến lược, thảo luận về thị trường theo thời gian thực. Học hỏi từ những trader giàu kinh nghiệm và nhận tín hiệu giao dịch từ các chuyên gia.',
    icon: Users,
    iconColor: '#2196F3', // Blue
    bgGradient: ['#0A0F1A', '#0F1A2E'],
    features: [
      { icon: Users, text: 'Cộng đồng sôi động' },
      { icon: MessageCircle, text: 'Thảo luận thời gian thực' },
      { icon: TrendingUp, text: 'Tín hiệu từ chuyên gia' },
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
