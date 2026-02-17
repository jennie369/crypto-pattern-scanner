/**
 * Gemral - Auto Post Service
 * Quản lý auto-post logs và platform connections
 * @description Service cho tracking và cấu hình auto-post
 */

import { supabase } from './supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/constants';

// ========== LOGS TABLE ==========
const LOGS_TABLE = 'auto_post_logs';
const PLATFORMS_TABLE = 'platform_connections';

// ========== GET AUTO POST LOGS ==========
export const getAutoPostLogs = async ({
  contentId = null,
  platform = null,
  status = null,
  limit = 50,
  offset = 0,
} = {}) => {
  try {
    let query = supabase
      .from(LOGS_TABLE)
      .select('*, content_calendar(title, platform)', { count: 'exact' })
      .order('executed_at', { ascending: false });

    // Apply filters
    if (contentId) {
      query = query.eq('content_id', contentId);
    }
    if (platform) {
      query = query.eq('platform', platform);
    }
    if (status) {
      query = query.eq('status', status);
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('[AutoPostService] getLogs error:', error);
      throw error;
    }

    return {
      success: true,
      data: data || [],
      total: count || 0,
      hasMore: (offset + limit) < (count || 0),
    };
  } catch (error) {
    console.error('[AutoPostService] getLogs error:', error);
    return {
      success: false,
      error: error?.message || 'Lỗi không xác định',
      data: [],
      total: 0,
    };
  }
};

// ========== GET LOG BY ID ==========
export const getLogById = async (logId) => {
  try {
    if (!logId) {
      throw new Error('Log ID là bắt buộc');
    }

    const { data, error } = await supabase
      .from(LOGS_TABLE)
      .select('*, content_calendar(*)')
      .eq('id', logId)
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('[AutoPostService] getLogById error:', error);
    return {
      success: false,
      error: error?.message || 'Lỗi không xác định',
      data: null,
    };
  }
};

// ========== GET LOGS STATS ==========
export const getLogsStats = async () => {
  try {
    // Get all logs
    const { data: allLogs, error } = await supabase
      .from(LOGS_TABLE)
      .select('status, platform');

    if (error) {
      throw error;
    }

    // Count by status
    const byStatus = {};
    const byPlatform = {};

    (allLogs || []).forEach((log) => {
      byStatus[log.status] = (byStatus[log.status] || 0) + 1;
      byPlatform[log.platform] = (byPlatform[log.platform] || 0) + 1;
    });

    // Get today's logs
    const today = new Date().toISOString().split('T')[0];
    const { count: todayCount } = await supabase
      .from(LOGS_TABLE)
      .select('*', { count: 'exact', head: true })
      .gte('executed_at', `${today}T00:00:00`);

    // Get failed count
    const failedCount = byStatus['failed'] || 0;

    return {
      success: true,
      data: {
        total: allLogs?.length || 0,
        todayCount: todayCount || 0,
        failedCount,
        byStatus,
        byPlatform,
      },
    };
  } catch (error) {
    console.error('[AutoPostService] getLogsStats error:', error);
    return {
      success: false,
      error: error?.message || 'Lỗi không xác định',
      data: null,
    };
  }
};

// ========== PLATFORM CONNECTIONS ==========

// ========== GET ALL PLATFORM CONNECTIONS ==========
export const getPlatformConnections = async () => {
  try {
    const { data, error } = await supabase
      .from(PLATFORMS_TABLE)
      .select('id, platform, display_name, is_connected, is_active, connected_at, last_used_at, last_error, settings')
      .order('platform', { ascending: true });

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error('[AutoPostService] getPlatformConnections error:', error);
    return {
      success: false,
      error: error?.message || 'Lỗi không xác định',
      data: [],
    };
  }
};

// ========== GET SINGLE PLATFORM CONNECTION ==========
export const getPlatformConnection = async (platform) => {
  try {
    if (!platform) {
      throw new Error('Platform là bắt buộc');
    }

    const { data, error } = await supabase
      .from(PLATFORMS_TABLE)
      .select('*')
      .eq('platform', platform)
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('[AutoPostService] getPlatformConnection error:', error);
    return {
      success: false,
      error: error?.message || 'Lỗi không xác định',
      data: null,
    };
  }
};

// ========== UPDATE PLATFORM CONNECTION ==========
export const updatePlatformConnection = async (platform, updateData) => {
  try {
    if (!platform) {
      throw new Error('Platform là bắt buộc');
    }

    const { data, error } = await supabase
      .from(PLATFORMS_TABLE)
      .update(updateData)
      .eq('platform', platform)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('[AutoPostService] Updated platform:', platform);

    return {
      success: true,
      data,
      message: 'Cập nhật thành công',
    };
  } catch (error) {
    console.error('[AutoPostService] updatePlatformConnection error:', error);
    return {
      success: false,
      error: error?.message || 'Lỗi không xác định',
      data: null,
    };
  }
};

