/**
 * VALIDATION SERVICE
 * Input validation and sanitization for GEM Master Chatbot
 * Handles Vietnamese text, XSS prevention, and data validation
 */

// Validation rules configuration
const VALIDATION_RULES = {
  display_name: {
    required: false,
    minLength: 1,
    maxLength: 100,
    pattern: /^[\p{L}\p{N}\s\-_]+$/u, // Unicode letters, numbers, spaces, dashes, underscores
    sanitize: ['xss', 'trim'],
    errorMessage: 'Tên hiển thị không hợp lệ',
  },
  preferred_name: {
    required: false,
    minLength: 1,
    maxLength: 50,
    pattern: /^[\p{L}\p{N}\s]+$/u,
    sanitize: ['xss', 'trim'],
    errorMessage: 'Tên gọi không hợp lệ',
  },
  message_content: {
    required: true,
    minLength: 1,
    maxLength: 10000,
    sanitize: ['xss'],
    preserveEmoji: true,
    errorMessage: 'Tin nhắn không được để trống',
  },
  memory_content: {
    required: true,
    minLength: 1,
    maxLength: 5000,
    sanitize: ['xss'],
    preserveEmoji: true,
    errorMessage: 'Nội dung memory không hợp lệ',
  },
  ritual_name: {
    required: true,
    minLength: 1,
    maxLength: 100,
    pattern: /^[\p{L}\p{N}\s\-_.,!?]+$/u,
    sanitize: ['xss', 'trim'],
    errorMessage: 'Tên ritual không hợp lệ',
  },
  ritual_description: {
    required: false,
    maxLength: 500,
    sanitize: ['xss'],
    preserveEmoji: true,
    errorMessage: 'Mô tả ritual không hợp lệ',
  },
  scheduled_time: {
    required: true,
    pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    errorMessage: 'Thời gian không hợp lệ (HH:MM)',
  },
  importance: {
    type: 'number',
    min: 1,
    max: 10,
    errorMessage: 'Độ quan trọng phải từ 1-10',
  },
  quality_rating: {
    type: 'number',
    min: 1,
    max: 5,
    errorMessage: 'Đánh giá phải từ 1-5 sao',
  },
  duration_minutes: {
    type: 'number',
    min: 1,
    max: 480,
    errorMessage: 'Thời lượng phải từ 1-480 phút',
  },
  frequency_hz: {
    type: 'number',
    min: 20,
    max: 700,
    errorMessage: 'Tần số phải từ 20-700 Hz',
  },
  intensity: {
    type: 'number',
    min: 1,
    max: 10,
    errorMessage: 'Cường độ phải từ 1-10',
  },
  notes: {
    required: false,
    maxLength: 1000,
    sanitize: ['xss'],
    preserveEmoji: true,
    errorMessage: 'Ghi chú quá dài (tối đa 1000 ký tự)',
  },
};

