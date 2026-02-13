/**
 * ActionListInput.js
 * Actions list with checkbox for goal creation + life area selector
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
} from 'react-native';
import {
  Plus,
  X,
  Square,
  CheckSquare,
  Target,
  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  COSMIC_COLORS,
  COSMIC_SPACING,
  COSMIC_RADIUS,
  COSMIC_TYPOGRAPHY,
} from '../../../theme/cosmicTokens';
import { LIFE_AREAS } from '../../../services/templates/journalTemplates';
import LifeAreaSelector from './LifeAreaSelector';

/**
 * ActionListInput Component
 * @param {Array} value - Array of { id, text, checked, lifeArea }
 * @param {function} onChange - Value change callback
 * @param {string} label - Field label
 * @param {string} placeholder - Placeholder for new item input
 * @param {number} maxItems - Maximum number of items
 * @param {number} minItems - Minimum number of items
 * @param {boolean} required - Is required
 * @param {boolean} requireLifeArea - Require life area for checked items
 * @param {boolean} disabled - Disable interaction
 * @param {string} error - Error message
 * @param {string} checkboxLabel - Label for the checkbox (e.g., "Tạo Goal")
 * @param {Array} suggestions - Suggested actions [{ text, lifeArea }]
 */
const ActionListInput = ({
  value = [],
  onChange,
  label,
  placeholder = 'Thêm hành động mới...',
  maxItems = 20,
  minItems = 0,
  required = false,
  requireLifeArea = true,
  disabled = false,
  error,
  checkboxLabel = 'Tạo Goal',
  suggestions = [],
}) => {
  const [newItemText, setNewItemText] = useState('');
  const [expandedItemId, setExpandedItemId] = useState(null);
  const inputRef = useRef(null);

  // Generate unique ID
  const generateId = () => `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add new item
  const handleAddItem = () => {
    if (!newItemText.trim() || disabled) return;
    if (maxItems && value.length >= maxItems) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newItem = {
      id: generateId(),
      text: newItemText.trim(),
      checked: false,
      lifeArea: null,
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

    if (expandedItemId === itemId) {
      setExpandedItemId(null);
    }
  };

  // Toggle item checked
  const handleToggleItem = (itemId) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const item = value.find((i) => i.id === itemId);
    const newChecked = !item?.checked;

    onChange?.(
      value.map((item) =>
        item.id === itemId ? { ...item, checked: newChecked } : item
      )
    );

    // Auto expand if checked and no life area
    if (newChecked && requireLifeArea && !item?.lifeArea) {
      setExpandedItemId(itemId);
    }
  };

  // Update item text
  const handleUpdateItemText = (itemId, newText) => {
    onChange?.(
      value.map((item) =>
        item.id === itemId ? { ...item, text: newText } : item
      )
    );
  };

  // Update item life area
  const handleUpdateLifeArea = (itemId, lifeArea) => {
    onChange?.(
      value.map((item) =>
        item.id === itemId ? { ...item, lifeArea } : item
      )
    );
    setExpandedItemId(null);
  };

  // Toggle expand
  const toggleExpand = (itemId) => {
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
  };

  // Get life area display
  const getLifeAreaDisplay = (lifeAreaId) => {
    const area = LIFE_AREAS[lifeAreaId];
    return area ? area.name : null;
  };

  // Render action item
  const renderItem = (item, index) => {
    const isChecked = item.checked;
    const isExpanded = expandedItemId === item.id;
    const lifeAreaName = getLifeAreaDisplay(item.lifeArea);
    const needsLifeArea = isChecked && requireLifeArea && !item.lifeArea;

    return (
      <View key={item.id} style={styles.itemWrapper}>
        <Animated.View
          style={[
            styles.itemContainer,
            isChecked && styles.itemContainerChecked,
            needsLifeArea && styles.itemContainerWarning,
          ]}
        >
          {/* Checkbox */}
          <TouchableOpacity
            onPress={() => handleToggleItem(item.id)}
            disabled={disabled}
            style={styles.checkbox}
            activeOpacity={0.7}
          >
            {isChecked ? (
              <CheckSquare size={18} color={COSMIC_COLORS.glow.gold} />
            ) : (
              <Square size={18} color={COSMIC_COLORS.text.muted} />
            )}
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.itemContent}>
            {/* Text Input */}
            <TextInput
              style={[
                styles.itemText,
                disabled && styles.itemTextDisabled,
              ]}
              value={item.text}
              onChangeText={(text) => handleUpdateItemText(item.id, text)}
              editable={!disabled}
              placeholder="Nhập hành động..."
              placeholderTextColor={COSMIC_COLORS.text.hint}
              multiline
            />

            {/* Life Area Tag (if checked) */}
            {isChecked && (
              <TouchableOpacity
                onPress={() => toggleExpand(item.id)}
                style={[
                  styles.lifeAreaTag,
                  needsLifeArea && styles.lifeAreaTagWarning,
                ]}
                activeOpacity={0.7}
              >
                <Target size={10} color={needsLifeArea ? COSMIC_COLORS.functional.warning : COSMIC_COLORS.glow.gold} />
                <Text
                  style={[
                    styles.lifeAreaTagText,
                    needsLifeArea && styles.lifeAreaTagTextWarning,
                  ]}
                >
                  {lifeAreaName || 'Chọn lĩnh vực'}
                </Text>
                <ChevronRight
                  size={10}
                  color={needsLifeArea ? COSMIC_COLORS.functional.warning : COSMIC_COLORS.text.muted}
                  style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            onPress={() => handleRemoveItem(item.id)}
            disabled={disabled}
            style={styles.deleteButton}
            activeOpacity={0.7}
          >
            <X size={16} color={COSMIC_COLORS.text.muted} />
          </TouchableOpacity>
        </Animated.View>

        {/* Expanded Life Area Selector */}
        {isExpanded && isChecked && (
          <View style={styles.lifeAreaExpanded}>
            <LifeAreaSelector
              value={item.lifeArea}
              onChange={(lifeArea) => handleUpdateLifeArea(item.id, lifeArea)}
              mode="grid"
              disabled={disabled}
            />
          </View>
        )}
      </View>
    );
  };

  const canAddMore = !maxItems || value.length < maxItems;
  const checkedCount = value.filter((i) => i.checked).length;

  return (
    <View style={styles.container}>
      {/* Label */}
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
          <Text style={styles.helpText}>
            Tick vào hành động để tạo Goal
          </Text>
        </View>
      )}

      {/* Suggested Actions - Always show, filter out already added */}
      {suggestions.length > 0 && (() => {
        const remainingSuggestions = suggestions.filter(
          suggestion => !value.some(v => v.text === suggestion.text)
        );
        if (remainingSuggestions.length === 0) return null;
        return (
          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionsLabel}>Gợi ý hành động:</Text>
            <View style={styles.suggestionsGrid}>
              {remainingSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => {
                    if (disabled || (maxItems && value.length >= maxItems)) return;
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const newItem = {
                      id: generateId(),
                      text: suggestion.text,
                      checked: false,
                      lifeArea: suggestion.lifeArea || null,
                    };
                    onChange?.([...value, newItem]);
                  }}
                  activeOpacity={0.7}
                  disabled={disabled}
                >
                  <Plus size={12} color={COSMIC_COLORS.glow.gold} />
                  <Text style={styles.suggestionText} numberOfLines={2}>
                    {suggestion.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      })()}

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
            <Plus size={16} color={COSMIC_COLORS.text.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Counter */}
      <View style={styles.counterRow}>
        {checkedCount > 0 && (
          <View style={styles.goalBadge}>
            <Target size={10} color={COSMIC_COLORS.glow.gold} />
            <Text style={styles.goalBadgeText}>
              {checkedCount} Goal sẽ được tạo
            </Text>
          </View>
        )}
        {maxItems && (
          <Text style={styles.limitText}>
            {value.length}/{maxItems} hành động
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: COSMIC_SPACING.sm,
  },
  label: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md, // Increased
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.medium,
    color: COSMIC_COLORS.text.secondary,
  },
  helpText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    color: COSMIC_COLORS.text.hint,
    fontStyle: 'italic',
  },
  required: {
    color: COSMIC_COLORS.functional.error,
  },
  itemsList: {
    gap: COSMIC_SPACING.sm,
  },
  itemWrapper: {
    gap: COSMIC_SPACING.xs,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COSMIC_COLORS.glass.bgDark,
    borderRadius: COSMIC_RADIUS.sm,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
    paddingHorizontal: COSMIC_SPACING.xs,
    paddingVertical: COSMIC_SPACING.xs,
    gap: COSMIC_SPACING.xs,
  },
  itemContainerChecked: {
    backgroundColor: COSMIC_COLORS.glow.gold + '10',
    borderColor: COSMIC_COLORS.glow.gold + '40',
  },
  itemContainerWarning: {
    borderColor: COSMIC_COLORS.functional.warning,
  },
  checkbox: {
    paddingTop: 2,
  },
  itemContent: {
    flex: 1,
    gap: COSMIC_SPACING.xs,
  },
  itemText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md, // Increased
    color: COSMIC_COLORS.text.primary,
    paddingVertical: 0,
    minHeight: 24,
  },
  itemTextDisabled: {
    opacity: 0.5,
  },
  lifeAreaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COSMIC_COLORS.glow.gold + '15',
    paddingHorizontal: COSMIC_SPACING.xs,
    paddingVertical: 2,
    borderRadius: COSMIC_RADIUS.xs,
    gap: 2,
  },
  lifeAreaTagWarning: {
    backgroundColor: COSMIC_COLORS.functional.warning + '15',
  },
  lifeAreaTagText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    color: COSMIC_COLORS.glow.gold,
  },
  lifeAreaTagTextWarning: {
    color: COSMIC_COLORS.functional.warning,
  },
  deleteButton: {
    padding: COSMIC_SPACING.xxs,
  },
  lifeAreaExpanded: {
    backgroundColor: COSMIC_COLORS.glass.bgLight,
    borderRadius: COSMIC_RADIUS.md,
    padding: COSMIC_SPACING.md,
    marginLeft: COSMIC_SPACING.xxl,
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
    borderRadius: COSMIC_RADIUS.sm,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
    paddingHorizontal: COSMIC_SPACING.sm,
    paddingVertical: COSMIC_SPACING.xs,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md, // Increased
    color: COSMIC_COLORS.text.primary,
    minHeight: 40, // Increased
  },
  addButton: {
    width: 40, // Increased
    height: 40,
    borderRadius: COSMIC_RADIUS.sm,
    backgroundColor: COSMIC_COLORS.glow.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.4,
  },

  // Counter - Compact version
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: COSMIC_SPACING.xs,
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COSMIC_COLORS.glow.gold + '20',
    paddingHorizontal: COSMIC_SPACING.xs,
    paddingVertical: 2,
    borderRadius: COSMIC_RADIUS.xs,
  },
  goalBadgeText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xs, // Increased
    color: COSMIC_COLORS.glow.gold,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.medium,
  },
  limitText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xs, // Increased
    color: COSMIC_COLORS.text.hint,
  },

  // Error
  error: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm, // Increased
    color: COSMIC_COLORS.functional.error,
    marginTop: COSMIC_SPACING.xxs,
  },

  // Suggestions
  suggestionsSection: {
    marginBottom: COSMIC_SPACING.sm,
  },
  suggestionsLabel: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.base,
    color: COSMIC_COLORS.text.hint,
    marginBottom: COSMIC_SPACING.xs,
  },
  suggestionsGrid: {
    flexDirection: 'column',
    gap: COSMIC_SPACING.xs,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COSMIC_COLORS.glass.bgDark,
    paddingHorizontal: COSMIC_SPACING.sm,
    paddingVertical: COSMIC_SPACING.sm,
    borderRadius: COSMIC_RADIUS.sm,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glow.gold + '30',
    borderStyle: 'dashed',
  },
  suggestionText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.base,
    color: COSMIC_COLORS.text.secondary,
    flex: 1,
  },
});

export default ActionListInput;
