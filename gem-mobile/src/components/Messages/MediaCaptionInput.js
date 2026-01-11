/**
 * MediaCaptionInput Component
 * Text input for adding captions to media messages
 */

import React, { useState, useCallback, useRef, memo } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { Smile } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const MAX_CAPTION_LENGTH = 1000;

/**
 * MediaCaptionInput - Input field for media caption
 *
 * @param {Object} props
 * @param {string} props.value - Caption text
 * @param {Function} props.onChangeText - Callback when text changes
 * @param {Function} props.onSubmit - Callback on submit
 * @param {string} props.placeholder - Placeholder text
 * @param {Function} props.onEmojiPress - Callback when emoji button pressed
 */
const MediaCaptionInput = memo(({
  value = '',
  onChangeText,
  onSubmit,
  placeholder = 'Them chu thich...',
  onEmojiPress,
}) => {
  // ========== STATE ==========
  const [isFocused, setIsFocused] = useState(false);

  // ========== REFS ==========
  const inputRef = useRef(null);

  // ========== HANDLERS ==========
  const handleChangeText = useCallback(
    (text) => {
      // Limit to max length
      if (text.length <= MAX_CAPTION_LENGTH) {
        onChangeText?.(text);
      }
    },
    [onChangeText]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleSubmit = useCallback(() => {
    Keyboard.dismiss();
    onSubmit?.();
  }, [onSubmit]);

  // ========== RENDER ==========
  const charCount = value.length;
  const isNearLimit = charCount >= MAX_CAPTION_LENGTH * 0.9;
  const isAtLimit = charCount >= MAX_CAPTION_LENGTH;

  return (
    <View style={[styles.container, isFocused && styles.containerFocused]}>
      {/* Input Field */}
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        multiline
        maxLength={MAX_CAPTION_LENGTH}
        returnKeyType="done"
        blurOnSubmit
        onSubmitEditing={handleSubmit}
      />

      {/* Right Side - Counter + Emoji button */}
      <View style={styles.rightSection}>
        {/* Character Counter (only show when focused or has text) */}
        {(isFocused || charCount > 0) && (
          <Text
            style={[
              styles.charCounter,
              isNearLimit && styles.charCounterWarning,
              isAtLimit && styles.charCounterLimit,
            ]}
          >
            {charCount}/{MAX_CAPTION_LENGTH}
          </Text>
        )}

        {/* Emoji Button */}
        <TouchableOpacity
          style={styles.emojiButton}
          onPress={onEmojiPress}
          activeOpacity={0.7}
        >
          <Smile size={22} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

MediaCaptionInput.displayName = 'MediaCaptionInput';

export default MediaCaptionInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(15, 16, 48, 0.8)',
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  containerFocused: {
    borderColor: COLORS.gold,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    maxHeight: 100,
    paddingVertical: 0,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  charCounter: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginRight: SPACING.xs,
  },
  charCounterWarning: {
    color: '#FFA500', // Orange
  },
  charCounterLimit: {
    color: COLORS.burgundy,
  },
  emojiButton: {
    padding: 4,
  },
});
