/**
 * Gemral - Content Calendar Service
 * CRUD operations cho Content Calendar
 * @description API service cho quản lý lịch đăng bài tự động
 */

import { supabase } from './supabase';

// ========== CONSTANTS ==========
const TABLE_NAME = 'content_calendar';

export const PLATFORMS = ['gemral', 'facebook', 'tiktok', 'youtube', 'threads', 'instagram'];
export const CONTENT_TYPES = ['post', 'video', 'short', 'reel', 'story'];
export const STATUSES = ['draft', 'scheduled', 'posting', 'posted', 'failed', 'cancelled'];
export const PILLARS = ['spiritual', 'trading', 'money', 'healing', 'community'];

// ========== GET ALL CONTENT ==========
export const getContentCalendar = async ({
  startDate = null,
  endDate = null,
  platform = null,
  status = null,
  pillar = null,
  limit = 50,
  offset = 0,
} = {}) => {
  try {
    let query = supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact' })
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });

    // Apply filters
    if (startDate) {
      query = query.gte('scheduled_date', startDate);
    }
    if (endDate) {
      query = query.lte('scheduled_date', endDate);
    }
    if (platform) {
      query = query.eq('platform', platform);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (pillar) {
      query = query.eq('pillar', pillar);
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('[ContentCalendar] getAll error:', error);
      throw error;
    }

    return {
      success: true,
      data: data || [],
      total: count || 0,
      hasMore: (offset + limit) < (count || 0),
    };
  } catch (error) {
    console.error('[ContentCalendar] getAll error:', error);
    return {
      success: false,
      error: error?.message || 'Lỗi không xác định',
      data: [],
      total: 0,
    };
  }
};

// ========== GET SINGLE CONTENT ==========
export const getContentById = async (contentId) => {
  try {
    if (!contentId) {
      throw new Error('Content ID là bắt buộc');
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', contentId)
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('[ContentCalendar] getById error:', error);
    return {
      success: false,
      error: error?.message || 'Lỗi không xác định',
      data: null,
    };
  }
};

// ========== CREATE CONTENT ==========
export const createContent = async (contentData) => {
  try {
    // Validate required fields
    const requiredFields = ['title', 'content', 'platform', 'scheduled_date', 'scheduled_time'];
    for (const field of requiredFields) {
      if (!contentData[field]) {
        throw new Error(`Thiếu trường bắt buộc: ${field}`);
      }
    }

    // Validate platform
    if (!PLATFORMS.includes(contentData.platform)) {
      throw new Error(`Platform không hợp lệ: ${contentData.platform}`);
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Chưa đăng nhập');
    }

    // Prepare data
    const insertData = {
      title: contentData.title?.trim(),
      content: contentData.content?.trim(),
      content_type: contentData.content_type || 'post',
      media_urls: contentData.media_urls || [],
      thumbnail_url: contentData.thumbnail_url || null,
      video_url: contentData.video_url || null,
      hashtags: contentData.hashtags || [],
      mentions: contentData.mentions || [],
      link_url: contentData.link_url || null,
      platform: contentData.platform,
      scheduled_date: contentData.scheduled_date,
      scheduled_time: contentData.scheduled_time,
      timezone: contentData.timezone || 'Asia/Ho_Chi_Minh',
      status: contentData.status || 'draft',
      pillar: contentData.pillar || null,
      created_by: user.id,
    };

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('[ContentCalendar] Created:', data?.id);

    return {
      success: true,
      data,
      message: 'Tạo nội dung thành công',
    };
  } catch (error) {
    console.error('[ContentCalendar] create error:', error);
    return {
      success: false,
      error: error?.message || 'Lỗi không xác định',
      data: null,
    };
  }
};

// ========== UPDATE CONTENT ==========
export const updateContent = async (contentId, updateData) => {
  try {
    if (!contentId) {
      throw new Error('Content ID là bắt buộc');
    }

    // Don't allow updating certain fields
    const { id, created_by, created_at, ...allowedUpdates } = updateData;

    // Validate platform if provided
    if (allowedUpdates.platform && !PLATFORMS.includes(allowedUpdates.platform)) {
      throw new Error(`Platform không hợp lệ: ${allowedUpdates.platform}`);
    }

    // Validate status if provided
    if (allowedUpdates.status && !STATUSES.includes(allowedUpdates.status)) {
      throw new Error(`Status không hợp lệ: ${allowedUpdates.status}`);
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(allowedUpdates)
      .eq('id', contentId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('[ContentCalendar] Updated:', contentId);

    return {
      success: true,
      data,
      message: 'Cập nhật thành công',
    };
  } catch (error) {
    console.error('[ContentCalendar] update error:', error);
    return {
      success: false,
      error: error?.message || 'Lỗi không xác định',
      data: null,
    };
  }
};

// ========== DELETE CONTENT ==========
export const deleteContent = async (contentId) => {
  try {
    if (!contentId) {
      throw new Error('Content ID là bắt buộc');
    }

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', contentId);

    if (error) {
      throw error;
    }

    console.log('[ContentCalendar] Deleted:', contentId);

    return {
      success: true,
      message: 'Xóa thành công',
    };
  } catch (error) {
    console.error('[ContentCalendar] delete error:', error);
    return {
      success: false,
      error: error?.message || 'Lỗi không xác định',
    };
  }
};

// ========== SCHEDULE CONTENT ==========
export const scheduleContent = async (contentId) => {
  try {
    return await updateContent(contentId, { status: 'scheduled' });
  } catch (error) {
    return {
      success: false,
      error: error?.message || 'Lỗi không xác định',
    };
  }
};

// ========== CANCEL SCHEDULED CONTENT ==========
export const cancelContent = async (contentId) => {
  try {
    return await updateContent(contentId, { status: 'cancelled' });
  } catch (error) {
    return {
      success: false,
      error: error?.message || 'Lỗi không xác định',
    };
  }
};

// ========== GET CONTENT BY DATE RANGE (For Calendar View) ==========
export const getContentByDateRange = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('id, title, platform, scheduled_date, scheduled_time, status, pillar, content_type')
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });

    if (error) {
      throw error;
    }

    // Group by date for calendar view
    const grouped = {};
    (data || []).forEach((item) => {
      const date = item.scheduled_date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });

    return {
      success: true,
      data: grouped,
      raw: data || [],
    };
  } catch (error) {
    console.error('[ContentCalendar] getByDateRange error:', error);
    return {
      success: false,
      error: error?.message || 'Lỗi không xác định',
      data: {},
      raw: [],
    };
  }
};

