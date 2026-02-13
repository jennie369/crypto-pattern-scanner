/**
 * Calendar Smart Journal - Access Control Configuration
 * Tier-based access matrix for calendar features
 *
 * Created: January 28, 2026
 * Part of Calendar Smart Journal System
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

export const CALENDAR_ACCESS = {
  // Feature access by tier
  features: {
    // Basic Journal (all tiers)
    basic_journal: {
      free: true,
      tier1: true,
      tier2: true,
      tier3: true,
      limits: {
        free: { entries_per_day: 3, max_characters: 500 },
        tier1: { entries_per_day: 10, max_characters: 2000 },
        tier2: { entries_per_day: 'unlimited', max_characters: 5000 },
        tier3: { entries_per_day: 'unlimited', max_characters: 10000 },
      },
    },

    // Trading Journal
    trading_journal: {
      free: false, // Requires tier
      tier1: true,
      tier2: true,
      tier3: true,
      limits: {
        tier1: { entries_per_day: 5, screenshots: 2 },
        tier2: { entries_per_day: 20, screenshots: 5 },
        tier3: { entries_per_day: 'unlimited', screenshots: 10 },
      },
    },

    // Mood Tracking
    mood_tracking: {
      free: true,
      tier1: true,
      tier2: true,
      tier3: true,
      limits: {
        free: { check_ins_per_day: 2 }, // morning/evening only
        tier1: { check_ins_per_day: 5 },
        tier2: { check_ins_per_day: 'unlimited' },
        tier3: { check_ins_per_day: 'unlimited' },
      },
    },

    // Auto-logging
    auto_logging: {
      free: true, // Basic ritual logging
      tier1: true, // + Divination logging
      tier2: true, // + Goal progress
      tier3: true, // + AI insights
    },

    // Voice Notes
    voice_notes: {
      free: false,
      tier1: true,
      tier2: true,
      tier3: true,
      limits: {
        tier1: { max_duration: 60 }, // 1 minute
        tier2: { max_duration: 180 }, // 3 minutes
        tier3: { max_duration: 600 }, // 10 minutes
      },
    },

    // Image Attachments
    attachments: {
      free: false,
      tier1: true,
      tier2: true,
      tier3: true,
      limits: {
        tier1: { images_per_entry: 2, max_size_mb: 2 },
        tier2: { images_per_entry: 5, max_size_mb: 5 },
        tier3: { images_per_entry: 10, max_size_mb: 10 },
      },
    },

    // Export & Analytics
    export_data: {
      free: false,
      tier1: false,
      tier2: true,
      tier3: true,
    },

    // AI Analysis
    ai_insights: {
      free: false,
      tier1: false,
      tier2: false,
      tier3: true,
    },

    // Calendar History
    history_days: {
      free: 7, // Last 7 days only
      tier1: 30, // Last 30 days
      tier2: 90, // Last 90 days
      tier3: 'unlimited',
    },

    // Midday mood check-in
    midday_mood: {
      free: false,
      tier1: true,
      tier2: true,
      tier3: true,
    },

    // Goal progress logging
    goal_progress: {
      free: true,
      tier1: true,
      tier2: true,
      tier3: true,
      limits: {
        free: { logs_per_day: 3 },
        tier1: { logs_per_day: 10 },
        tier2: { logs_per_day: 'unlimited' },
        tier3: { logs_per_day: 'unlimited' },
      },
    },

    // Search journal entries
    search_journal: {
      free: false,
      tier1: true,
      tier2: true,
      tier3: true,
    },

    // Tags and categories
    tags: {
      free: true,
      tier1: true,
      tier2: true,
      tier3: true,
      limits: {
        free: { max_tags_per_entry: 3 },
        tier1: { max_tags_per_entry: 5 },
        tier2: { max_tags_per_entry: 10 },
        tier3: { max_tags_per_entry: 'unlimited' },
      },
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
  if (access.tier1) return 'Tier 1 tro len';
  if (access.tier2) return 'Tier 2 tro len';
  if (access.tier3) return 'Tier 3';
  return 'nang cap tai khoan';
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
 * Check calendar feature access
 * @param {string} feature - Feature key from CALENDAR_ACCESS.features
 * @param {string} userTier - User's tier (free, tier1, tier2, tier3)
 * @param {string} userRole - User's role (optional - admin/manager bypass)
 * @returns {Object} - { allowed: boolean, limit: object|null, reason: string|null }
 */
