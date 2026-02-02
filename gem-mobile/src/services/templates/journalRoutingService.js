/**
 * Journal Routing Service
 *
 * Core submission logic for centralized templates:
 * - Always creates journal entry
 * - Creates goal only when user ticks checkbox
 * - Handles two-way linking between journal and goal
 * - Schedules notifications for rituals
 *
 * Created: 2026-02-02
 */

import { supabase } from '../supabase';
import { getTemplate, canAccessTemplate, FIELD_TYPES } from './journalTemplates';
import { validateTemplateForm, sanitizeFormData } from './templateValidationService';
import { checkTemplateAccess, getTemplateDailyLimit } from '../../config/templateAccessControl';

const SERVICE_NAME = '[JournalRoutingService]';

// ==================== CONSTANTS ====================

const ENTRY_POINTS = {
  GEM_MASTER: 'gemmaster',
  VISION_BOARD: 'visionboard',
  CALENDAR: 'calendar',
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Build journal content from template data
 */
const buildJournalContent = (template, formData) => {
  // Create readable content from form data
  const contentParts = [];

  for (const field of template.fields || []) {
    const value = formData[field.id];
    if (!value) continue;

    switch (field.type) {
      case FIELD_TYPES.TEXT:
      case FIELD_TYPES.TEXTAREA:
        // Handle array values (multi-select affirmations/rituals)
        if (Array.isArray(value)) {
          if (value.length > 0) {
            const items = value.map(v => `- ${v}`).join('\n');
            contentParts.push(`**${field.label}**:\n${items}`);
          }
        } else {
          contentParts.push(`**${field.label}**: ${value}`);
        }
        break;

      case FIELD_TYPES.SLIDER:
        const labels = field.labels || {};
        const labelText = labels[value] || '';
        contentParts.push(`**${field.label}**: ${value}/10 ${labelText}`);
        break;

      case FIELD_TYPES.CHECKLIST:
        if (Array.isArray(value) && value.length > 0) {
          const items = value.map((item) => `- [${item.completed ? 'x' : ' '}] ${item.text}`);
          contentParts.push(`**${field.label}**:\n${items.join('\n')}`);
        }
        break;

      case FIELD_TYPES.ACTION_LIST:
        if (Array.isArray(value) && value.length > 0) {
          const items = value.map((item) =>
            `- [${item.checked ? 'x' : ' '}] ${item.text}${item.lifeArea ? ` (${item.lifeArea})` : ''}`
          );
          contentParts.push(`**${field.label}**:\n${items.join('\n')}`);
        }
        break;

      case FIELD_TYPES.SELECT:
        const option = field.options?.find((o) => o.value === value);
        contentParts.push(`**${field.label}**: ${option?.label || value}`);
        break;

      case FIELD_TYPES.LIFE_AREA:
        contentParts.push(`**${field.label}**: ${value}`);
        break;

      default:
        if (value) {
          contentParts.push(`**${field.label}**: ${value}`);
        }
    }
  }

  return contentParts.join('\n\n');
};

/**
 * Extract checked actions from form data
 */
const extractCheckedActions = (template, formData) => {
  const checkedActions = [];

  for (const field of template.fields || []) {
    if (field.type === FIELD_TYPES.ACTION_LIST && field.canCreateGoal) {
      const actions = formData[field.id] || [];
      for (const action of actions) {
        if (action.checked) {
          checkedActions.push({
            ...action,
            sourceField: field.id,
          });
        }
      }
    }
  }

  return checkedActions;
};

/**
 * Extract ALL actions from form data (for widget content display)
 */
const extractAllActions = (template, formData) => {
  const allActions = [];

  for (const field of template.fields || []) {
    if (field.type === FIELD_TYPES.ACTION_LIST) {
      const actions = formData[field.id] || [];
      for (const action of actions) {
        if (action.text) {
          allActions.push({
            id: action.id || `action_${Date.now()}_${allActions.length}`,
            title: action.text,
            text: action.text,
            action_type: action.action_type || 'daily',
            is_completed: false,
            completed: false,
            lifeArea: action.lifeArea || null,
          });
        }
      }
    }
  }

  return allActions;
};

/**
 * Extract affirmations from form data
 */
const extractAffirmations = (template, formData) => {
  const affirmations = [];

  // Check common affirmation field names
  const affirmationFields = ['affirmation', 'weekly_affirmation', 'affirmations'];

  for (const fieldId of affirmationFields) {
    const value = formData[fieldId];
    if (value) {
      if (Array.isArray(value)) {
        // Array of affirmations
        affirmations.push(...value.filter((a) => a && (typeof a === 'string' ? a.trim() : a.text?.trim())));
      } else if (typeof value === 'string' && value.trim()) {
        affirmations.push(value.trim());
      }
    }
  }

  return affirmations;
};

/**
 * Extract rituals from form data
 */
const extractRituals = (template, formData) => {
  const rituals = [];

  // Check common ritual field names
  const ritualFields = ['ritual', 'rituals'];

  for (const fieldId of ritualFields) {
    const value = formData[fieldId];
    if (value) {
      if (Array.isArray(value)) {
        // Array of rituals
        for (const r of value) {
          if (r) {
            const title = typeof r === 'string' ? r : (r.title || r.name || '');
            if (title.trim()) {
              rituals.push({
                id: r.id || `ritual_${Date.now()}_${rituals.length}`,
                title: title.trim(),
                name: title.trim(),
                description: r.description || '',
                frequency: r.frequency || 'daily',
              });
            }
          }
        }
      } else if (typeof value === 'string' && value.trim()) {
        rituals.push({
          id: `ritual_${Date.now()}_0`,
          title: value.trim(),
          name: value.trim(),
          description: '',
          frequency: 'daily',
        });
      }
    }
  }

  return rituals;
};

/**
 * Extract title for goal from form data
 */
const getGoalTitle = (template, formData) => {
  // Priority: title > fear_target > first action > template name
  if (formData.title) return formData.title;
  if (formData.fear_target) return formData.fear_target;

  // Get first checked action
  for (const field of template.fields || []) {
    if (field.type === FIELD_TYPES.ACTION_LIST) {
      const actions = formData[field.id] || [];
      const firstChecked = actions.find((a) => a.checked);
      if (firstChecked) return firstChecked.text;
    }
  }

  return `${template.name} Goal`;
};

/**
 * Get life area from form data
 */
const getLifeArea = (template, formData) => {
  // Priority: explicit life_area field > checked action's life area > template default
  if (formData.life_area) return formData.life_area;

  // Get from first checked action
  for (const field of template.fields || []) {
    if (field.type === FIELD_TYPES.ACTION_LIST) {
      const actions = formData[field.id] || [];
      const firstChecked = actions.find((a) => a.checked && a.lifeArea);
      if (firstChecked) return firstChecked.lifeArea;
    }
  }

  return template.defaultLifeArea || 'personal_growth';
};

/**
 * Check daily template limit
 */
const checkDailyLimit = async (userId, userTier, userRole) => {
  const limit = getTemplateDailyLimit ? getTemplateDailyLimit(userTier, userRole) : 'unlimited';

  if (limit === 'unlimited') {
    return { allowed: true };
  }

  // Count today's entries
  const today = new Date().toISOString().split('T')[0];
  const { count, error } = await supabase
    .from('calendar_journal_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('entry_date', today)
    .not('template_id', 'is', null);

  if (error) {
    console.error(`${SERVICE_NAME} Error checking daily limit:`, error);
    return { allowed: true }; // Allow on error
  }

  if (count >= limit) {
    return {
      allowed: false,
      reason: `Bạn đã đạt giới hạn ${limit} template/ngày. Nâng cấp để sử dụng không giới hạn.`,
      limitReached: true,
    };
  }

  return { allowed: true };
};

// ==================== MAIN FUNCTIONS ====================

/**
 * Process template form submission
 *
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.templateId - Template ID
 * @param {Object} params.formData - Form data
 * @param {string} params.entryPoint - Entry point (gemmaster, visionboard, calendar)
 * @param {string} params.userTier - User's tier
 * @param {string} params.userRole - User's role
 * @param {boolean} params.createGoal - Whether to create goal (from checkbox)
 *
 * @returns {Promise<Object>} - { success, journalEntry, goal, actionsCreated, message, error }
 */
export const processTemplateSubmission = async ({
  userId,
  templateId,
  formData,
  entryPoint = ENTRY_POINTS.CALENDAR,
  userTier = 'free',
  userRole = null,
  createGoal = false,
}) => {
  console.log(`${SERVICE_NAME} Processing template submission`, {
    templateId,
    entryPoint,
    createGoal,
  });

  try {
    // 1. Get template definition
    const template = getTemplate(templateId);
    if (!template) {
      return {
        success: false,
        error: 'Template không tồn tại',
      };
    }

    // 2. Check template access (pass userRole for admin bypass)
    const access = canAccessTemplate(templateId, userTier, userRole);
    if (!access.allowed) {
      return {
        success: false,
        error: access.reason,
        upgradeRequired: access.upgradeRequired,
      };
    }

    // 3. Check daily limit
    const limitCheck = await checkDailyLimit(userId, userTier, userRole);
    if (!limitCheck.allowed) {
      return {
        success: false,
        error: limitCheck.reason,
        limitReached: true,
      };
    }

    // 4. Validate form data
    const validation = validateTemplateForm(template, formData);
    if (!validation.isValid) {
      return {
        success: false,
        error: 'Vui lòng kiểm tra lại các trường',
        errors: validation.errors,
        firstErrorField: validation.firstErrorField,
      };
    }

    // 5. Sanitize form data
    const sanitizedData = sanitizeFormData(template, formData);

    // 6. Build journal content
    const journalContent = buildJournalContent(template, sanitizedData);

    // 7. ALWAYS create journal entry
    // Use local date format for entry_date to match calendar display
    const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    console.log(`${SERVICE_NAME} Creating journal with local date:`, localDate, 'vs UTC:', now.toISOString().split('T')[0]);

    // Build base journal data (fields that always exist)
    const baseJournalData = {
      user_id: userId,
      entry_date: localDate,
      entry_type: template.category === 'trading_journal' ? 'trading' : 'reflection',
      title: sanitizedData.title || template.name,
      content: journalContent,
      life_area: getLifeArea(template, sanitizedData),
      mood: sanitizedData.mood || null,
    };

    // Add template-specific fields (may not exist if migration not run)
    const journalData = {
      ...baseJournalData,
      template_id: templateId,
      template_data: sanitizedData,
      template_version: 1,
      source_entry_point: entryPoint,
      linked_goal_ids: [],
    };

    console.log(`${SERVICE_NAME} Inserting journal with data:`, {
      ...journalData,
      template_data: '[SANITIZED]',
    });

    let journalEntry = null;
    let journalError = null;

    // Try full insert first
    const { data: fullInsert, error: fullError } = await supabase
      .from('calendar_journal_entries')
      .insert(journalData)
      .select()
      .single();

    if (fullError) {
      console.warn(`${SERVICE_NAME} Full insert failed, trying base insert:`, fullError.message);

      // Fallback to base fields only (in case template columns don't exist)
      const { data: baseInsert, error: baseError } = await supabase
        .from('calendar_journal_entries')
        .insert(baseJournalData)
        .select()
        .single();

      if (baseError) {
        console.error(`${SERVICE_NAME} Base insert also failed:`, baseError);
        journalError = baseError;
      } else {
        journalEntry = baseInsert;
        console.log(`${SERVICE_NAME} Created journal with base fields only`);
      }
    } else {
      journalEntry = fullInsert;
    }

    if (journalError) {
      console.error(`${SERVICE_NAME} Error creating journal:`, journalError);
      throw new Error(`Không thể tạo nhật ký: ${journalError.message}`);
    }

    console.log(`${SERVICE_NAME} Created journal entry:`, journalEntry.id);

    // 8. Check if we should create goal
    const checkedActions = extractCheckedActions(template, sanitizedData);
    const shouldCreateGoal = createGoal || checkedActions.length > 0 || validation.hasCheckedAction;

    let createdGoal = null;
    let actionsCreated = 0;

    if (shouldCreateGoal) {
      // 9. Create goal
      // Build base goal data (fields that always exist)
      const baseGoalData = {
        user_id: userId,
        title: getGoalTitle(template, sanitizedData),
        description: sanitizedData.description || journalContent.substring(0, 500),
        life_area: getLifeArea(template, sanitizedData),
        status: 'active',
        progress_percent: 0,
      };

      // Full goal data with template-specific fields
      const goalData = {
        ...baseGoalData,
        source_journal_id: journalEntry.id,
        created_from_template: templateId,
      };

      console.log(`${SERVICE_NAME} Creating goal:`, { ...goalData, description: '[TRUNCATED]' });

      // Try full insert first
      let goal = null;
      let goalError = null;

      const { data: fullGoal, error: fullGoalError } = await supabase
        .from('vision_goals')
        .insert(goalData)
        .select()
        .single();

      if (fullGoalError) {
        console.warn(`${SERVICE_NAME} Full goal insert failed, trying base:`, fullGoalError.message);

        // Fallback to base fields
        const { data: baseGoal, error: baseGoalError } = await supabase
          .from('vision_goals')
          .insert(baseGoalData)
          .select()
          .single();

        if (baseGoalError) {
          goalError = baseGoalError;
        } else {
          goal = baseGoal;
        }
      } else {
        goal = fullGoal;
      }

      if (goalError) {
        console.error(`${SERVICE_NAME} Error creating goal:`, goalError);
        // Don't fail - journal was created successfully
        console.warn(`${SERVICE_NAME} Goal creation failed but journal saved`);
      }

      if (goal) {
        createdGoal = goal;
        console.log(`${SERVICE_NAME} Created goal:`, goal.id);

        // 10. Create goal actions from checked items
        if (checkedActions.length > 0) {
          const actionInserts = checkedActions.map((action) => ({
            goal_id: goal.id,
            user_id: userId,
            title: action.text,
            description: '',
            is_completed: false,
            weight: 1,
            xp_reward: 20,
          }));

          const { error: actionsError } = await supabase
            .from('vision_actions')
            .insert(actionInserts);

          if (actionsError) {
            console.error(`${SERVICE_NAME} Error creating actions:`, actionsError);
          } else {
            actionsCreated = actionInserts.length;
          }
        }

        // 11. Update journal with linked goal ID (two-way link)
        const { error: linkError } = await supabase
          .from('calendar_journal_entries')
          .update({
            linked_goal_ids: [goal.id],
          })
          .eq('id', journalEntry.id);

        if (linkError) {
          console.error(`${SERVICE_NAME} Error linking journal to goal:`, linkError);
        }

        // 12. Extract all template data for widget content
        const allActions = extractAllActions(template, sanitizedData);
        const allAffirmations = extractAffirmations(template, sanitizedData);
        const allRituals = extractRituals(template, sanitizedData);

        console.log(`${SERVICE_NAME} Extracted for widget:`, {
          actions: allActions.length,
          affirmations: allAffirmations.length,
          rituals: allRituals.length,
          actionsSample: allActions.slice(0, 2),
          affirmationsSample: allAffirmations.slice(0, 2),
          ritualsSample: allRituals.slice(0, 2),
          templateFields: template.fields?.map(f => ({ id: f.id, type: f.type })),
          formDataKeys: Object.keys(sanitizedData),
        });

        // 13. Create widget in vision_board_widgets for UI display
        const widgetData = {
          user_id: userId,
          type: 'goal',
          title: goal.title,
          icon: 'target',
          content: {
            lifeArea: goal.life_area,
            // Main goal info
            goals: [{
              id: `goal_${Date.now()}_0`,
              title: goal.title,
              completed: false,
              // Include actions in goals[0] for GoalDetailScreen compatibility
              actionSteps: allActions,
              affirmations: allAffirmations,
              rituals: allRituals,
            }],
            // Also include at top level for different read patterns
            steps: allActions,
            actionSteps: allActions,
            affirmations: allAffirmations,
            rituals: allRituals,
            // Template data reference
            template_id: templateId,
            template_data: sanitizedData,
            // Linking IDs
            vision_goal_id: goal.id,
            journal_id: journalEntry.id,
            source: entryPoint,
          },
          is_active: true,
        };

        const { data: widget, error: widgetError } = await supabase
          .from('vision_board_widgets')
          .insert(widgetData)
          .select()
          .single();

        if (widgetError) {
          console.error(`${SERVICE_NAME} Error creating widget:`, widgetError);
        } else {
          console.log(`${SERVICE_NAME} Created widget:`, widget?.id);
        }
      }
    }

    // 14. Record analytics
    try {
      await supabase.from('template_usage_analytics').insert({
        user_id: userId,
        template_id: templateId,
        entry_point: entryPoint,
        fields_filled: validation.filledFieldsCount,
        goals_created: createdGoal ? 1 : 0,
        journal_created: true,
        goal_created: !!createdGoal,
      });
    } catch (analyticsError) {
      console.warn(`${SERVICE_NAME} Analytics insert failed:`, analyticsError);
    }

    // 15. Build success message
    let message = 'Đã lưu nhật ký';
    if (createdGoal) {
      message = actionsCreated > 0
        ? `Đã tạo nhật ký và mục tiêu với ${actionsCreated} hành động`
        : 'Đã tạo nhật ký và mục tiêu';
    }

    return {
      success: true,
      journalEntry,
      goal: createdGoal,
      actionsCreated,
      message,
    };
  } catch (error) {
    console.error(`${SERVICE_NAME} processTemplateSubmission error:`, error);
    return {
      success: false,
      error: error.message || 'Không thể lưu. Vui lòng thử lại.',
    };
  }
};

/**
 * Create goal from an unchecked journal action
 *
 * @param {string} userId - User ID
 * @param {string} journalId - Journal entry ID
 * @param {string} actionId - Action ID within journal's template_data
 * @param {string} lifeArea - Life area for the goal
 *
 * @returns {Promise<Object>} - { success, goal, error }
 */
export const createGoalFromJournalAction = async (userId, journalId, actionId, lifeArea) => {
  console.log(`${SERVICE_NAME} Creating goal from journal action`, { journalId, actionId });

  try {
    // Get journal entry
    const { data: journal, error: journalError } = await supabase
      .from('calendar_journal_entries')
      .select('*')
      .eq('id', journalId)
      .eq('user_id', userId)
      .single();

    if (journalError || !journal) {
      return { success: false, error: 'Không tìm thấy nhật ký' };
    }

    // Find the action in template_data
    const templateData = journal.template_data || {};
    let actionText = null;
    let sourceField = null;

    for (const [fieldId, fieldValue] of Object.entries(templateData)) {
      if (Array.isArray(fieldValue)) {
        const action = fieldValue.find((a) => a.id === actionId);
        if (action) {
          actionText = action.text;
          sourceField = fieldId;
          break;
        }
      }
    }

    if (!actionText) {
      return { success: false, error: 'Không tìm thấy hành động' };
    }

    // Create goal
    const goalData = {
      user_id: userId,
      title: actionText,
      description: `Từ nhật ký: ${journal.title || journal.template_id}`,
      life_area: lifeArea || journal.life_area || 'personal_growth',
      source_journal_id: journalId,
      created_from_template: journal.template_id,
      status: 'active',
      progress_percent: 0,
    };

    const { data: goal, error: goalError } = await supabase
      .from('vision_goals')
      .insert(goalData)
      .select()
      .single();

    if (goalError) {
      throw goalError;
    }

    // Update linked_goal_ids in journal
    const existingLinks = journal.linked_goal_ids || [];
    const { error: updateError } = await supabase
      .from('calendar_journal_entries')
      .update({
        linked_goal_ids: [...existingLinks, goal.id],
      })
      .eq('id', journalId);

    if (updateError) {
      console.error(`${SERVICE_NAME} Error updating journal links:`, updateError);
    }

    // Mark action as checked in template_data
    const updatedTemplateData = { ...templateData };
    if (updatedTemplateData[sourceField]) {
      updatedTemplateData[sourceField] = updatedTemplateData[sourceField].map((item) =>
        item.id === actionId ? { ...item, checked: true, goalId: goal.id } : item
      );

      await supabase
        .from('calendar_journal_entries')
        .update({ template_data: updatedTemplateData })
        .eq('id', journalId);
    }

    return {
      success: true,
      goal,
      message: 'Đã tạo mục tiêu từ hành động',
    };
  } catch (error) {
    console.error(`${SERVICE_NAME} createGoalFromJournalAction error:`, error);
    return { success: false, error: error.message || 'Không thể tạo mục tiêu' };
  }
};

/**
 * Get journal entry with linked goals
 *
 * @param {string} userId - User ID
 * @param {string} journalId - Journal entry ID
 *
 * @returns {Promise<Object>} - { success, journal, linkedGoals, error }
 */
export const getJournalWithLinkedGoals = async (userId, journalId) => {
  try {
    // Get journal
    const { data: journal, error: journalError } = await supabase
      .from('calendar_journal_entries')
      .select('*')
      .eq('id', journalId)
      .eq('user_id', userId)
      .single();

    if (journalError || !journal) {
      return { success: false, error: 'Không tìm thấy nhật ký' };
    }

    // Get linked goals
    let linkedGoals = [];
    if (journal.linked_goal_ids && journal.linked_goal_ids.length > 0) {
      const { data: goals, error: goalsError } = await supabase
        .from('vision_goals')
        .select('id, title, status, progress, life_area')
        .in('id', journal.linked_goal_ids);

      if (!goalsError && goals) {
        linkedGoals = goals;
      }
    }

    return {
      success: true,
      journal,
      linkedGoals,
    };
  } catch (error) {
    console.error(`${SERVICE_NAME} getJournalWithLinkedGoals error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Get goal with source journal
 *
 * @param {string} userId - User ID
 * @param {string} goalId - Goal ID
 *
 * @returns {Promise<Object>} - { success, goal, sourceJournal, error }
 */
export const getGoalWithSourceJournal = async (userId, goalId) => {
  try {
    // Get goal
    const { data: goal, error: goalError } = await supabase
      .from('vision_goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', userId)
      .single();

    if (goalError || !goal) {
      return { success: false, error: 'Không tìm thấy mục tiêu' };
    }

    // Get source journal if exists
    let sourceJournal = null;
    if (goal.source_journal_id) {
      const { data: journal, error: journalError } = await supabase
        .from('calendar_journal_entries')
        .select('id, title, template_id, entry_date, content')
        .eq('id', goal.source_journal_id)
        .single();

      if (!journalError && journal) {
        sourceJournal = journal;
      }
    }

    return {
      success: true,
      goal,
      sourceJournal,
    };
  } catch (error) {
    console.error(`${SERVICE_NAME} getGoalWithSourceJournal error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Get or create user template settings
 *
 * @param {string} userId - User ID
 *
 * @returns {Promise<Object>} - { success, settings, error }
 */
export const getOrCreateTemplateSettings = async (userId) => {
  try {
    // Try to get existing settings
    let { data: settings, error } = await supabase
      .from('user_template_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    // If not found, create default settings
    if (error && error.code === 'PGRST116') {
      const { data: newSettings, error: insertError } = await supabase
        .from('user_template_settings')
        .insert({ user_id: userId })
        .select()
        .single();

      if (insertError) throw insertError;
      settings = newSettings;
    } else if (error) {
      throw error;
    }

    return { success: true, settings };
  } catch (error) {
    console.error(`${SERVICE_NAME} getOrCreateTemplateSettings error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Update user template settings
 *
 * @param {string} userId - User ID
 * @param {Object} updates - Settings updates
 *
 * @returns {Promise<Object>} - { success, settings, error }
 */
export const updateTemplateSettings = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('user_template_settings')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, settings: data };
  } catch (error) {
    console.error(`${SERVICE_NAME} updateTemplateSettings error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Create quick goal with journal linking (for "Tạo nhanh theo lĩnh vực" flow)
 * This function creates:
 * - Journal entry documenting the goal
 * - Goal in vision_goals table
 * - Actions in vision_actions table
 * - Widget in vision_board_widgets for UI display
 * - Two-way linking between journal and goal
 *
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.lifeArea - Life area key
 * @param {string} params.goalTitle - Goal title
 * @param {string} params.goalDescription - Goal description (optional)
 * @param {Array} params.actions - Array of action items
 * @param {Array} params.affirmations - Array of affirmations
 * @param {Object} params.questionnaire - Questionnaire answers (optional)
 * @param {string} params.deadline - Goal deadline (optional)
 * @param {Array} params.rituals - Array of rituals (optional)
 *
 * @returns {Promise<Object>} - { success, journal, goal, widget, error }
 */
export const createQuickGoalWithJournal = async ({
  userId,
  lifeArea,
  goalTitle,
  goalDescription = '',
  actions = [],
  affirmations = [],
  questionnaire = null,
  deadline = null,
  rituals = [],
  crystals = [],
  source = 'vision_board', // Track where goal came from (tarot, iching, gemmaster, vision_board)
}) => {
  console.log(`${SERVICE_NAME} Creating quick goal with journal link`, {
    lifeArea,
    goalTitle,
    actionsCount: actions.length,
  });

  try {
    const timestamp = Date.now();
    const today = new Date().toISOString().split('T')[0];

    // 1. Build journal content
    const journalContent = [
      `**Mục tiêu**: ${goalTitle}`,
      goalDescription ? `**Mô tả**: ${goalDescription}` : null,
      `**Lĩnh vực**: ${lifeArea}`,
      deadline ? `**Deadline**: ${deadline}` : null,
      actions.length > 0 ? `\n**Kế hoạch hành động**:\n${actions.map(a => `- ${a.title || a.text || a}`).join('\n')}` : null,
      affirmations.length > 0 ? `\n**Khẳng định**:\n${affirmations.map(a => `- ${a}`).join('\n')}` : null,
      rituals.length > 0 ? `\n**Nghi thức**:\n${rituals.map(r => `- ${r.name || r}`).join('\n')}` : null,
      crystals.length > 0 ? `\n**Tinh thể hỗ trợ**:\n${crystals.map(c => `- ${c.name || c}`).join('\n')}` : null,
    ].filter(Boolean).join('\n');

    // 2. Create journal entry
    const journalData = {
      user_id: userId,
      entry_date: today,
      entry_type: 'goal_creation',
      title: `Mục tiêu: ${goalTitle}`,
      content: journalContent,
      template_id: 'quick_goal',
      template_data: {
        goalTitle,
        goalDescription,
        lifeArea,
        actions,
        affirmations,
        questionnaire,
        deadline,
        rituals,
        crystals,
        source, // Track where goal came from (tarot, iching, gemmaster, vision_board)
      },
      template_version: 1,
      source_entry_point: ENTRY_POINTS.VISION_BOARD,
      life_area: lifeArea,
      linked_goal_ids: [],
    };

    const { data: journalEntry, error: journalError } = await supabase
      .from('calendar_journal_entries')
      .insert(journalData)
      .select()
      .single();

    if (journalError) {
      console.error(`${SERVICE_NAME} Error creating journal:`, journalError);
      // Continue even if journal fails - goal creation is primary
    }

    console.log(`${SERVICE_NAME} Created journal entry:`, journalEntry?.id);

    // 3. Create goal in vision_goals
    const goalData = {
      user_id: userId,
      title: goalTitle,
      description: goalDescription || journalContent.substring(0, 500),
      life_area: lifeArea,
      source_journal_id: journalEntry?.id || null,
      created_from_template: 'quick_goal',
      status: 'active',
      progress_percent: 0,
      deadline: deadline || null,
    };

    const { data: goal, error: goalError } = await supabase
      .from('vision_goals')
      .insert(goalData)
      .select()
      .single();

    if (goalError) {
      console.error(`${SERVICE_NAME} Error creating vision_goal:`, goalError);
      // Continue to widget creation
    }

    console.log(`${SERVICE_NAME} Created vision_goal:`, goal?.id);

    // 4. Create vision_actions if actions provided
    let actionsCreated = 0;
    if (goal && actions.length > 0) {
      const actionInserts = actions.map((action) => ({
        goal_id: goal.id,
        user_id: userId,
        title: typeof action === 'string' ? action : (action.title || action.text || ''),
        description: '',
        is_completed: false,
        weight: 1,
        xp_reward: 20,
      }));

      const { error: actionsError } = await supabase
        .from('vision_actions')
        .insert(actionInserts);

      if (!actionsError) {
        actionsCreated = actionInserts.length;
      } else {
        console.error(`${SERVICE_NAME} Error creating vision_actions:`, actionsError);
      }
    }

    // 5. Update journal with linked goal ID (two-way link)
    if (journalEntry && goal) {
      await supabase
        .from('calendar_journal_entries')
        .update({ linked_goal_ids: [goal.id] })
        .eq('id', journalEntry.id);
    }

    // 6. Create widget in vision_board_widgets for UI display
    const widgetData = {
      user_id: userId,
      type: 'goal',
      title: goalTitle,
      icon: 'target',
      content: {
        lifeArea,
        deadline,
        questionnaire,
        goals: [{
          id: `goal_${timestamp}_0`,
          title: goalTitle,
          completed: false,
          rituals: rituals,
        }],
        rituals: rituals,
        crystals: crystals,
        source, // Track where goal came from (tarot, iching, gemmaster, vision_board)
        // Link to vision_goals for two-way navigation
        vision_goal_id: goal?.id || null,
        journal_id: journalEntry?.id || null,
      },
      is_active: true,
    };

    const { data: widget, error: widgetError } = await supabase
      .from('vision_board_widgets')
      .insert(widgetData)
      .select()
      .single();

    if (widgetError) {
      console.error(`${SERVICE_NAME} Error creating widget:`, widgetError);
    }

    console.log(`${SERVICE_NAME} Created widget:`, widget?.id);

    // 7. Create affirmation widget if affirmations provided
    let affirmationWidget = null;
    if (affirmations.length > 0) {
      const affirmationWidgetData = {
        user_id: userId,
        type: 'affirmation',
        title: `${goalTitle} - Khẳng định`,
        icon: 'sparkles',
        content: {
          lifeArea,
          affirmations,
          vision_goal_id: goal?.id || null,
        },
        is_active: true,
      };

      const { data: affWidget } = await supabase
        .from('vision_board_widgets')
        .insert(affirmationWidgetData)
        .select()
        .single();

      affirmationWidget = affWidget;
    }

    // 8. Create action plan widget if actions provided
    let actionPlanWidget = null;
    if (actions.length > 0) {
      const actionPlanWidgetData = {
        user_id: userId,
        type: 'action_plan',
        title: `Kế hoạch: ${goalTitle}`,
        icon: 'list-checks',
        content: {
          lifeArea,
          deadline,
          actions: actions.map((a, i) => ({
            id: `action_${timestamp}_${i}`,
            title: a.title || a.text || a,
            completed: false,
            action_type: a.action_type || null,
          })),
          vision_goal_id: goal?.id || null,
        },
        is_active: true,
      };

      const { data: actionWidget } = await supabase
        .from('vision_board_widgets')
        .insert(actionPlanWidgetData)
        .select()
        .single();

      actionPlanWidget = actionWidget;
    }

    return {
      success: true,
      journalEntry,
      goal,
      widget,
      affirmationWidget,
      actionPlanWidget,
      actionsCreated,
      message: `Đã tạo mục tiêu "${goalTitle}" với ${actionsCreated} hành động`,
    };
  } catch (error) {
    console.error(`${SERVICE_NAME} createQuickGoalWithJournal error:`, error);
    return {
      success: false,
      error: error.message || 'Không thể tạo mục tiêu. Vui lòng thử lại.',
    };
  }
};

export default {
  ENTRY_POINTS,
  processTemplateSubmission,
  createGoalFromJournalAction,
  getJournalWithLinkedGoals,
  getGoalWithSourceJournal,
  getOrCreateTemplateSettings,
  updateTemplateSettings,
  createQuickGoalWithJournal,
};
