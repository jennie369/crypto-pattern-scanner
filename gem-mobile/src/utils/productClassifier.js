/**
 * Gemral - Product Classifier
 * Phân loại sản phẩm từ Shopify để xác định loại access cần grant
 */

// ============================================================
// TIER PRIORITY - Dùng để so sánh và lấy tier cao hơn
// ============================================================
export const TIER_PRIORITY = {
  free: 0,
  tier_starter: 1,
  tier1: 2,
  tier2: 3,
  tier3: 4,
};

export const SUBSCRIPTION_PRIORITY = {
  free: 0,
  pro: 1,
  premium: 2,
  vip: 3,
};

// ============================================================
// PRODUCT MAPPING - Map product handle → type/tier
// ============================================================
export const PRODUCT_MAPPING = {
  // COMBO TIERS (main subscription)
  'gem-tier1': { type: 'combo', tier: 'tier1' },
  'gem-tier2': { type: 'combo', tier: 'tier2' },
  'gem-tier3': { type: 'combo', tier: 'tier3' },
  'gem-tier-starter': { type: 'combo', tier: 'tier_starter' },

  // SCANNER STANDALONE
  'gem-scanner-pro': { type: 'scanner', tier: 'pro' },
  'scanner-dashboard-premium': { type: 'scanner', tier: 'premium' },
  'scanner-dashboard-vip': { type: 'scanner', tier: 'vip' },

  // CHATBOT SUBSCRIPTIONS
  'yinyang-chatbot-ai-pro': { type: 'chatbot', tier: 'pro' },
  'gem-chatbot-premium': { type: 'chatbot', tier: 'premium' },
  'yinyang-chatbot-ai-vip': { type: 'chatbot', tier: 'vip' },
};

// ============================================================
// CLASSIFY PRODUCT
// ============================================================
/**
 * Phân loại sản phẩm dựa trên line item từ Shopify
 * @param {Object} lineItem - Line item từ Shopify order
 * @returns {Object} { type, tier, handle, title, productId, gems }
 */
export const classifyProduct = (lineItem) => {
  const handle = lineItem?.product?.handle || lineItem?.handle || lineItem?.product_handle || '';
  const sku = lineItem?.sku || '';
  const productId = lineItem?.product_id?.toString() || '';
  const title = lineItem?.title || '';
  const variantTitle = lineItem?.variant_title || '';

  // 1. Check direct mapping first
  if (PRODUCT_MAPPING[handle]) {
    return { ...PRODUCT_MAPPING[handle], handle, title, productId };
  }

  // 2. GEM PACKS - Check before other patterns
  const isGemPack =
    handle.includes('gem-pack') ||
    sku.toLowerCase().startsWith('gem-pack') ||
    title.toLowerCase().includes('gem pack') ||
    /\d+\s*\+\s*\d+\s*bonus/i.test(title) ||
    /(\d+)\s*gems?/i.test(title);

  if (isGemPack) {
    const gems = extractGemQuantity(lineItem);
    return {
      type: 'gem_pack',
      isDigital: true,
      handle,
      title,
      productId,
      gems,
      confidence: 1,
    };
  }

  // 3. Pattern matching - Combo tiers
  if (handle.includes('gem-tier') || sku.startsWith('TIER-')) {
    const tierMatch = handle.match(/tier-?(\d|starter)/i);
    if (tierMatch) {
      const tierNum = tierMatch[1].toLowerCase();
      const tier = tierNum === 'starter' ? 'tier_starter' : `tier${tierNum}`;
      return { type: 'combo', tier, handle, title, productId };
    }
  }

  // 4. Scanner products
  if (handle.includes('scanner')) {
    if (handle.includes('vip')) {
      return { type: 'scanner', tier: 'vip', handle, title, productId };
    }
    if (handle.includes('premium')) {
      return { type: 'scanner', tier: 'premium', handle, title, productId };
    }
    if (handle.includes('pro')) {
      return { type: 'scanner', tier: 'pro', handle, title, productId };
    }
  }

  // 5. Chatbot products
  if (handle.includes('chatbot')) {
    if (handle.includes('vip')) {
      return { type: 'chatbot', tier: 'vip', handle, title, productId };
    }
    if (handle.includes('premium')) {
      return { type: 'chatbot', tier: 'premium', handle, title, productId };
    }
    if (handle.includes('pro')) {
      return { type: 'chatbot', tier: 'pro', handle, title, productId };
    }
  }

  // 6. Courses
  if (handle.includes('khoa-hoc') || handle.includes('course')) {
    return { type: 'course', handle, title, productId };
  }

  // 7. Default: Physical product
  return { type: 'physical', handle, title, productId };
};

