import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Calculator,
  Target,
  TrendingUp,
  Clock,
  Newspaper,
  Brain,
  FlaskConical,
  Fish
} from 'lucide-react';
import SubToolButton from './SubToolButton';
import SidePeekPanel from '../../../../../components/SidePeekPanel';
import RiskCalculatorContent from './tools/RiskCalculatorContent';
import AnalyticsContent from './tools/AnalyticsContent';
import './SubToolsPanel.css';

export const SubToolsPanel = ({ pattern }) => {
  const [activePanel, setActivePanel] = useState(null);

  const subTools = [
    { id: 1, icon: BarChart3, name: 'Analytics', tier: 'FREE', locked: false, width: '800px' },
    { id: 2, icon: Calculator, name: 'Risk Calculator', tier: 'TIER2', locked: false, width: '700px' },
    { id: 3, icon: Target, name: 'Position Size', tier: 'TIER2', locked: false, width: '600px' },
    { id: 4, icon: TrendingUp, name: 'Sentiment', tier: 'TIER2', locked: false, width: '700px' },
    { id: 5, icon: Clock, name: 'Multi-Timeframe', tier: 'TIER2', locked: false, width: '800px' },
    { id: 6, icon: Newspaper, name: 'News & Events', tier: 'TIER2', locked: false, width: '700px' },
    { id: 7, icon: Brain, name: 'AI Prediction', tier: 'TIER3', locked: false, width: '700px' },
    { id: 8, icon: FlaskConical, name: 'Backtesting', tier: 'TIER3', locked: false, width: '900px' },
    { id: 9, icon: Fish, name: 'Whale Tracker', tier: 'TIER3', locked: false, width: '700px' },
  ];

  const handleToolClick = (tool) => {
    if (tool.locked) {
      alert(`${tool.name} requires ${tool.tier}\n\nUpgrade to unlock this feature!`);
      return;
    }
    setActivePanel(tool.id);
  };

  const handleClosePanel = () => {
    setActivePanel(null);
  };

  // Get active tool data
  const activeTool = subTools.find(tool => tool.id === activePanel);

  // Get tool content
  const getToolContent = (toolId) => {
    switch (toolId) {
      case 1:
        return <AnalyticsContent pattern={pattern} />;
      case 2:
        return <RiskCalculatorContent pattern={pattern} />;
      case 3:
        return <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Position Size Calculator coming soon...</div>;
      case 4:
        return <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Sentiment Analysis coming soon...</div>;
      case 5:
        return <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Multi-Timeframe Analysis coming soon...</div>;
      case 6:
        return <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>News & Events coming soon...</div>;
      case 7:
        return <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>AI Prediction coming soon...</div>;
      case 8:
        return <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Backtesting coming soon...</div>;
      case 9:
        return <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Whale Tracker coming soon...</div>;
      default:
        return null;
    }
  };

  return (
    <div className="sub-tools-panel">
      {/* Compact Header */}
      <div className="sub-tools-header-compact">
        <h3>Quick Tools</h3>
      </div>

      {/* 3x3 Grid */}
      <div className="sub-tools-grid-compact">
        {subTools.map(tool => (
          <SubToolButton
            key={tool.id}
            icon={tool.icon}
            title={tool.name}
            tier={tool.tier}
            onClick={() => handleToolClick(tool)}
            isActive={activePanel === tool.id}
            isLocked={tool.locked || !pattern}
          />
        ))}
      </div>

      {/* Side Peek Panel (Notion-style) */}
      {activeTool && pattern && (
        <SidePeekPanel
          isOpen={!!activePanel}
          onClose={handleClosePanel}
          title={activeTool.name}
          tier={activeTool.tier}
          width={activeTool.width}
        >
          {getToolContent(activeTool.id)}
        </SidePeekPanel>
      )}
    </div>
  );
};

export default SubToolsPanel;
