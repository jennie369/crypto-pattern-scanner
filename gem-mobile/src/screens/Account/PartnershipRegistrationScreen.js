/**
 * Partnership Registration Screen
 * Form đăng ký Affiliate hoặc CTV
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  FileText,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Send,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';
import { partnershipService } from '../../services/partnershipService';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';

export default function PartnershipRegistrationScreen({ route, navigation }) {
  const { type = 'affiliate', fromGemMaster = false } = route.params || {};
  const { user, profile } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();

  const isCtv = type === 'ctv';

  // Handle back navigation - if came from GemMaster, go back to GemMaster tab
  const handleGoBack = () => {
    if (fromGemMaster) {
      navigation.navigate('GemMaster');
    } else {
      navigation.goBack();
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    reason: '',
    marketingChannels: '',
    estimatedSales: '',
  });

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(isCtv);
  const [errors, setErrors] = useState({});

  // Load user courses for CTV
  useEffect(() => {
    if (isCtv && user?.id) {
      loadUserCourses();
    }
  }, [isCtv, user?.id]);

  const loadUserCourses = async () => {
    setLoadingCourses(true);
    try {
      const result = await partnershipService.getUserCourses(user.id);
      if (result.success) {
        setCourses(result.courses);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (isCtv) {
      if (!formData.reason.trim()) {
        newErrors.reason = 'Vui lòng cho biết lý do tham gia';
      }
      if (!formData.marketingChannels.trim()) {
        newErrors.marketingChannels = 'Vui lòng mô tả kênh marketing';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        buttons: [{ text: 'OK' }],
      });
      return;
    }

    setLoading(true);
    try {
      const result = await partnershipService.submitApplication({
        userId: user.id,
        applicationType: type,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        reason: formData.reason.trim(),
        marketingChannels: formData.marketingChannels.trim(),
        estimatedSales: formData.estimatedSales.trim(),
      });

      if (result.success) {
        alert({
          type: 'success',
          title: 'Thành công',
          message: result.message || 'Đơn đăng ký đã được gửi thành công! Chúng tôi sẽ xem xét trong 1-2 ngày làm việc.',
          buttons: [
            {
              text: 'OK',
              onPress: handleGoBack,
            },
          ],
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
        message: 'Có lỗi xảy ra khi gửi đơn đăng ký',
        buttons: [{ text: 'OK' }],
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

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
            onPress={handleGoBack}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Đăng Ký {isCtv ? 'CTV 4 Cấp' : 'Affiliate'}
          </Text>
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
            {/* Program Info */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>
                {isCtv ? 'Chương Trình CTV 4 Cấp' : 'Chương Trình Affiliate'}
              </Text>
              <Text style={styles.infoDesc}>
                {isCtv
                  ? 'Hưởng hoa hồng 10-30% cho sản phẩm Digital và 3-15% cho Physical. Thăng cấp dựa trên doanh số.'
                  : 'Hưởng hoa hồng 3% cho mọi đơn hàng từ người bạn giới thiệu.'}
              </Text>

              {isCtv && (
                <View style={styles.tierInfo}>
                  <View style={styles.tierRow}>
                    <Text style={styles.tierName}>Beginner</Text>
                    <Text style={styles.tierRate}>Digital 10% | Physical 3%</Text>
                  </View>
                  <View style={styles.tierRow}>
                    <Text style={styles.tierName}>Growing (≥100M)</Text>
                    <Text style={styles.tierRate}>Digital 15% | Physical 10%</Text>
                  </View>
                  <View style={styles.tierRow}>
                    <Text style={styles.tierName}>Master (≥300M)</Text>
                    <Text style={styles.tierRate}>Digital 20% | Physical 12%</Text>
                  </View>
                  <View style={styles.tierRow}>
                    <Text style={styles.tierName}>Grand (≥600M)</Text>
                    <Text style={styles.tierRate}>Digital 30% | Physical 15%</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Owned Courses (CTV only) */}
            {isCtv && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Khóa Học Đã Mua</Text>
                {loadingCourses ? (
                  <ActivityIndicator size="small" color={COLORS.gold} />
                ) : courses.length > 0 ? (
                  <View style={styles.coursesContainer}>
                    {courses.map((course, index) => (
                      <View key={index} style={styles.courseItem}>
                        <CheckCircle size={16} color={COLORS.success} />
                        <Text style={styles.courseText}>{course.course_name}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.noCoursesBox}>
                    <AlertCircle size={20} color={COLORS.gold} />
                    <Text style={styles.noCoursesText}>
                      Bạn cần mua ít nhất 1 khóa học để đăng ký CTV
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Form Fields */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông Tin Đăng Ký</Text>

              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Họ và tên <Text style={styles.required}>*</Text>
                </Text>
                <View style={[styles.inputContainer, errors.fullName && styles.inputError]}>
                  <User size={20} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập họ và tên"
                    placeholderTextColor={COLORS.textMuted}
                    value={formData.fullName}
                    onChangeText={(text) => updateField('fullName', text)}
                  />
                </View>
                {errors.fullName && (
                  <Text style={styles.errorText}>{errors.fullName}</Text>
                )}
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Email <Text style={styles.required}>*</Text>
                </Text>
                <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                  <Mail size={20} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="email@example.com"
                    placeholderTextColor={COLORS.textMuted}
                    value={formData.email}
                    onChangeText={(text) => updateField('email', text)}
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
                <Text style={styles.inputLabel}>Số điện thoại</Text>
                <View style={styles.inputContainer}>
                  <Phone size={20} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="0912 345 678"
                    placeholderTextColor={COLORS.textMuted}
                    value={formData.phone}
                    onChangeText={(text) => updateField('phone', text)}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* CTV-specific fields */}
              {isCtv && (
                <>
                  {/* Reason */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      Lý do tham gia <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={[styles.inputContainer, styles.textareaContainer, errors.reason && styles.inputError]}>
                      <FileText size={20} color={COLORS.textMuted} style={styles.textareaIcon} />
                      <TextInput
                        style={[styles.input, styles.textarea]}
                        placeholder="Cho chúng tôi biết lý do bạn muốn trở thành CTV..."
                        placeholderTextColor={COLORS.textMuted}
                        value={formData.reason}
                        onChangeText={(text) => updateField('reason', text)}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>
                    {errors.reason && (
                      <Text style={styles.errorText}>{errors.reason}</Text>
                    )}
                  </View>

                  {/* Marketing Channels */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      Kênh marketing <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={[styles.inputContainer, styles.textareaContainer, errors.marketingChannels && styles.inputError]}>
                      <Target size={20} color={COLORS.textMuted} style={styles.textareaIcon} />
                      <TextInput
                        style={[styles.input, styles.textarea]}
                        placeholder="Facebook, Instagram, YouTube, TikTok, Website..."
                        placeholderTextColor={COLORS.textMuted}
                        value={formData.marketingChannels}
                        onChangeText={(text) => updateField('marketingChannels', text)}
                        multiline
                        numberOfLines={2}
                        textAlignVertical="top"
                      />
                    </View>
                    {errors.marketingChannels && (
                      <Text style={styles.errorText}>{errors.marketingChannels}</Text>
                    )}
                  </View>

                  {/* Estimated Sales */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Dự kiến doanh số/tháng</Text>
                    <View style={styles.inputContainer}>
                      <TrendingUp size={20} color={COLORS.textMuted} />
                      <TextInput
                        style={styles.input}
                        placeholder="Ví dụ: 50-100 triệu"
                        placeholderTextColor={COLORS.textMuted}
                        value={formData.estimatedSales}
                        onChangeText={(text) => updateField('estimatedSales', text)}
                      />
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* Terms */}
            <View style={styles.termsBox}>
              <Text style={styles.termsText}>
                Bằng việc đăng ký, bạn đồng ý với{' '}
                <Text style={styles.termsLink}>Điều khoản Partnership</Text> và{' '}
                <Text style={styles.termsLink}>Chính sách hoa hồng</Text> của Gemral.
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
                  <Text style={styles.submitButtonText}>Gửi Đơn Đăng Ký</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Note */}
            <Text style={styles.noteText}>
              Đơn đăng ký sẽ được xem xét trong 1-2 ngày làm việc. Bạn sẽ nhận thông báo qua email và app.
            </Text>

            <View style={{ height: 120 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Custom Alert Modal */}
      {AlertComponent}
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

  // Info Card
  infoCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    marginBottom: SPACING.sm,
  },
  infoDesc: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  tierInfo: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  tierName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  tierRate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success,
  },

  // Section
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  // Courses
  coursesContainer: {
    backgroundColor: 'rgba(58, 247, 166, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  courseText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  noCoursesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  noCoursesText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gold,
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
  textareaContainer: {
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
  },
  textareaIcon: {
    marginTop: SPACING.sm,
  },
  textarea: {
    minHeight: 80,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    marginTop: 4,
    marginLeft: 4,
  },

  // Terms
  termsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  termsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    lineHeight: 20,
    textAlign: 'center',
  },
  termsLink: {
    color: COLORS.gold,
    textDecorationLine: 'underline',
  },

  // Submit
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.burgundy,
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // Note
  noteText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },
});
