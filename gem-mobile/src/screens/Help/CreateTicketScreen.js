/**
 * Gemral - Create Ticket Screen (User)
 *
 * Form for users to submit support tickets
 * Features: Category selection, priority, description
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  ArrowLeft,
  Send,
  HelpCircle,
  CreditCard,
  Wrench,
  User,
  Lightbulb,
  Bug,
  ChevronDown,
  Check,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import supportTicketService, {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
} from '../../services/supportTicketService';
import { showAlert } from '../../components/CustomAlert';

const CATEGORY_ICONS = {
  general: HelpCircle,
  billing: CreditCard,
  technical: Wrench,
  account: User,
  feature_request: Lightbulb,
  bug_report: Bug,
};

const CreateTicketScreen = () => {
  const navigation = useNavigation();

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('normal');
  const [showCategories, setShowCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim()) {
      showAlert('Lỗi', 'Vui lòng nhập tiêu đề');
      return;
    }

    if (!description.trim()) {
      showAlert('Lỗi', 'Vui lòng mô tả vấn đề của bạn');
      return;
    }

    if (description.trim().length < 20) {
      showAlert('Lỗi', 'Mô tả quá ngắn. Vui lòng cung cấp thêm chi tiết');
      return;
    }

    setSubmitting(true);
    try {
      const result = await supportTicketService.createTicket({
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
      });

      if (result.success) {
        showAlert(
          'Gửi thành công',
          `Ticket ${result.ticket_number} đã được tạo. Chúng tôi sẽ phản hồi sớm nhất có thể.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        showAlert('Lỗi', result.error || 'Không thể gửi ticket');
      }
    } catch (error) {
      showAlert('Lỗi', 'Đã xảy ra lỗi. Vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = TICKET_CATEGORIES.find((c) => c.key === category);
  const CategoryIcon = CATEGORY_ICONS[category] || HelpCircle;

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <ArrowLeft size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Gửi yêu cầu hỗ trợ</Text>
      <View style={{ width: 32 }} />
    </View>
  );

  const renderCategorySelector = () => (
    <View style={styles.section}>
      <Text style={styles.label}>Danh mục</Text>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setShowCategories(!showCategories)}
      >
        <View style={styles.selectorContent}>
          <CategoryIcon size={20} color={selectedCategory?.color || COLORS.textMuted} />
          <Text style={styles.selectorText}>{selectedCategory?.label || 'Chọn danh mục'}</Text>
        </View>
        <ChevronDown
          size={20}
          color={COLORS.textMuted}
          style={{ transform: [{ rotate: showCategories ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity>

      {showCategories && (
        <View style={styles.optionsContainer}>
          {TICKET_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.key] || HelpCircle;
            const isSelected = category === cat.key;

            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                onPress={() => {
                  setCategory(cat.key);
                  setShowCategories(false);
                }}
              >
                <Icon size={18} color={cat.color} />
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {cat.label}
                </Text>
                {isSelected && <Check size={16} color={COLORS.gold} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );

  const renderPrioritySelector = () => (
    <View style={styles.section}>
      <Text style={styles.label}>Mức độ ưu tiên</Text>
      <View style={styles.priorityContainer}>
        {TICKET_PRIORITIES.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[
              styles.priorityButton,
              priority === p.key && styles.priorityButtonSelected,
              { borderColor: p.color },
            ]}
            onPress={() => setPriority(p.key)}
          >
            <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
            <Text
              style={[
                styles.priorityText,
                priority === p.key && { color: p.color },
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSubjectInput = () => (
    <View style={styles.section}>
      <Text style={styles.label}>Tiêu đề *</Text>
      <TextInput
        style={styles.input}
        placeholder="Tóm tắt vấn đề của bạn"
        placeholderTextColor={COLORS.textMuted}
        value={subject}
        onChangeText={setSubject}
        maxLength={200}
      />
      <Text style={styles.charCount}>{subject.length}/200</Text>
    </View>
  );

  const renderDescriptionInput = () => (
    <View style={styles.section}>
      <Text style={styles.label}>Mô tả chi tiết *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Mô tả chi tiết vấn đề bạn gặp phải. Cung cấp càng nhiều thông tin càng tốt để chúng tôi hỗ trợ bạn nhanh hơn."
        placeholderTextColor={COLORS.textMuted}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        maxLength={2000}
      />
      <Text style={styles.charCount}>{description.length}/2000</Text>
    </View>
  );

  const renderTips = () => (
    <View style={styles.tipsContainer}>
      <Text style={styles.tipsTitle}>Mẹo để được hỗ trợ nhanh hơn:</Text>
      <View style={styles.tipItem}>
        <Text style={styles.tipBullet}>•</Text>
        <Text style={styles.tipText}>Mô tả chi tiết các bước dẫn đến vấn đề</Text>
      </View>
      <View style={styles.tipItem}>
        <Text style={styles.tipBullet}>•</Text>
        <Text style={styles.tipText}>Bao gồm thông báo lỗi nếu có</Text>
      </View>
      <View style={styles.tipItem}>
        <Text style={styles.tipBullet}>•</Text>
        <Text style={styles.tipText}>Chọn đúng danh mục để ticket được chuyển đến đúng bộ phận</Text>
      </View>
    </View>
  );

  const renderSubmitButton = () => (
    <TouchableOpacity
      style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
      onPress={handleSubmit}
      disabled={submitting}
    >
      {submitting ? (
        <ActivityIndicator size="small" color={COLORS.bgDarkest} />
      ) : (
        <>
          <Send size={20} color={COLORS.bgDarkest} />
          <Text style={styles.submitText}>Gửi yêu cầu</Text>
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {renderHeader()}

        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {renderCategorySelector()}
          {renderPrioritySelector()}
          {renderSubjectInput()}
          {renderDescriptionInput()}
          {renderTips()}
          {renderSubmitButton()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.huge,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgMid,
    borderRadius: 12,
    padding: SPACING.md,
    ...GLASS,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  selectorText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  optionsContainer: {
    backgroundColor: COLORS.bgMid,
    borderRadius: 12,
    marginTop: SPACING.sm,
    overflow: 'hidden',
    ...GLASS,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionItemSelected: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  optionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  optionTextSelected: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  priorityButtonSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  input: {
    backgroundColor: COLORS.bgMid,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    ...GLASS,
  },
  textArea: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginBottom: SPACING.sm,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  tipBullet: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    marginRight: SPACING.xs,
  },
  tipText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: SPACING.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDarkest,
  },
});

export default CreateTicketScreen;
