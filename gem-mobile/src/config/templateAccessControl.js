/**
 * Template Access Control Configuration
 * Tier-based access matrix for template features
 *
 * Created: 2026-02-02
 * Pattern: Follow calendarAccessControl.js
 */

// ==================== TIER CONSTANTS ====================

export const TIERS = {
  FREE: 'free',
  TIER1: 'tier1',
  TIER2: 'tier2',
  TIER3: 'tier3',
  ADMIN: 'admin',
  MANAGER: 'manager',
};

// ==================== ACCESS MATRIX ====================

export const TEMPLATE_ACCESS = {
  // Feature access by tier
  features: {
    // ═══════════════════════════════════════════
    // FREE TEMPLATES
    // ═══════════════════════════════════════════
    free_form: {
      free: true,
      tier1: true,
      tier2: true,
      tier3: true,
    },
    gratitude: {
      free: true,
      tier1: true,
      tier2: true,
      tier3: true,
    },
    simple_event: {
      free: true,
      tier1: true,
      tier2: true,
      tier3: true,
    },

    // ═══════════════════════════════════════════
    // TIER1 (Pro) TEMPLATES
    // ═══════════════════════════════════════════
    fear_setting: {
      free: false,
      tier1: true,
      tier2: true,
      tier3: true,
    },
    think_day: {
      free: false,
      tier1: true,
      tier2: true,
      tier3: true,
    },
    weekly_planning: {
      free: false,
      tier1: true,
      tier2: true,
      tier3: true,
    },

    // ═══════════════════════════════════════════
    // TIER2 (Premium) TEMPLATES
    // ═══════════════════════════════════════════
    trading_journal: {
      free: false,
      tier1: false,
      tier2: true,
      tier3: true,
    },
    vision_3_5_years: {
      free: false,
      tier1: false,
      tier2: true,
      tier3: true,
    },
    daily_wins: {
      free: false,
      tier1: false,
      tier2: true,
      tier3: true,
    },

    // ═══════════════════════════════════════════
    // TIER3 (VIP) TEMPLATES
    // ═══════════════════════════════════════════
    prosperity_frequency: {
      free: false,
      tier1: false,
      tier2: false,
      tier3: true,
    },
    advanced_trading_psychology: {
      free: false,
      tier1: false,
      tier2: false,
      tier3: true,
    },

    // Legacy/unused - keep for backward compatibility
    goal_basic: {
      free: true,
      tier1: true,
      tier2: true,
      tier3: true,
    },

    // Features
    intent_detection: {
      free: true,
      tier1: true,
      tier2: true,
      tier3: true,
    },
    auto_goal_creation: {
      free: true,
      tier1: true,
      tier2: true,
      tier3: true,
    },
    template_analytics: {
      free: false,
      tier1: true,
      tier2: true,
      tier3: true,
    },
    export_journal: {
      free: false,
      tier1: false,
      tier2: true,
      tier3: true,
    },
  },

  // Usage limits by tier
  limits: {
    free: {
      templates_per_day: 3,
      goals_per_month: 10,
      actions_per_goal: 5,
      journal_character_limit: 500,
    },
    tier1: {
      templates_per_day: 10,
      goals_per_month: 50,
      actions_per_goal: 10,
      journal_character_limit: 2000,
    },
    tier2: {
      templates_per_day: 'unlimited',
      goals_per_month: 200,
      actions_per_goal: 20,
      journal_character_limit: 5000,
    },
    tier3: {
      templates_per_day: 'unlimited',
      goals_per_month: 'unlimited',
      actions_per_goal: 'unlimited',
      journal_character_limit: 10000,
    },
  },

  // Role-based overrides
  roles: {
    manager: 'unlimited_all',
    admin: 'unlimited_all',
  },
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get required tier display name
 */
const getRequiredTier = (access) => {
  if (access.free) return null;
  if (access.tier1) return 'Tier 1 trở lên';
  if (access.tier2) return 'Tier 2 trở lên';
  if (access.tier3) return 'Tier 3';
  return 'nâng cấp tài khoản';
};

/**
 * Normalize tier name
 */
const normalizeTier = (tier) => {
  if (!tier) return 'free';
  const tierLower = tier.toString().toLowerCase();

  // Handle common aliases
  const aliases = {
    pro: 'tier1',
    premium: 'tier2',
    vip: 'tier3',
    elite: 'tier3',
  };

  return aliases[tierLower] || tierLower;
};

/**
 * Check if user has admin/manager role
 */
const isAdminOrManager = (userRole) => {
  if (!userRole) return false;
  const role = userRole.toString().toLowerCase();
  return role === 'admin' || role === 'manager';
};

/**
 * Check template feature access
 * @param {string} templateId - Template ID
 * @param {string} userTier - User's tier (free, tier1, tier2, tier3, ADMIN)
 * @param {string} userRole - User's role (optional - admin/manager bypass)
 * @returns {Object} - { allowed: boolean, limit: object|null, reason: string|null }
 */
export const checkTemplateAccess = (templateId, userTier, userRole = null) => {
  // Admin/Manager bypass - check both userRole AND userTier
  if (isAdminOrManager(userRole) || isAdminOrManager(userTier)) {
    return {
      allowed: true,
      limit: 'unlimited',
      reason: null,
    };
  }

  const access = TEMPLATE_ACCESS.features[templateId];
  if (!access) {
    // Template not in access control = allow by default
    return {
      allowed: true,
      reason: null,
    };
  }

  const tierKey = normalizeTier(userTier);
  const isAllowed = access[tierKey] === true;

  return {
    allowed: isAllowed,
    reason: isAllowed ? null : `Tính năng này yêu cầu ${getRequiredTier(access)}`,
  };
};

/**
 * Get template daily limit
 * @param {string} userTier - User's tier
 * @param {string} userRole - User's role
 * @returns {number|string} - Daily limit or 'unlimited'
 */
export const getTemplateDailyLimit = (userTier, userRole = null) => {
  // Check both userRole AND userTier for admin bypass
  if (isAdminOrManager(userRole) || isAdminOrManager(userTier)) {
    return 'unlimited';
  }

  const tierKey = normalizeTier(userTier);
  const limits = TEMPLATE_ACCESS.limits[tierKey] || TEMPLATE_ACCESS.limits.free;

  return limits.templates_per_day;
};

/**
 * Get goals per month limit
 * @param {string} userTier - User's tier
 * @param {string} userRole - User's role
 * @returns {number|string} - Monthly limit or 'unlimited'
 */
export const getGoalsPerMonthLimit = (userTier, userRole = null) => {
  if (isAdminOrManager(userRole) || isAdminOrManager(userTier)) {
    return 'unlimited';
  }

  const tierKey = normalizeTier(userTier);
  const limits = TEMPLATE_ACCESS.limits[tierKey] || TEMPLATE_ACCESS.limits.free;

  return limits.goals_per_month;
};

/**
 * Get actions per goal limit
 * @param {string} userTier - User's tier
 * @param {string} userRole - User's role
 * @returns {number|string} - Actions limit or 'unlimited'
 */
export const getActionsPerGoalLimit = (userTier, userRole = null) => {
  if (isAdminOrManager(userRole) || isAdminOrManager(userTier)) {
    return 'unlimited';
  }

  const tierKey = normalizeTier(userTier);
  const limits = TEMPLATE_ACCESS.limits[tierKey] || TEMPLATE_ACCESS.limits.free;

  return limits.actions_per_goal;
};

/**
 * Get journal character limit
 * @param {string} userTier - User's tier
 * @param {string} userRole - User's role
 * @returns {number} - Character limit
 */
export const getJournalCharacterLimit = (userTier, userRole = null) => {
  if (isAdminOrManager(userRole) || isAdminOrManager(userTier)) {
    return 100000; // Effectively unlimited
  }

  const tierKey = normalizeTier(userTier);
  const limits = TEMPLATE_ACCESS.limits[tierKey] || TEMPLATE_ACCESS.limits.free;

  return limits.journal_character_limit;
};

/**
 * Check if user can access template analytics
 * @param {string} userTier - User's tier
 * @param {string} userRole - User's role
 * @returns {boolean}
 */
export const canAccessTemplateAnalytics = (userTier, userRole = null) => {
  if (isAdminOrManager(userRole)) return true;
  return checkTemplateAccess('template_analytics', userTier, userRole).allowed;
};

/**
 * Check if user can export journal
 * @param {string} userTier - User's tier
 * @param {string} userRole - User's role
 * @returns {boolean}
 */
export const canExportJournal = (userTier, userRole = null) => {
  if (isAdminOrManager(userRole)) return true;
  return checkTemplateAccess('export_journal', userTier, userRole).allowed;
};

/**
 * Get upgrade prompt message for template
 * @param {string} templateId - Template ID
 * @param {string} currentTier - User's current tier
 * @returns {Object} - { title, message, targetTier }
 */
export const getUpgradePromptForTemplate = (templateId, currentTier) => {
  const tierKey = normalizeTier(currentTier);
  const access = TEMPLATE_ACCESS.features[templateId];

  if (!access) {
    return {
      title: 'Nâng cấp tài khoản',
      message: 'Nâng cấp để mở khóa tính năng này',
      targetTier: 'tier1',
    };
  }

  // Determine required tier
  let requiredTier = 'tier1';
  if (!access.tier1) requiredTier = 'tier2';
  if (!access.tier2) requiredTier = 'tier3';

  const templateNames = {
    // TIER1 (Pro)
    fear_setting: 'Đối diện nỗi sợ',
    think_day: 'Think Day',
    weekly_planning: 'Tuần mới',
    // TIER2 (Premium)
    trading_journal: 'Nhật ký Trading',
    vision_3_5_years: 'Tầm nhìn 3-5 năm',
    daily_wins: 'Chiến thắng hôm nay',
    // TIER3 (VIP)
    prosperity_frequency: 'Tần Số Thịnh Vượng',
    advanced_trading_psychology: 'Tâm Lý Giao Dịch Nâng Cao',
    // Features
    template_analytics: 'Phân tích template',
    export_journal: 'Xuất nhật ký',
  };

  const tierNames = {
    tier1: 'Tier 1',
    tier2: 'Tier 2',
    tier3: 'Tier 3',
  };

  return {
    title: `Mở khóa ${templateNames[templateId] || templateId}`,
    message: `Nâng cấp lên ${tierNames[requiredTier]} để sử dụng template này`,
    targetTier: requiredTier,
  };
};

/**
 * Get all templates with access info for user
 * @param {string} userTier - User's tier
 * @param {string} userRole - User's role
 * @returns {Array} - Templates with access info
 */
export const getTemplatesWithAccess = (userTier, userRole = null) => {
  const templates = Object.keys(TEMPLATE_ACCESS.features).filter(
    (key) => !['intent_detection', 'auto_goal_creation', 'template_analytics', 'export_journal'].includes(key)
  );

  return templates.map((templateId) => {
    const access = checkTemplateAccess(templateId, userTier, userRole);
    return {
      id: templateId,
      ...access,
      upgradeInfo: access.allowed ? null : getUpgradePromptForTemplate(templateId, userTier),
    };
  });
};

/**
 * Check if user has reached daily template limit
 * @param {number} currentCount - Current count of templates used today
 * @param {string} userTier - User's tier
 * @param {string} userRole - User's role
 * @returns {Object} - { reachedLimit: boolean, remaining: number|string }
 */
export const checkDailyLimitStatus = (currentCount, userTier, userRole = null) => {
  const limit = getTemplateDailyLimit(userTier, userRole);

  if (limit === 'unlimited') {
    return {
      reachedLimit: false,
      remaining: 'unlimited',
    };
  }

  return {
    reachedLimit: currentCount >= limit,
    remaining: Math.max(0, limit - currentCount),
  };
};

export default {
  TIERS,
  TEMPLATE_ACCESS,
  checkTemplateAccess,
  getTemplateDailyLimit,
  getGoalsPerMonthLimit,
  getActionsPerGoalLimit,
  getJournalCharacterLimit,
  canAccessTemplateAnalytics,
  canExportJournal,
  getUpgradePromptForTemplate,
  getTemplatesWithAccess,
  checkDailyLimitStatus,
};
