/**
 * GoalCreationOptions.js
 * 3 options modal for creating goals in Vision Board
 * Options: Quick Create, From Template, Ask GEM
 *
 * Created: 2026-02-02
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Zap,
  FileText,
  MessageCircle,
  X,
  Target,
  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import {
  COSMIC_COLORS,
  COSMIC_SPACING,
  COSMIC_RADIUS,
  COSMIC_TYPOGRAPHY,
  COSMIC_GRADIENTS,
} from '../../theme/cosmicTokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Creation options - matching the plan
const CREATION_OPTIONS = [
  {
    id: 'quick',
    title: 'Tạo nhanh theo lĩnh vực',
    description: 'Chọn lĩnh vực và nhập mục tiêu trực tiếp',
    icon: Zap,
    color: COSMIC_COLORS.glow.gold,
    gradient: ['#FFBD59', '#FFD700'],
  },
  {
    id: 'template',
    title: 'Tạo từ Journal/Template',
    description: 'Fear-Setting, Think Day, Biết ơn...',
    icon: FileText,
    color: COSMIC_COLORS.glow.purple,
    gradient: ['#A855F7', '#8B5CF6'],
  },
  {
    id: 'gemmaster',
    title: 'Nói chuyện với Sư Phụ',
    description: 'Để GEM hướng dẫn bạn đặt mục tiêu',
    icon: MessageCircle,
    color: COSMIC_COLORS.glow.cyan,
    gradient: ['#00F0FF', '#00CED1'],
  },
];

/**
 * GoalCreationOptions Component
 * @param {boolean} visible - Control visibility
 * @param {function} onClose - Close callback
 * @param {function} onSelectQuick - Quick create selected
 * @param {function} onSelectTemplate - Template selected
 * @param {function} onSelectGemMaster - GEM Master selected
 */
const GoalCreationOptions = ({
  visible,
  onClose,
  onSelectQuick,
  onSelectTemplate,
  onSelectGemMaster,
}) => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Animate on visible
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible, fadeAnim, slideAnim]);

  // Handle close with animation
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  };

  // Handle option selection
  const handleSelect = (optionId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleClose();

    // Delay action until animation completes
    setTimeout(() => {
      switch (optionId) {
        case 'quick':
          onSelectQuick?.();
          break;
        case 'template':
          onSelectTemplate?.();
          break;
        case 'gemmaster':
          onSelectGemMaster?.();
          // Navigate to GEM Master
          navigation.navigate('GemMaster');
          break;
      }
    }, 250);
  };

  // Render option card
  const renderOption = (option) => {
    const IconComponent = option.icon;

    return (
      <TouchableOpacity
        key={option.id}
        style={styles.optionCard}
        onPress={() => handleSelect(option.id)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={option.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.optionGradient}
        >
          <IconComponent size={28} color={COSMIC_COLORS.bgDeepSpace} />
        </LinearGradient>

        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>{option.title}</Text>
          <Text style={styles.optionDescription}>{option.description}</Text>
        </View>

        <ChevronRight size={20} color={COSMIC_COLORS.text.muted} />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity activeOpacity={1}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIcon}>
                  <Target size={20} color={COSMIC_COLORS.glow.gold} />
                </View>
                <Text style={styles.headerTitle}>Tạo mục tiêu mới</Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={22} color={COSMIC_COLORS.text.muted} />
              </TouchableOpacity>
            </View>

            {/* Handle indicator */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
              {CREATION_OPTIONS.map(renderOption)}
            </View>

            {/* Footer hint */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Tip: Sử dụng template để tạo mục tiêu có cấu trúc tốt hơn
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COSMIC_COLORS.bgNebula,
    borderTopLeftRadius: COSMIC_RADIUS.xxl,
    borderTopRightRadius: COSMIC_RADIUS.xxl,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
    paddingBottom: COSMIC_SPACING.xl,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: COSMIC_SPACING.sm,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COSMIC_COLORS.glass.border,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: COSMIC_SPACING.lg,
    paddingTop: COSMIC_SPACING.lg,
    paddingBottom: COSMIC_SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.sm,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: COSMIC_RADIUS.md,
    backgroundColor: COSMIC_COLORS.glow.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.lg,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.semibold,
    color: COSMIC_COLORS.text.primary,
  },
  closeButton: {
    padding: COSMIC_SPACING.xs,
  },
  optionsContainer: {
    paddingHorizontal: COSMIC_SPACING.lg,
    gap: COSMIC_SPACING.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COSMIC_COLORS.glass.bg,
    borderRadius: COSMIC_RADIUS.lg,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
    padding: COSMIC_SPACING.md,
    gap: COSMIC_SPACING.md,
  },
  optionGradient: {
    width: 52,
    height: 52,
    borderRadius: COSMIC_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.semibold,
    color: COSMIC_COLORS.text.primary,
    marginBottom: COSMIC_SPACING.xxs,
  },
  optionDescription: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    color: COSMIC_COLORS.text.muted,
  },
  footer: {
    paddingHorizontal: COSMIC_SPACING.lg,
    paddingTop: COSMIC_SPACING.lg,
  },
  footerText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    color: COSMIC_COLORS.text.hint,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default GoalCreationOptions;
