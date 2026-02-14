/**
 * GEM Mobile - Affiliate Detail Screen v3.0
 * Full affiliate dashboard with stats, commission history, tier progress
 * Reference: GEM_PARTNERSHIP_OFFICIAL_POLICY_V3.md
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import alertService from '../../services/alertService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import {
  ArrowLeft,
  Copy,
  Share2,
  DollarSign,
  Users,
  TrendingUp,
  Award,
  ChevronRight,
  Gift,
  Star,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { generateSmartLink } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import {
  CTV_TIER_CONFIG,
  CTV_TIER_ORDER,
  KOL_CONFIG,
  getTierConfig,
  calculateTierProgress,
  formatTierDisplay,
} from '../../constants/partnershipConstants';

// v3.0 Tier thresholds (VND)
const TIER_THRESHOLDS = {
  bronze: 0,           // 0
  silver: 50000000,    // 50M
  gold: 150000000,     // 150M
  platinum: 400000000, // 400M
  diamond: 800000000,  // 800M
};

// v3.0 Tier colors from constants
const TIER_COLORS = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#00F0FF',
};

// v3.0 Commission rates
const COMMISSION_RATES = {
  kol: { digital: 20, physical: 20 },
  ctv: {
    bronze: { digital: 10, physical: 6 },
    silver: { digital: 15, physical: 8 },
    gold: { digital: 20, physical: 10 },
    platinum: { digital: 25, physical: 12 },
    diamond: { digital: 30, physical: 15 },
  },
};

// v3.0 Sub-affiliate rates
const SUB_AFFILIATE_RATES = {
  kol: 3.5,
  bronze: 2,
  silver: 2.5,
  gold: 3,
  platinum: 3.5,
  diamond: 4,
};

export default function AffiliateDetailScreen({ route, navigation }) {
  const { fromGemMaster = false } = route?.params || {};
  const { user } = useAuth();

  // Handle back navigation - if came from GemMaster, go back to GemMaster tab
  const handleGoBack = () => {
    if (fromGemMaster) {
      navigation.navigate('GemMaster');
    } else {
      navigation.goBack();
    }
  };

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalCommission: 0,
    pendingCommission: 0,
    paidCommission: 0,
    totalReferrals: 0,
    convertedReferrals: 0,
    thisMonthSales: 0,
    thisMonthCommission: 0,
  });
  const [commissionHistory, setCommissionHistory] = useState([]);

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Get affiliate profile
      const { data: profileData } = await supabase
        .from('affiliate_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfile(profileData);

      // Get commission stats
      const { data: commissions } = await supabase
        .from('affiliate_commissions')
        .select('*')
        .eq('affiliate_id', user.id);

      // Get referrals
      const { data: referrals } = await supabase
        .from('affiliate_referrals')
        .select('*')
        .eq('affiliate_id', user.id);

      // Calculate stats
      const total = commissions?.reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;
      const pending = commissions?.filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;
      const paid = commissions?.filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;

      // This month stats
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthCommissions = commissions?.filter(c =>
        new Date(c.created_at) >= startOfMonth
      ) || [];
      const thisMonthTotal = thisMonthCommissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0);

      setStats({
        totalCommission: total,
        pendingCommission: pending,
        paidCommission: paid,
        totalReferrals: referrals?.length || 0,
        convertedReferrals: referrals?.filter(r => r.status === 'converted').length || 0,
        thisMonthSales: profileData?.total_sales || 0,
        thisMonthCommission: thisMonthTotal,
      });

      // Get recent commission history
      const { data: history } = await supabase
        .from('affiliate_commissions')
        .select('*')
        .eq('affiliate_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      setCommissionHistory(history || []);

    } catch (error) {
      console.error('[AffiliateDetail] Load error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const copyReferralCode = async () => {
    try {
      const { affiliateService } = require('../../services/affiliateService');
      const code = await affiliateService.getReferralCode(user?.id);
      if (!code) throw new Error('No code');
      await Clipboard.setStringAsync(code);
      alertService.success('Thành công', `Đã sao chép mã giới thiệu: ${code}`);
    } catch (error) {
      alertService.error('Lỗi', 'Không thể sao chép');
    }
  };

  const copyReferralLink = async () => {
    try {
      const { affiliateService } = require('../../services/affiliateService');
      const code = await affiliateService.getReferralCode(user?.id);
      if (!code) throw new Error('No code');
      const link = generateSmartLink(`/?ref=${code}`);
      await Clipboard.setStringAsync(link);
      alertService.success('Thành công', 'Đã sao chép link giới thiệu!');
    } catch (error) {
      alertService.error('Lỗi', 'Không thể sao chép');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0';
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getCurrentTier = () => {
    return profile?.ctv_tier || 'bronze';
  };

  const getNextTier = () => {
    const current = getCurrentTier();
    const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const idx = tiers.indexOf(current);
    return idx < tiers.length - 1 ? tiers[idx + 1] : null;
  };

  const getTierProgress = () => {
    const totalSales = profile?.total_sales || 0;
    const nextTier = getNextTier();
    if (!nextTier) return 100;

    const currentThreshold = TIER_THRESHOLDS[getCurrentTier()] || 0;
    const nextThreshold = TIER_THRESHOLDS[nextTier];
    if (!nextThreshold) return 100;
    const progress = ((totalSales - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getCommissionRate = () => {
    const role = profile?.role || 'ctv';
    const tier = getCurrentTier();

    if (role === 'kol') {
      return COMMISSION_RATES.kol;
    }

    return COMMISSION_RATES.ctv[tier] || COMMISSION_RATES.ctv.bronze;
  };

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Referral code display - uses profile data if available, fallback for render
  const referralCode = profile?.referral_code || profile?.affiliate_code || 'GEM' + (user?.id?.slice(0, 6) || '').toUpperCase();
  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const tierProgress = getTierProgress();
  const rates = getCommissionRate();

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chương Trình Affiliate</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Referral Code Card */}
          <View style={styles.referralCard}>
            <View style={styles.referralHeader}>
              <Share2 size={28} color={COLORS.gold} />
              <View style={styles.referralInfo}>
                <Text style={styles.referralLabel}>Mã giới thiệu của bạn</Text>
                <Text style={styles.referralCode}>{referralCode}</Text>
              </View>
            </View>

            <View style={styles.referralActions}>
              <TouchableOpacity style={styles.copyButton} onPress={copyReferralCode}>
                <Copy size={18} color={COLORS.textPrimary} />
                <Text style={styles.copyButtonText}>Copy mã</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.copyButton, styles.copyLinkButton]} onPress={copyReferralLink}>
                <Share2 size={18} color={COLORS.gold} />
                <Text style={[styles.copyButtonText, { color: COLORS.gold }]}>Copy link</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tier & Role Card */}
          <View style={styles.tierCard}>
            <View style={styles.tierHeader}>
              <Award size={24} color={COLORS.gold} />
              <View style={styles.tierInfo}>
                <Text style={styles.tierRole}>{profile?.role?.toUpperCase() || 'AFFILIATE'}</Text>
                <Text style={[styles.tierName, { color: TIER_COLORS[currentTier] }]}>
                  {currentTier.toUpperCase()}
                </Text>
              </View>
              <View style={styles.ratesBadge}>
                <Text style={styles.ratesText}>Digital: {rates.digital}%</Text>
                <Text style={styles.ratesText}>Physical: {rates.physical}%</Text>
              </View>
            </View>

            {/* Progress to next tier */}
            {nextTier && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>
                    Tiến độ lên {nextTier.toUpperCase()}
                  </Text>
                  <Text style={styles.progressPercent}>{Math.round(tierProgress)}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${tierProgress}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {formatCurrency(profile?.total_sales || 0)} / {formatCurrency(TIER_THRESHOLDS[nextTier])} VND
                </Text>
              </View>
            )}
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <DollarSign size={24} color={COLORS.gold} />
              <Text style={styles.statValue}>{formatCurrency(stats.totalCommission)}</Text>
              <Text style={styles.statLabel}>Tổng hoa hồng</Text>
            </View>
            <View style={styles.statCard}>
              <TrendingUp size={24} color={COLORS.gold} />
              <Text style={styles.statValue}>{formatCurrency(stats.pendingCommission)}</Text>
              <Text style={styles.statLabel}>Chờ thanh toán</Text>
            </View>
            <View style={styles.statCard}>
              <Users size={24} color={COLORS.gold} />
              <Text style={styles.statValue}>{stats.totalReferrals}</Text>
              <Text style={styles.statLabel}>Người giới thiệu</Text>
            </View>
            <View style={styles.statCard}>
              <Gift size={24} color={COLORS.gold} />
              <Text style={styles.statValue}>{stats.convertedReferrals}</Text>
              <Text style={styles.statLabel}>Đã mua hàng</Text>
            </View>
          </View>

          {/* This Month Stats */}
          <View style={styles.monthCard}>
            <View style={styles.monthHeader}>
              <Star size={20} color={COLORS.gold} />
              <Text style={styles.monthTitle}>Tháng này</Text>
            </View>
            <View style={styles.monthStats}>
              <View style={styles.monthStat}>
                <Text style={styles.monthValue}>{formatCurrency(stats.thisMonthCommission)}</Text>
                <Text style={styles.monthLabel}>Hoa hồng</Text>
              </View>
              <View style={styles.monthDivider} />
              <View style={styles.monthStat}>
                <Text style={styles.monthValue}>{formatCurrency(stats.thisMonthSales)}</Text>
                <Text style={styles.monthLabel}>Doanh số</Text>
              </View>
            </View>
          </View>

          {/* Commission History */}
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Lịch sử hoa hồng</Text>

            {commissionHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <DollarSign size={40} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Chưa có hoa hồng</Text>
              </View>
            ) : (
              commissionHistory.map((item, index) => (
                <View key={item.id || index} style={styles.historyItem}>
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyAmount}>
                      +{formatCurrency(item.commission_amount)} VND
                    </Text>
                    <Text style={styles.historyDate}>{formatDate(item.created_at)}</Text>
                  </View>
                  <View style={[
                    styles.historyStatus,
                    { backgroundColor: item.status === 'paid' ? `${COLORS.success}20` : `${COLORS.warning}20` }
                  ]}>
                    <Text style={[
                      styles.historyStatusText,
                      { color: item.status === 'paid' ? COLORS.success : COLORS.warning }
                    ]}>
                      {item.status === 'paid' ? 'Đã trả' : 'Chờ'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButton: { padding: 8 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Referral Card
  referralCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  referralInfo: { marginLeft: SPACING.md },
  referralLabel: { fontSize: 12, color: COLORS.textMuted },
  referralCode: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gold,
    marginTop: 4,
  },
  referralActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  copyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.burgundy,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    gap: 8,
  },
  copyLinkButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Tier Card
  tierCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierInfo: { flex: 1, marginLeft: SPACING.md },
  tierRole: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  tierName: { fontSize: 20, fontWeight: '700', marginTop: 2 },
  ratesBadge: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  ratesText: { fontSize: 11, color: COLORS.gold, fontWeight: '600' },
  progressSection: { marginTop: SPACING.lg },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: { fontSize: 12, color: COLORS.textMuted },
  progressPercent: { fontSize: 12, color: COLORS.gold, fontWeight: '600' },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
    textAlign: 'right',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: GLASS.background,
    borderRadius: 14,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Month Card
  monthCard: {
    backgroundColor: GLASS.background,
    borderRadius: 14,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  monthTitle: { fontSize: 14, fontWeight: '600', color: COLORS.gold },
  monthStats: { flexDirection: 'row', alignItems: 'center' },
  monthStat: { flex: 1, alignItems: 'center' },
  monthValue: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  monthLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  monthDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  // History Section
  historySection: { marginBottom: SPACING.lg },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gold,
    marginBottom: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: GLASS.background,
    borderRadius: 14,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
  },
  historyLeft: {},
  historyAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gold,
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  historyStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  historyStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
