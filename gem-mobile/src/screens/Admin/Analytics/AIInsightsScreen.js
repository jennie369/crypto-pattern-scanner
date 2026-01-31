/**
 * AIInsightsScreen - AI-Powered Analytics Insights
 * GEM Platform Admin Analytics Dashboard
 *
 * Features:
 * - Priority summary cards
 * - Filter by type/priority/status
 * - Action tracking (mark as done, dismiss)
 * - Insight details with recommendations
 * - Generate new insights button
 *
 * Created: January 30, 2026
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Brain,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  RefreshCw,
  Zap,
  AlertCircle,
  ChevronDown,
  X,
  Play,
} from 'lucide-react-native';

import { useAuth } from '../../../contexts/AuthContext';
import { aiInsightService } from '../../../services/aiInsightService';
import {
  PRIORITY_LEVELS,
  INSIGHT_TYPES,
  ACTION_STATUS,
} from '../../../services/analyticsConstants';
import { COLORS, GRADIENTS, SPACING, GLASS } from '../../../utils/tokens';

// =====================================================
// PRIORITY CONFIG
// =====================================================

const PRIORITY_CONFIG = {
  [PRIORITY_LEVELS.CRITICAL]: {
    color: '#FF4757',
    bgColor: 'rgba(255, 71, 87, 0.15)',
    label: 'Quan trọng',
    icon: AlertTriangle,
  },
  [PRIORITY_LEVELS.HIGH]: {
    color: '#FF9800',
    bgColor: 'rgba(255, 152, 0, 0.15)',
    label: 'Cao',
    icon: AlertCircle,
  },
  [PRIORITY_LEVELS.MEDIUM]: {
    color: '#2196F3',
    bgColor: 'rgba(33, 150, 243, 0.15)',
    label: 'Trung bình',
    icon: Zap,
  },
  [PRIORITY_LEVELS.LOW]: {
    color: '#4CAF50',
    bgColor: 'rgba(76, 175, 80, 0.15)',
    label: 'Thấp',
    icon: Lightbulb,
  },
};

const TYPE_CONFIG = {
  [INSIGHT_TYPES.TREND]: {
    color: '#6A5BFF',
    label: 'Xu hướng',
    icon: TrendingUp,
  },
  [INSIGHT_TYPES.ANOMALY]: {
    color: '#FF6B9D',
    label: 'Bất thường',
    icon: AlertTriangle,
  },
  [INSIGHT_TYPES.RECOMMENDATION]: {
    color: '#FFD700',
    label: 'Đề xuất',
    icon: Target,
  },
  [INSIGHT_TYPES.PREDICTION]: {
    color: '#00BCD4',
    label: 'Dự đoán',
    icon: Brain,
  },
};

const STATUS_CONFIG = {
  [ACTION_STATUS.PENDING]: {
    color: '#FF9800',
    label: 'Chờ xử lý',
    icon: Clock,
  },
  [ACTION_STATUS.IN_PROGRESS]: {
    color: '#2196F3',
    label: 'Đang xử lý',
    icon: Play,
  },
  [ACTION_STATUS.COMPLETED]: {
    color: '#4CAF50',
    label: 'Hoàn thành',
    icon: CheckCircle,
  },
  [ACTION_STATUS.DISMISSED]: {
    color: '#9E9E9E',
    label: 'Bỏ qua',
    icon: XCircle,
  },
};

// =====================================================
// SUMMARY CARD
// =====================================================

const SummaryCard = ({ priority, count, onPress }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG[PRIORITY_LEVELS.LOW];
  const Icon = config.icon;

  return (
    <TouchableOpacity
      style={[styles.summaryCard, { borderColor: config.color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.summaryIcon, { backgroundColor: config.bgColor }]}>
        <Icon size={18} color={config.color} />
      </View>
      <Text style={styles.summaryCount}>{count}</Text>
      <Text style={[styles.summaryLabel, { color: config.color }]}>{config.label}</Text>
    </TouchableOpacity>
  );
};

// =====================================================
// INSIGHT CARD
// =====================================================

const InsightCard = ({ insight, onPress, onAction }) => {
  const priorityConfig = PRIORITY_CONFIG[insight.priority] || PRIORITY_CONFIG[PRIORITY_LEVELS.LOW];
  const typeConfig = TYPE_CONFIG[insight.type] || TYPE_CONFIG[INSIGHT_TYPES.RECOMMENDATION];
  const statusConfig = STATUS_CONFIG[insight.action_status] || STATUS_CONFIG[ACTION_STATUS.PENDING];

  const TypeIcon = typeConfig.icon;
  const PriorityIcon = priorityConfig.icon;
  const StatusIcon = statusConfig.icon;

  return (
    <TouchableOpacity
      style={styles.insightCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header: Type + Priority */}
      <View style={styles.insightHeader}>
        <View style={styles.insightType}>
          <View style={[styles.typeIconContainer, { backgroundColor: `${typeConfig.color}20` }]}>
            <TypeIcon size={14} color={typeConfig.color} />
          </View>
          <Text style={[styles.typeLabel, { color: typeConfig.color }]}>{typeConfig.label}</Text>
        </View>

        <View style={styles.insightBadges}>
          <View style={[styles.priorityBadge, { backgroundColor: priorityConfig.bgColor }]}>
            <PriorityIcon size={10} color={priorityConfig.color} />
            <Text style={[styles.priorityText, { color: priorityConfig.color }]}>
              {priorityConfig.label}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}15` }]}>
            <StatusIcon size={10} color={statusConfig.color} />
          </View>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.insightTitle} numberOfLines={2}>{insight.title}</Text>

      {/* Description */}
      <Text style={styles.insightDescription} numberOfLines={3}>{insight.description}</Text>

      {/* Footer: Confidence + Actions */}
      <View style={styles.insightFooter}>
        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>Độ tin cậy:</Text>
          <View style={styles.confidenceBar}>
            <View
              style={[
                styles.confidenceFill,
                { width: `${(insight.confidence || 0.5) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.confidenceValue}>
            {Math.round((insight.confidence || 0.5) * 100)}%
          </Text>
        </View>

        {insight.action_status === ACTION_STATUS.PENDING && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButtonDone}
              onPress={() => onAction(insight, 'done')}
            >
              <CheckCircle size={16} color={COLORS.success} />
            </TouchableOpacity>
          )}
            <TouchableOpacity
              style={styles.actionButtonDismiss}
              onPress={() => onAction(insight, 'dismiss')}
            >
              <XCircle size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ChevronRight
        size={18}
        color={COLORS.textMuted}
        style={styles.insightChevron}
      />
    </TouchableOpacity>
  );
};

