// ============================================================
// UPGRADE SCREEN
// Purpose: Full screen hiển thị tất cả tiers để user chọn
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Check,
  X,
  Crown,
  Shield,
  Zap,
  Star,
  AlertCircle,
  Sparkles,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import upgradeService from '../../services/upgradeService';
import { useAuth } from '../../contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const UpgradeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { profile } = useAuth();
  const { tierType = 'scanner', source, requiredLevel } = route.params || {};

  // State
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

  // Get current user tier level
  const getCurrentTierLevel = () => {
    if (!profile) return 0;
    const tierKey = tierType === 'scanner' ? 'scanner_tier' : 'chatbot_tier';
    return upgradeService.getTierLevelFromString(profile[tierKey]);
  };

  const currentLevel = getCurrentTierLevel();

  // Fetch tiers
  const fetchTiers = useCallback(async () => {
    try {
      setError(null);
      const data = await upgradeService.getTiersByType(tierType);
      // Filter to show only upgradeable tiers (higher than current)
      const upgradeable = data.filter(t => t.tier_level > currentLevel);
      setTiers(upgradeable);

      // Auto-select featured tier or first available
      const featured = upgradeable.find(t => t.is_featured || t.is_popular);
      if (featured) {
        setSelectedTier(featured.id);
      } else if (upgradeable.length > 0) {
        setSelectedTier(upgradeable[0].id);
      }
    } catch (err) {
      console.error('[UpgradeScreen] Fetch error:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tierType, currentLevel]);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTiers();
  }, [fetchTiers]);

  // Handle checkout
  const handleCheckout = async (tier) => {
    try {
      setCheckingOut(true);

      // Track checkout start
      await upgradeService.trackCheckoutStart(tierType, tier.tier_level, 'UpgradeScreen');

      const checkoutUrl = await upgradeService.getCheckoutUrl(tierType, tier.tier_level);

      if (checkoutUrl) {
        await Linking.openURL(checkoutUrl);
      } else {
        // Navigate to in-app shop (Shop is the tab name in TabNavigator)
        // ProductDetailScreen expects 'handle' and 'fromDeepLink: true' to fetch product
        navigation.navigate('Shop', {
          screen: 'ProductDetail',
          params: {
            handle: tier.tier_slug,
            fromDeepLink: true,
          },
        });
      }
    } catch (err) {
      console.error('[UpgradeScreen] Checkout error:', err);
    } finally {
      setCheckingOut(false);
    }
  };

  // Get tier icon
  const getTierIcon = (tier) => {
    if (tier.tier_level === 3) return Crown;
    if (tier.tier_level === 2) return Star;
    if (tier.tier_level === 1) return Zap;
    return Sparkles;
  };

  // Render tier card
  const renderTierCard = (tier) => {
    const isSelected = selectedTier === tier.id;
    const features = upgradeService.parseFeatures(tier.features_json);
    const TierIcon = getTierIcon(tier);

    return (
      <TouchableOpacity
        key={tier.id}
        style={[
          styles.tierCard,
          isSelected && styles.tierCardSelected,
          tier.is_popular && styles.tierCardPopular,
        ]}
        onPress={() => setSelectedTier(tier.id)}
        activeOpacity={0.8}
      >
        {/* Badge */}
        {tier.badge_text && (
          <View style={[
            styles.badgeContainer,
            { backgroundColor: tier.badge_color || COLORS.gold }
          ]}>
            <Text style={styles.badgeText}>{tier.badge_text}</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.tierHeader}>
          <View style={[styles.tierIconContainer, { backgroundColor: `${tier.color_primary || COLORS.gold}20` }]}>
            <TierIcon size={24} color={tier.color_primary || COLORS.gold} />
          </View>
          <View style={styles.tierInfo}>
            <Text style={[styles.tierName, { color: tier.color_primary || COLORS.gold }]}>
              {tier.display_name || tier.tier_name}
            </Text>
            <Text style={styles.tierDescription}>{tier.short_description}</Text>
          </View>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          {tier.original_price_vnd && tier.original_price_vnd > tier.price_vnd && (
            <Text style={styles.originalPrice}>
              {upgradeService.formatPrice(tier.original_price_vnd)}
            </Text>
          )}
          <Text style={styles.price}>
            {upgradeService.formatPrice(tier.price_vnd)}
          </Text>
          <Text style={styles.priceNote}>/ trọn đời</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {features.map((feature, idx) => (
            <View key={idx} style={styles.featureRow}>
              {feature.included ? (
                <Check size={16} color={COLORS.success} />
              ) : (
                <X size={16} color={COLORS.textMuted} />
              )}
              <Text
                style={[
                  styles.featureText,
                  !feature.included && styles.featureTextDisabled,
                ]}
              >
                {feature.label}
              </Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[
            styles.ctaButton,
            isSelected && styles.ctaButtonSelected,
          ]}
          onPress={() => handleCheckout(tier)}
          disabled={checkingOut}
        >
          {checkingOut && isSelected ? (
            <ActivityIndicator size="small" color={COLORS.bgDarkest} />
          ) : (
            <Text style={[
              styles.ctaText,
              isSelected && styles.ctaTextSelected,
            ]}>
              {isSelected ? 'Mua ngay' : 'Chọn gói'}
            </Text>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Loading state
  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Error state
  if (error) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <AlertCircle size={48} color={COLORS.error} />
            <Text style={styles.errorTitle}>Đã có lỗi xảy ra</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchTiers}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Empty state
  if (tiers.length === 0) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Nâng cấp</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.emptyContainer}>
            <Crown size={64} color={COLORS.gold} />
            <Text style={styles.emptyTitle}>Bạn đang ở gói cao nhất!</Text>
            <Text style={styles.emptyMessage}>
              Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi.
            </Text>
            <TouchableOpacity
              style={styles.backToHomeButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backToHomeText}>Quay lại</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chọn gói nâng cấp</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.heroSection}>
            <Crown size={48} color={COLORS.gold} />
            <Text style={styles.heroTitle}>Mở khóa toàn bộ tiềm năng</Text>
            <Text style={styles.heroSubtitle}>
              Nâng cấp để truy cập tất cả tính năng premium
            </Text>
          </View>

          {/* Tiers */}
          <View style={styles.tiersContainer}>
            {tiers.map(renderTierCard)}
          </View>

          {/* Trust badges */}
          <View style={styles.trustSection}>
            <View style={styles.trustItem}>
              <Shield size={20} color={COLORS.success} />
              <Text style={styles.trustText}>Thanh toán an toàn</Text>
            </View>
            <View style={styles.trustItem}>
              <Zap size={20} color={COLORS.gold} />
              <Text style={styles.trustText}>Kích hoạt ngay</Text>
            </View>
            <View style={styles.trustItem}>
              <Star size={20} color={COLORS.purple} />
              <Text style={styles.trustText}>Hỗ trợ 24/7</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  retryButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: 8,
    marginTop: SPACING.lg,
  },
  retryText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    marginTop: SPACING.lg,
  },
  emptyMessage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  backToHomeButton: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: 8,
    marginTop: SPACING.lg,
  },
  backToHomeText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gold,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  heroTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  heroSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  tiersContainer: {
    gap: SPACING.lg,
  },
  tierCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  tierCardSelected: {
    borderColor: COLORS.gold,
  },
  tierCardPopular: {
    borderColor: COLORS.purple,
  },
  badgeContainer: {
    position: 'absolute',
    top: -1,
    right: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.bgDarkest,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tierIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  tierName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  tierDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.md,
  },
  originalPrice: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    marginRight: SPACING.sm,
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  priceNote: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  featuresContainer: {
    marginBottom: SPACING.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  featureText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  featureTextDisabled: {
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  ctaButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaButtonSelected: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  ctaText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  ctaTextSelected: {
    color: COLORS.bgDarkest,
  },
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  trustItem: {
    alignItems: 'center',
  },
  trustText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});

export default UpgradeScreen;
