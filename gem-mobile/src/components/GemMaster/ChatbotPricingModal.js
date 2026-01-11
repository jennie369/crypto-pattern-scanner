/**
 * GEM Mobile - Chatbot Pricing Modal
 * Shows when user exceeds chatbot quota
 *
 * GEM Master Chatbot AI Pricing:
 * - FREE: 5 câu hỏi/day, auto reset 24h
 * - PRO: 15 câu hỏi/day, 39.000đ/tháng
 * - PREMIUM: 50 câu hỏi/day, 59.000đ/tháng
 * - VIP: Unlimited câu hỏi/day, 99.000đ/tháng
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  X,
  Crown,
  Star,
  Zap,
  Check,
  AlertCircle,
  ShoppingCart,
  Infinity,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, GLASS } from '../../utils/tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Chatbot tier packages - synced with Shopify products
 * NOTE: These use chatbot_tier naming (PRO/PREMIUM/VIP), NOT scanner_tier (TIER1/2/3)
 */
const CHATBOT_TIERS = [
  {
    id: 'pro',
    name: 'PRO',
    tier: 'PRO',
    price: 39000,
    priceDisplay: '39.000đ',
    period: '/tháng',
    queries: 15,
    queriesDisplay: '15 lượt/ngày',
    color: '#FFB800',
    icon: Zap,
    features: [
      '15 câu hỏi mỗi ngày',
      'Phân tích coin cơ bản',
      'Gợi ý trading',
      'Hỗ trợ email',
    ],
    shopifyProductHandle: 'gem-chatbot-pro',
    shopifyUrl: 'https://shop.gemcrypto.vn/products/gem-chatbot-pro',
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    tier: 'PREMIUM',
    price: 59000,
    priceDisplay: '59.000đ',
    period: '/tháng',
    queries: 50,
    queriesDisplay: '50 lượt/ngày',
    color: '#6A5BFF',
    icon: Star,
    features: [
      '50 câu hỏi mỗi ngày',
      'Phân tích chuyên sâu',
      'Tín hiệu trading',
      'Hỗ trợ ưu tiên',
    ],
    popular: true,
    shopifyProductHandle: 'gem-chatbot-premium',
    shopifyUrl: 'https://shop.gemcrypto.vn/products/gem-chatbot-premium',
  },
  {
    id: 'vip',
    name: 'VIP',
    tier: 'VIP',
    price: 99000,
    priceDisplay: '99.000đ',
    period: '/tháng',
    queries: -1, // Unlimited
    queriesDisplay: 'Không giới hạn',
    color: '#FFD700',
    icon: Crown,
    features: [
      'Không giới hạn câu hỏi',
      'Phân tích real-time',
      'Chiến lược độc quyền',
      'Hỗ trợ 24/7 VIP',
    ],
    shopifyProductHandle: 'gem-chatbot-vip',
    shopifyUrl: 'https://shop.gemcrypto.vn/products/gem-chatbot-vip',
  },
];

/**
 * ChatbotPricingModal Component
 */