// ========== CONNECT PLATFORM (Save credentials) ==========
export const connectPlatform = async (platform, credentials) => {
  try {
    if (!platform) {
      throw new Error('Platform là bắt buộc');
    }

    const updateData = {
      is_connected: true,
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token || null,
      token_expires_at: credentials.token_expires_at || null,
      page_id: credentials.page_id || null,
      channel_id: credentials.channel_id || null,
      account_id: credentials.account_id || null,
      connected_at: new Date().toISOString(),
      last_error: null,
    };

    return await updatePlatformConnection(platform, updateData);
  } catch (error) {
    console.error('[AutoPostService] connectPlatform error:', error);
    return {
      success: false,
      error: error?.message || 'Lỗi không xác định',
    };
  }
};

// ========== DISCONNECT PLATFORM ==========
export const disconnectPlatform = async (platform) => {
  try {
    if (!platform) {
      throw new Error('Platform là bắt buộc');
    }

    const updateData = {
      is_connected: false,
      access_token: null,
      refresh_token: null,
      token_expires_at: null,
      page_id: null,
      channel_id: null,
      account_id: null,
    };

    return await updatePlatformConnection(platform, updateData);
  } catch (error) {
    console.error('[AutoPostService] disconnectPlatform error:', error);
    return {
      success: false,
      error: error?.message || 'Lỗi không xác định',
    };
  }
};

// ========== TOGGLE PLATFORM ACTIVE STATUS ==========
export const togglePlatformActive = async (platform, isActive) => {
  try {
    return await updatePlatformConnection(platform, { is_active: isActive });
  } catch (error) {
    console.error('[AutoPostService] togglePlatformActive error:', error);
    return {
      success: false,
      error: error?.message || 'Lỗi không xác định',
    };
  }
};

// ========== UPDATE PLATFORM SETTINGS ==========
export const updatePlatformSettings = async (platform, settings) => {
  try {
    // Get current settings first
    const { data: current } = await getPlatformConnection(platform);
    const currentSettings = current?.settings || {};

    // Merge settings
    const newSettings = { ...currentSettings, ...settings };

    return await updatePlatformConnection(platform, { settings: newSettings });
  } catch (error) {
    console.error('[AutoPostService] updatePlatformSettings error:', error);
    return {
      success: false,
      error: error?.message || 'Lỗi không xác định',
    };
  }
};

// ========== TRIGGER MANUAL POST ==========
export const triggerManualPost = async (contentId) => {
  try {
    if (!contentId) {
      throw new Error('Content ID là bắt buộc');
    }

    // Get current session for auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Chưa đăng nhập');
    }

    // Call the auto-post-scheduler edge function directly
    const controller = new AbortController();
    const fetchTimeout = setTimeout(() => controller.abort(), 15000);
    let response;
    try {
      response = await fetch(`${SUPABASE_URL}/functions/v1/auto-post-scheduler`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ content_id: contentId, manual: true }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(fetchTimeout);
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Đăng bài thất bại');
    }

    return {
      success: true,
      data: result,
      message: 'Đã gửi yêu cầu đăng bài',
    };
  } catch (error) {
    console.error('[AutoPostService] triggerManualPost error:', error);
    return {
      success: false,
      error: error?.message || 'Lỗi không xác định',
    };
  }
};

// ========== RETRY FAILED POST ==========
export const retryFailedPost = async (contentId) => {
  try {
    if (!contentId) {
      throw new Error('Content ID là bắt buộc');
    }

    // Update content status back to scheduled
    const { error: updateError } = await supabase
      .from('content_calendar')
      .update({ status: 'scheduled', error_message: null })
      .eq('id', contentId);

    if (updateError) {
      throw updateError;
    }

    // Log retry attempt
    await supabase.from(LOGS_TABLE).insert({
      content_id: contentId,
      platform: 'unknown', // Will be filled by scheduler
      action: 'retry_attempted',
      status: 'pending',
    });

    return {
      success: true,
      message: 'Đã lên lịch đăng lại',
    };
  } catch (error) {
    console.error('[AutoPostService] retryFailedPost error:', error);
    return {
      success: false,
      error: error?.message || 'Lỗi không xác định',
    };
  }
};

export default {
  getAutoPostLogs,
  getLogById,
  getLogsStats,
  getPlatformConnections,
  getPlatformConnection,
  updatePlatformConnection,
  connectPlatform,
  disconnectPlatform,
  togglePlatformActive,
  updatePlatformSettings,
  triggerManualPost,
  retryFailedPost,
};
