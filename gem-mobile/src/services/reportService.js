/**
 * Gemral - Report Service
 * Handles post and comment reporting
 */

import { supabase } from './supabase';

// Report reasons (Vietnamese)
export const REPORT_REASONS = [
  { id: 'spam', label: 'Spam / Quang cao', description: 'Noi dung quang cao, spam' },
  { id: 'inappropriate', label: 'Noi dung khong phu hop', description: 'Noi dung phan cam, bao luc' },
  { id: 'harassment', label: 'Quay roi / Bat nat', description: 'Tan cong ca nhan, bat nat' },
  { id: 'misinformation', label: 'Thong tin sai lech', description: 'Tin gia, thong tin sai su that' },
  { id: 'copyright', label: 'Vi pham ban quyen', description: 'Su dung noi dung khong duoc phep' },
  { id: 'other', label: 'Khac', description: 'Ly do khac' },
];

export const reportService = {
  /**
   * Report a post
   * @param {string} postId - Post ID to report
   * @param {string} reason - Report reason ID
   * @param {string} description - Additional description (optional)
   */
  async reportPost(postId, reason, description = '') {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      // Check if already reported by this user
      const { data: existingReport } = await supabase
        .from('post_reports')
        .select('id')
        .eq('post_id', postId)
        .eq('reporter_id', user.id)
        .single();

      if (existingReport) {
        return { success: false, error: 'Ban da bao cao bai viet nay roi' };
      }

      // Create report
      const { data, error } = await supabase
        .from('post_reports')
        .insert({
          post_id: postId,
          reporter_id: user.id,
          reason: reason,
          description: description,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      console.log('[ReportService] Post reported:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('[ReportService] Report post error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Report a comment
   * @param {string} commentId - Comment ID to report
   * @param {string} reason - Report reason ID
   * @param {string} description - Additional description (optional)
   */
  async reportComment(commentId, reason, description = '') {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      // Check if already reported by this user
      const { data: existingReport } = await supabase
        .from('comment_reports')
        .select('id')
        .eq('comment_id', commentId)
        .eq('reporter_id', user.id)
        .single();

      if (existingReport) {
        return { success: false, error: 'Ban da bao cao binh luan nay roi' };
      }

      // Create report
      const { data, error } = await supabase
        .from('comment_reports')
        .insert({
          comment_id: commentId,
          reporter_id: user.id,
          reason: reason,
          description: description,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      console.log('[ReportService] Comment reported:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('[ReportService] Report comment error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Check if current user has reported a post
   * @param {string} postId - Post ID to check
   */
  async hasReportedPost(postId) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

      if (!user) return false;

      const { data } = await supabase
        .from('post_reports')
        .select('id')
        .eq('post_id', postId)
        .eq('reporter_id', user.id)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get report count for a post (admin only)
   * @param {string} postId - Post ID
   */
  async getPostReportCount(postId) {
    try {
      const { count, error } = await supabase
        .from('post_reports')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('[ReportService] Get report count error:', error);
      return 0;
    }
  },

  /**
   * Get all pending reports (admin only)
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   */
  async getPendingReports(page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('post_reports')
        .select(`
          *,
          post:forum_posts(id, title, content, user_id),
          reporter:profiles(id, full_name, email)
        `, { count: 'exact' })
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('[ReportService] Get pending reports error:', error);
      return { data: [], count: 0 };
    }
  },

  /**
   * Update report status (admin only)
   * @param {string} reportId - Report ID
   * @param {string} status - New status ('reviewed', 'resolved', 'dismissed')
   */
  async updateReportStatus(reportId, status) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

      const { data, error } = await supabase
        .from('post_reports')
        .update({
          status: status,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reportId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[ReportService] Update report status error:', error);
      return { success: false, error: error.message };
    }
  },
};

export default reportService;
