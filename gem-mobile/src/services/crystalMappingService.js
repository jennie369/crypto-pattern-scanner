/**
 * Crystal Mapping Service
 * Maps reading results to ACTUAL Shopify products
 * KHÔNG hardcode fake crystals như Lepidolite, Amazonite
 */

import shopifyService from './shopifyService';

// ACTUAL crystals available in Shopify store
// These are the ONLY valid crystal types
const VALID_SHOPIFY_CRYSTAL_TAGS = {
  // Vietnamese names → Shopify tags
  'thạch anh tím': 'Thạch Anh Tím',
  'amethyst': 'Thạch Anh Tím',
  'tím': 'Thạch Anh Tím',

  'thạch anh hồng': 'Thạch Anh Hồng',
  'rose quartz': 'Thạch Anh Hồng',
  'hồng': 'Thạch Anh Hồng',

  'thạch anh vàng': 'Thạch Anh Vàng',
  'citrine': 'Thạch Anh Vàng',
  'vàng': 'Thạch Anh Vàng',

  'thạch anh trắng': 'Thạch Anh Trắng',
  'clear quartz': 'Thạch Anh Trắng',
  'trắng': 'Thạch Anh Trắng',

  'thạch anh khói': 'Khói Xám',
  'smoky quartz': 'Khói Xám',

  'hematite': 'Hematite',
  'aquamarine': 'Aquamarine',
};

// Purpose-based recommendations
const PURPOSE_TO_TAGS = {
  // Tarot card meanings → Crystal tags
  'love': ['Thạch Anh Hồng'],
  'tình yêu': ['Thạch Anh Hồng'],
  'relationships': ['Thạch Anh Hồng'],

  'wealth': ['Thạch Anh Vàng', 'Cây Tài Lộc'],
  'tiền bạc': ['Thạch Anh Vàng', 'Cây Tài Lộc'],
  'tài lộc': ['Thạch Anh Vàng', 'Cây Tài Lộc'],
  'prosperity': ['Thạch Anh Vàng'],

  'spiritual': ['Thạch Anh Tím'],
  'tâm linh': ['Thạch Anh Tím'],
  'intuition': ['Thạch Anh Tím'],
  'meditation': ['Thạch Anh Tím', 'Thạch Anh Trắng'],
  'thiền': ['Thạch Anh Tím', 'Thạch Anh Trắng'],

  'protection': ['Hematite', 'Khói Xám'],
  'bảo vệ': ['Hematite', 'Khói Xám'],
  'grounding': ['Khói Xám', 'Hematite'],

  'clarity': ['Thạch Anh Trắng'],
  'rõ ràng': ['Thạch Anh Trắng'],
  'healing': ['Thạch Anh Hồng', 'Thạch Anh Trắng'],
};

/**
 * Extract Shopify tags from reading interpretation
 * @param {string} interpretation - AI interpretation text
 * @returns {string[]} Valid Shopify tags
 */
export const extractCrystalTags = (interpretation) => {
  if (!interpretation) return [];

  const lowerText = interpretation.toLowerCase();
  const tags = new Set();

  // Check for crystal mentions
  for (const [keyword, tag] of Object.entries(VALID_SHOPIFY_CRYSTAL_TAGS)) {
    if (lowerText.includes(keyword)) {
      tags.add(tag);
    }
  }

  // Check for purpose mentions
  for (const [keyword, purposeTags] of Object.entries(PURPOSE_TO_TAGS)) {
    if (lowerText.includes(keyword)) {
      purposeTags.forEach(t => tags.add(t));
    }
  }

  const result = Array.from(tags);
  console.log('[CrystalMapping] Extracted tags:', result);

  // If no tags found, return bestsellers tag
  return result.length > 0 ? result : ['Bestseller'];
};

/**
 * Get REAL crystal products from Shopify
 * @param {string} interpretation - Reading interpretation
 * @param {number} limit - Max products
 * @returns {Promise<Array>} Products with images
 */
export const getCrystalProducts = async (interpretation, limit = 4) => {
  try {
    const tags = extractCrystalTags(interpretation);

    console.log('[CrystalMapping] Fetching products with tags:', tags);

    // Use shopifyService to get REAL products
    let products = await shopifyService.getProductsByTags(tags, limit, true);

    // Ensure products have images
    products = products.filter(p => {
      // Check for image in multiple places
      const hasImage = p.image ||
                       p.images?.[0]?.src ||
                       p.featuredImage?.url;
      return hasImage;
    });

    // Normalize image field
    products = products.map(p => ({
      ...p,
      image: p.image || p.images?.[0]?.src || p.featuredImage?.url || null,
    }));

    console.log('[CrystalMapping] Found products:', products.length);

    // If not enough, get bestsellers
    if (products.length < limit) {
      const more = await shopifyService.getBestsellers(limit - products.length);
      const existingIds = new Set(products.map(p => p.id));
      for (const p of more) {
        if (!existingIds.has(p.id)) {
          products.push({
            ...p,
            image: p.image || p.images?.[0]?.src || null,
          });
        }
      }
    }

    return products.slice(0, limit);

  } catch (error) {
    console.error('[CrystalMapping] Error:', error);
    return [];
  }
};

/**
 * LEGACY FAKE DATA - DO NOT USE
 * These crystals are NOT in Shopify store:
 * - Lepidolite
 * - Amazonite
 * - Mã Não Xanh (Blue Lace Agate)
 * - Selenite
 * - Black Tourmaline
 *
 * Use getCrystalProducts() instead!
 */

export default {
  extractCrystalTags,
  getCrystalProducts,
  VALID_SHOPIFY_CRYSTAL_TAGS,
};
