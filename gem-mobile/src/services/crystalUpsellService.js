/**
 * Crystal Upsell Service
 * Manages upsell combinations and combo discounts for crystal purchases
 * Used in GemMasterScreen for "Mua Crystal qua Chatbot" flow
 */

import shopifyService from './shopifyService';

// ========== CRYSTAL UPSELL COMBINATIONS ==========
// Maps primary crystal tags to complementary upsell tags
// Based on crystal synergy: energy amplification + manifestation purposes

const CRYSTAL_UPSELL_MAP = {
  // Thạch Anh Hồng (Love/Relationships) → pairs with
  'Thạch Anh Hồng': {
    primary: ['Thạch Anh Hồng'],
    upsells: ['Thạch Anh Tím', 'Aura', 'Set'],
    reason: {
      'Thạch Anh Tím': 'Tăng cường trực giác trong tình yêu',
      'Aura': 'Hài hòa năng lượng quan hệ',
      'Set': 'Bộ combo tiết kiệm hơn',
    },
  },

  // Thạch Anh Tím (Spiritual/Sleep) → pairs with
  'Thạch Anh Tím': {
    primary: ['Thạch Anh Tím'],
    upsells: ['Thạch Anh Trắng', 'Thạch Anh Hồng', 'Special set'],
    reason: {
      'Thạch Anh Trắng': 'Khuếch đại năng lượng thiền định',
      'Thạch Anh Hồng': 'Cân bằng năng lượng tim',
      'Special set': 'Combo thiền định đầy đủ',
    },
  },

  // Thạch Anh Vàng (Money/Wealth) → pairs with
  'Thạch Anh Vàng': {
    primary: ['Thạch Anh Vàng'],
    upsells: ['Cây Tài Lộc', 'Thạch Anh Trắng', 'Set'],
    reason: {
      'Cây Tài Lộc': 'Tăng gấp đôi năng lượng tài lộc',
      'Thạch Anh Trắng': 'Thanh lọc và khuếch đại ý định',
      'Set': 'Combo phong thủy hoàn chỉnh',
    },
  },

  // Thạch Anh Trắng (Amplifier/Clarity) → pairs with
  'Thạch Anh Trắng': {
    primary: ['Thạch Anh Trắng'],
    upsells: ['Thạch Anh Tím', 'Thạch Anh Vàng', 'Special set'],
    reason: {
      'Thạch Anh Tím': 'Combo thiền định mạnh mẽ',
      'Thạch Anh Vàng': 'Khuếch đại năng lượng thịnh vượng',
      'Special set': 'Bộ full chakra',
    },
  },

  // Cây Tài Lộc (Money Tree) → pairs with
  'Cây Tài Lộc': {
    primary: ['Cây Tài Lộc'],
    upsells: ['Thạch Anh Vàng', 'Trụ', 'Vòng Tay'],
    reason: {
      'Thạch Anh Vàng': 'Đá hộ mệnh tài lộc',
      'Trụ': 'Trụ năng lượng cho không gian',
      'Vòng Tay': 'Mang theo năng lượng bên mình',
    },
  },

  // Khói Xám / Hematite (Protection/Grounding) → pairs with
  'Khói Xám': {
    primary: ['Khói Xám'],
    upsells: ['Hematite', 'Thạch Anh Trắng', 'Set'],
    reason: {
      'Hematite': 'Tăng cường bảo vệ',
      'Thạch Anh Trắng': 'Thanh lọc năng lượng tiêu cực',
      'Set': 'Combo bảo vệ toàn diện',
    },
  },

  'Hematite': {
    primary: ['Hematite'],
    upsells: ['Khói Xám', 'Thạch Anh Trắng', 'Vòng Tay'],
    reason: {
      'Khói Xám': 'Đá grounding bổ trợ',
      'Thạch Anh Trắng': 'Cân bằng năng lượng',
      'Vòng Tay': 'Bảo vệ cá nhân 24/7',
    },
  },

  // Vòng Tay (Bracelet) → general upsells
  'Vòng Tay': {
    primary: ['Vòng Tay'],
    upsells: ['Trụ', 'Set', 'Tinh dầu nước hoa Jérie'],
    reason: {
      'Trụ': 'Đặt trong nhà để hỗ trợ',
      'Set': 'Combo nhiều viên đeo luân phiên',
      'Tinh dầu nước hoa Jérie': 'Nước hoa năng lượng đi kèm',
    },
  },

  // Trụ (Tower) → general upsells
  'Trụ': {
    primary: ['Trụ'],
    upsells: ['Cụm', 'Vòng Tay', 'Set'],
    reason: {
      'Cụm': 'Kết hợp với cụm để tăng năng lượng phòng',
      'Vòng Tay': 'Mang theo năng lượng bên mình',
      'Set': 'Combo phong thủy full bộ',
    },
  },

  // Cụm (Cluster) → general upsells
  'Cụm': {
    primary: ['Cụm'],
    upsells: ['Trụ', 'Vòng Tay', 'Special set'],
    reason: {
      'Trụ': 'Kết hợp để tối ưu năng lượng không gian',
      'Vòng Tay': 'Đeo theo người',
      'Special set': 'Bộ sưu tập đặc biệt',
    },
  },

  // Set → upsell individual high-value items
  'Set': {
    primary: ['Set', 'Special set'],
    upsells: ['Trụ', 'Cây Tài Lộc', 'Tinh dầu nước hoa Jérie'],
    reason: {
      'Trụ': 'Thêm trụ làm điểm nhấn',
      'Cây Tài Lộc': 'Bổ sung cây tài lộc cho không gian',
      'Tinh dầu nước hoa Jérie': 'Hoàn thiện với nước hoa năng lượng',
    },
  },

  // Tinh dầu (Perfume) → crystal upsells
  'Tinh dầu nước hoa Jérie': {
    primary: ['Tinh dầu nước hoa Jérie'],
    upsells: ['Thạch Anh Hồng', 'Thạch Anh Tím', 'Vòng Tay'],
    reason: {
      'Thạch Anh Hồng': 'Combo tình yêu hoàn hảo',
      'Thạch Anh Tím': 'Combo thiền định và relax',
      'Vòng Tay': 'Đá đeo theo người',
    },
  },
};

