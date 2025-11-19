import React from 'react';
import { ShoppingCart, ExternalLink, Sparkles } from 'lucide-react';
import { productService } from '../../services/products';
import './ProductCard.css';

export const ProductCard = ({ product, source = 'chat' }) => {
  const handleClick = () => {
    productService.trackProductClick(product.id, { source });
    window.open(product.url, '_blank');
  };

  const handleView = () => {
    productService.trackProductView(product.id, { source });
  };

  React.useEffect(() => {
    handleView();
  }, [product.id]);

  return (
    <div className="product-card" style={{ background: product.gradient }}>
      <div className="product-card-inner">
        {/* Product Image */}
        <div className="product-image-container">
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
            onError={(e) => {
              e.target.src = '/placeholder-product.png';
              e.target.onerror = null;
            }}
          />
          <div className="product-badge">
            <Sparkles size={14} />
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <h4 className="product-name">{product.name}</h4>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <ul className="product-features">
              {product.features.slice(0, 3).map((feature, idx) => (
                <li key={idx} className="product-feature">
                  <span className="feature-bullet">•</span>
                  {feature}
                </li>
              ))}
            </ul>
          )}

          {/* Price & CTA */}
          <div className="product-footer">
            <div className="product-price">
              {productService.formatPrice(product.price, product.currency)}
            </div>
            <button
              className="product-cta"
              onClick={handleClick}
            >
              <ShoppingCart size={16} />
              Get Now
              <ExternalLink size={14} className="cta-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
