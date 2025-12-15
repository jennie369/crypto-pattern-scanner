/**
 * ProductDetailModalEnhanced Component
 * Enhanced product details with gallery, feng shui, reviews, related products
 * Uses design tokens for consistent styling
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingCart,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  Heart,
  Share2,
  Check,
  Gem,
  Moon,
  Sun
} from 'lucide-react';
import './ProductDetailModalEnhanced.css';

// Feng Shui properties based on product tags/type
const FENG_SHUI_DATA = {
  crystals: {
    amethyst: {
      element: 'Thủy',
      energy: 'Tĩnh lặng, thanh lọc',
      chakra: 'Third Eye, Crown',
      zodiac: ['Pisces', 'Aquarius'],
      benefits: ['Tăng trực giác', 'Giảm stress', 'Cải thiện giấc ngủ']
    },
    citrine: {
      element: 'Hỏa',
      energy: 'Thịnh vượng, tài lộc',
      chakra: 'Solar Plexus',
      zodiac: ['Leo', 'Gemini'],
      benefits: ['Thu hút tài lộc', 'Tăng tự tin', 'Năng lượng tích cực']
    },
    rose_quartz: {
      element: 'Thổ',
      energy: 'Tình yêu, hòa hợp',
      chakra: 'Heart',
      zodiac: ['Taurus', 'Libra'],
      benefits: ['Tình yêu vô điều kiện', 'Chữa lành', 'Hòa hợp các mối quan hệ']
    },
    default: {
      element: 'Kim',
      energy: 'Cân bằng',
      chakra: 'All Chakras',
      zodiac: ['All Signs'],
      benefits: ['Cân bằng năng lượng', 'Bảo vệ', 'Thanh lọc']
    }
  }
};

export function ProductDetailModalEnhanced({
  product,
  onClose,
  onAddToCart,
  relatedProducts = []
}) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('description'); // description, fengshui, reviews

  // Initialize selected variant
  useEffect(() => {
    if (product?.variants?.edges?.[0]?.node) {
      setSelectedVariant(product.variants.edges[0].node);
    }
  }, [product]);

  if (!product) return null;

  // Get images array
  const images = product.images?.edges?.map(e => e.node) || [];

  // Get feng shui data based on product type
  const getFengShuiData = () => {
    const tags = product.tags?.join(' ').toLowerCase() || '';
    const title = product.title?.toLowerCase() || '';

    if (tags.includes('amethyst') || title.includes('amethyst')) {
      return FENG_SHUI_DATA.crystals.amethyst;
    }
    if (tags.includes('citrine') || title.includes('citrine')) {
      return FENG_SHUI_DATA.crystals.citrine;
    }
    if (tags.includes('rose quartz') || title.includes('rose')) {
      return FENG_SHUI_DATA.crystals.rose_quartz;
    }
    return FENG_SHUI_DATA.crystals.default;
  };

  const fengShuiInfo = getFengShuiData();

  // Navigate images
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Share product
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.title,
        text: `Xem sản phẩm ${product.title} tại GEM Shop`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Đã copy link sản phẩm!');
    }
  };

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="product-modal-content">
          {/* Left: Image Gallery */}
          <div className="product-gallery">
            {/* Main Image */}
            <div className="gallery-main">
              {images.length > 0 && (
                <img
                  src={images[currentImageIndex]?.url}
                  alt={images[currentImageIndex]?.altText || product.title}
                  className="gallery-main-image"
                />
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button className="gallery-nav prev" onClick={prevImage}>
                    <ChevronLeft size={24} />
                  </button>
                  <button className="gallery-nav next" onClick={nextImage}>
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Action Buttons */}
              <div className="gallery-actions">
                <button
                  className={`action-btn ${isFavorite ? 'active' : ''}`}
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart size={20} fill={isFavorite ? '#FF4757' : 'none'} />
                </button>
                <button className="action-btn" onClick={handleShare}>
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="gallery-thumbnails">
                {images.map((img, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${currentImageIndex === index ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img src={img.url} alt={`Thumbnail ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="product-details">
            <h1 className="product-title">{product.title}</h1>

            {/* Price */}
            <div className="product-price">
              {selectedVariant && (
                <span className="price-current">
                  {parseFloat(selectedVariant.priceV2?.amount || 0).toLocaleString('vi-VN')}₫
                </span>
              )}
              {selectedVariant?.compareAtPriceV2 && (
                <span className="price-compare">
                  {parseFloat(selectedVariant.compareAtPriceV2.amount).toLocaleString('vi-VN')}₫
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="product-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  fill={star <= 4 ? '#FFBD59' : 'none'}
                  stroke={star <= 4 ? '#FFBD59' : 'var(--text-muted)'}
                />
              ))}
              <span className="rating-count">(24 đánh giá)</span>
            </div>

            {/* Tabs */}
            <div className="detail-tabs">
              <button
                className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Mô tả
              </button>
              <button
                className={`tab-btn ${activeTab === 'fengshui' ? 'active' : ''}`}
                onClick={() => setActiveTab('fengshui')}
              >
                <Sparkles size={14} />
                Phong thủy
              </button>
              <button
                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Đánh giá
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'description' && (
                <div
                  className="product-description"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }}
                />
              )}

              {activeTab === 'fengshui' && (
                <div className="feng-shui-section">
                  <div className="feng-shui-grid">
                    <div className="feng-shui-item">
                      <Gem size={20} />
                      <span className="fs-label">Nguyên tố</span>
                      <span className="fs-value">{fengShuiInfo.element}</span>
                    </div>
                    <div className="feng-shui-item">
                      <Sparkles size={20} />
                      <span className="fs-label">Năng lượng</span>
                      <span className="fs-value">{fengShuiInfo.energy}</span>
                    </div>
                    <div className="feng-shui-item">
                      <Sun size={20} />
                      <span className="fs-label">Chakra</span>
                      <span className="fs-value">{fengShuiInfo.chakra}</span>
                    </div>
                    <div className="feng-shui-item">
                      <Moon size={20} />
                      <span className="fs-label">Cung hoàng đạo</span>
                      <span className="fs-value">{fengShuiInfo.zodiac.join(', ')}</span>
                    </div>
                  </div>
                  <div className="feng-shui-benefits">
                    <h4>Lợi ích</h4>
                    <ul>
                      {fengShuiInfo.benefits.map((benefit, i) => (
                        <li key={i}>
                          <Check size={16} />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="reviews-section">
                  <div className="reviews-summary">
                    <div className="rating-big">4.5</div>
                    <div className="rating-breakdown">
                      <div className="rating-bar">
                        <span>5⭐</span>
                        <div className="bar"><div className="fill" style={{ width: '70%' }} /></div>
                        <span>70%</span>
                      </div>
                      <div className="rating-bar">
                        <span>4⭐</span>
                        <div className="bar"><div className="fill" style={{ width: '20%' }} /></div>
                        <span>20%</span>
                      </div>
                      <div className="rating-bar">
                        <span>3⭐</span>
                        <div className="bar"><div className="fill" style={{ width: '10%' }} /></div>
                        <span>10%</span>
                      </div>
                    </div>
                  </div>
                  <p className="reviews-placeholder">Đánh giá sẽ được tích hợp từ Judge.me</p>
                </div>
              )}
            </div>

            {/* Variant Selection */}
            {product.variants?.edges?.length > 1 && (
              <div className="variant-selector">
                <label className="selector-label">Chọn phiên bản</label>
                <div className="variant-options">
                  {product.variants.edges.map((edge) => (
                    <button
                      key={edge.node.id}
                      className={`variant-btn ${selectedVariant?.id === edge.node.id ? 'active' : ''}`}
                      onClick={() => setSelectedVariant(edge.node)}
                    >
                      {edge.node.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="quantity-selector">
              <label className="selector-label">Số lượng</label>
              <div className="quantity-controls">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus size={16} />
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              className="add-to-cart-btn"
              onClick={() => {
                onAddToCart(product, selectedVariant?.id, quantity);
                onClose();
              }}
            >
              <ShoppingCart size={20} />
              <span>Thêm vào giỏ hàng</span>
            </button>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h3 className="related-title">Sản phẩm liên quan</h3>
            <div className="related-grid">
              {relatedProducts.slice(0, 4).map((item) => (
                <div key={item.id} className="related-card">
                  <img
                    src={item.images?.edges?.[0]?.node?.url}
                    alt={item.title}
                  />
                  <span className="related-name">{item.title}</span>
                  <span className="related-price">
                    {parseFloat(item.variants?.edges?.[0]?.node?.priceV2?.amount || 0).toLocaleString('vi-VN')}₫
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetailModalEnhanced;
