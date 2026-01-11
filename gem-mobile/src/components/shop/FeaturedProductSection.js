/**
 * FeaturedProductSection.js - Featured/Highlighted Product Section
 * Beautiful, eye-catching section to showcase a single featured product
 * Displayed below "Dành Cho Bạn" section in Shop tab
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import {
  Star,
  Sparkles,
  ChevronRight,
  Flame,
  Tag,
  Gift,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';
import shopBannerService from '../../services/shopBannerService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SECTION_PADDING = SPACING.lg;

/**
 * Format price in Vietnamese format
 */
const formatPrice = (price, currency = 'VND') => {
  if (!price) return '';
  const formatted = new Intl.NumberFormat('vi-VN').format(price);
  return currency === 'VND' ? `${formatted}đ` : `${formatted} ${currency}`;
};

/**
 * Calculate discount percentage
 */
const getDiscountPercent = (original, current) => {
  if (!original || !current || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
};

/**
 * Get badge icon based on text
 */
const getBadgeIcon = (badgeText) => {
  const text = badgeText?.toLowerCase() || '';
  if (text.includes('hot') || text.includes('nóng')) return Flame;
  if (text.includes('sale') || text.includes('giảm')) return Tag;
  if (text.includes('new') || text.includes('mới')) return Sparkles;
  if (text.includes('gift') || text.includes('quà')) return Gift;
  return Star;
};

const FeaturedProductSection = ({ style }) => {
  const navigation = useNavigation();
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  // Fetch featured product - only once on mount
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchFeatured = async () => {
      try {
        const result = await shopBannerService.getActiveFeaturedProduct();
        if (result.success && result.data) {
          setFeatured(result.data);
          // Track view
          shopBannerService.recordFeaturedProductView(result.data.id);
        }
      } catch (err) {
        console.error('[FeaturedProductSection] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []); // Empty deps - only run once on mount

  // Handle press
  const handlePress = async () => {
    if (!featured) return;

    // Track click
    shopBannerService.recordFeaturedProductClick(featured.id);

    switch (featured.link_type) {
      case 'product':
        navigation.navigate('ProductDetail', { productId: featured.link_value });
        break;
      case 'collection':
        navigation.navigate('ProductList', {
          collection: featured.link_value,
          title: featured.title || 'Bộ sưu tập',
        });
        break;
      case 'url':
        if (featured.link_value) {
          try {
            await Linking.openURL(featured.link_value);
          } catch (err) {
            console.error('[FeaturedProductSection] Open URL error:', err);
          }
        }
        break;
      case 'screen':
        if (featured.link_value) {
          // Handle deep link navigation
          if (featured.link_value.includes('?')) {
            const [screenName, queryString] = featured.link_value.replace('gem://', '').split('?');
            const params = {};
            queryString.split('&').forEach((param) => {
              const [key, value] = param.split('=');
              params[key] = value;
            });
            navigation.navigate(screenName, params);
          } else {
            navigation.navigate(featured.link_value.replace('gem://', ''));
          }
        }
        break;
      default:
        break;
    }
  };

  // Don't render if loading or no data
  if (loading) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator size="small" color={COLORS.gold} />
      </View>
    );
  }

  if (!featured) {
    return null;
  }

  const discount = getDiscountPercent(featured.original_price, featured.price);
  const BadgeIcon = getBadgeIcon(featured.badge_text);

  return (
    <View style={[styles.container, style]}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.headerLeft}>
          <Sparkles size={20} color={COLORS.gold} />
          <Text style={styles.sectionTitle}>Sản Phẩm Nổi Bật</Text>
        </View>
      </View>

      {/* Featured Card */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={styles.cardWrapper}
      >
        <LinearGradient
          colors={[
            featured.background_gradient_start || '#1a0b2e',
            featured.background_gradient_end || '#2d1b4e',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Background Pattern */}
          <View style={styles.bgPattern}>
            <View style={[styles.bgCircle, styles.bgCircle1]} />
            <View style={[styles.bgCircle, styles.bgCircle2]} />
          </View>

          {/* Badge */}
          {featured.show_badge && featured.badge_text && (
            <View
              style={[
                styles.badge,
                { backgroundColor: featured.badge_color || '#FF4757' },
              ]}
            >
              <BadgeIcon size={12} color="#FFFFFF" />
              <Text style={styles.badgeText}>{featured.badge_text}</Text>
            </View>
          )}

          {/* Content */}
          <View style={styles.cardContent}>
            {/* Left - Info */}
            <View style={styles.infoSection}>
              <Text
                style={[styles.title, { color: featured.text_color || '#FFFFFF' }]}
                numberOfLines={2}
              >
                {featured.title}
              </Text>

              {featured.subtitle && (
                <Text
                  style={[styles.subtitle, { color: featured.accent_color || COLORS.gold }]}
                  numberOfLines={1}
                >
                  {featured.subtitle}
                </Text>
              )}

              {featured.show_description && featured.description && (
                <Text
                  style={[styles.description, { color: `${featured.text_color || '#FFFFFF'}99` }]}
                  numberOfLines={2}
                >
                  {featured.description}
                </Text>
              )}

              {/* Price */}
              {featured.show_price && featured.price && (
                <View style={styles.priceRow}>
                  <Text
                    style={[styles.price, { color: featured.accent_color || COLORS.gold }]}
                  >
                    {formatPrice(featured.price, featured.currency)}
                  </Text>
                  {featured.original_price && featured.original_price > featured.price && (
                    <View style={styles.discountRow}>
                      <Text style={styles.originalPrice}>
                        {formatPrice(featured.original_price, featured.currency)}
                      </Text>
                      {discount > 0 && (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>-{discount}%</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}

              {/* CTA Button */}
              <TouchableOpacity
                style={[
                  styles.ctaButton,
                  { backgroundColor: featured.accent_color || COLORS.gold },
                ]}
                onPress={handlePress}
              >
                <Text style={styles.ctaText}>{featured.cta_text || 'Xem ngay'}</Text>
                <ChevronRight size={16} color="#1a0b2e" />
              </TouchableOpacity>
            </View>

            {/* Right - Image */}
            <View style={styles.imageSection}>
              <View style={styles.imageGlow} />
              <Image
                source={{ uri: featured.image_url }}
                style={styles.productImage}
                resizeMode="cover"
              />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SECTION_PADDING,
    marginBottom: SPACING.xl,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  // Card
  cardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 200,
  },
  // Background Pattern
  bgPattern: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  bgCircle1: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
  },
  bgCircle2: {
    width: 150,
    height: 150,
    bottom: -30,
    left: -30,
    backgroundColor: 'rgba(106, 91, 255, 0.08)',
  },
  // Badge
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    zIndex: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  // Content
  cardContent: {
    flexDirection: 'row',
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  infoSection: {
    flex: 1,
    paddingRight: SPACING.md,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  // Price
  priceRow: {
    marginBottom: 12,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  originalPrice: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#FF4757',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // CTA
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a0b2e',
  },
  // Image
  imageSection: {
    width: 140,
    height: 140,
    position: 'relative',
  },
  imageGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    transform: [{ scale: 1.1 }],
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
});

export default FeaturedProductSection;
