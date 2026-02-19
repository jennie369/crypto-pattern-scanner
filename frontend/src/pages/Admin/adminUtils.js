import { supabase } from '../../lib/supabaseClient';

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const sendPartnershipNotification = async (eventType, userId, data) => {
  try {
    const { error } = await supabase.functions.invoke('partnership-notifications', {
      body: {
        event_type: eventType,
        user_id: userId,
        data: data
      }
    });
    if (error) {
      console.error('Failed to send notification:', error);
    }
  } catch (err) {
    console.error('Notification error:', err);
  }
};
