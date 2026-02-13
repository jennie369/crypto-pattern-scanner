/**
 * Admin API Service
 * Handles all API calls to the backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class AdminAPI {
  constructor() {
    this.baseUrl = API_BASE;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ============ Conversations ============

  async getConversations(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/chatbot/conversations?${query}`);
  }

  async getConversation(id) {
    return this.request(`/api/chatbot/conversations/${id}`);
  }

  async getConversationMessages(id, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/chatbot/conversations/${id}/messages?${query}`);
  }

  // ============ FAQ ============

  async getFAQs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/chatbot/faq?${query}`);
  }

  async getFAQ(id) {
    return this.request(`/api/chatbot/faq/${id}`);
  }

  async createFAQ(data) {
    return this.request('/api/chatbot/faq', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFAQ(id, data) {
    return this.request(`/api/chatbot/faq/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFAQ(id) {
    return this.request(`/api/chatbot/faq/${id}`, {
      method: 'DELETE',
    });
  }

  // ============ Agents ============

  async getAgents(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/chatbot/agents?${query}`);
  }

  async getAgent(id) {
    return this.request(`/api/chatbot/agents/${id}`);
  }

  async updateAgentStatus(id, status) {
    return this.request(`/api/chatbot/agents/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // ============ Handoff Queue ============

  async getHandoffQueue(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/chatbot/handoff?${query}`);
  }

  async assignHandoff(handoffId, agentId) {
    return this.request(`/api/chatbot/handoff/${handoffId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ agent_id: agentId }),
    });
  }

  async resolveHandoff(handoffId, notes) {
    return this.request(`/api/chatbot/handoff/${handoffId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  // ============ Broadcasts ============

  async getBroadcasts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/marketing/broadcasts?${query}`);
  }

  async getBroadcast(id) {
    return this.request(`/api/marketing/broadcasts/${id}`);
  }

  async createBroadcast(data) {
    return this.request('/api/marketing/broadcasts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendBroadcast(id) {
    return this.request(`/api/marketing/broadcasts/${id}/send`, {
      method: 'POST',
    });
  }

  async pauseBroadcast(id) {
    return this.request(`/api/marketing/broadcasts/${id}/pause`, {
      method: 'POST',
    });
  }

  async getBroadcastStats(id) {
    return this.request(`/api/marketing/broadcasts/${id}/stats`);
  }

  // ============ Segments ============

  async getSegments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/marketing/segments?${query}`);
  }

  async createSegment(data) {
    return this.request('/api/marketing/segments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============ Cart Recovery ============

  async getCartRecoveryStats(days = 30) {
    return this.request(`/api/marketing/cart/stats?days=${days}`);
  }

  // ============ Gamification ============

  async getGamificationStats(days = 30) {
    return this.request(`/api/gamification/admin/stats?days=${days}`);
  }

  async getLeaderboard(metric = 'gems_total', limit = 10) {
    return this.request(`/api/gamification/leaderboard?metric=${metric}&limit=${limit}`);
  }

  // ============ Analytics ============

  async getAnalytics(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/chatbot/analytics?${query}`);
  }

  async getConversationStats(days = 30) {
    return this.request(`/api/chatbot/analytics/conversations?days=${days}`);
  }

  async getEmotionStats(days = 30) {
    return this.request(`/api/chatbot/analytics/emotions?days=${days}`);
  }

  async getPlatformStats(days = 30) {
    return this.request(`/api/chatbot/analytics/platforms?days=${days}`);
  }

  // ============ Waitlist ============

  async getWaitlistEntries(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/admin/waitlist/entries?${query}`);
  }

  async getWaitlistEntry(id) {
    return this.request(`/api/admin/waitlist/entries/${id}`);
  }

  async updateWaitlistEntryStatus(id, status) {
    return this.request(`/api/admin/waitlist/entries/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getWaitlistStats() {
    return this.request('/api/admin/waitlist/stats');
  }

  async manualLinkZalo(entryId, zaloId) {
    return this.request(`/api/admin/waitlist/entries/${entryId}/link-zalo`, {
      method: 'POST',
      body: JSON.stringify({ zalo_id: zaloId }),
    });
  }

  async resendWelcome(entryId) {
    return this.request(`/api/admin/waitlist/entries/${entryId}/resend-welcome`, {
      method: 'POST',
    });
  }

  async sendNurturing(entryId, stage) {
    return this.request(`/api/admin/waitlist/entries/${entryId}/send-nurturing`, {
      method: 'POST',
      body: JSON.stringify({ stage }),
    });
  }

  async getWaitlistMessageLog(entryId) {
    return this.request(`/api/admin/waitlist/entries/${entryId}/messages`);
  }

  async triggerLaunch(limit = 100) {
    return this.request(`/api/admin/waitlist/send-launch?limit=${limit}`, {
      method: 'POST',
    });
  }

  async sendWaitlistBroadcast(message, statusFilter, limit) {
    return this.request('/api/admin/waitlist/broadcast', {
      method: 'POST',
      body: JSON.stringify({ message, status_filter: statusFilter, limit }),
    });
  }

  async exportWaitlist(format = 'json', status = null) {
    const params = { format };
    if (status) params.status = status;
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/admin/waitlist/export?${query}`);
  }

  async getNurturingStatus() {
    return this.request('/api/admin/waitlist/nurturing/status');
  }

  async processNurturingNow() {
    return this.request('/api/admin/waitlist/nurturing/process', {
      method: 'POST',
    });
  }

  // ============ Health ============

  async getHealth() {
    return this.request('/health');
  }

  async getWorkerStatus() {
    return Promise.all([
      this.request('/api/marketing/cart/worker/status'),
      this.request('/api/marketing/broadcasts/worker/status'),
    ]).then(([cart, broadcast]) => ({ cart, broadcast }));
  }
}

export const api = new AdminAPI();
export default api;
