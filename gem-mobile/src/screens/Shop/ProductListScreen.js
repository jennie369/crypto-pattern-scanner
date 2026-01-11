/**
 * ProductListScreen - Màn hình xem tất cả sản phẩm theo section/tag
 * Sử dụng design tokens từ DESIGN_TOKENS.md
 * Dark theme mặc định
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, GLASS } from '../../utils/tokens';
import { getSectionById } from '../../utils/shopConfig';
import shopifyService from '../../services/shopifyService';
import ProductCard from './components/ProductCard';
import SponsorBannerSection from '../../components/SponsorBannerSection';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / 2;

const ProductListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Params từ navigation
  const { sectionId, title, tag, tags } = route.params || {};

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Lấy section config nếu có sectionId
  const section = sectionId ? getSectionById(sectionId) : null;
  const displayTitle = title || section?.title || 'Sản phẩm';

  // Lấy tags để filter - ưu tiên: params.tags > params.tag > section.tags
  const filterTags = tags || (tag ? [tag] : null) || section?.tags || [];

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      let result;
      if (filterTags && filterTags.length > 0) {
        // Fetch theo tags array (exact match, no fallback)
        console.log('[ProductListScreen] Fetching with tags:', filterTags.slice(0, 5).join(', '), '...');
        result = await shopifyService.getProductsByTags(filterTags, 50, false);
        console.log('[ProductListScreen] Found', result?.length || 0, 'products');
      } else {
        // Fetch tất cả
        result = await shopifyService.getProducts({ limit: 50 });
      }

      setProducts(result || []);
    } catch (error) {
      console.error('[ProductListScreen] Fetch error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filterTags)]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const renderProduct = ({ item, index }) => (
    <View style={styles.gridItem}>
      <ProductCard
        product={item}
        onPress={() => handleProductPress(item)}
        darkMode={true}
        style={styles.productCard}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>{displayTitle}</Text>

      <View style={styles.headerRight}>
        <Text style={styles.productCount}>
          {products.length} sản phẩm
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bag-outline" size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>Không có sản phẩm</Text>
      <Text style={styles.emptyText}>
        Chưa có sản phẩm nào trong danh mục này
      </Text>
    </View>
  );

  // Footer with sponsor banner
  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <SponsorBannerSection
        screenName="Shop"
        navigation={navigation}
        maxBanners={2}
      />
      <View style={styles.footerSpacer} />
    </View>
  );

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {renderHeader()}

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.purple} />
            <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item, index) => item.id?.toString() || item.handle || `product-${index}`}
            renderItem={renderProduct}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={products.length > 0 ? renderFooter : null}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.purple}
                colors={[COLORS.purple]}
              />
            }
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },

  // Header
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg, // 16
    paddingVertical: SPACING.md, // 12
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GLASS.background, // rgba(15, 16, 48, 0.55)
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xxxl, // 18
    fontWeight: TYPOGRAPHY.fontWeight.bold, // 700
    color: COLORS.textPrimary, // #FFFFFF
    marginLeft: SPACING.md, // 12
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  productCount: {
    fontSize: TYPOGRAPHY.fontSize.md, // 12
    color: COLORS.textMuted, // rgba(255, 255, 255, 0.6)
  },

  // List
  listContent: {
    paddingHorizontal: SPACING.lg, // 16
    paddingTop: SPACING.lg, // 16
    paddingBottom: SPACING.lg, // Will have footer for more space
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md, // 12
  },
  gridItem: {
    width: CARD_WIDTH,
  },
  productCard: {
    width: '100%',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md, // 12
    fontSize: TYPOGRAPHY.fontSize.base, // 13
    color: COLORS.textMuted, // rgba(255, 255, 255, 0.6)
  },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.giant, // 40
  },
  emptyTitle: {
    marginTop: SPACING.lg, // 16
    fontSize: TYPOGRAPHY.fontSize.xxxl, // 18
    fontWeight: TYPOGRAPHY.fontWeight.semibold, // 600
    color: COLORS.textPrimary, // #FFFFFF
  },
  emptyText: {
    marginTop: SPACING.sm, // 8
    fontSize: TYPOGRAPHY.fontSize.base, // 13
    color: COLORS.textMuted, // rgba(255, 255, 255, 0.6)
    textAlign: 'center',
  },

  // Footer
  footerContainer: {
    marginTop: SPACING.lg,
    paddingHorizontal: 0,
  },
  footerSpacer: {
    height: 120, // Space for bottom tab bar
  },
});

export default ProductListScreen;
