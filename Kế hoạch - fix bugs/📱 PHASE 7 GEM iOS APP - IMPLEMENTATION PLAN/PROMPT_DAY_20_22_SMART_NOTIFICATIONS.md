# 🔔 DAY 20-22: SMART NOTIFICATIONS IMPLEMENTATION

**Timeline:** 10 giờ (3 ngày x 3-4 giờ/ngày)  
**Priority:** HIGH  
**Dependencies:** Dashboard in Account Tab complete  
**Feature:** Personalized push notifications based on user's widgets trong Account tab

---

## 🎯 OBJECTIVES

Implement smart notifications:
- 4 notification types: Morning Affirmations, Midday Check-in, Evening Visualization, Milestone Celebrations
- **Deep link to Account tab** → scroll to Dashboard section → highlight widget
- Personalized based on user's widgets
- User settings & controls
- Smart scheduling (timezone-aware, max 3/day)
- Action buttons trong notifications

---

## 📦 DELIVERABLES

### **Services:**
1. `src/services/notificationScheduler.js` - Schedule notifications
2. `src/services/notificationPersonalizer.js` - Personalize content
3. `src/services/deepLinkHandler.js` - Handle notification deep links

### **Components:**
1. `src/screens/Account/NotificationSettingsScreen.js` - Update with widget notifications
2. `src/components/Notifications/NotificationPermissionPrompt.js` - Request permissions

### **Updates:**
1. `src/screens/tabs/AccountScreen.js` - Handle deep links from notifications
2. `src/navigation/linking.js` - Configure deep link paths

---

## 🏗️ IMPLEMENTATION PLAN

### **STEP 1: Notification Scheduler (3h)**

#### **File: `src/services/notificationScheduler.js`**

