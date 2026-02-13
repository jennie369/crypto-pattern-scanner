import React from 'react';
import { XCircle, Search } from 'lucide-react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, loading, error, onAddToCart, onProductClick }) => {
  if (loading) {
    return (
      <div className="products-loading">
        <div className="spinner" />
        <p>Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-error">
        <XCircle size={24} color="#EF4444" />
        <p>Lỗi: {error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="products-empty">
        <Search className="empty-icon" size={48} strokeWidth={1.5} />
        <p className="empty-text">Không tìm thấy sản phẩm nào</p>
      </div>
    );
  }

  return (
    <div className="product-grid-section">
      <div className="section-header">
        <h2 className="section-title">Sản Phẩm ({products.length})</h2>
      </div>

      <div className="products-grid">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onClick={() => onProductClick(product)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
