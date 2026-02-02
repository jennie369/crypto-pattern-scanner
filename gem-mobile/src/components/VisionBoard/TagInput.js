/**
 * TagInput.js
 * Tag input component with autocomplete suggestions for Calendar Smart Journal
 *
 * Created: January 28, 2026
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Keyboard,
} from 'react-native';
import { X, Plus, Hash } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../theme';
import { getSuggestedTags } from '../../services/calendarJournalService';

const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;

/**
 * TagInput Component
 */
const TagInput = ({
  tags = [],
  onTagsChange,
  disabled = false,
  userId,
  placeholder = 'Thêm tag...',
  maxTags = MAX_TAGS,
  suggestions: externalSuggestions,
  showIcon = true,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const inputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Load suggestions on mount and when input changes
  useEffect(() => {
    if (externalSuggestions) {
      setSuggestions(externalSuggestions);
      return;
    }

    loadSuggestions();
  }, [userId, externalSuggestions]);

  // Load suggestions from service
  const loadSuggestions = async () => {
    if (!userId || externalSuggestions) return;

    setLoadingSuggestions(true);
    try {
      const result = await getSuggestedTags(userId);
      if (result.success) {
        setSuggestions(result.data || []);
      }
    } catch (error) {
      console.error('[TagInput] loadSuggestions error:', error);
    }
    setLoadingSuggestions(false);
  };

  // Filter suggestions based on input
  const filteredSuggestions = suggestions
    .filter(
      (tag) =>
        tag.toLowerCase().includes(inputValue.toLowerCase()) &&
        !tags.includes(tag) &&
        tag !== inputValue
    )
    .slice(0, 5);

  // Handle suggestion panel visibility
  useEffect(() => {
    if (isFocused && (inputValue.length > 0 || filteredSuggestions.length > 0)) {
      setShowSuggestions(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start(() => setShowSuggestions(false));
    }
  }, [isFocused, inputValue, filteredSuggestions.length]);

  // Add tag
  const addTag = useCallback(
    (tag) => {
      const normalizedTag = tag.trim().toLowerCase().slice(0, MAX_TAG_LENGTH);

      if (!normalizedTag) return;
      if (tags.includes(normalizedTag)) return;
      if (tags.length >= maxTags) return;

      const newTags = [...tags, normalizedTag];
      onTagsChange?.(newTags);
      setInputValue('');
    },
    [tags, maxTags, onTagsChange]
  );

  // Remove tag
  const removeTag = useCallback(
    (tagToRemove) => {
      const newTags = tags.filter((tag) => tag !== tagToRemove);
      onTagsChange?.(newTags);
    },
    [tags, onTagsChange]
  );

  // Handle input submit
  const handleSubmit = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  // Handle key press (for comma/space as delimiters)
  const handleChangeText = (text) => {
    // Check for delimiters
    if (text.endsWith(',') || text.endsWith(' ')) {
      const tagText = text.slice(0, -1);
      if (tagText.trim()) {
        addTag(tagText);
        return;
      }
    }

    // Limit input length
    if (text.length <= MAX_TAG_LENGTH) {
      setInputValue(text);
    }
  };

  // Handle suggestion tap
  const handleSuggestionTap = (suggestion) => {
    addTag(suggestion);
    Keyboard.dismiss();
  };

  // Render tag chip
  const renderTag = (tag, index) => (
    <View key={`${tag}-${index}`} style={styles.tag}>
      <Text style={styles.tagText}>{tag}</Text>
      {!disabled && (
        <TouchableOpacity
          onPress={() => removeTag(tag)}
          style={styles.tagRemove}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <X size={12} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tags display */}
      <View style={styles.tagsContainer}>
        {tags.map((tag, index) => renderTag(tag, index))}

        {/* Input */}
        {!disabled && tags.length < maxTags && (
          <View style={styles.inputWrapper}>
            {showIcon && tags.length === 0 && inputValue.length === 0 && (
              <Hash size={14} color={COLORS.textMuted} style={styles.inputIcon} />
            )}
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={inputValue}
              onChangeText={handleChangeText}
              onSubmitEditing={handleSubmit}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setTimeout(() => setIsFocused(false), 150);
              }}
              placeholder={tags.length === 0 ? placeholder : ''}
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              blurOnSubmit={false}
            />
          </View>
        )}
      </View>

      {/* Tag count */}
      {tags.length > 0 && (
        <Text style={styles.tagCount}>
          {tags.length}/{maxTags} tags
        </Text>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <Animated.View style={[styles.suggestionsContainer, { opacity: fadeAnim }]}>
          <Text style={styles.suggestionsTitle}>Goi y</Text>
        )}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={`suggestion-${suggestion}-${index}`}
                style={styles.suggestionChip}
                onPress={() => handleSuggestionTap(suggestion)}
              >
                <Plus size={12} color={COLORS.gold} />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
};

/**
 * TagDisplay Component - Read-only tag display
 */
export const TagDisplay = ({ tags = [], compact = false }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <View style={[styles.tagDisplayContainer, compact && styles.tagDisplayCompact]}>
      {tags.slice(0, compact ? 3 : tags.length).map((tag, index) => (
        <View
          key={`${tag}-${index}`}
          style={[styles.tagDisplay, compact && styles.tagDisplaySmall]}
        >
          <Text style={[styles.tagDisplayText, compact && styles.tagDisplayTextSmall]}>
            #{tag}
          </Text>
        </View>
      ))}
      {compact && tags.length > 3 && (
        <Text style={styles.tagMore}>+{tags.length - 3}</Text>
      )}
    </View>
  );
};

/**
 * PopularTags Component - Show popular tags for selection
 */
export const PopularTags = ({ tags = [], selectedTags = [], onTagSelect, title = 'Tags pho bien' }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <View style={styles.popularContainer}>
      {title && <Text style={styles.popularTitle}>{title}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {tags.map((tag, index) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <TouchableOpacity
              key={`popular-${tag}-${index}`}
              style={[
                styles.popularChip,
                isSelected && styles.popularChipSelected,
              ]}
              onPress={() => onTagSelect?.(tag)}
            >
              <Text
                style={[
                  styles.popularChipText,
                  isSelected && styles.popularChipTextSelected,
                ]}
              >
                #{tag}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    padding: SPACING.sm,
    minHeight: 44,
    gap: SPACING.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.purple + '30',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  tagText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.purple,
  },
  tagRemove: {
    padding: 2,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
  },
  inputIcon: {
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    padding: 0,
    minHeight: 28,
  },
  tagCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  suggestionsContainer: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
  },
  suggestionsTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.xs,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },
  suggestionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
  },

  // TagDisplay styles
  tagDisplayContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  tagDisplayCompact: {
    flexWrap: 'nowrap',
  },
  tagDisplay: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
  },
  tagDisplaySmall: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  tagDisplayText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.purple,
  },
  tagDisplayTextSmall: {
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  tagMore: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    alignSelf: 'center',
    marginLeft: SPACING.xs,
  },

  // PopularTags styles
  popularContainer: {
    marginTop: SPACING.sm,
  },
  popularTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  popularChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  popularChipSelected: {
    backgroundColor: COLORS.purple + '20',
    borderColor: COLORS.purple,
  },
  popularChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  popularChipTextSelected: {
    color: COLORS.purple,
  },
});

export default TagInput;
