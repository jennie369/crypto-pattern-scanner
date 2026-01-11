/**
 * GEM Mobile - Ad Action Buttons Component
 * Facebook-style action buttons: Like, Comment, Share
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ThumbsUp, MessageCircle, Share2 } from 'lucide-react-native';
import { COLORS, SPACING } from '../utils/tokens';

// Reaction colors
const REACTION_COLORS = {
  like: '#1877F2',
  love: '#F33E58',
  haha: '#F7B125',
  wow: '#F7B125',
  sad: '#F7B125',
  angry: '#E9710F',
};

// Reaction labels in Vietnamese
const REACTION_LABELS = {
  like: 'Thích',
  love: 'Yêu thích',
  haha: 'Haha',
  wow: 'Wow',
  sad: 'Buồn',
  angry: 'Phẫn nộ',
};

/**
 * AdActionButtons - Like, Comment, Share buttons row
 * @param {string|null} userReaction - Current user's reaction type (like, love, etc.) or null
 * @param {function} onLikePress - Callback for like button tap
 * @param {function} onLikeLongPress - Callback for like button long-press (show reactions)
 * @param {function} onCommentPress - Callback for comment button press
 * @param {function} onSharePress - Callback for share button press
 */
export default function AdActionButtons({
  userReaction,
  onLikePress,
  onLikeLongPress,
  onCommentPress,
  onSharePress,
}) {
  const hasReaction = !!userReaction;
  const reactionColor = hasReaction
    ? REACTION_COLORS[userReaction] || COLORS.gold
    : 'rgba(255, 255, 255, 0.5)';
  const reactionLabel = hasReaction
    ? REACTION_LABELS[userReaction] || 'Thích'
    : 'Thích';

  return (
    <View style={styles.container}>
      {/* Like Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onLikePress}
        onLongPress={onLikeLongPress}
        delayLongPress={300}
        activeOpacity={0.7}
      >
        <ThumbsUp
          size={20}
          color={reactionColor}
          fill={hasReaction ? reactionColor : 'transparent'}
        />
        <Text style={[styles.actionText, { color: reactionColor }]}>
          {reactionLabel}
        </Text>
      </TouchableOpacity>

      {/* Comment Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onCommentPress}
        activeOpacity={0.7}
      >
        <MessageCircle size={20} color="rgba(255, 255, 255, 0.5)" />
        <Text style={styles.actionText}>Bình luận</Text>
      </TouchableOpacity>

      {/* Share Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onSharePress}
        activeOpacity={0.7}
      >
        <Share2 size={20} color="rgba(255, 255, 255, 0.5)" />
        <Text style={styles.actionText}>Chia sẻ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
