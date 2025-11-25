/**
 * GEM Platform - Post Card Component
 * Displays forum post preview with interactive actions
 * Includes AuthGate for like/comment buttons
 * WITH LIKE ANIMATION
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Share, Animated, Pressable } from 'react-native';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import { useAuth } from '../../../contexts/AuthContext';
import AuthGate from '../../../components/AuthGate';
import { forumService } from '../../../services/forumService';

// Double tap detection constants
const DOUBLE_TAP_DELAY = 300; // ms

const PostCard = ({ post, onPress, onLikeChange, onUpdate }) => {
  const navigation = useNavigation();
  const { user, isAuthenticated } = useAuth();

  // Local state for optimistic updates
  const [isLiked, setIsLiked] = useState(post.user_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isSaved, setIsSaved] = useState(post.user_saved || false);
  const [isLiking, setIsLiking] = useState(false);

  // Animation refs
  const likeScale = useRef(new Animated.Value(1)).current;
  const heartBounce = useRef(new Animated.Value(0)).current;

  // Double-tap refs
  const lastTap = useRef(0);
  const bigHeartScale = useRef(new Animated.Value(0)).current;
  const bigHeartOpacity = useRef(new Animated.Value(0)).current;

  // Check if user already liked (from post data)
  useEffect(() => {
    if (user && post.likes) {
      const userLiked = post.likes.some(like => like.user_id === user.id);
      setIsLiked(userLiked);
    } else if (post.user_liked !== undefined) {
      setIsLiked(post.user_liked);
    }
  }, [user, post.likes, post.user_liked]);

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

  // Handle share
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${post.title}\n\n${post.content?.substring(0, 200)}...\n\nXem thêm tại GEM Platform`,
        title: post.title,
      });
    } catch (error) {
      console.error('[PostCard] Share error:', error);
    }
  };

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

  return (
    <Pressable style={styles.card} onPress={handleDoubleTap}>
      {/* Author Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAuthorPress} activeOpacity={0.7}>
          <Image
            source={{ uri: authorAvatar }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerText} onPress={handleAuthorPress} activeOpacity={0.7}>
          <Text style={styles.authorName}>{authorName}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(post.created_at)}</Text>
        </TouchableOpacity>
        {post.category && (
          <View style={[styles.categoryBadge, { borderColor: post.category?.color || COLORS.gold }]}>
            <Text style={[styles.categoryText, { color: post.category?.color || COLORS.gold }]}>
              {post.category?.name}
            </Text>
          </View>
        )}
      </View>

      {/* Title & Content */}
      <Text style={styles.title} numberOfLines={2}>{post.title}</Text>
      <Text style={styles.content} numberOfLines={3}>{post.content}</Text>

      {/* Post Image/Media (if exists) - with double tap overlay */}
      {(post.image_url || post.media_url) && (
        <View style={styles.mediaContainer}>
          <Image
            source={{ uri: post.image_url || post.media_url }}
            style={styles.postImage}
            resizeMode="cover"
          />

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
        </View>
      )}

      {/* Big Heart for posts without media */}
      {!post.image_url && !post.media_url && (
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

      {/* Action Bar */}
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
              <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
                {likesCount}
              </Text>
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

        {/* Share Button - No auth required */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Share2 size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Save/Bookmark Button - Wrapped with AuthGate */}
        <AuthGate action="lưu bài viết này">
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonRight]}
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
  authorName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted
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
  mediaContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: COLORS.glassBg,
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
});

export default PostCard;
