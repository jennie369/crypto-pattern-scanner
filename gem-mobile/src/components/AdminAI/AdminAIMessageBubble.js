/**
 * GEM AI Trading Brain - Message Bubble Component
 * Chat message display with markdown support and action buttons
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Brain, User, Copy, Check } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';

// ═══════════════════════════════════════════════════════════
// MESSAGE BUBBLE COMPONENT
// ═══════════════════════════════════════════════════════════

const AdminAIMessageBubble = ({
  message,
  onActionPress,
  onCopy,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const isUser = message.role === 'user';
  const [copied, setCopied] = React.useState(false);

  // ═══════════════════════════════════════════════════════════
  // MARKDOWN RENDERING
  // ═══════════════════════════════════════════════════════════

  /**
   * Render inline markdown (bold)
   */
  const renderInlineMarkdown = useCallback((text, baseStyle) => {
    if (!text) return null;

    const parts = [];
    let remaining = text;
    let key = 0;

    const boldPattern = /\*\*([^*]+)\*\*/;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(boldPattern);

      if (boldMatch) {
        const beforeMatch = remaining.slice(0, boldMatch.index);
        if (beforeMatch) {
          parts.push(<Text key={key++}>{beforeMatch}</Text>);
        }

        parts.push(
          <Text key={key++} style={{ fontWeight: '700', color: colors.textPrimary }}>
            {boldMatch[1]}
          </Text>
        );

        remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      } else {
        parts.push(<Text key={key++}>{remaining}</Text>);
        break;
      }
    }

    return parts;
  }, [colors.textPrimary]);

  /**
   * Simple markdown text renderer
   * Supports: **bold**, bullet points, code blocks
   */
  const renderMarkdownText = useCallback((text, baseStyle) => {
    if (!text) return null;

    const lines = text.split('\n');

    return lines.map((line, lineIndex) => {
      // Check for bullet points
      const bulletMatch = line.match(/^(\s*)[•\-\*]\s+(.*)$/);

      if (bulletMatch) {
        const content = bulletMatch[2];
        return (
          <Text key={lineIndex} style={baseStyle}>
            {'  • '}{renderInlineMarkdown(content, baseStyle)}
            {lineIndex < lines.length - 1 ? '\n' : ''}
          </Text>
        );
      }

      // Check for headers (### style)
      if (line.startsWith('### ')) {
        return (
          <Text key={lineIndex} style={[baseStyle, styles.headerText]}>
            {line.substring(4)}
            {lineIndex < lines.length - 1 ? '\n' : ''}
          </Text>
        );
      }

      if (line.startsWith('## ')) {
        return (
          <Text key={lineIndex} style={[baseStyle, styles.headerText, { fontSize: 15 }]}>
            {line.substring(3)}
            {lineIndex < lines.length - 1 ? '\n' : ''}
          </Text>
        );
      }

      return (
        <Text key={lineIndex} style={baseStyle}>
          {renderInlineMarkdown(line, baseStyle)}
          {lineIndex < lines.length - 1 ? '\n' : ''}
        </Text>
      );
    });
  }, [renderInlineMarkdown]);

  // Handle long press to copy
  const handleLongPress = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Clipboard.setStringAsync(message.content || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.();
    } catch (error) {
      console.error('[AdminAIMessageBubble] Copy error:', error);
    }
  }, [message.content, onCopy]);

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ═══════════════════════════════════════════════════════════
  // STYLES
  // ═══════════════════════════════════════════════════════════

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginVertical: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      maxWidth: '100%',
    },
    containerUser: {
      flexDirection: 'row-reverse',
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 189, 89, 0.15)',
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: SPACING.xs,
    },
    avatarUser: {
      backgroundColor: 'rgba(106, 91, 255, 0.15)',
      borderColor: colors.purple,
    },
    bubble: {
      maxWidth: '75%',
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: glass.borderRadius,
      borderWidth: 1,
      borderColor: 'rgba(255, 189, 89, 0.3)',
      padding: SPACING.md,
    },
    bubbleUser: {
      backgroundColor: 'rgba(106, 91, 255, 0.35)',
      borderColor: 'rgba(106, 91, 255, 0.5)',
    },
    textContainer: {
      marginBottom: SPACING.xs,
    },
    messageText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    messageTextUser: {
      color: colors.textPrimary,
    },
    headerText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.gold,
      marginTop: SPACING.xs,
    },
    copiedIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: SPACING.xs,
    },
    copiedText: {
      fontSize: 10,
      color: colors.success,
    },
    actionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.xs,
      marginTop: SPACING.sm,
      paddingTop: SPACING.sm,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    actionButton: {
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.md,
      borderRadius: 16,
      backgroundColor: 'rgba(106, 91, 255, 0.2)',
      borderWidth: 1,
      borderColor: 'rgba(106, 91, 255, 0.4)',
    },
    actionButtonPrimary: {
      backgroundColor: 'rgba(58, 247, 166, 0.2)',
      borderColor: 'rgba(58, 247, 166, 0.4)',
    },
    actionButtonWarning: {
      backgroundColor: 'rgba(255, 107, 107, 0.2)',
      borderColor: 'rgba(255, 107, 107, 0.4)',
    },
    actionButtonSecondary: {
      backgroundColor: 'rgba(255, 189, 89, 0.15)',
      borderColor: 'rgba(255, 189, 89, 0.3)',
    },
    actionButtonText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    actionButtonTextWarning: {
      color: colors.error,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: SPACING.xs,
    },
    timestamp: {
      fontSize: 10,
      color: colors.textMuted,
    },
    source: {
      fontSize: 10,
      color: colors.textMuted,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <View style={[styles.container, isUser && styles.containerUser]}>
      {/* Avatar */}
      <View style={[styles.avatar, isUser && styles.avatarUser]}>
        {isUser ? (
          <User size={18} color={colors.textPrimary} />
        ) : (
          <Brain size={18} color={colors.gold} />
        )}
      </View>

      {/* Message Content */}
      <Pressable
        style={[styles.bubble, isUser && styles.bubbleUser]}
        onLongPress={handleLongPress}
        delayLongPress={500}
      >
        {/* Message Text */}
        <View style={styles.textContainer}>
          {renderMarkdownText(message.content, [
            styles.messageText,
            isUser && styles.messageTextUser,
          ])}
        </View>

        {/* Copy indicator */}
        {copied && (
          <View style={styles.copiedIndicator}>
            <Check size={12} color={colors.success} />
            <Text style={styles.copiedText}>Copied</Text>
          </View>
        )}

        {/* Action Buttons */}
        {!isUser && message.actions && message.actions.length > 0 && (
          <View style={styles.actionsContainer}>
            {message.actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.actionButton,
                  action.type === 'primary' && styles.actionButtonPrimary,
                  action.type === 'warning' && styles.actionButtonWarning,
                  action.type === 'secondary' && styles.actionButtonSecondary,
                ]}
                onPress={() => onActionPress?.(action)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.actionButtonText,
                  action.type === 'warning' && styles.actionButtonTextWarning,
                ]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Timestamp & Source */}
        <View style={styles.footer}>
          <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
          {!isUser && message.source && (
            <Text style={styles.source}>
              {message.source === 'gemini' ? '✨ AI' : '⚡ Local'}
            </Text>
          )}
        </View>
      </Pressable>
    </View>
  );
};

export default AdminAIMessageBubble;
