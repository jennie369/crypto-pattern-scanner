/**
 * Gemral - Admin Expiration Logs Screen
 * View history of auto-revoked subscriptions
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
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  History,
  Clock,
  Crown,
  ArrowDown,
  User,
  Calendar,
  Shield,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, GLASS } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';
import subscriptionExpirationService from '../../services/subscriptionExpirationService';

const TIER_TYPE_NAMES = {
  chatbot_tier: 'GEM Master AI',
  scanner_tier: 'Pattern Scanner',
  course_tier: 'Khóa học',
};

const REVOKE_METHOD_NAMES = {
  auto: 'Tự động',
  manual: 'Thủ công',
  scheduled: 'Đã lên lịch',
};

const AdminExpirationLogsScreen = ({ navigation }) => {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 30;

  // Load logs
  const loadLogs = useCallback(async (pageNum = 1, append = false) => {
    try {
      const result = await subscriptionExpirationService.getExpirationLogs({
        limit: LIMIT,
        offset: (pageNum - 1) * LIMIT,
      });

      if (result.success) {
        const newLogs = result.data || [];
        if (append) {
          setLogs(prev => [...prev, ...newLogs]);
        } else {
          setLogs(newLogs);
        }
        setHasMore(newLogs.length === LIMIT);
      }
    } catch (error) {
      console.error('[AdminExpirationLogs] Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Refresh
  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadLogs(1);
  };

  // Load more
  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadLogs(nextPage, true);
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render log item
  const renderLogItem = ({ item }) => {
    const tierTypeName = TIER_TYPE_NAMES[item.tier_type] || item.tier_type;
    const revokeMethodName = REVOKE_METHOD_NAMES[item.revoke_method] || item.revoke_method;

    return (
      <View style={styles.logCard}>
        <View style={styles.logHeader}>
          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.full_name || item.email || 'Unknown'}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {item.email}
            </Text>
          </View>

          {/* Revoke Method Badge */}
          <View style={[
            styles.methodBadge,
            item.revoke_method === 'auto' && styles.methodBadgeAuto,
            item.revoke_method === 'manual' && styles.methodBadgeManual,
          ]}>
            <Shield size={12} color={item.revoke_method === 'auto' ? COLORS.primary : COLORS.gold} />
            <Text style={styles.methodText}>{revokeMethodName}</Text>
          </View>
        </View>

        {/* Tier Change */}
        <View style={styles.tierChangeRow}>
          <View style={styles.tierItem}>
            <Crown size={14} color={COLORS.gold} />
            <Text style={styles.tierType}>{tierTypeName}</Text>
          </View>

          <View style={styles.tierChange}>
            <View style={[styles.tierBadge, styles.oldTierBadge]}>
              <Text style={styles.tierBadgeText}>{item.old_tier}</Text>
            </View>
            <ArrowDown size={16} color={COLORS.textSecondary} style={{ transform: [{ rotate: '-90deg' }] }} />
            <View style={[styles.tierBadge, styles.newTierBadge]}>
              <Text style={styles.tierBadgeText}>{item.new_tier}</Text>
            </View>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.datesRow}>
          <View style={styles.dateItem}>
            <Clock size={12} color={COLORS.textSecondary} />
            <Text style={styles.dateLabel}>Hết hạn:</Text>
            <Text style={styles.dateValue}>{formatDate(item.expired_at)}</Text>
          </View>
          <View style={styles.dateItem}>
            <Calendar size={12} color={COLORS.textSecondary} />
            <Text style={styles.dateLabel}>Revoked:</Text>
            <Text style={styles.dateValue}>{formatDate(item.revoked_at)}</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render empty
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <History size={48} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>Chưa có lịch sử</Text>
      <Text style={styles.emptyText}>
        Chưa có subscription nào bị revoke
      </Text>
    </View>
  );

  // Render footer
  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.gold} />
      </View>
    );
  };

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
      {/* Header */}
      <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <History size={24} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Lịch Sử Revoke</Text>
        </View>

        <View style={styles.placeholder} />
      </LinearGradient>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Clock size={16} color={COLORS.primary} />
        <Text style={styles.infoText}>
          Danh sách subscriptions đã bị revoke tự động hoặc thủ công
        </Text>
      </View>

      {/* Logs List */}
      {loading && logs.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={renderLogItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
            />
          }
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  placeholder: {
    width: 40,
  },

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}15`,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
  },

  // List
  listContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },

  // Log Card
  logCard: {
    backgroundColor: GLASS.backgroundColor,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: GLASS.borderColor,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
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
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  methodBadgeAuto: {
    backgroundColor: `${COLORS.primary}20`,
  },
  methodBadgeManual: {
    backgroundColor: `${COLORS.gold}20`,
  },
  methodText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text,
  },

  // Tier Change
  tierChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  tierType: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  tierChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  tierBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  oldTierBadge: {
    backgroundColor: `${COLORS.error}20`,
  },
  newTierBadge: {
    backgroundColor: `${COLORS.textSecondary}20`,
  },
  tierBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
  },

  // Dates
  datesRow: {
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dateLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  dateValue: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text,
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
    marginTop: SPACING.sm,
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
  footerLoader: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
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
});

export default AdminExpirationLogsScreen;