const ChatbotPricingModal = ({
  visible,
  onClose,
  quota,
  currentTier = 'FREE',
}) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);

  // Filter tiers higher than current (chatbot_tier uses FREE/PRO/PREMIUM/VIP)
  const getTierLevel = (tier) => {
    const levels = { 'FREE': 0, 'PRO': 1, 'PREMIUM': 2, 'VIP': 3 };
    return levels[tier?.toUpperCase()] || 0;
  };

  const currentLevel = getTierLevel(currentTier);
  const availableTiers = CHATBOT_TIERS.filter(t => getTierLevel(t.tier) > currentLevel);

  /**
   * Handle upgrade - Navigate to Shopify product page in WebView
   */
  const handleUpgrade = useCallback((tier) => {
    console.log('[ChatbotPricingModal] Opening product:', tier.name, tier.shopifyUrl);

    // Close modal first
    onClose();

    // Navigate to Shop > CheckoutWebView with product URL
    // Tab name is "Shop" not "ShopTab"
    navigation.navigate('Shop', {
      screen: 'CheckoutWebView',
      params: {
        checkoutUrl: tier.shopifyUrl,
        title: `GEM Chatbot ${tier.name}`,
        productName: `GEM Chatbot ${tier.name}`,
        returnScreen: 'Home',
      },
    });
  }, [navigation, onClose]);

  /**
   * Render tier card
   */
  const renderTierCard = (tier) => {
    const IconComponent = tier.icon;
    const isSelected = selectedTier === tier.id;
    const isLoading = loading && isSelected;

    return (
      <View key={tier.id} style={[styles.tierCard, tier.popular && styles.tierCardPopular]}>
        {/* Popular badge */}
        {tier.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>PHỔ BIẾN NHẤT</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.tierHeader}>
          <View style={[styles.tierIcon, { backgroundColor: `${tier.color}20` }]}>
            <IconComponent
              size={24}
              color={tier.color}
              fill={tier.id === 'vip' ? tier.color : 'transparent'}
            />
          </View>
          <View style={styles.tierInfo}>
            <Text style={[styles.tierName, { color: tier.color }]}>
              {tier.name}
            </Text>
            <View style={styles.tierQuotaRow}>
              {tier.queries === -1 ? (
                <Infinity size={14} color={COLORS.success} />
              ) : null}
              <Text style={styles.tierQueries}>{tier.queriesDisplay}</Text>
            </View>
          </View>
          <View style={styles.tierPricing}>
            <Text style={styles.tierPrice}>{tier.priceDisplay}</Text>
            <Text style={styles.tierPeriod}>{tier.period}</Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.featureList}>
          {tier.features.map((feature, idx) => (
            <View key={idx} style={styles.featureItem}>
              <Check size={14} color="#00FF88" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Upgrade Button */}
        <TouchableOpacity
          onPress={() => handleUpgrade(tier)}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isLoading ? ['#666', '#555'] : [tier.color, `${tier.color}BB`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.upgradeButton}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <ShoppingCart size={16} color="#fff" />
                <Text style={styles.upgradeButtonText}>Mua ngay</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  // Header component for FlatList
  const ListHeader = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <AlertCircle size={28} color={COLORS.gold} />
        </View>
        <Text style={styles.title}>Hết lượt hôm nay</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Status */}
      <View style={styles.statusBox}>
        <Text style={styles.statusText}>
          Bạn đã sử dụng hết{' '}
          <Text style={styles.statusHighlight}>
            {quota?.limit || 5} lượt hỏi
          </Text>
          {' '}trong ngày.
        </Text>
        <Text style={styles.statusSubtext}>
          Nâng cấp để có thêm lượt hỏi:
        </Text>
        <View style={styles.tierCompare}>
          <Text style={styles.tierCompareItem}>• PRO: 15 lượt/ngày - 39.000đ</Text>
          <Text style={styles.tierCompareItem}>• PREMIUM: 50 lượt/ngày - 59.000đ</Text>
          <Text style={styles.tierCompareItem}>• VIP: Không giới hạn - 99.000đ</Text>
        </View>
      </View>
    </>
  );

  // Footer component for FlatList
  const ListFooter = () => (
    <TouchableOpacity style={styles.dismissButton} onPress={onClose}>
      <Text style={styles.dismissText}>Đóng</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop - tap to close */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Content with FlatList for smooth scrolling */}
        <View style={styles.content}>
          <FlatList
            data={availableTiers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderTierCard(item)}
            ListHeaderComponent={ListHeader}
            ListFooterComponent={ListFooter}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
            overScrollMode="always"
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backdrop: {
    flex: 1,
  },
  content: {
    backgroundColor: 'rgba(15, 25, 45, 0.98)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.82,
    paddingTop: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.5)',
  },
  title: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: SPACING.xs,
  },
  statusBox: {
    padding: SPACING.md,
    backgroundColor: 'rgba(13, 40, 71, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
    marginBottom: SPACING.md,
  },
  statusText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  statusHighlight: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  statusSubtext: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  tierCompare: {
    marginTop: SPACING.xs,
  },
  tierCompareItem: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginVertical: 2,
  },
  flatListContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl + 40,
  },
  tierCard: {
    backgroundColor: GLASS.background,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: GLASS.border,
    position: 'relative',
    overflow: 'hidden',
  },
  tierCardPopular: {
    borderColor: '#6A5BFF',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#6A5BFF',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 12,
  },
  popularText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tierIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  tierName: {
    fontSize: 17,
    fontWeight: '700',
  },
  tierQuotaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  tierQueries: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  tierPricing: {
    alignItems: 'flex-end',
  },
  tierPrice: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  tierPeriod: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  featureList: {
    marginVertical: SPACING.sm,
    gap: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  dismissButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: SPACING.md,
    backgroundColor: '#FFBD59',
    borderRadius: 22,
  },
  dismissText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatbotPricingModal;
