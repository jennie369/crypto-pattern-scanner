/**
 * ExportButton - Trigger button for export template selector
 * Part of GemMaster web port Stream E
 */

import React from 'react';
import { Download } from 'lucide-react';
import './ExportButton.css';

const ExportButton = ({ onExport, disabled = false, messageCount = 0 }) => {
  if (messageCount <= 1) return null;

  return (
    <button
      className="export-btn"
      onClick={onExport}
      disabled={disabled || messageCount === 0}
      title="Xuat cuoc tro chuyen"
    >
      <Download size={16} />
      <span className="export-btn__label">Xuat</span>
      {messageCount > 0 && (
        <span className="export-btn__count">{messageCount}</span>
      )}
    </button>
  );
};

export default ExportButton;
