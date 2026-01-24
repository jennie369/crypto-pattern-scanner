/**
 * ProductRecommendations Component
 * Shows Course, Scanner, and Affiliate recommendations based on context
 * FETCHES FROM SHOPIFY - not hardcoded!
 * Used in I Ching, Tarot, and GemMaster screens
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import {
  GraduationCap,
  TrendingUp,
  Users,
  ChevronRight,
  Star,
} from 'lucide-react-native';

import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import { shopifyService } from '../../services/shopifyService';
import { partnershipService } from '../../services/partnershipService';
import { useAuth } from '../../contexts/AuthContext';

// Keywords to detect what to recommend
const KEYWORDS = {
  // Mindset/Spiritual courses
  course: [
    'khóa học', 'course', 'học', 'tần số', 'năng lượng', 'hawkins', 'chữa lành', 'manifest', 'tâm thức', 'spiritual',
    // Khóa 7 Ngày Khai Mở Tần Số Gốc
    '7 ngày', 'khai mở', 'tần số gốc', 'frequency', '299k', '299.000',
    // Khóa Kích Hoạt Tần Số Tình Yêu
    'tình yêu', 'kích hoạt', '42 ngày', 'love', 'boss lady', '399k', '399.000',
    // Khóa Tái Tạo Tư Duy Triệu Phú
    'triệu phú', 'tư duy', 'millionaire', 'mindset', '49 ngày', '499k', '499.000',
    // General course terms
    'giáo trình', 'bài học', 'lesson', 'module', 'curriculum',
  ],
  // Trading courses
  trading: [
    'trading', 'crypto', 'bitcoin', 'btc', 'eth', 'coin', 'đầu tư', 'giao dịch', 'scanner', 'pattern',
    // Trading course tiers
    'tier 1', 'tier 2', 'tier 3', 'tier1', 'tier2', 'tier3', 'starter',
    '11 triệu', '21 triệu', '68 triệu', '11m', '21m', '68m',
    // Pattern names
    'harmonic', 'elliott', 'wyckoff', 'smc', 'smart money', 'liquidity', 'order block',
    'volume profile', 'market structure', 'fibonacci', 'divergence',
    // Course features
    'ai prediction', 'whale tracker', 'backtest', 'formulas', 'công thức',
  ],
  affiliate: ['kiếm thêm', 'thu nhập thụ động', 'cộng tác', 'affiliate', 'ctv', 'hoa hồng', 'partner', 'giới thiệu', 'referral'],
};

// Affiliate info (not in Shopify)
const AFFILIATE_INFO = {
  title: 'Chương trình Cộng tác viên',
  subtitle: 'Kiếm thu nhập thụ động',
  color: '#2ECC71',
  benefits: [
    'Hoa hồng đến 30%',
    'Không cần vốn',
    'Hỗ trợ Marketing Kit',
  ],
  tiers: [
    { name: 'Affiliate', commission: '3%' },
    { name: 'Bronze', commission: '10%' },
    { name: 'Silver', commission: '20%' },
    { name: 'Gold', commission: '30%' },
  ],
};

// Format price helper
const formatPrice = (price) => {
  if (!price) return '';
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  return num.toLocaleString('vi-VN') + 'đ';
};

// Detect recommendations based on context
export const detectRecommendations = (context) => {
  if (!context) return { showCourses: true, showScanner: false, showAffiliate: true };

  const lowerContext = context.toLowerCase();
  let showCourses = false;
  let showScanner = false;
  let showAffiliate = false;

  // Check course keywords
  if (KEYWORDS.course.some(kw => lowerContext.includes(kw))) {
    showCourses = true;
  }

  // Check trading keywords
  if (KEYWORDS.trading.some(kw => lowerContext.includes(kw))) {
    showScanner = true;
    showCourses = true;
  }

  // Check affiliate keywords
  if (KEYWORDS.affiliate.some(kw => lowerContext.includes(kw))) {
    showAffiliate = true;
  }

  // Default: always show courses and affiliate for spiritual context
  if (!showCourses && !showScanner && !showAffiliate) {
    showCourses = true;
    showAffiliate = true;
  }

  return { showCourses, showScanner, showAffiliate };
};

// Course Card Component - displays real Shopify product
const CourseCard = memo(({ product, index, onPress }) => {
  // Get image
  const imageUrl = product?.images?.[0]?.url ||
                   product?.images?.[0]?.src ||
                   product?.featuredImage?.url ||
                   product?.image?.src ||
                   null;

  // Get price
  const price = product?.variants?.[0]?.price?.amount ||
                product?.variants?.[0]?.price ||
                product?.priceRange?.minVariantPrice?.amount ||
                0;

  // Determine color based on tags
  let color = COLORS.gold;
  const tags = (product?.tags || []).join(' ').toLowerCase();
  if (tags.includes('tình yêu') || tags.includes('love')) color = '#E91E63';
  else if (tags.includes('trading') || tags.includes('scanner')) color = '#00D9FF';
  else if (tags.includes('tần số') || tags.includes('frequency')) color = '#9B59B6';
  else if (tags.includes('tiền') || tags.includes('money')) color = '#F1C40F';

  return (
    <Animated.View entering={FadeInRight.delay(index * 100).duration(300)}>
      <TouchableOpacity
        style={[styles.card, { borderColor: `${color}40` }]}
        onPress={() => onPress(product)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          {/* Image or Icon */}
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.courseImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.iconBg, { backgroundColor: `${color}20` }]}>
              <GraduationCap size={20} color={color} />
            </View>
          )}
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle} numberOfLines={2}>{product?.title || 'Khóa học'}</Text>
            <Text style={styles.cardSubtitle} numberOfLines={1}>
              {product?.vendor || 'YinYang Masters'}
            </Text>
          </View>
          <ChevronRight size={20} color={COLORS.textMuted} />
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.price, { color }]}>{formatPrice(price)}</Text>
          {product?.compareAtPrice && (
            <Text style={styles.originalPrice}>{formatPrice(product.compareAtPrice)}</Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// Scanner Card Component - also from Shopify
const ScannerCard = memo(({ product, onPress }) => {
  const imageUrl = product?.images?.[0]?.url ||
                   product?.images?.[0]?.src ||
                   product?.featuredImage?.url ||
                   null;

  const price = product?.variants?.[0]?.price?.amount ||
                product?.variants?.[0]?.price ||
                0;

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: '#00D9FF40' }]}
      onPress={() => onPress(product)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.courseImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.iconBg, { backgroundColor: '#00D9FF20' }]}>
            <TrendingUp size={20} color="#00D9FF" />
          </View>
        )}
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {product?.title || 'GEM Scanner Pro'}
          </Text>
          <Text style={styles.cardSubtitle}>Công cụ phân tích crypto AI</Text>
        </View>
        <ChevronRight size={20} color={COLORS.textMuted} />
      </View>

      <View style={styles.benefitsContainer}>
        <View style={styles.benefitRow}>
          <Star size={12} color="#00D9FF" />
          <Text style={styles.benefitText}>7 patterns tự động</Text>
        </View>
        <View style={styles.benefitRow}>
          <Star size={12} color="#00D9FF" />
          <Text style={styles.benefitText}>Alert Telegram realtime</Text>
        </View>
      </View>

      <View style={styles.priceRow}>
        <Text style={[styles.price, { color: '#00D9FF' }]}>{formatPrice(price)}</Text>
      </View>
    </TouchableOpacity>
  );
});

