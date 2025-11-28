/**
 * Gemral - Mute Conversation Sheet Component
 * Bottom sheet for muting conversation notifications
 *
 * Features:
 * - Multiple duration options
 * - Current mute status display
 * - Unmute option
 * - Visual duration selector
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

const SHEET_HEIGHT = 400;

// Mute duration options
const MUTE_OPTIONS = [
  { label: '1 hour', value: 1, icon: 'time-outline' },
  { label: '8 hours', value: 8, icon: 'partly-sunny-outline' },
  { label: '1 day', value: 24, icon: 'sunny-outline' },
  { label: '1 week', value: 168, icon: 'calendar-outline' },
  { label: 'Forever', value: -1, icon: 'infinite-outline' },
];

const MuteConversationSheet = memo(({
  visible,
  currentMuteUntil,
  conversationName,
  onClose,
  onMute,
  onUnmute,
}) => {
  // Local state
  const [selectedDuration, setSelectedDuration] = useState(null);

  // Animation refs
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Check if currently muted
  const isMuted = currentMuteUntil && (
    currentMuteUntil === -1 ||
    new Date(currentMuteUntil) > new Date()
  );

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

  // Open animation
  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedDuration(null);
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

  // Handle mute selection
  const handleSelectDuration = useCallback((duration) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDuration(duration);
  }, []);

  // Confirm mute
  const handleConfirmMute = useCallback(() => {
    if (selectedDuration === null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onMute?.(selectedDuration);
    handleClose();
  }, [selectedDuration, onMute, handleClose]);

  // Handle unmute
  const handleUnmute = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onUnmute?.();
    handleClose();
  }, [onUnmute, handleClose]);

  // Format current mute status
  const getMuteStatusText = () => {
    if (!isMuted) return null;
    if (currentMuteUntil === -1) return 'Muted forever';

    const muteDate = new Date(currentMuteUntil);
    const now = new Date();
    const diffMs = muteDate - now;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Muted for less than an hour';
    } else if (diffHours < 24) {
      return `Muted for ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else {
      return `Muted for ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
  };

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
              <Ionicons
                name={isMuted ? 'notifications-off' : 'notifications-outline'}
                size={28}
                color={isMuted ? COLORS.warning : COLORS.purple}
              />
            </View>
            <Text style={styles.title}>
              {isMuted ? 'Notifications Muted' : 'Mute Notifications'}
            </Text>
            <Text style={styles.subtitle}>
              {conversationName}
            </Text>
          </View>

          {/* Current status or options */}
          {isMuted ? (
            <>
              {/* Current mute status */}
              <View style={styles.statusContainer}>
                <Ionicons name="time" size={18} color={COLORS.warning} />
                <Text style={styles.statusText}>{getMuteStatusText()}</Text>
              </View>

              {/* Unmute button */}
              <TouchableOpacity
                style={styles.unmuteButton}
                onPress={handleUnmute}
                activeOpacity={0.8}
              >
                <Ionicons name="notifications" size={20} color={COLORS.textPrimary} />
                <Text style={styles.unmuteButtonText}>Unmute</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Duration Options */}
              <View style={styles.options}>
                {MUTE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionItem,
                      selectedDuration === option.value && styles.optionItemSelected,
                    ]}
                    onPress={() => handleSelectDuration(option.value)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={option.icon}
                      size={22}
                      color={selectedDuration === option.value ? COLORS.purple : COLORS.textMuted}
                    />
                    <Text style={[
                      styles.optionLabel,
                      selectedDuration === option.value && styles.optionLabelSelected,
                    ]}>
                      {option.label}
                    </Text>
                    {selectedDuration === option.value && (
                      <Ionicons name="checkmark-circle" size={22} color={COLORS.purple} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Mute Button */}
              <TouchableOpacity
                style={[
                  styles.muteButton,
                  selectedDuration === null && styles.muteButtonDisabled,
                ]}
                onPress={handleConfirmMute}
                disabled={selectedDuration === null}
                activeOpacity={0.8}
              >
                <Ionicons name="notifications-off" size={20} color={COLORS.textPrimary} />
                <Text style={styles.muteButtonText}>Mute Notifications</Text>
              </TouchableOpacity>
            </>
          )}
        </BlurView>
      </Animated.View>
    </Modal>
  );
});

MuteConversationSheet.displayName = 'MuteConversationSheet';

export default MuteConversationSheet;

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
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
  },

  // Status
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.lg,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderRadius: 12,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.warning,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
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
    marginBottom: SPACING.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  optionItemSelected: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.purple,
  },
  optionLabel: {
    flex: 1,
    marginLeft: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },
  optionLabelSelected: {
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // Buttons
  muteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.warning,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  muteButtonDisabled: {
    backgroundColor: 'rgba(255, 189, 89, 0.3)',
  },
  muteButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  unmuteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.purple,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  unmuteButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
});