```javascript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import widgetManagementService from './widgetManagementService';
import notificationPersonalizer from './notificationPersonalizer';
import { supabase } from '../config/supabase';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationScheduler {
  /**
   * Initialize notifications
   */
  async initialize(userId) {
    try {
      // Request permissions
      const hasPermission = await this.requestPermissions();
      
      if (!hasPermission) {
        console.warn('Notification permissions denied');
        return false;
      }
      
      // Get push token
      const token = await this.registerForPushNotifications();
      
      if (token) {
        // Save token to database
        await this.saveToken(userId, token);
      }
      
      // Schedule notifications for user's widgets
      await this.scheduleAllNotifications(userId);
      
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions() {
    if (!Device.isDevice) {
      console.warn('Notifications only work on physical devices');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  /**
   * Register for push notifications
   */
  async registerForPushNotifications() {
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FFBD59',
        });
      }
      
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Save push token to database
   */
  async saveToken(userId, token) {
    try {
      await supabase
        .from('user_push_tokens')
        .upsert({
          user_id: userId,
          token: token,
          platform: Platform.OS,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  /**
   * Schedule all notifications for user
   */
  async scheduleAllNotifications(userId) {
    try {
      // Cancel existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      // Get user's widgets
      const widgets = await widgetManagementService.getUserWidgets(userId);
      
      if (widgets.length === 0) {
        console.log('No widgets, no notifications to schedule');
        return;
      }
      
      // Get user notification settings
      const settings = await this.getNotificationSettings(userId);
      
      if (!settings.enabled) {
        console.log('Notifications disabled by user');
        return;
      }
      
      // Schedule for each widget
      for (const widget of widgets) {
        await this.scheduleWidgetNotifications(userId, widget, settings);
      }
      
      console.log('All notifications scheduled');
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }

  /**
   * Schedule notifications for a specific widget
   */
  async scheduleWidgetNotifications(userId, widget, settings) {
    try {
      switch (widget.type) {
        case 'GOAL_CARD':
          await this.scheduleGoalNotifications(userId, widget, settings);
          break;
        case 'AFFIRMATION_CARD':
          await this.scheduleAffirmationNotifications(userId, widget, settings);
          break;
        case 'ACTION_CHECKLIST':
          await this.scheduleChecklistNotifications(userId, widget, settings);
          break;
      }
    } catch (error) {
      console.error(`Error scheduling notifications for widget ${widget.id}:`, error);
    }
  }

  /**
   * Schedule goal-related notifications
   */
  async scheduleGoalNotifications(userId, widget, settings) {
    // Morning affirmation (if widget has affirmations)
    if (widget.data.affirmations?.length > 0 && settings.categories.morning_affirmations) {
      const morningTime = this.parseTime(settings.custom_times.morning || '08:00');
      
      await this.scheduleNotification({
        id: `morning-${widget.id}`,
        title: '🌅 Good morning!',
        body: await notificationPersonalizer.getMorningAffirmation(widget),
        data: {
          type: 'MORNING_AFFIRMATION',
          widgetId: widget.id,
          widgetType: widget.type,
          deepLink: {
            screen: 'Account',
            params: {
              scrollToWidget: widget.id,
              expandDashboard: true,
            },
          },
        },
        trigger: {
          hour: morningTime.hour,
          minute: morningTime.minute,
          repeats: true,
        },
        sound: 'gem_chime.mp3',
      });
    }
    
    // Evening visualization
    if (settings.categories.evening_visualization) {
      const eveningTime = this.parseTime(settings.custom_times.evening || '21:00');
      
      await this.scheduleNotification({
        id: `evening-${widget.id}`,
        title: '🌙 Evening Visualization',
        body: await notificationPersonalizer.getEveningVisualization(widget),
        data: {
          type: 'EVENING_VISUALIZATION',
          widgetId: widget.id,
          widgetType: widget.type,
          deepLink: {
            screen: 'Account',
            params: {
              scrollToWidget: widget.id,
              expandDashboard: true,
            },
          },
        },
        trigger: {
          hour: eveningTime.hour,
          minute: eveningTime.minute,
          repeats: true,
        },
        sound: 'peaceful_bell.mp3',
      });
    }
  }

  /**
   * Schedule affirmation notifications
   */
  async scheduleAffirmationNotifications(userId, widget, settings) {
    if (!settings.categories.morning_affirmations) return;
    
    const morningTime = this.parseTime(settings.custom_times.morning || '08:00');
    const affirmation = widget.data.affirmations[0]; // First affirmation
    
    await this.scheduleNotification({
      id: `affirmation-${widget.id}`,
      title: '✨ Daily Affirmation',
      body: `"${affirmation.substring(0, 100)}..."`,
      data: {
        type: 'DAILY_AFFIRMATION',
        widgetId: widget.id,
        widgetType: widget.type,
        deepLink: {
          screen: 'Account',
          params: {
            scrollToWidget: widget.id,
            expandDashboard: true,
          },
        },
      },
      trigger: {
        hour: morningTime.hour,
        minute: morningTime.minute,
        repeats: true,
      },
    });
  }

  /**
   * Schedule checklist reminder
   */
  async scheduleChecklistNotifications(userId, widget, settings) {
    if (!settings.categories.midday_checkin) return;
    
    const middayTime = this.parseTime(settings.custom_times.midday || '12:00');
    
    // Find first incomplete task
    const nextTask = widget.data.tasks.find(t => !t.completed);
    
    if (!nextTask) return; // All tasks completed
    
    await this.scheduleNotification({
      id: `checklist-${widget.id}`,
      title: '☕ Midday Check-in',
      body: `Did you complete: ${nextTask.title}?`,
      data: {
        type: 'MIDDAY_CHECKIN',
        widgetId: widget.id,
        widgetType: widget.type,
        taskId: nextTask.id,
        deepLink: {
          screen: 'Account',
          params: {
            scrollToWidget: widget.id,
            expandDashboard: true,
            action: 'COMPLETE_TASK',
            taskId: nextTask.id,
          },
        },
      },
      trigger: {
        hour: middayTime.hour,
        minute: middayTime.minute,
        repeats: true,
      },
      categoryIdentifier: 'task-action',
      actions: [
        {
          identifier: 'complete',
          buttonTitle: '✅ Yes, I did!',
          options: { foreground: true },
        },
        {
          identifier: 'snooze',
          buttonTitle: 'Not yet',
          options: { foreground: false },
        },
      ],
    });
  }

  /**
   * Send milestone celebration notification
   */
  async sendMilestoneNotification(userId, widget, milestone) {
    const { percentage, currentAmount, targetAmount } = milestone;
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Milestone Achieved!',
        body: `You've completed ${percentage}% of your goal!\n\n${currentAmount} out of ${targetAmount} ✨`,
        data: {
          type: 'MILESTONE_CELEBRATION',
          widgetId: widget.id,
          milestone: percentage,
          deepLink: {
            screen: 'Account',
            params: {
              scrollToWidget: widget.id,
              expandDashboard: true,
              showConfetti: true,
            },
          },
        },
        sound: 'celebration.mp3',
        priority: 'high',
      },
      trigger: null, // Send immediately
    });
  }

  /**
   * Schedule a notification
   */
  async scheduleNotification(config) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: config.title,
          body: config.body,
          data: config.data,
          sound: config.sound || 'default',
          priority: config.priority || 'default',
        },
        trigger: config.trigger,
      });
      
      // Save to database
      await this.saveScheduledNotification(config);
      
      console.log(`Notification scheduled: ${config.id}`);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  /**
   * Save scheduled notification to database
   */
  async saveScheduledNotification(config) {
    try {
      await supabase
        .from('scheduled_notifications')
        .upsert({
          id: config.id,
          user_id: config.data.userId,
          widget_id: config.data.widgetId,
          notification_type: config.data.type,
          scheduled_time: `${config.trigger.hour}:${config.trigger.minute}`,
          content: {
            title: config.title,
            body: config.body,
          },
          deep_link: config.data.deepLink,
          is_active: true,
        }, {
          onConflict: 'id'
        });
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(userId) {
    try {
      const { data } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      return data || this.getDefaultSettings();
    } catch (error) {
      return this.getDefaultSettings();
    }
  }

  /**
   * Get default notification settings
   */
  getDefaultSettings() {
    return {
      enabled: true,
      categories: {
        morning_affirmations: true,
        midday_checkin: true,
        evening_visualization: true,
        milestone_celebrations: true,
      },
      frequency: {
        max_per_day: 3,
      },
      do_not_disturb: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
      custom_times: {
        morning: '08:00',
        midday: '12:00',
        evening: '21:00',
      },
    };
  }

  /**
   * Parse time string (HH:MM)
   */
  parseTime(timeString) {
    const [hour, minute] = timeString.split(':').map(Number);
    return { hour, minute };
  }
}

export default new NotificationScheduler();
```

---

### **STEP 2: Deep Link Handler (2h)**

#### **File: `src/services/deepLinkHandler.js`**

```javascript
import * as Notifications from 'expo-notifications';
import { supabase } from '../config/supabase';

class DeepLinkHandler {
  constructor() {
    this.setupListeners();
  }

  /**
   * Setup notification response listeners
   */
  setupListeners() {
    // When notification is tapped
    Notifications.addNotificationResponseReceivedListener(response => {
      this.handleNotificationResponse(response);
    });
    
    // When notification action button is pressed
    Notifications.addNotificationResponseReceivedListener(response => {
      if (response.actionIdentifier === 'complete') {
        this.handleTaskComplete(response);
      } else if (response.actionIdentifier === 'snooze') {
        this.handleSnooze(response);
      }
    });
  }

  /**
   * Handle notification tap
   */
  async handleNotificationResponse(response) {
    const { data } = response.notification.request.content;
    
    // Track notification engagement
    await this.trackEngagement(response, 'OPENED');
    
    // Get deep link params
    const { deepLink } = data;
    
    if (!deepLink) return;
    
    // Navigate using deep link
    this.navigate(deepLink);
  }

  /**
   * Handle task complete action
   */
  async handleTaskComplete(response) {
    const { widgetId, taskId } = response.notification.request.content.data;
    
    try {
      // Get widget
      const widget = await widgetManagementService.getWidget(widgetId);
      
      // Update task
      const updatedTasks = widget.data.tasks.map(task =>
        task.id === taskId ? { ...task, completed: true } : task
      );
      
      await widgetManagementService.updateWidget(widgetId, {
        data: {
          ...widget.data,
          tasks: updatedTasks,
        },
      });
      
      // Track engagement
      await this.trackEngagement(response, 'ACTION_COMPLETED');
      
      // Show success notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✅ Great job!',
          body: 'Task marked as complete',
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error completing task:', error);
    }
  }

  /**
   * Handle snooze action
   */
  async handleSnooze(response) {
    await this.trackEngagement(response, 'SNOOZED');
    
    // Reschedule notification in 2 hours
    const notification = response.notification.request.content;
    
    await Notifications.scheduleNotificationAsync({
      content: notification,
      trigger: {
        seconds: 2 * 60 * 60, // 2 hours
      },
    });
  }

  /**
   * Navigate to deep link
   */
  navigate(deepLink) {
    // This will be handled by React Navigation
    // Store deep link in AsyncStorage to be picked up by navigation
    import('@react-native-async-storage/async-storage').then(AsyncStorage => {
      AsyncStorage.default.setItem('pendingDeepLink', JSON.stringify(deepLink));
    });
  }

  /**
   * Track notification engagement
   */
  async trackEngagement(response, action) {
    try {
      const { data } = response.notification.request.content;
      
      await supabase
        .from('notification_history')
        .insert({
          notification_id: response.notification.request.identifier,
          user_id: data.userId,
          action_taken: action,
          action_data: {
            widgetId: data.widgetId,
            notificationType: data.type,
          },
          created_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error tracking engagement:', error);
    }
  }
}

export default new DeepLinkHandler();
```

---

### **STEP 3: Update AccountScreen for Deep Links (1h)**

#### **Update: `src/screens/tabs/AccountScreen.js`**

Add deep link handling:

```javascript
// Add import
import AsyncStorage from '@react-native-async-storage/async-storage';

// Inside AccountScreen component:

// Check for pending deep link on mount
useEffect(() => {
  checkPendingDeepLink();
}, []);

const checkPendingDeepLink = async () => {
  try {
    const pendingDeepLink = await AsyncStorage.getItem('pendingDeepLink');
    
    if (pendingDeepLink) {
      const deepLink = JSON.parse(pendingDeepLink);
      
      // Clear pending deep link
      await AsyncStorage.removeItem('pendingDeepLink');
      
      // Handle deep link
      if (deepLink.params?.scrollToWidget) {
        handleDeepLinkToWidget(
          deepLink.params.scrollToWidget,
          deepLink.params
        );
      }
    }
  } catch (error) {
    console.error('Error checking pending deep link:', error);
  }
};

// Update handleDeepLinkToWidget to accept additional params
const handleDeepLinkToWidget = async (widgetId, params = {}) => {
  // Expand dashboard section
  setIsWidgetSectionCollapsed(false);
  
  // Wait for render
  setTimeout(() => {
    // Scroll to dashboard section
    if (dashboardSectionRef.current && scrollViewRef.current) {
      dashboardSectionRef.current.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({ 
            y: y - 20, 
            animated: true 
          });
          
          // Highlight widget
          highlightWidget(widgetId);
          
          // Handle actions
          if (params.action === 'COMPLETE_TASK') {
            handleAutoCompleteTask(widgetId, params.taskId);
          }
          
          // Show confetti for milestones
          if (params.showConfetti) {
            showConfetti();
          }
        }
      );
    }
  }, 300);
};

// Add highlight widget function
const highlightWidget = (widgetId) => {
  // TODO: Add highlight animation
  // Could use Animated API or flash background color
  console.log('Highlighting widget:', widgetId);
};

// Add auto-complete task function
const handleAutoCompleteTask = async (widgetId, taskId) => {
  // Auto-complete the task
  // This will be handled by ActionChecklistCard
  console.log('Auto-completing task:', taskId, 'in widget:', widgetId);
};

// Add confetti function
const showConfetti = () => {
  // TODO: Show confetti animation
  console.log('🎉 Showing confetti!');
};
```

---

### **STEP 4: Notification Settings UI (2h)**

#### **Update: `src/screens/Account/NotificationSettingsScreen.js`**

Add widget notification settings:

```javascript
// Add new section for widget notifications

const [widgetNotifications, setWidgetNotifications] = useState({
  morning_affirmations: true,
  midday_checkin: true,
  evening_visualization: true,
  milestone_celebrations: true,
});

const [customTimes, setCustomTimes] = useState({
  morning: '08:00',
  midday: '12:00',
  evening: '21:00',
});

// Render widget notifications section
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Widget Notifications</Text>
  
  <View style={styles.settingRow}>
    <View style={styles.settingInfo}>
      <Text style={styles.settingLabel}>🌅 Morning Affirmations</Text>
      <Text style={styles.settingDescription}>Daily affirmations from your goals</Text>
    </View>
    <Switch
      value={widgetNotifications.morning_affirmations}
      onValueChange={(value) => 
        setWidgetNotifications({ ...widgetNotifications, morning_affirmations: value })
      }
      trackColor={{ false: '#767577', true: '#FFBD59' }}
    />
  </View>
  
  {widgetNotifications.morning_affirmations && (
    <View style={styles.timePickerRow}>
      <Text style={styles.timeLabel}>Time:</Text>
      <TouchableOpacity 
        style={styles.timePicker}
        onPress={() => showTimePicker('morning')}
      >
        <Text style={styles.timeText}>{customTimes.morning}</Text>
      </TouchableOpacity>
    </View>
  )}
  
  <View style={styles.settingRow}>
    <View style={styles.settingInfo}>
      <Text style={styles.settingLabel}>☕ Midday Check-in</Text>
      <Text style={styles.settingDescription}>Reminder to complete action items</Text>
    </View>
    <Switch
      value={widgetNotifications.midday_checkin}
      onValueChange={(value) => 
        setWidgetNotifications({ ...widgetNotifications, midday_checkin: value })
      }
      trackColor={{ false: '#767577', true: '#FFBD59' }}
    />
  </View>
  
  {widgetNotifications.midday_checkin && (
    <View style={styles.timePickerRow}>
      <Text style={styles.timeLabel}>Time:</Text>
      <TouchableOpacity 
        style={styles.timePicker}
        onPress={() => showTimePicker('midday')}
      >
        <Text style={styles.timeText}>{customTimes.midday}</Text>
      </TouchableOpacity>
    </View>
  )}
  
  <View style={styles.settingRow}>
    <View style={styles.settingInfo}>
      <Text style={styles.settingLabel}>🌙 Evening Visualization</Text>
      <Text style={styles.settingDescription}>Guided visualization for your goals</Text>
    </View>
    <Switch
      value={widgetNotifications.evening_visualization}
      onValueChange={(value) => 
        setWidgetNotifications({ ...widgetNotifications, evening_visualization: value })
      }
      trackColor={{ false: '#767577', true: '#FFBD59' }}
    />
  </View>
  
  {widgetNotifications.evening_visualization && (
    <View style={styles.timePickerRow}>
      <Text style={styles.timeLabel}>Time:</Text>
      <TouchableOpacity 
        style={styles.timePicker}
        onPress={() => showTimePicker('evening')}
      >
        <Text style={styles.timeText}>{customTimes.evening}</Text>
      </TouchableOpacity>
    </View>
  )}
  
  <View style={styles.settingRow}>
    <View style={styles.settingInfo}>
      <Text style={styles.settingLabel}>🎉 Milestone Celebrations</Text>
      <Text style={styles.settingDescription}>Celebrate your progress</Text>
    </View>
    <Switch
      value={widgetNotifications.milestone_celebrations}
      onValueChange={(value) => 
        setWidgetNotifications({ ...widgetNotifications, milestone_celebrations: value })
      }
      trackColor={{ false: '#767577', true: '#FFBD59' }}
    />
  </View>
</View>
```

---

### **STEP 5: Database Schema (30min)**

```sql
-- User push tokens table
CREATE TABLE IF NOT EXISTS user_push_tokens (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform VARCHAR(20),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notification settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  categories JSONB DEFAULT '{"morning_affirmations": true, "midday_checkin": true, "evening_visualization": true, "milestone_celebrations": true}'::jsonb,
  frequency JSONB DEFAULT '{"max_per_day": 3}'::jsonb,
  do_not_disturb JSONB DEFAULT '{"enabled": false, "start": "22:00", "end": "08:00"}'::jsonb,
  custom_times JSONB DEFAULT '{"morning": "08:00", "midday": "12:00", "evening": "21:00"}'::jsonb,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notification history table
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_taken VARCHAR(50),
  action_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notification_history_user ON notification_history(user_id);

-- RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own settings"
  ON notification_settings FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own history"
  ON notification_history FOR SELECT
  USING (auth.uid() = user_id);
```

---

## ✅ TESTING CHECKLIST

### **Notification Scheduling:**
- [ ] Permissions requested successfully
- [ ] Push token saved to database
- [ ] Morning notifications scheduled (8 AM)
- [ ] Midday notifications scheduled (12 PM)
- [ ] Evening notifications scheduled (9 PM)
- [ ] Custom times respected
- [ ] Max 3/day enforced

### **Personalization:**
- [ ] Morning shows user's affirmation
- [ ] Midday shows user's next task
- [ ] Evening visualization accurate
- [ ] Milestone % correct

### **Deep Linking:**
- [ ] Tap notification → Opens Account tab ✅
- [ ] Auto-scroll to Dashboard section ✅
- [ ] Expand Dashboard if collapsed ✅
- [ ] Highlight widget ✅
- [ ] "Yes, I did!" → Auto-checks task ✅
- [ ] Snooze works (2 hours) ✅

### **Settings:**
- [ ] Master toggle works
- [ ] Category toggles functional
- [ ] Custom times save correctly
- [ ] Do Not Disturb honored
- [ ] Settings persist across app restarts

### **Milestone Notifications:**
- [ ] 10%, 25%, 50%, 75%, 100% milestones trigger
- [ ] Notification sent immediately
- [ ] Confetti shows on tap
- [ ] Deep link to goal widget works

---

## 🎯 SUCCESS CRITERIA

- ✅ 4 notification types sending
- ✅ Personalized content accurate
- ✅ Deep linking 100% working
- ✅ User settings respected
- ✅ Action buttons functional
- ✅ Milestone celebrations working
- ✅ Max 3/day enforced
- ✅ Timezone-aware scheduling

---

## 📝 DEPENDENCIES

```bash
npm install expo-notifications
npm install expo-device
```

---

## 🎉 COMPLETION CHECKLIST

- [ ] notificationScheduler.js working
- [ ] notificationPersonalizer.js working
- [ ] deepLinkHandler.js working
- [ ] AccountScreen handles deep links
- [ ] NotificationSettingsScreen updated
- [ ] Database tables created
- [ ] All 40+ tests passing
- [ ] Notifications sending correctly
- [ ] Deep linking working
- [ ] User settings functional

---

**NEXT:** Day 23-24 - Final Testing & Launch 🚀

🔔 **READY FOR SMART NOTIFICATIONS!**
