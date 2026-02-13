/**
 * KarmaDashboardScreen - Main karma dashboard with stats, history, leaderboard
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Flame,
  Trophy,
  Shield,
  ChevronRight,
  History,
  Users,
  Sparkles,
  Lock,
  MessageSquare,
  Zap,
  AlertTriangle,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../utils/tokens';

// Import Karma components
import {
  KarmaBar,
  KarmaLevelBadge,
  KarmaHistoryItem,
  KarmaStatCard,
  KarmaLeaderboardItem,
} from '../../components/Karma';

// Import Karma service
import karmaService, { KARMA_LEVEL_THRESHOLDS } from '../../services/karmaService';

const TAB_OPTIONS = [
  { id: 'overview', label: 'Tổng quan', icon: Sparkles },
  { id: 'history', label: 'Lịch sử', icon: History },
  { id: 'leaderboard', label: 'Bảng xếp hạng', icon: Trophy },
];

const KarmaDashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Data state
  const [karmaData, setKarmaData] = useState(null);
  const [history, setHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);

  // Load karma data
  const loadKarmaData = useCallback(async (forceRefresh = false) => {
    try {
      if (!user?.id) return;

      const data = await karmaService.getUserKarma(user.id, forceRefresh);
      setKarmaData(data);
      setError(null);
    } catch (err) {
      console.error('Error loading karma data:', err);
      setError('Không thể tải dữ liệu Karma');
    }
  }, [user?.id]);

  // Load history
  const loadHistory = useCallback(async (page = 0, append = false) => {
    try {
      if (!user?.id) return;

      const result = await karmaService.getKarmaHistory(user.id, {
        limit: 20,
        offset: page * 20,
      });

      if (append) {
        setHistory(prev => [...prev, ...(result?.data || [])]);
      } else {
        setHistory(result?.data || []);
      }

      setHasMoreHistory((result?.data || []).length >= 20);
      setHistoryPage(page);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  }, [user?.id]);

  // Load leaderboard
  const loadLeaderboard = useCallback(async () => {
    try {
      const data = await karmaService.getLeaderboard(20);
      setLeaderboard(data || []);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        loadKarmaData(true),
        loadHistory(0),
        loadLeaderboard(),
      ]);
      setLoading(false);
    };
    init();
  }, [loadKarmaData, loadHistory, loadLeaderboard]);

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadKarmaData(true),
      loadHistory(0),
      loadLeaderboard(),
    ]);
    setRefreshing(false);
  };

  // Load more history
  const loadMoreHistory = () => {
    if (hasMoreHistory && !loading) {
      loadHistory(historyPage + 1, true);
    }
  };

  // Get level config
  const levelConfig = karmaData?.karma_level
    ? KARMA_LEVEL_THRESHOLDS[karmaData.karma_level]
    : KARMA_LEVEL_THRESHOLDS.student;

  // Get next level info
  const nextLevelInfo = karmaService.getNextLevel(karmaData?.karma_level || 'student');

  // Calculate progress to next level
  const progress = karmaService.calculateLevelProgress(
    karmaData?.karma_points || 0,
    karmaData?.karma_level || 'student'
  );

  // Get benefits for current level
  const benefits = levelConfig?.benefits || {};

  // Find current user's rank in leaderboard
  const currentUserRank = leaderboard.findIndex(item => item.user_id === user?.id) + 1;

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'history':
        return renderHistory();
      case 'leaderboard':
        return renderLeaderboard();
      default:
        return renderOverview();
    }
  };

  // Render overview tab
  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Karma Progress */}
      <View style={styles.section}>
        <KarmaBar
          karmaPoints={karmaData?.karma_points || 0}
          karmaLevel={karmaData?.karma_level || 'student'}
          showLevelInfo={true}
          animated={true}
        />
      </View>

      {/* Next Level Info */}
      {nextLevelInfo && (
        <View style={styles.nextLevelCard}>
          <View style={styles.nextLevelHeader}>
            <Text style={styles.nextLevelTitle}>Cấp tiếp theo</Text>
            <KarmaLevelBadge level={nextLevelInfo.level} size="small" showLabel={false} />
          </View>
          <Text style={[styles.nextLevelName, { color: nextLevelInfo.color }]}>
            {nextLevelInfo.name}
          </Text>
          <Text style={styles.nextLevelPoints}>
            Còn {nextLevelInfo.pointsNeeded - (karmaData?.karma_points || 0)} Karma
          </Text>
        </View>
      )}

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <KarmaStatCard
          label="Tổng tích lũy"
          value={karmaData?.total_earned || 0}
          icon={TrendingUp}
          iconColor={COLORS.success}
          compact={true}
        />
        <KarmaStatCard
          label="Đã mất"
          value={karmaData?.total_lost || 0}
          icon={TrendingDown}
          iconColor={COLORS.error}
          compact={true}
        />
        <KarmaStatCard
          label="Chuỗi kỷ luật"
          value={karmaData?.current_discipline_streak || 0}
          subValue="ngày"
          icon={Flame}
          iconColor={COLORS.warning}
          compact={true}
        />
        <KarmaStatCard
          label="Kỷ lục"
          value={karmaData?.best_discipline_streak || 0}
          subValue="ngày"
          icon={Trophy}
          iconColor={COLORS.purple}
          compact={true}
        />
      </View>

      {/* Benefits Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Shield size={20} color={levelConfig.color} strokeWidth={2} />
          <Text style={styles.sectionTitle}>Quyền lợi cấp bậc</Text>
        </View>
        <View style={styles.benefitsList}>
          {benefits.daily_signals && (
            <View style={styles.benefitItem}>
              <Zap size={16} color={COLORS.cyan} strokeWidth={2} />
              <Text style={styles.benefitText}>
                {benefits.daily_signals} tín hiệu/ngày
              </Text>
            </View>
          )}
          {benefits.daily_trade_limit && (
            <View style={styles.benefitItem}>
              <TrendingUp size={16} color={COLORS.success} strokeWidth={2} />
              <Text style={styles.benefitText}>
                {benefits.daily_trade_limit === 999 ? 'Không giới hạn' : benefits.daily_trade_limit} lệnh/ngày
              </Text>
            </View>
          )}
          {benefits.group_chat && (
            <View style={styles.benefitItem}>
              <MessageSquare size={16} color={COLORS.purple} strokeWidth={2} />
              <Text style={styles.benefitText}>Truy cập Group Chat VIP</Text>
            </View>
          )}
          {benefits.vip_group && (
            <View style={styles.benefitItem}>
              <Users size={16} color={COLORS.warning} strokeWidth={2} />
              <Text style={styles.benefitText}>Nhóm Master VIP</Text>
            </View>
          )}
          {benefits.can_mentor && (
            <View style={styles.benefitItem}>
              <Sparkles size={16} color={COLORS.goldBright} strokeWidth={2} />
              <Text style={styles.benefitText}>Quyền Mentor</Text>
            </View>
          )}
        </View>
      </View>

      {/* Recent History Preview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <History size={20} color={COLORS.textSecondary} strokeWidth={2} />
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          <TouchableOpacity
            onPress={() => setActiveTab('history')}
            style={styles.seeAllBtn}
          >
            <Text style={styles.seeAllText}>Xem tất cả</Text>
            <ChevronRight size={16} color={COLORS.cyan} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        {history.slice(0, 5).map((item, index) => (
          <KarmaHistoryItem
            key={item.id || index}
            item={item}
            style={styles.historyItem}
          />
        ))}
        {history.length === 0 && (
          <Text style={styles.emptyText}>Chưa có hoạt động nào</Text>
        )}
      </View>

      {/* Leaderboard Preview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Trophy size={20} color={COLORS.warning} strokeWidth={2} />
          <Text style={styles.sectionTitle}>Bảng xếp hạng</Text>
          <TouchableOpacity
            onPress={() => setActiveTab('leaderboard')}
            style={styles.seeAllBtn}
          >
            <Text style={styles.seeAllText}>Xem tất cả</Text>
            <ChevronRight size={16} color={COLORS.cyan} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        {leaderboard.slice(0, 5).map((item, index) => (
          <KarmaLeaderboardItem
            key={item.user_id || index}
            rank={index + 1}
            userId={item.user_id}
            displayName={item.display_name || 'Người dùng'}
            avatarUrl={item.avatar_url}
            karmaPoints={item.karma_points || 0}
            karmaLevel={item.karma_level || 'student'}
            streak={item.current_discipline_streak || 0}
            isCurrentUser={item.user_id === user?.id}
            style={styles.leaderboardItem}
          />
        ))}
      </View>
    </View>
  );

  // Render history tab
  const renderHistory = () => (
    <FlatList
      data={history}
      keyExtractor={(item, index) => item.id || `history-${index}`}
      renderItem={({ item }) => (
        <KarmaHistoryItem item={item} style={styles.historyItem} />
      )}
      contentContainerStyle={styles.historyList}
      onEndReached={loadMoreHistory}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <History size={48} color={COLORS.textMuted} strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>Chưa có lịch sử</Text>
          <Text style={styles.emptySubtitle}>
            Hoạt động Karma sẽ được hiển thị ở đây
          </Text>
        </View>
      }
      ListFooterComponent={
        hasMoreHistory ? (
          <ActivityIndicator size="small" color={COLORS.cyan} style={styles.loadingMore} />
        ) : null
      }
    />
  );

  // Render leaderboard tab
  const renderLeaderboard = () => (
    <FlatList
      data={leaderboard}
      keyExtractor={(item, index) => item.user_id || `leader-${index}`}
      renderItem={({ item, index }) => (
        <KarmaLeaderboardItem
          rank={index + 1}
          userId={item.user_id}
          displayName={item.display_name || 'Người dùng'}
          avatarUrl={item.avatar_url}
          karmaPoints={item.karma_points || 0}
          karmaLevel={item.karma_level || 'student'}
          streak={item.current_discipline_streak || 0}
          isCurrentUser={item.user_id === user?.id}
          style={styles.leaderboardItem}
        />
      )}
      contentContainerStyle={styles.leaderboardList}
      ListHeaderComponent={
        currentUserRank > 0 && currentUserRank > 5 ? (
          <View style={styles.yourRankCard}>
            <Text style={styles.yourRankLabel}>Hạng của bạn</Text>
            <Text style={styles.yourRankValue}>#{currentUserRank}</Text>
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Trophy size={48} color={COLORS.textMuted} strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>Chưa có dữ liệu</Text>
          <Text style={styles.emptySubtitle}>
            Bảng xếp hạng sẽ được cập nhật khi có người dùng
          </Text>
        </View>
      }
    />
  );

  // Frozen account view
  if (karmaData?.is_frozen) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient
          colors={[COLORS.bgMid, '#1A1B4B', COLORS.bgMid]}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <ArrowLeft size={24} color={COLORS.textPrimary} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Karma</Text>
            <View style={styles.headerRight} />
          </View>

          <View style={styles.frozenContainer}>
            <Lock size={64} color={COLORS.error} strokeWidth={1.5} />
            <Text style={styles.frozenTitle}>Tài khoản bị đóng băng</Text>
            <Text style={styles.frozenText}>
              Karma của bạn đã xuống dưới 0. Vui lòng hoàn thành bài tập phục hồi để mở khóa.
            </Text>
            <TouchableOpacity
              style={styles.recoveryBtn}
              onPress={() => {
                // A4: RecoveryQuest screen doesn't exist — show alert until implemented
                Alert.alert('Sắp ra mắt', 'Tính năng phục hồi Karma đang được phát triển.');
              }}
            >
              <LinearGradient
                colors={[COLORS.purple, COLORS.cyan]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.recoveryBtnGradient}
              >
                <Text style={styles.recoveryBtnText}>Bắt đầu phục hồi</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Loading state
  if (loading && !karmaData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient
          colors={[COLORS.bgMid, '#1A1B4B', COLORS.bgMid]}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.cyan} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !karmaData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient
          colors={[COLORS.bgMid, '#1A1B4B', COLORS.bgMid]}
          style={styles.gradient}
        >
          <View style={styles.errorContainer}>
            <AlertTriangle size={48} color={COLORS.error} strokeWidth={1.5} />
            <Text style={styles.errorTitle}>Có lỗi xảy ra</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => loadKarmaData(true)}
            >
              <Text style={styles.retryBtnText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[COLORS.bgMid, '#1A1B4B', COLORS.bgMid]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <KarmaLevelBadge
              level={karmaData?.karma_level || 'student'}
              size="small"
              showLabel={true}
              showPoints={true}
              karmaPoints={karmaData?.karma_points || 0}
            />
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Tab Selector */}
        <View style={styles.tabSelector}>
          {TAB_OPTIONS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <tab.icon
                  size={18}
                  color={isActive ? COLORS.cyan : COLORS.textMuted}
                  strokeWidth={2}
                />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content */}
        {activeTab === 'overview' ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.cyan}
              />
            }
          >
            {renderOverview()}
          </ScrollView>
        ) : (
          <View style={styles.listContainer}>
            {renderTabContent()}
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgMid,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
  },
  tabSelector: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(0, 217, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
  },
  tabLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: COLORS.cyan,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl,
  },
  listContainer: {
    flex: 1,
  },
  tabContent: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    flex: 1,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    color: COLORS.cyan,
    fontSize: FONT_SIZES.sm,
  },
  nextLevelCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  nextLevelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  nextLevelTitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
  },
  nextLevelName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  nextLevelPoints: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  benefitsList: {
    gap: SPACING.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
  },
  benefitText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    flex: 1,
  },
  historyItem: {
    marginBottom: SPACING.sm,
  },
  historyList: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  leaderboardItem: {
    marginBottom: SPACING.sm,
  },
  leaderboardList: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  yourRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  yourRankLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  yourRankValue: {
    color: '#8B5CF6',
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.md,
  },
  loadingMore: {
    paddingVertical: SPACING.lg,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  errorText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryBtn: {
    backgroundColor: 'rgba(0, 217, 255, 0.15)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
  },
  retryBtnText: {
    color: COLORS.cyan,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  frozenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  frozenTitle: {
    color: COLORS.error,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  frozenText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    maxWidth: 300,
  },
  recoveryBtn: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  recoveryBtnGradient: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    alignItems: 'center',
  },
  recoveryBtnText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});

export default KarmaDashboardScreen;
