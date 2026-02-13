/**
 * Affiliate Section Component
 * Handles 4 scenarios:
 * 1. No partnership, no application - Show registration options
 * 2. Has pending application - Show pending status
 * 3. Application rejected - Show rejection info
 * 4. Has partnership (approved) - Show affiliate code & stats
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import {
  Share2,
  Copy,
  ExternalLink,
  Clock,
  XCircle,
  CheckCircle,
  Gift,
  TrendingUp,
  Users,
  DollarSign,
  ChevronRight,
  Unlock,
  Lock,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import { partnershipService } from '../../../services/partnershipService';

export default function AffiliateSection({ user, navigation }) {
  const [loading, setLoading] = useState(true);
  const [partnershipStatus, setPartnershipStatus] = useState(null);
  const [commissionStats, setCommissionStats] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadPartnershipData();
    }
  }, [user?.id]);

  const loadPartnershipData = async () => {
    setLoading(true);
    try {
      // Get partnership status
      const statusResult = await partnershipService.getPartnershipStatus(user.id);
      if (statusResult.success) {
        setPartnershipStatus(statusResult.data);

        // If has partnership, also get commission stats
        if (statusResult.data?.has_partnership) {
          const statsResult = await partnershipService.getCommissionStats(user.id);
          if (statsResult.success) {
            setCommissionStats(statsResult.stats);
          }
        }
      }
    } catch (error) {
      console.error('[AffiliateSection] Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async (code) => {
    try {
      await Clipboard.setStringAsync(code);
      Alert.alert('Thành công', `Đã sao chép mã giới thiệu: ${code}`);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể sao chép mã giới thiệu');
    }
  };

  const handleCopyLink = async (code) => {
    try {
      const link = partnershipService.getReferralLink(code);
      await Clipboard.setStringAsync(link);
      Alert.alert('Thành công', 'Đã sao chép link giới thiệu!');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể sao chép link');
    }
  };

  const handleCtvRegister = () => {
    if (!partnershipStatus?.is_ctv_eligible) {
      Alert.alert(
        'Chưa đủ điều kiện',
        'Bạn cần mua ít nhất 1 khóa học để đăng ký CTV 4 Cấp',
        [
          { text: 'Đóng', style: 'cancel' },
          {
            text: 'Xem Khóa Học',
            onPress: () => navigation.navigate('Courses'),
          },
        ]
      );
      return;
    }
    navigation.navigate('PartnershipRegistration', { type: 'ctv' });
  };

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString('vi-VN') + '₫';
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chương Trình Affiliate</Text>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="small" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // SCENARIO 1: No partnership, no application - Show registration
  // ═══════════════════════════════════════════════════════════════
  if (!partnershipStatus?.has_partnership && !partnershipStatus?.has_application) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chương Trình Partnership</Text>

        <View style={styles.registrationCard}>
          {/* Header */}
          <View style={styles.registrationHeader}>
            <Gift size={28} color={COLORS.gold} />
            <View style={styles.registrationHeaderText}>
              <Text style={styles.registrationTitle}>Tham Gia Kiếm Tiền Cùng GEM</Text>
              <Text style={styles.registrationSubtitle}>
                Giới thiệu bạn bè & nhận hoa hồng
              </Text>
            </View>
          </View>

          {/* Program Options */}
          <View style={styles.programsContainer}>
            {/* Affiliate Option */}
            <View style={styles.programCard}>
              <View style={styles.programHeader}>
                <Text style={styles.programTitle}>Affiliate</Text>
                <View style={styles.rateBadge}>
                  <Text style={styles.rateText}>3%</Text>
                </View>
              </View>
              <Text style={styles.programDesc}>Hoa hồng cố định cho mọi đơn hàng</Text>
              <View style={styles.programFeatures}>
                <Text style={styles.featureText}>• Đăng ký miễn phí</Text>
                <Text style={styles.featureText}>• Không yêu cầu mua hàng</Text>
                <Text style={styles.featureText}>• Phù hợp cho tất cả</Text>
              </View>
              <TouchableOpacity
                style={styles.programButton}
                onPress={() => navigation.navigate('PartnershipRegistration', { type: 'affiliate' })}
              >
                <Text style={styles.programButtonText}>Đăng Ký Affiliate</Text>
                <ChevronRight size={18} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* CTV Option */}
            <View style={[styles.programCard, styles.ctvCard]}>
              <View style={styles.programHeader}>
                <Text style={styles.programTitle}>CTV 4 Cấp</Text>
                <View style={[styles.rateBadge, styles.ctvBadge]}>
                  <Text style={styles.rateText}>10-30%</Text>
                </View>
              </View>
              <Text style={styles.programDesc}>Hoa hồng cao theo cấp bậc</Text>
              <View style={styles.programFeatures}>
                <Text style={styles.featureText}>• Digital: 10% → 30%</Text>
                <Text style={styles.featureText}>• Physical: 3% → 15%</Text>
                <Text style={styles.featureText}>• KPI Bonus hàng tháng</Text>
              </View>

              {/* Eligibility Badge */}
              {partnershipStatus?.is_ctv_eligible ? (
                <View style={styles.eligibleBadge}>
                  <Unlock size={14} color={COLORS.success} />
                  <Text style={styles.eligibleText}>Bạn đủ điều kiện!</Text>
                </View>
              ) : (
                <View style={styles.notEligibleBadge}>
                  <Lock size={14} color={COLORS.textMuted} />
                  <Text style={styles.notEligibleText}>Cần mua khóa học</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.programButton,
                  styles.ctvButton,
                  !partnershipStatus?.is_ctv_eligible && styles.buttonDisabled,
                ]}
                onPress={handleCtvRegister}
              >
                <Text style={styles.programButtonText}>
                  {partnershipStatus?.is_ctv_eligible ? 'Đăng Ký CTV' : 'Mua Khóa Học'}
                </Text>
                <ChevronRight size={18} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // SCENARIO 2: Has pending application
  // ═══════════════════════════════════════════════════════════════
  if (partnershipStatus?.has_application && partnershipStatus?.application_status === 'pending') {
    const appType = partnershipStatus.application_type === 'affiliate' ? 'Affiliate' : 'CTV 4 Cấp';
    const appDate = new Date(partnershipStatus.application_date).toLocaleDateString('vi-VN');

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Đơn Đăng Ký Partnership</Text>

        <View style={styles.pendingCard}>
          <View style={styles.pendingHeader}>
            <Clock size={32} color={COLORS.gold} />
            <View style={styles.pendingInfo}>
              <Text style={styles.pendingTitle}>Đang Chờ Phê Duyệt</Text>
              <Text style={styles.pendingSubtitle}>
                Đơn đăng ký {appType} của bạn đang được xem xét
              </Text>
            </View>
          </View>

          <View style={styles.pendingDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Loại đăng ký:</Text>
              <Text style={styles.detailValue}>{appType}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ngày gửi:</Text>
              <Text style={styles.detailValue}>{appDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Trạng thái:</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Chờ duyệt</Text>
              </View>
            </View>
          </View>

          <Text style={styles.pendingNote}>
            Chúng tôi sẽ xem xét trong 1-2 ngày làm việc và thông báo qua email/app khi có kết quả.
          </Text>
        </View>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // SCENARIO 3: Application rejected
  // ═══════════════════════════════════════════════════════════════
  if (partnershipStatus?.has_application && partnershipStatus?.application_status === 'rejected') {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Đơn Đăng Ký Partnership</Text>

        <View style={styles.rejectedCard}>
          <View style={styles.rejectedHeader}>
            <XCircle size={32} color={COLORS.error} />
            <View style={styles.rejectedInfo}>
              <Text style={styles.rejectedTitle}>Đơn Đăng Ký Bị Từ Chối</Text>
              <Text style={styles.rejectedSubtitle}>
                Rất tiếc, đơn đăng ký của bạn không được phê duyệt
              </Text>
            </View>
          </View>

          {partnershipStatus.rejection_reason && (
            <View style={styles.rejectionReasonBox}>
              <Text style={styles.rejectionLabel}>Lý do:</Text>
              <Text style={styles.rejectionReason}>
                {partnershipStatus.rejection_reason}
              </Text>
            </View>
          )}

          <Text style={styles.rejectedNote}>
            Bạn có thể đăng ký lại sau khi đáp ứng đủ yêu cầu.
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.navigate('PartnershipRegistration', { type: 'affiliate' })}
          >
            <Text style={styles.retryButtonText}>Đăng Ký Lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // SCENARIO 4: Has partnership (approved) - Main dashboard
  // ═══════════════════════════════════════════════════════════════
  if (partnershipStatus?.has_partnership) {
    const isAffiliate = partnershipStatus.partnership_role === 'affiliate';
    const tierNames = ['Beginner', 'Growing', 'Master', 'Grand'];
    const tierName = isAffiliate ? 'Affiliate' : tierNames[(partnershipStatus.ctv_tier || 1) - 1];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {isAffiliate ? 'Chương Trình Affiliate' : 'Chương Trình CTV 4 Cấp'}
        </Text>

        <View style={styles.partnerCard}>
          {/* Header with Code */}
          <View style={styles.partnerHeader}>
            <Share2 size={28} color={COLORS.gold} />
            <View style={styles.partnerInfo}>
              <Text style={styles.codeLabel}>Mã giới thiệu của bạn</Text>
              <Text style={styles.codeValue}>{partnershipStatus.affiliate_code}</Text>
            </View>
            <View style={styles.tierBadge}>
              <Text style={styles.tierText}>{tierName}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => handleCopyCode(partnershipStatus.affiliate_code)}
            >
              <Copy size={18} color={COLORS.textPrimary} />
              <Text style={styles.copyButtonText}>Sao chép mã</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => handleCopyLink(partnershipStatus.affiliate_code)}
            >
              <ExternalLink size={18} color={COLORS.gold} />
              <Text style={styles.linkButtonText}>Sao chép link</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <DollarSign size={20} color={COLORS.success} />
              <Text style={styles.statValue}>
                {formatCurrency(commissionStats?.totalCommission || partnershipStatus.total_commission)}
              </Text>
              <Text style={styles.statLabel}>Tổng hoa hồng</Text>
            </View>

            <View style={styles.statCard}>
              <TrendingUp size={20} color={COLORS.cyan} />
              <Text style={styles.statValue}>
                {formatCurrency(commissionStats?.thisMonthCommission || 0)}
              </Text>
              <Text style={styles.statLabel}>Tháng này</Text>
            </View>

            <View style={styles.statCard}>
              <Users size={20} color={COLORS.purple} />
              <Text style={styles.statValue}>
                {commissionStats?.totalOrders || 0}
              </Text>
              <Text style={styles.statLabel}>Đơn hàng</Text>
            </View>

            <View style={styles.statCard}>
              <CheckCircle size={20} color={COLORS.gold} />
              <Text style={styles.statValue}>
                {formatCurrency(partnershipStatus.available_balance)}
              </Text>
              <Text style={styles.statLabel}>Khả dụng</Text>
            </View>
          </View>

          {/* Footer Buttons */}
          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => navigation.navigate('AffiliateDetail')}
            >
              <Text style={styles.detailButtonText}>Xem Chi Tiết</Text>
              <ChevronRight size={18} color={COLORS.gold} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.withdrawButton}
              onPress={() => navigation.navigate('WithdrawRequest')}
            >
              <Text style={styles.withdrawButtonText}>Rút Tiền</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Fallback
  return null;
}

