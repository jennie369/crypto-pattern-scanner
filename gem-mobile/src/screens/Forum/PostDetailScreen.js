/**
 * Gemral - Post Detail Screen
 * Shows full post with comments
 * Fixed: Comment input positioned above tab bar
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Keyboard,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Heart, MessageCircle, Send, Reply, X, Edit3, ShoppingBag, Share2, Repeat2, Gift, Bookmark } from 'lucide-react-native';
import ImageViewer from '../../components/ImageViewer';
import GiftCatalogSheet from '../../components/GiftCatalogSheet';
import ReceivedGiftsBar from '../../components/ReceivedGiftsBar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
import { forumService } from '../../services/forumService';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS, LAYOUT } from '../../utils/tokens';
import { UserBadges } from '../../components/UserBadge';
import UserLink from '../../components/Common/UserLink';

import { CONTENT_BOTTOM_PADDING, ACTION_BUTTON_BOTTOM_PADDING } from '../../constants/layout';
import { useTabBar } from '../../contexts/TabBarContext';

// Tab bar total height including safe area
// GlassBottomTab is 76px + bottomPadding (max of insets.bottom or 8px)
// We need to position input ABOVE the entire tab bar
const TAB_BAR_VISIBLE_HEIGHT = 76; // Just the visible tab bar part

// NOTE: renderFormattedText is now defined inside the component to access navigation

const PostDetailScreen = ({ route, navigation }) => {
  const { postId, focusComment } = route.params || {};
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();
  const insets = useSafeAreaInsets();

  // Get keyboard state from TabBarContext (tab bar auto-hides when keyboard shows)
  let tabBarKeyboardVisible = false;
  try {
    const tabBar = useTabBar();
    tabBarKeyboardVisible = tabBar?.keyboardVisible || false;
  } catch (e) {
    // Context not available
  }

  // Calculate actual bottom offset including safe area
  // Tab bar total = 76px (visible) + max(insets.bottom, 8px) for safe area
  // Input should sit just above the entire tab bar
  const tabBarBottomPadding = Math.max(insets.bottom, 8);
  const TOTAL_TAB_BAR_HEIGHT = TAB_BAR_VISIBLE_HEIGHT + tabBarBottomPadding;

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // { id, authorName }

  // Image viewer state
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  // Gift sheet state
  const [giftSheetVisible, setGiftSheetVisible] = useState(false);

  // Keyboard handling refs
  const inputRef = useRef(null);
  const scrollViewRef = useRef(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Reload post data when screen comes into focus
  // This ensures updated content is shown after editing
  useFocusEffect(
    useCallback(() => {
      console.log('[PostDetailScreen] Screen focused, reloading post:', postId);
      loadPost();

      // Focus comment input if requested
      if (focusComment) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 500);
      }
    }, [postId, focusComment])
  );

  // Keyboard listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        const kbHeight = e.endCoordinates.height;
        const screenY = e.endCoordinates.screenY;
        const screenHeight = Dimensions.get('screen').height;
        const windowHeight = Dimensions.get('window').height;
        console.log('[PostDetail] Keyboard show - kbHeight:', kbHeight, 'screenY:', screenY, 'screenH:', screenHeight, 'windowH:', windowHeight, 'insets.bottom:', insets.bottom);

        // On Android, use screenHeight - screenY for more accurate keyboard position
        const actualKeyboardHeight = Platform.OS === 'android' ? (screenHeight - screenY) : kbHeight;
        console.log('[PostDetail] Using actualKeyboardHeight:', actualKeyboardHeight);

        setKeyboardVisible(true);
        setKeyboardHeight(actualKeyboardHeight);

        // Scroll to bottom after keyboard shows
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 150);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        console.log('[PostDetail] Keyboard hide');
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Helper to render markdown-like text with **bold**, #hashtags, and @mentions
  const renderFormattedText = (text, baseStyle) => {
    if (!text) return null;

    // Combined regex to match **bold**, #hashtags, and @mentions
    // @mentions: @followed by word characters until space or punctuation
    const combinedRegex = /(\*\*[^*]+\*\*)|(#[\w\u00C0-\u024F\u1E00-\u1EFF]+)|(@[\w\u00C0-\u024F\u1E00-\u1EFF]+)/g;

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
        });
      }

      const matchedText = match[0];
      if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
        parts.push({
          type: 'bold',
          content: matchedText.slice(2, -2),
        });
      } else if (matchedText.startsWith('#')) {
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

      lastIndex = match.index + matchedText.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex),
      });
    }

    // Handle @mention press - navigate to user profile
    const handleMentionPress = (username) => {
      navigation.navigate('UserProfile', { username });
    };

    // Handle hashtag press - navigate to hashtag feed
    const handleHashtagPress = (tag) => {
      navigation.navigate('HashtagFeed', { hashtag: tag });
    };

    return parts.map((part, index) => {
      if (part.type === 'bold') {
        return (
          <Text key={`bold-${index}`} style={[baseStyle, { fontWeight: 'bold', color: COLORS.gold }]}>
            {part.content}
          </Text>
        );
      }
      if (part.type === 'hashtag') {
        return (
          <Text
            key={`hashtag-${index}`}
            style={[baseStyle, { color: COLORS.cyan }]}
            onPress={() => handleHashtagPress(part.tag)}
          >
            {part.content}
          </Text>
        );
      }
      if (part.type === 'mention') {
        return (
          <Text
            key={`mention-${index}`}
            style={[baseStyle, { color: COLORS.cyan, fontWeight: '600' }]}
            onPress={() => handleMentionPress(part.username)}
          >
            {part.content}
          </Text>
        );
      }
      return <Text key={`text-${index}`} style={baseStyle}>{part.content}</Text>;
    });
  };

  const loadPost = async () => {
    try {
      const [postData, commentsData] = await Promise.all([
        forumService.getPostById(postId),
        forumService.getCommentsWithReplies(postId),
      ]);
      setPost(postData);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (liked) {
      await forumService.unlikePost(postId);
      setLiked(false);
      setPost(prev => ({ ...prev, likes_count: (prev.likes_count || 1) - 1 }));
    } else {
      await forumService.likePost(postId);
      setLiked(true);
      setPost(prev => ({ ...prev, likes_count: (prev.likes_count || 0) + 1 }));
    }
  };

  const handleComment = async () => {
    if (!comment.trim() || submitting) return;

    // Check authentication
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

    setSubmitting(true);
    try {
      const parentId = replyingTo?.id || null;
      const { data } = await forumService.createComment(postId, comment.trim(), parentId);

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

        if (parentId) {
          // Add as reply to parent comment
          setComments(prev => prev.map(c => {
            if (c.id === parentId) {
              return { ...c, replies: [...(c.replies || []), newComment] };
            }
            return c;
          }));
        } else {
          // Add as root comment
          setComments(prev => [...prev, newComment]);
        }

        // Update post comments count
        setPost(prev => ({
          ...prev,
          comments_count: (prev.comments_count || 0) + 1,
        }));

        setComment('');
        setReplyingTo(null);
        Keyboard.dismiss();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể gửi bình luận',
        buttons: [{ text: 'OK' }],
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle reply button press
  const handleReply = (commentItem) => {
    const authorName = commentItem.author?.full_name || commentItem.author?.email?.split('@')[0] || 'người dùng';
    setReplyingTo({ id: commentItem.id, authorName });
    inputRef.current?.focus();
  };

  // Cancel reply
  const cancelReply = () => {
    setReplyingTo(null);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get images array for viewer
  const getImages = () => {
    if (post?.media_urls?.length > 0) return post.media_urls;
    if (post?.image_url) return [post.image_url];
    return [];
  };

  // Get author info
  const getAuthorInfo = () => {
    const author = post?.author || post?.user || {};
    return {
      id: author.id || post?.user_id,
      name: author.full_name || author.username || author.email?.split('@')[0] || 'Người dùng',
      avatar: author.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.full_name || 'U')}&background=6A5BFF&color=fff`,
    };
  };

  // Handle image press - open ImageViewer
  const handleImagePress = () => {
    setImageViewerVisible(true);
  };

  // Handle save toggle
  const handleSave = () => {
    setSaved(!saved);
  };

  // Handle gift button press - opens GiftCatalogSheet
  const handleGift = () => {
    if (!isAuthenticated) {
      alert({
        type: 'warning',
        title: 'Đăng Nhập Cần Thiết',
        message: 'Bạn cần đăng nhập để gửi quà',
        buttons: [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Auth') },
        ],
      });
      return;
    }
    setGiftSheetVisible(true);
  };

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      </LinearGradient>
    );
  }

  if (!post) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Không tìm thấy bài viết</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết bài viết</Text>
          {/* Edit Button - show if user is author OR admin */}
          {user && post && (post.user_id === user.id || post.author?.id === user.id || isAdmin) ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('EditPost', { post })}
              style={styles.editButton}
            >
              <Edit3 size={22} color={COLORS.gold} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* Scrollable Content */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={{
            paddingBottom: keyboardVisible ? SPACING.md : TOTAL_TAB_BAR_HEIGHT + 70 // Add space for input + tab bar when keyboard hidden
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Post Card - FACEBOOK STYLE: Full width, no margin */}
          <View style={styles.postCard}>
            {/* Author Header with padding */}
            <View style={styles.authorRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate('UserProfile', { userId: post.author?.id || post.user?.id })}
                activeOpacity={0.7}
              >
                <Image
                  source={{
                    uri: post.author?.avatar_url
                      || post.user?.avatar_url
                      || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.full_name || 'A')}&background=6A5BFF&color=fff`
                  }}
                  style={styles.avatar}
                />
              </TouchableOpacity>
              <View style={styles.authorInfo}>
                <View style={styles.authorNameRow}>
                  <UserLink
                    user={post.author || post.user}
                    bold
                    textStyle={styles.authorName}
                  />
                  <UserBadges user={post.author || post.user} size="small" maxBadges={3} />
                </View>
                <Text style={styles.timestamp}>{formatTimestamp(post.created_at)}</Text>
              </View>
            </View>

            {/* Content with padding - supports **bold** and #hashtags */}
            {post.content && (
              <Text style={styles.postContent}>
                {renderFormattedText(post.content, styles.postContentBase)}
              </Text>
            )}

            {/* Image - FULL WIDTH, 1:1 SQUARE RATIO like Facebook - Tap to open viewer */}
            {post.image_url && (
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={handleImagePress}
              >
                <Image source={{ uri: post.image_url }} style={styles.postImage} />
              </TouchableOpacity>
            )}

            {/* Tagged Products - Shows products linked to this post */}
            {post.tagged_products && post.tagged_products.length > 0 && (
              <View style={styles.taggedProductsContainer}>
                <View style={styles.taggedProductsHeader}>
                  <ShoppingBag size={16} color={COLORS.gold} />
                  <Text style={styles.taggedProductsTitle}>Sản phẩm đính kèm</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {post.tagged_products.map((item, index) => {
                    const product = item.product || {
                      id: item.product_id,
                      title: item.product_title,
                      price: item.product_price,
                      image: item.product_image,
                      handle: item.product_handle,
                    };
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
                    return (
                      <TouchableOpacity
                        key={item.id || product.id || index}
                        style={styles.taggedProductCard}
                        onPress={() => {
                          // Navigate to ProductDetail within current stack (Home stack)
                          // This avoids cross-tab navigation issues
                          navigation.navigate('ProductDetailFromPost', { product: productForDetail });
                        }}
                      >
                        {product.image && (
                          <Image source={{ uri: product.image }} style={styles.taggedProductImage} />
                        )}
                        <View style={styles.taggedProductInfo}>
                          <Text style={styles.taggedProductName} numberOfLines={1}>{product.title || 'Sản phẩm'}</Text>
                          <Text style={styles.taggedProductPrice}>
                            {typeof product.price === 'number'
                              ? new Intl.NumberFormat('vi-VN').format(product.price) + 'đ'
                              : product.price || ''}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Facebook-style Action Bar - Left + Right split */}
            <View style={styles.actionBar}>
              {/* Left side - Like, Comment, Share */}
              <View style={styles.actionBarLeft}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={handleLike}
                  activeOpacity={0.7}
                >
                  <Heart
                    size={22}
                    color={liked ? '#FF6B6B' : COLORS.textMuted}
                    fill={liked ? '#FF6B6B' : 'transparent'}
                  />
                  {post.likes_count > 0 && (
                    <Text style={[styles.actionCount, liked && styles.actionCountActive]}>
                      {post.likes_count}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => inputRef.current?.focus()}
                  activeOpacity={0.7}
                >
                  <MessageCircle size={22} color={COLORS.textMuted} />
                  {post.comments_count > 0 && (
                    <Text style={styles.actionCount}>{post.comments_count}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                  <Send size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Right side - Repost, Gift, Save */}
              <View style={styles.actionBarRight}>
                <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                  <Repeat2 size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={handleGift} activeOpacity={0.7}>
                  <Gift size={20} color={COLORS.gold} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={handleSave}
                  activeOpacity={0.7}
                >
                  <Bookmark
                    size={20}
                    color={saved ? COLORS.gold : COLORS.textMuted}
                    fill={saved ? COLORS.gold : 'transparent'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Received Gifts Bar - shows if post has received gifts */}
            {post?.received_gifts_count > 0 && (
              <ReceivedGiftsBar
                gifts={post.received_gifts || []}
                totalGems={post.total_gems_received || 0}
                onPress={() => navigation.navigate('PostGifts', { postId: post.id })}
              />
            )}
          </View>

            {/* Comments Section */}
            <View style={styles.commentsSection}>
              <Text style={styles.commentsTitle}>
                Bình luận ({post.comments_count || comments.length || 0})
              </Text>

              {comments.map((c) => (
                <View key={c.id}>
                  {/* Parent Comment */}
                  <View style={styles.commentCard}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('UserProfile', { userId: c.author?.id })}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={{
                          uri: c.author?.avatar_url
                            || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.author?.full_name || 'A')}&background=6A5BFF&color=fff`
                        }}
                        style={styles.commentAvatar}
                      />
                    </TouchableOpacity>
                    <View style={styles.commentContent}>
                      <View style={styles.commentAuthorRow}>
                        <UserLink
                          user={c.author}
                          textStyle={styles.commentAuthor}
                        />
                        <UserBadges user={c.author} size="tiny" maxBadges={2} />
                      </View>
                      <Text style={styles.commentText}>{c.content}</Text>
                      <View style={styles.commentActions}>
                        <Text style={styles.commentTime}>{formatTimestamp(c.created_at)}</Text>
                        <TouchableOpacity
                          style={styles.replyButton}
                          onPress={() => handleReply(c)}
                        >
                          <Reply size={14} color={COLORS.textMuted} />
                          <Text style={styles.replyButtonText}>Trả lời</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Replies */}
                  {c.replies && c.replies.length > 0 && (
                    <View style={styles.repliesContainer}>
                      {c.replies.map((reply) => (
                        <View key={reply.id} style={styles.replyCard}>
                          <TouchableOpacity
                            onPress={() => navigation.navigate('UserProfile', { userId: reply.author?.id })}
                            activeOpacity={0.7}
                          >
                            <Image
                              source={{
                                uri: reply.author?.avatar_url
                                  || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.author?.full_name || 'A')}&background=6A5BFF&color=fff`
                              }}
                              style={styles.replyAvatar}
                            />
                          </TouchableOpacity>
                          <View style={styles.commentContent}>
                            <View style={styles.commentAuthorRow}>
                              <UserLink
                                user={reply.author}
                                textStyle={styles.commentAuthor}
                              />
                              <UserBadges user={reply.author} size="tiny" maxBadges={2} />
                            </View>
                            <Text style={styles.commentText}>{reply.content}</Text>
                            <Text style={styles.commentTime}>{formatTimestamp(reply.created_at)}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}

              {comments.length === 0 && (
                <Text style={styles.noComments}>
                  Chưa có bình luận nào. Hãy là người đầu tiên!
                </Text>
              )}
            </View>
          </ScrollView>

        {/* Image Viewer with text overlay */}
        {post && (
          <ImageViewer
            visible={imageViewerVisible}
            images={getImages()}
            initialIndex={0}
            onClose={() => setImageViewerVisible(false)}
            showCounter={true}
            showActions={false}
            postContent={post.content}
            authorName={getAuthorInfo().name}
            showOverlay={true}
          />
        )}

        {/* Gift Catalog Sheet */}
        <GiftCatalogSheet
          visible={giftSheetVisible}
          onClose={() => setGiftSheetVisible(false)}
          recipientId={post?.author?.id || post?.user_id}
          recipientName={getAuthorInfo().name}
          postId={postId}
          onGiftSent={() => {
            console.log('[PostDetailScreen] Gift sent successfully');
            // Optionally reload post to show updated gifts
            loadPost();
          }}
        />
        </KeyboardAvoidingView>
        </SafeAreaView>

        {/* Comment Input - Absolute positioned, moves with keyboard */}
        <View style={[
          styles.inputContainerAbsolute,
          { bottom: keyboardVisible ? keyboardHeight : TOTAL_TAB_BAR_HEIGHT }
        ]}>
          {replyingTo && (
            <View style={styles.replyingToBar}>
              <Text style={styles.replyingToText}>
                Đang trả lời <Text style={styles.replyingToName}>{replyingTo.authorName}</Text>
              </Text>
              <TouchableOpacity onPress={cancelReply} style={styles.cancelReplyBtn}>
                <X size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder={replyingTo ? `Trả lời ${replyingTo.authorName}...` : 'Viết bình luận...'}
              placeholderTextColor={COLORS.textMuted}
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!comment.trim() || submitting) && styles.sendButtonDisabled]}
              onPress={handleComment}
              disabled={!comment.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Send size={20} color={comment.trim() ? COLORS.gold : COLORS.textMuted} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        {AlertComponent}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: SPACING.lg,
    backgroundColor: GLASS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  content: { flex: 1 },
  // FACEBOOK STYLE: Full width, no margin, no border radius
  postCard: {
    backgroundColor: GLASS.background,
    marginHorizontal: 0, // Full width - no margin
    marginTop: 0,
    marginBottom: SPACING.md,
    borderRadius: 0, // No border radius - full bleed
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.15)',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg, // Padding for author row
    paddingTop: SPACING.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: SPACING.md,
  },
  authorInfo: { flex: 1 },
  authorNameRow: {
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
  postContent: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg, // Padding for content
  },
  postContentBase: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  // FULL WIDTH IMAGE, 1:1 SQUARE RATIO
  postImage: {
    width: SCREEN_WIDTH, // Full screen width
    height: SCREEN_WIDTH, // 1:1 square ratio
    marginBottom: SPACING.md,
    backgroundColor: COLORS.bgMid,
  },
  // Facebook-style Action Bar - Left + Right split
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
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },
  actionCountActive: {
    color: '#FF6B6B',
  },
  commentsSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 20,
  },
  noComments: {
    fontFamily: 'System',
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.xxl,
  },
  commentsTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  commentCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.sm,
  },
  commentContent: { flex: 1 },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentAuthor: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  commentText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  commentTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: 4,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  replyButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  // Replies
  repliesContainer: {
    marginLeft: 40,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(106, 91, 255, 0.3)',
    paddingLeft: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  replyCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: SPACING.sm,
    borderRadius: 10,
    marginBottom: SPACING.xs,
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: SPACING.sm,
  },
  // Replying To Bar
  replyingToBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  replyingToText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  replyingToName: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.cyan,
  },
  cancelReplyBtn: {
    padding: 4,
  },
  // Comment Input - Absolute positioned at bottom
  inputContainerAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: COLORS.bgDarkest,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.3)',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: GLASS.background,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  input: {
    flex: 1,
    fontFamily: 'System',
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    maxHeight: 100,
    paddingVertical: SPACING.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  // Tagged Products Styles
  taggedProductsContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg, // Add padding since card has no padding now
  },
  taggedProductsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  taggedProductsTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
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
    maxWidth: 200,
  },
  taggedProductImage: {
    width: 48,
    height: 48,
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
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: 2,
  },
});

export default PostDetailScreen;
