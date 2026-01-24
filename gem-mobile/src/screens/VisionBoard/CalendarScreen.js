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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Icons from 'lucide-react-native';

import { COLORS, TYPOGRAPHY, SPACING, GLASS, GRADIENTS } from '../../utils/tokens';
import { supabase } from '../../services/supabase';
import calendarService from '../../services/calendarService';
import { MonthCalendar, DayDetailModal, CalendarEventItem } from '../../components/Calendar';

const CalendarScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

  // Calendar state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);

  // Modal
  const [showDayModal, setShowDayModal] = useState(false);

  // Journal data (rituals and readings)
  const [journalRituals, setJournalRituals] = useState([]);
  const [journalReadings, setJournalReadings] = useState([]);

  // Get user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  // Load events for current month
  const loadEvents = useCallback(async () => {
    if (!userId) return;

    try {
      const data = await calendarService.getCalendarEvents(userId, currentMonth);
      setEvents(data || []);
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
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadEvents();
      setLoading(false);
    };
    if (userId) init();
  }, [userId, loadEvents]);

  // Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

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

  // Handle date selection
  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    // Fetch journal data for the selected date
    if (userId) {
      const dateStr = date.toISOString().split('T')[0];
      const journalResult = await calendarService.getDailyJournal(userId, dateStr);
      if (journalResult.success) {
        setJournalRituals(journalResult.rituals);
        setJournalReadings(journalResult.readings);
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
      await calendarService.completeCalendarEvent(event.id);
      await loadEvents();
    } catch (error) {
      console.error('[Calendar] Complete event error:', error);
    }
  };

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
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          events={events}
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
        }}
        date={selectedDate instanceof Date ? selectedDate.toISOString().split('T')[0] : selectedDate}
        events={selectedDateEvents}
        rituals={journalRituals}
        readings={journalReadings}
        onEventPress={handleEventPress}
        onEventComplete={handleEventComplete}
        onRitualPress={(ritual) => {
          console.log('[Calendar] Ritual pressed:', ritual.ritual_slug);
        }}
        onReadingPress={(reading) => {
          console.log('[Calendar] Reading pressed:', reading.reading_type);
        }}
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
});

export default CalendarScreen;
