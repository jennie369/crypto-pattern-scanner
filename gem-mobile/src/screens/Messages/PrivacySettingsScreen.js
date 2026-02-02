/**
 * Gemral - Privacy Settings Screen
 * Manage messaging and call privacy settings
 *
 * Features:
 * - Read receipts toggle
 * - Online status toggle
 * - Typing indicator toggle
 * - Last seen toggle
 * - Call restrictions
 * - Message requests toggle
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from '../../utils/haptics';

// Services
import { privacySettingsService } from '../../services/privacySettingsService';

// Tokens
import {
  COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
} from '../../utils/tokens';

const CALL_OPTIONS = [
  { value: 'everyone', label: 'Everyone', description: 'Anyone can call you' },
  { value: 'contacts_only', label: 'Contacts Only', description: 'Only people you\'ve chatted with' },
  { value: 'nobody', label: 'Nobody', description: 'Block all incoming calls' },
];

export default function PrivacySettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    allow_message_requests: true,
    read_receipts_enabled: true,
    typing_indicator_enabled: true,
    online_status_enabled: true,
    last_seen_enabled: true,
    allow_calls_from: 'everyone',
  });
  const [showCallOptions, setShowCallOptions] = useState(false);

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const result = await privacySettingsService.getPrivacySettings();
        if (result.success && result.settings) {
          setSettings(result.settings);
        }
      } catch (error) {
        console.error('Error fetching privacy settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Update a setting
  const updateSetting = useCallback(async (key, value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Optimistic update
    setSettings(prev => ({ ...prev, [key]: value }));

    try {
      setSaving(true);
      const result = await privacySettingsService.updatePrivacySettings({ [key]: value });
      if (!result.success) {
        // Revert on failure
        setSettings(prev => ({ ...prev, [key]: !value }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      setSettings(prev => ({ ...prev, [key]: !value }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  }, []);

  // Update call setting
  const updateCallSetting = useCallback(async (value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowCallOptions(false);

    setSettings(prev => ({ ...prev, allow_calls_from: value }));

    try {
      setSaving(true);
      const result = await privacySettingsService.updatePrivacySettings({ allow_calls_from: value });
      if (!result.success) {
        setSettings(prev => ({ ...prev, allow_calls_from: 'everyone' }));
      }
    } catch (error) {
      console.error('Error updating call setting:', error);
    } finally {
      setSaving(false);
    }
  }, []);

  // Render toggle item
  const renderToggleItem = (key, title, description, icon) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={22} color={COLORS.purple} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={settings[key]}
        onValueChange={(value) => updateSetting(key, value)}
        trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.gold }}
        thumbColor={COLORS.textPrimary}
        ios_backgroundColor="rgba(255,255,255,0.1)"
      />
    </View>
  );

  // Render call options
  const renderCallOptions = () => {
    const currentOption = CALL_OPTIONS.find(o => o.value === settings.allow_calls_from) || CALL_OPTIONS[0];

    return (
      <View style={styles.settingItem}>
        <View style={styles.settingIcon}>
          <Ionicons name="call-outline" size={22} color={COLORS.purple} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>Who Can Call Me</Text>
          <Text style={styles.settingDescription}>Control who can make calls to you</Text>
        </View>
        <TouchableOpacity
          style={styles.callOptionButton}
          onPress={() => setShowCallOptions(!showCallOptions)}
        >
          <Text style={styles.callOptionText}>{currentOption.label}</Text>
          <Ionicons
            name={showCallOptions ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>
    );
  };

  // Render call options dropdown
  const renderCallOptionsDropdown = () => {
    if (!showCallOptions) return null;

    return (
      <View style={styles.callOptionsDropdown}>
        {CALL_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.callOptionItem,
              settings.allow_calls_from === option.value && styles.callOptionItemSelected,
            ]}
            onPress={() => updateCallSetting(option.value)}
          >
            <View style={styles.callOptionInfo}>
              <Text style={[
                styles.callOptionLabel,
                settings.allow_calls_from === option.value && styles.callOptionLabelSelected,
              ]}>
                {option.label}
              </Text>
              <Text style={styles.callOptionDesc}>{option.description}</Text>
            </View>
            {settings.allow_calls_from === option.value && (
              <Ionicons name="checkmark-circle" size={22} color={COLORS.gold} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.title}>Privacy Settings</Text>

        <View style={styles.placeholder}>
          {saving && <ActivityIndicator size="small" color={COLORS.gold} />}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Message Requests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message Requests</Text>
          {renderToggleItem(
            'allow_message_requests',
            'Allow Message Requests',
            'Receive messages from people you haven\'t chatted with before',
            'mail-unread-outline'
          )}
        </View>

        {/* Read Receipts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Messaging</Text>

          {renderToggleItem(
            'read_receipts_enabled',
            'Read Receipts',
            'Let others know when you\'ve read their messages. If off, you also won\'t see when others read yours.',
            'checkmark-done-outline'
          )}

          {renderToggleItem(
            'typing_indicator_enabled',
            'Typing Indicator',
            'Show when you\'re typing. If off, you also won\'t see when others are typing.',
            'ellipsis-horizontal-outline'
          )}
        </View>

        {/* Online Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Status</Text>

          {renderToggleItem(
            'online_status_enabled',
            'Online Status',
            'Show others when you\'re online',
            'radio-button-on-outline'
          )}

          {renderToggleItem(
            'last_seen_enabled',
            'Last Seen',
            'Show when you were last active',
            'time-outline'
          )}
        </View>

        {/* Calls Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calls</Text>
          {renderCallOptions()}
          {renderCallOptionsDropdown()}
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.cyan} />
          <Text style={styles.infoText}>
            Your privacy is important. These settings help you control who can interact with you and what information they can see.
          </Text>
        </View>

        {/* Links to other screens */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Options</Text>

          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => navigation.navigate('BlockedUsers')}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="ban-outline" size={22} color={COLORS.error} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Blocked Users</Text>
              <Text style={styles.settingDescription}>Manage blocked accounts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => navigation.navigate('MessageRequests')}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="chatbox-ellipses-outline" size={22} color={COLORS.gold} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Message Requests</Text>
              <Text style={styles.settingDescription}>View pending message requests</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: 'rgba(5, 4, 11, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.huge,
  },

  // Section
  section: {
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },

  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  settingContent: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    lineHeight: 18,
  },

  // Link Item
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },

  // Call Options
  callOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderRadius: 8,
    gap: SPACING.xs,
  },
  callOptionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.purple,
  },
  callOptionsDropdown: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(15, 16, 48, 0.8)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  callOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  callOptionItemSelected: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  callOptionInfo: {
    flex: 1,
  },
  callOptionLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  callOptionLabelSelected: {
    color: COLORS.gold,
  },
  callOptionDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    borderRadius: 12,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
