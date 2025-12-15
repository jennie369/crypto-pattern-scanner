/**
 * GEM Mobile - Withdraw Service
 * Issue #24: Complete Withdraw Flow
 * Updated to match existing withdrawal_requests schema
 */

import { supabase } from './supabase';
import { WITHDRAW_CONFIG, calculateWithdrawAmounts } from '../config/withdraw';

/**
 * Submit withdrawal request
 */
export const submitWithdrawRequest = async ({
  userId,
  amount,
  bankInfo,
}) => {
  try {
    // 1. Check for existing pending request
    const { data: pending } = await supabase
      .from('withdrawal_requests')
      .select('id')
      .eq('partner_id', userId)
      .eq('status', 'pending')
      .single();

    if (pending) {
      return {
        success: false,
        error: 'Bạn đang có yêu cầu rút tiền chờ xử lý',
      };
    }

    // 2. Get current balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('gems, available_balance')
      .eq('id', userId)
      .single();

    const currentBalance = profile?.available_balance || profile?.gems || 0;

    // 3. Calculate amounts
    const amounts = calculateWithdrawAmounts(amount);

    // 4. Create request (using existing schema columns)
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .insert({
        partner_id: userId,
        amount: amount,
        available_balance_at_request: currentBalance,
        vnd_amount: amounts.vndTotal,
        platform_fee: amounts.platformFee,
        author_receive: amounts.authorReceive,
        bank_name: bankInfo.bankName,
        account_number: bankInfo.accountNumber,
        account_holder_name: bankInfo.accountName,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // 5. Notify admins
    await notifyAdminsNewWithdraw(data);

    return { success: true, data };
  } catch (error) {
    console.error('[Withdraw] submitWithdrawRequest error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if user has pending withdrawal
 */
export const checkPendingWithdraw = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select('id, amount, created_at, status')
      .eq('partner_id', userId)
      .eq('status', 'pending')
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is okay
      throw error;
    }

    return { hasPending: !!data, request: data };
  } catch (error) {
    console.error('[Withdraw] checkPendingWithdraw error:', error);
    return { hasPending: false, request: null };
  }
};

/**
 * Get user's withdrawal history
 */
export const getWithdrawHistory = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('partner_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[Withdraw] getWithdrawHistory error:', error);
    return { success: false, data: [] };
  }
};

/**
 * [ADMIN] Get all pending withdrawal requests
 */
export const getPendingWithdrawRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select(`
        *,
        partner:profiles!withdrawal_requests_partner_id_fkey (
          id, display_name, email, avatar_url, full_name
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[Withdraw] getPendingWithdrawRequests error:', error);
    return { success: false, data: [] };
  }
};

/**
 * [ADMIN] Get all withdrawal requests with filters
 */
export const getAllWithdrawRequests = async (status = null, limit = 50) => {
  try {
    let query = supabase
      .from('withdrawal_requests')
      .select(`
        *,
        partner:profiles!withdrawal_requests_partner_id_fkey (
          id, display_name, email, avatar_url, full_name
        ),
        reviewer:profiles!withdrawal_requests_reviewed_by_fkey (
          id, display_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[Withdraw] getAllWithdrawRequests error:', error);
    return { success: false, data: [] };
  }
};

/**
 * [ADMIN] Process withdrawal (approve/reject)
 */
export const processWithdrawal = async (requestId, adminId, action, rejectReason = null, transactionId = null) => {
  try {
    const { data, error } = await supabase.rpc('process_withdrawal', {
      p_request_id: requestId,
      p_admin_id: adminId,
      p_action: action,
      p_reject_reason: rejectReason,
      p_transaction_id: transactionId,
    });

    if (error) throw error;

    return { success: data?.success || false, data, error: data?.error };
  } catch (error) {
    console.error('[Withdraw] processWithdrawal error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Notify admins about new withdrawal request
 */
const notifyAdminsNewWithdraw = async (request) => {
  try {
    // Get all admin users
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .or('role.eq.admin,is_admin.eq.true');

    if (!admins || admins.length === 0) return;

    // Create notifications for each admin
    const notifications = admins.map(admin => ({
      user_id: admin.id,
      type: 'admin_withdraw_request',
      title: 'Yêu cầu rút tiền mới',
      body: `Có yêu cầu rút ${request.amount?.toLocaleString()} gems cần xử lý`,
      data: { request_id: request.id },
    }));

    await supabase.from('notifications').insert(notifications);
  } catch (error) {
    console.error('[Withdraw] notifyAdminsNewWithdraw error:', error);
  }
};

/**
 * Get withdrawal statistics for admin dashboard
 */
export const getWithdrawStats = async () => {
  try {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select('status, amount, vnd_amount');

    if (error) throw error;

    const stats = {
      pending: { count: 0, totalGems: 0, totalVnd: 0 },
      approved: { count: 0, totalGems: 0, totalVnd: 0 },
      rejected: { count: 0, totalGems: 0, totalVnd: 0 },
      completed: { count: 0, totalGems: 0, totalVnd: 0 },
      total: { count: 0, totalGems: 0, totalVnd: 0 },
    };

    (data || []).forEach(req => {
      const status = req.status;
      if (stats[status]) {
        stats[status].count++;
        stats[status].totalGems += parseFloat(req.amount) || 0;
        stats[status].totalVnd += parseFloat(req.vnd_amount) || 0;
      }
      stats.total.count++;
      stats.total.totalGems += parseFloat(req.amount) || 0;
      stats.total.totalVnd += parseFloat(req.vnd_amount) || 0;
    });

    return { success: true, stats };
  } catch (error) {
    console.error('[Withdraw] getWithdrawStats error:', error);
    return { success: false, stats: null };
  }
};

export default {
  submitWithdrawRequest,
  checkPendingWithdraw,
  getWithdrawHistory,
  getPendingWithdrawRequests,
  getAllWithdrawRequests,
  processWithdrawal,
  getWithdrawStats,
};
