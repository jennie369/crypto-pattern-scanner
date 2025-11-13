import React, { useState } from 'react';
import './SubToolsPanel.css';

// Import all modals
import AnalyticsModal from './modals/AnalyticsModal';
import RiskCalculatorModal from './modals/RiskCalculatorModal';
import PositionSizeModal from './modals/PositionSizeModal';
import SentimentModal from './modals/SentimentModal';
import MultiTimeframeModal from './modals/MultiTimeframeModal';
import NewsEventsModal from './modals/NewsEventsModal';
import AIPredictionModal from './modals/AIPredictionModal';
import BacktestingModal from './modals/BacktestingModal';
import WhaleTrackerModal from './modals/WhaleTrackerModal';

export const SubToolsPanel = ({ pattern }) => {
  const [activeModal, setActiveModal] = useState(null);

  const subTools = [
    { id: 1, icon: '📊', name: 'Analytics', tier: 'FREE', locked: false, component: AnalyticsModal },
    { id: 2, icon: '🧮', name: 'Risk Calculator', tier: 'TIER 2', locked: false, component: RiskCalculatorModal },
    { id: 3, icon: '📍', name: 'Position Size', tier: 'TIER 2', locked: false, component: PositionSizeModal },
    { id: 4, icon: '😊', name: 'Sentiment', tier: 'TIER 2', locked: false, component: SentimentModal },
    { id: 5, icon: '⏱️', name: 'Multi-Timeframe', tier: 'TIER 2', locked: false, component: MultiTimeframeModal },
    { id: 6, icon: '📰', name: 'News & Events', tier: 'TIER 2', locked: false, component: NewsEventsModal },
    { id: 7, icon: '🤖', name: 'AI Prediction', tier: 'TIER 3', locked: false, component: AIPredictionModal },
    { id: 8, icon: '🧪', name: 'Backtesting', tier: 'TIER 3', locked: false, component: BacktestingModal },
    { id: 9, icon: '🐋', name: 'Whale Tracker', tier: 'TIER 3', locked: false, component: WhaleTrackerModal },
  ];

  const handleToolClick = (tool) => {
    if (tool.locked) {
      alert(`🔒 ${tool.name} requires ${tool.tier}\n\nUpgrade to unlock this feature!`);
      return;
    }
    setActiveModal(tool.id);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const getTierColor = (tier) => {
    if (tier === 'FREE') return 'tier-free';
    if (tier === 'TIER 2') return 'tier-2';
    if (tier === 'TIER 3') return 'tier-3';
    return '';
  };

  // Get active modal component
  const activeToolData = subTools.find(tool => tool.id === activeModal);
  const ActiveModalComponent = activeToolData?.component;

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

      {/* Render active modal */}
      {ActiveModalComponent && pattern && (
        <ActiveModalComponent
          pattern={pattern}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default SubToolsPanel;
