/**
 * TemplateInlineForm.js
 * Template-based inline form for GEM Master chat
 * Uses centralized templates system with FormFieldRenderer
 *
 * Created: 2026-02-02
 * Updated: 2026-02-03 - Compact design, consistent colors, blue theme
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  X,
  Check,
  Target,
  AlertTriangle,
  BookOpen,
  Heart,
  Award,
  Calendar,
  Star,
  Sparkles,
  TrendingUp,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  COSMIC_COLORS,
  COSMIC_SPACING,
  COSMIC_RADIUS,
  COSMIC_TYPOGRAPHY,
} from '../../theme/cosmicTokens';

// Template services
import { getTemplate, FIELD_TYPES } from '../../services/templates/journalTemplates';
import { validateTemplateForm, getDefaultFormData, sanitizeFormData } from '../../services/templates/templateValidationService';
import { processTemplateSubmission } from '../../services/templates/journalRoutingService';
import { checkTemplateAccess } from '../../config/templateAccessControl';

// Shared components
import FormFieldRenderer from '../shared/templates/FormFieldRenderer';
import PaperTradeSelector from '../shared/templates/PaperTradeSelector';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Icon mapping
const TEMPLATE_ICONS = {
  goal_basic: Target,
  fear_setting: AlertTriangle,
  think_day: BookOpen,
  gratitude: Heart,
  daily_wins: Award,
  weekly_planning: Calendar,
  vision_3_5_years: Star,
  free_form: Sparkles,
  trading_journal: TrendingUp,
};

// Consistent gold color for all buttons
const BUTTON_COLOR = COSMIC_COLORS.glow.gold;

/**
 * TemplateInlineForm Component
 */
