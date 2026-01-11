// ============================================================
// PAYMENT STATUS SCREEN
// Purpose: Hiển thị trạng thái thanh toán và QR code
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  Upload,
  RefreshCw,
  QrCode,
  CreditCard,
  Smartphone,
  ChevronRight,
  Info,
  Search,
  XCircle,
} from 'lucide-react-native';

import {
  getPaymentStatus,
  uploadPaymentProof,
  formatCurrency,
  formatTimeRemaining,
  getStatusDisplay,
  PAYMENT_STATUS,
  BANK_INFO,
  generateVietQRUrl,
} from '../../services/paymentService';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';

// ============================================================
// COMPONENT
// ============================================================

const PaymentStatusScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Route params
  const { orderNumber, totalAmount, customerEmail } = route.params || {};

  // ========== STATE ==========
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [error, setError] = useState(null);

  // Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ========== EFFECTS ==========

  // Fetch payment status on mount
  useEffect(() => {
    if (orderNumber) {
      fetchPaymentStatus();
    } else {
      setError('Không tìm thấy mã đơn hàng');
      setLoading(false);
    }
  }, [orderNumber]);

  // Polling for status updates
  useFocusEffect(
    useCallback(() => {
      const interval = setInterval(() => {
        if (paymentData?.payment_status === PAYMENT_STATUS.PENDING) {
          fetchPaymentStatus(true);
        }
      }, 10000); // Poll every 10 seconds

      return () => clearInterval(interval);
    }, [paymentData?.payment_status])
  );

  // Countdown timer
  useEffect(() => {
    if (!paymentData?.expires_at) return;

    const updateTimer = () => {
      const now = new Date();
      const expiresAt = new Date(paymentData.expires_at);
      const diff = Math.max(0, expiresAt.getTime() - now.getTime());
      setTimeRemaining(Math.floor(diff / 1000));

      if (diff <= 0 && paymentData.payment_status === PAYMENT_STATUS.PENDING) {
        // Expired
        setPaymentData(prev => ({
          ...prev,
          payment_status: PAYMENT_STATUS.EXPIRED,
        }));
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [paymentData?.expires_at]);

  // Pulse animation for pending status
  useEffect(() => {
    if (paymentData?.payment_status === PAYMENT_STATUS.PENDING) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
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
    } else {
      pulseAnim.setValue(1);
    }
  }, [paymentData?.payment_status]);

  // Navigate to success screen when paid
  useEffect(() => {
    if (paymentData?.payment_status === PAYMENT_STATUS.PAID) {
      setTimeout(() => {
        navigation.replace('PaymentSuccess', {
          orderNumber,
          totalAmount: paymentData.total_amount,
        });
      }, 2000);
    }
  }, [paymentData?.payment_status]);

  // ========== DATA FETCHING ==========

  const fetchPaymentStatus = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const result = await getPaymentStatus(orderNumber, customerEmail);

      if (!result.success) {
        throw new Error(result.error || 'Không thể tải thông tin thanh toán');
      }

      setPaymentData(result.data);
    } catch (err) {
      console.error('[PaymentStatusScreen] Fetch error:', err);
      if (!silent) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderNumber, customerEmail]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPaymentStatus();
  }, [fetchPaymentStatus]);

  // ========== HANDLERS ==========

  const copyToClipboard = useCallback(async (text, label) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Đã sao chép', `${label}: ${text}`);
  }, []);

  const handleUploadProof = useCallback(async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (result.canceled) return;

      setUploading(true);

      const uploadResult = await uploadPaymentProof(orderNumber, {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: `proof_${orderNumber}.jpg`,
      });

      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      Alert.alert(
        'Thành công',
        'Đã gửi ảnh xác nhận. Chúng tôi sẽ kiểm tra trong vài phút.',
        [{ text: 'OK', onPress: () => fetchPaymentStatus() }]
      );
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Không thể upload ảnh');
    } finally {
      setUploading(false);
    }
  }, [orderNumber, fetchPaymentStatus]);

  const openBankApp = useCallback(() => {
    const bankApps = [
      { name: 'VCB Digibank', scheme: 'vcbdigibank://' },
      { name: 'Momo', scheme: 'momo://' },
      { name: 'ZaloPay', scheme: 'zalopay://' },
    ];

    Alert.alert(
      'Mở ứng dụng ngân hàng',
      'Chọn ứng dụng để thanh toán',
      [
        ...bankApps.map(app => ({
          text: app.name,
          onPress: () => {
            Linking.openURL(app.scheme).catch(() => {
              Alert.alert('Lỗi', `Không tìm thấy ứng dụng ${app.name}`);
            });
          },
        })),
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  }, []);

  // ========== RENDER HELPERS ==========

  const renderStatusBadge = () => {
    const statusInfo = getStatusDisplay(paymentData?.payment_status);
    const IconComponent = {
      'clock': Clock,
      'check-circle': CheckCircle,
      'alert-circle': AlertCircle,
      'search': Search,
      'x-circle': XCircle,
    }[statusInfo.icon] || Clock;

    return (
      <Animated.View
        style={[
          styles.statusBadge,
          { backgroundColor: statusInfo.color + '20', transform: [{ scale: pulseAnim }] }
        ]}
      >
        <IconComponent size={32} color={statusInfo.color} />
        <Text style={[styles.statusText, { color: statusInfo.color }]}>
          {statusInfo.label}
        </Text>
      </Animated.View>
    );
  };

  const renderQRCode = () => {
    if (paymentData?.payment_status !== PAYMENT_STATUS.PENDING) {
      return null;
    }

    const qrUrl = paymentData?.qr_code_url ||
      generateVietQRUrl(paymentData?.total_amount, paymentData?.transfer_content);

    if (!qrUrl) return null;

    return (
      <View style={styles.qrSection}>
        <View style={styles.sectionHeader}>
          <QrCode size={20} color={COLORS.gold} />
          <Text style={styles.sectionTitle}>Quét mã QR để thanh toán</Text>
        </View>

        <View style={styles.qrContainer}>
          <Image
            source={{ uri: qrUrl }}
            style={styles.qrImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.tipButton}>
          <Info size={16} color={COLORS.textMuted} />
          <Text style={styles.tipText}>
            Mở app ngân hàng → Quét mã → Xác nhận
          </Text>
        </View>
      </View>
    );
  };

  const renderBankInfo = () => (
    <View style={styles.bankInfoSection}>
      <View style={styles.sectionHeader}>
        <CreditCard size={20} color={COLORS.gold} />
        <Text style={styles.sectionTitle}>Thông tin chuyển khoản</Text>
      </View>

      <View style={styles.bankInfoCard}>
        <InfoRow
          label="Ngân hàng"
          value={BANK_INFO.bankName}
          copyable={false}
        />
        <InfoRow
          label="Số tài khoản"
          value={BANK_INFO.accountNumber}
          onCopy={() => copyToClipboard(BANK_INFO.accountNumber, 'Số TK')}
        />
        <InfoRow
          label="Chủ tài khoản"
          value={BANK_INFO.accountName}
          copyable={false}
        />
        <InfoRow
          label="Số tiền"
          value={formatCurrency(paymentData?.total_amount || totalAmount)}
          highlight
          onCopy={() => copyToClipboard(
            (paymentData?.total_amount || totalAmount)?.toString(),
            'Số tiền'
          )}
        />
        <InfoRow
          label="Nội dung CK"
          value={paymentData?.transfer_content || `DH${orderNumber}`}
          highlight
          onCopy={() => copyToClipboard(
            paymentData?.transfer_content || `DH${orderNumber}`,
            'Nội dung'
          )}
          isLast
        />
      </View>

      <View style={styles.warningBox}>
        <AlertCircle size={16} color={COLORS.warning} />
        <Text style={styles.warningText}>
          Vui lòng nhập chính xác nội dung chuyển khoản để hệ thống tự động xác nhận
        </Text>
      </View>
    </View>
  );

  const renderCountdown = () => {
    if (
      paymentData?.payment_status !== PAYMENT_STATUS.PENDING ||
      timeRemaining === null
    ) {
      return null;
    }

    const isUrgent = timeRemaining < 3600; // Less than 1 hour

    return (
      <View style={[styles.countdownSection, isUrgent && styles.countdownUrgent]}>
        <Clock size={20} color={isUrgent ? COLORS.error : COLORS.gold} />
        <Text style={[styles.countdownLabel, isUrgent && styles.countdownLabelUrgent]}>
          Thời gian còn lại:
        </Text>
        <Text style={[styles.countdownValue, isUrgent && styles.countdownValueUrgent]}>
          {formatTimeRemaining(timeRemaining)}
        </Text>
      </View>
    );
  };

  const renderActions = () => {
    if (paymentData?.payment_status !== PAYMENT_STATUS.PENDING) {
      return null;
    }

    return (
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={openBankApp}
          activeOpacity={0.8}
        >
          <Smartphone size={20} color={COLORS.bgDarkest} />
          <Text style={styles.primaryButtonText}>Mở ứng dụng ngân hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleUploadProof}
          disabled={uploading}
          activeOpacity={0.8}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={COLORS.gold} />
          ) : (
            <>
              <Upload size={18} color={COLORS.gold} />
              <Text style={styles.secondaryButtonText}>
                Upload ảnh xác nhận (nếu cần)
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // ========== LOADING STATE ==========
  if (loading && !paymentData) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Đang tải thông tin thanh toán...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ========== ERROR STATE ==========
  if (error && !paymentData) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.centerContainer}>
            <AlertCircle size={48} color={COLORS.error} />
            <Text style={styles.errorTitle}>Đã có lỗi xảy ra</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchPaymentStatus()}>
              <RefreshCw size={18} color={COLORS.gold} />
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Order Number Header */}
          <View style={styles.orderHeader}>
            <Text style={styles.orderLabel}>Đơn hàng</Text>
            <Text style={styles.orderNumber}>#{orderNumber}</Text>
          </View>

          {/* Status Badge */}
          {renderStatusBadge()}

          {/* Countdown Timer */}
          {renderCountdown()}

          {/* QR Code */}
          {renderQRCode()}

          {/* Bank Info */}
          {renderBankInfo()}

          {/* Actions */}
          {renderActions()}

          {/* Refresh Button */}
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => fetchPaymentStatus()}
          >
            <RefreshCw size={16} color={COLORS.textMuted} />
            <Text style={styles.refreshButtonText}>Kiểm tra trạng thái</Text>
          </TouchableOpacity>

          {/* Help Link */}
          <TouchableOpacity style={styles.helpLink}>
            <Text style={styles.helpLinkText}>Cần hỗ trợ?</Text>
            <ChevronRight size={16} color={COLORS.gold} />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