// Affiliate Card Component - shows different states based on partnership status
const AffiliateCard = memo(({ partnershipStatus, onPressRegister, onPressDetail }) => {
  // If has partnership (approved) - show affiliate code & stats
  if (partnershipStatus?.has_partnership) {
    const isAffiliate = partnershipStatus.partnership_role === 'affiliate';
    const tierNames = ['Beginner', 'Growing', 'Master', 'Grand'];
    const tierName = isAffiliate ? 'Affiliate' : tierNames[(partnershipStatus.ctv_tier || 1) - 1];
    const commissionRate = isAffiliate ? '3%' : `${(partnershipStatus.ctv_tier || 1) * 10}%`;

    return (
      <TouchableOpacity
        style={[styles.card, styles.affiliateCard]}
        onPress={onPressDetail}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconBg, { backgroundColor: '#2ECC7120' }]}>
            <Users size={20} color="#2ECC71" />
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>Mã giới thiệu của bạn</Text>
            <Text style={[styles.cardSubtitle, { color: COLORS.gold, fontWeight: '700', fontSize: 18 }]}>
              {partnershipStatus.affiliate_code}
            </Text>
          </View>
          <View style={[styles.tierBadge, { marginRight: 0 }]}>
            <Text style={styles.tierName}>{tierName}</Text>
            <Text style={styles.tierCommission}>{commissionRate}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{(partnershipStatus.total_commission || 0).toLocaleString('vi-VN')}₫</Text>
            <Text style={styles.statLabel}>Tổng hoa hồng</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{(partnershipStatus.available_balance || 0).toLocaleString('vi-VN')}₫</Text>
            <Text style={styles.statLabel}>Khả dụng</Text>
          </View>
        </View>

        <View style={styles.ctaContainer}>
          <Text style={styles.ctaText}>Xem Chi Tiết</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // If has pending application - show waiting status
  if (partnershipStatus?.has_application && partnershipStatus?.application_status === 'pending') {
    return (
      <View style={[styles.card, styles.affiliateCard, { borderColor: 'rgba(255, 189, 89, 0.4)' }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBg, { backgroundColor: 'rgba(255, 189, 89, 0.2)' }]}>
            <Users size={20} color={COLORS.gold} />
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>Đơn Đăng Ký Partnership</Text>
            <Text style={styles.cardSubtitle}>Đang chờ phê duyệt (1-2 ngày)</Text>
          </View>
        </View>
        <View style={[styles.ctaContainer, { backgroundColor: 'rgba(255, 189, 89, 0.3)' }]}>
          <Text style={[styles.ctaText, { color: COLORS.gold }]}>Chờ Duyệt...</Text>
        </View>
      </View>
    );
  }

  // Default: Show registration CTA - navigate to PartnershipRegistration
  return (
    <TouchableOpacity
      style={[styles.card, styles.affiliateCard]}
      onPress={onPressRegister}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconBg, { backgroundColor: '#2ECC7120' }]}>
          <Users size={20} color="#2ECC71" />
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>{AFFILIATE_INFO.title}</Text>
          <Text style={styles.cardSubtitle}>{AFFILIATE_INFO.subtitle}</Text>
        </View>
        <ChevronRight size={20} color={COLORS.textMuted} />
      </View>

      <View style={styles.tiersContainer}>
        {AFFILIATE_INFO.tiers.map((tier, idx) => (
          <View key={idx} style={styles.tierBadge}>
            <Text style={styles.tierName}>{tier.name}</Text>
            <Text style={styles.tierCommission}>{tier.commission}</Text>
          </View>
        ))}
      </View>

      <View style={styles.ctaContainer}>
        <Text style={styles.ctaText}>Đăng ký ngay - Miễn phí!</Text>
      </View>
    </TouchableOpacity>
  );
});

