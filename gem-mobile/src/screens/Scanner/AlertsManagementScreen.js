/**
 * GEM Mobile - Alerts Management Screen
 * Phase 3C: Manage all price alerts
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Switch,
} from 'react-native';
import {
  ArrowLeft,
  Bell,
  BellOff,
  Plus,
  Trash2,
  Settings,
  Clock,
  Filter,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/tokens';
import { alertManager } from '../../services/alertManager';
import { AlertCard, AlertTypeBadge } from '../../components/Scanner';
import PriceAlertModal from '../../components/Scanner/PriceAlertModal';

/**
 * Filter options
 */
const FILTER_OPTIONS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'active', label: 'Đang hoạt động' },
  { id: 'triggered', label: 'Đã trigger' },
  { id: 'expired', label: 'Hết hạn' },
];

const AlertsManagementScreen = ({ navigation }) => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [preferences, setPreferences] = useState(null);

  // Load alerts
  const loadAlerts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      const userAlerts = await alertManager.getAlerts();
      const prefs = await alertManager.getPreferences();

      setAlerts(userAlerts || []);
      setPreferences(prefs);
    } catch (error) {
      console.error('[AlertsManagement] Error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true;
    if (filter === 'active') return alert.status === 'active';
    if (filter === 'triggered') return alert.status === 'triggered';
    if (filter === 'expired') return alert.status === 'expired';
    return true;
  });

  // Toggle alert
  const handleToggleAlert = useCallback(async (alert) => {
    try {
      await alertManager.toggleAlert(alert.id);
      loadAlerts(true);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật alert');
    }
  }, [loadAlerts]);

  // Delete alert
  const handleDeleteAlert = useCallback((alert) => {
    Alert.alert(
      'Xóa Alert',
      `Bạn có chắc muốn xóa alert "${alert.symbol}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await alertManager.deleteAlert(alert.id);
              loadAlerts(true);
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa alert');
            }
          },
        },
      ]
    );
  }, [loadAlerts]);

  // Delete all alerts
  const handleDeleteAll = useCallback(() => {
    if (alerts.length === 0) return;

    Alert.alert(
      'Xóa Tất Cả',
      `Bạn có chắc muốn xóa tất cả ${alerts.length} alerts?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tất cả',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const alert of alerts) {
                await alertManager.deleteAlert(alert.id);
              }
              loadAlerts(true);
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa alerts');
            }
          },
        },
      ]
    );
  }, [alerts, loadAlerts]);

  // Toggle master switch
  const handleToggleMaster = useCallback(async (value) => {
    try {
      await alertManager.updatePreferences({ enabled: value });
      setPreferences(prev => ({ ...prev, enabled: value }));
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật cài đặt');
    }
  }, []);

  // Render alert item
  const renderAlertItem = useCallback(({ item }) => (
    <View style={styles.alertItemContainer}>
      <AlertCard
        alert={item}
        onPress={() => {}}
        onDismiss={() => handleDeleteAlert(item)}
      />
      <View style={styles.alertActions}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => handleToggleAlert(item)}
        >
          {item.status === 'active' ? (
            <Bell size={18} color={COLORS.success} />
          ) : (
            <BellOff size={18} color={COLORS.textMuted} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteAlert(item)}
        >
          <Trash2 size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  ), [handleToggleAlert, handleDeleteAlert]);

  // Empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Bell size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>Chưa có Alert</Text>
      <Text style={styles.emptyText}>
        Tạo alert để nhận thông báo khi giá đến mức bạn muốn
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Plus size={18} color={COLORS.bgDarkest} />
        <Text style={styles.createButtonText}>Tạo Alert</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Price Alerts</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AlertSettings')}
          style={styles.settingsButton}
        >
          <Settings size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Master Toggle */}
      <View style={styles.masterToggle}>
        <View style={styles.masterLeft}>
          <Bell size={20} color={preferences?.enabled ? COLORS.gold : COLORS.textMuted} />
          <View>
            <Text style={styles.masterLabel}>Notifications</Text>
            <Text style={styles.masterDesc}>
              {preferences?.enabled ? 'Đang hoạt động' : 'Đã tắt'}
            </Text>
          </View>
        </View>
        <Switch
          value={preferences?.enabled ?? true}
          onValueChange={handleToggleMaster}
          trackColor={{ false: COLORS.bgDarkest, true: COLORS.gold + '50' }}
          thumbColor={preferences?.enabled ? COLORS.gold : COLORS.textMuted}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{alerts.length}</Text>
          <Text style={styles.statLabel}>Tổng</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.success }]}>
            {alerts.filter(a => a.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.warning }]}>
            {alerts.filter(a => a.status === 'triggered').length}
          </Text>
          <Text style={styles.statLabel}>Triggered</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <View style={styles.filterTabs}>
          {FILTER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.filterTab,
                filter === option.id && styles.filterTabActive,
              ]}
              onPress={() => setFilter(option.id)}
            >
              <Text style={[
                styles.filterTabText,
                filter === option.id && styles.filterTabTextActive,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {alerts.length > 0 && (
          <TouchableOpacity onPress={handleDeleteAll} style={styles.deleteAllButton}>
            <Trash2 size={16} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Alerts List */}
      <FlatList
        data={filteredAlerts}
        keyExtractor={(item) => item.id}
        renderItem={renderAlertItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          filteredAlerts.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadAlerts(true)}
            tintColor={COLORS.gold}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.8}
      >
        <Plus size={24} color={COLORS.bgDarkest} />
      </TouchableOpacity>

      {/* Create Modal */}
      <PriceAlertModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onAlertCreated={() => loadAlerts(true)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  settingsButton: {
    padding: SPACING.sm,
  },

  // Master Toggle
  masterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.glassBg,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  masterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  masterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  masterDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Filter
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  filterTabs: {
    flex: 1,
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.bgDarkest,
  },
  filterTabActive: {
    backgroundColor: COLORS.gold + '20',
  },
  filterTabText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  filterTabTextActive: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  deleteAllButton: {
    padding: SPACING.sm,
  },

  // List
  listContent: {
    padding: SPACING.md,
  },
  listContentEmpty: {
    flex: 1,
  },
  separator: {
    height: SPACING.sm,
  },

  // Alert Item
  alertItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertActions: {
    flexDirection: 'row',
    marginLeft: SPACING.sm,
    gap: SPACING.xs,
  },
  toggleButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.bgDarkest,
    borderRadius: BORDER_RADIUS.sm,
  },
  deleteButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.error + '20',
    borderRadius: BORDER_RADIUS.sm,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.bgDarkest,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default AlertsManagementScreen;
