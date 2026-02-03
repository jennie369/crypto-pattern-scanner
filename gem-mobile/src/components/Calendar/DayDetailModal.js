/**
 * Day Detail Modal Component
 * Modal showing events for a selected date
 *
 * Created: December 9, 2025
 * Part of Vision Board 2.0 Redesign
 * Updated: January 2026 - Cosmic theme redesign
 */

import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import * as Icons from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY, SPACING, GLASS } from '../../utils/tokens';
import { COSMIC_COLORS, COSMIC_GRADIENTS, COSMIC_SHADOWS, COSMIC_SPACING } from '../../theme/cosmicTokens';
import { CalendarEventItem } from './MonthCalendar';
import { useAuth } from '../../contexts/AuthContext';
import { saveMoodCheckIn, CHECK_IN_TYPES } from '../../services/moodTrackingService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Simple mood options with emojis - tap to save instantly
const QUICK_MOODS = [
  { id: 'happy', emoji: '😊', label: 'Vui' },
  { id: 'peaceful', emoji: '😌', label: 'Yên' },
  { id: 'excited', emoji: '🤩', label: 'Hưng' },
  { id: 'neutral', emoji: '😐', label: 'Ổn' },
  { id: 'tired', emoji: '😴', label: 'Mệt' },
  { id: 'anxious', emoji: '😰', label: 'Lo' },
  { id: 'sad', emoji: '😢', label: 'Buồn' },
];

// Vietnamese day names
const DAY_NAMES = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

// Ritual name mapping
const RITUAL_NAMES = {
  'heart-expansion': 'Mở Rộng Trái Tim',
  'gratitude-flow': 'Dòng Chảy Biết Ơn',
  'cleansing-breath': 'Hơi Thở Thanh Lọc',
  'water-manifest': 'Hiện Thực Hóa Bằng Nước',
  'letter-to-universe': 'Thư Gửi Vũ Trụ',
  'burn-release': 'Đốt & Buông Bỏ',
  'star-wish': 'Ước Nguyện Sao Băng',
  'crystal-healing': 'Chữa Lành Pha Lê',
};

// Reading type mapping - Cosmic colors
const READING_TYPES = {
  tarot: { name: 'Tarot', icon: 'Sparkles', color: COSMIC_COLORS.glow.purple },
  iching: { name: 'I Ching', icon: 'BookOpen', color: COSMIC_COLORS.glow.cyan },
  numerology: { name: 'Số Học', icon: 'Hash', color: COSMIC_COLORS.glow.gold },
  angel: { name: 'Thiên Thần', icon: 'Feather', color: COSMIC_COLORS.glow.pink },
};

// Ritual icon colors - Cosmic vibrant
const RITUAL_COLORS = {
  'heart-expansion': COSMIC_COLORS.ritualThemes.heart.primary,
  'gratitude-flow': COSMIC_COLORS.ritualThemes.gratitude.primary,
  'cleansing-breath': COSMIC_COLORS.ritualThemes.breath.primary,
  'water-manifest': COSMIC_COLORS.ritualThemes.water.primary,
  'letter-to-universe': COSMIC_COLORS.ritualThemes.letter.primary,
  'burn-release': COSMIC_COLORS.ritualThemes.burn.primary,
  'star-wish': COSMIC_COLORS.ritualThemes.star.gold,
  'crystal-healing': COSMIC_COLORS.ritualThemes.crystal.primary,
};

