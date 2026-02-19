/**
 * QuickActionBar - Web port of mobile QuickActionBar
 * Horizontal bar with quick action buttons above chat input
 * Actions: Tarot, I-Ching, FAQ, History
 */

import React from 'react';
import { Sparkles, ScrollText, HelpCircle, Clock } from 'lucide-react';
import './QuickActionBar.css';

const ACTIONS = [
  { id: 'tarot', label: 'Tarot', icon: Sparkles, color: '#C084FC' },
  { id: 'iching', label: 'Kinh Dich', icon: Sparkles, color: '#FFBD59' },
  { id: 'faq', label: 'FAQ', icon: HelpCircle, color: '#00D9FF' },
  { id: 'history', label: 'Lich Su', icon: Clock, color: '#FFBD59' },
];

export default function QuickActionBar({ onTarot, onIChing, onFAQ, onHistory, disabled = false }) {
  const handlers = {
    tarot: onTarot,
    iching: onIChing,
    faq: onFAQ,
    history: onHistory,
  };

  return (
    <div className="quick-action-bar">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        const handler = handlers[action.id];
        return (
          <button
            key={action.id}
            className="quick-action-bar__btn"
            onClick={handler}
            disabled={disabled}
            title={action.label}
            style={{ '--action-color': action.color }}
          >
            <Icon size={14} />
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
