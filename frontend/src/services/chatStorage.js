const KEY = 'gem_chat_history';

export const chatStorage = {
  save: (messages) => {
    try {
      // Save last 50 messages to avoid localStorage quota
      localStorage.setItem(KEY, JSON.stringify(messages.slice(-50)));
    } catch (e) {
      console.error('💾 Save chat failed:', e);
    }
  },

  load: () => {
    try {
      const data = localStorage.getItem(KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('📂 Load chat failed:', e);
      return [];
    }
  },

  clear: () => {
    try {
      localStorage.removeItem(KEY);
      console.log('🗑️ Chat history cleared');
    } catch (e) {
      console.error('❌ Clear chat failed:', e);
    }
  }
};
