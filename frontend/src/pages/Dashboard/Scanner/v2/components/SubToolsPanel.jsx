import React, { useState } from 'react';
import './SubToolsPanel.css';

export const SubToolsPanel = ({ pattern }) => {
  const [activeModal, setActiveModal] = useState(null);

  const subTools = [
    { id: 1, icon: '📊', name: 'Analytics', tier: 'FREE', locked: false },
    { id: 2, icon: '🧮', name: 'Risk Calculator', tier: 'TIER 2', locked: true },
    { id: 3, icon: '📍', name: 'Position Size', tier: 'TIER 2', locked: true },
    { id: 4, icon: '😊', name: 'Sentiment', tier: 'TIER 2', locked: true },
    { id: 5, icon: '⏱️', name: 'Multi-Timeframe', tier: 'TIER 2', locked: true },
    { id: 6, icon: '📰', name: 'News & Events', tier: 'TIER 2', locked: true },
    { id: 7, icon: '🤖', name: 'AI Prediction', tier: 'TIER 3', locked: true },
    { id: 8, icon: '🧪', name: 'Backtesting', tier: 'TIER 3', locked: true },
    { id: 9, icon: '🐋', name: 'Whale Tracker', tier: 'TIER 3', locked: true },
  ];

  const handleToolClick = (tool) => {
    if (tool.locked) {
      alert(`🔒 ${tool.name} requires ${tool.tier}\n\nUpgrade to unlock this feature!`);
      return;
    }
    setActiveModal(tool.id);
  };

  const getTierColor = (tier) => {
    if (tier === 'FREE') return 'tier-free';
    if (tier === 'TIER 2') return 'tier-2';
    if (tier === 'TIER 3') return 'tier-3';
    return '';
  };

  return (
    <div className="sub-tools-panel">
      <div className="sub-tools-header">
        <h3 className="heading-sm">Sub-Tools</h3>
        <p className="text-xs text-secondary">Quick access to analysis tools</p>
      </div>

      <div className="sub-tools-grid">
        {subTools.map(tool => (
          <button
            key={tool.id}
            className={`sub-tool-btn ${tool.locked ? 'locked' : ''}`}
            onClick={() => handleToolClick(tool)}
            disabled={!pattern}
          >
            <div className="tool-icon">{tool.icon}</div>
            <div className="tool-info">
              <div className="tool-name">{tool.name}</div>
              <div className={`tool-tier ${getTierColor(tool.tier)}`}>
                {tool.locked && '🔒 '}
                {tool.tier}
              </div>
            </div>
          </button>
        ))}
      </div>

      {!pattern && (
        <div className="sub-tools-notice">
          <p className="text-xs text-secondary">
            Select a pattern to enable sub-tools
          </p>
        </div>
      )}
    </div>
  );
};

export default SubToolsPanel;
