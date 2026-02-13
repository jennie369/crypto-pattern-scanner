/**
 * Product Recommendation Service
 * Manages product recommendations in lessons with Shopify integration
 *
 * Features:
 * - Fetch products from Shopify
 * - Create/update/delete product recommendations in lessons
 * - Track recommendation clicks and conversions
 * - Generate deeplinks for mobile navigation
 * - Analytics and reporting
 */

import { supabase } from '../lib/supabaseClient';

// =====================================================
// CONSTANTS
// =====================================================

const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN || 'your-store.myshopify.com';
const SHOPIFY_STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

const DISPLAY_STYLES = {
  CARD: 'card',
  INLINE: 'inline',
  BANNER: 'banner',
  GRID: 'grid',
};

const DEEPLINK_SCHEMES = {
  PRODUCT: 'gem://shop/product/',
  COLLECTION: 'gem://shop/collection/',
  CART: 'gem://shop/cart',
};

// =====================================================
// SHOPIFY PRODUCT FETCHING
// =====================================================

/**
 * Fetch products from Shopify Storefront API
 * @param {Object} options - Query options
 * @param {string} options.query - Search query
 * @param {string} options.collection - Collection handle
 * @param {number} options.limit - Number of products
 * @param {string} options.cursor - Pagination cursor
 * @returns {Promise<Object>} Products and pagination info
 */
