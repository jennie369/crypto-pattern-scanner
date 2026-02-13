/**
 * Gemral - Digital Products Screen
 * Standalone full-screen for browsing all digital products
 */

import React, { memo, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Dimensions,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Search,
  X,
  Package,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import { useDigitalProducts } from '../../hooks/useDigitalProducts';
import { digitalProductService } from '../../services/digitalProductService';
import { generateKey, debounce } from '../../utils/digitalProductHelpers';

import DigitalCategoryPills from './components/DigitalCategoryPills';
import DigitalProductCard from './components/DigitalProductCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 3) / 2;

const DigitalProductsScreen = ({ navigation, route }) => {
  const { title = 'Sản Phẩm Số', category: initialCategory, filter } = route?.params || {};

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Products data
  const {
    products,
    loading,
    refreshing,
    error,
    userTier,
    selectedCategory,
    categories,
    refresh,
    changeCategory,
    searchProducts,
    trackView,
    trackClick,
    isEmpty,
    hasError,
  } = useDigitalProducts({
    category: initialCategory || 'all',
    autoFetch: true,
    trackViews: true,
  });

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query) => {
      searchProducts(query);
    }, 300),
    [searchProducts]
  );

  // Handle search input
  const handleSearchChange = useCallback((text) => {
    setSearchQuery(text);
    setIsSearching(true);
    debouncedSearch(text);
  }, [debouncedSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearching(false);
    searchProducts('');
  }, [searchProducts]);

  // Handle product press
  const handleProductPress = useCallback((product) => {
    const fullProduct = digitalProductService.buildFullProduct(product);
    if (!fullProduct) return;

    trackView(product, 'digital_screen');
    trackClick(product, 'view_detail');

    navigation.navigate('ProductDetail', { product: fullProduct });
  }, [navigation, trackView, trackClick]);

  // Handle upgrade press
  const handleUpgradePress = useCallback(({ requiredTier, product }) => {
    trackClick(product, 'upgrade_prompt');

    // Navigate to tier upgrade or show modal
    // For now, navigate to product detail to show upgrade option
    const fullProduct = digitalProductService.buildFullProduct(product);
    if (fullProduct) {
      navigation.navigate('ProductDetail', { product: fullProduct });
    }
  }, [navigation, trackClick]);

  // Handle category change
  const handleCategoryChange = useCallback((categoryId) => {
    setSearchQuery('');
    setIsSearching(false);
    changeCategory(categoryId);
  }, [changeCategory]);

  // Render header
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={18} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={handleSearchChange}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <X size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills */}
      <DigitalCategoryPills
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategoryChange}
        style={styles.categoryPills}
      />
    </View>
  );

  // Render product card
  // Note: isLocked disabled - all products show cart icon for direct purchase
  const renderProductCard = useCallback(({ item }) => (
    <DigitalProductCard
      product={item}
      userTier={userTier}
      isLocked={false}
      onPress={handleProductPress}
      onUpgradePress={handleUpgradePress}
      style={styles.card}
    />
  ), [userTier, handleProductPress, handleUpgradePress]);

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Package size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>Không có sản phẩm</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? `Không tìm thấy kết quả cho "${searchQuery}"`
          : 'Không có sản phẩm trong danh mục này'}
      </Text>
      {searchQuery && (
        <TouchableOpacity style={styles.clearSearchBtn} onPress={clearSearch}>
          <Text style={styles.clearSearchText}>Xóa tìm kiếm</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render error state
  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <AlertCircle size={64} color={COLORS.error} />
      <Text style={styles.emptyTitle}>Có lỗi xảy ra</Text>
      <Text style={styles.emptySubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={refresh}>
        <RefreshCw size={16} color={COLORS.gold} />
        <Text style={styles.retryText}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  // Render footer (loading indicator)
  const renderFooter = () => {
    if (!loading || products.length === 0) return null;
    return (
      <View style={styles.footerLoading}>
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background Gradient */}
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Safe Area */}
      <SafeAreaView style={styles.safeArea}>
        {/* Top Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>{title}</Text>
          <View style={styles.navRight} />
        </View>

        {/* Product List */}
        <FlatList
          data={products}
          renderItem={renderProductCard}
          keyExtractor={generateKey}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={hasError ? renderErrorState : renderEmptyState}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={COLORS.gold}
              colors={[COLORS.gold]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  safeArea: {
    flex: 1,
  },

  // Navigation Bar
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glassBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  navRight: {
    width: 40,
  },

  // Header
  headerContainer: {
    paddingTop: SPACING.md,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
    marginHorizontal: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
  },
  clearButton: {
    padding: SPACING.xs,
  },

  // Category Pills
  categoryPills: {
    marginTop: SPACING.sm,
  },

  // List
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    marginBottom: SPACING.md,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.giant,
    paddingHorizontal: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 22,
  },
  clearSearchBtn: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  clearSearchText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gold,
  },

  // Retry
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gold,
    gap: SPACING.sm,
  },
  retryText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gold,
  },

  // Footer
  footerLoading: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
});

export default memo(DigitalProductsScreen);
