/**
 * A/B Testing Service
 * Phase 4: Intelligence Layer
 *
 * A/B Testing Framework for Livestream:
 * - Experiment creation and management
 * - User variant assignment (deterministic)
 * - Conversion tracking
 * - Statistical significance calculation
 * - Predefined experiments for common scenarios
 */

import { supabase } from './supabase';
import { livestreamAnalyticsService } from './livestreamAnalyticsService';

class ABTestingService {
  constructor() {
    this.experiments = new Map();
    this.userAssignments = new Map(); // `${userId}_${experimentId}` -> variantId
    this.loaded = false;
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize() {
    if (this.loaded) return;

    try {
      // Load active experiments
      const { data: experiments } = await supabase
        .from('experiments')
        .select('*')
        .eq('status', 'active');

      if (experiments) {
        experiments.forEach((exp) => {
          this.experiments.set(exp.id, exp);
        });
      }

      this.loaded = true;
    } catch (error) {
      console.error('[ABTesting] Initialize error:', error);
    }
  }

  // ============================================================================
  // EXPERIMENT MANAGEMENT
  // ============================================================================

  async createExperiment(config) {
    const {
      id,
      name,
      description,
      variants, // [{ id, name, weight }]
      targetAudience = 'all', // 'all', 'tier_1', 'tier_2', 'tier_3', 'new_users'
      startDate,
      endDate,
      metrics = [], // ['conversion_rate', 'engagement', 'revenue']
    } = config;

    // Validate weights sum to 100
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    if (totalWeight !== 100) {
      throw new Error('Variant weights must sum to 100');
    }

    try {
      const { data, error } = await supabase
        .from('experiments')
        .insert({
          id: id || `exp_${Date.now()}`,
          name,
          description,
          variants,
          target_audience: targetAudience,
          start_date: startDate,
          end_date: endDate,
          metrics,
          status: 'active',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      this.experiments.set(data.id, data);
      return data;
    } catch (error) {
      console.error('[ABTesting] Create experiment error:', error);
      throw error;
    }
  }

  async pauseExperiment(experimentId) {
    try {
      await supabase
        .from('experiments')
        .update({ status: 'paused', updated_at: new Date().toISOString() })
        .eq('id', experimentId);

      const experiment = this.experiments.get(experimentId);
      if (experiment) {
        experiment.status = 'paused';
      }
    } catch (error) {
      console.error('[ABTesting] Pause experiment error:', error);
    }
  }

  async resumeExperiment(experimentId) {
    try {
      await supabase
        .from('experiments')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', experimentId);

      const experiment = this.experiments.get(experimentId);
      if (experiment) {
        experiment.status = 'active';
      }
    } catch (error) {
      console.error('[ABTesting] Resume experiment error:', error);
    }
  }

  // ============================================================================
  // USER ASSIGNMENT
  // ============================================================================

  async assignVariant(userId, experimentId) {
    // Check cache first
    const cacheKey = `${userId}_${experimentId}`;
    if (this.userAssignments.has(cacheKey)) {
      return this.userAssignments.get(cacheKey);
    }

    try {
      // Check database for existing assignment
      const { data: existing } = await supabase
        .from('experiment_assignments')
        .select('variant_id')
        .eq('user_id', userId)
        .eq('experiment_id', experimentId)
        .single();

      if (existing) {
        this.userAssignments.set(cacheKey, existing.variant_id);
        return existing.variant_id;
      }

      // Get experiment
      const experiment = this.experiments.get(experimentId);
      if (!experiment || experiment.status !== 'active') {
        return null;
      }

      // Check target audience eligibility
      const isEligible = await this.checkEligibility(userId, experiment.target_audience);
      if (!isEligible) {
        return null;
      }

      // Random assignment based on weights (deterministic by userId)
      const variantId = this.selectVariant(userId, experiment.variants);

      // Save assignment
      await supabase.from('experiment_assignments').insert({
        user_id: userId,
        experiment_id: experimentId,
        variant_id: variantId,
        assigned_at: new Date().toISOString(),
      });

      // Track analytics
      await livestreamAnalyticsService.trackExperimentAssignment(experimentId, variantId);

      // Cache
      this.userAssignments.set(cacheKey, variantId);

      return variantId;
    } catch (error) {
      console.error('[ABTesting] Assign variant error:', error);
      return null;
    }
  }

  selectVariant(userId, variants) {
    // Use userId for deterministic assignment
    const hash = this.hashCode(userId);
    const random = (hash % 100) + 1; // 1-100

    let cumulative = 0;
    for (const variant of variants) {
      cumulative += variant.weight;
      if (random <= cumulative) {
        return variant.id;
      }
    }

    return variants[0].id; // Fallback
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  async checkEligibility(userId, targetAudience) {
    if (targetAudience === 'all') return true;

    try {
      const { data: user } = await supabase
        .from('user_profiles')
        .select('tier, created_at')
        .eq('id', userId)
        .single();

      if (!user) return false;

      switch (targetAudience) {
        case 'tier_1':
          return user.tier === 'TIER1';
        case 'tier_2':
          return user.tier === 'TIER2';
        case 'tier_3':
          return user.tier === 'TIER3';
        case 'new_users':
          const createdAt = new Date(user.created_at);
          const daysSinceCreation =
            (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceCreation <= 7;
        default:
          return true;
      }
    } catch (error) {
      return true;
    }
  }

  // ============================================================================
  // CONVERSION TRACKING
  // ============================================================================

  async trackConversion(userId, experimentId, conversionType, value = 1) {
    const variantId = await this.assignVariant(userId, experimentId);
    if (!variantId) return;

    try {
      // Track in analytics
      await livestreamAnalyticsService.trackExperimentConversion(
        experimentId,
        variantId,
        conversionType,
        value
      );

      // Save to conversions table
      await supabase.from('experiment_conversions').insert({
        experiment_id: experimentId,
        variant_id: variantId,
        user_id: userId,
        conversion_type: conversionType,
        value,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[ABTesting] Track conversion error:', error);
    }
  }

  // ============================================================================
  // GET VARIANT FOR USER
  // ============================================================================

  async getVariant(userId, experimentId) {
    return this.assignVariant(userId, experimentId);
  }

  // Check if user is in specific variant
  async isInVariant(userId, experimentId, variantId) {
    const assigned = await this.assignVariant(userId, experimentId);
    return assigned === variantId;
  }

  // ============================================================================
  // EXPERIMENT RESULTS
  // ============================================================================

  async getExperimentResults(experimentId) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return null;

    try {
      // Get assignment counts
      const { data: assignments } = await supabase
        .from('experiment_assignments')
        .select('variant_id')
        .eq('experiment_id', experimentId);

      // Get conversion data
      const { data: conversions } = await supabase
        .from('experiment_conversions')
        .select('*')
        .eq('experiment_id', experimentId);

      // Calculate metrics per variant
      const results = {};

      for (const variant of experiment.variants) {
        const variantAssignments =
          assignments?.filter((a) => a.variant_id === variant.id).length || 0;
        const variantConversions =
          conversions?.filter((c) => c.variant_id === variant.id) || [];

        const conversionsByType = {};
        variantConversions.forEach((c) => {
          if (!conversionsByType[c.conversion_type]) {
            conversionsByType[c.conversion_type] = { count: 0, value: 0 };
          }
          conversionsByType[c.conversion_type].count += 1;
          conversionsByType[c.conversion_type].value += c.value || 0;
        });

        const totalConversions = Object.values(conversionsByType).reduce(
          (s, c) => s + c.count,
          0
        );

        results[variant.id] = {
          name: variant.name,
          weight: variant.weight,
          assignments: variantAssignments,
          conversions: conversionsByType,
          conversionRate:
            variantAssignments > 0
              ? ((totalConversions / variantAssignments) * 100).toFixed(2)
              : 0,
        };
      }

      // Calculate statistical significance
      const significance = this.calculateSignificance(results, experiment.variants);

      return {
        experiment,
        results,
        significance,
        totalAssignments: assignments?.length || 0,
        totalConversions: conversions?.length || 0,
      };
    } catch (error) {
      console.error('[ABTesting] Get results error:', error);
      return null;
    }
  }

  calculateSignificance(results, variants) {
    // Chi-squared test for significance
    if (variants.length < 2) return { isSignificant: false, pValue: 1 };

    const control = results[variants[0].id];
    const treatment = results[variants[1].id];

    if (!control || !treatment) return { isSignificant: false, pValue: 1 };

    const controlRate = parseFloat(control.conversionRate) / 100;
    const treatmentRate = parseFloat(treatment.conversionRate) / 100;
    const controlN = control.assignments;
    const treatmentN = treatment.assignments;

    if (controlN === 0 || treatmentN === 0) return { isSignificant: false, pValue: 1 };

    // Pooled proportion
    const pooledRate =
      (controlRate * controlN + treatmentRate * treatmentN) / (controlN + treatmentN);

    // Standard error
    const se = Math.sqrt(
      pooledRate * (1 - pooledRate) * (1 / controlN + 1 / treatmentN)
    );

    if (se === 0) return { isSignificant: false, pValue: 1 };

    // Z-score
    const zScore = (treatmentRate - controlRate) / se;

    // P-value (two-tailed)
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));

    const uplift =
      controlRate > 0
        ? (((treatmentRate - controlRate) / controlRate) * 100).toFixed(2) + '%'
        : 'N/A';

    return {
      isSignificant: pValue < 0.05,
      pValue: pValue.toFixed(4),
      zScore: zScore.toFixed(2),
      uplift,
    };
  }

  normalCDF(x) {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);

    const t = 1.0 / (1.0 + p * x);
    const y =
      1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 0.5 * (1.0 + sign * y);
  }

  // ============================================================================
  // PREDEFINED EXPERIMENTS
  // ============================================================================

  // Experiment: Recommendation Strategy
  async getRecommendationStrategy(userId) {
    const variant = await this.getVariant(userId, 'rec_strategy_v1');

    switch (variant) {
      case 'personalized':
        return 'personalized';
      case 'trending':
        return 'trending';
      case 'contextual':
        return 'contextual';
      default:
        return 'trending'; // Control
    }
  }

  // Experiment: Proactive Engagement Timing
  async getEngagementTiming(userId) {
    const variant = await this.getVariant(userId, 'engagement_timing_v1');

    switch (variant) {
      case 'aggressive': // 1 minute
        return 60 * 1000;
      case 'moderate': // 2 minutes
        return 2 * 60 * 1000;
      case 'conservative': // 5 minutes
        return 5 * 60 * 1000;
      default:
        return 2 * 60 * 1000; // Control
    }
  }

  // Experiment: CTA Button Text
  async getCTAText(userId, context) {
    const variant = await this.getVariant(userId, 'cta_text_v1');

    switch (variant) {
      case 'action':
        return 'Mua ngay';
      case 'benefit':
        return 'So huu ngay';
      case 'urgency':
        return 'Dat ngay - Sap het!';
      default:
        return 'Them vao gio'; // Control
    }
  }

  // Experiment: Product Card Layout
  async getProductCardLayout(userId) {
    const variant = await this.getVariant(userId, 'product_card_v1');

    switch (variant) {
      case 'compact':
        return 'compact';
      case 'detailed':
        return 'detailed';
      case 'visual':
        return 'visual';
      default:
        return 'standard'; // Control
    }
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  clearCache() {
    this.userAssignments.clear();
  }

  getActiveExperiments() {
    return Array.from(this.experiments.values()).filter((e) => e.status === 'active');
  }
}

export const abTestingService = new ABTestingService();
export default abTestingService;
