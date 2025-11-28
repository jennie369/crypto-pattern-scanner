/**
 * Gemral - Notification Personalizer
 *
 * Generates personalized notification content based on user's widgets:
 * - Extracts affirmations from Goal Cards
 * - Finds pending tasks from Action Checklists
 * - Creates visualization prompts from goals
 *
 * Features:
 * - Random rotation of content
 * - Truncation for notification limits
 * - Fallback content when no widgets
 */

// Widget types
const WIDGET_TYPES = {
  GOAL_CARD: 'GOAL_CARD',
  AFFIRMATION_CARD: 'AFFIRMATION_CARD',
  ACTION_CHECKLIST: 'ACTION_CHECKLIST',
  PROGRESS_TRACKER: 'PROGRESS_TRACKER',
};

// Fallback affirmations
const FALLBACK_AFFIRMATIONS = [
  'Today is full of infinite possibilities',
  'I am capable of achieving my goals',
  'Every step I take brings me closer to success',
  'I attract abundance and prosperity',
  'I am grateful for this new day',
];

// Fallback evening prompts
const FALLBACK_EVENING_PROMPTS = [
  'Take a moment to visualize your dreams coming true',
  'Reflect on what you accomplished today',
  'Set your intentions for tomorrow',
  'Appreciate how far you have come',
  'End today with gratitude and peace',
];

class NotificationPersonalizer {
  /**
   * Get morning affirmation content
   * @param {Array} widgets - User's widgets
   * @returns {Object|null} - { title, body, widgetId }
   */
  async getMorningAffirmation(widgets) {
    try {
      // Find widgets with affirmations
      const affirmationSources = widgets.filter(
        (w) =>
          (w.type === WIDGET_TYPES.GOAL_CARD && w.data?.affirmations?.length > 0) ||
          (w.type === WIDGET_TYPES.AFFIRMATION_CARD && w.data?.affirmations?.length > 0)
      );

      if (affirmationSources.length > 0) {
        // Pick a random widget
        const widget = this.getRandomItem(affirmationSources);
        const affirmations = widget.data.affirmations;

        // Get today's affirmation (rotate based on day)
        const dayOfYear = this.getDayOfYear();
        const affirmation = affirmations[dayOfYear % affirmations.length];

        return {
          title: 'Good morning!',
          body: this.truncate(`"${affirmation}"`, 150),
          widgetId: widget.id,
        };
      }

      // Find goals with titles for generic affirmation
      const goalCards = widgets.filter((w) => w.type === WIDGET_TYPES.GOAL_CARD);

      if (goalCards.length > 0) {
        const goal = this.getRandomItem(goalCards);
        const goalTitle = goal.data?.title || goal.data?.goalTitle || 'your goals';

        return {
          title: 'Good morning!',
          body: `Today is a perfect day to work towards ${goalTitle}. You've got this!`,
          widgetId: goal.id,
        };
      }

      // Fallback
      return {
        title: 'Good morning!',
        body: this.getRandomItem(FALLBACK_AFFIRMATIONS),
        widgetId: null,
      };
    } catch (error) {
      console.error('[NotificationPersonalizer] getMorningAffirmation error:', error);
      return {
        title: 'Good morning!',
        body: this.getRandomItem(FALLBACK_AFFIRMATIONS),
        widgetId: null,
      };
    }
  }

  /**
   * Get midday check-in content
   * @param {Array} widgets - User's widgets
   * @returns {Object|null} - { title, body, widgetId, taskId }
   */
  async getMiddayCheckin(widgets) {
    try {
      // Find checklist widgets with incomplete tasks
      const checklists = widgets.filter(
        (w) =>
          w.type === WIDGET_TYPES.ACTION_CHECKLIST &&
          w.data?.tasks?.some((t) => !t.completed)
      );

      if (checklists.length > 0) {
        // Pick a checklist with incomplete tasks
        const checklist = this.getRandomItem(checklists);
        const incompleteTasks = checklist.data.tasks.filter((t) => !t.completed);
        const nextTask = incompleteTasks[0];

        const completedCount = checklist.data.tasks.filter((t) => t.completed).length;
        const totalCount = checklist.data.tasks.length;

        return {
          title: 'Midday Check-in',
          body: `Did you complete: "${this.truncate(nextTask.title, 80)}"?\n${completedCount}/${totalCount} tasks done today`,
          widgetId: checklist.id,
          taskId: nextTask.id,
        };
      }

      // Check goal progress
      const goalCards = widgets.filter((w) => w.type === WIDGET_TYPES.GOAL_CARD);

      if (goalCards.length > 0) {
        const goal = this.getRandomItem(goalCards);
        const progress = goal.data?.progress || 0;
        const goalTitle = goal.data?.title || 'your goal';

        return {
          title: 'Midday Check-in',
          body: `How's your progress on "${this.truncate(goalTitle, 50)}"? Currently at ${progress}%`,
          widgetId: goal.id,
          taskId: null,
        };
      }

      // Fallback
      return {
        title: 'Midday Check-in',
        body: 'Take a moment to review your goals and celebrate your progress!',
        widgetId: null,
        taskId: null,
      };
    } catch (error) {
      console.error('[NotificationPersonalizer] getMiddayCheckin error:', error);
      return {
        title: 'Midday Check-in',
        body: 'Take a moment to review your goals and celebrate your progress!',
        widgetId: null,
        taskId: null,
      };
    }
  }