// Default upsells when no specific mapping found
const DEFAULT_UPSELLS = {
  upsells: ['Bestseller', 'Set', 'Vòng Tay'],
  reason: {
    'Bestseller': 'Sản phẩm được yêu thích nhất',
    'Set': 'Tiết kiệm với combo',
    'Vòng Tay': 'Dễ sử dụng hàng ngày',
  },
};

// ========== COMBO DISCOUNT RATES ==========
const COMBO_DISCOUNTS = {
  2: 0.10, // 10% for 2 items
  3: 0.15, // 15% for 3+ items
  4: 0.18, // 18% for 4 items
  5: 0.20, // 20% for 5+ items
};

// Product cache for faster upsell lookups
let productCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get all products with caching
 * @returns {Promise<Array>} All products from Shopify
 */
const getCachedProducts = async () => {
  const now = Date.now();
  if (productCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return productCache;
  }

  try {
    const products = await shopifyService.getProducts({ limit: 100 });
    productCache = products;
    cacheTimestamp = now;
    return products;
  } catch (error) {
    console.error('[CrystalUpsell] Error fetching products:', error);
    return productCache || [];
  }
};

/**
 * Extract product tags as array
 * @param {Object} product - Shopify product
 * @returns {string[]} Array of tags
 */
const getProductTags = (product) => {
  if (!product?.tags) return [];
  if (Array.isArray(product.tags)) return product.tags;
  return product.tags.split(',').map(t => t.trim());
};

/**
 * Check if product has any of the specified tags
 * @param {Object} product - Shopify product
 * @param {string[]} tags - Tags to check
 * @returns {boolean}
 */
const productHasAnyTag = (product, tags) => {
  const productTags = getProductTags(product);
  return tags.some(tag =>
    productTags.some(pt => pt.toLowerCase() === tag.toLowerCase())
  );
};

/**
 * Get upsell suggestions for a product
 * @param {Object} primaryProduct - The product being purchased
 * @param {number} limit - Max number of upsells to return
 * @returns {Promise<Object>} Upsell suggestions with reasons
 */
