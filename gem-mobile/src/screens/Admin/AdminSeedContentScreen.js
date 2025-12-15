/**
 * Gemral - Admin Seed Content Screen
 * Manage seed users, posts, and AI bot
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Switch,
} from 'react-native';
import alertService from '../../services/alertService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Bot,
  Users,
  FileText,
  Heart,
  MessageCircle,
  Play,
  Pause,
  Trash2,
  RefreshCw,
  ChevronRight,
  Zap,
  Crown,
  UserPlus,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { CONTENT_BOTTOM_PADDING } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';

// Import seed services
import {
  getStats,
  getConfig,
  updateConfig,
  deleteAllSeedContent,
} from '../../services/seed/seedContentService';
import { generate as generateUsers } from '../../services/seed/seedUserGenerator';
import { generate as generatePosts } from '../../services/seed/seedPostGenerator';
import { generateAllInteractions } from '../../services/seed/seedInteractionGenerator';
import {
  initialize as initBot,
  stop as stopBot,
  getStatus as getBotStatus,
} from '../../services/seed/aiBotService';

const AdminSeedContentScreen = ({ navigation }) => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(null); // 'users', 'posts', 'interactions', null
  const [progress, setProgress] = useState({ message: '', current: 0, total: 0 });

  // Stats
  const [stats, setStats] = useState({
    seed_users_total: 0,
    seed_users_premium: 0,
    seed_users_regular: 0,
    seed_posts_total: 0,
    real_users_total: 0,
    real_posts_total: 0,
    bot_comments_today: 0,
    bot_likes_today: 0,
    bot_replies_today: 0,
  });

  // Config
  const [config, setConfig] = useState({
    bot_enabled: true,
    bot_auto_comment: true,
    bot_auto_reply: true,
    bot_auto_like: true,
  });

  // Bot status
  const [botStatus, setBotStatus] = useState({ isRunning: false, queueLength: 0 });

  useEffect(() => {
    loadData();
    updateBotStatus();
    const interval = setInterval(updateBotStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, configData] = await Promise.all([
        getStats(),
        getConfig(),
      ]);
      setStats(statsData);
      setConfig(configData);
    } catch (error) {
      console.error('[AdminSeed] Load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateBotStatus = () => {
    const status = getBotStatus();
    setBotStatus(status);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  // Toggle config
  const toggleConfig = async (key) => {
    const newValue = !config[key];
    setConfig(prev => ({ ...prev, [key]: newValue }));
    await updateConfig(key, newValue, user?.id);
  };

  // Generate seed users
  const handleGenerateUsers = async () => {
    alertService.warning(
      'Tạo Seed Users',
      'Tạo 500 seed users (100 Premium + 400 Regular)?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Tạo',
          onPress: async () => {
            try {
              setGenerating('users');
              setProgress({ message: 'Bắt đầu...', current: 0, total: 500 });

              await generateUsers({
                totalCount: 500,
                premiumCount: 100,
                onProgress: setProgress,
                generatedBy: user?.id,
              });

              alertService.success('Thành công', 'Đã tạo 500 seed users!');
              loadData();
            } catch (error) {
              alertService.error('Lỗi', error.message);
            } finally {
              setGenerating(null);
              setProgress({ message: '', current: 0, total: 0 });
            }
          },
        },
      ]
    );
  };

  // Generate seed posts
  const handleGeneratePosts = async () => {
    if (stats.seed_users_total === 0) {
      alertService.error('Lỗi', 'Vui lòng tạo seed users trước!');
      return;
    }

    alertService.warning(
      'Tạo Seed Posts',
      'Tạo 450 seed posts cho seed users?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Tạo',
          onPress: async () => {
            try {
              setGenerating('posts');
              setProgress({ message: 'Bắt đầu...', current: 0, total: 450 });

              await generatePosts({
                postCount: 450,
                onProgress: setProgress,
                generatedBy: user?.id,
              });

              alertService.success('Thành công', 'Đã tạo seed posts!');
              loadData();
            } catch (error) {
              alertService.error('Lỗi', error.message);
            } finally {
              setGenerating(null);
              setProgress({ message: '', current: 0, total: 0 });
            }
          },
        },
      ]
    );
  };

  // Generate interactions
  const handleGenerateInteractions = async () => {
    if (stats.seed_posts_total === 0) {
      alertService.error('Lỗi', 'Vui lòng tạo seed posts trước!');
      return;
    }

    alertService.warning(
      'Tạo Likes & Comments',
      `Tạo 200-300 likes và 15-20 comments cho ${stats.seed_posts_total} posts?\n\nQuá trình này có thể mất vài phút.`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Tạo',
          onPress: async () => {
            try {
              setGenerating('interactions');
              setProgress({ message: 'Bắt đầu...', current: 0, total: stats.seed_posts_total });

              await generateAllInteractions({
                onProgress: setProgress,
                generatedBy: user?.id,
              });

              alertService.success('Thành công', 'Đã tạo likes và comments!');
              loadData();
            } catch (error) {
              alertService.error('Lỗi', error.message);
            } finally {
              setGenerating(null);
              setProgress({ message: '', current: 0, total: 0 });
            }
          },
        },
      ]
    );
  };

  // Toggle bot
  const handleToggleBot = async () => {
    try {
      if (botStatus.isRunning) {
        await stopBot();
        alertService.info('Thông báo', 'Bot đã dừng');
      } else {
        await initBot();
        alertService.success('Thành công', 'Bot đã khởi động');
      }
      updateBotStatus();
      await toggleConfig('bot_enabled');
    } catch (error) {
      alertService.error('Lỗi', error.message);
    }
  };

  // Delete all seed content
  const handleDeleteAll = () => {
    alertService.error(
      'Xoá Tất Cả Seed Content',
      'Thao tác này sẽ XOÁ tất cả seed users, posts, likes, comments!\n\nKhông thể hoàn tác!',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xác nhận xoá',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const result = await deleteAllSeedContent();
              alertService.success(
                'Đã xoá',
                `Users: ${result.deleted_users}\nPosts: ${result.deleted_posts}\nComments: ${result.deleted_comments}\nLikes: ${result.deleted_likes}`
              );
              loadData();
            } catch (error) {
              alertService.error('Lỗi', error.message);
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedText}>Không có quyền truy cập</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={GRADIENTS.background}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seed Content & AI Bot</Text>
        <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
          <RefreshCw size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: CONTENT_BOTTOM_PADDING }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.gold} style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* Stats Overview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thống Kê</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                    <Users size={20} color="#8B5CF6" />
                  </View>
                  <Text style={styles.statValue}>{stats.seed_users_total}</Text>
                  <Text style={styles.statLabel}>Seed Users</Text>
                </View>
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(236, 72, 153, 0.2)' }]}>
                    <Crown size={20} color="#EC4899" />
                  </View>
                  <Text style={styles.statValue}>{stats.seed_users_premium}</Text>
                  <Text style={styles.statLabel}>Premium</Text>
                </View>
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                    <FileText size={20} color="#3B82F6" />
                  </View>
                  <Text style={styles.statValue}>{stats.seed_posts_total}</Text>
                  <Text style={styles.statLabel}>Seed Posts</Text>
                </View>
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                    <UserPlus size={20} color="#10B981" />
                  </View>
                  <Text style={styles.statValue}>{stats.real_users_total}</Text>
                  <Text style={styles.statLabel}>Real Users</Text>
                </View>
              </View>
            </View>

            {/* Bot Activity Today */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bot Activity Hôm Nay</Text>
              <View style={styles.activityRow}>
                <View style={styles.activityItem}>
                  <MessageCircle size={16} color={COLORS.gold} />
                  <Text style={styles.activityValue}>{stats.bot_comments_today}</Text>
                  <Text style={styles.activityLabel}>Comments</Text>
                </View>
                <View style={styles.activityItem}>
                  <Heart size={16} color="#EC4899" />
                  <Text style={styles.activityValue}>{stats.bot_likes_today}</Text>
                  <Text style={styles.activityLabel}>Likes</Text>
                </View>
                <View style={styles.activityItem}>
                  <MessageCircle size={16} color="#10B981" />
                  <Text style={styles.activityValue}>{stats.bot_replies_today}</Text>
                  <Text style={styles.activityLabel}>Replies</Text>
                </View>
              </View>
            </View>

            {/* Bot Controls */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bot Controls</Text>
              <View style={styles.card}>
                {/* Bot Status */}
                <TouchableOpacity style={styles.controlRow} onPress={handleToggleBot}>
                  <View style={styles.controlLeft}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: botStatus.isRunning ? '#10B981' : '#EF4444' }
                    ]} />
                    <Text style={styles.controlLabel}>Bot Status</Text>
                  </View>
                  <View style={styles.controlRight}>
                    <Text style={[
                      styles.statusText,
                      { color: botStatus.isRunning ? '#10B981' : '#EF4444' }
                    ]}>
                      {botStatus.isRunning ? 'RUNNING' : 'STOPPED'}
                    </Text>
                    {botStatus.isRunning ? (
                      <Pause size={20} color="#EF4444" />
                    ) : (
                      <Play size={20} color="#10B981" />
                    )}
                  </View>
                </TouchableOpacity>

                {botStatus.queueLength > 0 && (
                  <Text style={styles.queueInfo}>
                    {botStatus.queueLength} actions trong queue
                  </Text>
                )}

                <View style={styles.divider} />

                {/* Auto Comment Toggle */}
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Auto Comment</Text>
                  <Switch
                    value={config.bot_auto_comment}
                    onValueChange={() => toggleConfig('bot_auto_comment')}
                    trackColor={{ false: 'rgba(255,255,255,0.2)', true: COLORS.purple }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* Auto Reply Toggle */}
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Auto Reply</Text>
                  <Switch
                    value={config.bot_auto_reply}
                    onValueChange={() => toggleConfig('bot_auto_reply')}
                    trackColor={{ false: 'rgba(255,255,255,0.2)', true: COLORS.purple }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* Auto Like Toggle */}
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Auto Like</Text>
                  <Switch
                    value={config.bot_auto_like}
                    onValueChange={() => toggleConfig('bot_auto_like')}
                    trackColor={{ false: 'rgba(255,255,255,0.2)', true: COLORS.purple }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            </View>

            {/* Generation Progress */}
            {generating && (
              <View style={styles.section}>
                <View style={styles.progressCard}>
                  <ActivityIndicator size="small" color={COLORS.gold} />
                  <Text style={styles.progressText}>{progress.message}</Text>
                  {progress.total > 0 && (
                    <Text style={styles.progressCount}>
                      {progress.current} / {progress.total}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tạo Seed Content</Text>

              <TouchableOpacity
                style={[styles.actionButton, generating && styles.actionButtonDisabled]}
                onPress={handleGenerateUsers}
                disabled={!!generating}
              >
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                  <Users size={24} color="#8B5CF6" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Tạo 500 Seed Users</Text>
                  <Text style={styles.actionSubtitle}>100 Premium + 400 Regular</Text>
                </View>
                <ChevronRight size={20} color={COLORS.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, generating && styles.actionButtonDisabled]}
                onPress={handleGeneratePosts}
                disabled={!!generating}
              >
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                  <FileText size={24} color="#3B82F6" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Tạo Seed Posts</Text>
                  <Text style={styles.actionSubtitle}>~450 posts, backdated 30 ngày</Text>
                </View>
                <ChevronRight size={20} color={COLORS.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, generating && styles.actionButtonDisabled]}
                onPress={handleGenerateInteractions}
                disabled={!!generating}
              >
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(236, 72, 153, 0.2)' }]}>
                  <Heart size={24} color="#EC4899" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Tạo Likes & Comments</Text>
                  <Text style={styles.actionSubtitle}>200-300 likes, 15-20 comments/post</Text>
                </View>
                <ChevronRight size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Danger Zone */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Danger Zone</Text>
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={handleDeleteAll}
                disabled={!!generating}
              >
                <Trash2 size={20} color="#EF4444" />
                <Text style={styles.dangerButtonText}>Xoá Tất Cả Seed Content</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
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
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gold,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  statCard: {
    width: '50%',
    padding: SPACING.xs,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.glassBg,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityItem: {
    alignItems: 'center',
  },
  activityValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: SPACING.xs,
  },
  activityLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  card: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  controlLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.sm,
  },
  controlLabel: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  controlRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  queueInfo: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginVertical: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: SPACING.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  progressCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: SPACING.sm,
  },
  progressCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: SPACING.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  dangerButtonText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  accessDenied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessDeniedText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

export default AdminSeedContentScreen;
