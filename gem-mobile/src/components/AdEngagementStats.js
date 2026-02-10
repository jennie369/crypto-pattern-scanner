/**
 * GEM Mobile - Ad Engagement Stats Component
 * Facebook-style engagement stats row showing reactions, comments, shares
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';

// Reaction emojis
const REACTION_EMOJIS = {
  like: '👍',
  love: '❤️',
  haha: '😆',
  wow: '😮',
  sad: '😢',
  angry: '😡',
};

/**
 * Format number to Facebook-style (1.2K, 1.5M, etc.)
 */
const formatCount = (count) => {
  if (!count || count === 0) return null;
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return count.toString();
};

/**
 * Get top 3 reactions sorted by count
 */
const getTopReactions = (ad) => {
  const reactions = [
    { type: 'like', count: ad?.reaction_like || 0 },
    { type: 'love', count: ad?.reaction_love || 0 },
    { type: 'haha', count: ad?.reaction_haha || 0 },
    { type: 'wow', count: ad?.reaction_wow || 0 },
    { type: 'sad', count: ad?.reaction_sad || 0 },
    { type: 'angry', count: ad?.reaction_angry || 0 },
  ];

  return reactions
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
};

/**
 * Get total reactions count
 */
const getTotalReactions = (ad) => {
  return (
    (ad?.reaction_like || 0) +
    (ad?.reaction_love || 0) +
    (ad?.reaction_haha || 0) +
    (ad?.reaction_wow || 0) +
    (ad?.reaction_sad || 0) +
    (ad?.reaction_angry || 0)
  );
};

/**
 * AdEngagementStats - Shows reactions, comments, shares counts
 * @param {object} ad - Ad/Banner data object with reaction counts
 * @param {function} onReactionsPress - Callback when reactions area is pressed
 * @param {function} onCommentsPress - Callback when comments count is pressed
 * @param {function} onSharesPress - Callback when shares count is pressed
 */
export default function AdEngagementStats({
  ad,
  onReactionsPress,
  onCommentsPress,
  onSharesPress,
}) {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    reactionsSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    reactionEmojis: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    reactionEmoji: {
      fontSize: 16,
      backgroundColor: 'transparent',
    },
    countText: {
      fontSize: 13,
      color: colors.textMuted,
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    separator: {
      fontSize: 13,
      color: colors.textMuted,
      marginHorizontal: 6,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  const topReactions = getTopReactions(ad);
  const totalReactions = getTotalReactions(ad);
  const commentsCount = ad?.comments_count || 0;
  const sharesCount = ad?.shares_count || 0;

  // Don't render if no engagement
  if (totalReactions === 0 && commentsCount === 0 && sharesCount === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Left: Reactions */}
      {totalReactions > 0 && (
        <TouchableOpacity
          style={styles.reactionsSection}
          onPress={onReactionsPress}
          activeOpacity={0.7}
        >
          <View style={styles.reactionEmojis}>
            {topReactions.map((reaction, index) => (
              <Text
                key={reaction.type}
                style={[
                  styles.reactionEmoji,
                  { zIndex: 10 - index, marginLeft: index > 0 ? -4 : 0 },
                ]}
              >
                {REACTION_EMOJIS[reaction.type]}
              </Text>
            ))}
          </View>
          <Text style={styles.countText}>{formatCount(totalReactions)}</Text>
        </TouchableOpacity>
      )}

      {/* Right: Comments & Shares */}
      <View style={styles.rightSection}>
        {commentsCount > 0 && (
          <TouchableOpacity onPress={onCommentsPress} activeOpacity={0.7}>
            <Text style={styles.countText}>
              {formatCount(commentsCount)} bình luận
            </Text>
          </TouchableOpacity>
        )}
        {commentsCount > 0 && sharesCount > 0 && (
          <Text style={styles.separator}>·</Text>
        )}
        {sharesCount > 0 && (
          <TouchableOpacity onPress={onSharesPress} activeOpacity={0.7}>
            <Text style={styles.countText}>
              {formatCount(sharesCount)} chia sẻ
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
