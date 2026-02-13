/**
 * Gemral - Wallet Service
 * Feature #14: Virtual Currency
 * Handles wallet operations and transactions
 */

import { supabase } from './supabase';

export const walletService = {
  /**
   * Get user's wallet
   * @returns {Promise<object>}
   */
  async getWallet() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chưa đăng nhập' };
      }

      // Get or create wallet
      let { data: wallet, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Table doesn't exist - return default wallet
      if (error && error.code === 'PGRST205') {
        console.warn('[Wallet] Table user_wallets not found, using default values');
        return {
          success: true,
          data: {
            id: null,
            user_id: user.id,
            gem_balance: 0,
            diamond_balance: 0,
            total_earned: 0,
            total_spent: 0,
          },
        };
      }

      // If wallet doesn't exist, create one
      if (error && error.code === 'PGRST116') {
        const { data: newWallet, error: createError } = await supabase
          .from('user_wallets')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) {
          // Table might not exist
          if (createError.code === 'PGRST205' || createError.code === '42P01') {
            console.warn('[Wallet] Cannot create wallet - table not found');
            return {
              success: true,
              data: {
                id: null,
                user_id: user.id,
                gem_balance: 0,
                diamond_balance: 0,
                total_earned: 0,
                total_spent: 0,
              },
            };
          }
          throw createError;
        }
        wallet = newWallet;
      } else if (error) {
        throw error;
      }

      return { success: true, data: wallet };
    } catch (error) {
      console.error('[Wallet] Get wallet error:', error);
      // Return default wallet on any error to prevent app crash
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
   * Get wallet balance
   * @returns {Promise<object>}
   */
  async getBalance() {
    try {
      const result = await this.getWallet();
      if (!result.success) return result;

      return {
        success: true,
        data: {
          gems: result.data.gem_balance || 0,
          diamonds: result.data.diamond_balance || 0,
          totalEarned: result.data.total_earned || 0,
          totalSpent: result.data.total_spent || 0,
        },
      };
    } catch (error) {
      console.error('[Wallet] Get balance error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get transaction history
   * @param {number} limit - Max results
   * @param {number} offset - Offset for pagination
   * @returns {Promise<array>}
   */
  async getTransactions(limit = 20, offset = 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // First get the wallet ID
      const { data: wallet, error: walletError } = await supabase
        .from('user_wallets')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // Table doesn't exist or wallet not found
      if (walletError && (walletError.code === 'PGRST205' || walletError.code === 'PGRST116')) {
        console.warn('[Wallet] Cannot get transactions - wallet table not found');
        return [];
      }

      if (!wallet) return [];

      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Table doesn't exist
      if (error && error.code === 'PGRST205') {
        console.warn('[Wallet] wallet_transactions table not found');
        return [];
      }

      if (error) throw error;
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

      const walletResult = await this.getWallet();
      if (!walletResult.success) return walletResult;

      if (walletResult.data.gem_balance < amount) {
        return { success: false, error: 'Không đủ gems' };
      }

      // Update balance
      const { data: updatedWallet, error: updateError } = await supabase
        .from('user_wallets')
        .update({
          gem_balance: walletResult.data.gem_balance - amount,
          total_spent: walletResult.data.total_spent + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', walletResult.data.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Record transaction
      await supabase.from('wallet_transactions').insert({
        wallet_id: walletResult.data.id,
        type: 'gift_sent',
        currency: 'gem',
        amount: -amount,
        description,
        reference_id: referenceId,
        reference_type: referenceType,
      });

      return { success: true, data: updatedWallet };
    } catch (error) {
      console.error('[Wallet] Spend error:', error);
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
