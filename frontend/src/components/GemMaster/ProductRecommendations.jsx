/**
 * ProductRecommendations - Web component
 * Shows course, scanner, and affiliate recommendation cards based on context.
 * Ported from gem-mobile/src/components/GemMaster/ProductRecommendations.js
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  TrendingUp,
  Users,
  ChevronRight,
  Star,
} from 'lucide-react';
import './ProductRecommendations.css';

const formatPrice = (price) => {
  if (!price) return '';
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  return num.toLocaleString('vi-VN') + 'd';
};

// Keyword detection
const KEYWORDS = {
  course: ['khoa hoc', 'course', 'hoc', 'tan so', 'nang luong', 'chua lanh', 'manifest', 'spiritual'],
  trading: ['trading', 'crypto', 'bitcoin', 'btc', 'eth', 'scanner', 'pattern', 'tier 1', 'tier 2', 'tier 3'],
  affiliate: ['kiem them', 'thu nhap', 'affiliate', 'ctv', 'hoa hong', 'partner', 'gioi thieu'],
};

export const detectRecommendations = (context) => {
  if (!context) return { showCourses: true, showScanner: false, showAffiliate: true };
  const lower = context.toLowerCase();
  let showCourses = KEYWORDS.course.some((kw) => lower.includes(kw));
  let showScanner = KEYWORDS.trading.some((kw) => lower.includes(kw));
  const showAffiliate = KEYWORDS.affiliate.some((kw) => lower.includes(kw));
  if (showScanner) showCourses = true;
  if (!showCourses && !showScanner && !showAffiliate) {
    return { showCourses: true, showScanner: false, showAffiliate: true };
  }
  return { showCourses, showScanner, showAffiliate };
};

// Course Card
const CourseCard = memo(({ product, index, onPress }) => {
  const imageUrl =
    product?.images?.[0]?.url ||
    product?.images?.[0]?.src ||
    product?.featuredImage?.url ||
    product?.image?.src ||
    null;

  const price =
    product?.variants?.[0]?.price?.amount ||
    product?.variants?.[0]?.price ||
    product?.priceRange?.minVariantPrice?.amount ||
    0;

  let color = '#FFBD59';
  const tags = (product?.tags || []).join(' ').toLowerCase();
  if (tags.includes('tinh yeu') || tags.includes('love')) color = '#E91E63';
  else if (tags.includes('trading') || tags.includes('scanner')) color = '#00D9FF';
  else if (tags.includes('tan so') || tags.includes('frequency')) color = '#9B59B6';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="product-rec-card"
      style={{ borderColor: `${color}40` }}
      onClick={() => onPress?.(product)}
    >
      <div className="product-rec-card-header">
        {imageUrl ? (
          <div className="product-rec-card-image">
            <img src={imageUrl} alt={product?.title || ''} />
          </div>
        ) : (
          <div className="product-rec-icon-bg" style={{ background: `${color}20` }}>
            <GraduationCap size={20} color={color} />
          </div>
        )}
        <div className="product-rec-card-title-container">
          <p className="product-rec-card-title">{product?.title || 'Khoa hoc'}</p>
          <p className="product-rec-card-subtitle">{product?.vendor || 'YinYang Masters'}</p>
        </div>
        <ChevronRight size={20} color="rgba(255,255,255,0.6)" />
      </div>
      <div className="product-rec-price-row">
        <span className="product-rec-price" style={{ color }}>{formatPrice(price)}</span>
      </div>
    </motion.div>
  );
});

// Scanner Card
const ScannerCard = memo(({ product, onPress }) => {
  const imageUrl =
    product?.images?.[0]?.url ||
    product?.images?.[0]?.src ||
    product?.featuredImage?.url ||
    null;

  const price =
    product?.variants?.[0]?.price?.amount ||
    product?.variants?.[0]?.price ||
    0;

  return (
    <div
      className="product-rec-card"
      style={{ borderColor: '#00D9FF40' }}
      onClick={() => onPress?.(product)}
    >
      <div className="product-rec-card-header">
        {imageUrl ? (
          <div className="product-rec-card-image">
            <img src={imageUrl} alt={product?.title || ''} />
          </div>
        ) : (
          <div className="product-rec-icon-bg" style={{ background: '#00D9FF20' }}>
            <TrendingUp size={20} color="#00D9FF" />
          </div>
        )}
        <div className="product-rec-card-title-container">
          <p className="product-rec-card-title">{product?.title || 'GEM Scanner Pro'}</p>
          <p className="product-rec-card-subtitle">Cong cu phan tich crypto AI</p>
        </div>
        <ChevronRight size={20} color="rgba(255,255,255,0.6)" />
      </div>
      <div className="product-rec-benefits">
        <div className="product-rec-benefit">
          <Star size={12} color="#00D9FF" />
          <span>7 patterns tu dong</span>
        </div>
        <div className="product-rec-benefit">
          <Star size={12} color="#00D9FF" />
          <span>Alert Telegram realtime</span>
        </div>
      </div>
      <div className="product-rec-price-row">
        <span className="product-rec-price" style={{ color: '#00D9FF' }}>{formatPrice(price)}</span>
      </div>
    </div>
  );
});

// Affiliate CTA
const AFFILIATE_TIERS = [
  { name: 'Affiliate', commission: '3%' },
  { name: 'Bronze', commission: '10%' },
  { name: 'Silver', commission: '20%' },
  { name: 'Gold', commission: '30%' },
];

const AffiliateCard = memo(({ onPress }) => (
  <div
    className="product-rec-card product-rec-card--affiliate"
    onClick={onPress}
  >
    <div className="product-rec-card-header">
      <div className="product-rec-icon-bg" style={{ background: '#2ECC7120' }}>
        <Users size={20} color="#2ECC71" />
      </div>
      <div className="product-rec-card-title-container">
        <p className="product-rec-card-title">Chuong trinh Cong tac vien</p>
        <p className="product-rec-card-subtitle">Kiem thu nhap thu dong</p>
      </div>
      <ChevronRight size={20} color="rgba(255,255,255,0.6)" />
    </div>
    <div className="product-rec-tiers">
      {AFFILIATE_TIERS.map((tier, i) => (
        <div key={i} className="product-rec-tier-badge">
          <span className="product-rec-tier-name">{tier.name}</span>
          <span className="product-rec-tier-commission">{tier.commission}</span>
        </div>
      ))}
    </div>
    <button className="product-rec-cta">Dang ky ngay - Mien phi!</button>
  </div>
));

const ProductRecommendations = ({
  recommendations = [],
  type,
  onSelect,
  onDismiss,
  context,
  showAll = false,
  loading = false,
}) => {
  const { showCourses, showScanner, showAffiliate } = showAll
    ? { showCourses: true, showScanner: true, showAffiliate: true }
    : detectRecommendations(context);

  // Separate by type if provided
  const courses = recommendations.filter(
    (r) => r._type === 'course' || (!r._type && showCourses)
  );
  const scannerProduct = recommendations.find((r) => r._type === 'scanner');

  return (
    <motion.div
      className="product-rec"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="product-rec-header">
        <GraduationCap size={18} color="#FFBD59" />
        <span className="product-rec-title">Goi y cho ban</span>
      </div>

      {loading && (
        <div className="product-rec-loading">
          <div className="product-rec-spinner" />
          Dang tai khoa hoc...
        </div>
      )}

      {!loading &&
        courses.map((product, idx) => (
          <CourseCard
            key={product?.id || idx}
            product={product}
            index={idx}
            onPress={onSelect}
          />
        ))}

      {showScanner && scannerProduct && (
        <ScannerCard product={scannerProduct} onPress={onSelect} />
      )}

      {showAffiliate && <AffiliateCard onPress={() => onSelect?.({ _type: 'affiliate' })} />}
    </motion.div>
  );
};

export default memo(ProductRecommendations);
