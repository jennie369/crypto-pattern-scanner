/**
 * CTVRegistrationForm
 * Simplified CTV registration form - open to everyone
 * Reference: GEM_PARTNERSHIP_IMPLEMENTATION_PHASE2.md
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  User,
  Mail,
  Phone,
  Link,
  CheckCircle,
  Info,
} from 'lucide-react-native';

import { COLORS, SPACING } from '../../theme/darkTheme';
import {
  CTV_TIER_CONFIG,
  formatPercent,
} from '../../constants/partnershipConstants';
import { validateCTVForm, formatPhoneNumber } from '../../utils/partnershipValidation';

const CTVRegistrationForm = ({ userProfile, onSubmit }) => {
  // Form State
  const [fullName, setFullName] = useState(userProfile?.full_name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [referralCode, setReferralCode] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Benefits info
  const bronzeTier = CTV_TIER_CONFIG.bronze;

  const handleSubmit = useCallback(async () => {
    // Format phone
    const formattedPhone = formatPhoneNumber(phone);

    // Validate
    const formData = {
      full_name: fullName,
      email,
      phone: formattedPhone,
    };

    const validation = validateCTVForm(formData);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const result = await onSubmit({
        ...formData,
        referral_code: referralCode.toUpperCase() || null,
        reason: reason || null,
      });

      if (!result.success) {
        setErrors({ submit: result.error });
      }
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  }, [fullName, email, phone, referralCode, reason, onSubmit]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Benefits Card */}
      <View style={styles.benefitsCard}>
        <View style={styles.benefitsHeader}>
          <Text style={styles.benefitsIcon}>{bronzeTier.icon}</Text>
          <Text style={styles.benefitsTitle}>Quyền lợi CTV {bronzeTier.name}</Text>
        </View>

        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <CheckCircle size={16} color={COLORS.success} />
            <Text style={styles.benefitText}>
              Hoa hồng Digital: {formatPercent(bronzeTier.commission.digital)}
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <CheckCircle size={16} color={COLORS.success} />
            <Text style={styles.benefitText}>
              Hoa hồng Physical: {formatPercent(bronzeTier.commission.physical)}
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <CheckCircle size={16} color={COLORS.success} />
            <Text style={styles.benefitText}>
              Sub-affiliate: {formatPercent(bronzeTier.subAffiliate)}
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <CheckCircle size={16} color={COLORS.success} />
            <Text style={styles.benefitText}>
              Thanh toán: Hàng tháng
            </Text>
          </View>
        </View>

        <View style={styles.autoApproveNote}>
          <Info size={16} color={COLORS.gold} />
          <Text style={styles.autoApproveText}>
            Đơn đăng ký sẽ được xem xét trong vòng 3 ngày
          </Text>
        </View>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Thông tin đăng ký</Text>

        {/* Full Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Họ và tên *</Text>
          <View style={[styles.inputWrapper, errors.full_name && styles.inputError]}>
            <User size={20} color={COLORS.textMuted} />
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nguyễn Văn A"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
          {errors.full_name && (
            <Text style={styles.errorText}>{errors.full_name}</Text>
          )}
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email *</Text>
          <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
            <Mail size={20} color={COLORS.textMuted} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}
        </View>

        {/* Phone */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Số điện thoại *</Text>
          <View style={[styles.inputWrapper, errors.phone && styles.inputError]}>
            <Phone size={20} color={COLORS.textMuted} />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="0901234567"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="phone-pad"
            />
          </View>
          {errors.phone && (
            <Text style={styles.errorText}>{errors.phone}</Text>
          )}
        </View>

        {/* Referral Code */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mã giới thiệu (nếu có)</Text>
          <View style={styles.inputWrapper}>
            <Link size={20} color={COLORS.textMuted} />
            <TextInput
              style={styles.input}
              value={referralCode}
              onChangeText={(text) => setReferralCode(text.toUpperCase())}
              placeholder="GEM12345"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* Reason */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Lý do tham gia (tùy chọn)</Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={reason}
              onChangeText={setReason}
              placeholder="Chia sẻ lý do bạn muốn trở thành CTV..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Submit Error */}
        {errors.submit && (
          <View style={styles.submitError}>
            <Text style={styles.submitErrorText}>{errors.submit}</Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.bgDark} />
          ) : (
            <Text style={styles.submitButtonText}>Gửi đăng ký</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Extra padding for tab bar */}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
  },
  benefitsCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },
  benefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  benefitsIcon: {
    fontSize: 24,
    marginRight: SPACING.xs,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  benefitsList: {
    gap: SPACING.xs,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  benefitText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  autoApproveNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold + '15',
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  autoApproveText: {
    fontSize: 13,
    color: COLORS.gold,
    flex: 1,
  },
  formContainer: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgDark,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingVertical: SPACING.xs,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    marginLeft: 0,
    paddingTop: SPACING.xs,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  submitError: {
    backgroundColor: COLORS.error + '20',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  submitErrorText: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.bgDark,
  },
});

export default CTVRegistrationForm;