export const fetchShopifyProducts = async ({
  query = '',
  collection = '',
  productType = '',
  vendor = '',
  limit = 20,
  cursor = null,
} = {}) => {
  try {
    // Build GraphQL query
    let queryFilters = [];
    if (query) queryFilters.push(`title:*${query}*`);
    if (collection) queryFilters.push(`collection:${collection}`);
    if (productType) queryFilters.push(`product_type:${productType}`);
    if (vendor) queryFilters.push(`vendor:${vendor}`);

    const queryString = queryFilters.length > 0 ? queryFilters.join(' AND ') : '';

    const graphqlQuery = `
      query GetProducts($first: Int!, $query: String, $after: String) {
        products(first: $first, query: $query, after: $after) {
          edges {
            cursor
            node {
              id
              handle
              title
              description
              vendor
              productType
              tags
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
              compareAtPriceRange {
                minVariantPrice {
                  amount
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    price {
                      amount
                      currencyCode
                    }
                    compareAtPrice {
                      amount
                    }
                  }
                }
              }
              availableForSale
              totalInventory
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `;

    const response = await fetch(
      `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: {
            first: limit,
            query: queryString || null,
            after: cursor,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.errors) {
      console.error('Shopify GraphQL errors:', data.errors);
      throw new Error(data.errors[0]?.message || 'Failed to fetch products');
    }

    // Transform products to our format
    const products = data.data.products.edges.map(({ node, cursor }) => ({
      id: node.id.replace('gid://shopify/Product/', ''),
      shopifyId: node.id,
      handle: node.handle,
      title: node.title,
      description: node.description,
      vendor: node.vendor,
      productType: node.productType,
      tags: node.tags,
      imageUrl: node.images.edges[0]?.node?.url || null,
      imageAlt: node.images.edges[0]?.node?.altText || node.title,
      price: parseFloat(node.priceRange.minVariantPrice.amount),
      compareAtPrice: node.compareAtPriceRange?.minVariantPrice?.amount
        ? parseFloat(node.compareAtPriceRange.minVariantPrice.amount)
        : null,
      currency: node.priceRange.minVariantPrice.currencyCode,
      available: node.availableForSale,
      inventory: node.totalInventory,
      cursor,
      deeplink: `${DEEPLINK_SCHEMES.PRODUCT}${node.handle}`,
    }));

    return {
      products,
      pageInfo: data.data.products.pageInfo,
      totalCount: products.length,
    };
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    throw error;
  }
};

/**
 * Fetch a single product by handle
 * @param {string} handle - Product handle
 * @returns {Promise<Object>} Product details
 */
export const fetchProductByHandle = async (handle) => {
  try {
    const graphqlQuery = `
      query GetProduct($handle: String!) {
        product(handle: $handle) {
          id
          handle
          title
          description
          descriptionHtml
          vendor
          productType
          tags
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          availableForSale
        }
      }
    `;

    const response = await fetch(
      `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: { handle },
        }),
      }
    );

    const data = await response.json();

    if (data.errors || !data.data.product) {
      throw new Error('Product not found');
    }

    const product = data.data.product;
    return {
      id: product.id.replace('gid://shopify/Product/', ''),
      shopifyId: product.id,
      handle: product.handle,
      title: product.title,
      description: product.description,
      descriptionHtml: product.descriptionHtml,
      vendor: product.vendor,
      productType: product.productType,
      tags: product.tags,
      images: product.images.edges.map(e => ({
        url: e.node.url,
        alt: e.node.altText,
      })),
      imageUrl: product.images.edges[0]?.node?.url || null,
      price: parseFloat(product.priceRange.minVariantPrice.amount),
      compareAtPrice: product.compareAtPriceRange?.minVariantPrice?.amount
        ? parseFloat(product.compareAtPriceRange.minVariantPrice.amount)
        : null,
      currency: product.priceRange.minVariantPrice.currencyCode,
      variants: product.variants.edges.map(e => ({
        id: e.node.id,
        title: e.node.title,
        price: parseFloat(e.node.price.amount),
        compareAtPrice: e.node.compareAtPrice?.amount
          ? parseFloat(e.node.compareAtPrice.amount)
          : null,
        available: e.node.availableForSale,
        options: e.node.selectedOptions,
      })),
      available: product.availableForSale,
      deeplink: `${DEEPLINK_SCHEMES.PRODUCT}${product.handle}`,
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

/**
 * Fetch product collections
 * @param {number} limit - Number of collections
 * @returns {Promise<Array>} Collections list
 */
export const fetchCollections = async (limit = 50) => {
  try {
    const graphqlQuery = `
      query GetCollections($first: Int!) {
        collections(first: $first) {
          edges {
            node {
              id
              handle
              title
              description
              image {
                url
              }
              productsCount {
                count
              }
            }
          }
        }
      }
    `;

    const response = await fetch(
      `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: { first: limit },
        }),
      }
    );

    const data = await response.json();

    return data.data.collections.edges.map(({ node }) => ({
      id: node.id,
      handle: node.handle,
      title: node.title,
      description: node.description,
      imageUrl: node.image?.url,
      productCount: node.productsCount?.count || 0,
    }));
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
};

// =====================================================
// LESSON PRODUCT RECOMMENDATIONS CRUD
// =====================================================

/**
 * Get recommendations for a lesson
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Array>} Recommendations
 */
export const getRecommendations = async (lessonId) => {
  try {
    const { data, error } = await supabase
      .from('lesson_product_recommendations')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
};

/**
 * Create a product recommendation
 * @param {Object} recommendation - Recommendation data
 * @returns {Promise<Object>} Created recommendation
 */
export const createRecommendation = async (recommendation) => {
  try {
    // Validate required fields
    if (!recommendation.lesson_id) throw new Error('Lesson ID is required');
    if (!recommendation.product_id) throw new Error('Product ID is required');
    if (!recommendation.product_handle) throw new Error('Product handle is required');
    if (!recommendation.product_title) throw new Error('Product title is required');

    const { data, error } = await supabase
      .from('lesson_product_recommendations')
      .insert({
        lesson_id: recommendation.lesson_id,
        product_id: recommendation.product_id,
        product_handle: recommendation.product_handle,
        product_title: recommendation.product_title,
        product_image_url: recommendation.product_image_url,
        product_price: recommendation.product_price,
        product_compare_price: recommendation.product_compare_price,
        product_currency: recommendation.product_currency || 'VND',
        product_vendor: recommendation.product_vendor,
        product_type: recommendation.product_type,
        display_order: recommendation.display_order || 0,
        display_style: recommendation.display_style || 'card',
        custom_cta_text: recommendation.custom_cta_text,
        custom_description: recommendation.custom_description,
        show_price: recommendation.show_price !== false,
        show_discount_badge: recommendation.show_discount_badge !== false,
        is_featured: recommendation.is_featured || false,
        position_in_content: recommendation.position_in_content,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating recommendation:', error);
    throw error;
  }
};

/**
 * Update a product recommendation
 * @param {string} id - Recommendation ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated recommendation
 */
export const updateRecommendation = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('lesson_product_recommendations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating recommendation:', error);
    throw error;
  }
};

/**
 * Delete a product recommendation
 * @param {string} id - Recommendation ID
 * @returns {Promise<boolean>} Success
 */
export const deleteRecommendation = async (id) => {
  try {
    const { error } = await supabase
      .from('lesson_product_recommendations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    throw error;
  }
};

/**
 * Reorder recommendations
 * @param {string} lessonId - Lesson ID
 * @param {Array} orderedIds - Array of IDs in new order
 * @returns {Promise<boolean>} Success
 */
export const reorderRecommendations = async (lessonId, orderedIds) => {
  try {
    const updates = orderedIds.map((id, index) => ({
      id,
      display_order: index,
    }));

    for (const update of updates) {
      await supabase
        .from('lesson_product_recommendations')
        .update({ display_order: update.display_order })
        .eq('id', update.id);
    }

    return true;
  } catch (error) {
    console.error('Error reordering recommendations:', error);
    throw error;
  }
};

// =====================================================
// CLICK TRACKING & ANALYTICS
// =====================================================

/**
 * Track a recommendation click
 * @param {string} recommendationId - Recommendation ID
 * @param {Object} metadata - Click metadata
 * @returns {Promise<string>} Click ID
 */
export const trackClick = async (recommendationId, metadata = {}) => {
  try {
    const { data, error } = await supabase.rpc('track_product_recommendation_click', {
      p_recommendation_id: recommendationId,
      p_device_type: metadata.deviceType || null,
      p_session_id: metadata.sessionId || null,
      p_click_source: metadata.source || 'lesson',
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error tracking click:', error);
    // Don't throw - tracking failures shouldn't break UX
    return null;
  }
};

/**
 * Mark a click as converted to purchase
 * @param {string} clickId - Click ID
 * @param {number} orderAmount - Order amount
 * @returns {Promise<boolean>} Success
 */
export const markConverted = async (clickId, orderAmount) => {
  try {
    const { data, error } = await supabase.rpc('mark_recommendation_converted', {
      p_click_id: clickId,
      p_order_amount: orderAmount,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error marking conversion:', error);
    return false;
  }
};

/**
 * Get recommendation analytics
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Analytics data
 */
export const getAnalytics = async ({
  lessonId = null,
  productId = null,
  startDate = null,
  endDate = null,
} = {}) => {
  try {
    const { data, error } = await supabase.rpc('get_product_recommendation_analytics', {
      p_lesson_id: lessonId,
      p_product_id: productId,
      p_start_date: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      p_end_date: endDate || new Date().toISOString(),
    });

    if (error) throw error;
    return data?.[0] || {
      total_clicks: 0,
      unique_users: 0,
      conversion_count: 0,
      conversion_rate: 0,
      total_revenue: 0,
      top_products: [],
      clicks_by_day: [],
    };
  } catch (error) {
    console.error('Error getting analytics:', error);
    throw error;
  }
};

// =====================================================
// HTML GENERATION
// =====================================================

/**
 * Generate product recommendation HTML
 * @param {Object} product - Product data
 * @param {string} style - Display style
 * @param {Object} options - Additional options
 * @returns {string} HTML string
 */
export const generateRecommendationHtml = (product, style = 'card', options = {}) => {
  const deeplink = `gem://shop/product/${product.handle}`;
  const webUrl = `https://${SHOPIFY_DOMAIN}/products/${product.handle}`;

  // Format price
  const formatPrice = (price, currency = 'VND') => {
    if (!price) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formattedPrice = formatPrice(product.price, product.currency);
  const formattedComparePrice = product.compareAtPrice
    ? formatPrice(product.compareAtPrice, product.currency)
    : '';

  const discountPercent = product.compareAtPrice && product.price < product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  switch (style) {
    case 'banner':
      return `<div class="product-recommend-banner" data-product-id="${product.id}" data-product-handle="${product.handle}" data-deeplink="${deeplink}" data-weburl="${webUrl}" onclick="window.handleProductClick && window.handleProductClick(this)" style="background: linear-gradient(135deg, #6A5BFF, #00F0FF); border-radius: 12px; padding: 1rem; margin: 0.75rem 0; cursor: pointer; position: relative; overflow: hidden;">
  <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
    <div style="flex: 1; min-width: 0;">
      <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.8); margin-bottom: 4px;">🛍️ SẢN PHẨM KHUYÊN DÙNG</div>
      <div style="font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${product.title}</div>
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <span style="background: rgba(0,0,0,0.3); padding: 4px 10px; border-radius: 16px; font-size: 14px; font-weight: 600; color: #FFBD59;">${formattedPrice}</span>
        ${discountPercent > 0 ? `<span style="background: #EF4444; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; color: #fff;">-${discountPercent}%</span>` : ''}
      </div>
    </div>
    <img src="${product.imageUrl || ''}" alt="${product.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); flex-shrink: 0;" onerror="this.style.display='none'" />
  </div>
</div>`;

    case 'inline':
      return `<span class="product-recommend-inline" data-product-id="${product.id}" data-product-handle="${product.handle}" data-deeplink="${deeplink}" data-weburl="${webUrl}" onclick="window.handleProductClick && window.handleProductClick(this)" style="display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, rgba(106, 91, 255, 0.2), rgba(0, 240, 255, 0.1)); padding: 4px 12px; border-radius: 20px; cursor: pointer; color: #00F0FF; font-weight: 500; border: 1px solid rgba(0, 240, 255, 0.3);">🛍️ ${product.title} <span style="color: #FFBD59; font-weight: 600;">${formattedPrice}</span></span>`;

    case 'grid':
      return `<div class="product-recommend-grid-item" data-product-id="${product.id}" data-product-handle="${product.handle}" data-deeplink="${deeplink}" data-weburl="${webUrl}" onclick="window.handleProductClick && window.handleProductClick(this)" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden; cursor: pointer; transition: transform 0.2s ease;">
  <div style="position: relative;">
    <img src="${product.imageUrl || ''}" alt="${product.title}" style="width: 100%; aspect-ratio: 1; object-fit: cover;" onerror="this.parentElement.innerHTML='<div style=\\'width:100%;aspect-ratio:1;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.3);\\'>🖼️</div>'" />
    ${discountPercent > 0 ? `<span style="position: absolute; top: 6px; right: 6px; background: #EF4444; padding: 2px 6px; border-radius: 10px; font-size: 10px; font-weight: 600; color: #fff;">-${discountPercent}%</span>` : ''}
  </div>
  <div style="padding: 8px;">
    <div style="font-size: 12px; font-weight: 600; color: #fff; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${product.title}</div>
    <div style="display: flex; align-items: center; gap: 6px;">
      <span style="font-size: 14px; font-weight: 700; color: #FFBD59;">${formattedPrice}</span>
      ${formattedComparePrice ? `<span style="font-size: 11px; color: rgba(255,255,255,0.4); text-decoration: line-through;">${formattedComparePrice}</span>` : ''}
    </div>
  </div>
</div>`;

    case 'card':
    default:
      return `<div class="product-recommend-card" data-product-id="${product.id}" data-product-handle="${product.handle}" data-deeplink="${deeplink}" data-weburl="${webUrl}" onclick="window.handleProductClick && window.handleProductClick(this)" style="background: linear-gradient(135deg, rgba(106, 91, 255, 0.1), rgba(0, 240, 255, 0.05)); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 0.75rem; margin: 0.75rem 0; cursor: pointer; transition: all 0.2s ease;">
  <div style="display: flex; gap: 12px; align-items: center;">
    <img src="${product.imageUrl || ''}" alt="${product.title}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px; flex-shrink: 0;" onerror="this.outerHTML='<div style=\\'width:70px;height:70px;background:rgba(255,255,255,0.05);border-radius:8px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.3);flex-shrink:0;\\'>🛍️</div>'" />
    <div style="flex: 1; min-width: 0;">
      <div style="font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${product.title}</div>
      ${product.vendor ? `<div style="font-size: 11px; color: rgba(255,255,255,0.5); margin-bottom: 4px;">${product.vendor}</div>` : ''}
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 15px; font-weight: 700; color: #FFBD59;">${formattedPrice}</span>
        ${formattedComparePrice ? `<span style="font-size: 11px; color: rgba(255,255,255,0.4); text-decoration: line-through;">${formattedComparePrice}</span>` : ''}
        ${discountPercent > 0 ? `<span style="background: #EF4444; padding: 1px 6px; border-radius: 10px; font-size: 10px; font-weight: 600; color: #fff;">-${discountPercent}%</span>` : ''}
      </div>
    </div>
    <div style="color: #00F0FF; font-size: 18px; flex-shrink: 0;">→</div>
  </div>
</div>`;
  }
};

/**
 * Generate product grid HTML
 * @param {Array} products - Array of products
 * @param {number} columns - Number of columns (2 or 3)
 * @returns {string} HTML string
 */
export const generateProductGridHtml = (products, columns = 2) => {
  if (!products || products.length === 0) return '';

  const gridItems = products
    .map(p => generateRecommendationHtml(p, 'grid'))
    .join('\n');

  return `<div class="product-recommend-grid" style="display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 10px; margin: 0.75rem 0;">
${gridItems}
</div>`;
};

// =====================================================
// TEMPLATES
// =====================================================

/**
 * Get recommendation templates
 * @returns {Promise<Array>} Templates
 */
export const getTemplates = async () => {
  try {
    const { data, error } = await supabase
      .from('product_recommendation_templates')
      .select('*')
      .eq('is_active', true)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting templates:', error);
    throw error;
  }
};

// =====================================================
// EXPORTS
// =====================================================

export default {
  // Shopify
  fetchShopifyProducts,
  fetchProductByHandle,
  fetchCollections,
  // CRUD
  getRecommendations,
  createRecommendation,
  updateRecommendation,
  deleteRecommendation,
  reorderRecommendations,
  // Tracking
  trackClick,
  markConverted,
  getAnalytics,
  // HTML
  generateRecommendationHtml,
  generateProductGridHtml,
  // Templates
  getTemplates,
  // Constants
  DISPLAY_STYLES,
  DEEPLINK_SCHEMES,
};
