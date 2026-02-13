/**
 * GEM Mobile - Ad Comments Sheet Component
 * Facebook-style comments bottom sheet
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {
  X,
  Send,
  Heart,
  MoreHorizontal,
  MessageCircle,
} from 'lucide-react-native';
import { COLORS, SPACING } from '../utils/tokens';

/**
 * Format relative time (Vietnamese)
 */
const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút`;
  if (diffHours < 24) return `${diffHours} giờ`;
  if (diffDays < 7) return `${diffDays} ngày`;
  return date.toLocaleDateString('vi-VN');
};

/**
 * Comment Item Component
 */
const CommentItem = ({ comment, onLike, onReply, likedByUser }) => {
  return (
    <View style={styles.commentItem}>
      {/* Avatar */}
      <Image
        source={{ uri: comment.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.display_name || 'User')}&background=random` }}
        style={styles.commentAvatar}
      />

      <View style={styles.commentContent}>
        {/* Comment Bubble */}
        <View style={styles.commentBubble}>
          <Text style={styles.commentAuthor}>
            {comment.display_name || 'Người dùng ẩn danh'}
          </Text>
          <Text style={styles.commentText}>{comment.content}</Text>
        </View>

        {/* Comment Actions */}
        <View style={styles.commentActions}>
          <Text style={styles.commentTime}>
            {formatRelativeTime(comment.created_at)}
          </Text>
          <TouchableOpacity onPress={() => onLike?.(comment.id)}>
            <Text
              style={[
                styles.commentAction,
                likedByUser && styles.commentActionActive,
              ]}
            >
              Thích
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onReply?.(comment)}>
            <Text style={styles.commentAction}>Trả lời</Text>
          </TouchableOpacity>
          {comment.likes_count > 0 && (
            <View style={styles.likesCount}>
              <Heart size={12} color={COLORS.error} fill={COLORS.error} />
              <Text style={styles.likesCountText}>{comment.likes_count}</Text>
            </View>
          )}
        </View>

        {/* Replies indicator */}
        {comment.replies_count > 0 && (
          <TouchableOpacity style={styles.repliesButton}>
            <MessageCircle size={14} color={COLORS.gold} />
            <Text style={styles.repliesText}>
              Xem {comment.replies_count} trả lời
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

/**
 * AdCommentsSheet - Comments bottom sheet
 * @param {boolean} visible - Whether the sheet is visible
 * @param {function} onClose - Callback to close the sheet
 * @param {array} comments - Array of comment objects
 * @param {function} onLoadMore - Callback to load more comments
 * @param {function} onSubmitComment - Callback when a comment is submitted
 * @param {function} onLikeComment - Callback when a comment is liked
 * @param {boolean} loading - Whether comments are loading
 * @param {boolean} loadingMore - Whether more comments are loading
 * @param {object} currentUser - Current user data (id, avatar_url, display_name)
 * @param {array} likedCommentIds - Array of comment IDs liked by current user
 * @param {number} reactionCount - Total reactions on the post
 */
export default function AdCommentsSheet({
  visible,
  onClose,
  comments = [],
  onLoadMore,
  onSubmitComment,
  onLikeComment,
  loading = false,
  loadingMore = false,
  currentUser,
  likedCommentIds = [],
  reactionCount = 0,
}) {
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async () => {
    if (!inputText.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onSubmitComment?.(inputText.trim(), replyingTo?.id);
      setInputText('');
      setReplyingTo(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (comment) => {
    setReplyingTo(comment);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const renderComment = ({ item }) => (
    <CommentItem
      comment={item}
      onLike={onLikeComment}
      onReply={handleReply}
      likedByUser={likedCommentIds.includes(item.id)}
    />
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <MessageCircle size={56} color="#4A90D9" fill="#4A90D9" strokeWidth={0} />
        </View>
        <Text style={styles.emptyText}>Chưa có bình luận</Text>
        <Text style={styles.emptySubtext}>Hãy là người đầu tiên bình luận.</Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={COLORS.gold} />
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Reaction count bar - like Facebook */}
          {reactionCount > 0 && (
            <View style={styles.reactionBar}>
              <View style={styles.reactionIcon}>
                <Heart size={14} color="#FF6B6B" fill="#FF6B6B" />
              </View>
              <Text style={styles.reactionCount}>{reactionCount}</Text>
            </View>
          )}

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Bình luận</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.gold} />
            </View>
          ) : (
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={renderEmpty}
              ListFooterComponent={renderFooter}
              onEndReached={onLoadMore}
              onEndReachedThreshold={0.5}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Reply indicator */}
          {replyingTo && (
            <View style={styles.replyIndicator}>
              <Text style={styles.replyText}>
                Đang trả lời{' '}
                <Text style={styles.replyName}>{replyingTo.display_name}</Text>
              </Text>
              <TouchableOpacity onPress={cancelReply}>
                <X size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {/* Input */}
          <View style={styles.inputContainer}>
            <Image
              source={{
                uri: currentUser?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.display_name || 'User')}&background=random`,
              }}
              style={styles.inputAvatar}
            />
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder={replyingTo ? 'Viết trả lời...' : 'Viết bình luận...'}
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || submitting) && styles.sendButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!inputText.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={COLORS.gold} />
              ) : (
                <Send
                  size={20}
                  color={inputText.trim() ? COLORS.gold : COLORS.textMuted}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1C1B23',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '75%',
  },
  reactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  reactionIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  reactionCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingLeft: 8,
    gap: 12,
  },
  commentTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  commentAction: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  commentActionActive: {
    color: COLORS.error,
  },
  likesCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likesCountText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  repliesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingLeft: 8,
  },
  repliesText: {
    fontSize: 13,
    color: COLORS.gold,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 6,
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  replyText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  replyName: {
    color: COLORS.gold,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 34, // Safe area
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 10,
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 14,
    color: '#FFFFFF',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
