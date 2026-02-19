/**
 * Calendar Screen
 * Full calendar view with events, tasks, habits
 *
 * Created: December 9, 2025
 * Part of Vision Board 2.0 Redesign
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
  Alert,
  Platform,
  DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Icons from 'lucide-react-native';

import { COLORS, TYPOGRAPHY, SPACING, GLASS, GRADIENTS } from '../../utils/tokens';
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';
import { supabase } from '../../services/supabase';
import calendarService from '../../services/calendarService';
import calendarJournalService from '../../services/calendarJournalService';
import tradingJournalService from '../../services/tradingJournalService';
import { deleteRitualCompletion, updateRitualReflection } from '../../services/ritualService';
import { useCalendar } from '../../contexts/CalendarContext';
import { useAuth } from '../../contexts/AuthContext';
import { MonthCalendar, DayDetailModal, CalendarEventItem } from '../../components/Calendar';
import AddEventModal from '../../components/Calendar/AddEventModal';

// Centralized Templates
import { TemplateSelector } from '../../components/shared/templates';
import { TEMPLATES, getTemplate } from '../../services/templates/journalTemplates';
import { processTemplateSubmission } from '../../services/templates/journalRoutingService';

const CalendarScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, userTier, userRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

  // Calendar state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [eventsByDate, setEventsByDate] = useState({});
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);

  // Modal
  const [showDayModal, setShowDayModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [addEventDate, setAddEventDate] = useState(null);

  // Template selection state
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  // Journal data (rituals, readings, trades)
  const [journalRituals, setJournalRituals] = useState([]);
  const [journalReadings, setJournalReadings] = useState([]);
  const [journalPaperTrades, setJournalPaperTrades] = useState([]);
  const [journalTradingJournal, setJournalTradingJournal] = useState([]);
  // Calendar Smart Journal data
  const [journalEntries, setJournalEntries] = useState([]);
  const [tradingEntries, setTradingEntries] = useState([]);
  const [moodData, setMoodData] = useState(null);

  // Get user
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  // Load events for current month
  const loadEvents = useCallback(async () => {
    if (!userId) return;

    try {
      const data = await calendarService.getCalendarEvents(userId, currentMonth);
      console.log('[Calendar] Loaded events:', data?.length || 0);
      const eventsArray = data || [];
      setEvents(eventsArray);

      // Convert array to date-keyed object for MonthCalendar
      const grouped = {};
      eventsArray.forEach(e => {
        const date = (e.event_date || e.date || '')?.split('T')[0];
        if (date) {
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push(e);
        }
      });
      setEventsByDate(grouped);
    } catch (error) {
      console.error('[Calendar] Load events error:', error);
    }
  }, [userId, currentMonth]);

  // Load events for selected date
  useEffect(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const dayEvents = events.filter(e => {
      const eventDate = new Date(e.event_date || e.date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
    setSelectedDateEvents(dayEvents);
  }, [selectedDate, events]);

  // Initial load
  // Issue 2 Fix: Wrap in try/finally to guarantee setLoading(false)
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await loadEvents();
      } catch (err) {
        console.error('[CalendarScreen] Init error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) init();
  }, [userId, loadEvents]);

  // Listen for FORCE_REFRESH_EVENT from health monitor / recovery system
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[CalendarScreen] Force refresh event received - resetting all states');
      setLoading(false);
      setRefreshing(false);
      loadEvents();
    });
    return () => listener.remove();
  }, [loadEvents]);

  // Refresh
  // Issue 2 Fix: Wrap in try/finally to guarantee setRefreshing(false)
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadEvents();
    } catch (err) {
      console.error('[CalendarScreen] Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Refresh data when screen gains focus (e.g., after completing a ritual)
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        console.log('[Calendar] Screen focused - refreshing data');
        loadEvents();
      }
    }, [userId, loadEvents])
  );

  // Handle return from JournalEntry - open day detail modal with fresh data
  useFocusEffect(
    useCallback(() => {
      const { selectedDate: returnDate, refreshData } = route.params || {};
      if (returnDate && refreshData) {
        // Clear the params immediately to prevent re-triggering
        navigation.setParams({ selectedDate: undefined, refreshData: undefined });

        // Parse date if it's a string
        const dateObj = typeof returnDate === 'string' ? new Date(returnDate) : returnDate;
        setSelectedDate(dateObj);

        // Fetch data first, then open modal with content ready
        const loadAndOpenModal = async () => {
          try {
            if (userId) {
              const dateStr = dateObj.toISOString().split('T')[0];
              const dayData = await calendarService.getDayCalendarData(userId, dateStr);
              if (dayData.success) {
                setJournalRituals(dayData.rituals || []);
                setJournalReadings(dayData.readings || []);
                setJournalPaperTrades(dayData.paperTrades || []);
                setJournalTradingJournal(dayData.tradingJournal || []);
                setJournalEntries(dayData.journal || []);
                setTradingEntries(dayData.trading || []);
                setMoodData(dayData.mood);
              }
            }
          } catch (error) {
            console.error('[Calendar] Error loading return date data:', error);
          }
          setShowDayModal(true);
        };

        loadAndOpenModal();
      }
    }, [route.params?.selectedDate, route.params?.refreshData, navigation, userId])
  );

  // Navigate months
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  // Handle date selection - load data first so modal shows content immediately
  const handleDateSelect = async (date) => {
    setSelectedDate(date);

    if (userId) {
      const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];

      try {
        const dayData = await calendarService.getDayCalendarData(userId, dateStr);
        if (dayData.success) {
          setJournalRituals(dayData.rituals || []);
          setJournalReadings(dayData.readings || []);
          setJournalPaperTrades(dayData.paperTrades || []);
          setJournalTradingJournal(dayData.tradingJournal || []);
          setJournalEntries(dayData.journal || []);
          setTradingEntries(dayData.trading || []);
          setMoodData(dayData.mood);
        }
      } catch (error) {
        console.error('[Calendar] Error loading day data:', error);
      }
    }
    setShowDayModal(true);
  };

  // Handle event press
  const handleEventPress = (event) => {
    // Navigate based on event type
    switch (event.event_type) {
      case 'goal':
        navigation.navigate('GoalDetail', { goalId: event.source_id });
        break;
      case 'action':
      case 'task':
        navigation.navigate('TaskDetail', { taskId: event.source_id });
        break;
      case 'habit':
        navigation.navigate('HabitDetail', { habitId: event.source_id });
        break;
      default:
        setShowDayModal(true);
    }
  };

  // Handle event complete
  const handleEventComplete = async (event) => {
    try {
      const result = await calendarService.completeEvent(event.id, userId);
      if (result.success) {
        // Update local state immediately
        setEvents(prev => prev.map(e =>
          e.id === event.id ? { ...e, is_completed: true } : e
        ));
        // Also refresh from server
        await loadEvents();
      } else {
        console.error('[Calendar] Failed to complete event:', result.error);
      }
    } catch (error) {
      console.error('[Calendar] Complete event error:', error);
    }
  };

  // Handle add event from DayDetailModal - if templateId provided, go directly to JournalEntry
  const handleAddEvent = useCallback((date, templateId) => {
    const dateStr = typeof date === 'string' ? date : date?.toISOString().split('T')[0];
    setAddEventDate(dateStr);
    setShowDayModal(false); // Close day modal first

    if (templateId) {
      // DayDetailModal already selected a template - navigate directly
      navigation.navigate('JournalEntry', {
        mode: 'create',
        date: dateStr,
        templateId: templateId,
        sourceScreen: 'Calendar',
        returnDate: dateStr,
      });
    } else {
      // No template selected - show template selector
      setTimeout(() => {
        setShowTemplateSelector(true);
      }, 200);
    }
  }, [navigation]);

  // Handle template selection - TemplateSelector passes full template object
  const handleSelectTemplate = useCallback((template) => {
    const templateId = template?.id || template;
    console.log('[Calendar] Template selected:', templateId);
    setSelectedTemplateId(templateId);
    setShowTemplateSelector(false);
    const eventDate = addEventDate || selectedDate?.toISOString().split('T')[0];
    // Navigate to JournalEntry screen with template
    navigation.navigate('JournalEntry', {
      mode: 'create',
      date: eventDate,
      templateId: templateId,
      sourceScreen: 'Calendar',
      returnDate: eventDate,
    });
  }, [addEventDate, selectedDate, navigation]);

  // Handle skip template (create simple event)
  const handleSkipTemplate = useCallback(() => {
    setShowTemplateSelector(false);
    setShowAddEventModal(true); // Show basic event modal
  }, []);

  // Handle event created
  const handleEventCreated = useCallback(async (newEvent) => {
    console.log('[Calendar] Event created:', newEvent?.id);
    // Refresh events list
    await loadEvents();
    // Re-select the date to refresh the selected date events
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const dayData = await calendarService.getDayCalendarData(userId, dateStr);
      if (dayData.success) {
        setJournalRituals(dayData.rituals || []);
        setJournalReadings(dayData.readings || []);
        setJournalPaperTrades(dayData.paperTrades || []);
        setJournalTradingJournal(dayData.tradingJournal || []);
        setJournalEntries(dayData.journal || []);
        setTradingEntries(dayData.trading || []);
        setMoodData(dayData.mood);
      }
    }
  }, [loadEvents, selectedDate, userId]);

  // Handle edit event
  const handleEditEvent = useCallback((event) => {
    console.log('[Calendar] Edit event:', event.id);
    setShowDayModal(false);
    // Navigate to edit screen based on event type
    navigation.navigate('EditEvent', {
      eventId: event.id,
      date: selectedDate?.toISOString().split('T')[0],
    });
  }, [navigation, selectedDate]);

  // Handle delete event
  const handleDeleteEvent = useCallback(async (event) => {
    console.log('[Calendar] Delete event:', event.id);
    try {
      await calendarService.deleteEvent(event.id, userId);
      await loadEvents();
    } catch (error) {
      console.error('[Calendar] Delete event error:', error);
    }
  }, [loadEvents, userId]);

  // Format month name
  const monthName = currentMonth.toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LinearGradient colors={GRADIENTS.darkPurple} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={COLORS.purple} />
        <Text style={styles.loadingText}>Đang tải lịch...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={GRADIENTS.darkPurple} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icons.ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch</Text>
        <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
          <Text style={styles.todayButtonText}>Hôm nay</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.purple}
          />
        }
      >
        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <Icons.ChevronLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.monthName}>{monthName}</Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <Icons.ChevronRight size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <MonthCalendar
          initialDate={currentMonth}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          eventsByDate={eventsByDate}
          style={styles.calendar}
        />

        {/* Selected Date Events */}
        <View style={styles.eventsSection}>
          <View style={styles.eventsSectionHeader}>
            <Text style={styles.eventsSectionTitle}>
              {selectedDate.toLocaleDateString('vi-VN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
            <View style={styles.eventCount}>
              <Text style={styles.eventCountText}>
                {selectedDateEvents.length} sự kiện
              </Text>
            </View>
          </View>

          {selectedDateEvents.length === 0 ? (
            <View style={styles.emptyEvents}>
              <Icons.CalendarX size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Không có sự kiện nào</Text>
              <TouchableOpacity
                style={styles.addEventButton}
                onPress={() => navigation.navigate('AddTask', { date: selectedDate })}
              >
                <Icons.Plus size={16} color={COLORS.purple} />
                <Text style={styles.addEventText}>Thêm task mới</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.eventsList}>
              {selectedDateEvents.map((event) => (
                <CalendarEventItem
                  key={event.id}
                  event={event}
                  onPress={() => handleEventPress(event)}
                  onComplete={() => handleEventComplete(event)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.quickActionsTitle}>Thao tác nhanh</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={[styles.quickActionButton, { borderColor: COLORS.purple }]}
              onPress={() => navigation.navigate('JournalEntry', {
                mode: 'create',
                date: selectedDate.toISOString().split('T')[0],
                sourceScreen: 'Calendar',
                returnDate: selectedDate.toISOString().split('T')[0],
              })}
            >
              <Icons.BookOpen size={18} color={COLORS.purple} />
              <Text style={[styles.quickActionText, { color: COLORS.purple }]}>Viết nhật ký</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionButton, { borderColor: COLORS.success }]}
              onPress={() => navigation.navigate('TradingJournal', {
                mode: 'create',
                date: selectedDate.toISOString().split('T')[0],
                sourceScreen: 'Calendar',
                returnDate: selectedDate.toISOString().split('T')[0],
              })}
            >
              <Icons.TrendingUp size={18} color={COLORS.success} />
              <Text style={[styles.quickActionText, { color: COLORS.success }]}>Ghi trade</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Chú thích</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.purple }]} />
              <Text style={styles.legendText}>Mục tiêu</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.legendText}>Thói quen</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.cyan }]} />
              <Text style={styles.legendText}>Task</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.gold }]} />
              <Text style={styles.legendText}>Deadline</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Day Detail Modal */}
      <DayDetailModal
        visible={showDayModal}
        onClose={() => {
          setShowDayModal(false);
          setJournalRituals([]);
          setJournalReadings([]);
          setJournalPaperTrades([]);
          setJournalTradingJournal([]);
          setJournalEntries([]);
          setTradingEntries([]);
          setMoodData(null);
        }}
        date={selectedDate instanceof Date ? selectedDate.toISOString().split('T')[0] : selectedDate}
        events={selectedDateEvents}
        rituals={journalRituals}
        readings={journalReadings}
        paperTrades={journalPaperTrades}
        tradingJournal={journalTradingJournal}
        journalEntries={journalEntries}
        tradingEntries={tradingEntries}
        mood={moodData}
        onEventPress={handleEventPress}
        onEventComplete={handleEventComplete}
        onAddEvent={handleAddEvent}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
        onRitualPress={(ritual) => {
          console.log('[Calendar] Ritual pressed:', ritual.ritual_slug);
          setShowDayModal(false);
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
            // Navigate to general rituals screen
            navigation.navigate('FeaturedRituals');
          }
        }}
        onReadingPress={(reading) => {
          console.log('[Calendar] Reading pressed:', reading.reading_type);
          setShowDayModal(false);
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
          console.log('[Calendar] Trading journal entry pressed:', trade.id);
          setShowDayModal(false);
          // Navigate to trading journal detail (from trading_journal_entries table)
          navigation.navigate('TradingJournal', {
            mode: 'edit',
            entryId: trade.id,
            date: selectedDate.toISOString().split('T')[0],
            sourceScreen: 'Calendar',
            returnDate: selectedDate.toISOString().split('T')[0],
          });
        }}
        onPaperTradePress={(trade) => {
          console.log('[Calendar] Paper trade pressed:', trade.id, trade.symbol);
          setShowDayModal(false);
          // Navigate to paper trade history (from paper_trades table)
          navigation.navigate('PaperTradeHistory', {
            highlightTradeId: trade.id,
            symbol: trade.symbol,
          });
        }}
        onJournalPress={(entry) => {
          console.log('[Calendar] Journal entry pressed:', entry.id);
          setShowDayModal(false);
          // Navigate to journal entry edit screen
          navigation.navigate('JournalEntry', {
            mode: 'edit',
            entryId: entry.id,
            date: selectedDate.toISOString().split('T')[0],
            sourceScreen: 'Calendar',
            returnDate: selectedDate.toISOString().split('T')[0],
          });
        }}
        onAddJournal={() => {
          setShowDayModal(false);
          navigation.navigate('JournalEntry', {
            mode: 'create',
            date: selectedDate.toISOString().split('T')[0],
            sourceScreen: 'Calendar',
            returnDate: selectedDate.toISOString().split('T')[0],
          });
        }}
        onAddTrade={() => {
          setShowDayModal(false);
          navigation.navigate('TradingJournal', {
            mode: 'create',
            date: selectedDate.toISOString().split('T')[0],
            sourceScreen: 'Calendar',
            returnDate: selectedDate.toISOString().split('T')[0],
          });
        }}
        onEditJournal={(entry) => {
          console.log('[Calendar] Edit journal entry:', entry.id);
          setShowDayModal(false);
          navigation.navigate('JournalEntry', {
            mode: 'edit',
            entryId: entry.id,
            date: selectedDate.toISOString().split('T')[0],
            sourceScreen: 'Calendar',
            returnDate: selectedDate.toISOString().split('T')[0],
          });
        }}
        onDeleteJournal={async (entry) => {
          console.log('[Calendar] Delete journal entry:', entry.id);
          try {
            const result = await calendarJournalService.deleteJournalEntry(userId, entry.id);
            if (result.success) {
              // Refresh day data
              const dateStr = selectedDate.toISOString().split('T')[0];
              const dayData = await calendarService.getDayCalendarData(userId, dateStr);
              if (dayData.success) {
                setJournalData(dayData.journal || []);
              }
            }
          } catch (error) {
            console.error('[Calendar] Delete journal error:', error);
          }
        }}
        onEditTradingEntry={(trade) => {
          console.log('[Calendar] Edit trading entry:', trade.id);
          setShowDayModal(false);
          navigation.navigate('TradingJournal', {
            mode: 'edit',
            entryId: trade.id,
            date: selectedDate.toISOString().split('T')[0],
            sourceScreen: 'Calendar',
            returnDate: selectedDate.toISOString().split('T')[0],
          });
        }}
        onDeleteTradingEntry={async (trade) => {
          console.log('[Calendar] Delete trading entry:', trade.id);
          try {
            const result = await tradingJournalService.deleteTradingEntry(userId, trade.id);
            if (result.success) {
              // Refresh day data
              const dateStr = selectedDate.toISOString().split('T')[0];
              const dayData = await calendarService.getDayCalendarData(userId, dateStr);
              if (dayData.success) {
                setTradingData(dayData.trading || []);
              }
            }
          } catch (error) {
            console.error('[Calendar] Delete trading entry error:', error);
          }
        }}
        onEditRitual={async (ritual) => {
          console.log('[Calendar] Edit ritual reflection:', ritual.id, ritual.newReflection);
          const newReflection = ritual.newReflection;

          if (newReflection !== undefined) {
            try {
              const result = await updateRitualReflection(userId, ritual.id, newReflection);
              if (result.success) {
                setJournalRituals(prev => prev.map(r =>
                  r.id === ritual.id
                    ? { ...r, content: { ...r.content, reflection: newReflection } }
                    : r
                ));
              } else {
                console.error('[Calendar] Update ritual reflection failed:', result.error);
              }
            } catch (error) {
              console.error('[Calendar] Update ritual reflection error:', error);
            }
          }
        }}
        onDeleteRitual={async (ritual) => {
          console.log('[Calendar] Delete ritual completion:', ritual.id);
          try {
            const result = await deleteRitualCompletion(userId, ritual.id);
            if (result.success) {
              // Remove from local state
              setJournalRituals(prev => prev.filter(r => r.id !== ritual.id));
            } else {
              console.error('[Calendar] Delete ritual failed:', result.error);
            }
          } catch (error) {
            console.error('[Calendar] Delete ritual error:', error);
          }
        }}
        onMoodUpdated={async () => {
          console.log('[Calendar] Mood updated, refreshing data...');
          // Refresh full day data to get the latest mood
          const dateStr = selectedDate.toISOString().split('T')[0];
          const dayData = await calendarService.getDayCalendarData(userId, dateStr);
          if (dayData.success) {
            console.log('[Calendar] Mood data refreshed:', dayData.mood);
            setMoodData(dayData.mood);
          }
        }}
      />

      {/* Template Selector Modal */}
      <Modal
        visible={showTemplateSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTemplateSelector(false)}
      >
        <Pressable
          style={styles.templateModalOverlay}
          onPress={() => setShowTemplateSelector(false)}
        >
          <Pressable style={styles.templateModalContainer} onPress={e => e.stopPropagation()}>
            <View style={styles.templateModalHeader}>
              <Text style={styles.templateModalTitle}>Chọn loại nhật ký</Text>
              <TouchableOpacity onPress={() => setShowTemplateSelector(false)}>
                <Icons.X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.templateModalContent}>
              <TemplateSelector
                onSelect={handleSelectTemplate}
                userTier={userTier}
                userRole={userRole}
                layout="grid"
                showDescription={true}
              />
            </ScrollView>
            <TouchableOpacity
              style={styles.skipTemplateButton}
              onPress={handleSkipTemplate}
            >
              <Icons.Calendar size={18} color={COLORS.textSecondary} />
              <Text style={styles.skipTemplateText}>Tạo sự kiện đơn giản</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add Event Modal */}
      <AddEventModal
        visible={showAddEventModal}
        date={addEventDate}
        userId={userId}
        onClose={() => setShowAddEventModal(false)}
        onEventCreated={handleEventCreated}
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
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.md,
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
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  todayButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderRadius: SPACING.sm,
  },
  todayButtonText: {
    color: COLORS.purple,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },

  // Month Navigation
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  navButton: {
    padding: SPACING.sm,
  },
  monthName: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textTransform: 'capitalize',
  },

  // Calendar
  calendar: {
    marginBottom: SPACING.lg,
  },

  // Events Section
  eventsSection: {
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    marginBottom: SPACING.lg,
  },
  eventsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  eventsSectionTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textTransform: 'capitalize',
  },
  eventCount: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    paddingVertical: SPACING.xxs,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.xs,
  },
  eventCountText: {
    color: COLORS.purple,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  emptyEvents: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.md,
    marginTop: SPACING.md,
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.purple,
  },
  addEventText: {
    color: COLORS.purple,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginLeft: SPACING.xs,
  },
  eventsList: {
    gap: SPACING.sm,
  },

  // Quick Actions
  quickActionsSection: {
    marginBottom: SPACING.lg,
  },
  quickActionsTitle: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginBottom: SPACING.sm,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    gap: SPACING.xs,
  },
  quickActionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Legend
  legend: {
    backgroundColor: COLORS.glassBg,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  legendTitle: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginBottom: SPACING.sm,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  legendText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
  },

  bottomSpacing: {
    height: 100,
  },

  // Template Modal
  templateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  templateModalContainer: {
    backgroundColor: COLORS.bgDark,
    borderTopLeftRadius: SPACING.xl,
    borderTopRightRadius: SPACING.xl,
    maxHeight: '80%',
    paddingBottom: SPACING.xl,
  },
  templateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  templateModalTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  templateModalContent: {
    maxHeight: 400,
    paddingHorizontal: SPACING.md,
  },
  skipTemplateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: SPACING.md,
  },
  skipTemplateText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
});

export default CalendarScreen;
