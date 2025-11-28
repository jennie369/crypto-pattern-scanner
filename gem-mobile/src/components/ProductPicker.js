/**
 * Gemral - Product Picker Modal
 * Modal để chọn sản phẩm gắn vào bài viết
 * Loads REAL products from Shopify store
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Search,
  ShoppingBag,
  Check,
  Package,
  RefreshCw,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../utils/tokens';
import shopifyService from '../services/shopifyService';

const ProductPicker = ({ visible, onClose, onSelect, currentProduct }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(currentProduct);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible) {
      loadProducts();
    }
  }, [visible]);

  useEffect(() => {
    setSelectedProduct(currentProduct);
  }, [currentProduct]);

  /**
   * Load real products from Shopify via shopifyService
   */
  const loadProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[ProductPicker] Loading products from Shopify...');

      // Use searchProducts if there's a query, otherwise get all products
      let shopifyProducts;

      if (searchQuery && searchQuery.trim().length > 0) {
        shopifyProducts = await shopifyService.searchProducts(searchQuery.trim());
      } else {
        shopifyProducts = await shopifyService.getProducts({ limit: 100 });
      }

      console.log('[ProductPicker] Loaded products:', shopifyProducts?.length || 0);

      if (shopifyProducts && shopifyProducts.length > 0) {
        // Transform Shopify products to our format
        const transformedProducts = shopifyProducts.map(p => ({
          id: p.id,
          shopifyId: p.id,
          title: p.title,
          price: formatPrice(p.price),
          priceRaw: p.price,
          image: p.image || p.images?.[0] || null,
          images: p.images || [],
          type: determineProductType(p),
          handle: p.handle,
          variantId: p.variantId || p.variants?.[0]?.id,
          description: p.description,
          tags: p.tags,
        }));

        setProducts(transformedProducts);
      } else {
        setProducts([]);
        setError('Không có sản phẩm nào trong cửa hàng');
      }
    } catch (err) {
      console.error('[ProductPicker] Load error:', err);
      setError('Không thể tải sản phẩm. Vui lòng thử lại.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Determine product type from Shopify data
   */
  const determineProductType = (product) => {
    const tags = Array.isArray(product.tags)
      ? product.tags.join(',').toLowerCase()
      : (product.tags || '').toLowerCase();

    const title = (product.title || '').toLowerCase();
    const productType = (product.productType || '').toLowerCase();

    // Check for digital products
    if (
      tags.includes('digital') ||
      tags.includes('course') ||
      tags.includes('khóa học') ||
      tags.includes('ebook') ||
      tags.includes('subscription') ||
      productType.includes('digital') ||
      productType.includes('course')
    ) {
      return 'digital';
    }

    // Check for gems products
    if (tags.includes('gems') || tags.includes('virtual-currency')) {
      return 'gems';
    }

    // Default to physical
    return 'physical';
  };

  /**
   * Format price to Vietnamese format
   */
  const formatPrice = (price) => {
    if (!price) return '0đ';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN').format(numPrice) + 'đ';
  };

  /**
   * Handle search with debounce
   */
  const handleSearch = async (query) => {
    setSearchQuery(query);

    // If search is cleared, reload all products
    if (!query || query.trim().length === 0) {
      loadProducts();
      return;
    }

    // Only search if query is at least 2 characters
    if (query.trim().length >= 2) {
      setLoading(true);
      try {
        const results = await shopifyService.searchProducts(query.trim());
        if (results && results.length > 0) {
          const transformedProducts = results.map(p => ({
            id: p.id,
            shopifyId: p.id,
            title: p.title,
            price: formatPrice(p.price),
            priceRaw: p.price,
            image: p.image || p.images?.[0] || null,
            images: p.images || [],
            type: determineProductType(p),
            handle: p.handle,
            variantId: p.variantId || p.variants?.[0]?.id,
          }));
          setProducts(transformedProducts);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('[ProductPicker] Search error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Local filter for quick filtering (products already loaded)
  const filteredProducts = products;

  const handleSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleConfirm = () => {
    if (selectedProduct) {
      onSelect(selectedProduct);
    }
    onClose();
  };

  const renderProduct = ({ item }) => {
    const isSelected = selectedProduct?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.productCard, isSelected && styles.productCardSelected]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.productImageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.productImage} />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <Package size={24} color={COLORS.textMuted} />
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.productPrice}>{item.price}</Text>
          <View style={[
            styles.productTypeBadge,
            item.type === 'digital' ? styles.digitalBadge :
            item.type === 'gems' ? styles.gemsBadge : styles.physicalBadge
          ]}>
            <Text style={styles.productTypeText}>
              {item.type === 'digital' ? 'Digital' :
               item.type === 'gems' ? 'Gems' : 'Physical'}
            </Text>
          </View>
        </View>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Check size={20} color={COLORS.gold} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chọn Sản Phẩm</Text>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[styles.confirmButton, !selectedProduct && styles.confirmButtonDisabled]}
              disabled={!selectedProduct}
            >
              <Text style={[
                styles.confirmText,
                !selectedProduct && styles.confirmTextDisabled
              ]}>
                Xong
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm sản phẩm..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={handleSearch}
                returnKeyType="search"
                onSubmitEditing={() => handleSearch(searchQuery)}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')}>
                  <X size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            {/* Refresh button */}
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadProducts}
              disabled={loading}
            >
              <RefreshCw
                size={20}
                color={loading ? COLORS.textMuted : COLORS.gold}
              />
            </TouchableOpacity>
          </View>

          {/* Products List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.gold} />
              <Text style={styles.loadingText}>Đang tải sản phẩm từ Shopify...</Text>
            </View>
          ) : error ? (
            <View style={styles.emptyContainer}>
              <ShoppingBag size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>Không thể tải sản phẩm</Text>
              <Text style={styles.emptyText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
                <RefreshCw size={16} color={COLORS.gold} />
                <Text style={styles.retryText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ShoppingBag size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có sản phẩm trong cửa hàng'}
              </Text>
              {searchQuery && (
                <TouchableOpacity style={styles.retryButton} onPress={() => handleSearch('')}>
                  <Text style={styles.retryText}>Xem tất cả sản phẩm</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Selected Product Summary */}
          {selectedProduct && (
            <View style={styles.selectedSummary}>
              <ShoppingBag size={18} color={COLORS.gold} />
              <Text style={styles.selectedText} numberOfLines={1}>
                {selectedProduct.title}
              </Text>
              <Text style={styles.selectedPrice}>{selectedProduct.price}</Text>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  confirmButton: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.textMuted,
    opacity: 0.5,
  },
  confirmText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#112250',
  },
  confirmTextDisabled: {
    color: COLORS.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  refreshButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  retryText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  productCardSelected: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  productImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: SPACING.md,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    marginBottom: 4,
  },
  productTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  digitalBadge: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
  },
  physicalBadge: {
    backgroundColor: 'rgba(58, 247, 166, 0.2)',
  },
  gemsBadge: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  productTypeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },
  selectedIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.2)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  selectedText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
  },
  selectedPrice: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
});

export default ProductPicker;
