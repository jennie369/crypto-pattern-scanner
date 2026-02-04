/**
 * FormFieldRenderer.js
 * Universal renderer that maps field types to components
 *
 * Created: 2026-02-02
 * Updated: 2026-02-03 - Added action suggestions, multi-select affirmations/rituals
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Plus,
  Check,
  Sparkles,
  Calendar,
  Heart,
  Gift,
  Wind,
  Droplet,
  Mail,
  Flame,
  Star as StarIcon,
  Gem,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  COSMIC_COLORS,
  COSMIC_SPACING,
  COSMIC_RADIUS,
  COSMIC_TYPOGRAPHY,
} from '../../../theme/cosmicTokens';
import { FIELD_TYPES } from '../../../services/templates/journalTemplates';

// ========== FIELD SUGGESTIONS ==========
const FIELD_SUGGESTIONS = {
  worst_case: [
    'Mất hết số tiền đầu tư',
    'Phải quay lại làm công việc cũ',
    'Mất khoảng 1 năm để tích lũy lại',
    'Ảnh hưởng đến tài chính gia đình',
  ],
  mitigation: [
    'Duy trì quỹ khẩn cấp 6 tháng',
    'Bắt đầu nhỏ, scale up dần',
    'Học thêm kỹ năng backup',
    'Nói chuyện với gia đình',
  ],
  recovery: [
    'Quay lại làm việc toàn thời gian',
    'Tận dụng mạng lưới quan hệ',
    'Rút kinh nghiệm và thử lại',
    'Chuyển hướng sang lĩnh vực khác',
  ],
};

// ========== AFFIRMATION SUGGESTIONS ==========
const AFFIRMATION_SUGGESTIONS = [
  'Tôi có khả năng phục hồi dù điều gì xảy ra',
  'Tôi đủ mạnh mẽ để đối mặt mọi thử thách',
  'Mỗi thất bại là bài học quý giá',
  'Tôi tin tưởng vào khả năng của bản thân',
  'Tôi xứng đáng với mọi điều tốt đẹp',
  'Tôi sống trọn vẹn và ý nghĩa',
  'Tôi thu hút sự thịnh vượng mỗi ngày',
];

// ========== RITUAL SUGGESTIONS ==========
// Custom rituals (text only)
const RITUAL_SUGGESTIONS = [
  'Review tiến độ mỗi sáng Chủ nhật',
  'Thiền định 10 phút mỗi sáng',
  'Viết 3 điều biết ơn trước khi ngủ',
  'Đọc lại mục tiêu mỗi sáng',
  'Tập thể dục 30 phút mỗi ngày',
  'Think Day mỗi tháng một lần',
];

// App's 8 rituals with metadata (for quick select)
const APP_RITUALS = [
  {
    id: 'heart-expansion',
    name: 'Mở Rộng Trái Tim',
    description: 'Gửi tình yêu đến bản thân',
    icon: Heart,
    color: '#E91E63',
  },
  {
    id: 'gratitude-flow',
    name: 'Dòng Chảy Biết Ơn',
    description: 'Gửi lòng biết ơn',
    icon: Gift,
    color: '#FF9800',
  },
  {
    id: 'cleansing-breath',
    name: 'Hơi Thở Thanh Lọc',
    description: 'Box breathing',
    icon: Wind,
    color: '#00BCD4',
  },
  {
    id: 'water-manifest',
    name: 'Hiện Thực Hóa',
    description: 'Nạp ý định vào nước',
    icon: Droplet,
    color: '#2196F3',
  },
  {
    id: 'letter-to-universe',
    name: 'Thư Gửi Vũ Trụ',
    description: 'Viết điều ước',
    icon: Mail,
    color: '#9C27B0',
  },
  {
    id: 'burn-release',
    name: 'Đốt & Buông Bỏ',
    description: 'Giải phóng gánh nặng',
    icon: Flame,
    color: '#FF5722',
  },
  {
    id: 'star-wish',
    name: 'Ước Nguyện Sao Băng',
    description: 'Chọn sao gửi điều ước',
    icon: StarIcon,
    color: '#FFD700',
  },
  {
    id: 'crystal-healing',
    name: 'Chữa Lành Pha Lê',
    description: 'Kết nối năng lượng',
    icon: Gem,
    color: '#00F0FF',
  },
];

// ========== ACTION SUGGESTIONS BY TEMPLATE ==========
const ACTION_SUGGESTIONS = {
  mitigation: [
    { text: 'Duy trì quỹ khẩn cấp 6 tháng chi tiêu', lifeArea: 'finance' },
    { text: 'Bắt đầu nhỏ, scale up dần khi có kết quả', lifeArea: 'career' },
    { text: 'Học thêm kỹ năng để có backup plan', lifeArea: 'personal_growth' },
    { text: 'Nói chuyện với gia đình về kế hoạch', lifeArea: 'love' },
  ],
  actions: [
    { text: 'Lập kế hoạch hành động chi tiết', lifeArea: 'personal_growth' },
    { text: 'Đặt deadline cho từng bước', lifeArea: 'career' },
    { text: 'Tìm mentor hoặc người hướng dẫn', lifeArea: 'personal_growth' },
    { text: 'Review tiến độ mỗi tuần', lifeArea: 'personal_growth' },
  ],
  weekly_goals: [
    { text: 'Hoàn thành dự án quan trọng', lifeArea: 'career' },
    { text: 'Tập thể dục ít nhất 3 buổi', lifeArea: 'health' },
    { text: 'Dành thời gian chất lượng với gia đình', lifeArea: 'love' },
    { text: 'Đọc sách 30 phút mỗi ngày', lifeArea: 'personal_growth' },
  ],
  first_steps: [
    { text: 'Viết ra kế hoạch chi tiết', lifeArea: 'personal_growth' },
    { text: 'Tìm hiểu thêm về lĩnh vực mục tiêu', lifeArea: 'career' },
    { text: 'Tiết kiệm quỹ khởi động', lifeArea: 'finance' },
    { text: 'Xây dựng thói quen tốt', lifeArea: 'health' },
  ],
  tomorrow_focus: [
    { text: 'Hoàn thành việc quan trọng nhất', lifeArea: 'career' },
    { text: 'Tập thể dục buổi sáng', lifeArea: 'health' },
    { text: 'Học điều mới', lifeArea: 'personal_growth' },
  ],
};

// Import field components
import SliderInput from './SliderInput';
import SelectInput from './SelectInput';
import LifeAreaSelector from './LifeAreaSelector';
import ChecklistInput from './ChecklistInput';
import ActionListInput from './ActionListInput';
import TemplateTooltip, { LabelWithTooltip } from './TemplateTooltip';

/**
 * FormFieldRenderer Component
 */
