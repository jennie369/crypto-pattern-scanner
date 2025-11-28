/**
 * Gemral - Comment Filter Component
 * Feature #19: Filter and sort comments
 * Uses dark glass theme from DESIGN_TOKENS
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  SlidersHorizontal,
  Clock,
  TrendingUp,
  ThumbsUp,
  MessageSquare,
  Check,
  ChevronDown,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../utils/tokens';

const CommentFilter = ({
  currentSort = 'newest',
  onSortChange,
  commentCount = 0,
}) => {
  const [showModal, setShowModal] = useState(false);

  const sortOptions = [
    {
      key: 'newest',
      label: 'Moi nhat',
      description: 'Hien thi binh luan moi nhat truoc',
      icon: Clock,
    },
    {
      key: 'oldest',
      label: 'Cu nhat',
      description: 'Hien thi binh luan cu nhat truoc',
      icon: Clock,
    },
    {
      key: 'popular',
      label: 'Pho bien',
      description: 'Sap xep theo luot thich va tra loi',
      icon: TrendingUp,
    },
    {
      key: 'most_liked',
      label: 'Nhieu tim nhat',
      description: 'Hien thi binh luan duoc thich nhieu nhat',
      icon: ThumbsUp,
    },
    {
      key: 'most_replies',
      label: 'Nhieu tra loi',
      description: 'Hien thi binh luan co nhieu tra loi nhat',
      icon: MessageSquare,
    },
  ];

  const currentOption = sortOptions.find(o => o.key === currentSort) || sortOptions[0];
  const CurrentIcon = currentOption.icon;

  const handleSelect = (sortKey) => {
    onSortChange?.(sortKey);
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      {/* Comment Count & Sort Button */}
      <View style={styles.header}>
        <Text style={styles.commentCount}>
          {commentCount} binh luan
        </Text>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowModal(true)}
          activeOpacity={0.7}
        >
          <SlidersHorizontal size={16} color={COLORS.textMuted} />
          <Text style={styles.sortButtonText}>{currentOption.label}</Text>
          <ChevronDown size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Sort Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <BlurView intensity={20} style={styles.modalBlur}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Sap xep binh luan</Text>

              {sortOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = currentSort === option.key;

                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.optionItem,
                      isSelected && styles.optionItemSelected,
                    ]}
                    onPress={() => handleSelect(option.key)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionLeft}>
                      <View
                        style={[
                          styles.optionIcon,
                          isSelected && styles.optionIconSelected,
                        ]}
                      >
                        <Icon
                          size={18}
                          color={isSelected ? COLORS.textPrimary : COLORS.textMuted}
                        />
                      </View>
                      <View style={styles.optionInfo}>
                        <Text
                          style={[
                            styles.optionLabel,
                            isSelected && styles.optionLabelSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                        <Text style={styles.optionDescription}>
                          {option.description}
                        </Text>
                      </View>
                    </View>

                    {isSelected && (
                      <Check size={20} color={COLORS.success} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </BlurView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

/**
 * Comment Sort Utilities
 */
export const sortComments = (comments, sortBy) => {
  if (!comments || comments.length === 0) return [];

  const sorted = [...comments];

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      );

    case 'oldest':
      return sorted.sort((a, b) =>
        new Date(a.created_at) - new Date(b.created_at)
      );

    case 'popular':
      return sorted.sort((a, b) => {
        const scoreA = (a.likes_count || 0) * 2 + (a.replies_count || 0);
        const scoreB = (b.likes_count || 0) * 2 + (b.replies_count || 0);
        return scoreB - scoreA;
      });

    case 'most_liked':
      return sorted.sort((a, b) =>
        (b.likes_count || 0) - (a.likes_count || 0)
      );

    case 'most_replies':
      return sorted.sort((a, b) =>
        (b.replies_count || 0) - (a.replies_count || 0)
      );

    default:
      return sorted;
  }
};

/**
 * Filter comments by criteria
 */
export const filterComments = (comments, filters = {}) => {
  if (!comments || comments.length === 0) return [];

  let filtered = [...comments];

  // Filter by user
  if (filters.userId) {
    filtered = filtered.filter(c => c.user_id === filters.userId);
  }

  // Filter by has replies
  if (filters.hasReplies) {
    filtered = filtered.filter(c => (c.replies_count || 0) > 0);
  }

  // Filter by has media
  if (filters.hasMedia) {
    filtered = filtered.filter(c => c.images?.length > 0);
  }

  // Filter by time range
  if (filters.timeRange) {
    const now = new Date();
    let cutoff;

    switch (filters.timeRange) {
      case 'today':
        cutoff = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoff = null;
    }

    if (cutoff) {
      filtered = filtered.filter(c => new Date(c.created_at) >= cutoff);
    }
  }

  // Search by content
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(c =>
      c.content?.toLowerCase().includes(query)
    );
  }

  return filtered;
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  commentCount: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: GLASS.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  sortButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBlur: {
    width: '90%',
    maxWidth: 340,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalContent: {
    backgroundColor: GLASS.background,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  // Option Items
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionItemSelected: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIconSelected: {
    backgroundColor: COLORS.purple,
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: COLORS.textPrimary,
  },
  optionDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
});

export default CommentFilter;
