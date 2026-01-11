// ============================================================
// PAYMENT EXPIRED SCREEN
// Purpose: Hiển thị khi đơn hàng hết hạn thanh toán
// ============================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertCircle, ShoppingCart, MessageCircle } from 'lucide-react-native';

import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';

const PaymentExpiredScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderNumber } = route.params || {};

  const handleReorder = () => {
    navigation.navigate('ShopMain');
  };

  const handleContact = () => {
    // Open support chat or contact page
    // You can customize this to navigate to your support screen
    navigation.navigate('AccountStack', { screen: 'Support' });
  };

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <AlertCircle size={64} color={COLORS.error} />
          </View>

          {/* Text */}
          <Text style={styles.title}>Đơn hàng đã hết hạn</Text>
          <Text style={styles.subtitle}>
            Đơn hàng #{orderNumber} đã hết thời gian thanh toán (24 giờ)
          </Text>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Đừng lo lắng! Bạn có thể đặt lại đơn hàng mới hoặc liên hệ hỗ trợ nếu đã chuyển khoản.
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleReorder}
              activeOpacity={0.8}
            >
              <ShoppingCart size={20} color={COLORS.bgDarkest} />
              <Text style={styles.primaryButtonText}>Đặt hàng lại</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleContact}
              activeOpacity={0.8}
            >
              <MessageCircle size={18} color={COLORS.gold} />
              <Text style={styles.secondaryButtonText}>Liên hệ hỗ trợ</Text>
            </TouchableOpacity>
          </View>
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
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },

  // Text
  title: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.error,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },

  // Info Box
  infoBox: {
    backgroundColor: COLORS.glassBg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.xl,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gold,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    lineHeight: 22,
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

export default PaymentExpiredScreen;
