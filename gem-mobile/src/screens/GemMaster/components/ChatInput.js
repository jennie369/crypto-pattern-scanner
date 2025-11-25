/**
 * GEM Platform - Chat Input Component
 * Input bar with send button for GEM Master chat
 */

import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Mic } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, INPUT, TOUCH } from '../../../utils/tokens';

const ChatInput = ({ onSend, disabled = false, placeholder = 'Hỏi GEM Master...', showBottomPadding = true }) => {
  const [text, setText] = useState('');
  const inputRef = useRef(null);
  const insets = useSafeAreaInsets();

  // Add extra padding for tab bar (around 80px) + safe area bottom
  const bottomPadding = showBottomPadding ? Math.max(insets.bottom, 0) + 80 : SPACING.sm;

  const handleSend = () => {
    const trimmed = text.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setText('');
      Keyboard.dismiss();
    }
  };

  const hasText = text.trim().length > 0;

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <View style={styles.inputWrapper}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          multiline
          maxLength={2000}
          editable={!disabled}
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={handleSend}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.sendButton,
          hasText && !disabled ? styles.sendButtonActive : styles.sendButtonDisabled,
        ]}
        onPress={handleSend}
        disabled={!hasText || disabled}
        activeOpacity={0.7}
      >
        <Send
          size={20}
          color={hasText && !disabled ? '#0F1030' : COLORS.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    backgroundColor: GLASS.background,
    borderTopWidth: GLASS.borderWidth,
    borderTopColor: COLORS.inputBorder,
    gap: SPACING.sm,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: INPUT.background,
    borderRadius: GLASS.borderRadius,
    borderWidth: GLASS.borderWidth,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: TOUCH.minimum,
    maxHeight: 120,
  },
  input: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    lineHeight: 22,
    padding: 0,
    margin: 0,
  },
  sendButton: {
    width: TOUCH.minimum,
    height: TOUCH.minimum,
    borderRadius: TOUCH.minimum / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: COLORS.gold,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.glassBg,
  },
});

export default ChatInput;
