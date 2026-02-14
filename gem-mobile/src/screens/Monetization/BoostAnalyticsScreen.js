/**
 * Gemral - Boost Analytics Screen
 * Shows analytics for a boost campaign
 * Dark glass theme
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Zap, Eye, TrendingUp, Clock, Target, Users, MousePointer, Heart, MessageCircle } from 'lucide-react-native';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { CONTENT_BOTTOM_PADDING } from '../../constants/layout';
import boostService from '../../services/boostService';

export default function BoostAnalyticsScreen({ navigation, route }) {
  const { campaignId } = route.params || {};
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaign();
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      const result = await boostService.getCampaignAnalytics(campaignId);
      if (result.success) {
        setCampaign(result.data);
      } else {
        console.error('[BoostAnalytics] Error:', result.error);
      }
    } catch (error) {
      console.error('[BoostAnalytics] Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'completed':
        return COLORS.textMuted;
      default:
        return COLORS.textMuted;
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradient}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      </LinearGradient>
    );
  }

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
          <Text style={styles.headerTitle}>Phân Tích Boost</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(campaign?.status)}20` }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(campaign?.status) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(campaign?.status) }]}>
                  {campaign?.status === 'active' ? 'Đang chạy' : campaign?.status}
                </Text>
              </View>
              <Text style={styles.packageName}>{campaign?.package_name}</Text>
            </View>
            <View style={styles.dateRow}>
              <Clock size={14} color={COLORS.textMuted} />
              <Text style={styles.dateText}>
                {formatDate(campaign?.start_date)} - {formatDate(campaign?.end_date)}
              </Text>
            </View>
          </View>

          {/* Main Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Eye size={24} color={COLORS.gold} />
              <Text style={styles.statValue}>{campaign?.impressions?.toLocaleString() || 0}</Text>
              <Text style={styles.statLabel}>Lượt xem</Text>
            </View>
            <View style={styles.statCard}>
              <MousePointer size={24} color={COLORS.gold} />
              <Text style={styles.statValue}>{campaign?.clicks?.toLocaleString() || 0}</Text>
              <Text style={styles.statLabel}>Lượt click</Text>
            </View>
            <View style={styles.statCard}>
              <Heart size={24} color={COLORS.gold} />
              <Text style={styles.statValue}>{campaign?.reactions?.toLocaleString() || 0}</Text>
              <Text style={styles.statLabel}>Reactions</Text>
            </View>
            <View style={styles.statCard}>
              <MessageCircle size={24} color={COLORS.gold} />
              <Text style={styles.statValue}>{campaign?.comments?.toLocaleString() || 0}</Text>
              <Text style={styles.statLabel}>Comments</Text>
            </View>
            <View style={styles.statCard}>
              <Users size={24} color={COLORS.gold} />
              <Text style={styles.statValue}>{campaign?.reach?.toLocaleString() || 0}</Text>
              <Text style={styles.statLabel}>{campaign?.reachEstimated ? 'Reach (Ước tính)' : 'Reach'}</Text>
            </View>
            <View style={styles.statCard}>
              <TrendingUp size={24} color={COLORS.gold} />
              <Text style={styles.statValue}>{campaign?.engagement_rate || 0}%</Text>
              <Text style={styles.statLabel}>Engagement</Text>
            </View>
          </View>

          {/* Daily Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thống kê theo ngày</Text>
            {campaign?.daily_stats?.map((day, index) => (
              <View key={index} style={styles.dayRow}>
                <Text style={styles.dayLabel}>{day.date}</Text>
                <View style={styles.dayStats}>
                  <View style={styles.dayStat}>
                    <Eye size={14} color={COLORS.textMuted} />
                    <Text style={styles.dayStatValue}>{day.impressions}</Text>
                  </View>
                  <View style={styles.dayStat}>
                    <MousePointer size={14} color={COLORS.textMuted} />
                    <Text style={styles.dayStatValue}>{day.clicks}</Text>
                  </View>
                  <View style={styles.dayStat}>
                    <Heart size={14} color={COLORS.textMuted} />
                    <Text style={styles.dayStatValue}>{day.reactions}</Text>
                  </View>
                  <View style={styles.dayStat}>
                    <MessageCircle size={14} color={COLORS.textMuted} />
                    <Text style={styles.dayStatValue}>{day.comments}</Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min((day.impressions / Math.max(campaign?.impressions || 1, 1)) * 100 * (campaign?.daily_stats?.length || 1), 100)}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <Zap size={20} color={COLORS.gold} />
            <Text style={styles.tipsText}>
              Bài viết của bạn đang hoạt động tốt! Lượt tương tác cao hơn trung bình 15%.
            </Text>
          </View>

          <View style={{ height: CONTENT_BOTTOM_PADDING }} />
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: SPACING.lg,
  },
  statusCard: {
    backgroundColor: GLASS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  packageName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dateText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: '47%',
    backgroundColor: GLASS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  section: {
    backgroundColor: GLASS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  dayRow: {
    marginBottom: SPACING.md,
  },
  dayLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  dayStats: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  dayStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayStatValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
  },
  tipsText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
