/**
 * SMART FORM CARD
 * Dynamic form card that adapts based on widget type
 * Used for adding widgets to dashboard from readings/chat
 *
 * Sub-forms:
 * - StepsForm: Planning/action steps
 * - CrystalForm: Crystal recommendation
 * - AffirmationForm: Daily affirmation
 * - GoalForm: Goal with timeline
 * - ReadingForm: I Ching/Tarot summary
 * - ReminderForm: Reminder/alarm
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Plus,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  ListChecks,
  Gem,
  Heart,
  Target,
  Hexagon,
  Sparkles,
  Bell,
  Quote,
  Calendar,
  Clock,
  ShoppingCart,
} from 'lucide-react-native';

import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS, INPUT } from '../utils/tokens';
import { WIDGET_TYPES, getWidgetIcon, getWidgetColor } from '../utils/widgetTriggerDetector';
import { saveWidgetToVisionBoard } from '../services/gemMasterService';
import { supabase } from '../services/supabase';
import alertService from '../services/alertService';

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

const SmartFormCard = ({
  visible,
  widgetType,
  initialData = {},
  onSave,
  onCancel,
  onNavigateToShop,
}) => {
  const [formData, setFormData] = useState(initialData);
  const [expanded, setExpanded] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    if (visible) {
      setFormData(initialData);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, initialData]);

  if (!visible) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alertService.error('Lỗi', 'Bạn cần đăng nhập để lưu.');
        setIsSaving(false);
        return;
      }

      // Prepare widget data
      const widget = {
        type: widgetType,
        title: getTitle(),
        icon: getIconEmoji(),
        data: formData,
      };

      console.log('[SmartFormCard] Saving widget to VisionBoard:', widget.type, widget);

      // Save to database
      const result = await saveWidgetToVisionBoard(widget, user.id);

      if (result.success) {
        console.log('[SmartFormCard] Widget saved successfully:', result.widget?.id);
        // Call the onSave callback with the saved widget
        onSave?.({
          type: widgetType,
          data: formData,
          createdAt: Date.now(),
          savedWidget: result.widget,
        });
      } else {
        console.error('[SmartFormCard] Save failed:', result.error);
        alertService.error('Lỗi', 'Không thể lưu. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('[SmartFormCard] Save error:', error);
      alertService.error('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const getIconEmoji = () => {
    switch (widgetType) {
      case WIDGET_TYPES.STEPS: return '📋';
      case WIDGET_TYPES.CRYSTAL: return '💎';
      case WIDGET_TYPES.AFFIRMATION: return '💜';
      case WIDGET_TYPES.GOAL: return '🎯';
      case WIDGET_TYPES.ICHING: return '☯️';
      case WIDGET_TYPES.TAROT: return '🃏';
      case WIDGET_TYPES.REMINDER: return '⏰';
      case WIDGET_TYPES.QUOTE: return '💬';
      default: return '✨';
    }
  };

  const getIcon = () => {
    const iconName = getWidgetIcon(widgetType);
    const iconColor = getWidgetColor(widgetType);
    const iconProps = { size: 20, color: iconColor };

    switch (iconName) {
      case 'ListChecks': return <ListChecks {...iconProps} />;
      case 'Gem': return <Gem {...iconProps} />;
      case 'Heart': return <Heart {...iconProps} />;
      case 'Target': return <Target {...iconProps} />;
      case 'Hexagon': return <Hexagon {...iconProps} />;
      case 'Sparkles': return <Sparkles {...iconProps} />;
      case 'Bell': return <Bell {...iconProps} />;
      case 'Quote': return <Quote {...iconProps} />;
      default: return <Plus {...iconProps} />;
    }
  };

  const getTitle = () => {
    const titles = {
      [WIDGET_TYPES.STEPS]: 'Thêm bước hành động',
      [WIDGET_TYPES.CRYSTAL]: 'Thêm Crystal',
      [WIDGET_TYPES.AFFIRMATION]: 'Thêm Affirmation',
      [WIDGET_TYPES.GOAL]: 'Thêm mục tiêu',
      [WIDGET_TYPES.ICHING]: 'Lưu quẻ Dịch',
      [WIDGET_TYPES.TAROT]: 'Lưu trải bài',
      [WIDGET_TYPES.REMINDER]: 'Tạo nhắc nhở',
      [WIDGET_TYPES.QUOTE]: 'Lưu câu nói',
    };
    return titles[widgetType] || 'Thêm Widget';
  };

  const renderForm = () => {
    switch (widgetType) {
      case WIDGET_TYPES.STEPS:
        return (
          <StepsForm
            data={formData}
            onChange={setFormData}
          />
        );
      case WIDGET_TYPES.CRYSTAL:
        return (
          <CrystalForm
            data={formData}
            onChange={setFormData}
            onNavigateToShop={onNavigateToShop}
          />
        );
      case WIDGET_TYPES.AFFIRMATION:
        return (
          <AffirmationForm
            data={formData}
            onChange={setFormData}
          />
        );
      case WIDGET_TYPES.GOAL:
        return (
          <GoalForm
            data={formData}
            onChange={setFormData}
          />
        );
      case WIDGET_TYPES.ICHING:
      case WIDGET_TYPES.TAROT:
        return (
          <ReadingForm
            type={widgetType}
            data={formData}
            onChange={setFormData}
          />
        );
      case WIDGET_TYPES.REMINDER:
        return (
          <ReminderForm
            data={formData}
            onChange={setFormData}
          />
        );
      case WIDGET_TYPES.QUOTE:
        return (
          <QuoteForm
            data={formData}
            onChange={setFormData}
          />
        );
      default:
        return (
          <View style={styles.defaultForm}>
            <Text style={styles.formText}>Widget không xác định</Text>
          </View>
        );
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(15, 16, 48, 0.95)', 'rgba(15, 16, 48, 0.85)']}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {getIcon()}
            <Text style={styles.headerTitle}>{getTitle()}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => setExpanded(!expanded)}
              style={styles.expandButton}
            >
              {expanded ? (
                <ChevronUp size={20} color={COLORS.textSecondary} />
              ) : (
                <ChevronDown size={20} color={COLORS.textSecondary} />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Content */}
        {expanded && (
          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            {renderForm()}
          </ScrollView>
        )}

        {/* Footer Actions */}
        {expanded && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Huỷ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <LinearGradient
                colors={GRADIENTS.primaryButton}
                style={styles.saveButtonGradient}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={COLORS.textPrimary} />
                ) : (
                  <>
                    <Check size={18} color={COLORS.textPrimary} />
                    <Text style={styles.saveButtonText}>Lưu</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════
// SUB-FORMS
// ═══════════════════════════════════════════════════════════

// Steps Form - Action steps/planning
const StepsForm = ({ data, onChange }) => {
  const [steps, setSteps] = useState(data.steps || []);
  const [newStep, setNewStep] = useState('');
  const [title, setTitle] = useState(data.title || '');

  useEffect(() => {
    onChange({ ...data, steps, title });
  }, [steps, title]);

  const addStep = () => {
    if (newStep.trim()) {
      setSteps([
        ...steps,
        { number: steps.length + 1, text: newStep.trim(), completed: false }
      ]);
      setNewStep('');
    }
  };

  const removeStep = (index) => {
    const newSteps = steps.filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, number: i + 1 }));
    setSteps(newSteps);
  };

  const toggleStep = (index) => {
    const newSteps = [...steps];
    newSteps[index].completed = !newSteps[index].completed;
    setSteps(newSteps);
  };

  return (
    <View style={styles.subForm}>
      <Text style={styles.inputLabel}>Tiêu đề</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Ví dụ: Kế hoạch tháng này"
        placeholderTextColor={COLORS.textDisabled}
      />

      <Text style={[styles.inputLabel, { marginTop: SPACING.lg }]}>Các bước</Text>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepItem}>
          <TouchableOpacity
            style={styles.stepCheckbox}
            onPress={() => toggleStep(index)}
          >
            {step.completed ? (
              <Check size={16} color={COLORS.success} />
            ) : (
              <View style={styles.emptyCheckbox} />
            )}
          </TouchableOpacity>
          <Text
            style={[
              styles.stepText,
              step.completed && styles.stepTextCompleted
            ]}
            numberOfLines={2}
          >
            {step.number}. {step.text}
          </Text>
          <TouchableOpacity onPress={() => removeStep(index)}>
            <Trash2 size={16} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.addStepRow}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: SPACING.sm }]}
          value={newStep}
          onChangeText={setNewStep}
          placeholder="Thêm bước mới..."
          placeholderTextColor={COLORS.textDisabled}
          onSubmitEditing={addStep}
        />
        <TouchableOpacity style={styles.addStepButton} onPress={addStep}>
          <Plus size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Crystal Form
