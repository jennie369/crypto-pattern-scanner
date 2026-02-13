/**
 * Link Utilities
 * Generates shareable links that work for both web and mobile app
 */

// Production domain
const PRODUCTION_DOMAIN = 'https://gemral.com';

// Deep link scheme for mobile app (matches gem-mobile deepLinkHandler.js)
const APP_SCHEME = 'gem';

/**
 * Get the base URL for internal navigation (respects current environment)
 * Uses localhost in development, production domain in production
 */
export const getBaseUrl = () => {
  // Check for Vite environment variable override
  if (import.meta.env.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL;
  }

  // In production, use the production domain
  if (import.meta.env.PROD) {
    return PRODUCTION_DOMAIN;
  }

  // In development, use current origin (localhost)
  return window.location.origin;
};

/**
 * Get the shareable base URL - ALWAYS uses production domain
 * Use this for copy link, share buttons, etc.
 */
export const getShareableBaseUrl = () => {
  return PRODUCTION_DOMAIN;
};

/**
 * Generate a web URL for a given path (for internal navigation)
 * @param {string} path - The path (e.g., '/courses/123')
 * @returns {string} Full web URL
 */
export const getWebUrl = (path) => {
  const baseUrl = getBaseUrl();
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

/**
 * Generate a SHAREABLE web URL - ALWAYS uses production domain
 * Use this for copy link, share buttons, external sharing
 * @param {string} path - The path (e.g., '/courses/123')
 * @returns {string} Full shareable URL with production domain
 */
export const getShareableUrl = (path) => {
  const baseUrl = getShareableBaseUrl();
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

/**
 * Generate a deep link for mobile app
 * @param {string} path - The path (e.g., '/courses/123')
 * @returns {string} Deep link URL (e.g., 'gem://courses/123')
 */
export const getDeepLink = (path) => {
  // Remove leading slash for deep link
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${APP_SCHEME}://${normalizedPath}`;
};

/**
 * App deep link routes (matching gem-mobile deepLinkHandler.js)
 * These are the supported deep link paths for the mobile app
 */
export const appDeepLinks = {
  gemmaster: `${APP_SCHEME}://gemmaster`,
  scanner: `${APP_SCHEME}://scanner`,
  visionboard: `${APP_SCHEME}://visionboard`,
  shop: `${APP_SCHEME}://shop`,
  courses: `${APP_SCHEME}://courses`,
  forum: `${APP_SCHEME}://forum`,
  tarot: `${APP_SCHEME}://tarot`,
  iching: `${APP_SCHEME}://iching`,
  frequency: `${APP_SCHEME}://frequency`,
  wallet: `${APP_SCHEME}://wallet`,
  portfolio: `${APP_SCHEME}://portfolio`,
  earnings: `${APP_SCHEME}://earnings`,
  affiliate: `${APP_SCHEME}://affiliate`,
  product: (productId) => `${APP_SCHEME}://product/${productId}`,
};

/**
 * Generate a universal link that works for both web and app
 * Uses the web URL which can be configured as a universal link on iOS/Android
 * @param {string} path - The path
 * @returns {string} Universal link URL
 */
export const getUniversalLink = (path) => {
  return getWebUrl(path);
};

/**
 * Generate course-related links
 * Uses getShareableUrl for links meant to be shared/copied
 */
export const courseLinks = {
  // Course detail page (shareable)
  courseDetail: (courseId) => getShareableUrl(`/courses/${courseId}`),

  // Course learning page (shareable)
  courseLearn: (courseId) => getShareableUrl(`/courses/${courseId}/learn`),

  // Specific lesson (shareable)
  lesson: (courseId, lessonId) => getShareableUrl(`/courses/${courseId}/learn/${lessonId}`),

  // Admin: Course edit (shareable - for copy link feature)
  adminCourseEdit: (courseId) => getShareableUrl(`/courses/admin/edit/${courseId}`),

  // Admin: Module edit (shareable - for copy link feature)
  adminModuleEdit: (courseId, moduleId) => getShareableUrl(`/courses/admin/edit/${courseId}/modules/${moduleId}`),

  // Admin: Lesson edit (shareable - for copy link feature)
  adminLessonEdit: (courseId, moduleId, lessonId) =>
    getShareableUrl(`/courses/admin/edit/${courseId}/modules/${moduleId}/lessons/${lessonId}`),
};

/**
 * Generate course-related DEEP LINKS for mobile app
 * These links open directly in the Gemral app
 */
export const courseDeepLinks = {
  // Course list
  courseList: () => `${APP_SCHEME}://courses`,

  // Course detail page
  courseDetail: (courseId) => `${APP_SCHEME}://courses/${courseId}`,

  // Specific lesson
  lesson: (courseId, lessonId) => `${APP_SCHEME}://courses/${courseId}/lessons/${lessonId}`,

  // Module (chapter)
  module: (courseId, moduleId) => `${APP_SCHEME}://courses/${courseId}/modules/${moduleId}`,
};

/**
 * Generate affiliate/referral links (always shareable)
 */
export const affiliateLinks = {
  // Referral link with code
  referral: (refCode) => getShareableUrl(`?ref=${refCode}`),
};

/**
 * Generate forum-related links (always shareable)
 */
export const forumLinks = {
  // Forum thread/post
  thread: (postId) => getShareableUrl(`/forum/thread/${postId}`),

  // Forum category
  category: (categoryId) => getShareableUrl(`/forum/category/${categoryId}`),
};

/**
 * Generate shop-related links (always shareable)
 */
export const shopLinks = {
  // Product detail
  product: (productId) => getShareableUrl(`/shop/product/${productId}`),

  // Category
  category: (categoryId) => getShareableUrl(`/shop/category/${categoryId}`),
};

/**
 * Copy text to clipboard with success callback
 * @param {string} text - Text to copy
 * @param {Function} onSuccess - Callback on success
 * @param {Function} onError - Callback on error
 */
export const copyToClipboard = async (text, onSuccess, onError) => {
  try {
    await navigator.clipboard.writeText(text);
    if (onSuccess) onSuccess();
  } catch (err) {
    console.error('Failed to copy:', err);
    if (onError) onError(err);
  }
};

/**
 * Check if current environment is production
 */
export const isProduction = () => import.meta.env.PROD;

/**
 * Check if running inside a mobile app webview
 */
export const isInAppWebview = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return userAgent.includes('gemral') ||
         userAgent.includes('gem-mobile') ||
         window.ReactNativeWebView !== undefined;
};

export default {
  getBaseUrl,
  getShareableBaseUrl,
  getWebUrl,
  getShareableUrl,
  getDeepLink,
  getUniversalLink,
  appDeepLinks,
  courseLinks,
  courseDeepLinks,
  affiliateLinks,
  forumLinks,
  shopLinks,
  copyToClipboard,
  isProduction,
  isInAppWebview,
};
