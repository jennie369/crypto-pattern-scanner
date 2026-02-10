/**
 * SponsorBannerPost - Post-style Sponsor Banner
 * Renders a sponsor banner that looks exactly like a regular forum post
 * for seamless integration into the feed. Only "Tài trợ" label distinguishes it.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
  FlatList,
} from 'react-native';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  X,
  ChevronRight,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../utils/tokens';
import { sponsorBannerService } from '../services/sponsorBannerService';
import deepLinkHandler from '../services/deepLinkHandler';
import { navigateToScreen } from '../utils/navigationHelper';
import { ProgressiveImage } from './Image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * SponsorBannerPost - Mimics PostCard layout for seamless ad experience
 * @param {boolean} showActions - Whether to show action bar (like, comment, share). Default: true
 */
export default function SponsorBannerPost({
  banner,
  navigation,
  userId,
  onDismiss,
  showActions = true, // Hide actions in non-forum contexts (e.g., GemMaster chat)
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const flatListRef = useRef(null);

  if (!banner) return null;

  // Get images array - support both images array and single image_url
  const getImages = () => {
    if (banner.images && Array.isArray(banner.images) && banner.images.length > 0) {
      return banner.images;
    }
    if (banner.images && typeof banner.images === 'string') {
      try {
        const parsed = JSON.parse(banner.images);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    if (banner.image_url) {
      return [banner.image_url];
    }
    return [];
  };

  const images = getImages();

  // Handle banner click - same logic as SponsorBannerCard
  const handleBannerClick = async () => {
    console.log('[SponsorBannerPost] ========== BANNER CLICK ==========');
    console.log('[SponsorBannerPost] banner.id:', banner.id);
    console.log('[SponsorBannerPost] banner.action_type:', banner.action_type);
    console.log('[SponsorBannerPost] banner.action_value:', banner.action_value);
    console.log('[SponsorBannerPost] navigation exists:', !!navigation);

    await sponsorBannerService.recordClick(banner.id);

    const actionType = banner.action_type;
    const actionValue = banner.action_value;

    if (!actionValue) {
      console.warn('[SponsorBannerPost] No actionValue provided!');
      return;
    }

    if (actionType === 'navigate') {
      const route = parseNavigateRoute(actionValue);
      console.log('[SponsorBannerPost] Parsed navigate route:', route);
      if (route.screen) {
        navigateToScreen(navigation, route.screen, route.params);
      }
      return;
    }

    if (actionType === 'screen') {
      console.log('[SponsorBannerPost] Navigating to screen:', actionValue);
      navigateToScreen(navigation, actionValue);
    } else if (actionType === 'url') {
      console.log('[SponsorBannerPost] Opening URL:', actionValue);
      Linking.openURL(actionValue);
    } else if (actionType === 'deeplink') {
      try {
        let deepLink;
        if (actionValue.startsWith('{')) {
          deepLink = JSON.parse(actionValue);
        } else if (actionValue.startsWith('gem://')) {
          const url = actionValue.replace('gem://', '');
          const [screen, queryString] = url.split('?');
          const params = {};
          if (queryString) {
            queryString.split('&').forEach(param => {
              const [key, value] = param.split('=');
              params[key] = decodeURIComponent(value);
            });
          }
          deepLink = { screen, params };
        } else {
          deepLink = { screen: actionValue };
        }
        deepLinkHandler.processDeepLink(deepLink);
      } catch (error) {
        navigateToScreen(navigation, actionValue);
      }
    }
  };

  // Parse navigate route (same as SponsorBannerCard)
  const parseNavigateRoute = (path) => {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const segments = cleanPath.split('/').filter(Boolean);

    if (segments.length === 0) return { screen: 'Home' };

    const routeMap = {
      'upgrade': (params) => ({ screen: 'TierUpgrade', params: { tier: params[0] || 'tier1' } }),
      'shop': (params) => {
        if (params[0] === 'product' && params[1]) return { screen: 'ProductDetail', params: { productId: params[1] } };
        if (params[0] === 'category' && params[1]) return { screen: 'Shop', params: { category: params[1] } };
        return { screen: 'Shop' };
      },
      'course': (params) => params[0] ? { screen: 'CourseDetail', params: { courseId: params[0] } } : { screen: 'Courses' },
      'courses': () => ({ screen: 'Courses' }),
      'forum': (params) => params[0] === 'post' && params[1] ? { screen: 'PostDetail', params: { postId: params[1] } } : { screen: 'Forum' },
      'account': () => ({ screen: 'Account' }),
      'wallet': () => ({ screen: 'Wallet' }),
      'scanner': () => ({ screen: 'Scanner' }),
      'gemmaster': () => ({ screen: 'GemMaster' }),
      'home': () => ({ screen: 'Home' }),
    };

    const baseRoute = segments[0].toLowerCase();
    const routeParams = segments.slice(1);

    if (routeMap[baseRoute]) return routeMap[baseRoute](routeParams);

    const screenName = segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
    return { screen: screenName, params: segments[1] ? { id: segments[1] } : {} };
  };

  const handleDismiss = async () => {
    // Always call onDismiss to remove from UI
    // Only persist to DB if userId exists
    if (userId) {
      await sponsorBannerService.dismissBanner(userId, banner.id);
    }
    // Always trigger parent callback to remove banner from list
    onDismiss?.(banner.id);
  };

  // Fake engagement actions (for visual only)
  const handleLike = () => setIsLiked(!isLiked);
  const handleSave = () => setIsSaved(!isSaved);

  // Get sponsor avatar or use default
  const sponsorAvatar = banner.sponsor_avatar || banner.image_url;
  const sponsorName = banner.sponsor_name || 'Nhà tài trợ';

  return (
    <View style={styles.card}>
      {/* Author Header - Mimics PostCard header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBannerClick} activeOpacity={0.7}>
          {sponsorAvatar ? (
            <Image source={{ uri: sponsorAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {sponsorName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerText}
          onPress={handleBannerClick}
          activeOpacity={0.7}
        >
          <View style={styles.authorRow}>
            <Text style={styles.authorName}>{sponsorName}</Text>
            {/* Sponsored Badge */}
            <View style={styles.sponsoredBadge}>
              <Text style={styles.sponsoredText}>Tài trợ</Text>
            </View>
          </View>
          <Text style={styles.timestamp}>Được tài trợ</Text>
        </TouchableOpacity>

        {/* Dismiss Button */}
        {banner.is_dismissible && (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content - Title and Subtitle */}
      <TouchableOpacity activeOpacity={0.8} onPress={handleBannerClick}>
        <Text style={styles.content}>
          <Text style={styles.titleBold}>{banner.title}</Text>
          {banner.subtitle && `\n\n${banner.subtitle}`}
        </Text>
      </TouchableOpacity>

      {/* Image Carousel - Full width like PostCard */}
      {images.length > 0 && (
        <View style={styles.mediaContainer}>
          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImageIndex(index);
            }}
            keyExtractor={(item, index) => `banner-image-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={handleBannerClick}
              >
                <Image
                  source={{ uri: item }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
          />
          {/* Pagination dots - only show if multiple images */}
          {images.length > 1 && (
            <View style={styles.paginationContainer}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === activeImageIndex && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          )}
          {/* Image counter badge */}
          {images.length > 1 && (
            <View style={styles.imageCountBadge}>
              <Text style={styles.imageCountText}>
                {activeImageIndex + 1}/{images.length}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* CTA Button - Below image */}
      {banner.action_label && (
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleBannerClick}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>{banner.action_label}</Text>
          <ChevronRight size={16} color={COLORS.gold} />
        </TouchableOpacity>
      )}

      {/* Action Bar - Mimics PostCard but simplified (only show in forum context) */}
      {showActions && (
        <View style={styles.actionBar}>
          <View style={styles.actionBarLeft}>
            {/* Like Button (visual only) */}
            <TouchableOpacity style={styles.actionBtn} onPress={handleLike} activeOpacity={0.7}>
              <Heart
                size={22}
                color={isLiked ? '#FF6B6B' : COLORS.textMuted}
                fill={isLiked ? '#FF6B6B' : 'transparent'}
                strokeWidth={2}
              />
            </TouchableOpacity>

            {/* Comment Button (navigates to banner action) */}
            <TouchableOpacity style={styles.actionBtn} onPress={handleBannerClick} activeOpacity={0.7}>
              <MessageCircle size={22} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* Share Button */}
            <TouchableOpacity style={styles.actionBtn} onPress={handleBannerClick} activeOpacity={0.7}>
              <Send size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.actionBarRight}>
            {/* Save Button (visual only) */}
            <TouchableOpacity style={styles.actionBtn} onPress={handleSave}>
              <Bookmark
                size={20}
                color={isSaved ? COLORS.gold : COLORS.textMuted}
                fill={isSaved ? COLORS.gold : 'transparent'}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.glassBg,
    marginBottom: SPACING.sm,
    paddingTop: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },

  // Header styles (matches PostCard)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerText: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sponsoredBadge: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sponsoredText: {
    fontSize: 10,
    color: COLORS.gold,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  moreButton: {
    padding: SPACING.xs,
  },

  // Content styles (matches PostCard)
  content: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  titleBold: {
    fontWeight: '600',
    fontSize: 15,
  },

  // Media container (matches PostCard - full bleed)
  mediaContainer: {
    width: SCREEN_WIDTH,
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  postImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75, // 4:3 aspect ratio for better image display
    backgroundColor: COLORS.bgMid,
  },

  // Pagination dots for image carousel
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  paginationDotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },

  // Image counter badge
  imageCountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // CTA Button
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
    marginRight: SPACING.xs,
  },

  // Action bar (matches PostCard)
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  actionBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xs,
  },
});
