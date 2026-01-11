/**
 * Partnership Validation Utilities
 * Reference: GEM_PARTNERSHIP_IMPLEMENTATION_PHASE2.md
 */

export const VALIDATION_RULES = {
  fullName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[\p{L}\s]+$/u, // Unicode letters and spaces
    message: 'Họ tên phải có ít nhất 2 ký tự',
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email không hợp lệ',
  },
  phone: {
    required: true,
    pattern: /^(0|\+84)[0-9]{9,10}$/,
    message: 'Số điện thoại không hợp lệ (VD: 0901234567)',
  },
  idNumber: {
    required: true,
    minLength: 9,
    maxLength: 12,
    pattern: /^[0-9]+$/,
    message: 'Số CCCD/CMND phải từ 9-12 số',
  },
  socialUrl: {
    pattern: /^https?:\/\/.+/,
    message: 'URL phải bắt đầu bằng http:// hoặc https://',
  },
  followers: {
    pattern: /^[0-9]+$/,
    min: 0,
    max: 1000000000,
    message: 'Số followers phải là số nguyên dương',
  },
};

/**
 * Validate a single field
 * @param {string} field - Field name
 * @param {string} value - Field value
 * @param {Object} rules - Validation rules
 * @returns {string|null} Error message or null if valid
 */
export const validateField = (field, value, rules = VALIDATION_RULES) => {
  const rule = rules[field];
  if (!rule) return null;

  const trimmedValue = value?.trim?.() ?? value;

  if (rule.required && !trimmedValue) {
    return `${getFieldLabel(field)} là bắt buộc`;
  }

  if (trimmedValue && rule.minLength && trimmedValue.length < rule.minLength) {
    return rule.message || `${getFieldLabel(field)} phải có ít nhất ${rule.minLength} ký tự`;
  }

  if (trimmedValue && rule.maxLength && trimmedValue.length > rule.maxLength) {
    return `${getFieldLabel(field)} không được quá ${rule.maxLength} ký tự`;
  }

  if (trimmedValue && rule.pattern && !rule.pattern.test(trimmedValue)) {
    return rule.message;
  }

  if (trimmedValue && rule.min !== undefined) {
    const numValue = parseInt(trimmedValue);
    if (numValue < rule.min) {
      return `${getFieldLabel(field)} phải lớn hơn hoặc bằng ${rule.min}`;
    }
  }

  if (trimmedValue && rule.max !== undefined) {
    const numValue = parseInt(trimmedValue);
    if (numValue > rule.max) {
      return `${getFieldLabel(field)} phải nhỏ hơn hoặc bằng ${rule.max.toLocaleString()}`;
    }
  }

  return null;
};

/**
 * Get human-readable field label
 */
const getFieldLabel = (field) => {
  const labels = {
    fullName: 'Họ tên',
    email: 'Email',
    phone: 'Số điện thoại',
    idNumber: 'Số CCCD/CMND',
    socialUrl: 'Link mạng xã hội',
    followers: 'Số followers',
  };
  return labels[field] || field;
};

/**
 * Validate CTV registration form
 * @param {Object} data - Form data
 * @returns {Object} { valid, errors }
 */
export const validateCTVForm = (data) => {
  const errors = {};

  const fullNameError = validateField('fullName', data.full_name);
  if (fullNameError) errors.full_name = fullNameError;

  const emailError = validateField('email', data.email);
  if (emailError) errors.email = emailError;

  const phoneError = validateField('phone', data.phone);
  if (phoneError) errors.phone = phoneError;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate KOL Step 1 - Personal Info
 */
export const validateKOLStep1 = (data) => {
  const errors = {};

  const fullNameError = validateField('fullName', data.full_name);
  if (fullNameError) errors.full_name = fullNameError;

  const emailError = validateField('email', data.email);
  if (emailError) errors.email = emailError;

  const phoneError = validateField('phone', data.phone);
  if (phoneError) errors.phone = phoneError;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate KOL Step 2 - KYC
 */
export const validateKOLStep2 = (data) => {
  const errors = {};

  const idNumberError = validateField('idNumber', data.id_number);
  if (idNumberError) errors.id_number = idNumberError;

  if (!data.id_front_image) {
    errors.id_front_image = 'Vui lòng upload ảnh mặt trước CCCD';
  }

  if (!data.id_back_image) {
    errors.id_back_image = 'Vui lòng upload ảnh mặt sau CCCD';
  }

  if (!data.portrait_image) {
    errors.portrait_image = 'Vui lòng upload ảnh chân dung';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate KOL Step 3 - Social Media
 * @param {Object} socialData - Social media data
 * @param {number} totalFollowers - Total followers count
 * @param {number} minRequired - Minimum required followers (default 20,000)
 */
export const validateKOLStep3 = (socialData, totalFollowers, minRequired = 20000) => {
  const errors = {};

  // Check URL format for each platform
  Object.entries(socialData).forEach(([platform, data]) => {
    if (data.url && !VALIDATION_RULES.socialUrl.pattern.test(data.url)) {
      errors[`${platform}_url`] = `Link ${platform} không hợp lệ`;
    }
  });

  // Check total followers
  if (totalFollowers < minRequired) {
    errors.totalFollowers = `Cần ít nhất ${minRequired.toLocaleString()} followers để đăng ký KOL`;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate referral code format
 */
export const validateReferralCode = (code) => {
  if (!code) return { valid: true }; // Optional field

  const pattern = /^[A-Z0-9]{6,12}$/;
  if (!pattern.test(code.toUpperCase())) {
    return {
      valid: false,
      error: 'Mã giới thiệu phải từ 6-12 ký tự (chữ và số)',
    };
  }

  return { valid: true };
};

/**
 * Format phone number (remove spaces, add +84 if needed)
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';

  // Remove spaces and dashes
  let formatted = phone.replace(/[\s-]/g, '');

  // If starts with 0, keep as is (Vietnamese format)
  // If starts with 84, add +
  if (formatted.startsWith('84') && !formatted.startsWith('+84')) {
    formatted = '+' + formatted;
  }

  return formatted;
};

export default {
  VALIDATION_RULES,
  validateField,
  validateCTVForm,
  validateKOLStep1,
  validateKOLStep2,
  validateKOLStep3,
  validateReferralCode,
  formatPhoneNumber,
};