// ============================================================
// SUB-COMPONENTS
// ============================================================

const InfoRow = ({ label, value, highlight, copyable = true, onCopy, isLast }) => (
  <View style={[styles.infoRow, isLast && styles.infoRowLast]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <View style={styles.infoValueContainer}>
      <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]} numberOfLines={1}>
        {value}
      </Text>
      {copyable && onCopy && (
        <TouchableOpacity onPress={onCopy} style={styles.copyButton}>
          <Copy size={16} color={COLORS.gold} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.huge,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },

  // Order Header
  orderHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  orderLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  orderNumber: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.lg,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // Countdown
  countdownSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.glassBg,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  countdownUrgent: {
    backgroundColor: COLORS.error + '20',
  },
  countdownLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
  countdownLabelUrgent: {
    color: COLORS.error,
  },
  countdownValue: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    fontFamily: 'monospace',
  },
  countdownValueUrgent: {
    color: COLORS.error,
  },

  // QR Section
  qrSection: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: SPACING.lg,
  },
  qrImage: {
    width: 220,
    height: 220,
  },
  tipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
  },
  tipText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },

  // Bank Info
  bankInfoSection: {
    marginBottom: SPACING.lg,
  },
  bankInfoCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    flex: 1,
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 2,
    justifyContent: 'flex-end',
  },
  infoValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    textAlign: 'right',
    flexShrink: 1,
  },
  infoValueHighlight: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  copyButton: {
    padding: SPACING.xs,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.warning + '15',
    padding: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.md,
  },
  warningText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.warning,
    flex: 1,
    lineHeight: 18,
  },

  // Actions
  actionsSection: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
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

  // Refresh
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
  },
  refreshButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },

  // Help
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
  },
  helpLinkText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.gold,
  },

  // Loading & Error
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.error,
    marginTop: SPACING.md,
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
});

export default PaymentStatusScreen;