// =====================================================
// FILTER MODAL
// =====================================================

const FilterModal = ({ visible, onClose, filters, onApply }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const toggleFilter = (category, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [category]: prev[category] === value ? null : value,
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Bộ lọc</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Type Filter */}
          <Text style={styles.filterSectionTitle}>Loại insight</Text>
          <View style={styles.filterOptions}>
            {Object.entries(TYPE_CONFIG).map(([key, config]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.filterChip,
                  localFilters.type === key && { backgroundColor: config.color },
                ]}
                onPress={() => toggleFilter('type', key)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    localFilters.type === key && { color: '#FFF' },
                  ]}
                >
                  {config.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Priority Filter */}
          <Text style={styles.filterSectionTitle}>Mức độ ưu tiên</Text>
          <View style={styles.filterOptions}>
            {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.filterChip,
                  localFilters.priority === key && { backgroundColor: config.color },
                ]}
                onPress={() => toggleFilter('priority', key)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    localFilters.priority === key && { color: '#FFF' },
                  ]}
                >
                  {config.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Status Filter */}
          <Text style={styles.filterSectionTitle}>Trạng thái</Text>
          <View style={styles.filterOptions}>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.filterChip,
                  localFilters.action_status === key && { backgroundColor: config.color },
                ]}
                onPress={() => toggleFilter('action_status', key)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    localFilters.action_status === key && { color: '#FFF' },
                  ]}
                >
                  {config.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Apply Button */}
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => {
              onApply(localFilters);
              onClose();
            }}
          >
            <Text style={styles.applyButtonText}>Áp dụng</Text>
          </TouchableOpacity>

          {/* Clear Filters */}
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setLocalFilters({});
              onApply({});
              onClose();
            }}
          >
            <Text style={styles.clearButtonText}>Xóa bộ lọc</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// =====================================================
// DETAIL MODAL
// =====================================================

