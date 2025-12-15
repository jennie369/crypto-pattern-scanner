/**
 * Gemral - Post Card Component
 * Displays forum post preview with interactive actions
 * Includes AuthGate for like/comment buttons
 * WITH LIKE ANIMATION
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Share, Animated, Pressable, Modal, Dimensions, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import CustomAlert, { useCustomAlert } from '../../../components/CustomAlert';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Edit2, Flag, EyeOff, UserX, Trash2, X, Repeat2, Gift, Send, Layers } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const { user, isAuthenticated, isAdmin } = useAuth();
  const insets = useSafeAreaInsets();
  const { alert, AlertComponent } = useCustomAlert();

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

  // Inline comments state (Facebook-style)
  const [showComments, setShowComments] = useState(false);
  const [inlineComments, setInlineComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const commentInputRef = useRef(null);

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

  // Load inline comments (Facebook-style preview)
  const loadInlineComments = useCallback(async () => {
    if (commentsLoading) return;
    setCommentsLoading(true);
    try {
      const comments = await forumService.getCommentsWithReplies(post.id, 1, 2); // Get latest 2 comments
      setInlineComments(comments || []);
    } catch (error) {
      console.error('[PostCard] Load comments error:', error);
    } finally {
      setCommentsLoading(false);
    }
  }, [post.id, commentsLoading]);

  // Toggle inline comments visibility
  const toggleComments = useCallback(() => {
    if (!showComments && inlineComments.length === 0) {
      loadInlineComments();
    }
    setShowComments(!showComments);
  }, [showComments, inlineComments.length, loadInlineComments]);

  // Handle comment button press - now toggles inline comments
  const handleComment = () => {
    toggleComments();
  };

  // Submit inline comment
  const handleSubmitComment = async () => {
    if (!commentText.trim() || submittingComment) return;
    if (!isAuthenticated) {
      alert({
        type: 'warning',
        title: 'Đăng Nhập Cần Thiết',
        message: 'Bạn cần đăng nhập để bình luận',
        buttons: [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Auth') },
        ],
      });
      return;
    }

    setSubmittingComment(true);
    try {
      const { data } = await forumService.createComment(post.id, commentText.trim(), null);
      if (data) {
        const newComment = {
          ...data,
          author: {
            id: user?.id,
            full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Bạn',
            avatar_url: user?.user_metadata?.avatar_url,
          },
          replies: [],
        };
        setInlineComments(prev => [newComment, ...prev].slice(0, 3)); // Keep max 3 comments inline
        setCommentsCount(prev => prev + 1);
        setCommentText('');
        // Make sure comments are visible
        if (!showComments) setShowComments(true);
      }
    } catch (error) {
      console.error('[PostCard] Submit comment error:', error);
      alert({ type: 'error', title: 'Lỗi', message: 'Không thể gửi bình luận' });
    } finally {
      setSubmittingComment(false);
    }
  };

  // Format timestamp for comments
  const formatCommentTime = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins}ph`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('vi-VN');
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

  // Handle tap on image - open full screen viewer with overlay
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
        alert({ type: 'success', title: 'Đã ẩn', message: 'Bài viết đã được ẩn khỏi bảng tin của bạn' });
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

    alert({
      type: 'warning',
      title: 'Chặn người dùng',
      message: `Bạn có chắc muốn chặn ${authorName}? Bạn sẽ không thấy bài viết của họ nữa.`,
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Chặn',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await blockService.blockUser(authorId);
              if (result.success) {
                alert({ type: 'success', title: 'Đã chặn', message: `${authorName} đã bị chặn` });
              }
            } catch (error) {
              console.error('[PostCard] Block error:', error);
            }
          },
        },
      ],
    });
  };

  // Handle report
  const handleReport = () => {
    setShowMenu(false);
    setShowReportModal(true);
  };

  // Handle delete (own post only)
  const handleDelete = () => {
    setShowMenu(false);
    alert({
      type: 'warning',
      title: 'Xóa bài viết',
      message: 'Bạn có chắc muốn xóa bài viết này? Hành động này không thể hoàn tác.',
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await forumService.deletePost(post.id);
              alert({ type: 'success', title: 'Đã xóa', message: 'Bài viết đã được xóa' });
              if (onUpdate) {
                onUpdate(post.id, { deleted: true });
              }
            } catch (error) {
              console.error('[PostCard] Delete error:', error);
              alert({ type: 'error', title: 'Lỗi', message: 'Không thể xóa bài viết' });
            }
          },
        },
      ],
    });
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

  // Parse markdown text (bold, italic) into styled segments
  const parseMarkdown = (text) => {
    if (!text) return [{ type: 'text', content: text }];

    const segments = [];
    // Combined regex for **bold** and *italic* (bold first to avoid conflict)
    const markdownRegex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = markdownRegex.exec(text)) !== null) {
      // Add text before markdown
      if (match.index > lastIndex) {
        segments.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
        });
      }

      // Check if bold (**text**) or italic (*text*)
      if (match[2]) {
        // Bold: **text**
        segments.push({
          type: 'bold',
          content: match[2],
        });
      } else if (match[3]) {
        // Italic: *text*
        segments.push({
          type: 'italic',
          content: match[3],
        });
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex),
      });
    }

    return segments.length > 0 ? segments : [{ type: 'text', content: text }];
  };

  // Render a single text segment with proper styling
  const renderTextSegment = (segment, index) => {
    if (segment.type === 'bold') {
      return (
        <Text key={`bold-${index}`} style={styles.boldText}>
          {segment.content}
        </Text>
      );
    }
    if (segment.type === 'italic') {
      return (
        <Text key={`italic-${index}`} style={styles.italicText}>
          {segment.content}
        </Text>
      );
    }
    return <Text key={`text-${index}`}>{segment.content}</Text>;
  };

  // Render content with clickable hashtags, @mentions, and markdown support
  const renderContentWithHashtags = (text) => {
    if (!text) return null;

    // Check if content is long enough to potentially need truncation
    const isLongContent = text.length > 150;
    const shouldTruncate = !isExpanded && isLongContent;

    // First parse markdown, then parse hashtags and mentions within each segment
    const markdownSegments = parseMarkdown(text);

    // Now parse hashtags AND mentions within text segments
    const parts = [];
    const hashtagRegex = /#([\w\u00C0-\u024F\u1E00-\u1EFF]+)/g;
    const mentionRegex = /@([\w\u00C0-\u024F\u1E00-\u1EFF\s]+?)(?=\s|$|[.,!?])/g;

    markdownSegments.forEach((segment, segIndex) => {
      if (segment.type !== 'text') {
        // Bold/italic segments - check for hashtags inside them too
        const innerText = segment.content;
        let lastIndex = 0;
        let match;
        const innerParts = [];

        while ((match = hashtagRegex.exec(innerText)) !== null) {
          if (match.index > lastIndex) {
            innerParts.push({
              type: segment.type,
              content: innerText.slice(lastIndex, match.index),
            });
          }
          innerParts.push({
            type: 'hashtag',
            content: match[0],
            tag: match[1],
            style: segment.type, // Preserve bold/italic style for hashtag
          });
          lastIndex = match.index + match[0].length;
        }

        if (lastIndex < innerText.length) {
          innerParts.push({
            type: segment.type,
            content: innerText.slice(lastIndex),
          });
        }

        if (innerParts.length > 0) {
          parts.push(...innerParts);
        } else {
          parts.push(segment);
        }
        hashtagRegex.lastIndex = 0; // Reset regex
      } else {
        // Plain text segment - parse hashtags and mentions
        const innerText = segment.content;
        // Combined regex for hashtags and mentions
        const combinedRegex = /(#[\w\u00C0-\u024F\u1E00-\u1EFF]+)|(@[\w\u00C0-\u024F\u1E00-\u1EFF\s]+?)(?=\s|$|[.,!?])/g;
        let lastIndex = 0;
        let match;

        while ((match = combinedRegex.exec(innerText)) !== null) {
          if (match.index > lastIndex) {
            parts.push({
              type: 'text',
              content: innerText.slice(lastIndex, match.index),
            });
          }

          const matchedText = match[0];
          if (matchedText.startsWith('#')) {
            parts.push({
              type: 'hashtag',
              content: matchedText,
              tag: matchedText.slice(1),
            });
          } else if (matchedText.startsWith('@')) {
            parts.push({
              type: 'mention',
              content: matchedText,
              username: matchedText.slice(1).trim(),
            });
          }
          lastIndex = match.index + match[0].length;
        }

        if (lastIndex < innerText.length) {
          parts.push({
            type: 'text',
            content: innerText.slice(lastIndex),
          });
        }
        combinedRegex.lastIndex = 0; // Reset regex
      }
    });

    // Handle mention press - navigate to user profile
    const handleMentionPress = (username) => {
      // Navigate to UserProfile screen with username search
      navigation.navigate('UserProfile', { username: username });
    };

    // Render all parts
    const renderPart = (part, index) => {
      if (part.type === 'hashtag') {
        const hashtagStyle = [styles.hashtag];
        if (part.style === 'bold') hashtagStyle.push(styles.boldText);
        if (part.style === 'italic') hashtagStyle.push(styles.italicText);

        return (
          <Text
            key={`hashtag-${index}`}
            style={hashtagStyle}
            onPress={() => navigation.navigate('HashtagFeed', { hashtag: part.tag })}
          >
            {part.content}
          </Text>
        );
      }
      if (part.type === 'mention') {
        return (
          <Text
            key={`mention-${index}`}
            style={styles.mention}
            onPress={() => handleMentionPress(part.username)}
          >
            {part.content}
          </Text>
        );
      }
      if (part.type === 'bold') {
        return (
          <Text key={`bold-${index}`} style={styles.boldText}>
            {part.content}
          </Text>
        );
      }
      if (part.type === 'italic') {
        return (
          <Text key={`italic-${index}`} style={styles.italicText}>
            {part.content}
          </Text>
        );
      }
      return <Text key={`text-${index}`}>{part.content}</Text>;
    };

    return (
      <View>
        <Text
          style={styles.content}
          numberOfLines={shouldTruncate ? 3 : undefined}
          onTextLayout={handleTextLayout}
        >
          {parts.map(renderPart)}
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

      {/* Content - with clickable hashtags (first line is bold title) */}
      {/* Tap on content text navigates to post detail */}
      <TouchableOpacity activeOpacity={0.8} onPress={() => onPress?.(post)}>
        {renderContentWithHashtags(post.content)}
      </TouchableOpacity>

      {/* Post Image/Media - Support both single and multiple images with progressive loading */}
      {/* Images are full-bleed (edge-to-edge), using SCREEN_WIDTH for container */}
      {(post.media_urls?.length > 0 || post.image_url || post.media_url) && (
        <View style={styles.mediaContainer}>
          {/* Use grid for multiple images (Facebook style), progressive image for single */}
          {post.media_urls?.length > 1 ? (
            <PostImageCarousel
              images={post.media_urls}
              height={post.media_urls.length === 2 ? 280 : 320}
              containerWidth={SCREEN_WIDTH}
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
                    height: getImageDisplayHeight(post, SCREEN_WIDTH)
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

          {/* Image Count Badge - now hidden since grid shows all images */}
          {/* (keeping logic for single image with multiple variants from backend) */}
        </View>
      )}

      {/* Sound Card - Shows attached sound/music */}
      {post.sound && (
        <SoundCard
          sound={post.sound}
          onPress={() => navigation.navigate('SoundDetail', { soundId: post.sound.id })}
        />
      )}

      {/* Tagged Products - Shows products linked to this post */}
      {post.tagged_products && post.tagged_products.length > 0 && (
        <View style={styles.taggedProductsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.taggedProductsScrollContent}
          >
            {post.tagged_products.map((item, index) => {
              // Support both old format (item.product) and new format (flat structure)
              const product = item.product || {
                id: item.product_id,
                title: item.product_title,
                price: item.product_price,
                image: item.product_image,
                handle: item.product_handle,
              };
              return (
                <TouchableOpacity
                  key={item.id || product.id || index}
                  style={styles.taggedProductCard}
                  onPress={() => {
                    // Build full product object with variants array for ProductDetailScreen
                    const productForDetail = {
                      id: product.id,
                      handle: product.handle,
                      title: product.title,
                      price: product.price,
                      image: product.image,
                      images: product.image ? [{ src: product.image }] : [],
                      variants: [{
                        id: product.id,
                        price: typeof product.price === 'string'
                          ? parseFloat(product.price.replace(/[^0-9.-]+/g, ''))
                          : product.price,
                        title: 'Default',
                      }],
                    };
                    navigation.navigate('Shop', {
                      screen: 'ProductDetail',
                      params: { product: productForDetail }
                    });
                  }}
                >
                  {product.image && (
                    <Image source={{ uri: product.image }} style={styles.taggedProductImage} />
                  )}
                  <View style={styles.taggedProductInfo}>
                    <Text style={styles.taggedProductName} numberOfLines={1}>{product.title}</Text>
                    <Text style={styles.taggedProductPrice}>
                      {typeof product.price === 'number'
                        ? new Intl.NumberFormat('vi-VN').format(product.price) + 'đ'
                        : product.price}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
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

      {/* Facebook-style Action Bar - Left icons + Right icons */}
      <View style={styles.actionBar}>
        {/* Left side - Like, Comment, Share */}
        <View style={styles.actionBarLeft}>
          {/* Like Button */}
          <AuthGate action="thích bài viết này">
            <TouchableOpacity
              style={styles.actionBtn}
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
            </TouchableOpacity>
          </AuthGate>
          {/* Likes Count - Tap to see who liked */}
          {likesCount > 0 && (
            <TouchableOpacity
              onPress={() => setReactionsVisible(true)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 10 }}
            >
              <Text style={[styles.actionCount, styles.likesCountTappable, isLiked && styles.actionCountActive]}>
                {likesCount}
              </Text>
            </TouchableOpacity>
          )}

          {/* Comment Button */}
          <AuthGate action="bình luận bài viết này">
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleComment}
              activeOpacity={0.7}
            >
              <MessageCircle size={22} color={showComments ? COLORS.cyan : COLORS.textMuted} />
              {(commentsCount > 0) && (
                <Text style={[styles.actionCount, showComments && { color: COLORS.cyan }]}>{commentsCount}</Text>
              )}
            </TouchableOpacity>
          </AuthGate>

          {/* Share Button */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Send size={20} color={COLORS.textMuted} />
            {(post.share_count > 0) && (
              <Text style={styles.actionCount}>{post.share_count}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Right side - Repost, Gift, Save */}
        <View style={styles.actionBarRight}>
          {/* Repost */}
          <AuthGate action="chia sẻ lại bài viết này">
            <TouchableOpacity style={styles.actionBtn} onPress={handleRepost}>
              <Repeat2 size={20} color={post.user_reposted ? COLORS.success : COLORS.textMuted} />
            </TouchableOpacity>
          </AuthGate>

          {/* Gift */}
          <AuthGate action="tặng quà cho bài viết này">
            <TouchableOpacity style={styles.actionBtn} onPress={handleGift}>
              <Gift size={20} color={COLORS.gold} />
            </TouchableOpacity>
          </AuthGate>

          {/* Save */}
          <AuthGate action="lưu bài viết này">
            <TouchableOpacity style={styles.actionBtn} onPress={handleSave}>
              <Bookmark
                size={20}
                color={isSaved ? COLORS.gold : COLORS.textMuted}
                fill={isSaved ? COLORS.gold : 'transparent'}
              />
            </TouchableOpacity>
          </AuthGate>
        </View>
      </View>

      {/* Inline Comments Section - Facebook Style */}
      {showComments && (
        <View style={styles.inlineCommentsSection}>
          {/* Loading state */}
          {commentsLoading && (
            <View style={styles.commentsLoading}>
              <ActivityIndicator size="small" color={COLORS.gold} />
            </View>
          )}

          {/* View all comments link */}
          {commentsCount > 2 && (
            <TouchableOpacity
              style={styles.viewAllComments}
              onPress={() => navigation.navigate('PostDetail', { postId: post.id, focusComment: true })}
            >
              <Text style={styles.viewAllCommentsText}>
                Xem tất cả {commentsCount} bình luận
              </Text>
            </TouchableOpacity>
          )}

          {/* Inline comments list */}
          {inlineComments.map((comment) => (
            <View key={comment.id} style={styles.inlineComment}>
              <TouchableOpacity
                onPress={() => navigation.navigate('UserProfile', { userId: comment.author?.id })}
              >
                <Image
                  source={{
                    uri: comment.author?.avatar_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author?.full_name || 'U')}&background=6A5BFF&color=fff`
                  }}
                  style={styles.inlineCommentAvatar}
                />
              </TouchableOpacity>
              <View style={styles.inlineCommentContent}>
                <View style={styles.inlineCommentBubble}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('UserProfile', { userId: comment.author?.id })}
                  >
                    <Text style={styles.inlineCommentAuthor}>
                      {comment.author?.full_name || 'Người dùng'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.inlineCommentText}>{comment.content}</Text>
                </View>
                <View style={styles.inlineCommentMeta}>
                  <Text style={styles.inlineCommentTime}>{formatCommentTime(comment.created_at)}</Text>
                  <TouchableOpacity>
                    <Text style={styles.inlineCommentAction}>Thích</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('PostDetail', { postId: post.id, focusComment: true })}
                  >
                    <Text style={styles.inlineCommentAction}>Trả lời</Text>
                  </TouchableOpacity>
                </View>
                {/* Show first reply if exists */}
                {comment.replies && comment.replies.length > 0 && (
                  <View style={styles.inlineReply}>
                    <Image
                      source={{
                        uri: comment.replies[0].author?.avatar_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.replies[0].author?.full_name || 'U')}&background=6A5BFF&color=fff`
                      }}
                      style={styles.inlineReplyAvatar}
                    />
                    <View style={styles.inlineReplyBubble}>
                      <Text style={styles.inlineCommentAuthor}>
                        {comment.replies[0].author?.full_name || 'Người dùng'}
                      </Text>
                      <Text style={styles.inlineCommentText}>{comment.replies[0].content}</Text>
                    </View>
                  </View>
                )}
                {comment.replies && comment.replies.length > 1 && (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('PostDetail', { postId: post.id, focusComment: true })}
                  >
                    <Text style={styles.viewMoreReplies}>
                      Xem {comment.replies.length - 1} câu trả lời khác...
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {/* Inline Comment Input */}
          <View style={styles.inlineCommentInputContainer}>
            <Image
              source={{
                uri: user?.user_metadata?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || 'U')}&background=6A5BFF&color=fff`
              }}
              style={styles.inlineCommentInputAvatar}
            />
            <View style={styles.inlineCommentInputWrapper}>
              <TextInput
                ref={commentInputRef}
                style={styles.inlineCommentInput}
                placeholder="Viết bình luận..."
                placeholderTextColor={COLORS.textMuted}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
              />
              {commentText.trim() ? (
                <TouchableOpacity
                  style={styles.inlineCommentSendBtn}
                  onPress={handleSubmitComment}
                  disabled={submittingComment}
                >
                  {submittingComment ? (
                    <ActivityIndicator size="small" color={COLORS.gold} />
                  ) : (
                    <Send size={18} color={COLORS.gold} />
                  )}
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      )}

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
          <View style={[styles.menuContainer, { paddingBottom: Math.max(insets.bottom, SPACING.lg) + SPACING.lg }]}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Tùy chọn</Text>
              <TouchableOpacity onPress={() => setShowMenu(false)}>
                <X size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Own post options - Admin can edit ANY post including seed posts */}
            {(user?.id === authorId || isAdmin) && (
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

            {/* Other user's post options - Hide for admin since they see edit options */}
            {user?.id !== authorId && !isAdmin && (
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
        recipientId={authorId}
        recipientName={authorName}
        postId={post.id}
        onGiftSent={() => {
          console.log('[PostCard] Gift sent successfully');
        }}
      />

      <ReactionsListSheet
        visible={reactionsVisible}
        onClose={() => setReactionsVisible(false)}
        postId={post.id}
        onUserPress={(user) => {
          navigation.navigate('UserProfile', { userId: user?.id });
        }}
      />

      {/* Image Viewer - Full screen tap-to-view with Facebook-style overlay */}
      <ImageViewer
        visible={imageViewerVisible}
        images={getAllImages()}
        initialIndex={imageViewerIndex}
        onClose={() => setImageViewerVisible(false)}
        showCounter={true}
        showActions={false}
        postContent={post.content}
        authorName={authorName}
        showOverlay={true}
      />

      {AlertComponent}
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
  // Facebook-style card: full width, NO padding for edge-to-edge images
  card: {
    backgroundColor: GLASS.background,
    borderRadius: 0, // Full width, no rounded corners (Facebook style)
    borderWidth: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.15)',
    paddingVertical: SPACING.md,
    // NO paddingHorizontal - allows images to be full bleed
    marginBottom: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg, // Header needs padding (card no longer has it)
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
    paddingHorizontal: SPACING.lg, // Title needs padding (card no longer has it)
  },
  content: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg, // Content needs padding (card no longer has it)
  },
  hashtag: {
    color: COLORS.cyan,
    fontWeight: '600',
  },
  mention: {
    color: COLORS.purple,
    fontWeight: '600',
  },
  boldText: {
    fontWeight: 'bold',
  },
  italicText: {
    fontStyle: 'italic',
  },
  viewMoreText: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md, // Add bottom padding to separate from image
    paddingVertical: SPACING.sm, // Larger tap target
    paddingHorizontal: SPACING.lg, // Needs padding (card no longer has it)
  },
  mediaContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  postImage: {
    width: '100%',
    // Height is now dynamically calculated via getImageDisplayHeight
    borderRadius: 0, // Facebook style: NO border radius for full-bleed images
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
  // Facebook-style action bar - left + right split
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
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
  // Compact action button
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // Action count number (no label text, just number)
  actionCount: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },
  // Active state for liked count
  actionCountActive: {
    color: '#FF6B6B',
  },
  // Tappable likes count - shows underline hint
  likesCountTappable: {
    marginLeft: 4,
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  secondaryText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  // Legacy styles (kept for compatibility)
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
    color: '#FF6B6B',
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
    // paddingBottom is set dynamically using insets.bottom
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
  // Tagged Products Styles
  taggedProductsContainer: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg, // Needs padding (card no longer has it)
  },
  taggedProductsScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  taggedProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: 12,
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    maxWidth: 180,
  },
  taggedProductImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: SPACING.sm,
  },
  taggedProductInfo: {
    flex: 1,
  },
  taggedProductName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  taggedProductPrice: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gold,
    marginTop: 2,
  },
  // Inline Comments Section - Facebook Style
  inlineCommentsSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  commentsLoading: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  viewAllComments: {
    paddingVertical: SPACING.sm,
  },
  viewAllCommentsText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  inlineComment: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  inlineCommentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.sm,
  },
  inlineCommentContent: {
    flex: 1,
  },
  inlineCommentBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignSelf: 'flex-start',
    maxWidth: '95%',
  },
  inlineCommentAuthor: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  inlineCommentText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  inlineCommentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: 4,
    marginLeft: SPACING.sm,
  },
  inlineCommentTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  inlineCommentAction: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  inlineReply: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    marginLeft: SPACING.md,
  },
  inlineReplyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: SPACING.xs,
  },
  inlineReplyBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    flex: 1,
  },
  viewMoreReplies: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginLeft: SPACING.md,
  },
  // Inline Comment Input
  inlineCommentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  inlineCommentInputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.sm,
  },
  inlineCommentInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  inlineCommentInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.xs,
    maxHeight: 80,
  },
  inlineCommentSendBtn: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});

export default PostCard;
