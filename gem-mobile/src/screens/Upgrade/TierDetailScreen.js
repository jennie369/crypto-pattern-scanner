// ============================================================
// TIER DETAIL SCREEN
// Purpose: Hiển thị chi tiết một tier với đầy đủ features
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Check,
  X,
  Crown,
  Zap,
  Star,
  Shield,
  Headphones,
  RefreshCw,
  ExternalLink,
  Gift,
  TrendingUp,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import {
  getTier,
  getCheckoutUrl,
  formatPrice,
  parseFeatures,
  trackCheckoutStart,
} from '../../services/upgradeService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TierDetailScreen = ({ navigation, route }) => {
  const { tierType, tierLevel, tierId } = route.params || {};

  const [tier, setTier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    loadTier();
  }, [tierType, tierLevel]);

  const loadTier = async () => {
    try {
      setLoading(true);
      const data = await getTier(tierType, tierLevel);
      setTier(data);
    } catch (error) {
      console.error('[TierDetailScreen] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!tier) return;

    try {
      setCheckingOut(true);

      // Track checkout start
      await trackCheckoutStart(tierType, tierLevel, 'TierDetailScreen');

      // Get checkout URL
      const checkoutUrl = await getCheckoutUrl(tierType, tierLevel);

      if (checkoutUrl) {
        await Linking.openURL(checkoutUrl);
      } else {
        // Fallback: navigate to shop with correct params for ProductDetailScreen
        navigation.navigate('Shop', {
          screen: 'ProductDetail',
          params: {
            handle: tier.tier_slug,
            fromDeepLink: true,
          },
        });
      }
    } catch (error) {
      console.error('[TierDetailScreen] Checkout error:', error);
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!tier) {
    return (
      <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
        <SafeAreaView style={styles.errorContainer}>
          <Text style={styles.errorText}>Khong tim thay goi dich vu</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Quay lai</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const features = parseFeatures(tier.features_json);
  const includedFeatures = features.filter(f => f.included);
  const excludedFeatures = features.filter(f => !f.included);
  const TierIcon = tier.tier_level === 3 ? Crown : tier.tier_level === 2 ? Star : Zap;

  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiet goi</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            {tier.is_featured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>
                  {tier.badge_text || 'PHO BIEN NHAT'}
                </Text>
              </View>
            )}

            <View style={styles.iconContainer}>
              <TierIcon size={48} color={COLORS.gold} />
            </View>

            <Text style={styles.tierName}>{tier.display_name || tier.tier_name}</Text>
            <Text style={styles.tierLevel}>TIER {tier.tier_level} - {tier.tier_type?.toUpperCase()}</Text>

            {tier.short_description && (
              <Text style={styles.description}>{tier.short_description}</Text>
            )}
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            {tier.original_price_vnd > tier.price_vnd && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>
                  -{Math.round((1 - tier.price_vnd / tier.original_price_vnd) * 100)}%
                </Text>
              </View>
            )}

            <View style={styles.priceRow}>
              {tier.original_price_vnd > tier.price_vnd && (
                <Text style={styles.originalPrice}>
                  {formatPrice(tier.original_price_vnd)}
                </Text>
              )}
              <Text style={styles.currentPrice}>{formatPrice(tier.price_vnd)}</Text>
            </View>

            <Text style={styles.priceNote}>Thanh toan 1 lan - Su dung vinh vien</Text>
          </View>

          {/* Included Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Bao gom</Text>
            <View style={styles.featuresList}>
              {includedFeatures.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureIconIncluded}>
                    <Check size={16} color={COLORS.success} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureLabel}>{feature.label}</Text>
                    {feature.description && (
                      <Text style={styles.featureDesc}>{feature.description}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Excluded Features */}
          {excludedFeatures.length > 0 && (
            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitleMuted}>Khong bao gom</Text>
              <View style={styles.featuresList}>
                {excludedFeatures.map((feature, index) => (
                  <View key={index} style={styles.featureItemExcluded}>
                    <View style={styles.featureIconExcluded}>
                      <X size={14} color={COLORS.textMuted} />
                    </View>
                    <Text style={styles.featureLabelMuted}>{feature.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Trust Badges */}
          <View style={styles.trustSection}>
            <View style={styles.trustItem}>
              <Shield size={20} color={COLORS.gold} />
              <Text style={styles.trustLabel}>Bao mat</Text>
              <Text style={styles.trustDesc}>Thanh toan an toan qua Shopify</Text>
            </View>
            <View style={styles.trustItem}>
              <RefreshCw size={20} color={COLORS.gold} />
              <Text style={styles.trustLabel}>Hoan tien</Text>
              <Text style={styles.trustDesc}>Hoan tien trong 7 ngay</Text>
            </View>
            <View style={styles.trustItem}>
              <Headphones size={20} color={COLORS.gold} />
              <Text style={styles.trustLabel}>Ho tro</Text>
              <Text style={styles.trustDesc}>Ho tro 24/7</Text>
            </View>
          </View>

          {/* Upgrade Benefits */}
          {tier.long_description && (
            <View style={styles.benefitsSection}>
              <Text style={styles.sectionTitle}>Loi ich</Text>
              <Text style={styles.benefitsText}>{tier.long_description}</Text>
            </View>
          )}

          {/* Spacer for CTA */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Fixed CTA */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleCheckout}
            disabled={checkingOut}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.gold, '#FFA500']}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {checkingOut ? (
                <ActivityIndicator size="small" color={COLORS.bgDarkest} />
              ) : (
                <>
                  <Text style={styles.ctaText}>MUA NGAY - {formatPrice(tier.price_vnd)}</Text>
                  <ExternalLink size={18} color={COLORS.bgDarkest} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.compareLink}
            onPress={() => navigation.navigate('UpgradeScreen', { tierType })}
          >
            <Text style={styles.compareLinkText}>So sánh tất cả các gói</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  backButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: 40,
  },

  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    position: 'relative',
  },
  featuredBadge: {
    position: 'absolute',
    top: SPACING.md,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 20,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.bgDarkest,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tierName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  tierLevel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },

  // Price
  priceSection: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 20,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  discountBadge: {
    position: 'absolute',
    top: -10,
    right: SPACING.md,
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  originalPrice: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.gold,
  },
  priceNote: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // Features
  featuresSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  sectionTitleMuted: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  featuresList: {
    gap: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.glassBg,
    padding: SPACING.md,
    borderRadius: 12,
  },
  featureIconIncluded: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(46, 213, 115, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  featureDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  featureItemExcluded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  featureIconExcluded: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureLabelMuted: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },

  // Trust
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.glassBg,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  trustItem: {
    alignItems: 'center',
    flex: 1,
  },
  trustLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  trustDesc: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },

  // Benefits
  benefitsSection: {
    marginBottom: SPACING.lg,
  },
  benefitsText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  // CTA
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.bgDarkest,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  ctaText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.bgDarkest,
  },
  compareLink: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  compareLinkText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
});

export default TierDetailScreen;
