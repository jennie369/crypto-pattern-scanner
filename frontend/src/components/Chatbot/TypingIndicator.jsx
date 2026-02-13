/**
 * TypingIndicator Component
 * Shows animated dots when bot is typing/thinking
 * Uses design tokens for consistent styling
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import './TypingIndicator.css';

export function TypingIndicator({ show = true }) {
  if (!show) return null;

  return (
    <div className="typing-indicator-wrapper">
      <div className="typing-indicator-avatar">
        <Sparkles size={16} />
      </div>
      <div className="typing-indicator">
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
      </div>
      <span className="typing-text">Gemral đang suy nghĩ...</span>
    </div>
  );
}

export default TypingIndicator;