const TemplateInlineForm = ({
  visible,
  templateId,
  autoFillData = {},
  userTier = 'free',
  userRole = null,
  userId,
  onClose,
  onResult,
  onFocusChange, // NEW: callback when form gains/loses focus
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current; // Start off-screen

  // Get template
  const template = getTemplate(templateId);
  const access = checkTemplateAccess(templateId, userTier, userRole);

  // Form state
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef(null);

  // Track keyboard height for proper scrolling on Android
  useEffect(() => {
    if (!visible) return;
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [visible]);

  // Initialize form data
  useEffect(() => {
    if (visible && template) {
      const defaults = getDefaultFormData(template);
      setFormData({ ...defaults, ...autoFillData });
      setErrors({});
      setKeyboardHeight(0);
    }
  }, [visible, template, autoFillData]);

  // Animate on visible - faster spring animation
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible, fadeAnim, slideAnim]);

  // Handle field change
  const handleFieldChange = useCallback((fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  }, [errors]);

  // Handle Paper Trade selection (auto-fill)
  const handlePaperTradeSelect = useCallback((tradeData) => {
    setFormData((prev) => ({ ...prev, ...tradeData }));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  // Handle close - fast smooth animation
  const handleClose = useCallback(() => {
    onFocusChange?.(false);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  }, [fadeAnim, slideAnim, onClose, onFocusChange]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!template || !userId || isSubmitting) return;

    const validation = validateTemplateForm(template, formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const sanitized = sanitizeFormData(template, formData);
      const createGoal = validation.hasCheckedAction;

      const result = await processTemplateSubmission({
        userId,
        templateId,
        formData: sanitized,
        entryPoint: 'gemmaster',
        userTier,
        userRole,
        createGoal,
      });

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onResult?.({
          success: true,
          journal: result.journalEntry,
          goal: result.goal,
          message: result.message,
          actionsCreated: result.actionsCreated,
        });
        handleClose();
      } else {
        const errorMessage = result.error || result.message || 'Không thể lưu. Vui lòng thử lại.';
        setErrors({ _form: errorMessage });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('[TemplateInlineForm] Submit error:', error);
      setErrors({ _form: error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  }, [template, userId, formData, isSubmitting, templateId, userTier, userRole, onResult, handleClose]);

  // Don't render if not visible or no template
  if (!visible || !template) return null;

  // Check access
  if (!access.allowed) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={handleClose}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.lockedCard,
              {
                paddingBottom: insets.bottom + COSMIC_SPACING.xl,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.lockedTitle}>Template này yêu cầu nâng cấp</Text>
            <Text style={styles.lockedText}>{access.reason}</Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => {
                handleClose();
                // Navigate to Upgrade screen (UpgradeScreen is in AccountStack)
                navigation.navigate('Account', { screen: 'UpgradeScreen' });
              }}
            >
              <Text style={styles.upgradeButtonText}>Nâng cấp ngay</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButtonSmall} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  const IconComponent = TEMPLATE_ICONS[templateId] || Sparkles;
  const isTradingJournal = templateId === 'trading_journal';

  // Calculate card height - shrink when keyboard is visible on Android
  const baseCardHeight = SCREEN_HEIGHT * 0.92;
  const effectiveCardHeight = (Platform.OS === 'android' && keyboardHeight > 0)
    ? SCREEN_HEIGHT - keyboardHeight - insets.top - 20
    : baseCardHeight;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalContainer}
      >
        {/* Tap outside to close - animated overlay */}
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Form Card */}
        <Animated.View
          style={[
            styles.card,
            {
              height: effectiveCardHeight,
              paddingBottom: (Platform.OS === 'android' && keyboardHeight > 0) ? COSMIC_SPACING.sm : insets.bottom,
              marginBottom: (Platform.OS === 'android' && keyboardHeight > 0) ? keyboardHeight : 0,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Compact Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <IconComponent size={16} color={BUTTON_COLOR} />
              </View>
              <View style={styles.headerTextWrap}>
                <Text style={styles.title}>{template.name}</Text>
                <Text style={styles.subtitle}>{template.description}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={18} color={COSMIC_COLORS.text.muted} />
            </TouchableOpacity>
          </View>

          {/* Form Error */}
          {errors._form && (
            <View style={styles.formError}>
              <Text style={styles.formErrorText}>{errors._form}</Text>
            </View>
          )}

          {/* Form Fields */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              keyboardHeight > 0 && { paddingBottom: COSMIC_SPACING.xxxl + 60 },
            ]}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            bounces={Platform.OS === 'ios'}
            overScrollMode="never"
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          >
            {/* Paper Trade Selector for Trading Journal */}
            {isTradingJournal && (
              <PaperTradeSelector
                userId={userId}
                onSelect={handlePaperTradeSelect}
                disabled={isSubmitting}
              />
            )}

            {template.fields?.map((field) => (
              <FormFieldRenderer
                key={field.id}
                field={field}
                value={formData[field.id]}
                onChange={(value) => handleFieldChange(field.id, value)}
                error={errors[field.id]}
                disabled={isSubmitting}
                tooltips={template.tooltips || {}}
              />
            ))}
          </ScrollView>

          {/* Compact Footer - No border */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={COSMIC_COLORS.bgDeepSpace} />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Lưu</Text>
                  <Check size={14} color={COSMIC_COLORS.bgDeepSpace} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Modal container
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  card: {
    backgroundColor: '#0D0D2B', // Deep navy matching chat theme
    overflow: 'hidden',
    borderTopLeftRadius: COSMIC_RADIUS.xl,
    borderTopRightRadius: COSMIC_RADIUS.xl,
  },

  // Compact Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: COSMIC_SPACING.md,
    paddingVertical: COSMIC_SPACING.sm,
    backgroundColor: '#0A0A1F', // Darker navy header
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.sm,
    flex: 1,
  },
  headerTextWrap: {
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: COSMIC_RADIUS.sm,
    backgroundColor: BUTTON_COLOR + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.semibold,
    color: COSMIC_COLORS.text.primary,
  },
  subtitle: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xs,
    color: COSMIC_COLORS.text.muted,
  },
  closeButton: {
    padding: COSMIC_SPACING.xs,
  },

  // Scroll content - takes remaining space between header and footer
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: COSMIC_SPACING.md,
    paddingTop: COSMIC_SPACING.sm,
    paddingBottom: COSMIC_SPACING.xxl,
    gap: COSMIC_SPACING.sm,
    flexGrow: 1,
  },

  // Error
  formError: {
    backgroundColor: COSMIC_COLORS.functional.error + '20',
    paddingHorizontal: COSMIC_SPACING.md,
    paddingVertical: COSMIC_SPACING.xs,
  },
  formErrorText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    color: COSMIC_COLORS.functional.error,
  },

  // Compact Footer - No border, with extra padding for safe area
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: COSMIC_SPACING.md,
    paddingTop: COSMIC_SPACING.sm,
    paddingBottom: COSMIC_SPACING.md,
    gap: COSMIC_SPACING.md,
    backgroundColor: '#0A0A1F', // Match header - deep navy
  },
  cancelButton: {
    paddingVertical: COSMIC_SPACING.sm,
    paddingHorizontal: COSMIC_SPACING.md,
  },
  cancelButtonText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    color: COSMIC_COLORS.text.muted,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.xs,
    paddingVertical: COSMIC_SPACING.sm,
    paddingHorizontal: COSMIC_SPACING.lg,
    borderRadius: COSMIC_RADIUS.sm,
    backgroundColor: BUTTON_COLOR, // Consistent gold color
  },
  submitButtonText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.semibold,
    color: COSMIC_COLORS.bgDeepSpace,
  },

  // Locked state
  lockedCard: {
    backgroundColor: '#0D0D2B',
    borderTopLeftRadius: COSMIC_RADIUS.xl,
    borderTopRightRadius: COSMIC_RADIUS.xl,
    padding: COSMIC_SPACING.xl,
    alignItems: 'center',
  },
  lockedTitle: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.semibold,
    color: COSMIC_COLORS.text.primary,
    marginBottom: COSMIC_SPACING.xs,
  },
  lockedText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    color: COSMIC_COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: COSMIC_SPACING.md,
  },
  upgradeButton: {
    backgroundColor: BUTTON_COLOR,
    paddingVertical: COSMIC_SPACING.sm,
    paddingHorizontal: COSMIC_SPACING.lg,
    borderRadius: COSMIC_RADIUS.round,
    marginBottom: COSMIC_SPACING.sm,
  },
  upgradeButtonText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.semibold,
    color: COSMIC_COLORS.bgDeepSpace,
  },
  closeButtonSmall: {
    padding: COSMIC_SPACING.xs,
  },
  closeButtonText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xs,
    color: COSMIC_COLORS.text.muted,
  },
});

export default TemplateInlineForm;
