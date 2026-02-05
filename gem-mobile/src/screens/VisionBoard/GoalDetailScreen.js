/**
 * Goal Detail Screen - Vision Board 2.0
 * Redesigned with consistent theme, swipe actions, TTS
 *
 * Features:
 * - Consistent purple/gold theme
 * - Swipe to delete actions/affirmations
 * - Edit inline for actions/affirmations
 * - TTS for affirmations
 * - Working checkboxes
 * - Edit goal title
 *
 * Updated: February 1, 2026 - Major UI redesign
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Vibration,
  Image,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode as decodeBase64 } from 'base64-arraybuffer';
import * as Speech from 'expo-speech';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  ArrowLeft,
  Edit3,
  Check,
  Sparkles,
  Target,
  Wallet,
  Briefcase,
  Heart,
  User,
  ListTodo,
  Plus,
  Trash2,
  AlertCircle,
  ImagePlus,
  Camera,
  Quote,
  Moon,
  Flower2,
  Info,
  Repeat,
  Calendar,
  CalendarDays,
  ClipboardList,
  Play,
  Pause,
  X,
  MoreHorizontal,
  ChevronRight,
} from 'lucide-react-native';

import { COLORS, TYPOGRAPHY, SPACING, GLASS, GRADIENTS } from '../../utils/tokens';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import CustomAlert from '../../components/Common/CustomAlert';
import { ScoreRing } from '../../components/Charts';
import { MilestoneIndicator } from '../../components/VisionBoard';
import AddActionModal from '../../components/VisionBoard/AddActionModal';
import { RITUAL_SCREENS, RITUAL_METADATA } from './rituals';
import statsService from '../../services/statsService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Consistent theme colors - Purple & Gold only
const THEME = {
  primary: '#8B5CF6',      // Purple
  primaryLight: 'rgba(139, 92, 246, 0.15)',
  primaryBorder: 'rgba(139, 92, 246, 0.3)',
  accent: '#FFBD59',       // Gold
  accentLight: 'rgba(255, 189, 89, 0.15)',
  accentBorder: 'rgba(255, 189, 89, 0.3)',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  cardBg: 'rgba(30, 35, 60, 0.6)',
  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.15)',
};

// Life area configuration
const LIFE_AREA_CONFIG = {
  finance: { label: 'Tài chính', icon: Wallet },
  career: { label: 'Sự nghiệp', icon: Briefcase },
  health: { label: 'Sức khỏe', icon: Heart },
  relationships: { label: 'Tình yêu', icon: Heart },
  personal: { label: 'Cá nhân', icon: User },
  spiritual: { label: 'Tâm thức', icon: Sparkles },
};

// Action type configuration - simplified, same color theme
const ACTION_TYPE_CONFIG = {
  daily: { label: 'Hàng ngày', icon: Repeat, hint: 'Reset mỗi ngày' },
  weekly: { label: 'Hàng tuần', icon: Calendar, hint: 'Reset mỗi 7 ngày' },
  monthly: { label: 'Hàng tháng', icon: CalendarDays, hint: 'Reset mỗi tháng' },
  one_time: { label: 'Một lần', icon: Check, hint: '' },
};

// ========== SWIPEABLE ACTION ITEM COMPONENT ==========
const SwipeableActionItem = ({
  action,
  onToggle,
  onEdit,
  onDelete,
  isCompleted,
}) => {
  const swipeableRef = useRef(null);

  const renderRightActions = (progress, dragX) => {
    const translateX = dragX.interpolate({
      inputRange: [-120, 0],
      outputRange: [0, 120],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.swipeActionsContainer}>
        <Animated.View style={[styles.swipeAction, { transform: [{ translateX }] }]}>
          <TouchableOpacity
            style={[styles.swipeBtn, styles.editBtn]}
            onPress={() => {
              swipeableRef.current?.close();
              onEdit(action);
            }}
          >
            <Edit3 size={18} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.swipeBtn, styles.deleteBtn]}
            onPress={() => {
              swipeableRef.current?.close();
              onDelete(action);
            }}
          >
            <Trash2 size={18} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[styles.actionItem, isCompleted && styles.actionItemCompleted]}
        onPress={() => onToggle(action)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}>
          {isCompleted && <Check size={14} color={COLORS.bgDarkest} />}
        </View>
        <Text
          style={[styles.actionText, isCompleted && styles.actionTextCompleted]}
          numberOfLines={2}
        >
          {action.title}
        </Text>
      </TouchableOpacity>
    </Swipeable>
  );
};

// ========== SWIPEABLE AFFIRMATION ITEM COMPONENT ==========
const SwipeableAffirmationItem = ({
  affirmation,
  onEdit,
  onDelete,
  onPlay,
  isPlaying,
}) => {
  const swipeableRef = useRef(null);

  const renderRightActions = (progress, dragX) => {
    const translateX = dragX.interpolate({
      inputRange: [-160, 0],
      outputRange: [0, 160],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.swipeActionsContainer}>
        <Animated.View style={[styles.swipeAction, { transform: [{ translateX }] }]}>
          <TouchableOpacity
            style={[styles.swipeBtn, styles.playBtn]}
            onPress={() => {
              swipeableRef.current?.close();
              onPlay(affirmation);
            }}
          >
            {isPlaying ? <Pause size={18} color="#FFF" /> : <Play size={18} color="#FFF" />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.swipeBtn, styles.editBtn]}
            onPress={() => {
              swipeableRef.current?.close();
              onEdit(affirmation);
            }}
          >
            <Edit3 size={18} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.swipeBtn, styles.deleteBtn]}
            onPress={() => {
              swipeableRef.current?.close();
              onDelete(affirmation);
            }}
          >
            <Trash2 size={18} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
    >
      <View style={styles.affirmationItem}>
        <Quote size={16} color={THEME.accent} style={styles.quoteIcon} />
        <Text style={styles.affirmationText}>{affirmation.text}</Text>
        <TouchableOpacity
          style={styles.inlinePlayBtn}
          onPress={() => onPlay(affirmation)}
        >
          {isPlaying ? (
            <Pause size={16} color={THEME.accent} />
          ) : (
            <Play size={16} color={THEME.accent} />
          )}
        </TouchableOpacity>
      </View>
    </Swipeable>
  );
};

// ========== MAIN COMPONENT ==========
const GoalDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { goalId, goalData: initialGoalData } = route.params || {};
  const { user } = useAuth();

  // Parse initial goal data from navigation - used for instant display
  const parsedInitialGoal = React.useMemo(() => {
    if (!initialGoalData) return null;
    const content = typeof initialGoalData.content === 'string'
      ? JSON.parse(initialGoalData.content || '{}')
      : (initialGoalData.content || initialGoalData._content || {});
    // Priority: actual goal text from content > widget title (with prefix stripped)
    const rawTitle = content?.goals?.[0]?.title
      || content?.goals?.[0]?.text
      || content?.goalText
      || content?.text
      || initialGoalData.title
      || content?.title
      || 'Mục tiêu';
    // Strip "Mục tiêu: " prefix from legacy titles
    const title = rawTitle.startsWith('Mục tiêu: ')
      ? rawTitle.replace('Mục tiêu: ', '')
      : rawTitle;
    return {
      id: initialGoalData.id || goalId,
      title,
      cover_image: initialGoalData.cover_image || content?.cover_image || content?.coverImage || null,
      life_area: (initialGoalData.life_area || content?.lifeArea || content?.life_area || 'personal').toLowerCase(),
      progress_percent: initialGoalData.progress_percent || content?.progress || 0,
      _isLegacy: initialGoalData._isLegacy || false,
      _content: content,
    };
  }, [initialGoalData, goalId]);

  // ========== EXTRACT INITIAL DATA FOR INSTANT DISPLAY ==========
  // Extract affirmations immediately from content for instant display
  const initialAffirmations = useMemo(() => {
    const content = parsedInitialGoal?._content;
    if (!content) return [];

    let extracted = [];
    if (content?.affirmations) {
      const affs = Array.isArray(content.affirmations) ? content.affirmations : [content.affirmations];
      extracted = [...extracted, ...affs];
    }
    if (content?.goals?.[0]?.affirmations) {
      const affs = Array.isArray(content.goals[0].affirmations) ? content.goals[0].affirmations : [content.goals[0].affirmations];
      extracted = [...extracted, ...affs];
    }

    let normalized = extracted.map((a, i) => ({
      id: a?.id || `aff_${i}`,
      text: typeof a === 'string' ? a : (a?.text || a?.content || a?.affirmation || ''),
    })).filter(a => a.text);

    // Deduplicate by text
    const seenTexts = new Set();
    normalized = normalized.filter(aff => {
      const textLower = aff.text.toLowerCase().trim();
      if (seenTexts.has(textLower)) return false;
      seenTexts.add(textLower);
      return true;
    });

    return normalized;
  }, [parsedInitialGoal]);

  // Extract actions immediately from content for instant display
  const initialGroupedActions = useMemo(() => {
    const content = parsedInitialGoal?._content;
    const empty = { daily: [], weekly: [], monthly: [], one_time_pending: [], one_time_completed: [] };
    if (!content) return empty;

    let legacyActions = [];
    // From steps
    if (content?.steps) {
      legacyActions = [...legacyActions, ...(Array.isArray(content.steps) ? content.steps : [content.steps])];
    }
    // From actionSteps
    if (content?.actionSteps) {
      legacyActions = [...legacyActions, ...(Array.isArray(content.actionSteps) ? content.actionSteps : [content.actionSteps])];
    }
    // From goals[0].steps
    if (content?.goals?.[0]?.steps) {
      legacyActions = [...legacyActions, ...(Array.isArray(content.goals[0].steps) ? content.goals[0].steps : [content.goals[0].steps])];
    }
    // From goals[0].actionSteps (from template system)
    if (content?.goals?.[0]?.actionSteps) {
      legacyActions = [...legacyActions, ...(Array.isArray(content.goals[0].actionSteps) ? content.goals[0].actionSteps : [content.goals[0].actionSteps])];
    }

    if (legacyActions.length === 0) return empty;

    let normalized = legacyActions.map((s, i) => ({
      id: `legacy_${i}_${s.id || s.title || i}`,
      title: typeof s === 'string' ? s : (s?.title || s?.text || s?.step || ''),
      action_type: s?.action_type || s?.frequency || 'daily',
      is_completed: s?.is_completed || s?.completed || false,
      _isLegacy: true,
    })).filter(a => a.title);

    // Deduplicate by title (content may have same actions in multiple places)
    const seenTitles = new Set();
    normalized = normalized.filter(action => {
      const titleLower = action.title.toLowerCase().trim();
      if (seenTitles.has(titleLower)) return false;
      seenTitles.add(titleLower);
      return true;
    });

    return {
      daily: normalized.filter(a => a.action_type === 'daily'),
      weekly: normalized.filter(a => a.action_type === 'weekly'),
      monthly: normalized.filter(a => a.action_type === 'monthly'),
      one_time_pending: normalized.filter(a => a.action_type === 'one_time' && !a.is_completed),
      one_time_completed: normalized.filter(a => a.action_type === 'one_time' && a.is_completed),
    };
  }, [parsedInitialGoal]);

  // Extract rituals immediately from content for instant display
  const initialRituals = useMemo(() => {
    const content = parsedInitialGoal?._content;
    if (!content) return [];

    let extracted = [];
    if (content?.rituals) {
      extracted = Array.isArray(content.rituals) ? content.rituals : [content.rituals];
    }
    if (content?.goals?.[0]?.rituals) {
      const r = content.goals[0].rituals;
      extracted = [...extracted, ...(Array.isArray(r) ? r : [r])];
    }

    const normalized = extracted.map((r, i) => ({
      id: r?.id || `ritual_${i}`,
      title: typeof r === 'string' ? r : (r?.title || r?.name || ''),
      description: r?.description || '',
      frequency: r?.frequency || 'daily',
    })).filter(r => r.title);

    // Deduplicate by title
    const seenTitles = new Set();
    return normalized.filter(r => {
      const titleLower = r.title.toLowerCase().trim();
      if (seenTitles.has(titleLower)) return false;
      seenTitles.add(titleLower);
      return true;
    });
  }, [parsedInitialGoal]);

  // States - Start with extracted data for instant display
  const [loading, setLoading] = useState(!parsedInitialGoal);
  const [refreshing, setRefreshing] = useState(false);
  const [goal, setGoal] = useState(parsedInitialGoal);
  const [groupedActions, setGroupedActions] = useState(initialGroupedActions);
  const [affirmations, setAffirmations] = useState(initialAffirmations);
  const [rituals, setRituals] = useState(initialRituals);

  // Edit states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(parsedInitialGoal?.title || '');
  const [editingActionId, setEditingActionId] = useState(null);
  const [editingActionText, setEditingActionText] = useState('');
  const [editingAffirmationId, setEditingAffirmationId] = useState(null);
  const [editingAffirmationText, setEditingAffirmationText] = useState('');

  // Modal states
  const [showAddActionModal, setShowAddActionModal] = useState(false);
  const [showAddAffirmationModal, setShowAddAffirmationModal] = useState(false);
  const [savingAction, setSavingAction] = useState(false);
  const [newAffirmationText, setNewAffirmationText] = useState('');

  // Alert
  const [alertConfig, setAlertConfig] = useState({ visible: false });

  // TTS state
  const [playingAffirmationId, setPlayingAffirmationId] = useState(null);

  // Cover image
  const [uploadingImage, setUploadingImage] = useState(false);

  // XP feedback
  const [xpEarned, setXpEarned] = useState(0);
  const [showXpFeedback, setShowXpFeedback] = useState(false);

  // ========== LOAD DATA ==========
  const loadGoalData = useCallback(async () => {
    if (!user?.id || !goalId) return;

    try {
      // First try vision_goals table
      let { data: goalData, error: goalError } = await supabase
        .from('vision_goals')
        .select('*')
        .eq('id', goalId)
        .eq('user_id', user.id)
        .single();

      // Fallback to vision_board_widgets
      if (goalError || !goalData) {
        const { data: widgetData } = await supabase
          .from('vision_board_widgets')
          .select('*')
          .eq('id', goalId)
          .eq('user_id', user.id)
          .single();

        if (widgetData) {
          const content = typeof widgetData.content === 'string'
            ? JSON.parse(widgetData.content)
            : widgetData.content;

          // DEBUG: Log widget content structure
          console.log('[GoalDetail] Widget content loaded:', {
            widgetId: widgetData.id,
            contentKeys: Object.keys(content || {}),
            hasSteps: !!content?.steps,
            stepsCount: content?.steps?.length,
            hasActionSteps: !!content?.actionSteps,
            actionStepsCount: content?.actionSteps?.length,
            hasGoals: !!content?.goals,
            goalsActionSteps: content?.goals?.[0]?.actionSteps?.length,
            hasAffirmations: !!content?.affirmations,
            affirmationsCount: content?.affirmations?.length,
            hasRituals: !!content?.rituals,
            ritualsCount: content?.rituals?.length,
            goalsAffirmations: content?.goals?.[0]?.affirmations?.length,
            goalsRituals: content?.goals?.[0]?.rituals?.length,
            templateId: content?.template_id,
          });

          const rawGoalTitle = content?.goals?.[0]?.title
            || content?.goalText
            || content?.title
            || widgetData.title
            || 'Mục tiêu';
          // Strip "Mục tiêu: " prefix from legacy titles
          const actualGoalTitle = rawGoalTitle.startsWith('Mục tiêu: ')
            ? rawGoalTitle.replace('Mục tiêu: ', '')
            : rawGoalTitle;

          goalData = {
            id: widgetData.id,
            user_id: widgetData.user_id,
            title: actualGoalTitle,
            life_area: content?.lifeArea || content?.life_area || 'personal',
            progress_percent: content?.progress || 0,
            cover_image: content?.cover_image || null,
            created_at: widgetData.created_at,
            _isLegacy: true,
            _content: content,
          };

          // Load linked widgets
          const linkedId = widgetData.id;
          const { data: potentialLinkedWidgets } = await supabase
            .from('vision_board_widgets')
            .select('*')
            .eq('user_id', user.id)
            .or('type.in.(affirmation,action_plan),widget_type.in.(affirmation,action_plan)');

          const linkedIdStr = String(linkedId);
          const linkedWidgets = (potentialLinkedWidgets || []).filter(w => {
            if (w.id === widgetData.id) return false;
            const c = typeof w.content === 'string' ? JSON.parse(w.content) : w.content;
            const cLinkedId = c?.linked_goal_id ? String(c.linked_goal_id) : null;
            const cGoalId = c?.goalId ? String(c.goalId) : null;
            return cLinkedId === linkedIdStr || cGoalId === linkedIdStr;
          });

          // Extract affirmations and actions from linked widgets
          let extractedAffirmations = [];
          linkedWidgets.forEach(w => {
            const c = typeof w.content === 'string' ? JSON.parse(w.content) : w.content;
            const wType = w.type || w.widget_type;

            if (wType === 'affirmation' && c?.affirmations) {
              const affs = Array.isArray(c.affirmations) ? c.affirmations : [c.affirmations];
              extractedAffirmations = [...extractedAffirmations, ...affs];
            }

            if ((wType === 'action_plan' || wType === 'habit') && c?.steps) {
              goalData._linkedSteps = c.steps;
            }
          });

          // Also check goal content for embedded data
          if (content?.affirmations) {
            const affs = Array.isArray(content.affirmations) ? content.affirmations : [content.affirmations];
            extractedAffirmations = [...extractedAffirmations, ...affs];
          }
          if (content?.goals?.[0]?.affirmations) {
            const affs = Array.isArray(content.goals[0].affirmations) ? content.goals[0].affirmations : [content.goals[0].affirmations];
            extractedAffirmations = [...extractedAffirmations, ...affs];
          }

          // Normalize affirmations
          let normalizedAffirmations = extractedAffirmations.map((a, i) => ({
            id: a?.id || `aff_${i}`,
            text: typeof a === 'string' ? a : (a?.text || a?.content || a?.affirmation || ''),
          })).filter(a => a.text);

          // Deduplicate affirmations by text
          const seenAffTexts = new Set();
          normalizedAffirmations = normalizedAffirmations.filter(aff => {
            const textLower = aff.text.toLowerCase().trim();
            if (seenAffTexts.has(textLower)) return false;
            seenAffTexts.add(textLower);
            return true;
          });

          setAffirmations(normalizedAffirmations);

          // Extract rituals - DEDUPLICATE by title to avoid showing same ritual twice
          let extractedRituals = [];
          if (content?.rituals) {
            extractedRituals = Array.isArray(content.rituals) ? content.rituals : [content.rituals];
          }
          if (content?.goals?.[0]?.rituals) {
            const r = content.goals[0].rituals;
            extractedRituals = [...extractedRituals, ...(Array.isArray(r) ? r : [r])];
          }
          const normalizedRituals = extractedRituals.map((r, i) => ({
            id: r?.id || `ritual_${i}`,
            title: typeof r === 'string' ? r : (r?.title || r?.name || ''),
            description: r?.description || '',
            frequency: r?.frequency || 'daily',
          })).filter(r => r.title);

          // Deduplicate by title (case-insensitive)
          const seenTitles = new Set();
          const uniqueRituals = normalizedRituals.filter(r => {
            const titleLower = r.title.toLowerCase().trim();
            if (seenTitles.has(titleLower)) {
              return false;
            }
            seenTitles.add(titleLower);
            return true;
          });
          setRituals(uniqueRituals);
        }
      } else {
        setAffirmations([]);
        setRituals([]);
      }

      if (!goalData) {
        setLoading(false);
        return;
      }

      setGoal(goalData);
      setEditTitle(goalData.title || '');

      // Load actions
      let actionsLoaded = false;

      // Try vision_actions table first
      const { data: actionsData } = await supabase
        .from('vision_actions')
        .select('*')
        .eq('goal_id', goalId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (actionsData && actionsData.length > 0) {
        setGroupedActions({
          daily: actionsData.filter(a => a.action_type === 'daily'),
          weekly: actionsData.filter(a => a.action_type === 'weekly'),
          monthly: actionsData.filter(a => a.action_type === 'monthly'),
          one_time_pending: actionsData.filter(a => a.action_type === 'one_time' && !a.is_completed),
          one_time_completed: actionsData.filter(a => a.action_type === 'one_time' && a.is_completed),
        });
        actionsLoaded = true;
      }

      // Fallback to legacy widget actions
      if (!actionsLoaded && goalData._isLegacy) {
        let legacyActions = [];

        // From goal content
        if (goalData._content?.steps) {
          legacyActions = [...legacyActions, ...goalData._content.steps.map((s, i) => ({
            id: s.id !== undefined ? `step_${s.id}` : `step_${i}`,
            title: typeof s === 'string' ? s : (s.title || s.text || ''),
            action_type: s.action_type || s.frequency || 'daily',
            is_completed: s.completed || s.is_completed || false,
            _isLegacy: true,
          }))];
        }
        if (goalData._content?.actionSteps) {
          legacyActions = [...legacyActions, ...goalData._content.actionSteps.map((s, i) => ({
            id: s.id !== undefined ? `action_${s.id}` : `action_${i}`,
            title: typeof s === 'string' ? s : (s.title || s.text || ''),
            action_type: s.action_type || s.frequency || 'daily',
            is_completed: s.completed || s.is_completed || false,
            _isLegacy: true,
          }))];
        }
        if (goalData._linkedSteps) {
          legacyActions = [...legacyActions, ...goalData._linkedSteps.map((s, i) => ({
            id: s.id !== undefined ? `linked_${s.id}` : `linked_${i}`,
            title: typeof s === 'string' ? s : (s.title || s.text || ''),
            action_type: s.action_type || s.frequency || 'daily',
            is_completed: s.completed || s.is_completed || false,
            _isLegacy: true,
          }))];
        }
        if (goalData._content?.goals?.[0]?.actionSteps) {
          legacyActions = [...legacyActions, ...goalData._content.goals[0].actionSteps.map((s, i) => ({
            id: s.id !== undefined ? `gm_${s.id}` : `gm_${i}`,
            title: typeof s === 'string' ? s : (s.title || s.text || ''),
            action_type: s.action_type || s.frequency || 'daily',
            is_completed: s.completed || s.is_completed || false,
            _isLegacy: true,
          }))];
        }

        legacyActions = legacyActions.filter(a => a.title);

        // DEDUPLICATE by title (case-insensitive) to avoid showing same action multiple times
        // Widget content may have actions in steps, actionSteps, AND goals[0].actionSteps
        const seenTitles = new Set();
        legacyActions = legacyActions.filter(action => {
          const titleLower = action.title.toLowerCase().trim();
          if (seenTitles.has(titleLower)) {
            return false;
          }
          seenTitles.add(titleLower);
          return true;
        });

        // DEBUG: Log extracted legacy actions
        console.log('[GoalDetail] Legacy actions extracted (after dedup):', {
          totalCount: legacyActions.length,
          fromSteps: goalData._content?.steps?.length || 0,
          fromActionSteps: goalData._content?.actionSteps?.length || 0,
          fromLinkedSteps: goalData._linkedSteps?.length || 0,
          fromGoals0ActionSteps: goalData._content?.goals?.[0]?.actionSteps?.length || 0,
          sampleAction: legacyActions[0],
        });

        if (legacyActions.length > 0) {
          setGroupedActions({
            daily: legacyActions.filter(a => a.action_type === 'daily'),
            weekly: legacyActions.filter(a => a.action_type === 'weekly'),
            monthly: legacyActions.filter(a => a.action_type === 'monthly'),
            one_time_pending: legacyActions.filter(a => a.action_type === 'one_time' && !a.is_completed),
            one_time_completed: legacyActions.filter(a => a.action_type === 'one_time' && a.is_completed),
          });
        } else {
          console.log('[GoalDetail] No legacy actions found, checking content structure:', {
            contentKeys: Object.keys(goalData._content || {}),
            stepsValue: goalData._content?.steps,
            actionStepsValue: goalData._content?.actionSteps,
          });
        }
      }
    } catch (error) {
      console.error('[GoalDetail] Load error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, goalId]);

  useEffect(() => {
    if (user?.id && goalId) {
      loadGoalData();
    }
  }, [user?.id, goalId, loadGoalData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGoalData();
    setRefreshing(false);
  };

  // ========== CALCULATE PROGRESS ==========
  const calculateProgress = useCallback(() => {
    const allActions = [
      ...groupedActions.daily,
      ...groupedActions.weekly,
      ...groupedActions.monthly,
      ...groupedActions.one_time_pending,
      ...groupedActions.one_time_completed,
    ];
    if (allActions.length === 0) return 0;
    const completed = allActions.filter(a => a.is_completed).length;
    return Math.round((completed / allActions.length) * 100);
  }, [groupedActions]);

  const progress = calculateProgress() || goal?.progress_percent || 0;

  // ========== SYNC PROGRESS TO WIDGET ==========
  // Automatically sync progress to widget whenever it changes
  // This ensures thumbnails in VisionBoardScreen show updated progress
  useEffect(() => {
    if (!goalId || !goal) return;

    const syncProgress = async () => {
      try {
        const currentContent = goal._content || {};
        // Only update if progress actually changed
        if (currentContent.progress !== progress) {
          await supabase
            .from('vision_board_widgets')
            .update({
              content: {
                ...currentContent,
                progress: progress,
              },
            })
            .eq('id', goalId);
          console.log('[GoalDetail] Progress synced to widget:', progress);
        }
      } catch (err) {
        console.error('[GoalDetail] Failed to sync progress:', err);
      }
    };

    // Debounce the sync to avoid too many updates
    const timeout = setTimeout(syncProgress, 500);
    return () => clearTimeout(timeout);
  }, [progress, goalId, goal]);

  // ========== ACTION HANDLERS ==========
  const handleToggleAction = async (action) => {
    if (!user?.id) return;
    Vibration.vibrate(10);

    try {
      if (action._isLegacy) {
        // Toggle in widget content
        const currentContent = goal._content || {};
        const allSteps = [
          ...(currentContent.steps || []),
          ...(currentContent.actionSteps || []),
          ...(goal._linkedSteps || []),
        ];

        const updatedSteps = allSteps.map(s => {
          const sId = s.id !== undefined ? String(s.id) : s.title;
          const aId = action.id.includes('_') ? action.id.split('_').pop() : action.id;
          if (sId === aId || s.title === action.title) {
            return { ...s, is_completed: !action.is_completed, completed: !action.is_completed };
          }
          return s;
        });

        await supabase
          .from('vision_board_widgets')
          .update({ content: { ...currentContent, steps: updatedSteps } })
          .eq('id', goalId);
      } else {
        await supabase
          .from('vision_actions')
          .update({ is_completed: !action.is_completed })
          .eq('id', action.id);
      }

      // Update local state immediately (progress sync handled by useEffect)
      setGroupedActions(prev => {
        const updateInArray = (arr) => arr.map(a =>
          a.id === action.id ? { ...a, is_completed: !a.is_completed } : a
        );
        return {
          daily: updateInArray(prev.daily),
          weekly: updateInArray(prev.weekly),
          monthly: updateInArray(prev.monthly),
          one_time_pending: updateInArray(prev.one_time_pending),
          one_time_completed: updateInArray(prev.one_time_completed),
        };
      });

      // Recalculate daily score and update stats for VisionBoard integration
      // This updates: daily score, streak, weekly progress, combo
      try {
        console.log('[GoalDetail] Recalculating daily score after action toggle');
        await statsService.recalculateDailyScore(user.id);
      } catch (statsError) {
        console.error('[GoalDetail] Stats update error:', statsError);
        // Non-blocking - don't fail the action toggle if stats update fails
      }
    } catch (error) {
      console.error('[GoalDetail] Toggle error:', error);
    }
  };

  const handleDeleteAction = async (action) => {
    // Delete directly without confirmation
    try {
      if (action._isLegacy) {
        const currentContent = goal._content || {};
        const filterSteps = (arr) => arr?.filter(s =>
          (s.id !== undefined ? String(s.id) : s.title) !== (action.id.includes('_') ? action.id.split('_').pop() : action.id) &&
          s.title !== action.title
        ) || [];

        await supabase
          .from('vision_board_widgets')
          .update({
            content: {
              ...currentContent,
              steps: filterSteps(currentContent.steps),
              actionSteps: filterSteps(currentContent.actionSteps),
            }
          })
          .eq('id', goalId);
      } else {
        await supabase.from('vision_actions').delete().eq('id', action.id);
      }
      await loadGoalData();
    } catch (error) {
      console.error('[GoalDetail] Delete error:', error);
    }
  };

  const handleEditAction = (action) => {
    setEditingActionId(action.id);
    setEditingActionText(action.title);
  };

  const handleSaveEditAction = async () => {
    if (!editingActionText.trim()) return;

    try {
      setGroupedActions(prev => {
        const updateInArray = (arr) => arr.map(a =>
          a.id === editingActionId ? { ...a, title: editingActionText.trim() } : a
        );
        return {
          daily: updateInArray(prev.daily),
          weekly: updateInArray(prev.weekly),
          monthly: updateInArray(prev.monthly),
          one_time_pending: updateInArray(prev.one_time_pending),
          one_time_completed: updateInArray(prev.one_time_completed),
        };
      });

      // TODO: Save to database
      setEditingActionId(null);
      setEditingActionText('');
    } catch (error) {
      console.error('[GoalDetail] Save edit error:', error);
    }
  };

  const handleAddAction = async (actionData) => {
    if (!user?.id || !goalId) return;
    setSavingAction(true);

    try {
      if (goal?._isLegacy) {
        const currentContent = goal._content || {};
        const newAction = {
          id: Date.now(),
          title: actionData.title,
          action_type: actionData.action_type || 'daily',
          is_completed: false,
        };
        const updatedSteps = [...(currentContent.steps || []), newAction];

        await supabase
          .from('vision_board_widgets')
          .update({ content: { ...currentContent, steps: updatedSteps } })
          .eq('id', goalId);
      } else {
        await supabase.from('vision_actions').insert({
          user_id: user.id,
          goal_id: goalId,
          title: actionData.title,
          action_type: actionData.action_type || 'daily',
          is_completed: false,
        });
      }

      setShowAddActionModal(false);
      await loadGoalData();
    } catch (error) {
      console.error('[GoalDetail] Add action error:', error);
    } finally {
      setSavingAction(false);
    }
  };

  // ========== AFFIRMATION HANDLERS ==========
  const handlePlayAffirmation = async (affirmation) => {
    if (playingAffirmationId === affirmation.id) {
      Speech.stop();
      setPlayingAffirmationId(null);
    } else {
      setPlayingAffirmationId(affirmation.id);
      Speech.speak(affirmation.text, {
        language: 'vi-VN',
        rate: 0.85, // Slower for better comprehension
        onDone: () => setPlayingAffirmationId(null),
        onError: () => setPlayingAffirmationId(null),
      });
    }
  };

  const handleDeleteAffirmation = (affirmation) => {
    // Delete directly without confirmation
    setAffirmations(prev => prev.filter(a => a.id !== affirmation.id));
    // TODO: Save to database
  };

  const handleEditAffirmation = (affirmation) => {
    setEditingAffirmationId(affirmation.id);
    setEditingAffirmationText(affirmation.text);
  };

  const handleSaveEditAffirmation = () => {
    if (!editingAffirmationText.trim()) return;
    setAffirmations(prev => prev.map(a =>
      a.id === editingAffirmationId ? { ...a, text: editingAffirmationText.trim() } : a
    ));
    setEditingAffirmationId(null);
    setEditingAffirmationText('');
    // TODO: Save to database
  };

  const handleAddAffirmation = () => {
    if (!newAffirmationText.trim()) return;
    const newAff = {
      id: `aff_${Date.now()}`,
      text: newAffirmationText.trim(),
    };
    setAffirmations(prev => [...prev, newAff]);
    setNewAffirmationText('');
    setShowAddAffirmationModal(false);
    // TODO: Save to database
  };

  // ========== TITLE EDIT HANDLER ==========
  const handleSaveTitle = async () => {
    if (!editTitle.trim()) return;

    try {
      if (goal?._isLegacy) {
        const currentContent = goal._content || {};
        await supabase
          .from('vision_board_widgets')
          .update({
            title: editTitle.trim(),
            content: {
              ...currentContent,
              title: editTitle.trim(),
              goals: currentContent.goals?.map((g, i) =>
                i === 0 ? { ...g, title: editTitle.trim() } : g
              ) || [{ title: editTitle.trim() }],
            }
          })
          .eq('id', goalId);
      } else {
        await supabase
          .from('vision_goals')
          .update({ title: editTitle.trim() })
          .eq('id', goalId);
      }

      setGoal(prev => ({ ...prev, title: editTitle.trim() }));
      setIsEditingTitle(false);
    } catch (error) {
      console.error('[GoalDetail] Save title error:', error);
    }
  };

  // ========== COVER IMAGE HANDLERS ==========
  const handlePickCoverImage = async () => {
    // Check user is logged in
    if (!user?.id) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để tải ảnh lên.');
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép truy cập thư viện ảnh trong Cài đặt.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingImage(true);
        const asset = result.assets[0];
        const imageUri = asset.uri;

        // Get file extension - ImagePicker with allowsEditing always returns JPEG on iOS
        // When allowsEditing is true, iOS converts HEIC to JPEG automatically
        const fileExt = 'jpg';
        const contentType = 'image/jpeg';

        const fileName = `goal-${goalId}-${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        console.log('[GoalDetail] Starting upload:', { imageUri: imageUri.substring(0, 50), filePath, userId: user.id });

        // Read file as base64
        let base64;
        try {
          base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch (readError) {
          console.error('[GoalDetail] File read error:', readError);
          Alert.alert('Lỗi', 'Không thể đọc file ảnh. Vui lòng thử ảnh khác.');
          return;
        }

        // Decode base64 to ArrayBuffer
        const arrayBuffer = decodeBase64(base64);
        const fileSizeMB = (arrayBuffer.byteLength / (1024 * 1024)).toFixed(2);
        console.log('[GoalDetail] File size:', fileSizeMB, 'MB');

        // Check file size (max 10MB)
        if (arrayBuffer.byteLength > 10 * 1024 * 1024) {
          Alert.alert('Lỗi', `Ảnh quá lớn (${fileSizeMB}MB). Vui lòng chọn ảnh nhỏ hơn 10MB.`);
          return;
        }

        // Upload to Supabase storage
        console.log('[GoalDetail] Uploading to Supabase storage...');
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('vision-board')
          .upload(filePath, arrayBuffer, {
            contentType,
            upsert: true,
          });

        if (uploadError) {
          console.error('[GoalDetail] Storage upload error:', JSON.stringify(uploadError));
          // Parse specific error messages
          const errMsg = uploadError.message || uploadError.error || '';
          if (errMsg.includes('Bucket not found') || errMsg.includes('bucket')) {
            Alert.alert('Lỗi hệ thống', 'Storage bucket chưa được cấu hình. Vui lòng liên hệ admin.');
          } else if (errMsg.includes('row-level security') || errMsg.includes('policy')) {
            Alert.alert('Lỗi quyền truy cập', 'Không có quyền upload. Vui lòng liên hệ admin.');
          } else if (errMsg.includes('Payload too large') || errMsg.includes('file size')) {
            Alert.alert('Lỗi', `Ảnh quá lớn (${fileSizeMB}MB). Vui lòng chọn ảnh nhỏ hơn.`);
          } else if (errMsg.includes('mime') || errMsg.includes('type')) {
            Alert.alert('Lỗi', 'Định dạng ảnh không được hỗ trợ. Vui lòng chọn JPG hoặc PNG.');
          } else {
            Alert.alert('Lỗi upload', errMsg || 'Không thể tải ảnh lên. Vui lòng thử lại.');
          }
          return;
        }

        console.log('[GoalDetail] Upload success:', uploadData?.path);

        const { data: { publicUrl } } = supabase.storage.from('vision-board').getPublicUrl(filePath);

        // Update database
        if (goal?._isLegacy) {
          // For legacy widgets, only update the content JSON (cover_image column may not exist)
          const { error: updateError } = await supabase.from('vision_board_widgets').update({
            content: { ...goal._content, cover_image: publicUrl },
          }).eq('id', goalId);

          if (updateError) {
            console.error('[GoalDetail] Widget update error:', updateError);
            Alert.alert('Lỗi', 'Đã upload ảnh nhưng không thể cập nhật mục tiêu.');
            return;
          }
        } else {
          const { error: updateError } = await supabase.from('vision_goals').update({ cover_image: publicUrl }).eq('id', goalId);

          if (updateError) {
            console.error('[GoalDetail] Goal update error:', updateError);
            Alert.alert('Lỗi', 'Đã upload ảnh nhưng không thể cập nhật mục tiêu.');
            return;
          }
        }

        setGoal(prev => ({ ...prev, cover_image: publicUrl }));
        console.log('[GoalDetail] Cover image updated successfully');
      }
    } catch (error) {
      console.error('[GoalDetail] Unexpected error:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
    } finally {
      setUploadingImage(false);
    }
  };

  // ========== RENDER ==========
  const lifeArea = goal?.life_area || 'personal';
  const config = LIFE_AREA_CONFIG[lifeArea] || LIFE_AREA_CONFIG.personal;
  const AreaIcon = config.icon || Target;

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LinearGradient colors={GRADIENTS.darkPurple} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  if (!goal) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={GRADIENTS.darkPurple} style={StyleSheet.absoluteFill} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={THEME.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết mục tiêu</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={THEME.danger} />
          <Text style={styles.errorText}>Không tìm thấy mục tiêu</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render action group
  const renderActionGroup = (title, actions, actionType) => {
    if (!actions || actions.length === 0) return null;
    const typeConfig = ACTION_TYPE_CONFIG[actionType] || ACTION_TYPE_CONFIG.daily;
    const TypeIcon = typeConfig.icon;
    const completedCount = actions.filter(a => a.is_completed).length;

    return (
      <View style={styles.actionGroup}>
        {/* Group Header - with hint only once */}
        <View style={styles.groupHeader}>
          <View style={styles.groupHeaderLeft}>
            <View style={styles.groupIconContainer}>
              <TypeIcon size={16} color={THEME.primary} />
            </View>
            <View>
              <Text style={styles.groupTitle}>{title}</Text>
              {typeConfig.hint ? (
                <Text style={styles.groupHint}>{typeConfig.hint}</Text>
              ) : null}
            </View>
          </View>
          <Text style={styles.groupCount}>{completedCount}/{actions.length}</Text>
        </View>

        {/* Actions */}
        {actions.map((action) => (
          editingActionId === action.id ? (
            <View key={action.id} style={styles.editingContainer}>
              <TextInput
                style={styles.editInput}
                value={editingActionText}
                onChangeText={setEditingActionText}
                autoFocus
                onSubmitEditing={handleSaveEditAction}
              />
              <TouchableOpacity onPress={handleSaveEditAction} style={styles.saveBtn}>
                <Check size={18} color={THEME.accent} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingActionId(null)} style={styles.cancelBtn}>
                <X size={18} color={THEME.textMuted} />
              </TouchableOpacity>
            </View>
          ) : (
            <SwipeableActionItem
              key={action.id}
              action={action}
              onToggle={handleToggleAction}
              onEdit={handleEditAction}
              onDelete={handleDeleteAction}
              isCompleted={action.is_completed}
            />
          )
        ))}
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={GRADIENTS.darkPurple} style={StyleSheet.absoluteFill} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={THEME.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết mục tiêu</Text>
          <TouchableOpacity onPress={() => setIsEditingTitle(true)} style={styles.editButton}>
            <Edit3 size={20} color={THEME.primary} />
          </TouchableOpacity>
        </View>

        {/* XP Feedback */}
        {showXpFeedback && (
          <View style={styles.xpFeedback}>
            <Sparkles size={18} color={THEME.accent} />
            <Text style={styles.xpFeedbackText}>+{xpEarned} XP</Text>
          </View>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={THEME.primary}
            />
          }
        >
          {/* Goal Card */}
          <View style={styles.goalCard}>
            {/* Cover Image */}
            {goal?.cover_image ? (
              <View style={styles.coverImageContainer}>
                <Image source={{ uri: goal.cover_image }} style={styles.coverImage} resizeMode="cover" />
                <View style={styles.coverImageOverlay}>
                  <TouchableOpacity style={styles.coverImageButton} onPress={handlePickCoverImage} disabled={uploadingImage}>
                    <Camera size={16} color={THEME.text} />
                  </TouchableOpacity>
                </View>
                {uploadingImage && (
                  <View style={styles.coverImageLoading}>
                    <ActivityIndicator size="small" color={THEME.accent} />
                  </View>
                )}
              </View>
            ) : (
              <TouchableOpacity style={styles.addCoverImageButton} onPress={handlePickCoverImage} disabled={uploadingImage}>
                {uploadingImage ? (
                  <ActivityIndicator size="small" color={THEME.accent} />
                ) : (
                  <>
                    <ImagePlus size={24} color={THEME.accent} />
                    <Text style={styles.addCoverImageText}>Thêm hình ảnh</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Title */}
            <View style={styles.goalHeader}>
              <View style={styles.iconContainer}>
                <AreaIcon size={28} color={THEME.primary} />
              </View>
              <View style={styles.goalInfo}>
                <Text style={styles.lifeAreaLabel}>{config.label}</Text>
                {isEditingTitle ? (
                  <View style={styles.editTitleContainer}>
                    <TextInput
                      style={styles.editTitleInput}
                      value={editTitle}
                      onChangeText={setEditTitle}
                      autoFocus
                      onSubmitEditing={handleSaveTitle}
                    />
                    <TouchableOpacity onPress={handleSaveTitle}>
                      <Check size={20} color={THEME.accent} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsEditingTitle(false)}>
                      <X size={20} color={THEME.textMuted} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.goalTitle}>{goal.title || 'Mục tiêu'}</Text>
                )}
              </View>
            </View>

            {/* Progress */}
            <View style={styles.progressSection}>
              <ScoreRing
                score={progress}
                label="Tiến độ"
                size={100}
                gradientColors={[THEME.primary, THEME.accent]}
              />
            </View>

            <MilestoneIndicator progress={progress} />
          </View>

          {/* Actions Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <ListTodo size={20} color={THEME.text} />
              <Text style={styles.sectionTitle}>Kế hoạch hành động</Text>
            </View>

            {renderActionGroup('Hàng ngày', groupedActions.daily, 'daily')}
            {renderActionGroup('Hàng tuần', groupedActions.weekly, 'weekly')}
            {renderActionGroup('Hàng tháng', groupedActions.monthly, 'monthly')}
            {renderActionGroup('Cần làm', groupedActions.one_time_pending, 'one_time')}
            {groupedActions.one_time_completed.length > 0 &&
              renderActionGroup('Đã hoàn thành', groupedActions.one_time_completed, 'one_time')}

            {Object.values(groupedActions).flat().length === 0 && (
              <View style={styles.emptyState}>
                <ClipboardList size={32} color={THEME.textMuted} />
                <Text style={styles.emptyStateText}>Chưa có hành động nào</Text>
              </View>
            )}

            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddActionModal(true)}>
              <Plus size={18} color={THEME.accent} />
              <Text style={styles.addButtonText}>Thêm hành động</Text>
            </TouchableOpacity>
          </View>

          {/* Affirmations Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Sparkles size={20} color={THEME.accent} />
              <Text style={styles.sectionTitle}>Câu khẳng định</Text>
            </View>

            {affirmations.length > 0 ? (
              affirmations.map((aff) => (
                editingAffirmationId === aff.id ? (
                  <View key={aff.id} style={styles.editingContainer}>
                    <TextInput
                      style={[styles.editInput, { flex: 1 }]}
                      value={editingAffirmationText}
                      onChangeText={setEditingAffirmationText}
                      autoFocus
                      multiline
                      onSubmitEditing={handleSaveEditAffirmation}
                    />
                    <TouchableOpacity onPress={handleSaveEditAffirmation} style={styles.saveBtn}>
                      <Check size={18} color={THEME.accent} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setEditingAffirmationId(null)} style={styles.cancelBtn}>
                      <X size={18} color={THEME.textMuted} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <SwipeableAffirmationItem
                    key={aff.id}
                    affirmation={aff}
                    onEdit={handleEditAffirmation}
                    onDelete={handleDeleteAffirmation}
                    onPlay={handlePlayAffirmation}
                    isPlaying={playingAffirmationId === aff.id}
                  />
                )
              ))
            ) : (
              <View style={styles.emptyState}>
                <Quote size={32} color={THEME.textMuted} />
                <Text style={styles.emptyStateText}>Chưa có câu khẳng định</Text>
              </View>
            )}

            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddAffirmationModal(true)}>
              <Plus size={18} color={THEME.accent} />
              <Text style={styles.addButtonText}>Thêm câu khẳng định</Text>
            </TouchableOpacity>
          </View>

          {/* Rituals Section */}
          {rituals.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Moon size={20} color={THEME.primary} />
                <Text style={styles.sectionTitle}>Nghi thức</Text>
              </View>
              {rituals.map((ritual, index) => {
                // Find matching ritual screen by title
                const ritualTitle = ritual.title?.toLowerCase().trim() || '';
                let screenName = null;

                // Match by title to find the correct ritual screen
                for (const [ritualId, metadata] of Object.entries(RITUAL_METADATA)) {
                  if (metadata.name?.toLowerCase().trim() === ritualTitle) {
                    screenName = RITUAL_SCREENS[ritualId];
                    break;
                  }
                }

                // Also try matching by ID if title didn't match
                if (!screenName && ritual.id) {
                  screenName = RITUAL_SCREENS[ritual.id];
                }

                return (
                  <TouchableOpacity
                    key={`ritual_${index}_${ritual?.id || 'unknown'}`}
                    style={styles.ritualItem}
                    onPress={() => {
                      if (screenName) {
                        navigation.navigate(screenName, { goalId: goal?.id });
                      }
                    }}
                    activeOpacity={screenName ? 0.7 : 1}
                  >
                    <View style={styles.ritualIconContainer}>
                      <Flower2 size={18} color={THEME.primary} />
                    </View>
                    <View style={styles.ritualContent}>
                      <Text style={styles.ritualTitle}>{ritual.title}</Text>
                      {ritual.description ? (
                        <Text style={styles.ritualDescription}>{ritual.description}</Text>
                      ) : null}
                    </View>
                    {screenName && (
                      <ChevronRight size={20} color={THEME.textMuted} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Tips */}
          <View style={styles.tipsCard}>
            <Info size={16} color={THEME.primary} />
            <Text style={styles.tipsText}>
              Vuốt sang trái để xóa hoặc chỉnh sửa. Bấm vào checkbox để hoàn thành.
            </Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Add Action Modal */}
        <AddActionModal
          visible={showAddActionModal}
          onClose={() => setShowAddActionModal(false)}
          onSave={handleAddAction}
          goalTitle={goal?.title}
          isLoading={savingAction}
        />

        {/* Add Affirmation Modal */}
        {showAddAffirmationModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Thêm câu khẳng định</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập câu khẳng định..."
                placeholderTextColor={THEME.textMuted}
                value={newAffirmationText}
                onChangeText={setNewAffirmationText}
                multiline
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowAddAffirmationModal(false);
                    setNewAffirmationText('');
                  }}
                >
                  <Text style={styles.modalButtonCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSave]}
                  onPress={handleAddAffirmation}
                >
                  <Text style={styles.modalButtonSaveText}>Thêm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Alert */}
        <CustomAlert
          visible={alertConfig.visible}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onClose={() => setAlertConfig({ visible: false })}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: THEME.textSecondary,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: THEME.textSecondary,
    marginTop: SPACING.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: { padding: SPACING.xs },
  headerTitle: {
    color: THEME.text,
    fontSize: 18,
    fontWeight: '700',
  },
  editButton: { padding: SPACING.xs },

  // XP Feedback
  xpFeedback: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.accentLight,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    zIndex: 100,
    gap: SPACING.xs,
  },
  xpFeedbackText: {
    color: THEME.accent,
    fontSize: 16,
    fontWeight: '700',
  },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },

  // Goal Card
  goalCard: {
    backgroundColor: THEME.cardBg,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: THEME.primaryBorder,
    marginBottom: SPACING.lg,
  },
  coverImageContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  coverImageOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  coverImageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImageLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCoverImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: THEME.accentBorder,
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: THEME.accentLight,
  },
  addCoverImageText: {
    color: THEME.accent,
    fontWeight: '600',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  goalInfo: { flex: 1 },
  lifeAreaLabel: {
    color: THEME.primary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  goalTitle: {
    color: THEME.text,
    fontSize: 20,
    fontWeight: '700',
  },
  editTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  editTitleInput: {
    flex: 1,
    color: THEME.text,
    fontSize: 18,
    fontWeight: '600',
    borderBottomWidth: 1,
    borderBottomColor: THEME.primary,
    paddingVertical: 4,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },

  // Section Card
  sectionCard: {
    backgroundColor: THEME.cardBg,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  sectionTitle: {
    color: THEME.text,
    fontSize: 16,
    fontWeight: '700',
  },

  // Action Group
  actionGroup: {
    marginBottom: SPACING.lg,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  groupIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupTitle: {
    color: THEME.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  groupHint: {
    color: THEME.textMuted,
    fontSize: 11,
  },
  groupCount: {
    color: THEME.textMuted,
    fontSize: 13,
  },

  // Action Item
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },
  actionItemCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: THEME.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  checkboxCompleted: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  actionText: {
    flex: 1,
    color: THEME.text,
    fontSize: 14,
  },
  actionTextCompleted: {
    textDecorationLine: 'line-through',
    color: THEME.textMuted,
  },

  // Swipe Actions
  swipeActionsContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: 52, // Match action item height
    marginBottom: SPACING.xs,
  },
  swipeAction: {
    flexDirection: 'row',
    height: '100%',
  },
  swipeBtn: {
    width: 56,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    backgroundColor: THEME.primary,
  },
  deleteBtn: {
    backgroundColor: THEME.danger,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  playBtn: {
    backgroundColor: THEME.accent,
  },

  // Editing
  editingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  editInput: {
    flex: 1,
    color: THEME.text,
    fontSize: 14,
    padding: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  saveBtn: {
    padding: SPACING.xs,
  },
  cancelBtn: {
    padding: SPACING.xs,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateText: {
    color: THEME.textMuted,
    marginTop: SPACING.sm,
  },

  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.accentLight,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: THEME.accentBorder,
    borderStyle: 'dashed',
    gap: SPACING.sm,
  },
  addButtonText: {
    color: THEME.accent,
    fontWeight: '600',
  },

  // Affirmation Item
  affirmationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: THEME.accentLight,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: THEME.accent,
  },
  quoteIcon: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  affirmationText: {
    flex: 1,
    color: THEME.text,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  inlinePlayBtn: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },

  // Ritual Item
  ritualItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.primaryLight,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  ritualIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  ritualContent: { flex: 1 },
  ritualTitle: {
    color: THEME.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  ritualDescription: {
    color: THEME.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },

  // Tips
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.primaryLight,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  tipsText: {
    flex: 1,
    color: THEME.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },

  // Modal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: THEME.cardBg,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: THEME.primaryBorder,
  },
  modalTitle: {
    color: THEME.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    color: THEME.text,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: SPACING.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalButtonCancelText: {
    color: THEME.textSecondary,
    fontWeight: '600',
  },
  modalButtonSave: {
    backgroundColor: THEME.accent,
  },
  modalButtonSaveText: {
    color: '#000',
    fontWeight: '700',
  },
});

export default GoalDetailScreen;
