/**
 * SortOptions.js - Sort Options Component
 * Dropdown/modal for sorting products
 * Used in ShopScreen and ProductListScreen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';

// Sort options configuration
const SORT_OPTIONS = [
  { id: 'newest', label: 'Mới nhất', value: { field: 'created_at', direction: 'desc' } },
  { id: 'price_low', label: 'Giá thấp - cao', value: { field: 'price', direction: 'asc' } },
  { id: 'price_high', label: 'Giá cao - thấp', value: { field: 'price', direction: 'desc' } },
  { id: 'best_selling', label: 'Bán chạy', value: { field: 'sold_count', direction: 'desc' } },
  { id: 'rating', label: 'Đánh giá cao', value: { field: 'rating', direction: 'desc' } },
];

const SortOptions = ({
  selectedSort = 'newest',
  onSortChange,
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = SORT_OPTIONS.find(opt => opt.id === selectedSort) || SORT_OPTIONS[0];

  const handleSelect = (option) => {
    onSortChange?.(option.id, option.value);
    setModalVisible(false);
  };

  return (
    <View style={style}>
      {/* Sort Button */}
      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.sortButtonText}>{selectedOption.label}</Text>
        <ChevronDown size={16} color={COLORS.textSecondary} />
      </TouchableOpacity>

      {/* Sort Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sắp xếp theo</Text>

            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionItem,
                  option.id === selectedSort && styles.optionItemActive,
                ]}
                onPress={() => handleSelect(option)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionLabel,
                    option.id === selectedSort && styles.optionLabelActive,
                  ]}
                >
                  {option.label}
                </Text>
                {option.id === selectedSort && (
                  <Check size={18} color={COLORS.burgundy} strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
  },
  sortButtonText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bgMid,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.huge,
    paddingHorizontal: SPACING.lg,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionItemActive: {
    backgroundColor: 'rgba(156, 6, 18, 0.1)',
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  optionLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  optionLabelActive: {
    color: COLORS.burgundy,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});

export default SortOptions;