const CrystalForm = ({ data, onChange, onNavigateToShop }) => {
  const [crystalName, setCrystalName] = useState(data.vietnameseName || data.name || '');
  const [reason, setReason] = useState(data.reason || '');
  const [reminder, setReminder] = useState(data.reminder || false);

  useEffect(() => {
    onChange({
      ...data,
      name: data.name || crystalName,
      vietnameseName: crystalName,
      reason,
      reminder,
    });
  }, [crystalName, reason, reminder]);

  return (
    <View style={styles.subForm}>
      <Text style={styles.inputLabel}>Tên Crystal</Text>
      <TextInput
        style={styles.input}
        value={crystalName}
        onChangeText={setCrystalName}
        placeholder="Ví dụ: Thạch Anh Hồng"
        placeholderTextColor={COLORS.textDisabled}
      />

      <Text style={[styles.inputLabel, { marginTop: SPACING.lg }]}>Lý do sử dụng</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={reason}
        onChangeText={setReason}
        placeholder="Tại sao bạn muốn dùng crystal này?"
        placeholderTextColor={COLORS.textDisabled}
        multiline
        numberOfLines={3}
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Nhắc mang đá hàng ngày</Text>
        <Switch
          value={reminder}
          onValueChange={setReminder}
          trackColor={{ false: COLORS.inputBg, true: COLORS.purple }}
          thumbColor={reminder ? COLORS.cyan : COLORS.textMuted}
        />
      </View>

      {data.shopHandle && (
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => onNavigateToShop?.(data.shopHandle)}
        >
          <ShoppingCart size={18} color={COLORS.gold} />
          <Text style={styles.shopButtonText}>Xem trong Shop</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Affirmation Form
const AffirmationForm = ({ data, onChange }) => {
  const [affirmations, setAffirmations] = useState(data.affirmations || []);
  const [newAffirmation, setNewAffirmation] = useState('');
  const [dailyReminder, setDailyReminder] = useState(data.dailyReminder || false);
  const [reminderTime, setReminderTime] = useState(data.reminderTime || '08:00');

  useEffect(() => {
    onChange({ ...data, affirmations, dailyReminder, reminderTime });
  }, [affirmations, dailyReminder, reminderTime]);

  const addAffirmation = () => {
    if (newAffirmation.trim()) {
      setAffirmations([...affirmations, newAffirmation.trim()]);
      setNewAffirmation('');
    }
  };

  const removeAffirmation = (index) => {
    setAffirmations(affirmations.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.subForm}>
      <Text style={styles.inputLabel}>Affirmations</Text>
      {affirmations.map((aff, index) => (
        <View key={index} style={styles.affirmationItem}>
          <Heart size={14} color={COLORS.error} style={{ marginRight: SPACING.sm }} />
          <Text style={styles.affirmationText} numberOfLines={2}>
            {aff}
          </Text>
          <TouchableOpacity onPress={() => removeAffirmation(index)}>
            <X size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.addStepRow}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: SPACING.sm }]}
          value={newAffirmation}
          onChangeText={setNewAffirmation}
          placeholder="Thêm affirmation..."
          placeholderTextColor={COLORS.textDisabled}
          onSubmitEditing={addAffirmation}
        />
        <TouchableOpacity style={styles.addStepButton} onPress={addAffirmation}>
          <Plus size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.switchRow}>
        <View>
          <Text style={styles.switchLabel}>Nhắc hàng ngày</Text>
          {dailyReminder && (
            <Text style={styles.switchSubLabel}>Lúc {reminderTime}</Text>
          )}
        </View>
        <Switch
          value={dailyReminder}
          onValueChange={setDailyReminder}
          trackColor={{ false: COLORS.inputBg, true: COLORS.purple }}
          thumbColor={dailyReminder ? COLORS.cyan : COLORS.textMuted}
        />
      </View>

      {dailyReminder && (
        <View style={styles.timePickerRow}>
          <Clock size={18} color={COLORS.textSecondary} />
          <TextInput
            style={[styles.input, styles.timeInput]}
            value={reminderTime}
            onChangeText={setReminderTime}
            placeholder="08:00"
            placeholderTextColor={COLORS.textDisabled}
          />
        </View>
      )}
    </View>
  );
};

// Goal Form
const GoalForm = ({ data, onChange }) => {
  const [goalText, setGoalText] = useState(data.goalText || '');
  const [timeline, setTimeline] = useState(data.timeline || '7_days');
  const [notes, setNotes] = useState(data.notes || '');

  const TIMELINE_OPTIONS = [
    { value: '7_days', label: '7 ngày' },
    { value: '30_days', label: '30 ngày' },
    { value: '90_days', label: '90 ngày' },
    { value: '1_year', label: '1 năm' },
  ];

  useEffect(() => {
    onChange({ ...data, goalText, timeline, notes });
  }, [goalText, timeline, notes]);

  return (
    <View style={styles.subForm}>
      <Text style={styles.inputLabel}>Mục tiêu</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={goalText}
        onChangeText={setGoalText}
        placeholder="Mô tả mục tiêu của bạn..."
        placeholderTextColor={COLORS.textDisabled}
        multiline
        numberOfLines={3}
      />

      <Text style={[styles.inputLabel, { marginTop: SPACING.lg }]}>Thời gian</Text>
      <View style={styles.timelineRow}>
        {TIMELINE_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.timelineOption,
              timeline === option.value && styles.timelineOptionActive
            ]}
            onPress={() => setTimeline(option.value)}
          >
            <Text
              style={[
                styles.timelineOptionText,
                timeline === option.value && styles.timelineOptionTextActive
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.inputLabel, { marginTop: SPACING.lg }]}>Ghi chú</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Thêm ghi chú..."
        placeholderTextColor={COLORS.textDisabled}
        multiline
        numberOfLines={2}
      />
    </View>
  );
};

