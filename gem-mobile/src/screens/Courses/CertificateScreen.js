/**
 * Gemral - Certificate Screen
 * Displays course completion certificate with share functionality
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Award,
  Share2,
  Download,
  CheckCircle,
} from 'lucide-react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

import { useAuth } from '../../contexts/AuthContext';
import { courseService } from '../../services/courseService';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CERT_WIDTH = SCREEN_WIDTH - SPACING.xl * 2;
const CERT_HEIGHT = CERT_WIDTH * 0.7;

const CertificateScreen = ({ navigation, route }) => {
  const { courseId } = route.params;
  const { user, profile } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();
  const viewShotRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState(null);
  const [course, setCourse] = useState(null);
  const [sharing, setSharing] = useState(false);

  // Animations
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCertificate();
  }, [courseId]);

  useEffect(() => {
    if (certificate) {
      // Entrance animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [certificate]);

  const loadCertificate = async () => {
    try {
      setLoading(true);

      // Get course info
      const courseData = await courseService.getCourseById(courseId);
      setCourse(courseData);

      if (!user?.id) {
        alert({ type: 'error', title: 'Lỗi', message: 'Vui lòng đăng nhập để xem chứng chỉ' });
        navigation.goBack();
        return;
      }

      // Get or generate certificate
      let cert = await courseService.getCertificate(user.id, courseId);

      if (!cert) {
        // Generate new certificate
        const userName = profile?.username || profile?.full_name || user.email?.split('@')[0] || 'Student';
        const result = await courseService.generateCertificate(user.id, courseId, userName);

        if (result.success) {
          cert = result.certificate;
        } else {
          alert({ type: 'error', title: 'Lỗi', message: result.error || 'Không thể tạo chứng chỉ' });
          navigation.goBack();
          return;
        }
      }

      setCertificate(cert);
    } catch (error) {
      console.error('[CertificateScreen] loadCertificate error:', error);
      alert({ type: 'error', title: 'Lỗi', message: 'Không thể tải chứng chỉ' });
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Share certificate
  const handleShare = async () => {
    if (!viewShotRef.current) return;

    try {
      setSharing(true);

      // Capture certificate as image
      const uri = await viewShotRef.current.capture();

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: `Chứng chỉ hoàn thành khóa ${course?.title}`,
        });
      } else {
        alert({ type: 'info', title: 'Thông báo', message: 'Chức năng chia sẻ không khả dụng trên thiết bị này' });
      }
    } catch (error) {
      console.error('[CertificateScreen] handleShare error:', error);
      alert({ type: 'error', title: 'Lỗi', message: 'Không thể chia sẻ chứng chỉ' });
    } finally {
      setSharing(false);
    }
  };

  // Save certificate
  const handleSave = async () => {
    if (!viewShotRef.current) return;

    try {
      setSharing(true);

      // Capture certificate as image
      const uri = await viewShotRef.current.capture();

      // Save to device
      const filename = `GEM_Certificate_${certificate?.certificate_number}.png`;
      const destination = FileSystem.documentDirectory + filename;

      await FileSystem.copyAsync({
        from: uri,
        to: destination,
      });

      alert({ type: 'success', title: 'Thành công', message: 'Chứng chỉ đã được lưu' });
    } catch (error) {
      console.error('[CertificateScreen] handleSave error:', error);
      alert({ type: 'error', title: 'Lỗi', message: 'Không thể lưu chứng chỉ' });
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={GRADIENTS.background}
          locations={GRADIENTS.backgroundLocations}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Đang tải chứng chỉ...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chứng chỉ</Text>
            <View style={styles.headerRight} />
          </View>

          {/* Certificate Card */}
          <View style={styles.certificateWrapper}>
            <Animated.View
              style={[
                styles.certificateOuter,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              <ViewShot
                ref={viewShotRef}
                options={{ format: 'png', quality: 1 }}
                style={styles.viewShot}
              >
                <LinearGradient
                  colors={['#1a0b2e', '#0f1030', '#1a0b2e']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.certificateCard}
                >
                  {/* Gold Border */}
                  <View style={styles.goldBorder}>
                    {/* GEM Logo */}
                    <View style={styles.logoContainer}>
                      <Award size={40} color={COLORS.gold} />
                      <Text style={styles.logoText}>GEM</Text>
                    </View>

                    {/* Certificate Title */}
                    <Text style={styles.certTitle}>CERTIFICATE OF COMPLETION</Text>
                    <View style={styles.certDivider} />

                    {/* This certifies */}
                    <Text style={styles.certSubtitle}>Chứng nhận rằng</Text>

                    {/* User Name */}
                    <Text style={styles.userName}>{certificate?.user_name}</Text>

                    {/* Has completed */}
                    <Text style={styles.certSubtitle}>Đã hoàn thành khóa học</Text>

                    {/* Course Title */}
                    <Text style={styles.courseTitle}>{certificate?.course_title}</Text>

                    {/* Date & Number */}
                    <View style={styles.certFooter}>
                      <View style={styles.footerItem}>
                        <Text style={styles.footerLabel}>Ngày cấp</Text>
                        <Text style={styles.footerValue}>
                          {formatDate(certificate?.completed_at)}
                        </Text>
                      </View>
                      <View style={styles.footerDivider} />
                      <View style={styles.footerItem}>
                        <Text style={styles.footerLabel}>Số chứng chỉ</Text>
                        <Text style={styles.footerValue}>
                          {certificate?.certificate_number}
                        </Text>
                      </View>
                    </View>

                    {/* Signature */}
                    <View style={styles.signatureSection}>
                      <View style={styles.signatureLine} />
                      <Text style={styles.signatureName}>
                        {certificate?.instructor_name || 'Gemral'}
                      </Text>
                      <Text style={styles.signatureTitle}>Giảng viên</Text>
                    </View>

                    {/* Verified Badge */}
                    <View style={styles.verifiedBadge}>
                      <CheckCircle size={12} color={COLORS.success} />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  </View>
                </LinearGradient>
              </ViewShot>
            </Animated.View>
          </View>

          {/* Congratulations Text */}
          <Animated.Text style={[styles.congratsText, { opacity: opacityAnim }]}>
            Chúc mừng bạn đã hoàn thành khóa học!
          </Animated.Text>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleShare}
              disabled={sharing}
            >
              {sharing ? (
                <ActivityIndicator size="small" color={COLORS.textPrimary} />
              ) : (
                <>
                  <Share2 size={20} color={COLORS.textPrimary} />
                  <Text style={styles.actionBtnText}>Chia sẻ</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPrimary]}
              onPress={handleSave}
              disabled={sharing}
            >
              {sharing ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Download size={20} color="#000" />
                  <Text style={[styles.actionBtnText, styles.actionBtnTextPrimary]}>
                    Lưu ảnh
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        {AlertComponent}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
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
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  closeBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: 44,
  },

  // Certificate
  certificateWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  certificateOuter: {
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  viewShot: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  certificateCard: {
    width: CERT_WIDTH,
    minHeight: CERT_HEIGHT,
    borderRadius: 12,
    padding: 3,
  },
  goldBorder: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.gold,
    borderRadius: 10,
    padding: SPACING.lg,
    alignItems: 'center',
  },

  // Logo
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.gold,
    letterSpacing: 4,
  },

  // Certificate Content
  certTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gold,
    letterSpacing: 3,
    marginBottom: SPACING.sm,
  },
  certDivider: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.gold,
    marginBottom: SPACING.md,
  },
  certSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gold,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },

  // Footer
  certFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  footerItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  footerLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  footerValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  footerDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Signature
  signatureSection: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  signatureLine: {
    width: 100,
    height: 1,
    backgroundColor: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  signatureName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  signatureTitle: {
    fontSize: 10,
    color: COLORS.textMuted,
  },

  // Verified
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
  },
  verifiedText: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: '600',
  },

  // Congrats
  congratsText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: SPACING.lg,
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  actionBtnPrimary: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  actionBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  actionBtnTextPrimary: {
    color: '#000',
  },
});

export default CertificateScreen;
