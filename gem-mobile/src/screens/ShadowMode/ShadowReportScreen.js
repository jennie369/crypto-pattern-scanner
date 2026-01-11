/**
 * ShadowReportScreen - View detailed shadow mode report
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
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Target,
  Award,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../utils/tokens';
import shadowModeService from '../../services/shadowModeService';

const ShadowReportScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { reportId } = route.params || {};

  // State
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  // Load report
  useEffect(() => {
    const loadReport = async () => {
      if (!reportId) {
        setError('Không tìm thấy báo cáo');
        setLoading(false);
        return;
      }

      try {
        const data = await shadowModeService.getReport(reportId);
        setReport(data);
      } catch (err) {
        console.error('[ShadowReport] Load error:', err);
        setError('Không thể tải báo cáo');
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [reportId]);

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

  // Get severity label
  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'critical':
        return 'Nghiêm trọng';
      case 'warning':
        return 'Cảnh báo';
      default:
        return 'Bình thường';
    }
  };

  // Loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#0F1030', '#1A1B4B', '#0F1030']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.cyan} />
            <Text style={styles.loadingText}>Đang tải báo cáo...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Error
  if (error || !report) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#0F1030', '#1A1B4B', '#0F1030']} style={styles.gradient}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color={COLORS.textPrimary} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Báo cáo</Text>
            <View style={styles.headerRight} />
          </View>
          <View style={styles.errorContainer}>
            <AlertTriangle size={48} color={COLORS.error} strokeWidth={1.5} />
            <Text style={styles.errorText}>{error || 'Không tìm thấy báo cáo'}</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const issues = report.ai_issues || [];
  const recommendations = report.ai_recommendations || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#0F1030', '#1A1B4B', '#0F1030']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={COLORS.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Báo cáo {report.report_type === 'weekly' ? 'Tuần' : 'Tháng'}
          </Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Period */}
          <View style={styles.periodCard}>
            <Calendar size={18} color={COLORS.textMuted} strokeWidth={2} />
            <Text style={styles.periodText}>
              {formatDate(report.period_start)} - {formatDate(report.period_end)}
            </Text>
          </View>

          {/* Severity Badge */}
          <View style={[
            styles.severityBadge,
            { backgroundColor: getSeverityColor(report.ai_severity) + '20' },
          ]}>
            {report.ai_severity === 'info' ? (
              <CheckCircle size={20} color={getSeverityColor(report.ai_severity)} strokeWidth={2} />
            ) : (
              <AlertTriangle size={20} color={getSeverityColor(report.ai_severity)} strokeWidth={2} />
            )}
            <Text style={[styles.severityText, { color: getSeverityColor(report.ai_severity) }]}>
              {getSeverityLabel(report.ai_severity)}
            </Text>
          </View>

          {/* Comparison Table */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>So sánh kết quả</Text>

            <View style={styles.comparisonTable}>
              {/* Header */}
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.tableHeader]}></Text>
                <Text style={[styles.tableCell, styles.tableHeader, styles.tableCenter]}>Paper</Text>
                <Text style={[styles.tableCell, styles.tableHeader, styles.tableCenter]}>Gap</Text>
                <Text style={[styles.tableCell, styles.tableHeader, styles.tableCenter]}>Real</Text>
              </View>

              {/* PnL */}
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Lợi nhuận</Text>
                <Text style={[styles.tableCell, styles.tableCenter, styles.tableValue]}>
                  ${(report.paper_total_pnl?.toFixed(0) || '0').replace('.', ',')}
                </Text>
                <Text style={[
                  styles.tableCell,
                  styles.tableCenter,
                  styles.tableGap,
                  { color: report.pnl_gap_percent < 0 ? COLORS.error : COLORS.success },
                ]}>
                  {report.pnl_gap_percent > 0 ? '+' : ''}{(report.pnl_gap_percent?.toFixed(1) || '0').replace('.', ',')}%
                </Text>
                <Text style={[styles.tableCell, styles.tableCenter, styles.tableValue]}>
                  ${(report.real_total_pnl?.toFixed(0) || '0').replace('.', ',')}
                </Text>
              </View>

              {/* Win Rate */}
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Tỷ lệ thắng</Text>
                <Text style={[styles.tableCell, styles.tableCenter, styles.tableValue]}>
                  {(report.paper_win_rate?.toFixed(1) || '0').replace('.', ',')}%
                </Text>
                <Text style={[
                  styles.tableCell,
                  styles.tableCenter,
                  styles.tableGap,
                  { color: report.win_rate_gap < 0 ? COLORS.error : COLORS.success },
                ]}>
                  {report.win_rate_gap > 0 ? '+' : ''}{(report.win_rate_gap?.toFixed(1) || '0').replace('.', ',')}%
                </Text>
                <Text style={[styles.tableCell, styles.tableCenter, styles.tableValue]}>
                  {(report.real_win_rate?.toFixed(1) || '0').replace('.', ',')}%
                </Text>
              </View>

              {/* Trades Count */}
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Số lệnh</Text>
                <Text style={[styles.tableCell, styles.tableCenter, styles.tableValue]}>
                  {report.paper_trades_count || 0}
                </Text>
                <Text style={[styles.tableCell, styles.tableCenter, styles.tableGap]}>-</Text>
                <Text style={[styles.tableCell, styles.tableCenter, styles.tableValue]}>
                  {report.real_trades_count || 0}
                </Text>
              </View>

              {/* Avg Win */}
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>TB thắng</Text>
                <Text style={[styles.tableCell, styles.tableCenter, { color: COLORS.success }]}>
                  +${(report.paper_avg_win?.toFixed(0) || '0').replace('.', ',')}
                </Text>
                <Text style={[styles.tableCell, styles.tableCenter, styles.tableGap]}>-</Text>
                <Text style={[styles.tableCell, styles.tableCenter, { color: COLORS.success }]}>
                  +${(report.real_avg_win?.toFixed(0) || '0').replace('.', ',')}
                </Text>
              </View>

              {/* Avg Loss */}
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>TB thua</Text>
                <Text style={[styles.tableCell, styles.tableCenter, { color: COLORS.error }]}>
                  ${(report.paper_avg_loss?.toFixed(0) || '0').replace('.', ',')}
                </Text>
                <Text style={[styles.tableCell, styles.tableCenter, styles.tableGap]}>-</Text>
                <Text style={[styles.tableCell, styles.tableCenter, { color: COLORS.error }]}>
                  ${(report.real_avg_loss?.toFixed(0) || '0').replace('.', ',')}
                </Text>
              </View>
            </View>
          </View>

          {/* Issues */}
          {issues.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vấn đề phát hiện</Text>
              {issues.map((issue, index) => (
                <View
                  key={index}
                  style={[
                    styles.issueCard,
                    { borderLeftColor: getSeverityColor(issue.severity) },
                  ]}
                >
                  <AlertTriangle
                    size={16}
                    color={getSeverityColor(issue.severity)}
                    strokeWidth={2}
                  />
                  <Text style={styles.issueText}>{issue.message}</Text>
                </View>
              ))}
            </View>
          )}

          {/* AI Analysis */}
          {report.ai_analysis && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Phân tích AI</Text>
              <View style={styles.analysisCard}>
                <Info size={18} color={COLORS.cyan} strokeWidth={2} />
                <Text style={styles.analysisText}>{report.ai_analysis}</Text>
              </View>
            </View>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Khuyến nghị</Text>
              {recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationCard}>
                  <Zap size={16} color={COLORS.purple} strokeWidth={2} />
                  <Text style={styles.recommendationText}>
                    {rec.message || rec.action}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Karma Impact */}
          {report.karma_adjustment !== 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tác động Karma</Text>
              <View style={[
                styles.karmaCard,
                {
                  backgroundColor: report.karma_adjustment > 0
                    ? 'rgba(58, 247, 166, 0.1)'
                    : 'rgba(220, 38, 38, 0.1)',
                },
              ]}>
                <Award
                  size={24}
                  color={report.karma_adjustment > 0 ? COLORS.success : COLORS.error}
                  strokeWidth={2}
                />
                <View style={styles.karmaContent}>
                  <Text style={[
                    styles.karmaValue,
                    { color: report.karma_adjustment > 0 ? COLORS.success : COLORS.error },
                  ]}>
                    {report.karma_adjustment > 0 ? '+' : ''}{report.karma_adjustment} Karma
                  </Text>
                  {report.karma_reason && (
                    <Text style={styles.karmaReason}>{report.karma_reason}</Text>
                  )}
                </View>
              </View>
            </View>
          )}
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
    padding: SPACING.lg,
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },

  // Period
  periodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  periodText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
  },

  // Severity Badge
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    alignSelf: 'center',
    marginBottom: SPACING.xl,
  },
  severityText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },

  // Section
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },

  // Comparison Table
  comparisonTable: {
    backgroundColor: 'rgba(15, 16, 48, 0.5)',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  tableCell: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  tableHeader: {
    color: COLORS.textMuted,
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tableCenter: {
    textAlign: 'center',
  },
  tableValue: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  tableGap: {
    fontWeight: '700',
  },

  // Issues
  issueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(15, 16, 48, 0.5)',
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  issueText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    flex: 1,
  },

  // Analysis
  analysisCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
  },
  analysisText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    flex: 1,
    lineHeight: 22,
  },

  // Recommendations
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
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

  // Karma
  karmaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  karmaContent: {
    flex: 1,
  },
  karmaValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  karmaReason: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
  },
});

export default ShadowReportScreen;
