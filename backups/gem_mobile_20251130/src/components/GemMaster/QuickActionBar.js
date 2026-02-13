/**
 * GEM Mobile - Quick Action Bar Component
 * Quick action buttons above ChatInput
 *
 * Actions:
 * - Xem Quẻ I-Ching (navigate)
 * - Bói Tarot (navigate)
 * - Tình yêu ❤️ (manifest_love)
 * - Tài lộc 💰 (manifest_wealth)
 * - Đá thạch anh 💎 (crystals)
 * - Khóa học 📚 (courses)
 * - Phân tích coin
 * - Gợi ý đầu tư
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import {
  Sparkles,
  Wand2,
  TrendingUp,
  Gem,
  BookOpen,
  LineChart,
  Coins,
  Heart,
  DollarSign,
  GraduationCap
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, GLASS } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Quick action button configurations
 * Includes: Manifest Love, Manifest Wealth, Crystals, Courses
 */
const QUICK_ACTIONS = [
  {
    id: 'iching',
    label: 'Kinh Dịch',
    subtitle: 'I Ching Reading',
    icon: Sparkles,
    borderColor: '#FFBD59',
    iconColor: '#FFBD59',
    action: 'navigate_iching'
  },
  {
    id: 'tarot',
    label: 'Tarot',
    subtitle: 'Card Reading',
    icon: Wand2,
    borderColor: '#00D9FF',
    iconColor: '#00D9FF',
    action: 'navigate_tarot'
  },
  {
    id: 'analyze',
    label: 'Phân tích',
    subtitle: 'Coin Analysis',
    icon: Coins,
    borderColor: '#00FF88',
    iconColor: '#00FF88',
    action: 'message',
    prompt: 'Phân tích kỹ thuật Bitcoin hiện tại'
  },
  {
    id: 'suggest',
    label: 'Gợi ý',
    subtitle: 'Investment Tips',
    icon: TrendingUp,
    borderColor: '#FF6B9D',
    iconColor: '#FF6B9D',
    action: 'message',
    prompt: 'Gợi ý chiến lược đầu tư crypto cho người mới'
  },
  // NEW: Manifest Love - Heart emoji
  {
    id: 'love',
    label: '❤️ Tình yêu',
    subtitle: 'Manifest Love',
    icon: Heart,
    borderColor: '#FF69B4',
    iconColor: '#FF69B4',
    action: 'message',
    prompt: 'Hướng dẫn tôi manifest tình yêu'
  },
  // NEW: Manifest Wealth - Money bag emoji
  {
    id: 'wealth',
    label: '💰 Tài lộc',
    subtitle: 'Manifest Wealth',
    icon: DollarSign,
    borderColor: '#FFD700',
    iconColor: '#FFD700',
    action: 'message',
    prompt: 'Hướng dẫn tôi manifest tiền bạc và tài lộc'
  },
  // NEW: Crystals - Gem emoji
  {
    id: 'crystals',
    label: '💎 Thạch anh',
    subtitle: 'Crystal Guide',
    icon: Gem,
    borderColor: '#9B59B6',
    iconColor: '#9B59B6',
    action: 'message',
    prompt: 'Giới thiệu các loại đá thạch anh và công dụng'
  },
  // NEW: Courses - Book emoji
  {
    id: 'courses',
    label: '📚 Khóa học',
    subtitle: 'GEM Courses',
    icon: GraduationCap,
    borderColor: '#3498DB',
    iconColor: '#3498DB',
    action: 'message',
    prompt: 'Giới thiệu các khóa học của Gemral'
  },
  {
    id: 'learn',
    label: 'Học Trading',
    subtitle: 'Learn Basics',
    icon: BookOpen,
    borderColor: '#A855F7',
    iconColor: '#A855F7',
    action: 'message',
    prompt: 'Dạy tôi các khái niệm cơ bản về trading crypto'
  }
];

/**
 * QuickActionBar Component
 * @param {Object} props
 * @param {Function} props.onAction - Callback when action is pressed
 * @param {Function} props.onNavigate - Callback for navigation actions
 * @param {boolean} props.disabled - Disable all buttons (quota exceeded)
 * @param {Object} props.style - Additional container style
 */
const QuickActionBar = ({
  onAction,
  onNavigate,
  disabled = false,
  style
}) => {
  const handlePress = (action) => {
    if (disabled && action.action === 'message') {
      // Still allow navigation when quota exceeded
      return;
    }

    if (action.action === 'navigate_iching') {
      onNavigate?.('IChing');
    } else if (action.action === 'navigate_tarot') {
      onNavigate?.('Tarot');
    } else if (action.action === 'message') {
      onAction?.(action.prompt);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        decelerationRate="fast"
      >
        {QUICK_ACTIONS.map((action) => {
          const IconComponent = action.icon;
          const isMessageAction = action.action === 'message';
          const isDisabled = disabled && isMessageAction;

          return (
            <TouchableOpacity
              key={action.id}
              onPress={() => handlePress(action)}
              activeOpacity={isDisabled ? 1 : 0.8}
              disabled={isDisabled}
              style={[
                styles.button,
                { borderColor: isDisabled ? '#444' : action.borderColor },
                isDisabled && styles.buttonDisabled
              ]}
            >
              <View style={[
                styles.iconWrapper,
                { borderColor: isDisabled ? '#444' : action.borderColor }
              ]}>
                <IconComponent
                  size={12}
                  color={isDisabled ? '#666' : action.iconColor}
                  strokeWidth={2}
                />
              </View>
              <View style={styles.textWrapper}>
                <Text
                  style={[
                    styles.buttonLabel,
                    isDisabled && styles.textDisabled
                  ]}
                  numberOfLines={1}
                >
                  {action.label}
                </Text>
                <Text
                  style={[
                    styles.buttonSubtitle,
                    isDisabled && styles.textDisabled
                  ]}
                  numberOfLines={1}
                >
                  {action.subtitle}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 4,
    gap: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginRight: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: 'rgba(50, 50, 50, 0.3)',
  },
  iconWrapper: {
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  textWrapper: {
    flex: 1,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  buttonSubtitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 7,
    marginTop: 0,
  },
  textDisabled: {
    color: '#666',
  },
});

export default QuickActionBar;