// ============================================================
// EXTRACT GEM QUANTITY
// ============================================================
/**
 * Extract gem quantity from product/line item
 * @param {Object} item - Product or line item
 * @returns {number} - Gem quantity
 */
export const extractGemQuantity = (item) => {
  if (!item) return 0;

  const sku = item.sku || '';
  const title = item.title || item.name || '';
  const variantTitle = item.variant_title || '';

  // Priority 1: SKU pattern "gem-pack-500"
  const skuMatch = sku.match(/gem-pack-(\d+)/i);
  if (skuMatch) {
    return parseInt(skuMatch[1], 10);
  }

  // Priority 2: Bonus pattern "5000 + 1000 Bonus"
  const bonusMatch = title.match(/(\d[\d,]*)\s*\+\s*(\d[\d,]*)\s*bonus/i);
  if (bonusMatch) {
    const base = parseInt(bonusMatch[1].replace(/,/g, ''), 10);
    const bonus = parseInt(bonusMatch[2].replace(/,/g, ''), 10);
    return base + bonus;
  }

  // Priority 3: Simple pattern "100 Gems"
  const simpleMatch = title.match(/(\d[\d,]*)\s*gems?/i);
  if (simpleMatch) {
    return parseInt(simpleMatch[1].replace(/,/g, ''), 10);
  }

  // Priority 4: Check variant title
  if (variantTitle) {
    const variantMatch = variantTitle.match(/(\d[\d,]*)\s*gems?/i);
    if (variantMatch) {
      return parseInt(variantMatch[1].replace(/,/g, ''), 10);
    }
  }

  return 0;
};

/**
 * Check if product is a gem pack
 * @param {Object} item - Product or line item
 * @returns {boolean}
 */
export const isGemPack = (item) => {
  const classification = classifyProduct(item);
  return classification.type === 'gem_pack';
};

// ============================================================
// TIER COMPARISON HELPERS
// ============================================================
/**
 * So sánh và trả về tier cao hơn (dùng cho combo tier)
 * @param {string} current - Tier hiện tại
 * @param {string} newTier - Tier mới
 * @returns {string} Tier cao hơn
 */
export const getHigherTier = (current, newTier) => {
  const currentPriority = TIER_PRIORITY[current] || 0;
  const newPriority = TIER_PRIORITY[newTier] || 0;
  return newPriority > currentPriority ? newTier : current;
};

/**
 * So sánh và trả về subscription cao hơn (dùng cho scanner/chatbot)
 * @param {string} current - Subscription hiện tại
 * @param {string} newTier - Subscription mới
 * @returns {string} Subscription cao hơn
 */
export const getHigherSubscription = (current, newTier) => {
  const currentPriority = SUBSCRIPTION_PRIORITY[current] || 0;
  const newPriority = SUBSCRIPTION_PRIORITY[newTier] || 0;
  return newPriority > currentPriority ? newTier : current;
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
/**
 * Kiểm tra sản phẩm có phải digital hay không
 * @param {Object} classification - Kết quả từ classifyProduct
 * @returns {boolean}
 */
export const isDigitalProduct = (classification) => {
  return ['combo', 'scanner', 'chatbot', 'course', 'gem_pack'].includes(classification?.type);
};

/**
 * Lấy label tiếng Việt cho product type
 * @param {string} type - Product type
 * @returns {string}
 */
export const getProductTypeLabel = (type) => {
  const labels = {
    combo: 'Gói thành viên',
    scanner: 'Scanner Dashboard',
    chatbot: 'Gem Chatbot',
    course: 'Khóa học',
    gem_pack: 'Gói Gems',
    physical: 'Sản phẩm vật lý',
  };
  return labels[type] || 'Sản phẩm';
};

/**
 * Lấy label tiếng Việt cho tier
 * @param {string} tier - Tier name
 * @returns {string}
 */
export const getTierLabel = (tier) => {
  const labels = {
    free: 'Miễn phí',
    tier_starter: 'Starter',
    tier1: 'Tier 1',
    tier2: 'Tier 2',
    tier3: 'Tier 3',
    pro: 'Pro',
    premium: 'Premium',
    vip: 'VIP',
  };
  return labels[tier] || tier;
};

export default {
  TIER_PRIORITY,
  SUBSCRIPTION_PRIORITY,
  PRODUCT_MAPPING,
  classifyProduct,
  extractGemQuantity,
  isGemPack,
  getHigherTier,
  getHigherSubscription,
  isDigitalProduct,
  getProductTypeLabel,
  getTierLabel,
};
