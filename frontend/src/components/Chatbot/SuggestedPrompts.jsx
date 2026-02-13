/**
 * SuggestedPrompts Component
 * Shows category-specific suggested prompts based on active mode
 * Uses design tokens for consistent styling
 */

import React from 'react';
import { MessageCircle, Sparkles, ScrollText, TrendingUp, Gem, Heart, Star, Zap } from 'lucide-react';
import './SuggestedPrompts.css';

// Suggested prompts per category
const PROMPTS_BY_MODE = {
  chat: {
    icon: MessageCircle,
    title: 'Gợi ý câu hỏi',
    prompts: [
      { text: 'Phân tích xu hướng BTC hôm nay', icon: TrendingUp },
      { text: 'Tư vấn chiến lược trading cho người mới', icon: Star },
      { text: 'Năng lượng phong thủy cho trader', icon: Gem },
      { text: 'Cách quản lý cảm xúc khi trading', icon: Heart },
    ]
  },
  iching: {
    icon: ScrollText,
    title: 'Câu hỏi Kinh Dịch',
    prompts: [
      { text: 'Tình hình giao dịch tuần này của tôi?', icon: TrendingUp },
      { text: 'Nên mua hay bán ở thời điểm này?', icon: Zap },
      { text: 'Quyết định quan trọng tôi cần đưa ra?', icon: Star },
      { text: 'Vận mệnh tài chính tháng này?', icon: Gem },
    ]
  },
  tarot: {
    icon: Sparkles,
    title: 'Câu hỏi Tarot',
    prompts: [
      { text: 'Đọc bài về sự nghiệp trading của tôi', icon: TrendingUp },
      { text: 'Lời khuyên cho quyết định đầu tư', icon: Zap },
      { text: 'Năng lượng tài chính hiện tại', icon: Gem },
      { text: 'Thông điệp từ vũ trụ cho tôi', icon: Star },
    ]
  }
};

export function SuggestedPrompts({ activeMode = 'chat', onSelectPrompt, disabled = false }) {
  const modeConfig = PROMPTS_BY_MODE[activeMode] || PROMPTS_BY_MODE.chat;
  const ModeIcon = modeConfig.icon;

  return (
    <div className="suggested-prompts-container">
      <div className="suggested-prompts-header">
        <ModeIcon size={16} />
        <span>{modeConfig.title}</span>
      </div>
      <div className="suggested-prompts-grid">
        {modeConfig.prompts.map((prompt, index) => {
          const PromptIcon = prompt.icon;
          return (
            <button
              key={index}
              className="suggested-prompt-button"
              onClick={() => onSelectPrompt(prompt.text)}
              disabled={disabled}
            >
              <PromptIcon size={14} className="prompt-icon" />
              <span>{prompt.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SuggestedPrompts;
