/**
 * Gemral - Product Picker Modal
 * Modal để chọn sản phẩm gắn vào bài viết
 * Loads REAL products from Shopify store
 * Supports multi-select mode
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
  ScrollView,
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
  Minus,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../utils/tokens';
import shopifyService from '../services/shopifyService';

/**
 * ProductPicker Component
 * @param {boolean} visible - Modal visibility
 * @param {function} onClose - Close handler
 * @param {function} onSelect - Selection handler (receives array if multiSelect, single product otherwise)
 * @param {object|array} currentProduct - Current selected product(s)
 * @param {boolean} multiSelect - Enable multi-select mode (default: false for backwards compatibility)
 * @param {number} maxSelect - Maximum products to select in multi-select mode (default: 10)
 */
const ProductPicker = ({
  visible,
  onClose,
  onSelect,
  currentProduct,
  multiSelect = false,
  maxSelect = 10,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]); // All products from Shopify
  const [products, setProducts] = useState([]); // Filtered products to display
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // For single select mode
  const [selectedProduct, setSelectedProduct] = useState(null);
  // For multi-select mode
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    if (visible) {
      loadProducts();
      // Initialize selected state based on currentProduct
      if (multiSelect) {
        const initialProducts = Array.isArray(currentProduct) ? currentProduct : (currentProduct ? [currentProduct] : []);
        setSelectedProducts(initialProducts);
      } else {
        setSelectedProduct(currentProduct || null);
      }
    }
  }, [visible]);

  useEffect(() => {
    if (multiSelect) {
      const initialProducts = Array.isArray(currentProduct) ? currentProduct : (currentProduct ? [currentProduct] : []);
      setSelectedProducts(initialProducts);
    } else {
      setSelectedProduct(currentProduct || null);
    }
  }, [currentProduct, multiSelect]);

  /**
   * Transform Shopify product to our format
   */
  const transformProduct = (p, index) => {
    // Handle image - could be image_url, image, or images array
    let imageUrl = null;
    if (p.image_url) {
      imageUrl = p.image_url;
    } else if (typeof p.image === 'string') {
      imageUrl = p.image;
    } else if (p.image?.src) {
      imageUrl = p.image.src;
    } else if (p.images && p.images.length > 0) {
      imageUrl = typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.src;
    }

    // Ensure unique key - prefer shopify_product_id, fallback to id or index
    const uniqueId = String(p.shopify_product_id || p.id || `product-${index}`);

    return {
      id: uniqueId,
      shopifyId: p.shopify_product_id || p.id,
      title: p.title,
      price: formatPrice(p.price),
      priceRaw: p.price,
      image: imageUrl,
      images: p.images || [],
      type: determineProductType(p),
      handle: p.handle,
      variantId: p.variantId || p.variants?.[0]?.id,
      description: p.description,
      tags: p.tags,
    };
  };

  /**
   * Load real products from Shopify via shopifyService
   */
  const loadProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[ProductPicker] Loading products from Shopify...');

      const shopifyProducts = await shopifyService.getProducts({ limit: 100 });

      console.log('[ProductPicker] Loaded products:', shopifyProducts?.length || 0);

      if (shopifyProducts && shopifyProducts.length > 0) {
        const transformedProducts = shopifyProducts.map(transformProduct);
        setAllProducts(transformedProducts);
        setProducts(transformedProducts);
      } else {
        setAllProducts([]);
        setProducts([]);
        setError('Không có sản phẩm nào trong cửa hàng');
      }
    } catch (err) {
      console.error('[ProductPicker] Load error:', err);
      setError('Không thể tải sản phẩm. Vui lòng thử lại.');
      setAllProducts([]);
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
   * Handle search - filter locally from loaded products
   */
  const handleSearch = (query) => {
    setSearchQuery(query);

    // If search is cleared, show all products
    if (!query || query.trim().length === 0) {
      setProducts(allProducts);
      return;
    }

    // Filter locally from allProducts
    const lowerQuery = query.toLowerCase().trim();
    const filtered = allProducts.filter(p => {
      const titleMatch = p.title?.toLowerCase().includes(lowerQuery);
      const descMatch = p.description?.toLowerCase().includes(lowerQuery);
      const handleMatch = p.handle?.toLowerCase().includes(lowerQuery);
      return titleMatch || descMatch || handleMatch;
    });

    setProducts(filtered);
  };

  /**
   * Handle product selection
   */
  const handleSelect = (product) => {
    if (multiSelect) {
      // Multi-select mode: toggle selection
      const isAlreadySelected = selectedProducts.some(p => p.id === product.id);

      if (isAlreadySelected) {
        // Remove from selection
        setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
      } else {
        // Add to selection (if under max limit)
        if (selectedProducts.length < maxSelect) {
          setSelectedProducts(prev => [...prev, product]);
        }
      }
    } else {
      // Single select mode
      setSelectedProduct(product);
    }
  };

  /**
   * Remove a product from multi-select
   */
  const handleRemoveProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  /**
   * Handle confirm button
   */
  const handleConfirm = () => {
    if (multiSelect) {
      onSelect(selectedProducts);
    } else if (selectedProduct) {
      onSelect(selectedProduct);
    }
    onClose();
  };

  /**
   * Check if product is selected
   */
  const isProductSelected = (productId) => {
    if (multiSelect) {
      return selectedProducts.some(p => p.id === productId);
    }
    return selectedProduct?.id === productId;
  };

  /**
   * Get selection count for button text
   */
  const getSelectionCount = () => {
    if (multiSelect) {
      return selectedProducts.length;
    }
    return selectedProduct ? 1 : 0;
  };

  /**
   * Check if can confirm
   */
  const canConfirm = () => {
    if (multiSelect) {
      return selectedProducts.length > 0;
    }
    return !!selectedProduct;
  };

  // Filtered products to display
  const filteredProducts = products;

  const renderProduct = ({ item }) => {
    const isSelected = isProductSelected(item.id);
    const selectionIndex = multiSelect
      ? selectedProducts.findIndex(p => p.id === item.id) + 1
      : null;

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
            {multiSelect ? (
              <Text style={styles.selectionNumber}>{selectionIndex}</Text>
            ) : (
              <Check size={20} color={COLORS.gold} />
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  /**
   * Render selected products bar for multi-select mode
   */
  const renderSelectedBar = () => {
    if (!multiSelect || selectedProducts.length === 0) return null;

    return (
      <View style={styles.selectedBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectedBarContent}
        >
          {selectedProducts.map((product, index) => (
            <View key={product.id} style={styles.selectedChip}>
              {product.image ? (
                <Image source={{ uri: product.image }} style={styles.selectedChipImage} />
              ) : (
                <View style={styles.selectedChipImagePlaceholder}>
                  <Package size={12} color={COLORS.textMuted} />
                </View>
              )}
              <Text style={styles.selectedChipText} numberOfLines={1}>
                {product.title}
              </Text>
              <TouchableOpacity
                onPress={() => handleRemoveProduct(product.id)}
                style={styles.selectedChipRemove}
              >
                <X size={14} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        <Text style={styles.selectedCount}>
          {selectedProducts.length}/{maxSelect}
        </Text>
      </View>
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
            <Text style={styles.headerTitle}>
              {multiSelect ? 'Chọn Sản Phẩm' : 'Chọn Sản Phẩm'}
            </Text>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[styles.confirmButton, !canConfirm() && styles.confirmButtonDisabled]}
              disabled={!canConfirm()}
            >
              <Text style={[
                styles.confirmText,
                !canConfirm() && styles.confirmTextDisabled
              ]}>
                {multiSelect && getSelectionCount() > 0
                  ? `Xong (${getSelectionCount()})`
                  : 'Xong'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Selected products bar for multi-select */}
          {renderSelectedBar()}

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

          {/* Multi-select hint */}
          {multiSelect && (
            <View style={styles.hintContainer}>
              <Text style={styles.hintText}>
                Chọn tối đa {maxSelect} sản phẩm. Nhấn vào sản phẩm để chọn/bỏ chọn.
              </Text>
            </View>
          )}

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

          {/* Selected Product Summary (single select mode only) */}
          {!multiSelect && selectedProduct && (
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
  // Selected bar for multi-select
  selectedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
    paddingVertical: SPACING.sm,
    paddingRight: SPACING.md,
  },
  selectedBarContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 20,
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gold,
    maxWidth: 150,
  },
  selectedChipImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  selectedChipImagePlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedChipText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  selectedChipRemove: {
    marginLeft: SPACING.xs,
    padding: 2,
  },
  selectedCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginLeft: SPACING.sm,
  },
  // Hint
  hintContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
  },
  hintText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
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
  selectionNumber: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
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
