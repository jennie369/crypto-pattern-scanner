/**
 * Gemral - Affiliate Welcome Screen
 * Shows congratulations when user becomes Affiliate/CTV
 * With referral code, share functionality, and navigation to resources
 * Dark glass theme
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import {
  ArrowLeft,
  Sparkles,
  Copy,
  Share2,
  BookOpen,
  Image as ImageIcon,
  BarChart3,
  ChevronRight,
  Users,
  Percent,
  Gift,
  Star,
  CheckCircle,
} from 'lucide-react-native';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

const AFFILIATE_LINK_BASE = 'https://gemral.com/r/';

export default function AffiliateWelcomeScreen({ navigation, route }) {
  const { user, profile, refreshProfile } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();
  const { partner_type, ctv_tier, isNewlyApproved } = route.params || {};

  const [affiliateCode, setAffiliateCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Determine the role from params or profile
  const partnerType = partner_type || profile?.partner_type;
  const ctvTier = ctv_tier || profile?.ctv_tier;
  const isCtv = partnerType === 'ctv';

  // Commission rates
  const commissionRate = isCtv
    ? ctvTier === 'pro'
      ? '30%'
      : ctvTier === 'advanced'
      ? '20%'
      : '10%'
    : '3%';

  useEffect(() => {
    loadAffiliateCode();
  }, []);

  const loadAffiliateCode = async () => {
    try {
      // First check profile
      if (profile?.referral_code) {
        setAffiliateCode(profile.referral_code);
        setLoading(false);
        return;
      }

      // Query from profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user?.id)
        .single();

      if (data?.referral_code) {
        setAffiliateCode(data.referral_code);
      }

      // Refresh profile to get latest
      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (error) {
      console.error('[AffiliateWelcome] Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const affiliateLink = affiliateCode ? `${AFFILIATE_LINK_BASE}${affiliateCode}` : '';

  const handleCopyCode = async () => {
    if (!affiliateCode) return;
    await Clipboard.setStringAsync(affiliateCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    alert({ type: 'success', title: 'Đã sao chép', message: 'Mã giới thiệu đã được sao chép' });
  };

  const handleCopyLink = async () => {
    if (!affiliateLink) return;
    await Clipboard.setStringAsync(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    alert({ type: 'success', title: 'Đã sao chép', message: 'Link giới thiệu đã được sao chép' });
  };

  const handleShare = async () => {
    if (!affiliateLink) return;

    try {
      const message = isCtv
        ? `Tham gia Gemral cùng mình! Sử dụng mã ${affiliateCode} để nhận ưu đãi đặc biệt. ${affiliateLink}`
        : `Tham gia Gemral! Dùng mã ${affiliateCode} khi đăng ký. ${affiliateLink}`;

      await Share.share({
        message,
        url: affiliateLink,
        title: 'Giới thiệu Gemral',
      });
    } catch (error) {
      console.error('[AffiliateWelcome] Share error:', error);
    }
  };

  // Benefits list based on role
  const benefits = isCtv
    ? [
        { icon: Percent, text: `Hoa hồng ${commissionRate} trên mỗi đơn hàng` },
        { icon: Users, text: 'Hỗ trợ tuyển dụng đội nhóm' },
        { icon: Gift, text: 'Quà tặng và bonus hàng tháng' },
        { icon: Star, text: 'Truy cập Marketing Kits Premium' },
      ]
    : [
        { icon: Percent, text: `Hoa hồng ${commissionRate} trên mỗi đơn hàng` },
        { icon: Users, text: 'Không giới hạn số người giới thiệu' },
        { icon: Gift, text: 'Thanh toán hàng tháng' },
        { icon: Star, text: 'Truy cập Marketing Kits Basic' },
      ];

  // Quick action buttons
  const quickActions = [
    {
      icon: BookOpen,
      title: 'Hướng dẫn',
      subtitle: 'Cách kiếm tiền với Affiliate',
      onPress: () => navigation.navigate('HelpCategory', { categoryId: 'affiliate' }),
      color: COLORS.purple,
    },
    {
      icon: ImageIcon,
      title: 'Marketing Kits',
      subtitle: 'Banner, hình ảnh quảng cáo',
      onPress: () => navigation.navigate('MarketingKits'),
      color: COLORS.gold,
    },
    {
      icon: BarChart3,
      title: 'Thống kê',
      subtitle: 'Xem doanh thu & hoa hồng',
      onPress: () => navigation.navigate('AffiliateDashboard'),
      color: COLORS.success,
    },
  ];

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isNewlyApproved ? 'Chào mừng' : isCtv ? 'CTV Dashboard' : 'Affiliate'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Congratulations Card */}
          <View style={styles.congratsCard}>
            <LinearGradient
              colors={['rgba(255, 189, 89, 0.2)', 'rgba(156, 6, 18, 0.2)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.congratsGradient}
            >
              <View style={styles.sparklesRow}>
                <Sparkles size={28} color={COLORS.gold} />
              </View>

              <Text style={styles.congratsTitle}>
                {isNewlyApproved
                  ? `Chúc mừng! Bạn đã trở thành ${isCtv ? 'CTV' : 'Affiliate'}`
                  : `Bạn là ${isCtv ? 'CTV' : 'Affiliate'} của Gemral`}
              </Text>

              <Text style={styles.congratsSubtitle}>
                {isCtv
                  ? `Cấp độ: ${ctvTier === 'pro' ? 'Pro' : ctvTier === 'advanced' ? 'Advanced' : 'Beginner'}`
                  : 'Bắt đầu kiếm thu nhập từ việc giới thiệu sản phẩm'}
              </Text>

              {/* Commission Badge */}
              <View style={styles.commissionBadge}>
                <Text style={styles.commissionLabel}>Hoa hồng của bạn</Text>
                <Text style={styles.commissionValue}>{commissionRate}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Affiliate Code Card */}
          <View style={styles.codeCard}>
            <Text style={styles.cardTitle}>Mã giới thiệu của bạn</Text>

            {loading ? (
              <Text style={styles.loadingText}>Đang tải...</Text>
            ) : affiliateCode ? (
              <>
                {/* Code Display */}
                <TouchableOpacity style={styles.codeBox} onPress={handleCopyCode}>
                  <Text style={styles.codeText}>{affiliateCode}</Text>
                  <View style={styles.copyIcon}>
                    {copied ? (
                      <CheckCircle size={20} color={COLORS.success} />
                    ) : (
                      <Copy size={20} color={COLORS.gold} />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Link Display */}
                <TouchableOpacity style={styles.linkBox} onPress={handleCopyLink}>
                  <Text style={styles.linkText} numberOfLines={1}>
                    {affiliateLink}
                  </Text>
                  <Copy size={16} color={COLORS.textMuted} />
                </TouchableOpacity>

                {/* Share Button */}
                <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                  <Share2 size={20} color="#112250" />
                  <Text style={styles.shareBtnText}>Chia sẻ Link</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.errorText}>
                Chưa có mã giới thiệu. Vui lòng liên hệ hỗ trợ.
              </Text>
            )}
          </View>

          {/* Benefits Card */}
          <View style={styles.benefitsCard}>
            <Text style={styles.cardTitle}>Quyền lợi của bạn</Text>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <benefit.icon size={18} color={COLORS.gold} />
                </View>
                <Text style={styles.benefitText}>{benefit.text}</Text>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Bắt đầu ngay</Text>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={action.onPress}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                  <action.icon size={24} color={action.color} />
                </View>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
                <ChevronRight size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Help Link */}
          <TouchableOpacity
            style={styles.helpLink}
            onPress={() => navigation.navigate('HelpCenter')}
          >
            <Text style={styles.helpLinkText}>Cần hỗ trợ? Truy cập Trung tâm trợ giúp</Text>
            <ChevronRight size={16} color={COLORS.purple} />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: GLASS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },

  // Congrats Card
  congratsCard: {
    borderRadius: GLASS.borderRadius,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  congratsGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  sparklesRow: {
    marginBottom: SPACING.md,
  },
  congratsTitle: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  congratsSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  commissionBadge: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    alignItems: 'center',
  },
  commissionLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  commissionValue: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },

  // Code Card
  codeCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.error,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  codeText: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    letterSpacing: 2,
  },
  copyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  linkText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  shareBtnText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#112250',
  },

  // Benefits Card
  benefitsCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
  },

  // Actions Section
  actionsSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.15)',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },

  // Help Link
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.xs,
  },
  helpLinkText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.purple,
  },
});
