/**
 * Gemral - Waitlist Leads Admin Screen
 * Manage waitlist leads from landing page
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  Share,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  X,
  Phone,
  Mail,
  Calendar,
  Tag,
  Star,
  Zap,
  RefreshCw,
  Download,
  ExternalLink,
  MessageCircle,
  ShoppingBag,
  Eye,
  Clock,
  Target,
  Award,
  FileText,
} from 'lucide-react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import AdminTooltip from '../../components/Admin/AdminTooltip';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, GLASS } from '../../utils/tokens';
import { CONTENT_BOTTOM_PADDING } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import waitlistLeadService, {
  LEAD_STATUS_OPTIONS as IMPORTED_LEAD_STATUS_OPTIONS,
  LEAD_GRADE_COLORS as IMPORTED_LEAD_GRADE_COLORS,
  INTEREST_LABELS as IMPORTED_INTEREST_LABELS,
  INTEREST_ICONS as IMPORTED_INTEREST_ICONS,
} from '../../services/waitlistLeadService';

// Fallback values in case imports fail
const LEAD_STATUS_OPTIONS = IMPORTED_LEAD_STATUS_OPTIONS || ['all', 'new', 'engaged', 'qualified', 'hot', 'converted', 'inactive'];
const LEAD_GRADE_COLORS = IMPORTED_LEAD_GRADE_COLORS || { A: '#22C55E', B: '#3B82F6', C: '#F59E0B', D: '#EF4444' };
const INTEREST_LABELS = IMPORTED_INTEREST_LABELS || {};
const INTEREST_ICONS = IMPORTED_INTEREST_ICONS || {};

// Status labels and colors
const STATUS_CONFIG = {
  new: { label: 'Mới', color: '#6B7280', icon: Star },
  engaged: { label: 'Đã tương tác', color: '#3B82F6', icon: MessageCircle },
  qualified: { label: 'Tiềm năng', color: '#8B5CF6', icon: Target },
  hot: { label: 'Hot', color: '#EF4444', icon: Zap },
  converted: { label: 'Đã chuyển đổi', color: '#22C55E', icon: Award },
  inactive: { label: 'Không hoạt động', color: '#9CA3AF', icon: Clock },
};

const WaitlistLeadsScreen = ({ navigation }) => {
  const { isAdmin } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();

  // State
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedLead, setExpandedLead] = useState(null);
  const [detailModal, setDetailModal] = useState({ visible: false, lead: null });
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const statsData = await waitlistLeadService.getLeadStats();
      setStats(statsData);
    } catch (error) {
      console.error('[WaitlistLeads] Error loading stats:', error);
    }
  }, []);

  // Load leads
  const loadLeads = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setOffset(0);
      }

      const currentOffset = reset ? 0 : offset;
      const result = await waitlistLeadService.getLeads({
        status: statusFilter,
        search: searchQuery,
        limit: LIMIT,
        offset: currentOffset,
      });

      if (reset) {
        setLeads(result.leads);
      } else {
        setLeads((prev) => [...prev, ...result.leads]);
      }

      setHasMore(result.hasMore);
      setOffset(currentOffset + result.leads.length);
    } catch (error) {
      console.error('[WaitlistLeads] Error loading leads:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể tải danh sách leads',
        buttons: [{ text: 'OK' }],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [offset, statusFilter, searchQuery]);

  // Initial load
  useEffect(() => {
    loadStats();
    loadLeads(true);
  }, []);

  // Reload on filter change
  useEffect(() => {
    loadLeads(true);
  }, [statusFilter, searchQuery]);

  // Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStats();
    loadLeads(true);
  }, [loadStats, loadLeads]);

  // Load more
  const loadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      loadLeads(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await waitlistLeadService.updateLeadStatus(leadId, newStatus);
      alert({
        type: 'success',
        title: 'Thành công',
        message: 'Đã cập nhật trạng thái',
        buttons: [{ text: 'OK' }],
      });
      loadLeads(true);
      loadStats();
    } catch (error) {
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể cập nhật trạng thái',
        buttons: [{ text: 'OK' }],
      });
    }
  };

  // Call phone
  const handleCallPhone = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  // Send Zalo message
  const handleZaloMessage = (phone) => {
    // Remove leading 0 and add 84
    const zaloPhone = phone.startsWith('0') ? '84' + phone.slice(1) : phone;
    Linking.openURL(`https://zalo.me/${zaloPhone}`);
  };

  // Export leads
  const handleExport = async () => {
    try {
      const exportData = await waitlistLeadService.exportLeads({ status: statusFilter });

      // Convert to CSV-like text
      const headers = Object.keys(exportData[0] || {}).join('\t');
      const rows = exportData.map((row) => Object.values(row).join('\t'));
      const csvText = [headers, ...rows].join('\n');

      await Share.share({
        message: csvText,
        title: 'Xuất danh sách Leads',
      });
    } catch (error) {
      console.error('[WaitlistLeads] Export error:', error);
    }
  };

  // View lead detail
  const viewLeadDetail = async (lead) => {
    try {
      const fullLead = await waitlistLeadService.getLead(lead.id);
      const activities = await waitlistLeadService.getLeadActivities(lead.id);
      setDetailModal({
        visible: true,
        lead: fullLead,
        activities,
      });
    } catch (error) {
      console.error('[WaitlistLeads] Error getting lead detail:', error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render stats cards
  const renderStats = () => (
    <View style={styles.statsContainer}>
      <AdminTooltip
        tooltipKey="leads_stats_intro"
        message="Tổng quan về leads trong hệ thống"
      >
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total_leads || 0}</Text>
          <Text style={styles.statLabel}>Tổng leads</Text>
        </View>
      </AdminTooltip>

      <View style={styles.statCard}>
        <Text style={[styles.statValue, { color: COLORS.cyan }]}>
          {stats.today_leads || 0}
        </Text>
        <Text style={styles.statLabel}>Hôm nay</Text>
      </View>

      <AdminTooltip
        tooltipKey="lead_score_explain"
        message="Lead Hot có điểm >= 80"
      >
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>
            {stats.hot_leads || 0}
          </Text>
          <Text style={styles.statLabel}>Hot</Text>
        </View>
      </AdminTooltip>

      <View style={styles.statCard}>
        <Text style={[styles.statValue, { color: '#22C55E' }]}>
          {stats.conversion_rate || 0}%
        </Text>
        <Text style={styles.statLabel}>Tỷ lệ chuyển</Text>
      </View>
    </View>
  );

  // Render filter tabs
  const renderFilters = () => {
    // Safety check for LEAD_STATUS_OPTIONS
    if (!LEAD_STATUS_OPTIONS || !Array.isArray(LEAD_STATUS_OPTIONS)) {
      return null;
    }

    return (
      <AdminTooltip
        tooltipKey="filter_tabs_guide"
        message="Lọc leads theo trạng thái trong funnel"
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
          contentContainerStyle={styles.filterContainer}
        >
          {LEAD_STATUS_OPTIONS.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterTab,
                statusFilter === status && styles.filterTabActive,
              ]}
              onPress={() => setStatusFilter(status)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  statusFilter === status && styles.filterTabTextActive,
                ]}
              >
                {status === 'all' ? 'Tất cả' : STATUS_CONFIG[status]?.label || status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </AdminTooltip>
    );
  };

  // Render lead card
  const renderLeadCard = ({ item }) => {
    const isExpanded = expandedLead === item.id;
    const statusConfig = STATUS_CONFIG[item.lead_status] || STATUS_CONFIG.new;
    const StatusIcon = statusConfig.icon;
    const gradeColor = LEAD_GRADE_COLORS[item.lead_grade] || LEAD_GRADE_COLORS.D;

    return (
      <TouchableOpacity
        style={styles.leadCard}
        onPress={() => setExpandedLead(isExpanded ? null : item.id)}
        activeOpacity={0.8}
      >
        {/* Header */}
        <View style={styles.leadHeader}>
          <View style={styles.leadAvatar}>
            <StatusIcon size={18} color={statusConfig.color} />
          </View>

          <View style={styles.leadInfo}>
            <Text style={styles.leadName}>{item.full_name}</Text>
            <Text style={styles.leadPhone}>{item.phone}</Text>
          </View>

          <View style={styles.leadBadges}>
            <AdminTooltip
              tooltipKey="lead_grade_explain"
              message="A=Hot(80+), B=Qualified(60+), C=Engaged(40+)"
            >
              <View style={[styles.gradeBadge, { backgroundColor: gradeColor + '30' }]}>
                <Text style={[styles.gradeText, { color: gradeColor }]}>
                  {item.lead_grade}
                </Text>
              </View>
            </AdminTooltip>

            <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          {isExpanded ? (
            <ChevronUp size={20} color={COLORS.textSecondary} />
          ) : (
            <ChevronDown size={20} color={COLORS.textSecondary} />
          )}
        </View>

        {/* Interests */}
        {item.interested_products && Array.isArray(item.interested_products) && item.interested_products.length > 0 && (
          <View style={styles.interestsRow}>
            {item.interested_products.map((interest) => (
              <View key={interest} style={styles.interestTag}>
                <Text style={styles.interestText}>
                  {INTEREST_ICONS[interest] || '📦'} {INTEREST_LABELS[interest]?.split(' ')[0] || interest}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Score and Date */}
        <View style={styles.leadMeta}>
          <View style={styles.metaItem}>
            <Star size={14} color={COLORS.gold} />
            <Text style={styles.metaText}>Điểm: {item.lead_score}</Text>
          </View>
          <View style={styles.metaItem}>
            <Calendar size={14} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>
              {new Date(item.created_at).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Email */}
            {item.email && (
              <View style={styles.detailRow}>
                <Mail size={14} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{item.email}</Text>
              </View>
            )}

            {/* Source */}
            {item.utm_source && (
              <View style={styles.detailRow}>
                <ExternalLink size={14} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>Nguồn: {item.utm_source}</Text>
              </View>
            )}

            {/* Shopify sync status */}
            <AdminTooltip
              tooltipKey="shopify_sync_status"
              message="Trạng thái đồng bộ với Shopify Customer"
            >
              <View style={styles.detailRow}>
                <ShoppingBag size={14} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>
                  Shopify: {item.shopify_sync_status || 'Chưa đồng bộ'}
                  {item.shopify_customer_id && ` (ID: ${item.shopify_customer_id})`}
                </Text>
              </View>
            </AdminTooltip>

            {/* Action buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnCall]}
                onPress={() => handleCallPhone(item.phone)}
              >
                <Phone size={16} color="#22C55E" />
                <Text style={styles.actionBtnText}>Gọi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnZalo]}
                onPress={() => handleZaloMessage(item.phone)}
              >
                <MessageCircle size={16} color="#0068FF" />
                <Text style={styles.actionBtnText}>Zalo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnView]}
                onPress={() => viewLeadDetail(item)}
              >
                <Eye size={16} color={COLORS.gold} />
                <Text style={styles.actionBtnText}>Chi tiết</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render detail modal
  const renderDetailModal = () => {
    const lead = detailModal.lead;
    if (!lead) return null;

    const statusConfig = STATUS_CONFIG[lead.lead_status] || STATUS_CONFIG.new;

    return (
      <Modal
        visible={detailModal.visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModal({ visible: false, lead: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết Lead</Text>
              <TouchableOpacity
                onPress={() => setDetailModal({ visible: false, lead: null })}
              >
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Lead Info */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Họ tên:</Text>
                  <Text style={styles.infoValue}>{lead.full_name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Điện thoại:</Text>
                  <Text style={styles.infoValue}>{lead.phone}</Text>
                </View>
                {lead.email && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email:</Text>
                    <Text style={styles.infoValue}>{lead.email}</Text>
                  </View>
                )}
              </View>

              {/* Lead Score */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Đánh giá</Text>
                <View style={styles.scoreRow}>
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreValue}>{lead.lead_score}</Text>
                    <Text style={styles.scoreLabel}>Điểm</Text>
                  </View>
                  <View style={styles.scoreItem}>
                    <View
                      style={[
                        styles.gradeCircle,
                        { backgroundColor: LEAD_GRADE_COLORS[lead.lead_grade] },
                      ]}
                    >
                      <Text style={styles.gradeCircleText}>{lead.lead_grade}</Text>
                    </View>
                    <Text style={styles.scoreLabel}>Xếp hạng</Text>
                  </View>
                  <View style={styles.scoreItem}>
                    <View
                      style={[styles.statusCircle, { backgroundColor: statusConfig.color }]}
                    >
                      <statusConfig.icon size={16} color="#fff" />
                    </View>
                    <Text style={styles.scoreLabel}>{statusConfig.label}</Text>
                  </View>
                </View>
              </View>

              {/* Interests */}
              {lead.interested_products && Array.isArray(lead.interested_products) && lead.interested_products.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Quan tâm đến</Text>
                  <View style={styles.interestsList}>
                    {lead.interested_products.map((interest) => (
                      <View key={interest} style={styles.interestItem}>
                        <Text style={styles.interestEmoji}>{INTEREST_ICONS[interest] || '📦'}</Text>
                        <Text style={styles.interestLabel}>{INTEREST_LABELS[interest] || interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Source Info */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Nguồn</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>UTM Source:</Text>
                  <Text style={styles.infoValue}>{lead.utm_source || 'Direct'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>UTM Medium:</Text>
                  <Text style={styles.infoValue}>{lead.utm_medium || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Đăng ký lúc:</Text>
                  <Text style={styles.infoValue}>{formatDate(lead.created_at)}</Text>
                </View>
              </View>

              {/* Shopify Sync */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Shopify</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Trạng thái:</Text>
                  <Text style={styles.infoValue}>{lead.shopify_sync_status || 'pending'}</Text>
                </View>
                {lead.shopify_customer_id && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Customer ID:</Text>
                    <Text style={styles.infoValue}>{lead.shopify_customer_id}</Text>
                  </View>
                )}
              </View>

              {/* Status Change */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Thay đổi trạng thái</Text>
                <View style={styles.statusButtonsRow}>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.statusButton,
                        lead.lead_status === key && { borderColor: config.color },
                      ]}
                      onPress={() => {
                        handleStatusChange(lead.id, key);
                        setDetailModal({ visible: false, lead: null });
                      }}
                    >
                      <config.icon size={16} color={config.color} />
                      <Text style={[styles.statusButtonText, { color: config.color }]}>
                        {config.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Render loading footer
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLORS.gold} />
      </View>
    );
  };

  // Access check
  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedText}>Bạn không có quyền truy cập</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={GRADIENTS.backgroundDark}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý Leads</Text>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
            <Download size={20} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {renderStats()}

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo tên, SĐT, email..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filters */}
        {renderFilters()}

        {/* Leads List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Đang tải leads...</Text>
          </View>
        ) : leads.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Users size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Chưa có lead nào</Text>
            <Text style={styles.emptySubtext}>
              Leads từ landing page sẽ hiển thị ở đây
            </Text>
          </View>
        ) : (
          <FlatList
            data={leads}
            keyExtractor={(item) => item.id}
            renderItem={renderLeadCard}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.gold}
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
          />
        )}

        {/* Detail Modal */}
        {renderDetailModal()}

        {/* Custom Alert */}
        <AlertComponent />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  exportBtn: {
    padding: SPACING.xs,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  statValue: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.gold,
    fontSize: 20,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    color: COLORS.text,
    ...TYPOGRAPHY.body,
  },

  // Filters
  filterScrollView: {
    maxHeight: 50,
    marginBottom: SPACING.sm,
  },
  filterContainer: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
    flexDirection: 'row',
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  filterTabActive: {
    backgroundColor: COLORS.gold + '30',
    borderColor: COLORS.gold,
  },
  filterTabText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: COLORS.gold,
    fontWeight: '600',
  },

  // List
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: CONTENT_BOTTOM_PADDING,
  },

  // Lead Card
  leadCard: {
    backgroundColor: GLASS.background,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  leadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  leadAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadInfo: {
    flex: 1,
  },
  leadName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
  },
  leadPhone: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  leadBadges: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  gradeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gradeText: {
    ...TYPOGRAPHY.captionBold,
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
  },

  // Interests
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  interestTag: {
    backgroundColor: COLORS.gold + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interestText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gold,
    fontSize: 11,
  },

  // Meta
  leadMeta: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },

  // Expanded
  expandedContent: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  detailText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    flex: 1,
  },

  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnCall: {
    borderColor: '#22C55E30',
    backgroundColor: '#22C55E10',
  },
  actionBtnZalo: {
    borderColor: '#0068FF30',
    backgroundColor: '#0068FF10',
  },
  actionBtnView: {
    borderColor: COLORS.gold + '30',
    backgroundColor: COLORS.gold + '10',
  },
  actionBtnText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.text,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  loadingFooter: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },

  // Empty
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyText: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },

  // Access denied
  accessDenied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessDeniedText: {
    ...TYPOGRAPHY.body,
    color: COLORS.error,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.backgroundDark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: CONTENT_BOTTOM_PADDING,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
  },
  modalTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.text,
  },
  modalBody: {
    paddingHorizontal: SPACING.lg,
  },
  modalSection: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
  },
  sectionTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.gold,
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  infoLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  infoValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
    textAlign: 'right',
  },

  // Score
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreValue: {
    ...TYPOGRAPHY.heading1,
    color: COLORS.gold,
    fontSize: 28,
  },
  scoreLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  gradeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeCircleText: {
    ...TYPOGRAPHY.heading3,
    color: '#fff',
  },
  statusCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Interests
  interestsList: {
    gap: SPACING.sm,
  },
  interestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  interestEmoji: {
    fontSize: 20,
  },
  interestLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },

  // Status buttons
  statusButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    backgroundColor: GLASS.background,
  },
  statusButtonText: {
    ...TYPOGRAPHY.captionBold,
  },
});

export default WaitlistLeadsScreen;
