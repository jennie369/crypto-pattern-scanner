/**
 * ProductPickerModal - Modal for selecting products from Shopify
 * Allows admins to pick products to recommend in lessons
 *
 * Features:
 * - Search products by name
 * - Filter by collection, vendor, type
 * - Preview product cards
 * - Select display style (card, banner, inline, grid)
 * - Multi-select for grid layouts
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Search,
  Package,
  ShoppingBag,
  Grid,
  LayoutList,
  CreditCard,
  Type,
  Tag,
  Loader2,
  Check,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Filter,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import productRecommendationService from '../../../services/productRecommendationService';
import './ProductPickerModal.css';

// Display style options
const DISPLAY_STYLES = [
  {
    id: 'card',
    label: 'Card',
    icon: CreditCard,
    description: 'Hiển thị dạng card với hình ảnh và giá',
  },
  {
    id: 'banner',
    label: 'Banner',
    icon: LayoutList,
    description: 'Banner nổi bật full-width',
  },
  {
    id: 'inline',
    label: 'Inline',
    icon: Type,
    description: 'Nhỏ gọn, chèn giữa text',
  },
  {
    id: 'grid',
    label: 'Grid',
    icon: Grid,
    description: 'Lưới sản phẩm (chọn nhiều)',
  },
];

// Tooltip component
const Tooltip = ({ children, content }) => {
  const [show, setShow] = useState(false);
  return (
    <div
      className="tooltip-wrapper"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && <div className="tooltip-content">{content}</div>}
    </div>
  );
};

const ProductPickerModal = ({
  isOpen,
  onClose,
  onSelect,
  lessonId,
  initialStyle = 'card',
}) => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [displayStyle, setDisplayStyle] = useState(initialStyle);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [pageInfo, setPageInfo] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Refs
  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);

  // Load products
  const loadProducts = useCallback(async (query = '', cursor = null) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await productRecommendationService.fetchShopifyProducts({
        query,
        collection: selectedCollection,
        limit: 20,
        cursor,
      });

      if (cursor) {
        setProducts(prev => [...prev, ...result.products]);
      } else {
        setProducts(result.products);
      }
      setPageInfo(result.pageInfo);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Không thể tải sản phẩm. Vui lòng thử lại.');

      // Fallback to mock data for development
      if (import.meta.env.DEV) {
        setProducts(getMockProducts());
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedCollection]);

  // Load collections
  const loadCollections = useCallback(async () => {
    try {
      const result = await productRecommendationService.fetchCollections();
      setCollections(result);
    } catch (err) {
      console.error('Error loading collections:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (isOpen) {
      loadProducts();
      loadCollections();
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, loadProducts, loadCollections]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      loadProducts(searchQuery);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, loadProducts]);

  // Handle product selection
  const handleProductSelect = (product) => {
    if (displayStyle === 'grid') {
      // Multi-select for grid
      setSelectedProducts(prev => {
        const isSelected = prev.find(p => p.id === product.id);
        if (isSelected) {
          return prev.filter(p => p.id !== product.id);
        }
        if (prev.length >= 6) {
          return prev; // Max 6 products in grid
        }
        return [...prev, product];
      });
    } else {
      // Single select for other styles
      setSelectedProducts([product]);
    }
  };

  // Handle insert
  const handleInsert = () => {
    if (selectedProducts.length === 0) return;

    let html = '';
    if (displayStyle === 'grid' && selectedProducts.length > 1) {
      html = productRecommendationService.generateProductGridHtml(
        selectedProducts,
        selectedProducts.length <= 2 ? 2 : 3
      );
    } else {
      html = productRecommendationService.generateRecommendationHtml(
        selectedProducts[0],
        displayStyle
      );
    }

    onSelect({
      products: selectedProducts,
      style: displayStyle,
      html,
    });

    // Reset and close
    setSelectedProducts([]);
    setSearchQuery('');
    onClose();
  };

  // Format price
  const formatPrice = (price, currency = 'VND') => {
    if (!price) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate discount
  const getDiscount = (price, comparePrice) => {
    if (!comparePrice || price >= comparePrice) return 0;
    return Math.round((1 - price / comparePrice) * 100);
  };

  // Load more
  const handleLoadMore = () => {
    if (pageInfo?.hasNextPage && pageInfo?.endCursor) {
      loadProducts(searchQuery, pageInfo.endCursor);
    }
  };

  // Mock products for development
  const getMockProducts = () => [
    {
      id: '1',
      handle: 'vong-da-thach-anh-tim',
      title: 'Vòng Đá Thạch Anh Tím',
      vendor: 'GEM Store',
      productType: 'Jewelry',
      imageUrl: 'https://via.placeholder.com/200x200/6A5BFF/fff?text=Amethyst',
      price: 450000,
      compareAtPrice: 550000,
      currency: 'VND',
      available: true,
      deeplink: 'gem://shop/product/vong-da-thach-anh-tim',
    },
    {
      id: '2',
      handle: 'vong-tay-obsidian',
      title: 'Vòng Tay Obsidian Đen',
      vendor: 'GEM Store',
      productType: 'Jewelry',
      imageUrl: 'https://via.placeholder.com/200x200/1a1a2e/fff?text=Obsidian',
      price: 350000,
      currency: 'VND',
      available: true,
      deeplink: 'gem://shop/product/vong-tay-obsidian',
    },
    {
      id: '3',
      handle: 'da-citrine-tu-nhien',
      title: 'Đá Citrine Tự Nhiên',
      vendor: 'GEM Store',
      productType: 'Crystals',
      imageUrl: 'https://via.placeholder.com/200x200/FFBD59/000?text=Citrine',
      price: 280000,
      compareAtPrice: 320000,
      currency: 'VND',
      available: true,
      deeplink: 'gem://shop/product/da-citrine-tu-nhien',
    },
    {
      id: '4',
      handle: 'vong-rose-quartz',
      title: 'Vòng Rose Quartz',
      vendor: 'GEM Store',
      productType: 'Jewelry',
      imageUrl: 'https://via.placeholder.com/200x200/FFB6C1/fff?text=Rose',
      price: 420000,
      currency: 'VND',
      available: true,
      deeplink: 'gem://shop/product/vong-rose-quartz',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="product-picker-overlay" onClick={onClose}>
      <div className="product-picker-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="product-picker-header">
          <div className="header-title">
            <ShoppingBag size={20} />
            <span>Chọn Sản Phẩm Khuyên Dùng</span>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="product-picker-body">
          {/* Left Panel - Products List */}
          <div className="products-panel">
            {/* Search & Filters */}
            <div className="search-section">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button
                    className="clear-search"
                    onClick={() => setSearchQuery('')}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <Tooltip content="Lọc theo danh mục">
                <button
                  className={`btn-filter ${showFilters ? 'active' : ''}`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={18} />
                </button>
              </Tooltip>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="filter-panel">
                <label className="filter-label">Danh mục:</label>
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Tất cả</option>
                  {collections.map(col => (
                    <option key={col.id} value={col.handle}>
                      {col.title} ({col.productCount})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Products Grid */}
            <div className="products-grid">
              {isLoading && products.length === 0 ? (
                <div className="loading-state">
                  <Loader2 size={32} className="spin" />
                  <span>Đang tải sản phẩm...</span>
                </div>
              ) : error && products.length === 0 ? (
                <div className="error-state">
                  <AlertCircle size={32} />
                  <span>{error}</span>
                  <button onClick={() => loadProducts(searchQuery)}>
                    <RefreshCw size={14} /> Thử lại
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="empty-state">
                  <Package size={32} />
                  <span>Không tìm thấy sản phẩm</span>
                </div>
              ) : (
                <>
                  {products.map(product => {
                    const isSelected = selectedProducts.find(p => p.id === product.id);
                    const discount = getDiscount(product.price, product.compareAtPrice);

                    return (
                      <div
                        key={product.id}
                        className={`product-item ${isSelected ? 'selected' : ''} ${!product.available ? 'unavailable' : ''}`}
                        onClick={() => product.available && handleProductSelect(product)}
                      >
                        <div className="product-image">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              onError={(e) => {
                                // Fallback when image fails to load
                                e.target.style.display = 'none';
                                e.target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`no-image ${product.imageUrl ? 'hidden' : ''}`}>
                            <ImageIcon size={24} />
                          </div>
                          {discount > 0 && (
                            <span className="discount-badge">-{discount}%</span>
                          )}
                          {isSelected && (
                            <div className="selected-overlay">
                              <Check size={24} />
                            </div>
                          )}
                          {!product.available && (
                            <div className="unavailable-overlay">Hết hàng</div>
                          )}
                        </div>
                        <div className="product-info">
                          <div className="product-title">{product.title}</div>
                          <div className="product-vendor">{product.vendor}</div>
                          <div className="product-price">
                            <span className="current-price">
                              {formatPrice(product.price, product.currency)}
                            </span>
                            {product.compareAtPrice && (
                              <span className="compare-price">
                                {formatPrice(product.compareAtPrice, product.currency)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Load More */}
                  {pageInfo?.hasNextPage && (
                    <button
                      className="btn-load-more"
                      onClick={handleLoadMore}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <><Loader2 size={14} className="spin" /> Đang tải...</>
                      ) : (
                        <>Tải thêm</>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Panel - Preview & Options */}
          <div className="preview-panel">
            {/* Display Style Selection */}
            <div className="style-section">
              <h4 className="section-title">Kiểu hiển thị</h4>
              <div className="style-options">
                {DISPLAY_STYLES.map(style => (
                  <Tooltip key={style.id} content={style.description}>
                    <button
                      className={`style-option ${displayStyle === style.id ? 'active' : ''}`}
                      onClick={() => {
                        setDisplayStyle(style.id);
                        if (style.id !== 'grid') {
                          setSelectedProducts(prev => prev.slice(0, 1));
                        }
                      }}
                    >
                      <style.icon size={18} />
                      <span>{style.label}</span>
                    </button>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Selected Products */}
            <div className="selected-section">
              <h4 className="section-title">
                Đã chọn ({selectedProducts.length}
                {displayStyle === 'grid' ? '/6' : '/1'})
              </h4>
              {selectedProducts.length === 0 ? (
                <div className="no-selection">
                  <Package size={24} />
                  <span>Chưa chọn sản phẩm nào</span>
                  <small>Click vào sản phẩm để chọn</small>
                </div>
              ) : (
                <div className="selected-list">
                  {selectedProducts.map((product, idx) => (
                    <div key={product.id} className="selected-item">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="no-image-small">🛍️</div>
                      )}
                      <div className="selected-item-info">
                        <span className="selected-item-title">{product.title}</span>
                        <span className="selected-item-price">
                          {formatPrice(product.price, product.currency)}
                        </span>
                      </div>
                      <button
                        className="btn-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preview */}
            {selectedProducts.length > 0 && (
              <div className="preview-section">
                <h4 className="section-title">Xem trước</h4>
                <div
                  className="preview-content"
                  dangerouslySetInnerHTML={{
                    __html: displayStyle === 'grid' && selectedProducts.length > 1
                      ? productRecommendationService.generateProductGridHtml(
                          selectedProducts,
                          selectedProducts.length <= 2 ? 2 : 3
                        )
                      : productRecommendationService.generateRecommendationHtml(
                          selectedProducts[0],
                          displayStyle
                        ),
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="product-picker-footer">
          <div className="footer-info">
            <Tag size={14} />
            <span>
              Deeplink: <code>gem://shop/product/{selectedProducts[0]?.handle || '...'}</code>
            </span>
          </div>
          <div className="footer-actions">
            <button className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button
              className="btn-insert"
              onClick={handleInsert}
              disabled={selectedProducts.length === 0}
            >
              <Check size={16} />
              Chèn vào bài học
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPickerModal;
