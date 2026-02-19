/**
 * SmartSuggestionBanner - Proactive AI suggestions below header
 * Web port matching mobile SmartSuggestionBanner pattern
 */

import React from 'react';
import { X, Sparkles } from 'lucide-react';
import './SmartSuggestionBanner.css';

export default function SmartSuggestionBanner({ suggestions = [], onAction, onDismiss, visible = false }) {
  if (!visible || suggestions.length === 0) return null;

  return (
    <div className="smart-suggestion-banner">
      <div className="smart-suggestion-banner__header">
        <Sparkles size={14} color="#FFBD59" />
        <span className="smart-suggestion-banner__label">Goi y cho ban</span>
        <button className="smart-suggestion-banner__dismiss" onClick={onDismiss}>
          <X size={14} />
        </button>
      </div>
      <div className="smart-suggestion-banner__items">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            className="smart-suggestion-banner__chip"
            onClick={() => onAction?.(item.action)}
          >
            {item.text}
          </button>
        ))}
      </div>
    </div>
  );
}
