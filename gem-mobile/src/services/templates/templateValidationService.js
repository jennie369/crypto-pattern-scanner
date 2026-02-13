/**
 * Template Validation Service
 *
 * Validates form data against template definitions
 * Handles all field types with proper Vietnamese messages
 *
 * Created: 2026-02-02
 */

import { TEMPLATES, FIELD_TYPES, LIFE_AREAS } from './journalTemplates';

const SERVICE_NAME = '[TemplateValidationService]';

// ==================== FIELD VALIDATORS ====================

/**
 * Validate text/textarea field
 * Also handles array values for multi-select fields (affirmation, ritual)
 */
const validateTextField = (field, value) => {
  // Handle array values (multi-select affirmations/rituals)
  if (Array.isArray(value)) {
    // Check required
    if (field.required && !field.optional) {
      if (value.length === 0) {
        return { isValid: false, error: 'Vui lòng điền mục này' };
      }
    }
    // Array values are valid
    return { isValid: true, error: null };
  }

  // Check required
  if (field.required && !field.optional) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return { isValid: false, error: 'Vui lòng điền mục này' };
    }
  }

  // Skip validation if empty and optional
  if (!value && (field.optional || !field.required)) {
    return { isValid: true, error: null };
  }

  // Validate type
  if (value && typeof value !== 'string') {
    return { isValid: false, error: 'Giá trị không hợp lệ' };
  }

  // Validate maxLength
  if (field.maxLength && value && value.length > field.maxLength) {
    return { isValid: false, error: `Tối đa ${field.maxLength} ky tu` };
  }

  return { isValid: true, error: null };
};

/**
 * Validate slider field
 */
const validateSliderField = (field, value) => {
  // Slider always has value (defaultValue), so just validate range
  const numValue = Number(value);

  if (isNaN(numValue)) {
    return { isValid: false, error: 'Giá trị không hợp lệ' };
  }

  if (field.min !== undefined && numValue < field.min) {
    return { isValid: false, error: `Tối thiểu ${field.min}` };
  }

  if (field.max !== undefined && numValue > field.max) {
    return { isValid: false, error: `Tối đa ${field.max}` };
  }

  return { isValid: true, error: null };
};

/**
 * Validate checklist field
 */
const validateChecklistField = (field, value) => {
  // Check required
  if (field.required || field.minItems) {
    if (!Array.isArray(value) || value.length === 0) {
      return { isValid: false, error: 'Vui lòng thêm ít nhất 1 muc' };
    }
  }

  // Skip if empty and optional
  if (!value && (field.optional || !field.required)) {
    return { isValid: true, error: null };
  }

  // Validate array type
  if (value && !Array.isArray(value)) {
    return { isValid: false, error: 'Giá trị không hợp lệ' };
  }

  // Validate minItems
  if (field.minItems && value && value.length < field.minItems) {
    return { isValid: false, error: `Cần ít nhất ${field.minItems} muc` };
  }

  // Validate maxItems
  if (field.maxItems && value && value.length > field.maxItems) {
    return { isValid: false, error: `Tối đa ${field.maxItems} muc` };
  }

  // Validate each item has text
  if (value && Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      if (!item.text || item.text.trim() === '') {
        return { isValid: false, error: `Mục ${i + 1} không được để trống` };
      }
    }
  }

  return { isValid: true, error: null };
};

/**
 * Validate action list field
 */
const validateActionListField = (field, value) => {
  // Check required/minItems
  if (field.required || field.minItems) {
    if (!Array.isArray(value) || value.length === 0) {
      return { isValid: false, error: 'Vui lòng thêm ít nhất 1 hành động' };
    }
  }

  // Skip if empty and optional
  if ((!value || (Array.isArray(value) && value.length === 0)) && (field.optional || !field.required)) {
    return { isValid: true, error: null };
  }

  // Validate array type
  if (value && !Array.isArray(value)) {
    return { isValid: false, error: 'Giá trị không hợp lệ' };
  }

  // Validate minItems
  if (field.minItems && value && value.length < field.minItems) {
    return { isValid: false, error: `Cần ít nhất ${field.minItems} hành động` };
  }

  // Validate maxItems
  if (field.maxItems && value && value.length > field.maxItems) {
    return { isValid: false, error: `Tối đa ${field.maxItems} hành động` };
  }

  // Validate each item
  if (value && Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const item = value[i];

      // Check text is not empty
      if (!item.text || item.text.trim() === '') {
        return { isValid: false, error: `Hành động ${i + 1} không được để trống` };
      }

      // Check life area for checked items (if required)
      if (field.requireLifeArea && item.checked && !item.lifeArea) {
        return {
          isValid: false,
          error: `Vui lòng chọn lĩnh vực cho hành động "${item.text.substring(0, 20)}..."`,
        };
      }
    }
  }

  return { isValid: true, error: null };
};

