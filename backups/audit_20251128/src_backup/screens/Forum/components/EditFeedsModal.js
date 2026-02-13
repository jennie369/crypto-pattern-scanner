/**
 * Gemral - Edit Feeds Modal
 * Threads-style feed management interface
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Plus,
  ChevronRight,
  GripVertical,
  Trash2,
  Sparkles,
  Users,
} from 'lucide-react-native';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY } from '../../../utils/tokens';

const EditFeedsModal = ({
  isOpen,
  onClose,
  feeds = [],
  onReorder,
  onEdit,
  onDelete,
  onCreateNew,
}) => {
  const [editingFeeds, setEditingFeeds] = useState(feeds);

  // System feeds (cannot be edited/deleted)
  const systemFeeds = [
    { id: 'for-you', name: 'Dành Cho Bạn', subtitle: 'Cá nhân hóa', Icon: Sparkles, isSystem: true },
    { id: 'following', name: 'Đang Theo Dõi', subtitle: 'Người bạn follow', Icon: Users, isSystem: true },
  ];

  React.useEffect(() => {
    setEditingFeeds(feeds);
  }, [feeds]);

  const handleDelete = (feedId, feedName) => {
    Alert.alert(
      'Xóa Feed',
      `Bạn có chắc muốn xóa feed "${feedName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            onDelete(feedId);
            setEditingFeeds(editingFeeds.filter(f => f.id !== feedId));
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Quản Lý Feeds</Text>

            <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
              <Text style={styles.doneText}>Xong</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Create New Button */}
            <TouchableOpacity
              style={styles.createNewButton}
              onPress={() => {
                onClose();
                onCreateNew?.();
              }}
            >
              <View style={styles.createNewContent}>
                <Plus size={20} color={COLORS.gold} strokeWidth={2.5} />
                <Text style={styles.createNewText}>Tạo Feed Mới</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* Beta Notice */}
            <View style={styles.betaNotice}>
              <Text style={styles.betaText}>
                Beta - Nhấn giữ và kéo để sắp xếp thứ tự feeds
              </Text>
            </View>

            {/* System Feeds Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>FEEDS HỆ THỐNG</Text>
              <Text style={styles.sectionSubtitle}>Không thể chỉnh sửa hoặc xóa</Text>

              {systemFeeds.map((feed) => {
                const IconComponent = feed.Icon;
                return (
                  <View key={feed.id} style={styles.feedRow}>
                    <View style={styles.gripIcon}>
                      <GripVertical size={20} color={COLORS.textMuted} />
                    </View>
                    <IconComponent size={18} color={COLORS.gold} style={styles.feedIcon} />
                    <View style={styles.feedInfo}>
                      <Text style={styles.feedName}>{feed.name}</Text>
                      <Text style={styles.feedSubtitle}>{feed.subtitle}</Text>
                    </View>
                    <View style={styles.systemBadge}>
                      <Text style={styles.systemBadgeText}>Hệ thống</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Custom Feeds Section */}
            {editingFeeds.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>FEEDS TÙY CHỈNH</Text>
                <Text style={styles.sectionSubtitle}>Nhấn để chỉnh sửa, vuốt để xóa</Text>

                {editingFeeds.map((feed) => (
                  <TouchableOpacity
                    key={feed.id}
                    style={styles.feedRow}
                    onPress={() => {
                      onClose();
                      onEdit?.(feed);
                    }}
                    onLongPress={() => handleDelete(feed.id, feed.name)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.gripIcon}>
                      <GripVertical size={20} color={COLORS.textMuted} />
                    </View>
                    <Sparkles size={18} color={COLORS.gold} style={styles.feedIcon} />
                    <View style={styles.feedInfo}>
                      <Text style={styles.feedName}>{feed.name}</Text>
                      <Text style={styles.feedSubtitle}>
                        {feed.topics?.length || 0} chủ đề
                        {feed.profiles?.length > 0 && ` · ${feed.profiles.length} người dùng`}
                      </Text>
                    </View>
                    <View style={styles.feedActions}>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDelete(feed.id, feed.name)}
                      >
                        <Trash2 size={18} color={COLORS.error} />
                      </TouchableOpacity>
                      <ChevronRight size={20} color={COLORS.textMuted} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Empty State */}
            {editingFeeds.length === 0 && (
              <View style={styles.emptyState}>
                <Sparkles size={48} color={COLORS.gold} />
                <Text style={styles.emptyTitle}>Chưa có feed tùy chỉnh</Text>
                <Text style={styles.emptySubtitle}>
                  Tạo feed đầu tiên để theo dõi các chủ đề và người dùng yêu thích
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => {
                    onClose();
                    onCreateNew?.();
                  }}
                >
                  <Plus size={18} color={COLORS.bgDark} />
                  <Text style={styles.emptyButtonText}>Tạo Feed</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Bottom Padding */}
            <View style={{ height: 100 }} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 189, 89, 0.2)',
  },
  headerBtn: {
    width: 60,
    height: 44,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  doneText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    textAlign: 'right',
  },

  // Content
  content: {
    flex: 1,
    padding: SPACING.lg,
  },

  // Create New Button
  createNewButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  createNewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  createNewText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },

  // Beta Notice
  betaNotice: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  betaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Section
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },

  // Feed Row
  feedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gripIcon: {
    marginRight: SPACING.sm,
  },
  feedIcon: {
    marginRight: SPACING.md,
  },
  feedInfo: {
    flex: 1,
  },
  feedName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  feedSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  feedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // System Badge
  systemBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  systemBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 25,
  },
  emptyButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDark,
  },
});

export default EditFeedsModal;
