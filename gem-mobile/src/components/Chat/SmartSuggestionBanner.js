// src/components/Chat/SmartSuggestionBanner.js
// ============================================================
// SMART SUGGESTION BANNER COMPONENT
// Banner for proactive smart triggers with expandable gesture
// ============================================================

import React, { memo, useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
  PanResponder,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { X, Sparkles, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../../contexts/SettingsContext';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Get status bar height for Android
const ANDROID_STATUS_BAR_HEIGHT = StatusBar.currentHeight || 24;

// Gesture thresholds
const EXPAND_THRESHOLD = 30; // Pixels to drag before expanding
const DISMISS_UP_THRESHOLD = -50; // Drag up to dismiss

const SmartSuggestionBanner = memo(({
  trigger,
  onDismiss,
  onAction,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // Get safe area insets for proper top padding
  let topInset = Platform.OS === 'android' ? ANDROID_STATUS_BAR_HEIGHT : 0;
  try {
    const insets = useSafeAreaInsets();
    topInset = Math.max(insets.top, topInset);
  } catch (e) {
    // Hook not available in test environment
  }

  // State
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);

  // Animation refs
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const dragY = useRef(new Animated.Value(0)).current;

  // Slide in animation
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  // Toggle expand with animation
  const toggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(prev => !prev);
  }, []);

  // Pan responder for drag gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical drags
        return Math.abs(gestureState.dy) > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        dragY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Limit drag range
        const clampedDy = Math.max(-80, Math.min(100, gestureState.dy));
        dragY.setValue(clampedDy);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Dismiss if dragged up enough
        if (gestureState.dy < DISMISS_UP_THRESHOLD) {
          handleDismiss();
          return;
        }

        // Expand if dragged down enough
        if (gestureState.dy > EXPAND_THRESHOLD && !isExpanded) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setIsExpanded(true);
        }

        // Spring back
        Animated.spring(dragY, {
          toValue: 0,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const handleDismiss = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss?.();
    });
  }, [onDismiss, slideAnim]);

  const handleAction = useCallback(() => {
    onAction?.(trigger?.action, trigger);
  }, [onAction, trigger]);

  // Measure full content height
  const onContentLayout = useCallback((event) => {
    const { height } = event.nativeEvent.layout;
    if (height > contentHeight) {
      setContentHeight(height);
    }
  }, [contentHeight]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: SPACING.sm,
    },
    content: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 16,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: 'rgba(255, 189, 89, 0.3)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    contentExpanded: {
      paddingBottom: SPACING.md,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 189, 89, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.sm,
      flexShrink: 0,
    },
    messageContainer: {
      flex: 1,
      marginRight: SPACING.sm,
    },
    message: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textPrimary,
      lineHeight: 22,
    },
    dismissButton: {
      padding: SPACING.xs,
      marginTop: -4,
      flexShrink: 0,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SPACING.sm,
      paddingLeft: 36 + SPACING.sm, // Align with message text
    },
    expandButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderRadius: 12,
    },
    expandText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
    },
    spacer: {
      flex: 1,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.gold,
      paddingVertical: SPACING.xs + 2,
      paddingHorizontal: SPACING.md,
      borderRadius: 10,
    },
    actionButtonText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.bgDark,
    },
    dragIndicator: {
      alignItems: 'center',
      paddingTop: SPACING.sm,
      paddingBottom: 2,
    },
    dragBar: {
      width: 36,
      height: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 2,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!trigger) return null;

  // Check if message is long (needs expansion)
  const messageLength = trigger?.message?.length || 0;
  const needsExpansion = messageLength > 80;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: topInset + SPACING.xs,
          transform: [
            { translateY: Animated.add(slideAnim, dragY) }
          ]
        }
      ]}
      {...panResponder.panHandlers}
    >
      <View style={[styles.content, isExpanded && styles.contentExpanded]}>
        {/* Header row */}
        <View style={styles.headerRow}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Sparkles size={20} color={colors.gold} />
          </View>

          {/* Message */}
          <View style={styles.messageContainer} onLayout={onContentLayout}>
            <Text
              style={styles.message}
              numberOfLines={isExpanded ? undefined : 2}
            >
              {trigger?.message || ''}
            </Text>
          </View>

          {/* Dismiss button */}
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Footer row with actions */}
        <View style={styles.footerRow}>
          {/* Expand/Collapse indicator */}
          {needsExpansion && (
            <TouchableOpacity
              style={styles.expandButton}
              onPress={toggleExpand}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={14} color={colors.textMuted} />
                  <Text style={styles.expandText}>Thu gọn</Text>
                </>
              ) : (
                <>
                  <ChevronDown size={14} color={colors.textMuted} />
                  <Text style={styles.expandText}>Xem thêm</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Action Button */}
          {trigger?.action && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAction}
            >
              <Text style={styles.actionButtonText}>Khám phá</Text>
              <ArrowRight size={14} color={colors.bgDark} />
            </TouchableOpacity>
          )}
        </View>

        {/* Drag indicator */}
        {!isExpanded && needsExpansion && (
          <View style={styles.dragIndicator}>
            <View style={styles.dragBar} />
          </View>
        )}
      </View>
    </Animated.View>
  );
});

SmartSuggestionBanner.displayName = 'SmartSuggestionBanner';

export default SmartSuggestionBanner;
