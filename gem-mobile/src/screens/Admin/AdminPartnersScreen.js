/**
 * AdminPartnersScreen
 * Full partner management screen - list, filter, view details, update tier, activate/deactivate
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  ChevronRight,
  Star,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  Edit3,
  UserCheck,
  UserX,
  X,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import { CONTENT_BOTTOM_PADDING } from '../../constants/layout';
import { CTV_TIER_CONFIG, formatCurrency } from '../../constants/partnershipConstants';
import ADMIN_PARTNERSHIP_SERVICE from '../../services/adminPartnershipService';

// Tier display config
const TIER_OPTIONS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'bronze', label: 'Bronze' },
  { key: 'silver', label: 'Silver' },
  { key: 'gold', label: 'Gold' },
  { key: 'platinum', label: 'Platinum' },
  { key: 'diamond', label: 'Diamond' },
];

const ROLE_OPTIONS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'ctv', label: 'CTV' },
  { key: 'kol', label: 'KOL' },
];

// Partner Card Component
const PartnerCard = ({ partner, onPress, onUpdateTier, onToggleStatus }) => {
  const tierConfig = CTV_TIER_CONFIG[partner.ctv_tier] || CTV_TIER_CONFIG.bronze;

  return (
    <TouchableOpacity style={styles.partnerCard} onPress={() => onPress(partner)} activeOpacity={0.7}>
      <View style={styles.partnerHeader}>
        <View style={styles.partnerInfo}>
          <View style={[styles.avatar, { backgroundColor: tierConfig.color + '30' }]}>
            <Text style={[styles.avatarText, { color: tierConfig.color }]}>
              {partner.user?.full_name?.charAt(0) || 'P'}
            </Text>
          </View>
          <View style={styles.partnerDetails}>
            <Text style={styles.partnerName} numberOfLines={1}>
              {partner.user?.full_name || 'Đối tác'}
            </Text>
            <Text style={styles.partnerEmail} numberOfLines={1}>
              {partner.user?.email || partner.referral_code}
            </Text>
          </View>
        </View>
        <View style={styles.partnerBadges}>
          <View style={[styles.tierBadge, { backgroundColor: tierConfig.color + '20' }]}>
            <Text style={[styles.tierBadgeText, { color: tierConfig.color }]}>
              {tierConfig.name}
            </Text>
          </View>
          {partner.is_kol && (
            <View style={[styles.kolBadge]}>
              <Star size={10} color="#9C27B0" />
              <Text style={styles.kolBadgeText}>KOL</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.partnerStats}>
        <View style={styles.statItem}>
          <DollarSign size={14} color={COLORS.gold} />
          <Text style={styles.statValue}>{formatCurrency(partner.total_sales || 0)}</Text>
          <Text style={styles.statLabel}>Doanh số</Text>
        </View>
        <View style={styles.statItem}>
          <Users size={14} color={COLORS.info} />
          <Text style={styles.statValue}>{partner.direct_referrals_count || 0}</Text>
          <Text style={styles.statLabel}>Giới thiệu</Text>
        </View>
        <View style={styles.statItem}>
          <TrendingUp size={14} color={COLORS.success} />
          <Text style={styles.statValue}>{formatCurrency(partner.total_commission || 0)}</Text>
          <Text style={styles.statLabel}>Hoa hồng</Text>
        </View>
      </View>

      <View style={styles.partnerActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onUpdateTier(partner)}
        >
          <Edit3 size={16} color={COLORS.gold} />
          <Text style={styles.actionBtnText}>Đổi tier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, partner.is_active ? styles.actionBtnDanger : styles.actionBtnSuccess]}
          onPress={() => onToggleStatus(partner)}
        >
          {partner.is_active ? (
            <>
              <UserX size={16} color={COLORS.error} />
              <Text style={[styles.actionBtnText, { color: COLORS.error }]}>Vô hiệu</Text>
            </>
          ) : (
            <>
              <UserCheck size={16} color={COLORS.success} />
              <Text style={[styles.actionBtnText, { color: COLORS.success }]}>Kích hoạt</Text>
            </>
          )}
        </TouchableOpacity>
        <ChevronRight size={20} color={COLORS.textMuted} />
      </View>
    </TouchableOpacity>
  );
};

// Main Component
const AdminPartnersScreen = () => {
  const navigation = useNavigation();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [partners, setPartners] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  // Filters
  const [roleFilter, setRoleFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showTierModal, setShowTierModal] = useState(false);
  const [newTier, setNewTier] = useState('');
  const [tierReason, setTierReason] = useState('');
  const [updating, setUpdating] = useState(false);

  // Load partners
  const loadPartners = useCallback(async (resetPage = false) => {
    try {
      const currentPage = resetPage ? 0 : page;

      const result = await ADMIN_PARTNERSHIP_SERVICE.getPartners({
        role: roleFilter,
        tier: tierFilter,
        page: currentPage,
        limit: 20,
        search: searchQuery,
        sortBy: 'total_sales',
        sortOrder: 'desc',
      });

      if (resetPage) {
        setPartners(result.data);
        setPage(0);
      } else {
        setPartners(prev => [...prev, ...result.data]);
      }

      setTotalCount(result.count);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('[AdminPartners] Load error:', err);
      Alert.alert('Lỗi', 'Không thể tải danh sách đối tác');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [page, roleFilter, tierFilter, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadPartners(true);
    }, [roleFilter, tierFilter])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadPartners(true);
  };

  const loadMore = () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setPage(prev => prev + 1);
    loadPartners(false);
  };

  // Handle search
  const handleSearch = () => {
    setLoading(true);
    loadPartners(true);
  };

  // Handle partner press - show details
  const handlePartnerPress = (partner) => {
    navigation.navigate('AdminApplicationDetail', {
      partnerId: partner.id,
      partnerData: partner,
      mode: 'view'
    });
  };

  // Handle update tier
  const handleUpdateTier = (partner) => {
    setSelectedPartner(partner);
    setNewTier(partner.ctv_tier);
    setTierReason('');
    setShowTierModal(true);
  };

  const submitTierUpdate = async () => {
    if (!newTier || newTier === selectedPartner.ctv_tier) {
      Alert.alert('Thông báo', 'Vui lòng chọn tier mới khác tier hiện tại');
      return;
    }

    setUpdating(true);
    try {
      const result = await ADMIN_PARTNERSHIP_SERVICE.updatePartnerTier(
        selectedPartner.id,
        newTier,
        tierReason
      );

      if (result.success) {
        Alert.alert('Thành công', 'Đã cập nhật tier cho đối tác');
        setShowTierModal(false);
        loadPartners(true);
      } else {
        Alert.alert('Lỗi', result.error || 'Không thể cập nhật tier');
      }
    } catch (err) {
      Alert.alert('Lỗi', err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = (partner) => {
    const action = partner.is_active ? 'vô hiệu hóa' : 'kích hoạt lại';

    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn ${action} đối tác "${partner.user?.full_name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          style: partner.is_active ? 'destructive' : 'default',
          onPress: async () => {
            try {
              let result;
              if (partner.is_active) {
                result = await ADMIN_PARTNERSHIP_SERVICE.deactivatePartner(partner.id, 'Admin vô hiệu hóa');
              } else {
                result = await ADMIN_PARTNERSHIP_SERVICE.reactivatePartner(partner.id);
              }

              if (result.success) {
                Alert.alert('Thành công', `Đã ${action} đối tác`);
                loadPartners(true);
              } else {
                Alert.alert('Lỗi', result.error || 'Không thể thực hiện');
              }
            } catch (err) {
              Alert.alert('Lỗi', err.message);
            }
          },
        },
      ]
    );
  };

  // Render partner item
  const renderPartner = ({ item }) => (
    <PartnerCard
      partner={item}
      onPress={handlePartnerPress}
      onUpdateTier={handleUpdateTier}
      onToggleStatus={handleToggleStatus}
    />
  );

  // Render footer (loading more indicator)
  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: CONTENT_BOTTOM_PADDING }} />;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator color={COLORS.gold} />
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyState}>
        <Users size={48} color={COLORS.textMuted} />
        <Text style={styles.emptyText}>Không tìm thấy đối tác nào</Text>
      </View>
    );
  };

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý đối tác</Text>
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={styles.filterButton}>
            <Filter size={20} color={showFilters ? COLORS.gold : COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Search size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm theo tên, email, mã giới thiệu..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Loại:</Text>
              <View style={styles.filterOptions}>
                {ROLE_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.filterChip, roleFilter === option.key && styles.filterChipActive]}
                    onPress={() => setRoleFilter(option.key)}
                  >
                    <Text style={[styles.filterChipText, roleFilter === option.key && styles.filterChipTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Tier:</Text>
              <View style={styles.filterOptions}>
                {TIER_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.filterChip, tierFilter === option.key && styles.filterChipActive]}
                    onPress={() => setTierFilter(option.key)}
                  >
                    <Text style={[styles.filterChipText, tierFilter === option.key && styles.filterChipTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Stats Summary */}
        <View style={styles.statsSummary}>
          <Text style={styles.totalText}>Tổng: {totalCount} đối tác</Text>
        </View>

        {/* Partners List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
          </View>
        ) : (
          <FlatList
            data={partners}
            keyExtractor={item => item.id}
            renderItem={renderPartner}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
          />
        )}

        {/* Update Tier Modal */}
        <Modal visible={showTierModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Cập nhật Tier</Text>
                <TouchableOpacity onPress={() => setShowTierModal(false)}>
                  <X size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>
                Đối tác: {selectedPartner?.user?.full_name}
              </Text>
              <Text style={styles.modalSubLabel}>
                Tier hiện tại: {CTV_TIER_CONFIG[selectedPartner?.ctv_tier]?.name || 'Bronze'}
              </Text>

              <Text style={styles.modalLabel}>Chọn tier mới:</Text>
              <View style={styles.tierOptions}>
                {TIER_OPTIONS.filter(t => t.key !== 'all').map(tier => (
                  <TouchableOpacity
                    key={tier.key}
                    style={[
                      styles.tierOption,
                      newTier === tier.key && styles.tierOptionActive,
                      { borderColor: CTV_TIER_CONFIG[tier.key]?.color || COLORS.gold }
                    ]}
                    onPress={() => setNewTier(tier.key)}
                  >
                    <Text style={[
                      styles.tierOptionText,
                      newTier === tier.key && { color: CTV_TIER_CONFIG[tier.key]?.color }
                    ]}>
                      {tier.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Lý do (tùy chọn):</Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="Nhập lý do thay đổi tier..."
                placeholderTextColor={COLORS.textMuted}
                value={tierReason}
                onChangeText={setTierReason}
                multiline
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowTierModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitButton, updating && styles.submitButtonDisabled]}
                  onPress={submitTierUpdate}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator color={COLORS.bgDarkest} size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>Cập nhật</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  filterButton: {
    padding: SPACING.xs,
  },

  // Search
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm,
    marginLeft: SPACING.sm,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.md,
  },

  // Filters
  filtersContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
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
    width: 40,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  filterChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(255,189,89,0.15)',
    borderColor: COLORS.gold,
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  filterChipTextActive: {
    color: COLORS.gold,
  },

  // Stats Summary
  statsSummary: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  totalText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  // List
  listContent: {
    paddingHorizontal: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMore: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },

  // Partner Card
  partnerCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  partnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  partnerDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  partnerName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  partnerEmail: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  partnerBadges: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  tierBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tierBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  kolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(156,39,176,0.2)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  kolBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#9C27B0',
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Partner Stats
  partnerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Partner Actions
  partnerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(255,189,89,0.1)',
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  actionBtnDanger: {
    backgroundColor: 'rgba(244,67,54,0.1)',
  },
  actionBtnSuccess: {
    backgroundColor: 'rgba(76,175,80,0.1)',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bgDark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    maxHeight: '80%',
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
    color: COLORS.textPrimary,
  },
  modalLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  modalSubLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
  },

  // Tier Options
  tierOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tierOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  tierOptionActive: {
    backgroundColor: 'rgba(255,189,89,0.1)',
  },
  tierOptionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },

  // Reason Input
  reasonInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.md,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  // Modal Actions
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  submitButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.bgDarkest,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});

export default AdminPartnersScreen;
