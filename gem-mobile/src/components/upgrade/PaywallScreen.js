// ============================================================
// PAYWALL SCREEN
// Purpose: Fullscreen paywall với tier options
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import {
  X,
  ArrowLeft,
  Check,
  Shield,
  Headphones,
  RefreshCw,
  Sparkles,
  Crown,
  Zap,
  Star,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import { getTiersByType, formatPrice, parseFeatures } from '../../services/upgradeService';
import UpgradeCard from './UpgradeCard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PaywallScreen = ({
  visible = false,
  tierType = 'scanner',
  currentTierLevel = 0,
  onClose,
  onSelectTier,
  title,
  subtitle,
  featureHighlights = [],
}) => {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState(null);

  // Animation values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    if (visible) {
      loadTiers();
      opacity.value = withSpring(1);
      translateY.value = withSpring(0);
    } else {
      opacity.value = withSpring(0);
      translateY.value = withSpring(50);
    }
  }, [visible, tierType]);

  const loadTiers = async () => {
    try {
      setLoading(true);
      const data = await getTiersByType(tierType);
      // Filter tiers higher than current
      const availableTiers = data.filter(t => t.tier_level > currentTierLevel);
      setTiers(availableTiers);

      // Auto-select featured tier
      const featured = availableTiers.find(t => t.is_featured);
      if (featured) {
        setSelectedTier(featured);
      } else if (availableTiers.length > 0) {
        setSelectedTier(availableTiers[0]);
      }
    } catch (error) {
      console.error('[PaywallScreen] Error loading tiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTier = (tier) => {
    setSelectedTier(tier);
  };

  const handleContinue = () => {
    if (selectedTier && onSelectTier) {
      onSelectTier(selectedTier);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  const TierIcon = tierType === 'chatbot' ? Sparkles : tierType === 'course' ? Crown : Zap;

  // Default highlights based on tier type
  const defaultHighlights = {
    scanner: [
      { icon: Zap, text: 'Scan không giới hạn' },
      { icon: Check, text: '50+ patterns premium' },
      { icon: Shield, text: 'Backtesting chi tiết' },
    ],
    chatbot: [
      { icon: Sparkles, text: 'Chat không giới hạn' },
      { icon: Star, text: 'Premium readings' },
      { icon: Crown, text: 'Ưu tiên xử lý' },
    ],
    course: [
      { icon: Crown, text: 'Truy cập tất cả khóa học' },
      { icon: Check, text: 'Chứng chỉ hoàn thành' },
      { icon: Headphones, text: 'Hỗ trợ 1-1' },
    ],
  };

  const highlights = featureHighlights.length > 0
    ? featureHighlights
    : defaultHighlights[tierType] || defaultHighlights.scanner;

  return (
    <View style={styles.overlay}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={GRADIENTS.primary}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={animatedStyle}>
              {/* Hero Section */}
              <View style={styles.heroSection}>
                <View style={styles.iconContainer}>
                  <TierIcon size={48} color={COLORS.gold} />
                </View>
                <Text style={styles.title}>
                  {title || `Mở khóa ${tierType.toUpperCase()} Premium`}
                </Text>
                <Text style={styles.subtitle}>
                  {subtitle || 'Nâng cấp để sử dụng đầy đủ tính năng'}
                </Text>
              </View>

              {/* Feature Highlights */}
              <View style={styles.highlightsSection}>
                {highlights.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <View key={index} style={styles.highlightItem}>
                      <View style={styles.highlightIcon}>
                        <Icon size={20} color={COLORS.gold} />
                      </View>
                      <Text style={styles.highlightText}>{item.text}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Tier Cards */}
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.gold} />
                </View>
              ) : (
                <View style={styles.tiersSection}>
                  {tiers.map((tier) => (
                    <TouchableOpacity
                      key={tier.id}
                      style={[
                        styles.tierOption,
                        selectedTier?.id === tier.id && styles.tierOptionSelected,
                        tier.is_featured && styles.tierOptionFeatured,
                      ]}
                      onPress={() => handleSelectTier(tier)}
                      activeOpacity={0.8}
                    >
                      {tier.is_featured && (
                        <View style={styles.featuredBadge}>
                          <Text style={styles.featuredBadgeText}>
                            {tier.badge_text || 'PHO BIEN NHAT'}
                          </Text>
                        </View>
                      )}

                      <View style={styles.tierOptionContent}>
                        <View style={styles.tierOptionLeft}>
                          <View style={[
                            styles.radioOuter,
                            selectedTier?.id === tier.id && styles.radioOuterSelected,
                          ]}>
                            {selectedTier?.id === tier.id && (
                              <View style={styles.radioInner} />
                            )}
                          </View>
                          <View>
                            <Text style={styles.tierOptionName}>
                              {tier.display_name || tier.tier_name}
                            </Text>
                            <Text style={styles.tierOptionDesc} numberOfLines={1}>
                              {tier.short_description}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.tierOptionRight}>
                          {tier.original_price_vnd > tier.price_vnd && (
                            <Text style={styles.tierOriginalPrice}>
                              {formatPrice(tier.original_price_vnd)}
                            </Text>
                          )}
                          <Text style={styles.tierOptionPrice}>
                            {formatPrice(tier.price_vnd)}
                          </Text>
                        </View>
                      </View>

                      {/* Features preview */}
                      {selectedTier?.id === tier.id && (
                        <View style={styles.tierFeatures}>
                          {parseFeatures(tier.features_json)
                            .filter(f => f.included)
                            .slice(0, 3)
                            .map((feature, idx) => (
                              <View key={idx} style={styles.tierFeatureItem}>
                                <Check size={14} color={COLORS.success} />
                                <Text style={styles.tierFeatureText}>{feature.label}</Text>
                              </View>
                            ))}
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Trust badges */}
              <View style={styles.trustSection}>
                <View style={styles.trustItem}>
                  <Shield size={16} color={COLORS.textSecondary} />
                  <Text style={styles.trustText}>Thanh toan an toan</Text>
                </View>
                <View style={styles.trustItem}>
                  <Headphones size={16} color={COLORS.textSecondary} />
                  <Text style={styles.trustText}>Ho tro 24/7</Text>
                </View>
                <View style={styles.trustItem}>
                  <RefreshCw size={16} color={COLORS.textSecondary} />
                  <Text style={styles.trustText}>Hoan tien 7 ngay</Text>
                </View>
              </View>
            </Animated.View>
          </ScrollView>

          {/* CTA Button */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={[
                styles.ctaButton,
                !selectedTier && styles.ctaButtonDisabled,
              ]}
              onPress={handleContinue}
              disabled={!selectedTier}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={selectedTier ? [COLORS.gold, '#FFA500'] : [COLORS.glassBg, COLORS.glassBg]}
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[
                  styles.ctaText,
                  !selectedTier && styles.ctaTextDisabled,
                ]}>
                  {selectedTier
                    ? `NÂNG CẤP - ${formatPrice(selectedTier.price_vnd)}`
                    : 'CHỌN GÓI ĐỂ TIẾP TỤC'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.skipText}>Để sau</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Highlights
  highlightsSection: {
    marginBottom: SPACING.xl,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  highlightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    flex: 1,
  },

  // Tiers
  tiersSection: {
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  tierOption: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  tierOptionSelected: {
    borderColor: COLORS.gold,
  },
  tierOptionFeatured: {
    backgroundColor: 'rgba(255, 189, 89, 0.08)',
  },
  featuredBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  featuredBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.bgDarkest,
  },
  tierOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.gold,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.gold,
  },
  tierOptionName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  tierOptionDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    maxWidth: 180,
  },
  tierOptionRight: {
    alignItems: 'flex-end',
  },
  tierOriginalPrice: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  tierOptionPrice: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.gold,
  },
  tierFeatures: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    gap: 6,
  },
  tierFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tierFeatureText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },

  // Trust
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginTop: SPACING.md,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },

  // Loading
  loadingContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },

  // CTA
  ctaContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaButtonDisabled: {
    opacity: 0.5,
  },
  ctaGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.bgDarkest,
  },
  ctaTextDisabled: {
    color: COLORS.textSecondary,
  },
  skipText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: SPACING.sm,
  },
});

export default PaywallScreen;
