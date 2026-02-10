/**
 * GEM Mobile - Sponsored Post Card Component
 * Facebook-style sponsored post with reactions, comments, shares
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Share,
} from 'react-native';
import {
  X,
  MoreHorizontal,
  Globe,
  CheckCircle,
} from 'lucide-react-native';
import { COLORS, SPACING } from '../utils/tokens';
import { sponsorBannerService } from '../services/sponsorBannerService';
import deepLinkHandler from '../services/deepLinkHandler';
import { navigateToScreen } from '../utils/navigationHelper';

// Sub-components
import AdEngagementStats from './AdEngagementStats';
import AdActionButtons from './AdActionButtons';
import AdReactionsBar from './AdReactionsBar';
import AdLinkPreview from './AdLinkPreview';
import AdCommentsSheet from './AdCommentsSheet';
import WhyThisAdModal from './WhyThisAdModal';
import ReportAdModal from './ReportAdModal';

// Primary text max length before truncation
const PRIMARY_TEXT_MAX_LENGTH = 125;

/**
 * Parse navigate route from URL-like path
 */
const parseNavigateRoute = (path) => {
  const cleanPath = path?.startsWith('/') ? path.slice(1) : path || '';
  const segments = cleanPath.split('/').filter(Boolean);

  if (segments.length === 0) {
    return { screen: 'Home' };
  }

  const routeMap = {
    'upgrade': (params) => ({
      screen: 'TierUpgrade',
      params: { tier: params[0] || 'tier1' },
    }),
    'shop': (params) => {
      if (params[0] === 'product' && params[1]) {
        return { screen: 'ProductDetail', params: { productId: params[1] } };
      }
      if (params[0] === 'category' && params[1]) {
        return { screen: 'Shop', params: { category: params[1] } };
      }
      return { screen: 'Shop' };
    },
    'course': (params) => {
      if (params[0]) {
        return { screen: 'CourseDetail', params: { courseId: params[0] } };
      }
      return { screen: 'Courses' };
    },
    'courses': () => ({ screen: 'Courses' }),
    'forum': (params) => {
      if (params[0] === 'post' && params[1]) {
        return { screen: 'PostDetail', params: { postId: params[1] } };
      }
      return { screen: 'Forum' };
    },
    'account': () => ({ screen: 'Account' }),
    'wallet': () => ({ screen: 'Wallet' }),
    'portfolio': () => ({ screen: 'Portfolio' }),
    'profile': () => ({ screen: 'ProfileSettings' }),
    'scanner': () => ({ screen: 'Scanner' }),
    'gemmaster': () => ({ screen: 'GemMaster' }),
    'tarot': () => ({ screen: 'Tarot' }),
    'iching': () => ({ screen: 'IChing' }),
    'home': () => ({ screen: 'Home' }),
  };

  const baseRoute = segments[0].toLowerCase();
  const routeParams = segments.slice(1);

  if (routeMap[baseRoute]) {
    return routeMap[baseRoute](routeParams);
  }

  const screenName = segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
  return { screen: screenName, params: segments[1] ? { id: segments[1] } : {} };
};

/**
 * SponsoredPostCard - Facebook-style sponsored post
 * @param {object} ad - Ad/Banner data object
 * @param {object} navigation - React Navigation object
 * @param {string} userId - Current user ID
 * @param {object} currentUser - Current user profile data
 * @param {string} userTier - Current user's tier
 * @param {function} onDismiss - Callback when ad is dismissed
 */
