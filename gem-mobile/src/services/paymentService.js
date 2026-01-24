// ============================================================
// PAYMENT SERVICE
// Purpose: Handle payment status và verification
// ============================================================

import { supabase, SUPABASE_URL } from './supabase';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

// ============================================================
// CONSTANTS
// ============================================================

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  VERIFYING: 'verifying',
  PAID: 'paid',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

export const BANK_INFO = {
  bankName: 'Vietcombank',
  bankCode: 'VCB',
  accountNumber: '1074286868',
  accountName: 'CT TNHH GEM CAPITAL HOLDING',
};

// ============================================================
// QR CODE GENERATION
// ============================================================

/**
 * Generate VietQR URL
 * @param {number} amount - Số tiền
 * @param {string} transferContent - Nội dung chuyển khoản
 * @returns {string} QR code URL
 */
export const generateVietQRUrl = (amount, transferContent) => {
  if (!amount || !transferContent) {
    console.warn('[PaymentService] Missing amount or transferContent');
    return null;
  }

  const encodedContent = encodeURIComponent(transferContent);
  const encodedName = encodeURIComponent(BANK_INFO.accountName);

  return `https://img.vietqr.io/image/${BANK_INFO.bankCode}-${BANK_INFO.accountNumber}-compact2.png?amount=${amount}&addInfo=${encodedContent}&accountName=${encodedName}`;
};

// ============================================================
// PAYMENT STATUS
// ============================================================

/**
 * Get payment status by order number (direct database query)
 * @param {string} orderNumber - Mã đơn hàng
 * @param {string} email - Email khách hàng (optional)
 * @returns {Promise<Object>} Payment status data
 */
export const getPaymentStatus = async (orderNumber, email = null) => {
  try {
    if (!orderNumber) {
      throw new Error('Order number is required');
    }

    let query = supabase
      .from('pending_payments')
      .select('*')
      .eq('order_number', orderNumber);

    if (email) {
      query = query.eq('customer_email', email);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('[PaymentService] getPaymentStatus error:', error);
      return { success: false, error: error.message, data: null };
    }

    // Calculate time remaining
    const now = new Date();
    const expiresAt = new Date(data.expires_at);
    const timeRemaining = Math.max(0, expiresAt.getTime() - now.getTime());

    return {
      success: true,
      data: {
        ...data,
        timeRemainingMs: timeRemaining,
        timeRemainingSeconds: Math.floor(timeRemaining / 1000),
        isExpired: data.payment_status === PAYMENT_STATUS.EXPIRED || timeRemaining <= 0,
        isPaid: data.payment_status === PAYMENT_STATUS.PAID,
        isPending: data.payment_status === PAYMENT_STATUS.PENDING,
        isVerifying: data.payment_status === PAYMENT_STATUS.VERIFYING,
      },
    };
  } catch (error) {
    console.error('[PaymentService] getPaymentStatus error:', error);
    return { success: false, error: error.message, data: null };
  }
};

/**
 * Get payment status via Edge Function (public API)
 * @param {string} orderNumber - Mã đơn hàng
 * @param {string} email - Email (optional for security)
 * @returns {Promise<Object>} Payment status
 */
export const getPaymentStatusPublic = async (orderNumber, email = null) => {
  try {
    if (!orderNumber) {
      throw new Error('Order number is required');
    }

    let url = `${SUPABASE_URL}/functions/v1/payment-status?order=${orderNumber}`;
    if (email) {
      url += `&email=${encodeURIComponent(email)}`;
    }

    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to get payment status');
    }

    return {
      success: true,
      data: {
        ...result.data,
        timeRemainingMs: result.data.time_remaining_ms,
        timeRemainingSeconds: result.data.time_remaining_seconds,
        isExpired: result.data.is_expired,
        isPaid: result.data.is_paid,
        isPending: result.data.is_pending,
        isVerifying: result.data.is_verifying,
      },
    };
  } catch (error) {
    console.error('[PaymentService] getPaymentStatusPublic error:', error);
    return { success: false, error: error.message, data: null };
  }
};

// ============================================================
// PROOF UPLOAD
// ============================================================

/**
 * Upload payment proof image
 * @param {string} orderNumber - Mã đơn hàng
 * @param {Object} imageFile - Image file object { uri, type, name }
 * @returns {Promise<Object>} Upload result
 */
