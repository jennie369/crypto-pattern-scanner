/**
 * AdminApplicationDetail
 * Detail screen for Admin to review partnership applications
 * Reference: GEM_PARTNERSHIP_IMPLEMENTATION_PHASE4.md
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Users,
  Youtube,
  Facebook,
  Instagram,
  Twitter,
  MessageCircle,
  Send,
  Music,
  AlertCircle,
  Calendar,
  Link as LinkIcon,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import {
  KOL_CONFIG,
  CTV_TIER_CONFIG,
  formatTierDisplay,
  formatCurrency,
} from '../../constants/partnershipConstants';
import ADMIN_PARTNERSHIP_SERVICE from '../../services/adminPartnershipService';

// Platform icons mapping
const PLATFORM_ICONS = {
  youtube: Youtube,
  facebook: Facebook,
  instagram: Instagram,
  tiktok: Music,
  twitter: Twitter,
  discord: MessageCircle,
  telegram: Send,
};

const AdminApplicationDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { applicationId, application: passedApplication } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(passedApplication || null);
  const [verification, setVerification] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  useEffect(() => {
    loadApplicationData();
  }, [applicationId]);

  const loadApplicationData = async () => {
    try {
      setLoading(true);

      // Get application details if not passed
      if (!application && applicationId) {
        const appData = await ADMIN_PARTNERSHIP_SERVICE.getApplicationById(applicationId);
        setApplication(appData);
      }

      // Load KOL verification if KOL application
      const app = application || (await ADMIN_PARTNERSHIP_SERVICE.getApplicationById(applicationId));
      if (app?.application_type === 'kol') {
        const verificationData = await ADMIN_PARTNERSHIP_SERVICE.getKOLVerification(app.id);
        setVerification(verificationData);
      }
    } catch (err) {
      console.error('[AdminApplicationDetail] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    const typeName = application.application_type === 'kol' ? 'KOL' : 'CTV';

    Alert.alert(
      'Xac nhan duyet',
      `Ban co chac muon duyet don dang ky ${typeName} cua ${application.full_name}?`,
      [
        { text: 'Huy', style: 'cancel' },
        {
          text: 'Duyet',
          onPress: async () => {
            setProcessing(true);
            const result = await ADMIN_PARTNERSHIP_SERVICE.approveApplication(
              application.id,
              application.application_type
            );
            setProcessing(false);

            if (result.success) {
              Alert.alert(
                'Thanh cong',
                `Da duyet don dang ky ${typeName}. Ma gioi thieu: ${result.referralCode}`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } else {
              Alert.alert('Loi', result.error || 'Khong the duyet don dang ky');
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Loi', 'Vui long nhap ly do tu choi');
      return;
    }

    setProcessing(true);
    const result = await ADMIN_PARTNERSHIP_SERVICE.rejectApplication(
      application.id,
      rejectReason
    );
    setProcessing(false);

    if (result.success) {
      Alert.alert('Da tu choi', 'Don dang ky da bi tu choi', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Loi', result.error || 'Khong the tu choi don dang ky');
    }
  };

  const formatTimeRemaining = (autoApproveAt) => {
    if (!autoApproveAt) return 'N/A';
    const remaining = new Date(autoApproveAt) - new Date();
    if (remaining <= 0) return 'Sap tu dong duyet';
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    if (hours < 24) return `${hours}h ${minutes}m`;
    const days = Math.floor(hours / 24);
    return `${days} ngay ${hours % 24}h`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} locations={GRADIENTS.backgroundLocations} style={styles.gradient}>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chi tiet don dang ky</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // No application found
  if (!application) {
    return (
      <LinearGradient colors={GRADIENTS.background} locations={GRADIENTS.backgroundLocations} style={styles.gradient}>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chi tiet don dang ky</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.loadingContainer}>
            <AlertCircle size={48} color={COLORS.error} />
            <Text style={styles.errorText}>Khong tim thay don dang ky</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const isKOL = application.application_type === 'kol';
  const isPending = application.status === 'pending';

  return (
    <LinearGradient colors={GRADIENTS.background} locations={GRADIENTS.backgroundLocations} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiet don dang ky</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Type Badge and Status */}
          <View style={styles.typeBadgeContainer}>
            <View style={[styles.typeBadge, isKOL && styles.typeBadgeKOL]}>
              <Text style={styles.typeBadgeText}>
                {isKOL ? '⭐ KOL Affiliate' : '🥉 CTV'}
              </Text>
            </View>
            <View style={[
              styles.statusBadge,
              application.status === 'approved' && styles.statusBadgeApproved,
              application.status === 'rejected' && styles.statusBadgeRejected,
            ]}>
              {application.status === 'pending' && <Clock size={14} color={COLORS.warning} />}
              {application.status === 'approved' && <CheckCircle size={14} color={COLORS.success} />}
              {application.status === 'rejected' && <XCircle size={14} color={COLORS.error} />}
              <Text style={[
                styles.statusText,
                application.status === 'approved' && styles.statusTextApproved,
                application.status === 'rejected' && styles.statusTextRejected,
              ]}>
                {application.status === 'pending' ? 'Cho duyet' :
                 application.status === 'approved' ? 'Da duyet' : 'Tu choi'}
              </Text>
            </View>
          </View>

          {/* Auto-approve countdown for CTV */}
          {!isKOL && isPending && application.auto_approve_at && (
            <View style={styles.autoApproveCard}>
              <AlertCircle size={20} color={COLORS.warning} />
              <View style={styles.autoApproveInfo}>
                <Text style={styles.autoApproveLabel}>Tu dong duyet sau:</Text>
                <Text style={styles.autoApproveTime}>
                  {formatTimeRemaining(application.auto_approve_at)}
                </Text>
              </View>
            </View>
          )}

          {/* KOL followers requirement check */}
          {isKOL && isPending && (
            <View style={[
              styles.followersCheck,
              (application.total_followers || 0) >= KOL_CONFIG.requirements.minFollowers
                ? styles.followersCheckPass
                : styles.followersCheckFail
            ]}>
              {(application.total_followers || 0) >= KOL_CONFIG.requirements.minFollowers ? (
                <CheckCircle size={20} color={COLORS.success} />
              ) : (
                <AlertCircle size={20} color={COLORS.error} />
              )}
              <Text style={styles.followersCheckText}>
                Tong followers: {(application.total_followers || 0).toLocaleString()} / {KOL_CONFIG.requirements.minFollowers.toLocaleString()} yeu cau
              </Text>
            </View>
          )}

          {/* Personal Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thong tin ca nhan</Text>

            <View style={styles.infoRow}>
              <User size={18} color={COLORS.textMuted} />
              <Text style={styles.infoLabel}>Ho ten:</Text>
              <Text style={styles.infoValue}>{application.full_name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Mail size={18} color={COLORS.textMuted} />
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{application.email}</Text>
            </View>

            <View style={styles.infoRow}>
              <Phone size={18} color={COLORS.textMuted} />
              <Text style={styles.infoLabel}>Dien thoai:</Text>
              <Text style={styles.infoValue}>{application.phone || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Calendar size={18} color={COLORS.textMuted} />
              <Text style={styles.infoLabel}>Ngay dang ky:</Text>
              <Text style={styles.infoValue}>{formatDate(application.created_at)}</Text>
            </View>

            {application.referred_by_code && (
              <View style={styles.infoRow}>
                <LinkIcon size={18} color={COLORS.textMuted} />
                <Text style={styles.infoLabel}>Ma gioi thieu:</Text>
                <Text style={styles.infoValue}>{application.referred_by_code}</Text>
              </View>
            )}
          </View>

          {/* Marketing Channels */}
          {application.marketing_channels && application.marketing_channels.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kenh marketing</Text>
              <View style={styles.channelTags}>
                {application.marketing_channels.map((channel, index) => (
                  <View key={index} style={styles.channelTag}>
                    <Text style={styles.channelTagText}>{channel}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reason for joining */}
          {application.reason_for_joining && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ly do tham gia</Text>
              <Text style={styles.reasonText}>{application.reason_for_joining}</Text>
            </View>
          )}

          {/* KOL Verification Section */}
          {isKOL && verification && (
            <>
              {/* ID Verification */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Xac minh danh tinh</Text>

                <View style={styles.infoRow}>
                  <CreditCard size={18} color={COLORS.textMuted} />
                  <Text style={styles.infoLabel}>So CCCD:</Text>
                  <Text style={styles.infoValue}>{verification.id_number}</Text>
                </View>

                <Text style={styles.imageLabel}>Anh CCCD mat truoc:</Text>
                {verification.id_front_image_url ? (
                  <TouchableOpacity onPress={() => Linking.openURL(verification.id_front_image_url)}>
                    <Image source={{ uri: verification.id_front_image_url }} style={styles.verificationImage} />
                    <Text style={styles.tapToViewText}>Nhan de xem anh goc</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.noImagePlaceholder}>
                    <Text style={styles.noImageText}>Chua co anh</Text>
                  </View>
                )}

                <Text style={styles.imageLabel}>Anh CCCD mat sau:</Text>
                {verification.id_back_image_url ? (
                  <TouchableOpacity onPress={() => Linking.openURL(verification.id_back_image_url)}>
                    <Image source={{ uri: verification.id_back_image_url }} style={styles.verificationImage} />
                    <Text style={styles.tapToViewText}>Nhan de xem anh goc</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.noImagePlaceholder}>
                    <Text style={styles.noImageText}>Chua co anh</Text>
                  </View>
                )}

                <Text style={styles.imageLabel}>Anh chan dung:</Text>
                {verification.portrait_image_url ? (
                  <TouchableOpacity onPress={() => Linking.openURL(verification.portrait_image_url)}>
                    <Image source={{ uri: verification.portrait_image_url }} style={styles.portraitImage} />
                    <Text style={styles.tapToViewText}>Nhan de xem anh goc</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.noImagePlaceholder}>
                    <Text style={styles.noImageText}>Chua co anh</Text>
                  </View>
                )}
              </View>

              {/* Social Media */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Mang xa hoi ({(application.total_followers || 0).toLocaleString()} followers)
                </Text>

                {Object.entries(application.social_platforms || {}).map(([platform, count]) => {
                  const Icon = PLATFORM_ICONS[platform] || Users;
                  const url = verification[`${platform}_url`];

                  if (!count && !url) return null;

                  return (
                    <View key={platform} style={styles.socialRow}>
                      <Icon size={20} color={COLORS.gold} />
                      <View style={styles.socialInfo}>
                        <Text style={styles.socialName}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</Text>
                        <Text style={styles.socialCount}>{parseInt(count || 0).toLocaleString()} followers</Text>
                      </View>
                      {url && (
                        <TouchableOpacity
                          style={styles.socialLink}
                          onPress={() => Linking.openURL(url)}
                        >
                          <ExternalLink size={18} color={COLORS.info} />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {/* Rejection reason (if rejected) */}
          {application.status === 'rejected' && application.rejection_reason && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ly do tu choi</Text>
              <View style={styles.rejectionCard}>
                <XCircle size={20} color={COLORS.error} />
                <Text style={styles.rejectionText}>{application.rejection_reason}</Text>
              </View>
            </View>
          )}

          {/* Reject Reason Input */}
          {isPending && showRejectInput && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ly do tu choi</Text>
              <TextInput
                style={styles.rejectInput}
                value={rejectReason}
                onChangeText={setRejectReason}
                placeholder="Nhap ly do tu choi..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          )}

          {/* Action Buttons (only for pending) */}
          {isPending && (
            <View style={styles.actionContainer}>
              {!showRejectInput ? (
                <>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => setShowRejectInput(true)}
                    disabled={processing}
                  >
                    <XCircle size={20} color={COLORS.error} />
                    <Text style={styles.rejectButtonText}>Tu choi</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.approveButton}
                    onPress={handleApprove}
                    disabled={processing}
                  >
                    {processing ? (
                      <ActivityIndicator color={COLORS.bgDark} />
                    ) : (
                      <>
                        <CheckCircle size={20} color={COLORS.bgDark} />
                        <Text style={styles.approveButtonText}>Duyet</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowRejectInput(false);
                      setRejectReason('');
                    }}
                    disabled={processing}
                  >
                    <Text style={styles.cancelButtonText}>Huy</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.confirmRejectButton}
                    onPress={handleReject}
                    disabled={processing}
                  >
                    {processing ? (
                      <ActivityIndicator color={COLORS.textPrimary} />
                    ) : (
                      <Text style={styles.confirmRejectButtonText}>Xac nhan tu choi</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.error,
    marginTop: SPACING.md,
  },

  // Type badge
  typeBadgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  typeBadge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  typeBadgeKOL: {
    backgroundColor: '#9C27B0',
  },
  typeBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDark,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadgeApproved: {},
  statusBadgeRejected: {},
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.warning,
  },
  statusTextApproved: {
    color: COLORS.success,
  },
  statusTextRejected: {
    color: COLORS.error,
  },

  // Auto-approve card
  autoApproveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  autoApproveInfo: {
    flex: 1,
  },
  autoApproveLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.warning,
  },
  autoApproveTime: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.warning,
  },

  // Followers check
  followersCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  followersCheckPass: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  followersCheckFail: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  followersCheckText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
  },

  // Section
  section: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    width: 90,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    flex: 1,
  },

  // Channel tags
  channelTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  channelTag: {
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 16,
  },
  channelTagText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textPrimary,
  },

  // Reason text
  reasonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    lineHeight: 20,
  },

  // Image styles
  imageLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  verificationImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  portraitImage: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  tapToViewText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.info,
    textAlign: 'center',
    marginTop: 4,
  },
  noImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  // Social rows
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  socialInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  socialName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  socialCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  socialLink: {
    padding: SPACING.xs,
  },

  // Rejection card
  rejectionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  rejectionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    lineHeight: 20,
  },

  // Reject input
  rejectInput: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.error + '50',
  },

  // Action buttons
  actionContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: SPACING.md,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  rejectButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.error,
  },
  approveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    borderRadius: 12,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  approveButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDark,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: SPACING.md,
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textMuted,
  },
  confirmRejectButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    borderRadius: 12,
    padding: SPACING.md,
  },
  confirmRejectButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
});

export default AdminApplicationDetail;
