/**
 * Gemral - Notification Settings Sheet
 * Per-conversation notification settings
 *
 * Features:
 * - Mute conversation (with duration options)
 * - Custom notification sound
 * - Show/hide previews
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
  Switch,
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

const SHEET_HEIGHT = 400;

// Mute duration options
const MUTE_OPTIONS = [
  { label: '1 hour', value: 1 },
  { label: '8 hours', value: 8 },
  { label: '1 day', value: 24 },
  { label: '1 week', value: 168 },
  { label: 'Forever', value: -1 },
];

const NotificationSettingsSheet = memo(({
  visible,
  settings,
  onClose,
  onSave,
}) => {
  // Local state
  const [isMuted, setIsMuted] = useState(settings?.is_muted || false);
  const [muteDuration, setMuteDuration] = useState(settings?.mute_duration || null);
  const [showPreviews, setShowPreviews] = useState(settings?.show_previews !== false);

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

  // Update local state when settings change
  useEffect(() => {
    if (settings) {
      setIsMuted(settings.is_muted || false);
      setMuteDuration(settings.mute_duration || null);
      setShowPreviews(settings.show_previews !== false);
    }
  }, [settings]);

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
    onSave?.({
      is_muted: isMuted,
      mute_duration: isMuted ? muteDuration : null,
      show_previews: showPreviews,
    });
    handleClose();
  }, [isMuted, muteDuration, showPreviews, onSave, handleClose]);

  // Toggle mute
  const handleToggleMute = useCallback((value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMuted(value);
    if (!value) {
      setMuteDuration(null);
    }
  }, []);

  // Select mute duration
  const handleSelectDuration = useCallback((duration) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMuteDuration(duration);
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

          {/* Title */}
          <Text style={styles.title}>Notification Settings</Text>

          {/* Mute Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-off" size={22} color={COLORS.textPrimary} />
              <Text style={styles.settingLabel}>Mute Notifications</Text>
            </View>
            <Switch
              value={isMuted}
              onValueChange={handleToggleMute}
              trackColor={{ false: COLORS.glassBg, true: COLORS.purple }}
              thumbColor={COLORS.textPrimary}
            />
          </View>

          {/* Mute Duration Options */}
          {isMuted && (
            <View style={styles.durationOptions}>
              <Text style={styles.durationLabel}>Mute for:</Text>
              <View style={styles.durationButtons}>
                {MUTE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.durationButton,
                      muteDuration === option.value && styles.durationButtonActive,
                    ]}
                    onPress={() => handleSelectDuration(option.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.durationButtonText,
                      muteDuration === option.value && styles.durationButtonTextActive,
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Show Previews Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="eye" size={22} color={COLORS.textPrimary} />
              <Text style={styles.settingLabel}>Show Message Previews</Text>
            </View>
            <Switch
              value={showPreviews}
              onValueChange={(value) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowPreviews(value);
              }}
              trackColor={{ false: COLORS.glassBg, true: COLORS.purple }}
              thumbColor={COLORS.textPrimary}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>
        </BlurView>
      </Animated.View>
    </Modal>
  );
});

NotificationSettingsSheet.displayName = 'NotificationSettingsSheet';

export default NotificationSettingsSheet;

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
    paddingHorizontal: SPACING.lg,
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

  // Title
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },

  // Setting Row
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },

  // Duration Options
  durationOptions: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  durationLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  durationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  durationButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  durationButtonActive: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },
  durationButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  durationButtonTextActive: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // Save Button
  saveButton: {
    marginTop: SPACING.xl,
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