const DetailModal = ({ visible, insight, onClose, onAction }) => {
  const [notes, setNotes] = useState('');

  if (!insight) return null;

  const priorityConfig = PRIORITY_CONFIG[insight.priority] || PRIORITY_CONFIG[PRIORITY_LEVELS.LOW];
  const typeConfig = TYPE_CONFIG[insight.type] || TYPE_CONFIG[INSIGHT_TYPES.RECOMMENDATION];
  const TypeIcon = typeConfig.icon;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, styles.detailModalContent]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.detailHeader}>
              <View style={[styles.detailTypeIcon, { backgroundColor: `${typeConfig.color}20` }]}>
                <TypeIcon size={24} color={typeConfig.color} />
              </View>
              <TouchableOpacity onPress={onClose} style={styles.detailCloseButton}>
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <Text style={styles.detailTitle}>{insight.title}</Text>

            {/* Badges */}
            <View style={styles.detailBadges}>
              <View style={[styles.detailBadge, { backgroundColor: typeConfig.color }]}>
                <Text style={styles.detailBadgeText}>{typeConfig.label}</Text>
              </View>
              <View style={[styles.detailBadge, { backgroundColor: priorityConfig.color }]}>
                <Text style={styles.detailBadgeText}>{priorityConfig.label}</Text>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.detailSectionTitle}>Phân tích</Text>
            <Text style={styles.detailDescription}>{insight.description}</Text>

            {/* Recommendation */}
            <Text style={styles.detailSectionTitle}>Đề xuất hành động</Text>
            <View style={styles.recommendationBox}>
              <Lightbulb size={18} color={COLORS.gold} />
              <Text style={styles.recommendationText}>{insight.recommendation}</Text>
            </View>

            {/* Metrics */}
            <Text style={styles.detailSectionTitle}>Thông số</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Độ tin cậy</Text>
                <Text style={styles.metricValue}>{Math.round((insight.confidence || 0.5) * 100)}%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Mức ảnh hưởng</Text>
                <Text style={styles.metricValue}>{insight.impact_score || 0}</Text>
              </View>
            </View>

            {/* Notes Input */}
            {insight.action_status === ACTION_STATUS.PENDING && (
              <>
                <Text style={styles.detailSectionTitle}>Ghi chú (tùy chọn)</Text>
              )}
                <TextInput
                  style={styles.notesInput}
                  placeholder="Thêm ghi chú..."
                  placeholderTextColor={COLORS.textMuted}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                />
              </>
            )}

            {/* Action Buttons */}
            {insight.action_status === ACTION_STATUS.PENDING && (
              <View style={styles.detailActions}>
                <TouchableOpacity
                  style={styles.detailActionDone}
                  onPress={() => {
                    onAction(insight, 'done', notes);
                    setNotes('');
                    onClose();
                  }}
                >
                  <CheckCircle size={18} color="#FFF" />
                )}
                  <Text style={styles.detailActionText}>Đánh dấu hoàn thành</Text>
                )}
                </TouchableOpacity>
              )}

                <TouchableOpacity
                  style={styles.detailActionDismiss}
                  onPress={() => {
                    onAction(insight, 'dismiss', notes);
                    setNotes('');
                    onClose();
                  }}
                >
                  <XCircle size={18} color={COLORS.textMuted} />
                  <Text style={styles.detailActionDismissText}>Bỏ qua</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// =====================================================
// MAIN SCREEN
// =====================================================

