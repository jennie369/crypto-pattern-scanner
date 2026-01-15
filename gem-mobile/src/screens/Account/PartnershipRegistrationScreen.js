/**
 * Partnership Registration Screen
 * v3.0: CTV (Doi Tac Phat Trien) & KOL Affiliate
 * Reference: GEM_PARTNERSHIP_IMPLEMENTATION_PHASE2.md
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, HelpCircle, Clock, Info } from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import partnershipService from '../../services/partnershipService';
import kolVerificationService from '../../services/kolVerificationService';

import {
  PartnershipTypeSelector,
  CTVRegistrationForm,
  KOLRegistrationForm,
} from '../../components/Partnership';

/**
 * Format time remaining until auto-approve
 */
const formatTimeRemaining = (autoApproveAt) => {
  if (!autoApproveAt) return '3 ngày';
  const remaining = new Date(autoApproveAt) - new Date();
  if (remaining <= 0) return 'sắp được duyệt';
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  if (hours < 1) return 'dưới 1 giờ';
  if (hours < 24) return `${hours} giờ`;
  const days = Math.floor(hours / 24);
  return `${days} ngày ${hours % 24} giờ`;
};

export default function PartnershipRegistrationScreen({ route, navigation }) {
  const { type: preSelectedType, fromGemMaster = false } = route.params || {};
  const { user, profile } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(preSelectedType || null); // 'ctv' | 'kol' | null
  const [existingApplication, setExistingApplication] = useState(null);
  const [isCTV, setIsCTV] = useState(false);
  const [ctvTier, setCtvTier] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [user?.id]);

  const loadInitialData = async () => {
    if (!user?.id) {
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setUserProfile(profileData || profile);

      // Check if already CTV
      const ctvStatus = await kolVerificationService.checkIsCTV(user.id);
      setIsCTV(ctvStatus.isCTV);
      setCtvTier(ctvStatus.tier);

      // Check existing applications
      const { applications } = await partnershipService.getAllApplications(user.id);

      // Find pending application
      const pendingApp = applications?.find((app) => app.status === 'pending');
      if (pendingApp) {
        setExistingApplication(pendingApp);
      }
    } catch (err) {
      console.error('Load error:', err);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleGoBack = useCallback(() => {
    if (selectedType) {
      setSelectedType(null);
    } else if (fromGemMaster) {
      navigation.navigate('GemMaster');
    } else {
      navigation.goBack();
    }
  }, [selectedType, fromGemMaster, navigation]);

  const handleTypeSelect = useCallback((type) => {
    setSelectedType(type);
  }, []);

  // CTV Submit Handler
  const handleCTVSubmit = async (formData) => {
    try {
      console.log('[Partnership] Submitting CTV application:', formData);
      const result = await partnershipService.submitCTVApplication(formData);
      console.log('[Partnership] CTV submit result:', result);

      if (result.success) {
        Alert.alert(
          '🎉 Đăng ký thành công!',
          'Đơn đăng ký CTV của bạn sẽ được tự động duyệt sau 3 ngày.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (fromGemMaster) {
                  navigation.navigate('GemMaster');
                } else {
                  navigation.navigate('AffiliateDetail');
                }
              },
            },
          ]
        );
      } else {
        // Show error in alert if submit fails
        Alert.alert('Lỗi', result.error || 'Không thể gửi đơn đăng ký. Vui lòng thử lại.');
      }

      return result;
    } catch (err) {
      console.error('[Partnership] CTV submit error:', err);
      Alert.alert('Lỗi', err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      return { success: false, error: err.message };
    }
  };

  // KOL Submit Handler
  const handleKOLSubmit = async (formData) => {
    try {
      console.log('[Partnership] Submitting KOL application');
      const result = await kolVerificationService.createVerification(formData);
      console.log('[Partnership] KOL submit result:', result);

      if (result.success) {
        Alert.alert(
          '📝 Đã gửi đơn đăng ký',
          'Đơn đăng ký KOL của bạn đang được xem xét. Chúng tôi sẽ thông báo khi có kết quả.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (fromGemMaster) {
                  navigation.navigate('GemMaster');
                } else {
                  navigation.navigate('AffiliateDetail');
                }
              },
            },
          ]
        );
      } else {
        // Show error in alert if submit fails
        Alert.alert('Lỗi', result.error || 'Không thể gửi đơn đăng ký. Vui lòng thử lại.');
      }

      return result;
    } catch (err) {
      console.error('[Partnership] KOL submit error:', err);
      Alert.alert('Lỗi', err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      return { success: false, error: err.message };
    }
  };

  // Get header title based on state
  const getHeaderTitle = () => {
    if (!selectedType) return 'Chọn Loại Đối Tác';
    if (selectedType === 'ctv') return 'Đăng Ký CTV';
    return 'Đăng Ký KOL';
  };

  // Render loading state
  if (loading) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Render pending application status
  if (existingApplication && existingApplication.status === 'pending') {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Đăng Ký Partnership</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Pending Status */}
          <View style={styles.pendingContainer}>
            <View style={styles.pendingIcon}>
              <Clock size={48} color={COLORS.warning} />
            </View>
            <Text style={styles.pendingTitle}>Đơn đăng ký đang chờ duyệt</Text>
            <Text style={styles.pendingType}>
              Loại: {existingApplication.application_type === 'ctv' ? 'CTV Đối Tác Phát Triển' : 'KOL Affiliate'}
            </Text>

            {existingApplication.application_type === 'ctv' ? (
              <View style={styles.autoApproveBox}>
                <Info size={20} color={COLORS.gold} />
                <Text style={styles.autoApproveText}>
                  Tự động duyệt sau: {formatTimeRemaining(existingApplication.auto_approve_at)}
                </Text>
              </View>
            ) : (
              <Text style={styles.pendingMessage}>
                Đơn đăng ký KOL đang được Admin xem xét. Bạn sẽ nhận thông báo khi có kết quả.
              </Text>
            )}

            <TouchableOpacity
              style={styles.viewStatusButton}
              onPress={() => navigation.navigate('AffiliateDetail')}
            >
              <Text style={styles.viewStatusButtonText}>Xem Chi Tiết</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Main render
  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
          <TouchableOpacity style={styles.helpButton}>
            <HelpCircle size={24} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {!selectedType ? (
          <PartnershipTypeSelector
            onSelectCTV={() => handleTypeSelect('ctv')}
            onSelectKOL={() => handleTypeSelect('kol')}
            isCTV={isCTV}
            ctvTier={ctvTier}
          />
        ) : selectedType === 'ctv' ? (
          <CTVRegistrationForm
            userProfile={userProfile || profile}
            onSubmit={handleCTVSubmit}
          />
        ) : (
          <KOLRegistrationForm
            userProfile={userProfile || profile}
            isCTV={isCTV}
            ctvTier={ctvTier}
            onSubmit={handleKOLSubmit}
          />
        )}
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
  helpButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },

  // Pending Status
  pendingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  pendingIcon: {
    marginBottom: SPACING.lg,
  },
  pendingTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  pendingType: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  pendingMessage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  autoApproveBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  autoApproveText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  viewStatusButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
  },
  viewStatusButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDark,
  },
});
