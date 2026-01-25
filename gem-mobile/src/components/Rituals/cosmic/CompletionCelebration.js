/**
 * CompletionCelebration - OPTIMIZED VERSION V2
 * Fixed: opacity issues, animation lag, better UX
 * Uses native driver animations for smooth performance
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated as RNAnimated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Check, Flame, Star, ChevronRight, X, Send, PenLine } from 'lucide-react-native';

import {
  COSMIC_COLORS,
  COSMIC_SPACING,
  COSMIC_RADIUS,
} from '../../../theme/cosmicTokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// RITUAL THEMES
// ============================================

const RITUAL_THEMES = {
  heart: {
    icon: '💖',
    color: COSMIC_COLORS.ritualThemes.heart.primary,
    gradient: COSMIC_COLORS.ritualThemes.heart.gradient,
    title: 'Mở Rộng Trái Tim',
  },
  gratitude: {
    icon: '🙏',
    color: COSMIC_COLORS.ritualThemes.gratitude.primary,
    gradient: COSMIC_COLORS.ritualThemes.gratitude.gradient,
    title: 'Tri Ân',
  },
  breath: {
    icon: '🌬️',
    color: COSMIC_COLORS.ritualThemes.breath.primary,
    gradient: COSMIC_COLORS.ritualThemes.breath.gradient,
    title: 'Hơi Thở Thanh Lọc',
  },
  water: {
    icon: '💧',
    color: COSMIC_COLORS.ritualThemes.water.primary,
    gradient: COSMIC_COLORS.ritualThemes.water.gradient,
    title: 'Lập Trình Nước',
  },
  letter: {
    icon: '✉️',
    color: COSMIC_COLORS.ritualThemes.letter.primary,
    gradient: COSMIC_COLORS.ritualThemes.letter.gradient,
    title: 'Thư Gửi Vũ Trụ',
  },
  burn: {
    icon: '🔥',
    color: COSMIC_COLORS.ritualThemes.burn.primary,
    gradient: COSMIC_COLORS.ritualThemes.burn.gradient,
    title: 'Đốt Cháy & Giải Phóng',
  },
  star: {
    icon: '⭐',
    color: COSMIC_COLORS.ritualThemes.star.primary,
    gradient: ['#FFFFFF', '#E0E0E0', '#C0C0C0'],
    title: 'Điều Ước Sao Băng',
  },
};

// ============================================
// FLOATING PARTICLES - REMOVED FOR PERFORMANCE
// Using simple static glow instead
// ============================================

// ============================================
// ELEGANT CHECKMARK - OPTIMIZED V2
// Uses native driver for smooth animation
// ============================================

const ElegantCheckmark = React.memo(({ color, gradient }) => {
  const scaleAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    // Single smooth spring animation with native driver
    RNAnimated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.checkmarkWrapper}>
      <RNAnimated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        }}
      >
        <LinearGradient
          colors={gradient}
          style={styles.checkmarkCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Check size={28} color="#FFF" strokeWidth={3} />
        </LinearGradient>
      </RNAnimated.View>
    </View>
  );
});

// ============================================
// XP DISPLAY - OPTIMIZED V2 (Native driver)
// ============================================

const XPDisplay = React.memo(({ xp, color }) => {
  const scaleAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.spring(scaleAnim, {
      toValue: 1,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <RNAnimated.View
      style={[
        styles.xpWrapper,
        {
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        }
      ]}
    >
      <View style={[styles.xpBadge, { backgroundColor: color + '30' }]}>
        <Star size={14} color={color} fill={color} />
        <Text style={[styles.xpText, { color }]}>+{xp} XP</Text>
      </View>
    </RNAnimated.View>
  );
});

// ============================================
// STREAK DISPLAY - OPTIMIZED V2 (Native driver)
// ============================================

const StreakDisplay = React.memo(({ streak, isNewRecord }) => {
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!streak || streak < 1) return null;

  return (
    <RNAnimated.View style={[styles.streakWrapper, { opacity: fadeAnim }]}>
      <View style={styles.streakInline}>
        <Flame size={16} color={COSMIC_COLORS.glow.orange} fill={COSMIC_COLORS.glow.orange} />
        <Text style={styles.streakText}>
          <Text style={styles.streakNumber}>{streak}</Text> ngày liên tiếp
        </Text>
        {isNewRecord && (
          <View style={styles.recordBadge}>
            <Text style={styles.recordText}>MỚI</Text>
          </View>
        )}
      </View>
    </RNAnimated.View>
  );
});

// ============================================
// ELEGANT BUTTON - OPTIMIZED (No animation, just static)
// ============================================

const ElegantButton = React.memo(({ label, onPress, variant = 'primary', color, icon, isLightColor = false }) => {
  const isPrimary = variant === 'primary';
  // Use dark text for light backgrounds (like star ritual)
  const textColor = isPrimary && isLightColor ? '#1A1A2E' : (isPrimary ? '#FFF' : COSMIC_COLORS.text.secondary);
  const iconColor = isLightColor ? '#1A1A2E' : '#FFF';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.elegantButton,
        isPrimary && { backgroundColor: color },
        !isPrimary && styles.outlineButton,
      ]}
    >
      {icon && !isPrimary && icon}
      <Text style={[
        styles.buttonText,
        { color: textColor },
      ]}>
        {label}
      </Text>
      {isPrimary && <ChevronRight size={18} color={iconColor} />}
    </TouchableOpacity>
  );
});

// ============================================
// REFLECTION INPUT VIEW - OPTIMIZED V2
// Fixed opacity, simplified animations using native driver
// ============================================

const ReflectionInput = React.memo(({ visible, onClose, onSubmit, color, ritualTitle, onSaving }) => {
  const [text, setText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  // Use native RN Animated for smoother performance
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const slideAnim = useRef(new RNAnimated.Value(100)).current;

  useEffect(() => {
    if (visible) {
      // Parallel animations with native driver
      RNAnimated.parallel([
        RNAnimated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        RNAnimated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Focus input after animation completes
        inputRef.current?.focus();
      });
    } else {
      RNAnimated.parallel([
        RNAnimated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        RNAnimated.timing(slideAnim, {
          toValue: 100,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setIsSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      // Call onSubmit and wait for it (for calendar update)
      // The onSubmit callback (handleReflectionSubmit) now has its own try-catch and timeout
      await onSubmit?.(text.trim());
    } catch (error) {
      // Log but continue - the UI should still close
      console.error('[ReflectionInput] Submit error:', error?.message || error);
    } finally {
      // Always reset state and close, even on error
      setIsSaving(false);
      setText('');
      onClose();
    }
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setText('');
    onClose();
  };

  if (!visible) return null;

  return (
    <RNAnimated.View
      style={[
        styles.reflectionOverlay,
        { opacity: fadeAnim }
      ]}
    >
      <TouchableOpacity
        style={styles.reflectionBackdrop}
        activeOpacity={1}
        onPress={handleClose}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.reflectionKeyboard}
      >
        <RNAnimated.View
          style={[
            styles.reflectionCard,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Header */}
          <View style={styles.reflectionHeader}>
            <View style={styles.reflectionTitleRow}>
              <PenLine size={20} color={color} />
              <Text style={styles.reflectionTitle}>Suy ngẫm</Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              disabled={isSaving}
            >
              <X size={22} color={COSMIC_COLORS.text.muted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.reflectionSubtitle}>
            Ghi lại cảm xúc sau {ritualTitle}
          </Text>

          {/* Input - Better contrast */}
          <View style={[styles.reflectionInputContainer, { borderColor: color }]}>
            <TextInput
              ref={inputRef}
              style={styles.reflectionTextInput}
              placeholder="Tôi cảm thấy..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              multiline
              value={text}
              onChangeText={setText}
              maxLength={500}
              editable={!isSaving}
            />
          </View>

          <Text style={styles.reflectionCharCount}>{text.length}/500</Text>

          {/* Actions */}
          <View style={styles.reflectionActions}>
            <TouchableOpacity
              style={styles.reflectionCancelBtn}
              onPress={handleClose}
              disabled={isSaving}
            >
              <Text style={styles.reflectionCancelText}>Bỏ qua</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.reflectionSubmitBtn,
                { backgroundColor: color },
                (!text.trim() || isSaving) && styles.reflectionSubmitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!text.trim() || isSaving}
            >
              <Send size={16} color="#FFF" />
              <Text style={styles.reflectionSubmitText}>
                {isSaving ? 'Đang lưu...' : 'Lưu'}
              </Text>
            </TouchableOpacity>
          </View>
        </RNAnimated.View>
      </KeyboardAvoidingView>
    </RNAnimated.View>
  );
});

