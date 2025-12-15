/**
 * VisionBoardScreen - V5 OPTIMIZED LAYOUT
 *
 * Features:
 * - Group widgets by TYPE (không trùng lặp)
 * - Progress Overview
 * - Goals Section with checkbox
 * - Affirmations với navigation
 * - Action Plan/Checklist (habits)
 * - Crystal Reminders
 * - Cross-navigation với GemMaster
 */

import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Modal,
  Pressable,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import {
  Target,
  Sparkles,
  Gem,
  ListChecks,
  Plus,
  ChevronRight,
  ChevronLeft,
  Settings,
  Volume2,
  Check,
  ArrowLeft,
  Edit3,
  Trash2,
  X,
  MessageCircle,
  BarChart3,
  Clock,
  Flame,
} from 'lucide-react-native';

import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

// =========== SVG ICONS FOR LIFE AREAS ===========
const FinanceIcon = ({ size = 28, color = '#10B981' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M12 6v12M9 9c0-1.5 1.5-2 3-2s3 .5 3 2-1 2-3 2-3 .5-3 2 1.5 2 3 2 3-.5 3-2" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const HeartIcon = ({ size = 28, color = '#EC4899' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={color} />
  </Svg>
);

const BriefcaseIcon = ({ size = 28, color = '#6366F1' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="7" width="20" height="14" rx="2" stroke={color} strokeWidth="2" />
    <Path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke={color} strokeWidth="2" />
    <Path d="M12 12v2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M2 12h20" stroke={color} strokeWidth="2" />
  </Svg>
);

const ActivityIcon = ({ size = 28, color = '#14B8A6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const StarIcon = ({ size = 28, color = '#F59E0B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={color} stroke={color} strokeWidth="1" />
  </Svg>
);

const SpiritualIcon = ({ size = 28, color = '#8B5CF6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="4" fill={color} />
    <Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
import { supabase } from '../../services/supabase';
import { getCardImage, getCardImageByName } from '../../assets/tarot';
import { getHexagramImage } from '../../assets/iching';
import { useAuth } from '../../contexts/AuthContext';
import { useTabBar } from '../../contexts/TabBarContext';
import CustomAlert from '../../components/Common/CustomAlert';
import SponsorBannerSection from '../../components/SponsorBannerSection';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, SHADOWS, BUTTON, INPUT, GRADIENTS } from '../../utils/tokens';

// Gamification imports
import {
  GamificationHeader,
  GamificationModals,
  HabitGridSection,
  useGamificationTracking,
} from './VisionBoardWithGamification';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 100;
const BOTTOM_PADDING = TAB_BAR_HEIGHT + 40;

// Life area options with SVG icons and Vietnamese names
const LIFE_AREAS = [
  { key: 'finance', label: 'Tài chính', Icon: FinanceIcon, color: '#10B981' },
  { key: 'relationships', label: 'Mối quan hệ', Icon: HeartIcon, color: '#EC4899' },
  { key: 'career', label: 'Sự nghiệp', Icon: BriefcaseIcon, color: '#6366F1' },
  { key: 'health', label: 'Sức khỏe', Icon: ActivityIcon, color: '#14B8A6' },
  { key: 'personal', label: 'Phát triển cá nhân', Icon: StarIcon, color: '#F59E0B' },
  { key: 'spiritual', label: 'Tâm linh', Icon: SpiritualIcon, color: '#8B5CF6' },
];

// =========== HELPER FUNCTIONS ===========

/**
 * Parse widget content - handle các format khác nhau từ database
 */
const parseWidgetContent = (widget) => {
  if (!widget) return null;

  let content = widget?.content;

  // If content is string, try to parse as JSON
  if (typeof content === 'string') {
    try {
      content = JSON.parse(content);
    } catch (e) {
      // Not valid JSON
      return { raw: content };
    }
  }

  return content || {};
};

/**
 * Extract affirmations from widget content
 */
const extractAffirmations = (content) => {
  if (!content) return [];

  // Handle: { affirmations: [...] }
  if (Array.isArray(content?.affirmations)) {
    return content.affirmations;
  }

  // Handle: direct array
  if (Array.isArray(content)) {
    return content;
  }

  // Handle: { text: '...' }
  if (content?.text) {
    return [content.text];
  }

  // Handle: raw string
  if (typeof content === 'string') {
    return [content];
  }

  // Handle: { raw: '...' } from JSON parse failure
  if (content?.raw) {
    return [content.raw];
  }

  return [];
};

/**
 * Extract habits/steps from widget content
 * IMPORTANT: widgetId is required to create unique IDs across multiple widgets
 */
const extractHabits = (content, widgetId = '') => {
  if (!content) return [];

  // Handle: { habits: [...] }
  if (Array.isArray(content?.habits)) {
    return content.habits.map((h, i) => ({
      ...h,
      id: h?.id ? `${widgetId}_${h.id}` : `${widgetId}_habit_${i}`,
      widgetId: widgetId,
    }));
  }

  // Handle: { steps: [...] }
  if (Array.isArray(content?.steps)) {
    return content.steps.map((step, i) => ({
      id: `${widgetId}_step_${i}`,
      widgetId: widgetId,
      title: step?.text || step?.title || step,
      completed: step?.completed || false,
    }));
  }

  // Handle: direct array
  if (Array.isArray(content)) {
    return content.map((item, i) => ({
      id: `${widgetId}_item_${i}`,
      widgetId: widgetId,
      title: item?.title || item?.text || item,
      completed: item?.completed || false,
    }));
  }

  return [];
};

/**
 * Extract goals from widget content
 * Handle multiple formats:
 * - [{ goalText, lifeArea, timeline }] (from GoalSettingForm via saveWidgetToVisionBoard)
 * - { goals: [...] }
 * - { goalText, title }
 *
 * IMPORTANT: widgetId is required to create unique IDs across multiple widgets
 */
const extractGoals = (content, widgetId = '') => {
  console.log('[extractGoals] Input:', widgetId, JSON.stringify(content)?.substring(0, 200));
  if (!content) return [];

  // Handle: { goals: [...] }
  if (Array.isArray(content?.goals)) {
    return content.goals.map((g, i) => ({
      ...g,
      id: g?.id || `${widgetId}_goal_${i}`,
      widgetId: widgetId,
    }));
  }

  // Handle: direct array from GoalSettingForm [{ goalText, lifeArea, timeline }]
  if (Array.isArray(content)) {
    return content.map((item, i) => ({
      id: `${widgetId}_goal_${i}`,
      widgetId: widgetId,
      title: item?.goalText || item?.title || item?.text || (typeof item === 'string' ? item : ''),
      completed: item?.completed || false,
      timeline: item?.timeline || null,
      lifeArea: item?.lifeArea || null,
    })).filter(g => g.title); // Only include items with title
  }

  // Handle: single goal object
  if (content?.goalText || content?.title) {
    return [{
      id: `${widgetId}_goal_0`,
      widgetId: widgetId,
      title: content?.goalText || content?.title,
      completed: content?.completed || false,
      timeline: content?.timeline || null,
      lifeArea: content?.lifeArea || null,
    }];
  }

  return [];
};

// Helper functions to check widget types (including legacy types)
// These are module-level to avoid recreation on every render
const isGoalType = (type) => type === 'goal' || type === 'GOAL_CARD' || type === 'CROSS_DOMAIN_CARD' || type === 'STATS_WIDGET';
const isAffirmationType = (type) => type === 'affirmation' || type === 'AFFIRMATION_CARD';
const isHabitType = (type) => type === 'habit' || type === 'steps' || type === 'action_plan' || type === 'ACTION_CHECKLIST';
const isCrystalType = (type) => type === 'crystal' || type === 'CRYSTAL_GRID';
const isReadingType = (type) => type === 'tarot' || type === 'iching';

// Life area label mapping
const LIFE_AREA_LABELS = {
  finance: { label: 'Tài chính', color: '#10B981' },
  career: { label: 'Sự nghiệp', color: '#6366F1' },
  health: { label: 'Sức khỏe', color: '#EF4444' },
  relationships: { label: 'Mối quan hệ', color: '#EC4899' },
  personal: { label: 'Phát triển bản thân', color: '#8B5CF6' },
  spiritual: { label: 'Tâm linh', color: '#F59E0B' },
};

/**
 * Extract lifeArea from widget content
 * Try multiple locations where lifeArea might be stored
 * UPDATED: Returns 'personal' as fallback instead of null to ensure widgets are grouped
 */
const extractLifeArea = (content, useFallback = true) => {
  if (!content) return useFallback ? 'personal' : null;

  // Direct lifeArea (most common for affirmation/action_plan)
  if (content?.lifeArea) return content.lifeArea;

  // From array (goal widgets from GoalSettingForm)
  if (Array.isArray(content) && content[0]?.lifeArea) return content[0].lifeArea;

  // From goals array
  if (content?.goals && Array.isArray(content.goals) && content.goals[0]?.lifeArea) {
    return content.goals[0].lifeArea;
  }

  // From affirmations object with lifeArea
  if (content?.affirmations && content?.lifeArea) return content.lifeArea;

  // From steps/habits object with lifeArea
  if ((content?.steps || content?.habits) && content?.lifeArea) return content.lifeArea;

  // Check for metadata.lifeArea
  if (content?.metadata?.lifeArea) return content.metadata.lifeArea;

  // FALLBACK: Return 'personal' (Phát triển bản thân) for widgets from ChatBot
  // This ensures new widgets are always visible in a tab
  return useFallback ? 'personal' : null;
};

// =========== WIDGET COMPONENTS ===========

// Selectable Goal Tabs - User clicks to see related content
// COMPACT VERSION: Small chips with count badge + "All" button
const GoalTabs = memo(({
  groupedByLifeArea,
  selectedLifeArea,
  onSelectLifeArea,
}) => {
  const lifeAreas = Object.keys(groupedByLifeArea.groups);

  if (lifeAreas.length === 0) return null;

  // Calculate total goals count
  const totalGoals = lifeAreas.reduce((sum, area) => {
    return sum + (groupedByLifeArea.groups[area]?.goalWidgets?.length || 0);
  }, 0);

  // Check if "All" is selected (selectedLifeArea is null or 'all')
  const isAllSelected = selectedLifeArea === null || selectedLifeArea === 'all';

  return (
    <View style={styles.goalTabsContainer}>
      <View style={styles.goalTabsTitleRow}>
        <Target size={18} color={COLORS.gold} />
        <Text style={styles.goalTabsTitle}>Mục tiêu của tôi</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.goalTabsScroll}
      >
        {/* ALL Button - Shows all goals */}
        <TouchableOpacity
          style={[
            styles.goalTabCompact,
            isAllSelected && styles.goalTabCompactSelected,
            { borderColor: isAllSelected ? COLORS.gold : 'rgba(255,255,255,0.2)' },
            isAllSelected && { backgroundColor: `${COLORS.gold}20` },
          ]}
          onPress={() => onSelectLifeArea('all')}
          activeOpacity={0.7}
        >
          <Target size={12} color={isAllSelected ? COLORS.gold : COLORS.textMuted} />
          <Text style={[
            styles.goalTabTextCompact,
            isAllSelected && { color: COLORS.gold, fontWeight: '700' },
          ]}>
            Tất cả
          </Text>
          <View style={[styles.goalCountBadge, { backgroundColor: `${COLORS.gold}30` }]}>
            <Text style={[styles.goalCountText, { color: COLORS.gold }]}>{totalGoals}</Text>
          </View>
        </TouchableOpacity>

        {/* Individual life area tabs */}
        {lifeAreas.map((lifeArea) => {
          const areaInfo = LIFE_AREA_LABELS[lifeArea] || { label: lifeArea, color: COLORS.gold };
          const isSelected = selectedLifeArea === lifeArea;
          // Count goals in this lifeArea
          const goalCount = groupedByLifeArea.groups[lifeArea]?.goalWidgets?.length || 0;

          return (
            <TouchableOpacity
              key={lifeArea}
              style={[
                styles.goalTabCompact,
                isSelected && styles.goalTabCompactSelected,
                { borderColor: isSelected ? areaInfo.color : 'rgba(255,255,255,0.2)' },
                isSelected && { backgroundColor: `${areaInfo.color}20` },
              ]}
              onPress={() => onSelectLifeArea(isSelected ? 'all' : lifeArea)}
              activeOpacity={0.7}
            >
              <Target size={12} color={isSelected ? areaInfo.color : COLORS.textMuted} />
              <Text style={[
                styles.goalTabTextCompact,
                isSelected && { color: areaInfo.color, fontWeight: '700' },
              ]}>
                {areaInfo.label}
              </Text>
              {/* Count badge */}
              <View style={[styles.goalCountBadge, { backgroundColor: `${areaInfo.color}30` }]}>
                <Text style={[styles.goalCountText, { color: areaInfo.color }]}>{goalCount}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

/**
 * AnimatedCheckButton - Check button with "Done!" text animation
 * Shows small animated text next to button when pressed
 */
const AnimatedCheckButton = memo(({ onPress, buttonStyle, isPrimary = true }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-10)).current;

  const handlePress = useCallback(() => {
    // Reset and play animation
    fadeAnim.setValue(0);
    translateX.setValue(-10);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Fade out after a delay
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 10,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }, 600);
    });

    // Call original onPress
    onPress?.();
  }, [fadeAnim, translateX, onPress]);

  return (
    <View style={styles.animatedCheckContainer}>
      <Animated.Text
        style={[
          styles.doneText,
          {
            opacity: fadeAnim,
            transform: [{ translateX }],
          },
        ]}
      >
        Done!
      </Animated.Text>
      <TouchableOpacity
        style={[
          styles.affirmationMiniBtn,
          isPrimary && styles.affirmationMiniBtnPrimary,
          buttonStyle,
        ]}
        onPress={handlePress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Check size={14} color={isPrimary ? "#000" : COLORS.gold} />
      </TouchableOpacity>
    </View>
  );
});

/**
 * Editable Affirmation Item - Inline editing for individual affirmations
 */
const EditableAffirmationItem = memo(({
  index,
  text,
  widgetId,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  onReadAloud,
  onAffirmationComplete,
  isSelectionMode,
  isSelected,
  onLongPress,
  onToggleSelect,
  itemId,
}) => {
  const [editText, setEditText] = useState(text);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditText(text);
  }, [text]);

  const handleSave = () => {
    if (editText.trim() && editText.trim() !== text) {
      onSave(index, editText.trim());
    } else {
      onCancel();
    }
  };

  const handleCancel = () => {
    setEditText(text);
    onCancel();
  };

  if (isEditing) {
    return (
      <View style={styles.affirmationEditContainer}>
        <TextInput
          ref={inputRef}
          style={styles.affirmationEditInput}
          value={editText}
          onChangeText={setEditText}
          onBlur={handleSave}
          onSubmitEditing={handleSave}
          multiline
          returnKeyType="done"
          blurOnSubmit={true}
          placeholder="Nhập câu khẳng định..."
          placeholderTextColor={COLORS.textMuted}
        />
        <View style={styles.affirmationEditActions}>
          <TouchableOpacity
            style={styles.affirmationEditBtn}
            onPress={handleCancel}
          >
            <X size={16} color={COLORS.error} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.affirmationEditBtn, styles.affirmationEditBtnSave]}
            onPress={handleSave}
          >
            <Check size={16} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.affirmationListItem,
        isSelectionMode && isSelected && styles.affirmationListItemSelected
      ]}
      onLongPress={() => onLongPress?.(itemId)}
      onPress={() => isSelectionMode ? onToggleSelect?.(itemId) : onStartEdit()}
      activeOpacity={0.7}
      delayLongPress={500}
    >
      {/* Selection checkbox */}
      {isSelectionMode && (
        <TouchableOpacity
          style={[
            styles.selectionCheckboxSmall,
            isSelected && styles.selectionCheckboxSelected
          ]}
          onPress={() => onToggleSelect?.(itemId)}
        >
          {isSelected && <Check size={10} color="#fff" />}
        </TouchableOpacity>
      )}
      <View style={styles.affirmationListContent}>
        <Text style={styles.affirmationListNumber}>{index + 1}.</Text>
        <Text style={styles.affirmationListText}>"{text}"</Text>
      </View>
      <View style={styles.affirmationListActions}>
        {/* Edit hint icon */}
        <TouchableOpacity
          style={styles.affirmationMiniBtn}
          onPress={onStartEdit}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Edit3 size={14} color={COLORS.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.affirmationMiniBtn}
          onPress={() => onReadAloud?.(text)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Volume2 size={14} color={COLORS.gold} />
        </TouchableOpacity>
        <AnimatedCheckButton
          onPress={() => onAffirmationComplete?.()}
          isPrimary={true}
        />
      </View>
    </TouchableOpacity>
  );
});

/**
 * Editable Action Step Item - Inline editing for individual action steps
 */
const EditableActionStepItem = memo(({
  index,
  step,
  widgetId,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  onToggleComplete,
  isSelectionMode,
  isSelected,
  onLongPress,
  onToggleSelect,
}) => {
  const [editText, setEditText] = useState(step?.title || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditText(step?.title || '');
  }, [step?.title]);

  const handleSave = () => {
    if (editText.trim() && editText.trim() !== step?.title) {
      onSave(index, editText.trim());
    } else {
      onCancel();
    }
  };

  const handleCancel = () => {
    setEditText(step?.title || '');
    onCancel();
  };

  const stepItemId = step?.id || `step_${widgetId}_${index}`;

  if (isEditing) {
    return (
      <View style={styles.actionStepEditContainer}>
        <View style={[
          styles.actionStepCheckbox,
          step?.completed && styles.actionStepCheckboxDone
        ]}>
          {step?.completed && <Check size={12} color="#fff" />}
        </View>
        <TextInput
          ref={inputRef}
          style={styles.actionStepEditInput}
          value={editText}
          onChangeText={setEditText}
          onBlur={handleSave}
          onSubmitEditing={handleSave}
          multiline
          returnKeyType="done"
          blurOnSubmit={true}
          placeholder="Nhập bước hành động..."
          placeholderTextColor={COLORS.textMuted}
        />
        <View style={styles.actionStepEditActions}>
          <TouchableOpacity
            style={styles.actionStepEditBtn}
            onPress={handleCancel}
          >
            <X size={14} color={COLORS.error} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionStepEditBtn, styles.actionStepEditBtnSave]}
            onPress={handleSave}
          >
            <Check size={14} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.actionStepItem,
        isSelectionMode && isSelected && styles.actionStepItemSelected
      ]}
      onPress={() => isSelectionMode ? onToggleSelect?.(stepItemId) : onToggleComplete?.(step?.id)}
      onLongPress={() => onLongPress?.(stepItemId)}
      delayLongPress={500}
    >
      {/* Selection checkbox */}
      {isSelectionMode && (
        <TouchableOpacity
          style={[
            styles.selectionCheckboxSmall,
            isSelected && styles.selectionCheckboxSelected
          ]}
          onPress={() => onToggleSelect?.(stepItemId)}
        >
          {isSelected && <Check size={10} color="#fff" />}
        </TouchableOpacity>
      )}
      <View style={[
        styles.actionStepCheckbox,
        step?.completed && styles.actionStepCheckboxDone
      ]}>
        {step?.completed && <Check size={12} color="#fff" />}
      </View>
      <Text style={[
        styles.actionStepText,
        step?.completed && styles.actionStepTextDone
      ]} numberOfLines={2}>
        {step?.title}
      </Text>
      {/* Edit action step button */}
      <TouchableOpacity
        style={styles.editStepBtn}
        onPress={onStartEdit}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Edit3 size={12} color={COLORS.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

/**
 * Individual Goal Card - Renders a single goal with its linked affirmations and action plan
 * Links are determined by:
 * 1. Explicit goalId in content (if present)
 * 2. Title matching (if title contains similar text)
 * 3. Creation timestamp proximity (within 60 seconds)
 */
const IndividualGoalCard = memo(({
  goalWidget,
  affirmationWidgets,
  actionPlanWidgets,
  areaInfo,
  onToggleHabit,
  onToggleGoalComplete,
  onDelete,
  onDeleteMultiple,
  onEdit,
  onEditGoalTitle,
  onEditAffirmation,
  onEditActionStep,
  onSaveAffirmation,
  onSaveGoalTitle,
  onSaveActionStep,
  onAffirmationComplete,
  onReadAloud,
  completedToday,
  streak,
  isExpanded,
  onToggleExpand,
  isSelectionMode,
  selectedItems,
  onLongPress,
  onToggleSelect,
}) => {
  // State for inline editing
  const [editingAffirmationIndex, setEditingAffirmationIndex] = useState(null);
  const [editingGoalTitle, setEditingGoalTitle] = useState(false);
  const [editingActionStepIndex, setEditingActionStepIndex] = useState(null);
  const [goalTitleText, setGoalTitleText] = useState('');
  const goalTitleInputRef = useRef(null);

  // Focus input when editing goal title
  useEffect(() => {
    if (editingGoalTitle && goalTitleInputRef.current) {
      goalTitleInputRef.current.focus();
    }
  }, [editingGoalTitle]);

  const goalContent = parseWidgetContent(goalWidget);
  const goals = extractGoals(goalContent, goalWidget?.id);
  const goalTitle = goals[0]?.title || goalWidget?.title || 'Mục tiêu';
  const goalCompleted = goals[0]?.completed || false;
  const goalItemId = goals[0]?.id || `${goalWidget?.id}_goal_0`;
  const goalCreatedAt = new Date(goalWidget?.created_at || 0).getTime();

  // Find linked affirmation widget by:
  // 1. goalId match in content (if explicitly stored)
  // 2. goalId match in data field (for legacy widgets)
  // 3. Title similarity
  // 4. Created within 60 seconds of goal
  const linkedAffirmationWidget = affirmationWidgets.find(w => {
    const content = parseWidgetContent(w);
    // Check explicit goalId in content
    if (content?.goalId === goalWidget?.id) return true;
    // Check goalId in data field (legacy format)
    if (w?.data?.goalId === goalWidget?.id) return true;
    // Check title match (for widgets without goalId)
    if (w?.title && goalWidget?.title && w.title.includes(goalWidget.title.substring(0, 20))) return true;
    // Check timestamp proximity (within 60 seconds)
    const createdAt = new Date(w?.created_at || 0).getTime();
    if (Math.abs(createdAt - goalCreatedAt) < 60000) return true;
    return false;
  });

  // Find linked action plan widget similarly
  const linkedActionPlanWidget = actionPlanWidgets.find(w => {
    const content = parseWidgetContent(w);
    // Check explicit goalId in content
    if (content?.goalId === goalWidget?.id) return true;
    // Check goalId in data field (legacy format)
    if (w?.data?.goalId === goalWidget?.id) return true;
    // Check title match
    if (w?.title && goalWidget?.title && w.title.includes(goalWidget.title.substring(0, 20))) return true;
    // Check timestamp proximity
    const createdAt = new Date(w?.created_at || 0).getTime();
    if (Math.abs(createdAt - goalCreatedAt) < 60000) return true;
    return false;
  });

  // Extract affirmations from linked widget
  const affirmations = linkedAffirmationWidget
    ? extractAffirmations(parseWidgetContent(linkedAffirmationWidget)).filter(a => a && typeof a === 'string' && a.trim())
    : [];

  // Extract action steps from linked widget
  const actionSteps = linkedActionPlanWidget
    ? extractHabits(parseWidgetContent(linkedActionPlanWidget), linkedActionPlanWidget?.id)
    : [];

  // Calculate progress
  const completedSteps = actionSteps.filter(s => s?.completed).length;
  const totalSteps = actionSteps.length;
  const stepsPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Collect all widget IDs for this goal card
  const allWidgetIdsForThisGoal = [goalWidget?.id];
  if (linkedAffirmationWidget?.id) allWidgetIdsForThisGoal.push(linkedAffirmationWidget.id);
  if (linkedActionPlanWidget?.id) allWidgetIdsForThisGoal.push(linkedActionPlanWidget.id);
  const validIds = allWidgetIdsForThisGoal.filter(id => id);

  // Handle start editing goal title
  const handleStartEditGoalTitle = () => {
    setGoalTitleText(goalTitle);
    setEditingGoalTitle(true);
  };

  // Handle save goal title
  const handleSaveGoalTitleLocal = () => {
    if (goalTitleText.trim() && goalTitleText.trim() !== goalTitle) {
      onSaveGoalTitle?.(goalWidget, goalTitleText.trim());
    }
    setEditingGoalTitle(false);
  };

  // Handle cancel goal title edit
  const handleCancelGoalTitle = () => {
    setGoalTitleText(goalTitle);
    setEditingGoalTitle(false);
  };

  return (
    <View style={[styles.individualGoalCard, { borderColor: `${areaInfo.color}40` }]}>
      {/* Goal Header - Expandable */}
      <TouchableOpacity
        style={[styles.individualGoalHeader, { backgroundColor: `${areaInfo.color}15` }]}
        onPress={onToggleExpand}
        onLongPress={() => onLongPress?.(goalWidget?.id)}
        activeOpacity={0.7}
        delayLongPress={500}
      >
        {/* Selection checkbox in selection mode */}
        {isSelectionMode && (
          <TouchableOpacity
            style={[
              styles.selectionCheckbox,
              selectedItems?.has(goalWidget?.id) && styles.selectionCheckboxSelected
            ]}
            onPress={() => onToggleSelect?.(goalWidget?.id)}
          >
            {selectedItems?.has(goalWidget?.id) && <Check size={12} color="#fff" />}
          </TouchableOpacity>
        )}
        {/* Goal completion checkbox - always visible */}
        {!isSelectionMode && (
          <TouchableOpacity
            style={[
              styles.goalCompleteCheckbox,
              goalCompleted && styles.goalCompleteCheckboxDone,
              { borderColor: goalCompleted ? COLORS.success : areaInfo.color }
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onToggleGoalComplete?.(goalItemId);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {goalCompleted && <Check size={14} color="#fff" />}
          </TouchableOpacity>
        )}
        <View style={styles.individualGoalHeaderLeft}>
          <Target size={18} color={goalCompleted ? COLORS.success : areaInfo.color} />
          <View style={styles.individualGoalTitleContainer}>
            {editingGoalTitle ? (
              <View style={styles.goalTitleEditContainer}>
                <TextInput
                  ref={goalTitleInputRef}
                  style={styles.goalTitleEditInput}
                  value={goalTitleText}
                  onChangeText={setGoalTitleText}
                  onBlur={handleSaveGoalTitleLocal}
                  onSubmitEditing={handleSaveGoalTitleLocal}
                  multiline
                  returnKeyType="done"
                  blurOnSubmit={true}
                  placeholder="Nhập tên mục tiêu..."
                  placeholderTextColor={COLORS.textMuted}
                />
                <View style={styles.goalTitleEditActions}>
                  <TouchableOpacity
                    style={styles.goalTitleEditBtn}
                    onPress={handleCancelGoalTitle}
                  >
                    <X size={14} color={COLORS.error} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.goalTitleEditBtn, styles.goalTitleEditBtnSave]}
                    onPress={handleSaveGoalTitleLocal}
                  >
                    <Check size={14} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={styles.individualGoalTitle} numberOfLines={2}>
                {goalTitle}
              </Text>
            )}
            {!editingGoalTitle && (
              <View style={styles.individualGoalMeta}>
                {affirmations.length > 0 && (
                  <View style={styles.individualGoalMetaItem}>
                    <Sparkles size={10} color="#FF6B9D" />
                    <Text style={styles.individualGoalMetaText}>{affirmations.length}</Text>
                  </View>
                )}
                {actionSteps.length > 0 && (
                  <View style={styles.individualGoalMetaItem}>
                    <ListChecks size={10} color="#6C63FF" />
                    <Text style={styles.individualGoalMetaText}>{completedSteps}/{totalSteps}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
        {/* Edit goal title button */}
        {!editingGoalTitle && (
          <TouchableOpacity
            style={styles.editGoalTitleBtn}
            onPress={(e) => {
              e.stopPropagation();
              handleStartEditGoalTitle();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Edit3 size={14} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
        <ChevronRight
          size={20}
          color={COLORS.textMuted}
          style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}
        />
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.individualGoalContent}>
          {/* Affirmations */}
          {affirmations.length > 0 && (
            <View style={styles.selectedAffirmationSection}>
              <View style={styles.selectedSectionHeader}>
                <Sparkles size={16} color="#FF6B9D" />
                <Text style={styles.selectedSectionTitle}>Khẳng định</Text>
                <Text style={[styles.selectedSectionProgress, { color: '#FF6B9D' }]}>
                  {affirmations.length} câu
                </Text>
              </View>

              {affirmations.map((aff, index) => {
                const affItemId = `aff_${linkedAffirmationWidget?.id}_${index}`;
                return (
                  <EditableAffirmationItem
                    key={index}
                    index={index}
                    text={aff}
                    widgetId={linkedAffirmationWidget?.id}
                    isEditing={editingAffirmationIndex === index}
                    onStartEdit={() => setEditingAffirmationIndex(index)}
                    onSave={(idx, newText) => {
                      onSaveAffirmation?.(linkedAffirmationWidget, idx, newText);
                      setEditingAffirmationIndex(null);
                    }}
                    onCancel={() => setEditingAffirmationIndex(null)}
                    onReadAloud={onReadAloud}
                    onAffirmationComplete={onAffirmationComplete}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedItems?.has(affItemId)}
                    onLongPress={onLongPress}
                    onToggleSelect={onToggleSelect}
                    itemId={affItemId}
                  />
                );
              })}
            </View>
          )}

          {/* Action Plan */}
          {actionSteps.length > 0 && (
            <View style={styles.selectedActionPlanSection}>
              <View style={styles.selectedSectionHeader}>
                <ListChecks size={16} color="#6C63FF" />
                <Text style={styles.selectedSectionTitle}>Kế hoạch hành động</Text>
                <Text style={[styles.selectedSectionProgress, { color: '#6C63FF' }]}>
                  {completedSteps}/{totalSteps}
                </Text>
              </View>

              {actionSteps.map((step, index) => {
                const stepItemId = step?.id || `step_${linkedActionPlanWidget?.id}_${index}`;
                return (
                  <EditableActionStepItem
                    key={stepItemId}
                    index={index}
                    step={step}
                    widgetId={linkedActionPlanWidget?.id}
                    isEditing={editingActionStepIndex === index}
                    onStartEdit={() => setEditingActionStepIndex(index)}
                    onSave={(idx, newText) => {
                      onSaveActionStep?.(linkedActionPlanWidget, idx, newText);
                      setEditingActionStepIndex(null);
                    }}
                    onCancel={() => setEditingActionStepIndex(null)}
                    onToggleComplete={onToggleHabit}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedItems?.has(stepItemId)}
                    onLongPress={onLongPress}
                    onToggleSelect={onToggleSelect}
                  />
                );
              })}

              <View style={styles.actionStepProgress}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, styles.progressFillPurple, { width: `${stepsPercent}%` }]} />
                </View>
                <Text style={[styles.progressPercent, { color: '#6C63FF' }]}>{stepsPercent}%</Text>
              </View>
            </View>
          )}

          {/* No content messages */}
          {affirmations.length === 0 && actionSteps.length === 0 && (
            <View style={styles.noContentSection}>
              <Text style={styles.noContentText}>
                Chưa có khẳng định và kế hoạch cho mục tiêu này
              </Text>
            </View>
          )}

          {/* Delete this goal and linked widgets - FIXED: use onDeleteMultiple instead of forEach */}
          <TouchableOpacity
            style={styles.deleteIndividualGoalBtn}
            onPress={() => {
              onDeleteMultiple?.(validIds, `Xóa mục tiêu "${goalTitle}" và các widgets liên quan?`);
            }}
          >
            <Trash2 size={12} color="#E74C3C" />
            <Text style={styles.deleteIndividualGoalText}>Xóa mục tiêu này</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

// Selected Goal Content - Shows SEPARATED goals with their own affirmations and action steps
const SelectedGoalContent = memo(({
  lifeArea,
  group,
  onToggleHabit,
  onToggleGoalComplete,
  onDelete,
  onDeleteMultiple,
  onEdit,
  onEditGoalTitle,
  onEditAffirmation,
  onEditActionStep,
  onSaveAffirmation,
  onSaveGoalTitle,
  onSaveActionStep,
  onAffirmationComplete,
  onReadAloud,
  completedToday,
  streak,
}) => {
  // Track which goals are expanded
  const [expandedGoals, setExpandedGoals] = useState({});
  // Multi-select state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  if (!group) return null;

  const areaInfo = LIFE_AREA_LABELS[lifeArea] || { label: lifeArea, color: COLORS.gold };

  // Get all widgets from group
  const goalWidgets = group.goalWidgets || [];
  const affirmationWidgets = group.affirmationWidgets || [];
  const actionPlanWidgets = group.actionPlanWidgets || [];

  // Toggle expand for a specific goal
  const handleToggleExpand = (goalId) => {
    setExpandedGoals(prev => ({
      ...prev,
      [goalId]: !prev[goalId],
    }));
  };

  // Handle long press - enter selection mode
  const handleLongPress = (itemId) => {
    setIsSelectionMode(true);
    setSelectedItems(new Set([itemId]));
  };

  // Toggle item selection
  const handleToggleSelect = (itemId) => {
    if (!isSelectionMode) return;
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Cancel selection mode
  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedItems(new Set());
  };

  // Delete selected items
  const handleDeleteSelected = () => {
    if (selectedItems.size > 0) {
      onDeleteMultiple?.(Array.from(selectedItems), `Xóa ${selectedItems.size} mục đã chọn?`);
      handleCancelSelection();
    }
  };

  // If no goal widgets, show fallback with all affirmations and action plans
  if (goalWidgets.length === 0) {
    // Show all affirmations and action plans without a goal
    const allAffirmations = [...new Set(
      affirmationWidgets.flatMap(w => extractAffirmations(parseWidgetContent(w)))
        .filter(a => a && typeof a === 'string' && a.trim())
    )];

    const allActionSteps = actionPlanWidgets.flatMap(w =>
      extractHabits(parseWidgetContent(w), w?.id)
    );

    const completedSteps = allActionSteps.filter(s => s?.completed).length;
    const totalSteps = allActionSteps.length;
    const stepsPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    const allWidgetIds = [
      ...affirmationWidgets.map(w => w?.id),
      ...actionPlanWidgets.map(w => w?.id),
    ].filter(id => id);

    return (
      <View style={[styles.selectedGoalContent, { borderColor: `${areaInfo.color}30` }]}>
        <View style={[styles.selectedGoalHeader, { backgroundColor: `${areaInfo.color}15` }]}>
          <Target size={20} color={areaInfo.color} />
          <View style={styles.selectedGoalHeaderText}>
            <Text style={[styles.selectedGoalLabel, { color: areaInfo.color }]}>
              {areaInfo.label}
            </Text>
            <Text style={styles.selectedGoalTitle}>Widgets chưa có mục tiêu</Text>
          </View>
        </View>

        {allAffirmations.length > 0 && (
          <View style={styles.selectedAffirmationSection}>
            <View style={styles.selectedSectionHeader}>
              <Sparkles size={18} color="#FF6B9D" />
              <Text style={styles.selectedSectionTitle}>Khẳng định</Text>
              <Text style={[styles.selectedSectionProgress, { color: '#FF6B9D' }]}>
                {allAffirmations.length} câu
              </Text>
            </View>
            {allAffirmations.map((aff, index) => (
              <View key={index} style={styles.affirmationListItem}>
                <View style={styles.affirmationListContent}>
                  <Text style={styles.affirmationListNumber}>{index + 1}.</Text>
                  <Text style={styles.affirmationListText}>"{aff}"</Text>
                </View>
                <View style={styles.affirmationListActions}>
                  <TouchableOpacity
                    style={styles.affirmationMiniBtn}
                    onPress={() => onReadAloud?.(aff)}
                  >
                    <Volume2 size={14} color={COLORS.gold} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.affirmationMiniBtn, styles.affirmationMiniBtnPrimary]}
                    onPress={() => onAffirmationComplete?.()}
                  >
                    <Check size={14} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {allActionSteps.length > 0 && (
          <View style={styles.selectedActionPlanSection}>
            <View style={styles.selectedSectionHeader}>
              <ListChecks size={18} color="#6C63FF" />
              <Text style={styles.selectedSectionTitle}>Kế hoạch hành động</Text>
              <Text style={[styles.selectedSectionProgress, { color: '#6C63FF' }]}>
                {completedSteps}/{totalSteps}
              </Text>
            </View>
            {allActionSteps.map((step, index) => (
              <TouchableOpacity
                key={step?.id || `step_${index}`}
                style={styles.actionStepItem}
                onPress={() => onToggleHabit?.(step?.id)}
              >
                <View style={[
                  styles.actionStepCheckbox,
                  step?.completed && styles.actionStepCheckboxDone
                ]}>
                  {step?.completed && <Check size={12} color="#fff" />}
                </View>
                <Text style={[
                  styles.actionStepText,
                  step?.completed && styles.actionStepTextDone
                ]}>
                  {step?.title}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.actionStepProgress}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, styles.progressFillPurple, { width: `${stepsPercent}%` }]} />
              </View>
              <Text style={[styles.progressPercent, { color: '#6C63FF' }]}>{stepsPercent}%</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.deleteGoalGroupBtn}
          onPress={() => onDeleteMultiple?.(allWidgetIds, 'Xóa tất cả widgets trong nhóm này?')}
        >
          <Trash2 size={14} color="#E74C3C" />
          <Text style={styles.deleteGoalGroupText}>Xóa tất cả widgets</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Collect all widget IDs for batch delete
  const allWidgetIds = [
    ...goalWidgets.map(w => w?.id),
    ...affirmationWidgets.map(w => w?.id),
    ...actionPlanWidgets.map(w => w?.id),
  ].filter(id => id);

  // MAIN: Render each goal widget as a separate card
  // REMOVED: lifeAreaHeader and statsBar - user requested cleaner UI
  return (
    <View style={styles.selectedGoalContentList}>
      {/* Selection mode bar - keep for delete functionality */}
      {isSelectionMode && (
        <View style={styles.selectionModeBar}>
          <Text style={styles.selectionModeText}>
            Đã chọn {selectedItems.size} mục
          </Text>
          <View style={styles.selectionModeActions}>
            <TouchableOpacity
              style={styles.selectionModeBtn}
              onPress={handleCancelSelection}
            >
              <X size={16} color={COLORS.textMuted} />
              <Text style={styles.selectionModeBtnText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.selectionModeBtn, styles.selectionModeBtnDanger]}
              onPress={handleDeleteSelected}
            >
              <Trash2 size={16} color="#E74C3C" />
              <Text style={[styles.selectionModeBtnText, { color: '#E74C3C' }]}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Render each goal separately */}
      {goalWidgets.map((goalWidget, index) => (
        <IndividualGoalCard
          key={goalWidget?.id || `goal_${index}`}
          goalWidget={goalWidget}
          affirmationWidgets={affirmationWidgets}
          actionPlanWidgets={actionPlanWidgets}
          areaInfo={areaInfo}
          onToggleHabit={onToggleHabit}
          onToggleGoalComplete={onToggleGoalComplete}
          onDelete={onDelete}
          onDeleteMultiple={onDeleteMultiple}
          onEdit={onEdit}
          onEditGoalTitle={onEditGoalTitle}
          onEditAffirmation={onEditAffirmation}
          onEditActionStep={onEditActionStep}
          onSaveAffirmation={onSaveAffirmation}
          onSaveGoalTitle={onSaveGoalTitle}
          onSaveActionStep={onSaveActionStep}
          onAffirmationComplete={onAffirmationComplete}
          onReadAloud={onReadAloud}
          completedToday={completedToday}
          streak={streak}
          isExpanded={expandedGoals[goalWidget?.id] ?? (index === 0)}
          onToggleExpand={() => handleToggleExpand(goalWidget?.id)}
          isSelectionMode={isSelectionMode}
          selectedItems={selectedItems}
          onLongPress={handleLongPress}
          onToggleSelect={handleToggleSelect}
        />
      ))}
    </View>
  );
});

// Progress Overview Card with Tooltips
const ProgressOverview = memo(({ stats, onNavigateToGemMaster }) => {
  const [showTooltip, setShowTooltip] = useState(null);

  const tooltips = {
    goals: 'Số mục tiêu đã tick hoàn thành / tổng số mục tiêu',
    affirmations: 'Số lần bạn đã đọc khẳng định hôm nay',
    habits: '% bước hành động trong checklist đã hoàn thành',
  };

  return (
    <View style={styles.overviewCard}>
      <View style={styles.overviewHeader}>
        <BarChart3 size={20} color={COLORS.gold} />
        <Text style={styles.overviewTitle}>Tổng quan hôm nay</Text>
      </View>
      <View style={styles.overviewStats}>
        <TouchableOpacity
          style={styles.overviewStat}
          onPress={() => setShowTooltip(showTooltip === 'goals' ? null : 'goals')}
          activeOpacity={0.7}
        >
          <Text style={styles.overviewValue}>
            {stats?.goalsCompleted || 0}/{stats?.goalsTotal || 0}
          </Text>
          <Text style={styles.overviewLabel}>Mục tiêu</Text>
          {showTooltip === 'goals' && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>{tooltips.goals}</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.overviewDivider} />
        <TouchableOpacity
          style={styles.overviewStat}
          onPress={() => setShowTooltip(showTooltip === 'affirmations' ? null : 'affirmations')}
          activeOpacity={0.7}
        >
          <Text style={styles.overviewValue}>{stats?.affirmationsCompleted || 0}</Text>
          <Text style={styles.overviewLabel}>Khẳng định</Text>
          {showTooltip === 'affirmations' && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>{tooltips.affirmations}</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.overviewDivider} />
        <TouchableOpacity
          style={styles.overviewStat}
          onPress={() => setShowTooltip(showTooltip === 'habits' ? null : 'habits')}
          activeOpacity={0.7}
        >
          <Text style={styles.overviewValue}>{stats?.habitsPercent || 0}%</Text>
          <Text style={styles.overviewLabel}>Thói quen</Text>
          {showTooltip === 'habits' && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>{tooltips.habits}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Quick link to GemMaster */}
      <TouchableOpacity
        style={styles.quickLinkButton}
        onPress={onNavigateToGemMaster}
      >
        <MessageCircle size={16} color={COLORS.gold} />
        <Text style={styles.quickLinkText}>Chat với Gem Master để thêm widget</Text>
        <ChevronRight size={16} color={COLORS.gold} />
      </TouchableOpacity>
    </View>
  );
});

// Goals Section Component
const GoalsSection = memo(({
  goals,
  widgets,
  onToggle,
  onEdit,
  onDelete,
  onNavigateToGemMaster
}) => {
  const completedCount = goals.filter(g => g?.completed).length;
  const total = goals.length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  // Get goal widgets for edit/delete (use helper function for legacy type support)
  const goalWidgets = widgets?.filter(w => isGoalType(w?.type)) || [];

  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Target size={20} color="#4ECDC4" />
          <Text style={styles.sectionTitle}>Mục tiêu hôm nay</Text>
        </View>
        {goalWidgets.length > 0 && (
          <View style={styles.sectionActions}>
            <TouchableOpacity
              style={styles.sectionActionBtn}
              onPress={() => onEdit?.(goalWidgets[0])}
            >
              <Edit3 size={16} color={COLORS.gold} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sectionActionBtn}
              onPress={() => onDelete?.(goalWidgets[0]?.id)}
            >
              <Trash2 size={16} color="#E74C3C" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {total === 0 ? (
        <TouchableOpacity
          style={styles.emptyState}
          onPress={onNavigateToGemMaster}
        >
          <Text style={styles.emptyText}>Chưa có mục tiêu nào</Text>
          <Text style={styles.emptyHint}>Nhấn để tạo với Gem Master</Text>
        </TouchableOpacity>
      ) : (
        <>
          {goals.map((goal, index) => (
            <TouchableOpacity
              key={goal?.id || index}
              style={styles.checklistItem}
              onPress={() => onToggle?.(goal?.id, 'goal')}
            >
              <View style={[
                styles.checkbox,
                styles.checkboxTeal,
                goal?.completed && styles.checkboxCheckedTeal
              ]}>
                {goal?.completed && <Check size={14} color="#000" />}
              </View>
              <Text style={[
                styles.checklistText,
                goal?.completed && styles.checklistTextCompleted
              ]}>
                {goal?.title || 'Mục tiêu'}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Tiến độ:</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, styles.progressFillTeal, { width: `${percent}%` }]} />
            </View>
            <Text style={[styles.progressPercent, { color: '#4ECDC4' }]}>{percent}%</Text>
          </View>
        </>
      )}
    </View>
  );
});

// Affirmations Section Component
const AffirmationsSection = memo(({
  affirmations,
  widgets,
  currentIndex,
  completedToday,
  streak,
  onReadAloud,
  onComplete,
  onNext,
  onPrev,
  onEdit,
  onDelete,
}) => {
  const total = affirmations.length;
  const currentAffirmation = affirmations[currentIndex] || '';

  // Get affirmation widgets for edit/delete (use helper function for legacy type support)
  const affirmationWidgets = widgets?.filter(w => isAffirmationType(w?.type)) || [];

  if (total === 0) return null;

  return (
    <View style={[styles.sectionCard, styles.affirmationCard]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Sparkles size={20} color="#FF6B9D" />
          <Text style={styles.sectionTitle}>Khẳng định hôm nay</Text>
        </View>
        {affirmationWidgets.length > 0 && (
          <View style={styles.sectionActions}>
            <TouchableOpacity
              style={styles.sectionActionBtn}
              onPress={() => onEdit?.(affirmationWidgets[0])}
            >
              <Edit3 size={16} color={COLORS.gold} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sectionActionBtn}
              onPress={() => onDelete?.(affirmationWidgets[0]?.id)}
            >
              <Trash2 size={16} color="#E74C3C" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Affirmation Content */}
      <View style={styles.affirmationContent}>
        <Text style={styles.affirmationLabel}>Affirmation:</Text>
        <Text style={styles.affirmationText}>"{currentAffirmation}"</Text>
      </View>

      {/* Action buttons */}
      <View style={styles.affirmationActions}>
        <TouchableOpacity style={styles.affirmationBtn} onPress={onReadAloud}>
          <Volume2 size={18} color={COLORS.gold} />
          <Text style={styles.affirmationBtnText}>Đọc to</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.affirmationBtn, styles.affirmationBtnPrimary]}
          onPress={onComplete}
        >
          <Check size={18} color="#000" />
          <Text style={styles.affirmationBtnTextPrimary}>Hoàn thành</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation */}
      <View style={styles.affirmationNav}>
        <TouchableOpacity onPress={onPrev} disabled={currentIndex === 0}>
          <ChevronLeft size={24} color={currentIndex === 0 ? COLORS.textMuted : COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.affirmationIndex}>{currentIndex + 1} / {total}</Text>
        <TouchableOpacity onPress={onNext} disabled={currentIndex >= total - 1}>
          <ChevronRight size={24} color={currentIndex >= total - 1 ? COLORS.textMuted : COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.affirmationStats}>
        <View style={styles.affirmationStatItem}>
          <Check size={14} color="#4ECDC4" />
          <Text style={styles.affirmationStatText}>
            Hoàn thành {completedToday}x hôm nay
          </Text>
        </View>
        <View style={styles.affirmationStatItem}>
          <Flame size={14} color="#FF6B6B" />
          <Text style={styles.affirmationStatText}>
            {streak}-day streak
          </Text>
        </View>
      </View>
    </View>
  );
});

// Action Plan/Habits Section Component
const ActionPlanSection = memo(({
  habits,
  widgets,
  onToggle,
  onEdit,
  onDelete,
  onNavigateToGemMaster,
}) => {
  const completedCount = habits.filter(h => h?.completed).length;
  const total = habits.length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  // Get habit/steps/action_plan widgets for edit/delete (use helper function for legacy type support)
  const habitWidgets = widgets?.filter(w => isHabitType(w?.type)) || [];

  return (
    <View style={[styles.sectionCard, styles.actionPlanCard]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <ListChecks size={20} color="#6C63FF" />
          <Text style={styles.sectionTitle}>Kế hoạch hành động</Text>
        </View>
        {habitWidgets.length > 0 && (
          <View style={styles.sectionActions}>
            <TouchableOpacity
              style={styles.sectionActionBtn}
              onPress={() => onEdit?.(habitWidgets[0])}
            >
              <Edit3 size={16} color={COLORS.gold} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sectionActionBtn}
              onPress={() => onDelete?.(habitWidgets[0]?.id)}
            >
              <Trash2 size={16} color="#E74C3C" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {total === 0 ? (
        <TouchableOpacity
          style={styles.emptyState}
          onPress={onNavigateToGemMaster}
        >
          <Text style={styles.emptyText}>Chưa có kế hoạch hành động</Text>
          <Text style={styles.emptyHint}>Nhấn để tạo với Gem Master</Text>
        </TouchableOpacity>
      ) : (
        <>
          {habits.map((habit, index) => (
            <TouchableOpacity
              key={habit?.id || index}
              style={styles.checklistItem}
              onPress={() => onToggle?.(habit?.id, 'habit')}
            >
              <View style={[
                styles.checkbox,
                styles.checkboxPurple,
                habit?.completed && styles.checkboxCheckedPurple
              ]}>
                {habit?.completed && <Check size={14} color="#fff" />}
              </View>
              <Text style={[
                styles.checklistText,
                habit?.completed && styles.checklistTextCompleted
              ]}>
                {habit?.title || habit?.text || 'Thói quen'}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Hoàn thành:</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, styles.progressFillPurple, { width: `${percent}%` }]} />
            </View>
            <Text style={[styles.progressPercent, { color: '#6C63FF' }]}>{percent}%</Text>
          </View>
        </>
      )}

      <Text style={styles.hintText}>Tick vào mỗi mục sau khi hoàn thành</Text>
    </View>
  );
});

// Crystal Section Component
const CrystalSection = memo(({
  crystals,
  widgets,
  onEdit,
  onDelete,
}) => {
  // Get crystal widgets (use helper function for legacy type support)
  const crystalWidgets = widgets?.filter(w => isCrystalType(w?.type)) || [];

  if (crystals.length === 0) return null;

  return (
    <View style={[styles.sectionCard, styles.crystalCard]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Gem size={20} color="#9B59B6" />
          <Text style={styles.sectionTitle}>Crystal của tôi</Text>
        </View>
        {crystalWidgets.length > 0 && (
          <View style={styles.sectionActions}>
            <TouchableOpacity
              style={styles.sectionActionBtn}
              onPress={() => onEdit?.(crystalWidgets[0])}
            >
              <Edit3 size={16} color={COLORS.gold} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sectionActionBtn}
              onPress={() => onDelete?.(crystalWidgets[0]?.id)}
            >
              <Trash2 size={16} color="#E74C3C" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {crystals.map((crystal, index) => (
        <View key={index} style={styles.crystalItem}>
          <View style={styles.crystalIcon}>
            <Gem size={24} color="#9B59B6" />
          </View>
          <View style={styles.crystalInfo}>
            <Text style={styles.crystalName}>{crystal?.name || 'Crystal'}</Text>
            {crystal?.purpose && (
              <Text style={styles.crystalPurpose}>{crystal.purpose}</Text>
            )}
            {crystal?.reminder && (
              <View style={styles.crystalReminderRow}>
                <Clock size={12} color={COLORS.gold} />
                <Text style={styles.crystalReminder}>{crystal.reminder}</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
});

// =========== READINGS SECTION (Tarot & I Ching) - COLLAPSIBLE ===========
const ReadingsSection = memo(({
  readings,
  widgets,
  onEdit,
  onDelete,
  onNavigateToTarot,
  onNavigateToIChing,
}) => {
  // Toggle state for collapsible section
  const [isExpanded, setIsExpanded] = useState(false);

  // Get reading widgets (use helper function)
  const readingWidgets = widgets?.filter(w => isReadingType(w?.type)) || [];

  if (readings.length === 0) return null;

  // Get icon and label based on reading type
  const getReadingDisplay = (reading) => {
    if (reading.type === 'tarot') {
      return {
        icon: <Sparkles size={20} color="#E91E63" />,
        iconSmall: <Sparkles size={16} color="#E91E63" />,
        label: 'Tarot',
        color: '#E91E63',
      };
    } else {
      return {
        icon: <SpiritualIcon size={20} color="#8B5CF6" />,
        iconSmall: <SpiritualIcon size={16} color="#8B5CF6" />,
        label: 'Kinh Dịch',
        color: '#8B5CF6',
      };
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Get interpretation text from tarot card
  const getCardInterpretation = (card) => {
    return card.meaning || card.interpretation || card.reversedMeaning || card.uprightMeaning || null;
  };

  // Get I Ching interpretation
  const getIChingInterpretation = (content) => {
    return content.interpretation || content.meaning || content.judgement || content.description || null;
  };

  return (
    <View style={[styles.sectionCard, styles.readingsCard]}>
      {/* Collapsible Header */}
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.sectionTitleRow}>
          <Sparkles size={20} color="#E91E63" />
          <Text style={styles.sectionTitle}>Trải Bài & Gieo Quẻ</Text>
          <View style={styles.readingsCountBadge}>
            <Text style={styles.readingsCountText}>{readings.length}</Text>
          </View>
        </View>
        <View style={styles.toggleIcon}>
          {isExpanded ? (
            <ChevronRight size={20} color={COLORS.textMuted} style={{ transform: [{ rotate: '90deg' }] }} />
          ) : (
            <ChevronRight size={20} color={COLORS.textMuted} />
          )}
        </View>
      </TouchableOpacity>

      {/* Collapsible Content */}
      {isExpanded && (
        <>
          {readings.map((reading, index) => {
            const display = getReadingDisplay(reading);
            const content = reading.content || {};

            return (
              <View key={reading.id || index} style={[styles.readingItem, { borderLeftColor: display.color }]}>
                <View style={styles.readingHeader}>
                  <View style={styles.readingTypeRow}>
                    {display.iconSmall}
                    <Text style={[styles.readingTypeLabel, { color: display.color }]}>{display.label}</Text>
                  </View>
                  <View style={styles.readingActions}>
                    <TouchableOpacity
                      style={styles.sectionActionBtn}
                      onPress={() => onDelete?.(reading.id)}
                    >
                      <Trash2 size={14} color="#E74C3C" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* For Tarot - show card IMAGES + INTERPRETATION */}
                {reading.type === 'tarot' && content.cards && content.cards.length > 0 && (
                  <>
                    <View style={styles.tarotCardsRow}>
                      {content.cards.slice(0, 3).map((card, cardIdx) => {
                        // Try to get image by ID first, then fallback to Vietnamese name
                        const cardImage = card.id
                          ? getCardImage(card.id)
                          : getCardImageByName(card.vietnamese || card.name);
                        return (
                          <View key={cardIdx} style={styles.tarotCardContainer}>
                            {cardImage ? (
                              <Image
                                source={cardImage}
                                style={[
                                  styles.tarotCardImage,
                                  card.isReversed && styles.tarotCardReversed,
                                ]}
                                resizeMode="cover"
                              />
                            ) : (
                              <View style={styles.tarotCardPlaceholder}>
                                <Sparkles size={20} color="#E91E63" />
                              </View>
                            )}
                            <Text style={styles.tarotCardPosition}>{card.position || SPREAD_POSITIONS?.[cardIdx] || ''}</Text>
                            <Text style={styles.tarotCardName} numberOfLines={1}>{card.vietnamese || card.name}</Text>
                          </View>
                        );
                      })}
                    </View>

                    {/* Tarot Interpretation */}
                    {(content.interpretation || content.overallMeaning || content.cards?.some(c => getCardInterpretation(c))) && (
                      <View style={styles.interpretationContainer}>
                        <Text style={styles.interpretationLabel}>Luận giải:</Text>
                        {content.interpretation || content.overallMeaning ? (
                          <Text style={styles.interpretationText} numberOfLines={4}>
                            {content.interpretation || content.overallMeaning}
                          </Text>
                        ) : (
                          content.cards?.slice(0, 3).map((card, idx) => {
                            const interpretation = getCardInterpretation(card);
                            if (!interpretation) return null;
                            return (
                              <Text key={idx} style={styles.cardInterpretation} numberOfLines={2}>
                                • {card.vietnamese || card.name}: {interpretation}
                              </Text>
                            );
                          })
                        )}
                      </View>
                    )}
                  </>
                )}

                {/* For I Ching - show hexagram IMAGE + NAME + INTERPRETATION */}
                {reading.type === 'iching' && (
                  <>
                    <View style={styles.ichingContainer}>
                      {/* Hexagram Image */}
                      {content.hexagramNumber && (
                        <View style={styles.hexagramImageContainer}>
                          {getHexagramImage(content.hexagramNumber) ? (
                            <Image
                              source={getHexagramImage(content.hexagramNumber)}
                              style={styles.hexagramImage}
                              resizeMode="contain"
                            />
                          ) : (
                            <View style={styles.hexagramPlaceholder}>
                              <SpiritualIcon size={32} color="#8B5CF6" />
                            </View>
                          )}
                        </View>
                      )}
                      {/* Hexagram Info */}
                      <View style={styles.hexagramInfo}>
                        <Text style={styles.hexagramNumber}>Quẻ #{content.hexagramNumber || '?'}</Text>
                        <Text style={styles.hexagramName}>
                          {content.hexagramName || content.vietnameseName || 'Quẻ'}
                        </Text>
                        {content.chineseName && (
                          <Text style={styles.hexagramChinese}>{content.chineseName}</Text>
                        )}
                      </View>
                    </View>

                    {/* I Ching Interpretation */}
                    {getIChingInterpretation(content) && (
                      <View style={styles.interpretationContainer}>
                        <Text style={styles.interpretationLabel}>Luận giải:</Text>
                        <Text style={styles.interpretationText} numberOfLines={4}>
                          {getIChingInterpretation(content)}
                        </Text>
                      </View>
                    )}
                  </>
                )}

                {/* Notes preview */}
                {content.notes && (
                  <Text style={styles.readingNotes} numberOfLines={2}>
                    {content.notes}
                  </Text>
                )}

                {/* Date */}
                <View style={styles.readingFooter}>
                  <Clock size={12} color={COLORS.textMuted} />
                  <Text style={styles.readingDate}>{formatDate(reading.created_at)}</Text>
                </View>
              </View>
            );
          })}

          {/* Links to Tarot/IChing */}
          <View style={styles.readingsLinksRow}>
            <TouchableOpacity
              style={styles.readingsLinkBtn}
              onPress={() => onNavigateToTarot?.()}
            >
              <Sparkles size={14} color="#E91E63" />
              <Text style={[styles.readingsLinkText, { color: '#E91E63' }]}>Xem Tarot</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.readingsLinkBtn}
              onPress={() => onNavigateToIChing?.()}
            >
              <SpiritualIcon size={14} color="#8B5CF6" />
              <Text style={[styles.readingsLinkText, { color: '#8B5CF6' }]}>Gieo quẻ</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
});

// =========== MAIN SCREEN ===========

const VisionBoardScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  // Try to get tab bar context
  let tabBarContext = null;
  try {
    tabBarContext = useTabBar();
  } catch (e) {
    // Context not available
  }

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [widgets, setWidgets] = useState([]);
  const [alertConfig, setAlertConfig] = useState({ visible: false });

  // Affirmation state
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0);
  const [affirmationsCompletedToday, setAffirmationsCompletedToday] = useState(0);
  const [affirmationStreak, setAffirmationStreak] = useState(0);

  // Selected goal state - which lifeArea goal is currently selected
  const [selectedGoalLifeArea, setSelectedGoalLifeArea] = useState(null);
  // Track affirmation index per lifeArea
  const [goalAffirmationIndexes, setGoalAffirmationIndexes] = useState({});

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);
  const [widgetForm, setWidgetForm] = useState({
    type: 'affirmation',
    title: '',
    content: '',
  });

  // NEW: Multi-step modal state for goal selection flow
  const [modalStep, setModalStep] = useState(1); // 1: lifeArea, 2: scenarios, 3: manual form
  const [selectedLifeArea, setSelectedLifeArea] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [loadingScenarios, setLoadingScenarios] = useState(false);

  // Gamification state
  const [showStreakHistory, setShowStreakHistory] = useState(false);

  // Gamification tracking hooks
  const { trackAffirmation, trackHabit, trackGoal } = useGamificationTracking();

  // =========== AGGREGATE DATA BY TYPE ===========

  // Combine all goals from all goal widgets (pass widget.id for unique keys)
  const goalWidgets = widgets.filter(w => isGoalType(w?.type));
  console.log('[VisionBoard] Goal widgets found:', goalWidgets.length, goalWidgets.map(w => ({ id: w.id, type: w.type, title: w.title })));

  const allGoals = goalWidgets.flatMap(w => {
    const content = parseWidgetContent(w);
    console.log('[VisionBoard] Parsed goal content for', w.id, ':', JSON.stringify(content)?.substring(0, 300));
    return extractGoals(content, w?.id);
  });
  console.log('[VisionBoard] All extracted goals:', allGoals.length, allGoals.map(g => g.title));

  // Combine all affirmations from all affirmation widgets (dedupe)
  const allAffirmations = [...new Set(
    widgets
      .filter(w => isAffirmationType(w?.type))
      .flatMap(w => extractAffirmations(parseWidgetContent(w)))
      .filter(a => a && typeof a === 'string' && a.trim())
  )];

  // Combine all habits/steps from habit, steps, and action_plan widgets (pass widget.id for unique keys)
  const allHabits = widgets
    .filter(w => isHabitType(w?.type))
    .flatMap(w => extractHabits(parseWidgetContent(w), w?.id));

  // Combine all crystals
  const allCrystals = widgets
    .filter(w => isCrystalType(w?.type))
    .map(w => {
      const content = parseWidgetContent(w);
      return {
        name: content?.crystalName || content?.vietnameseName || content?.name || w?.title || 'Crystal',
        purpose: content?.purpose || content?.reason || '',
        reminder: content?.reminder || null,
      };
    });

  // Combine all readings (tarot and iching)
  const allReadings = widgets
    .filter(w => isReadingType(w?.type))
    .map(w => ({
      id: w?.id,
      type: w?.type,
      title: w?.title,
      content: parseWidgetContent(w),
      created_at: w?.created_at,
    }));

  // Current affirmation
  const currentAffirmation = allAffirmations[currentAffirmationIndex] || '';

  // Check if empty
  const isVisionBoardEmpty = widgets.length === 0;

  // Stats for overview
  const stats = {
    goalsCompleted: allGoals.filter(g => g?.completed).length,
    goalsTotal: allGoals.length,
    affirmationsCompleted: affirmationsCompletedToday,
    habitsPercent: allHabits.length > 0
      ? Math.round((allHabits.filter(h => h?.completed).length / allHabits.length) * 100)
      : 0,
  };

  // =========== GROUP WIDGETS BY LIFE AREA ===========
  // Find widgets that have lifeArea and group them together
  // Strategy: First find all goal widgets with lifeArea, then find matching affirmation/action_plan
  // UPDATED: Group widgets by lifeArea - supports MULTIPLE widgets per lifeArea
  const groupedByLifeArea = useMemo(() => {
    const groups = {};
    const ungroupedWidgets = [];
    const ungroupedAffirmationWidgets = [];
    const ungroupedActionPlanWidgets = [];

    // Debug: Log all widgets content
    console.log('[VisionBoard] Grouping widgets, total:', widgets.length);

    // First pass: Find all goal widgets with lifeArea (including legacy types)
    // UPDATED: Store ARRAY of goalWidgets instead of single widget
    widgets.forEach(w => {
      if (isGoalType(w?.type)) {
        const content = parseWidgetContent(w);
        const lifeArea = extractLifeArea(content); // Now returns 'personal' as fallback
        console.log('[VisionBoard] Goal widget:', w?.id, 'type:', w?.type, 'lifeArea:', lifeArea, 'content:', JSON.stringify(content).substring(0, 200));

        if (lifeArea) {
          if (!groups[lifeArea]) {
            groups[lifeArea] = {
              goalWidgets: [], // ARRAY instead of single widget
              affirmationWidgets: [], // ARRAY for multiple affirmations
              actionPlanWidgets: [], // ARRAY for multiple action plans
            };
          }
          groups[lifeArea].goalWidgets.push(w); // PUSH instead of replace
        } else {
          ungroupedWidgets.push(w);
        }
      }
    });

    // Second pass: Find affirmation/action_plan widgets (including legacy types)
    widgets.forEach(w => {
      const isAff = isAffirmationType(w?.type);
      const isHab = isHabitType(w?.type) && !isGoalType(w?.type); // Exclude goals
      if (isAff || isHab) {
        const content = parseWidgetContent(w);
        const lifeArea = extractLifeArea(content); // Now returns 'personal' as fallback
        console.log('[VisionBoard]', w?.type, 'widget:', w?.id, 'lifeArea:', lifeArea, 'content:', JSON.stringify(content).substring(0, 200));

        if (lifeArea && groups[lifeArea]) {
          // Found matching lifeArea in existing group - PUSH to arrays
          if (isAff) groups[lifeArea].affirmationWidgets.push(w);
          if (isHab) groups[lifeArea].actionPlanWidgets.push(w);
        } else if (lifeArea && !groups[lifeArea]) {
          // Has lifeArea but no matching goal - create new group
          groups[lifeArea] = {
            goalWidgets: [],
            affirmationWidgets: isAff ? [w] : [],
            actionPlanWidgets: isHab ? [w] : [],
          };
        } else {
          // No lifeArea - track separately for fallback linking
          if (isAff) {
            ungroupedAffirmationWidgets.push(w);
          } else {
            ungroupedActionPlanWidgets.push(w);
          }
          ungroupedWidgets.push(w);
        }
      }
    });

    // Third pass: FALLBACK - Link ungrouped affirmation/action_plan to groups that don't have them
    // This handles the case where old widgets don't have lifeArea stored
    const groupKeys = Object.keys(groups);
    if (groupKeys.length > 0) {
      // If we have groups with goals but missing affirmation/action_plan, link ungrouped ones
      groupKeys.forEach(lifeArea => {
        const group = groups[lifeArea];

        // If group has goals but no affirmation, link ungrouped affirmations
        if (group.goalWidgets.length > 0 && group.affirmationWidgets.length === 0 && ungroupedAffirmationWidgets.length > 0) {
          const affWidget = ungroupedAffirmationWidgets.shift(); // Take first one
          group.affirmationWidgets.push(affWidget);
          // Remove from ungroupedWidgets
          const idx = ungroupedWidgets.findIndex(w => w?.id === affWidget?.id);
          if (idx !== -1) ungroupedWidgets.splice(idx, 1);
          console.log('[VisionBoard] FALLBACK: Linked affirmation', affWidget?.id, 'to group', lifeArea);
        }

        // If group has goals but no action_plan, link ungrouped action_plans
        if (group.goalWidgets.length > 0 && group.actionPlanWidgets.length === 0 && ungroupedActionPlanWidgets.length > 0) {
          const apWidget = ungroupedActionPlanWidgets.shift(); // Take first one
          group.actionPlanWidgets.push(apWidget);
          // Remove from ungroupedWidgets
          const idx = ungroupedWidgets.findIndex(w => w?.id === apWidget?.id);
          if (idx !== -1) ungroupedWidgets.splice(idx, 1);
          console.log('[VisionBoard] FALLBACK: Linked action_plan', apWidget?.id, 'to group', lifeArea);
        }
      });
    }

    // Fourth pass: All other widget types go to ungrouped (crystals, iching, tarot, etc.)
    widgets.forEach(w => {
      // Skip if already processed (goal, affirmation, habit types)
      if (!isGoalType(w?.type) && !isAffirmationType(w?.type) && !isHabitType(w?.type)) {
        ungroupedWidgets.push(w);
      }
    });

    console.log('[VisionBoard] Groups:', Object.keys(groups));
    Object.entries(groups).forEach(([key, group]) => {
      console.log('[VisionBoard]', key, '- goals:', group.goalWidgets.length, 'affs:', group.affirmationWidgets.length, 'actions:', group.actionPlanWidgets.length);
    });
    console.log('[VisionBoard] Ungrouped:', ungroupedWidgets.length);

    return { groups, ungroupedWidgets };
  }, [widgets]);

  // Get ungrouped widgets (use helper functions for legacy type support)
  const ungroupedGoals = groupedByLifeArea.ungroupedWidgets
    .filter(w => isGoalType(w?.type))
    .flatMap(w => extractGoals(parseWidgetContent(w), w?.id));

  const ungroupedAffirmations = [...new Set(
    groupedByLifeArea.ungroupedWidgets
      .filter(w => isAffirmationType(w?.type))
      .flatMap(w => extractAffirmations(parseWidgetContent(w)))
      .filter(a => a && typeof a === 'string' && a.trim())
  )];

  const ungroupedHabits = groupedByLifeArea.ungroupedWidgets
    .filter(w => isHabitType(w?.type) && !isGoalType(w?.type))
    .flatMap(w => extractHabits(parseWidgetContent(w), w?.id));

  // Check if there are grouped widgets
  const hasGroupedWidgets = Object.keys(groupedByLifeArea.groups).length > 0;

  // =========== TAB BAR VISIBILITY ===========
  useFocusEffect(
    useCallback(() => {
      if (tabBarContext?.resetTabBar) {
        tabBarContext.resetTabBar();
      }
      if (tabBarContext?.showTabBar) {
        tabBarContext.showTabBar();
      }
    }, [tabBarContext])
  );

  // =========== DATA FETCHING ===========
  const fetchWidgets = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vision_board_widgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[VisionBoard] Query error:', error.message);
        setWidgets([]);
      } else {
        console.log('[VisionBoard] Loaded widgets:', data?.length || 0);
        setWidgets(data || []);
      }
    } catch (err) {
      console.error('[VisionBoard] Error:', err);
      setWidgets([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  // Re-fetch widgets when screen gets focus (e.g., after coming back from GemMaster)
  useFocusEffect(
    useCallback(() => {
      console.log('[VisionBoard] Screen focused - refreshing widgets');
      fetchWidgets();
    }, [fetchWidgets])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWidgets();
    setRefreshing(false);
  }, [fetchWidgets]);

  // =========== NAVIGATION ===========
  const navigateToGemMaster = useCallback((prompt = '') => {
    console.log('[VisionBoard] Navigating to GemMaster with prompt:', prompt);

    // Navigate to GemMaster tab and pass initialPrompt
    // Use reset to ensure clean navigation state
    if (prompt) {
      navigation.navigate('GemMaster', {
        screen: 'GemMasterMain',
        params: { initialPrompt: prompt },
      });
    } else {
      navigation.navigate('GemMaster');
    }
  }, [navigation]);

  // =========== HANDLERS ===========

  // Toggle checkbox for goals/habits
  // itemId format: "widgetId_goal_0" or "widgetId_step_0"
  const handleToggleItem = useCallback(async (itemId, type) => {
    // Extract widgetId from itemId (format: "widgetId_goal_0" or "widgetId_step_0")
    // The widgetId is everything before the last "_goal_" or "_step_" or "_habit_" or "_item_"
    const widgetIdMatch = itemId.match(/^(.+?)_(goal|step|habit|item)_\d+$/);
    const widgetId = widgetIdMatch ? widgetIdMatch[1] : null;

    console.log('[VisionBoard] Toggle:', { itemId, type, widgetId });

    // Update local state first for instant feedback
    setWidgets(prev => prev.map(w => {
      // Only update the specific widget that contains this item
      if (type === 'goal' && isGoalType(w?.type) && w?.id === widgetId) {
        const content = parseWidgetContent(w);
        // For goal widgets from GoalSettingForm, content is an array like [{goalText, lifeArea}]
        // We need to update the item at the correct index
        if (Array.isArray(content)) {
          // Extract the index from itemId (last part after _)
          const indexMatch = itemId.match(/_goal_(\d+)$/);
          const index = indexMatch ? parseInt(indexMatch[1], 10) : -1;
          if (index >= 0 && index < content.length) {
            const updatedContent = [...content];
            updatedContent[index] = {
              ...updatedContent[index],
              completed: !updatedContent[index]?.completed,
            };
            return {
              ...w,
              content: updatedContent,
            };
          }
        }
        // Handle { goals: [...] } format
        if (content?.goals) {
          const updatedGoals = content.goals.map((g, i) => {
            const goalId = `${widgetId}_goal_${i}`;
            return goalId === itemId ? { ...g, completed: !g.completed } : g;
          });
          return {
            ...w,
            content: { ...content, goals: updatedGoals },
          };
        }
        return w;
      }

      if ((type === 'habit') && (w?.type === 'habit' || w?.type === 'steps' || w?.type === 'action_plan') && w?.id === widgetId) {
        const content = parseWidgetContent(w);
        // Handle { steps: [...] } format (from action_plan)
        if (content?.steps) {
          const indexMatch = itemId.match(/_step_(\d+)$/);
          const index = indexMatch ? parseInt(indexMatch[1], 10) : -1;
          if (index >= 0 && index < content.steps.length) {
            const updatedSteps = [...content.steps];
            updatedSteps[index] = {
              ...updatedSteps[index],
              completed: !updatedSteps[index]?.completed,
            };
            return {
              ...w,
              content: { ...content, steps: updatedSteps },
            };
          }
        }
        // Handle { habits: [...] } format
        if (content?.habits) {
          const updatedHabits = content.habits.map((h, i) => {
            const habitId = `${widgetId}_habit_${i}`;
            return habitId === itemId ? { ...h, completed: !h.completed } : h;
          });
          return {
            ...w,
            content: { ...content, habits: updatedHabits },
          };
        }
        return w;
      }
      return w;
    }));

    // Track gamification based on type
    if (type === 'habit') {
      await trackHabit();

      // Auto-track goal when ALL action plan steps are completed
      // Find the widget and check if all steps are now done
      const targetWidget = widgets.find(w => w?.id === widgetId);
      if (targetWidget && (targetWidget.type === 'action_plan' || targetWidget.type === 'steps')) {
        const content = parseWidgetContent(targetWidget);
        if (content?.steps) {
          // Get current step index
          const indexMatch = itemId.match(/_step_(\d+)$/);
          const index = indexMatch ? parseInt(indexMatch[1], 10) : -1;

          // Check if all steps will be completed after this toggle
          const allStepsCompleted = content.steps.every((step, i) => {
            if (i === index) {
              // This is the step being toggled - it will become completed
              return !step?.completed;
            }
            return step?.completed;
          });

          if (allStepsCompleted) {
            console.log('[Gamification] All action plan steps completed - auto-tracking goal');
            await trackGoal();
          }
        }
      }
    } else if (type === 'goal') {
      await trackGoal();
    }

    // Sync to database - update widget content
    try {
      // Find the widget to get its updated content
      const widgetToUpdate = widgets.find(w => w?.id === widgetId);
      if (widgetToUpdate) {
        let updatedContent;
        const content = parseWidgetContent(widgetToUpdate);

        if (type === 'goal' && isGoalType(widgetToUpdate?.type)) {
          if (Array.isArray(content)) {
            const indexMatch = itemId.match(/_goal_(\d+)$/);
            const index = indexMatch ? parseInt(indexMatch[1], 10) : -1;
            if (index >= 0 && index < content.length) {
              const updatedArray = [...content];
              updatedArray[index] = {
                ...updatedArray[index],
                completed: !content[index]?.completed,
              };
              updatedContent = updatedArray;
            }
          } else if (content?.goals) {
            const updatedGoals = content.goals.map((g, i) => {
              const goalId = `${widgetId}_goal_${i}`;
              return goalId === itemId ? { ...g, completed: !g.completed } : g;
            });
            updatedContent = { ...content, goals: updatedGoals };
          }
        } else if (type === 'habit') {
          if (content?.steps) {
            const indexMatch = itemId.match(/_step_(\d+)$/);
            const index = indexMatch ? parseInt(indexMatch[1], 10) : -1;
            if (index >= 0 && index < content.steps.length) {
              const updatedSteps = [...content.steps];
              updatedSteps[index] = {
                ...updatedSteps[index],
                completed: !content.steps[index]?.completed,
              };
              updatedContent = { ...content, steps: updatedSteps };
            }
          } else if (content?.habits) {
            const updatedHabits = content.habits.map((h, i) => {
              const habitId = `${widgetId}_habit_${i}`;
              return habitId === itemId ? { ...h, completed: !h.completed } : h;
            });
            updatedContent = { ...content, habits: updatedHabits };
          }
        }

        if (updatedContent) {
          const { error } = await supabase
            .from('vision_board_widgets')
            .update({ content: updatedContent })
            .eq('id', widgetId);

          if (error) {
            console.error('[VisionBoard] Sync error:', error);
          } else {
            console.log('[VisionBoard] Synced to database:', widgetId);
          }
        }
      }
    } catch (err) {
      console.error('[VisionBoard] Sync error:', err);
    }
  }, [widgets, trackHabit, trackGoal]);

  // Affirmation handlers - Text to Speech
  const handleReadAloud = useCallback(async () => {
    if (!currentAffirmation) return;

    try {
      // Stop any ongoing speech first
      await Speech.stop();

      // Speak the affirmation in Vietnamese
      await Speech.speak(currentAffirmation, {
        language: 'vi-VN',
        pitch: 1.0,
        rate: 0.9,
      });
    } catch (error) {
      console.error('Speech error:', error);
    }
  }, [currentAffirmation]);

  const handleAffirmationComplete = useCallback(async () => {
    setAffirmationsCompletedToday(prev => prev + 1);
    // No popup - just track silently, button will show checkmark animation
    await trackAffirmation();
  }, [trackAffirmation]);

  const handleNextAffirmation = useCallback(() => {
    if (currentAffirmationIndex < allAffirmations.length - 1) {
      setCurrentAffirmationIndex(prev => prev + 1);
    }
  }, [currentAffirmationIndex, allAffirmations.length]);

  const handlePrevAffirmation = useCallback(() => {
    if (currentAffirmationIndex > 0) {
      setCurrentAffirmationIndex(prev => prev - 1);
    }
  }, [currentAffirmationIndex]);

  // Goal-specific affirmation navigation
  const handleGoalNextAffirmation = useCallback((lifeArea, maxIndex) => {
    setGoalAffirmationIndexes(prev => {
      const current = prev[lifeArea] || 0;
      if (current < maxIndex - 1) {
        return { ...prev, [lifeArea]: current + 1 };
      }
      return prev;
    });
  }, []);

  const handleGoalPrevAffirmation = useCallback((lifeArea) => {
    setGoalAffirmationIndexes(prev => {
      const current = prev[lifeArea] || 0;
      if (current > 0) {
        return { ...prev, [lifeArea]: current - 1 };
      }
      return prev;
    });
  }, []);

  const handleGoalAffirmationComplete = useCallback(async () => {
    setAffirmationsCompletedToday(prev => prev + 1);
    // No popup - just track silently, button will show checkmark animation
    await trackAffirmation();
  }, [trackAffirmation]);

  const handleGoalReadAloud = useCallback(async (text) => {
    if (!text) return;

    try {
      // Stop any ongoing speech first
      await Speech.stop();

      // Speak the text in Vietnamese
      await Speech.speak(text, {
        language: 'vi-VN',
        pitch: 1.0,
        rate: 0.9,
      });
    } catch (error) {
      console.error('Speech error:', error);
    }
  }, []);

  // Edit widget
  const handleEditWidget = useCallback((widget) => {
    if (!widget) return;

    setEditingWidget(widget);
    const content = parseWidgetContent(widget);

    let contentText = '';
    if (widget?.type === 'affirmation') {
      const affirmations = extractAffirmations(content);
      contentText = affirmations.join('\n');
    } else if (widget?.type === 'goal') {
      const goals = extractGoals(content, widget?.id);
      contentText = goals.map(g => g?.title).filter(Boolean).join('\n');
    } else if (widget?.type === 'habit' || widget?.type === 'steps' || widget?.type === 'action_plan') {
      const habits = extractHabits(content, widget?.id);
      contentText = habits.map(h => h?.title || h?.text).filter(Boolean).join('\n');
    }

    setWidgetForm({
      type: widget?.type || 'affirmation',
      title: widget?.title || '',
      content: contentText,
    });
    setShowAddModal(true);
  }, []);

  // Edit Goal Title - prompt user to enter new title
  const handleEditGoalTitle = useCallback((widget, currentTitle) => {
    if (!widget?.id || !user?.id) return;

    setAlertConfig({
      visible: true,
      type: 'info',
      title: 'Sửa tên mục tiêu',
      message: `Tên hiện tại: "${currentTitle}"\n\nNhấn OK để mở modal chỉnh sửa.`,
      buttons: [
        { text: 'Hủy', style: 'secondary' },
        {
          text: 'Sửa',
          style: 'primary',
          onPress: () => handleEditWidget(widget),
        },
      ],
    });
  }, [user?.id, handleEditWidget]);

  // Edit Affirmation - prompt user to edit specific affirmation
  const handleEditAffirmation = useCallback((widget, index, currentText) => {
    if (!widget?.id || !user?.id) return;

    setAlertConfig({
      visible: true,
      type: 'info',
      title: 'Sửa câu khẳng định',
      message: `"${currentText}"\n\nNhấn OK để mở modal chỉnh sửa tất cả câu khẳng định.`,
      buttons: [
        { text: 'Hủy', style: 'secondary' },
        {
          text: 'Sửa',
          style: 'primary',
          onPress: () => handleEditWidget(widget),
        },
      ],
    });
  }, [user?.id, handleEditWidget]);

  // Edit Action Step - prompt user to edit specific step
  const handleEditActionStep = useCallback((widget, index, step) => {
    if (!widget?.id || !user?.id) return;

    setAlertConfig({
      visible: true,
      type: 'info',
      title: 'Sửa bước hành động',
      message: `"${step?.title || step?.text || ''}"\n\nNhấn OK để mở modal chỉnh sửa tất cả các bước.`,
      buttons: [
        { text: 'Hủy', style: 'secondary' },
        {
          text: 'Sửa',
          style: 'primary',
          onPress: () => handleEditWidget(widget),
        },
      ],
    });
  }, [user?.id, handleEditWidget]);

  // Save Affirmation inline - update single affirmation text
  const handleSaveAffirmation = useCallback(async (widget, index, newText) => {
    if (!widget?.id || !user?.id || index < 0 || !newText?.trim()) return;

    try {
      const content = parseWidgetContent(widget);
      let updatedContent;

      // Handle different content structures
      if (Array.isArray(content)) {
        // Array of strings
        const updatedArray = [...content];
        if (index < updatedArray.length) {
          updatedArray[index] = newText.trim();
        }
        updatedContent = updatedArray;
      } else if (content?.affirmations && Array.isArray(content.affirmations)) {
        // Object with affirmations array
        const updatedAffirmations = [...content.affirmations];
        if (index < updatedAffirmations.length) {
          updatedAffirmations[index] = newText.trim();
        }
        updatedContent = { ...content, affirmations: updatedAffirmations };
      } else if (typeof content === 'string') {
        // Single string content - split by newlines and update
        const lines = content.split('\n').filter(l => l.trim());
        if (index < lines.length) {
          lines[index] = newText.trim();
        }
        updatedContent = lines;
      } else {
        console.warn('[VisionBoard] Unexpected affirmation content structure:', content);
        return;
      }

      // Update in database
      const { error } = await supabase
        .from('vision_board_widgets')
        .update({ content: updatedContent })
        .eq('id', widget.id);

      if (error) throw error;

      // Update local state
      setWidgets(prev => prev.map(w => {
        if (w?.id === widget.id) {
          return { ...w, content: updatedContent };
        }
        return w;
      }));

      console.log('[VisionBoard] Affirmation saved inline:', { widgetId: widget.id, index, newText });
    } catch (err) {
      console.error('[VisionBoard] Save affirmation error:', err);
      setAlertConfig({
        visible: true,
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể lưu khẳng định. Vui lòng thử lại.',
        buttons: [{ text: 'OK', style: 'primary' }],
      });
    }
  }, [user?.id]);

  // Save Goal Title inline - update goal title text
  const handleSaveGoalTitle = useCallback(async (widget, newTitle) => {
    if (!widget?.id || !user?.id || !newTitle?.trim()) return;

    try {
      const content = parseWidgetContent(widget);
      let updatedContent;

      // Handle different content structures
      if (Array.isArray(content)) {
        // Array of goals - update BOTH goalText and title for compatibility
        const updatedArray = content.map((item, idx) => {
          if (idx === 0 && typeof item === 'object') {
            return { ...item, title: newTitle.trim(), goalText: newTitle.trim(), text: newTitle.trim() };
          }
          if (idx === 0 && typeof item === 'string') {
            return newTitle.trim();
          }
          return item;
        });
        updatedContent = updatedArray;
      } else if (content?.goals && Array.isArray(content.goals)) {
        // Object with goals array - update BOTH goalText and title
        const updatedGoals = content.goals.map((g, idx) => {
          if (idx === 0) {
            return typeof g === 'object'
              ? { ...g, title: newTitle.trim(), goalText: newTitle.trim(), text: newTitle.trim() }
              : newTitle.trim();
          }
          return g;
        });
        updatedContent = { ...content, goals: updatedGoals };
      } else if (content?.title || content?.goalText) {
        // Single goal object - update all possible title fields
        updatedContent = { ...content, title: newTitle.trim(), goalText: newTitle.trim(), text: newTitle.trim() };
      } else if (typeof content === 'string') {
        // Single string content
        updatedContent = newTitle.trim();
      } else {
        // Fallback: create new object structure
        updatedContent = { title: newTitle.trim(), goalText: newTitle.trim() };
      }

      // Update in database
      const { error } = await supabase
        .from('vision_board_widgets')
        .update({
          content: updatedContent,
          title: newTitle.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', widget.id);

      if (error) throw error;

      // Update local state
      setWidgets(prev => prev.map(w => {
        if (w?.id === widget.id) {
          return { ...w, content: updatedContent, title: newTitle.trim() };
        }
        return w;
      }));

      console.log('[VisionBoard] Goal title saved inline:', { widgetId: widget.id, newTitle });
    } catch (err) {
      console.error('[VisionBoard] Save goal title error:', err);
      setAlertConfig({
        visible: true,
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể lưu tên mục tiêu. Vui lòng thử lại.',
        buttons: [{ text: 'OK', style: 'primary' }],
      });
    }
  }, [user?.id]);

  // Save Action Step inline - update single action step text
  const handleSaveActionStep = useCallback(async (widget, index, newText) => {
    if (!widget?.id || !user?.id || index < 0 || !newText?.trim()) return;

    try {
      const content = parseWidgetContent(widget);
      let updatedContent;

      // Handle different content structures
      if (Array.isArray(content)) {
        // Array of steps
        const updatedArray = [...content];
        if (index < updatedArray.length) {
          if (typeof updatedArray[index] === 'object') {
            updatedArray[index] = { ...updatedArray[index], title: newText.trim(), text: newText.trim() };
          } else {
            updatedArray[index] = newText.trim();
          }
        }
        updatedContent = updatedArray;
      } else if (content?.habits && Array.isArray(content.habits)) {
        // Object with habits array
        const updatedHabits = [...content.habits];
        if (index < updatedHabits.length) {
          if (typeof updatedHabits[index] === 'object') {
            updatedHabits[index] = { ...updatedHabits[index], title: newText.trim(), text: newText.trim() };
          } else {
            updatedHabits[index] = newText.trim();
          }
        }
        updatedContent = { ...content, habits: updatedHabits };
      } else if (content?.steps && Array.isArray(content.steps)) {
        // Object with steps array
        const updatedSteps = [...content.steps];
        if (index < updatedSteps.length) {
          if (typeof updatedSteps[index] === 'object') {
            updatedSteps[index] = { ...updatedSteps[index], title: newText.trim(), text: newText.trim() };
          } else {
            updatedSteps[index] = newText.trim();
          }
        }
        updatedContent = { ...content, steps: updatedSteps };
      } else if (typeof content === 'string') {
        // Single string content - split by newlines and update
        const lines = content.split('\n').filter(l => l.trim());
        if (index < lines.length) {
          lines[index] = newText.trim();
        }
        updatedContent = lines;
      } else {
        console.warn('[VisionBoard] Unexpected action step content structure:', content);
        return;
      }

      // Update in database
      const { error } = await supabase
        .from('vision_board_widgets')
        .update({
          content: updatedContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', widget.id);

      if (error) throw error;

      // Update local state
      setWidgets(prev => prev.map(w => {
        if (w?.id === widget.id) {
          return { ...w, content: updatedContent };
        }
        return w;
      }));

      console.log('[VisionBoard] Action step saved inline:', { widgetId: widget.id, index, newText });
    } catch (err) {
      console.error('[VisionBoard] Save action step error:', err);
      setAlertConfig({
        visible: true,
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể lưu bước hành động. Vui lòng thử lại.',
        buttons: [{ text: 'OK', style: 'primary' }],
      });
    }
  }, [user?.id]);

  // Delete single widget
  const handleDeleteWidget = useCallback(async (widgetId) => {
    if (!widgetId) return;

    setAlertConfig({
      visible: true,
      type: 'error',
      title: 'Xóa Widget?',
      message: 'Bạn có chắc chắn muốn xóa widget này?',
      buttons: [
        { text: 'Hủy', style: 'secondary' },
        {
          text: 'Xóa',
          style: 'primary',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('vision_board_widgets')
                .delete()
                .eq('id', widgetId);

              if (error) throw error;
              setWidgets(prev => prev.filter(w => w?.id !== widgetId));
            } catch (err) {
              console.error('[VisionBoard] Delete error:', err);
              setAlertConfig({
                visible: true,
                type: 'error',
                title: 'Lỗi',
                message: 'Không thể xóa widget. Vui lòng thử lại.',
                buttons: [{ text: 'OK', style: 'primary' }],
              });
            }
          },
        },
      ],
    });
  }, []);

  // Delete multiple widgets (batch delete)
  const handleDeleteMultipleWidgets = useCallback(async (widgetIds, confirmMessage = 'Bạn có chắc chắn muốn xóa các widget này?') => {
    if (!widgetIds || widgetIds.length === 0) return;
    if (!user?.id) {
      console.error('[VisionBoard] No user ID for delete');
      return;
    }

    // Filter out null/undefined ids
    const validIds = widgetIds.filter(id => id);
    if (validIds.length === 0) return;

    setAlertConfig({
      visible: true,
      type: 'error',
      title: `Xóa ${validIds.length} Widget?`,
      message: confirmMessage,
      buttons: [
        { text: 'Hủy', style: 'secondary' },
        {
          text: 'Xóa tất cả',
          style: 'primary',
          onPress: async () => {
            try {
              console.log('[VisionBoard] Batch deleting widgets:', validIds);

              // Delete widgets one by one to avoid RLS issues
              let successCount = 0;
              for (const id of validIds) {
                const { error } = await supabase
                  .from('vision_board_widgets')
                  .delete()
                  .eq('id', id)
                  .eq('user_id', user.id);

                if (!error) {
                  successCount++;
                } else {
                  console.error('[VisionBoard] Failed to delete widget:', id, error);
                }
              }

              // Update local state
              setWidgets(prev => prev.filter(w => !validIds.includes(w?.id)));

              // Reset selected lifeArea if all its widgets were deleted
              setSelectedGoalLifeArea(null);

              console.log('[VisionBoard] Successfully deleted', successCount, 'of', validIds.length, 'widgets');
            } catch (err) {
              console.error('[VisionBoard] Batch delete error:', err);
              setAlertConfig({
                visible: true,
                type: 'error',
                title: 'Lỗi',
                message: 'Không thể xóa widgets. Vui lòng thử lại.',
                buttons: [{ text: 'OK', style: 'primary' }],
              });
            }
          },
        },
      ],
    });
  }, [user?.id]);

  // Add new widget - now opens multi-step modal
  const handleAddWidget = useCallback(() => {
    console.log('[VisionBoard] handleAddWidget called - opening modal');
    setEditingWidget(null);
    setWidgetForm({ type: 'goal', title: '', content: '' });
    setModalStep(1); // Start at step 1: lifeArea selection
    setSelectedLifeArea(null);
    setScenarios([]);
    setSelectedScenario(null);
    setShowAddModal(true);
  }, []);

  // Fetch scenarios from database when lifeArea is selected
  const fetchScenarios = useCallback(async (lifeArea) => {
    console.log('[VisionBoard] Fetching scenarios for:', lifeArea);
    setLoadingScenarios(true);
    try {
      const { data, error } = await supabase
        .from('goal_scenarios')
        .select('*')
        .eq('life_area', lifeArea)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('[VisionBoard] Error fetching scenarios:', error);
        setScenarios([]);
      } else {
        console.log('[VisionBoard] Fetched scenarios:', data?.length);
        setScenarios(data || []);
      }
    } catch (err) {
      console.error('[VisionBoard] Fetch scenarios error:', err);
      setScenarios([]);
    } finally {
      setLoadingScenarios(false);
    }
  }, []);

  // Handle lifeArea selection
  const handleSelectLifeArea = useCallback((lifeAreaKey) => {
    console.log('[VisionBoard] Selected lifeArea:', lifeAreaKey);
    setSelectedLifeArea(lifeAreaKey);
    fetchScenarios(lifeAreaKey);
    setModalStep(2); // Move to step 2: scenario selection
  }, [fetchScenarios]);

  // Handle scenario selection - auto save goal + affirmation + action plan
  const handleSelectScenario = useCallback(async (scenario) => {
    console.log('[VisionBoard] Selected scenario:', scenario?.title);
    setSelectedScenario(scenario);

    if (!user?.id || !scenario) return;

    try {
      const lifeAreaInfo = LIFE_AREAS.find(la => la.key === selectedLifeArea);
      const timestamp = Date.now();

      // Create GOAL widget
      const goalData = {
        user_id: user.id,
        type: 'goal',
        title: scenario.title,
        icon: 'target',
        content: JSON.stringify({
          lifeArea: selectedLifeArea,
          goals: [{
            id: `goal_${timestamp}_0`,
            title: scenario.title,
            completed: false,
          }],
        }),
        is_active: true,
      };

      // Create AFFIRMATION widget
      const affirmationData = {
        user_id: user.id,
        type: 'affirmation',
        title: `${lifeAreaInfo?.label || selectedLifeArea} Affirmations`,
        icon: 'sparkles',
        content: JSON.stringify({
          lifeArea: selectedLifeArea,
          affirmations: scenario.affirmations || [],
        }),
        is_active: true,
      };

      // Create ACTION PLAN widget
      const actionPlanData = {
        user_id: user.id,
        type: 'action_plan',
        title: `Kế hoạch: ${scenario.title}`,
        icon: 'list-checks',
        content: JSON.stringify({
          lifeArea: selectedLifeArea,
          steps: (scenario.action_steps || []).map((step, i) => ({
            id: `step_${timestamp}_${i}`,
            title: step?.step || step,
            description: step?.description || '',
            duration: step?.duration || '',
            completed: false,
          })),
        }),
        is_active: true,
      };

      console.log('[VisionBoard] Saving 3 widgets for scenario...');

      // Insert GOAL widget FIRST to get its ID
      const { data: goalResult, error: goalError } = await supabase
        .from('vision_board_widgets')
        .insert(goalData)
        .select()
        .single();

      if (goalError) throw goalError;

      // IMPORTANT: Add goalId reference to affirmation and action plan widgets
      // This allows us to link them together when displaying
      const goalId = goalResult.id;

      // Update affirmationData content with goalId
      const affirmationContentWithGoalId = {
        ...JSON.parse(affirmationData.content),
        goalId: goalId,
      };
      affirmationData.content = JSON.stringify(affirmationContentWithGoalId);

      // Update actionPlanData content with goalId
      const actionPlanContentWithGoalId = {
        ...JSON.parse(actionPlanData.content),
        goalId: goalId,
      };
      actionPlanData.content = JSON.stringify(actionPlanContentWithGoalId);

      const { data: affirmResult, error: affirmError } = await supabase
        .from('vision_board_widgets')
        .insert(affirmationData)
        .select()
        .single();

      if (affirmError) throw affirmError;

      const { data: actionResult, error: actionError } = await supabase
        .from('vision_board_widgets')
        .insert(actionPlanData)
        .select()
        .single();

      if (actionError) throw actionError;

      console.log('[VisionBoard] All 3 widgets saved successfully with goalId:', goalId);

      // Update local state
      setWidgets(prev => [...prev, goalResult, affirmResult, actionResult]);

      // Close modal and show success
      setShowAddModal(false);
      setAlertConfig({
        visible: true,
        type: 'success',
        title: 'Thành công!',
        message: `Đã thêm mục tiêu "${scenario.title}" với affirmations và kế hoạch hành động.`,
        buttons: [{ text: 'OK', style: 'primary' }],
      });

    } catch (error) {
      console.error('[VisionBoard] Error saving scenario:', error);
      setAlertConfig({
        visible: true,
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể lưu mục tiêu. Vui lòng thử lại.',
        buttons: [{ text: 'OK', style: 'primary' }],
      });
    }
  }, [user?.id, selectedLifeArea, LIFE_AREAS]);

  // Handle "Manual entry" - go to step 3 (old form)
  const handleManualEntry = useCallback(() => {
    setModalStep(3);
    setWidgetForm({ type: 'goal', title: '', content: '' });
  }, []);

  // Save widget (Goal/Affirmation/Action Plan)
  const handleSaveWidget = useCallback(async () => {
    console.log('[VisionBoard] handleSaveWidget called');
    console.log('[VisionBoard] User:', user?.id);
    console.log('[VisionBoard] Form:', widgetForm);

    if (!user?.id) {
      console.log('[VisionBoard] ERROR: No user');
      setAlertConfig({
        visible: true,
        type: 'error',
        title: 'Cần đăng nhập',
        message: 'Vui lòng đăng nhập để thêm mục tiêu.',
        buttons: [{ text: 'OK', style: 'primary' }],
      });
      return;
    }

    if (!widgetForm.title?.trim()) {
      console.log('[VisionBoard] ERROR: No title');
      setAlertConfig({
        visible: true,
        type: 'error',
        title: 'Thiếu tiêu đề',
        message: 'Vui lòng nhập tiêu đề cho mục tiêu.',
        buttons: [{ text: 'OK', style: 'primary' }],
      });
      return;
    }

    try {
      const lines = widgetForm.content?.split('\n').filter(l => l?.trim()) || [];
      console.log('[VisionBoard] Content lines:', lines);
      let contentData = {};

      if (widgetForm.type === 'affirmation') {
        contentData = { affirmations: lines };
      } else if (widgetForm.type === 'goal') {
        contentData = {
          goals: lines.map((l, i) => ({
            id: `goal_${Date.now()}_${i}`,
            title: l.trim(),
            completed: false,
          })),
        };
      } else if (widgetForm.type === 'habit') {
        contentData = {
          habits: lines.map((l, i) => ({
            id: `habit_${Date.now()}_${i}`,
            title: l.trim(),
            completed: false,
          })),
        };
      }

      const widgetData = {
        user_id: user.id,
        type: widgetForm.type,
        title: widgetForm.title.trim(),
        icon: widgetForm.type === 'affirmation' ? 'sparkles'
            : widgetForm.type === 'goal' ? 'target'
            : 'list-checks',
        content: JSON.stringify(contentData),
        is_active: true,
      };

      console.log('[VisionBoard] Widget data to save:', widgetData);

      if (editingWidget) {
        console.log('[VisionBoard] Updating existing widget:', editingWidget.id);
        const { data, error } = await supabase
          .from('vision_board_widgets')
          .update(widgetData)
          .eq('id', editingWidget.id)
          .select()
          .single();

        if (error) {
          console.error('[VisionBoard] Update error:', error);
          throw error;
        }
        console.log('[VisionBoard] Update success:', data);
        setWidgets(prev => prev.map(w => w?.id === editingWidget.id ? data : w));
      } else {
        console.log('[VisionBoard] Inserting new widget');
        const { data, error } = await supabase
          .from('vision_board_widgets')
          .insert(widgetData)
          .select()
          .single();

        if (error) {
          console.error('[VisionBoard] Insert error:', error);
          throw error;
        }
        console.log('[VisionBoard] Insert success:', data);
        setWidgets(prev => [data, ...prev]);
      }

      console.log('[VisionBoard] Save complete, closing modal');
      setShowAddModal(false);
      setEditingWidget(null);
      setWidgetForm({ type: 'affirmation', title: '', content: '' });

      // Show success feedback
      setAlertConfig({
        visible: true,
        type: 'success',
        title: 'Thành công',
        message: editingWidget ? 'Đã cập nhật mục tiêu!' : 'Đã thêm mục tiêu mới!',
        buttons: [{ text: 'OK', style: 'primary' }],
      });

    } catch (err) {
      console.error('[VisionBoard] Save error:', err);
      setAlertConfig({
        visible: true,
        type: 'error',
        title: 'Lỗi',
        message: `Không thể lưu widget: ${err?.message || 'Unknown error'}`,
        buttons: [{ text: 'OK', style: 'primary' }],
      });
    }
  }, [user?.id, widgetForm, editingWidget]);

  // =========== RENDER ===========

  if (loading) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Đang tải Vision Board...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Vision Board</Text>
          <Text style={styles.headerSubtitle}>Mục tiêu của tôi</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isVisionBoardEmpty && styles.scrollContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.gold}
          />
        }
      >
        {isVisionBoardEmpty ? (
          // Empty State
          <View style={styles.emptyStateContainer}>
            <Sparkles size={64} color={COLORS.gold} />
            <Text style={styles.emptyStateTitle}>Vision Board trống</Text>
            <Text style={styles.emptyStateDescription}>
              Bạn chưa có widget nào. Chat với Gem Master để tạo widget đầu tiên - ví dụ affirmation tiền bạc, mục tiêu tình yêu, hay kế hoạch hành động.
            </Text>
            <TouchableOpacity
              style={styles.emptyStateCTA}
              onPress={() => navigateToGemMaster('Tôi muốn tạo affirmation cho mục tiêu tài chính')}
            >
              <MessageCircle size={18} color="#0A0F1C" />
              <Text style={styles.emptyStateCTAText}>Chat với Gem Master</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Gamification Header - Streak Banner & Combo Tracker */}
            <GamificationHeader
              userId={user?.id}
              onOpenStreakHistory={() => setShowStreakHistory(true)}
              stats={stats}
            />

            {/* Progress Overview */}
            <ProgressOverview
              stats={stats}
              onNavigateToGemMaster={() => navigateToGemMaster()}
            />

            {/* Goal Tabs - Selectable cards by Life Area */}
            {hasGroupedWidgets && (
              <>
                <GoalTabs
                  groupedByLifeArea={groupedByLifeArea}
                  selectedLifeArea={selectedGoalLifeArea}
                  onSelectLifeArea={setSelectedGoalLifeArea}
                />

                {/* Selected Goal Content - Shows affirmations & action plan */}
                {/* When 'all' is selected, render ALL life areas */}
                {selectedGoalLifeArea === 'all' && Object.keys(groupedByLifeArea.groups).map((lifeArea) => (
                  <SelectedGoalContent
                    key={lifeArea}
                    lifeArea={lifeArea}
                    group={groupedByLifeArea.groups[lifeArea]}
                    onToggleHabit={(id) => handleToggleItem(id, 'habit')}
                    onToggleGoalComplete={(id) => handleToggleItem(id, 'goal')}
                    onDelete={handleDeleteWidget}
                    onDeleteMultiple={handleDeleteMultipleWidgets}
                    onEdit={handleEditWidget}
                    onEditGoalTitle={handleEditGoalTitle}
                    onEditAffirmation={handleEditAffirmation}
                    onEditActionStep={handleEditActionStep}
                    onSaveAffirmation={handleSaveAffirmation}
                    onSaveGoalTitle={handleSaveGoalTitle}
                    onSaveActionStep={handleSaveActionStep}
                    onAffirmationComplete={handleGoalAffirmationComplete}
                    onReadAloud={handleGoalReadAloud}
                    completedToday={affirmationsCompletedToday}
                    streak={affirmationStreak}
                  />
                ))}

                {/* When specific life area is selected */}
                {selectedGoalLifeArea && selectedGoalLifeArea !== 'all' && groupedByLifeArea.groups[selectedGoalLifeArea] && (
                  <SelectedGoalContent
                    lifeArea={selectedGoalLifeArea}
                    group={groupedByLifeArea.groups[selectedGoalLifeArea]}
                    onToggleHabit={(id) => handleToggleItem(id, 'habit')}
                    onToggleGoalComplete={(id) => handleToggleItem(id, 'goal')}
                    onDelete={handleDeleteWidget}
                    onDeleteMultiple={handleDeleteMultipleWidgets}
                    onEdit={handleEditWidget}
                    onEditGoalTitle={handleEditGoalTitle}
                    onEditAffirmation={handleEditAffirmation}
                    onEditActionStep={handleEditActionStep}
                    onSaveAffirmation={handleSaveAffirmation}
                    onSaveGoalTitle={handleSaveGoalTitle}
                    onSaveActionStep={handleSaveActionStep}
                    onAffirmationComplete={handleGoalAffirmationComplete}
                    onReadAloud={handleGoalReadAloud}
                    completedToday={affirmationsCompletedToday}
                    streak={affirmationStreak}
                  />
                )}

                {/* Hint when no goal is selected */}
                {!selectedGoalLifeArea && (
                  <View style={styles.selectGoalHint}>
                    <Text style={styles.selectGoalHintText}>
                      👆 Chọn một mục tiêu ở trên để xem khẳng định và kế hoạch hành động
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* Ungrouped Goals Section (widgets without lifeArea) */}
            {ungroupedGoals.length > 0 && (
              <GoalsSection
                goals={ungroupedGoals}
                widgets={groupedByLifeArea.ungroupedWidgets}
                onToggle={handleToggleItem}
                onEdit={handleEditWidget}
                onDelete={handleDeleteWidget}
                onNavigateToGemMaster={() => navigateToGemMaster('Tôi muốn đặt mục tiêu mới')}
              />
            )}

            {/* Empty Goals State (only if no grouped and no ungrouped goals) */}
            {!hasGroupedWidgets && ungroupedGoals.length === 0 && (
              <GoalsSection
                goals={[]}
                widgets={[]}
                onToggle={handleToggleItem}
                onEdit={handleEditWidget}
                onDelete={handleDeleteWidget}
                onNavigateToGemMaster={() => navigateToGemMaster('Tôi muốn đặt mục tiêu mới')}
              />
            )}

            {/* Ungrouped Affirmations Section - ONLY show when NO grouped widgets
                When user has goal tabs, affirmations should be shown within SelectedGoalContent */}
            {!hasGroupedWidgets && ungroupedAffirmations.length > 0 && (
              <AffirmationsSection
                affirmations={ungroupedAffirmations}
                widgets={groupedByLifeArea.ungroupedWidgets}
                currentIndex={currentAffirmationIndex}
                completedToday={affirmationsCompletedToday}
                streak={affirmationStreak}
                onReadAloud={handleReadAloud}
                onComplete={handleAffirmationComplete}
                onNext={handleNextAffirmation}
                onPrev={handlePrevAffirmation}
                onEdit={handleEditWidget}
                onDelete={handleDeleteWidget}
              />
            )}

            {/* Ungrouped Action Plan Section - ONLY show when NO grouped widgets */}
            {!hasGroupedWidgets && ungroupedHabits.length > 0 && (
              <ActionPlanSection
                habits={ungroupedHabits}
                widgets={groupedByLifeArea.ungroupedWidgets}
                onToggle={handleToggleItem}
                onEdit={handleEditWidget}
                onDelete={handleDeleteWidget}
                onNavigateToGemMaster={() => navigateToGemMaster('Tôi cần kế hoạch hành động để đạt mục tiêu')}
              />
            )}

            {/* Crystal Section */}
            {allCrystals.length > 0 && (
              <CrystalSection
                crystals={allCrystals}
                widgets={widgets}
                onEdit={handleEditWidget}
                onDelete={handleDeleteWidget}
              />
            )}

            {/* Readings Section (Tarot & I Ching) */}
            {allReadings.length > 0 && (
              <ReadingsSection
                readings={allReadings}
                widgets={widgets}
                onEdit={handleEditWidget}
                onDelete={handleDeleteWidget}
                onNavigateToTarot={() => {
                  navigation.navigate('GemMaster', {
                    screen: 'Tarot',
                  });
                }}
                onNavigateToIChing={() => {
                  navigation.navigate('GemMaster', {
                    screen: 'IChing',
                  });
                }}
              />
            )}

            {/* Add Goal Button */}
            <TouchableOpacity
              style={styles.addWidgetButton}
              onPress={handleAddWidget}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Plus size={20} color={COLORS.gold} />
              <Text style={styles.addWidgetText}>Thêm Mục Tiêu Mới</Text>
            </TouchableOpacity>

            {/* Quick Link to GemMaster */}
            <TouchableOpacity
              style={styles.gemMasterLink}
              onPress={() => navigateToGemMaster()}
            >
              <MessageCircle size={18} color={COLORS.gold} />
              <Text style={styles.gemMasterLinkText}>
                Đặt mục tiêu với Gemral AI
              </Text>
              <ChevronRight size={18} color={COLORS.gold} />
            </TouchableOpacity>

            {/* Sponsor Banners */}
            <SponsorBannerSection
              screenName="visionboard"
              navigation={navigation}
              refreshTrigger={refreshing}
            />
          </>
        )}
      </ScrollView>

      {/* Add/Edit Modal - Multi-step Flow */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAddModal(false)}
        >
          <Pressable style={styles.modalContainer} onPress={e => e.stopPropagation()}>
            {/* Modal Header with Back Button */}
            <View style={styles.modalHeader}>
              {modalStep > 1 && !editingWidget && (
                <TouchableOpacity
                  onPress={() => setModalStep(modalStep - 1)}
                  style={styles.backButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <ArrowLeft size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
              )}
              <Text style={styles.modalTitle}>
                {editingWidget
                  ? 'Chỉnh sửa'
                  : modalStep === 1
                    ? 'Chọn lĩnh vực mục tiêu'
                    : modalStep === 2
                      ? `Mục tiêu ${LIFE_AREAS.find(la => la.key === selectedLifeArea)?.label || ''}`
                      : 'Thêm thủ công'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* STEP 1: Life Area Selection */}
            {modalStep === 1 && !editingWidget && (
              <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.stepDescription}>
                  Chọn lĩnh vực bạn muốn đặt mục tiêu:
                </Text>
                <View style={styles.lifeAreaGrid}>
                  {LIFE_AREAS.map(area => {
                    const IconComponent = area.Icon;
                    return (
                      <TouchableOpacity
                        key={area.key}
                        style={[styles.lifeAreaCard, { borderColor: area.color }]}
                        onPress={() => handleSelectLifeArea(area.key)}
                      >
                        <View style={[styles.lifeAreaIconContainer, { backgroundColor: `${area.color}15` }]}>
                          <IconComponent size={32} color={area.color} />
                        </View>
                        <Text style={styles.lifeAreaLabel}>{area.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Manual entry option */}
                <TouchableOpacity
                  style={styles.manualEntryButton}
                  onPress={handleManualEntry}
                >
                  <Edit3 size={18} color={COLORS.textMuted} />
                  <Text style={styles.manualEntryText}>Hoặc nhập thủ công</Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            {/* STEP 2: Scenario Selection */}
            {modalStep === 2 && !editingWidget && (
              <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
                {loadingScenarios ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color={COLORS.gold} size="large" />
                    <Text style={styles.loadingText}>Đang tải mục tiêu...</Text>
                  </View>
                ) : scenarios.length > 0 ? (
                  <>
                    <Text style={styles.stepDescription}>
                      Chọn một mục tiêu để bắt đầu:
                    </Text>
                    {scenarios.map(scenario => (
                      <TouchableOpacity
                        key={scenario.id}
                        style={styles.scenarioCard}
                        onPress={() => handleSelectScenario(scenario)}
                      >
                        <View style={styles.scenarioHeader}>
                          <Target size={18} color={COLORS.gold} />
                          <Text style={styles.scenarioTitle}>{scenario.title}</Text>
                        </View>
                        {scenario.description && (
                          <Text style={styles.scenarioDescription} numberOfLines={2}>
                            {scenario.description}
                          </Text>
                        )}
                        <View style={styles.scenarioMeta}>
                          <View style={styles.scenarioMetaItem}>
                            <Sparkles size={12} color={COLORS.textMuted} />
                            <Text style={styles.scenarioMetaText}>
                              {scenario.affirmations?.length || 0} affirmations
                            </Text>
                          </View>
                          <View style={styles.scenarioMetaItem}>
                            <ListChecks size={12} color={COLORS.textMuted} />
                            <Text style={styles.scenarioMetaText}>
                              {scenario.action_steps?.length || 0} bước
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </>
                ) : (
                  <View style={styles.emptyScenarios}>
                    <Text style={styles.emptyScenariosText}>
                      Chưa có mục tiêu mẫu cho lĩnh vực này.
                    </Text>
                    <TouchableOpacity
                      style={styles.manualEntryButton}
                      onPress={handleManualEntry}
                    >
                      <Edit3 size={18} color={COLORS.gold} />
                      <Text style={[styles.manualEntryText, { color: COLORS.gold }]}>
                        Tạo mục tiêu thủ công
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}

            {/* STEP 3: Manual Entry Form (or Edit mode) */}
            {(modalStep === 3 || editingWidget) && (
              <>
                {/* Type Selector */}
                <Text style={styles.inputLabel}>Loại</Text>
                <View style={styles.typeSelector}>
                  {[
                    { type: 'affirmation', label: 'Khẳng định', Icon: Sparkles },
                    { type: 'goal', label: 'Mục tiêu', Icon: Target },
                    { type: 'habit', label: 'Kế hoạch', Icon: ListChecks },
                  ].map(item => (
                    <TouchableOpacity
                      key={item.type}
                      style={[
                        styles.typeButton,
                        widgetForm.type === item.type && styles.typeButtonActive,
                      ]}
                      onPress={() => setWidgetForm(prev => ({ ...prev, type: item.type }))}
                    >
                      <item.Icon
                        size={20}
                        color={widgetForm.type === item.type ? COLORS.gold : COLORS.textMuted}
                      />
                      <Text style={[
                        styles.typeLabel,
                        widgetForm.type === item.type && styles.typeLabelActive,
                      ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Title Input */}
                <Text style={styles.inputLabel}>Tiêu đề</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ví dụ: Affirmation Tiền Bạc"
                  placeholderTextColor={COLORS.textMuted}
                  value={widgetForm.title}
                  onChangeText={(text) => setWidgetForm(prev => ({ ...prev, title: text }))}
                />

                {/* Content Input */}
                <Text style={styles.inputLabel}>
                  {widgetForm.type === 'affirmation'
                    ? 'Các câu khẳng định (mỗi dòng 1 câu)'
                    : widgetForm.type === 'goal'
                    ? 'Các mục tiêu (mỗi dòng 1 mục)'
                    : 'Các bước hành động (mỗi dòng 1 bước)'}
                </Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder={
                    widgetForm.type === 'affirmation'
                      ? 'Tôi là nam châm thu hút tiền bạc\nTiền đến với tôi dễ dàng\nTôi xứng đáng được giàu có'
                      : widgetForm.type === 'goal'
                      ? 'Kiếm 100 triệu/tháng\nĐọc 2 cuốn sách/tuần\nTập thể dục mỗi ngày'
                      : 'Thiền 10 phút mỗi sáng\nĐọc affirmation 3 lần\nViết nhật ký biết ơn'
                  }
                  placeholderTextColor={COLORS.textMuted}
                  value={widgetForm.content}
                  onChangeText={(text) => setWidgetForm(prev => ({ ...prev, content: text }))}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />

                {/* Actions */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowAddModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveWidget}
                  >
                    <Text style={styles.saveButtonText}>
                      {editingWidget ? 'Cập nhật' : 'Lưu'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig({ visible: false })}
      />

      {/* Gamification Modals */}
      <GamificationModals
        userId={user?.id}
        showStreakHistory={showStreakHistory}
        onCloseStreakHistory={() => setShowStreakHistory(false)}
      />
      </SafeAreaView>
    </LinearGradient>
  );
};

// =========== STYLES ===========
const styles = StyleSheet.create({
  // AnimatedCheckButton styles
  animatedCheckContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doneText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.success,
    marginRight: 4,
  },

  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: GLASS.borderWidth,
    borderBottomColor: 'rgba(106, 91, 255, 0.25)',
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
  settingsButton: {
    padding: SPACING.sm,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: BOTTOM_PADDING,
  },
  scrollContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },

  // Empty State
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  emptyStateTitle: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xxl,
    marginBottom: SPACING.md,
  },
  emptyStateDescription: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xxxl,
  },
  emptyStateCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    paddingVertical: BUTTON.primary.padding,
    paddingHorizontal: SPACING.xxxl,
    borderRadius: BUTTON.primary.borderRadius,
    gap: SPACING.sm,
    ...SHADOWS.button,
  },
  emptyStateCTAText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
  },

  // Overview Card
  overviewCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: GLASS.padding,
    marginBottom: SPACING.md,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.4)', // Purple border
    shadowColor: GLASS.glowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: GLASS.glowOpacity,
    shadowRadius: 15,
    elevation: 8,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  overviewTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  overviewStat: {
    alignItems: 'center',
    flex: 1,
  },
  overviewDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  overviewValue: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  overviewLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    left: -20,
    right: -20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: 8,
    zIndex: 100,
    borderWidth: 1,
    borderColor: COLORS.gold + '40',
  },
  tooltipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 18,
  },
  quickLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickLinkText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.gold,
  },

  // Section Card
  sectionCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: GLASS.padding,
    marginBottom: SPACING.md,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.3)', // Purple
    shadowColor: GLASS.glowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: GLASS.glowOpacity,
    shadowRadius: 15,
    elevation: 8,
  },
  affirmationCard: {
    backgroundColor: 'rgba(255, 107, 157, 0.08)',
    borderColor: 'rgba(255, 107, 157, 0.4)', // Pink stronger
  },
  actionPlanCard: {
    backgroundColor: 'rgba(0, 240, 255, 0.06)', // Cyan tint
    borderColor: 'rgba(0, 240, 255, 0.35)', // Cyan border
  },
  crystalCard: {
    backgroundColor: 'rgba(155, 89, 182, 0.08)',
    borderColor: 'rgba(155, 89, 182, 0.4)', // Purple stronger
  },
  // Readings Section (Tarot & I Ching)
  readingsCard: {
    backgroundColor: 'rgba(233, 30, 99, 0.08)',
    borderColor: 'rgba(233, 30, 99, 0.4)',
  },
  readingItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
  },
  readingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  readingTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readingTypeLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  readingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readingTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  readingCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  readingCardChip: {
    backgroundColor: 'rgba(233, 30, 99, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  readingCardText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#E91E63',
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  readingMoreCards: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    alignSelf: 'center',
  },
  readingHexagram: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  hexagramNumber: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#8B5CF6',
  },
  hexagramName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  readingNotes: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  readingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readingDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  readingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
  },
  readingsLinkText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  // Tarot Card Images
  tarotCardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 12,
  },
  tarotCardContainer: {
    alignItems: 'center',
    width: 70,
  },
  tarotCardImage: {
    width: 60,
    height: 90,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(233, 30, 99, 0.3)',
  },
  tarotCardReversed: {
    transform: [{ rotate: '180deg' }],
  },
  tarotCardPlaceholder: {
    width: 60,
    height: 90,
    borderRadius: 6,
    backgroundColor: 'rgba(233, 30, 99, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(233, 30, 99, 0.3)',
  },
  tarotCardPosition: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  tarotCardName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#E91E63',
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    textAlign: 'center',
    marginTop: 2,
  },
  // Reading Links Row
  readingsLinksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  readingsLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  // Toggle icon for collapsible section
  toggleIcon: {
    padding: 4,
  },
  // Count badge for readings
  readingsCountBadge: {
    backgroundColor: 'rgba(233, 30, 99, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  readingsCountText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#E91E63',
  },
  // I Ching hexagram container with image
  ichingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    padding: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 8,
  },
  hexagramImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  hexagramImage: {
    width: '100%',
    height: '100%',
  },
  hexagramPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexagramInfo: {
    flex: 1,
  },
  hexagramChinese: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  // Interpretation styles
  interpretationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.gold,
  },
  interpretationLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginBottom: 4,
  },
  interpretationText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  cardInterpretation: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionActionBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  // Checklist Items
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxTeal: {
    borderColor: COLORS.success,
  },
  checkboxCheckedTeal: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkboxPurple: {
    borderColor: COLORS.purple,
  },
  checkboxCheckedPurple: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },
  checklistText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.textPrimary,
  },
  checklistTextCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },

  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressFillTeal: {
    backgroundColor: COLORS.success,
  },
  progressFillPurple: {
    backgroundColor: COLORS.purple,
  },
  progressPercent: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    width: 40,
    textAlign: 'right',
  },

  // Empty State in Section
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gold,
    marginTop: SPACING.xs,
  },
  hintText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },

  // Affirmation
  affirmationContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: INPUT.borderRadius,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  affirmationLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  affirmationText: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    lineHeight: 26,
    textAlign: 'center',
  },
  affirmationActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SPACING.md,
  },
  affirmationBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BUTTON.timeframe.borderRadius,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
  },
  affirmationBtnPrimary: {
    backgroundColor: COLORS.gold,
  },
  affirmationBtnText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  affirmationBtnTextPrimary: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDarkest,
  },
  affirmationNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 12,
  },
  affirmationIndex: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
  },
  affirmationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  affirmationStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  affirmationStatText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },

  // Crystal
  crystalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  crystalIcon: {
    width: 48,
    height: 48,
    borderRadius: INPUT.borderRadius,
    backgroundColor: 'rgba(155, 89, 182, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  crystalInfo: {
    flex: 1,
  },
  crystalName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  crystalPurpose: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    marginTop: SPACING.xxs,
  },
  crystalReminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  crystalReminder: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gold,
  },

  // Add Widget Button - Compact red button with gold border (app style)
  addWidgetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.gold, // Gold border
    backgroundColor: COLORS.burgundy, // Red/burgundy background
    marginTop: SPACING.md,
    alignSelf: 'center',
    gap: SPACING.xs,
  },
  addWidgetText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold, // Gold text
  },

  // GemMaster Link
  gemMasterLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  gemMasterLinkText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.gold,
  },

  // Goal Tabs Section
  goalTabsContainer: {
    marginBottom: SPACING.md,
  },
  goalTabsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  goalTabsTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  goalTabsScroll: {
    gap: SPACING.xs,
    paddingRight: SPACING.md,
  },
  // COMPACT Goal Tab - 50% smaller with count badge
  goalTabCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.25)', // Purple subtle
    backgroundColor: GLASS.background,
  },
  goalTabCompactSelected: {
    borderWidth: 1.5,
    borderColor: COLORS.cyan, // Cyan when selected
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
  },
  goalTabTextCompact: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  goalCountBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCountText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  // Legacy goalTab styles (keep for backward compatibility)
  goalTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 24,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.25)', // Purple subtle
    backgroundColor: GLASS.background,
  },
  goalTabSelected: {
    borderWidth: 2,
    borderColor: COLORS.cyan, // Cyan when selected
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
  },
  goalTabText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
  },

  // Select Goal Hint
  selectGoalHint: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderRadius: INPUT.borderRadius,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    borderStyle: 'dashed',
  },
  selectGoalHintText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.cyan,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Selected Goal Content
  selectedGoalContent: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    borderWidth: GLASS.borderWidth,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderColor: 'rgba(0, 240, 255, 0.3)', // Cyan border
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  selectedGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: SPACING.md,
  },
  selectedGoalHeaderText: {
    flex: 1,
  },
  selectedGoalLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  selectedGoalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },

  // Selected Goal Sections
  selectedAffirmationSection: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 107, 157, 0.05)',
  },
  selectedActionPlanSection: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(108, 99, 255, 0.05)',
  },
  selectedSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  selectedSectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  selectedSectionProgress: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  selectedAffirmationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: INPUT.borderRadius,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  selectedAffirmationText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Affirmation List Styles
  affirmationListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  affirmationListContent: {
    flex: 1,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  affirmationListNumber: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FF6B9D', // Pink accent for affirmations
    width: 20,
  },
  affirmationListText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  affirmationListActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  affirmationMiniBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  affirmationMiniBtnPrimary: {
    backgroundColor: COLORS.gold,
  },

  // Affirmation Inline Edit Styles
  affirmationEditContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 107, 157, 0.3)',
    backgroundColor: 'rgba(255, 107, 157, 0.08)',
    borderRadius: 8,
    marginVertical: 2,
    paddingHorizontal: SPACING.sm,
  },
  affirmationEditInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    lineHeight: 22,
    fontStyle: 'italic',
    padding: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B9D',
    minHeight: 50,
    textAlignVertical: 'top',
  },
  affirmationEditActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  affirmationEditBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  affirmationEditBtnSave: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },

  // Goal Title Inline Edit Styles
  goalTitleEditContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  goalTitleEditInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    lineHeight: 22,
    padding: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.success,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  goalTitleEditActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  goalTitleEditBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  goalTitleEditBtnSave: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },

  // Action Step Inline Edit Styles
  actionStepEditContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(108, 99, 255, 0.3)',
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
    borderRadius: 8,
    marginVertical: 2,
    paddingHorizontal: SPACING.sm,
  },
  actionStepEditInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    lineHeight: 22,
    padding: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6C63FF',
    minHeight: 50,
    textAlignVertical: 'top',
  },
  actionStepEditActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  actionStepEditBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionStepEditBtnSave: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },

  // No Content Sections
  noAffirmationsSection: {
    padding: SPACING.lg,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 157, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  noAffirmationsText: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  noActionPlanSection: {
    padding: SPACING.lg,
    alignItems: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  noActionPlanText: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Action Step Items
  actionStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionStepCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  actionStepCheckboxDone: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },
  // Goal completion checkbox in header
  goalCompleteCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  goalCompleteCheckboxDone: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  actionStepText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },
  actionStepTextDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  actionStepProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: 8,
  },

  // Delete Goal Group Button
  deleteGoalGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  deleteGoalGroupText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.error,
  },

  // Individual Goal Card Styles (for separated goals)
  selectedGoalContentList: {
    marginTop: SPACING.sm,
  },
  lifeAreaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: INPUT.borderRadius,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  lifeAreaHeaderText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
  },
  statsBarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statsBarText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  individualGoalCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    marginBottom: SPACING.sm,
    borderWidth: GLASS.borderWidth,
    overflow: 'hidden',
    borderColor: 'rgba(106, 91, 255, 0.3)', // Purple border
    shadowColor: GLASS.glowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: GLASS.glowOpacity,
    shadowRadius: 12,
    elevation: 6,
  },
  individualGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  individualGoalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  individualGoalTitleContainer: {
    flex: 1,
  },
  individualGoalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  individualGoalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  individualGoalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  individualGoalMetaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  individualGoalContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  noContentSection: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  noContentText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  deleteIndividualGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  deleteIndividualGoalText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.error,
  },
  deleteAllGoalsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.lg,
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: INPUT.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  deleteAllGoalsText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Selection mode styles
  selectionCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  selectionCheckboxSmall: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  selectionCheckboxSelected: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  editGoalTitleBtn: {
    padding: 6,
    marginRight: 4,
  },
  editStepBtn: {
    padding: 6,
    marginLeft: 'auto',
  },
  affirmationListItemSelected: {
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.cyan,
  },
  actionStepItemSelected: {
    backgroundColor: 'rgba(106, 91, 255, 0.12)',
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.purple,
  },
  selectionModeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.4)',
  },
  selectionModeText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.cyan,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  selectionModeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectionModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  selectionModeBtnDanger: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderColor: COLORS.error,
  },
  selectionModeBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.bgDarkest,
    borderRadius: GLASS.borderRadius,
    padding: GLASS.padding,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    maxHeight: '90%',
    ...SHADOWS.glassHover,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: INPUT.borderRadius,
    backgroundColor: GLASS.background,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.25)',
    gap: 6,
  },
  typeButtonActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderColor: COLORS.cyan,
    borderWidth: 2,
  },
  typeLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  typeLabelActive: {
    color: COLORS.cyan,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  textInput: {
    backgroundColor: INPUT.background,
    borderRadius: INPUT.borderRadius,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: SPACING.xl,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: BUTTON.primary.padding,
    alignItems: 'center',
    borderRadius: BUTTON.primary.borderRadius,
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.4)',
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },
  saveButton: {
    flex: 1,
    paddingVertical: BUTTON.primary.padding,
    alignItems: 'center',
    borderRadius: BUTTON.primary.borderRadius,
    backgroundColor: COLORS.gold,
    ...SHADOWS.button,
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
  },

  // NEW: Multi-step Modal Styles
  backButton: {
    marginRight: 12,
  },
  stepContent: {
    maxHeight: 400,
  },
  stepDescription: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  lifeAreaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'space-between',
  },
  lifeAreaCard: {
    width: '47%',
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.25)',
    gap: SPACING.sm,
    shadowColor: GLASS.glowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lifeAreaIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  lifeAreaLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  manualEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  manualEntryText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
  scenarioCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    shadowColor: GLASS.glowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  scenarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  scenarioTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  scenarioDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  scenarioMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  scenarioMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scenarioMetaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  emptyScenarios: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyScenariosText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default VisionBoardScreen;
