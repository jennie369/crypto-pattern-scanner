import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, DollarSign, Spade } from 'lucide-react';
import './MarketChatbotSection.css';

/**
 * Chatbot Quick Access Component
 * Quick access to Gemral chatbot with preset questions
 */
export const ChatbotQuickAccess = () => {
  const navigate = useNavigate();

  const handleQuickQuestion = (question) => {
    navigate(`/community?tab=chatbot&q=${encodeURIComponent(question)}`);
  };

  const handleChatNow = () => {
    navigate('/community?tab=chatbot');
  };

  return (
    <div className="chatbot-quick-access">
      <div className="chatbot-avatar">
        <div className="avatar-placeholder">
          <Sparkles size={32} />
        </div>
      </div>

      <p className="chatbot-intro">
        Hỏi Gemral về vận may, quyết định trading, hoặc đọc I Ching
      </p>

      <div className="quick-questions">
        <button onClick={() => handleQuickQuestion('Tôi có nên vào lệnh ETH/USDT lúc này?')}>
          <DollarSign size={16} /> Có nên vào lệnh?
        </button>
        <button onClick={() => handleQuickQuestion('Đọc quẻ cho ngày hôm nay')}>
          <Sparkles size={16} /> Đọc quẻ hôm nay
        </button>
        <button onClick={() => handleQuickQuestion('Phân tích Tarot cho trading tuần này')}>
          <Spade size={16} /> Tarot Trading
        </button>
      </div>

      <button className="chat-now-btn" onClick={handleChatNow}>
        Bắt đầu Chat →
      </button>
    </div>
  );
};

export default ChatbotQuickAccess;
