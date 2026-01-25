/**
 * =====================================================
 * ExchangeCard Component
 * =====================================================
 *
 * Card hiển thị thông tin sàn giao dịch
 * - Logo, tên, bonus
 * - Recommended badge
 * - VND support badge
 * - Status badge (nếu đã đăng ký)
 *
 * =====================================================
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { ChevronRight, Star, Check, Clock } from 'lucide-react-native';

// Theme
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../theme';

// Constants
import {
  getExchangeConfig,
  getStatusDisplay,
} from '../../constants/exchangeConfig';

/**
 * ExchangeCard Component
 *
 * @param {Object} props
 * @param {string} props.exchangeId - Exchange ID
 * @param {Object} [props.exchangeConfig] - Optional custom config
 * @param {string} [props.status] - Account status (if registered)
 * @param {boolean} [props.showStatus] - Show status badge
 * @param {Function} props.onPress - Press handler
 * @param {boolean} [props.disabled] - Disabled state
 * @param {string} [props.variant] - 'default' | 'compact'
 */
const ExchangeCard = ({
  exchangeId,
  exchangeConfig,
  status,
  showStatus = false,
  onPress,
  disabled = false,
  variant = 'default',
}) => {
  // Get config from props or constants
  const config = exchangeConfig || getExchangeConfig(exchangeId);

  if (!config) {
    return null;
  }

  const statusDisplay = status ? getStatusDisplay(status) : null;
  const isCompact = variant === 'compact';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isCompact && styles.containerCompact,
        disabled && styles.containerDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {/* Logo */}
      <View style={[styles.logoContainer, { backgroundColor: config.bgColor || 'rgba(255,255,255,0.1)' }]}>
        {config.logo_url || config.logoUrl ? (
          <Image
            source={{ uri: config.logo_url || config.logoUrl }}
            style={styles.logo}
            resizeMode="contain"
          />
        ) : (
          <Text style={[styles.logoText, { color: config.color }]}>
            {config.displayName?.charAt(0) || config.display_name?.charAt(0) || 'E'}
          </Text>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>
            {config.displayName || config.display_name}
          </Text>

          {/* Badges */}
          <View style={styles.badges}>
            {config.isRecommended || config.is_recommended ? (
              <View style={styles.recommendedBadge}>
                <Star size={10} color={COLORS.gold} fill={COLORS.gold} />
                <Text style={styles.recommendedText}>Nổi bật</Text>
              </View>
            ) : null}

            {config.supportsVND || config.supports_vnd ? (
              <View style={styles.vndBadge}>
                <Text style={styles.vndText}>VND</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Description */}
        {!isCompact && (
          <Text style={styles.description} numberOfLines={2}>
            {config.description}
          </Text>
        )}

        {/* Features */}
        {!isCompact && config.features?.length > 0 && (
          <View style={styles.features}>
            {config.features.slice(0, 2).map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Check size={10} color={COLORS.primary} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Commission discount */}
        {!isCompact && (config.commission?.userDiscount || config.user_fee_discount) && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              -{((config.commission?.userDiscount || config.user_fee_discount) * 100).toFixed(0)}% phí
            </Text>
          </View>
        )}
      </View>

      {/* Right side */}
      <View style={styles.rightSide}>
        {showStatus && statusDisplay ? (
          <View style={[styles.statusBadge, { backgroundColor: statusDisplay.color + '20' }]}>
            {statusDisplay.icon === 'Clock' && <Clock size={12} color={statusDisplay.color} />}
            {statusDisplay.icon === 'Check' && <Check size={12} color={statusDisplay.color} />}
            <Text style={[styles.statusText, { color: statusDisplay.color }]}>
              {statusDisplay.label}
            </Text>
          </View>
        ) : (
          <ChevronRight size={20} color={COLORS.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  containerCompact: {
    padding: SPACING.sm,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  logo: {
    width: 32,
    height: 32,
  },
  logoText: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginRight: SPACING.xs,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  vndBadge: {
    backgroundColor: 'rgba(58, 247, 166, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vndText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.success,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  features: {
    marginBottom: SPACING.xs,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  featureText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  discountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
  },
  rightSide: {
    marginLeft: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

export default ExchangeCard;
