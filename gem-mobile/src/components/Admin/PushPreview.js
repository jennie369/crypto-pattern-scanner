/**
 * Gemral - Push Notification Preview Component
 * Preview push notification giống iOS/Android
 * @description Hiển thị preview thông báo đẩy trước khi gửi
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Smartphone,
  Bell,
  ChevronRight,
} from 'lucide-react-native';

import { COLORS, SPACING, TYPOGRAPHY, GLASS, SHADOWS } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Device types
const DEVICE_TYPES = {
  IOS: 'ios',
  ANDROID: 'android',
};

// ========== iOS NOTIFICATION PREVIEW ==========
const IOSNotificationPreview = ({ title, body, appIcon, time }) => (
  <View style={styles.iosContainer}>
    {/* iOS notification card */}
    <View style={styles.iosNotification}>
      <View style={styles.iosHeader}>
        <Image
          source={{ uri: appIcon }}
          style={styles.iosAppIcon}
        />
        <Text style={styles.iosAppName}>GEM</Text>
        <Text style={styles.iosTime}>{time}</Text>
      </View>
      <Text style={styles.iosTitle} numberOfLines={1}>
        {title || 'Tiêu đề thông báo'}
      </Text>
      <Text style={styles.iosBody} numberOfLines={4}>
        {body || 'Nội dung thông báo sẽ hiển thị ở đây...'}
      </Text>
    </View>

    {/* iPhone frame indicator */}
    <View style={styles.deviceIndicator}>
      <Smartphone size={14} color={COLORS.textMuted} />
      <Text style={styles.deviceText}>iPhone</Text>
    </View>
  </View>
);

// ========== ANDROID NOTIFICATION PREVIEW ==========
const AndroidNotificationPreview = ({ title, body, appIcon, time }) => (
  <View style={styles.androidContainer}>
    {/* Android notification card */}
    <View style={styles.androidNotification}>
      <View style={styles.androidHeader}>
        <Image
          source={{ uri: appIcon }}
          style={styles.androidAppIcon}
        />
        <Text style={styles.androidAppName}>GEM</Text>
        <Text style={styles.androidDot}>•</Text>
        <Text style={styles.androidTime}>{time}</Text>
        <ChevronRight size={16} color="rgba(0,0,0,0.4)" style={styles.androidChevron} />
      </View>
      <Text style={styles.androidTitle} numberOfLines={1}>
        {title || 'Tiêu đề thông báo'}
      </Text>
      <Text style={styles.androidBody} numberOfLines={2}>
        {body || 'Nội dung thông báo sẽ hiển thị ở đây...'}
      </Text>
    </View>

    {/* Android device indicator */}
    <View style={styles.deviceIndicator}>
      <Smartphone size={14} color={COLORS.textMuted} />
      <Text style={styles.deviceText}>Android</Text>
    </View>
  </View>
);

