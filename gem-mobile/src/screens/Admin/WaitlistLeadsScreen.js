/**
 * Gemral - Waitlist Leads Admin Screen (CRM Redesign)
 * HubSpot-inspired professional CRM for managing waitlist leads
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Platform,
  Dimensions,
  DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  ArrowLeft,
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Phone,
  Mail,
  Calendar,
  Star,
  Zap,
  Download,
  ExternalLink,
  MessageCircle,
  ShoppingBag,
  Clock,
  Target,
  Award,
  Globe,
  Smartphone,
  Monitor,
  Hash,
  UserPlus,
  BarChart3,
  ArrowRight,
  TrendingUp,
} from 'lucide-react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import AdminTooltip from '../../components/Admin/AdminTooltip';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, GLASS, BORDER_RADIUS } from '../../utils/tokens';
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';
import { CONTENT_BOTTOM_PADDING } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import waitlistLeadService, {
  LEAD_STATUS_OPTIONS as IMPORTED_LEAD_STATUS_OPTIONS,
  INTEREST_LABELS as IMPORTED_INTEREST_LABELS,
  INTEREST_ICONS as IMPORTED_INTEREST_ICONS,
} from '../../services/waitlistLeadService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Fallback values in case imports fail
const LEAD_STATUS_OPTIONS = IMPORTED_LEAD_STATUS_OPTIONS || ['all', 'new', 'engaged', 'qualified', 'hot', 'converted', 'inactive'];
const INTEREST_LABELS = IMPORTED_INTEREST_LABELS || {};
const INTEREST_ICONS = IMPORTED_INTEREST_ICONS || {};

// Status labels and colors - using design tokens
const STATUS_CONFIG = {
  new: { label: 'Mới', color: COLORS.textMuted, icon: Star },
  engaged: { label: 'Đã tương tác', color: COLORS.info, icon: MessageCircle },
  qualified: { label: 'Tiềm năng', color: COLORS.purple, icon: Target },
  hot: { label: 'Hot', color: COLORS.error, icon: Zap },
  converted: { label: 'Đã chuyển đổi', color: COLORS.success, icon: Award },
  inactive: { label: 'Không hoạt động', color: COLORS.textDisabled, icon: Clock },
};

// Grade colors using design tokens
const LEAD_GRADE_COLORS = {
  A: COLORS.success,
  B: COLORS.info,
  C: COLORS.warning,
  D: COLORS.textMuted,
  F: COLORS.error,
};

// Funnel stages for visualization
const FUNNEL_STAGES = ['new', 'engaged', 'qualified', 'hot', 'converted'];

// --- LeadCard Component (React.memo) ---
const LeadCard = React.memo(({
  item,
  isExpanded,
  onToggleExpand,
  onCallPhone,
  onZaloMessage,
  onViewDetail,
}) => {
  const statusConfig = STATUS_CONFIG[item.lead_status] || STATUS_CONFIG.new;
  const StatusIcon = statusConfig.icon;
  const gradeColor = LEAD_GRADE_COLORS[item.lead_grade] || LEAD_GRADE_COLORS.D;

  const daysAgo = useMemo(() => {
    const diff = Date.now() - new Date(item.created_at).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hôm nay';
    return `${days}d`;
  }, [item.created_at]);

  const interests = item.interested_products;
  const hasInterests = Array.isArray(interests) && interests.length > 0;
  const displayInterests = hasInterests ? interests.slice(0, 3) : [];

  return (
    <TouchableOpacity
      style={styles.leadCard}
      onPress={() => onToggleExpand(item.id)}
      activeOpacity={0.8}
    >
      {/* Row 1: Avatar + Name + Days ago + Grade + Status + Chevron */}
      <View style={styles.leadRow1}>
        <View style={[styles.leadAvatar, { borderColor: statusConfig.color + '60' }]}>
          <StatusIcon size={16} color={statusConfig.color} />
        </View>

        <View style={styles.leadNameCol}>
          <Text style={styles.leadName} numberOfLines={1}>{item.full_name}</Text>
          <Text style={styles.leadDaysAgo}>{daysAgo}</Text>
        </View>

        <View style={[styles.gradeBadge, { backgroundColor: gradeColor + '20' }]}>
          <Text style={[styles.gradeText, { color: gradeColor }]}>
            {item.lead_grade}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '18' }]}>
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>

        {isExpanded ? (
          <ChevronUp size={18} color={COLORS.textSecondary} />
        ) : (
          <ChevronDown size={18} color={COLORS.textSecondary} />
        )}
      </View>

      {/* Row 2: Phone + Email + Score */}
      <View style={styles.leadRow2}>
        <View style={styles.contactItem}>
          <Phone size={12} color={COLORS.textMuted} />
          <Text style={styles.contactText}>{item.phone}</Text>
        </View>
        {item.email ? (
          <View style={[styles.contactItem, { flex: 1 }]}>
            <Mail size={12} color={COLORS.textMuted} />
            <Text style={styles.contactText} numberOfLines={1}>{item.email}</Text>
          </View>
        ) : null}
        <View style={[styles.scoreBadge, {
          backgroundColor: item.lead_score >= 80 ? COLORS.error + '20' :
                          item.lead_score >= 60 ? COLORS.warning + '20' :
                          COLORS.purple + '20',
        }]}>
          <Star size={10} color={COLORS.gold} />
          <Text style={styles.scoreText}>{item.lead_score}</Text>
        </View>
      </View>

      {/* Row 3: Interest chips + Quick actions */}
      <View style={styles.leadRow3}>
        <View style={styles.chipsContainer}>
          {displayInterests.map((interest) => (
            <View key={interest} style={styles.interestChip}>
              <Text style={styles.interestChipText}>
                {INTEREST_ICONS[interest] || '📦'} {INTEREST_LABELS[interest]?.split(' ')[0] || interest}
              </Text>
            </View>
          ))}
          {hasInterests && interests.length > 3 && (
            <Text style={styles.moreChipsText}>+{interests.length - 3}</Text>
          )}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: COLORS.success + '15' }]}
            onPress={() => onCallPhone(item.phone)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Phone size={14} color={COLORS.success} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: COLORS.info + '15' }]}
            onPress={() => onZaloMessage(item.phone)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MessageCircle size={14} color={COLORS.info} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {item.utm_source && (
            <View style={styles.expandedRow}>
              <Globe size={13} color={COLORS.textMuted} />
              <Text style={styles.expandedLabel}>Nguồn:</Text>
              <Text style={styles.expandedValue}>{item.utm_source}</Text>
            </View>
          )}

          {item.referral_code && (
            <View style={styles.expandedRow}>
              <Hash size={13} color={COLORS.textMuted} />
              <Text style={styles.expandedLabel}>Mã giới thiệu:</Text>
              <Text style={styles.expandedValue}>{item.referral_code}</Text>
            </View>
          )}

          <View style={styles.expandedRow}>
            <ShoppingBag size={13} color={COLORS.textMuted} />
            <Text style={styles.expandedLabel}>Shopify:</Text>
            <Text style={styles.expandedValue}>
              {item.shopify_sync_status || 'Chưa đồng bộ'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.viewDetailBtn}
            onPress={() => onViewDetail(item)}
          >
            <Text style={styles.viewDetailText}>Xem chi tiết</Text>
            <ArrowRight size={14} color={COLORS.gold} />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.lead_status === nextProps.item.lead_status &&
    prevProps.item.lead_score === nextProps.item.lead_score &&
    prevProps.isExpanded === nextProps.isExpanded
  );
});

