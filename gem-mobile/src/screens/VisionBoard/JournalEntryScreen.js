/**
 * JournalEntryScreen.js
 * Screen for creating/editing journal entries in Calendar Smart Journal
 * Supports both generic forms and template-based forms
 *
 * Created: January 28, 2026
 * Updated: February 3, 2026 - Added template support
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Save,
  Trash2,
  Pin,
  Star,
  BookOpen,
  Heart,
  Target,
  FileText,
  ChevronDown,
  Info,
} from 'lucide-react-native';
import * as LucideIcons from 'lucide-react-native';

import { COLORS, TYPOGRAPHY, SPACING, GRADIENTS, BORDER_RADIUS } from '../../utils/tokens';
import { supabase } from '../../services/supabase';
import {
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  togglePinEntry,
  toggleFavoriteEntry,
  getEntriesForDate,
  ENTRY_TYPES,
  MOODS,
  LIFE_AREAS,
} from '../../services/calendarJournalService';
import { checkCalendarAccess, getJournalCharLimit } from '../../config/calendarAccessControl';
import TagInput from '../../components/VisionBoard/TagInput';
import MoodPicker from '../../components/VisionBoard/MoodPicker';
import { RichTextRenderer } from '../../components/RichTextEditor';

// Template system imports
import { getTemplate, canAccessTemplate } from '../../services/templates/journalTemplates';
import FormFieldRenderer, { renderTemplateFields } from '../../components/shared/templates/FormFieldRenderer';
import PaperTradeSelector from '../../components/shared/templates/PaperTradeSelector';

// Entry type options
const ENTRY_TYPE_OPTIONS = [
  { id: ENTRY_TYPES.REFLECTION, label: 'Suy ngẫm', icon: BookOpen, color: COLORS.purple },
  { id: ENTRY_TYPES.GRATITUDE, label: 'Biết ơn', icon: Heart, color: COLORS.error },
  { id: ENTRY_TYPES.GOAL_NOTE, label: 'Ghi chú mục tiêu', icon: Target, color: COLORS.info },
  { id: ENTRY_TYPES.QUICK_NOTE, label: 'Ghi nhanh', icon: FileText, color: COLORS.textSecondary },
];

const JournalEntryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Route params
  const { entryId, mode = 'create', date, entryType: initialType, templateId, sourceScreen, returnDate } = route.params || {};

  // State
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userTier, setUserTier] = useState('FREE');
  const [userRole, setUserRole] = useState(null);

  // Entry data (generic form)
  const [entryType, setEntryType] = useState(initialType || ENTRY_TYPES.REFLECTION);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(null);
  const [lifeArea, setLifeArea] = useState(null);
  const [tags, setTags] = useState([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Template form data
  const [templateFormData, setTemplateFormData] = useState({});
  const [templateErrors, setTemplateErrors] = useState({});

  // UI state
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showLifeAreaSelector, setShowLifeAreaSelector] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditing, setIsEditing] = useState(mode === 'create'); // Start in edit mode only for new entries

  // Original data for change detection
  const originalData = useRef(null);

  // Get template if templateId is provided
  const template = useMemo(() => {
    if (!templateId) return null;
    return getTemplate(templateId);
  }, [templateId]);

  // Check template access
  const templateAccess = useMemo(() => {
    if (!templateId) return { allowed: true };
    return canAccessTemplate(templateId, userTier, userRole);
  }, [templateId, userTier, userRole]);

  // Get template icon component
  const TemplateIcon = useMemo(() => {
    if (!template?.icon) return null;
    return LucideIcons[template.icon] || Info;
  }, [template]);

  // Check if this is a trading journal template
  const isTradingJournal = templateId === 'trading_journal';

  // Handle Paper Trade selection (auto-fill form data)
  const handlePaperTradeSelect = useCallback((tradeData) => {
    console.log('[JournalEntry] Paper trade selected:', tradeData);
    setTemplateFormData(prev => ({
      ...prev,
      ...tradeData,
    }));
  }, []);

  // Get access config
  const access = checkCalendarAccess('basic_journal', userTier, userRole);
  const charLimit = getJournalCharLimit(userTier, userRole);

  // Initialize
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);

        // Get user tier/role from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier, role')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserTier(profile.subscription_tier || 'FREE');
          setUserRole(profile.role);
        }

        // Load existing entry if editing
        if (mode === 'edit' && entryId) {
          await loadEntry(user.id, entryId);
        }
      }
      setLoading(false);
    };

    init();
  }, [mode, entryId]);

  // Load existing entry
  const loadEntry = async (uid, eid) => {
    try {
      const { data, error } = await supabase
        .from('calendar_journal_entries')
        .select('*')
        .eq('id', eid)
        .eq('user_id', uid)
        .maybeSingle(); // Handle 0 rows gracefully

      if (error) throw error;

      if (!data) {
        console.warn('[JournalEntry] Entry not found:', eid);
        Alert.alert('Lỗi', 'Không tìm thấy bài viết');
        navigation.goBack();
        return;
      }

      if (data) {
        setEntryType(data.entry_type);
        setTitle(data.title || '');
        setContent(data.content || '');
        setMood(data.mood);
        setLifeArea(data.life_area);
        setTags(data.tags || []);
        setIsPinned(data.is_pinned || false);
        setIsFavorite(data.is_favorite || false);

        originalData.current = {
          entryType: data.entry_type,
          title: data.title,
          content: data.content,
          mood: data.mood,
          lifeArea: data.life_area,
          tags: data.tags,
          isPinned: data.is_pinned,
          isFavorite: data.is_favorite,
        };
      }
    } catch (error) {
      console.error('[JournalEntry] Load error:', error);
      Alert.alert('Lỗi', 'Không thể tải bài viết');
    }
  };

  // Handle template field changes
  const handleTemplateFieldChange = useCallback((fieldId, value) => {
    setTemplateFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));
    // Clear error for this field when user types
    if (templateErrors[fieldId]) {
      setTemplateErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  }, [templateErrors]);

  // Track changes
  useEffect(() => {
    if (mode === 'edit' && originalData.current) {
      const changed =
        entryType !== originalData.current.entryType ||
        title !== originalData.current.title ||
        content !== originalData.current.content ||
        mood !== originalData.current.mood ||
        lifeArea !== originalData.current.lifeArea ||
        JSON.stringify(tags) !== JSON.stringify(originalData.current.tags) ||
        isPinned !== originalData.current.isPinned ||
        isFavorite !== originalData.current.isFavorite;

      setHasChanges(changed);
    } else if (mode === 'create') {
      // For template forms, check if any field has data
      if (template) {
        const hasData = Object.values(templateFormData).some(v => {
          if (Array.isArray(v)) return v.length > 0;
          if (typeof v === 'string') return v.trim().length > 0;
          return v !== null && v !== undefined;
        });
        setHasChanges(hasData);
      } else {
        setHasChanges(content.trim().length > 0);
      }
    }
  }, [entryType, title, content, mood, lifeArea, tags, isPinned, isFavorite, mode, template, templateFormData]);

  // Validate template form
  const validateTemplateForm = useCallback(() => {
    if (!template) return { isValid: true, errors: {} };

    const errors = {};
    let isValid = true;

    for (const field of template.fields) {
      const value = templateFormData[field.id];

      // Check required fields
      if (field.required) {
        if (value === undefined || value === null || value === '') {
          errors[field.id] = 'Trường này là bắt buộc';
          isValid = false;
        } else if (Array.isArray(value) && value.length === 0) {
          errors[field.id] = 'Vui lòng thêm ít nhất một mục';
          isValid = false;
        }
      }

      // Check minItems for lists
      if (field.minItems && Array.isArray(value) && value.length < field.minItems) {
        errors[field.id] = `Cần ít nhất ${field.minItems} mục`;
        isValid = false;
      }
    }

    return { isValid, errors };
  }, [template, templateFormData]);

  // Build content from template data for storage
  const buildTemplateContent = useCallback(() => {
    if (!template) return '';

    const lines = [];
    lines.push(`# ${template.name}\n`);

    for (const field of template.fields) {
      const value = templateFormData[field.id];
      if (value === undefined || value === null || value === '') continue;

      // Add field label
      lines.push(`## ${field.label.replace(' *', '')}`);

      // Format value based on type
      if (Array.isArray(value)) {
        // Action list or checklist
        for (const item of value) {
          if (typeof item === 'object') {
            // Action item with checked state
            const checkbox = item.checked ? '[x]' : '[ ]';
            const lifeAreaText = item.lifeArea ? ` (${item.lifeArea})` : '';
            lines.push(`- ${checkbox} ${item.text}${lifeAreaText}`);
          } else {
            lines.push(`- ${item}`);
          }
        }
      } else if (typeof value === 'number') {
        // Slider value
        lines.push(`${value}`);
      } else {
        // Text value
        lines.push(value);
      }

      lines.push(''); // Empty line between sections
    }

    return lines.join('\n');
  }, [template, templateFormData]);

  // Handle save
  const handleSave = async () => {
    // Template form validation
    if (template) {
      // Check template access
      if (!templateAccess.allowed) {
        Alert.alert('Hạn chế', templateAccess.reason);
        return;
      }

      const { isValid, errors } = validateTemplateForm();
      if (!isValid) {
        setTemplateErrors(errors);
        // Find first error field to scroll to
        const firstErrorField = template.fields.find(f => errors[f.id]);
        Alert.alert('Lỗi', `Vui lòng điền ${firstErrorField?.label?.replace(' *', '') || 'các trường bắt buộc'}`);
        return;
      }
    } else {
      // Generic form validation
      if (!content.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập nội dung');
        return;
      }
    }

    if (!access.allowed) {
      Alert.alert('Hạn chế', access.reason);
      return;
    }

    setSaving(true);

    try {
      // Build entry data
      let entryData;

      if (template) {
        // Template form - store structured data
        const builtContent = buildTemplateContent();
        entryData = {
          entry_type: template.category === 'goal_focused' ? ENTRY_TYPES.GOAL_NOTE : ENTRY_TYPES.REFLECTION,
          title: templateFormData.title || templateFormData.fear_target || template.name,
          content: builtContent,
          mood: templateFormData.mood || null,
          life_area: templateFormData.life_area || template.defaultLifeArea,
          tags,
          is_pinned: isPinned,
          is_favorite: isFavorite,
          entry_date: date || new Date().toISOString().split('T')[0],
          // Store template metadata
          template_id: templateId,
          template_data: templateFormData,
        };
      } else {
        // Generic form
        entryData = {
          entry_type: entryType,
          title: title.trim() || null,
          content: content.trim(),
          mood,
          life_area: lifeArea,
          tags,
          is_pinned: isPinned,
          is_favorite: isFavorite,
          entry_date: date || new Date().toISOString().split('T')[0],
        };
      }

      let result;
      if (mode === 'edit' && entryId) {
        result = await updateJournalEntry(userId, entryId, entryData, userTier);
      } else {
        result = await createJournalEntry(userId, entryData, userTier, userRole);
      }

      if (result.success) {
        navigateBack();
      } else {
        Alert.alert('Lỗi', result.error || 'Không thể lưu');
      }
    } catch (error) {
      console.error('[JournalEntry] Save error:', error);
      Alert.alert('Lỗi', 'Không thể lưu bài viết');
    }

    setSaving(false);
  };

  // Handle delete
  const handleDelete = () => {
    Alert.alert(
      'Xóa bài viết',
      'Bạn có chắc muốn xóa bài viết này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteJournalEntry(userId, entryId);
              if (result.success) {
                navigateBack();
              } else {
                Alert.alert('Lỗi', result.error);
              }
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa');
            }
          },
        },
      ]
    );
  };

  // Navigate back to the source screen
  const navigateBack = () => {
    // If we came from Calendar or VisionBoard, navigate back properly
    if (sourceScreen === 'Calendar') {
      navigation.navigate('Calendar', { selectedDate: returnDate, refreshData: true });
    } else if (sourceScreen === 'VisionBoard') {
      navigation.navigate('VisionBoard', {
        openCalendarDate: returnDate,
        showDayDetail: true,
        refreshData: true,
      });
    } else {
      navigation.goBack();
    }
  };

  // Handle back with unsaved changes
  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        'Chưa lưu',
        'Bạn có thay đổi chưa lưu. Thoát không lưu?',
        [
          { text: 'Tiếp tục chỉnh sửa', style: 'cancel' },
          {
            text: 'Thoát',
            style: 'destructive',
            onPress: navigateBack,
          },
        ]
      );
    } else {
      navigateBack();
    }
  };

  // Get entry type config
  const currentTypeConfig = ENTRY_TYPE_OPTIONS.find((t) => t.id === entryType) || ENTRY_TYPE_OPTIONS[0];
  const TypeIcon = currentTypeConfig.icon;

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LinearGradient colors={GRADIENTS.darkPurple} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={COLORS.purple} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={GRADIENTS.darkPurple} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          {template && TemplateIcon && (
            <TemplateIcon size={20} color={COLORS.gold} style={styles.headerTitleIcon} />
          )}
          <Text style={styles.headerTitle} numberOfLines={1}>
            {template ? template.name : (mode === 'edit' ? 'Chỉnh sửa' : 'Viết mới')}
          </Text>
        </View>

        <View style={styles.headerActions}>
          {mode === 'edit' && (
            <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
              <Trash2 size={20} color={COLORS.error} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            disabled={saving || (!template && !content.trim())}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.bgDarkest} />
            ) : (
              <>
                <Save size={18} color={COLORS.bgDarkest} />
                <Text style={styles.saveButtonText}>Lưu</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* TEMPLATE FORM - Render when templateId is provided */}
          {template ? (
            <View style={styles.templateFormContainer}>
              {/* Template description */}
              {template.description && (
                <View style={styles.templateDescription}>
                  <Info size={14} color={COLORS.textMuted} />
                  <Text style={styles.templateDescriptionText}>{template.description}</Text>
                </View>
              )}

              {/* Template tooltip */}
              {template.tooltips?.form && (
                <View style={styles.templateTooltip}>
                  <Text style={styles.templateTooltipText}>{template.tooltips.form}</Text>
                </View>
              )}

              {/* Paper Trade Selector for Trading Journal */}
              {isTradingJournal && (
                <PaperTradeSelector
                  userId={userId}
                  onSelect={handlePaperTradeSelect}
                  disabled={saving}
                />
              )}

              {/* Render template fields */}
              {template.fields.map((field) => (
                <FormFieldRenderer
                  key={field.id}
                  field={field}
                  value={templateFormData[field.id]}
                  onChange={(value) => handleTemplateFieldChange(field.id, value)}
                  error={templateErrors[field.id]}
                  disabled={saving}
                  tooltips={template.tooltips || {}}
                />
              ))}

              {/* Tags section for templates */}
              <View style={styles.tagsSection}>
                <Text style={styles.optionLabel}>Tags</Text>
                <TagInput
                  tags={tags}
                  onTagsChange={setTags}
                  userId={userId}
                  placeholder="Thêm tag..."
                />
              </View>

              {/* Pin & Favorite */}
              <View style={styles.togglesRow}>
                <TouchableOpacity
                  style={[styles.toggleButton, isPinned && styles.toggleButtonActive]}
                  onPress={() => setIsPinned(!isPinned)}
                >
                  <Pin size={18} color={isPinned ? COLORS.gold : COLORS.textMuted} fill={isPinned ? COLORS.gold : 'transparent'} />
                  <Text style={[styles.toggleText, isPinned && styles.toggleTextActive]}>Ghim</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toggleButton, isFavorite && styles.toggleButtonActive]}
                  onPress={() => setIsFavorite(!isFavorite)}
                >
                  <Star size={18} color={isFavorite ? COLORS.gold : COLORS.textMuted} fill={isFavorite ? COLORS.gold : 'transparent'} />
                  <Text style={[styles.toggleText, isFavorite && styles.toggleTextActive]}>Yêu thích</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* GENERIC FORM - Original form when no templateId */
            <>
              {/* Entry Type Selector */}
              <TouchableOpacity
                style={styles.typeSelector}
                onPress={() => setShowTypeSelector(!showTypeSelector)}
              >
                <View style={[styles.typeIcon, { backgroundColor: currentTypeConfig.color + '20' }]}>
                  <TypeIcon size={18} color={currentTypeConfig.color} />
                </View>
                <Text style={styles.typeLabel}>{currentTypeConfig.label}</Text>
                <ChevronDown size={18} color={COLORS.textMuted} />
              </TouchableOpacity>

              {showTypeSelector && (
                <View style={styles.typeOptions}>
                  {ENTRY_TYPE_OPTIONS.map((option) => {
                    const OptionIcon = option.icon;
                    const isSelected = entryType === option.id;
                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[styles.typeOption, isSelected && styles.typeOptionSelected]}
                        onPress={() => {
                          setEntryType(option.id);
                          setShowTypeSelector(false);
                        }}
                      >
                        <OptionIcon size={16} color={isSelected ? option.color : COLORS.textMuted} />
                        <Text style={[styles.typeOptionText, isSelected && { color: option.color }]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Title (optional) */}
              <TextInput
                style={styles.titleInput}
                placeholder="Tiêu đề (tùy chọn)"
                placeholderTextColor={COLORS.textMuted}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />

              {/* Content - Seamless Edit */}
              <View style={styles.contentContainer}>
                {isEditing ? (
                  <TextInput
                    style={styles.contentInput}
                    placeholder={
                      entryType === ENTRY_TYPES.GRATITUDE
                        ? 'Hôm nay tôi biết ơn...'
                        : entryType === ENTRY_TYPES.GOAL_NOTE
                        ? 'Ghi chú về mục tiêu...'
                        : 'Viết suy nghĩ của bạn...'
                    }
                    placeholderTextColor={COLORS.textMuted}
                    value={content}
                    onChangeText={setContent}
                    multiline
                    textAlignVertical="top"
                    maxLength={charLimit}
                    autoFocus
                    onBlur={() => setIsEditing(false)}
                  />
                ) : (
                  <TouchableOpacity
                    style={styles.previewContainer}
                    onPress={() => setIsEditing(true)}
                    activeOpacity={1}
                  >
                    {content ? (
                      <RichTextRenderer content={content} style={styles.previewText} />
                    ) : (
                      <Text style={styles.previewPlaceholder}>
                        {entryType === ENTRY_TYPES.GRATITUDE
                          ? 'Hôm nay tôi biết ơn...'
                          : entryType === ENTRY_TYPES.GOAL_NOTE
                          ? 'Ghi chú về mục tiêu...'
                          : 'Viết suy nghĩ của bạn...'}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
                <Text style={styles.charCount}>
                  {content.length}/{charLimit}
                </Text>
              </View>

              {/* Mood selector */}
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => setShowMoodPicker(true)}
              >
                <Text style={styles.optionLabel}>Cảm xúc</Text>
                {mood ? (
                  <View style={[styles.moodBadge, { backgroundColor: MOODS[mood.toUpperCase()]?.color + '20' }]}>
                    <Text style={[styles.moodBadgeText, { color: MOODS[mood.toUpperCase()]?.color }]}>
                      {MOODS[mood.toUpperCase()]?.label}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.optionValue}>Chọn</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Only show for generic form (no template) */}
          {!template && (
            <>
              {/* Life area selector */}
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => setShowLifeAreaSelector(!showLifeAreaSelector)}
              >
                <Text style={styles.optionLabel}>Lĩnh vực</Text>
                {lifeArea ? (
                  <View style={[styles.areaBadge, { backgroundColor: Object.values(LIFE_AREAS).find(la => la.id === lifeArea)?.color + '20' }]}>
                    <Text style={[styles.areaBadgeText, { color: Object.values(LIFE_AREAS).find(la => la.id === lifeArea)?.color }]}>
                      {Object.values(LIFE_AREAS).find(la => la.id === lifeArea)?.label}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.optionValue}>Chọn</Text>
                )}
              </TouchableOpacity>

              {showLifeAreaSelector && (
                <View style={styles.lifeAreaGrid}>
                  {Object.values(LIFE_AREAS).map((area) => {
                    const isSelected = lifeArea === area.id;
                    return (
                      <TouchableOpacity
                        key={area.id}
                        style={[
                          styles.lifeAreaItem,
                          isSelected && { backgroundColor: area.color + '20', borderColor: area.color },
                        ]}
                        onPress={() => {
                          setLifeArea(isSelected ? null : area.id);
                          setShowLifeAreaSelector(false);
                        }}
                      >
                        <Text style={[styles.lifeAreaText, isSelected && { color: area.color }]}>
                          {area.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Tags */}
              <View style={styles.tagsSection}>
                <Text style={styles.optionLabel}>Tags</Text>
                <TagInput
                  tags={tags}
                  onTagsChange={setTags}
                  userId={userId}
                  placeholder="Thêm tag..."
                />
              </View>

              {/* Pin & Favorite */}
              <View style={styles.togglesRow}>
                <TouchableOpacity
                  style={[styles.toggleButton, isPinned && styles.toggleButtonActive]}
                  onPress={() => setIsPinned(!isPinned)}
                >
                  <Pin size={18} color={isPinned ? COLORS.gold : COLORS.textMuted} fill={isPinned ? COLORS.gold : 'transparent'} />
                  <Text style={[styles.toggleText, isPinned && styles.toggleTextActive]}>Ghim</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toggleButton, isFavorite && styles.toggleButtonActive]}
                  onPress={() => setIsFavorite(!isFavorite)}
                >
                  <Star size={18} color={isFavorite ? COLORS.gold : COLORS.textMuted} fill={isFavorite ? COLORS.gold : 'transparent'} />
                  <Text style={[styles.toggleText, isFavorite && styles.toggleTextActive]}>Yêu thích</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Mood Picker Modal */}
      <MoodPicker
        visible={showMoodPicker}
        onClose={() => setShowMoodPicker(false)}
        onSave={(data) => {
          setMood(data.mood);
          setShowMoodPicker(false);
        }}
        mode="select"
        initialData={{ mood }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgDarkest,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  headerTitleIcon: {
    marginRight: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerButton: {
    padding: SPACING.xs,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDarkest,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  // Template form styles
  templateFormContainer: {
    flex: 1,
  },
  templateDescription: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  templateDescriptionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  templateTooltip: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  templateTooltipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    fontStyle: 'italic',
  },
  typeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  typeOptions: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  typeOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  typeOptionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  titleInput: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    padding: SPACING.sm,
  },
  contentContainer: {
    marginBottom: SPACING.lg,
  },
  contentInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    minHeight: 200,
  },
  previewContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    padding: SPACING.md,
    minHeight: 200,
  },
  previewText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  previewPlaceholder: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  charCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  optionValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  moodBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  moodBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  areaBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  areaBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  lifeAreaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginVertical: SPACING.md,
  },
  lifeAreaItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lifeAreaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  tagsSection: {
    marginTop: SPACING.md,
  },
  togglesRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.sm,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.gold + '15',
    borderColor: COLORS.gold + '50',
  },
  toggleText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  toggleTextActive: {
    color: COLORS.gold,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default JournalEntryScreen;
