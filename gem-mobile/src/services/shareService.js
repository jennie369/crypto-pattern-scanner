/**
 * Gemral - Share Service
 * Feature #9: Share to External Apps
 * Handles sharing posts to external platforms
 */

import { Share, Platform, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

// App deep link base URL
const APP_SCHEME = 'gem://';
const WEB_BASE_URL = 'https://gemral.com';

// Smart links: import from centralized constants
import { generateSmartLink as _generateSmartLink } from '../utils/constants';

/**
 * Generate a smart share URL that goes through Supabase og-meta function.
 * This ensures rich previews in social apps AND smart redirect for users.
 * @param {string} path - Content path (e.g., '/courses/123', '/forum/thread/456')
 * @returns {string} Smart link URL
 */
export const generateSmartLink = _generateSmartLink;

/**
 * Generate a shareable link for a post
 * @param {string} postId - Post ID
 * @returns {object} { deepLink, webLink }
 */
export const generatePostLinks = (postId) => {
  return {
    deepLink: `${APP_SCHEME}forum/thread/${postId}`,
    webLink: generateSmartLink(`/forum/thread/${postId}`),
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
 * Download image to local cache for sharing
 * @param {string} imageUrl - Remote image URL
 * @returns {Promise<string|null>} Local file URI or null
 */
const downloadImageForShare = async (imageUrl) => {
  if (!imageUrl) return null;

  try {
    const filename = imageUrl.split('/').pop()?.split('?')[0] || 'share_image.jpg';
    const localUri = `${FileSystem.cacheDirectory}${filename}`;

    const downloadResult = await FileSystem.downloadAsync(imageUrl, localUri);

    if (downloadResult.status === 200) {
      return downloadResult.uri;
    }
    return null;
  } catch (error) {
    console.error('[Share] Download image error:', error);
    return null;
  }
};

/**
 * Share to WhatsApp with text and optional image
 * @param {object} post - Post object
 * @returns {Promise<object>} { success, error? }
 */
export const shareToWhatsApp = async (post) => {
  try {
    const content = generateShareContent(post);
    const shareText = `${content.message}\n\n📱 Xem trên Gemral App`;

    // Check if WhatsApp is available
    const canOpen = await Linking.canOpenURL('whatsapp://');

    if (!canOpen) {
      return { success: false, error: 'WhatsApp chưa được cài đặt' };
    }

    // If post has image, try to share with image using native share
    if (post.image_url || post.media_url) {
      const localImageUri = await downloadImageForShare(post.image_url || post.media_url);

      if (localImageUri && await Sharing.isAvailableAsync()) {
        // Use native sharing with image (will show WhatsApp option)
        await Sharing.shareAsync(localImageUri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Chia sẻ lên WhatsApp',
          UTI: 'public.jpeg',
        });
        return { success: true };
      }
    }

    // Fallback: Share text only via WhatsApp URL scheme
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
    await Linking.openURL(whatsappUrl);
    return { success: true };

  } catch (error) {
    console.error('[Share] WhatsApp error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Share to Telegram with text and optional image
 * @param {object} post - Post object
 * @returns {Promise<object>} { success, error? }
 */
export const shareToTelegram = async (post) => {
  try {
    const content = generateShareContent(post);
    const shareText = `${content.message}\n\n📱 Xem trên Gemral App`;

    // Check if Telegram is available
    const canOpen = await Linking.canOpenURL('tg://');

    if (!canOpen) {
      return { success: false, error: 'Telegram chưa được cài đặt' };
    }

    // If post has image, use native share
    if (post.image_url || post.media_url) {
      const localImageUri = await downloadImageForShare(post.image_url || post.media_url);

      if (localImageUri && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localImageUri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Chia sẻ lên Telegram',
        });
        return { success: true };
      }
    }

    // Fallback: Share text only
    const telegramUrl = `tg://msg?text=${encodeURIComponent(shareText)}`;
    await Linking.openURL(telegramUrl);
    return { success: true };

  } catch (error) {
    console.error('[Share] Telegram error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Share to Messenger with text and optional image
 * @param {object} post - Post object
 * @returns {Promise<object>} { success, error? }
 */
export const shareToMessenger = async (post) => {
  try {
    const content = generateShareContent(post);
    const shareText = `${content.message}\n\n📱 Xem trên Gemral App`;

    // Check if Messenger is available
    const canOpen = await Linking.canOpenURL('fb-messenger://');

    if (!canOpen) {
      return { success: false, error: 'Messenger chưa được cài đặt' };
    }

    // Messenger doesn't support direct image share via URL scheme
    // Best option: Use native share which includes Messenger
    if (post.image_url || post.media_url) {
      const localImageUri = await downloadImageForShare(post.image_url || post.media_url);

      if (localImageUri && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localImageUri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Chia sẻ lên Messenger',
        });
        return { success: true };
      }
    }

    // Fallback: Open Messenger share dialog (text only)
    // Note: fb-messenger://share requires a valid URL, so we use compose instead
    const messengerUrl = `fb-messenger://share?text=${encodeURIComponent(shareText)}`;

    try {
      await Linking.openURL(messengerUrl);
      return { success: true };
    } catch (e) {
      // Try alternative Messenger URL format
      const altMessengerUrl = `fb-messenger://compose?text=${encodeURIComponent(shareText)}`;
      await Linking.openURL(altMessengerUrl);
      return { success: true };
    }

  } catch (error) {
    console.error('[Share] Messenger error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Share with image to any app using native share sheet
 * @param {object} post - Post object
 * @returns {Promise<object>} { success, error? }
 */
export const shareWithImage = async (post) => {
  try {
    const content = generateShareContent(post);
    const shareText = `${content.message}\n\n📱 Xem trên Gemral App`;

    // Download image if available
    if (post.image_url || post.media_url) {
      const localImageUri = await downloadImageForShare(post.image_url || post.media_url);

      if (localImageUri && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localImageUri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Chia sẻ bài viết',
        });
        return { success: true };
      }
    }

    // Fallback to text share
    const result = await Share.share({
      message: shareText,
    });

    return { success: result.action === Share.sharedAction };

  } catch (error) {
    console.error('[Share] shareWithImage error:', error);
    return { success: false, error: error.message };
  }
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

    if (parts[0] === 'forum' && parts[1] === 'thread' && parts[2]) {
      return { type: 'post', id: parts[2] };
    }
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

    if (parts[0] === 'forum' && parts[1] === 'thread' && parts[2]) {
      return { type: 'post', id: parts[2] };
    }
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
 * Uses smart link for proper OG previews + app redirect
 * @param {string} referralCode - User's referral code
 * @param {string} productType - Optional product type
 * @returns {string} Referral URL
 */
export const generateAffiliateLink = (referralCode, productType = null) => {
  let path = `/?ref=${referralCode}`;
  if (productType) {
    path += `&product=${productType}`;
  }
  return generateSmartLink(path);
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
  // Smart links
  generateSmartLink,
  // Post sharing
  generatePostLinks,
  generateShareContent,
  sharePost,
  copyPostLink,
  shareToWhatsApp,
  shareToTelegram,
  shareToMessenger,
  shareWithImage,
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
