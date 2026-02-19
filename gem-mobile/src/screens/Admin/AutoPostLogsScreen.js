/**
 * Gemral - Auto Post Logs Screen
 * Xem lịch sử auto-post
 * @description Admin UI cho viewing post logs
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Modal,
  DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  RefreshCw,
  AlertCircle,
  Inbox,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Filter,
  Home,
  Facebook,
  Youtube,
  Instagram,
  Send,
} from 'lucide-react-native';

// Services
import { getAutoPostLogs, getLogsStats } from '../../services/autoPostService';

// Theme
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../../utils/tokens';

// Loading state
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';

// ========== CONSTANTS ==========
const PLATFORM_COLORS = {
  gemral: COLORS.gold,
  facebook: '#1877F2',
  tiktok: '#000000',
  youtube: '#FF0000',
  threads: '#000000',
  instagram: '#E4405F',
};

const STATUS_CONFIG = {
  success: { color: COLORS.success, icon: CheckCircle, label: 'Thành công' },
  failed: { color: COLORS.error, icon: XCircle, label: 'Thất bại' },
  pending: { color: COLORS.warning, icon: Clock, label: 'Đang chờ' },
  retrying: { color: COLORS.info, icon: RefreshCw, label: 'Đang thử lại' },
};

// ========== COMPONENT ==========
const AutoPostLogsScreen = () => {
  const navigation = useNavigation();

  // ========== STATE ==========
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  // Filter
  const [filterStatus, setFilterStatus] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Detail modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // ========== EFFECTS ==========
  useFocusEffect(
    useCallback(() => {
      fetchData(true);
    }, [filterStatus])
  );

  // Rule 31: Recovery listener for app resume
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[AutoPostLogs] Force refresh received');
      setLoading(false);
      setRefreshing(false);
      setTimeout(() => {
        fetchData(true);
      }, 50); // Rule 57: Break React 18 batch
    });
    return () => listener.remove();
  }, []);

  // ========== DATA FETCHING ==========
  const fetchData = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setOffset(0);
      }

      const currentOffset = reset ? 0 : offset;

      const [logsResult, statsResult] = await Promise.all([
        getAutoPostLogs({
          status: filterStatus,
          limit: 30,
          offset: currentOffset,
        }),
        reset ? getLogsStats() : Promise.resolve({ success: true, data: stats }),
      ]);

      if (!logsResult.success) {
        throw new Error(logsResult.error);
      }

      if (reset) {
        setLogs(logsResult.data);
      } else {
        setLogs((prev) => [...prev, ...logsResult.data]);
      }

      setHasMore(logsResult.hasMore);
      setStats(statsResult.data);
      setError(null);
    } catch (err) {
      console.error('[AutoPostLogs] Fetch error:', err);
      setError(err?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, offset, stats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData(true);
    setRefreshing(false);
  }, [fetchData]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setOffset((prev) => prev + 30);
      fetchData(false);
    }
  };

  // ========== HANDLERS ==========
  const handleLogPress = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const handleFilterSelect = (status) => {
    setFilterStatus(status);
    setShowFilterModal(false);
  };

  // ========== RENDER HELPERS ==========
  const renderStats = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total || 0}</Text>
          <Text style={styles.statLabel}>Tổng</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.todayCount || 0}</Text>
          <Text style={styles.statLabel}>Hôm nay</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: COLORS.success }]}>
            {stats.byStatus?.success || 0}
          </Text>
          <Text style={styles.statLabel}>Thành công</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: COLORS.error }]}>
            {stats.failedCount || 0}
          </Text>
          <Text style={styles.statLabel}>Thất bại</Text>
        </View>
      </View>
    );
  };

  const renderPlatformIcon = (platform) => {
    const iconProps = { size: 16, color: PLATFORM_COLORS[platform] || COLORS.textMuted };
    switch (platform) {
      case 'gemral':
        return <Home {...iconProps} />;
      case 'facebook':
        return <Facebook {...iconProps} />;
      case 'youtube':
        return <Youtube {...iconProps} />;
      case 'instagram':
        return <Instagram {...iconProps} />;
      default:
        return <Send {...iconProps} />;
    }
  };

  const renderLogItem = ({ item }) => {
    const statusConfig = STATUS_CONFIG[item?.status] || STATUS_CONFIG.pending;
    const StatusIcon = statusConfig.icon;
    const executedDate = item?.executed_at ? new Date(item.executed_at) : null;

    return (
      <TouchableOpacity
        style={styles.logItem}
        onPress={() => handleLogPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.logHeader}>
          <View style={styles.logPlatform}>
            {renderPlatformIcon(item?.platform)}
            <Text style={styles.logPlatformText}>{item?.platform}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
            <StatusIcon size={12} color="#fff" />
            <Text style={styles.statusText}>{statusConfig.label}</Text>
          </View>
        </View>

        <Text style={styles.logTitle} numberOfLines={1}>
          {item?.content_calendar?.title || 'Không có tiêu đề'}
        </Text>

        <View style={styles.logMeta}>
          <Text style={styles.logAction}>{item?.action || 'N/A'}</Text>
          {executedDate && (
            <Text style={styles.logTime}>
              {executedDate.toLocaleDateString('vi-VN')} {executedDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>

        {item?.error_message && (
          <Text style={styles.errorText} numberOfLines={2}>
            {item.error_message}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowFilterModal(false)}
      >
        <View style={styles.filterModal}>
          <Text style={styles.filterTitle}>Lọc theo trạng thái</Text>

          <TouchableOpacity
            style={[styles.filterItem, filterStatus === null && styles.filterItemActive]}
            onPress={() => handleFilterSelect(null)}
          >
            <Text style={styles.filterItemText}>Tất cả</Text>
          </TouchableOpacity>

          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <TouchableOpacity
              key={key}
              style={[styles.filterItem, filterStatus === key && styles.filterItemActive]}
              onPress={() => handleFilterSelect(key)}
            >
              <config.icon size={18} color={config.color} />
              <Text style={styles.filterItemText}>{config.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderDetailModal = () => {
    if (!selectedLog) return null;

    const statusConfig = STATUS_CONFIG[selectedLog?.status] || STATUS_CONFIG.pending;
    const executedDate = selectedLog?.executed_at ? new Date(selectedLog.executed_at) : null;

    return (
      <Modal
        visible={showDetailModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDetailModal(false)}
        >
          <View style={styles.detailModal}>
            <Text style={styles.detailTitle}>Chi tiết Log</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tiêu đề:</Text>
              <Text style={styles.detailValue}>
                {selectedLog?.content_calendar?.title || 'N/A'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Platform:</Text>
              <Text style={styles.detailValue}>{selectedLog?.platform || 'N/A'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Trạng thái:</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
                <Text style={styles.statusText}>{statusConfig.label}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Action:</Text>
              <Text style={styles.detailValue}>{selectedLog?.action || 'N/A'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Thời gian:</Text>
              <Text style={styles.detailValue}>
                {executedDate ? executedDate.toLocaleString('vi-VN') : 'N/A'}
              </Text>
            </View>

            {selectedLog?.duration_ms && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Thời lượng:</Text>
                <Text style={styles.detailValue}>{selectedLog.duration_ms}ms</Text>
              </View>
            )}

            {selectedLog?.external_post_id && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>External ID:</Text>
                <Text style={styles.detailValue}>{selectedLog.external_post_id}</Text>
              </View>
            )}

            {selectedLog?.error_message && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Lỗi:</Text>
                <Text style={[styles.detailValue, { color: COLORS.error }]}>
                  {selectedLog.error_message}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDetailModal(false)}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // ========== LOADING STATE ==========
  if (loading && !refreshing && logs.length === 0) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ========== ERROR STATE ==========
  if (error && logs.length === 0) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.centerContainer}>
          <AlertCircle size={48} color={COLORS.error} />
          <Text style={styles.errorTitle}>Đã có lỗi xảy ra</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchData(true)}>
            <RefreshCw size={18} color={COLORS.gold} />
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Auto-Post Logs</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Filter size={20} color={filterStatus ? COLORS.gold : COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {renderStats()}

        {/* Logs List */}
        {logs.length === 0 ? (
          <View style={styles.centerContainer}>
            <Inbox size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Chưa có logs</Text>
            <Text style={styles.emptyMessage}>Logs sẽ xuất hiện sau khi có bài viết được đăng</Text>
          </View>
        ) : (
          <FlatList
            data={logs}
            keyExtractor={(item) => item?.id}
            renderItem={renderLogItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.gold}
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              hasMore ? (
                <ActivityIndicator size="small" color={COLORS.gold} style={styles.footer} />
              ) : null
            }
          />
        )}

        {/* Modals */}
        {renderFilterModal()}
        {renderDetailModal()}
      </SafeAreaView>
    </LinearGradient>
  );
};

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  filterButton: {
    padding: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  logItem: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  logPlatform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  logPlatformText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: SPACING.sm,
    gap: SPACING.xxs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#fff',
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  logTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  logMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logAction: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  logTime: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModal: {
    width: '80%',
    backgroundColor: COLORS.bgMid,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
  },
  filterTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    gap: SPACING.md,
  },
  filterItemActive: {
    backgroundColor: 'rgba(255,189,89,0.2)',
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  filterItemText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    color: COLORS.textPrimary,
  },
  detailModal: {
    width: '90%',
    backgroundColor: COLORS.bgMid,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  detailTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    width: 100,
  },
  detailValue: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },
  closeButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: SPACING.sm,
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
  },
  loadingText: {
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,189,89,0.2)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.sm,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  retryText: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptyMessage: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: SPACING.lg,
  },
});

export default AutoPostLogsScreen;