// Main Component
const ProductRecommendations = ({ context, showAll = false }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [scannerProduct, setScannerProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [partnershipStatus, setPartnershipStatus] = useState(null);

  // Detect what to show based on context
  const { showCourses, showScanner, showAffiliate } = showAll
    ? { showCourses: true, showScanner: true, showAffiliate: true }
    : detectRecommendations(context);

  // Fetch products from Shopify + partnership status
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch courses/subscription products from Shopify
        // Tags: course, subscription, tier, bundle, digital, gói
        if (showCourses) {
          const courseProducts = await shopifyService.getProductsByTags(
            ['course', 'subscription', 'tier', 'bundle', 'gói', 'khóa học', 'digital'],
            4,
            true // fallback to random if no match - ensures we always show something
          );
          console.log('[ProductRec] Fetched courses/subscription:', courseProducts?.length);
          setCourses(courseProducts || []);
        }

        // Fetch scanner/trading product
        if (showScanner) {
          const scannerProducts = await shopifyService.getProductsByTags(
            ['scanner', 'tier', 'trading', 'crypto', 'pattern'],
            1,
            true // fallback to random
          );
          console.log('[ProductRec] Fetched scanner/trading:', scannerProducts?.length);
          if (scannerProducts?.length > 0) {
            setScannerProduct(scannerProducts[0]);
          }
        }

        // Fetch partnership status for logged-in user
        if (user?.id) {
          const statusResult = await partnershipService.getPartnershipStatus(user.id);
          if (statusResult.success) {
            console.log('[ProductRec] Partnership status:', statusResult.data);
            setPartnershipStatus(statusResult.data);
          }
        }
      } catch (error) {
        console.error('[ProductRec] Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showCourses, showScanner, user?.id]);

  // Handle course press - navigate to Shop ProductDetail
  const handleProductPress = useCallback((product) => {
    if (!product) return;

    console.log('[ProductRec] Product pressed:', product?.id, product?.title);

    // Build normalized product for ProductDetailScreen
    const normalizedProduct = {
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description || '',
      descriptionHtml: product.description_html || product.descriptionHtml || product.description || '',
      vendor: product.vendor || '',
      productType: product.productType || '',
      tags: product.tags || [],
      availableForSale: product.availableForSale ?? true,
      image: product.images?.[0]?.url || product.images?.[0]?.src || product.featuredImage?.url,
      images: product.images || [],
      variants: product.variants || [],
      options: product.options || [],
      priceRange: product.priceRange,
    };

    // Navigate directly to ProductDetail screen within current stack
    // This keeps the back button working correctly
    navigation.navigate('ProductDetail', { product: normalizedProduct });
  }, [navigation]);

  // Handle scanner press
  const handleScannerPress = useCallback(() => {
    if (scannerProduct) {
      handleProductPress(scannerProduct);
    } else {
      // Fallback to Scanner screen - use correct tab name 'Trading'
      navigation.navigate('Trading', {
        screen: 'Scanner',
      });
    }
  }, [navigation, scannerProduct, handleProductPress]);

  // Handle affiliate registration - navigate to Account tab > PartnershipRegistration
  const handleAffiliateRegister = useCallback(() => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Account',
        params: {
          screen: 'PartnershipRegistration',
          params: { type: 'affiliate', fromGemMaster: true },
        },
      })
    );
  }, [navigation]);

  // Handle affiliate detail - navigate to AffiliateDetail screen (for approved partners)
  // This one still uses cross-tab because AffiliateDetail has more complex state
  const handleAffiliateDetail = useCallback(() => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Account',
        params: {
          screen: 'AffiliateDetail',
          params: { fromGemMaster: true },
        },
      })
    );
  }, [navigation]);

  // Don't show loading - just render what we have
  // Always show affiliate card at minimum

  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GraduationCap size={18} color={COLORS.gold} />
        <Text style={styles.headerTitle}>Gợi ý cho bạn</Text>
      </View>

      {/* Course Cards from Shopify */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải khóa học...</Text>
        </View>
      )}
      {!loading && courses.map((product, idx) => (
        <CourseCard
          key={product?.id || idx}
          product={product}
          index={idx}
          onPress={handleProductPress}
        />
      ))}

      {/* Scanner Card */}
      {showScanner && scannerProduct && (
        <ScannerCard product={scannerProduct} onPress={handleScannerPress} />
      )}

      {/* Affiliate Card - Always show, with real partnership status */}
      <AffiliateCard
        partnershipStatus={partnershipStatus}
        onPressRegister={handleAffiliateRegister}
        onPressDetail={handleAffiliateDetail}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: 'rgba(15, 22, 41, 0.85)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  affiliateCard: {
    borderColor: 'rgba(46, 204, 113, 0.3)',
    backgroundColor: 'rgba(15, 22, 41, 0.85)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1a1a2e',
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  cardSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  benefitsContainer: {
    marginBottom: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  benefitText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  originalPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  tiersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tierBadge: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tierName: {
    fontSize: 12,
    color: '#2ECC71',
    fontWeight: '600',
  },
  tierCommission: {
    fontSize: 12,
    color: COLORS.gold,
    fontWeight: '700',
  },
  ctaContainer: {
    backgroundColor: '#2ECC71',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF',
  },
  // Stats for approved partners
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'rgba(20, 28, 50, 0.9)',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.15)',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});

export default memo(ProductRecommendations);
