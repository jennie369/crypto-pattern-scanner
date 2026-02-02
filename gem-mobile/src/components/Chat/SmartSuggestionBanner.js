// src/components/Chat/SmartSuggestionBanner.js
// ============================================================
// SMART SUGGESTION BANNER COMPONENT
// Banner for proactive smart triggers
// ============================================================

import React, { memo, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform, StatusBar } from 'react-native';
import { X, Sparkles, ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

// Get status bar height for Android
const ANDROID_STATUS_BAR_HEIGHT = StatusBar.currentHeight || 24;

const SmartSuggestionBanner = memo(({
  trigger,
  onDismiss,
  onAction,
}) => {
  // Get safe area insets for proper top padding
  let topInset = Platform.OS === 'android' ? ANDROID_STATUS_BAR_HEIGHT : 0;
  try {
    const insets = useSafeAreaInsets();
    topInset = Math.max(insets.top, topInset);
  } catch (e) {
    // Hook not available in test environment
  }

  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss?.();
    });
  };

  const handleAction = () => {
    onAction?.(trigger?.action, trigger);
  };

  if (!trigger) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: topInset + SPACING.xs,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Sparkles size={20} color={COLORS.gold} />
        </View>

        {/* Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.message} numberOfLines={2}>
            {trigger?.message || ''}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {/* Dismiss */}
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Action Button */}
          {trigger?.action && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAction}
            >
              <Text style={styles.actionButtonText}>Khám phá</Text>
              <ArrowRight size={14} color={COLORS.bgDark} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: SPACING.sm,
  },
  content: {
    backgroundColor: 'rgba(15, 16, 48, 0.95)',
    borderRadius: 16,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  messageContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  message: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dismissButton: {
    padding: SPACING.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDark,
  },
});

SmartSuggestionBanner.displayName = 'SmartSuggestionBanner';

export default SmartSuggestionBanner;
