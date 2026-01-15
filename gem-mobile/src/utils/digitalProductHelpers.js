/**
 * Gemral - Digital Product Helpers
 * Edge case handling, safe data extraction, and utility functions
 */

import { PRICE_CONFIG } from './digitalProductsConfig';

// Placeholder image - use a reliable CDN fallback
export const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x400/1a0b2e/FFBD59?text=GEM';

// Fallback images for different categories
export const FALLBACK_IMAGES = {
  trading: 'https://via.placeholder.com/400x400/1a0b2e/00D9FF?text=Trading',
  mindset: 'https://via.placeholder.com/400x400/1a0b2e/9C0612?text=Tu+Duy',
  spiritual: 'https://via.placeholder.com/400x400/1a0b2e/9C0612?text=Tu+Duy', // Legacy alias
  chatbot: 'https://via.placeholder.com/400x400/1a0b2e/6A5BFF?text=Chatbot',
  scanner: 'https://via.placeholder.com/400x400/1a0b2e/3AF7A6?text=Scanner',
  gems: 'https://via.placeholder.com/400x400/1a0b2e/FFBD59?text=Gems',
  default: 'https://via.placeholder.com/400x400/1a0b2e/FFBD59?text=GEM',
};

// ═══════════════════════════════════════════════════════════
// SAFE DATA EXTRACTION
// ═══════════════════════════════════════════════════════════

/**
 * Safely extract product data with fallbacks
 * @param {object} product - Raw product
 * @returns {object|null}
 */
export const extractProductData = (product) => {
  if (!product) return null;

  return {
    id: product.id || '',
    title: product.title || 'Sản phẩm',
    handle: product.handle || '',
    description: product.description || '',
    tags: safeArray(product.tags).filter(t => t != null),
    images: safeArray(product.images).filter(Boolean),
    variants: safeArray(product.variants),
    price: parsePrice(product.price || product.variants?.[0]?.price),
    compareAtPrice: parsePrice(product.compareAtPrice || product.variants?.[0]?.compareAtPrice),
    available: product.available ?? true,
    tier: product.tier || null,
    subscriptionType: product.subscriptionType || null,
    isDigital: product.isDigital ?? true,
  };
};

/**
 * Safe array conversion
 * @param {any} value - Value to convert
 * @returns {Array}
 */
export const safeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
};

/**
 * Safe string conversion
 * @param {any} value - Value to convert
 * @param {string} fallback - Fallback value
 * @returns {string}
 */
export const safeString = (value, fallback = '') => {
  if (typeof value === 'string') return value;
  if (value == null) return fallback;
  return String(value);
};

// ═══════════════════════════════════════════════════════════
// PRICE HANDLING
// ═══════════════════════════════════════════════════════════

/**
 * Parse price from various formats
 * @param {any} price - Price value
 * @returns {number|null}
 */