  /**
   * Get evening visualization content
   * @param {Array} widgets - User's widgets
   * @returns {Object|null} - { title, body, widgetId }
   */
  async getEveningVisualization(widgets) {
    try {
      // Find goals with visualization prompts
      const goalCards = widgets.filter(
        (w) => w.type === WIDGET_TYPES.GOAL_CARD && w.data?.visualizationPrompt
      );

      if (goalCards.length > 0) {
        const goal = this.getRandomItem(goalCards);
        const prompt = goal.data.visualizationPrompt;

        return {
          title: 'Evening Visualization',
          body: this.truncate(prompt, 150),
          widgetId: goal.id,
        };
      }

      // Create visualization from goal title
      const allGoals = widgets.filter((w) => w.type === WIDGET_TYPES.GOAL_CARD);

      if (allGoals.length > 0) {
        const goal = this.getRandomItem(allGoals);
        const goalTitle = goal.data?.title || 'achieving your dreams';

        const prompts = [
          `Close your eyes and visualize yourself ${goalTitle}. Feel the joy of achievement.`,
          `Imagine waking up tomorrow having achieved ${goalTitle}. How does it feel?`,
          `Picture yourself celebrating ${goalTitle}. Who is there with you?`,
          `Visualize the moment you reach ${goalTitle}. What will you see, hear, and feel?`,
        ];

        return {
          title: 'Evening Visualization',
          body: this.truncate(this.getRandomItem(prompts), 150),
          widgetId: goal.id,
        };
      }

      // Fallback
      return {
        title: 'Evening Visualization',
        body: this.getRandomItem(FALLBACK_EVENING_PROMPTS),
        widgetId: null,
      };
    } catch (error) {
      console.error('[NotificationPersonalizer] getEveningVisualization error:', error);
      return {
        title: 'Evening Visualization',
        body: this.getRandomItem(FALLBACK_EVENING_PROMPTS),
        widgetId: null,
      };
    }
  }

  /**
   * Generate milestone message
   * @param {Object} widget - Goal widget
   * @param {number} percentage - Milestone percentage
   * @returns {string}
   */
  getMilestoneMessage(widget, percentage) {
    const goalTitle = widget.data?.title || 'your goal';

    const messages = {
      10: `Great start! You're 10% towards "${goalTitle}". Keep the momentum going!`,
      25: `Amazing progress! You're 1/4 of the way to "${goalTitle}"!`,
      50: `Halfway there! You're 50% to "${goalTitle}". The finish line is in sight!`,
      75: `So close! 75% complete on "${goalTitle}". Final push!`,
      100: `You did it! "${goalTitle}" is 100% complete! Time to celebrate!`,
    };

    return messages[percentage] || `${percentage}% milestone reached for "${goalTitle}"!`;
  }

  /**
   * Get random item from array
   */
  getRandomItem(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Get day of year (1-365)
   */
  getDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  /**
   * Truncate text to max length
   */
  truncate(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Format currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Calculate days remaining to deadline
   */
  getDaysRemaining(deadline) {
    if (!deadline) return null;

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Get urgency message based on deadline
   */
  getUrgencyMessage(daysRemaining) {
    if (daysRemaining === null) return '';

    if (daysRemaining < 0) {
      return 'Deadline passed! Time to refocus.';
    } else if (daysRemaining === 0) {
      return 'Today is the day! Final push!';
    } else if (daysRemaining <= 3) {
      return `Only ${daysRemaining} days left! Stay focused!`;
    } else if (daysRemaining <= 7) {
      return `${daysRemaining} days to go. You're on track!`;
    }

    return '';
  }
}

export default new NotificationPersonalizer();
