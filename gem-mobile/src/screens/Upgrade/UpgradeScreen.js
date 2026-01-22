// ============================================================
// UPGRADE SCREEN - Restructured with Product Category Tabs
// Purpose: Full screen hiển thị tất cả sản phẩm theo category
// Categories: Bundle Courses | Scanner | Chatbot | Mindset Courses
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
  BookOpen,
  BarChart3,
  MessageCircle,
  Heart,
  Package,
  ExternalLink,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import {
  COURSE_BUNDLES,
  SCANNER_PRODUCTS,
  CHATBOT_PRODUCTS,
  MINDSET_COURSES,
  formatPrice,
} from '../../constants/productConfig';
import { useAuth } from '../../contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================
// TAB CONFIGURATION
// ============================================================
const TABS = [
  {
    id: 'bundles',
    label: 'Khóa Trading',
    icon: Package,
    description: 'Gói khóa học kết hợp Quét nến + Master Sư Phụ AI',
  },
  {
    id: 'scanner',
    label: 'Quét Nến',
    icon: BarChart3,
    description: 'Công cụ quét mẫu hình tự động 24/7',
  },
  {
    id: 'chatbot',
    label: 'Sư Phụ AI',
    icon: MessageCircle,
    description: 'Master Sư Phụ AI GEM - Cố vấn giao dịch 24/7',
  },
  {
    id: 'mindset',
    label: 'Tư Duy',
    icon: Heart,
    description: 'Khóa học chuyển hóa nội tâm - Học thuyết Jennie Uyên Chu',
  },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
const UpgradeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { profile } = useAuth();

  // Get initial tab from route params or default to 'bundles'
  const initialTab = route.params?.category || route.params?.tierType || 'bundles';
  const [activeTab, setActiveTab] = useState(
    initialTab === 'scanner' ? 'scanner' :
    initialTab === 'chatbot' ? 'chatbot' :
    initialTab === 'mindset' ? 'mindset' : 'bundles'
  );

  const [refreshing, setRefreshing] = useState(false);
  const [checkingOut, setCheckingOut] = useState(null);

  // Get current user tiers
  const userCourseTier = profile?.subscription_tier || profile?.course_tier || 'FREE';
  const userScannerTier = profile?.scanner_tier || 'FREE';
  const userChatbotTier = profile?.chatbot_tier || 'FREE';

  // ============================================================
  // DATA PREPARATION
  // ============================================================

  // Convert product objects to arrays with additional display info
  const bundleProducts = Object.entries(COURSE_BUNDLES).map(([key, product]) => ({
    ...product,
    key,
    type: 'bundle',
    isOwned: isTierOwned(key, userCourseTier),
  }));

  const scannerProducts = Object.entries(SCANNER_PRODUCTS).map(([key, product]) => ({
    ...product,
    key,
    type: 'scanner',
    isOwned: isTierOwned(key, userScannerTier),
  }));

  const chatbotProducts = Object.entries(CHATBOT_PRODUCTS).map(([key, product]) => ({
    ...product,
    key,
    type: 'chatbot',
    isOwned: isTierOwned(key, userChatbotTier),
  }));

  const mindsetProducts = Object.entries(MINDSET_COURSES).map(([key, product]) => ({
    ...product,
    key,
    type: 'mindset',
    isOwned: false, // Mindset courses are one-time purchase
  }));

  // Get products for current tab
  const getProductsForTab = () => {
    switch (activeTab) {
      case 'scanner': return scannerProducts;
      case 'chatbot': return chatbotProducts;
      case 'mindset': return mindsetProducts;
      default: return bundleProducts;
    }
  };

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  function isTierOwned(tierKey, userTier) {
    const tierHierarchy = {
      'FREE': 0,
      'STARTER': 1,
      'TIER1': 2, 'PRO': 2,
      'TIER2': 3, 'PREMIUM': 3,
      'TIER3': 4, 'VIP': 4,
    };

    const userLevel = tierHierarchy[userTier?.toUpperCase()] || 0;
    const productLevel = tierHierarchy[tierKey] || 0;

    return userLevel >= productLevel;
  }

  const getTierIcon = (product) => {
    if (product.tier === 'VIP' || product.tier === 'TIER3') return Crown;
    if (product.tier === 'PREMIUM' || product.tier === 'TIER2') return Star;
    if (product.tier === 'PRO' || product.tier === 'TIER1') return Zap;
    return Sparkles;
  };

  const getTierColor = (product) => {
    if (product.tier === 'VIP' || product.tier === 'TIER3') return '#FFD700';
    if (product.tier === 'PREMIUM' || product.tier === 'TIER2') return '#6A5BFF';
    if (product.tier === 'PRO' || product.tier === 'TIER1') return '#FFB800';
    return COLORS.gold;
  };

  // ============================================================
  // CHECKOUT HANDLER
  // ============================================================

  const handleCheckout = async (product) => {
    try {
      setCheckingOut(product.variantId);

      // Navigate to Shop CheckoutWebView with cart URL
      // Pass returnTab to ensure proper navigation back to Assets tab
      navigation.navigate('Shop', {
        screen: 'CheckoutWebView',
        params: {
          checkoutUrl: product.cartUrl,
          title: product.name,
          productName: product.name,
          variantId: product.variantId,
          returnScreen: 'UpgradeScreen',
          returnTab: 'Account', // Return to Assets tab
        },
      });
    } catch (err) {
      console.error('[UpgradeScreen] Checkout error:', err);
    } finally {
      setCheckingOut(null);
    }
  };

  const handleLearnMore = (product) => {
    // Navigate to landing page in WebView
    const landingUrl = product.landingPage || 'https://gemral.com';

    navigation.navigate('Shop', {
      screen: 'CheckoutWebView',
      params: {
        checkoutUrl: landingUrl,
        title: 'Tìm hiểu thêm',
        productName: product.name,
        returnScreen: 'UpgradeScreen',
        returnTab: 'Account', // Return to Assets tab
      },
    });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBarContent}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <TabIcon
                size={18}
                color={isActive ? COLORS.bgDarkest : COLORS.textSecondary}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderProductCard = (product, index) => {
    const TierIcon = getTierIcon(product);
    const tierColor = getTierColor(product);
    const isLoading = checkingOut === product.variantId;
    const isPopular = product.tier === 'PREMIUM' || product.tier === 'TIER2';

    return (
      <View
        key={product.variantId || product.key}
        style={[
          styles.productCard,
          isPopular && styles.productCardPopular,
          product.isOwned && styles.productCardOwned,
        ]}
      >
        {/* Badge */}
        {isPopular && !product.isOwned && (
          <View style={[styles.badgeContainer, { backgroundColor: tierColor }]}>
            <Text style={styles.badgeText}>PHỔ BIẾN NHẤT</Text>
          </View>
        )}
        {product.isOwned && (
          <View style={[styles.badgeContainer, { backgroundColor: COLORS.success }]}>
            <Text style={styles.badgeText}>ĐÃ SỞ HỮU</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.productHeader}>
          <View style={[styles.productIconContainer, { backgroundColor: `${tierColor}20` }]}>
            <TierIcon size={24} color={tierColor} />
          </View>
          <View style={styles.productInfo}>
            <Text style={[styles.productName, { color: tierColor }]}>
              {product.name}
            </Text>
            <Text style={styles.productDescription} numberOfLines={2}>
              {product.description}
            </Text>
          </View>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{product.priceFormatted || formatPrice(product.price)}</Text>
          {product.period && (
            <Text style={styles.pricePeriod}>/{product.period}</Text>
          )}
          {!product.period && product.type === 'bundle' && (
            <Text style={styles.pricePeriod}>/trọn đời</Text>
          )}
        </View>

        {/* Features/Includes */}
        {product.includes && product.includes.length > 0 && (
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Bao gồm:</Text>
            {product.includes.map((item, idx) => (
              <View key={idx} style={styles.featureRow}>
                <Check size={14} color={COLORS.success} />
                <Text style={styles.featureText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {product.features && product.features.length > 0 && (
          <View style={styles.featuresContainer}>
            {product.features.map((feature, idx) => (
              <View key={idx} style={styles.featureRow}>
                <Check size={14} color={COLORS.success} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Button Row */}
        <View style={styles.buttonRow}>
          {/* Tìm hiểu thêm Button */}
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() => handleLearnMore(product)}
            activeOpacity={0.7}
          >
            <ExternalLink size={16} color={COLORS.gold} />
            <Text style={styles.learnMoreText}>Tìm hiểu thêm</Text>
          </TouchableOpacity>

          {/* CTA Button */}
          <TouchableOpacity
            style={[
              styles.ctaButton,
              product.isOwned && styles.ctaButtonDisabled,
            ]}
            onPress={() => handleCheckout(product)}
            disabled={product.isOwned || isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={product.isOwned ? ['#444', '#333'] : [tierColor, `${tierColor}CC`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.ctaText}>
                  {product.isOwned ? 'Đã sở hữu' : 'Mua ngay'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTabDescription = () => {
    const currentTab = TABS.find(t => t.id === activeTab);
    return (
      <View style={styles.tabDescription}>
        <Text style={styles.tabDescriptionText}>{currentTab?.description}</Text>
      </View>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Account')}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nâng cấp</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tab Bar */}
        {renderTabBar()}

        {/* Content */}
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
          {/* Tab Description */}
          {renderTabDescription()}

          {/* Products */}
          <View style={styles.productsContainer}>
            {getProductsForTab().map((product, index) => renderProductCard(product, index))}
          </View>

          {/* Trust Section */}
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

// ============================================================
// STYLES
// ============================================================
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

  // Tab Bar
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  tabBarContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: SPACING.xs,
  },
  tabActive: {
    backgroundColor: COLORS.gold,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },
  tabLabelActive: {
    color: COLORS.bgDarkest,
  },

  // Content
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  tabDescription: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  tabDescriptionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Products
  productsContainer: {
    gap: SPACING.lg,
  },
  productCard: {
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
  productCardPopular: {
    borderColor: '#6A5BFF',
  },
  productCardOwned: {
    borderColor: COLORS.success,
    opacity: 0.7,
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
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  productIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  productName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  productDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.md,
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize.hero || 28,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  pricePeriod: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  featuresContainer: {
    marginBottom: SPACING.md,
  },
  featuresTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  featureText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  learnMoreButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.4)',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    gap: SPACING.xs,
  },
  learnMoreText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  ctaButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#fff',
  },

  // Trust Section
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
