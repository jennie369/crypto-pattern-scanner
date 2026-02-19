/**
 * UpsellModal - Web component
 * Shows combo upsell suggestions after adding product to cart.
 * Ported from gem-mobile/src/components/GemMaster/UpsellModal.js
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Check,
  ShoppingCart,
  CreditCard,
  Sparkles,
  Gem,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { ANIMATION } from '../../../../web design-tokens';
import './UpsellModal.css';

const formatPrice = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'd';
};

const UpsellModal = ({
  isOpen,
  upsellData,
  onClose,
  onCheckout,
  onContinueShopping,
  onAddToCart,
}) => {
  const [selectedUpsells, setSelectedUpsells] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setSelectedUpsells([]);
  }, [isOpen]);

  const toggleUpsell = (product) => {
    setSelectedUpsells((prev) => {
      const isSelected = prev.some((p) => p.id === product.id);
      return isSelected
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product];
    });
  };

  const isSelected = (product) => selectedUpsells.some((p) => p.id === product.id);

  // Calculate totals
  const subtotal = selectedUpsells.reduce((sum, p) => {
    return sum + parseFloat(p.variants?.[0]?.price || p.price || 0);
  }, 0);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      if (onAddToCart) {
        for (const product of selectedUpsells) {
          await onAddToCart({ product, variant: null, quantity: 1 });
        }
      }
      onClose?.();
      onCheckout?.();
    } catch (err) {
      console.error('[Upsell] Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipAndCheckout = async () => {
    setLoading(true);
    try {
      onClose?.();
      onCheckout?.();
    } catch (err) {
      console.error('[Upsell] Skip checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    onClose?.();
    onContinueShopping?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose?.();
  };

  if (!upsellData?.upsells) return null;

  const { primaryProduct, upsells } = upsellData;
  const hasUpsells = upsells?.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="upsell-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label="Upsell suggestions"
        >
          <motion.div
            className="upsell-modal"
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={ANIMATION.spring}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="upsell-header">
              <div className="upsell-header-left">
                <Sparkles size={20} color="#FFBD59" />
                <h3 className="upsell-header-title">Combo giam gia!</h3>
              </div>
              <button className="upsell-close" onClick={onClose} aria-label="Close">
                <X size={22} color="#b8b8d0" />
              </button>
            </div>

            {/* Discount banner */}
            {selectedUpsells.length > 0 && (
              <motion.div
                className="upsell-discount-banner"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Tag size={16} color="#FFBD59" />
                <span>
                  Mua them de duoc giam{' '}
                  <span className="upsell-discount-highlight">
                    {selectedUpsells.length > 2 ? '15%' : selectedUpsells.length > 1 ? '10%' : '5%'}
                  </span>
                </span>
              </motion.div>
            )}

            <div className="upsell-content">
              {/* Success */}
              <div className="upsell-success">
                <div className="upsell-success-icon">
                  <Check size={24} color="#4CAF50" />
                </div>
                <div>
                  <p className="upsell-success-title">Da them vao gio hang!</p>
                  <p className="upsell-success-subtitle">{primaryProduct?.title}</p>
                </div>
              </div>

              {/* Upsell products */}
              {hasUpsells && (
                <div>
                  <p className="upsell-section-title">Ket hop de tang hieu qua</p>
                  <p className="upsell-section-subtitle">Chon them san pham bo tro:</p>

                  {upsells.map((product, index) => {
                    const imgUrl =
                      product.images?.[0]?.src ||
                      product.images?.[0]?.url ||
                      product.image?.src ||
                      product.image ||
                      null;
                    const price = parseFloat(product.variants?.[0]?.price || product.price || 0);
                    const reason = product.upsellReason || 'San pham bo tro';
                    const selected = isSelected(product);

                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`upsell-card ${selected ? 'upsell-card--selected' : ''}`}
                        onClick={() => toggleUpsell(product)}
                      >
                        <div className={`upsell-checkbox ${selected ? 'upsell-checkbox--selected' : ''}`}>
                          {selected ? (
                            <Check size={14} color="#fff" />
                          ) : (
                            <Plus size={14} color="rgba(255,255,255,0.4)" />
                          )}
                        </div>

                        <div className="upsell-card-image">
                          {imgUrl ? (
                            <img src={imgUrl} alt={product.title} />
                          ) : (
                            <Gem size={24} color="rgba(255,255,255,0.3)" />
                          )}
                        </div>

                        <div className="upsell-card-info">
                          <p className="upsell-card-title">{product.title}</p>
                          <p className="upsell-card-reason">{reason}</p>
                        </div>

                        <span className="upsell-card-price">{formatPrice(price)}</span>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Summary */}
              {subtotal > 0 && (
                <div className="upsell-summary">
                  <div className="upsell-summary-row">
                    <span className="upsell-summary-label">Them {selectedUpsells.length} san pham</span>
                    <span className="upsell-summary-value">{formatPrice(subtotal)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="upsell-footer">
              {selectedUpsells.length > 0 ? (
                <button
                  className="upsell-action-btn upsell-checkout-btn"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  <CreditCard size={18} />
                  Thanh toan ({selectedUpsells.length + 1} san pham)
                </button>
              ) : (
                <div className="upsell-button-row">
                  <button
                    className="upsell-action-btn upsell-continue-btn"
                    onClick={handleContinue}
                  >
                    <ShoppingCart size={18} />
                    Tiep tuc mua
                  </button>
                  <button
                    className="upsell-action-btn upsell-skip-btn"
                    onClick={handleSkipAndCheckout}
                    disabled={loading}
                  >
                    Thanh toan
                    <ArrowRight size={16} />
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

export default UpsellModal;