export const uploadPaymentProof = async (orderNumber, imageFile) => {
  try {
    if (!orderNumber || !imageFile?.uri) {
      throw new Error('Order number and image are required');
    }

    const fileName = `proofs/${orderNumber}_${Date.now()}.jpg`;

    // Prepare file for upload
    const formData = new FormData();
    formData.append('file', {
      uri: imageFile.uri,
      type: imageFile.type || 'image/jpeg',
      name: imageFile.name || fileName,
    });

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(fileName, formData, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      // Try alternative upload method - platform specific
      let fileData;
      if (Platform.OS === 'web') {
        const response = await fetch(imageFile.uri);
        fileData = await response.blob();
      } else {
        // React Native: use FileSystem
        const base64 = await FileSystem.readAsStringAsync(imageFile.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        fileData = bytes.buffer;
      }

      const { data: altUploadData, error: altUploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, fileData, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (altUploadError) {
        throw altUploadError;
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(fileName);

    const publicUrl = urlData?.publicUrl;

    // Update pending payment record
    const { error: updateError } = await supabase
      .from('pending_payments')
      .update({
        proof_image_url: publicUrl,
        proof_uploaded_at: new Date().toISOString(),
        payment_status: PAYMENT_STATUS.VERIFYING,
      })
      .eq('order_number', orderNumber);

    if (updateError) {
      throw updateError;
    }

    // Log event
    await supabase.from('payment_logs').insert({
      order_number: orderNumber,
      event_type: 'proof_uploaded',
      event_data: {
        file_name: fileName,
        public_url: publicUrl,
      },
      source: 'mobile_app',
    });

    return {
      success: true,
      data: {
        fileName,
        publicUrl,
        status: PAYMENT_STATUS.VERIFYING,
      },
    };
  } catch (error) {
    console.error('[PaymentService] uploadPaymentProof error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================
// USER ACCESS
// ============================================================

/**
 * Get user access levels
 * @param {string} email - User email
 * @returns {Promise<Object>} Access levels
 */
export const getUserAccess = async (email) => {
  try {
    if (!email) {
      throw new Error('Email is required');
    }

    const { data, error } = await supabase
      .from('user_access')
      .select('*')
      .eq('user_email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found
      throw error;
    }

    // Default access if no record
    if (!data) {
      return {
        success: true,
        data: {
          scanner_tier: 0,
          course_tier: 0,
          chatbot_tier: 0,
          gem_balance: 0,
          enrolled_courses: [],
        },
      };
    }

    // Check subscription expiration
    if (data.subscription_end && new Date(data.subscription_end) < new Date()) {
      return {
        success: true,
        data: {
          ...data,
          scanner_tier: 0,
          course_tier: 0,
          chatbot_tier: 0,
          isExpired: true,
        },
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[PaymentService] getUserAccess error:', error);
    return { success: false, error: error.message, data: null };
  }
};

/**
 * Check if user has specific access
 * @param {string} email - User email
 * @param {string} type - Access type (scanner, course, chatbot)
 * @param {number} requiredTier - Required tier level
 * @returns {Promise<boolean>}
 */
export const checkUserAccess = async (email, type, requiredTier = 1) => {
  try {
    const result = await getUserAccess(email);

    if (!result.success || !result.data) {
      return false;
    }

    const tierKey = `${type}_tier`;
    const userTier = result.data[tierKey] || 0;

    return userTier >= requiredTier;
  } catch (error) {
    console.error('[PaymentService] checkUserAccess error:', error);
    return false;
  }
};

// ============================================================
// PAYMENT HISTORY
// ============================================================

/**
 * Get user's payment history
 * @param {string} email - User email
 * @returns {Promise<Object>} Payment history
 */
export const getPaymentHistory = async (email) => {
  try {
    if (!email) {
      throw new Error('Email is required');
    }

    const { data, error } = await supabase
      .from('pending_payments')
      .select('*')
      .eq('customer_email', email)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[PaymentService] getPaymentHistory error:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ============================================================
// HELPERS
// ============================================================

/**
 * Format currency for display
 * @param {number} amount - Amount
 * @param {string} currency - Currency code
 * @returns {string} Formatted amount
 */
export const formatCurrency = (amount, currency = 'VND') => {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0;
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format time remaining
 * @param {number} seconds - Seconds remaining
 * @returns {string} Formatted time (HH:MM:SS)
 */
export const formatTimeRemaining = (seconds) => {
  if (seconds <= 0) return '00:00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs]
    .map(v => v.toString().padStart(2, '0'))
    .join(':');
};

/**
 * Get status display info
 * @param {string} status - Payment status
 * @returns {Object} { label, color, icon }
 */
export const getStatusDisplay = (status) => {
  const statusMap = {
    [PAYMENT_STATUS.PENDING]: {
      label: 'Chờ thanh toán',
      color: '#FFBD59',
      icon: 'clock',
    },
    [PAYMENT_STATUS.VERIFYING]: {
      label: 'Đang xác minh',
      color: '#6A5BFF',
      icon: 'search',
    },
    [PAYMENT_STATUS.PAID]: {
      label: 'Đã thanh toán',
      color: '#00F0FF',
      icon: 'check-circle',
    },
    [PAYMENT_STATUS.EXPIRED]: {
      label: 'Hết hạn',
      color: '#9C0612',
      icon: 'alert-circle',
    },
    [PAYMENT_STATUS.CANCELLED]: {
      label: 'Đã hủy',
      color: '#666',
      icon: 'x-circle',
    },
  };

  return statusMap[status] || statusMap[PAYMENT_STATUS.PENDING];
};

/**
 * Generate transfer content from order number
 * @param {string} orderNumber - Order number
 * @returns {string} Transfer content (DH{orderNumber})
 */
export const generateTransferContent = (orderNumber) => {
  return `DH${orderNumber}`;
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  PAYMENT_STATUS,
  BANK_INFO,
  generateVietQRUrl,
  getPaymentStatus,
  getPaymentStatusPublic,
  uploadPaymentProof,
  getUserAccess,
  checkUserAccess,
  getPaymentHistory,
  formatCurrency,
  formatTimeRemaining,
  getStatusDisplay,
  generateTransferContent,
};
