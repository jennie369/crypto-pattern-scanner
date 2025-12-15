/**
 * GEM Mobile - Withdraw Configuration
 * Issue #23: Withdraw Validation
 */

export const WITHDRAW_CONFIG = {
  // Minimum amount per withdrawal
  MIN_AMOUNT: 100,

  // Minimum balance required to withdraw (Issue #23)
  MIN_BALANCE: 100000,

  // Conversion rate: 1 gem = 200 VND
  GEM_TO_VND_RATE: 200,

  // Fee structure
  PLATFORM_FEE_PERCENT: 30, // Platform takes 30%
  AUTHOR_PERCENT: 70,       // Author receives 70%

  // Processing time
  PROCESSING_DAYS: 3,       // 3 business days

  // Quick amount buttons
  QUICK_AMOUNTS: [100, 500, 1000, 5000, 10000],
};

/**
 * Calculate withdrawal amounts
 * @param {number} gemsAmount - Amount of gems to withdraw
 * @returns {object} - VND amounts breakdown
 */
export const calculateWithdrawAmounts = (gemsAmount) => {
  const vndTotal = gemsAmount * WITHDRAW_CONFIG.GEM_TO_VND_RATE;
  const platformFee = Math.floor(vndTotal * (WITHDRAW_CONFIG.PLATFORM_FEE_PERCENT / 100));
  const authorReceive = vndTotal - platformFee;

  return {
    gemsAmount,
    vndTotal,
    platformFee,
    authorReceive,
  };
};

/**
 * Check if user can withdraw based on balance
 * @param {number} balance - User's current gem balance
 * @returns {object} - { canWithdraw, reason }
 */
export const checkWithdrawEligibility = (balance) => {
  if (!balance || balance < WITHDRAW_CONFIG.MIN_BALANCE) {
    return {
      canWithdraw: false,
      reason: `Bạn cần tối thiểu ${WITHDRAW_CONFIG.MIN_BALANCE.toLocaleString()} gems để rút tiền. Số dư hiện tại: ${(balance || 0).toLocaleString()} gems.`,
      shortReason: 'Chưa đủ điều kiện rút tiền',
    };
  }

  return {
    canWithdraw: true,
    reason: null,
    shortReason: null,
  };
};

export default WITHDRAW_CONFIG;
