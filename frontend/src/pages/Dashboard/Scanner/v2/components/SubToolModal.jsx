import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './SubToolModal.css';

// Import tool contents
import RiskCalculatorContent from './tools/RiskCalculatorContent';
import AnalyticsContent from './tools/AnalyticsContent';

/**
 * Sub-Tool Modal - Large centered modal for sub-tools
 * Replaces the sliding panel with a better UX
 */
const SubToolModal = ({ tool, onClose, pattern }) => {
  if (!tool) return null;

  const getToolContent = () => {
    switch(tool.id) {
      case 2:
        return <RiskCalculatorContent pattern={pattern} />;
      case 1:
        return <AnalyticsContent pattern={pattern} />;
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
        return (
          <div className="tool-placeholder">
            <h3>{tool.name}</h3>
            <p>This tool is coming soon in the next phase!</p>
            <p>Selected pattern: {pattern?.coin} - {pattern?.pattern}</p>
          </div>
        );
      default:
        return <div>Tool content not found</div>;
    }
  };

  const getModalSize = () => {
    // Different sizes for different tools
    switch(tool.id) {
      case 2: // Risk Calculator
      case 3: // Position Size
        return { width: '900px', height: '700px' };
      case 1: // Analytics
      case 8: // Backtesting
        return { width: '1100px', height: '800px' };
      case 7: // AI Prediction
      case 9: // Whale Tracker
        return { width: '1000px', height: '750px' };
      default:
        return { width: '900px', height: '700px' };
    }
  };

  const size = getModalSize();

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          className="sub-tool-modal"
          style={{
            width: size.width,
            height: size.height,
            maxWidth: '95vw',
            maxHeight: '90vh'
          }}
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="modal-header">
            <div className="modal-title">
              <span className="modal-icon">
                {tool.icon && <tool.icon size={28} />}
              </span>
              <span className="modal-name">{tool.name}</span>
            </div>

            {tool.tier !== 'FREE' && (
              <div className={`modal-tier tier-${tool.tier.toLowerCase()}`}>
                {tool.tier}
              </div>
            )}

            <button className="modal-close" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="modal-body">
            {getToolContent()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubToolModal;
