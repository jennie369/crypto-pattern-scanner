/**
 * GEM Mobile - Notification Settings Screen
 * Configure push, email, and widget notification preferences
 *
 * Day 20-22: Added widget-based smart notifications
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ArrowLeft,
  Bell,
  TrendingUp,
  MessageCircle,
  Users,
  Gift,
  Package,
  Mail,
  Sun,
  CheckCircle2,
  Moon,
  Trophy,
  Clock,
  BellOff,
  X,
  Target,
  AlertTriangle,
  XCircle,
  DollarSign,
  ShieldAlert,
  Zap,
  Heart,
  ShoppingBag,
  Tag,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, GLASS, TYPOGRAPHY } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import notificationScheduler from '../../services/notificationScheduler';

const DEFAULT_SETTINGS = {
  push_enabled: true,
  trading_pattern: true,
  trading_price: true,
  // Paper Trading Notifications
  paper_order_filled: true,
  paper_order_cancelled: true,
  paper_tp_hit: true,
  paper_sl_hit: true,
  paper_liquidation_warning: true,
  paper_position_closed: true,
  // Community
  community_comment: true,
  community_like: true,
  community_follow: true,
  affiliate_referral: true,
  affiliate_commission: true,
  orders_status: true,
  orders_delivery: true,
  // Shop Notifications (V2)
  shop_flash_sale: true,
  shop_wishlist_price_drop: true,
  shop_back_in_stock: true,
  shop_promo_offers: false,
  // Email
  email_weekly: true,
  email_marketing: false,
};

// Widget notification settings
const DEFAULT_WIDGET_SETTINGS = {
  enabled: true,
  categories: {
    morning_affirmations: true,
    midday_checkin: true,
    evening_visualization: true,
    milestone_celebrations: true,
  },
  custom_times: {
    morning: '08:00',
    midday: '12:00',
    evening: '21:00',
  },
  do_not_disturb: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

export default function NotificationSettingsScreen({ navigation }) {
  const { alert, AlertComponent } = useCustomAlert();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [widgetSettings, setWidgetSettings] = useState(DEFAULT_WIDGET_SETTINGS);

  // Time picker state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerType, setTimePickerType] = useState(null); // 'morning', 'midday', 'evening', 'dnd_start', 'dnd_end'
  const [tempTime, setTempTime] = useState(new Date());

  useEffect(() => {
    loadSettings();
    loadWidgetSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setSettings({ ...DEFAULT_SETTINGS, ...data });
      }
    } catch (error) {
      // If no settings exist, use defaults
      console.log('[NotificationSettings] Using defaults');
    } finally {
      setLoading(false);
    }
  };

  const loadWidgetSettings = async () => {
    try {
      const savedSettings = notificationScheduler.getSettings();
      if (savedSettings) {
        setWidgetSettings({ ...DEFAULT_WIDGET_SETTINGS, ...savedSettings });
      }
    } catch (error) {
      console.log('[NotificationSettings] Using default widget settings');
    }
  };

  // Parse time string to Date object
  const parseTimeToDate = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Format Date to time string
  const formatTimeString = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Handle time picker
  const openTimePicker = (type) => {
    let initialTime;
    switch (type) {
      case 'morning':
        initialTime = parseTimeToDate(widgetSettings.custom_times.morning);
        break;
      case 'midday':
        initialTime = parseTimeToDate(widgetSettings.custom_times.midday);
        break;
      case 'evening':
        initialTime = parseTimeToDate(widgetSettings.custom_times.evening);
        break;
      case 'dnd_start':
        initialTime = parseTimeToDate(widgetSettings.do_not_disturb.start);
        break;
      case 'dnd_end':
        initialTime = parseTimeToDate(widgetSettings.do_not_disturb.end);
        break;
      default:
        initialTime = new Date();
    }
    setTempTime(initialTime);
    setTimePickerType(type);
    setShowTimePicker(true);
  };

  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (selectedTime) {
      setTempTime(selectedTime);

      if (Platform.OS === 'android') {
        saveTimeChange(selectedTime);
      }
    }
  };

  const saveTimeChange = async (time = tempTime) => {
    const timeString = formatTimeString(time);
    let updatedSettings = { ...widgetSettings };

    switch (timePickerType) {
      case 'morning':
        updatedSettings.custom_times = { ...updatedSettings.custom_times, morning: timeString };
        break;
      case 'midday':
        updatedSettings.custom_times = { ...updatedSettings.custom_times, midday: timeString };
        break;
      case 'evening':
        updatedSettings.custom_times = { ...updatedSettings.custom_times, evening: timeString };
        break;
      case 'dnd_start':
        updatedSettings.do_not_disturb = { ...updatedSettings.do_not_disturb, start: timeString };
        break;
      case 'dnd_end':
        updatedSettings.do_not_disturb = { ...updatedSettings.do_not_disturb, end: timeString };
        break;
    }

    setWidgetSettings(updatedSettings);
    await notificationScheduler.saveSettings(updatedSettings);
    setShowTimePicker(false);
    setTimePickerType(null);
  };

  // Handle widget category toggle
  const handleWidgetCategoryToggle = async (category, value) => {
    const updatedSettings = {
      ...widgetSettings,
      categories: {
        ...widgetSettings.categories,
        [category]: value,
      },
    };
    setWidgetSettings(updatedSettings);
    await notificationScheduler.saveSettings(updatedSettings);
  };

  // Handle widget master toggle
  const handleWidgetMasterToggle = async (value) => {
    const updatedSettings = {
      ...widgetSettings,
      enabled: value,
    };
    setWidgetSettings(updatedSettings);
    await notificationScheduler.saveSettings(updatedSettings);
  };

  // Handle DND toggle
  const handleDNDToggle = async (value) => {
    const updatedSettings = {
      ...widgetSettings,
      do_not_disturb: {
        ...widgetSettings.do_not_disturb,
        enabled: value,
      },
    };
    setWidgetSettings(updatedSettings);
    await notificationScheduler.saveSettings(updatedSettings);
  };

  const handleToggle = async (field, value) => {
    // Update local state immediately
    setSettings(prev => ({ ...prev, [field]: value }));

    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          [field]: value,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;
    } catch (error) {
      // Revert on error
      setSettings(prev => ({ ...prev, [field]: !value }));
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể lưu cài đặt',
        buttons: [{ text: 'OK' }],
      });
    }
  };

  const renderToggle = (field, label, description, icon, color = COLORS.purple) => {
    const Icon = icon;
    return (
      <View style={styles.settingItem}>
        <View style={[styles.settingIcon, { backgroundColor: `${color}20` }]}>
          <Icon size={20} color={color} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingLabel}>{label}</Text>
          {description && <Text style={styles.settingDesc}>{description}</Text>}
        </View>
        <Switch
          value={settings[field]}
          onValueChange={(value) => handleToggle(field, value)}
          trackColor={{ false: 'rgba(255,255,255,0.1)', true: `${COLORS.success}50` }}
          thumbColor={settings[field] ? COLORS.success : COLORS.textMuted}
        />
      </View>
    );
  };

  // Render widget notification category
  const renderWidgetCategory = (category, label, description, icon, timeKey, color = COLORS.gold) => {
    const Icon = icon;
    const time = widgetSettings.custom_times[timeKey];
    const isEnabled = widgetSettings.categories[category];

    return (
      <View style={styles.widgetCategoryItem}>
        <View style={styles.widgetCategoryMain}>
          <View style={[styles.settingIcon, { backgroundColor: `${color}20` }]}>
            <Icon size={20} color={color} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>{label}</Text>
            {description && <Text style={styles.settingDesc}>{description}</Text>}
          </View>
          <Switch
            value={isEnabled}
            onValueChange={(value) => handleWidgetCategoryToggle(category, value)}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: `${COLORS.gold}50` }}
            thumbColor={isEnabled ? COLORS.gold : COLORS.textMuted}
          />
        </View>

        {/* Time selector - only show if category is enabled and has a time setting */}
        {isEnabled && timeKey && (
          <TouchableOpacity
            style={styles.timeSelector}
            onPress={() => openTimePicker(timeKey)}
          >
            <Clock size={16} color={COLORS.textMuted} />
            <Text style={styles.timeText}>{time}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render time picker modal (iOS)
  const renderTimePickerModal = () => {
    if (Platform.OS !== 'ios' || !showTimePicker) return null;

    const getTimePickerTitle = () => {
      switch (timePickerType) {
        case 'morning': return 'Giờ buổi sáng';
        case 'midday': return 'Giờ buổi trưa';
        case 'evening': return 'Giờ buổi tối';
        case 'dnd_start': return 'Bắt đầu Không làm phiền';
        case 'dnd_end': return 'Kết thúc Không làm phiền';
        default: return 'Chọn giờ';
      }
    };

    return (
      <Modal
        visible={showTimePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.timePickerOverlay}>
          <View style={styles.timePickerContainer}>
            <View style={styles.timePickerHeader}>
              <Text style={styles.timePickerTitle}>{getTimePickerTitle()}</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <X size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <DateTimePicker
              value={tempTime}
              mode="time"
              display="spinner"
              onChange={handleTimeChange}
              textColor={COLORS.textPrimary}
              style={styles.timePicker}
            />

            <View style={styles.timePickerButtons}>
              <TouchableOpacity
                style={styles.timePickerCancelButton}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.timePickerCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timePickerConfirmButton}
                onPress={() => saveTimeChange()}
              >
                <LinearGradient
                  colors={GRADIENTS.primaryButton}
                  style={styles.timePickerConfirmGradient}
                >
                  <Text style={styles.timePickerConfirmText}>Xác nhận</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cài Đặt Thông Báo</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Master Toggle */}
          <View style={styles.section}>
            <View style={styles.masterToggle}>
              <View style={styles.masterLeft}>
                <Bell size={24} color={COLORS.gold} />
                <View style={styles.masterContent}>
                  <Text style={styles.masterLabel}>Push Notifications</Text>
                  <Text style={styles.masterDesc}>Bật/tắt tất cả thông báo</Text>
                </View>
              </View>
              <Switch
                value={settings.push_enabled}
                onValueChange={(value) => handleToggle('push_enabled', value)}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: `${COLORS.gold}50` }}
                thumbColor={settings.push_enabled ? COLORS.gold : COLORS.textMuted}
              />
            </View>
          </View>

          {/* ═══════════════════════════════════════════ */}
          {/* WIDGET NOTIFICATIONS - Smart Reminders */}
          {/* ═══════════════════════════════════════════ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nhắc nhở thông minh</Text>
            <Text style={styles.sectionSubtitle}>
              Thông báo dựa trên Dashboard widgets của bạn
            </Text>

            {/* Widget Master Toggle */}
            <View style={styles.widgetMasterToggle}>
              <View style={styles.masterLeft}>
                <View style={styles.widgetIconGradient}>
                  <Bell size={22} color={COLORS.bgMid} />
                </View>
                <View style={styles.masterContent}>
                  <Text style={styles.masterLabel}>Widget Notifications</Text>
                  <Text style={styles.masterDesc}>
                    {widgetSettings.enabled ? 'Đang bật' : 'Đã tắt'}
                  </Text>
                </View>
              </View>
              <Switch
                value={widgetSettings.enabled}
                onValueChange={handleWidgetMasterToggle}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: `${COLORS.gold}50` }}
                thumbColor={widgetSettings.enabled ? COLORS.gold : COLORS.textMuted}
              />
            </View>

            {/* Widget Categories */}
            {widgetSettings.enabled && (
              <View style={styles.widgetCategoriesCard}>
                {renderWidgetCategory(
                  'morning_affirmations',
                  'Morning Affirmations',
                  'Bắt đầu ngày mới với năng lượng tích cực',
                  Sun,
                  'morning',
                  COLORS.gold
                )}
                {renderWidgetCategory(
                  'midday_checkin',
                  'Midday Check-in',
                  'Nhắc nhở kiểm tra tiến độ mục tiêu',
                  CheckCircle2,
                  'midday',
                  COLORS.cyan
                )}
                {renderWidgetCategory(
                  'evening_visualization',
                  'Evening Visualization',
                  'Kết thúc ngày với thiền định và suy tư',
                  Moon,
                  'evening',
                  COLORS.purple
                )}
                {renderWidgetCategory(
                  'milestone_celebrations',
                  'Milestone Celebrations',
                  'Ăn mừng khi đạt cột mốc quan trọng',
                  Trophy,
                  null, // No time setting for milestones
                  COLORS.success
                )}
              </View>
            )}

            {/* Do Not Disturb */}
            {widgetSettings.enabled && (
              <View style={styles.dndCard}>
                <View style={styles.dndHeader}>
                  <View style={styles.dndLeft}>
                    <View style={[styles.settingIcon, { backgroundColor: 'rgba(255, 107, 107, 0.15)' }]}>
                      <BellOff size={20} color={COLORS.error} />
                    </View>
                    <View style={styles.settingContent}>
                      <Text style={styles.settingLabel}>Không làm phiền</Text>
                      <Text style={styles.settingDesc}>Tắt thông báo trong khung giờ này</Text>
                    </View>
                  </View>
                  <Switch
                    value={widgetSettings.do_not_disturb.enabled}
                    onValueChange={handleDNDToggle}
                    trackColor={{ false: 'rgba(255,255,255,0.1)', true: `${COLORS.error}50` }}
                    thumbColor={widgetSettings.do_not_disturb.enabled ? COLORS.error : COLORS.textMuted}
                  />
                </View>

                {widgetSettings.do_not_disturb.enabled && (
                  <View style={styles.dndTimeRow}>
                    <TouchableOpacity
                      style={styles.dndTimeButton}
                      onPress={() => openTimePicker('dnd_start')}
                    >
                      <Text style={styles.dndTimeLabel}>Từ</Text>
                      <Text style={styles.dndTimeValue}>{widgetSettings.do_not_disturb.start}</Text>
                    </TouchableOpacity>
                    <View style={styles.dndTimeSeparator}>
                      <Text style={styles.dndTimeSeparatorText}>→</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.dndTimeButton}
                      onPress={() => openTimePicker('dnd_end')}
                    >
                      <Text style={styles.dndTimeLabel}>Đến</Text>
                      <Text style={styles.dndTimeValue}>{widgetSettings.do_not_disturb.end}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Trading Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trading</Text>
            <View style={styles.sectionCard}>
              {renderToggle(
                'trading_pattern',
                'Pattern Alerts',
                'Thông báo khi phát hiện pattern mới',
                TrendingUp,
                COLORS.success
              )}
              {renderToggle(
                'trading_price',
                'Price Alerts',
                'Thông báo khi giá đạt mục tiêu',
                TrendingUp,
                COLORS.cyan
              )}
            </View>
          </View>

          {/* Paper Trading Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Paper Trading</Text>
            <View style={styles.sectionCard}>
              {renderToggle(
                'paper_order_filled',
                'Lệnh đã khớp',
                'Thông báo khi lệnh chờ được khớp',
                CheckCircle2,
                COLORS.success
              )}
              {renderToggle(
                'paper_tp_hit',
                'Chốt lời (TP)',
                'Thông báo khi vị thế chạm Take Profit',
                Target,
                COLORS.gold
              )}
              {renderToggle(
                'paper_sl_hit',
                'Cắt lỗ (SL)',
                'Thông báo khi vị thế chạm Stop Loss',
                XCircle,
                COLORS.error
              )}
              {renderToggle(
                'paper_position_closed',
                'Đóng vị thế',
                'Thông báo khi vị thế được đóng',
                DollarSign,
                COLORS.cyan
              )}
              {renderToggle(
                'paper_liquidation_warning',
                'Cảnh báo thanh lý',
                'Cảnh báo khi vị thế gần bị thanh lý',
                ShieldAlert,
                COLORS.warning
              )}
              {renderToggle(
                'paper_order_cancelled',
                'Lệnh đã hủy',
                'Thông báo khi lệnh chờ bị hủy',
                AlertTriangle,
                COLORS.textMuted
              )}
            </View>
          </View>

          {/* Community Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cộng Đồng</Text>
            <View style={styles.sectionCard}>
              {renderToggle(
                'community_comment',
                'Bình luận',
                'Ai đó bình luận bài viết của bạn',
                MessageCircle,
                COLORS.info
              )}
              {renderToggle(
                'community_like',
                'Lượt thích',
                'Ai đó thích bài viết của bạn',
                MessageCircle,
                COLORS.error
              )}
              {renderToggle(
                'community_follow',
                'Người theo dõi',
                'Ai đó theo dõi bạn',
                Users,
                COLORS.purple
              )}
            </View>
          </View>

          {/* Affiliate Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Affiliate</Text>
            <View style={styles.sectionCard}>
              {renderToggle(
                'affiliate_referral',
                'Giới thiệu mới',
                'Có người đăng ký qua link của bạn',
                Gift,
                COLORS.gold
              )}
              {renderToggle(
                'affiliate_commission',
                'Hoa hồng',
                'Nhận được hoa hồng từ đơn hàng',
                Gift,
                COLORS.success
              )}
            </View>
          </View>

          {/* Order Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Đơn Hàng</Text>
            <View style={styles.sectionCard}>
              {renderToggle(
                'orders_status',
                'Trạng thái đơn',
                'Cập nhật trạng thái đơn hàng',
                Package,
                COLORS.purple
              )}
              {renderToggle(
                'orders_delivery',
                'Giao hàng',
                'Đơn hàng đang được giao',
                Package,
                COLORS.success
              )}
            </View>
          </View>

          {/* Shop Notifications (V2) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shop</Text>
            <View style={styles.sectionCard}>
              {renderToggle(
                'shop_flash_sale',
                'Flash Sale',
                'Thông báo khi Flash Sale bắt đầu',
                Zap,
                COLORS.warning
              )}
              {renderToggle(
                'shop_wishlist_price_drop',
                'Giảm giá Wishlist',
                'Thông báo khi sản phẩm yêu thích giảm giá',
                Heart,
                COLORS.error
              )}
              {renderToggle(
                'shop_back_in_stock',
                'Có hàng trở lại',
                'Thông báo khi sản phẩm hết hàng có lại',
                ShoppingBag,
                COLORS.success
              )}
              {renderToggle(
                'shop_promo_offers',
                'Khuyến mãi Shop',
                'Nhận thông tin khuyến mãi từ Shop',
                Tag,
                COLORS.gold
              )}
            </View>
          </View>

          {/* Email Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Email</Text>
            <View style={styles.sectionCard}>
              {renderToggle(
                'email_weekly',
                'Báo cáo tuần',
                'Nhận email tổng kết hàng tuần',
                Mail,
                COLORS.info
              )}
              {renderToggle(
                'email_marketing',
                'Khuyến mãi',
                'Nhận thông tin ưu đãi và khuyến mãi',
                Mail,
                COLORS.gold
              )}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Time Picker Modal (iOS) */}
        {renderTimePickerModal()}

        {/* Time Picker (Android) */}
        {Platform.OS === 'android' && showTimePicker && (
          <DateTimePicker
            value={tempTime}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleTimeChange}
          />
        )}
        {AlertComponent}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },

  // Section
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
    marginBottom: SPACING.sm,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: GLASS.background,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },

  // Master Toggle
  masterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GLASS.background,
    borderRadius: 14,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  masterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  masterContent: {
    marginLeft: SPACING.md,
  },
  masterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  masterDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  settingDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Section subtitle
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    marginLeft: 4,
  },

  // Widget Master Toggle
  widgetMasterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GLASS.background,
    borderRadius: 14,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    marginBottom: SPACING.md,
  },
  widgetIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Widget Categories Card
  widgetCategoriesCard: {
    backgroundColor: GLASS.background,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
    marginBottom: SPACING.md,
  },
  widgetCategoryItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  widgetCategoryMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },

  // Time Selector
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 8,
    gap: SPACING.sm,
    alignSelf: 'flex-start',
    marginLeft: 56,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
  },

  // Do Not Disturb Card
  dndCard: {
    backgroundColor: GLASS.background,
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  dndHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dndLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dndTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    gap: SPACING.md,
  },
  dndTimeButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 10,
    padding: SPACING.md,
    alignItems: 'center',
  },
  dndTimeLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  dndTimeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.error,
  },
  dndTimeSeparator: {
    paddingHorizontal: SPACING.sm,
  },
  dndTimeSeparatorText: {
    fontSize: 18,
    color: COLORS.textMuted,
  },

  // Time Picker Modal (iOS)
  timePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  timePickerContainer: {
    backgroundColor: COLORS.bgMid,
    borderRadius: 20,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
  },
  timePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  timePicker: {
    height: 200,
  },
  timePickerButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  timePickerCancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
  },
  timePickerCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  timePickerConfirmButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  timePickerConfirmGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  timePickerConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
