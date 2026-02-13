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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, HelpCircle, Clock } from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import partnershipService from '../../services/partnershipService';
import kolVerificationService from '../../services/kolVerificationService';
import DarkAlertModal from '../../components/Common/DarkAlertModal';

import {
  PartnershipTypeSelector,
  CTVRegistrationForm,
  KOLRegistrationForm,
} from '../../components/Partnership';

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

  // Alert modal state
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    buttons: [],
  });

  const showAlert = useCallback((type, title, message, buttons = [{ text: 'OK' }]) => {
    setAlertConfig({ visible: true, type, title, message, buttons });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  }, []);

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
      showAlert('error', 'Lỗi', 'Không thể tải dữ liệu');
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
        showAlert(
          'success',
          'Đăng ký thành công!',
          'Đơn đăng ký CTV của bạn sẽ được xem xét trong vòng 3 ngày.',
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
        showAlert('error', 'Lỗi', result.error || 'Không thể gửi đơn đăng ký. Vui lòng thử lại.');
      }

      return result;
    } catch (err) {
      console.error('[Partnership] CTV submit error:', err);
      showAlert('error', 'Lỗi', err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
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
        showAlert(
          'success',
          'Đã gửi đơn đăng ký',
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
        showAlert('error', 'Lỗi', result.error || 'Không thể gửi đơn đăng ký. Vui lòng thử lại.');
      }

      return result;
    } catch (err) {
      console.error('[Partnership] KOL submit error:', err);
      showAlert('error', 'Lỗi', err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
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

            <Text style={styles.pendingMessage}>
              {existingApplication.application_type === 'ctv'
                ? 'Đơn đăng ký CTV đang được xem xét. Bạn sẽ nhận thông báo khi có kết quả.'
                : 'Đơn đăng ký KOL đang được xem xét. Bạn sẽ nhận thông báo khi có kết quả.'}
            </Text>

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

        {/* Dark Theme Alert Modal */}
        <DarkAlertModal
          visible={alertConfig.visible}
          onClose={hideAlert}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
        />
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
