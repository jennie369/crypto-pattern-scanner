/**
 * GEM Mobile - Upgrade Modal Component
 * Show when user exceeds quota
 *
 * Displays:
 * - Current tier and quota status
 * - Upgrade options with pricing
 * - Navigation to Shopify purchase
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  Linking,
  ScrollView
} from 'react-native';
import {
  X,
  Crown,
  Star,
  Zap,
  Check,
  ExternalLink,
  Clock,
  AlertCircle
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, GLASS } from '../../utils/tokens';

/**
 * Tier upgrade options
 */
const UPGRADE_TIERS = [
  {
    id: 'tier1',
    name: 'PRO',
    tier: 'TIER1',
    price: '39.000đ',
    period: '/tháng',
    queries: '15 câu/ngày',
    color: '#FFB800',
    icon: Zap,
    features: [
      '15 câu hỏi mỗi ngày',
      'Phân tích coin cơ bản',
      'Gợi ý trading',
      'Hỗ trợ email'
    ],
    shopifyUrl: 'https://shop.gemcrypto.vn/products/gem-chatbot-pro'
  },
  {
    id: 'tier2',
    name: 'PREMIUM',
    tier: 'TIER2',
    price: '59.000đ',
    period: '/tháng',
    queries: '50 câu/ngày',
    color: '#6A5BFF',
    icon: Star,
    features: [
      '50 câu hỏi mỗi ngày',
      'Phân tích chuyên sâu',
      'Tín hiệu trading',
      'Hỗ trợ ưu tiên'
    ],
    popular: true,
    shopifyUrl: 'https://shop.gemcrypto.vn/products/gem-chatbot-premium'
  },
  {
    id: 'tier3',
    name: 'VIP',
    tier: 'TIER3',
    price: '99.000đ',
    period: '/tháng',
    queries: 'Không giới hạn',
    color: '#FFD700',
    icon: Crown,
    features: [
      'UNLIMITED câu hỏi',
      'Phân tích real-time',
      'Chiến lược độc quyền',
      'Hỗ trợ 24/7 VIP'
    ],
    shopifyUrl: 'https://shop.gemcrypto.vn/products/gem-chatbot-vip'
  }
];

/**
 * UpgradeModal Component
 * @param {Object} props
 * @param {boolean} props.visible - Modal visibility
 * @param {Function} props.onClose - Close callback
 * @param {Object} props.quota - Current quota info
 * @param {string} props.currentTier - Current user tier
 */
const UpgradeModal = ({
  visible,
  onClose,
  quota,
  currentTier = 'FREE'
}) => {
  const handleUpgrade = async (tier) => {
    try {
      await Linking.openURL(tier.shopifyUrl);
    } catch (error) {
      console.error('[UpgradeModal] Error opening URL:', error);
    }
  };

  // Filter out current tier and below
  const getTierLevel = (tier) => {
    const levels = { 'FREE': 0, 'TIER1': 1, 'PRO': 1, 'TIER2': 2, 'PREMIUM': 2, 'TIER3': 3, 'VIP': 3 };
    return levels[tier?.toUpperCase()] || 0;
  };

  const currentLevel = getTierLevel(currentTier);
  const availableTiers = UPGRADE_TIERS.filter(t => getTierLevel(t.tier) > currentLevel);

  // Get reset time text
  const getResetText = () => {
    if (!quota?.resetAt) return null;

    const now = new Date();
    const reset = new Date(quota.resetAt);
    const diff = reset - now;

    if (diff < 0) return 'Reset ngay';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes} phút`;
  };

  const resetText = getResetText();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.alertIcon}>
                <AlertCircle size={24} color="#FF6B6B" />
              </View>
              <Text style={styles.title}>Hết lượt hỏi!</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Current Status */}
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>
              Bạn đã sử dụng hết{' '}
              <Text style={styles.statusHighlight}>
                {quota?.limit || 5} câu hỏi
              </Text>
              {' '}hôm nay
            </Text>
            {resetText && (
              <View style={styles.resetInfo}>
                <Clock size={14} color={COLORS.textMuted} />
                <Text style={styles.resetText}>
                  Reset sau: {resetText}
                </Text>
              </View>
            )}
          </View>

          {/* Upgrade Options */}
          <Text style={styles.sectionTitle}>Nâng cấp để hỏi thêm</Text>

          <ScrollView
            style={styles.tierList}
            showsVerticalScrollIndicator={false}
          >
            {availableTiers.map((tier) => {
              const IconComponent = tier.icon;

              return (
                <View key={tier.id} style={styles.tierCard}>
                  {tier.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>PHỔ BIẾN</Text>
                    </View>
                  )}

                  <View style={styles.tierHeader}>
                    <View style={[styles.tierIcon, { backgroundColor: `${tier.color}20` }]}>
                      <IconComponent size={20} color={tier.color} fill={tier.id === 'tier3' ? tier.color : 'transparent'} />
                    </View>
                    <View style={styles.tierInfo}>
                      <Text style={[styles.tierName, { color: tier.color }]}>
                        {tier.name}
                      </Text>
                      <Text style={styles.tierQueries}>{tier.queries}</Text>
                    </View>
                    <View style={styles.tierPrice}>
                      <Text style={styles.priceAmount}>{tier.price}</Text>
                      <Text style={styles.pricePeriod}>{tier.period}</Text>
                    </View>
                  </View>

                  <View style={styles.featureList}>
                    {tier.features.map((feature, idx) => (
                      <View key={idx} style={styles.featureItem}>
                        <Check size={14} color="#00FF88" />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    onPress={() => handleUpgrade(tier)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[tier.color, `${tier.color}CC`]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.upgradeButton}
                    >
                      <Text style={styles.upgradeButtonText}>Nâng cấp</Text>
                      <ExternalLink size={16} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <TouchableOpacity
            style={styles.waitButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Clock size={16} color={COLORS.textMuted} />
            <Text style={styles.waitButtonText}>
              Đợi reset lúc 0:00
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end'
  },
  content: {
    backgroundColor: COLORS.bgDark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    maxHeight: '90%'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '700'
  },
  closeButton: {
    padding: 4
  },

  // Status box
  statusBox: {
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
    marginBottom: SPACING.lg
  },
  statusText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center'
  },
  statusHighlight: {
    color: '#FF6B6B',
    fontWeight: '700'
  },
  resetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: SPACING.sm
  },
  resetText: {
    color: COLORS.textMuted,
    fontSize: 12
  },

  // Section
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md
  },

  // Tier list
  tierList: {
    paddingHorizontal: SPACING.lg,
    maxHeight: 400
  },
  tierCard: {
    backgroundColor: GLASS.background,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: GLASS.border,
    position: 'relative',
    overflow: 'hidden'
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#6A5BFF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 12
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5
  },

  // Tier header
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  tierIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tierInfo: {
    flex: 1,
    marginLeft: SPACING.sm
  },
  tierName: {
    fontSize: 16,
    fontWeight: '700'
  },
  tierQueries: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2
  },
  tierPrice: {
    alignItems: 'flex-end'
  },
  priceAmount: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700'
  },
  pricePeriod: {
    color: COLORS.textMuted,
    fontSize: 11
  },

  // Features
  featureList: {
    marginVertical: SPACING.sm,
    gap: 6
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  featureText: {
    color: COLORS.textSecondary,
    fontSize: 12
  },

  // Upgrade button
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },

  // Wait button
  waitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm
  },
  waitButtonText: {
    color: COLORS.textMuted,
    fontSize: 14
  }
});

export default UpgradeModal;