export const parsePrice = (price) => {
  if (price == null) return null;
  if (typeof price === 'number') return price;

  if (typeof price === 'string') {
    // Remove currency symbols and spaces
    const cleaned = price.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  // Handle Shopify Money object
  if (typeof price === 'object' && price.amount) {
    return parseFloat(price.amount);
  }

  return null;
};

/**
 * Format price in VND
 * @param {number} value - Price value
 * @returns {string}
 */
export const formatPrice = (value) => {
  if (value == null || isNaN(value)) return 'Liên hệ';

  return new Intl.NumberFormat(PRICE_CONFIG.locale, {
    style: 'currency',
    currency: PRICE_CONFIG.currency,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format price compact (e.g., 11tr, 299K)
 * @param {number} value - Price value
 * @returns {string}
 */
export const formatPriceCompact = (value) => {
  if (value == null || isNaN(value)) return 'Liên hệ';

  if (value >= 1000000) {
    const millions = value / 1000000;
    return `${millions % 1 === 0 ? millions : millions.toFixed(1)}tr`;
  }

  if (value >= 1000) {
    const thousands = value / 1000;
    return `${thousands % 1 === 0 ? thousands : thousands.toFixed(0)}K`;
  }

  return formatPrice(value);
};

/**
 * Calculate discount percentage
 * @param {number} price - Current price
 * @param {number} compareAtPrice - Original price
 * @returns {number}
 */
export const calculateDiscount = (price, compareAtPrice) => {
  if (!price || !compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round((1 - price / compareAtPrice) * 100);
};

// ═══════════════════════════════════════════════════════════
// IMAGE HANDLING
// ═══════════════════════════════════════════════════════════

/**
 * Extract image URL from product - Enhanced version with better fallbacks
 * @param {object} product - Product object
 * @param {string} placeholder - Placeholder URL
 * @returns {string}
 */
export const extractImageUrl = (product, placeholder = PLACEHOLDER_IMAGE) => {
  if (!product) return placeholder;

  // Try all possible image sources
  const sources = [
    // Direct URL strings
    product.featuredImage?.url,
    product.featuredImage?.src,
    product.featuredImage?.originalSrc,
    product.featuredImage?.transformedSrc,
    // Handle case when featuredImage is just a string
    typeof product.featuredImage === 'string' ? product.featuredImage : null,
    // Image object
    product.image?.url,
    product.image?.src,
    product.image?.originalSrc,
    product.image?.transformedSrc,
    // Handle case when image is just a string
    typeof product.image === 'string' ? product.image : null,
    // Images array - first item
    product.images?.[0]?.url,
    product.images?.[0]?.src,
    product.images?.[0]?.originalSrc,
    product.images?.[0]?.transformedSrc,
    // Handle case when images[0] is just a string
    typeof product.images?.[0] === 'string' ? product.images[0] : null,
    // Shopify specific fields
    product.imageUrl,
    product.thumbnail,
    product.thumbnailUrl,
    product.media?.[0]?.image?.url,
    product.media?.[0]?.image?.src,
    // Legacy support
    product.src,
    product.url,
  ];

  // Check each source
  for (const source of sources) {
    if (isValidImageUrl(source)) {
      return optimizeImageUrl(source);
    }
  }

  return placeholder;
};

/**
 * Check if a string is a valid image URL
 * @param {any} url - URL to check
 * @returns {boolean}
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;

  // Check if starts with http/https
  if (!url.startsWith('http://') && !url.startsWith('https://')) return false;

  // Check for common image domains
  const validDomains = [
    'cdn.shopify.com',
    'shopify.com',
    'i.pinimg.com',
    'images.unsplash.com',
    'via.placeholder.com',
    'placehold.co',
    'firebasestorage.googleapis.com',
    'supabase.co',
    'cloudinary.com',
    'imgix.net',
  ];

  // Allow any URL that looks like an image
  const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)/i.test(url);
  const isFromValidDomain = validDomains.some(domain => url.includes(domain));

  return hasImageExtension || isFromValidDomain || url.includes('images') || url.includes('media');
};

/**
 * Optimize Shopify image URL for faster loading
 * @param {string} url - Original URL
 * @returns {string}
 */
export const optimizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;

  // Shopify CDN optimization - request smaller size for cards
  if (url.includes('cdn.shopify.com')) {
    // Add size parameter if not present
    if (!url.includes('_') && !url.includes('?')) {
      // Insert size before extension (e.g., .jpg -> _400x400.jpg)
      const extensionMatch = url.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i);
      if (extensionMatch) {
        const ext = extensionMatch[0];
        return url.replace(ext, `_400x400${ext}`);
      }
    }
  }

  return url;
};

/**
 * Get all product images
 * @param {object} product - Product object
 * @returns {string[]}
 */
export const extractAllImages = (product) => {
  if (!product) return [PLACEHOLDER_IMAGE];

  const images = [];

  // Add featured image first
  const featured = extractImageUrl(product, null);
  if (featured) {
    images.push(featured);
  }

  // Add remaining images
  const productImages = safeArray(product.images);
  for (const img of productImages) {
    const url = typeof img === 'string' ? img : img?.url || img?.src;
    if (url && typeof url === 'string' && !images.includes(url)) {
      images.push(url);
    }
  }

  return images.length > 0 ? images : [PLACEHOLDER_IMAGE];
};

// ═══════════════════════════════════════════════════════════
// NAVIGATION HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Build safe product object for navigation
 * @param {object} product - Raw product
 * @returns {object|null}
 */
export const buildNavigationProduct = (product) => {
  if (!product?.id) {
    console.warn('[Navigation] Invalid product - missing ID');
    return null;
  }

  return {
    id: product.id,
    title: product.title || 'Sản phẩm',
    handle: product.handle || '',
    description: product.description || '',
    tags: safeArray(product.tags),
    images: safeArray(product.images),
    variants: safeArray(product.variants),
    featuredImage: product.featuredImage || null,
    image: extractImageUrl(product),
    price: parsePrice(product.price || product.variants?.[0]?.price) || 0,
    compareAtPrice: parsePrice(product.compareAtPrice || product.variants?.[0]?.compareAtPrice),
    available: product.available ?? true,
    tier: product.tier || null,
    subscriptionType: product.subscriptionType || null,
    isDigital: true,
  };
};

/**
 * Safe navigation to product detail
 * @param {object} navigation - Navigation object
 * @param {object} product - Product object
 * @returns {boolean} - Success
 */
export const safeNavigateToProduct = (navigation, product) => {
  if (!navigation) {
    console.warn('[Navigation] Navigation object is null');
    return false;
  }

  if (!product?.id) {
    console.warn('[Navigation] Invalid product');
    return false;
  }

  const fullProduct = buildNavigationProduct(product);
  if (!fullProduct) {
    return false;
  }

  navigation.navigate('ProductDetail', { product: fullProduct });
  return true;
};

// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function}
 */
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit time in ms
 * @returns {Function}
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Prevent double tap
 * @param {Function} func - Function to protect
 * @param {number} delay - Delay in ms
 * @returns {Function}
 */
export const preventDoubleTap = (func, delay = 500) => {
  let lastTime = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      return func.apply(this, args);
    }
  };
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Max length
 * @returns {string}
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Generate unique key for FlatList
 * @param {object} item - List item
 * @param {number} index - Item index
 * @returns {string}
 */
export const generateKey = (item, index) => {
  return item?.id ? `${item.id}-${index}` : `item-${index}`;
};

export default {
  PLACEHOLDER_IMAGE,
  FALLBACK_IMAGES,
  extractProductData,
  safeArray,
  safeString,
  parsePrice,
  formatPrice,
  formatPriceCompact,
  calculateDiscount,
  extractImageUrl,
  isValidImageUrl,
  optimizeImageUrl,
  extractAllImages,
  buildNavigationProduct,
  safeNavigateToProduct,
  debounce,
  throttle,
  preventDoubleTap,
  truncateText,
  generateKey,
};
