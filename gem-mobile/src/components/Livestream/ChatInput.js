/**
 * ChatInput Component
 * Input field for sending comments in livestream
 *
 * Features:
 * - Text input with send button
 * - Character limit
 * - Loading state
 * - Emoji picker trigger
 */

import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tokens, { COLORS } from '../../utils/tokens';

const MAX_LENGTH = 200;

const ChatInput = ({
  onSend,
  placeholder = 'Nhập bình luận...',
  disabled = false,
  isLoading = false,
  onEmojiPress,
  style,
}) => {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  // Handle send
  const handleSend = async () => {
    const trimmedText = text.trim();
    if (!trimmedText || disabled || isLoading) return;

    try {
      await onSend(trimmedText);
      setText('');
      Keyboard.dismiss();
    } catch (error) {
      console.error('[ChatInput] Send error:', error);
    }
  };

  // Handle text change with character limit
  const handleTextChange = (newText) => {
    if (newText.length <= MAX_LENGTH) {
      setText(newText);
    }
  };

  const charCount = text.length;
  const isNearLimit = charCount > MAX_LENGTH * 0.8;
  const canSend = text.trim().length > 0 && !disabled && !isLoading;

  return (
    <View style={[styles.container, style]}>
      {/* Input row */}
      <View style={styles.inputRow}>
        {/* Emoji button */}
        {onEmojiPress && (
          <TouchableOpacity
            style={styles.emojiButton}
            onPress={onEmojiPress}
            disabled={disabled}
          >
            <Ionicons
              name="happy-outline"
              size={24}
              color={disabled ? tokens.colors.textDisabled : tokens.colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        {/* Text input */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={[styles.input, disabled && styles.inputDisabled]}
            value={text}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            placeholderTextColor={tokens.colors.textTertiary}
            multiline
            maxLength={MAX_LENGTH}
            editable={!disabled}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />

          {/* Character count (show when near limit) */}
          {isNearLimit && (
            <Text style={[
              styles.charCount,
              charCount >= MAX_LENGTH && styles.charCountLimit,
            ]}>
              {charCount}/{MAX_LENGTH}
            </Text>
          )}
        </View>

        {/* Send button */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            canSend ? styles.sendButtonActive : styles.sendButtonInactive,
          ]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={tokens.colors.white} />
          ) : (
            <Ionicons
              name="send"
              size={20}
              color={canSend ? tokens.colors.white : tokens.colors.textDisabled}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.colors.surface,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: tokens.spacing.sm,
  },
  emojiButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    position: 'relative',
  },
  input: {
    backgroundColor: tokens.colors.surfaceLight,
    borderRadius: tokens.radius.lg,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    paddingRight: 50, // Space for char count
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textPrimary,
    maxHeight: 100,
    minHeight: 40,
  },
  inputDisabled: {
    backgroundColor: tokens.colors.surfaceDark,
    color: tokens.colors.textDisabled,
  },
  charCount: {
    position: 'absolute',
    right: tokens.spacing.sm,
    bottom: tokens.spacing.sm,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textTertiary,
  },
  charCountLimit: {
    color: COLORS.error,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: tokens.colors.primary,
  },
  sendButtonInactive: {
    backgroundColor: tokens.colors.surfaceDark,
  },
});

export default ChatInput;
