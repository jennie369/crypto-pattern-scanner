/**
 * ChatbotAnalyticsScreen - GemMaster Chatbot Analytics
 * GEM Platform Admin Analytics Dashboard
 *
 * Features:
 * - Conversation stats
 * - Chatbot type usage (Tarot, IChing, TuVi, Trading)
 * - Popular spreads
 * - Ratings distribution
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MessageCircle,
  Sparkles,
  Star,
  Clock,
  Users,
  ChevronLeft,
  Layers,
  BookOpen,
  TrendingUp,
} from 'lucide-react-native';

import {
  MetricCard,
  TopItemsList,
  PieChart,
  FeatureBarChart,
  DateRangePicker,
  RefreshButton,
  ExportButton,
  LoadingSkeleton,
  TrendSparkline,
} from '../../../components/Admin/Analytics';
import { COLORS, GRADIENTS, SPACING, GLASS } from '../../../utils/tokens';

const ChatbotAnalyticsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false) // Never blocks UI;
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('LAST_7_DAYS');
  const [data, setData] = useState({
    overview: {},
    chatbotTypes: [],
    popularSpreads: [],
    ratingDistribution: [],
    dailyTrend: [],
  });

  const fetchData = useCallback(async () => {
    try {
      setData({
        overview: {
          totalConversations: 15678,
          totalConversationsChange: 18.5,
          totalMessages: 89432,
          totalMessagesChange: 22.3,
          avgSessionDuration: 4.5,
          avgSessionDurationChange: 8.2,
          avgRating: 4.6,
          avgRatingChange: 2.1,
        },
        chatbotTypes: [
          { label: 'Tarot Reading', value: 5234, color: COLORS.purple, icon: '🔮' },
          { label: 'I-Ching', value: 3456, color: COLORS.gold, icon: '☯️' },
          { label: 'Tử Vi', value: 2891, color: '#FF6B9D', icon: '⭐' },
          { label: 'Trading Assistant', value: 2345, color: COLORS.cyan, icon: '📈' },
          { label: 'General Chat', value: 1752, color: COLORS.success, icon: '💬' },
        ],
        popularSpreads: [
          { id: '1', label: 'Celtic Cross', value: 1234, subtitle: 'Tarot' },
          { id: '2', label: 'Three Card', value: 987, subtitle: 'Tarot' },
          { id: '3', label: 'Past Present Future', value: 756, subtitle: 'Tarot' },
          { id: '4', label: 'Love Reading', value: 654, subtitle: 'Tarot' },
          { id: '5', label: 'Career Guidance', value: 543, subtitle: 'I-Ching' },
        ],
        ratingDistribution: [
          { label: '5 ⭐', value: 8234, color: COLORS.gold },
          { label: '4 ⭐', value: 4567, color: COLORS.success },
          { label: '3 ⭐', value: 1234, color: COLORS.info },
          { label: '2 ⭐', value: 456, color: COLORS.warning },
          { label: '1 ⭐', value: 187, color: COLORS.error },
        ],
        dailyTrend: [1245, 1456, 1389, 1567, 1678, 1823, 1956],
        topTopics: [
          { label: 'Tình yêu & Quan hệ', value: 4521 },
          { label: 'Sự nghiệp & Công việc', value: 3245 },
          { label: 'Tài chính', value: 2456 },
          { label: 'Sức khỏe', value: 1789 },
          { label: 'Gia đình', value: 1234 },
        ],
      });
    } catch (error) {
      console.error('[ChatbotAnalytics] Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Loading screen removed - content renders immediately

  return (
    <LinearGradient colors={GRADIENTS.background} locations={GRADIENTS.backgroundLocations} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <ChevronLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Chatbot Analytics</Text>
              <Text style={styles.headerSubtitle}>GemMaster AI</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <RefreshButton onRefresh={onRefresh} loading={refreshing} compact />
            <ExportButton data={data.chatbotTypes} filename="chatbot_analytics" compact />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Date Range */}
          <DateRangePicker value={dateRange} onChange={(r) => setDateRange(r.key)} style={styles.datePicker} />

          {/* Overview Metrics */}
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Conversations"
              value={data.overview.totalConversations?.toLocaleString()}
              icon={MessageCircle}
              iconColor={COLORS.purple}
              trend={data.overview.totalConversationsChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.totalConversationsChange > 0 ? '+' : ''}${data.overview.totalConversationsChange}%`}
              size="small"
              style={styles.metricCard}
            />
            <MetricCard
              title="Messages"
              value={data.overview.totalMessages?.toLocaleString()}
              icon={Layers}
              iconColor={COLORS.cyan}
              trend={data.overview.totalMessagesChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.totalMessagesChange > 0 ? '+' : ''}${data.overview.totalMessagesChange}%`}
              size="small"
              style={styles.metricCard}
            />
            <MetricCard
              title="Avg Duration"
              value={`${data.overview.avgSessionDuration} min`}
              icon={Clock}
              iconColor={COLORS.gold}
              trend={data.overview.avgSessionDurationChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.avgSessionDurationChange > 0 ? '+' : ''}${data.overview.avgSessionDurationChange}%`}
              size="small"
              style={styles.metricCard}
            />
            <MetricCard
              title="Avg Rating"
              value={data.overview.avgRating}
              icon={Star}
              iconColor={COLORS.gold}
              trend={data.overview.avgRatingChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.avgRatingChange > 0 ? '+' : ''}${data.overview.avgRatingChange}%`}
              size="small"
              style={styles.metricCard}
            />
          </View>

          {/* Daily Trend */}
          <View style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.cardTitle}>Conversations (7 ngày)</Text>
              <TrendSparkline data={data.dailyTrend} width={100} height={30} color={COLORS.purple} />
            </View>
          </View>

          {/* Chatbot Types Usage */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loại Chatbot</Text>
            <View style={styles.typeGrid}>
              {data.chatbotTypes.map((type, index) => (
                <View key={index} style={[styles.typeCard, { borderLeftColor: type.color }]}>
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text style={styles.typeValue}>{type.value.toLocaleString()}</Text>
                  <Text style={styles.typeLabel}>{type.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Chatbot Distribution */}
          <PieChart
            title="Phân bố sử dụng"
            data={data.chatbotTypes}
            size={130}
            innerRadius={0.5}
            totalLabel="Sessions"
            style={styles.chartCard}
          />

          {/* Top Topics */}
          <FeatureBarChart
            title="Chủ đề phổ biến"
            data={data.topTopics}
            style={styles.chartCard}
          />

          {/* Popular Spreads */}
          <TopItemsList
            title="Spreads phổ biến"
            items={data.popularSpreads}
            maxItems={5}
            showRank={true}
            style={styles.listCard}
          />

          {/* Rating Distribution */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phân bố đánh giá</Text>
            <View style={styles.ratingCard}>
              {data.ratingDistribution.map((rating, index) => (
                <View key={index} style={styles.ratingRow}>
                  <Text style={styles.ratingLabel}>{rating.label}</Text>
                  <View style={styles.ratingBarContainer}>
                    <View
                      style={[
                        styles.ratingBar,
                        {
                          width: `${(rating.value / data.ratingDistribution[0].value) * 100}%`,
                          backgroundColor: rating.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.ratingValue}>{rating.value.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: SPACING.sm },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  headerSubtitle: { fontSize: 12, color: COLORS.textMuted },
  headerRight: { flexDirection: 'row', gap: SPACING.sm },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.md },
  datePicker: { marginBottom: SPACING.md },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: SPACING.md,
  },
  metricCard: { width: '50%', paddingHorizontal: 4, marginBottom: 8 },

  trendCard: {
    backgroundColor: GLASS.card,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    marginBottom: SPACING.md,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },

  section: { marginBottom: SPACING.md },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.sm },

  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  typeCard: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  typeCard: {
    backgroundColor: GLASS.card,
    borderRadius: 12,
    padding: SPACING.sm,
    marginHorizontal: 4,
    marginBottom: 8,
    width: '48%',
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    alignItems: 'center',
  },
  typeIcon: { fontSize: 24, marginBottom: 4 },
  typeValue: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  typeLabel: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: 2 },

  chartCard: { marginBottom: SPACING.md },
  listCard: { marginBottom: SPACING.md },

  ratingCard: {
    backgroundColor: GLASS.card,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ratingLabel: { width: 50, fontSize: 12, color: COLORS.textSecondary },
  ratingBarContainer: {
    flex: 1,
    height: 16,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 8,
    marginHorizontal: SPACING.sm,
    overflow: 'hidden',
  },
  ratingBar: { height: '100%', borderRadius: 8 },
  ratingValue: { width: 50, fontSize: 12, color: COLORS.textMuted, textAlign: 'right' },
});

export default ChatbotAnalyticsScreen;
