/**
 * Affiliate Section Component v3.0
 * GEM Partnership System - Reference: GEM_PARTNERSHIP_OFFICIAL_POLICY_V3.md
 *
 * Handles 4 scenarios:
 * 1. No partnership, no application - Show registration options (CTV + KOL)
 * 2. Has pending application - Show pending status
 * 3. Application rejected - Show rejection info
 * 4. Has partnership (approved) - Show affiliate code & stats
 *
 * v3.0 Changes:
 * - Removed "Affiliate 3%" option (migrated to CTV Bronze)
 * - CTV now has 5 tiers: Bronze, Silver, Gold, Platinum, Diamond
 * - CTV no longer requires course purchase
 * - Added KOL program (requires 20K+ followers)
 * - Vietnamese tier names
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../../components/CustomAlert';
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
  Star,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import { partnershipService } from '../../../services/partnershipService';
import {
  CTV_TIER_CONFIG,
  KOL_CONFIG,
  formatTierDisplay,
  getTierConfig,
} from '../../../constants/partnershipConstants';

export default function AffiliateSection({ user, navigation }) {
  const { alert, AlertComponent } = useCustomAlert();
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
      alert({ type: 'success', title: 'Thành công', message: `Đã sao chép mã giới thiệu: ${code}` });
    } catch (error) {
      alert({ type: 'error', title: 'Lỗi', message: 'Không thể sao chép mã giới thiệu' });
    }
  };

  const handleCopyLink = async (code) => {
    try {
      const link = partnershipService.getReferralLink(code);
      await Clipboard.setStringAsync(link);
      alert({ type: 'success', title: 'Thành công', message: 'Đã sao chép link giới thiệu!' });
    } catch (error) {
      alert({ type: 'error', title: 'Lỗi', message: 'Không thể sao chép link' });
    }
  };

  // v3.0: CTV no longer requires course purchase - open to everyone
  const handleCtvRegister = () => {
    navigation.navigate('PartnershipRegistration', { type: 'ctv' });
  };

  // v3.0: KOL requires 20K+ followers
  const handleKolRegister = () => {
    navigation.navigate('PartnershipRegistration', { type: 'kol' });
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
  // SCENARIO 4: Has partnership (approved) - Main dashboard
  // *** MOVED TO TOP - Check approved status FIRST before pending ***
  // Also check if application_status is 'approved' (admin approved but affiliate_profiles might not exist yet)
  // ═══════════════════════════════════════════════════════════════
  const isApproved = partnershipStatus?.has_partnership ||
                     partnershipStatus?.application_status === 'approved';

  if (isApproved) {
    // v3.0: Get role and tier from partnershipStatus
    const role = partnershipStatus.partnership_role || partnershipStatus.application_type || 'ctv';
    const isKol = role === 'kol';
    const ctvTier = partnershipStatus.ctv_tier || 'bronze';

    // v3.0: Use Vietnamese tier names from constants
    const tierConfig = getTierConfig(ctvTier);
    const tierName = isKol ? 'KOL' : `${tierConfig.icon} ${tierConfig.name}`;
    const tierColor = isKol ? '#9C27B0' : tierConfig.color;

    // Generate fallback affiliate code if not set
    const affiliateCode = partnershipStatus.affiliate_code ||
                          `GEM${user?.id?.slice(0, 6)?.toUpperCase() || 'USER'}`;

    // Check if user has pending CTV upgrade application
    const hasPendingUpgrade = partnershipStatus?.has_application &&
                               partnershipStatus?.application_status === 'pending' &&
                               partnershipStatus?.application_type === 'ctv';

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {isKol ? 'Chương Trình KOL Affiliate' : 'Chương Trình CTV 5 Cấp'}
        </Text>

        <View style={styles.partnerCard}>
          {/* Header with Code */}
          <View style={styles.partnerHeader}>
            <Share2 size={28} color={COLORS.gold} />
            <View style={styles.partnerInfo}>
              <Text style={styles.codeLabel}>Mã giới thiệu của bạn</Text>
              <Text style={styles.codeValue}>{affiliateCode}</Text>
            </View>
            <View style={[styles.tierBadge, { backgroundColor: `${tierColor}30` }]}>
              <Text style={[styles.tierText, { color: tierColor }]}>{tierName}</Text>
            </View>
          </View>

          {/* Pending CTV Upgrade Notice */}
          {hasPendingUpgrade && (
            <View style={styles.pendingUpgradeNotice}>
              <Clock size={16} color={COLORS.gold} />
              <Text style={styles.pendingUpgradeText}>
                Đơn nâng cấp CTV đang chờ duyệt
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => handleCopyCode(affiliateCode)}
            >
              <Copy size={18} color={COLORS.textPrimary} />
              <Text style={styles.copyButtonText}>Sao chép mã</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => handleCopyLink(affiliateCode)}
            >
              <ExternalLink size={18} color={COLORS.gold} />
              <Text style={styles.linkButtonText}>Sao chép link</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <DollarSign size={20} color={COLORS.gold} />
              <Text style={styles.statValue}>
                {formatCurrency(commissionStats?.totalCommission || partnershipStatus.total_commission)}
              </Text>
              <Text style={styles.statLabel}>Tổng hoa hồng</Text>
            </View>

            <View style={styles.statCard}>
              <TrendingUp size={20} color={COLORS.gold} />
              <Text style={styles.statValue}>
                {formatCurrency(commissionStats?.thisMonthCommission || 0)}
              </Text>
              <Text style={styles.statLabel}>Tháng này</Text>
            </View>

            <View style={styles.statCard}>
              <Users size={20} color={COLORS.gold} />
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
        {AlertComponent}
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // SCENARIO 1: No partnership, no application - Show registration
  // v3.0: 2 programs - CTV (5 tiers) + KOL (20K+ followers)
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

          {/* Program Options v3.0 */}
          <View style={styles.programsContainer}>
            {/* CTV Option - Open to everyone */}
            <View style={styles.programCard}>
              <View style={styles.programHeader}>
                <Text style={styles.programTitle}>CTV 5 Cấp</Text>
                <View style={styles.rateBadge}>
                  <Text style={styles.rateText}>10-30%</Text>
                </View>
              </View>
              <Text style={styles.programDesc}>Đối Tác Phát Triển - Ai cũng được tham gia</Text>
              <View style={styles.programFeatures}>
                <Text style={styles.featureText}>• Digital: 10% → 30%</Text>
                <Text style={styles.featureText}>• Physical: 6% → 15%</Text>
                <Text style={styles.featureText}>• Sub-affiliate: 2% → 4%</Text>
                <Text style={styles.featureText}>• Tự động duyệt sau 3 ngày</Text>
              </View>

              {/* v3.0: CTV open to everyone */}
              <View style={styles.eligibleBadge}>
                <Unlock size={14} color={COLORS.success} />
                <Text style={styles.eligibleText}>Mở cho tất cả!</Text>
              </View>

              <TouchableOpacity
                style={[styles.programButton, styles.ctvButton]}
                onPress={handleCtvRegister}
              >
                <Text style={styles.programButtonText}>Đăng Ký CTV</Text>
                <ChevronRight size={18} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* KOL Option - Requires 20K+ followers */}
            <View style={[styles.programCard, styles.kolCard]}>
              <View style={styles.programHeader}>
                <Text style={styles.programTitle}>KOL Affiliate</Text>
                <View style={[styles.rateBadge, styles.kolBadge]}>
                  <Text style={[styles.rateText, { color: '#9C27B0' }]}>20%</Text>
                </View>
              </View>
              <Text style={styles.programDesc}>Dành cho Influencer & Content Creator</Text>
              <View style={styles.programFeatures}>
                <Text style={styles.featureText}>• Hoa hồng 20% tất cả sản phẩm</Text>
                <Text style={styles.featureText}>• Sub-affiliate: 3.5%</Text>
                <Text style={styles.featureText}>• Thanh toán 2 lần/tháng</Text>
                <Text style={styles.featureText}>• Marketing kit đặc biệt</Text>
              </View>

              {/* KOL Requirement */}
              <View style={styles.kolRequirementBadge}>
                <Star size={14} color="#9C27B0" />
                <Text style={styles.kolRequirementText}>Yêu cầu: 20,000+ followers</Text>
              </View>

              <TouchableOpacity
                style={[styles.programButton, styles.kolButton]}
                onPress={handleKolRegister}
              >
                <Text style={styles.programButtonText}>Đăng Ký KOL</Text>
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
  // v3.0: Updated type display
  // ═══════════════════════════════════════════════════════════════
  if (partnershipStatus?.has_application && partnershipStatus?.application_status === 'pending') {
    // v3.0: Map application type to display name
    const appTypeDisplay = {
      ctv: 'CTV 5 Cấp',
      kol: 'KOL Affiliate',
      affiliate: 'CTV 5 Cấp',  // Legacy mapping
    };
    const appType = appTypeDisplay[partnershipStatus.application_type] || 'CTV 5 Cấp';
    const appDate = new Date(partnershipStatus.application_date).toLocaleDateString('vi-VN');

    // v3.0: Show auto-approve info for CTV
    const isCTV = partnershipStatus.application_type === 'ctv' || partnershipStatus.application_type === 'affiliate';
    const autoApproveDate = partnershipStatus.auto_approve_at
      ? new Date(partnershipStatus.auto_approve_at).toLocaleDateString('vi-VN')
      : null;

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

  // Fallback
  return (
    <>
      {AlertComponent}
    </>
  );
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
  kolCard: {
    borderColor: 'rgba(156, 39, 176, 0.3)',
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
  kolBadge: {
    backgroundColor: 'rgba(156, 39, 176, 0.2)',
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
  kolButton: {
    backgroundColor: '#9C27B0',
  },
  kolRequirementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(156, 39, 176, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: SPACING.md,
    gap: 6,
  },
  kolRequirementText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: '#9C27B0',
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
  // Pending CTV upgrade notice
  pendingUpgradeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  pendingUpgradeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
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
  withdrawButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
});
