/**
 * Gemral - Support Tickets Screen (Admin)
 *
 * Admin view for managing support tickets
 * Features: List view, filters, status management
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
  ArrowLeft,
  Search,
  Filter,
  MessageSquare,
  Clock,
  AlertTriangle,
  ChevronRight,
  User,
  X,
  CheckCircle,
  Circle,
  Loader,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import supportTicketService, {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_CATEGORIES,
} from '../../services/supportTicketService';
import { showAlert } from '../../components/CustomAlert';

const SupportTicketsScreen = () => {
  const navigation = useNavigation();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: null,
    priority: null,
    assignedTo: null,
  });
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState(null);

  const loadTickets = useCallback(async (resetPage = false) => {
    const currentPage = resetPage ? 1 : page;
    setLoading(true);

    try {
      const { data, count, error } = await supportTicketService.getAllTickets({
        search: search || null,
        status: filters.status,
        priority: filters.priority,
        assignedTo: filters.assignedTo,
        page: currentPage,
        limit: 20,
      });

      if (error) {
        showAlert('Lỗi', error);
        return;
      }

      setTickets(resetPage ? data : [...tickets, ...data]);
      setTotalCount(count);

      if (resetPage) {
        setPage(1);
      }
    } catch (error) {
      console.error('[SupportTickets] Load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, filters, page]);

  const loadStats = async () => {
    const data = await supportTicketService.getTicketStats();
    setStats(data);
  };

  useEffect(() => {
    loadTickets(true);
    loadStats();
  }, [filters]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTickets(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTickets(true);
    loadStats();
  };

  const handleLoadMore = () => {
    if (tickets.length < totalCount && !loading) {
      setPage((p) => p + 1);
      loadTickets();
    }
  };

  const handleTicketPress = (ticket) => {
    navigation.navigate('TicketDetail', { ticketId: ticket.id, ticket });
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Vừa xong';
    if (diffHours < 24) return `${diffHours}h trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return d.toLocaleDateString('vi-VN');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <Circle size={14} color={TICKET_STATUSES[0].color} />;
      case 'in_progress':
        return <Loader size={14} color={TICKET_STATUSES[1].color} />;
      case 'resolved':
        return <CheckCircle size={14} color={TICKET_STATUSES[3].color} />;
      default:
        return <Circle size={14} color={COLORS.textMuted} />;
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <ArrowLeft size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Hỗ trợ</Text>
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
          <MessageSquare size={16} color={COLORS.gold} />
          <Text style={styles.statValue}>{stats.total_tickets}</Text>
          <Text style={styles.statLabel}>Tổng</Text>
        </View>
        <View style={styles.statItem}>
          <Circle size={16} color="#22C55E" />
          <Text style={styles.statValue}>{stats.open_tickets}</Text>
          <Text style={styles.statLabel}>Mở</Text>
        </View>
        <View style={styles.statItem}>
          <Loader size={16} color="#00D9FF" />
          <Text style={styles.statValue}>{stats.in_progress_tickets}</Text>
          <Text style={styles.statLabel}>Đang xử lý</Text>
        </View>
        <View style={styles.statItem}>
          <AlertTriangle size={16} color="#FFBD59" />
          <Text style={styles.statValue}>{stats.unassigned_tickets}</Text>
          <Text style={styles.statLabel}>Chưa gán</Text>
        </View>
      </View>
    );
  };

  const renderSearch = () => (
    <View style={styles.searchContainer}>
      <Search size={20} color={COLORS.textMuted} />
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm theo số ticket, tiêu đề..."
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
        {/* Status Filter */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Trạng thái:</Text>
          <View style={styles.filterOptions}>
            {TICKET_STATUSES.slice(0, 3).map((status) => (
              <TouchableOpacity
                key={status.key}
                style={[
                  styles.filterChip,
                  filters.status === status.key && styles.filterChipActive,
                ]}
                onPress={() =>
                  setFilters((f) => ({
                    ...f,
                    status: f.status === status.key ? null : status.key,
                  }))
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filters.status === status.key && styles.filterChipTextActive,
                  ]}
                >
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Priority Filter */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Ưu tiên:</Text>
          <View style={styles.filterOptions}>
            {TICKET_PRIORITIES.map((priority) => (
              <TouchableOpacity
                key={priority.key}
                style={[
                  styles.filterChip,
                  filters.priority === priority.key && styles.filterChipActive,
                ]}
                onPress={() =>
                  setFilters((f) => ({
                    ...f,
                    priority: f.priority === priority.key ? null : priority.key,
                  }))
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filters.priority === priority.key && styles.filterChipTextActive,
                  ]}
                >
                  {priority.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Assignment Filter */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Gán cho:</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filters.assignedTo === 'unassigned' && styles.filterChipActive,
              ]}
              onPress={() =>
                setFilters((f) => ({
                  ...f,
                  assignedTo: f.assignedTo === 'unassigned' ? null : 'unassigned',
                }))
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  filters.assignedTo === 'unassigned' && styles.filterChipTextActive,
                ]}
              >
                Chưa gán
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Clear Filters */}
        {(filters.status || filters.priority || filters.assignedTo) && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={() => setFilters({ status: null, priority: null, assignedTo: null })}
          >
            <X size={14} color={COLORS.error} />
            <Text style={styles.clearFiltersText}>Xóa bộ lọc</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderTicketItem = ({ item: ticket }) => {
    const priorityConfig = supportTicketService.getPriorityConfig(ticket.priority);
    const statusConfig = supportTicketService.getStatusConfig(ticket.status);
    const categoryConfig = supportTicketService.getCategoryConfig(ticket.category);

    return (
      <TouchableOpacity style={styles.ticketItem} onPress={() => handleTicketPress(ticket)}>
        <View style={styles.ticketHeader}>
          <View style={styles.ticketNumberRow}>
            <Text style={styles.ticketNumber}>{ticket.ticket_number}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: `${priorityConfig.color}20` }]}>
              <Text style={[styles.priorityText, { color: priorityConfig.color }]}>
                {priorityConfig.label}
              </Text>
            </View>
          </View>
          <View style={styles.statusBadge}>
            {getStatusIcon(ticket.status)}
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <Text style={styles.ticketSubject} numberOfLines={2}>
          {ticket.subject}
        </Text>

        <View style={styles.ticketMeta}>
          <View style={styles.metaItem}>
            <User size={12} color={COLORS.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>
              {ticket.user?.full_name || ticket.user?.email || 'Ẩn danh'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Clock size={12} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{formatDate(ticket.created_at)}</Text>
          </View>
          {ticket.messages?.[0]?.count > 1 && (
            <View style={styles.metaItem}>
              <MessageSquare size={12} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{ticket.messages[0].count}</Text>
            </View>
          )}
        </View>

        <View style={styles.ticketFooter}>
          <View style={[styles.categoryBadge, { backgroundColor: `${categoryConfig.color}15` }]}>
            <Text style={[styles.categoryText, { color: categoryConfig.color }]}>
              {categoryConfig.label}
            </Text>
          </View>
          {ticket.assigned ? (
            <View style={styles.assignedTo}>
              <Image
                source={{
                  uri: ticket.assigned.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(ticket.assigned.full_name || 'A')}&background=random`,
                }}
                style={styles.assignedAvatar}
              />
            </View>
          ) : (
            <Text style={styles.unassignedText}>Chưa gán</Text>
          )}
        </View>

        <ChevronRight
          size={18}
          color={COLORS.textMuted}
          style={styles.chevron}
        />
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MessageSquare size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>Không có ticket</Text>
      <Text style={styles.emptySubtitle}>Chưa có ticket nào cần xử lý</Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading || tickets.length === 0) return null;

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
        data={tickets}
        renderItem={renderTicketItem}
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

      {loading && tickets.length === 0 && (
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
  ticketItem: {
    backgroundColor: COLORS.bgMid,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...GLASS,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ticketNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  ticketNumber: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  ticketSubject: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  ticketMeta: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    maxWidth: 100,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  assignedTo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assignedAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  unassignedText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  chevron: {
    position: 'absolute',
    right: SPACING.md,
    top: '50%',
    marginTop: -9,
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

export default SupportTicketsScreen;