// ============================================
// MAIN COMPONENT - OPTIMIZED V2
// Uses native RN Animated for smooth fade-in
// ============================================

const CompletionCelebration = ({
  ritualType = 'heart',
  xpEarned = 50,
  streakCount = 0,
  isNewRecord = false,
  message = 'Bạn đã hoàn thành nghi lễ!',
  onContinue,
  onAddToVisionBoard,
  onWriteReflection,
  showVisionBoardButton = true,
  showReflectionButton = true,
  visible = true,
  style,
}) => {
  const theme = RITUAL_THEMES[ritualType] || RITUAL_THEMES.heart;
  const [showReflectionInput, setShowReflectionInput] = useState(false);
  const hasTriggeredHaptic = useRef(false);

  // Use native RN Animated for smoother performance
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;

  // Animation sequence - simplified with native driver
  useEffect(() => {
    if (visible && !hasTriggeredHaptic.current) {
      // Single fade-in animation
      RNAnimated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Haptic once
      hasTriggeredHaptic.current = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [visible]);

  // Handle reflection button press
  const handleReflectionPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowReflectionInput(true);
  }, []);

  // Handle reflection submit - now async to support saving
  // Added proper error handling to prevent UI from getting stuck
  const handleReflectionSubmit = useCallback(async (text) => {
    try {
      // Call onWriteReflection and await if it returns a promise
      const result = onWriteReflection?.(text);
      if (result instanceof Promise) {
        // Add timeout to prevent infinite hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Save timeout after 15 seconds')), 15000);
        });
        await Promise.race([result, timeoutPromise]);
      }
      console.log('[CompletionCelebration] Reflection saved successfully');
    } catch (error) {
      // Log error but don't throw - allow UI to continue
      console.error('[CompletionCelebration] Failed to save reflection:', error?.message || error);
      // Still considered "success" from UI perspective - user wrote their reflection
    }
  }, [onWriteReflection]);

  if (!visible) return null;

  return (
    <RNAnimated.View style={[styles.container, { opacity: fadeAnim }, style]}>
      {/* Background - solid, no transparency issues */}
      <View style={styles.staticBackground} />

      {/* Main content */}
      <View style={styles.content}>
        {/* Checkmark */}
        <ElegantCheckmark color={theme.color} gradient={theme.gradient} />

        {/* Title */}
        <Text style={styles.title}>Hoàn thành!</Text>

        {/* Ritual name with XP inline */}
        <View style={styles.infoRow}>
          <Text style={styles.ritualName}>{theme.title}</Text>
          <XPDisplay xp={xpEarned} color={theme.color} />
        </View>

        {/* Message */}
        <Text style={styles.message}>{message}</Text>

        {/* Streak */}
        <StreakDisplay streak={streakCount} isNewRecord={isNewRecord} />

        {/* Divider */}
        <View style={styles.divider} />

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {showReflectionButton && (
            <ElegantButton
              label="Viết suy ngẫm"
              variant="outline"
              icon={<PenLine size={16} color={COSMIC_COLORS.text.secondary} style={{ marginRight: 6 }} />}
              onPress={handleReflectionPress}
            />
          )}

          <ElegantButton
            label="Tiếp tục"
            variant="primary"
            color={theme.color}
            onPress={onContinue}
            isLightColor={ritualType === 'star'}
          />
        </View>
      </View>

      {/* Reflection Input Modal */}
      <ReflectionInput
        visible={showReflectionInput}
        onClose={() => setShowReflectionInput(false)}
        onSubmit={handleReflectionSubmit}
        color={theme.color}
        ritualTitle={theme.title}
      />
    </RNAnimated.View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  staticBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 6, 18, 0.98)',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: COSMIC_SPACING.xl,
    maxWidth: 340,
    width: '100%',
  },

  // Checkmark
  checkmarkWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: COSMIC_SPACING.lg,
  },
  checkmarkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Title
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COSMIC_COLORS.text.primary,
    marginBottom: COSMIC_SPACING.xs,
    letterSpacing: 0.5,
  },

  // Info row
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.sm,
    marginBottom: COSMIC_SPACING.sm,
  },
  ritualName: {
    fontSize: 15,
    fontWeight: '500',
    color: COSMIC_COLORS.text.secondary,
  },

  // XP
  xpWrapper: {},
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  xpText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Message
  message: {
    fontSize: 14,
    color: COSMIC_COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: COSMIC_SPACING.md,
  },

  // Streak
  streakWrapper: {
    marginBottom: COSMIC_SPACING.md,
  },
  streakInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  streakText: {
    fontSize: 13,
    color: COSMIC_COLORS.text.secondary,
  },
  streakNumber: {
    fontWeight: '700',
    color: COSMIC_COLORS.glow.orange,
  },
  recordBadge: {
    backgroundColor: COSMIC_COLORS.glow.orange,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginLeft: 4,
  },
  recordText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#000',
  },

  // Divider
  divider: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1,
    marginVertical: COSMIC_SPACING.lg,
  },

  // Buttons
  buttonsContainer: {
    width: '100%',
    gap: COSMIC_SPACING.sm,
    alignItems: 'center',
  },
  elegantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
    gap: 6,
    minWidth: 160,
  },
  outlineButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#FFF',
  },

  // Reflection Input - FIXED OPACITY
  reflectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200, // Higher z-index to be above everything
  },
  reflectionBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 6, 18, 0.95)', // Almost opaque dark background
  },
  reflectionKeyboard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: COSMIC_SPACING.lg,
  },
  reflectionCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1A1A2E', // Solid dark background, not transparent
    borderRadius: COSMIC_RADIUS.xl,
    padding: COSMIC_SPACING.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    // Add shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 20,
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: COSMIC_SPACING.xs,
  },
  reflectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.sm,
  },
  reflectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF', // Pure white for better contrast
  },
  reflectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)', // Brighter for readability
    marginBottom: COSMIC_SPACING.md,
  },
  reflectionInputContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Darker input background
    borderRadius: COSMIC_RADIUS.md,
    borderWidth: 2,
    padding: COSMIC_SPACING.md,
    minHeight: 130,
  },
  reflectionTextInput: {
    fontSize: 16,
    color: '#FFFFFF', // Pure white text
    lineHeight: 24,
    textAlignVertical: 'top',
    minHeight: 110,
  },
  reflectionCharCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'right',
    marginTop: COSMIC_SPACING.xs,
    marginBottom: COSMIC_SPACING.md,
  },
  reflectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: COSMIC_SPACING.sm,
  },
  reflectionCancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  reflectionCancelText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  reflectionSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  reflectionSubmitBtnDisabled: {
    opacity: 0.5,
  },
  reflectionSubmitText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default React.memo(CompletionCelebration);