const FormFieldRenderer = ({
  field,
  value,
  onChange,
  error,
  disabled = false,
  tooltips = {},
}) => {
  if (!field) return null;

  const tooltip = tooltips[field.id];

  // Get suggestions for field
  const textSuggestions = FIELD_SUGGESTIONS[field.id] || [];
  const hasSuggestions = textSuggestions.length > 0;

  // Render based on field type
  switch (field.type) {
    case FIELD_TYPES.TEXT:
      // Check if this is an affirmation or ritual field - use multi-select
      if (field.id === 'affirmation' || field.id === 'weekly_affirmation') {
        return (
          <MultiSelectField
            field={field}
            value={value}
            onChange={onChange}
            error={error}
            disabled={disabled}
            tooltip={tooltip}
            suggestions={AFFIRMATION_SUGGESTIONS}
            icon={<Sparkles size={14} color={COSMIC_COLORS.glow.gold} />}
            placeholder="Thêm khẳng định..."
          />
        );
      }
      if (field.id === 'ritual') {
        return (
          <RitualSelectField
            field={field}
            value={value}
            onChange={onChange}
            error={error}
            disabled={disabled}
            tooltip={tooltip}
            suggestions={RITUAL_SUGGESTIONS}
            icon={<Calendar size={14} color={COSMIC_COLORS.glow.cyan} />}
            placeholder="Thêm nghi thức..."
          />
        );
      }

      // Regular text input - with enhanced suggestions for VIP templates
      const textFieldSuggestions = field.suggestions || textSuggestions;
      const hasTextFieldSuggestions = textFieldSuggestions.length > 0;

      return (
        <View style={styles.fieldContainer}>
          <LabelWithTooltip
            label={field.label}
            required={field.required}
            tooltip={tooltip}
          />
          <TextInput
            style={[
              styles.textInput,
              error && styles.inputError,
              disabled && styles.inputDisabled,
            ]}
            value={value || ''}
            onChangeText={onChange}
            placeholder={field.placeholder || `Nhập ${field.label?.toLowerCase()}...`}
            placeholderTextColor={COSMIC_COLORS.text.hint}
            editable={!disabled}
            maxLength={field.maxLength}
          />
          {hasTextFieldSuggestions && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsLabel}>Gợi ý nhanh:</Text>
              <View style={styles.suggestionsWrap}>
                {textFieldSuggestions.map((suggestion, index) => {
                  const selected = value === suggestion;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.vipSuggestionChip,
                        selected && styles.vipSuggestionChipSelected,
                      ]}
                      onPress={() => {
                        if (disabled) return;
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onChange?.(suggestion);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.vipCheckbox,
                        selected && styles.vipCheckboxSelected,
                      ]}>
                        {selected && <Check size={12} color="#FFFFFF" />}
                      </View>
                      <Text style={[
                        styles.vipSuggestionText,
                        selected && styles.vipSuggestionTextSelected,
                      ]} numberOfLines={2}>
                        {suggestion}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
          {error && <Text style={styles.error}>{error}</Text>}
          {field.maxLength && (
            <Text style={styles.charCount}>
              {(value || '').length}/{field.maxLength}
            </Text>
          )}
        </View>
      );

    case FIELD_TYPES.TEXTAREA:
      // Get field-specific suggestions from template definition
      const fieldSuggestions = field.suggestions || textSuggestions;
      const hasFieldSuggestions = fieldSuggestions.length > 0;

      // Check if suggestion is already selected (exists as a line in value)
      const isSuggestionSelected = (suggestion) => {
        if (!value) return false;
        // Check if suggestion exists as a bullet point line
        return value.includes(`• ${suggestion}`) || value.includes(suggestion);
      };

      // Handle suggestion toggle - add/remove with bullet point
      const handleSuggestionToggle = (suggestion) => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (isSuggestionSelected(suggestion)) {
          // Remove the suggestion
          const lines = (value || '').split('\n').filter(line => {
            const cleanLine = line.replace(/^[•\-]\s*/, '').trim();
            return cleanLine !== suggestion;
          });
          onChange?.(lines.join('\n'));
        } else {
          // Add the suggestion with bullet point
          const bulletLine = `• ${suggestion}`;
          if (!value || value.trim() === '') {
            onChange?.(bulletLine);
          } else {
            onChange?.(`${value}\n${bulletLine}`);
          }
        }
      };

      return (
        <View style={styles.fieldContainer}>
          <LabelWithTooltip
            label={field.label}
            required={field.required}
            tooltip={tooltip}
          />
          <TextInput
            style={[
              styles.textInput,
              styles.textArea,
              error && styles.inputError,
              disabled && styles.inputDisabled,
            ]}
            value={value || ''}
            onChangeText={onChange}
            placeholder={field.placeholder || `Nhập ${field.label?.toLowerCase()}...`}
            placeholderTextColor={COSMIC_COLORS.text.hint}
            editable={!disabled}
            multiline
            numberOfLines={field.rows || 3}
            maxLength={field.maxLength}
            textAlignVertical="top"
          />
          {hasFieldSuggestions && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsLabel}>Gợi ý nhanh:</Text>
              <View style={styles.suggestionsWrap}>
                {fieldSuggestions.map((suggestion, index) => {
                  const selected = isSuggestionSelected(suggestion);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.vipSuggestionChip,
                        selected && styles.vipSuggestionChipSelected,
                      ]}
                      onPress={() => handleSuggestionToggle(suggestion)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.vipCheckbox,
                        selected && styles.vipCheckboxSelected,
                      ]}>
                        {selected && <Check size={12} color="#FFFFFF" />}
                      </View>
                      <Text style={[
                        styles.vipSuggestionText,
                        selected && styles.vipSuggestionTextSelected,
                      ]} numberOfLines={2}>
                        {suggestion}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
          {error && <Text style={styles.error}>{error}</Text>}
          {field.maxLength && (
            <Text style={styles.charCount}>
              {(value || '').length}/{field.maxLength}
            </Text>
          )}
        </View>
      );

    case FIELD_TYPES.SLIDER:
      return (
        <View style={styles.fieldContainer}>
          <SliderInput
            value={value ?? field.defaultValue ?? field.min ?? 1}
            onChange={onChange}
            min={field.min}
            max={field.max}
            step={field.step}
            labels={field.labels}
            label={field.label}
            disabled={disabled}
            error={error}
          />
        </View>
      );

    case FIELD_TYPES.SELECT:
      return (
        <View style={styles.fieldContainer}>
          <SelectInput
            value={value}
            onChange={onChange}
            options={field.options || []}
            placeholder={field.placeholder}
            label={field.label}
            required={field.required}
            disabled={disabled}
            error={error}
          />
        </View>
      );

    case FIELD_TYPES.LIFE_AREA:
      return (
        <View style={styles.fieldContainer}>
          <LifeAreaSelector
            value={value}
            onChange={onChange}
            mode={field.mode || 'compact'}
            label={field.label}
            required={field.required}
            disabled={disabled}
            error={error}
            placeholder={field.placeholder}
          />
        </View>
      );

    case FIELD_TYPES.CHECKLIST:
      return (
        <View style={styles.fieldContainer}>
          <ChecklistInput
            value={value || []}
            onChange={onChange}
            label={field.label}
            placeholder={field.placeholder}
            maxItems={field.maxItems}
            minItems={field.minItems}
            required={field.required}
            disabled={disabled}
            error={error}
          />
        </View>
      );

    case FIELD_TYPES.ACTION_LIST:
      // Get suggested actions for this field
      const actionSuggestions = ACTION_SUGGESTIONS[field.id] || [];
      return (
        <View style={styles.fieldContainer}>
          <ActionListInput
            value={value || []}
            onChange={onChange}
            label={field.label}
            placeholder={field.placeholder}
            maxItems={field.maxItems}
            minItems={field.minItems}
            required={field.required}
            requireLifeArea={field.requireLifeArea !== false}
            disabled={disabled}
            error={error}
            checkboxLabel={field.checkboxLabel}
            suggestions={actionSuggestions}
          />
        </View>
      );

    case FIELD_TYPES.MOOD:
      return (
        <View style={styles.fieldContainer}>
          <LabelWithTooltip
            label={field.label || 'Tâm trạng'}
            required={field.required}
            tooltip={tooltip}
          />
          <MoodSelector
            value={value}
            onChange={onChange}
            disabled={disabled}
            error={error}
          />
        </View>
      );

    case FIELD_TYPES.DATE:
      return (
        <View style={styles.fieldContainer}>
          <LabelWithTooltip
            label={field.label}
            required={field.required}
            tooltip={tooltip}
          />
          <TextInput
            style={[
              styles.textInput,
              error && styles.inputError,
              disabled && styles.inputDisabled,
            ]}
            value={value || ''}
            onChangeText={onChange}
            placeholder={field.placeholder || 'YYYY-MM-DD'}
            placeholderTextColor={COSMIC_COLORS.text.hint}
            editable={!disabled}
          />
          {error && <Text style={styles.error}>{error}</Text>}
        </View>
      );

    default:
      console.warn(`[FormFieldRenderer] Unknown field type: ${field.type}`);
      return (
        <View style={styles.fieldContainer}>
          <Text style={styles.unknownField}>
            Trường chưa được hỗ trợ: {field.type}
          </Text>
        </View>
      );
  }
};

