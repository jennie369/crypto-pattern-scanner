/**
 * Content Service for Admin Dashboard
 * Push notifications, templates, and content calendar management
 */

import { supabase } from './supabase';

// ============================================
// PUSH NOTIFICATIONS
// ============================================

/**
 * Get all push notifications
 */
export async function getPushNotifications({
  status = 'all',
  page = 1,
  limit = 50
}) {
  try {
    let query = supabase
      .from('push_notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error('[contentService] getPushNotifications error:', error);
    return { success: false, data: [], total: 0, error: error.message };
  }
}

/**
 * Create a push notification
 */
export async function createPushNotification(notificationData) {
  try {
    const { data, error } = await supabase
      .from('push_notifications')
      .insert({
        title: notificationData.title?.trim() || '',
        body: notificationData.body?.trim() || '',
        image_url: notificationData.image_url || null,
        deep_link: notificationData.deep_link || null,
        target_audience: notificationData.target_audience || 'all',
        target_tiers: notificationData.target_tiers || [],
        scheduled_at: notificationData.scheduled_at || null,
        status: notificationData.scheduled_at ? 'scheduled' : 'draft',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[contentService] createPushNotification error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a push notification
 */
export async function updatePushNotification(id, updates) {
  try {
    const { data, error } = await supabase
      .from('push_notifications')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[contentService] updatePushNotification error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a push notification
 */
export async function deletePushNotification(id) {
  try {
    const { error } = await supabase
      .from('push_notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[contentService] deletePushNotification error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a push notification immediately
 */
export async function sendPushNotification(id) {
  try {
    const { data, error } = await supabase
      .from('push_notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // In production, this would trigger the actual push service
    // await triggerPushService(data);

    return { success: true, data };
  } catch (error) {
    console.error('[contentService] sendPushNotification error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get push notification stats
 */
export async function getPushStats() {
  try {
    const { data: notifications, error } = await supabase
      .from('push_notifications')
      .select('id, status, sent_at, opens, clicks');

    if (error) throw error;

    const total = notifications?.length || 0;
    const sent = notifications?.filter(n => n.status === 'sent').length || 0;
    const scheduled = notifications?.filter(n => n.status === 'scheduled').length || 0;
    const draft = notifications?.filter(n => n.status === 'draft').length || 0;
    const totalOpens = notifications?.reduce((sum, n) => sum + (n.opens || 0), 0) || 0;
    const totalClicks = notifications?.reduce((sum, n) => sum + (n.clicks || 0), 0) || 0;

    return {
      success: true,
      data: {
        total,
        sent,
        scheduled,
        draft,
        totalOpens,
        totalClicks,
        avgOpenRate: sent > 0 ? ((totalOpens / (sent * 1000)) * 100).toFixed(1) : 0, // Assuming 1000 recipients
        avgClickRate: totalOpens > 0 ? ((totalClicks / totalOpens) * 100).toFixed(1) : 0,
      },
    };
  } catch (error) {
    console.error('[contentService] getPushStats error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// CONTENT TEMPLATES
// ============================================

/**
 * Get all templates
 */
export async function getTemplates({
  type = 'all',
  page = 1,
  limit = 50
}) {
  try {
    let query = supabase
      .from('content_templates')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (type !== 'all') {
      query = query.eq('type', type);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error('[contentService] getTemplates error:', error);
    return { success: false, data: [], total: 0, error: error.message };
  }
}

/**
 * Create a template
 */
export async function createTemplate(templateData) {
  try {
    const { data, error } = await supabase
      .from('content_templates')
      .insert({
        name: templateData.name?.trim() || '',
        type: templateData.type || 'push',
        title: templateData.title?.trim() || '',
        body: templateData.body?.trim() || '',
        variables: templateData.variables || [],
        image_url: templateData.image_url || null,
        deep_link: templateData.deep_link || null,
        is_active: templateData.is_active ?? true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[contentService] createTemplate error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a template
 */
export async function updateTemplate(id, updates) {
  try {
    const { data, error } = await supabase
      .from('content_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[contentService] updateTemplate error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a template
 */
export async function deleteTemplate(id) {
  try {
    const { error } = await supabase
      .from('content_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[contentService] deleteTemplate error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// CONTENT CALENDAR
// ============================================

/**
 * Get calendar events
 */
export async function getCalendarEvents({
  startDate,
  endDate,
  type = 'all'
}) {
  try {
    let query = supabase
      .from('content_calendar')
      .select('*')
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)
      .order('scheduled_date', { ascending: true });

    if (type !== 'all') {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[contentService] getCalendarEvents error:', error);
    return { success: false, data: [] };
  }
}

/**
 * Create a calendar event
 */
export async function createCalendarEvent(eventData) {
  try {
    const { data, error } = await supabase
      .from('content_calendar')
      .insert({
        title: eventData.title?.trim() || '',
        description: eventData.description?.trim() || null,
        type: eventData.type || 'push',
        scheduled_date: eventData.scheduled_date,
        scheduled_time: eventData.scheduled_time || '09:00',
        content_id: eventData.content_id || null,
        status: eventData.status || 'planned',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[contentService] createCalendarEvent error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a calendar event
 */
export async function updateCalendarEvent(id, updates) {
  try {
    const { data, error } = await supabase
      .from('content_calendar')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[contentService] updateCalendarEvent error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(id) {
  try {
    const { error } = await supabase
      .from('content_calendar')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[contentService] deleteCalendarEvent error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get content statistics for dashboard
 */
export async function getContentStats() {
  try {
    const [pushStats, templatesCount, calendarCount] = await Promise.all([
      getPushStats(),
      supabase.from('content_templates').select('*', { count: 'exact', head: true }),
      supabase.from('content_calendar').select('*', { count: 'exact', head: true })
        .gte('scheduled_date', new Date().toISOString().split('T')[0]),
    ]);

    return {
      success: true,
      data: {
        push: pushStats.data || {},
        templates: templatesCount.count || 0,
        upcomingEvents: calendarCount.count || 0,
      },
    };
  } catch (error) {
    console.error('[contentService] getContentStats error:', error);
    return { success: false, error: error.message };
  }
}

export default {
  // Push Notifications
  getPushNotifications,
  createPushNotification,
  updatePushNotification,
  deletePushNotification,
  sendPushNotification,
  getPushStats,
  // Templates
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  // Calendar
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  // Stats
  getContentStats,
};
