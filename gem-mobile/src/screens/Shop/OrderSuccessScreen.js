/**
 * Gemral - Order Success Screen
 * Displayed after successful checkout with multiple product sections & infinite scroll
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  CheckCircle,
  Package,
  ShoppingBag,
  Sparkles,
  Star,
  Gem,
  Gift,
  Flame,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import { shopifyService } from '../../services/shopifyService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PRODUCTS_PER_SECTION = 10;
const INFINITE_SCROLL_BATCH = 10;

const OrderSuccessScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId, orderNumber, orderUrl } = route.params || {};

  // ========================================
  // PRODUCT SECTIONS STATE
  // ========================================
  const [sections, setSections] = useState({
    bestsellers: [],
    specialProducts: [],
    premiumCrystals: [],
    comboSets: [],
    newProducts: [],
  });

  const [loadingStates, setLoadingStates] = useState({
    initial: true,
    bestsellers: false,
    specialProducts: false,
    premiumCrystals: false,
    comboSets: false,
    newProducts: false,
    infiniteScroll: false,
  });

  // Infinite scroll state
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [infiniteScrollPage, setInfiniteScrollPage] = useState(1);
  const scrollViewRef = useRef(null);

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    console.log('[OrderSuccess] Screen mounted with:', {
      orderId,
      orderNumber,
      orderUrl,
    });

    // Animate success icon
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Slide up buttons
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      delay: 400,
      useNativeDriver: true,
    }).start();

    // Load all product sections
    loadAllSections();
  }, []);

  // ========================================
  // LOAD ALL SECTIONS
  // ========================================
  const loadAllSections = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, initial: true }));

      console.log('[OrderSuccess] 📦 Loading all product sections...');

      // Fetch all products first (uses cache)
      const allProducts = await shopifyService.getProducts({ limit: 100 });
      console.log('[OrderSuccess] Total products available:', allProducts.length);

      // Load all sections in parallel
      const [bestsellers, hotProducts, specialSets, forYou, similar] = await Promise.all([
        shopifyService.getBestsellers(PRODUCTS_PER_SECTION, allProducts),
        shopifyService.getHotProducts(PRODUCTS_PER_SECTION, allProducts),
        shopifyService.getSpecialSets(PRODUCTS_PER_SECTION, allProducts),
        shopifyService.getForYouProducts(null, PRODUCTS_PER_SECTION, allProducts),
        shopifyService.getSimilarProducts(null, PRODUCTS_PER_SECTION, allProducts),
      ]);

      // Get premium crystals (Thạch Anh)
      const premiumCrystals = await shopifyService.getProductsByTags(
        ['Thạch Anh', 'Crystal', 'Premium'],
        PRODUCTS_PER_SECTION,
        true,
        allProducts
      );

      console.log('[OrderSuccess] ✅ Sections loaded:', {
        bestsellers: bestsellers.length,
        hotProducts: hotProducts.length,
        specialSets: specialSets.length,
        premiumCrystals: premiumCrystals.length,
        forYou: forYou.length,
      });

      setSections({
        bestsellers: bestsellers || [],
        specialProducts: hotProducts || [],
        premiumCrystals: premiumCrystals || [],
        comboSets: specialSets || [],
        newProducts: forYou || [],
      });

    } catch (error) {
      console.error('[OrderSuccess] ❌ Load sections error:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, initial: false }));
    }
  };

  // ========================================
  // INFINITE SCROLL
  // ========================================
  const handleScroll = useCallback((event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 100;
    const scrollPosition = layoutMeasurement.height + contentOffset.y;
    const contentHeight = contentSize.height;

    // Check if scrolled to 80% of content
    const scrollPercentage = scrollPosition / contentHeight;

    if (scrollPercentage >= 0.8 && hasMoreProducts && !loadingStates.infiniteScroll) {
      console.log('[OrderSuccess] 📜 Reached 80% scroll - loading more products...');
      loadMoreProducts();
    }
  }, [hasMoreProducts, loadingStates.infiniteScroll]);

  const loadMoreProducts = async () => {
    if (loadingStates.infiniteScroll || !hasMoreProducts) return;

    try {
      setLoadingStates(prev => ({ ...prev, infiniteScroll: true }));

      console.log('[OrderSuccess] 🔄 Loading more products, page:', infiniteScrollPage + 1);

      // Get more random products for newProducts section
      const allProducts = await shopifyService.getProducts({ limit: 100 });
      const existingIds = new Set(sections.newProducts.map(p => p.id));

      // Filter out existing products and get new batch
      const availableProducts = allProducts.filter(p => !existingIds.has(p.id));

      if (availableProducts.length === 0) {
        console.log('[OrderSuccess] No more products available');
        setHasMoreProducts(false);
        return;
      }

      // Get random products from available
      const shuffled = [...availableProducts].sort(() => Math.random() - 0.5);
      const newBatch = shuffled.slice(0, INFINITE_SCROLL_BATCH);

      if (newBatch.length < INFINITE_SCROLL_BATCH) {
        setHasMoreProducts(false);
      }

      console.log('[OrderSuccess] ✅ Loaded', newBatch.length, 'more products');

      setSections(prev => ({
        ...prev,
        newProducts: [...prev.newProducts, ...newBatch],
      }));

      setInfiniteScrollPage(prev => prev + 1);

    } catch (error) {
      console.error('[OrderSuccess] ❌ Load more error:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, infiniteScroll: false }));
    }
  };

  // ========================================
  // HANDLERS
  // ========================================
  const handleViewOrder = () => {
    console.log('[OrderSuccess] Navigate to Orders');
    navigation.navigate('Orders', {
      highlightOrder: orderId,
    });
  };

  const handleContinueShopping = () => {
    console.log('[OrderSuccess] Navigate to Shop');
    navigation.navigate('ShopMain');
  };

  const handleProductPress = (product) => {
    console.log('[OrderSuccess] Navigate to product:', product.id);
    navigation.navigate('ProductDetail', { product });
  };

  // ========================================
  // HELPERS
  // ========================================
  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getProductBadge = (product) => {
    const tags = Array.isArray(product.tags)
      ? product.tags.map(t => t.toLowerCase())
      : (product.tags || '').toLowerCase().split(',').map(t => t.trim());

    if (tags.some(t => t.includes('bestseller') || t.includes('best seller'))) {
      return { type: 'bestseller', label: 'Bán chạy', icon: Star, color: COLORS.gold };
    }
    if (tags.some(t => t.includes('hot') || t.includes('hot product'))) {
      return { type: 'hot', label: 'Hot', icon: Flame, color: '#FF6B6B' };
    }
    if (tags.some(t => t.includes('new') || t.includes('mới'))) {
      return { type: 'new', label: 'Mới', icon: Sparkles, color: '#00F0FF' };
    }
    return null;
  };

  // ========================================
  // RENDER PRODUCT CARD
  // ========================================
  const renderProductCard = (item, index) => {
    const badge = getProductBadge(item);

    return (
      <TouchableOpacity
        key={`${item.id}-${index}`}
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.8}
      >
        {/* Product Badge */}
        {badge && (
          <View style={[styles.productBadge, { backgroundColor: `${badge.color}20` }]}>
            <badge.icon size={12} color={badge.color} />
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        )}

        <Image
          source={{ uri: item.image || item.images?.[0]?.src }}
          style={styles.productImage}
          resizeMode="cover"
        />

        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.productPriceRow}>
            <Text style={styles.productPrice}>
              {formatPrice(item.variants?.[0]?.price || item.price || 0)}
            </Text>

            {item.compareAtPrice && parseFloat(item.compareAtPrice) > parseFloat(item.price) && (
              <Text style={styles.productOriginalPrice}>
                {formatPrice(item.compareAtPrice)}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ========================================
  // RENDER PRODUCT SECTION
  // ========================================
  const renderSection = (title, icon, products, iconColor = COLORS.gold) => {
    if (!products || products.length === 0) return null;

    const IconComponent = icon;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <IconComponent size={22} color={iconColor} />
          <Text style={[styles.sectionTitle, { color: iconColor }]}>{title}</Text>
          <Text style={styles.sectionCount}>({products.length})</Text>
        </View>

        <View style={styles.productsGrid}>
          {products.map((item, index) => renderProductCard(item, index))}
        </View>
      </View>
    );
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Success Icon with Animation */}
          <Animated.View
            style={[
              styles.successIconContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.successIconCircle}>
              <CheckCircle size={64} color="#3AF7A6" strokeWidth={2.5} />
            </View>
            <View style={styles.glowCircle} />
          </Animated.View>

          {/* Success Message */}
          <Animated.View
            style={[
              styles.messageContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <Text style={styles.successTitle}>Đặt Hàng Thành Công!</Text>

            <Text style={styles.successSubtitle}>
              Cảm ơn bạn đã mua hàng tại YinYang Masters
            </Text>

            {orderNumber && (
              <View style={styles.orderNumberCard}>
                <Text style={styles.orderNumberLabel}>Mã đơn hàng</Text>
                <Text style={styles.orderNumberValue}>#{orderNumber}</Text>
              </View>
            )}

            <Text style={styles.confirmationText}>
              Đơn hàng của bạn đang được xử lý.{'\n'}
              Chúng tôi sẽ gửi email xác nhận trong giây lát.
            </Text>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            style={[
              styles.actionsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleViewOrder}
              activeOpacity={0.8}
            >
              <Package size={20} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.primaryButtonText}>Xem Đơn Hàng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleContinueShopping}
              activeOpacity={0.8}
            >
              <ShoppingBag size={20} color={COLORS.gold} strokeWidth={2.5} />
              <Text style={styles.secondaryButtonText}>Tiếp Tục Mua Sắm</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Product Sections */}
          {loadingStates.initial ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.gold} />
              <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
            </View>
          ) : (
            <>
              {/* Section 1: Best Sellers 🔥 */}
              {renderSection('Best Sellers', Flame, sections.bestsellers, '#FF6B6B')}

              {/* Section 2: Sản Phẩm Đặc Biệt ⭐ */}
              {renderSection('Sản Phẩm Đặc Biệt', Star, sections.specialProducts, COLORS.gold)}

              {/* Section 3: Thạch Anh Cao Cấp 💎 */}
              {renderSection('Thạch Anh Cao Cấp', Gem, sections.premiumCrystals, '#A78BFA')}

              {/* Section 4: Combo & Set 🎁 */}
              {renderSection('Combo & Set', Gift, sections.comboSets, '#34D399')}

              {/* Section 5: Sản Phẩm Mới ✨ (Infinite Scroll) */}
              {renderSection('Sản Phẩm Mới', Sparkles, sections.newProducts, '#00F0FF')}

              {/* Infinite Scroll Loading */}
              {loadingStates.infiniteScroll && (
                <View style={styles.infiniteScrollLoading}>
                  <ActivityIndicator size="small" color={COLORS.gold} />
                  <Text style={styles.loadingMoreText}>Đang tải thêm...</Text>
                </View>
              )}

              {/* End of Products Message */}
              {!hasMoreProducts && sections.newProducts.length > 0 && (
                <View style={styles.endMessage}>
                  <Text style={styles.endMessageText}>Đã hiển thị tất cả sản phẩm</Text>
                </View>
              )}
            </>
          )}

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>
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

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 40,
    paddingHorizontal: SPACING.md,
  },

  // ========================================
  // SUCCESS ICON
  // ========================================
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },

  successIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(58, 247, 166, 0.15)',
    borderWidth: 2.5,
    borderColor: '#3AF7A6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3AF7A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 15,
  },

  glowCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(58, 247, 166, 0.08)',
    zIndex: -1,
  },

  // ========================================
  // MESSAGE
  // ========================================
  messageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },

  successTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },

  successSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },

  orderNumberCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 189, 89, 0.4)',
    paddingVertical: 16,
    paddingHorizontal: 28,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: 'rgba(255, 189, 89, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },

  orderNumberLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  orderNumberValue: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    letterSpacing: -0.5,
  },

  confirmationText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: 20,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
  },

  // ========================================
  // ACTION BUTTONS
  // ========================================
  actionsContainer: {
    gap: 10,
    marginBottom: 32,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },

  primaryButton: {
    backgroundColor: COLORS.burgundy,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 189, 89, 0.6)',
    shadowColor: 'rgba(156, 6, 18, 0.5)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },

  primaryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.gold,
  },

  secondaryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    letterSpacing: 0.3,
  },

  // ========================================
  // PRODUCT SECTIONS
  // ========================================
  section: {
    marginBottom: 28,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },

  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    flex: 1,
  },

  sectionCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // ========================================
  // PRODUCT CARD
  // ========================================
  productCard: {
    width: (SCREEN_WIDTH - SPACING.md * 2 - SPACING.sm) / 2,
    backgroundColor: COLORS.glassBg,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    marginBottom: SPACING.sm,
  },

  productBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    zIndex: 10,
  },

  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.glassBgHeavy,
  },

  productInfo: {
    padding: SPACING.sm,
  },

  productTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 6,
    lineHeight: 18,
  },

  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  productPrice: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.cyan,
  },

  productOriginalPrice: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },

  // ========================================
  // LOADING STATES
  // ========================================
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: SPACING.md,
  },

  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },

  infiniteScrollLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: SPACING.sm,
  },

  loadingMoreText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  endMessage: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  endMessageText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});

export default OrderSuccessScreen;
