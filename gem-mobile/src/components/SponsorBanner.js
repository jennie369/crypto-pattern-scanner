/**
 * SponsorBanner - Unified Sponsor Banner Component
 * Renders the appropriate banner layout based on layout_type
 *
 * Layout Types:
 * - 'compact' (default): Small card-style banner with image on left
 * - 'post': Post-style banner that mimics a regular forum post
 * - 'featured': Premium hero-style banner with gradient overlay
 */

import React from 'react';
import SponsorBannerCard from './SponsorBannerCard';
import SponsorBannerPost from './SponsorBannerPost';
import SponsorBannerFeatured from './SponsorBannerFeatured';

// Layout type constants for external use
export const BANNER_LAYOUT_TYPES = {
  COMPACT: 'compact',
  POST: 'post',
  FEATURED: 'featured',
};

// Layout options for Admin UI dropdown
export const BANNER_LAYOUT_OPTIONS = [
  {
    value: 'compact',
    label: 'Compact',
    description: 'Banner nhỏ gọn với hình ảnh bên trái',
  },
  {
    value: 'post',
    label: 'Post Style',
    description: 'Giống như một bài viết thường',
  },
  {
    value: 'featured',
    label: 'Featured',
    description: 'Banner nổi bật kiểu hero',
  },
];

/**
 * SponsorBanner - Unified wrapper component
 * Automatically renders the appropriate layout based on banner.layout_type
 *
 * @param {object} banner - Banner data object (must include layout_type)
 * @param {object} navigation - React Navigation object
 * @param {string} userId - Current user ID (for dismiss tracking)
 * @param {function} onDismiss - Callback when banner is dismissed
 * @param {boolean} showActions - Whether to show action bar (like, comment, share) for Post layout. Default: true
 */
export default function SponsorBanner({
  banner,
  navigation,
  userId,
  onDismiss,
  showActions = true, // Pass to SponsorBannerPost
}) {
  if (!banner) return null;

  // Get layout type, default to 'compact' if not specified
  const layoutType = banner.layout_type || BANNER_LAYOUT_TYPES.COMPACT;

  // Debug logging - VERY VISIBLE
  console.log('========================================');
  console.log('[SponsorBanner] 🎯 RENDERING BANNER');
  console.log('[SponsorBanner] Title:', banner.title);
  console.log('[SponsorBanner] layout_type from DB:', banner.layout_type);
  console.log('[SponsorBanner] resolved layoutType:', layoutType);
  console.log('[SponsorBanner] Will render:',
    layoutType === 'post' ? '📝 SponsorBannerPost' :
    layoutType === 'featured' ? '⭐ SponsorBannerFeatured' :
    '📦 SponsorBannerCard (compact)'
  );
  console.log('========================================');

  // Common props for all banner components
  const commonProps = {
    banner,
    navigation,
    userId,
    onDismiss,
  };

  // Render appropriate component based on layout type
  switch (layoutType) {
    case BANNER_LAYOUT_TYPES.POST:
      console.log('[SponsorBanner] ✅ Returning SponsorBannerPost component');
      return <SponsorBannerPost {...commonProps} showActions={showActions} />;

    case BANNER_LAYOUT_TYPES.FEATURED:
      console.log('[SponsorBanner] ✅ Returning SponsorBannerFeatured component');
      return <SponsorBannerFeatured {...commonProps} />;

    case BANNER_LAYOUT_TYPES.COMPACT:
    default:
      console.log('[SponsorBanner] ✅ Returning SponsorBannerCard component');
      return <SponsorBannerCard {...commonProps} />;
  }
}

// Export individual components for direct use if needed
export { SponsorBannerCard, SponsorBannerPost, SponsorBannerFeatured };
