/**
 * TierUpgradeScreen - Full screen for tier upgrade
 * Shows tier benefits, pricing, and upgrade options
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, GLASS } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';
import {
  getTierDisplayInfo,
  getUpgradeInfo,
  getLockedFeatures,
  calculateWinRateBonus,
} from '../../constants/tierFeatures';
import { shopifyService } from '../../services/shopifyService';

// Tier pricing info (link to Shopify products)
const TIER_PRODUCTS = {
  tier1: {
    name: 'GEM Tier 1 - Basic',
    price: '199.000đ/tháng',
    shopifyHandle: 'gem-tier-1-membership',
    features: [
      'Multi-timeframe Analysis (4H, 1D)',
      'Basic Pattern Detection',
      'Daily Market Alerts',
      'Community Access',
    ],
  },
  tier2: {
    name: 'GEM Tier 2 - Pro',
    price: '499.000đ/tháng',
    shopifyHandle: 'gem-tier-2-membership',
    features: [
      'All Tier 1 Features',
      'Whale Tracking System',
      'AI-Powered Predictions',
      'Backtesting Engine Pro',
      'Priority Support',
    ],
  },
  tier3: {
    name: 'GEM Tier 3 - Elite',
    price: '999.000đ/tháng',
    shopifyHandle: 'gem-tier-3-membership',
    features: [
      'All Tier 2 Features',
      'Real-time Whale Alerts',
      'Custom Strategy Builder',
      'API Access',
      '1-on-1 Coaching Sessions',
      'Exclusive Trading Signals',
    ],
  },
};

export default function TierUpgradeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, profile } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();
  const [loading, setLoading] = useState(false);

  // Get target tier from route params or default to next tier
  const targetTier = route.params?.tier || 'tier1';
  const currentTier = profile?.tier || 'free';

  const tierInfo = getTierDisplayInfo(targetTier);
  const currentTierInfo = getTierDisplayInfo(currentTier);
  const upgradeInfo = getUpgradeInfo(currentTier);
  const winRateBonus = calculateWinRateBonus(targetTier);
  const tierProduct = TIER_PRODUCTS[targetTier] || TIER_PRODUCTS.tier1;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Get Shopify checkout URL for tier product
      const checkoutUrl = await shopifyService.createCheckout([
        { variantId: tierProduct.shopifyHandle, quantity: 1 }
      ]);

      if (checkoutUrl) {
        // Navigate to checkout webview
        navigation.navigate('CheckoutWebView', {
          url: checkoutUrl,
          title: `Upgrade to ${tierInfo.label}`,
        });
      } else {
        // Fallback: open shop
        navigation.navigate('Shop', {
          screen: 'ShopMain',
          params: { category: 'memberships' },
        });
      }
    } catch (error) {
      console.error('[TierUpgradeScreen] Upgrade error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể tạo đơn hàng. Vui lòng thử lại sau.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoToShop = () => {
    navigation.navigate('Shop', {
      screen: 'ShopMain',
      params: { category: 'memberships' },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nâng cấp tài khoản</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Tier Badge */}
        <View style={styles.currentTierSection}>
          <Text style={styles.currentTierLabel}>Gói hiện tại</Text>
          <View style={[styles.tierBadge, { backgroundColor: currentTierInfo.bgColor }]}>
            <Text style={styles.tierBadgeIcon}>{currentTierInfo.icon}</Text>
            <Text style={[styles.tierBadgeText, { color: currentTierInfo.color }]}>
              {currentTierInfo.label}
            </Text>
          </View>
        </View>

        {/* Target Tier Card */}
        <LinearGradient
          colors={[tierInfo.color + '30', GLASS.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.upgradeCard}
        >
          <View style={styles.upgradeHeader}>
            <Text style={styles.upgradeIcon}>{tierInfo.icon}</Text>
            <View style={styles.upgradeHeaderText}>
              <Text style={styles.upgradeName}>{tierProduct.name}</Text>
              <Text style={[styles.upgradePrice, { color: tierInfo.color }]}>
                {tierProduct.price}
              </Text>
            </View>
          </View>

          {/* Win Rate Bonus */}
          <View style={styles.winRateBox}>
            <Text style={styles.winRateLabel}>Ước tính tăng Win Rate</Text>
            <Text style={styles.winRateValue}>{winRateBonus.text}</Text>
            <Text style={styles.winRateDesc}>{winRateBonus.description}</Text>
          </View>

          {/* Features List */}
          <View style={styles.featuresList}>
            <Text style={styles.featuresTitle}>Bạn sẽ nhận được:</Text>
            {tierProduct.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#00FF88" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Comparison Section */}
        {targetTier !== 'tier3' && (
          <View style={styles.comparisonSection}>
            <Text style={styles.comparisonTitle}>So sánh các gói</Text>

            {Object.entries(TIER_PRODUCTS).map(([key, product]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.tierOption,
                  targetTier === key && styles.tierOptionSelected,
                ]}
                onPress={() => navigation.setParams({ tier: key })}
              >
                <View style={styles.tierOptionHeader}>
                  <Text style={styles.tierOptionIcon}>
                    {getTierDisplayInfo(key).icon}
                  </Text>
                  <View style={styles.tierOptionInfo}>
                    <Text style={styles.tierOptionName}>{product.name}</Text>
                    <Text style={styles.tierOptionPrice}>{product.price}</Text>
                  </View>
                  {targetTier === key && (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Benefits from upgrade */}
        {upgradeInfo.benefits && upgradeInfo.benefits.length > 0 && (
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Lợi ích khi nâng cấp:</Text>
            {upgradeInfo.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Ionicons name="star" size={16} color={COLORS.gold} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* CTA Buttons */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={handleUpgrade}
          disabled={loading}
        >
          <LinearGradient
            colors={[tierInfo.color, '#FF6B6B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.upgradeButtonGradient}
          >
            <Text style={styles.upgradeButtonText}>
              {loading ? 'Đang xử lý...' : `Nâng cấp lên ${tierInfo.label}`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shopButton} onPress={handleGoToShop}>
          <Text style={styles.shopButtonText}>Xem tất cả gói tại Shop</Text>
        </TouchableOpacity>
      </View>
      {AlertComponent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: GLASS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  currentTierSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  currentTierLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  tierBadgeIcon: {
    fontSize: 18,
  },
  tierBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  upgradeCard: {
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  upgradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  upgradeIcon: {
    fontSize: 48,
  },
  upgradeHeaderText: {
    flex: 1,
  },
  upgradeName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  upgradePrice: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  winRateBox: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
    marginBottom: SPACING.lg,
  },
  winRateLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  winRateValue: {
    color: '#00FF88',
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 4,
  },
  winRateDesc: {
    color: '#00FF88',
    fontSize: 12,
  },
  featuresList: {
    gap: SPACING.sm,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  comparisonSection: {
    marginBottom: SPACING.xl,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  tierOption: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  tierOptionSelected: {
    borderColor: COLORS.success,
    backgroundColor: 'rgba(0, 255, 136, 0.05)',
  },
  tierOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  tierOptionIcon: {
    fontSize: 28,
  },
  tierOptionInfo: {
    flex: 1,
  },
  tierOptionName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  tierOptionPrice: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  benefitsSection: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  benefitText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: GLASS.border,
  },
  upgradeButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  upgradeButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  shopButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  shopButtonText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
