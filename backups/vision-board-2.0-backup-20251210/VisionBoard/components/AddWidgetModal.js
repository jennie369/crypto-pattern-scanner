/**
 * AddWidgetModal - Modal để thêm widget mới vào Vision Board
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import {
  X,
  Sparkles,
  Target,
  CheckSquare,
  BarChart3,
  Compass,
  Layers,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';

const WIDGET_OPTIONS = [
  {
    id: 'AFFIRMATION_CARD',
    title: 'Affirmation',
    description: 'Câu khẳng định tích cực hàng ngày',
    icon: Sparkles,
    color: COLORS.gold,
  },
  {
    id: 'GOAL_CARD',
    title: 'Goal Tracking',
    description: 'Theo dõi mục tiêu dài hạn',
    icon: Target,
    color: COLORS.success,
  },
  {
    id: 'ACTION_CHECKLIST',
    title: 'Action Checklist',
    description: 'Danh sách hành động hàng ngày',
    icon: CheckSquare,
    color: COLORS.purple,
  },
  {
    id: 'STATS_WIDGET',
    title: 'Stats Dashboard',
    description: 'Thống kê tiến độ tổng quan',
    icon: BarChart3,
    color: COLORS.info,
  },
];

const AddWidgetModal = ({ visible, onClose, onAdd }) => {
  const handleSelect = (widgetType) => {
    console.log('[AddWidgetModal] Selected:', widgetType);
    onAdd(widgetType);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={e => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Thêm Widget Mới</Text>
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && { opacity: 0.6 },
              ]}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={COLORS.textPrimary} />
            </Pressable>
          </View>

          {/* Widget Options */}
          <View style={styles.optionsContainer}>
            {WIDGET_OPTIONS.map((widget) => {
              const Icon = widget.icon;
              return (
                <Pressable
                  key={widget.id}
                  style={({ pressed }) => [
                    styles.optionItem,
                    pressed && { opacity: 0.7, backgroundColor: 'rgba(255, 255, 255, 0.15)' },
                  ]}
                  onPress={() => handleSelect(widget.id)}
                >
                  <View style={[styles.optionIcon, { backgroundColor: `${widget.color}20` }]}>
                    <Icon size={24} color={widget.color} />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>{widget.title}</Text>
                    <Text style={styles.optionDescription}>{widget.description}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Cancel Button */}
          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && { opacity: 0.7 },
            ]}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Hủy</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.bgMid || '#0A0B1E',
    borderRadius: 20,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gold,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  optionsContainer: {
    gap: SPACING.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.md,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  cancelButton: {
    marginTop: SPACING.xl,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
});

export default AddWidgetModal;