/**
 * Validate select field
 */
const validateSelectField = (field, value) => {
  // Check required
  if (field.required && !field.optional) {
    if (!value) {
      return { isValid: false, error: 'Vui lòng chọn một tùy chọn' };
    }
  }

  // Skip if empty and optional
  if (!value && (field.optional || !field.required)) {
    return { isValid: true, error: null };
  }

  // Validate value is in options
  if (field.options && value) {
    const validValues = field.options.map((o) => o.value);
    if (!validValues.includes(value)) {
      return { isValid: false, error: 'Giá trị không hợp lệ' };
    }
  }

  return { isValid: true, error: null };
};

/**
 * Validate life area field
 */
const validateLifeAreaField = (field, value) => {
  // Check required
  if (field.required && !field.optional) {
    if (!value) {
      return { isValid: false, error: 'Vui lòng chọn lĩnh vực' };
    }
  }

  // Skip if empty and optional
  if (!value && (field.optional || !field.required)) {
    return { isValid: true, error: null };
  }

  // Validate life area exists
  const validLifeAreas = Object.keys(LIFE_AREAS);
  if (value && !validLifeAreas.includes(value)) {
    return { isValid: false, error: 'Lĩnh vực không hợp lệ' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate mood field
 */
const validateMoodField = (field, value) => {
  // Mood is always optional
  if (!value) {
    return { isValid: true, error: null };
  }

  // Validate mood value
  const validMoods = ['happy', 'excited', 'peaceful', 'neutral', 'anxious', 'sad', 'stressed'];
  if (!validMoods.includes(value)) {
    return { isValid: false, error: 'Tâm trạng không hợp lệ' };
  }

  return { isValid: true, error: null };
};

// ==================== MAIN FUNCTIONS ====================

/**
 * Validate single field value
 * @param {Object} field - Field definition
 * @param {any} value - Field value
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validateField = (field, value) => {
  switch (field.type) {
    case FIELD_TYPES.TEXT:
    case FIELD_TYPES.TEXTAREA:
      return validateTextField(field, value);

    case FIELD_TYPES.SLIDER:
      return validateSliderField(field, value);

    case FIELD_TYPES.CHECKLIST:
      return validateChecklistField(field, value);

    case FIELD_TYPES.ACTION_LIST:
      return validateActionListField(field, value);

    case FIELD_TYPES.SELECT:
      return validateSelectField(field, value);

    case FIELD_TYPES.LIFE_AREA:
      return validateLifeAreaField(field, value);

    case FIELD_TYPES.MOOD:
      return validateMoodField(field, value);

    case FIELD_TYPES.DATE:
      // Date validation
      if (field.required && !value) {
        return { isValid: false, error: 'Vui lòng chọn ngày' };
      }
      return { isValid: true, error: null };

    default:
      console.warn(`${SERVICE_NAME} Unknown field type: ${field.type}`);
      return { isValid: true, error: null };
  }
};

/**
 * Validate entire form against template
 * @param {Object} template - Template definition
 * @param {Object} formData - Form data
 * @returns {{ isValid: boolean, errors: Object, firstErrorField: string | null, filledFieldsCount: number, hasCheckedAction: boolean }}
 */
export const validateTemplateForm = (template, formData) => {
  if (!template) {
    return {
      isValid: false,
      errors: { _form: 'Template không hợp lệ' },
      firstErrorField: '_form',
      filledFieldsCount: 0,
      hasCheckedAction: false,
    };
  }

  const errors = {};
  let firstErrorField = null;
  let filledFieldsCount = 0;
  let hasCheckedAction = false;

  // Validate each field
  for (const field of template.fields || []) {
    const value = formData[field.id];
    const { isValid, error } = validateField(field, value);

    if (!isValid) {
      errors[field.id] = error;
      if (!firstErrorField) {
        firstErrorField = field.id;
      }
    }

    // Count filled fields
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          filledFieldsCount++;
        }
      } else {
        filledFieldsCount++;
      }
    }

    // Check for checked actions
    if (field.type === FIELD_TYPES.ACTION_LIST && Array.isArray(value)) {
      if (value.some((item) => item.checked)) {
        hasCheckedAction = true;
      }
    }
  }

  // Template-level validation
  if (template.validation) {
    // Min fields filled
    if (
      template.validation.minFieldsFilled &&
      filledFieldsCount < template.validation.minFieldsFilled
    ) {
      errors._form = `Vui lòng điền ít nhất ${template.validation.minFieldsFilled} mục`;
      if (!firstErrorField) {
        firstErrorField = '_form';
      }
    }

    // Require at least one action (soft validation - just warning)
    // We don't block submission for this
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstErrorField,
    filledFieldsCount,
    hasCheckedAction,
  };
};