const AIInsightsScreen = ({ navigation }) => {
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(false) // Never blocks UI;
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [insights, setInsights] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);

  // =====================================================
  // DATA FETCHING
  // =====================================================

  const fetchData = useCallback(async () => {
    try {
      const [insightsResult, summaryResult] = await Promise.all([
        aiInsightService.getInsights({ ...filters, limit: 50 }),
        aiInsightService.getInsightSummary(),
      ]);

      if (insightsResult.success) {
        setInsights(insightsResult.data || []);
      }

      if (summaryResult.success) {
        setSummary(summaryResult.data);
      }

    } catch (error) {
      console.error('[AIInsights] Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // =====================================================
  // ACTIONS
  // =====================================================

  const handleGenerateInsights = async () => {
    setGenerating(true);
    try {
      const result = await aiInsightService.generateAllInsights();
      if (result.success) {
        fetchData();
      }
    } catch (error) {
      console.error('[AIInsights] Generate error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleAction = async (insight, action, notes = null) => {
    try {
      if (action === 'done') {
        await aiInsightService.updateInsightAction(insight.id, ACTION_STATUS.COMPLETED, notes);
      } else if (action === 'dismiss') {
        await aiInsightService.dismissInsight(insight.id, notes);
      }
      fetchData();
    } catch (error) {
      console.error('[AIInsights] Action error:', error);
    }
  };

  const handleFilterByPriority = (priority) => {
    setFilters(prev => ({
      ...prev,
      priority: prev.priority === priority ? null : priority,
    }));
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>AI Insights</Text>
            <Text style={styles.headerSubtitle}>
              {summary?.pending_count || 0} chờ xử lý
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Filter size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, styles.generateButton]}
              onPress={handleGenerateInsights}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator size="small" color={COLORS.purple} />
              ) : (
                <Brain size={20} color={COLORS.purple} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Cards */}
          {summary && (
            <View style={styles.summaryGrid}>
              <SummaryCard
                priority={PRIORITY_LEVELS.CRITICAL}
                count={summary.by_priority?.[PRIORITY_LEVELS.CRITICAL] || 0}
                onPress={() => handleFilterByPriority(PRIORITY_LEVELS.CRITICAL)}
              />
            )}
              <SummaryCard
                priority={PRIORITY_LEVELS.HIGH}
                count={summary.by_priority?.[PRIORITY_LEVELS.HIGH] || 0}
                onPress={() => handleFilterByPriority(PRIORITY_LEVELS.HIGH)}
              />
            )}
              <SummaryCard
                priority={PRIORITY_LEVELS.MEDIUM}
                count={summary.by_priority?.[PRIORITY_LEVELS.MEDIUM] || 0}
                onPress={() => handleFilterByPriority(PRIORITY_LEVELS.MEDIUM)}
              />
              <SummaryCard
                priority={PRIORITY_LEVELS.LOW}
                count={summary.by_priority?.[PRIORITY_LEVELS.LOW] || 0}
                onPress={() => handleFilterByPriority(PRIORITY_LEVELS.LOW)}
              />
            </View>
          )}

          {/* Active Filters */}
          {Object.keys(filters).some(k => filters[k]) && (
            <View style={styles.activeFilters}>
              <Text style={styles.activeFiltersLabel}>Đang lọc:</Text>
              {filters.type && (
                <View style={[styles.activeFilterChip, { backgroundColor: TYPE_CONFIG[filters.type]?.color }]}>
                  <Text style={styles.activeFilterText}>{TYPE_CONFIG[filters.type]?.label}</Text>
                )}
                </View>
              )}
              {filters.priority && (
                <View style={[styles.activeFilterChip, { backgroundColor: PRIORITY_CONFIG[filters.priority]?.color }]}>
                  <Text style={styles.activeFilterText}>{PRIORITY_CONFIG[filters.priority]?.label}</Text>
                )}
                </View>
              )}
              <TouchableOpacity onPress={() => setFilters({})}>
                <X size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {/* Insights List */}
          {insights.length === 0 ? (
            <View style={styles.emptyState}>
              <Brain size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>Chưa có insights</Text>
              <Text style={styles.emptyText}>
                Nhấn nút AI để phân tích và tạo insights mới
              </Text>
              <TouchableOpacity
                style={styles.generateButtonLarge}
                onPress={handleGenerateInsights}
                disabled={generating}
              >
                {generating ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Brain size={18} color="#FFF" />
                    <Text style={styles.generateButtonText}>Tạo Insights</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            insights.map(insight => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onPress={() => setSelectedInsight(insight)}
                onAction={handleAction}
              />
            ))
          )}

          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Filter Modal */}
        <FilterModal
          visible={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          filters={filters}
          onApply={setFilters}
        />

        {/* Detail Modal */}
        <DetailModal
          visible={!!selectedInsight}
          insight={selectedInsight}
          onClose={() => setSelectedInsight(null)}
          onAction={handleAction}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textMuted,
    fontSize: 14,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: GLASS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  generateButton: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderColor: COLORS.purple,
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 20,
  },

  // Summary Grid
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: SPACING.md,
  },
  summaryCard: {
    width: '25%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: GLASS.card,
    borderRadius: 12,
    padding: SPACING.sm,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    borderLeftWidth: 3,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },

  // Active Filters
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  activeFiltersLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  activeFilterChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeFilterText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '500',
  },

  // Insight Card
  insightCard: {
    backgroundColor: GLASS.card,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.15)',
    position: 'relative',
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  insightType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  insightBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '500',
  },
  statusBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
    paddingRight: 24,
  },
  insightDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  insightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  confidenceLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  confidenceBar: {
    flex: 1,
    maxWidth: 60,
    height: 4,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: COLORS.purple,
    borderRadius: 2,
  },
  confidenceValue: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonDone: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDismiss: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(158, 158, 158, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightChevron: {
    position: 'absolute',
    right: SPACING.md,
    top: '50%',
    marginTop: -9,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  generateButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.purple,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  generateButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1B3D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Filter Modal
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  filterChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  applyButton: {
    backgroundColor: COLORS.purple,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  clearButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  clearButtonText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },

  // Detail Modal
  detailModalContent: {
    maxHeight: '90%',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  detailTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCloseButton: {
    padding: 4,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  detailBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.lg,
  },
  detailBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  detailBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  detailDescription: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  recommendationBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  metricItem: {
    flex: 1,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.purple,
  },
  notesInput: {
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  detailActions: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  detailActionDone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 14,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  detailActionText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  detailActionDismiss: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(158, 158, 158, 0.15)',
    paddingVertical: 14,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  detailActionDismissText: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default AIInsightsScreen;
