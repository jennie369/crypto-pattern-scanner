/**
 * MentionText Component
 * Highlight @mentions in comment text
 * Phase 3: Comment Threading (30/12/2024)
 */

import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';
import { COLORS } from '../../utils/tokens';

/**
 * MentionText - Renders text with @mention highlighting
 *
 * @param {Object} props
 * @param {string} props.text - Comment text
 * @param {string} props.replyToName - Name of user being replied to
 * @param {Function} props.onMentionPress - Callback when mention is tapped
 * @param {Object} props.style - Additional text style
 */
const MentionText = ({
  text,
  replyToName,
  onMentionPress,
  style,
}) => {
  // Parse text for @mentions and #hashtags
  const parts = useMemo(() => {
    if (!text) return [];

    // Regex to find @mentions and #hashtags
    const combinedRegex = /(@[\w\u00C0-\u024F\u1E00-\u1EFF]+)|(#[\w\u00C0-\u024F\u1E00-\u1EFF]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
        });
      }

      const matchedText = match[0];
      if (matchedText.startsWith('@')) {
        parts.push({
          type: 'mention',
          content: matchedText,
          username: matchedText.slice(1),
        });
      } else if (matchedText.startsWith('#')) {
        parts.push({
          type: 'hashtag',
          content: matchedText,
          tag: matchedText.slice(1),
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

    return parts;
  }, [text]);

  // If reply with @mention at start (and not already in text)
  const showReplyMention = replyToName && text && !text.startsWith('@');

  return (
    <Text style={[styles.text, style]}>
      {/* Reply-to mention */}
      {showReplyMention && (
        <Text
          style={styles.mention}
          onPress={() => onMentionPress?.(replyToName)}
        >
          @{replyToName}{' '}
        </Text>
      )}

      {/* Parsed content */}
      {parts.map((part, index) => {
        if (part.type === 'mention') {
          return (
            <Text
              key={`mention-${index}`}
              style={styles.mention}
              onPress={() => onMentionPress?.(part.username)}
            >
              {part.content}
            </Text>
          );
        }
        if (part.type === 'hashtag') {
          return (
            <Text
              key={`hashtag-${index}`}
              style={styles.hashtag}
            >
              {part.content}
            </Text>
          );
        }
        return <Text key={`text-${index}`}>{part.content}</Text>;
      })}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  mention: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  hashtag: {
    color: COLORS.cyan || '#00CED1',
    fontWeight: '500',
  },
});

export default memo(MentionText);
