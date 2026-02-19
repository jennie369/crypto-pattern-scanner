/**
 * Gemral - Support Ticket Service
 *
 * Service for help desk / support ticket operations
 * Supports ticket creation, messaging, and admin management
 */

import { supabase } from './supabase';

// Ticket categories
export const TICKET_CATEGORIES = [
  { key: 'general', label: 'Chung', color: '#6B7280' },
  { key: 'billing', label: 'Thanh toán', color: '#FFBD59' },
  { key: 'technical', label: 'Kỹ thuật', color: '#00D9FF' },
  { key: 'account', label: 'Tài khoản', color: '#8B5CF6' },
  { key: 'feature_request', label: 'Đề xuất tính năng', color: '#22C55E' },
  { key: 'bug_report', label: 'Báo lỗi', color: '#EF4444' },
];

// Ticket priorities
export const TICKET_PRIORITIES = [
  { key: 'low', label: 'Thấp', color: '#6B7280' },
  { key: 'normal', label: 'Bình thường', color: '#00D9FF' },
  { key: 'high', label: 'Cao', color: '#FFBD59' },
  { key: 'urgent', label: 'Khẩn cấp', color: '#EF4444' },
];

// Ticket statuses
export const TICKET_STATUSES = [
  { key: 'open', label: 'Mở', color: '#22C55E' },
  { key: 'in_progress', label: 'Đang xử lý', color: '#00D9FF' },
  { key: 'waiting_for_user', label: 'Chờ phản hồi', color: '#FFBD59' },
  { key: 'resolved', label: 'Đã giải quyết', color: '#8B5CF6' },
  { key: 'closed', label: 'Đã đóng', color: '#6B7280' },
];

