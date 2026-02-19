/**
 * Gemral - Push Editor Screen
 * Tạo và chỉnh sửa push notification
 * @description Admin UI cho push notification scheduling
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import {
  ChevronLeft,
  Bell,
  Send,
  Clock,
  Calendar,
  Users,
  Link,
  Eye,
  Edit3,
  Zap,
  Copy,
  Check,
  AlertCircle,
  ChevronDown,
  Repeat,
  Beaker,
  Save,
} from 'lucide-react-native';

// Services
import notificationService from '../../services/notificationService';

// Components
import { PushPreview, TemplateCard } from '../../components/Admin';

// Theme
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS, INPUT } from '../../utils/tokens';
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';

// ========== CONSTANTS ==========
const SEGMENTS = [
  { id: 'all', label: 'Tất cả', icon: Users, description: 'Gửi cho tất cả người dùng' },
  { id: 'traders', label: 'Traders', icon: Zap, description: 'Người quan tâm trading' },
  { id: 'spiritual', label: 'Tâm linh', icon: Bell, description: 'Người quan tâm tâm linh' },
  { id: 'tier1_plus', label: 'Tier 1+', icon: Users, description: 'Người dùng đã nâng cấp' },
  { id: 'inactive_3d', label: 'Inactive 3D', icon: Clock, description: '3 ngày không hoạt động' },
];

const DEEP_LINK_PRESETS = [
  { id: '/gemmaster', label: 'GEM Master', description: 'Mở GEM Master chatbot' },
  { id: '/scanner', label: 'Scanner', description: 'Mở Pattern Scanner' },
  { id: '/tarot', label: 'Tarot', description: 'Mở Tarot reading' },
  { id: '/iching', label: 'I Ching', description: 'Mở I Ching reading' },
  { id: '/shop', label: 'Shop', description: 'Mở trang Shop' },
  { id: '/visionboard', label: 'Vision Board', description: 'Mở Vision Board' },
];

const SCHEDULE_OPTIONS = [
  { id: 'now', label: 'Gửi ngay', icon: Send },
  { id: 'schedule', label: 'Lên lịch', icon: Clock },
  { id: 'recurring', label: 'Định kỳ', icon: Repeat },
];

// ========== TAB COMPONENT ==========
const TabBar = ({ activeTab, onChange }) => (
  <View style={styles.tabBar}>
    <TouchableOpacity
      style={[styles.tab, activeTab === 'editor' && styles.tabActive]}
      onPress={() => onChange('editor')}
    >
      <Edit3 size={16} color={activeTab === 'editor' ? COLORS.gold : COLORS.textMuted} />
      <Text style={[styles.tabText, activeTab === 'editor' && styles.tabTextActive]}>
        Soạn thảo
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.tab, activeTab === 'preview' && styles.tabActive]}
      onPress={() => onChange('preview')}
    >
      <Eye size={16} color={activeTab === 'preview' ? COLORS.gold : COLORS.textMuted} />
      <Text style={[styles.tabText, activeTab === 'preview' && styles.tabTextActive]}>
        Xem trước
      </Text>
    </TouchableOpacity>
  </View>
);

// ========== TEMPLATE SELECTOR ==========
const TemplateSelector = ({ visible, onClose, onSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadTemplates();
    }
  }, [visible]);

  const loadTemplates = async () => {
    setLoading(true);
    const result = await notificationService.getTemplates(null, 'push');
    if (result.success) {
      setTemplates(result.data || []);
    }
    setLoading(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.templateModal}>
          <View style={styles.templateModalHeader}>
            <Text style={styles.templateModalTitle}>Chọn Template</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>Đóng</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.gold} style={{ padding: 40 }} />
          ) : (
            <ScrollView style={styles.templateList}>
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  type="push"
                  compact
                  onUse={() => {
                    onSelect(template);
                    onClose();
                  }}
                  showActions={false}
                  showStats={false}
                  style={styles.templateItem}
                />
              ))}
              {templates.length === 0 && (
                <Text style={styles.noTemplatesText}>Chưa có template nào</Text>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

// ========== MAIN COMPONENT ==========
const PushEditorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { mode, notificationId, templateId } = route.params || {};
  const { alert, AlertComponent } = useCustomAlert();

  const isEditMode = mode === 'edit' && notificationId;

  // UI State
  const [activeTab, setActiveTab] = useState('editor');
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showDeepLinkPicker, setShowDeepLinkPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [segment, setSegment] = useState('all');
  const [scheduleType, setScheduleType] = useState('schedule');
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState([]);
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [abVariantB, setAbVariantB] = useState({ title: '', body: '' });
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  // Reach estimate
  const [reach, setReach] = useState(0);

  // ========== EFFECTS ==========
  useEffect(() => {
    if (isEditMode) {
      loadNotification();
    } else if (templateId) {
      loadTemplate();
    }
  }, [notificationId, templateId]);

  // Rule 31: Recovery listener for app resume
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[PushEditor] Force refresh received');
      setLoading(false);
      setSaving(false);
      if (isEditMode) {
        setTimeout(() => loadNotification(), 50); // Rule 57: Break React 18 batch
      }
    });
    return () => listener.remove();
  }, []);

  useEffect(() => {
    calculateReach();
  }, [segment]);

  // ========== LOAD DATA ==========
  const loadNotification = async () => {
    try {
      setLoading(true);
      const result = await notificationService.getScheduledNotifications({
        id: notificationId,
      });

      if (!result.success || !result.data?.length) {
        throw new Error('Không tìm thấy thông báo');
      }

      const data = result.data[0];
      setTitle(data.title || '');
      setBody(data.body || '');
      setDeepLink(data.deep_link || '');
      setSegment(data.segment || 'all');

      if (data.scheduled_at) {
        const date = new Date(data.scheduled_at);
        setScheduledDate(date);
        setScheduledTime(date);
      }

      if (data.ab_test_enabled && data.ab_variants?.B) {
        setAbTestEnabled(true);
        setAbVariantB(data.ab_variants.B);
      }
    } catch (err) {
      alert({
        type: 'error',
        title: 'Lỗi',
        message: err?.message || 'Không thể tải thông báo',
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = async () => {
    try {
      const result = await notificationService.getTemplates(null, 'push');
      if (result.success) {
        const template = result.data?.find((t) => t.id === templateId);
        if (template) {
          setTitle(template.title_template || '');
          setBody(template.body_template || '');
          setDeepLink(template.deep_link_template || '');
          if (template.default_segment) setSegment(template.default_segment);
        }
      }
    } catch (err) {
      console.error('[PushEditor] Load template error:', err);
    }
  };

  const calculateReach = async () => {
    const result = await notificationService.calculateReach(segment);
    if (result.success) {
      setReach(result.data?.count || 0);
    }
  };

  // ========== HANDLERS ==========
  const handleTemplateSelect = (template) => {
    setTitle(template.title_template || '');
    setBody(template.body_template || '');
    setDeepLink(template.deep_link_template || '');
    if (template.default_segment) setSegment(template.default_segment);
  };

  const handleDeepLinkSelect = (preset) => {
    setDeepLink(preset.id);
    setShowDeepLinkPicker(false);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setScheduledDate(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setScheduledTime(selectedTime);
    }
  };

  const handleSendTest = async () => {
    if (!title.trim() || !body.trim()) {
      alert({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập tiêu đề và nội dung' });
      return;
    }

    setSendingTest(true);
    const result = await notificationService.sendTest({
      title: title.trim(),
      body: body.trim(),
      data: { deep_link: deepLink },
    });
    setSendingTest(false);

    if (result.success) {
      alert({ type: 'success', title: 'Thành công', message: 'Đã gửi thông báo test về thiết bị của bạn' });
    } else {
      alert({ type: 'error', title: 'Lỗi', message: result.error || 'Không thể gửi test' });
    }
  };

  const handleSave = async (andSend = false) => {
    // Validation
    if (!title.trim()) {
      alert({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập tiêu đề' });
      return;
    }
    if (!body.trim()) {
      alert({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập nội dung' });
      return;
    }
    if (title.length > 60) {
      alert({ type: 'error', title: 'Lỗi', message: 'Tiêu đề tối đa 60 ký tự' });
      return;
    }
    if (body.length > 150) {
      alert({ type: 'error', title: 'Lỗi', message: 'Nội dung tối đa 150 ký tự' });
      return;
    }

    setSaving(true);

    try {
      // Build scheduled_at
      const scheduled = new Date(scheduledDate);
      scheduled.setHours(scheduledTime.getHours(), scheduledTime.getMinutes(), 0, 0);

      // Build data
      const data = {
        title: title.trim(),
        body: body.trim(),
        deep_link: deepLink.trim() || null,
        segment,
        scheduled_at: scheduleType === 'now' ? new Date().toISOString() : scheduled.toISOString(),
        is_recurring: isRecurring,
        recurrence_rule: isRecurring ? { pattern: 'daily', days: recurringDays } : null,
        ab_test_enabled: abTestEnabled,
        ab_variants: abTestEnabled
          ? { A: { title: title.trim(), body: body.trim() }, B: abVariantB }
          : null,
        status: andSend && scheduleType === 'now' ? 'scheduled' : 'draft',
      };

      let result;
      if (isEditMode) {
        result = await notificationService.updateScheduledNotification(notificationId, data);
      } else {
        result = await notificationService.createScheduledNotification(data);
      }

      if (!result.success) {
        throw new Error(result.error);
      }

      // Save as template if checked
      if (saveAsTemplate && templateName.trim()) {
        await notificationService.createTemplate({
          name: templateName.trim(),
          type: 'push',
          title_template: title.trim(),
          body_template: body.trim(),
          deep_link_template: deepLink.trim() || null,
          default_segment: segment,
        });
      }

      // If send now, trigger immediately
      if (andSend && scheduleType === 'now' && result.data?.id) {
        await notificationService.sendNow(result.data.id);
      }

      alert({
        type: 'success',
        title: 'Thành công',
        message: andSend
          ? scheduleType === 'now'
            ? 'Đã gửi thông báo'
            : 'Đã lên lịch gửi thông báo'
          : 'Đã lưu nháp',
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
      });
    } catch (err) {
      alert({ type: 'error', title: 'Lỗi', message: err?.message || 'Không thể lưu' });
    } finally {
      setSaving(false);
    }
  };

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ========== RENDER EDITOR ==========
  const renderEditor = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Template Selector */}
      <TouchableOpacity
        style={styles.templateButton}
        onPress={() => setShowTemplateSelector(true)}
      >
        <Copy size={18} color={COLORS.gold} />
        <Text style={styles.templateButtonText}>Chọn Template</Text>
      </TouchableOpacity>

      {/* Title */}
      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Text style={styles.sectionTitle}>Tiêu đề *</Text>
          <Text style={[styles.charCount, title.length > 60 && styles.charCountOver]}>
            {title.length}/60
          </Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Nhập tiêu đề thông báo..."
          placeholderTextColor={COLORS.textMuted}
          value={title}
          onChangeText={setTitle}
          maxLength={60}
        />
      </View>

      {/* Body */}
      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Text style={styles.sectionTitle}>Nội dung *</Text>
          <Text style={[styles.charCount, body.length > 150 && styles.charCountOver]}>
            {body.length}/150
          </Text>
        </View>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Nhập nội dung thông báo..."
          placeholderTextColor={COLORS.textMuted}
          value={body}
          onChangeText={setBody}
          maxLength={150}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Deep Link */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Deep Link</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowDeepLinkPicker(true)}
        >
          <Link size={18} color={COLORS.gold} />
          <Text style={styles.dropdownText}>
            {deepLink || 'Chọn màn hình đích...'}
          </Text>
          <ChevronDown size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Segment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Đối tượng nhận</Text>
        <View style={styles.segmentGrid}>
          {SEGMENTS.map((seg) => {
            const isSelected = segment === seg.id;
            return (
              <TouchableOpacity
                key={seg.id}
                style={[styles.segmentChip, isSelected && styles.segmentChipActive]}
                onPress={() => setSegment(seg.id)}
              >
                <seg.icon size={16} color={isSelected ? COLORS.bgDarkest : COLORS.textSecondary} />
                <Text style={[styles.segmentChipText, isSelected && styles.segmentChipTextActive]}>
                  {seg.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.reachText}>
          Ước tính: {reach.toLocaleString()} người nhận
        </Text>
      </View>

      {/* Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lịch gửi</Text>
        <View style={styles.scheduleOptions}>
          {SCHEDULE_OPTIONS.map((opt) => {
            const isSelected = scheduleType === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.scheduleOption, isSelected && styles.scheduleOptionActive]}
                onPress={() => setScheduleType(opt.id)}
              >
                <opt.icon size={16} color={isSelected ? COLORS.bgDarkest : COLORS.textSecondary} />
                <Text style={[styles.scheduleOptionText, isSelected && styles.scheduleOptionTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {scheduleType !== 'now' && (
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={18} color={COLORS.gold} />
              <Text style={styles.dateTimeText}>
                {scheduledDate.toLocaleDateString('vi-VN')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Clock size={18} color={COLORS.gold} />
              <Text style={styles.dateTimeText}>
                {scheduledTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* A/B Test */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setAbTestEnabled(!abTestEnabled)}
        >
          <View style={styles.toggleLeft}>
            <Beaker size={18} color={COLORS.purple} />
            <Text style={styles.toggleLabel}>A/B Testing</Text>
          </View>
          <View style={[styles.toggle, abTestEnabled && styles.toggleActive]}>
            <View style={[styles.toggleKnob, abTestEnabled && styles.toggleKnobActive]} />
          </View>
        </TouchableOpacity>

        {abTestEnabled && (
          <View style={styles.abVariantBox}>
            <Text style={styles.abVariantLabel}>Variant B</Text>
            <TextInput
              style={styles.input}
              placeholder="Tiêu đề variant B..."
              placeholderTextColor={COLORS.textMuted}
              value={abVariantB.title}
              onChangeText={(text) => setAbVariantB({ ...abVariantB, title: text })}
              maxLength={60}
            />
            <TextInput
              style={[styles.input, styles.textArea, { marginTop: SPACING.sm }]}
              placeholder="Nội dung variant B..."
              placeholderTextColor={COLORS.textMuted}
              value={abVariantB.body}
              onChangeText={(text) => setAbVariantB({ ...abVariantB, body: text })}
              maxLength={150}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        )}
      </View>

      {/* Save as Template */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setSaveAsTemplate(!saveAsTemplate)}
        >
          <View style={styles.toggleLeft}>
            <Save size={18} color={COLORS.cyan} />
            <Text style={styles.toggleLabel}>Lưu làm Template</Text>
          </View>
          <View style={[styles.toggle, saveAsTemplate && styles.toggleActive]}>
            <View style={[styles.toggleKnob, saveAsTemplate && styles.toggleKnobActive]} />
          </View>
        </TouchableOpacity>

        {saveAsTemplate && (
          <TextInput
            style={[styles.input, { marginTop: SPACING.sm }]}
            placeholder="Tên template..."
            placeholderTextColor={COLORS.textMuted}
            value={templateName}
            onChangeText={setTemplateName}
          />
        )}
      </View>

      {/* Spacer */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  // ========== RENDER PREVIEW ==========
  const renderPreview = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.previewContent}
      showsVerticalScrollIndicator={false}
    >
      <PushPreview
        title={title}
        body={body}
        showDeviceToggle
      />

      {abTestEnabled && (
        <>
          <Text style={styles.variantLabel}>Variant B Preview:</Text>
          <PushPreview
            title={abVariantB.title || title}
            body={abVariantB.body || body}
            showDeviceToggle={false}
          />
        </>
      )}
    </ScrollView>
  );

  // ========== MAIN RENDER ==========
  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Chỉnh sửa Push' : 'Tạo Push mới'}
          </Text>
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleSendTest}
            disabled={sendingTest}
          >
            {sendingTest ? (
              <ActivityIndicator size="small" color={COLORS.gold} />
            ) : (
              <Beaker size={20} color={COLORS.gold} />
            )}
          </TouchableOpacity>
        </View>

        {/* Tab Bar */}
        <TabBar activeTab={activeTab} onChange={setActiveTab} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          {activeTab === 'editor' ? renderEditor() : renderPreview()}
        </KeyboardAvoidingView>

        {/* Action Buttons */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => handleSave(false)}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.textPrimary} />
            ) : (
              <>
                <Save size={20} color={COLORS.textPrimary} />
                <Text style={styles.saveButtonText}>Lưu nháp</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => handleSave(true)}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.bgDarkest} />
            ) : (
              <>
                <Send size={20} color={COLORS.bgDarkest} />
                <Text style={styles.sendButtonText}>
                  {scheduleType === 'now' ? 'Gửi ngay' : 'Lên lịch'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Template Selector Modal */}
        <TemplateSelector
          visible={showTemplateSelector}
          onClose={() => setShowTemplateSelector(false)}
          onSelect={handleTemplateSelect}
        />

        {/* Deep Link Picker Modal */}
        <Modal
          visible={showDeepLinkPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeepLinkPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDeepLinkPicker(false)}
          >
            <View style={styles.pickerModal}>
              <Text style={styles.pickerTitle}>Chọn Deep Link</Text>
              {DEEP_LINK_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={styles.pickerItem}
                  onPress={() => handleDeepLinkSelect(preset)}
                >
                  <Text style={styles.pickerItemLabel}>{preset.label}</Text>
                  <Text style={styles.pickerItemDesc}>{preset.id}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.pickerItem, styles.pickerItemClear]}
                onPress={() => { setDeepLink(''); setShowDeepLinkPicker(false); }}
              >
                <Text style={styles.pickerItemClearText}>Xóa deep link</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Date/Time Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={scheduledDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={scheduledTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}

        {/* Alert Component */}
        {AlertComponent}
      </SafeAreaView>
    </LinearGradient>
  );
};

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: { padding: SPACING.xs },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  testButton: { padding: SPACING.xs },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: SPACING.sm,
    padding: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.sm - 2,
    gap: SPACING.xs,
  },
  tabActive: { backgroundColor: 'rgba(255,189,89,0.2)' },
  tabText: { fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.textMuted },
  tabTextActive: { color: COLORS.gold, fontWeight: TYPOGRAPHY.fontWeight.semibold },

  scrollView: { flex: 1 },
  scrollContent: { padding: SPACING.lg },
  previewContent: { padding: SPACING.lg, alignItems: 'center' },

  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,189,89,0.1)',
    paddingVertical: SPACING.md,
    borderRadius: SPACING.sm,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,189,89,0.3)',
    borderStyle: 'dashed',
  },
  templateButtonText: { fontSize: TYPOGRAPHY.fontSize.xxl, color: COLORS.gold },

  section: { marginBottom: SPACING.lg },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  charCount: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.success },
  charCountOver: { color: COLORS.error },

  input: {
    backgroundColor: INPUT.background,
    borderRadius: INPUT.borderRadius,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xxl,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },

  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT.background,
    borderRadius: INPUT.borderRadius,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  dropdownText: { flex: 1, fontSize: TYPOGRAPHY.fontSize.xxl, color: COLORS.textPrimary },

  segmentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  segmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.sm,
    gap: SPACING.xs,
  },
  segmentChipActive: { backgroundColor: COLORS.gold },
  segmentChipText: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textSecondary },
  segmentChipTextActive: { color: COLORS.bgDarkest, fontWeight: TYPOGRAPHY.fontWeight.semibold },
  reachText: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.cyan, marginTop: SPACING.sm },

  scheduleOptions: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  scheduleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.sm,
    gap: SPACING.xs,
  },
  scheduleOptionActive: { backgroundColor: COLORS.gold },
  scheduleOptionText: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textSecondary },
  scheduleOptionTextActive: { color: COLORS.bgDarkest, fontWeight: TYPOGRAPHY.fontWeight.semibold },

  dateTimeRow: { flexDirection: 'row', gap: SPACING.md },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT.background,
    borderRadius: INPUT.borderRadius,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  dateTimeText: { fontSize: TYPOGRAPHY.fontSize.xxl, color: COLORS.textPrimary },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  toggleLabel: { fontSize: TYPOGRAPHY.fontSize.xxl, color: COLORS.textPrimary },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 2,
  },
  toggleActive: { backgroundColor: COLORS.success },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.textPrimary,
  },
  toggleKnobActive: { marginLeft: 22 },

  abVariantBox: {
    backgroundColor: 'rgba(138,100,255,0.1)',
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(138,100,255,0.3)',
  },
  abVariantLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.purple,
    marginBottom: SPACING.sm,
  },

  variantLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.purple,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },

  actionBar: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: COLORS.bgMid,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: SPACING.md,
    borderRadius: SPACING.sm,
    gap: SPACING.sm,
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: SPACING.sm,
    gap: SPACING.sm,
  },
  sendButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  templateModal: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: COLORS.bgMid,
    borderRadius: GLASS.borderRadius,
    overflow: 'hidden',
  },
  templateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  templateModalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  closeButton: { fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.gold },
  templateList: { padding: SPACING.md },
  templateItem: { marginBottom: SPACING.sm },
  noTemplatesText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    padding: SPACING.xl,
    fontSize: TYPOGRAPHY.fontSize.lg,
  },

  pickerModal: {
    width: '90%',
    backgroundColor: COLORS.bgMid,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
  },
  pickerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  pickerItem: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  pickerItemLabel: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  pickerItemDesc: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textMuted, marginTop: 2 },
  pickerItemClear: { borderBottomWidth: 0, marginTop: SPACING.sm },
  pickerItemClearText: { fontSize: TYPOGRAPHY.fontSize.xxl, color: COLORS.error },

  loadingText: { color: COLORS.textMuted, marginTop: SPACING.md, fontSize: TYPOGRAPHY.fontSize.lg },
});

export default PushEditorScreen;
