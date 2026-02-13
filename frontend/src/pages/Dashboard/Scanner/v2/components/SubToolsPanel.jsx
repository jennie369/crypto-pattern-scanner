import React, { useState, useEffect } from 'react';
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
  Fish,
  Layers
} from 'lucide-react';
import SubToolButton from './SubToolButton';
import SidePeekPanel from '../../../../../components/SidePeekPanel';
import RiskCalculatorContent from './tools/RiskCalculatorContent';
import AnalyticsContent from './tools/AnalyticsContent';
import MultiTFPatternCard from './MultiTFPatternCard';
import { scanMultipleTimeframes, MULTI_TF_TIMEFRAMES } from '../../../../../services/multiTimeframeScanner';
import { useAuth } from '../../../../../contexts/AuthContext';
import './SubToolsPanel.css';

export const SubToolsPanel = ({ pattern, onSelectTimeframe }) => {
  const { user, getScannerTier, isAdmin } = useAuth();
  const [activePanel, setActivePanel] = useState(null);
  const [multiTFPatterns, setMultiTFPatterns] = useState([]);
  const [isLoadingMultiTF, setIsLoadingMultiTF] = useState(false);
  const [multiTFMessage, setMultiTFMessage] = useState(null); // For upgrade/error messages

  // Normalize tier format (handle both 'free'/'tier3'/'TIER3'/'vip' formats)
  const normalizeTier = (tier) => {
    const tierLower = (tier || 'free').toLowerCase();
    if (tierLower === 'free') return 'FREE';
    if (tierLower === 'tier1' || tierLower === 'pro') return 'TIER1';
    if (tierLower === 'tier2' || tierLower === 'premium') return 'TIER2';
    if (tierLower === 'tier3' || tierLower === 'vip') return 'TIER3';
    return 'FREE';
  };

  // Get normalized user tier
  const getUserTier = () => {
    // Admin bypass - always TIER3
    if (isAdmin && isAdmin()) {
      return 'TIER3';
    }
    // Use getScannerTier if available
    if (getScannerTier) {
      return normalizeTier(getScannerTier());
    }
    // Fallback to user object
    return normalizeTier(user?.scanner_tier);
  };

  // Load multi-timeframe patterns when a pattern is selected
  useEffect(() => {
    if (pattern?.coin) {
      loadMultiTFPatterns(pattern.coin);
    }
  }, [pattern?.coin]);

  const loadMultiTFPatterns = async (symbol) => {
    setIsLoadingMultiTF(true);
    setMultiTFMessage(null);
    try {
      const userTier = getUserTier(); // Use normalized tier
      // Extract timeframe values from MULTI_TF_TIMEFRAMES array
      const timeframes = MULTI_TF_TIMEFRAMES.slice(0, 5).map(tf => tf.value || tf);
      console.log('[SubToolsPanel] Loading multi-TF patterns for:', symbol, 'tier:', userTier, 'timeframes:', timeframes);

      const result = await scanMultipleTimeframes(symbol, timeframes, userTier);
      console.log('[SubToolsPanel] Multi-TF scan result:', result);

      // Check if scan was successful and has confluence data
      if (result.success && result.confluence && result.confluence.length > 0) {
        console.log('[SubToolsPanel] Using confluence data:', result.confluence);
        setMultiTFPatterns(result.confluence);
        setMultiTFMessage(null);
      } else if (result.error === 'UPGRADE_REQUIRED') {
        console.log('[SubToolsPanel] Multi-TF requires upgrade:', result.message);
        setMultiTFPatterns([]);
        setMultiTFMessage({ type: 'upgrade', text: 'Multi-TF scanning requires TIER2 or higher' });
      } else if (result.success && result.totalPatterns === 0) {
        console.log('[SubToolsPanel] No patterns found on any timeframe');
        setMultiTFPatterns([]);
        setMultiTFMessage({ type: 'info', text: 'No patterns detected across timeframes' });
      } else {
        console.log('[SubToolsPanel] Scan completed but no data');
        setMultiTFPatterns([]);
        setMultiTFMessage(null);
      }
    } catch (error) {
      console.error('[SubToolsPanel] Error loading multi-TF patterns:', error);
      setMultiTFPatterns([]);
      setMultiTFMessage({ type: 'error', text: 'Failed to scan timeframes' });
    } finally {
      setIsLoadingMultiTF(false);
    }
  };

  // Group patterns by type for Multi-TF view
  const groupPatternsByType = (patterns) => {
    if (!patterns || patterns.length === 0) return [];

    const grouped = {};
    patterns.forEach(p => {
      const key = `${p.patternName}_${p.direction || 'NEUTRAL'}`;
      if (!grouped[key]) {
        grouped[key] = {
          patternName: p.patternName,
          direction: p.direction || 'LONG',
          timeframes: [],
          confluence: {
            totalTimeframes: 0,
            activeTimeframes: 0,
            avgConfidence: 0,
            score: 0,
            level: 'LOW'
          }
        };
      }
      grouped[key].timeframes.push({
        timeframe: p.timeframe,
        confidence: p.confidence,
        entry: p.entry,
        stopLoss: p.stopLoss,
        takeProfit: p.takeProfit,
        state: p.state || 'ACTIVE'
      });
    });

    // Calculate confluence for each group
    return Object.values(grouped).map(group => {
      const tfCount = group.timeframes.length;
      const activeCount = group.timeframes.filter(tf => tf.state === 'ACTIVE').length;
      const avgConf = group.timeframes.reduce((sum, tf) => sum + (tf.confidence || 0), 0) / tfCount;
      const score = Math.round((tfCount / 5) * 50 + (avgConf / 100) * 50);

      group.confluence = {
        totalTimeframes: tfCount,
        activeTimeframes: activeCount,
        avgConfidence: Math.round(avgConf),
        score: score,
        level: score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW'
      };
      return group;
    });
  };

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

      {/* Multi-TF Auto-Scan Section */}
      <div className="multi-tf-section">
        <div className="multi-tf-header">
          <Layers size={18} />
          <h3>Multi-TF Auto-Scan</h3>
        </div>

        <div className="multi-tf-content">
          {isLoadingMultiTF ? (
            <div className="multi-tf-loading">
              <span>Scanning timeframes...</span>
            </div>
          ) : multiTFPatterns.length > 0 ? (
            <div className="multi-tf-patterns-list">
              {multiTFPatterns.map((mtfPattern, idx) => (
                <MultiTFPatternCard
                  key={idx}
                  pattern={mtfPattern}
                  onSelectTimeframe={onSelectTimeframe}
                />
              ))}
            </div>
          ) : multiTFMessage ? (
            <div className={`multi-tf-message multi-tf-message-${multiTFMessage.type}`}>
              {multiTFMessage.type === 'upgrade' && <span>🔒 </span>}
              {multiTFMessage.type === 'error' && <span>❌ </span>}
              {multiTFMessage.type === 'info' && <span>ℹ️ </span>}
              <span>{multiTFMessage.text}</span>
            </div>
          ) : !pattern ? (
            <div className="multi-tf-empty">
              <span>Select a coin to scan multiple timeframes</span>
            </div>
          ) : (
            <div className="multi-tf-empty">
              <span>No patterns detected</span>
            </div>
          )}
        </div>
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
