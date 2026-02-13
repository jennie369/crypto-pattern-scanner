// ============================================================
// PAYMENT SUCCESS SCREEN
// Purpose: Hiển thị khi thanh toán thành công
// ============================================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, Home, Package, ChevronRight } from 'lucide-react-native';

import { formatCurrency } from '../../services/paymentService';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';

const PaymentSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderNumber, totalAmount } = route.params || {};

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  const handleViewOrders = () => {
    navigation.navigate('Orders');
  };

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Success Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <View style={styles.iconCircle}>
              <CheckCircle size={64} color={COLORS.success} />
            </View>
          </Animated.View>

          {/* Success Text */}
          <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
            <Text style={styles.title}>Thanh toán thành công!</Text>
            <Text style={styles.subtitle}>
              Cảm ơn bạn đã mua hàng
            </Text>
          </Animated.View>

          {/* Order Details */}
          <Animated.View style={[styles.orderCard, { opacity: fadeAnim }]}>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Mã đơn hàng</Text>
              <Text style={styles.orderValue}>#{orderNumber}</Text>
            </View>
            {totalAmount && (
              <View style={[styles.orderRow, styles.orderRowLast]}>
                <Text style={styles.orderLabel}>Số tiền</Text>
                <Text style={styles.orderAmount}>{formatCurrency(totalAmount)}</Text>
              </View>
            )}
          </Animated.View>

          {/* Access Info */}
          <Animated.View style={[styles.accessInfo, { opacity: fadeAnim }]}>
            <Text style={styles.accessText}>
              Quyền truy cập của bạn đã được kích hoạt tự động
            </Text>
          </Animated.View>

          {/* Actions */}
          <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleGoHome}
              activeOpacity={0.8}
            >
              <Home size={20} color={COLORS.bgDarkest} />
              <Text style={styles.primaryButtonText}>Về trang chủ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleViewOrders}
              activeOpacity={0.8}
            >
              <Package size={18} color={COLORS.gold} />
              <Text style={styles.secondaryButtonText}>Xem đơn hàng</Text>
              <ChevronRight size={18} color={COLORS.gold} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },

  // Icon
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Text
  textContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },

  // Order Card
  orderCard: {
    width: '100%',
    backgroundColor: COLORS.glassBg,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  orderRowLast: {
    borderBottomWidth: 0,
  },
  orderLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
  orderValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  orderAmount: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },

  // Access Info
  accessInfo: {
    backgroundColor: COLORS.success + '15',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.xl,
  },
  accessText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.success,
    textAlign: 'center',
  },

  // Actions
  actions: {
    width: '100%',
    gap: SPACING.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDarkest,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  secondaryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
});

export default PaymentSuccessScreen;
