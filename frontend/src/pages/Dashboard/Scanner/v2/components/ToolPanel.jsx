import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import './ToolPanel.css';

/**
 * Tool Panel Component
 * Sliding panel that displays sub-tool content
 *
 * @param {Object} tool - Tool data {id, title, component}
 * @param {Function} onClose - Close handler
 */
export const ToolPanel = ({ tool, onClose }) => {
  if (!tool) return null;

  return (
    <>
      {/* Overlay */}
      <motion.div
        className="tool-panel-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        className="tool-panel"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="tool-panel-header">
          <h3>{tool.title}</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="tool-panel-content">
          {tool.component}
        </div>
      </motion.div>
    </>
  );
};

export default ToolPanel;