class ValidationService {
  /**
   * Validate a single field
   * @param {string} fieldName - Field name from VALIDATION_RULES
   * @param {any} value - Value to validate
   * @returns {{valid: boolean, errors?: string[], value: any}}
   */
  validate(fieldName, value) {
    const rule = VALIDATION_RULES[fieldName];
    if (!rule) {
      // No rule defined, allow any value
      return { valid: true, value };
    }

    const errors = [];
    let sanitizedValue = value;

    // Required check
    if (rule.required && (value === null || value === undefined || value === '')) {
      return {
        valid: false,
        errors: [rule.errorMessage || `${fieldName} là bắt buộc`],
        value: null,
      };
    }

    // Skip validation if empty and not required
    if ((value === null || value === undefined || value === '') && !rule.required) {
      return { valid: true, value: null };
    }

    // String validation
    if (typeof value === 'string') {
      // Trim if specified
      if (rule.sanitize?.includes('trim')) {
        sanitizedValue = sanitizedValue.trim();
      }

      // Length checks
      if (rule.minLength && sanitizedValue.length < rule.minLength) {
        errors.push(`${fieldName} phải có ít nhất ${rule.minLength} ký tự`);
      }

      if (rule.maxLength && sanitizedValue.length > rule.maxLength) {
        // Truncate with warning
        sanitizedValue = sanitizedValue.substring(0, rule.maxLength);
        console.warn(`[Validation] ${fieldName} truncated to ${rule.maxLength} chars`);
      }

      // Pattern check
      if (rule.pattern && sanitizedValue && !rule.pattern.test(sanitizedValue)) {
        errors.push(rule.errorMessage || `${fieldName} chứa ký tự không hợp lệ`);
      }

      // Sanitization
      if (rule.sanitize?.includes('xss')) {
        sanitizedValue = this.sanitizeXSS(sanitizedValue, rule.preserveEmoji);
      }
    }

    // Number validation
    if (rule.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors.push(rule.errorMessage || `${fieldName} phải là số`);
      } else {
        // Clamp to range
        sanitizedValue = numValue;
        if (rule.min !== undefined) {
          sanitizedValue = Math.max(rule.min, sanitizedValue);
        }
        if (rule.max !== undefined) {
          sanitizedValue = Math.min(rule.max, sanitizedValue);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      value: sanitizedValue,
    };
  }

  /**
   * Validate multiple fields at once
   * @param {Object} data - Data object with field values
   * @param {string[]} fields - Array of field names to validate
   * @returns {{valid: boolean, errors: string[], data: Object}}
   */
  validateAll(data, fields) {
    const results = {};
    const errors = [];

    for (const field of fields) {
      const result = this.validate(field, data[field]);
      if (!result.valid) {
        errors.push(...(result.errors || []));
      }
      results[field] = result.value;
    }

    return {
      valid: errors.length === 0,
      errors,
      data: results,
    };
  }

  /**
   * Sanitize string for XSS prevention
   * @param {string} str - String to sanitize
   * @param {boolean} preserveEmoji - Whether to preserve emoji characters
   * @returns {string} Sanitized string
   */
  sanitizeXSS(str, preserveEmoji = false) {
    if (!str || typeof str !== 'string') return str;

    let result = str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    // Don't escape forward slashes to preserve URLs
    // .replace(/\//g, '&#x2F;');

    return result;
  }

  /**
   * Reverse XSS sanitization for display
   * @param {string} str - Sanitized string
   * @returns {string} Original string
   */
  unsanitizeXSS(str) {
    if (!str || typeof str !== 'string') return str;

    return str
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/');
  }

  /**
   * Check if string contains potential SQL injection
   * @param {string} str - String to check
   * @returns {boolean} True if suspicious
   */
  hasSQLInjection(str) {
    if (!str || typeof str !== 'string') return false;

    const patterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b)/i,
      /(;--|\bOR\b\s+\d+=\d+)/i,
      /(\bUNION\b.*\bSELECT\b)/i,
      /('|"|;|--|#|\/\*|\*\/)/,
    ];

    return patterns.some(pattern => pattern.test(str));
  }

  // ============================================================
  // QUICK VALIDATORS
  // ============================================================

  /**
   * Validate email format
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }

  /**
   * Validate UUID format
   * @param {string} uuid
   * @returns {boolean}
   */
  isValidUUID(uuid) {
    if (!uuid || typeof uuid !== 'string') return false;
    const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return pattern.test(uuid);
  }

  /**
   * Validate date string
   * @param {string} dateStr
   * @returns {boolean}
   */
  isValidDate(dateStr) {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }

  /**
   * Validate time string (HH:MM format)
   * @param {string} timeStr
   * @returns {boolean}
   */
  isValidTime(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return false;
    const pattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return pattern.test(timeStr);
  }