export default function SponsoredPostCard({
  ad,
  navigation,
  userId,
  currentUser,
  userTier = 'FREE',
  onDismiss,
}) {
  // State
  const [userReaction, setUserReaction] = useState(null);
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showWhyThisAd, setShowWhyThisAd] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [primaryTextExpanded, setPrimaryTextExpanded] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [likedCommentIds, setLikedCommentIds] = useState([]);
  const [localAd, setLocalAd] = useState(ad);

  if (!ad) return null;

  // Get primary text (use new field or combine title + subtitle)
  const primaryText = ad?.primary_text || `${ad?.title || ''} ${ad?.subtitle || ''}`.trim();
  const shouldTruncatePrimaryText = primaryText.length > PRIMARY_TEXT_MAX_LENGTH;
  const displayPrimaryText = primaryTextExpanded || !shouldTruncatePrimaryText
    ? primaryText
    : primaryText.slice(0, PRIMARY_TEXT_MAX_LENGTH) + '...';

  // Advertiser info
  const advertiserName = ad?.advertiser_name || 'Nhà tài trợ';
  const advertiserAvatar = ad?.advertiser_avatar || ad?.image_url;
  const isVerified = ad?.advertiser_verified || false;

  // Load user reaction on mount
  useEffect(() => {
    loadUserReaction();
  }, [ad?.id]);

  const loadUserReaction = async () => {
    try {
      const reaction = await sponsorBannerService.getUserReaction?.(ad?.id);
      setUserReaction(reaction);
    } catch (error) {
      console.error('[SponsoredPostCard] loadUserReaction error:', error);
    }
  };

  // Handle CTA click
  const handleCTAClick = async () => {
    await sponsorBannerService.recordClick(ad.id);

    const actionType = ad.action_type;
    const actionValue = ad.action_value;

    if (!actionValue) return;

    if (actionType === 'navigate') {
      const route = parseNavigateRoute(actionValue);
      if (route.screen) {
        navigateToScreen(navigation, route.screen, route.params);
      }
    } else if (actionType === 'screen') {
      navigateToScreen(navigation, actionValue);
    } else if (actionType === 'url') {
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
        console.error('[SponsoredPostCard] Deep link parse error:', error);
        navigateToScreen(navigation, actionValue);
      }
    }
  };

  // Handle dismiss
  const handleDismiss = async () => {
    if (userId) {
      await sponsorBannerService.dismissBanner(userId, ad.id);
      onDismiss?.(ad.id);
    }
  };

  // Handle menu press
  const handleMenuPress = () => {
    setShowMenu(!showMenu);
  };

  // Handle like press (quick tap = like toggle)
  const handleLikePress = async () => {
    try {
      const result = await sponsorBannerService.reactToAd?.(ad.id, 'like');
      if (result?.success) {
        setUserReaction(result.action === 'added' ? 'like' : null);
        // Update local ad state for optimistic UI
        setLocalAd(prev => ({
          ...prev,
          reaction_like: prev.reaction_like + (result.action === 'added' ? 1 : -1),
        }));
      }
    } catch (error) {
      console.error('[SponsoredPostCard] handleLikePress error:', error);
    }
  };

  // Handle like long press (show reactions)
  const handleLikeLongPress = () => {
    setShowReactions(true);
  };

  // Handle reaction select
  const handleReactionSelect = async (reactionType) => {
    try {
      const result = await sponsorBannerService.reactToAd?.(ad.id, reactionType);
      if (result?.success) {
        setUserReaction(result.action === 'added' ? reactionType : null);
      }
    } catch (error) {
      console.error('[SponsoredPostCard] handleReactionSelect error:', error);
    }
    setShowReactions(false);
  };

  // Handle comment press
  const handleCommentPress = async () => {
    setShowComments(true);
    loadComments();
  };

  // Load comments
  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      const result = await sponsorBannerService.getAdComments?.(ad.id);
      setComments(result?.comments || []);
      setLikedCommentIds(result?.likedIds || []);
    } catch (error) {
      console.error('[SponsoredPostCard] loadComments error:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Submit comment
  const handleSubmitComment = async (content, parentId = null) => {
    try {
      await sponsorBannerService.addAdComment?.(ad.id, content, parentId);
      await loadComments();
      // Update local comment count
      setLocalAd(prev => ({
        ...prev,
        comments_count: (prev.comments_count || 0) + 1,
      }));
    } catch (error) {
      console.error('[SponsoredPostCard] handleSubmitComment error:', error);
    }
  };

  // Like comment
  const handleLikeComment = async (commentId) => {
    try {
      const liked = await sponsorBannerService.toggleAdCommentLike?.(commentId);
      if (liked) {
        setLikedCommentIds(prev => [...prev, commentId]);
      } else {
        setLikedCommentIds(prev => prev.filter(id => id !== commentId));
      }
    } catch (error) {
      console.error('[SponsoredPostCard] handleLikeComment error:', error);
    }
  };

  // Handle share press
  const handleSharePress = async () => {
    try {
      const result = await Share.share({
        message: `${ad.title || ''}\n${ad.action_value || ''}`,
        title: ad.title || 'Chia sẻ từ Gemral',
      });

      if (result.action === Share.sharedAction) {
        await sponsorBannerService.incrementAdShare?.(ad.id, 'external');
        setLocalAd(prev => ({
          ...prev,
          shares_count: (prev.shares_count || 0) + 1,
        }));
      }
    } catch (error) {
      console.error('[SponsoredPostCard] handleSharePress error:', error);
    }
  };

  // Handle hide ad
  const handleHideAd = async () => {
    try {
      await sponsorBannerService.hideAd?.(ad.id);
      onDismiss?.(ad.id);
    } catch (error) {
      console.error('[SponsoredPostCard] handleHideAd error:', error);
    }
    setShowReport(false);
  };

  // Handle report ad
  const handleReportAd = async (reason) => {
    try {
      await sponsorBannerService.reportAd?.(ad.id, reason);
      onDismiss?.(ad.id);
    } catch (error) {
      console.error('[SponsoredPostCard] handleReportAd error:', error);
    }
    setShowReport(false);
  };

  return (
    <View style={styles.container}>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <Image
          source={{ uri: advertiserAvatar }}
          style={styles.advertiserAvatar}
        />
        <View style={styles.headerContent}>
          <View style={styles.advertiserNameRow}>
            <Text style={styles.advertiserName} numberOfLines={1}>
              {advertiserName}
            </Text>
            {isVerified && (
              <CheckCircle size={14} color="#1877F2" fill="#1877F2" />
            )}
          </View>
          <View style={styles.sponsoredRow}>
            <Text style={styles.sponsoredLabel}>Được tài trợ</Text>
            <Text style={styles.dot}>·</Text>
            <Globe size={12} color="rgba(255, 255, 255, 0.5)" />
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowWhyThisAd(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MoreHorizontal size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          {ad.is_dismissible && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleDismiss}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ===== PRIMARY TEXT ===== */}
      {primaryText && (
        <View style={styles.primaryTextContainer}>
          <Text style={styles.primaryText}>
            {displayPrimaryText}
            {shouldTruncatePrimaryText && !primaryTextExpanded && (
              <Text
                style={styles.seeMore}
                onPress={() => setPrimaryTextExpanded(true)}
              >
                {' '}xem thêm
              </Text>
            )}
          </Text>
        </View>
      )}

      {/* ===== MEDIA (Image/Video) ===== */}
      {ad.image_url && (
        <TouchableOpacity
          style={styles.mediaContainer}
          onPress={handleCTAClick}
          activeOpacity={0.95}
        >
          <Image
            source={{ uri: ad.image_url }}
            style={styles.mediaImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}

      {/* ===== LINK PREVIEW ===== */}
      {ad.action_value && (
        <AdLinkPreview ad={localAd} onPress={handleCTAClick} />
      )}

      {/* ===== ENGAGEMENT STATS ===== */}
      <AdEngagementStats
        ad={localAd}
        onReactionsPress={() => {}}
        onCommentsPress={handleCommentPress}
        onSharesPress={() => {}}
      />

      {/* ===== ACTION BUTTONS ===== */}
      <AdActionButtons
        userReaction={userReaction}
        onLikePress={handleLikePress}
        onLikeLongPress={handleLikeLongPress}
        onCommentPress={handleCommentPress}
        onSharePress={handleSharePress}
      />

      {/* ===== REACTIONS POPUP ===== */}
      <AdReactionsBar
        visible={showReactions}
        onClose={() => setShowReactions(false)}
        onReactionSelect={handleReactionSelect}
        currentReaction={userReaction}
      />

      {/* ===== COMMENTS SHEET ===== */}
      <AdCommentsSheet
        visible={showComments}
        onClose={() => setShowComments(false)}
        comments={comments}
        loading={commentsLoading}
        onSubmitComment={handleSubmitComment}
        onLikeComment={handleLikeComment}
        currentUser={currentUser}
        likedCommentIds={likedCommentIds}
      />

      {/* ===== WHY THIS AD MODAL ===== */}
      <WhyThisAdModal
        visible={showWhyThisAd}
        onClose={() => setShowWhyThisAd(false)}
        ad={ad}
        userTier={userTier}
      />

      {/* ===== REPORT MODAL ===== */}
      <ReportAdModal
        visible={showReport}
        onClose={() => setShowReport(false)}
        onHide={handleHideAd}
        onReport={handleReportAd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    overflow: 'hidden',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: 10,
  },
  advertiserAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flex: 1,
  },
  advertiserNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  advertiserName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sponsoredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  sponsoredLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  dot: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerButton: {
    padding: 4,
  },

  // Primary Text
  primaryTextContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  primaryText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  seeMore: {
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  // Media
  mediaContainer: {
    width: '100%',
    aspectRatio: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
});
