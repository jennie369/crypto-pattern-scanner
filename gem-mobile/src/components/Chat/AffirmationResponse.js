// src/components/Chat/AffirmationResponse.js
// ============================================================
// AFFIRMATION RESPONSE COMPONENT
// Beautiful affirmation card with pulse animation
// ============================================================

import React, { memo, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Heart, Bookmark, Volume2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';

const AffirmationResponse = memo(({
  text,
  frequency,
  backgroundColor,
  onRepeat,
  onSave,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const gradientColors = backgroundColor
    ? [backgroundColor, 'rgba(0,0,0,0.3)']
    : [COLORS.purple, COLORS.cyan];

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
      <LinearGradient
        colors={gradientColors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Frequency Badge */}
        {frequency && (
          <View style={styles.frequencyBadge}>
            <Text style={styles.frequencyText}>{frequency}Hz</Text>
          </View>
        )}

        {/* Affirmation Text */}
        <Text style={styles.affirmationText}>{text || ''}</Text>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onRepeat}
          >
            <Volume2 size={20} color={COLORS.textPrimary} />
            <Text style={styles.actionText}>Lặp lại</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onSave}
          >
            <Bookmark size={20} color={COLORS.textPrimary} />
            <Text style={styles.actionText}>Lưu</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  frequencyBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 20,
    marginBottom: SPACING.md,
  },
  frequencyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  affirmationText: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: SPACING.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
});

AffirmationResponse.displayName = 'AffirmationResponse';

export default AffirmationResponse;
