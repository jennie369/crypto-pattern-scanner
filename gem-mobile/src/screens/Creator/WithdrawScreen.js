/**
 * Gemral - Withdraw Screen
 * Feature #16: Creator Earnings
 * Request withdrawal of earnings
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  DeviceEventEmitter,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Gem,
  ArrowDownToLine,
  Building2,
  CreditCard,
  User,
  AlertTriangle,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS, INPUT } from '../../utils/tokens';
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';
import { CONTENT_BOTTOM_PADDING, ACTION_BUTTON_BOTTOM_PADDING } from '../../constants/layout';
import earningsService from '../../services/earningsService';
import walletService from '../../services/walletService';
import { WITHDRAW_CONFIG, calculateWithdrawAmounts, checkWithdrawEligibility } from '../../config/withdraw';
import { submitWithdrawRequest, checkPendingWithdraw } from '../../services/withdrawService';
import { useAuth } from '../../contexts/AuthContext';

// Use config values
const MIN_WITHDRAWAL = WITHDRAW_CONFIG.MIN_AMOUNT;
const MIN_BALANCE = WITHDRAW_CONFIG.MIN_BALANCE;
const QUICK_AMOUNTS = WITHDRAW_CONFIG.QUICK_AMOUNTS;

const WithdrawScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  // Rule 31: Recovery listener for app resume
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[WithdrawScreen] Force refresh received');
      setLoading(false);
      setSubmitting(false);
      setTimeout(() => loadData(), 50); // Rule 57: Break React 18 batch
    });
    return () => listener.remove();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load balance
      const result = await earningsService.getEarningsSummary();
      if (result.success) {
        setAvailableBalance(result.data.available);
      }

      // Check for pending request
      if (user?.id) {
        const { hasPending, request } = await checkPendingWithdraw(user.id);
        setHasPendingRequest(hasPending);
        setPendingRequest(request);
      }
    } catch (err) {
      console.error('[WithdrawScreen] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Alias for backward compatibility
  const loadBalance = loadData;

  const handleQuickAmount = (value) => {
    if (value <= availableBalance) {
      setAmount(value.toString());
    }
  };

  const handleMaxAmount = () => {
    // Max amount is balance minus MIN_BALANCE requirement
    const maxAmount = Math.max(0, availableBalance - MIN_BALANCE);
    setAmount(maxAmount.toString());
  };

  const validateForm = () => {
    const amountNum = parseInt(amount) || 0;
    const remainingBalance = availableBalance - amountNum;

    if (amountNum < MIN_WITHDRAWAL) {
      alert({ type: 'error', title: 'Lỗi', message: `Rút tối thiểu ${MIN_WITHDRAWAL.toLocaleString()} gems` });
      return false;
    }

    if (amountNum > availableBalance) {
      alert({ type: 'error', title: 'Lỗi', message: 'Số tiền vượt quá số dư khả dụng' });
      return false;
    }

    // Check minimum balance requirement
    if (remainingBalance < MIN_BALANCE) {
      const maxWithdrawable = Math.max(0, availableBalance - MIN_BALANCE);
      alert({
        type: 'warning',
        title: 'Không đủ điều kiện',
        message: `Bạn phải giữ tối thiểu ${MIN_BALANCE.toLocaleString()} gems trong tài khoản.\n\n` +
          `Số dư hiện tại: ${availableBalance.toLocaleString()} gems\n` +
          `Số tiền rút tối đa: ${maxWithdrawable.toLocaleString()} gems`
      });
      return false;
    }

    if (!bankName.trim()) {
      alert({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập tên ngân hàng' });
      return false;
    }

    if (!accountNumber.trim()) {
      alert({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập số tài khoản' });
      return false;
    }

    if (!accountHolder.trim()) {
      alert({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập tên chủ tài khoản' });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || submitting || hasPendingRequest) return;

    const amountNum = parseInt(amount);
    const amounts = calculateWithdrawAmounts(amountNum);

    alert({
      type: 'warning',
      title: 'Xác nhận rút tiền',
      message: `Bạn muốn rút ${walletService.formatGems(amountNum)} gems?\n\n` +
        `Tổng giá trị: ${amounts.vndTotal.toLocaleString()}đ\n` +
        `Phí nền tảng (${WITHDRAW_CONFIG.PLATFORM_FEE_PERCENT}%): ${amounts.platformFee.toLocaleString()}đ\n` +
        `Bạn nhận được: ${amounts.authorReceive.toLocaleString()}đ`,
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            setSubmitting(true);

            // Use the new withdrawService
            const result = await submitWithdrawRequest({
              userId: user?.id,
              amount: amountNum,
              bankInfo: {
                bankName: bankName.trim(),
                accountNumber: accountNumber.trim(),
                accountName: accountHolder.trim().toUpperCase(),
              },
            });

            setSubmitting(false);

            if (result.success) {
              alert({
                type: 'success',
                title: 'Yêu cầu đã được gửi',
                message: `Chúng tôi sẽ xử lý trong vòng ${WITHDRAW_CONFIG.PROCESSING_DAYS} ngày làm việc.`,
                buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
              });
            } else {
              alert({ type: 'error', title: 'Lỗi', message: result.error || 'Không thể gửi yêu cầu' });
            }
          },
        },
      ],
    });
  };

  const amountNum = parseInt(amount) || 0;
  const vndAmount = amountNum * WITHDRAW_CONFIG.GEM_TO_VND_RATE;
  const remainingAfterWithdraw = availableBalance - amountNum;
  const maxWithdrawable = Math.max(0, availableBalance - MIN_BALANCE);
  const isValid = amountNum >= MIN_WITHDRAWAL && amountNum <= maxWithdrawable && remainingAfterWithdraw >= MIN_BALANCE && !hasPendingRequest;
  const canWithdraw = availableBalance >= MIN_BALANCE && !hasPendingRequest;

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rút tiền</Text>
          <View style={styles.headerRight} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Balance Info */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
              <View style={styles.balanceRow}>
                <Gem size={24} color={COLORS.success} />
                <Text style={styles.balanceAmount}>
                  {walletService.formatGems(availableBalance)}
                </Text>
              </View>
              <Text style={styles.balanceVND}>
                ~ {earningsService.formatVND(earningsService.gemsToVND(availableBalance))}
              </Text>
            </View>

            {/* Amount Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Số lượng rút</Text>

              <View style={styles.amountInputContainer}>
                <Gem size={20} color={COLORS.purple} />
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  maxLength={10}
                />
                <TouchableOpacity
                  style={styles.maxButton}
                  onPress={handleMaxAmount}
                >
                  <Text style={styles.maxButtonText}>MAX</Text>
                </TouchableOpacity>
              </View>

              {amountNum > 0 && (
                <Text style={styles.vndPreview}>
                  ~ {earningsService.formatVND(vndAmount)}
                </Text>
              )}

              {/* Quick Amounts */}
              <View style={styles.quickAmounts}>
                {QUICK_AMOUNTS.map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.quickAmountBtn,
                      value > availableBalance && styles.quickAmountBtnDisabled,
                    ]}
                    onPress={() => handleQuickAmount(value)}
                    disabled={value > availableBalance}
                  >
                    <Text
                      style={[
                        styles.quickAmountText,
                        value > availableBalance && styles.quickAmountTextDisabled,
                      ]}
                    >
                      {walletService.formatGems(value)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Bank Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin ngân hàng</Text>

              <View style={styles.inputGroup}>
                <View style={styles.inputIcon}>
                  <Building2 size={18} color={COLORS.textMuted} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Tên ngân hàng (VD: Vietcombank)"
                  placeholderTextColor={COLORS.textMuted}
                  value={bankName}
                  onChangeText={setBankName}
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputIcon}>
                  <CreditCard size={18} color={COLORS.textMuted} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Số tài khoản"
                  placeholderTextColor={COLORS.textMuted}
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputIcon}>
                  <User size={18} color={COLORS.textMuted} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Tên chủ tài khoản (in hoa)"
                  placeholderTextColor={COLORS.textMuted}
                  value={accountHolder}
                  onChangeText={(text) => setAccountHolder(text.toUpperCase())}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Pending Request Warning */}
            {hasPendingRequest && pendingRequest && (
              <View style={styles.minBalanceWarning}>
                <AlertTriangle size={20} color={COLORS.warning} />
                <Text style={styles.minBalanceWarningText}>
                  Bạn đang có yêu cầu rút {pendingRequest.gems_amount?.toLocaleString()} gems chờ xử lý.{'\n'}
                  Vui lòng đợi yêu cầu hiện tại được xử lý xong.
                </Text>
              </View>
            )}

            {/* Minimum Balance Warning */}
            {!hasPendingRequest && availableBalance < MIN_BALANCE && (
              <View style={styles.minBalanceWarning}>
                <AlertTriangle size={20} color={COLORS.error} />
                <Text style={styles.minBalanceWarningText}>
                  Bạn cần có tối thiểu {MIN_BALANCE.toLocaleString()} gems để rút tiền.{'\n'}
                  Số dư hiện tại: {availableBalance.toLocaleString()} gems
                </Text>
              </View>
            )}

            {/* Warning */}
            <View style={styles.warningCard}>
              <AlertTriangle size={18} color={COLORS.warning} />
              <Text style={styles.warningText}>
                Vui lòng kiểm tra kỹ thông tin ngân hàng. Chúng tôi không chịu trách nhiệm
                nếu thông tin sai.
              </Text>
            </View>

            {/* Info */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Lưu ý</Text>
              <Text style={styles.infoText}>
                - Rút tối thiểu: {MIN_WITHDRAWAL.toLocaleString()} gems{'\n'}
                - Số dư tối thiểu cần giữ: {MIN_BALANCE.toLocaleString()} gems{'\n'}
                - Rút tối đa: {maxWithdrawable.toLocaleString()} gems{'\n'}
                - Thời gian xử lý: 1-3 ngày làm việc{'\n'}
                - Tỉ giá: 1 gem = 200 VND
              </Text>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitButton, (!isValid || submitting) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!isValid || submitting}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isValid ? ['#3AF7A6', '#00F0FF'] : ['#666', '#444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButtonGradient}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={COLORS.textPrimary} />
                ) : (
                  <>
                    <ArrowDownToLine size={20} color={isValid ? '#000' : COLORS.textMuted} />
                    <Text style={[styles.submitButtonText, !isValid && styles.submitButtonTextDisabled]}>
                      Rut {amountNum > 0 ? earningsService.formatVND(vndAmount) : ''}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {AlertComponent}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GLASS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: CONTENT_BOTTOM_PADDING + 80,
  },
  balanceCard: {
    backgroundColor: GLASS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(58, 247, 166, 0.3)',
  },
  balanceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  balanceAmount: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  balanceVND: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  section: {
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT.background,
    borderRadius: INPUT.borderRadius,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
    paddingHorizontal: SPACING.md,
  },
  amountInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.lg,
    marginLeft: SPACING.sm,
  },
  maxButton: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  maxButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.purple,
  },
  vndPreview: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.success,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  quickAmountBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickAmountBtnDisabled: {
    opacity: 0.4,
  },
  quickAmountText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  quickAmountTextDisabled: {
    color: COLORS.textMuted,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT.background,
    borderRadius: INPUT.borderRadius,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
    marginBottom: SPACING.md,
  },
  inputIcon: {
    paddingLeft: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  minBalanceWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 71, 87, 0.15)',
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.3)',
  },
  minBalanceWarningText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.error,
    lineHeight: 22,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  warningText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.warning,
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.lg,
    marginTop: SPACING.md,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    paddingBottom: 34,
    backgroundColor: GLASS.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  submitButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#000',
  },
  submitButtonTextDisabled: {
    color: COLORS.textMuted,
  },
});

export default WithdrawScreen;
