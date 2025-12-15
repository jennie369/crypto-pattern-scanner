/**
 * Gemral - Gem Purchase Success Screen
 * Shows success message after purchasing gems via Shopify
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Gem,
  CheckCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../../utils/tokens';
import { useTabBar } from '../../contexts/TabBarContext';
import { TouchableOpacity } from 'react-native';

const GemPurchaseSuccessScreen = ({ navigation, route }) => {
  const { gemAmount, orderNumber, packageName } = route.params || {};
  const { hideTabBar, showTabBar } = useTabBar();

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    hideTabBar();

    // Entrance animations
    Animated.sequence([
      // Icon bounce in
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      // Content fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Sparkle animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => showTabBar();
  }, []);

  const handleGoToWallet = () => {
    // Navigate to Wallet to see updated balance
    navigation.reset({
      index: 1,
      routes: [
        { name: 'AssetsHome' },
        { name: 'Wallet' },
      ],
    });
  };

  const handleBackToHome = () => {
    // Go back to Account home
    navigation.reset({
      index: 0,
      routes: [{ name: 'AssetsHome' }],
    });
  };

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Success Icon with Animation */}
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <LinearGradient
              colors={['rgba(106, 91, 255, 0.3)', 'rgba(106, 91, 255, 0.1)']}
              style={styles.iconGlow}
            />
            <View style={styles.iconCircle}>
              <Gem size={48} color={COLORS.purple} />
              <View style={styles.checkBadge}>
                <CheckCircle size={24} color={COLORS.success} fill={COLORS.success} />
              </View>
            </View>

            {/* Sparkles */}
            <Animated.View style={[styles.sparkle, styles.sparkle1, { opacity: sparkleOpacity }]}>
              <Sparkles size={16} color={COLORS.gold} />
            </Animated.View>
            <Animated.View style={[styles.sparkle, styles.sparkle2, { opacity: sparkleOpacity }]}>
              <Sparkles size={12} color={COLORS.purple} />
            </Animated.View>
            <Animated.View style={[styles.sparkle, styles.sparkle3, { opacity: sparkleOpacity }]}>
              <Sparkles size={14} color={COLORS.cyan} />
            </Animated.View>
          </Animated.View>

          {/* Success Message */}
          <Animated.View
            style={[
              styles.messageContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.successTitle}>Mua Gems Thành Công!</Text>
            <Text style={styles.successSubtitle}>
              Gems đã được thêm vào tài khoản của bạn
            </Text>

            {/* Gem Amount Card */}
            <View style={styles.amountCard}>
              <Text style={styles.amountLabel}>Bạn đã nhận</Text>
              <View style={styles.amountRow}>
                <Gem size={32} color={COLORS.purple} />
                <Text style={styles.amountValue}>+{gemAmount || 0}</Text>
              </View>
              <Text style={styles.amountUnit}>Gems</Text>
            </View>

            {/* Order Info */}
            {(orderNumber || packageName) && (
              <View style={styles.orderInfo}>
                {packageName && (
                  <View style={styles.orderRow}>
                    <Text style={styles.orderLabel}>Gói:</Text>
                    <Text style={styles.orderValue}>{packageName}</Text>
                  </View>
                )}
                {orderNumber && (
                  <View style={styles.orderRow}>
                    <Text style={styles.orderLabel}>Mã đơn:</Text>
                    <Text style={styles.orderValue}>#{orderNumber}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Info Note */}
            <View style={styles.infoNote}>
              <Text style={styles.infoNoteText}>
                Gems có thể sử dụng để gửi quà, boost bài viết, và nhiều tính năng khác trong ứng dụng.
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Action Buttons */}
        <Animated.View
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGoToWallet}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={GRADIENTS.primaryButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButtonGradient}
            >
              <Gem size={20} color={COLORS.textPrimary} />
              <Text style={styles.primaryButtonText}>Xem Ví</Text>
              <ArrowRight size={18} color={COLORS.textPrimary} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleBackToHome}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Quay lại Trang chính</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: SPACING.xl,
  },
  iconGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    top: -30,
    left: -30,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: GLASS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.purple,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.bgDarkest,
    borderRadius: 14,
    padding: 2,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: -10,
    right: -10,
  },
  sparkle2: {
    bottom: 10,
    left: -15,
  },
  sparkle3: {
    top: 20,
    right: -20,
  },
  messageContainer: {
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  successSubtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  amountCard: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderRadius: 20,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    marginBottom: SPACING.lg,
  },
  amountLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  amountValue: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.purple,
  },
  amountUnit: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  orderInfo: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    width: '100%',
    marginBottom: SPACING.md,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  orderLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  orderValue: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  infoNote: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderRadius: 10,
    padding: SPACING.md,
    width: '100%',
  },
  infoNoteText: {
    fontSize: 12,
    color: COLORS.cyan,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  primaryButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 2,
    gap: SPACING.sm,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});

export default GemPurchaseSuccessScreen;
