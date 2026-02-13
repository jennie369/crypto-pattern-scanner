/**
 * GEM Mobile - Alert Panel Component
 * Phase 3C: Alert management panel with list and settings
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  Bell,
  BellOff,
  Settings,
  Trash2,
  Check,
  Filter,
  ChevronDown,
  Plus,
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/tokens';
import { alertManager } from '../../services/alertManager';
import { ALERT_TYPES, getSortedAlertTypes } from '../../constants/alertConfig';
import AlertCard, { AlertListItem, AlertTypeBadge } from './AlertCard';

/**
 * Main AlertPanel component
 */
const AlertPanel = memo(({
  userId,
  onAlertPress,
  onSettingsPress,
  onCreateAlert,
  showHeader = true,
  maxItems = 20,
}) => {
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [filterType, setFilterType] = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  // Load data
  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Initialize alert manager
      await alertManager.initialize(userId);

      // Load active alerts
      const activeAlerts = alertManager.getActiveAlerts();
      setAlerts(activeAlerts);

      // Load history
      const alertHistory = await alertManager.getHistory(maxItems);
      setHistory(alertHistory);

      // Get unread count
      const count = await alertManager.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('[AlertPanel] Load data error:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, maxItems]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleMarkAllRead = useCallback(async () => {
    await alertManager.markAsRead();
    setUnreadCount(0);
    setHistory(prev => prev.map(a => ({ ...a, is_read: true })));
  }, []);

  const handleDeleteAlert = useCallback(async (alertId) => {
    const result = await alertManager.deleteAlert(alertId);
    if (result.success) {
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    }
  }, []);

  const handleToggleAlert = useCallback(async (alertId, isActive) => {
    const result = await alertManager.toggleAlert(alertId, isActive);
    if (result.success) {
      await loadData();
    }
  }, [loadData]);

  const filteredAlerts = filterType
    ? alerts.filter(a => a.alert_type === filterType)
    : alerts;

  const filteredHistory = filterType
    ? history.filter(a => a.alert_type === filterType)
    : history;

  const renderActiveAlert = useCallback(({ item }) => (
    <ActiveAlertItem
      alert={item}
      onPress={() => onAlertPress?.(item)}
      onDelete={() => handleDeleteAlert(item.id)}
      onToggle={(isActive) => handleToggleAlert(item.id, isActive)}
    />
  ), [onAlertPress, handleDeleteAlert, handleToggleAlert]);

  const renderHistoryAlert = useCallback(({ item }) => (
    <AlertListItem
      alert={item}
      onPress={() => onAlertPress?.(item)}
      isRead={item.is_read}
    />
  ), [onAlertPress]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.gold} />
        <Text style={styles.loadingText}>Đang tải alerts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      {showHeader && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Bell size={20} color={COLORS.gold} />
            <Text style={styles.headerTitle}>Alerts</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <View style={styles.headerActions}>
            {onCreateAlert && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={onCreateAlert}
              >
                <Plus size={18} color={COLORS.textPrimary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowFilter(!showFilter)}
            >
              <Filter size={18} color={filterType ? COLORS.gold : COLORS.textPrimary} />
            </TouchableOpacity>
            {onSettingsPress && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={onSettingsPress}
              >
                <Settings size={18} color={COLORS.textPrimary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Filter dropdown */}
      {showFilter && (
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterItem, !filterType && styles.filterItemActive]}
            onPress={() => setFilterType(null)}
          >
            <Text style={[styles.filterText, !filterType && styles.filterTextActive]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          {getSortedAlertTypes().map(type => (
            <TouchableOpacity
              key={type.id}
              style={[styles.filterItem, filterType === type.id && styles.filterItemActive]}
              onPress={() => setFilterType(type.id)}
            >
              <Text style={[styles.filterText, filterType === type.id && styles.filterTextActive]}>
                {type.nameVi}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Đang hoạt động ({filteredAlerts.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Lịch sử
          </Text>
        </TouchableOpacity>
        {activeTab === 'history' && unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markReadButton}
            onPress={handleMarkAllRead}
          >
            <Check size={14} color={COLORS.success} />
            <Text style={styles.markReadText}>Đánh dấu đã đọc</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {activeTab === 'active' ? (
        <FlatList
          data={filteredAlerts}
          renderItem={renderActiveAlert}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.gold]}
              tintColor={COLORS.gold}
            />
          }
          ListEmptyComponent={
            <EmptyState
              type="active"
              onCreateAlert={onCreateAlert}
            />
          }
        />
      ) : (
        <FlatList
          data={filteredHistory}
          renderItem={renderHistoryAlert}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.gold]}
              tintColor={COLORS.gold}
            />
          }
          ListEmptyComponent={
            <EmptyState type="history" />
          }
        />
      )}
    </View>
  );
});

/**
 * Active alert item with actions
 */
const ActiveAlertItem = memo(({ alert, onPress, onDelete, onToggle }) => {
  return (
    <View style={styles.activeAlertContainer}>
      <AlertCard
        alert={{
          ...alert,
          title: alert.symbol,
          titleVi: `${alert.alert_type} - ${alert.symbol}`,
          type: alert.alert_type,
          message: alert.note || `${ALERT_TYPES[alert.alert_type?.toUpperCase()]?.nameVi || alert.alert_type}`,
          createdAt: alert.created_at,
        }}
        onPress={onPress}
        showActions={false}
        compact
      />
      <View style={styles.alertActions}>
        <TouchableOpacity
          style={styles.alertActionButton}
          onPress={() => onToggle(!alert.is_active)}
        >
          {alert.is_active ? (
            <Bell size={16} color={COLORS.success} />
          ) : (
            <BellOff size={16} color={COLORS.textMuted} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.alertActionButton}
          onPress={onDelete}
        >
          <Trash2 size={16} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

/**
 * Empty state component
 */
const EmptyState = memo(({ type, onCreateAlert }) => (
  <View style={styles.emptyContainer}>
    <Bell size={48} color={COLORS.textMuted} />
    <Text style={styles.emptyTitle}>
      {type === 'active' ? 'Chưa có alert nào' : 'Chưa có lịch sử'}
    </Text>
    <Text style={styles.emptyText}>
      {type === 'active'
        ? 'Tạo alert để được thông báo khi có setup'
        : 'Các alert đã kích hoạt sẽ hiển thị ở đây'}
    </Text>
    {type === 'active' && onCreateAlert && (
      <TouchableOpacity style={styles.createButton} onPress={onCreateAlert}>
        <Plus size={16} color={COLORS.bgDarkest} />
        <Text style={styles.createButtonText}>Tạo Alert</Text>
      </TouchableOpacity>
    )}
  </View>
));

/**
 * Compact alert badge for status bar
 */
export const AlertBadge = memo(({ count = 0, onPress }) => {
  if (count === 0) return null;

  return (
    <TouchableOpacity style={styles.alertBadge} onPress={onPress}>
      <Bell size={16} color={COLORS.gold} />
      <View style={styles.alertBadgeCount}>
        <Text style={styles.alertBadgeCountText}>
          {count > 99 ? '99+' : count}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

/**
 * Alert summary for dashboard
 */
export const AlertSummary = memo(({ alerts = [], onViewAll }) => {
  const recentAlerts = alerts.slice(0, 3);
  const hasMore = alerts.length > 3;

  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryHeader}>
        <Bell size={16} color={COLORS.gold} />
        <Text style={styles.summaryTitle}>Recent Alerts</Text>
        {hasMore && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        )}
      </View>
      {recentAlerts.length > 0 ? (
        recentAlerts.map((alert, index) => (
          <AlertCard
            key={alert.id || index}
            alert={alert}
            compact
          />
        ))
      ) : (
        <Text style={styles.noAlertsText}>Không có alert mới</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  unreadBadge: {
    backgroundColor: COLORS.error,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    color: COLORS.white,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  headerButton: {
    padding: SPACING.xs,
  },

  // Filter
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.sm,
    gap: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterItem: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.glassBg,
  },
  filterItemActive: {
    backgroundColor: COLORS.gold,
  },
  filterText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.bgDarkest,
    fontWeight: '600',
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gold,
  },
  tabText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  markReadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
    padding: SPACING.xs,
  },
  markReadText: {
    fontSize: 11,
    color: COLORS.success,
  },

  // List
  listContent: {
    padding: SPACING.sm,
    paddingBottom: SPACING.xl,
  },

  // Active alert
  activeAlertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  alertActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  alertActionButton: {
    padding: SPACING.xs,
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.sm,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.bgDarkest,
  },

  // Alert badge
  alertBadge: {
    position: 'relative',
    padding: SPACING.xs,
  },
  alertBadgeCount: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.error,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  alertBadgeCountText: {
    fontSize: 9,
    color: COLORS.white,
    fontWeight: '700',
  },

  // Summary
  summaryContainer: {
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  viewAllText: {
    fontSize: 12,
    color: COLORS.gold,
  },
  noAlertsText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
});

AlertPanel.displayName = 'AlertPanel';
ActiveAlertItem.displayName = 'ActiveAlertItem';
EmptyState.displayName = 'EmptyState';
AlertBadge.displayName = 'AlertBadge';
AlertSummary.displayName = 'AlertSummary';

export default AlertPanel;
