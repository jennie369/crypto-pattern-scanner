/**
 * Calendar Notification Service - Push notifications for Calendar Smart Journal
 * Handles mood reminders, journal reminders, streak alerts
 *
 * Created: January 28, 2026
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from './supabase';

const SERVICE_NAME = '[CalendarNotificationService]';

// ==================== CONSTANTS ====================

export const NOTIFICATION_TYPES = {
  MORNING_MOOD: 'morning_mood',
  EVENING_MOOD: 'evening_mood',
  JOURNAL_REMINDER: 'journal_reminder',
  STREAK_AT_RISK: 'streak_at_risk',
  MILESTONE: 'milestone',
  WEEKLY_SUMMARY: 'weekly_summary',
};

export const DEFAULT_TIMES = {
  MORNING_REMINDER: { hour: 7, minute: 0 },
  EVENING_REMINDER: { hour: 21, minute: 0 },
  JOURNAL_REMINDER: { hour: 20, minute: 0 },
};

// ==================== CONFIGURATION ====================

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ==================== FUNCTIONS ====================

/**
 * Initialize notifications and request permissions
 */
export const initializeNotifications = async () => {
  console.log(`${SERVICE_NAME} initializeNotifications`);

  try {
    // Must be physical device for push notifications
    if (!Device.isDevice) {
      console.log(`${SERVICE_NAME} Push notifications require physical device`);
      return { success: true, token: null };
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log(`${SERVICE_NAME} Notification permission denied`);
      return { success: false, error: 'Permission denied' };
    }

    // Get push token
    let token = null;
    if (Platform.OS !== 'web') {
      // Get projectId for FCM (required on Android)
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;

      const tokenResult = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      token = tokenResult.data;
    }

    // Configure Android channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('calendar', {
        name: 'Calendar Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFD700',
      });
    }

    console.log(`${SERVICE_NAME} Notifications initialized, token:`, token?.substring(0, 20));

    return { success: true, token };

  } catch (error) {
    // Handle Firebase not initialized error gracefully
    if (error.message?.includes('FirebaseApp is not initialized')) {
      console.log(`${SERVICE_NAME} Firebase not initialized - push notifications unavailable`);
      return { success: true, token: null };
    }
    console.error(`${SERVICE_NAME} initializeNotifications error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Save push token to database
 */
export const savePushToken = async (userId, token) => {
  console.log(`${SERVICE_NAME} savePushToken`, { userId });

  try {
    const { error } = await supabase
      .from('calendar_user_settings')
      .upsert({
        user_id: userId,
        push_token: token,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) throw error;

    return { success: true };

  } catch (error) {
    console.error(`${SERVICE_NAME} savePushToken error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user notification settings
 */
export const getNotificationSettings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('calendar_user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return {
      success: true,
      data: data || {
        morning_mood_reminder: true,
        morning_reminder_time: '07:00',
        evening_mood_reminder: true,
        evening_reminder_time: '21:00',
        journal_reminder: false,
        journal_reminder_time: '20:00',
      },
    };

  } catch (error) {
    console.error(`${SERVICE_NAME} getNotificationSettings error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Update notification settings
 */
export const updateNotificationSettings = async (userId, settings) => {
  console.log(`${SERVICE_NAME} updateNotificationSettings`, { userId, settings });

  try {
    const { data, error } = await supabase
      .from('calendar_user_settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) throw error;

    // Reschedule notifications based on new settings
    await rescheduleAllNotifications(userId, data);

    return { success: true, data };

  } catch (error) {
    console.error(`${SERVICE_NAME} updateNotificationSettings error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Schedule morning mood reminder
 */
export const scheduleMorningMoodReminder = async (userId, time = DEFAULT_TIMES.MORNING_REMINDER) => {
  console.log(`${SERVICE_NAME} scheduleMorningMoodReminder`, { userId, time });

  try {
    // Cancel existing morning reminder
    await cancelNotificationByType(NOTIFICATION_TYPES.MORNING_MOOD);

    // Schedule new one
    const trigger = {
      hour: time.hour,
      minute: time.minute,
      repeats: true,
    };

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Chào buổi sáng!',
        body: 'Bạn cảm thấy thế nào sau khi ngủ dậy?',
        data: {
          type: NOTIFICATION_TYPES.MORNING_MOOD,
          userId,
          action: 'open_mood_checkin',
        },
        sound: 'default',
        channelId: 'calendar',
      },
      trigger,
    });

    console.log(`${SERVICE_NAME} Scheduled morning reminder:`, id);

    return { success: true, notificationId: id };

  } catch (error) {
    console.error(`${SERVICE_NAME} scheduleMorningMoodReminder error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Schedule evening mood reminder
 */
export const scheduleEveningMoodReminder = async (userId, time = DEFAULT_TIMES.EVENING_REMINDER) => {
  console.log(`${SERVICE_NAME} scheduleEveningMoodReminder`, { userId, time });

  try {
    await cancelNotificationByType(NOTIFICATION_TYPES.EVENING_MOOD);

    const trigger = {
      hour: time.hour,
      minute: time.minute,
      repeats: true,
    };

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Kết thúc ngày!',
        body: 'Dành vài phút để nhìn lại ngày hôm nay',
        data: {
          type: NOTIFICATION_TYPES.EVENING_MOOD,
          userId,
          action: 'open_mood_checkin',
        },
        sound: 'default',
        channelId: 'calendar',
      },
      trigger,
    });

    console.log(`${SERVICE_NAME} Scheduled evening reminder:`, id);

    return { success: true, notificationId: id };

  } catch (error) {
    console.error(`${SERVICE_NAME} scheduleEveningMoodReminder error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Schedule journal reminder
 */
export const scheduleJournalReminder = async (userId, time = DEFAULT_TIMES.JOURNAL_REMINDER) => {
  console.log(`${SERVICE_NAME} scheduleJournalReminder`, { userId, time });

  try {
    await cancelNotificationByType(NOTIFICATION_TYPES.JOURNAL_REMINDER);

    const trigger = {
      hour: time.hour,
      minute: time.minute,
      repeats: true,
    };

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Viet nhat ky',
        body: 'Ghi lai nhung suy nghi va trai nghiem trong ngay',
        data: {
          type: NOTIFICATION_TYPES.JOURNAL_REMINDER,
          userId,
          action: 'open_journal',
        },
        sound: 'default',
        channelId: 'calendar',
      },
      trigger,
    });

    console.log(`${SERVICE_NAME} Scheduled journal reminder:`, id);

    return { success: true, notificationId: id };

  } catch (error) {
    console.error(`${SERVICE_NAME} scheduleJournalReminder error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Send streak at risk notification
 */
export const sendStreakAtRiskNotification = async (userId, streakType, currentStreak) => {
  console.log(`${SERVICE_NAME} sendStreakAtRiskNotification`, { userId, streakType, currentStreak });

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Streak ${currentStreak} ngay sap mat!`,
        body: `Hoan thanh ${streakType} hom nay de giu streak`,
        data: {
          type: NOTIFICATION_TYPES.STREAK_AT_RISK,
          userId,
          streakType,
          currentStreak,
          action: 'open_calendar',
        },
        sound: 'default',
        channelId: 'calendar',
      },
      trigger: null, // Immediate
    });

    return { success: true, notificationId: id };

  } catch (error) {
    console.error(`${SERVICE_NAME} sendStreakAtRiskNotification error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Send milestone notification
 */
export const sendMilestoneNotification = async (userId, milestoneTitle, xpEarned) => {
  console.log(`${SERVICE_NAME} sendMilestoneNotification`, { userId, milestoneTitle, xpEarned });

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Milestone dat duoc!',
        body: `${milestoneTitle}${xpEarned ? ` +${xpEarned} XP` : ''}`,
        data: {
          type: NOTIFICATION_TYPES.MILESTONE,
          userId,
          milestoneTitle,
          xpEarned,
          action: 'open_calendar',
        },
        sound: 'default',
        channelId: 'calendar',
      },
      trigger: null, // Immediate
    });

    return { success: true, notificationId: id };

  } catch (error) {
    console.error(`${SERVICE_NAME} sendMilestoneNotification error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Cancel notification by type
 */
export const cancelNotificationByType = async (notificationType) => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduledNotifications) {
      if (notification.content.data?.type === notificationType) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    return { success: true };

  } catch (error) {
    console.error(`${SERVICE_NAME} cancelNotificationByType error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Cancel all calendar notifications
 */
export const cancelAllCalendarNotifications = async () => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduledNotifications) {
      const type = notification.content.data?.type;
      if (type && Object.values(NOTIFICATION_TYPES).includes(type)) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    return { success: true };

  } catch (error) {
    console.error(`${SERVICE_NAME} cancelAllCalendarNotifications error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Reschedule all notifications based on settings
 */
export const rescheduleAllNotifications = async (userId, settings) => {
  console.log(`${SERVICE_NAME} rescheduleAllNotifications`, { userId });

  try {
    // Cancel all first
    await cancelAllCalendarNotifications();

    // Parse time string to hour/minute
    const parseTime = (timeStr) => {
      if (!timeStr) return null;
      const [hour, minute] = timeStr.split(':').map(Number);
      return { hour, minute };
    };

    // Schedule based on settings
    if (settings.morning_mood_reminder) {
      const time = parseTime(settings.morning_reminder_time) || DEFAULT_TIMES.MORNING_REMINDER;
      await scheduleMorningMoodReminder(userId, time);
    }

    if (settings.evening_mood_reminder) {
      const time = parseTime(settings.evening_reminder_time) || DEFAULT_TIMES.EVENING_REMINDER;
      await scheduleEveningMoodReminder(userId, time);
    }

    if (settings.journal_reminder) {
      const time = parseTime(settings.journal_reminder_time) || DEFAULT_TIMES.JOURNAL_REMINDER;
      await scheduleJournalReminder(userId, time);
    }

    return { success: true };

  } catch (error) {
    console.error(`${SERVICE_NAME} rescheduleAllNotifications error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Handle notification response (when user taps notification)
 */
export const handleNotificationResponse = (response, navigation) => {
  console.log(`${SERVICE_NAME} handleNotificationResponse`, response);

  const data = response.notification.request.content.data;

  if (!data) return;

  switch (data.action) {
    case 'open_mood_checkin':
      navigation?.navigate('Calendar', {
        showMoodPicker: true,
        checkInType: data.type === NOTIFICATION_TYPES.MORNING_MOOD ? 'morning' : 'evening',
      });
      break;

    case 'open_journal':
      navigation?.navigate('JournalEntry', {
        mode: 'create',
      });
      break;

    case 'open_calendar':
      navigation?.navigate('Calendar');
      break;

    default:
      navigation?.navigate('VisionBoard');
  }
};

/**
 * Add notification response listener
 */
export const addNotificationResponseListener = (navigation) => {
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    handleNotificationResponse(response, navigation);
  });

  return subscription;
};

/**
 * Get scheduled notifications for debugging
 */
export const getScheduledNotifications = async () => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return { success: true, data: notifications };
  } catch (error) {
    console.error(`${SERVICE_NAME} getScheduledNotifications error:`, error);
    return { success: false, error: error.message, data: [] };
  }
};

export default {
  // Constants
  NOTIFICATION_TYPES,
  DEFAULT_TIMES,

  // Init
  initializeNotifications,
  savePushToken,

  // Settings
  getNotificationSettings,
  updateNotificationSettings,

  // Scheduling
  scheduleMorningMoodReminder,
  scheduleEveningMoodReminder,
  scheduleJournalReminder,
  rescheduleAllNotifications,

  // Sending
  sendStreakAtRiskNotification,
  sendMilestoneNotification,

  // Canceling
  cancelNotificationByType,
  cancelAllCalendarNotifications,

  // Handling
  handleNotificationResponse,
  addNotificationResponseListener,

  // Debug
  getScheduledNotifications,
};
