/**
 * Withdrawal Service for Admin Dashboard
 * CRUD operations for partner withdrawal management
 */

import { supabase } from './supabase';

// ============================================
// WITHDRAWAL QUERIES
// ============================================

/**
 * Get all withdrawals with filters
 */
export async function getWithdrawals({
  status = 'all',
  search = '',
  page = 1,
  limit = 50
}) {
  try {
    let query = supabase
      .from('withdrawal_requests')
      .select(`
        *,
        partner:affiliate_profiles(id, full_name, email, referral_code)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`partner.full_name.ilike.%${search}%,partner.email.ilike.%${search}%,partner.referral_code.ilike.%${search}%`);
    }

    // Pagination
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
    console.error('[withdrawalService] getWithdrawals error:', error);
    return { success: false, data: [], total: 0, error: error.message };
  }
}

/**
 * Get withdrawal statistics
 */
export async function getWithdrawalStats() {
  try {
    // Pending withdrawals
    const { count: pendingCount, data: pendingData } = await supabase
      .from('withdrawal_requests')
      .select('amount', { count: 'exact' })
      .eq('status', 'pending');

    const pendingAmount = (pendingData || []).reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);

    // Completed this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: completedCount, data: completedData } = await supabase
      .from('withdrawal_requests')
      .select('amount', { count: 'exact' })
      .eq('status', 'completed')
      .gte('completed_at', startOfMonth.toISOString());

    const completedAmount = (completedData || []).reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);

    // Total all-time
    const { data: allData } = await supabase
      .from('withdrawal_requests')
      .select('amount, status');

    const totalCompleted = (allData || [])
      .filter(w => w.status === 'completed')
      .reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);

    return {
      success: true,
      data: {
        pendingCount: pendingCount || 0,
        pendingAmount,
        completedThisMonth: completedCount || 0,
        completedAmountThisMonth: completedAmount,
        totalCompleted,
      },
    };
  } catch (error) {
    console.error('[withdrawalService] getWithdrawalStats error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Approve withdrawal
 */
export async function approveWithdrawal(withdrawalId, notes = '') {
  try {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .update({
        status: 'approved',
        admin_notes: notes,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', withdrawalId)
      .select()
      .single();

    if (error) throw error;

    await logWithdrawalAction(withdrawalId, 'approve', { notes });

    return { success: true, data };
  } catch (error) {
    console.error('[withdrawalService] approveWithdrawal error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark withdrawal as completed (paid)
 */
export async function completeWithdrawal(withdrawalId, transactionRef = '') {
  try {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .update({
        status: 'completed',
        transaction_reference: transactionRef,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', withdrawalId)
      .select()
      .single();

    if (error) throw error;

    await logWithdrawalAction(withdrawalId, 'complete', { transaction_reference: transactionRef });

    return { success: true, data };
  } catch (error) {
    console.error('[withdrawalService] completeWithdrawal error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reject withdrawal
 */
export async function rejectWithdrawal(withdrawalId, reason) {
  try {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        rejected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', withdrawalId)
      .select()
      .single();

    if (error) throw error;

    await logWithdrawalAction(withdrawalId, 'reject', { reason });

    return { success: true, data };
  } catch (error) {
    console.error('[withdrawalService] rejectWithdrawal error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get withdrawal by ID
 */
export async function getWithdrawalById(withdrawalId) {
  try {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select(`
        *,
        partner:affiliate_profiles(*)
      `)
      .eq('id', withdrawalId)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[withdrawalService] getWithdrawalById error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// ADMIN LOGS
// ============================================

async function logWithdrawalAction(withdrawalId, action, details) {
  try {
    await supabase
      .from('admin_withdrawal_logs')
      .insert({
        withdrawal_id: withdrawalId,
        action,
        details,
        created_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('[withdrawalService] logWithdrawalAction error:', error);
  }
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

export function subscribeToWithdrawals(callback) {
  return supabase
    .channel('withdrawal_requests_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'withdrawal_requests' },
      callback
    )
    .subscribe();
}

export function unsubscribe(subscription) {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
}

export default {
  getWithdrawals,
  getWithdrawalStats,
  approveWithdrawal,
  completeWithdrawal,
  rejectWithdrawal,
  getWithdrawalById,
  subscribeToWithdrawals,
  unsubscribe,
};
