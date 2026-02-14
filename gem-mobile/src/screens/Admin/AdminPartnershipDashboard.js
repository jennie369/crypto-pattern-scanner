/**
 * AdminPartnershipDashboard
 * Overview dashboard for Admin to manage Partnership System v3.0
 * Reference: GEM_PARTNERSHIP_IMPLEMENTATION_PHASE4.md
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  Users,
  Clock,
  CheckCircle,
  Star,
  TrendingUp,
  DollarSign,
  ChevronRight,
  AlertTriangle,
  Calendar,
  RefreshCw,
  Settings,
  FileText,
  Wifi,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { CONTENT_BOTTOM_PADDING } from '../../constants/layout';
import { CTV_TIER_CONFIG, formatCurrency } from '../../constants/partnershipConstants';
import ADMIN_PARTNERSHIP_SERVICE from '../../services/adminPartnershipService';
import { useAuth } from '../../contexts/AuthContext';

const AdminPartnershipDashboard = () => {
  const navigation = useNavigation();
  const { isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [triggeringJob, setTriggeringJob] = useState(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Real-time subscription refs
  const applicationsSubRef = useRef(null);
  const partnersSubRef = useRef(null);
  const commissionsSubRef = useRef(null);

  // Initial load on focus
  useFocusEffect(
    useCallback(() => {
      if (isAdmin) {
        loadDashboard();
      }
    }, [isAdmin])
  );

  // Real-time subscriptions
  useEffect(() => {
    if (!isAdmin) return;

    console.log('[AdminPartnershipDashboard] Setting up real-time subscriptions...');

    // Subscribe to applications changes
    applicationsSubRef.current = ADMIN_PARTNERSHIP_SERVICE.subscribeToApplications((payload) => {
      console.log('[AdminPartnershipDashboard] Applications update received:', payload.eventType);
      // Auto-reload dashboard on any change
      loadDashboard();
      setRealtimeConnected(true);
    });

    // Subscribe to partners changes
    partnersSubRef.current = ADMIN_PARTNERSHIP_SERVICE.subscribeToPartners((payload) => {
      console.log('[AdminPartnershipDashboard] Partners update received:', payload.eventType);
      // Auto-reload dashboard on any change
      loadDashboard();
      setRealtimeConnected(true);
    });

    // Subscribe to commissions changes (for monthly commissions stat)
    commissionsSubRef.current = ADMIN_PARTNERSHIP_SERVICE.subscribeToCommissions((payload) => {
      console.log('[AdminPartnershipDashboard] Commissions update received:', payload.eventType);
      loadDashboard();
      setRealtimeConnected(true);
    });

    setRealtimeConnected(true);

    // Cleanup subscriptions on unmount
    return () => {
      console.log('[AdminPartnershipDashboard] Cleaning up real-time subscriptions...');
      ADMIN_PARTNERSHIP_SERVICE.unsubscribe(applicationsSubRef.current);
      ADMIN_PARTNERSHIP_SERVICE.unsubscribe(partnersSubRef.current);
      ADMIN_PARTNERSHIP_SERVICE.unsubscribe(commissionsSubRef.current);
      applicationsSubRef.current = null;
      partnersSubRef.current = null;
      commissionsSubRef.current = null;
    };
  }, [isAdmin]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsResult, pendingResult] = await Promise.all([
        ADMIN_PARTNERSHIP_SERVICE.getDashboardStats(),
        ADMIN_PARTNERSHIP_SERVICE.getPendingApplications(5),
      ]);

      setStats(statsResult);
      setPendingApplications(pendingResult);
    } catch (err) {
      console.error('[AdminPartnershipDashboard] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const handleTriggerJob = async (action) => {
    setTriggeringJob(action);
    try {
      const result = await ADMIN_PARTNERSHIP_SERVICE.triggerTierEvaluation(action);
      console.log(`[AdminPartnershipDashboard] ${action} result:`, result);
      // Reload stats after job
      await loadDashboard();
    } catch (err) {
      console.error(`[AdminPartnershipDashboard] ${action} error:`, err);
    } finally {
      setTriggeringJob(null);
    }
  };

  const formatTimeRemaining = (autoApproveAt) => {
    if (!autoApproveAt) return 'N/A';
    const remaining = new Date(autoApproveAt) - new Date();
    if (remaining <= 0) return 'Sắp tự động duyệt';
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  };

  // Check admin access
  if (!isAdmin) {
    return (
      <LinearGradient colors={GRADIENTS.background} locations={GRADIENTS.backgroundLocations} style={styles.gradient}>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.loadingContainer}>
            <AlertTriangle size={48} color={COLORS.error} />
            <Text style={styles.errorText}>Không có quyền truy cập</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Loading state
  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} locations={GRADIENTS.backgroundLocations} style={styles.gradient}>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Quản Lý Partnership</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.background} locations={GRADIENTS.backgroundLocations} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Quản Lý Partnership</Text>
            {realtimeConnected && (
              <View style={styles.liveBadge}>
                <Wifi size={10} color={COLORS.success} />
                <Text style={styles.liveBadgeText}>Live</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={onRefresh}>
            <RefreshCw size={20} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: CONTENT_BOTTOM_PADDING }}
        >
          {/* Stats Overview */}
          <View style={styles.statsGrid}>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => navigation.navigate('AdminPartners')}
            >
              <Users size={24} color={COLORS.info} />
              <Text style={styles.statValue}>{stats?.totalPartners || 0}</Text>
              <Text style={styles.statLabel}>Tổng đối tác</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statCard}
              onPress={() => navigation.navigate('AdminApplications')}
            >
              <Clock size={24} color={COLORS.warning} />
              <Text style={styles.statValue}>{stats?.pendingApplications || 0}</Text>
              <Text style={styles.statLabel}>Chờ duyệt</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard}>
              <Star size={24} color="#9C27B0" />
              <Text style={styles.statValue}>{stats?.totalKOLs || 0}</Text>
              <Text style={styles.statLabel}>KOL Affiliate</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard}>
              <DollarSign size={24} color={COLORS.success} />
              <Text style={styles.statValueSmall}>
                {formatCurrency(stats?.monthlyCommissions || 0)}
              </Text>
              <Text style={styles.statLabel}>Hoa hồng tháng</Text>
            </TouchableOpacity>
          </View>

          {/* Pending by Type */}
          <View style={styles.pendingByType}>
            <TouchableOpacity
              style={styles.pendingTypeCard}
              onPress={() => navigation.navigate('AdminApplications', { filter: 'ctv' })}
            >
              <View style={[styles.pendingTypeBadge, { backgroundColor: COLORS.gold + '20' }]}>
                <Users size={20} color={COLORS.gold} />
              </View>
              <View style={styles.pendingTypeInfo}>
                <Text style={styles.pendingTypeCount}>{stats?.pendingCTV || 0}</Text>
                <Text style={styles.pendingTypeLabel}>Đơn CTV chờ duyệt</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pendingTypeCard}
              onPress={() => navigation.navigate('AdminApplications', { filter: 'kol' })}
            >
              <View style={[styles.pendingTypeBadge, { backgroundColor: '#9C27B0' + '20' }]}>
                <Star size={20} color="#9C27B0" />
              </View>
              <View style={styles.pendingTypeInfo}>
                <Text style={styles.pendingTypeCount}>{stats?.pendingKOL || 0}</Text>
                <Text style={styles.pendingTypeLabel}>Đơn KOL chờ duyệt</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Tier Distribution */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phân bổ Tier CTV</Text>
            <View style={styles.tierDistribution}>
              {Object.entries(stats?.tierDistribution || {}).map(([tier, count]) => {
                const config = CTV_TIER_CONFIG[tier];
                if (!config) return null;
                return (
                  <View key={tier} style={styles.tierItem}>
                    <View style={[styles.tierBadge, { backgroundColor: config.color + '20' }]}>
                      <Text style={styles.tierIcon}>{config.icon}</Text>
                    </View>
                    <Text style={styles.tierCount}>{count}</Text>
                    <Text style={styles.tierName}>{config.name}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Pending Applications */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Đơn chờ duyệt gần đây</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AdminApplications')}>
                <Text style={styles.seeAll}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {pendingApplications.length === 0 ? (
              <View style={styles.emptyCard}>
                <CheckCircle size={32} color={COLORS.success} />
                <Text style={styles.emptyText}>Không có đơn chờ duyệt</Text>
              </View>
            ) : (
              pendingApplications.map((app) => (
                <TouchableOpacity
                  key={app.id}
                  style={styles.applicationCard}
                  onPress={() => navigation.navigate('AdminApplicationDetail', { applicationId: app.id })}
                >
                  <View style={styles.applicationInfo}>
                    <Text style={styles.applicationName}>{app.full_name}</Text>
                    <Text style={styles.applicationEmail}>{app.email}</Text>
                    <View style={styles.applicationMeta}>
                      <View style={[
                        styles.typeBadge,
                        app.application_type === 'kol' && styles.typeBadgeKOL
                      ]}>
                        <Text style={styles.typeBadgeText}>
                          {app.application_type === 'kol' ? 'KOL' : 'CTV'}
                        </Text>
                      </View>
                      {app.application_type === 'ctv' && app.auto_approve_at && (
                        <View style={styles.autoApproveInfo}>
                          <Clock size={12} color={COLORS.textMuted} />
                          <Text style={styles.autoApproveTime}>
                            {formatTimeRemaining(app.auto_approve_at)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <ChevronRight size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('AdminApplications', { filter: 'ctv' })}
              >
                <Users size={20} color={COLORS.gold} />
                <Text style={styles.actionText}>Đơn CTV</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('AdminApplications', { filter: 'kol' })}
              >
                <Star size={20} color="#9C27B0" />
                <Text style={styles.actionText}>Đơn KOL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('AdminPartners')}
              >
                <TrendingUp size={20} color={COLORS.success} />
                <Text style={styles.actionText}>Tất cả đối tác</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('AdminPartnerResources')}
              >
                <FileText size={20} color={COLORS.info} />
                <Text style={styles.actionText}>Quản lý tài nguyên</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Scheduled Jobs (Manual Trigger) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scheduled Jobs</Text>
            <Text style={styles.sectionSubtitle}>
              Các job này tự động chạy theo lịch. Chỉ nhấn nút khi cần chạy thủ công.
            </Text>

            <TouchableOpacity
              style={[styles.jobButton, triggeringJob === 'weekly_upgrade' && styles.jobButtonActive]}
              onPress={() => handleTriggerJob('weekly_upgrade')}
              disabled={triggeringJob !== null}
            >
              <TrendingUp size={18} color={COLORS.success} />
              <View style={styles.jobInfo}>
                <Text style={styles.jobName}>Weekly Tier Upgrade</Text>
                <Text style={styles.jobSchedule}>Mỗi thứ 2, 00:00</Text>
              </View>
              {triggeringJob === 'weekly_upgrade' ? (
                <ActivityIndicator size="small" color={COLORS.gold} />
              ) : (
                <Text style={styles.jobAction}>Chạy</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.jobButton, triggeringJob === 'monthly_downgrade' && styles.jobButtonActive]}
              onPress={() => handleTriggerJob('monthly_downgrade')}
              disabled={triggeringJob !== null}
            >
              <AlertTriangle size={18} color={COLORS.warning} />
              <View style={styles.jobInfo}>
                <Text style={styles.jobName}>Monthly Tier Downgrade</Text>
                <Text style={styles.jobSchedule}>Cuối tháng, 23:59</Text>
              </View>
              {triggeringJob === 'monthly_downgrade' ? (
                <ActivityIndicator size="small" color={COLORS.gold} />
              ) : (
                <Text style={styles.jobAction}>Chạy</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.jobButton, triggeringJob === 'ctv_auto_approve' && styles.jobButtonActive]}
              onPress={() => handleTriggerJob('ctv_auto_approve')}
              disabled={triggeringJob !== null}
            >
              <CheckCircle size={18} color={COLORS.info} />
              <View style={styles.jobInfo}>
                <Text style={styles.jobName}>CTV Auto-Approve</Text>
                <Text style={styles.jobSchedule}>Mỗi giờ</Text>
              </View>
              {triggeringJob === 'ctv_auto_approve' ? (
                <ActivityIndicator size="small" color={COLORS.gold} />
              ) : (
                <Text style={styles.jobAction}>Chạy</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.jobButton, triggeringJob === 'reset_monthly_sales' && styles.jobButtonActive]}
              onPress={() => handleTriggerJob('reset_monthly_sales')}
              disabled={triggeringJob !== null}
            >
              <Calendar size={18} color={COLORS.textMuted} />
              <View style={styles.jobInfo}>
                <Text style={styles.jobName}>Reset Monthly Sales</Text>
                <Text style={styles.jobSchedule}>Ngày 1 mỗi tháng</Text>
              </View>
              {triggeringJob === 'reset_monthly_sales' ? (
                <ActivityIndicator size="small" color={COLORS.gold} />
              ) : (
                <Text style={styles.jobAction}>Chạy</Text>
              )}
            </TouchableOpacity>
          </View>
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.success,
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

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: GLASS?.card || 'rgba(30, 30, 60, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
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
  statValueSmall: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Pending by Type
  pendingByType: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  pendingTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS?.card || 'rgba(30, 30, 60, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    borderRadius: 12,
    padding: SPACING.md,
  },
  pendingTypeBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingTypeInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  pendingTypeCount: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  pendingTypeLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Sections
  section: {
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  seeAll: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
  },

  // Tier Distribution
  tierDistribution: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: GLASS?.card || 'rgba(30, 30, 60, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    borderRadius: 12,
    padding: SPACING.md,
  },
  tierItem: {
    alignItems: 'center',
  },
  tierBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierIcon: {
    fontSize: 20,
  },
  tierCount: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  tierName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Empty state
  emptyCard: {
    backgroundColor: GLASS?.card || 'rgba(30, 30, 60, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    borderRadius: 12,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },

  // Application Card
  applicationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS?.card || 'rgba(30, 30, 60, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  applicationInfo: {
    flex: 1,
  },
  applicationName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  applicationEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  applicationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  typeBadge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeKOL: {
    backgroundColor: '#9C27B0',
  },
  typeBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.bgDark,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  autoApproveInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  autoApproveTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS?.card || 'rgba(30, 30, 60, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    borderRadius: 12,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
  },

  // Job Buttons
  jobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS?.card || 'rgba(30, 30, 60, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  jobButtonActive: {
    opacity: 0.7,
  },
  jobInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  jobName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  jobSchedule: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  jobAction: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});

export default AdminPartnershipDashboard;
