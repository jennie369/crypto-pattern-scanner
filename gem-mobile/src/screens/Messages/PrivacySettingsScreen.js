/**
 * Gemral - Privacy Settings Screen
 * Quản lý cài đặt riêng tư cho tin nhắn và cuộc gọi
 *
 * Tính năng:
 * - Bật/tắt xác nhận đã đọc
 * - Bật/tắt trạng thái trực tuyến
 * - Bật/tắt hiển thị đang nhập
 * - Bật/tắt hoạt động lần cuối
 * - Giới hạn cuộc gọi
 * - Bật/tắt yêu cầu tin nhắn
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
  { value: 'everyone', label: 'Tất cả mọi người', description: 'Bất kỳ ai cũng có thể gọi cho bạn' },
  { value: 'contacts_only', label: 'Chỉ liên hệ', description: 'Chỉ những người bạn đã nhắn tin' },
  { value: 'nobody', label: 'Không ai', description: 'Chặn tất cả cuộc gọi đến' },
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
        console.error('Lỗi khi tải cài đặt riêng tư:', error);
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
      console.error('Lỗi khi cập nhật cài đặt:', error);
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
      console.error('Lỗi khi cập nhật cài đặt cuộc gọi:', error);
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
          <Text style={styles.settingTitle}>Ai có thể gọi cho tôi</Text>
          <Text style={styles.settingDescription}>Kiểm soát ai có thể gọi điện cho bạn</Text>
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

        <Text style={styles.title}>Cài đặt riêng tư</Text>

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
          <Text style={styles.sectionTitle}>Yêu cầu tin nhắn</Text>
          {renderToggleItem(
            'allow_message_requests',
            'Cho phép yêu cầu tin nhắn',
            'Nhận tin nhắn từ những người bạn chưa từng trò chuyện',
            'mail-unread-outline'
          )}
        </View>

        {/* Read Receipts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tin nhắn</Text>

          {renderToggleItem(
            'read_receipts_enabled',
            'Xác nhận đã đọc',
            'Cho người khác biết khi bạn đã đọc tin nhắn của họ. Nếu tắt, bạn cũng không thấy khi người khác đọc tin của bạn.',
            'checkmark-done-outline'
          )}

          {renderToggleItem(
            'typing_indicator_enabled',
            'Hiển thị đang nhập',
            'Hiển thị khi bạn đang nhập. Nếu tắt, bạn cũng không thấy khi người khác đang nhập.',
            'ellipsis-horizontal-outline'
          )}
        </View>

        {/* Online Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trạng thái hoạt động</Text>

          {renderToggleItem(
            'online_status_enabled',
            'Trạng thái trực tuyến',
            'Hiển thị cho người khác biết khi bạn đang trực tuyến',
            'radio-button-on-outline'
          )}

          {renderToggleItem(
            'last_seen_enabled',
            'Hoạt động lần cuối',
            'Hiển thị thời gian bạn hoạt động lần cuối',
            'time-outline'
          )}
        </View>

        {/* Calls Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuộc gọi</Text>
          {renderCallOptions()}
          {renderCallOptionsDropdown()}
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.cyan} />
          <Text style={styles.infoText}>
            Quyền riêng tư của bạn rất quan trọng. Các cài đặt này giúp bạn kiểm soát ai có thể tương tác với bạn và những thông tin họ có thể thấy.
          </Text>
        </View>

        {/* Links to other screens */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tùy chọn khác</Text>

          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => navigation.navigate('BlockedUsers')}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="ban-outline" size={22} color={COLORS.error} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Người dùng bị chặn</Text>
              <Text style={styles.settingDescription}>Quản lý các tài khoản bị chặn</Text>
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
              <Text style={styles.settingTitle}>Yêu cầu tin nhắn</Text>
              <Text style={styles.settingDescription}>Xem các yêu cầu tin nhắn đang chờ</Text>
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
