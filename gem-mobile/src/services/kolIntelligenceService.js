/**
 * KOL Intelligence Service
 * Client-side service for fetching KOL verification results (read-only)
 * Reference: KOL_INTELLIGENCE_PLAN_PHASE5_INTEGRATION.md
 */

import { supabase } from './supabase';

const kolIntelligenceService = {
  /**
   * Get verification results for a specific application
   * @param {string} applicationId
   * @returns {Promise<Array>} Array of kol_verification_results rows
   */
  async getVerificationResults(applicationId) {
    const { data, error } = await supabase
      .rpc('get_kol_verification_results', { p_application_id: applicationId });
    if (error) throw error;
    return data || [];
  },

  /**
   * Get score summary for a specific application
   * @param {string} applicationId
   * @returns {Promise<Object>} Summary object with overall score, verdict, etc.
   */
  async getScoreSummary(applicationId) {
    const { data, error } = await supabase
      .rpc('get_kol_score_summary', { p_application_id: applicationId });
    if (error) throw error;
    return data?.[0] || null;
  },

  /**
   * Admin: Trigger re-verification for an application
   * @param {string} applicationId
   * @returns {Promise<Object>} Crawl result summary
   */
  async triggerReverification(applicationId) {
    const { data, error } = await supabase.functions.invoke('kol-intelligence-crawl', {
      body: { application_id: applicationId, force: true },
    });
    if (error) {
      // Parse the response body for a user-friendly message
      let message = 'Verification failed';
      try {
        const body = typeof error === 'object' && error.context
          ? await error.context.json()
          : null;
        if (body?.message) message = body.message;
        else if (body?.error) message = body.error;
      } catch (_) { /* ignore parse errors */ }
      const err = new Error(message);
      err.isExpected = true; // Flag so UI can show alert instead of generic error
      throw err;
    }
    return data;
  },

  /**
   * Get all suspicious applications (for admin dashboard badge)
   * @returns {Promise<number>} Count of suspicious applications
   */
  async getSuspiciousCount() {
    const { count, error } = await supabase
      .from('kol_verification_results')
      .select('application_id', { count: 'exact', head: true })
      .eq('fraud_flag', true);
    if (error) throw error;
    return count || 0;
  },

  /**
   * Get crawl logs for an application (admin audit)
   * @param {string} applicationId
   * @returns {Promise<Array>}
   */
  async getCrawlLogs(applicationId) {
    const { data, error } = await supabase
      .from('kol_crawl_logs')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data || [];
  },
};

export default kolIntelligenceService;
