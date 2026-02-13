/**
 * CalendarSettingsScreen.js
 * Settings screen for Calendar Smart Journal notifications and preferences
 *
 * Created: January 28, 2026
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Bell,
  Sun,
  Moon,
  BookOpen,
  Sparkles,
  Clock,
  ChevronRight,
  Download,
  Lock,
} from 'lucide-react-native';

import { COLORS, TYPOGRAPHY, SPACING, GRADIENTS, BORDER_RADIUS } from '../../utils/tokens';
import { supabase } from '../../services/supabase';
import {
  initializeNotifications,
  getNotificationSettings,
  updateNotificationSettings,
  rescheduleAllNotifications,
} from '../../services/calendarNotificationService';
import { checkCalendarAccess } from '../../config/calendarAccessControl';

const CalendarSettingsScreen = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false) // Never blocks UI;
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userTier, setUserTier] = useState('FREE');
  const [userRole, setUserRole] = useState(null);

  // Settings state
  const [morningMoodReminder, setMorningMoodReminder] = useState(true);
  const [morningReminderTime, setMorningReminderTime] = useState('07:00');
  const [eveningMoodReminder, setEveningMoodReminder] = useState(true);
  const [eveningReminderTime, setEveningReminderTime] = useState('21:00');
  const [journalReminder, setJournalReminder] = useState(false);
  const [journalReminderTime, setJournalReminderTime] = useState('20:00');
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [milestoneAlerts, setMilestoneAlerts] = useState(true);

  // Display preferences
  const [autoLogRituals, setAutoLogRituals] = useState(true);
  const [autoLogDivination, setAutoLogDivination] = useState(true);
  const [showWeeklySummary, setShowWeeklySummary] = useState(true);

  // Export access
  const exportAccess = checkCalendarAccess('export_data', userTier, userRole);

  // Initialize
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);

        // Get user tier
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier, role')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserTier(profile.subscription_tier || 'FREE');
          setUserRole(profile.role);
        }

        // Initialize notifications
        await initializeNotifications();

        // Load settings
        await loadSettings(user.id);
      }
      setLoading(false);
    };

    init();
  }, []);

  // Load settings
  const loadSettings = async (uid) => {
    try {
      const result = await getNotificationSettings(uid);
      if (result.success && result.data) {
        const settings = result.data;
        setMorningMoodReminder(settings.morning_mood_reminder ?? true);
        setMorningReminderTime(settings.morning_reminder_time || '07:00');
        setEveningMoodReminder(settings.evening_mood_reminder ?? true);
        setEveningReminderTime(settings.evening_reminder_time || '21:00');
        setJournalReminder(settings.journal_reminder ?? false);
        setJournalReminderTime(settings.journal_reminder_time || '20:00');
        setStreakAlerts(settings.streak_alerts ?? true);
        setMilestoneAlerts(settings.milestone_alerts ?? true);
        setAutoLogRituals(settings.auto_log_rituals ?? true);
        setAutoLogDivination(settings.auto_log_divination ?? true);
        setShowWeeklySummary(settings.show_weekly_summary ?? true);
      }
    } catch (error) {
      console.error('[CalendarSettings] Load error:', error);
    }
  };

  // Save settings
  const saveSettings = async (updates) => {
    if (!userId) return;

    setSaving(true);
    try {
      const result = await updateNotificationSettings(userId, updates);
      if (!result.success) {
        Alert.alert('Lỗi', result.error || 'Không thể lưu cài đặt');
      }
    } catch (error) {
      console.error('[CalendarSettings] Save error:', error);
      Alert.alert('Lỗi', 'Không thể lưu cài đặt');
    }
    setSaving(false);
  };

  // Handle toggle changes
  const handleToggle = (key, value, setter) => {
    setter(value);
    saveSettings({ [key]: value });
  };

  // Handle export
  const handleExport = () => {
    if (!exportAccess.allowed) {
      Alert.alert('Hạn chế', exportAccess.reason);
      return;
    }

    Alert.alert(
      'Xuất dữ liệu',
      'Tính năng xuất dữ liệu đang được phát triển. Vui lòng quay lại sau.',
      [{ text: 'OK' }]
    );
  };

  // Loading screen removed - content renders immediately

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={GRADIENTS.darkPurple} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cai dat Calendar</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={COLORS.gold} />
            <Text style={styles.sectionTitle}>Thong bao</Text>
          </View>

          {/* Morning mood reminder */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: COLORS.gold + '20' }]}>
                <Sun size={18} color={COLORS.gold} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Nhac check-in buoi sang</Text>
                <Text style={styles.settingTime}>{morningReminderTime}</Text>
              </View>
            </View>
            <Switch
              value={morningMoodReminder}
              onValueChange={(value) => handleToggle('morning_mood_reminder', value, setMorningMoodReminder)}
              trackColor={{ false: COLORS.textMuted, true: COLORS.gold + '50' }}
              thumbColor={morningMoodReminder ? COLORS.gold : COLORS.textMuted}
            />
          </View>

          {/* Evening mood reminder */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: COLORS.purple + '20' }]}>
                <Moon size={18} color={COLORS.purple} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Nhac check-in buoi toi</Text>
                <Text style={styles.settingTime}>{eveningReminderTime}</Text>
              </View>
            </View>
            <Switch
              value={eveningMoodReminder}
              onValueChange={(value) => handleToggle('evening_mood_reminder', value, setEveningMoodReminder)}
              trackColor={{ false: COLORS.textMuted, true: COLORS.purple + '50' }}
              thumbColor={eveningMoodReminder ? COLORS.purple : COLORS.textMuted}
            />
          </View>

          {/* Journal reminder */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: COLORS.cyan + '20' }]}>
                <BookOpen size={18} color={COLORS.cyan} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Nhac viet nhat ky</Text>
                <Text style={styles.settingTime}>{journalReminderTime}</Text>
              </View>
            </View>
            <Switch
              value={journalReminder}
              onValueChange={(value) => handleToggle('journal_reminder', value, setJournalReminder)}
              trackColor={{ false: COLORS.textMuted, true: COLORS.cyan + '50' }}
              thumbColor={journalReminder ? COLORS.cyan : COLORS.textMuted}
            />
          </View>

          {/* Streak alerts */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: COLORS.error + '20' }]}>
                <Clock size={18} color={COLORS.error} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Canh bao mat streak</Text>
                <Text style={styles.settingDesc}>Thong bao khi streak sap het</Text>
              </View>
            </View>
            <Switch
              value={streakAlerts}
              onValueChange={(value) => handleToggle('streak_alerts', value, setStreakAlerts)}
              trackColor={{ false: COLORS.textMuted, true: COLORS.error + '50' }}
              thumbColor={streakAlerts ? COLORS.error : COLORS.textMuted}
            />
          </View>

          {/* Milestone alerts */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: COLORS.success + '20' }]}>
                <Sparkles size={18} color={COLORS.success} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Thong bao milestone</Text>
                <Text style={styles.settingDesc}>Khi dat duoc cot moc moi</Text>
              </View>
            </View>
            <Switch
              value={milestoneAlerts}
              onValueChange={(value) => handleToggle('milestone_alerts', value, setMilestoneAlerts)}
              trackColor={{ false: COLORS.textMuted, true: COLORS.success + '50' }}
              thumbColor={milestoneAlerts ? COLORS.success : COLORS.textMuted}
            />
          </View>
        </View>

        {/* Auto-log Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sparkles size={20} color={COLORS.cyan} />
            <Text style={styles.sectionTitle}>Tu dong ghi nhan</Text>
          </View>

          {/* Auto-log rituals */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Rituals</Text>
                <Text style={styles.settingDesc}>Tu dong ghi khi hoan thanh ritual</Text>
              </View>
            </View>
            <Switch
              value={autoLogRituals}
              onValueChange={(value) => handleToggle('auto_log_rituals', value, setAutoLogRituals)}
              trackColor={{ false: COLORS.textMuted, true: COLORS.gold + '50' }}
              thumbColor={autoLogRituals ? COLORS.gold : COLORS.textMuted}
            />
          </View>

          {/* Auto-log divination */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Tarot & I Ching</Text>
                <Text style={styles.settingDesc}>Tu dong ghi lai ket qua trai bai/gieo que</Text>
              </View>
            </View>
            <Switch
              value={autoLogDivination}
              onValueChange={(value) => handleToggle('auto_log_divination', value, setAutoLogDivination)}
              trackColor={{ false: COLORS.textMuted, true: COLORS.purple + '50' }}
              thumbColor={autoLogDivination ? COLORS.purple : COLORS.textMuted}
            />
          </View>
        </View>

        {/* Display Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hien thi</Text>
          </View>

          {/* Weekly summary */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Tong ket tuan</Text>
                <Text style={styles.settingDesc}>Hien thi tong ket cuoi tuan</Text>
              </View>
            </View>
            <Switch
              value={showWeeklySummary}
              onValueChange={(value) => handleToggle('show_weekly_summary', value, setShowWeeklySummary)}
              trackColor={{ false: COLORS.textMuted, true: COLORS.cyan + '50' }}
              thumbColor={showWeeklySummary ? COLORS.cyan : COLORS.textMuted}
            />
          </View>
        </View>

        {/* Export Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Download size={20} color={COLORS.info} />
            <Text style={styles.sectionTitle}>Xuất dữ liệu</Text>
          </View>

          <TouchableOpacity
            style={[styles.exportButton, !exportAccess.allowed && styles.exportButtonDisabled]}
            onPress={handleExport}
          >
            <View style={styles.exportContent}>
              <Text style={styles.exportLabel}>Xuat tat ca du lieu</Text>
              <Text style={styles.exportDesc}>
                Journal, Trading, Mood - dinh dang CSV/JSON
              </Text>
            </View>
            {exportAccess.allowed ? (
              <ChevronRight size={20} color={COLORS.textMuted} />
            ) : (
              <View style={styles.lockBadge}>
                <Lock size={12} color={COLORS.gold} />
                <Text style={styles.lockText}>{exportAccess.requiredTier}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        </View>

        {/* Tier info */}
        <View style={styles.tierInfo}>
          <Text style={styles.tierLabel}>Goi hien tai: {userTier}</Text>
          {userTier === 'FREE' && (
            <TouchableOpacity
              style={styles.upgradeLink}
              onPress={() => navigation.navigate('TierUpgrade')}
            >
              <Text style={styles.upgradeLinkText}>Nang cap de mo khoa them tinh nang</Text>
            )}
              <ChevronRight size={16} color={COLORS.gold} />
            )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Saving indicator */}
      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="small" color={COLORS.gold} />
          <Text style={styles.savingText}>Dang luu...</Text>
        )}
        </View>
      )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  settingTime: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    marginTop: 2,
  },
  settingDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  exportButtonDisabled: {
    opacity: 0.7,
  },
  exportContent: {
    flex: 1,
  },
  exportLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  exportDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    backgroundColor: COLORS.gold + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: BORDER_RADIUS.full,
  },
  lockText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  tierInfo: {
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.md,
  },
  tierLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  upgradeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  upgradeLinkText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
  },
  bottomSpacing: {
    height: 100,
  },
  savingOverlay: {
    position: 'absolute',
    bottom: 100,
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.glassBg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  savingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
});

export default CalendarSettingsScreen;
