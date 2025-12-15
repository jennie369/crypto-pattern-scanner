import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripHorizontal, TrendingUp, MessageCircle } from 'lucide-react';
import MarketsListExpanded from './MarketsListExpanded';
import ChatbotQuickAccess from './ChatbotQuickAccess';
import './MarketChatbotSection.css';

/**
 * Market & Chatbot Section Component
 * Tabbed interface for Markets and Chatbot quick access
 */
export const MarketChatbotSection = ({ onSelectCoin, selectedCoin }) => {
  const [activeTab, setActiveTab] = useState('markets');
  const [height, setHeight] = useState(350); // Default height
  const [isResizing, setIsResizing] = useState(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  const minHeight = 250;
  const maxHeight = 600;

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  // Load saved height on mount
  useEffect(() => {
    const saved = localStorage.getItem('market_section_height');
    if (saved) {
      setHeight(parseInt(saved));
    }
  }, []);

  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[Market Resize] Start dragging, current height:', height);
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = height;

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  const handleResizeMove = (e) => {
    if (!startYRef.current) return;

    const deltaY = e.clientY - startYRef.current;
    const newHeight = Math.min(
      Math.max(startHeightRef.current + deltaY, minHeight),
      maxHeight
    );

    console.log('[Market Resize] Moving, deltaY:', deltaY, 'newHeight:', newHeight);
    setHeight(newHeight);
  };

  const handleResizeEnd = () => {
    console.log('[Market Resize] End dragging, final height:', height);
    setIsResizing(false);
    startYRef.current = 0;
    startHeightRef.current = 0;

    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';

    // Save to localStorage
    localStorage.setItem('market_section_height', height.toString());
  };

  return (
    <div className={`market-chatbot-section-resizable ${isResizing ? 'resizing' : ''}`}>
      {/* Resize Handle */}
      <div
        className={`resize-handle-horizontal ${isResizing ? 'active' : ''}`}
        onMouseDown={handleResizeStart}
      >
        <div className="resize-grip">
          <GripHorizontal size={20} />
          <span className="resize-hint">Drag to resize</span>
        </div>
      </div>

      {/* Content */}
      <div
        className="market-section-content"
        style={{ height: `${height}px` }}
      >
        {/* Tab Switcher */}
        <div className="section-tabs">
        <button
          className={activeTab === 'markets' ? 'active' : ''}
          onClick={() => setActiveTab('markets')}
        >
          <TrendingUp size={16} /> Markets
        </button>
        <button
          className={activeTab === 'chatbot' ? 'active' : ''}
          onClick={() => setActiveTab('chatbot')}
        >
          <MessageCircle size={16} /> Gemral
        </button>
      </div>

      {/* Content with Animation */}
      <div className="section-content">
        <AnimatePresence mode="wait">
          {activeTab === 'markets' ? (
            <motion.div
              key="markets"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <MarketsListExpanded onSelectCoin={onSelectCoin} selectedCoin={selectedCoin} />
            </motion.div>
          ) : (
            <motion.div
              key="chatbot"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <ChatbotQuickAccess />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
};

export default MarketChatbotSection;