// Reading Form (I Ching / Tarot)
const ReadingForm = ({ type, data, onChange }) => {
  const [title, setTitle] = useState(data.title || '');
  const [notes, setNotes] = useState(data.notes || '');
  const [pinToDashboard, setPinToDashboard] = useState(data.pinToDashboard ?? true);

  useEffect(() => {
    onChange({ ...data, title, notes, pinToDashboard });
  }, [title, notes, pinToDashboard]);

  const isIChing = type === WIDGET_TYPES.ICHING;

  return (
    <View style={styles.subForm}>
      {/* Reading Preview */}
      <View style={styles.readingPreview}>
        {isIChing ? (
          <Hexagon size={24} color={COLORS.success} />
        ) : (
          <Sparkles size={24} color={COLORS.purple} />
        )}
        <View style={styles.readingPreviewText}>
          <Text style={styles.readingPreviewTitle}>
            {isIChing
              ? `Quẻ ${data.hexagramNumber}: ${data.hexagramName} (${data.chineseName || ''})`
              : data.cards?.map(c => c.vietnamese || c.name).join(' • ')
            }
          </Text>
          <Text style={styles.readingPreviewSubtitle}>
            {isIChing ? 'Kinh Dịch' : 'Tarot'} • {new Date().toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </View>

      <Text style={styles.inputLabel}>Tiêu đề lưu</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder={isIChing ? 'Ví dụ: Quyết định công việc' : 'Ví dụ: Tình yêu tháng 12'}
        placeholderTextColor={COLORS.textDisabled}
      />

      <Text style={[styles.inputLabel, { marginTop: SPACING.lg }]}>Ghi chú cá nhân</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Suy nghĩ của bạn về lần đọc này..."
        placeholderTextColor={COLORS.textDisabled}
        multiline
        numberOfLines={4}
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Ghim vào Dashboard</Text>
        <Switch
          value={pinToDashboard}
          onValueChange={setPinToDashboard}
          trackColor={{ false: COLORS.inputBg, true: COLORS.purple }}
          thumbColor={pinToDashboard ? COLORS.cyan : COLORS.textMuted}
        />
      </View>
    </View>
  );
};

// Reminder Form
const ReminderForm = ({ data, onChange }) => {
  const [reminderText, setReminderText] = useState(data.reminderText || '');
  const [frequency, setFrequency] = useState(data.frequency || 'daily');
  const [time, setTime] = useState(data.time || '09:00');

  const FREQUENCY_OPTIONS = [
    { value: 'once', label: 'Một lần' },
    { value: 'daily', label: 'Hàng ngày' },
    { value: 'weekly', label: 'Hàng tuần' },
  ];

  useEffect(() => {
    onChange({ ...data, reminderText, frequency, time });
  }, [reminderText, frequency, time]);

  return (
    <View style={styles.subForm}>
      <Text style={styles.inputLabel}>Nội dung nhắc nhở</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={reminderText}
        onChangeText={setReminderText}
        placeholder="Bạn muốn được nhắc điều gì?"
        placeholderTextColor={COLORS.textDisabled}
        multiline
        numberOfLines={2}
      />

      <Text style={[styles.inputLabel, { marginTop: SPACING.lg }]}>Tần suất</Text>
      <View style={styles.timelineRow}>
        {FREQUENCY_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.timelineOption,
              frequency === option.value && styles.timelineOptionActive
            ]}
            onPress={() => setFrequency(option.value)}
          >
            <Text
              style={[
                styles.timelineOptionText,
                frequency === option.value && styles.timelineOptionTextActive
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.timePickerRow, { marginTop: SPACING.lg }]}>
        <Clock size={18} color={COLORS.textSecondary} />
        <Text style={styles.timePickerLabel}>Lúc</Text>
        <TextInput
          style={[styles.input, styles.timeInput]}
          value={time}
          onChangeText={setTime}
          placeholder="09:00"
          placeholderTextColor={COLORS.textDisabled}
        />
      </View>
    </View>
  );
};

