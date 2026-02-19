/**
 * QuickBuyModal - Web component
 * Quick purchase modal for crystals / products from chat.
 * Ported from gem-mobile/src/components/GemMaster/QuickBuyModal.js
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Minus,
  Plus,
  ShoppingCart,
  CreditCard,
  Gem,
  Star,
  Check,
  Sparkles,
} from 'lucide-react';
import { ANIMATION } from '../../../../web design-tokens';
import './QuickBuyModal.css';

const formatPrice = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'd';
};

const QuickBuyModal = ({
  isOpen,
  product,
  onClose,
  onAddToCart,
  onCheckout,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset state when modal opens with new product
  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setAddedToCart(false);
      setSelectedVariant(
        product.variants?.length > 0 ? product.variants[0] : null
      );
    }
  }, [isOpen, product?.id]);

  const getImageUrl = useCallback(() => {
    if (!product) return null;
    return (
      product.images?.[0]?.src ||
      product.images?.[0]?.url ||
      product.image?.src ||
      product.image ||
      null
    );
  }, [product]);

  const getPrice = useCallback(() => {
    if (selectedVariant) return parseFloat(selectedVariant.price || 0);
    return parseFloat(product?.variants?.[0]?.price || product?.price || 0);
  }, [product, selectedVariant]);

  const handleAddToCart = async () => {
    if (!product) return;
    setLoading(true);
    try {
      await onAddToCart?.({ product, variant: selectedVariant, quantity });
      setAddedToCart(true);
      setTimeout(() => onClose?.(), 1200);
    } catch (err) {
      console.error('[QuickBuy] Add to cart error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    setLoading(true);
    try {
      await onCheckout?.({ product, variant: selectedVariant, quantity });
      onClose?.();
    } catch (err) {
      console.error('[QuickBuy] Buy now error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose?.();
  };

  if (!product) return null;

  const imageUrl = getImageUrl();
  const price = getPrice();
  const totalPrice = price * quantity;

  const tags = product.tags || [];
  const tagList = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
  const displayTags = tagList.filter((t) => !['Bestseller', 'Hot Product'].includes(t)).slice(0, 3);
  const isBestseller = tagList.some((t) => ['Bestseller', 'Hot Product'].includes(t));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="quickbuy-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label="Quick buy"
        >
          <motion.div
            className="quickbuy-modal"
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={ANIMATION.spring}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="quickbuy-header">
              <div className="quickbuy-header-left">
                <Gem size={20} color="#FFBD59" />
                <h3 className="quickbuy-header-title">Mua nhanh</h3>
              </div>
              <button className="quickbuy-close" onClick={onClose} aria-label="Close">
                <X size={22} color="#b8b8d0" />
              </button>
            </div>

            <div className="quickbuy-content">
              {/* Product Row */}
              <div className="quickbuy-product-row">
                <div className="quickbuy-image-container">
                  {imageUrl ? (
                    <img src={imageUrl} alt={product.title} className="quickbuy-image" />
                  ) : (
                    <div className="quickbuy-image-placeholder">
                      <Gem size={32} color="rgba(255,255,255,0.3)" />
                    </div>
                  )}
                  {isBestseller && (
                    <div className="quickbuy-bestseller-badge">
                      <Star size={10} fill="#fff" color="#fff" />
                      HOT
                    </div>
                  )}
                </div>

                <div className="quickbuy-product-details">
                  <h4 className="quickbuy-product-title">{product.title}</h4>
                  {displayTags.length > 0 && (
                    <div className="quickbuy-tags">
                      {displayTags.map((tag, i) => (
                        <span key={i} className="quickbuy-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  <p className="quickbuy-price">{formatPrice(price)}</p>
                </div>
              </div>

              {/* Variants */}
              {product.variants?.length > 1 && (
                <div style={{ marginBottom: 20 }}>
                  <p className="quickbuy-section-title">Phan loai</p>
                  <div className="quickbuy-variants">
                    {product.variants.map((variant, i) => (
                      <button
                        key={variant.id || i}
                        className={`quickbuy-variant ${selectedVariant?.id === variant.id ? 'quickbuy-variant--selected' : ''}`}
                        onClick={() => setSelectedVariant(variant)}
                      >
                        {variant.title || 'Default'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="quickbuy-quantity">
                <p className="quickbuy-section-title">So luong</p>
                <div className="quickbuy-quantity-row">
                  <div className="quickbuy-quantity-controls">
                    <button
                      className="quickbuy-quantity-btn"
                      onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus size={18} />
                    </button>
                    <span className="quickbuy-quantity-value">{quantity}</span>
                    <button
                      className="quickbuy-quantity-btn"
                      onClick={() => setQuantity((q) => Math.min(q + 1, 10))}
                      disabled={quantity >= 10}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <span className="quickbuy-total-price">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Upsell hint */}
              <div className="quickbuy-upsell-hint">
                <Sparkles size={14} />
                Them vao gio de xem combo giam gia!
              </div>
            </div>

            {/* Footer */}
            <div className="quickbuy-footer">
              {addedToCart ? (
                <div className="quickbuy-success-row">
                  <Check size={20} color="#4CAF50" />
                  Da them vao gio hang!
                </div>
              ) : (
                <div className="quickbuy-button-row">
                  <button
                    className="quickbuy-action-btn quickbuy-cart-btn"
                    onClick={handleAddToCart}
                    disabled={loading}
                  >
                    <ShoppingCart size={18} />
                    Them vao gio
                  </button>
                  <button
                    className="quickbuy-action-btn quickbuy-buy-btn"
                    onClick={handleBuyNow}
                    disabled={loading}
                  >
                    <CreditCard size={18} />
                    Mua ngay
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickBuyModal;
