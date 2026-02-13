/**
 * KOLRegistrationForm
 * Full KOL registration form with KYC verification
 * Reference: GEM_PARTNERSHIP_IMPLEMENTATION_PHASE2.md
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Camera,
  CheckCircle,
  AlertCircle,
  Link,
  Users,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { COLORS, SPACING } from '../../theme/darkTheme';
import {
  KOL_CONFIG,
  CTV_TIER_CONFIG,
  calculateTotalFollowers,
  checkKOLEligibility,
  formatTierDisplay,
  formatPercent,
} from '../../constants/partnershipConstants';
import {
  validateKOLStep1,
  validateKOLStep2,
  validateKOLStep3,
  formatPhoneNumber,
} from '../../utils/partnershipValidation';
import kolVerificationService from '../../services/kolVerificationService';

// Platform configurations
const SOCIAL_PLATFORMS = [
  { key: 'youtube', name: 'YouTube', icon: 'Youtube', color: '#FF0000' },
  { key: 'facebook', name: 'Facebook', icon: 'Facebook', color: '#1877F2' },
  { key: 'instagram', name: 'Instagram', icon: 'Instagram', color: '#E4405F' },
  { key: 'tiktok', name: 'TikTok', icon: 'Music', color: '#000000' },
  { key: 'twitter', name: 'Twitter/X', icon: 'Twitter', color: '#1DA1F2' },
  { key: 'discord', name: 'Discord', icon: 'MessageCircle', color: '#5865F2', isMembers: true },
  { key: 'telegram', name: 'Telegram', icon: 'Send', color: '#0088CC', isMembers: true },
];

const KOLRegistrationForm = ({ userProfile, isCTV, ctvTier, onSubmit }) => {
  // State
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  // Step 1: Personal Info
  const [fullName, setFullName] = useState(userProfile?.full_name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [referralCode, setReferralCode] = useState('');

  // Step 2: KYC
  const [idType, setIdType] = useState('cccd');
  const [idNumber, setIdNumber] = useState('');
  const [idFrontImage, setIdFrontImage] = useState(null);
  const [idBackImage, setIdBackImage] = useState(null);
  const [portraitImage, setPortraitImage] = useState(null);

  // Step 3: Social Media
  const [socialData, setSocialData] = useState({
    youtube: { url: '', followers: '' },
    facebook: { url: '', followers: '' },
    instagram: { url: '', followers: '' },
    tiktok: { url: '', followers: '' },
    twitter: { url: '', followers: '' },
    discord: { url: '', members: '' },
    telegram: { url: '', members: '' },
  });

  // Computed values
  const totalFollowers = useMemo(() => {
    const platforms = {};
    Object.entries(socialData).forEach(([key, data]) => {
      platforms[key] = parseInt(data.followers || data.members) || 0;
    });
    return calculateTotalFollowers(platforms);
  }, [socialData]);

  const eligibility = useMemo(() => {
    return checkKOLEligibility(totalFollowers);
  }, [totalFollowers]);

  // Handlers
  const handleSocialChange = useCallback((platform, field, value) => {
    setSocialData((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
      },
    }));
  }, []);

  const pickImage = async (type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'portrait' ? [3, 4] : [16, 10],
        quality: 0.8,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;

        switch (type) {
          case 'id_front':
            setIdFrontImage(imageUri);
            break;
          case 'id_back':
            setIdBackImage(imageUri);
            break;
          case 'portrait':
            setPortraitImage(imageUri);
            break;
        }
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const validateCurrentStep = () => {
    let validation;

    switch (currentStep) {
      case 1:
        validation = validateKOLStep1({
          full_name: fullName,
          email,
          phone: formatPhoneNumber(phone),
        });
        break;

      case 2:
        validation = validateKOLStep2({
          id_number: idNumber,
          id_front_image: idFrontImage,
          id_back_image: idBackImage,
          portrait_image: portraitImage,
        });
        break;

      case 3:
        validation = validateKOLStep3(
          socialData,
          totalFollowers,
          KOL_CONFIG.requirements.minFollowers
        );
        break;

      default:
        validation = { valid: true, errors: {} };
    }

    setErrors(validation.errors);
    return validation.valid;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (!eligibility.eligible) {
      Alert.alert('Chưa đủ điều kiện', eligibility.reason);
      return;
    }

    try {
      setLoading(true);

      // Upload images
      const [idFrontResult, idBackResult, portraitResult] = await Promise.all([
        kolVerificationService.uploadVerificationImage(
          userProfile.id,
          idFrontImage,
          'id_front'
        ),
        kolVerificationService.uploadVerificationImage(
          userProfile.id,
          idBackImage,
          'id_back'
        ),
        kolVerificationService.uploadVerificationImage(
          userProfile.id,
          portraitImage,
          'portrait'
        ),
      ]);

      if (!idFrontResult.success || !idBackResult.success || !portraitResult.success) {
        throw new Error('Upload ảnh thất bại. Vui lòng thử lại.');
      }

      // Prepare form data
      const formData = {
        full_name: fullName,
        email,
        phone: formatPhoneNumber(phone),
        referral_code: referralCode.toUpperCase() || null,
        id_type: idType,
        id_number: idNumber,
        id_front_image_url: idFrontResult.url,
        id_back_image_url: idBackResult.url,
        portrait_image_url: portraitResult.url,
        youtube_url: socialData.youtube.url,
        youtube_followers: socialData.youtube.followers,
        facebook_url: socialData.facebook.url,
        facebook_followers: socialData.facebook.followers,
        instagram_url: socialData.instagram.url,
        instagram_followers: socialData.instagram.followers,
        tiktok_url: socialData.tiktok.url,
        tiktok_followers: socialData.tiktok.followers,
        twitter_url: socialData.twitter.url,
        twitter_followers: socialData.twitter.followers,
        discord_url: socialData.discord.url,
        discord_members: socialData.discord.members,
        telegram_url: socialData.telegram.url,
        telegram_members: socialData.telegram.members,
      };

      await onSubmit(formData);
    } catch (err) {
      Alert.alert('Lỗi', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* CTV Status Badge */}
      {isCTV && (
        <View style={styles.ctvBadge}>
          <CheckCircle size={20} color={COLORS.success} />
          <Text style={styles.ctvBadgeText}>
            Bạn đang là CTV {formatTierDisplay(ctvTier)}
          </Text>
        </View>
      )}

      {/* Eligibility Card */}
      <View
        style={[
          styles.eligibilityCard,
          eligibility.eligible ? styles.eligibilitySuccess : styles.eligibilityWarning,
        ]}
      >
        {eligibility.eligible ? (
          <CheckCircle size={24} color={COLORS.success} />
        ) : (
          <AlertCircle size={24} color={COLORS.warning} />
        )}
        <View style={styles.eligibilityContent}>
          <Text style={styles.eligibilityTitle}>
            {eligibility.eligible ? 'Đủ điều kiện đăng ký' : 'Chưa đủ điều kiện'}
          </Text>
          <Text style={styles.eligibilityReason}>{eligibility.reason}</Text>
          <Text style={styles.eligibilityFollowers}>
            Tổng followers: {totalFollowers.toLocaleString()} /{' '}
            {KOL_CONFIG.requirements.minFollowers.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((step) => (
          <View key={step} style={styles.progressStep}>
            <View
              style={[styles.progressDot, currentStep >= step && styles.progressDotActive]}
            >
              <Text
                style={[
                  styles.progressDotText,
                  currentStep >= step && styles.progressDotTextActive,
                ]}
              >
                {step}
              </Text>
            </View>
            <Text
              style={[styles.progressLabel, currentStep >= step && styles.progressLabelActive]}
            >
              {step === 1 ? 'Thông tin' : step === 2 ? 'Xác minh' : 'Mạng XH'}
            </Text>
          </View>
        ))}
      </View>

      {/* Step 1: Personal Info */}
      {currentStep === 1 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Thông tin cá nhân</Text>

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
            {errors.full_name && <Text style={styles.errorText}>{errors.full_name}</Text>}
          </View>

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
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

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
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

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
        </View>
      )}

      {/* Step 2: KYC Verification */}
      {currentStep === 2 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Xác minh danh tính</Text>
          <Text style={styles.stepDescription}>
            Vui lòng cung cấp thông tin xác minh để đảm bảo bạn là chủ sở hữu các kênh mạng
            xã hội.
          </Text>

          {/* ID Type Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Loại giấy tờ *</Text>
            <View style={styles.idTypeContainer}>
              {['cccd', 'cmnd', 'passport'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.idTypeButton, idType === type && styles.idTypeButtonActive]}
                  onPress={() => setIdType(type)}
                >
                  <Text
                    style={[styles.idTypeText, idType === type && styles.idTypeTextActive]}
                  >
                    {type === 'cccd' ? 'CCCD' : type === 'cmnd' ? 'CMND' : 'Passport'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ID Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số {idType.toUpperCase()} *</Text>
            <View style={[styles.inputWrapper, errors.id_number && styles.inputError]}>
              <CreditCard size={20} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                value={idNumber}
                onChangeText={setIdNumber}
                placeholder="012345678901"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
              />
            </View>
            {errors.id_number && <Text style={styles.errorText}>{errors.id_number}</Text>}
          </View>

          {/* ID Front Image */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ảnh mặt trước {idType.toUpperCase()} *</Text>
            <TouchableOpacity
              style={[styles.imageUploader, errors.id_front_image && styles.imageUploaderError]}
              onPress={() => pickImage('id_front')}
            >
              {idFrontImage ? (
                <Image source={{ uri: idFrontImage }} style={styles.uploadedImage} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Camera size={32} color={COLORS.textMuted} />
                  <Text style={styles.uploadText}>Chọn ảnh</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.id_front_image && (
              <Text style={styles.errorText}>{errors.id_front_image}</Text>
            )}
          </View>

          {/* ID Back Image */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ảnh mặt sau {idType.toUpperCase()} *</Text>
            <TouchableOpacity
              style={[styles.imageUploader, errors.id_back_image && styles.imageUploaderError]}
              onPress={() => pickImage('id_back')}
            >
              {idBackImage ? (
                <Image source={{ uri: idBackImage }} style={styles.uploadedImage} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Camera size={32} color={COLORS.textMuted} />
                  <Text style={styles.uploadText}>Chọn ảnh</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.id_back_image && (
              <Text style={styles.errorText}>{errors.id_back_image}</Text>
            )}
          </View>

          {/* Portrait Image */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ảnh chân dung (selfie cầm {idType.toUpperCase()}) *</Text>
            <Text style={styles.inputHint}>
              Chụp ảnh bạn đang cầm {idType.toUpperCase()} bên cạnh khuôn mặt
            </Text>
            <TouchableOpacity
              style={[
                styles.imageUploader,
                styles.portraitUploader,
                errors.portrait_image && styles.imageUploaderError,
              ]}
              onPress={() => pickImage('portrait')}
            >
              {portraitImage ? (
                <Image source={{ uri: portraitImage }} style={styles.uploadedImage} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Camera size={32} color={COLORS.textMuted} />
                  <Text style={styles.uploadText}>Chọn ảnh chân dung</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.portrait_image && (
              <Text style={styles.errorText}>{errors.portrait_image}</Text>
            )}
          </View>
        </View>
      )}

      {/* Step 3: Social Media */}
      {currentStep === 3 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Mạng xã hội</Text>
          <Text style={styles.stepDescription}>
            Nhập thông tin các kênh mạng xã hội. Cần tối thiểu{' '}
            {KOL_CONFIG.requirements.minFollowers.toLocaleString()} followers tổng cộng.
          </Text>

          {SOCIAL_PLATFORMS.map((platform) => {
            const fieldName = platform.isMembers ? 'members' : 'followers';
            const data = socialData[platform.key];

            return (
              <View key={platform.key} style={styles.socialInputGroup}>
                <View style={styles.socialHeader}>
                  <View style={[styles.platformIcon, { backgroundColor: platform.color + '20' }]}>
                    <Users size={16} color={platform.color} />
                  </View>
                  <Text style={styles.socialLabel}>{platform.name}</Text>
                </View>

                <View style={styles.socialInputRow}>
                  <View style={[styles.inputWrapper, styles.socialUrlInput]}>
                    <Link size={16} color={COLORS.textMuted} />
                    <TextInput
                      style={styles.input}
                      value={data.url}
                      onChangeText={(v) => handleSocialChange(platform.key, 'url', v)}
                      placeholder={`Link ${platform.name}`}
                      placeholderTextColor={COLORS.textMuted}
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={[styles.inputWrapper, styles.socialCountInput]}>
                    <Users size={16} color={COLORS.textMuted} />
                    <TextInput
                      style={styles.input}
                      value={data[fieldName]}
                      onChangeText={(v) => handleSocialChange(platform.key, fieldName, v)}
                      placeholder={platform.isMembers ? 'Members' : 'Followers'}
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              </View>
            );
          })}

          {/* Total Followers Display */}
          <View style={styles.totalFollowers}>
            <Text style={styles.totalFollowersLabel}>Tổng followers/members:</Text>
            <Text
              style={[
                styles.totalFollowersValue,
                totalFollowers >= KOL_CONFIG.requirements.minFollowers &&
                  styles.totalFollowersSuccess,
              ]}
            >
              {totalFollowers.toLocaleString()}
            </Text>
          </View>

          {errors.totalFollowers && (
            <Text style={[styles.errorText, styles.totalError]}>{errors.totalFollowers}</Text>
          )}
        </View>
      )}

      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.prevButton} onPress={handlePrev}>
            <Text style={styles.prevButtonText}>Quay lại</Text>
          </TouchableOpacity>
        )}

        {currentStep < 3 ? (
          <TouchableOpacity
            style={[styles.nextButton, currentStep === 1 && { flex: 1 }]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Tiếp tục</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!eligibility.eligible || loading) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!eligibility.eligible || loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.bgDark} />
            ) : (
              <Text style={styles.submitButtonText}>Gửi đăng ký</Text>
            )}
          </TouchableOpacity>
        )}
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
  ctvBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '20',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  ctvBadgeText: {
    fontSize: 14,
    color: COLORS.success,
  },
  eligibilityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  eligibilitySuccess: {
    backgroundColor: COLORS.success + '15',
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  eligibilityWarning: {
    backgroundColor: COLORS.warning + '15',
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  eligibilityContent: {
    flex: 1,
  },
  eligibilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  eligibilityReason: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  eligibilityFollowers: {
    fontSize: 13,
    color: COLORS.gold,
    marginTop: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  progressDotActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  progressDotText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  progressDotTextActive: {
    color: COLORS.bgDark,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  progressLabelActive: {
    color: COLORS.gold,
  },
  stepContainer: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
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
  inputHint: {
    fontSize: 12,
    color: COLORS.textMuted,
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
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  idTypeContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  idTypeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.bgDark,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  idTypeButtonActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  idTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  idTypeTextActive: {
    color: COLORS.bgDark,
  },
  imageUploader: {
    height: 160,
    backgroundColor: COLORS.bgDark,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imageUploaderError: {
    borderColor: COLORS.error,
  },
  portraitUploader: {
    height: 200,
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  socialInputGroup: {
    marginBottom: SPACING.md,
  },
  socialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    gap: SPACING.xs,
  },
  platformIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  socialInputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  socialUrlInput: {
    flex: 2,
  },
  socialCountInput: {
    flex: 1,
  },
  totalFollowers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.bgDark,
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  totalFollowersLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  totalFollowersValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.warning,
  },
  totalFollowersSuccess: {
    color: COLORS.success,
  },
  totalError: {
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  navButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  prevButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  prevButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  nextButton: {
    flex: 2,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.gold,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.bgDark,
  },
  submitButton: {
    flex: 2,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.gold,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.bgDark,
  },
});

export default KOLRegistrationForm;
