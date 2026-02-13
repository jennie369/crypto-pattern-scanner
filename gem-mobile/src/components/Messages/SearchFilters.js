/**
 * SearchFilters Component
 * Filters for advanced message search
 *
 * Features:
 * - Message type filter (text, image, video, audio, file)
 * - Date range filter
 * - Sender filter (in group chats)
 * - Collapsible filter panel
 */

import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

// Message types
const MESSAGE_TYPES = [
  { id: 'all', label: 'Tất cả', icon: 'layers-outline' },
  { id: 'text', label: 'Văn bản', icon: 'chatbubble-outline' },
  { id: 'image', label: 'Hình ảnh', icon: 'image-outline' },
  { id: 'video', label: 'Video', icon: 'videocam-outline' },
  { id: 'audio', label: 'Âm thanh', icon: 'mic-outline' },
  { id: 'file', label: 'Tệp', icon: 'document-outline' },
];

// Date range options
const DATE_RANGES = [
  { id: 'all', label: 'Mọi lúc' },
  { id: 'today', label: 'Hôm nay' },
  { id: 'week', label: '7 ngày qua' },
  { id: 'month', label: '30 ngày qua' },
  { id: 'year', label: '1 năm qua' },
];

/**
 * SearchFilters - Bộ lọc tìm kiếm tin nhắn
 *
 * @param {object} filters - Current filter values { messageType, dateRange, senderId }
 * @param {function} onFiltersChange - Callback khi filter thay đổi
 * @param {array} participants - Danh sách người tham gia (cho filter sender)
 * @param {boolean} showSenderFilter - Hiện filter sender (cho group chat)
 */
const SearchFilters = memo(({
  filters,
  onFiltersChange,
  participants = [],
  showSenderFilter = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showSenderModal, setShowSenderModal] = useState(false);

  // Update single filter
  const updateFilter = useCallback((key, value) => {
    onFiltersChange?.({
      ...filters,
      [key]: value,
    });
  }, [filters, onFiltersChange]);

  // Get active filters count
  const activeFiltersCount = [
    filters?.messageType && filters.messageType !== 'all',
    filters?.dateRange && filters.dateRange !== 'all',
    filters?.senderId,
  ].filter(Boolean).length;

  // Get sender name
  const getSelectedSenderName = () => {
    if (!filters?.senderId) return null;
    const sender = participants.find(p => p.id === filters.senderId);
    return sender?.display_name || 'Unknown';
  };

  // Clear all filters
  const clearFilters = useCallback(() => {
    onFiltersChange?.({
      messageType: 'all',
      dateRange: 'all',
      senderId: null,
    });
  }, [onFiltersChange]);

  return (
    <View style={styles.container}>
      {/* Filter Toggle Button */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Ionicons
          name="options-outline"
          size={18}
          color={activeFiltersCount > 0 ? COLORS.gold : COLORS.textMuted}
        />
        <Text style={[
          styles.toggleText,
          activeFiltersCount > 0 && styles.toggleTextActive,
        ]}>
          Bộ lọc
        </Text>
        {activeFiltersCount > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
          </View>
        )}
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={COLORS.textMuted}
        />
      </TouchableOpacity>

      {/* Expanded Filters */}
      {expanded && (
        <View style={styles.filtersPanel}>
          {/* Message Type Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Loại tin nhắn</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsContainer}
            >
              {MESSAGE_TYPES.map((type) => {
                const isSelected = filters?.messageType === type.id;
                return (
                  <TouchableOpacity
                    key={type.id}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => updateFilter('messageType', type.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={type.icon}
                      size={16}
                      color={isSelected ? COLORS.bgDarkest : COLORS.textPrimary}
                    />
                    <Text style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Date Range Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Thời gian</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsContainer}
            >
              {DATE_RANGES.map((range) => {
                const isSelected = filters?.dateRange === range.id;
                return (
                  <TouchableOpacity
                    key={range.id}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => updateFilter('dateRange', range.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Sender Filter (for group chats) */}
          {showSenderFilter && participants.length > 0 && (
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Người gửi</Text>
              <TouchableOpacity
                style={styles.senderButton}
                onPress={() => setShowSenderModal(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.senderButtonText}>
                  {getSelectedSenderName() || 'Tất cả'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearFilters}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={16} color={COLORS.error} />
              <Text style={styles.clearButtonText}>Xóa bộ lọc</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Sender Selection Modal */}
      <Modal
        visible={showSenderModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSenderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn người gửi</Text>
              <TouchableOpacity onPress={() => setShowSenderModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.senderList}>
              {/* All option */}
              <TouchableOpacity
                style={[
                  styles.senderItem,
                  !filters?.senderId && styles.senderItemSelected,
                ]}
                onPress={() => {
                  updateFilter('senderId', null);
                  setShowSenderModal(false);
                }}
              >
                <Text style={styles.senderItemText}>Tất cả</Text>
                {!filters?.senderId && (
                  <Ionicons name="checkmark" size={20} color={COLORS.gold} />
                )}
              </TouchableOpacity>

              {/* Participants */}
              {participants.map((participant) => {
                const isSelected = filters?.senderId === participant.id;
                return (
                  <TouchableOpacity
                    key={participant.id}
                    style={[
                      styles.senderItem,
                      isSelected && styles.senderItemSelected,
                    ]}
                    onPress={() => {
                      updateFilter('senderId', participant.id);
                      setShowSenderModal(false);
                    }}
                  >
                    <Text style={styles.senderItemText}>
                      {participant.display_name}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={COLORS.gold} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
});

SearchFilters.displayName = 'SearchFilters';

export default SearchFilters;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(5, 4, 11, 0.95)',
  },

  // Toggle Button
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  toggleText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
  },
  toggleTextActive: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  filterBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
  },

  // Filters Panel
  filtersPanel: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.1)',
  },
  filterSection: {
    marginTop: SPACING.md,
  },
  filterLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },

  // Chips
  chipsContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.xxs,
  },
  chipSelected: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  chipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
  },
  chipTextSelected: {
    color: COLORS.bgDarkest,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // Sender Button
  senderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  senderButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
  },

  // Clear Button
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  clearButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.glassBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  senderList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  senderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  senderItemSelected: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  senderItemText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },
});
