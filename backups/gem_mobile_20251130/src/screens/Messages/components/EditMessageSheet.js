/**
 * Gemral - Edit Message Sheet Component
 * Bottom sheet for editing message content
 *
 * Features:
 * - Edit text messages
 * - Character counter
 * - Animated keyboard handling
 * - Cancel/Save actions
 */

import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../../../utils/haptics';

// Tokens
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../../../utils/tokens';

const MAX_LENGTH = 2000;
const SHEET_HEIGHT = 250;

const EditMessageSheet = memo(({
  visible,
  message,
  onClose,
  onSave,
}) => {
  // Local state
  const [editedContent, setEditedContent] = useState('');
  const [saving, setSaving] = useState(false);

  // Refs
  const inputRef = useRef(null);
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Initialize content when message changes
  useEffect(() => {
    if (message) {
      setEditedContent(message.content || '');
    }
  }, [message]);

  // Open animation and focus
  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        inputRef.current?.focus();
      });
    }
  }, [visible, translateY, backdropOpacity]);

  // Close animation
  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [translateY, backdropOpacity, onClose]);

  // Save changes
  const handleSave = useCallback(async () => {
    if (!editedContent.trim() || saving) return;
    if (editedContent.trim() === message?.content?.trim()) {
      handleClose();
      return;
    }

    try {
      setSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await onSave?.(message.id, editedContent.trim());
      handleClose();
    } catch (error) {
      console.error('Error saving message:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  }, [editedContent, message, saving, onSave, handleClose]);

  // Can save
  const canSave = editedContent.trim() && editedContent.trim() !== message?.content?.trim();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={handleClose}
        />
      </Animated.View>

      {/* Sheet */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <Animated.View
          style={[
            styles.sheetContainer,
            { transform: [{ translateY }] },
          ]}
        >
          <BlurView intensity={40} style={styles.sheet}>
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Edit Message</Text>
              <TouchableOpacity
                onPress={handleSave}
                style={styles.headerButton}
                disabled={!canSave || saving}
              >
                <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>
                  {saving ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={editedContent}
                onChangeText={setEditedContent}
                multiline
                maxLength={MAX_LENGTH}
                placeholder="Message..."
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.editedBadge}>
                <Ionicons name="pencil" size={12} color={COLORS.textMuted} />
                <Text style={styles.editedText}>
                  Messages show "edited" after saving
                </Text>
              </View>
              <Text style={styles.charCount}>
                {editedContent.length}/{MAX_LENGTH}
              </Text>
            </View>
          </BlurView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

EditMessageSheet.displayName = 'EditMessageSheet';

export default EditMessageSheet;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouch: {
    flex: 1,
  },

  // Keyboard view
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  // Sheet
  sheetContainer: {
    minHeight: SHEET_HEIGHT,
    maxHeight: '70%',
  },
  sheet: {
    flex: 1,
    backgroundColor: 'rgba(15, 16, 48, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },

  // Handle
  handleContainer: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  headerButton: {
    minWidth: 60,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  cancelText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
  },
  saveText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    textAlign: 'right',
  },
  saveTextDisabled: {
    color: COLORS.textMuted,
  },

  // Input
  inputContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    textAlignVertical: 'top',
    lineHeight: 24,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.1)',
  },
  editedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  editedText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  charCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
});
