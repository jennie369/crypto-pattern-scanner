/**
 * useTemplate Hook
 * React hook for template form management
 *
 * Created: 2026-02-02
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { getTemplate } from '../services/templates/journalTemplates';
import {
  validateTemplateForm,
  getDefaultFormData,
  sanitizeFormData,
  hasUnsavedChanges,
} from '../services/templates/templateValidationService';
import { processTemplateSubmission } from '../services/templates/journalRoutingService';
import { checkTemplateAccess } from '../config/templateAccessControl';

/**
 * useTemplate Hook
 * @param {string} templateId - Template ID
 * @param {Object} options - Hook options
 * @param {string} options.userTier - User's tier
 * @param {string} options.userRole - User's role (admin/manager)
 * @param {string} options.userId - User ID
 * @param {Object} options.initialData - Initial form data (auto-fill)
 * @param {string} options.entryPoint - Entry point (gemmaster, visionboard, calendar)
 * @returns {Object} - Hook return value
 */
export const useTemplate = (templateId, options = {}) => {
  const {
    userTier = 'free',
    userRole = null,
    userId = null,
    initialData = {},
    entryPoint = 'gemmaster',
  } = options;

  // Get template
  const template = useMemo(() => getTemplate(templateId), [templateId]);

  // Check access
  const access = useMemo(() => {
    return checkTemplateAccess(templateId, userTier, userRole);
  }, [templateId, userTier, userRole]);

  // Form state
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [defaultData, setDefaultData] = useState({});

  // Initialize form data when template changes
  useEffect(() => {
    if (template) {
      const defaults = getDefaultFormData(template);
      const merged = { ...defaults, ...initialData };
      setFormData(merged);
      setDefaultData(merged);
      setErrors({});
      setSubmitResult(null);
    }
  }, [template, initialData]);

  // Set single field value
  const setField = useCallback((fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error for this field
    setErrors((prev) => {
      if (prev[fieldId]) {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      }
      return prev;
    });
  }, []);

  // Set multiple fields
  const setFields = useCallback((fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  }, []);

  // Validate form
  const validate = useCallback(() => {
    if (!template) {
      return { isValid: false, errors: { _form: 'Template not found' } };
    }
    const result = validateTemplateForm(template, formData);
    setErrors(result.errors);
    return result;
  }, [template, formData]);

  // Reset form
  const reset = useCallback(() => {
    if (template) {
      const defaults = getDefaultFormData(template);
      const merged = { ...defaults, ...initialData };
      setFormData(merged);
      setDefaultData(merged);
    }
    setErrors({});
    setSubmitResult(null);
  }, [template, initialData]);

  // Check for unsaved changes
  const hasChanges = useMemo(() => {
    if (!template) return false;
    return hasUnsavedChanges(template, formData, defaultData);
  }, [template, formData, defaultData]);

  // Submit form
  const submit = useCallback(async (createGoal = null) => {
    if (!template || !userId || isSubmitting) {
      return { success: false, message: 'Cannot submit' };
    }

    // Validate first
    const validation = validateTemplateForm(template, formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return { success: false, errors: validation.errors };
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      // Sanitize data
      const sanitized = sanitizeFormData(template, formData);

      // Determine if creating goal
      const shouldCreateGoal = createGoal !== null ? createGoal : validation.hasCheckedAction;

      // Process submission
      const result = await processTemplateSubmission({
        userId,
        templateId,
        formData: sanitized,
        entryPoint,
        userTier,
        createGoal: shouldCreateGoal,
      });

      setSubmitResult(result);

      if (result.success) {
        // Reset form on success
        reset();
      }

      return result;
    } catch (error) {
      console.error('[useTemplate] Submit error:', error);
      const errorResult = {
        success: false,
        message: error.message || 'Submission failed',
      };
      setSubmitResult(errorResult);
      return errorResult;
    } finally {
      setIsSubmitting(false);
    }
  }, [template, userId, formData, isSubmitting, templateId, entryPoint, userTier, reset]);

  // Check if form can be submitted
  const canSubmit = useMemo(() => {
    if (!template || !access.allowed || isSubmitting) return false;
    const validation = validateTemplateForm(template, formData);
    return validation.isValid;
  }, [template, access.allowed, isSubmitting, formData]);

  // Get checked actions count (for goal creation indicator)
  const checkedActionsCount = useMemo(() => {
    if (!template) return 0;
    let count = 0;
    for (const field of template.fields || []) {
      if (field.type === 'action_list') {
        const actions = formData[field.id] || [];
        count += actions.filter((a) => a.checked).length;
      }
    }
    return count;
  }, [template, formData]);

  return {
    // Template info
    template,
    templateId,
    access,
    isAccessible: access.allowed,
    upgradeRequired: access.reason,

    // Form state
    formData,
    errors,
    isSubmitting,
    submitResult,
    hasChanges,
    canSubmit,
    checkedActionsCount,

    // Actions
    setField,
    setFields,
    validate,
    submit,
    reset,
  };
};

/**
 * useTemplateIntent Hook
 * Detects template intent from user messages
 */
export const useTemplateIntent = (userTier = 'free') => {
  const [lastIntent, setLastIntent] = useState(null);

  const detectIntent = useCallback((message) => {
    const { detectTemplateIntent, extractContextForAutoFill } = require('../services/templates/intentDetectionService');
    const { getTemplate } = require('../services/templates/journalTemplates');

    const intent = detectTemplateIntent(message, {
      userTier,
      checkAccess: true,
    });

    if (intent) {
      const template = getTemplate(intent.templateId);
      const autoFillData = template ? extractContextForAutoFill(message, template) : {};

      const result = {
        ...intent,
        template,
        autoFillData,
      };

      setLastIntent(result);
      return result;
    }

    setLastIntent(null);
    return null;
  }, [userTier]);

  const clearIntent = useCallback(() => {
    setLastIntent(null);
  }, []);

  return {
    lastIntent,
    detectIntent,
    clearIntent,
  };
};

export default useTemplate;
