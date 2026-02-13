/**
 * Gemral - Waitlist Lead Service
 * Service for managing waitlist leads from landing page
 */

import { supabase } from './supabase';

// Lead status options
export const LEAD_STATUS_OPTIONS = ['all', 'new', 'engaged', 'qualified', 'hot', 'converted', 'inactive'];

// Lead grade colors
export const LEAD_GRADE_COLORS = {
  A: '#22C55E', // green - hot
  B: '#3B82F6', // blue - qualified
  C: '#F59E0B', // amber - engaged
  D: '#6B7280', // gray - new
  F: '#EF4444', // red - inactive/unsubscribed
};

// Interest labels
export const INTEREST_LABELS = {
  trading: 'GEM Trading & Tín Hiệu Crypto',
  spiritual: 'GEM Master Sư Phụ Chatbot',
  courses: 'Khóa học chuyển hóa',
  affiliate: 'Cơ hội làm CTV/KOL',
};

// Interest icons
export const INTEREST_ICONS = {
  trading: '📊',
  spiritual: '🔮',
  courses: '📚',
  affiliate: '🤝',
};

/**
 * Get leads with filters
 */
export async function getLeads({
  status = null,
  search = null,
  grade = null,
  limit = 50,
  offset = 0,
} = {}) {
  try {
    let query = supabase
      .from('waitlist_leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Status filter
    if (status && status !== 'all') {
      query = query.eq('lead_status', status);
    }

    // Grade filter
    if (grade && grade !== 'all') {
      query = query.eq('lead_grade', grade);
    }

    // Search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      leads: data || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
    };
  } catch (error) {
    console.error('[WaitlistLeadService] Error getting leads:', error);
    throw error;
  }
}

/**
 * Get single lead by ID
 */
