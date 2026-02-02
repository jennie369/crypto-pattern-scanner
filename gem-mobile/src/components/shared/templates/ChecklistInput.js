/**
 * ChecklistInput.js
 * Simple checklist component with add/remove/toggle functionality
 *
 * Created: 2026-02-02
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Keyboard,
} from 'react-native';
import {
  Plus,
  X,
  Check,
  Circle,
  CheckCircle2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  COSMIC_COLORS,
  COSMIC_SPACING,
  COSMIC_RADIUS,
  COSMIC_TYPOGRAPHY,
} from '../../../theme/cosmicTokens';

/**
 * ChecklistInput Component
 * @param {Array} value - Array of { id, text, completed }
 * @param {function} onChange - Value change callback
 * @param {string} label - Field label
 * @param {string} placeholder - Placeholder for new item input
 * @param {number} maxItems - Maximum number of items
 * @param {number} minItems - Minimum number of items
 * @param {boolean} required - Is required
 * @param {boolean} disabled - Disable interaction
 * @param {string} error - Error message
 */
const ChecklistInput = ({
  value = [],
  onChange,
  label,
  placeholder = 'Thêm mục mới...',
  maxItems = 10,
  minItems = 0,
  required = false,
  disabled = false,
  error,
}) => {
  const [newItemText, setNewItemText] = useState('');
  const inputRef = useRef(null);

  // Generate unique ID
  const generateId = () => `checklist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add new item
  const handleAddItem = () => {
    if (!newItemText.trim() || disabled) return;
    if (maxItems && value.length >= maxItems) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newItem = {
      id: generateId(),
      text: newItemText.trim(),
      completed: false,
    };

    onChange?.([...value, newItem]);
    setNewItemText('');
    inputRef.current?.focus();
  };

  // Remove item
  const handleRemoveItem = (itemId) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onChange?.(value.filter((item) => item.id !== itemId));
  };

  // Toggle item completion
  const handleToggleItem = (itemId) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    onChange?.(
      value.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // Update item text
  const handleUpdateItemText = (itemId, newText) => {
    onChange?.(
      value.map((item) =>
        item.id === itemId ? { ...item, text: newText } : item
      )
    );
  };

  // Render checklist item
  const renderItem = (item, index) => {
    const isCompleted = item.completed;

    return (
      <Animated.View key={item.id} style={styles.itemContainer}>
        {/* Toggle Button */}
        <TouchableOpacity
          onPress={() => handleToggleItem(item.id)}
          disabled={disabled}
          style={styles.toggleButton}
          activeOpacity={0.7}
        >
          {isCompleted ? (
            <CheckCircle2 size={22} color={COSMIC_COLORS.functional.success} />
          ) : (
            <Circle size={22} color={COSMIC_COLORS.text.muted} />
          )}
        </TouchableOpacity>

        {/* Text Input */}
        <TextInput
          style={[
            styles.itemText,
            isCompleted && styles.itemTextCompleted,
            disabled && styles.itemTextDisabled,
          ]}
          value={item.text}
          onChangeText={(text) => handleUpdateItemText(item.id, text)}
          editable={!disabled}
          placeholder="Nhập nội dung..."
          placeholderTextColor={COSMIC_COLORS.text.hint}
          multiline
        />

        {/* Delete Button */}
        <TouchableOpacity
          onPress={() => handleRemoveItem(item.id)}
          disabled={disabled}
          style={styles.deleteButton}
          activeOpacity={0.7}
        >
          <X size={18} color={COSMIC_COLORS.text.muted} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const canAddMore = !maxItems || value.length < maxItems;

  return (
    <View style={styles.container}>
      {/* Label */}
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Items List */}
      <View style={styles.itemsList}>
        {value.map((item, index) => renderItem(item, index))}
      </View>

      {/* Add New Item */}
      {canAddMore && (
        <View style={styles.addItemContainer}>
          <TextInput
            ref={inputRef}
            style={styles.addInput}
            value={newItemText}
            onChangeText={setNewItemText}
            placeholder={placeholder}
            placeholderTextColor={COSMIC_COLORS.text.hint}
            editable={!disabled}
            returnKeyType="done"
            onSubmitEditing={handleAddItem}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={handleAddItem}
            disabled={disabled || !newItemText.trim()}
            style={[
              styles.addButton,
              (!newItemText.trim() || disabled) && styles.addButtonDisabled,
            ]}
            activeOpacity={0.7}
          >
            <Plus size={20} color={COSMIC_COLORS.text.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Counter */}
      <View style={styles.counterRow}>
        <Text style={styles.counterText}>
          {value.filter((i) => i.completed).length}/{value.length} hoàn thành
        </Text>
        {maxItems && (
          <Text style={styles.limitText}>
            {value.length}/{maxItems} mục
          </Text>
        )}
      </View>

      {/* Error */}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: COSMIC_SPACING.md,
  },
  label: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md, // Increased
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.medium,
    color: COSMIC_COLORS.text.secondary,
    marginBottom: COSMIC_SPACING.sm,
  },
  required: {
    color: COSMIC_COLORS.functional.error,
  },
  itemsList: {
    gap: COSMIC_SPACING.xs,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COSMIC_COLORS.glass.bgDark,
    borderRadius: COSMIC_RADIUS.md,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
    paddingHorizontal: COSMIC_SPACING.sm,
    paddingVertical: COSMIC_SPACING.sm,
    gap: COSMIC_SPACING.sm,
  },
  toggleButton: {
    paddingTop: 2,
  },
  itemText: {
    flex: 1,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    color: COSMIC_COLORS.text.primary,
    paddingVertical: 0,
    minHeight: 24,
  },
  itemTextCompleted: {
    textDecorationLine: 'line-through',
    color: COSMIC_COLORS.text.muted,
  },
  itemTextDisabled: {
    opacity: 0.5,
  },
  deleteButton: {
    padding: COSMIC_SPACING.xxs,
  },

  // Add Item
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.sm,
    marginTop: COSMIC_SPACING.sm,
  },
  addInput: {
    flex: 1,
    backgroundColor: COSMIC_COLORS.glass.bgLight,
    borderRadius: COSMIC_RADIUS.md,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
    paddingHorizontal: COSMIC_SPACING.md,
    paddingVertical: COSMIC_SPACING.sm,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    color: COSMIC_COLORS.text.primary,
    minHeight: 44,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: COSMIC_RADIUS.md,
    backgroundColor: COSMIC_COLORS.glow.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.4,
  },

  // Counter
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: COSMIC_SPACING.sm,
  },
  counterText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm, // Increased
    color: COSMIC_COLORS.text.muted,
  },
  limitText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm, // Increased
    color: COSMIC_COLORS.text.hint,
  },

  // Error
  error: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    color: COSMIC_COLORS.functional.error,
    marginTop: COSMIC_SPACING.xs,
  },
});

export default ChecklistInput;
