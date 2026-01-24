/**
 * =====================================================
 * DepositPromptModal Component
 * =====================================================
 *
 * Smart modal nhắc người dùng nạp tiền
 * 3 variants:
 * - after_signup: Nhắc sau 24h đăng ký
 * - winning_streak: Nhắc khi 3+ wins liên tiếp
 * - high_grade_pattern: Nhắc khi pattern A/A+
 *
 * Features:
 * - Dynamic content based on prompt type
 * - Deposit methods list
 * - Track click/dismiss events
 * - "Nhắc sau" option
 *
 * =====================================================
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  Linking,
} from 'react-native';
import {
  X,
  Wallet,
  TrendingUp,
  Zap,
  Gift,
  DollarSign,
  ChevronRight,
  Clock,
  Shield,
  Star,
} from 'lucide-react-native';

// Theme
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../theme';

// Constants
import {
  getExchangeConfig,
  getPromptContent,
  DEPOSIT_PROMPT_TYPES,
} from '../../constants/exchangeConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Get icon component for prompt type
 */
const getPromptIcon = (iconName, color = COLORS.primary, size = 24) => {
  const icons = {
    Wallet: <Wallet size={size} color={color} />,
    TrendingUp: <TrendingUp size={size} color={color} />,
    Zap: <Zap size={size} color={color} />,
    Gift: <Gift size={size} color={color} />,
    DollarSign: <DollarSign size={size} color={color} />,
  };
  return icons[iconName] || <Wallet size={size} color={color} />;
};

/**
 * DepositPromptModal Component
 *
 * @param {Object} props
 * @param {boolean} props.visible - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {Object} props.prompt - Prompt data from getPendingDepositPrompts
 * @param {Function} props.onAction - Action handler (action: 'open_exchange' | 'remind_later' | 'dismiss')
 */
const DepositPromptModal = ({
  visible,
  onClose,
  prompt,
  onAction,
}) => {
  if (!prompt) return null;

  const exchangeConfig = getExchangeConfig(prompt.exchange);
  const content = prompt.content || getPromptContent(prompt.prompt_type, {
    exchange: prompt.exchange_name || exchangeConfig?.displayName,
    ...prompt.context_data,
  });

  const handleOpenExchange = useCallback(async () => {
    onAction?.('open_exchange');
    const link = prompt.affiliate_link || exchangeConfig?.affiliateLink;
    if (link) {
      try {
        await Linking.openURL(link);
      } catch (error) {
        console.error('[DepositPrompt] Error opening link:', error);
      }
    }
    onClose();
  }, [prompt, exchangeConfig, onAction, onClose]);

  const handleRemindLater = useCallback(() => {
    onAction?.('remind_later');
    onClose();
  }, [onAction, onClose]);

  const handleDismiss = useCallback(() => {
    onAction?.('dismiss');
    onClose();
  }, [onAction, onClose]);

  const depositMethods = exchangeConfig?.depositMethods || [];
  const recommendedMethod = depositMethods.find(m => m.recommended);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
              <X size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: (exchangeConfig?.bgColor || 'rgba(106, 91, 255, 0.15)') }]}>
            {getPromptIcon(content.icon, exchangeConfig?.color || COLORS.primary, 32)}
          </View>

          {/* Content */}
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.message}>{content.message}</Text>

          {/* Exchange Badge */}
          <View style={[styles.exchangeBadge, { backgroundColor: exchangeConfig?.bgColor }]}>
            <Text style={[styles.exchangeName, { color: exchangeConfig?.color }]}>
              {prompt.exchange_name || exchangeConfig?.displayName}
            </Text>
            {exchangeConfig?.isRecommended && (
              <Star size={12} color="#FFD700" fill="#FFD700" />
            )}
          </View>

          {/* Deposit Methods */}
          {depositMethods.length > 0 && (
            <View style={styles.methodsSection}>
              <Text style={styles.methodsTitle}>Cach nap tien:</Text>

              {recommendedMethod && (
                <View style={styles.recommendedMethod}>
                  <View style={styles.methodHeader}>
                    <Shield size={14} color="#10B981" />
                    <Text style={styles.recommendedLabel}>Khuyen nghi</Text>
                  </View>
                  <Text style={styles.methodName}>{recommendedMethod.name}</Text>
                  <Text style={styles.methodDescription}>{recommendedMethod.description}</Text>

                  {recommendedMethod.steps?.length > 0 && (
                    <View style={styles.steps}>
                      {recommendedMethod.steps.slice(0, 3).map((step, index) => (
                        <Text key={index} style={styles.stepText}>
                          {index + 1}. {step}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Commission Info */}
          {exchangeConfig?.commission?.userDiscount && (
            <View style={styles.discountInfo}>
              <Gift size={14} color={COLORS.primary} />
              <Text style={styles.discountText}>
                Ban duoc giam {(exchangeConfig.commission.userDiscount * 100).toFixed(0)}% phi giao dich khi dang ky qua GEM
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleOpenExchange}
              activeOpacity={0.8}
            >
              <Wallet size={18} color={COLORS.textPrimary} />
              <Text style={styles.primaryButtonText}>{content.cta}</Text>
              <ChevronRight size={18} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRemindLater}
              activeOpacity={0.7}
            >
              <Clock size={16} color={COLORS.textSecondary} />
              <Text style={styles.secondaryButtonText}>Nhac sau 24h</Text>
            </TouchableOpacity>
          </View>

          {/* Dismiss */}
          <TouchableOpacity onPress={handleDismiss}>
            <Text style={styles.dismissText}>Khong hien thi lai</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    backgroundColor: COLORS.bgDarkest,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl + 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: SPACING.sm,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  exchangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    gap: 6,
    marginBottom: SPACING.lg,
  },
  exchangeName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  methodsSection: {
    marginBottom: SPACING.md,
  },
  methodsTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  recommendedMethod: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  recommendedLabel: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#10B981',
  },
  methodName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  steps: {
    marginTop: SPACING.xs,
  },
  stepText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  discountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: 8,
    marginBottom: SPACING.lg,
  },
  discountText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
  },
  actions: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  primaryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  secondaryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  dismissText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default DepositPromptModal;