export async function getLead(leadId) {
  try {
    const { data, error } = await supabase
      .from('waitlist_leads')
      .select(`
        *,
        waitlist_entry:waitlist_entry_id (
          id,
          zalo_user_id,
          zalo_connected_at,
          nurturing_stage
        )
      `)
      .eq('id', leadId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[WaitlistLeadService] Error getting lead:', error);
    throw error;
  }
}

/**
 * Update lead status
 */
export async function updateLeadStatus(leadId, status) {
  try {
    const { error } = await supabase
      .from('waitlist_leads')
      .update({
        lead_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('[WaitlistLeadService] Error updating lead status:', error);
    throw error;
  }
}

/**
 * Add note to lead activity log
 */
export async function addLeadNote(leadId, note, actionType = 'note') {
  try {
    const { error } = await supabase
      .from('waitlist_lead_activities')
      .insert({
        lead_id: leadId,
        action_type: actionType,
        action_details: { note },
      });

    if (error) throw error;

    // Also update lead's updated_at
    await supabase
      .from('waitlist_leads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', leadId);

    return { success: true };
  } catch (error) {
    console.error('[WaitlistLeadService] Error adding note:', error);
    throw error;
  }
}

/**
 * Get lead activities
 */
export async function getLeadActivities(leadId, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('waitlist_lead_activities')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[WaitlistLeadService] Error getting activities:', error);
    throw error;
  }
}

/**
 * Get lead stats
 */
export async function getLeadStats() {
  try {
    // Try to use the database function if available
    const { data: funcData, error: funcError } = await supabase
      .rpc('get_lead_stats');

    if (!funcError && funcData) {
      return funcData;
    }

    // Fallback to manual counting
    const [totalRes, todayRes, newRes, hotRes, convertedRes] = await Promise.all([
      supabase.from('waitlist_leads').select('*', { count: 'exact', head: true }),
      supabase
        .from('waitlist_leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date().toISOString().split('T')[0]),
      supabase
        .from('waitlist_leads')
        .select('*', { count: 'exact', head: true })
        .eq('lead_status', 'new'),
      supabase
        .from('waitlist_leads')
        .select('*', { count: 'exact', head: true })
        .eq('lead_status', 'hot'),
      supabase
        .from('waitlist_leads')
        .select('*', { count: 'exact', head: true })
        .eq('lead_status', 'converted'),
    ]);

    const total = totalRes.count || 0;
    const converted = convertedRes.count || 0;

    return {
      total_leads: total,
      today_leads: todayRes.count || 0,
      new_leads: newRes.count || 0,
      hot_leads: hotRes.count || 0,
      converted_leads: converted,
      conversion_rate: total > 0 ? ((converted / total) * 100).toFixed(1) : 0,
    };
  } catch (error) {
    console.error('[WaitlistLeadService] Error getting stats:', error);
    return {
      total_leads: 0,
      today_leads: 0,
      new_leads: 0,
      hot_leads: 0,
      converted_leads: 0,
      conversion_rate: 0,
    };
  }
}

/**
 * Get daily stats for chart
 */
export async function getDailyStats(days = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('waitlist_lead_daily_stats')
      .select('*')
      .gte('stat_date', startDate.toISOString().split('T')[0])
      .order('stat_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[WaitlistLeadService] Error getting daily stats:', error);
    return [];
  }
}

/**
 * Resync lead to Shopify
 */
export async function resyncToShopify(leadId) {
  try {
    // Mark as pending resync
    const { error: updateError } = await supabase
      .from('waitlist_leads')
      .update({
        shopify_sync_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId);

    if (updateError) throw updateError;

    // Log activity
    await addLeadNote(leadId, 'Đã yêu cầu đồng bộ lại với Shopify', 'shopify_resync');

    // TODO: Trigger actual Shopify sync via edge function or background job
    // For now, just mark as pending

    return { success: true };
  } catch (error) {
    console.error('[WaitlistLeadService] Error resyncing to Shopify:', error);
    throw error;
  }
}

/**
 * Trigger Zalo flow for lead
 */
export async function triggerZaloFlow(leadId) {
  try {
    const lead = await getLead(leadId);
    if (!lead) throw new Error('Lead not found');

    // Check if lead has waitlist entry linked
    if (!lead.waitlist_entry_id) {
      // Try to find matching waitlist entry by phone
      const { data: entry, error: findError } = await supabase
        .from('waitlist_entries')
        .select('id')
        .eq('phone_normalized', lead.phone_normalized)
        .single();

      if (!findError && entry) {
        // Link them
        await supabase
          .from('waitlist_leads')
          .update({ waitlist_entry_id: entry.id })
          .eq('id', leadId);
      }
    }

    // Log activity
    await addLeadNote(leadId, 'Đã kích hoạt flow Zalo', 'zalo_trigger');

    return { success: true };
  } catch (error) {
    console.error('[WaitlistLeadService] Error triggering Zalo flow:', error);
    throw error;
  }
}

/**
 * Export leads as data
 */
export async function exportLeads(filters = {}) {
  try {
    let query = supabase
      .from('waitlist_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.status && filters.status !== 'all') {
      query = query.eq('lead_status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Format for export
    const exportData = (data || []).map((lead) => ({
      'Họ tên': lead.full_name,
      'Số điện thoại': lead.phone,
      Email: lead.email || '',
      'Quan tâm': (lead.interested_products || [])
        .map((i) => INTEREST_LABELS[i] || i)
        .join(', '),
      'Điểm': lead.lead_score,
      'Xếp hạng': lead.lead_grade,
      'Trạng thái': lead.lead_status,
      'Shopify ID': lead.shopify_customer_id || '',
      'Ngày đăng ký': new Date(lead.created_at).toLocaleDateString('vi-VN'),
      'Nguồn': lead.utm_source || 'direct',
    }));

    return exportData;
  } catch (error) {
    console.error('[WaitlistLeadService] Error exporting leads:', error);
    throw error;
  }
}

/**
 * Delete lead (soft delete by marking as inactive)
 */
export async function deleteLead(leadId) {
  try {
    const { error } = await supabase
      .from('waitlist_leads')
      .update({
        lead_status: 'inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('[WaitlistLeadService] Error deleting lead:', error);
    throw error;
  }
}

// Default export for convenience
const waitlistLeadService = {
  getLeads,
  getLead,
  updateLeadStatus,
  addLeadNote,
  getLeadActivities,
  getLeadStats,
  getDailyStats,
  resyncToShopify,
  triggerZaloFlow,
  exportLeads,
  deleteLead,
  LEAD_STATUS_OPTIONS,
  LEAD_GRADE_COLORS,
  INTEREST_LABELS,
  INTEREST_ICONS,
};

export default waitlistLeadService;