const styles = StyleSheet.create({
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    marginBottom: SPACING.md,
    marginLeft: 4,
  },

  // Loading
  loadingCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },

  // ═══════════════════════════════════════════════════════════════
  // SCENARIO 1: Registration Card
  // ═══════════════════════════════════════════════════════════════
  registrationCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  registrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  registrationHeaderText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  registrationTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  registrationSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  programsContainer: {
    gap: SPACING.md,
  },
  programCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  ctvCard: {
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  programTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  rateBadge: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ctvBadge: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
  },
  rateText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  programDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  programFeatures: {
    marginBottom: SPACING.md,
  },
  featureText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  eligibleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(58, 247, 166, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: SPACING.md,
    gap: 6,
  },
  eligibleText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.success,
  },
  notEligibleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: SPACING.md,
    gap: 6,
  },
  notEligibleText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  programButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.burgundy,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    gap: SPACING.xs,
  },
  ctvButton: {
    backgroundColor: COLORS.purple,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.7,
  },
  programButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  // ═══════════════════════════════════════════════════════════════
  // SCENARIO 2: Pending Card
  // ═══════════════════════════════════════════════════════════════
  pendingCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  pendingInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  pendingTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  pendingSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  pendingDetails: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  pendingNote: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // ═══════════════════════════════════════════════════════════════
  // SCENARIO 3: Rejected Card
  // ═══════════════════════════════════════════════════════════════
  rejectedCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  rejectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  rejectedInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  rejectedTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.error,
  },
  rejectedSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  rejectionReasonBox: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  rejectionLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  rejectionReason: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.error,
  },
  rejectedNote: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: COLORS.burgundy,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  // ═══════════════════════════════════════════════════════════════
  // SCENARIO 4: Partner Card (Approved)
  // ═══════════════════════════════════════════════════════════════
  partnerCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  partnerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  codeLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  codeValue: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    marginTop: 2,
  },
  tierBadge: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  tierText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.purple,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  copyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.burgundy,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    gap: SPACING.xs,
  },
  copyButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  linkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: SPACING.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gold,
    gap: SPACING.xs,
  },
  linkButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  detailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: SPACING.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gold,
    gap: SPACING.xs,
  },
  detailButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  withdrawButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    borderRadius: 10,
  },
  withdrawButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDark,
  },
});
