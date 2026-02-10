/**
 * GEM Academy - Level Up Modal
 * Celebration modal when user levels up
 */

import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, Zap, ChevronRight, Sparkles } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { LEVEL_CONFIG } from '../../services/learningGamificationService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BORDER_RADIUS = { xl: 20, md: 12, full: 9999 };

const LevelUpModal = ({
  visible = false,
  newLevel = 1,
  onClose,
  onViewRewards,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const starAnims = useRef([...Array(5)].map(() => new Animated.Value(0))).current;

  const levelInfo = LEVEL_CONFIG[newLevel] || { title: 'Unknown', color: colors.gold };

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      fadeAnim.setValue(0);
      starAnims.forEach(anim => anim.setValue(0));

      // Play entrance animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Rotate badge slightly
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        // Staggered stars
        Animated.stagger(100, starAnims.map(anim =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 100,
            friction: 5,
            useNativeDriver: true,
          })
        )),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) onClose();
    });
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '10deg'],
  });

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: SCREEN_WIDTH - SPACING.huge * 2,
      maxWidth: 340,
      borderRadius: BORDER_RADIUS.xl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255, 189, 89, 0.3)',
      position: 'relative',
    },
    gradient: {
      padding: SPACING.xxl,
      alignItems: 'center',
    },
    star: {
      position: 'absolute',
      zIndex: 10,
    },
    badgeContainer: {
      marginBottom: SPACING.lg,
      position: 'relative',
    },
    badge: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    badgeGlow: {
      position: 'absolute',
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.gold,
      opacity: 0.2,
      top: -10,
      left: -10,
      zIndex: -1,
    },
    levelNumber: {
      fontSize: 36,
      fontWeight: TYPOGRAPHY.fontWeight.extrabold,
      color: colors.bgDarkest,
    },
    congratsText: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.gold,
      letterSpacing: 2,
      marginBottom: SPACING.xs,
    },
    levelTitle: {
      fontSize: TYPOGRAPHY.fontSize.hero,
      fontWeight: TYPOGRAPHY.fontWeight.extrabold,
      color: colors.textPrimary,
      marginBottom: SPACING.md,
      textAlign: 'center',
    },
    description: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: SPACING.lg,
    },
    rewardsContainer: {
      width: '100%',
      marginBottom: SPACING.xl,
    },
    rewardItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.md,
      marginBottom: SPACING.sm,
    },
    rewardText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textSecondary,
      marginLeft: SPACING.md,
    },
    buttonRow: {
      flexDirection: 'row',
      width: '100%',
      gap: SPACING.md,
    },
    secondaryButton: {
      flex: 1,
      paddingVertical: SPACING.md,
      borderRadius: BORDER_RADIUS.md,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButtonText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textSecondary,
    },
    primaryButton: {
      flex: 1.5,
      borderRadius: BORDER_RADIUS.md,
      overflow: 'hidden',
    },
    primaryButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
    },
    primaryButtonText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.bgDarkest,
      marginRight: SPACING.xs,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  const modalBackground = settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <BlurView intensity={30} tint="dark" style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />

          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            {/* Decorative stars */}
            {starAnims.map((anim, index) => {
              const positions = [
                { top: -20, left: 20 },
                { top: -15, right: 30 },
                { top: 40, left: -10 },
                { top: 50, right: -15 },
                { bottom: 60, left: 40 },
              ];
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.star,
                    positions[index],
                    {
                      transform: [{ scale: anim }],
                      opacity: anim,
                    },
                  ]}
                >
                  <Sparkles size={20} color={colors.gold} />
                </Animated.View>
              );
            })}

            <LinearGradient
              colors={[modalBackground, modalBackground]}
              style={styles.gradient}
            >
              {/* Level badge */}
              <Animated.View
                style={[
                  styles.badgeContainer,
                  { transform: [{ rotate: rotateInterpolate }] },
                ]}
              >
                <LinearGradient
                  colors={[colors.gold, '#FFD700']}
                  style={styles.badge}
                >
                  <Text style={styles.levelNumber}>{newLevel}</Text>
                </LinearGradient>
                <View style={styles.badgeGlow} />
              </Animated.View>

              {/* Title */}
              <Text style={styles.congratsText}>LEVEL UP!</Text>
              <Text style={styles.levelTitle}>{levelInfo.title}</Text>

              {/* Description */}
              <Text style={styles.description}>
                Chúc mừng bạn đã đạt Level {newLevel}! Tiếp tục học để mở khóa thêm nhiều phần thưởng.
              </Text>

              {/* Rewards preview */}
              <View style={styles.rewardsContainer}>
                <View style={styles.rewardItem}>
                  <Zap size={20} color={colors.cyan} />
                  <Text style={styles.rewardText}>+{newLevel * 50} XP bonus</Text>
                </View>
                <View style={styles.rewardItem}>
                  <Star size={20} color={colors.gold} />
                  <Text style={styles.rewardText}>New achievements unlocked</Text>
                </View>
              </View>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.secondaryButtonText}>Tiếp tục</Text>
                </TouchableOpacity>

                {onViewRewards && (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => {
                      handleClose();
                      onViewRewards();
                    }}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={[colors.gold, '#FFD700']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryButtonGradient}
                    >
                      <Text style={styles.primaryButtonText}>Xem phần thưởng</Text>
                      <ChevronRight size={18} color={colors.bgDarkest} />
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

export default LevelUpModal;