  /**
   * Check if value is within range
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {boolean}
   */
  isInRange(value, min, max) {
    if (typeof value !== 'number' || isNaN(value)) return false;
    return value >= min && value <= max;
  }

  /**
   * Check if string is empty or whitespace only
   * @param {string} str
   * @returns {boolean}
   */
  isEmpty(str) {
    return !str || (typeof str === 'string' && str.trim().length === 0);
  }

  /**
   * Clamp number to range
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  clamp(value, min, max) {
    const num = Number(value);
    if (isNaN(num)) return min;
    return Math.max(min, Math.min(max, num));
  }

  // ============================================================
  // SPECIALIZED VALIDATORS
  // ============================================================

  /**
   * Validate ritual data object
   * @param {Object} ritual - Ritual data
   * @returns {{valid: boolean, errors: string[], data: Object}}
   */
  validateRitual(ritual) {
    const fields = ['ritual_name', 'ritual_description', 'scheduled_time', 'duration_minutes'];
    const result = this.validateAll({
      ritual_name: ritual.name,
      ritual_description: ritual.description,
      scheduled_time: ritual.scheduled_time,
      duration_minutes: ritual.duration_minutes,
    }, fields);

    // Additional validation
    if (ritual.scheduled_days && Array.isArray(ritual.scheduled_days)) {
      const validDays = ritual.scheduled_days.every(d => d >= 1 && d <= 7);
      if (!validDays) {
        result.errors.push('Ngày lịch không hợp lệ (1-7)');
        result.valid = false;
      }
    }

    return result;
  }

  /**
   * Validate memory data object
   * @param {Object} memory - Memory data
   * @returns {{valid: boolean, errors: string[], data: Object}}
   */
  validateMemory(memory) {
    const result = {
      valid: true,
      errors: [],
      data: {},
    };

    // Validate content
    const contentResult = this.validate('memory_content', memory.content);
    if (!contentResult.valid) {
      result.errors.push(...(contentResult.errors || []));
      result.valid = false;
    }
    result.data.content = contentResult.value;

    // Validate importance
    if (memory.importance !== undefined) {
      const importanceResult = this.validate('importance', memory.importance);
      result.data.importance = importanceResult.value;
    }

    // Validate memory_type
    const validTypes = ['goal', 'value', 'preference', 'achievement', 'challenge',
                        'relationship', 'emotion', 'insight', 'divination', 'general'];
    if (memory.memory_type && !validTypes.includes(memory.memory_type)) {
      result.errors.push('Loại memory không hợp lệ');
      result.valid = false;
    }
    result.data.memory_type = memory.memory_type || 'general';

    return result;
  }

  /**
   * Validate chat message
   * @param {string} message - Message content
   * @returns {{valid: boolean, error?: string, value: string}}
   */
  validateMessage(message) {
    const result = this.validate('message_content', message);
    return {
      valid: result.valid,
      error: result.errors?.[0],
      value: result.value,
    };
  }

  /**
   * Check for crisis keywords (mental health emergency)
   * @param {string} text - Text to check
   * @returns {{isCrisis: boolean, keywords: string[]}}
   */
  checkCrisisKeywords(text) {
    if (!text || typeof text !== 'string') {
      return { isCrisis: false, keywords: [] };
    }

    const crisisKeywords = [
      'tự tử', 'tự vẫn', 'kết thúc', 'không muốn sống',
      'tự làm đau', 'tự gây thương tích', 'muốn chết',
      'suicide', 'kill myself', 'end my life',
      'không còn ý nghĩa', 'quá mệt mỏi', 'không chịu nổi',
    ];

    const lowerText = text.toLowerCase();
    const foundKeywords = crisisKeywords.filter(kw => lowerText.includes(kw));

    return {
      isCrisis: foundKeywords.length > 0,
      keywords: foundKeywords,
    };
  }
}

// Export singleton instance
export const validationService = new ValidationService();
export default validationService;

// Export rules for reference
export { VALIDATION_RULES };
