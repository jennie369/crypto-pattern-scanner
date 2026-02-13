/**
 * GEM Scanner - Drawing List Modal
 * Modal for viewing, editing, and deleting individual drawings
 */

import React, { memo, useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import {
  X,
  Minus,
  TrendingUp,
  Square,
  GitBranch,
  ArrowUpCircle,
  ArrowDownCircle,
  Trash2,
  Palette,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

// Drawing type icons
const DRAWING_ICONS = {
  horizontal_line: Minus,
  trend_line: TrendingUp,
  rectangle: Square,
  fibonacci_retracement: GitBranch,
  long_position: ArrowUpCircle,
  short_position: ArrowDownCircle,
};

// Drawing type labels
const DRAWING_LABELS = {
  horizontal_line: 'Đường ngang',
  trend_line: 'Xu hướng',
  rectangle: 'Chữ nhật',
  fibonacci_retracement: 'Fibonacci',
  long_position: 'Vị thế Long',
  short_position: 'Vị thế Short',
};

// Color palette
const COLOR_OPTIONS = [
  '#FFBD59', '#00F0FF', '#22C55E', '#EF4444',
  '#3B82F6', '#A855F7', '#F97316', '#FFFFFF',
];

const DrawingListModal = ({
  visible = false,
  onClose,
  drawings = [],
  onDeleteDrawing,
  onUpdateDrawing,
  onToggleVisibility,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const handleDelete = (drawing) => {
    const label = DRAWING_LABELS[drawing.tool_type] || 'đường vẽ';
    Alert.alert(
      'Xóa đường vẽ',
      `Bạn có chắc muốn xóa ${label} này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => onDeleteDrawing?.(drawing.id),
        },
      ]
    );
  };

  const handleColorChange = (drawingId, newColor) => {
    const drawing = drawings.find(d => d.id === drawingId);
    onUpdateDrawing?.(drawingId, {
      drawing_data: {
        ...drawing?.drawing_data,
        color: newColor
      }
    });
    setEditingId(null);
    setSelectedColor(null);
  };

  const formatPrice = (price) => {
    if (!price) return '-';
    if (price >= 1000) return price.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(4).replace('.', ',');
    return price.toFixed(8).replace('.', ',');
  };

  const renderDrawingItem = ({ item }) => {
    const IconComponent = DRAWING_ICONS[item.tool_type] || Minus;
    const label = DRAWING_LABELS[item.tool_type] || 'Đường vẽ';
    const color = item.drawing_data?.color || '#FFBD59';
    const isEditing = editingId === item.id;

    // Get price info
    let priceInfo = '';
    if (item.tool_type === 'horizontal_line') {
      priceInfo = '$' + formatPrice(item.drawing_data?.price);
    } else if (item.tool_type === 'fibonacci_retracement') {
      priceInfo = '$' + formatPrice(item.drawing_data?.startPrice) + ' → $' + formatPrice(item.drawing_data?.endPrice);
    } else if (item.tool_type === 'long_position' || item.tool_type === 'short_position') {
      priceInfo = 'Entry: $' + formatPrice(item.drawing_data?.entryPrice);
    } else if (item.drawing_data?.startPrice && item.drawing_data?.endPrice) {
      priceInfo = '$' + formatPrice(item.drawing_data?.startPrice) + ' → $' + formatPrice(item.drawing_data?.endPrice);
    }

    return (
      <View style={styles.drawingItem}>
        <View style={styles.drawingHeader}>
          {/* Icon & Label */}
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <IconComponent size={18} color={color} />
          </View>
          <View style={styles.drawingInfo}>
            <Text style={styles.drawingLabel}>{label}</Text>
            {priceInfo ? <Text style={styles.drawingPrice}>{priceInfo}</Text> : null}
          </View>

          {/* Actions */}
          <View style={styles.drawingActions}>
            {/* Color Edit Button */}
            <TouchableOpacity
              style={[styles.actionButton, isEditing && styles.actionButtonActive]}
              onPress={() => {
                setEditingId(isEditing ? null : item.id);
                setSelectedColor(color);
              }}
            >
              <Palette size={16} color={isEditing ? COLORS.gold : '#A0AEC0'} />
            </TouchableOpacity>

            {/* Toggle Visibility */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onToggleVisibility?.(item.id)}
            >
              {item.visible !== false ? (
                <Eye size={16} color="#A0AEC0" />
              ) : (
                <EyeOff size={16} color={COLORS.textMuted} />
              )}
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteActionButton]}
              onPress={() => handleDelete(item)}
            >
              <Trash2 size={16} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Color Picker (when editing) */}
        {isEditing && (
          <View style={styles.colorPickerRow}>
            {COLOR_OPTIONS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorOption,
                  { backgroundColor: c },
                  selectedColor === c && styles.colorOptionSelected,
                ]}
                onPress={() => handleColorChange(item.id, c)}
              >
                {selectedColor === c && (
                  <Check size={14} color={c === '#FFFFFF' ? '#000' : '#FFF'} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Xóa tất cả',
      'Bạn có chắc muốn xóa tất cả đường vẽ?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tất cả',
          style: 'destructive',
          onPress: () => {
            drawings.forEach(d => onDeleteDrawing?.(d.id));
            onClose?.();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Danh sách đường vẽ</Text>
            <Text style={styles.subtitle}>{drawings.length} đường</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={20} color="#A0AEC0" />
            </TouchableOpacity>
          </View>

          {/* List */}
          {drawings.length > 0 ? (
            <FlatList
              data={drawings}
              keyExtractor={(item) => item.id}
              renderItem={renderDrawingItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Minus size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Chưa có đường vẽ nào</Text>
              <Text style={styles.emptySubtext}>Chạm vào chart để bắt đầu vẽ</Text>
            </View>
          )}

          {/* Delete All Button */}
          {drawings.length > 0 && (
            <TouchableOpacity
              style={styles.deleteAllButton}
              onPress={handleDeleteAll}
            >
              <Trash2 size={18} color={COLORS.error} />
              <Text style={styles.deleteAllText}>Xóa tất cả đường vẽ</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

// DARK BLUE GLASS THEME - matching OrderLinesSettings
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0F1030', // Dark blue from theme
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 34,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)', // Purple border
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)', // Purple border
    backgroundColor: 'rgba(106, 91, 255, 0.08)', // Subtle purple header
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold, // Gold accent
    marginLeft: SPACING.sm,
  },
  closeButton: {
    marginLeft: 'auto',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(106, 91, 255, 0.2)', // Purple bg
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  drawingItem: {
    backgroundColor: 'rgba(15, 16, 48, 0.6)', // glassBg
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.25)', // Purple border
    marginBottom: SPACING.sm,
  },
  drawingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawingInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  drawingLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  drawingPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  drawingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(106, 91, 255, 0.15)', // Purple bg
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderColor: 'rgba(255, 189, 89, 0.4)',
  },
  deleteActionButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  colorPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.15)', // Purple border
  },
  colorOption: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  deleteAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: 8,
  },
  deleteAllText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.error,
  },
});

export default memo(DrawingListModal);
