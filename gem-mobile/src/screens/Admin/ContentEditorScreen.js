/**
 * Gemral - Content Editor Screen
 * Tạo/Sửa nội dung cho Content Calendar
 * @description Form editor cho auto-post content
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import {
  ChevronLeft,
  Save,
  Send,
  Clock,
  Calendar,
  Hash,
  Link,
  Image,
  Film,
  FileText,
  Home,
  Facebook,
  Youtube,
  Instagram,
  Check,
} from 'lucide-react-native';

// Services
import {
  createContent,
  updateContent,
  getContentById,
  scheduleContent,
  PLATFORMS,
  CONTENT_TYPES,
  PILLARS,
} from '../../services/contentCalendarService';

// Theme
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS, INPUT } from '../../utils/tokens';

// ========== CONSTANTS ==========
const PLATFORM_OPTIONS = [
  { id: 'gemral', label: 'Gemral Feed', icon: Home },
  { id: 'facebook', label: 'Facebook', icon: Facebook },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'tiktok', label: 'TikTok', icon: Film },
  { id: 'threads', label: 'Threads', icon: FileText },
];

const CONTENT_TYPE_OPTIONS = [
  { id: 'post', label: 'Bài viết', icon: FileText },
  { id: 'video', label: 'Video', icon: Film },
  { id: 'short', label: 'Short/Reel', icon: Film },
  { id: 'story', label: 'Story', icon: Image },
];

const PILLAR_OPTIONS = [
  { id: 'spiritual', label: 'Tâm linh' },
  { id: 'trading', label: 'Trading' },
  { id: 'money', label: 'Tài chính' },
  { id: 'healing', label: 'Chữa lành' },
  { id: 'community', label: 'Cộng đồng' },
];

// ========== COMPONENT ==========
const ContentEditorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { mode, contentId } = route.params || {};
  const { alert, AlertComponent } = useCustomAlert();

  const isEditMode = mode === 'edit' && contentId;

  // ========== STATE ==========
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form data
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState('post');
  const [platform, setPlatform] = useState('gemral');
  const [pillar, setPillar] = useState(null);
  const [hashtags, setHashtags] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [mediaUrls, setMediaUrls] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Date/Time
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // ========== EFFECTS ==========
  useEffect(() => {
    if (isEditMode) {
      loadContent();
    }
  }, [contentId]);

  // ========== LOAD CONTENT ==========
  const loadContent = async () => {
    try {
      setLoading(true);
      const result = await getContentById(contentId);

      if (!result.success) {
        throw new Error(result.error);
      }

      const data = result.data;
      setTitle(data?.title || '');
      setContent(data?.content || '');
      setContentType(data?.content_type || 'post');
      setPlatform(data?.platform || 'gemral');
      setPillar(data?.pillar || null);
      setHashtags((data?.hashtags || []).join(', '));
      setLinkUrl(data?.link_url || '');
      setMediaUrls((data?.media_urls || []).join('\n'));
      setVideoUrl(data?.video_url || '');

      // Parse date/time
      if (data?.scheduled_date) {
        setScheduledDate(new Date(data.scheduled_date));
      }
      if (data?.scheduled_time) {
        const [hours, minutes] = data.scheduled_time.split(':');
        const timeDate = new Date();
        timeDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
        setScheduledTime(timeDate);
      }
    } catch (err) {
      console.error('[ContentEditor] Load error:', err);
      setError(err?.message || 'Không thể tải nội dung');
    } finally {
      setLoading(false);
    }
  };

  // ========== HANDLERS ==========
  const handleSave = async (andSchedule = false) => {
    try {
      // Validate
      if (!title.trim()) {
        alert({
          type: 'error',
          title: 'Lỗi',
          message: 'Vui lòng nhập tiêu đề'
        });
        return;
      }
      if (!content.trim()) {
        alert({
          type: 'error',
          title: 'Lỗi',
          message: 'Vui lòng nhập nội dung'
        });
        return;
      }

      setSaving(true);

      // Prepare data
      const formData = {
        title: title.trim(),
        content: content.trim(),
        content_type: contentType,
        platform,
        pillar,
        hashtags: hashtags.split(',').map((h) => h.trim()).filter(Boolean),
        link_url: linkUrl.trim() || null,
        media_urls: mediaUrls.split('\n').map((u) => u.trim()).filter(Boolean),
        video_url: videoUrl.trim() || null,
        scheduled_date: scheduledDate.toISOString().split('T')[0],
        scheduled_time: scheduledTime.toTimeString().split(' ')[0],
        status: andSchedule ? 'scheduled' : 'draft',
      };

      let result;
      if (isEditMode) {
        result = await updateContent(contentId, formData);
      } else {
        result = await createContent(formData);
      }

      if (!result.success) {
        throw new Error(result.error);
      }

      alert({
        type: 'success',
        title: 'Thành công',
        message: andSchedule ? 'Đã lên lịch đăng bài' : (isEditMode ? 'Đã cập nhật nội dung' : 'Đã tạo nội dung'),
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }]
      });
    } catch (err) {
      console.error('[ContentEditor] Save error:', err);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: err?.message || 'Không thể lưu nội dung'
      });
    } finally {
      setSaving(false);
    }
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

  // ========== RENDER HELPERS ==========
  const renderPlatformSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Platform</Text>
      <View style={styles.optionsRow}>
        {PLATFORM_OPTIONS.map((opt) => {
          const IconComponent = opt.icon;
          const isSelected = platform === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.optionChip, isSelected && styles.optionChipActive]}
              onPress={() => setPlatform(opt.id)}
            >
              <IconComponent size={16} color={isSelected ? COLORS.bgDarkest : COLORS.textSecondary} />
              <Text style={[styles.optionChipText, isSelected && styles.optionChipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderContentTypeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Loại nội dung</Text>
      <View style={styles.optionsRow}>
        {CONTENT_TYPE_OPTIONS.map((opt) => {
          const IconComponent = opt.icon;
          const isSelected = contentType === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.optionChip, isSelected && styles.optionChipActive]}
              onPress={() => setContentType(opt.id)}
            >
              <IconComponent size={16} color={isSelected ? COLORS.bgDarkest : COLORS.textSecondary} />
              <Text style={[styles.optionChipText, isSelected && styles.optionChipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderPillarSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Chủ đề (Pillar)</Text>
      <View style={styles.optionsRow}>
        {PILLAR_OPTIONS.map((opt) => {
          const isSelected = pillar === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.optionChip, isSelected && styles.optionChipActive]}
              onPress={() => setPillar(isSelected ? null : opt.id)}
            >
              {isSelected && <Check size={14} color={COLORS.bgDarkest} />}
              <Text style={[styles.optionChipText, isSelected && styles.optionChipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

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
            {isEditMode ? 'Chỉnh sửa' : 'Tạo nội dung'}
          </Text>
          <View style={styles.headerRight} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tiêu đề *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tiêu đề bài viết..."
                placeholderTextColor={COLORS.textMuted}
                value={title}
                onChangeText={setTitle}
                maxLength={255}
              />
            </View>

            {/* Content */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nội dung *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Nhập nội dung bài viết..."
                placeholderTextColor={COLORS.textMuted}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            {/* Platform Selector */}
            {renderPlatformSelector()}

            {/* Content Type Selector */}
            {renderContentTypeSelector()}

            {/* Pillar Selector */}
            {renderPillarSelector()}

            {/* Date/Time */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lịch đăng</Text>
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
            </View>

            {/* Hashtags */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hashtags</Text>
              <View style={styles.inputWithIcon}>
                <Hash size={18} color={COLORS.textMuted} />
                <TextInput
                  style={styles.inputIcon}
                  placeholder="Nhập hashtags, phân cách bằng dấu phẩy..."
                  placeholderTextColor={COLORS.textMuted}
                  value={hashtags}
                  onChangeText={setHashtags}
                />
              </View>
            </View>

            {/* Link URL */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Link URL</Text>
              <View style={styles.inputWithIcon}>
                <Link size={18} color={COLORS.textMuted} />
                <TextInput
                  style={styles.inputIcon}
                  placeholder="https://..."
                  placeholderTextColor={COLORS.textMuted}
                  value={linkUrl}
                  onChangeText={setLinkUrl}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Media URLs */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Media URLs</Text>
              <View style={styles.inputWithIcon}>
                <Image size={18} color={COLORS.textMuted} />
                <TextInput
                  style={[styles.inputIcon, styles.textArea]}
                  placeholder="URL hình ảnh (mỗi dòng 1 URL)..."
                  placeholderTextColor={COLORS.textMuted}
                  value={mediaUrls}
                  onChangeText={setMediaUrls}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Video URL */}
            {(contentType === 'video' || contentType === 'short') && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Video URL</Text>
                <View style={styles.inputWithIcon}>
                  <Film size={18} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.inputIcon}
                    placeholder="URL video..."
                    placeholderTextColor={COLORS.textMuted}
                    value={videoUrl}
                    onChangeText={setVideoUrl}
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            )}

            {/* Spacer */}
            <View style={{ height: 100 }} />
          </ScrollView>
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
            style={styles.scheduleButton}
            onPress={() => handleSave(true)}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.bgDarkest} />
            ) : (
              <>
                <Send size={20} color={COLORS.bgDarkest} />
                <Text style={styles.scheduleButtonText}>Lên lịch đăng</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

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
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: INPUT.background,
    borderRadius: INPUT.borderRadius,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xxl,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: INPUT.background,
    borderRadius: INPUT.borderRadius,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  inputIcon: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    padding: 0,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.sm,
    gap: SPACING.xs,
  },
  optionChipActive: {
    backgroundColor: COLORS.gold,
  },
  optionChipText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  optionChipTextActive: {
    color: COLORS.bgDarkest,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
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
  dateTimeText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    color: COLORS.textPrimary,
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
  scheduleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: SPACING.sm,
    gap: SPACING.sm,
  },
  scheduleButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
  },
  loadingText: {
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
});

export default ContentEditorScreen;
