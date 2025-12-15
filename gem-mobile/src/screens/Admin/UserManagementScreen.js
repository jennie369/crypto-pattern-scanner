/**
 * Gemral - User Management Screen (Admin)
 *
 * Admin screen for viewing and managing users
 * Features: Search, filter, pagination, quick actions
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  Search,
  Filter,
  Users,
  Shield,
  ShieldOff,
  Crown,
  ChevronRight,
  ArrowLeft,
  UserX,
  X,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import adminUserService from '../../services/adminUserService';
import { showAlert } from '../../components/CustomAlert';

const TIER_COLORS = {
  free: COLORS.textMuted,
  basic: '#00D9FF',
  premium: COLORS.gold,
  vip: '#8B5CF6',
};

const UserManagementScreen = () => {
  const navigation = useNavigation();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    tier: null,
    role: null,
    isBanned: null,
  });
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState(null);

  const loadUsers = useCallback(async (resetPage = false) => {
    const currentPage = resetPage ? 1 : page;
    setLoading(true);

    try {
      const { data, count, error } = await adminUserService.getUsers({
        search: search || null,
        tier: filters.tier,
        role: filters.role,
        isBanned: filters.isBanned,
        page: currentPage,
        limit: 20,
      });

      if (error) {
        showAlert('Lỗi', error);
        return;
      }

      setUsers(resetPage ? data : [...users, ...data]);
      setTotalCount(count);

      if (resetPage) {
        setPage(1);
      }
    } catch (error) {
      console.error('[UserManagement] Load users error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, filters, page]);

  const loadStats = async () => {
    const data = await adminUserService.getUserStats();
    setStats(data);
  };

  useEffect(() => {
    loadUsers(true);
    loadStats();
  }, [filters]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers(true);
    loadStats();
  };

  const handleLoadMore = () => {
    if (users.length < totalCount && !loading) {
      setPage((p) => p + 1);
      loadUsers();
    }
  };

  const handleUserPress = (user) => {
    navigation.navigate('UserDetail', { userId: user.id, user });
  };

  const handleQuickBan = async (user) => {
    showAlert(
      user.is_banned ? 'Unban User' : 'Ban User',
      user.is_banned
        ? `Bạn có chắc muốn unban ${user.full_name || user.email}?`
        : `Bạn có chắc muốn ban ${user.full_name || user.email}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: user.is_banned ? 'Unban' : 'Ban',
          style: user.is_banned ? 'default' : 'destructive',
          onPress: async () => {
            const result = user.is_banned
              ? await adminUserService.unbanUser(user.id)
              : await adminUserService.banUser(user.id, 'Admin action');

            if (result.success) {
              showAlert('Thành công', result.message);
              loadUsers(true);
            } else {
              showAlert('Lỗi', result.error);
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <ArrowLeft size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Quản lý User</Text>
      <TouchableOpacity
        style={[styles.filterButton, showFilters && styles.filterButtonActive]}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Filter size={20} color={showFilters ? COLORS.gold : COLORS.textPrimary} />
      </TouchableOpacity>
    </View>
  );

  const renderStats = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Users size={16} color={COLORS.gold} />
          <Text style={styles.statValue}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Tổng</Text>
        </View>
        <View style={styles.statItem}>
          <Crown size={16} color="#8B5CF6" />
          <Text style={styles.statValue}>{stats.premiumUsers}</Text>
          <Text style={styles.statLabel}>Premium+</Text>
        </View>
        <View style={styles.statItem}>
          <ShieldOff size={16} color={COLORS.error} />
          <Text style={styles.statValue}>{stats.bannedUsers}</Text>
          <Text style={styles.statLabel}>Banned</Text>
        </View>
        <View style={styles.statItem}>
          <Users size={16} color={COLORS.success} />
          <Text style={styles.statValue}>{stats.newToday}</Text>
          <Text style={styles.statLabel}>Hôm nay</Text>
        </View>
      </View>
    );
  };

  const renderSearch = () => (
    <View style={styles.searchContainer}>
      <Search size={20} color={COLORS.textMuted} />
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm theo email, tên..."
        placeholderTextColor={COLORS.textMuted}
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {search.length > 0 && (
        <TouchableOpacity onPress={() => setSearch('')}>
          <X size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <View style={styles.filtersContainer}>
        {/* Tier Filter */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Tier:</Text>
          <View style={styles.filterOptions}>
            {['free', 'basic', 'premium', 'vip'].map((tier) => (
              <TouchableOpacity
                key={tier}
                style={[
                  styles.filterChip,
                  filters.tier === tier && styles.filterChipActive,
                ]}
                onPress={() =>
                  setFilters((f) => ({ ...f, tier: f.tier === tier ? null : tier }))
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filters.tier === tier && styles.filterChipTextActive,
                  ]}
                >
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Status Filter */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Trạng thái:</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filters.isBanned === true && styles.filterChipActive,
              ]}
              onPress={() =>
                setFilters((f) => ({
                  ...f,
                  isBanned: f.isBanned === true ? null : true,
                }))
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  filters.isBanned === true && styles.filterChipTextActive,
                ]}
              >
                Banned
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filters.isBanned === false && styles.filterChipActive,
              ]}
              onPress={() =>
                setFilters((f) => ({
                  ...f,
                  isBanned: f.isBanned === false ? null : false,
                }))
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  filters.isBanned === false && styles.filterChipTextActive,
                ]}
              >
                Active
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Clear Filters */}
        {(filters.tier || filters.role || filters.isBanned !== null) && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={() => setFilters({ tier: null, role: null, isBanned: null })}
          >
            <X size={14} color={COLORS.error} />
            <Text style={styles.clearFiltersText}>Xóa bộ lọc</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderUserItem = ({ item: user }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => handleUserPress(user)}>
      <Image
        source={{
          uri: user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=random`,
        }}
        style={styles.avatar}
      />

      <View style={styles.userInfo}>
        <View style={styles.userNameRow}>
          <Text style={styles.userName} numberOfLines={1}>
            {user.full_name || 'Chưa đặt tên'}
          </Text>
          {user.is_banned && (
            <View style={styles.bannedBadge}>
              <ShieldOff size={12} color={COLORS.error} />
            </View>
          )}
        </View>
        <Text style={styles.userEmail} numberOfLines={1}>
          {user.email}
        </Text>
        <View style={styles.userTags}>
          <View style={[styles.tierBadge, { backgroundColor: `${TIER_COLORS[user.scanner_tier] || TIER_COLORS.free}20` }]}>
            <Text style={[styles.tierText, { color: TIER_COLORS[user.scanner_tier] || TIER_COLORS.free }]}>
              {(user.scanner_tier || 'free').toUpperCase()}
            </Text>
          </View>
          {user.role !== 'user' && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user.role}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.quickAction, user.is_banned && styles.quickActionWarning]}
          onPress={() => handleQuickBan(user)}
        >
          {user.is_banned ? (
            <Shield size={18} color={COLORS.success} />
          ) : (
            <UserX size={18} color={COLORS.error} />
          )}
        </TouchableOpacity>
        <ChevronRight size={20} color={COLORS.textMuted} />
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Users size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>Không tìm thấy user</Text>
      <Text style={styles.emptySubtitle}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading || users.length === 0) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLORS.gold} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />

      {renderHeader()}
      {renderStats()}
      {renderSearch()}
      {renderFilters()}

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.gold}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={!loading ? renderEmpty : null}
        ListFooterComponent={renderFooter}
      />

      {loading && users.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  filterButton: {
    padding: SPACING.xs,
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.bgMid,
    borderRadius: 12,
    ...GLASS,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgMid,
    borderRadius: 12,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    height: 44,
    gap: SPACING.sm,
    ...GLASS,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  filtersContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  filterLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    width: 70,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  filterChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  clearFiltersText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.huge,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgMid,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    ...GLASS,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.bgMid,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  bannedBadge: {
    padding: 2,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 4,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  userTags: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  tierBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tierText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  roleText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#8B5CF6',
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  quickAction: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  quickActionWarning: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.huge * 2,
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  loadingFooter: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});

export default UserManagementScreen;