// ========== MAIN COMPONENT ==========
const PushPreview = ({
  title = '',
  body = '',
  imageUrl = null,
  appIcon = 'https://i.pravatar.cc/100?u=gem-app',
  time = 'bây giờ',
  defaultDevice = DEVICE_TYPES.IOS,
  showDeviceToggle = true,
  style,
}) => {
  const [device, setDevice] = useState(defaultDevice);

  // Character count helpers
  const titleLength = title?.length || 0;
  const bodyLength = body?.length || 0;
  const titleMax = 60;
  const bodyMax = 150;

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Bell size={16} color={COLORS.gold} />
          <Text style={styles.headerTitle}>Xem trước thông báo</Text>
        </View>

        {/* Device toggle */}
        {showDeviceToggle && (
          <View style={styles.deviceToggle}>
            <TouchableOpacity
              style={[
                styles.deviceToggleButton,
                device === DEVICE_TYPES.IOS && styles.deviceToggleButtonActive,
              ]}
              onPress={() => setDevice(DEVICE_TYPES.IOS)}
            >
              <Text
                style={[
                  styles.deviceToggleText,
                  device === DEVICE_TYPES.IOS && styles.deviceToggleTextActive,
                ]}
              >
                iOS
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.deviceToggleButton,
                device === DEVICE_TYPES.ANDROID && styles.deviceToggleButtonActive,
              ]}
              onPress={() => setDevice(DEVICE_TYPES.ANDROID)}
            >
              <Text
                style={[
                  styles.deviceToggleText,
                  device === DEVICE_TYPES.ANDROID && styles.deviceToggleTextActive,
                ]}
              >
                Android
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Preview */}
      <View style={styles.previewContainer}>
        {device === DEVICE_TYPES.IOS ? (
          <IOSNotificationPreview
            title={title}
            body={body}
            appIcon={appIcon}
            time={time}
          />
        ) : (
          <AndroidNotificationPreview
            title={title}
            body={body}
            appIcon={appIcon}
            time={time}
          />
        )}
      </View>

      {/* Character counts */}
      <View style={styles.charCounts}>
        <View style={styles.charCount}>
          <Text style={styles.charCountLabel}>Tiêu đề:</Text>
          <Text
            style={[
              styles.charCountValue,
              titleLength > titleMax && styles.charCountOver,
            ]}
          >
            {titleLength}/{titleMax}
          </Text>
        </View>
        <View style={styles.charCount}>
          <Text style={styles.charCountLabel}>Nội dung:</Text>
          <Text
            style={[
              styles.charCountValue,
              bodyLength > bodyMax && styles.charCountOver,
            ]}
          >
            {bodyLength}/{bodyMax}
          </Text>
        </View>
      </View>

      {/* Warnings */}
      {(titleLength > titleMax || bodyLength > bodyMax) && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            Nội dung quá dài có thể bị cắt trên một số thiết bị
          </Text>
        </View>
      )}
    </View>
  );
};

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(106,91,255,0.3)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  deviceToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: SPACING.xs,
    padding: 2,
  },
  deviceToggleButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.xs - 2,
  },
  deviceToggleButtonActive: {
    backgroundColor: COLORS.gold,
  },
  deviceToggleText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },
  deviceToggleTextActive: {
    color: COLORS.bgDarkest,
  },
  previewContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },

  // iOS styles
  iosContainer: {
    width: '100%',
    maxWidth: 340,
  },
  iosNotification: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: SPACING.md,
    ...SHADOWS.lg,
  },
  iosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  iosAppIcon: {
    width: 20,
    height: 20,
    borderRadius: 5,
    marginRight: SPACING.xs,
  },
  iosAppName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: 'rgba(0,0,0,0.5)',
    flex: 1,
  },
  iosTime: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(0,0,0,0.4)',
  },
  iosTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#000000',
    marginBottom: 2,
  },
  iosBody: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: 'rgba(0,0,0,0.8)',
    lineHeight: 20,
  },

  // Android styles
  androidContainer: {
    width: '100%',
    maxWidth: 340,
  },
  androidNotification: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  androidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  androidAppIcon: {
    width: 18,
    height: 18,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  androidAppName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: 'rgba(0,0,0,0.6)',
  },
  androidDot: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(0,0,0,0.4)',
    marginHorizontal: SPACING.xxs,
  },
  androidTime: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(0,0,0,0.4)',
    flex: 1,
  },
  androidChevron: {
    marginLeft: 'auto',
  },
  androidTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#000000',
    marginBottom: 2,
  },
  androidBody: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: 'rgba(0,0,0,0.7)',
    lineHeight: 20,
  },

  // Device indicator
  deviceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xxs,
    marginTop: SPACING.sm,
  },
  deviceText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  // Character counts
  charCounts: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  charCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  charCountLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  charCountValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.success,
  },
  charCountOver: {
    color: COLORS.error,
  },

  // Warning
  warning: {
    backgroundColor: 'rgba(255,184,0,0.1)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,184,0,0.2)',
  },
  warningText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.warning,
    textAlign: 'center',
  },
});

export { PushPreview, DEVICE_TYPES };
export default PushPreview;
