/**
 * Gemral - Wallet Service
 * Feature #14: Virtual Currency
 * Handles wallet operations and transactions
 *
 * IMPORTANT: Gem balance is now unified to profiles.gems
 * This service reads from profiles.gems as the single source of truth
 * user_wallets is kept for backwards compatibility and synced via trigger
 */

import { supabase } from './supabase';

export const walletService = {
  /**
   * Get user's wallet - NOW READS FROM profiles.gems
   * @returns {Promise<object>}
   */
  async getWallet() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chưa đăng nhập' };
      }

      // PRIMARY: Get gem balance from profiles.gems (single source of truth)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('gems')
        .eq('id', user.id)
        .single();

      const gemBalance = profile?.gems || 0;

      // SECONDARY: Get additional wallet info (diamonds, stats) if available
      let { data: wallet, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // If wallet doesn't exist or table not found, return with profile gems
      if (error) {
        return {
          success: true,
          data: {
            id: null,
            user_id: user.id,
            gem_balance: gemBalance, // From profiles.gems
            diamond_balance: 0,
            total_earned: gemBalance,
            total_spent: 0,
          },
        };
      }

      // Return wallet with gem_balance from profiles.gems
      return {
        success: true,
        data: {
          ...wallet,
          gem_balance: gemBalance, // Override with profiles.gems
        },
      };
    } catch (error) {
      console.error('[Wallet] Get wallet error:', error);
      return {
        success: true,
        data: {
          id: null,
          user_id: null,
          gem_balance: 0,
          diamond_balance: 0,
          total_earned: 0,
          total_spent: 0,
        },
      };
    }
  },

  /**
   * Get wallet balance - NOW READS FROM profiles.gems
   * @returns {Promise<object>}
   */
  async getBalance() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chưa đăng nhập' };
      }

      // Use RPC function for gem balance (single source of truth)
      const { data: gemBalance, error: rpcError } = await supabase
        .rpc('get_gem_balance', { p_user_id: user.id });

      if (rpcError) {
        // Fallback: direct query to profiles.gems
        const { data: profile } = await supabase
          .from('profiles')
          .select('gems')
          .eq('id', user.id)
          .single();

        return {
          success: true,
          data: {
            gems: profile?.gems || 0,
            diamonds: 0,
            totalEarned: profile?.gems || 0,
            totalSpent: 0,
          },
        };
      }

      // Get additional stats from user_wallets if available
      const { data: wallet } = await supabase
        .from('user_wallets')
        .select('diamond_balance, total_earned, total_spent')
        .eq('user_id', user.id)
        .single();

      return {
        success: true,
        data: {
          gems: gemBalance || 0,
          diamonds: wallet?.diamond_balance || 0,
          totalEarned: wallet?.total_earned || gemBalance || 0,
          totalSpent: wallet?.total_spent || 0,
        },
      };
    } catch (error) {
      console.error('[Wallet] Get balance error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get transaction history - now uses gems_transactions table
   * @param {number} limit - Max results
   * @param {number} offset - Offset for pagination
   * @returns {Promise<array>}
   */
  async getTransactions(limit = 20, offset = 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // PRIMARY: Try gems_transactions table first
      const { data: gemsTxns, error: gemsError } = await supabase
        .from('gems_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!gemsError && gemsTxns && gemsTxns.length > 0) {
        // Map to wallet_transactions format for compatibility
        return gemsTxns.map(tx => ({
          id: tx.id,
          type: tx.type,
          currency: 'gem',
          amount: tx.amount,
          description: tx.description,
          reference_id: tx.reference_id,
          reference_type: tx.reference_type,
          created_at: tx.created_at,
        }));
      }

      // FALLBACK: Try wallet_transactions table
      const { data: wallet } = await supabase
        .from('user_wallets')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!wallet) return [];

      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.warn('[Wallet] wallet_transactions error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[Wallet] Get transactions error:', error);
      return [];
    }
  },

  /**
   * Get available currency packages
   * @returns {Promise<array>}
   */
  async getCurrencyPackages() {
    try {
      const { data, error } = await supabase
        .from('currency_packages')
        .select('*')
        .eq('is_active', true)
        .order('gem_amount', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Wallet] Get packages error:', error);
      return [];
    }
  },

  /**
   * Purchase currency package
   * @param {string} packageId - Package ID
   * @param {string} paymentMethod - Payment method (momo, vnpay, card)
   * @returns {Promise<object>}
   */
  async purchasePackage(packageId, paymentMethod) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chưa đăng nhập' };
      }

      // Get package details
      const { data: pkg, error: pkgError } = await supabase
        .from('currency_packages')
        .select('*')
        .eq('id', packageId)
        .single();

      if (pkgError || !pkg) {
        console.error('[Wallet] Package error:', pkgError);
        return { success: false, error: 'Gói không tồn tại' };
      }

      const totalGems = pkg.gem_amount + (pkg.bonus_gems || 0);

      // Get or create user's wallet
      let wallet = null;

      // Try to get existing wallet
      const { data: existingWallet, error: walletError } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (walletError && walletError.code === 'PGRST116') {
        // Wallet doesn't exist, create one
        const { data: newWallet, error: createError } = await supabase
          .from('user_wallets')
          .insert({ user_id: user.id, gem_balance: 0, diamond_balance: 0, total_earned: 0, total_spent: 0 })
          .select()
          .single();

        if (createError) {
          console.error('[Wallet] Create wallet error:', createError);
          return { success: false, error: 'Không thể tạo ví. Vui lòng thử lại.' };
        }
        wallet = newWallet;
      } else if (walletError) {
        console.error('[Wallet] Get wallet error:', walletError);
        return { success: false, error: 'Không thể truy cập ví. Vui lòng thử lại.' };
      } else {
        wallet = existingWallet;
      }

      // Here you would integrate with actual payment gateway (MoMo, VNPay, etc.)
      // For now, we'll simulate the transaction (demo mode)
      console.log('[Wallet] Processing payment via:', paymentMethod);

      // Update wallet balance
      const { data: updatedWallet, error: updateError } = await supabase
        .from('user_wallets')
        .update({
          gem_balance: (wallet.gem_balance || 0) + totalGems,
          total_earned: (wallet.total_earned || 0) + totalGems,
          updated_at: new Date().toISOString(),
        })
        .eq('id', wallet.id)
        .select()
        .single();

      if (updateError) {
        console.error('[Wallet] Update error:', updateError);
        throw updateError;
      }

      // Record transaction
      await supabase.from('wallet_transactions').insert({
        wallet_id: wallet.id,
        type: 'purchase',
        currency: 'gem',
        amount: totalGems,
        description: `Mua ${pkg.name} - ${pkg.gem_amount} gems${pkg.bonus_gems ? ` + ${pkg.bonus_gems} bonus` : ''}`,
        reference_id: packageId,
        reference_type: 'currency_package',
      });

      console.log('[Wallet] Purchased package:', pkg.name, '- Total gems:', totalGems);
      return { success: true, data: updatedWallet };
    } catch (error) {
      console.error('[Wallet] Purchase error:', error);
      return { success: false, error: error.message || 'Lỗi khi mua gói. Vui lòng thử lại.' };
    }
  },

  /**
   * Spend gems (internal use for gifts, etc.)
   * NOW USES RPC to properly deduct from profiles.gems
   * @param {number} amount - Amount to spend
   * @param {string} description - Transaction description
   * @param {string} referenceId - Reference ID (e.g., gift ID)
   * @param {string} referenceType - Reference type
   * @returns {Promise<object>}
   */
  async spendGems(amount, description, referenceId = null, referenceType = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chưa đăng nhập' };
      }

      // Use RPC function to properly deduct from profiles.gems
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('spend_gems', {
          p_user_id: user.id,
          p_amount: amount,
          p_description: description,
          p_reference_id: referenceId,
          p_reference_type: referenceType,
        });

      if (rpcError) {
        console.warn('[Wallet] RPC spend_gems error, falling back:', rpcError.message, rpcError.code);
        // Fallback: direct update to profiles.gems
        return await this._spendGemsFallback(user.id, amount, description, referenceId, referenceType);
      }

      // RPC can return different formats - handle all cases
      // Format 1: { success: true/false, new_balance: number, error: string }
      // Format 2: just new_balance as number
      // Format 3: null/undefined on success
      if (rpcResult === null || rpcResult === undefined) {
        // RPC returned nothing - assume success, verify by checking balance
        console.log('[Wallet] RPC returned null, assuming success');
        return { success: true, data: { gem_balance: null } };
      }

      if (typeof rpcResult === 'object' && rpcResult.success === false) {
        return { success: false, error: rpcResult.error || 'Không đủ gems' };
      }

      // Extract new balance from result
      const newBalance = typeof rpcResult === 'number' ? rpcResult : rpcResult?.new_balance;
      console.log('[Wallet] Spent gems via RPC:', amount, '- New balance:', newBalance);
      return { success: true, data: { gem_balance: newBalance } };
    } catch (error) {
      console.error('[Wallet] Spend error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Fallback method for spending gems (direct update)
   */
  async _spendGemsFallback(userId, amount, description, referenceId, referenceType) {
    try {
      // Get current balance from profiles.gems
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('gems')
        .eq('id', userId)
        .single();

      const currentBalance = profile?.gems || 0;

      if (currentBalance < amount) {
        return { success: false, error: 'Không đủ gems' };
      }

      // Deduct from profiles.gems
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ gems: currentBalance - amount })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Also try to update user_wallets for backwards compatibility
      await supabase
        .from('user_wallets')
        .update({
          gem_balance: currentBalance - amount,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      // Try to record transaction in gems_transactions (ignore errors)
      // IMPORTANT: Use 'spend' type to match CHECK constraint: ('spend', 'receive', 'purchase', 'bonus', 'refund')
      // The reference_type field distinguishes gift sends from other spends
      try {
        const { error: txError } = await supabase.from('gems_transactions').insert({
          user_id: userId,
          type: 'spend', // Must match CHECK constraint
          amount: -amount, // Negative for spending
          description,
          reference_id: referenceId,
          reference_type: referenceType, // 'gift' for gift sends
        });
        if (txError) {
          console.log('[Wallet] Transaction log failed:', txError.message, txError.code);
        } else {
          console.log('[Wallet] Transaction recorded: spend', -amount, 'reference_type:', referenceType);
        }
      } catch (txError) {
        // Ignore transaction logging errors
        console.log('[Wallet] Transaction log exception:', txError.message);
      }

      console.log('[Wallet] Spent gems via fallback:', amount);
      return { success: true, data: { gem_balance: currentBalance - amount } };
    } catch (error) {
      console.error('[Wallet] Fallback spend error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Receive gems (from gifts, etc.)
   * @param {string} userId - Recipient user ID
   * @param {number} amount - Amount to receive
   * @param {string} description - Transaction description
   * @param {string} referenceId - Reference ID
   * @param {string} referenceType - Reference type
   * @returns {Promise<object>}
   */
  async receiveGems(userId, amount, description, referenceId = null, referenceType = null) {
    try {
      // Get recipient's wallet
      let { data: wallet } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Create wallet if doesn't exist
      if (!wallet) {
        const { data: newWallet, error } = await supabase
          .from('user_wallets')
          .insert({ user_id: userId })
          .select()
          .single();

        if (error) throw error;
        wallet = newWallet;
      }

      // Update balance
      const { data: updatedWallet, error: updateError } = await supabase
        .from('user_wallets')
        .update({
          gem_balance: wallet.gem_balance + amount,
          total_earned: wallet.total_earned + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', wallet.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Record transaction
      await supabase.from('wallet_transactions').insert({
        wallet_id: wallet.id,
        type: 'gift_received',
        currency: 'gem',
        amount,
        description,
        reference_id: referenceId,
        reference_type: referenceType,
      });

      return { success: true, data: updatedWallet };
    } catch (error) {
      console.error('[Wallet] Receive error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Add bonus gems
   * @param {number} amount - Bonus amount
   * @param {string} reason - Bonus reason
   * @returns {Promise<object>}
   */
  async addBonus(amount, reason) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chưa đăng nhập' };
      }

      const walletResult = await this.getWallet();
      if (!walletResult.success) return walletResult;

      const { data: updatedWallet, error } = await supabase
        .from('user_wallets')
        .update({
          gem_balance: walletResult.data.gem_balance + amount,
          total_earned: walletResult.data.total_earned + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', walletResult.data.id)
        .select()
        .single();

      if (error) throw error;

      // Record transaction
      await supabase.from('wallet_transactions').insert({
        wallet_id: walletResult.data.id,
        type: 'bonus',
        currency: 'gem',
        amount,
        description: reason,
      });

      return { success: true, data: updatedWallet };
    } catch (error) {
      console.error('[Wallet] Add bonus error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Format gem amount for display
   * @param {number} amount - Amount
   * @returns {string}
   */
  formatGems(amount) {
    // Null/undefined check
    if (amount === null || amount === undefined) {
      return '0';
    }
    const num = Number(amount) || 0;
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  },

  /**
   * Format VND price for display
   * @param {number} amount - Amount in VND
   * @returns {string}
   */
  formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  },
};

export default walletService;
