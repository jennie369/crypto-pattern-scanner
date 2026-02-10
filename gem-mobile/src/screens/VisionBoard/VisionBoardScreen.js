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
  Alert,
  LayoutAnimation,
  UIManager,
  Platform,
  InteractionManager,
} from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation, useRoute, useFocusEffect, CommonActions } from '@react-navigation/native';
import {
  Target,
  Sparkles,
  Gem,
  ListChecks,
  Plus,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
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
  HelpCircle,
  Info,
  Archive,
  Wind,
  Moon,
  Zap,
  Heart,
  Mail,
  Droplets,
  Play,
  Star,
  Eye,
  Calendar,
} from 'lucide-react-native';

import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
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

const CryptoIcon = ({ size = 28, color = '#F7931A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M9.5 9h5c1 0 1.5.5 1.5 1.5s-.5 1.5-1.5 1.5h-5v-3zM9.5 12h5.5c1 0 1.5.5 1.5 1.5s-.5 1.5-1.5 1.5H9.5v-3z" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M11 7v2M13 7v2M11 15v2M13 15v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

// =========== INFO TOOLTIP COMPONENT ===========
const InfoTooltip = memo(({ tooltip, isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={infoTooltipStyles.overlay} onPress={onClose}>
        <View style={infoTooltipStyles.container}>
          <View style={infoTooltipStyles.header}>
            <Info size={18} color="#FFD700" />
            <Text style={infoTooltipStyles.title}>Hướng dẫn</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={18} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          </View>
          <Text style={infoTooltipStyles.text}>{tooltip}</Text>
        </View>
      </Pressable>
    </Modal>
  );
});

const infoTooltipStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'rgba(15, 16, 48, 0.95)',
    borderRadius: 16,
    padding: 16,
    maxWidth: 320,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.4)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.85)',
  },
});

// Tooltip definitions for each section
const SECTION_TOOLTIPS = {
  calendar: 'Lịch hiển thị các sự kiện từ mục tiêu, deadline và thói quen của bạn. Chấm màu cho biết có hoạt động vào ngày đó. Bấm vào ngày để xem chi tiết.',
  radar: 'Biểu đồ radar hiển thị mức độ cân bằng giữa 6 lĩnh vực cuộc sống: Tài chính, Sự nghiệp, Sức khỏe, Mối quan hệ, Phát triển cá nhân và Tâm thức. Điểm càng cao = càng cân bằng.',
  weekly: 'Biểu đồ cột hiển thị điểm tiến độ của bạn trong 7 ngày qua. Điểm được tính từ: Hoàn thành mục tiêu (40%), Khẳng định (30%), Thói quen (30%).',
  xp: 'XP (Experience Points) được tích lũy khi bạn hoàn thành mục tiêu (+50 XP), đọc khẳng định (+10 XP), hoàn thành thói quen (+5 XP) và duy trì streak (+5 XP/ngày). Mỗi 100 XP = 1 Level.',
};

import { supabase } from '../../services/supabase';
import { getCardImage, getCardImageByName } from '../../assets/tarot';
import { getHexagramImage } from '../../assets/iching';
import { useAuth } from '../../contexts/AuthContext';
import { useTabBar } from '../../contexts/TabBarContext';
import { useTooltip } from '../../components/Common/TooltipProvider';
import CustomAlert from '../../components/Common/CustomAlert';
import SponsorBannerSection from '../../components/SponsorBannerSection';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, SHADOWS, BUTTON, INPUT, GRADIENTS } from '../../utils/tokens';

// NEW: Chart Components - Full Card versions with built-in headers
import {
  LifeBalanceCard,
  WeeklyProgressCard,
  XPGoalTrackerInline,
} from '../../components/Charts';

// NEW: Calendar Components with Day Detail Modal and Add Event
import { MonthCalendarCompact, DayDetailModal, AddEventModal } from '../../components/Calendar';
import { FeaturedRitualSection } from '../../components/Rituals';
import { preloadVideo } from '../../components/Rituals/cosmic';

// NEW: Services for Calendar/Charts
import calendarService from '../../services/calendarService';
import calendarJournalService from '../../services/calendarJournalService';
import tradingJournalService from '../../services/tradingJournalService';
import { deleteRitualCompletion, updateRitualReflection } from '../../services/ritualService';
import statsService from '../../services/statsService';
import { completeAffirmation } from '../../services/affirmationService';
import readingHistoryService from '../../services/readingHistoryService';
import notificationService from '../../services/notificationService';
import progressCalculator, {
  LEVELS,
  XP_REWARDS,
} from '../../services/progressCalculator';

// NEW: VisionBoard Dashboard Components (Vision Board 2.0)
import {
  DailyScoreCard,
  QuickStatsRow,
  DivinationSection,
  GoalThumbnailCard,
  GoalsGridSection,
  CalendarHeatMap,
  GoalCreationOptions,
} from '../../components/VisionBoard';

// NEW: Goal Setup Questionnaire for deeper personalization
import GoalSetupQuestionnaire from '../../components/VisionBoard/GoalSetupQuestionnaire';

// NEW: Centralized Templates - TemplateSelector for Journal/Template creation
import TemplateSelector from '../../components/shared/templates/TemplateSelector';

// NEW: Journal Routing Service for two-way linking
import { createQuickGoalWithJournal } from '../../services/templates/journalRoutingService';

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
  { key: 'crypto', label: 'Crypto', Icon: CryptoIcon, color: '#F7931A' },
  { key: 'relationships', label: 'Mối quan hệ', Icon: HeartIcon, color: '#EC4899' },
  { key: 'career', label: 'Sự nghiệp', Icon: BriefcaseIcon, color: '#6366F1' },
  { key: 'health', label: 'Sức khỏe', Icon: ActivityIcon, color: '#14B8A6' },
  { key: 'personal', label: 'Phát triển cá nhân', Icon: StarIcon, color: '#F59E0B' },
  { key: 'spiritual', label: 'Tâm thức', Icon: SpiritualIcon, color: '#8B5CF6' },
];

// Ritual icon mapping for displaying rituals in goal cards
const RITUAL_ICON_MAP = {
  'cleansing-breath': { Icon: Wind, color: '#667EEA' },
  'burn-release': { Icon: Flame, color: '#FF6B6B' },
  'letter-to-universe': { Icon: Mail, color: '#9D4EDD' },
  'heart-opening': { Icon: Heart, color: '#EC4899' },
  'gratitude-flow': { Icon: Sparkles, color: '#FFB800' },
  'water-manifest': { Icon: Droplets, color: '#00BCD4' },
  'moon-ritual': { Icon: Moon, color: '#8B5CF6' },
  'energy-boost': { Icon: Zap, color: '#F7931A' },
  'heart-expansion': { Icon: Heart, color: '#F093FB' },
  'star-wish': { Icon: Star, color: '#4ECDC4' },
  default: { Icon: Flame, color: '#FF6B6B' },
};

// Default rituals for each life area (fallback when none selected)
const DEFAULT_RITUALS = {
  finance: { id: 'gratitude-flow', title: 'Dòng Chảy Biết Ơn', subtitle: 'Thu hút thịnh vượng', color: '#FFD700' },
  crypto: { id: 'cleansing-breath', title: 'Thở Thanh Lọc', subtitle: 'Giữ bình tĩnh khi trading', color: '#667EEA' },
  career: { id: 'letter-to-universe', title: 'Thư Gửi Vũ Trụ', subtitle: 'Gửi ước nguyện sự nghiệp', color: '#9D4EDD' },
  health: { id: 'cleansing-breath', title: 'Thở Thanh Lọc', subtitle: 'Thải độc cơ thể', color: '#667EEA' },
  relationships: { id: 'heart-expansion', title: 'Mở Rộng Trái Tim', subtitle: 'Tăng tần số yêu thương', color: '#F093FB' },
  personal: { id: 'letter-to-universe', title: 'Thư Gửi Vũ Trụ', subtitle: 'Gửi ước mơ phát triển', color: '#9D4EDD' },
  spiritual: { id: 'heart-expansion', title: 'Mở Rộng Trái Tim', subtitle: 'Kết nối yêu thương', color: '#F093FB' },
};

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

// Frequency labels for action plan display
const FREQUENCY_LABELS = {
  daily: { label: 'Mỗi ngày', short: 'Ngày', color: '#10B981', icon: '📅' },
  weekly: { label: 'Mỗi tuần', short: 'Tuần', color: '#6366F1', icon: '📆' },
  monthly: { label: 'Mỗi tháng', short: 'Tháng', color: '#F59E0B', icon: '🗓️' },
};

/**
 * Extract habits/steps from widget content
 * IMPORTANT: widgetId is required to create unique IDs across multiple widgets
 * NOW preserves frequency information (daily/weekly/monthly)
 */
