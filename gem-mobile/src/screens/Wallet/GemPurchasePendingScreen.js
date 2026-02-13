/**
 * Gemral - Gem Purchase Pending Screen
 * Shows when order is created but payment not yet confirmed
 * (Bank transfer, COD, etc.)
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  Clock,
  CreditCard,
  ArrowRight,
  RefreshCw,
  CheckCircle,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../../utils/tokens';
import { useTabBar } from '../../contexts/TabBarContext';
import { TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import gemEconomyService from '../../services/gemEconomyService';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';

const GemPurchasePendingScreen = ({ navigation, route }) => {
  const { gemAmount, orderNumber, packageName, checkoutUrl } = route.params || {};
  const { hideTabBar, showTabBar } = useTabBar();
  const { user } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();

  // State for polling payment status
  const [checking, setChecking] = useState(false);
  const [initialBalance, setInitialBalance] = useState(null);

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    hideTabBar();

    // Get initial balance for comparison
    const getInitialBalance = async () => {
      if (user?.id) {
        const balance = await gemEconomyService.getGemBalance(user.id);
        setInitialBalance(balance);
      }
    };
    getInitialBalance();

    // Entrance animations
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
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

    // Pulse animation for clock icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => showTabBar();
  }, []);

  // Check if payment has been completed
  const handleCheckPaymentStatus = useCallback(async () => {
    if (!user?.id || initialBalance === null) {
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể kiểm tra. Vui lòng thử lại.',
      });
      return;
    }

    setChecking(true);

    try {
      // Get current balance
      const currentBalance = await gemEconomyService.getGemBalance(user.id);

      if (currentBalance > initialBalance) {
        // Payment confirmed! Gems have been added
        alert({
          type: 'success',
          title: 'Thanh toán thành công!',
          message: `Bạn đã nhận được ${currentBalance - initialBalance} Gems.`,
          buttons: [
            {
              text: 'Xem Ví',
              onPress: () => {
                navigation.reset({
                  index: 1,
                  routes: [
                    { name: 'AssetsHome' },
                    { name: 'Wallet' },
                  ],
                });
              },
            },
          ],
        });
      } else {
        alert({
          type: 'info',
          title: 'Chưa nhận được thanh toán',
          message: 'Nếu bạn đã chuyển khoản, vui lòng đợi 1-2 phút để hệ thống xử lý.',
          buttons: [{ text: 'OK' }],
        });
      }
    } catch (error) {
      console.error('[GemPurchasePending] Check status error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể kiểm tra trạng thái. Vui lòng thử lại.',
      });
    } finally {
      setChecking(false);
    }
  }, [user?.id, initialBalance, navigation, alert]);

  const handleGoToWallet = () => {
    navigation.reset({
      index: 1,
      routes: [
        { name: 'AssetsHome' },
        { name: 'Wallet' },
      ],
    });
  };

  const handleBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'AssetsHome' }],
    });
  };

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Pending Icon with Animation */}
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <LinearGradient
              colors={['rgba(255, 189, 89, 0.3)', 'rgba(255, 189, 89, 0.1)']}
              style={styles.iconGlow}
            />
            <Animated.View
              style={[
                styles.iconCircle,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <Clock size={48} color={COLORS.gold} />
            </Animated.View>
          </Animated.View>

          {/* Pending Message */}
          <Animated.View
            style={[
              styles.messageContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.pendingTitle}>Đơn Hàng Đã Được Tạo</Text>
            <Text style={styles.pendingSubtitle}>
              Vui lòng hoàn tất thanh toán để nhận Gems
            </Text>

            {/* Order Info Card */}
            <View style={styles.orderCard}>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Gói:</Text>
                <Text style={styles.orderValue}>{packageName || 'Gem Pack'}</Text>
              </View>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Số Gems:</Text>
                <View style={styles.gemRow}>
                  <Gem size={16} color={COLORS.gold} />
                  <Text style={styles.gemValue}>{gemAmount || 0}</Text>
                </View>
              </View>
              {orderNumber && (
                <View style={styles.orderRow}>
                  <Text style={styles.orderLabel}>Mã đơn:</Text>
                  <Text style={styles.orderValue}>#{orderNumber}</Text>
                </View>
              )}
            </View>

            {/* Warning Note */}
            <View style={styles.warningNote}>
              <CreditCard size={20} color={COLORS.gold} />
              <View style={styles.warningTextContainer}>
                <Text style={styles.warningTitle}>Chờ xác nhận thanh toán</Text>
                <Text style={styles.warningText}>
                  Gems sẽ được cộng vào tài khoản sau khi chúng tôi nhận được thanh toán của bạn.
                  Nếu thanh toán qua chuyển khoản, vui lòng đợi 1-5 phút.
                </Text>
              </View>
            </View>

            {/* Check Status Button */}
            <TouchableOpacity
              style={styles.checkButton}
              onPress={handleCheckPaymentStatus}
              disabled={checking}
              activeOpacity={0.7}
            >
              {checking ? (
                <RefreshCw size={18} color={COLORS.gold} style={styles.spinningIcon} />
              ) : (
                <CheckCircle size={18} color={COLORS.gold} />
              )}
              <Text style={styles.checkButtonText}>
                {checking ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái thanh toán'}
              </Text>
            </TouchableOpacity>
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
              colors={['#6A5BFF', '#8B7BFF']}
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
        {AlertComponent}
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
    borderColor: COLORS.gold,
  },
  messageContainer: {
    alignItems: 'center',
    width: '100%',
  },
  pendingTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  pendingSubtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  orderCard: {
    backgroundColor: GLASS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    width: '100%',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  orderLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  orderValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  gemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  gemValue: {
    fontSize: 16,
    color: COLORS.gold,
    fontWeight: '700',
  },
  warningNote: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    marginBottom: SPACING.lg,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
    marginBottom: SPACING.xs,
  },
  warningText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  checkButtonText: {
    fontSize: 14,
    color: COLORS.gold,
    fontWeight: '500',
  },
  spinningIcon: {
    // Animation handled by Animated API if needed
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

export default GemPurchasePendingScreen;
