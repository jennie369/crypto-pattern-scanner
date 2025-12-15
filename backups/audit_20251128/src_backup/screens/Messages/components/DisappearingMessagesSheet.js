/**
 * Gemral - Disappearing Messages Sheet Component
 * Configure auto-delete timer for messages
 *
 * Features:
 * - Multiple duration options
 * - Visual duration selector
 * - Info about how it works
 * - Animated bottom sheet
 */

import React, { useEffect, useRef, useState, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  PanResponder,
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

const SHEET_HEIGHT = 450;

// Disappearing message duration options
const DURATION_OPTIONS = [
  { label: 'Off', value: 0, description: 'Messages won\'t disappear' },
  { label: '24 hours', value: 24, description: 'Messages disappear after 1 day' },
  { label: '7 days', value: 168, description: 'Messages disappear after 1 week' },
  { label: '90 days', value: 2160, description: 'Messages disappear after 3 months' },
];

const DisappearingMessagesSheet = memo(({
  visible,
  currentDuration = 0,
  onClose,
  onSave,
}) => {
  // Local state
  const [selectedDuration, setSelectedDuration] = useState(currentDuration);

  // Animation refs
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Pan responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            tension: 65,
            friction: 11,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Update local state when prop changes
  useEffect(() => {
    setSelectedDuration(currentDuration);
  }, [currentDuration]);

  // Open animation
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
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  // Close animation
  const handleClose = useCallback(() => {
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

  // Save settings
  const handleSave = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave?.(selectedDuration);
    handleClose();
  }, [selectedDuration, onSave, handleClose]);

  // Select duration
  const handleSelectDuration = useCallback((duration) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDuration(duration);
  }, []);

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
      <Animated.View
        style={[
          styles.sheetContainer,
          { transform: [{ translateY }] },
        ]}
        {...panResponder.panHandlers}
      >
        <BlurView intensity={40} style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="timer-outline" size={28} color={COLORS.purple} />
            </View>
            <Text style={styles.title}>Disappearing Messages</Text>
            <Text style={styles.subtitle}>
              New messages will automatically disappear after the selected time
            </Text>
          </View>

          {/* Duration Options */}
          <View style={styles.options}>
            {DURATION_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionItem,
                  selectedDuration === option.value && styles.optionItemSelected,
                ]}
                onPress={() => handleSelectDuration(option.value)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <Text style={[
                    styles.optionLabel,
                    selectedDuration === option.value && styles.optionLabelSelected,
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>
                {selectedDuration === option.value && (
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.purple} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={18} color={COLORS.textMuted} />
            <Text style={styles.infoText}>
              This setting applies to all new messages in this conversation.
              Existing messages won't be affected.
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </BlurView>
      </Animated.View>
    </Modal>
  );
});

DisappearingMessagesSheet.displayName = 'DisappearingMessagesSheet';

export default DisappearingMessagesSheet;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouch: {
    flex: 1,
  },

  // Sheet
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
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
    paddingVertical: SPACING.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Header
  header: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Options
  options: {
    paddingHorizontal: SPACING.lg,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  optionItemSelected: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.purple,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  optionLabelSelected: {
    color: COLORS.purple,
  },
  optionDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    lineHeight: 16,
  },

  // Save Button
  saveButton: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.purple,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
});