const DayDetailModal = ({
  visible,
  date,
  events = [],
  rituals = [],
  readings = [],
  paperTrades = [],
  tradingJournal = [],
  actions = [],
  // Calendar Smart Journal props
  journalEntries = [],
  tradingEntries = [],
  mood = null,
  onClose,
  onEventPress,
  onEventComplete,
  onAddEvent,
  onRitualPress,
  onReadingPress,
  onTradePress,
  onPaperTradePress, // Separate handler for paper trades (different table)
  onViewTradingJournal, // Navigate to TradingJournalScreen
  onActionPress,
  onJournalPress,
  onAddJournal,
  onAddTrade,
  onEditEvent,
  onDeleteEvent,
  onMoodUpdated,
  // New: Journal swipe actions
  onEditJournal,
  onDeleteJournal,
  onEditTradingEntry,
  onDeleteTradingEntry,
  // Ritual swipe actions
  onEditRitual,
  onDeleteRitual,
}) => {
  const { user, profile, userTier } = useAuth();
  const [savingMood, setSavingMood] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);

  // Swipeable refs for closing
  const swipeableRefs = useRef({});

  // Quick save mood - tap emoji to save instantly
  const handleQuickMoodSave = useCallback(async (moodId) => {
    if (!user?.id || savingMood) return;

    // Get role from profile (admin bypass)
    const userRole = profile?.role;
    const effectiveTier = userTier || profile?.tier || 'free';

    console.log('[DayDetailModal] Saving mood:', {
      moodId,
      date,
      userId: user.id,
      userTier: effectiveTier,
      userRole,
      profileRole: profile?.role,
    });

    setSavingMood(true);
    setSelectedMood(moodId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await saveMoodCheckIn(
        user.id,
        CHECK_IN_TYPES.MORNING,
        { mood: moodId },
        effectiveTier,
        userRole,
        date
      );

      console.log('[DayDetailModal] Save result:', result);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Keep selected mood showing - don't reset it
        onMoodUpdated?.();
      } else {
        console.error('[DayDetailModal] Save failed:', result.error);
        // Reset on failure
        setTimeout(() => setSelectedMood(null), 1500);
      }
    } catch (error) {
      console.error('[DayDetailModal] Quick mood save error:', error);
      // Reset on error
      setTimeout(() => setSelectedMood(null), 1500);
    } finally {
      setSavingMood(false);
    }
  }, [user, profile, userTier, date, savingMood, onMoodUpdated]);

  // Close all swipeables
  const closeAllSwipeables = useCallback((exceptKey) => {
    Object.entries(swipeableRefs.current).forEach(([key, ref]) => {
      if (key !== exceptKey && ref?.close) {
        ref.close();
      }
    });
  }, []);

  // Render left actions (Edit)
  const renderLeftActions = useCallback((progress, dragX, event) => {
    const trans = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [-80, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.swipeActionLeft, { transform: [{ translateX: trans }] }]}>
        <TouchableOpacity
          style={styles.editAction}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            swipeableRefs.current[event.id]?.close();
            onEditEvent?.(event);
          }}
        >
          <Icons.Pencil size={18} color="#FFFFFF" />
          <Text style={styles.actionText}>Sửa</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [onEditEvent]);

  // Render right actions (Delete)
  const renderRightActions = useCallback((progress, dragX, event) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.swipeActionRight, { transform: [{ translateX: trans }] }]}>
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            Alert.alert(
              'Xóa sự kiện',
              `Bạn có chắc muốn xóa "${event.title}"?`,
              [
                {
                  text: 'Hủy',
                  style: 'cancel',
                  onPress: () => swipeableRefs.current[event.id]?.close(),
                },
                {
                  text: 'Xóa',
                  style: 'destructive',
                  onPress: () => {
                    swipeableRefs.current[event.id]?.close();
                    onDeleteEvent?.(event);
                  },
                },
              ]
            );
          }}
        >
          <Icons.Trash2 size={18} color="#FFFFFF" />
          <Text style={styles.actionText}>Xóa</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [onDeleteEvent]);

  // Render journal swipe actions (Edit)
  const renderJournalLeftActions = useCallback((progress, dragX, entry, type) => {
    const trans = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [-80, 0],
      extrapolate: 'clamp',
    });

    const onEdit = type === 'trading' ? onEditTradingEntry : onEditJournal;
    const refKey = `${type}_${entry.id}`;

    return (
      <Animated.View style={[styles.swipeActionLeft, { transform: [{ translateX: trans }] }]}>
        <TouchableOpacity
          style={styles.editAction}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            swipeableRefs.current[refKey]?.close();
            onEdit?.(entry);
          }}
        >
          <Icons.Pencil size={18} color="#FFFFFF" />
          <Text style={styles.actionText}>Sửa</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [onEditJournal, onEditTradingEntry]);

  // Render journal swipe actions (Delete)
  const renderJournalRightActions = useCallback((progress, dragX, entry, type) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });

    const onDelete = type === 'trading' ? onDeleteTradingEntry : onDeleteJournal;
    const refKey = `${type}_${entry.id}`;
    const title = type === 'trading'
      ? `${entry.symbol} - ${entry.direction?.toUpperCase()}`
      : (entry.title || 'Nhật ký');

    return (
      <Animated.View style={[styles.swipeActionRight, { transform: [{ translateX: trans }] }]}>
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            Alert.alert(
              type === 'trading' ? 'Xóa giao dịch' : 'Xóa nhật ký',
              `Bạn có chắc muốn xóa "${title}"?`,
              [
                {
                  text: 'Hủy',
                  style: 'cancel',
                  onPress: () => swipeableRefs.current[refKey]?.close(),
                },
                {
                  text: 'Xóa',
                  style: 'destructive',
                  onPress: () => {
                    swipeableRefs.current[refKey]?.close();
                    onDelete?.(entry);
                  },
                },
              ]
            );
          }}
        >
          <Icons.Trash2 size={18} color="#FFFFFF" />
          <Text style={styles.actionText}>Xóa</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [onDeleteJournal, onDeleteTradingEntry]);

  // Render ritual swipe actions - Left (Edit reflection)
  const renderRitualLeftActions = useCallback((progress, dragX, ritual) => {
    const trans = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [-80, 0],
      extrapolate: 'clamp',
    });

    const refKey = `ritual_${ritual.id}`;

    return (
      <Animated.View style={[styles.swipeActionLeft, { transform: [{ translateX: trans }] }]}>
        <TouchableOpacity
          style={styles.editAction}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            swipeableRefs.current[refKey]?.close();
            onEditRitual?.(ritual);
          }}
        >
          <Icons.Pencil size={18} color="#FFFFFF" />
          <Text style={styles.actionText}>Sửa</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [onEditRitual]);

  // Render ritual swipe actions - Right (Delete)
  const renderRitualRightActions = useCallback((progress, dragX, ritual) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });

    const refKey = `ritual_${ritual.id}`;

    return (
      <Animated.View style={[styles.swipeActionRight, { transform: [{ translateX: trans }] }]}>
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            swipeableRefs.current[refKey]?.close();
            onDeleteRitual?.(ritual);
          }}
        >
          <Icons.Trash2 size={18} color="#FFFFFF" />
          <Text style={styles.actionText}>Xóa</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [onDeleteRitual]);

  // Format date display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const dayName = DAY_NAMES[d.getDay()];
    const day = d.getDate();
    const month = d.getMonth() + 1;
    return { dayName, day, month, full: `${day}/${month}` };
  };

  const dateInfo = formatDate(date);

  // Filter out divination/ritual/affirmation events since they're shown in dedicated sections
  // Be aggressive about filtering to prevent any duplicates
  const filteredEvents = events.filter(event => {
    // Check source_type - filter out ritual, affirmation, divination types
    const sourceType = (event.source_type || '').toLowerCase();
    const excludedTypes = ['divination', 'ritual', 'affirmation', 'habit', 'habit_daily'];
    if (excludedTypes.includes(sourceType)) {
      console.log('[DayDetailModal] Filtered out event by source_type:', sourceType, event.title);
      return false;
    }

    // Check title for ritual prefix (rituals have ✨ prefix)
    if (event.title?.startsWith('✨')) {
      console.log('[DayDetailModal] Filtered out ritual event by title:', event.title);
      return false;
    }

    // Check metadata for ritual_slug
    if (event.metadata?.ritual_slug) {
      console.log('[DayDetailModal] Filtered out event with ritual_slug:', event.title);
      return false;
    }

    // Check if icon is sparkles (ritual icon)
    if (event.icon === 'sparkles') {
      console.log('[DayDetailModal] Filtered out event with sparkles icon:', event.title);
      return false;
    }

    return true;
  });

  // Debug: log filtered results
  console.log('[DayDetailModal] Events received:', events.length, '-> After filter:', filteredEvents.length);
  if (events.length > 0 && filteredEvents.length !== events.length) {
    console.log('[DayDetailModal] Filtered out', events.length - filteredEvents.length, 'ritual events');
  }

  // Group filtered events by source type (exclude PAPER_TRADE - shown in Paper Trades section)
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const type = event.source_type || 'manual';
    // Skip PAPER_TRADE events - they're shown in the Paper Trades section below
    if (type === 'PAPER_TRADE' || type === 'paper_trade') return acc;
    if (type === 'AFFIRMATION' || type === 'affirmation') return acc;
    if (!acc[type]) acc[type] = [];
    acc[type].push(event);
    return acc;
  }, {});

  // Source type labels
  const sourceTypeLabels = {
    goal_deadline: 'Deadline Mục Tiêu',
    action_due: 'Hành Động',
    habit_daily: 'Thói Quen',
    manual: 'Sự Kiện',
  };

  const isToday = date === new Date().toISOString().split('T')[0];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Backdrop without BlurView for performance */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalContainer}>
            <LinearGradient
              colors={[COSMIC_COLORS.bgMystic, COSMIC_COLORS.bgCosmic, COSMIC_COLORS.bgDeepSpace]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />

            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Header - Compact */}
            <View style={styles.header}>
              <View style={styles.dateContainer}>
                <Text style={styles.dateNumber}>{dateInfo.day}</Text>
                <Text style={styles.dayName}>{dateInfo.dayName}</Text>
                {isToday && (
                  <View style={styles.todayBadge}>
                    <Text style={styles.todayText}>Hôm nay</Text>
                  </View>
                )}
              </View>

              <View style={styles.headerActions}>
                {onAddEvent && (
                  <TouchableOpacity
                    onPress={() => onAddEvent(date)}
                    style={styles.addButton}
                  >
                    <Icons.Plus size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Icons.X size={20} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Events list - Wrapped in GestureHandlerRootView for Swipeable to work in Modal */}
            <GestureHandlerRootView style={styles.gestureContainer}>
              <ScrollView
                style={styles.eventsList}
                contentContainerStyle={styles.eventsListContent}
                showsVerticalScrollIndicator={false}
              >
              {/* Events Section - Only show if there are filtered events */}
              {Object.keys(groupedEvents).length > 0 && (
                <>
                  {Object.entries(groupedEvents).map(([type, typeEvents]) => (
                    <View key={type} style={styles.eventGroup}>
                      <Text style={styles.groupTitle}>
                        {sourceTypeLabels[type] || type}
                      </Text>
                      {typeEvents.map((event) => (
                        <Swipeable
                          key={event.id}
                          ref={(ref) => {
                            if (ref) swipeableRefs.current[event.id] = ref;
                          }}
                          renderLeftActions={(progress, dragX) =>
                            onEditEvent ? renderLeftActions(progress, dragX, event) : null
                          }
                          renderRightActions={(progress, dragX) =>
                            onDeleteEvent ? renderRightActions(progress, dragX, event) : null
                          }
                          onSwipeableWillOpen={() => closeAllSwipeables(event.id)}
                          friction={2}
                          overshootLeft={false}
                          overshootRight={false}
                        >
                          <CalendarEventItem
                            event={event}
                            onPress={onEventPress}
                            onComplete={onEventComplete}
                          />
                        </Swipeable>
                      ))}
                    </View>
                  ))}

                  {/* Summary stats for filtered events */}
                  <View style={styles.summaryContainer}>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryValue}>
                        {filteredEvents.filter(e => e.is_completed).length}
                      </Text>
                      <Text style={styles.summaryLabel}>Hoàn thành</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryValue}>
                        {filteredEvents.filter(e => !e.is_completed).length}
                      </Text>
                      <Text style={styles.summaryLabel}>Còn lại</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryValue}>
                        {filteredEvents.length}
                      </Text>
                      <Text style={styles.summaryLabel}>Tổng</Text>
                    </View>
                  </View>
                </>
              )}

              {/* Quick Mood Picker - Simple inline emoji row */}
              <View style={styles.quickMoodSection}>
                <Text style={styles.quickMoodQuestion}>
                  {mood?.morning_mood || mood?.overall_mood
                    ? `Tâm trạng: ${QUICK_MOODS.find(m => m.id === (mood?.morning_mood || mood?.overall_mood))?.emoji || '😊'} ${QUICK_MOODS.find(m => m.id === (mood?.morning_mood || mood?.overall_mood))?.label || ''}`
                    : 'Hôm nay bạn cảm thấy thế nào?'}
                </Text>
                <View style={styles.quickMoodRow}>
                  {QUICK_MOODS.map((m) => {
                    const isSelected = selectedMood === m.id || mood?.morning_mood === m.id || mood?.overall_mood === m.id;
                    return (
                      <TouchableOpacity
                        key={m.id}
                        style={[
                          styles.quickMoodButton,
                          isSelected && styles.quickMoodButtonSelected,
                        ]}
                        onPress={() => handleQuickMoodSave(m.id)}
                        disabled={savingMood}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.quickMoodEmoji}>{m.emoji}</Text>
                        <Text style={[
                          styles.quickMoodLabel,
                          isSelected && styles.quickMoodLabelSelected,
                        ]}>{m.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Calendar Journal Entries Section */}
              {journalEntries.length > 0 && (
                <View style={styles.journalSection}>
                  <View style={styles.journalHeader}>
                    <Icons.BookOpen size={18} color={COSMIC_COLORS.glow.purple} />
                    <Text style={styles.journalTitle}>Nhật ký ({journalEntries.length})</Text>
                  </View>
                  {journalEntries.map((entry, index) => {
                    const time = entry.created_at
                      ? new Date(entry.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                      : '';
                    const entryColor = entry.mood
                      ? (entry.mood === 'happy' || entry.mood === 'excited' ? COSMIC_COLORS.glow.gold : COSMIC_COLORS.glow.purple)
                      : COSMIC_COLORS.glow.purple;
                    const refKey = `journal_${entry.id}`;
                    return (
                      <Swipeable
                        key={entry.id || index}
                        ref={(ref) => {
                          if (ref) swipeableRefs.current[refKey] = ref;
                        }}
                        renderLeftActions={(progress, dragX) =>
                          onEditJournal ? renderJournalLeftActions(progress, dragX, entry, 'journal') : null
                        }
                        renderRightActions={(progress, dragX) =>
                          onDeleteJournal ? renderJournalRightActions(progress, dragX, entry, 'journal') : null
                        }
                        onSwipeableWillOpen={() => closeAllSwipeables(refKey)}
                        friction={2}
                        overshootLeft={false}
                        overshootRight={false}
                      >
                        <TouchableOpacity
                          style={[styles.journalItem, { borderColor: `${entryColor}30` }]}
                          onPress={() => onJournalPress?.(entry)}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.journalIcon, { backgroundColor: `${entryColor}25` }]}>
                            <Icons.FileText size={16} color={entryColor} />
                          </View>
                          <View style={styles.journalContent}>
                            <Text style={styles.journalItemTitle}>
                              {entry.title || entry.entry_type || 'Nhật ký'}
                            </Text>
                            {entry.content && (
                              <Text style={styles.journalReflection} numberOfLines={2}>
                                {entry.content}
                              </Text>
                            )}
                            <View style={styles.journalMeta}>
                              <Text style={styles.journalTime}>{time}</Text>
                              {entry.mood && (
                                <View style={[styles.moodChip, { backgroundColor: `${entryColor}20` }]}>
                                  <Text style={[styles.moodChipText, { color: entryColor }]}>{entry.mood}</Text>
                                </View>
                              )}
                            </View>
                          </View>
                          {entry.is_pinned && <Icons.Pin size={14} color={COSMIC_COLORS.glow.gold} />}
                          {entry.is_favorite && <Icons.Star size={14} color={COSMIC_COLORS.glow.gold} fill={COSMIC_COLORS.glow.gold} />}
                          <Icons.ChevronRight size={16} color={COSMIC_COLORS.text.muted} />
                        </TouchableOpacity>
                      </Swipeable>
                    );
                  })}
                </View>
              )}

              {/* Trading Journal Entries from Calendar Smart Journal */}
              {tradingEntries.length > 0 && (
                <View style={styles.journalSection}>
                  <View style={styles.journalHeader}>
                    <Icons.TrendingUp size={18} color={COSMIC_COLORS.functional.success} />
                    <Text style={styles.journalTitle}>Giao dịch ({tradingEntries.length})</Text>
                  </View>
                  {tradingEntries.map((trade, index) => {
                    const isWin = trade.result === 'win';
                    const isLoss = trade.result === 'loss';
                    const tradeColor = isWin ? '#3AF7A6' : isLoss ? '#FF6B6B' : '#FFBD59';
                    const time = trade.entry_time
                      ? new Date(trade.entry_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                      : '';
                    const refKey = `trading_${trade.id}`;
                    return (
                      <Swipeable
                        key={trade.id || index}
                        ref={(ref) => {
                          if (ref) swipeableRefs.current[refKey] = ref;
                        }}
                        renderLeftActions={(progress, dragX) =>
                          onEditTradingEntry ? renderJournalLeftActions(progress, dragX, trade, 'trading') : null
                        }
                        renderRightActions={(progress, dragX) =>
                          onDeleteTradingEntry ? renderJournalRightActions(progress, dragX, trade, 'trading') : null
                        }
                        onSwipeableWillOpen={() => closeAllSwipeables(refKey)}
                        friction={2}
                        overshootLeft={false}
                        overshootRight={false}
                      >
                        <TouchableOpacity
                          style={[styles.journalItem, { borderColor: `${tradeColor}30` }]}
                          onPress={() => onTradePress?.(trade)}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.journalIcon, { backgroundColor: `${tradeColor}20` }]}>
                            {isWin ? (
                              <Icons.TrendingUp size={16} color={tradeColor} />
                            ) : isLoss ? (
                              <Icons.TrendingDown size={16} color={tradeColor} />
                            ) : (
                              <Icons.Activity size={16} color={tradeColor} />
                            )}
                          </View>
                          <View style={styles.journalContent}>
                            <Text style={styles.journalItemTitle}>
                              {trade.symbol} • {trade.direction?.toUpperCase()}
                            </Text>
                            <Text style={styles.journalReflection}>
                              {trade.pattern_type || 'Manual'} {trade.pattern_grade ? `(${trade.pattern_grade})` : ''}
                            </Text>
                            {trade.lessons_learned && (
                              <Text style={styles.journalReflection} numberOfLines={1}>
                                💡 {trade.lessons_learned}
                              </Text>
                            )}
                            <Text style={styles.journalTime}>{time}</Text>
                          </View>
                          <View style={styles.tradeResult}>
                            {trade.pnl_amount !== null && (
                              <Text style={[styles.tradePnLText, { color: tradeColor }]}>
                                {trade.pnl_amount > 0 ? '+' : ''}{trade.pnl_amount?.toFixed(2)} USDT
                              </Text>
                            )}
                            {trade.result && (
                              <View style={[styles.resultBadge, { backgroundColor: `${tradeColor}20` }]}>
                                <Text style={[styles.resultText, { color: tradeColor }]}>
                                  {trade.result.toUpperCase()}
                                </Text>
                              </View>
                            )}
                          </View>
                          <Icons.ChevronRight size={16} color={COSMIC_COLORS.text.muted} />
                        </TouchableOpacity>
                      </Swipeable>
                    );
                  })}
                </View>
              )}

              {/* Journal Section - Rituals */}
              {rituals.length > 0 && (
                <View style={styles.journalSection}>
                  <View style={styles.journalHeader}>
                    <Icons.Sparkles size={18} color={COSMIC_COLORS.glow.purple} />
                    <Text style={styles.journalTitle}>Nghi thức đã hoàn thành</Text>
                  </View>
                  {rituals.map((ritual, index) => {
                    const time = ritual.completed_at
                      ? new Date(ritual.completed_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                      : '';
                    const ritualColor = RITUAL_COLORS[ritual.ritual_slug] || COSMIC_COLORS.glow.purple;
                    const refKey = `ritual_${ritual.id}`;
                    return (
                      <Swipeable
                        key={ritual.id || index}
                        ref={(ref) => {
                          if (ref) swipeableRefs.current[refKey] = ref;
                        }}
                        renderLeftActions={
                          onEditRitual
                            ? (progress, dragX) => renderRitualLeftActions(progress, dragX, ritual)
                            : null
                        }
                        renderRightActions={
                          onDeleteRitual
                            ? (progress, dragX) => renderRitualRightActions(progress, dragX, ritual)
                            : null
                        }
                        onSwipeableWillOpen={() => closeAllSwipeables(refKey)}
                        friction={2}
                        overshootLeft={false}
                        overshootRight={false}
                      >
                        <TouchableOpacity
                          style={[styles.journalItem, { borderColor: `${ritualColor}30` }]}
                          onPress={() => onRitualPress?.(ritual)}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.journalIcon, { backgroundColor: `${ritualColor}25` }]}>
                            <Icons.Heart size={16} color={ritualColor} />
                          </View>
                          <View style={styles.journalContent}>
                            <Text style={styles.journalItemTitle}>
                              {RITUAL_NAMES[ritual.ritual_slug] || ritual.ritual_slug}
                            </Text>
                            {ritual.content?.reflection && (
                              <Text style={styles.journalReflection} numberOfLines={2}>
                                "{ritual.content.reflection}"
                              </Text>
                            )}
                            <Text style={styles.journalTime}>{time}</Text>
                          </View>
                          <View style={[styles.journalXP, { backgroundColor: `${COSMIC_COLORS.functional.success}20`, borderColor: `${COSMIC_COLORS.functional.success}40` }]}>
                            <Text style={styles.journalXPText}>+{ritual.xp_earned || 0} XP</Text>
                          </View>
                        </TouchableOpacity>
                      </Swipeable>
                    );
                  })}
                </View>
              )}

              {/* Journal Section - Readings */}
              {readings.length > 0 && (
                <View style={styles.journalSection}>
                  <View style={styles.journalHeader}>
                    <Icons.BookOpen size={18} color={COSMIC_COLORS.glow.cyan} />
                    <Text style={styles.journalTitle}>Kết quả Tarot/Kinh Dịch</Text>
                  </View>
                  {readings.map((reading, index) => {
                    const readingType = READING_TYPES[reading.reading_type] || { name: reading.reading_type, icon: 'Sparkles', color: COSMIC_COLORS.glow.purple };
                    const ReadingIcon = Icons[readingType.icon] || Icons.Sparkles;
                    const time = reading.created_at
                      ? new Date(reading.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                      : '';
                    return (
                      <TouchableOpacity
                        key={reading.id || index}
                        style={styles.journalItem}
                        onPress={() => onReadingPress?.(reading)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.journalIcon, { backgroundColor: `${readingType.color}20` }]}>
                          <ReadingIcon size={16} color={readingType.color} />
                        </View>
                        <View style={styles.journalContent}>
                          <Text style={styles.journalItemTitle}>{readingType.name}</Text>
                          {reading.question && (
                            <Text style={styles.journalReflection} numberOfLines={2}>
                              {reading.question}
                            </Text>
                          )}
                          <Text style={styles.journalTime}>{time}</Text>
                        </View>
                        <Icons.ChevronRight size={16} color={COSMIC_COLORS.text.muted} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Journal Section - Paper Trades */}
              {paperTrades.length > 0 && (
                <View style={styles.journalSection}>
                  <TouchableOpacity
                    style={styles.journalHeader}
                    onPress={onViewTradingJournal}
                    activeOpacity={0.7}
                  >
                    <Icons.LineChart size={18} color="#3AF7A6" />
                    <Text style={styles.journalTitle}>Paper Trades</Text>
                    <Icons.ChevronRight size={16} color={COSMIC_COLORS.text.muted} style={{ marginLeft: 'auto' }} />
                  </TouchableOpacity>
                  {paperTrades.map((trade, index) => {
                    const isProfit = trade.pnl_percent > 0;
                    const time = trade.created_at
                      ? new Date(trade.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                      : '';
                    return (
                      <TouchableOpacity
                        key={trade.id || index}
                        style={styles.journalItem}
                        onPress={() => onPaperTradePress?.(trade)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.journalIcon, { backgroundColor: isProfit ? 'rgba(58, 247, 166, 0.2)' : 'rgba(255, 107, 107, 0.2)' }]}>
                          {isProfit ? (
                            <Icons.TrendingUp size={16} color="#3AF7A6" />
                          ) : (
                            <Icons.TrendingDown size={16} color="#FF6B6B" />
                          )}
                        </View>
                        <View style={styles.journalContent}>
                          <Text style={styles.journalItemTitle}>
                            {trade.symbol} • {trade.direction?.toUpperCase()}
                          </Text>
                          <Text style={styles.journalReflection}>
                            {trade.pattern_type || 'Manual'} • {trade.timeframe || ''}
                          </Text>
                          <Text style={styles.journalTime}>{time}</Text>
                        </View>
                        <View style={styles.tradePnL}>
                          <Text style={[styles.tradePnLText, { color: isProfit ? '#3AF7A6' : '#FF6B6B' }]}>
                            {isProfit ? '+' : ''}{trade.pnl_percent?.toFixed(2)}%
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Journal Section - Trading Journal */}
              {tradingJournal.length > 0 && (
                <View style={styles.journalSection}>
                  <View style={styles.journalHeader}>
                    <Icons.FileText size={18} color="#FFBD59" />
                    <Text style={styles.journalTitle}>Nhật ký giao dịch</Text>
                  </View>
                  {tradingJournal.map((entry, index) => {
                    const isWin = entry.result === 'win';
                    const time = entry.created_at
                      ? new Date(entry.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                      : '';
                    return (
                      <TouchableOpacity
                        key={entry.id || index}
                        style={styles.journalItem}
                        onPress={() => onTradePress?.(entry)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.journalIcon, { backgroundColor: 'rgba(255, 189, 89, 0.2)' }]}>
                          <Icons.FileText size={16} color="#FFBD59" />
                        </View>
                        <View style={styles.journalContent}>
                          <Text style={styles.journalItemTitle}>
                            {entry.symbol} • {entry.direction?.toUpperCase()}
                          </Text>
                          {entry.lessons_learned && (
                            <Text style={styles.journalReflection} numberOfLines={2}>
                              "{entry.lessons_learned}"
                            </Text>
                          )}
                          <Text style={styles.journalTime}>{time}</Text>
                        </View>
                        <View style={[styles.resultBadge, { backgroundColor: isWin ? 'rgba(58, 247, 166, 0.2)' : 'rgba(255, 107, 107, 0.2)' }]}>
                          <Text style={[styles.resultText, { color: isWin ? '#3AF7A6' : '#FF6B6B' }]}>
                            {entry.result === 'win' ? 'WIN' : entry.result === 'loss' ? 'LOSS' : entry.result?.toUpperCase()}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Journal Section - Completed Actions */}
              {actions.length > 0 && (
                <View style={styles.journalSection}>
                  <View style={styles.journalHeader}>
                    <Icons.CheckCircle size={18} color="#6A5BFF" />
                    <Text style={styles.journalTitle}>Hành động hoàn thành</Text>
                  </View>
                  {actions.map((action, index) => {
                    const time = action.completed_at
                      ? new Date(action.completed_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                      : '';
                    return (
                      <TouchableOpacity
                        key={action.id || index}
                        style={styles.journalItem}
                        onPress={() => onActionPress?.(action)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.journalIcon, { backgroundColor: 'rgba(106, 91, 255, 0.2)' }]}>
                          <Icons.CheckCircle size={16} color="#6A5BFF" />
                        </View>
                        <View style={styles.journalContent}>
                          <Text style={styles.journalItemTitle}>{action.title}</Text>
                          {action.goal_title && (
                            <Text style={styles.journalReflection} numberOfLines={1}>
                              Mục tiêu: {action.goal_title}
                            </Text>
                          )}
                          <Text style={styles.journalTime}>{time}</Text>
                        </View>
                        <Icons.Check size={16} color="#3AF7A6" />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Empty state for journal when no events but has activities */}
              {events.length === 0 && (rituals.length > 0 || readings.length > 0 || paperTrades.length > 0 || tradingJournal.length > 0 || actions.length > 0) && (
                <View style={styles.journalSummary}>
                  <Text style={styles.journalSummaryText}>
                    {rituals.length > 0 && `${rituals.length} nghi thức`}
                    {rituals.length > 0 && readings.length > 0 && ' • '}
                    {readings.length > 0 && `${readings.length} kết quả`}
                    {(rituals.length > 0 || readings.length > 0) && paperTrades.length > 0 && ' • '}
                    {paperTrades.length > 0 && `${paperTrades.length} trades`}
                    {(rituals.length > 0 || readings.length > 0 || paperTrades.length > 0) && actions.length > 0 && ' • '}
                    {actions.length > 0 && `${actions.length} hành động`}
                  </Text>
                </View>
              )}
              </ScrollView>
            </GestureHandlerRootView>
          </View>
      </View>

    </Modal>
  );
};

// Quick add event button (floating)
export const AddEventFAB = ({ onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.fab, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Icons.Plus size={24} color={COLORS.bgDarkest} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  gestureContainer: {
    flex: 1,
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: SCREEN_HEIGHT * 0.1,
    height: SCREEN_HEIGHT * 0.85,
    paddingBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: COSMIC_COLORS.glass.borderGlow,
    ...COSMIC_SHADOWS.glowMedium,
    shadowColor: COSMIC_COLORS.glow.purple,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(168, 85, 247, 0.5)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: COSMIC_SPACING.sm,
    marginBottom: COSMIC_SPACING.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: COSMIC_SPACING.lg,
    paddingVertical: COSMIC_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COSMIC_COLORS.glass.borderGlow,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.md,
  },
  dayName: {
    color: COSMIC_COLORS.glow.cyan,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dateNumber: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
    textShadowColor: COSMIC_COLORS.glow.purple,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  todayBadge: {
    backgroundColor: COSMIC_COLORS.glow.gold,
    paddingHorizontal: COSMIC_SPACING.sm,
    paddingVertical: 2,
    borderRadius: COSMIC_SPACING.xs,
    shadowColor: COSMIC_COLORS.glow.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  todayText: {
    color: '#0D0D2B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.sm,
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COSMIC_COLORS.glow.purple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COSMIC_COLORS.glow.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventsList: {
    flex: 1,
  },
  eventsListContent: {
    padding: COSMIC_SPACING.xl,
    paddingBottom: 40,
  },
  eventGroup: {
    marginBottom: COSMIC_SPACING.xl,
  },
  groupTitle: {
    color: COSMIC_COLORS.glow.cyan,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: COSMIC_SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: COSMIC_SPACING.huge,
  },
  emptyText: {
    color: COSMIC_COLORS.text.muted,
    fontSize: 16,
    marginTop: COSMIC_SPACING.lg,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: COSMIC_SPACING.xl,
    paddingVertical: COSMIC_SPACING.md,
    paddingHorizontal: COSMIC_SPACING.xl,
    borderRadius: COSMIC_SPACING.lg,
    borderWidth: 1.5,
    borderColor: COSMIC_COLORS.glow.purple,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  emptyAddText: {
    color: COSMIC_COLORS.glow.purple,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: COSMIC_SPACING.sm,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COSMIC_COLORS.glass.bg,
    borderRadius: 16,
    padding: COSMIC_SPACING.xl,
    marginTop: COSMIC_SPACING.lg,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
  },
  summaryItem: {
    alignItems: 'center',
    paddingHorizontal: COSMIC_SPACING.xxl,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  summaryLabel: {
    color: COSMIC_COLORS.text.muted,
    fontSize: 12,
    marginTop: COSMIC_SPACING.xs,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: COSMIC_COLORS.glass.borderGlow,
  },

  // FAB styles
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COSMIC_COLORS.glow.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COSMIC_COLORS.glow.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },

  // Journal styles - Cosmic redesign
  journalSection: {
    marginTop: COSMIC_SPACING.xl,
    paddingTop: COSMIC_SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COSMIC_COLORS.glass.borderGlow,
  },
  journalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: COSMIC_SPACING.lg,
    gap: COSMIC_SPACING.sm,
  },
  journalTitle: {
    color: COSMIC_COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  journalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COSMIC_COLORS.glass.bg,
    borderRadius: 16,
    padding: COSMIC_SPACING.lg,
    marginBottom: COSMIC_SPACING.md,
    gap: COSMIC_SPACING.lg,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
  },
  journalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journalContent: {
    flex: 1,
  },
  journalItemTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  journalReflection: {
    color: COSMIC_COLORS.text.muted,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 18,
  },
  journalTime: {
    color: COSMIC_COLORS.text.hint,
    fontSize: 11,
    marginTop: 6,
  },
  journalXP: {
    backgroundColor: 'rgba(58, 247, 166, 0.2)',
    paddingHorizontal: COSMIC_SPACING.md,
    paddingVertical: COSMIC_SPACING.xs,
    borderRadius: COSMIC_SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(58, 247, 166, 0.3)',
  },
  journalXPText: {
    color: COSMIC_COLORS.functional.success,
    fontSize: 12,
    fontWeight: '700',
  },
  journalSummary: {
    alignItems: 'center',
    paddingVertical: COSMIC_SPACING.lg,
  },
  journalSummaryText: {
    color: COSMIC_COLORS.text.muted,
    fontSize: 14,
  },
  // Trading styles
  tradePnL: {
    paddingHorizontal: COSMIC_SPACING.md,
    paddingVertical: COSMIC_SPACING.xs,
    borderRadius: COSMIC_SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  tradePnLText: {
    fontSize: 14,
    fontWeight: '700',
  },
  resultBadge: {
    paddingHorizontal: COSMIC_SPACING.md,
    paddingVertical: COSMIC_SPACING.xs,
    borderRadius: COSMIC_SPACING.sm,
  },
  resultText: {
    fontSize: 11,
    fontWeight: '700',
  },
  // Quick Mood Picker styles - Simple inline emoji row
  quickMoodSection: {
    marginTop: COSMIC_SPACING.md,
    paddingVertical: COSMIC_SPACING.md,
    paddingHorizontal: COSMIC_SPACING.sm,
    backgroundColor: COSMIC_COLORS.glass.bg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
  },
  quickMoodQuestion: {
    color: COSMIC_COLORS.text.secondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: COSMIC_SPACING.sm,
  },
  quickMoodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  quickMoodButton: {
    width: 44,
    paddingVertical: 6,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  quickMoodButtonSelected: {
    backgroundColor: `${COSMIC_COLORS.glow.gold}25`,
    borderWidth: 1.5,
    borderColor: COSMIC_COLORS.glow.gold,
  },
  quickMoodEmoji: {
    fontSize: 22,
  },
  quickMoodLabel: {
    fontSize: 9,
    color: COSMIC_COLORS.text.muted,
    marginTop: 2,
    textAlign: 'center',
  },
  quickMoodLabelSelected: {
    color: COSMIC_COLORS.glow.gold,
    fontWeight: '600',
  },
  // Old mood section styles (keep for reference)
  moodSection: {
    marginTop: COSMIC_SPACING.xl,
    paddingTop: COSMIC_SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COSMIC_COLORS.glass.borderGlow,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COSMIC_COLORS.glass.bg,
    borderRadius: 16,
    padding: COSMIC_SPACING.lg,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
  },
  moodItem: {
    alignItems: 'center',
  },
  moodLabel: {
    color: COSMIC_COLORS.text.muted,
    fontSize: 12,
    marginBottom: COSMIC_SPACING.xs,
  },
  moodValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  moodBadge: {
    paddingHorizontal: COSMIC_SPACING.md,
    paddingVertical: COSMIC_SPACING.xs,
    borderRadius: COSMIC_SPACING.sm,
  },
  moodBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  moodNote: {
    color: COSMIC_COLORS.text.secondary,
    fontSize: 13,
    marginTop: COSMIC_SPACING.md,
    paddingHorizontal: COSMIC_SPACING.sm,
  },
  // Add mood button styles
  addMoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COSMIC_COLORS.glass.bg,
    borderRadius: 16,
    padding: COSMIC_SPACING.lg,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
    borderStyle: 'dashed',
    gap: COSMIC_SPACING.md,
  },
  addMoodIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COSMIC_COLORS.glow.gold}20`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${COSMIC_COLORS.glow.gold}40`,
  },
  addMoodContent: {
    flex: 1,
  },
  addMoodTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  addMoodSubtitle: {
    color: COSMIC_COLORS.text.muted,
    fontSize: 12,
    marginTop: 2,
  },
  moodEditButton: {
    marginLeft: 'auto',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${COSMIC_COLORS.glow.gold}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Journal meta styles
  journalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.sm,
    marginTop: 6,
  },
  moodChip: {
    paddingHorizontal: COSMIC_SPACING.sm,
    paddingVertical: 2,
    borderRadius: COSMIC_SPACING.xs,
  },
  moodChipText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  // Trade result styles
  tradeResult: {
    alignItems: 'flex-end',
    gap: COSMIC_SPACING.xs,
  },
  // Swipe action styles
  swipeActionLeft: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: COSMIC_SPACING.md,
  },
  swipeActionRight: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: COSMIC_SPACING.md,
  },
  editAction: {
    flex: 1,
    width: 70,
    backgroundColor: COSMIC_COLORS.glow.cyan,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  deleteAction: {
    flex: 1,
    width: 70,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default DayDetailModal;