// --- Main Screen ---
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

  // Computed stats
  const computedStats = useMemo(() => {
    if (!leads || leads.length === 0) return { avgScore: 0, contactedPct: 0 };

    const totalScore = leads.reduce((sum, l) => sum + (l.lead_score || 0), 0);
    const avgScore = Math.round(totalScore / leads.length);

    const contacted = leads.filter(
      (l) => l.lead_status !== 'new' && l.lead_status !== 'inactive'
    ).length;
    const contactedPct = leads.length > 0 ? Math.round((contacted / leads.length) * 100) : 0;

    return { avgScore, contactedPct };
  }, [leads]);

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

      const fetchedLeads = result?.leads || [];

      if (reset) {
        setLeads(fetchedLeads);
      } else {
        setLeads((prev) => [...prev, ...fetchedLeads]);
      }

      setHasMore(result?.hasMore ?? false);
      setOffset(currentOffset + fetchedLeads.length);
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

  // Rule 31: Recovery listener for app resume
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[WaitlistLeads] Force refresh received');
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
      setTimeout(() => {
        loadStats();
        loadLeads(true);
      }, 50); // Rule 57: Break React 18 batch
    });
    return () => listener.remove();
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
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      loadLeads(false);
    }
  }, [loadingMore, hasMore, loading, loadLeads]);

  // Handle status change
  const handleStatusChange = useCallback(async (leadId, newStatus) => {
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
  }, [loadLeads, loadStats, alert]);

  // Call phone
  const handleCallPhone = useCallback((phone) => {
    Linking.openURL(`tel:${phone}`);
  }, []);

  // Send Zalo message
  const handleZaloMessage = useCallback((phone) => {
    const zaloPhone = phone.startsWith('0') ? '84' + phone.slice(1) : phone;
    Linking.openURL(`https://zalo.me/${zaloPhone}`);
  }, []);

  // Export leads
  const handleExport = useCallback(async () => {
    try {
      const exportData = await waitlistLeadService.exportLeads({ status: statusFilter });

      if (!Array.isArray(exportData) || exportData.length === 0) {
        alert({
          type: 'info',
          title: 'Thông báo',
          message: 'Không có dữ liệu để xuất',
          buttons: [{ text: 'OK' }],
        });
        return;
      }

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
  }, [statusFilter, alert]);

  // View lead detail
  const viewLeadDetail = useCallback(async (lead) => {
    try {
      const fullLead = await waitlistLeadService.getLead(lead.id);
      const activities = await waitlistLeadService.getLeadActivities(lead.id);
      setDetailModal({
        visible: true,
        lead: fullLead || lead,
        activities: activities || [],
      });
    } catch (error) {
      console.error('[WaitlistLeads] Error getting lead detail:', error);
    }
  }, []);

  // Toggle expand
  const handleToggleExpand = useCallback((id) => {
    setExpandedLead((prev) => (prev === id ? null : id));
  }, []);

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // keyExtractor
  const keyExtractor = useCallback((item) => item.id, []);

  // --- Render Stats Cards (2x3 grid) ---
  const renderStats = () => (
    <View style={styles.statsGrid}>
      {/* Row 1 */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Users size={16} color={COLORS.gold} />
          <Text style={[styles.statValue, { color: COLORS.gold }]}>
            {stats.total_leads || 0}
          </Text>
          <Text style={styles.statLabel}>Tổng leads</Text>
        </View>

        <View style={styles.statCard}>
          <TrendingUp size={16} color={COLORS.cyan} />
          <Text style={[styles.statValue, { color: COLORS.cyan }]}>
            {stats.today_leads || 0}
          </Text>
          <Text style={styles.statLabel}>Hôm nay</Text>
        </View>

        <View style={styles.statCard}>
          <Zap size={16} color={COLORS.error} />
          <Text style={[styles.statValue, { color: COLORS.error }]}>
            {stats.hot_leads || 0}
          </Text>
          <Text style={styles.statLabel}>Hot</Text>
        </View>
      </View>

      {/* Row 2 */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Star size={16} color={COLORS.purple} />
          <Text style={[styles.statValue, { color: COLORS.purple }]}>
            {computedStats.avgScore}
          </Text>
          <Text style={styles.statLabel}>Điểm TB</Text>
        </View>

        <View style={styles.statCard}>
          <BarChart3 size={16} color={COLORS.info} />
          <Text style={[styles.statValue, { color: COLORS.info }]}>
            {computedStats.contactedPct}%
          </Text>
          <Text style={styles.statLabel}>Đã liên hệ</Text>
        </View>

        <View style={styles.statCard}>
          <Award size={16} color={COLORS.success} />
          <Text style={[styles.statValue, { color: COLORS.success }]}>
            {stats.conversion_rate || 0}%
          </Text>
          <Text style={styles.statLabel}>Chuyển đổi</Text>
        </View>
      </View>
    </View>
  );

  // --- Render Filter Tabs ---
  const renderFilters = () => {
    if (!LEAD_STATUS_OPTIONS || !Array.isArray(LEAD_STATUS_OPTIONS)) return null;

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

  // --- Render Lead Card ---
  const renderLeadCard = useCallback(({ item }) => (
    <LeadCard
      item={item}
      isExpanded={expandedLead === item.id}
      onToggleExpand={handleToggleExpand}
      onCallPhone={handleCallPhone}
      onZaloMessage={handleZaloMessage}
      onViewDetail={viewLeadDetail}
    />
  ), [expandedLead, handleToggleExpand, handleCallPhone, handleZaloMessage, viewLeadDetail]);

  // --- Funnel Stage Visualization ---
  const renderFunnelStage = (currentStatus) => {
    const currentIndex = FUNNEL_STAGES.indexOf(currentStatus);

    return (
      <View style={styles.funnelContainer}>
        {FUNNEL_STAGES.map((stage, index) => {
          const stageConfig = STATUS_CONFIG[stage];
          const isActive = index <= currentIndex;
          const isCurrent = stage === currentStatus;

          return (
            <React.Fragment key={stage}>
              {index > 0 && (
                <View
                  style={[
                    styles.funnelLine,
                    { backgroundColor: isActive ? stageConfig.color : COLORS.textDisabled + '40' },
                  ]}
                />
              )}
              <View style={styles.funnelStageItem}>
                <View
                  style={[
                    styles.funnelDot,
                    {
                      backgroundColor: isActive ? stageConfig.color : 'transparent',
                      borderColor: isActive ? stageConfig.color : COLORS.textDisabled,
                    },
                    isCurrent && styles.funnelDotCurrent,
                  ]}
                />
                <Text
                  style={[
                    styles.funnelLabel,
                    { color: isActive ? COLORS.textPrimary : COLORS.textDisabled },
                  ]}
                  numberOfLines={1}
                >
                  {stageConfig.label}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  // --- Render Detail Modal (Bottom-Sheet with BlurView) ---
  const renderDetailModal = () => {
    const lead = detailModal.lead;
    if (!lead) return null;

    const statusConfig = STATUS_CONFIG[lead.lead_status] || STATUS_CONFIG.new;
    const gradeColor = LEAD_GRADE_COLORS[lead.lead_grade] || LEAD_GRADE_COLORS.D;

    const daysSinceSignup = Math.floor(
      (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
      <Modal
        visible={detailModal.visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModal({ visible: false, lead: null })}
      >
        <View style={styles.modalOverlay}>
          <BlurView
            intensity={Platform.OS === 'ios' ? 30 : 80}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />

          {/* Tap-to-dismiss area */}
          <TouchableOpacity
            style={styles.modalDismissArea}
            activeOpacity={1}
            onPress={() => setDetailModal({ visible: false, lead: null })}
          />

          {/* Bottom sheet container */}
          <View style={styles.modalSheet}>
            {/* Drag indicator */}
            <View style={styles.dragIndicator} />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{lead.full_name}</Text>
                <Text style={styles.modalSubtitle}>
                  {daysSinceSignup === 0 ? 'Đăng ký hôm nay' : `${daysSinceSignup} ngày trước`}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setDetailModal({ visible: false, lead: null })}
                style={styles.modalCloseBtn}
              >
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Score Triptych */}
              <View style={styles.modalSection}>
                <View style={styles.scoreTriptych}>
                  <View style={styles.scoreTriptychItem}>
                    <Text style={styles.scoreTriptychValue}>{lead.lead_score}</Text>
                    <Text style={styles.scoreTriptychLabel}>Điểm</Text>
                  </View>

                  <View style={styles.scoreTriptychItem}>
                    <View style={[styles.gradeCircle, { backgroundColor: gradeColor }]}>
                      <Text style={styles.gradeCircleText}>{lead.lead_grade}</Text>
                    </View>
                    <Text style={styles.scoreTriptychLabel}>Xếp hạng</Text>
                  </View>

                  <View style={styles.scoreTriptychItem}>
                    <View style={[styles.statusCircle, { backgroundColor: statusConfig.color }]}>
                      <statusConfig.icon size={16} color={COLORS.textPrimary} />
                    </View>
                    <Text style={styles.scoreTriptychLabel}>{statusConfig.label}</Text>
                  </View>
                </View>
              </View>

              {/* Funnel Stage */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Funnel</Text>
                {renderFunnelStage(lead.lead_status)}
              </View>

              {/* Contact Info */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Liên hệ</Text>
                <View style={styles.infoRow}>
                  <Phone size={14} color={COLORS.textMuted} />
                  <Text style={styles.infoLabel}>Điện thoại</Text>
                  <Text style={styles.infoValue}>{lead.phone}</Text>
                </View>
                {lead.email && (
                  <View style={styles.infoRow}>
                    <Mail size={14} color={COLORS.textMuted} />
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>{lead.email}</Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Calendar size={14} color={COLORS.textMuted} />
                  <Text style={styles.infoLabel}>Đăng ký</Text>
                  <Text style={styles.infoValue}>{formatDate(lead.created_at)}</Text>
                </View>
              </View>

              {/* Interests */}
              {lead.interested_products && Array.isArray(lead.interested_products) && lead.interested_products.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Quan tâm</Text>
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

              {/* Source */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Nguồn</Text>
                <View style={styles.infoRow}>
                  <Globe size={14} color={COLORS.textMuted} />
                  <Text style={styles.infoLabel}>UTM Source</Text>
                  <Text style={styles.infoValue}>{lead.utm_source || 'Direct'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <ExternalLink size={14} color={COLORS.textMuted} />
                  <Text style={styles.infoLabel}>UTM Medium</Text>
                  <Text style={styles.infoValue}>{lead.utm_medium || 'N/A'}</Text>
                </View>
                {lead.utm_campaign && (
                  <View style={styles.infoRow}>
                    <Target size={14} color={COLORS.textMuted} />
                    <Text style={styles.infoLabel}>Campaign</Text>
                    <Text style={styles.infoValue}>{lead.utm_campaign}</Text>
                  </View>
                )}
                {lead.referrer_url && (
                  <View style={styles.infoRow}>
                    <Globe size={14} color={COLORS.textMuted} />
                    <Text style={styles.infoLabel}>Referrer</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>{lead.referrer_url}</Text>
                  </View>
                )}
              </View>

              {/* Referral */}
              {(lead.referral_code || lead.referred_by || lead.referral_count > 0 || lead.queue_number) && (
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Giới thiệu</Text>
                  {lead.referral_code && (
                    <View style={styles.infoRow}>
                      <Hash size={14} color={COLORS.textMuted} />
                      <Text style={styles.infoLabel}>Mã GT</Text>
                      <Text style={styles.infoValue}>{lead.referral_code}</Text>
                    </View>
                  )}
                  {lead.referred_by && (
                    <View style={styles.infoRow}>
                      <UserPlus size={14} color={COLORS.textMuted} />
                      <Text style={styles.infoLabel}>GT bởi</Text>
                      <Text style={styles.infoValue}>{lead.referred_by}</Text>
                    </View>
                  )}
                  {lead.referral_count > 0 && (
                    <View style={styles.infoRow}>
                      <Users size={14} color={COLORS.textMuted} />
                      <Text style={styles.infoLabel}>Số GT</Text>
                      <Text style={styles.infoValue}>{lead.referral_count}</Text>
                    </View>
                  )}
                  {lead.queue_number && (
                    <View style={styles.infoRow}>
                      <Hash size={14} color={COLORS.textMuted} />
                      <Text style={styles.infoLabel}>Số thứ tự</Text>
                      <Text style={styles.infoValue}>#{lead.queue_number}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Device */}
              {lead.device_type && (
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Thiết bị</Text>
                  <View style={styles.infoRow}>
                    {lead.device_type === 'mobile' ? (
                      <Smartphone size={14} color={COLORS.textMuted} />
                    ) : (
                      <Monitor size={14} color={COLORS.textMuted} />
                    )}
                    <Text style={styles.infoLabel}>Loại</Text>
                    <Text style={styles.infoValue}>
                      {lead.device_type === 'mobile' ? 'Di động' : 'Máy tính'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Shopify */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Shopify</Text>
                <View style={styles.infoRow}>
                  <ShoppingBag size={14} color={COLORS.textMuted} />
                  <Text style={styles.infoLabel}>Trạng thái</Text>
                  <Text style={styles.infoValue}>{lead.shopify_sync_status || 'pending'}</Text>
                </View>
                {lead.shopify_customer_id && (
                  <View style={styles.infoRow}>
                    <Hash size={14} color={COLORS.textMuted} />
                    <Text style={styles.infoLabel}>Customer ID</Text>
                    <Text style={styles.infoValue}>{lead.shopify_customer_id}</Text>
                  </View>
                )}
              </View>

              {/* Status Change */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Thay đổi trạng thái</Text>
                <View style={styles.statusGrid}>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                    const isCurrentStatus = lead.lead_status === key;
                    return (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.statusButton,
                          isCurrentStatus && { borderColor: config.color, backgroundColor: config.color + '15' },
                        ]}
                        onPress={() => {
                          handleStatusChange(lead.id, key);
                          setDetailModal({ visible: false, lead: null });
                        }}
                      >
                        <config.icon size={14} color={config.color} />
                        <Text style={[styles.statusButtonText, { color: config.color }]}>
                          {config.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalActionBtn, { backgroundColor: COLORS.success + '20', borderColor: COLORS.success + '40' }]}
                  onPress={() => {
                    handleCallPhone(lead.phone);
                    setDetailModal({ visible: false, lead: null });
                  }}
                >
                  <Phone size={18} color={COLORS.success} />
                  <Text style={[styles.modalActionBtnText, { color: COLORS.success }]}>Gọi điện</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalActionBtn, { backgroundColor: COLORS.info + '20', borderColor: COLORS.info + '40' }]}
                  onPress={() => {
                    handleZaloMessage(lead.phone);
                    setDetailModal({ visible: false, lead: null });
                  }}
                >
                  <MessageCircle size={18} color={COLORS.info} />
                  <Text style={[styles.modalActionBtnText, { color: COLORS.info }]}>Nhắn Zalo</Text>
                </TouchableOpacity>
              </View>

              {/* Bottom spacer */}
              <View style={{ height: SPACING.huge }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Render loading footer
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLORS.gold} />
      </View>
    );
  }, [loadingMore]);

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
        colors={GRADIENTS.background}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý Leads</Text>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
            <Download size={20} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <AdminTooltip
          tooltipKey="leads_stats_intro"
          message="Tổng quan về leads trong hệ thống"
        >
          {renderStats()}
        </AdminTooltip>

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
        ) : !leads || leads.length === 0 ? (
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
            keyExtractor={keyExtractor}
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
            removeClippedSubviews={true}
            windowSize={10}
            maxToRenderPerBatch={10}
          />
        )}

        {/* Detail Modal */}
        {renderDetailModal()}

        {/* Custom Alert */}
        {AlertComponent}
      </LinearGradient>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
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
    borderBottomColor: COLORS.inputBorder,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  exportBtn: {
    padding: SPACING.xs,
  },

  // ─── Stats (2x3 Grid) ────────────────────────────────────
  statsGrid: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: GLASS.backgroundColor,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gold,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // ─── Search ───────────────────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.backgroundColor,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.body,
  },

  // ─── Filters ──────────────────────────────────────────────
  filterScrollView: {
    maxHeight: 50,
    marginBottom: SPACING.sm,
  },
  filterContainer: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: GLASS.backgroundColor,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabActive: {
    backgroundColor: COLORS.gold + '30',
    borderColor: COLORS.gold,
  },
  filterTabText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: Math.ceil(12 * 1.4),
  },
  filterTabTextActive: {
    color: COLORS.gold,
    fontWeight: '600',
  },

  // ─── List ─────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: CONTENT_BOTTOM_PADDING,
  },

  // ─── Lead Card ────────────────────────────────────────────
  leadCard: {
    backgroundColor: GLASS.backgroundColor,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },

  // Row 1: Avatar + Name + Grade + Status + Chevron
  leadRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  leadAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgDarkest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  leadNameCol: {
    flex: 1,
  },
  leadName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  leadDaysAgo: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  gradeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
  },
  gradeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },

  // Row 2: Phone + Email + Score
  leadRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.inputBorder,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginLeft: 'auto',
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gold,
  },

  // Row 3: Interest chips + Quick actions
  leadRow3: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  chipsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  interestChip: {
    backgroundColor: COLORS.gold + '12',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 10,
  },
  interestChipText: {
    fontSize: 10,
    color: COLORS.gold,
  },
  moreChipsText: {
    fontSize: 10,
    color: COLORS.textMuted,
    alignSelf: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  quickActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Expanded content
  expandedContent: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.inputBorder,
    gap: SPACING.sm,
  },
  expandedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  expandedLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  expandedValue: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
  },
  viewDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.gold + '12',
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },
  viewDetailText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gold,
  },

  // ─── Loading / Empty ──────────────────────────────────────
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

  // ─── Access Denied ────────────────────────────────────────
  accessDenied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessDeniedText: {
    ...TYPOGRAPHY.body,
    color: COLORS.error,
  },

  // ─── Detail Modal (Bottom Sheet) ─────────────────────────
  modalOverlay: {
    flex: 1,
  },
  modalDismissArea: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: 'rgba(15, 16, 48, 0.95)',
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    maxHeight: '90%',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: COLORS.inputBorder,
    paddingBottom: CONTENT_BOTTOM_PADDING,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textDisabled,
    alignSelf: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.inputBorder,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: SPACING.xs,
  },
  modalBody: {
    paddingHorizontal: SPACING.lg,
  },

  // ─── Modal Sections ──────────────────────────────────────
  modalSection: {
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.inputBorder,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gold,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Score Triptych
  scoreTriptych: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
  },
  scoreTriptychItem: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  scoreTriptychValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.gold,
  },
  scoreTriptychLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  gradeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeCircleText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statusCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Funnel
  funnelContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  funnelStageItem: {
    alignItems: 'center',
    width: (SCREEN_WIDTH - SPACING.lg * 2 - 48) / 5,
  },
  funnelDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  funnelDotCurrent: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2.5,
  },
  funnelLine: {
    height: 2,
    width: 12,
    alignSelf: 'center',
    marginTop: 5,
  },
  funnelLabel: {
    fontSize: 8,
    marginTop: 4,
    textAlign: 'center',
  },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    minWidth: 70,
  },
  infoValue: {
    fontSize: 12,
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'right',
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
    fontSize: 18,
  },
  interestLabel: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },

  // Status grid
  statusGrid: {
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
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    backgroundColor: GLASS.backgroundColor,
  },
  statusButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Modal action buttons
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  modalActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  modalActionBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default WaitlistLeadsScreen;