// ========== GET STATS ==========
export const getContentStats = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get all content to calculate status counts
    const { data: allContent, error: allError } = await supabase
      .from(TABLE_NAME)
      .select('status');

    if (allError) {
      throw allError;
    }

    // Count by status
    const byStatus = {};
    (allContent || []).forEach((item) => {
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;
    });

    // Get today's scheduled
    const { count: todayCount } = await supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('scheduled_date', today)
      .eq('status', 'scheduled');

    // Get this week's scheduled
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const { count: weekCount } = await supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .gte('scheduled_date', weekStart.toISOString().split('T')[0])
      .lte('scheduled_date', weekEnd.toISOString().split('T')[0])
      .eq('status', 'scheduled');

    return {
      success: true,
      data: {
        byStatus,
        todayScheduled: todayCount || 0,
        weekScheduled: weekCount || 0,
      },
    };
  } catch (error) {
    console.error('[ContentCalendar] getStats error:', error);
    return {
      success: false,
      error: error?.message || 'Lỗi không xác định',
      data: null,
    };
  }
};

// ========== BULK CREATE (For CSV Import) ==========
export const bulkCreateContent = async (contentArray) => {
  try {
    if (!Array.isArray(contentArray) || contentArray.length === 0) {
      throw new Error('Danh sách nội dung là bắt buộc');
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Chưa đăng nhập');
    }

    // Prepare all items
    const insertData = contentArray.map((item) => ({
      title: item.title?.trim() || 'Untitled',
      content: item.content?.trim() || '',
      content_type: item.content_type || 'post',
      media_urls: item.media_urls || [],
      hashtags: item.hashtags || [],
      platform: item.platform || 'gemral',
      scheduled_date: item.scheduled_date,
      scheduled_time: item.scheduled_time || '12:00:00',
      timezone: 'Asia/Ho_Chi_Minh',
      status: item.status || 'draft',
      pillar: item.pillar || null,
      created_by: user.id,
    }));

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(insertData)
      .select();

    if (error) {
      throw error;
    }

    console.log('[ContentCalendar] Bulk created:', data?.length, 'items');

    return {
      success: true,
      data,
      count: data?.length || 0,
      message: `Đã tạo ${data?.length || 0} nội dung`,
    };
  } catch (error) {
    console.error('[ContentCalendar] bulkCreate error:', error);
    return {
      success: false,
      error: error?.message || 'Lỗi không xác định',
      data: [],
      count: 0,
    };
  }
};

// ========== EXPORT CONSTANTS ==========
export const CONTENT_CALENDAR_CONSTANTS = {
  PLATFORMS,
  CONTENT_TYPES,
  STATUSES,
  PILLARS,
};

export default {
  getContentCalendar,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  scheduleContent,
  cancelContent,
  getContentByDateRange,
  getContentStats,
  bulkCreateContent,
  CONTENT_CALENDAR_CONSTANTS,
};