/**
 * Sanitize form data before submission
 * @param {Object} template - Template definition
 * @param {Object} formData - Form data
 * @returns {Object} - Sanitized data
 */
export const sanitizeFormData = (template, formData) => {
  if (!template) return {};

  const sanitized = {};

  for (const field of template.fields || []) {
    const value = formData[field.id];

    if (value === undefined || value === null) {
      continue;
    }

    switch (field.type) {
      case FIELD_TYPES.TEXT:
      case FIELD_TYPES.TEXTAREA:
        // Handle array values (multi-select affirmations/rituals)
        if (Array.isArray(value)) {
          sanitized[field.id] = value.filter(v => v && v.trim()).map(v => v.trim());
        } else {
          // Trim strings, keep Vietnamese diacritics
          sanitized[field.id] = typeof value === 'string' ? value.trim() : String(value);
        }
        break;

      case FIELD_TYPES.SLIDER:
        sanitized[field.id] = Number(value);
        break;

      case FIELD_TYPES.CHECKLIST:
        if (Array.isArray(value)) {
          sanitized[field.id] = value
            .map((item) => ({
              ...item,
              text: String(item.text || '').trim(),
              completed: Boolean(item.completed),
            }))
            .filter((item) => item.text !== '');
        }
        break;

      case FIELD_TYPES.ACTION_LIST:
        if (Array.isArray(value)) {
          sanitized[field.id] = value
            .map((item) => ({
              id: item.id || `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              text: String(item.text || '').trim(),
              checked: Boolean(item.checked),
              lifeArea: item.lifeArea || null,
            }))
            .filter((item) => item.text !== '');
        }
        break;

      case FIELD_TYPES.SELECT:
      case FIELD_TYPES.LIFE_AREA:
      case FIELD_TYPES.MOOD:
        sanitized[field.id] = value;
        break;

      case FIELD_TYPES.DATE:
        // Ensure date is in ISO format
        if (value instanceof Date) {
          sanitized[field.id] = value.toISOString().split('T')[0];
        } else {
          sanitized[field.id] = value;
        }
        break;

      default:
        sanitized[field.id] = value;
    }
  }

  return sanitized;
};

/**
 * Get default values for template fields
 * @param {Object} template - Template definition
 * @returns {Object} - Default form data
 */
export const getDefaultFormData = (template) => {
  if (!template) return {};

  const defaults = {};

  for (const field of template.fields || []) {
    switch (field.type) {
      case FIELD_TYPES.SLIDER:
        defaults[field.id] = field.defaultValue ?? field.min ?? 1;
        break;

      case FIELD_TYPES.TEXT:
      case FIELD_TYPES.TEXTAREA:
        if (field.defaultValue) {
          defaults[field.id] = field.defaultValue;
        }
        break;

      case FIELD_TYPES.CHECKLIST:
      case FIELD_TYPES.ACTION_LIST:
        defaults[field.id] = [];
        break;

      case FIELD_TYPES.LIFE_AREA:
        defaults[field.id] = template.defaultLifeArea || null;
        break;

      default:
        // No default
        break;
    }
  }

  return defaults;
};

/**
 * Check if form has unsaved changes
 * @param {Object} template - Template definition
 * @param {Object} formData - Current form data
 * @param {Object} initialData - Initial form data (defaults)
 * @returns {boolean}
 */
export const hasUnsavedChanges = (template, formData, initialData) => {
  if (!template) return false;

  for (const field of template.fields || []) {
    const currentValue = formData[field.id];
    const initialValue = initialData[field.id];

    // Deep comparison for arrays
    if (Array.isArray(currentValue) || Array.isArray(initialValue)) {
      if (JSON.stringify(currentValue) !== JSON.stringify(initialValue)) {
        return true;
      }
    } else if (currentValue !== initialValue) {
      return true;
    }
  }

  return false;
};

export default {
  validateField,
  validateTemplateForm,
  sanitizeFormData,
  getDefaultFormData,
  hasUnsavedChanges,
};
