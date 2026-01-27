/**
 * Gemral - Privacy Settings Screen
 * Manage messaging and call privacy preferences
 *
 * Features:
 * - Read receipts toggle
 * - Online status toggle
 * - Typing indicator toggle
 * - Last seen toggle
 * - Call privacy settings
 * - Message requests toggle
 * - Links to blocked/restricted users
 * - Tooltips for each setting
 * - Auto-save on change
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from '../../utils/haptics';

// Services
import privacySettingsService from '../../services/privacySettingsService';
import restrictedUsersService from '../../services/restrictedUsersService';
import messagingService from '../../services/messagingService';

// Alert
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';

// Components
import PrivacyToggle from './components/PrivacyToggle';

// Tokens
import {
  COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
} from '../../utils/tokens';

export default function PrivacySettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { alert, AlertComponent } = useCustomAlert();

  // State
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blockedCount, setBlockedCount] = useState(0);
  const [restrictedCount, setRestrictedCount] = useState(0);

  // =====================================================
  // FETCH DATA
  // =====================================================

  const fetchData = useCallback(async () => {
    try {
      const [privacySettings, blocked, restricted] = await Promise.all([
        privacySettingsService.getPrivacySettings(true),
        messagingService.getBlockedUsers(),
        restrictedUsersService.getRestrictedUsers(),
      ]);

      setSettings(privacySettings);
      setBlockedCount(blocked?.length || 0);
      setRestrictedCount(restricted?.length || 0);
    } catch (error) {
      console.error('Error fetching privacy data:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể tải cài đặt. Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  }, [alert]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =====================================================
  // UPDATE SETTINGS
  // =====================================================

  const handleToggle = useCallback(async (key) => {
    if (saving) return;

    try {
      setSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const newValue = !settings[key];

      // Optimistic update
      setSettings(prev => ({ ...prev, [key]: newValue }));

      const result = await privacySettingsService.updatePrivacySettings({
        [key]: newValue,
      });

      if (!result.success) {
        // Revert on error
        setSettings(prev => ({ ...prev, [key]: !newValue }));
        throw new Error(result.error);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error updating setting:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể cập nhật cài đặt. Vui lòng thử lại.',
      });
    } finally {
      setSaving(false);
    }
  }, [settings, saving, alert]);

  const handleCallsSettingChange = useCallback(async (value) => {
    if (saving) return;

    try {
      setSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const oldValue = settings.allow_calls_from;

      // Optimistic update
      setSettings(prev => ({ ...prev, allow_calls_from: value }));

      const result = await privacySettingsService.updateCallsSetting(value);

      if (!result.success) {
        // Revert on error
        setSettings(prev => ({ ...prev, allow_calls_from: oldValue }));
        throw new Error(result.error);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error updating calls setting:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể cập nhật cài đặt. Vui lòng thử lại.',
      });
    } finally {
      setSaving(false);
    }
  }, [settings, saving, alert]);

  // =====================================================
  // RENDER
  // =====================================================

  const renderSection = (title, children) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const renderCallsOptions = () => {
    const options = [
      { value: 'everyone', label: 'Tất cả mọi người', icon: 'globe-outline' },
      { value: 'contacts_only', label: 'Chỉ người đã nhắn tin', icon: 'people-outline' },
      { value: 'nobody', label: 'Không ai', icon: 'close-circle-outline' },
    ];

    return (
      <View style={styles.callsOptions}>
        {options.map((option) => {
          const isSelected = settings?.allow_calls_from === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.callOption, isSelected && styles.callOptionSelected]}
              onPress={() => handleCallsSettingChange(option.value)}
              disabled={saving}
              activeOpacity={0.7}
            >
              <View style={[styles.callOptionIcon, isSelected && styles.callOptionIconSelected]}>
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={isSelected ? COLORS.textPrimary : COLORS.textMuted}
                />
              </View>
              <Text style={[styles.callOptionLabel, isSelected && styles.callOptionLabelSelected]}>
                {option.label}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={20} color={COLORS.purple} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderNavigationItem = (title, subtitle, icon, onPress, count = 0) => (
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.navItemIcon}>
        <Ionicons name={icon} size={20} color={COLORS.textSecondary} />
      </View>
      <View style={styles.navItemContent}>
        <Text style={styles.navItemTitle}>{title}</Text>
        <Text style={styles.navItemSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.navItemRight}>
        {count > 0 && (
          <View style={styles.navItemBadge}>
            <Text style={styles.navItemBadgeText}>{count}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.container}
      >
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Quyền riêng tư</Text>
          <View style={styles.placeholder} />
        </View>
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
        <Text style={styles.title}>Quyền riêng tư</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Messaging Privacy */}
        {renderSection('Tin nhắn', (
          <>
            <PrivacyToggle
              icon="mail-outline"
              title="Cho phép tin nhắn chờ"
              description="Người lạ có thể gửi tin nhắn chờ duyệt cho bạn"
              value={settings?.allow_message_requests}
              onToggle={() => handleToggle('allow_message_requests')}
              disabled={saving}
              tooltip="Khi bật, người chưa từng nhắn tin với bạn có thể gửi tin nhắn chờ. Khi tắt, chỉ những người bạn đã nhắn tin mới có thể liên hệ."
            />
            <PrivacyToggle
              icon="checkmark-done-outline"
              title="Xác nhận đã đọc"
              description="Hiển thị khi bạn đã đọc tin nhắn"
              value={settings?.read_receipts_enabled}
              onToggle={() => handleToggle('read_receipts_enabled')}
              disabled={saving}
              tooltip="Khi bật, người khác sẽ thấy bạn đã đọc tin nhắn của họ. Đây là cài đặt hai chiều - nếu bạn tắt, bạn cũng sẽ không thấy người khác đã đọc tin nhắn của bạn."
            />
            <PrivacyToggle
              icon="ellipsis-horizontal"
              title="Đang nhập..."
              description="Hiển thị khi bạn đang nhập tin nhắn"
              value={settings?.typing_indicator_enabled}
              onToggle={() => handleToggle('typing_indicator_enabled')}
              disabled={saving}
              tooltip="Khi bật, người khác sẽ thấy bạn đang nhập. Đây là cài đặt hai chiều - nếu bạn tắt, bạn cũng sẽ không thấy người khác đang nhập."
            />
          </>
        ))}

        {/* Status Privacy */}
        {renderSection('Trạng thái', (
          <>
            <PrivacyToggle
              icon="radio-button-on"
              title="Trạng thái online"
              description="Hiển thị khi bạn đang online"
              value={settings?.online_status_enabled}
              onToggle={() => handleToggle('online_status_enabled')}
              disabled={saving}
              tooltip="Khi bật, người khác sẽ thấy chấm xanh khi bạn online. Khi tắt, bạn sẽ luôn hiện offline với mọi người."
            />
            <PrivacyToggle
              icon="time-outline"
              title="Hoạt động lần cuối"
              description="Hiển thị thời gian hoạt động gần nhất"
              value={settings?.last_seen_enabled}
              onToggle={() => handleToggle('last_seen_enabled')}
              disabled={saving}
              tooltip="Khi bật, người khác có thể thấy 'Hoạt động 5 phút trước'. Khi tắt, thông tin này sẽ bị ẩn."
            />
          </>
        ))}

        {/* Call Privacy */}
        {renderSection('Cuộc gọi', (
          <>
            <View style={styles.callsDescription}>
              <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.callsDescriptionText}>
                Ai có thể gọi cho bạn?
              </Text>
            </View>
            {renderCallsOptions()}
          </>
        ))}

        {/* Users Management */}
        {renderSection('Quản lý người dùng', (
          <>
            {renderNavigationItem(
              'Người đã chặn',
              'Quản lý danh sách chặn',
              'ban-outline',
              () => navigation.navigate('BlockedUsers'),
              blockedCount
            )}
            {renderNavigationItem(
              'Người bị hạn chế',
              'Tin nhắn không thông báo',
              'eye-off-outline',
              () => navigation.navigate('RestrictedUsers'),
              restrictedCount
            )}
            {renderNavigationItem(
              'Tin nhắn spam',
              'Xem và quản lý spam',
              'warning-outline',
              () => navigation.navigate('SpamMessages'),
              0
            )}
          </>
        ))}

        {/* Info */}
        <View style={styles.infoSection}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.purple} />
          <Text style={styles.infoText}>
            Cài đặt quyền riêng tư giúp bạn kiểm soát ai có thể liên hệ và xem thông tin của bạn. Các thay đổi được lưu tự động.
          </Text>
        </View>
      </ScrollView>

      {AlertComponent}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },

  // Loading
  loadingContainer: {
    flex: 1,
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
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  sectionContent: {
    backgroundColor: 'rgba(15, 16, 48, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    overflow: 'hidden',
  },

  // Calls Options
  callsDescription: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  callsDescriptionText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
  },
  callsOptions: {
    padding: SPACING.sm,
  },
  callOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.xs,
  },
  callOptionSelected: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
  },
  callOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  callOptionIconSelected: {
    backgroundColor: 'rgba(106, 91, 255, 0.3)',
  },
  callOptionLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
  },
  callOptionLabelSelected: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Navigation Item
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  navItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  navItemContent: {
    flex: 1,
  },
  navItemTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  navItemSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  navItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  navItemBadge: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  navItemBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // Info Section
  infoSection: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 12,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
