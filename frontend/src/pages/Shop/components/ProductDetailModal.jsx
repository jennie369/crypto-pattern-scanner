import React, { useState } from 'react';
import { X, ShoppingCart, Plus, Minus } from 'lucide-react';

const ProductDetailModal = ({ product, onClose, onAddToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants.edges[0]?.node
  );
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button onClick={onClose} className="modal-close">
          <X size={24} />
        </button>

        <div className="modal-body">
          {/* Images */}
          <div className="modal-images">
            {product.images.edges.map((edge, index) => (
              <img
                key={index}
                src={edge.node.url}
                alt={edge.node.altText || product.title}
                className="modal-image"
              />
            ))}
          </div>

          {/* Details */}
          <div className="modal-details">
            <h2 className="modal-title">{product.title}</h2>

            <div className="modal-price">
              {parseFloat(selectedVariant.priceV2.amount).toLocaleString('vi-VN')}₫
            </div>

            <div
              className="modal-description"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }}
            />

            {/* Variant Selection */}
            {product.variants.edges.length > 1 && (
              <div className="modal-variants">
                <label className="modal-label">Chọn Phiên Bản</label>
                <div className="variant-options">
                  {product.variants.edges.map((edge) => (
                    <button
                      key={edge.node.id}
                      onClick={() => setSelectedVariant(edge.node)}
                      className={`variant-option ${selectedVariant.id === edge.node.id ? 'active' : ''
                        }`}
                    >
                      {edge.node.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="modal-quantity">
              <label className="modal-label">Số Lượng</label>
              <div className="quantity-controls">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="quantity-btn"
                >
                  <Minus size={16} />
                </button>
                <span className="quantity-value">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="quantity-btn"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              className="modal-add-to-cart"
              onClick={() => {
                onAddToCart(product, selectedVariant.id, quantity);
                onClose();
              }}
            >
              <ShoppingCart size={20} />
              <span>Thêm Vào Giỏ Hàng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
