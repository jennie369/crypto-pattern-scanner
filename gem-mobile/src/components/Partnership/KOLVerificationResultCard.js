/**
 * KOLVerificationResultCard
 * Displays KOL Intelligence crawl results, engagement, fraud risk, quality score per platform
 * Reference: KOL_INTELLIGENCE_PLAN_PHASE5_INTEGRATION.md
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Youtube,
  Facebook,
  Instagram,
  Twitter,
  Music,
  Shield,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react-native';

import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const PLATFORM_ICONS = {
  youtube: Youtube,
  facebook: Facebook,
  instagram: Instagram,
  tiktok: Music,
  twitter: Twitter,
};

const SCORE_COLORS = {
  PREMIUM: '#4CAF50',
  GOOD: '#2196F3',
  RISKY: '#FF9800',
  REJECT: '#F44336',
  ERROR: '#9E9E9E',
};

function getVerdict(score) {
  if (score == null) return 'ERROR';
  if (score >= 80) return 'PREMIUM';
  if (score >= 60) return 'GOOD';
  if (score >= 40) return 'RISKY';
  return 'REJECT';
}

function getVerdictColor(verdict) {
  return SCORE_COLORS[verdict] || SCORE_COLORS.ERROR;
}

function formatFollowerDiff(reported, actual) {
  if (!reported || !actual) return null;
  const diff = ((actual - reported) / reported) * 100;
  const absDiff = Math.abs(diff);
  let color = '#4CAF50';
  let icon = '\u2713';
  if (absDiff > 25) {
    color = '#F44336';
    icon = '\u2717';
  } else if (absDiff > 10) {
    color = '#FF9800';
    icon = '\u26A0';
  }
  const sign = diff > 0 ? '+' : '';
  return { text: `${icon} ${sign}${diff.toFixed(1)}%`, color };
}

function formatNumber(num) {
  if (num == null) return 'N/A';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

function timeAgo(dateString) {
  if (!dateString) return 'N/A';
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

const KOLVerificationResultCard = ({ results, summary, loading, onReverify }) => {
  const [reverifying, setReverifying] = useState(false);

  const handleReverify = async () => {
    if (!onReverify || reverifying) return;
    setReverifying(true);
    try {
      await onReverify();
    } catch (err) {
      console.error('[KOLVerificationResultCard] Re-verify error:', err);
      Alert.alert(
        'Không thể kiểm tra',
        err?.message || 'Ứng viên chưa cung cấp URL mạng xã hội. Vui lòng yêu cầu họ hoàn tất form xác minh KOL.',
      );
    } finally {
      setReverifying(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>KOL Intelligence Report</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </View>
    );
  }

  // Empty state
  if (!results || results.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>KOL Intelligence Report</Text>
          <TouchableOpacity
            style={styles.reverifyButton}
            onPress={handleReverify}
            disabled={reverifying}
          >
            {reverifying ? (
              <ActivityIndicator size="small" color={COLORS.gold} />
            ) : (
              <>
                <RefreshCw size={14} color={COLORS.gold} />
                <Text style={styles.reverifyText}>Kiểm tra</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Clock size={32} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>Chưa có dữ liệu kiểm tra</Text>
          <Text style={styles.emptySubtext}>Nhấn "Kiểm tra" để bắt đầu crawl</Text>
        </View>
      </View>
    );
  }

  const overallScore = summary?.overall_score ?? null;
  const verdict = summary?.verdict || getVerdict(overallScore);
  const verdictColor = getVerdictColor(verdict);
  const fraudCount = results.filter(r => r?.fraud_flag).length;
  const platformsChecked = results.filter(r => r?.verification_status === 'verified').length;
  const totalPlatforms = results.length;
  const lastChecked = results.reduce((latest, r) => {
    if (!r?.last_checked_at) return latest;
    return !latest || new Date(r.last_checked_at) > new Date(latest) ? r.last_checked_at : latest;
  }, null);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>KOL Intelligence Report</Text>
        <TouchableOpacity
          style={styles.reverifyButton}
          onPress={handleReverify}
          disabled={reverifying}
        >
          {reverifying ? (
            <ActivityIndicator size="small" color={COLORS.gold} />
          ) : (
            <>
              <RefreshCw size={14} color={COLORS.gold} />
              <Text style={styles.reverifyText}>Kiểm tra lại</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Overall Score */}
      <View style={styles.overallSection}>
        <View style={[styles.scoreBadge, { backgroundColor: verdictColor + '20', borderColor: verdictColor }]}>
          <Text style={[styles.scoreNumber, { color: verdictColor }]}>
            {overallScore != null ? overallScore : '?'}
          </Text>
          <Text style={[styles.scoreMax, { color: verdictColor + 'AA' }]}>/100</Text>
        </View>
        <View style={styles.overallInfo}>
          <Text style={[styles.verdictText, { color: verdictColor }]}>{verdict}</Text>
          <View style={styles.overallStats}>
            <View style={styles.statItem}>
              {fraudCount > 0 ? (
                <AlertTriangle size={14} color={COLORS.error} />
              ) : (
                <Shield size={14} color={COLORS.success} />
              )}
              <Text style={[styles.statText, fraudCount > 0 && { color: COLORS.error }]}>
                {fraudCount} cảnh báo gian lận
              </Text>
            </View>
            <View style={styles.statItem}>
              <CheckCircle size={14} color={COLORS.info} />
              <Text style={styles.statText}>
                {platformsChecked}/{totalPlatforms} nền tảng
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Per-Platform Cards */}
      {results.map((result, index) => {
        const PlatformIcon = PLATFORM_ICONS[result?.platform] || Shield;
        const platformVerdict = getVerdict(result?.quality_score);
        const platformColor = getVerdictColor(platformVerdict);
        const followerDiff = formatFollowerDiff(result?.reported_followers, result?.actual_followers);
        const isPending = result?.verification_status === 'pending';
        const isError = result?.verification_status === 'error';

        return (
          <View key={result?.id || index} style={styles.platformCard}>
            {/* Platform Header */}
            <View style={styles.platformHeader}>
              <PlatformIcon size={18} color={COLORS.gold} />
              <Text style={styles.platformName}>
                {(result?.platform || 'unknown').charAt(0).toUpperCase() + (result?.platform || 'unknown').slice(1)}
              </Text>
              {isPending && (
                <View style={styles.pendingBadge}>
                  <Clock size={10} color={COLORS.warning} />
                  <Text style={styles.pendingText}>Đang chờ</Text>
                </View>
              )}
              {isError && (
                <View style={styles.errorBadge}>
                  <XCircle size={10} color={COLORS.error} />
                  <Text style={styles.errorBadgeText}>Lỗi</Text>
                </View>
              )}
              {!isPending && !isError && result?.quality_score != null && (
                <View style={[styles.platformScoreBadge, { backgroundColor: platformColor + '20' }]}>
                  <Text style={[styles.platformScoreText, { color: platformColor }]}>
                    {result.quality_score}/100 {platformVerdict}
                  </Text>
                </View>
              )}
            </View>

            {/* Skip details for pending/error */}
            {isPending || isError ? (
              <Text style={styles.pendingMessage}>
                {isPending ? 'Đang chờ kết quả crawl...' : (result?.error_message || 'Crawl thất bại')}
              </Text>
            ) : (
              <>
                {/* Followers */}
                <View style={styles.platformRow}>
                  <Text style={styles.platformLabel}>Báo cáo:</Text>
                  <Text style={styles.platformValue}>{formatNumber(result?.reported_followers)}</Text>
                  <Text style={styles.platformLabel}>Thực tế:</Text>
                  <Text style={styles.platformValue}>{formatNumber(result?.actual_followers)}</Text>
                  {followerDiff && (
                    <Text style={[styles.diffText, { color: followerDiff.color }]}>
                      {followerDiff.text}
                    </Text>
                  )}
                </View>

                {/* Engagement + Posts */}
                <View style={styles.platformRow}>
                  <Text style={styles.platformLabel}>Tương tác:</Text>
                  <Text style={styles.platformValue}>
                    {result?.engagement_rate != null ? `${(result.engagement_rate * 100).toFixed(2)}%` : 'N/A'}
                  </Text>
                  <Text style={styles.platformLabel}>Bài/tuần:</Text>
                  <Text style={styles.platformValue}>
                    {result?.posts_per_week != null ? result.posts_per_week.toFixed(1) : 'N/A'}
                  </Text>
                </View>

                {/* Fraud Flag */}
                {result?.fraud_flag && (
                  <View style={styles.fraudContainer}>
                    <AlertTriangle size={14} color={COLORS.error} />
                    <Text style={styles.fraudText}>Phát hiện gian lận</Text>
                  </View>
                )}
                {result?.fraud_flag && result?.fraud_reasons && (
                  <View style={styles.fraudReasons}>
                    {(Array.isArray(result.fraud_reasons) ? result.fraud_reasons : []).map((reason, i) => (
                      <Text key={i} style={styles.fraudReasonItem}>- {reason}</Text>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        );
      })}

      {/* Last Checked */}
      {lastChecked && (
        <Text style={styles.lastChecked}>
          Kiểm tra lần cuối: {timeAgo(lastChecked)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  reverifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  reverifyText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Overall Score
  overallSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 60, 0.6)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  scoreBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  scoreMax: {
    fontSize: 12,
  },
  overallInfo: {
    flex: 1,
  },
  verdictText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: 4,
  },
  overallStats: {
    gap: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Platform Card
  platformCard: {
    backgroundColor: 'rgba(30, 30, 60, 0.4)',
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold + '40',
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: SPACING.xs,
  },
  platformName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  pendingText: {
    fontSize: 10,
    color: COLORS.warning,
  },
  errorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  errorBadgeText: {
    fontSize: 10,
    color: COLORS.error,
  },
  platformScoreBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  platformScoreText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  pendingMessage: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  platformLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  platformValue: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginRight: 6,
  },
  diffText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Fraud
  fraudContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 6,
    padding: 4,
    marginTop: 4,
    gap: 4,
  },
  fraudText: {
    fontSize: 11,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  fraudReasons: {
    paddingLeft: SPACING.sm,
    marginTop: 2,
  },
  fraudReasonItem: {
    fontSize: 11,
    color: COLORS.error,
    lineHeight: 16,
  },

  // Last checked
  lastChecked: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
});

export default KOLVerificationResultCard;
