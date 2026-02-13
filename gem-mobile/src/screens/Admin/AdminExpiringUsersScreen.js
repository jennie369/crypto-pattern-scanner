/**
 * Gemral - Admin Expiring Users Screen
 * View users with expiring subscriptions and manage renewals
 *
 * Created: December 14, 2025
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  AlertCircle,
  Calendar,
  Crown,
  ChevronDown,
  ChevronUp,
  Plus,
  Bell,
  RefreshCw,
  Filter,
  X,
  Check,
  User,
  Mail,
  Sparkles,
  History,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, GLASS } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';
import subscriptionExpirationService from '../../services/subscriptionExpirationService';

const FILTER_OPTIONS = [
  { key: 'all', label: 'Tất cả', days: 30 },
  { key: '7_days', label: '7 ngày', days: 7 },
  { key: '3_days', label: '3 ngày', days: 3 },
  { key: 'today', label: 'Hôm nay', days: 1 },
];

const TIER_TYPE_OPTIONS = [
  { key: null, label: 'Tất cả gói' },
  { key: 'chatbot_tier', label: 'GEM Master AI' },
  { key: 'scanner_tier', label: 'Pattern Scanner' },
  { key: 'course_tier', label: 'Khóa học' },
];

const AdminExpiringUsersScreen = ({ navigation }) => {
  const { isAdmin } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();

  // State
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total_expiring: 0,
    expiring_today: 0,
    expiring_3_days: 0,
    expiring_7_days: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('7_days');
  const [tierTypeFilter, setTierTypeFilter] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [extendModal, setExtendModal] = useState({ visible: false, user: null });
  const [extendDays, setExtendDays] = useState('30');
  const [extending, setExtending] = useState(false);
  const [triggeringCheck, setTriggeringCheck] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    try {
      // Get filter settings
      const filterOption = FILTER_OPTIONS.find(f => f.key === filter);
      const daysAhead = filterOption?.days || 7;

      // Load stats and users in parallel
      const [statsResult, usersResult] = await Promise.all([
        subscriptionExpirationService.getExpiringUsersCount(30),
        subscriptionExpirationService.getExpiringUsers({
          daysAhead,
          tierType: tierTypeFilter,
          limit: 100,
        }),
      ]);

      if (statsResult.success) {
        setStats(statsResult.data);
      }

      if (usersResult.success) {
        setUsers(usersResult.data);
      }
    } catch (error) {
      console.error('[AdminExpiringUsers] Error loading data:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể tải danh sách người dùng',
        buttons: [{ text: 'OK' }],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, tierTypeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Trigger manual check
  const handleTriggerCheck = async () => {
    setTriggeringCheck(true);
    try {
      const result = await subscriptionExpirationService.triggerSubscriptionCheck('both');

      if (result.success) {
        alert({
          type: 'success',
          title: 'Hoàn thành',
          message: `Đã kiểm tra: ${result.data?.revoked_count || 0} hết hạn, ${result.data?.notifications_sent || 0} thông báo gửi`,
          buttons: [{ text: 'OK' }],
        });
        loadData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('[AdminExpiringUsers] Trigger check error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: error.message || 'Không thể chạy kiểm tra',
        buttons: [{ text: 'OK' }],
      });
    } finally {
      setTriggeringCheck(false);
    }
  };

  // Extend subscription
  const handleExtendSubscription = async () => {
    if (!extendModal.user) return;

    const days = parseInt(extendDays, 10);
    if (isNaN(days) || days <= 0) {
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Vui lòng nhập số ngày hợp lệ',
        buttons: [{ text: 'OK' }],
      });
      return;
    }

    setExtending(true);
    try {
      const result = await subscriptionExpirationService.extendSubscription(
        extendModal.user.user_id,
        extendModal.user.tier_type,
        days,
        'Admin extension'
      );

      if (result.success) {
        alert({
          type: 'success',
          title: 'Thành công',
          message: `Đã gia hạn ${days} ngày cho ${extendModal.user.email || 'user'}`,
          buttons: [{ text: 'OK' }],
        });
        setExtendModal({ visible: false, user: null });
        loadData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('[AdminExpiringUsers] Extend error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: error.message || 'Không thể gia hạn',
        buttons: [{ text: 'OK' }],
      });
    } finally {
      setExtending(false);
    }
  };

  // Send renewal reminder
  const handleSendReminder = async (user) => {
    try {
      const result = await subscriptionExpirationService.sendRenewalReminder(
        user.user_id,
        user.tier_type
      );

      if (result.success) {
        alert({
          type: 'success',
          title: 'Đã gửi',
          message: `Đã gửi nhắc nhở gia hạn cho ${user.email || 'user'}`,
          buttons: [{ text: 'OK' }],
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('[AdminExpiringUsers] Send reminder error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: error.message || 'Không thể gửi nhắc nhở',
        buttons: [{ text: 'OK' }],
      });
    }
  };

  // Get warning color
  const getWarningColor = (daysRemaining) => {
    if (daysRemaining <= 1) return COLORS.error;
    if (daysRemaining <= 3) return COLORS.warning;
    return COLORS.gold;
  };

  // Render stats card
  const renderStatsCard = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderColor: COLORS.error }]}>
          <AlertTriangle size={20} color={COLORS.error} />
          <Text style={[styles.statValue, { color: COLORS.error }]}>
            {stats.expiring_today}
          </Text>
          <Text style={styles.statLabel}>Hôm nay</Text>
        </View>

        <View style={[styles.statCard, { borderColor: COLORS.warning }]}>
          <AlertCircle size={20} color={COLORS.warning} />
          <Text style={[styles.statValue, { color: COLORS.warning }]}>
            {stats.expiring_3_days}
          </Text>
          <Text style={styles.statLabel}>3 ngày</Text>
        </View>

        <View style={[styles.statCard, { borderColor: COLORS.gold }]}>
          <Clock size={20} color={COLORS.gold} />
          <Text style={[styles.statValue, { color: COLORS.gold }]}>
            {stats.expiring_7_days}
          </Text>
          <Text style={styles.statLabel}>7 ngày</Text>
        </View>

        <View style={[styles.statCard, { borderColor: COLORS.primary }]}>
          <Calendar size={20} color={COLORS.primary} />
          <Text style={[styles.statValue, { color: COLORS.primary }]}>
            {stats.total_expiring}
          </Text>
          <Text style={styles.statLabel}>Tổng</Text>
        </View>
      </View>
    </View>
  );

  // Render user item
  const renderUserItem = ({ item }) => {
    const isExpanded = expandedUser === item.user_id + item.tier_type;
    const warningColor = getWarningColor(item.days_remaining);
    const tierTypeName = TIER_TYPE_OPTIONS.find(t => t.key === item.tier_type)?.label || item.tier_type;

    return (
      <TouchableOpacity
        style={styles.userCard}
        onPress={() => setExpandedUser(isExpanded ? null : item.user_id + item.tier_type)}
        activeOpacity={0.7}
      >
        <View style={styles.userHeader}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {item.avatar_url ? (
              <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={20} color={COLORS.textSecondary} />
              </View>
            )}
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.full_name || item.email || 'Unknown User'}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {item.email}
            </Text>
          </View>

          {/* Days Badge */}
          <View style={[styles.daysBadge, { backgroundColor: `${warningColor}20`, borderColor: warningColor }]}>
            <Text style={[styles.daysText, { color: warningColor }]}>
              {item.days_remaining <= 0 ? 'Hết hạn' : `${item.days_remaining} ngày`}
            </Text>
          </View>

          {/* Expand Icon */}
          {isExpanded ? (
            <ChevronUp size={20} color={COLORS.textSecondary} />
          ) : (
            <ChevronDown size={20} color={COLORS.textSecondary} />
          )}
        </View>

        {/* Tier Info */}
        <View style={styles.tierRow}>
          <Crown size={14} color={COLORS.gold} />
          <Text style={styles.tierType}>{tierTypeName}</Text>
          <Text style={styles.tierValue}>{item.current_tier}</Text>
          {item.notification_sent && (
            <View style={styles.notifBadge}>
              <Bell size={10} color={COLORS.success} />
            </View>
          )}
        </View>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Hết hạn:</Text>
              <Text style={styles.detailValue}>
                {new Date(item.expires_at).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.extendButton]}
                onPress={() => {
                  setExtendDays('30');
                  setExtendModal({ visible: true, user: item });
                }}
              >
                <Plus size={16} color={COLORS.background} />
                <Text style={styles.extendButtonText}>Gia hạn</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.reminderButton]}
                onPress={() => handleSendReminder(item)}
              >
                <Bell size={16} color={COLORS.gold} />
                <Text style={styles.reminderButtonText}>Nhắc nhở</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render filter buttons
  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterButton,
              filter === option.key && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(option.key)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === option.key && styles.filterButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.filterIconButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter size={18} color={tierTypeFilter ? COLORS.gold : COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Check size={48} color={COLORS.success} />
      <Text style={styles.emptyTitle}>Không có user sắp hết hạn</Text>
      <Text style={styles.emptyText}>
        Không có subscription nào sắp hết hạn trong {FILTER_OPTIONS.find(f => f.key === filter)?.days || 7} ngày tới
      </Text>
    </View>
  );

  // Access check
  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedText}>Bạn không có quyền truy cập</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AlertComponent />

      {/* Header */}
      <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Clock size={24} color={COLORS.gold} />
          <Text style={styles.headerTitle}>Subscriptions Sắp Hết Hạn</Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleTriggerCheck}
          disabled={triggeringCheck}
        >
          {triggeringCheck ? (
            <ActivityIndicator size="small" color={COLORS.gold} />
          ) : (
            <RefreshCw size={20} color={COLORS.gold} />
          )}
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats */}
      {renderStatsCard()}

      {/* Filters */}
      {renderFilterButtons()}

      {/* User List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => `${item.user_id}-${item.tier_type}`}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
            />
          }
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Extend Modal */}
      <Modal
        visible={extendModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setExtendModal({ visible: false, user: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gia hạn Subscription</Text>
              <TouchableOpacity
                onPress={() => setExtendModal({ visible: false, user: null })}
              >
                <X size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              {extendModal.user?.email || 'User'}
            </Text>
            <Text style={styles.modalTier}>
              {TIER_TYPE_OPTIONS.find(t => t.key === extendModal.user?.tier_type)?.label} - {extendModal.user?.current_tier}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Số ngày gia hạn</Text>
              <TextInput
                style={styles.input}
                value={extendDays}
                onChangeText={setExtendDays}
                keyboardType="number-pad"
                placeholder="30"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.quickDaysRow}>
              {[7, 30, 90, 365].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.quickDayButton,
                    extendDays === String(days) && styles.quickDayButtonActive,
                  ]}
                  onPress={() => setExtendDays(String(days))}
                >
                  <Text
                    style={[
                      styles.quickDayText,
                      extendDays === String(days) && styles.quickDayTextActive,
                    ]}
                  >
                    {days} ngày
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.extendConfirmButton}
              onPress={handleExtendSubscription}
              disabled={extending}
            >
              {extending ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <>
                  <Plus size={20} color={COLORS.background} />
                  <Text style={styles.extendConfirmText}>Gia hạn</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Tier Type Filter Modal */}
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
          <View style={styles.filterModalContent}>
            <Text style={styles.filterModalTitle}>Lọc theo gói</Text>
            {TIER_TYPE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key || 'all'}
                style={[
                  styles.filterOption,
                  tierTypeFilter === option.key && styles.filterOptionActive,
                ]}
                onPress={() => {
                  setTierTypeFilter(option.key);
                  setShowFilterModal(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    tierTypeFilter === option.key && styles.filterOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {tierTypeFilter === option.key && (
                  <Check size={18} color={COLORS.gold} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Expiration Logs Button */}
      <TouchableOpacity
        style={styles.logsButton}
        onPress={() => navigation.navigate('AdminExpirationLogs')}
      >
        <History size={20} color={COLORS.background} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  refreshButton: {
    padding: SPACING.sm,
  },

  // Stats
  statsContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: GLASS.backgroundColor,
    borderRadius: 12,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: 4,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Filters
  filterContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: GLASS.backgroundColor,
  },
  filterButtonActive: {
    backgroundColor: COLORS.gold,
  },
  filterButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  filterButtonTextActive: {
    color: COLORS.background,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  filterIconButton: {
    padding: SPACING.sm,
    borderRadius: 20,
    backgroundColor: GLASS.backgroundColor,
    marginLeft: 'auto',
  },

  // List
  listContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },

  // User Card
  userCard: {
    backgroundColor: GLASS.backgroundColor,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: GLASS.borderColor,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: SPACING.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  daysBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: SPACING.sm,
  },
  daysText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // Tier Row
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.xs,
  },
  tierType: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  tierValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  notifBadge: {
    marginLeft: 'auto',
    padding: 4,
    borderRadius: 10,
    backgroundColor: `${COLORS.success}20`,
  },

  // Expanded
  expandedContent: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    gap: SPACING.xs,
  },
  extendButton: {
    backgroundColor: COLORS.success,
  },
  extendButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.background,
  },
  reminderButton: {
    backgroundColor: `${COLORS.gold}20`,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  reminderButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },

  // Access Denied
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accessDeniedText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.error,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  modalSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    marginBottom: 4,
  },
  modalTier: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: GLASS.borderColor,
  },
  quickDaysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  quickDayButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickDayButtonActive: {
    backgroundColor: COLORS.gold,
  },
  quickDayText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  quickDayTextActive: {
    color: COLORS.background,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  extendConfirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  extendConfirmText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.background,
  },

  // Filter Modal
  filterModalContent: {
    width: '90%',
    maxWidth: 300,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
  },
  filterModalTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 10,
  },
  filterOptionActive: {
    backgroundColor: `${COLORS.gold}20`,
  },
  filterOptionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
  },
  filterOptionTextActive: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // Logs Button
  logsButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default AdminExpiringUsersScreen;
