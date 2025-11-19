import React, { useState } from 'react';
import { ShoppingCart, Star, Eye } from 'lucide-react';

const ProductCard = ({ product, onAddToCart, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const image = product.images.edges[0]?.node;
  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const defaultVariant = product.variants.edges[0]?.node;
  const isBestseller = product.tags.includes('bestseller');
  const isOutOfStock = !defaultVariant?.availableForSale;

  // Mock rating (can be replaced with real data)
  const rating = 4.8;
  const reviewCount = Math.floor(Math.random() * 50) + 10;

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    return (
      <div className="product-stars">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < fullStars ? 'star-filled' : 'star-empty'}>
            ⭐
          </span>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow Border Effect */}
      <div className="card-glow-border"></div>

      {/* Product Image */}
      <div className="product-image-wrapper">
        {image && (
          <img
            src={image.url}
            alt={image.altText || product.title}
            className="product-image"
          />
        )}

        {/* Overlay on Hover */}
        {isHovered && !isOutOfStock && (
          <div className="product-overlay">
            <button
              className="quick-view-btn"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <Eye size={18} />
              <span>Xem Nhanh</span>
            </button>
          </div>
        )}

        {/* Badges */}
        {isBestseller && !isOutOfStock && (
          <div className="product-badge bestseller-badge">
            <Star size={14} fill="currentColor" />
            <span>Best Seller</span>
          </div>
        )}

        {isOutOfStock && (
          <div className="product-badge out-of-stock-badge">
            Hết Hàng
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>

        {/* Rating */}
        <div className="product-rating">
          {renderStars(rating)}
          <span className="rating-text">
            ({rating}) {reviewCount} đánh giá
          </span>
        </div>

        {/* Price & Add to Cart */}
        <div className="product-footer">
          <div className="product-price">
            {price.toLocaleString('vi-VN')}₫
          </div>

          <button
            className="btn-add-to-cart"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, defaultVariant.id, 1);
            }}
            disabled={isOutOfStock}
          >
            <ShoppingCart size={16} />
            <span>{isOutOfStock ? 'Hết Hàng' : 'Thêm'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
