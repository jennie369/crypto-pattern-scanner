/**
 * GEM Scanner - Drawing Toolbar Component
 * Toolbar cho 6 công cụ vẽ trên chart
 * With color picker and drawing list
 */

import React, { memo, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import {
  Minus,
  TrendingUp,
  Square,
  GitBranch,
  ArrowUpCircle,
  ArrowDownCircle,
  Magnet,
  Trash2,
  X,
  Palette,
  List,
  Edit3,
  Check,
} from 'lucide-react-native';
import { COLORS, SPACING } from '../../utils/tokens';

// Drawing tool definitions
const DRAWING_TOOLS = [
  { id: 'horizontal_line', icon: Minus, label: 'Ngang', clicks: 1 },
  { id: 'trend_line', icon: TrendingUp, label: 'Xu hướng', clicks: 2 },
  { id: 'rectangle', icon: Square, label: 'Chữ nhật', clicks: 2 },
  { id: 'fibonacci_retracement', icon: GitBranch, label: 'Fib', clicks: 2 },
  { id: 'long_position', icon: ArrowUpCircle, label: 'Long', clicks: 1 },
  { id: 'short_position', icon: ArrowDownCircle, label: 'Short', clicks: 1 },
];

// Color palette for drawings
const DRAWING_COLORS = [
  { id: 'gold', color: '#FFBD59', name: 'Vàng' },
  { id: 'cyan', color: '#00F0FF', name: 'Cyan' },
  { id: 'green', color: '#22C55E', name: 'Xanh lá' },
  { id: 'red', color: '#EF4444', name: 'Đỏ' },
  { id: 'blue', color: '#3B82F6', name: 'Xanh dương' },
  { id: 'purple', color: '#A855F7', name: 'Tím' },
  { id: 'orange', color: '#F97316', name: 'Cam' },
  { id: 'white', color: '#FFFFFF', name: 'Trắng' },
];

// Line styles
const LINE_STYLES = [
  { id: 'solid', name: 'Nét liền', value: 0 },
  { id: 'dashed', name: 'Nét đứt', value: 1 },
  { id: 'dotted', name: 'Chấm', value: 2 },
];

const DrawingToolbar = ({
  visible = false,
  activeTool = null,
  magnetMode = true,
  onSelectTool,
  onToggleMagnet,
  onDeleteAll,
  onClose,
  pendingPoints = 0,
  // New props
  selectedColor = '#FFBD59',
  onColorChange,
  selectedLineStyle = 'solid',
  onLineStyleChange,
  drawings = [],
  onDeleteDrawing,
  onEditDrawing,
  onShowDrawingList,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Tool Buttons */}
      <View style={styles.toolsRow}>
        {DRAWING_TOOLS.map((tool) => {
          const IconComponent = tool.icon;
          const isActive = activeTool === tool.id;
          const isPending = isActive && pendingPoints > 0;

          // Special colors for long/short
          let iconColor = '#A0AEC0';
          if (isActive) {
            if (tool.id === 'long_position') iconColor = COLORS.success;
            else if (tool.id === 'short_position') iconColor = COLORS.error;
            else iconColor = COLORS.gold;
          }

          return (
            <TouchableOpacity
              key={tool.id}
              style={[
                styles.toolButton,
                isActive && styles.toolButtonActive,
                isPending && styles.toolButtonPending,
              ]}
              onPress={() => onSelectTool?.(tool.id)}
              activeOpacity={0.7}
            >
              <IconComponent size={18} color={iconColor} />
              <Text style={[styles.toolLabel, isActive && styles.toolLabelActive]}>
                {tool.label}
              </Text>
              {isPending && tool.clicks > 1 && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>{pendingPoints}/{tool.clicks}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Color & Style Row */}
      <View style={styles.colorStyleRow}>
        {/* Color Picker Toggle */}
        <TouchableOpacity
          style={[styles.colorButton, showColorPicker && styles.colorButtonActive]}
          onPress={() => {
            setShowColorPicker(!showColorPicker);
            setShowStylePicker(false);
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
          <Palette size={16} color={showColorPicker ? COLORS.gold : '#A0AEC0'} />
          <Text style={[styles.colorLabel, showColorPicker && styles.colorLabelActive]}>Màu</Text>
        </TouchableOpacity>

        {/* Line Style Toggle */}
        <TouchableOpacity
          style={[styles.styleButton, showStylePicker && styles.styleButtonActive]}
          onPress={() => {
            setShowStylePicker(!showStylePicker);
            setShowColorPicker(false);
          }}
          activeOpacity={0.7}
        >
          <Edit3 size={16} color={showStylePicker ? COLORS.gold : '#A0AEC0'} />
          <Text style={[styles.styleLabel, showStylePicker && styles.styleLabelActive]}>
            {LINE_STYLES.find(s => s.id === selectedLineStyle)?.name || 'Nét liền'}
          </Text>
        </TouchableOpacity>

        {/* Drawing List Button */}
        <TouchableOpacity
          style={styles.listButton}
          onPress={onShowDrawingList}
          activeOpacity={0.7}
        >
          <List size={16} color="#A0AEC0" />
          <Text style={styles.listLabel}>{drawings.length}</Text>
        </TouchableOpacity>
      </View>

      {/* Color Picker Panel */}
      {showColorPicker && (
        <View style={styles.pickerPanel}>
          <Text style={styles.pickerTitle}>Chọn màu:</Text>
          <View style={styles.colorGrid}>
            {DRAWING_COLORS.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.colorOption,
                  { backgroundColor: c.color },
                  selectedColor === c.color && styles.colorOptionSelected,
                ]}
                onPress={() => {
                  onColorChange?.(c.color);
                  setShowColorPicker(false);
                }}
              >
                {selectedColor === c.color && (
                  <Check size={16} color={c.id === 'white' ? '#000' : '#FFF'} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Line Style Picker Panel */}
      {showStylePicker && (
        <View style={styles.pickerPanel}>
          <Text style={styles.pickerTitle}>Kiểu đường:</Text>
          <View style={styles.styleGrid}>
            {LINE_STYLES.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.styleOption,
                  selectedLineStyle === s.id && styles.styleOptionSelected,
                ]}
                onPress={() => {
                  onLineStyleChange?.(s.id);
                  setShowStylePicker(false);
                }}
              >
                <View style={styles.stylePreviewContainer}>
                  <View style={[
                    styles.stylePreviewLine,
                    s.id === 'dashed' && styles.stylePreviewDashed,
                    s.id === 'dotted' && styles.stylePreviewDotted,
                  ]} />
                </View>
                <Text style={[
                  styles.styleOptionText,
                  selectedLineStyle === s.id && styles.styleOptionTextSelected,
                ]}>{s.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Controls Row */}
      <View style={styles.controlsRow}>
        {/* Magnet Mode Toggle */}
        <TouchableOpacity
          style={[styles.controlButton, magnetMode && styles.controlButtonActive]}
          onPress={onToggleMagnet}
          activeOpacity={0.7}
        >
          <Magnet size={16} color={magnetMode ? COLORS.cyan : '#A0AEC0'} />
          <Text style={[styles.controlLabel, magnetMode && styles.controlLabelActive]}>
            Nam châm
          </Text>
        </TouchableOpacity>

        {/* Delete All Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDeleteAll}
          activeOpacity={0.7}
        >
          <Trash2 size={16} color={COLORS.error} />
          <Text style={styles.deleteLabel}>Xóa tất cả</Text>
        </TouchableOpacity>

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <X size={18} color="#A0AEC0" />
        </TouchableOpacity>
      </View>

      {/* Helper Text */}
      {activeTool && (
        <View style={styles.helperRow}>
          <Text style={styles.helperText}>
            {getHelperText(activeTool, pendingPoints)}
          </Text>
        </View>
      )}
    </View>
  );
};

// Helper text based on tool and state
const getHelperText = (tool, pendingPoints) => {
  const toolConfig = DRAWING_TOOLS.find(t => t.id === tool);
  if (!toolConfig) return '';

  if (toolConfig.clicks === 1) {
    return 'Chạm vào chart để vẽ';
  }

  if (pendingPoints === 0) {
    return 'Chạm điểm đầu tiên';
  } else if (pendingPoints === 1) {
    return 'Chạm điểm thứ hai để hoàn thành';
  }

  return '';
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 16, 48, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.2)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  // Tools row
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  toolButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    minHeight: 56,
  },
  toolButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.4)',
  },
  toolButtonPending: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderColor: 'rgba(0, 240, 255, 0.4)',
  },
  toolLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A0AEC0',
    marginTop: 4,
  },
  toolLabelActive: {
    color: COLORS.gold,
  },
  pendingBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.cyan,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  pendingText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#000',
  },
  // Divider
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: SPACING.sm,
  },
  // Controls row
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 6,
  },
  controlButtonActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A0AEC0',
  },
  controlLabelActive: {
    color: COLORS.cyan,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    gap: 6,
  },
  deleteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.error,
  },
  closeButton: {
    marginLeft: 'auto',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Helper row
  helperRow: {
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  helperText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  // Color & Style Row
  colorStyleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  colorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 6,
  },
  colorButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.4)',
  },
  colorPreview: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  colorLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A0AEC0',
  },
  colorLabelActive: {
    color: COLORS.gold,
  },
  styleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 6,
  },
  styleButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.4)',
  },
  styleLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A0AEC0',
  },
  styleLabelActive: {
    color: COLORS.gold,
  },
  listButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 4,
    marginLeft: 'auto',
  },
  listLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gold,
    minWidth: 16,
    textAlign: 'center',
  },
  // Picker Panel
  pickerPanel: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  pickerTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  // Color Grid
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#FFFFFF',
  },
  // Style Grid
  styleGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  styleOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  styleOptionSelected: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.5)',
  },
  stylePreviewContainer: {
    width: '100%',
    height: 8,
    justifyContent: 'center',
    marginBottom: 4,
  },
  stylePreviewLine: {
    height: 2,
    backgroundColor: '#FFFFFF',
  },
  stylePreviewDashed: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  stylePreviewDotted: {
    borderStyle: 'dotted',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  styleOptionText: {
    fontSize: 10,
    color: '#A0AEC0',
  },
  styleOptionTextSelected: {
    color: COLORS.gold,
    fontWeight: '600',
  },
});

export { DRAWING_TOOLS, DRAWING_COLORS, LINE_STYLES };
export default memo(DrawingToolbar);
