/**
 * CrystalRecommendation - Web component
 * Shows crystal product suggestions based on divination/chat context.
 * Ported from gem-mobile/src/components/GemMaster/CrystalRecommendationNew.js
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Gem, Star, ChevronRight, Zap } from 'lucide-react';
import './CrystalRecommendation.css';

const formatPrice = (price) => {
  if (!price) return '';
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  return num.toLocaleString('vi-VN') + 'd';
};

const ProductCard = memo(({ product, index, onPress, onQuickBuy }) => {
  const imageUrl =
    product?.images?.[0]?.src ||
    product?.images?.[0]?.url ||
    product?.image?.src ||
    product?.image ||
    null;

  const price = product?.variants?.[0]?.price || product?.price || 0;

  const tags = product?.tags || [];
  const tagList = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
  const isBestseller = tagList.some((t) => ['Bestseller', 'Hot Product'].includes(t));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="crystal-rec-card"
      onClick={() => onPress?.(product)}
    >
      <div className="crystal-rec-image">
        {imageUrl ? (
          <img src={imageUrl} alt={product?.title || ''} />
        ) : (
          <div className="crystal-rec-image-placeholder">
            <Gem size={24} color="rgba(255,255,255,0.3)" />
          </div>
        )}
        {isBestseller && <span className="crystal-rec-badge">HOT</span>}
      </div>

      <div className="crystal-rec-info">
        <p className="crystal-rec-product-title">{product?.title || 'San pham'}</p>
        <div className="crystal-rec-rating">
          <Star size={12} color="#FFBD59" fill="#FFBD59" />
          <span className="crystal-rec-rating-text">4.8</span>
        </div>
        <p className="crystal-rec-price">{formatPrice(price)}</p>
        {onQuickBuy && (
          <button
            className="crystal-rec-quickbuy"
            onClick={(e) => {
              e.stopPropagation();
              onQuickBuy(product);
            }}
          >
            <Zap size={12} />
            Mua ngay
          </button>
        )}
      </div>
    </motion.div>
  );
});

const CrystalRecommendation = ({
  crystals = [],
  loading = false,
  onBuy,
  onDismiss,
  onViewAll,
  context,
}) => {
  if (loading) {
    return (
      <div className="crystal-rec">
        <div className="crystal-rec-header">
          <Gem size={18} color="#9B59B6" />
          <span className="crystal-rec-title">Da phong thuy goi y</span>
        </div>
        <div className="crystal-rec-loading">
          <div className="crystal-rec-spinner" />
          Dang tai san pham...
        </div>
      </div>
    );
  }

  if (!crystals || crystals.length === 0) return null;

  return (
    <motion.div
      className="crystal-rec"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="crystal-rec-header">
        <Gem size={18} color="#9B59B6" />
        <span className="crystal-rec-title">Da phong thuy goi y cho ban</span>
        {onViewAll && (
          <button className="crystal-rec-viewall" onClick={onViewAll}>
            Xem tat ca
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      <div className="crystal-rec-list">
        {crystals.map((product, index) => (
          <ProductCard
            key={product?.id || index}
            product={product}
            index={index}
            onPress={onBuy}
            onQuickBuy={onBuy}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default memo(CrystalRecommendation);
