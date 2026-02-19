/**
 * Gemral - Content Calendar Screen
 * Quản lý lịch đăng bài tự động
 * @description Admin UI cho Content Calendar
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
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import {
  Calendar,
  Plus,
  Filter,
  RefreshCw,
  AlertCircle,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Clock,
  Check,
  X,
  Send,
  Home,
  Facebook,
  Youtube,
  Instagram,
} from 'lucide-react-native';

// Services
import {
  getContentByDateRange,
  getContentStats,
  deleteContent,
  scheduleContent,
  cancelContent,
  PLATFORMS,
} from '../../services/contentCalendarService';

// Theme
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../../utils/tokens';
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

const PLATFORM_LABELS = {
  gemral: 'Gemral',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  threads: 'Threads',
  instagram: 'Instagram',
};

const STATUS_COLORS = {
  draft: COLORS.textMuted,
  scheduled: COLORS.info,
  posting: COLORS.warning,
  posted: COLORS.success,
  failed: COLORS.error,
  cancelled: '#9ca3af',
};

const STATUS_LABELS = {
  draft: 'Nháp',
  scheduled: 'Đã lên lịch',
  posting: 'Đang đăng',
  posted: 'Đã đăng',
  failed: 'Thất bại',
  cancelled: 'Đã hủy',
};

// ========== COMPONENT ==========
const ContentCalendarScreen = () => {
  const navigation = useNavigation();
  const { alert, AlertComponent } = useCustomAlert();

  // ========== STATE ==========
  const [contentByDate, setContentByDate] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Date navigation
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Action menu
  const [selectedItem, setSelectedItem] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);

  // ========== COMPUTED ==========
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  // ========== EFFECTS ==========
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [currentMonth])
  );

  // Rule 31: Recovery listener for app resume
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[ContentCalendar] Force refresh received');
      setLoading(false);
      setRefreshing(false);
      setTimeout(() => fetchData(), 50); // Rule 57: Break React 18 batch
    });
    return () => listener.remove();
  }, []);

  // ========== DATA FETCHING ==========
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch content for current month
      const startDate = monthStart.toISOString().split('T')[0];
      const endDate = monthEnd.toISOString().split('T')[0];

      const [contentResult, statsResult] = await Promise.all([
        getContentByDateRange(startDate, endDate),
        getContentStats(),
      ]);

      if (!contentResult.success) {
        throw new Error(contentResult.error);
      }

      setContentByDate(contentResult.data);
      setStats(statsResult.data);
    } catch (err) {
      console.error('[ContentCalendar] Fetch error:', err);
      setError(err?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // ========== HANDLERS ==========
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleAddContent = () => {
    navigation.navigate('ContentEditor', { mode: 'add' });
  };

  const handleEditContent = (item) => {
    setShowActionModal(false);
    navigation.navigate('ContentEditor', { mode: 'edit', contentId: item?.id });
  };

  const handleDeleteContent = async (item) => {
    alert({
      type: 'warning',
      title: 'Xác nhận xóa',
      message: `Bạn có chắc muốn xóa "${item?.title || 'nội dung này'}"?`,
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setShowActionModal(false);
            const result = await deleteContent(item?.id);
            if (result.success) {
              alert({
                type: 'success',
                title: 'Thành công',
                message: 'Đã xóa nội dung'
              });
              fetchData();
            } else {
              alert({
                type: 'error',
                title: 'Lỗi',
                message: result.error || 'Không thể xóa'
              });
            }
          },
        },
      ]
    });
  };

  const handleScheduleContent = async (item) => {
    setShowActionModal(false);
    const result = await scheduleContent(item?.id);
    if (result.success) {
      alert({
        type: 'success',
        title: 'Thành công',
        message: 'Đã lên lịch đăng'
      });
      fetchData();
    } else {
      alert({
        type: 'error',
        title: 'Lỗi',
        message: result.error || 'Không thể lên lịch'
      });
    }
  };

  const handleCancelContent = async (item) => {
    setShowActionModal(false);
    const result = await cancelContent(item?.id);
    if (result.success) {
      alert({
        type: 'success',
        title: 'Thành công',
        message: 'Đã hủy lịch đăng'
      });
      fetchData();
    } else {
      alert({
        type: 'error',
        title: 'Lỗi',
        message: result.error || 'Không thể hủy'
      });
    }
  };

  const handleItemPress = (item) => {
    setSelectedItem(item);
    setShowActionModal(true);
  };

  // ========== RENDER HELPERS ==========
  const renderStats = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.todayScheduled || 0}</Text>
          <Text style={styles.statLabel}>Hôm nay</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.weekScheduled || 0}</Text>
          <Text style={styles.statLabel}>Tuần này</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.byStatus?.posted || 0}</Text>
          <Text style={styles.statLabel}>Đã đăng</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: COLORS.error }]}>
            {stats.byStatus?.failed || 0}
          </Text>
          <Text style={styles.statLabel}>Lỗi</Text>
        </View>
      </View>
    );
  };

  const renderPlatformIcon = (platform) => {
    const iconProps = { size: 14, color: PLATFORM_COLORS[platform] || COLORS.textMuted };
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

  const renderDateItem = ({ item: dateString }) => {
    const items = contentByDate[dateString] || [];
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' });
    const dayNum = date.getDate();
    const isToday = dateString === new Date().toISOString().split('T')[0];

    return (
      <View style={[styles.dateSection, isToday && styles.todaySection]}>
        <View style={styles.dateHeader}>
          <Text style={[styles.dayName, isToday && styles.todayText]}>{dayName}</Text>
          <Text style={[styles.dayNum, isToday && styles.todayText]}>{dayNum}</Text>
        </View>

        <View style={styles.dateContent}>
          {items.length === 0 ? (
            <Text style={styles.emptyDateText}>Không có nội dung</Text>
          ) : (
            items.map((item) => (
              <TouchableOpacity
                key={item?.id}
                style={styles.contentItem}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.platformIndicator, { backgroundColor: PLATFORM_COLORS[item?.platform] || COLORS.textMuted }]} />
                <View style={styles.contentInfo}>
                  <Text style={styles.contentTitle} numberOfLines={1}>
                    {item?.title || 'Không có tiêu đề'}
                  </Text>
                  <View style={styles.contentMeta}>
                    <View style={styles.platformRow}>
                      {renderPlatformIcon(item?.platform)}
                      <Text style={styles.contentPlatform}>
                        {PLATFORM_LABELS[item?.platform] || item?.platform}
                      </Text>
                    </View>
                    <Text style={styles.contentTime}>
                      {item?.scheduled_time?.substring(0, 5) || '--:--'}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item?.status] || COLORS.textMuted }]}>
                  <Text style={styles.statusText}>{STATUS_LABELS[item?.status] || item?.status}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>
    );
  };

  const renderActionModal = () => {
    if (!selectedItem) return null;

    return (
      <Modal
        visible={showActionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActionModal(false)}
        >
          <View style={styles.actionModal}>
            <Text style={styles.actionModalTitle} numberOfLines={2}>
              {selectedItem?.title || 'Nội dung'}
            </Text>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleEditContent(selectedItem)}
            >
              <Edit2 size={20} color={COLORS.textPrimary} />
              <Text style={styles.actionItemText}>Chỉnh sửa</Text>
            </TouchableOpacity>

            {selectedItem?.status === 'draft' && (
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => handleScheduleContent(selectedItem)}
              >
                <Clock size={20} color={COLORS.info} />
                <Text style={[styles.actionItemText, { color: COLORS.info }]}>Lên lịch đăng</Text>
              </TouchableOpacity>
            )}

            {selectedItem?.status === 'scheduled' && (
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => handleCancelContent(selectedItem)}
              >
                <X size={20} color={COLORS.warning} />
                <Text style={[styles.actionItemText, { color: COLORS.warning }]}>Hủy lịch</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleDeleteContent(selectedItem)}
            >
              <Trash2 size={20} color={COLORS.error} />
              <Text style={[styles.actionItemText, { color: COLORS.error }]}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // ========== LOADING STATE ==========
  if (loading && !refreshing) {
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
  if (error) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.centerContainer}>
          <AlertCircle size={48} color={COLORS.error} />
          <Text style={styles.errorTitle}>Đã có lỗi xảy ra</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <RefreshCw size={18} color={COLORS.gold} />
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ========== MAIN RENDER ==========
  const sortedDates = Object.keys(contentByDate).sort();

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Calendar size={24} color={COLORS.gold} />
            <Text style={styles.headerTitle}>Content Calendar</Text>
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => navigation.navigate('AutoPostLogs')}
          >
            <Clock size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        {renderStats()}

        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
            <ChevronRight size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Content List */}
        {sortedDates.length === 0 ? (
          <View style={styles.centerContainer}>
            <Inbox size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Chưa có nội dung</Text>
            <Text style={styles.emptyMessage}>Bấm + để thêm nội dung mới</Text>
          </View>
        ) : (
          <FlatList
            data={sortedDates}
            keyExtractor={(item) => item}
            renderItem={renderDateItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.gold}
              />
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* FAB */}
        <TouchableOpacity style={styles.fab} onPress={handleAddContent}>
          <Plus size={24} color={COLORS.bgDarkest} />
        </TouchableOpacity>

        {/* Action Modal */}
        {renderActionModal()}

        {/* Alert Component */}
        {AlertComponent}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  filterButton: {
    padding: SPACING.sm,
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
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  navButton: {
    padding: SPACING.sm,
  },
  monthText: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  listContent: {
    paddingBottom: 100,
  },
  dateSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  todaySection: {
    backgroundColor: 'rgba(255,189,89,0.1)',
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  dayName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  dayNum: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  todayText: {
    color: COLORS.gold,
  },
  dateContent: {
    marginLeft: SPACING.md,
  },
  emptyDateText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    padding: SPACING.sm,
    borderRadius: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  platformIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: SPACING.sm,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  contentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: SPACING.md,
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  contentPlatform: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  contentTime: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: SPACING.sm,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#fff',
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textTransform: 'uppercase',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionModal: {
    width: '80%',
    backgroundColor: COLORS.bgMid,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionModalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    gap: SPACING.md,
  },
  actionItemText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    color: COLORS.textPrimary,
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
  },
});

export default ContentCalendarScreen;
