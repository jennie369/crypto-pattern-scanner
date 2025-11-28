/**
 * Gemral - Shopify Helper Functions
 * Utilities for handling Shopify Global ID format
 */

/**
 * Convert Shopify numeric ID to Global ID format
 * Shopify GraphQL API requires: gid://shopify/{Type}/{id}
 *
 * @param {string|number} id - Numeric ID or Global ID
 * @param {string} type - Resource type (ProductVariant, Product, Collection, etc.)
 * @returns {string} Global ID format
 *
 * @example
 * toShopifyGlobalId('46053166645425', 'ProductVariant')
 * // Returns: 'gid://shopify/ProductVariant/46053166645425'
 */
export const toShopifyGlobalId = (id, type = 'ProductVariant') => {
  if (!id) {
    console.warn('[ShopifyHelpers] toShopifyGlobalId called with null/undefined id');
    return null;
  }

  // Convert to string
  const idStr = String(id);

  // If already Global ID, return as is
  if (idStr.startsWith('gid://shopify/')) {
    return idStr;
  }

  // Convert to Global ID
  return `gid://shopify/${type}/${idStr}`;
};

/**
 * Extract numeric ID from Shopify Global ID
 *
 * @param {string} globalId - Global ID format
 * @returns {string} Numeric ID
 *
 * @example
 * fromShopifyGlobalId('gid://shopify/ProductVariant/46053166645425')
 * // Returns: '46053166645425'
 */
export const fromShopifyGlobalId = (globalId) => {
  if (!globalId) {
    return null;
  }

  // If not Global ID, return as is
  if (!String(globalId).startsWith('gid://shopify/')) {
    return globalId;
  }

  // Extract numeric ID (last part after /)
  const parts = String(globalId).split('/');
  return parts[parts.length - 1];
};

/**
 * Validate if string is valid Shopify Global ID
 *
 * @param {string} id - ID to validate
 * @returns {boolean}
 */
export const isShopifyGlobalId = (id) => {
  if (!id || typeof id !== 'string') {
    return false;
  }

  return id.startsWith('gid://shopify/');
};

/**
 * Get resource type from Global ID
 *
 * @param {string} globalId - Global ID format
 * @returns {string|null} Resource type or null if not valid Global ID
 *
 * @example
 * getShopifyResourceType('gid://shopify/ProductVariant/46053166645425')
 * // Returns: 'ProductVariant'
 */
export const getShopifyResourceType = (globalId) => {
  if (!isShopifyGlobalId(globalId)) {
    return null;
  }

  const parts = globalId.split('/');
  // Format: gid://shopify/{Type}/{id}
  // Index:    0   1       2      3
  return parts[3] || null;
};

/**
 * Shopify resource types enum
 */
export const SHOPIFY_RESOURCE_TYPES = {
  PRODUCT: 'Product',
  PRODUCT_VARIANT: 'ProductVariant',
  COLLECTION: 'Collection',
  CUSTOMER: 'Customer',
  ORDER: 'Order',
  CART: 'Cart',
  CART_LINE: 'CartLine',
  CHECKOUT: 'Checkout',
  CHECKOUT_LINE_ITEM: 'CheckoutLineItem',
};

/**
 * Format price for display
 *
 * @param {number|string} price - Price value
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted price string
 */
export const formatShopifyPrice = (price, currency = 'USD') => {
  const numPrice = parseFloat(price) || 0;

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numPrice);
};

export default {
  toShopifyGlobalId,
  fromShopifyGlobalId,
  isShopifyGlobalId,
  getShopifyResourceType,
  formatShopifyPrice,
  SHOPIFY_RESOURCE_TYPES,
};