export const getUpsellSuggestions = async (primaryProduct, limit = 3) => {
  try {
    // Get cached products
    const allProducts = await getCachedProducts();

    // Find matching upsell config based on product tags
    const primaryTags = getProductTags(primaryProduct);
    let upsellConfig = null;
    let matchedTag = null;

    // Find the first matching tag in CRYSTAL_UPSELL_MAP
    for (const tag of primaryTags) {
      if (CRYSTAL_UPSELL_MAP[tag]) {
        upsellConfig = CRYSTAL_UPSELL_MAP[tag];
        matchedTag = tag;
        break;
      }
    }

    // Use default if no specific mapping
    if (!upsellConfig) {
      upsellConfig = DEFAULT_UPSELLS;
      matchedTag = 'default';
    }

    console.log('[CrystalUpsell] Primary product:', primaryProduct.title);
    console.log('[CrystalUpsell] Matched tag:', matchedTag);
    console.log('[CrystalUpsell] Upsell tags:', upsellConfig.upsells);

    // Find products matching upsell tags (excluding the primary product)
    const upsellProducts = allProducts.filter(product => {
      // Skip same product
      if (product.id === primaryProduct.id) return false;

      // Check if product has any upsell tags
      return productHasAnyTag(product, upsellConfig.upsells);
    });

    // Sort by relevance (bestsellers first)
    const sortedUpsells = upsellProducts.sort((a, b) => {
      const aIsBestseller = productHasAnyTag(a, ['Bestseller', 'Hot Product']);
      const bIsBestseller = productHasAnyTag(b, ['Bestseller', 'Hot Product']);
      if (aIsBestseller && !bIsBestseller) return -1;
      if (!aIsBestseller && bIsBestseller) return 1;
      return 0;
    });

    // Take limited results
    const results = sortedUpsells.slice(0, limit);

    // Add reason to each upsell
    const upsellsWithReasons = results.map(product => {
      const productTags = getProductTags(product);
      let reason = 'Sản phẩm bổ trợ hoàn hảo';

      // Find matching reason
      for (const tag of productTags) {
        if (upsellConfig.reason && upsellConfig.reason[tag]) {
          reason = upsellConfig.reason[tag];
          break;
        }
      }

      return {
        ...product,
        upsellReason: reason,
      };
    });

    return {
      primaryProduct,
      matchedTag,
      upsells: upsellsWithReasons,
      comboDiscount: getComboDiscount(1 + results.length),
    };
  } catch (error) {
    console.error('[CrystalUpsell] Error getting upsells:', error);
    return {
      primaryProduct,
      upsells: [],
      comboDiscount: 0,
    };
  }
};

/**
 * Get combo discount rate based on number of items
 * @param {number} itemCount - Number of items in cart
 * @returns {number} Discount rate (0-1)
 */
export const getComboDiscount = (itemCount) => {
  if (itemCount >= 5) return COMBO_DISCOUNTS[5];
  if (itemCount >= 4) return COMBO_DISCOUNTS[4];
  if (itemCount >= 3) return COMBO_DISCOUNTS[3];
  if (itemCount >= 2) return COMBO_DISCOUNTS[2];
  return 0;
};

/**
 * Calculate discounted total for cart items
 * @param {Array} cartItems - Items in cart with price
 * @returns {Object} Total, discount, and final price
 */
export const calculateComboTotal = (cartItems) => {
  if (!cartItems || cartItems.length === 0) {
    return { subtotal: 0, discount: 0, total: 0, discountPercent: 0 };
  }

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.price || item.variants?.[0]?.price || 0);
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);

  // Get total item count
  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Get discount rate
  const discountRate = getComboDiscount(totalItems);
  const discount = subtotal * discountRate;
  const total = subtotal - discount;

  return {
    subtotal,
    discount,
    total,
    discountPercent: discountRate * 100,
    itemCount: totalItems,
  };
};

/**
 * Format price for display
 * @param {number} amount - Price amount
 * @returns {string} Formatted price (e.g., "3.690.000đ")
 */
export const formatPrice = (amount) => {
  if (!amount && amount !== 0) return 'Liên hệ';
  const num = parseFloat(amount);
  if (isNaN(num)) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
};

/**
 * Get upsell message based on context
 * @param {Object} primaryProduct - Primary product
 * @param {Array} upsells - Upsell products
 * @returns {string} Vietnamese upsell message
 */
export const getUpsellMessage = (primaryProduct, upsells = []) => {
  if (upsells.length === 0) {
    return null;
  }

  const upsellNames = upsells.slice(0, 2).map(p => p.title).join(' và ');
  const discount = getComboDiscount(1 + upsells.length) * 100;

  return `Kết hợp với ${upsellNames} để tăng hiệu quả! Mua combo giảm ${discount}%`;
};

/**
 * Clear product cache (call when products are updated)
 */
export const clearCache = () => {
  productCache = null;
  cacheTimestamp = 0;
};

export default {
  getUpsellSuggestions,
  getComboDiscount,
  calculateComboTotal,
  formatPrice,
  getUpsellMessage,
  clearCache,
  CRYSTAL_UPSELL_MAP,
  COMBO_DISCOUNTS,
};
