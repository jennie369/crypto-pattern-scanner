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
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
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
import earningsService from '../../services/earningsService';
import walletService from '../../services/walletService';

const MIN_WITHDRAWAL = 100; // Minimum 100 gems
const QUICK_AMOUNTS = [100, 500, 1000, 5000];

const WithdrawScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    setLoading(true);
    const result = await earningsService.getEarningsSummary();
    if (result.success) {
      setAvailableBalance(result.data.available);
    }
    setLoading(false);
  };

  const handleQuickAmount = (value) => {
    if (value <= availableBalance) {
      setAmount(value.toString());
    }
  };

  const handleMaxAmount = () => {
    setAmount(availableBalance.toString());
  };

  const validateForm = () => {
    const amountNum = parseInt(amount) || 0;

    if (amountNum < MIN_WITHDRAWAL) {
      Alert.alert('Lỗi', `Rút tối thiểu ${MIN_WITHDRAWAL} gems`);
      return false;
    }

    if (amountNum > availableBalance) {
      Alert.alert('Lỗi', 'Số tiền vượt quá số dư khả dụng');
      return false;
    }

    if (!bankName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên ngân hàng');
      return false;
    }

    if (!accountNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tài khoản');
      return false;
    }

    if (!accountHolder.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên chủ tài khoản');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || submitting) return;

    const amountNum = parseInt(amount);
    const vndAmount = earningsService.gemsToVND(amountNum);

    Alert.alert(
      'Xác nhận rút tiền',
      `Bạn muốn rút ${walletService.formatGems(amountNum)} gems (~ ${earningsService.formatVND(vndAmount)})?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            setSubmitting(true);

            const result = await earningsService.requestWithdrawal({
              amount: amountNum,
              bankName: bankName.trim(),
              accountNumber: accountNumber.trim(),
              accountHolder: accountHolder.trim().toUpperCase(),
            });

            setSubmitting(false);

            if (result.success) {
              Alert.alert(
                'Yêu cầu đã được gửi',
                'Chúng tôi sẽ xử lý trong vòng 1-3 ngày làm việc.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } else {
              Alert.alert('Lỗi', result.error);
            }
          },
        },
      ]
    );
  };

  const amountNum = parseInt(amount) || 0;
  const vndAmount = earningsService.gemsToVND(amountNum);
  const isValid = amountNum >= MIN_WITHDRAWAL && amountNum <= availableBalance;

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
                - Rút tối thiểu: {MIN_WITHDRAWAL} gems{'\n'}
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
    paddingBottom: 120,
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
