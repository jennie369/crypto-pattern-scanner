/**
 * JournalEntryScreen.js
 * Screen for creating/editing journal entries in Calendar Smart Journal
 *
 * Created: January 28, 2026
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
} from 'lucide-react-native';

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

// Entry type options
const ENTRY_TYPE_OPTIONS = [
  { id: ENTRY_TYPES.REFLECTION, label: 'Suy ngam', icon: BookOpen, color: COLORS.purple },
  { id: ENTRY_TYPES.GRATITUDE, label: 'Biet on', icon: Heart, color: COLORS.error },
  { id: ENTRY_TYPES.GOAL_NOTE, label: 'Ghi chu muc tieu', icon: Target, color: COLORS.info },
  { id: ENTRY_TYPES.QUICK_NOTE, label: 'Ghi nhanh', icon: FileText, color: COLORS.textSecondary },
];

const JournalEntryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Route params
  const { entryId, mode = 'create', date, entryType: initialType } = route.params || {};

  // State
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userTier, setUserTier] = useState('FREE');
  const [userRole, setUserRole] = useState(null);

  // Entry data
  const [entryType, setEntryType] = useState(initialType || ENTRY_TYPES.REFLECTION);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(null);
  const [lifeArea, setLifeArea] = useState(null);
  const [tags, setTags] = useState([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // UI state
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showLifeAreaSelector, setShowLifeAreaSelector] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Original data for change detection
  const originalData = useRef(null);

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
        .single();

      if (error) throw error;

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
      Alert.alert('Loi', 'Khong the tai bai viet');
    }
  };

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
      setHasChanges(content.trim().length > 0);
    }
  }, [entryType, title, content, mood, lifeArea, tags, isPinned, isFavorite, mode]);

  // Handle save
  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Loi', 'Vui long nhap noi dung');
      return;
    }

    if (!access.allowed) {
      Alert.alert('Han che', access.reason);
      return;
    }

    setSaving(true);

    try {
      const entryData = {
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

      let result;
      if (mode === 'edit' && entryId) {
        result = await updateJournalEntry(userId, entryId, entryData, userTier);
      } else {
        result = await createJournalEntry(userId, entryData, userTier, userRole);
      }

      if (result.success) {
        navigation.goBack();
      } else {
        Alert.alert('Loi', result.error || 'Khong the luu');
      }
    } catch (error) {
      console.error('[JournalEntry] Save error:', error);
      Alert.alert('Loi', 'Khong the luu bai viet');
    }

    setSaving(false);
  };

  // Handle delete
  const handleDelete = () => {
    Alert.alert(
      'Xoa bai viet',
      'Ban co chac muon xoa bai viet nay?',
      [
        { text: 'Huy', style: 'cancel' },
        {
          text: 'Xoa',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteJournalEntry(userId, entryId);
              if (result.success) {
                navigation.goBack();
              } else {
                Alert.alert('Loi', result.error);
              }
            } catch (error) {
              Alert.alert('Loi', 'Khong the xoa');
            }
          },
        },
      ]
    );
  };

  // Handle back with unsaved changes
  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        'Chua luu',
        'Ban co thay doi chua luu. Thoat khong luu?',
        [
          { text: 'Tiep tuc chinh sua', style: 'cancel' },
          {
            text: 'Thoat',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
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

        <Text style={styles.headerTitle}>
          {mode === 'edit' ? 'Chinh sua' : 'Viet moi'}
        </Text>

        <View style={styles.headerActions}>
          {mode === 'edit' && (
            <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
              <Trash2 size={20} color={COLORS.error} />
            )}
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            disabled={saving || !content.trim()}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.bgDarkest} />
            ) : (
              <>
                <Save size={18} color={COLORS.bgDarkest} />
              )}
                <Text style={styles.saveButtonText}>Luu</Text>
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
                  )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Title (optional) */}
          <TextInput
            style={styles.titleInput}
            placeholder="Tieu de (tuy chon)"
            placeholderTextColor={COLORS.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          {/* Content */}
          <View style={styles.contentContainer}>
            <TextInput
              style={styles.contentInput}
              placeholder={
                entryType === ENTRY_TYPES.GRATITUDE
                  ? 'Hom nay toi biet on...'
                  : entryType === ENTRY_TYPES.GOAL_NOTE
                  ? 'Ghi chu ve muc tieu...'
                  : 'Viet suy nghi cua ban...'
              }
              placeholderTextColor={COLORS.textMuted}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              maxLength={charLimit}
            />
            <Text style={styles.charCount}>
              {content.length}/{charLimit}
            </Text>
          </View>

          {/* Mood selector */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setShowMoodPicker(true)}
          >
            <Text style={styles.optionLabel}>Cam xuc</Text>
            {mood ? (
              <View style={[styles.moodBadge, { backgroundColor: MOODS[mood.toUpperCase()]?.color + '20' }]}>
                <Text style={[styles.moodBadgeText, { color: MOODS[mood.toUpperCase()]?.color }]}>
                  {MOODS[mood.toUpperCase()]?.label}
                </Text>
              </View>
            ) : (
              <Text style={styles.optionValue}>Chon</Text>
            )}
          </TouchableOpacity>

          {/* Life area selector */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setShowLifeAreaSelector(!showLifeAreaSelector)}
          >
            <Text style={styles.optionLabel}>Linh vuc</Text>
            {lifeArea ? (
              <View style={[styles.areaBadge, { backgroundColor: LIFE_AREAS.find(la => la.id === lifeArea)?.color + '20' }]}>
                <Text style={[styles.areaBadgeText, { color: LIFE_AREAS.find(la => la.id === lifeArea)?.color }]}>
                  {LIFE_AREAS.find(la => la.id === lifeArea)?.label}
                </Text>
              </View>
            ) : (
              <Text style={styles.optionValue}>Chon</Text>
            )}
          </TouchableOpacity>

          {showLifeAreaSelector && (
            <View style={styles.lifeAreaGrid}>
              {LIFE_AREAS.map((area) => {
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
                  )}
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
              placeholder="Them tag..."
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
              <Text style={[styles.toggleText, isFavorite && styles.toggleTextActive]}>Yeu thich</Text>
            </TouchableOpacity>
          </View>

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
