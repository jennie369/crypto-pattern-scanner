/**
 * Gemral - Scheduled Posts Screen
 * Feature #16: View and manage scheduled posts
 * Uses dark glass theme from DESIGN_TOKENS
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar,
  Clock,
  ArrowLeft,
  MoreVertical,
  Send,
  Edit3,
  Trash2,
  XCircle,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, GLASS } from '../../utils/tokens';
import { scheduleService } from '../../services/scheduleService';

const ScheduledPostsScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [filter, setFilter] = useState('pending'); // 'pending', 'published', 'cancelled', 'all'

  const loadPosts = useCallback(async () => {
    try {
      const status = filter === 'all' ? null : filter;
      const data = await scheduleService.getScheduledPosts(status);
      setPosts(data);
    } catch (error) {
      console.error('[ScheduledPosts] Load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const handlePublishNow = async (postId) => {
    Alert.alert(
      'Dang ngay',
      'Ban co chac muon dang bai viet nay ngay bay gio?',
      [
        { text: 'Huy', style: 'cancel' },
        {
          text: 'Dang',
          onPress: async () => {
            const result = await scheduleService.publishNow(postId);
            if (result.success) {
              Alert.alert('Thanh cong', 'Bai viet da duoc dang');
              loadPosts();
            } else {
              Alert.alert('Loi', result.error);
            }
          },
        },
      ]
    );
    setActiveMenu(null);
  };

  const handleCancel = async (postId) => {
    Alert.alert(
      'Huy lich hen',
      'Ban co chac muon huy lich hen bai viet nay?',
      [
        { text: 'Khong', style: 'cancel' },
        {
          text: 'Huy lich',
          style: 'destructive',
          onPress: async () => {
            const result = await scheduleService.cancelScheduledPost(postId);
            if (result.success) {
              loadPosts();
            } else {
              Alert.alert('Loi', result.error);
            }
          },
        },
      ]
    );
    setActiveMenu(null);
  };

  const handleDelete = async (postId) => {
    Alert.alert(
      'Xoa bai viet',
      'Ban co chac muon xoa bai viet nay? Hanh dong nay khong the hoan tac.',
      [
        { text: 'Huy', style: 'cancel' },
        {
          text: 'Xoa',
          style: 'destructive',
          onPress: async () => {
            const result = await scheduleService.deleteScheduledPost(postId);
            if (result.success) {
              loadPosts();
            } else {
              Alert.alert('Loi', result.error);
            }
          },
        },
      ]
    );
    setActiveMenu(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return COLORS.cyan;
      case 'published':
        return COLORS.success;
      case 'cancelled':
        return COLORS.textMuted;
      case 'failed':
        return COLORS.error;
      default:
        return COLORS.textMuted;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Cho dang';
      case 'published':
        return 'Da dang';
      case 'cancelled':
        return 'Da huy';
      case 'failed':
        return 'That bai';
      default:
        return status;
    }
  };

  const renderPost = ({ item }) => {
    const isPending = item.status === 'pending';
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.postCard}>
        {/* Header */}
        <View style={styles.postHeader}>
          <View style={styles.scheduleInfo}>
            <Clock size={16} color={statusColor} />
            <Text style={[styles.scheduleTime, { color: statusColor }]}>
              {scheduleService.formatScheduleTime(item.scheduled_at)}
            </Text>
          </View>

          <View style={styles.postHeaderRight}>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getStatusText(item.status)}
              </Text>
            </View>

            {isPending && (
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
              >
                <MoreVertical size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content */}
        <Text style={styles.postTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.postContent} numberOfLines={3}>
          {item.content}
        </Text>

        {/* Topic Badge */}
        {item.topic && (
          <View style={styles.topicBadge}>
            <Text style={styles.topicText}>{item.topic}</Text>
          </View>
        )}

        {/* Action Menu */}
        {activeMenu === item.id && (
          <View style={styles.actionMenu}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handlePublishNow(item.id)}
            >
              <Send size={18} color={COLORS.success} />
              <Text style={styles.actionText}>Dang ngay</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                setActiveMenu(null);
                navigation.navigate('CreatePost', { editScheduled: item });
              }}
            >
              <Edit3 size={18} color={COLORS.cyan} />
              <Text style={styles.actionText}>Chinh sua</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleCancel(item.id)}
            >
              <XCircle size={18} color={COLORS.warning} />
              <Text style={styles.actionText}>Huy lich</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleDelete(item.id)}
            >
              <Trash2 size={18} color={COLORS.error} />
              <Text style={[styles.actionText, { color: COLORS.error }]}>Xoa</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Calendar size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>Khong co bai viet</Text>
      <Text style={styles.emptyText}>
        {filter === 'pending'
          ? 'Ban chua co bai viet nao duoc len lich'
          : 'Khong tim thay bai viet nao'}
      </Text>
    </View>
  );

  const filters = [
    { key: 'pending', label: 'Cho dang' },
    { key: 'published', label: 'Da dang' },
    { key: 'cancelled', label: 'Da huy' },
    { key: 'all', label: 'Tat ca' },
  ];

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bai viet da len lich</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterTab,
                filter === f.key && styles.filterTabActive,
              ]}
              onPress={() => setFilter(f.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f.key && styles.filterTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Posts List */}
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={!loading && renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.purple}
            />
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: 32,
  },
  // Filters
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  filterTab: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    backgroundColor: GLASS.background,
  },
  filterTabActive: {
    backgroundColor: COLORS.purple,
  },
  filterText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  filterTextActive: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  // List
  listContent: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  // Post Card
  postCard: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  scheduleTime: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  postHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 12,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  menuButton: {
    padding: SPACING.xs,
  },
  // Post Content
  postTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  postContent: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  topicBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 10,
    marginTop: SPACING.sm,
  },
  topicText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.purple,
  },
  // Action Menu
  actionMenu: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['2xl'],
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});

export default ScheduledPostsScreen;
