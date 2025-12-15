/**
 * ShadowModeScreen - Main shadow mode dashboard
 * Compare paper trades vs real trades
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Link2,
  Unlink,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../utils/tokens';
import shadowModeService from '../../services/shadowModeService';
import binanceApiService from '../../services/binanceApiService';
import { AIAvatarOrb } from '../../components/AITrader';
import alertService from '../../services/alertService';

const ShadowModeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  // Load data
  const loadData = useCallback(async () => {
    try {
      if (!user?.id) return;

      const data = await shadowModeService.getQuickSummary(user.id);
      setSummary(data);
      setError(null);
    } catch (err) {
      console.error('[ShadowMode] Load error:', err);
      setError('Không thể tải dữ liệu');
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    init();
  }, [loadData]);

  // Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Sync trades
  const handleSync = async () => {
    try {
      setSyncing(true);
      const result = await shadowModeService.syncTrades(user?.id, 30);
      alertService.success('Đồng bộ thành công', `Đã đồng bộ ${result.synced} giao dịch`);
      await loadData();
    } catch (err) {
      alertService.error('Lỗi', err.message || 'Không thể đồng bộ');
    } finally {
      setSyncing(false);
    }
  };

  // Generate report
  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      await shadowModeService.generateReport(user?.id, 'weekly');
      alertService.success('Tạo báo cáo', 'Báo cáo đã được tạo');
      await loadData();
    } catch (err) {
      alertService.error('Lỗi', err.message || 'Không thể tạo báo cáo');
    } finally {
      setLoading(false);
    }
  };

  // Disconnect
  const handleDisconnect = async () => {
    alertService.confirm(
      'Ngắt kết nối',
      'Bạn có chắc muốn ngắt kết nối Binance?',
      async () => {
        try {
          await binanceApiService.removeConnection(user?.id);
          await loadData();
          alertService.success('Đã ngắt kết nối', 'Kết nối Binance đã được xóa');
        } catch (err) {
          alertService.error('Lỗi', err.message);
        }
      }
    );
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return COLORS.error;
      case 'warning':
        return COLORS.warning;
      default:
        return COLORS.success;
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Render not connected state
  const renderNotConnected = () => (
    <View style={styles.notConnectedContainer}>
      {/* AI Avatar */}
      <View style={styles.avatarContainer}>
        <AIAvatarOrb mood="calm" size="large" isAnimating={true} showGlow={true} />
      </View>

      {/* Description */}
      <Text style={styles.notConnectedTitle}>Shadow Mode</Text>
      <Text style={styles.notConnectedDesc}>
        So sánh kết quả Paper Trade với giao dịch thực từ Binance.
        Phát hiện sự khác biệt về tâm lý và kỷ luật.
      </Text>

      {/* Security note */}
      <View style={styles.securityNote}>
        <Shield size={20} color={COLORS.success} strokeWidth={2} />
        <Text style={styles.securityText}>
          Chỉ sử dụng API READ-ONLY. Không thể thực hiện giao dịch hay rút tiền.
        </Text>
      </View>

      {/* Connect button */}
      <TouchableOpacity
        style={styles.connectBtn}
        onPress={() => navigation.navigate('ConnectBinance')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.purple, COLORS.cyan]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.connectBtnGradient}
        >
          <Link2 size={20} color={COLORS.textPrimary} strokeWidth={2} />
          <Text style={styles.connectBtnText}>Kết nối Binance</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // Render connected state
  const renderConnected = () => {
    const { status, stats, analysis, recentReports } = summary || {};
    const paper = stats?.paper || {};
    const real = stats?.real || {};
    const gaps = stats?.gaps || {};

    return (
      <View style={styles.connectedContainer}>
        {/* Connection Card */}
        <View style={styles.connectionCard}>
          <View style={styles.connectionHeader}>
            <View style={styles.connectionStatus}>
              <CheckCircle size={18} color={COLORS.success} strokeWidth={2} />
              <Text style={styles.connectionLabel}>Binance đã kết nối</Text>
            </View>
            <TouchableOpacity
              style={styles.disconnectBtn}
              onPress={handleDisconnect}
            >
              <Unlink size={16} color={COLORS.error} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.connectionInfo}>
            <View style={styles.connectionRow}>
              <Clock size={14} color={COLORS.textMuted} strokeWidth={2} />
              <Text style={styles.connectionText}>
                Đồng bộ: {status?.last_sync_at ? formatDate(status.last_sync_at) : 'Chưa đồng bộ'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.syncBtn, syncing && styles.syncBtnDisabled]}
            onPress={handleSync}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator size="small" color={COLORS.cyan} />
            ) : (
              <>
                <RefreshCw size={16} color={COLORS.cyan} strokeWidth={2} />
                <Text style={styles.syncBtnText}>Đồng bộ ngay</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Comparison Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>So sánh 30 ngày</Text>

          {/* Stats Table */}
          <View style={styles.statsTable}>
            {/* Header */}
            <View style={styles.statsRow}>
              <Text style={[styles.statsCell, styles.statsHeader]}></Text>
              <Text style={[styles.statsCell, styles.statsHeader, styles.statsCenter]}>Paper</Text>
              <Text style={[styles.statsCell, styles.statsHeader, styles.statsCenter]}>Gap</Text>
              <Text style={[styles.statsCell, styles.statsHeader, styles.statsCenter]}>Real</Text>
            </View>

            {/* PnL Row */}
            <View style={styles.statsRow}>
              <Text style={styles.statsCell}>PnL</Text>
              <Text style={[styles.statsCell, styles.statsCenter, styles.statsValue]}>
                ${paper.total_pnl?.toFixed(0) || 0}
              </Text>
              <Text style={[
                styles.statsCell,
                styles.statsCenter,
                styles.statsGap,
                { color: gaps.pnl_gap_percent < 0 ? COLORS.error : COLORS.success },
              ]}>
                {gaps.pnl_gap_percent > 0 ? '+' : ''}{gaps.pnl_gap_percent?.toFixed(1) || 0}%
              </Text>
              <Text style={[styles.statsCell, styles.statsCenter, styles.statsValue]}>
                ${real.total_pnl?.toFixed(0) || 0}
              </Text>
            </View>

            {/* Win Rate Row */}
            <View style={styles.statsRow}>
              <Text style={styles.statsCell}>Win Rate</Text>
              <Text style={[styles.statsCell, styles.statsCenter, styles.statsValue]}>
                {paper.win_rate?.toFixed(1) || 0}%
              </Text>
              <Text style={[
                styles.statsCell,
                styles.statsCenter,
                styles.statsGap,
                { color: gaps.win_rate_gap < 0 ? COLORS.error : COLORS.success },
              ]}>
                {gaps.win_rate_gap > 0 ? '+' : ''}{gaps.win_rate_gap?.toFixed(1) || 0}%
              </Text>
              <Text style={[styles.statsCell, styles.statsCenter, styles.statsValue]}>
                {real.win_rate?.toFixed(1) || 0}%
              </Text>
            </View>

            {/* Count Row */}
            <View style={styles.statsRow}>
              <Text style={styles.statsCell}>Số lệnh</Text>
              <Text style={[styles.statsCell, styles.statsCenter, styles.statsValue]}>
                {paper.count || 0}
              </Text>
              <Text style={[styles.statsCell, styles.statsCenter, styles.statsGap]}>
                -
              </Text>
              <Text style={[styles.statsCell, styles.statsCenter, styles.statsValue]}>
                {real.count || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Issues */}
        {analysis?.issues?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vấn đề phát hiện</Text>
            {analysis.issues.map((issue, index) => (
              <View
                key={index}
                style={[
                  styles.issueCard,
                  { borderLeftColor: getSeverityColor(issue.severity) },
                ]}
              >
                <View style={styles.issueHeader}>
                  <AlertTriangle
                    size={16}
                    color={getSeverityColor(issue.severity)}
                    strokeWidth={2}
                  />
                  <Text style={[
                    styles.issueTitle,
                    { color: getSeverityColor(issue.severity) },
                  ]}>
                    {issue.message}
                  </Text>
                </View>
                {issue.detail && (
                  <Text style={styles.issueDetail}>{issue.detail}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Recommendations */}
        {analysis?.recommendations?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Khuyến nghị</Text>
            {analysis.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationCard}>
                <Zap size={16} color={COLORS.cyan} strokeWidth={2} />
                <Text style={styles.recommendationText}>{rec.message}</Text>
                {rec.karmaBonus > 0 && (
                  <View style={styles.karmaBadge}>
                    <Text style={styles.karmaText}>+{rec.karmaBonus}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Recent Reports */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Báo cáo gần đây</Text>
            <TouchableOpacity
              style={styles.generateBtn}
              onPress={handleGenerateReport}
            >
              <FileText size={14} color={COLORS.purple} strokeWidth={2} />
              <Text style={styles.generateBtnText}>Tạo mới</Text>
            </TouchableOpacity>
          </View>

          {recentReports?.length > 0 ? (
            recentReports.map((report, index) => (
              <TouchableOpacity
                key={report.id || index}
                style={styles.reportCard}
                onPress={() => navigation.navigate('ShadowReport', { reportId: report.id })}
              >
                <View style={styles.reportInfo}>
                  <Text style={styles.reportType}>
                    {report.report_type === 'weekly' ? 'Tuần' : 'Tháng'}
                  </Text>
                  <Text style={styles.reportPeriod}>
                    {formatDate(report.period_start)} - {formatDate(report.period_end)}
                  </Text>
                </View>
                <View style={styles.reportStats}>
                  <View style={[
                    styles.reportSeverity,
                    { backgroundColor: getSeverityColor(report.ai_severity) + '20' },
                  ]}>
                    <Text style={[
                      styles.reportSeverityText,
                      { color: getSeverityColor(report.ai_severity) },
                    ]}>
                      {report.pnl_gap_percent > 0 ? '+' : ''}{report.pnl_gap_percent?.toFixed(1)}%
                    </Text>
                  </View>
                  <ChevronRight size={18} color={COLORS.textMuted} strokeWidth={2} />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>Chưa có báo cáo nào</Text>
          )}
        </View>
      </View>
    );
  };

  // Loading state
  if (loading && !summary) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#0F1030', '#1A1B4B', '#0F1030']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.cyan} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#0F1030', '#1A1B4B', '#0F1030']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={COLORS.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shadow Mode</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.cyan}
            />
          }
        >
          {summary?.enabled ? renderConnected() : renderNotConnected()}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1030',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.md,
  },

  // Not Connected
  notConnectedContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: SPACING.xl,
  },
  notConnectedTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  notConnectedDesc: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(58, 247, 166, 0.1)',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xl,
  },
  securityText: {
    color: COLORS.success,
    fontSize: FONT_SIZES.sm,
    flex: 1,
  },
  connectBtn: {
    width: '100%',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  connectBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
  },
  connectBtnText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },

  // Connected
  connectedContainer: {
    padding: SPACING.lg,
  },
  connectionCard: {
    backgroundColor: 'rgba(15, 16, 48, 0.8)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(58, 247, 166, 0.3)',
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  connectionLabel: {
    color: COLORS.success,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  disconnectBtn: {
    padding: SPACING.xs,
  },
  connectionInfo: {
    marginBottom: SPACING.md,
  },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  connectionText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
  },
  syncBtnDisabled: {
    opacity: 0.6,
  },
  syncBtnText: {
    color: COLORS.cyan,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },

  // Section
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },

  // Stats Table
  statsTable: {
    backgroundColor: 'rgba(15, 16, 48, 0.5)',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  statsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  statsCell: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  statsHeader: {
    color: COLORS.textMuted,
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statsCenter: {
    textAlign: 'center',
  },
  statsValue: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  statsGap: {
    fontWeight: '700',
  },

  // Issues
  issueCard: {
    backgroundColor: 'rgba(15, 16, 48, 0.5)',
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  issueTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    flex: 1,
  },
  issueDetail: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
    marginLeft: 24,
  },

  // Recommendations
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  recommendationText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    flex: 1,
  },
  karmaBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  karmaText: {
    color: '#000',
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },

  // Reports
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  generateBtnText: {
    color: COLORS.purple,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 16, 48, 0.5)',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  reportInfo: {
    flex: 1,
  },
  reportType: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  reportPeriod: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  reportStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  reportSeverity: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: BORDER_RADIUS.sm,
  },
  reportSeverityText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
});

export default ShadowModeScreen;
