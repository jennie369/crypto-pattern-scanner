/**
 * GEM Platform - Message Bubble Component
 * Chat message bubble with avatar
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { User, Sparkles } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';

const MessageBubble = ({ message }) => {
  const isUser = message.type === 'user';

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={[
      styles.container,
      isUser ? styles.containerUser : styles.containerAssistant,
    ]}>
      {/* Avatar - Assistant */}
      {!isUser && (
        <View style={styles.avatar}>
          <Sparkles size={16} color={COLORS.gold} />
        </View>
      )}

      {/* Bubble */}
      <View style={[
        styles.bubble,
        isUser ? styles.bubbleUser : styles.bubbleAssistant,
      ]}>
        <Text style={[
          styles.text,
          isUser ? styles.textUser : styles.textAssistant,
        ]}>
          {message.text}
        </Text>

        <Text style={[styles.timestamp, isUser && styles.timestampUser]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>

      {/* Avatar - User */}
      {isUser && (
        <View style={[styles.avatar, styles.avatarUser]}>
          <User size={16} color={COLORS.textPrimary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  containerUser: {
    flexDirection: 'row-reverse',
  },
  containerAssistant: {
    flexDirection: 'row',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GLASS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: GLASS.borderWidth,
    borderColor: COLORS.purple,
  },
  avatarUser: {
    backgroundColor: COLORS.burgundy,
    borderColor: COLORS.burgundy,
  },
  bubble: {
    borderRadius: GLASS.borderRadius,
    padding: SPACING.md,
    maxWidth: '75%',
  },
  bubbleUser: {
    backgroundColor: COLORS.gold,
    alignSelf: 'flex-end',
    borderBottomRightRadius: SPACING.xs,
  },
  bubbleAssistant: {
    backgroundColor: GLASS.background,
    borderWidth: GLASS.borderWidth,
    borderColor: COLORS.inputBorder,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: SPACING.xs,
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    lineHeight: 22,
  },
  textUser: {
    color: COLORS.bgMid,
  },
  textAssistant: {
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    alignSelf: 'flex-end',
  },
  timestampUser: {
    color: COLORS.textDisabled,
  },
});

export default MessageBubble;