export const checkCalendarAccess = (feature, userTier, userRole = null) => {
  // Admin/Manager bypass
  if (isAdminOrManager(userRole)) {
    return {
      allowed: true,
      limit: 'unlimited',
      reason: null,
    };
  }

  const access = CALENDAR_ACCESS.features[feature];
  if (!access) {
    return {
      allowed: false,
      reason: 'Tinh nang khong ton tai',
    };
  }

  const tierKey = normalizeTier(userTier);
  const isAllowed = access[tierKey] === true;
  const limit = access.limits?.[tierKey] || null;

  return {
    allowed: isAllowed,
    limit,
    reason: isAllowed ? null : `Tính năng này yêu cầu ${getRequiredTier(access)}`,
  };
};

/**
 * Get history days limit for user tier
 * @param {string} userTier - User's tier
 * @param {string} userRole - User's role
 * @returns {number|string} - Number of days or 'unlimited'
 */
export const getHistoryDaysLimit = (userTier, userRole = null) => {
  if (isAdminOrManager(userRole)) {
    return 'unlimited';
  }

  const tierKey = normalizeTier(userTier);
  const historyDays = CALENDAR_ACCESS.features.history_days;

  return historyDays[tierKey] || historyDays.free;
};

/**
 * Get character limit for journal entries
 * @param {string} userTier - User's tier
 * @param {string} userRole - User's role
 * @returns {number} - Max characters allowed
 */
export const getJournalCharLimit = (userTier, userRole = null) => {
  if (isAdminOrManager(userRole)) {
    return 100000; // Effectively unlimited
  }

  const tierKey = normalizeTier(userTier);
  const limits = CALENDAR_ACCESS.features.basic_journal.limits;

  return limits[tierKey]?.max_characters || limits.free.max_characters;
};

/**
 * Get daily entry limit for journal
 * @param {string} userTier - User's tier
 * @param {string} userRole - User's role
 * @returns {number|string} - Entry limit or 'unlimited'
 */
export const getJournalDailyLimit = (userTier, userRole = null) => {
  if (isAdminOrManager(userRole)) {
    return 'unlimited';
  }

  const tierKey = normalizeTier(userTier);
  const limits = CALENDAR_ACCESS.features.basic_journal.limits;

  return limits[tierKey]?.entries_per_day || limits.free.entries_per_day;
};

/**
 * Get trading journal daily limit
 * @param {string} userTier - User's tier
 * @param {string} userRole - User's role
 * @returns {number|string|null} - Entry limit, 'unlimited', or null if not allowed
 */
export const getTradingDailyLimit = (userTier, userRole = null) => {
  if (isAdminOrManager(userRole)) {
    return 'unlimited';
  }

  const access = checkCalendarAccess('trading_journal', userTier, userRole);
  if (!access.allowed) {
    return null; // Not allowed
  }

  return access.limit?.entries_per_day || 'unlimited';
};

/**
 * Get screenshot limit for trading journal
 * @param {string} userTier - User's tier
 * @param {string} userRole - User's role
 * @returns {number|null} - Screenshot limit or null if not allowed
 */
export const getTradingScreenshotLimit = (userTier, userRole = null) => {
  if (isAdminOrManager(userRole)) {
    return 20; // High limit for admins
  }

  const access = checkCalendarAccess('trading_journal', userTier, userRole);
  if (!access.allowed) {
    return null;
  }

  return access.limit?.screenshots || 2;
};

/**
 * Get voice note duration limit
 * @param {string} userTier - User's tier
 * @param {string} userRole - User's role
 * @returns {number|null} - Max duration in seconds or null if not allowed
 */
export const getVoiceNoteDurationLimit = (userTier, userRole = null) => {
  if (isAdminOrManager(userRole)) {
    return 1800; // 30 minutes for admins
  }

  const access = checkCalendarAccess('voice_notes', userTier, userRole);
  if (!access.allowed) {
    return null;
  }

  return access.limit?.max_duration || 60;
};

/**
 * Get attachment limits
 * @param {string} userTier - User's tier
 * @param {string} userRole - User's role
 * @returns {Object|null} - { images_per_entry, max_size_mb } or null if not allowed
 */
export const getAttachmentLimits = (userTier, userRole = null) => {
  if (isAdminOrManager(userRole)) {
    return { images_per_entry: 20, max_size_mb: 20 };
  }

  const access = checkCalendarAccess('attachments', userTier, userRole);
  if (!access.allowed) {
    return null;
  }

  return {
    images_per_entry: access.limit?.images_per_entry || 2,
    max_size_mb: access.limit?.max_size_mb || 2,
  };
};

/**
 * Get tags limit per entry
 * @param {string} userTier - User's tier
 * @param {string} userRole - User's role
 * @returns {number|string} - Max tags or 'unlimited'
 */
