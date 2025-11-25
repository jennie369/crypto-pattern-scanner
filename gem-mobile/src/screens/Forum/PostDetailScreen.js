/**
 * GEM Platform - Post Detail Screen
 * Shows full post with comments
 * Fixed: Comment input positioned above tab bar
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Heart, MessageCircle, Send, Reply, X } from 'lucide-react-native';
import { forumService } from '../../services/forumService';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS, LAYOUT } from '../../utils/tokens';

// Tab bar height constant
const TAB_BAR_HEIGHT = LAYOUT.tabBarHeight || 90;

const PostDetailScreen = ({ route, navigation }) => {
  const { postId, focusComment } = route.params || {};
  const { user, isAuthenticated } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // { id, authorName }

  // Keyboard handling refs
  const inputRef = useRef(null);
  const scrollViewRef = useRef(null);
  const inputBottomAnim = useRef(new Animated.Value(TAB_BAR_HEIGHT)).current;

  useEffect(() => {
    loadPost();

    // Focus comment input if requested
    if (focusComment) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
  }, [postId]);

  // Keyboard listeners for smooth animation
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        const height = e.endCoordinates.height;

        // Animate input to above keyboard
        Animated.timing(inputBottomAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: false,
        }).start();

        // Scroll to bottom after keyboard shows
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        // Animate input back to above tab bar
        Animated.timing(inputBottomAnim, {
          toValue: TAB_BAR_HEIGHT,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

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
      Alert.alert(
        'Đăng Nhập Cần Thiết',
        'Bạn cần đăng nhập để bình luận',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Auth') },
        ]
      );
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
      Alert.alert('Lỗi', 'Không thể gửi bình luận');
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết bài viết</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Scrollable Content */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 80 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Post Card */}
          <View style={styles.postCard}>
            {/* Author - supports both 'author' and 'user' */}
            <View style={styles.authorRow}>
              <Image
                source={{
                  uri: post.author?.avatar_url
                    || post.user?.avatar_url
                    || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.full_name || 'A')}&background=6A5BFF&color=fff`
                }}
                style={styles.avatar}
              />
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>
                  {post.author?.full_name || post.author?.email?.split('@')[0] || post.user?.full_name || 'Anonymous'}
                </Text>
                <Text style={styles.timestamp}>{formatTimestamp(post.created_at)}</Text>
              </View>
            </View>

              {/* Content */}
              <Text style={styles.title}>{post.title}</Text>
              <Text style={styles.postContent}>{post.content}</Text>

              {/* Image */}
              {post.image_url && (
                <Image source={{ uri: post.image_url }} style={styles.postImage} />
              )}

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, liked && styles.actionButtonActive]}
                  onPress={handleLike}
                >
                  <Heart
                    size={20}
                    color={liked ? COLORS.error : COLORS.textMuted}
                    fill={liked ? COLORS.error : 'transparent'}
                  />
                  <Text style={[styles.actionText, liked && styles.actionTextActive]}>
                    {post.likes_count || 0}
                  </Text>
                </TouchableOpacity>
                <View style={styles.actionButton}>
                  <MessageCircle size={20} color={COLORS.textMuted} />
                  <Text style={styles.actionText}>{post.comments_count || 0}</Text>
                </View>
              </View>
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
                    <Image
                      source={{
                        uri: c.author?.avatar_url
                          || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.author?.full_name || 'A')}&background=6A5BFF&color=fff`
                      }}
                      style={styles.commentAvatar}
                    />
                    <View style={styles.commentContent}>
                      <Text style={styles.commentAuthor}>
                        {c.author?.full_name || c.author?.email?.split('@')[0] || 'Anonymous'}
                      </Text>
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
                          <Image
                            source={{
                              uri: reply.author?.avatar_url
                                || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.author?.full_name || 'A')}&background=6A5BFF&color=fff`
                            }}
                            style={styles.replyAvatar}
                          />
                          <View style={styles.commentContent}>
                            <Text style={styles.commentAuthor}>
                              {reply.author?.full_name || reply.author?.email?.split('@')[0] || 'Anonymous'}
                            </Text>
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

        {/* Comment Input - FIXED POSITION ABOVE TAB BAR */}
        <Animated.View style={[
          styles.inputContainer,
          { bottom: inputBottomAnim },
        ]}>
          {/* Replying To Indicator */}
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
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
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
    justifyContent: 'space-between',
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
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  content: { flex: 1 },
  postCard: {
    backgroundColor: GLASS.background,
    margin: SPACING.lg,
    padding: GLASS.padding,
    borderRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: SPACING.md,
  },
  authorInfo: { flex: 1 },
  authorName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  postContent: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionButtonActive: {},
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  actionTextActive: {
    color: COLORS.error,
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
  // Comment Input - Fixed position above tab bar
  inputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: COLORS.bgDarkest,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.3)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
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
});

export default PostDetailScreen;