// Quote Form
const QuoteForm = ({ data, onChange }) => {
  const [quote, setQuote] = useState(data.quote || '');
  const [source, setSource] = useState(data.source || '');
  const [favorite, setFavorite] = useState(data.favorite || false);

  useEffect(() => {
    onChange({ ...data, quote, source, favorite });
  }, [quote, source, favorite]);

  return (
    <View style={styles.subForm}>
      <Text style={styles.inputLabel}>Câu nói</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={quote}
        onChangeText={setQuote}
        placeholder="Nhập câu nói..."
        placeholderTextColor={COLORS.textDisabled}
        multiline
        numberOfLines={4}
      />

      <Text style={[styles.inputLabel, { marginTop: SPACING.lg }]}>Nguồn (nếu có)</Text>
      <TextInput
        style={styles.input}
        value={source}
        onChangeText={setSource}
        placeholder="Ví dụ: GEM Master, Đức Phật..."
        placeholderTextColor={COLORS.textDisabled}
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Đánh dấu yêu thích</Text>
        <Switch
          value={favorite}
          onValueChange={setFavorite}
          trackColor={{ false: COLORS.inputBg, true: COLORS.gold }}
          thumbColor={favorite ? COLORS.goldBright : COLORS.textMuted}
        />
      </View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
  },

  card: {
    borderRadius: GLASS.borderRadius,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    overflow: 'hidden',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },

  expandButton: {
    padding: SPACING.xs,
  },

  closeButton: {
    padding: SPACING.xs,
  },

  formContainer: {
    maxHeight: 350,
    padding: SPACING.lg,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },

  cancelButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },

  cancelButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
  },

  saveButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },

  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },

  saveButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  // Sub-form styles
  subForm: {
    paddingBottom: SPACING.md,
  },

  defaultForm: {
    alignItems: 'center',
    padding: SPACING.xl,
  },

  formText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
  },

  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wider,
  },

  input: {
    backgroundColor: INPUT.background,
    borderRadius: INPUT.borderRadius,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },

  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Steps specific
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },

  stepCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },

  emptyCheckbox: {
    width: 14,
    height: 14,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },

  stepText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },

  stepTextCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },

  addStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },

  addStepButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Switch row
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
  },

  switchLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },

  switchSubLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Shop button
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },

  shopButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },

  // Affirmation
  affirmationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },

  affirmationText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
  },

  // Timeline options
  timelineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },

  timelineOption: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },

  timelineOptionActive: {
    borderColor: COLORS.purple,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
  },

  timelineOptionText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
  },

  timelineOptionTextActive: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // Time picker
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  timePickerLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
  },

  timeInput: {
    width: 80,
    textAlign: 'center',
  },

  // Reading preview
  readingPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },

  readingPreviewText: {
    flex: 1,
  },

  readingPreviewTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  readingPreviewSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});

export default SmartFormCard;