export const getTagsLimit = (userTier, userRole = null) => {
  if (isAdminOrManager(userRole)) {
    return 'unlimited';
  }

  const tierKey = normalizeTier(userTier);
  const limits = CALENDAR_ACCESS.features.tags.limits;

  return limits[tierKey]?.max_tags_per_entry || limits.free.max_tags_per_entry;
};

/**
 * Check if user can access AI insights
 * @param {string} userTier - User's tier
 * @param {string} userRole - User's role
 * @returns {boolean}
 */
export const canAccessAIInsights = (userTier, userRole = null) => {
  if (isAdminOrManager(userRole)) return true;
  return checkCalendarAccess('ai_insights', userTier, userRole).allowed;
};

/**
 * Check if user can export data
 * @param {string} userTier - User's tier
 * @param {string} userRole - User's role
 * @returns {boolean}
 */
export const canExportData = (userTier, userRole = null) => {
  if (isAdminOrManager(userRole)) return true;
  return checkCalendarAccess('export_data', userTier, userRole).allowed;
};

/**
 * Check if user can search journal
 * @param {string} userTier - User's tier
 * @param {string} userRole - User's role
 * @returns {boolean}
 */
export const canSearchJournal = (userTier, userRole = null) => {
  if (isAdminOrManager(userRole)) return true;
  return checkCalendarAccess('search_journal', userTier, userRole).allowed;
};

/**
 * Check if user can access midday mood check-in
 * @param {string} userTier - User's tier
 * @param {string} userRole - User's role
 * @returns {boolean}
 */
export const canAccessMiddayMood = (userTier, userRole = null) => {
  if (isAdminOrManager(userRole)) return true;
  return checkCalendarAccess('midday_mood', userTier, userRole).allowed;
};

/**
 * Get upgrade prompt message based on feature
 * @param {string} feature - Feature key
 * @param {string} currentTier - User's current tier
 * @returns {Object} - { title, message, targetTier }
 */
export const getUpgradePrompt = (feature, currentTier) => {
  const tierKey = normalizeTier(currentTier);

  const prompts = {
    trading_journal: {
      free: {
        title: 'Mo khoa Trading Journal',
        message: 'Nang cap len Tier 1 de ghi chep giao dich va theo doi hieu suat',
        targetTier: 'tier1',
      },
    },
    voice_notes: {
      free: {
        title: 'Mo khoa Voice Notes',
        message: 'Nang cap len Tier 1 de ghi am nhat ky bang giong noi',
        targetTier: 'tier1',
      },
    },
    attachments: {
      free: {
        title: 'Mo khoa Attachments',
        message: 'Nang cap len Tier 1 de dinh kem hinh anh vao nhat ky',
        targetTier: 'tier1',
      },
    },
    ai_insights: {
      free: {
        title: 'Mo khoa AI Insights',
        message: 'Nang cap len Tier 3 de nhan phan tich AI ve nhat ky cua ban',
        targetTier: 'tier3',
      },
      tier1: {
        title: 'Mo khoa AI Insights',
        message: 'Nang cap len Tier 3 de nhan phan tich AI',
        targetTier: 'tier3',
      },
      tier2: {
        title: 'Mo khoa AI Insights',
        message: 'Nang cap len Tier 3 de nhan phan tich AI',
        targetTier: 'tier3',
      },
    },
    export_data: {
      free: {
        title: 'Mo khoa Export Data',
        message: 'Nang cap len Tier 2 de xuat du lieu nhat ky',
        targetTier: 'tier2',
      },
      tier1: {
        title: 'Mo khoa Export Data',
        message: 'Nang cap len Tier 2 de xuat du lieu nhat ky',
        targetTier: 'tier2',
      },
    },
    search_journal: {
      free: {
        title: 'Mo khoa Search',
        message: 'Nang cap len Tier 1 de tim kiem trong nhat ky',
        targetTier: 'tier1',
      },
    },
    midday_mood: {
      free: {
        title: 'Mo khoa Midday Check-in',
        message: 'Nang cap len Tier 1 de theo doi tam trang giua ngay',
        targetTier: 'tier1',
      },
    },
  };

  return prompts[feature]?.[tierKey] || {
    title: 'Nang cap tai khoan',
    message: 'Nang cap de mo khoa tinh nang nay',
    targetTier: 'tier1',
  };
};

export default {
  TIERS,
  CALENDAR_ACCESS,
  checkCalendarAccess,
  getHistoryDaysLimit,
  getJournalCharLimit,
  getJournalDailyLimit,
  getTradingDailyLimit,
  getTradingScreenshotLimit,
  getVoiceNoteDurationLimit,
  getAttachmentLimits,
  getTagsLimit,
  canAccessAIInsights,
  canExportData,
  canSearchJournal,
  canAccessMiddayMood,
  getUpgradePrompt,
};
