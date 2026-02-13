/**
 * Gemral - Post Card Component
 * Displays forum post preview with interactive actions
 * Includes AuthGate for like/comment buttons
 * WITH LIKE ANIMATION
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Share, Animated, Pressable, Modal, Alert, Dimensions } from 'react-native';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Edit2, Flag, EyeOff, UserX, Trash2, X, Repeat2, Gift, Send, Layers } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import { useAuth } from '../../../contexts/AuthContext';
import AuthGate from '../../../components/AuthGate';
import { forumService } from '../../../services/forumService';
import { blockService } from '../../../services/blockService';
import { trackView } from '../../../services/engagementService';
import { UserBadges } from '../../../components/UserBadge';
import PostImageCarousel from '../../../components/PostImageCarousel';
import ReportModal from '../../../components/ReportModal';
import { ProgressiveImage } from '../../../components/Image';
import { getImageDisplayHeight } from '../../../utils/imageUtils';
import ImageViewer from '../../../components/ImageViewer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// NEW: Import sheets and components for feature integration
import ShareSheet from '../../../components/ShareSheet';
import RepostSheet from '../../../components/RepostSheet';
import GiftCatalogSheet from '../../../components/GiftCatalogSheet';
import ReactionsListSheet from '../../../components/ReactionsListSheet';
import ReceivedGiftsBar from '../../../components/ReceivedGiftsBar';
import QuotedPost from '../../../components/QuotedPost';

// Feature components for monetization, sounds, shopping
import SoundCard from '../../../components/SoundCard';
import ShoppingTagOverlay from '../../../components/ShoppingTagOverlay';
import BoostedBadge from '../../../components/BoostedBadge';

// Double tap detection constants
const DOUBLE_TAP_DELAY = 300; // ms
const DWELL_TIME_THRESHOLD = 2; // Minimum seconds to count as meaningful view

const PostCard = ({ post, onPress, onLikeChange, onUpdate, sessionId }) => {
  const navigation = useNavigation();
  const { user, isAuthenticated } = useAuth();

  // Local state for optimistic updates
  const [isLiked, setIsLiked] = useState(post.user_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isSaved, setIsSaved] = useState(post.user_saved || false);
  const [isLiking, setIsLiking] = useState(false);

  // State for expandable content
  const [isExpanded, setIsExpanded] = useState(false);
  const [showViewMore, setShowViewMore] = useState(false);

  // Menu & Report state
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  // NEW: Sheet visibility states for feature integration
  const [shareSheetVisible, setShareSheetVisible] = useState(false);
  const [repostSheetVisible, setRepostSheetVisible] = useState(false);
  const [giftSheetVisible, setGiftSheetVisible] = useState(false);
  const [reactionsVisible, setReactionsVisible] = useState(false);

  // Image viewer state for tap-to-view full screen
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);

  // Animation refs
  const likeScale = useRef(new Animated.Value(1)).current;
  const heartBounce = useRef(new Animated.Value(0)).current;

  // Double-tap refs
  const lastTap = useRef(0);
  const bigHeartScale = useRef(new Animated.Value(0)).current;
  const bigHeartOpacity = useRef(new Animated.Value(0)).current;

  // Dwell time tracking refs
  const viewStartTime = useRef(null);
  const hasTrackedView = useRef(false);

  // Check if user already liked (from post data)
  useEffect(() => {
    if (user && post.likes) {
      const userLiked = post.likes.some(like => like.user_id === user.id);
      setIsLiked(userLiked);
    } else if (post.user_liked !== undefined) {
      setIsLiked(post.user_liked);
    }
  }, [user, post.likes, post.user_liked]);

  // Track dwell time when component mounts/unmounts
  useEffect(() => {
    // Start tracking when post card becomes visible
    viewStartTime.current = Date.now();
    hasTrackedView.current = false;

    // Cleanup: track view duration when card leaves viewport
    return () => {
      if (viewStartTime.current && user?.id && !hasTrackedView.current) {
        const dwellTime = Math.round((Date.now() - viewStartTime.current) / 1000);

        // Only track if user spent meaningful time (>= 2 seconds)
        if (dwellTime >= DWELL_TIME_THRESHOLD) {
          hasTrackedView.current = true;
          trackView(user.id, post.id, dwellTime, sessionId).catch(err => {
            console.warn('[PostCard] Failed to track dwell time:', err);
          });
          console.log(`[PostCard] Tracked dwell time: ${dwellTime}s for post ${post.id}`);
        }
      }
    };
  }, [post.id, user?.id, sessionId]);

  // Handle like action WITH ANIMATION
  const handleLike = useCallback(async () => {
    if (isLiking) return;

    setIsLiking(true);

    // Optimistic update
    const wasLiked = isLiked;
    const newIsLiked = !wasLiked;
    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));

    // Play animation when LIKING (not unliking)
    if (newIsLiked) {
      // Bounce animation sequence
      Animated.sequence([
        Animated.spring(likeScale, {
          toValue: 1.4,
          friction: 3,
          tension: 150,
          useNativeDriver: true,
        }),
        Animated.spring(likeScale, {
          toValue: 1,
          friction: 3,
          tension: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Small scale for unlike
      Animated.sequence([
        Animated.timing(likeScale, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(likeScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }

    try {
      if (wasLiked) {
        await forumService.unlikePost(post.id);
      } else {
        await forumService.likePost(post.id);
      }

      // Notify parent if needed
      if (onLikeChange) {
        onLikeChange(post.id, newIsLiked);
      }
      if (onUpdate) {
        onUpdate(post.id, {
          likes_count: newIsLiked ? likesCount + 1 : Math.max(0, likesCount - 1),
          user_liked: newIsLiked,
        });
      }

      console.log('[PostCard] ✅ Like toggled:', newIsLiked ? 'liked' : 'unliked');
    } catch (error) {
      // Revert on error
      console.error('[PostCard] Like error:', error);
      setIsLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
    } finally {
      setIsLiking(false);
    }
  }, [isLiked, isLiking, likesCount, post.id, onLikeChange, onUpdate]);

  // Show big heart animation (Instagram style)
  const showBigHeart = useCallback(() => {
    // Reset values
    bigHeartScale.setValue(0);
    bigHeartOpacity.setValue(1);

    // Animate big heart
    Animated.parallel([
      Animated.spring(bigHeartScale, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(bigHeartOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [bigHeartScale, bigHeartOpacity]);

  // Handle double-tap to like (Instagram style)
  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTap.current;

    if (timeSinceLastTap < DOUBLE_TAP_DELAY && timeSinceLastTap > 0) {
      // Double tap detected!
      console.log('[PostCard] Double tap detected!');

      // Only like if not already liked
      if (!isLiked && isAuthenticated) {
        handleLike();
        showBigHeart();
      } else if (isLiked) {
        // Already liked, just show animation
        showBigHeart();
      }
    } else {
      // Single tap - navigate to detail after delay
      lastTap.current = now;
      setTimeout(() => {
        if (Date.now() - lastTap.current >= DOUBLE_TAP_DELAY) {
          // No second tap, navigate to detail
          if (onPress) {
            onPress();
          } else {
            navigation.navigate('PostDetail', { postId: post.id });
          }
        }
      }, DOUBLE_TAP_DELAY);
    }
  }, [isLiked, isAuthenticated, handleLike, showBigHeart, onPress, navigation, post.id]);

  // Handle comment - navigate to post detail with focus
  const handleComment = () => {
    navigation.navigate('PostDetail', { postId: post.id, focusComment: true });
  };

  // Handle share - NOW OPENS ShareSheet
  const handleShare = () => {
    setShareSheetVisible(true);
  };

  // NEW: Handle repost - opens RepostSheet
  const handleRepost = () => {
    setRepostSheetVisible(true);
  };

  // NEW: Handle gift - opens GiftCatalogSheet
  const handleGift = () => {
    setGiftSheetVisible(true);
  };

  // NEW: Handle view reactions - opens ReactionsListSheet
  const handleViewReactions = () => {
    setReactionsVisible(true);
  };

  // Handle tap on image to open full screen viewer
  const handleImagePress = useCallback((index = 0) => {
    setImageViewerIndex(index);
    setImageViewerVisible(true);
  }, []);

  // Get all images for the viewer
  const getAllImages = useCallback(() => {
    if (post.media_urls?.length > 0) {
      return post.media_urls;
    }
    if (post.image_url) {
      return [post.image_url];
    }
    if (post.media_url) {
      return [post.media_url];
    }
    return [];
  }, [post.media_urls, post.image_url, post.media_url]);

  // Get image count for badge display
  const getImageCount = useCallback(() => {
    if (post.media_urls?.length > 0) {
      return post.media_urls.length;
    }
    if (post.image_count) {
      return post.image_count;
    }
    return 1;
  }, [post.media_urls, post.image_count]);

  // Handle save/bookmark
  const handleSave = async () => {
    const wasSaved = isSaved;
    setIsSaved(!wasSaved);

    try {
      if (wasSaved) {
        await forumService.unsavePost(post.id);
      } else {
        await forumService.savePost(post.id);
      }
    } catch (error) {
      console.error('[PostCard] Save error:', error);
      setIsSaved(wasSaved);
    }
  };

  // Handle hide post
  const handleHidePost = async () => {
    setShowMenu(false);
    try {
      const result = await blockService.hidePost(post.id);
      if (result.success) {
        setIsHidden(true);
        Alert.alert('Đã ẩn', 'Bài viết đã được ẩn khỏi bảng tin của bạn');
        // Notify parent to remove from list
        if (onUpdate) {
          onUpdate(post.id, { hidden: true });
        }
      }
    } catch (error) {
      console.error('[PostCard] Hide error:', error);
    }
  };

  // Handle block user
  const handleBlockUser = async () => {
    setShowMenu(false);
    const authorId = post.author?.id || post.user?.id || post.user_id;
    const authorName = post.author?.full_name || post.author?.email?.split('@')[0] || 'người dùng này';

    Alert.alert(
      'Chặn người dùng',
      `Bạn có chắc muốn chặn ${authorName}? Bạn sẽ không thấy bài viết của họ nữa.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Chặn',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await blockService.blockUser(authorId);
              if (result.success) {
                Alert.alert('Đã chặn', `${authorName} đã bị chặn`);
              }
            } catch (error) {
              console.error('[PostCard] Block error:', error);
            }
          },
        },
      ]
    );
  };

  // Handle report
  const handleReport = () => {
    setShowMenu(false);
    setShowReportModal(true);
  };

  // Handle delete (own post only)
  const handleDelete = () => {
    setShowMenu(false);
    Alert.alert(
      'Xóa bài viết',
      'Bạn có chắc muốn xóa bài viết này? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await forumService.deletePost(post.id);
              Alert.alert('Đã xóa', 'Bài viết đã được xóa');
              if (onUpdate) {
                onUpdate(post.id, { deleted: true });
              }
            } catch (error) {
              console.error('[PostCard] Delete error:', error);
              Alert.alert('Lỗi', 'Không thể xóa bài viết');
            }
          },
        },
      ]
    );
  };

  // Get author info - supports both 'author' (from join) and 'user' (legacy)
  const authorId = post.author?.id || post.user?.id || post.user_id;
  const authorName = post.author?.full_name
    || post.author?.email?.split('@')[0]
    || post.user?.full_name
    || 'Anonymous';

  const authorAvatar = post.author?.avatar_url
    || post.user?.avatar_url
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=6A5BFF&color=fff`;

  // Navigate to author profile
  const handleAuthorPress = () => {
    if (authorId) {
      navigation.navigate('UserProfile', { userId: authorId });
    }
  };

  // Check if content needs "View More" button
  const handleTextLayout = useCallback((e) => {
    // Check if text was truncated (more than 3 lines)
    if (e.nativeEvent.lines && e.nativeEvent.lines.length > 3) {
      setShowViewMore(true);
    }
  }, []);

  // Render content with clickable hashtags
  const renderContentWithHashtags = (text) => {
    if (!text) return null;

    // Check if content is long enough to potentially need truncation
    const isLongContent = text.length > 150;
    const shouldTruncate = !isExpanded && isLongContent;

    // Regex to match hashtags
    const hashtagRegex = /#([\w\u00C0-\u024F\u1E00-\u1EFF]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = hashtagRegex.exec(text)) !== null) {
      // Add text before hashtag
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
        });
      }

      // Add hashtag
      parts.push({
        type: 'hashtag',
        content: match[0],
        tag: match[1],
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex),
      });
    }

    // If no hashtags found, return simple text
    if (parts.length === 0) {
      return (
        <View>
          <Text
            style={styles.content}
            numberOfLines={shouldTruncate ? 3 : undefined}
            onTextLayout={handleTextLayout}
          >
            {text}
          </Text>
          {isLongContent && !isExpanded && (
            <TouchableOpacity onPress={() => setIsExpanded(true)}>
              <Text style={styles.viewMoreText}>Xem thêm</Text>
            </TouchableOpacity>
          )}
          {isExpanded && isLongContent && (
            <TouchableOpacity onPress={() => setIsExpanded(false)}>
              <Text style={styles.viewMoreText}>Thu gọn</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <View>
        <Text
          style={styles.content}
          numberOfLines={shouldTruncate ? 3 : undefined}
          onTextLayout={handleTextLayout}
        >
          {parts.map((part, index) => {
            if (part.type === 'hashtag') {
              return (
                <Text
                  key={`hashtag-${index}`}
                  style={styles.hashtag}
                  onPress={() => navigation.navigate('HashtagFeed', { hashtag: part.tag })}
                >
                  {part.content}
                </Text>
              );
            }
            return <Text key={`text-${index}`}>{part.content}</Text>;
          })}
        </Text>
        {isLongContent && !isExpanded && (
          <TouchableOpacity onPress={() => setIsExpanded(true)}>
            <Text style={styles.viewMoreText}>Xem thêm</Text>
          </TouchableOpacity>
        )}
        {isExpanded && isLongContent && (
          <TouchableOpacity onPress={() => setIsExpanded(false)}>
            <Text style={styles.viewMoreText}>Thu gọn</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Pressable style={styles.card} onPress={handleDoubleTap}>
      {/* Boosted Badge - Shows if post is boosted */}
      {post.is_boosted && <BoostedBadge />}

      {/* Author Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAuthorPress} activeOpacity={0.7}>
          <Image
            source={{ uri: authorAvatar }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerText} onPress={handleAuthorPress} activeOpacity={0.7}>
          <View style={styles.authorRow}>
            <Text style={styles.authorName}>{authorName}</Text>
            <UserBadges user={post.author || post.user} size="tiny" maxBadges={2} />
          </View>
          <View style={styles.timestampRow}>
            <Text style={styles.timestamp}>{formatTimestamp(post.created_at)}</Text>
            {/* Edited Badge */}
            {post.edited_at && (
              <View style={styles.editedBadge}>
                <Edit2 size={10} color={COLORS.textMuted} />
                <Text style={styles.editedText}>Đã chỉnh sửa</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        {post.category && (
          <View style={[styles.categoryBadge, { borderColor: post.category?.color || COLORS.gold }]}>
            <Text style={[styles.categoryText, { color: post.category?.color || COLORS.gold }]}>
              {post.category?.name}
            </Text>
          </View>
        )}

        {/* More Options Button */}
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => setShowMenu(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MoreHorizontal size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Title & Content - with clickable hashtags */}
      <Text style={styles.title} numberOfLines={2}>{post.title}</Text>
      {renderContentWithHashtags(post.content)}

      {/* Post Image/Media - Support both single and multiple images with progressive loading */}
      {(post.media_urls?.length > 0 || post.image_url || post.media_url) && (
        <View style={styles.mediaContainer}>
          {/* Use carousel for multiple images, progressive image for single */}
          {post.media_urls?.length > 1 ? (
            <PostImageCarousel
              images={post.media_urls}
              height={getImageDisplayHeight(post, SCREEN_WIDTH - (GLASS.padding * 2))}
              showCounter={true}
              showDots={true}
              onImagePress={handleImagePress}
            />
          ) : (
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={() => handleImagePress(0)}
            >
              <ProgressiveImage
                source={{ uri: post.media_urls?.[0] || post.image_url || post.media_url }}
                thumbnailSource={post.thumbnail_url ? { uri: post.thumbnail_url } : undefined}
                placeholderSource={post.placeholder_url ? { uri: post.placeholder_url } : undefined}
                blurhash={post.image_blurhash}
                style={[
                  styles.postImage,
                  {
                    height: getImageDisplayHeight(post, SCREEN_WIDTH - (GLASS.padding * 2))
                  }
                ]}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}

          {/* Shopping Tags Overlay - Shows clickable product tags on image */}
          {post.product_tags && post.product_tags.length > 0 && (
            <ShoppingTagOverlay
              tags={post.product_tags}
              editable={false}
            />
          )}

          {/* Big Heart Overlay (Instagram style) */}
          <Animated.View
            style={[
              styles.bigHeartOverlay,
              {
                opacity: bigHeartOpacity,
                transform: [{ scale: bigHeartScale }],
              },
            ]}
            pointerEvents="none"
          >
            <Heart size={80} color="#FFFFFF" fill="#FF6B6B" strokeWidth={0} />
          </Animated.View>

          {/* Image Count Badge (shows when multiple images) */}
          {getImageCount() > 1 && (
            <View style={styles.imageCountBadge}>
              <Layers size={14} color={COLORS.textPrimary} />
              <Text style={styles.imageCountText}>{getImageCount()}</Text>
            </View>
          )}
        </View>
      )}

      {/* Sound Card - Shows attached sound/music */}
      {post.sound && (
        <SoundCard
          sound={post.sound}
          onPress={() => navigation.navigate('SoundDetail', { soundId: post.sound.id })}
        />
      )}

      {/* Big Heart for posts without media */}
      {!post.media_urls?.length && !post.image_url && !post.media_url && (
        <Animated.View
          style={[
            styles.bigHeartOverlayNoMedia,
            {
              opacity: bigHeartOpacity,
              transform: [{ scale: bigHeartScale }],
            },
          ]}
          pointerEvents="none"
        >
          <Heart size={80} color="#FFFFFF" fill="#FF6B6B" strokeWidth={0} />
        </Animated.View>
      )}

      {/* NEW: Received Gifts Bar - shows if post has gifts */}
      {post.gift_summary?.total_count > 0 && (
        <ReceivedGiftsBar
          gifts={post.gift_summary?.gifts || []}
          totalCount={post.gift_summary?.total_count || 0}
          onPress={() => navigation.navigate('PostGifts', { postId: post.id })}
        />
      )}

      {/* NEW: Quoted Post - shows if this is a repost */}
      {post.original_post_id && post.original_post && (
        <QuotedPost post={post.original_post} />
      )}

      {/* Action Bar - UPDATED with Repost, Gift buttons */}
      <View style={styles.footer}>
        {/* Like Button - Wrapped with AuthGate + Animation */}
        <AuthGate action="thích bài viết này">
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLike}
            activeOpacity={0.7}
            disabled={isLiking}
          >
            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
              <Heart
                size={22}
                color={isLiked ? '#FF6B6B' : COLORS.textMuted}
                fill={isLiked ? '#FF6B6B' : 'transparent'}
                strokeWidth={2}
              />
            </Animated.View>
            {likesCount > 0 && (
              <TouchableOpacity onPress={handleViewReactions}>
                <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
                  {likesCount}
                </Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </AuthGate>

        {/* Comment Button - Wrapped with AuthGate */}
        <AuthGate action="bình luận bài viết này">
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleComment}
            activeOpacity={0.7}
          >
            <MessageCircle size={20} color={COLORS.textMuted} />
            <Text style={styles.actionText}>{post.comments_count || 0}</Text>
          </TouchableOpacity>
        </AuthGate>

        {/* NEW: Repost Button - Wrapped with AuthGate */}
        <AuthGate action="chia sẻ lại bài viết này">
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRepost}
            activeOpacity={0.7}
          >
            <Repeat2
              size={18}
              color={post.user_reposted ? COLORS.success : COLORS.textMuted}
            />
            {(post.repost_count || 0) > 0 && (
              <Text style={[styles.actionText, post.user_reposted && styles.actionTextRepost]}>
                {post.repost_count}
              </Text>
            )}
          </TouchableOpacity>
        </AuthGate>

        {/* NEW: Gift Button - Wrapped with AuthGate */}
        <AuthGate action="tặng quà cho bài viết này">
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleGift}
            activeOpacity={0.7}
          >
            <Gift size={18} color={COLORS.gold} />
          </TouchableOpacity>
        </AuthGate>

        {/* Share Button - Opens ShareSheet */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Send size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Save/Bookmark Button - Wrapped with AuthGate */}
        <AuthGate action="lưu bài viết này">
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <Bookmark
              size={18}
              color={isSaved ? COLORS.gold : COLORS.textMuted}
              fill={isSaved ? COLORS.gold : 'transparent'}
            />
          </TouchableOpacity>
        </AuthGate>
      </View>

      {/* More Options Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Tùy chọn</Text>
              <TouchableOpacity onPress={() => setShowMenu(false)}>
                <X size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Own post options */}
            {user?.id === authorId && (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    navigation.navigate('EditPost', { post });
                  }}
                >
                  <Edit2 size={20} color={COLORS.textPrimary} />
                  <Text style={styles.menuItemText}>Chỉnh sửa bài viết</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuItem, styles.menuItemDanger]}
                  onPress={handleDelete}
                >
                  <Trash2 size={20} color={COLORS.error} />
                  <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Xóa bài viết</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Other user's post options */}
            {user?.id !== authorId && (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={handleHidePost}>
                  <EyeOff size={20} color={COLORS.textPrimary} />
                  <Text style={styles.menuItemText}>Ẩn bài viết này</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={handleBlockUser}>
                  <UserX size={20} color={COLORS.textPrimary} />
                  <Text style={styles.menuItemText}>Chặn người dùng</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuItem, styles.menuItemDanger]}
                  onPress={handleReport}
                >
                  <Flag size={20} color={COLORS.error} />
                  <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Báo cáo bài viết</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Report Modal */}
      <ReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        postId={post.id}
        onSuccess={() => {
          console.log('[PostCard] Report submitted successfully');
        }}
      />

      {/* NEW: Feature Integration Sheets */}
      <ShareSheet
        visible={shareSheetVisible}
        onClose={() => setShareSheetVisible(false)}
        post={post}
      />

      <RepostSheet
        visible={repostSheetVisible}
        onClose={() => setRepostSheetVisible(false)}
        post={post}
        onSuccess={() => {
          console.log('[PostCard] Repost successful');
          if (onUpdate) {
            onUpdate(post.id, { repost_count: (post.repost_count || 0) + 1, user_reposted: true });
          }
        }}
      />

      <GiftCatalogSheet
        visible={giftSheetVisible}
        onClose={() => setGiftSheetVisible(false)}
        receiverUserId={authorId}
        contextType="post"
        contextId={post.id}
        onGiftSent={() => {
          console.log('[PostCard] Gift sent successfully');
        }}
      />

      <ReactionsListSheet
        visible={reactionsVisible}
        onClose={() => setReactionsVisible(false)}
        postId={post.id}
      />

      {/* Image Viewer - Full screen tap-to-view */}
      <ImageViewer
        visible={imageViewerVisible}
        images={getAllImages()}
        initialIndex={imageViewerIndex}
        onClose={() => setImageViewerVisible(false)}
        showCounter={true}
        showActions={false}
      />
    </Pressable>
  );
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const now = new Date();
  const postDate = new Date(timestamp);
  const diffMins = Math.floor((now - postDate) / 60000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return postDate.toLocaleDateString('vi-VN');
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    padding: GLASS.padding,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.glassBg,
  },
  headerText: {
    flex: 1
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  editedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  editedText: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  content: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  hashtag: {
    color: COLORS.cyan,
    fontWeight: '600',
  },
  viewMoreText: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginTop: SPACING.xs,
  },
  mediaContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  postImage: {
    width: '100%',
    // Height is now dynamically calculated via getImageDisplayHeight
    borderRadius: 12,
    backgroundColor: COLORS.glassBg,
    overflow: 'hidden',
  },
  // Image count badge (top-right corner)
  imageCountBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  imageCountText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  bigHeartOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    // Add shadow for visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  bigHeartOverlayNoMedia: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    marginRight: SPACING.md,
    gap: 6,
  },
  actionButtonRight: {
    marginLeft: 'auto',
    marginRight: 0,
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },
  actionTextActive: {
    color: COLORS.error,
  },
  actionTextRepost: {
    color: COLORS.success,
  },
  // More button
  moreButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  // Menu overlay and container
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: GLASS.background,
    borderTopLeftRadius: GLASS.borderRadius,
    borderTopRightRadius: GLASS.borderRadius,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl + 20,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  menuItemText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },
  menuItemDanger: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemTextDanger: {
    color: COLORS.error,
  },
});

export default PostCard;
