import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './MiniCartDropdown.css';

const MiniCartDropdown = ({ isOpen, onClose, lastAddedItem, cart }) => {
  const navigate = useNavigate();
  const [autoCloseTimer, setAutoCloseTimer] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      setAutoCloseTimer(timer);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  const cartTotal = cart.reduce((sum, item) => {
    const variant = item.product.variants.edges.find(
      v => v.node.id === item.variantId
    )?.node;
    const price = parseFloat(variant?.priceV2.amount || 0);
    return sum + (price * item.quantity);
  }, 0);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="mini-cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Mini Cart */}
          <motion.div
            className="mini-cart-dropdown"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="mini-cart-header">
              <div className="success-indicator">
                <Check size={20} className="check-icon" />
                <span>Đã Thêm Vào Giỏ!</span>
              </div>
              <button onClick={onClose} className="close-btn">
                <X size={20} />
              </button>
            </div>

            {/* Last Added Item */}
            {lastAddedItem && (
              <div className="last-added-item">
                <img
                  src={lastAddedItem.image}
                  alt={lastAddedItem.name}
                  className="item-image"
                />
                <div className="item-details">
                  <h4>{lastAddedItem.name}</h4>
                  {lastAddedItem.variant && (
                    <p className="item-variant">{lastAddedItem.variant}</p>
                  )}
                  <div className="item-price-qty">
                    <span className="quantity">Số lượng: {lastAddedItem.quantity}</span>
                    <span className="price">{lastAddedItem.price.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
              </div>
            )}

            <div className="divider" />

            {/* Cart Summary */}
            <div className="cart-summary">
              <div className="summary-row">
                <span>Tổng giỏ hàng:</span>
                <span className="total-price">{cartTotal.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="summary-row">
                <span className="items-count">{totalItems} sản phẩm</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mini-cart-actions">
              <button
                className="btn-view-cart"
                onClick={() => {
                  navigate('/cart');
                  onClose();
                }}
              >
                <ShoppingCart size={18} />
                Xem Giỏ Hàng
              </button>

              <button
                className="btn-checkout"
                onClick={() => {
                  navigate('/cart');
                  onClose();
                }}
              >
                Thanh Toán
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Auto-close indicator */}
            <div className="auto-close-bar">
              <motion.div
                className="progress-bar"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MiniCartDropdown;
