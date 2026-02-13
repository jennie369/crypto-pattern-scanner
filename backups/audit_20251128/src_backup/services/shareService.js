/**
 * Gemral - Share Service
 * Feature #9: Share to External Apps
 * Handles sharing posts to external platforms
 */

import { Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

// App deep link base URL
const APP_SCHEME = 'gem://';
const WEB_BASE_URL = 'https://gem.app';

/**
 * Generate a shareable link for a post
 * @param {string} postId - Post ID
 * @returns {object} { deepLink, webLink }
 */
export const generatePostLinks = (postId) => {
  return {
    deepLink: `${APP_SCHEME}post/${postId}`,
    webLink: `${WEB_BASE_URL}/post/${postId}`,
  };
};

/**
 * Generate share content for a post
 * @param {object} post - Post object
 * @returns {object} { title, message, url }
 */
export const generateShareContent = (post) => {
  const links = generatePostLinks(post.id);

  // Create a preview message
  const previewText = post.content?.substring(0, 100) || '';
  const authorName = post.author?.full_name || 'Someone';

  return {
    title: `${authorName} on GEM`,
    message: previewText
      ? `${previewText}${previewText.length >= 100 ? '...' : ''}\n\n`
      : '',
    url: links.webLink,
  };
};

/**
 * Share post using native share dialog
 * @param {object} post - Post object
 * @returns {Promise<object>} Share result
 */
export const sharePost = async (post) => {
  try {
    const content = generateShareContent(post);

    const shareOptions = {
      title: content.title,
      message: Platform.OS === 'ios'
        ? content.message
        : `${content.message}${content.url}`,
      url: Platform.OS === 'ios' ? content.url : undefined,
    };

    const result = await Share.share(shareOptions);

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        console.log('[Share] Shared via:', result.activityType);
        return { success: true, platform: result.activityType };
      }
      return { success: true };
    } else if (result.action === Share.dismissedAction) {
      return { success: false, dismissed: true };
    }

    return { success: false };
  } catch (error) {
    console.error('[Share] Error sharing post:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Copy post link to clipboard
 * @param {string} postId - Post ID
 * @returns {Promise<boolean>}
 */
export const copyPostLink = async (postId) => {
  try {
    const links = generatePostLinks(postId);
    await Clipboard.setStringAsync(links.webLink);
    console.log('[Share] Link copied to clipboard');
    return true;
  } catch (error) {
    console.error('[Share] Error copying link:', error);
    return false;
  }
};

/**
 * Share to specific platforms (when available)
 */
export const shareToWhatsApp = async (post) => {
  const content = generateShareContent(post);
  const text = encodeURIComponent(`${content.message}${content.url}`);
  const whatsappUrl = `whatsapp://send?text=${text}`;

  // Note: You'd use Linking.openURL(whatsappUrl) in the component
  return whatsappUrl;
};

export const shareToTelegram = async (post) => {
  const content = generateShareContent(post);
  const text = encodeURIComponent(`${content.message}${content.url}`);
  const telegramUrl = `tg://msg?text=${text}`;

  return telegramUrl;
};

export const shareToMessenger = async (post) => {
  const links = generatePostLinks(post.id);
  const messengerUrl = `fb-messenger://share?link=${encodeURIComponent(links.webLink)}`;

  return messengerUrl;
};

/**
 * Share image/media from post
 * @param {string} imageUrl - Image URL
 * @returns {Promise<object>}
 */
export const shareImage = async (imageUrl) => {
  try {
    // For sharing images, you'd typically need to:
    // 1. Download the image to local cache
    // 2. Share using the local file URI
    // This is a simplified version

    const shareOptions = {
      title: 'Share Image',
      url: imageUrl,
    };

    const result = await Share.share(shareOptions);
    return { success: result.action === Share.sharedAction };
  } catch (error) {
    console.error('[Share] Error sharing image:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Parse deep link and extract post ID
 * @param {string} url - Deep link URL
 * @returns {object|null} { type, id }
 */
export const parseDeepLink = (url) => {
  if (!url) return null;

  // Handle gem:// scheme
  if (url.startsWith(APP_SCHEME)) {
    const path = url.replace(APP_SCHEME, '');
    const parts = path.split('/');

    if (parts[0] === 'post' && parts[1]) {
      return { type: 'post', id: parts[1] };
    }
    if (parts[0] === 'user' && parts[1]) {
      return { type: 'user', id: parts[1] };
    }
    if (parts[0] === 'sound' && parts[1]) {
      return { type: 'sound', id: parts[1] };
    }
  }

  // Handle https://gem.app scheme
  if (url.startsWith(WEB_BASE_URL)) {
    const path = url.replace(WEB_BASE_URL, '');
    const parts = path.split('/').filter(Boolean);

    if (parts[0] === 'post' && parts[1]) {
      return { type: 'post', id: parts[1] };
    }
    if (parts[0] === 'user' && parts[1]) {
      return { type: 'user', id: parts[1] };
    }
  }

  return null;
};

// ========================================
// AFFILIATE LINK SHARING
// ========================================

const AFFILIATE_BASE_URL = 'https://gemral.com';

/**
 * Generate affiliate referral link
 * @param {string} referralCode - User's referral code
 * @param {string} productType - Optional product type
 * @returns {string} Referral URL
 */
export const generateAffiliateLink = (referralCode, productType = null) => {
  let link = `${AFFILIATE_BASE_URL}/?ref=${referralCode}`;
  if (productType) {
    link += `&product=${productType}`;
  }
  return link;
};

/**
 * Share affiliate referral link
 * @param {string} referralCode - User's referral code
 * @param {object} options - Options { productType, productName, customMessage }
 * @returns {Promise<object>} Share result
 */
export const shareAffiliateLink = async (referralCode, options = {}) => {
  try {
    const { productType, productName, customMessage } = options;
    const link = generateAffiliateLink(referralCode, productType);

    const defaultMessage = productName
      ? `Tham gia ${productName} cung toi! Dang ky qua link nay de nhan uu dai dac biet:`
      : 'Tham gia Gemral cung toi! Dang ky qua link nay de nhan uu dai:';

    const message = customMessage || defaultMessage;

    const shareOptions = {
      title: 'Chia se link gioi thieu',
      message: Platform.OS === 'ios'
        ? `${message}\n\n`
        : `${message}\n\n${link}`,
      url: Platform.OS === 'ios' ? link : undefined,
    };

    const result = await Share.share(shareOptions);

    if (result.action === Share.sharedAction) {
      console.log('[Share] Affiliate link shared via:', result.activityType);
      return { success: true, platform: result.activityType, link };
    } else if (result.action === Share.dismissedAction) {
      return { success: false, dismissed: true };
    }

    return { success: false };
  } catch (error) {
    console.error('[Share] Error sharing affiliate link:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Copy affiliate link to clipboard
 * @param {string} referralCode - User's referral code
 * @param {string} productType - Optional product type
 * @returns {Promise<object>} { success, link }
 */
export const copyAffiliateLink = async (referralCode, productType = null) => {
  try {
    const link = generateAffiliateLink(referralCode, productType);
    await Clipboard.setStringAsync(link);
    console.log('[Share] Affiliate link copied to clipboard');
    return { success: true, link };
  } catch (error) {
    console.error('[Share] Error copying affiliate link:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Share affiliate link to WhatsApp
 * @param {string} referralCode - User's referral code
 * @param {object} options - Options { productType, productName }
 * @returns {string} WhatsApp URL scheme
 */
export const shareAffiliateToWhatsApp = (referralCode, options = {}) => {
  const { productType, productName } = options;
  const link = generateAffiliateLink(referralCode, productType);
  const message = productName
    ? `Tham gia ${productName} cung toi!\n\n${link}`
    : `Tham gia Gemral cung toi!\n\n${link}`;
  return `whatsapp://send?text=${encodeURIComponent(message)}`;
};

/**
 * Share affiliate link to Telegram
 * @param {string} referralCode - User's referral code
 * @param {object} options - Options { productType, productName }
 * @returns {string} Telegram URL scheme
 */
export const shareAffiliateToTelegram = (referralCode, options = {}) => {
  const { productType, productName } = options;
  const link = generateAffiliateLink(referralCode, productType);
  const message = productName
    ? `Tham gia ${productName} cung toi!\n\n${link}`
    : `Tham gia Gemral cung toi!\n\n${link}`;
  return `tg://msg?text=${encodeURIComponent(message)}`;
};

/**
 * Share affiliate link to Facebook Messenger
 * @param {string} referralCode - User's referral code
 * @param {string} productType - Optional product type
 * @returns {string} Messenger URL scheme
 */
export const shareAffiliateToMessenger = (referralCode, productType = null) => {
  const link = generateAffiliateLink(referralCode, productType);
  return `fb-messenger://share?link=${encodeURIComponent(link)}`;
};

/**
 * Parse affiliate referral from URL
 * @param {string} url - URL to parse
 * @returns {object|null} { referralCode, productType } or null
 */
export const parseAffiliateLink = (url) => {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    const ref = urlObj.searchParams.get('ref');
    const product = urlObj.searchParams.get('product');

    if (ref) {
      return {
        referralCode: ref,
        productType: product || null,
      };
    }
  } catch (e) {
    // Not a valid URL
  }

  return null;
};

export default {
  // Post sharing
  generatePostLinks,
  generateShareContent,
  sharePost,
  copyPostLink,
  shareToWhatsApp,
  shareToTelegram,
  shareToMessenger,
  shareImage,
  parseDeepLink,
  // Affiliate sharing
  generateAffiliateLink,
  shareAffiliateLink,
  copyAffiliateLink,
  shareAffiliateToWhatsApp,
  shareAffiliateToTelegram,
  shareAffiliateToMessenger,
  parseAffiliateLink,
};
