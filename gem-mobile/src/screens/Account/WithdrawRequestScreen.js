/**
 * Withdraw Request Screen
 * Form yêu cầu rút tiền hoa hồng
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Wallet,
  Building,
  CreditCard,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Send,
  History,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';
import { partnershipService } from '../../services/partnershipService';

const MINIMUM_WITHDRAWAL = 100000; // 100K VND

export default function WithdrawRequestScreen({ navigation }) {
  const { alert, AlertComponent } = useCustomAlert();
  const { user } = useAuth();

  // State
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    setLoadingBalance(true);
    try {
      // Get partnership status for balance
      const statusResult = await partnershipService.getPartnershipStatus(user.id);
      if (statusResult.success && statusResult.data) {
        setBalance(statusResult.data.available_balance || 0);
      }

      // Get withdrawal history
      const historyResult = await partnershipService.getWithdrawalHistory(user.id);
      if (historyResult.success) {
        setWithdrawalHistory(historyResult.history || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const formatCurrency = (value) => {
    return (value || 0).toLocaleString('vi-VN') + '₫';
  };

  const parseAmount = (text) => {
    // Remove non-numeric characters except for the amount
    const numeric = text.replace(/[^0-9]/g, '');
    return numeric;
  };

  const validateForm = () => {
    const newErrors = {};
    const numericAmount = parseInt(amount) || 0;

    if (!amount || numericAmount <= 0) {
      newErrors.amount = 'Vui lòng nhập số tiền';
    } else if (numericAmount < MINIMUM_WITHDRAWAL) {
      newErrors.amount = `Số tiền tối thiểu là ${formatCurrency(MINIMUM_WITHDRAWAL)}`;
    } else if (numericAmount > balance) {
      newErrors.amount = 'Số tiền vượt quá số dư khả dụng';
    }

    if (!bankName.trim()) {
      newErrors.bankName = 'Vui lòng nhập tên ngân hàng';
    }

    if (!accountNumber.trim()) {
      newErrors.accountNumber = 'Vui lòng nhập số tài khoản';
    } else if (!/^\d{8,20}$/.test(accountNumber.replace(/\s/g, ''))) {
      newErrors.accountNumber = 'Số tài khoản không hợp lệ';
    }

    if (!accountHolder.trim()) {
      newErrors.accountHolder = 'Vui lòng nhập tên chủ tài khoản';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const numericAmount = parseInt(amount) || 0;

    alert({
      type: 'warning',
      title: 'Xác nhận rút tiền',
      message: `Bạn muốn rút ${formatCurrency(numericAmount)} về tài khoản ${bankName} - ${accountNumber}?`,
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await partnershipService.requestWithdrawal({
                partnerId: user.id,
                amount: numericAmount,
                bankName: bankName.trim(),
                accountNumber: accountNumber.trim(),
                accountHolder: accountHolder.trim().toUpperCase(),
              });

              if (result.success) {
                alert({
                  type: 'success',
                  title: 'Thành công',
                  message: result.message || 'Yêu cầu rút tiền đã được gửi!',
                  buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
                });
              } else {
                alert({
                  type: 'error',
                  title: 'Lỗi',
                  message: result.error || 'Có lỗi xảy ra',
                  buttons: [{ text: 'OK' }],
                });
              }
            } catch (error) {
              alert({
                type: 'error',
                title: 'Lỗi',
                message: 'Có lỗi xảy ra khi gửi yêu cầu',
                buttons: [{ text: 'OK' }],
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    });
  };

  const setMaxAmount = () => {
    setAmount(balance.toString());
    setErrors((prev) => ({ ...prev, amount: null }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return COLORS.success;
      case 'approved':
      case 'processing':
        return COLORS.cyan;
      case 'pending':
        return COLORS.gold;
      case 'rejected':
        return COLORS.error;
      default:
        return COLORS.textMuted;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn tất';
      case 'approved':
        return 'Đã duyệt';
      case 'processing':
        return 'Đang xử lý';
      case 'pending':
        return 'Chờ duyệt';
      case 'rejected':
        return 'Từ chối';
      default:
        return status;
    }
  };

  // Check if has pending withdrawal
  const hasPendingWithdrawal = withdrawalHistory.some(
    (w) => ['pending', 'approved', 'processing'].includes(w.status)
  );

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rút Tiền</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Balance Card */}
            <View style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <Wallet size={24} color={COLORS.success} />
                <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
              </View>
              {loadingBalance ? (
                <ActivityIndicator size="small" color={COLORS.gold} />
              ) : (
                <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
              )}
            </View>

            {/* Warning if has pending */}
            {hasPendingWithdrawal && (
              <View style={styles.warningBox}>
                <AlertCircle size={20} color={COLORS.gold} />
                <Text style={styles.warningText}>
                  Bạn đang có yêu cầu rút tiền chưa hoàn tất. Vui lòng chờ xử lý.
                </Text>
              </View>
            )}

            {/* Minimum balance warning */}
            {balance < MINIMUM_WITHDRAWAL && !hasPendingWithdrawal && (
              <View style={styles.warningBox}>
                <AlertCircle size={20} color={COLORS.gold} />
                <Text style={styles.warningText}>
                  Số dư tối thiểu để rút là {formatCurrency(MINIMUM_WITHDRAWAL)}
                </Text>
              </View>
            )}

            {/* Withdrawal Form */}
            {!hasPendingWithdrawal && balance >= MINIMUM_WITHDRAWAL && (
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Thông Tin Rút Tiền</Text>

                {/* Amount */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Số tiền <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={[styles.inputContainer, errors.amount && styles.inputError]}>
                    <DollarSign size={20} color={COLORS.textMuted} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập số tiền muốn rút"
                      placeholderTextColor={COLORS.textMuted}
                      value={amount ? parseInt(amount).toLocaleString('vi-VN') : ''}
                      onChangeText={(text) => {
                        setAmount(parseAmount(text));
                        setErrors((prev) => ({ ...prev, amount: null }));
                      }}
                      keyboardType="numeric"
                    />
                    <TouchableOpacity style={styles.maxButton} onPress={setMaxAmount}>
                      <Text style={styles.maxButtonText}>MAX</Text>
                    </TouchableOpacity>
                  </View>
                  {errors.amount && (
                    <Text style={styles.errorText}>{errors.amount}</Text>
                  )}
                  <Text style={styles.helperText}>
                    Tối thiểu: {formatCurrency(MINIMUM_WITHDRAWAL)}
                  </Text>
                </View>

                {/* Bank Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Ngân hàng <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={[styles.inputContainer, errors.bankName && styles.inputError]}>
                    <Building size={20} color={COLORS.textMuted} />
                    <TextInput
                      style={styles.input}
                      placeholder="VD: Vietcombank, Techcombank..."
                      placeholderTextColor={COLORS.textMuted}
                      value={bankName}
                      onChangeText={(text) => {
                        setBankName(text);
                        setErrors((prev) => ({ ...prev, bankName: null }));
                      }}
                    />
                  </View>
                  {errors.bankName && (
                    <Text style={styles.errorText}>{errors.bankName}</Text>
                  )}
                </View>

                {/* Account Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Số tài khoản <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={[styles.inputContainer, errors.accountNumber && styles.inputError]}>
                    <CreditCard size={20} color={COLORS.textMuted} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập số tài khoản"
                      placeholderTextColor={COLORS.textMuted}
                      value={accountNumber}
                      onChangeText={(text) => {
                        setAccountNumber(text);
                        setErrors((prev) => ({ ...prev, accountNumber: null }));
                      }}
                      keyboardType="numeric"
                    />
                  </View>
                  {errors.accountNumber && (
                    <Text style={styles.errorText}>{errors.accountNumber}</Text>
                  )}
                </View>

                {/* Account Holder */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Chủ tài khoản <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={[styles.inputContainer, errors.accountHolder && styles.inputError]}>
                    <User size={20} color={COLORS.textMuted} />
                    <TextInput
                      style={styles.input}
                      placeholder="NGUYEN VAN A"
                      placeholderTextColor={COLORS.textMuted}
                      value={accountHolder}
                      onChangeText={(text) => {
                        setAccountHolder(text.toUpperCase());
                        setErrors((prev) => ({ ...prev, accountHolder: null }));
                      }}
                      autoCapitalize="characters"
                    />
                  </View>
                  {errors.accountHolder && (
                    <Text style={styles.errorText}>{errors.accountHolder}</Text>
                  )}
                  <Text style={styles.helperText}>
                    Nhập đúng tên in trên thẻ ngân hàng (không dấu)
                  </Text>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={COLORS.textPrimary} />
                  ) : (
                    <>
                      <Send size={20} color={COLORS.textPrimary} />
                      <Text style={styles.submitButtonText}>Gửi Yêu Cầu Rút Tiền</Text>
                    </>
                  )}
                </TouchableOpacity>

                <Text style={styles.noteText}>
                  Yêu cầu sẽ được xử lý trong 1-3 ngày làm việc. Bạn sẽ nhận thông báo khi hoàn tất.
                </Text>
              </View>
            )}

            {/* Withdrawal History */}
            {withdrawalHistory.length > 0 && (
              <View style={styles.historySection}>
                <View style={styles.historyHeader}>
                  <History size={20} color={COLORS.gold} />
                  <Text style={styles.sectionTitle}>Lịch Sử Rút Tiền</Text>
                </View>

                {withdrawalHistory.slice(0, 5).map((withdrawal) => (
                  <View key={withdrawal.id} style={styles.historyItem}>
                    <View style={styles.historyLeft}>
                      <Text style={styles.historyAmount}>
                        {formatCurrency(withdrawal.amount)}
                      </Text>
                      <Text style={styles.historyDate}>
                        {new Date(withdrawal.created_at).toLocaleDateString('vi-VN')}
                      </Text>
                      <Text style={styles.historyBank}>
                        {withdrawal.bank_name} - {withdrawal.account_number}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(withdrawal.status)}20` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(withdrawal.status) },
                        ]}
                      >
                        {getStatusText(withdrawal.status)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Extra padding for tab bar */}
            <View style={{ height: 120 }} />
          </ScrollView>
        </KeyboardAvoidingView>
        {AlertComponent}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // Balance Card
  balanceCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(58, 247, 166, 0.3)',
    alignItems: 'center',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  balanceLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.success,
  },

  // Warning Box
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  warningText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gold,
  },

  // Form Section
  formSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  // Input
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
    marginLeft: SPACING.sm,
  },
  maxButton: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  maxButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 4,
    marginLeft: 4,
  },

  // Submit
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
  },
  noteText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },

  // History Section
  historySection: {
    marginTop: SPACING.lg,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyLeft: {
    flex: 1,
  },
  historyAmount: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  historyDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  historyBank: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
