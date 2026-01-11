/**
 * MentionHighlight Component
 * Renders text with highlighted @mentions
 */

import React, { useMemo, useCallback, memo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY } from '../../utils/tokens';

/**
 * MentionHighlight - Render text with highlighted @mentions
 *
 * @param {Object} props
 * @param {string} props.text - Message text
 * @param {Array} props.mentions - Array of mentions [{userId, displayName, startIndex, endIndex}]
 * @param {boolean} props.isCurrentUser - Is message from current user
 * @param {Object} props.textStyle - Additional text styles
 */
const MentionHighlight = memo(({
  text = '',
  mentions = [],
  isCurrentUser = false,
  textStyle,
}) => {
  const navigation = useNavigation();

  // ========== HANDLERS ==========
  const handleMentionPress = useCallback(
    (userId) => {
      navigation.navigate('UserProfile', { userId });
    },
    [navigation]
  );

  // ========== COMPUTED ==========
  const segments = useMemo(() => {
    if (!text) return [];

    if (!mentions || mentions.length === 0) {
      return [{ type: 'text', content: text }];
    }

    // Sort mentions by startIndex
    const sortedMentions = [...mentions].sort(
      (a, b) => a.startIndex - b.startIndex
    );

    const result = [];
    let lastIndex = 0;

    sortedMentions.forEach((mention) => {
      // Validate indices
      if (
        mention.startIndex < 0 ||
        mention.endIndex > text.length ||
        mention.startIndex >= mention.endIndex
      ) {
        return;
      }

      // Text before mention
      if (mention.startIndex > lastIndex) {
        result.push({
          type: 'text',
          content: text.substring(lastIndex, mention.startIndex),
        });
      }

      // Mention text
      result.push({
        type: 'mention',
        content: text.substring(mention.startIndex, mention.endIndex),
        userId: mention.userId || mention.mentioned_user_id,
        displayName: mention.displayName,
      });

      lastIndex = mention.endIndex;
    });

    // Text after last mention
    if (lastIndex < text.length) {
      result.push({
        type: 'text',
        content: text.substring(lastIndex),
      });
    }

    return result;
  }, [text, mentions]);

  // ========== RENDER ==========
  if (!text) return null;

  return (
    <Text
      style={[
        styles.text,
        isCurrentUser ? styles.textSent : styles.textReceived,
        textStyle,
      ]}
    >
      {segments.map((segment, index) => {
        if (segment.type === 'mention') {
          return (
            <Text
              key={`mention-${index}`}
              style={styles.mention}
              onPress={() => handleMentionPress(segment.userId)}
            >
              {segment.content}
            </Text>
          );
        }
        return <Text key={`text-${index}`}>{segment.content}</Text>;
      })}
    </Text>
  );
});

MentionHighlight.displayName = 'MentionHighlight';

export default MentionHighlight;

const styles = StyleSheet.create({
  text: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    lineHeight: 22,
  },
  textSent: {
    color: COLORS.textPrimary,
  },
  textReceived: {
    color: COLORS.textPrimary,
  },
  mention: {
    color: COLORS.gold,
    fontWeight: '600',
  },
});