const supportTicketService = {
  // =====================
  // User Operations
  // =====================

  /**
   * Create a new support ticket
   * @param {object} ticketData - Ticket data
   * @returns {object} Result with ticket info
   */
  async createTicket(ticketData) {
    try {
      const { subject, description, category = 'general', priority = 'normal' } = ticketData;

      if (!subject || !description) {
        return { success: false, error: 'Vui lòng điền đầy đủ thông tin' };
      }

      const { data, error } = await supabase.rpc('create_support_ticket', {
        p_subject: subject,
        p_description: description,
        p_category: category,
        p_priority: priority,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('[SupportTicket] Create error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get user's tickets
   * @param {object} options - Filter options
   * @returns {array} Tickets
   */
  async getUserTickets(options = {}) {
    try {
      const { status, page = 1, limit = 20 } = options;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          messages:ticket_messages(count)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return { data: data || [], count: count || 0, error: null };
    } catch (error) {
      console.error('[SupportTicket] Get user tickets error:', error);
      return { data: [], count: 0, error: error.message };
    }
  },

  /**
   * Get single ticket with messages
   * @param {string} ticketId - Ticket ID
   * @returns {object} Ticket with messages
   */
  async getTicketById(ticketId) {
    try {
      // Get ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user:profiles!support_tickets_user_id_fkey(id, email, full_name, avatar_url),
          assigned:profiles!support_tickets_assigned_to_fkey(id, email, full_name, avatar_url)
        `)
        .eq('id', ticketId)
        .single();

      if (ticketError) throw ticketError;

      // Get messages
      const { data: messages, error: messagesError } = await supabase
        .from('ticket_messages')
        .select(`
          *,
          sender:profiles!ticket_messages_sender_id_fkey(id, email, full_name, avatar_url)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      return {
        ...ticket,
        messages: messages || [],
        error: null,
      };
    } catch (error) {
      console.error('[SupportTicket] Get ticket error:', error);
      return { error: error.message };
    }
  },

  /**
   * Send message on ticket
   * @param {string} ticketId - Ticket ID
   * @param {string} message - Message content
   * @param {string} senderType - 'user' or 'admin'
   * @param {boolean} isInternal - Internal note (admin only)
   * @returns {object} Result
   */
  async sendMessage(ticketId, message, senderType = 'user', isInternal = false) {
    try {
      if (!message || message.trim().length === 0) {
        return { success: false, error: 'Tin nhắn không được để trống' };
      }

      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

      const { data, error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketId,
          sender_id: user?.id,
          sender_type: senderType,
          message: message.trim(),
          is_internal: isInternal,
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('[SupportTicket] Send message error:', error);
      return { success: false, error: error.message };
    }
  },

  // =====================
  // Admin Operations
  // =====================

  /**
   * Get all tickets (admin)
   * @param {object} options - Filter options
   * @returns {object} Tickets with count
   */
  async getAllTickets(options = {}) {
    try {
      const {
        status,
        category,
        priority,
        assignedTo,
        search,
        page = 1,
        limit = 20,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = options;

      const offset = (page - 1) * limit;

      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          user:profiles!support_tickets_user_id_fkey(id, email, full_name, avatar_url),
          assigned:profiles!support_tickets_assigned_to_fkey(id, full_name, avatar_url),
          messages:ticket_messages(count)
        `, { count: 'exact' });

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }
      if (category) {
        query = query.eq('category', category);
      }
      if (priority) {
        query = query.eq('priority', priority);
      }
      if (assignedTo === 'unassigned') {
        query = query.is('assigned_to', null);
      } else if (assignedTo) {
        query = query.eq('assigned_to', assignedTo);
      }
      if (search) {
        query = query.or(`subject.ilike.%${search}%,ticket_number.ilike.%${search}%`);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return { data: data || [], count: count || 0, error: null };
    } catch (error) {
      console.error('[SupportTicket] Get all tickets error:', error);
      return { data: [], count: 0, error: error.message };
    }
  },

  /**
   * Get ticket statistics
   * @returns {object} Stats
   */
  async getTicketStats() {
    try {
      const { data, error } = await supabase.rpc('get_ticket_stats');

      if (error) throw error;

      return data?.[0] || {
        total_tickets: 0,
        open_tickets: 0,
        in_progress_tickets: 0,
        resolved_tickets: 0,
        unassigned_tickets: 0,
        tickets_today: 0,
      };
    } catch (error) {
      console.error('[SupportTicket] Get stats error:', error);
      return {
        total_tickets: 0,
        open_tickets: 0,
        in_progress_tickets: 0,
        resolved_tickets: 0,
        unassigned_tickets: 0,
        tickets_today: 0,
      };
    }
  },

  /**
   * Assign ticket to admin
   * @param {string} ticketId - Ticket ID
   * @param {string} adminId - Admin ID (optional, defaults to current user)
   * @returns {object} Result
   */
  async assignTicket(ticketId, adminId = null) {
    try {
      const { data, error } = await supabase.rpc('assign_ticket', {
        p_ticket_id: ticketId,
        p_admin_id: adminId,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('[SupportTicket] Assign error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update ticket status
   * @param {string} ticketId - Ticket ID
   * @param {string} status - New status
   * @returns {object} Result
   */
  async updateStatus(ticketId, status) {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', ticketId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[SupportTicket] Update status error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update ticket priority
   * @param {string} ticketId - Ticket ID
   * @param {string} priority - New priority
   * @returns {object} Result
   */
  async updatePriority(ticketId, priority) {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ priority })
        .eq('id', ticketId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[SupportTicket] Update priority error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Resolve ticket
   * @param {string} ticketId - Ticket ID
   * @param {string} resolution - Resolution notes
   * @returns {object} Result
   */
  async resolveTicket(ticketId, resolution = null) {
    try {
      const { data, error } = await supabase.rpc('resolve_ticket', {
        p_ticket_id: ticketId,
        p_resolution: resolution,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('[SupportTicket] Resolve error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Close ticket
   * @param {string} ticketId - Ticket ID
   * @returns {object} Result
   */
  async closeTicket(ticketId) {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'closed' })
        .eq('id', ticketId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[SupportTicket] Close error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Add internal note (admin only)
   * @param {string} ticketId - Ticket ID
   * @param {string} note - Internal note
   * @returns {object} Result
   */
  async addInternalNote(ticketId, note) {
    return this.sendMessage(ticketId, note, 'admin', true);
  },

  /**
   * Mark messages as read
   * @param {string} ticketId - Ticket ID
   * @returns {object} Result
   */
  async markMessagesRead(ticketId) {
    try {
      const { error } = await supabase
        .from('ticket_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('ticket_id', ticketId)
        .eq('is_read', false);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[SupportTicket] Mark read error:', error);
      return { success: false, error: error.message };
    }
  },

  // =====================
  // Helper Functions
  // =====================

  /**
   * Get category config
   */
  getCategoryConfig(key) {
    return TICKET_CATEGORIES.find((c) => c.key === key) || TICKET_CATEGORIES[0];
  },

  /**
   * Get priority config
   */
  getPriorityConfig(key) {
    return TICKET_PRIORITIES.find((p) => p.key === key) || TICKET_PRIORITIES[1];
  },

  /**
   * Get status config
   */
  getStatusConfig(key) {
    return TICKET_STATUSES.find((s) => s.key === key) || TICKET_STATUSES[0];
  },
};

export default supportTicketService;
