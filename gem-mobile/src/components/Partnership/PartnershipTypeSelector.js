/**
 * PartnershipTypeSelector
 * Component to select between CTV and KOL registration
 * Reference: GEM_PARTNERSHIP_IMPLEMENTATION_PHASE2.md
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import {
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Clock,
  TrendingUp,
  Gift,
} from 'lucide-react-native';

import { COLORS, SPACING } from '../../theme/darkTheme';
import {
  CTV_TIER_CONFIG,
  KOL_CONFIG,
  formatPercent,
  formatTierDisplay,
} from '../../constants/partnershipConstants';

const PartnershipTypeSelector = ({ onSelectCTV, onSelectKOL, isCTV, ctvTier }) => {
  const bronzeTier = CTV_TIER_CONFIG.bronze;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chọn loại đối tác</Text>
        <Text style={styles.headerSubtitle}>
          Tham gia chương trình đối tác để nhận hoa hồng từ mỗi đơn hàng
        </Text>
      </View>

      {/* CTV Card */}
      <TouchableOpacity style={styles.optionCard} onPress={onSelectCTV} activeOpacity={0.8}>
        <View style={styles.optionHeader}>
          <View style={styles.optionIconContainer}>
            <Users size={28} color={COLORS.gold} />
          </View>
          <View style={styles.optionTitleContainer}>
            <Text style={styles.optionTitle}>Đối Tác Phát Triển (CTV)</Text>
            <Text style={styles.optionSubtitle}>Dành cho mọi người</Text>
          </View>
          <ArrowRight size={24} color={COLORS.textMuted} />
        </View>

        <View style={styles.benefitsContainer}>
          <View style={styles.benefitRow}>
            <CheckCircle size={16} color={COLORS.success} />
            <Text style={styles.benefitText}>
              Hoa hồng Digital: {formatPercent(bronzeTier.commission.digital)} -{' '}
              {formatPercent(CTV_TIER_CONFIG.diamond.commission.digital)}
            </Text>
          </View>
          <View style={styles.benefitRow}>
            <CheckCircle size={16} color={COLORS.success} />
            <Text style={styles.benefitText}>
              Hoa hồng Physical: {formatPercent(bronzeTier.commission.physical)} -{' '}
              {formatPercent(CTV_TIER_CONFIG.diamond.commission.physical)}
            </Text>
          </View>
          <View style={styles.benefitRow}>
            <TrendingUp size={16} color={COLORS.gold} />
            <Text style={styles.benefitText}>5 cấp độ: Đồng → Kim Cương</Text>
          </View>
          <View style={styles.benefitRow}>
            <Clock size={16} color={COLORS.info} />
            <Text style={styles.benefitText}>Tự động duyệt sau 3 ngày</Text>
          </View>
        </View>

        <View style={styles.tierPreview}>
          {['bronze', 'silver', 'gold', 'platinum', 'diamond'].map((tier, index) => (
            <View key={tier} style={styles.tierBadge}>
              <Text style={styles.tierIcon}>{CTV_TIER_CONFIG[tier].icon}</Text>
            </View>
          ))}
        </View>

        <View style={styles.selectButton}>
          <Text style={styles.selectButtonText}>Đăng ký CTV</Text>
        </View>
      </TouchableOpacity>

      {/* KOL Card */}
      <TouchableOpacity style={styles.optionCard} onPress={onSelectKOL} activeOpacity={0.8}>
        <View style={styles.optionHeader}>
          <View style={[styles.optionIconContainer, styles.kolIconContainer]}>
            <Star size={28} color={COLORS.purple} />
          </View>
          <View style={styles.optionTitleContainer}>
            <Text style={styles.optionTitle}>KOL Affiliate</Text>
            <Text style={styles.optionSubtitle}>Dành cho Influencer</Text>
          </View>
          <ArrowRight size={24} color={COLORS.textMuted} />
        </View>

        <View style={styles.benefitsContainer}>
          <View style={styles.benefitRow}>
            <CheckCircle size={16} color={COLORS.success} />
            <Text style={styles.benefitText}>
              Hoa hồng: {formatPercent(KOL_CONFIG.commission.digital)} (tất cả sản phẩm)
            </Text>
          </View>
          <View style={styles.benefitRow}>
            <Gift size={16} color={COLORS.purple} />
            <Text style={styles.benefitText}>
              Sub-affiliate: {formatPercent(KOL_CONFIG.subAffiliate)}
            </Text>
          </View>
          <View style={styles.benefitRow}>
            <Clock size={16} color={COLORS.info} />
            <Text style={styles.benefitText}>Thanh toán: 2 lần/tháng</Text>
          </View>
        </View>

        {/* Requirements Warning */}
        <View style={styles.requirementBox}>
          <Text style={styles.requirementTitle}>Yêu cầu:</Text>
          <Text style={styles.requirementText}>
            Tối thiểu {KOL_CONFIG.requirements.minFollowers.toLocaleString()} followers trên mạng
            xã hội
          </Text>
        </View>

        {/* CTV Status Note */}
        {isCTV && (
          <View style={styles.ctvNote}>
            <CheckCircle size={16} color={COLORS.success} />
            <Text style={styles.ctvNoteText}>
              Bạn đang là CTV {formatTierDisplay(ctvTier)}
            </Text>
          </View>
        )}

        <View style={[styles.selectButton, styles.kolSelectButton]}>
          <Text style={[styles.selectButtonText, styles.kolSelectButtonText]}>Đăng ký KOL</Text>
        </View>
      </TouchableOpacity>

      {/* Comparison Table */}
      <View style={styles.comparisonCard}>
        <Text style={styles.comparisonTitle}>So sánh nhanh</Text>

        <View style={styles.comparisonTable}>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonLabel}>Điều kiện</Text>
            <Text style={styles.comparisonValue}>Ai cũng được</Text>
            <Text style={styles.comparisonValue}>20K+ followers</Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonLabel}>Duyệt đơn</Text>
            <Text style={styles.comparisonValue}>Tự động 3 ngày</Text>
            <Text style={styles.comparisonValue}>Admin duyệt</Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonLabel}>Digital</Text>
            <Text style={styles.comparisonValue}>10-30%</Text>
            <Text style={styles.comparisonValue}>20%</Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonLabel}>Physical</Text>
            <Text style={styles.comparisonValue}>6-15%</Text>
            <Text style={styles.comparisonValue}>20%</Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonLabel}>Sub-Aff</Text>
            <Text style={styles.comparisonValue}>2-4%</Text>
            <Text style={styles.comparisonValue}>3.5%</Text>
          </View>
        </View>

        <View style={styles.comparisonHeader}>
          <View style={{ flex: 1 }} />
          <Text style={styles.comparisonHeaderText}>CTV</Text>
          <Text style={styles.comparisonHeaderText}>KOL</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  optionCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.gold + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  kolIconContainer: {
    backgroundColor: COLORS.purple + '20',
  },
  optionTitleContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  optionSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  benefitsContainer: {
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  benefitText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  tierPreview: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.bgDark,
    borderRadius: 8,
  },
  tierBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierIcon: {
    fontSize: 16,
  },
  requirementBox: {
    backgroundColor: COLORS.warning + '15',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  requirementTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.warning,
    marginBottom: 2,
  },
  requirementText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  ctvNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  ctvNoteText: {
    fontSize: 13,
    color: COLORS.success,
  },
  selectButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  kolSelectButton: {
    backgroundColor: COLORS.purple,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.bgDark,
  },
  kolSelectButtonText: {
    color: COLORS.textPrimary,
  },
  comparisonCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  comparisonHeader: {
    flexDirection: 'row',
    position: 'absolute',
    top: SPACING.md + 24,
    left: SPACING.md,
    right: SPACING.md,
  },
  comparisonHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gold,
    textAlign: 'center',
  },
  comparisonTable: {
    marginTop: SPACING.lg,
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  comparisonLabel: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  comparisonValue: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
});

export default PartnershipTypeSelector;