const extractHabits = (content, widgetId = '') => {
  if (!content) return [];

  // Handle: { habits: [...] }
  if (Array.isArray(content?.habits)) {
    return content.habits.map((h, i) => ({
      ...h,
      id: h?.id !== undefined ? `${widgetId}_habit_${typeof h.id === 'number' ? h.id : i}` : `${widgetId}_habit_${i}`,
      widgetId: widgetId,
      frequency: h?.frequency || 'daily', // Preserve frequency
    }));
  }

  // Handle: { steps: [...] } - from action_plan widgets created by InlineChatForm
  if (Array.isArray(content?.steps)) {
    return content.steps.map((step, i) => ({
      id: `${widgetId}_step_${i}`,
      widgetId: widgetId,
      title: step?.text || step?.title || (typeof step === 'string' ? step : ''),
      completed: step?.completed || false,
      frequency: step?.frequency || 'daily', // Preserve frequency
    }));
  }

  // Handle: direct array
  if (Array.isArray(content)) {
    return content.map((item, i) => ({
      id: `${widgetId}_item_${i}`,
      widgetId: widgetId,
      title: item?.title || item?.text || (typeof item === 'string' ? item : ''),
      completed: item?.completed || false,
      frequency: item?.frequency || 'daily', // Preserve frequency
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
  if (!content) return [];

  // Handle: { goals: [...] }
  if (Array.isArray(content?.goals)) {
    return content.goals.map((g, i) => ({
      ...g,
      // ALWAYS use consistent ID format for toggle to work
      id: `${widgetId}_goal_${i}`,
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
  crypto: { label: 'Crypto', color: '#F7931A' },
  career: { label: 'Sự nghiệp', color: '#6366F1' },
  health: { label: 'Sức khỏe', color: '#EF4444' },
  relationships: { label: 'Mối quan hệ', color: '#EC4899' },
  personal: { label: 'Phát triển bản thân', color: '#8B5CF6' },
  spiritual: { label: 'Tâm thức', color: '#F59E0B' },
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
        <Text style={styles.goalTabsTitle}>MỤC TIÊU CỦA TÔI</Text>
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

        {/* Individual life area tabs - Only show tabs with goals */}
        {lifeAreas.map((lifeArea) => {
          const areaInfo = LIFE_AREA_LABELS[lifeArea] || { label: lifeArea, color: COLORS.gold };
          const isSelected = selectedLifeArea === lifeArea;
          // Count goals in this lifeArea
          const goalCount = groupedByLifeArea.groups[lifeArea]?.goalWidgets?.length || 0;

          // Skip empty life areas - don't show tabs with 0 goals
          if (goalCount === 0) return null;

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

// NOTE: GoalThumbnailGrid removed - now using GoalsGridSection from components/VisionBoard

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
  onDelete,
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
        {/* Delete button */}
        <TouchableOpacity
          style={styles.affirmationMiniBtn}
          onPress={() => onDelete?.(index)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Trash2 size={14} color={COLORS.error} />
        </TouchableOpacity>
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
 * Now supports freqColor for frequency-based styling
 */
const EditableActionStepItem = memo(({
  index,
  step,
  widgetId,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
  onToggleComplete,
  isSelectionMode,
  isSelected,
  onLongPress,
  onToggleSelect,
  freqColor, // NEW: Color from frequency grouping
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
        isSelectionMode && isSelected && styles.actionStepItemSelected,
        // Add left border when completed with freq color
        step?.completed && freqColor && { borderLeftWidth: 3, borderLeftColor: freqColor },
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
        step?.completed && styles.actionStepCheckboxDone,
        // Use freq color when completed
        step?.completed && freqColor && { backgroundColor: freqColor, borderColor: freqColor },
      ]}>
        {step?.completed && <Check size={12} color="#fff" />}
      </View>
      <Text style={[
        styles.actionStepText,
        step?.completed && styles.actionStepTextDone
      ]} numberOfLines={2}>
        {step?.title}
      </Text>
      {/* Delete action step button */}
      <TouchableOpacity
        style={styles.editStepBtn}
        onPress={() => onDelete?.(index)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Trash2 size={12} color={COLORS.error} />
      </TouchableOpacity>
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
 * Editable Spiritual Ritual Item - Inline editing for spiritual rituals from I Ching/Tarot
 */
const EditableSpiritualRitualItem = memo(({
  index,
  ritual,
  widgetId,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
  onToggleComplete,
}) => {
  const [editName, setEditName] = useState(ritual?.name || '');
  const [editDesc, setEditDesc] = useState(ritual?.description || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditName(ritual?.name || '');
    setEditDesc(ritual?.description || '');
  }, [ritual?.name, ritual?.description]);

  const handleSave = () => {
    if (editName.trim()) {
      onSave(index, { name: editName.trim(), description: editDesc.trim() });
    } else {
      onCancel();
    }
  };

  const handleCancel = () => {
    setEditName(ritual?.name || '');
    setEditDesc(ritual?.description || '');
    onCancel();
  };

  if (isEditing) {
    return (
      <View style={styles.spiritualRitualEditContainer}>
        <TextInput
          ref={inputRef}
          style={styles.spiritualRitualEditName}
          value={editName}
          onChangeText={setEditName}
          placeholder="Tên nghi thức..."
          placeholderTextColor={COLORS.textMuted}
        />
        <TextInput
          style={styles.spiritualRitualEditDesc}
          value={editDesc}
          onChangeText={setEditDesc}
          placeholder="Mô tả nghi thức..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={3}
        />
        <View style={styles.spiritualRitualEditActions}>
          <TouchableOpacity
            style={styles.spiritualRitualEditBtn}
            onPress={handleCancel}
          >
            <X size={14} color={COLORS.error} />
            <Text style={styles.spiritualRitualEditBtnText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.spiritualRitualEditBtn, styles.spiritualRitualEditBtnSave]}
            onPress={handleSave}
          >
            <Check size={14} color="#000" />
            <Text style={[styles.spiritualRitualEditBtnText, { color: '#000' }]}>Lưu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.spiritualRitualCard}>
      <View style={styles.spiritualRitualHeader}>
        <TouchableOpacity
          style={[
            styles.spiritualRitualIcon,
            ritual?.completed && { backgroundColor: 'rgba(16, 185, 129, 0.2)' }
          ]}
          onPress={() => onToggleComplete?.(ritual?.id || `ritual_${index}`)}
        >
          {ritual?.completed ? (
            <Check size={14} color={COLORS.success} />
          ) : (
            <Gem size={14} color="#9D4EDD" />
          )}
        </TouchableOpacity>
        <Text
          style={[
            styles.spiritualRitualName,
            ritual?.completed && { textDecorationLine: 'line-through', color: COLORS.textMuted }
          ]}
          numberOfLines={1}
        >
          {ritual?.name || `Nghi thức ${index + 1}`}
        </Text>
        <TouchableOpacity
          style={styles.spiritualRitualEditIconBtn}
          onPress={() => onDelete?.(index)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Trash2 size={14} color={COLORS.error} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.spiritualRitualEditIconBtn}
          onPress={onStartEdit}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Edit3 size={14} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
      {ritual?.description && (
        <Text
          style={[
            styles.spiritualRitualDesc,
            ritual?.completed && { textDecorationLine: 'line-through' }
          ]}
          numberOfLines={3}
        >
          {ritual.description}
        </Text>
      )}
    </View>
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
  onArchive,
  onDeleteMultiple,
  onEdit,
  onEditGoalTitle,
  onEditAffirmation,
  onEditActionStep,
  onSaveAffirmation,
  onSaveGoalTitle,
  onSaveActionStep,
  onSaveRitual,
  onToggleRitual,
  onDeleteAffirmation,
  onDeleteActionStep,
  onDeleteRitual,
  onAddAffirmation,
  onAddActionStep,
  onAddRitual,
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
  // Navigation for ritual navigation
  const navigation = useNavigation();

  // State for inline editing
  const [editingAffirmationIndex, setEditingAffirmationIndex] = useState(null);
  const [editingGoalTitle, setEditingGoalTitle] = useState(false);
  const [editingActionStepIndex, setEditingActionStepIndex] = useState(null);
  const [editingSpiritualRitualIndex, setEditingSpiritualRitualIndex] = useState(null);
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

  // DEBUG: Trace ritual data at parse time
  console.log('[IndividualGoalCard] RITUAL PARSE DEBUG:', {
    widgetId: goalWidget?.id,
    // Raw widget content type
    rawContentType: typeof goalWidget?.content,
    // Parsed content rituals
    parsedContentRituals: goalContent?.rituals?.length || 0,
    parsedContentRitualIds: goalContent?.rituals?.map(r => r?.id),
    // Goals array rituals
    goalsCount: goals?.length || 0,
    goals0Rituals: goals?.[0]?.rituals?.length || 0,
    goals0RitualIds: goals?.[0]?.rituals?.map(r => r?.id),
    // Full content preview
    contentPreview: JSON.stringify(goalContent)?.substring(0, 400),
  });

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

  // Extract affirmations from linked widget OR from goal widget's embedded content
  let affirmations = linkedAffirmationWidget
    ? extractAffirmations(parseWidgetContent(linkedAffirmationWidget)).filter(a => a && typeof a === 'string' && a.trim())
    : [];

  // Fallback: Check for embedded affirmations in goal widget's own content
  if (affirmations.length === 0 && goalContent?.affirmations) {
    affirmations = Array.isArray(goalContent.affirmations)
      ? goalContent.affirmations.filter(a => a && typeof a === 'string' && a.trim())
      : [];
  }

  // Extract action steps from linked widget OR from goal widget's embedded content
  let actionSteps = linkedActionPlanWidget
    ? extractHabits(parseWidgetContent(linkedActionPlanWidget), linkedActionPlanWidget?.id)
    : [];

  // Fallback: Check for embedded steps in goal widget's own content
  if (actionSteps.length === 0 && goalContent?.steps) {
    actionSteps = Array.isArray(goalContent.steps)
      ? goalContent.steps.map((step, idx) => ({
          id: step.id || `${goalWidget?.id}_step_${idx}`,
          title: typeof step === 'string' ? step : (step.title || step.text || step.name || ''),
          frequency: step.action_type || step.frequency || 'daily',
          action_type: step.action_type || step.frequency || 'daily',
          completed: step.completed || false,
          widgetId: goalWidget?.id,
        }))
      : [];
  }

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

  // Render swipe actions (archive and delete) - Smooth animation
  const renderRightActions = (progress, dragX) => {
    // Use progress for smoother animation (0 to 1)
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [140, 0],
      extrapolate: 'clamp',
    });

    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.8, 1],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.swipeActionsContainer,
          {
            transform: [{ translateX }],
            opacity,
          }
        ]}
      >
        {/* Archive Button */}
        <TouchableOpacity
          style={[styles.swipeActionBtn, styles.swipeArchiveBtn]}
          onPress={() => onArchive?.(validIds)}
          activeOpacity={0.7}
        >
          <Archive size={20} color={COLORS.textPrimary} />
          <Text style={styles.swipeActionText}>Lưu trữ</Text>
        </TouchableOpacity>

        {/* Delete Button - Uses onDeleteMultiple for array of widget IDs */}
        <TouchableOpacity
          style={[styles.swipeActionBtn, styles.swipeDeleteBtn]}
          onPress={() => onDeleteMultiple?.(validIds)}
          activeOpacity={0.7}
        >
          <Trash2 size={20} color="#FFFFFF" />
          <Text style={[styles.swipeActionText, { color: '#FFFFFF' }]}>Xóa</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={1.5}
      overshootFriction={8}
      rightThreshold={30}
      enableTrackpadTwoFingerGesture
    >
    <View style={[styles.individualGoalCard, { borderColor: `${areaInfo.color}40` }]}>
      {/* Life Area Header Bar - NEW: Distinctive colored bar to separate goals */}
      <View style={[styles.goalAreaHeaderBar, { backgroundColor: `${areaInfo.color}25` }]}>
        <View style={[styles.goalAreaBadge, { backgroundColor: areaInfo.color }]}>
          {areaInfo.Icon && <areaInfo.Icon width={14} height={14} color="#fff" />}
        </View>
        <Text style={[styles.goalAreaLabel, { color: areaInfo.color }]}>{areaInfo.label}</Text>
        {/* Quick stats in header bar */}
        <View style={styles.goalAreaStats}>
          {affirmations.length > 0 && (
            <View style={styles.goalAreaStatItem}>
              <Sparkles size={12} color="#FF6B9D" />
              <Text style={styles.goalAreaStatText}>{affirmations.length}</Text>
            </View>
          )}
          {actionSteps.length > 0 && (
            <View style={styles.goalAreaStatItem}>
              <ListChecks size={12} color="#6C63FF" />
              <Text style={styles.goalAreaStatText}>{completedSteps}/{totalSteps}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Goal Header - COLLAPSED: Show progress bar like wireframe */}
      <View style={styles.goalCardHeader}>
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
            onPress={() => onToggleGoalComplete?.(goalItemId)}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            activeOpacity={0.5}
          >
            {goalCompleted && <Check size={18} color="#fff" />}
          </TouchableOpacity>
        )}

        {/* Goal Info - Title and Progress - Touchable for expand */}
        <TouchableOpacity
          style={styles.goalCardInfo}
          onPress={onToggleExpand}
          onLongPress={() => onLongPress?.(goalWidget?.id)}
          delayLongPress={400}
          delayPressIn={0}
          delayPressOut={0}
          activeOpacity={0.6}
        >
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
            <>
              <View style={styles.goalCardTitleRow}>
                <Text style={styles.goalCardTitle} numberOfLines={2}>
                  {goalTitle}
                </Text>
                {/* Edit, Detail & Expand buttons - FIXED: Better spacing and touch targets */}
                <View style={styles.goalCardActions}>
                  <TouchableOpacity
                    style={styles.goalCardActionBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleStartEditGoalTitle();
                    }}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 6 }}
                  >
                    <Edit3 size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                  {/* View Detail Button - Navigate to GoalDetailScreen */}
                  <TouchableOpacity
                    style={styles.goalCardActionBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      navigation.navigate('GoalDetail', { goalId: goalWidget?.id });
                    }}
                    hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }}
                  >
                    <Eye size={16} color={COLORS.gold} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.goalCardToggleBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      onToggleExpand?.();
                    }}
                    activeOpacity={0.5}
                    delayPressIn={0}
                    delayPressOut={0}
                    hitSlop={{ top: 20, bottom: 20, left: 15, right: 20 }}
                  >
                    <Animated.View
                      style={{
                        transform: [{ rotate: isExpanded ? '90deg' : '0deg' }],
                      }}
                    >
                      <ChevronRight size={22} color={COLORS.textMuted} />
                    </Animated.View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Progress Bar - Always visible in collapsed state */}
              {totalSteps > 0 && (
                <View style={styles.goalCardProgressSection}>
                  <View style={styles.goalCardProgressBar}>
                    <View
                      style={[
                        styles.goalCardProgressFill,
                        {
                          width: `${stepsPercent}%`,
                          backgroundColor: stepsPercent >= 70 ? COLORS.success : stepsPercent >= 40 ? COLORS.gold : areaInfo.color
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.goalCardProgressText}>{stepsPercent}%</Text>
                </View>
              )}
            </>
          )}
        </TouchableOpacity>
      </View>

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
                    onDelete={(idx) => onDeleteAffirmation?.(linkedAffirmationWidget, idx)}
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
              {/* Add new affirmation button */}
              <TouchableOpacity
                style={styles.addItemBtn}
                onPress={() => onAddAffirmation?.(linkedAffirmationWidget || goalWidget)}
              >
                <Plus size={14} color={COLORS.gold} />
                <Text style={styles.addItemBtnText}>Thêm khẳng định</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Plan - Grouped by Frequency */}
          {actionSteps.length > 0 && (
            <View style={styles.selectedActionPlanSection}>
              <View style={styles.selectedSectionHeader}>
                <ListChecks size={16} color="#6C63FF" />
                <Text style={styles.selectedSectionTitle}>Kế hoạch hành động</Text>
                <Text style={[styles.selectedSectionProgress, { color: '#6C63FF' }]}>
                  {completedSteps}/{totalSteps}
                </Text>
              </View>

              {/* Group by frequency: daily, weekly, monthly */}
              {['daily', 'weekly', 'monthly'].map(freq => {
                const freqSteps = actionSteps.filter(s => (s?.frequency || s?.action_type || 'daily') === freq);
                if (freqSteps.length === 0) return null;

                const freqInfo = FREQUENCY_LABELS[freq];
                const freqCompleted = freqSteps.filter(s => s?.completed).length;

                return (
                  <View key={freq} style={styles.frequencyGroup}>
                    <View style={[styles.frequencyHeader, { borderLeftColor: freqInfo.color }]}>
                      <Text style={styles.frequencyIcon}>{freqInfo.icon}</Text>
                      <Text style={[styles.frequencyTitle, { color: freqInfo.color }]}>
                        {freqInfo.label}
                      </Text>
                      <Text style={styles.frequencyCount}>
                        {freqCompleted}/{freqSteps.length}
                      </Text>
                    </View>

                    {freqSteps.map((step, index) => {
                      const originalIndex = actionSteps.findIndex(s => s?.id === step?.id);
                      const stepItemId = step?.id || `step_${linkedActionPlanWidget?.id}_${originalIndex}`;
                      return (
                        <EditableActionStepItem
                          key={stepItemId}
                          index={originalIndex >= 0 ? originalIndex : index}
                          step={step}
                          widgetId={linkedActionPlanWidget?.id}
                          isEditing={editingActionStepIndex === (originalIndex >= 0 ? originalIndex : index)}
                          onStartEdit={() => setEditingActionStepIndex(originalIndex >= 0 ? originalIndex : index)}
                          onSave={(idx, newText) => {
                            onSaveActionStep?.(linkedActionPlanWidget, idx, newText);
                            setEditingActionStepIndex(null);
                          }}
                          onCancel={() => setEditingActionStepIndex(null)}
                          onDelete={(idx) => onDeleteActionStep?.(linkedActionPlanWidget, idx)}
                          onToggleComplete={onToggleHabit}
                          isSelectionMode={isSelectionMode}
                          isSelected={selectedItems?.has(stepItemId)}
                          onLongPress={onLongPress}
                          onToggleSelect={onToggleSelect}
                          freqColor={freqInfo.color}
                        />
                      );
                    })}
                  </View>
                );
              })}

              {/* Add new action step button */}
              <TouchableOpacity
                style={styles.addItemBtn}
                onPress={() => onAddActionStep?.(linkedActionPlanWidget || goalWidget)}
              >
                <Plus size={14} color="#6C63FF" />
                <Text style={[styles.addItemBtnText, { color: '#6C63FF' }]}>Thêm bước hành động</Text>
              </TouchableOpacity>

              <View style={styles.actionStepProgress}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, styles.progressFillPurple, { width: `${stepsPercent}%` }]} />
                </View>
                <Text style={[styles.progressPercent, { color: '#6C63FF' }]}>{stepsPercent}%</Text>
              </View>
            </View>
          )}

          {/* Rituals Section - Display selected rituals from goal creation */}
          {(() => {
            // Extract rituals from goalContent or goals array
            const allRituals = goalContent?.rituals || goals[0]?.rituals || [];

            // Separate library rituals (have title) from spiritual rituals (have name)
            const libraryRituals = allRituals.filter(r => r?.title && RITUAL_ICON_MAP[r?.id]);
            const spiritualRituals = allRituals.filter(r => r?.name && !r?.title);

            // Debug logging to track ritual data
            console.log('[IndividualGoalCard] Ritual Debug:', {
              widgetId: goalWidget?.id,
              totalRituals: allRituals?.length || 0,
              libraryRituals: libraryRituals?.length || 0,
              spiritualRituals: spiritualRituals?.length || 0,
            });

            if (allRituals.length === 0) return null;

            return (
              <>
                {/* Library Rituals Section */}
                {libraryRituals.length > 0 && (
                  <View style={styles.selectedRitualsSection}>
                    <View style={styles.selectedSectionHeader}>
                      <Flame size={16} color="#FF6B6B" />
                      <Text style={styles.selectedSectionTitle}>Nghi thức</Text>
                      <Text style={[styles.selectedSectionProgress, { color: '#FF6B6B' }]}>
                        {libraryRituals.length} nghi thức
                      </Text>
                    </View>

                    <View style={styles.ritualsGrid}>
                      {libraryRituals.map((ritual, index) => {
                        const ritualIconData = RITUAL_ICON_MAP[ritual?.id] || RITUAL_ICON_MAP.default;
                        const RitualIcon = ritualIconData.Icon;
                        const ritualColor = ritual?.color || ritualIconData.color;

                        return (
                          <TouchableOpacity
                            key={`library_ritual_${index}_${ritual?.id || 'unknown'}`}
                            style={[styles.ritualCardSmall, { borderColor: `${ritualColor}40` }]}
                            onPress={() => {
                              // Navigate to dedicated cosmic ritual screen
                              const ritualScreenMap = {
                                'heart-expansion': 'HeartExpansionRitual',
                                'heart-opening': 'HeartExpansionRitual',
                                'gratitude-flow': 'GratitudeFlowRitual',
                                'cleansing-breath': 'CleansingBreathRitual',
                                'purify-breathwork': 'CleansingBreathRitual',
                                'water-manifest': 'WaterManifestRitual',
                                'letter-to-universe': 'LetterToUniverseRitual',
                                'burn-release': 'BurnReleaseRitual',
                                'star-wish': 'StarWishRitual',
                              };
                              const screenName = ritualScreenMap[ritual?.id] || 'HeartExpansionRitual';
                              navigation.navigate('Account', {
                                screen: screenName,
                                params: { ritual: ritual },
                              });
                            }}
                            activeOpacity={0.7}
                          >
                            <View style={[styles.ritualIconSmall, { backgroundColor: `${ritualColor}20` }]}>
                              <RitualIcon size={16} color={ritualColor} />
                            </View>
                            <View style={styles.ritualInfoSmall}>
                              <Text style={styles.ritualTitleSmall} numberOfLines={1}>
                                {ritual?.title || 'Nghi thức'}
                              </Text>
                              {ritual?.subtitle && (
                                <Text style={styles.ritualSubtitleSmall} numberOfLines={1}>
                                  {ritual.subtitle}
                                </Text>
                              )}
                            </View>
                            <View style={[styles.ritualPlayBtn, { backgroundColor: `${ritualColor}30` }]}>
                              <Play size={12} color={ritualColor} fill={ritualColor} />
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Spiritual Rituals Section (from I Ching/Tarot) */}
                {spiritualRituals.length > 0 && (
                  <View style={styles.spiritualRitualsSection}>
                    <View style={styles.selectedSectionHeader}>
                      <Gem size={16} color="#9D4EDD" />
                      <Text style={styles.selectedSectionTitle}>Nghi Thức Tâm Linh</Text>
                      <Text style={[styles.selectedSectionProgress, { color: '#9D4EDD' }]}>
                        {spiritualRituals.filter(r => r?.completed).length}/{spiritualRituals.length}
                      </Text>
                    </View>

                    <View style={styles.spiritualRitualsContainer}>
                      {spiritualRituals.map((ritual, index) => (
                        <EditableSpiritualRitualItem
                          key={`spiritual_ritual_${index}_${ritual?.id || 'unknown'}`}
                          index={index}
                          ritual={ritual}
                          widgetId={goalWidget?.id}
                          isEditing={editingSpiritualRitualIndex === index}
                          onStartEdit={() => setEditingSpiritualRitualIndex(index)}
                          onSave={(idx, updatedRitual) => {
                            onSaveRitual?.(goalWidget, idx, updatedRitual);
                            setEditingSpiritualRitualIndex(null);
                          }}
                          onCancel={() => setEditingSpiritualRitualIndex(null)}
                          onDelete={(idx) => onDeleteRitual?.(goalWidget, idx)}
                          onToggleComplete={(ritualId) => onToggleRitual?.(goalWidget, ritualId)}
                        />
                      ))}
                      {/* Add new ritual button */}
                      <TouchableOpacity
                        style={styles.addItemBtn}
                        onPress={() => onAddRitual?.(goalWidget)}
                      >
                        <Plus size={14} color="#9D4EDD" />
                        <Text style={[styles.addItemBtnText, { color: '#9D4EDD' }]}>Thêm nghi thức</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            );
          })()}

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
            onPress={() => onDeleteMultiple?.(validIds)}
          >
            <Trash2 size={12} color="#E74C3C" />
            <Text style={styles.deleteIndividualGoalText}>Xóa mục tiêu này</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
    </Swipeable>
  );
});

// Selected Goal Content - Shows SEPARATED goals with their own affirmations and action steps
const SelectedGoalContent = memo(({
  lifeArea,
  group,
  onToggleHabit,
  onToggleGoalComplete,
  onDelete,
  onArchive,
  onDeleteMultiple,
  onEdit,
  onEditGoalTitle,
  onEditAffirmation,
  onEditActionStep,
  onSaveAffirmation,
  onSaveGoalTitle,
  onSaveActionStep,
  onSaveRitual,
  onToggleRitual,
  onDeleteAffirmation,
  onDeleteActionStep,
  onDeleteRitual,
  onAddAffirmation,
  onAddActionStep,
  onAddRitual,
  onAffirmationComplete,
  onReadAloud,
  completedToday,
  streak,
  // GLOBAL selection props (lifted state)
  isSelectionMode = false,
  selectedItems = new Set(),
  onLongPressGlobal,
  onToggleSelectGlobal,
  onCancelSelectionGlobal,
  onDeleteSelectedGlobal,
  onSelectAllGlobal,
  allGoalIds = [],
}) => {
  // Track which goals are expanded
  const [expandedGoals, setExpandedGoals] = useState({});
  // Track expanded state for fallback card (when no goal widgets)
  const [fallbackExpanded, setFallbackExpanded] = useState(true);

  if (!group) return null;

  const areaInfo = LIFE_AREA_LABELS[lifeArea] || { label: lifeArea, color: COLORS.gold };

  // Get all widgets from group
  const goalWidgets = group.goalWidgets || [];
  const affirmationWidgets = group.affirmationWidgets || [];
  const actionPlanWidgets = group.actionPlanWidgets || [];

  // Toggle expand for a specific goal - INSTANT response
  const handleToggleExpand = useCallback((goalId) => {
    // Instant state update - no animation delay
    setExpandedGoals(prev => ({
      ...prev,
      [goalId]: !prev[goalId],
    }));
  }, []);

  // Use global handlers passed from parent (for cross-group selection)
  const handleLongPress = useCallback((itemId) => {
    onLongPressGlobal?.(itemId);
  }, [onLongPressGlobal]);

  const handleToggleSelect = useCallback((itemId) => {
    onToggleSelectGlobal?.(itemId);
  }, [onToggleSelectGlobal]);

  const handleCancelSelection = useCallback(() => {
    onCancelSelectionGlobal?.();
  }, [onCancelSelectionGlobal]);

  const handleDeleteSelected = useCallback(() => {
    onDeleteSelectedGlobal?.();
  }, [onDeleteSelectedGlobal]);

  const handleSelectAll = useCallback(() => {
    onSelectAllGlobal?.(allGoalIds);
  }, [onSelectAllGlobal, allGoalIds]);

  // If no goal widgets, don't show this section at all
  // Orphaned affirmation/action_plan widgets will be shown in ungrouped sections instead
  if (goalWidgets.length === 0) {
    return null;
  }

  // Collect all widget IDs for batch delete
  const allWidgetIds = [
    ...goalWidgets.map(w => w?.id),
    ...affirmationWidgets.map(w => w?.id),
    ...actionPlanWidgets.map(w => w?.id),
  ].filter(id => id);

  // MAIN: Render each goal widget as a separate card
  // REMOVED: lifeAreaHeader and statsBar - user requested cleaner UI
  // REMOVED: Selection bar moved to parent level (globalSelectionModeBar)
  return (
    <View style={styles.selectedGoalContentList}>
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
          onArchive={onArchive}
          onDeleteMultiple={onDeleteMultiple}
          onEdit={onEdit}
          onEditGoalTitle={onEditGoalTitle}
          onEditAffirmation={onEditAffirmation}
          onEditActionStep={onEditActionStep}
          onSaveAffirmation={onSaveAffirmation}
          onSaveGoalTitle={onSaveGoalTitle}
          onSaveActionStep={onSaveActionStep}
          onSaveRitual={onSaveRitual}
          onToggleRitual={onToggleRitual}
          onDeleteAffirmation={onDeleteAffirmation}
          onDeleteActionStep={onDeleteActionStep}
          onDeleteRitual={onDeleteRitual}
          onAddAffirmation={onAddAffirmation}
          onAddActionStep={onAddActionStep}
          onAddRitual={onAddRitual}
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

// Action Plan/Habits Section Component - ALWAYS GROUPED BY FREQUENCY
// Per user request: Actions grouped as daily/weekly/monthly
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

  // ALWAYS group by frequency - default to 'daily' for items without frequency
  // This ensures consistent UI regardless of when data was created
  const groupedByFrequency = useMemo(() => {
    const groups = {
      daily: [],
      weekly: [],
      monthly: [],
      one_time_pending: [],
      one_time_completed: [],
    };

    habits.forEach(h => {
      const freq = h?.frequency || h?.action_type || 'daily';
      if (freq === 'one_time') {
        if (h?.completed) {
          groups.one_time_completed.push(h);
        } else {
          groups.one_time_pending.push(h);
        }
      } else if (groups[freq]) {
        groups[freq].push(h);
      } else {
        groups.daily.push(h); // Default to daily for unknown types
      }
    });

    return groups;
  }, [habits]);

  // Collapse state for completed one-time actions
  const [showCompleted, setShowCompleted] = useState(false);

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
        // ALWAYS show grouped by frequency
        <>
          {/* One-time pending actions - show first */}
          {groupedByFrequency.one_time_pending.length > 0 && (
            <View style={styles.frequencyGroup}>
              <View style={[styles.frequencyHeader, { borderLeftColor: '#8B5CF6' }]}>
                <Text style={styles.frequencyIcon}>✅</Text>
                <Text style={[styles.frequencyTitle, { color: '#8B5CF6' }]}>
                  Một lần
                </Text>
                <Text style={styles.frequencyCount}>
                  {groupedByFrequency.one_time_pending.length} việc
                </Text>
              </View>

              {groupedByFrequency.one_time_pending.map((habit, index) => (
                <TouchableOpacity
                  key={habit?.id || `one_time_${index}`}
                  style={styles.checklistItem}
                  onPress={() => {
                    console.log('[ActionPlanSection] Toggling one-time:', habit?.id);
                    onToggle?.(habit?.id, 'habit');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, styles.checkboxPurple]}>
                    {habit?.completed && <Check size={14} color="#fff" />}
                  </View>
                  <Text style={styles.checklistText}>
                    {habit?.title || habit?.text || 'Hành động'}
                  </Text>
                  <Edit3 size={14} color={COLORS.textMuted} style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Daily actions */}
          {groupedByFrequency.daily.length > 0 && (
            <View style={styles.frequencyGroup}>
              <View style={[styles.frequencyHeader, { borderLeftColor: FREQUENCY_LABELS.daily.color }]}>
                <Text style={styles.frequencyIcon}>{FREQUENCY_LABELS.daily.icon}</Text>
                <Text style={[styles.frequencyTitle, { color: FREQUENCY_LABELS.daily.color }]}>
                  {FREQUENCY_LABELS.daily.label}
                </Text>
                <Text style={styles.frequencyCount}>
                  {groupedByFrequency.daily.filter(h => h?.completed).length}/{groupedByFrequency.daily.length}
                </Text>
              </View>

              {groupedByFrequency.daily.map((habit, index) => (
                <TouchableOpacity
                  key={habit?.id || `daily_${index}`}
                  style={[
                    styles.checklistItem,
                    { borderLeftWidth: 3, borderLeftColor: habit?.completed ? FREQUENCY_LABELS.daily.color : 'transparent' },
                  ]}
                  onPress={() => {
                    console.log('[ActionPlanSection] Toggling daily:', habit?.id);
                    onToggle?.(habit?.id, 'habit');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    styles.checkboxPurple,
                    habit?.completed && styles.checkboxCheckedPurple,
                    habit?.completed && { backgroundColor: FREQUENCY_LABELS.daily.color, borderColor: FREQUENCY_LABELS.daily.color },
                  ]}>
                    {habit?.completed && <Check size={14} color="#fff" />}
                  </View>
                  <Text style={[
                    styles.checklistText,
                    habit?.completed && styles.checklistTextCompleted
                  ]}>
                    {habit?.title || habit?.text || 'Thói quen'}
                  </Text>
                  <Edit3 size={14} color={COLORS.textMuted} style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Weekly actions */}
          {groupedByFrequency.weekly.length > 0 && (
            <View style={styles.frequencyGroup}>
              <View style={[styles.frequencyHeader, { borderLeftColor: FREQUENCY_LABELS.weekly.color }]}>
                <Text style={styles.frequencyIcon}>{FREQUENCY_LABELS.weekly.icon}</Text>
                <Text style={[styles.frequencyTitle, { color: FREQUENCY_LABELS.weekly.color }]}>
                  {FREQUENCY_LABELS.weekly.label}
                </Text>
                <Text style={styles.frequencyCount}>
                  {groupedByFrequency.weekly.filter(h => h?.completed).length}/{groupedByFrequency.weekly.length}
                </Text>
              </View>

              {groupedByFrequency.weekly.map((habit, index) => (
                <TouchableOpacity
                  key={habit?.id || `weekly_${index}`}
                  style={[
                    styles.checklistItem,
                    { borderLeftWidth: 3, borderLeftColor: habit?.completed ? FREQUENCY_LABELS.weekly.color : 'transparent' },
                  ]}
                  onPress={() => {
                    console.log('[ActionPlanSection] Toggling weekly:', habit?.id);
                    onToggle?.(habit?.id, 'habit');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    styles.checkboxPurple,
                    habit?.completed && styles.checkboxCheckedPurple,
                    habit?.completed && { backgroundColor: FREQUENCY_LABELS.weekly.color, borderColor: FREQUENCY_LABELS.weekly.color },
                  ]}>
                    {habit?.completed && <Check size={14} color="#fff" />}
                  </View>
                  <Text style={[
                    styles.checklistText,
                    habit?.completed && styles.checklistTextCompleted
                  ]}>
                    {habit?.title || habit?.text || 'Thói quen'}
                  </Text>
                  <Edit3 size={14} color={COLORS.textMuted} style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Monthly actions */}
          {groupedByFrequency.monthly.length > 0 && (
            <View style={styles.frequencyGroup}>
              <View style={[styles.frequencyHeader, { borderLeftColor: FREQUENCY_LABELS.monthly.color }]}>
                <Text style={styles.frequencyIcon}>{FREQUENCY_LABELS.monthly.icon}</Text>
                <Text style={[styles.frequencyTitle, { color: FREQUENCY_LABELS.monthly.color }]}>
                  {FREQUENCY_LABELS.monthly.label}
                </Text>
                <Text style={styles.frequencyCount}>
                  {groupedByFrequency.monthly.filter(h => h?.completed).length}/{groupedByFrequency.monthly.length}
                </Text>
              </View>

              {groupedByFrequency.monthly.map((habit, index) => (
                <TouchableOpacity
                  key={habit?.id || `monthly_${index}`}
                  style={[
                    styles.checklistItem,
                    { borderLeftWidth: 3, borderLeftColor: habit?.completed ? FREQUENCY_LABELS.monthly.color : 'transparent' },
                  ]}
                  onPress={() => {
                    console.log('[ActionPlanSection] Toggling monthly:', habit?.id);
                    onToggle?.(habit?.id, 'habit');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    styles.checkboxPurple,
                    habit?.completed && styles.checkboxCheckedPurple,
                    habit?.completed && { backgroundColor: FREQUENCY_LABELS.monthly.color, borderColor: FREQUENCY_LABELS.monthly.color },
                  ]}>
                    {habit?.completed && <Check size={14} color="#fff" />}
                  </View>
                  <Text style={[
                    styles.checklistText,
                    habit?.completed && styles.checklistTextCompleted
                  ]}>
                    {habit?.title || habit?.text || 'Thói quen'}
                  </Text>
                  <Edit3 size={14} color={COLORS.textMuted} style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Completed one-time actions - collapsible */}
          {groupedByFrequency.one_time_completed.length > 0 && (
            <View style={styles.frequencyGroup}>
              <TouchableOpacity
                style={[styles.frequencyHeader, { borderLeftColor: '#6B7280' }]}
                onPress={() => setShowCompleted(!showCompleted)}
              >
                <Text style={styles.frequencyIcon}>✓</Text>
                <Text style={[styles.frequencyTitle, { color: '#6B7280' }]}>
                  Đã hoàn thành
                </Text>
                <Text style={styles.frequencyCount}>
                  {groupedByFrequency.one_time_completed.length} việc
                </Text>
                <ChevronRight
                  size={16}
                  color="#6B7280"
                  style={{ transform: [{ rotate: showCompleted ? '90deg' : '0deg' }] }}
                />
              </TouchableOpacity>

              {showCompleted && groupedByFrequency.one_time_completed.map((habit, index) => (
                <View
                  key={habit?.id || `completed_${index}`}
                  style={[styles.checklistItem, { opacity: 0.6 }]}
                >
                  <View style={[
                    styles.checkbox,
                    styles.checkboxCheckedPurple,
                    { backgroundColor: '#6B7280', borderColor: '#6B7280' }
                  ]}>
                    <Check size={14} color="#fff" />
                  </View>
                  <Text style={[styles.checklistText, styles.checklistTextCompleted]}>
                    {habit?.title || habit?.text || 'Hành động'}
                  </Text>
                </View>
              ))}
            </View>
          )}

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

// Crystal Section Component - With Affirmation & Action Plan support
const CrystalSection = memo(({
  crystals,
  widgets,
  onEdit,
  onDelete,
  onToggleHabit,
  onSaveAffirmation,
  onSaveActionStep,
  onDeleteAffirmation,
  onDeleteActionStep,
  onAddAffirmation,
  onAddActionStep,
  onAffirmationComplete,
  onReadAloud,
}) => {
  // Get crystal widgets (use helper function for legacy type support)
  const crystalWidgets = widgets?.filter(w => isCrystalType(w?.type)) || [];

  // Track expanded state for each crystal
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [editingAffirmationIndex, setEditingAffirmationIndex] = useState(null);
  const [editingActionStepIndex, setEditingActionStepIndex] = useState(null);

  if (crystals.length === 0) return null;

  // Toggle expand for a crystal item
  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

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

      {crystals.map((crystal, index) => {
        const crystalWidget = crystalWidgets[index];
        const crystalId = crystalWidget?.id;
        const isExpanded = expandedIndex === index;

        // Find linked affirmation and action_plan widgets for this crystal
        const linkedAffirmationWidget = widgets?.find(w =>
          w?.type === 'affirmation' && w?.content?.linked_crystal_id === crystalId
        );
        const linkedActionPlanWidget = widgets?.find(w =>
          (w?.type === 'habit' || w?.type === 'action_plan') && w?.content?.linked_crystal_id === crystalId
        );

        // Also check for widgets with same lifeArea = 'spiritual' created around the same time
        const crystalCreatedAt = crystalWidget?.created_at ? new Date(crystalWidget.created_at).getTime() : 0;
        const timeWindow = 5 * 60 * 1000; // 5 minutes

        const spiritualAffirmation = !linkedAffirmationWidget ? widgets?.find(w =>
          w?.type === 'affirmation' &&
          w?.content?.lifeArea === 'spiritual' &&
          w?.created_at && Math.abs(new Date(w.created_at).getTime() - crystalCreatedAt) < timeWindow
        ) : linkedAffirmationWidget;

        const spiritualActionPlan = !linkedActionPlanWidget ? widgets?.find(w =>
          (w?.type === 'habit' || w?.type === 'action_plan') &&
          w?.content?.lifeArea === 'spiritual' &&
          w?.created_at && Math.abs(new Date(w.created_at).getTime() - crystalCreatedAt) < timeWindow
        ) : linkedActionPlanWidget;

        // Get affirmations and action steps
        const affirmations = spiritualAffirmation?.content?.affirmations || [];
        const actionSteps = spiritualActionPlan?.content?.habits || spiritualActionPlan?.content?.steps || [];
        const hasLinkedContent = affirmations.length > 0 || actionSteps.length > 0;

        // Calculate progress for action steps
        const completedSteps = actionSteps.filter(s => s?.completed || s?.done).length;
        const totalSteps = actionSteps.length;
        const stepsPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

        return (
          <View key={index}>
            <TouchableOpacity
              style={styles.crystalItem}
              onPress={() => toggleExpand(index)}
              activeOpacity={0.7}
            >
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
              <ChevronDown
                size={18}
                color={COLORS.textMuted}
                style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
              />
            </TouchableOpacity>

            {/* Expanded Content - Affirmations & Action Plan */}
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

                    {affirmations.map((aff, affIndex) => (
                      <EditableAffirmationItem
                        key={affIndex}
                        index={affIndex}
                        text={aff}
                        widgetId={spiritualAffirmation?.id}
                        isEditing={editingAffirmationIndex === affIndex}
                        onStartEdit={() => setEditingAffirmationIndex(affIndex)}
                        onSave={(idx, newText) => {
                          onSaveAffirmation?.(spiritualAffirmation, idx, newText);
                          setEditingAffirmationIndex(null);
                        }}
                        onCancel={() => setEditingAffirmationIndex(null)}
                        onDelete={(idx) => onDeleteAffirmation?.(spiritualAffirmation, idx)}
                        onReadAloud={onReadAloud}
                        onAffirmationComplete={onAffirmationComplete}
                      />
                    ))}
                    {/* Add new affirmation button */}
                    <TouchableOpacity
                      style={styles.addItemBtn}
                      onPress={() => onAddAffirmation?.(spiritualAffirmation)}
                    >
                      <Plus size={14} color={COLORS.gold} />
                      <Text style={styles.addItemBtnText}>Thêm khẳng định</Text>
                    </TouchableOpacity>
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

                    {actionSteps.map((step, stepIndex) => (
                      <EditableActionStepItem
                        key={step?.id || stepIndex}
                        index={stepIndex}
                        step={step}
                        widgetId={spiritualActionPlan?.id}
                        isEditing={editingActionStepIndex === stepIndex}
                        onStartEdit={() => setEditingActionStepIndex(stepIndex)}
                        onSave={(idx, newText) => {
                          onSaveActionStep?.(spiritualActionPlan, idx, newText);
                          setEditingActionStepIndex(null);
                        }}
                        onCancel={() => setEditingActionStepIndex(null)}
                        onDelete={(idx) => onDeleteActionStep?.(spiritualActionPlan, idx)}
                        onToggleComplete={onToggleHabit}
                      />
                    ))}
                    {/* Add new action step button */}
                    <TouchableOpacity
                      style={styles.addItemBtn}
                      onPress={() => onAddActionStep?.(spiritualActionPlan)}
                    >
                      <Plus size={14} color="#6C63FF" />
                      <Text style={[styles.addItemBtnText, { color: '#6C63FF' }]}>Thêm bước hành động</Text>
                    </TouchableOpacity>

                    <View style={styles.actionStepProgress}>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, styles.progressFillPurple, { width: `${stepsPercent}%` }]} />
                      </View>
                      <Text style={[styles.progressPercent, { color: '#6C63FF' }]}>{stepsPercent}%</Text>
                    </View>
                  </View>
                )}

                {/* No content message */}
                {!hasLinkedContent && (
                  <View style={styles.noContentSection}>
                    <Text style={styles.noContentText}>
                      Chưa có khẳng định và kế hoạch cho crystal này
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        );
      })}
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

// ============================================
// GLOBAL CACHE - persists across tab switches
// ============================================
const visionBoardCache = {
  widgets: null,
  readingHistory: null,
  lastFetch: 0,
  CACHE_DURATION: 300000, // 5 minutes - reduced API calls for better performance
};

const VisionBoardScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, userTier } = useAuth();

  // Ref to hold the primer sound that keeps audio session in playback mode (iOS silent mode fix)
  const primerSoundRef = useRef(null);

  // Refs for scroll to section functionality
  const scrollViewRef = useRef(null);
  const goalsSectionY = useRef(0);
  const pendingScrollToGoals = useRef(false); // Track pending scroll request
  const pendingModalReopen = useRef(null); // Track pending modal reopen after returning from JournalEntry/EditEvent

  // Tooltip hook for feature discovery
  const { showTooltipForScreen, initialized: tooltipInitialized } = useTooltip();

  // Try to get tab bar context
  let tabBarContext = null;
  try {
    tabBarContext = useTabBar();
  } catch (e) {
    // Context not available
  }

  // State - initialize from global cache for instant display
  const [loading, setLoading] = useState(!visionBoardCache.widgets);
  const [refreshing, setRefreshing] = useState(false);
  const [widgets, setWidgets] = useState(() => visionBoardCache.widgets || []);
  const [alertConfig, setAlertConfig] = useState({ visible: false });

  // Affirmation state
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0);
  const [affirmationsCompletedToday, setAffirmationsCompletedToday] = useState(0);
  const [affirmationStreak, setAffirmationStreak] = useState(0);

  // Selected goal state - which lifeArea goal is currently selected
  const [selectedGoalLifeArea, setSelectedGoalLifeArea] = useState(null);
  // Track affirmation index per lifeArea
  const [goalAffirmationIndexes, setGoalAffirmationIndexes] = useState({});

  // GLOBAL Multi-select state (lifted from SelectedGoalContent for cross-group selection)
  const [globalSelectionMode, setGlobalSelectionMode] = useState(false);
  const [globalSelectedItems, setGlobalSelectedItems] = useState(new Set());

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalCreationOptions, setShowGoalCreationOptions] = useState(false);
  const [showTemplateSelectorModal, setShowTemplateSelectorModal] = useState(false);
  const [showCalendarTemplateSelector, setShowCalendarTemplateSelector] = useState(false); // For calendar add event flow
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

  // NEW: Goal Setup Questionnaire state (deeper personalization flow)
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  // Gamification state
  const [showStreakHistory, setShowStreakHistory] = useState(false);

  // NEW: Settings modal state for daily reminder
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(8);
  const [reminderMinute, setReminderMinute] = useState(0);

  // Gamification tracking hooks (4 categories: affirmation, habit, goal, action)
  const { trackAffirmation, trackHabit, trackGoal, trackAction } = useGamificationTracking();

  // NEW: State for Calendar/Charts sections
  const [calendarEvents, setCalendarEvents] = useState({});
  const [activeTooltip, setActiveTooltip] = useState(null); // 'calendar', 'radar', 'weekly', 'xp'
  const [dayDetailModalVisible, setDayDetailModalVisible] = useState(false);
  const [addEventModalVisible, setAddEventModalVisible] = useState(false);
  const [journalRituals, setJournalRituals] = useState([]);
  const [journalReadings, setJournalReadings] = useState([]);
  const [journalPaperTrades, setJournalPaperTrades] = useState([]);
  const [journalTradingJournal, setJournalTradingJournal] = useState([]);
  const [journalActions, setJournalActions] = useState([]);
  // Calendar Smart Journal data
  const [journalEntries, setJournalEntries] = useState([]);
  const [tradingEntries, setTradingEntries] = useState([]);
  const [journalMood, setJournalMood] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [lifeAreaScores, setLifeAreaScores] = useState({
    finance: 0,
    career: 0,
    health: 0,
    relationships: 0,
    personal: 0,
    spiritual: 0,
  });
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [streakDays, setStreakDays] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [xpToday, setXpToday] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelTitle, setLevelTitle] = useState('Người Mới Bắt Đầu');
  const [xpForNextLevel, setXpForNextLevel] = useState(100);
  const [xpProgress, setXpProgress] = useState(0);

  // NEW: Reading history from database (tarot_readings + iching_readings)
  const [savedReadings, setSavedReadings] = useState([]);

  // DEBUG: Log stats state changes
  useEffect(() => {
    console.log('[VisionBoard] Stats state updated:', {
      user: user?.id,
      streakDays,
      comboCount,
      xpToday,
      weeklyProgressLength: weeklyProgress?.length,
      lifeAreaScores,
    });
  }, [user?.id, streakDays, comboCount, xpToday, weeklyProgress, lifeAreaScores]);

  // Computed level data for XPGoalTracker full card
  const currentLevelData = useMemo(() => {
    return LEVELS.find(l => l.level === currentLevel) || LEVELS[0];
  }, [currentLevel]);

  const nextLevelData = useMemo(() => {
    return LEVELS.find(l => l.level === currentLevel + 1) || LEVELS[LEVELS.length - 1];
  }, [currentLevel]);

  // Weekly XP earned (calculated from weeklyProgress or xpToday as fallback)
  const weeklyXPEarned = useMemo(() => {
    if (weeklyProgress && weeklyProgress.length > 0) {
      // Sum up XP from weekly progress data
      return weeklyProgress.reduce((sum, day) => sum + (day.value || 0), 0);
    }
    return xpToday; // Fallback to today's XP
  }, [weeklyProgress, xpToday]);

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

  // Combine all readings (tarot and iching) - from BOTH widgets AND saved readings database
  const allReadings = useMemo(() => {
    // 1. Widget-based readings (legacy)
    const widgetReadings = widgets
      .filter(w => isReadingType(w?.type))
      .map(w => ({
        id: w?.id,
        type: w?.type,
        title: w?.title,
        content: parseWidgetContent(w),
        created_at: w?.created_at,
        source: 'widget',
      }));

    // 2. Database readings from tarot_readings/iching_readings tables
    const dbReadings = savedReadings.map(r => {
      const isIChing = r.reading_type === 'iching';

      // Map content to match DivinationCard expectations
      const content = isIChing ? {
        // I-Ching fields
        question: r.question,
        lifeArea: r.life_area,
        hexagramNumber: r.present_hexagram?.number || r.present_hexagram,
        hexagramName: r.present_hexagram?.name || r.present_hexagram?.vietnameseName,
        vietnameseName: r.present_hexagram?.vietnameseName || r.present_hexagram?.name,
        chineseName: r.present_hexagram?.chineseName,
        presentHexagram: r.present_hexagram,
        futureHexagram: r.future_hexagram,
        changingLines: r.changing_lines,
        overallInterpretation: r.overall_interpretation,
        aiInterpretation: r.ai_interpretation,
      } : {
        // Tarot fields
        question: r.question,
        lifeArea: r.life_area,
        spreadName: r.spread_type || 'Tarot',
        spreadType: r.spread_type,
        // Map card fields for proper image loading
        // Note: card_id may be stored as string in JSONB - need to preserve type for getCardImage
        cards: (r.cards || []).map(c => {
          let cardId = c.card_id || c.id;
          // Convert numeric strings to numbers (Major Arcana IDs are 0-21)
          if (typeof cardId === 'string' && /^\d+$/.test(cardId)) {
            cardId = parseInt(cardId, 10);
          }
          return {
            id: cardId,
            vietnamese: c.name || c.vietnamese || c.vietnameseName,
            name: c.name || c.vietnamese || c.vietnameseName,
            position: c.position,
            isReversed: c.reversed || c.isReversed,
          };
        }),
        overallInterpretation: r.overall_interpretation,
        aiInterpretation: r.ai_interpretation,
      };

      return {
        id: r.id,
        type: isIChing ? 'iching' : 'tarot',
        title: r.question || (isIChing ? 'Gieo quẻ Kinh Dịch' : `Trải bài ${r.spread_type || 'Tarot'}`),
        content,
        created_at: r.created_at,
        source: 'database',
        starred: r.is_starred,
      };
    });

    // 3. Combine and sort by created_at (newest first)
    const combined = [...widgetReadings, ...dbReadings];
    combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    console.log('[VisionBoard] Combined readings:', combined.length, '(widgets:', widgetReadings.length, ', database:', dbReadings.length, ')');
    return combined;
  }, [widgets, savedReadings]);

  // Current affirmation
  const currentAffirmation = allAffirmations[currentAffirmationIndex] || '';

  // Check if empty - only show empty state when NOT loading AND no widgets
  // During loading, we show the content (with skeleton if needed) instead of empty state
  const isVisionBoardEmpty = !loading && widgets.length === 0;

  // Extract action items (steps) from goal widgets for accurate progress tracking
  // This counts individual action items, not just goals marked as "completed"
  const goalActionStats = useMemo(() => {
    let actionsTotal = 0;
    let actionsCompleted = 0;

    // Extract steps/actionSteps from goal widgets
    goalWidgets.forEach(widget => {
      const content = parseWidgetContent(widget);
      const steps = [...(content?.steps || []), ...(content?.actionSteps || [])];
      actionsTotal += steps.length;
      actionsCompleted += steps.filter(s => s?.is_completed || s?.completed).length;
    });

    return { actionsTotal, actionsCompleted };
  }, [goalWidgets]);

  // Stats for overview - now uses action items from goals, not just goal.completed
  const stats = {
    // Use action items count instead of goals marked as completed
    goalsCompleted: goalActionStats.actionsCompleted,
    goalsTotal: goalActionStats.actionsTotal || allGoals.length, // Fallback to goals count if no actions
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
        } else {
          // FIX: Don't create empty groups for affirmation/habit without matching goal
          // Put them in ungrouped instead - they'll be linked via fallback if needed
          if (isAff) {
            ungroupedAffirmationWidgets.push(w);
          } else {
            ungroupedActionPlanWidgets.push(w);
          }
          ungroupedWidgets.push(w);
        }
      }
    });

    // Third pass: FALLBACK - Link ungrouped affirmation/action_plan to groups based on linked_goal_id
    // UPDATED: Only link if the widget has a linked_goal_id matching a goal in the group
    // This prevents orphaned widgets from being incorrectly linked
    const groupKeys = Object.keys(groups);
    if (groupKeys.length > 0) {
      // Get all goal IDs per group for quick lookup
      const goalIdsByGroup = {};
      groupKeys.forEach(lifeArea => {
        goalIdsByGroup[lifeArea] = new Set(
          groups[lifeArea].goalWidgets.map(g => g?.id).filter(Boolean)
        );
      });

      // Link ungrouped affirmation widgets to their proper goals via linked_goal_id
      [...ungroupedAffirmationWidgets].forEach(affWidget => {
        const content = parseWidgetContent(affWidget);
        const linkedGoalId = content?.linked_goal_id;

        if (linkedGoalId) {
          // Find which group contains this goal
          const targetGroup = groupKeys.find(la => goalIdsByGroup[la]?.has(linkedGoalId));
          if (targetGroup) {
            groups[targetGroup].affirmationWidgets.push(affWidget);
            // Remove from ungrouped arrays
            const affIdx = ungroupedAffirmationWidgets.indexOf(affWidget);
            if (affIdx !== -1) ungroupedAffirmationWidgets.splice(affIdx, 1);
            const idx = ungroupedWidgets.findIndex(w => w?.id === affWidget?.id);
            if (idx !== -1) ungroupedWidgets.splice(idx, 1);
            console.log('[VisionBoard] FALLBACK: Linked affirmation', affWidget?.id, 'to group', targetGroup, 'via linked_goal_id');
          }
        }
        // NOTE: Widgets without linked_goal_id stay in ungrouped (but won't be displayed due to filtering)
      });

      // Link ungrouped action_plan widgets to their proper goals via linked_goal_id
      [...ungroupedActionPlanWidgets].forEach(apWidget => {
        const content = parseWidgetContent(apWidget);
        const linkedGoalId = content?.linked_goal_id;

        if (linkedGoalId) {
          // Find which group contains this goal
          const targetGroup = groupKeys.find(la => goalIdsByGroup[la]?.has(linkedGoalId));
          if (targetGroup) {
            groups[targetGroup].actionPlanWidgets.push(apWidget);
            // Remove from ungrouped arrays
            const apIdx = ungroupedActionPlanWidgets.indexOf(apWidget);
            if (apIdx !== -1) ungroupedActionPlanWidgets.splice(apIdx, 1);
            const idx = ungroupedWidgets.findIndex(w => w?.id === apWidget?.id);
            if (idx !== -1) ungroupedWidgets.splice(idx, 1);
            console.log('[VisionBoard] FALLBACK: Linked action_plan', apWidget?.id, 'to group', targetGroup, 'via linked_goal_id');
          }
        }
        // NOTE: Widgets without linked_goal_id stay in ungrouped (but won't be displayed due to filtering)
      });
    }

    // Fourth pass: All other widget types go to ungrouped (crystals, iching, tarot, etc.)
    widgets.forEach(w => {
      // Skip if already processed (goal, affirmation, habit types)
      if (!isGoalType(w?.type) && !isAffirmationType(w?.type) && !isHabitType(w?.type)) {
        ungroupedWidgets.push(w);
      }
    });

    // Fifth pass: Filter out groups that have NO goal widgets (only affirmation/action_plan)
    // These orphaned widgets will be shown in ungrouped sections instead
    const filteredGroups = {};
    Object.entries(groups).forEach(([lifeArea, group]) => {
      if (group.goalWidgets.length > 0) {
        filteredGroups[lifeArea] = group;
      } else {
        // Move orphaned affirmation/action_plan widgets back to ungrouped
        group.affirmationWidgets.forEach(w => {
          if (!ungroupedWidgets.find(uw => uw?.id === w?.id)) {
            ungroupedWidgets.push(w);
          }
        });
        group.actionPlanWidgets.forEach(w => {
          if (!ungroupedWidgets.find(uw => uw?.id === w?.id)) {
            ungroupedWidgets.push(w);
          }
        });
        console.log('[VisionBoard] Filtered out empty group:', lifeArea, '(no goal widgets)');
      }
    });

    console.log('[VisionBoard] Groups:', Object.keys(filteredGroups));
    Object.entries(filteredGroups).forEach(([key, group]) => {
      console.log('[VisionBoard]', key, '- goals:', group.goalWidgets.length, 'affs:', group.affirmationWidgets.length, 'actions:', group.actionPlanWidgets.length);
    });
    console.log('[VisionBoard] Ungrouped:', ungroupedWidgets.length);

    return { groups: filteredGroups, ungroupedWidgets };
  }, [widgets]);

  // Get ungrouped widgets (use helper functions for legacy type support)
  const ungroupedGoals = groupedByLifeArea.ungroupedWidgets
    .filter(w => isGoalType(w?.type))
    .flatMap(w => extractGoals(parseWidgetContent(w), w?.id));

  // Get all valid goal widget IDs (for checking linked_goal_id validity)
  const allGoalWidgetIds = useMemo(() => {
    const ids = new Set();
    // From grouped widgets
    Object.values(groupedByLifeArea.groups).forEach(group => {
      (group.goalWidgets || []).forEach(w => {
        if (w?.id) ids.add(w.id);
      });
    });
    // From ungrouped goals
    groupedByLifeArea.ungroupedWidgets.forEach(w => {
      if (isGoalType(w?.type) && w?.id) ids.add(w.id);
    });
    return ids;
  }, [groupedByLifeArea]);

  // FILTER: Only show ungrouped affirmations that have a VALID linked_goal_id
  // Orphaned affirmation widgets (no goal association) should NOT be displayed
  // This prevents "Khẳng định hôm nay" from auto-displaying when there are no goals
  const ungroupedAffirmations = [...new Set(
    groupedByLifeArea.ungroupedWidgets
      .filter(w => {
        if (!isAffirmationType(w?.type)) return false;
        const content = parseWidgetContent(w);
        const linkedGoalId = content?.linked_goal_id;

        // STRICT: Only show if linked to an EXISTING goal
        // Orphaned widgets (no linked_goal_id or invalid linked_goal_id) are hidden
        if (!linkedGoalId) {
          console.log('[VisionBoard] Hiding orphaned affirmation (no linked_goal_id):', w?.id);
          return false;
        }
        if (!allGoalWidgetIds.has(linkedGoalId)) {
          console.log('[VisionBoard] Hiding orphaned affirmation (goal deleted):', w?.id, 'linkedTo:', linkedGoalId);
          return false;
        }
        return true;
      })
      .flatMap(w => extractAffirmations(parseWidgetContent(w)))
      .filter(a => a && typeof a === 'string' && a.trim())
  )];

  // FILTER: Only show ungrouped habits/action_plans that have a VALID linked_goal_id
  // Orphaned action_plan widgets (no goal association) should NOT be displayed
  const ungroupedHabits = groupedByLifeArea.ungroupedWidgets
    .filter(w => {
      if (!isHabitType(w?.type) || isGoalType(w?.type)) return false;
      const content = parseWidgetContent(w);
      const linkedGoalId = content?.linked_goal_id;

      // STRICT: Only show if linked to an EXISTING goal
      if (!linkedGoalId) {
        console.log('[VisionBoard] Hiding orphaned action_plan (no linked_goal_id):', w?.id);
        return false;
      }
      if (!allGoalWidgetIds.has(linkedGoalId)) {
        console.log('[VisionBoard] Hiding orphaned action_plan (goal deleted):', w?.id, 'linkedTo:', linkedGoalId);
        return false;
      }
      return true;
    })
    .flatMap(w => extractHabits(parseWidgetContent(w), w?.id));

  // Check if there are grouped widgets
  const hasGroupedWidgets = Object.keys(groupedByLifeArea.groups).length > 0;

  // Calculate ALL goal IDs across ALL groups (for global multi-select)
  const allGoalIds = useMemo(() => {
    const ids = [];
    Object.values(groupedByLifeArea.groups).forEach(group => {
      (group.goalWidgets || []).forEach(w => {
        if (w?.id) ids.push(w.id);
      });
    });
    return ids;
  }, [groupedByLifeArea.groups]);

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
        .or('archived.is.null,archived.eq.false') // Exclude archived widgets
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[VisionBoard] Query error:', error.message);
        setWidgets([]);
      } else {
        console.log('[VisionBoard] Loaded widgets:', data?.length || 0);
        // Debug: Log goal widgets with their ritual data
        const goalWidgets = data?.filter(w => w?.type === 'goal') || [];
        goalWidgets.forEach((gw, i) => {
          const content = typeof gw.content === 'string' ? JSON.parse(gw.content) : gw.content;
          console.log(`[VisionBoard] Goal ${i + 1} ritual data:`, {
            id: gw.id,
            title: gw.title,
            contentType: typeof gw.content,
            contentRituals: content?.rituals,
            goals0Rituals: content?.goals?.[0]?.rituals,
          });
        });
        setWidgets(data || []);
        visionBoardCache.widgets = data || []; // Update global cache
      }
    } catch (err) {
      console.error('[VisionBoard] Error:', err);
      setWidgets([]);
    } finally {
      setLoading(false);
      // Update global cache time
      visionBoardCache.lastFetch = Date.now();
    }
  }, [user?.id]);

  // Initial load - only if no cache exists
  useEffect(() => {
    if (!visionBoardCache.widgets) {
      fetchWidgets();
    }
  }, [fetchWidgets]);

  // Load Vision Board daily reminder settings
  useEffect(() => {
    const loadReminderSettings = async () => {
      const settings = await notificationService.getVisionBoardReminderSettings();
      if (settings) {
        setReminderEnabled(settings.enabled || false);
        setReminderHour(settings.hour ?? 8);
        setReminderMinute(settings.minute ?? 0);
      }
    };
    loadReminderSettings();
  }, []);

  // Cleanup primer sound and Speech on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
      if (primerSoundRef.current) {
        primerSoundRef.current.stopAsync().catch(() => {});
        primerSoundRef.current.unloadAsync().catch(() => {});
        primerSoundRef.current = null;
      }
    };
  }, []);

  // Load today's activity counts (affirmations, habits) from database
  const loadTodayActivityCounts = useCallback(async () => {
    if (!user?.id) return;
    try {
      const counts = await statsService.getTodayActivityCounts(user.id);
      console.log('[VisionBoard] Loaded today activity counts:', counts);
      setAffirmationsCompletedToday(counts.affirmationsCompleted || 0);
      // Note: habitsCompleted could be used if we track habits separately
    } catch (err) {
      console.error('[VisionBoard] Error loading activity counts:', err);
    }
  }, [user?.id]);

  // Re-fetch widgets when screen gets focus - WITH GLOBAL CACHING for instant display
  // Key principle: NEVER show loading if we have ANY cached data
  // ALWAYS fetch fresh data on focus to sync updates from GoalDetailScreen
  useFocusEffect(
    useCallback(() => {
      // IMMEDIATELY sync from cache - no waiting for instant display
      if (visionBoardCache.widgets) {
        console.log('[VisionBoard] Screen focused - using cached data for instant display');
        setLoading(false);
        if (widgets !== visionBoardCache.widgets) {
          setWidgets(visionBoardCache.widgets);
        }
      }

      // ALWAYS fetch fresh data in background (ignore cache expiry)
      // This ensures action progress updates from GoalDetailScreen are reflected immediately
      console.log('[VisionBoard] Screen focused - ALWAYS fetching fresh data');
      Promise.all([
        fetchWidgets(),
        fetchReadingHistory(),
        fetchCalendarAndCharts(),
        loadTodayActivityCounts(), // Load affirmation/habit counts from DB
      ]);
    }, [fetchWidgets, fetchReadingHistory, fetchCalendarAndCharts, loadTodayActivityCounts])
  );

  // =========== HANDLE SCROLL TO SECTION FROM NAVIGATION PARAMS ===========
  // Helper function to scroll to goals section
  const scrollToGoalsSection = useCallback(() => {
    if (goalsSectionY.current > 0 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: goalsSectionY.current - 100, // Offset for header
        animated: true,
      });
      pendingScrollToGoals.current = false;
      return true;
    }
    return false;
  }, []);

  useFocusEffect(
    useCallback(() => {
      const scrollToSection = route.params?.scrollToSection;
      if (scrollToSection === 'goals') {
        // Clear the param immediately to prevent re-triggering
        navigation.setParams({ scrollToSection: undefined });

        if (goalsSectionY.current > 0) {
          // Layout already calculated, scroll after short delay
          setTimeout(() => {
            scrollToGoalsSection();
          }, 400);
        } else {
          // Layout not ready yet, set pending flag
          pendingScrollToGoals.current = true;
          // Also try with longer delay in case layout takes time
          setTimeout(() => {
            if (pendingScrollToGoals.current) {
              scrollToGoalsSection();
            }
          }, 800);
        }
      }
    }, [route.params?.scrollToSection, navigation, scrollToGoalsSection])
  );

  // Handle return from JournalEntry/EditEvent - open day detail modal with fresh data
  // Supports both: (1) pendingModalReopen ref from goBack(), (2) route params for legacy
  useFocusEffect(
    useCallback(() => {
      // Check pendingModalReopen ref first (faster path via goBack)
      const pendingDate = pendingModalReopen.current;
      const { openCalendarDate, showDayDetail, refreshData } = route.params || {};

      // Determine which date to use (ref takes priority)
      const targetDate = pendingDate || (showDayDetail ? openCalendarDate : null);

      if (targetDate) {
        // Clear the ref and params immediately to prevent re-triggering
        pendingModalReopen.current = null;
        if (openCalendarDate && showDayDetail) {
          navigation.setParams({ openCalendarDate: undefined, showDayDetail: undefined, refreshData: undefined });
        }

        // Set the selected date
        setSelectedDate(targetDate);

        // Fetch fresh data for that date, then open modal
        const loadAndOpenModal = async () => {
          try {
            if (user?.id) {
              console.log('[VisionBoard] Loading data for return date:', targetDate);
              const journalResult = await calendarService.getDayCalendarData(user.id, targetDate);
              if (journalResult.success) {
                setJournalRituals(journalResult.rituals || []);
                setJournalReadings(journalResult.readings || []);
                setJournalPaperTrades(journalResult.paperTrades || []);
                setJournalTradingJournal(journalResult.tradingJournal || []);
                setJournalEntries(journalResult.journal || []);
                setTradingEntries(journalResult.trading || []);
                setJournalMood(journalResult.mood || null);
                console.log('[VisionBoard] Loaded journal entries:', journalResult.journal?.length || 0);
              }
            }
          } catch (error) {
            console.error('[VisionBoard] Error loading return date data:', error);
          }
          // Open modal after data is loaded
          setDayDetailModalVisible(true);
        };

        loadAndOpenModal();
      }
    }, [route.params?.openCalendarDate, route.params?.showDayDetail, navigation, user?.id])
  );

  // =========== FETCH READING HISTORY FROM DATABASE ===========
  const fetchReadingHistory = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await readingHistoryService.getReadings(user.id, {
        type: 'all',
        limit: 50, // Get recent 50 readings
      });

      if (error) {
        console.warn('[VisionBoard] Reading history fetch error:', error);
        setSavedReadings([]);
      } else {
        console.log('[VisionBoard] Loaded reading history:', data?.length || 0);
        setSavedReadings(data || []);
      }
    } catch (err) {
      console.error('[VisionBoard] Reading history error:', err);
      setSavedReadings([]);
    }
  }, [user?.id]);

  // Fetch reading history on mount
  useEffect(() => {
    fetchReadingHistory();
  }, [fetchReadingHistory]);

  // Show tooltips for first-time users
  useEffect(() => {
    if (tooltipInitialized && user?.id) {
      // Delay slightly to allow screen to render
      const timer = setTimeout(() => {
        showTooltipForScreen('visionboard', { tier: userTier });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [tooltipInitialized, user?.id, userTier, showTooltipForScreen]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Run all fetches in PARALLEL for faster refresh
    await Promise.all([
      fetchWidgets(),
      fetchReadingHistory(),
      fetchCalendarAndCharts(),
    ]);
    // Cache is updated inside fetchWidgets
    setRefreshing(false);
  }, [fetchWidgets, fetchReadingHistory]);

  // =========== VISION BOARD REMINDER HANDLERS ===========
  const handleToggleReminder = useCallback(async (enabled) => {
    setReminderEnabled(enabled);
    const success = await notificationService.setVisionBoardReminderSettings(
      enabled,
      reminderHour,
      reminderMinute
    );
    if (success && enabled) {
      // Show feedback
      setAlertConfig({
        visible: true,
        type: 'success',
        title: 'Đã bật nhắc nhở',
        message: `Bạn sẽ nhận được nhắc nhở xem Vision Board lúc ${reminderHour}:${reminderMinute.toString().padStart(2, '0')} mỗi ngày.`,
        buttons: [{ text: 'OK', style: 'primary' }],
      });
    }
  }, [reminderHour, reminderMinute]);

  const handleChangeReminderTime = useCallback(async (hour, minute) => {
    setReminderHour(hour);
    setReminderMinute(minute);
    if (reminderEnabled) {
      // Re-schedule with new time
      await notificationService.setVisionBoardReminderSettings(true, hour, minute);
    }
  }, [reminderEnabled]);

  // =========== NEW: FETCH CALENDAR & CHARTS DATA ===========
  const fetchCalendarAndCharts = useCallback(async () => {
    console.log('[VisionBoard] fetchCalendarAndCharts called, user?.id:', user?.id);
    if (!user?.id) {
      console.log('[VisionBoard] fetchCalendarAndCharts - no user, returning early');
      return;
    }

    try {
      console.log('[VisionBoard] fetchCalendarAndCharts - starting fetch');
      // ========== 1. CALENDAR: Generate events from widgets + Load history from DB ==========
      const eventsMap = {};
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      // Calculate date range for ALL HISTORY (from 2020 to now)
      const startDate = '2020-01-01';

      // End date is last day of current month
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

      // ========== 1a. Load history from database ==========
      // Fetch ritual completions, paper trades, mood data, journal entries for 3 months range
      const [ritualsResult, paperTradesResult, calendarEventsResult, moodResult, journalEntriesResult] = await Promise.all([
        supabase
          .from('vision_ritual_completions')
          .select('id, ritual_id, completed_at, xp_earned')
          .eq('user_id', user.id)
          .gte('completed_at', `${startDate}T00:00:00`)
          .lte('completed_at', `${endDate}T23:59:59`),
        supabase
          .from('paper_trades')
          .select('id, symbol, side, pnl, created_at')
          .eq('user_id', user.id)
          .gte('created_at', `${startDate}T00:00:00`)
          .lte('created_at', `${endDate}T23:59:59`),
        calendarService.getEventsGroupedByRange(user.id, startDate, endDate),
        supabase
          .from('calendar_daily_mood')
          .select('id, mood_date, overall_mood_score, morning_mood, evening_mood, overall_mood')
          .eq('user_id', user.id)
          .gte('mood_date', startDate)
          .lte('mood_date', endDate),
        // Also fetch journal entries for calendar dots
        supabase
          .from('calendar_journal_entries')
          .select('id, entry_date, title, entry_type')
          .eq('user_id', user.id)
          .gte('entry_date', startDate)
          .lte('entry_date', endDate),
      ]);

      // DEBUG: Log fetched data
      console.log('[VisionBoard] Date range:', startDate, 'to', endDate);
      console.log('[VisionBoard] Rituals fetched:', ritualsResult.data?.length || 0, ritualsResult.error ? `Error: ${ritualsResult.error.message}` : 'OK');
      console.log('[VisionBoard] Paper trades fetched:', paperTradesResult.data?.length || 0, paperTradesResult.error ? `Error: ${paperTradesResult.error.message}` : 'OK');
      console.log('[VisionBoard] Calendar events:', calendarEventsResult.success ? 'OK' : 'FAIL', Object.keys(calendarEventsResult.eventsByDate || {}).length, 'dates');
      console.log('[VisionBoard] Mood entries fetched:', moodResult.data?.length || 0, moodResult.error ? `Error: ${moodResult.error.message}` : 'OK');
      console.log('[VisionBoard] Journal entries fetched:', journalEntriesResult.data?.length || 0, journalEntriesResult.error ? `Error: ${journalEntriesResult.error.message}` : 'OK');

      // Add ritual completions to eventsMap
      if (ritualsResult.data) {
        ritualsResult.data.forEach(ritual => {
          const date = ritual.completed_at?.split('T')[0];
          if (date) {
            if (!eventsMap[date]) eventsMap[date] = [];
            eventsMap[date].push({
              id: ritual.id,
              title: ritual.ritual_id?.replace(/-/g, ' ') || 'Ritual',
              source_type: 'ritual',
              color: '#EC4899', // Pink for rituals
            });
          }
        });
      }

      // Add paper trades to eventsMap
      if (paperTradesResult.data) {
        paperTradesResult.data.forEach(trade => {
          const date = trade.created_at?.split('T')[0];
          if (date) {
            if (!eventsMap[date]) eventsMap[date] = [];
            eventsMap[date].push({
              id: trade.id,
              title: `${trade.side} ${trade.symbol}`,
              source_type: 'paper_trade',
              color: trade.pnl >= 0 ? '#3AF7A6' : '#FF6B6B', // Green for profit, red for loss
            });
          }
        });
      }

      // Add mood entries to eventsMap
      if (moodResult.data) {
        moodResult.data.forEach(mood => {
          const date = mood.mood_date;
          if (date) {
            if (!eventsMap[date]) eventsMap[date] = [];
            // Determine mood display text
            const moodText = mood.overall_mood || mood.morning_mood || mood.evening_mood || 'Tâm trạng';
            eventsMap[date].push({
              id: mood.id,
              title: moodText,
              source_type: 'mood',
              color: '#FFD700', // Gold for mood
            });
          }
        });
      }

      // Add journal entries to eventsMap (for calendar dots)
      if (journalEntriesResult.data) {
        journalEntriesResult.data.forEach(entry => {
          const date = entry.entry_date;
          if (date) {
            if (!eventsMap[date]) eventsMap[date] = [];
            eventsMap[date].push({
              id: entry.id,
              title: entry.title || entry.entry_type || 'Nhật ký',
              source_type: 'journal',
              color: '#A855F7', // Purple for journal entries
            });
          }
        });
      }

      // Add calendar events from database
      if (calendarEventsResult.success && calendarEventsResult.eventsByDate) {
        Object.entries(calendarEventsResult.eventsByDate).forEach(([date, events]) => {
          if (!eventsMap[date]) eventsMap[date] = [];
          events.forEach(event => {
            eventsMap[date].push({
              id: event.id,
              title: event.title,
              source_type: event.source_type || 'event',
              color: event.color || '#6A5BFF',
            });
          });
        });
      }

      // ========== 1b. Add widget deadlines and goals as calendar events ==========
      widgets.forEach(w => {
        const content = parseWidgetContent(w);
        const widgetType = w.widget_type || w.type;

        // Add goal deadlines
        if (widgetType === 'goal' && content?.deadline) {
          // Handle deadline as string, Date, or object with date property
          let deadlineDate = null;
          try {
            if (typeof content.deadline === 'string') {
              deadlineDate = content.deadline.split('T')[0];
            } else if (content.deadline instanceof Date) {
              deadlineDate = content.deadline.toISOString().split('T')[0];
            } else if (content.deadline?.date) {
              deadlineDate = typeof content.deadline.date === 'string'
                ? content.deadline.date.split('T')[0]
                : new Date(content.deadline.date).toISOString().split('T')[0];
            }
          } catch (e) {
            console.warn('[VisionBoard] Error parsing deadline:', content.deadline, e);
          }

          if (deadlineDate && !eventsMap[deadlineDate]) eventsMap[deadlineDate] = [];
          if (deadlineDate) {
            // Priority: actual goal text from content > widget title (with prefix stripped)
            const rawTitle = content?.goals?.[0]?.title
              || content?.goals?.[0]?.text
              || content?.goalText
              || content?.title
              || w.title
              || 'Mục tiêu';
            const eventTitle = rawTitle.startsWith('Mục tiêu: ')
              ? rawTitle.replace('Mục tiêu: ', '')
              : rawTitle;
            eventsMap[deadlineDate].push({
              id: w.id,
              title: eventTitle,
              source_type: 'goal_deadline',
              color: '#6A5BFF',
            });
          }
        }

        // Add affirmations as daily events
        if (widgetType === 'affirmation') {
          if (!eventsMap[today]) eventsMap[today] = [];
          eventsMap[today].push({
            id: w.id,
            title: content?.text || content?.title || 'Khẳng định hàng ngày',
            description: content?.text || content?.affirmation || null,
            source_type: 'affirmation',
            color: '#FFD700',
            source_id: w.id,
            is_completed: content?.completed || w.is_completed || false,
          });
        }

        // Add habits as daily events
        if (widgetType === 'habit' || widgetType === 'action') {
          if (!eventsMap[today]) eventsMap[today] = [];
          eventsMap[today].push({
            id: w.id,
            title: content?.title || 'Thói quen',
            source_type: 'habit',
            color: '#00F0FF',
          });
        }
      });

      console.log('[VisionBoard] Calendar events loaded:', Object.keys(eventsMap).length, 'dates with events');
      console.log('[VisionBoard] Calendar eventsMap:', JSON.stringify(eventsMap).substring(0, 500));
      setCalendarEvents(eventsMap);
      console.log('[VisionBoard] setCalendarEvents called successfully');

      // ========== 2. XP & LEVEL: Calculate from actual progress ==========
      // XP formula: goals=50 each, affirmations=10 each, habits=5 per %, streak bonus
      const goalsXP = stats.goalsCompleted * 50;
      const affirmXP = stats.affirmationsCompleted * 10;
      const habitsXP = Math.floor(stats.habitsPercent / 10) * 5;
      const streakBonus = streakDays * 5;
      const calculatedXP = goalsXP + affirmXP + habitsXP + streakBonus;

      // Today's XP (simplified: goals + affirmations today)
      const todayXP = (stats.goalsCompleted * 50) + (stats.affirmationsCompleted * 10);
      setXpToday(todayXP);
      setTotalXP(calculatedXP);

      // Calculate level (every 100 XP = 1 level, max 50)
      const level = Math.min(50, Math.floor(calculatedXP / 100) + 1);
      const levelTitles = [
        'Người Mới', 'Khám Phá', 'Học Viên', 'Thực Hành', 'Kiên Trì',
        'Tiến Bộ', 'Vững Vàng', 'Thành Thạo', 'Xuất Sắc', 'Bậc Thầy'
      ];
      const titleIndex = Math.min(9, Math.floor((level - 1) / 5));

      setCurrentLevel(level);
      setLevelTitle(levelTitles[titleIndex] || 'Huyền Thoại');
      setXpForNextLevel(level * 100);
      setXpProgress((calculatedXP % 100) / 100);

      // ========== 3. WEEKLY PROGRESS & STREAK: Get from database via statsService ==========
      try {
        console.log('[VisionBoard] Fetching weekly progress and streak for user:', user?.id);

        // Fetch weekly progress and streak in parallel
        const [weeklyResult, streakResult] = await Promise.all([
          statsService.getWeeklyProgress(user?.id),
          statsService.calculateStreak(user?.id),
        ]);

        console.log('[VisionBoard] Weekly progress result:', weeklyResult);
        console.log('[VisionBoard] Streak result:', streakResult);

        // Set streak from database
        if (streakResult?.currentStreak !== undefined) {
          setStreakDays(streakResult.currentStreak);
        }

        if (weeklyResult?.days && weeklyResult.days.length > 0) {
          // Transform to expected format (component expects day_name, not day)
          const weeklyData = weeklyResult.days.map((day, i) => ({
            day_name: day.dayName,
            day_date: day.date,
            total_score: day.score || 0,
            xp_earned: day.xpEarned || 0,
            actions_completed: day.tasksCompleted || 0,
            actions_total: 0,
            isToday: i === weeklyResult.days.length - 1,
          }));
          console.log('[VisionBoard] Setting weeklyProgress:', weeklyData);
          setWeeklyProgress(weeklyData);
        } else {
          // Fallback: Calculate today's score, past days default to 0
          const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
          const weeklyData = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayName = dayNames[date.getDay()];
            const dateStr = date.toISOString().split('T')[0];
            const isToday = i === 0;

            let totalScore = 0;
            if (isToday) {
              totalScore = Math.round(
                (stats.goalsCompleted / Math.max(stats.goalsTotal, 1)) * 40 +
                (stats.affirmationsCompleted > 0 ? 30 : 0) +
                (stats.habitsPercent / 100) * 30
              );
            }
            // Past days: keep at 0 if no data (not random)

            weeklyData.push({
              day_name: dayName,
              day_date: dateStr,
              total_score: totalScore,
              xp_earned: 0,
              actions_completed: 0,
              actions_total: 0,
              isToday,
            });
          }
          console.log('[VisionBoard] Setting weeklyProgress (fallback):', weeklyData);
          setWeeklyProgress(weeklyData);
        }
      } catch (err) {
        console.error('[VisionBoard] Error fetching weekly progress:', err);
      }

      // ========== 4. LIFE AREA SCORES: Get from database or calculate from widgets ==========
      try {
        // First try to get from database (vision_goals + vision_habits)
        const dbLifeScores = await statsService.getLifeAreaScores(user?.id);
        console.log('[VisionBoard] Life area scores from DB:', dbLifeScores);

        // Check if we have any non-default data from DB
        const hasDbData = dbLifeScores && Object.values(dbLifeScores).some(v => v !== 50);

        if (hasDbData) {
          setLifeAreaScores(dbLifeScores);
        } else {
          // Fallback: Calculate from widget life areas
          const scores = {
            finance: 0,
            career: 0,
            health: 0,
            relationships: 0,
            personal: 0,
            spiritual: 0
          };
          const scoreCounts = { ...scores };

          widgets.forEach(w => {
            const content = parseWidgetContent(w);
            // Try multiple ways to get life area
            const lifeArea = content?.lifeArea || content?.life_area || w.life_area || w.lifeArea;

            if (lifeArea && scores[lifeArea] !== undefined) {
              const widgetType = w.widget_type || w.type;
              let widgetScore = 0;

              if (widgetType === 'goal') {
                const goals = extractGoals(content, w.id);
                const completedGoals = goals.filter(g => g?.completed).length;
                const totalGoals = goals.length || 1;
                widgetScore = Math.round((completedGoals / totalGoals) * 100);
              } else if (widgetType === 'affirmation') {
                widgetScore = affirmationsCompletedToday > 0 ? 100 : 30;
              } else if (widgetType === 'habit' || widgetType === 'action') {
                const steps = content?.steps || content?.habits || [];
                const completedSteps = steps.filter(s => s?.completed || s?.done).length;
                widgetScore = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 50;
              }

              scores[lifeArea] += widgetScore;
              scoreCounts[lifeArea]++;
            }
          });

          // Average scores for each life area
          Object.keys(scores).forEach(area => {
            if (scoreCounts[area] > 0) {
              scores[area] = Math.round(scores[area] / scoreCounts[area]);
            }
          });

          // If no data, show demo values
          const hasData = Object.values(scores).some(v => v > 0);
          if (!hasData) {
            scores.finance = 45;
            scores.career = 60;
            scores.health = 35;
            scores.relationships = 70;
            scores.personal = 55;
            scores.spiritual = 40;
          }

          console.log('[VisionBoard] Life area scores (from widgets):', scores);
          setLifeAreaScores(scores);
        }
      } catch (err) {
        console.error('[VisionBoard] Error fetching life area scores:', err);
      }

      // ========== 5. STREAK & COMBO: Calculate (don't setState here to avoid infinite loop) ==========
      // Streak and combo are calculated but we don't call setState inside useCallback
      // to prevent infinite re-render loop
      // Instead, we track if streak needs update and handle it outside
      const hasActivityToday = (stats?.goalsCompleted || 0) > 0 || (stats?.affirmationsCompleted || 0) > 0 || (stats?.habitsPercent || 0) > 0;

      // Calculate combo (count categories completed today)
      const combo = ((stats?.affirmationsCompleted || 0) > 0 ? 1 : 0) +
                   ((stats?.habitsPercent || 0) >= 50 ? 1 : 0) +
                   ((stats?.goalsCompleted || 0) > 0 ? 1 : 0);

      // ========== 6. SAVE DAILY SUMMARY & UPDATE STREAK ==========
      // This enables getWeeklyProgress to return historical data
      try {
        if (hasActivityToday) {
          const dailyScore = Math.round(
            ((stats?.goalsCompleted || 0) / Math.max(stats?.goalsTotal || 1, 1)) * 40 +
            ((stats?.affirmationsCompleted || 0) > 0 ? 20 : 0) +
            ((stats?.habitsPercent || 0) / 100) * 30 +
            (combo > 0 ? 10 : 0)
          );

          // Calculate today's XP (same as todayXP calculated earlier in this function)
          const todayXPToSave = ((stats?.goalsCompleted || 0) * 50) + ((stats?.affirmationsCompleted || 0) * 10);

          // Save to database (upsert - will update if exists)
          statsService.saveDailySummary(user?.id, {
            dailyScore,
            tasks: { completed: stats?.goalsCompleted || 0, total: stats?.goalsTotal || 0 },
            affirmations: { completed: stats?.affirmationsCompleted || 0, total: (allAffirmations?.length || 0) * 3 },
            habits: { completed: Math.round(stats?.habitsPercent || 0), total: 100 },
            ritualCompleted: false, // Will be updated by ritual completion handler
            xpEarned: todayXPToSave,
          }).then(async () => {
            // After saving daily summary, update streak (checks yesterday's summary)
            const newStreak = await statsService.updateStreak(user?.id);
            console.log('[VisionBoard] Updated streak:', newStreak);
            if (newStreak?.currentStreak) {
              setStreakDays(newStreak.currentStreak);
            }
          }).catch(err => console.warn('[VisionBoard] Error saving daily summary:', err));
        }
      } catch (saveSummaryErr) {
        console.warn('[VisionBoard] Error in section 6 (save summary):', saveSummaryErr);
      }

      // Return calculated values instead of setting state directly
      return { hasActivityToday, combo };

    } catch (err) {
      console.error('[VisionBoard] Error fetching calendar/charts:', err.message, err.stack);
      return { hasActivityToday: false, combo: 0 };
    }
  }, [user?.id, widgets, stats, affirmationsCompletedToday]);

  // Fetch calendar/charts data when widgets change or user is set
  useEffect(() => {
    if (user?.id && widgets.length >= 0) {
      const runFetch = async () => {
        console.log('[VisionBoard] Running fetchCalendarAndCharts - user:', user?.id, 'widgets:', widgets.length);
        const result = await fetchCalendarAndCharts();
        if (result) {
          // Update combo state outside of the useCallback
          // Note: streak is now fetched from database in fetchCalendarAndCharts
          setComboCount(result.combo);
        }
      };
      runFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgets, user?.id]);

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
  const handleToggleItem = useCallback((itemId, type) => {
    // Guard: itemId must be a valid string
    if (!itemId || typeof itemId !== 'string') {
      console.warn('[VisionBoard] handleToggleItem: Invalid itemId:', itemId);
      return;
    }

    // Extract widgetId from itemId (format: "widgetId_goal_0" or "widgetId_step_0")
    // The widgetId is everything before the last "_goal_" or "_step_" or "_habit_" or "_item_"
    // Use GREEDY .+ to match as much as possible (widget IDs can contain underscores like UUIDs)
    const widgetIdMatch = itemId.match(/^(.+)_(goal|step|habit|item)_(\d+)$/);
    const widgetId = widgetIdMatch ? widgetIdMatch[1] : null;
    const itemIndex = widgetIdMatch ? parseInt(widgetIdMatch[3], 10) : -1;

    // OPTIMISTIC UPDATE: Update local state IMMEDIATELY for instant feedback
    // No await - this runs synchronously for instant UI response
    setWidgets(prev => {
      return prev.map(w => {
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

        // Handle embedded steps in GOAL widgets (from karma analysis)
        if ((type === 'habit') && isGoalType(w?.type) && w?.id === widgetId) {
          const content = parseWidgetContent(w);
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
          return w;
        }
        return w;
      });
    });

    // BACKGROUND: Track gamification and sync to database (non-blocking)
    // Use setTimeout to ensure UI updates first, then run async operations
    setTimeout(async () => {
      try {
        const targetWidget = widgets.find(w => w?.id === widgetId);
        const isActionPlanWidget = targetWidget && (targetWidget.type === 'action_plan' || targetWidget.type === 'steps');

        // Track gamification based on type
        if (type === 'habit') {
          if (isActionPlanWidget) {
            trackAction(); // Fire and forget
            console.log('[Gamification] Tracked action for action_plan widget');
          } else {
            trackHabit(); // Fire and forget
          }

          // Auto-track goal when ALL action plan steps are completed
          if (isActionPlanWidget) {
            const content = parseWidgetContent(targetWidget);
            if (content?.steps) {
              const indexMatch = itemId.match(/_step_(\d+)$/);
              const index = indexMatch ? parseInt(indexMatch[1], 10) : -1;
              const allStepsCompleted = content.steps.every((step, i) => {
                if (i === index) return !step?.completed;
                return step?.completed;
              });
              if (allStepsCompleted) {
                console.log('[Gamification] All action plan steps completed - auto-tracking goal');
                trackGoal(); // Fire and forget
              }
            }
          }
        } else if (type === 'goal') {
          trackGoal(); // Fire and forget
        }

        // Sync to database
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
                updatedArray[index] = { ...updatedArray[index], completed: !content[index]?.completed };
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
            // Handle habit/action_plan widgets
            if (content?.steps && (widgetToUpdate.type === 'habit' || widgetToUpdate.type === 'steps' || widgetToUpdate.type === 'action_plan')) {
              const indexMatch = itemId.match(/_step_(\d+)$/);
              const index = indexMatch ? parseInt(indexMatch[1], 10) : -1;
              if (index >= 0 && index < content.steps.length) {
                const updatedSteps = [...content.steps];
                updatedSteps[index] = { ...updatedSteps[index], completed: !content.steps[index]?.completed };
                updatedContent = { ...content, steps: updatedSteps };
              }
            } else if (content?.habits) {
              const updatedHabits = content.habits.map((h, i) => {
                const habitId = `${widgetId}_habit_${i}`;
                return habitId === itemId ? { ...h, completed: !h.completed } : h;
              });
              updatedContent = { ...content, habits: updatedHabits };
            }
            // Handle embedded steps in GOAL widgets (from karma analysis)
            else if (content?.steps && isGoalType(widgetToUpdate?.type)) {
              const indexMatch = itemId.match(/_step_(\d+)$/);
              const index = indexMatch ? parseInt(indexMatch[1], 10) : -1;
              if (index >= 0 && index < content.steps.length) {
                const updatedSteps = [...content.steps];
                updatedSteps[index] = { ...updatedSteps[index], completed: !content.steps[index]?.completed };
                updatedContent = { ...content, steps: updatedSteps };
              }
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
        console.error('[VisionBoard] Background sync error:', err);
      }
    }, 0); // setTimeout with 0 allows UI to update first
  }, [widgets, trackHabit, trackGoal, trackAction]);

  // Shorthand alias for habit toggle (used by CrystalSection)
  const handleToggleHabit = useCallback((habitId) => {
    handleToggleItem(habitId, 'habit');
  }, [handleToggleItem]);

  // Affirmation handlers - Text to Speech
  const handleReadAloud = useCallback(async () => {
    if (!currentAffirmation) return;

    try {
      // Cho phép phát âm thanh khi iPhone ở chế độ silent/vibrate
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      // Stop any ongoing speech first
      await Speech.stop();

      // CRITICAL FIX: expo-speech (AVSpeechSynthesizer) on iOS respects mute switch
      // Audio.setAudioModeAsync does NOT affect it. Workaround: play a nearly-silent
      // sound via expo-av to force iOS audio session to playback mode.
      try {
        if (primerSoundRef.current) {
          await primerSoundRef.current.stopAsync().catch(() => {});
          await primerSoundRef.current.unloadAsync().catch(() => {});
        }
        const { sound: primer } = await Audio.Sound.createAsync(
          require('../../../assets/sounds/Ritual_sounds/chime.mp3'),
          { shouldPlay: true, isLooping: true, volume: 0.01 }
        );
        primerSoundRef.current = primer;
      } catch (e) {
        console.log('[VisionBoard] Primer sound error (non-critical):', e.message);
      }

      // Speak the affirmation in Vietnamese
      await Speech.speak(currentAffirmation, {
        language: 'vi-VN',
        pitch: 1.0,
        rate: 0.9,
        onDone: async () => {
          // Stop primer sound when speech ends
          if (primerSoundRef.current) {
            await primerSoundRef.current.stopAsync().catch(() => {});
            await primerSoundRef.current.unloadAsync().catch(() => {});
            primerSoundRef.current = null;
          }
        },
        onError: async () => {
          if (primerSoundRef.current) {
            await primerSoundRef.current.stopAsync().catch(() => {});
            await primerSoundRef.current.unloadAsync().catch(() => {});
            primerSoundRef.current = null;
          }
        },
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
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      await Speech.stop();

      // Play primer sound (nearly silent) to force iOS audio session to playback mode
      try {
        if (primerSoundRef.current) {
          await primerSoundRef.current.stopAsync().catch(() => {});
          await primerSoundRef.current.unloadAsync().catch(() => {});
        }
        const { sound: primer } = await Audio.Sound.createAsync(
          require('../../../assets/sounds/Ritual_sounds/chime.mp3'),
          { shouldPlay: true, isLooping: true, volume: 0.01 }
        );
        primerSoundRef.current = primer;
      } catch (e) {
        console.log('[VisionBoard] Primer sound error (non-critical):', e.message);
      }

      await Speech.speak(text, {
        language: 'vi-VN',
        pitch: 1.0,
        rate: 0.9,
        onDone: async () => {
          if (primerSoundRef.current) {
            await primerSoundRef.current.stopAsync().catch(() => {});
            await primerSoundRef.current.unloadAsync().catch(() => {});
            primerSoundRef.current = null;
          }
        },
        onError: async () => {
          if (primerSoundRef.current) {
            await primerSoundRef.current.stopAsync().catch(() => {});
            await primerSoundRef.current.unloadAsync().catch(() => {});
            primerSoundRef.current = null;
          }
        },
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

  // Save spiritual ritual inline - for goal widgets with embedded rituals
  const handleSaveRitual = useCallback(async (widget, index, updatedRitual) => {
    if (!widget?.id || !user?.id || index < 0 || !updatedRitual?.name?.trim()) return;

    try {
      const content = parseWidgetContent(widget);
      const rituals = content?.rituals || [];

      // Update the ritual at the given index
      const updatedRituals = [...rituals];
      if (index < updatedRituals.length) {
        updatedRituals[index] = {
          ...updatedRituals[index],
          name: updatedRitual.name.trim(),
          description: updatedRitual.description?.trim() || '',
        };
      }

      const updatedContent = {
        ...content,
        rituals: updatedRituals,
      };

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

      console.log('[VisionBoard] Ritual saved inline:', { widgetId: widget.id, index, updatedRitual });
    } catch (err) {
      console.error('[VisionBoard] Save ritual error:', err);
      setAlertConfig({
        visible: true,
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể lưu nghi thức. Vui lòng thử lại.',
        buttons: [{ text: 'OK', style: 'primary' }],
      });
    }
  }, [user?.id]);

  // Toggle ritual completion status
  const handleToggleRitual = useCallback(async (widget, ritualId) => {
    if (!widget?.id || !user?.id || !ritualId) return;

    try {
      const content = parseWidgetContent(widget);
      const rituals = content?.rituals || [];

      // Find and toggle the ritual
      const updatedRituals = rituals.map((r, idx) => {
        const rId = r?.id || `ritual_${idx}`;
        if (rId === ritualId) {
          return { ...r, completed: !r?.completed };
        }
        return r;
      });

      const updatedContent = {
        ...content,
        rituals: updatedRituals,
      };

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

      console.log('[VisionBoard] Ritual toggled:', { widgetId: widget.id, ritualId });
    } catch (err) {
      console.error('[VisionBoard] Toggle ritual error:', err);
    }
  }, [user?.id]);

  // Delete single affirmation from widget
  const handleDeleteAffirmation = useCallback(async (widget, index) => {
    if (!widget?.id || !user?.id || index < 0) return;

    try {
      const content = parseWidgetContent(widget);
      let updatedContent;

      if (Array.isArray(content)) {
        updatedContent = content.filter((_, i) => i !== index);
      } else if (content?.affirmations && Array.isArray(content.affirmations)) {
        updatedContent = { ...content, affirmations: content.affirmations.filter((_, i) => i !== index) };
      } else {
        console.warn('[VisionBoard] Unexpected affirmation content structure');
        return;
      }

      const { error } = await supabase
        .from('vision_board_widgets')
        .update({
          content: updatedContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', widget.id);

      if (error) throw error;

      setWidgets(prev => prev.map(w => {
        if (w?.id === widget.id) {
          return { ...w, content: updatedContent };
        }
        return w;
      }));

      console.log('[VisionBoard] Affirmation deleted:', { widgetId: widget.id, index });
    } catch (err) {
      console.error('[VisionBoard] Delete affirmation error:', err);
    }
  }, [user?.id]);

  // Delete single action step from widget
  const handleDeleteActionStep = useCallback(async (widget, index) => {
    if (!widget?.id || !user?.id || index < 0) return;

    try {
      const content = parseWidgetContent(widget);
      let updatedContent;

      if (Array.isArray(content)) {
        updatedContent = content.filter((_, i) => i !== index);
      } else if (content?.habits && Array.isArray(content.habits)) {
        updatedContent = { ...content, habits: content.habits.filter((_, i) => i !== index) };
      } else if (content?.steps && Array.isArray(content.steps)) {
        updatedContent = { ...content, steps: content.steps.filter((_, i) => i !== index) };
      } else {
        console.warn('[VisionBoard] Unexpected action step content structure');
        return;
      }

      const { error } = await supabase
        .from('vision_board_widgets')
        .update({
          content: updatedContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', widget.id);

      if (error) throw error;

      setWidgets(prev => prev.map(w => {
        if (w?.id === widget.id) {
          return { ...w, content: updatedContent };
        }
        return w;
      }));

      console.log('[VisionBoard] Action step deleted:', { widgetId: widget.id, index });
    } catch (err) {
      console.error('[VisionBoard] Delete action step error:', err);
    }
  }, [user?.id]);

  // Delete single ritual from widget
  const handleDeleteRitual = useCallback(async (widget, index) => {
    if (!widget?.id || !user?.id || index < 0) return;

    try {
      const content = parseWidgetContent(widget);
      const rituals = content?.rituals || [];
      const updatedRituals = rituals.filter((_, i) => i !== index);

      const updatedContent = {
        ...content,
        rituals: updatedRituals,
      };

      const { error } = await supabase
        .from('vision_board_widgets')
        .update({
          content: updatedContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', widget.id);

      if (error) throw error;

      setWidgets(prev => prev.map(w => {
        if (w?.id === widget.id) {
          return { ...w, content: updatedContent };
        }
        return w;
      }));

      console.log('[VisionBoard] Ritual deleted:', { widgetId: widget.id, index });
    } catch (err) {
      console.error('[VisionBoard] Delete ritual error:', err);
    }
  }, [user?.id]);

  // Add new affirmation to widget
  const handleAddAffirmation = useCallback(async (widget) => {
    if (!widget?.id || !user?.id) return;

    try {
      const content = parseWidgetContent(widget);
      let updatedContent;
      const newAffirmation = 'Câu khẳng định mới...';

      if (Array.isArray(content)) {
        updatedContent = [...content, newAffirmation];
      } else if (content?.affirmations && Array.isArray(content.affirmations)) {
        updatedContent = { ...content, affirmations: [...content.affirmations, newAffirmation] };
      } else {
        updatedContent = { ...content, affirmations: [newAffirmation] };
      }

      const { error } = await supabase
        .from('vision_board_widgets')
        .update({
          content: updatedContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', widget.id);

      if (error) throw error;

      setWidgets(prev => prev.map(w => {
        if (w?.id === widget.id) {
          return { ...w, content: updatedContent };
        }
        return w;
      }));

      console.log('[VisionBoard] Affirmation added:', { widgetId: widget.id });
    } catch (err) {
      console.error('[VisionBoard] Add affirmation error:', err);
    }
  }, [user?.id]);

  // Add new action step to widget
  const handleAddActionStep = useCallback(async (widget) => {
    if (!widget?.id || !user?.id) return;

    try {
      const content = parseWidgetContent(widget);
      let updatedContent;
      const newStep = {
        id: `step_${Date.now()}`,
        title: 'Bước hành động mới...',
        text: 'Bước hành động mới...',
        completed: false,
        action_type: 'daily',
      };

      if (Array.isArray(content)) {
        updatedContent = [...content, newStep];
      } else if (content?.habits && Array.isArray(content.habits)) {
        updatedContent = { ...content, habits: [...content.habits, newStep] };
      } else if (content?.steps && Array.isArray(content.steps)) {
        updatedContent = { ...content, steps: [...content.steps, newStep] };
      } else {
        updatedContent = { ...content, steps: [newStep] };
      }

      const { error } = await supabase
        .from('vision_board_widgets')
        .update({
          content: updatedContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', widget.id);

      if (error) throw error;

      setWidgets(prev => prev.map(w => {
        if (w?.id === widget.id) {
          return { ...w, content: updatedContent };
        }
        return w;
      }));

      console.log('[VisionBoard] Action step added:', { widgetId: widget.id });
    } catch (err) {
      console.error('[VisionBoard] Add action step error:', err);
    }
  }, [user?.id]);

  // Add new ritual to widget
  const handleAddRitual = useCallback(async (widget) => {
    if (!widget?.id || !user?.id) return;

    try {
      const content = parseWidgetContent(widget);
      const rituals = content?.rituals || [];
      const newRitual = {
        id: `ritual_${Date.now()}`,
        name: 'Nghi thức mới...',
        description: '',
        completed: false,
      };

      const updatedContent = {
        ...content,
        rituals: [...rituals, newRitual],
      };

      const { error } = await supabase
        .from('vision_board_widgets')
        .update({
          content: updatedContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', widget.id);

      if (error) throw error;

      setWidgets(prev => prev.map(w => {
        if (w?.id === widget.id) {
          return { ...w, content: updatedContent };
        }
        return w;
      }));

      console.log('[VisionBoard] Ritual added:', { widgetId: widget.id });
    } catch (err) {
      console.error('[VisionBoard] Add ritual error:', err);
    }
  }, [user?.id]);

  // Delete single widget - with cascade delete for linked widgets
  // When a goal widget is deleted, also delete linked affirmation/action_plan widgets
  // NO CONFIRMATION - delete directly
  const handleDeleteWidget = useCallback(async (widgetId) => {
    if (!widgetId) return;

    // Find the widget to check if it's a goal
    const widgetToDelete = widgets.find(w => w?.id === widgetId);
    const isGoalWidget = widgetToDelete?.type === 'goal';

    // If deleting a goal, find linked widgets to cascade delete
    const linkedWidgets = isGoalWidget
      ? widgets.filter(w => w?.content?.linked_goal_id === widgetId)
      : [];

    try {
      // If it's a goal widget, also delete linked affirmation/action_plan widgets
      if (isGoalWidget && linkedWidgets.length > 0) {
        const linkedIds = linkedWidgets.map(w => w.id);
        console.log('[VisionBoard] Cascade deleting linked widgets:', linkedIds);

        const { error: linkedError } = await supabase
          .from('vision_board_widgets')
          .delete()
          .in('id', linkedIds);

        if (linkedError) {
          console.error('[VisionBoard] Error deleting linked widgets:', linkedError);
          // Continue with main delete even if linked delete fails
        }
      }

      // Delete the main widget
      const { error } = await supabase
        .from('vision_board_widgets')
        .delete()
        .eq('id', widgetId);

      if (error) throw error;

      // Update local state - remove both the widget and any linked widgets
      setWidgets(prev => prev.filter(w => {
        if (w?.id === widgetId) return false;
        if (isGoalWidget && w?.content?.linked_goal_id === widgetId) return false;
        return true;
      }));

      console.log('[VisionBoard] Deleted widget:', widgetId, isGoalWidget ? `+ ${linkedWidgets.length} linked` : '');
    } catch (err) {
      console.error('[VisionBoard] Delete error:', err);
    }
  }, [widgets]);

  // Delete multiple widgets (batch delete) - with cascade delete for linked widgets
  // NO CONFIRMATION - delete directly
  const handleDeleteMultipleWidgets = useCallback(async (widgetIds) => {
    if (!widgetIds || widgetIds.length === 0) return;
    if (!user?.id) {
      console.error('[VisionBoard] No user ID for delete');
      return;
    }

    // Filter out null/undefined ids
    const validIds = widgetIds.filter(id => id);
    if (validIds.length === 0) return;

    // Find any linked widgets for goal widgets being deleted (cascade delete)
    const goalWidgetIds = validIds.filter(id => {
      const widget = widgets.find(w => w?.id === id);
      return widget?.type === 'goal';
    });

    // Find all widgets linked to these goals
    const linkedWidgetIds = goalWidgetIds.length > 0
      ? widgets
          .filter(w => goalWidgetIds.includes(w?.content?.linked_goal_id))
          .map(w => w.id)
          .filter(id => !validIds.includes(id)) // Don't duplicate
      : [];

    // Combine all widget IDs to delete
    const allIdsToDelete = [...validIds, ...linkedWidgetIds];

    try {
      console.log('[VisionBoard] Batch deleting widgets:', allIdsToDelete);

      // Delete widgets one by one to avoid RLS issues
      let successCount = 0;
      for (const id of allIdsToDelete) {
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

      // Update local state - remove all deleted widgets including linked ones
      setWidgets(prev => prev.filter(w => !allIdsToDelete.includes(w?.id)));

      // Reset selected lifeArea if all its widgets were deleted
      setSelectedGoalLifeArea(null);

      console.log('[VisionBoard] Successfully deleted', successCount, 'of', allIdsToDelete.length, 'widgets (including', linkedWidgetIds.length, 'linked)');
    } catch (err) {
      console.error('[VisionBoard] Batch delete error:', err);
    }
  }, [user?.id, widgets]);

  // GLOBAL selection handlers (for cross-group multi-select)
  const handleGlobalLongPress = useCallback((itemId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setGlobalSelectionMode(true);
    setGlobalSelectedItems(new Set([itemId]));
  }, []);

  const handleGlobalToggleSelect = useCallback((itemId) => {
    if (!globalSelectionMode) return;
    Haptics.selectionAsync();
    setGlobalSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, [globalSelectionMode]);

  const handleGlobalCancelSelection = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setGlobalSelectionMode(false);
    setGlobalSelectedItems(new Set());
  }, []);

  const handleGlobalDeleteSelected = useCallback(() => {
    if (globalSelectedItems.size > 0) {
      handleDeleteMultipleWidgets(Array.from(globalSelectedItems));
      handleGlobalCancelSelection();
    }
  }, [globalSelectedItems, handleDeleteMultipleWidgets, handleGlobalCancelSelection]);

  // =========== DELETE READING (handles both widget and database sources) ===========
  const handleDeleteReading = useCallback(async (reading) => {
    if (!reading?.id) return;
    if (!user?.id) {
      console.error('[VisionBoard] No user ID for delete reading');
      return;
    }

    const readingTitle = reading?.type === 'tarot'
      ? 'trải bài Tarot'
      : 'quẻ Kinh Dịch';

    setAlertConfig({
      visible: true,
      type: 'error',
      title: `Xóa ${reading?.type === 'tarot' ? 'Tarot' : 'Kinh Dịch'}?`,
      message: `Bạn có chắc chắn muốn xóa ${readingTitle} này?`,
      buttons: [
        { text: 'Hủy', style: 'secondary' },
        {
          text: 'Xóa',
          style: 'primary',
          onPress: async () => {
            try {
              console.log('[VisionBoard] Deleting reading:', reading.id, 'source:', reading.source, 'type:', reading.type);

              if (reading.source === 'database') {
                // Delete from tarot_readings or iching_readings table
                let result;
                if (reading.type === 'tarot') {
                  result = await readingHistoryService.deleteTarotReading(reading.id, user.id);
                } else {
                  result = await readingHistoryService.deleteIChingReading(reading.id, user.id);
                }

                if (!result.success) {
                  throw new Error(result.error || 'Lỗi không xác định');
                }

                // Update local state
                setSavedReadings(prev => prev.filter(r => r?.id !== reading.id));
                console.log('[VisionBoard] Successfully deleted reading from database');
              } else {
                // Delete from vision_board_widgets table
                const { error } = await supabase
                  .from('vision_board_widgets')
                  .delete()
                  .eq('id', reading.id);

                if (error) throw error;

                // Update local state
                setWidgets(prev => prev.filter(w => w?.id !== reading.id));
                console.log('[VisionBoard] Successfully deleted reading from widgets');
              }
            } catch (err) {
              console.error('[VisionBoard] Delete reading error:', err);
              setAlertConfig({
                visible: true,
                type: 'error',
                title: 'Lỗi',
                message: 'Không thể xóa. Vui lòng thử lại.',
                buttons: [{ text: 'OK', style: 'primary' }],
              });
            }
          },
        },
      ],
    });
  }, [user?.id]);

  // Delete multiple readings (batch delete)
  const handleDeleteMultipleReadings = useCallback(async (readings) => {
    if (!readings || readings.length === 0) return;
    if (!user?.id) {
      console.error('[VisionBoard] No user ID for batch delete readings');
      return;
    }

    setAlertConfig({
      visible: true,
      type: 'error',
      title: `Xóa ${readings.length} mục?`,
      message: `Bạn có chắc chắn muốn xóa ${readings.length} lịch sử trải bài đã chọn?`,
      buttons: [
        { text: 'Hủy', style: 'secondary' },
        {
          text: 'Xóa tất cả',
          style: 'primary',
          onPress: async () => {
            try {
              console.log('[VisionBoard] Batch deleting readings:', readings.length);

              let successCount = 0;
              const deletedDbIds = [];
              const deletedWidgetIds = [];

              for (const reading of readings) {
                try {
                  if (reading.source === 'database') {
                    let result;
                    if (reading.type === 'tarot') {
                      result = await readingHistoryService.deleteTarotReading(reading.id, user.id);
                    } else {
                      result = await readingHistoryService.deleteIChingReading(reading.id, user.id);
                    }
                    if (result.success) {
                      successCount++;
                      deletedDbIds.push(reading.id);
                    }
                  } else {
                    const { error } = await supabase
                      .from('vision_board_widgets')
                      .delete()
                      .eq('id', reading.id)
                      .eq('user_id', user.id);
                    if (!error) {
                      successCount++;
                      deletedWidgetIds.push(reading.id);
                    }
                  }
                } catch (err) {
                  console.error('[VisionBoard] Failed to delete reading:', reading.id, err);
                }
              }

              // Update local states
              if (deletedDbIds.length > 0) {
                setSavedReadings(prev => prev.filter(r => !deletedDbIds.includes(r?.id)));
              }
              if (deletedWidgetIds.length > 0) {
                setWidgets(prev => prev.filter(w => !deletedWidgetIds.includes(w?.id)));
              }

              console.log('[VisionBoard] Successfully deleted', successCount, 'of', readings.length, 'readings');
            } catch (err) {
              console.error('[VisionBoard] Batch delete readings error:', err);
              setAlertConfig({
                visible: true,
                type: 'error',
                title: 'Lỗi',
                message: 'Không thể xóa. Vui lòng thử lại.',
                buttons: [{ text: 'OK', style: 'primary' }],
              });
            }
          },
        },
      ],
    });
  }, [user?.id]);

  const handleGlobalSelectAll = useCallback((allGoalIds) => {
    setGlobalSelectedItems(new Set(allGoalIds));
  }, []);

  // Archive widgets (swipe action) - marks widgets as archived instead of deleting
  const handleArchiveWidgets = useCallback(async (widgetIds) => {
    if (!widgetIds || widgetIds.length === 0) return;
    if (!user?.id) {
      console.error('[VisionBoard] No user ID for archive');
      return;
    }

    // Filter out null/undefined ids
    const validIds = widgetIds.filter(id => id);
    if (validIds.length === 0) return;

    setAlertConfig({
      visible: true,
      type: 'info',
      title: 'Lưu trữ mục tiêu?',
      message: `Bạn có muốn lưu trữ ${validIds.length} widget? Bạn có thể khôi phục sau.`,
      buttons: [
        { text: 'Hủy', style: 'secondary' },
        {
          text: 'Lưu trữ',
          style: 'primary',
          onPress: async () => {
            try {
              console.log('[VisionBoard] Archiving widgets:', validIds);

              // Update widgets one by one to avoid RLS issues
              let successCount = 0;
              for (const id of validIds) {
                const { error } = await supabase
                  .from('vision_board_widgets')
                  .update({ archived: true, archived_at: new Date().toISOString() })
                  .eq('id', id)
                  .eq('user_id', user.id);

                if (!error) {
                  successCount++;
                } else {
                  console.error('[VisionBoard] Failed to archive widget:', id, error);
                }
              }

              console.log('[VisionBoard] Successfully archived', successCount, 'of', validIds.length, 'widgets');

              // Check if any widgets were actually archived
              if (successCount === 0) {
                // All failed - show error
                setAlertConfig({
                  visible: true,
                  type: 'error',
                  title: 'Lỗi lưu trữ',
                  message: 'Không thể lưu trữ mục tiêu. Vui lòng thử lại.',
                  buttons: [{ text: 'OK', style: 'primary' }],
                });
                return;
              }

              // Update local state - filter out archived widgets
              setWidgets(prev => prev.filter(w => !validIds.includes(w?.id)));

              // Reset selected lifeArea if all its widgets were archived
              setSelectedGoalLifeArea(null);

              // Show success message
              setAlertConfig({
                visible: true,
                type: 'success',
                title: 'Đã lưu trữ',
                message: `Đã lưu trữ ${successCount} mục tiêu thành công.`,
                buttons: [{ text: 'OK', style: 'primary' }],
              });
            } catch (err) {
              console.error('[VisionBoard] Archive error:', err);
              setAlertConfig({
                visible: true,
                type: 'error',
                title: 'Lỗi',
                message: 'Không thể lưu trữ widgets. Vui lòng thử lại.',
                buttons: [{ text: 'OK', style: 'primary' }],
              });
            }
          },
        },
      ],
    });
  }, [user?.id]);

  // Add new widget - now opens GoalCreationOptions first
  const handleAddWidget = useCallback(() => {
    console.log('[VisionBoard] handleAddWidget called - opening GoalCreationOptions');
    setShowGoalCreationOptions(true);
  }, []);

  // Handle GoalCreationOptions selection
  const handleQuickCreate = useCallback(() => {
    // "Tạo nhanh theo lĩnh vực" - Use existing life area selector flow
    console.log('[VisionBoard] Quick create by life area selected');
    setEditingWidget(null);
    setWidgetForm({ type: 'goal', title: '', content: '' });
    setModalStep(1); // Start at step 1: lifeArea selection (existing flow)
    setSelectedLifeArea(null);
    setScenarios([]);
    setSelectedScenario(null);
    setShowAddModal(true);
  }, []);

  const handleTemplateCreate = useCallback(() => {
    // "Tạo từ Journal/Template" - Show TemplateSelector for Fear-Setting, Think Day, etc.
    console.log('[VisionBoard] Template create selected - showing TemplateSelector');
    setShowTemplateSelectorModal(true);
  }, []);

  const handleGemMasterCreate = useCallback(() => {
    console.log('[VisionBoard] GEM Master create selected - navigating');
    // Navigation handled by GoalCreationOptions component
  }, []);

  // Fetch scenarios from database when lifeArea is selected
  const fetchScenarios = useCallback(async (lifeArea) => {
    console.log('[VisionBoard] Fetching scenarios for:', lifeArea);
    setLoadingScenarios(true);

    // Create timeout promise to prevent infinite loading
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: Query took too long')), 10000);
    });

    try {
      const queryPromise = supabase
        .from('goal_scenarios')
        .select('*')
        .eq('life_area', lifeArea)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      // Race between query and timeout
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        console.error('[VisionBoard] Error fetching scenarios:', error);
        Alert.alert('Lỗi', 'Không thể tải mục tiêu. Vui lòng thử lại sau.');
        setScenarios([]);
      } else {
        console.log('[VisionBoard] Fetched scenarios:', data?.length);
        setScenarios(data || []);
      }
    } catch (err) {
      console.error('[VisionBoard] Fetch scenarios error:', err);
      Alert.alert('Lỗi', `Không thể tải mục tiêu: ${err.message || 'Lỗi không xác định'}`);
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

  // Handle scenario selection - NOW opens questionnaire for deeper personalization
  const handleSelectScenario = useCallback((scenario) => {
    console.log('[VisionBoard] Selected scenario, opening questionnaire:', scenario?.title);
    setSelectedScenario(scenario);
    setShowAddModal(false); // Close the scenario selection modal
    setShowQuestionnaire(true); // Open questionnaire
  }, []);

  // Handle questionnaire completion - save personalized goal + affirmations + actions
  // NOW uses journalRoutingService for two-way linking with Calendar/Journal
  const handleQuestionnaireComplete = useCallback(async (personalizedData) => {
    console.log('[VisionBoard] Questionnaire completed:', personalizedData);
    console.log('[VisionBoard] Rituals from questionnaire:', personalizedData?.rituals);
    setShowQuestionnaire(false);

    if (!user?.id || !personalizedData) return;

    try {
      // Get rituals - use provided or fallback to default for life area
      const providedRituals = personalizedData?.rituals || [];
      const defaultRitual = DEFAULT_RITUALS[personalizedData.lifeArea] || DEFAULT_RITUALS.personal;
      const ritualsToSave = providedRituals.length > 0 ? providedRituals : [defaultRitual];

      console.log('[VisionBoard] Saving goal with two-way linking via journalRoutingService:', {
        goalTitle: personalizedData.goalTitle,
        lifeArea: personalizedData.lifeArea,
        rituals: ritualsToSave.length,
      });

      // Use journalRoutingService for two-way linking with Calendar/Journal
      const result = await createQuickGoalWithJournal({
        userId: user.id,
        lifeArea: personalizedData.lifeArea,
        goalTitle: personalizedData.goalTitle,
        goalDescription: personalizedData.questionnaire
          ? `Từ questionnaire: ${JSON.stringify(personalizedData.questionnaire)}`
          : '',
        actions: (personalizedData.actionSteps || []).map((step, i) => ({
          id: step.id || `step_${Date.now()}_${i}`,
          title: step.title || step,
          text: step.title || step,
          description: step.description || '',
          action_type: step.action_type || 'daily',
        })),
        affirmations: personalizedData.affirmations || [],
        questionnaire: personalizedData.questionnaire,
        deadline: personalizedData.deadline,
        rituals: ritualsToSave,
      });

      if (result.success) {
        console.log('[VisionBoard] Goal created with two-way linking:', {
          journalId: result.journalEntry?.id,
          goalId: result.goal?.id,
          widgetId: result.widget?.id,
        });

        // Update local widget state with all created widgets
        const newWidgets = [
          result.widget,
          result.affirmationWidget,
          result.actionPlanWidget,
        ].filter(Boolean);

        setWidgets(prev => [...prev, ...newWidgets]);

        // Show success with personalization note
        setAlertConfig({
          visible: true,
          type: 'success',
          title: 'Mục tiêu đã được cá nhân hóa!',
          message: `"${personalizedData.goalTitle}" với ${personalizedData.affirmations?.length || 0} khẳng định và ${personalizedData.actionSteps?.length || 0} bước hành động. Đã liên kết với Calendar & Journal.`,
          buttons: [{ text: 'Tuyệt vời!', style: 'primary' }],
        });
      } else {
        throw new Error(result.error || 'Không thể tạo mục tiêu');
      }

      // Reset selection state
      setSelectedScenario(null);
      setSelectedLifeArea(null);

    } catch (error) {
      console.error('[VisionBoard] Error saving personalized goal:', error);
      setAlertConfig({
        visible: true,
        type: 'error',
        title: 'Lỗi',
        message: error.message || 'Không thể lưu mục tiêu. Vui lòng thử lại.',
        buttons: [{ text: 'OK', style: 'primary' }],
      });
    }
  }, [user?.id]);

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
        content: contentData, // Direct object for JSONB column
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
  // REMOVED: Blocking loading state - UI always renders immediately
  // Data loads in background, content shows from cache or empty state

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
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setShowSettingsModal(true)}
        >
          <Settings size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
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
            {/* =========== NEW: DAILY SCORE & STREAK (TOP OF PAGE) =========== */}
            {/* Score formula: 40% goals + 30% affirmations + 30% habits */}
            <DailyScoreCard
              dailyScore={Math.round(
                (stats.goalsCompleted / Math.max(stats.goalsTotal, 1)) * 40 +
                (stats.affirmationsCompleted > 0 ? 30 : 0) +
                (stats.habitsPercent / 100) * 30
              )}
              tasksCompleted={stats.goalsCompleted + stats.affirmationsCompleted + Math.round(stats.habitsPercent / 100 * allHabits.length)}
              tasksTotal={stats.goalsTotal + 1 + allHabits.length}
              streakDays={streakDays}
              currentLevel={currentLevel}
              levelTitle={levelTitle}
              comboCount={comboCount}
              xpToday={xpToday}
            />

            {/* =========== NEW: QUICK STATS ROW =========== */}
            <QuickStatsRow
              stats={{
                goals: { completed: stats.goalsCompleted, total: stats.goalsTotal },
                affirmations: { completed: stats.affirmationsCompleted, total: allAffirmations.length || 0 },
                habits: { completed: Math.round(stats.habitsPercent / 100 * allHabits.length), total: allHabits.length },
                xpToday: xpToday,
              }}
              onStatPress={(statKey) => {
                console.log('[VisionBoard] Stat pressed:', statKey);
                // TODO: Implement scroll to section
              }}
            />

            {/* =========== XP LEVEL TRACKER (Compact Inline) =========== */}
            <XPGoalTrackerInline
              totalXP={totalXP}
              currentLevel={currentLevel}
              levelTitle={currentLevelData?.title || 'Người Mới Bắt Đầu'}
              levelBadge={currentLevelData?.badge || 'seedling'}
              xpForCurrentLevel={currentLevelData?.xpRequired || 0}
              xpForNextLevel={nextLevelData?.xpRequired || 100}
              showWeeklyXP={true}
              weeklyXP={weeklyXPEarned}
            />

            {/* Spacing before Featured Ritual Section */}
            <View style={{ height: SPACING.lg }} />

            {/* =========== NEW: FEATURED RITUAL SECTION =========== */}
            <FeaturedRitualSection
              onRitualPress={(ritual) => {
                console.log('[VisionBoard] Ritual pressed:', ritual?.id, ritual?.title);
                // Preload video for smoother transition
                if (ritual?.id) {
                  preloadVideo(ritual.id);
                }
                // Navigate to dedicated ritual screen based on ritual ID
                const ritualScreenMap = {
                  // All 8 Cosmic Glassmorphism ritual screens
                  'heart-expansion': 'HeartExpansionRitual',      // Mở Rộng Trái Tim
                  'heart-opening': 'HeartExpansionRitual',        // Alias for heart-expansion
                  'gratitude-flow': 'GratitudeFlowRitual',        // Dòng Chảy Biết Ơn
                  'cleansing-breath': 'CleansingBreathRitual',    // Hơi Thở Thanh Lọc
                  'purify-breathwork': 'CleansingBreathRitual',   // Alias for cleansing-breath
                  'water-manifest': 'WaterManifestRitual',        // Hiện Thực Hóa Bằng Nước
                  'letter-to-universe': 'LetterToUniverseRitual', // Thư Gửi Vũ Trụ
                  'burn-release': 'BurnReleaseRitual',            // Đốt & Buông Bỏ
                  'star-wish': 'StarWishRitual',                  // Ước Nguyện Sao Băng
                  'crystal-healing': 'CrystalHealingRitual',      // Chữa Lành Pha Lê
                };
                const screenName = ritualScreenMap[ritual?.id] || 'HeartExpansionRitual';
                navigation.navigate(screenName, { ritual });
              }}
              onCreateRitual={() => {
                console.log('[VisionBoard] Create ritual pressed');
                // Navigate to HeartExpansion for create mode
                navigation.navigate('HeartExpansionRitual', { ritual: null, mode: 'create' });
              }}
              onAmbientMode={() => {
                console.log('[VisionBoard] Ambient mode pressed');
                // Navigate to CleansingBreath for ambient/meditation mode
                navigation.navigate('CleansingBreathRitual', { ritual: null, mode: 'ambient' });
              }}
              onViewAllRituals={() => {
                navigation.navigate('RitualHistory');
              }}
            />

            {/* =========== MỤC TIÊU CỦA TÔI (Goals Section - moved above Calendar) =========== */}
            {/* Goal Tabs - Selectable cards by Life Area */}
            {hasGroupedWidgets && (
              <View
                onLayout={(event) => {
                  goalsSectionY.current = event.nativeEvent.layout.y;
                  // Check for pending scroll request
                  if (pendingScrollToGoals.current) {
                    setTimeout(() => scrollToGoalsSection(), 100);
                  }
                }}
              >
                {/* GoalsGridSection - Grid layout with category filter chips, thumbnail cards, and delete buttons */}
                <GoalsGridSection
                  groupedByLifeArea={groupedByLifeArea}
                  selectedCategory={selectedGoalLifeArea || 'all'}
                  onCategoryChange={setSelectedGoalLifeArea}
                  onAddGoal={() => setShowLifeAreaPicker(true)}
                  onDeleteGoal={handleDeleteWidget}
                  navigation={navigation}
                />
              </View>
            )}

            {/* Ungrouped Goals Section (widgets without lifeArea) */}
            {ungroupedGoals.length > 0 && (
              <View
                onLayout={(event) => {
                  // Only set if not already set by grouped widgets
                  if (goalsSectionY.current === 0) {
                    goalsSectionY.current = event.nativeEvent.layout.y;
                    // Check for pending scroll request
                    if (pendingScrollToGoals.current) {
                      setTimeout(() => scrollToGoalsSection(), 100);
                    }
                  }
                }}
              >
                <GoalsSection
                  goals={ungroupedGoals}
                  widgets={groupedByLifeArea.ungroupedWidgets}
                  onToggle={handleToggleItem}
                  onEdit={handleEditWidget}
                  onDelete={handleDeleteWidget}
                  onNavigateToGemMaster={() => navigateToGemMaster('Tôi muốn đặt mục tiêu mới')}
                />
              </View>
            )}

            {/* Empty Goals State (only if no grouped and no ungrouped goals) */}
            {!hasGroupedWidgets && ungroupedGoals.length === 0 && (
              <View
                onLayout={(event) => {
                  // Set for empty state (user just added their first goal)
                  if (goalsSectionY.current === 0) {
                    goalsSectionY.current = event.nativeEvent.layout.y;
                    // Check for pending scroll request
                    if (pendingScrollToGoals.current) {
                      setTimeout(() => scrollToGoalsSection(), 100);
                    }
                  }
                }}
              >
                <GoalsSection
                  goals={[]}
                  widgets={[]}
                  onToggle={handleToggleItem}
                  onEdit={handleEditWidget}
                  onDelete={handleDeleteWidget}
                  onNavigateToGemMaster={() => navigateToGemMaster('Tôi muốn đặt mục tiêu mới')}
                />
              </View>
            )}

            {/* Add Goal Button - Below Goals Section */}
            <TouchableOpacity
              style={[styles.addWidgetButton, { marginBottom: SPACING.xl }]}
              onPress={handleAddWidget}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Plus size={20} color={COLORS.gold} />
              <Text style={styles.addWidgetText}>Thêm Mục Tiêu Mới</Text>
            </TouchableOpacity>

            {/* =========== NEW: CHARTS & CALENDAR SECTIONS =========== */}
            {/* Monthly Calendar */}
            <View style={styles.newSection}>
              <View style={styles.newSectionHeader}>
                <Clock size={18} color={COLORS.cyan} />
                <Text style={styles.newSectionTitle}>Lịch tháng này</Text>
                <TouchableOpacity
                  onPress={() => setActiveTooltip('calendar')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <HelpCircle size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
              <MonthCalendarCompact
                eventsByDate={calendarEvents}
                selectedDate={selectedDate}
                onDateSelect={async (date) => {
                  setSelectedDate(date);
                  // Fetch data first so it's ready when modal opens
                  try {
                    if (user?.id) {
                      const journalResult = await calendarService.getDayCalendarData(user.id, date);
                      if (journalResult.success) {
                        setJournalRituals(journalResult.rituals || []);
                        setJournalReadings(journalResult.readings || []);
                        setJournalPaperTrades(journalResult.paperTrades || []);
                        setJournalTradingJournal(journalResult.tradingJournal || []);
                        setJournalActions(journalResult.actions || []);
                        // Calendar Smart Journal data
                        setJournalEntries(journalResult.journal || []);
                        setTradingEntries(journalResult.trading || []);
                        setJournalMood(journalResult.mood || null);
                      }
                    }
                  } catch (error) {
                    console.error('[VisionBoard] Error loading day data:', error);
                  }
                  // Open modal after data is ready
                  setDayDetailModalVisible(true);
                }}
                showLegend={true}
              />
            </View>

            {/* Day Detail Modal */}
            <DayDetailModal
              visible={dayDetailModalVisible}
              onClose={() => {
                setDayDetailModalVisible(false);
                setJournalRituals([]);
                setJournalReadings([]);
                setJournalPaperTrades([]);
                setJournalTradingJournal([]);
                setJournalActions([]);
                setJournalEntries([]);
                setTradingEntries([]);
                setJournalMood(null);
              }}
              date={selectedDate}
              events={calendarEvents[selectedDate] || []}
              rituals={journalRituals}
              readings={journalReadings}
              paperTrades={journalPaperTrades}
              tradingJournal={journalTradingJournal}
              actions={journalActions}
              journalEntries={journalEntries}
              tradingEntries={tradingEntries}
              mood={journalMood}
              onEventComplete={async (event) => {
                console.log('[VisionBoard] Event completed:', event.id);
                try {
                  const result = await calendarService.completeEvent(event.id, user?.id);
                  if (result.success) {
                    // Update local state to reflect the change
                    setCalendarEvents(prev => {
                      const updated = { ...prev };
                      const dateKey = event.event_date || selectedDate;
                      if (updated[dateKey]) {
                        updated[dateKey] = updated[dateKey].map(e =>
                          e.id === event.id ? { ...e, is_completed: true } : e
                        );
                      }
                      return updated;
                    });
                    console.log('[VisionBoard] Event marked as completed successfully');
                  } else {
                    console.error('[VisionBoard] Failed to complete event:', result.error);
                  }
                } catch (error) {
                  console.error('[VisionBoard] Complete event error:', error);
                }
              }}
              onAddEvent={(date, templateType) => {
                console.log('[VisionBoard] Add event for date:', date, 'template:', templateType);

                if (templateType === 'simple_event') {
                  // Open simple event modal
                  setDayDetailModalVisible(false);
                  setTimeout(() => setAddEventModalVisible(true), 100);
                } else if (templateType) {
                  // Navigate directly to JournalEntry with template
                  // Set pending reopen so modal reopens on goBack()
                  const eventDate = date || selectedDate;
                  pendingModalReopen.current = eventDate;
                  setDayDetailModalVisible(false);
                  setTimeout(() => {
                    navigation.navigate('JournalEntry', {
                      mode: 'create',
                      date: eventDate,
                      templateId: templateType,
                      sourceScreen: 'VisionBoard',
                      returnDate: eventDate,
                    });
                  }, 100);
                } else {
                  // Fallback: show template selector (shouldn't happen with new inline UI)
                  setDayDetailModalVisible(false);
                  setTimeout(() => setShowCalendarTemplateSelector(true), 200);
                }
              }}
              onEditEvent={(event) => {
                console.log('[VisionBoard] Edit event:', event.id);
                // Set pending reopen so modal reopens on goBack()
                const eventDate = selectedDate || event.event_date;
                pendingModalReopen.current = eventDate;
                setDayDetailModalVisible(false);
                // Navigate to EditEvent screen with event data
                navigation.navigate('EditEvent', {
                  eventId: event.id,
                  date: eventDate,
                  sourceScreen: 'VisionBoard',
                  returnDate: eventDate,
                });
              }}
              onDeleteEvent={async (event) => {
                console.log('[VisionBoard] Delete event:', event.id);
                try {
                  const result = await calendarService.deleteEvent(event.id, user?.id);
                  if (result.success) {
                    // Update local state to remove the event
                    setCalendarEvents(prev => {
                      const updated = { ...prev };
                      const dateKey = event.event_date || selectedDate;
                      if (updated[dateKey]) {
                        updated[dateKey] = updated[dateKey].filter(e => e.id !== event.id);
                      }
                      return updated;
                    });
                  } else {
                    console.error('[VisionBoard] Delete event failed:', result.error);
                  }
                } catch (error) {
                  console.error('[VisionBoard] Delete event error:', error);
                }
              }}
              onRitualPress={(ritual) => {
                console.log('[VisionBoard] Ritual pressed:', ritual.ritual_slug);
                setDayDetailModalVisible(false);
                // Navigate to the specific ritual screen
                const ritualSlug = ritual.ritual_slug || ritual.ritual_id;
                const ritualScreenMap = {
                  'heart-expansion': 'HeartExpansionRitual',
                  'gratitude-flow': 'GratitudeFlowRitual',
                  'cleansing-breath': 'CleansingBreathRitual',
                  'water-manifest': 'WaterManifestRitual',
                  'letter-to-universe': 'LetterToUniverseRitual',
                  'burn-release': 'BurnReleaseRitual',
                  'star-wish': 'StarWishRitual',
                  'crystal-healing': 'CrystalHealingRitual',
                };
                const screenName = ritualScreenMap[ritualSlug];
                if (screenName) {
                  navigation.navigate(screenName);
                } else {
                  navigation.navigate('RitualHistory');
                }
              }}
              onReadingPress={(reading) => {
                console.log('[VisionBoard] Reading pressed:', reading.reading_type);
                setDayDetailModalVisible(false);
                // Navigate to GemMaster stack -> ReadingDetail
                navigation.navigate('GemMaster', {
                  screen: 'ReadingDetail',
                  params: {
                    readingId: reading.id,
                    readingType: reading.reading_type,
                  },
                });
              }}
              onTradePress={(trade) => {
                console.log('[VisionBoard] Trading journal entry pressed:', trade.id);
                // Set pending reopen so modal reopens on goBack()
                pendingModalReopen.current = selectedDate;
                setDayDetailModalVisible(false);
                // Navigate to trading journal entry (from trading_journal_entries table)
                navigation.navigate('TradingJournal', {
                  mode: 'edit',
                  entryId: trade.id,
                  date: selectedDate,
                  sourceScreen: 'VisionBoard',
                  returnDate: selectedDate,
                });
              }}
              onPaperTradePress={(trade) => {
                console.log('[VisionBoard] Paper trade pressed:', trade.id, trade.symbol);
                setDayDetailModalVisible(false);
                // Navigate to paper trade history (from paper_trades table)
                navigation.navigate('PaperTradeHistory', {
                  highlightTradeId: trade.id,
                  symbol: trade.symbol,
                });
              }}
              onViewTradingJournal={() => {
                console.log('[VisionBoard] View Trading Journal pressed');
                // Set pending reopen so modal reopens on goBack()
                pendingModalReopen.current = selectedDate;
                setDayDetailModalVisible(false);
                navigation.navigate('TradingJournal', {
                  date: selectedDate,
                  sourceScreen: 'VisionBoard',
                  returnDate: selectedDate,
                });
              }}
              onJournalPress={(entry) => {
                console.log('[VisionBoard] Journal entry pressed:', entry.id);
                // Set pending reopen so modal reopens on goBack()
                pendingModalReopen.current = selectedDate;
                setDayDetailModalVisible(false);
                // Navigate to journal entry detail/edit screen
                navigation.navigate('JournalEntry', {
                  mode: 'edit',
                  entryId: entry.id,
                  date: selectedDate,
                  sourceScreen: 'VisionBoard',
                  returnDate: selectedDate,
                });
              }}
              onEditJournal={(entry) => {
                console.log('[VisionBoard] Edit journal entry:', entry.id);
                // Set pending reopen so modal reopens on goBack()
                pendingModalReopen.current = selectedDate;
                setDayDetailModalVisible(false);
                navigation.navigate('JournalEntry', {
                  mode: 'edit',
                  entryId: entry.id,
                  date: selectedDate,
                  sourceScreen: 'VisionBoard',
                  returnDate: selectedDate,
                });
              }}
              onDeleteJournal={async (entry) => {
                console.log('[VisionBoard] Delete journal entry:', entry.id);
                try {
                  const result = await calendarJournalService.deleteJournalEntry(user?.id, entry.id);
                  if (result.success) {
                    // Remove from local state
                    setJournalEntries(prev => prev.filter(e => e.id !== entry.id));
                  }
                } catch (error) {
                  console.error('[VisionBoard] Delete journal error:', error);
                }
              }}
              onEditTradingEntry={(trade) => {
                console.log('[VisionBoard] Edit trading entry:', trade.id);
                // Set pending reopen so modal reopens on goBack()
                pendingModalReopen.current = selectedDate;
                setDayDetailModalVisible(false);
                navigation.navigate('TradingJournal', {
                  mode: 'edit',
                  entryId: trade.id,
                  date: selectedDate,
                  sourceScreen: 'VisionBoard',
                  returnDate: selectedDate,
                });
              }}
              onDeleteTradingEntry={async (trade) => {
                console.log('[VisionBoard] Delete trading entry:', trade.id);
                try {
                  const result = await tradingJournalService.deleteTradingEntry(user?.id, trade.id);
                  if (result.success) {
                    // Remove from local state
                    setTradingEntries(prev => prev.filter(e => e.id !== trade.id));
                  }
                } catch (error) {
                  console.error('[VisionBoard] Delete trading entry error:', error);
                }
              }}
              onEditRitual={async (ritual) => {
                console.log('[VisionBoard] Edit ritual reflection:', ritual.id, ritual.newReflection);
                const newReflection = ritual.newReflection;

                if (newReflection !== undefined) {
                  try {
                    const result = await updateRitualReflection(user?.id, ritual.id, newReflection);
                    if (result.success) {
                      setJournalRituals(prev => prev.map(r =>
                        r.id === ritual.id
                          ? { ...r, content: { ...r.content, reflection: newReflection } }
                          : r
                      ));
                    }
                  } catch (error) {
                    console.error('[VisionBoard] Edit ritual error:', error);
                  }
                }
              }}
              onDeleteRitual={async (ritual) => {
                console.log('[VisionBoard] Delete ritual completion:', ritual.id);
                try {
                  const result = await deleteRitualCompletion(user?.id, ritual.id);
                  if (result.success) {
                    // Remove from local state
                    setJournalRituals(prev => prev.filter(r => r.id !== ritual.id));
                  } else {
                    console.error('[VisionBoard] Delete ritual failed:', result.error);
                  }
                } catch (error) {
                  console.error('[VisionBoard] Delete ritual error:', error);
                }
              }}
              onMoodUpdated={async () => {
                // Refresh journal data AND calendar events after mood is saved
                if (user?.id && selectedDate) {
                  const now = new Date(selectedDate);
                  const year = now.getFullYear();
                  const month = now.getMonth() + 1;

                  // Calculate date range for the month
                  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
                  const lastDay = new Date(year, month, 0).getDate();
                  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

                  // 1. Refresh calendar events AND mood data for the current month (for dots/markers)
                  const [eventsResult, moodResult] = await Promise.all([
                    calendarService.getMonthEventsGrouped(user.id, year, month),
                    supabase
                      .from('calendar_daily_mood')
                      .select('id, mood_date, overall_mood_score, morning_mood, evening_mood, overall_mood')
                      .eq('user_id', user.id)
                      .gte('mood_date', startDate)
                      .lte('mood_date', endDate),
                  ]);

                  // Build events map including mood data
                  const eventsMap = { ...(eventsResult.eventsByDate || {}) };

                  // Add mood entries to eventsMap
                  if (moodResult.data) {
                    moodResult.data.forEach(mood => {
                      const date = mood.mood_date;
                      if (date) {
                        if (!eventsMap[date]) eventsMap[date] = [];
                        const moodText = mood.overall_mood || mood.morning_mood || mood.evening_mood || 'Tâm trạng';
                        // Check if mood entry already exists to avoid duplicates
                        const hasMoodEntry = eventsMap[date].some(e => e.source_type === 'mood' && e.id === mood.id);
                        if (!hasMoodEntry) {
                          eventsMap[date].push({
                            id: mood.id,
                            title: moodText,
                            source_type: 'mood',
                            color: '#FFD700',
                          });
                        }
                      }
                    });
                  }

                  setCalendarEvents(eventsMap);

                  // 2. Refresh the day detail data
                  const journalResult = await calendarService.getDayCalendarData(user.id, selectedDate);
                  if (journalResult.success) {
                    setJournalRituals(journalResult.rituals || []);
                    setJournalReadings(journalResult.readings || []);
                    setJournalPaperTrades(journalResult.paperTrades || []);
                    setJournalTradingJournal(journalResult.tradingJournal || []);
                    setJournalActions(journalResult.actions || []);
                    setJournalEntries(journalResult.journal || []);
                    setTradingEntries(journalResult.trading || []);
                    setJournalMood(journalResult.mood || null);
                  }
                }
              }}
            />

            {/* Add Event Modal */}
            <AddEventModal
              visible={addEventModalVisible}
              date={selectedDate}
              userId={user?.id}
              onClose={() => setAddEventModalVisible(false)}
              onEventCreated={async (newEvent) => {
                console.log('[VisionBoard] Event created:', newEvent);
                // Refresh calendar events for the current month
                if (user?.id) {
                  const now = new Date(selectedDate);
                  const result = await calendarService.getMonthEventsGrouped(
                    user.id,
                    now.getFullYear(),
                    now.getMonth() + 1
                  );
                  if (result.success) {
                    setCalendarEvents(result.eventsByDate || {});
                  }
                  // Also refresh the day detail if open
                  const journalResult = await calendarService.getDayCalendarData(user.id, selectedDate);
                  if (journalResult.success) {
                    setJournalRituals(journalResult.rituals || []);
                    setJournalReadings(journalResult.readings || []);
                    setJournalPaperTrades(journalResult.paperTrades || []);
                    setJournalTradingJournal(journalResult.tradingJournal || []);
                    setJournalActions(journalResult.actions || []);
                    setJournalEntries(journalResult.journal || []);
                    setTradingEntries(journalResult.trading || []);
                    setJournalMood(journalResult.mood || null);
                  }
                }
              }}
            />

            {/* Calendar Template Selector Modal */}
            <Modal
              visible={showCalendarTemplateSelector}
              transparent
              animationType="slide"
              onRequestClose={() => setShowCalendarTemplateSelector(false)}
            >
              <Pressable
                style={styles.calendarTemplateSelectorOverlay}
                onPress={() => setShowCalendarTemplateSelector(false)}
              >
                <Pressable style={styles.calendarTemplateSelectorContainer} onPress={e => e.stopPropagation()}>
                  <View style={styles.calendarTemplateSelectorHeader}>
                    <Text style={styles.calendarTemplateSelectorTitle}>Chọn loại nhật ký</Text>
                    <TouchableOpacity onPress={() => setShowCalendarTemplateSelector(false)}>
                      <X size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView
                    style={styles.calendarTemplateSelectorContent}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={true}
                    bounces={true}
                  >
                    <TemplateSelector
                      onSelect={(template) => {
                        const templateId = template?.id || template;
                        console.log('[VisionBoard] Calendar template selected:', templateId);
                        setShowCalendarTemplateSelector(false);
                        // Navigate to JournalEntry screen with template
                        navigation.navigate('JournalEntry', {
                          mode: 'create',
                          date: selectedDate,
                          templateId: templateId,
                        });
                      }}
                      userTier={userTier}
                      userRole={user?.role}
                      layout="grid"
                      showDescription={true}
                    />
                  </ScrollView>
                  <TouchableOpacity
                    style={styles.calendarSkipTemplateButton}
                    onPress={() => {
                      setShowCalendarTemplateSelector(false);
                      setAddEventModalVisible(true); // Show basic event modal
                    }}
                  >
                    <Calendar size={18} color={COLORS.textSecondary} />
                    <Text style={styles.calendarSkipTemplateText}>Tạo sự kiện đơn giản</Text>
                  </TouchableOpacity>
                </Pressable>
              </Pressable>
            </Modal>

            {/* Life Balance Radar Chart - New Full Card UI */}
            <LifeBalanceCard
              data={lifeAreaScores}
              onAreaPress={(areaKey) => {
                // Navigate to that life area's goals
                setSelectedGoalLifeArea(areaKey);
              }}
              onViewDetails={() => setActiveTooltip('radar')}
            />

            {/* Spacing between Life Balance and Weekly Progress */}
            <View style={{ height: SPACING.lg }} />

            {/* Weekly Progress - New Full Card UI */}
            <WeeklyProgressCard
              data={weeklyProgress}
              previousWeekAvg={0}
              onViewDetails={() => setActiveTooltip('weekly')}
            />

            {/* Info Tooltip Modal */}
            <InfoTooltip
              tooltip={activeTooltip ? SECTION_TOOLTIPS[activeTooltip] : ''}
              isVisible={!!activeTooltip}
              onClose={() => setActiveTooltip(null)}
            />

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
                onToggleHabit={handleToggleHabit}
                onSaveAffirmation={handleSaveAffirmation}
                onSaveActionStep={handleSaveActionStep}
                onDeleteAffirmation={handleDeleteAffirmation}
                onDeleteActionStep={handleDeleteActionStep}
                onAddAffirmation={handleAddAffirmation}
                onAddActionStep={handleAddActionStep}
                onAffirmationComplete={handleAffirmationComplete}
                onReadAloud={handleReadAloud}
              />
            )}

            {/* Spacing before Divination Section */}
            <View style={{ height: SPACING.lg }} />

            {/* Divination Section (Trải bài & Gieo quẻ) - Redesigned */}
            <DivinationSection
              readings={allReadings}
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
              onDelete={handleDeleteReading}
              onDeleteMultiple={handleDeleteMultipleReadings}
              onCreateRitual={(reading) => {
                // Navigate to GratitudeFlowRitual with context from reading
                navigation.navigate('GratitudeFlowRitual', {
                  ritual: {
                    id: 'letter-to-universe',
                    prefilledText: reading?.content?.interpretation || reading?.content?.notes || '',
                  },
                  mode: 'create',
                });
              }}
              loading={loading}
            />

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
                        style={styles.lifeAreaCard}
                        onPress={() => handleSelectLifeArea(area.key)}
                      >
                        <View style={[styles.lifeAreaIconContainer, { backgroundColor: `${area.color}20` }]}>
                          <IconComponent size={28} color={area.color} />
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

      {/* Goal Creation Options - 3 entry points modal */}
      <GoalCreationOptions
        visible={showGoalCreationOptions}
        onClose={() => setShowGoalCreationOptions(false)}
        onSelectQuick={handleQuickCreate}
        onSelectTemplate={handleTemplateCreate}
        onSelectGemMaster={handleGemMasterCreate}
      />

      {/* Template Selector Modal - For "Tạo từ Journal/Template" option */}
      <Modal
        visible={showTemplateSelectorModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTemplateSelectorModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTemplateSelectorModal(false)}
        >
          <View style={styles.templateSelectorContainer}>
            <View style={styles.templateSelectorHeader}>
              <Text style={styles.templateSelectorTitle}>Chọn Template</Text>
              <TouchableOpacity onPress={() => setShowTemplateSelectorModal(false)}>
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <TemplateSelector
              userTier={userTier}
              userRole={user?.role}
              onSelect={(template) => {
                console.log('[VisionBoard] Template selected:', template.id);
                setShowTemplateSelectorModal(false);
                // Navigate to GEM Master with the selected template
                navigation.navigate('GemMaster', {
                  autoShowTemplate: template.id,
                  entryPoint: 'visionboard',
                });
              }}
              onUpgradePress={() => {
                setShowTemplateSelectorModal(false);
                // UpgradeScreen is in same stack (AccountStack), so direct navigation works
                navigation.navigate('UpgradeScreen');
              }}
              layout="grid"
              showDescription={true}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Goal Setup Questionnaire - Deeper personalization flow */}
      <GoalSetupQuestionnaire
        visible={showQuestionnaire}
        onClose={() => {
          setShowQuestionnaire(false);
          setSelectedScenario(null);
        }}
        onComplete={handleQuestionnaireComplete}
        scenario={selectedScenario}
        lifeArea={selectedLifeArea}
      />

      {/* Vision Board Settings Modal - Daily Reminder */}
      <Modal
        visible={showSettingsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSettingsModal(false)}
        >
          <Pressable style={styles.settingsModalContainer} onPress={e => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.settingsModalHeader}>
              <Settings size={22} color={COLORS.gold} />
              <Text style={styles.settingsModalTitle}>Cài đặt Vision Board</Text>
              <TouchableOpacity
                onPress={() => setShowSettingsModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Daily Reminder Toggle */}
            <View style={styles.settingsRow}>
              <View style={styles.settingsRowLeft}>
                <Clock size={20} color={COLORS.purple} />
                <View style={styles.settingsRowText}>
                  <Text style={styles.settingsLabel}>Nhắc nhở hàng ngày</Text>
                  <Text style={styles.settingsDescription}>
                    Nhận thông báo để xem Vision Board mỗi ngày
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  reminderEnabled && styles.toggleButtonActive
                ]}
                onPress={() => handleToggleReminder(!reminderEnabled)}
              >
                <View style={[
                  styles.toggleCircle,
                  reminderEnabled && styles.toggleCircleActive
                ]} />
              </TouchableOpacity>
            </View>

            {/* Time Picker (only show when enabled) */}
            {reminderEnabled && (
              <View style={styles.timePickerContainer}>
                <Text style={styles.timePickerLabel}>Thời gian nhắc nhở:</Text>
                <View style={styles.timePicker}>
                  {/* Hour Selector */}
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => {
                      const newHour = (reminderHour + 1) % 24;
                      handleChangeReminderTime(newHour, reminderMinute);
                    }}
                  >
                    <ChevronUp size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                  <Text style={styles.timeValue}>
                    {reminderHour.toString().padStart(2, '0')}
                  </Text>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => {
                      const newHour = reminderHour === 0 ? 23 : reminderHour - 1;
                      handleChangeReminderTime(newHour, reminderMinute);
                    }}
                  >
                    <ChevronUp size={16} color={COLORS.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
                  </TouchableOpacity>

                  <Text style={styles.timeSeparator}>:</Text>

                  {/* Minute Selector */}
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => {
                      const newMinute = (reminderMinute + 15) % 60;
                      handleChangeReminderTime(reminderHour, newMinute);
                    }}
                  >
                    <ChevronUp size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                  <Text style={styles.timeValue}>
                    {reminderMinute.toString().padStart(2, '0')}
                  </Text>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => {
                      const newMinute = reminderMinute === 0 ? 45 : reminderMinute - 15;
                      handleChangeReminderTime(reminderHour, newMinute);
                    }}
                  >
                    <ChevronUp size={16} color={COLORS.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Info Text */}
            <View style={styles.settingsInfo}>
              <Sparkles size={14} color={COLORS.cyan} />
              <Text style={styles.settingsInfoText}>
                Mỗi ngày, hãy dành vài phút nhìn vào Vision Board để tiếp thêm năng lượng cho mục tiêu của bạn.
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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

  // Settings Modal Styles
  settingsModalContainer: {
    backgroundColor: 'rgba(15, 16, 48, 0.98)',
    borderRadius: 20,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.4)',
    maxWidth: 400,
    width: '100%',
  },
  settingsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingsModalTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  settingsRowText: {
    flex: 1,
  },
  settingsLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  settingsDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  toggleButton: {
    width: 52,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 2,
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: COLORS.purple,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.textMuted,
  },
  toggleCircleActive: {
    backgroundColor: COLORS.textPrimary,
    alignSelf: 'flex-end',
  },
  timePickerContainer: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  timePickerLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  timeButton: {
    padding: SPACING.xs,
  },
  timeValue: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    width: 50,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    marginHorizontal: SPACING.xs,
  },
  settingsInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.cyan,
  },
  settingsInfoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
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

  // Goal Thumbnail Grid
  goalGridContainer: {
    marginTop: SPACING.sm,
  },
  goalGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyGoalsGrid: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    marginTop: SPACING.md,
  },
  emptyGoalsText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.md,
    marginTop: SPACING.md,
  },
  emptyGoalsHint: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginTop: SPACING.xs,
  },

  // Goal Tabs Section
  goalTabsContainer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  goalTabsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  goalTabsTitle: {
    fontSize: TYPOGRAPHY.fontSize.md, // Consistent with other section headers
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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

  // Select Goal Hint - Subtle, matches app theme
  selectGoalHint: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: INPUT.borderRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  selectGoalHintText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
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

  // Frequency Group Styles (for daily/weekly/monthly action plans)
  frequencyGroup: {
    marginBottom: SPACING.md,
  },
  frequencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderLeftWidth: 3,
    marginBottom: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 4,
  },
  frequencyIcon: {
    fontSize: 14,
  },
  frequencyTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    flex: 1,
  },
  frequencyCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
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
    borderColor: 'rgba(106, 91, 255, 0.3)',
    shadowColor: GLASS.glowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: GLASS.glowOpacity,
    shadowRadius: 12,
    elevation: 6,
  },
  // NEW: Life Area Header Bar - Distinctive colored bar to separate goals
  goalAreaHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderTopLeftRadius: GLASS.borderRadius,
    borderTopRightRadius: GLASS.borderRadius,
  },
  goalAreaBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalAreaLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalAreaStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginLeft: 'auto',
  },
  goalAreaStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goalAreaStatText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  // Goal Card Header (collapsed view with progress bar) - Enhanced for better visibility
  goalCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    paddingVertical: SPACING.md + 4,
    gap: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.03)', // Subtle lighter background
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  goalCardInfo: {
    flex: 1,
  },
  goalCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  goalCardTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl, // Larger font size
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: 26,
    letterSpacing: 0.3,
  },
  goalCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md, // Increased from SPACING.xs for better separation
    marginLeft: SPACING.md,
  },
  goalCardActionBtn: {
    padding: SPACING.sm, // Increased from SPACING.xs for better touch target
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.xs,
  },
  goalCardToggleBtn: {
    padding: SPACING.md, // Larger padding for better touch target
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: SPACING.sm,
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Swipe action styles for goal cards
  swipeActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    height: 70, // Fixed height for swipe actions
  },
  swipeActionBtn: {
    width: 70,
    height: 70, // Fixed height instead of 100%
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeArchiveBtn: {
    backgroundColor: 'rgba(106, 91, 255, 0.9)',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  swipeDeleteBtn: {
    backgroundColor: '#E74C3C',
    borderTopRightRadius: GLASS.borderRadius,
    borderBottomRightRadius: GLASS.borderRadius,
  },
  swipeActionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textPrimary,
    marginTop: 4,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  goalCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  goalCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  goalCardMetaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  goalCardProgressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  goalCardProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalCardProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalCardProgressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    minWidth: 36,
    textAlign: 'right',
  },
  // Keep old styles for backwards compat
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

  // Ritual section styles in goal cards
  selectedRitualsSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  ritualsGrid: {
    gap: SPACING.sm,
  },
  ritualCardSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    borderRadius: 12,
    padding: SPACING.sm,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  ritualIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ritualInfoSmall: {
    flex: 1,
    gap: 2,
  },
  ritualTitleSmall: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  ritualSubtitleSmall: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  ritualPlayBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Spiritual Rituals (from I Ching/Tarot)
  spiritualRitualsSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(157, 78, 221, 0.15)',
  },
  spiritualRitualsContainer: {
    gap: SPACING.sm,
  },
  spiritualRitualCard: {
    backgroundColor: 'rgba(157, 78, 221, 0.08)',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.2)',
  },
  spiritualRitualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  spiritualRitualIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(157, 78, 221, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spiritualRitualName: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  spiritualRitualDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    lineHeight: TYPOGRAPHY.fontSize.sm * 1.5,
  },
  spiritualRitualEditIconBtn: {
    padding: 4,
  },
  spiritualRitualEditContainer: {
    backgroundColor: 'rgba(157, 78, 221, 0.08)',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.3)',
    gap: SPACING.sm,
  },
  spiritualRitualEditName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.3)',
  },
  spiritualRitualEditDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.2)',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  spiritualRitualEditActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  spiritualRitualEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  spiritualRitualEditBtnSave: {
    backgroundColor: COLORS.gold,
  },
  spiritualRitualEditBtnText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },

  // Add item button (for affirmations, action steps, rituals)
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: INPUT.borderRadius,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(212, 175, 55, 0.4)',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  addItemBtnText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gold,
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

  // Global Selection Mode Bar (single bar at top for all goals)
  globalSelectionModeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 189, 89, 0.4)',
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
  // Template Selector Modal
  templateSelectorContainer: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: COLORS.bgDarkest,
    borderRadius: 20,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  templateSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  templateSelectorTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  // Calendar Template Selector Modal
  calendarTemplateSelectorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 13, 43, 0.85)',
    justifyContent: 'flex-end',
  },
  calendarTemplateSelectorContainer: {
    backgroundColor: COLORS.bgMid,
    borderTopLeftRadius: SPACING.xl,
    borderTopRightRadius: SPACING.xl,
    maxHeight: '90%',
    minHeight: '75%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 70,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.3)',
  },
  calendarTemplateSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  calendarTemplateSelectorTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  calendarTemplateSelectorContent: {
    flexGrow: 1,
    flexShrink: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  calendarSkipTemplateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    borderRadius: SPACING.md,
    backgroundColor: 'rgba(13, 13, 43, 0.4)',
  },
  calendarSkipTemplateText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
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
    backgroundColor: 'rgba(30, 35, 60, 0.6)',
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    gap: SPACING.sm,
  },
  lifeAreaIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  lifeAreaLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
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

  // =========== NEW: CALENDAR & CHARTS SECTION STYLES ===========
  newSection: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    shadowColor: GLASS.glowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  newSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  newSectionTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  streakComboRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
});

export default VisionBoardScreen;