/**
 * MultiSelectField - For affirmations and rituals
 * Allows selecting multiple items from suggestions + adding custom
 */
const MultiSelectField = ({
  field,
  value,
  onChange,
  error,
  disabled,
  tooltip,
  suggestions = [],
  icon,
  placeholder,
}) => {
  const [customInput, setCustomInput] = useState('');

  // Parse value - ONLY accept arrays (not strings)
  // String values (like defaultValue) should NOT be treated as selections
  const selectedItems = React.useMemo(() => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    // Don't parse strings as selections - only accept explicit arrays
    return [];
  }, [value]);

  // Toggle selection
  const toggleItem = (item) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newItems = selectedItems.includes(item)
      ? selectedItems.filter(i => i !== item)
      : [...selectedItems, item];

    // Return as array for flexibility
    onChange?.(newItems.length > 0 ? newItems : null);
  };

  // Add custom item
  const addCustomItem = () => {
    if (!customInput.trim() || disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newItems = [...selectedItems, customInput.trim()];
    onChange?.(newItems);
    setCustomInput('');
  };

  const isSelected = (item) => selectedItems.includes(item);

  return (
    <View style={styles.fieldContainer}>
      <LabelWithTooltip
        label={field.label}
        required={field.required}
        tooltip={tooltip}
      />

      {/* Suggestions Grid */}
      <View style={styles.multiSelectGrid}>
        {suggestions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.multiSelectChip,
              isSelected(item) && styles.multiSelectChipSelected,
              disabled && styles.multiSelectChipDisabled,
            ]}
            onPress={() => toggleItem(item)}
            activeOpacity={0.7}
          >
            {isSelected(item) && (
              <Check size={12} color={COSMIC_COLORS.glow.gold} style={styles.checkIcon} />
            )}
            <Text
              style={[
                styles.multiSelectChipText,
                isSelected(item) && styles.multiSelectChipTextSelected,
              ]}
              numberOfLines={2}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom Input */}
      <View style={styles.customInputRow}>
        {icon}
        <TextInput
          style={styles.customInput}
          value={customInput}
          onChangeText={setCustomInput}
          placeholder={placeholder}
          placeholderTextColor={COSMIC_COLORS.text.hint}
          editable={!disabled}
          returnKeyType="done"
          onSubmitEditing={addCustomItem}
        />
        <TouchableOpacity
          onPress={addCustomItem}
          disabled={disabled || !customInput.trim()}
          style={[
            styles.addCustomButton,
            (!customInput.trim() || disabled) && styles.addCustomButtonDisabled,
          ]}
          activeOpacity={0.7}
        >
          <Plus size={16} color={COSMIC_COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Selected Count */}
      {selectedItems.length > 0 && (
        <Text style={styles.selectedCount}>
          Đã chọn: {selectedItems.length}
        </Text>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

/**
 * RitualSelectField - For rituals with app ritual icons + custom suggestions
 */
const RitualSelectField = ({
  field,
  value,
  onChange,
  error,
  disabled,
  tooltip,
  suggestions = [],
  icon,
  placeholder,
}) => {
  const [customInput, setCustomInput] = useState('');

  // Parse value - ONLY accept arrays
  const selectedItems = React.useMemo(() => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [];
  }, [value]);

  // Toggle app ritual selection
  const toggleAppRitual = (ritual) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const ritualName = ritual.name;
    const newItems = selectedItems.includes(ritualName)
      ? selectedItems.filter(i => i !== ritualName)
      : [...selectedItems, ritualName];

    onChange?.(newItems.length > 0 ? newItems : null);
  };

  // Toggle text suggestion
  const toggleSuggestion = (item) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newItems = selectedItems.includes(item)
      ? selectedItems.filter(i => i !== item)
      : [...selectedItems, item];

    onChange?.(newItems.length > 0 ? newItems : null);
  };

  // Add custom item
  const addCustomItem = () => {
    if (!customInput.trim() || disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newItems = [...selectedItems, customInput.trim()];
    onChange?.(newItems);
    setCustomInput('');
  };

  const isSelected = (item) => selectedItems.includes(item);

  return (
    <View style={styles.fieldContainer}>
      <LabelWithTooltip
        label={field.label}
        required={field.required}
        tooltip={tooltip}
      />

      {/* App Rituals Grid with Icons */}
      <Text style={styles.ritualSectionTitle}>Nghi thức của GEM:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.appRitualsScroll}
        contentContainerStyle={styles.appRitualsContent}
      >
        {APP_RITUALS.map((ritual) => {
          const IconComponent = ritual.icon;
          const selected = isSelected(ritual.name);
          return (
            <TouchableOpacity
              key={ritual.id}
              style={[
                styles.appRitualItem,
                selected && styles.appRitualItemSelected,
                { borderColor: selected ? ritual.color : COSMIC_COLORS.glass.border },
              ]}
              onPress={() => toggleAppRitual(ritual)}
              activeOpacity={0.7}
              disabled={disabled}
            >
              <View style={[styles.appRitualIconWrap, { backgroundColor: ritual.color + '20' }]}>
                <IconComponent size={18} color={ritual.color} />
              </View>
              <Text style={styles.appRitualName} numberOfLines={1}>{ritual.name}</Text>
              {selected && (
                <View style={[styles.appRitualCheck, { backgroundColor: ritual.color }]}>
                  <Check size={10} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Text Suggestions */}
      <Text style={styles.ritualSectionTitle}>Gợi ý khác:</Text>
      <View style={styles.multiSelectGrid}>
        {suggestions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.multiSelectChip,
              isSelected(item) && styles.multiSelectChipSelected,
              disabled && styles.multiSelectChipDisabled,
            ]}
            onPress={() => toggleSuggestion(item)}
            activeOpacity={0.7}
          >
            {isSelected(item) && (
              <Check size={12} color={COSMIC_COLORS.glow.gold} style={styles.checkIcon} />
            )}
            <Text
              style={[
                styles.multiSelectChipText,
                isSelected(item) && styles.multiSelectChipTextSelected,
              ]}
              numberOfLines={2}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom Input */}
      <View style={styles.customInputRow}>
        {icon}
        <TextInput
          style={styles.customInput}
          value={customInput}
          onChangeText={setCustomInput}
          placeholder={placeholder}
          placeholderTextColor={COSMIC_COLORS.text.hint}
          editable={!disabled}
          returnKeyType="done"
          onSubmitEditing={addCustomItem}
        />
        <TouchableOpacity
          onPress={addCustomItem}
          disabled={disabled || !customInput.trim()}
          style={[
            styles.addCustomButton,
            (!customInput.trim() || disabled) && styles.addCustomButtonDisabled,
          ]}
          activeOpacity={0.7}
        >
          <Plus size={16} color={COSMIC_COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Selected Count */}
      {selectedItems.length > 0 && (
        <Text style={styles.selectedCount}>
          Đã chọn: {selectedItems.length}
        </Text>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

/**
 * Simple Mood Selector Component
 */
const MoodSelector = ({ value, onChange, disabled, error }) => {
  const moods = [
    { id: 'happy', emoji: '😊', label: 'Vui' },
    { id: 'excited', emoji: '🎉', label: 'Phấn khởi' },
    { id: 'peaceful', emoji: '😌', label: 'Bình yên' },
    { id: 'neutral', emoji: '😐', label: 'Bình thường' },
    { id: 'anxious', emoji: '😰', label: 'Lo lắng' },
    { id: 'sad', emoji: '😢', label: 'Buồn' },
    { id: 'stressed', emoji: '😫', label: 'Stress' },
  ];

  return (
    <View>
      <View style={styles.moodGrid}>
        {moods.map((mood) => {
          const isSelected = value === mood.id;
          return (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.moodItem,
                isSelected && styles.moodItemSelected,
                disabled && styles.moodItemDisabled,
              ]}
              onPress={() => !disabled && onChange?.(mood.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text
                style={[
                  styles.moodLabel,
                  isSelected && styles.moodLabelSelected,
                ]}
              >
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

/**
 * Render multiple fields from template
 */
export const renderTemplateFields = ({
  fields,
  formData,
  errors,
  onChange,
  disabled,
  tooltips,
}) => {
  if (!fields || !Array.isArray(fields)) return null;

  return fields.map((field) => (
    <FormFieldRenderer
      key={field.id}
      field={field}
      value={formData[field.id]}
      onChange={(value) => onChange(field.id, value)}
      error={errors[field.id]}
      disabled={disabled}
      tooltips={tooltips}
    />
  ));
};

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: COSMIC_SPACING.md,
  },

  // Text inputs
  textInput: {
    backgroundColor: COSMIC_COLORS.glass.bgDark,
    borderRadius: COSMIC_RADIUS.md,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
    paddingHorizontal: COSMIC_SPACING.sm,
    paddingVertical: COSMIC_SPACING.sm,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md, // Increased
    color: COSMIC_COLORS.text.primary,
    minHeight: 44,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: COSMIC_COLORS.functional.error,
  },
  inputDisabled: {
    opacity: 0.5,
    backgroundColor: COSMIC_COLORS.glass.bgLight,
  },

  // Suggestions
  suggestionsContainer: {
    marginTop: COSMIC_SPACING.xs,
  },
  suggestionsLabel: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm, // Increased
    color: COSMIC_COLORS.text.hint,
    marginBottom: COSMIC_SPACING.xxs,
  },
  suggestionsList: {
    flexDirection: 'row',
    gap: COSMIC_SPACING.xs,
    paddingVertical: COSMIC_SPACING.xxs,
  },
  suggestionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: COSMIC_SPACING.xs,
  },
  suggestionChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: COSMIC_SPACING.sm,
    paddingVertical: COSMIC_SPACING.xxs,
    borderRadius: COSMIC_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxWidth: 180,
  },
  suggestionChipSelected: {
    backgroundColor: COSMIC_COLORS.glow.gold + '20',
    borderColor: COSMIC_COLORS.glow.gold,
  },
  suggestionChipText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm, // Increased
    color: COSMIC_COLORS.text.muted,
  },
  suggestionChipTextSelected: {
    color: COSMIC_COLORS.glow.gold,
  },

  // VIP Suggestion Chips (checkbox style)
  vipSuggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COSMIC_COLORS.glass.bgDark,
    paddingHorizontal: COSMIC_SPACING.sm,
    paddingVertical: COSMIC_SPACING.sm,
    borderRadius: COSMIC_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COSMIC_COLORS.glass.border,
    marginBottom: COSMIC_SPACING.xs,
    width: '100%',
  },
  vipSuggestionChipSelected: {
    backgroundColor: COSMIC_COLORS.glow.gold + '15',
    borderColor: COSMIC_COLORS.glow.gold,
  },
  vipCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COSMIC_COLORS.glass.border,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: COSMIC_SPACING.sm,
  },
  vipCheckboxSelected: {
    backgroundColor: COSMIC_COLORS.glow.gold,
    borderColor: COSMIC_COLORS.glow.gold,
  },
  vipSuggestionText: {
    flex: 1,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    color: COSMIC_COLORS.text.secondary,
    lineHeight: 20,
  },
  vipSuggestionTextSelected: {
    color: COSMIC_COLORS.glow.gold,
    fontWeight: '500',
  },

  // Multi-select (Affirmations/Rituals)
  multiSelectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: COSMIC_SPACING.xs,
    marginBottom: COSMIC_SPACING.sm,
  },
  multiSelectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COSMIC_COLORS.glass.bgDark,
    paddingHorizontal: COSMIC_SPACING.sm,
    paddingVertical: COSMIC_SPACING.xs,
    borderRadius: COSMIC_RADIUS.sm,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
    maxWidth: '100%',
  },
  multiSelectChipSelected: {
    backgroundColor: COSMIC_COLORS.glow.gold + '15',
    borderColor: COSMIC_COLORS.glow.gold,
  },
  multiSelectChipDisabled: {
    opacity: 0.5,
  },
  checkIcon: {
    marginRight: COSMIC_SPACING.xxs,
  },
  multiSelectChipText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm, // Increased
    color: COSMIC_COLORS.text.secondary,
    flexShrink: 1,
  },
  multiSelectChipTextSelected: {
    color: COSMIC_COLORS.glow.gold,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.xs,
  },
  customInput: {
    flex: 1,
    backgroundColor: COSMIC_COLORS.glass.bgLight,
    borderRadius: COSMIC_RADIUS.sm,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
    paddingHorizontal: COSMIC_SPACING.sm,
    paddingVertical: COSMIC_SPACING.xs,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md, // Increased
    color: COSMIC_COLORS.text.primary,
    minHeight: 40,
  },
  addCustomButton: {
    width: 36,
    height: 36,
    borderRadius: COSMIC_RADIUS.sm,
    backgroundColor: COSMIC_COLORS.glow.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCustomButtonDisabled: {
    opacity: 0.4,
  },
  selectedCount: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm, // Increased
    color: COSMIC_COLORS.glow.gold,
    marginTop: COSMIC_SPACING.xs,
  },

  // Helpers
  error: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm, // Increased
    color: COSMIC_COLORS.functional.error,
    marginTop: COSMIC_SPACING.xxs,
  },
  charCount: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xs, // Increased (was 10)
    color: COSMIC_COLORS.text.hint,
    textAlign: 'right',
    marginTop: COSMIC_SPACING.xxs,
  },
  unknownField: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm, // Increased
    color: COSMIC_COLORS.functional.warning,
    fontStyle: 'italic',
  },

  // Mood selector
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: COSMIC_SPACING.xs,
  },
  moodItem: {
    alignItems: 'center',
    paddingHorizontal: COSMIC_SPACING.sm,
    paddingVertical: COSMIC_SPACING.xs,
    backgroundColor: COSMIC_COLORS.glass.bgLight,
    borderRadius: COSMIC_RADIUS.sm,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
    minWidth: 50,
  },
  moodItemSelected: {
    backgroundColor: COSMIC_COLORS.glow.gold + '20',
    borderColor: COSMIC_COLORS.glow.gold,
  },
  moodItemDisabled: {
    opacity: 0.5,
  },
  moodEmoji: {
    fontSize: 22, // Increased
    marginBottom: 2,
  },
  moodLabel: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xs, // Increased (was 10)
    color: COSMIC_COLORS.text.muted,
  },
  moodLabelSelected: {
    color: COSMIC_COLORS.glow.gold,
  },

  // Ritual Select styles
  ritualSectionTitle: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm, // Increased
    color: COSMIC_COLORS.text.muted,
    marginBottom: COSMIC_SPACING.xs,
    marginTop: COSMIC_SPACING.sm,
  },
  appRitualsScroll: {
    marginBottom: COSMIC_SPACING.sm,
  },
  appRitualsContent: {
    gap: COSMIC_SPACING.sm,
    paddingRight: COSMIC_SPACING.md,
  },
  appRitualItem: {
    width: 90,
    alignItems: 'center',
    padding: COSMIC_SPACING.sm,
    backgroundColor: COSMIC_COLORS.glass.bgDark,
    borderRadius: COSMIC_RADIUS.md,
    borderWidth: 1,
    position: 'relative',
  },
  appRitualItemSelected: {
    backgroundColor: COSMIC_COLORS.glass.bgLight,
  },
  appRitualIconWrap: {
    width: 36,
    height: 36,
    borderRadius: COSMIC_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: COSMIC_SPACING.xs,
  },
  appRitualName: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xs, // Increased (was 10)
    color: COSMIC_COLORS.text.secondary,
    textAlign: 'center',
  },
  appRitualCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: COSMIC_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FormFieldRenderer;
